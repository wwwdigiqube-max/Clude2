// Card/tile artworks (drawn in a local w×h box). Shared by the service tiles (scene 7) and the pipeline cards (scene 8).
import React from "react";
import { K, landFn, PixelImage, RABBIT, rnd, skyFn, Sprite } from "../styles/pixel-collage";

export type Art = (w: number, h: number, f: number, t: number) => React.ReactNode; // t = frames since the card appeared

export const artSky: Art = (w, h, f, t) => <PixelImage x={0} y={0} w={w} h={h} cols={Math.round(w / 22)} rows={Math.round(h / 22)} color={skyFn(f)} reveal={Math.min(1, t / 20)} />;
export const artLand: Art = (w, h, f, t) => <PixelImage x={0} y={0} w={w} h={h} cols={Math.round(w / 20)} rows={Math.round(h / 20)} color={landFn(f)} reveal={Math.min(1, t / 20)} />;

/** Motion-blurred forest + film strip of white cards with the running rabbit (E2). */
export const artRabbit: Art = (w, h, f) => (
  <g>
    <rect width={w} height={h} fill="#4f6b3a" />
    {Array.from({ length: 14 }, (_, i) => {
      const x = ((rnd(i) * w * 1.6 - f * (18 + rnd(i * 3) * 14)) % (w * 1.6) + w * 1.6) % (w * 1.6) - w * 0.3;
      return <rect key={i} x={x} y={0} width={w * (0.05 + rnd(i * 5) * 0.12)} height={h} fill={["#2d4424", "#8fae6a", "#c9dca0", "#3f5a2f"][i % 4]} opacity={0.7} />;
    })}
    {Array.from({ length: 4 }, (_, i) => {
      const cw = h * 0.56, gap = cw * 0.2;
      const x = ((i * (cw * 1.5 + gap) - f * 9) % ((cw * 1.5 + gap) * 4) + (cw * 1.5 + gap) * 4) % ((cw * 1.5 + gap) * 4) - cw;
      const fr = RABBIT[(Math.floor(f / 3) + i) % 3];
      return (
        <g key={i} transform={`translate(${x} ${h * 0.22})`}>
          <rect width={cw * 1.5} height={cw} rx="6" fill="#eef1f0" />
          <Sprite rows={fr} x={cw * 0.1} y={cw * 0.16} s={(cw * 1.3) / 22} />
        </g>
      );
    })}
  </g>
);

/** Orange dot-matrix waveform (audio). */
export const artWave: Art = (w, h, f) => {
  const step = Math.max(10, w / 44);
  const dots: React.ReactNode[] = [];
  for (let x = step / 2; x < w; x += step) {
    const amp = (0.15 + 0.35 * Math.abs(Math.sin(x / 60 + f / 6)) * Math.abs(Math.sin(x / 23 - f / 9))) * h;
    for (let y = step / 2; y < h; y += step) {
      const on = Math.abs(y - h / 2) < amp;
      if (on) dots.push(<rect key={`${x},${y}`} x={x - step * 0.35} y={y - step * 0.35} width={step * 0.7} height={step * 0.7} fill={Math.abs(y - h / 2) > amp - step ? "#fbe9df" : K.orange} />);
    }
  }
  return <g><rect width={w} height={h} fill="#171419" />{dots}</g>;
};

/** Starburst lines (idea). */
export const artIdea: Art = (w, h, f, t) => (
  <g>
    <rect width={w} height={h} fill="#e9e7ec" />
    {Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2 + f * 0.01;
      const L = Math.min(w, h) * 0.38 * Math.min(1, t / 12) * (0.6 + 0.4 * rnd(i));
      return <line key={i} x1={w / 2} y1={h / 2} x2={w / 2 + Math.cos(a) * L} y2={h / 2 + Math.sin(a) * L} stroke={K.ink} strokeWidth="4" />;
    })}
    {Array.from({ length: 9 }, (_, i) => <rect key={`s${i}`} x={w * (0.15 + rnd(i * 3) * 0.7)} y={h * (0.15 + rnd(i * 5) * 0.7)} width="14" height="14" fill="none" stroke={K.ink} strokeWidth="3" />)}
    <circle cx={w / 2} cy={h / 2} r={10 + 4 * Math.sin(f / 5)} fill={K.yellow} />
  </g>
);

