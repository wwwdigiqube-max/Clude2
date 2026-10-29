import { clamp, eio, eo, lerp } from "./theme";

// ================= group B helpers (pure functions of time) =================
export type Pt = [number, number];
export type Ease = (x: number) => number;

/** palette hex → rgba() with alpha (palette colours only — never invent a hue) */
export const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${clamp(a).toFixed(3)})`;
};

/** 0 → 1 → 0: fast attack (d1, ease-out) at time a, soft release (d2, ease-in-out) */
export const hit = (t: number, a: number, d1 = 0.06, d2 = 0.5) =>
  t < a ? 0 : t < a + d1 ? eo((t - a) / d1) : 1 - eio(clamp((t - a - d1) / d2));

/** damped oscillation that starts at time a (0 at a, first peak a quarter period later) */
export const wob = (t: number, a: number, freq = 3, decay = 5) =>
  t < a ? 0 : Math.sin((t - a) * freq * Math.PI * 2) * Math.exp(-(t - a) * decay);

/** keyed value: from v0, each key [time, value, duration, ease?] glides the value to `value` (keys sorted by time) */
export const track = (t: number, v0: number, keys: [number, number, number, Ease?][]) => {
  let v = v0;
  for (const [a, val, d, ease] of keys) {
    if (t <= a) break;
    v = lerp(v, val, (ease ?? eo)(clamp((t - a) / Math.max(1e-6, d))));
  }
  return v;
};

export const lerpPt = (a: Pt, b: Pt, p: number): Pt => [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];

/** point on a quadratic bezier */
export const qpt = (a: Pt, c: Pt, b: Pt, u: number): Pt => [
  (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0],
  (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1],
];

/** smooth closed path through points (midpoint quadratics) */
export const smoothClosed = (pts: Pt[]) => {
  const n = pts.length;
  const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const m0 = mid(pts[n - 1], pts[0]);
  let d = `M ${m0[0].toFixed(1)} ${m0[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i], m = mid(p, pts[(i + 1) % n]);
    d += ` Q ${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  return d + " Z";
};

/** open smooth path through points */
export const smoothOpen = (pts: Pt[]) => {
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i], q = pts[i + 1];
    const m: Pt = i === pts.length - 2 ? q : [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    d += ` Q ${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  if (pts.length === 2) d += ` L ${pts[1][0].toFixed(1)} ${pts[1][1].toFixed(1)}`;
  return d;
};

export const poly = (pts: Pt[]) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
