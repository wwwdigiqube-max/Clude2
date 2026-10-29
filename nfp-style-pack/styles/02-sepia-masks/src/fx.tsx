import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { clamp, P, rnd } from "./theme";

// ================= old-film finish (applied once by Video.tsx on top of every scene) =================
/** tiny projector gate weave: apply as translate() to the scene layer */
export const weave = (f: number) => ({ x: (rnd(f * 0.37 + 5) - 0.5) * 2.4, y: (rnd(f * 0.53 + 9) - 0.5) * 3.2 });

export const FilmFinish: React.FC<{ f: number; vig?: number; flicker?: number; dust?: number }> = ({ f, vig = 0.78, flicker = 1, dust = 1 }) => {
  const k = Math.floor(f / 2);
  const gx = Math.floor(rnd(k) * 120), gy = Math.floor(rnd(k + 99) * 120);
  const fl = (rnd(f * 1.13) * 0.06 + (rnd(Math.floor(f / 7)) > 0.92 ? 0.08 : 0)) * flicker;
  // dust specks: new every frame
  const specks = Array.from({ length: Math.floor(4 + rnd(f * 2.1) * 6 * dust) }, (_, i) => {
    const r = (s: number) => rnd(f * 17.3 + i * 7.1 + s);
    return { x: r(1) * 1080, y: r(2) * 1920, s: 1.5 + r(3) * 4.5, light: r(4) > 0.6, o: 0.35 + r(5) * 0.5 };
  });
  // one long vertical scratch that lives for a few frames
  const sc = Math.floor(f / 9);
  const scratchOn = rnd(sc * 3.3) > 0.55;
  const sx = rnd(sc * 5.7) * 1080 + Math.sin(f * 0.9) * 3;
  // a hair now and then
  const hair = rnd(Math.floor(f / 5) * 2.9) > 0.86;
  const hx = rnd(Math.floor(f / 5) * 8.1) * 900 + 90, hy = rnd(Math.floor(f / 5) * 4.4) * 1600 + 160;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* sepia unifier: keeps every scene in one colour family */}
      <AbsoluteFill style={{ background: P.amber, mixBlendMode: "soft-light", opacity: 0.28 }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 62% at 50% 46%, rgba(0,0,0,0) 48%, rgba(10,6,3,${vig}) 100%)` }} />
      <Img
        src={staticFile("v02/grain.jpg")}
        style={{ position: "absolute", left: -gx, top: -gy, width: 1200, height: 2040, maxWidth: "none", mixBlendMode: "overlay", opacity: 0.22 }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {specks.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.s} fill={p.light ? P.bone : P.ink} opacity={p.o} />
        ))}
        {scratchOn && <line x1={sx} y1={0} x2={sx + 4} y2={1920} stroke={P.bone} strokeWidth={1.6} opacity={0.18 + rnd(f) * 0.12} />}
        {hair && (
          <path
            d={`M ${hx} ${hy} q 30 -40 10 -90 t 25 -80`}
            stroke={P.ink}
            strokeWidth={2.2}
            fill="none"
            opacity={0.55}
          />
        )}
      </svg>
      <AbsoluteFill style={{ background: "#000", opacity: clamp(fl) }} />
    </AbsoluteFill>
  );
};

// ================= light & atmosphere =================
/** soft volumetric cone from (x, top) widening downwards */
export const LightCone: React.FC<{ x: number; top: number; h: number; wTop: number; wBot: number; o?: number; color?: string; blur?: number; id: string }> = ({
  x,
  top,
  h,
  wTop,
  wBot,
  o = 0.5,
  color = P.amberHi,
  blur = 18,
  id,
}) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, filter: `blur(${blur}px)`, mixBlendMode: "screen" }}>
    <defs>
      <linearGradient id={`lc-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color} stopOpacity={o} />
        <stop offset="1" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
    <polygon points={`${x - wTop / 2},${top} ${x + wTop / 2},${top} ${x + wBot / 2},${top + h} ${x - wBot / 2},${top + h}`} fill={`url(#lc-${id})`} />
  </svg>
);

/** radial glow (eyes, lamps) */
export const Glow: React.FC<{ x: number; y: number; r: number; o?: number; color?: string }> = ({ x, y, r, o = 0.7, color = P.ember }) => (
  <div
    style={{
      position: "absolute",
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 70%)`,
      opacity: o,
      mixBlendMode: "screen",
      pointerEvents: "none",
    }}
  />
);

/** drifting fog band (several soft blobs) */
export const Fog: React.FC<{ t: number; y: number; h: number; o?: number; color?: string; seed?: number; speed?: number }> = ({ t, y, h, o = 0.35, color = P.sepia, seed = 1, speed = 14 }) => (
  <>
    {Array.from({ length: 6 }, (_, i) => {
      const r = (s: number) => rnd(seed * 31 + i * 7 + s);
      const w = 500 + r(1) * 600;
      const x = ((r(2) * 1500 + t * speed * (0.6 + r(3))) % 1700) - 400;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y + r(4) * h - h * 0.3,
            width: w,
            height: h * (0.6 + r(5) * 0.6),
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${color} 0%, rgba(0,0,0,0) 70%)`,
            opacity: o * (0.6 + r(6) * 0.4),
            filter: "blur(20px)",
            pointerEvents: "none",
          }}
        />
      );
    })}
  </>
);

/** floating motes in a light beam */
export const Motes: React.FC<{ t: number; x: number; y: number; w: number; h: number; n?: number; seed?: number; color?: string; size?: number }> = ({
  t,
  x,
  y,
  w,
  h,
  n = 24,
  seed = 1,
  color = P.amberHi,
  size = 4,
}) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const r = (k: number) => rnd(seed * 100 + i * 7 + k);
      const px = x + (((r(1) * w + Math.sin(t * (0.3 + r(2)) + i) * 26) % w) + w) % w;
      const py = y + (((r(4) * h - t * (8 + r(5) * 14)) % h) + h) % h;
      const tw = 0.3 + 0.7 * Math.abs(Math.sin(t * (0.8 + r(6) * 1.5) + i));
      const s = size * (0.5 + r(7));
      return <div key={i} style={{ position: "absolute", left: px, top: py, width: s, height: s, borderRadius: s, background: color, opacity: tw * 0.7 }} />;
    })}
  </>
);
