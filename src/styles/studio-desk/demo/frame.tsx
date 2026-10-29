// Video 23 · the shared frame: desk background + time context + captions. Scenes go in as children.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Captions } from "./captions";
import { C } from "./lib";
import { Grain, TimeCtx } from "./ui";

const Desk: React.FC<{ frame: number; t: number }> = ({ frame, t }) => (
  <AbsoluteFill style={{ background: C.desk }}>
    <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(22,23,26,.10) 1.6px, transparent 1.7px)", backgroundSize: "34px 34px", backgroundPosition: `${(t * 6) % 34}px ${(t * 3) % 34}px` }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 55%, rgba(120,110,90,.10) 100%)" }} />
    <Grain frame={frame} o={0.09} />
  </AbsoluteFill>
);

export const Frame23: React.FC<{ t: number; frame: number; captions?: boolean; children?: React.ReactNode }> = ({ t, frame, captions = true, children }) => (
  <TimeCtx.Provider value={{ t, frame }}>
    <AbsoluteFill style={{ background: C.desk, overflow: "hidden" }}>
      <Desk frame={frame} t={t} />
      {children}
      {captions && <Captions t={t} />}
    </AbsoluteFill>
  </TimeCtx.Provider>
);
