// Lines 9–13: Hagar alone by a spring in the desert at dusk → a sliver of light opens into a living window,
// the figure of light inside → it speaks as God: the window floods the desert, countless stars (her descendants)
// rise → «تو خدایی هستی که مرا می‌بیند» → «no one can see God and live»: white-out.
import { applyCam, bloom, Cam, Ctx, H, layer, paint, W } from "../lib/canvas";
import { figure, figureFlat, mixPose, P, Pose, walk } from "../lib/figure";
import { glow, grain, motes, painterly, sparkle, sparkles, stars, vignette } from "../lib/fx";
import { lightBeing } from "../lib/light";
import { castShadow, CloudPal, clouds, godRays, mist, ridge } from "../lib/depth";
import { clamp, ease, fbm, k, lerp, mixHex, rgba, rng, ss, TAU, win } from "../lib/math";
import { eyeGlyph, voiceRings } from "../lib/lineart";
import { blobPath } from "../lib/shape";
import { title } from "../lib/text";
import { E, S, W as Wd } from "../cues";

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
const par = (cam: Cam, f: number): Cam => ({ x: 960 + (cam.x - 960) * f, y: 540 + (cam.y - 540) * f, z: 1 + (cam.z - 1) * f });

// ---------- static geometry ----------
type Poly = [number, number][];
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
const fillPoly = (c: Ctx, p: Poly) => {
  c.beginPath();
  p.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fill();
};

const SPRING = { x: 1040, y: 868, rx: 170, ry: 24 };
const HAGAR = { x: 870, y: 876, h: 400 };
const BEING = { x: 1390, y: 800, h: 430 };

