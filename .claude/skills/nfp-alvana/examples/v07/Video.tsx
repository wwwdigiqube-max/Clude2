// Video 07 — NPV in Paper × Blueprint · horizontal · user's voice (same alignment as v06).
import React from "react";
import { AbsoluteFill, Html5Audio as Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Timeline } from "../styles/paper-blueprint";
import { END, fr, S, TM } from "../v06/times";
import { TearIn } from "../styles/paper-blueprint";
import { Sc1, Sc2, Sc3, Sc4, Sc5, Sc6, Sc7, Sc8, Sc9, SP } from "./scenes";

export const SHOTS: { C: React.FC<SP>; from: number; world: "paper" | "blue" }[] = [
  { C: Sc1, from: 0, world: "paper" },
  { C: Sc2, from: S(1) - 0.3, world: "blue" },
  { C: Sc3, from: S(2) - 0.3, world: "paper" },
  { C: Sc4, from: S(3) - 0.3, world: "blue" },
  { C: Sc5, from: TM.reached - 0.5, world: "paper" },
  { C: Sc6, from: S(5) - 0.3, world: "blue" },
  { C: Sc7, from: S(6) - 0.4, world: "paper" },
  { C: Sc8, from: S(7) - 0.4, world: "blue" },
  { C: Sc9, from: S(8) - 0.3, world: "paper" },
];
export const V07_FRAMES = fr(END);
const until = (i: number) => (i + 1 < SHOTS.length ? SHOTS[i + 1].from : END);

const CUES: [number, string, number][] = [
  [0.3, "steps", 0.4], [TM.easier, "click", 0.6], [TM.easier + 0.1, "print", 0.4], [TM.problem, "error", 0.5], [TM.problem + 0.2, "paper", 0.5],
  [TM.price + 0.33, "thud", 0.5], [TM.price + 0.5, "thud", 0.45], [TM.subs + 0.4, "thud", 0.45],
  [TM.image - 0.2, "node1", 0.5], [TM.video - 0.2, "node2", 0.5], [TM.audio - 0.2, "node3", 0.5],
  [TM.month, "paper", 0.5], [TM.many - 0.13, "pin", 0.6], [TM.many + 0.13, "pin", 0.6], [TM.separate, "pin", 0.6], [TM.buy, "ticks", 0.35], [TM.renew, "sweep", 0.45],
  [TM.search, "sweep", 0.35], [TM.back, "blip", 0.4], [TM.remove, "glitch", 0.45], [TM.remove + 0.1, "stamp", 0.45],
  [TM.reached + 0.27, "pop", 0.5], [TM.npv, "chime", 0.65],
  [TM.stage - 0.3, "ticks", 0.3], [TM.apart, "error", 0.35], [TM.whole, "pop", 0.45], [TM.together, "match", 0.55],
  [TM.idea - 0.13, "pop", 0.4], [TM.script - 0.13, "pop", 0.4], [TM.shots - 0.13, "pop", 0.4], [TM.sound - 0.13, "pop", 0.4], [TM.edit - 0.13, "pop", 0.4], [TM.output - 0.13, "pop", 0.4], [TM.send, "whoosh", 0.45],
  [TM.complete, "riser", 0.35], [TM.outputs, "match", 0.4], [TM.wow, "chime", 0.45],
  [TM.worry, "hop", 0.5], [TM.make, "chime", 0.55],
];

export const Video07: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Timeline total={V07_FRAMES}>
      {SHOTS.map((s, i) => {
        const tr = i === 0 ? 0 : TR; // incoming shot starts early and tears in over the outgoing one
        const start = fr(s.from) - tr;
        const dur = fr(until(i)) - start;
        return (
          <Sequence key={i} from={start} durationInFrames={dur}>
            <Tear world={s.world} tr={tr} seed={i}>
              <s.C from={s.from - tr / 30} dur={dur} g0={start} />
            </Tear>
          </Sequence>
        );
      })}
    </Timeline>
    <Audio src={staticFile("v06/voice.wav")} volume={1} />
    <Audio src={staticFile("v06/music.wav")} volume={0.2} />
    {CUES.map(([t, n, v], i) => (
      <Sequence key={`c${i}`} from={Math.max(0, fr(t))} layout="none">
        <Audio src={staticFile(`sfx-lib/${n}.wav`)} volume={v} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

const TR = 14;
const Tear: React.FC<{ world: "paper" | "blue"; tr: number; seed: number; children: React.ReactNode }> = ({ world, tr, seed, children }) => {
  const f = useCurrentFrame();
  if (tr === 0) return <>{children}</>;
  const p = Math.min(1, f / tr);
  return <TearIn p={1 - (1 - p) ** 2} world={world} seed={seed}>{children}</TearIn>;
};
