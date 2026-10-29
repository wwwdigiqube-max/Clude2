// Video 23 · group A kit: extra icons, brand marks, iOS status bar, odometer numbers, touch ripple, iOS notification.
import React, { useContext } from "react";
import { OffthreadVideo, Sequence } from "remotion";
import { C, FA, FPS, MONO, NUM, UI, clamp, ease, hasMedia, lerp, ramp, v23 } from "./lib";
import { Slot, TimeCtx } from "./ui";

/** like ui.Clip (muted, starts at global t0 from `from` s), plus a playback rate */
export const RClip: React.FC<{ src: string; t0: number; dur: number; from?: number; rate?: number; style?: React.CSSProperties }> = ({ src, t0, dur, from = 0, rate = 1, style }) => {
  const { t, frame } = useContext(TimeCtx);
  if (t < t0 || t >= t0 + dur) return null;
  if (!hasMedia(`clips/${src}`)) return <Slot name={`clips/${src}`} t={(t - t0) * rate + from} style={style} />;
  return (
    <Sequence from={frame - Math.round((t - t0) * FPS)} durationInFrames={Math.round(dur * FPS)} layout="none">
      <OffthreadVideo src={v23(`clips/${src}`)} startFrom={Math.round(from * FPS)} playbackRate={rate} muted style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", maxWidth: "none", ...style }} />
    </Sequence>
  );
};

type P = React.CSSProperties;

// ── extra icons (24×24, stroke)
const AP: Record<string, string> = {
  grid: "M3.5 3.5h17v17h-17zM9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17",
  reels: "M3.5 3.5h17v17h-17zM3.5 8.5h17M8.6 3.6l2.6 4.8M14.4 3.6l2.6 4.8M10.2 11.6v6.2l5.2-3.1z",
  tagged: "M3.5 3.5h17v17h-17zM12 12.4a2.7 2.7 0 100-5.4 2.7 2.7 0 000 5.4zM7 17.6c.8-2.2 2.7-3.4 5-3.4s4.2 1.2 5 3.4",
  chevL: "M15 4.5L7.5 12l7.5 7.5",
  chevR: "M9 4.5l7.5 7.5L9 19.5",
  chevD: "M6 9.5l6 6 6-6",
  back: "M20 12H4.5m0 0l6.5-6.5M4.5 12l6.5 6.5",
  backR: "M4 12h15.5m0 0L13 5.5m6.5 6.5L13 18.5",
  link: "M10 14a4.2 4.2 0 006 0l3-3a4.2 4.2 0 00-6-6l-1.2 1.2M14 10a4.2 4.2 0 00-6 0l-3 3a4.2 4.2 0 006 6l1.2-1.2",
  pin: "M9 3h6l-1 6 3.5 3.5v1.5h-11v-1.5L10 9zM12 14v7",
  bag: "M5 8h14l-1.2 12.5H6.2zM9 8V6.5a3 3 0 016 0V8",
  x: "M6 6l12 12M18 6L6 18",
  cast: "M2.5 18.5a2 2 0 012 2M2.5 15a5.5 5.5 0 015.5 5.5M2.5 11.5a9 9 0 019 9M5 7V5.5h16.5v13H15",
  dollar: "M12 2.5v19M16.8 6.6C16 5.1 14.3 4.2 12 4.2c-2.9 0-4.8 1.5-4.8 3.6 0 5 9.6 2.7 9.6 7.9 0 2.3-2 3.9-4.8 3.9-2.5 0-4.4-1.1-5.1-2.9",
  trend: "M3 17l6-6 4 4 8-8M15 7h6v6",
  cal: "M4 5.5h16v15H4zM4 10h16M8.5 3v5M15.5 3v5",
  flag: "M5.5 21V3.5M5.5 4h11.5l-2.4 4.2 2.4 4.3H5.5",
  users: "M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2.5 20c.5-3.4 3.2-5.5 6.5-5.5s6 2.1 6.5 5.5M16 4.4a3.5 3.5 0 010 6.3M18 14.8c2 .7 3.2 2.6 3.5 5.2",
  addUser: "M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2.5 20c.5-3.4 3.2-5.5 6.5-5.5s6 2.1 6.5 5.5M19 8v6M16 11h6",
  laptop: "M5 5h14v10H5zM2.5 19h19l-1.5-2.5h-16z",
  up: "M12 19V5m-6 6l6-6 6 6",
  igComment: "M20.6 11.6a8.6 8.6 0 01-12.5 7.7L3.4 20.6l1.4-4.7A8.6 8.6 0 1120.6 11.6z",
  igSend: "M21.5 3.5L10.4 13.7M21.5 3.5l-6.9 17-4.2-6.8-7-4.1z",
  bookmark: "M19 21l-7-5-7 5V3.5h14z",
  home: "M3.5 10.5L12 3l8.5 7.5V21h-5.8v-6.2H9.3V21H3.5z",
  shorts: "M15.5 3.2c1.8-.9 4 .4 4 2.4 0 1-.6 2-1.5 2.4l-1.6.8c1.4.2 2.6 1.4 2.6 2.9 0 1.1-.6 2.1-1.6 2.6l-8.8 4.5c-1.8.9-4-.4-4-2.4 0-1 .6-2 1.5-2.4l1.6-.8C6.3 13 5.1 11.8 5.1 10.3c0-1.1.6-2.1 1.6-2.6zM10.3 9.3v5.4l4.6-2.7z",
  subs: "M4 6h16M5.5 3h13M3 9h18v12H3zM10 12v6l5-3z",
  lib: "M4 4v16M8 4v16M12 4l6 16",
  wave: "M3 12h2l2-5 3 10 3-14 3 12 2-6 3 3",
  film2: "M4 4h16v16H4zM4 8h16M4 16h16M8 4v4M12 4v4M16 4v4M8 16v4M12 16v4M16 16v4",
  bulb: "M9 18h6M10 21h4M12 3a6 6 0 00-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0012 3z",
  lip: "M3 12c2-3 5-4.5 9-2 4-2.5 7-1 9 2-2 3.5-5 5-9 5s-7-1.5-9-5zM3 12h18",
  grade: "M12 3a9 9 0 100 18V3z",
  cc: "M3 5h18v14H3zM10 10.2a2.5 2.5 0 100 3.6M17 10.2a2.5 2.5 0 100 3.6",
  hd: "M3 5h18v14H3zM7 9v6M7 12h3.5M10.5 9v6M14 9v6h1.5a3 3 0 000-6z",
  person: "M12 11a3.8 3.8 0 100-7.6 3.8 3.8 0 000 7.6zM4.5 21c.6-4 3.6-6.6 7.5-6.6s6.9 2.6 7.5 6.6",
  question: "M9 9a3 3 0 115 2.2c-1.2.8-2 1.6-2 2.8M12 18h.01",
};
export const AIco: React.FC<{ n: string; s?: number; c?: string; w?: number; fill?: boolean; style?: P }> = ({ n, s = 24, c = "currentColor", w = 2, fill, style }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ display: "block", flex: "none", ...style }}>
    <path d={AP[n] ?? ""} fill={fill ? c : "none"} stroke={fill ? "none" : c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
/** three dots (horizontal or vertical) */
export const Dots: React.FC<{ s?: number; c?: string; v?: boolean }> = ({ s = 24, c = "#fff", v }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ display: "block", flex: "none" }}>
    {[5, 12, 19].map((p) => <circle key={p} cx={v ? 12 : p} cy={v ? p : 12} r={2} fill={c} />)}
  </svg>
);

