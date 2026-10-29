import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { camAt, clamp, Key, VH, VW } from "./lib";

// A still illustration filmed by a camera: keys give the focus point (0..1 of the image) and zoom (1 = cover).
// Images are 2160×3870 (≈9:16). `grade` darkens / warms the frame (for the dusk → night arc).
const IMG_W = 2160, IMG_H = 3870;

export const Pic: React.FC<{
  src: string;
  t: number;
  keys: Key[];
  off?: { x: number; y: number };
  grade?: { dark?: number; sat?: number; blur?: number };
  children?: (map: (x: number, y: number) => [number, number], z: number) => React.ReactNode;
}> = ({ src, t, keys, off = { x: 0, y: 0 }, grade = {}, children }) => {
  const k = camAt(keys, t);
  const base = Math.max(VW / IMG_W, VH / IMG_H);
  const s = base * k.z;
  const dw = IMG_W * s, dh = IMG_H * s;
  const left = clamp(VW / 2 - k.x * dw, VW - dw, 0) + off.x;
  const top = clamp(VH / 2 - k.y * dh, VH - dh, 0) + off.y;
  // image-space (0..1) → screen px, for overlays pinned to things in the picture
  const map = (x: number, y: number): [number, number] => [left + x * dw, top + y * dh];
  const dark = grade.dark ?? 0;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#1E120C" }}>
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: IMG_W,
          height: IMG_H,
          maxWidth: "none", // tailwind preflight caps img at 100%
          maxHeight: "none",
          transformOrigin: "0 0",
          transform: `translate(${left}px, ${top}px) scale(${s})`,
          filter: `brightness(${1 - dark}) saturate(${grade.sat ?? 1}) ${grade.blur ? `blur(${grade.blur}px)` : ""}`,
        }}
      />
      {children?.(map, k.z)}
    </AbsoluteFill>
  );
};
