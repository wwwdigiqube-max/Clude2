// Launch Reel — product launch / app promo reel synced to a real music beat. Vertical 1080×1920 (works 1920×1080 too).
// Inspired by /brag's app-store + cinematic tones: glossy 3D tokens, phone UI, kinetic headline with one accent word.
export * from "../../lib/util";

export type Mode = "light" | "dark";

export const V = { W: 1080, H: 1920 };

/** Surface tokens per mode. */
export const T = {
  light: {
    bg: "#f3f2ee", bg2: "#e9e7e1", dot: "rgba(20,20,30,.07)", text: "#101014", sub: "#6d6d78",
    card: "rgba(255,255,255,.86)", cardLine: "rgba(16,16,20,.07)", solid: "#ffffff",
    shadow: "0 40px 90px rgba(28,20,70,.16), 0 10px 26px rgba(28,20,70,.08)",
  },
  dark: {
    bg: "#07070c", bg2: "#11111b", dot: "rgba(255,255,255,.07)", text: "#f5f5fa", sub: "#8b8b99",
    card: "rgba(28,28,40,.82)", cardLine: "rgba(255,255,255,.09)", solid: "#1b1b27",
    shadow: "0 40px 90px rgba(0,0,0,.6), 0 10px 26px rgba(0,0,0,.4)",
  },
};

/** One strong accent + signal colours. No pastels. */
export const A = {
  violet: "#5b3df5",
  violet2: "#8b5cff",
  mint: "#12c79a",
  green: "#16b364",
  red: "#ef4444",
  amber: "#f5a524",
  gold: "#e8b04a",
  btc: "#f7931a",
  blue: "#2f6bff",
};

export const FONT_UI = "'Segoe UI', 'Segoe UI Variable', Arial, sans-serif";

/** Kenney CC0 SFX + ende.app CC BY 4.0 music live in public/kenney and public/music. */
export const SFX = {
  pop: ["kenney/interface/drop_001.ogg", "kenney/interface/drop_002.ogg", "kenney/interface/drop_003.ogg"],
  click: "kenney/interface/click_003.ogg",
  mouse: "kenney/ui/mouseclick1.ogg",
  reveal: ["kenney/impact/impactSoft_medium_001.ogg", "kenney/impact/impactSoft_medium_004.ogg", "kenney/impact/impactSoft_medium_002.ogg"],
  bell: "kenney/impact/impactBell_heavy_000.ogg",
  bell2: "kenney/impact/impactBell_heavy_003.ogg",
  card: ["kenney/casino/card-slide-1.ogg", "kenney/casino/card-place-1.ogg"],
  chips: "kenney/casino/chips-stack-2.ogg",
  coins: "kenney/casino/chips-collide-1.ogg",
  toggle: "kenney/interface/switch_002.ogg",
  glitch: "kenney/interface/glitch_002.ogg",
  bong: "kenney/interface/bong_001.ogg",
  key: (i: number) => `kenney/keyboard/keypress-${String(1 + (i % 32)).padStart(3, "0")}.wav`,
};
