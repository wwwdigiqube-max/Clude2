// Video 23 · group C kit: camera, real brand marks (simple-icons paths), phone-UI bits, avatars, taps, toggles.
import React from "react";
import { Img } from "remotion";
import { CLAUDE_ORANGE, CLAUDE_PATH } from "../../test-reel/lib/claude-logo";
import { C, FA, MONO, UI, clamp, ease, lerp, ramp, v23 } from "./lib";

export type SP = { t: number; frame: number };
type P = React.CSSProperties;

export const Full: React.FC<{ style?: P; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden", ...style }}>{children}</div>
);
/** plain absolutely-positioned box */
export const B: React.FC<{ x: number; y: number; w?: number; h?: number; style?: P; children?: React.ReactNode }> = ({ x, y, w, h, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, ...style }}>{children}</div>
);

// ── keyframe tracks (ease.io between keys, hold outside)
export const track = (t: number, keys: [number, number][], e: (k: number) => number = ease.io) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    const [t0, v0] = keys[i - 1];
    if (t <= t1) return lerp(v0, v1, e(ramp(t, t0, t1)));
  }
  return keys[keys.length - 1][1];
};
export const trackV = (t: number, keys: [number, number[]][], e: (k: number) => number = ease.io) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    const [t0, v0] = keys[i - 1];
    if (t <= t1) {
      const k = e(ramp(t, t0, t1));
      return v0.map((v, j) => lerp(v, v1[j], k));
    }
  }
  return keys[keys.length - 1][1];
};
/** camera: content point (fx, fy) lands on screen point (ax, ay), scaled by s, rotated r° */
export const Cam: React.FC<{ fx: number; fy: number; ax: number; ay: number; s?: number; r?: number; style?: P; children?: React.ReactNode }> = ({ fx, fy, ax, ay, s = 1, r = 0, style, children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: `translate(${ax}px, ${ay}px) rotate(${r}deg) scale(${s}) translate(${-fx}px, ${-fy}px)`, ...style }}>{children}</div>
);
/** slow hand-held drift */
export const drift = (t: number, a = 1) => ({ x: (Math.sin(t * 0.9) * 5 + Math.sin(t * 2.3) * 1.5) * a, y: (Math.cos(t * 0.7) * 4 + Math.sin(t * 1.9) * 1.5) * a, r: Math.sin(t * 0.5) * 0.25 * a });
/** decaying shake after t0 */
export const shake = (t: number, t0: number, amp = 14, d = 0.45) => {
  if (t < t0 || t > t0 + d) return { x: 0, y: 0 };
  const k = 1 - (t - t0) / d;
  return { x: Math.sin((t - t0) * 70) * amp * k * k, y: Math.cos((t - t0) * 55) * amp * 0.7 * k * k };
};

