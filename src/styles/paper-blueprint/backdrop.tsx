// Rich illustrated backdrops (from video 07): InkTown, Schematic.
import React from "react";
import { B, FONT_MONO, P, rnd } from "./theme";

/* ═════════ PAPER: ink town ═════════ */
const WALL = ["#eadfc6", "#dcc9a6", "#cfd9d7", "#e8cdb9", "#d9d2bd", "#c9d3c2"];

const Building: React.FC<{ x: number; base: number; w: number; h: number; seed: number; f: number; factory?: boolean }> = ({ x, base, w, h, seed, f, factory }) => {
  const roof = factory ? 3 : Math.floor(rnd(seed) * 3); // 0 flat, 1 gable, 2 dome
  const col = WALL[Math.floor(rnd(seed * 3) * WALL.length)];
  const top = base - h;
  const cols = Math.max(2, Math.floor(w / 38)), rows = Math.max(2, Math.floor((h - 50) / 48));
  const chimney = factory || rnd(seed * 7) < 0.45;
  const cx = x + w * (0.2 + rnd(seed * 9) * 0.5);
  return (
    <g>
      {/* smoke */}
      {chimney && Array.from({ length: 4 }, (_, i) => {
        const t = ((f * 0.8 + i * 15 + seed * 7) % 60) / 60;
        return <circle key={i} cx={cx + 14 + Math.sin(t * 5 + seed) * 12 + t * 30} cy={top - (factory ? 110 : 44) - t * 150} r={8 + t * 22} fill={P.paperLight} stroke={P.ink} strokeWidth="2.5" opacity={0.85 * (1 - t)} />;
      })}
      {chimney && <rect x={cx} y={top - (factory ? 110 : 44)} width={factory ? 34 : 26} height={factory ? 110 : 50} fill={factory ? "#b9a48a" : P.redDark} stroke={P.ink} strokeWidth="3.5" />}
      {factory && [0, 1, 2].map((i) => <rect key={i} x={cx - 3} y={top - 100 + i * 30} width="40" height="6" fill={P.red} opacity=".7" />)}
      <rect x={x} y={top} width={w} height={h} fill={col} stroke={P.ink} strokeWidth="3.5" />
      <rect x={x + w * 0.62} y={top} width={w * 0.38} height={h} fill="url(#hatch)" opacity=".55" />
      {roof === 0 && <rect x={x - 6} y={top - 12} width={w + 12} height="14" fill={P.wood} stroke={P.ink} strokeWidth="3" />}
      {roof === 1 && <path d={`M${x - 10} ${top} L${x + w / 2} ${top - w * 0.45} L${x + w + 10} ${top} Z`} fill={P.redDark} stroke={P.ink} strokeWidth="3.5" strokeLinejoin="round" />}
      {roof === 1 && <path d={`M${x + w / 2} ${top - w * 0.45} L${x + w + 10} ${top} L${x + w / 2} ${top} Z`} fill="url(#hatchDense)" opacity=".5" />}
      {roof === 2 && <path d={`M${x} ${top} A ${w / 2} ${w * 0.4} 0 0 1 ${x + w} ${top} Z`} fill={P.sky} stroke={P.ink} strokeWidth="3.5" />}
      {roof === 3 && <path d={Array.from({ length: 4 }, (_, i) => `M${x + (i * w) / 4} ${top} l${w / 8} -26 l${w / 8} 26`).join(" ")} fill={P.stripeGold} stroke={P.ink} strokeWidth="3" />}
      {Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => {
        const k = seed * 31 + r * 7 + c;
        const lit = rnd(k) < 0.35 && Math.sin(f / (20 + rnd(k) * 30) + k) > -0.4;
        return <rect key={`${r}-${c}`} x={x + 10 + c * ((w - 20) / cols)} y={top + 20 + r * 48} width={(w - 20) / cols - 10} height="28" rx="3" fill={lit ? "#f6d77c" : "#8fa4ad"} stroke={P.ink} strokeWidth="2.5" />;
      }))}
      {!factory && rnd(seed * 13) < 0.6 && (
        <g>
          <path d={Array.from({ length: 5 }, (_, i) => `M${x + 4 + (i * (w - 8)) / 5} ${base - 64} h${(w - 8) / 5} v18 q${-(w - 8) / 10} 10 ${-(w - 8) / 5} 0 Z`).join(" ")} fill={P.red} stroke={P.ink} strokeWidth="2.5" />
          <rect x={x + w / 2 - 14} y={base - 42} width="28" height="42" fill={P.wood} stroke={P.ink} strokeWidth="3" />
        </g>
      )}
    </g>
  );
};

