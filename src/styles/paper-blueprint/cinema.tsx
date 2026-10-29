// Cinematic layer (from video 07): camera, torn-paper transition, living ambience.
import React from "react";
import { AbsoluteFill } from "remotion";
import { B, clamp, FONT_MONO, P, rnd } from "./theme";

/* ───────── paper world: living background + foreground parallax ───────── */

const Cloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-110 20 Q -120 -20 -80 -26 Q -70 -70 -20 -60 Q 10 -95 50 -62 Q 100 -70 104 -22 Q 130 -10 118 20 Z" fill={P.paperLight} stroke={P.ink} strokeWidth="4" strokeLinejoin="round" />
    <path d="M-100 16 Q 0 0 110 16" fill="none" stroke="url(#hatch)" strokeWidth="14" opacity=".8" />
  </g>
);

/** Drifting ink clouds, flapping birds, floating flecks; optional far hills. Put inside a paper <svg> after <InkDefs/>. */
export const PaperAmbience: React.FC<{ f: number; seed?: number; hills?: boolean; groundY?: number; birds?: number }> = ({ f, seed = 1, hills = false, groundY = 820, birds = 3 }) => (
  <g>
    {hills && (
      <g opacity=".28">
        <path d={`M0 ${groundY} C 240 ${groundY - 150}, 420 ${groundY - 120}, 620 ${groundY - 40} S 1020 ${groundY - 190}, 1300 ${groundY - 70} S 1700 ${groundY - 150}, 1920 ${groundY - 60} V${groundY} Z`} fill={P.grass} stroke={P.ink} strokeWidth="4" />
        <path d={`M0 ${groundY} C 240 ${groundY - 150}, 420 ${groundY - 120}, 620 ${groundY - 40} S 1020 ${groundY - 190}, 1300 ${groundY - 70} S 1700 ${groundY - 150}, 1920 ${groundY - 60} V${groundY} Z`} fill="url(#hatch)" />
      </g>
    )}
    {[0, 1, 2].map((i) => {
      const x = ((rnd(i + seed) * 2200 + f * (0.5 + i * 0.25)) % 2300) - 200;
      return <g key={i} opacity=".85"><Cloud x={x} y={150 + i * 70 + rnd(i * 3 + seed) * 40} s={0.6 + rnd(i * 5 + seed) * 0.4} /></g>;
    })}
    {Array.from({ length: birds }, (_, i) => {
      const t = ((f * (2.2 + i * 0.4) + rnd(i + seed) * 2400) % 2400) - 200;
      const y = 200 + i * 55 + Math.sin(t / 60 + i) * 20;
      const w = Math.sin(f / 3 + i * 2) * 12;
      return <path key={i} d={`M${t - 18} ${y - w} Q ${t - 8} ${y - 4} ${t} ${y} Q ${t + 8} ${y - 4} ${t + 18} ${y - w}`} fill="none" stroke={P.ink} strokeWidth="4" strokeLinecap="round" />;
    })}
  </g>
);

/** Big foreground grass/leaves in the bottom corners, swaying (parallax depth). Draw last. */
export const ForeGrass: React.FC<{ f: number; y?: number }> = ({ f, y = 1080 }) => (
  <g>
    {[{ x: -30, s: 1.25, flip: 1 }, { x: 1950, s: 1.05, flip: -1 }].map((g, k) => (
      <g key={k} transform={`translate(${g.x} ${y}) scale(${g.flip * g.s} ${g.s})`}>
        {Array.from({ length: 7 }, (_, i) => {
          const sw = Math.sin(f / 18 + i * 0.7 + k) * 8;
          const h = 160 + (i % 3) * 70, bx = i * 34;
          return (
            <g key={i}>
              <path d={`M${bx} 0 Q ${bx + 10 + sw * 0.5} ${-h * 0.5} ${bx + 30 + sw} ${-h} Q ${bx + 26 + sw * 0.4} ${-h * 0.5} ${bx + 28} 0 Z`} fill={i % 2 ? P.grass : "#5f7a44"} stroke={P.ink} strokeWidth="4" strokeLinejoin="round" />
              <path d={`M${bx + 8} -10 Q ${bx + 14} ${-h * 0.45} ${bx + 26 + sw} ${-h * 0.9}`} fill="none" stroke={P.ink} strokeWidth="1.8" opacity=".5" />
            </g>
          );
        })}
      </g>
    ))}
  </g>
);

