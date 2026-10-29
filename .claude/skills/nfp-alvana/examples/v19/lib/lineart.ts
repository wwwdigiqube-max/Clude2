// Small illustrated props for the prologue: a book, a scroll, a balance scale, roots, a question mark, houses,
// trees, a river, birds, walking line-figures, a crack of light. Each takes a draw progress p (0..1) where it
// makes sense, so things build themselves on screen instead of popping in.
import { Ctx } from "./canvas";
import { clamp, ease, fbm, lerp, rgba, rng, TAU } from "./math";
import { arcPts, linePts, partial } from "./shape";

type P2 = [number, number];
/** default ink: white glowing lines on dark scenes; the prologue switches to dark ink on light ones */
export const INK = { color: "#ffffff", glow: 10 };
/** glowing line style; glow scales with the current transform so it looks the same at any zoom */
export function inkLine(c: Ctx, color = INK.color, width = 2.6, glow = INK.glow) {
  const m = c.getTransform();
  c.strokeStyle = color;
  c.lineWidth = width;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.shadowColor = color;
  c.shadowBlur = glow * Math.hypot(m.a, m.b);
}
const pl = (c: Ctx, pts: P2[], p: number) => partial(c, pts, 0, clamp(p));
const bez = (a: P2, b: P2, cc: P2, n = 24): P2[] => Array.from({ length: n + 1 }, (_, i) => {
  const u = i / n;
  return [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * cc[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * cc[1] + u * u * b[1]];
});

// ---------- the book ----------
/** an open book seen from the front (filled, warm paper). open 0..1 fans the pages; flip 0..1 turns one page right→left.
 *  Returns the right page box in local coords (for showing a picture on it). */
export function book(c: Ctx, x: number, y: number, s: number, open: number, flip: number, glowK = 0) {
  const W = 230 * open, Hh = 300;
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  // cover
  c.fillStyle = "#3a2149";
  c.beginPath();
  c.roundRect(-W - 16, -Hh / 2 - 10, 2 * W + 32, Hh + 28, 10);
  c.fill();
  // pages (curved toward the spine) with shading
  for (const sd of [-1, 1]) {
    const g = c.createLinearGradient(0, 0, sd * W, 0);
    g.addColorStop(0, "#d9c6a2");
    g.addColorStop(0.18, "#f6ead2");
    g.addColorStop(1, "#efe0c0");
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(0, -Hh / 2 + 8);
    c.quadraticCurveTo(sd * W * 0.5, -Hh / 2 - 8, sd * W, -Hh / 2);
    c.lineTo(sd * W, Hh / 2);
    c.quadraticCurveTo(sd * W * 0.5, Hh / 2 - 10, 0, Hh / 2 + 8);
    c.closePath();
    c.fill();
  }
  // text lines on the left page
  c.strokeStyle = rgba("#7a5a4a", 0.45 * open);
  c.lineWidth = 3;
  for (let i = 0; i < 9; i++) {
    const yy = -Hh / 2 + 120 + i * 18, l = (i === 8 ? 0.5 : 0.85) * W;
    c.beginPath();
    c.moveTo(-W * 0.1, yy);
    c.lineTo(-W * 0.1 - l * 0.8, yy);
    c.stroke();
  }
  // the turning page
  if (flip > 0 && flip < 1) {
    const e = ease.inOut(flip);
    const px = Math.cos(e * Math.PI) * W; // +W → −W
    const sh = 0.5 + 0.5 * Math.abs(Math.cos(e * Math.PI));
    c.fillStyle = `rgb(${Math.round(240 * sh + 10)},${Math.round(226 * sh + 10)},${Math.round(196 * sh + 10)})`;
    c.beginPath();
    c.moveTo(0, -Hh / 2 + 8);
    c.quadraticCurveTo(px * 0.5, -Hh / 2 - 30 * Math.sin(e * Math.PI), px, -Hh / 2 - 10 * Math.sin(e * Math.PI));
    c.lineTo(px, Hh / 2 - 10 * Math.sin(e * Math.PI));
    c.quadraticCurveTo(px * 0.5, Hh / 2 - 20 * Math.sin(e * Math.PI), 0, Hh / 2 + 8);
    c.closePath();
    c.fill();
  }
  if (glowK > 0) {
    c.globalCompositeOperation = "screen";
    const g = c.createRadialGradient(0, 0, 10, 0, 0, W + 120);
    g.addColorStop(0, rgba("#fff3d0", 0.7 * glowK));
    g.addColorStop(1, rgba("#fff3d0", 0));
    c.fillStyle = g;
    c.fillRect(-W - 140, -Hh / 2 - 140, 2 * W + 280, Hh + 280);
  }
  c.restore();
  return { x0: 14, y0: -Hh / 2 + 4, w: W - 22, h: Hh - 8 };
}

// ---------- the scroll ----------
/** a parchment scroll unrolling horizontally; write 0..1 draws the text lines; mess 0..1 scrambles them */
export function scroll(c: Ctx, x: number, y: number, w: number, h: number, open: number, write: number, mess: number, t: number) {
  const ww = w * ease.inOut(open);
  c.save();
  c.translate(x, y);
  const g = c.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, "#f3e2c0");
  g.addColorStop(1, "#e2c99c");
  c.fillStyle = g;
  c.fillRect(-ww / 2, -h / 2, ww, h);
  // rolled ends
  for (const sd of [-1, 1]) {
    const rx = sd * ww / 2;
    const rg = c.createLinearGradient(rx - 22, 0, rx + 22, 0);
    rg.addColorStop(0, "#b58a5a");
    rg.addColorStop(0.5, "#f0d6a8");
    rg.addColorStop(1, "#9a6c42");
    c.fillStyle = rg;
    c.beginPath();
    c.roundRect(rx - 22, -h / 2 - 22, 44, h + 44, 18);
    c.fill();
  }
  // text lines (right → left), scrambling into swirls when the reader gets confused (kept on the paper)
  c.beginPath();
  c.rect(-ww / 2, -h / 2, ww, h);
  c.clip();
  c.strokeStyle = "#5a3a2e";
  c.lineWidth = 4;
  c.lineCap = "round";
  const r = rng(12);
  for (let i = 0; i < 7; i++) {
    const yy = -h / 2 + 40 + i * ((h - 70) / 6);
    const len = (0.6 + r() * 0.3) * (ww - 90);
    const pts: P2[] = [];
    for (let j = 0; j <= 30; j++) {
      const u = j / 30;
      let px = ww / 2 - 50 - u * len, py = yy + Math.sin(u * 40 + i) * 3;
      if (mess > 0) {
        const a = mess * (fbm(u * 3 + i, t * 0.8 + i, 2) * 3 + i);
        const cx = 0, cy = 0;
        const dx = px - cx, dy = py - cy;
        const sw = mess * (0.6 + 0.4 * Math.sin(t * 2 + i));
        px = cx + (dx * Math.cos(a * sw) - dy * Math.sin(a * sw)) * (1 - 0.3 * mess);
        py = cy + (dx * Math.sin(a * sw) + dy * Math.cos(a * sw)) * (1 - 0.3 * mess);
      }
      pts.push([px, py]);
    }
    c.globalAlpha = clamp(open * 2 - 1);
    pl(c, pts, clamp(write * 7 - i));
  }
  c.restore();
}

