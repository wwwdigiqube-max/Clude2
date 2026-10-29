// Logo → vector paths + light points, for the styles that build a logo: split-flap (the wide flap module draws the
// paths) and light-logo (particles sit on the points). Marching squares on the alpha mask (sub-pixel edges), an
// undirected contour walk, Douglas–Peucker 0.2 px → SVG path strings; edge pixels + horizontal scan runs → points.
//
// Usage:  node tools/logo-trace.mjs <logo.png> <out-dir> [--accent=#C2452F] [--sub=x0,y0,x1,y1] [--cut=y] [--only=paths|pts] [--preview]
//   logo.png   a transparent PNG (any colour, ≥ 1000 px wide is best). Every opaque pixel belongs to the logo.
//   --accent   pixels close to this colour become the accent part (a red slash, a dot…): its own path, its own
//              particles, its own colour and moment in the films. Leave it out for a one-colour logo.
//   --sub      a pixel box: the opaque pixels inside it (not the accent) are the small second line (e.g. a tagline
//              «ACADEMY»): one path per letter, left → right, revealed after the main mark.
//   --cut      the y (px) of the horizontal line through the mark that the films split along (default: the middle
//              of the logo's box). The light-logo halves fly apart and slam shut on this line.
//   --only=paths | --only=pts   write just one of the two files (split-flap needs paths, light-logo needs pts)
//   --preview  also write <out-dir>/logo-preview.svg to check the trace.
// Writes <out-dir>/logo-paths.json { w, h, box, cut, main, accent, sub[] } and <out-dir>/logo-pts.json
// { w, h, box, cut, edges, runs, sub, accent, accentEdge }. Needs ffmpeg + ffprobe on PATH.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const pos = args.filter((a) => !a.startsWith("--"));
const opt = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => { const [k, v] = a.slice(2).split("="); return [k, v ?? true]; }));
if (pos.length < 2) {
  console.error("usage: node tools/logo-trace.mjs <logo.png> <out-dir> [--accent=#hex] [--sub=x0,y0,x1,y1] [--cut=y] [--preview]");
  process.exit(1);
}
const [src, outDir] = pos;
const [W, H] = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", src]).toString().trim().split(",").map(Number);
const px = execFileSync("ffmpeg", ["-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgba", "-"], { maxBuffer: 1 << 30 });

// ── the three masks (alpha 0..1): main mark, accent, second line
const hex = (s) => [1, 3, 5].map((i) => parseInt(s.replace("#", "").padEnd(6, "0").slice(i - 1, i + 1), 16) / 255);
const acc = typeof opt.accent === "string" ? hex(opt.accent) : null;
const subBox = typeof opt.sub === "string" ? opt.sub.split(",").map(Number) : null;
const mainA = new Float32Array(W * H), accA = new Float32Array(W * H), subA = new Float32Array(W * H);
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const a = px[i * 4 + 3] / 255;
    if (a <= 0) continue;
    let k = 0; // how much of this pixel is the accent
    if (acc) {
      const d = Math.hypot(px[i * 4] / 255 - acc[0], px[i * 4 + 1] / 255 - acc[1], px[i * 4 + 2] / 255 - acc[2]);
      k = Math.min(1, Math.max(0, 1 - (d - 0.12) / 0.22));
    }
    accA[i] = a * k;
    const inSub = subBox && x >= subBox[0] && x <= subBox[2] && y >= subBox[1] && y <= subBox[3];
    (inSub ? subA : mainA)[i] = a * (1 - k);
  }

