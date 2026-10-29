// Style-independent helpers shared by every style kit.
import { Easing, interpolate } from "remotion";

export const W = 1920;
export const H = 1080;
export const FPS = 30;
export const FONT_MONO = "Consolas, 'Courier New', monospace";

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** 0→1 between frames a and b (eased). */
export const ramp = (f: number, a: number, b: number, ease: (t: number) => number = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

export const easeOut = Easing.out(Easing.cubic);
export const easeBack = Easing.out(Easing.back(1.6));

const FA = "۰۱۲۳۴۵۶۷۸۹";
export const fa = (s: string | number) => String(s).replace(/\d/g, (d) => FA[+d]);
/** Persian digits with Persian thousands separator. */
export const faNum = (n: number) => fa(Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "٬"));
/** mm:ss in Persian digits. */
export const mmss = (s: number) => `${fa(String(Math.floor(s / 60)).padStart(2, "0"))}:${fa(String(Math.floor(s % 60)).padStart(2, "0"))}`;

/** Typewriter: characters revealed from frame `start` at `cps` chars/sec. */
export const typed = (text: string, f: number, start: number, cps = 22) => {
  const n = Math.max(0, Math.floor(((f - start) / FPS) * cps));
  return Array.from(text).slice(0, n).join("");
};

/** Deterministic pseudo-random in [0,1). */
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Scene list → start frames and total length. */
export const timeline = (durs: number[]) => {
  const starts = durs.reduce<number[]>((a, d, i) => [...a, i ? a[i - 1] + durs[i - 1] : 0], []);
  return { starts, total: durs.reduce((s, d) => s + d, 0) };
};
