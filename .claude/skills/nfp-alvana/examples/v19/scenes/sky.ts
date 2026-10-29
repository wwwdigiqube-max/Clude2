// Lines 14–16a: the paradox. A throne of light far above the clouds, out of reach of a small human on the
// earth's curve → «ولی گاهی خودش رو نشون می‌ده»: a drop of light falls, splashes, and becomes the figure of light
// standing in front of the human → «یَهوه‌ی دیدنی» → a beam joins throne and figure: «جدا» / «همان».
import { applyCam, bloom, Cam, Ctx, H, layer, W } from "../lib/canvas";
import { figure, P } from "../lib/figure";
import { glow, grain, motes, sparkle, sparkles, vignette } from "../lib/fx";
import { CloudPal, clouds, godRays, nebula, ridge, ridgePts, shaft, starsDeep } from "../lib/depth";
import { lightBeing, lightCore } from "../lib/light";
import { clamp, ease, k, lerp, mixHex, rgba, rng, ss, TAU, win } from "../lib/math";
import { inkLine } from "../lib/lineart";
import { partial } from "../lib/shape";
import { title } from "../lib/text";
import { E, S, W as Wd } from "../cues";

const THRONE: [number, number] = [960, -210];
const MAN = { x: 760, y: 792, h: 170 };
const LAND: [number, number] = [1090, 792];

export function skyCam(t: number): Cam {
  // wide: the throne high above, the human small on the earth's curve — the distance is the point;
  // after the light lands, a slow push-in on the two of them; out again for the beam (line 16)
  const down = k(t, Wd(14, "ولی") - 0.3, Wd(14, "فهمیدش.") + 0.2, ease.inOutSine);
  const recede = k(t, Wd(14, "خدا،") - 0.3, Wd(14, "بیرونه.") + 0.6, ease.inOutSine) * (1 - down);
  const near = k(t, Wd(14, "دیدش") + 0.8, Wd(14, "دیدش") + 4.0, ease.inOutSine) * (1 - k(t, Wd(16, "آره.") - 0.2, Wd(16, "جداست،") - 0.7, ease.inOutSine));
  const w = { x: 960, y: lerp(250 + 30 * recede, 300, down), z: lerp(0.82 - 0.07 * recede, 0.84, down) + 0.03 * ss(S(15), S(16) + 4, t) };
  return { x: lerp(w.x, 930, near), y: lerp(w.y, 650, near), z: lerp(w.z, 1.45, near) };
}

/** the throne of light, far above: rays turning behind it, a bow of colours, a pointed arch with gold edges,
 *  steps, and the seated figure of light inside it */
