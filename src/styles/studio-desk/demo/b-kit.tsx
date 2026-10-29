// Video 23 · group B kit (S6–S8): cover-cropped clips, dark-world HUD, pixelate filter, IG reel chrome, cursors, small UI atoms.
import React from "react";
import { CLAUDE_ORANGE, CLAUDE_PATH } from "../../test-reel/lib/claude-logo";
import { C, FA, MONO, NUM, UI, clamp, ease, hit, lerp, rnd } from "./lib";
import { Clip, Ico } from "./ui";

type P = React.CSSProperties;
export { CLAUDE_ORANGE };
export const TERRA = "#C6613F"; // claude.ai send-button terracotta
export const CREAM = "#FAF9F5"; // claude.ai background

export const Full: React.FC<{ style?: P; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...style }}>{children}</div>
);
export const ClaudeMark: React.FC<{ s?: number; c?: string; style?: P }> = ({ s = 40, c = CLAUDE_ORANGE, style }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ display: "block", flex: "none", ...style }}><path d={CLAUDE_PATH} fill={c} /></svg>
);

/** a clip cover-cropped into a w×h box with a focus point (fx, fy ∈ 0..1) and extra zoom z */
export const CoverClip: React.FC<{ src: string; t0: number; from?: number; dur?: number; w: number; h: number; vw: number; vh: number; fx?: number; fy?: number; z?: number; style?: P; img?: P }> = ({ src, t0, from = 0, dur = 30, w, h, vw, vh, fx = 0.5, fy = 0.5, z = 1, style, img }) => {
  const s = Math.max(w / vw, h / vh) * z;
  const iw = vw * s, ih = vh * s;
  return (
    <div style={{ position: "absolute", left: -(iw - w) * clamp(fx), top: -(ih - h) * clamp(fy), width: iw, height: ih, ...style }}>
      <Clip src={src} t0={t0} from={from} dur={dur} style={img} />
    </div>
  );
};
/** the same clip frozen on one frame (for holding past the end of a file) */
export const FreezeClip: React.FC<{ src: string; at: number; t: number }> = ({ src, at, t }) => <Clip src={src} t0={t} from={at} dur={1} />;

/** SVG mosaic filter (block size s px); reference it with filter: url(#id) */
export const PixelDef: React.FC<{ id: string; s: number }> = ({ id, s }) => {
  const b = Math.max(2, Math.round(s));
  return (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feFlood x={b / 2 - 1} y={b / 2 - 1} width={2} height={2} />
        <feComposite width={b} height={b} />
        <feTile result="a" />
        <feComposite in="SourceGraphic" in2="a" operator="in" />
        <feMorphology operator="dilate" radius={b / 2} />
      </filter>
    </svg>
  );
};

/** light film grain for the dark world */
export const GrainL: React.FC<{ frame: number; o?: number }> = ({ frame, o = 0.06 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      opacity: o,
      mixBlendMode: "screen",
      pointerEvents: "none",
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' seed='${Math.floor(frame / 2) % 11}'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 .95  0 0 0 0 .9  0 0 0 1.6 -0.35'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
    }}
  />
);

/** floating dust motes + a few soft bokeh discs (dark world, constant motion) */
export const Dust: React.FC<{ t: number; n?: number; o?: number }> = ({ t, n = 46, o = 1 }) => (
  <Full style={{ pointerEvents: "none", opacity: o }}>
    {Array.from({ length: n }, (_, i) => {
      const sp = 14 + rnd(i * 3.1) * 40;
      const x = (rnd(i) * 1180 - 50 + Math.sin(t * 0.5 + i) * 18) % 1180;
      const y = ((rnd(i + 40) * 2000 - t * sp) % 2000 + 2000) % 2000 - 40;
      const s = 1.6 + rnd(i * 7) * 3.6;
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.8 + rnd(i * 5) * 2) + i));
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: s, background: i % 7 === 0 ? "#FFB48A" : "#FFF4E8", opacity: (0.18 + rnd(i * 9) * 0.45) * tw, boxShadow: s > 3.6 ? "0 0 8px rgba(255,220,190,.7)" : undefined }} />;
    })}
    {Array.from({ length: 5 }, (_, i) => {
      const x = rnd(i * 13 + 2) * 1080 + Math.sin(t * 0.3 + i * 2) * 60;
      const y = rnd(i * 17 + 5) * 1600 + 100 + Math.cos(t * 0.25 + i) * 50;
      const r = 70 + rnd(i * 3) * 90;
      return <div key={`b${i}`} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: `radial-gradient(circle, rgba(255,150,90,${0.07 + rnd(i) * 0.05}) 0%, rgba(255,150,90,0) 70%)` }} />;
    })}
  </Full>
);

