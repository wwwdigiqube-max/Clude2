// Art Motion · DOM fonts for the layouts (OFL only — they ship with the kit): Vazirmatn, Noto Nastaliq Urdu, Chakra Petch.
import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

export const AM = { fa: "AMVazir", nast: "AMNastaliq", hud: "AMChakra" };
const FACES: [string, string, string][] = [
  [AM.fa, "fonts/Vazirmatn-Regular.ttf", "400"],
  [AM.fa, "fonts/Vazirmatn-SemiBold.ttf", "600"],
  [AM.fa, "fonts/Vazirmatn-Bold.ttf", "700"],
  [AM.fa, "fonts/Vazirmatn-Black.ttf", "900"],
  [AM.nast, "fonts/NotoNastaliqUrdu.ttf", "400"],
  [AM.hud, "fonts/ChakraPetch-Medium.ttf", "500"],
  [AM.hud, "fonts/ChakraPetch-SemiBold.ttf", "600"],
  [AM.hud, "fonts/ChakraPetch-Bold.ttf", "700"],
];
let p: Promise<unknown> | null = null;
export const useArtFonts = () => {
  const [ok, setOk] = useState(false);
  const [h] = useState(() => delayRender("art-motion fonts"));
  useEffect(() => {
    p ??= Promise.all(FACES.map(([fam, file, weight]) => new FontFace(fam, `url(${staticFile(file)})`, { weight }).load().then((f) => document.fonts.add(f))));
    p.then(() => {
      setOk(true);
      continueRender(h);
    }).catch((e) => {
      console.error(e);
      setOk(true);
      continueRender(h);
    });
  }, [h]);
  return ok;
};
