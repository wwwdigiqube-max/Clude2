// Robed silhouette characters (no faces): a small 2D rig → torso shape + skirt hull + tapered sleeves + head cloth.
// Poses blend with mixPose (sit → stand, walk cycle, kneel). Rim light = silhouette in rim colour, then the
// same silhouette shifted away from the light in the body colour on top (source-atop). Fold lines add cloth.
import { Ctx, layer, matchTransform, paint, resOf } from "./canvas";
import { fbm, lerp, rgba } from "./math";

export type Pose = {
  hipY: number; hipX: number; torso: number; head: number;
  thF: number; shF: number; thB: number; shB: number; // legs: absolute angle from straight down, + = forward
  arF: number; elF: number; arB: number; elB: number; // arms: upper rel. to torso-down, forearm rel. to upper
};
export const STAND: Pose = { hipY: 0.5, hipX: 0, torso: 0.02, head: 0.05, thF: 0.05, shF: 0, thB: -0.05, shB: 0, arF: 0.14, elF: 0.12, arB: -0.12, elB: -0.1 };
export const mixPose = (a: Pose, b: Pose, t: number): Pose => {
  const o = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => (o[k] = lerp(a[k], b[k], t)));
  return o;
};
export const P = (p: Partial<Pose>): Pose => ({ ...STAND, ...p });
/** walking: phase in cycles */
export function walk(ph: number, stride = 1): Pose {
  const s = Math.sin(ph * Math.PI * 2), c = Math.cos(ph * Math.PI * 2);
  return P({
    hipY: 0.495 + Math.abs(c) * 0.01,
    torso: 0.06,
    thF: 0.32 * s * stride, shF: 0.32 * s * stride - Math.max(0, -c) * 0.45 * stride,
    thB: -0.32 * s * stride, shB: -0.32 * s * stride - Math.max(0, c) * 0.45 * stride,
    arF: -0.22 * s * stride + 0.1, elF: 0.2, arB: 0.22 * s * stride - 0.08, elB: 0.15,
  });
}

export type Fig = {
  x: number; y: number; h: number; face?: 1 | -1; pose: Pose; t: number;
  head?: "veil" | "wrap" | "none"; beard?: boolean; staff?: "F" | "B" | null; wind?: number; seed?: number; breath?: number; build?: number;
};
type V = [number, number];
const dir = (a: number): V => [Math.sin(a), Math.cos(a)];
const add = (a: V, b: V, s = 1): V => [a[0] + b[0] * s, a[1] + b[1] * s];

function joints(f: Fig) {
  const { h: Hh, pose: p, t } = f;
  const sd = f.seed ?? 0;
  const br = (f.breath ?? 1) * Math.sin(t * 1.5 + sd) * 0.005;
  const torso = p.torso + Math.sin(t * 0.6 + sd * 2) * 0.012;
  const hip: V = [p.hipX * Hh, -p.hipY * Hh];
  const kneeF = add(hip, dir(p.thF), 0.235 * Hh), ankF = add(kneeF, dir(p.shF), 0.235 * Hh);
  const kneeB = add(hip, dir(p.thB), 0.235 * Hh), ankB = add(kneeB, dir(p.shB), 0.235 * Hh);
  const up = dir(Math.PI - torso);
  const rt: V = [-up[1], up[0]]; // torso "right" (toward facing side)
  const neck = add(hip, up, (0.31 + br) * Hh);
  const headA = Math.PI - torso - p.head - fbm(t * 0.22, sd + 4, 2) * 0.05;
  const head = add(neck, dir(headA), 0.078 * Hh);
  const shF = add(add(neck, up, -0.055 * Hh), rt, 0.1 * Hh);
  const shB = add(add(neck, up, -0.055 * Hh), rt, -0.1 * Hh);
  const aF = -torso + p.arF, aB = -torso + p.arB;
  const elbF = add(shF, dir(aF), 0.15 * Hh), hndF = add(elbF, dir(aF + p.elF), 0.145 * Hh);
  const elbB = add(shB, dir(aB), 0.15 * Hh), hndB = add(elbB, dir(aB + p.elB), 0.145 * Hh);
  return { hip, kneeF, ankF, kneeB, ankB, neck, head, headA, shF, shB, elbF, hndF, elbB, hndB, up, rt, torso };
}