/** viewfinder corner brackets around a rect */
export const Corners: React.FC<{ x: number; y: number; w: number; h: number; L?: number; c?: string; sw?: number; o?: number; spread?: number }> = ({ x, y, w, h, L = 40, c = "#fff", sw = 3, o = 1, spread = 0 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: o, overflow: "visible", pointerEvents: "none" }}>
    {[[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]].map(([px, py, sx, sy], i) => {
      const ox = px - sx * spread, oy = py - sy * spread;
      return <path key={i} d={`M${ox} ${oy + sy * L} L${ox} ${oy} L${ox + sx * L} ${oy}`} stroke={c} strokeWidth={sw} fill="none" strokeLinecap="square" />;
    })}
  </svg>
);

/** category title for the dark showcase: Latin index line + big Persian word, wiped in from the right */
export const CatTitle: React.FC<{ fa: string; en: string; idx: number; k: number; out?: number; x?: number; y?: number; s?: number; hitK?: number }> = ({ fa, en, idx, k, out = 0, x = 1030, y = 196, s = 104, hitK = 0 }) => {
  if (k <= 0 || out >= 1) return null;
  const wipe = ease.out(clamp(k * 1.25));
  const line = ease.out(clamp(k * 1.6 - 0.3));
  return (
    <div style={{ position: "absolute", right: 1080 - x, top: y, display: "flex", flexDirection: "column", alignItems: "flex-end", opacity: 1 - out, transform: `translateY(${-out * 30}px) scale(${1 + hitK * 0.08})`, transformOrigin: "100% 60%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: line }}>
        <div style={{ width: 80 * line, height: 2, background: C.neon }} />
        <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 24, letterSpacing: 6, color: C.neon, direction: "ltr", whiteSpace: "nowrap" }}>{`0${idx} / 05 — ${en}`}</div>
      </div>
      <div style={{ clipPath: `inset(-20px 0 -20px ${(1 - wipe) * 100}%)`, transform: `translateX(${(1 - wipe) * -40}px)` }}>
        <div style={{ fontFamily: FA, fontWeight: 900, fontSize: s, color: hitK > 0.45 ? C.neon : "#fff", direction: "rtl", lineHeight: 1.25, whiteSpace: "nowrap", wordSpacing: "0.14em", textShadow: "0 6px 40px rgba(0,0,0,.65)" }}>{fa}</div>
      </div>
    </div>
  );
};

/** Persian-safe typing: reveals whole words (letters stay joined), k 0..1 */
export const typedW = (s: string, k: number) => {
  const w = s.split(" ");
  const n = Math.round(w.length * clamp(k));
  return w.slice(0, n).join(" ");
};

/** timecode HH:MM:SS:FF */
export const tc = (sec: number, fps = 24) => {
  const s = Math.max(0, sec);
  const f = Math.floor((s % 1) * fps);
  const p = (n: number) => String(Math.floor(n)).padStart(2, "0");
  return `${p(s / 3600)}:${p((s / 60) % 60)}:${p(s % 60)}:${p(f)}`;
};
/** m:ss */
export const mss = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

