import React, { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { clamp, easeBack, easeOut, fa, P, PF, rnd, TEX, V } from "./theme";

/* ═════════ surfaces ═════════ */
export const Desk: React.FC<{ w?: number; h?: number }> = ({ w = V.W, h = V.H }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, backgroundColor: P.desk, backgroundImage: `url(${staticFile(TEX.desk)})`, backgroundSize: "1920px 1080px" }} />
);
const PRINT: React.CSSProperties = { filter: "grayscale(.92) sepia(.14) contrast(1.12) brightness(.98)" };

/**
 * A photocopied sheet pinned on the desk. a = appear 0..1 (drops in), lift = hover shadow.
 * Children are laid out inside (w×h). Keep content grey (P.ink…) and use <Photo> for images; a red <Mark> can live inside.
 * print = desaturate everything inside (red marks inside would turn grey then).
 */
export const Sheet: React.FC<{ x: number; y: number; w: number; h: number; rot?: number; a?: number; pin?: boolean; children?: React.ReactNode; from?: "top" | "left" | "right" | "bottom" | "none"; style?: React.CSSProperties; print?: boolean }> = ({ x, y, w, h, rot = 0, a = 1, pin = true, children, from = "top", style, print }) => {
  if (a <= 0) return null;
  const e = easeOut(clamp(a));
  const off = 1 - e;
  const dx = from === "left" ? -off * 900 : from === "right" ? off * 900 : 0;
  const dy = from === "top" ? -off * 700 : from === "bottom" ? off * 700 : 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `translate(${dx}px, ${dy}px) rotate(${rot + off * (from === "none" ? 0 : 12)}deg) scale(${from === "none" ? 0.9 + 0.1 * e : 1})`, opacity: from === "none" ? e : 1, boxShadow: `0 ${12 + off * 30}px ${26 + off * 40}px rgba(0,0,0,.55), 0 2px 4px rgba(0,0,0,.35)`, backgroundColor: P.paper, backgroundImage: `url(${staticFile(TEX.paper)})`, backgroundSize: "900px 900px", backgroundPosition: `${(x * 7) % 900}px ${(y * 3) % 900}px`, overflow: "hidden", ...style }}>
      <div style={{ position: "absolute", inset: 0, ...(print ? PRINT : {}) }}>{children}</div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,.08), transparent 40%, rgba(0,0,0,.07))", pointerEvents: "none" }} />
      {pin && <div style={{ position: "absolute", left: "50%", top: -9, width: 22, height: 22, marginLeft: -11, borderRadius: 11, background: "#151515", boxShadow: "0 2px 3px rgba(0,0,0,.6)" }} />}
    </div>
  );
};

/** Full-frame paper (for "the whole screen is a print" shots). */
export const FullPaper: React.FC<{ children?: React.ReactNode; w?: number; h?: number }> = ({ children, w = V.W, h = V.H }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, backgroundColor: P.paper, backgroundImage: `url(${staticFile(TEX.paper)})`, backgroundSize: "1100px 1100px", overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0 }}>{children}</div>
  </div>
);

