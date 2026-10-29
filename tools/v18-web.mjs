// Cosmic Web (video 18): builds a 3D cosmic web (units: million light-years, Mly) → web.bin + web-meta.json.
// Weighted Voronoi (power diagram): voids = cells, walls = faces, filaments = edges, clusters = vertices.
// Each candidate point is projected onto the face / edge / vertex of its own cell (no rejection sampling),
// then kept only if it still belongs to that feature. Deterministic (seeded).
// Usage: node tools/v18-web.mjs [count=3000000] [out.bin] [out-meta.json]
import fs from "node:fs";
import path from "node:path";

const COUNT = Number(process.argv[2] ?? 3000000); // the reference film uses 3,000,000
// outputs: the style folder in the kit, video 18 in the original project (or pass them)
const KIT = !fs.existsSync("src/v18");
const OUT_BIN = process.argv[3] ?? (KIT ? "public/styles/cosmic-web/web.bin" : "public/v18/web.bin");
const OUT_META = process.argv[4] ?? (KIT ? "src/styles/cosmic-web/demo/web-meta.json" : "src/v18/web-meta.json");
const H = 900; // half box size (Mly)
let seed = 18;
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const gauss = () => { let u = 0, v = 0; while (u === 0) u = rnd(); v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

// ── special voids
const SPECIAL = {
  local: { c: [0, 6, 106], r: 96 }, // the Local Void: we sit on its rim
  opposite: { c: [4, -8, -112], r: 100 }, // keeps the origin on a wall
  bootes: { c: [430, 150, -470], r: 165 }, // the Boötes supervoid (~330 Mly across, ~650 Mly away)
};
// ── seeds: jittered grid, varied void radii, specials carved in
const seeds = [];
const SP = 118;
for (let x = -H - SP; x <= H + SP; x += SP)
  for (let y = -H - SP; y <= H + SP; y += SP)
    for (let z = -H - SP; z <= H + SP; z += SP) {
      const c = [x + (rnd() - 0.5) * SP * 0.95, y + (rnd() - 0.5) * SP * 0.95, z + (rnd() - 0.5) * SP * 0.95];
      const near = Object.values(SPECIAL).some((s) => Math.hypot(c[0] - s.c[0], c[1] - s.c[1], c[2] - s.c[2]) < s.r + 70);
      if (near) continue;
      const r = 38 + 70 * Math.pow(rnd(), 1.6);
      seeds.push({ c, w: r * r, r });
    }
const specialIdx = {};
for (const [k, s] of Object.entries(SPECIAL)) { specialIdx[k] = seeds.length; seeds.push({ c: s.c, w: s.r * s.r, r: s.r, name: k }); }

// ── spatial grid over seeds
const CELL = 150, GN = Math.ceil((2 * H + 2 * SP) / CELL) + 2;
const gi = (v) => Math.max(0, Math.min(GN - 1, Math.floor((v + H + SP + CELL) / CELL)));
const grid = Array.from({ length: GN * GN * GN }, () => []);
seeds.forEach((s, i) => grid[gi(s.c[0]) + GN * (gi(s.c[1]) + GN * gi(s.c[2]))].push(i));
const pd = (x, s) => { const dx = x[0] - s.c[0], dy = x[1] - s.c[1], dz = x[2] - s.c[2]; return dx * dx + dy * dy + dz * dz - s.w; };
/** indices of the 4 seeds with lowest power distance to x */
function near4(x) {
  const best = [[1e18, -1], [1e18, -1], [1e18, -1], [1e18, -1]];
  const cx = gi(x[0]), cy = gi(x[1]), cz = gi(x[2]);
  for (let a = cx - 1; a <= cx + 1; a++) for (let b = cy - 1; b <= cy + 1; b++) for (let c = cz - 1; c <= cz + 1; c++) {
    if (a < 0 || b < 0 || c < 0 || a >= GN || b >= GN || c >= GN) continue;
    for (const i of grid[a + GN * (b + GN * c)]) {
      const d = pd(x, seeds[i]);
      if (d < best[3][0]) { best[3] = [d, i]; best.sort((p, q) => p[0] - q[0]); }
    }
  }
  return best.map((b) => b[1]);
}
// bisector plane between seeds i,j (power): n·x = k  with n = 2(cj - ci), k = |cj|²-|ci|² - (wj - wi)
const plane = (i, j) => {
  const a = seeds[i], b = seeds[j];
  const n = [2 * (b.c[0] - a.c[0]), 2 * (b.c[1] - a.c[1]), 2 * (b.c[2] - a.c[2])];
  const k = b.c[0] ** 2 + b.c[1] ** 2 + b.c[2] ** 2 - (a.c[0] ** 2 + a.c[1] ** 2 + a.c[2] ** 2) - (b.w - a.w);
  return [n, k];
};
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/** closest point to x satisfying the given planes (1-3 planes) — least-norm correction via normal equations */
function project(x, planes) {
  const m = planes.length;
  const A = planes.map((p) => p[0]);
  const r = planes.map((p) => p[1] - dot(p[0], x));
  const G = A.map((ai) => A.map((aj) => dot(ai, aj)));
  // solve G λ = r (m ≤ 3) by Gaussian elimination
  const M = G.map((row, i) => [...row, r[i]]);
  for (let i = 0; i < m; i++) {
    let p = i; for (let k = i + 1; k < m; k++) if (Math.abs(M[k][i]) > Math.abs(M[p][i])) p = k;
    [M[i], M[p]] = [M[p], M[i]];
    if (Math.abs(M[i][i]) < 1e-9) return null;
    for (let k = i + 1; k < m; k++) { const f = M[k][i] / M[i][i]; for (let j = i; j <= m; j++) M[k][j] -= f * M[i][j]; }
  }
  const lam = new Array(m).fill(0);
  for (let i = m - 1; i >= 0; i--) { let s = M[i][m]; for (let j = i + 1; j < m; j++) s -= M[i][j] * lam[j]; lam[i] = s / M[i][i]; }
  const y = [...x];
  for (let i = 0; i < m; i++) for (let d = 0; d < 3; d++) y[d] += lam[i] * A[i][d];
  return y;
}
const sameSet = (a, b) => a.every((v) => b.includes(v));

// ── smooth warp: bends the flat Voronoi faces into round, organic bubbles (zero at the origin so we stay on our wall)
const hash3 = (x, y, z) => { let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 2147483647); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 * 2 - 1; };
const sm = (t) => t * t * (3 - 2 * t);
function vnoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const fx = sm(x - xi), fy = sm(y - yi), fz = sm(z - zi);
  let v = 0;
  for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) for (let c = 0; c < 2; c++)
    v += hash3(xi + a, yi + b, zi + c) * (a ? fx : 1 - fx) * (b ? fy : 1 - fy) * (c ? fz : 1 - fz);
  return v;
}
const warpRaw = (p) => [0, 1, 2].map((k) => {
  const o = k * 17.3;
  return 26 * vnoise(p[0] / 210 + o, p[1] / 210 - o, p[2] / 210 + 2 * o) + 9 * vnoise(p[0] / 70 - o, p[1] / 70 + 3 * o, p[2] / 70 + o);
});
const W0 = warpRaw([0, 0, 0]);
const warp = (p) => { const w = warpRaw(p); const f = Math.exp(-(p[0] ** 2 + p[1] ** 2 + p[2] ** 2) / (150 * 150)); return [p[0] + w[0] - W0[0] * f, p[1] + w[1] - W0[1] * f, p[2] + w[2] - W0[2] * f]; };

