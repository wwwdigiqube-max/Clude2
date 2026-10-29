// v14 El Niño: cinematic score + SFX, timed to src/v14/vo.json word cues.
// Writes public/v14/music.wav and public/v14/sfx.wav (44.1k mono). Mixed with vo.wav by ffmpeg afterwards.
import fs from "node:fs";
import { SR, TAU, buf, dec, env, highpass, hz, lowpass, mix, norm, nz, osc, rnd, reseed, bell, writeWav } from "./lib/dsp.mjs";

// kit: the satellite-explainer style folders; original project: video 14
const KIT = !fs.existsSync(new URL("../src/v14", import.meta.url));
const SRC_DIR = KIT ? "../src/styles/satellite-explainer/demo/" : "../src/v14/";
const vo = JSON.parse(fs.readFileSync(new URL(SRC_DIR + "vo.json", import.meta.url)));
const DUR = vo.total + 0.4;
const TM = JSON.parse(fs.readFileSync(new URL(SRC_DIR + "timemap.json", import.meta.url)));
const HOOK = TM[0][0];
// hook cues from the narration words (see src/v14/Hook.tsx)
const HWd = vo.words.filter((w) => w.line === 0);
const HC = { big: HWd[0].s, dar: HWd[3].s, explain: HWd[6].s };
const HRW0 = HC.explain - 0.02, HRW1 = HRW0 + 0.8;
const HBEATS = [HC.dar + 0.02, HC.dar + 0.72, HC.dar + 1.42];
const N = (x) => { if (x <= TM[0][1]) return TM[0][0] + (x - TM[0][1]); for (let i = 1; i < TM.length; i++) if (x <= TM[i][1]) { const [a0, b0] = TM[i - 1], [a1, b1] = TM[i]; return a0 + ((x - b0) * (a1 - a0)) / (b1 - b0); } return TM.at(-1)[0] + (x - TM.at(-1)[1]); };
const OUT = new URL(KIT ? "../public/styles/satellite-explainer/" : "../public/v14/", import.meta.url);
reseed(1414);

/* ---------- helpers ---------- */
const reverb = (x, wet = 0.25, size = 1) => {
  const combs = [1557, 1617, 1491, 1422, 1277, 1356].map((n) => Math.round(n * size));
  const out = new Float32Array(x.length);
  for (const n of combs) {
    const d = new Float32Array(n); let i = 0, lp = 0;
    for (let k = 0; k < x.length; k++) { const y = d[i]; lp = y * 0.7 + lp * 0.3; d[i] = x[k] + lp * 0.84; i = (i + 1) % n; out[k] += y / combs.length; }
  }
  for (const n of [556, 441]) { const d = new Float32Array(n); let i = 0; for (let k = 0; k < out.length; k++) { const b = d[i]; const y = -out[k] + b; d[i] = out[k] + b * 0.5; out[k] = y; i = (i + 1) % n; } }
  return x.map((v, k) => v * (1 - wet) + out[k] * wet * 3);
};
const bandSweep = (s, f0, f1, q = 0.35) => { const n = nz(s); const lp = lowpass(n, (i) => f0 + (f1 - f0) * (i / n.length)); return highpass(lp, (i) => (f0 + (f1 - f0) * (i / n.length)) * q); };
const whoosh = (s = 0.8, f0 = 300, f1 = 3000, pk = 0.5) => norm(env(bandSweep(s, f0, f1), (k) => Math.sin(Math.PI * k) ** 2), pk);
const riser = (s, pk = 0.45) => { const b = env(bandSweep(s, 200, 7000, 0.5), (k) => k ** 2.2); mix(b, env(osc(s, (t) => 110 * 2 ** (t / s * 2)), (k) => k ** 2 * 0.3), 0); return norm(b, pk); };
const impact = (pk = 0.9) => { const b = dec(osc(3, (s) => 32 + 70 * Math.exp(-s * 7)), 1.1, 0.004); mix(b, dec(lowpass(nz(0.8), 400), 0.2), 0, 0.5); mix(b, dec(highpass(nz(0.15), 2000), 0.04), 0, 0.25); return norm(b.map((v) => Math.tanh(v * 1.6)), pk); };
const swell = (s, pk = 0.4) => norm(env(lowpass(nz(s), (i) => 300 + 5000 * (i / (s * SR)) ** 2), (k) => k ** 3), pk);
const thunder = (pk = 0.6) => { const b = buf(2.6); mix(b, dec(highpass(nz(0.2), 900), 0.05), 0, 0.7); mix(b, env(lowpass(nz(2.5), 180), (k, s) => Math.min(1, s / 0.05) * Math.exp(-s / 0.9) * (0.7 + 0.3 * Math.sin(s * 23))), 0.05, 1); return norm(b, pk); };
const rain = (s, pk = 0.22) => { const b = env(highpass(lowpass(nz(s), 6000), 900), (k) => Math.min(1, k * 8) * Math.min(1, (1 - k) * 6)); for (let t = 0; t < s; t += 0.02 + rnd() * 0.05) mix(b, dec(osc(0.03, 1800 + rnd() * 2500), 0.006), t, 0.25 * rnd()); return norm(b, pk); };
const wind = (s, pk = 0.25, gust = 0.35) => { const b = lowpass(highpass(nz(s), 250), (i) => 700 + 500 * Math.sin((i / SR) * 0.9) + 300 * Math.sin((i / SR) * 2.3)); return norm(env(b, (k, t) => Math.min(1, k * 5) * Math.min(1, (1 - k) * 5) * (1 - gust + gust * (0.5 + 0.5 * Math.sin(t * 1.3 + Math.sin(t * 0.7) * 2)))), pk); };
const pop = (f = 420, pk = 0.4) => norm(dec(osc(0.2, (s) => f + 700 * Math.min(1, s / 0.045)), 0.05), pk);
const ping = (f = 1320, pk = 0.28) => norm(bell(f, 0.9, 0.25), pk);
const shimmer = (pk = 0.25) => { const b = buf(1.6); [2093, 2637, 3136, 3951].forEach((f, i) => mix(b, dec(osc(1.4, f), 0.5), i * 0.06, 0.4)); return norm(b, pk); };
const blip = (f = 1600, pk = 0.2) => norm(dec(osc(0.07, f), 0.018), pk);
const thud = (pk = 0.5) => { const b = dec(osc(0.5, (s) => 50 + 70 * Math.exp(-s * 25)), 0.12); mix(b, dec(lowpass(nz(0.05), 800), 0.01), 0, 0.3); return norm(b, pk); };