function hull(pts: V[]) {
  const s = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o: V, a: V, b: V) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: V[] = [], hi: V[] = [];
  for (const p of s) {
    while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
    lo.push(p);
  }
  for (let i = s.length - 1; i >= 0; i--) {
    const p = s[i];
    while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop();
    hi.push(p);
  }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}
function chaikin(p: V[], it = 2, closed = true) {
  let a = p;
  for (let k = 0; k < it; k++) {
    const o: V[] = [];
    const n = closed ? a.length : a.length - 1;
    if (!closed) o.push(a[0]);
    for (let i = 0; i < n; i++) {
      const p0 = a[i], p1 = a[(i + 1) % a.length];
      o.push([p0[0] * 0.75 + p1[0] * 0.25, p0[1] * 0.75 + p1[1] * 0.25], [p0[0] * 0.25 + p1[0] * 0.75, p0[1] * 0.25 + p1[1] * 0.75]);
    }
    if (!closed) o.push(a[a.length - 1]);
    a = o;
  }
  return a;
}
const circ = (c: V, r: number, n = 12): V[] => Array.from({ length: n }, (_, i) => [c[0] + Math.cos((i / n) * Math.PI * 2) * r, c[1] + Math.sin((i / n) * Math.PI * 2) * r]);
const poly = (c: Ctx, p: V[]) => {
  c.beginPath();
  p.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])));
  c.closePath();
  c.fill();
};
/** tapered limb a→b with widths wa, wb and round ends */
function limb(c: Ctx, a: V, b: V, wa: number, wb: number) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const nx = -Math.sin(ang), ny = Math.cos(ang);
  c.beginPath();
  c.moveTo(a[0] + nx * wa, a[1] + ny * wa);
  c.lineTo(b[0] + nx * wb, b[1] + ny * wb);
  c.arc(b[0], b[1], wb, ang + Math.PI / 2, ang - Math.PI / 2, true);
  c.lineTo(a[0] - nx * wa, a[1] - ny * wa);
  c.arc(a[0], a[1], wa, ang - Math.PI / 2, ang + Math.PI / 2, true);
  c.fill();
}
function arm(c: Ctx, J: ReturnType<typeof joints>, front: boolean, Hh: number) {
  const sh = front ? J.shF : J.shB, el = front ? J.elbF : J.elbB, hd = front ? J.hndF : J.hndB;
  limb(c, sh, el, 0.042 * Hh, 0.036 * Hh);
  // sleeve: widens toward the wrist (loose robe)
  const cuff = add(el, [hd[0] - el[0], hd[1] - el[1]], 0.72);
  limb(c, el, cuff, 0.036 * Hh, 0.05 * Hh);
  limb(c, cuff, hd, 0.026 * Hh, 0.022 * Hh);
}

