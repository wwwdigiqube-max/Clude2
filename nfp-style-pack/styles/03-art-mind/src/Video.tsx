import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { ArtFilmCanvas, ART } from "../styles/art-motion";
import beats from "./beats.json";

// ================= V03 «ذهنی که آروم نمی‌گیره» — the same reel in three painting styles =================
// Each style = one engine scene file: public/styles/art-motion/engine/scenes/u03_<style>.js, which registers
//   SCENES['u03_<style>']        the wide shot  (character on the edge of the bed, the thought-swirl grows)
//   SCENES['u03_<style>_close']  the close-up   (hands clutch the head, peak, release)
// drawn on a PORTRAIT stage (1080×1920). Every time comes from the reference film (U03 below), read by the scenes
// as window.U03 — scenes never invent their own times.

export const FPS03 = 30;
export const END03 = 17.6; // = the reference (its song is 17.6 s)
export const FRAMES03 = Math.round(END03 * FPS03);

const BARS = (beats as { bars: number[] }).bars;
export const U03 = {
  END: END03,
  TR_START: 5.87, //        music bar: the signature transition starts here …
  CUT: 6.067, //            … and is centred on the reference's cut (wide → close)
  TR_DUR: 0.45,
  swirlStart: 0.45, //      first scribble strand appears (first downbeat 0.44)
  eyesWide: 4.2, //         eyes widen, alarmed (wide shot)
  handsUp: [6.2, 6.65], //  close-up: the hands rise and grip the head
  squeeze: 6.6, //          eyes squeezed shut
  slits: [7.0, 9.6], //     pained, half-open glowing slits
  peak: [10.0, 12.5], //    knotted brows, clenched teeth, trembling — the storm at its height
  ease: [12.6, 14.0], //    relaxing, eyes closed
  handsDown: [14.1, 14.6], // hands slide down to the chest
  eyesOpen: 14.7, //        eyes open wide, small "o" mouth
  fade: [14.7, 17.6], //    the swirl shrinks and thins, orbiting rings drift away
  rings: [6.5, 17.6], //    small ring-shaped thoughts orbit the head
  hits: [7.5, 10.5, 13.0], // strongest music onsets (13.0 is the biggest)
  bars: BARS, //            downbeats: 0.44 1.80 3.15 4.51 5.87 7.24 8.62 9.98 11.32 12.68 14.00 15.34 16.69
  beats: (beats as { beats: number[] }).beats,
};
if (typeof window !== "undefined") (window as unknown as { U03: typeof U03 }).U03 = U03;

export const STYLES03 = {
  munch: { scene: "u03_munch", transition: "screamWarp", title: "اکسپرسیونیسم (مونک)" },
  rembrandt: { scene: "u03_rembrandt", transition: "chiaroscuro", title: "رامبرانت، نور و سایه" },
  renaissance: { scene: "u03_renaissance", transition: "godRays", title: "رنسانس (اسفوماتو)" },
} as const;
export type Style03 = keyof typeof STYLES03;

const segsOf = (s: Style03) => [
  { id: STYLES03[s].scene, dur: U03.TR_START },
  { id: `${STYLES03[s].scene}_close`, dur: END03 - U03.TR_START + 2, transition: { type: STYLES03[s].transition, dur: U03.TR_DUR } },
];

/** the film. `times` (s) turns it into a stills sheet (-Look) */
export const Video03: React.FC<{ style: Style03; times?: number[]; withAudio?: boolean }> = ({ style, times, withAudio }) => {
  ART.labels = "off";
  const fr = useCurrentFrame();
  const t = times ? times[Math.min(fr, times.length - 1)] : fr / FPS03;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <ArtFilmCanvas segs={segsOf(style)} t={t} width={1080} height={1920} />
      {withAudio && !times && <Audio src={staticFile("v03/song.wav")} />}
    </AbsoluteFill>
  );
};

export const LOOK03 = [0.3, 1.5, 3.0, 4.6, 5.7, 6.05, 6.5, 7.6, 9.0, 10.8, 12.0, 13.2, 14.35, 15.0, 16.2, 17.4];
