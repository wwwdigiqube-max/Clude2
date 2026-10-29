// Quiet pad + pluck music bed timed to a video's cuts.
// Usage: node tools/music-bed.mjs <spec.json> <out.wav>
// spec: { "dur": 47, "bpm": 100, "arpFrom": 8.5, "busy": [23, 37], "stopAt": 41.5,
//         "chords": [[50,57,62,65],[46,53,58,62],[53,57,60,65],[48,55,60,64]] }   (MIDI; default Dm–Bb–F–C)
import fs from "node:fs";
import { buf, dec, env, hz, lowpass, mix, norm, osc, rnd, writeWav } from "./lib/dsp.mjs";

export const makeBed = ({ dur, bpm = 100, arpFrom = 0, busy = null, stopAt = dur, chords = [[50, 57, 62, 65], [46, 53, 58, 62], [53, 57, 60, 65], [48, 55, 60, 64]] }) => {
  const BEAT = 60 / bpm, bar = BEAT * 4, m = buf(dur);
  for (let t = 0, c = 0; t < stopAt + 2; t += bar * 2, c++) {
    const ch = chords[c % chords.length];
    const pad = buf(bar * 2 + 1);
    ch.forEach((n) => mix(pad, lowpass(osc(bar * 2 + 1, hz(n) * (1 + (rnd() - 0.5) * 0.004), "saw"), 900), 0, 0.12));
    env(pad, (k) => Math.min(1, k * 4) * Math.min(1, (1 - k) * 4));
    mix(m, pad, t, 1);
    mix(m, dec(osc(bar * 2, hz(ch[0] - 12)), 1.2, 0.05), t, 0.35);
  }
  for (let t = arpFrom, k = 0; t < stopAt; t += BEAT / 2, k++) {
    const ch = chords[Math.floor(t / (bar * 2)) % chords.length];
    const n = ch[[0, 2, 1, 3, 2, 1][k % 6] % ch.length] + 12;
    const hot = busy && t > busy[0] && t < busy[1];
    mix(m, dec(osc(0.5, hz(n), "tri"), 0.16), t, hot ? 0.2 : 0.13);
    if (hot && k % 2 === 0) mix(m, dec(osc(0.3, (s) => 60 + 40 * Math.exp(-s * 25)), 0.12), t, 0.3);
  }
  env(m, (_, s) => (s < 1 ? s : 1) * (s > stopAt + 1.6 ? Math.max(0, 1 - (s - stopAt - 1.6) / 0.6) : 1));
  return norm(lowpass(m, 5000), 0.5);
};

if (process.argv[2]) {
  const spec = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  writeWav(process.argv[3], makeBed(spec));
  console.log("bed →", process.argv[3]);
}
