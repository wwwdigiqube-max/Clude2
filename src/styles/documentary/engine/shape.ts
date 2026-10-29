// Organic shapes: noise blobs, wobbly portals, metaball (goo) masks, and line-art that draws itself.
import { Ctx, H, layer, scale, W } from "./canvas";
import { clamp, fbm, TAU } from "./math";

export type Blob = { x: number; y: number; r: number; seed?: number; amp?: number; freq?: number; t?: number; sx?: number; sy?: number; rot?: number };
/** closed organic outline (seamless: noise sampled on a circle) */
export function blobPath(b: Blob, n = 120) {
  const { x, y, r, seed = 1, amp = 0.12, freq = 1.3, t = 0, sx = 1, sy = 1, rot = 0 } = b;
  const p = new Path2D();
  const c = Math.cos(rot), s = Math.sin(rot);
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU;
    const rr = r * (1 + amp * fbm(Math.cos(a) * freq + seed * 3.1, Math.sin(a) * freq + t, 3));
    const px = Math.cos(a) * rr * sx, py = Math.sin(a) * rr * sy;
    const X = x + px * c - py * s, Y = y + px * s + py * c;
    i ? p.lineTo(X, Y) : p.moveTo(X, Y);
  }
  p.closePath();
  return p;
}
/** hand-cut portal edge: almost round, gently irregular */
export const portalPath = (x: number, y: number, r: number, seed: number, t: number) => blobPath({ x, y, r, seed, amp: 0.035, freq: 2.2, t: t * 0.15 }, 96);

// ---------- metaballs (compact kernel → crisp, anti-aliased mask) ----------
export type Ball = { x: number; y: number; r: number };
const RES = 0.5;
let field: Float32Array | null = null;
export function gooMask(balls: Ball[], thr = 0.25): Ctx {
  const R = scale();
  const L = layer("goo", RES);
  const w = L.canvas.width, h = L.canvas.height;
  if (!field || field.length !== w * h) field = new Float32Array(w * h);
  field.fill(0);
  const s = R * RES; // design → buffer px
  for (const b of balls) {
    if (b.r <= 0.5) continue;
    const cx = b.x * s, cy = b.y * s, rr = b.r * s, r2 = rr * rr;
    const x0 = Math.max(0, Math.floor(cx - rr)), x1 = Math.min(w - 1, Math.ceil(cx + rr));
    const y0 = Math.max(0, Math.floor(cy - rr)), y1 = Math.min(h - 1, Math.ceil(cy + rr));
    for (let y = y0; y <= y1; y++) {
      const dy = y + 0.5 - cy, o = y * w;
      for (let x = x0; x <= x1; x++) {
        const dx = x + 0.5 - cx, q = 1 - (dx * dx + dy * dy) / r2;
        if (q > 0) field[o + x] += q * q;
      }
    }
  }
  const img = L.createImageData(w, h);
  const d = img.data;
  // ~1.2 buffer-px wide edge: crisp after the ×2 upscale, never jagged
  for (let i = 0; i < w * h; i++) {
    const v = field[i];
    if (v <= thr * 0.6) continue;
    const a = clamp((v - thr) * 18 + 0.5);
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = 255;
    d[i * 4 + 3] = a * 255;
  }
  L.putImageData(img, 0, 0);
  return L;
}
/** keep only what is inside the mask (destination-in) */
export function applyMask(target: Ctx, mask: Ctx) {
  target.save();
  target.setTransform(1, 0, 0, 1, 0, 0);
  target.globalCompositeOperation = "destination-in";
  target.drawImage(mask.canvas, 0, 0, target.canvas.width, target.canvas.height);
  target.restore();
}

// ---------- line art that draws itself ----------
export type Stroke = { pts: [number, number][]; t0: number; t1: number; w?: number; closed?: boolean };
export const arcPts = (cx: number, cy: number, r: number, a0: number, a1: number, n = 64): [number, number][] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
export const linePts = (...xy: number[]): [number, number][] => {
  const o: [number, number][] = [];
  for (let i = 0; i < xy.length; i += 2) o.push([xy[i], xy[i + 1]]);
  return o;
};
const lens = new WeakMap<[number, number][], number[]>();
function cum(pts: [number, number][]) {
  let c = lens.get(pts);
  if (c) return c;
  c = [0];
  for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  lens.set(pts, c);
  return c;
}
/** draw a polyline from fraction a to fraction b of its length */
export function partial(ctx: Ctx, pts: [number, number][], a: number, b: number) {
  if (b <= a + 1e-4 || pts.length < 2) return;
  const c = cum(pts), L = c[c.length - 1], A = a * L, B = b * L;
  ctx.beginPath();
  let started = false;
  for (let i = 1; i < pts.length; i++) {
    const s0 = c[i - 1], s1 = c[i];
    if (s1 < A || s0 > B) continue;
    const f0 = clamp((A - s0) / (s1 - s0 || 1)), f1 = clamp((B - s0) / (s1 - s0 || 1));
    const x0 = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f0, y0 = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f0;
    const x1 = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f1, y1 = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f1;
    if (!started) {
      ctx.moveTo(x0, y0);
      started = true;
    }
    ctx.lineTo(x1, y1);
  }
  ctx.stroke();
}
/** glowing white line art; `t` local time, `out` 0..1 retracts every stroke from its start */
export function drawStrokes(ctx: Ctx, strokes: Stroke[], t: number, o: { color?: string; glow?: number; alpha?: number; out?: number; width?: number } = {}) {
  const { color = "#ffffff", glow = 10, alpha = 1, out = 0, width = 2.6 } = o;
  if (alpha <= 0.002) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = alpha;
  ctx.shadowColor = color;
  ctx.shadowBlur = glow * scale();
  for (const s of strokes) {
    const p = clamp((t - s.t0) / Math.max(1e-3, s.t1 - s.t0));
    const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    ctx.lineWidth = s.w ?? width;
    partial(ctx, s.pts, out, e);
  }
  ctx.restore();
}

/** full-frame rectangle path (for even-odd holes) */
export const frameRect = () => {
  const p = new Path2D();
  p.rect(-50, -50, W + 100, H + 100);
  return p;
};