const Tree: React.FC<{ x: number; base: number; s: number; f: number; seed: number }> = ({ x, base, s, f, seed }) => {
  const sw = Math.sin(f / 22 + seed) * 3;
  return (
    <g transform={`translate(${x} ${base}) scale(${s})`}>
      <path d="M-6 0 L-4 -60 L4 -60 L6 0 Z" fill={P.wood} stroke={P.ink} strokeWidth="3" />
      <g transform={`rotate(${sw} 0 -60)`}>
        {[[-24, -84, 30], [20, -90, 32], [0, -118, 36], [-8, -70, 26], [24, -66, 22]].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? P.grass : "#6d8c4d"} stroke={P.ink} strokeWidth="3" />
        ))}
        <circle cx="10" cy="-86" r="40" fill="url(#hatch)" opacity=".45" />
      </g>
    </g>
  );
};

export const Balloon: React.FC<{ x: number; y: number; s: number; f: number; c1?: string; c2?: string }> = ({ x, y, s, f, c1 = P.red, c2 = P.gold }) => (
  <g transform={`translate(${x} ${y + Math.sin(f / 25 + x) * 10}) scale(${s}) rotate(${Math.sin(f / 40 + x) * 3})`}>
    <clipPath id={`bc${Math.round(x)}`}><path d="M0 -90 C 70 -90 80 -20 40 30 L 18 58 H -18 L -40 30 C -80 -20 -70 -90 0 -90 Z" /></clipPath>
    <path d="M0 -90 C 70 -90 80 -20 40 30 L 18 58 H -18 L -40 30 C -80 -20 -70 -90 0 -90 Z" fill={c1} />
    <g clipPath={`url(#bc${Math.round(x)})`}>{[-45, -15, 15, 45].map((sx, i) => <path key={i} d={`M${sx} -100 Q ${sx * 1.4} -10 ${sx * 0.4} 70`} stroke={c2} strokeWidth="16" fill="none" />)}</g>
    <path d="M0 -90 C 70 -90 80 -20 40 30 L 18 58 H -18 L -40 30 C -80 -20 -70 -90 0 -90 Z" fill="none" stroke={P.ink} strokeWidth="4" />
    <path d="M0 -90 C 70 -90 80 -20 40 30 L 18 58 H 0 Z" fill="url(#hatch)" opacity=".4" />
    <path d="M-16 58 L-12 84 M16 58 L12 84" stroke={P.ink} strokeWidth="2.5" />
    <rect x="-16" y="82" width="32" height="24" rx="3" fill={P.wood} stroke={P.ink} strokeWidth="3" />
  </g>
);

const Windmill: React.FC<{ x: number; base: number; f: number }> = ({ x, base, f }) => (
  <g transform={`translate(${x} ${base})`}>
    <path d="M-34 0 L-20 -170 H20 L34 0 Z" fill="#e7dcc3" stroke={P.ink} strokeWidth="4" />
    <path d="M8 -170 L20 -170 L34 0 L14 0 Z" fill="url(#hatch)" opacity=".6" />
    <path d="M-26 -176 L0 -206 L26 -176 Z" fill={P.redDark} stroke={P.ink} strokeWidth="4" />
    <rect x="-9" y="-40" width="18" height="40" fill={P.wood} stroke={P.ink} strokeWidth="3" />
    <g transform={`translate(0 -178) rotate(${f * 2.2})`}>
      {[0, 90, 180, 270].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d="M0 0 L0 -130" stroke={P.ink} strokeWidth="5" />
          <path d="M3 -30 H26 V-126 H3 Z" fill={P.paperLight} stroke={P.ink} strokeWidth="3" />
          <path d="M3 -60 H26 M3 -94 H26 M14 -30 V-126" stroke={P.ink} strokeWidth="1.5" opacity=".6" />
        </g>
      ))}
      <circle r="10" fill={P.gold} stroke={P.ink} strokeWidth="3" />
    </g>
  </g>
);

