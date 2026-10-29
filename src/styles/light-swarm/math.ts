// Deterministic math helpers for the light-swarm style (internal; not re-exported).
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (a: number, b: number, x: number) => {
  const k = clamp((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};
export const ramp = (x: number, a: number, b: number) => clamp((x - a) / (b - a));
export const easeOut3 = (k: number) => 1 - Math.pow(1 - clamp(k), 3);
export const easeIn3 = (k: number) => Math.pow(clamp(k), 3);
export const easeInOut = (k: number) => {
  const x = clamp(k);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const expoOut = (k: number) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(k)));
export const expoIn = (k: number) => (k <= 0 ? 0 : Math.pow(2, 10 * clamp(k) - 10));
// overshoot spring for pose snaps: 0 -> 1 with a small bounce
export const backOut = (k: number, s = 1.7) => {
  const x = clamp(k) - 1;
  return 1 + (s + 1) * x * x * x + s * x * x;
};

export function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// decaying pulse after the most recent event time <= t
export function pulse(t: number, times: number[], decay = 6, maxAge = 1.5) {
  let v = 0;
  for (let i = times.length - 1; i >= 0; i--) {
    const d = t - times[i];
    if (d < 0) continue;
    if (d > maxAge) break;
    v = Math.max(v, Math.exp(-d * decay));
  }
  return v;
}
// index of last event <= t (or -1)
export function lastIdx(t: number, times: number[]) {
  let lo = 0, hi = times.length - 1, r = -1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (times[m] <= t) { r = m; lo = m + 1; } else hi = m - 1;
  }
  return r;
}
// piecewise keyframes: [[t, v], ...] with easing between
export function keys(t: number, k: [number, number][], ease: (x: number) => number = easeInOut) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) {
    if (t < k[i + 1][0]) return lerp(k[i][1], k[i + 1][1], ease((t - k[i][0]) / (k[i + 1][0] - k[i][0])));
  }
  return k[k.length - 1][1];
}
