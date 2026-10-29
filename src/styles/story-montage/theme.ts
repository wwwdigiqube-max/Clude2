// Story Montage — fast metaphor montage for English (Latin-script) voiceovers: a new "world" every 1–2.5s
// (photo textures + UI + chalk / newspaper / poster), a camera that never stops, word-synced kinetic type.
// Vertical 1080×1920. Ref: EarnEdits "People don't buy your product" AE template.
import { continueRender, delayRender, staticFile } from "remotion";
export * from "../../lib/util";

export const V = { W: 1080, H: 1920 };

/** Latin display fonts (all SIL OFL, from google/fonts) in public/fonts. */
export const F = {
  ui: "Inter",
  poster: "Anton",
  bebas: "Bebas",
  chalk: "CabinSketch",
  hand: "PatrickHand",
  script: "Caveat",
  round: "Fredoka",
  news: "Oswald",
  black: "Unifraktur",
  serif: "LibreBask",
  wide: "Michroma",
};

const FILES: [string, string, string?][] = [
  [F.ui, "Inter.ttf", "100 900"],
  [F.poster, "Anton-Regular.ttf"],
  [F.bebas, "BebasNeue-Regular.ttf"],
  [F.chalk, "CabinSketch-Bold.ttf"],
  [F.hand, "PatrickHand-Regular.ttf"],
  [F.script, "Caveat.ttf", "400 700"],
  [F.round, "Fredoka.ttf", "300 700"],
  [F.news, "Oswald.ttf", "200 700"],
  [F.black, "UnifrakturMaguntia-Book.ttf"],
  [F.serif, "LibreBaskerville.ttf", "400 700"],
  [F.wide, "Michroma-Regular.ttf"],
];
const handle = delayRender("story-montage fonts");
Promise.all(
  FILES.map(([fam, file, weight]) => new FontFace(fam, `url('${staticFile("fonts/" + file)}') format('truetype')`, weight ? { weight } : {}).load().then((f) => document.fonts.add(f))),
)
  .then(() => continueRender(handle))
  .catch((e) => { console.error("font load", e); continueRender(handle); });

export const C = {
  ink: "#0b0b0d",
  char: "#2b2b2d",
  line: "rgba(255,255,255,.55)",
  faint: "rgba(255,255,255,.18)",
  white: "#f5f5f7",
  green: "#7df3b0",
  chalk: "#eef3ea",
  navy: "#0f2236",
  paper: "#e9e2cf",
  blue: "#3b6cff",
  purple: "#6b3cff",
};
