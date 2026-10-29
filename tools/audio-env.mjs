// Per-frame loudness envelope of a music file → JSON (0..1), for music-reactive visuals (glow breathing with the bed).
// Usage: node tools/audio-env.mjs <audio> <out.json> [fps=30] [seconds=60] [release=0.12]
//   release: 0.12 = breathing glow for music · 0.5 = snappy, for lip-sync on a voice
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const [, , input, output, fpsArg = "30", secArg = "60", relArg = "0.12"] = process.argv;
if (!input || !output) {
  console.error("usage: node tools/audio-env.mjs <audio> <out.json> [fps] [seconds]");
  process.exit(1);
}
const fps = +fpsArg, SR = 24000;
const pcm = execFileSync("ffmpeg", ["-v", "error", "-i", input, "-t", secArg, "-ac", "1", "-ar", String(SR), "-f", "s16le", "-"], { maxBuffer: 1 << 30 });
const samples = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.length >> 1);
const per = SR / fps;
const rms = [];
for (let i = 0; i * per < samples.length; i++) {
  let s = 0;
  const a = Math.floor(i * per), b = Math.min(samples.length, Math.floor((i + 1) * per));
  for (let j = a; j < b; j++) s += (samples[j] / 32768) ** 2;
  rms.push(Math.sqrt(s / Math.max(1, b - a)));
}
const sorted = [...rms].sort((x, y) => x - y);
const hi = sorted[Math.floor(sorted.length * 0.97)] || 1, lo = sorted[Math.floor(sorted.length * 0.1)];
// fast attack, slow release → breathing, not strobing
let v = 0;
const env = rms.map((r) => {
  const t = Math.min(1, Math.max(0, (r - lo) / (hi - lo)));
  v = t > v ? v + (t - v) * 0.6 : v + (t - v) * +relArg;
  return +v.toFixed(3);
});
writeFileSync(output, JSON.stringify(env));
console.log(`${env.length} frames → ${output}`);
