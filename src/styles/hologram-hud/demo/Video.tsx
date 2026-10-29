// Hologram HUD · demo = the reference film «ساعت‌های GPS و اینشتین» (59 s, vertical). One canvas, a pure function of
// time: director.ts (room → projector → shot → transition → HUD frame → caption → finish), scenes.ts (one function
// per shot, every beat a word of the narration), cues.ts (word times from vo.json). Copy this folder to start a video.
import React, { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadImages } from "../lib/img";
import { setScale } from "../lib/canvas";
import { FA, MONO, NUMF } from "../lib/holo";
import { frame22 } from "./director";
import { FPS, FRAMES } from "./cues";

export const HOLO_FRAMES = FRAMES;
export const HOLO_FPS = FPS;
// all SIL OFL: Vazirmatn (captions), Vazir Code (Persian HUD labels), Chakra Petch (every number — Latin digits)
const FONTS: [string, string, string][] = [
  [FA, "Vazirmatn-Bold.ttf", "700"],
  // one face for every weight, so the browser never fakes a bold Persian label
  [MONO, "VazirCode.ttf", "100 900"],
  [NUMF, "ChakraPetch-Medium.ttf", "500"],
  [NUMF, "ChakraPetch-Bold.ttf", "700"],
];
// the hologram renders (GPT Image on pure black — prompts in ../pipeline/image-prompts.md)
const IMAGES: Record<string, string> = {};
for (const n of ["satellite", "earth", "control", "testsat", "phone", "einstein"]) IMAGES[n] = `styles/hologram-hud/img/${n}.jpg`;
let ready = false;
let readyP: Promise<void> | null = null;
function prepare() {
  if (!readyP)
    readyP = Promise.all([
      ...FONTS.map(([fam, f, w]) => new FontFace(fam, `url('${staticFile("fonts/" + f)}') format('truetype')`, { weight: w }).load().then((x) => void document.fonts.add(x))),
      loadImages(staticFile, IMAGES),
    ]).then(() => {
      ready = true;
    });
  return readyP;
}

/** times = still-frame mode (one time in seconds per frame, for checking); audio = a file in public/ */
export const HoloVideo: React.FC<{ times?: number[]; audio?: string }> = ({ times, audio }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = times ? times[frame] ?? 0 : frame / fps;
  const ref = useRef<HTMLCanvasElement>(null);
  const [ok, setOk] = useState(ready);
  const [handle] = useState(() => (ready ? null : delayRender("hologram-hud: fonts + images")));
  const released = useRef(false);
  useLayoutEffect(() => {
    if (!ok) prepare().then(() => setOk(true));
  }, [ok]);
  useLayoutEffect(() => {
    if (!ok) return;
    const ctx = ref.current!.getContext("2d")!;
    const R = width / 1080;
    setScale(R);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.filter = "none";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    ctx.setTransform(R, 0, 0, R, 0, 0);
    frame22(ctx, t);
    if (handle !== null && !released.current) {
      released.current = true;
      continueRender(handle);
    }
  }, [t, ok, width, height, handle]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <canvas ref={ref} width={width} height={height} style={{ width: "100%", height: "100%" }} />
      {audio && (
        <Sequence from={0} layout="none">
          <Html5Audio src={staticFile(audio)} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
/** still times (seconds) for the -Look composition: one frame per key moment */
export const HOLO_LOOK = [0.0, 1.2, 2.8, 4.8, 5.9, 7.4, 9.9, 12.6, 14.0, 15.5, 18.8, 19.8, 23.6, 25.2, 28.3, 29.2, 31.0, 32.9, 35.4, 37.4, 39.9, 41.5, 42.3, 43.9, 47.0, 48.0, 49.2, 52.0, 54.0, 55.9, 58.3, 59.1];
