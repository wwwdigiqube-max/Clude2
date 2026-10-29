// Video 06 — NPV · horizontal 1920×1080 · user's own voice (aligned) drives every cut.
import React from "react";
import { AbsoluteFill, Html5Audio as Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { PixelCut } from "../styles/pixel-collage";
import { Sc1, Sc10, Sc2, Sc3, Sc4, Sc5, Sc6, Sc7, Sc8, Sc9, SP } from "./scenes";
import { END, fr, S, TM } from "./times";

const SHOTS: { C: React.FC<SP>; from: number }[] = [
  { C: Sc1, from: 0 },
  { C: Sc2, from: TM.price },
  { C: Sc3, from: S(1) },
  { C: Sc4, from: S(2) },
  { C: Sc5, from: S(3) },
  { C: Sc6, from: TM.reached - 0.25 },
  { C: Sc7, from: S(5) },
  { C: Sc8, from: S(6) - 0.2 },
  { C: Sc9, from: TM.send + 0.75 },
  { C: Sc10, from: S(8) },
];
export const V06_FRAMES = fr(END);
const until = (i: number) => (i + 1 < SHOTS.length ? SHOTS[i + 1].from : END);

// [time s, sfx, volume] — sparse, each on a visible event
const CUES: [number, string, number][] = [
  [0.1, "ticks", 0.35], [TM.problem, "glitch", 0.55], [TM.serious, "glitch", 0.6],
  [TM.subs - 0.1, "sweep", 0.55], [TM.subs, "thud", 0.5],
  [TM.image - 0.25, "pop", 0.45], [TM.video - 0.2, "pop", 0.45], [TM.audio - 0.2, "pop", 0.45],
  [S(2), "riser", 0.3], [TM.buy, "thud", 0.55], [TM.renew, "blip", 0.5],
  [S(3), "whoosh", 0.3], [TM.back - 0.3, "pop", 0.4], [TM.remove + 0.2, "pop", 0.5], [TM.remove + 0.3, "glitch", 0.3],
  [TM.npv, "chime", 0.6],
  [TM.stage - 0.3, "ticks", 0.25], [TM.together, "click", 0.6], [TM.together + 0.15, "click", 0.5], [TM.together + 0.3, "match", 0.45],
  [TM.idea - 0.1, "pop", 0.35], [TM.script - 0.1, "pop", 0.35], [TM.shots - 0.1, "pop", 0.35], [TM.sound - 0.1, "pop", 0.35], [TM.edit - 0.1, "pop", 0.35], [TM.output - 0.1, "pop", 0.35],
  [TM.send, "whoosh", 0.45],
  [TM.complete, "sweep", 0.35], [TM.wow - 0.1, "sweep", 0.4],
  [TM.make - 0.1, "chime", 0.55],
];

export const Video06: React.FC = () => (
  <AbsoluteFill style={{ background: "#131115" }}>
    {SHOTS.map((s, i) => {
      const dur = fr(until(i)) - fr(s.from);
      return (
        <Sequence key={i} from={fr(s.from)} durationInFrames={dur}>
          <s.C from={s.from} dur={dur} />
        </Sequence>
      );
    })}
    <Cuts />
    <Audio src={staticFile("v06/voice.wav")} volume={1} />
    <Audio src={staticFile("v06/music.wav")} volume={0.2} />
    {CUES.map(([t, n, v], i) => (
      <Sequence key={`c${i}`} from={Math.max(0, fr(t))} layout="none">
        <Audio src={staticFile(`sfx-lib/${n}.wav`)} volume={v} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

/** Pixel-block cuts between shots (ref transition), except where a shot already morphs into the next. */
const MORPHS = new Set([1, 6]); // Sc2 grows out of Sc1's image; Sc7 continues Sc6's emblem tile
const Cuts: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {SHOTS.slice(1).map((s, i) => (MORPHS.has(i + 1) ? null : <PixelCut key={i} f={f} cut={fr(s.from)} seed={i + 2} />))}
    </>
  );
};
