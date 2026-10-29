// World: a mountain at night (from video 19, Horeb) + a living fire + a flock.
import { applyCam, blur, Cam, Ctx, layer, matchTransform, paint, resOf, W } from "../engine/canvas";
import { CloudPal, clouds, mist, nebula, ridge, starsDeep } from "../engine/depth";
import { glow, painterly } from "../engine/fx";
import { fbm, mixHex, rgba, rng, TAU } from "../engine/math";
const par = (cam: Cam, f: number): Cam => ({ x: 960 + (cam.x - 960) * f, y: 540 + (cam.y - 540) * f, z: 1 + (cam.z - 1) * f });
type Poly = [number, number][];
const fillPoly = (c: Ctx, p: Poly) => {
  c.beginPath();
  p.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fill();
};
const NIGHT_NEAR: CloudPal = { shade: "#0c1030", mid: "#2a3470", lit: "#c4ceff", gamma: 1.1 };
const NIGHT_FAR: CloudPal = { shade: "#141a44", mid: "#2e3a7a", lit: "#8a98e0", gamma: 1.2 };

/** a living fire rising from (x,y): many tongues with hot cores and red tips (soft-edged, added as light),
 *  licks that break off and rise, embers with short trails; s = size, k = intensity */
export function fire(c: Ctx, lit: Ctx | null, x: number, y: number, s: number, t: number, k0: number, seed = 1) {
  if (k0 <= 0.002) return;
  c.save();
  c.globalCompositeOperation = "screen";
  const fl = 0.9 + 0.1 * Math.sin(t * 11 + seed) * Math.sin(t * 7.3);
  glow(c, x, y - 70 * s, 300 * s * fl, "#ff7a2a", 0.5 * k0);
  glow(c, x, y - 40 * s, 140 * s, "#ffd27a", 0.5 * k0);
  c.restore();
  const res = resOf(c) || 1;
  const F = layer("fire-" + res, res * 0.5);
  matchTransform(F, c);
  F.globalCompositeOperation = "lighter";
  const n = 15;
  for (let i = 0; i < n; i++) {
    const u = (i / (n - 1)) * 2 - 1;
    const ph = t * (1.5 + (i % 5) * 0.23) + i * 2.3 + seed;
    const hgt = s * (85 + 95 * (0.5 + 0.5 * fbm(ph * 0.55, i * 3.1 + seed, 2))) * k0 * (1 - Math.abs(u) * 0.55);
    const w = s * (13 + 8 * (0.5 + 0.5 * Math.sin(ph * 1.3))) * (1 - Math.abs(u) * 0.3);
    const bx = x + u * 50 * s + Math.sin(ph * 0.7) * 4 * s;
    const by = y - u * u * 26 * s; // the base follows the round bush, not a straight line
    const sway = fbm(t * 1.6 + i * 0.7, seed + i, 2) * 30 * s;
    const g = F.createLinearGradient(bx, by, bx + sway, by - hgt);
    g.addColorStop(0, "rgba(255,246,210,0.95)");
    g.addColorStop(0.3, "rgba(255,190,80,0.8)");
    g.addColorStop(0.7, "rgba(255,90,30,0.45)");
    g.addColorStop(1, "rgba(255,50,20,0)");
    F.fillStyle = g;
    F.beginPath();
    F.moveTo(bx - w, by);
    F.bezierCurveTo(bx - w * 1.15, by - hgt * 0.4, bx + sway * 0.5 - w * 0.35, by - hgt * 0.72, bx + sway, by - hgt);
    F.bezierCurveTo(bx + sway * 0.5 + w * 0.35, by - hgt * 0.72, bx + w * 1.15, by - hgt * 0.4, bx + w, by);
    F.quadraticCurveTo(bx, by + w * 0.6, bx - w, by);
    F.closePath();
    F.fill();
  }
  // licks of flame that break off the top and rise, shrinking
  const r = rng(seed * 13 + 5);
  for (let j = 0; j < 12; j++) {
    const life = (t * (0.9 + r() * 0.8) + r()) % 1;
    const lx = x + (r() - 0.5) * 90 * s + fbm(t + j, seed, 2) * 20 * s;
    const ly = y - (90 + r() * 60) * s * k0 - life * 130 * s;
    const sz = (1 - life) * (7 + r() * 8) * s * k0;
    if (sz < 0.3) continue;
    const g = F.createRadialGradient(lx, ly, 0, lx, ly, sz * 2);
    g.addColorStop(0, `rgba(255,200,110,${(0.8 * (1 - life)).toFixed(3)})`);
    g.addColorStop(1, "rgba(255,80,30,0)");
    F.fillStyle = g;
    F.beginPath();
    F.ellipse(lx, ly, sz, sz * 1.8, 0, 0, TAU);
    F.fill();
  }
  // soften the foot of the fire into the bush
  F.globalCompositeOperation = "destination-out";
  const bm = F.createLinearGradient(0, y - 22 * s, 0, y + 8 * s);
  bm.addColorStop(0, "rgba(0,0,0,0)");
  bm.addColorStop(1, "rgba(0,0,0,0.85)");
  F.fillStyle = bm;
  F.fillRect(x - 200 * s, y - 22 * s, 400 * s, 60 * s);
  paint(c, F, 1, "screen", blur(2.5, res));
  // white-hot core at the base
  c.save();
  c.globalCompositeOperation = "screen";
  glow(c, x, y - 18 * s, 70 * s, "#fff8e0", 0.75 * k0);
  c.restore();
  // embers with short trails
  c.save();
  c.globalCompositeOperation = "screen";
  c.lineCap = "round";
  for (let i = 0; i < 30; i++) {
    const life = (t * (0.45 + r() * 0.6) + r()) % 1;
    const ex = x + (r() - 0.5) * 130 * s + Math.sin(t * 3 + i) * 16 * s * life, ey = y - 40 * s - life * 300 * s;
    const vx = Math.cos(t * 3 + i) * 3 * s * 0.5, vy = 10 * s;
    c.strokeStyle = `rgba(255,${(190 + 50 * (1 - life)) | 0},120,${(k0 * (1 - life) * 0.9).toFixed(3)})`;
    c.lineWidth = (1.2 + r() * 2) * s;
    c.beginPath();
    c.moveTo(ex, ey);
    c.lineTo(ex - vx, ey + vy);
    c.stroke();
  }
  c.restore();
  if (lit) {
    lit.save();
    matchTransform(lit, c);
    glow(lit, x, y - 70 * s, 200 * s, "#ffb060", 0.9 * k0);
    lit.restore();
  }
}


