// Documentary style · the final mix (ffmpeg): the dialogue on top; music cues cross-faded, low under the voices and
// lifted a little in the pauses, gently ducked by the voices; looping ambience beds; effects on the visual events.
// Rule: effects never cover the voices — every effect is scaled by sfxGain and the whole effects bus is
// sidechain-ducked by the dialogue. Then a two-pass loudnorm to -14 LUFS (YouTube).
//
// audio.json:
// { "vo": "public/my-doc/vo.wav", "voJson": "src/my-doc/vo.json",
//   "music": [["public/my-doc/m1.wav", "0", 1.5, "S:14+2.5", 3], …]          file, start, fade-in, end, fade-out
//   "sfx":   [["public/my-doc/sfx/whoosh.wav", "W:16:خیلی+0.5", 0.35, 0.35], …]  file, when the peak lands, volume, peak offset in file
//   "beds":  [["public/my-doc/sfx/wind.wav", "S:9", "E:13", 0.3], …]           file, start, end, volume
//   "musicBase": 0.12, "musicLift": 0.15, "sfxGain": 0.4, "voGain": 1.0,
//   "musicKeys": [[0, 0.3], [0.6, 0.2], ["end-2", 0.2], ["end-1", 0.45]] }   optional: music gain curve (replaces base+lift)
// Times: a number, or a cue string from vo.json: "S:n" line start · "E:n" line end · "W:n:word" word onset
// ("W:n:word:2" = 3rd occurrence) · "end" = total; any of them + / − seconds ("E:13+0.25").
// Usage: node tools/doc-mix.mjs <audio.json> <out.wav> [--stems] [--no-norm]
//   --stems writes out-o1/o2/o3.wav (voice / music / effects) to check the balance; voice ≈ −21, music ≈ −33,
//   effects ≈ −39 LUFS sat well in the reference.
import fs from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";