/** A photo printed on the photocopier: B&W, punchy contrast, paper grain + fine dot screen on top. Fills its box (cover). */
export const Photo: React.FC<{ src: string; style?: React.CSSProperties; pos?: string; zoom?: number; tone?: number }> = ({ src, style, pos = "50% 50%", zoom = 1, tone = 1 }) => (
  <div style={{ position: "relative", overflow: "hidden", background: "#8d887f", ...style }}>
    <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `scale(${zoom})`, filter: `grayscale(1) sepia(.12) contrast(${1.25 * tone}) brightness(1.04)` }} />
    <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${staticFile(TEX.paper)})`, backgroundSize: "500px", mixBlendMode: "multiply", opacity: 0.55 }} />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(rgba(0,0,0,.18) 1px, transparent 1.4px)", backgroundSize: "4px 4px", mixBlendMode: "multiply", opacity: 0.5 }} />
  </div>
);

/** Photocopier finish over the whole frame: toner grain, streaks, paper texture, luminance flicker, vignette. */
export const CopyFx: React.FC<{ f: number; o?: number }> = ({ f, o = 1 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", opacity: o }}>
    <AbsoluteFill style={{ backgroundImage: `url(${staticFile(TEX.paper)})`, backgroundSize: "1300px 1300px", backgroundPosition: `${(f * 37) % 50}px ${(f * 23) % 40}px`, mixBlendMode: "multiply", opacity: 0.12 }} />
    <svg width="100%" height="100%" style={{ position: "absolute", mixBlendMode: "multiply", opacity: 0.16 }}>
      <filter id="toner"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed={f % 60} /><feColorMatrix type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 -2.2 1.5" /></filter>
      <rect width="100%" height="100%" filter="url(#toner)" />
    </svg>
    {[0.18, 0.43, 0.77].map((k, i) => <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: `${(k * 100 + Math.sin(f * 0.05 + i) * 1.5).toFixed(2)}%`, width: 2 + i, background: "rgba(40,35,30,.05)" }} />)}
    <AbsoluteFill style={{ background: `rgba(255,248,235,${0.02 + 0.02 * Math.sin(f * 1.7) * Math.sin(f * 0.31)})` }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.35) 100%)" }} />
  </AbsoluteFill>
);

/* ═════════ red marker ═════════ */
const wobble = (i: number, s: number) => Math.sin(i * 1.7 + s) * 0.5 + Math.sin(i * 0.6 + s * 2) * 0.5;
/** Hand-drawn marker ellipse around a box (draws on with p). */
export const MCircle: React.FC<{ x: number; y: number; w: number; h: number; p: number; seed?: number; sw?: number }> = ({ x, y, w, h, p, seed = 1, sw = 5 }) => {
  if (p <= 0) return null;
  const cx = x + w / 2, cy = y + h / 2, rx = w / 2 + 16, ry = h / 2 + 12;
  const pts = Array.from({ length: 49 }, (_, i) => {
    const a = -Math.PI * 0.8 + (i / 48) * Math.PI * 2.15;
    const k = 1 + wobble(i, seed) * 0.04 + (i / 48) * 0.05;
    return `${i ? "L" : "M"}${(cx + Math.cos(a) * rx * k).toFixed(1)} ${(cy + Math.sin(a) * ry * k).toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={V.W * 4} height={V.H * 4} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <path d={pts} fill="none" stroke={P.redInk} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - clamp(p)} style={{ mixBlendMode: "multiply" }} />
    </svg>
  );
};
/** Marker line/arrow from a to b (slight curve). */
export const MLine: React.FC<{ a: [number, number]; b: [number, number]; p: number; arrow?: boolean; bend?: number; sw?: number; o?: number }> = ({ a, b, p, arrow = true, bend = 60, sw = 4, o = 1 }) => {
  if (p <= 0) return null;
  const mx = (a[0] + b[0]) / 2 + bend * 0.6, my = (a[1] + b[1]) / 2 - bend;
  const e = clamp(p);
  const ang = Math.atan2(b[1] - my, b[0] - mx);
  return (
    <svg width={V.W * 4} height={V.H * 4} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none", opacity: o }}>
      <path d={`M${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`} fill="none" stroke={P.redInk} strokeWidth={sw} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - e} />
      <circle cx={a[0]} cy={a[1]} r={sw * 1.4} fill={P.redInk} />
      {arrow && e >= 1 && <path d={`M${b[0] - Math.cos(ang - 0.5) * 22} ${b[1] - Math.sin(ang - 0.5) * 22} L ${b[0]} ${b[1]} L ${b[0] - Math.cos(ang + 0.5) * 22} ${b[1] - Math.sin(ang + 0.5) * 22}`} fill="none" stroke={P.redInk} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
};
/** Marker cross (X) over a box. */
export const MCross: React.FC<{ x: number; y: number; w: number; h: number; p: number; sw?: number }> = ({ x, y, w, h, p, sw = 7 }) => (
  <svg width={V.W * 4} height={V.H * 4} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
    <path d={`M${x} ${y} L ${x + w} ${y + h}`} fill="none" stroke={P.redInk} strokeWidth={sw} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - clamp(p * 2)} />
    <path d={`M${x + w} ${y} L ${x} ${y + h}`} fill="none" stroke={P.redInk} strokeWidth={sw} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - clamp(p * 2 - 1)} />
  </svg>
);
/** Marker strike-through line. */
export const MStrike: React.FC<{ x: number; y: number; w: number; p: number; sw?: number }> = ({ x, y, w, p, sw = 5 }) => (
  <svg width={V.W * 4} height={V.H * 4} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
    <path d={`M${x + w} ${y + 3} C ${x + w * 0.6} ${y - 4}, ${x + w * 0.3} ${y + 5}, ${x} ${y}`} fill="none" stroke={P.redInk} strokeWidth={sw} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - clamp(p)} />
  </svg>
);
/** Marker check mark. */
export const MCheck: React.FC<{ x: number; y: number; s?: number; p: number }> = ({ x, y, s = 60, p }) => (
  <svg width={s * 1.4} height={s * 1.2} viewBox="0 0 70 60" style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
    <path d="M6 32 L 26 52 L 66 6" fill="none" stroke={P.redInk} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - clamp(p)} />
  </svg>
);

