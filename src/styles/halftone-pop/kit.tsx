import React from "react";
import { AbsoluteFill } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../../fonts";
import type { Word } from "./character";
import { BG, BgName, clamp, easeBack, easeOut, fa, FONT_LATIN_MONO, HARD, K, ramp, rnd, SOFT, V } from "./theme";

/* ═════════ backgrounds + texture ═════════ */
export const Bg: React.FC<{ c: BgName | string }> = ({ c }) => <AbsoluteFill style={{ background: (BG as Record<string, string>)[c] ?? c }} />;

/** Slowly drifting dot grid — keeps flat scenes alive. */
export const DotGrid: React.FC<{ t: number; color?: string; gap?: number; o?: number }> = ({ t, color = "rgba(17,17,20,.09)", gap = 34, o = 1 }) => (
  <AbsoluteFill style={{ opacity: o, backgroundImage: `radial-gradient(${color} 2px, transparent 2.4px)`, backgroundSize: `${gap}px ${gap}px`, backgroundPosition: `${(t * 6) % gap}px ${(-t * 10) % gap}px` }} />
);

/** Animated film grain (pdoom). */
export const Grain: React.FC<{ f: number; o?: number }> = ({ f, o = 0.06 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "multiply", opacity: o }}>
    <svg width="100%" height="100%">
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 97} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);

/** Directional motion-blur filters. Use `mblur(px, "x"|"y")` as a CSS filter. */
export const BlurDefs: React.FC = () => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
    {[4, 10, 20, 36, 60].map((n) => (
      <React.Fragment key={n}>
        <filter id={`mbx-${n}`} x="-20%" y="-5%" width="140%" height="110%"><feGaussianBlur stdDeviation={`${n} 0`} /></filter>
        <filter id={`mby-${n}`} x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation={`0 ${n}`} /></filter>
      </React.Fragment>
    ))}
  </svg>
);
export const mblur = (px: number, axis: "x" | "y" = "x") => {
  const n = [4, 10, 20, 36, 60].reduce((b, v) => (Math.abs(v - px) < Math.abs(b - px) ? v : b), 4);
  return px < 2 ? "none" : `url(#mb${axis}-${n})`;
};

/* ═════════ transitions (p = 0..1) ═════════ */
/** Incoming scene revealed by a circle growing from (x, y). */
export const circleIn = (p: number, x: number, y: number): React.CSSProperties =>
  p >= 1 ? {} : { clipPath: `circle(${easeOut(clamp(p)) * 2300}px at ${x}px ${y}px)` };
/** Whip pan: incoming slides in from the left with motion blur. */
export const whipIn = (p: number): React.CSSProperties => {
  const e = easeOut(clamp(p));
  return p >= 1 ? {} : { transform: `translateX(${-(1 - e) * V.W}px)`, filter: mblur((1 - e) * 60) };
};
export const whipOut = (p: number): React.CSSProperties => {
  const e = easeOut(clamp(p));
  return p <= 0 ? {} : { transform: `translateX(${e * V.W * 0.45}px) scale(${1 - 0.08 * e})`, filter: `${mblur(e * 50)} brightness(${1 - 0.25 * e})` };
};
/** Zoom-through: outgoing scene rushes toward camera (focus x,y). */
export const zoomOut = (p: number, x = V.W / 2, y = V.H / 2): React.CSSProperties => {
  const e = clamp(p) ** 2;
  return p <= 0 ? {} : { transform: `scale(${1 + e * 3.2})`, transformOrigin: `${x}px ${y}px`, filter: `blur(${e * 14}px)`, opacity: 1 - clamp((p - 0.6) / 0.4) };
};
export const zoomIn = (p: number): React.CSSProperties => {
  const e = easeOut(clamp(p));
  return p >= 1 ? {} : { transform: `scale(${0.72 + 0.28 * e})`, filter: `blur(${(1 - e) * 10}px)`, opacity: clamp(p * 3) };
};
/** Incoming slides up from below over the old one (cover). */
export const coverUp = (p: number): React.CSSProperties => {
  const e = easeOut(clamp(p));
  return p >= 1 ? {} : { transform: `translateY(${(1 - e) * V.H}px)`, filter: mblur((1 - e) * 50, "y") };
};

