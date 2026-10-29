// Atmosphere: film grain, vignette, painterly backdrops, light motes, sparkles, stars, light ribbons.
// (Clouds are real photos — see depth.ts `clouds`; drawn cloud shapes were rejected as fake.)
import { blur, Ctx, H, layer, paint, scale, W } from "./canvas";
import { clamp, fbm, hash, noise2, rgba, rng, TAU } from "./math";

// ---------- grain (mottled, 12 fps like film) ----------
let tiles: HTMLCanvasElement[] | null = null;
function makeTiles() {
  tiles = [];
  const S = 256;
  for (let i = 0; i < 6; i++) {
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const x = c.getContext("2d")!;
    const img = x.createImageData(S, S);
    const r = rng(1000 + i * 77);
    for (let y = 0; y < S; y++)
      for (let xx = 0; xx < S; xx++) {
        const m = noise2(xx / 5 + i * 13.1, y / 5 + i * 7.7) - 0.5; // clumps
        const v = 128 + (r() - 0.5) * 150 + m * 70;
        const o = (y * S + xx) * 4;
        img.data[o] = img.data[o + 1] = img.data[o + 2] = clamp(v, 0, 255);
        img.data[o + 3] = 255;
      }
    x.putImageData(img, 0, 0);
    tiles.push(c);
  }
}
export function grain(ctx: Ctx, t: number, amt = 0.15) {
  if (!tiles) makeTiles();
  const f = Math.floor(t * 12);
  const tile = tiles![f % tiles!.length];
  const p = ctx.createPattern(tile, "repeat")!;
  const R = scale();
  p.setTransform(new DOMMatrix().translate(hash(f) * 256, hash(f + 9) * 256).scale(1.35 * R));
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = amt;
  ctx.fillStyle = p;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}

export function vignette(ctx: Ctx, amt = 0.5, color = "#0b0612") {
  if (amt <= 0) return;
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05);
  g.addColorStop(0, rgba(color, 0));
  g.addColorStop(1, rgba(color, amt));
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(-10, -10, W + 20, H + 20);
  ctx.restore();
}

// ---------- painterly backdrop: base gradient + big soft drifting colour pools ----------
export type Pool = { x: number; y: number; r: number; c: string; a: number };
export function painterly(ctx: Ctx, t: number, top: string, bottom: string, pools: Pool[], seed = 1, drift = 1) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(-20, -20, W + 40, H + 40);
  const L = layer("pools", 0.25);
  pools.forEach((p, i) => {
    const dx = Math.sin(t * 0.07 * drift + i * 1.7 + seed) * 60, dy = Math.cos(t * 0.05 * drift + i * 2.3 + seed) * 40;
    const rg = L.createRadialGradient(p.x + dx, p.y + dy, 0, p.x + dx, p.y + dy, p.r);
    rg.addColorStop(0, rgba(p.c, p.a));
    rg.addColorStop(0.6, rgba(p.c, p.a * 0.55));
    rg.addColorStop(1, rgba(p.c, 0));
    L.fillStyle = rg;
    L.beginPath();
    // wobbly pool edge so it reads painted, not airbrushed
    for (let j = 0; j <= 48; j++) {
      const a = (j / 48) * TAU;
      const rr = p.r * (0.82 + 0.18 * noise2(Math.cos(a) * 1.5 + i * 3 + seed, Math.sin(a) * 1.5 + t * 0.03));
      const X = p.x + dx + Math.cos(a) * rr, Y = p.y + dy + Math.sin(a) * rr;
      j ? L.lineTo(X, Y) : L.moveTo(X, Y);
    }
    L.fill();
  });
  paint(ctx, L, 1, "source-over", blur(6, 0.25));
}

