// Video 23 · UI kit: icons, cards, phone, video clips, big numbers, Persian text. All sizes in px on the 1920×1080 frame.
import React, { createContext, useContext } from "react";
import { OffthreadVideo, Sequence } from "remotion";
import { C, FA, FPS, MONO, NUM, SHADOW, UI, hasMedia, v23, videoKey } from "./lib";

type P = React.CSSProperties;

// ── icons (24×24 stroke paths)
const PATHS: Record<string, string> = {
  heart: "M12 20s-7-4.4-9.3-8.6C1.1 8.3 3 4.5 6.6 4.5c2.1 0 3.4 1.2 4.1 2.3h.6c.7-1.1 2-2.3 4.1-2.3 3.6 0 5.5 3.8 3.9 6.9C19 15.6 12 20 12 20z",
  play: "M8 5.5v13l11-6.5z",
  eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zm10 3.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4z",
  user: "M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9zm-8 9c.6-4 4-6.5 8-6.5s7.4 2.5 8 6.5",
  download: "M12 3v12m0 0l-5-5m5 5l5-5M4 19h16",
  send: "M4 12l16-8-6 16-2.5-6.5z",
  check: "M5 12.5l4.5 4.5L19 7.5",
  search: "M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15zm5.5-2l5 5",
  film: "M4 5h16v14H4zM8 5v14m8-14v14M4 9h4m-4 6h4m8-6h4m-4 6h4",
  music: "M9 18V5l11-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm11-2a3 3 0 11-6 0 3 3 0 016 0z",
  sparkle: "M12 2l2.2 6.3L20.5 10.5 14.2 12.7 12 19l-2.2-6.3L3.5 10.5l6.3-2.2z",
  cart: "M3 4h2.5l2.2 11h10.8l2-8H7M9 20a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18zm0-14v5l3.5 2",
  sun: "M12 17a5 5 0 100-10 5 5 0 000 10zm0-15v2m0 16v2M4.2 4.2l1.4 1.4m12.8 12.8l1.4 1.4M2 12h2m16 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  moon: "M20 14.5A8.5 8.5 0 019.5 4 8.5 8.5 0 1020 14.5z",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
  card: "M3 6h18v12H3zM3 10h18M7 15h4",
  gift: "M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7S10.5 3 8 3.5 7 7 12 7zm0 0s1.5-4 4-3.5S17 7 12 7z",
  file: "M6 2h8l5 5v15H6zM14 2v5h5",
  plus: "M12 5v14M5 12h14",
  wand: "M4 20L16 8m-3-3l1.5-1.5M19 10l1.5-1.5M18 4l.5-2M20 6l2-.5M15 3l3 3",
  palette: "M12 3a9 9 0 100 18c1.2 0 1.6-.9 1.2-1.8-.5-1-.1-2.2 1.2-2.2H17a4 4 0 004-4c0-5.5-4-10-9-10zM7.5 12a1 1 0 100-2 1 1 0 000 2zm3-4a1 1 0 100-2 1 1 0 000 2zm4 0a1 1 0 100-2 1 1 0 000 2z",
  mic: "M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3zM5 11a7 7 0 0014 0M12 18v3",
  image: "M4 4h16v16H4zM4 16l5-5 4 4 2-2 5 5M15.5 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  video: "M3 6h12v12H3zM15 10l6-3v10l-6-3z",
  scissors: "M6 9a3 3 0 100-6 3 3 0 000 6zm0 12a3 3 0 100-6 3 3 0 000 6zM8.5 7.5L20 19M8.5 16.5L20 5",
  type: "M5 6V4h14v2M12 4v16M9 20h6",
  loop: "M4 12a8 8 0 0114-5.3L20 9m0-5v5h-5M20 12a8 8 0 01-14 5.3L4 15m0 5v-5h5",
  camera: "M3 8h4l2-3h6l2 3h4v12H3zM12 17a4 4 0 100-8 4 4 0 000 8z",
  comment: "M4 5h16v11H9l-5 4z",
  cursor: "M5 3l14 7-6 1.8L10 19z",
  lock: "M6 11h12v10H6zM8 11V7a4 4 0 018 0v4",
  layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z",
  bell: "M6 16V11a6 6 0 0112 0v5l2 2H4zM10 20a2 2 0 004 0",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM4 12h2m12 0h2M12 4v2m0 12v2M6.3 6.3l1.4 1.4m8.6 8.6l1.4 1.4m0-11.4l-1.4 1.4M7.7 16.3l-1.4 1.4",
};
export const Ico: React.FC<{ n: keyof typeof PATHS | string; s?: number; c?: string; w?: number; fill?: boolean; style?: P }> = ({ n, s = 24, c = "currentColor", w = 2, fill, style }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ display: "block", flex: "none", ...style }}>
    <path d={PATHS[n] ?? ""} fill={fill ? c : "none"} stroke={fill ? "none" : c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── boxes
export const Abs: React.FC<{ x: number; y: number; w?: number; h?: number; style?: P; children?: React.ReactNode }> = ({ x, y, w, h, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, ...style }}>{children}</div>
);
export const Card: React.FC<{ x: number; y: number; w: number; h: number; r?: number; dark?: boolean; style?: P; children?: React.ReactNode }> = ({ x, y, w, h, r = 26, dark, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: r, background: dark ? "#141418" : C.card, boxShadow: dark ? "0 30px 80px rgba(0,0,0,.45)" : SHADOW, overflow: "hidden", ...style }}>{children}</div>
);
/** Persian text (rtl) */
export const Fa: React.FC<{ s?: number; w?: number; c?: string; style?: P; children?: React.ReactNode }> = ({ s = 32, w = 700, c = C.ink, style, children }) => (
  <div style={{ fontFamily: FA, fontSize: s, fontWeight: w, color: c, direction: "rtl", lineHeight: 1.35, whiteSpace: "nowrap", ...style }}>{children}</div>
);
export const Lat: React.FC<{ s?: number; w?: number; c?: string; style?: P; children?: React.ReactNode }> = ({ s = 24, w = 600, c = C.ink, style, children }) => (
  <div style={{ fontFamily: UI, fontSize: s, fontWeight: w, color: c, direction: "ltr", lineHeight: 1.2, whiteSpace: "nowrap", ...style }}>{children}</div>
);
export const Pill: React.FC<{ bg?: string; c?: string; s?: number; style?: P; children?: React.ReactNode }> = ({ bg = C.ink, c = "#fff", s = 20, style, children }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: s * 0.35, padding: `${s * 0.32}px ${s * 0.7}px`, borderRadius: 999, background: bg, color: c, fontFamily: UI, fontWeight: 700, fontSize: s, whiteSpace: "nowrap", lineHeight: 1, ...style }}>{children}</div>
);