/** the desert world (world coords), palette mix pm 0..1 */
function desert(c: Ctx, t: number, cam: Cam, pm: number) {
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

// ---------- Hagar's acting ----------
const SIT_HUG: Pose = P({ hipY: 0.07, torso: 0.36, head: 0.75, thF: 2.55, shF: 0.3, thB: 2.35, shB: 0.2, arF: 1.35, elF: 0.95, arB: 1.2, elB: 0.95 });
const SIT_UP: Pose = P({ hipY: 0.07, torso: 0.18, head: -0.35, thF: 2.3, shF: 0.2, thB: 2.15, shB: 0.1, arF: 1.25, elF: 0.4, arB: 1.0, elB: 0.5 });
const KNEEL: Pose = P({ hipY: 0.3, torso: 0.08, head: -0.3, thF: 1.45, shF: 0.0, thB: 0.25, shB: -1.35, arF: 0.9, elF: 0.4, arB: 0.2, elB: 0.2 });
const REACH: Pose = P({ torso: -0.06, head: -0.32, arF: 1.85, elF: 0.15, arB: 0.2, elB: 0.2 });
const SHIELD: Pose = P({ torso: 0.12, head: 0.35, arF: 2.7, elF: 1.6, arB: 1.2, elB: 1.4, thF: 0.12, thB: -0.12 });
function hagarPose(t: number): Pose {
  const tLook = Wd(10, "هاجر") - 0.4;
  const tStand = Wd(11, "بهش") - 0.2;
  let p = mixPose(SIT_HUG, SIT_UP, k(t, tLook, tLook + 1.6, ease.inOutSine));
  p = mixPose(p, KNEEL, k(t, tStand, tStand + 0.9, ease.inOutSine));
  p = mixPose(p, REACH, k(t, tStand + 0.8, tStand + 2.0, ease.inOutSine));
  p = mixPose(p, SHIELD, k(t, Wd(13, "هیچ‌کس") - 0.3, Wd(13, "هیچ‌کس") + 0.9, ease.inOutSine));
  return p;
}

// ---------- the window of light ----------
function windowBlob(t: number) {
  const t0 = Wd(10, "«فرشته‌ی") + 0.05;
  const a = ease.outBack(clamp((t - t0) / 1.6), 1.1);
  const tB = Wd(11, "بهش") - 0.1;
  const b = k(t, tB, tB + 2.4, ease.inOut);
  return {
    on: t > t0,
    full: b >= 0.999,
    x: lerp(1360, 1080, b), y: lerp(520, 560, b),
    r: lerp(330 * a, 1650, b),
    sx: lerp(lerp(2.4, 1, ease.out(clamp((t - t0) / 1.3))), 1, b),
    sy: lerp(lerp(0.28, 1.12, ease.out(clamp((t - t0) / 1.3))), 1, b),
    rot: lerp(-0.7, 0, ease.out(clamp((t - t0) / 1.4))),
    t0,
  };
}

function camAt(t: number): Cam {
  const push = k(t, S(12) - 0.5, S(12) + 2.5, ease.inOutSine);
  return {
    x: lerp(960 + 30 * Math.sin(t * 0.05), 1100, push),
    y: lerp(560, 620, push),
    z: lerp(1.0 + 0.06 * ss(S(9), S(11), t), 1.32, push),
  };
}

export function drawHagar(ctx: Ctx, t: number) {
  const cam = camAt(t);
  const wb = windowBlob(t);
  const heavenLight = k(t, wb.t0 + 0.6, wb.t0 + 2.2); // Hagar's rim turns from sunset to heaven-light
  const being = k(t, wb.t0 + 0.9, wb.t0 + 2.3);
  const lit = layer("hagar-lit", 0.5);
  // 1) dusk desert (until the window has filled the frame)
  if (!wb.full) desert(ctx, t, cam, 0);
  // 2) heaven-touched desert + the figure of light, inside the window
  if (wb.on) {
    const L = layer("hagar-in");
    desert(L, t, cam, 1);
    L.save();
    applyCam(L, cam);
    lightBeing(L, lit, { x: BEING.x, y: BEING.y, h: BEING.h, t, k: being, face: -1, warm: 0.15, rays: 1 + 2.5 * flare(t) });
    L.restore();
    if (!wb.full) {
      const path = blobPath({ x: wb.x, y: wb.y, r: wb.r, seed: 4, amp: 0.1, freq: 1.4, t: t * 0.15, sx: wb.sx, sy: wb.sy, rot: wb.rot });
      L.save();
      applyCam(L, cam);
      L.globalCompositeOperation = "destination-in";
      L.fill(path);
      L.restore();
      // glassy outer layers and a fresh-born glow
      ctx.save();
      applyCam(ctx, cam);
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = "#ffffff";
      ctx.fill(blobPath({ x: wb.x + 18, y: wb.y - 10, r: wb.r * 1.07, seed: 9, amp: 0.13, freq: 1.3, t: t * 0.12, sx: wb.sx, sy: wb.sy, rot: wb.rot }));
      ctx.globalAlpha = 0.1;
      ctx.fill(blobPath({ x: wb.x - 24, y: wb.y + 14, r: wb.r * 1.13, seed: 13, amp: 0.15, freq: 1.2, t: t * 0.1, sx: wb.sx, sy: wb.sy, rot: wb.rot }));
      ctx.restore();
    }
    paint(ctx, L);
    // white flash where it is born
    const born = win(t, wb.t0 - 0.05, wb.t0 + 0.25, wb.t0 + 0.6, wb.t0 + 1.6);
    if (born > 0.01) {
      ctx.save();
      applyCam(ctx, cam);
      ctx.globalCompositeOperation = "screen";
      glow(ctx, 1360, 520, 520, "#ffffff", 0.6 * born);
      ctx.restore();
    }
  }
  // 3) stars rising from the ground: «نسلِ تو را چنان زیاد می‌کنم…»
  descendants(ctx, lit, t, cam);
  // 4) Hagar
  ctx.save();
  applyCam(ctx, cam);
  footprints(ctx, t);
  // the angel speaks (line 11): rings of light travel to Hagar; «… که مرا می‌بیند» (line 12): an eye of light opens above it
  const aHead: [number, number] = [BEING.x - 40, BEING.y - BEING.h * 0.86], hHead: [number, number] = [HAGAR.x + 50, HAGAR.y - HAGAR.h * 0.8];
  voiceRings(ctx, aHead[0], aHead[1], hHead[0], hHead[1], t, Wd(11, "حرف") - 0.3, 2.6);
  voiceRings(ctx, aHead[0], aHead[1], hHead[0], hHead[1], t, Wd(11, "«نسلِ") - 0.2, 3.0);
  const eo = k(t, Wd(12, "مرا") - 0.4, Wd(12, "مرا") + 0.3, ease.out) * (1 - k(t, S(13) + 0.4, S(13) + 1.2));
  eyeGlyph(ctx, BEING.x, BEING.y - BEING.h - 70, 80, eo, k(t, Wd(12, "مرا") - 0.6, Wd(12, "مرا") - 0.2) * (1 - k(t, S(13) + 0.6, S(13) + 1.2)));
  // contact shadow
  ctx.fillStyle = rgba("#120a14", 0.35);
  ctx.beginPath();
  ctx.ellipse(HAGAR.x + 20, HAGAR.y + 4, 110, 14, 0, 0, TAU);
  ctx.fill();
  // her long shadow: thrown by the low sun (behind, left), then by the figure of light (right)
  const hf = { x: HAGAR.x, y: HAGAR.y, h: HAGAR.h, face: 1 as const, pose: hagarPose(t), t, head: "veil" as const, wind: 0.35, seed: 3 };
  castShadow(ctx, hf, 600, 1.5, 0.4 * (1 - heavenLight), "#1e0e1a", 0.16, 5);
  castShadow(ctx, hf, BEING.x, 0.9, 0.5 * heavenLight, "#2a1838", 0.2, 7);
  const rim = mixHex(DUSK.rim, "#efe6ff", heavenLight);
  const lightDir: [number, number] = [lerp(-1, 1, heavenLight), lerp(-0.25, -0.5, heavenLight)];
  figure(ctx, { x: HAGAR.x, y: HAGAR.y, h: HAGAR.h, face: 1, pose: hagarPose(t), t, head: "veil", wind: 0.35, seed: 3 }, {
    base: mixHex("#3a2434", "#4a3858", heavenLight), base2: mixHex("#22141e", "#2a1f38", heavenLight), rim, rimW: 4 + 3 * heavenLight, light: lightDir,
  });
  // foreground rocks, out of focus (depth)
  ctx.restore();
  foreground(ctx, t, cam, wb.full ? 1 : clamp((wb.r - 330) / 900));
  // atmosphere
  motes(ctx, t, { n: 40, color: mixHex("#ffd6a8", "#ffffff", heavenLight), alpha: 0.45, seed: 21, speed: 0.35, dust: true });
  ctx.save();
  applyCam(ctx, cam);
  sparkles(ctx, t, [BEING.x - 260, 260, 520, 520], 12, 77, being * 0.8, "#ffffff", 9);
  ctx.restore();
  bloom(ctx, lit, 0.9, 50);
  vignette(ctx, 0.42, "#140a16");
  // white-out (line 13 «…ببینه و زنده بمونه»)
  const wo = k(t, Wd(13, "ببینه") - 0.2, E(13) + 0.3, ease.in);
  if (wo > 0.001) {
    ctx.save();
    ctx.globalAlpha = wo;
    ctx.fillStyle = "#fffaf2";
    ctx.fillRect(-10, -10, W + 20, H + 20);
    ctx.restore();
  }
  memory(ctx, t);
  texts(ctx, t);
  grain(ctx, t, 0.15);
}
/** the light swells when the text says it is God himself, and at the white-out */
function flare(t: number) {
  return 0.5 * win(t, Wd(11, "خودِ") - 0.2, Wd(11, "خداست.") + 0.2, Wd(11, "بهش"), Wd(11, "بهش") + 1.2) + k(t, Wd(13, "هیچ‌کس"), E(13), ease.in);
}

let DESC: { x0: number; y0: number; x1: number; y1: number; d: number; s: number }[] | null = null;
function descendants(ctx: Ctx, lit: Ctx, t: number, cam: Cam) {
  const t0 = Wd(11, "«نسلِ") - 0.1;
  if (t < t0) return;
  if (!DESC) {
    const r = rng(1613);
    DESC = Array.from({ length: 320 }, () => {
      const x0 = 200 + r() * 1500;
      return { x0, y0: 760 + r() * 160, x1: x0 + (r() - 0.5) * 400, y1: 40 + Math.pow(r(), 1.3) * 560, d: r() * 3.2, s: 1.6 + Math.pow(r(), 3) * 3.6 };
    });
  }
  const fade = 1 - k(t, E(12) + 0.6, S(13) + 2.5) * 0.6;
  ctx.save();
  applyCam(ctx, cam);
  ctx.globalCompositeOperation = "screen";
  for (const p of DESC) {
    const a = clamp((t - t0 - p.d) / 2.4);
    if (a <= 0) continue;
    const e = ease.outQuint(a);
    const x = lerp(p.x0, p.x1, e), y = lerp(p.y0, p.y1, e);
    const tw = 0.6 + 0.4 * Math.sin(t * 2.3 + p.x0);
    ctx.globalAlpha = fade * tw * Math.min(1, a * 4);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x, y, p.s * (1 + (1 - a) * 0.8), 0, TAU);
    ctx.fill();
    if (a < 0.7) {
      ctx.globalAlpha = fade * 0.18 * (1 - a / 0.7);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = p.s;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(lerp(p.x0, p.x1, Math.max(0, e - 0.04)), lerp(p.y0, p.y1, Math.max(0, e - 0.04)));
      ctx.stroke();
    }
  }
  ctx.restore();
  // the brightest few twinkle as 4-point stars
  ctx.save();
  applyCam(ctx, cam);
  for (const p of DESC.slice(0, 36)) {
    const a = clamp((t - t0 - p.d) / 2.4);
    if (a <= 0) continue;
    const e = ease.outQuint(a);
    sparkle(ctx, lerp(p.x0, p.x1, e), lerp(p.y0, p.y1, e), 10 + p.s * 2, fade * (0.5 + 0.5 * Math.sin(t * 2.1 + p.x0)), "#ffffff", 0);
  }
  ctx.restore();
  lit.save();
  applyCam(lit, cam);
  for (const p of DESC.slice(0, 60)) {
    const a = clamp((t - t0 - p.d) / 2.4);
    if (a <= 0) continue;
    const e = ease.outQuint(a);
    glow(lit, lerp(p.x0, p.x1, e), lerp(p.y0, p.y1, e), 14, "#ffffff", 0.5 * fade);
  }
  lit.restore();
}

