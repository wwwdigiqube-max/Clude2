import { continueRender, delayRender, staticFile } from "remotion";

// Persian fonts (both SIL OFL): Vazirmatn for text/labels, Lalezar for headlines and hero numbers.
// Your own fonts: drop the .ttf into public/fonts/ and change the family/file below — every style reads these two names.
export const FONT_TEXT = "Vazirmatn";
export const FONT_NUM = "Lalezar";

const fonts: [string, string][] = [
  [FONT_TEXT, "fonts/Vazirmatn-SemiBold.ttf"],
  [FONT_NUM, "fonts/Lalezar-Regular.ttf"],
];

const handle = delayRender("Loading fonts");
Promise.all(
  fonts.map(([family, file]) => {
    const face = new FontFace(family, `url('${staticFile(file)}') format('truetype')`);
    return face.load().then((f) => document.fonts.add(f));
  }),
)
  .then(() => continueRender(handle))
  .catch((err) => console.error("Font load failed", err));
