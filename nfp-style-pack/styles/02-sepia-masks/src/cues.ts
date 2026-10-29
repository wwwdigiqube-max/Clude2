import mouthData from "./mouth.json";
import vo from "./vo.json";
import { clamp, FPS } from "./theme";

// ================= every time in the film comes from the dialogue (vo.json) — never type a number of seconds =================
type Wd = { w: string; s: number; e: number; line: number };
type Seg = { n: number; sp: string; start: number; end: number };
const WORDS = (vo as { words: Wd[] }).words;
const SEGS = (vo as { segs: Seg[] }).segs;
const norm = (s: string) => s.replace(/[*،؛.!؟?…:«»]/g, "").trim();

/** start (s) of dialogue line n */
export const S = (n: number) => SEGS.find((s) => s.n === n)!.start;
/** end (s) of dialogue line n */
export const E = (n: number) => SEGS.find((s) => s.n === n)!.end;
/** start (s) of the nth occurrence of `word` in line `line` (punctuation ignored) */
export const W = (line: number, word: string, nth = 1): number => {
  let k = 0;
  for (const w of WORDS) if (w.line === line && norm(w.w) === norm(word) && ++k === nth) return w.s;
  throw new Error(`cue not found: line ${line} «${word}» #${nth}`);
};
/** end (s) of that word */
export const WE = (line: number, word: string, nth = 1): number => {
  let k = 0;
  for (const w of WORDS) if (w.line === line && norm(w.w) === norm(word) && ++k === nth) return w.e;
  throw new Error(`cue not found: line ${line} «${word}» #${nth}`);
};

// ================= scenes (cut points follow the reference film's rhythm, anchored to our dialogue) =================
export const SC = {
  maskA: 0, //                         A close-up: «چرا هیچی نمی‌گی؟ الو؟ اصلاً اینجایی؟»
  room: S(2) + 0.1, //                 vast room, the quiet one slumped by the wall; B: «ولش کن بابا…»; C wakes: «چی بگم؟»
  table: S(4) - 0.05, //               two players at the hourglass table under the clock-eye; C (v.o.): «هر دوتون… بُردن… یا نباختن؟»
  twoMasks: S(6) - 0.06, //            A and B masks side by side: «بُردن!» / «نباختن.»
  black1: S(8) + 0.07, //              black: «فرقی نمی‌کنه.»
  hourglass: S(9) - 0.38, //           the quiet one revealed: giant hourglass creature, cards swirl, it FLIPS on «عوض»
  hourglassClose: S(10) + 0.02, //     close on its glowing face: «اونم وقتی قانون‌ها رو یکی دیگه می‌نویسه…»
  black2: W(10, "هوم") - 0.3, //       black: «هوم؟»
  hands: S(11) - 1.1, //               light triangle on the floor, long arms reaching in: «حالا… بذارین یه قصه براتون تعریف کنم.»
  static: E(11) + 0.08, //             TV static → end
};
export const END = Math.max((vo as { total: number }).total, SC.static + 0.55);
export const FRAMES = Math.ceil(END * FPS);
export type SceneId = keyof typeof SC;
export const SCENE_ORDER: SceneId[] = ["maskA", "room", "table", "twoMasks", "black1", "hourglass", "hourglassClose", "black2", "hands", "static"];
export const sceneEnd = (id: SceneId) => {
  const i = SCENE_ORDER.indexOf(id);
  return i + 1 < SCENE_ORDER.length ? SC[SCENE_ORDER[i + 1]] : END;
};

// ================= lip sync =================
const ENV = (mouthData as { fps: number; env: number[] }).env;
/** is speaker sp ("A" | "B" | "C") talking at time t */
export const speaking = (sp: string, t: number) => SEGS.some((s) => s.sp === sp && t >= s.start - 0.04 && t <= s.end + 0.04);
/** mouth openness 0..1 for speaker sp at time t (0 when someone else talks) */
export const mouth = (sp: string, t: number) => {
  if (!speaking(sp, t)) return 0;
  const i = Math.floor(t * FPS);
  const v = ENV[i] ?? 0;
  const v2 = ENV[i - 1] ?? v;
  return clamp(v * 0.7 + v2 * 0.3);
};
