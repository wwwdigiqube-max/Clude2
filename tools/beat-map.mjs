// Beat map for music videos: tempo, beats, bar downbeats, kick and snare hits.
// Analyses the whole song (stable tempo/phase), writes times relative to the window start.
// Usage: node tools/beat-map.mjs <song.mp3|wav> <out.json> [--start 79] [--dur 31]
// Needs ffmpeg on PATH. Works on the full mix; kicks/snares are approximate (for exact hits,
// split stems first, e.g. with Demucs, and run this on the drums stem).
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const args = process.argv.slice(2);
const [song, out] = args;
if (!song || !out) {
  console.log("usage: node tools/beat-map.mjs <song> <out.json> [--start s] [--dur s]");
  process.exit(1);
}
const opt = (k, d) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? Number(args[i + 1]) : d;
};
const START = opt("start", 0);
const DUR = opt("dur", 0);
const SR = 22050, HOP = 220, NFFT = 2048;
const FPS = SR / HOP;

// ---- decode
const raw = execFileSync("ffmpeg", ["-v", "error", "-i", song, "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 30 });
const x = new Float32Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.length));

// ---- FFT (radix-2)
const rev = new Uint32Array(NFFT);
for (let i = 0, b = Math.log2(NFFT); i < NFFT; i++) {
  let r = 0;
  for (let k = 0; k < b; k++) r |= ((i >> k) & 1) << (b - 1 - k);
  rev[i] = r;
}
const cosT = new Float64Array(NFFT / 2), sinT = new Float64Array(NFFT / 2);
for (let i = 0; i < NFFT / 2; i++) {
  cosT[i] = Math.cos((2 * Math.PI * i) / NFFT);
  sinT[i] = -Math.sin((2 * Math.PI * i) / NFFT);
}
const win = new Float64Array(NFFT).map((_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / NFFT));
const re = new Float64Array(NFFT), im = new Float64Array(NFFT);
function mag(frame, out) {
  const off = frame * HOP - NFFT / 2;
  for (let i = 0; i < NFFT; i++) {
    const j = off + i;
    re[rev[i]] = (j >= 0 && j < x.length ? x[j] : 0) * win[i];
    im[rev[i]] = 0;
  }
  for (let size = 2; size <= NFFT; size <<= 1) {
    const half = size >> 1, step = NFFT / size;
    for (let i = 0; i < NFFT; i += size)
      for (let j = 0; j < half; j++) {
        const k = j * step;
        const tr = re[i + j + half] * cosT[k] - im[i + j + half] * sinT[k];
        const ti = re[i + j + half] * sinT[k] + im[i + j + half] * cosT[k];
        re[i + j + half] = re[i + j] - tr;
        im[i + j + half] = im[i + j] - ti;
        re[i + j] += tr;
        im[i + j] += ti;
      }
  }
  for (let i = 0; i <= NFFT / 2; i++) out[i] = Math.hypot(re[i], im[i]);
}

// ---- spectral flux in log bands
const nFrames = Math.floor(x.length / HOP);
const hzBin = SR / NFFT;
const NB = 32;
const edges = Array.from({ length: NB + 1 }, (_, i) => Math.round((30 * Math.pow(11000 / 30, i / NB)) / hzBin));
const band = (lo, hi) => [Math.round(lo / hzBin), Math.round(hi / hzBin)];
const KICK = band(35, 120), SN_LO = band(150, 320), SN_HI = band(1500, 5000);
const onset = new Float64Array(nFrames), kickE = new Float64Array(nFrames), snE = new Float64Array(nFrames), rms = new Float64Array(nFrames);
const m = new Float64Array(NFFT / 2 + 1);
let prevB = new Float64Array(NB), prevK = 0, prevS = 0;
const sum = (a, b) => {
  let s = 0;
  for (let i = a; i < b; i++) s += m[i];
  return s;
};
for (let f = 0; f < nFrames; f++) {
  mag(f, m);
  let fl = 0, e = 0;
  for (let b = 0; b < NB; b++) {
    const v = Math.log1p(100 * sum(edges[b], Math.max(edges[b + 1], edges[b] + 1)));
    fl += Math.max(0, v - prevB[b]);
    prevB[b] = v;
  }
  for (let i = 0; i < m.length; i++) e += m[i] * m[i];
  const k = Math.log1p(100 * sum(KICK[0], KICK[1]));
  const s = Math.log1p(100 * (sum(SN_LO[0], SN_LO[1]) + sum(SN_HI[0], SN_HI[1])));
  onset[f] = fl;
  kickE[f] = Math.max(0, k - prevK);
  snE[f] = Math.max(0, s - prevS);
  prevK = k;
  prevS = s;
  rms[f] = Math.sqrt(e);
}
const pct = (a, p) => {
  const s = Float64Array.from(a).sort();
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
};
const normalize = (a) => {
  const lo = pct(a, 5), hi = pct(a, 99.5) - lo || 1;
  return a.map((v) => Math.min(1.5, Math.max(0, (v - lo) / hi)));
};
const smooth3 = (a) => a.map((v, i) => 0.25 * (a[Math.max(0, i - 1)] ?? v) + 0.5 * v + 0.25 * (a[Math.min(a.length - 1, i + 1)] ?? v));
const on = normalize(smooth3(onset)), kk = normalize(smooth3(kickE)), ss = normalize(smooth3(snE));

