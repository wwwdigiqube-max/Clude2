// Hologram HUD demo timing: every cue is a word of the narration (vo.json, Clyde ×1.17); captions map the shown words of
// script.json onto the spoken ones (tools/script-prep.mjs → tools/captions.mjs).
import { makeCues, VoJson } from "../../documentary/cues";
import VO from "./vo.json";
import CAPS from "./captions.json";
import type { Chunk } from "../lib/holo";

export const C = makeCues(VO as VoJson);
export const { S, E, W: Wd, WE } = C;
export const FPS = 30;
export const TOTAL = Math.round((VO as VoJson).total * FPS) / FPS;
export const FRAMES = Math.round(TOTAL * FPS);
export const CHUNKS = CAPS as Chunk[];
export function chunkAt(t: number) {
  let cur: Chunk | null = null;
  for (const ch of CHUNKS) if (t >= ch.s - 0.1) cur = ch;
  if (!cur) return null;
  const e = cur === CHUNKS[CHUNKS.length - 1] ? Math.min(cur.e, TOTAL - 0.15) : cur.e;
  return t <= e + 0.12 ? { ...cur, e } : null;
}
/** where each shot starts (v2: lines 5–7 and 8 are split so every idea gets its own animation) */
export const SH = {
  phone: S(2) - 0.1,
  earth: S(3) - 0.1,
  clocks: S(4) - 0.1,
  speed: S(5) - 0.1,
  gravity: S(6) - 0.1,
  net: S(7) - 0.1,
  light: S(8) - 0.1,
  map: Wd(8, "روزی") - 0.2,
  y1977: S(9) - 0.1,
  testsat: S(10) - 0.1,
  proof: S(11) - 0.1,
  fix: S(12) - 0.1,
  back: Wd(12, "عمداً") - 0.35,
};
