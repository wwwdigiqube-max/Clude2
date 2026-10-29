// Documentary («ویدئو مستند»): a two-voice illustrated documentary on one Canvas 2D — real clouds, depth layers,
// robed silhouettes, figures of light, living portals, Persian titles that pick their ink from the background.
// Card: styles/documentary.md. Full reference video: examples/v19 (5:47, two speakers).
export * from "./engine/canvas";
export * from "./engine/math";
export * from "./engine/fx";
export * from "./engine/shape";
export * from "./engine/text";
export * from "./engine/figure";
export * from "./engine/light";
export * from "./engine/depth";
export * from "./engine/portal";
export { book, scroll, qmark, balance, roots, house, tree, bird, river, walker, crack, eyeGlyph, voiceRings, INK, inkLine } from "./engine/lineart";
export * from "./cues";
export * from "./transitions";
export * from "./poses";
export { DocCanvas, DOC_FONTS } from "./DocCanvas";
export { desert, DESERT_SPOTS, SPRING } from "./worlds/desert";
export { nightRange, fire, sheep } from "./worlds/night";
export { skyBack, throneClouds, earth, throne } from "./worlds/sky";
export { throneRoom } from "./worlds/throne";
export { gloryScene } from "./worlds/glory";
export { warmBg, lavBg } from "./worlds/heaven";
export { holyPlace } from "./worlds/holy";
export { DocumentaryDemo, DOC_DEMO_FRAMES, demoFrame } from "./Demo";
export { landscape, MOODS, mixMood } from "./worlds/landscape";
export type { Mood, MoodName, LandOpt, LandInfo } from "./worlds/landscape";
export { DocumentaryWorlds, WORLD_LOOKS, worldsFrame, person } from "./Worlds";
