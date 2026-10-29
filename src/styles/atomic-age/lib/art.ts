// Drawn props for video 21, all in the reference's mid-century print look (flat fills, ink outline, coral plate):
// seedlings that grow / sway / wilt / mutate, the garden plate with rings of sprouts around the cobalt pole, the
// gamma capsule, DNA beads, a 24-hour dial, grapefruit halves, the seed packet, envelopes, isotype seeds, barley,
// the radiation sign, and a stylised map of the USA.
import { Ctx } from "./canvas";
import { clamp, ease, hash, lerp, mixHex, rgba, rng, TAU } from "./math";
import { burstPath, faText, P, printed, sparklePath } from "./retro";

// ---------- plants ----------
export type PlantOpt = { grow?: number; sway?: number; wilt?: number; mutate?: number; seed?: number; soil?: boolean; t?: number };
function leafPath(len: number, wid: number) {
  const p = new Path2D();
  p.moveTo(0, 0);
  p.quadraticCurveTo(len * 0.45, -wid, len, 0);
  p.quadraticCurveTo(len * 0.45, wid, 0, 0);
  p.closePath();
  return p;
}
/** a seedling: curved stem, three pairs of almond leaves (teal / olive) with veins, a bud; (x, y) = soil line */
export function plant(c: Ctx, x: number, y: number, s: number, o: PlantOpt = {}) {
  const grow = clamp(o.grow ?? 1), wilt = clamp(o.wilt ?? 0), mut = clamp(o.mutate ?? 0), t = o.t ?? 0;
  const seed = o.seed ?? 1;
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  if (o.soil !== false) {
    const sp = new Path2D();
    sp.moveTo(-58, 2);
    sp.bezierCurveTo(-40, -22, 40, -22, 58, 2);
    sp.closePath();
    printed(c, sp, P.brown, t, { line: 2.4, plate: "#3b2a1e", seed });
    c.fillStyle = rgba("#000000", 0.25);
    for (let i = 0; i < 9; i++) {
      const r = hash(seed * 31 + i);
      c.beginPath();
      c.arc(-40 + r * 80, -6 - hash(i * 7 + seed) * 8, 2.2, 0, TAU);
      c.fill();
    }
  }
  if (grow <= 0) {
    c.restore();
    return;
  }
  const H = 210 * ease.out(grow);
  const sway = (o.sway ?? 0) + Math.sin(t * 1.6 + seed) * 0.035;
  const droop = wilt * 1.1;
  // stem: bends with sway; wilting bows it over
  const tipX = Math.sin(sway) * H * 0.4 + droop * 60, tipY = -H * (1 - wilt * 0.35);
  const stem = new Path2D();
  stem.moveTo(0, 0);
  stem.quadraticCurveTo(tipX * 0.2 - 8, -H * 0.55, tipX, tipY);
  c.strokeStyle = mixHex(P.olive, "#6e5a2c", wilt);
  c.lineWidth = 9;
  c.lineCap = "round";
  c.stroke(stem);
  c.strokeStyle = P.ink;
  c.lineWidth = 2.2;
  c.stroke(stem);
  // leaf pairs from the bottom up; each unfolds as the plant grows
  const pairs = 3;
  for (let i = 0; i < pairs; i++) {
    const f = (i + 0.7) / (pairs + 0.6);
    const g = clamp((grow - i * 0.22) / 0.4);
    if (g <= 0) continue;
    const u = f;
    const px = lerp(0, tipX, u * u) + (tipX * 0.2 - 8) * 2 * u * (1 - u), py = lerp(0, tipY, u) * 1;
    const size = (1 - i * 0.18) * (1 + mut * (hash(seed * 5 + i) - 0.3) * 0.9);
    for (const sd of [-1, 1]) {
      const len = 92 * size * ease.outBack(g), wid = 34 * size;
      const ang = sd < 0 ? Math.PI + 0.55 - sway * 0.6 + droop * 0.9 : -0.55 - sway * 0.6 + droop * 1.4;
      const tealLeaf = (i + (sd > 0 ? 1 : 0)) % 2 === 0;
      let col = tealLeaf ? P.teal : P.olive;
      col = mixHex(col, hash(seed + i * 3 + sd) > 0.5 ? P.must : "#c9b43a", mut);
      col = mixHex(col, "#8a6a3a", wilt);
      c.save();
      c.translate(px, py);
      c.rotate(ang + Math.sin(t * 2.1 + i + sd) * 0.04);
      const lp = leafPath(len, wid);
      printed(c, lp, col, t, { line: 2.2, plate: mixHex(P.dteal, "#5a3e22", wilt), seed: seed + i });
      // vein
      c.strokeStyle = rgba(P.ink, 0.55);
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(4, 0);
      c.quadraticCurveTo(len * 0.5, -wid * 0.08, len * 0.9, 0);
      c.stroke();
      // mutation freckles
      if (mut > 0.2) {
        c.fillStyle = rgba(P.coral, (mut - 0.2) * 1.1);
        for (let k = 0; k < 4; k++) {
          c.beginPath();
          c.arc(len * (0.3 + 0.15 * k), (hash(k + i * 9 + seed) - 0.5) * wid * 0.6, 3.2, 0, TAU);
          c.fill();
        }
      }
      c.restore();
    }
  }
  // bud
  const bg = clamp((grow - 0.6) / 0.4);
  if (bg > 0) {
    c.save();
    c.translate(tipX, tipY);
    c.rotate(sway + droop * 1.8);
    const bp = leafPath(42 * bg * (1 + mut * 0.6), 18);
    c.rotate(-Math.PI / 2);
    printed(c, bp, mixHex(mixHex(P.teal, P.must, mut), "#8a6a3a", wilt), t, { line: 2, plate: P.dteal, seed: seed + 9 });
    c.restore();
  }
  c.restore();
}
/** tiny sprout icon (the rings of the garden plate): five leaves in a rosette, cached per colour */
const SPROUT = new Map<string, HTMLCanvasElement>();
function sproutSprite(col: string) {
  let cv = SPROUT.get(col);
  if (cv) return cv;
  cv = document.createElement("canvas");
  cv.width = cv.height = 96;
  const x = cv.getContext("2d")!;
  x.translate(48, 60);
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.62;
    x.save();
    x.rotate(a);
    const p = leafPath(40 - Math.abs(i - 2) * 5, 15);
    x.fillStyle = col;
    x.fill(p);
    x.strokeStyle = P.ink;
    x.lineWidth = 2;
    x.stroke(p);
    x.restore();
  }
  SPROUT.set(col, cv);
  return cv;
}
export function sprout(c: Ctx, x: number, y: number, s: number, col: string, g: number) {
  if (g <= 0) return;
  const k = ease.outBack(clamp(g));
  c.drawImage(sproutSprite(col), x - 24 * s * k, y - 30 * s * k, 48 * s * k, 48 * s * k);
}

