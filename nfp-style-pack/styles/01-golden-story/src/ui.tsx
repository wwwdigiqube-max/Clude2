import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import caps from "./captions.json";
import { C, clamp, eback, eo, F_HEAD, F_TEXT, fa, pr, rnd } from "./lib";

// ---------- word-by-word captions (y ≈ 1300, above the Instagram UI) ----------
type CapW = { w: string; kw: boolean; s: number; e: number };
type Chunk = { words: CapW[]; s: number; e: number; line: number };
const CHUNKS = caps as Chunk[];
const OUTLINE = [
  "0 0 3px #1E120C",
  "3px 0 0 #1E120C",
  "-3px 0 0 #1E120C",
  "0 3px 0 #1E120C",
  "0 -3px 0 #1E120C",
  "2px 2px 0 #1E120C",
  "-2px 2px 0 #1E120C",
  "2px -2px 0 #1E120C",
  "-2px -2px 0 #1E120C",
  "0 7px 0 #1E120C",
  "0 10px 26px rgba(0,0,0,.55)",
].join(",");

export const Captions: React.FC<{ t: number; y?: number }> = ({ t, y = 1290 }) => {
  let idx = -1;
  for (let i = 0; i < CHUNKS.length; i++) if (t >= CHUNKS[i].s - 0.08) idx = i;
  if (idx < 0) return null;
  const ch = CHUNKS[idx];
  const next = CHUNKS[idx + 1];
  const endT = Math.min(ch.e + 0.6, next ? next.s - 0.08 : ch.e + 0.6);
  if (t > endT) return null;
  const danger = ch.line >= 10;
  const out = pr(t, endT - 0.1, 0.1);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        width: 940,
        top: y,
        direction: "rtl",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "baseline",
        columnGap: 22,
        rowGap: 0,
        opacity: 1 - out,
      }}
    >
      {ch.words.map((w, i) => {
        const p = pr(t, w.s - 0.07, 0.2, eback);
        const vis = t >= w.s - 0.07;
        const hit = pr(t, w.s - 0.05, 0.25);
        const col = w.kw ? (danger ? C.red : C.amber) : C.cream;
        return (
          <span
            key={i}
            style={{
              fontFamily: F_HEAD,
              fontSize: 92,
              lineHeight: 1.32,
              color: col,
              textShadow: OUTLINE,
              opacity: vis ? clamp(p * 3) : 0,
              transform: `translateY(${(1 - p) * 22}px) scale(${0.86 + 0.14 * p + (w.kw ? 0.08 * Math.sin(Math.PI * hit) : 0)})`,
              display: "inline-block",
            }}
          >
            {w.w.replace(/\*/g, "")}
          </span>
        );
      })}
    </div>
  );
};

// ---------- small label pinned to a point (pops in at t0) ----------
export const Tag: React.FC<{ t: number; t0: number; x: number; y: number; text: string; danger?: boolean; t1?: number }> = ({
  t,
  t0,
  x,
  y,
  text,
  danger,
  t1 = 1e9,
}) => {
  if (t < t0 || t > t1 + 0.25) return null;
  const p = pr(t, t0, 0.32, eback);
  const o = 1 - pr(t, t1, 0.25);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -100%) scale(${p})`,
        transformOrigin: "50% 100%",
        opacity: o,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          direction: "rtl",
          fontFamily: F_TEXT,
          fontSize: 46,
          color: danger ? C.cream : C.choco,
          background: danger ? C.red : C.cream,
          padding: "10px 30px 14px",
          borderRadius: 40,
          boxShadow: "0 10px 26px rgba(30,18,12,.45)",
          display: "flex",
          alignItems: "center",
          gap: 14,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ width: 16, height: 16, borderRadius: 8, background: danger ? C.cream : C.burnt }} />
        {text}
      </div>
      <div style={{ width: 4, height: 46 * p, background: danger ? C.red : C.cream, borderRadius: 2 }} />
      <div style={{ width: 18, height: 18, borderRadius: 9, border: `4px solid ${danger ? C.red : C.cream}` }} />
    </div>
  );
};

// ---------- counter card: big number + word (animals) ----------
export const CountCard: React.FC<{ t: number; t0: number; x: number; y: number; n: number; label: string; t1?: number }> = ({
  t,
  t0,
  x,
  y,
  n,
  label,
  t1 = 1e9,
}) => {
  if (t < t0 || t > t1 + 0.25) return null;
  const p = pr(t, t0, 0.35, eback);
  const cnt = Math.round(n * pr(t, t0, 0.5));
  const o = 1 - pr(t, t1, 0.25);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${p}) rotate(${-3 + 3 * p}deg)`,
        opacity: o,
        direction: "rtl",
        display: "flex",
        alignItems: "center",
        gap: 20,
        background: "rgba(30,18,12,.86)",
        border: `4px solid ${C.amber}`,
        borderRadius: 34,
        padding: "8px 40px 14px 44px",
        boxShadow: "0 18px 40px rgba(0,0,0,.45)",
      }}
    >
      <span style={{ fontFamily: F_HEAD, fontSize: 120, color: C.amber, lineHeight: 1.1 }}>{fa(cnt)}</span>
      <span style={{ fontFamily: F_TEXT, fontSize: 58, color: C.cream }}>{label}</span>
    </div>
  );
};

