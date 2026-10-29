import React from "react";
import { BG, INK } from "../rig/body";
import { add, clamp, hn, pt, rot, type V } from "../rig/geom";

// Video 13 world: umbrella with a real shelter zone + layered rain with splashes, drips and ripples.
export const UMB = "#626754";
export const UMB_HI = "#8a8f78";
export const GROUND = 884;

// ---- umbrella geometry ---------------------------------------------------------
const TIP_Y = -340; // long shaft: canopy clears both heads while the hand stays at chest height
const HALF = 128;
const RIBS = 8;
const ribTip = (i: number): V => {
  const x = -HALF + (i * 2 * HALF) / RIBS;
  return [x, TIP_Y + 108 + (Math.abs(x) / HALF) ** 2 * 10];
};
const TIPS = Array.from({ length: RIBS + 1 }, (_, i) => ribTip(i));
const bez = (p0: V, p1: V, p2: V, p3: V, t: number): V => {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
};
const DOME_A: [V, V, V, V] = [TIPS[0], [-HALF + 4, TIP_Y + 58], [-72, TIP_Y], [0, TIP_Y]];
const DOME_B: [V, V, V, V] = [[0, TIP_Y], [72, TIP_Y], [HALF - 4, TIP_Y + 58], TIPS[RIBS]];
const DOME_LOCAL: V[] = [
  ...Array.from({ length: 10 }, (_, i) => bez(...DOME_A, i / 10)),
  ...Array.from({ length: 11 }, (_, i) => bez(...DOME_B, i / 10)),
];

/** Where the umbrella is: hand position, shaft tilt, and how far down the shaft the hand grips. */
export type UmbrellaState = { grip: V; tilt: number; hold: number };
const toWorld = (u: UmbrellaState) => (p: V): V => add(u.grip, rot([p[0], p[1] - u.hold], u.tilt));

export type Shelter = { dome: V[]; rim: V[] };
export const shelterOf = (u: UmbrellaState | null): Shelter | null => {
  if (!u) return null;
  const W = toWorld(u);
  const dome = DOME_LOCAL.map(W).sort((a, b) => a[0] - b[0]);
  const rim = TIPS.map(W);
  return { dome, rim };
};

/** y of the canopy surface above x, or null when x is outside the umbrella. */
export const domeY = (s: Shelter | null, x: number): number | null => {
  if (!s) return null;
  const d = s.dome;
  if (x < d[0][0] || x > d[d.length - 1][0]) return null;
  // upper envelope: smallest y among segments covering x
  let best: number | null = null;
  for (let i = 0; i < d.length - 1; i++) {
    const a = d[i], b = d[i + 1];
    if (x >= a[0] && x <= b[0]) {
      const y = a[1] + ((x - a[0]) / (b[0] - a[0] || 1)) * (b[1] - a[1]);
      best = best === null ? y : Math.min(best, y);
    }
  }
  return best;
};

/** Is a head top (world) sheltered? */
export const covered = (s: Shelter | null, head: V) => {
  const y = domeY(s, head[0]);
  return y !== null && y < head[1];
};

