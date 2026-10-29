// Lines 1–8 (0:00–1:16), rebuilt so every phrase has its own action:
// the Bible opens → two realms rise out of it → heaven fills with light, earth with life → they part, a veil of
// cloud between → everyday life → the sky cracks and pours → a strange figure in the overlap (titles) → messengers
// fly from the throne to homes and people → the word «فرشته» grows roots to «فرستاده» → one messenger steps out and
// shines → «چطور؟» → the riddle: three appearances, a scrambled scroll, a balance scale (messenger or God?) →
// «یه مثال بزن»: Genesis opens, a page turns, the camera dives into Hagar's desert.
import { applyCam, bloom, Cam, Ctx, H, layer, paint, W } from "../lib/canvas";
import { glow, grain, painterly, sparkle, sparkles, vignette } from "../lib/fx";
import { bokeh, CloudPal, clouds, nebula, ridge, starsDeep } from "../lib/depth";
import { lightBeing } from "../lib/light";
import { balance, bird, book, crack, house, INK, inkLine, qmark, river, roots, scroll, tree, walker } from "../lib/lineart";
import { clamp, ease, k, lerp, rgba, rng, ss, TAU, win } from "../lib/math";
import { portal, popR } from "../lib/portal";
import { applyMask, drawStrokes, gooMask, linePts, partial } from "../lib/shape";
import { textOff, title } from "../lib/text";
import { E, S, W as Wd } from "../cues";
import { drawHagar } from "./hagar";
import { drawHoreb } from "./moses";
import { drawMount } from "./mount";
import { balls, lavBg, openArt, vesica, warmBg } from "./open";

const R0 = 215;
const VEIL: CloudPal = { shade: "#120a1e", mid: "#3a2a5c", lit: "#9a88d8", gamma: 1.1 };
const HEAVEN_CL: CloudPal = { shade: "#5a4cb8", mid: "#a898f0", lit: "#ffffff", gamma: 0.9 };
export const T = {
  book: Wd(1, "کتاب") - 0.25,
  real: Wd(1, "واقعیت") - 0.1,
  over: Wd(1, "روی") - 0.1,
  sky: Wd(1, "آسمان") - 0.15,
  earth: Wd(1, "زمین.") - 0.15,
  godR: Wd(1, "خدا،") - 0.3,
  ourR: Wd(1, "ما.") - 0.6,
  apart: Wd(2, "جدان") - 0.4,
  down: Wd(2, "ما") - 0.3,
  up: Wd(2, "آسمون") - 0.3,
  but: Wd(3, "ولی") - 0.1,
  life: Wd(3, "وسطِ") - 0.2,
  skyUp: Wd(3, "آسمون") - 0.3,
  crack: Wd(3, "یهو") + 0.1,
  pour: Wd(3, "می‌ریزه") - 0.35,
  fig: Wd(3, "شخصیتِ") - 0.2,
  name: Wd(3, "فرشته‌ی") - 0.1,
  trans: Wd(3, "ترجمه‌ها") - 0.6,
  name2: Wd(3, "فرشته‌ی", 1) - 0.1,
  map: E(3) + 0.3,
  angels: Wd(4, "فرشته‌ها") - 0.2,
  send: Wd(4, "فرستاده‌هایی") - 0.1,
  mission: Wd(4, "مأموریت") - 0.1,
  word: Wd(5, "حتی") - 0.3,
  root: Wd(5, "ریشه‌ای") - 0.3,
  sent: Wd(5, "«فرستاده».") - 0.2,
  row: Wd(5, "ولی") - 0.3,
  step: Wd(5, "خداوند...") - 0.6,
  notOrd: Wd(5, "معمولی") - 0.3,
  wipe: S(6) - 0.35,
  q: S(6),
  every: Wd(7, "هر") - 0.1,
  text: Wd(7, "متن") - 0.1,
  confuse: Wd(7, "گیج") - 0.4,
  ask: Wd(7, "آخرش") - 0.2,
  msg: Wd(7, "فرستاده‌ی") - 0.1,
  god: Wd(7, "یا") - 0.1,
  ex: S(8),
  flip: Wd(8, "مثال") - 0.1,
  dive: Wd(8, "بزن.") + 0.15,
  end: S(9) + 0.8,
};

// ---------------- the two circles ----------------
function sep(t: number) {
  let d = 262;
  d = lerp(d, 165, k(t, T.over, T.over + 1.0));
  d = lerp(d, 292, k(t, T.apart, T.apart + 1.1));
  d = lerp(d, 158, k(t, T.but, T.but + 0.9));
  return d;
}
const mixCam = (a: Cam, b: Cam, e: number): Cam => ({ x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e), z: lerp(a.z, b.z, e) });
function camAt(t: number): Cam {
  const d = sep(t);
  let c: Cam = { x: 960, y: 548, z: 1.04 + 0.05 * ss(0, 13, t) };
  c = mixCam(c, { x: 960, y: 540 + d + 10, z: 1.9 }, k(t, T.down, T.down + 1.0, ease.inOutSine));
  c = mixCam(c, { x: 960, y: 330, z: 1.12 }, k(t, T.up, T.up + 1.2, ease.inOutSine));
  c = mixCam(c, { x: 960, y: 540, z: 1.12 }, k(t, T.but - 0.3, T.but + 0.9, ease.inOutSine));
  c = mixCam(c, { x: 960, y: 540 + d + 24, z: 1.8 }, k(t, T.life, T.life + 1.1, ease.inOutSine));
  c = mixCam(c, { x: 960, y: 545, z: 1.5 }, k(t, T.skyUp, T.skyUp + 0.8, ease.inOutSine));
  c = mixCam(c, { x: 960, y: 540, z: 2.35 }, k(t, T.pour + 0.3, T.fig + 1.4, ease.inOutSine));
  c = mixCam(c, { x: 960, y: 540, z: 1.0 }, k(t, T.map, T.map + 1.5, ease.inOutSine));
  // the sky cracks: a short shake
  const sh = win(t, T.crack + 0.2, T.crack + 0.3, T.crack + 0.4, T.crack + 1.1);
  c.x += Math.sin(t * 61) * 9 * sh;
  c.y += Math.cos(t * 47) * 7 * sh;
  return c;
}