/** Hit helpers (pdoom): punch-zoom, chromatic fringe, shake. hits = local frames. */
export const punch = (f: number, hits: number[], amt = 0.05) =>
  1 + hits.reduce((m, h) => (f >= h && f < h + 10 ? Math.max(m, amt * (1 - easeOut((f - h) / 10))) : m), 0);
export const ca = (f: number, hits: number[]): React.CSSProperties => {
  const k = hits.reduce((m, h) => (f >= h && f < h + 7 ? Math.max(m, 1 - (f - h) / 7) : m), 0);
  return k > 0 ? { filter: `drop-shadow(${6 * k}px 0 0 rgba(255,60,90,.5)) drop-shadow(${-6 * k}px 0 0 rgba(0,160,255,.5))` } : {};
};
export const shake = (f: number, hits: number[], amp = 10) => {
  const k = hits.reduce((m, h) => (f >= h && f < h + 9 ? Math.max(m, 1 - (f - h) / 9) : m), 0);
  return { x: Math.sin(f * 2.7) * amp * k, y: Math.cos(f * 3.1) * amp * k };
};

/* ═════════ panels ═════════ */
/** Scene framed as a rounded white panel on a soft tint (reference look). a = 0..1 rise. */
export const Panel: React.FC<{ tint: BgName | string; children: React.ReactNode; top?: number; a?: number; inner?: string }> = ({ tint, children, top = 36, a = 1, inner = "#fff" }) => (
  <AbsoluteFill style={{ background: (BG as Record<string, string>)[tint] ?? tint }}>
    <div style={{ position: "absolute", left: 30, right: 30, top, bottom: 30, borderRadius: 48, background: inner, boxShadow: SOFT, overflow: "hidden", transform: `translateY(${(1 - easeOut(a)) * 120}px)` }}>
      {children}
    </div>
  </AbsoluteFill>
);

/* ═════════ typography ═════════ */
/** Tiny descriptor line above the headline (e.g. «// برای سازنده‌ها»). */
export const Tiny: React.FC<{ text: string; x?: number; y: number; w?: number; a?: number; color?: string; mono?: boolean; size?: number }> = ({ text, x = 70, y, w = 940, a = 1, color = "rgba(17,17,20,.55)", mono = true, size = 30 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, display: "flex", flexDirection: "row-reverse", gap: 12, alignItems: "baseline", fontFamily: FONT_TEXT, fontSize: size, color, opacity: a, transform: `translateY(${(1 - a) * 12}px)` }}>
    {mono && <span style={{ fontFamily: FONT_LATIN_MONO, fontSize: size * 0.9 }}>//</span>}
    <span>{text}</span>
  </div>
);

/** Hand-drawn swash under an accent word (draws on). */
const Swash: React.FC<{ p: number; color: string }> = ({ p, color }) => (
  <svg viewBox="0 0 200 30" preserveAspectRatio="none" style={{ position: "absolute", left: "-4%", width: "108%", bottom: "-0.1em", height: "0.3em", overflow: "visible" }}>
    <path d="M196 18 C 150 8, 90 6, 40 14 S 8 22, 4 16" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} />
  </svg>
);

export type Accent = { color?: string; swash?: boolean; font?: string; scale?: number };
/**
 * Word-synced headline with a mask-wipe reveal: each word rises out of its own line box exactly when spoken.
 * accents[i] → display font, colour, optional hand-drawn swash under it.
 */
