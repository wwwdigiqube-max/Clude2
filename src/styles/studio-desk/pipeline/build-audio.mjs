// Studio Desk · the reference film's sound plan → audio.json for tools/doc-mix.mjs (voice + music + 230 effects).
// Events came from the three scene builders' reports (exact times from the word cues, see AGENTS.md). Every file is
// measured once: its peak offset (so the peak lands on the event) and a gain that brings its active RMS to ~-20 dBFS
// (so pools mix evenly). Pools rotate, so no sound repeats too often.
// Files: public/sfx-lib + public/kenney (shipped) + your ElevenLabs takes:
//   node --env-file=.env tools/eleven-sfx.mjs src/styles/studio-desk/pipeline/sfx.json out/desk-sfx 2
// Your voice in out/desk-audio/voice.wav, your music (music-plan.json) in out/desk-audio/music.wav. Then (project root):
//   node src/styles/studio-desk/pipeline/build-audio.mjs [words.json] [out dir]
//   node tools/doc-mix.mjs out/desk-audio/audio.json out/desk-audio/mix.wav
// For your film: keep the pools and helpers, replace EV (the events) and musicKeys with your own cues.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const [WORDS = "src/styles/studio-desk/demo/words.json", A0 = "out/desk-audio"] = process.argv.slice(2);
const P = "public/";
const A = A0.replace(/\/?$/, "/");
const X = "out/desk-sfx/"; // tools/eleven-sfx.mjs output: <id>-<take>.mp3
fs.mkdirSync(A, { recursive: true });
// your ElevenLabs effects (sfx.json ids); the film took them from three earlier films — their names map 1:1
const fx = (id, k = 1) => `${X}${id}-${k}.mp3`;
const RENAME21 = { whoosh: "whoosh_soft", counter: "counter_retro", stamp: "stamp" };
const f22 = (n) => fx(n), f21 = (n) => fx(RENAME21[n] ?? n, n === "stamp" ? 2 : 1), lib = (n) => `${P}sfx-lib/${n}.wav`;
const f20 = (n) => { const [id, k] = n.replace(/^stamp_[bc]/, "stamp").split(/-(?=\d$)/); return fx(id, Number(k ?? 1)); };
const ken = (d, n) => `${P}kenney/${d}/${n}.ogg`, key = (n) => `${P}kenney/keyboard/keypress-${String(n).padStart(3, "0")}.wav`;

// ── pools (rotated so no single sound repeats too often)
const POOL = {
  WH: [f22("whoosh"), f20("zoom_out-1"), f21("whoosh"), f20("photos_fly-1"), lib("whoosh"), f22("flyby"), f20("zoom_out-2"), lib("sweep"), f20("flash_out-1"), f21("wipe"), f20("film_cut-1"), f20("photos_fly-2")],
  WARP: [f22("warp")],
  IMP: [f22("impact"), f22("boom"), lib("boom")],
  THUD: [f22("thud"), lib("thud"), ken("impact", "impactGeneric_light_002")],
  POP: [f21("pop"), f21("plop"), lib("pop"), f20("drop_plop-1"), lib("blip"), lib("hop"), f20("card_out-1")],
  DING: [lib("chime"), lib("notif"), f22("ping"), lib("ping"), lib("match")],
  CLICK: [ken("ui", "click1"), ken("interface", "click_002"), lib("click"), ken("ui", "click3"), ken("interface", "click_004"), ken("ui", "click5")],
  STAMP: [f21("stamp"), f20("stamp_b-1"), lib("stamp"), f20("stamp_c-1"), f20("stamp_b-2")],
  GLITCH: [f22("glitch"), lib("glitch"), ken("interface", "glitch_002"), ken("interface", "glitch_004")],
  COUNT: [f22("counter"), f21("counter"), f20("odometer-1"), lib("ticks"), f21("clock_fast"), f20("needle_tick-1")],
  SCAN: [f22("scan"), lib("scan")],
  LOCK: [f22("lock"), lib("lock")],
  TYPE: [f20("typing-1"), lib("type"), f20("typing-2")],
  SPARK: [f21("sparkle")],
  RISER: [lib("riser")],
  CASH: [ken("casino", "chips-stack-1"), ken("casino", "chips-stack-3"), ken("casino", "chips-collide-2"), ken("casino", "chips-stack-5")],
  SWITCH: [ken("interface", "switch_002")],
  PAPER: [lib("paper"), f20("paper_swap-1")],
  SHUTTER: [f20("shutter-1")],
  LOUPE: [f20("loupe-1")],
  SEND: [f20("send-1"), f20("send-2")],
  SCREEN: [f20("screen_on-1")],
  STRIKE: [lib("strike")],
  NODE: [lib("node1"), lib("node2"), lib("node3")],
  BEEP: [f22("beep"), f22("blips")],
  CARD: [ken("casino", "card-place-1"), ken("casino", "card-place-2"), ken("casino", "card-place-3"), ken("casino", "card-slide-2")],
  SHUFFLE: [ken("casino", "card-shuffle")],
  DROP: [f22("drop")],
  ZAP: [f22("holo_on"), f22("launch")],
  BELL: [ken("impact", "impactBell_heavy_000")],
  STEPS: [lib("steps")],
  BOING: [f21("boing")],
};
const at = {};
const pick = (k) => {
  const pool = POOL[k];
  const i = (at[k] = (at[k] ?? -1) + 1);
  return pool[i % pool.length];
};

