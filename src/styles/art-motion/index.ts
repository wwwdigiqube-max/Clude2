// Art Motion (NFP-Alvana v2) — 36 moving-painting styles + 9 explainer grammars on one Canvas 2D engine.
// Read styles/art-motion.md, never engine/ (public/styles/art-motion/engine is ~15k lines of vendored code).
export { ART_STYLES, EXPLAINER_STYLES, ALL_STYLES, styleById, paletteOf, type ArtStyle } from "./catalog";
export { ArtFilmCanvas, ClipCanvas } from "./ArtCanvas";
export type { Seg, Transition } from "./film";
export type { ClipSpec, Cue } from "./clip";
export { AM, useArtFonts } from "./fonts";
export { ART } from "./runtime";
export { Story, storyLength, storyTimes, type Beat, type StoryProps, type VO } from "./layouts/Story";
export { Poem, type PoemProps } from "./layouts/Poem";
export { Journey, journeyLength, journeySegs, type JourneyProps, type Stop } from "./layouts/Journey";
export { Museum, MUSEUM_SECONDS } from "./layouts/Museum";
export { Explainer, explainerFrames, type ExplainerProps } from "./layouts/Explainer";
export { lookOf } from "./look";
export * from "./demo/specs";
export { ArtMotionCompositions, STORY_SAMPLE, POEM_SAMPLE, JOURNEY_SAMPLE, SPEC_OF } from "./demo/Samples";
