// Starter · an explainer grammar (Art Motion, NFP-Alvana v2): the whole video is one JSON spec.
// Copy: cp src/art-starter/ExplainerVideo.tsx src/v01/Video.tsx → edit SPEC only → in Root.tsx: <V01 />
// Grammars and their cue kinds: styles/art-motion.md §5. Ready specs to start from: SPEC_* in src/styles/art-motion/demo/specs.ts.
// Put every cue on the word it belongs to: at = that word's time in vo.json (Wd helper below).
import React from "react";
import { Composition } from "remotion";
import { Explainer, explainerFrames, lookOf, type ClipSpec } from "../styles/art-motion";
// import vo from "./vo.json";
// const Wd = (line: number, word: string) => vo.words.find((w) => w.line === line && w.w.includes(word))!.s;

export const SPEC: ClipSpec = {
  grammar: "y5_kinetic_type", // y1_kurzgesagt · y2_vox · y3_whiteboard · y4_storytime · y5_kinetic_type · t1_3b1b · t2_keynote_ui · t3_finance_chart · fa_calligraphy
  duration: 8,
  fps: 30,
  width: 1080,
  height: 1920,
  safe: { top: 120, bottom: 330 }, // keep Instagram's UI area free
  theme: "poster", // paper · poster · ink · navy · bauhaus · snow · wood · chalk
  cues: [
    { at: 0.7, kind: "number", text: "ساعت صرفه‌جویی در هفته", data: { value: 12, suffix: " ساعت" } },
    { at: 2.6, kind: "point", text: "قبلاً", sub: "هر ویدیو از صفر ساخته می‌شد", data: { label: "01", key: "از صفر" } },
    { at: 4.6, kind: "point", text: "حالا", sub: "یک سبک انتخاب کن و بساز", data: { label: "02", key: "انتخاب کن" } },
    { at: 6.4, kind: "highlight", data: { word: "حالا" } },
  ],
};

export const V01: React.FC = () => (
  <>
    <Composition id="V01" component={Explainer} durationInFrames={explainerFrames(SPEC)} fps={30} width={SPEC.width!} height={SPEC.height!} defaultProps={{ spec: SPEC /* , audio: "v01/mix.wav" */ }} />
    <Composition
      id="V01-Look"
      component={lookOf(Explainer, { spec: SPEC })}
      durationInFrames={1}
      fps={30}
      width={SPEC.width!}
      height={SPEC.height!}
      defaultProps={{ times: [0.4, 1.6, 3.2, 5.2, 7.0] }}
      calculateMetadata={({ props }) => ({ durationInFrames: props.times.length })}
    />
  </>
);