// ── events: [time of the peak (s), kind, volume]
const EV = [
  // S1 · reels wall, 50%, AI
  [0.02, "IMP", 0.42], [0.05, "WH", 0.45], [1.32, "TYPE", 0.28], [1.98, "POP", 0.32], [2.95, "WH", 0.26],
  [3.15, "IMP", 1.0], [3.35, "SCAN", 0.3], [4.64, "CASH", 0.38], [4.78, "CASH", 0.32], [4.92, "CASH", 0.3],
  [6.18, "POP", 0.55], [6.22, "SPARK", 0.35], [6.45, "CLICK", 0.32], [7.3, "WH", 0.55], [7.42, "SHUTTER", 0.28], [7.7, "WARP", 0.45],
  // S2 · profile, 20 reels, 90K, shop
  [8.3, "WH", 0.26], [8.48, "DING", 0.28], [9.4, "CLICK", 0.3], [9.48, "LOCK", 0.3], [10.18, "POP", 0.4], [10.18, "SPARK", 0.32], [10.6, "SCAN", 0.28], [11.0, "WH", 0.3], [11.45, "COUNT", 0.32],
  [12.12, "WH", 0.26], [12.4, "COUNT", 0.28], [12.45, "ZAP", 0.26], [12.82, "DING", 0.42], [13.72, "WH", 0.26], [14.36, "CLICK", 0.4], [14.52, "WH", 0.28],
  [15.26, "POP", 0.28], [15.36, "CLICK", 0.34], [15.48, "DING", 0.32], [15.52, "CASH", 0.3], [15.75, "DING", 0.3], [16.02, "DING", 0.3], [16.15, "WH", 0.42],
  // S3 · YouTube
  [17.3, "WH", 0.28], [17.45, "COUNT", 0.28], [18.36, "POP", 0.28], [19.2, "WH", 0.26], [20.25, "RISER", 0.28],
  [20.1, "IMP", 0.5], [20.56, "CLICK", 0.4], [19.7, "ZAP", 0.26], [20.62, "POP", 0.26], [21.45, "GLITCH", 0.5],
  // S4 · fame, before/after, tools maze
  [21.82, "POP", 0.38], [22.46, "CASH", 0.36], [23.3, "DING", 0.32], [23.93, "POP", 0.32], [24.2, "SCAN", 0.26],
  [24.7, "WH", 0.32], [25.12, "WH", 0.3], [25.24, "THUD", 0.42], [25.34, "THUD", 0.38], [25.5, "POP", 0.32],
  [25.92, "STRIKE", 0.38], [25.96, "DING", 0.38], [27.2, "WH", 0.5], [28.23, "BOING", 0.32], [30.26, "WH", 0.45], [30.3, "LOCK", 0.38], [30.63, "NODE", 0.28], [30.91, "NODE", 0.28],
  [31.02, "DING", 0.42], [31.18, "NODE", 0.28], [31.42, "WH", 0.48],
  // S5 · 30 days
  [31.62, "PAPER", 0.4], [32.56, "IMP", 0.9], [33.3, "COUNT", 0.24], [34.5, "POP", 0.24], [34.85, "POP", 0.24],
  [35.1, "COUNT", 0.22], [36.76, "DING", 0.38], [37.18, "WARP", 0.6],
  // S6 · showcase
  [37.25, "IMP", 0.6], [37.37, "WH", 0.3], [37.42, "SHUTTER", 0.26], [37.62, "COUNT", 0.26], [39.66, "WH", 0.32], [40.42, "STAMP", 0.7],
  [41.3, "WH", 0.52], [41.86, "WH", 0.28], [41.9, "CLICK", 0.28], [42.82, "GLITCH", 0.52], [44.61, "WH", 0.42],
  [44.88, "BEEP", 0.24], [45.02, "BEEP", 0.22], [45.59, "LOCK", 0.42], [45.66, "SCAN", 0.32], [46.1, "POP", 0.24],
  [46.28, "POP", 0.22], [46.8, "GLITCH", 0.42], [47.62, "IMP", 0.9], [48.1, "SCAN", 0.32], [48.49, "LOUPE", 0.3],
  [48.66, "DING", 0.38], [49.2, "WH", 0.48],
  // S7 · gift, NFP, subscriptions, Claude, this reel
  [50.12, "SPARK", 0.32], [49.55, "DROP", 0.36], [49.62, "THUD", 0.5], [50.62, "THUD", 0.26], [51.5, "THUD", 0.28], [52.26, "THUD", 0.32], [52.55, "RISER", 0.26], [52.62, "CLICK", 0.4], [52.64, "POP", 0.48], [52.68, "SPARK", 0.28], [52.7, "WH", 0.3], [54.22, "CARD", 0.3], [54.38, "CARD", 0.28], [55.36, "CASH", 0.26], [55.91, "CASH", 0.25], [56.46, "CASH", 0.25], [57.01, "CASH", 0.25], [53.04, "IMP", 0.72], [53.08, "DING", 0.38],
  [53.53, "WH", 0.28], [56.16, "POP", 0.28], [56.92, "POP", 0.28],
  [57.44, "STRIKE", 0.42], [57.54, "STRIKE", 0.36], [57.76, "SWITCH", 0.34], [57.82, "STAMP", 0.78], [57.94, "WH", 0.32],
  [58.14, "POP", 0.38], [58.65, "RISER", 0.26], [58.75, "COUNT", 0.22], [59.36, "IMP", 0.58], [59.5, "DING", 0.34],
  [60.13, "SCREEN", 0.36], [60.45, "TYPE", 0.28], [60.61, "NODE", 0.24], [61.16, "NODE", 0.24], [61.66, "NODE", 0.24],
  [61.98, "DING", 0.28], [62.18, "STAMP", 0.72], [62.72, "WH", 0.38],
  // S8 · demo
  [65.16, "WH", 0.32], [63.1, "NODE", 0.26], [63.27, "NODE", 0.26], [63.44, "NODE", 0.26], [63.61, "POP", 0.28], [67.1, "WH", 0.28], [67.47, "POP", 0.28], [68.14, "DING", 0.3], [68.98, "WH", 0.25],
  [65.26, "WH", 0.26], [66.62, "POP", 0.34], [67.22, "COUNT", 0.32], [67.42, "IMP", 0.9], [67.7, "RISER", 0.22],
  [69.2, "BEEP", 0.28], [69.94, "DING", 0.38], [70.0, "WH", 0.48], [70.7, "POP", 0.34], [70.85, "TYPE", 0.3],
  [71.48, "CLICK", 0.38], [71.6, "SEND", 0.34], [71.9, "DING", 0.28], [72.46, "NODE", 0.26], [73.38, "NODE", 0.26],
  [74.02, "NODE", 0.26], [74.62, "DING", 0.3], [74.71, "POP", 0.28], [74.98, "WH", 0.42], [75.25, "POP", 0.28],
  [75.72, "WH", 0.32], [76.0, "CLICK", 0.2], [76.46, "POP", 0.28], [76.55, "CLICK", 0.2], [77.05, "CLICK", 0.2],
  [77.5, "CLICK", 0.2], [78.0, "CLICK", 0.2], [78.4, "CLICK", 0.2], [78.72, "IMP", 0.68], [78.76, "SPARK", 0.32], 
  // S9 · automation
  [80.55, "SWITCH", 0.5], [79.35, "WH", 0.5], [80.62, "DING", 0.32], [81.3, "WH", 0.32],
  [81.55, "POP", 0.24], [81.67, "POP", 0.24], [81.79, "POP", 0.24], [82.6, "ZAP", 0.28], [82.72, "BEEP", 0.26],
  [83.3, "SCAN", 0.32], [83.5, "COUNT", 0.22], [83.8, "DING", 0.32], [84.66, "THUD", 0.24], [84.86, "DING", 0.28],
  [85.32, "BEEP", 0.26], [85.8, "WH", 0.3], [86.42, "STAMP", 0.6], [87.08, "CARD", 0.32], [87.28, "CARD", 0.32],
  [87.48, "CARD", 0.32], [87.79, "DING", 0.32], [88.05, "WARP", 0.52],
  // S10 · styles wall
  [88.25, "SHUFFLE", 0.34], [89.44, "IMP", 1.0], [89.78, "THUD", 0.24], [90.12, "THUD", 0.24], [90.64, "THUD", 0.24],
  [91.24, "IMP", 0.55], [92.0, "WH", 0.36], [92.6, "WH", 0.36], [93.82, "CLICK", 0.3],
  [94.0, "COUNT", 0.18], [94.42, "CLICK", 0.3], [94.62, "CLICK", 0.34], [94.8, "WH", 0.46], [95.95, "POP", 0.34], [95.2, "THUD", 0.26],
  [96.24, "WH", 0.36], [97.14, "IMP", 0.48], [97.35, "ZAP", 0.26], [97.93, "DING", 0.38], [98.05, "DING", 0.32], [98.4, "WH", 0.5],
  // S11 · close
  [99.35, "WH", 0.28], [99.78, "DING", 0.26], [99.96, "DING", 0.25], [101.12, "DING", 0.26], [101.33, "DING", 0.25], [101.16, "CLICK", 0.28],
  [101.56, "IMP", 0.66], [101.6, "SPARK", 0.32], [102.12, "WH", 0.36], [102.84, "IMP", 0.88], [103.02, "WH", 0.26],
  [103.36, "IMP", 0.8], [103.45, "NODE", 0.22], [103.55, "NODE", 0.22], [103.65, "NODE", 0.22], [103.98, "WH", 0.42],
  // S12 · CTA
  [104.1, "WH", 0.3], [105.03, "POP", 0.22], [105.4, "POP", 0.22], [105.7, "STEPS", 0.3], [106.7, "WH", 0.38],
  [108.6, "SEND", 0.45], [108.9, "BEEP", 0.28], [109.1, "POP", 0.22], [109.3, "WH", 0.32],
  [109.6, "THUD", 0.42], [109.72, "PAPER", 0.42], [109.82, "POP", 0.32], [110.65, "COUNT", 0.3],
  [111.28, "BELL", 0.5], [111.87, "DING", 0.38], [112.28, "CLICK", 0.26], [112.6, "DING", 0.34], 
];
// the four «شروع» keys get real keypresses
for (const [i, t] of [107.6, 107.72, 107.84, 107.96].entries()) EV.push([t, `KEY${i}`, 0.34]);
POOL.KEY0 = [key(5)]; POOL.KEY1 = [key(11)]; POOL.KEY2 = [key(17)]; POOL.KEY3 = [key(23)];