export const Say: React.FC<{
  words: Word[]; t: number; x?: number; y: number; w?: number; size?: number; accents?: Record<number, Accent>; br?: number[]; align?: "right" | "center";
  color?: string; lead?: number; line?: number; out?: number;
}> = ({ words, t, x = 70, y, w = 940, size = 96, accents = {}, br = [], align = "right", color = K.ink, lead = 0.05, line = 1.3, out }) => {
  const gone = out === undefined ? 0 : ramp(t, out, out + 0.3);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, direction: "rtl", textAlign: align, fontFamily: FONT_TEXT, fontSize: size, lineHeight: line, color, opacity: 1 - gone, transform: `translateY(${-gone * 40}px)` }}>
      {words.map((wd, i) => {
        const p = clamp((t - (wd.s - lead)) / 0.22);
        const ac = accents[i];
        const txt = wd.w.replace(/\.\.\.$/, "…");
        const fs = ac ? size * (ac.scale ?? 1) : size;
        return (
          <React.Fragment key={i}>
            {br.includes(i) && <br />}
            <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", padding: `0 ${size * 0.1}px ${size * 0.14}px` }}>
              <span style={{ display: "inline-block", position: "relative", transform: `translateY(${(1 - easeOut(p)) * 110}%) rotate(${(1 - easeOut(p)) * 6}deg)`, fontFamily: ac?.font, fontSize: fs, color: ac ? ac.color ?? K.blue : undefined }}>
                {txt}
                {ac?.swash && <Swash p={ramp(t, wd.s + 0.12, wd.s + 0.5, easeOut)} color={ac.color ?? K.blue} />}
              </span>
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/** Giant word/number (goes BEHIND the character). */
export const Giant: React.FC<{ text: string; size: number; a: number; color?: string; font?: string; rot?: number; shadow?: string }> = ({ text, size, a, color = K.ink, font = FONT_NUM, rot = 0, shadow }) => (
  <div style={{ fontFamily: font, fontSize: size, lineHeight: 1, color, opacity: clamp(a * 2), transform: `scale(${0.6 + 0.4 * easeBack(a)}) rotate(${rot}deg)`, transformOrigin: "50% 60%", whiteSpace: "nowrap", direction: "rtl", textShadow: shadow }}>
    {text}
  </div>
);

/* ═════════ UI atoms ═════════ */
export const PHONE = { W: 540, H: 1100 };
/** Clean phone mockup (black rim, white screen). Children render in the 510×1070 screen. */
export const Phone: React.FC<{ x: number; y: number; s?: number; rot?: number; children?: React.ReactNode; screen?: string; style?: React.CSSProperties }> = ({ x, y, s = 1, rot = 0, children, screen = "#fff", style }) => (
  <div style={{ position: "absolute", left: x, top: y, width: PHONE.W, height: PHONE.H, transform: `scale(${s}) rotate(${rot}deg)`, transformOrigin: "50% 0", borderRadius: 84, background: K.ink, padding: 15, boxShadow: SOFT, ...style }}>
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 70, overflow: "hidden", background: screen }}>
      {children}
      <div style={{ position: "absolute", left: "50%", top: 18, width: 130, height: 38, marginLeft: -65, borderRadius: 20, background: K.ink }} />
      <div style={{ position: "absolute", left: 44, top: 22, fontFamily: "Segoe UI, Arial", fontWeight: 700, fontSize: 24, color: K.ink, direction: "ltr" }}>9:41</div>
    </div>
  </div>
);

/** White card (UI inside phones/panels). hard = thick ink border + hard shadow. */
export const Card: React.FC<{ x: number; y: number; w: number; h?: number; a?: number; tilt?: number; bg?: string; children?: React.ReactNode; style?: React.CSSProperties; hard?: boolean }> = ({ x, y, w, h, a = 1, tilt = 0, bg = K.paper, children, style, hard }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: bg, border: hard ? `4px solid ${K.ink}` : `2px solid ${K.line}`, borderRadius: 26, boxShadow: hard ? HARD(8) : SOFT, opacity: clamp(a * 3), transform: `translateY(${(1 - easeBack(clamp(a))) * 70}px) scale(${0.86 + 0.14 * easeBack(clamp(a))}) rotate(${tilt}deg)`, direction: "rtl", fontFamily: FONT_TEXT, overflow: "hidden", ...style }}>
    {children}
  </div>
);

export const Btn: React.FC<{ text: string; bg?: string; color?: string; pressed?: number; style?: React.CSSProperties; size?: number }> = ({ text, bg = K.ink, color = "#fff", pressed = 0, style, size = 34 }) => (
  <div style={{ display: "inline-block", padding: `${size * 0.45}px ${size * 1.1}px`, background: bg, color, borderRadius: 999, fontFamily: FONT_TEXT, fontSize: size, transform: `scale(${1 - pressed * 0.07})`, boxShadow: `0 ${12 - 8 * pressed}px 26px rgba(20,24,60,.25)`, direction: "rtl", ...style }}>{text}</div>
);