/** spinner ring (rotating arc) */
export const Spinner: React.FC<{ s?: number; t: number; c?: string; bg?: string; w?: number }> = ({ s = 30, t, c = C.green, bg = "rgba(0,0,0,.12)", w = 3.5 }) => (
  <svg width={s} height={s} viewBox="0 0 30 30" style={{ display: "block", flex: "none", transform: `rotate(${t * 540}deg)` }}>
    <circle cx={15} cy={15} r={12} stroke={bg} strokeWidth={w} fill="none" />
    <circle cx={15} cy={15} r={12} stroke={c} strokeWidth={w} fill="none" strokeDasharray="22 100" strokeLinecap="round" />
  </svg>
);
/** filled check circle that pops (k 0..1+) */
export const CheckDot: React.FC<{ s?: number; k: number; c?: string }> = ({ s = 30, k, c = C.green }) => (
  <div style={{ width: s, height: s, borderRadius: s, background: c, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k})`, flex: "none" }}>
    <svg width={s * 0.62} height={s * 0.62} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={24} strokeDashoffset={24 * (1 - clamp(k * 1.4 - 0.2))} /></svg>
  </div>
);

/** macOS-style arrow cursor */
export const Cursor: React.FC<{ s?: number; c?: string; stroke?: string; style?: P }> = ({ s = 40, c = "#111", stroke = "#fff", style }) => (
  <svg width={s} height={s * 1.45} viewBox="0 0 20 29" style={{ display: "block", overflow: "visible", filter: "drop-shadow(0 3px 5px rgba(0,0,0,.3))", ...style }}>
    <path d="M1.5 1.5v22.3l5.4-5.2 3.6 8.4 3.6-1.5-3.5-8.3h7.6z" fill={c} stroke={stroke} strokeWidth={1.8} strokeLinejoin="round" />
  </svg>
);

/** iOS-like toggle */
export const Toggle: React.FC<{ on: number; w?: number; c?: string }> = ({ on, w = 64, c = C.ink }) => {
  const h = w * 0.6;
  return (
    <div style={{ width: w, height: h, borderRadius: h, background: on > 0.5 ? c : "#D9D6CE", position: "relative", flex: "none", transition: "none" }}>
      <div style={{ position: "absolute", top: h * 0.1, left: lerp(h * 0.1, w - h * 0.9, clamp(on)), width: h * 0.8, height: h * 0.8, borderRadius: h, background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,.25)" }} />
    </div>
  );
};

/** stamp slam: returns {scale, o, shake} for a stamp landing at t0 */
export const slam = (t: number, t0: number, d = 0.22) => {
  if (t < t0) return { s: 0, o: 0, sh: 0 };
  const k = clamp((t - t0) / d);
  const s = k < 1 ? lerp(2.1, 1, ease.in(k)) : 1 + hit(t, t0 + d, 0.18) * 0.06;
  return { s, o: clamp(k * 3), sh: hit(t, t0 + d, 0.3) };
};
/** small radial burst of short lines (for slams); k 0..1 */
export const Burst: React.FC<{ k: number; r0?: number; r1?: number; n?: number; c?: string; w?: number }> = ({ k, r0 = 60, r1 = 180, n = 12, c = C.neon, w = 5 }) => {
  if (k <= 0 || k >= 1) return null;
  const a = ease.out(k);
  return (
    <svg width={r1 * 2 + 40} height={r1 * 2 + 40} style={{ position: "absolute", left: -(r1 + 20), top: -(r1 + 20), overflow: "visible", opacity: 1 - ease.in(k) }}>
      {Array.from({ length: n }, (_, i) => {
        const an = (i / n) * Math.PI * 2 + 0.2;
        const ra = lerp(r0, r1, a), rb = lerp(r0, r1, Math.min(1, a * 1.35));
        const cx = r1 + 20;
        return <line key={i} x1={cx + Math.cos(an) * ra} y1={cx + Math.sin(an) * ra} x2={cx + Math.cos(an) * rb} y2={cx + Math.sin(an) * rb} stroke={c} strokeWidth={w} strokeLinecap="round" />;
      })}
    </svg>
  );
};

/** impact echo: the stamp's own outline expanding and fading (place inside a relative box) */
export const Echo: React.FC<{ k: number; r?: number; c?: string; w?: number; grow?: number }> = ({ k, r = 20, c = C.neon, w = 4, grow = 0.35 }) => {
  if (k <= 0 || k >= 1) return null;
  return <div style={{ position: "absolute", inset: 0, borderRadius: r, border: `${w}px solid ${c}`, transform: `scale(${1 + ease.out(k) * grow})`, opacity: (1 - k) * 0.9, pointerEvents: "none" }} />;
};
/** expanding circular shockwave centred on its parent origin */
export const Ring: React.FC<{ k: number; r0?: number; r1?: number; c?: string; w?: number }> = ({ k, r0 = 100, r1 = 300, c = C.neon, w = 4 }) => {
  if (k <= 0 || k >= 1) return null;
  const r = lerp(r0, r1, ease.out(k));
  return <div style={{ position: "absolute", left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: "50%", border: `${w * (1 - k) + 1}px solid ${c}`, opacity: 1 - k, pointerEvents: "none" }} />;
};
/** slider "tune" icon (claude.ai tools button) */
export const Tune: React.FC<{ s?: number; c?: string }> = ({ s = 24, c = "#555" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ display: "block" }}>
    {[[6, 9], [12, 15], [18, 7]].map(([y, x], i) => (
      <g key={i}>
        <line x1={3} x2={21} y1={y} y2={y} stroke={c} strokeWidth={1.8} strokeLinecap="round" />
        <circle cx={x} cy={y} r={2.6} fill="#fff" stroke={c} strokeWidth={1.8} />
      </g>
    ))}
  </svg>
);

/** deterministic waveform bars */
export const Wave: React.FC<{ n: number; w: number; h: number; c: string; seed?: number; t?: number; gap?: number; o?: number }> = ({ n, w, h, c, seed = 1, t = 0, gap = 2, o = 1 }) => (
  <div style={{ display: "flex", alignItems: "center", gap, width: w, height: h, opacity: o }}>
    {Array.from({ length: n }, (_, i) => {
      const env = 0.25 + 0.75 * Math.abs(Math.sin(i * 0.37 + seed) * Math.sin(i * 0.11 + seed * 2));
      const v = clamp(env * (0.55 + 0.45 * rnd(i * 3 + seed)) + Math.sin(t * 6 + i) * 0.04, 0.08, 1);
      return <div key={i} style={{ flex: 1, height: h * v, borderRadius: 2, background: c }} />;
    })}
  </div>
);

/** Instagram-reel chrome over a phone screen (screen width sw px) */
export const IgReelUI: React.FC<{ sw: number; t: number; likes: string; comments: string; shares: string; user: string; caption: string; heartT?: number }> = ({ sw, t, likes, comments, shares, user, caption, heartT = -9 }) => {
  const u = sw / 400; // design unit (400-px-wide screen)
  const txt: P = { fontFamily: UI, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,.55)", whiteSpace: "nowrap" };
  const liked = t >= heartT;
  return (
    <Full style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 150 * u, background: "linear-gradient(180deg, rgba(0,0,0,.45), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 260 * u, background: "linear-gradient(0deg, rgba(0,0,0,.6), rgba(0,0,0,0))" }} />
      {/* status bar */}
      <div style={{ ...txt, position: "absolute", left: 30 * u, top: 16 * u, fontSize: 15 * u, fontWeight: 700 }}>9:41</div>
      <div style={{ position: "absolute", right: 26 * u, top: 19 * u, display: "flex", gap: 5 * u, alignItems: "flex-end" }}>
        {[5, 7, 9, 11].map((h, i) => <div key={i} style={{ width: 3 * u, height: h * u, borderRadius: 1, background: "#fff" }} />)}
        <div style={{ width: 22 * u, height: 11 * u, borderRadius: 3 * u, border: `${1.4 * u}px solid #fff`, marginLeft: 4 * u, padding: 1.2 * u }}><div style={{ width: "78%", height: "100%", background: "#fff", borderRadius: 1.5 * u }} /></div>
      </div>
      {/* header */}
      <div style={{ ...txt, position: "absolute", left: 18 * u, top: 52 * u, fontSize: 25 * u, fontWeight: 800, letterSpacing: -0.3 * u }}>Reels</div>
      <div style={{ position: "absolute", right: 18 * u, top: 54 * u }}><Ico n="camera" s={28 * u} c="#fff" w={2} /></div>
      {/* right rail */}
      <div style={{ position: "absolute", right: 10 * u, bottom: 104 * u, display: "flex", flexDirection: "column", alignItems: "center", gap: 17 * u }}>
        {[
          ["heart", likes],
          ["comment", comments],
          ["send", shares],
        ].map(([n, l], i) => (
          <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 * u }}>
            <div style={{ transform: i === 0 ? `scale(${1 + hit(t, heartT, 0.3) * 0.35})` : undefined }}>
              <Ico n={n} s={32 * u} c={i === 0 && liked ? "#FF3040" : "#fff"} w={2} fill={i === 0 && liked} />
            </div>
            <span style={{ ...txt, fontSize: 13 * u, fontWeight: 600 }}>{l}</span>
          </div>
        ))}
        <div style={{ display: "flex", gap: 3 * u, padding: `${6 * u}px 0` }}>{[0, 1, 2].map((i) => <div key={i} style={{ width: 4.5 * u, height: 4.5 * u, borderRadius: 3 * u, background: "#fff" }} />)}</div>
        <div style={{ width: 30 * u, height: 30 * u, borderRadius: 7 * u, border: `${2 * u}px solid #fff`, background: "linear-gradient(135deg,#2a8a7c,#e2b23a)" }} />
      </div>
      {/* user + caption + audio */}
      <div style={{ position: "absolute", left: 16 * u, bottom: 24 * u, width: 300 * u }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 * u }}>
          <div style={{ width: 32 * u, height: 32 * u, borderRadius: 32 * u, background: "linear-gradient(135deg,#e2b23a,#2a8a7c)", border: `${1.5 * u}px solid #fff` }} />
          <span style={{ ...txt, fontSize: 15 * u, fontWeight: 700 }}>{user}</span>
          <span style={{ ...txt, fontSize: 13 * u, fontWeight: 700, border: `${1.2 * u}px solid rgba(255,255,255,.8)`, borderRadius: 8 * u, padding: `${3 * u}px ${9 * u}px` }}>Follow</span>
        </div>
        <div style={{ ...txt, fontSize: 14 * u, fontWeight: 500, marginTop: 9 * u, overflow: "hidden", textOverflow: "ellipsis" }}>{caption}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 * u, marginTop: 8 * u }}>
          <Ico n="music" s={14 * u} c="#fff" w={2.2} />
          <div style={{ width: 170 * u, overflow: "hidden" }}>
            <div style={{ ...txt, fontSize: 13 * u, fontWeight: 500, transform: `translateX(${-((t * 30 * u) % (190 * u))}px)` }}>Original audio · {user} &nbsp;&nbsp;&nbsp; Original audio · {user}</div>
          </div>
        </div>
      </div>
    </Full>
  );
};