/**
 * Red marker that hugs its children (measured with offsetWidth/Height, so it sits exactly around the text/element
 * whatever the camera or sheet transform). kind: circle · under (wavy underline) · strike · box. p = 0..1 draw-on.
 */
export const Mark: React.FC<{ p: number; kind?: "circle" | "under" | "strike" | "box"; pad?: number; seed?: number; sw?: number; block?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({ p, kind = "circle", pad = 16, seed = 1, sw = 5, block, children, style }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [sz, setSz] = useState<[number, number] | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth, h = el.offsetHeight;
    if (!sz || sz[0] !== w || sz[1] !== h) setSz([w, h]);
  });
  let d = "";
  if (sz) {
    const [w, h] = sz;
    if (kind === "circle") {
      const cx = w / 2, cy = h / 2, rx = w * 0.56 + pad, ry = h * 0.6 + pad * 0.75;
      d = Array.from({ length: 57 }, (_, i) => {
        const a = -Math.PI * 0.62 + (i / 56) * Math.PI * 2.12;
        const k = 1 + wobble(i, seed) * 0.035 + (i / 56) * 0.045;
        return `${i ? "L" : "M"}${(cx + Math.cos(a) * rx * k).toFixed(1)} ${(cy + Math.sin(a) * ry * k).toFixed(1)}`;
      }).join(" ");
    } else if (kind === "under") {
      const y = h + pad * 0.35;
      d = Array.from({ length: 25 }, (_, i) => `${i ? "L" : "M"}${(w + 6 - (i / 24) * (w + 12)).toFixed(1)} ${(y + Math.sin(i * 1.3 + seed) * 3).toFixed(1)}`).join(" ");
    } else if (kind === "strike") {
      d = `M${w + 8} ${h * 0.55} C ${w * 0.6} ${h * 0.45}, ${w * 0.3} ${h * 0.62}, -8 ${h * 0.5}`;
    } else {
      const x0 = -pad, y0 = -pad * 0.6, x1 = w + pad, y1 = h + pad * 0.6;
      d = `M${x1 - 10} ${y0 + 2} L ${x0 + 3} ${y0 - 2} L ${x0 - 2} ${y1 + 3} L ${x1 + 3} ${y1 - 1} L ${x1 - 2} ${y0 - 6}`;
    }
  }
  return (
    <span ref={ref} style={{ position: "relative", display: block ? "block" : "inline-block", ...style }}>
      {children}
      {sz && p > 0 && (
        <svg width={sz[0]} height={sz[1]} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
          <path d={d} fill="none" stroke={P.redInk} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - clamp(p)} style={{ mixBlendMode: "multiply" }} />
        </svg>
      )}
    </span>
  );
};

