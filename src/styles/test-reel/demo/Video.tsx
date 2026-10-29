// Test Reel · demo = the reference film «NFP Showreel» v2 (60 s, vertical): every moment a different animation style,
// continuous from the first frame to the last, inside a reel frame with a running STYLE counter. One canvas, a pure
// function of time: director.ts (sequences + reel frame), seq/*.ts (one file per sequence), cues.ts (word + beat times).
import React, { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CLOUD_DIR, loadClouds } from "../lib/depth";
import { loadImages } from "../lib/img";
import { setScale } from "../lib/canvas";
import { FAMILY } from "../lib/hud";
import { frame20 } from "./director";
import { FPS, FRAMES } from "./cues";

export const REEL_FRAMES = FRAMES;
export const REEL_FPS = FPS;
// all SIL OFL: Chakra Petch (every label of the reel frame and HUD) + Libre Baskerville (the serif accents)
const FONTS: [string, number, string][] = [["ChakraPetch-Light.ttf", 300, "normal"], ["ChakraPetch-Regular.ttf", 400, "normal"], ["ChakraPetch-Medium.ttf", 500, "normal"], ["ChakraPetch-SemiBold.ttf", 600, "normal"], ["ChakraPetch-Bold.ttf", 700, "normal"], ["ChakraPetch-MediumItalic.ttf", 500, "italic"], ["ChakraPetch-BoldItalic.ttf", 700, "italic"]];
// GPT Image photos (prompts in ../pipeline/image-prompts.md) + Muybridge silhouettes (public domain, muy/CREDITS.md)
const IMAGES: Record<string, string> = { room: "styles/test-reel/img/room.jpg", gauge: "styles/test-reel/img/gauge.jpg", end: "styles/test-reel/img/end.jpg" };
for (let i = 0; i < 10; i++) IMAGES["run" + i] = `styles/test-reel/muy/run${i}.png`;
for (let i = 0; i < 12; i++) IMAGES["jump" + i] = `styles/test-reel/muy/jump${i}.png`;
let ready = false;
let readyP: Promise<void> | null = null;
function prepare() {
  CLOUD_DIR.v = "styles/documentary/clouds";
  if (!readyP)
    readyP = Promise.all([
      ...FONTS.map(([f, w, st]) => new FontFace(FAMILY, `url('${staticFile("fonts/" + f)}') format('truetype')`, { weight: String(w), style: st }).load().then((x) => void document.fonts.add(x))),
      new FontFace("LB", `url('${staticFile("fonts/LibreBaskerville.ttf")}') format('truetype')`).load().then((x) => void document.fonts.add(x)),
      loadClouds(staticFile),
      loadImages(staticFile, IMAGES),
    ]).then(() => {
      ready = true;
    });
  return readyP;
}

/** times = still-frame mode (one time in seconds per frame, for checking); audio = a file in public/ */
export const ReelVideo: React.FC<{ times?: number[]; audio?: string }> = ({ times, audio }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = times ? times[frame] ?? 0 : frame / fps;
  const ref = useRef<HTMLCanvasElement>(null);
  const [ok, setOk] = useState(ready);
  const [handle] = useState(() => (ready ? null : delayRender("test-reel: fonts + clouds + images")));
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
    frame20(ctx, t);
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
/** still times (seconds) for the -Look composition: one frame per sequence */
export const REEL_LOOK = [0.6, 2.4, 6.0, 10.5, 15.2, 16.4, 18.8, 21.6, 24.5, 26.6, 29.5, 32.0, 34.5, 36.8, 38.4, 40.6, 43.0, 45.4, 47.9, 49.6, 52.0, 54.5, 57.0, 59.5];
