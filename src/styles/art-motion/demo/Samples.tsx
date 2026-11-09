// Art Motion · the sample reel of every v2 style + the compositions the kit registers in Root.tsx.
//   Art-<Style>       a «موزه‌ی متحرک» sample of one art style (6.5 s, 1080×1920)
//   Explainer-<Style> the ready Persian spec of one explainer grammar (1080×1920)
//   Art-Poem / Art-Journey / Art-Story  the other art layouts
import React from "react";
import { AbsoluteFill, Composition, Easing, Folder, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ClipCanvas } from "../ArtCanvas";
import { ART_STYLES, EXPLAINER_STYLES, styleById } from "../catalog";
import type { ClipSpec } from "../clip";
import { AM, useArtFonts } from "../fonts";
import { Journey, journeyLength, type JourneyProps } from "../layouts/Journey";
import { Museum, MUSEUM_SECONDS } from "../layouts/Museum";
import { Poem, type PoemProps } from "../layouts/Poem";
import { Story, storyLength, type StoryProps } from "../layouts/Story";
import * as SPECS from "./specs";

export const SPEC_OF: Record<string, ClipSpec> = {
  "ex-flat-cosmos": SPECS.SPEC_FLAT_COSMOS,
  "ex-collage": SPECS.SPEC_COLLAGE,
  "ex-whiteboard": SPECS.SPEC_WHITEBOARD,
  "ex-storytime": SPECS.SPEC_STORYTIME,
  "ex-kinetic": SPECS.SPEC_KINETIC,
  "ex-math": SPECS.SPEC_MATH,
  "ex-keynote": SPECS.SPEC_KEYNOTE,
  "ex-chart": SPECS.SPEC_CHART,
  "ex-calligraphy": SPECS.SPEC_CALLIGRAPHY,
};

/** one explainer spec + a small brand pill in the top safe band */
export const ExplainerSample: React.FC<{ style: string; t?: number }> = ({ style, t: tIn }) => {
  const ok = useArtFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = tIn ?? frame / fps;
  const S = styleById(style)!;
  const a = interpolate(t, [0.1, 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill>
      <ClipCanvas spec={SPEC_OF[style]} t={t} />
      {ok && (
        <div style={{ position: "absolute", top: 34, width: 1080, display: "flex", justifyContent: "center", opacity: a }}>
          <div style={{ direction: "rtl", fontFamily: AM.fa, fontWeight: 600, fontSize: 26, color: "#fff", background: "rgba(10,10,14,.55)", border: "1px solid rgba(255,255,255,.18)", borderRadius: 30, padding: "8px 26px", backdropFilter: "blur(6px)" }}>
            <span style={{ fontFamily: AM.hud, fontWeight: 600, letterSpacing: 2, color: "#FF9A66" }}>NFP v2</span> · {S.fa} · سبک {S.no}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const POEM_SAMPLE: PoemProps = {
  style: "art-vangogh",
  lines: ["دوش دیدم که ملائک در میخانه زدند", "گل آدم بسرشتند و به پیمانه زدند"],
  poet: "حافظ",
  duration: 8,
};
export const JOURNEY_SAMPLE: JourneyProps = {
  stops: ART_STYLES.map((s) => ({ style: s.id })),
  layout: "vertical",
  title: "از غار تا نگارگری",
  sub: "36 سبک متحرک در 40 ثانیه · NFP-Alvana v2",
  each: 1.1,
};

/** «قصه در قاب»: one sentence = one painting (times here are even; in a real video they come from vo.json) */
export const STORY_SAMPLE: StoryProps = {
  title: "داستان نور در نقاشی",
  sub: "7 سبک · یک قصه",
  each: 3,
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

const pascal = (id: string) => id.replace(/^(art|ex)-/, "").split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("");
const MuseumComp: React.FC<{ style: string }> = ({ style }) => <Museum style={style} />;
const ExplainerComp: React.FC<{ style: string }> = ({ style }) => <ExplainerSample style={style} />;

/** every Art Motion composition (Root.tsx: <ArtMotionCompositions />) */
export const ArtMotionCompositions: React.FC = () => (
  <Folder name="Art-Motion-v2">
    {ART_STYLES.map((s) => (
      <Composition key={s.id} id={`Art-${pascal(s.id)}`} component={MuseumComp} durationInFrames={Math.round(MUSEUM_SECONDS * 30)} fps={30} width={1080} height={1920} defaultProps={{ style: s.id }} />
    ))}
    {EXPLAINER_STYLES.map((s) => (
      <Composition key={s.id} id={`Explainer-${pascal(s.id)}`} component={ExplainerComp} durationInFrames={Math.round(SPEC_OF[s.id].duration * 30)} fps={30} width={1080} height={1920} defaultProps={{ style: s.id }} />
    ))}
    <Composition id="Art-Poem" component={Poem} durationInFrames={Math.round((POEM_SAMPLE.duration ?? 8) * 30)} fps={30} width={1080} height={1920} defaultProps={POEM_SAMPLE} />
    <Composition id="Art-Story" component={Story} durationInFrames={Math.round(storyLength(STORY_SAMPLE) * 30)} fps={30} width={1080} height={1920} defaultProps={STORY_SAMPLE} />
    <Composition id="Art-Journey" component={Journey} durationInFrames={Math.round(journeyLength(JOURNEY_SAMPLE.stops, JOURNEY_SAMPLE.each) * 30)} fps={30} width={1080} height={1920} defaultProps={JOURNEY_SAMPLE} />
    <Composition
      id="Art-Journey-Landscape"
      component={Journey}
      durationInFrames={Math.round(journeyLength(JOURNEY_SAMPLE.stops, JOURNEY_SAMPLE.each) * 30)}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ ...JOURNEY_SAMPLE, layout: "landscape" }}
    />
  </Folder>
);