/** heaven's interior: lavender wash, throne arch drawing in, turning rays, drifting cloud bars, stars */
function heavenInside(c: Ctx, t: number, cx: number, cy: number, a: number) {
  if (a <= 0.002) return;
  const A = openArt();
  c.save();
  c.beginPath();
  c.arc(cx, cy, R0 - 2, 0, TAU);
  c.clip();
  const g = c.createRadialGradient(cx, cy - 40, 10, cx, cy, R0);
  g.addColorStop(0, rgba("#b9aaff", 0.75 * a));
  g.addColorStop(1, rgba("#4a3c94", 0.85 * a));
  c.fillStyle = g;
  c.fillRect(cx - R0, cy - R0, R0 * 2, R0 * 2);
  // slowly turning rays behind the throne
  c.save();
  c.globalCompositeOperation = "screen";
  c.translate(cx, cy - 60);
  c.rotate(t * 0.08);
  for (let i = 0; i < 16; i++) {
    c.rotate(TAU / 16);
    c.fillStyle = rgba("#ffffff", 0.06 * a);
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(-10, -R0 * 1.4);
    c.lineTo(10, -R0 * 1.4);
    c.closePath();
    c.fill();
  }
  c.restore();
  // real clouds drifting through heaven (two depths)
  clouds(c, t, [
    { name: "cu3", x: cx - 120, y: cy + 40, w: 420, sp: 9, a: 0.55 * a }, { name: "cu1", x: cx + 160, y: cy - 90, w: 380, sp: 6, a: 0.45 * a, flip: true },
    { name: "field", x: cx, y: cy + 150, w: 700, sp: 5, a: 0.5 * a, crop: [0, 0.05, 1, 0.6] },
  ], HEAVEN_CL, 1, [cx - R0 - 400, cx + R0 + 400]);
  c.translate(cx, cy);
  drawStrokes(c, A.top.strokes.slice(0, 7), t - T.sky + 2.3, { glow: 10, alpha: a, width: 2.4 }); // arch + rays (real clouds replace the bars)
  A.top.sparks.forEach(([x, y, s], j) => sparkle(c, x, y, s * (0.6 + 0.4 * Math.sin(t * 1.7 + j * 2.1)), a, "#ffffff", 0));
  c.restore();
}
/** earth's interior: warm sky and ground, mountains, river, house, trees, walking people, birds */
function earthInside(c: Ctx, t: number, cx: number, cy: number, a: number, wave: number, look: number) {
  if (a <= 0.002) return;
  const A = openArt();
  c.save();
  c.beginPath();
  c.arc(cx, cy, R0 - 2, 0, TAU);
  c.clip();
  const g = c.createLinearGradient(0, cy - R0, 0, cy + R0);
  g.addColorStop(0, rgba("#f4b58c", 0.8 * a));
  g.addColorStop(0.42, rgba("#e48d86", 0.8 * a));
  g.addColorStop(0.43, rgba("#7d4a63", 0.85 * a));
  g.addColorStop(1, rgba("#3e2440", 0.9 * a));
  c.fillStyle = g;
  c.fillRect(cx - R0, cy - R0, R0 * 2, R0 * 2);
  // depth behind the line art: a low sun, hazy far hills, nearer darker slopes
  c.save();
  c.globalCompositeOperation = "screen";
  glow(c, cx + 40, cy - 30, 160, "#ffd9a0", 0.6 * a);
  c.restore();
  c.save();
  c.globalAlpha = a;
  c.translate(cx, cy);
  ridge(c, { y0: -20, amp: 34, freq: 0.012, seed: 51, color: "#a06072", haze: "#ffc8a8", hazeA: 0.55, sharp: 0.5, x0: -R0, x1: R0, step: 6 });
  ridge(c, { y0: 30, amp: 26, freq: 0.01, seed: 52, color: "#6e3e5c", haze: "#e8a0a0", hazeA: 0.3, sharp: 0.3, x0: -R0, x1: R0, step: 6 });
  c.restore();
  c.translate(cx, cy);
  c.globalAlpha = a;
  drawStrokes(c, A.bot.strokes.slice(0, 2), t - T.earth + 3.6, { glow: 10, width: 2.4 });
  const tl = t - T.earth;
  river(c, Array.from({ length: 30 }, (_, i) => { const u = i / 29; return [10 + Math.sin(u * 5) * 24 * (1 - u) + u * 40, -40 + u * 260] as [number, number]; }), t, clamp(tl * 1.2));
  house(c, -120, 50, 1, clamp(tl * 1.4 - 0.2), win(t, T.ourR - 0.2, T.ourR + 0.3, T.but + 4, T.but + 5), t);
  tree(c, 100, 40, 1, clamp(tl * 1.4 - 0.4), t);
  tree(c, 150, 70, 0.8, clamp(tl * 1.4 - 0.5), t);
  // two people walking the land (back and forth), they wave / look up when the line says so
  const pp = (t * 0.06) % 2, px = pp < 1 ? lerp(-80, 50, pp) : lerp(50, -80, pp - 1);
  const face = pp < 1 ? 1 : -1;
  const stop = Math.max(wave, look);
  walker(c, px, 120, 1, t, { walk: 1 - stop, face: face as 1 | -1, wave, look, alpha: clamp(tl * 1.5 - 0.6) });
  walker(c, px - 26 * face, 124, 0.9, t + 0.4, { walk: 1 - stop, face: face as 1 | -1, wave: wave * 0.8, look, jar: true, alpha: clamp(tl * 1.5 - 0.8) });
  for (let i = 0; i < 3; i++) bird(c, -150 + (((t * 22 + i * 60) % 320)), -70 - i * 14, 0.8, t + i, clamp(tl - 0.6) * 0.9);
  c.restore();
}