// ---------- the cobalt pole and the gamma capsule ----------
/** the red capsule (the «bomb» of the reference) — x, y = its centre */
export function capsule(c: Ctx, x: number, y: number, s: number, t: number, glow = 0, rot = 0) {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  c.scale(s, s);
  if (glow > 0) {
    const g = c.createRadialGradient(0, 0, 4, 0, 0, 90);
    g.addColorStop(0, rgba("#ffd9a8", 0.85 * glow));
    g.addColorStop(1, rgba(P.coral, 0));
    c.fillStyle = g;
    c.fillRect(-90, -90, 180, 180);
  }
  const body = new Path2D();
  body.roundRect(-15, -34, 30, 68, 15);
  printed(c, body, P.coral, t, { line: 2.6, plate: "#8e2a24", seed: 4 });
  c.fillStyle = P.ink;
  c.fillRect(-15, -4, 30, 7);
  c.fillStyle = rgba("#ffffff", 0.55);
  c.beginPath();
  c.roundRect(-9, -27, 6, 20, 3);
  c.fill();
  c.restore();
}
/** pole with the capsule riding it (lift 0 = at the shielded base, 1 = at the top), its star behind */
export function pole(c: Ctx, x: number, yBase: number, h: number, t: number, o: { lift?: number; glow?: number; star?: number; s?: number } = {}) {
  const lift = clamp(o.lift ?? 1), s = o.s ?? 1;
  c.save();
  // base plate
  c.fillStyle = P.ink;
  c.beginPath();
  c.ellipse(x, yBase, 22 * s, 7 * s, 0, 0, TAU);
  c.fill();
  c.strokeStyle = P.ink;
  c.lineWidth = 5 * s;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(x, yBase);
  c.lineTo(x, yBase - h);
  c.stroke();
  const cy = lerp(yBase - 30 * s, yBase - h + 6 * s, ease.inOut(lift));
  const st = o.star ?? 0;
  if (st > 0) {
    c.save();
    c.translate(x, cy);
    c.scale(st, st);
    printed(c, sparklePath(0, 0, 62 * s, 0.32), P.card, t, { line: 2.4, seed: 2 });
    c.restore();
  }
  capsule(c, x, cy, 0.9 * s, t, o.glow ?? 0);
  c.restore();
  return cy;
}
/** radiation: dotted coral arcs travelling outward from (x, y) */
export function rays(c: Ctx, x: number, y: number, t: number, a: number, o: { r0?: number; r1?: number; arc?: [number, number]; n?: number; speed?: number; sy?: number } = {}) {
  if (a <= 0) return;
  const r0 = o.r0 ?? 40, r1 = o.r1 ?? 520, n = o.n ?? 4, sp = o.speed ?? 0.7, sy = o.sy ?? 1;
  const [a0, a1] = o.arc ?? [0, TAU];
  c.save();
  c.fillStyle = P.coral;
  for (let i = 0; i < n; i++) {
    const ph = ((t * sp + i / n) % 1 + 1) % 1;
    const r = lerp(r0, r1, ph);
    const al = a * Math.sin(ph * Math.PI);
    const dots = Math.max(8, Math.floor(((a1 - a0) * r) / 16));
    c.globalAlpha = al;
    for (let k = 0; k <= dots; k++) {
      const an = lerp(a0, a1, k / dots);
      c.beginPath();
      c.arc(x + Math.cos(an) * r, y + Math.sin(an) * r * sy, 3.6, 0, TAU);
      c.fill();
    }
  }
  c.restore();
}
/** the cream garden plate: oval with faint dotted rings and sprouts that appear ring by ring (g 0..1) */
export function gardenPlate(c: Ctx, cx: number, cy: number, rx: number, ry: number, t: number, g: number, o: { rings?: number; tint?: number; cut?: number } = {}) {
  const rings = o.rings ?? 5;
  const plate = new Path2D();
  plate.ellipse(cx, cy, rx, ry, 0, 0, TAU);
  printed(c, plate, P.card, t, { line: 3, seed: 7 });
  // faint ring guides
  c.save();
  c.clip(plate);
  c.strokeStyle = rgba(P.coral, 0.22);
  c.setLineDash([3, 9]);
  c.lineWidth = 2;
  for (let i = 1; i <= rings; i++) {
    c.beginPath();
    c.ellipse(cx, cy, (rx * i) / (rings + 0.6), (ry * i) / (rings + 0.6), 0, 0, TAU);
    c.stroke();
  }
  c.setLineDash([]);
  // sprouts: ring by ring from the centre out
  const r = rng(5);
  for (let i = 1; i <= rings; i++) {
    const n = Math.round(5 + i * 4);
    for (let k = 0; k < n; k++) {
      const an = (k / n) * TAU + i * 0.4;
      const gi = clamp((g * (rings + 1) - (i - 1) - (k / n) * 0.6) / 1);
      const sx = cx + Math.cos(an) * (rx * i) / (rings + 0.6), sy = cy + Math.sin(an) * (ry * i) / (rings + 0.6) + 6;
      const col = (i + k) % 2 ? P.teal : P.olive;
      sprout(c, sx, sy, 1.3 + 0.12 * r(), col, gi);
    }
  }
  c.restore();
}

