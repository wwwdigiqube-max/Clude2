// Light Logo · demo = the reference film (an AI-course intro, 15 s, 16:9): constants, the song's beat grid, easing.
// Everything is a pure function of the time t (seconds). beats.json = tools/beat-map.mjs on the film's song.
import BEATMAP from "./beats.json";

export const FPS = 30;
export const W = 1920;
export const H = 1080;
/** the cut line: the logo's horizontal split line sits on the screen's middle */
export const LY = 540;

export const C = {
  ink: "#0B0B0D",
  cream: "#F0E5D2",
  red: "#B14130", // the brand accent (the only one)
  line: "#F6EEDF",
};

export const BEATS: number[] = BEATMAP.beats;
export const KICKS: number[] = BEATMAP.kicks;
export const SNARES: number[] = BEATMAP.snares;

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** 0 → 1 between a and b (a step when b ≤ a) */
export const ramp = (t: number, a: number, b: number) => (b <= a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
export const ease = {
  out: (k: number) => 1 - (1 - k) ** 3,
  in: (k: number) => k ** 3,
  io: (k: number) => (k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2),
  expo: (k: number) => (k >= 1 ? 1 : 1 - 2 ** (-10 * k)),
};
/** a decaying hit: 1 at `at`, falling with time constant `tau` (0 before) */
export const hit = (t: number, at: number, tau = 0.1) => (t < at ? 0 : Math.exp(-(t - at) / tau));
