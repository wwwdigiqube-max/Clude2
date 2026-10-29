// Reference study: turns a reference video into numbers the model can follow (cuts, shot lengths, sound hits,
// per-shot stills + a contact sheet) and writes a SPEC.md skeleton to fill in before building.
// Usage: node tools/ref-study.mjs <ref.mp4> <outDir> [sceneThreshold=0.3]
// Needs ffmpeg/ffprobe on PATH. Output: <outDir>/SPEC.md, shots/*.jpg, sheet.jpg, cuts.json
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [ref, outDir, thrArg] = process.argv.slice(2);
if (!ref || !outDir) { console.error("usage: node tools/ref-study.mjs <ref.mp4> <outDir> [sceneThreshold]"); process.exit(1); }
const THR = Number(thrArg ?? 0.3);
fs.mkdirSync(path.join(outDir, "shots"), { recursive: true });
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { maxBuffer: 1 << 30, ...opts });

// ── basic info
const probe = JSON.parse(run("ffprobe", ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", ref]).toString());
const v = probe.streams.find((s) => s.codec_type === "video");
const hasAudio = probe.streams.some((s) => s.codec_type === "audio");
const [fn, fd] = v.r_frame_rate.split("/").map(Number);
const FPS = fn / fd;
const DUR = Number(probe.format.duration);
const F = (t) => Math.round(t * FPS);

// ── cuts: frame-difference spikes (ffmpeg scene score), confirm visually from shots/*.jpg
const log = spawnSync("ffmpeg", ["-hide_banner", "-i", ref, "-vf", `select='gt(scene,${THR})',showinfo`, "-an", "-f", "null", "-"], { maxBuffer: 1 << 30 }).stderr.toString();
const cutTimes = [...log.matchAll(/pts_time:([\d.]+)/g)].map((m) => Number(m[1])).filter((t, i, a) => i === 0 || t - a[i - 1] > 0.15);
const bounds = [0, ...cutTimes, DUR];
const shots = bounds.slice(0, -1).map((s, i) => ({ n: i + 1, start: s, end: bounds[i + 1], dur: bounds[i + 1] - s }));

// ── stills: first / middle / last of every shot (+ one contact sheet)
for (const s of shots) {
  for (const [tag, t] of [["a", s.start + 0.02], ["m", (s.start + s.end) / 2], ["z", Math.max(s.start, s.end - 0.05)]]) {
    run("ffmpeg", ["-v", "error", "-y", "-ss", t.toFixed(3), "-i", ref, "-frames:v", "1", "-vf", "scale=640:-2,format=yuvj420p", path.join(outDir, "shots", `s${String(s.n).padStart(2, "0")}${tag}.jpg`)]);
  }
}
const cols = 6;
run("ffmpeg", ["-v", "error", "-y", "-i", ref, "-vf", `fps=${Math.min(2, 60 / DUR).toFixed(3)},scale=480:-2,tile=${cols}x${Math.ceil(Math.min(2, 60 / DUR) * DUR / cols) || 1},format=yuvj420p`, "-frames:v", "1", path.join(outDir, "sheet.jpg")]);

// ── sound hits: per-frame energy, onset = sharp rise over the recent average
let hits = [];
if (hasAudio) {
  const pcm = run("ffmpeg", ["-v", "error", "-i", ref, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"]);
  const smp = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.length >> 1);
  const hop = Math.round(16000 / FPS);
  const e = [];
  for (let i = 0; i + hop <= smp.length; i += hop) { let a = 0; for (let k = i; k < i + hop; k++) a += smp[k] * smp[k]; e.push(Math.sqrt(a / hop) / 32768); }
  for (let i = 4; i < e.length; i++) {
    const avg = (e[i - 1] + e[i - 2] + e[i - 3] + e[i - 4]) / 4;
    if (e[i] > 0.02 && e[i] > avg * 2.2 && (!hits.length || i - hits[hits.length - 1].f > 4)) hits.push({ f: i, t: i / FPS, level: e[i] });
  }
}

// ── outputs
fs.writeFileSync(path.join(outDir, "cuts.json"), JSON.stringify({ fps: FPS, duration: DUR, width: v.width, height: v.height, shots, hits }, null, 1));
const md = [
  `# SPEC — ${path.basename(ref)}`,
  `${v.width}×${v.height} · ${FPS.toFixed(2)}fps · ${DUR.toFixed(2)}s · ${shots.length} shots · avg shot ${(DUR / shots.length).toFixed(2)}s`,
  "",
  "> Auto part: cuts and sound hits are measured. Confirm every cut on `shots/sNNa.jpg` (a=first, m=middle, z=last frame).",
  "> Manual part: fill the columns for every shot from the frames (measure, don't guess), then split KEEP / CHANGE.",
  "",
  "## Shots",
  "| # | frames | sec | dur | what happens (elements, where they start → land) | move length (frames) / easing | camera (zoom/pan per frame) | blur | text size / colour |",
  "|---|---|---|---|---|---|---|---|---|",
  ...shots.map((s) => `| ${s.n} | ${F(s.start)}–${F(s.end)} | ${s.start.toFixed(2)} | ${s.dur.toFixed(2)} |  |  |  |  |  |`),
  "",
  "## Sound hits (energy onsets)",
  hits.length ? hits.map((h) => `- f${h.f} (${h.t.toFixed(2)}s) · level ${h.level.toFixed(3)} → which visual event?`).join("\n") : "- (no audio / no clear hits)",
  "",
  "## KEEP (identical to the reference)",
  "- timing, cuts, camera, easing, positions, blur, transitions …",
  "",
  "## CHANGE (ours)",
  "- brand, logo, palette, fonts, copy, product screens, faces, platform UI …",
  "",
  "## Visual rules (write once, every shot uses them)",
  "- fonts: … · palette: … (one accent) · spacing grid: … · banned: …",
  "",
].join("\n");
fs.writeFileSync(path.join(outDir, "SPEC.md"), md);
console.log(`${shots.length} shots, ${hits.length} sound hits → ${path.join(outDir, "SPEC.md")}`);
