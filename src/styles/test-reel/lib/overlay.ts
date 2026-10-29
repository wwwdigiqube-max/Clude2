// r8's reel frame over the whole video: a thin border, small type in the corners, a caption and a style counter
// that ticks up every time the picture switches to a new style (the video's claim, counted on screen).
// Each block of type reads the picture under it and picks its own ink (white on dark, near-black on light paper or
// a light sky, white with a soft shade on mid tones) — so it stays legible on every style without hand-made cues.
import { Ctx } from "./canvas";
import { clamp, mixHex, rgba } from "./math";
import { txt } from "./hud";

/** the reel frame's fixed type — your brand goes here (the corners and the line above the counter) */
export const REEL_LABELS = { brand: "ALVANA", sub: "CREATIVE LAB · 2026", title: "TEST REEL", part: "PT.01", claim: "EVERY MOMENT · A DIFFERENT STYLE" };
export type StyleMark = [number, string];
let MARKS: StyleMark[] = [];
/** register when each style starts (sorted by time) */
export const setStyleMarks = (m: StyleMark[]) => (MARKS = [...m].sort((a, b) => a[0] - b[0]));
const tc = (t: number) => {
  const s = Math.floor(t), f = Math.floor((t - s) * 30);
  return `00:${String(s).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
};
const ss = (a: number, b: number, x: number) => {
  const u = clamp((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
/** mean luminance of a design-space box of what is already on the canvas */
function lumAt(c: Ctx, x: number, y: number, w: number, h: number) {
  const m = c.getTransform();
  const x0 = Math.max(0, Math.floor(x * m.a + m.e)), y0 = Math.max(0, Math.floor(y * m.d + m.f));
  const x1 = Math.min(c.canvas.width, Math.ceil((x + w) * m.a + m.e)), y1 = Math.min(c.canvas.height, Math.ceil((y + h) * m.d + m.f));
  if (x1 - x0 < 2 || y1 - y0 < 2) return 0;
  const d = c.getImageData(x0, y0, x1 - x0, y1 - y0).data;
  let s = 0, n = 0;
  for (let i = 0; i < d.length; i += 4 * 7) {
    s += (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
    n++;
  }
  return n ? s / n : 0;
}
/** ink for a block: colour + a soft dark shade under white ink on mid tones */
function inkOf(lum: number) {
  const dark = ss(0.52, 0.64, lum);
  return { color: mixHex("#ffffff", "#141414", dark), shade: 0.6 * ss(0.22, 0.5, lum) * (1 - dark) };
}
export function reelFrame(c: Ctx, t: number, alpha = 1) {
  const a = alpha * clamp(t / 0.6);
  if (a <= 0.01) return;
  const lTL = lumAt(c, 56, 166, 290, 58), lTR = lumAt(c, 734, 166, 290, 58), lB = lumAt(c, 330, 1674, 420, 120);
  const iTL = inkOf(lTL), iTR = inkOf(lTR), iB = inkOf(lB), iF = inkOf((lTL + lTR + lB) / 3);
  const idx = MARKS.filter(([t0]) => t >= t0).length;
  const name = MARKS[Math.max(0, idx - 1)]?.[1] ?? "";
  c.save();
  c.globalAlpha = a;
  c.strokeStyle = iF.color;
  c.globalAlpha = a * 0.42;
  c.lineWidth = 1.5;
  c.strokeRect(34, 34, 1012, 1852);
  // notches (r8)
  c.beginPath();
  for (const [x, y, dx, dy] of [[540, 34, 0, 14], [540, 1886, 0, -14], [34, 960, 14, 0], [1046, 960, -14, 0]] as const) {
    c.moveTo(x, y);
    c.lineTo(x + dx, y + dy);
  }
  c.stroke();
  c.restore();
  const o = (k: { color: string; shade: number }, al: number) => ({ color: k.color, alpha: al * a, glow: k.shade > 0.02 ? 10 : 0, glowColor: rgba("#000000", k.shade) });
  txt(c, REEL_LABELS.brand, 64, 186, { size: 22, weight: 700, ls: 0.32, ...o(iTL, 0.82) });
  txt(c, REEL_LABELS.sub, 64, 212, { size: 15, weight: 500, ls: 0.18, ...o(iTL, 0.6) });
  txt(c, REEL_LABELS.title, 1016, 186, { size: 22, weight: 700, ls: 0.32, align: "right", ...o(iTR, 0.82) });
  txt(c, REEL_LABELS.part, 1016, 212, { size: 15, weight: 500, ls: 0.18, align: "right", ...o(iTR, 0.6) });
  txt(c, REEL_LABELS.claim, 540, 1690, { size: 17, weight: 600, ls: 0.28, align: "center", ...o(iB, 0.82) });
  // style counter: the number punches up when it changes
  const t0 = MARKS[Math.max(0, idx - 1)]?.[0] ?? 0;
  const hit = Math.exp(-(t - t0) / 0.18);
  txt(c, `STYLE ${String(Math.max(1, idx)).padStart(2, "0")}/${String(MARKS.length).padStart(2, "0")}`, 540 - 16, 1724, { size: 17 + 5 * hit, weight: 700, ls: 0.16, align: "right", ...o(iB, 0.85 + 0.15 * hit) });
  txt(c, name, 540 + 16, 1724, { size: 15, weight: 500, ls: 0.2, ...o(iB, 0.65) });
  txt(c, tc(t), 540, 1754, { size: 14, weight: 500, ls: 0.2, align: "center", ...o(iB, 0.55) });
  // three small glyphs (r8 bottom icons)
  c.save();
  c.globalAlpha = 0.55 * a;
  c.strokeStyle = iB.color;
  c.fillStyle = iB.color;
  c.lineWidth = 1.5;
  c.beginPath();
  c.arc(498, 1784, 6, 0, Math.PI * 2);
  c.stroke();
  c.strokeRect(534, 1778, 12, 12);
  c.beginPath();
  c.moveTo(576, 1778);
  c.lineTo(588, 1784);
  c.lineTo(576, 1790);
  c.closePath();
  c.fill();
  c.restore();
}