/* ---------- MUSIC ---------- */
const BPM = 90, BEAT = 60 / BPM, BAR = BEAT * 4;
const music = buf(DUR);
const saw = (s, f, det = 0.004) => { const b = buf(s); for (const d of [-det, 0, det]) mix(b, osc(s, f * (1 + d), "saw"), 0, 0.33); return b; };
const padAt = (t0, s, notes, g, cut = 1100) => {
  const p = buf(s + 1.5);
  for (const n of notes) mix(p, lowpass(saw(s + 1.5, hz(n)), cut), 0, 0.1);
  env(p, (k, t) => Math.min(1, t / 1.2) * Math.min(1, (s + 1.5 - t) / 1.4));
  mix(music, p, t0, g);
};
const pluck = (t0, n, g, tau = 0.35) => { const b = dec(osc(1.2, hz(n), "tri"), tau); mix(b, dec(osc(1.2, hz(n) * 2), tau * 0.5), 0, 0.25); mix(music, b, t0, g); };
const kick = (t0, g) => mix(music, dec(osc(0.45, (s) => 44 + 90 * Math.exp(-s * 28)), 0.16), t0, g);
const hat = (t0, g) => mix(music, dec(highpass(nz(0.04), 7000), 0.012), t0, g);
const bass = (t0, n, s, g) => mix(music, env(lowpass(osc(s, hz(n), "saw"), 260), (k, t) => Math.min(1, t / 0.01) * Math.exp(-t / (s * 0.8))), t0, g);

