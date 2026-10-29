// Video 18 sound: three music cues (crossfaded), a music level that rises in the pauses, and a few quiet effects.
// Shared by the composition (preview) and tools/v18-mix.mts (final mix with ffmpeg).
import { E, S, TOTAL, VOJ, W } from "./cues";

// [file, cue time, volume, attack offset (s) — the take's peak lands on the cue]
export type Cue = [string, number, number, number?];
/** fixed narration gain (no dynamic processing on the TTS voice) */
export const VO_GAIN = 2.0;
/** all effects scaled by this */
export const SFX_GAIN = 0.32; // user: effects were covering the narration
export const SFX: Cue[] = [
  ["whoosh", 15.2, 0.35, 0.85],
  ["pulse", S(3) + 0.6, 0.45],
  ["boom", E(5) + 0.35, 0.65, 0.1],
  ["zoomout", W(7, "عقب") + 2.2, 0.5, 1.75],
  ["zoomout", W(9, "باز") + 2.0, 0.4, 1.75],
  ["zoomout", S(10) + 2.4, 0.5, 1.75],
  ["pulse", W(13, "حفره‌ی") + 0.2, 0.35],
  ["zoomout", S(16) + 2.4, 0.45, 1.75],
  ["boom", W(16, "حفره‌ی", 1), 0.35, 0.1],
  ["flyin", S(19) + 0.9, 0.6],
  ["boom", S(20) - 0.4, 0.4, 0.1],
  ["zoomout", W(22, "بیشترِ") - 0.2, 0.45, 1.75],
  ["rewind", W(24, "برگردیم") + 0.4, 0.55, 1.35],
  ["shimmer", W(26, "خوشه‌های"), 0.45],
  ["pulse", W(27, "اخترشناس‌ها"), 0.35],
  ["whoosh", S(28) - 0.25, 0.3, 0.85],
  ["boom", W(34, "انرژیِ"), 0.6, 0.1],
  ["tear", W(36, "پاره"), 0.55, 2.6],
  ["whoosh", S(37), 0.28, 0.85],
  ["pulse", W(37, "لکه‌ی"), 0.4],
  ["zoomout", W(38, "انبساط"), 0.4, 1.75],
  ["boom", W(40, "حفره", 1), 0.55, 0.1],
  ["whoosh", S(41) - 0.3, 0.22, 0.85],
];

// music cues: [file, start (s), fade in (s), end (s), fade out (s)]
export const MUSIC: [string, number, number, number, number][] = [
  ["m1", 0, 1.5, S(16) + 2.5, 4],
  ["m2", S(16) - 1.5, 4, S(34) + 2.5, 4],
  ["m3", S(34) - 1.5, 3.5, TOTAL, 4.5],
];
export const MUSIC_BASE = 0.14; // under the voice (~10 dB below it)
export const MUSIC_LIFT = 0.17; // added in long pauses (still below the voice level)
/** pauses ≥ 1.4 s between narration lines (plus the head and tail) where the music comes up */
export const GAPS: [number, number][] = (() => {
  const g: [number, number][] = [[0, VOJ.segs[0].start]];
  for (let i = 0; i + 1 < VOJ.segs.length; i++) {
    const a = VOJ.segs[i].end, b = VOJ.segs[i + 1].start;
    if (b - a >= 1.4) g.push([a, b]);
  }
  g.push([VOJ.segs[VOJ.segs.length - 1].end, TOTAL]);
  return g;
})();
