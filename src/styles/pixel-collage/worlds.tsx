// Procedural "photo" worlds for portals (E11): sunset sea, mirrored clouds, galaxy; plus portal frame and prism burst.
import { noise2D } from "@remotion/noise";
import React from "react";
import { K, rnd } from "./theme";

type WP = { w: number; h: number; f: number; id: string };

export const SeaWorld: React.FC<WP> = ({ w, h, f, id }) => {
  const hz = h * 0.5;
  return (
    <g>
      <defs>
        <linearGradient id={`sky${id}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#6f86ad" /><stop offset=".7" stopColor="#cfc3cf" /><stop offset="1" stopColor="#f3d8bf" /></linearGradient>
        <linearGradient id={`sea${id}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#b8b8c6" /><stop offset="1" stopColor="#5d6b86" /></linearGradient>
        <radialGradient id={`sun${id}`}><stop offset="0" stopColor="#fff6e6" /><stop offset=".25" stopColor="#ffe7c7" stopOpacity=".8" /><stop offset="1" stopColor="#ffe7c7" stopOpacity="0" /></radialGradient>
        <filter id={`bl${id}`}><feGaussianBlur stdDeviation="18" /></filter>
      </defs>
      <rect width={w} height={hz} fill={`url(#sky${id})`} />
      {Array.from({ length: 7 }, (_, i) => (
        <ellipse key={i} cx={((rnd(i + 3) * w * 1.4 + f * (0.3 + rnd(i) * 0.4)) % (w * 1.4)) - w * 0.2} cy={hz * (0.15 + rnd(i * 5) * 0.55)} rx={w * (0.12 + rnd(i * 2) * 0.12)} ry={hz * 0.07} fill="#eef0f6" opacity={0.55} filter={`url(#bl${id})`} />
      ))}
      <rect y={hz} width={w} height={h - hz} fill={`url(#sea${id})`} />
      {Array.from({ length: 60 }, (_, i) => {
        const yy = hz + Math.pow(i / 60, 1.8) * (h - hz);
        const len = w * (0.05 + rnd(i) * 0.25);
        const xx = ((rnd(i * 3) * w + f * (1 + i * 0.05)) % (w + len)) - len;
        return <rect key={i} x={xx} y={yy} width={len} height={1.5 + (i / 60) * 3} fill="#fff" opacity={0.18 + 0.25 * Math.abs(Math.sin(f / 10 + i))} />;
      })}
      <circle cx={w * 0.55} cy={hz} r={h * 0.35} fill={`url(#sun${id})`} />
      <rect x={w * 0.5} y={hz} width={w * 0.1} height={h - hz} fill="#fff4e0" opacity={0.25} filter={`url(#bl${id})`} />
    </g>
  );
};

/** Sky full of clouds mirrored in still water. */
export const CloudWorld: React.FC<WP> = ({ w, h, f, id }) => {
  const hz = h * 0.5;
  const clouds = Array.from({ length: 16 }, (_, i) => ({ x: rnd(i) * w, y: hz * (0.15 + rnd(i * 3) * 0.7), r: h * (0.08 + rnd(i * 7) * 0.12), gold: rnd(i * 11) < 0.3 }));
  const layer = (flip: boolean) => (
    <g transform={flip ? `translate(0 ${h}) scale(1 -1)` : undefined} opacity={flip ? 0.75 : 1}>
      <rect width={w} height={hz} fill={`url(#cs${id})`} />
      {clouds.map((c, i) => (
        <g key={i} filter={`url(#cb${id})`}>
          {[0, 1, 2, 3].map((k) => (
            <circle key={k} cx={c.x + (k - 1.5) * c.r * 0.7 + Math.sin(f / 60 + i) * 20} cy={c.y - (k % 2) * c.r * 0.35} r={c.r * (0.7 + (k % 2) * 0.3)} fill={c.gold ? "#f3d9a0" : "#f4f6fb"} opacity={0.85} />
          ))}
        </g>
      ))}
    </g>
  );
  return (
    <g>
      <defs>
        <linearGradient id={`cs${id}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#2f5f8c" /><stop offset="1" stopColor="#8fb8d8" /></linearGradient>
        <filter id={`cb${id}`}><feGaussianBlur stdDeviation="10" /></filter>
      </defs>
      {layer(false)}
      {layer(true)}
      <rect y={hz - 2} width={w} height="4" fill="#dbe8f2" opacity=".6" />
    </g>
  );
};

/** Spiral galaxy of particles. */
export const Galaxy: React.FC<WP> = ({ w, h, f, id }) => {
  const cx = w / 2, cy = h / 2;
  return (
    <g>
      <defs>
        <radialGradient id={`core${id}`}><stop offset="0" stopColor="#fff3d6" /><stop offset=".2" stopColor="#f0c9a0" stopOpacity=".7" /><stop offset="1" stopColor="#1a2238" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={w} height={h} fill="#0b1020" />
      {Array.from({ length: 140 }, (_, i) => <circle key={`s${i}`} cx={rnd(i) * w} cy={rnd(i + 99) * h} r={rnd(i * 3) * 1.8 + 0.4} fill="#fff" opacity={0.3 + 0.6 * Math.abs(Math.sin(f / 15 + i))} />)}
      {Array.from({ length: 900 }, (_, i) => {
        const arm = i % 2;
        const t = rnd(i * 7) ;
        const r = t * Math.min(w, h) * 0.46;
        const a = arm * Math.PI + t * 5.2 + f * 0.006 + (rnd(i * 13) - 0.5) * 0.7 * (1 - t * 0.5);
        const x = cx + Math.cos(a) * r * 1.35, y = cy + Math.sin(a) * r * 0.75;
        const warm = rnd(i * 17) < 0.25;
        return <circle key={i} cx={x} cy={y} r={0.6 + rnd(i * 19) * 1.8 * (1 - t)} fill={warm ? "#ffd9a8" : "#dfe8ff"} opacity={0.35 + 0.5 * (1 - t)} />;
      })}
      <ellipse cx={cx} cy={cy} rx={w * 0.22} ry={h * 0.2} fill={`url(#core${id})`} />
    </g>
  );
};

/** Prismatic beams with black/blue squares radiating from a center (E11 cloud scene). */
export const Prism: React.FC<{ cx: number; cy: number; f: number; s?: number; a?: number }> = ({ cx, cy, f, s = 1, a = 1 }) => {
  const arms = [[-1, -1, 90, K.ink], [1, -0.3, 60, K.blue], [0.5, 1, 55, K.ink], [-0.7, 0.6, 38, "#fff"], [0.2, -0.8, 34, "#fff"]] as const;
  return (
    <g opacity={a} transform={`translate(${cx} ${cy}) scale(${s}) rotate(${Math.sin(f / 40) * 6})`}>
      <defs>
        <linearGradient id="prismG" x1="0" x2="1"><stop offset="0" stopColor="#ffb6e1" /><stop offset=".5" stopColor="#b9c7ff" /><stop offset="1" stopColor="#9ef0ff" /></linearGradient>
      </defs>
      {arms.map(([dx, dy, sz, col], i) => {
        const L = 240 + i * 30;
        const x = dx * L, y = dy * L;
        return (
          <g key={i}>
            <path d={`M0 0 L${x - sz * 0.4} ${y + sz * 0.4} L${x + sz * 0.4} ${y - sz * 0.4} Z`} fill="url(#prismG)" opacity={0.75} />
            <rect x={x - sz / 2} y={y - sz / 2} width={sz} height={sz} fill={col} />
          </g>
        );
      })}
      <rect x="-14" y="-14" width="28" height="28" fill={K.ink} />
    </g>
  );
};

/** Noise-driven color field helper (for tiles). */
export const nfield = (id: string, x: number, y: number, t: number) => noise2D(id, x * 0.01 + t * 0.01, y * 0.01);
