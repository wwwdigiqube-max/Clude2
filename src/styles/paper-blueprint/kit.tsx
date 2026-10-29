import { evolvePath } from "@remotion/paths";
import React from "react";
import { AbsoluteFill } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../../fonts";
import { B, clamp, easeOut, fa, H, P, ramp, rnd, typed, W } from "./theme";

export type World = "paper" | "blue";

/* ------------------------------------------------------------------ paper world */

/** Ink boil (redrawn look on ~10fps) + hatch patterns. Put once inside each paper <svg>. */
export const InkDefs: React.FC<{ f: number }> = ({ f }) => (
  <defs>
    <filter id="boil" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves={2} seed={Math.floor(f / 3) % 50} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={3.5} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <pattern id="hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
      <line x1="0" y1="0" x2="0" y2="9" stroke={P.ink} strokeWidth="1.6" opacity=".55" />
    </pattern>
    <pattern id="hatchDense" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)">
      <line x1="0" y1="0" x2="0" y2="6" stroke={P.ink} strokeWidth="1.5" opacity=".6" />
    </pattern>
  </defs>
);

export const PaperBG: React.FC<{ stripe?: "blue" | "gold"; cx?: number; cy?: number }> = ({ stripe = "blue", cx = 960, cy = 520 }) => {
  const s = stripe === "blue" ? P.stripeBlue : P.stripeGold;
  return (
    <AbsoluteFill style={{ background: P.paper }}>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <pattern id="stripes" width="300" height="300" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
            <rect width="150" height="300" fill={s} />
            <rect x="150" width="150" height="300" fill={P.paper} />
          </pattern>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={4} />
            <feColorMatrix values="0 0 0 0 0.17  0 0 0 0 0.14  0 0 0 0 0.12  0 0 0 -1.1 0.62" />
          </filter>
        </defs>
        <rect width={W} height={H} fill="url(#stripes)" />
        {/* faint construction guides, like the reference */}
        <g fill="none" stroke={P.ink} opacity=".1">
          <circle cx={cx} cy={cy} r="380" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="260" strokeWidth="1.5" strokeDasharray="4 10" />
          <line x1={cx - 520} y1={cy} x2={cx + 520} y2={cy} strokeWidth="1.5" />
          <line x1={cx} y1={cy - 440} x2={cx} y2={cy + 440} strokeWidth="1.5" />
          {Array.from({ length: 48 }, (_, i) => {
            const a = (i / 48) * Math.PI * 2;
            const r1 = 380, r2 = i % 4 === 0 ? 400 : 390;
            return <line key={i} x1={cx + Math.cos(a) * r1} y1={cy + Math.sin(a) * r1} x2={cx + Math.cos(a) * r2} y2={cy + Math.sin(a) * r2} strokeWidth="2" />;
          })}
        </g>
        <rect width={W} height={H} filter="url(#grain)" opacity=".5" style={{ mixBlendMode: "multiply" }} />
      </svg>
    </AbsoluteFill>
  );
};

/** Ink ground line with pebbles and grass tufts. */
export const Ground: React.FC<{ y?: number; x0?: number; x1?: number; seed?: number }> = ({ y = 820, x0 = 120, x1 = 1800, seed = 1 }) => (
  <g>
    <path d={`M${x0} ${y} C ${x0 + 400} ${y - 3}, ${x1 - 600} ${y + 3}, ${x1} ${y - 1}`} stroke={P.ink} strokeWidth="4" fill="none" strokeLinecap="round" />
    {Array.from({ length: 34 }, (_, i) => {
      const x = x0 + 30 + rnd(i + seed * 50) * (x1 - x0 - 60);
      const yy = y + 12 + rnd(i * 3 + seed) * 34;
      const r = 3 + rnd(i * 7 + seed) * 5;
      return <ellipse key={i} cx={x} cy={yy} rx={r * 1.4} ry={r * 0.8} fill="none" stroke={P.ink} strokeWidth="1.8" opacity=".55" />;
    })}
    {Array.from({ length: 16 }, (_, i) => {
      const x = x0 + 40 + rnd(i * 11 + seed * 9) * (x1 - x0 - 80);
      return (
        <path key={i} d={`M${x - 8} ${y} L${x - 11} ${y - 14} M${x} ${y} L${x} ${y - 18} M${x + 8} ${y} L${x + 12} ${y - 13}`} stroke={P.grass} strokeWidth="2.4" strokeLinecap="round" />
      );
    })}
    {Array.from({ length: 70 }, (_, i) => (
      <circle key={`d${i}`} cx={x0 + rnd(i * 13 + seed) * (x1 - x0)} cy={y + 8 + rnd(i * 17 + seed) * 70} r="1.4" fill={P.ink} opacity=".35" />
    ))}
  </g>
);