const CH = { Dm: [50, 57, 62, 65], Bb: [46, 53, 58, 62], F: [53, 57, 60, 65], C: [48, 55, 60, 64], Gm: [43, 50, 55, 58], A: [45, 52, 57, 61], Am: [45, 52, 57, 60] };
const prog = ["Dm", "Bb", "F", "C"];
const dark = ["Dm", "Gm", "Bb", "A"];
const SECTIONS = [
  // [from, to, intensity 0..3, progression]
  [0, 11.5, 0, prog], [11.5, 17.2, 1, prog], [17.2, 46.3, 2, prog], [46.3, 58.85, 3, dark],
  [58.85, 61.9, 3, ["Dm"]], [61.9, 74.55, 2, dark], [84.0, 95.1, 3, dark], [95.1, 100.7, 3, ["Bb", "C"]], [100.7, DUR, 0, ["Dm"]],
];
for (const [a0, b0, lvl, p] of SECTIONS) {
  const a = N(a0), b = Math.min(DUR, N(b0));
  const len = b - a;
  for (let t = a, c = 0; t < b - 0.2; t += BAR * 2, c++) {
    const ch = CH[p[c % p.length]], s = Math.min(BAR * 2, b - t);
    padAt(t, s, ch, lvl === 0 ? 0.55 : 0.75, 700 + 350 * lvl);
    if (lvl >= 1) bass(t, ch[0] - 12, s, 0.5);
  }
  if (lvl >= 1) for (let t = a; t < b - 0.05; t += BEAT / 2) {
    const k = Math.round((t - a) / (BEAT / 2));
    const ch = CH[p[Math.floor((t - a) / (BAR * 2)) % p.length]];
    pluck(t, ch[[0, 2, 1, 3, 2, 1, 3, 2][k % 8]] + 12, lvl >= 3 ? 0.16 : 0.12, lvl >= 3 ? 0.2 : 0.3);
    if (lvl >= 3) pluck(t + BEAT / 4, ch[[3, 1, 2, 0][k % 4]] + 24, 0.06, 0.12);
    if (lvl >= 2 && k % 2 === 0) kick(t, k % 4 === 0 ? 0.55 : 0.35);
    if (lvl >= 2) hat(t + BEAT / 4, 0.05);
  }
  if (lvl === 0 && a === 0) for (let t = 0.6; t < b; t += BEAT) pluck(t, CH.Dm[(Math.round(t / BEAT)) % 4] + 12, 0.07, 0.5);
  void len;
}
// hook: dark drone, heartbeat, riser into the dive
{
  padAt(0, HOOK, [38, 45, 50, 53], 0.7, 500);
  mix(music, env(osc(HOOK + 0.5, 36.7), (k, t) => Math.min(1, t / 0.6) * Math.min(1, (HOOK + 0.5 - t) / 0.4)), 0, 0.35);
  HBEATS.forEach((t0) => { kick(t0, 0.7); kick(t0 + 0.22, 0.45); });
  // music cuts at the rewind (4.6): the dive rides a riser instead
  env(music, (_, t) => (t > HRW0 - 0.03 && t < HOOK ? Math.max(0.15, 1 - (t - HRW0 + 0.03) / 0.12) : 1));
  mix(music, riser(HOOK - HRW1, 0.4), HRW1, 1);
}
// 1876–1878: sparse music-box on an old record
{
  const a = N(74.55), b = N(84.0), box = buf(b - a + 2);
  const mel = [69, 65, 64, 62, 65, 64, 62, 57, 62, 60, 57, 55, 57];
  mel.forEach((n, i) => { const bb = dec(osc(1.5, hz(n + 12)), 0.5); mix(bb, dec(osc(1.5, hz(n + 24)), 0.2), 0, 0.3); mix(box, bb, 0.3 + i * 0.68, 0.18); });
  [[50, 57, 62], [45, 52, 57], [46, 53, 58], [45, 52, 61]].forEach((c, i) => { const p = buf(2.6); c.forEach((n) => mix(p, lowpass(osc(2.6, hz(n), "tri"), 700), 0, 0.12)); env(p, (k) => Math.sin(Math.PI * k)); mix(box, p, i * 2.3, 0.6); });
  const old = highpass(lowpass(box, 3200), 300);
  for (let t = 0; t < b - a; t += 0.02 + rnd() * 0.15) mix(old, dec(highpass(nz(0.004), 3000), 0.001), t, 0.15 * rnd());
  env(old, (k, t) => Math.min(1, t / 0.3) * Math.min(1, (b - a + 2 - t) / 1.5));
  mix(music, old, a, 1);
}
// transitions inside the score
mix(music, swell(1.0, 0.35), N(14.62) - 1.0, 1);
mix(music, riser(3.2, 0.3), N(58.85) - 3.2, 1);
mix(music, riser(4.2, 0.35), N(100.68) - 4.2, 1);
mix(music, riser(2.6, 0.25), N(94.4) - 2.6, 1);
// fade tail
env(music, (_, s) => Math.min(1, s / 0.8) * (s > DUR - 3 ? Math.max(0, (DUR - s) / 3) : 1));
const musicOut = reverb(music, 0.22, 1.1);
writeWav(new URL("music.wav", OUT), norm(musicOut, 0.8));

