// Canvas plumbing: one design space (1920×1080) drawn at render scale R, plus a pool of offscreen layers.
export const W = 1920;
export const H = 1080;
export type Ctx = CanvasRenderingContext2D;

let R = 1;
export const setScale = (r: number) => {
  R = r;
};
export const scale = () => R;

const pool = new Map<string, HTMLCanvasElement>();
function canvasFor(id: string, w: number, h: number) {
  let c = pool.get(id);
  if (!c || c.width !== w || c.height !== h) {
    c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    pool.set(id, c);
  }
  return c;
}
/** A cleared full-frame layer in design coordinates. `res` < 1 = cheaper buffer (glows, masks). */
export function layer(id: string, res = 1): Ctx {
  const w = Math.max(1, Math.round(W * R * res)), h = Math.max(1, Math.round(H * R * res));
  const c = canvasFor(id, w, h);
  const x = c.getContext("2d")!;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalAlpha = 1;
  x.globalCompositeOperation = "source-over";
  x.filter = "none";
  x.shadowBlur = 0;
  x.shadowColor = "transparent";
  x.clearRect(0, 0, w, h);
  x.setTransform(R * res, 0, 0, R * res, 0, 0);
  x.imageSmoothingEnabled = true;
  x.imageSmoothingQuality = "high";
  return x;
}
/** Paint a layer onto ctx (full frame, design coordinates). */
export function paint(ctx: Ctx, src: Ctx, alpha = 1, mode: GlobalCompositeOperation = "source-over", filter = "none") {
  if (alpha <= 0.001) return;
  ctx.save();
  const s = ctx.canvas.width / W; // the target may be a smaller buffer (portals, glows)
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = mode;
  ctx.filter = filter;
  ctx.drawImage(src.canvas, 0, 0, W, H);
  ctx.restore();
}
/** copy ctx's current transform onto another buffer of a different resolution */
export function matchTransform(dst: Ctx, src: Ctx) {
  const f = dst.canvas.width / src.canvas.width;
  const m = src.getTransform();
  dst.setTransform(m.a * f, m.b * f, m.c * f, m.d * f, m.e * f, m.f * f);
}
/** resolution factor of a buffer relative to the full design frame */
export const resOf = (c: Ctx) => c.canvas.width / (W * R);
/** css blur in design px (scaled to the buffer) */
export const blur = (px: number, res = 1) => (px > 0.05 ? `blur(${(px * R * res).toFixed(2)}px)` : "none");

/** Soft bloom: blur a light-only layer on a small buffer and add it back. */
export function bloom(ctx: Ctx, light: Ctx, amount = 1, radius = 40) {
  if (amount <= 0.001) return;
  const g = layer("bloom", 0.25);
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.filter = `blur(${(radius * R * 0.25).toFixed(2)}px)`;
  g.drawImage(light.canvas, 0, 0, g.canvas.width, g.canvas.height);
  g.restore();
  paint(ctx, g, amount, "screen");
  const g2 = layer("bloom2", 0.25);
  g2.save();
  g2.setTransform(1, 0, 0, 1, 0, 0);
  g2.filter = `blur(${(radius * 0.3 * R * 0.25).toFixed(2)}px)`;
  g2.drawImage(light.canvas, 0, 0, g2.canvas.width, g2.canvas.height);
  g2.restore();
  paint(ctx, g2, amount * 0.8, "screen");
}

/** Camera: zoom about a focus point + pan (design coords). */
export type Cam = { x: number; y: number; z: number; rot?: number };
export function applyCam(c: Ctx, cam: Cam) {
  c.translate(W / 2, H / 2);
  c.scale(cam.z, cam.z);
  if (cam.rot) c.rotate(cam.rot);
  c.translate(-cam.x, -cam.y);
}
export const CAM0: Cam = { x: W / 2, y: H / 2, z: 1 };