/** Rubber stamp (red ink with worn texture) slamming in. */
export const Stamp: React.FC<{ x: number; y: number; text: string; a: number; size?: number; rot?: number; sub?: string; color?: string }> = ({ x, y, text, a, size = 90, rot = -10, sub, color = P.red }) => {
  if (a <= 0) return null;
  const e = easeOut(clamp(a));
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${2.2 - 1.2 * e})`, opacity: clamp(a * 3) * 0.9, mixBlendMode: "multiply" }}>
      <div style={{ padding: `${size * 0.08}px ${size * 0.35}px`, border: `${size * 0.07}px solid ${color}`, borderRadius: size * 0.12, color, fontFamily: PF.ui, fontWeight: 900, fontSize: size, lineHeight: 1.15, textAlign: "center", whiteSpace: "nowrap", maskImage: `url(${staticFile(TEX.paper)})`, WebkitMaskImage: `url(${staticFile(TEX.paper)})`, maskSize: "300px", WebkitMaskSize: "300px" }}>
        {text}
        {sub && <div style={{ fontSize: size * 0.3, fontWeight: 700, letterSpacing: 2 }}>{sub}</div>}
      </div>
    </div>
  );
};

/* ═════════ typewriter subtitles ═════════ */
export type Word = { si: number; wi: number; w: string; s: number; e: number };
/** Break sentences into subtitle chunks (≤ maxW words, cut after punctuation). */
export const chunkWords = (words: Word[], maxW = 7) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const end = !next || next.si !== w.si || /[،؛…:]$/.test(w.w) || cur.length >= maxW;
    if (end) { out.push(cur); cur = []; }
  });
  return out;
};
/**
 * Subtitle strip (light printed box, like the ref). Words land one by one on their spoken time with a short blur-up —
 * never half-typed letters (Persian letters must stay joined). y = top of the strip.
 */
export const Subs: React.FC<{ chunks: Word[][]; t: number; y?: number; size?: number }> = ({ chunks, t, y = V.H - 240, size = 36 }) => {
  const i = chunks.findIndex((c, k) => t >= c[0].s - 0.05 && (k === chunks.length - 1 || t < chunks[k + 1][0].s - 0.05));
  if (i < 0) return null;
  const c = chunks[i];
  const end = c[c.length - 1].e;
  if (t > end + 1.0) return null;
  const boxA = clamp((t - c[0].s + 0.05) / 0.12) * (1 - clamp((t - end - 0.8) / 0.2));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", pointerEvents: "none", opacity: boxA }}>
      <div style={{ padding: "10px 30px 14px", background: P.box, boxShadow: "0 6px 18px rgba(0,0,0,.28)", direction: "rtl", fontFamily: PF.ui, fontWeight: 600, fontSize: size, lineHeight: 1.5, color: "#161412", whiteSpace: "nowrap", display: "flex", gap: size * 0.28 }}>
        {c.map((w, k) => {
          const a = clamp((t - w.s + 0.04) / 0.16);
          return <span key={k} style={{ display: "inline-block", opacity: a, filter: a < 1 ? `blur(${((1 - a) * 5).toFixed(2)}px)` : undefined, transform: `translateY(${(1 - easeOut(a)) * 10}px)` }}>{w.w}</span>;
        })}
      </div>
    </div>
  );
};

/* ═════════ giant serif number with italic caption (ref «148 tickets») ═════════ */
export const Giant: React.FC<{ text: string; cap?: string; a: number; x?: number; y?: number; size?: number; capA?: number }> = ({ text, cap, a, x = V.W / 2, y = V.H / 2 - 40, size = 380, capA = 1 }) => {
  if (a <= 0) return null;
  const e = easeBack(clamp(a));
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * e})`, textAlign: "center", direction: "rtl", opacity: clamp(a * 3) }}>
      <div style={{ fontFamily: PF.naskh, fontWeight: 700, fontSize: size, lineHeight: 0.95, color: "#111", textShadow: "0 0 30px rgba(233,229,221,.9), 0 0 60px rgba(233,229,221,.8)" }}>{text}</div>
      {cap && <div style={{ fontFamily: PF.naskh, fontWeight: 400, fontStyle: "italic", fontSize: size * 0.22, color: "#111", marginTop: -size * 0.04, opacity: clamp(capA), textShadow: "0 0 18px rgba(233,229,221,.95)" }}>{cap}</div>}
    </div>
  );
};

/**
 * Big stat set with real typographic hierarchy: kicker ─ giant Naskh number + stacked unit ─ ruled one-line caption.
 * count = roll the number up from 0 (CountUp idea from react-bits, frame-based).
 */
