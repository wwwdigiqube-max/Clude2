// Hologram HUD — amber holograms over a projector in a dark room, thin HUD furniture, Latin numbers, typed captions.
// Card: styles/hologram-hud.md · Demo (= the reference film): Style-HologramHUD · stills: Style-HologramHUD-Look
export * from "./lib/holo";
export type { Ctx } from "./lib/canvas";
export { H, W, paint, matchTransform, scale, setScale, bloom } from "./lib/canvas";
export { clamp, ease, hash, k, lerp, noise2, fbm, ramp, ss, win, mixHex, rng, TAU } from "./lib/math";
export { img, loadImages } from "./lib/img";
export { HoloVideo, HOLO_FPS, HOLO_FRAMES, HOLO_LOOK } from "./demo/Video";