export function throne(c: Ctx, lit: Ctx | null, x: number, y: number, s: number, t: number, k0 = 1) {
  if (k0 <= 0.002) return;
  godRays(c, t, x, y - 60 * s, { n: 22, len: 900 * s, color: "#fff2e0", alpha: 0.22 * k0, width: 0.12, spin: 0.01, seed: 17, soft: 10 });
  c.save();
  c.globalCompositeOperation = "screen";
  glow(c, x, y - 50 * s, 330 * s, "#efe6ff", 0.5 * k0);
  // the bow of colours (Ezekiel 1:28), faint
  const cols = ["#ff9ab0", "#ffc27a", "#fff08a", "#9ff0b0", "#8fd0ff", "#b9a8ff"];
  c.lineWidth = 9 * s;
  cols.forEach((col, i) => {
    c.strokeStyle = rgba(col, 0.16 * k0);
    c.beginPath();
    c.arc(x, y + 20 * s, (230 + i * 10) * s, Math.PI * 1.05, Math.PI * 1.95);
    c.stroke();
  });
  c.restore();
  c.save();
  c.globalAlpha = k0;
  // arch body: pale violet glass, gold edge
  const arch = new Path2D();
  arch.moveTo(x - 50 * s, y + 60 * s);
  arch.lineTo(x - 50 * s, y - 40 * s);
  arch.quadraticCurveTo(x - 50 * s, y - 104 * s, x, y - 146 * s);
  arch.quadraticCurveTo(x + 50 * s, y - 104 * s, x + 50 * s, y - 40 * s);
  arch.lineTo(x + 50 * s, y + 60 * s);
  arch.closePath();
  const g = c.createLinearGradient(x, y - 140 * s, x, y + 60 * s);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(1, "#cfc0ff");
  c.fillStyle = g;
  c.fill(arch);
  c.strokeStyle = "#ffd98a";
  c.lineWidth = 3 * s;
  c.shadowColor = "#ffd98a";
  c.shadowBlur = 10 * s * c.getTransform().a;
  c.stroke(arch);
  c.shadowBlur = 0;
  // steps
  c.fillStyle = "#f4eeff";
  c.fillRect(x - 74 * s, y + 54 * s, 148 * s, 13 * s);
  c.fillRect(x - 96 * s, y + 70 * s, 192 * s, 12 * s);
  c.strokeRect(x - 74 * s, y + 54 * s, 148 * s, 13 * s);
  c.strokeRect(x - 96 * s, y + 70 * s, 192 * s, 12 * s);
  c.restore();
  lightBeing(c, lit, { x, y: y + 52 * s, h: 120 * s, t, k: k0 * 0.95, pose: SEATED, warm: 0.3, rays: 0.6, aura: 0.6, seed: 5, pool: 0 });
  lightCore(c, lit, x, y - 60 * s, 60 * s, k0 * (0.35 + 0.1 * Math.sin(t * 1.3)), "#d8ccff", t);
  sparkles(c, t, [x - 240 * s, y - 280 * s, 480 * s, 380 * s], 12, 404, k0, "#ffffff", 9 * s);
}
const SEATED = P({ hipY: 0.3, torso: -0.02, head: 0.02, thF: 1.45, shF: 0.05, thB: 1.4, shB: 0.0, arF: 0.75, elF: 0.6, arB: 0.6, elB: 0.6 });

