// Light Logo · the particle shapes, built with the light-swarm helpers: network, brain, core, chip, aperture, play,
// sparkle, and the logo (from logo-pts.json: edges + scan fill + second line + accent).
// Every generator fills all N particles: xyz + w = category + build order * 0.999 (see styles/light-swarm/shapes.ts).
// Extra categories used here: 7 = orbit ring (parametric), 8 = rising data stream (parametric), 9 = logo scan fill.
import { CAT, N, bez2, circle, fillPaths, haze, jit, put, sphere, type Path, type V3 } from "../../light-swarm/shapes";
import { rng } from "../../light-swarm/math";

const R = rng(2424);
const gauss = () => {
  let u = 0;
  let v = 0;
  while (u === 0) u = R();
  while (v === 0) v = R();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};
const X: V3 = [1, 0, 0];
const Y: V3 = [0, 1, 0];

// ─────────────── neural network: six layers, every node wired to the next layer; signals run left → right on the kicks
export const NET_LAYERS = [5, 8, 11, 11, 8, 5];
const netNodes = () => {
  const L = NET_LAYERS.length;
  return NET_LAYERS.map((n, li) =>
    Array.from({ length: n }, (_, j): V3 => {
      const x = -56 + (112 * li) / (L - 1);
      const y = (j - (n - 1) / 2) * 5.6;
      const z = Math.sin(j * 1.9 + li * 1.3) * 7 + (li % 2 ? 3 : -3);
      return [x, y, z];
    }),
  );
};
function network() {
  const o = new Float32Array(N * 4);
  const nodes = netNodes();
  const L = nodes.length;
  const prog = (li: number) => (li / (L - 1)) * 0.92;
  const paths: Path[] = [];
  for (let li = 0; li < L - 1; li++)
    for (const a of nodes[li])
      for (const b of nodes[li + 1]) {
        const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + gauss() * 0.6, (a[2] + b[2]) / 2 + gauss() * 1.5];
        paths.push({ pts: bez2(a, mid, b, 12), b0: prog(li), b1: prog(li + 1), cat: CAT.line, thick: 0.07 });
      }
  let i = fillPaths(o, 0, 41000, paths);
  // nodes: a hot core and a thin ring facing the camera
  const all = nodes.flatMap((ns, li) => ns.map((p) => ({ p, li })));
  for (const { p, li } of all) {
    for (let k = 0; k < 220; k++, i++) put(o, i, jit(p, 0.38), CAT.highlight, prog(li));
    const ring = circle(p, 1.9, X, Y, 24);
    i = fillPaths(o, i, 100, [{ pts: ring, b0: prog(li), b1: prog(li) + 0.02, cat: CAT.line, thick: 0.05 }]);
  }
  haze(o, i, N, 36, 110, 0.65);
  return o;
}

