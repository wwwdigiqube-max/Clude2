// Timing for video 18: every cue comes from the narration (vo.json: line starts/ends and word onsets).
import VO from "./vo.json";

type VoJson = { total: number; segs: { n: number; start: number; end: number }[]; words: { w: string; s: number; e: number; line: number }[] };
export const VOJ = VO as VoJson;
export const FPS = 30;
export const TOTAL = VOJ.total;
export const FRAMES = Math.ceil(TOTAL * FPS);

/** start / end of narration line n (1-based) */
export const S = (n: number) => VOJ.segs.find((s) => s.n === n)!.start;
export const E = (n: number) => VOJ.segs.find((s) => s.n === n)!.end;
const clean = (w: string) => w.replace(/[،.؛:«»!؟?…]/g, "");
/** onset of a word (exact, else prefix match) inside line n; occ = which occurrence */
export function W(n: number, txt: string, occ = 0) {
  const ws = VOJ.words.filter((w) => w.line === n);
  let hits = ws.filter((w) => clean(w.w) === txt);
  if (!hits.length) hits = ws.filter((w) => clean(w.w).startsWith(txt));
  if (!hits[occ]) throw new Error(`cue word "${txt}" not in line ${n}`);
  return hits[occ].s;
}
/** end of a word inside line n */
export function WE(n: number, txt: string, occ = 0) {
  const ws = VOJ.words.filter((w) => w.line === n);
  let hits = ws.filter((w) => clean(w.w) === txt);
  if (!hits.length) hits = ws.filter((w) => clean(w.w).startsWith(txt));
  if (!hits[occ]) throw new Error(`cue word "${txt}" not in line ${n}`);
  return hits[occ].e;
}