// ── measure each file once: peak offset + level gain (active RMS → -20 dBFS)
const cache = {};
function measure(f) {
  if (cache[f]) return cache[f];
  const b = execFileSync("ffmpeg", ["-v", "error", "-i", f, "-ac", "1", "-ar", "24000", "-f", "f32le", "-"], { maxBuffer: 1 << 28 });
  const x = new Float32Array(b.buffer, b.byteOffset, b.length / 4);
  let pk = 0, pi = 0;
  for (let i = 0; i < x.length; i++) if (Math.abs(x[i]) > pk) { pk = Math.abs(x[i]); pi = i; }
  if (pk < 0.05) throw new Error(`almost silent take: ${f} (peak ${pk.toFixed(3)})`);
  // active RMS = RMS of samples within 30 dB of the peak
  let s = 0, n = 0;
  const thr = pk * 0.0316;
  for (let i = 0; i < x.length; i++) if (Math.abs(x[i]) > thr) { s += x[i] * x[i]; n++; }
  const rms = 10 * Math.log10(s / Math.max(1, n) + 1e-12);
  let g = Math.pow(10, (-20 - rms) / 20);
  g = Math.min(g, 0.89 / pk); // never past -1 dBFS peak
  return (cache[f] = { off: +(pi / 24000).toFixed(3), g });
}

