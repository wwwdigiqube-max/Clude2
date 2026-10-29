// Space effects: tile hyperspace (E7), 3D card tunnel (E4), glyph ring (E5), dot-matrix field with morphing stroke (E5), receding card row (E6).
import { noise2D } from "@remotion/noise";
import React from "react";
import { clamp, K, rnd, TILE } from "./theme";

/** Small generative tile art (used by hyperspace, tunnel, bento…). size = box; kind picks a design. */
export const TileArt: React.FC<{ kind: number; s: number; c1: string; c2: string; f?: number }> = ({ kind, s, c1, c2, f = 0 }) => {
  const k = ((kind % 10) + 10) % 10;
  return (
    <g>
      <rect width={s} height={s} rx={s * 0.08} fill={c1} />
      {k === 0 && <circle cx={s / 2} cy={s / 2} r={s * 0.28} fill={c2} />}
      {k === 1 && [0, 1, 2].map((i) => <rect key={i} x={s * 0.12} y={s * (0.15 + i * 0.26)} width={s * 0.76} height={s * 0.14} rx={s * 0.07} fill={c2} />)}
      {k === 2 && <path d={`M${s * 0.15} ${s * 0.85} L${s * 0.5} ${s * 0.15} L${s * 0.85} ${s * 0.85} Z`} fill={c2} />}
      {k === 3 && [0, 1].map((i) => [0, 1].map((j) => <rect key={`${i}${j}`} x={s * (0.14 + i * 0.4)} y={s * (0.14 + j * 0.4)} width={s * 0.32} height={s * 0.32} rx={s * 0.08} fill={c2} />))}
      {k === 4 && <circle cx={s / 2} cy={s / 2} r={s * 0.34} fill="none" stroke={c2} strokeWidth={s * 0.1} strokeDasharray={`${s * 0.12} ${s * 0.08}`} transform={`rotate(${f * 3} ${s / 2} ${s / 2})`} />}
      {k === 5 && Array.from({ length: 9 }, (_, i) => <circle key={i} cx={s * (0.22 + (i % 3) * 0.28)} cy={s * (0.22 + Math.floor(i / 3) * 0.28)} r={s * 0.09} fill={c2} />)}
      {k === 6 && <path d={`M0 ${s} Q ${s * 0.5} ${s * 0.1} ${s} ${s} Z`} fill={c2} />}
      {k === 7 && <rect x={s * 0.2} y={s * 0.2} width={s * 0.6} height={s * 0.6} rx={s * 0.3} fill={c2} transform={`rotate(45 ${s / 2} ${s / 2})`} />}
      {k === 8 && Array.from({ length: 4 }, (_, i) => <rect key={i} x={s * (0.1 + i * 0.21)} y={s * 0.1} width={s * 0.1} height={s * 0.8} fill={c2} />)}
      {k === 9 && <path d={`M${s * 0.2} ${s * 0.3} h${s * 0.25} v${s * 0.2} h${s * 0.35} v${s * 0.3} h${-s * 0.6} Z`} fill={c2} />}
    </g>
  );
};

/** Hyperspace: colorful tiles streaming outward from a center (continuous while active). p = intensity 0..1. */
export const Hyperspace: React.FC<{ cx?: number; cy?: number; f: number; start: number; n?: number; p?: number; seed?: number }> = ({ cx = 960, cy = 540, f, start, n = 140, p = 1, seed = 5 }) => {
  if (f < start) return null;
  const items = Array.from({ length: n }, (_, i) => {
    const life = 38 + rnd(i * 3 + seed) * 30;
    const t = ((f - start + rnd(i + seed) * life) % life) / life; // 0..1 over its life
    const born = f - start >= rnd(i + seed) * 12; // staggered first appearance
    const ang = rnd(i * 7 + seed) * Math.PI * 2;
    const d = Math.pow(t, 2.2) * 1250;
    const s = (8 + rnd(i * 11 + seed) * 60) * (0.2 + t * 2.2);
    return { i, t, born, x: cx + Math.cos(ang) * d * 1.25, y: cy + Math.sin(ang) * d * 0.8, s, kind: Math.floor(rnd(i * 13 + seed) * 10), c1: TILE[i % TILE.length], c2: TILE[(i * 5 + 3) % TILE.length] };
  }).filter((o) => o.born).sort((a, b) => a.s - b.s);
  return (
    <g opacity={p}>
      {items.map((o) => (
        <g key={o.i} transform={`translate(${o.x - o.s / 2} ${o.y - o.s / 2})`} opacity={clamp(o.t * 6) * (o.t > 0.92 ? (1 - o.t) / 0.08 : 1)}>
          <TileArt kind={o.kind} s={o.s} c1={o.c1} c2={o.c2} f={f} />
        </g>
      ))}
      {/* radial speed lines */}
      {Array.from({ length: 28 }, (_, i) => {
        const a = (i / 28) * Math.PI * 2;
        const r1 = 60 + ((f * 9 + i * 37) % 400), r2 = r1 + 60;
        return <line key={i} x1={cx + Math.cos(a) * r1} y1={cy + Math.sin(a) * r1 * 0.7} x2={cx + Math.cos(a) * r2} y2={cy + Math.sin(a) * r2 * 0.7} stroke="#ffffff" strokeWidth="1.5" opacity={0.25} />;
      })}
    </g>
  );
};