/** a big editorial number (serif) with an optional Persian unit under or beside it */
export const BigNum: React.FC<{ v: string; s?: number; c?: string; unit?: string; unitC?: string; style?: P }> = ({ v, s = 300, c = C.ink, unit, unitC, style }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", ...style }}>
    <div style={{ fontFamily: NUM, fontWeight: 700, fontSize: s, color: c, lineHeight: 0.95, letterSpacing: -s * 0.03, direction: "ltr" }}>{v}</div>
    {unit && <Fa s={s * 0.2} w={800} c={unitC ?? c} style={{ marginTop: s * 0.02 }}>{unit}</Fa>}
  </div>
);

/** global time + composition frame (the Look composition maps frame i → an arbitrary time) */
export const TimeCtx = createContext({ t: 0, frame: 0 });
/** a video clip that starts playing (from `from` s into the file) at global time t0 */
export const Clip: React.FC<{ src: string; t0: number; dur?: number; from?: number; style?: P; fit?: "cover" | "contain" }> = ({ src, t0, dur = 30, from = 0, style, fit = "cover" }) => {
  const { t, frame } = useContext(TimeCtx);
  if (t < t0 || t >= t0 + dur) return null;
  const key = videoKey(src);
  if (!hasMedia(key)) return <Slot name={key} t={t - t0 + from} style={style} />;
  // the sequence starts (t - t0) seconds before the current frame, so the clip shows the right moment in both modes
  return (
  <Sequence from={frame - Math.round((t - t0) * FPS)} durationInFrames={Math.round(dur * FPS)} layout="none">
    <OffthreadVideo src={v23(key)} startFrom={Math.round(from * FPS)} muted style={{ width: "100%", height: "100%", objectFit: fit, display: "block", maxWidth: "none", ...style }} />
  </Sequence>
  );
};