/** Illustrated ink town behind the action. variant: "town" | "factory" | "festival". */
export const InkTown: React.FC<{ f: number; base?: number; variant?: "town" | "factory" | "festival"; seed?: number; drift?: number }> = ({ f, base = 820, variant = "town", seed = 1, drift = 0.15 }) => {
  const off = -f * drift;
  const items: React.ReactNode[] = [];
  let x = -520 + (off % 260);
  let k = 0;
  while (x < 2500) {
    const s2 = seed * 100 + k;
    if (rnd(s2 * 5) < 0.3) {
      items.push(<Tree key={`t${k}`} x={x + 40} base={base} s={0.8 + rnd(s2) * 0.5} f={f} seed={s2} />);
      x += 90;
    } else {
      const w = 100 + rnd(s2) * 100, h = 120 + rnd(s2 * 3) * (variant === "factory" ? 150 : 170);
      items.push(<Building key={`b${k}`} x={x} base={base} w={w} h={h} seed={s2} f={f} factory={variant === "factory" && rnd(s2 * 9) < 0.5} />);
      x += w + 16 + rnd(s2 * 11) * 30;
    }
    k++;
  }
  return (
    <g>
      {/* distant mountains */}
      <path d={`M-600 ${base - 180} L-200 ${base - 420} L150 ${base - 240} L520 ${base - 470} L900 ${base - 230} L1300 ${base - 440} L1700 ${base - 250} L2100 ${base - 410} L2500 ${base - 200} V${base} H-600 Z`} fill="#c8d1d0" stroke={P.ink} strokeWidth="3" opacity=".55" />
      <path d={`M-200 ${base - 420} L-120 ${base - 370} L-60 ${base - 390} L0 ${base - 350} M520 ${base - 470} L600 ${base - 410} L660 ${base - 430} L720 ${base - 390} M1300 ${base - 440} L1380 ${base - 380} L1440 ${base - 400} L1500 ${base - 360}`} fill="none" stroke={P.ink} strokeWidth="3" opacity=".5" />
      {variant !== "factory" && <Windmill x={-120 - (f * drift * 0.5) % 1} base={base - 30} f={f} />}
      {variant === "festival"
        ? [[300, 260, 0.9, P.red, P.gold], [1500, 200, 1.1, P.sky, P.paperLight], [980, 150, 0.7, P.grass, P.gold], [1800, 380, 0.6, P.pink, P.paperLight], [120, 420, 0.55, P.gold, P.red]].map(([bx, by, bs, c1, c2], i) => (
            <Balloon key={i} x={(bx as number) + Math.sin(f / 60 + i) * 40} y={(by as number) - f * 0.25 * (i % 2 ? 1 : 0.6)} s={bs as number} f={f} c1={c1 as string} c2={c2 as string} />
          ))
        : <Balloon x={1650 - f * 0.6} y={230} s={0.75} f={f} />}
      {items}
      {/* aerial perspective: paper haze pushes the town back so the story reads in front */}
      <rect x="-800" y={-400} width="3600" height={base + 400} fill={P.paper} opacity=".42" />
      <rect x="-800" y={base - 60} width="3600" height="60" fill={P.paper} opacity=".25" />
    </g>
  );
};

/* ═════════ BLUEPRINT: technical drawings ═════════ */
const L = { stroke: B.line, fill: "none", strokeWidth: 2 };

/** Exploded-view movie camera with callouts. */
const CameraSchematic: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) => {
  const ex = 1 + 0.18 * Math.sin(f / 30); // breathing explode
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity=".45">
      <rect x="-120" y="-80" width="240" height="160" rx="18" {...L} />
      <rect x="-100" y="-60" width="90" height="60" rx="6" {...L} strokeDasharray="6 6" />
      {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={150 + i * 42 * ex} cy="0" rx="26" ry={70 - i * 8} {...L} />)}
      <path d={`M150 -70 L${150 + 126 * ex} -46 M150 70 L${150 + 126 * ex} 46`} {...L} strokeDasharray="4 8" />
      {[-60, 60].map((cx2, i) => (
        <g key={i} transform={`translate(${cx2} ${-150 - 30 * (ex - 1) * 5}) rotate(${f * (i ? -3 : 3)})`}>
          <circle r="62" {...L} /><circle r="16" {...L} />
          {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 38} cy={Math.sin((a * Math.PI) / 180) * 38} r="12" {...L} />)}
        </g>
      ))}
      {/* callouts */}
      {[[-60, -150, -250, -250, "REEL-A"], [300, 0, 420, -120, "LENS ×4"], [0, 80, -200, 190, "BODY"]].map(([ax, ay, bx, by, t], i) => (
        <g key={i}>
          <circle cx={ax as number} cy={ay as number} r="8" {...L} />
          <path d={`M${ax} ${ay} L${bx} ${by} H${(bx as number) + (i === 1 ? 90 : -90)}`} {...L} strokeWidth="1.5" />
          <text x={(bx as number) + (i === 1 ? 8 : -84)} y={(by as number) - 8} fill={B.line} fontSize="18" fontFamily={FONT_MONO} direction="ltr">{t}</text>
        </g>
      ))}
    </g>
  );
};

