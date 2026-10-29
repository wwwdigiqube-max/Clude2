// Pixel effects: block-built images (E1), glitch/datamosh (E4), dither dot clouds, pixel sprites (E2).
import { noise2D } from "@remotion/noise";
import React from "react";
import { clamp, easeBack, ramp, rnd } from "./theme";

export type ColorFn = (u: number, v: number, i: number, j: number) => string | null;

/** Quantize a 0..1 value into a palette. */
export const quant = (x: number, pal: string[]) => pal[Math.max(0, Math.min(pal.length - 1, Math.floor(clamp(x) * pal.length)))];

const SKY = ["#1d68b8", "#2f82cf", "#5d9fdc", "#94c1e6", "#c3dcef", "#e6eff6"];
/** Pixel sky with drifting clouds. */
export const skyFn = (t: number, seed = "sky"): ColorFn => (u, v) => {
  const n = noise2D(seed, u * 2.4 + t * 0.03, v * 3.1) * 0.6 + noise2D(seed + "b", u * 6 + t * 0.05, v * 6) * 0.25;
  return quant(0.45 + n * 0.75 + (v - 0.5) * 0.15, SKY);
};
const LAND = ["#1f3b2a", "#2f5e3a", "#4f8a45", "#8fbf5a", "#d9d27a", "#f0a07a"];
/** Pixel landscape: sky band, hills, sun. */
export const landFn = (t: number): ColorFn => (u, v) => {
  const hill = 0.55 + noise2D("hill", u * 2.2, 0.3) * 0.12;
  const sun = Math.hypot(u - 0.72, v - 0.3);
  if (v < hill) return sun < 0.09 ? "#f5e04a" : quant(0.55 + v * 0.6 + noise2D("s", u * 3 + t * 0.02, v * 3) * 0.2, SKY);
  return quant(0.15 + (v - hill) * 1.3 + noise2D("l", u * 5, v * 5) * 0.35, LAND);
};

/**
 * Image built from blocks. reveal 0→1 builds it in `order`; glitch 0→1 shifts rows / scatters cells (needs f).
 * Top-left of the image is (x,y).
 */
export const PixelImage: React.FC<{
  x: number; y: number; w: number; h: number; cols: number; rows: number; color: ColorFn; reveal?: number;
  order?: "stair" | "random" | "center"; glitch?: number; f?: number; seed?: number; gap?: number; radius?: number;
}> = ({ x, y, w, h, cols, rows, color, reveal = 1, order = "stair", glitch = 0, f = 0, seed = 1, gap = 0, radius = 0 }) => {
  const cw = w / cols, ch = h / rows;
  const cells: React.ReactNode[] = [];
  const gt = Math.floor(f / 2);
  for (let j = 0; j < rows; j++) {
    const rowShift = glitch > 0 && rnd(j * 13 + gt * 31 + seed) < glitch * 0.45 ? (rnd(j + gt * 7) - 0.5) * glitch * 260 : 0;
    for (let i = 0; i < cols; i++) {
      const u = (i + 0.5) / cols, v = (j + 0.5) / rows;
      const r = rnd(i * 97 + j * 31 + seed);
      const th = order === "random" ? r : order === "center" ? Math.hypot(u - 0.5, v - 0.5) * 1.3 + r * 0.12 : (u * 0.35 + v * 0.65) * 0.9 + r * 0.14;
      const p = clamp((reveal * 1.2 - th) / 0.12);
      if (p <= 0) continue;
      const c = color(u, v, i, j);
      if (!c) continue;
      let dx = rowShift, dy = 0, col = c;
      if (glitch > 0 && rnd(i * 7 + j * 11 + gt * 17 + seed) < glitch * 0.08) {
        dx += (rnd(i + gt) - 0.5) * 400 * glitch; dy += (rnd(j + gt * 3) - 0.5) * 200 * glitch; col = rnd(i + j + gt) < 0.5 ? "#f2f1f4" : "#555";
      }
      const s = p < 1 ? 0.3 + 0.7 * p : 1;
      cells.push(<rect key={j * cols + i} x={x + i * cw + dx + (cw * (1 - s)) / 2} y={y + j * ch + dy + (ch * (1 - s)) / 2} width={cw * s - gap + 0.6} height={ch * s - gap + 0.6} rx={radius} fill={col} />);
    }
  }
  return <g>{cells}</g>;
};

/** Clusters of white dither dots that hug an image's edges (E1). */
export const DitherClouds: React.FC<{ clusters: [number, number, number][]; f: number; a?: number; color?: string; step?: number }> = ({ clusters, f, a = 1, color = "#f2f1f4", step = 7 }) => (
  <g opacity={a}>
    {clusters.map(([cx, cy, r], k) => {
      const dots: React.ReactNode[] = [];
      for (let yy = -r * 0.5; yy <= r * 0.5; yy += step) {
        for (let xx = -r; xx <= r; xx += step) {
          const e = (xx / r) ** 2 + (yy / (r * 0.5)) ** 2;
          const n = noise2D("dc" + k, xx * 0.03 + f * 0.01, yy * 0.05);
          if (e < 1 && n > -0.1 + e * 0.5) dots.push(<rect key={`${xx},${yy}`} x={cx + xx + Math.sin(f / 30 + k) * 10} y={cy + yy} width="2.6" height="2.6" fill={color} />);
        }
      }
      return <g key={k}>{dots}</g>;
    })}
  </g>
);

