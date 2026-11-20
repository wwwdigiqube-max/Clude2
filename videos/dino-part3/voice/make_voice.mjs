// Part 2 narration: Ian (multilingual_v2), one chunk per paragraph, prosody stitching, settings per mood. Resumable.
// Run from repo root: node --env-file=.env videos/dino-part3/voice/make_voice.mjs [only=58,60,62]
import fs from "node:fs";
import { xi } from "../../../tools/lib/eleven.mjs";
const D = "videos/dino-part3/voice/";
const VOICE = "e5WNhrdI30aXpS2RSGm1", MODEL = "eleven_multilingual_v2";
const SET = { story: { stability: 0.3, style: 0.6, speed: 1.1 },   // settings A, a bit faster
              tense: { stability: 0.25, style: 0.7, speed: 1.13 },  // urgent, more energy
              sad:   { stability: 0.4, style: 0.7, speed: 1.02 } }; // softer, a touch slower
const items = JSON.parse(fs.readFileSync(D + "chunks.json", "utf8"));
const texts = items.map((c, i) => ({ ...c, i })).filter(c => c.text);
const only = process.argv[2]?.split(",").map(Number);
fs.mkdirSync(D + "chunks", { recursive: true });
for (const [k, c] of texts.entries()) {
  const n = String(c.i).padStart(3, "0"), out = `${D}chunks/${n}.mp3`;
  if (only ? !only.includes(c.i) : fs.existsSync(out)) continue;
  const s = SET[c.mood];
  const body = { text: c.text, model_id: MODEL, language_code: "en",
    previous_text: texts[k - 1]?.text, next_text: texts[k + 1]?.text,
    voice_settings: { similarity_boost: 0.8, use_speaker_boost: true, ...s } };
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_192`,
    { method: "POST", headers: { ...xi(), "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) { console.log("FAIL", n, r.status, (await r.text()).slice(0, 200)); process.exit(1); }
  const j = await r.json();
  fs.writeFileSync(out, Buffer.from(j.audio_base64, "base64"));
  fs.writeFileSync(out.replace(".mp3", ".json"), JSON.stringify({ text: c.text, mood: c.mood, settings: s, alignment: j.alignment }));
  console.log("ok", n, c.mood, c.text.length, "chars", j.alignment.character_end_times_seconds.at(-1).toFixed(1) + "s");
}
