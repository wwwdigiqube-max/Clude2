// v10 narration (Charlie, v3). Same token scheme as v05: "tts|display".
// 1) node --env-file=.env tools/v10-narration.mjs tts   → writes narration text, calls ElevenLabs (Charlie, v3)
// 2) node tools/v10-narration.mjs words                 → src/v05/words.json (word timings mapped to display words)
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const DIR = new URL("../../videos/10-nfp-story/voice/", import.meta.url);
const OUT = new URL("../src/v10/", import.meta.url);
const VOICE = "IKne3meq5aSn9XLyUdCD"; // Charlie

export const SENTENCES = [
  "مشکل بیشتر آدما این نیست که ایده برای محتوا ندارن؛ وقت ساختنش رو ندارن.",
  "باید سناریو بنویسی، فیلم بگیری، ادیت کنی، لوکیشن داشته باشی، ظاهر و انرژی‌ت هم مناسب باشه…",
  "آخرش می‌بینی ساخت یه ویدئو، نصف روز یا حتی چند روزت رو گرفته.",
  "برای همین ما اِن‌اِف‌پی|NFP رو ساختیم.",
  "با اِن‌اِف‌پی|NFP و کلود،|Claude بدون اینکه لازم باشه پول چندتا مدل ویدئوساز مختلف رو بدی، می‌تونی نه برای یه پیج، برای چندتا پیج با موضوع‌های مختلف هر روز محتوا بسازی.",
  "اونم نه یه ویدئوی ساده.",
  "ویدئوهای حرفه‌ای مثل همینی که الان داری می‌بینی؛ با سناریو، تصویر، صداگذاری و ادیت کامل.",
  "چیزی که ساختنش با روش سنتی چند روز زمان می‌بره و ادیتور، دوربین و لوکیشن می‌خواد.",
  "اِن‌اِف‌پی|NFP اون ابزاریه که بقیه برای داشتنش باید ماهانه صد|۱۰۰ دلار اشتراک بخرن، یا سی|۳۰ میلیون حقوق بدن تا ادیتور و فیلم‌بردار بیاد براشون ویدئو درست کنه.",
  "یک وبینار آموزشی به‌زودی برگزار می‌کنم؛ اونجا بیشتر درباره‌ش حرف می‌زنیم.",
];

const toks = (s) => s.split(/\s+/).map((t) => { const [a, b] = t.split("|"); return { tts: a, show: b ?? a }; });
// display word keeps the tts word's trailing punctuation
const punct = (w) => (w.match(/[،.:!؟»؛…]+$/) ?? [""])[0];

const mode = process.argv[2];
if (mode === "tts") {
  const text = SENTENCES.map((s) => toks(s).map((t) => t.tts).join(" ")).join(" ");
  fs.writeFileSync(new URL("narration.txt", DIR), text);
  console.log("chars:", text.length);
  execFileSync(process.execPath, ["--env-file=.env", "tools/eleven-tts.mjs", VOICE, new URL("narration.txt", DIR).pathname.slice(1), new URL("narration.mp3", DIR).pathname.slice(1)].map(decodeURIComponent), { stdio: "inherit" });
} else if (mode === "words") {
  const { alignment: a } = JSON.parse(fs.readFileSync(new URL("narration.json", DIR)));
  // spoken words from character alignment
  const spoken = [];
  let cur = null;
  a.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) { if (cur) spoken.push(cur); cur = null; return; }
    if (!cur) cur = { text: "", s: a.character_start_times_seconds[i], e: 0 };
    cur.text += ch; cur.e = a.character_end_times_seconds[i];
  });
  if (cur) spoken.push(cur);
  const words = [];
  SENTENCES.forEach((s, si) => toks(s).forEach((t, wi) => {
    const show = t.show === t.tts ? t.tts : t.show + punct(t.tts);
    words.push({ si, wi, tts: t.tts, w: show });
  }));
  if (words.length !== spoken.length) console.log("WARN count", words.length, "spoken", spoken.length);
  words.forEach((w, i) => { const sp = spoken[i]; if (sp.text !== w.tts) console.log("mismatch", i, sp.text, "≠", w.tts); w.s = +sp.s.toFixed(3); w.e = +sp.e.toFixed(3); delete w.tts; });
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(new URL("words.json", OUT), JSON.stringify(words));
  const dur = a.character_end_times_seconds.at(-1);
  console.log("words:", words.length, "dur:", dur.toFixed(2));
  SENTENCES.forEach((_, si) => { const ws = words.filter((w) => w.si === si); console.log(si + 1, ws[0].s.toFixed(2), "→", ws.at(-1).e.toFixed(2)); });
}
