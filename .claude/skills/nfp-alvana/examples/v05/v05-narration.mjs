// v05 narration: script tokens "tts|display" (tts = phonetic Persian for the voice, display = caption text).
// 1) node --env-file=.env tools/v05-narration.mjs tts   → writes narration text, calls ElevenLabs (Charlie, v3)
// 2) node tools/v05-narration.mjs words                 → src/v05/words.json (word timings mapped to display words)
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const DIR = new URL("../../videos/05-vibe-legal/voice/", import.meta.url);
const OUT = new URL("../src/v05/", import.meta.url);
const VOICE = "IKne3meq5aSn9XLyUdCD"; // Charlie

export const SENTENCES = [
  "با وایب|Vibe کُدینگ|Coding شاید بتونی اَپِت|اپت رو تو یه شب بسازی، ولی قبل از اولین فروشت یه اشتباه ساده می‌تونه برات دردسر حقوقی جدی درست کنه.",
  "مشکل اینه که بیشتر آدم‌ها فقط حواسشون به خود محصوله، نه چیزهایی که پشتش داره اتفاق میفته.",
  "مثلاً فرم ثبت‌نامت هیچ محدودیتی برای کاربر زیر سیزده|۱۳ سال نداره.",
  "فونت‌هات مستقیم از سرور گوگل لود میشن و ممکنه اطلاعاتی مثل آی‌پی|IP کاربر رو منتقل کنن.",
  "یه ابزار اَنالیتیکس|Analytics هم گذاشتی که سِشِن|Session ریپلِی|Replay داره و رفتار کاربر داخل سایت رو ضبط می‌کنه.",
  "بعد ایمیل تبلیغاتی می‌فرستی ولی لینک لغو عضویت نداری، یا اشتراک اِستِرایپ|Stripe داری اما شرایط تمدیدش درست نمایش داده نشده.",
  "حتی عکس‌هایی که کاربرها داخل اَپِت|اپت آپلود می‌کنن هم اگه قوانین کپی‌رایت و دی‌اِم‌سی‌اِی|DMCA رو درست نچیده باشی، می‌تونن برات مشکل درست کنن.",
  "نکته‌ی ترسناک اینجاست که خیلی از این دردسرها اصلاً به درآمدت ربطی ندارن.",
  "یعنی ممکنه هنوز حتی یه دلار هم نفروخته باشی، ولی چندتا کاربر، چندتا ایمیل یا چندتا سِشِن|سشن برات مشکل بسازه.",
  "و این دقیقاً همون چیزیه که خیلی‌ها موقع وایب|Vibe کُدینگ|Coding فراموش می‌کنن:",
  "اِی‌آی|AI محصول رو برات سریع می‌سازه، ولی قانونی بودنش رو تضمین نمی‌کنه.",
  "من یه پرامپت آماده کردم که می‌تونی بدی به کلود|Claude تا اَپِت|اپت رو از نظر همین موارد بررسی کنه و بهت بگه کجاها نیاز به اصلاح داره.",
  "اگه پرامپتش رو می‌خوای، کلمه‌ی «قانون» رو کامنت کن.",
];

const toks = (s) => s.split(/\s+/).map((t) => { const [a, b] = t.split("|"); return { tts: a, show: b ?? a }; });
// display word keeps the tts word's trailing punctuation
const punct = (w) => (w.match(/[،.:!؟»]+$/) ?? [""])[0];

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
