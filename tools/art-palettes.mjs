// Art Motion · measure each style's palette from its rendered frames (median cut, 6 colours, by area).
// Usage: node tools/art-palettes.mjs <dir of frames named <sceneOrGrammar>.jpg> <out.json>
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const [dir, out] = process.argv.slice(2);
const res = {};
for (const f of fs.readdirSync(dir).filter((f) => /\.(jpe?g|png)$/i.test(f))) {
  const buf = execFileSync("ffmpeg", ["-v", "error", "-i", path.join(dir, f), "-vf", "scale=160:-1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: 1 << 26 });
  const px = [];
  for (let i = 0; i + 2 < buf.length; i += 3) px.push([buf[i], buf[i + 1], buf[i + 2]]);
  // median cut into 12 boxes, then keep the 6 biggest that are not near-duplicates
  let boxes = [px];
  while (boxes.length < 12) {
    boxes.sort((a, b) => b.length - a.length);
    const b = boxes.shift();
    if (!b || b.length < 2) break;
    const rng = [0, 1, 2].map((k) => Math.max(...b.map((p) => p[k])) - Math.min(...b.map((p) => p[k])));
    const k = rng.indexOf(Math.max(...rng));
    b.sort((x, y) => x[k] - y[k]);
    const m = b.length >> 1;
    boxes.push(b.slice(0, m), b.slice(m));
  }
  const cols = boxes
    .map((b) => ({ n: b.length, c: [0, 1, 2].map((k) => Math.round(b.reduce((a, p) => a + p[k], 0) / b.length)) }))
    .sort((a, b) => b.n - a.n);
  const keep = [];
  for (const x of cols) if (!keep.some((y) => Math.hypot(...x.c.map((v, i) => v - y.c[i])) < 38)) keep.push(x);
  res[path.basename(f).replace(/\.\w+$/, "")] = keep.slice(0, 6).map((x) => "#" + x.c.map((v) => v.toString(16).padStart(2, "0")).join(""));
}
fs.writeFileSync(out, JSON.stringify(res, null, 1));
console.log(Object.keys(res).length, "palettes →", out);
