// Studio Desk · demo = the reference film (a 113 s vertical course reel). Shared helpers: word cues, easing, colours,
// fonts, media slots. Everything is a pure function of time t (s).
import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import WORDS from "./words.json";

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const DUR = 113;
export const FRAMES = DUR * FPS;

// ── narration cues (forced alignment of the voice-over; index = word number, see pipeline/direction.md)
type Word = { w: string; s: number; e: number };
export const WD = WORDS as Word[];
export const S = (i: number) => WD[i].s;
export const E = (i: number) => WD[i].e;

// ── maths
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const ramp = (t: number, a: number, b: number) => (b <= a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
export const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b));
export const ease = {
  out: (k: number) => 1 - Math.pow(1 - clamp(k), 3),
  in: (k: number) => Math.pow(clamp(k), 3),
  io: (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  expo: (k: number) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(k))),
  back: (k: number, s = 1.7) => {
    const x = clamp(k) - 1;
    return 1 + (s + 1) * x * x * x + s * x * x;
  },
};
/** 0→1 with a spring overshoot, starting at t0 (stays 0 before) */
export const spring = (t: number, t0: number, d = 0.5, bounce = 0.35) => {
  if (t <= t0) return 0;
  const k = (t - t0) / d;
  return 1 - Math.exp(-5 * k) * Math.cos(k * Math.PI * (1 + bounce * 3)) * (1 - bounce * 0.3);
};
/** pop-in scale 0→1 with overshoot over d seconds, gated on time (ease.back(0) is not exactly 0) */
export const pop = (t: number, t0: number, d = 0.4) => (t < t0 ? 0 : ease.back((t - t0) / d));
/** a short 0→1→0 hit pulse */
export const hit = (t: number, t0: number, d = 0.25) => (t < t0 || t > t0 + d ? 0 : Math.sin(((t - t0) / d) * Math.PI));
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** Latin number with thousands separators */
export const grp = (n: number) => Math.round(n).toLocaleString("en-US");
export const kfmt = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M` : n >= 1e4 ? `${Math.round(n / 1e3)}K` : grp(n));

// ── colours
export const C = {
  desk: "#EFEDE6",
  desk2: "#E6E3DA",
  ink: "#16171A",
  ink2: "#4B4D53",
  ink3: "#8A8C92",
  line: "rgba(22,23,26,0.10)",
  card: "#FFFFFF",
  dark: "#0B0B0D",
  green: "#F25C1F", // accent (orange; the user rejected green)
  neon: "#FF7A3D",
  red: "#C8102E",
  ig: "linear-gradient(45deg,#F9CE34,#EE2A7B,#6228D7)",
  yt: "#FF0033",
};
export const SHADOW = "0 1px 2px rgba(0,0,0,.06), 0 10px 30px rgba(20,20,30,.10), 0 30px 80px rgba(20,20,30,.10)";

// ── fonts (all SIL OFL, in public/fonts). The original film used a commercial Persian display face; Vazirmatn here.
export const FA = "DeskFA"; // Vazirmatn
export const NUM = "Bask"; // Libre Baskerville (variable 400–700)
export const UI = "InterV"; // Inter (variable)
export const MONO = "Chakra";
const FONTS: [string, string, string][] = [
  [FA, "fonts/Vazirmatn-Regular.ttf", "400"],
  [FA, "fonts/Vazirmatn-Bold.ttf", "500 700"],
  [FA, "fonts/Vazirmatn-Black.ttf", "800 900"],
  [NUM, "fonts/LibreBaskerville.ttf", "400 700"],
  [UI, "fonts/Inter.ttf", "100 900"],
  [MONO, "fonts/ChakraPetch-Medium.ttf", "500"],
  [MONO, "fonts/ChakraPetch-SemiBold.ttf", "600"],
];
/** load the fonts once (call inside the composition) */
let fontsP: Promise<unknown> | null = null;
export const useV23Fonts = () => {
  const [h] = useState(() => delayRender("studio-desk fonts"));
  useEffect(() => {
    fontsP ??= Promise.all(FONTS.map(([fam, file, weight]) => new FontFace(fam, `url(${staticFile(file)})`, { weight }).load().then((f) => { document.fonts.add(f); })));
    fontsP.then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
  }, [h]);
};
// ── media slots. The film shows the maker's own footage and screenshots (clips/…, stills/…, a/…, b/…, hook.mp4 …);
// the kit ships none of it. Map each name the film asks for to YOUR file in public/, e.g.
//   MEDIA["clips/man.mp4"] = "v01/clips/my-film.mp4";  MEDIA["stills/s09.jpg"] = "v01/stills/frame.jpg";
// Anything not mapped shows a placeholder (a still card for images, a labelled slot for videos), so the film always
// renders. List of names: grep -o 'v23(`[^`]*`\|v23("[^"]*")\|<Clip src="[^"]*"\|<RClip src="[^"]*"' demo/*.tsx
export const MEDIA: Record<string, string> = {};
const VIDEO_ALIASES = ["hook.mp4", "styles.mp4", "self.mp4"];
/** the film's name for a video → the key in MEDIA (bare names live in clips/) */
export const videoKey = (src: string) => (src.includes("/") || VIDEO_ALIASES.includes(src) ? src : `clips/${src}`);
export const hasMedia = (p: string) => p in MEDIA;
/** an image or video by the film's name: your mapped file, or the placeholder card for images */
export const v23 = (p: string) => staticFile(MEDIA[p] ?? "styles/studio-desk/placeholder.jpg");
