// Motion FX for Receipt UI: bursts, rings, float-ups, flying chips, hearts, idle float. All pure functions of frame.
import React from "react";
import { C, clamp, easeBack, easeOut, FONT_MONO, ramp, rnd } from "./theme";

/** Idle float: small bob + tilt for any absolutely-positioned block. */
export const floatStyle = (f: number, seed = 0, amp = 8): React.CSSProperties => ({
  transform: `translateY(${Math.sin(f / 22 + seed) * amp}px) rotate(${Math.sin(f / 31 + seed * 2) * 0.8}deg)`,
});

/** Particle burst (confetti rects + sparks) from (x,y) starting at local frame `at`. */
export const Burst: React.FC<{ x: number; y: number; f: number; at: number; n?: number; colors?: string[]; power?: number; seed?: number }> = ({
  x, y, f, at, n = 22, colors = [C.red, C.blue, "#f5b700", C.green], power = 1, seed = 1,
}) => {
  const t = f - at;
  if (t < 0 || t > 34) return null;
  return (
    <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {Array.from({ length: n }, (_, i) => {
        const ang = rnd(i * 7 + seed) * Math.PI * 2;
        const sp = (9 + rnd(i * 3 + seed) * 13) * power;
        const px = x + Math.cos(ang) * sp * t;
        const py = y + Math.sin(ang) * sp * t + 0.55 * t * t;
        const life = 1 - t / 34;
        const s = 7 + rnd(i + seed) * 9;
        return i % 3 === 0
          ? <circle key={i} cx={px} cy={py} r={s * 0.4 * life + 1} fill={colors[i % colors.length]} opacity={life} />
          : <rect key={i} x={px - s / 2} y={py - s / 4} width={s} height={s / 2} rx="1.5" fill={colors[i % colors.length]} opacity={life} transform={`rotate(${t * 22 + i * 40} ${px} ${py})`} />;
      })}
    </svg>
  );
};

/** Expanding rings (one-shot at `at`, or continuous every `every` frames). */
export const Rings: React.FC<{ x: number; y: number; f: number; at?: number; every?: number; color?: string; r0?: number; r1?: number; n?: number }> = ({
  x, y, f, at = 0, every, color = C.blue, r0 = 20, r1 = 110, n = 2,
}) => {
  const items: number[] = [];
  if (every) for (let k = 0; k < n; k++) items.push((((f - at) + (k * every) / n) % every) / every);
  else for (let k = 0; k < n; k++) { const p = (f - at - k * 6) / 26; if (p >= 0 && p <= 1) items.push(p); }
  if (f < at) return null;
  return (
    <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {items.map((p, i) => <circle key={i} cx={x} cy={y} r={r0 + (r1 - r0) * p} fill="none" stroke={color} strokeWidth={4 * (1 - p) + 1} opacity={(1 - p) * 0.8} />)}
    </svg>
  );
};

/** Text that pops and floats up (e.g. "−$29"). */
export const FloatUp: React.FC<{ x: number; y: number; f: number; at: number; text: string; color?: string; size?: number; dur?: number }> = ({ x, y, f, at, text, color = C.red, size = 34, dur = 30 }) => {
  const t = f - at;
  if (t < 0 || t > dur) return null;
  const p = t / dur;
  return (
    <div style={{ position: "absolute", left: x - 150, top: y - p * 110, width: 300, textAlign: "center", fontFamily: FONT_MONO, fontWeight: 800, fontSize: size, color,
      opacity: p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3, transform: `scale(${ramp(t, 0, 7, easeBack)})`, textShadow: "0 4px 14px rgba(0,0,0,.18)" }}>{text}</div>
  );
};

/** Red amount chip flying along an arc from a stage point into the receipt (arrives at local frame `at`). */
export const FlyChip: React.FC<{ from: [number, number]; to?: [number, number]; f: number; at: number; text: string; dur?: number }> = ({ from, to = [540, 470], f, at, text, dur = 16 }) => {
  const p = (f - (at - dur)) / dur;
  if (p < 0 || p > 1) return null;
  const e = easeOut(clamp(p));
  const x = from[0] + (to[0] - from[0]) * e;
  const y = from[1] + (to[1] - from[1]) * e - Math.sin(Math.PI * e) * 180;
  const s = 1.25 - 0.55 * e;
  return (
    <div style={{ position: "absolute", left: x - 110, top: y - 30, width: 220, height: 60, borderRadius: 30, background: C.red, color: "#fff", fontFamily: FONT_MONO, fontWeight: 800, fontSize: 28,
      textAlign: "center", lineHeight: "60px", transform: `scale(${s}) rotate(${(1 - e) * -14}deg)`, boxShadow: "0 12px 30px rgba(229,72,77,.55)", zIndex: 50 }}>{text}</div>
  );
};

/** Floating hearts (IG-live style) from (x,y) between frames a..b. */
export const Hearts: React.FC<{ x: number; y: number; f: number; a: number; b: number; n?: number }> = ({ x, y, f, a, b, n = 14 }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const start = a + (i * (b - a)) / n;
      const t = f - start;
      if (t < 0 || t > 45) return null;
      const p = t / 45;
      return (
        <div key={i} style={{ position: "absolute", left: x + Math.sin(t / 6 + i) * 30 + (rnd(i) - 0.5) * 60, top: y - p * 520, fontSize: 36 + rnd(i + 3) * 24, color: i % 3 ? C.red : "#ff7aa2",
          opacity: p < 0.75 ? 1 : 1 - (p - 0.75) / 0.25, transform: `scale(${ramp(t, 0, 6, easeBack)})` }}>♥</div>
      );
    })}
  </>
);

/** Dots streaming along a quadratic/arc path function (continuous). */
export const Stream: React.FC<{ pt: (k: number) => [number, number]; f: number; n?: number; speed?: number; color?: string; r?: number; a?: number }> = ({ pt, f, n = 7, speed = 0.018, color = C.blue, r = 6, a = 1 }) => (
  <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: a }}>
    {Array.from({ length: n }, (_, i) => {
      const k = ((f * speed + i / n) % 1 + 1) % 1;
      const [x, y] = pt(k);
      return <circle key={i} cx={x} cy={y} r={r * (0.6 + 0.4 * Math.sin(Math.PI * k))} fill={color} opacity={Math.sin(Math.PI * k)} />;
    })}
  </svg>
);
