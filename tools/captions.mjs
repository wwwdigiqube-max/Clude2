// Word-timed captions: <dir>/show.json (from tools/script-prep.mjs) + vo.json (from tools/doc-build-vo.mjs) →
// captions.json = chunks [{ words: [{ w, kw, s, e }], s, e, line }]. Every shown word gets the time span of the
// spoken words it stands for, so «4» lights up exactly while «چهار» is said.
// A chunk starts with its first word and lives until the next chunk starts (or a beat after its last word).
// Chunks break where script.json has « / » (and at the end of each line).
// Usage: node tools/captions.mjs <dir> <vo.json> <out captions.json>
import fs from "node:fs";
import path from "node:path";

const [dir, voPath, out] = process.argv.slice(2);
if (!out) throw new Error("usage: node tools/captions.mjs <dir> <vo.json> <out captions.json>");
const show = JSON.parse(fs.readFileSync(path.join(dir, "show.json"), "utf8"));
const VO = JSON.parse(fs.readFileSync(voPath, "utf8"));
const chunks = [];
for (const l of show) {
  const ws = VO.words.filter((w) => w.line === l.n);
  const need = l.words.reduce((m, w) => Math.max(m, w.tts[1]), 0);
  if (ws.length !== need) throw new Error(`line ${l.n}: ${ws.length} spoken words in vo.json, the captions expect ${need} — re-run script-prep after editing script.json, then rebuild the voice`);
  const words = l.words.map((w) => ({ w: w.w, kw: w.kw, br: !!w.br, s: ws[w.tts[0]].s, e: ws[w.tts[1] - 1].e }));
  let cur = [];
  words.forEach((w) => {
    cur.push({ w: w.w, kw: w.kw, s: w.s, e: w.e });
    if (w.br) {
      chunks.push({ words: cur, line: l.n });
      cur = [];
    }
  });
  if (cur.length) chunks.push({ words: cur, line: l.n });
}
chunks.forEach((c, i) => {
  c.s = c.words[0].s;
  const next = chunks[i + 1], lastE = c.words[c.words.length - 1].e;
  c.e = next ? Math.min(next.words[0].s - 0.12, lastE + 0.9) : lastE + 0.5;
  if (c.e < lastE + 0.15) c.e = lastE + 0.15;
});
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(chunks.map(({ words, s, e, line }) => ({ words, s: +s.toFixed(3), e: +e.toFixed(3), line }))));
for (const c of chunks) console.log(c.line, c.s.toFixed(2), c.e.toFixed(2), c.words.map((w) => (w.kw ? "*" + w.w + "*" : w.w)).join(" "));
