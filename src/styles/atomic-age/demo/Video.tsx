// Atomic Age · demo = the reference film «باغ اتمی» (the 1949 atomic gardens, 56 s, vertical, loops seamlessly).
// One canvas, a pure function of time: director.ts (paper, plate, shot, wave/burst wipes, deco, caption card),
// scenes.ts (one function per shot; overlays measured on the illustrations), cues.ts (word times from vo.json).
// Copy this folder to start a video.
import React, { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadImages } from "../lib/img";
import { setScale } from "../lib/canvas";
import { FA, LAT, NUM } from "../lib/retro";
import { frame21 } from "./director";
import { FPS, FRAMES } from "./cues";

export const ATOMIC_FRAMES = FRAMES;
export const ATOMIC_FPS = FPS;
// all SIL OFL: Vazirmatn (Persian text and captions), Lalezar (big Persian numbers / titles), Fredoka (Latin)
const FONTS: [string, string, string][] = [
  [FA, "Vazirmatn-SemiBold.ttf", "600"],
  [FA, "Vazirmatn-Bold.ttf", "700"],
  [FA, "Vazirmatn-Black.ttf", "900"],
  [NUM, "Lalezar-Regular.ttf", "400"],
  [LAT, "Fredoka.ttf", "400 700"],
];
// the illustrations (GPT Image, 9:16 — prompts in ../pipeline/image-prompts.md)
const IMAGES: Record<string, string> = {};
for (const n of ["field", "control", "gardener", "post", "breakfast", "texas"]) IMAGES[n] = `styles/atomic-age/img/${n}.jpg`;
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
export const AtomicVideo: React.FC<{ times?: number[]; audio?: string }> = ({ times, audio }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = times ? times[frame] ?? 0 : frame / fps;
  const ref = useRef<HTMLCanvasElement>(null);
  const [ok, setOk] = useState(ready);
  const [handle] = useState(() => (ready ? null : delayRender("atomic-age: fonts + images")));
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
    frame21(ctx, t);
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
export const ATOMIC_LOOK = [0.05, 2.5, 5.2, 8.5, 10.4, 13.7, 16.7, 19.6, 23.0, 26.2, 28.4, 31.4, 34.6, 36.0, 38.8, 43.5, 46.9, 49.4, 51.6, 54.3, 56.2];