/** fill the whole silhouette with one style (local transform already applied by caller) */
function drawSil(c: Ctx, f: Fig, style: string | CanvasGradient) {
  const J = joints(f);
  const Hh = f.h, bw = f.build ?? 1;
  const sd = f.seed ?? 0, wind = f.wind ?? 0.3;
  c.fillStyle = style;
  c.strokeStyle = style;
  c.lineCap = "round";
  c.lineJoin = "round";
  arm(c, J, false, Hh);
  // torso (3/4 view): shoulders → armpits → waist → hips, leaning with the spine
  const T = (x: number, y: number): V => [J.neck[0] + J.rt[0] * x * Hh * bw - J.up[0] * y * Hh, J.neck[1] + J.rt[1] * x * Hh * bw - J.up[1] * y * Hh];
  const torsoPts = chaikin([T(-0.03, -0.01), T(-0.075, 0.02), T(-0.125, 0.06), T(-0.12, 0.13), T(-0.098, 0.22), T(-0.115, 0.31), T(0.115, 0.31), T(0.098, 0.22), T(0.12, 0.13), T(0.125, 0.06), T(0.075, 0.02), T(0.03, -0.01)], 2);
  poly(c, torsoPts);
  // skirt: hips + knees + ankles + a flared hem, as one smooth hull; hem ripples (more with wind)
  const hipL = T(-0.1, 0.26), hipR = T(0.1, 0.26);
  const ground = Math.max(J.ankF[1], J.ankB[1]);
  const pts: V[] = [
    ...circ(hipL, 0.016 * Hh, 6), ...circ(hipR, 0.016 * Hh, 6), ...circ(J.hip, 0.095 * Hh * bw),
    ...circ(J.kneeF, 0.09 * Hh), ...circ(J.kneeB, 0.09 * Hh),
    ...circ(add(J.ankF, [0.06 * Hh, -0.04 * Hh]), 0.085 * Hh), ...circ(add(J.ankB, [-0.06 * Hh, -0.04 * Hh]), 0.085 * Hh),
  ];
  let hp = chaikin(hull(pts), 2);
  hp = hp.map(([x, y], i) => {
    const low = Math.max(0, (y - J.hip[1]) / (0.5 * Hh));
    const n = fbm(i * 0.23 + f.t * 0.8 * (0.4 + wind), sd + y * 0.004, 2);
    return [x + low * Hh * (0.012 * n + wind * 0.018 * (0.6 + 0.4 * n)), Math.min(y + low * Hh * 0.004 * n, ground - 0.012 * Hh)];
  });
  poly(c, hp);
  // feet peeking out under the hem
  for (const a of [J.ankF, J.ankB]) {
    c.beginPath();
    c.ellipse(a[0] + 0.03 * Hh, a[1] - 0.012 * Hh, 0.045 * Hh, 0.016 * Hh, 0, 0, Math.PI * 2);
    c.fill();
  }
  // neck + head with a hint of profile (nose / chin), never a face
  limb(c, J.neck, J.head, 0.028 * Hh, 0.03 * Hh);
  c.beginPath();
  c.arc(J.head[0], J.head[1], 0.06 * Hh, 0, Math.PI * 2);
  c.fill();
  const hu = dir(J.headA); // along the head, upward
  const hf: V = [-hu[1], hu[0]]; // forward
  const L = (u: number, fw: number): V => [J.head[0] + hu[0] * u * Hh + hf[0] * fw * Hh, J.head[1] + hu[1] * u * Hh + hf[1] * fw * Hh];
  poly(c, chaikin([L(0.02, 0.05), L(-0.005, 0.071), L(-0.02, 0.06), L(-0.045, 0.052), L(-0.06, 0.03), L(-0.03, 0.0)], 2));
  const flut = fbm(f.t * 1.1, sd + 9, 2) * wind;
  if (f.head === "veil") {
    // hood (follows the head) + shawl over the shoulders and back (follows the torso, hangs with gravity)
    poly(c, chaikin([L(0.035, 0.058), L(0.075, 0.03), L(0.085, -0.03), L(0.05, -0.075), L(-0.04, -0.095), L(-0.1, -0.08), L(-0.11, 0.03), L(-0.06, 0.062), L(-0.02, 0.064)], 2));
    poly(c, chaikin([L(-0.04, -0.09), T(-0.08 - flut * 0.02, -0.02), T(-0.16 - flut * 0.04, 0.08), T(-0.17 - flut * 0.05, 0.2), T(-0.12, 0.24), T(0.0, 0.16), T(0.13, 0.1), T(0.14, 0.04), L(-0.1, 0.06), L(-0.06, 0.0)], 2));
  } else if (f.head === "wrap") {
    poly(c, chaikin([L(0.03, 0.06), L(0.08, 0.03), L(0.085, -0.03), L(0.045, -0.075), L(-0.035, -0.08), L(-0.1, -0.075 - flut * 0.03), L(-0.15, -0.085 - flut * 0.05), L(-0.11, -0.04), L(-0.04, 0.0), L(0.0, 0.05)], 2));
  }
  if (f.beard) poly(c, chaikin([L(-0.025, 0.055), L(-0.07, 0.06), L(-0.105, 0.035), L(-0.1, 0.0), L(-0.05, -0.015)], 2));
  arm(c, J, true, Hh);
  if (f.staff) {
    const hd = f.staff === "F" ? J.hndF : J.hndB;
    const top: V = [hd[0] + 0.02 * Hh, hd[1] - 0.24 * Hh], bot: V = [hd[0] + 0.06 * Hh, 0];
    c.lineWidth = 0.016 * Hh;
    c.beginPath();
    c.moveTo(...bot);
    c.lineTo(...top);
    c.arc(top[0] - 0.035 * Hh, top[1], 0.035 * Hh, 0, -Math.PI, true);
    c.stroke();
  }
  return { J, hem: hp };
}
/** soft cloth folds drawn on top of the body (inside the silhouette) */
function folds(c: Ctx, f: Fig, color: string) {
  const J = joints(f);
  const Hh = f.h;
  c.save();
  c.strokeStyle = color;
  c.lineCap = "round";
  for (let i = -1; i <= 1; i++) {
    const x0 = J.hip[0] + i * 0.05 * Hh, y0 = J.hip[1] - 0.02 * Hh;
    const ank = i < 0 ? J.ankB : J.ankF;
    const x1 = lerp(x0, ank[0], 0.6) + i * 0.03 * Hh, y1 = Math.max(y0 + 0.1 * Hh, ank[1] - 0.06 * Hh);
    c.globalAlpha = 0.1;
    c.lineWidth = 0.006 * Hh;
    c.beginPath();
    c.moveTo(x0, y0);
    c.quadraticCurveTo(x0 + i * 0.02 * Hh + fbm(f.t * 0.5, i + 3) * 0.02 * Hh, (y0 + y1) / 2, x1, y1);
    c.stroke();
  }
  c.restore();
}