// ── contours: marching squares at alpha 0.5, edges oriented so the inside is on the left, walked into loops
function trace(A) {
  const v = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : A[y * W + x]);
  const key = (p) => `${p[0].toFixed(3)},${p[1].toFixed(3)}`;
  const t = (a, b) => (0.5 - a) / (b - a);
  const nb = new Map();
  const P = new Map();
  const link = (p, q) => {
    const kp = key(p), kq = key(q);
    P.set(kp, p);
    P.set(kq, q);
    if (!nb.has(kp)) nb.set(kp, []);
    if (!nb.has(kq)) nb.set(kq, []);
    nb.get(kp).push(kq);
    nb.get(kq).push(kp);
  };
  for (let y = -1; y < H; y++)
    for (let x = -1; x < W; x++) {
      const a = v(x, y), b = v(x + 1, y), c = v(x + 1, y + 1), d = v(x, y + 1);
      const idx = (a > 0.5 ? 8 : 0) | (b > 0.5 ? 4 : 0) | (c > 0.5 ? 2 : 0) | (d > 0.5 ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      const T = [x + t(a, b), y], R = [x + 1, y + t(b, c)], B = [x + t(d, c), y + 1], L = [x, y + t(a, d)];
      const E = { 1: [[L, B]], 2: [[B, R]], 3: [[L, R]], 4: [[R, T]], 5: [[L, T], [R, B]], 6: [[B, T]], 7: [[L, T]], 8: [[T, L]], 9: [[T, B]], 10: [[T, R], [B, L]], 11: [[T, R]], 12: [[R, L]], 13: [[R, B]], 14: [[B, L]] }[idx];
      for (const [p, q] of E) link(p, q);
    }
  const seen = new Set();
  const loops = [];
  for (const k0 of nb.keys()) {
    if (seen.has(k0)) continue;
    const loop = [];
    let prev = null, cur = k0, guard = 0;
    while (guard++ < 4e6) {
      seen.add(cur);
      loop.push(P.get(cur));
      const nx = nb.get(cur).filter((x) => x !== prev).find((x) => !seen.has(x));
      if (!nx) break;
      prev = cur;
      cur = nx;
    }
    if (loop.length > 4) loops.push(loop);
  }
  return loops;
}
function simplify(pts, eps) {
  const out = [pts[0]];
  const rec = (a, b) => {
    let md = 0, mi = -1;
    const [x1, y1] = pts[a], [x2, y2] = pts[b];
    const L = Math.hypot(x2 - x1, y2 - y1) || 1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((x2 - x1) * (y1 - pts[i][1]) - (x1 - pts[i][0]) * (y2 - y1)) / L;
      if (d > md) { md = d; mi = i; }
    }
    if (md > eps) { rec(a, mi); rec(mi, b); } else out.push(pts[b]);
  };
  rec(0, pts.length - 1);
  return out;
}
const toPath = (loops) => loops.map((l) => "M" + simplify(l, 0.2).map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join("L") + "Z").join("");
/** the loops of a line of letters, grouped per letter (loops whose x ranges overlap belong together), left → right */
function letters(loops) {
  const g = loops.map((l) => ({ x0: Math.min(...l.map((p) => p[0])), x1: Math.max(...l.map((p) => p[0])), ls: [l] })).sort((a, b) => a.x0 - b.x0);
  const out = [];
  for (const c of g) {
    const last = out[out.length - 1];
    if (last && c.x0 <= last.x1 + 1) { last.x1 = Math.max(last.x1, c.x1); last.ls.push(...c.ls); }
    else out.push(c);
  }
  return out.map((c) => toPath(c.ls));
}

// ── points: every edge pixel, horizontal scan runs every 5th row (the fill), the accent's edge then its inside
const inside = (A, x, y) => x >= 0 && y >= 0 && x < W && y < H && A[y * W + x] > 0.5;
const edgePts = (A) => {
  const o = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (inside(A, x, y) && (!inside(A, x - 1, y) || !inside(A, x + 1, y) || !inside(A, x, y - 1) || !inside(A, x, y + 1))) o.push(x, y);
  return o;
};
const runs = [];
for (let y = 0; y < H; y += 5) {
  let s = -1;
  for (let x = 0; x <= W; x++) {
    const on = x < W && inside(mainA, x, y);
    if (on && s < 0) s = x;
    if (!on && s >= 0) { if (x - s > 3) runs.push(y, s, x - 1); s = -1; }
  }
}
const edges = edgePts(mainA), subPts = edgePts(subA), accEdge = edgePts(accA);
const accFill = [];
for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (inside(accA, x, y)) accFill.push(x, y);
if (!edges.length) throw new Error("no opaque pixels in the main mark — is the PNG transparent?");

// ── the box of the whole logo and the cut line
let x0 = W, y0 = H, x1 = 0, y1 = 0;
for (const a of [edges, subPts, accEdge]) for (let i = 0; i < a.length; i += 2) { x0 = Math.min(x0, a[i]); x1 = Math.max(x1, a[i]); y0 = Math.min(y0, a[i + 1]); y1 = Math.max(y1, a[i + 1]); }
const box = [x0, y0, x1, y1];
const cut = typeof opt.cut === "string" ? Number(opt.cut) : (y0 + y1) / 2;

const vec = { w: W, h: H, box, cut, main: toPath(trace(mainA)), accent: acc ? toPath(trace(accA)) : "", sub: subBox ? letters(trace(subA)) : [] };
const pts = { w: W, h: H, box, cut, edges, runs, sub: subPts, accent: [...accEdge, ...accFill], accentEdge: accEdge.length / 2 };
fs.mkdirSync(outDir, { recursive: true });
if (opt.only !== "pts") fs.writeFileSync(path.join(outDir, "logo-paths.json"), JSON.stringify(vec));
if (opt.only !== "paths") fs.writeFileSync(path.join(outDir, "logo-pts.json"), JSON.stringify(pts));
if (opt.preview)
  fs.writeFileSync(
    path.join(outDir, "logo-preview.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#151413"/><path d="${vec.main}" fill="#F2E8D5" fill-rule="evenodd"/><path d="${vec.sub.join("")}" fill="#F2E8D5" fill-rule="evenodd"/><path d="${vec.accent}" fill="#C2452F" fill-rule="evenodd"/><line x1="0" x2="${W}" y1="${cut}" y2="${cut}" stroke="#4af" stroke-width="2" stroke-dasharray="12 8"/></svg>`,
  );
console.log(`${W}×${H} · box ${box.join(",")} · cut ${cut} · main ${edges.length / 2} edge pts, ${runs.length / 3} runs · sub ${vec.sub.length} letters · accent ${pts.accentEdge} edge + ${accFill.length / 2} fill pts → ${outDir}`);