// ── brand marks (geometry of the official glyphs)
export const IG_GRAD = "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)";
/** Instagram glyph: rounded square, lens, flash dot */
export const IgGlyph: React.FC<{ s?: number; c?: string }> = ({ s = 40, c }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ display: "block", flex: "none" }}>
    <defs>
      <radialGradient id="igg" cx="0.28" cy="1.05" r="1.25">
        <stop offset="0" stopColor="#FFD600" />
        <stop offset="0.35" stopColor="#FF6930" />
        <stop offset="0.6" stopColor="#FE3B36" />
        <stop offset="0.75" stopColor="#E1306C" />
        <stop offset="1" stopColor="#833AB4" />
      </radialGradient>
    </defs>
    <rect x="2.2" y="2.2" width="19.6" height="19.6" rx="5.6" fill="none" stroke={c ?? "url(#igg)"} strokeWidth="2.2" />
    <circle cx="12" cy="12" r="4.5" fill="none" stroke={c ?? "url(#igg)"} strokeWidth="2.2" />
    <circle cx="17.6" cy="6.4" r="1.35" fill={c ?? "#E1306C"} />
  </svg>
);
const YT_OUTER = "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z";
/** YouTube play-button mark (simple-icons geometry) */
export const YtMark: React.FC<{ s?: number }> = ({ s = 40 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ display: "block", flex: "none" }}>
    <path d={YT_OUTER} fill="#FF0033" />
    <path d="M9.545 15.568V8.432L15.818 12z" fill="#fff" />
  </svg>
);