// ─────────────── the AI core: a geodesic shell, an inner shell, a white-hot heart, orbit rings and rising data streams
const icosa = (r: number, subdiv: boolean) => {
  const t = (1 + Math.sqrt(5)) / 2;
  let v: V3[] = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
  let f = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
  const norm = (p: V3): V3 => {
    const l = Math.hypot(...p);
    return [p[0] / l, p[1] / l, p[2] / l];
  };
  v = v.map(norm);
  if (subdiv) {
    const cache = new Map<string, number>();
    const mid = (a: number, b: number) => {
      const key = a < b ? `${a}_${b}` : `${b}_${a}`;
      if (!cache.has(key)) {
        v.push(norm([(v[a][0] + v[b][0]) / 2, (v[a][1] + v[b][1]) / 2, (v[a][2] + v[b][2]) / 2]));
        cache.set(key, v.length - 1);
      }
      return cache.get(key)!;
    };
    f = f.flatMap(([a, b, c]) => {
      const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a);
      return [[a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]];
    });
  }
  const edges = new Set<string>();
  for (const [a, b, c] of f) for (const [x, y] of [[a, b], [b, c], [c, a]]) edges.add(x < y ? `${x}_${y}` : `${y}_${x}`);
  return [...edges].map((e) => {
    const [a, b] = e.split("_").map(Number);
    // the edge as an arc on the sphere
    return Array.from({ length: 9 }, (_, k): V3 => {
      const u = k / 8;
      const p = norm([v[a][0] + (v[b][0] - v[a][0]) * u, v[a][1] + (v[b][1] - v[a][1]) * u, v[a][2] + (v[b][2] - v[a][2]) * u]);
      return [p[0] * r, p[1] * r, p[2] * r];
    });
  });
};
function core() {
  const o = new Float32Array(N * 4);
  const shell = icosa(15, true).map((pts): Path => {
    const yMid = (pts[0][1] + pts[pts.length - 1][1]) / 2;
    const b = 0.08 + ((yMid + 15) / 30) * 0.45;
    return { pts, b0: b, b1: b + 0.04, cat: CAT.line, thick: 0.06 };
  });
  let i = fillPaths(o, 0, 19000, shell);
  const inner = icosa(7.5, false).map((pts): Path => ({ pts: pts.map((p): V3 => [p[0] * 0.8 + p[2] * 0.6, p[1], -p[0] * 0.6 + p[2] * 0.8]), b0: 0.02, b1: 0.06, cat: CAT.line, thick: 0.05 }));
  i = fillPaths(o, i, 5000, inner);
  for (let k = 0; k < 5000; k++, i++) put(o, i, sphere(Math.abs(gauss()) * 1.6), CAT.highlight, 0);
  // orbit rings: q = (angle, ring index, radial jitter), cat 7
  for (let k = 0; k < 21000; k++, i++) o.set([R() * Math.PI * 2, Math.floor(R() * 3), gauss(), 7 + (0.55 + 0.45 * R()) * 0.999], i * 4);
  // rising streams: q = (angle, height phase, radius), cat 8
  for (let k = 0; k < 8000; k++, i++) {
    const lane = Math.floor(R() * 26);
    o.set([lane * ((Math.PI * 2) / 26) + gauss() * 0.02, R(), 34 + (lane % 5) * 6 + gauss() * 0.3, 8 + (0.7 + 0.3 * R()) * 0.999], i * 4);
  }
  haze(o, i, N, 30, 110, 0.6);
  return o;
}


// ─────────────── the brain: two hemispheres whose folds are contour lines of a noise field, cerebellum, stem.
// build order runs back → front; signal waves travel along it on the kicks (engine).
const h3 = (x: number, y: number, z: number) => {
  const v = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return v - Math.floor(v);
};
const vnoise = (x: number, y: number, z: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const s = (t: number) => t * t * (3 - 2 * t);
  const fx = s(x - xi), fy = s(y - yi), fz = s(z - zi);
  const l = (a: number, b: number, k: number) => a + (b - a) * k;
  const c = (dx: number, dy: number, dz: number) => h3(xi + dx, yi + dy, zi + dz);
  return l(l(l(c(0, 0, 0), c(1, 0, 0), fx), l(c(0, 1, 0), c(1, 1, 0), fx), fy), l(l(c(0, 0, 1), c(1, 0, 1), fx), l(c(0, 1, 1), c(1, 1, 1), fx), fy), fz);
};
const fbm = (x: number, y: number, z: number) => 0.62 * vnoise(x, y, z) + 0.28 * vnoise(x * 2.03 + 5.1, y * 2.03, z * 2.03) + 0.1 * vnoise(x * 4.1, y * 4.1 + 2.7, z * 4.1);
function brain() {
  const o = new Float32Array(N * 4);
  let i = 0;
  const bOf = (z: number) => Math.min(1, Math.max(0, (20 - z) / 40 + gauss() * 0.015));
  // hemispheres: folds = thin bands of the noise field on the surface
  const want = 46000;
  let guard = 0;
  while (i < want && guard++ < 3e6) {
    const side = R() < 0.5 ? -1 : 1;
    const d = sphere(1);
    let [x, y, z] = [d[0] * 10.8, d[1] * 13.2, d[2] * 19.5];
    if (side * x < -0.55 * 10.8) continue; // no deep medial wall
    if (y < -4.5) y = -4.5 + (y + 4.5) * 0.5;
    x *= 1 - 0.13 * Math.max(0, z / 19.5);
    const p: V3 = [x + side * 6.9, y, z];
    const f = fbm(p[0] * 0.16 + side * 9.0, p[1] * 0.16, p[2] * 0.16);
    const band = Math.abs(((f * 7.5) % 1) - 0.5);
    if (band > 0.055) continue;
    put(o, i++, jit(p, 0.08), CAT.line, bOf(p[2]));
  }
  // the longitudinal fissure: two bright arcs along the top
  for (let k = 0; k < 2500; k++, i++) {
    const a = R() * Math.PI;
    const side = k % 2 ? 1 : -1;
    put(o, i, jit([side * 0.9, Math.sin(a) * 13.0 - 0.6, Math.cos(a) * 19.0], 0.1), CAT.highlight, bOf(Math.cos(a) * 19.0));
  }
  // cerebellum: horizontal folia
  guard = 0;
  let c = 0;
  while (c < 8500 && guard++ < 2e6) {
    const d = sphere(1);
    const p: V3 = [d[0] * 12.5, d[1] * 5.4 - 9.6, d[2] * 7.2 - 12.5];
    if (p[1] > -6.5 && p[2] > -9) continue;
    const band = Math.abs(((p[1] * 0.95 + vnoise(p[0] * 0.3, 0, p[2] * 0.3) * 0.6 + 50) % 1) - 0.5);
    if (band > 0.09) continue;
    put(o, i++, jit(p, 0.06), CAT.line, bOf(p[2]));
    c++;
  }
  // brain stem
  const stem: Path[] = [];
  for (let k = 0; k < 7; k++) {
    const dx = (k - 3) * 0.75;
    stem.push({ pts: bez2([dx, -6.5, -4], [dx * 0.9, -14, -7.5], [dx * 0.8, -23, -8.5], 20), b0: 0, b1: 0.15, cat: CAT.line, thick: 0.08 });
  }
  i = fillPaths(o, i, 2500, stem);
  // sparks scattered over the folds
  for (let k = 0; k < 1500; k++, i++) {
    const q = Math.floor(R() * 40000) * 4;
    put(o, i, jit([o[q], o[q + 1], o[q + 2]], 0.4), CAT.highlight, o[q + 3] % 1);
  }
  haze(o, i, N, 32, 110, 0.6);
  return o;
}

