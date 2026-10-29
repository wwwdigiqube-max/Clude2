// Depth kit (v3): things that give the flat painted world volume and distance —
// lit cloud sprites, volumetric light shafts / god rays, nebula washes, deep star fields, ridges with aerial
// perspective, out-of-focus foreground bokeh, light pools on the ground and soft cast shadows.
// Sprites and textures are generated once per process from noise (deterministic), then only drawn.
import { blur, Ctx, H, layer, matchTransform, paint, resOf, scale, W } from "./canvas";
import { figureFlat, Fig } from "./figure";
import { clamp, hex, lerp, mixHex, rgba, rng, TAU } from "./math";

// ---------- fast value noise (table based; no trig) ----------
const PERM = (() => {
  const r = rng(9001);
  const a = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  const p = new Uint16Array(512);
  for (let i = 0; i < 512; i++) p[i] = a[i & 255];
  return p;
})();
const VAL = (() => {
  const r = rng(4242);
  return Float32Array.from({ length: 256 }, () => r());
})();
export function vn(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const X = xi & 255, Y = yi & 255;
  const a = VAL[PERM[X + PERM[Y]]], b = VAL[PERM[X + 1 + PERM[Y]]], c = VAL[PERM[X + PERM[Y + 1]]], d = VAL[PERM[X + 1 + PERM[Y + 1]]];
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
/** fbm in [0,1], octaves rotated to hide the grid */
export function fbmF(x: number, y: number, oct = 5) {
  let s = 0, a = 0.5, n = 0;
  for (let i = 0; i < oct; i++) {
    s += a * vn(x, y);
    n += a;
    const nx = x * 1.6 - y * 1.2, ny = x * 1.2 + y * 1.6; // rotate + ×2
    x = nx + 17.3;
    y = ny + 3.1;
    a *= 0.5;
  }
  return s / n;
}

// ---------- real clouds (public-domain / CC0 photos, sky keyed out: grey = light, alpha = cloud) ----------
// Each scene lights them with its own palette: the grey ramp is mapped shade → mid → lit.
export const CLOUD_NAMES = ["cu1", "cu2", "cu3", "cu4", "cu5", "tower", "field", "sea1", "sea2"] as const;
export type CloudName = (typeof CLOUD_NAMES)[number];
const photos = new Map<string, HTMLImageElement>();
let cloudsP: Promise<void> | null = null;
/** load every cloud photo once (the component waits for this before the first frame) */
export function loadClouds(url: (f: string) => string) {
  if (!cloudsP)
    cloudsP = Promise.all(
      CLOUD_NAMES.map(
        (n) =>
          new Promise<void>((res, rej) => {
            const im = new Image();
            im.onload = () => {
              photos.set(n, im);
              res();
            };
            im.onerror = () => rej(new Error("cloud " + n));
            im.src = url(`v19/clouds/${n}.png`);
          }),
      ),
    ).then(() => undefined);
  return cloudsP;
}
export type CloudPal = { shade: string; mid: string; lit: string; gamma?: number };
const sprites = new Map<string, HTMLCanvasElement>();
/** the photo, graded with the palette (cached per photo + palette, at most 1400 px wide) */
export function cloudSprite(name: CloudName, pal: CloudPal) {
  const key = `${name}|${pal.shade}|${pal.mid}|${pal.lit}|${pal.gamma ?? 1}`;
  let s = sprites.get(key);
  if (s) return s;
  const im = photos.get(name);
  if (!im) throw new Error("clouds not loaded: " + name);
  const sw = Math.min(1400, im.naturalWidth), sh = Math.round((im.naturalHeight * sw) / im.naturalWidth);
  s = document.createElement("canvas");
  s.width = sw;
  s.height = sh;
  const x = s.getContext("2d", { willReadFrequently: true })!;
  x.drawImage(im, 0, 0, sw, sh);
  const img = x.getImageData(0, 0, sw, sh);
  const A = hex(pal.shade), M = hex(pal.mid), Lt = hex(pal.lit), g = pal.gamma ?? 1;
  const lut = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const v = Math.pow(i / 255, g);
    const [p, q, u] = v < 0.5 ? [A, M, v * 2] : [M, Lt, (v - 0.5) * 2];
    for (let c = 0; c < 3; c++) lut[i * 3 + c] = p[c] + (q[c] - p[c]) * u;
  }
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const L = d[i];
    d[i] = lut[L * 3];
    d[i + 1] = lut[L * 3 + 1];
    d[i + 2] = lut[L * 3 + 2];
  }
  x.putImageData(img, 0, 0);
  sprites.set(key, s);
  return s;
}
const crops = new Map<string, HTMLCanvasElement>();
/** part of a graded photo; edges cut through the cloud are feathered so no straight line shows */
function cropSprite(s: HTMLCanvasElement, key: string, cr: [number, number, number, number]) {
  const k2 = key + "|" + cr.join(",");
  let o = crops.get(k2);
  if (o) return o;
  const [cx, cy, cw, ch] = cr;
  o = document.createElement("canvas");
  o.width = Math.max(1, Math.round(cw * s.width));
  o.height = Math.max(1, Math.round(ch * s.height));
  const x = o.getContext("2d")!;
  x.drawImage(s, cx * s.width, cy * s.height, cw * s.width, ch * s.height, 0, 0, o.width, o.height);
  x.globalCompositeOperation = "destination-in";
  const f = 0.16;
  const edge = (x0: number, y0: number, x1: number, y1: number, on: boolean) => {
    if (!on) return;
    const g = x.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,1)");
    x.fillStyle = g;
    x.fillRect(0, 0, o!.width, o!.height);
  };
  edge(0, 0, o.width * f, 0, cx > 0.001);
  edge(o.width, 0, o.width * (1 - f), 0, cx + cw < 0.999);
  edge(0, 0, 0, o.height * f, cy > 0.001);
  edge(0, o.height, 0, o.height * (1 - f), cy + ch < 0.999);
  crops.set(k2, o);
  return o;
}
export type Cloud = { name: CloudName; x: number; y: number; w: number; a?: number; flip?: boolean; sp?: number; crop?: [number, number, number, number] };
/** draw clouds in the current transform, centred at x,y, w wide; each drifts at sp px/s; crop = part of the photo */
export function clouds(c: Ctx, t: number, list: Cloud[], pal: CloudPal, alpha = 1, wrap?: [number, number]) {
  if (alpha <= 0.002) return;
  c.save();
  for (const cl of list) {
    const full = cloudSprite(cl.name, pal);
    const s = cl.crop ? cropSprite(full, cl.name + "|" + pal.shade + pal.mid + pal.lit + (pal.gamma ?? 1), cl.crop) : full;
    const w = cl.w, h = (w * s.height) / s.width;
    let x = cl.x + t * (cl.sp ?? 0);
    if (wrap) {
      const span = wrap[1] - wrap[0] + w;
      x = wrap[0] - w / 2 + ((((x - wrap[0] + w / 2) % span) + span) % span);
    }
    c.globalAlpha = alpha * (cl.a ?? 1);
    c.save();
    c.translate(x, cl.y);
    if (cl.flip) c.scale(-1, 1);
    c.drawImage(s, -w / 2, -h / 2, w, h);
    c.restore();
  }
  c.restore();
}

