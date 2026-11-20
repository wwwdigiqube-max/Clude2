// one-sentence re-take spliced into chunk 031 ("turned" was heard as "turn")
import fs from "node:fs";
import { xi } from "../../../../tools/lib/eleven.mjs";
const D = "videos/dino-part3/voice/";
const c = JSON.parse(fs.readFileSync(D + "chunks/031.json", "utf8"));
const t = c.text, j = t.indexOf("They turned"), k = t.indexOf("Three words");
const body = { text: "They turned to stone along with it.", model_id: "eleven_multilingual_v2", language_code: "en",
  previous_text: t.slice(0, j).trim(), next_text: t.slice(k),
  voice_settings: { similarity_boost: 0.8, use_speaker_boost: true, ...c.settings } };
const r = await fetch("https://api.elevenlabs.io/v1/text-to-speech/e5WNhrdI30aXpS2RSGm1/with-timestamps?output_format=mp3_44100_192",
  { method: "POST", headers: { ...xi(), "Content-Type": "application/json" }, body: JSON.stringify(body) });
if (!r.ok) { console.log("FAIL", r.status, (await r.text()).slice(0, 200)); process.exit(1); }
const o = await r.json();
fs.writeFileSync(D + "fix/031-turned.mp3", Buffer.from(o.audio_base64, "base64"));
fs.writeFileSync(D + "fix/031-turned.json", JSON.stringify(o.alignment));
console.log("ok", o.alignment.character_end_times_seconds.at(-1).toFixed(2) + "s", r.headers.get("x-character-count") || "");