/** Ink confetti (small stars/strips) falling from the top after `at`. */
export const InkConfetti: React.FC<{ f: number; at: number; n?: number; x0?: number; x1?: number }> = ({ f, at, n = 40, x0 = 300, x1 = 1620 }) => {
  const t = f - at;
  if (t < 0) return null;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + rnd(i) * (x1 - x0) + Math.sin(t / 8 + i) * 30;
        const y = -40 + t * (6 + rnd(i * 3) * 6) - rnd(i * 5) * 200;
        if (y > 1100) return null;
        const c = [P.red, P.gold, P.sky, P.grass, P.pink][i % 5];
        return <rect key={i} x={x} y={y} width="16" height="8" fill={c} stroke={P.ink} strokeWidth="2" transform={`rotate(${t * 9 + i * 40} ${x + 8} ${y + 4})`} />;
      })}
    </g>
  );
};

/** Bunting string across the top. */
export const Bunting: React.FC<{ f: number; a?: number }> = ({ f, a = 1 }) => (
  <g opacity={a}>
    <path d="M0 60 Q 960 190 1920 60" fill="none" stroke={P.ink} strokeWidth="3" />
    {Array.from({ length: 16 }, (_, i) => {
      const x = 60 + i * 120, y = 60 + 130 * (1 - ((x - 960) / 960) ** 2) * 0.95;
      return <path key={i} d={`M${x - 26} ${y} L${x + 26} ${y} L${x} ${y + 50} Z`} fill={[P.red, P.gold, P.sky, P.pink][i % 4]} stroke={P.ink} strokeWidth="3" transform={`rotate(${Math.sin(f / 10 + i) * 6} ${x} ${y})`} />;
    })}
  </g>
);

/* ───────── blueprint world: schematic life ───────── */

const Gear: React.FC<{ x: number; y: number; r: number; rot: number; teeth?: number }> = ({ x, y, r, rot, teeth = 12 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} stroke={B.line} fill="none" strokeWidth="2" opacity=".5">
    <path d={Array.from({ length: teeth * 2 }, (_, i) => { const a = (i / (teeth * 2)) * Math.PI * 2; const rr = i % 2 ? r : r * 1.18; return `${i ? "L" : "M"}${Math.cos(a) * rr} ${Math.sin(a) * rr}`; }).join(" ") + " Z"} />
    <circle r={r * 0.35} /><circle r={r * 0.12} />
  </g>
);

/** Scan sweep, gears, data bars, floating markers, and a crosshair tracker on `target`. */
export const BlueAmbience: React.FC<{ f: number; target?: [number, number]; lock?: number }> = ({ f, target, lock = 0 }) => {
  const sy = ((f * 7) % 1300) - 110;
  return (
    <g>
      <rect x="0" y={sy} width="1920" height="2" fill={B.line} opacity=".35" />
      <rect x="0" y={sy - 80} width="1920" height="80" fill={B.line} opacity=".04" />
      <Gear x={150} y={930} r={70} rot={f * 1.2} />
      <Gear x={262} y={1000} r={42} rot={-f * 2} teeth={9} />
      <Gear x={1790} y={900} r={56} rot={-f * 1.4} teeth={10} />
      {target && (
        <g stroke={lock > 0.5 ? B.pink : B.line} strokeWidth="3" fill="none" filter="url(#softGlow)">
          {(() => {
            const [tx, ty] = target;
            const r = 120 - 30 * lock + Math.sin(f / 5) * 4;
            return (
              <g>
                <path d={`M${tx - r} ${ty - r + 26} V${ty - r} H${tx - r + 26} M${tx + r - 26} ${ty - r} H${tx + r} V${ty - r + 26} M${tx + r} ${ty + r - 26} V${ty + r} H${tx + r - 26} M${tx - r + 26} ${ty + r} H${tx - r} V${ty + r - 26}`} />
                <path d={`M${tx - r - 40} ${ty} H${tx - r - 12} M${tx + r + 12} ${ty} H${tx + r + 40} M${tx} ${ty - r - 40} V${ty - r - 12} M${tx} ${ty + r + 12} V${ty + r + 40}`} strokeWidth="2" />
                <text x={tx + r + 10} y={ty - r - 10} fill={B.line} stroke="none" fontSize="16" fontFamily={FONT_MONO} direction="ltr">{`x${Math.round(tx)} y${Math.round(ty)}`}</text>
              </g>
            );
          })()}
        </g>
      )}
    </g>
  );
};

