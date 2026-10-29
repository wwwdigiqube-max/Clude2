// English HUD typography (Chakra Petch — Alvana's English face) + HUD furniture: boxes, brackets, tick ladders,
// arrows, typed labels with a glitchy cursor (img17: «DEA|K_»), scrambled text (decode effect).
import { Ctx, scale } from "./canvas";
import { clamp, hash, rgba } from "./math";

export const FAMILY = "CP";
export type TxtOpt = {
  size: number;
  weight?: 300 | 400 | 500 | 600 | 700;
  /** letter spacing in em */
  ls?: number;
  align?: CanvasTextAlign;
  base?: CanvasTextBaseline;
  color?: string;
  alpha?: number;
  /** glow radius (design px) */
  glow?: number;
  glowColor?: string;
};
export function setFont(c: Ctx, o: TxtOpt) {
  c.font = `${o.weight ?? 500} ${o.size}px ${FAMILY}`;
  c.letterSpacing = `${((o.ls ?? 0) * o.size).toFixed(1)}px`;
  c.textAlign = o.align ?? "left";
  c.textBaseline = o.base ?? "middle";
}
export function txt(c: Ctx, s: string, x: number, y: number, o: TxtOpt) {
  if ((o.alpha ?? 1) <= 0.003 || !s) return;
  c.save();
  setFont(c, o);
  c.globalAlpha *= clamp(o.alpha ?? 1);
  c.fillStyle = o.color ?? "#ffffff";
  if (o.glow) {
    c.shadowColor = o.glowColor ?? o.color ?? "#ffffff";
    c.shadowBlur = o.glow * scale();
  }
  c.fillText(s, x, y);
  c.restore();
}
export function txtWidth(c: Ctx, s: string, o: TxtOpt) {
  c.save();
  setFont(c, o);
  const w = c.measureText(s).width;
  c.restore();
  return w;
}
const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&/\\|<>_=+*";
/** decode effect: p 0..1 → characters lock in left→right; the rest flicker through random glyphs */
export function scramble(s: string, p: number, t: number, seed = 1) {
  const n = s.length, locked = Math.floor(clamp(p) * n);
  let o = "";
  for (let i = 0; i < n; i++) {
    if (i < locked || s[i] === " ") o += s[i];
    else if (i < locked + 4) o += GLYPHS[Math.floor(hash(i * 13 + seed * 7 + Math.floor(t * 24)) * GLYPHS.length)];
  }
  return o;
}
/** img17 label: typed left→right; while typing the last glyph glitches and a block cursor follows («DEAD CEL|X_») */
export function typedLabel(c: Ctx, s: string, x: number, y: number, p: number, t: number, o: TxtOpt & { cursor?: boolean; seed?: number }) {
  if (p <= 0) return;
  const n = s.length, shown = Math.min(n, Math.floor(clamp(p) * (n + 2)));
  let str = s.slice(0, shown);
  const typing = shown < n;
  if (typing && shown > 0) str = str.slice(0, -1) + "|" + GLYPHS[Math.floor(hash(shown * 31 + Math.floor(t * 20) + (o.seed ?? 0)) * 26)];
  const blink = Math.floor(t * 3.2) % 2 === 0;
  if ((o.cursor ?? true) && (typing || (blink && p < 1.6))) str += "_";
  txt(c, str, x, y, o);
}
/** thin HUD rectangle (optionally filled), drawn on as `p` goes 0→1 (perimeter trace) */
export function hudBox(c: Ctx, x: number, y: number, w: number, h: number, o: { p?: number; color?: string; lw?: number; alpha?: number; fill?: string; glow?: number } = {}) {
  const p = clamp(o.p ?? 1);
  if (p <= 0 || (o.alpha ?? 1) <= 0.003) return;
  c.save();
  c.globalAlpha *= o.alpha ?? 1;
  if (o.fill && p >= 1) {
    c.fillStyle = o.fill;
    c.fillRect(x, y, w, h);
  }
  c.strokeStyle = o.color ?? "#ffffff";
  c.lineWidth = o.lw ?? 2;
  if (o.glow) {
    c.shadowColor = o.color ?? "#ffffff";
    c.shadowBlur = o.glow * scale();
  }
  const per = 2 * (w + h), L = per * p;
  const pts: [number, number][] = [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
  c.beginPath();
  c.moveTo(x, y);
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const seg = Math.hypot(bx - ax, by - ay);
    if (acc + seg <= L) c.lineTo(bx, by);
    else {
      const f = (L - acc) / seg;
      c.lineTo(ax + (bx - ax) * f, ay + (by - ay) * f);
      break;
    }
    acc += seg;
  }
  c.stroke();
  c.restore();
}
/** corner brackets around a rectangle */
export function brackets(c: Ctx, x: number, y: number, w: number, h: number, len: number, o: { color?: string; lw?: number; alpha?: number } = {}) {
  c.save();
  c.globalAlpha *= o.alpha ?? 1;
  c.strokeStyle = o.color ?? "#ffffff";
  c.lineWidth = o.lw ?? 3;
  for (const [cx, cy, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]] as const) {
    c.beginPath();
    c.moveTo(cx, cy + sy * len);
    c.lineTo(cx, cy);
    c.lineTo(cx + sx * len, cy);
    c.stroke();
  }
  c.restore();
}
/** vertical tick ladder (img19 side scales) */
export function ticks(c: Ctx, x: number, y: number, h: number, n: number, o: { side?: 1 | -1; len?: number; alpha?: number; lw?: number; hot?: number } = {}) {
  c.save();
  c.globalAlpha *= o.alpha ?? 1;
  c.strokeStyle = "#ffffff";
  c.lineWidth = o.lw ?? 2;
  for (let i = 0; i < n; i++) {
    const yy = y + (h * i) / (n - 1), big = i % 4 === 0, hot = o.hot !== undefined && Math.abs(i - o.hot) < 0.5;
    c.globalAlpha = (o.alpha ?? 1) * (hot ? 1 : 0.7);
    c.beginPath();
    c.moveTo(x, yy);
    c.lineTo(x + (o.side ?? 1) * (o.len ?? 18) * (big ? 1.4 : 1) * (hot ? 1.6 : 1), yy);
    c.stroke();
  }
  c.restore();
}
/** small chevron arrow (img19 red markers); dir = angle in radians (0 = pointing right) */
export function chevron(c: Ctx, x: number, y: number, size: number, dir: number, color = "#ff3b30", alpha = 1, lw = 4) {
  if (alpha <= 0.003) return;
  c.save();
  c.translate(x, y);
  c.rotate(dir);
  c.globalAlpha *= alpha;
  c.strokeStyle = color;
  c.lineWidth = lw;
  c.lineJoin = "miter";
  c.shadowColor = color;
  c.shadowBlur = 10 * scale();
  c.beginPath();
  c.moveTo(-size * 0.5, -size);
  c.lineTo(size * 0.5, 0);
  c.lineTo(-size * 0.5, size);
  c.stroke();
  c.restore();
}
/** a line with a dot at the start (img17 callouts) drawn on 0→1 */
export function callout(c: Ctx, x0: number, y0: number, x1: number, y1: number, p: number, alpha = 1) {
  if (p <= 0) return;
  const q = clamp(p);
  c.save();
  c.globalAlpha *= alpha;
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.arc(x0, y0, 4.5, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = rgba("#ffffff", 0.85);
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(x0, y0);
  c.lineTo(x0 + (x1 - x0) * q, y0 + (y1 - y0) * q);
  c.stroke();
  c.restore();
}