export const Pointer: React.FC<{ x: number; y: number; press?: number; a?: number; s?: number }> = ({ x, y, press = 0, a = 1, s = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: a, transform: `scale(${s * (1 - press * 0.15)})`, transformOrigin: "0 0" }}>
    {press > 0.05 && <div style={{ position: "absolute", left: -40, top: -40, width: 80, height: 80, borderRadius: 40, border: `5px solid ${K.blue}`, transform: `scale(${0.5 + press})`, opacity: 1 - press * 0.6 }} />}
    <svg width="66" height="78" viewBox="0 0 28 32" style={{ filter: "drop-shadow(0 6px 8px rgba(0,0,0,.25))" }}>
      <path d="M2 2 L2 25 L8 19.5 L12.5 29 L16.5 27.2 L12 18 L20 18 Z" fill={K.ink} stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  </div>
);

/** Round rubber stamp with a label (the reference's «Handled.» circle). */
export const RingStamp: React.FC<{ x: number; y: number; r?: number; a: number; text: string; color?: string; rot?: number }> = ({ x, y, r = 220, a, text, color = K.blue, rot = -10 }) => (
  <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, opacity: clamp(a * 2), transform: `rotate(${rot}deg) scale(${1.8 - 0.8 * easeOut(clamp(a))})` }}>
    <svg width={r * 2} height={r * 2} viewBox="-110 -110 220 220" style={{ position: "absolute" }}>
      <circle r="104" fill="rgba(255,255,255,.55)" stroke={color} strokeWidth="5" />
      <circle r="92" fill="none" stroke={color} strokeWidth="2" strokeDasharray="4 6" />
    </svg>
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      <div style={{ padding: "4px 26px 10px", background: "#fff", border: `4px solid ${color}`, borderRadius: 16, color, fontFamily: FONT_NUM, fontSize: r * 0.3, transform: "rotate(-4deg)", boxShadow: HARD(6, color), whiteSpace: "nowrap" }}>{text}</div>
    </div>
  </div>
);

/** Production timer badge (mm:ss in Persian), top-right like the reference. */
export const Timer: React.FC<{ sec: number; x?: number; y?: number; a?: number; done?: boolean }> = ({ sec, x = 760, y = 70, a = 1, done = false }) => {
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: 12, padding: "10px 22px", borderRadius: 999, background: done ? K.green : "#fff", color: done ? "#fff" : K.ink, border: `2px solid ${K.line}`, boxShadow: SOFT, fontFamily: FONT_NUM, fontSize: 36, opacity: a, transform: `scale(${0.8 + 0.2 * a})`, direction: "ltr" }}>
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="13" r="8" /><path d="M12 13 V9 M9 2 H15" strokeLinecap="round" /></svg>
      <span>{fa(String(m).padStart(2, "0"))}:{fa(String(s).padStart(2, "0"))}</span>
      {done && <span>✓</span>}
    </div>
  );
};

/** Live waveform bars from an envelope around `frame`. */
export const Wave: React.FC<{ env: number[]; frame: number; n?: number; w: number; h: number; color?: string; active?: boolean }> = ({ env, frame, n = 22, w, h, color = K.ink, active = true }) => (
  <div style={{ display: "flex", alignItems: "center", gap: w / n / 3, width: w, height: h, direction: "ltr" }}>
    {Array.from({ length: n }, (_, i) => {
      const v = active ? env[Math.max(0, frame - (n - i) * 2)] ?? 0 : 0.18 + 0.12 * rnd(i);
      const hh = Math.max(0.12, Math.min(1, v * 1.3 + 0.1 * Math.sin(i * 1.7 + frame / 4)));
      return <div key={i} style={{ flex: 1, height: `${hh * 100}%`, background: color, borderRadius: 4 }} />;
    })}
  </div>
);