// ─────────────── four quick symbols for the hi-hat run (flat, facing the camera)
const flat = (pts: [number, number][]): V3[] => pts.map(([x, y]) => [x, y, 0]);
const symbol = (paths: Path[], hi: V3[], hiR: number, nHi = 1800) => {
  const o = new Float32Array(N * 4);
  let i = fillPaths(o, 0, 56000 - nHi, paths);
  for (let k = 0; k < nHi; k++, i++) put(o, i, jit(hi[k % hi.length], hiR), CAT.highlight, R());
  haze(o, i, N, 50, 130, 0.6);
  return o;
};
function chip() {
  // an AI processor: package outline, die, pins on every side, circuit traces running out to pads
  const sq = (h: number): V3[] => flat([[-h, -h], [h, -h], [h, h], [-h, h], [-h, -h]]);
  const paths: Path[] = [
    { pts: sq(15), b0: 0, b1: 1, cat: CAT.line, thick: 0.1, w: 1.5 },
    { pts: sq(8), b0: 0, b1: 1, cat: CAT.line, thick: 0.08, w: 1.3 },
    { pts: sq(5.5), b0: 0, b1: 1, cat: CAT.line, thick: 0.06, w: 0.8 },
  ];
  const sides: [V3, V3][] = [[[1, 0, 0], [0, 1, 0]], [[-1, 0, 0], [0, 1, 0]], [[0, 1, 0], [1, 0, 0]], [[0, -1, 0], [1, 0, 0]]];
  for (const [n, t] of sides)
    for (let k = 0; k < 7; k++) {
      const o = (k - 3) * 3.6;
      const at = (d: number, s: number): V3 => [n[0] * d + t[0] * s, n[1] * d + t[1] * s, 0];
      paths.push({ pts: [at(15, o), at(20, o)], b0: 0, b1: 1, cat: CAT.line, thick: 0.08, w: 1.2 }); // pin
      paths.push({ pts: [at(8, o * 0.6), at(11.5, o * 0.6), at(13, o), at(15, o)], b0: 0, b1: 1, cat: CAT.line, thick: 0.04, w: 0.5 }); // die → pin
      if (k % 2 === 0) {
        const bend = (k - 3) * 2.2;
        const tr = [at(20, o), at(25, o), at(29, o + bend), at(34 + (k % 3) * 3, o + bend)];
        paths.push({ pts: tr, b0: 0, b1: 1, cat: CAT.line, thick: 0.05, w: 0.7 }); // trace out
        paths.push({ pts: circle(tr[3], 0.9, X, Y, 10), b0: 0, b1: 1, cat: CAT.highlight, thick: 0.05, w: 0.6 }); // pad
      }
    }
  return symbol(paths, [[0, 0, 0]], 2.2, 1400);
}
function aperture() {
  const paths: Path[] = [{ pts: circle([0, 0, 0], 25, X, Y, 80), b0: 0, b1: 1, cat: CAT.line, thick: 0.1, w: 1.3 }, { pts: circle([0, 0, 0], 28.5, X, Y, 80), b0: 0, b1: 1, cat: CAT.line, thick: 0.06, w: 0.7 }];
  const n = 7;
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2;
    const a2 = ((k + 1) / n) * Math.PI * 2;
    const inner: V3 = [Math.cos(a) * 9, Math.sin(a) * 9, 0];
    const innerN: V3 = [Math.cos(a2) * 9, Math.sin(a2) * 9, 0];
    const outer: V3 = [Math.cos(a + 1.1) * 25, Math.sin(a + 1.1) * 25, 0];
    paths.push({ pts: [inner, innerN], b0: 0, b1: 1, cat: CAT.line, thick: 0.08 });
    paths.push({ pts: bez2(inner, [Math.cos(a + 0.7) * 19, Math.sin(a + 0.7) * 19, 0], outer, 16), b0: 0, b1: 1, cat: CAT.line, thick: 0.07 });
  }
  return symbol(paths, [[0, 0, 0]], 0.9, 900);
}
function play() {
  const tri = flat([[-9, 14], [-9, -14], [15, 0], [-9, 14]]);
  const paths: Path[] = [
    { pts: tri, b0: 0, b1: 1, cat: CAT.line, thick: 0.1, w: 1.6 },
    { pts: circle([0, 0, 0], 25, X, Y, 80), b0: 0, b1: 1, cat: CAT.line, thick: 0.1, w: 1.1 },
  ];
  for (let k = 1; k < 7; k++) paths.push({ pts: flat([[-9 + k * 0.6, 14 - k * 1.6], [-9 + k * 0.6, -14 + k * 1.6]]), b0: 0, b1: 1, cat: CAT.line, thick: 0.05, w: 0.6 });
  return symbol(paths, [[-1, 0, 0]], 0.8, 300);
}
function sparkle() {
  const star = (cx: number, cy: number, s: number): Path[] => {
    const tips: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    return tips.map((a, k) => {
      const b = tips[(k + 1) % 4];
      return { pts: bez2([cx + a[0] * s, cy + a[1] * s, 0], [cx + (a[0] + b[0]) * s * 0.12, cy + (a[1] + b[1]) * s * 0.12, 0], [cx + b[0] * s, cy + b[1] * s, 0], 30), b0: 0, b1: 1, cat: CAT.line, thick: 0.09 };
    });
  };
  return symbol([...star(-4, -3, 22), ...star(19, 16, 7.5), ...star(-22, 17, 4.5)], [[-4, -3, 0], [19, 16, 0]], 1.6);
}

