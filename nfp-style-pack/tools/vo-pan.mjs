// Gentle stereo placement for a dialogue track: one speaker a little to the left, another a little to the right,
// everyone else in the centre — so a multi-voice scene sounds like people in a room, not one mono line.
// Reads who speaks when from vo.json (doc-build-vo output). Speakers never overlap there, so a gain ramp per channel is enough.
// Usage: node tools/vo-pan.mjs <vo.wav> <vo.json> <out.wav> [--left A] [--right B] [--depth 0.28]
//   depth = how much quieter the far channel gets while that speaker talks (0.28 ≈ -3 dB, subtle; 0.5 = clearly placed)
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const [inp, voJson, out, ...rest] = process.argv.slice(2);
if (!out) throw new Error("usage: node tools/vo-pan.mjs <vo.wav> <vo.json> <out.wav> [--left A] [--right B] [--depth 0.28]");
const opt = (k, d) => (rest.includes(k) ? rest[rest.indexOf(k) + 1] : d);
const L = opt("--left", "A"), R = opt("--right", "B"), depth = +opt("--depth", "0.28");

const segs = JSON.parse(fs.readFileSync(voJson, "utf8")).segs;
const on = (sp) => segs.filter((s) => s.sp === sp).map((s) => `between(t,${(s.start - 0.05).toFixed(2)},${(s.end + 0.3).toFixed(2)})`).join("+") || "0";
// the left speaker is turned down in the right channel, the right speaker in the left one
const graph =
  `[0:a]aformat=channel_layouts=stereo,channelsplit=channel_layout=stereo[l][r];` +
  `[l]volume='1-${depth}*min(1,${on(R)})':eval=frame[l2];` +
  `[r]volume='1-${depth}*min(1,${on(L)})':eval=frame[r2];` +
  `[l2][r2]join=inputs=2:channel_layout=stereo[out]`;
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", inp, "-filter_complex", graph, "-map", "[out]", "-ar", "48000", out], { stdio: "inherit" });
console.log(`${out}: ${L} left, ${R} right, depth ${depth}`);