type Mood = "calm" | "determined" | "confused" | "happy";

/** The search agent (paper version). Origin = between the feet. */
export const Robot: React.FC<{
  x: number; y: number; s?: number; f: number; walking?: boolean; mood?: Mood; look?: number; arm?: number; hold?: React.ReactNode; jump?: number;
}> = ({ x, y, s = 1, f, walking = false, mood = "calm", look = 0, arm = 0, hold, jump = 0 }) => {
  const w = f * 0.42;
  const legL = walking ? -Math.max(0, Math.sin(w)) * 11 : 0;
  const legR = walking ? -Math.max(0, -Math.sin(w)) * 11 : 0;
  const bob = walking ? -Math.abs(Math.sin(w)) * 6 : Math.sin(f / 9) * 2.5;
  const blink = f % 97 < 4 && mood !== "happy" ? 0.12 : 1;
  const hx = 96 + 14 * arm, hy = -44 - 110 * arm;
  const lx = look * 7;
  return (
    <g transform={`translate(${x} ${y - jump}) scale(${s})`}>
      <ellipse cx="0" cy={4 + jump / s} rx={70 - jump * 0.15} ry="9" fill={P.ink} opacity=".16" />
      <rect x="-44" y={-24 + legL} width="26" height="24" rx="9" fill={P.ink} />
      <rect x="18" y={-24 + legR} width="26" height="24" rx="9" fill={P.ink} />
      <g transform={`translate(0 ${bob})`}>
        {/* far arm */}
        <path d="M-80 -84 Q -104 -64 -98 -42" stroke={P.ink} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M-6 -154 Q -2 -176 6 -192" stroke={P.ink} strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="7" cy="-200" r="11" fill={P.gold} stroke={P.ink} strokeWidth="4.5" />
        <rect x="-84" y="-156" width="168" height="134" rx="42" fill={P.red} stroke={P.ink} strokeWidth="6.5" />
        <clipPath id="robotBody">
          <rect x="-84" y="-156" width="168" height="134" rx="42" />
        </clipPath>
        <g clipPath="url(#robotBody)">
          <circle cx="70" cy="-10" r="90" fill="url(#hatch)" />
        </g>
        <rect x="-64" y="-140" width="30" height="15" rx="7" fill="#fff" opacity=".55" />
        {/* face */}
        {mood === "happy" ? (
          <g stroke={P.ink} strokeWidth="6" fill="none" strokeLinecap="round">
            <path d={`M${-44 + lx} -90 Q ${-32 + lx} -108 ${-20 + lx} -90`} />
            <path d={`M${16 + lx} -90 Q ${28 + lx} -108 ${40 + lx} -90`} />
          </g>
        ) : (
          <g transform={`translate(${lx} -92) scale(1 ${blink}) translate(${-lx} 92)`}>
            <ellipse cx={-32 + lx} cy="-92" rx="11" ry="15" fill={P.ink} />
            <ellipse cx={28 + lx} cy="-92" rx="11" ry="15" fill={P.ink} />
            <circle cx={-28 + lx} cy="-98" r="3.5" fill="#fff" />
            <circle cx={32 + lx} cy="-98" r="3.5" fill="#fff" />
          </g>
        )}
        <g stroke={P.ink} strokeWidth="5" fill="none" strokeLinecap="round">
          {mood === "determined" && <path d={`M${-46 + lx} -120 L${-20 + lx} -113 M${14 + lx} -113 L${40 + lx} -120`} />}
          {mood === "confused" && <path d={`M${-46 + lx} -118 Q ${-33 + lx} -130 ${-20 + lx} -120 M${14 + lx} -116 L${40 + lx} -116`} />}
          {mood === "calm" && <path d={`M${-12 + lx} -60 Q ${-2 + lx} -54 ${8 + lx} -60`} />}
          {mood === "determined" && <path d={`M${-12 + lx} -58 L${8 + lx} -58`} />}
          {mood === "confused" && <path d={`M${-14 + lx} -58 q 6 -6 12 0 t 12 0`} />}
        </g>
        {mood === "happy" && <path d={`M${-16 + lx} -66 Q ${-2 + lx} -44 ${12 + lx} -66 Z`} fill={P.ink} />}
        {/* near arm */}
        <path d={`M78 -84 Q ${96 + 10 * arm} ${-70 - 40 * arm} ${hx} ${hy}`} stroke={P.ink} strokeWidth="6.5" fill="none" strokeLinecap="round" />
        <circle cx={hx} cy={hy} r="10" fill={P.red} stroke={P.ink} strokeWidth="5" />
        {hold && <g transform={`translate(${hx} ${hy})`}>{hold}</g>}
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ blueprint world */

export const BlueDefs: React.FC = () => (
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="a" />
      <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="a" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.2" result="a" />
      <feMerge>
        <feMergeNode in="a" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);

export const BlueBG: React.FC<{ cx?: number; cy?: number; f?: number }> = ({ cx = 1180, cy = 560, f = 0 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${(cx / W) * 100}% ${(cy / H) * 100}%, ${B.bg1} 0%, #10154a 38%, ${B.bg0} 100%)` }}>
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <pattern id="gridS" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0 L0 0 0 40" fill="none" stroke={B.line} strokeWidth="1" opacity=".06" />
        </pattern>
        <pattern id="gridL" width="200" height="200" patternUnits="userSpaceOnUse">
          <path d="M200 0 L0 0 0 200" fill="none" stroke={B.line} strokeWidth="1" opacity=".1" />
        </pattern>
        <filter id="bgrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={9} />
          <feColorMatrix values="0 0 0 0 0.75  0 0 0 0 0.8  0 0 0 0 1  0 0 0 -1.2 0.7" />
        </filter>
      </defs>
      <rect width={W} height={H} fill="url(#gridS)" />
      <rect width={W} height={H} fill="url(#gridL)" />
      <g fill="none" stroke={B.line}>
        {[240, 390, 560, 760].map((r, i) => (
          <circle key={r} cx={cx} cy={cy} r={r} strokeWidth="1.2" opacity={0.1 - i * 0.015} strokeDasharray={i % 2 ? "3 9" : undefined} />
        ))}
        <g transform={`rotate(${f * 0.05} ${cx} ${cy})`} opacity=".14">
          {Array.from({ length: 120 }, (_, i) => {
            const a = (i / 120) * Math.PI * 2;
            const r1 = 390, r2 = i % 10 === 0 ? 412 : 400;
            return <line key={i} x1={cx + Math.cos(a) * r1} y1={cy + Math.sin(a) * r1} x2={cx + Math.cos(a) * r2} y2={cy + Math.sin(a) * r2} strokeWidth="1.2" />;
          })}
        </g>
        {/* frame brackets + ruler */}
        <g opacity=".35" strokeWidth="1.5">
          <path d="M36 70 V36 H70 M1850 36 H1884 V70 M1884 1010 V1044 H1850 M70 1044 H36 V1010" />
          <line x1="52" y1="60" x2="52" y2="1020" opacity=".5" />
          {Array.from({ length: 49 }, (_, i) => (
            <line key={i} x1="52" y1={60 + i * 20} x2={i % 5 === 0 ? 66 : 59} y2={60 + i * 20} opacity=".6" />
          ))}
          <line x1="180" y1="1044" x2="1740" y2="1044" opacity=".4" />
        </g>
      </g>
      <rect width={W} height={H} filter="url(#bgrain)" opacity=".22" style={{ mixBlendMode: "screen" }} />
    </svg>
  </AbsoluteFill>
);

export const Sparkle: React.FC<{ x: number; y: number; s?: number; f: number; color?: string }> = ({ x, y, s = 16, f, color = "#fff" }) => {
  const k = s * (0.8 + 0.25 * Math.sin(f / 4));
  return (
    <path
      transform={`translate(${x} ${y}) rotate(${f * 1.5})`}
      d={`M0 ${-k} Q0 0 ${k} 0 Q0 0 0 ${k} Q0 0 ${-k} 0 Q0 0 0 ${-k} Z`}
      fill={color}
      filter="url(#glow)"
    />
  );
};

/** A path that draws itself (solid mask) and shows as dashes flowing along it. */
export const DashedPath: React.FC<{ id: string; d: string; f: number; start: number; dur?: number; color?: string; width?: number; spark?: boolean }> = ({
  id, d, f, start, dur = 24, color = B.line, width = 2, spark = true,
}) => {
  const p = ramp(f, start, start + dur, easeOut);
  if (p <= 0) return null;
  const ev = evolvePath(p, d);
  return (
    <g>
      <mask id={id}>
        <path d={d} stroke="#fff" strokeWidth={width + 8} fill="none" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
      </mask>
      <path d={d} mask={`url(#${id})`} stroke={color} strokeWidth={width} fill="none" strokeDasharray="7 9" strokeDashoffset={-f * 1.2} opacity=".85" />
      {spark && p < 1 && <PathHead d={d} p={p} f={f} />}
    </g>
  );
};

const PathHead: React.FC<{ d: string; p: number; f: number }> = ({ d, p, f }) => {
  // position of the drawing head, via a temporary SVG path (browser only)
  if (typeof document === "undefined") return null;
  const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
  el.setAttribute("d", d);
  const pt = el.getPointAtLength(el.getTotalLength() * p);
  return <Sparkle x={pt.x} y={pt.y} s={13} f={f} />;
};

/** Circular node with tick ring (reference's DNS/server nodes). */
export const TickDial: React.FC<{ x: number; y: number; r?: number; f: number; appear?: number; active?: boolean; children?: React.ReactNode }> = ({
  x, y, r = 64, f, appear = 1, active = false, children,
}) => (
  <g transform={`translate(${x} ${y}) scale(${appear})`} opacity={appear}>
    <circle r={r + 30} fill={B.line} opacity=".04" />
    <circle r={r} fill={B.bg0} stroke={active ? B.pink : B.line} strokeWidth="2" opacity=".95" />
    <circle r={r - 10} fill="none" stroke={B.line} strokeWidth="1" opacity=".35" />
    <g transform={`rotate(${f * 0.6})`} opacity=".6">
      {Array.from({ length: 40 }, (_, i) => {
        const a = (i / 40) * Math.PI * 2;
        return <line key={i} x1={Math.cos(a) * (r + 6)} y1={Math.sin(a) * (r + 6)} x2={Math.cos(a) * (r + (i % 5 ? 11 : 16))} y2={Math.sin(a) * (r + (i % 5 ? 11 : 16))} stroke={B.line} strokeWidth="1.4" />;
      })}
    </g>
    {children}
  </g>
);

/** The same agent, drawn as a blueprint line figure. Origin = between the feet. */
export const RobotLine: React.FC<{ x: number; y: number; s?: number; f: number; look?: number; wave?: boolean }> = ({ x, y, s = 1, f, look = 0, wave = false }) => {
  const bob = Math.sin(f / 9) * 2.5;
  const blink = f % 89 < 4 ? 0.1 : 1;
  const lx = look * 6;
  const armA = wave ? Math.sin(f / 4) * 22 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={B.line} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="-30" y="-16" width="18" height="14" rx="6" strokeWidth="2.5" />
      <rect x="12" y="-16" width="18" height="14" rx="6" strokeWidth="2.5" />
      <g transform={`translate(0 ${bob})`}>
        <path d="M-52 -60 L-70 -74" strokeWidth="2.5" />
        <circle cx="-72" cy="-76" r="4" strokeWidth="2.5" />
        <g transform={`rotate(${-armA} 52 -60)`}>
          <path d="M52 -60 L70 -76" strokeWidth="2.5" />
          <circle cx="72" cy="-78" r="4" strokeWidth="2.5" />
        </g>
        <path d="M0 -108 L0 -126" strokeWidth="2.5" />
        <circle cx="0" cy="-131" r="5" fill={B.pink} stroke="none" filter="url(#glow)" />
        <rect x="-52" y="-108" width="104" height="92" rx="26" strokeWidth="3" fill={B.bg0} />
        <rect x="-42" y="-98" width="84" height="72" rx="18" strokeWidth="1.5" opacity=".45" />
        <g transform={`translate(0 -64) scale(1 ${blink}) translate(0 64)`} stroke={B.white}>
          <path d={`M${-18 + lx} -70 L${-18 + lx} -58`} strokeWidth="5" />
          <path d={`M${18 + lx} -70 L${18 + lx} -58`} strokeWidth="5" />
        </g>
        <path d={`M${-7 + lx} -42 Q ${lx} -37 ${7 + lx} -42`} strokeWidth="2.5" stroke={B.white} />
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ chrome (RTL) */

export const Chrome: React.FC<{ world: World; title: string; chapter: string; f: number; progress: number }> = ({ world, title, chapter, f, progress }) => {
  const ink = world === "paper" ? P.ink : B.white;
  const accent = world === "paper" ? P.gold : B.white;
  const t = typed(title, f, 2, 26);
  const under = ramp(f, 4, 18, easeOut);
  const R = 40, C = 2 * Math.PI * R;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 1200, top: 58, width: 610, direction: "rtl", textAlign: "right", fontFamily: FONT_TEXT, fontSize: 46, color: ink, whiteSpace: "nowrap" }}>
        {t}
        <span style={{ opacity: f % 16 < 8 && t.length < Array.from(title).length + 3 ? 1 : 0 }}>▏</span>
      </div>
      <div style={{ position: "absolute", left: 1810 - 170 * under, top: 128, width: 170 * under, height: 5, borderRadius: 3, background: accent }} />
      <svg width="140" height="170" style={{ position: "absolute", left: 60, top: 40 }}>
        <g transform="translate(70 62) rotate(-90)">
          <circle r={R} fill="none" stroke={ink} strokeWidth="4" opacity=".18" />
          <circle r={R} fill="none" stroke={world === "paper" ? P.pink : B.pink} strokeWidth="4.5" strokeLinecap="round" strokeDasharray={`${C * clamp(progress)} ${C}`} />
        </g>
        <rect x="61" y="53" width="18" height="18" rx="4" fill={world === "paper" ? P.red : B.coral} />
      </svg>
      <div style={{ position: "absolute", left: 30, top: 128, width: 200, textAlign: "center", direction: "rtl", fontFamily: FONT_TEXT, fontSize: 24, color: ink, opacity: 0.8 }}>
        {chapter}
      </div>
    </AbsoluteFill>
  );
};

/** Story line at the bottom. Segments appear one after another. */
export const Caption: React.FC<{ world: World; f: number; parts: [string, number][] }> = ({ world, f, parts }) => {
  const color = world === "paper" ? P.ink : "#e3e7ff";
  return (
    <div
      style={{
        position: "absolute", left: 160, top: 944, width: 1600, textAlign: "center", direction: "rtl",
        fontFamily: FONT_TEXT, fontSize: 42, color, whiteSpace: "nowrap",
        textShadow: world === "blue" ? "0 0 18px rgba(140,160,255,.35)" : "none",
      }}
    >
      {parts.map(([txt, at], i) => {
        const a = ramp(f, at, at + 12, easeOut);
        return (
          <span key={i} style={{ display: "inline-block", opacity: a, transform: `translateY(${(1 - a) * 14}px)`, filter: `blur(${(1 - a) * 4}px)`, marginLeft: 14 }}>
            {txt}
          </span>
        );
      })}
    </div>
  );
};

/** Text label placed by its center point (RTL-safe: explicit left/top). */
export const Label: React.FC<{ x: number; y: number; size?: number; color?: string; font?: "text" | "num" | "mono"; children: React.ReactNode; style?: React.CSSProperties; w?: number }> = ({
  x, y, size = 28, color = P.ink, font = "text", children, style, w = 900,
}) => (
  <div
    style={{
      position: "absolute", left: x - w / 2, top: y - size * 0.75, width: w, textAlign: "center",
      direction: font === "mono" ? "ltr" : "rtl", unicodeBidi: "isolate",
      fontFamily: font === "num" ? FONT_NUM : font === "mono" ? "Consolas, monospace" : FONT_TEXT,
      fontSize: size, color, lineHeight: 1.5, whiteSpace: "nowrap", ...style,
    }}
  >
    {children}
  </div>
);

export { fa };
