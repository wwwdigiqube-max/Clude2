// Cosmic Web · demo = the reference film «ترسناک‌ترین جای جهان» (cosmic voids, Persian, 1920×1080, 7.5 min). No captions.
import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, Html5Audio, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useAssets18 } from "./assets";
import { FPS, FRAMES } from "./cues";
import { direct } from "./director";
import { Overlay18 } from "./Overlay";
import { World18 } from "./World18";

export const COSMIC_FRAMES = FRAMES;
export const COSMIC_FPS = FPS;

/** Look-dev: frame i shows time STILL_TIMES[i] (one render = a review sheet). */
export const COSMIC_LOOK = [5, 15, 22, 31, 34.8, 44, 48, 52, 58, 63, 72.8, 84, 99, 117, 123, 129, 137, 150, 161.8, 168, 172.5, 176.5, 185, 199, 213, 219, 230, 235, 245, 262, 276, 285, 296, 306, 314, 327, 331, 340, 351, 362, 376, 386, 395, 405, 418, 424, 435];

export const CosmicVideo: React.FC<{ audio?: boolean; stills?: boolean; times?: number[] }> = ({ audio = false, stills = false, times }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = times ? times[frame] : stills ? COSMIC_LOOK[frame] : frame / fps;
  const a = useAssets18();
  const st = direct(t);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {a && (
        <>
          <ThreeCanvas width={width} height={height} gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}>
            <World18 t={t} a={a} />
          </ThreeCanvas>
          {st.ov.photo && st.ov.photo.k > 0.001 && (
            // the real Hubble photo of MCG+01-02-015 (ESA/Hubble & NASA, N. Grogin — CC BY 4.0); crop = only the galaxy stays lit
            <AbsoluteFill style={{ opacity: st.ov.photo.k * (1 - st.post.black), alignItems: "center", justifyContent: "center", background: "#000" }}>
              <Img
                src={staticFile("styles/cosmic-web/img/lonely_potw1545a.jpg")}
                style={{
                  width: 1920 * 1.06, height: (1920 * 1.06 * 1982) / 3726, maxWidth: "none", objectFit: "cover",
                  transform: `scale(${st.ov.photo.scale})`,
                  WebkitMaskImage: `radial-gradient(ellipse ${Math.round(2200 - 1950 * st.ov.photo.crop)}px ${Math.round(1300 - 1150 * st.ov.photo.crop)}px at 50% 50%, #000 45%, transparent 100%)`,
                  maskImage: `radial-gradient(ellipse ${Math.round(2200 - 1950 * st.ov.photo.crop)}px ${Math.round(1300 - 1150 * st.ov.photo.crop)}px at 50% 50%, #000 45%, transparent 100%)`,
                }}
              />
            </AbsoluteFill>
          )}
          <AbsoluteFill style={{ opacity: 1 - st.post.black }}>
            <Overlay18 t={t} view={st.view} ov={st.ov} web={a.web} zel={a.zel} />
          </AbsoluteFill>
        </>
      )}
      {audio && (
        <Sequence from={0} layout="none">
          <Html5Audio src={staticFile("styles/cosmic-web/mix.mp3")} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
