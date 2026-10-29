// Lines 1–8: two realms as line art → heaven pours into earth (metaballs) → the mandorla where they overlap
// holds «فرشته‌ی یَهوه» → «فرشته = فرستاده» → warm turns lavender: messenger, or God himself?
import { applyCam, bloom, Ctx, H, layer, paint, W } from "../lib/canvas";
import { glow, grain, motes, painterly, ribbons, sparkle, sparkles, stars, vignette } from "../lib/fx";
import { CloudPal, clouds, godRays } from "../lib/depth";
import { clamp, ease, k, lerp, rng, ss, TAU, win } from "../lib/math";
import { applyMask, arcPts, Ball, drawStrokes, gooMask, linePts, Stroke } from "../lib/shape";
import { title } from "../lib/text";
import { E, S, W as Wd } from "../cues";

const R0 = 215;
/** circle centres: apart → overlap → a little apart (line 2) → deep overlap (line 3) */
export function sep(t: number) {
  let d = lerp(222, 165, k(t, 1.2, 2.8));
  d = lerp(d, 200, k(t, Wd(2, "جدان") - 0.2, Wd(2, "جدان") + 1.0));
  d = lerp(d, 158, k(t, Wd(3, "ولی"), Wd(3, "ولی") + 2.2));
  return d;
}
// ---------- line art (built once, in circle-local coords, origin = circle centre) ----------
type Art = { strokes: Stroke[]; sparks: [number, number, number][] };
let ART: { top: Art; bot: Art; fig: Stroke[]; ring: Stroke[] } | null = null;
function build() {
  const r = rng(19);
  const top: Stroke[] = [], bot: Stroke[] = [];
  // circles: each drawn as two halves from its outer pole
  const ring: Stroke[] = [
    { pts: arcPts(0, 0, R0, -Math.PI / 2, Math.PI / 2, 90), t0: 0.15, t1: 1.3 },
    { pts: arcPts(0, 0, R0, -Math.PI / 2, -Math.PI * 1.5, 90), t0: 0.15, t1: 1.3 },
  ];
  // heaven: a pointed arch of light (throne-room window), rays, cloud bars, stars
  const arch = (w: number, hgt: number, y0: number): [number, number][] => {
    const o: [number, number][] = [];
    o.push([-w / 2, y0]);
    for (let i = 0; i <= 24; i++) {
      const a = i / 24;
      o.push([-w / 2 + (w / 2) * Math.sin((a * Math.PI) / 2), y0 - hgt * 0.45 - hgt * 0.55 * Math.sin((a * Math.PI) / 2) ** 1.6]);
    }
    for (let i = 24; i >= 0; i--) {
      const a = i / 24;
      o.push([w / 2 - (w / 2) * Math.sin((a * Math.PI) / 2), y0 - hgt * 0.45 - hgt * 0.55 * Math.sin((a * Math.PI) / 2) ** 1.6]);
    }
    o.push([w / 2, y0]);
    return o;
  };
  top.push({ pts: arch(84, 150, 92), t0: 3.0, t1: 4.0 });
  top.push({ pts: arch(46, 96, 92), t0: 3.4, t1: 4.3 });
  top.push({ pts: linePts(-62, 92, 62, 92), t0: 3.0, t1: 3.6 });
  top.push({ pts: linePts(-40, 106, 40, 106), t0: 3.3, t1: 3.9 });
  for (const [x, l] of [[0, 26], [-26, 16], [26, 16]] as const) top.push({ pts: linePts(x, -84 - (x ? 0 : 6), x, -84 - l - (x ? 0 : 6)), t0: 4.1, t1: 4.5 });
  const bar = (x: number, y: number, w: number, h: number): [number, number][] => {
    const o: [number, number][] = [];
    for (let i = 0; i <= 16; i++) o.push([x + w - h / 2 + (Math.cos(-Math.PI / 2 + (i / 16) * Math.PI) * h) / 2, y + (Math.sin(-Math.PI / 2 + (i / 16) * Math.PI) * h) / 2]);
    for (let i = 0; i <= 16; i++) o.push([x + h / 2 + (Math.cos(Math.PI / 2 + (i / 16) * Math.PI) * h) / 2, y + (Math.sin(Math.PI / 2 + (i / 16) * Math.PI) * h) / 2]);
    o.push(o[0]);
    return o;
  };
  [[-190, -30, 92], [-176, 0, 70], [-150, 30, 54], [98, -40, 88], [116, -10, 70], [96, 20, 60]].forEach(([x, y, w], i) =>
    top.push({ pts: bar(x, y, w, 18), t0: 2.3 + i * 0.12, t1: 3.1 + i * 0.12 }));
  const sparks: [number, number, number][] = [[0, -150, 11], [-120, -110, 7], [128, -100, 8], [-160, 70, 6], [150, 64, 7]];
  for (let i = 0; i < 14; i++) {
    const a = r() * TAU, d = 40 + r() * 170;
    const x = Math.cos(a) * d, y = Math.sin(a) * d * 0.8 - 30;
    if (Math.hypot(x, y) < R0 - 20 && y < 60) sparks.push([x, y, 2.5]);
  }
  // earth: mountains, a road to the horizon, two people, a tree, water
  bot.push({ pts: linePts(-205, 40, -170, -30, -140, 20, -112, -46, -76, 30), t0: 3.6, t1: 4.6 });
  bot.push({ pts: linePts(205, 40, 168, -26, 140, 18, 108, -52, 74, 30), t0: 3.6, t1: 4.6 });
  const road = (s: number): [number, number][] => Array.from({ length: 30 }, (_, i) => {
    const a = i / 29;
    return [s * (6 + a * 70) + Math.sin(a * 5) * 14 * (1 - a), -70 + a * 250];
  });
  bot.push({ pts: road(-1), t0: 3.2, t1: 4.2 }, { pts: road(1), t0: 3.2, t1: 4.2 });
  bot.push({ pts: linePts(-90, -70, 90, -70), t0: 3.1, t1: 3.7 });
  const person = (x: number, y: number): Stroke[] => [
    { pts: arcPts(x, y - 46, 7, 0, TAU, 24), t0: 5.4, t1: 5.9 },
    { pts: linePts(x - 5, y - 37, x - 12, y, x + 12, y, x + 5, y - 37), t0: 5.5, t1: 6.2 },
  ];
  bot.push(...person(-22, 100), ...person(18, 104));
  bot.push({ pts: linePts(-150, 90, -150, 50), t0: 4.6, t1: 5.0 }, { pts: linePts(-182, 50, -118, 50, -128, 40, -172, 40, -182, 50), t0: 4.8, t1: 5.4 });
  const wave = (y: number, x0: number, x1: number): [number, number][] => Array.from({ length: 60 }, (_, i) => [lerp(x0, x1, i / 59), y + Math.sin(i * 0.9) * 4]);
  bot.push({ pts: wave(150, -150, 150), t0: 4.9, t1: 5.8 }, { pts: wave(166, -120, 120), t0: 5.1, t1: 5.9 });
  // the figure that appears inside the overlap (mandorla space; local coords, 1 unit = 1 design px at zoom 1)
  const fig: Stroke[] = [
    { pts: arcPts(0, -66, 9, -Math.PI / 2, Math.PI * 1.5, 30), t0: 0, t1: 0.6 },
    { pts: linePts(-9, -54, -15, -38, -20, 4, -26, 60, 26, 60, 20, 4, 15, -38, 9, -54), t0: 0.2, t1: 1.3 },
    { pts: linePts(-15, -38, -34, -10, -40, 14), t0: 0.7, t1: 1.3 },
    { pts: linePts(15, -38, 34, -10, 40, 14), t0: 0.7, t1: 1.3 },
    { pts: linePts(0, -88, 0, -100), t0: 1.0, t1: 1.3 },
    { pts: linePts(-12, -84, -18, -94), t0: 1.05, t1: 1.35 },
    { pts: linePts(12, -84, 18, -94), t0: 1.05, t1: 1.35 },
  ];
  ART = { top: { strokes: top, sparks }, bot: { strokes: bot, sparks: [] }, fig, ring };
}