export const BigStat: React.FC<{ value: string; count?: number; unit?: string; unit2?: string; kicker?: string; cap?: string; a: number; capA?: number; x?: number; y?: number; size?: number; mark?: number }> = ({ value, count, unit, unit2, kicker, cap, a, capA = 1, x = V.W / 2, y = V.H / 2 - 40, size = 360, mark = 0 }) => {
  if (a <= 0) return null;
  const e = easeBack(clamp(a));
  const shown = count !== undefined ? fa(Math.round(count * easeOut(clamp(a * 1.3)))) : value;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${0.8 + 0.2 * e})`, opacity: clamp(a * 3), direction: "rtl", color: "#141210", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {kicker && <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: PF.ui, fontWeight: 700, fontSize: size * 0.1, color: P.ink2 }}><span style={{ width: 60, height: 3, background: P.ink2 }} />{kicker}<span style={{ width: 60, height: 3, background: P.ink2 }} /></div>}
      <div style={{ display: "flex", alignItems: "center", gap: size * 0.08 }}>
        <Mark p={mark} pad={size * 0.06} sw={size * 0.025} seed={3}>
          <div style={{ fontFamily: PF.naskh, fontWeight: 700, fontSize: size, lineHeight: 1.05, minWidth: count !== undefined ? size * 0.5 * value.length : undefined, textAlign: "center" }}>{shown}</div>
        </Mark>
        {unit && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", fontFamily: PF.ui }}>
            <div style={{ fontWeight: 900, fontSize: size * 0.3, lineHeight: 1.1 }}>{unit}</div>
            {unit2 && <div style={{ fontWeight: 600, fontSize: size * 0.12, color: P.ink2, marginTop: 6, whiteSpace: "nowrap" }}>{unit2}</div>}
          </div>
        )}
      </div>
      {cap && <div style={{ marginTop: size * 0.04, padding: `${size * 0.03}px ${size * 0.08}px 0`, borderTop: `3px solid ${P.ink}`, fontFamily: PF.ui, fontWeight: 600, fontSize: size * 0.1, whiteSpace: "nowrap", opacity: clamp(capA), transform: `translateY(${(1 - clamp(capA)) * 14}px)` }}>{cap}</div>}
    </div>
  );
};

/* ═════════ VHS rewind overlay ═════════ */
export const Rewind: React.FC<{ t: number; k: number; label?: string }> = ({ t, k, label = "◀◀" }) => {
  if (k <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: clamp(k) }}>
      {Array.from({ length: 6 }, (_, i) => {
        const y = ((rnd(i + Math.floor(t * 14)) * 1.2 - 0.1) * V.H);
        return <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y, height: 8 + rnd(i + 3) * 30, background: "rgba(255,255,255,.18)", backdropFilter: "blur(2px)", transform: `translateX(${(rnd(i + 9) - 0.5) * 60}px)` }} />;
      })}
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.12) 0 2px, transparent 2px 5px)" }} />
      <div style={{ position: "absolute", left: 90, top: 70, fontFamily: PF.mono, fontWeight: 700, fontSize: 64, color: "#fff", textShadow: "3px 0 rgba(255,0,60,.6), -3px 0 rgba(0,200,255,.6)", direction: "ltr" }}>{label}</div>
      <div style={{ position: "absolute", right: 90, top: 80, fontFamily: PF.mono, fontWeight: 700, fontSize: 44, color: "#fff", direction: "ltr", textShadow: "2px 0 rgba(255,0,60,.6)" }}>{`00:${String(Math.max(0, 59 - Math.floor(t * 23) % 60)).padStart(2, "0")}:${String(Math.floor(t * 97) % 60).padStart(2, "0")}`}</div>
    </AbsoluteFill>
  );
};

/* ═════════ print UI atoms (Persian, generic — no brands) ═════════ */
export const Icon: React.FC<{ g: string; s?: number; bg?: string; badge?: number }> = ({ g, s = 58, bg = "#3a3733", badge }) => (
  <div style={{ position: "relative", width: s, height: s, borderRadius: s * 0.24, background: bg, color: "#f3efe8", display: "grid", placeItems: "center", fontFamily: PF.ui, fontWeight: 900, fontSize: s * 0.46, flexShrink: 0 }}>
    {g}
    {badge !== undefined && badge > 0 && <div style={{ position: "absolute", right: -s * 0.2, top: -s * 0.2, minWidth: s * 0.42, height: s * 0.42, padding: "0 6px", borderRadius: s * 0.21, background: "#b3261e", color: "#fff", fontSize: s * 0.26, display: "grid", placeItems: "center" }}>{fa(badge)}</div>}
  </div>
);
/** macOS-like notification card (printed). */
export const Notif: React.FC<{ g: string; title: string; body: string; time?: string; w?: number; bg?: string; tag?: string }> = ({ g, title, body, time = "الان", w = 560, bg, tag }) => (
  <div style={{ width: w, padding: "14px 18px", borderRadius: 18, background: "rgba(250,248,244,.9)", border: `1px solid ${P.line}`, boxShadow: "0 3px 8px rgba(0,0,0,.08)", display: "flex", gap: 16, direction: "rtl", fontFamily: PF.ui, color: P.ink }}>
    <Icon g={g} s={52} bg={bg} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 700, fontSize: 24 }}>{title}{tag && <span style={{ marginRight: 10, padding: "1px 8px", borderRadius: 5, background: "#b3261e", color: "#fff", fontSize: 15, verticalAlign: "middle" }}>{tag}</span>}</div>
        <div style={{ fontSize: 17, color: P.faint }}>{time}</div>
      </div>
      <div style={{ fontSize: 21, color: P.ink2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{body}</div>
    </div>
  </div>
);
/** Grey placeholder text lines (like printed body copy). */
export const Lines: React.FC<{ n: number; w?: number; gap?: number; h?: number; seed?: number; o?: number }> = ({ n, w = 400, gap = 18, h = 9, seed = 0, o = 0.35 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap, alignItems: "flex-end" }}>
    {Array.from({ length: n }, (_, i) => <div key={i} style={{ width: w * (0.55 + rnd(i + seed) * 0.45), height: h, borderRadius: h / 2, background: `rgba(42,39,36,${o})` }} />)}
  </div>
);
