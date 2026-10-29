// Split-flap · the film's sound: the song + a click on EVERY flap landing (events from the same program the picture
// uses), a wave on the big board moves, a whoosh on the camera whips, clatter under the patterns, a clock tick on the
// last flip. The flap bus sits 10 dB under the song (the song leads), and the mix is normalised to -14 LUFS.
//
// 1) song:    node --env-file=.env tools/eleven-music-plan.mjs src/styles/split-flap/pipeline/music-plan.json out/song-1.mp3 1
//             make 3–4 takes (seeds 1..4). Keep the one with a hook AND a beat from the very first second. Never splice
//             takes together (cuts sound unnatural) — only trim the silence at the start.
// 2) effects: node --env-file=.env tools/eleven-sfx.mjs src/styles/split-flap/pipeline/sfx.json out/flap-sfx 3
// 3) events:  npx tsx src/styles/split-flap/pipeline/sfx-events.mts out/flap-events.json
// 4) mix:     node src/styles/split-flap/pipeline/build-audio.cjs out/song-1.mp3 0.44 out/flap-sfx out/flap-events.json public/v01/mix.wav
//             0.44 = the song time that plays at video t = 0, so the first kick lands on 0.10 (find it: tools/beat-map.mjs).
// Then render with the audio prop: --props='{"audio":"v01/mix.wav"}', or render silent and mux (never with -shortest).
const { execFileSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const [song, trimArg, sfxDir, eventsPath, outPath] = process.argv.slice(2);
if (!outPath) {
  console.error("usage: node build-audio.cjs <song.mp3> <trim s> <sfx dir> <events.json> <out.wav>");
  process.exit(1);
}
const TRIM = Number(trimArg);
// the demo's moments (demo/lib.ts): length, the drop, the final hit, the last flip — change with your program
const DUR = 16.5, DROP = 8.1, FINAL = 14.1, LAST_TICK = 15.95;
// which take of each effect (out/flap-sfx/<id>-<take>.mp3): listen and pick
const TAKES = { click: [1, 3], clatter: 2, wave: [2, 3], whoosh: 3, tick: 1 };

const SR = 48000, LEN = Math.round(DUR * SR);
const tmp = fs.mkdtempSync(path.join(require("os").tmpdir(), "flap-"));
const music = path.join(tmp, "music.wav");
execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", String(TRIM), "-t", String(DUR), "-i", song, "-af", `afade=t=out:st=${DUR - 0.6}:d=0.6`, "-ar", String(SR), "-ac", "2", "-c:a", "pcm_s24le", music]);
const dec = (f) => { const b = execFileSync("ffmpeg", ["-v", "error", "-i", f, "-ac", "2", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 30 }); return new Float32Array(b.buffer, b.byteOffset, b.length / 4); };
/** the attack: the first sample over 30 % of the peak (so the click, not its silence, lands on the event) */
const onsetOf = (x) => { let pk = 0; for (let i = 0; i < x.length; i++) pk = Math.max(pk, Math.abs(x[i])); for (let i = 0; i < x.length; i += 2) if (Math.max(Math.abs(x[i]), Math.abs(x[i + 1])) > 0.3 * pk) return i / 2 / SR; return 0; };
const S = {}, ONSET = {};
for (const [id, takes] of Object.entries(TAKES))
  for (const k of [].concat(takes)) {
    const f = path.join(sfxDir, `${id}-${k}.mp3`);
    if (!fs.existsSync(f)) { console.warn(`⚠ missing ${f} (skipped)`); continue; }
    S[`${id}-${k}`] = dec(f);
    ONSET[`${id}-${k}`] = onsetOf(S[`${id}-${k}`]);
  }
const pick = (id, i = 0) => { const t = [].concat(TAKES[id]); return `${id}-${t[i % t.length]}`; };
let seed = 11;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const out = new Float32Array(LEN * 2);
/** place sample `name` so its onset lands at t (s), gain g, playback rate r (pitch), pan −1..1 */
function place(name, t, g, r = 1, pan = 0) {
  const x = S[name];
  if (!x) return;
  const n = x.length / 2;
  const start = Math.round((t - ONSET[name] / r) * SR);
  const gl = g * Math.cos(((pan + 1) * Math.PI) / 4), gr = g * Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; ; i++) {
    const si = i * r, k = Math.floor(si);
    if (k + 1 >= n) break;
    const o = start + i;
    if (o < 0) continue;
    if (o >= LEN) break;
    const a = si - k;
    out[o * 2] += (x[k * 2] * (1 - a) + x[(k + 1) * 2] * a) * gl * Math.SQRT2;
    out[o * 2 + 1] += (x[k * 2 + 1] * (1 - a) + x[(k + 1) * 2 + 1] * a) * gr * Math.SQRT2;
  }
}
const ev = JSON.parse(fs.readFileSync(eventsPath, "utf8"));
for (const e of ev.filter((e) => e.kind !== "pixel")) {
  if (e.kind === "wide") place(pick("click"), e.t, 0.85, 0.72, 0); // the wide module: a deeper clack
  else {
    // in the ring-out the colon blinks stay soft; the last flip leans on the clock tick
    const soft = e.t > FINAL + 0.3 && e.t < LAST_TICK - 0.05 ? 0.32 : e.t >= LAST_TICK - 0.05 ? 0.55 : 1;
    place(pick("click", rnd() < 0.5 ? 0 : 1), e.t, (0.42 + 0.18 * rnd()) * soft, 0.94 + 0.12 * rnd(), Math.max(-0.6, Math.min(0.6, e.x / 7)));
  }
}
// thousands of pixel flaps: one click per 10 ms bin, louder (√n) where many land together, panned to where they are
const bins = new Map();
for (const e of ev.filter((e) => e.kind === "pixel")) {
  const b = Math.round(e.t * 100);
  const c = bins.get(b) ?? { n: 0, x: 0 };
  c.n++;
  c.x += e.x;
  bins.set(b, c);
}
for (const [b, c] of bins) place(pick("click", rnd() < 0.5 ? 0 : 1), b / 100, Math.min(0.5, 0.055 * Math.sqrt(c.n)), 0.86 + 0.28 * rnd(), Math.max(-0.7, Math.min(0.7, c.x / c.n / 14)));
place(pick("wave"), 0.12, 0.42); // the hook wave
place(pick("whoosh"), 0.2, 0.28); // the rush back
place(pick("wave", 1), DROP + 0.02, 0.45); // the drop
place(pick("whoosh"), DROP + 0.08, 0.3); // the whip
for (const [t, g] of [[10.1, 0.16], [10.6, 0.18], [11.1, 0.2], [11.6, 0.22]]) place(pick("clatter"), t, g); // the patterns
place(pick("wave"), FINAL, 0.42); // the final hit
place(pick("tick"), LAST_TICK, 0.9); // 24:00:00 → 23:59:59

