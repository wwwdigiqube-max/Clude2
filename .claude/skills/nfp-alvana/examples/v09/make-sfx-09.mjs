// Extra textures for Story Montage: chalk writing, pen scribble, spotlight clunk, neon buzz → public/v09/*.wav
import { buf, dec, env, highpass, lowpass, mix, norm, nz, osc, rnd, writeWav } from "./lib/dsp.mjs";
const OUT = (n) => new URL(`../public/v09/${n}.wav`, import.meta.url);
// chalk: dense scratchy bursts, band 1.5–6k
const chalk = (s) => { const b = buf(s); let t = 0; while (t < s - 0.05) { const l = 0.03 + rnd() * 0.09; const g = nz(l); env(g, (k) => Math.sin(Math.PI * k) * (0.5 + rnd() * 0.5)); mix(b, lowpass(highpass(g, 1200), 4200), t, 0.6 + rnd() * 0.4); t += l * (0.6 + rnd() * 0.5); } return norm(b, 0.35); };
writeWav(OUT("chalk"), chalk(1.1));
writeWav(OUT("chalk-short"), chalk(0.45));
// pen scribble: softer, lower
const scr = buf(0.5); for (let k = 0; k < 7; k++) { const g = nz(0.06); env(g, (q) => Math.sin(Math.PI * q)); mix(scr, lowpass(highpass(g, 900), 3500), k * 0.065, 0.7); } writeWav(OUT("scribble"), norm(scr, 0.4));
// spotlight clunk: low thump + metallic tick + hum tail
const cl = dec(osc(0.5, (s) => 70 + 40 * Math.exp(-s * 30)), 0.12); mix(cl, dec(highpass(nz(0.04), 3000), 0.01), 0, 0.5); mix(cl, env(osc(0.5, 120), (k) => 0.08 * (1 - k)), 0.05, 1); writeWav(OUT("clunk"), norm(cl, 0.8));
// neon buzz
const nb = osc(0.7, 120, "saw"); env(nb, (k, s) => (0.4 + 0.6 * (Math.floor(s * 30) % 3 ? 1 : 0.2)) * (1 - k) * Math.min(1, s * 20)); writeWav(OUT("buzz"), norm(lowpass(nb, 1800), 0.35));
console.log("sfx-09 done");
