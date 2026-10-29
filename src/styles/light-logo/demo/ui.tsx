// Light Logo · the two 2D layers over the 3D: the glowing cut line and film grain (1920×1080 design space).
import React from "react";
import { C, LY, W } from "./lib";

type P = React.CSSProperties;
/** the cut line: a hot thin line with a soft glow */
export const Line: React.FC<{ x0?: number; x1?: number; y?: number; th?: number; o?: number; glow?: number; color?: string }> = ({ x0 = 0, x1 = W, y = LY, th = 2, o = 1, glow = 1, color = C.line }) => {
  if (x1 - x0 < 0.5 || o <= 0.001) return null;
  return (
    <>
      {glow > 0 && <div style={{ position: "absolute", left: x0 - 40, width: x1 - x0 + 80, top: y - 28 * glow, height: 56 * glow, borderRadius: "50%", background: `radial-gradient(ellipse at 50% 50%, rgba(255,236,210,${0.22 * o * Math.min(1.5, glow)}) 0%, rgba(255,236,210,0) 70%)`, pointerEvents: "none" }} />}
      <div style={{ position: "absolute", left: x0, width: x1 - x0, top: y - th / 2, height: th, background: color, opacity: o, boxShadow: `0 0 ${6 + 10 * glow}px rgba(255,240,215,${0.75 * Math.min(1, glow)})` }} />
    </>
  );
};
/** animated film grain (an SVG noise tile that moves every frame) */
export const Grain: React.FC<{ frame: number; o?: number; blend?: P["mixBlendMode"] }> = ({ frame, o = 0.07, blend = "overlay" }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      opacity: o,
      mixBlendMode: blend,
      pointerEvents: "none",
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' seed='${frame % 11}'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.6 -0.45'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
      backgroundPosition: `${(frame * 37) % 300}px ${(frame * 71) % 300}px`,
    }}
  />
);
