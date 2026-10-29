// Video 19 — «فرشته‌ی خداوند», a two-voice Persian dialogue, 1920×1080. Everything is drawn on one canvas
// as a pure function of time (director.ts); no captions on screen.
import React, { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FPS, FRAMES } from "./cues";
import { renderFrame } from "./director";
import { setScale } from "./lib/canvas";
import { loadClouds } from "./lib/depth";

export const V19_FRAMES = FRAMES;
export const V19_FPS = FPS;

const FACES: [string, string][] = [
  ["MorabbaLight", "fonts/Morabba-Light.ttf"],
  ["Morabba", "fonts/Morabba-SemiBold.ttf"],
  ["MorabbaBold", "fonts/Morabba-Bold.ttf"],
  ["MorabbaHeavy", "fonts/Morabba-Heavy.ttf"],
];
let fontsReady = false;
const fontsP = Promise.all([
  ...FACES.map(([f, file]) => new FontFace(f, `url('${staticFile(file)}') format('truetype')`).load().then((x) => document.fonts.add(x))),
  loadClouds(staticFile), // real cloud photos (graded per scene)
]).then(() => {
  fontsReady = true;
});

export const Video19: React.FC<{ audio?: boolean; times?: number[] }> = ({ audio = true, times }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = times ? times[frame] : frame / fps;
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(fontsReady);
  const [handle] = useState(() => (fontsReady ? null : delayRender("v19 fonts + clouds")));
  const released = useRef(false);
  useLayoutEffect(() => {
    if (!ready) fontsP.then(() => setReady(true));
  }, [ready]);
  useLayoutEffect(() => {
    if (!ready) return;
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const R = width / 1920;
    setScale(R);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.filter = "none";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    ctx.setTransform(R, 0, 0, R, 0, 0);
    renderFrame(ctx, t);
    if (handle !== null && !released.current) {
      released.current = true;
      continueRender(handle);
    }
  }, [t, ready, width, height, handle]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <canvas ref={ref} width={width} height={height} style={{ width: "100%", height: "100%" }} />
      {audio && (
        <Sequence from={0} layout="none">
          <Html5Audio src={staticFile("v19/mix.wav")} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