const sfx = [];
const count = {};
const missing = new Set();
// where the music is quiet (the 30-days breakdown, the end card) the effects come down with it — never above the music
const QUIET = [[36.7, 37.22, 0.12], [31.25, 37.22, 0.3], [78.55, 79.0, 0.4], [103.9, 104.25, 0.7], [112.0, 114.1, 0.18], [111.9, 112.0, 0.35]];
const cap = (t) => QUIET.find(([a, b]) => t >= a && t <= b)?.[2] ?? 1;
const TRIM = [6.18, 6.22, 20.1, 20.25, 63.44, 65.16, 86.42, 108.6];
const trim = (t) => (TRIM.some((x) => Math.abs(x - t) < 0.06) ? 0.63 : 1);
let tiny = 0;
const keep = (v) => v > 0.24 || (v > 0.2 && tiny++ % 2 === 0);
for (const [t, k, v0] of EV.sort((a, b) => a[0] - b[0])) {
  if (!k.startsWith("KEY") && !keep(v0)) continue;
  const v = v0 * cap(t) * trim(t);
  const f = pick(k);
  if (!fs.existsSync(f)) {
    if (!missing.has(f)) console.warn("⚠ missing " + f + " (skipped)");
    missing.add(f);
    continue;
  }
  const m = measure(f);
  count[f] = (count[f] ?? 0) + 1;
  sfx.push([f, +t.toFixed(3), +(v * m.g).toFixed(3), m.off]);
}