// ---- tempo: autocorrelation with a soft prior around 100 bpm (picks the walking pulse, not double time)
const mean = on.reduce((a, b) => a + b, 0) / on.length;
const o = on.map((v) => v - mean);
const loLag = Math.floor((60 * FPS) / 200), hiLag = Math.ceil((60 * FPS) / 55);
let best = loLag, bestS = -Infinity;
const ac = new Float64Array(hiLag + 2);
for (let lag = loLag - 1; lag <= hiLag + 1; lag++) {
  let s = 0;
  for (let i = 0; i + lag < o.length; i++) s += o[i] * o[i + lag];
  ac[lag] = s;
}
for (let lag = loLag; lag <= hiLag; lag++) {
  const bpm = (60 * FPS) / lag;
  const prior = Math.exp(-0.5 * Math.pow(Math.log2(bpm / 100) / 0.8, 2));
  if (ac[lag] * prior > bestS) {
    bestS = ac[lag] * prior;
    best = lag;
  }
}
const a0 = ac[best - 1], b0 = ac[best], c0 = ac[best + 1];
const lag = best + (0.5 * (a0 - c0)) / (a0 - 2 * b0 + c0 || 1);
const bpm = (60 * FPS) / lag;

// ---- dynamic-programming beat tracker (Ellis 2007)
const period = lag, tight = 120;
const sc = Float64Array.from(on), back = new Int32Array(nFrames).fill(-1);
for (let t = 0; t < nFrames; t++) {
  const lo = Math.max(0, Math.floor(t - 2 * period)), hi = Math.floor(t - period / 2);
  if (hi <= 0) continue;
  let bv = -Infinity, bi = -1;
  for (let p = lo; p < hi; p++) {
    const v = sc[p] - tight * Math.pow(Math.log((t - p) / period), 2);
    if (v > bv) {
      bv = v;
      bi = p;
    }
  }
  sc[t] = on[t] + bv;
  back[t] = bi;
}
let last = nFrames - 1 - Math.floor(2 * period);
for (let t = last; t < nFrames; t++) if (sc[t] > sc[last]) last = t;
const beatsF = [last];
while (back[beatsF[beatsF.length - 1]] >= 0) beatsF.push(back[beatsF[beatsF.length - 1]]);
beatsF.reverse();

// ---- downbeats: the phase whose beats carry the most kick and the least snare
const near = (a, f) => Math.max(...Array.from({ length: 9 }, (_, d) => a[Math.min(a.length - 1, Math.max(0, f - 4 + d))]));
let phase = 0, phaseS = -Infinity;
for (let p = 0; p < 4; p++) {
  let s = 0, n = 0;
  for (let i = p; i < beatsF.length; i += 4) {
    s += near(kk, beatsF[i]) - 0.5 * near(ss, beatsF[i]);
    n++;
  }
  if (s / n > phaseS) {
    phaseS = s / n;
    phase = p;
  }
}

// ---- hits: local maxima above an adaptive threshold
function peaks(env, thr, gapS) {
  const gap = Math.round(gapS * FPS), outP = [];
  for (let i = 1; i < env.length - 1; i++) {
    if (env[i] < thr || env[i] < env[i - 1] || env[i] <= env[i + 1]) continue;
    let med = 0;
    for (let k = -15; k <= 15; k++) med += env[Math.min(env.length - 1, Math.max(0, i + k))];
    if (env[i] < (med / 31) * 1.3) continue;
    if (outP.length && i - outP[outP.length - 1] < gap) {
      if (env[i] > env[outP[outP.length - 1]]) outP[outP.length - 1] = i;
    } else outP.push(i);
  }
  return outP;
}
const kicks = peaks(kk, 0.3, 0.12), snares = peaks(ss, 0.35, 0.12);

// ---- write the window
const T0 = START, T1 = DUR > 0 ? START + DUR : x.length / SR;
const sec = (f) => f / FPS;
const inWin = (t, pre = 0) => t >= T0 - pre && t <= T1;
const rel = (t) => Math.round((t - T0) * 1000) / 1000;
const beatT = beatsF.map(sec);
const res = {
  song: song.split(/[\\/]/).pop(),
  start: T0,
  bpm: Math.round(bpm * 100) / 100,
  beats: beatT.filter((t) => inWin(t, 2.2)).map(rel),
  bars: beatT.filter((_, i) => (i - phase) % 4 === 0).filter((t) => inWin(t, 3)).map(rel),
  kicks: kicks.map(sec).filter((t) => inWin(t, 0.5)).map(rel),
  snares: snares.map(sec).filter((t) => inWin(t, 0.5)).map(rel),
  cues: {},
};
fs.writeFileSync(out, JSON.stringify(res));
console.log(`bpm ${res.bpm} · ${res.beats.length} beats · ${res.bars.length} bars (first ${res.bars.slice(0, 3).join(", ")}) · ${res.kicks.length} kicks · ${res.snares.length} snares → ${out}`);
console.log("add your own named moments to cues (e.g. { \"drop\": 28.84 }) and use them in the director.");
