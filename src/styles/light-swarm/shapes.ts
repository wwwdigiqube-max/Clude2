// Shape library for the light swarm. Every shape fills all N particles; each
// particle stores xyz and w = category + buildOrder * 0.999.
//   category (integer part): 0 ambient haze, 1 line, 2 highlight, 3 flame/ember,
//                            4 left wing, 5 right wing, 6 tail (see CAT)
//   build order (fraction):  0..1 — when the particle flies into place while the
//                            shape is being built (0 = first, 1 = last).
// Add your own shape: write a generator with fillPaths()/haze() and pass it to
// buildShapeTexture(list, { myShape }). The vortex is parametric (shader-side).
import { rng } from "./math";

export const SIDE = 256;
export const N = SIDE * SIDE;
/** Built-in shapes (the demo uses all of them in this order). */
export const SHAPES = ["cloud", "seed", "tree", "diamond", "embers", "phoenix", "vortex", "crown", "galaxy"] as const;
export type ShapeName = (typeof SHAPES)[number];
export const CAT = { haze: 0, line: 1, highlight: 2, flame: 3, wingL: 4, wingR: 5, tail: 6 } as const;
export type ShapeGen = () => Float32Array;

export type V3 = [number, number, number];
const R = rng(2016);
export const gauss = () => {
  let u = 0, v = 0;
  while (u === 0) u = R();
  while (v === 0) v = R();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const scl = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
export const len3 = (a: V3, b: V3) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const nrm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const jit = (p: V3, r: number): V3 => [p[0] + gauss() * r, p[1] + gauss() * r, p[2] + gauss() * r];
export const sphere = (r: number): V3 => {
  const u = R(), v = R();
  const th = u * Math.PI * 2, ph = Math.acos(2 * v - 1);
  return [Math.sin(ph) * Math.cos(th) * r, Math.cos(ph) * r, Math.sin(ph) * Math.sin(th) * r];
};
export const bez2p = (a: V3, c: V3, b: V3, u: number): V3 => add(add(scl(a, (1 - u) * (1 - u)), scl(c, 2 * u * (1 - u))), scl(b, u * u));
export const bez3p = (a: V3, c1: V3, c2: V3, b: V3, u: number): V3 => {
  const v = 1 - u;
  return add(add(scl(a, v * v * v), scl(c1, 3 * u * v * v)), add(scl(c2, 3 * u * u * v), scl(b, u * u * u)));
};
export const bez2 = (a: V3, c: V3, b: V3, n = 24) => Array.from({ length: n + 1 }, (_, i) => bez2p(a, c, b, i / n));
export const bez3 = (a: V3, c1: V3, c2: V3, b: V3, n = 32) => Array.from({ length: n + 1 }, (_, i) => bez3p(a, c1, c2, b, i / n));
export const circle = (c: V3, r: number, u: V3, v: V3, n = 40) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return add(c, add(scl(u, Math.cos(a) * r), scl(v, Math.sin(a) * r)));
  });

export const put = (o: Float32Array, i: number, p: V3, cat: number, b: number) => o.set([p[0], p[1], p[2], cat + Math.min(1, Math.max(0, b)) * 0.999], i * 4);
/** A polyline the particles are spread along: build order runs b0 -> b1 along it. */
export type Path = { pts: V3[]; b0: number; b1: number; cat: number; thick: number; w?: number };
// distribute `count` particles along polylines (density by length * weight)
export function fillPaths(o: Float32Array, start: number, count: number, paths: Path[]) {
  const info = paths.map((p) => {
    const cum = [0];
    for (let i = 1; i < p.pts.length; i++) cum.push(cum[i - 1] + len3(p.pts[i - 1], p.pts[i]));
    return { p, cum, L: cum[cum.length - 1] };
  });
  const tot = info.reduce((s, f) => s + f.L * (f.p.w ?? 1), 0);
  const sample = (f: (typeof info)[number], s: number, i: number) => {
    let j = 0;
    while (j < f.cum.length - 2 && f.cum[j + 1] < s) j++;
    const seg = f.cum[j + 1] - f.cum[j] || 1;
    const p = lerp3(f.p.pts[j], f.p.pts[j + 1], (s - f.cum[j]) / seg);
    put(o, i, jit(p, f.p.thick), f.p.cat, f.p.b0 + (f.p.b1 - f.p.b0) * (s / (f.L || 1)));
  };
  let i = start;
  const end = start + count;
  for (const f of info) {
    const n = Math.round((count * f.L * (f.p.w ?? 1)) / tot);
    for (let k = 0; k < n && i < end; k++, i++) sample(f, R() * f.L, i);
  }
  while (i < end) {
    const f = info[Math.floor(R() * info.length)];
    sample(f, R() * f.L, i++);
  }
  return i;
}
export function haze(o: Float32Array, start: number, end: number, r0: number, r1: number, flat: number, c: V3 = [0, 0, 0]) {
  for (let i = start; i < end; i++) {
    const p = sphere(r0 + Math.pow(R(), 0.7) * (r1 - r0));
    put(o, i, add(c, [p[0], p[1] * flat, p[2]]), 0, R());
  }
}