// ── sample in three passes: whole box + dense detail around us and around Boötes (for close shots).
// Each point carries a light weight = reference density / local sample density, so light per volume stays uniform.
const PASSES = [
  { n: Math.round(COUNT * 0.42), c: [0, 0, 0], R: Infinity },
  { n: Math.round(COUNT * 0.38), c: [0, 0, 0], R: 330 },
  { n: Math.round(COUNT * 0.2), c: SPECIAL.bootes.c, R: 270 },
];
const vol = (p) => (p.R === Infinity ? (2 * H) ** 3 : (4 / 3) * Math.PI * p.R ** 3);
const inP = (p, x) => p.R === Infinity || Math.hypot(x[0] - p.c[0], x[1] - p.c[1], x[2] - p.c[2]) < p.R;
const lightW = (x) => { const ref = PASSES[0].n / vol(PASSES[0]); let d = 0; for (const p of PASSES) if (inP(p, x)) d += p.n / vol(p); return ref / d; };
const cand = (p) => {
  if (p.R === Infinity) return [(rnd() * 2 - 1) * H, (rnd() * 2 - 1) * H, (rnd() * 2 - 1) * H];
  for (;;) { const x = [rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1]; if (x[0] ** 2 + x[1] ** 2 + x[2] ** 2 <= 1) return x.map((v, k) => p.c[k] + v * p.R); }
};