function foreground(ctx: Ctx, t: number, cam: Cam, heaven: number) {
  const L = layer("hagar-fg", 0.5);
  L.save();
  // stronger parallax than the world
  L.translate(W / 2, H / 2);
  L.scale(cam.z * 1.18, cam.z * 1.18);
  L.translate(-(cam.x - 960) * 1.3 - 960, -(cam.y - 540) * 1.3 - 540);
  L.fillStyle = mixHex("#140b12", "#2b2040", heaven);
  L.beginPath();
  L.moveTo(-200, 1200);
  L.lineTo(-200, 940);
  L.quadraticCurveTo(80, 880, 300, 960);
  L.quadraticCurveTo(420, 1010, 470, 1200);
  L.fill();
  L.beginPath();
  L.moveTo(2100, 1200);
  L.lineTo(2100, 900);
  L.quadraticCurveTo(1880, 860, 1700, 990);
  L.quadraticCurveTo(1640, 1060, 1620, 1200);
  L.fill();
  L.restore();
  paint(ctx, L, 0.95, "source-over", `blur(${(5 * (ctx.getTransform().a)).toFixed(1)}px)`);
}

function texts(ctx: Ctx, t: number) {
  const out1 = k(t, Wd(10, "«فرشته‌ی") - 0.6, Wd(10, "«فرشته‌ی"));
  title(ctx, [{ s: "پیدایش", f: "MorabbaLight" }, { s: "۱۶", f: "MorabbaBold" }], 250, 150, { size: 44, k: k(t, Wd(9, "پیدایش،") - 0.2, Wd(9, "پیدایش،") + 0.6), out: out1, align: "left", glow: 10 });
  title(ctx, [{ s: "هاجر", f: "MorabbaHeavy" }], 250, 214, { size: 70, k: k(t, Wd(9, "هاجر") - 0.1, Wd(9, "هاجر") + 0.6), out: out1, align: "left" });
  // the angel's names
  const nA = k(t, Wd(10, "خداوند،") - 0.3, Wd(10, "خداوند،") + 0.5);
  const swap = k(t, Wd(11, "خودِ") - 0.2, Wd(11, "خداست.") + 0.3);
  const nOut = k(t, S(12) - 0.4, S(12) + 0.3);
  title(ctx, [{ s: "فرشته‌ی", f: "MorabbaLight" }, { s: "خداوند", f: "MorabbaHeavy" }], 250, 160, { size: 62, k: nA, out: Math.max(swap, nOut), align: "left", shade: 0.3 });
  title(ctx, [{ s: "خداوند", f: "MorabbaHeavy" }], 250, 160, { size: 74, k: swap, out: nOut, align: "left", shade: 0.3 });
  // the promise
  title(ctx, [{ s: "«نسلِ تو را چنان زیاد می‌کنم که از شمار بیرون باشد»", f: "MorabbaLight" }], 960, 960, { size: 40, k: k(t, Wd(11, "«نسلِ") - 0.1, Wd(11, "باشد.»") + 0.3), out: k(t, E(11) + 0.6, E(11) + 1.3), glow: 12, shade: 0.4 });
  // El-Roi
  const roiOut = k(t, S(13) + 0.2, S(13) + 1.0);
  title(ctx, [{ s: "«تو خدایی هستی که", f: "MorabbaLight" }, { s: "مرا می‌بیند»", f: "MorabbaHeavy" }], 740, 150, { size: 64, k: k(t, Wd(12, "«تو") - 0.1, Wd(12, "می‌بیند.»") + 0.4), out: roiOut, shade: 0.35 });
  title(ctx, [{ s: "پیدایش ۱۶:۱۳", f: "MorabbaLight" }], 740, 225, { size: 30, k: k(t, Wd(12, "می‌بیند.»") - 0.2, Wd(12, "می‌بیند.»") + 0.6), out: roiOut, glow: 8, shade: 0.3 });
  // the puzzle: angel of the Lord = the Lord?
  const qIn = k(t, Wd(13, "فرشته‌ی") - 0.1, Wd(13, "خداوند،") + 0.3);
  const q2 = k(t, Wd(13, "خداونده؟") - 0.2, Wd(13, "خداونده؟") + 0.5);
  const qOut = k(t, Wd(13, "ببینه") - 0.3, Wd(13, "ببینه") + 0.4);
  title(ctx, [{ s: "فرشته‌ی", f: "MorabbaLight" }, { s: "خداوند", f: "MorabbaHeavy" }], 1270, 150, { size: 54, k: qIn, out: qOut, shade: 0.35 });
  title(ctx, [{ s: "=", f: "MorabbaLight" }], 1000, 150, { size: 60, k: q2, out: qOut, shade: 0.35 });
  title(ctx, [{ s: "خداوند؟", f: "MorabbaHeavy" }], 790, 150, { size: 54, k: q2, out: qOut, shade: 0.35 });
  title(ctx, [{ s: "«انسان نمی‌تواند مرا ببیند و زنده بماند» — خروج ۳۳:۲۰", f: "MorabbaLight" }], 960, 960, { size: 36, k: k(t, Wd(13, "هیچ‌کس") - 0.2, Wd(13, "ببینه") + 0.3), out: k(t, E(13) - 0.2, E(13) + 0.4), glow: 10, shade: 0.4 });
}
export const HAGAR_T = { tLight: () => Wd(10, "«فرشته‌ی") };
export const _h = { H };
// ---------- line 9: where she came from ----------
/** «که از خونه فرار کرده»: her footprints appear one by one across the sand, up to where she sits */
function footprints(c: Ctx, t: number) {
  const t0 = Wd(9, "فرار") - 0.3;
  if (t < t0) return;
  const fade = 1 - k(t, S(11), S(11) + 1.5);
  for (let i = 0; i < 16; i++) {
    const u = i / 15;
    const x = lerp(-60, HAGAR.x - 70, u), y = lerp(1010, HAGAR.y + 12, Math.pow(u, 0.8)) + (i % 2 ? 9 : -9);
    const a = clamp((t - t0 - i * 0.1) / 0.25) * fade;
    if (a <= 0) continue;
    c.fillStyle = rgba("#2a1820", 0.5 * a);
    c.beginPath();
    c.ellipse(x, y, 11 - u * 4, 5 - u * 1.6, -0.2, 0, TAU);
    c.fill();
  }
}
/** «کنیزِ مصریِ ابراهیم و سارا»: a memory bubble — their tent at night; then she walks away from it */
function memory(c: Ctx, t: number) {
  const t0 = Wd(9, "کنیزِ") - 0.2, tOut = Wd(9, "تنها،") - 0.2;
  const r = 175 * ease.outBack(clamp((t - t0) / 0.7), 1.4) * (1 - ease.in(clamp((t - tOut) / 0.6)));
  if (r < 1) return;
  const x = 1500, y = 330;
  c.save();
  c.globalCompositeOperation = "multiply";
  glow(c, x + 10, y + 16, r * 1.3, "#1a0e18", 0.45);
  c.restore();
  c.save();
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.clip();
  const g = c.createLinearGradient(0, y - r, 0, y + r);
  g.addColorStop(0, "#1c1840");
  g.addColorStop(1, "#4a3048");
  c.fillStyle = g;
  c.fillRect(x - r, y - r, r * 2, r * 2);
  stars(c, t, [x - r, y - r, r * 2, r], 30, 919, 0.8);
  c.fillStyle = "#2a1a26";
  c.fillRect(x - r, y + 70, r * 2, r);
  // the tent with a warm doorway
  c.fillStyle = "#3a2430";
  c.beginPath();
  c.moveTo(x - 110, y + 72);
  c.lineTo(x - 30, y - 10);
  c.lineTo(x + 50, y + 72);
  c.closePath();
  c.fill();
  c.fillStyle = "#ffbf73";
  c.beginPath();
  c.moveTo(x - 46, y + 72);
  c.lineTo(x - 30, y + 30);
  c.lineTo(x - 14, y + 72);
  c.fill();
  // Abraham and Sarah by the tent; Hagar walks away from them (right), into the night
  figureFlat(c, { x: x - 90, y: y + 72, h: 80, face: 1, pose: P({ head: 0.05 }), t, head: "wrap", beard: true, seed: 401 }, "#140c14");
  figureFlat(c, { x: x - 60, y: y + 72, h: 72, face: 1, pose: P({ head: 0.1 }), t, head: "veil", seed: 402 }, "#140c14");
  const run = clamp((t - Wd(9, "فرار") + 0.4) / 2.2);
  const hx = lerp(x + 40, x + 210, ease.inOut(run));
  figureFlat(c, { x: hx, y: y + 74, h: 70, face: 1, pose: run > 0 && run < 1 ? walk(t * 1.2, 0.9) : P({ head: 0.25 }), t, head: "veil", seed: 403 }, "#140c14");
  c.restore();
  c.save();
  c.strokeStyle = rgba("#ffffff", 0.6);
  c.lineWidth = 2;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.stroke();
  c.restore();
}