export const Umbrella: React.FC<{ u: UmbrellaState; f: number }> = ({ u, f }) => {
  let d = `M${pt(TIPS[0])} C${pt(DOME_A[1])} ${pt(DOME_A[2])} 0 ${TIP_Y} C${pt(DOME_B[1])} ${pt(DOME_B[2])} ${pt(TIPS[RIBS])}`;
  for (let i = RIBS; i > 0; i--) {
    const a = TIPS[i], b = TIPS[i - 1];
    d += ` Q${(a[0] + b[0]) / 2} ${Math.min(a[1], b[1]) - 13} ${pt(b)}`;
  }
  d += "Z";
  const s4 = Math.floor(f / 4);
  return (
    <g transform={`translate(${pt(u.grip)}) rotate(${u.tilt}) translate(0 ${-u.hold})`}>
      <path d={`M0 ${TIP_Y} L0 26 Q0 44 -11 44 Q-21 44 -21 33`} fill="none" stroke="#3b3d33" strokeWidth={3.6} strokeLinecap="round" />
      <path d={d} fill={UMB} stroke={INK} strokeWidth={3.6} strokeLinejoin="round" />
      <g fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" opacity={0.75}>
        {TIPS.slice(1, -1).map((t, i) => (
          <path key={i} d={`M0 ${TIP_Y} Q${t[0] * 0.62} ${TIP_Y + (t[1] - TIP_Y) * 0.3} ${pt(t)}`} />
        ))}
      </g>
      <path d={`M0 ${TIP_Y} L0 ${TIP_Y - 14}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      {/* beads of water sitting on the canopy, shimmering on fours */}
      <g fill="none" stroke={UMB_HI} strokeWidth={2.1} strokeLinecap="round">
        {Array.from({ length: 16 }, (_, i) => {
          const uu = hn(i, s4) * 0.85;
          const x = uu * HALF;
          const y = TIP_Y + 22 + Math.abs(uu) ** 1.6 * 80 + Math.abs(hn(i + 40, s4)) * 42;
          return <path key={i} d={`M${x - 4} ${y - 3} L${x} ${y + 1} L${x + 4} ${y - 3}`} />;
        })}
      </g>
    </g>
  );
};

// ---- rain ----------------------------------------------------------------------
type Drop = { x: number; len: number; v: number; ph: number; gy: number; w: number; o: number };
const layer = (n: number, seed: number, len: [number, number], v: [number, number], w: number, o: number, gy: [number, number]): Drop[] =>
  Array.from({ length: n }, (_, i) => ({
    x: -10 + ((i * 0.61803398875 + seed * 0.37) % 1) * 740 + hn(i, seed) * 5,
    len: len[0] + Math.abs(hn(i, seed + 1)) * (len[1] - len[0]),
    v: v[0] + Math.abs(hn(i, seed + 2)) * (v[1] - v[0]),
    ph: Math.abs(hn(i, seed + 3)) * 1600,
    gy: gy[0] + Math.abs(hn(i, seed + 4)) * (gy[1] - gy[0]),
    w,
    o: o * (0.75 + 0.25 * Math.abs(hn(i, seed + 5))),
  }));
// far (thin, faint, slower) · mid · near (fewer, long, bold)
export const RAIN_FAR = layer(80, 11, [14, 30], [22, 28], 1.3, 0.34, [GROUND - 30, GROUND - 4]);
export const RAIN_MID = layer(64, 23, [30, 62], [34, 44], 2.1, 0.72, [GROUND - 6, GROUND + 22]);
export const RAIN_NEAR = layer(12, 37, [80, 120], [56, 66], 3, 0.8, [GROUND + 24, GROUND + 60]);

/** Tapered streak: thin tail on top, round head at the bottom. */
const streak = (x: number, y0: number, y1: number, w: number) =>
  `M${x.toFixed(1)} ${y0.toFixed(1)} L${(x + w / 2).toFixed(1)} ${(y1 - w / 2).toFixed(1)} Q${x.toFixed(1)} ${(y1 + w * 0.6).toFixed(1)} ${(x - w / 2).toFixed(1)} ${(y1 - w / 2).toFixed(1)}Z`;

export const Rain: React.FC<{ f: number; drops: Drop[]; shelters: (Shelter | null)[]; heads?: V[] }> = ({ f, drops, shelters, heads = [] }) => {
  const out: React.ReactNode[] = [];
  const splash: React.ReactNode[] = [];
  const canopySplash: React.ReactNode[] = [];
  drops.forEach((d, i) => {
    const span = 1600;
    const y0 = ((d.ph + f * d.v) % span) - 300;
    let stop = d.gy;
    let onCanopy = false;
    for (const s of shelters) {
      const y = domeY(s, d.x);
      if (y !== null && y < stop) {
        stop = y;
        onCanopy = true;
      }
    }
    // drops also break on an uncovered head
    for (const h of heads) {
      if (Math.abs(d.x - h[0]) < 50 && h[1] < stop && !onCanopy) {
        stop = h[1] + Math.abs(d.x - h[0]) * 0.35;
      }
    }
    if (y0 >= stop) {
      if (y0 - stop < d.v * 2.05) {
        const k = (y0 - stop) / (d.v * 2.05);
        const r = 3 + k * 6 * (d.w / 2);
        if (onCanopy) canopySplash.push(<path key={i} d={`M${d.x - r} ${stop - 2 - k * 4} L${d.x - 1} ${stop} M${d.x + r} ${stop - 2 - k * 4} L${d.x + 1} ${stop}`} />);
        else splash.push(<path key={i} d={`M${d.x - r} ${stop - 3 - k * 5} L${d.x - 1.5} ${stop} M${d.x + r} ${stop - 3 - k * 5} L${d.x + 1.5} ${stop} M${d.x} ${stop - 6 - k * 8} l0 1`} strokeWidth={d.w * 0.8} opacity={1 - k * 0.5} />);
      }
      return;
    }
    const y1 = Math.min(y0 + d.len, stop);
    if (y1 - y0 < 3) return;
    out.push(<path key={i} d={streak(d.x, y0, y1, d.w)} opacity={d.o} />);
  });
  return (
    <g>
      <g fill="#1b1c17">{out}</g>
      <g fill="none" stroke={INK} strokeWidth={1.8} strokeLinecap="round" opacity={0.75}>
        {splash}
      </g>
      <g fill="none" stroke={UMB_HI} strokeWidth={2} strokeLinecap="round">
        {canopySplash}
      </g>
    </g>
  );
};

/** Water dripping off the umbrella rim (each rib tip lets go on its own rhythm). */
export const RimDrips: React.FC<{ f: number; s: Shelter | null }> = ({ f, s }) => {
  if (!s) return null;
  return (
    <g>
      {s.rim.map((tip, i) => {
        if (i % 2) return null; // every other rib lets go — keeps it readable
        const P = 20 + (i % 3) * 6;
        const age = (f + i * 7) % P;
        const y = tip[1] + 2 + 0.55 * age * age;
        if (y > GROUND) return null;
        const sc = age < 2 ? 0.45 : 0.65;
        return <Drip key={i} at={[tip[0], y]} s={sc} />;
      })}
    </g>
  );
};

// ---- ground ------------------------------------------------------------------------
const MARKS = Array.from({ length: 70 }, (_, i) => ({
  x: ((i * 0.7548776662) % 1) * 730 - 5,
  y: GROUND - 2 + Math.abs(hn(i, 7)) * 26,
  k: Math.floor(Math.abs(hn(i, 8)) * 3),
  w: 4 + Math.abs(hn(i, 9)) * 4,
}));
export const Ground: React.FC = () => (
  <g fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" opacity={0.85}>
    {MARKS.map((m, i) =>
      m.k === 0 ? (
        <path key={i} d={`M${m.x - m.w} ${m.y - 3} L${m.x} ${m.y} L${m.x + m.w * 0.6} ${m.y - 4}`} />
      ) : m.k === 1 ? (
        <path key={i} d={`M${m.x - m.w} ${m.y - 2} Q${m.x} ${m.y + 3} ${m.x + m.w} ${m.y - 2}`} />
      ) : (
        <path key={i} d={`M${m.x - m.w * 0.7} ${m.y} L${m.x + m.w * 0.7} ${m.y}`} />
      ),
    )}
  </g>
);

/** Puddle ripples: small rings that open and fade. */
export const Ripples: React.FC<{ f: number }> = ({ f }) => (
  <g fill="none" stroke={INK} strokeWidth={1.6}>
    {Array.from({ length: 9 }, (_, i) => {
      const P = 22 + (i % 4) * 4;
      const age = (f + i * 9) % P;
      const k = age / P;
      const x = 30 + ((i * 0.618) % 1) * 660;
      const y = GROUND + 6 + (i % 3) * 7;
      return <ellipse key={i} cx={x} cy={y} rx={3 + k * 16} ry={(3 + k * 16) * 0.22} opacity={(1 - k) * 0.55} />;
    })}
  </g>
);

export const Tufts: React.FC<{ at: number[] }> = ({ at }) => (
  <g fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round">
    {at.map((x, i) => (
      <path key={i} d={`M${x - 6} ${GROUND + 1} l-3 -8 M${x} ${GROUND + 1} l0 -10 M${x + 6} ${GROUND + 1} l3 -8`} />
    ))}
  </g>
);

export const Drip: React.FC<{ at: V; s?: number }> = ({ at, s = 1 }) => (
  <path
    transform={`translate(${pt(at)}) scale(${clamp(s, 0.2, 2)})`}
    d="M0 -7 C2 -3 4.5 0 4.5 2.6 C4.5 5.2 2.4 7 0 7 C-2.4 7 -4.5 5.2 -4.5 2.6 C-4.5 0 -2 -3 0 -7 Z"
    fill={BG}
    stroke={INK}
    strokeWidth={2}
  />
);
