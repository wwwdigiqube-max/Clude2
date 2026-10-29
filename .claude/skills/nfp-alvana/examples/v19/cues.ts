// Timing for video 19: every cue comes from the dialogue (vo.json: line starts/ends, speaker, word onsets).
import VO from "./vo.json";

type VoJson = { total: number; segs: { n: number; sp: string; start: number; end: number }[]; words: { w: string; s: number; e: number; line: number }[] };
export const VOJ = VO as VoJson;
export const FPS = 30;
export const TOTAL = VOJ.total;
export const FRAMES = Math.ceil(TOTAL * FPS);

/** start / end of dialogue line n (1-based) */
export const S = (n: number) => VOJ.segs.find((s) => s.n === n)!.start;
export const E = (n: number) => VOJ.segs.find((s) => s.n === n)!.end;
const clean = (w: string) => w.replace(/[،.؛:«»!؟?…]/g, "").replace(/[ً-ْ]/g, "");
function hit(n: number, txt: string, occ: number) {
  const ws = VOJ.words.filter((w) => w.line === n);
  const want = clean(txt);
  let hits = ws.filter((w) => clean(w.w) === want);
  if (!hits.length) hits = ws.filter((w) => clean(w.w).startsWith(want));
  if (!hits[occ]) throw new Error(`cue word "${txt}" not in line ${n}`);
  return hits[occ];
}
/** onset of a word (exact, else prefix match) inside line n; occ = which occurrence */
export const W = (n: number, txt: string, occ = 0) => hit(n, txt, occ).s;
/** end of a word inside line n */
export const WE = (n: number, txt: string, occ = 0) => hit(n, txt, occ).e;
