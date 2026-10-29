// Atomic Age — 1950s «atomic age» editorial illustration: grainy paper, a coral plate, teal / mustard / coral / cream,
// living atomic stars and boomerangs, wave wipes, cream caption cards with word-by-word highlight; loops seamlessly.
// Card: styles/atomic-age.md · Demo (= the reference film): Style-AtomicAge · stills: Style-AtomicAge-Look
export * from "./lib/retro";
export * from "./lib/art";
export type { Ctx } from "./lib/canvas";
export { H, W, layer, paint, matchTransform, scale, setScale, bloom } from "./lib/canvas";
export { clamp, ease, hash, k, lerp, noise2, fbm, ramp, ss, win, rgba, mixHex, rng, TAU } from "./lib/math";
export { img, loadImages } from "./lib/img";
export { AtomicVideo, ATOMIC_FPS, ATOMIC_FRAMES, ATOMIC_LOOK } from "./demo/Video";