// ---------- question mark ----------
export function qmark(c: Ctx, x: number, y: number, s: number, p: number, color = "#ffffff") {
  const pts = [...arcPts(0, -40, 40, Math.PI * 1.1, Math.PI * 2.3, 30), ...linePts(Math.cos(Math.PI * 2.3) * 40, -40 + Math.sin(Math.PI * 2.3) * 40, 0, 10, 0, 30)];
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  inkLine(c, color, 9, 18);
  pl(c, pts as P2[], p * 1.2);
  if (p > 0.85) {
    c.fillStyle = color;
    c.beginPath();
    c.arc(0, 62, 7 * clamp((p - 0.85) / 0.15), 0, TAU);
    c.fill();
  }
  c.restore();
}

// ---------- balance scale ----------
/** returns the two pan centres (left, right) in local coords so things can be dropped into them */
export function balance(c: Ctx, x: number, y: number, s: number, ang: number, p: number) {
  const span = 260;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const end = (sd: number): P2 => [sd * span * ca, -200 + sd * span * sa];
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  inkLine(c, INK.color, 4, INK.glow * 1.2);
  pl(c, linePts(-90, 160, 90, 160), p * 3);
  pl(c, linePts(0, 160, 0, -200), p * 3 - 0.5);
  pl(c, [end(-1), end(1)] as P2[], p * 3 - 1);
  const pans: P2[] = [];
  for (const sd of [-1, 1]) {
    const [ex, ey] = end(sd);
    const pan: P2 = [ex, ey + 150];
    pans.push(pan);
    pl(c, linePts(ex, ey, pan[0] - 70, pan[1]), p * 3 - 1.6);
    pl(c, linePts(ex, ey, pan[0] + 70, pan[1]), p * 3 - 1.6);
    pl(c, arcPts(pan[0], pan[1], 72, 0, Math.PI, 30) as P2[], p * 3 - 2);
  }
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.arc(0, -200, 9 * clamp(p * 3 - 1), 0, TAU);
  c.fill();
  c.restore();
  return pans.map(([px, py]) => [x + px * s, y + py * s] as P2);
}

