// Sound effects from text (ElevenLabs sound generation). Sends only the text prompt.
// Usage: node --env-file=.env tools/eleven-sfx.mjs <list.json> <outDir> [takes=2]
// list.json: [{ "id": "gun", "text": "...", "dur": 1.5, "infl": 0.5 }]
import fs from "node:fs";
import { elevenReady, xi } from "./lib/eleven.mjs";
const [listPath, OUT, takes = "2"] = process.argv.slice(2);
const list = JSON.parse(fs.readFileSync(listPath, "utf8"));
fs.mkdirSync(OUT, { recursive: true });
const H = { ...xi(), "Content-Type": "application/json" };
async function one(s, k) {
  const f = `${OUT}/${s.id}-${k}.mp3`;
  if (fs.existsSync(f)) return;
  for (let a = 0; a < 3; a++) {
    try {
      const r = await fetch("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_192", {
        method: "POST",
        headers: H,
        body: JSON.stringify({ text: s.text, duration_seconds: s.dur, prompt_influence: s.infl ?? 0.45 }),
      });
      if (!r.ok) { console.log(s.id, k, r.status, (await r.text()).slice(0, 200)); return; }
      fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
      console.log(s.id, k, "ok");
      return;
    } catch (e) {
      await new Promise((res) => setTimeout(res, 2000));
      if (a === 2) console.log(s.id, k, "fail", e.cause?.code ?? e.message);
    }
  }
}
const jobs = [];
for (const s of list) for (let k = 1; k <= +takes; k++) jobs.push([s, k]);
for (let i = 0; i < jobs.length; i += 3) await Promise.all(jobs.slice(i, i + 3).map(([s, k]) => one(s, k)));