// ---------- genes ----------
export const BEAD_COLS = [P.teal, P.must, P.coral, P.olive, P.dteal];
/** a strand of beads in a pill track; `order` permutes the colours (shuffle), `hot` marks a changed bead */
export function beads(c: Ctx, x: number, y: number, n: number, t: number, o: { order?: number[]; hot?: number; hotCol?: string; s?: number; jiggle?: number; seed?: number } = {}) {
  const s = o.s ?? 1, gap = 34 * s, w = gap * n + 18 * s;
  c.save();
  const track = new Path2D();
  track.roundRect(x - w / 2, y - 22 * s, w, 44 * s, 22 * s);
  printed(c, track, P.card, t, { line: 2.4, seed: o.seed ?? 3 });
  for (let i = 0; i < n; i++) {
    const ci = (o.order ?? [])[i] ?? (i * 2 + (o.seed ?? 0)) % BEAD_COLS.length;
    const jx = (o.jiggle ?? 0) * Math.sin(t * 31 + i * 2.3) * 5, jy = (o.jiggle ?? 0) * Math.cos(t * 27 + i * 1.7) * 7;
    const bx = x - (gap * (n - 1)) / 2 + i * gap + jx, by = y + jy;
    const hot = o.hot === i;
    c.fillStyle = hot ? o.hotCol ?? P.coral : BEAD_COLS[ci];
    c.beginPath();
    c.arc(bx, by, (hot ? 13 : 11) * s, 0, TAU);
    c.fill();
    c.strokeStyle = P.ink;
    c.lineWidth = 2 * s;
    c.stroke();
    if (hot) {
      c.setLineDash([3 * s, 5 * s]);
      c.beginPath();
      c.arc(bx, by, 22 * s, 0, TAU);
      c.stroke();
      c.setLineDash([]);
    }
  }
  c.restore();
}
/** magnifying glass (lens content drawn by `inside`) */
export function magnifier(c: Ctx, x: number, y: number, r: number, t: number, inside: (cc: Ctx) => void, rot = 0.7) {
  c.save();
  // handle
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  const hd = new Path2D();
  hd.roundRect(r * 0.92, -11, r * 0.95, 22, 10);
  printed(c, hd, P.ink, t, { line: 0, seed: 8 });
  c.restore();
  const lens = new Path2D();
  lens.arc(x, y, r, 0, TAU);
  c.save();
  c.clip(lens);
  c.fillStyle = P.card;
  c.fill(lens);
  inside(c);
  c.fillStyle = rgba("#ffffff", 0.18);
  c.beginPath();
  c.ellipse(x - r * 0.35, y - r * 0.4, r * 0.45, r * 0.2, -0.6, 0, TAU);
  c.fill();
  c.restore();
  c.strokeStyle = P.ink;
  c.lineWidth = 9;
  c.stroke(lens);
  c.strokeStyle = P.coral;
  c.lineWidth = 3;
  c.beginPath();
  c.arc(x, y, r - 6, 0, TAU);
  c.stroke();
  c.restore();
}

