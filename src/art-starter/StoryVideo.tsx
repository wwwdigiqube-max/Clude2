// Starter · «قصه در قاب» (Art Motion, NFP-Alvana v2): one sentence = one moving painting.
// Copy: cp src/art-starter/StoryVideo.tsx src/v01/Video.tsx → edit STORY only → in Root.tsx: import { V01 } from "./v01/Video"; <V01 />
// Styles: styles/art-motion.md (art-… ids). Times: evenly `each` seconds now; after the narration, `vo` (one line per beat).
import React from "react";
import { Composition } from "remotion";
import { Story, lookOf, storyLength, type StoryProps } from "../styles/art-motion";
// import vo from "./vo.json"; // node tools/doc-build-vo.mjs … src/v01/vo.json  (line i = beat i)

export const STORY: StoryProps = {
  title: "داستان نور در نقاشی",
  sub: "7 سبک · یک قصه",
  each: 3,
  // vo, audio: "v01/mix.wav",
  beats: [
    { style: "art-cave", text: "اولین نورِ نقاشی، شعله‌ی آتش بود.", key: "آتش" },
    { style: "art-persian", text: "نگارگر ایرانی نور را از طلا ساخت.", key: "طلا" },
    { style: "art-renaissance", text: "رنسانس نور را از آسمان پایین آورد.", key: "آسمان" },
    { style: "art-rembrandt", text: "رامبرانت نور را در دل تاریکی پنهان کرد.", key: "تاریکی" },
    { style: "art-monet", text: "مونه نور را روی آب تکه‌تکه کرد.", key: "آب" },
    { style: "art-hopper", text: "هاپر با نور، تنهایی آدم‌ها را کشید.", key: "تنهایی" },
    { style: "art-shinkai", text: "و امروز نور را با کد می‌کشیم.", key: "کد" },
  ],
};

const W = 1080, H = 1920; // layout: "landscape" in STORY → 1920×1080
export const V01: React.FC = () => (
  <>
    <Composition id="V01" component={Story} durationInFrames={Math.round(storyLength(STORY) * 30)} fps={30} width={W} height={H} defaultProps={STORY} />
    <Composition
      id="V01-Look"
      component={lookOf(Story, STORY)}
      durationInFrames={1}
      fps={30}
      width={W}
      height={H}
      defaultProps={{ times: [0.3, 1.8, 4.8, 7.8, 10.8, 13.8, 16.8, 19.8] }}
      calculateMetadata={({ props }) => ({ durationInFrames: props.times.length })}
    />
  </>
);
