// Camera + post: a "world" is a big canvas; the camera flies over it with eased keyframes, handheld drift and
// velocity-based directional motion blur. Plus grain, vignette, light leaks, dust.
import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp, rnd, V } from "./theme";

/** [time s, x, y, zoom, rot°] — x/y = world point at screen centre. */
export type CamKey = [number, number, number, number, number?];
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

export const camAt = (keys: CamKey[], t: number) => {
  if (t <= keys[0][0]) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t <= b[0]) {
      const k = ease(clamp((t - a[0]) / (b[0] - a[0])));
      return [t, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, a[3] + (b[3] - a[3]) * k, (a[4] ?? 0) + ((b[4] ?? 0) - (a[4] ?? 0)) * k] as CamKey;
    }
  }
  return keys[keys.length - 1];
};

/** Directional blur filters (use via `mblur`). */
export const BlurDefs: React.FC = () => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
    {[3, 8, 16, 30, 50].map((n) => (
      <React.Fragment key={n}>
        <filter id={`smx-${n}`} x="-20%" y="-5%" width="140%" height="110%"><feGaussianBlur stdDeviation={`${n} 0`} /></filter>
        <filter id={`smy-${n}`} x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation={`0 ${n}`} /></filter>
      </React.Fragment>
    ))}
  </svg>
);
export const mblur = (px: number, axis: "x" | "y") => {
  if (px < 2.5) return "";
  const n = [3, 8, 16, 30, 50].reduce((b, v) => (Math.abs(v - px) < Math.abs(b - px) ? v : b), 3);
  return `url(#sm${axis}-${n})`;
};

/**
 * World viewport. Children are laid out in world coordinates (px). hand = handheld amplitude (px).
 * Motion blur is derived from camera velocity between t and t+1/30.
 */
export const World: React.FC<{ t: number; keys: CamKey[]; w?: number; h?: number; hand?: number; blur?: boolean; bg?: string; children: React.ReactNode; style?: React.CSSProperties; sw?: number; sh?: number }> = ({ t, keys, w = V.W, h = V.H, hand = 4, blur = true, bg, children, style, sw = V.W, sh = V.H }) => {
  const [, x, y, z, r = 0] = camAt(keys, t);
  const [, x2, y2, z2] = camAt(keys, t + 1 / 30);
  const hx = (Math.sin(t * 1.3) + Math.sin(t * 2.9 + 1) * 0.5) * hand, hy = (Math.cos(t * 1.1) + Math.sin(t * 3.7) * 0.4) * hand;
  const vx = Math.abs(x2 - x) * z, vy = Math.abs(y2 - y) * z, vz = Math.abs(z2 - z) * 400;
  const f = blur ? [mblur(vx * 0.32, "x"), mblur(vy * 0.32, "y"), vz > 6 ? `blur(${Math.min(4, (vz - 6) * 0.15)}px)` : ""].filter(Boolean).join(" ") : "";
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: bg, ...style }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transformOrigin: "0 0", transform: `translate(${sw / 2 + hx}px, ${sh / 2 + hy}px) rotate(${r}deg) scale(${z}) translate(${-x}px, ${-y}px)`, filter: f || undefined }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};

/* ───────── post ───────── */
export const Grain: React.FC<{ f: number; o?: number }> = ({ f, o = 0.08 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity: o }}>
    <svg width="100%" height="100%">
      <filter id="sm-grain"><feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed={f % 89} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width="100%" height="100%" filter="url(#sm-grain)" />
    </svg>
  </AbsoluteFill>
);
export const Vignette: React.FC<{ o?: number }> = ({ o = 0.55 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,${o}) 100%)` }} />
);
/** Floating dust motes in a light cone / dark room. */
export const Dust: React.FC<{ t: number; n?: number; x?: number; w?: number; y?: number; h?: number; color?: string; o?: number }> = ({ t, n = 40, x = 0, w = V.W, y = 0, h = V.H, color = "255,255,255", o = 0.6 }) => (
  <svg width={V.W} height={V.H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
    {Array.from({ length: n }, (_, i) => {
      const px = x + ((rnd(i) * w + Math.sin(t * 0.4 + i) * 30) % w);
      const py = y + (((rnd(i + 99) * h - t * (8 + rnd(i + 7) * 18)) % h) + h) % h;
      const r = 1 + rnd(i + 3) * 2.6;
      return <circle key={i} cx={px} cy={py} r={r} fill={`rgba(${color},${o * (0.3 + 0.7 * Math.abs(Math.sin(t * 1.5 + i)))})`} />;
    })}
  </svg>
);
/** Diagonal light sweep (shine) passing across an element. p 0..1. */
export const Sweep: React.FC<{ p: number; w?: number; o?: number }> = ({ p, w = 180, o = 0.55 }) =>
  p <= 0 || p >= 1 ? null : (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", mixBlendMode: "screen" }}>
      <div style={{ position: "absolute", top: "-50%", height: "200%", width: w, left: `${-20 + p * 140}%`, transform: "rotate(20deg)", background: `linear-gradient(90deg, transparent, rgba(255,255,255,${o}), transparent)` }} />
    </div>
  );
/** Warm light leak flash for transitions. k 0..1 intensity. */
export const Leak: React.FC<{ k: number; x?: number; y?: number; color?: string }> = ({ k, x = 70, y = 20, color = "255,170,90" }) =>
  k <= 0 ? null : <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", background: `radial-gradient(circle at ${x}% ${y}%, rgba(${color},${0.75 * k}), rgba(${color},${0.25 * k}) 35%, transparent 65%)` }} />;
