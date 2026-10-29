// Small math kit (pure functions of time; every frame is reproducible).
export const TAU = Math.PI * 2;
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ramp = (t: number, a: number, b: number) => (b <= a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
export const ss = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/** smooth rise a→b, smooth fall c→d */
export const win = (t: number, a: number, b: number, c: number, d: number) => ss(a, b, t) * (1 - ss(c, d, t));
export const ease = {
  inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  outQuint: (t: number) => 1 - Math.pow(1 - t, 5),
  in: (t: number) => t * t * t,
  /** overshoot then settle (blob / portal births) */
  outBack: (t: number, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
};
/** eased progress of t over [a,b] */
export const k = (t: number, a: number, b: number, f: (x: number) => number = ease.inOut) => f(ramp(t, a, b));

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
};
const h2 = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
};
/** smooth value noise in [0,1] */
export function noise2(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = h2(xi, yi), b = h2(xi + 1, yi), c = h2(xi, yi + 1), d = h2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export const noise1 = (x: number, seed = 0) => noise2(x, seed * 17.13);
/** signed fbm in about [-1,1] */
export function fbm(x: number, y: number, oct = 3) {
  let s = 0, a = 0.5, f = 1, n = 0;
  for (let i = 0; i < oct; i++) {
    s += a * (noise2(x * f, y * f) * 2 - 1);
    n += a;
    a *= 0.5;
    f *= 2.03;
  }
  return s / n;
}

// ---- colour ----
export type RGB = [number, number, number];
/** "#rrggbb" or "rgb(a)(r,g,b[,a])" → RGB (mixed colours are passed around as rgba strings) */
export const hex = (h: string): RGB => {
  if (h.charCodeAt(0) !== 35) {
    const m = h.match(/-?[\d.]+/g)!;
    return [+m[0], +m[1], +m[2]];
  }
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const mixRGB = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const rgba = (c: RGB | string, a = 1) => {
  const v = typeof c === "string" ? hex(c) : c;
  return `rgba(${v[0] | 0},${v[1] | 0},${v[2] | 0},${clamp(a).toFixed(4)})`;
};
export const mixHex = (a: string, b: string, t: number) => rgba(mixRGB(hex(a), hex(b), clamp(t)));

export type V2 = [number, number];
export const v2lerp = (a: V2, b: V2, t: number): V2 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
