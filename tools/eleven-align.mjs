// Forced alignment of a user's voice recording against the known script (ElevenLabs).
// Usage: node --env-file=.env tools/eleven-align.mjs <audio> <script.txt> <out-words.json>
// script.txt: one sentence per line (sentence index = line). Output: [{si, wi, w, s, e}] like v05.
// Needs (Iran): $env:HTTPS_PROXY='http://127.0.0.1:<PORT>'; $env:NODE_USE_ENV_PROXY='1'
import fs from "node:fs";
import path from "node:path";
import { elevenReady, xi } from "./lib/eleven.mjs";

const [audio, scriptFile, out] = process.argv.slice(2);
const lines = fs.readFileSync(scriptFile, "utf8").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const text = lines.join(" ");

const form = new FormData();
form.append("file", new Blob([fs.readFileSync(audio)], { type: "audio/mpeg" }), path.basename(audio));
form.append("text", text);
const r = await fetch("https://api.elevenlabs.io/v1/forced-alignment", { method: "POST", headers: { ...xi() }, body: form });
const j = await r.json();
if (!r.ok) { console.log(r.status, JSON.stringify(j).slice(0, 400)); process.exit(1); }
fs.writeFileSync(out.replace(/\.json$/, ".raw.json"), JSON.stringify(j));

// our tokens (display words) in order, with sentence/word index
const toks = [];
lines.forEach((l, si) => l.split(/\s+/).forEach((w, wi) => toks.push({ si, wi, w })));
const aw = j.words.filter((w) => w.text.trim());
if (aw.length !== toks.length) console.log("WARN token count", toks.length, "aligned", aw.length);
const words = toks.map((t, i) => ({ ...t, s: +(aw[i]?.start ?? 0).toFixed(3), e: +(aw[i]?.end ?? 0).toFixed(3) }));
toks.forEach((t, i) => { if (aw[i] && aw[i].text.trim() !== t.w) console.log("diff", i, JSON.stringify(aw[i].text), "≠", t.w); });
fs.writeFileSync(out, JSON.stringify(words));
lines.forEach((_, si) => { const ws = words.filter((w) => w.si === si); console.log(si, ws[0].s.toFixed(2), "→", ws.at(-1).e.toFixed(2), "|", ws.map((w) => w.w).join(" ")); });
