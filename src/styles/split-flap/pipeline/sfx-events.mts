// Split-flap · every moment a flap lands, from the same program the picture uses → events for build-audio.cjs.
// So every visible landing gets its click, exactly on its frame, and changing the program changes the sound with it.
// Usage (project root): npx tsx src/styles/split-flap/pipeline/sfx-events.mts <out.json>
import fs from "node:fs";
import { DUR } from "../demo/lib";
import { CHARS, buildProgram, unitState } from "../demo/program";

const out = process.argv[2] ?? "out/flap-events.json";
const prog = buildProgram((ch: string) => CHARS.indexOf(ch));
const DT = 1 / 240;
const ev: { t: number; kind: "hero" | "pixel" | "wide"; x: number }[] = [];
for (const u of prog.units) {
  let prev = 1;
  for (let t = 0; t < DUR; t += DT) {
    const p = unitState(u, t).p;
    if (prev < 1 && p >= 1) ev.push({ t: +t.toFixed(4), kind: u.hero >= 0 ? "hero" : "pixel", x: u.x });
    prev = p;
  }
}
let prevW = 1;
for (let t = 0; t < DUR; t += DT) {
  const p = prog.wideState(t).p;
  if (prevW < 1 && p >= 1) ev.push({ t: +t.toFixed(4), kind: "wide", x: 0 });
  prevW = p;
}
ev.sort((a, b) => a.t - b.t);
fs.mkdirSync(out.replace(/[\/][^\/]*$/, "") || ".", { recursive: true });
fs.writeFileSync(out, JSON.stringify(ev));
const count = (k: string) => ev.filter((e) => e.kind === k).length;
console.log(`landings: hero ${count("hero")} · pixel ${count("pixel")} · wide ${count("wide")} → ${out}`);
