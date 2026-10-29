// Speech-to-text with speakers + word timestamps (ElevenLabs Scribe). Sends audio only.
// Usage: node --env-file=.env tools/eleven-stt.mjs <audio> <out.json> [lang=spa] [speakers]
import fs from "node:fs";
import path from "node:path";
import { elevenReady, xi } from "./lib/eleven.mjs";
const [input, out, lang = "spa", speakers] = process.argv.slice(2);
let last;
for (const model of ["scribe_v2", "scribe_v1"]) {
  const form = new FormData();
  form.append("file", new Blob([fs.readFileSync(input)]), path.basename(input));
  form.append("model_id", model);
  form.append("language_code", lang);
  form.append("diarize", "true");
  if (speakers) form.append("num_speakers", speakers);
  form.append("timestamps_granularity", "word");
  form.append("tag_audio_events", "true");
  const r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", { method: "POST", headers: { ...xi() }, body: form });
  const t = await r.text();
  if (r.ok) { fs.writeFileSync(out, t); console.log(model, "→", out); process.exit(0); }
  last = `${model}: ${r.status} ${t.slice(0, 300)}`;
  console.log(last);
}
process.exit(1);