/** Pixel sprite from string rows ('#' = on). Top-left at (x,y), cell size s. */
export const Sprite: React.FC<{ rows: string[]; x: number; y: number; s: number; color?: string; flip?: boolean }> = ({ rows, x, y, s, color = "#111013", flip }) => (
  <g>
    {rows.flatMap((row, j) => row.split("").map((c, i) => (c === "#" ? <rect key={`${i},${j}`} x={x + (flip ? row.length - 1 - i : i) * s} y={y + j * s} width={s + 0.5} height={s + 0.5} fill={color} /> : null)))}
  </g>
);

/** Running-rabbit cycle (3 frames). */
export const RABBIT = [
  [
    "..............##......",
    ".............###......",
    "............####......",
    "...........######.....",
    ".....##############...",
    "....##############....",
    "....#############.....",
    ".....##########.......",
    "......###..####.......",
    ".....###....###.......",
  ],
  [
    "................##....",
    "...............###....",
    "..............####....",
    ".#...........######...",
    ".##########.#######...",
    "..#############.......",
    "...############.......",
    "..###........###......",
    ".##............##.....",
    "##..............#.....",
  ],
  [
    "...............##.....",
    "..............###.....",
    ".............####.....",
    "......#.....######....",
    "....##############....",
    "...##############.....",
    "....############......",
    "....###....####.......",
    "...###......###.......",
    "..##.........##.......",
  ],
];

/** HUD corner brackets + gray "code bars" (decorative, unreadable). */
export const Hud: React.FC<{ x: number; y: number; w: number; h: number; f: number; a?: number; seed?: number }> = ({ x, y, w, h, f, a = 1, seed = 0 }) => (
  <g opacity={a}>
    {[[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]].map(([px, py, sx, sy], i) => (
      <path key={i} d={`M${px} ${py + 34 * sy} V${py} H${px + 34 * sx}`} stroke="#f2f1f4" strokeWidth="7" fill="none" />
    ))}
    {Array.from({ length: 5 }, (_, i) => (
      <rect key={i} x={x + 18} y={y + 22 + i * 18} width={(60 + rnd(i + seed) * 160) * clamp((f - i * 2) / 10)} height="10" fill={i % 2 ? "#6b6870" : "#a9a6ad"} />
    ))}
    <rect x={x + w - 170} y={y + h - 80} width="150" height="62" fill="#f2f1f4" opacity={0.9} />
    {Array.from({ length: 4 }, (_, i) => (
      <rect key={`b${i}`} x={x + w - 160 + i * 36} y={y + h - 70 + ((f + i * 5) % 20 < 10 ? 0 : 6)} width="26" height="42" fill="#111013" />
    ))}
  </g>
);

/** Gray mosaic chunks flying out (datamosh debris). */
export const Debris: React.FC<{ cx: number; cy: number; f: number; at: number; n?: number; seed?: number }> = ({ cx, cy, f, at, n = 26, seed = 3 }) => {
  const t = f - at;
  if (t < 0 || t > 40) return null;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const a = rnd(i + seed) * Math.PI * 2, sp = 8 + rnd(i * 3 + seed) * 22;
        const s = 20 + rnd(i * 5 + seed) * 70;
        const px = cx + Math.cos(a) * sp * t, py = cy + Math.sin(a) * sp * t * 0.7;
        const g = Math.floor(90 + rnd(i * 9) * 120);
        return <rect key={i} x={px - s / 2} y={py - s / 2} width={s * (1 + t / 30)} height={s * (1 + t / 30)} fill={`rgb(${g},${g},${g + 6})`} opacity={1 - t / 40} />;
      })}
    </g>
  );
};

/** Pixel cut: blocks cover the frame just before `cut` (frame) and clear just after it, in random order. */
export const PixelCut: React.FC<{ f: number; cut: number; half?: number; cell?: number; colors?: string[]; seed?: number }> = ({ f, cut, half = 5, cell = 96, colors = ["#131115", "#1f1c23", "#2a2630"], seed = 1 }) => {
  const d = f - cut;
  if (d < -half || d > half) return null;
  const cols = Math.ceil(1920 / cell), rows = Math.ceil(1080 / cell);
  const cells: React.ReactNode[] = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const r = rnd(i * 31 + j * 17 + seed);
    const on = d < 0 ? -d <= half * (1 - r) : d <= half * r; // cover progressively, then uncover progressively
    if (on) cells.push(<rect key={`${i},${j}`} x={i * cell} y={j * cell} width={cell + 1} height={cell + 1} fill={colors[(i + j) % colors.length]} />);
  }
  return <svg width="1920" height="1080" style={{ position: "absolute", left: 0, top: 0 }}>{cells}</svg>;
};

export const popIn =(f: number, a: number, d = 10) => ramp(f, a, a + d, easeBack);
