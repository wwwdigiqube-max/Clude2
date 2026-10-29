// The documentary player: one canvas, drawn as a pure function of time by `render(ctx, t)` in 1920×1080 design
// units (any output size works). Waits for the fonts and the cloud photos before the first frame.
import React, { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Ctx, setScale } from "./engine/canvas";
import { loadClouds } from "./engine/depth";
import { F } from "./engine/text";

/** font files for the four roles (public/…). OFL Vazirmatn by default; swap for your own. */
export const DOC_FONTS: Record<string, string> = {
  [F.light]: "fonts/Vazirmatn-Regular.ttf",
  [F.semi]: "fonts/Vazirmatn-SemiBold.ttf",
  [F.bold]: "fonts/Vazirmatn-Bold.ttf",
  [F.heavy]: "fonts/Vazirmatn-Black.ttf",
};
let ready = false;
let readyP: Promise<void> | null = null;
function prepare() {
  if (!readyP)
    readyP = Promise.all([
      ...Object.entries(DOC_FONTS).map(([fam, file]) => new FontFace(fam, `url('${staticFile(file)}') format('truetype')`).load().then((x) => void document.fonts.add(x))),
      loadClouds(staticFile),
    ]).then(() => {
      ready = true;
    });
  return readyP;
}

export type DocProps = {
  render: (ctx: Ctx, t: number) => void;
  /** final mix in public/ (e.g. "my-doc/mix.wav"); omit for silent renders */
  audio?: string;
  /** optional list of times (s) to render instead of the timeline — for quick stills */
  times?: number[];
};
export const DocCanvas: React.FC<DocProps> = ({ render, audio, times }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = times ? times[frame] ?? 0 : frame / fps;
  const ref = useRef<HTMLCanvasElement>(null);
  const [ok, setOk] = useState(ready);
  const [handle] = useState(() => (ready ? null : delayRender("documentary: fonts + clouds")));
  const released = useRef(false);
  useLayoutEffect(() => {
    if (!ok) prepare().then(() => setOk(true));
  }, [ok]);
  useLayoutEffect(() => {
    if (!ok) return;
    const ctx = ref.current!.getContext("2d")!;
    const R = width / 1920;
    setScale(R);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.filter = "none";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    ctx.setTransform(R, 0, 0, R, 0, 0);
    render(ctx, t);
    if (handle !== null && !released.current) {
      released.current = true;
      continueRender(handle);
    }
  }, [t, ok, width, height, handle, render]);
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
