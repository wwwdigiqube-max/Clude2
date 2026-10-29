// Narration script → what the voice reads + what the captions show (one source for both).
//   <dir>/script.json → <dir>/lines.json (for tools/doc-voices.mjs) + <dir>/show.json (for tools/captions.mjs)
// script.json: [{ "n": 1, "sp": "A", "tag": "[curious]", "text": "ساعتِ ماهواره‌های {GPS|*جی‌پی‌اس*} رو / *عمداً* کُند می‌سازن.", "gap": 0.2 }]
//   {spoken words|shown word}  the voice says the left side, the caption shows the right side:
//                              numbers {چهار|4} (TTS reads words, the screen shows digits),
//                              English {GPS|جی‌پی‌اس} (Latin letters are read better than a Persian spelling)
//   *word*                     keyword (highlighted in the caption); *two words* = one keyword span
//   " / "                      caption break (a new caption card starts after this word)
//   sp / tag / gap / take      speaker (A, B…), delivery tag ([curious], [serious], [excited]…), pause after the
//                              line in seconds, force a take after listening
// Usage: node tools/script-prep.mjs <dir>
import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2];
if (!dir) throw new Error("usage: node tools/script-prep.mjs <dir>   (reads <dir>/script.json)");
const S = JSON.parse(fs.readFileSync(path.join(dir, "script.json"), "utf8"));
const lines = [], show = [];
for (const l of S) {
  const tts = [], words = [];
  let kw = false;
  // tokens: {a|b} groups or plain words
  const re = /\{([^|}]+)\|([^}]+)\}|(\S+)/g;
  let m;
  while ((m = re.exec(l.text))) {
    if (m[3] === "/") {
      if (words.length) words[words.length - 1].br = true;
      continue;
    }
    const disp = m[2] ?? m[3];
    const spoken = m[1] ? m[1].trim().split(/\s+/) : [m[3].replace(/\*/g, "")];
    // a group may carry punctuation right after the closing brace (e.g. "}،"): glue it to the shown word
    let tail = "";
    if (m[1]) {
      const after = /^[،؛.!؟?…:»]+/.exec(l.text.slice(re.lastIndex));
      if (after) {
        tail = after[0];
        re.lastIndex += tail.length;
        spoken[spoken.length - 1] += tail;
      }
    }
    if (disp.replace(/^[«(]+/, "").startsWith("*")) kw = true;
    const isKw = kw;
    if (disp.replace(/[»).،؛!؟?…:]+$/, "").endsWith("*")) kw = false;
    const i0 = tts.length;
    tts.push(...spoken);
    words.push({ w: disp.replace(/\*/g, "") + tail, kw: isKw, tts: [i0, tts.length] });
  }
  const line = { n: l.n, sp: l.sp ?? "A", fa: (l.tag ? l.tag + " " : "") + tts.join(" "), gap: l.gap };
  if (l.take) line.take = l.take;
  lines.push(line);
  show.push({ n: l.n, words });
}
fs.writeFileSync(path.join(dir, "lines.json"), JSON.stringify(lines, null, 1));
fs.writeFileSync(path.join(dir, "show.json"), JSON.stringify(show));
for (const l of lines) console.log(l.n, l.sp, l.fa);
console.log("\ncaptions:\n" + show.map((s) => s.words.map((w) => (w.kw ? "*" + w.w + "*" : w.w) + (w.br ? " /" : "")).join(" ")).join("\n"));