const [cfgPath, out] = process.argv.slice(2);
if (!out) throw new Error("usage: node tools/doc-mix.mjs <audio.json> <out.wav> [--stems] [--no-norm]");
const A = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
const VO = JSON.parse(fs.readFileSync(A.voJson, "utf8"));
// "length": the video length when it runs past the narration (music outro); default = the narration
const TOTAL = A.length ?? VO.total;
const clean = (w) => w.replace(/[،.؛:«»!؟?…"]/g, "").replace(/[ً-ْ]/g, "");
/** "W:16:خیلی+0.5" → seconds */
function T(v) {
  if (typeof v === "number") return v;
  const m = /^(.*?)([+-]\d*\.?\d+)?$/.exec(String(v).trim());
  const base = m[1], off = m[2] ? +m[2] : 0;
  if (/^-?\d*\.?\d+$/.test(base)) return +base + off;
  if (base === "end") return TOTAL + off;
  const [kind, n, word, occ] = base.split(":");
  const seg = VO.segs.find((s) => s.n === +n);
  if (!seg) throw new Error(`no line ${n} (${v})`);
  if (kind === "S") return seg.start + off;
  if (kind === "E") return seg.end + off;
  if (kind === "W") {
    const ws = VO.words.filter((w) => w.line === +n);
    let hits = ws.filter((w) => clean(w.w) === clean(word));
    if (!hits.length) hits = ws.filter((w) => clean(w.w).startsWith(clean(word)));
    const h = hits[+(occ ?? 0)];
    if (!h) throw new Error(`word "${word}" not in line ${n}`);
    return h.s + off;
  }
  throw new Error("bad time " + v);
}
const MUSIC = (A.music ?? []).map(([f, s, fi, e, fo]) => [f, T(s), fi, T(e), fo]);
const SFX = (A.sfx ?? []).map(([f, at, vol, off]) => [f, T(at), vol, off ?? 0]);
const BEDS = (A.beds ?? []).map(([f, s, e, vol]) => [f, T(s), T(e), vol]);
const BASE = A.musicBase ?? 0.12, LIFT = A.musicLift ?? 0.15, SG = A.sfxGain ?? 0.4, VG = A.voGain ?? 1;
const GAPS = VO.segs.slice(1).map((s, i) => [VO.segs[i].end, s.start]);

// each effect file is read once and split, so hundreds of events stay within the Windows command-line limit
const UFX = [...new Set(SFX.map(([f]) => f))];
const inputs = [A.vo, ...MUSIC.map(([f]) => f), ...UFX, ...BEDS.map(([f]) => f)];
const parts = [`[0:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=${VG},apad=whole_dur=${TOTAL.toFixed(3)},asplit=3[vo][sc][sc2]`];
const R = 0.8;
const lift = GAPS.filter(([a, b]) => b - a > 0.5).map(([a, b]) => `clip((t-${(a + 0.2).toFixed(2)})/${R},0,1)*clip((${(b - 0.15).toFixed(2)}-t)/${R},0,1)`).join("+") || "0";
MUSIC.forEach(([, st, fi, en, fo], i) => {
  const len = en - st;
  parts.push(`[${i + 1}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:${len.toFixed(3)},afade=t=in:d=${fi},afade=t=out:st=${(len - fo).toFixed(3)}:d=${fo},adelay=${Math.round(st * 1000)}|${Math.round(st * 1000)}[m${i}]`);
});
if (MUSIC.length) {
  // gain curve: base + lift in the pauses, or explicit keys (piecewise linear, as a sum of saturating ramps)
  let gain = `${BASE}+${LIFT}*min(1,${lift})`;
  if (A.musicKeys?.length) {
    const K = A.musicKeys.map(([t, g]) => [T(t), g]).sort((a, b) => a[0] - b[0]);
    gain = String(K[0][1]);
    for (let i = 1; i < K.length; i++) gain += `+(${(K[i][1] - K[i - 1][1]).toFixed(4)})*clip((t-${K[i - 1][0].toFixed(3)})/${Math.max(0.01, K[i][0] - K[i - 1][0]).toFixed(3)},0,1)`;
  }
  parts.push(`${MUSIC.map((_, i) => `[m${i}]`).join("")}amix=inputs=${MUSIC.length}:normalize=0:dropout_transition=0,volume='${gain}':eval=frame[mus]`);
  parts.push(`[mus][sc]sidechaincompress=threshold=0.05:ratio=2.5:attack=40:release=500:makeup=1[mud]`);
} else parts.push(`anullsrc=r=48000:cl=stereo,atrim=0:${TOTAL}[mud]`, `[sc]anullsink`);
const b0 = 1 + MUSIC.length;
const uses = UFX.map((f) => SFX.filter(([g]) => g === f).length);
UFX.forEach((_, k) => parts.push(`[${b0 + k}:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=${uses[k]}${Array.from({ length: uses[k] }, (_, j) => `[u${k}_${j}]`).join("")}`));
const taken = UFX.map(() => 0);
SFX.forEach(([f, at, vol, off], i) => {
  const ms = Math.max(0, Math.round((at - off) * 1000));
  const k = UFX.indexOf(f), j = taken[k]++;
  parts.push(`[u${k}_${j}]volume=${(vol * SG).toFixed(3)},adelay=${ms}|${ms}[s${i}]`);
});
const b1 = b0 + UFX.length;
BEDS.forEach(([, st, en, vol], i) => {
  const len = en - st, ms = Math.round(st * 1000);
  parts.push(`[${b1 + i}:a]aformat=sample_rates=48000:channel_layouts=stereo,aloop=loop=-1:size=2147483647,atrim=0:${len.toFixed(3)},afade=t=in:d=2,afade=t=out:st=${(len - 2).toFixed(3)}:d=2,volume=${(vol * SG * 1.6).toFixed(3)},adelay=${ms}|${ms}[b${i}]`);
});
const fx = [...SFX.map((_, i) => `[s${i}]`), ...BEDS.map((_, i) => `[b${i}]`)];
if (fx.length) {
  parts.push(`${fx.join("")}amix=inputs=${fx.length}:normalize=0:dropout_transition=0[fx]`);
  parts.push(`[fx][sc2]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350:makeup=1[fxd]`);
} else parts.push(`anullsrc=r=48000:cl=stereo,atrim=0:${TOTAL}[fxd]`, `[sc2]anullsink`);
const stems = process.argv.includes("--stems");
const end = TOTAL.toFixed(3);
if (stems) parts.push(`[vo]atrim=0:${end}[o1]`, `[mud]atrim=0:${end}[o2]`, `[fxd]atrim=0:${end}[o3]`);
else parts.push(`[vo][mud][fxd]amix=inputs=3:normalize=0:dropout_transition=0,atrim=0:${end},alimiter=limit=0.95[out]`);
const outs = stems ? ["o1", "o2", "o3"].flatMap((o) => ["-map", `[${o}]`, "-ar", "48000", out.replace(/\.wav$/, `-${o}.wav`)]) : ["-map", "[out]", "-ar", "48000", out];
// the graph goes through a file (ffmpeg 7+: -/filter_complex <file>) — long plans overflow the command line otherwise
const graph = out.replace(/\.wav$/, ".graph.txt");
fs.writeFileSync(graph, parts.join(";\n"));
execFileSync("ffmpeg", ["-nostdin", "-v", "error", "-y", ...inputs.flatMap((f) => ["-i", f]), "-/filter_complex", graph, ...outs], { stdio: "inherit" });
fs.rmSync(graph, { force: true });
console.log(`mixed: ${MUSIC.length} music · ${SFX.length} effects · ${BEDS.length} beds → ${out}`);

// two-pass loudnorm to -14 LUFS
if (!stems && !process.argv.includes("--no-norm")) {
  const m = spawnSync("ffmpeg", ["-nostdin", "-i", out, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"]).stderr.toString();
  const j = JSON.parse(m.slice(m.lastIndexOf("{"), m.lastIndexOf("}") + 1));
  const normed = out.replace(/\.wav$/, "-norm.wav");
  execFileSync("ffmpeg", ["-nostdin", "-v", "error", "-y", "-i", out, "-af", `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`, "-ar", "48000", normed]);
  console.log(`loudness ${j.input_i} → -14 LUFS → ${normed}`);
}
