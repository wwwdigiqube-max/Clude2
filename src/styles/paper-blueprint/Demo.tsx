// Starter template: copy this file to src/vNN/ and replace the shots.
// Composition id: "Style-PaperBlueprint" (8s preview of the kit + recipes).
import React from "react";
import { AbsoluteFill, Series, useCurrentFrame } from "remotion";
import {
  BlueChip, BlueDefs, DashedPath, DottedWorld, easeBack, InkDefs, InkGlobe, Ground, MapPin, ramp, Robot, RobotLine,
  SearchPill, Shot, Sparkle, TickDial, Timeline, timeline, typed, W, H,
} from ".";

const DURS = [120, 120];
const { starts, total } = timeline(DURS);

const PaperShot: React.FC<{ g0: number; dur: number }> = ({ g0, dur }) => {
  const f = useCurrentFrame();
  const pin = ramp(f, 40, 52, (t) => t * t);
  return (
    <Shot world="paper" f={f} g0={g0} dur={dur} title="دنیای واقعی" chapter="۱ · کاغذ" stripe="gold" cx={760} cy={520}
      parts={[["اینجا دنیای آدم‌هاست.", 10]]}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <InkDefs f={f} />
        <g filter="url(#boil)">
          <Ground y={820} />
          <InkGlobe cx={760} cy={520} r={250} f={f} />
          <MapPin x={880} y={330 - (1 - pin) * 300} />
          <Robot x={1350} y={820} f={f} mood={f > 56 ? "happy" : "determined"} look={-1} arm={f > 56 ? 1 : 0} />
        </g>
      </svg>
    </Shot>
  );
};

const BlueShot: React.FC<{ g0: number; dur: number }> = ({ g0, dur }) => {
  const f = useCurrentFrame();
  return (
    <Shot world="blue" f={f} g0={g0} dur={dur} title="نگاه ماشین" chapter="۲ · بلوپرینت" cx={960} cy={560}
      parts={[["اینجا همون دنیا، از چشم هوش مصنوعی.", 10]]}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <BlueDefs />
        <g opacity=".6"><DottedWorld front={182 - ramp(f, 0, 110, (t) => t) * 356} cy={560} /></g>
        <DashedPath id="demo1" d="M1250 260 C 1400 260, 1500 320, 1520 400" f={f} start={30} />
        <TickDial x={1540} y={460} r={56} f={f} appear={ramp(f, 44, 56, easeBack)} active />
        <RobotLine x={1150} y={196} s={0.8} f={f} wave />
        {f > 60 && <Sparkle x={1540} y={400} f={f} />}
      </svg>
      <SearchPill x={270} y={196} f={f} text={typed("آرمان کیانی", f, 8, 13)} />
      <BlueChip x={1540} y={560} a={ramp(f, 50, 60)}>گره</BlueChip>
    </Shot>
  );
};

export const PaperBlueprintDemo: React.FC = () => (
  <AbsoluteFill>
    <Timeline total={total}>
      <Series>
        <Series.Sequence durationInFrames={DURS[0]}><PaperShot g0={starts[0]} dur={DURS[0]} /></Series.Sequence>
        <Series.Sequence durationInFrames={DURS[1]}><BlueShot g0={starts[1]} dur={DURS[1]} /></Series.Sequence>
      </Series>
    </Timeline>
  </AbsoluteFill>
);
export const DEMO_FRAMES = total;