// ---------------- the warm world: throne, horizon, places, messengers ----------------
const PLACES: [number, number][] = [[1520, 820], [1180, 812], [880, 820], [600, 818], [330, 822], [1760, 826]];
function mapScene(c: Ctx, t: number, a: number, arrive: number[]) {
  if (a <= 0.002) return;
  const A = openArt();
  c.save();
  c.globalAlpha = a;
  // the throne of light above
  c.save();
  c.translate(960, 290);
  c.scale(1.6, 1.6);
  drawStrokes(c, A.top.strokes.slice(0, 7), (t - T.map) * 1.5 + 3.0, { glow: INK.glow * 1.4, width: 3, color: INK.color });
  c.restore();
  c.save();
  c.globalCompositeOperation = "screen";
  glow(c, 960, 230, 260, "#ffffff", 0.75 * a);
  c.restore();
  // the horizon + places on earth
  inkLine(c);
  partial(c, linePts(80, 840, 1840, 840), 0.5 - 0.5 * clamp((t - T.map - 0.3) / 1.0), 0.5 + 0.5 * clamp((t - T.map - 0.3) / 1.0));
  const pr = clamp((t - T.map - 0.6) / 1.0);
  house(c, PLACES[0][0], PLACES[0][1] + 20, 2.0, pr, arrive[0], t);
  // a tent
  c.save();
  inkLine(c);
  partial(c, linePts(PLACES[1][0] - 80, 840, PLACES[1][0], 730, PLACES[1][0] + 80, 840), 0, pr);
  if (arrive[1] > 0) {
    c.fillStyle = rgba("#ffd28a", arrive[1]);
    c.beginPath();
    c.moveTo(PLACES[1][0] - 20, 840);
    c.lineTo(PLACES[1][0], 790);
    c.lineTo(PLACES[1][0] + 20, 840);
    c.fill();
  }
  c.restore();
  walker(c, PLACES[2][0], 840, 2.2, t, { walk: 0, wave: arrive[2], look: arrive[2], alpha: pr });
  c.save();
  inkLine(c);
  partial(c, linePts(PLACES[3][0] - 140, 840, PLACES[3][0] - 50, 720, PLACES[3][0], 770, PLACES[3][0] + 60, 690, PLACES[3][0] + 150, 840), 0, pr);
  c.restore();
  tree(c, PLACES[4][0], 840, 2.0, pr, t);
  walker(c, PLACES[5][0], 840, 2.2, t + 1, { walk: 0, face: -1, wave: arrive[5], look: arrive[5], alpha: pr });
  c.restore();
}
/** messenger i: a little figure of light carrying a scroll; returns its position */
function messenger(c: Ctx, x: number, y: number, s: number, a: number, t: number) {
  if (a <= 0.002) return;
  const A = openArt();
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.save();
  c.globalCompositeOperation = "screen";
  glow(c, 0, -20, 90, "#ffffff", 0.55 * a);
  c.restore();
  drawStrokes(c, A.fig.slice(0, 4), 9, { glow: INK.glow * 1.2, alpha: a, width: 3.6, color: INK.color });
  c.restore();
  sparkle(c, x + 26 * s, y - 20 * s, 9 * s, a * (0.6 + 0.4 * Math.sin(t * 4 + x)), "#ffffff", 0);
}