// ---------- roots ----------
type Br = { pts: P2[]; d: number };
const ROOTS = new Map<number, Br[]>();
export function roots(c: Ctx, x: number, y: number, s: number, p: number, seed = 3, color = "#5a3a2e") {
  let brs = ROOTS.get(seed);
  if (!brs) {
    const r = rng(seed);
    brs = [];
    const grow = (x0: number, y0: number, a: number, len: number, d: number) => {
      if (d > 3 || len < 18) return;
      const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len;
      brs!.push({ pts: bez([x0, y0], [x1, y1], [(x0 + x1) / 2 + (r() - 0.5) * len * 0.4, (y0 + y1) / 2], 12), d });
      const n = d === 0 ? 3 : 2;
      for (let i = 0; i < n; i++) grow(x1, y1, a + (r() - 0.5) * 1.1, len * (0.55 + r() * 0.2), d + 1);
    };
    for (const a of [-0.3, 0, 0.3]) grow(0, 0, Math.PI / 2 + a, 90, 0);
    ROOTS.set(seed, brs);
  }
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  for (const b of brs) {
    inkLine(c, color, 5 - b.d, 0);
    pl(c, b.pts, p * 4 - b.d);
  }
  c.restore();
}

// ---------- little world: house, tree, birds, river, walker, crack ----------
export function house(c: Ctx, x: number, y: number, s: number, p: number, lit: number, t: number) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  inkLine(c);
  pl(c, linePts(-30, 0, -30, -36, 30, -36, 30, 0, -30, 0), p * 2);
  pl(c, linePts(-38, -34, 0, -62, 38, -34), p * 2 - 0.6);
  pl(c, linePts(-8, 0, -8, -18, 8, -18, 8, 0), p * 2 - 1);
  if (lit > 0) {
    c.fillStyle = rgba("#ffd28a", lit);
    c.shadowColor = "#ffd28a";
    c.fillRect(14, -28, 10, 10);
  }
  // chimney smoke
  if (p > 0.9) {
    c.shadowBlur = 0;
    c.strokeStyle = rgba("#ffffff", 0.5);
    c.lineWidth = 2;
    c.beginPath();
    for (let i = 0; i <= 20; i++) {
      const u = i / 20, yy = -50 - u * 50;
      const xx = 20 + Math.sin(u * 6 - t * 2) * 6 * u;
      i ? c.lineTo(xx, yy) : c.moveTo(xx, yy);
    }
    c.stroke();
  }
  c.restore();
}
export function tree(c: Ctx, x: number, y: number, s: number, p: number, t: number) {
  const sw = Math.sin(t * 1.2 + x) * 0.05;
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  inkLine(c);
  pl(c, linePts(0, 0, 0, -34), p * 2);
  c.rotate(sw);
  pl(c, arcPts(0, -52, 22, Math.PI / 2, Math.PI / 2 + TAU, 40) as P2[], p * 2 - 0.8);
  c.restore();
}
export function bird(c: Ctx, x: number, y: number, s: number, t: number, a = 1) {
  const f = Math.sin(t * 8) * 6;
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  inkLine(c, INK.color, 2.2, INK.glow * 0.6);
  c.globalAlpha *= a;
  c.beginPath();
  c.moveTo(-12, -f * 0.6);
  c.quadraticCurveTo(-6, -4 - f, 0, 0);
  c.quadraticCurveTo(6, -4 - f, 12, -f * 0.6);
  c.stroke();
  c.restore();
}
/** a river: two banks + flowing dashes */
export function river(c: Ctx, pts: P2[], t: number, p: number) {
  c.save();
  inkLine(c);
  pl(c, pts, p);
  c.setLineDash([10, 16]);
  c.lineDashOffset = -t * 30;
  c.globalAlpha *= 0.7;
  c.lineWidth = 2;
  pl(c, pts.map(([x, y]) => [x + 8, y + 6] as P2), p);
  c.restore();
}
/** a line-art person walking (or standing); look = head tilt up; wave = raised arm */
export function walker(c: Ctx, x: number, y: number, s: number, t: number, o: { walk?: number; face?: number; look?: number; wave?: number; jar?: boolean; alpha?: number } = {}) {
  const { walk = 1, face = 1, look = 0, wave = 0, jar = false, alpha = 1 } = o;
  const ph = t * 5 * walk;
  const leg = Math.sin(ph) * 7 * walk, bob = Math.abs(Math.cos(ph)) * 1.5 * walk;
  c.save();
  c.translate(x, y - bob);
  c.scale(s * face, s);
  c.globalAlpha *= alpha;
  inkLine(c, INK.color, 2.4, INK.glow * 0.8);
  c.beginPath();
  c.arc(look * 2, -46 - look * 1, 7, 0, TAU);
  c.stroke();
  pl(c, linePts(-5, -37, -11, -4, 11, -4, 5, -37), 1);
  pl(c, linePts(-4, -4, -4 + leg, 6), 1);
  pl(c, linePts(4, -4, 4 - leg, 6), 1);
  pl(c, linePts(5, -33, 12 + (wave > 0 ? 4 : -leg * 0.4), wave > 0 ? -33 - 22 * wave : -18), 1);
  if (jar) {
    c.beginPath();
    c.ellipse(1, -60, 7, 6, 0, 0, TAU);
    c.stroke();
  }
  c.restore();
}
/** a jagged crack of light from a to b with side branches */
export function crack(c: Ctx, a: P2, b: P2, p: number, seed = 5) {
  const r = rng(seed);
  const main: P2[] = [];
  for (let i = 0; i <= 14; i++) {
    const u = i / 14;
    main.push([lerp(a[0], b[0], u) + (i && i < 14 ? (r() - 0.5) * 26 : 0), lerp(a[1], b[1], u) + (i && i < 14 ? (r() - 0.5) * 30 : 0)]);
  }
  c.save();
  inkLine(c, "#fff6dc", 4, 22);
  pl(c, main, p);
  inkLine(c, "#fff6dc", 2, 14);
  for (let i = 3; i < 13; i += 3) {
    const [mx, my] = main[i];
    const br: P2[] = [[mx, my], [mx + (r() - 0.5) * 50, my + (r() < 0.5 ? -1 : 1) * (20 + r() * 30)], [mx + (r() - 0.5) * 70, my + (r() < 0.5 ? -1 : 1) * (40 + r() * 30)]];
    pl(c, br, (p - i / 14) * 4);
  }
  c.restore();
}
export const _la = { bez };
/** an eye of light that opens (open 0..1): lids, a bright iris, a fan of short rays */
export function eyeGlyph(c: Ctx, x: number, y: number, w: number, open: number, a: number) {
  if (a <= 0.002) return;
  const hgt = w * 0.45 * open;
  c.save();
  inkLine(c, "#ffffff", 4, 16);
  c.globalAlpha = a;
  c.beginPath();
  c.moveTo(x - w, y);
  c.quadraticCurveTo(x, y - hgt * 2, x + w, y);
  c.quadraticCurveTo(x, y + hgt * 2, x - w, y);
  c.stroke();
  if (open > 0.05) {
    c.fillStyle = "#ffffff";
    c.beginPath();
    c.arc(x, y, w * 0.18 * open, 0, TAU);
    c.fill();
    inkLine(c, "#ffffff", 2, 8);
    c.globalAlpha = a * open * 0.8;
    for (let i = 0; i < 9; i++) {
      const ang = -Math.PI * (0.15 + (i / 8) * 0.7);
      c.beginPath();
      c.moveTo(x + Math.cos(ang) * w * 0.75, y + Math.sin(ang) * (hgt + w * 0.33));
      c.lineTo(x + Math.cos(ang) * w * 1.05, y + Math.sin(ang) * (hgt + w * 0.66));
      c.stroke();
    }
  }
  c.restore();
}
/** soft rings of light travelling from (x0,y0) toward (x1,y1): a voice made visible */
export function voiceRings(c: Ctx, x0: number, y0: number, x1: number, y1: number, t: number, t0: number, dur = 3, n = 4) {
  if (t < t0 || t > t0 + dur + 1.4) return;
  const ang = Math.atan2(y1 - y0, x1 - x0);
  for (let i = 0; i < n; i++) {
    const ph = clamp((t - t0 - i * (dur / n)) / 1.4);
    if (ph <= 0 || ph >= 1) continue;
    c.save();
    c.translate(lerp(x0, x1, ph), lerp(y0, y1, ph));
    c.rotate(ang);
    inkLine(c, "#ffffff", 3, 12);
    c.globalAlpha = Math.sin(ph * Math.PI) * 0.9;
    c.beginPath();
    c.ellipse(0, 0, 12 + 10 * ph, 30 + 26 * ph, 0, -Math.PI / 2, Math.PI / 2);
    c.stroke();
    c.restore();
  }
}