// Atomic-age print kit (video 21, after the «atomic gardens» reference): a 1950s mid-century palette on grained
// paper; every flat shape printed with a coral (or teal) plate slightly out of register under it; atomic starbursts
// with dotted tips, four-point sparkles, boomerangs; the wavy wipe between colour fields; cream tags; and the cream
// caption card whose Persian words darken — keywords turn coral — the moment they are spoken.
import { Ctx, H, layer, scale, W } from "./canvas";
import { clamp, ease, hash, lerp, rgba, rng, TAU } from "./math";

export const P = {
  teal: "#2b998b",
  dteal: "#1e6c65",
  must: "#d5a136",
  coral: "#e0574a",
  cream: "#efe4cc",
  card: "#f4ecd9",
  aqua: "#86cfc4",
  olive: "#7c8a3d",
  ink: "#2a2420",
  gray: "#a49d91",
  brown: "#6b4a33",
  pink: "#f0857a",
  red: "#cf3f3b",
};
export const FA = "FA"; // Persian text: Vazirmatn 600/700/900 (loaded by demo/Video.tsx; any Persian font works)
export const NUM = "LZ"; // Lalezar — hero numbers and titles
export const LAT = "FR"; // Fredoka — the odd Latin label
const DIG = "۰۱۲۳۴۵۶۷۸۹";
/** Persian digits */
export const fa = (s: string | number) => String(s).replace(/[0-9]/g, (d) => DIG[+d]);