/** Dimension line between two points with end ticks and a small label. */
export const Dim: React.FC<{ x1: number; y1: number; x2: number; y2: number; a?: number; label?: string }> = ({ x1, y1, x2, y2, a = 1, label }) => {
  const ang = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(ang) * 12, ny = Math.cos(ang) * 12;
  const k = clamp(a);
  const ex = x1 + (x2 - x1) * k, ey = y1 + (y2 - y1) * k;
  return (
    <g stroke={B.line} strokeWidth="1.8" opacity=".7">
      <path d={`M${x1} ${y1} L${ex} ${ey} M${x1 + nx} ${y1 + ny} L${x1 - nx} ${y1 - ny}`} />
      {k >= 1 && <path d={`M${x2 + nx} ${y2 + ny} L${x2 - nx} ${y2 - ny}`} />}
      {label && k >= 1 && <text x={(x1 + x2) / 2 + nx * 1.6} y={(y1 + y2) / 2 + ny * 1.6} fill={B.line} stroke="none" fontSize="15" fontFamily={FONT_MONO} textAnchor="middle" direction="ltr">{label}</text>}
    </g>
  );
};

/* ───────── signature transition: torn paper / blueprint unroll ───────── */

/** Clips the incoming shot: reveal from the right along a slanted edge. world = incoming world. p = 0..1. */
export const TearIn: React.FC<{ p: number; world: "paper" | "blue"; children: React.ReactNode; seed?: number }> = ({ p, world, children, seed = 1 }) => {
  if (p >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  const pts: [number, number][] = [];
  const N = 36;
  for (let k = 0; k <= N; k++) {
    const y = -20 + (k / N) * 1120;
    const base = 2250 * (1 - p) - 250 + (y / 1080) * 260;
    const jag = world === "paper" ? (rnd(k * 7 + seed) - 0.5) * 38 : 0;
    pts.push([base + jag, y]);
  }
  const poly = [...pts.map(([x, y]) => `${x}px ${y}px`), "2000px 1120px", "2000px -20px"].join(",");
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `polygon(${poly})` }}>{children}</AbsoluteFill>
      <svg width="1920" height="1080" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        <defs><filter id={`tg${seed}`}><feGaussianBlur stdDeviation="6" /></filter></defs>
        <polyline points={pts.map(([x, y]) => `${x + 16},${y}`).join(" ")} fill="none" stroke="#000" strokeWidth="26" opacity=".25" filter={`url(#tg${seed})`} />
        {world === "paper" ? (
          <>
            <polyline points={pts.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke="#fbf7ee" strokeWidth="10" />
            <polyline points={pts.map(([x, y]) => `${x - 5},${y}`).join(" ")} fill="none" stroke={P.ink} strokeWidth="2.5" />
          </>
        ) : (
          <polyline points={pts.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke="#9ef0ff" strokeWidth="4" style={{ filter: "drop-shadow(0 0 10px #7df9ff)" }} />
        )}
      </svg>
    </AbsoluteFill>
  );
};

/* ───────── cinematic camera ───────── */
/** Keyframed camera: keys = [frame, centerX, centerY, zoom]; smooth (ease in-out) between keys, plus a tiny handheld drift. */
export const Cam: React.FC<{ f: number; keys: [number, number, number, number][]; children: React.ReactNode; shake?: number[] }> = ({ f, keys, children, shake = [] }) => {
  const ks = [...keys].sort((a, b) => a[0] - b[0]);
  let x = ks[0][1], y = ks[0][2], z = ks[0][3];
  for (let i = 0; i < ks.length - 1; i++) {
    const [f0, x0, y0, z0] = ks[i], [f1, x1, y1, z1] = ks[i + 1];
    if (f >= f0 && f <= f1) {
      const t = f1 === f0 ? 1 : (f - f0) / (f1 - f0);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      x = x0 + (x1 - x0) * e; y = y0 + (y1 - y0) * e; z = z0 + (z1 - z0) * e;
    } else if (f > f1) { x = x1; y = y1; z = z1; }
  }
  x += Math.sin(f / 37) * 6; y += Math.cos(f / 29) * 4; // handheld
  const [sx, sy] = shake.reduce(([a, b], h) => (f < h || f > h + 14 ? [a, b] : [a + Math.sin((f - h) * 2.6) * 16 * Math.exp(-(f - h) / 4), b + Math.cos((f - h) * 3.1) * 10 * Math.exp(-(f - h) / 4)]), [0, 0]);
  return <AbsoluteFill style={{ transform: `translate(${960 - x * z + sx}px, ${540 - y * z + sy}px) scale(${z})`, transformOrigin: "0 0" }}>{children}</AbsoluteFill>;
};
