// Halftone Pop — a 3D character (GPT pose images) printed as halftone, presenting a story/product on clean light scenes.
// Scenes are framed panels on soft tints, joined by smooth transitions (circle burst, slide-cover, whip pan, zoom-through).
// Vertical 1080×1920. Refs: Pocketsflow / Gumroad promos (+ pdoom-video effects).
export * from "../../lib/util";

export const V = { W: 1080, H: 1920 };

/** Scene backgrounds: white + soft tints + one strong blue + black. No pink. */
export const BG = {
  white: "#ffffff",
  paper: "#f6f5f1",
  sky: "#dfe8ff",
  lav: "#ebe6ff",
  mint: "#dcf3ea",
  sand: "#f4ecdc",
  blue: "#2f5bea",
  black: "#0d0d10",
};
export type BgName = keyof typeof BG;

export const K = {
  ink: "#111114",
  paper: "#ffffff",
  grey: "#8a8a92",
  line: "rgba(17,17,20,.1)",
  blue: "#2f5bea",
  blueSoft: "#dfe8ff",
  orange: "#ffae3b",
  teal: "#1fbf9f",
  purple: "#8c6cf6",
  yellow: "#ffd84d",
  green: "#19b36b",
  red: "#ff5a4f",
};

export const FONT_LATIN_MONO = "Consolas, 'Courier New', monospace";
export const HARD = (d = 8, c = K.ink) => `${d}px ${d}px 0 ${c}`;
export const SOFT = "0 40px 80px rgba(20,24,60,.16), 0 10px 24px rgba(20,24,60,.10)";
