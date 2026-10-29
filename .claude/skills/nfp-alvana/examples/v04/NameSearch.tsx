import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { S1, S2, S3, S4, S5 } from "./scenes1";
import { S6, S7, S8, S9, S10 } from "./scenes2";
import { Timeline } from "../styles/paper-blueprint/shot";
import { Soundtrack } from "./sound";

// Paper (real world) and Blueprint (how the AI sees) alternate on hard cuts.
export const SCENES: [React.FC<{ g0: number; dur: number }>, number][] = [
  [S1, 135], [S2, 120], [S3, 120], [S4, 150], [S5, 165],
  [S6, 150], [S7, 120], [S8, 150], [S9, 135], [S10, 165],
];
export const STARTS = SCENES.reduce<number[]>((a, [, d], i) => [...a, i ? a[i - 1] + SCENES[i - 1][1] : 0], []);
export const DURATION = SCENES.reduce((s, [, d]) => s + d, 0);

export const NameSearch: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Timeline total={DURATION}>
    <Series>
      {SCENES.map(([C, d], i) => (
        <Series.Sequence key={i} durationInFrames={d}>
          <C g0={STARTS[i]} dur={d} />
        </Series.Sequence>
      ))}
    </Series>
    </Timeline>
    <Soundtrack />
  </AbsoluteFill>
);