const out = new Float32Array(COUNT * 4);
let n = 0, tries = 0;
const stat = [0, 0, 0, 0];
const clusterB = new Map(); // vertex key → richness (bright central galaxies)
for (const P of PASSES) {
 const end = Math.min(COUNT, n + P.n);
 while (n < end && tries < COUNT * 8) {
  tries++;
  const x = cand(P);
  const nb = near4(x);
  if (nb.includes(-1)) continue;
  const u = rnd();
  const cls = u < 0.34 ? 0 : u < 0.76 ? 1 : u < 0.985 ? 2 : 3; // wall, filament, node, void field
  let y;
  if (cls === 3) {
    // rare void galaxies: deep inside a cell
    const s = seeds[nb[0]];
    const d = Math.sqrt(Math.max(0, pd(x, s) + s.w));
    if (d > s.r * 0.7 || rnd() > 0.25) continue;
    y = x;
  } else {
    const planes = [plane(nb[0], nb[1])];
    if (cls >= 1) planes.push(plane(nb[0], nb[2]));
    if (cls >= 2) planes.push(plane(nb[0], nb[3]));
    y = project(x, planes);
    if (!y) continue;
    if (Math.abs(y[0]) > H || Math.abs(y[1]) > H || Math.abs(y[2]) > H) continue;
    const nb2 = near4(y);
    if (!sameSet(nb.slice(0, cls + 2), nb2.slice(0, cls + 2))) continue;
    // thickness: walls thin, filaments thicker, clusters as fuzzy balls
    const sig = cls === 0 ? 2.2 : cls === 1 ? 3.6 : 3.2;
    y = [y[0] + gauss() * sig, y[1] + gauss() * sig, y[2] + gauss() * sig];
    if (cls === 2) { const key = nb.slice(0, 4).sort((a, b) => a - b).join(","); clusterB.set(key, (clusterB.get(key) ?? 0) + 1); }
  }
  const lw = lightW(y); // weight from the unwarped position (sampling regions are defined there)
  y = warp(y);
  if (Math.hypot(y[0], y[1], y[2]) < 7) continue; // the Local Group is drawn by its own layer
  // brightness: log-normal, clusters brighter; × light weight
  const b = Math.min(0.999, lw * Math.exp(gauss() * 0.75 - (cls === 2 ? 1.1 : cls === 1 ? 1.5 : 1.9)));
  out[n * 4] = y[0]; out[n * 4 + 1] = y[1]; out[n * 4 + 2] = y[2]; out[n * 4 + 3] = cls + Math.max(0.001, b);
  n++; stat[cls]++;
 }
}
fs.mkdirSync(path.dirname(OUT_BIN), { recursive: true });
fs.writeFileSync(OUT_BIN, Buffer.from(out.buffer, 0, n * 16));
const big = seeds.filter((s) => Math.abs(s.c[0]) < H && Math.abs(s.c[1]) < H && Math.abs(s.c[2]) < H).sort((a, b) => b.r - a.r).slice(0, 60).map((s) => ({ c: s.c.map((v) => +v.toFixed(1)), r: +s.r.toFixed(1), name: s.name }));
fs.writeFileSync(OUT_META, JSON.stringify({ H, count: n, special: SPECIAL, big }, null, 1));
console.log(`points ${n} (tries ${tries}) wall/fil/node/void ${stat.join("/")} seeds ${seeds.length} → ${OUT_BIN} ${(n * 16 / 1e6).toFixed(1)} MB`);
