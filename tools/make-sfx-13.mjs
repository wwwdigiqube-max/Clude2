// SFX for video 13 "Simp" → public/v13/sfx/*.wav  (run: node tools/make-sfx-13.mjs)
import fs from "node:fs";
import { buf, dec, env, highpass, lowpass, mix, norm, nz, osc, reseed, rnd, writeWav } from "./lib/dsp.mjs";

// kit: public/styles/stick-toon/sfx (the demo plays .mp3 — convert with ffmpeg, or change the extensions in demo/Video.tsx)
const OUT = new URL(fs.existsSync(new URL("../src/v13", import.meta.url)) ? "../public/v13/sfx/" : "../public/styles/stick-toon/sfx/", import.meta.url);
fs.mkdirSync(OUT, { recursive: true });
reseed(1313);
const band = (b, lo, hi) => lowpass(highpass(b, lo), hi);
const soft = (b, k = 1.4) => b.map((v) => Math.tanh(v * k));

const S = {
  // steady rain bed for the whole video: hiss + droplet ticks + soft low wash
  rain: () => {
    const len = 36;
    const b = band(nz(len), 380, 4200);
    norm(b, 0.2);
    mix(b, norm(band(nz(len), 90, 400), 0.06), 0);
    for (let k = 0; k < 2600; k++) mix(b, dec(band(nz(0.015), 1800, 7000), 0.003), rnd() * len, 0.06 + rnd() * 0.2);
    for (let k = 0; k < 140; k++) mix(b, dec(osc(0.03, 1300 + rnd() * 1700), 0.006), rnd() * len, 0.045);
    return norm(env(b, (k) => Math.min(1, k * 120, (1 - k) * 60)), 0.5);
  },
  squeak: () => norm(env(lowpass(osc(0.2, (s) => 520 + 1500 * (s / 0.2) ** 1.4, "tri"), 3000), (k) => Math.sin(Math.PI * k)), 0.25),
  whoosh: () => norm(env(lowpass(nz(0.36), (i) => 400 + 2600 * Math.sin((Math.PI * i) / (0.36 * 44100)) ** 2), (k) => Math.sin(Math.PI * k ** 0.7) ** 2), 0.5),
  land: () => {
    const b = dec(osc(0.35, (s) => 60 + 90 * Math.exp(-s * 35)), 0.08);
    mix(b, dec(band(nz(0.3), 700, 6000), 0.07, 0.002), 0.005, 0.7);
    for (let k = 0; k < 10; k++) mix(b, dec(osc(0.04, 900 + rnd() * 1500), 0.01), 0.02 + rnd() * 0.18, 0.12);
    return norm(b, 0.85);
  },
  // wet footstep: soft heel + little splash
  step: () => {
    const b = dec(osc(0.25, (s) => 90 + 60 * Math.exp(-s * 40)), 0.05);
    mix(b, dec(band(nz(0.2), 900, 5500), 0.045, 0.003), 0.01, 0.55);
    for (let k = 0; k < 5; k++) mix(b, dec(osc(0.03, 1100 + rnd() * 1400), 0.008), 0.02 + rnd() * 0.1, 0.1);
    return norm(b, 0.6);
  },
  hop: () => {
    const b = dec(band(nz(0.14), 1200, 6000), 0.03, 0.002);
    mix(b, dec(osc(0.1, 150), 0.025), 0, 0.5);
    return norm(b, 0.4);
  },
  // thunder: sharp crack, then a long rolling rumble
  thunder: () => {
    const len = 4.2;
    const b = buf(len);
    mix(b, soft(dec(band(nz(0.5), 1500, 9000), 0.09, 0.001), 2), 0, 0.9);
    mix(b, dec(band(nz(0.8), 300, 2500), 0.2, 0.004), 0.02, 0.8);
    const rum = lowpass(lowpass(nz(len), 180), 140);
    env(rum, (k, s) => Math.min(1, s / 0.12) * Math.exp(-s / 1.3) * (0.6 + 0.4 * Math.sin(s * 7 + Math.sin(s * 3) * 2)));
    mix(b, norm(rum, 1), 0.05, 1);
    return norm(soft(b, 1.2), 0.9);
  },
  // she grabs the umbrella handle
  grab: () => {
    const b = dec(highpass(nz(0.05), 2200), 0.006);
    mix(b, dec(osc(0.08, 240), 0.02), 0, 0.6);
    mix(b, env(band(nz(0.25), 600, 3000), (k) => Math.sin(Math.PI * k) * 0.5), 0.04, 0.35);
    return norm(b, 0.5);
  },
  turn: () => norm(env(band(nz(0.16), 900, 5000), (k) => Math.sin(Math.PI * k) ** 2), 0.3),
  // leg winding up: rubbery stretch rising
  windup: () => norm(env(lowpass(osc(0.36, (s) => 260 + 700 * (s / 0.36) ** 1.5 + 25 * Math.sin(s * 70), "tri"), 2500), (k) => Math.sin(Math.PI * k)), 0.3),
  // the kick: punchy low thump + slap
  thwack: () => {
    const b = soft(dec(osc(0.4, (s) => 70 + 140 * Math.exp(-s * 45)), 0.09), 2.2);
    mix(b, dec(band(nz(0.12), 1800, 8000), 0.018, 0.001), 0, 0.9);
    mix(b, dec(band(nz(0.2), 300, 1500), 0.04), 0.004, 0.5);
    return norm(b, 0.95);
  },
  // she flies off: falling cartoon whistle + wind
  fly: () => {
    const len = 1.1;
    const b = env(osc(len, (s) => 1900 - 1300 * (s / len) ** 0.8), (k) => Math.sin(Math.PI * Math.min(1, k * 1.3)) * (1 - k * 0.4));
    mix(b, norm(env(band(nz(len), 400, 2500), (k) => Math.sin(Math.PI * k) ** 2), 0.5), 0);
    return norm(b, 0.4);
  },
};

for (const [k, fn] of Object.entries(S)) writeWav(new URL(k + ".wav", OUT), fn());
console.log("v13 sfx:", Object.keys(S).join(", "));