// ---------- the 24-hour dial ----------
export function dial(c: Ctx, x: number, y: number, r: number, fill: number, t: number) {
  const face = new Path2D();
  face.arc(x, y, r, 0, TAU);
  printed(c, face, P.card, t, { line: 3, seed: 12 });
  // the 20-hour sector, coral, filling clockwise from the top
  if (fill > 0) {
    c.fillStyle = P.coral;
    c.beginPath();
    c.moveTo(x, y);
    c.arc(x, y, r - 10, -Math.PI / 2, -Math.PI / 2 + TAU * (20 / 24) * clamp(fill));
    c.closePath();
    c.fill();
  }
  c.strokeStyle = P.ink;
  c.lineWidth = 2.4;
  for (let i = 0; i < 24; i++) {
    const a = -Math.PI / 2 + (i / 24) * TAU, L = i % 6 === 0 ? 16 : 8;
    c.beginPath();
    c.moveTo(x + Math.cos(a) * (r - 4), y + Math.sin(a) * (r - 4));
    c.lineTo(x + Math.cos(a) * (r - 4 - L), y + Math.sin(a) * (r - 4 - L));
    c.stroke();
  }
  // hand
  const a = -Math.PI / 2 + TAU * (20 / 24) * clamp(fill);
  c.lineWidth = 6;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(x, y);
  c.lineTo(x + Math.cos(a) * (r - 26), y + Math.sin(a) * (r - 26));
  c.stroke();
  c.fillStyle = P.ink;
  c.beginPath();
  c.arc(x, y, 9, 0, TAU);
  c.fill();
}

