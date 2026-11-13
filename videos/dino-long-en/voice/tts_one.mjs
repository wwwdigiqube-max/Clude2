// One-off TTS with explicit settings. node --env-file=.env tts_one.mjs <out.mp3> <model> <stability> <style> <speed> <textfile> [prevfile] [nextfile]
import fs from "node:fs";
import { xi } from "../../../tools/lib/eleven.mjs";
const [out, model, stab, style, speed, tf, pf, nf] = process.argv.slice(2);
const body = { text: fs.readFileSync(tf, "utf8").trim(), model_id: model, language_code: "en",
  voice_settings: { stability: +stab, similarity_boost: 0.8, style: +style, use_speaker_boost: true, speed: +speed } };
if (model !== "eleven_v3") { if (pf) body.previous_text = fs.readFileSync(pf, "utf8").trim(); if (nf) body.next_text = fs.readFileSync(nf, "utf8").trim(); }
const r = await fetch("https://api.elevenlabs.io/v1/text-to-speech/e5WNhrdI30aXpS2RSGm1/with-timestamps?output_format=mp3_44100_192",
  { method: "POST", headers: { ...xi(), "Content-Type": "application/json" }, body: JSON.stringify(body) });
if (!r.ok) { console.log("FAIL", r.status, (await r.text()).slice(0, 300)); process.exit(1); }
const j = await r.json();
fs.writeFileSync(out, Buffer.from(j.audio_base64, "base64"));
fs.writeFileSync(out.replace(".mp3", ".json"), JSON.stringify({ text: body.text, alignment: j.alignment }));
console.log("ok", out, j.alignment.character_end_times_seconds.at(-1).toFixed(1) + "s");