const wav = (f, buf) => execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "f32le", "-ar", String(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_s24le", f], { input: Buffer.from(buf.buffer) });
const flaps = path.join(tmp, "flaps.wav"), raw = path.join(tmp, "raw.wav");
wav(flaps, out);
const lufs = (f) => { const m = spawnSync("ffmpeg", ["-nostdin", "-i", f, "-af", "ebur128", "-f", "null", "-"]).stderr.toString(); return +/I:\s+(-?[\d.]+) LUFS/.exec(m.slice(m.lastIndexOf("Summary")))[1]; };
const lm = lufs(music), ls = lufs(flaps);
const g = Math.pow(10, (lm - 10 - ls) / 20); // the flaps 10 dB under the song
console.log(`song ${lm} LUFS · flaps ${ls} LUFS → flap gain ${g.toFixed(3)}`);
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", music, "-i", flaps, "-filter_complex", `[1:a]volume=${g.toFixed(4)}[s];[0:a][s]amix=inputs=2:normalize=0:duration=first,atrim=0:${DUR},alimiter=limit=0.95[o]`, "-map", "[o]", "-c:a", "pcm_s24le", raw]);
// two-pass loudnorm to -14 LUFS (linear: the dynamics stay)
const m = spawnSync("ffmpeg", ["-nostdin", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"]).stderr.toString();
const j = JSON.parse(m.slice(m.lastIndexOf("{"), m.lastIndexOf("}") + 1));
fs.mkdirSync(path.dirname(outPath), { recursive: true });
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", raw, "-af", `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`, "-ar", "48000", "-c:a", "pcm_s24le", outPath]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`mix ${j.input_i} → -14 LUFS → ${outPath}`);
