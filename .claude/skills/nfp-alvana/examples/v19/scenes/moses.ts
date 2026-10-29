// Lines 18–21: Moses on Horeb at night with the flock → a bush catches fire, a figure of light inside the flame →
// Moses turns, comes near, kneels and hides his face when he is called → three names: «فرشته‌ی یَهوه»، «یَهوه»، «خدا»
// → portals: the pillar of cloud and fire leading Israel; the tabernacle where the glory comes to dwell.
import { applyCam, bloom, blur, Cam, Ctx, H, layer, matchTransform, paint, resOf, W } from "../lib/canvas";
import { figure, figureFlat, mixPose, P, Pose, STAND, walk } from "../lib/figure";
import { glow, grain, motes, painterly, sparkle, sparkles, vignette } from "../lib/fx";
import { lightBeing } from "../lib/light";
import { castShadow, CloudPal, clouds, lightPool, mist, nebula, ridge, shaft, starsDeep } from "../lib/depth";
import { clamp, ease, fbm, k, lerp, mixHex, rgba, rng, ss, TAU, win } from "../lib/math";
import { title } from "../lib/text";
import { E, S, W as Wd } from "../cues";

type Poly = [number, number][];
const fillPoly = (c: Ctx, p: Poly) => {
  c.beginPath();
  p.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fill();
};
const BUSH: [number, number] = [1380, 740];
const NIGHT_NEAR: CloudPal = { shade: "#0c1030", mid: "#2a3470", lit: "#c4ceff", gamma: 1.1 };
const NIGHT_FAR: CloudPal = { shade: "#141a44", mid: "#2e3a7a", lit: "#8a98e0", gamma: 1.2 };
const par = (cam: Cam, f: number): Cam => ({ x: 960 + (cam.x - 960) * f, y: 540 + (cam.y - 540) * f, z: 1 + (cam.z - 1) * f });