// ---------- fruit ----------
/** a grapefruit half seen from the cut side; red 0 = pink, 1 = deep ruby */
export function grapefruit(c: Ctx, x: number, y: number, r: number, t: number, red = 0.3, rot = 0) {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  const rind = new Path2D();
  rind.arc(0, 0, r, 0, TAU);
  printed(c, rind, "#e9a23a", t, { line: 3, seed: 13 });
  c.fillStyle = "#fbefd8";
  c.beginPath();
  c.arc(0, 0, r * 0.88, 0, TAU);
  c.fill();
  const flesh = mixHex("#f08f7d", "#c42a37", red), edge = mixHex("#f7b6a3", "#e0606a", red);
  const n = 10;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU + 0.05, a1 = ((i + 1) / n) * TAU - 0.05;
    c.fillStyle = flesh;
    c.beginPath();
    c.moveTo(Math.cos((a0 + a1) / 2) * r * 0.1, Math.sin((a0 + a1) / 2) * r * 0.1);
    c.arc(0, 0, r * 0.8, a0, a1);
    c.closePath();
    c.fill();
    // juice sacs: lighter strokes
    c.strokeStyle = edge;
    c.lineWidth = 2;
    for (let k = 1; k < 4; k++) {
      const am = lerp(a0, a1, k / 4);
      c.beginPath();
      c.moveTo(Math.cos(am) * r * 0.25, Math.sin(am) * r * 0.25);
      c.lineTo(Math.cos(am) * r * 0.72, Math.sin(am) * r * 0.72);
      c.stroke();
    }
  }
  c.fillStyle = "#fbefd8";
  c.beginPath();
  c.arc(0, 0, r * 0.1, 0, TAU);
  c.fill();
  c.fillStyle = rgba("#ffffff", 0.25);
  c.beginPath();
  c.ellipse(-r * 0.35, -r * 0.4, r * 0.3, r * 0.12, -0.6, 0, TAU);
  c.fill();
  c.restore();
}