/** the line art of the opening (heaven icons, earth icons, the little figure), built once */
export function openArt() {
  if (!ART) build();
  return ART!;
}

// ---------- backdrops ----------
const NIGHT = "#1b1024";
function nightBg(c: Ctx, t: number) {
  painterly(c, t, "#1a0f24", "#140b1c", [
    { x: 500, y: 300, r: 620, c: "#2c1840", a: 0.8 },
    { x: 1500, y: 800, r: 700, c: "#26143a", a: 0.7 },
    { x: 1200, y: 200, r: 500, c: "#321c46", a: 0.5 },
  ], 2);
}
/** warm heaven-light world (inside the metaballs): peach sky, soft real clouds in two depths, rays from above */
const WARM_NEAR: CloudPal = { shade: "#e49890", mid: "#f7c4a4", lit: "#fff7ea", gamma: 0.9 };
const WARM_FAR: CloudPal = { shade: "#f0b09c", mid: "#f8d2b4", lit: "#fff4e4", gamma: 1.1 };
export function warmBg(c: Ctx, t: number, a = 1) {
  c.save();
  c.globalAlpha = a;
  painterly(c, t, "#f8c495", "#ec9a88", [
    { x: 960, y: 520, r: 760, c: "#ffe2a8", a: 0.75 },
    { x: 260, y: 900, r: 620, c: "#e889a0", a: 0.55 },
    { x: 1700, y: 120, r: 600, c: "#ffb27c", a: 0.6 },
    { x: 1750, y: 950, r: 520, c: "#f19bb0", a: 0.45 },
    { x: 200, y: 120, r: 520, c: "#ffe2a6", a: 0.6 },
  ], 7);
  const dx = Math.sin(t * 0.05) * 20;
  c.save();
  c.translate(dx * 0.4, 0);
  clouds(c, t, [
    { name: "field", x: 960, y: 930, w: 2300, a: 0.55, sp: 3, crop: [0, 0.05, 1, 0.7] },
    { name: "cu2", x: 1500, y: 170, w: 1300, a: 0.5, sp: 2, flip: true },
  ], WARM_FAR, a, [-900, 2800]);
  c.restore();
  c.save();
  c.translate(dx, 0);
  clouds(c, t, [
    { name: "cu3", x: 240, y: 150, w: 1100, a: 0.8, sp: 4 }, { name: "cu1", x: 1780, y: 320, w: 1000, a: 0.7, sp: 3.5, flip: true },
    { name: "cu4", x: 120, y: 1020, w: 1100, a: 0.6, sp: 5, crop: [0, 0, 1, 0.75] },
  ], WARM_NEAR, a, [-900, 2800]);
  c.restore();
  godRays(c, t, 960, -60, { n: 16, len: 1300, spread: 1.6, dir: Math.PI / 2, color: "#fff4dc", alpha: 0.2 * a, width: 0.09, spin: 0, seed: 23, soft: 16 });
  motes(c, t, { n: 34, color: "#fff7dc", alpha: 0.5, seed: 11, dust: true });
  c.restore();
}
/** lavender sky: real clouds graded lilac in two depths, light ribbons, faint stars */
const LAV_NEAR: CloudPal = { shade: "#6a5ad0", mid: "#ad9ef0", lit: "#f8f2ff", gamma: 0.95 };
const LAV_FAR: CloudPal = { shade: "#8676dc", mid: "#b8acf2", lit: "#efe8ff", gamma: 1.1 };
export function lavBg(c: Ctx, t: number, a = 1) {
  if (a <= 0.002) return;
  c.save();
  c.globalAlpha = a;
  painterly(c, t, "#8d86f0", "#b48be8", [
    { x: 960, y: 480, r: 700, c: "#c9b8ff", a: 0.7 },
    { x: 200, y: 900, r: 620, c: "#7d6ee0", a: 0.6 },
    { x: 1700, y: 200, r: 600, c: "#a68cf2", a: 0.6 },
  ], 4);
  stars(c, t, [0, 0, W, H], 70, 4, 0.5 * a);
  clouds(c, t, [
    { name: "field", x: 960, y: 960, w: 2300, a: 0.6, sp: 3, crop: [0, 0.05, 1, 0.7] },
    { name: "cu5", x: 1650, y: 140, w: 1200, a: 0.45, sp: 2 },
  ], LAV_FAR, a, [-900, 2800]);
  clouds(c, t, [
    { name: "cu3", x: 180, y: 130, w: 1050, a: 0.75, sp: 4 }, { name: "cu1", x: 1820, y: 860, w: 1000, a: 0.65, sp: 3.5, flip: true },
    { name: "cu2", x: 160, y: 900, w: 900, a: 0.6, sp: 4.5, crop: [0, 0.3, 1, 0.7] },
  ], LAV_NEAR, a, [-900, 2800]);
  ribbons(c, t, [{ x0: 1100, y0: -50, x1: 1950, y1: 420, bend: 160 }, { x0: -60, y0: 640, x1: 700, y1: 1130, bend: -140 }], "#f0e8ff", 0.2 * a);
  motes(c, t, { n: 26, color: "#ffffff", alpha: 0.4, seed: 12, dust: true });
  c.restore();
}