// ---------- god rays / light shafts ----------
export type RayOpt = { n?: number; len?: number; spread?: number; dir?: number; color?: string; alpha?: number; seed?: number; width?: number; spin?: number; soft?: number; r0?: number };
/** volumetric rays fanning out of (x,y): soft wedges of varying width that shimmer and slowly turn */
export function godRays(ctx: Ctx, t: number, x: number, y: number, o: RayOpt = {}) {
  const { n = 18, len = 900, spread = TAU, dir = -Math.PI / 2, color = "#fff4dc", alpha = 0.5, seed = 1, width = 0.06, spin = 0.02, soft = 10, r0 = 0 } = o;
  if (alpha <= 0.002) return;
  const L = layer("rays", 0.5);
  matchTransform(L, ctx);
  L.globalCompositeOperation = "lighter";
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const base = spread >= TAU - 0.01 ? (i / n) * TAU : dir - spread / 2 + spread * ((i + 0.5) / n) + (r() - 0.5) * (spread / n) * 0.8;
    const a = base + t * spin * (i % 2 ? 1 : -0.6) + Math.sin(t * 0.17 + i * 1.7) * 0.02;
    const wv = width * (0.35 + r() * 1.1);
    const ln = len * (0.45 + 0.55 * r()) * (0.85 + 0.15 * Math.sin(t * 0.5 + i * 2.3));
    const fl = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * (0.4 + r() * 0.5) + r() * 9));
    const g = L.createRadialGradient(x, y, r0, x, y, ln);
    g.addColorStop(0, rgba(color, alpha * fl));
    g.addColorStop(0.35, rgba(color, alpha * fl * 0.45));
    g.addColorStop(1, rgba(color, 0));
    L.fillStyle = g;
    L.beginPath();
    L.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0);
    L.arc(x, y, ln, a - wv / 2, a + wv / 2);
    L.closePath();
    L.fill();
  }
  paint(ctx, L, 1, "screen", blur(soft, resOf(ctx) || 1));
}
/** one slanted shaft of light (trapezoid) with dust floating in it */
export function shaft(ctx: Ctx, t: number, x0: number, y0: number, x1: number, y1: number, w0: number, w1: number, color = "#fff4dc", alpha = 0.4, dust = 24, seed = 3) {
  if (alpha <= 0.002) return;
  const L = layer("shaft", 0.5);
  matchTransform(L, ctx);
  const g = L.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, rgba(color, alpha));
  g.addColorStop(0.6, rgba(color, alpha * 0.55));
  g.addColorStop(1, rgba(color, 0));
  L.fillStyle = g;
  const ang = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(ang), ny = Math.cos(ang);
  L.beginPath();
  L.moveTo(x0 + nx * w0, y0 + ny * w0);
  L.lineTo(x1 + nx * w1, y1 + ny * w1);
  L.lineTo(x1 - nx * w1, y1 - ny * w1);
  L.lineTo(x0 - nx * w0, y0 - ny * w0);
  L.closePath();
  L.fill();
  paint(ctx, L, 1, "screen", blur(14, resOf(ctx) || 1));
  // dust motes drifting in the beam
  const r = rng(seed);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = color;
  for (let i = 0; i < dust; i++) {
    const u = (r() + t * (0.01 + r() * 0.02)) % 1, side = (r() - 0.5) * 1.6;
    const px = lerp(x0, x1, u) + nx * side * lerp(w0, w1, u) + Math.sin(t * 0.7 + i) * 6;
    const py = lerp(y0, y1, u) + ny * side * lerp(w0, w1, u) + Math.cos(t * 0.5 + i) * 6;
    ctx.globalAlpha = alpha * 1.6 * (0.3 + 0.7 * Math.sin(u * Math.PI)) * (0.5 + 0.5 * Math.sin(t * 1.3 + i * 2));
    ctx.beginPath();
    ctx.arc(px, py, 1.2 + r() * 2.2, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

// ---------- nebula / painted sky wash ----------
const washes = new Map<string, HTMLCanvasElement>();
function washTex(seed: number, cols: [string, string, string]) {
  const key = seed + "|" + cols.join(",");
  let s = washes.get(key);
  if (s) return s;
  const w = 480, h = 270;
  s = document.createElement("canvas");
  s.width = w;
  s.height = h;
  const x = s.getContext("2d")!;
  const img = x.createImageData(w, h);
  const A = hex(cols[0]), B = hex(cols[1]), C = hex(cols[2]);
  for (let y = 0; y < h; y++)
    for (let xx = 0; xx < w; xx++) {
      const u = xx / w, v = y / h;
      const n1 = fbmF(u * 3.2 + seed, v * 1.9 + seed * 0.7, 6);
      const n2 = fbmF(u * 6.5 + 40 + seed, v * 4 - 9, 4);
      const d = clamp((n1 - 0.38) * 2.4); // cloudy density
      const m = clamp((n2 - 0.35) * 2.2); // colour variation
      const fil = Math.pow(clamp(1 - Math.abs(n1 - 0.56) * 3.2), 2) * 0.3; // soft brighter seams
      const o = (y * w + xx) * 4;
      img.data[o] = A[0] + (B[0] - A[0]) * m + (C[0] - A[0]) * fil;
      img.data[o + 1] = A[1] + (B[1] - A[1]) * m + (C[1] - A[1]) * fil;
      img.data[o + 2] = A[2] + (B[2] - A[2]) * m + (C[2] - A[2]) * fil;
      img.data[o + 3] = 255 * clamp(d * 0.85 + fil);
    }
  x.putImageData(img, 0, 0);
  washes.set(key, s);
  return s;
}
/** full-frame drifting nebula / cloud wash (screen space); cols = [base, variation, filament] */
export function nebula(ctx: Ctx, t: number, cols: [string, string, string], alpha = 0.5, seed = 1, drift = 1, mode: GlobalCompositeOperation = "screen", ox = 0, oy = 0) {
  if (alpha <= 0.002) return;
  const s = washTex(seed, cols);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = mode;
  const z = 1.25 + 0.04 * Math.sin(t * 0.03 * drift + seed);
  const dx = Math.sin(t * 0.021 * drift + seed) * 70 + ox, dy = Math.cos(t * 0.017 * drift + seed) * 40 + oy;
  ctx.translate(W / 2 + dx, H / 2 + dy);
  ctx.scale(z, z);
  ctx.drawImage(s, -W / 2, -H / 2, W, H);
  ctx.restore();
}

// ---------- deep star field (3 depths, parallax with the camera offset) ----------
export function starsDeep(ctx: Ctx, t: number, n: number, seed: number, alpha = 1, px = 0, py = 0, color = "#ffffff", box: [number, number, number, number] = [0, 0, W, H]) {
  if (alpha <= 0.002) return;
  const r = rng(seed);
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const d = r(); // depth 0 far … 1 near
    const bw = box[2] + 200, bh = box[3] + 200;
    const x = box[0] - 100 + ((((r() * bw - px * (0.15 + d * 0.6)) % bw) + bw) % bw);
    const y = box[1] - 100 + ((((r() * bh - py * (0.15 + d * 0.6)) % bh) + bh) % bh);
    const big = Math.pow(r(), 6);
    const s = 0.5 + d * 1.1 + big * 2.6;
    const tw = 0.6 + 0.4 * Math.sin(t * (0.6 + r() * 2.2) + r() * TAU);
    const a = alpha * tw * (0.25 + 0.75 * d);
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, TAU);
    ctx.fill();
    if (big > 0.25) {
      // the brightest few: a soft halo and a tiny cross
      ctx.globalAlpha = a * 0.25;
      ctx.beginPath();
      ctx.arc(x, y, s * 4, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = a * 0.6;
      ctx.fillRect(x - s * 6, y - 0.5, s * 12, 1);
      ctx.fillRect(x - 0.5, y - s * 6, 1, s * 12);
    }
  }
  ctx.restore();
}

// ---------- ridges with aerial perspective ----------
const ridges = new Map<string, [number, number][]>();
export type RidgeOpt = { y0: number; amp: number; freq?: number; seed: number; x0?: number; x1?: number; step?: number; sharp?: number; oct?: number };
export function ridgePts(o: RidgeOpt) {
  const { y0, amp, freq = 0.0016, seed, x0 = -600, x1 = 2600, step = 14, sharp = 0.6, oct = 6 } = o;
  const key = JSON.stringify(o);
  let p = ridges.get(key);
  if (p) return p;
  p = [];
  for (let x = x0; x <= x1; x += step) {
    const n = fbmF(x * freq + seed * 3.1, seed * 1.7, oct);
    const ridged = 1 - Math.abs(n * 2 - 1); // sharp crests
    p.push([x, y0 - amp * lerp(n, ridged, sharp)]);
  }
  ridges.set(key, p);
  return p;
}
/** a mountain / dune band: filled silhouette, haze toward its top, a rim of light along the crest */
export function ridge(c: Ctx, o: RidgeOpt & { color: string; haze?: string; hazeA?: number; rim?: string; rimA?: number; rimW?: number; bottom?: number; tex?: number }) {
  const pts = ridgePts(o);
  const bottom = o.bottom ?? 1500;
  c.save();
  c.beginPath();
  c.moveTo(pts[0][0], bottom);
  for (const [x, y] of pts) c.lineTo(x, y);
  c.lineTo(pts[pts.length - 1][0], bottom);
  c.closePath();
  c.fillStyle = o.color;
  c.fill();
  c.clip();
  // aerial perspective: the crests are hazier than the feet
  if (o.haze && (o.hazeA ?? 0.5) > 0) {
    const top = o.y0 - o.amp;
    const g = c.createLinearGradient(0, top, 0, o.y0 + 120);
    g.addColorStop(0, rgba(o.haze, o.hazeA ?? 0.5));
    g.addColorStop(1, rgba(o.haze, 0));
    c.fillStyle = g;
    c.fillRect(pts[0][0], top - 10, pts[pts.length - 1][0] - pts[0][0], o.y0 - top + 140);
  }
  // faint strata following the slope (texture, not noise)
  if (o.tex) {
    c.strokeStyle = rgba("#000000", 0.07 * o.tex);
    c.lineWidth = 2;
    for (let k = 1; k < 7; k++) {
      c.beginPath();
      pts.forEach(([x, y], i) => {
        const yy = y + k * 26 + Math.sin(x * 0.01 + k) * 6;
        i ? c.lineTo(x, yy) : c.moveTo(x, yy);
      });
      c.stroke();
    }
  }
  c.restore();
  if (o.rim && (o.rimA ?? 0.5) > 0) {
    c.save();
    c.strokeStyle = rgba(o.rim, o.rimA ?? 0.5);
    c.lineWidth = o.rimW ?? 2;
    c.lineJoin = "round";
    c.beginPath();
    pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.stroke();
    c.restore();
  }
}
/** a flat band of mist hugging a horizon */
export function mist(c: Ctx, y: number, h: number, color: string, a: number, x0 = -600, x1 = 2600) {
  if (a <= 0.002) return;
  const g = c.createLinearGradient(0, y - h, 0, y + h);
  g.addColorStop(0, rgba(color, 0));
  g.addColorStop(0.5, rgba(color, a));
  g.addColorStop(1, rgba(color, 0));
  c.save();
  c.fillStyle = g;
  c.fillRect(x0, y - h, x1 - x0, h * 2);
  c.restore();
}

// ---------- out-of-focus foreground (lens bokeh) ----------
export function bokeh(ctx: Ctx, t: number, o: { n?: number; seed?: number; color?: string; alpha?: number; size?: number; px?: number; py?: number; box?: [number, number, number, number]; rise?: number } = {}) {
  const { n = 10, seed = 1, color = "#ffffff", alpha = 0.25, size = 60, px = 0, py = 0, box = [0, 0, W, H], rise = 6 } = o;
  if (alpha <= 0.002) return;
  const L = layer("bokeh", 0.5);
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const s = size * (0.5 + r());
    const bw = box[2] + 2 * s, bh = box[3] + 2 * s;
    const x = box[0] - s + ((((r() * bw - px * 1.6 + Math.sin(t * 0.13 + i) * 30) % bw) + bw) % bw);
    const y = box[1] - s + ((((r() * bh - py * 1.6 - t * rise * (0.5 + r())) % bh) + bh) % bh);
    const a = alpha * (0.35 + 0.65 * r()) * (0.7 + 0.3 * Math.sin(t * 0.5 + i * 3));
    const g = L.createRadialGradient(x, y, s * 0.2, x, y, s);
    g.addColorStop(0, rgba(color, a * 0.55));
    g.addColorStop(0.82, rgba(color, a * 0.8));
    g.addColorStop(1, rgba(color, 0));
    L.fillStyle = g;
    L.beginPath();
    L.arc(x, y, s, 0, TAU);
    L.fill();
  }
  paint(ctx, L, 1, "screen", blur(4, resOf(ctx) || 1));
}