// ---------- flock ----------
export function sheep(c: Ctx, x: number, y: number, s: number, t: number, ph: number, col: string, dark: string) {
  const graze = (Math.sin(t * 0.9 + ph) + 1) / 2;
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.fillStyle = dark;
  for (const lx of [-16, -6, 8, 18]) c.fillRect(lx, -14, 4, 16);
  c.fillStyle = col;
  for (const [bx, by, br] of [[-14, -26, 13], [0, -30, 15], [14, -26, 13], [-6, -18, 12], [8, -18, 12]] as const) {
    c.beginPath();
    c.arc(bx, by, br, 0, TAU);
    c.fill();
  }
  c.fillStyle = dark;
  c.beginPath();
  c.ellipse(26, -26 + graze * 14, 7, 10, 0.6 + graze * 0.6, 0, TAU);
  c.fill();
  c.restore();
}


let MTN: { far: Poly; near: Poly; slope: Poly } | null = null;
function mtn() {
  const r = rng(33);
  const ridge = (y0: number, amp: number, step: number): Poly => {
    const p: Poly = [[-400, 1300]];
    for (let x = -400; x <= 2400; x += step) p.push([x, y0 - amp * Math.abs(fbm(x * 0.0018, y0, 3)) - r() * amp * 0.12]);
    p.push([2400, 1300]);
    return p;
  };
  MTN = { far: ridge(620, 420, 60), near: ridge(760, 160, 40), slope: [[-400, 1300], [-400, 860], [400, 820], [900, 790], [1300, 760], [1700, 770], [2400, 800], [2400, 1300]] };
}

/** a mountain night: milky way, stars in depth, the moon, moonlit real clouds, three ranges with mist, a slope with
 *  rocks. ignite 0..1 warms the near land (a fire nearby). Leaves ctx in camera space: call `c.restore()` after
 *  drawing your figures on top (the returned `lit` layer is for bloom). */
