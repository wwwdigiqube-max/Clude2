// Remove music/noise from a voice track (ElevenLabs Voice Isolator).
// Usage: node --env-file=.env tools/eleven-isolate.mjs <in.wav|mp3> <out.mp3>
import fs from "node:fs";
import path from "node:path";
import { elevenReady, xi } from "./lib/eleven.mjs";
const [input, out] = process.argv.slice(2);
const form = new FormData();
form.append("audio", new Blob([fs.readFileSync(input)]), path.basename(input));
const r = await fetch("https://api.elevenlabs.io/v1/audio-isolation", { method: "POST", headers: { ...xi() }, body: form });
if (!r.ok) { console.log(r.status, (await r.text()).slice(0, 300)); process.exit(1); }
fs.writeFileSync(out, Buffer.from(await r.arrayBuffer()));
console.log("→", out);