/** Perspective projection helper (camera at origin looking +Z). */
const F = 760;
const proj = (X: number, Y: number, Z: number, cx: number, cy: number) => [cx + (X * F) / Z, cy + (Y * F) / Z] as const;

/** 3D tunnel of cards on walls/floor/ceiling rushing toward the camera. speed in world units/frame. lanes: extra split. */
export const Tunnel: React.FC<{ f: number; speed?: number; cx?: number; cy?: number; seed?: number; tint?: number; split?: number }> = ({ f, speed = 38, cx = 960, cy = 540, seed = 2, tint = 0, split = 0 }) => {
  const GAP = 420, DEPTH = 6400, N = Math.ceil(DEPTH / GAP);
  const quads: { z: number; pts: string; fill: string; stroke: string; o: number; key: string }[] = [];
  const walls = [
    { kind: "L", X: -760 - split * 300 }, { kind: "R", X: 760 + split * 300 }, { kind: "F", Y: 430 }, { kind: "C", Y: -430 },
  ];
  for (let k = 0; k < N; k++) {
    const z0 = ((k * GAP - f * speed) % DEPTH + DEPTH) % DEPTH + 120;
    const z1 = z0 + GAP * 0.8;
    walls.forEach((w, wi) => {
      const idx = k * 4 + wi + Math.floor((f * speed) / DEPTH) * 97;
      const c = TILE[Math.floor(rnd(idx + seed) * TILE.length)];
      const gray = `rgb(${60 + wi * 20},${58 + wi * 20},${66 + wi * 20})`;
      const fill = rnd(idx * 3 + seed) < 0.35 + tint * 0.4 ? c : gray;
      let p: (readonly [number, number])[] = [];
      if (w.kind === "L" || w.kind === "R") p = [proj(w.X!, -330, z0, cx, cy), proj(w.X!, -330, z1, cx, cy), proj(w.X!, 330, z1, cx, cy), proj(w.X!, 330, z0, cx, cy)];
      else p = [proj(-620, w.Y!, z0, cx, cy), proj(620, w.Y!, z0, cx, cy), proj(620, w.Y!, z1, cx, cy), proj(-620, w.Y!, z1, cx, cy)];
      const o = clamp(1.25 - z0 / DEPTH);
      quads.push({ z: z0, pts: p.map((q) => q.join(",")).join(" "), fill, stroke: "#f2f1f4", o, key: `${k}-${wi}` });
    });
  }
  quads.sort((a, b) => b.z - a.z);
  return (
    <g>
      {quads.map((q) => <polygon key={q.key} points={q.pts} fill={q.fill} stroke={q.stroke} strokeWidth="1.2" strokeOpacity={0.35} opacity={q.o} />)}
    </g>
  );
};

