// A real stickman: one even line weight, round caps, a white head disc with a small face (eyes that blink, a mouth
// that smiles), knees/elbows posed by angles. Drawn as glowing chalk over photos (mixed media).
import { Ctx, scale } from "./canvas";
import { lerp } from "./math";

export type SP = {
  lean: number; // torso from vertical (+ = toward facing)
  head: number; // head tilt
  shF: number; elF: number; shB: number; elB: number; // arms: shoulder from hanging (+ forward/up), elbow bend
  hiF: number; knF: number; hiB: number; knB: number; // legs: hip from hanging (+ forward), knee fold (+ shin back)
};
const Z: SP = { lean: 0, head: 0, shF: 0.15, elF: 0.2, shB: -0.15, elB: 0.2, hiF: 0.05, knF: 0.05, hiB: -0.05, knB: 0.08 };
export const sp = (p: Partial<SP>): SP => ({ ...Z, ...p });
export const SPOSE = {
  stand: Z,
  press: sp({ lean: 0.35, head: 0.3, shF: 1.35, elF: 0.6, shB: 0.5, elB: 0.8, hiF: 0.12, knF: 0.18, hiB: -0.12, knB: 0.2 }),
  wave: sp({ lean: -0.05, head: -0.25, shF: 2.6, elF: 0.5, shB: -0.2, elB: 0.3 }),
  point: sp({ lean: 0.1, head: -0.2, shF: 1.55, elF: 0.02, shB: -0.3, elB: 0.6 }),
  snap: sp({ lean: 0.18, head: -0.1, shF: 1.9, elF: 0.15, shB: 0.4, elB: 1.4 }),
  crouch: sp({ lean: 0.5, head: 0.1, shF: 0.9, elF: 0.6, shB: 0.6, elB: 0.6, hiF: 1.5, knF: 2.2, hiB: 1.2, knB: 2.1 }),
  jump: sp({ lean: 0.25, head: -0.25, shF: 2.4, elF: 0.2, shB: 2.0, elB: 0.2, hiF: 0.9, knF: 1.5, hiB: -0.3, knB: 1.2 }),
  runA: sp({ lean: 0.3, shF: -0.9, elF: 1.4, shB: 1.1, elB: 1.5, hiF: 1.15, knF: 1.3, hiB: -0.6, knB: 1.0 }),
  runB: sp({ lean: 0.3, shF: 1.1, elF: 1.5, shB: -0.9, elB: 1.4, hiF: -0.6, knF: 1.0, hiB: 1.15, knB: 1.3 }),
  lie: sp({ lean: -1.45, head: 0.15, shF: 3.0, elF: 2.3, shB: 2.9, elB: 2.4, hiF: -1.25, knF: 0.9, hiB: -1.55, knB: 0.1 }),
  flick: sp({ lean: -1.35, head: -0.25, shF: 1.6, elF: 0.1, shB: 2.9, elB: 2.4, hiF: -1.25, knF: 0.9, hiB: -1.55, knB: 0.1 }),
};
export const mixSP = (a: SP, b: SP, t: number): SP => {
  const o = {} as SP;
  (Object.keys(a) as (keyof SP)[]).forEach((k) => (o[k] = lerp(a[k], b[k], t)));
  return o;
};
export const runSP = (ph: number) => mixSP(SPOSE.runA, SPOSE.runB, 0.5 - 0.5 * Math.cos(ph * Math.PI * 2));
type V = [number, number];
export type Stick = { x: number; y: number; h: number; face?: 1 | -1; pose: SP; t?: number; pelvis?: boolean; rot?: number; smile?: number; look?: number };
/** joints; y = ground under the feet, or the pelvis when `pelvis` */
export function stickJoints(m: Stick) {
  const { h, pose: p } = m, f = m.face ?? 1;
  const dn = (a: number): V => [Math.sin(a) * f, Math.cos(a)];
  const add = (a: V, b: V, s: number): V => [a[0] + b[0] * s, a[1] + b[1] * s];
  const br = Math.sin((m.t ?? 0) * 2.2) * 0.006 * h;
  const pel: V = [0, 0];
  const neck = add(pel, [Math.sin(p.lean) * f, -Math.cos(p.lean)], 0.3 * h + br);
  const head = add(neck, [Math.sin(p.lean + p.head * 0.7) * f, -Math.cos(p.lean + p.head * 0.7)], 0.115 * h);
  const sh = add(pel, [Math.sin(p.lean) * f, -Math.cos(p.lean)], 0.27 * h + br);
  const elF = add(sh, dn(p.shF + p.lean), 0.16 * h), haF = add(elF, dn(p.shF + p.elF + p.lean), 0.15 * h);
  const elB = add(sh, dn(p.shB + p.lean), 0.16 * h), haB = add(elB, dn(p.shB + p.elB + p.lean), 0.15 * h);
  const knF = add(pel, dn(p.hiF), 0.235 * h), anF = add(knF, dn(p.hiF - p.knF), 0.235 * h);
  const knB = add(pel, dn(p.hiB), 0.235 * h), anB = add(knB, dn(p.hiB - p.knB), 0.235 * h);
  const low = Math.max(anF[1], anB[1]);
  const ox = m.x, oy = m.pelvis ? m.y : m.y - low - 0.02 * h;
  const rot = m.rot ?? 0;
  const T = (v: V): V => [ox + v[0] * Math.cos(rot) - v[1] * Math.sin(rot), oy + v[0] * Math.sin(rot) + v[1] * Math.cos(rot)];
  return { pel: T(pel), neck: T(neck), head: T(head), sh: T(sh), elF: T(elF), haF: T(haF), elB: T(elB), haB: T(haB), knF: T(knF), anF: T(anF), knB: T(knB), anB: T(anB), r: 0.085 * h, f };
}
export type StickLook = { color?: string; width?: number; glow?: number; glowColor?: string; face?: string; alpha?: number };
export function stickman(c: Ctx, m: Stick, look: StickLook = {}) {
  const J = stickJoints(m);
  const col = look.color ?? "#ffffff";
  const w = look.width ?? Math.max(3, m.h * 0.03);
  c.save();
  c.globalAlpha *= look.alpha ?? 1;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.strokeStyle = col;
  c.fillStyle = col;
  c.lineWidth = w;
  if (look.glow) {
    c.shadowColor = look.glowColor ?? col;
    c.shadowBlur = look.glow * scale();
  }
  const poly = (...pts: V[]) => {
    c.beginPath();
    pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.stroke();
  };
  poly(J.sh, J.elB, J.haB);
  poly(J.pel, J.knB, J.anB);
  const foot = (an: V) => poly(an, [an[0] + J.f * m.h * 0.06, an[1] + m.h * 0.004]);
  foot(J.anB);
  poly(J.pel, J.neck);
  poly(J.pel, J.knF, J.anF);
  foot(J.anF);
  poly(J.sh, J.elF, J.haF);
  // head: a white disc with a face
  c.beginPath();
  c.arc(J.head[0], J.head[1], J.r, 0, Math.PI * 2);
  c.fill();
  c.shadowBlur = 0;
  const fc = look.face ?? "#16130f";
  const t = m.t ?? 0;
  const blink = Math.abs(Math.sin(t * 1.7 + m.x * 0.01)) > 0.985 ? 0.15 : 1;
  const lk = (m.look ?? 0.35) * J.f; // look direction
  c.fillStyle = fc;
  for (const dx of [-0.32, 0.22]) {
    c.beginPath();
    c.ellipse(J.head[0] + (dx + lk * 0.35) * J.r, J.head[1] - 0.12 * J.r, 0.11 * J.r, 0.17 * J.r * blink, 0, 0, Math.PI * 2);
    c.fill();
  }
  const sm = m.smile ?? 0.4;
  c.strokeStyle = fc;
  c.lineWidth = Math.max(1.2, 0.09 * J.r);
  c.beginPath();
  c.arc(J.head[0] + lk * 0.3 * J.r - 0.04 * J.r, J.head[1] + 0.18 * J.r - sm * 0.12 * J.r, 0.28 * J.r, Math.PI * (0.5 - 0.32 * sm), Math.PI * (0.5 + 0.32 * sm));
  c.stroke();
  c.restore();
  return J;
}
