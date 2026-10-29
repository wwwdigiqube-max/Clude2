// Atomic Age demo timing: every cue is a word of the narration (vo.json, Clyde, tools/doc-build-vo.mjs --tempo 1.08) and
// the captions are the shown words of script.json mapped onto those spoken words (tools/script-prep.mjs → tools/captions.mjs).
import { makeCues, VoJson } from "../../documentary/cues";
import VO from "./vo.json";
import CAPS from "./captions.json";
import type { Chunk } from "../lib/retro";

export const C = makeCues(VO as VoJson);
export const { S, E, W: Wd, WE } = C;
export const FPS = 30;
export const TOTAL = Math.round((VO as VoJson).total * FPS) / FPS;
export const FRAMES = Math.round(TOTAL * FPS);
export const CHUNKS = CAPS as Chunk[];
/** the caption card on screen at t (a newer chunk replaces the older one at once) */
export function chunkAt(t: number) {
  let cur: Chunk | null = null;
  for (const ch of CHUNKS) if (t >= ch.s - 0.12) cur = ch;
  if (!cur) return null;
  // the last card is gone before the loop point (frame 0 has no card)
  const e = cur === CHUNKS[CHUNKS.length - 1] ? Math.min(cur.e, TOTAL - 0.3) : cur.e;
  return t <= e + 0.12 ? { ...cur, e } : null;
}
/** periodic over the whole film, so the last frame flows into the first (the video loops) */
export const loopPhase = (t: number, cycles: number) => (t / TOTAL) * cycles * Math.PI * 2;
/** where each shot starts (from the words of the revised script) */
export const SH = {
  zap: S(2) - 0.15,
  field: S(3) - 0.15,
  control: Wd(3, "از") - 0.06,
  rows: S(4) - 0.15,
  gardener: S(5) - 0.12,
  packet: Wd(5, "بذرِ") - 0.08,
  foods: S(6) - 0.12,
  texas: S(7) - 0.12,
  post: Wd(7, "فرستادن") - 0.12,
  map: Wd(7, "تا") - 0.12,
  result: S(8) - 0.12,
  fruit: Wd(8, "«استار") - 0.3,
  un: S(9) - 0.12,
  compare: S(10) - 0.12,
  loop: E(10) + 0.3,
};