/** the earth's curve: land with depth (far hazy hills → near green slopes), an atmosphere glowing on its rim */
const EARTH_R = 1860, EARTH_C: [number, number] = [960, 2650];
function earth(c: Ctx, t: number) {
  // atmosphere: a soft bright band hugging the curve
  c.save();
  c.globalCompositeOperation = "screen";
  for (const [w, a] of [[90, 0.25], [36, 0.35], [10, 0.5]] as const) {
    c.strokeStyle = rgba("#ffe6d8", a);
    c.lineWidth = w;
    c.filter = "blur(" + (w * 0.4 * c.getTransform().a).toFixed(1) + "px)";
    c.beginPath();
    c.arc(EARTH_C[0], EARTH_C[1], EARTH_R + w * 0.3, Math.PI * 1.15, Math.PI * 1.85);
    c.stroke();
  }
  c.restore();
  c.save();
  c.beginPath();
  c.arc(EARTH_C[0], EARTH_C[1], EARTH_R, 0, TAU);
  c.clip();
  const g = c.createLinearGradient(0, 740, 0, 1100);
  g.addColorStop(0, "#f0c49a");
  g.addColorStop(0.18, "#d98e8a");
  g.addColorStop(0.5, "#7a4a6a");
  g.addColorStop(1, "#3a2442");
  c.fillStyle = g;
  c.fillRect(-500, 700, 2900, 900);
  // rolling land in bands: hazy far, deeper near
  ridge(c, { y0: 812, amp: 26, freq: 0.004, seed: 41, color: "#c9879a", haze: "#ffd9c8", hazeA: 0.5, sharp: 0.2, rim: "#ffe9d8", rimA: 0.35, rimW: 1.5, x0: -200, x1: 2200 });
  ridge(c, { y0: 850, amp: 30, freq: 0.0035, seed: 42, color: "#8a9a7a", haze: "#e8c8c0", hazeA: 0.35, sharp: 0.1, rim: "#f0ffd8", rimA: 0.35, rimW: 1.5, x0: -200, x1: 2200 });
  ridge(c, { y0: 905, amp: 34, freq: 0.003, seed: 43, color: "#5e8a64", sharp: 0.1, rim: "#d8ffc0", rimA: 0.3, rimW: 2, x0: -200, x1: 2200 });
  ridge(c, { y0: 980, amp: 30, freq: 0.0028, seed: 44, color: "#3f6a50", sharp: 0.1, x0: -200, x1: 2200 });
  // small trees along the near bands
  const r = rng(45);
  for (let i = 0; i < 40; i++) {
    const x = r() * 2000 - 40, near = r() < 0.5;
    const band = near ? 905 : 850;
    const yy = ridgePts({ y0: band, amp: near ? 34 : 30, freq: near ? 0.003 : 0.0035, seed: near ? 43 : 42, sharp: 0.1, x0: -200, x1: 2200 });
    const yi = yy[Math.max(0, Math.min(yy.length - 1, Math.round((x + 200) / 14)))][1];
    const sz = near ? 9 + r() * 6 : 5 + r() * 4;
    const sw = Math.sin(t * 0.8 + i) * 0.6;
    c.fillStyle = near ? "#2f5a44" : "#56786a";
    c.beginPath();
    c.ellipse(x + sw, yi - sz * 1.2, sz * 0.7, sz * 1.3, 0, 0, TAU);
    c.fill();
  }
  c.restore();
  // the rim line of the world, catching the light
  c.save();
  c.strokeStyle = rgba("#ffffff", 0.35);
  c.lineWidth = 2;
  c.beginPath();
  c.arc(EARTH_C[0], EARTH_C[1], EARTH_R, Math.PI * 1.2, Math.PI * 1.8);
  c.stroke();
  c.restore();
}
/** the sky: violet above → lilac → warm haze at the horizon; real clouds in three depths (graded lilac) */
const CL_NEAR: CloudPal = { shade: "#5a4a9a", mid: "#a898e0", lit: "#fff6f2", gamma: 0.95 };
const CL_MID: CloudPal = { shade: "#6e60b0", mid: "#b0a2e6", lit: "#f6eeff", gamma: 1.05 };
const CL_FAR: CloudPal = { shade: "#8a7cc8", mid: "#bcb0ec", lit: "#f2ecff", gamma: 1.15 };
const par = (cam: Cam, f: number): Cam => ({ x: 960 + (cam.x - 960) * f, y: 540 + (cam.y - 540) * f, z: 1 + (cam.z - 1) * f });
function skyBack(c: Ctx, t: number, cam: Cam) {
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#4a3ca8");
  g.addColorStop(0.45, "#8f7fe0");
  g.addColorStop(0.8, "#d6b4ec");
  g.addColorStop(1, "#f2c8d8");
  c.fillStyle = g;
  c.fillRect(-20, -20, W + 40, H + 40);
  nebula(c, t, ["#6a5ad0", "#9a7ae0", "#ffffff"], 0.18, 31, 0.6);
  starsDeep(c, t, 120, 61, 0.45 * (1 - 0.5 * clamp((cam.z - 0.85) * 2)), (cam.x - 960) * 0.3, (cam.y - 300) * 0.3);
  // far clouds near the horizon (they barely move with the camera)
  c.save();
  applyCam(c, par(cam, 0.35));
  clouds(c, t, [
    { name: "field", x: 420, y: 720, w: 1500, a: 0.7, sp: 2, crop: [0, 0.1, 1, 0.65] },
    { name: "field", x: 1560, y: 700, w: 1500, a: 0.7, flip: true, sp: 2, crop: [0, 0.1, 1, 0.65] },
  ], CL_FAR, 1, [-700, 2600]);
  c.restore();
  // mid clouds
  c.save();
  applyCam(c, par(cam, 0.7));
  clouds(c, t, [
    { name: "cu3", x: 240, y: 330, w: 1050, sp: 4 }, { name: "cu1", x: 1700, y: 300, w: 1150, flip: true, sp: 3 },
    { name: "cu2", x: 960, y: 520, w: 1300, a: 0.8, sp: 2.5 },
  ], CL_MID, 1, [-800, 2700]);
  c.restore();
}
/** high clouds around the throne: they slide in while it «stays out of reach» */
function throneClouds(c: Ctx, t: number, veil: number) {
  clouds(c, t, [
    { name: "cu5", x: lerp(-700, -60, veil), y: -150, w: 1400 }, { name: "cu4", x: lerp(2650, 1980, veil), y: -170, w: 1450, flip: true },
    { name: "cu3", x: lerp(-500, 520, veil), y: 40, w: 1100, a: 0.9 }, { name: "cu1", x: lerp(2400, 1420, veil), y: 60, w: 1100, a: 0.9 },
  ], CL_NEAR, 1);
}