/** where a video of yours goes (lib.MEDIA): a slow dark gradient with the slot's name and a running timecode */
export const Slot: React.FC<{ name: string; t: number; style?: P }> = ({ name, t, style }) => (
  <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: `linear-gradient(${135 + 20 * Math.sin(t * 0.7)}deg, #23252B, #3A3D45 55%, #1B1C20)`, display: "flex", alignItems: "center", justifyContent: "center", ...style }}>
    <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,.035) 0 14px, transparent 14px 28px)", backgroundPosition: `${(t * 30) % 40}px 0` }} />
    <div style={{ position: "relative", textAlign: "center", color: "rgba(255,255,255,.72)", fontFamily: MONO, fontSize: 22, letterSpacing: 1, lineHeight: 1.5 }}>
      <div style={{ fontSize: 40, lineHeight: 1 }}>▶</div>
      <div>{name}</div>
      <div style={{ opacity: 0.6 }}>{t.toFixed(1)} s</div>
    </div>
  </div>
);

/** phone frame; children fill the screen */
export const Phone: React.FC<{ x: number; y: number; w: number; style?: P; children?: React.ReactNode }> = ({ x, y, w, style, children }) => {
  const h = w * 2.05;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: w * 0.14, background: "#0D0D10", padding: w * 0.035, boxShadow: "0 40px 90px rgba(10,10,20,.35), inset 0 0 0 2px #2A2A30", ...style }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: w * 0.11, overflow: "hidden", background: "#000" }}>
        {children}
        <div style={{ position: "absolute", left: "50%", top: w * 0.03, width: w * 0.3, height: w * 0.075, marginLeft: -w * 0.15, borderRadius: 99, background: "#000" }} />
      </div>
    </div>
  );
};

/** reels side rail (like / comment / share) */
export const ReelRail: React.FC<{ s?: number; likes?: string }> = ({ s = 1, likes = "1.2M" }) => (
  <div style={{ position: "absolute", right: 14 * s, bottom: 90 * s, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 * s, color: "#fff", fontFamily: UI, fontWeight: 600, fontSize: 15 * s, textShadow: "0 1px 4px rgba(0,0,0,.6)" }}>
    {[["heart", likes], ["comment", "8.4K"], ["send", "31K"]].map(([n, l]) => (
      <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 * s }}>
        <Ico n={n} s={34 * s} c="#fff" w={2} />
        <span>{l}</span>
      </div>
    ))}
  </div>
);

/** typed text: shows the first k characters (k from 0..1) with a caret */
export const typed = (s: string, k: number) => s.slice(0, Math.round(s.length * Math.min(1, Math.max(0, k))));

/** grain overlay, re-seeded on twos */
export const Grain: React.FC<{ frame: number; o?: number; blend?: P["mixBlendMode"] }> = ({ frame, o = 0.07, blend = "multiply" }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      opacity: o,
      mixBlendMode: blend,
      pointerEvents: "none",
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' seed='${Math.floor(frame / 2) % 9}'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.4 -0.2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
    }}
  />
);

/** the shared label used on dark showcase shots: a thin line + Persian title + small Latin tag */
export const Tag: React.FC<{ fa: string; en: string; k: number; dark?: boolean; style?: P }> = ({ fa, en, k, dark = true, style }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 14}px)`, ...style }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      <Fa s={46} w={900} c={dark ? "#fff" : C.ink}>{fa}</Fa>
      <div style={{ fontFamily: "Chakra", fontWeight: 600, fontSize: 16, letterSpacing: 4, color: dark ? C.neon : C.green }}>{en}</div>
    </div>
    <div style={{ width: 90 * k, height: 3, background: dark ? C.neon : C.green, borderRadius: 2 }} />
  </div>
);