// ---------------- cloud: the scattered light everything begins from ----------------
function cloud() {
  const o = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) {
    const p = sphere(40 + Math.pow(R(), 0.6) * 150);
    put(o, i, [p[0], p[1] * 0.7, p[2]], R() < 0.55 ? 1 : 0, R());
  }
  return o;
}
// ---------------- seed: a dense heart with a soft halo (also the pressure core and the star) ----------------
function seed() {
  const o = new Float32Array(N * 4);
  const core = Math.floor(N * 0.6);
  for (let i = 0; i < core; i++) put(o, i, sphere(Math.abs(gauss()) * 1.1), 1, R());
  for (let i = core; i < N; i++) put(o, i, sphere(2.5 + Math.pow(R(), 1.4) * 13), 0, R());
  return o;
}
// ---------------- tree of light: braided strand bundles, roots below, glowing leaves ----------------
function tree() {
  const paths: Path[] = [];
  const tips: V3[] = [];
  const MAXG = 7, ROOTG = 5;
  const grow = (p: V3, dir: V3, L: number, gen: number, maxG: number, root: boolean, r0: number) => {
    const q = add(p, scl(dir, L));
    const t1 = nrm(cross(dir, Math.abs(dir[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]));
    const t2 = cross(dir, t1);
    const ba = R() * Math.PI * 2;
    const mid = add(lerp3(p, q, 0.5), add(scl(t1, Math.cos(ba) * L * 0.1), scl(t2, Math.sin(ba) * L * 0.1)));
    const S = Math.max(1, Math.round((root ? 6 : 9) - gen * 1.2));
    const r1 = r0 * 0.66;
    const g0 = root ? (gen / (ROOTG + 1)) * 0.5 : gen / (maxG + 1);
    const g1 = root ? ((gen + 1) / (ROOTG + 1)) * 0.5 : (gen + 1) / (maxG + 1);
    for (let s = 0; s < S; s++) {
      const ph = (s / S) * Math.PI * 2 + R() * 0.3;
      const tw = 1.3 + R() * 0.6;
      const pts: V3[] = [];
      for (let k = 0; k <= 18; k++) {
        const u = k / 18;
        const c = bez2p(p, mid, q, u);
        const r = S === 1 ? 0 : r0 + (r1 - r0) * u;
        const a = ph + tw * u;
        pts.push(add(c, add(scl(t1, Math.cos(a) * r), scl(t2, Math.sin(a) * r))));
      }
      paths.push({ pts, b0: g0, b1: g1, cat: 1, thick: 0.025 });
    }
    if (gen >= maxG) {
      if (!root) tips.push(q);
      return;
    }
    const kids = gen < 2 ? 3 : 2;
    for (let c = 0; c < kids; c++) {
      const ang = (c / kids) * Math.PI * 2 + R() * 1.2 + gen;
      const spread = root ? 0.75 + R() * 0.3 : 0.45 + R() * 0.3;
      const d = nrm([dir[0] + Math.cos(ang) * spread, dir[1] + (root ? -0.15 : 0.1), dir[2] + Math.sin(ang) * spread]);
      grow(q, d, L * (0.68 + R() * 0.12), gen + 1, maxG, root, r1);
    }
  };
  grow([0, -14, 0], [0, 1, 0], 13, 0, MAXG, false, 1.25);
  grow([0, -14, 0], [0, -1, 0], 5, 0, ROOTG, true, 0.9);
  const o = new Float32Array(N * 4);
  let i = fillPaths(o, 0, 44000, paths);
  const per = Math.floor(12000 / tips.length);
  for (const tp of tips) for (let k = 0; k < per; k++, i++) put(o, i, jit(tp, 0.65), 2, 0.9 + R() * 0.1);
  haze(o, i, N, 22, 80, 0.7, [0, 4, 0]);
  return o;
}
// ---------------- diamond: drawn edge by edge, inner fire ----------------
function diamond() {
  const paths: Path[] = [];
  const G = 16;
  const girdle: V3[] = [], table: V3[] = [];
  for (let k = 0; k < G; k++) {
    const a = (k / G) * Math.PI * 2;
    girdle.push([Math.cos(a) * 16, 3, Math.sin(a) * 16]);
  }
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    table.push([Math.cos(a) * 8.5, 8.5, Math.sin(a) * 8.5]);
  }
  const apex: V3 = [0, -15, 0];
  for (let k = 0; k < G; k++) paths.push({ pts: [girdle[k], girdle[(k + 1) % G]], b0: (0.2 * k) / G, b1: (0.2 * (k + 1)) / G, cat: 1, thick: 0.03, w: 1.5 });
  for (let k = 0; k < 8; k++) paths.push({ pts: [table[k], table[(k + 1) % 8]], b0: 0.2 + (0.1 * k) / 8, b1: 0.2 + (0.1 * (k + 1)) / 8, cat: 1, thick: 0.03, w: 1.5 });
  for (let k = 0; k < G; k++) paths.push({ pts: [girdle[k], table[Math.floor(k / 2)]], b0: 0.3 + (0.25 * k) / G, b1: 0.3 + (0.25 * k) / G + 0.06, cat: 1, thick: 0.03 });
  for (let k = 0; k < G; k++) paths.push({ pts: [girdle[k], apex], b0: 0.55 + (0.3 * k) / G, b1: 0.55 + (0.3 * k) / G + 0.1, cat: 1, thick: 0.03 });
  const o = new Float32Array(N * 4);
  let i = fillPaths(o, 0, 46000, paths);
  for (let k = 0; k < 8000; k++, i++) {
    const p = sphere(Math.pow(R(), 0.5) * 10);
    put(o, i, [p[0], p[1] * 0.8 - 1, p[2]], 2, 0.9 + R() * 0.1);
  }
  haze(o, i, N, 28, 90, 0.8);
  return o;
}
// ---------------- embers: the ashes the phoenix rises from ----------------
function embers() {
  const o = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) {
    const p = sphere(8 + Math.pow(R(), 0.8) * 70);
    put(o, i, [p[0], p[1] * 0.65, p[2]], R() < 0.85 ? 3 : 0, R());
  }
  return o;
}
// ---------------- phoenix (modelled in XY, facing +z) ----------------
function phoenix() {
  const paths: Path[] = [];
  const flames: V3[] = [];
  const spine = (u: number): V3 => [Math.sin(u * Math.PI) * 1.4, 8 - 18 * u, Math.sin(u * 2.4) * 0.8];
  for (let s = 0; s < 9; s++) {
    const ph = (s / 9) * Math.PI * 2;
    const pts: V3[] = [];
    for (let k = 0; k <= 24; k++) {
      const u = k / 24;
      const r = 0.5 + 2.6 * Math.sin(Math.PI * Math.min(1, 0.12 + u * 1.1)) * (1 - 0.55 * u);
      const c = spine(u);
      const a = ph + u * 1.6;
      pts.push([c[0] + Math.cos(a) * r, c[1], c[2] + Math.sin(a) * r * 0.8]);
    }
    paths.push({ pts, b0: 0.0, b1: 0.18, cat: 1, thick: 0.03 });
  }
  for (let s = 0; s < 5; s++) {
    const o = (s - 2) * 0.35;
    paths.push({ pts: bez3([o, 8, 0], [-1.5 + o, 12, 0.3], [0.5 + o * 0.6, 16.5, 0], [3.2 + o * 0.3, 18.2, 0], 26), b0: 0.12, b1: 0.24, cat: 1, thick: 0.03 });
  }
  paths.push({ pts: circle([3.6, 18.7, 0], 1.7, [1, 0, 0], [0, 1, 0], 40), b0: 0.24, b1: 0.27, cat: 1, thick: 0.02 });
  paths.push({ pts: bez2([5.1, 19.3, 0], [7.2, 19.0, 0], [9.2, 17.6, 0], 16), b0: 0.26, b1: 0.28, cat: 1, thick: 0.02 });
  paths.push({ pts: bez2([4.9, 17.8, 0], [7.0, 17.6, 0], [9.2, 17.6, 0], 16), b0: 0.26, b1: 0.28, cat: 1, thick: 0.02 });
  paths.push({ pts: circle([4.1, 19.0, 0.3], 0.35, [1, 0, 0], [0, 1, 0], 12), b0: 0.27, b1: 0.28, cat: 2, thick: 0.01 });
  const crest: [V3, V3, V3][] = [
    [[-1, 24, 0], [-5, 29, 0], [-7.5, 31, 0]],
    [[0.5, 25, 0], [-2, 31, 0], [-3, 34, 0]],
    [[2.5, 24.5, 0], [2, 30, 0], [1, 33.5, 0]],
    [[-3, 22, 0], [-8, 25, 0], [-10, 26.5, 0]],
  ];
  for (const [c1, c2, e] of crest) {
    const pts = bez3([2.8, 20.2, 0], c1, c2, e, 30);
    for (let k = 1; k <= 14; k++) {
      const a = (k / 14) * Math.PI * 1.6;
      pts.push(add(e, [Math.cos(a + Math.PI) * 0.9 + 0.9, Math.sin(a + Math.PI) * 0.9, 0]));
    }
    paths.push({ pts, b0: 0.27, b1: 0.34, cat: 2, thick: 0.03 });
  }
  for (const sd of [-1, 1]) {
    const cat = sd < 0 ? 4 : 5;
    const LE = (v: number): V3 => bez3p([sd * 2.5, 7, 0], [sd * 14, 15, -2], [sd * 28, 26, -4], [sd * 45, 31, -5], v);
    for (let s = 0; s < 4; s++) {
      const pts: V3[] = [];
      for (let k = 0; k <= 40; k++) pts.push(add(LE(k / 40), [0, (s - 1.5) * 0.35, (s - 1.5) * 0.2]));
      paths.push({ pts, b0: 0.34, b1: 0.5, cat, thick: 0.03, w: 1.3 });
    }
    const NF = 26;
    for (let f = 0; f < NF; f++) {
      const v = 0.06 + 0.94 * (f / (NF - 1));
      const st = LE(v);
      const al = ((6 + 74 * Math.pow(v, 1.15)) * Math.PI) / 180;
      const len = 12 + 21 * Math.sin(Math.PI * Math.min(1, v * 0.92));
      const dir: V3 = [sd * Math.sin(al), -Math.cos(al), 0];
      const en = add(st, scl(dir, len));
      const perp: V3 = [-dir[1] * sd, dir[0] * sd, 0];
      const ctl = add(lerp3(st, en, 0.5), scl(perp, -len * 0.1));
      for (let s = 0; s < 2; s++) {
        const o2 = scl(perp, (s - 0.5) * 0.5);
        const b0 = 0.4 + 0.32 * v;
        paths.push({ pts: bez2(add(st, o2), add(ctl, o2), add(en, scl(o2, 0.4)), 28), b0, b1: b0 + 0.12, cat, thick: 0.025 });
      }
      flames.push(en, lerp3(st, en, 0.7));
    }
    const NC = 18;
    for (let f = 0; f < NC; f++) {
      const v = 0.05 + 0.8 * (f / (NC - 1));
      const st = LE(v);
      const al = ((12 + 60 * v) * Math.PI) / 180;
      const len = 5 + 7 * Math.sin(Math.PI * v);
      const dir: V3 = [sd * Math.sin(al), -Math.cos(al), 0];
      const en = add(st, scl(dir, len));
      const perp: V3 = [-dir[1] * sd, dir[0] * sd, 0];
      const b0 = 0.38 + 0.3 * v;
      paths.push({ pts: bez2(st, add(lerp3(st, en, 0.5), scl(perp, -len * 0.12)), en, 18), b0, b1: b0 + 0.06, cat, thick: 0.025 });
    }
  }
  for (let j = 0; j < 7; j++) {
    const a = ((j - 3) / 3) * 0.75;
    const L = 30 + 9 * Math.cos(a * 1.4);
    const st: V3 = [0, -10, 0];
    const dir: V3 = [Math.sin(a), -Math.cos(a), 0];
    const side: V3 = [Math.cos(a), Math.sin(a), 0];
    const sg = j === 3 ? 1 : Math.sign(a);
    const en = add(st, scl(dir, L));
    const pts = bez3(st, add(add(st, scl(dir, L * 0.33)), scl(side, 4 * sg)), add(add(st, scl(dir, L * 0.7)), scl(side, -5 * sg)), en, 40);
    const cc = add(en, scl(side, 3.2 * sg));
    const a0 = Math.atan2(en[1] - cc[1], en[0] - cc[0]);
    for (let k = 1; k <= 30; k++) {
      const u = k / 30;
      const ang = a0 + sg * u * Math.PI * 2.6;
      const r = 3.2 * (1 - 0.75 * u);
      pts.push([cc[0] + Math.cos(ang) * r, cc[1] + Math.sin(ang) * r, 0]);
    }
    for (let s = 0; s < 2; s++) paths.push({ pts: pts.map((p) => add(p, [0, 0, (s - 0.5) * 0.6])), b0: 0.55, b1: 0.95, cat: 6, thick: 0.03 });
    flames.push(en, lerp3(st, en, 0.6));
  }
  const o = new Float32Array(N * 4);
  let i = fillPaths(o, 0, 50000, paths);
  for (let k = 0; k < 9000; k++, i++) put(o, i, jit(flames[Math.floor(R() * flames.length)], 1.2), 3, 0.9 + R() * 0.1);
  haze(o, i, N, 30, 90, 0.7, [0, 5, 0]);
  return o;
}
// ---------------- flame vortex (parametric): angle, height phase, radius jitter ----------------
function vortex() {
  const o = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) {
    const arm = Math.floor(R() * 4);
    const h0 = R();
    o.set([arm * (Math.PI / 2) + gauss() * 0.25, h0, gauss(), 3 + h0 * 0.999], i * 4);
  }
  return o;
}
// ---------------- crown ----------------
function crown() {
  const paths: Path[] = [];
  const Rr = 17;
  const ring = (y: number, r: number, n = 120): V3[] => Array.from({ length: n + 1 }, (_, k) => [Math.cos((k / n) * Math.PI * 2) * r, y, Math.sin((k / n) * Math.PI * 2) * r]);
  ([[-7, 0], [-5.4, 0.03], [-2.6, 0.06]] as [number, number][]).forEach(([y, b0]) => paths.push({ pts: ring(y, Rr), b0, b1: b0 + 0.14, cat: 1, thick: 0.03, w: 1.2 }));
  const zz: V3[] = [];
  for (let k = 0; k <= 56; k++) {
    const a = (k / 56) * Math.PI * 2;
    zz.push([Math.cos(a) * Rr, k % 2 ? -2.6 : -5.4, Math.sin(a) * Rr]);
  }
  paths.push({ pts: zz, b0: 0.2, b1: 0.3, cat: 1, thick: 0.02 });
  const tips: V3[] = [];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    const H = k % 2 ? 9 : 15;
    const tip: V3 = [Math.cos(a) * Rr * 0.93, -2.6 + H, Math.sin(a) * Rr * 0.93];
    tips.push(tip);
    const b0 = 0.3 + 0.045 * k;
    for (const da of [-0.2, 0.2]) {
      const st: V3 = [Math.cos(a + da) * Rr, -2.6, Math.sin(a + da) * Rr];
      const ctl: V3 = [Math.cos(a + da * 0.3) * Rr * 0.97, -2.6 + H * 0.55, Math.sin(a + da * 0.3) * Rr * 0.97];
      paths.push({ pts: bez2(st, ctl, tip, 24), b0, b1: b0 + 0.08, cat: 1, thick: 0.025 });
    }
    paths.push({ pts: bez2([Math.cos(a) * Rr, -2.6, Math.sin(a) * Rr], [Math.cos(a) * Rr * 0.95, -2.6 + H * 0.5, Math.sin(a) * Rr * 0.95], tip, 20), b0, b1: b0 + 0.08, cat: 1, thick: 0.02 });
  }
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2;
    for (const off of [-0.25, 0.25]) {
      const st: V3 = [Math.cos(a) * Rr * 0.98, -2.6, Math.sin(a) * Rr * 0.98];
      const tg: V3 = [-Math.sin(a) * off, 0, Math.cos(a) * off];
      paths.push({ pts: bez2(add(st, tg), add([Math.cos(a) * Rr * 0.8, 17, Math.sin(a) * Rr * 0.8], tg), [0, 16, 0], 30), b0: 0.68, b1: 0.86, cat: 1, thick: 0.03 });
    }
  }
  paths.push({ pts: circle([0, 17.8, 0], 1.7, [1, 0, 0], [0, 1, 0], 40), b0: 0.86, b1: 0.89, cat: 2, thick: 0.02 });
  paths.push({ pts: circle([0, 17.8, 0], 1.7, [0, 0, 1], [0, 1, 0], 40), b0: 0.86, b1: 0.89, cat: 2, thick: 0.02 });
  paths.push({ pts: [[0, 19.5, 0], [0, 24.5, 0]], b0: 0.89, b1: 0.92, cat: 2, thick: 0.03 });
  paths.push({ pts: [[-2, 22.5, 0], [2, 22.5, 0]], b0: 0.9, b1: 0.92, cat: 2, thick: 0.03 });
  for (const tp of tips) {
    const a = Math.atan2(tp[2], tp[0]);
    paths.push({ pts: circle(add(tp, [0, 1.0, 0]), 1.0, [-Math.sin(a), 0, Math.cos(a)], [0, 1, 0], 24), b0: 0.92, b1: 0.96, cat: 2, thick: 0.02 });
  }
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    paths.push({ pts: circle([Math.cos(a) * Rr * 1.01, -4, Math.sin(a) * Rr * 1.01], 0.6, [-Math.sin(a), 0, Math.cos(a)], [0, 1, 0], 16), b0: 0.95, b1: 1, cat: 2, thick: 0.015 });
  }
  const o = new Float32Array(N * 4);
  const i = fillPaths(o, 0, 50000, paths);
  haze(o, i, N, 26, 85, 0.75, [0, 3, 0]);
  return o;
}
// ---------------- galaxy ----------------
function galaxy() {
  const o = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) {
    const rr = Math.pow(R(), 0.55);
    if (i < N * 0.16) {
      const p = sphere(Math.abs(gauss()) * 4);
      put(o, i, [p[0], p[1] * 0.6, p[2]], 2, rr * 0.2);
      continue;
    }
    const arm = Math.floor(R() * 4);
    const r = 3 + rr * 70;
    const a = arm * (Math.PI / 2) + Math.log(r) * 2.4 + gauss() * 0.18;
    put(o, i, [Math.cos(a) * r, gauss() * (0.6 + rr * 1.8), Math.sin(a) * r], R() < 0.9 ? 1 : 0, rr);
  }
  return o;
}

export const SHAPE_LIB: Record<ShapeName, ShapeGen> = { cloud, seed, tree, diamond, embers, phoenix, vortex, crown, galaxy };

/** Pack the shapes of one film into a float texture (one 256x256 block per shape, in list order). */
export function buildShapeTexture(list: readonly string[], extra: Record<string, ShapeGen> = {}) {
  const lib: Record<string, ShapeGen> = { ...SHAPE_LIB, ...extra };
  const K = list.length;
  const data = new Float32Array(SIDE * SIDE * K * 4);
  list.forEach((s, k) => {
    if (!lib[s]) throw new Error(`light-swarm: unknown shape "${s}"`);
    data.set(lib[s](), k * N * 4);
  });
  return { data, K };
}
