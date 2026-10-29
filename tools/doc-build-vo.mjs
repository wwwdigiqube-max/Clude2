// Documentary style · step 2 of the voices: picks the best take of every line (STT score, then the tighter take;
// `take` in lines.json overrides), trims it, gives each speaker ONE fixed gain so both voices sit at the same level
// (no stretching, no dynamic loudnorm — they sound natural), lays the lines out with short pauses (a real
// conversation: speaker change ≈ 0.45 s; a longer `gap` where the picture needs room), and writes:
//   <out.wav>   the dialogue track          <vo.json>  { total, segs: [{ n, sp, start, end }], words: [{ w, s, e, line }] }
// vo.json drives every cue of the film (src/styles/documentary/cues.ts → makeCues).
// Usage: node tools/doc-build-vo.mjs <dir> <public/…/vo.wav> <src/…/vo.json> [--lead 1.5] [--tail 4] [--target -22] [--tempo 1.12]
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const a = process.argv.slice(2);
const opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? +a[i + 1] : d; };
const [dir, outWav, outJson] = a.filter((x, i) => !x.startsWith("--") && !a[i - 1]?.startsWith("--"));
if (!outJson) throw new Error("usage: node tools/doc-build-vo.mjs <dir> <out.wav> <vo.json> [--lead 1.5] [--tail 4] [--target -22]");
const LEAD = opt("--lead", 1.5), TAIL = opt("--tail", 4), TARGET = opt("--target", -22), SR = 48000;
// --tempo 1.12 = speak 12% faster (atempo keeps the pitch; above ~1.15 voices start to sound processed)
const TEMPO = opt("--tempo", 1);
const L = JSON.parse(fs.readFileSync(path.join(dir, "lines.json"), "utf8"));
const vf = path.join(dir, "vo/verify.json");
const VER = fs.existsSync(vf) ? JSON.parse(fs.readFileSync(vf, "utf8")) : {};
const pad = (n) => String(n).padStart(2, "0");
const takeFile = (n, k) => path.join(dir, "vo", `${pad(n)}-${k}`);

// ---- pick ----
const PICK = {};
for (const l of L) {
  if (l.take) { PICK[l.n] = l.take; continue; }
  const ks = fs.readdirSync(path.join(dir, "vo")).filter((f) => f.startsWith(pad(l.n) + "-") && f.endsWith(".mp3")).map((f) => +f.slice(3, -4));
  if (!ks.length) throw new Error(`no takes for line ${l.n}`);
  ks.sort((x, y) => (VER[`${pad(l.n)}-${y}`]?.score ?? 0) - (VER[`${pad(l.n)}-${x}`]?.score ?? 0) || (VER[`${pad(l.n)}-${x}`]?.dur ?? 0) - (VER[`${pad(l.n)}-${y}`]?.dur ?? 0));
  PICK[l.n] = ks[0];
}
// ---- one gain per speaker ----
const meanDb = (f) => +/mean_volume: (-?[\d.]+)/.exec(spawnSync("ffmpeg", ["-v", "info", "-i", f, "-af", "volumedetect", "-f", "null", "-"]).stderr.toString())[1];
const per = {};
for (const l of L) (per[l.sp] ??= []).push(meanDb(takeFile(l.n, PICK[l.n]) + ".mp3"));
const GAIN = {};
for (const s in per) GAIN[s] = +(TARGET - per[s].reduce((x, y) => x + y, 0) / per[s].length).toFixed(2);
console.log("speaker gain dB", GAIN);

// ---- lay out ----
let t = LEAD;
const words = [], segs = [], bufs = [Buffer.alloc(Math.round(LEAD * SR) * 2)];
L.forEach((l, li) => {
  const k = takeFile(l.n, PICK[l.n]);
  const al = JSON.parse(fs.readFileSync(k + ".json", "utf8")).alignment;
  const ch = al.characters, st = al.character_start_times_seconds, en = al.character_end_times_seconds;
  // spoken characters only (skip [tags])
  let inTag = false;
  const spoken = [];
  for (let i = 0; i < ch.length; i++) {
    if (ch[i] === "[") inTag = true;
    if (!inTag && /[^\s«»"]/.test(ch[i])) spoken.push(i);
    if (ch[i] === "]") inTag = false;
  }
  const a0 = Math.max(0, st[spoken[0]] - 0.06), b0 = en[spoken.at(-1)] + 0.22;
  const pcm = execFileSync("ffmpeg", ["-v", "error", "-i", k + ".mp3", "-ss", a0.toFixed(3), "-to", b0.toFixed(3), "-af", `volume=${GAIN[l.sp]}dB,afade=t=in:d=0.02,afade=t=out:st=${(b0 - a0 - 0.08).toFixed(3)}:d=0.08` + (TEMPO !== 1 ? `,atempo=${TEMPO}` : ""), "-ar", String(SR), "-ac", "1", "-f", "s16le", "-"], { maxBuffer: 1 << 28 });
  const dur = pcm.length / 2 / SR;
  let w = "", ws = null, we = 0;
  inTag = false;
  const flush = () => {
    if (w.trim()) words.push({ w: w.trim(), s: +(t + (ws - a0) / TEMPO).toFixed(3), e: +(t + (we - a0) / TEMPO).toFixed(3), line: l.n });
    w = "";
    ws = null;
  };
  for (let i = 0; i < ch.length; i++) {
    const c = ch[i];
    if (c === "[") { inTag = true; flush(); continue; }
    if (inTag) { if (c === "]") inTag = false; continue; }
    if (/\s/.test(c)) { flush(); continue; }
    if (ws === null) ws = st[i];
    we = en[i];
    w += c;
  }
  flush();
  const next = L[li + 1];
  const gap = l.gap ?? (next ? (next.sp !== l.sp ? 0.45 : 0.35) : 0);
  segs.push({ n: l.n, sp: l.sp, start: +t.toFixed(3), end: +(t + dur).toFixed(3) });
  bufs.push(pcm, Buffer.alloc(Math.round(gap * SR) * 2));
  t += dur + gap;
});
bufs.push(Buffer.alloc(Math.round(TAIL * SR) * 2));
t += TAIL;
fs.mkdirSync(path.dirname(outWav), { recursive: true });
fs.mkdirSync(path.dirname(outJson), { recursive: true });
const raw = outWav + ".raw";
fs.writeFileSync(raw, Buffer.concat(bufs));
execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "s16le", "-ar", String(SR), "-ac", "1", "-i", raw, "-af", "highpass=f=60", outWav]);
fs.unlinkSync(raw);
fs.writeFileSync(outJson, JSON.stringify({ total: +t.toFixed(3), segs, words }));
console.log("picks", JSON.stringify(PICK));
console.log(`total ${t.toFixed(2)} s · ${words.length} words · ${segs.map((s) => s.n + s.sp + "@" + s.start.toFixed(1)).join(" ")}`);