// ── music curve: low under the voice, lifted on the hook, the drop, the gift reveal and the end card
const MUSIC_STEP = 0.71; // one step (−3 dB) lower: music and effects never louder than the voice
const musicKeys0 = [
  [0, 0.17], [3.0, 0.17], [3.4, 0.12], [7.6, 0.11], [31.0, 0.11], [36.9, 0.14], [37.25, 0.2], [38.2, 0.12],
  [49.5, 0.12], [49.7, 0.15], [51.0, 0.11], [62.9, 0.11], [79.4, 0.12], [88.2, 0.13], [89.6, 0.12],
  [98.5, 0.13], [104.0, 0.11], [111.2, 0.13], [111.3, 0.22], [112.3, 0.26], [113, 0.26],
];
const musicKeys = musicKeys0.map(([t, g]) => [t, +(g * MUSIC_STEP).toFixed(4)]);
// narration segments (sentence-level) for the mixer's gap logic
const W = JSON.parse(fs.readFileSync(WORDS, "utf8"));
const segs = [];
let a = 0;
W.forEach((w, i) => {
  const end = /[.،؟!?]$/.test(w.w) || i === W.length - 1 || (W[i + 1] && W[i + 1].s - w.e > 0.35);
  if (end) { segs.push({ n: segs.length, start: W[a].s, end: w.e }); a = i + 1; }
});
fs.writeFileSync(A + "vo-mix.json", JSON.stringify({ total: 113, segs, words: [] }));
const cfg = {
  vo: A + "voice.wav",
  voJson: A + "vo-mix.json",
  length: 113,
  music: [[A + "music.wav", 0, 0.01, "end", 0.5]],
  sfx,
  musicKeys,
  sfxGain: 0.28, // one step down: effects as loud as the music, never above it
  voGain: 1.55,
};
fs.writeFileSync(A + "audio.json", JSON.stringify(cfg, null, 1));
const reps = Object.entries(count).sort((x, y) => y[1] - x[1]).slice(0, 6).map(([f, n]) => `${f.split("/").slice(-2).join("/")}×${n}`);
console.log(`${sfx.length} effects · ${Object.keys(count).length} distinct files · most used: ${reps.join(", ")}`);