// ---------- the mandorla (overlap of the two circles), in design coords at zoom 1 ----------
export function vesica(cx: number, cy: number, d: number, r = R0) {
  const p = new Path2D();
  const h = Math.sqrt(Math.max(0, r * r - d * d));
  const a1 = Math.atan2(d, h); // angle from either centre to the right-hand intersection
  p.arc(cx, cy - d, r, a1, Math.PI - a1); // lower arc of the upper circle (right → left)
  p.arc(cx, cy + d, r, a1 - Math.PI, -a1); // upper arc of the lower circle (left → right)
  p.closePath();
  return p;
}

// ---------- metaball pour (line 3) ----------
let BALLS: { x: number; y: number; r: number; t0: number; vx: number; vy: number }[] | null = null;
export function balls(t: number, t0: number, cx: number, cy: number): Ball[] {
  if (!BALLS) {
    const r = rng(7);
    BALLS = [];
    // seeds pour out of the overlap, then the whole frame fills
    for (let i = 0; i < 42; i++) {
      const early = i < 14;
      const a = r() * TAU;
      const d = early ? r() * 60 : 120 + r() * 900;
      BALLS.push({
        x: Math.cos(a) * d * 1.3, y: Math.sin(a) * d * 0.7 + (early ? 20 + r() * 60 : 0),
        r: early ? 90 + r() * 110 : 160 + r() * 260,
        t0: early ? r() * 1.2 : 0.6 + (d / 900) * 2.2 + r() * 0.6,
        vx: (r() - 0.5) * 30, vy: 20 + r() * 50,
      });
    }
  }
  return BALLS.map((b) => {
    const a = t - t0 - b.t0;
    const g = a <= 0 ? 0 : ease.outBack(clamp(a / 1.4), 1.2);
    return { x: cx + b.x + b.vx * Math.max(0, a), y: cy + b.y + b.vy * Math.max(0, a), r: b.r * g * (1 + Math.max(0, a - 1.4) * 0.25) };
  });
}

