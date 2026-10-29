// Light Logo · make a short song long enough for the logo hold WITHOUT cutting it: the song stays untouched and a lush
// reverb ring-out grows from its last bar (FFT convolution with a synthetic hall: decorrelated noise, RT60 ≈ 2.8 s,
// darker as it decays), fading out at the target length. Splicing bars of a song to lengthen it sounds unnatural —
// this doesn't.
// Usage: node src/styles/light-logo/pipeline/tail.cjs <song.wav|mp3> <out.wav> <length s> [wet-from s]
//   wet-from = where the reverb starts listening (default: 1.5 s before the song's end — the last bar / final hit)
const { execFileSync } = require("child_process");
const [song, outPath, lenArg, fromArg] = process.argv.slice(2);
if (!lenArg) {
  console.error("usage: node tail.cjs <song> <out.wav> <length s> [wet-from s]");
  process.exit(1);
}
const SR = 48000, LEN = Number(lenArg), OUT = Math.round(LEN * SR);
const dec = (args) => { const b = execFileSync("ffmpeg", ["-v", "error", ...args, "-f", "f32le", "-"], { maxBuffer: 1 << 30 }); return new Float32Array(b.buffer, b.byteOffset, b.length / 4); };
const X = dec(["-i", song, "-ac", "2", "-ar", String(SR)]);
const N = X.length / 2;
const FROM = fromArg ? Number(fromArg) : Math.max(0, N / SR - 1.5);
// impulse response: 4.6 s of decorrelated noise, exponential decay, low-passed harder as it decays
let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const IRN = Math.round(4.6 * SR), ir = [new Float32Array(IRN), new Float32Array(IRN)];
for (let c = 0; c < 2; c++) {
  let lp = 0;
  for (let i = 0; i < IRN; i++) {
    const t = i / SR;
    const a = Math.exp((-6.9 * t) / 4.4);
    const k = 0.25 + 0.6 * Math.exp(-t / 0.9);
    lp += k * (rnd() - lp);
    ir[c][i] = lp * a * (t < 0.02 ? t / 0.02 : 1);
  }
}
// wet source: the song from FROM on, fading in over 0.5 s so the dry song stays clean
const s0 = Math.round(FROM * SR), SN = N - s0;
const src = [new Float32Array(SN), new Float32Array(SN)];
for (let i = 0; i < SN; i++) {
  const g = Math.min(1, i / (0.5 * SR));
  src[0][i] = X[(s0 + i) * 2] * g;
  src[1][i] = X[(s0 + i) * 2 + 1] * g;
}
// FFT convolution (radix-2)
function fft(re, im, inv) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const a = ((inv ? 2 : -2) * Math.PI) / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k], ui = im[i + k];
        const vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ur + vr; im[i + k] = ui + vi; re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
  if (inv) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
}
let n = 1;
while (n < SN + IRN) n <<= 1;
const wet = [];
for (let c = 0; c < 2; c++) {
  const ar = new Float64Array(n), ai = new Float64Array(n), br = new Float64Array(n), bi = new Float64Array(n);
  ar.set(src[c]);
  br.set(ir[c]);
  fft(ar, ai, false);
  fft(br, bi, false);
  for (let i = 0; i < n; i++) { const r = ar[i] * br[i] - ai[i] * bi[i], im = ar[i] * bi[i] + ai[i] * br[i]; ar[i] = r; ai[i] = im; }
  fft(ar, ai, true);
  wet.push(ar);
}
// the wet's peak ~5 dB under the song's peak, faded out over the last 1.1 s
let pk = 0, wpk = 0;
for (let i = 0; i < X.length; i++) pk = Math.max(pk, Math.abs(X[i]));
for (let c = 0; c < 2; c++) for (let i = 0; i < n; i++) wpk = Math.max(wpk, Math.abs(wet[c][i]));
const wg = (pk * 0.55) / wpk;
const Y = new Float32Array(OUT * 2);
for (let i = 0; i < OUT; i++)
  for (let c = 0; c < 2; c++) {
    let v = i < N ? X[i * 2 + c] : 0;
    const j = i - s0;
    if (j >= 0 && j < n) {
      const t = i / SR;
      const fin = t > LEN - 1.1 ? Math.cos((((t - (LEN - 1.1)) / 1.1) * Math.PI) / 2) ** 2 : 1;
      v += wet[c][j] * wg * fin;
    }
    Y[i * 2 + c] = v;
  }
execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "f32le", "-ar", String(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_s24le", outPath], { input: Buffer.from(Y.buffer) });
console.log(`song ${(N / SR).toFixed(2)} s + ring-out from ${FROM.toFixed(2)} s → ${LEN} s · wet gain ${wg.toFixed(4)} → ${outPath}`);
