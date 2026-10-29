// Shared SFX library → public/sfx-lib/*.wav  (run: node tools/sfx-lib.mjs)
// Rule (lesson from video 03): short, tonal, clean; one sound per visible event; no long noise.
// Catalog with descriptions: styles/_sfx.md
import fs from "node:fs";
import { bell, buf, dec, env, highpass, lowpass, mix, norm, nz, osc, rnd, TAU, writeWav } from "./lib/dsp.mjs";

const OUT = new URL("../public/sfx-lib/", import.meta.url);
fs.mkdirSync(OUT, { recursive: true });

export const SFX = {
  // impacts / objects
  thud: () => { const b = dec(osc(0.4, (s) => 55 + 60 * Math.exp(-s * 30)), 0.09); mix(b, dec(lowpass(nz(0.03), 900), 0.008), 0, 0.3); return norm(b, 0.8); },
  pin: () => { const b = dec(osc(0.15, 430), 0.035); mix(b, dec(osc(0.1, 910), 0.018), 0, 0.5); mix(b, dec(lowpass(nz(0.02), 2500), 0.004), 0, 0.3); return norm(b, 0.55); },
  paper: () => { const b = buf(0.35); for (let k = 0; k < 9; k++) mix(b, dec(lowpass(highpass(nz(0.02), 1500), 5000), 0.006), k * 0.035 + rnd() * 0.01, 0.5 + rnd() * 0.5); return norm(b, 0.3); },
  steps: () => { const b = buf(1.8); for (let k = 0; k < 6; k++) mix(b, dec(osc(0.1, 140 - k * 3), 0.025), k * 0.3, 0.8); return norm(lowpass(b, 1200), 0.35); },
  boom: () => { const b = dec(osc(2.4, (s) => 34 + 30 * Math.exp(-s * 5)), 0.9, 0.01); mix(b, dec(lowpass(nz(0.4), 250), 0.12), 0, 0.35); return norm(b.map((v) => Math.tanh(v * 1.3)), 0.85); },
  // UI
  pop: () => norm(dec(osc(0.18, (s) => 320 + 900 * Math.min(1, s / 0.05)), 0.05), 0.55),
  blip: () => norm(dec(osc(0.06, 1560), 0.015), 0.25),
  click: () => { const b = dec(highpass(nz(0.03), 1800), 0.005); mix(b, dec(osc(0.06, 140), 0.018), 0, 0.8); return norm(b, 0.6); },
  type: () => { const b = buf(1.7); for (let k = 0; k < 13; k++) { const t = k * 0.078 + rnd() * 0.02; mix(b, dec(highpass(nz(0.012), 2600), 0.003), t, 0.45); mix(b, dec(osc(0.04, 190), 0.012), t, 0.3); } return norm(b, 0.35); },
  ticks: () => { const b = buf(1.9); let t = 0, k = 0; while (t < 1.85) { mix(b, dec(osc(0.03, 2100 + (k % 2) * 300), 0.008), t, 0.6); t += 0.03 + 0.1 * (t / 1.9) ** 1.5; k++; } return norm(b, 0.28); },
  strike: () => norm(dec(osc(0.12, (s) => 760 - 2600 * s), 0.04), 0.4),
  node1: () => norm(dec(osc(0.3, 660), 0.08), 0.35),
  node2: () => norm(dec(osc(0.3, 784), 0.08), 0.35),
  node3: () => norm(dec(osc(0.3, 988), 0.08), 0.35),
  hop: () => norm(dec(osc(0.14, (s) => 300 + 2500 * s), 0.05), 0.3),
  // success / states
  ping: () => norm(bell(1320, 0.9, 0.3), 0.4),
  match: () => { const b = buf(0.5); mix(b, dec(osc(0.2, 988), 0.06), 0); mix(b, dec(osc(0.35, 1318), 0.1), 0.07); return norm(b, 0.4); },
  lock: () => { const b = buf(0.7); mix(b, dec(osc(0.25, 660), 0.07), 0); mix(b, dec(osc(0.5, 990), 0.14), 0.09); return norm(b, 0.5); },
  stop: () => { const b = bell(880, 1.2, 0.35); mix(b, bell(1318, 1.2, 0.4), 0.09, 0.8); return norm(b, 0.45); },
  chime: () => { const b = buf(2.2); [1046.5, 1318.5, 1568, 2093].forEach((f, j) => mix(b, bell(f, 2.2, 0.6), j * 0.05, 1 - j * 0.18)); return norm(b, 0.5); },
  error: () => { const b = buf(0.5); mix(b, dec(osc(0.2, 330, "tri"), 0.08), 0); mix(b, dec(osc(0.3, 247, "tri"), 0.12), 0.1); return norm(lowpass(b, 2500), 0.45); },
  string: () => { const N = Math.round(44100 / 196), line = Float32Array.from({ length: N }, () => rnd() * 2 - 1); const b = buf(1.4); let p = 0;
    for (let i = 0; i < b.length; i++) { const n = (p + 1) % N; const v = 0.5 * (line[p] + line[n]) * 0.994; b[i] = line[p]; line[p] = v; p = n; } return norm(lowpass(b, 2400), 0.3); },
  // motion / tension
  sweep: () => norm(env(osc(0.45, (s) => 320 + 1200 * (s / 0.45) ** 1.6), (k) => Math.sin(Math.PI * k) ** 2), 0.18),
  whoosh: () => norm(env(lowpass(nz(0.6), (i) => 300 + 1600 * Math.sin((Math.PI * i) / (0.6 * 44100)) ** 2), (k) => Math.sin(Math.PI * k) ** 2), 0.35),
  scan: () => { const s = 3.7; const b = osc(s, (t) => 220 + 110 * (t / s)); mix(b, osc(s, (t) => 330 + 165 * (t / s)), 0, 0.5);
    return norm(env(b, (k, t) => Math.sin(Math.PI * k) ** 1.5 * (0.7 + 0.3 * Math.sin(t * TAU * 6))), 0.16); },
  servo: () => norm(env(lowpass(osc(0.55, (s) => 120 + 25 * Math.sin(s * 30), "saw"), 700), (k) => Math.sin(Math.PI * k)), 0.22),
  riser: () => { const s = 1.5; const b = osc(s, (t) => 200 + 500 * (t / s) ** 2, "tri"); return norm(env(lowpass(b, (i) => 500 + 2500 * (i / b.length)), (k) => k * k), 0.2); },
  notif: () => { const b = buf(0.9); mix(b, bell(1175, 0.9, 0.18), 0, 0.8); mix(b, bell(1568, 0.9, 0.25), 0.11, 1); return norm(b, 0.45); },
  print: () => { const b = buf(0.45); for (let k = 0; k < 16; k++) { mix(b, dec(osc(0.02, 1900 + (k % 3) * 180, "sq"), 0.006), k * 0.026, 0.5); mix(b, dec(osc(0.03, 95), 0.012), k * 0.026, 0.4); } return norm(lowpass(b, 4500), 0.35); },
  stamp: () => { const b = dec(osc(0.5, (s) => 70 + 90 * Math.exp(-s * 40)), 0.07); mix(b, dec(lowpass(nz(0.06), 1800), 0.015), 0, 0.5); mix(b, dec(osc(0.12, 340), 0.03), 0.004, 0.35); return norm(b, 0.8); },
  glitch: () => { const b = buf(0.4); for (let k = 0; k < 6; k++) { const len = 0.02 + rnd() * 0.04, f = 300 + rnd() * 2000; mix(b, osc(len, f, "sq"), k * 0.06, 0.5); } return norm(lowpass(b, 6000), 0.4); },
};

if (process.argv[1]?.endsWith("sfx-lib.mjs")) {
  for (const [k, fn] of Object.entries(SFX)) writeWav(new URL(k + ".wav", OUT), fn());
  console.log("sfx-lib:", Object.keys(SFX).length, "files");
}