/** Ring of small glyph-shapes (brackets, dots, parens) rotating — "renewal" loop (E5). */
export const GlyphRing: React.FC<{ cx: number; cy: number; r: number; f: number; n?: number; a?: number; speed?: number }> = ({ cx, cy, r, f, n = 16, a = 1, speed = 1.4 }) => (
  <g opacity={a}>
    {Array.from({ length: n }, (_, i) => {
      const ang = ((i / n) * 360 + f * speed) * (Math.PI / 180);
      const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r;
      const col = [K.white, K.mint, K.blue, K.lav][i % 4];
      const k = i % 4;
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${(ang * 180) / Math.PI + 90})`}>
          {k === 0 && <path d="M-9 -9 H9 V9" stroke={col} strokeWidth="4" fill="none" />}
          {k === 1 && <circle r="6" fill={col} />}
          {k === 2 && <path d="M-4 -10 Q -10 0 -4 10 M4 -10 Q 10 0 4 10" stroke={col} strokeWidth="3" fill="none" />}
          {k === 3 && <rect x="-6" y="-6" width="12" height="12" fill={col} />}
        </g>
      );
    })}
  </g>
);

/** Dark dot-matrix field + a thick orange dotted stroke that morphs (E5). curve(k, f) → [x,y] for k∈[0,1]. */
export const DotField: React.FC<{ f: number; curve?: (k: number, f: number) => [number, number]; stroke?: number; a?: number; step?: number; draw?: number; color?: string }> = ({
  f, curve, stroke = 1, a = 1, step = 14, draw = 1, color = K.orange,
}) => {
  const bg: React.ReactNode[] = [];
  for (let y = 10; y < 1080; y += step) {
    for (let x = 10; x < 1920; x += step) {
      const n = noise2D("df", x * 0.004 + f * 0.004, y * 0.006);
      if (n > 0.25) bg.push(<rect key={`${x},${y}`} x={x} y={y} width="3" height="2" fill={n > 0.5 ? "#3d6a8a" : "#2c4a4a"} opacity={(n - 0.2) * 1.6} />);
    }
  }
  const hot = new Map<string, number>();
  if (curve && stroke > 0) {
    const N = 900;
    for (let s = 0; s < N * draw; s++) {
      const [px, py] = curve(s / N, f);
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
        if (dx * dx + dy * dy > 9 * stroke) continue;
        const gx = Math.round(px / 8 + dx) * 8, gy = Math.round(py / 8 + dy) * 8;
        const key = `${gx},${gy}`;
        hot.set(key, Math.max(hot.get(key) ?? 0, s / N));
      }
    }
  }
  return (
    <g opacity={a}>
      {bg}
      {[...hot.entries()].map(([k, s]) => {
        const [x, y] = k.split(",").map(Number);
        const white = s > draw - 0.12; // leading end glows white
        return <rect key={k} x={x - 3} y={y - 3} width="7" height="7" fill={white ? "#fbe9df" : color} />;
      })}
    </g>
  );
};

/** Row of cards receding into depth (E6). Each card: render(i). `slide` shifts the row (cards move forward). */
export const CardRow: React.FC<{ n: number; x: number; y: number; w: number; h: number; slide?: number; render: (i: number) => React.ReactNode; appear?: (i: number) => number; gap?: number; shrink?: number }> = ({
  n, x, y, w, h, slide = 0, render, appear = () => 1, gap = 0.62, shrink = 0.8,
}) => {
  const cards = Array.from({ length: n }, (_, i) => {
    const d = slide - i; // depth index: 0 = front, older cards recede (d>0), incoming ones arrive from the right (d<0)
    const s = Math.pow(shrink, Math.max(-1.5, d));
    const cx = x - (1 - Math.pow(shrink, Math.max(-1.5, d))) * w * gap * 2.4 + (d < 0 ? -d * w * 1.2 : 0);
    return { i, d, s, cx };
  });
  return (
    <g>
      {cards.sort((a, b) => b.d - a.d).map(({ i, s, cx, d }) => {
        const a = appear(i);
        if (a <= 0) return null;
        return (
          <g key={i} transform={`translate(${cx} ${y}) scale(${s * (0.85 + 0.15 * a)}) translate(${-w / 2} ${-h / 2})`} opacity={clamp(a * 2) * clamp(1.4 - d * 0.18)}>
            <rect width={w} height={h} rx="6" fill="#222026" />
            <svg width={w} height={h} overflow="hidden">{render(i)}</svg>
          </g>
        );
      })}
    </g>
  );
};
