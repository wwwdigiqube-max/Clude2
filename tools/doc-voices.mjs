// Documentary style · step 1 of the voices: every dialogue line, several takes, two voices (ElevenLabs TTS with
// character timestamps), then each take is transcribed (Scribe) and scored against the text, so the best one can be
// picked automatically. Skips takes that already exist — safe to re-run after editing a line (delete its takes first).
//
// <dir>/lines.json   [{ "n": 1, "sp": "A", "fa": "[warm] متنِ جمله", "check"?: "متن برای مقایسه", "gap"?: 0.5, "take"?: 2 }]
//                    sp = speaker (A/B…) · [tags] steer the delivery (warm, curious, surprised, whispers…)
//                    gap = pause after the line (s) · take = force a take after listening
// <dir>/voices.json  { "A": "<voiceId>", "B": "<voiceId>", "model": "eleven_v4", "takes": 3, "lang": "fa" }
// Writes <dir>/vo/<nn>-<k>.mp3 + .json (alignment) and <dir>/vo/verify.json ({ "<nn>-<k>": { score, heard, dur } }).
// Usage: node --env-file=.env tools/doc-voices.mjs <dir> [--no-verify]
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { elevenReady, xi } from "./lib/eleven.mjs";

const dir = process.argv[2];
if (!dir) throw new Error("usage: node --env-file=.env tools/doc-voices.mjs <dir> [--no-verify]");
const L = JSON.parse(fs.readFileSync(path.join(dir, "lines.json"), "utf8"));
const V = JSON.parse(fs.readFileSync(path.join(dir, "voices.json"), "utf8"));
const model = V.model ?? "eleven_v4", takes = V.takes ?? 3, lang = V.lang ?? "fa";
const KEY = process.env.ELEVENLABS_API_KEY;
if (!elevenReady()) throw new Error("ELEVENLABS_API_KEY missing (put it in .env, run with --env-file=.env; in a cloud session add it as a network secret)");
const OUT = path.join(dir, "vo");
fs.mkdirSync(OUT, { recursive: true });
const pad = (n) => String(n).padStart(2, "0");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- 1) takes ----
const jobs = [];
for (const l of L) {
  if (!V[l.sp]) throw new Error(`no voice for speaker ${l.sp} in voices.json`);
  for (let k = 1; k <= takes; k++) if (!fs.existsSync(path.join(OUT, `${pad(l.n)}-${k}.mp3`))) jobs.push([l, k]);
}
async function tts([l, k]) {
  for (let a = 0; a < 4; a++) {
    try {
      const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${V[l.sp]}/with-timestamps?output_format=mp3_44100_192`, {
        method: "POST",
        headers: { ...xi(), "Content-Type": "application/json" },
        body: JSON.stringify({ text: l.fa, model_id: model, language_code: lang }),
      });
      if (!r.ok) throw new Error(r.status + " " + (await r.text()).slice(0, 160));
      const j = await r.json();
      fs.writeFileSync(path.join(OUT, `${pad(l.n)}-${k}.mp3`), Buffer.from(j.audio_base64, "base64"));
      fs.writeFileSync(path.join(OUT, `${pad(l.n)}-${k}.json`), JSON.stringify({ alignment: j.alignment }));
      console.log(`${pad(l.n)}-${k} ${l.sp} ok`);
      return;
    } catch (e) {
      console.log(`${pad(l.n)}-${k} retry: ${e.cause?.code ?? e.message}`);
      await sleep(2500);
    }
  }
  console.log(`${pad(l.n)}-${k} FAILED`);
}
for (let i = 0; i < jobs.length; i += 3) await Promise.all(jobs.slice(i, i + 3).map(tts)); // plan concurrency limit

// ---- 2) check every take by ear (speech-to-text) ----
if (!process.argv.includes("--no-verify")) {
  const vf = path.join(OUT, "verify.json");
  const cache = fs.existsSync(vf) ? JSON.parse(fs.readFileSync(vf, "utf8")) : {};
  const norm = (s) => s.replace(/\[[^\]]*\]/g, "").replace(/[ً-ْ‌\s.,،؛؟?!…:«»\-"]/g, "").replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[أإآ]/g, "ا");
  const lev = (a, b) => {
    let p = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      const c = [i];
      for (let j = 1; j <= b.length; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      p = c;
    }
    return p[b.length];
  };
  const keys = fs.readdirSync(OUT).filter((f) => /^\d+-\d+\.mp3$/.test(f)).map((f) => f.slice(0, -4)).filter((k) => !cache[k]);
  async function stt(key) {
    for (let a = 0; a < 4; a++) {
      try {
        const form = new FormData();
        form.append("file", new Blob([fs.readFileSync(path.join(OUT, key + ".mp3"))]), key + ".mp3");
        form.append("model_id", "scribe_v2");
        form.append("language_code", lang === "fa" ? "fas" : lang);
        form.append("tag_audio_events", "true");
        const r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", { method: "POST", headers: { ...xi() }, body: form });
        if (!r.ok) throw new Error(r.status + " " + (await r.text()).slice(0, 120));
        const j = await r.json();
        const l = L.find((x) => x.n === +key.split("-")[0]);
        const target = norm(l.check ?? l.fa), heard = norm(j.text);
        const dur = +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path.join(OUT, key + ".mp3")]).toString();
        cache[key] = { score: +(1 - lev(target, heard) / Math.max(target.length, 1)).toFixed(3), heard: j.text, dur: +dur.toFixed(2), events: (j.words || []).filter((w) => w.type === "audio_event").map((w) => w.text) };
        return;
      } catch (e) {
        await sleep(2000);
        if (a === 3) console.log(key, "stt failed", e.message);
      }
    }
  }
  for (let i = 0; i < keys.length; i += 3) {
    await Promise.all(keys.slice(i, i + 3).map(stt));
    fs.writeFileSync(vf, JSON.stringify(cache, null, 1));
  }
  // report: the best take per line, and lines where no take is clean
  for (const l of L) {
    const ks = Object.entries(cache).filter(([k]) => +k.split("-")[0] === l.n).sort((a, b) => b[1].score - a[1].score);
    const best = ks[0];
    const flag = !best || best[1].score < 0.9 || best[1].events?.length ? "  ⚠ listen / rewrite" : "";
    console.log(`${pad(l.n)} ${l.sp} best ${best?.[0] ?? "-"} score ${best?.[1].score ?? "-"}${flag}${best?.[1].events?.length ? " events: " + best[1].events.join(",") : ""}`);
  }
}
