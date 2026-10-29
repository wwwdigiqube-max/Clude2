// Video 19 sound: three crossfaded music cues (low under the dialogue, up a little in the pauses), quiet
// ambience beds, and soft effects on the visual events. The user's rule: effects must never cover the voices —
// every effect is level-matched, scaled by SFX_GAIN, and the whole effects bus ducks under the dialogue.
import { E, S, TOTAL, VOJ, W } from "./cues";

/** [file, time the effect's peak should land on, volume, peak offset in the file (s)] */
export type Cue = [string, number, number, number?];
export const VO_GAIN = 1.0;
export const SFX_GAIN = 0.4;
const tPour = W(3, "می‌ریزه") - 0.35;
export const SFX: Cue[] = [
  ["draw", 0.2, 0.5, 0.3],
  ["draw", 2.4, 0.45, 0.3],
  ["chime", W(1, "آسمان"), 0.3],
  ["chime", W(1, "زمین."), 0.25],
  ["seam", W(3, "می‌شکافه") - 0.1, 0.6, 0.0],
  ["pour", tPour + 0.4, 0.65, 1.45],
  ["appear", W(3, "شخصیتِ") + 0.6, 0.35, 1.2],
  ["chime", W(3, "فرشته‌ی") + 0.1, 0.3],
  ["whoosh", S(4) + 0.6, 0.25, 0.35],
  ["chime", W(5, "«فرشته»"), 0.25],
  ["whoosh", S(6) - 0.2, 0.3, 0.35],
  ["whoosh", S(8) + 1.4, 0.4, 0.35],
  ["appear", W(10, "«فرشته‌ی") + 0.9, 0.6, 1.2],
  ["seam", W(10, "«فرشته‌ی") + 0.05, 0.45, 0.0],
  ["pour", W(11, "بهش") + 0.6, 0.45, 1.45],
  ["stars", W(11, "«نسلِ") + 0.6, 0.7, 1.0],
  ["chime", W(12, "«تو") + 0.1, 0.25],
  ["whiteout", E(13) + 0.25, 0.55, 3.3],
  ["whoosh", W(14, "خدا،"), 0.25, 0.35],
  ["drop", W(14, "دیدش") + 0.1, 0.6, 1.0],
  ["appear", W(14, "دیدش") + 0.9, 0.45, 1.2],
  ["chime", W(15, "یَهوه‌ایه"), 0.25],
  ["call", W(16, "جداست،") - 0.3, 0.35, 0.6],
  ["whoosh", W(16, "خیلی") + 0.5, 0.35, 0.35],
  ["pop", W(16, "اشعیا،") + 0.2, 0.45, 0.4],
  ["pop", W(16, "حزقیال") + 0.2, 0.45, 0.4],
  ["pop", W(16, "دانیال،") + 0.2, 0.45, 0.4],
  ["merge", W(16, "چی") - 0.4, 0.45, 0.55],
  ["appear", W(16, "چی") + 1.0, 0.5, 1.2],
  ["whoosh", S(17) + 0.5, 0.3, 0.35],
  ["pop", W(17, "فرشته‌ی") + 0.1, 0.45, 0.4],
  ["merge", W(17, "یه") + 0.3, 0.5, 0.55],
  ["whoosh", S(18) + 0.4, 0.4, 0.35],
  ["fire", W(19, "شعله‌ی") - 0.1, 0.55, 0.5],
  ["call", W(19, "صدا"), 0.6, 0.6],
  ["chime", W(20, "فرشته‌ی") + 0.1, 0.25],
  ["chime", W(20, "یَهوه،", 1) + 0.1, 0.25],
  ["chime", W(20, "خدا.") + 0.1, 0.3],
  ["whoosh", W(20, "بعدتر") + 0.5, 0.35, 0.35],
  ["pop", W(20, "اسرائیل") + 0.15, 0.45, 0.4],
  ["pop", W(20, "خیمه‌ی") + 0.15, 0.45, 0.4],
  ["whoosh", W(21, "خیمه‌ی") + 0.5, 0.35, 0.35],
  ["appear", W(21, "تالارِ") - 0.2, 0.45, 1.2],
  ["pop", S(22) + 0.5, 0.35, 0.4],
  ["pop", S(22) + 0.7, 0.35, 0.4],
  ["pop", S(22) + 0.9, 0.35, 0.4],
  ["merge", W(22, "جلالِ") + 0.2, 0.5, 0.55],
  ["appear", W(22, "جلالِ") + 1.2, 0.55, 1.2],
  ["whoosh", W(22, "حالا") + 0.5, 0.3, 0.35],
  ["pop", W(22, "عیسی.") + 0.25, 0.45, 0.4],
  ["whoosh", W(24, "انجیلِ") - 0.6, 0.3, 0.35],
  ["chime", W(24, "ازل"), 0.4],
  ["merge", W(24, "کلمه", 2) + 0.2, 0.45, 0.55],
  ["appear", W(25, "این") + 0.6, 0.35, 1.2],
  ["whoosh", S(26) + 1.8, 0.25, 0.35],
  ["drop", W(26, "خیمه") + 0.15, 0.55, 1.0],
  ["chime", W(26, "یونانی‌ش"), 0.25],
  ["pop", W(27, "خیمه‌ی") + 0.1, 0.4, 0.4],
  ["whoosh", W(27, "حضورِ") - 0.1, 0.25, 0.35],
  ["whoosh", W(28, "یه") + 0.2, 0.4, 0.35],
  ["flash", W(28, "آشکار"), 0.6, 0.65],
  ["appear", W(28, "صورتش") + 0.3, 0.45, 1.2],
  ["whoosh", S(29) + 0.6, 0.3, 0.35],
  ["pop", W(29, "فرشته‌ی") + 0.1, 0.4, 0.4],
  ["whoosh", S(30) + 0.8, 0.25, 0.35],
  ["strike", W(30, "خداوند».") + 0.5, 0.45, 0.2],
  ["draw", W(32, "فرشته‌ست.") - 0.3, 0.45, 0.3],
  ["merge", W(32, "برتره.") - 0.2, 0.4, 0.55],
  ["whoosh", W(33, "خدایی") - 0.6, 0.4, 0.35],
  ["draw", W(33, "اینکه"), 0.45, 0.3],
  ["merge", W(33, "یک") + 0.6, 0.55, 0.55],
  ["bloom", W(33, "دوباره") + 0.3, 0.8, 0.75],
  ["chime", W(33, "دوباره") + 0.6, 0.35],
];
/** looping ambience beds: [file, start, end, volume] (faded in/out over 2 s) */
export const BEDS: [string, number, number, number][] = [
  ["desert", S(9) - 0.5, E(13) + 0.3, 0.55],
  ["night", S(18) + 0.2, W(20, "بعدتر") + 1.5, 0.5],
  ["night", S(26) + 1.4, W(28, "یه") + 1.0, 0.45],
  ["desert", W(28, "یه"), S(29) + 1.0, 0.35],
];
// music cues: [file, start (s), fade in (s), end (s), fade out (s)]
export const MUSIC: [string, number, number, number, number][] = [
  ["m1", 0, 1.5, S(14) + 2.5, 4],
  ["m2", S(14) - 1.5, 4, S(23) + 2.5, 4],
  ["m3", S(23) - 1.5, 3.5, TOTAL, 4.5],
];
export const MUSIC_BASE = 0.12;
export const MUSIC_LIFT = 0.15;
/** pauses ≥ 1 s between dialogue lines (plus head and tail) where the music comes up */
export const GAPS: [number, number][] = (() => {
  const g: [number, number][] = [[0, VOJ.segs[0].start]];
  for (let i = 0; i + 1 < VOJ.segs.length; i++) {
    const a = VOJ.segs[i].end, b = VOJ.segs[i + 1].start;
    if (b - a >= 1.0) g.push([a, b]);
  }
  g.push([VOJ.segs[VOJ.segs.length - 1].end, TOTAL]);
  return g;
})();