// ─────────────── the logo: edges + horizontal scan fill, laid out so the logo camera sees it centred on screen
/** logo-pts.json from tools/logo-trace.mjs (logo pixels; box = the whole logo; cut = the line the halves split on) */
export type LogoPts = { w: number; h: number; box: number[]; cut: number; edges: number[]; runs: number[]; sub: number[]; accent: number[]; accentEdge: number };
/** the logo camera: distance LOGO_DIST, fov LOGO_FOV — world units per screen pixel (1080p) = WPP */
export const LOGO_DIST = 100;
export const LOGO_FOV = 40;
const WPP = (2 * LOGO_DIST * Math.tan(((LOGO_FOV / 2) * Math.PI) / 180)) / 1080;
/**
 * Where the logo sits: centred across, its cut line on the screen's middle (y 540), about 1150 px wide (or 520 px
 * tall) at 1080p. toWorld maps logo pixels → world; x0w/x1w = the logo's ends (world x, for sweeps and arcs);
 * sx0/sx1 = its ends in 1080p screen pixels (for the 2D cut line); subCx = the second line's centre (world x).
 */
export function logoLayout(P: LogoPts) {
  const [x0, y0, x1, y1] = P.box;
  const cx = (x0 + x1) / 2;
  const LS = Math.min(1150 / (x1 - x0), 520 / (y1 - y0));
  const toWorld = (x: number, y: number): V3 => [(x - cx) * LS * WPP, (P.cut - y) * LS * WPP, 0];
  let s0 = Infinity, s1 = -Infinity;
  for (let i = 0; i < P.sub.length; i += 2) {
    s0 = Math.min(s0, P.sub[i]);
    s1 = Math.max(s1, P.sub[i]);
  }
  const sub = P.sub.length ? [s0, s1] : [x0, x1];
  return { LS, toWorld, x0w: toWorld(x0, P.cut)[0], x1w: toWorld(x1, P.cut)[0], sx0: 960 + (x0 - cx) * LS, sx1: 960 + (x1 - cx) * LS, sub, subCx: toWorld((sub[0] + sub[1]) / 2, P.cut)[0] };
}
let PTS: LogoPts | null = null;
/** the engine calls this before it builds the shape texture */
export const setLogo = (p: LogoPts) => {
  PTS = p;
};
function logo() {
  if (!PTS) throw new Error("light-logo: setLogo(logo-pts.json) before building the shapes");
  const L = logoLayout(PTS);
  const toWorld = L.toWorld;
  const [bx0, , bx1] = PTS.box;
  const o = new Float32Array(N * 4);
  const E = PTS.edges;
  const RU = PTS.runs;
  // particles per part; a logo without a second line or an accent gives their share to the letters
  const nSub = PTS.sub.length ? 6000 : 0;
  const nAcc = PTS.accent.length ? 4500 : 0;
  const nEdge = 30000 + (nAcc ? 0 : 4500);
  const nFill = 20000 + (nSub ? 0 : 6000);
  const bx = (x: number) => Math.min(1, Math.max(0, (x - bx0) / (bx1 - bx0) + gauss() * 0.01));
  let i = 0;
  const ne = E.length / 2;
  for (let k = 0; k < nEdge; k++, i++) {
    const j = Math.floor(R() * ne);
    const x = E[j * 2] + (R() - 0.5), y = E[j * 2 + 1] + (R() - 0.5);
    put(o, i, jit(toWorld(x, y), 0.05), CAT.line, bx(x));
  }
  const lens: number[] = [];
  let tot = 0;
  for (let k = 0; k < RU.length; k += 3) {
    tot += RU[k + 2] - RU[k + 1];
    lens.push(tot);
  }
  for (let k = 0; k < nFill; k++, i++) {
    const s = R() * tot;
    let j = 0;
    while (lens[j] < s) j++;
    const y = RU[j * 3], x0 = RU[j * 3 + 1], x1 = RU[j * 3 + 2];
    const x = x0 + R() * (x1 - x0);
    put(o, i, jit(toWorld(x, y), 0.03), 9, bx(x));
  }
  // the second line (cat 11): revealed left → right after the main mark
  const AC = PTS.sub, na = AC.length / 2;
  for (let k = 0; k < nSub; k++, i++) {
    const j = Math.floor(R() * na);
    const x = AC[j * 2] + (R() - 0.5), y = AC[j * 2 + 1] + (R() - 0.5);
    put(o, i, jit(toWorld(x, y), 0.03), 11, Math.min(1, Math.max(0, (x - L.sub[0]) / Math.max(1, L.sub[1] - L.sub[0]))));
  }
  // the accent (cat 10): a third of the particles on its edge, the rest inside
  const RD = PTS.accent, nr = RD.length / 2;
  for (let k = 0; k < nAcc; k++, i++) {
    const j = k % 3 === 0 ? Math.floor(R() * PTS.accentEdge) : Math.floor(R() * nr);
    const x = RD[j * 2] + (R() - 0.5) * 1.6, y = RD[j * 2 + 1] + (R() - 0.5) * 1.6;
    put(o, i, jit(toWorld(x, y), 0.03), 10, R());
  }
  haze(o, i, N, 40, 120, 0.5);
  return o;
}

/** the shape list of the engine (order = shape index); cloud, seed, galaxy, embers, vortex come from light-swarm */
export const LIGHT_SHAPES = ["cloud", "seed", "galaxy", "network", "brain", "embers", "core", "chip", "aperture", "play", "sparkle", "vortex", "logo"] as const;
export const LIGHT_EXTRA = { network, brain, core, chip, aperture, play, sparkle, logo };