// ── iOS status bar (time, signal, wifi, battery); rtl mirrors it like iOS in Persian
export const StatusBar: React.FC<{ c?: string; rtl?: boolean; time?: string; y?: number; batt?: number }> = ({ c = "#000", rtl, time = "9:41", y = 0, batt = 0.82 }) => {
  const cluster = (
    <div style={{ display: "flex", alignItems: "center", gap: 14, flexDirection: rtl ? "row-reverse" : "row" }}>
      <svg width={46} height={30} viewBox="0 0 46 30">{[0, 1, 2, 3].map((i) => <rect key={i} x={i * 12} y={22 - i * 6.5} width={8.5} height={8 + i * 6.5} rx={2} fill={c} />)}</svg>
      <svg width={42} height={30} viewBox="0 0 42 30">
        <path d="M21 27l-5.5-6.2a8 8 0 0111 0z" fill={c} />
        <path d="M9.3 14.6a17 17 0 0123.4 0l-3.6 4a11.6 11.6 0 00-16.2 0z" fill={c} />
        <path d="M3 8a26 26 0 0136 0l-3.6 4a20.6 20.6 0 00-28.8 0z" fill={c} />
      </svg>
      <svg width={62} height={30} viewBox="0 0 62 30">
        <rect x={1.5} y={2.5} width={52} height={25} rx={8} fill="none" stroke={c} strokeOpacity={0.4} strokeWidth={2.4} />
        <rect x={5} y={6} width={45 * batt} height={18} rx={4.5} fill={c} />
        <path d="M57 11v8c1.8-.5 3-2.2 3-4s-1.2-3.5-3-4z" fill={c} fillOpacity={0.45} />
      </svg>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: 1080, height: 120, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 76px 0 92px", flexDirection: rtl ? "row-reverse" : "row" }}>
      <div style={{ fontFamily: UI, fontWeight: 650, fontSize: 46, color: c, letterSpacing: -0.5, width: 150, textAlign: rtl ? "right" : "left" }}>{time}</div>
      {cluster}
    </div>
  );
};

// ── odometer number (digits roll like a counter); v continuous ≥ 0
const DIG = "01234567890";
export const Odo: React.FC<{ v: number; s: number; font?: string; w?: number; c?: string; sep?: boolean; dw?: number; lh?: number; style?: P }> = ({ v, s, font = NUM, w = 700, c = C.ink, sep = true, dw = 0.64, lh = 1.3, style }) => {
  const n = Math.max(0, v);
  const nd = Math.max(1, String(Math.floor(Math.max(1, n + 0.0001))).length);
  const cols: React.ReactNode[] = [];
  const H = s * lh;
  for (let k = nd - 1; k >= 0; k--) {
    const p = Math.pow(10, k);
    const base = Math.floor(n / p + 1e-9);
    const rem = n - base * p;
    const carry = k === 0 ? rem : clamp(rem - (p - 1));
    const pos = (base % 10) + carry;
    const vis = k === 0 ? 1 : clamp(n - (p - 1));
    cols.push(
      <div key={`d${k}`} style={{ width: s * dw * vis, height: H, overflow: "hidden", position: "relative", flex: "none", opacity: vis, WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 11%, #000 89%, transparent 100%)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: s * dw, transform: `translateY(${-pos * H}px)` }}>
          {DIG.split("").map((d, i) => (
            <div key={i} style={{ height: H, lineHeight: `${H}px`, textAlign: "center", fontFamily: font, fontWeight: w, fontSize: s, color: c }}>{d}</div>
          ))}
        </div>
      </div>,
    );
    if (sep && k > 0 && k % 3 === 0) cols.push(<div key={`s${k}`} style={{ height: H, lineHeight: `${H}px`, fontFamily: font, fontWeight: w, fontSize: s, color: c, width: s * 0.26 * vis, overflow: "hidden", textAlign: "center", opacity: vis }}>,</div>);
  }
  return <div style={{ display: "flex", direction: "ltr", alignItems: "center", ...style }}>{cols}</div>;
};

// ── a touch indicator (screen-recording style)
export const Touch: React.FC<{ t: number; t0: number; x: number; y: number; d?: number; dark?: boolean }> = ({ t, t0, x, y, d = 0.45, dark }) => {
  if (t < t0 - 0.12 || t > t0 + d + 0.25) return null;
  const kIn = ease.out(ramp(t, t0 - 0.12, t0));
  const kOut = ramp(t, t0 + d, t0 + d + 0.25);
  const press = 1 - 0.18 * Math.sin(clamp((t - t0) / 0.22) * Math.PI);
  const ring = ramp(t, t0, t0 + 0.5);
  const col = dark ? "255,255,255" : "40,40,46";
  return (
    <>
      <div style={{ position: "absolute", left: x - 46, top: y - 46, width: 92, height: 92, borderRadius: 46, background: `rgba(${col},.28)`, border: `3px solid rgba(${col},.55)`, transform: `scale(${lerp(1.4, 1, kIn) * press})`, opacity: kIn * (1 - kOut) }} />
      {t >= t0 && <div style={{ position: "absolute", left: x - 46, top: y - 46, width: 92, height: 92, borderRadius: 46, border: `3px solid rgba(${col},.5)`, transform: `scale(${1 + ring * 1.4})`, opacity: (1 - ring) * 0.8 }} />}
    </>
  );
};

/** iOS banner notification (rtl = Persian) */
export const Notif: React.FC<{ title: React.ReactNode; body: React.ReactNode; when?: string; icon: React.ReactNode; style?: P }> = ({ title, body, when = "الان", icon, style }) => (
  <div style={{ width: 1000, height: 176, borderRadius: 52, background: "rgba(246,245,243,.94)", boxShadow: "0 18px 50px rgba(0,0,0,.22), 0 2px 6px rgba(0,0,0,.08)", display: "flex", alignItems: "center", gap: 30, padding: "0 36px", direction: "rtl", wordSpacing: "0.22em", ...style }}>
    <div style={{ width: 104, height: 104, borderRadius: 26, flex: "none", overflow: "hidden" }}>{icon}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontFamily: FA, fontWeight: 800, fontSize: 38, color: "#111", whiteSpace: "nowrap" }}>{title}</div>
        <div style={{ fontFamily: FA, fontWeight: 500, fontSize: 30, color: "#8a8a8e" }}>{when}</div>
      </div>
      <div style={{ fontFamily: FA, fontWeight: 500, fontSize: 34, color: "#333", marginTop: 4, whiteSpace: "nowrap" }}>{body}</div>
    </div>
  </div>
);

