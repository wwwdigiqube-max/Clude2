// World: a desert canyon at dusk (from video 19, Hagar). Real clouds, depth layers, warm low light.
import { applyCam, Cam, Ctx, W } from "../engine/canvas";
import { CloudPal, clouds, godRays, mist, ridge } from "../engine/depth";
import { glow, painterly, stars } from "../engine/fx";
import { clamp, fbm, mixHex, rgba, rng, TAU } from "../engine/math";
const par = (cam: Cam, f: number): Cam => ({ x: 960 + (cam.x - 960) * f, y: 540 + (cam.y - 540) * f, z: 1 + (cam.z - 1) * f });
type Poly = [number, number][];
const fillPoly = (c: Ctx, p: Poly) => {
  c.beginPath();
  p.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fill();
};

// ---------- palettes: dusk desert ↔ the same desert touched by heaven ----------
type Pal = { sky0: string; sky1: string; sky2: string; far: string; wallL: string; wallD: string; ground0: string; ground1: string; rim: string; water: string };
const DUSK: Pal = { sky0: "#2e2147", sky1: "#9e6378", sky2: "#eaa577", far: "#7b5a73", wallL: "#5b4256", wallD: "#33242f", ground0: "#6e4f58", ground1: "#2f2129", rim: "#ffb27a", water: "#e9a98a" };
const HEAVEN: Pal = { sky0: "#8b86ee", sky1: "#e7a6d2", sky2: "#ffe0b0", far: "#c09ad0", wallL: "#a07fb4", wallD: "#6f5488", ground0: "#c49ab8", ground1: "#6c4f7a", rim: "#ffffff", water: "#f6e6ff" };
const mixPal = (a: Pal, b: Pal, t: number): Pal => {
  const o = {} as Pal;
  (Object.keys(a) as (keyof Pal)[]).forEach((key) => (o[key] = mixHex(a[key], b[key], t)));
  return o;
};

// ---------- clouds: dusk (gold-lit) and heaven-touched (lilac-white) ----------
const DU_NEAR: CloudPal = { shade: "#4a2c4a", mid: "#a8607a", lit: "#ffc898", gamma: 0.95 };
const DU_FAR: CloudPal = { shade: "#6a4060", mid: "#b8748a", lit: "#ffd0a8", gamma: 1.1 };
const HV_NEAR: CloudPal = { shade: "#8a72c0", mid: "#d6b0e0", lit: "#fff6f0", gamma: 0.95 };
const HV_FAR: CloudPal = { shade: "#a088c8", mid: "#dcc0e8", lit: "#fff4ec", gamma: 1.1 };

// ---------- static geometry ----------
let GEO: { far: Poly; wallsL: { p: Poly; tone: number }[]; wallsR: { p: Poly; tone: number }[]; rocks: { x: number; y: number; s: number }[]; reeds: { x: number; h: number; b: number }[] } | null = null;
function geo() {
  const r = rng(316);
  const far: Poly = [[-300, 1100], [-300, 640]];
  let x = -300, y = 640;
  while (x < 2200) {
    const flat = 60 + r() * 220, drop = (r() - 0.5) * 90;
    far.push([x + flat, y]);
    x += flat + 20 + r() * 40;
    y = clamp(y + drop, 560, 700);
    far.push([x, y]);
  }
  far.push([2200, 1100]);
  // canyon walls as facets (tone 0 = lit, 1 = shade)
  const wallsL = [
    { p: [[-200, -100], [430, -100], [380, 260], [300, 560], [210, 820], [-200, 860]] as Poly, tone: 0.75 },
    { p: [[430, -100], [560, 300], [470, 600], [380, 790], [210, 820], [300, 560], [380, 260]] as Poly, tone: 0.25 },
    { p: [[560, 300], [640, 560], [600, 760], [380, 790], [470, 600]] as Poly, tone: 0.45 },
  ];
  const wallsR = [
    { p: [[2120, -100], [1500, -100], [1580, 230], [1640, 520], [1760, 800], [2120, 850]] as Poly, tone: 0.8 },
    { p: [[1500, -100], [1420, 260], [1470, 560], [1560, 780], [1760, 800], [1640, 520], [1580, 230]] as Poly, tone: 0.4 },
  ];
  const rocks = Array.from({ length: 16 }, () => ({ x: 200 + r() * 1500, y: 800 + r() * 260, s: 4 + r() * 13 }));
  const reeds = Array.from({ length: 22 }, () => ({ x: 900 + r() * 280, h: 24 + r() * 46, b: (r() - 0.5) * 0.5 }));
  GEO = { far, wallsL, wallsR, rocks, reeds };
}

