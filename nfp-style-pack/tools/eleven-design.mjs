// Design new voices from a text description (ElevenLabs Voice Design) — for characters, without cloning anyone.
//   node --env-file=.env tools/eleven-design.mjs design <cast.json> <outDir>
//       cast.json: [{ "id": "A", "desc": "young anxious man, high nasal voice…", "text": "<100–1000 chars in the target language>" }]
//       → <outDir>/<id>-<k>.mp3 (3 previews each) + <outDir>/previews.json { "<id>-<k>": "<generated_voice_id>" }
//   node --env-file=.env tools/eleven-design.mjs save <outDir> <id-k> "<name>" "<desc>"
//       → saves the chosen preview as a voice in the account and prints its voice_id
import fs from "node:fs";
import path from "node:path";

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) throw new Error("ELEVENLABS_API_KEY missing (put it in .env, run with --env-file=.env)");
const H = { "xi-api-key": KEY, "Content-Type": "application/json" };
const [mode, a, b, c, d] = process.argv.slice(2);

if (mode === "design") {
  const cast = JSON.parse(fs.readFileSync(a, "utf8"));
  fs.mkdirSync(b, { recursive: true });
  const idsPath = path.join(b, "previews.json");
  const ids = fs.existsSync(idsPath) ? JSON.parse(fs.readFileSync(idsPath, "utf8")) : {};
  for (const ch of cast) {
    if (Object.keys(ids).some((k) => k.startsWith(ch.id + "-"))) continue;
    const r = await fetch("https://api.elevenlabs.io/v1/text-to-voice/design", {
      method: "POST",
      headers: H,
      body: JSON.stringify({ voice_description: ch.desc, text: ch.text, model_id: ch.model ?? "eleven_ttv_v3", guidance_scale: ch.guidance ?? 5 }),
    });
    const t = await r.text();
    if (!r.ok) {
      console.log(ch.id, "FAILED", r.status, t.slice(0, 300));
      continue;
    }
    const j = JSON.parse(t);
    (j.previews ?? []).forEach((p, k) => {
      const name = `${ch.id}-${k + 1}`;
      fs.writeFileSync(path.join(b, name + ".mp3"), Buffer.from(p.audio_base_64, "base64"));
      ids[name] = p.generated_voice_id;
      console.log(name, "ok", (p.duration_secs ?? 0).toFixed?.(1) ?? "", "s");
    });
    fs.writeFileSync(idsPath, JSON.stringify(ids, null, 1));
  }
} else if (mode === "save") {
  const ids = JSON.parse(fs.readFileSync(path.join(a, "previews.json"), "utf8"));
  const gid = ids[b];
  if (!gid) throw new Error(`no preview ${b}`);
  const r = await fetch("https://api.elevenlabs.io/v1/text-to-voice", {
    method: "POST",
    headers: H,
    body: JSON.stringify({ voice_name: c, voice_description: d, generated_voice_id: gid }),
  });
  const t = await r.text();
  if (!r.ok) throw new Error(`${r.status} ${t.slice(0, 300)}`);
  console.log(JSON.parse(t).voice_id);
} else {
  console.log("usage: design <cast.json> <outDir> | save <outDir> <id-k> <name> <desc>");
}