// ---------- burst word (هاپ!) ----------
export const Burst: React.FC<{ t: number; t0: number; x: number; y: number; text: string; color?: string; size?: number; rot?: number }> = ({
  t,
  t0,
  x,
  y,
  text,
  color = C.amber,
  size = 150,
  rot = -8,
}) => {
  if (t < t0 || t > t0 + 1.4) return null;
  const p = pr(t, t0, 0.28, eback);
  const o = 1 - pr(t, t0 + 1.1, 0.3);
  const lines = pr(t, t0, 0.45);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%)`, opacity: o }}>
      <svg width={520} height={520} style={{ position: "absolute", left: -260, top: -260 }}>
        {Array.from({ length: 9 }, (_, i) => {
          const a = (i / 9) * Math.PI * 2 + 0.3;
          const r0 = 120 + 90 * lines, r1 = 160 + 140 * lines;
          return (
            <line
              key={i}
              x1={260 + Math.cos(a) * r0}
              y1={260 + Math.sin(a) * r0}
              x2={260 + Math.cos(a) * r1}
              y2={260 + Math.sin(a) * r1}
              stroke={color}
              strokeWidth={12 * (1 - lines) + 2}
              strokeLinecap="round"
              opacity={1 - lines * 0.6}
            />
          );
        })}
      </svg>
      <div
        style={{
          fontFamily: F_HEAD,
          fontSize: size,
          color,
          textShadow: OUTLINE,
          transform: `scale(${p}) rotate(${rot}deg)`,
          whiteSpace: "nowrap",
          direction: "rtl",
          position: "relative",
        }}
      >
        {text}
      </div>
    </div>
  );
};

// ---------- clock chip at the top: day 1, time advances through the evening ----------
export const TimeChip: React.FC<{ t: number; hide?: number }> = ({ t, hide = 0 }) => {
  const mins = 17 * 60 + 40 + Math.floor(t * 2.6);
  const hh = Math.floor(mins / 60), mm = mins % 60;
  const p = pr(t, 0.15, 0.4, eback);
  const dot = 0.55 + 0.45 * Math.sin(t * 5);
  return (
    <div
      style={{
        position: "absolute",
        top: 150,
        left: 540,
        transform: `translateX(-50%) scale(${p})`,
        opacity: 1 - hide,
        direction: "rtl",
        display: "flex",
        alignItems: "center",
        gap: 18,
        background: "rgba(30,18,12,.72)",
        borderRadius: 40,
        padding: "8px 32px 12px",
        fontFamily: F_TEXT,
        fontSize: 40,
        color: C.cream,
        border: "2px solid rgba(246,231,204,.25)",
      }}
    >
      <span style={{ width: 16, height: 16, borderRadius: 8, background: C.red, opacity: dot }} />
      <span>روز اول</span>
      <span style={{ opacity: 0.5 }}>|</span>
      <span style={{ fontFamily: F_HEAD, fontSize: 44, color: C.amber }}>{fa(`${hh}:${String(mm).padStart(2, "0")}`)}</span>
    </div>
  );
};

// ---------- film grain + vignette + warm light (on every frame) ----------
export const Finish: React.FC<{ f: number; warm?: number; vig?: number }> = ({ f, warm = 0.16, vig = 0.55 }) => {
  const k = Math.floor(f / 2);
  const gx = Math.floor(rnd(k) * 120), gy = Math.floor(rnd(k + 99) * 120);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 90% 60% at 15% 8%, rgba(255,190,110,1) 0%, rgba(255,160,80,0) 70%)",
          mixBlendMode: "screen",
          opacity: warm,
        }}
      />
      <AbsoluteFill
        style={{ background: `radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(25,12,6,${vig}) 100%)` }}
      />
      <Img
        src={staticFile("v01/grain.jpg")}
        style={{ position: "absolute", left: -gx, top: -gy, width: 1200, height: 2040, maxWidth: "none", mixBlendMode: "overlay", opacity: 0.16 }}
      />
    </AbsoluteFill>
  );
};

/** quick warm flash used on a few hard cuts */
export const Flash: React.FC<{ t: number; t0: number; color?: string; d?: number; max?: number }> = ({ t, t0, color = "#FFE2B0", d = 0.25, max = 0.7 }) => {
  if (t < t0 || t > t0 + d) return null;
  return <AbsoluteFill style={{ background: color, opacity: max * (1 - eo(clamp((t - t0) / d))) }} />;
};