// ---------------- draw ----------------
export function drawPrologue(ctx: Ctx, t: number) {
  // dark ink while the world is warm and light (map, word, row of messengers); white glowing lines elsewhere
  const darkInk = t > T.map && t < T.wipe + 0.4;
  INK.color = darkInk ? "#3d2347" : "#ffffff";
  INK.glow = darkInk ? 0 : 10;
  try {
    prologue(ctx, t);
  } finally {
    INK.color = "#ffffff";
    INK.glow = 10;
  }
}
function prologue(ctx: Ctx, t: number) {
  const A = openArt();
  const cam = camAt(t);
  const d = sep(t);
  const lit = layer("pro-lit", 0.5);

  // ===== backgrounds: night → warm (poured in through metaballs) → lavender (wiped in, right → left) =====
  const warmFull = t > T.pour + 4.5;
  if (!warmFull) {
    painterly(ctx, t, "#1a0f24", "#120a1a", [
      { x: 500, y: 300, r: 620, c: "#2c1840", a: 0.8 },
      { x: 1500, y: 800, r: 700, c: "#26143a", a: 0.7 },
      { x: 1200, y: 200, r: 500, c: "#321c46", a: 0.5 },
    ], 2);
    // depth: a slow nebula, stars at three depths moving with the camera, out-of-focus light in front
    const px = (cam.x - 960) * cam.z, py = (cam.y - 540) * cam.z;
    nebula(ctx, t, ["#4a2a6a", "#6a3a7a", "#d8c0ff"], 0.3, 5, 1.1, "screen", -px * 0.1, -py * 0.1);
    starsDeep(ctx, t, 220, 7, 0.8, px, py);
    bokeh(ctx, t, { n: 8, seed: 3, color: "#d6c0ff", alpha: 0.1 * (1 - ss(T.pour, T.pour + 2, t)), size: 80, px: px * 1.5, py: py * 1.5, rise: 4 });
    // the realms' interiors belong to the night world: drawn here, under the light that pours in
    if (t > T.real + 0.3) {
      ctx.save();
      applyCam(ctx, cam);
      const wave = win(t, T.ourR, T.ourR + 0.4, T.apart - 0.2, T.apart + 0.4);
      const look = win(t, T.up - 0.2, T.up + 0.5, T.but, T.but + 0.8);
      heavenInside(ctx, t, 960, 540 - d, k(t, T.sky, T.sky + 0.8));
      earthInside(ctx, t, 960, 540 + d, k(t, T.earth, T.earth + 0.8), wave, look);
      ctx.restore();
    }
  }
  if (t > T.pour && t < T.wipe + 1.3) {
    const B = layer("pro-warm");
    warmBg(B, t);
    if (!warmFull) {
      const cb = balls(t, T.pour, 960, 540).map((b) => ({ x: (b.x - cam.x) * cam.z + 960, y: (b.y - cam.y) * cam.z + 540, r: b.r * cam.z }));
      applyMask(B, gooMask(cb, 0.25));
    }
    paint(ctx, B);
  }
  if (t > T.wipe) {
    const L = layer("pro-lav");
    lavBg(L, t, 1);
    const e = ease.inOut(clamp((t - T.wipe) / 1.1));
    if (e < 1) {
      // an organic edge sweeping from the right
      const edge = lerp(W + 300, -400, e);
      L.save();
      L.globalCompositeOperation = "destination-in";
      L.beginPath();
      L.moveTo(W + 50, -50);
      for (let y = -50; y <= H + 50; y += 30) L.lineTo(edge + Math.sin(y * 0.012 + t * 2) * 60 + (y - 540) * 0.25, y);
      L.lineTo(W + 50, H + 50);
      L.closePath();
      L.fill();
      L.restore();
    }
    paint(ctx, L);
  }

  // a point of light gathers where the book will appear
  if (t < T.book + 0.4) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const g0 = ss(0.2, T.book, t) * (1 - ss(T.book, T.book + 0.4, t));
    glow(ctx, 960, 570, 30 + 140 * g0, "#fff3d0", 0.9 * g0);
    sparkles(ctx, t, [860, 470, 200, 200], 6, 5, g0, "#ffffff", 6);
    ctx.restore();
  }
  // ===== 1–3a: the book and the two realms (camera space) =====
  const circlesA = 1 - k(t, T.map, T.map + 1.2);
  if (t < T.map + 1.3) {
    ctx.save();
    applyCam(ctx, cam);
    // the book that everything comes out of
    if (t > T.book && t < T.real + 2) {
      const pop = ease.outBack(clamp((t - T.book) / 0.5), 1.4);
      const away = k(t, T.real + 0.6, T.real + 1.6);
      const flip = clamp((t - T.book - 1.0) / 0.5);
      ctx.save();
      ctx.globalAlpha = 1 - away;
      book(ctx, 960, 570 + away * 60, 0.75 * pop * (1 - 0.4 * away), k(t, T.book + 0.1, T.book + 0.9), flip, k(t, T.book + 0.6, T.book + 1.2));
      ctx.restore();
      // two lights rise out of it
      const rise = k(t, T.real, T.real + 0.9, ease.out);
      if (rise > 0) {
        for (const sd of [-1, 1]) {
          const oy = lerp(560, 540 + sd * 262, rise);
          ctx.save();
          ctx.globalCompositeOperation = "screen";
          glow(ctx, 960, oy, 70, "#ffffff", 0.9 * (1 - k(t, T.real + 1.2, T.real + 2.0)));
          ctx.restore();
        }
      }
    }
    if (t > T.real + 0.3) {
      const cTop: [number, number] = [960, 540 - d], cBot: [number, number] = [960, 540 + d];
      
      // «قلمروی خدا» / «قلمروی ما»: rings of light go out
      for (const [tt, cc] of [[T.godR, cTop], [T.ourR, cBot]] as const) {
        const ph = clamp((t - tt) / 1.4);
        if (ph > 0 && ph < 1) {
          ctx.save();
          inkLine(ctx, "#ffffff", 3 * (1 - ph), 14);
          ctx.globalAlpha = 1 - ph;
          ctx.beginPath();
          ctx.arc(cc[0], cc[1], R0 * (1 + 0.3 * ease.out(ph)), 0, TAU);
          ctx.stroke();
          ctx.restore();
        }
      }
      // the two rings themselves (thinner as we zoom in)
      const ring = [
        { pts: [...Array(91)].map((_, i) => [Math.cos(-Math.PI / 2 + (i / 90) * Math.PI) * R0, Math.sin(-Math.PI / 2 + (i / 90) * Math.PI) * R0] as [number, number]), t0: 0, t1: 1.2 },
        { pts: [...Array(91)].map((_, i) => [Math.cos(-Math.PI / 2 - (i / 90) * Math.PI) * R0, Math.sin(-Math.PI / 2 - (i / 90) * Math.PI) * R0] as [number, number]), t0: 0, t1: 1.2 },
      ];
      for (const cc of [cTop, cBot]) {
        ctx.save();
        ctx.translate(cc[0], cc[1]);
        drawStrokes(ctx, ring, t - T.real - 0.3, { glow: 12, alpha: 0.95 * circlesA, width: 2.8 / Math.max(1, cam.z * 0.7) });
        ctx.restore();
      }
      // the veil of cloud that slides between them (line 2), then parts (line 3)
      const veil = k(t, T.apart + 0.2, T.apart + 1.3, ease.inOut) * (1 - k(t, T.but, T.but + 0.9, ease.inOut));
      if (veil > 0.002) {
        // real storm-dark clouds slide in from both sides and close between the two realms
        clouds(ctx, t, [
          { name: "cu4", x: lerp(-700, 700, veil), y: 545, w: 760, crop: [0, 0.05, 1, 0.8] },
          { name: "cu3", x: lerp(2600, 1230, veil), y: 535, w: 760, flip: true },
          { name: "field", x: lerp(-900, 820, veil), y: 590, w: 900, a: 0.9, crop: [0, 0.1, 1, 0.5] },
          { name: "cu1", x: lerp(2800, 1120, veil), y: 590, w: 760, a: 0.95 },
        ], VEIL, 1);
      }
      // the sky cracks open in the overlap (line 3 «می‌شکافه»)
      const cr = clamp((t - T.crack) / 0.4);
      const crA = 1 - k(t, T.pour + 0.6, T.pour + 1.6);
      if (cr > 0 && crA > 0) {
        ctx.save();
        ctx.globalAlpha = crA;
        crack(ctx, [960 - 150, 536], [960 + 150, 544], cr, 9);
        ctx.restore();
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        glow(ctx, 960, 540, 260, "#fff1cc", 0.7 * win(t, T.crack + 0.25, T.crack + 0.4, T.crack + 0.6, T.pour + 1.0));
        ctx.restore();
      }
      // the strange figure in the mandorla (line 3)
      if (t > T.fig) {
        const fOut = k(t, T.map, T.map + 0.8);
        const toLight = k(t, T.fig + 1.0, T.fig + 2.2);
        ctx.save();
        ctx.translate(960, 548);
        ctx.scale(0.85, 0.85);
        drawStrokes(ctx, A.fig, t - T.fig - 0.2, { glow: 14, alpha: (1 - toLight * 0.7) * (1 - fOut), width: 3.2 });
        ctx.restore();
        lightBeing(ctx, lit, { x: 960, y: 600, h: 140, t, k: toLight * (1 - fOut), rays: 1.6, aura: 0.8, warm: 0.3 });
        sparkles(ctx, t, [880, 440, 160, 200], 6, 33, toLight * (1 - fOut), "#ffffff", 5);
      }
    }
    ctx.restore();
  }

  // ===== 3b–4: titles, translations, then the map: messengers fly out from the throne =====
  // titles go in the clear band at the bottom, never over the circle lines
  const nOut = k(t, T.map - 0.2, T.map + 0.4);
  title(ctx, [{ s: "فرشته‌ی", f: "MorabbaLight" }, { s: "یَهوه", f: "MorabbaHeavy" }], 960, 940, { size: 84, k: k(t, T.name, T.name + 0.8), out: Math.max(nOut, k(t, T.name2 - 0.3, T.name2 + 0.2)) });
  title(ctx, [{ s: "فرشته‌ی", f: "MorabbaLight" }, { s: "خداوند", f: "MorabbaHeavy" }], 960, 940, { size: 84, k: k(t, T.name2, T.name2 + 0.8), out: nOut });
  // «بیشترِ ترجمه‌ها»: books slide up and open on both sides
  const tb = k(t, T.trans, T.trans + 0.9, ease.out) * (1 - nOut);
  if (tb > 0.002) {
    for (const [i, x] of [[0, 330], [1, 1590]] as const) {
      const yy = lerp(1300, 860, ease.outBack(clamp((t - T.trans - i * 0.2) / 0.9), 1.2));
      ctx.save();
      ctx.globalAlpha = 1 - nOut;
      book(ctx, x, yy, 0.62, k(t, T.trans + 0.15 + i * 0.2, T.trans + 0.8 + i * 0.2), 0, k(t, T.name2, T.name2 + 0.6));
      ctx.restore();
    }
    title(ctx, [{ s: "در بیشترِ ترجمه‌ها", f: "MorabbaLight" }], 960, 1030, { size: 34, k: k(t, T.trans + 0.3, T.trans + 1.0), out: nOut });
  }
  // the map + messengers (line 4)
  const mapA = k(t, T.map + 0.2, T.map + 1.2) * (1 - k(t, T.word - 0.3, T.word + 0.5));
  const arriveAt = (i: number) => T.send + i * 0.22 + 1.7;
  const arrive = PLACES.map((_, i) => k(t, arriveAt(i), arriveAt(i) + 0.4) * mapA);
  mapScene(ctx, t, mapA, arrive);
  if (t > T.angels && mapA > 0.002) {
    for (let i = 0; i < 6; i++) {
      const sx = 960 + (i - 2.5) * 120, sy = 380 + Math.abs(i - 2.5) * 18;
      const born = ease.outBack(clamp((t - T.angels - i * 0.1) / 0.5), 1.5);
      const go = ease.inOut(clamp((t - T.send - i * 0.22) / 1.7));
      const [tx, ty] = [PLACES[i][0], PLACES[i][1] - 40];
      const cx = (sx + tx) / 2 + (i % 2 ? 160 : -160), cy = Math.min(sy, ty) - 60;
      const x = (1 - go) * (1 - go) * sx + 2 * (1 - go) * go * cx + go * go * tx;
      const y = (1 - go) * (1 - go) * sy + 2 * (1 - go) * go * cy + go * go * ty;
      const fade = mapA * (1 - k(t, arriveAt(i) + 0.3, arriveAt(i) + 1.0));
      if (go > 0.02 && go < 1) {
        // a short light streak behind
        const gb = Math.max(0, go - 0.08);
        const bx = (1 - gb) * (1 - gb) * sx + 2 * (1 - gb) * gb * cx + gb * gb * tx, by = (1 - gb) * (1 - gb) * sy + 2 * (1 - gb) * gb * cy + gb * gb * ty;
        ctx.save();
        const gr = ctx.createLinearGradient(bx, by - 30, x, y - 30);
        gr.addColorStop(0, "rgba(255,255,255,0)");
        gr.addColorStop(1, rgba("#ffffff", 0.85 * fade));
        ctx.strokeStyle = gr;
        ctx.lineWidth = 7;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(bx, by - 30);
        ctx.lineTo(x, y - 30);
        ctx.stroke();
        ctx.restore();
      }
      messenger(ctx, x, y, 0.8 * born, fade, t);
      // arrival: a ring of light at the place
      const ar = clamp((t - arriveAt(i)) / 0.9);
      if (ar > 0 && ar < 1) {
        ctx.save();
        inkLine(ctx, "#ffffff", 3 * (1 - ar), 12);
        ctx.globalAlpha = (1 - ar) * mapA;
        ctx.beginPath();
        ctx.ellipse(tx, ty + 20, 30 + 90 * ar, 10 + 30 * ar, 0, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
  title(ctx, [{ s: "فرستاده‌ها", f: "MorabbaBold" }], 960, 990, { size: 56, k: k(t, T.send, T.send + 0.8), out: k(t, T.word - 0.6, T.word) });

  // ===== 5: the word and its root; one messenger is not like the others =====
  const wOut = k(t, T.row - 0.2, T.row + 0.4);
  title(ctx, [{ s: "فرشته", f: "MorabbaHeavy" }], 960, 300, { size: 170, k: k(t, T.word + 0.6, T.word + 1.6), out: wOut });
  if (t > T.root) {
    ctx.save();
    ctx.globalAlpha = 1 - wOut;
    roots(ctx, 960, 395, 1.25, k(t, T.root, T.root + 1.3), 3, "#6a4232");
    ctx.restore();
  }
  title(ctx, [{ s: "فْرِشتَگ", f: "MorabbaBold" }], 960, 760, { size: 66, k: k(t, T.root + 0.7, T.root + 1.4), out: wOut });
  title(ctx, [{ s: "(پهلوی)", f: "MorabbaLight" }], 960, 818, { size: 32, k: k(t, T.root + 0.9, T.root + 1.5), out: wOut });
  title(ctx, [{ s: "یعنی", f: "MorabbaLight" }, { s: "«فرستاده»", f: "MorabbaHeavy" }], 960, 905, { size: 60, k: k(t, T.sent, T.sent + 0.7), out: wOut });
  if (t > T.sent && wOut < 1) messenger(ctx, lerp(1300, 1180, ease.out(clamp((t - T.sent) / 0.8))), 900, 0.5, k(t, T.sent, T.sent + 0.5) * (1 - wOut), t);
  // a row of messengers; the angel of the Lord steps forward and becomes light
  const rowA = k(t, T.row + 0.1, T.row + 0.8) * (1 - k(t, T.wipe + 0.2, T.wipe + 0.9));
  if (rowA > 0.002) {
    ctx.save();
    inkLine(ctx);
    ctx.globalAlpha = rowA;
    partial(ctx, linePts(380, 840, 1540, 840), 0, k(t, T.row, T.row + 0.8));
    ctx.restore();
    const step = k(t, T.step, T.step + 1.2, ease.inOut);
    const dim = k(t, T.notOrd, T.notOrd + 0.8);
    for (let i = 0; i < 5; i++) {
      if (i === 2) continue;
      messenger(ctx, 560 + i * 200, 820, 1.0 - 0.15 * dim, rowA * (1 - 0.72 * dim), t);
    }
    const cs = lerp(1.0, 1.7, step);
    messenger(ctx, 960, lerp(820, 860, step), cs, rowA * (1 - k(t, T.step + 0.6, T.step + 1.6)), t);
    lightBeing(ctx, lit, { x: 960, y: 870, h: 260, t, k: rowA * k(t, T.step + 0.5, T.step + 1.6), rays: 1 + 2.5 * win(t, T.notOrd, T.notOrd + 0.4, T.notOrd + 1.2, T.wipe), aura: 1, warm: 0.4 });
    const burst = clamp((t - T.notOrd - 0.2) / 1.2);
    if (burst > 0 && burst < 1) {
      ctx.save();
      inkLine(ctx, "#ffffff", 4 * (1 - burst), 18);
      ctx.globalAlpha = rowA * (1 - burst);
      ctx.beginPath();
      ctx.arc(960, 740, 60 + 420 * ease.out(burst), 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }
  title(ctx, [{ s: "فرشته‌ی", f: "MorabbaLight" }, { s: "خداوند", f: "MorabbaHeavy" }], 960, 200, { size: 64, k: k(t, T.step, T.step + 0.8), out: k(t, T.wipe, T.wipe + 0.6) });
  title(ctx, [{ s: "یه فرشته‌ی", f: "MorabbaLight" }, { s: "معمولی نیست", f: "MorabbaHeavy" }], 960, 280, { size: 46, k: k(t, T.notOrd + 0.2, T.notOrd + 0.9), out: k(t, T.wipe, T.wipe + 0.6) });

  // ===== 6–7: the riddle =====
  if (t > T.q && t < T.every + 1.0) qmark(ctx, 960, 500, 2.4, k(t, T.q + 0.1, T.q + 1.0) * (1 - k(t, T.every, T.every + 0.5)));
  // «هر بار که ظاهر می‌شه»: three of his appearances pop up, right → left
  if (t > T.every && t < T.text + 1.0) {
    const scenes: [(c: Ctx) => void, number, number, number][] = [
      [(c) => drawHagar(c, 93 + (t - T.every) * 0.3), 1000, 560, 520],
      [(c) => drawHoreb(c, 190 + (t - T.every) * 0.3), 1250, 700, 470],
      [(c) => drawMount(c, 293.5 + (t - T.every) * 0.3), 1060, 600, 420],
    ];
    const prev = textOff.v;
    textOff.v = true;
    scenes.forEach(([draw, cx, cy, crop], i) => {
      const r = popR(t, T.every + i * 0.4, 165, 0.7) * (1 - ease.in(k(t, T.text + i * 0.1, T.text + 0.5 + i * 0.1)));
      const x = 1400 - i * 440;
      if (r > 1) portal(ctx, { id: "pro-p" + i, draw, x, y: 540, r, cx, cy, crop, seed: 60 + i, t });
      const fl = win(t, T.every + i * 0.4, T.every + i * 0.4 + 0.15, T.every + i * 0.4 + 0.3, T.every + i * 0.4 + 0.8);
      if (fl > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        glow(ctx, x, 540, 240, "#ffffff", 0.7 * fl);
        ctx.restore();
      }
    });
    textOff.v = prev;
  }
  // «متن عمداً جوری توصیفش می‌کنه که آدم گیج بشه»: a scroll whose lines scramble
  if (t > T.text && t < T.ask + 1.4) {
    const open = k(t, T.text + 0.2, T.text + 1.1) * (1 - k(t, T.ask, T.ask + 0.7));
    const mess = k(t, T.confuse + 0.1, T.confuse + 1.1);
    ctx.save();
    ctx.globalAlpha = 1 - k(t, T.ask + 0.4, T.ask + 0.9);
    scroll(ctx, 960, 540, 1000, 300, open, k(t, T.text + 0.9, T.text + 2.1), mess, t);
    ctx.restore();
    const r = rng(77);
    for (let i = 0; i < 7; i++) {
      const qx = 520 + r() * 880, qy = 330 + r() * 420;
      const qp = k(t, T.confuse + 0.3 + i * 0.12, T.confuse + 0.8 + i * 0.12) * (1 - k(t, T.ask, T.ask + 0.5));
      if (qp > 0) qmark(ctx, qx, qy + Math.sin(t * 3 + i) * 6, 0.55, qp, "#ffffff");
    }
  }
  // «فرستاده‌ی خدا… یا خودِ خدا؟»: a balance scale weighs it
  if (t > T.ask + 0.4 && t < T.ex + 1.2) {
    const fadeS = 1 - k(t, T.ex, T.ex + 0.6);
    let ang = 0;
    if (t > T.msg) ang = 0.2 * (1 - Math.exp(-(t - T.msg) * 5) * Math.cos((t - T.msg) * 9));
    if (t > T.god) ang = 0.2 * Math.exp(-(t - T.god) * 1.6) * Math.cos((t - T.god) * 5.5);
    ctx.save();
    ctx.globalAlpha = fadeS;
    const pans = balance(ctx, 960, 600, 1.0, ang, k(t, T.ask + 0.5, T.ask + 1.8));
    // right pan: a messenger drops in; left pan: the throne-light
    const [L, Rr] = pans;
    const dm = ease.outBack(clamp((t - T.msg) / 0.5), 1.2), dg = ease.outBack(clamp((t - T.god) / 0.5), 1.2);
    if (t > T.msg) messenger(ctx, Rr[0], lerp(Rr[1] - 300, Rr[1] - 6, dm), 0.6, fadeS, t);
    if (t > T.god) {
      ctx.save();
      ctx.translate(L[0], lerp(L[1] - 300, L[1] - 50, dg));
      ctx.scale(0.42, 0.42);
      drawStrokes(ctx, A.top.strokes.slice(0, 7), 99, { glow: 16, alpha: fadeS, width: 5 });
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      glow(ctx, L[0], lerp(L[1] - 300, L[1] - 70, dg), 90, "#ffffff", 0.6 * fadeS);
      ctx.restore();
    }
    if (t > T.god + 0.9) qmark(ctx, 960, 300, 0.7, k(t, T.god + 0.9, T.god + 1.6) * fadeS);
    ctx.restore();
    title(ctx, [{ s: "فرستاده‌ی خدا؟", f: "MorabbaBold" }], Rr[0], Rr[1] + 150, { size: 50, k: k(t, T.msg + 0.2, T.msg + 0.9), out: k(t, T.ex, T.ex + 0.5) });
    title(ctx, [{ s: "یا", f: "MorabbaLight" }, { s: "خودِ خدا؟", f: "MorabbaHeavy" }], L[0], L[1] + 150, { size: 50, k: k(t, T.god + 0.2, T.god + 0.9), out: k(t, T.ex, T.ex + 0.5) });
  }

  // ===== 8: «یه مثال بزن»: Genesis opens, a page turns, we dive into it =====
  if (t > T.ex + 0.2) {
    const rise = ease.out(clamp((t - T.ex - 0.2) / 0.8));
    const open = k(t, T.ex + 0.8, T.flip);
    const flip = clamp((t - T.flip) / 0.7);
    const e = ease.inOutSine(k(t, T.dive, T.end));
    const pc: [number, number] = [960 + 124 * 1.1, 560]; // centre of the right page on screen
    const Z = lerp(1, 12, Math.pow(e, 1.5)); // the page edges leave the frame before the hand-over
    const cxs = lerp(pc[0], 960, e), cys = lerp(pc[1], 540, e);
    ctx.save();
    ctx.translate(cxs, cys);
    ctx.scale(Z, Z);
    ctx.translate(-pc[0], -pc[1]);
    const box = book(ctx, 960, lerp(1400, 560, rise), 1.1, open, flip, 0.3 * open);
    ctx.restore();
    // the desert shows on the right page after the page has turned
    const show = k(t, T.flip + 0.45, T.flip + 0.8);
    if (show > 0) {
      const L = layer("pro-desert");
      const sd0 = Math.max((box.w * 1.1) / W, (box.h * 1.1) / H);
      const sc = lerp(sd0, 1, e);
      L.save();
      L.translate(lerp(pc[0], 960, e), lerp(pc[1], 540, e));
      L.scale(sc, sc);
      L.translate(-960, -540);
      drawHagar(L, t);
      L.restore();
      // keep it inside the (zoomed) page
      L.save();
      L.globalCompositeOperation = "destination-in";
      L.translate(cxs, cys);
      L.scale(Z, Z);
      L.translate(-pc[0], -pc[1]);
      L.fillRect(960 + box.x0 * 1.1, 560 + box.y0 * 1.1, box.w * 1.1, box.h * 1.1);
      L.restore();
      paint(ctx, L, show);
    }
    title(ctx, [{ s: "پیدایش", f: "MorabbaHeavy" }], 960 - 125 * 1.1, 560, { size: 46, k: k(t, T.ex + 0.9, T.ex + 1.3), out: k(t, T.flip + 0.35, T.flip + 0.6), color: "#3a2149" });
  }

  bloom(ctx, lit, 0.9, 40);
  vignette(ctx, t < T.pour + 2 ? 0.5 : 0.25, "#120a19");
  // circle labels (night part), outside the circles on the right
  const lx = 960 + (R0 + 80) * cam.z;
  const yT = (540 - d - cam.y) * cam.z + 540, yB = (540 + d - cam.y) * cam.z + 540;
  const outL = k(t, T.apart - 0.4, T.apart + 0.2);
  title(ctx, [{ s: "آسمان", f: "MorabbaBold" }], lx, yT - 14, { size: 56, k: k(t, T.sky, T.sky + 0.8), out: outL, align: "left" });
  title(ctx, [{ s: "قلمروی خدا", f: "MorabbaLight" }], lx, yT + 44, { size: 32, k: k(t, T.godR, T.godR + 0.8), out: outL, align: "left" });
  title(ctx, [{ s: "زمین", f: "MorabbaBold" }], lx, yB - 14, { size: 56, k: k(t, T.earth, T.earth + 0.8), out: outL, align: "left" });
  title(ctx, [{ s: "قلمروی ما", f: "MorabbaLight" }], lx, yB + 44, { size: 32, k: k(t, T.ourR, T.ourR + 0.8), out: outL, align: "left" });
  title(ctx, [{ s: "کتاب مقدس", f: "MorabbaBold" }], 960, 860, { size: 50, k: k(t, T.book + 0.3, T.book + 1.0), out: k(t, T.real + 0.4, T.real + 1.0) });
  grain(ctx, t, 0.15);
}
export const _pg = { vesica };
