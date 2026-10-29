// Portals: any scene shown inside a gently irregular circle. A scene can shrink into one, a new one can be born
// from a dot (overshoot), they line up, focus (grow to centre) and merge. Content keeps animating inside.
import { Ctx, H, layer, scale, W } from "./canvas";
import { bokeh, nebula, starsDeep } from "./depth";
import { glow, painterly } from "./fx";
import { clamp, ease, lerp } from "./math";
import { portalPath } from "./shape";

export type Portal = {
  id: string;
  draw: (c: Ctx) => void; // full-frame scene
  x: number; y: number; r: number; // on screen
  cx?: number; cy?: number; crop?: number; // scene point at the centre and the scene radius shown
  seed?: number; t: number; alpha?: number; res?: number; rot?: number;
};
export function portal(ctx: Ctx, p: Portal) {
  const { x, y, r, cx = W / 2, cy = H / 2, crop = 560, seed = 1, t, alpha = 1, rot = 0 } = p;
  if (r < 0.8 || alpha <= 0.002) return;
  const res = p.res ?? (r > 420 ? 1 : 0.5);
  const L = layer("portal-" + p.id, res);
  p.draw(L);
  const s = r / crop;
  const path = portalPath(x, y, r, seed, t);
  ctx.save();
  ctx.globalAlpha = alpha;
  // soft shadow under the disc (depth)
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  glow(ctx, x + r * 0.06, y + r * 0.1, r * 1.35, "#0b0510", 0.45);
  ctx.restore();
  ctx.clip(path);
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s);
  ctx.translate(-cx, -cy);
  ctx.drawImage(L.canvas, 0, 0, W, H);
  ctx.restore();
  // a faint inner rim of light
  ctx.save();
  ctx.globalAlpha = alpha * 0.35;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 8 * scale();
  ctx.stroke(path);
  ctx.restore();
}
/** born from a dot: radius with overshoot */
export const popR = (t: number, t0: number, r: number, dur = 1.0) => r * ease.outBack(clamp((t - t0) / Math.max(dur, 0.95)), 0.9) * (t > t0 ? 1 : 0); // soft overshoot
/** a scene shrinking from full frame into a portal: returns portal radius + crop for progress e (0..1) */
export function shrink(e: number, rEnd: number, cropEnd: number) {
  const rFull = Math.hypot(W, H) / 2 + 20;
  return { r: lerp(rFull, rEnd, e), crop: lerp(rFull, cropEnd, e) };
}
/** the dark stage the portals float on: a deep night with slow nebula fog, stars at three depths, soft light
 *  drifting in the foreground (out of focus) — the portals hang in space, not on a flat wall */
export function stage(ctx: Ctx, t: number, a = 1) {
  ctx.save();
  ctx.globalAlpha = a;
  painterly(ctx, t, "#1a0f26", "#0e0816", [
    { x: 400, y: 260, r: 760, c: "#2a173b", a: 0.8 },
    { x: 1550, y: 820, r: 820, c: "#22133a", a: 0.8 },
    { x: 1300, y: 160, r: 560, c: "#2f1b43", a: 0.5 },
  ], 12, 0.6);
  nebula(ctx, t, ["#4a2a6a", "#7a3f6e", "#c9a8ff"], 0.32, 7, 1.2);
  nebula(ctx, t * 1.4 + 50, ["#2a2050", "#3a2a70", "#8f9cff"], 0.18, 11, 1.6, "screen", 120, -60);
  const px = Math.sin(t * 0.05) * 60, py = Math.cos(t * 0.04) * 30;
  starsDeep(ctx, t, 170, 13, 0.75, px, py);
  bokeh(ctx, t, { n: 9, seed: 14, color: "#c9b0ff", alpha: 0.12, size: 70, px: px * 2, py: py * 2, rise: 5 });
  ctx.restore();
}
export const _p = { ease };
