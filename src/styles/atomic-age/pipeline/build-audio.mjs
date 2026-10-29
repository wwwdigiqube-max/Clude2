// Atomic Age · the reference film's sound plan → audio.json → tools/doc-mix.mjs (voice + music + effects, -14 LUFS).
// Every effect sits on its picture event, computed from the same words the scenes use (demo/cues.ts · SH).
// For your video: copy this file, keep the helpers (at / from / lib), replace the events with your own cues.
// Run from the project root:
//   node src/styles/atomic-age/pipeline/build-audio.mjs [vo.json] [out audio.json]
//   node tools/doc-mix.mjs out/atomic-audio.json out/mix.wav      (→ out/mix-norm.wav at -14 LUFS)
import fs from "node:fs";
import path from "node:path";
const [voPath = "src/styles/atomic-age/demo/vo.json", out = "out/atomic-audio.json"] = process.argv.slice(2);
const VO = JSON.parse(fs.readFileSync(voPath, "utf8"));
const OFF = {"pop":0.033,"sprout":0.506,"raygun":0.333,"boing":0.002,"slide_down":0.621,"mutate":0.394,"lever":0.016,"clock_fast":0.024,"shake_seeds":0.572,"whoosh":0.081,"geiger":1.027,"counter":0.211,"wipe":0.094,"sparkle":0.297,"birds":0.343,"buzzer":0.171,"plop":0.062,"stamp":0.032};
const TOTAL = Math.round(VO.total * 30) / 30;
const clean = (w) => w.replace(/[،.؛:«»!؟?…"]/g, "").replace(/[ً-ْ]/g, "");
function Wd(n, word, occ = 0) {
  const ws = VO.words.filter((w) => w.line === n);
  let hits = ws.filter((w) => clean(w.w) === clean(word));
  if (!hits.length) hits = ws.filter((w) => clean(w.w).startsWith(clean(word)));
  if (!hits[occ]) throw new Error(`no ${word} in ${n}`);
  return hits[occ].s;
}
const S = (n) => VO.segs.find((s) => s.n === n).start, E = (n) => VO.segs.find((s) => s.n === n).end;
const SH = {
  zap: S(2) - 0.15, field: S(3) - 0.15, control: Wd(3, "از") - 0.06, rows: S(4) - 0.15, gardener: S(5) - 0.12,
  packet: Wd(5, "بذرِ") - 0.08, foods: S(6) - 0.12, texas: S(7) - 0.12, post: Wd(7, "فرستادن") - 0.12, map: Wd(7, "تا") - 0.12,
  result: S(8) - 0.12, fruit: Wd(8, "«استار") - 0.3, un: S(9) - 0.12, compare: S(10) - 0.12, loop: E(10) + 0.3,
};
const sfx = [];
/** the effect's loudest moment lands at t */
const at = (id, t, vol) => sfx.push([`public/styles/atomic-age/sfx/${id}.flac`, +t.toFixed(3), vol, OFF[id]]);
/** the effect starts at t */
const from = (id, t, vol) => sfx.push([`public/styles/atomic-age/sfx/${id}.flac`, +(t + OFF[id]).toFixed(3), vol, OFF[id]]);
const lib = (f, t, vol) => sfx.push([`public/sfx-lib/${f}.wav`, +t.toFixed(3), vol, 0]);
// the wipes
for (const k of ["zap", "field", "rows", "gardener", "foods", "texas", "map", "result", "un", "compare", "loop"]) at("wipe", SH[k] + 0.15, 0.32);
for (const k of ["packet", "fruit"]) { at("whoosh", SH[k] + 0.1, 0.4); at("pop", SH[k] + 0.2, 0.45); }
// 1 · the garden
at("pop", Wd(1, "هزار") - 0.02, 0.55);
from("sprout", Wd(1, "دانشمندها") - 0.05, 0.42);
from("geiger", Wd(1, "رادیواکتیو") - 0.1, 0.3);
at("stamp", Wd(1, "عمداً") + 0.02, 0.75);
// 2 · the goal
at("whoosh", SH.zap + 0.2, 0.3);
at("pop", Wd(2, "چی") - 0.02, 0.4);
at("pop", Wd(2, "که") - 0.05, 0.45);
at("raygun", Wd(2, "ژنِ") + 0.2, 0.55);
at("boing", Wd(2, "ژنِ") + 0.3, 0.4);
at("pop", Wd(2, "گیاه‌ها") - 0.03, 0.4);
from("shake_seeds", Wd(2, "تغییر") - 0.3, 0.3);
// 3 · the lab
at("pop", Wd(3, "نیویورک") - 0.02, 0.4);
from("geiger", Wd(3, "کبالتِ") - 0.05, 0.28);
at("lever", SH.control + 0.02, 0.55);
at("pop", Wd(3, "راه") - 0.04, 0.35);
// 4 · died / changed
at("slide_down", Wd(4, "می‌مُردن") + 0.35, 0.5);
at("pop", Wd(4, "می‌مُردن") - 0.02, 0.35);
at("mutate", Wd(4, "تغییر") + 0.2, 0.45);
at("pop", Wd(4, "تغییر") - 0.02, 0.35);
// 5 · families, atomic seeds
from("birds", SH.gardener, 0.35);
from("shake_seeds", Wd(5, "اتمی") - 0.2, 0.45);
// 6 · the famous crops were not as good
at("pop", Wd(6, "محصول‌های") - 0.05, 0.4);
at("pop", Wd(6, "محصول‌های") + 0.1, 0.35);
at("plop", Wd(6, "اونجا") + 0.45, 0.4);
at("slide_down", Wd(6, "دیگه") + 0.45, 0.3);
at("buzzer", Wd(6, "خوب") + 0.0, 0.4);
at("stamp", Wd(6, "خوب") + 0.08, 0.45);
// 7 · Texas sends them to be irradiated
at("pop", Wd(7, "تگزاسی‌ها") - 0.02, 0.4);
at("whoosh", SH.post + 0.15, 0.4);
at("plop", SH.post + 0.3, 0.5);
at("stamp", SH.post + 0.47, 0.6);
at("pop", SH.map + 0.05, 0.35);
at("whoosh", SH.map + 0.3, 0.35);
at("raygun", Wd(7, "پرتو") + 0.05, 0.5);
// 8 · the result
at("sparkle", SH.result + 0.3, 0.4);
at("sparkle", SH.fruit + 0.15, 0.45);
at("pop", Wd(8, "«استار") + 0.05, 0.4);
lib("ping", Wd(8, "روبی»") + 0.1, 0.35);
at("sparkle", Wd(8, "«ریو"), 0.45);
// 9 · the UN database
at("pop", Wd(9, "سازمان") - 0.02, 0.4);
from("counter", Wd(9, "سه") - 0.12, 0.4);
from("sprout", Wd(9, "گونه‌ی") - 0.12, 0.35);
lib("ping", Wd(9, "«گلدن") + 0.05, 0.4);
from("geiger", Wd(9, "بیشترشون") - 0.05, 0.3);
// 10 · nature vs radiation
at("pop", Wd(10, "پرتو") - 0.05, 0.4);
at("pop", Wd(10, "جهشِ") - 0.05, 0.4);
lib("ping", Wd(10, "می‌کرد") + 0.2, 0.35);
from("clock_fast", Wd(10, "ولی") - 0.05, 0.45);
at("pop", Wd(10, "سریع‌تر") - 0.02, 0.4);
// back to the start
at("slide_down", SH.loop + 0.5, 0.2);
const A = {
  vo: "public/styles/atomic-age/demo/vo.mp3",
  voJson: voPath,
  length: TOTAL,
  music: [["public/styles/atomic-age/demo/music.mp3", 0, 0.03, "end", 0.25]],
  musicKeys: [[0, 0.3], [0.35, 0.24], [E(10), 0.24], [E(10) + 0.4, 0.32], [TOTAL, 0.32]],
  sfx,
  sfxGain: 0.6,
  voGain: 1.0,
};
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(A, null, 1));
console.log(sfx.length, "effects, total", TOTAL, "→", out);