export type Look = { base: string; base2?: string; rim?: string; rimW?: number; light?: [number, number]; alpha?: number; fold?: string };
/** draw a figure into ctx (world transform of ctx is used) */
export function figure(ctx: Ctx, f: Fig, look: Look) {
  const { base, base2 = base, rim, rimW = 5, light = [1, -0.4], alpha = 1 } = look;
  if (alpha <= 0.002) return;
  const L = layer("fig", resOf(ctx));
  matchTransform(L, ctx);
  L.translate(f.x, f.y);
  L.scale(f.face ?? 1, 1);
  const g = L.createLinearGradient(0, -f.h, 0, 0);
  g.addColorStop(0, base);
  g.addColorStop(1, base2);
  if (rim) {
    drawSil(L, f, rim);
    L.globalCompositeOperation = "source-atop";
    const ln = Math.hypot(light[0], light[1]) || 1;
    L.save();
    L.translate((-light[0] / ln) * rimW * (f.face ?? 1), (-light[1] / ln) * rimW);
    drawSil(L, f, g);
    L.restore();
  } else drawSil(L, f, g);
  if (look.fold ?? rim) {
    L.globalCompositeOperation = "source-atop";
    folds(L, f, look.fold ?? rim!);
  }
  paint(ctx, L, alpha);
}
/** the bare silhouette in ctx's transform (fill = style); returns joints + hem for effects */
export function silhouette(ctx: Ctx, f: Fig, style: string | CanvasGradient) {
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.scale(f.face ?? 1, 1);
  const r = drawSil(ctx, f, style);
  ctx.restore();
  return r;
}
/** cheap single-colour silhouette straight into ctx (crowds) */
export function figureFlat(ctx: Ctx, f: Fig, color: string) {
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.scale(f.face ?? 1, 1);
  drawSil(ctx, f, color);
  ctx.restore();
}
/** world position of a joint (e.g. the front hand) */
export function jointAt(f: Fig, j: "hndF" | "hndB" | "head" | "neck" | "hip"): [number, number] {
  const J = joints(f);
  return [f.x + J[j][0] * (f.face ?? 1), f.y + J[j][1]];
}
export const shadowColor = (a: number) => rgba("#120a18", a);
