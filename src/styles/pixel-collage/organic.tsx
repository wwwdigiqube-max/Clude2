// Organic effects: block snake (E8), kaleidoscope mandala (E9), NPV-style emblem tile, bento assembly (E10).
import React from "react";
import { clamp, easeOut, K, ramp, rnd } from "./theme";

/** Chain of black rounded blocks following a path; tail = small circles, head = big blocks. path(t) → [x,y]. */
export const Snake: React.FC<{ f: number; path: (t: number) => [number, number]; n?: number; lag?: number; head?: number; grow?: number; a?: number }> = ({
  f, path, n = 12, lag = 2.6, head = 150, grow = 1, a = 1,
}) => {
  const segs = Array.from({ length: n }, (_, k) => {
    const t = f - k * lag;
    const [x, y] = path(t);
    const [x2, y2] = path(t + 0.8);
    const ang = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
    const q = 1 - k / n; // 1 head … 0 tail
    const size = (22 + head * Math.pow(q, 1.4)) * grow;
    const round = 0.5 - 0.32 * q; // tail circles → head rounded squares
    return { k, x, y, ang, w: size * (1 + 0.25 * q), h: size, r: size * round };
  }).reverse();
  return (
    <g opacity={a}>
      <defs>
        <linearGradient id="snakeEdge" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#3a7bd5" /><stop offset="1" stopColor="#a67be0" /></linearGradient>
      </defs>
      {segs.map((s) => (
        <g key={s.k} transform={`translate(${s.x} ${s.y}) rotate(${s.ang})`}>
          <rect x={-s.w / 2 - 14} y={-s.h / 2 - 14} width={s.w + 28} height={s.h + 28} rx={s.r + 14} fill="#e9b8f0" opacity={0.55} />
          <rect x={-s.w / 2 - 6} y={-s.h / 2 - 6} width={s.w + 12} height={s.h + 12} rx={s.r + 6} fill="url(#snakeEdge)" />
          <rect x={-s.w / 2} y={-s.h / 2} width={s.w} height={s.h} rx={s.r} fill={K.ink} />
        </g>
      ))}
    </g>
  );
};

type Pal = { bg: string; outer: string; mid: string; dots: string; hi: string; center: string };
export const KAL_PALS: Pal[] = [
  { bg: K.lime, outer: K.olive, mid: K.green, dots: K.ink, hi: "#ffffff", center: K.pink },
  { bg: K.blue, outer: "#ffffff", mid: K.orange, dots: K.ink, hi: "#ffffff", center: K.yellow },
];

/**
 * 8-fold kaleidoscope. grow 0→1 builds it from the center; morph 0 = round blobs/dots, 1 = pixel squares; pal blends between KAL_PALS[0]→[1].
 */
