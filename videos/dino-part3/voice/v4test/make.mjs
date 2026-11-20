// 10-second voice test: the new Part 3 hook, Ian on eleven_v4 with emotion tags (vs. multilingual_v2 in the episode)
import fs from "node:fs";
import { xi } from "../../../../tools/lib/eleven.mjs";
const D = "videos/dino-part3/voice/v4test/";
const text = process.argv[2], name = process.argv[3] || "hook-v4";
const body = { text, model_id: "eleven_v4", language_code: "en" };
const r = await fetch("https://api.elevenlabs.io/v1/text-to-speech/e5WNhrdI30aXpS2RSGm1/with-timestamps?output_format=mp3_44100_192",
  { method: "POST", headers: { ...xi(), "Content-Type": "application/json" }, body: JSON.stringify(body) });
if (!r.ok) { console.log("FAIL", r.status, (await r.text()).slice(0, 300)); process.exit(1); }
const o = await r.json();
fs.writeFileSync(D + name + ".mp3", Buffer.from(o.audio_base64, "base64"));
fs.writeFileSync(D + name + ".json", JSON.stringify({ text, model: "eleven_v4", alignment: o.alignment }));
console.log("ok", name, o.alignment.character_end_times_seconds.at(-1).toFixed(2) + "s");
