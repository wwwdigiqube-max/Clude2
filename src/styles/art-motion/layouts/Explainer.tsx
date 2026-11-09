// Art Motion · one explainer grammar driven by a JSON spec (see the card: grammars, cue kinds, data), + an optional
// narration/music file. The spec is the whole video: change the words and the times, never the engine.
import React from "react";
import { AbsoluteFill, Html5Audio, staticFile } from "remotion";
import { ClipCanvas } from "../ArtCanvas";
import type { ClipSpec } from "../clip";

export type ExplainerProps = { spec: ClipSpec; audio?: string; t?: number };
export const explainerFrames = (spec: ClipSpec) => Math.round(spec.duration * (spec.fps ?? 30));

export const Explainer: React.FC<ExplainerProps> = ({ spec, audio, t }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {audio && t === undefined && <Html5Audio src={staticFile(audio)} />}
    <ClipCanvas spec={spec} t={t} />
  </AbsoluteFill>
);
