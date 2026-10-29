import { continueRender, delayRender, Easing, staticFile } from "remotion";
import vo from "./vo.json";

// ---------- palette (golden hour → dusk; one accent: blood-orange red) ----------
export const C = {
  amber: "#E39B3B",
  burnt: "#C8612B",
  ochre: "#D9A24E",
  sand: "#E8C58E",
  cream: "#F6E7CC",
  choco: "#3A2418",
  ink: "#1E120C",
  red: "#D9442A",
  water: "#9DB8B4",
};

export const FPS = 30;
export const VW = 1080;
export const VH = 1920;

// ---------- fonts ----------
export const F_HEAD = "PackHead"; // captions, big words — default: the kit font Lalezar (OFL). Your own font: put the .ttf in public/fonts and change the file name below
export const F_TEXT = "PackText"; // labels, cards — default: the kit font Vazirmatn (OFL)
const fontHandle = delayRender("v01 fonts");
Promise.all(
  [
    [F_HEAD, "fonts/Lalezar-Regular.ttf"],
    [F_TEXT, "fonts/Vazirmatn-SemiBold.ttf"],
  ].map(([fam, file]) =>
    new FontFace(fam, `url('${staticFile(file)}') format('truetype')`).load().then((f) => document.fonts.add(f)),
  ),
)
  .then(() => continueRender(fontHandle))
  .catch((e) => {
    console.error("v01 font load failed", e);
    continueRender(fontHandle);
  });

// ---------- math ----------
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const eo = Easing.out(Easing.cubic);
export const eio = Easing.inOut(Easing.cubic);
export const eback = Easing.out(Easing.back(1.8));
/** eased 0→1 progress of an event that starts at a (s) and lasts d (s) */
export const pr = (t: number, a: number, d: number, ease: (x: number) => number = eo) => ease(clamp((t - a) / d));
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const FA = "۰۱۲۳۴۵۶۷۸۹";
export const fa = (s: string | number) => String(s).replace(/\d/g, (d) => FA[+d]);

// ---------- word cues (all times come from vo.json — never guessed) ----------
type Wd = { w: string; s: number; e: number; line: number };
const WORDS = (vo as { words: Wd[] }).words;
const norm = (s: string) => s.replace(/[*،؛.!؟?…:«»]/g, "").trim();
/** start time (s) of the nth occurrence of `word` in narration line `line` */
export const Wd = (line: number, word: string, nth = 1): number => {
  let k = 0;
  for (const w of WORDS) {
    if (w.line === line && norm(w.w) === word && ++k === nth) return w.s;
  }
  throw new Error(`cue not found: line ${line} "${word}" #${nth}`);
};
export const WdEnd = (line: number, word: string, nth = 1): number => {
  let k = 0;
  for (const w of WORDS) {
    if (w.line === line && norm(w.w) === word && ++k === nth) return w.e;
  }
  throw new Error(`cue not found: line ${line} "${word}" #${nth}`);
};
export const VO_TOTAL = (vo as { total: number }).total;

// ---------- camera keys ----------
export type Key = { t: number; x: number; y: number; z: number; ease?: (x: number) => number };
/** interpolate a list of camera keys at time t (holds first/last) */
export const camAt = (keys: Key[], t: number) => {
  if (t <= keys[0].t) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t <= b.t) {
      const p = (b.ease ?? eio)(clamp((t - a.t) / Math.max(1e-6, b.t - a.t)));
      return { t, x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), z: lerp(a.z, b.z, p) };
    }
  }
  return keys[keys.length - 1];
};
/** small organic hand-held shake that decays after t0 */
export const shake = (t: number, t0: number, amp = 14, dur = 0.35) => {
  if (t < t0 || t > t0 + dur) return { x: 0, y: 0 };
  const k = 1 - (t - t0) / dur;
  return { x: Math.sin(t * 91) * amp * k, y: Math.cos(t * 77) * amp * k * 0.8 };
};