/* ---------- SFX ---------- */
const fx = buf(DUR);
const at = (t, b, g = 1) => mix(fx, b, N(t), g);
// fan: pop in, motor hum, spin-down, sputter, puff
{
  const s = 7.5 - 1.4, hum = buf(s);
  mix(hum, osc(s, (t) => (t < 5.05 ? 118 : 118 * Math.max(0.15, 1 - (t - 5.05) / 1.0))), 0, 0.25);
  mix(hum, lowpass(highpass(nz(s), 300), 900), 0, 0.2);
  env(hum, (k, t) => Math.min(1, t / 0.3) * (t < 5.05 ? 1 : Math.max(0, 1 - (t - 5.05) / 1.05)));
  at(1.4, norm(hum, 0.06));
  at(7.28, norm(env(lowpass(nz(1.2), 900), (k) => Math.min(1, k * 20) * (1 - k)), 0.25));
}
// only the essential events (user: too many effects)
// hook sound design
{
  // sunrise: airy shimmer swelling into the impact
  const sh = buf(1.0); [1047, 1319, 1568, 2093].forEach((f, i) => mix(sh, env(osc(1.0, f * (1 + 0.003 * i)), (k) => k * k), 0, 0.25));
  mix(fx, norm(lowpass(sh, 5000), 0.12), 0, 1);
  mix(fx, swell(Math.max(0.2, HC.big - 0.02), 0.25), 0.0, 1);
  // the impact: sub boom + detuned brass 'braam'
  mix(fx, impact(0.85), HC.big, 1);
  const br = buf(2.6); [38, 45, 50].forEach((n) => mix(br, lowpass(saw(2.6, hz(n)), 520), 0, 0.33));
  env(br, (k, t) => Math.min(1, t / 0.04) * Math.exp(-t / 1.1));
  mix(fx, norm(br.map((v) => Math.tanh(v * 2.2)), 0.55), HC.big, 1);
  // heat: rising roar with crackle while the front wraps the planet
  const roarS = HRW0 - HC.big - 0.15, roar = lowpass(nz(roarS), (i) => 300 + 1500 * (i / (roarS * SR)));
  env(roar, (k) => Math.min(1, k * 4) * (0.35 + 0.65 * k) * Math.min(1, (1 - k) * 25));
  for (let t = 0; t < roarS; t += 0.03 + rnd() * 0.08) mix(roar, dec(highpass(nz(0.02), 2500), 0.004), t, (0.3 + 0.7 * (t / roarS)) * rnd());
  mix(fx, norm(roar, 0.2), HC.big + 0.1, 1);
  // tape stop + rewind warble (4.6–5.45)
  mix(fx, norm(dec(highpass(nz(0.05), 1200), 0.01), 0.35), HRW0, 1);
  const rw = buf(0.9), rn = nz(0.9);
  for (let i = 0; i < rw.length; i++) { const t = i / SR; rw[i] = rn[i] * (0.5 + 0.5 * Math.sin(TAU * (7 + 22 * t) * t)); }
  const rwb = highpass(lowpass(rw, (i) => 1500 + 4500 * (i / rw.length)), 600);
  env(rwb, (k) => Math.min(1, k * 12) * Math.min(1, (1 - k) * 10));
  mix(fx, norm(rwb, 0.3), HRW0 + 0.02, 1);
  for (let t = HRW0 + 0.05; t < HRW1 - 0.05; t += 1 / 12) mix(fx, norm(dec(osc(0.05, (x) => 1800 + 2600 * x * 20), 0.012), 0.07), t, 1);
  // dive: wind rush through the clouds, then the white-out hit
  const dv = HOOK - HRW1, wind2 = lowpass(highpass(nz(dv + 0.2), 200), (i) => 400 + 5000 * (i / ((dv + 0.2) * SR)) ** 2);
  env(wind2, (k) => k ** 1.6);
  mix(fx, norm(wind2, 0.4), HRW1, 1);
  mix(fx, whoosh(0.7, 400, 6000, 0.35), HOOK - 0.35, 1);
  mix(fx, norm(dec(lowpass(nz(0.6), 900), 0.2), 0.3), HOOK, 1);
}
at(8.3, whoosh(1.2, 400, 5000, 0.22));      // heat-map wipe
at(11.62, shimmer(0.16));
at(14.6, impact(0.9));
at(19.2, wind(11.2, 0.14, 0.45));
at(36.4, rain(2.6, 0.14)); at(36.7, thunder(0.3));
at(38.95, whoosh(0.7, 300, 4500, 0.3));
at(49.4, norm(env(lowpass(nz(1.3), (i) => 1200 - 1000 * (i / (1.3 * SR))), (k) => 1 - k), 0.12));
at(58.85, whoosh(0.5, 500, 6000, 0.3));
at(59.6, thunder(0.32));
at(69.7, thunder(0.3));
at(71.7, whoosh(0.7, 300, 5000, 0.3));
{
  const a = N(74.55), b = N(84.0), pr = buf(b - a);
  for (let t = 0; t < b - a; t += 1 / 24) mix(pr, dec(highpass(nz(0.01), 1500), 0.003), t, 0.5 + 0.2 * rnd());
  mix(pr, lowpass(osc(b - a, 48), 200), 0, 0.15);
  env(pr, (k) => Math.min(1, k * 20) * Math.min(1, (1 - k) * 20));
  mix(fx, norm(pr, 0.1), a, 1);
}
at(84.0, whoosh(0.8, 400, 6000, 0.25));
at(98.2, norm(env(lowpass(nz(3), 500), (k) => k ** 1.5 * (1 - k * 0.2)), 0.2));
at(100.68, impact(0.95));
writeWav(new URL("sfx.wav", OUT), norm(reverb(fx, 0.12, 0.8), 0.9));
console.log("music.wav + sfx.wav", DUR.toFixed(1), "s");
