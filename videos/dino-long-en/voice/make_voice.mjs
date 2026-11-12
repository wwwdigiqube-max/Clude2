// Full EN narration with Ian (multilingual_v2, speed 1.1), chunk by chunk with prosody stitching. Resumable.
// Run: node --env-file=.env videos/dino-long-en/voice/make_voice.mjs [only=NN,NN]
import fs from "node:fs";
import { xi } from "../../../tools/lib/eleven.mjs";
const D = "videos/dino-long-en/voice/";
const VOICE = "e5WNhrdI30aXpS2RSGm1", MODEL = "eleven_multilingual_v2";
const items = JSON.parse(fs.readFileSync(D + "chunks.json", "utf8"));
const texts = items.map((c, i) => ({ ...c, i })).filter(c => c.text);
const only = process.argv[2]?.split(",").map(Number);
for (const [k, c] of texts.entries()) {
  const n = String(c.i).padStart(2, "0"), out = `${D}chunks/${n}.mp3`;
  if (only ? !only.includes(c.i) : fs.existsSync(out)) continue;
  const body = { text: c.text, model_id: MODEL, language_code: "en",
    previous_text: texts[k - 1]?.text, next_text: texts[k + 1]?.text,
    voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true, speed: 1.1 } };
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_192`,
    { method: "POST", headers: { ...xi(), "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) { console.log("FAIL", n, r.status, (await r.text()).slice(0, 200)); process.exit(1); }
  const j = await r.json();
  fs.writeFileSync(out, Buffer.from(j.audio_base64, "base64"));
  fs.writeFileSync(out.replace(".mp3", ".json"), JSON.stringify({ text: c.text, alignment: j.alignment }));
  console.log("ok", n, c.text.length, "chars", j.alignment.character_end_times_seconds.at(-1).toFixed(1) + "s");
}