// ---------- light on the ground, shadows cast by it ----------
export function lightPool(c: Ctx, x: number, y: number, rx: number, ry: number, color: string, a: number) {
  if (a <= 0.002) return;
  c.save();
  c.globalCompositeOperation = "screen";
  c.translate(x, y);
  c.scale(1, ry / rx);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, rgba(color, a));
  g.addColorStop(0.4, rgba(color, a * 0.45));
  g.addColorStop(1, rgba(color, 0));
  c.fillStyle = g;
  c.fillRect(-rx, -rx, rx * 2, rx * 2);
  c.restore();
}
/** a soft shadow of figure f thrown on the ground by a light at lx (design x): longer the lower the light */
export function castShadow(ctx: Ctx, f: Fig, lx: number, len: number, alpha: number, color = "#0d0610", sq = 0.22, soft = 6) {
  if (alpha <= 0.002) return;
  const L = layer("shadow", 0.5);
  matchTransform(L, ctx);
  const side = lx > f.x ? -1 : 1;
  L.translate(f.x, f.y);
  L.transform(1, 0, -side * len, sq, 0, 0); // up (−y) maps to "away from the light" along the ground
  figureFlat(L, { ...f, x: 0, y: 0 }, color);
  // fade with distance from the feet
  matchTransform(L, ctx);
  const reach = f.h * Math.max(0.4, len) * 1.15;
  const g = L.createRadialGradient(f.x, f.y, 0, f.x, f.y, reach);
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(1, "rgba(0,0,0,0.1)");
  L.globalCompositeOperation = "destination-in";
  L.fillStyle = g;
  L.fillRect(f.x - reach, f.y - reach, reach * 2, reach * 2);
  paint(ctx, L, alpha, "multiply", blur(soft, resOf(ctx) || 1));
}
/** a contact shadow under feet */
export function contact(c: Ctx, x: number, y: number, rx: number, a: number, color = "#0d0610") {
  c.save();
  c.translate(x, y);
  c.scale(1, 0.16);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, rgba(color, a));
  g.addColorStop(1, rgba(color, 0));
  c.fillStyle = g;
  c.fillRect(-rx, -rx, rx * 2, rx * 2);
  c.restore();
}
export const _d = { mixHex, scale };