// ---------- seeds, packets, mail ----------
export function seedPacket(c: Ctx, x: number, y: number, s: number, t: number, rot = 0, label = "بذرِ اتمی") {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  c.scale(s, s);
  const body = new Path2D();
  body.moveTo(-150, -200);
  body.lineTo(150, -200);
  body.lineTo(150, 200);
  body.lineTo(-150, 200);
  body.closePath();
  printed(c, body, P.teal, t, { line: 3.5, plate: P.dteal, seed: 21 });
  // zig-zag torn top
  c.fillStyle = P.dteal;
  c.beginPath();
  c.moveTo(-150, -200);
  for (let i = 0; i <= 12; i++) c.lineTo(-150 + i * 25, -200 - (i % 2 ? 12 : 0));
  c.lineTo(150, -186);
  c.lineTo(-150, -186);
  c.closePath();
  c.fill();
  // label plate
  const lab = new Path2D();
  lab.roundRect(-120, -165, 240, 92, 12);
  printed(c, lab, P.card, t, { line: 2.6, seed: 22 });
  faText(c, label, 0, -118, { size: 46, weight: 900, color: P.ink });
  // the illustration: a radish under an atom
  const sun = new Path2D();
  sun.arc(0, 60, 92, 0, TAU);
  printed(c, sun, P.must, t, { line: 0, noPlate: true });
  c.strokeStyle = P.ink;
  c.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    c.beginPath();
    c.ellipse(0, 40, 70, 22, (i * Math.PI) / 3 + t * 0.6, 0, TAU);
    c.stroke();
  }
  const bulb = new Path2D();
  bulb.ellipse(0, 100, 36, 42, 0, 0, TAU);
  printed(c, bulb, P.coral, t, { line: 3, plate: "#8e2a24", seed: 23 });
  for (const sd of [-1, 1]) {
    c.save();
    c.translate(0, 62);
    c.rotate(-Math.PI / 2 + sd * 0.5);
    printed(c, leafPath(64, 22), sd > 0 ? P.olive : P.teal, t, { line: 2.2, plate: P.dteal, seed: 24 + sd });
    c.restore();
  }
  c.fillStyle = P.coral;
  c.beginPath();
  c.arc(0, 40, 9, 0, TAU);
  c.fill();
  c.restore();
}
export function envelope(c: Ctx, x: number, y: number, s: number, t: number, rot = 0, col = P.card) {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  c.scale(s, s);
  const e = new Path2D();
  e.roundRect(-60, -40, 120, 80, 6);
  printed(c, e, col, t, { line: 2.6, seed: 31 });
  c.strokeStyle = P.ink;
  c.lineWidth = 2.4;
  c.beginPath();
  c.moveTo(-58, -38);
  c.lineTo(0, 6);
  c.lineTo(58, -38);
  c.stroke();
  // stamp
  c.fillStyle = P.coral;
  c.fillRect(30, -30, 22, 18);
  c.restore();
}
/** isotype seed (teardrop) */
export function seedIcon(c: Ctx, x: number, y: number, s: number, col: string) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.fillStyle = col;
  c.beginPath();
  c.moveTo(0, -16);
  c.bezierCurveTo(12, -4, 13, 10, 0, 16);
  c.bezierCurveTo(-13, 10, -12, -4, 0, -16);
  c.fill();
  c.restore();
}
/** a barley ear on a stalk */
export function barley(c: Ctx, x: number, y: number, s: number, t: number, g = 1) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  const H = 300 * ease.out(clamp(g));
  c.strokeStyle = "#b58a2c";
  c.lineWidth = 6;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(0, 0);
  c.quadraticCurveTo(10, -H * 0.5, 4 + Math.sin(t * 1.4) * 4, -H);
  c.stroke();
  const k = clamp((g - 0.4) / 0.6);
  for (let i = 0; i < 9 * k; i++) {
    for (const sd of [-1, 1]) {
      c.save();
      c.translate(4, -H + 14 + i * 15);
      c.rotate(sd * 0.5);
      const gr = new Path2D();
      gr.ellipse(sd * 9, 0, 9, 15, 0, 0, TAU);
      printed(c, gr, P.must, t, { line: 1.8, plate: "#a8741f", seed: i });
      // awn
      c.strokeStyle = "#b58a2c";
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(sd * 12, -10);
      c.lineTo(sd * 26, -54);
      c.stroke();
      c.restore();
    }
  }
  c.restore();
}
/** «not radioactive»: the trefoil crossed out */
export function radSign(c: Ctx, x: number, y: number, r: number, t: number, cross = 1) {
  const disc = new Path2D();
  disc.arc(x, y, r, 0, TAU);
  printed(c, disc, P.card, t, { line: 4, seed: 41 });
  c.fillStyle = P.ink;
  for (let i = 0; i < 3; i++) {
    const a = -Math.PI / 2 + (i * TAU) / 3;
    c.beginPath();
    c.moveTo(x, y);
    c.arc(x, y, r * 0.72, a - 0.52, a + 0.52);
    c.closePath();
    c.fill();
  }
  c.fillStyle = P.card;
  c.beginPath();
  c.arc(x, y, r * 0.22, 0, TAU);
  c.fill();
  c.fillStyle = P.ink;
  c.beginPath();
  c.arc(x, y, r * 0.14, 0, TAU);
  c.fill();
  if (cross > 0) {
    c.strokeStyle = P.coral;
    c.lineWidth = r * 0.16;
    c.lineCap = "round";
    const d = r * 0.72;
    c.beginPath();
    c.moveTo(x - d, y - d);
    c.lineTo(x - d + 2 * d * clamp(cross), y - d + 2 * d * clamp(cross));
    c.stroke();
  }
}
/** a zap: zigzag bolt from a to b + a burst with a word in it */
export function zap(c: Ctx, ax: number, ay: number, bx: number, by: number, t: number, p: number, word = "جِزّ!") {
  if (p <= 0) return;
  const n = 7, pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, nx = -(by - ay), ny = bx - ax, L = Math.hypot(nx, ny) || 1;
    const off = i === 0 || i === n ? 0 : (i % 2 ? 1 : -1) * 22;
    pts.push([lerp(ax, bx, u) + (nx / L) * off, lerp(ay, by, u) + (ny / L) * off]);
  }
  const k = Math.min(n, Math.floor(clamp(p * 1.6) * n));
  c.save();
  c.lineJoin = "miter";
  for (const [w, col] of [[14, P.ink], [8, P.coral]] as const) {
    c.strokeStyle = col;
    c.lineWidth = w;
    c.beginPath();
    pts.slice(0, k + 1).forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.stroke();
  }
  if (p > 0.55) {
    const s = ease.outBack(clamp((p - 0.55) / 0.3));
    c.translate(bx, by);
    c.scale(s, s);
    printed(c, burstPath(0, 0, 120, 12, 0.66, t * 0.2), P.coral, t, { line: 3.4, plate: "#8e2a24", seed: 50 });
    faText(c, word, 0, 4, { size: 64, weight: 900, color: P.card, plate: P.ink, t });
  }
  c.restore();
}