export function nightRange(c: Ctx, t: number, cam: Cam, ignite = 0) {
  if (!MTN) mtn();
  painterly(c, t, "#18214e", "#3b3f7c", [
    { x: 1500, y: 620, r: 600, c: mixHex("#3b3a7a", "#a05a4a", ignite), a: 0.6 },
    { x: 520, y: 260, r: 700, c: "#3a4890", a: 0.6 },
  ], 81, 0.5);
  // the night sky in depth: a band of the milky way, stars at three depths, the moon, moonlit clouds drifting
  const px = (cam.x - 960) * cam.z, py = (cam.y - 540) * cam.z;
  c.save();
  c.translate(960, 300);
  c.rotate(-0.42);
  c.translate(-960, -300);
  nebula(c, t, ["#3a4a9a", "#6a5aa8", "#e0e6ff"], 0.32, 83, 0.4, "screen", -px * 0.05, -py * 0.05);
  c.restore();
  starsDeep(c, t, 260, 82, 0.95, px * 0.4, py * 0.4, "#ffffff", [0, 0, W, 760]);
  const moon: [number, number] = [470 - px * 0.08, 250 - py * 0.08];
  c.save();
  c.globalCompositeOperation = "screen";
  glow(c, moon[0], moon[1], 520, "#9aa8ff", 0.4);
  glow(c, moon[0], moon[1], 150, "#dfe6ff", 0.55);
  c.restore();
  const mg = c.createRadialGradient(moon[0] - 14, moon[1] - 14, 4, moon[0], moon[1], 52);
  mg.addColorStop(0, "#ffffff");
  mg.addColorStop(1, "#c9d2f4");
  c.fillStyle = mg;
  c.beginPath();
  c.arc(moon[0], moon[1], 50, 0, TAU);
  c.fill();
  c.fillStyle = rgba("#9aa4d0", 0.35);
  for (const [mx, my, mr] of [[-14, -10, 11], [12, 8, 8], [-4, 18, 6], [18, -16, 5]] as const) {
    c.beginPath();
    c.arc(moon[0] + mx, moon[1] + my, mr, 0, TAU);
    c.fill();
  }
  // clouds: far (slow) and nearer (faster), lit by the moon
  c.save();
  applyCam(c, par(cam, 0.3));
  clouds(c, t, [{ name: "field", x: 900, y: 430, w: 2200, a: 0.55, sp: 4, crop: [0, 0.05, 1, 0.6] }], NIGHT_FAR, 1, [-1200, 3100]);
  c.restore();
  c.save();
  applyCam(c, par(cam, 0.55));
  clouds(c, t, [
    { name: "cu3", x: 300, y: 210, w: 1000, a: 0.85, sp: 7 }, { name: "cu1", x: 1500, y: 150, w: 1000, a: 0.8, flip: true, sp: 6 },
  ], NIGHT_NEAR, 1, [-1000, 2900]);
  c.restore();
  const lit = layer("moses-lit", 0.5);
  c.save();
  applyCam(c, cam);
  // the farthest range, hazy blue, rim-lit by the moon
  c.save();
  c.translate((cam.x - 960) * 0.35, 0);
  ridge(c, { y0: 700, amp: 300, freq: 0.0026, seed: 88, color: "#3a4282", haze: "#6a78c8", hazeA: 0.5, sharp: 0.85, rim: "#c9d2ff", rimA: 0.2, rimW: 1.5 });
  c.restore();
  mist(c, 640, 60, "#5a64b0", 0.35);
  c.fillStyle = "#2b3166";
  fillPoly(c, MTN!.far);
  mist(c, 730, 50, "#3a4290", 0.3);
  c.fillStyle = mixHex("#20244c", "#3a2430", ignite * 0.5);
  fillPoly(c, MTN!.near);
  const sg = c.createLinearGradient(0, 760, 0, 1100);
  sg.addColorStop(0, mixHex("#30346a", "#5a3a36", ignite * 0.6));
  sg.addColorStop(1, "#0b0b1c");
  c.fillStyle = sg;
  fillPoly(c, MTN!.slope);
  // rocks + scrub
  const rr = rng(84);
  c.fillStyle = "#0f1028";
  for (let i = 0; i < 18; i++) {
    const x = rr() * 2000 - 40, y = 800 + rr() * 260, s = 6 + rr() * 18;
    c.beginPath();
    c.ellipse(x, y, s, s * 0.4, 0, 0, TAU);
    c.fill();
  }
  return lit;
}
