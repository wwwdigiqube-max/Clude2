// Photocopy Story extras: tape rewind squeal, paper flutter → public/v10/*.wav
import { buf, dec, env, highpass, lowpass, mix, norm, nz, osc, rnd, writeWav } from "./lib/dsp.mjs";
const OUT = (n) => new URL(`../public/v10/${n}.wav`, import.meta.url);
// rewind: warbling high-pitched tape + hiss, rising
const rw = osc(1.8, (s) => 900 + s * 900 + Math.sin(s * 40) * 120 + Math.sin(s * 7) * 200, "saw");
env(rw, (k) => Math.min(1, k * 10) * (1 - Math.max(0, k - 0.85) / 0.15) * 0.35);
const hiss = lowpass(highpass(nz(1.8), 2500), 7000); env(hiss, (k) => 0.25 * Math.min(1, k * 8) * (1 - Math.max(0, k - 0.85) / 0.15));
mix(rw, hiss, 0, 1); writeWav(OUT("rewind"), norm(lowpass(rw, 5000), 0.5));
// paper flutter
const pf = buf(0.5); for (let k = 0; k < 6; k++) { const g = nz(0.05); env(g, (q) => Math.sin(Math.PI * q)); mix(pf, lowpass(highpass(g, 700), 3500), k * 0.06 + rnd() * 0.02, 0.8); } writeWav(OUT("flutter"), norm(pf, 0.45));
console.log("sfx-10 done");
