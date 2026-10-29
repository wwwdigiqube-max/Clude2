// Choose and level sound-effect takes (ElevenLabs sound generation gives 2+ takes per effect; some come back
// almost silent — always measure before using one).
//   node tools/sfx-takes.mjs stats <takesDir>
//       per take: duration, onset (first sample above 10 % of the peak), peak time, RMS dBFS, crest, tail, peak dBFS.
//       ⚠ marks near-silent takes. Prefer a take whose onset is ~0 and whose peak sits where the hit should land.
//   node tools/sfx-takes.mjs level <takesDir> <outDir> <pick.json>
//       pick.json { "whoosh": "whoosh-1", "impact": "impact-2" } → <outDir>/<name>.wav, levelled on the RMS of
//       the active part (−20 dBFS, peak ≤ −1 dBFS), and prints { name: peakOffsetSeconds } for the mix plan
//       (the mixer lands each effect's PEAK on its cue — tools/doc-mix.mjs, 4th column of "sfx").
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const [mode, dir, outDir, pickPath] = process.argv.slice(2);
const SR = 48000;
const read = (f) => {
  const raw = execFileSync("ffmpeg", ["-v", "error", "-i", f, "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 28 });
  return new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
};
const audio = (d) => fs.readdirSync(d).filter((f) => /\.(mp3|wav|ogg|flac|m4a)$/i.test(f)).sort();

if (mode === "stats") {
  console.log("take".padEnd(18) + "dur   onset  peak   rmsdB crest  tail  pkdB");
  for (const f of audio(dir)) {
    const x = read(path.join(dir, f));
    let pk = 0, pi = 0, ss = 0;
    for (let i = 0; i < x.length; i++) {
      const a = Math.abs(x[i]);
      ss += x[i] * x[i];
      if (a > pk) [pk, pi] = [a, i];
    }
    let on = 0;
    while (on < x.length && Math.abs(x[on]) < 0.1 * pk) on++;
    let tail = x.length - 1;
    while (tail > 0 && Math.abs(x[tail]) < 0.05 * pk) tail--;
    const rms = 20 * Math.log10(Math.sqrt(ss / x.length) + 1e-12);
    const row = [(x.length / SR).toFixed(2), (on / SR).toFixed(3), (pi / SR).toFixed(3), rms.toFixed(1), (20 * Math.log10(pk) - rms).toFixed(1), (tail / SR).toFixed(2), (20 * Math.log10(pk + 1e-12)).toFixed(1)];
    console.log(f.replace(/\.\w+$/, "").padEnd(16), row.map((v) => String(v).padStart(6)).join(""), rms < -35 ? "  ⚠ almost silent" : "");
  }
} else if (mode === "level") {
  if (!pickPath) throw new Error("usage: node tools/sfx-takes.mjs level <takesDir> <outDir> <pick.json>");
  const pick = JSON.parse(fs.readFileSync(pickPath, "utf8"));
  fs.mkdirSync(outDir, { recursive: true });
  const offsets = {};
  for (const [name, take] of Object.entries(pick)) {
    const f = audio(dir).find((a) => a.replace(/\.\w+$/, "") === take);
    if (!f) throw new Error(`no take ${take} in ${dir}`);
    const x = read(path.join(dir, f));
    let pk = 0, pi = 0;
    for (let i = 0; i < x.length; i++) if (Math.abs(x[i]) > pk) [pk, pi] = [Math.abs(x[i]), i];
    // active RMS: 10 ms windows within 30 dB of the loudest window
    const N = 480, win = [];
    for (let i = 0; i + N <= x.length; i += N) {
      let s = 0;
      for (let j = i; j < i + N; j++) s += x[j] * x[j];
      win.push(Math.sqrt(s / N));
    }
    const top = Math.max(...win), act = win.filter((r) => r > top * 0.0316);
    const arms = Math.sqrt(act.reduce((a, r) => a + r * r, 0) / act.length);
    const g = Math.min(0.1 / arms, 0.89 / pk);
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", path.join(dir, f), "-af", `aformat=sample_rates=${SR}:channel_layouts=stereo,volume=${g.toFixed(4)}`, "-c:a", "pcm_s16le", path.join(outDir, `${name}.wav`)]);
    offsets[name] = +(pi / SR).toFixed(3);
  }
  console.log(JSON.stringify(offsets));
} else {
  console.log("usage:\n  node tools/sfx-takes.mjs stats <takesDir>\n  node tools/sfx-takes.mjs level <takesDir> <outDir> <pick.json>");
  process.exit(1);
}
