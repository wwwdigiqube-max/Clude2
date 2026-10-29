// How scenes hand over in a documentary: a scene shrinks into a living portal (and back), portals pop in a row
// (read right → left), merge, open into what they show; a lens (two overlapping circles) reveals the next world;
// a crown of rays crowns a portal. Scenes inside portals keep animating with their titles off.
import { Ctx, H, layer, paint, scale, W } from "./engine/canvas";
import { glow, grain, vignette } from "./engine/fx";
import { ease, k, lerp } from "./engine/math";
import { popR, portal } from "./engine/portal";
import { textOff, title, F } from "./engine/text";

export type Draw = (c: Ctx) => void;
/** where a scene's subject sits (scene coords) and how much of it a portal shows */
export type Focus = { cx: number; cy: number; crop: number };

/** run a scene with its titles off (it is being shown inside a portal) */
export const quiet = (fn: Draw): Draw => (c) => {
  const p = textOff.v;
  textOff.v = true;
  try {
    fn(c);
  } finally {
    textOff.v = p;
  }
};
/** draw a scene into its own full-frame layer (for cross-fades and masks) */
export const into = (id: string, fn: Draw) => {
  const L = layer(id);
  fn(L);
  return L;
};
const RFULL = Math.hypot(W, H) / 2 + 20;
/** e = 0: the scene fills the frame; e = 1: it sits in a portal at (x, y, r) showing focus f */
export function morph(ctx: Ctx, id: string, draw: Draw, e: number, x: number, y: number, r: number, f: Focus, t: number, seed: number, alpha = 1) {
  if (e <= 0.0005) return draw(ctx);
  portal(ctx, { id, draw, x: lerp(960, x, e), y: lerp(540, y, e), r: lerp(RFULL, r, e), cx: lerp(960, f.cx, e), cy: lerp(540, f.cy, e), crop: lerp(RFULL, f.crop, e), seed, t, alpha });
}
/** a portal born from a dot at t0 (soft overshoot) */
export function pop(ctx: Ctx, id: string, draw: Draw, t: number, t0: number, x: number, y: number, r: number, f: Focus, seed: number, alpha = 1) {
  const rr = popR(t, t0, r, 1.0);
  if (rr > 0.8) portal(ctx, { id, draw, x, y, r: rr, ...f, seed, t, alpha });
}
/** a label under a portal */
export const label = (ctx: Ctx, s: string, x: number, y: number, t: number, t0: number, out = 0) =>
  title(ctx, [{ s, f: F.bold }], x, y, { size: 40, k: k(t, t0, t0 + 0.7), out, shade: 0.4, glow: 12 });
/** frame finish for stage sequences */
export const finish = (ctx: Ctx, t: number) => {
  vignette(ctx, 0.35, "#0b0612");
  grain(ctx, t, 0.14);
};
/** the overlap of two circles (centres cy ± d, radius r) — the mandorla where heaven and earth meet */
export function vesica(cx: number, cy: number, d: number, r: number) {
  const p = new Path2D();
  const h = Math.sqrt(Math.max(0, r * r - d * d));
  const a1 = Math.atan2(d, h);
  p.arc(cx, cy - d, r, a1, Math.PI - a1);
  p.arc(cx, cy + d, r, a1 - Math.PI, -a1);
  p.closePath();
  return p;
}
/** reveal `scene` through a lens growing from (cx, cy); g 0..1 */
export function lensReveal(ctx: Ctx, scene: Draw, g: number, cx: number, cy: number, d: number, r: number, vertical: boolean) {
  const L = into("lens", scene);
  const z = 1 + g * 7;
  L.save();
  L.translate(cx, cy);
  if (!vertical) L.rotate(Math.PI / 2);
  L.scale(z, z);
  L.translate(-cx, -cy);
  L.globalCompositeOperation = "destination-in";
  L.fill(vesica(cx, cy, d, r));
  L.restore();
  paint(ctx, L);
  ctx.save();
  ctx.translate(cx, cy);
  if (!vertical) ctx.rotate(Math.PI / 2);
  ctx.scale(z, z);
  ctx.translate(-cx, -cy);
  ctx.strokeStyle = "#ffffff";
  ctx.globalAlpha = 1 - g;
  ctx.lineWidth = 3 / z;
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 16 * scale();
  ctx.stroke(vesica(cx, cy, d, r));
  ctx.restore();
}
/** a slowly turning crown of rays around a portal (glory) */
export function gloryRays(ctx: Ctx, x: number, y: number, r: number, a: number, t: number) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  glow(ctx, x, y, r * 1.9, "#fff2d8", 0.4 * a);
  ctx.translate(x, y);
  ctx.rotate(t * 0.05);
  for (let i = 0; i < 40; i++) {
    const ang = (i / 40) * Math.PI * 2;
    const len = r * (0.35 + 0.3 * (0.5 + 0.5 * Math.sin(i * 5.3 + t * 0.8))) * ease.out(a);
    ctx.strokeStyle = `rgba(255,244,220,${(0.5 * a).toFixed(3)})`;
    ctx.lineWidth = i % 3 ? 2 : 4;
    ctx.beginPath();
    ctx.moveTo(Math.cos(ang) * (r + 18), Math.sin(ang) * (r + 18));
    ctx.lineTo(Math.cos(ang) * (r + 18 + len), Math.sin(ang) * (r + 18 + len));
    ctx.stroke();
  }
  ctx.restore();
}
