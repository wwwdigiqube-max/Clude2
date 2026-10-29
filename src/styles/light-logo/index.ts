// Light Logo — a brand intro in a warm 3D world of light: 2 × 65k particles build symbols on the song's hits (network,
// brain, AI core, chip …) and finally write YOUR logo in light (tools/logo-trace.mjs), halves slamming shut on the cut.
// Builds on light-swarm (shapes, math, timeline). Card: styles/light-logo.md · Demo: Style-LightLogo · stills: Style-LightLogo-Look
export { buildLightEngine, type LightEngine } from "./lib/engine";
export { LIGHT_EXTRA, LIGHT_SHAPES, LOGO_DIST, LOGO_FOV, logoLayout, setLogo, type LogoPts } from "./lib/shapes";
export { makeDof, makeSegs } from "./lib/segs";
export { makeNebula } from "./lib/nebula";
export { LightLogoVideo, LIGHTLOGO_FPS, LIGHTLOGO_FRAMES, LIGHTLOGO_LOOK, splitPx } from "./demo/Film";
