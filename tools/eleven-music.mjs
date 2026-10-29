// Music bed from a text prompt (ElevenLabs Music). Sends only the prompt.
// Usage: node --env-file=.env tools/eleven-music.mjs <out.mp3> <seconds> "<prompt>"
import fs from "node:fs";
import { elevenReady, xi } from "./lib/eleven.mjs";
const [out, secs, prompt] = process.argv.slice(2);
const r = await fetch("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192", {
  method: "POST",
  headers: { ...xi(), "Content-Type": "application/json" },
  body: JSON.stringify({ prompt, music_length_ms: Math.round(Number(secs) * 1000), force_instrumental: true }),
});
if (!r.ok) {
  console.log("error", r.status, (await r.text()).slice(0, 400));
  process.exit(1);
}
fs.writeFileSync(out, Buffer.from(await r.arrayBuffer()));
console.log("ok", out);