// ---------- light motes: soft vertical capsules drifting up (3 depths) ----------
export type MoteOpt = { n?: number; color?: string; alpha?: number; seed?: number; speed?: number; area?: [number, number, number, number]; dust?: boolean };
export function motes(ctx: Ctx, t: number, o: MoteOpt = {}) {
  const { n = 26, color = "#fff6d8", alpha = 0.5, seed = 3, speed = 1, area = [0, 0, W, H], dust = false } = o;
  if (alpha <= 0.002) return;
  const r = rng(seed);
  const depths = [layer("mote0", 0.5), layer("mote1", 0.5), layer("mote2", 0.5)];
  for (let i = 0; i < n; i++) {
    const d = Math.floor(r() * 3);
    const x0 = area[0] + r() * area[2], y0 = area[1] + r() * area[3];
    const w = (dust ? 3 + r() * 5 : 8 + r() * 18) * (1 + d * 0.5), h = dust ? w : w * (2 + r() * 2.5);
    const sp = (6 + r() * 14) * speed * (1 + d * 0.4);
    const y = area[1] + ((((y0 - area[1] - t * sp) % area[3]) + area[3]) % area[3]);
    const xd = dust ? area[0] + ((((x0 - area[0] + t * sp * 0.8) % area[2]) + area[2]) % area[2]) : x0;
    const x = xd + Math.sin(t * 0.3 + i) * 12;
    const tw = 0.55 + 0.45 * Math.sin(t * (0.6 + r()) + i * 2.1);
    const L = depths[d];
    L.fillStyle = rgba(color, (0.35 + r() * 0.65) * tw);
    L.beginPath();
    L.roundRect(x - w / 2, y - h / 2, w, h, w / 2);
    L.fill();
  }
  paint(ctx, depths[0], alpha, "screen", blur(1.5, 0.5));
  paint(ctx, depths[1], alpha * 0.8, "screen", blur(5, 0.5));
  paint(ctx, depths[2], alpha * 0.6, "screen", blur(12, 0.5));
}

// ---------- 4-point sparkle ----------
export function sparkle(ctx: Ctx, x: number, y: number, s: number, a: number, color = "#ffffff", rot = 0) {
  if (a <= 0.002 || s <= 0.1) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha *= clamp(a);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = s * 1.6 * scale();
  ctx.beginPath();
  const w = s * 0.16;
  ctx.moveTo(0, -s);
  ctx.quadraticCurveTo(w, -w, s, 0);
  ctx.quadraticCurveTo(w, w, 0, s);
  ctx.quadraticCurveTo(-w, w, -s, 0);
  ctx.quadraticCurveTo(-w, -w, 0, -s);
  ctx.fill();
  ctx.restore();
}
/** a field of twinkling sparkles inside a box */
export function sparkles(ctx: Ctx, t: number, box: [number, number, number, number], n: number, seed: number, alpha = 1, color = "#ffffff", size = 9) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = box[0] + r() * box[2], y = box[1] + r() * box[3];
    const ph = r() * TAU, sp = 0.5 + r() * 1.4, sz = size * (0.4 + r() * 0.9);
    const tw = Math.pow(Math.max(0, Math.sin(t * sp + ph)), 3);
    sparkle(ctx, x + Math.sin(t * 0.2 + i) * 6, y - ((t * 4 * sp) % 30), sz * (0.4 + 0.6 * tw), alpha * tw, color, t * 0.2 * (i % 2 ? 1 : -1));
  }
}
export function stars(ctx: Ctx, t: number, box: [number, number, number, number], n: number, seed: number, alpha = 1, color = "#ffffff") {
  const r = rng(seed);
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const x = box[0] + r() * box[2], y = box[1] + r() * box[3], s = 0.6 + Math.pow(r(), 3) * 2.2;
    const tw = 0.55 + 0.45 * Math.sin(t * (0.8 + r() * 2) + r() * TAU);
    ctx.globalAlpha = alpha * tw * (0.4 + r() * 0.6);
    ctx.beginPath();
    ctx.arc(x, y, s, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

// ---------- light ribbons: bundles of fine parallel arcs ----------
export function ribbons(ctx: Ctx, t: number, list: { x0: number; y0: number; x1: number; y1: number; bend: number }[], color: string, alpha = 0.3) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  list.forEach((b, bi) => {
    for (let i = 0; i < 5; i++) {
      const off = (i - 2) * 9;
      ctx.globalAlpha = alpha * (0.4 + 0.6 * Math.sin(t * 0.5 + i + bi) ** 2);
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      const mx = (b.x0 + b.x1) / 2 + b.bend + Math.sin(t * 0.2 + bi) * 20, my = (b.y0 + b.y1) / 2 - b.bend * 0.5;
      ctx.moveTo(b.x0 + off, b.y0 + off);
      ctx.quadraticCurveTo(mx + off, my + off, b.x1 + off, b.y1 + off);
      ctx.stroke();
    }
  });
  ctx.restore();
}

/** soft round glow (additive) */
export function glow(ctx: Ctx, x: number, y: number, r: number, color: string, a = 1) {
  if (a <= 0.002 || r <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(color, a));
  g.addColorStop(0.35, rgba(color, a * 0.45));
  g.addColorStop(1, rgba(color, 0));
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

/** fbm edge offset helper for organic outlines */
export const wob = (a: number, t: number, seed: number, f = 1.6) => fbm(Math.cos(a) * f + seed, Math.sin(a) * f + t, 2);
