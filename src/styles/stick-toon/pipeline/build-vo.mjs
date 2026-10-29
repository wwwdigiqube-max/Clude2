// Stick Toon · dialogue builder (the reference film's real file): picks the chosen take of every line, trims the
// breaths, gives ONE fixed gain per line (no stretching, no compressor, no limiter — voice quality first), lays the
// lines out with the acting pauses (PRE), and writes the per-line wavs + vo.json (start time, words, a 24 fps loudness
// envelope for lip-sync).
// Takes: <dir>/tts/NN-k.mp3 (TTS takes) and <dir>/tts/words/NN-k.json (Scribe words of each take, for the timing).
// Usage (from the project root): node src/styles/stick-toon/pipeline/build-vo.mjs <dir> <public out dir> <vo.json>
//   e.g. node src/styles/stick-toon/pipeline/build-vo.mjs videos/01 public/v01/vo src/v01/vo.json
// Edit PICK (take + trim in/out seconds after listening) and PRE (pause before each line) for your dialogue.
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [DIR_ARG = "videos/01", OUT_ARG = "public/v01/vo", JSON_ARG = "src/v01/vo.json"] = process.argv.slice(2);
const DIR = path.resolve(DIR_ARG);
const OUT = path.resolve(OUT_ARG);
const FPS = 24;
const TEMPO = 1; // no time-stretch: voice quality first (the creator's rule)
const FIRST = 2.6; // first line starts here (s)
// pause before each line (s) = time the guy needs to react AFTER the previous line ends
// (rule: the listener reacts after the line ends, never mid-sentence)
const PRE = { 2: 0.35, 3: 1.75, 4: 1.45, 5: 1.75, 6: 1.45, 7: 1.5 };

// take, trim in/out (s, in the original file)
const PICK = [
  { n: 1, who: "G", take: "01-1", a: 0.05, b: 1.4 },
  { n: 2, who: "D", take: "02-2", a: 0.7, b: 2.4 },
  { n: 3, who: "D", take: "03-2", a: 0.22, b: 1.92 },
  { n: 4, who: "D", take: "04-1", a: 0.26, b: 2.06 },
  { n: 5, who: "D", take: "05-1", a: 0.08, b: 2.86 }, // keeps the whole sigh (acting)
  { n: 6, who: "D", take: "06-1", a: 0.15, b: 2.66 },
  { n: 7, who: "D", take: "07-3", a: 0.05, b: 2.7 },
];

fs.mkdirSync(OUT, { recursive: true });

/** Static gain so every line sits at the same mean level (no compressor, no limiter). */
function gainFor(src, p) {
  const log = spawnSync("ffmpeg", ["-hide_banner", "-i", src, "-af", `atrim=${p.a}:${p.b},volumedetect`, "-f", "null", "-"], { encoding: "utf8" }).stderr;
  const mean = +/mean_volume: ([-\d.]+)/.exec(log)[1];
  const max = +/max_volume: ([-\d.]+)/.exec(log)[1];
  return Math.min(-19 - mean, -1.5 - max).toFixed(2); // target mean −19 dB, never above −1.5 dB peak
}
let t = FIRST;
const lines = [];
for (const p of PICK) {
  const src = `${DIR}/tts/${p.take}.mp3`;
  const wav = `${OUT}/${String(p.n).padStart(2, "0")}.wav`;
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-i", src,
    "-af", `atrim=${p.a}:${p.b},asetpts=N/SR/TB,highpass=f=70,afade=t=in:d=0.02,areverse,afade=t=in:d=0.06,areverse,volume=${gainFor(src, p)}dB`,
    "-ar", "44100", "-ac", "1", wav,
  ]);
  const pcm = execFileSync("ffmpeg", ["-v", "error", "-i", wav, "-ac", "1", "-ar", "24000", "-f", "s16le", "-"], { maxBuffer: 1 << 28 });
  const s = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.length >> 1);
  const per = 24000 / FPS;
  const env = [];
  for (let i = 0; i * per < s.length; i++) {
    let e = 0;
    const a = Math.floor(i * per), b = Math.min(s.length, Math.floor((i + 1) * per));
    for (let j = a; j < b; j++) e += (s[j] / 32768) ** 2;
    env.push(Math.sqrt(e / Math.max(1, b - a)));
  }
  const pk = Math.max(...env) || 1;
  const words = JSON.parse(fs.readFileSync(`${DIR}/tts/words/${p.take}.json`, "utf8"))
    .words.filter((w) => w.type === "word")
    .map((w) => ({ text: w.text, t0: +((w.start - p.a) / TEMPO).toFixed(3), t1: +((w.end - p.a) / TEMPO).toFixed(3) }))
    .filter((w) => w.t1 > 0);
  const dur = s.length / 24000;
  if (p.n > 1) t += PRE[p.n];
  lines.push({ n: p.n, who: p.who, at: +t.toFixed(3), dur: +dur.toFixed(3), words, env: env.map((v) => +(Math.min(1, v / pk)).toFixed(3)) });
  console.log(`${p.n} ${p.who} at ${t.toFixed(2)}s  dur ${dur.toFixed(2)}s  words ${words.map((w) => w.text).join(" ")}`);
  t += dur;
}
fs.mkdirSync(path.dirname(path.resolve(JSON_ARG)), { recursive: true });
fs.writeFileSync(path.resolve(JSON_ARG), JSON.stringify({ fps: FPS, lines }));
console.log("dialogue ends at", t.toFixed(2), "s");
