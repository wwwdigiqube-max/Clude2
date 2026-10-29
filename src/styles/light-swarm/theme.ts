// Light Swarm palette (Alvana brand). The colours live inside the shaders; these
// constants document them and let scenes match UI or titles to the film.
export const SWARM_PAL = {
  bg: "#04060a", // deep space behind the nebula
  sapphire: "#0a2e44", // nebula body
  ice: "#a7d5ff", // default particle light
  white: "#fffaf2", // highlights, landing flashes
  neon: "#3ef2a0", // energy: tree pulses, leaves, crown jewels, the drop
  red: "#e0393f", // pressure and embers only (a few seconds per film)
} as const;