function drop(t: number) {
  const t0 = Wd(14, "خودش") - 0.2, t1 = Wd(14, "دیدش") + 0.1;
  const a = clamp((t - t0) / (t1 - t0));
  const e = ease.in(a);
  return { on: t > t0 && a < 1, x: lerp(THRONE[0], LAND[0], e) + Math.sin(a * 3) * 40, y: lerp(THRONE[1] + 40, LAND[1] - 30, e), a, t1 };
}

export function drawSky(ctx: Ctx, t: number) {
  const cam = skyCam(t);
  const veil = k(t, Wd(14, "خدا،") - 0.2, Wd(14, "بیرونه.") + 0.4, ease.inOutSine);
  skyBack(ctx, t, cam);
  const lit = layer("sky-lit", 0.5);
  ctx.save();
  applyCam(ctx, cam);
  throne(ctx, lit, THRONE[0], THRONE[1], 1, t, 1);
  // light breaking through between the clouds down to the earth (when he shows himself)
  const show = win(t, Wd(14, "ولی") - 0.4, Wd(14, "خودش") + 0.4, Wd(15, "یَهوه‌ایه"), Wd(15, "یَهوه‌ایه") + 2);
  shaft(ctx, t, THRONE[0], THRONE[1] + 60, LAND[0], LAND[1] - 120, 40, 170, "#fff4ea", 0.28 * show, 30, 77);
  throneClouds(ctx, t, veil);
  earth(ctx, t);
  // the human on the earth, reaching up toward what is out of reach, later turning to the figure
  const reach = win(t, Wd(14, "خدا،"), Wd(14, "دسترسِ"), Wd(14, "ولی"), Wd(14, "ولی") + 1.0);
  const turn = k(t, drop(t).t1 + 0.2, drop(t).t1 + 1.4);
  const pose = P({ arF: lerp(lerp(0.2, 2.5, reach), 1.3, turn), elF: lerp(0.1, 0.3, turn), head: lerp(-0.4 * reach, -0.2, turn), torso: -0.04 * reach });
  figure(ctx, { x: MAN.x, y: MAN.y, h: MAN.h, face: 1, pose, t, head: "wrap", seed: 41 }, { base: "#3b2a4a", base2: "#24182e", rim: mixHex("#ffd2a8", "#ffffff", turn), rimW: 3, light: [lerp(0.2, 1, turn), -1] });
  // «همین‌جاست که گره می‌خوره»: two threads of light meet and tie themselves into a knot
  knot(ctx, t);
  // «از دسترسِ ما بیرونه»: a ladder grows up from the human toward the throne… and falls short
  ladder(ctx, t);
  // the falling drop + its sparkle trail
  const d = drop(t);
  if (d.on) {
    // a bright tear of light with a fading streak behind it
    const back = drop(t - 0.18);
    const sg = ctx.createLinearGradient(back.x, back.y - 60, d.x, d.y);
    sg.addColorStop(0, "rgba(255,255,255,0)");
    sg.addColorStop(1, "rgba(255,255,255,0.8)");
    ctx.strokeStyle = sg;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(back.x, back.y - 60);
    ctx.lineTo(d.x, d.y);
    ctx.stroke();
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    glow(ctx, d.x, d.y, 150, "#ffffff", 0.85);
    ctx.restore();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(d.x, d.y, 18, 24 + d.a * 14, 0, 0, TAU);
    ctx.fill();
    glow(lit, 0, 0, 0, "#fff", 0);
    sparkles(ctx, t, [d.x - 40, d.y - 220, 80, 200], 6, 909, 0.9, "#ffffff", 7);
  }
  // splash → window → figure of light
  const tl = d.t1;
  if (t > tl) {
    // the drop lands: a burst of light, a ring running over the ground, then the figure stands in the glow
    const bu = clamp((t - tl) / 1.4);
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    glow(ctx, LAND[0], LAND[1] - 120, 380 * ease.out(bu) + 40, "#ffffff", 0.75 * (1 - bu * 0.7));
    ctx.strokeStyle = rgba("#ffffff", 0.7 * (1 - bu));
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(LAND[0], LAND[1] + 4, 40 + 520 * ease.out(bu), 8 + 70 * ease.out(bu), 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
    lightBeing(ctx, lit, { x: LAND[0], y: LAND[1], h: 310, t, k: k(t, tl + 0.4, tl + 1.6), face: -1 });
  }
  // the beam that joins throne and figure (line 16)
  const beam = win(t, Wd(16, "جداست،") - 0.6, Wd(16, "جداست،"), E(16) + 0.5, E(16) + 1.5);
  if (beam > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const bgr = ctx.createLinearGradient(0, THRONE[1], 0, LAND[1]);
    bgr.addColorStop(0, rgba("#ffffff", 0.7 * beam));
    bgr.addColorStop(0.5, rgba("#e8dcff", 0.25 * beam));
    bgr.addColorStop(1, rgba("#ffffff", 0.6 * beam));
    ctx.fillStyle = bgr;
    ctx.beginPath();
    ctx.moveTo(THRONE[0] - 30, THRONE[1]);
    ctx.lineTo(THRONE[0] + 30, THRONE[1]);
    ctx.lineTo(LAND[0] + 60, LAND[1] - 200);
    ctx.lineTo(LAND[0] - 60, LAND[1] - 200);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  // «و فهمیدش»: rings of light go from the figure to the human; the human's head lights up
  understand(ctx, t);
  // «یَهوه‌ای که دیده می‌شه»: an eye of light opens above the figure
  eye(ctx, t);
  ctx.restore();
  motes(ctx, t, { n: 30, color: "#ffffff", alpha: 0.4, seed: 71, speed: 0.5, dust: true });
  bloom(ctx, lit, 0.9, 46);
  vignette(ctx, 0.35, "#1a1030");
  // white → sky at the start (continuing Hagar's white-out)
  const wi = 1 - k(t, E(13) + 0.35, E(13) + 2.2, ease.out);
  if (wi > 0.001) {
    ctx.save();
    ctx.globalAlpha = wi;
    ctx.fillStyle = "#fffaf2";
    ctx.fillRect(-10, -10, W + 20, H + 20);
    ctx.restore();
  }
  // texts
  const outA = k(t, Wd(14, "ولی") - 0.4, Wd(14, "ولی") + 0.4);
  title(ctx, [{ s: "یک", f: "MorabbaLight" }, { s: "تناقض", f: "MorabbaHeavy" }], 960, 560, { size: 64, k: k(t, Wd(14, "تناقض") - 0.1, Wd(14, "تناقض") + 0.6), out: outA, shade: 0.4 });
  title(ctx, [{ s: "دست‌نیافتنی", f: "MorabbaLight" }], 960, 640, { size: 40, k: k(t, Wd(14, "دسترسِ") - 0.2, Wd(14, "بیرونه.") + 0.3), out: outA, glow: 12, shade: 0.4 });
  const tl2 = drop(t).t1;
  const nOut = k(t, Wd(15, "یَهوه‌ایه") - 0.5, Wd(15, "یَهوه‌ایه"));
  title(ctx, [{ s: "فرشته‌ی", f: "MorabbaLight" }, { s: "خداوند", f: "MorabbaHeavy" }], 1520, 560, { size: 52, k: k(t, Math.max(tl2 + 0.6, Wd(14, "شخصیت،") - 0.1), Wd(14, "شخصیت،") + 0.8), out: nOut, align: "left", shade: 0.45 });
  const yOut = k(t, Wd(16, "جداست،") - 0.8, Wd(16, "جداست،") - 0.2);
  title(ctx, [{ s: "یَهوه‌ی", f: "MorabbaHeavy" }, { s: "دیدنی", f: "MorabbaLight" }], 1520, 560, { size: 60, k: k(t, Wd(15, "یَهوه‌ایه") - 0.1, Wd(15, "می‌شه.") + 0.3), out: yOut, align: "left", shade: 0.45 });
  const lOut = k(t, Wd(16, "خیلی") - 0.2, Wd(16, "خیلی") + 0.5);
  title(ctx, [{ s: "جدا از یَهوه", f: "MorabbaBold" }], 1400, 470, { size: 50, k: k(t, Wd(16, "از") - 0.1, Wd(16, "جداست،") + 0.4), out: lOut, shade: 0.45 });
  title(ctx, [{ s: "خودِ یَهوه", f: "MorabbaHeavy" }], 520, 470, { size: 56, k: k(t, Wd(16, "خودِ") - 0.1, Wd(16, "یَهوه‌ست.") + 0.4), out: lOut, shade: 0.45 });
  grain(ctx, t, 0.14);
}
export const _s = { H };
// ---------- the actions of lines 14–15 ----------
function knot(c: Ctx, t: number) {
  const t0 = Wd(14, "همین‌جاست") - 0.1;
  const p = clamp((t - t0) / 1.6), out = k(t, Wd(14, "تناقض") - 0.2, Wd(14, "تناقض") + 0.6);
  if (p <= 0 || out >= 1) return;
  const cx = 960, cy = 320, s = 46;
  const pts: [number, number][] = [];
  for (let i = 0; i <= 40; i++) pts.push([cx - 700 + (i / 40) * 600, cy + Math.sin(i * 0.4 + t) * 6]);
  for (let i = 0; i <= 160; i++) {
    const a = (i / 160) * TAU + Math.PI / 2;
    pts.push([cx + s * (Math.sin(a) + 2 * Math.sin(2 * a)), cy + s * (Math.cos(a) - 2 * Math.cos(2 * a)) * 0.8]);
  }
  for (let i = 0; i <= 40; i++) pts.push([cx + 100 + (i / 40) * 600, cy + Math.sin(i * 0.4 - t) * 6]);
  c.save();
  inkLine(c, "#ffffff", 6, 18);
  c.globalAlpha = 1 - out;
  partial(c, pts, 0, ease.inOut(p));
  c.restore();
  // the knot pulls tight with a flash
  const tight = win(t, t0 + 1.5, t0 + 1.7, t0 + 1.9, t0 + 2.6);
  c.save();
  c.globalCompositeOperation = "screen";
  glow(c, cx, cy, 140, "#ffffff", 0.6 * tight * (1 - out));
  c.restore();
}
function ladder(c: Ctx, t: number) {
  const t0 = Wd(14, "خدا،") - 0.1, tFall = Wd(14, "بیرونه.") - 0.1;
  const grow = clamp((t - t0) / 2.4), fall = ease.in(clamp((t - tFall) / 1.0));
  if (grow <= 0 || fall >= 1) return;
  const bx = MAN.x + 50, by = MAN.y - 4, top = 560 * ease.out(grow);
  c.save();
  c.translate(bx, by);
  c.rotate(fall * 0.9 + Math.sin(t * 6) * 0.02 * grow);
  c.globalAlpha = 1 - fall;
  inkLine(c, "#ffffff", 4, 10);
  for (const x of [-22, 22]) {
    c.beginPath();
    c.moveTo(x, 0);
    c.lineTo(x * 0.7, -top);
    c.stroke();
  }
  for (let y = 30; y < top; y += 44) {
    const w = 22 * (1 - (0.3 * y) / 560);
    c.beginPath();
    c.moveTo(-w, -y);
    c.lineTo(w, -y);
    c.stroke();
  }
  c.restore();
}
function understand(c: Ctx, t: number) {
  const t0 = Wd(14, "فهمیدش.") - 0.3;
  if (t < t0 || t > t0 + 3.5) return;
  for (let i = 0; i < 3; i++) {
    const ph = clamp((t - t0 - i * 0.35) / 1.4);
    if (ph <= 0 || ph >= 1) continue;
    const x = lerp(LAND[0] - 60, MAN.x + 30, ph), y = MAN.y - MAN.h * 0.85;
    c.save();
    inkLine(c, "#ffffff", 3, 12);
    c.globalAlpha = Math.sin(ph * Math.PI);
    c.beginPath();
    c.ellipse(x, y, 14 + 10 * ph, 26 + 20 * ph, 0, -Math.PI / 2, Math.PI / 2, true);
    c.stroke();
    c.restore();
  }
  const lit = win(t, t0 + 1.2, t0 + 1.6, t0 + 2.6, t0 + 3.4);
  c.save();
  c.globalCompositeOperation = "screen";
  glow(c, MAN.x + 4, MAN.y - MAN.h * 0.9, 50, "#fff3c8", lit);
  c.restore();
  sparkle(c, MAN.x + 4, MAN.y - MAN.h * 1.08, 12 * lit, lit, "#ffffff", t);
}
function eye(c: Ctx, t: number) {
  const t0 = Wd(15, "دیده") - 0.5, t1 = Wd(16, "آره.") + 0.3;
  const open = ease.out(clamp((t - t0) / 0.6)) * (1 - ease.in(clamp((t - t1) / 0.6)));
  const a = k(t, t0 - 0.3, t0) * (1 - k(t, t1 + 0.3, t1 + 0.8));
  if (a <= 0.002) return;
  const x = LAND[0], y = LAND[1] - 420, w = 90, hgt = 40 * open;
  c.save();
  inkLine(c, "#ffffff", 4, 16);
  c.globalAlpha = a;
  c.beginPath();
  c.moveTo(x - w, y);
  c.quadraticCurveTo(x, y - hgt * 2, x + w, y);
  c.quadraticCurveTo(x, y + hgt * 2, x - w, y);
  c.stroke();
  c.restore();
  if (open > 0.05) {
    c.save();
    c.globalCompositeOperation = "screen";
    glow(c, x, y, 70 * open, "#ffffff", a);
    c.restore();
    c.save();
    c.globalAlpha = a;
    c.fillStyle = "#ffffff";
    c.beginPath();
    c.arc(x, y, 16 * open, 0, TAU);
    c.fill();
    c.restore();
    // rays
    c.save();
    inkLine(c, "#ffffff", 2, 8);
    c.globalAlpha = a * open * 0.8;
    for (let i = 0; i < 9; i++) {
      const ang = -Math.PI * (0.15 + (i / 8) * 0.7);
      c.beginPath();
      c.moveTo(x + Math.cos(ang) * (w * 0.75), y + Math.sin(ang) * (hgt + 30));
      c.lineTo(x + Math.cos(ang) * (w * 1.05), y + Math.sin(ang) * (hgt + 60));
      c.stroke();
    }
    c.restore();
  }
}