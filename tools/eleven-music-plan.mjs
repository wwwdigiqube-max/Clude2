// Music with an exact structure (ElevenLabs Music composition plan): every section has its own styles and a
// duration in ms, so drops, stops and hits land where the picture needs them. Sends only the plan.
// plan.json: { "positive_global_styles": [...], "negative_global_styles": [...],
//              "sections": [{ "section_name": "Intro", "positive_local_styles": [...], "negative_local_styles": [...], "duration_ms": 9600, "lines": [] }, …] }
// Usage: node --env-file=.env tools/eleven-music-plan.mjs <plan.json> <out.mp3> [seed]
import fs from "node:fs";
import { elevenReady, xi } from "./lib/eleven.mjs";
const [planPath, out, seed] = process.argv.slice(2);
const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
const body = { composition_plan: plan, ...(seed ? { seed: Number(seed) } : {}) };
const r = await fetch("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192", {
  method: "POST",
  headers: { ...xi(), "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
if (!r.ok) {
  console.log("error", r.status, (await r.text()).slice(0, 600));
  process.exit(1);
}
fs.writeFileSync(out, Buffer.from(await r.arrayBuffer()));
console.log("ok", out, plan.sections.map((s) => `${s.section_name}:${s.duration_ms}`).join(" "));
