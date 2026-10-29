// Persian titles: mixed weights, revealed by a right→left soft sweep + blur-to-sharp (never split letters: shaping stays intact).
import { blur, Ctx, layer, matchTransform, paint, scale } from "./canvas";
import { clamp, mixHex, rgba, ss } from "./math";

/** the director turns titles off while it re-uses a scene inside a portal */
export const textOff = { v: false };

/** font roles (families registered by DocCanvas; files configurable there) */
export const F = { light: "DocLight", semi: "DocSemi", bold: "DocBold", heavy: "DocHeavy" };
export type Seg = { s: string; f?: string; c?: string };
export type TitleOpt = {
  size: number;
  k: number; // reveal 0..1
  out?: number; // 0..1 fade/blur away
  color?: string; // omit → ink follows the background (dark on light, white on dark)
  glow?: number;
  shade?: number; // soft dark under-shadow for bright backgrounds
  align?: "center" | "right" | "left";
  gap?: number;
  alpha?: number;
};
function measure(c: Ctx, segs: Seg[], size: number, gap: number) {
  let w = 0;
  const ws = segs.map((s) => {
    c.font = `${size}px ${s.f ?? F.semi}`;
    const m = c.measureText(s.s).width;
    w += m;
    return m;
  });
  return { ws, w: w + gap * (segs.length - 1) };
}
export function title(ctx: Ctx, segs: Seg[], x: number, y: number, o: TitleOpt) {
  const { size, k, out = 0, glow = 22, align = "center", alpha = 1 } = o;
  if (textOff.v || k <= 0.001 || out >= 0.999 || alpha <= 0.001) return;
  const gap = o.gap ?? size * 0.28;
  const L = layer("txt");
  matchTransform(L, ctx); // titles follow the caller's transform (e.g. a falling, rotating name)
  const { ws, w } = measure(L, segs, size, gap);
  const xR = align === "center" ? x + w / 2 : align === "right" ? x : x + w;
  const xL = xR - w;
  const R = scale();
  // ink from what is already painted under the title: continuous, so it never flickers between frames
  const lum = lumUnder(ctx, xL - size * 0.2, y - size * 0.6, w + size * 0.4, size * 1.2);
  const ink = o.color ? 0 : ss(0.64, 0.68, lum); // narrow band: almost never a grey in-between ink; mid tones get white + shade
  const color = o.color ?? mixHex("#ffffff", "#25142f", ink);
  const shade = Math.max(o.shade ?? 0, 0.85 * ss(0.3, 0.6, lum)) * (1 - ink);
  L.textBaseline = "middle";
  L.direction = "rtl";
  L.textAlign = "right";
  if (shade > 0) {
    L.save();
    L.shadowColor = rgba("#1a0f22", shade);
    L.shadowBlur = size * 0.5 * R;
    // draw far off-canvas, keep only the shadow (offset brings it back under the text)
    const OFF = 6000;
    const m = L.getTransform(); // shadow offsets are in device pixels
    L.shadowOffsetX = -OFF * m.a;
    L.shadowOffsetY = -OFF * m.b + size * 0.06 * R;
    let cx = xR;
    segs.forEach((s, i) => {
      L.font = `${size}px ${s.f ?? F.semi}`;
      L.fillStyle = "#1a0f22";
      L.fillText(s.s, cx + OFF, y);
      cx -= ws[i] + gap;
    });
    L.restore();
  }
  L.save();
  // white ink glows; dark ink gets a soft light halo that lifts it off the background
  L.shadowColor = ink > 0.5 ? rgba("#fff6ea", 0.75 * ink) : rgba(color, 0.55);
  L.shadowBlur = (ink > 0.5 ? size * 0.35 : glow) * R;
  let cx = xR;
  segs.forEach((s, i) => {
    L.font = `${size}px ${s.f ?? F.semi}`;
    L.fillStyle = s.c ?? color;
    L.fillText(s.s, cx, y);
    cx -= ws[i] + gap;
  });
  L.restore();
  // sweep mask (reading direction: right → left)
  if (k < 0.999) {
    const Fz = size * 1.2;
    const front = xR + Fz - k * (w + 2 * Fz);
    const g = L.createLinearGradient(front + Fz, 0, front - Fz, 0);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    L.save();
    L.globalCompositeOperation = "destination-in";
    L.fillStyle = g;
    L.fillRect(xL - size * 2, y - size * 2, w + size * 4, size * 4);
    L.restore();
  }
  const bl = (1 - clamp(k * 1.25)) * size * 0.22 + out * size * 0.3;
  paint(ctx, L, alpha * (1 - out), "source-over", blur(bl));
}
/** width of a title (for layout / strike lines) */
export function titleWidth(segs: Seg[], size: number, gap?: number) {
  const L = layer("txtm", 0.05);
  return measure(L, segs, size, gap ?? size * 0.28).w;
}
/** mean luminance (0..1) of the painted pixels in a design-space box of ctx */
function lumUnder(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const m = ctx.getTransform();
  const xs = [x, x + w].map((a) => a * m.a + m.e), ys = [y, y + h].map((b) => b * m.d + m.f);
  const x0 = Math.max(0, Math.floor(Math.min(...xs))), x1 = Math.min(ctx.canvas.width, Math.ceil(Math.max(...xs)));
  const y0 = Math.max(0, Math.floor(Math.min(...ys))), y1 = Math.min(ctx.canvas.height, Math.ceil(Math.max(...ys)));
  if (x1 - x0 < 2 || y1 - y0 < 2) return 0;
  const d = ctx.getImageData(x0, y0, x1 - x0, y1 - y0).data;
  let s = 0, n = 0;
  for (let i = 0; i < d.length; i += 4 * 7) {
    s += (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
    n++;
  }
  return n ? s / n : 0;
}