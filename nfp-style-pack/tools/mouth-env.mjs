// Lip-sync data from a dialogue track: RMS envelope per video frame (0..1), so a mask's mouth opens with the voice.
// Speakers never overlap in doc-build-vo output, so vo.json segs tell whose mouth moves.
// Usage: node tools/mouth-env.mjs <vo.wav> <out.json> [fps=24]
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const [inp, out, fpsArg = "24"] = process.argv.slice(2);
const fps = +fpsArg, SR = 16000;
const raw = execFileSync("ffmpeg", ["-v", "error", "-i", inp, "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 28 });
const x = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
const hop = SR / fps, n = Math.floor(x.length / hop);
const env = [];
for (let i = 0; i < n; i++) {
  let s = 0;
  const a = Math.floor(i * hop), b = Math.floor((i + 1) * hop);
  for (let k = a; k < b; k++) s += x[k] * x[k];
  env.push(Math.sqrt(s / (b - a)));
}
const sorted = [...env].sort((p, q) => p - q);
const ref = sorted[Math.floor(sorted.length * 0.97)] || 1;
// dB-ish curve: quiet consonants still move the mouth a little, loud vowels open it fully
const norm = env.map((v) => {
  const d = 20 * Math.log10(v / ref + 1e-9);
  return Math.round(Math.max(0, Math.min(1, (d + 30) / 30)) * 1000) / 1000;
});
fs.writeFileSync(out, JSON.stringify({ fps, env: norm }));
console.log(`${n} frames @${fps}fps → ${out}`);