// ---------- fire ----------
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
function sheep(c: Ctx, x: number, y: number, s: number, t: number, ph: number, col: string, dark: string) {
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

// ---------- Horeb at night ----------
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
function mosesCam(t: number): Cam {
  const near = k(t, Wd(19, "و", 0) - 0.5, Wd(19, "پیش") + 0.5, ease.inOutSine);
  const kneel = k(t, Wd(19, "صدا") - 1.0, E(19) + 0.5, ease.inOutSine);
  return { x: lerp(lerp(900, 1100, near), 1180, kneel), y: lerp(560, 600, near), z: lerp(lerp(1.0, 1.12, near), 1.3, kneel) + 0.03 * ss(S(18), E(20), t) };
}
const WALK_FROM = 480, WALK_TO = 980, CLOSE = 1180;
function mosesState(t: number): { x: number; pose: Pose; face: 1 | -1 } {
  const tA = S(18) - 1, tStop = Wd(19, "ظاهر") - 0.3;
  const tGo = Wd(19, "موسی", 1) - 0.2, tArrive = Wd(19, "می‌آید،") + 0.8;
  const tKneel = Wd(19, "صدا") - 0.6;
  const walk1 = clamp((t - tA) / (tStop - tA));
  let x = lerp(WALK_FROM, WALK_TO, ease.inOutSine(walk1));
  const walk2 = clamp((t - tGo) / (tArrive - tGo));
  x = lerp(x, CLOSE, ease.inOutSine(walk2));
  const moving = (walk1 > 0 && walk1 < 1) || (walk2 > 0 && walk2 < 1);
  let pose = moving ? walk((x - WALK_FROM) / 95) : P({ head: 0.04, arF: 0.25, elF: 0.3 });
  // stop and look at the burning bush
  const look = k(t, tStop, tStop + 0.8);
  pose = mixPose(pose, P({ head: -0.25, torso: -0.04, arF: 0.3, elF: 0.4 }), look * (1 - (moving ? 1 : 0)));
  // kneel, hide the face (Exodus 3:6)
  const kn = k(t, tKneel, tKneel + 1.4, ease.inOutSine);
  const KNEEL_HIDE = P({ hipY: 0.3, torso: 0.45, head: 0.7, thF: 1.45, shF: 0.0, thB: 0.25, shB: -1.35, arF: 2.3, elF: 1.9, arB: 0.6, elB: 0.6 });
  pose = mixPose(pose, KNEEL_HIDE, kn);
  return { x, pose, face: 1 };
}

export function drawHoreb(c: Ctx, t: number) {
  if (!MTN) mtn();
  const cam = mosesCam(t);
  const ignite = k(t, Wd(19, "شعله‌ی") - 0.4, Wd(19, "آتش،") + 0.6, ease.out);
  const call = win(t, Wd(19, "خدا") - 0.2, Wd(19, "صدا") - 0.2, E(19) + 0.5, E(19) + 2.5);
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
  // the flock, drifting after Moses
  const ms = mosesState(t);
  for (let i = 0; i < 6; i++) {
    const sx = ms.x - 160 - i * 70 - (i % 2) * 30 + Math.sin(t * 0.4 + i) * 8, sy = 850 + (i % 3) * 22;
    sheep(c, sx, sy, 1.15, t, i * 1.7, mixHex("#7a80b4", "#c99a86", ignite * 0.6), "#141433");
  }
  // the bush: dark branches; then fire, the figure of light in the flame
  c.save();
  c.strokeStyle = "#140c16";
  c.lineCap = "round";
  const br = rng(85);
  for (let i = 0; i < 14; i++) {
    const a = -Math.PI / 2 + (br() - 0.5) * 2.2, len = 60 + br() * 80;
    c.lineWidth = 3 + br() * 3;
    c.beginPath();
    c.moveTo(BUSH[0] + (br() - 0.5) * 30, BUSH[1]);
    c.quadraticCurveTo(BUSH[0] + Math.cos(a) * len * 0.5, BUSH[1] + Math.sin(a) * len * 0.6, BUSH[0] + Math.cos(a) * len, BUSH[1] + Math.sin(a) * len);
    c.stroke();
  }
  c.restore();
  fire(c, lit, BUSH[0], BUSH[1] + 4, 1.35 + 0.25 * call, t, ignite, 3);
  lightBeing(c, lit, { x: BUSH[0], y: BUSH[1] - 10, h: 230, t, k: 0.75 * k(t, Wd(19, "بوته‌ای") - 0.2, Wd(19, "ظاهر") + 0.5), warm: 1, rays: 0.6 + 2 * call, aura: 0.6, face: -1 });
  // the call: rings of light going out from the bush
  if (call > 0.01) {
    c.save();
    c.globalCompositeOperation = "screen";
    for (let i = 0; i < 3; i++) {
      const ph = ((((t - Wd(19, "صدا") + i * 0.5) % 1.5) + 1.5) % 1.5) / 1.5; // always 0..1
      if (t < Wd(19, "صدا") + i * 0.5 - 0.5) continue;
      c.strokeStyle = rgba("#ffe2b0", call * (1 - ph) * 0.6);
      c.lineWidth = 3;
      c.beginPath();
      c.ellipse(BUSH[0], BUSH[1] - 80, 60 + ph * 520, 30 + ph * 260, 0, 0, TAU);
      c.stroke();
    }
    c.restore();
  }
  // firelight on the ground (flickering) and the long shadow it throws behind Moses
  const flick = 0.85 + 0.15 * Math.sin(t * 9.1) * Math.sin(t * 5.3 + 1);
  lightPool(c, BUSH[0], BUSH[1] + 40, 760, 120, "#ffb060", 0.45 * ignite * flick);
  const mf = { x: ms.x, y: 860, h: 330, face: ms.face, pose: ms.pose, t, head: "wrap" as const, beard: true, seed: 91, wind: 0.25 };
  castShadow(c, mf, BUSH[0], 1.3, 0.55 * ignite * flick, "#0a0812", 0.2, 6);
  // Moses
  const fireLight = ignite;
  figure(c, { x: ms.x, y: 860, h: 330, face: ms.face, pose: ms.pose, t, head: "wrap", beard: true, staff: ms.pose.hipY < 0.45 ? null : "F", seed: 91, wind: 0.25 }, {
    base: "#2a2850", base2: "#12102a", rim: mixHex("#d0d8ff", "#ffc488", fireLight), rimW: 5 + 2 * fireLight, light: [lerp(-0.6, 1, fireLight), -0.4],
  });
  c.restore();
  sparkles(c, t, [1100, 300, 600, 400], 10, 86, ignite * 0.8, "#ffe2b0", 8);
  motes(c, t, { n: 30, color: "#ffd8a0", alpha: 0.4 * ignite, seed: 87, speed: 0.8, dust: true });
  bloom(c, lit, 1, 46);
  vignette(c, 0.5, "#070612");
  // labels
  const out0 = k(t, Wd(19, "«فرشته‌ی") - 0.5, Wd(19, "«فرشته‌ی"));
  title(c, [{ s: "خروج", f: "MorabbaLight" }, { s: "۳", f: "MorabbaBold" }], 250, 150, { size: 44, k: k(t, Wd(18, "موسی") - 0.2, Wd(18, "موسی") + 0.6), out: out0, align: "left", glow: 10 });
  title(c, [{ s: "موسی و", f: "MorabbaLight" }, { s: "بوته‌ی سوزان", f: "MorabbaHeavy" }], 250, 214, { size: 62, k: k(t, Wd(18, "بوته‌ی") - 0.3, Wd(18, "سوزان") + 0.6), out: out0, align: "left" });
  // «سه تا اسم»: three lights leave the bush, each flies to where its name appears
  const camN = mosesCam(t);
  const bs: [number, number] = [(BUSH[0] - camN.x) * camN.z + 960, (BUSH[1] - 120 - camN.y) * camN.z + 540];
  const nameAt = [[Wd(20, "فرشته‌ی"), 200], [Wd(20, "یَهوه،", 1), 290], [Wd(20, "خدا."), 395]] as const;
  nameAt.forEach(([tn, ny], i) => {
    const t0 = Wd(20, "سه") - 0.2 + i * 0.25;
    const fly = ease.inOut(clamp((t - t0 - 0.6) / Math.max(0.4, tn - t0 - 0.6)));
    const a = k(t, t0, t0 + 0.4) * (1 - k(t, tn, tn + 0.3));
    if (a <= 0.002) return;
    const rise = ease.out(clamp((t - t0) / 0.6));
    const x = lerp(bs[0] + (i - 1) * 60, 260 + 120, fly), y = lerp(bs[1] - 80 * rise, ny, fly) - Math.sin(fly * Math.PI) * 120;
    c.save();
    c.globalCompositeOperation = "screen";
    glow(c, x, y, 50, "#ffd9a0", a);
    c.restore();
    sparkle(c, x, y, 16, a, "#ffffff", t);
  });
  // the three names, stacked (line 20)
  const nOut = k(t, Wd(20, "بعدتر") - 0.2, Wd(20, "بعدتر") + 0.5);
  title(c, [{ s: "فرشته‌ی", f: "MorabbaLight" }, { s: "یَهوه", f: "MorabbaHeavy" }], 250, 200, { size: 56, k: k(t, Wd(20, "فرشته‌ی") - 0.1, Wd(20, "یَهوه،") + 0.4), out: nOut, align: "left", shade: 0.3 });
  title(c, [{ s: "یَهوه", f: "MorabbaHeavy" }], 250, 290, { size: 76, k: k(t, Wd(20, "یَهوه،", 1) - 0.1, Wd(20, "یَهوه،", 1) + 0.5), out: nOut, align: "left", shade: 0.3 });
  title(c, [{ s: "خدا", f: "MorabbaHeavy" }], 250, 395, { size: 92, k: k(t, Wd(20, "خدا.") - 0.1, Wd(20, "خدا.") + 0.5), out: nOut, align: "left", shade: 0.3 });
  grain(c, t, 0.15);
}

// ---------- portal scenes: the pillar of cloud and fire; the tabernacle ----------
const PIL_DAY: CloudPal = { shade: "#b8a8b8", mid: "#f2ece8", lit: "#ffffff", gamma: 0.9 };
const PIL_FIRE: CloudPal = { shade: "#3a0e0a", mid: "#d8501c", lit: "#ffe08a", gamma: 0.85 };
const DAY_CL: CloudPal = { shade: "#9aa0c8", mid: "#e8e4f0", lit: "#ffffff", gamma: 1.0 };
export function drawExodus(c: Ctx, t: number) {
  const night = k(t, Wd(20, "آتش...") - 0.6, Wd(20, "آتش...") + 0.6);
  painterly(c, t, mixHex("#6aa0d8", "#0d1230", night), mixHex("#f0c890", "#2a2240", night), [
    { x: 960, y: 500, r: 700, c: mixHex("#ffe0b0", "#3a2a50", night), a: 0.6 },
  ], 91);
  starsDeep(c, t, 180, 92, night, 0, 0, "#ffffff", [0, 0, W, 620]);
  clouds(c, t, [{ name: "cu3", x: 380, y: 220, w: 900, sp: 4 }, { name: "cu1", x: 1580, y: 180, w: 900, flip: true, sp: 3 }], DAY_CL, 0.8 * (1 - night), [-900, 2800]);
  clouds(c, t, [{ name: "cu3", x: 380, y: 220, w: 900, sp: 4 }, { name: "cu1", x: 1580, y: 180, w: 900, flip: true, sp: 3 }], NIGHT_NEAR, 0.7 * night, [-900, 2800]);
  // dunes in three depths (hazy far → near)
  ridge(c, { y0: 720, amp: 60, freq: 0.002, seed: 93, color: mixHex("#e8b88a", "#3a2e48", night), haze: mixHex("#fff0d8", "#4a4070", night), hazeA: 0.5, sharp: 0.3 });
  ridge(c, { y0: 790, amp: 50, freq: 0.0025, seed: 94, color: mixHex("#d9a070", "#2a1e30", night), sharp: 0.2, rim: mixHex("#fff0d0", "#6a6aa0", night), rimA: 0.35, rimW: 1.5 });
  const lit = layer("exo-lit", 0.5);
  // the pillar: a towering cloud by day, a column of fire by night
  const px = 1000;
  clouds(c, t, [{ name: "tower", x: px, y: 380, w: 520, crop: [0.15, 0, 0.7, 0.95] }], PIL_DAY, 1 - night);
  if (night > 0.01) {
    clouds(c, t, [{ name: "tower", x: px, y: 380, w: 520, crop: [0.15, 0, 0.7, 0.95] }], PIL_FIRE, night);
    for (let i = 0; i < 4; i++) fire(c, lit, px + Math.sin(t + i) * 12, 760 - i * 150, 1.2, t + i * 0.7, night * 0.8, 7 + i);
  }
  c.save();
  c.globalCompositeOperation = "screen";
  glow(c, px, 500, 420, mixHex("#fff6e0", "#ff9a4a", night), 0.35);
  c.restore();
  // the people walking after it
  const r = rng(93);
  const col = mixHex("#4a3040", "#120c18", night);
  for (let i = 0; i < 34; i++) {
    const x = 80 + r() * 700, y = 780 + r() * 220, h = 70 + (y - 780) * 0.35;
    const ph = t * 0.9 + r() * 3;
    figureFlat(c, { x: x + (t - 205) * 12, y, h, face: 1, pose: walk(ph, 0.8), t, head: r() > 0.5 ? "veil" : "wrap", seed: i }, col);
  }
  bloom(c, lit, 1, 40);
  vignette(c, 0.4);
}
const GLORY_CL: CloudPal = { shade: "#8a6a5a", mid: "#f4dcc0", lit: "#fffaf0", gamma: 0.85 };
export function drawTabernacle(c: Ctx, t: number) {
  const g0 = k(t, Wd(20, "ساکن") - 0.8, Wd(20, "ساکن") + 0.8);
  painterly(c, t, "#151a3c", "#3a2a48", [{ x: 960, y: 380, r: 700, c: mixHex("#3a3a7a", "#ffd9a0", g0), a: 0.6 }], 95);
  nebula(c, t, ["#2a3270", "#4a3a80", "#c8d0ff"], 0.25, 96, 0.5);
  starsDeep(c, t, 200, 96, 0.8, 0, 0, "#ffffff", [0, 0, W, 640]);
  const lit = layer("tab-lit", 0.5);
  ridge(c, { y0: 700, amp: 150, freq: 0.002, seed: 97, color: "#2a3060", haze: "#4a5090", hazeA: 0.5, sharp: 0.7, rim: "#9aa4e0", rimA: 0.25 });
  mist(c, 720, 50, "#3a4080", 0.4);
  // the camp: rows of tents, smaller and hazier farther back
  const r = rng(97);
  for (let row = 0; row < 3; row++) {
    const yb = 720 + row * 30, sc = 0.6 + row * 0.25;
    for (let i = 0; i < 12; i++) {
      const x = r() * 2100 - 90, s = (40 + r() * 30) * sc;
      if (Math.abs(x - 960) < 320 + row * 40) continue;
      c.fillStyle = mixHex("#3a3a68", "#1a1630", row / 2);
      c.beginPath();
      c.moveTo(x - s, yb);
      c.lineTo(x, yb - s * 0.9);
      c.lineTo(x + s, yb);
      c.closePath();
      c.fill();
      c.fillStyle = rgba("#ffb46a", 0.35 + 0.25 * row + 0.15 * Math.sin(t * 2 + i + row));
      c.fillRect(x - 3 * sc, yb - 14 * sc, 6 * sc, 14 * sc);
    }
  }
  // ground
  const gg = c.createLinearGradient(0, 780, 0, 1100);
  gg.addColorStop(0, "#2a2238");
  gg.addColorStop(1, "#120e1c");
  c.fillStyle = gg;
  c.fillRect(-20, 780, W + 40, 320);
  lightPool(c, 960, 800, 600, 80, "#ffd9a0", 0.5 * g0);
  // the courtyard's linen curtain: one soft, slightly sagging band hung on thin posts
  const lg = c.createLinearGradient(0, 756, 0, 806);
  lg.addColorStop(0, mixHex("#b9aed2", "#f3e6cc", g0));
  lg.addColorStop(1, mixHex("#8a7fa8", "#c9b48e", g0));
  c.fillStyle = lg;
  c.beginPath();
  c.moveTo(600, 762);
  for (let x = 600; x <= 1320; x += 48) c.quadraticCurveTo(x + 24, 768, x + 48, 762);
  c.lineTo(1320, 806);
  c.lineTo(600, 806);
  c.closePath();
  c.fill();
  c.fillStyle = "#5a4a5e";
  for (let x = 600; x <= 1320; x += 48) c.fillRect(x - 1.5, 752, 3, 56);
  // the tent of meeting
  const tg = c.createLinearGradient(800, 0, 1120, 0);
  tg.addColorStop(0, "#2e2026");
  tg.addColorStop(0.5, mixHex("#4a3236", "#7a5040", g0));
  tg.addColorStop(1, "#2a1c22");
  c.fillStyle = tg;
  c.beginPath();
  c.moveTo(800, 762);
  c.lineTo(800, 610);
  c.quadraticCurveTo(960, 560, 1120, 610);
  c.lineTo(1120, 762);
  c.fill();
  c.fillStyle = rgba("#ffd29a", 0.25 + 0.7 * g0);
  c.fillRect(930, 660, 60, 102);
  // the glory comes down and rests on it: a real cloud lit from inside, settling on the tent, a column of light
  const down = ease.inOut(g0);
  c.save();
  c.globalCompositeOperation = "screen";
  const colTop = lerp(-100, 120, 1 - down), colBot = lerp(300, 640, down);
  const cg = c.createLinearGradient(0, colTop, 0, colBot);
  cg.addColorStop(0, "rgba(255,240,210,0)");
  cg.addColorStop(0.5, rgba("#fff1d0", 0.35 * g0));
  cg.addColorStop(1, rgba("#ffe2b0", 0.7 * g0));
  c.fillStyle = cg;
  c.beginPath();
  c.moveTo(960 - 70, colTop);
  c.lineTo(960 + 70, colTop);
  c.lineTo(960 + 150, colBot);
  c.lineTo(960 - 150, colBot);
  c.closePath();
  c.fill();
  c.restore();
  clouds(c, t, [{ name: "cu5", x: 960, y: lerp(-200, 470, down), w: 900, crop: [0.15, 0.05, 0.75, 0.85] }], GLORY_CL, 0.9 * g0);
  c.save();
  c.globalCompositeOperation = "screen";
  glow(c, 960, lerp(-100, 520, down), 380, "#ffd9a0", 0.5 * g0);
  glow(c, 960, 620, 360, "#ffd9a0", 0.45 * g0);
  c.restore();
  glow(lit, 960, 600, 260, "#ffe6b8", g0);
  bloom(c, lit, 1, 50);
  vignette(c, 0.4);
}
/** the throne room on earth: inside the tent — veils with gold borders, a floor in perspective, the lampstand,
 *  incense rising, the ark under the wings of the cherubim, the glory coming down as a shaft of light */
const INCENSE: CloudPal = { shade: "#6a3a2a", mid: "#d8a070", lit: "#fff0d0", gamma: 1.0 };
export function drawHolyPlace(c: Ctx, t: number) {
  painterly(c, t, "#2a1720", "#5a3020", [{ x: 960, y: 420, r: 700, c: "#ffcf80", a: 0.8 }, { x: 960, y: 900, r: 700, c: "#3a1e1a", a: 0.7 }], 98);
  const lit = layer("holy-lit", 0.5);
  const cam = { x: 960 + Math.sin(t * 0.08) * 16, y: 540, z: 1.02 + 0.02 * Math.sin(t * 0.05) };
  c.save();
  applyCam(c, cam);
  // the inner veil at the back: deep blue-purple-scarlet weave with a gold border and woven cherubim
  const vg = c.createLinearGradient(0, 240, 0, 700);
  vg.addColorStop(0, "#3a1e4a");
  vg.addColorStop(1, "#5a2034");
  c.fillStyle = vg;
  c.fillRect(470, 230, 980, 470);
  c.strokeStyle = rgba("#000000", 0.18);
  c.lineWidth = 10;
  for (let x = 500; x < 1450; x += 46) {
    c.beginPath();
    c.moveTo(x + Math.sin(t * 0.4 + x) * 2, 230);
    c.lineTo(x + 6, 700);
    c.stroke();
  }
  c.strokeStyle = rgba("#e9c46a", 0.55);
  c.lineWidth = 6;
  c.strokeRect(490, 250, 940, 430);
  c.lineWidth = 1.5;
  for (const sx of [620, 1300]) {
    c.beginPath();
    for (let i = 0; i <= 20; i++) {
      const u = i / 20;
      const xx = sx + (sx < 960 ? 1 : -1) * Math.sin(u * Math.PI) * 110, yy = 300 + u * 280;
      i ? c.lineTo(xx, yy) : c.moveTo(xx, yy);
    }
    c.stroke();
  }
  // the floor: boards running toward the ark (perspective)
  const fg = c.createLinearGradient(0, 700, 0, 1100);
  fg.addColorStop(0, "#6a3a22");
  fg.addColorStop(1, "#24120c");
  c.fillStyle = fg;
  c.fillRect(-100, 700, 2120, 500);
  c.strokeStyle = rgba("#000000", 0.25);
  c.lineWidth = 1.5;
  for (let i = -14; i <= 14; i++) {
    c.beginPath();
    c.moveTo(960 + i * 36, 700);
    c.lineTo(960 + i * 170, 1150);
    c.stroke();
  }
  // side curtains in the foreground with folds (they frame the view)
  for (const sd of [-1, 1]) {
    const x0 = sd < 0 ? -40 : W - 360;
    const cg = c.createLinearGradient(x0, 0, x0 + 400, 0);
    for (let i = 0; i <= 10; i++) cg.addColorStop(i / 10, i % 2 ? "#5a2244" : "#3a1430");
    c.fillStyle = cg;
    c.fillRect(x0, -40, 400, H + 80);
    c.fillStyle = rgba("#e9c46a", 0.5);
    c.fillRect(sd < 0 ? x0 + 392 : x0, -40, 8, H + 80);
  }
  // the lampstand on the left: seven flames flickering
  c.strokeStyle = "#d9a83a";
  c.lineWidth = 6;
  c.lineCap = "round";
  const lx = 560, ly = 760;
  c.beginPath();
  c.moveTo(lx, ly);
  c.lineTo(lx, ly - 200);
  c.stroke();
  c.lineWidth = 4;
  for (let i = 1; i <= 3; i++) {
    c.beginPath();
    c.arc(lx, ly - 200, i * 34, Math.PI * 0.02, Math.PI * 0.98);
    c.stroke();
  }
  for (let i = -3; i <= 3; i++) {
    const fx = lx + i * 34, fy = ly - 200 - (i === 0 ? 0 : 0) - 8;
    const fl = 0.8 + 0.2 * Math.sin(t * 9 + i * 1.7) * Math.sin(t * 6.1 + i);
    c.save();
    c.globalCompositeOperation = "screen";
    glow(c, fx, fy - 14, 46 * fl, "#ffb050", 0.6);
    c.fillStyle = "#fff0c0";
    c.beginPath();
    c.ellipse(fx + Math.sin(t * 4 + i) * 1.5, fy - 12, 5 * fl, 13 * fl, 0, 0, TAU);
    c.fill();
    c.restore();
  }
  // incense rising from the altar, slowly
  const ri = (t * 0.03) % 1;
  clouds(c, t, [{ name: "tower", x: 1330, y: lerp(560, 380, ri), w: 420, a: Math.sin(ri * Math.PI) * 0.35, crop: [0.2, 0.1, 0.6, 0.8] }], INCENSE, 1);
  c.fillStyle = "#c99a3c";
  c.fillRect(1300, 650, 60, 110);
  c.fillStyle = "#e9c46a";
  c.fillRect(1292, 644, 76, 10);
  // the ark: gold with a lighter lid, rings and poles
  const ag = c.createLinearGradient(0, 700, 0, 840);
  ag.addColorStop(0, "#f0cf6a");
  ag.addColorStop(1, "#9a6a20");
  c.fillStyle = ag;
  c.fillRect(800, 700, 320, 140);
  c.strokeStyle = rgba("#fff0b0", 0.6);
  c.lineWidth = 2;
  c.strokeRect(812, 712, 296, 116);
  c.fillStyle = "#ffe08a";
  c.fillRect(780, 690, 360, 18);
  c.fillStyle = "#b8862a";
  c.fillRect(720, 800, 480, 10);
  // wings of the cherubim meeting above, with feather lines
  for (const sd of [-1, 1]) {
    const wg = c.createLinearGradient(960 + sd * 200, 560, 960, 690);
    wg.addColorStop(0, "#ffe9a0");
    wg.addColorStop(1, "#c9962e");
    c.fillStyle = wg;
    c.beginPath();
    c.moveTo(960 + sd * 150, 690);
    c.quadraticCurveTo(960 + sd * 230, 540, 960 + sd * 16, 596);
    c.quadraticCurveTo(960 + sd * 120, 640, 960 + sd * 150, 690);
    c.fill();
    c.strokeStyle = rgba("#7a4a10", 0.35);
    c.lineWidth = 1.5;
    for (let i = 1; i < 6; i++) {
      c.beginPath();
      c.moveTo(960 + sd * (150 - i * 6), 690 - i * 4);
      c.quadraticCurveTo(960 + sd * (200 - i * 18), 590 + i * 4, 960 + sd * (30 + i * 12), 604 + i * 6);
      c.stroke();
    }
  }
  c.save();
  c.globalCompositeOperation = "screen";
  glow(c, 960, 520, 300 + 20 * Math.sin(t * 1.4), "#fff0c8", 0.6);
  c.restore();
  glow(lit, 960, 520, 220, "#ffffff", 0.7);
  const sh = k(t, Wd(21, "پایین") - 0.4, Wd(21, "زمین.") + 0.2, ease.out);
  if (sh > 0) {
    shaft(c, t, 960, -60, 960, lerp(-40, 720, sh), 60, 150, "#fff3d6", 0.5 * sh, 40, 101);
    glow(lit, 960, 680, 180, "#ffffff", sh);
  }
  sparkles(c, t, [700, 300, 520, 420], 14, 99, 1, "#fff3d0", 9);
  c.restore();
  motes(c, t, { n: 30, color: "#fff0c8", alpha: 0.5, seed: 100, speed: 0.6, dust: true });
  bloom(c, lit, 1.1, 60);
  vignette(c, 0.5, "#140808");
  title(c, [{ s: "تالارِ تخت،", f: "MorabbaLight" }, { s: "روی زمین", f: "MorabbaHeavy" }], 960, 160, { size: 64, k: k(t, Wd(21, "تالارِ") - 0.1, Wd(21, "زمین.") + 0.4), out: k(t, S(22) + 0.8, S(22) + 1.6), shade: 0.45 });
  grain(c, t, 0.14);
}
export const _m = { STAND, H, sparkle };
