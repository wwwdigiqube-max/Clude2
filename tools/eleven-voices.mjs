// List Persian voices from the ElevenLabs voice library. Usage: node --env-file=.env tools/eleven-voices.mjs [gender]
import { elevenReady, xi } from "./lib/eleven.mjs";
const KEY = process.env.ELEVENLABS_API_KEY;
const gender = process.argv[2] ?? "male";
const q = async (params) => {
  const r = await fetch("https://api.elevenlabs.io/v1/shared-voices?" + new URLSearchParams(params), { headers: { ...xi() } });
  const j = await r.json();
  if (!r.ok) { console.log(r.status, JSON.stringify(j).slice(0, 200)); return []; }
  return j.voices ?? [];
};
const seen = new Set();
for (const params of [
  { page_size: "30", language: "fa", gender },
  { page_size: "30", search: "persian", gender },
  { page_size: "30", search: "farsi", gender },
]) {
  for (const v of await q(params)) {
    if (seen.has(v.voice_id)) continue;
    seen.add(v.voice_id);
    console.log([v.voice_id, v.name, v.language, v.accent, v.age, v.use_case, (v.description || "").replace(/\s+/g, " ").slice(0, 80), "uses1y:" + v.usage_character_count_1y, "free:" + (v.free_users_allowed ?? "?"), "owner:" + v.public_owner_id].join(" | "));
  }
}
console.log("total:", seen.size);
