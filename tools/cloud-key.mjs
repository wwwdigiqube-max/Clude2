// Real cloud photos → grey + alpha sprites for the Documentary style (sky keyed out; the scene grades them).
// A neutral cloud over sky S gives P_b − P_r = (1−α)(S_b − S_r), so α = 1 − (P_b − P_r)/(S_b − S_r); the sky colour S
// is estimated per block from the bluest pixels. Shadowed insides of a cloud (bluish) are filled back in. Top-down
// cloud seas (no sky) get α from brightness. Every sprite fades out toward the photo borders.
// Use public-domain / CC0 photos (e.g. Wikimedia Commons) of clouds on a clear deep-blue sky.
// Usage: node tools/cloud-key.mjs <photo.jpg> <out.png> [--sea] [--fade top,right,bottom,left] [--max 1400]
//    or: node tools/cloud-key.mjs <srcDir> <outDir> [--max 1400]   (keys every <name>.jpg listed in JOBS below)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const MAX = +(opt("--max") ?? 1400);
const preview = args.includes("--preview");
const [srcArg, outArg] = args.filter((a, i) => !a.startsWith("--") && !["--max", "--fade"].includes(args[i - 1]));
const single = /.(jpe?g|png)$/i.test(srcArg);
const srcDir = single ? path.dirname(srcArg) : srcArg, outDir = single ? path.dirname(outArg) : outArg;
fs.mkdirSync(outDir, { recursive: true });
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ss = (a, b, x) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// name → how to key it, and how far in from each border to fade (fractions: top, right, bottom, left)
const JOBS = {
  cu1: { mode: "sky", fade: [0.04, 0.06, 0.12, 0.06] },
  cu2: { mode: "sky", fade: [0.04, 0.06, 0.12, 0.06] },
  cu3: { mode: "sky", fade: [0.04, 0.06, 0.12, 0.06] },
  cu4: { mode: "sky", fade: [0.04, 0.06, 0.12, 0.06] },
  cu5: { mode: "sky", fade: [0.04, 0.06, 0.12, 0.06] },
  tower: { mode: "sky", fade: [0.04, 0.08, 0.1, 0.08] },
  field: { mode: "sky", fade: [0.04, 0.05, 0.3, 0.05] },
  sea1: { mode: "sea", fade: [0.18, 0.06, 0.06, 0.06] },
};

function decode(file) {
  let [w, h] = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height", "-of", "csv=p=0", file]).toString().trim().split(",").map(Number);
  if (w > MAX) { h = Math.round((h * MAX) / w / 2) * 2; w = MAX; }
  const raw = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-vf", `scale=${w}:${h}`, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: w * h * 3 + 1024 });
  return { w, h, d: raw };
}

const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
};
/** PNG with `ch` channels (2 = grey+alpha, 3 = RGB, 4 = RGBA) */
function png(w, h, px, ch) {
  const raw = Buffer.alloc((w * ch + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * ch + 1)] = 0;
    for (let i = 0; i < w * ch; i++) raw[y * (w * ch + 1) + 1 + i] = px[y * w * ch + i];
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = { 2: 4, 3: 2, 4: 6 }[ch];
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

/** sky colour field: per block, mean of the bluest pixels; cloudy blocks filled from neighbours; bilinear */
function skyField(img) {
  const { w, h, d } = img;
  const B = 48, bw = Math.ceil(w / B), bh = Math.ceil(h / B);
  const sk = new Float32Array(bw * bh * 3), ok = new Uint8Array(bw * bh);
  for (let by = 0; by < bh; by++)
    for (let bx = 0; bx < bw; bx++) {
      const list = [];
      for (let y = by * B; y < Math.min(h, by * B + B); y += 2)
        for (let x = bx * B; x < Math.min(w, bx * B + B); x += 2) {
          const o = (y * w + x) * 3;
          list.push([d[o + 2] - d[o], d[o], d[o + 1], d[o + 2]]);
        }
      list.sort((a, b) => b[0] - a[0]);
      const top = list.slice(0, Math.max(1, Math.floor(list.length * 0.15)));
      const sat = top.reduce((s, p) => s + p[0], 0) / top.length;
      if (sat > 45) {
        const i = (by * bw + bx) * 3;
        for (let c = 0; c < 3; c++) sk[i + c] = top.reduce((s, p) => s + p[c + 1], 0) / top.length;
        ok[by * bw + bx] = 1;
      }
    }
  // fill cloudy blocks: repeated neighbour averaging
  for (let it = 0; it < 200; it++) {
    let changed = false;
    const nk = ok.slice();
    for (let by = 0; by < bh; by++)
      for (let bx = 0; bx < bw; bx++) {
        if (ok[by * bw + bx]) continue;
        let n = 0;
        const acc = [0, 0, 0];
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const X = bx + dx, Y = by + dy;
          if (X < 0 || Y < 0 || X >= bw || Y >= bh || !ok[Y * bw + X]) continue;
          for (let c = 0; c < 3; c++) acc[c] += sk[(Y * bw + X) * 3 + c];
          n++;
        }
        if (n) {
          for (let c = 0; c < 3; c++) sk[(by * bw + bx) * 3 + c] = acc[c] / n;
          nk[by * bw + bx] = 1;
          changed = true;
        }
      }
    ok.set(nk);
    if (!changed) break;
  }
  return (x, y, c) => {
    const fx = clamp(x / B - 0.5, 0, bw - 1), fy = clamp(y / B - 0.5, 0, bh - 1);
    const x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = Math.min(bw - 1, x0 + 1), y1 = Math.min(bh - 1, y0 + 1);
    const ax = fx - x0, ay = fy - y0;
    const g = (X, Y) => sk[(Y * bw + X) * 3 + c];
    return (g(x0, y0) * (1 - ax) + g(x1, y0) * ax) * (1 - ay) + (g(x0, y1) * (1 - ax) + g(x1, y1) * ax) * ay;
  };
}