// ---------- paper ----------
let PAPERS: HTMLCanvasElement[] | null = null;
function makePapers() {
  PAPERS = [0, 1, 2].map((v) => {
    const cv = document.createElement("canvas");
    cv.width = 540;
    cv.height = 960;
    const x = cv.getContext("2d")!;
    const im = x.createImageData(540, 960);
    const r = rng(11 + v * 7);
    for (let i = 0; i < im.data.length; i += 4) {
      const n = 128 + (r() - 0.5) * 46 + (r() < 0.004 ? -60 : 0) + (r() < 0.003 ? 50 : 0);
      im.data[i] = im.data[i + 1] = im.data[i + 2] = n;
      im.data[i + 3] = 255;
    }
    x.putImageData(im, 0, 0);
    // fibres
    x.lineCap = "round";
    for (let i = 0; i < 900; i++) {
      const fx = r() * 540, fy = r() * 960, a = r() * TAU, l = 3 + r() * 14;
      x.strokeStyle = `rgba(${r() < 0.5 ? "70,70,70" : "200,200,200"},${0.18 + r() * 0.22})`;
      x.lineWidth = 0.6 + r() * 0.7;
      x.beginPath();
      x.moveTo(fx, fy);
      x.quadraticCurveTo(fx + Math.cos(a + 1) * l * 0.5, fy + Math.sin(a + 1) * l * 0.5, fx + Math.cos(a) * l, fy + Math.sin(a) * l);
      x.stroke();
    }
    // soft blotches (ink absorbed unevenly)
    for (let i = 0; i < 70; i++) {
      const g = x.createRadialGradient(0, 0, 0, 0, 0, 1);
      const bx = r() * 540, by = r() * 960, br = 20 + r() * 90;
      g.addColorStop(0, `rgba(${r() < 0.5 ? "0,0,0" : "255,255,255"},${0.05 + r() * 0.05})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      x.save();
      x.translate(bx, by);
      x.scale(br, br);
      x.fillStyle = g;
      x.fillRect(-1, -1, 2, 2);
      x.restore();
    }
    return cv;
  });
}
/** grained paper over everything below it (boils at 12 fps) */
export function paper(c: Ctx, t: number, amt = 0.55) {
  if (!PAPERS) makePapers();
  const p = PAPERS![Math.floor(t * 12) % 3];
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = "overlay";
  c.globalAlpha = amt;
  c.drawImage(p, 0, 0, c.canvas.width, c.canvas.height);
  c.globalCompositeOperation = "multiply";
  c.globalAlpha = amt * 0.18;
  c.drawImage(p, 0, 0, c.canvas.width, c.canvas.height);
  c.restore();
}
/** a flat colour field (the background of most shots) */
export function field(c: Ctx, col: string) {
  c.fillStyle = col;
  c.fillRect(0, 0, W, H);
}

// ---------- print helpers ----------
/** misregistration offset for this frame (the plates shift a hair at 12 fps) */
export const reg = (t: number, seed = 0): [number, number] => {
  const f = Math.floor(t * 12);
  return [4 + (hash(f * 3.1 + seed) - 0.5) * 1.6, 3.5 + (hash(f * 7.7 + seed) - 0.5) * 1.6];
};
/** fill a path as a print: coral plate offset under it, the colour, then the ink outline */
export function printed(c: Ctx, p: Path2D, fill: string, t: number, o: { plate?: string; line?: number; ink?: string; seed?: number; noPlate?: boolean } = {}) {
  const [dx, dy] = reg(t, o.seed ?? 0);
  if (!o.noPlate) {
    c.save();
    c.translate(dx, dy);
    c.fillStyle = o.plate ?? P.coral;
    c.globalAlpha *= 0.85;
    c.fill(p);
    c.restore();
  }
  c.fillStyle = fill;
  c.fill(p);
  if ((o.line ?? 3) > 0) {
    c.strokeStyle = o.ink ?? P.ink;
    c.lineWidth = o.line ?? 3;
    c.lineJoin = "round";
    c.lineCap = "round";
    c.stroke(p);
  }
}
/** scale for a pop-in: 0 → overshoot → 1 */
export function pop(t: number, t0: number, d = 0.32) {
  const u = (t - t0) / d;
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  return ease.outBack(u);
}
/** squash-and-stretch bounce on landing: returns [sx, sy] */
export function squash(t: number, t0: number, amt = 0.18, d = 0.35): [number, number] {
  const u = (t - t0) / d;
  if (u <= 0 || u >= 1) return [1, 1];
  const s = Math.sin(u * Math.PI * 2.5) * Math.exp(-u * 4) * amt;
  return [1 + s, 1 - s];
}

// ---------- decorations ----------
/** the film loops: decorations move on whole cycles of its length, so the last frame meets the first */
let LOOP = 0;
export const setLoop = (T: number) => (LOOP = T);
const ph = (t: number, cycles: number) => (LOOP ? (t / LOOP) * cycles * TAU : t * cycles * 0.1);
/** atomic starburst: rays of two lengths ending in dots */
export function starburst(c: Ctx, x: number, y: number, r: number, col: string, rot = 0, n = 8, lw = 3) {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  c.strokeStyle = col;
  c.fillStyle = col;
  c.lineWidth = lw;
  c.lineCap = "round";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU, L = i % 2 ? r * 0.62 : r;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(Math.cos(a) * L, Math.sin(a) * L);
    c.stroke();
    c.beginPath();
    c.arc(Math.cos(a) * L, Math.sin(a) * L, lw * 1.25, 0, TAU);
    c.fill();
  }
  c.beginPath();
  c.arc(0, 0, lw * 1.4, 0, TAU);
  c.fill();
  c.restore();
}
/** four-point sparkle (concave diamond) as a path */
export function sparklePath(x: number, y: number, r: number, k = 0.28, rot = 0) {
  const p = new Path2D();
  for (let i = 0; i < 4; i++) {
    const a = rot + (i / 4) * TAU - Math.PI / 2, b = a + TAU / 8;
    const ox = x + Math.cos(a) * r, oy = y + Math.sin(a) * r;
    const ix = x + Math.cos(b) * r * k, iy = y + Math.sin(b) * r * k;
    if (i === 0) p.moveTo(ox, oy);
    else p.lineTo(ox, oy);
    p.lineTo(ix, iy);
  }
  p.closePath();
  return p;
}
/** many-pointed star burst (the zap / the 1949 sticker) as a path */
export function burstPath(x: number, y: number, r: number, n = 12, inner = 0.62, rot = 0, jag = 0) {
  const p = new Path2D();
  const rr = rng(n * 13 + 1);
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i / (n * 2)) * TAU;
    const R = (i % 2 ? r * inner : r) * (1 + (rr() - 0.5) * jag);
    if (i === 0) p.moveTo(x + Math.cos(a) * R, y + Math.sin(a) * R);
    else p.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R);
  }
  p.closePath();
  return p;
}
/** boomerang: a fat crescent with pointed ends */
export function boomerang(c: Ctx, x: number, y: number, s: number, rot: number, col: string) {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  c.scale(s, s);
  c.fillStyle = col;
  c.beginPath();
  c.moveTo(-1, 0.1);
  c.quadraticCurveTo(-0.15, -0.95, 1, -0.35);
  c.quadraticCurveTo(0.05, -0.45, -1, 0.1);
  c.closePath();
  c.fill();
  c.restore();
}
/** the persistent corner decorations of the reference (starbursts + boomerangs), alive: they bob and twinkle */
export function deco(c: Ctx, t: number, a = 1, cols: { a: string; b: string; c: string } = { a: P.must, b: P.coral, c: P.cream }) {
  if (a <= 0) return;
  c.save();
  c.globalAlpha *= a;
  const bob = (i: number) => Math.sin(ph(t, 12) + i * 1.7) * 6;
  starburst(c, 130, 165 + bob(0), 78, cols.a, ph(t, 2), 8, 3.6);
  boomerang(c, 905, 160 + bob(1), 74, 0.5 + Math.sin(ph(t, 8)) * 0.12, cols.b);
  boomerang(c, 150, 1700 + bob(2), 66, -2.4 + Math.sin(ph(t, 7) + 1) * 0.12, cols.a);
  starburst(c, 930, 1715 + bob(3), 86, cols.c, -ph(t, 2), 8, 3.6);
  starburst(c, 330, 1815 + bob(4), 40, cols.b, ph(t, 4), 8, 2.8);
  // twinkles
  for (const [x, y, s, phs] of [[230, 100, 1, 0], [860, 290, 0.8, 2], [70, 1560, 0.9, 4], [1010, 1560, 0.7, 1]] as const) {
    const tw = 0.5 + 0.5 * Math.sin(ph(t, 22) + phs);
    c.fillStyle = cols.c;
    c.globalAlpha = a * (0.35 + 0.65 * tw);
    c.fill(sparklePath(x, y + bob(5), 22 * s * (0.75 + 0.35 * tw)));
  }
  c.restore();
}
/** soft drifting pollen / dust motes (adds air to the flat fields) */
export function motes(c: Ctx, t: number, n = 26, col = "#ffffff", alpha = 0.35, seed = 3) {
  const r = rng(seed);
  c.save();
  for (let i = 0; i < n; i++) {
    const x0 = r() * W, y0 = r() * H, laps = 1 + Math.floor(r() * 2), p0 = r() * TAU, s = 1.5 + r() * 2.5;
    const x = (x0 + Math.sin(ph(t, 4) + p0) * 30 + 2000) % W, y = (((y0 - (LOOP ? (t / LOOP) * laps * H : t * 12)) % H) + H) % H;
    c.globalAlpha = alpha * (0.4 + 0.6 * Math.abs(Math.sin(ph(t, 9) + p0)));
    c.fillStyle = col;
    c.beginPath();
    c.arc(x, y, s, 0, TAU);
    c.fill();
  }
  c.restore();
}

// ---------- the wavy wipe ----------
/** region covered by the incoming shot: a wavy vertical edge sweeping right → left (dir 1) or left → right (−1) */
export function wavePath(p: number, dir = 1, phase = 0) {
  const path = new Path2D();
  const e = ease.inOut(clamp(p));
  const x0 = dir > 0 ? lerp(W + 140, -140, e) : lerp(-140, W + 140, e);
  const edge = (y: number) => x0 + Math.sin(y / 260 + phase) * 70 + Math.sin(y / 97 + phase * 2) * 18;
  if (dir > 0) {
    path.moveTo(W + 200, -10);
    for (let y = -10; y <= H + 10; y += 24) path.lineTo(edge(y), y);
    path.lineTo(W + 200, H + 10);
  } else {
    path.moveTo(-200, -10);
    for (let y = -10; y <= H + 10; y += 24) path.lineTo(edge(y), y);
    path.lineTo(-200, H + 10);
  }
  path.closePath();
  return path;
}

// ---------- type ----------
export type FaOpt = { size: number; weight?: 600 | 700 | 900; color?: string; align?: CanvasTextAlign; alpha?: number; plate?: string | null; t?: number };
export function faText(c: Ctx, s: string, x: number, y: number, o: FaOpt) {
  if ((o.alpha ?? 1) <= 0.003 || !s) return;
  c.save();
  c.globalAlpha *= clamp(o.alpha ?? 1);
  c.font = `${o.weight ?? 700} ${o.size}px ${FA}`;
  c.direction = "rtl";
  c.textAlign = o.align ?? "center";
  c.textBaseline = "middle";
  if (o.plate) {
    const [dx, dy] = reg(o.t ?? 0, s.length);
    c.fillStyle = o.plate;
    c.fillText(s, x + dx * 0.7, y + dy * 0.7);
  }
  c.fillStyle = o.color ?? P.ink;
  c.fillText(s, x, y);
  c.restore();
}
export function faWidth(c: Ctx, s: string, size: number, weight = 700) {
  c.save();
  c.font = `${weight} ${size}px ${FA}`;
  c.direction = "rtl";
  const w = c.measureText(s).width;
  c.restore();
  return w;
}
/** hero number (Lalezar), ink with the coral plate under it */
export function bigNum(c: Ctx, s: string, x: number, y: number, size: number, t: number, o: { color?: string; plate?: string; alpha?: number } = {}) {
  if ((o.alpha ?? 1) <= 0.003) return;
  const [dx, dy] = reg(t, 9);
  c.save();
  c.globalAlpha *= clamp(o.alpha ?? 1);
  c.font = `${size}px ${NUM}`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.direction = "rtl";
  c.fillStyle = o.plate ?? P.coral;
  c.fillText(s, x + dx * 1.6, y + dy * 1.6);
  c.fillStyle = o.color ?? P.ink;
  c.fillText(s, x, y);
  c.restore();
}
/** cream tag (pill) with ink outline and a coral plate — labels in the scene */
export function tag(c: Ctx, s: string, x: number, y: number, a: number, t: number, o: { size?: number; fill?: string; color?: string; rot?: number } = {}) {
  if (a <= 0.01) return;
  const size = o.size ?? 40;
  const w = faWidth(c, s, size, 700) + size * 1.1, h = size * 1.55;
  c.save();
  c.translate(x, y);
  c.rotate(o.rot ?? 0);
  c.scale(a, a); // a = the pop value (overshoots past 1)
  c.globalAlpha *= clamp(a * 3);
  const p = new Path2D();
  p.roundRect(-w / 2, -h / 2, w, h, h * 0.32);
  printed(c, p, o.fill ?? P.card, t, { line: 2.6, seed: s.length });
  faText(c, s, 0, 2, { size, weight: 700, color: o.color ?? P.ink });
  c.restore();
}

// ---------- the caption card ----------
export type CapWord = { w: string; kw: boolean; s: number; e: number };
export type Chunk = { words: CapWord[]; s: number; e: number };
const CAP = { size: 62, maxW: 780, lineH: 80, y: 1236 };
/** lay a chunk out right-to-left in up to two rows; returns rows of [word, width] */
function layout(c: Ctx, words: CapWord[]) {
  const sp = faWidth(c, " ", CAP.size) * 1.15;
  const rows: { ws: CapWord[]; widths: number[]; w: number }[] = [{ ws: [], widths: [], w: 0 }];
  for (const wd of words) {
    const ww = faWidth(c, wd.w, CAP.size);
    let row = rows[rows.length - 1];
    if (row.ws.length && row.w + sp + ww > CAP.maxW) {
      row = { ws: [], widths: [], w: 0 };
      rows.push(row);
    }
    row.w += (row.ws.length ? sp : 0) + ww;
    row.ws.push(wd);
    row.widths.push(ww);
  }
  // balance two rows: move words down while the first row is much longer
  if (rows.length === 2) {
    const [a, b] = rows;
    while (a.ws.length > 1 && a.w - b.w > a.widths[a.widths.length - 1] + sp) {
      const ww = a.widths.pop()!, wd = a.ws.pop()!;
      a.w -= ww + sp;
      b.ws.unshift(wd);
      b.widths.unshift(ww);
      b.w += ww + sp;
    }
  }
  return { rows, sp };
}
/** the caption card: pops in with each chunk; words darken as spoken (keywords coral), unspoken words stay grey */
export function caption(c: Ctx, ch: Chunk | null, t: number, y = CAP.y) {
  if (!ch) return;
  const inA = pop(t, ch.s - 0.12, 0.28), out = clamp((t - ch.e) / 0.12);
  if (inA <= 0 || out >= 1) return;
  const { rows, sp } = layout(c, ch.words);
  const wMax = Math.max(...rows.map((r) => r.w));
  const bw = wMax + 64, bh = rows.length * CAP.lineH + 34;
  c.save();
  c.translate(540, y);
  c.scale(inA * (1 - 0.1 * out), inA * (1 - 0.1 * out));
  c.globalAlpha *= 1 - out;
  const p = new Path2D();
  p.roundRect(-bw / 2, -bh / 2, bw, bh, 16);
  printed(c, p, P.card, t, { line: 3, seed: 5 });
  c.font = `700 ${CAP.size}px ${FA}`;
  c.direction = "rtl";
  c.textAlign = "right";
  c.textBaseline = "middle";
  rows.forEach((row, ri) => {
    let x = row.w / 2;
    const yy = -((rows.length - 1) * CAP.lineH) / 2 + ri * CAP.lineH + 3;
    row.ws.forEach((wd, i) => {
      const said = t >= wd.s - 0.04;
      const hot = said && t < wd.e + 0.1;
      c.fillStyle = !said ? P.gray : wd.kw ? P.coral : P.ink;
      c.save();
      if (hot) {
        // the word being spoken lifts a hair
        c.translate(x - row.widths[i] / 2, yy);
        c.scale(1.05, 1.05);
        c.translate(-(x - row.widths[i] / 2), -yy);
      }
      c.fillText(wd.w, x, yy);
      c.restore();
      x -= row.widths[i] + sp;
    });
  });
  c.restore();
}
/** a soft dark wash so the card reads on a busy illustration */
export function shade(c: Ctx, y0: number, y1: number, a: number) {
  const g = c.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, rgba("#000000", 0));
  g.addColorStop(0.5, rgba("#000000", a));
  g.addColorStop(1, rgba("#000000", 0));
  c.fillStyle = g;
  c.fillRect(0, y0, W, y1 - y0);
}
export { layer, scale };
