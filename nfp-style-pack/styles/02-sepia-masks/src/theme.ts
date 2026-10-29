import { continueRender, delayRender, Easing, staticFile } from "remotion";

// ================= V02 «بازی» — sepia old-film look =================
// One family of colours: bone-white masks, ink-black silhouettes, amber light, sepia fog.
// The only accent is EMBER (glowing eyes, the hourglass sand, danger). Never add other hues.
export const P = {
  bone: "#F2E6CF", // masks, light cores
  boneShade: "#D9C7A6", // shaded side of a mask
  amber: "#C98B3A", // light cones, warm highlights
  amberHi: "#F3C77A", // brightest light
  sepia: "#6B4A2B", // fog, walls in light
  fog: "#3A2716", // dark fog, walls in shadow
  floor: "#4A3420", // lit floor
  ink: "#120B07", // silhouettes, outlines, black frames
  ember: "#E8892B", // glowing eyes / sand (accent)
  emberHot: "#FFD08A", // core of a glow
};

export const FPS = 24;
export const W = 1080;
export const H = 1920;

// fonts (same as style 01)
export const F_HEAD = "PackHead"; // captions, big words — default: the kit font Lalezar (OFL). Your own font: put the .ttf in public/fonts and change the file name below
export const F_TEXT = "PackText"; // labels, cards — default: the kit font Vazirmatn (OFL)
const fontHandle = delayRender("v02 fonts");
Promise.all(
  [
    [F_HEAD, "fonts/Lalezar-Regular.ttf"],
    [F_TEXT, "fonts/Vazirmatn-SemiBold.ttf"],
  ].map(([fam, file]) => new FontFace(fam, `url('${staticFile(file)}') format('truetype')`).load().then((f) => document.fonts.add(f))),
)
  .then(() => continueRender(fontHandle))
  .catch((e) => {
    console.error("v02 font load failed", e);
    continueRender(fontHandle);
  });

// ---------- math (every frame must be a pure function of time: never Math.random / timers) ----------
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const eo = Easing.out(Easing.cubic);
export const eio = Easing.inOut(Easing.cubic);
export const eback = Easing.out(Easing.back(1.6));
/** eased 0→1 progress of an event starting at a (s) lasting d (s) */
export const pr = (t: number, a: number, d: number, ease: (x: number) => number = eo) => ease(clamp((t - a) / Math.max(1e-6, d)));
/** deterministic pseudo-random in [0,1) */
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** hand-made "boil": a value that changes every `hold` frames (12 fps look on 24 fps) */
export const boil = (f: number, seed: number, amp = 1, hold = 2) => (rnd(Math.floor(f / hold) * 13.37 + seed) - 0.5) * 2 * amp;
/** slow organic drift */
export const drift = (t: number, seed: number, amp = 1, speed = 0.4) => Math.sin(t * speed + seed * 1.7) * amp * 0.6 + Math.sin(t * speed * 2.3 + seed) * amp * 0.4;