// ---------- draw ----------
export function drawOpen(ctx: Ctx, t: number) {
  if (!ART) build();
  const A = ART!;
  const d = sep(t);
  const tPour = Wd(3, "می‌ریزه") - 0.35;
  const tFig = Wd(3, "شخصیتِ") - 0.2;
  // camera: slow drift; then into the overlap (it becomes the mandorla frame)
  const zIn = k(t, tFig - 1.4, tFig + 1.6, ease.inOutSine);
  const cam = { x: 960, y: lerp(540 - 6 * ss(0, 20, t), 540, zIn), z: lerp(1.2 * (1 + 0.04 * ss(0, 22, t)), 2.35, zIn) };
  // backdrop: night → warm (inside the pour) → lavender (line 6)
  nightBg(ctx, t);
  const pour = t > tPour;
  const lav = k(t, S(6) - 0.4, S(7) + 1.2);
  if (pour) {
    const B = layer("open-warm");
    warmBg(B, t);
    lavBg(B, t, lav);
    if (t < tPour + 6) {
      // the mask lives in screen space: push the balls through the camera
      const cb = balls(t, tPour, 960, 540).map((b) => ({ x: (b.x - cam.x) * cam.z + 960, y: (b.y - cam.y) * cam.z + 540, r: b.r * cam.z }));
      applyMask(B, gooMask(cb, 0.25));
    }
    paint(ctx, B);
    messengers(ctx, t);
  }
  vignette(ctx, pour ? 0.25 : 0.55, NIGHT);

  // line art on top (white, glowing)
  ctx.save();
  applyCam(ctx, cam);
  const cTop: [number, number] = [960, 540 - d], cBot: [number, number] = [960, 540 + d];
  const artOut = k(t, tFig - 1.0, tFig + 0.6); // icons fade as we enter the overlap
  const ringOut = k(t, S(8) + 0.2, S(8) + 2.2); // line 8: the circles un-draw
  const brightTop = 1 + 0.6 * win(t, Wd(2, "آسمون") - 0.2, Wd(2, "آسمون") + 0.4, E(2), E(2) + 0.8);
  for (const [c, art, i] of [[cTop, A.top, 0], [cBot, A.bot, 1]] as const) {
    ctx.save();
    ctx.translate(c[0], c[1]);
    drawStrokes(ctx, A.ring, t, { glow: 12, alpha: 0.95, out: ringOut, width: 2.6 * lerp(1, 0.6, zIn) });
    drawStrokes(ctx, art.strokes, t, { glow: 10, alpha: (1 - artOut) * (i === 0 ? Math.min(1, brightTop) : 1), width: 2.4 });
    art.sparks.forEach(([x, y, s], j) => {
      const tw = 0.6 + 0.4 * Math.sin(t * 1.7 + j * 2.1);
      sparkle(ctx, x, y, s * ss(2.2 + j * 0.08, 2.9 + j * 0.08, t) * tw * (s > 5 ? 1 : 0.6), (1 - artOut) * ss(2.2, 2.6, t) * brightTop, "#ffffff", 0);
    });
    if (i === 1) {
      // «ما این پایینیم»: the two people glow
      const p = win(t, Wd(2, "ما") - 0.2, Wd(2, "ما") + 0.3, Wd(2, "آسمون"), Wd(2, "آسمون") + 0.6);
      ctx.globalCompositeOperation = "screen";
      glow(ctx, -2, 80, 60, "#ffffff", 0.5 * p * (1 - artOut));
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.restore();
  }
  // the seam of light that opens in the overlap (line 3 «می‌شکافه»)
  const seam = k(t, Wd(3, "می‌شکافه") - 0.2, Wd(3, "می‌شکافه") + 0.5, ease.out) * (1 - k(t, tPour + 0.3, tPour + 1.6));
  if (seam > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const hh = Math.sqrt(R0 * R0 - d * d) * seam;
    const g = ctx.createLinearGradient(960, 540 - hh, 960, 540 + hh);
    g.addColorStop(0, "rgba(255,240,200,0)");
    g.addColorStop(0.5, "rgba(255,248,220,1)");
    g.addColorStop(1, "rgba(255,240,200,0)");
    ctx.fillStyle = g;
    ctx.fillRect(960 - 3, 540 - hh, 6, hh * 2);
    glow(ctx, 960, 540, 120 * seam, "#ffe7b0", 0.8 * seam);
    ctx.restore();
  }
  // the figure in the mandorla (line 3 «شخصیتِ عجیب»)
  const lit = layer("open-lit", 0.5);
  if (t > tFig) {
    const out = k(t, S(8) + 0.4, S(8) + 2.0);
    const pulse = 1 + 0.5 * win(t, Wd(5, "معمولی") - 0.3, Wd(5, "معمولی") + 0.3, Wd(5, "نیست") + 0.5, Wd(5, "نیست") + 1.4);
    // line 7 riddle: the figure keeps turning into the throne-light and back (messenger ↔ God himself)
    const rid = win(t, Wd(7, "متن") - 0.2, Wd(7, "متن") + 0.6, S(8) + 0.2, S(8) + 1.0);
    const flip = rid * (0.5 - 0.5 * Math.cos(Math.max(0, t - Wd(7, "متن")) * TAU / 2.2));
    const fa = (1 - out) * (1 - 0.45 * titleDim(t));
    ctx.save();
    ctx.translate(960, 548);
    ctx.scale(0.85, 0.85);
    drawStrokes(ctx, A.fig, t - tFig - 0.4, { glow: 14 * pulse, alpha: fa * (1 - flip), width: 3.2 });
    ctx.restore();
    if (flip > 0.01) {
      ctx.save();
      ctx.translate(960, 520);
      ctx.scale(0.9, 0.9);
      drawStrokes(ctx, A.top.strokes.slice(0, 7), 99, { glow: 16, alpha: fa * flip, width: 3 });
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      glow(ctx, 960, 470, 90, "#ffffff", 0.5 * flip * fa);
      ctx.restore();
    }
    lit.save();
    applyCam(lit, cam);
    glow(lit, 960, 520, 70, "#ffffff", 0.35 * (1 - out) * pulse * ss(tFig, tFig + 1.2, t));
    lit.restore();
    // two sparkles hover
    sparkles(ctx, t, [900, 450, 120, 160], 5, 33, (1 - out) * ss(tFig + 0.6, tFig + 1.6, t), "#ffffff", 6);
  }
  ctx.restore();
  bloom(ctx, lit, 1, 30);

  overlayTexts(ctx, t, cam);
  grain(ctx, t, 0.15);
}
/** how much the emblem should step back behind a title */
function titleDim(t: number) {
  return win(t, Wd(3, "فرشته‌ی") - 0.2, Wd(3, "فرشته‌ی") + 0.4, E(3) + 0.6, E(3) + 1.4) + win(t, Wd(5, "«فرشته»") - 0.3, Wd(5, "«فرشته»"), Wd(5, "ولی") - 0.2, Wd(5, "ولی") + 0.4);
}

function overlayTexts(ctx: Ctx, t: number, cam: { x: number; y: number; z: number }) {
  // line 1: labels beside the circles
  const lx = 960 + (R0 + 70) * cam.z;
  const outL = k(t, Wd(3, "ولی") - 0.6, Wd(3, "ولی") + 0.4);
  const dTop = (540 - sep(t) - cam.y) * cam.z + 540, dBot = (540 + sep(t) - cam.y) * cam.z + 540;
  title(ctx, [{ s: "آسمان", f: "MorabbaBold" }], lx, dTop - 10, { size: 58, k: k(t, Wd(1, "آسمان") - 0.1, Wd(1, "آسمان") + 0.7), out: outL, align: "left" });
  title(ctx, [{ s: "قلمروی خدا", f: "MorabbaLight" }], lx, dTop + 48, { size: 34, k: k(t, Wd(1, "خدا،") - 0.4, Wd(1, "خدا،") + 0.5), out: outL, align: "left", glow: 10 });
  title(ctx, [{ s: "زمین", f: "MorabbaBold" }], lx, dBot - 10, { size: 58, k: k(t, Wd(1, "زمین.") - 0.1, Wd(1, "زمین.") + 0.7), out: outL, align: "left" });
  title(ctx, [{ s: "قلمروی ما", f: "MorabbaLight" }], lx, dBot + 48, { size: 34, k: k(t, Wd(1, "ما.") - 0.5, Wd(1, "ما.") + 0.4), out: outL, align: "left", glow: 10 });
  // line 3: the name
  const nIn = k(t, Wd(3, "فرشته‌ی") - 0.1, Wd(3, "یَهوه.") + 0.5);
  const nOut = k(t, E(3) + 0.7, E(3) + 1.5);
  title(ctx, [{ s: "فرشته‌ی", f: "MorabbaLight" }, { s: "یَهوه", f: "MorabbaHeavy" }], 960, 520, { size: 96, k: nIn, out: nOut, shade: 0.65 });
  title(ctx, [{ s: "فرشته‌ی", f: "MorabbaLight" }, { s: "خداوند", f: "MorabbaHeavy" }], 960, 640, { size: 62, k: k(t, Wd(3, "فرشته‌ی", 1) - 0.1, Wd(3, "خداوند.") + 0.5), out: nOut, shade: 0.55 });
  title(ctx, [{ s: "در بیشترِ ترجمه‌ها", f: "MorabbaLight" }], 960, 712, { size: 30, k: k(t, Wd(3, "ترجمه‌ها") - 0.2, Wd(3, "ترجمه‌ها") + 0.8), out: nOut, glow: 8, shade: 0.55 });
  // line 5: the word itself
  const wOut = k(t, Wd(5, "ولی") - 0.1, Wd(5, "ولی") + 0.6);
  title(ctx, [{ s: "فرشته", f: "MorabbaHeavy" }], 960, 470, { size: 150, k: k(t, Wd(5, "«فرشته»") - 0.2, Wd(5, "«فرشته»") + 0.6), out: wOut, shade: 0.65 });
  title(ctx, [{ s: "پهلوی:", f: "MorabbaLight" }, { s: "فْرِشتَگ", f: "MorabbaBold" }], 960, 600, { size: 44, k: k(t, Wd(5, "ریشه‌ای") - 0.2, Wd(5, "ریشه‌ای") + 0.6), out: wOut, shade: 0.55, glow: 12 });
  title(ctx, [{ s: "یعنی", f: "MorabbaLight" }, { s: "«فرستاده»", f: "MorabbaHeavy" }], 960, 680, { size: 56, k: k(t, Wd(5, "«فرستاده».") - 0.2, Wd(5, "«فرستاده».") + 0.6), out: wOut, shade: 0.55 });
  // lines 4–5: «فرستاده‌ها» label for the messengers
  // line 7: the riddle
  const qOut = k(t, S(8) + 0.2, S(8) + 1.0);
  title(ctx, [{ s: "فرستاده‌ی خدا؟", f: "MorabbaBold" }], 1430, 540, { size: 54, k: k(t, Wd(7, "فرستاده‌ی") - 0.2, Wd(7, "خدا") + 0.4), out: qOut, shade: 0.5 });
  title(ctx, [{ s: "یا", f: "MorabbaLight" }, { s: "خودِ خدا؟", f: "MorabbaHeavy" }], 490, 540, { size: 54, k: k(t, Wd(7, "یا") - 0.1, Wd(7, "خدا؟", 1) + 0.4), out: qOut, shade: 0.5 });
}

/** lines 4–5: messengers descend on trails of light (drawn by the director over the warm world) */
export function messengers(ctx: Ctx, t: number) {
  const a = win(t, S(4) + 0.3, S(4) + 1.2, Wd(5, "ولی") + 0.2, Wd(5, "نیست") + 0.6);
  if (a <= 0.002) return;
  const r = rng(51);
  for (let i = 0; i < 7; i++) {
    const x0 = 180 + r() * 1560, y0 = -120 - r() * 200, x1 = x0 + (r() - 0.5) * 300, y1 = 620 + r() * 330;
    const tt = clamp((t - S(4) - 0.2 - i * 0.55) / 3.2);
    const e = ease.inOut(tt);
    const x = lerp(x0, x1, e), y = lerp(y0, y1, e);
    // a short streak of light behind it (not a string)
    const eb = ease.inOut(clamp(tt - 0.07));
    const bx = lerp(x0, x1, eb), by = lerp(y0, y1, eb);
    ctx.save();
    ctx.globalAlpha = a * 0.8 * ss(0, 0.1, tt) * (1 - ss(0.85, 1, tt));
    const g = ctx.createLinearGradient(bx, by - 40, x, y - 40);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(1, "rgba(255,255,255,0.9)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(bx, by - 40);
    ctx.lineTo(x, y - 40);
    ctx.stroke();
    ctx.restore();
    // a small line figure with a light
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(0.8, 0.8);
    const fade = a * ss(0, 0.15, tt);
    drawStrokes(ctx, ART!.fig.slice(0, 4), 9, { glow: 10, alpha: fade, width: 4 });
    ctx.restore();
    sparkle(ctx, x, y - 104, 11, fade * (0.6 + 0.4 * Math.sin(t * 3 + i)), "#ffffff", 0);
  }
}