/** Circuit traces from the frame edges with light pulses running along them. */
const Circuit: React.FC<{ f: number; seed?: number }> = ({ f, seed = 3 }) => {
  const traces = Array.from({ length: 12 }, (_, i) => {
    const side = i % 4;
    let x = side === 0 ? 0 : side === 1 ? 1920 : rnd(i + seed) * 1920;
    let y = side === 2 ? 0 : side === 3 ? 1080 : rnd(i * 3 + seed) * 1080;
    const pts: [number, number][] = [[x, y]];
    for (let k = 0; k < 4; k++) {
      if (k % 2 === 0) x += (side === 1 ? -1 : 1) * (80 + rnd(i * 7 + k + seed) * 220) * (side > 1 ? (rnd(i + k) < 0.5 ? -1 : 1) : 1);
      else y += (side === 3 ? -1 : 1) * (60 + rnd(i * 11 + k + seed) * 160) * (side < 2 ? (rnd(i * 2 + k) < 0.5 ? -1 : 1) : 1);
      pts.push([x, y]);
    }
    return pts;
  });
  return (
    <g opacity=".5">
      {traces.map((pts, i) => {
        const d = pts.map(([x, y], k) => `${k ? "L" : "M"}${x} ${y}`).join(" ");
        // pulse position along polyline
        const segs = pts.slice(1).map((p, k) => Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1]));
        const tot = segs.reduce((a, b) => a + b, 0);
        let dist = ((f * 9 + i * 137) % (tot + 300)) - 150, px = pts[0][0], py = pts[0][1];
        for (let k = 0; k < segs.length && dist > 0; k++) {
          const u = Math.min(1, dist / segs[k]);
          px = pts[k][0] + (pts[k + 1][0] - pts[k][0]) * u; py = pts[k][1] + (pts[k + 1][1] - pts[k][1]) * u;
          dist -= segs[k];
        }
        const [ex2, ey2] = pts[pts.length - 1];
        return (
          <g key={i}>
            <path d={d} {...L} strokeWidth="2.5" opacity=".6" />
            <circle cx={ex2} cy={ey2} r="7" {...L} strokeWidth="2.5" />
            <circle cx={px} cy={py} r="5" fill="#fff" filter="url(#glow)" />
          </g>
        );
      })}
    </g>
  );
};

/** Rotating isometric wireframe cube with an inscribed play symbol. */
const IsoCube: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) => {
  const a = f * 0.012, b = 0.55;
  const V = [-1, 1].flatMap((i) => [-1, 1].flatMap((j) => [-1, 1].map((k) => [i, j, k])));
  const pr = ([X, Y, Z]: number[]) => {
    const x1 = X * Math.cos(a) - Z * Math.sin(a), z1 = X * Math.sin(a) + Z * Math.cos(a);
    const y1 = Y * Math.cos(b) - z1 * Math.sin(b);
    return [x + x1 * s, y + y1 * s];
  };
  const E = [[0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3], [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7]];
  const p = V.map(pr);
  return (
    <g opacity=".5">
      {E.map(([i, j], k) => <line key={k} x1={p[i][0]} y1={p[i][1]} x2={p[j][0]} y2={p[j][1]} stroke={B.line} strokeWidth="2" />)}
      {p.map(([px, py], k) => <circle key={`v${k}`} cx={px} cy={py} r="5" fill={B.bg0} stroke={B.line} strokeWidth="2" />)}
      <path d={`M${x - s * 0.3} ${y - s * 0.4} L${x + s * 0.45} ${y} L${x - s * 0.3} ${y + s * 0.4} Z`} fill="none" stroke={B.pink} strokeWidth="2.5" opacity=".8" />
    </g>
  );
};

/** Full blueprint backdrop: pick which drawings to place. */
export const Schematic: React.FC<{ f: number; camera?: [number, number, number]; cube?: [number, number, number]; circuit?: boolean; seed?: number }> = ({ f, camera, cube, circuit = true, seed = 3 }) => (
  <g>
    {circuit && <Circuit f={f} seed={seed} />}
    {camera && <CameraSchematic x={camera[0]} y={camera[1]} s={camera[2]} f={f} />}
    {cube && <IsoCube x={cube[0]} y={cube[1]} s={cube[2]} f={f} />}
  </g>
);