// ---------- a stylised USA (hand-built outline in the reference's simplified way) ----------
// projected lat/lon (equirectangular at 38°N), 0..1 of the map box — aspect 1.857 : 1
export const MAP_ASPECT = 1.8575;
const US: [number, number][] = [[0, 0.0408], [0.0121, 0.1265], [0.0052, 0.2612], [0.0052, 0.3673], [0.0277, 0.4531], [0.0485, 0.5224], [0.071, 0.6082], [0.1074, 0.6286], [0.1316, 0.6857], [0.1732, 0.6816], [0.2372, 0.7388], [0.2857, 0.7388], [0.3152, 0.7184], [0.3498, 0.8], [0.3706, 0.8286], [0.4035, 0.8], [0.4364, 0.8939], [0.4727, 0.9592], [0.4779, 0.8816], [0.5177, 0.8204], [0.5351, 0.8041], [0.5784, 0.8204], [0.6113, 0.8327], [0.6338, 0.7837], [0.6615, 0.7755], [0.6874, 0.8041], [0.7221, 0.8286], [0.7273, 0.8816], [0.7429, 0.951], [0.755, 0.9918], [0.7671, 0.9837], [0.774, 0.9265], [0.7636, 0.8571], [0.7498, 0.7796], [0.7584, 0.7102], [0.7758, 0.6776], [0.8087, 0.6327], [0.8519, 0.5796], [0.8433, 0.5102], [0.8589, 0.449], [0.871, 0.4082], [0.8779, 0.3633], [0.9022, 0.3551], [0.9126, 0.3388], [0.9229, 0.3265], [0.9472, 0.3184], [0.9368, 0.2776], [0.9437, 0.2367], [0.9905, 0.2], [1, 0.1878], [0.9853, 0.098], [0.9714, 0.0857], [0.9472, 0.1224], [0.9212, 0.1796], [0.8658, 0.1796], [0.8398, 0.2367], [0.7896, 0.249], [0.7775, 0.2816], [0.7134, 0.3143], [0.7203, 0.2898], [0.7325, 0.2612], [0.729, 0.2204], [0.6926, 0.1469], [0.6961, 0.1184], [0.6407, 0.0776], [0.5645, 0.1061], [0.6078, 0.0571], [0.5437, 0.0327], [0.5108, 0.0163], [0.0294, 0.0163], [0.026, 0.0449], [0, 0.0408]];
const TX: [number, number][] = [[0.3758, 0.5265], [0.4277, 0.5265], [0.4277, 0.6041], [0.4883, 0.6367], [0.5316, 0.6449], [0.5385, 0.751], [0.5351, 0.8041], [0.5177, 0.8204], [0.4779, 0.8816], [0.4727, 0.9592], [0.4364, 0.8939], [0.4035, 0.8], [0.3706, 0.8286], [0.3498, 0.8], [0.3152, 0.7184], [0.3134, 0.7102], [0.3758, 0.7102], [0.3758, 0.5265]];
const LAKES: [number, number][][] = [[[0.5732, 0.0816], [0.6286, 0.0245], [0.684, 0.0449], [0.6944, 0.1143], [0.6528, 0.1184], [0.6078, 0.1061], [0.5732, 0.0816]], [[0.6874, 0.1388], [0.6528, 0.1469], [0.639, 0.2204], [0.639, 0.2939], [0.6528, 0.3143], [0.6667, 0.2612], [0.6805, 0.1796], [0.6874, 0.1388]], [[0.7048, 0.1306], [0.7463, 0.1429], [0.7463, 0.2041], [0.7325, 0.2531], [0.7152, 0.1959], [0.7048, 0.1306]], [[0.7221, 0.2653], [0.7913, 0.2694], [0.7654, 0.302], [0.7255, 0.3265], [0.7221, 0.2653]], [[0.7775, 0.2286], [0.8364, 0.2122], [0.8329, 0.249], [0.7879, 0.249], [0.7775, 0.2286]]];
export const MAP_PTS = { texas: [0.4641, 0.9306] as [number, number], ny: [0.8973, 0.3482] as [number, number] };
export function usMap(c: Ctx, x: number, y: number, w: number, h: number, t: number, a = 1, txHi = 0) {
  if (a <= 0) return;
  c.save();
  c.globalAlpha *= a;
  const toP = (pts: [number, number][]) => {
    const p = new Path2D();
    pts.forEach(([u, v], i) => (i ? p.lineTo(x + u * w, y + v * h) : p.moveTo(x + u * w, y + v * h)));
    p.closePath();
    return p;
  };
  printed(c, toP(US), P.card, t, { line: 3, seed: 61 });
  c.fillStyle = mixHex(P.card, P.must, 0.35 + 0.65 * txHi);
  c.fill(toP(TX));
  c.strokeStyle = rgba(P.ink, 0.6);
  c.lineWidth = 2;
  c.stroke(toP(TX));
  // the Great Lakes
  for (const lk of LAKES) {
    c.fillStyle = P.aqua;
    c.fill(toP(lk));
    c.strokeStyle = rgba(P.ink, 0.5);
    c.lineWidth = 1.6;
    c.stroke(toP(lk));
  }
  c.restore();
}
export { hash };