/* ═════════ halftone tool tiles (coloured product cards like the reference) ═════════ */
export type ToolKind = "film" | "mic" | "wand" | "cc" | "music" | "render" | "idea" | "play";
const DOTS = (id: string) => (
  <pattern id={id} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="3.5" cy="3.5" r="1.9" fill={K.ink} /></pattern>
);
/** 3D-ish halftone object drawn in ink on a coloured tile. */
export const ToolIcon: React.FC<{ kind: ToolKind; s?: number; id: string }> = ({ kind, s = 150, id }) => {
  const P = `url(#${id})`;
  const common = { stroke: K.ink, strokeWidth: 5, strokeLinejoin: "round" as const };
  return (
    <svg width={s} height={s} viewBox="-60 -60 120 120">
      <defs>{DOTS(id)}</defs>
      {kind === "film" && (<g><path d="M-44 -26 L 30 -38 L 38 22 L -36 34 Z" fill="#fff" {...common} /><path d="M-36 34 L 38 22 L 40 30 L -34 42 Z" fill={P} {...common} />{[-30, -14, 2, 18].map((x) => <rect key={x} x={x} y="-30" width="9" height="8" fill={K.ink} transform="rotate(-9)" />)}<path d="M-8 -6 L 12 4 L -6 16 Z" fill={K.ink} /></g>)}
      {kind === "mic" && (<g><rect x="-18" y="-50" width="36" height="62" rx="18" fill="#fff" {...common} /><rect x="-18" y="-20" width="36" height="32" rx="4" fill={P} /><path d="M-32 -4 C -32 30, 32 30, 32 -4" fill="none" {...common} /><path d="M0 26 V 46 M-20 48 H 20" fill="none" {...common} strokeLinecap="round" /></g>)}
      {kind === "wand" && (<g><path d="M-40 40 L 20 -20 L 30 -10 L -30 50 Z" fill={P} {...common} /><path d="M20 -20 L 30 -10 L 38 -18 L 28 -28 Z" fill="#fff" {...common} />{[[30, -44], [46, -30], [8, -40]].map(([x, y], i) => <path key={i} d={`M${x} ${y - 9} L ${x + 3} ${y - 3} L ${x + 9} ${y} L ${x + 3} ${y + 3} L ${x} ${y + 9} L ${x - 3} ${y + 3} L ${x - 9} ${y} L ${x - 3} ${y - 3} Z`} fill={K.ink} />)}</g>)}
      {kind === "cc" && (<g><rect x="-46" y="-32" width="92" height="64" rx="12" fill="#fff" {...common} /><rect x="-46" y="10" width="92" height="22" fill={P} /><text x="0" y="8" textAnchor="middle" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="30" fill={K.ink}>CC</text></g>)}
      {kind === "music" && (<g><path d="M-16 28 V -36 L 34 -46 V 18" fill="none" {...common} /><ellipse cx="-28" cy="30" rx="16" ry="12" fill={P} {...common} /><ellipse cx="22" cy="20" rx="16" ry="12" fill="#fff" {...common} /><path d="M-16 -22 L 34 -32" {...common} /></g>)}
      {kind === "render" && (<g><circle r="34" fill="#fff" {...common} /><path d="M0 0 L 0 -34 A 34 34 0 0 1 29 17 Z" fill={P} />{Array.from({ length: 8 }, (_, i) => <rect key={i} x="-6" y="-48" width="12" height="16" rx="3" fill={K.ink} transform={`rotate(${i * 45})`} />)}<circle r="10" fill={K.ink} /></g>)}
      {kind === "idea" && (<g><path d="M-26 -8 A 30 30 0 1 1 26 -8 C 26 10 14 16 13 28 L -13 28 C -14 16 -26 10 -26 -8 Z" fill={K.yellow} {...common} /><path d="M-26 -8 A 30 30 0 0 1 0 -38 L 0 28 L -13 28 C -14 16 -26 10 -26 -8 Z" fill={P} opacity=".5" /><rect x="-15" y="28" width="30" height="16" rx="4" fill="#fff" {...common} /></g>)}
      {kind === "play" && (<g><rect x="-48" y="-34" width="96" height="68" rx="14" fill="#fff" {...common} /><rect x="-48" y="14" width="96" height="20" fill={P} /><path d="M-12 -18 L 18 0 L -12 18 Z" fill={K.ink} /></g>)}
    </svg>
  );
};

/** Coloured product-style tile (reference «Courses / Ebooks» cards): halftone icon + label + sub. */
export const Tile: React.FC<{ x: number; y: number; w?: number; h?: number; color: string; kind: ToolKind; label: string; sub?: string; a: number; rot?: number; id: string; shake?: number }> = ({ x, y, w = 280, h = 250, color, kind, label, sub, a, rot = 0, id, shake: sh = 0 }) => {
  const e = easeBack(clamp(a));
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 14, background: color, border: `3px solid ${K.ink}`, boxShadow: HARD(6), opacity: clamp(a * 3), transform: `translate(${Math.sin(sh * 40) * 6 * sh}px, ${(1 - e) * 120}px) rotate(${rot * (2 - e) + Math.sin(sh * 33) * 3 * sh}deg) scale(${0.6 + 0.4 * e})`, direction: "rtl", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 6, display: "flex", justifyContent: "center" }}><ToolIcon kind={kind} s={h * 0.62} id={id} /></div>
      <div style={{ position: "absolute", right: 16, bottom: 36, fontFamily: FONT_TEXT, fontSize: 30, color: K.ink }}>{label}</div>
      {sub && <div style={{ position: "absolute", right: 16, bottom: 10, fontFamily: FONT_TEXT, fontSize: 20, color: "rgba(17,17,20,.6)" }}>{sub}</div>}
    </div>
  );
};

