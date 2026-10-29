// Split-flap · demo = the reference film «24 HRS» — a countdown teaser on a 3D split-flap board (16:9, 16.5 s).
// One ThreeCanvas; board.ts builds the scene once and updates every flap from program.ts at time t.
// Render: --gl=angle --concurrency=1. Any size works (1920×1080, 3840×2160 …): the board renders natively.
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { buildBoard } from "./board";
import { FPS, FRAMES, GLYPH_FONT, useFlapFonts } from "./lib";

export const FLAP_FPS = FPS;
export const FLAP_FRAMES = FRAMES;
/** still times for the -Look composition (one frame each) */
export const FLAP_LOOK = [0.12, 0.3, 0.7, 1.4, 2.4, 3.3, 4.2, 5.0, 5.9, 6.6, 7.3, 7.7, 8.2, 8.7, 9.6, 10.4, 11.0, 11.6, 12.4, 12.8, 13.3, 13.8, 14.2, 15.0, 16.1];

const World: React.FC<{ t: number; dbg?: string }> = ({ t, dbg = "" }) => {
  const { gl, scene, camera, size } = useThree();
  // deps = the numbers, never the size object (otherwise the whole world is rebuilt every frame)
  const B = useMemo(() => buildBoard(gl, scene, camera as THREE.PerspectiveCamera, size.width, size.height, GLYPH_FONT, dbg), [gl, scene, camera, size.width, size.height, dbg]);
  useLayoutEffect(() => {
    B.update(t);
  }, [t, B]);
  useFrame(() => B.render(), 1);
  return null;
};

/**
 * times = still mode (one time in seconds per frame) · audio = a file in public/ (e.g. "v01/mix.wav"); the kit ships
 * without the film's sound — make yours with pipeline/ · dbg = isolation renders for finding a lighting problem:
 * any of "noenv nokey nobeam nodust nopost" (e.g. --props='{"dbg":"noenv"}').
 */
export const FlapVideo: React.FC<{ times?: number[]; audio?: string; dbg?: string }> = ({ times, audio, dbg }) => {
  const ready = useFlapFonts();
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = times ? times[Math.min(frame, times.length - 1)] : frame / FPS;
  return (
    <AbsoluteFill style={{ background: "#030303" }}>
      {ready && (
        <ThreeCanvas width={width} height={height} shadows gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}>
          <World t={t} dbg={dbg} />
        </ThreeCanvas>
      )}
      {audio && !times && (
        <Sequence from={0} layout="none">
          <Html5Audio src={staticFile(audio)} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