/** where things sit in the desert (world coords): the spring, a seated person, a standing figure of light */
export const SPRING = { x: 1040, y: 868, rx: 170, ry: 24 };
export const DESERT_SPOTS = { sitter: { x: 870, y: 876, h: 400 }, being: { x: 1390, y: 800, h: 430 } };

/** the desert canyon at dusk (pm 0) or touched by heaven (pm 1): sky + real clouds, rays from the set sun, hazy ranges,
 *  mesas, rippled sand, faceted canyon walls, stones, a spring with reeds, an acacia. World coords; pass the camera. */
export function desert(c: Ctx, t: number, cam: Cam, pm = 0) {
  if (!GEO) geo();
  const G = GEO!;
  const p = mixPal(DUSK, HEAVEN, pm);
  // sky (screen space)
  painterly(c, t, p.sky0, p.sky2, [
    { x: 960, y: 640, r: 900, c: p.sky2, a: 0.9 },
    { x: 900, y: 300, r: 800, c: p.sky1, a: 0.7 },
    { x: 1500, y: 120, r: 600, c: p.sky0, a: 0.6 },
  ], 3, 0.6);
  stars(c, t, [0, 0, W, 380], 60, 8, 0.5 * (1 - pm) * 0.7);
  // real clouds catching the last light, two depths (the far ones barely move with the camera)
  const heaven = pm > 0.5;
  c.save();
  applyCam(c, par(cam, 0.25));
  clouds(c, t, [
    { name: "field", x: 700, y: 470, w: 1900, a: 0.75, sp: 3, crop: [0, 0.05, 1, 0.62] },
    { name: "cu2", x: 1500, y: 300, w: 1200, a: 0.6, sp: 2, flip: true },
  ], heaven ? HV_FAR : DU_FAR, 1, [-900, 2800]);
  c.restore();
  c.save();
  applyCam(c, par(cam, 0.5));
  clouds(c, t, [
    { name: "cu3", x: 420, y: 170, w: 1150, sp: 5 }, { name: "cu4", x: 1560, y: 120, w: 1200, flip: true, sp: 4, crop: [0, 0, 1, 0.8] },
  ], heaven ? HV_NEAR : DU_NEAR, 0.95, [-900, 2800]);
  c.restore();
  c.save();
  applyCam(c, cam);
  // afterglow of the sun that has just set, with long rays fanning up from behind the mesas
  c.save();
  c.globalCompositeOperation = "screen";
  glow(c, 760, 650, 520, mixHex("#ffb070", "#fff0d0", pm), 0.55);
  c.restore();
  godRays(c, t, 760, 660, { n: 20, len: 1400, spread: 2.6, dir: -Math.PI / 2, color: heaven ? "#fff4f0" : "#ffc890", alpha: 0.16, width: 0.07, spin: 0.003, seed: 9, soft: 12 });
  // a farther, hazier range behind the mesas (aerial perspective)
  c.save();
  c.translate((cam.x - 960) * 0.4, (cam.y - 540) * 0.15);
  ridge(c, { y0: 640, amp: 90, freq: 0.0022, seed: 61, color: mixHex(p.far, p.sky2, 0.45), haze: p.sky2, hazeA: 0.55, sharp: 0.75, rim: p.rim, rimA: 0.25, rimW: 1.5 });
  c.restore();
  // far mesas (parallax via a little extra offset), hazy
  c.save();
  c.translate((cam.x - 960) * 0.25, (cam.y - 540) * 0.1);
  c.fillStyle = p.far;
  fillPoly(c, G.far);
  c.globalAlpha = 0.35;
  c.fillStyle = p.sky2;
  c.fillRect(-400, 560, 2700, 140);
  c.restore();
  mist(c, 700, 70, p.sky2, 0.4);
  // ground
  const g = c.createLinearGradient(0, 700, 0, 1100);
  g.addColorStop(0, p.ground0);
  g.addColorStop(1, p.ground1);
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(-300, 760);
  for (let x = -300; x <= 2220; x += 40) c.lineTo(x, 748 + Math.sin(x * 0.004) * 18 + fbm(x * 0.003, 2, 2) * 14);
  c.lineTo(2220, 1300);
  c.lineTo(-300, 1300);
  c.fill();
  // wind ripples in the sand (thin lit crests, wider apart toward us)
  c.save();
  c.strokeStyle = rgba(p.rim, 0.13);
  c.lineWidth = 1.6;
  const rr = rng(318);
  for (let i = 0; i < 46; i++) {
    const y0 = 770 + Math.pow(i / 46, 1.6) * 330, x0 = rr() * 2200 - 200, len = 80 + rr() * 220 * (1 + (y0 - 770) / 200);
    c.beginPath();
    for (let j = 0; j <= 12; j++) {
      const u = j / 12;
      const x = x0 + u * len, y = y0 + Math.sin(u * Math.PI) * -6 + Math.sin(x * 0.01 + i) * 3;
      j ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.stroke();
  }
  c.restore();
  // canyon walls with lit / shaded facets
  for (const f of [...G.wallsL, ...G.wallsR]) {
    c.fillStyle = mixHex(p.wallD, p.wallL, f.tone);
    fillPoly(c, f.p);
  }
  // rock strata on the walls (thin lighter bands)
  c.save();
  c.strokeStyle = rgba(p.wallL, 0.5);
  c.lineWidth = 3;
  for (const f of [...G.wallsL, ...G.wallsR]) {
    c.save();
    c.beginPath();
    f.p.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.clip();
    for (let yy = 40; yy < 820; yy += 46 + (yy % 3) * 9) {
      c.beginPath();
      c.moveTo(-300, yy);
      for (let xx = -300; xx < 2300; xx += 60) c.lineTo(xx, yy + Math.sin(xx * 0.01 + yy) * 6 + xx * 0.02);
      c.stroke();
    }
    // darker toward the foot of the wall
    const sg = c.createLinearGradient(0, 300, 0, 860);
    sg.addColorStop(0, rgba(p.wallD, 0));
    sg.addColorStop(1, rgba(p.wallD, 0.55));
    c.fillStyle = sg;
    c.fillRect(-300, 0, 2600, 900);
    c.restore();
  }
  c.restore();
  // small stones, irregular, with a lit top edge
  for (const s of G.rocks) {
    const pts: [number, number][] = [];
    for (let j = 0; j < 6; j++) {
      const a = (j / 6) * TAU, rr = s.s * (0.7 + 0.3 * Math.sin(s.x + j * 2.3));
      pts.push([s.x + Math.cos(a) * rr, s.y + Math.sin(a) * rr * 0.42]);
    }
    c.fillStyle = p.ground1;
    fillPoly(c, pts);
    c.fillStyle = rgba(p.rim, 0.18);
    c.beginPath();
    c.ellipse(s.x - s.s * 0.15, s.y - s.s * 0.2, s.s * 0.5, s.s * 0.12, 0, 0, TAU);
    c.fill();
  }
  // the spring: sky reflected, slow shimmer
  const wg = c.createLinearGradient(0, SPRING.y - SPRING.ry, 0, SPRING.y + SPRING.ry);
  wg.addColorStop(0, p.water);
  wg.addColorStop(1, mixHex(p.water, p.sky1, 0.6));
  c.fillStyle = wg;
  c.beginPath();
  c.ellipse(SPRING.x, SPRING.y, SPRING.rx, SPRING.ry, 0, 0, TAU);
  c.fill();
  c.strokeStyle = rgba("#ffffff", 0.55);
  c.lineCap = "round";
  for (let i = 0; i < 6; i++) {
    const yy = SPRING.y - 10 + i * 4, ph = t * 0.7 + i * 1.3;
    const xx = SPRING.x - 100 + ((i * 47 + Math.sin(ph) * 30) % 200);
    c.globalAlpha = 0.3 + 0.3 * Math.sin(ph * 1.7);
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(xx, yy);
    c.lineTo(xx + 26 + 10 * Math.sin(ph), yy);
    c.stroke();
  }
  c.globalAlpha = 1;
  // reeds by the water, swaying
  c.strokeStyle = p.ground1;
  for (const rd of G.reeds) {
    const sw = Math.sin(t * 1.2 + rd.x * 0.05) * 0.12 + rd.b;
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(rd.x, SPRING.y - 8);
    c.quadraticCurveTo(rd.x + sw * rd.h * 0.5, SPRING.y - 8 - rd.h * 0.6, rd.x + sw * rd.h, SPRING.y - 8 - rd.h);
    c.stroke();
  }
  // an acacia: trunk + flat crown, crown breathing in the wind
  acacia(c, 560, 800, 1.0, t, p);
  c.restore();
}
/** umbrella-thorn acacia: forked trunk fanning into a flat, layered, clumpy crown that breathes in the wind */
let CROWN: { x: number; y: number; rx: number; ry: number; ph: number }[] | null = null;
function acacia(c: Ctx, x: number, y: number, s: number, t: number, p: Pal) {
  if (!CROWN) {
    const r = rng(77);
    CROWN = Array.from({ length: 16 }, (_, i) => {
      const u = i / 15 - 0.5;
      return { x: u * 300 + (r() - 0.5) * 30, y: -175 - Math.cos(u * 2.4) * 22 + (r() - 0.5) * 16 + (i % 2) * 14, rx: 36 + r() * 34, ry: 13 + r() * 9, ph: r() * TAU };
    });
  }
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.fillStyle = p.ground1;
  c.strokeStyle = p.ground1;
  c.lineCap = "round";
  // trunk + branches (tapered by stroking twice)
  const br: [number, number, number, number, number, number][] = [[0, 0, -6, -80, 4, -110], [4, -105, -40, -130, -110, -168], [4, -105, 30, -140, 90, -170], [2, -110, 0, -150, -20, -180], [6, -100, 70, -120, 150, -160]];
  br.forEach(([x0, y0, cx, cy, x1, y1], i) => {
    c.lineWidth = i === 0 ? 14 : 7;
    c.beginPath();
    c.moveTo(x0, y0);
    c.quadraticCurveTo(cx, cy, x1, y1);
    c.stroke();
  });
  // crown: overlapping flat clumps
  for (const b of CROWN!) {
    const sw = Math.sin(t * 0.7 + b.ph) * 2.5;
    c.beginPath();
    c.ellipse(b.x + sw, b.y, b.rx, b.ry, 0, 0, TAU);
    c.fill();
  }
  // last light on the top of the crown
  c.strokeStyle = rgba(p.rim, 0.35);
  c.lineWidth = 2.5;
  for (const b of CROWN!) {
    const sw = Math.sin(t * 0.7 + b.ph) * 2.5;
    c.beginPath();
    c.ellipse(b.x + sw, b.y, b.rx, b.ry, 0, Math.PI * 1.15, Math.PI * 1.85);
    c.stroke();
  }
  c.restore();
}