/* ═════════ small illustrations ═════════ */
export const Sparkle: React.FC<{ x: number; y: number; s?: number; a: number; t: number; color?: string }> = ({ x, y, s = 60, a, t, color = K.ink }) => (
  <svg width={s} height={s} viewBox="-50 -50 100 100" style={{ position: "absolute", left: x - s / 2, top: y - s / 2, transform: `scale(${a * (0.8 + 0.2 * Math.sin(t * 8))}) rotate(${t * 60}deg)` }}>
    <path d="M0 -48 C 6 -10 10 -6 48 0 C 10 6 6 10 0 48 C -6 10 -10 6 -48 0 C -10 -6 -6 -10 0 -48 Z" fill={color} />
  </svg>
);

export const Plane: React.FC<{ x: number; y: number; s?: number; a: number; rot?: number }> = ({ x, y, s = 220, a, rot = -18 }) => (
  <svg width={s} height={s} viewBox="-100 -100 200 200" style={{ position: "absolute", left: x - s / 2, top: y - s / 2, opacity: clamp(a * 2), transform: `rotate(${rot}deg) scale(${easeBack(clamp(a))})`, filter: "drop-shadow(0 16px 18px rgba(20,24,60,.25))" }}>
    <defs>{DOTS("plane-d")}</defs>
    <path d="M-90 10 L 90 -60 L 20 70 L 0 22 Z" fill="#fff" stroke={K.ink} strokeWidth="6" strokeLinejoin="round" />
    <path d="M0 22 L 90 -60 L -20 40 Z" fill="url(#plane-d)" stroke={K.ink} strokeWidth="5" strokeLinejoin="round" />
  </svg>
);

/** Paper-strip confetti burst (blue/orange/teal/yellow/purple). */
export const Confetti: React.FC<{ x: number; y: number; t: number; at: number; n?: number; power?: number }> = ({ x, y, t, at, n = 40, power = 26 }) => {
  const k = (t - at) * 30;
  if (k < 0 || k > 80) return null;
  const cols = [K.blue, K.orange, K.teal, K.yellow, K.purple];
  return (
    <svg width={V.W} height={V.H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {Array.from({ length: n }, (_, i) => {
        const ang = -Math.PI / 2 + (rnd(i * 3) - 0.5) * 2.6;
        const v = power * (0.5 + rnd(i * 7) * 0.8);
        const drag = (1 - Math.pow(0.94, k)) / 0.06;
        const px = x + Math.cos(ang) * v * drag, py = y + Math.sin(ang) * v * drag + 0.22 * k * k;
        const o = k < 60 ? 1 : 1 - (k - 60) / 20;
        return <rect key={i} x={px - 8} y={py - 4} width={16} height={9} rx={2} fill={cols[i % 5]} opacity={o} transform={`rotate(${k * (6 + rnd(i) * 10) * (i % 2 ? 1 : -1)} ${px} ${py})`} />;
      })}
    </svg>
  );
};

/** «NFP» wordmark whose letters drop in one by one with bounce (reference end card). */
export const LogoDrop: React.FC<{ t: number; at: number; x: number; y: number; size?: number; text?: string }> = ({ t, at, x, y, size = 230, text = "NFP" }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", display: "flex", direction: "ltr", fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: size, letterSpacing: -size * 0.03, color: K.ink, lineHeight: 1 }}>
    {Array.from(text).map((c, i) => {
      const p = ramp(t, at + i * 0.09, at + i * 0.09 + 0.45, easeBack);
      return <span key={i} style={{ display: "inline-block", transform: `translateY(${(1 - p) * -520}px) rotate(${(1 - p) * (i % 2 ? 25 : -25)}deg)`, opacity: clamp(p * 4), color: i === 1 ? K.blue : K.ink }}>{c}</span>;
    })}
  </div>
);

export const pop = (t: number, at: number, len = 0.4) => ramp(t, at, at + len, easeBack);
export { V };