/** iPhone-like device (w → h = 2.06·w) with dynamic island and side buttons; children fill the screen */
export const Device: React.FC<{ x: number; y: number; w: number; style?: P; shadow?: string; children?: React.ReactNode }> = ({ x, y, w, style, shadow, children }) => {
  const h = w * 2.06, b = w * 0.032;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, ...style }}>
      {/* side buttons */}
      <div style={{ position: "absolute", left: -w * 0.012, top: h * 0.2, width: w * 0.014, height: h * 0.06, borderRadius: 3, background: "#2B2B30" }} />
      <div style={{ position: "absolute", left: -w * 0.012, top: h * 0.29, width: w * 0.014, height: h * 0.1, borderRadius: 3, background: "#2B2B30" }} />
      <div style={{ position: "absolute", right: -w * 0.012, top: h * 0.26, width: w * 0.014, height: h * 0.13, borderRadius: 3, background: "#2B2B30" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: w * 0.15, background: "linear-gradient(145deg,#3A3A40,#121215 40%,#26262B)", boxShadow: shadow ?? "0 50px 100px rgba(20,18,30,.32), 0 18px 40px rgba(20,18,30,.18)", padding: b }}>
        <div style={{ position: "absolute", inset: b * 0.45, borderRadius: w * 0.14, background: "#050506" }} />
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: w * 0.125, overflow: "hidden", background: "#000" }}>
          {children}
          <div style={{ position: "absolute", left: "50%", top: w * 0.028, width: w * 0.29, height: w * 0.082, marginLeft: -w * 0.145, borderRadius: 99, background: "#000" }} />
          {/* glass reflection */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,.10) 0%, rgba(255,255,255,0) 32%)", pointerEvents: "none" }} />
        </div>
      </div>
    </div>
  );
};

/** a 4-point glint star */
export const Glint: React.FC<{ s: number; c?: string; o?: number; rot?: number }> = ({ s, c = C.green, o = 1, rot = 0 }) => (
  <svg width={s} height={s} viewBox="-10 -10 20 20" style={{ display: "block", opacity: o, transform: `rotate(${rot}deg)`, overflow: "visible" }}>
    <path d="M0 -10 C0.8 -2 2 -0.8 10 0 C2 0.8 0.8 2 0 10 C-0.8 2 -2 0.8 -10 0 C-2 -0.8 -0.8 -2 0 -10Z" fill={c} />
  </svg>
);

export const fontsB = { FA, NUM, UI, MONO };
