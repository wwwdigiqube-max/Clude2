// ElevenLabs TTS with character timestamps.
// Usage: node --env-file=.env tools/eleven-tts.mjs <voiceId> <text.txt> <out.mp3> [model=eleven_v3]
// Writes out.mp3 + out.json (alignment: characters + start/end seconds). Needs HTTPS_PROXY + NODE_USE_ENV_PROXY=1 in Iran.
import fs from "node:fs";
import { elevenReady, xi } from "./lib/eleven.mjs";

const [voice, textFile, out, model = "eleven_v3"] = process.argv.slice(2);
const KEY = process.env.ELEVENLABS_API_KEY;
const text = fs.readFileSync(textFile, "utf8").trim();
const H = { ...xi(), "Content-Type": "application/json" };

const tts = () =>
  fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST",
    headers: H,
    body: JSON.stringify({ text, model_id: model, language_code: "fa", voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true } }),
  });

let r = await tts();
if (!r.ok) {
  const err = await r.text();
  console.log("tts", r.status, err.slice(0, 300));
  process.exit(1);
}
const j = await r.json();
fs.writeFileSync(out, Buffer.from(j.audio_base64, "base64"));
fs.writeFileSync(out.replace(/\.mp3$/, ".json"), JSON.stringify({ text, alignment: j.alignment, normalized: j.normalized_alignment }));
const a = j.alignment;
console.log("ok", out, "chars", a.characters.length, "dur", a.character_end_times_seconds.at(-1).toFixed(2), "s");
