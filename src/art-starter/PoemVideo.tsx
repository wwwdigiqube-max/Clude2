// Starter · «شعر روی نقاشی» (Art Motion, NFP-Alvana v2): a verse in Nastaliq over one moving painting (vertical).
// Copy: cp src/art-starter/PoemVideo.tsx src/v01/Video.tsx → edit POEM only → in Root.tsx: <V01 />
import React from "react";
import { Composition } from "remotion";
import { Poem, lookOf, type PoemProps } from "../styles/art-motion";

export const POEM: PoemProps = {
  style: "art-persian", // any art-… id; the crop follows the style's subject (or give pan: [from, to])
  lines: ["دیدار می‌نمایی و پرهیز می‌کنی", "بازار خویش و آتش ما تیز می‌کنی"],
  poet: "سعدی",
  // at: [0.8, 3.4],   // when each hemistich appears (from the recitation's vo.json)
  duration: 8,
};

export const V01: React.FC = () => (
  <>
    <Composition id="V01" component={Poem} durationInFrames={Math.round((POEM.duration ?? 8) * 30)} fps={30} width={1080} height={1920} defaultProps={POEM} />
    <Composition
      id="V01-Look"
      component={lookOf(Poem, POEM)}
      durationInFrames={1}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ times: [0.4, 2, 4.5, 7.5] }}
      calculateMetadata={({ props }) => ({ durationInFrames: props.times.length })}
    />
  </>
);