const jobs = single
  ? [[path.basename(outArg, ".png"), { mode: args.includes("--sea") ? "sea" : "sky", fade: (opt("--fade") ?? "0.04,0.06,0.12,0.06").split(",").map(Number), file: srcArg }]]
  : Object.entries(JOBS);
for (const [name, job] of jobs) {
  const file = job.file ?? path.join(srcDir, name + ".jpg");
  if (!fs.existsSync(file)) continue;
  const img = decode(file);
  const { w, h, d } = img;
  const out = new Uint8Array(w * h * 2);
  if (job.mode === "sky") {
    const S = skyField(img);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const o = (y * w + x) * 3;
        const r = d[o], g = d[o + 1], b = d[o + 2];
        const sr = S(x, y, 0), sg = S(x, y, 1), sb = S(x, y, 2);
        const sd = Math.max(20, sb - sr);
        let a = clamp(1 - ((b - r) / sd) * 1.08);
        a = ss(0.02, 0.92, a);
        const L = a > 0.01 ? clamp(((r + g + b) / 3 - (1 - a) * ((sr + sg + sb) / 3)) / a, 0, 255) : 0;
        out[(y * w + x) * 2] = L;
        out[(y * w + x) * 2 + 1] = a * 255;
      }
  } else {
    // cloud sea seen from above: brightness → coverage
    const lum = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) lum[i] = (d[i * 3] + d[i * 3 + 1] + d[i * 3 + 2]) / 3;
    const sorted = Float32Array.from(lum).sort();
    const lo = sorted[Math.floor(sorted.length * 0.12)], hi = sorted[Math.floor(sorted.length * 0.6)];
    for (let i = 0; i < w * h; i++) {
      out[i * 2] = lum[i];
      out[i * 2 + 1] = ss(lo, hi, lum[i]) * 255;
    }
  }
  // fill the shadowed inside of a cloud mass (bluish shadow keys as semi-transparent): where the surrounding
  // area is mostly cloud, raise the opacity; edges keep their soft keyed values
  if (job.mode === "sky") {
    const F = 8, gw = Math.ceil(w / F), gh = Math.ceil(h / F);
    let g = new Float32Array(gw * gh);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) g[Math.floor(y / F) * gw + Math.floor(x / F)] += out[(y * w + x) * 2 + 1] / 255 / (F * F);
    for (let pass = 0; pass < 3; pass++) {
      const n = new Float32Array(gw * gh);
      for (let y = 0; y < gh; y++)
        for (let x = 0; x < gw; x++) {
          let s2 = 0, c = 0;
          for (let dy = -2; dy <= 2; dy++)
            for (let dx = -2; dx <= 2; dx++) {
              const X = x + dx, Y = y + dy;
              if (X < 0 || Y < 0 || X >= gw || Y >= gh) continue;
              s2 += g[Y * gw + X];
              c++;
            }
          n[y * gw + x] = s2 / c;
        }
      g = n;
    }
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const fx = clamp(x / F - 0.5, 0, gw - 1), fy = clamp(y / F - 0.5, 0, gh - 1);
        const x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = Math.min(gw - 1, x0 + 1), y1 = Math.min(gh - 1, y0 + 1);
        const ax = fx - x0, ay = fy - y0;
        const v = (g[y0 * gw + x0] * (1 - ax) + g[y0 * gw + x1] * ax) * (1 - ay) + (g[y1 * gw + x0] * (1 - ax) + g[y1 * gw + x1] * ax) * ay;
        const i = (y * w + x) * 2 + 1;
        const a0 = out[i] / 255, fill = ss(0.45, 0.8, v) * 0.97;
        if (fill > a0) {
          // the un-premultiplied grey was computed for a0; a shadowed interior pixel is about its own value
          out[i] = fill * 255;
        }
      }
  }
  // fade toward the borders
  const [ft, fr, fb, fl] = job.fade;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const e = ss(0, ft, y / h) * ss(0, fb, 1 - y / h) * ss(0, fl, x / w) * ss(0, fr, 1 - x / w);
      out[(y * w + x) * 2 + 1] *= e;
    }
  fs.writeFileSync(path.join(outDir, name + ".png"), png(w, h, out, 2));
  console.log(name, w + "x" + h);
  if (preview) {
    // over a dusk gradient, grey ramp mapped to a warm palette
    const pv = new Uint8Array(w * h * 3);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const v = y / h;
        const bg = [40 + 160 * v, 30 + 80 * v, 70 + 30 * v];
        const L = out[(y * w + x) * 2] / 255, a = out[(y * w + x) * 2 + 1] / 255;
        const col = [lerp3(70, 190, 255, L), lerp3(45, 120, 225, L), lerp3(80, 130, 190, L)];
        for (let c = 0; c < 3; c++) pv[(y * w + x) * 3 + c] = bg[c] + (col[c] - bg[c]) * a;
      }
    fs.writeFileSync(path.join(outDir, "_pv_" + name + ".png"), png(w, h, pv, 3));
  }
}
function lerp3(a, b, c, t) {
  return t < 0.5 ? a + (b - a) * t * 2 : b + (c - b) * (t - 0.5) * 2;
}
