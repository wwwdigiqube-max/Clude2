// Camera motion of a reference video, frame by frame: for every consecutive pair, the (dx, dy, zoom) that best maps
// frame n onto frame n+1 (block search on a small grey image). Cuts (big residual) reset the path.
// Output JSON: [{ f, dx, dy, z, err, cut }] with dx/dy in output pixels (W×H) — accumulate inside a shot to drive
// a still image the same way the reference camera moved.
// Usage: node tools/ref-motion.mjs <ref.mp4> <out.json> [W=1920] [H=1080]
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const [ref, out, OW = 1920, OH = 1080] = process.argv.slice(2);
const w = 128, h = 72;
const raw = execFileSync("ffmpeg", ["-v", "error", "-i", ref, "-vf", `scale=${w}:${h},format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 30 });
const n = raw.length / (w * h);
const frame = (i) => raw.subarray(i * w * h, (i + 1) * w * h);
const sample = (img, x, y) => {
  const x0 = Math.floor(x), y0 = Math.floor(y);
  if (x0 < 0 || y0 < 0 || x0 >= w - 1 || y0 >= h - 1) return -1;
  const fx = x - x0, fy = y - y0, i = y0 * w + x0;
  return (img[i] * (1 - fx) + img[i + 1] * fx) * (1 - fy) + (img[i + w] * (1 - fx) + img[i + w + 1] * fx) * fy;
};
// error of mapping a → b with b(p) = a((p - c) / z + c - d)
const err = (a, b, dx, dy, z) => {
  let s = 0, k = 0;
  for (let y = 10; y < h - 10; y += 1) for (let x = 14; x < w - 14; x += 1) {
    const v = sample(a, (x - w / 2) / z + w / 2 - dx, (y - h / 2) / z + h / 2 - dy);
    if (v < 0) continue;
    s += Math.abs(v - b[y * w + x]); k++;
  }
  return s / Math.max(1, k);
};
const res = [];
for (let i = 0; i < n - 1; i++) {
  const a = frame(i), b = frame(i + 1);
  let best = { dx: 0, dy: 0, z: 1, e: err(a, b, 0, 0, 1) };
  // coarse
  for (const z of [0.9, 0.93, 0.955, 0.975, 0.99, 1, 1.01, 1.025, 1.045, 1.07, 1.1]) for (let dy = -5; dy <= 5; dy++) for (let dx = -6; dx <= 6; dx++) {
    const e = err(a, b, dx, dy, z);
    if (e < best.e) best = { dx, dy, z, e };
  }
  // fine
  const c = { ...best };
  for (const z of [c.z - 0.006, c.z - 0.003, c.z, c.z + 0.003, c.z + 0.006]) for (let dy = c.dy - 0.75; dy <= c.dy + 0.75; dy += 0.25) for (let dx = c.dx - 0.75; dx <= c.dx + 0.75; dx += 0.25) {
    const e = err(a, b, dx, dy, z);
    if (e < best.e) best = { dx, dy, z, e };
  }
  res.push({ f: i + 1, dx: +(best.dx * OW / w).toFixed(2), dy: +(best.dy * OH / h).toFixed(2), z: +best.z.toFixed(4), err: +best.e.toFixed(2), cut: best.e > 18 });
}
fs.writeFileSync(out, JSON.stringify(res));
console.log(`${res.length} pairs → ${out}`);
