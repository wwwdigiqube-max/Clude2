// Cosmic Web (video 18): 2D Zeldovich approximation for "how the web grew" → zel.bin
// Particles start on a jittered grid q; position(D) = q + D·Ψ(q), with Ψ = −∇φ of a random potential.
// Ψ is scaled so that D = 1 is when the first caustics (walls / filaments) form across the field.
// Packed per particle: qx, qy, Ψx, Ψy, δ (initial density contrast, for the "tiny ripples" shot).
// Usage: node tools/v18-zel.mjs [grid=520] [out.bin]
import fs from "node:fs";
import path from "node:path";

const N = Number(process.argv[2] ?? 520);
const OUT = process.argv[3] ?? (fs.existsSync("src/v18") ? "public/v18/zel.bin" : "public/styles/cosmic-web/zel.bin");
const L = 100; // field size (arbitrary units)
let seed = 1986;
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
// random Fourier modes of the potential: P_φ(k) ∝ k^-n, cut at small scales
const M = 1400, modes = [];
for (let i = 0; i < M; i++) {
  const kk = (2 * Math.PI / L) * Math.exp(Math.log(4) + rnd() * Math.log(10)); // 4 .. 40 waves across (~10 cells in view)
  const a = rnd() * Math.PI * 2;
  const amp = Math.pow(kk, -1.4) * Math.exp(-Math.pow(kk / 1.6, 2)) * (0.5 + rnd());
  modes.push([kk * Math.cos(a), kk * Math.sin(a), amp, rnd() * Math.PI * 2]);
}
// φ = Σ A cos(k·q + p)  →  Ψ = −∇φ = Σ A k sin(k·q + p);  δ = −∇·Ψ = Σ A |k|² cos(k·q + p) (up to sign)
const field = (x, y) => {
  let px = 0, py = 0, d = 0, xx = 0, yy = 0, xy = 0;
  for (const [kx, ky, A, p] of modes) {
    const ph = kx * x + ky * y + p, s = Math.sin(ph), c = Math.cos(ph);
    px += A * kx * s; py += A * ky * s; d += A * (kx * kx + ky * ky) * c;
    xx += A * kx * kx * c; yy += A * ky * ky * c; xy += A * kx * ky * c; // ∂Ψ/∂q
  }
  return [px, py, d, xx, yy, xy];
};
const out = new Float32Array(N * N * 5);
const lam = [];
for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
  // fully random starts: any lattice (even jittered) turns into stripes once the field is stretched
  const x = (rnd() - 0.5) * L, y = (rnd() - 0.5) * L;
  const [px, py, d, xx, yy, xy] = field(x, y);
  const o = (j * N + i) * 5;
  out[o] = x; out[o + 1] = y; out[o + 2] = px; out[o + 3] = py; out[o + 4] = d;
  // largest eigenvalue of the deformation tensor (caustic when D·λ = 1)
  const tr = xx + yy, det = xx * yy - xy * xy;
  if ((j * N + i) % 7 === 0) lam.push(tr / 2 + Math.sqrt(Math.max(0, tr * tr / 4 - det)));
}
lam.sort((a, b) => a - b);
const s = lam[Math.floor(lam.length * 0.93)];
let dmax = 0;
for (let i = 0; i < N * N; i++) { out[i * 5 + 2] /= s; out[i * 5 + 3] /= s; dmax = Math.max(dmax, Math.abs(out[i * 5 + 4])); }
for (let i = 0; i < N * N; i++) out[i * 5 + 4] /= dmax;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, Buffer.from(out.buffer));
console.log(`zel ${N}x${N} = ${N * N} particles, scale ${s.toExponential(2)} → ${OUT} ${(out.byteLength / 1e6).toFixed(1)} MB`);