// ── colour mix
const hx = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mix = (a: string, b: string, k: number) => {
  const A = hx(a), Bc = hx(b), q = clamp(k);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, Bc[i], q))).join(",")})`;
};
export const smooth = (a: number, b: number, x: number) => {
  const k = clamp((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};

// ── real brand marks (simple-icons 13.21.0 paths, viewBox 24)
const IG_PATH =
  "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077";
const YT_PATH =
  "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z";
export const IG_GRAD = "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)";
export const ClaudeMark: React.FC<{ s?: number; c?: string; style?: P }> = ({ s = 40, c = CLAUDE_ORANGE, style }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ display: "block", flex: "none", ...style }}><path d={CLAUDE_PATH} fill={c} /></svg>
);
export const IgGlyph: React.FC<{ s?: number; c?: string; style?: P }> = ({ s = 40, c = "#fff", style }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ display: "block", flex: "none", ...style }}><path d={IG_PATH} fill={c} /></svg>
);
/** the Instagram app tile: brand gradient square + glyph */
export const IgTile: React.FC<{ s?: number; style?: P }> = ({ s = 60, style }) => (
  <div style={{ width: s, height: s, borderRadius: s * 0.24, background: IG_GRAD, display: "flex", alignItems: "center", justifyContent: "center", flex: "none", ...style }}>
    <IgGlyph s={s * 0.62} />
  </div>
);
export const YtLogo: React.FC<{ s?: number; style?: P }> = ({ s = 40, style }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ display: "block", flex: "none", ...style }}>
    <path d="M9.545 15.568V8.432L15.818 12z" fill="#fff" />
    <path d={YT_PATH} fill={C.yt} />
  </svg>
);
/** YouTube wordmark lockup (logo + "YouTube" set in Inter, tight) */
export const YtLockup: React.FC<{ s?: number; dark?: boolean }> = ({ s = 30, dark }) => (
  <div style={{ display: "flex", alignItems: "center", gap: s * 0.12, direction: "ltr" }}>
    <YtLogo s={s * 1.25} />
    <span style={{ fontFamily: UI, fontWeight: 800, fontSize: s, letterSpacing: -s * 0.05, color: dark ? "#fff" : "#0F0F0F" }}>YouTube</span>
  </div>
);
/** NFP wordmark (same as S7: Inter black italic) */
export const NfpMark: React.FC<{ s?: number; c?: string; style?: P }> = ({ s = 60, c = C.ink, style }) => (
  <div style={{ fontFamily: UI, fontWeight: 900, fontStyle: "italic", fontSize: s, letterSpacing: -s * 0.035, color: c, lineHeight: 1, direction: "ltr", whiteSpace: "nowrap", ...style }}>NFP</div>
);

// ── extra UI icons (24-grid strokes)
const XP: Record<string, string> = {
  bookmark: "M6.5 3.5h11v17L12 16.6l-5.5 3.9z",
  home: "M3.5 10.6L12 3.6l8.5 7v9.9h-5.6v-6.2H9.1v6.2H3.5z",
  reels: "M3.5 3.5h17v17h-17zM3.5 8.4h17M8.6 3.6l2.8 4.7M14.6 3.6l2.8 4.7M10.4 11.4v6.2l5.2-3.1z",
  plusSq: "M3.5 3.5h17v17h-17zM12 7.8v8.4M7.8 12h8.4",
  up: "M12 19.5V5.2M6.2 11L12 5.2 17.8 11",
  chev: "M14.6 5.8L8.4 12l6.2 6.2",
  thumb: "M7.2 10.4v10.1H3.5V10.4zM7.2 10.4l4.3-6.9c1.5 0 2.6 1.1 2.6 2.6v3.5h5.3c1.3 0 2.3 1.2 2 2.5l-1.6 7c-.2 1-1.1 1.6-2.1 1.6H7.2",
  share: "M13.8 5.2l7 6.8-7 6.8v-4.1c-5 0-8.4 1.4-11 5 1.1-5.2 4-9.7 11-10.6z",
  dl: "M12 3.8v11.4m0 0l-4.6-4.6M12 15.2l4.6-4.6M4.8 20.2h14.4",
  igcomment: "M20.6 11.7a8.5 8.5 0 01-12.5 7.5L3.4 20.6l1.4-4.6A8.5 8.5 0 1120.6 11.7z",
  igsend: "M21.6 3.2L9.6 10.3M11.9 20.6L21.6 3.2H2.6l7 7.1z",
  wifi: "M2.5 8.8a14 14 0 0119 0M5.8 12.2a9.2 9.2 0 0112.4 0M9.1 15.6a4.6 4.6 0 015.8 0",
  music: "M9 18V5.5l10.5-2v12.7M9 18a2.8 2.8 0 11-5.6 0 2.8 2.8 0 015.6 0zm10.5-1.8a2.8 2.8 0 11-5.6 0 2.8 2.8 0 015.6 0z",
  bellOn: "M6 16V11a6 6 0 0112 0v5l2 2H4zM10 20.5a2 2 0 004 0M3 6.5l2 1.3M21 6.5l-2 1.3",
  smile: "M12 21a9 9 0 100-18 9 9 0 000 18zM8.5 14.2c1.8 2 5.2 2 7 0M9 9.5h.01M15 9.5h.01",
  gif: "M3.5 5.5h17v13h-17zM10.2 10.2H8.3v3.6h1.9v-1.6M12.6 10.2v3.6M15 13.8v-3.6h2.1M15 12h1.7",
  globe: "M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c2.6 2.7 2.6 15.3 0 18M12 3c-2.6 2.7-2.6 15.3 0 18",
  backspace: "M8.5 5.5h12v13h-12L3 12zM12 9.5l5 5m0-5l-5 5",
  shift: "M12 4.5l7.5 8h-4v7h-7v-7h-4z",
  cal: "M4 5.5h16v15H4zM4 10h16M8.5 3.5v4M15.5 3.5v4",
};
export const XI: React.FC<{ n: string; s?: number; c?: string; w?: number; fill?: boolean; style?: P }> = ({ n, s = 24, c = "currentColor", w = 2, fill, style }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ display: "block", flex: "none", overflow: "visible", ...style }}>
    <path d={XP[n] ?? ""} fill={fill ? c : "none"} stroke={fill ? "none" : c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
/** iOS-ish status bar: time · signal · wifi · battery */
export const StatusBar: React.FC<{ s?: number; c?: string; time?: string }> = ({ s = 1, c = "#fff", time = "9:41" }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 44 * s, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${26 * s}px`, direction: "ltr", color: c, fontFamily: UI, fontWeight: 700, fontSize: 15 * s, zIndex: 5 }}>
    <span style={{ marginLeft: 10 * s }}>{time}</span>
    <div style={{ display: "flex", alignItems: "center", gap: 5 * s }}>
      <svg width={18 * s} height={11 * s} viewBox="0 0 18 11">{[0, 1, 2, 3].map((i) => <rect key={i} x={i * 4.6} y={8 - i * 2.6} width={3.2} height={3 + i * 2.6} rx={0.8} fill={c} />)}</svg>
      <XI n="wifi" s={17 * s} c={c} w={2.4} />
      <svg width={26 * s} height={12 * s} viewBox="0 0 26 12"><rect x={0.6} y={0.6} width={22} height={10.8} rx={3.2} fill="none" stroke={c} strokeOpacity={0.45} strokeWidth={1.2} /><rect x={2.4} y={2.4} width={16} height={7.2} rx={1.8} fill={c} /><rect x={23.6} y={4} width={1.8} height={4} rx={0.8} fill={c} fillOpacity={0.45} /></svg>
    </div>
  </div>
);
/** circular avatar from the stills (s01–s47) */
export const Av: React.FC<{ id: number; s: number; ring?: string; ringW?: number; pos?: string; style?: P }> = ({ id, s, ring, ringW = 3, pos = "50% 28%", style }) => (
  <div style={{ width: s, height: s, borderRadius: "50%", padding: ring ? ringW : 0, background: ring ?? "transparent", flex: "none", ...style }}>
    <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", border: ring ? `${Math.max(2, ringW * 0.8)}px solid #fff` : undefined, boxSizing: "border-box", background: "#ccc" }}>
      <Img src={v23(`stills/s${String(id).padStart(2, "0")}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, display: "block", maxWidth: "none" }} />
    </div>
  </div>
);
/** a still image filling its parent */
export const Still: React.FC<{ id: number; style?: P }> = ({ id, style }) => (
  <Img src={v23(`stills/s${String(id).padStart(2, "0")}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", maxWidth: "none", ...style }} />
);
/** finger-tap indicator: approaches, presses at t0, ripples */
export const Tap: React.FC<{ t: number; t0: number; x: number; y: number; from?: [number, number]; s?: number; dark?: boolean }> = ({ t, t0, x, y, from = [140, 200], s = 1, dark }) => {
  if (t < t0 - 0.5 || t > t0 + 0.42) return null;
  const app = ease.out(ramp(t, t0 - 0.5, t0 - 0.06));
  const press = t >= t0 - 0.06 && t < t0 + 0.12 ? 0.82 : 1;
  const leave = ease.in(ramp(t, t0 + 0.14, t0 + 0.4));
  const rip = ramp(t, t0, t0 + 0.45);
  const px = x + from[0] * (1 - app) + leave * 60, py = y + from[1] * (1 - app) + leave * 90;
  const col = dark ? "255,255,255" : "22,23,26";
  return (
    <>
      {t >= t0 && <div style={{ position: "absolute", left: x - 30 * s - rip * 60 * s, top: y - 30 * s - rip * 60 * s, width: (60 + rip * 120) * s, height: (60 + rip * 120) * s, borderRadius: "50%", border: `${3 * s}px solid rgba(${col},${0.35 * (1 - rip)})`, pointerEvents: "none" }} />}
      <div style={{ position: "absolute", left: px - 34 * s, top: py - 34 * s, width: 68 * s, height: 68 * s, borderRadius: "50%", background: `rgba(${col},.22)`, border: `${3 * s}px solid rgba(255,255,255,.85)`, boxShadow: "0 6px 18px rgba(0,0,0,.18)", transform: `scale(${press})`, opacity: Math.min(app * 1.4, 1 - leave), pointerEvents: "none" }} />
    </>
  );
};
/** mouse pointer (macOS-like) */
export const Pointer: React.FC<{ x: number; y: number; s?: number; down?: boolean; o?: number }> = ({ x, y, s = 1, down, o = 1 }) => (
  <svg width={34 * s} height={44 * s} viewBox="0 0 17 22" style={{ position: "absolute", left: x - 2 * s, top: y - 2 * s, opacity: o, transform: `scale(${down ? 0.88 : 1})`, transformOrigin: "0 0", filter: "drop-shadow(0 3px 5px rgba(0,0,0,.35))", pointerEvents: "none" }}>
    <path d="M1 1v17.5l4.6-4.3 3 6.6 3.1-1.4-3-6.5h6.2z" fill="#111" stroke="#fff" strokeWidth={1.4} strokeLinejoin="round" />
  </svg>
);
/** iOS toggle (on 0..1), orange when on */
export const Toggle: React.FC<{ on: number; w?: number; rtl?: boolean }> = ({ on, w = 102, rtl = true }) => {
  const h = w * 0.6, kn = h - 8;
  const k = clamp(on);
  const left = rtl ? lerp(w - kn - 4, 4, k) : lerp(4, w - kn - 4, k);
  return (
    <div style={{ width: w, height: h, borderRadius: h, background: mix("#E2E0D9", C.green, k), position: "relative", flex: "none", boxShadow: "inset 0 1px 3px rgba(0,0,0,.12)" }}>
      <div style={{ position: "absolute", top: 4, left, width: kn, height: kn, borderRadius: "50%", background: "#fff", boxShadow: "0 3px 8px rgba(0,0,0,.22), 0 1px 1px rgba(0,0,0,.08)" }} />
    </div>
  );
};
/** Persian label helper (block, rtl) */
export const T: React.FC<{ s?: number; w?: number; c?: string; style?: P; children?: React.ReactNode }> = ({ s = 32, w = 700, c = C.ink, style, children }) => (
  <div style={{ fontFamily: FA, fontSize: s, fontWeight: w, color: c, direction: "rtl", lineHeight: 1.3, whiteSpace: "nowrap", wordSpacing: "0.22em", ...style }}>{children}</div>
);
/** Latin label helper */
export const L: React.FC<{ s?: number; w?: number; c?: string; mono?: boolean; style?: P; children?: React.ReactNode }> = ({ s = 22, w = 600, c = C.ink, mono, style, children }) => (
  <div style={{ fontFamily: mono ? MONO : UI, fontSize: s, fontWeight: w, color: c, direction: "ltr", lineHeight: 1.2, whiteSpace: "nowrap", letterSpacing: mono ? s * 0.04 : 0, ...style }}>{children}</div>
);
/** a short orange shockwave ring */
export const Shock: React.FC<{ t: number; t0: number; x: number; y: number; r0?: number; r1?: number; d?: number; c?: string; w?: number }> = ({ t, t0, x, y, r0 = 60, r1 = 420, d = 0.55, c = C.green, w = 6 }) => {
  if (t < t0 || t > t0 + d) return null;
  const k = ease.out(ramp(t, t0, t0 + d));
  const r = lerp(r0, r1, k);
  return <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `${w * (1 - k) + 1}px solid ${c}`, opacity: 1 - k, pointerEvents: "none" }} />;
};
/** spark burst: short radiating strokes */
export const Sparks: React.FC<{ t: number; t0: number; x: number; y: number; n?: number; r?: number; c?: string; d?: number; seed?: number }> = ({ t, t0, x, y, n = 10, r = 120, c = C.green, d = 0.5, seed = 1 }) => {
  if (t < t0 || t > t0 + d) return null;
  const k = ease.out(ramp(t, t0, t0 + d));
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + seed;
        const r0 = r * (0.35 + k * 0.75), r1 = r * (0.55 + k * 0.95);
        return <line key={i} x1={x + Math.cos(a) * r0} y1={y + Math.sin(a) * r0} x2={x + Math.cos(a) * r1} y2={y + Math.sin(a) * r1} stroke={c} strokeWidth={7 * (1 - k) + 1} strokeLinecap="round" opacity={1 - k * 0.8} />;
      })}
    </svg>
  );
};
/** the nfp.studio account avatar: NFP mark on ink (optional IG story ring) */
export const NfpAv: React.FC<{ s: number; ring?: boolean; style?: P }> = ({ s, ring, style }) => (
  <div style={{ width: s, height: s, borderRadius: "50%", padding: ring ? Math.max(2, s * 0.06) : 0, background: ring ? "linear-gradient(45deg,#F9CE34,#EE2A7B,#6228D7)" : "transparent", flex: "none", ...style }}>
    <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: C.ink, border: ring ? `${Math.max(1.5, s * 0.04)}px solid #fff` : undefined, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <NfpMark s={s * 0.3} c={C.neon} />
    </div>
  </div>
);
/** a viewer account: Instagram's default grey avatar */
export const MeAv: React.FC<{ s: number; style?: P }> = ({ s, style }) => (
  <div style={{ width: s, height: s, borderRadius: "50%", background: "#DBDBDB", overflow: "hidden", position: "relative", flex: "none", ...style }}>
    <div style={{ position: "absolute", left: s * 0.32, top: s * 0.2, width: s * 0.36, height: s * 0.36, borderRadius: "50%", background: "#fff" }} />
    <div style={{ position: "absolute", left: s * 0.16, top: s * 0.62, width: s * 0.68, height: s * 0.6, borderRadius: "50%", background: "#fff" }} />
  </div>
);
