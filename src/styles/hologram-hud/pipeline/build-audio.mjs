// Hologram HUD · the reference film's sound plan → audio.json → tools/doc-mix.mjs (voice + music + effects, -14 LUFS).
// Every effect sits on a visual event of demo/scenes.ts / demo/director.ts: a whoosh on each whip / zoom, a glitch on
// each glitch cut, impacts on the slams, the tape rewind into 1977, the launch, the switch, the lock-on.
// For your video: copy this file, keep the helpers (at / from / lib), replace the events with your own cues.
// Run from the project root:
//   node src/styles/hologram-hud/pipeline/build-audio.mjs [vo.json] [out audio.json]
//   node tools/doc-mix.mjs out/hologram-audio.json out/mix.wav      (→ out/mix-norm.wav at -14 LUFS)
// Levels that passed review: voice ≈ -22, music ≈ -31, effects ≈ -36.5 LUFS (stems: add --stems to doc-mix).
import fs from "node:fs";
import path from "node:path";
const [voPath = "src/styles/hologram-hud/demo/vo.json", out = "out/hologram-audio.json"] = process.argv.slice(2);
const VO = JSON.parse(fs.readFileSync(voPath, "utf8"));
// peak offsets of the levelled effects in public/styles/hologram-hud/sfx (printed by tools/sfx-takes.mjs level)
const OFF = {
  holo_on: 0.196, beep: 0.044, blips: 0.16, glitch: 0.06, ping: 0.101, counter: 0.563, scan: 0.465, boom: 0.184, tick: 0.117, alert: 0.109,
  whoosh: 0.139, impact: 0.203, rewind: 1.031, launch: 0.118, lock: 0.044, thud: 0.006, warp: 0.23, error: 0.179, drop: 0.15, flyby: 0.273,
};
const TOTAL = Math.round(VO.total * 30) / 30;
const clean = (w) => w.replace(/[،.؛:«»!؟?…"]/g, "").replace(/[ً-ْ]/g, "");
function Wd(n, word, occ = 0) {
  const ws = VO.words.filter((w) => w.line === n);
  let hits = ws.filter((w) => clean(w.w) === clean(word));
  if (!hits.length) hits = ws.filter((w) => clean(w.w).startsWith(clean(word)));
  if (!hits[occ]) throw new Error(`no ${word} in ${n}`);
  return hits[occ].s;
}
const S = (n) => VO.segs.find((s) => s.n === n).start;
// shot starts — same as demo/cues.ts
const SH = {
  phone: S(2) - 0.1, earth: S(3) - 0.1, clocks: S(4) - 0.1, speed: S(5) - 0.1, gravity: S(6) - 0.1, net: S(7) - 0.1,
  light: S(8) - 0.1, map: Wd(8, "روزی") - 0.2, y1977: S(9) - 0.1, testsat: S(10) - 0.1, proof: S(11) - 0.1, fix: S(12) - 0.1,
  back: Wd(12, "عمداً") - 0.35,
};
const sfx = [];
/** the effect's peak lands at t */
const at = (id, t, vol) => sfx.push([`public/styles/hologram-hud/sfx/${id}.flac`, +t.toFixed(3), vol, OFF[id]]);
/** the effect starts at t */
const from = (id, t, vol) => sfx.push([`public/styles/hologram-hud/sfx/${id}.flac`, +(t + OFF[id]).toFixed(3), vol, OFF[id]]);
/** a library file whose peak lands at t */
const lib = (f, t, vol, off = 0) => sfx.push([`public/${f}`, +t.toFixed(3), vol, off]);
const SWITCH = "kenney/interface/switch_002.ogg", RISER = "sfx-lib/riser.wav";

// ---- transitions ----
at("whoosh", SH.phone + 0.15, 0.5);
at("whoosh", SH.earth + 0.18, 0.4);
at("glitch", SH.clocks + 0.03, 0.4);
at("whoosh", SH.speed + 0.15, 0.45);
at("drop", SH.gravity + 0.3, 0.5);
at("glitch", SH.net + 0.03, 0.4);
at("whoosh", SH.light + 0.15, 0.45);
at("whoosh", SH.map + 0.18, 0.35);
from("rewind", SH.y1977 - 0.05, 0.45);
at("whoosh", SH.testsat + 0.18, 0.35);
at("whoosh", SH.proof + 0.15, 0.45);
at("glitch", SH.fix + 0.03, 0.4);
at("whoosh", SH.back + 0.2, 0.35);

// 1 · built to run slow
from("holo_on", 0.0, 0.5);
for (const t of [0.55, 0.85, 1.15]) at("beep", t, 0.22);
const slow1 = Wd(1, "کُند");
from("blips", slow1 - 0.42, 0.3);
at("impact", slow1, 0.5);
// 2 · four satellites, the fix
from("holo_on", SH.phone, 0.4);
from("scan", Wd(2, "سیگنالِ") - 0.1, 0.35);
for (let i = 0; i < 4; i++) at("beep", Wd(2, "چهار") - 0.3 + i * 0.11 + 0.03, 0.3);
at("ping", Wd(2, "ماهواره،") + 0.05, 0.35);
at("thud", Wd(2, "موقعیتتون") + 0.21, 0.45);
lib("sfx-lib/ping.wav", Wd(2, "موقعیتتون") + 0.25, 0.3);
// 3 · 20,000 km, atomic clocks
from("holo_on", SH.earth, 0.4);
from("counter", Wd(3, "بیست") - 0.08, 0.4);
at("whoosh", Wd(3, "ساعتِ") + 0.2, 0.25);
from("blips", Wd(3, "ساعتِ") - 0.05, 0.35);
at("ping", Wd(3, "اتمی"), 0.3);
// 4 · time runs differently
for (let t = SH.clocks + 0.25; t < SH.speed - 0.2; t += 0.5) at("tick", t, 0.22);
at("warp", Wd(4, "زمان"), 0.5);
// 5 · speed: −7.2
from("flyby", SH.speed + 0.05, 0.45);
from("counter", SH.speed + 0.1, 0.3);
at("beep", Wd(5, "ساعتشون") - 0.05, 0.3);
at("impact", Wd(5, "هفت"), 0.45);
from("blips", Wd(5, "میلیونیومِ") - 0.05, 0.22);
// 6 · gravity: +45.8
at("warp", Wd(6, "جاذبه"), 0.5);
at("beep", Wd(6, "ضعیف‌تره") - 0.05, 0.22);
at("beep", Wd(6, "ضعیف‌تره") + 0.2, 0.2);
at("impact", Wd(6, "چهل"), 0.45);
at("ping", Wd(6, "تندتر"), 0.25);
// 7 · the collision: +38.6, the clock runs ahead
at("whoosh", SH.net + 0.25, 0.3);
lib(RISER, Wd(7, "سی") - 0.02, 0.4, 1.499);
at("impact", Wd(7, "سی") - 0.02, 0.6);
at("boom", Wd(7, "سی") + 0.02, 0.4);
at("beep", Wd(7, "سی") + 0.35, 0.22);
at("tick", Wd(7, "جلو"), 0.45);
at("ping", Wd(7, "جلو") + 0.08, 0.25);
// 8 · light speed, 1 µs = 300 m, 11.4 km of error
from("holo_on", SH.light, 0.35);
from("scan", Wd(8, "سرعتِ") - 0.05, 0.4);
at("ping", Wd(8, "نور"), 0.3);
from("blips", Wd(8, "پس") - 0.05, 0.3);
from("counter", Wd(8, "کم") + 0.1, 0.35);
at("beep", Wd(8, "کم") + 0.9, 0.35);
from("counter", Wd(8, "یازده") - 0.05, 0.4);
at("error", Wd(8, "کیلومتر"), 0.45);
at("boom", Wd(8, "کیلومتر") + 0.03, 0.35);
at("alert", Wd(8, "مکان‌یابی"), 0.3);
// 9 · 1977: the years roll back and land; doubt
at("thud", Wd(9, "هفت،") + 0.12, 0.55);
at("impact", Wd(9, "هفت،") + 0.12, 0.3);
from("holo_on", Wd(9, "هنوز") - 0.12, 0.45);
from("blips", Wd(9, "هنوز") + 0.3, 0.22);
for (let i = 0; i < 3; i++) at("beep", Wd(9, "باور") - 0.05 + i * 0.1 + 0.05, 0.25);
at("alert", Wd(9, "باور") + 0.3, 0.25);
// 10 · the launch, Einstein switched off
from("launch", SH.testsat, 0.45);
from("blips", Wd(10, "آزمایشی") - 0.1, 0.3);
at("beep", Wd(10, "آزمایشی") + 0.3, 0.22);
from("holo_on", Wd(10, "اینشتین") - 0.15, 0.45);
lib(SWITCH, Wd(10, "اینشتین") + 0.15, 0.25, 0.001);
at("beep", Wd(10, "استفاده"), 0.25);
lib(SWITCH, Wd(10, "نکردن") - 0.02, 0.45, 0.001);
at("error", Wd(10, "نکردن") + 0.02, 0.45);
at("glitch", Wd(10, "نکردن") + 0.05, 0.3);
// 11 · three weeks, the proof, the lock-on
from("counter", Wd(11, "سه") - 0.05, 0.35);
from("scan", Wd(11, "هفته") + 1.1, 0.3);
at("beep", Wd(11, "جلو"), 0.3);
from("blips", Wd(11, "نسبیت") - 0.05, 0.25);
from("lock", Wd(11, "پیش‌بینی") + 0.2, 0.45);
at("ping", Wd(11, "پیش‌بینی") + 0.55, 0.35);
// 12 · switched on, tuned slow
lib(SWITCH, Wd(12, "هنوزم") - 0.05, 0.45, 0.001);
at("impact", Wd(12, "هنوزم") + 0.1, 0.4);
from("counter", Wd(12, "هنوزم") + 0.45, 0.3);
from("holo_on", SH.back, 0.4);
const slow2 = Wd(12, "کندتر");
from("blips", slow2 - 0.42, 0.3);
at("impact", slow2, 0.55);
at("boom", slow2 + 0.03, 0.3);

const A = {
  vo: "public/styles/hologram-hud/demo/vo.mp3",
  voJson: voPath,
  length: TOTAL,
  music: [["public/styles/hologram-hud/demo/music.mp3", 0, 0.03, "end", 0.3]],
  // music gain curve: a little louder for the first beat, then low under the voice (the creator asked for it lower)
  musicKeys: [[0, 0.2], [0.35, 0.16], [TOTAL, 0.16]],
  sfx: sfx.sort((a, b) => a[1] - b[1]),
  sfxGain: 0.5,
  voGain: 1.0,
};
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(A, null, 1));
console.log(sfx.length, "effects, total", TOTAL, "→", out);
