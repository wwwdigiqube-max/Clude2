// Ink icon set + story props (from video 07).
import React from "react";
import { P, rnd } from "./theme";

const S = { stroke: P.ink, strokeWidth: 5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export const Clapper: React.FC<{ open?: number }> = ({ open = 0 }) => (
  <g>
    <rect x="-62" y="-6" width="124" height="74" rx="6" fill={P.ink} {...S} />
    <rect x="-52" y="6" width="104" height="50" rx="4" fill="#3a332e" />
    <g transform={`rotate(${-open * 28} -62 -6)`}>
      <rect x="-62" y="-30" width="124" height="24" rx="4" fill={P.paperLight} {...S} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${-46 + i * 30} -30 l14 24`} stroke={P.ink} strokeWidth="9" />)}
    </g>
  </g>
);

export const Coin: React.FC = () => (
  <g>
    <circle r="26" fill={P.gold} {...S} />
    <circle r="16" fill="none" stroke={P.ink} strokeWidth="3" opacity=".5" />
    <path d="M-4 -12 V12 M4 -12 V12" stroke={P.ink} strokeWidth="4" />
  </g>
);

/** Wall calendar; flip 0..1 animates the top page folding up. */
export const Calendar: React.FC<{ flip?: number; red?: boolean }> = ({ flip = 0, red }) => (
  <g>
    <rect x="-120" y="-120" width="240" height="250" rx="10" fill={P.paperLight} {...S} />
    <rect x="-120" y="-120" width="240" height="56" rx="10" fill={red ? P.red : P.sky} {...S} />
    {[-70, 0, 70].map((x) => <rect key={x} x={x - 7} y="-138" width="14" height="34" rx="7" fill={P.ink} />)}
    {Array.from({ length: 20 }, (_, i) => (
      <rect key={i} x={-100 + (i % 5) * 42} y={-48 + Math.floor(i / 5) * 40} width="30" height="26" rx="4" fill={i === 17 ? P.red : "none"} stroke={P.ink} strokeWidth="2.5" opacity={i === 17 ? 1 : 0.55} />
    ))}
    {flip > 0 && flip < 1 && (
      <path d={`M-120 -64 H120 V${-64 + 190 * (1 - flip)} H-120 Z`} fill={P.paper} {...S} opacity={0.95} />
    )}
  </g>
);

export const Bulb: React.FC<{ glow?: number }> = ({ glow = 1 }) => (
  <g>
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return <path key={i} d={`M${Math.cos(a) * 52} ${-20 + Math.sin(a) * 52} L${Math.cos(a) * (62 + 10 * glow)} ${-20 + Math.sin(a) * (62 + 10 * glow)}`} stroke={P.gold} strokeWidth="6" strokeLinecap="round" opacity={glow} />;
    })}
    <circle cy="-20" r="38" fill={P.gold} {...S} />
    <rect x="-18" y="16" width="36" height="26" rx="4" fill={P.paperLight} {...S} />
    <path d="M-10 -24 q10 16 20 0" fill="none" stroke={P.ink} strokeWidth="3" />
  </g>
);

export const Script: React.FC = () => (
  <g>
    <path d="M-50 -64 H34 L54 -44 V64 H-50 Z" fill={P.paperLight} {...S} />
    {[-36, -18, 0, 18, 36].map((y, i) => <path key={y} d={`M-34 ${y} H${20 - (i % 2) * 18}`} stroke={P.ink} strokeWidth="3.5" opacity=".7" />)}
  </g>
);

export const Film: React.FC<{ t?: number }> = ({ t = 0 }) => (
  <g>
    <rect x="-64" y="-46" width="128" height="92" rx="6" fill={P.ink} {...S} />
    <rect x="-44" y="-30" width="88" height="60" fill={P.sky} />
    <path d={`M-44 30 L-14 ${-4 + Math.sin(t / 6) * 3} L6 14 L22 0 L44 30 Z`} fill={P.grass} />
    <circle cx="26" cy="-14" r="8" fill={P.gold} />
    {[-40, -16, 8, 32].map((x) => <g key={x}><rect x={x} y="-42" width="10" height="8" fill={P.paperLight} /><rect x={x} y="34" width="10" height="8" fill={P.paperLight} /></g>)}
  </g>
);

export const Mic: React.FC<{ t?: number }> = ({ t = 0 }) => (
  <g>
    {[1, 2].map((k) => <path key={k} d={`M${30 + k * 16} -46 q14 24 0 48`} fill="none" stroke={P.red} strokeWidth="4" opacity={0.4 + 0.6 * Math.abs(Math.sin(t / 5 + k))} />)}
    <rect x="-22" y="-66" width="44" height="76" rx="22" fill={P.redDark} {...S} />
    <path d="M-36 -16 q0 44 36 44 q36 0 36 -44 M0 28 V52 M-24 54 H24" fill="none" {...S} />
  </g>
);

export const Scissors: React.FC<{ t?: number }> = ({ t = 0 }) => {
  const o = 10 + Math.sin(t / 3) * 10;
  return (
    <g>
      <g transform={`rotate(${-o})`}><circle cx="-38" cy="18" r="16" fill="none" {...S} /><path d="M-24 10 L50 -6" {...S} strokeWidth={7} /></g>
      <g transform={`rotate(${o})`}><circle cx="-38" cy="-18" r="16" fill="none" {...S} /><path d="M-24 -10 L50 6" {...S} strokeWidth={7} /></g>
      <circle r="5" fill={P.ink} />
    </g>
  );
};

export const VideoCard: React.FC = () => (
  <g>
    <rect x="-80" y="-54" width="160" height="108" rx="12" fill={P.red} {...S} />
    <path d="M-16 -24 L28 0 L-16 24 Z" fill={P.paperLight} {...S} strokeWidth={4} />
  </g>
);

export const Plane: React.FC = () => (
  <g>
    <path d="M-50 10 L60 -30 L-10 40 L-8 16 Z" fill={P.paperLight} {...S} />
    <path d="M-8 16 L60 -30" stroke={P.ink} strokeWidth="3" />
  </g>
);

/** Circular "renew" arrow loop. */
export const LoopArrow: React.FC<{ r: number; rot: number; color?: string }> = ({ r, rot, color = P.red }) => (
  <g transform={`rotate(${rot})`}>
    <path d={`M${r} 0 A ${r} ${r} 0 1 1 ${r * Math.cos(-0.5)} ${r * Math.sin(-0.5)}`} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" />
    <path d={`M${r * Math.cos(-0.5) - 18} ${r * Math.sin(-0.5) - 20} L${r * Math.cos(-0.5) + 6} ${r * Math.sin(-0.5) + 2} L${r * Math.cos(-0.5) - 26} ${r * Math.sin(-0.5) + 12}`} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

/** Ink burst: gold rays (and small ink dots) radiating from (x,y), starting at local frame `at`. */
export const InkBurst: React.FC<{ x: number; y: number; f: number; at: number; r0?: number; color?: string; n?: number }> = ({ x, y, f, at, r0 = 50, color = P.gold, n = 12 }) => {
  const t = f - at;
  if (t < 0 || t > 18) return null;
  const k = t / 18;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + rnd(i) * 0.3;
        const r1 = r0 + k * 70, r2 = r1 + 30 * (1 - k);
        return <path key={i} d={`M${x + Math.cos(a) * r1} ${y + Math.sin(a) * r1} L${x + Math.cos(a) * r2} ${y + Math.sin(a) * r2}`} stroke={color} strokeWidth={7 * (1 - k) + 1} strokeLinecap="round" />;
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const a = rnd(i * 7 + 3) * Math.PI * 2, d = r0 + k * 110 * (0.6 + rnd(i));
        return <circle key={`d${i}`} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d + k * k * 40} r={5 * (1 - k)} fill={P.ink} />;
      })}
    </g>
  );
};

/** Blueprint sparkle stream along a straight segment (continuous tokens). */
export const Tokens: React.FC<{ x1: number; y1: number; x2: number; y2: number; f: number; n?: number; speed?: number; color?: string }> = ({ x1, y1, x2, y2, f, n = 4, speed = 0.03, color = "#ffffff" }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const k = ((f * speed + i / n) % 1 + 1) % 1;
      return <circle key={i} cx={x1 + (x2 - x1) * k} cy={y1 + (y2 - y1) * k} r={4 + 3 * Math.sin(Math.PI * k)} fill={color} opacity={Math.sin(Math.PI * k)} filter="url(#softGlow)" />;
    })}
  </g>
);

/** The "AI video machine": screen with sparkles, blinking antenna, turning gear, chimney puffs. broken 0..1 = glitch/red. */
export const AIMachine: React.FC<{ f: number; broken?: number }> = ({ f, broken = 0 }) => {
  const shake = broken > 0 ? Math.sin(f * 2.3) * 5 * broken : 0;
  return (
    <g transform={`translate(${shake} 0)`}>
      {/* chimney + puffs */}
      <rect x="40" y="-150" width="34" height="60" fill={P.wood} stroke={P.ink} strokeWidth="5" />
      {Array.from({ length: 4 }, (_, i) => {
        const t = ((f + i * 12) % 48) / 48;
        return <circle key={i} cx={57 + Math.sin(t * 6 + i) * 10} cy={-160 - t * 120} r={10 + t * 18} fill={broken > 0.5 ? "#6a605a" : P.paperLight} stroke={P.ink} strokeWidth="3" opacity={1 - t} />;
      })}
      <rect x="-110" y="-100" width="220" height="200" rx="16" fill={P.sky} stroke={P.ink} strokeWidth="6" />
      <rect x="-110" y="40" width="220" height="60" fill="url(#hatch)" />
      {/* screen */}
      <rect x="-80" y="-72" width="160" height="104" rx="8" fill={broken > 0.5 ? P.redDark : "#2b2f3a"} stroke={P.ink} strokeWidth="5" />
      {broken < 0.5
        ? Array.from({ length: 5 }, (_, i) => {
            const x = -50 + ((i * 29 + f * 2) % 100), y = -50 + ((i * 37 + f * 1.3) % 70), s = 6 + 5 * Math.abs(Math.sin(f / 5 + i));
            return <path key={i} d={`M${x} ${y - s} L${x + s * 0.3} ${y} L${x} ${y + s} L${x - s * 0.3} ${y} Z M${x - s} ${y} L${x} ${y + s * 0.3} L${x + s} ${y} L${x} ${y - s * 0.3} Z`} fill={P.gold} />;
          })
        : <path d="M-6 -50 H6 L4 0 H-4 Z M-6 10 H6 V22 H-6 Z" fill={P.paperLight} opacity={f % 8 < 5 ? 1 : 0.3} />}
      {/* antenna */}
      <path d="M-40 -100 L-56 -150" stroke={P.ink} strokeWidth="5" />
      <circle cx="-58" cy="-156" r="11" fill={f % 20 < 10 ? P.gold : P.red} stroke={P.ink} strokeWidth="4" />
      {/* gear */}
      <g transform={`translate(-110 60) rotate(${f * (broken > 0.5 ? 0.5 : 6)})`}>
        <path d={Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; const r = i % 2 ? 26 : 34; return `${i ? "L" : "M"}${Math.cos(a) * r} ${Math.sin(a) * r}`; }).join(" ") + " Z"} fill={P.gold} stroke={P.ink} strokeWidth="4" />
        <circle r="8" fill={P.ink} />
      </g>
      {/* output slot */}
      <rect x="100" y="-14" width="22" height="56" rx="4" fill={P.ink} />
      {/* buttons */}
      {[0, 1, 2].map((i) => <circle key={i} cx={-50 + i * 34} cy="66" r="10" fill={[P.red, P.gold, P.grass][i]} stroke={P.ink} strokeWidth="3" />)}
    </g>
  );
};

/** Wallet that deflates (fill 1 → 0). */
export const Wallet: React.FC<{ fill: number }> = ({ fill }) => (
  <g transform={`scale(${0.75 + 0.25 * fill} ${0.55 + 0.45 * fill})`}>
    <rect x="-60" y="-42" width="120" height="84" rx="14" fill="#7b5a3a" stroke={P.ink} strokeWidth="5" />
    <rect x="16" y="-18" width="50" height="36" rx="10" fill="#9a7550" stroke={P.ink} strokeWidth="4" />
    <circle cx="36" cy="0" r="6" fill={P.gold} stroke={P.ink} strokeWidth="2.5" />
    <path d="M-50 -30 H4" stroke={P.ink} strokeWidth="2" opacity=".5" />
  </g>
);

/** Little ink moth flapping. */
export const Moth: React.FC<{ f: number }> = ({ f }) => {
  const w = 0.4 + 0.6 * Math.abs(Math.sin(f / 2));
  return (
    <g>
      <ellipse cx="-12" cy="0" rx={16} ry={12 * w} fill="#cbb89a" stroke={P.ink} strokeWidth="3" transform="rotate(-20)" />
      <ellipse cx="12" cy="0" rx={16} ry={12 * w} fill="#cbb89a" stroke={P.ink} strokeWidth="3" transform="rotate(20)" />
      <ellipse rx="4" ry="12" fill={P.ink} />
    </g>
  );
};

/** Stamping press over the conveyor: piston cycles every `period` frames. */
export const Press: React.FC<{ f: number; period?: number }> = ({ f, period = 26 }) => {
  const t = (f % period) / period;
  const down = t < 0.2 ? t / 0.2 : t < 0.35 ? 1 : Math.max(0, 1 - (t - 0.35) / 0.4);
  const y = -40 + down * 90;
  return (
    <g>
      <rect x="-90" y="-250" width="180" height="120" rx="12" fill={P.stripeGold} stroke={P.ink} strokeWidth="6" />
      <rect x="-90" y="-170" width="180" height="40" fill="url(#hatch)" />
      <rect x="-14" y="-130" width="28" height={y + 110} fill="#9aa3a8" stroke={P.ink} strokeWidth="5" />
      <rect x="-60" y={y - 22} width="120" height="34" rx="6" fill={P.red} stroke={P.ink} strokeWidth="5" />
      <circle cx="-54" cy="-212" r="10" fill={f % 26 < 6 ? P.gold : P.paper} stroke={P.ink} strokeWidth="3" />
    </g>
  );
};
