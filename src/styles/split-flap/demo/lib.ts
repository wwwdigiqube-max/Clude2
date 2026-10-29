// Split-flap · demo «24 HRS» — a countdown teaser (1920×1080 or 3840×2160, 16.5 s) on a 3D split-flap board.
// Everything is a pure function of the time t (seconds). The music (pipeline/music-plan.json, trimmed so its first kick
// lands at 0.10) runs at 120 BPM with a kick on every beat: · 7.56 a stop · 8.1 drop · 14.1 final hit · ring-out to 16.5.
// For your song: set BEAT and the hit times from tools/beat-map.mjs, then move the program's moves onto them.
import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const DUR = 16.5;
export const FRAMES = DUR * FPS;

export const BEAT = 0.5;
export const DROP = 8.1;
export const FINAL = 14.1;
export const LAST_TICK = 15.95;

export const COL = {
  card: "#121212",
  cardHi: "#1b1b1b",
  cream: "#EFE4CF",
  red: "#B14130",
  redHot: "#E0573E",
  ink: "#0B0B0D",
};

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const ramp = (t: number, a: number, b: number) => (b <= a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
export const ease = {
  out: (k: number) => 1 - (1 - k) ** 3,
  in: (k: number) => k ** 3,
  io: (k: number) => (k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2),
  expo: (k: number) => (k >= 1 ? 1 : 1 - 2 ** (-10 * k)),
  sine: (k: number) => 0.5 - 0.5 * Math.cos(Math.PI * k),
};
export const hit = (t: number, at: number, tau = 0.1) => (t < at ? 0 : Math.exp(-(t - at) / tau));
/** deterministic noise 0..1 */
export const rnd = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export const GLYPH_FONT = "Anton";
const FONTS: [string, string][] = [
  ["Anton", "fonts/Anton-Regular.ttf"],
  ["Bebas", "fonts/BebasNeue-Regular.ttf"],
];
let fontsP: Promise<unknown> | null = null;
/** resolves once the glyph fonts are in document.fonts (the flap atlas is drawn on a canvas) */
export const useFlapFonts = () => {
  const [ready, setReady] = useState(false);
  const [h] = useState(() => delayRender("split-flap fonts"));
  useEffect(() => {
    fontsP ??= Promise.all(FONTS.map(([fam, file]) => new FontFace(fam, `url(${staticFile(file)})`).load().then((f) => { document.fonts.add(f); })));
    fontsP.then(() => { setReady(true); continueRender(h); }).catch((e) => { console.error(e); setReady(true); continueRender(h); });
  }, [h]);
  return ready;
};