/** small mono label (Latin caps, tracked) */
export const Mono: React.FC<{ s?: number; c?: string; ls?: number; style?: P; children?: React.ReactNode }> = ({ s = 22, c = C.ink3, ls = 5, style, children }) => (
  <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: s, letterSpacing: ls, color: c, whiteSpace: "nowrap", lineHeight: 1, direction: "ltr", ...style }}>{children}</div>
);

/** CSS path for an "inverse iris": the full frame minus a circle (fill-rule evenodd) */
export const holePath = (cx: number, cy: number, r: number, w = 1080, h = 1920) =>
  `path(evenodd, "M0 0H${w}V${h}H0Z M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z")`;

/** seeded shuffle of 0..n-1 */
export const shuffle = (n: number, seed: number) => Array.from({ length: n }, (_, i) => i).sort((a, b) => Math.sin(a * 91.7 + seed * 13.1) * 9e3 % 1 - Math.sin(b * 91.7 + seed * 13.1) * 9e3 % 1);

/** smooth noise-ish wobble (sum of sines) */
export const wob = (t: number, i: number, a = 1) => a * (Math.sin(t * 1.7 + i * 2.1) * 0.6 + Math.sin(t * 2.9 + i * 0.7) * 0.4);

/** a big editorial callout: serif number + Persian unit + Latin tag on a white card */
export const Callout: React.FC<{ k: number; num: React.ReactNode; unit: string; tag: string; w?: number; style?: P; children?: React.ReactNode }> = ({ k, num, unit, tag, w = 900, style, children }) => (
  <div style={{ width: w, borderRadius: 44, background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,.06), 0 24px 60px rgba(20,20,30,.18), 0 60px 140px rgba(20,20,30,.16)", padding: "38px 56px 40px", opacity: clamp(k * 2), transform: `translateY(${(1 - k) * 60}px) scale(${lerp(0.86, 1, k)})`, ...style }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", direction: "rtl" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 16, height: 16, borderRadius: 8, background: C.green }} />
        <Mono s={24} c={C.ink3}>{tag}</Mono>
      </div>
      <Mono s={22} c={C.ink3} ls={3}>LIVE</Mono>
    </div>
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 34, direction: "rtl", marginTop: 26 }}>
      <div>{num}</div>
      <div style={{ fontFamily: FA, fontWeight: 900, fontSize: 120, color: C.green, lineHeight: 1.25, paddingBottom: 14 }}>{unit}</div>
    </div>
    {children}
  </div>
);
