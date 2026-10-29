// Test Reel — a vertical showreel where every moment is a different animation style, inside a reel frame (thin border,
// tiny corner type, a STYLE NN/18 counter that punches up on each new style, timecode); cuts on the beat; one orange
// accent in a black-and-white world; schematic drawings, contact sheet, recursive phone (Droste), Muybridge montage.
// Card: styles/test-reel.md · Demo (= the reference film): Style-TestReel · stills: Style-TestReel-Look
export { reelFrame, setStyleMarks, REEL_LABELS } from "./lib/overlay";
export type { StyleMark } from "./lib/overlay";
export * from "./lib/hud";
export type { Ctx } from "./lib/canvas";
export { H, W, layer, paint, matchTransform, scale, setScale, bloom } from "./lib/canvas";
export { clamp, ease, hash, k, lerp, noise2, fbm, ramp, ss, win, rgba, mixHex, rng, TAU } from "./lib/math";
export { img, loadImages } from "./lib/img";
export { ReelVideo, REEL_FPS, REEL_FRAMES, REEL_LOOK } from "./demo/Video";