export const Kaleido: React.FC<{ cx?: number; cy?: number; R?: number; f: number; grow: number; morph: number; pal: number; seed?: number }> = ({ cx = 960, cy = 540, R = 560, f, grow, morph, pal, seed = 4 }) => {
  const P = pal < 0.5 ? KAL_PALS[0] : KAL_PALS[1];
  const g = easeOut(clamp(grow));
  const rad = (s: number) => s * (0.5 - 0.4 * morph); // corner radius factor
  const els: React.ReactNode[] = [];
  // outer organic ring: big blobs around
  const ring = (r: number, count: number, size: number, col: string, key: string, phase = 0) =>
    Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 + phase + f * 0.004;
      const s = size * (0.9 + 0.1 * Math.sin(f / 12 + i));
      return <rect key={key + i} x={cx + Math.cos(a) * r * g - s / 2} y={cy + Math.sin(a) * r * g - s / 2} width={s} height={s} rx={s * (0.5 - 0.38 * morph)} fill={col} />;
    });
  els.push(<rect key="bg" x={0} y={0} width={1920} height={1080} fill={P.bg} />);
  els.push(...ring(R * 0.95, 16, R * 0.5, P.outer, "o", 0.2));
  els.push(<rect key="mid" x={cx - R * 0.72 * g} y={cy - R * 0.72 * g} width={R * 1.44 * g} height={R * 1.44 * g} rx={R * 0.72 * g * (0.62 - 0.45 * morph)} fill={P.mid} transform={`rotate(${45 * (1 - morph) + f * 0.2} ${cx} ${cy})`} />);
  els.push(...ring(R * 0.62, 8, R * 0.3, P.mid, "m"));
  // symmetric dots: generate in one octant, mirror 8×
  for (let k = 0; k < 18; k++) {
    const rr = (0.12 + rnd(k + seed) * 0.72) * R * g;
    const th = rnd(k * 3 + seed) * (Math.PI / 4);
    const s = (10 + rnd(k * 7 + seed) * 46) * (0.8 + 0.2 * Math.sin(f / 9 + k)) * g;
    const col = rnd(k * 11 + seed) < 0.72 ? P.dots : P.hi;
    for (let m = 0; m < 8; m++) {
      const a = (m % 2 ? Math.PI / 4 - th : th) + Math.floor(m / 2) * (Math.PI / 2);
      els.push(<rect key={`d${k}-${m}`} x={cx + Math.cos(a) * rr - s / 2} y={cy + Math.sin(a) * rr - s / 2} width={s} height={s} rx={rad(s)} fill={col} />);
    }
  }
  // center plus
  const c = R * 0.22 * g;
  els.push(<path key="c" d={`M${cx - c * 0.35} ${cy - c} h${c * 0.7} v${c * 0.65} h${c * 0.65} v${c * 0.7} h${-c * 0.65} v${c * 0.65} h${-c * 0.7} v${-c * 0.65} h${-c * 0.65} v${-c * 0.7} h${c * 0.65} Z`} fill={P.center} />);
  return <g>{els}</g>;
};

/** The NPV mark: orange tile, four black rounded blocks, lime plus, white pixels (reads as a logo, no letters). */
export const Emblem: React.FC<{ x: number; y: number; s: number; f?: number; a?: number; rot?: number }> = ({ x, y, s, f = 0, a = 1, rot = 0 }) => {
  const u = s / 10;
  const pulse = 1 + 0.03 * Math.sin(f / 8);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${pulse}) translate(${-s / 2} ${-s / 2})`} opacity={a}>
      <rect width={s} height={s} rx={u * 0.8} fill={K.orange} />
      {[[1, 1], [5.6, 1], [1, 5.6], [5.6, 5.6]].map(([i, j], k) => <rect key={k} x={i * u} y={j * u} width={3.4 * u} height={3.4 * u} rx={u * 0.9} fill={K.ink} />)}
      <path d={`M${4.3 * u} ${2.2 * u} h${1.4 * u} v${2.1 * u} h${2.1 * u} v${1.4 * u} h${-2.1 * u} v${2.1 * u} h${-1.4 * u} v${-2.1 * u} h${-2.1 * u} v${-1.4 * u} h${2.1 * u} Z`} fill={K.lime} />
      {[[2.3, 4.6], [4.6, 2.3], [7.1, 4.6], [4.6, 7.1]].map(([i, j], k) => <rect key={`w${k}`} x={i * u} y={j * u} width={0.8 * u} height={0.8 * u} fill="#fff" />)}
    </g>
  );
};

/** A tile that moves from a scattered position into its grid slot. p 0→1. */
export const BentoTile: React.FC<{ from: [number, number, number]; to: [number, number, number, number]; p: number; children: (w: number, h: number) => React.ReactNode }> = ({ from, to, p, children }) => {
  const e = easeOut(clamp(p));
  const [tx, ty, tw, th] = to;
  const x = from[0] + (tx - from[0]) * e, y = from[1] + (ty - from[1]) * e;
  const rot = from[2] * (1 - e);
  return <g transform={`translate(${x} ${y}) rotate(${rot} ${tw / 2} ${th / 2})`}>{children(tw, th)}</g>;
};

export const pulse01 = (f: number, a: number, b: number) => ramp(f, a, b);
