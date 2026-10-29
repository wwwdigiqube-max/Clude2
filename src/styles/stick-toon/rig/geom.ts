// Geometry + keyframe helpers for the stick-figure rig (all units = 720×1280 reference space).
export type V = [number, number];

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1]];
export const scl = (a: V, k: number): V => [a[0] * k, a[1] * k];
export const rot = (p: V, deg: number): V => {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
};
const n2 = (v: number) => Math.round(v * 100) / 100;
export const pt = (p: V) => `${n2(p[0])} ${n2(p[1])}`;

/** Two-bone IK. dir=+1 bends the joint counter-clockwise of the root→target line. Over-reach stretches (cartoon). */
export function ik(a: V, c: V, l1: number, l2: number, dir: number): V {
  const d = Math.hypot(c[0] - a[0], c[1] - a[1]);
  if (d >= l1 + l2 - 0.01 || d < 1e-3) return add(a, scl(sub(c, a), l1 / (l1 + l2)));
  const cosA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const ang = Math.atan2(c[1] - a[1], c[0] - a[0]) + dir * Math.acos(cosA);
  return [a[0] + l1 * Math.cos(ang), a[1] + l1 * Math.sin(ang)];
}

/** Limb a→joint→b with a softly rounded joint (rubber-hose feel, still reads as a bend). */
export const limbPath = (a: V, j: V, b: V, round = 0.78) =>
  `M${pt(a)} C${pt(add(a, scl(sub(j, a), round)))} ${pt(add(b, scl(sub(j, b), round)))} ${pt(b)}`;

/** Catmull-Rom spline through points → cubic Bézier path. */
export function smooth(pts: V[], closed: boolean, k = 1): string {
  const n = pts.length;
  if (n < 2) return "";
  const P = (i: number) => (closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)]);
  let d = `M${pt(pts[0])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = add(p1, scl(sub(p2, p0), k / 6));
    const c2 = sub(p2, scl(sub(p3, p1), k / 6));
    d += ` C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return closed ? d + "Z" : d;
}

// ---- keyframes -------------------------------------------------------------
export type Ease = (t: number) => number;
export const E = {
  lin: (t: number) => t,
  io: (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
  out: (t: number) => 1 - (1 - t) ** 3,
  in: (t: number) => t ** 3,
  in2: (t: number) => t * t,
  out2: (t: number) => 1 - (1 - t) ** 2,
  back: (t: number) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2,
};
export type Key<T> = [number, T, Ease?];

function seg<T>(f: number, keys: Key<T>[]): [T, T, number] {
  if (f <= keys[0][0]) return [keys[0][1], keys[0][1], 0];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, v0] = keys[i];
    const [f1, v1, e] = keys[i + 1];
    if (f < f1) return [v0, v1, (e ?? E.io)((f - f0) / (f1 - f0))];
  }
  const last = keys[keys.length - 1][1];
  return [last, last, 0];
}
/** Numeric track. */
export const tr = (f: number, keys: Key<number>[]) => {
  const [a, b, t] = seg(f, keys);
  return lerp(a, b, t);
};
/** Point track. */
export const trV = (f: number, keys: Key<V>[]): V => {
  const [a, b, t] = seg(f, keys);
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
};
/** Stepped (discrete) track — value of the last key at or before f. */
export function st<T>(f: number, keys: [number, T][]): T {
  let v = keys[0][1];
  for (const [k, val] of keys) if (f >= k) v = val;
  return v;
}

/** Deterministic hash noise in [-1,1]. */
export const hn = (i: number, s = 0) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};