/** Storyboard grid (script). */
export const artScript: Art = (w, h, f, t) => (
  <g>
    <rect width={w} height={h} fill="#3a3540" />
    {Array.from({ length: 6 }, (_, i) => {
      const cw = w * 0.26, ch = h * 0.3;
      const x = w * 0.08 + (i % 3) * (cw + w * 0.04), y = h * 0.1 + Math.floor(i / 3) * (ch + h * 0.16);
      const a = Math.min(1, Math.max(0, (t - i * 3) / 6));
      return (
        <g key={i} opacity={a}>
          <rect x={x} y={y} width={cw} height={ch} rx="4" fill="none" stroke="#e9e7ec" strokeWidth="3" />
          <circle cx={x + cw * (0.3 + 0.4 * rnd(i))} cy={y + ch * 0.5} r={ch * 0.18} fill={[K.lav, K.mint, K.orange][i % 3]} />
          <rect x={x} y={y + ch + h * 0.03} width={cw * (0.5 + rnd(i * 7) * 0.5)} height="6" fill="#8c8a90" />
        </g>
      );
    })}
  </g>
);

/** Timeline blocks sliding (edit). */
export const artEdit: Art = (w, h, f) => (
  <g>
    <rect width={w} height={h} fill={K.purple} />
    {[0, 1, 2, 3].map((r) => Array.from({ length: 6 }, (_, i) => {
      const bw = w * (0.12 + rnd(i * 3 + r) * 0.18);
      const x = ((i * w * 0.28 - f * (3 + r)) % (w * 1.6) + w * 1.6) % (w * 1.6) - w * 0.3;
      return <rect key={`${r}-${i}`} x={x} y={h * (0.14 + r * 0.19)} width={bw} height={h * 0.13} rx="6" fill={[K.lime, K.orange, K.cyan, K.pink][(i + r) % 4]} />;
    }))}
    <rect x={w * 0.5 + Math.sin(f / 20) * w * 0.2} y={h * 0.06} width="4" height={h * 0.88} fill="#fff" />
  </g>
);

/** Circles + green-striped balls (music / generative). */
export const artBalls: Art = (w, h, f) => (
  <g>
    <rect width={w} height={h} fill={K.blue} />
    {Array.from({ length: 6 }, (_, i) => {
      const cx = w * (0.25 + (i % 2) * 0.5), cy = h * (0.2 + Math.floor(i / 2) * 0.3);
      const r = Math.min(w, h) * 0.13 * (1 + 0.08 * Math.sin(f / 7 + i));
      return (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r} fill={K.mint} />
          <rect x={cx - r} y={cy - r * 0.15} width={r * 2} height={r * 0.3} fill="#8fd6a0" />
        </g>
      );
    })}
    <path d={`M${w * 0.38} ${h * 0.95} L${w * 0.5} ${h * 0.6} L${w * 0.62} ${h * 0.95} Z`} fill={K.ink} />
  </g>
);

/** Pixel play/send glyph (output). */
export const artSend: Art = (w, h, f) => {
  const u = Math.min(w, h) / 12;
  const tri = ["#.....", "###...", "#####.", "######", "#####.", "###...", "#....."];
  return (
    <g>
      <rect width={w} height={h} fill={K.lime} />
      <Sprite rows={tri} x={w / 2 - 3 * u + Math.sin(f / 6) * 4} y={h / 2 - 3.5 * u} s={u} />
      {Array.from({ length: 5 }, (_, i) => <rect key={i} x={((f * 6 + i * w * 0.22) % (w * 1.1)) - w * 0.1} y={h * (0.15 + i * 0.17)} width={w * 0.08} height="4" fill={K.ink} opacity=".5" />)}
    </g>
  );
};

export const ART_BY_NAME = { artSky, artLand, artRabbit, artWave, artIdea, artScript, artEdit, artBalls, artSend };
