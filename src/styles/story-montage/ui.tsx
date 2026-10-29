// Kinetic type + world props for Story Montage.
import React from "react";
import { clamp, easeBack, easeOut, F, rnd } from "./theme";

/* ═════════ kinetic type ═════════ */
export type Anim = "pop" | "rise" | "blur" | "slam" | "type" | "write" | "fade" | "track" | "drop";
export type WdProps = {
  text: string; t: number; at: number; x: number; y: number; size: number; font?: string; weight?: number; color?: string; anim?: Anim;
  anchor?: "left" | "center" | "right"; ls?: number; dur?: number; style?: React.CSSProperties; out?: number; italic?: boolean; glow?: string;
};
/** One absolutely positioned word/phrase that animates in at `at` (seconds). */
export const Wd: React.FC<WdProps> = ({ text, t, at, x, y, size, font = F.ui, weight = 600, color = "#fff", anim = "rise", anchor = "left", ls = 0, dur = 0.3, style, out, italic, glow }) => {
  const p = clamp((t - at) / dur);
  if (p <= 0) return null;
  const e = easeOut(p), b = easeBack(p);
  const o = out === undefined ? 1 : 1 - clamp((t - out) / 0.2);
  let tr = "", fl = "", op = 1, clip: string | undefined, txt = text, spacing = ls;
  if (anim === "pop") { tr = `scale(${0.5 + 0.5 * b})`; op = clamp(p * 3); }
  if (anim === "rise") { tr = `translateY(${(1 - e) * size * 0.6}px)`; fl = `blur(${(1 - e) * 8}px)`; op = e; }
  if (anim === "blur") { tr = `scale(${1.25 - 0.25 * e})`; fl = `blur(${(1 - e) * 18}px)`; op = e; }
  if (anim === "slam") { tr = `scale(${2.4 - 1.4 * e})`; op = clamp(p * 4); fl = `blur(${(1 - e) * 6}px)`; }
  if (anim === "drop") { tr = `translateY(${-(1 - b) * size * 1.2}px) rotate(${(1 - e) * -8}deg)`; op = clamp(p * 3); }
  if (anim === "fade") op = e;
  if (anim === "type") txt = text.slice(0, Math.ceil(text.length * p));
  if (anim === "write") clip = `inset(-20% ${(1 - e) * 100}% -20% -5%)`;
  if (anim === "track") { spacing = ls + (1 - e) * 0.6; op = e; fl = `blur(${(1 - e) * 6}px)`; }
  const ax = anchor === "center" ? "-50%" : anchor === "right" ? "-100%" : "0";
  return (
    <div style={{ position: "absolute", left: x, top: y, whiteSpace: "nowrap", fontFamily: font, fontWeight: weight, fontSize: size, lineHeight: 1, color, letterSpacing: `${spacing}em`, fontStyle: italic ? "italic" : undefined, opacity: op * o, transform: `translateX(${ax}) ${tr}`, transformOrigin: anchor === "center" ? "50% 60%" : anchor === "right" ? "100% 60%" : "0 60%", filter: fl || undefined, clipPath: clip, textShadow: glow, ...style }}>
      {txt}
    </div>
  );
};

/** Draw-on stroke helper: returns props for an SVG path (pathLength=1). */
export const draw = (p: number) => ({ pathLength: 1, strokeDasharray: "1", strokeDashoffset: 1 - clamp(p) });

/* ═════════ blueprint table ═════════ */
export const BpDeco: React.FC<{ w: number; h: number; t: number }> = ({ w, h, t }) => (
  <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0 }}>
    <defs>
      <pattern id="bp-grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0 H0 V60" fill="none" stroke="rgba(255,255,255,.035)" strokeWidth="1.5" /></pattern>
      <radialGradient id="bp-vig" cx="50%" cy="50%" r="70%"><stop offset=".4" stopColor="#3a3a3c" /><stop offset="1" stopColor="#161618" /></radialGradient>
    </defs>
    <rect width={w} height={h} fill="url(#bp-vig)" />
    <rect width={w} height={h} fill="url(#bp-grid)" />
    {/* rulers + brackets every screen */}
    {Array.from({ length: Math.ceil(h / 900) }, (_, s) => {
      const y0 = s * 900 + 120;
      return (
        <g key={s} stroke="rgba(255,255,255,.55)" strokeWidth="2" fill="none">
          <path d={`M40 ${y0 + 60} V${y0} H100`} />
          <path d={`M${w - 40} ${y0 + 60} V${y0} H${w - 100}`} />
          <path d={`M40 ${y0 + 700} V${y0 + 760} H100`} />
          {Array.from({ length: 26 }, (_, i) => <line key={i} x1={w - 60} x2={w - 60 - (i % 5 ? 10 : 22)} y1={y0 + 150 + i * 14} y2={y0 + 150 + i * 14} strokeWidth="1.5" />)}
          {Array.from({ length: 14 }, (_, i) => <line key={`b${i}`} x1={70} x2={70 + (i % 4 ? 8 : 18)} y1={y0 + 420 + i * 10} y2={y0 + 420 + i * 10} strokeWidth="1.5" />)}
          <circle cx={w - 90} cy={y0 + 30} r="4" fill="rgba(255,255,255,.7)" stroke="none" opacity={0.5 + 0.5 * Math.sin(t * 5 + s)} />
        </g>
      );
    })}
  </svg>
);
/** Translucent grid square (the "measurement" overlay that slides over the phone). */
export const GridBox: React.FC<{ x: number; y: number; w: number; h: number; o?: number; cell?: number; rot?: number }> = ({ x, y, w, h, o = 1, cell = 40, rot = 0 }) => (
  <svg width={w} height={h} style={{ position: "absolute", left: x, top: y, opacity: o, transform: `rotate(${rot}deg)` }}>
    <rect width={w} height={h} fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.7)" strokeWidth="3" />
    {Array.from({ length: Math.floor(w / cell) }, (_, i) => <line key={i} x1={(i + 1) * cell} x2={(i + 1) * cell} y1={0} y2={h} stroke="rgba(255,255,255,.45)" strokeWidth="1.5" />)}
    {Array.from({ length: Math.floor(h / cell) }, (_, i) => <line key={`h${i}`} y1={(i + 1) * cell} y2={(i + 1) * cell} x1={0} x2={w} stroke="rgba(255,255,255,.45)" strokeWidth="1.5" />)}
  </svg>
);
/** Callout line with elbow + dot, drawing on. */
export const Callout: React.FC<{ pts: [number, number][]; p: number; color?: string }> = ({ pts, p, color = "rgba(255,255,255,.85)" }) => {
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const [ex, ey] = pts[0];
  return (
    <svg width="4000" height="4000" style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <path d={d} fill="none" stroke={color} strokeWidth="3" {...draw(p)} />
      <circle cx={ex} cy={ey} r={7 * clamp(p * 4)} fill={color} />
    </svg>
  );
};

/* ═════════ lock screen ═════════ */
export const LockTop: React.FC<{ t: number }> = ({ t }) => (
  <>
    <div style={{ position: "absolute", left: 0, width: 1080, top: 150, textAlign: "center", fontFamily: F.ui, fontWeight: 500, fontSize: 40, color: "rgba(255,255,255,.9)" }}>Monday, June 10</div>
    <div style={{ position: "absolute", left: 0, width: 1080, top: 185, textAlign: "center", fontFamily: F.ui, fontWeight: 700, fontSize: 280, letterSpacing: -8, color: "#b9f7d8", textShadow: "0 8px 40px rgba(0,0,0,.25)" }}>9:41</div>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ position: "absolute", left: 230 + i * 230, top: 520, width: 160, height: 160, borderRadius: 80, background: "rgba(255,255,255,.18)", backdropFilter: "blur(10px)", display: "grid", placeItems: "center", color: "#fff", fontFamily: F.ui, fontWeight: 600, fontSize: i === 0 ? 50 : 30 }}>
        {i === 0 && <svg width="160" height="160" style={{ position: "absolute" }}><circle cx="80" cy="80" r="62" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="10" /><circle cx="80" cy="80" r="62" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${390 * 0.72} 390`} transform="rotate(-90 80 80)" /></svg>}
        {i === 0 ? "72" : i === 1 ? <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7 V12 L 15 14" strokeLinecap="round" /></svg> : <span style={{ textAlign: "center", lineHeight: 1.1 }}>9:41<br /><span style={{ fontSize: 22 }}>AM</span></span>}
      </div>
    ))}
    <div style={{ position: "absolute", left: 90, bottom: 110, width: 110, height: 110, borderRadius: 55, background: "rgba(0,0,0,.25)", backdropFilter: "blur(8px)" }} />
    <div style={{ position: "absolute", right: 90, bottom: 110, width: 110, height: 110, borderRadius: 55, background: "rgba(0,0,0,.25)", backdropFilter: "blur(8px)", opacity: 0.7 + 0.3 * Math.sin(t * 3) }} />
  </>
);
/** iOS-style glass notification card. */
export const Notif: React.FC<{ x: number; y: number; w: number; a: number; title?: string; body: React.ReactNode; scale?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, a, title = "Notification", body, scale = 1, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, borderRadius: 44, background: "rgba(245,240,255,.72)", backdropFilter: "blur(24px)", boxShadow: "0 30px 60px rgba(40,0,80,.25)", padding: "30px 34px", opacity: clamp(a * 2), transform: `translateY(${(1 - easeOut(clamp(a))) * -80}px) scale(${scale})`, transformOrigin: "50% 0", fontFamily: F.ui, color: "#111", ...style }}>
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <div style={{ width: 84, height: 84, borderRadius: 20, background: "#111", display: "grid", placeItems: "center", color: "#fff", fontSize: 40, fontWeight: 800 }}>✦</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 40, fontWeight: 700 }}>{title}</div>
          <div style={{ fontSize: 26, color: "rgba(0,0,0,.45)" }}>34m ago</div>
        </div>
        <div style={{ fontSize: 36, color: "rgba(0,0,0,.8)", marginTop: 4, whiteSpace: "nowrap" }}>{body}</div>
      </div>
    </div>
    {children}
  </div>
);
export const Ripple: React.FC<{ x: number; y: number; t: number; at: number; color?: string; r?: number }> = ({ x, y, t, at, color = "rgba(255,255,255,.9)", r = 70 }) => {
  const p = clamp((t - at) / 0.45);
  if (p <= 0 || p >= 1) return null;
  return (
    <>
      <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: color, opacity: 0.6 * (1 - p), transform: `scale(${0.4 + 0.3 * p})` }} />
      <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `4px solid ${color}`, opacity: 1 - p, transform: `scale(${0.5 + 1.4 * easeOut(p)})` }} />
      {Array.from({ length: 8 }, (_, i) => {
        const an = (i / 8) * Math.PI * 2, d = r * (0.8 + 1.1 * easeOut(p));
        return <div key={i} style={{ position: "absolute", left: x + Math.cos(an) * d - 3, top: y + Math.sin(an) * d - 14, width: 6, height: 28, borderRadius: 3, background: color, opacity: 1 - p, transform: `rotate(${(an * 180) / Math.PI + 90}deg)` }} />;
      })}
    </>
  );
};

/** Line-drawn person with circuit traces growing out of it ("I challenge the system"). */
export const CircuitFigure: React.FC<{ p: number; t: number; w?: number; h?: number }> = ({ p, t, w = 900, h = 640 }) => {
  const traces = [
    [[440, 220], [300, 220], [260, 180], [120, 180]], [[440, 300], [340, 300], [300, 340], [180, 340], [150, 310], [60, 310]],
    [[520, 220], [640, 220], [680, 170], [820, 170]], [[520, 300], [700, 300], [740, 350], [860, 350]], [[480, 470], [480, 540], [300, 540], [260, 590]],
    [[500, 470], [640, 470], [680, 520], [820, 520]], [[440, 390], [240, 390], [200, 440], [80, 440]],
  ];
  return (
    <svg width={w} height={h} viewBox="0 0 900 640">
      <g fill="none" stroke="#fff" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        <circle cx="480" cy="110" r="46" {...draw(p * 2)} />
        <path d="M430 180 H530 Q 560 180 560 212 V420 H532 V620 H490 V440 H470 V620 H428 V420 H400 V212 Q 400 180 430 180 Z" {...draw(p * 1.6)} />
        {traces.map((tr, i) => {
          const q = clamp(p * 2.2 - 0.5 - i * 0.08);
          const d = tr.map(([x, y], k) => `${k ? "L" : "M"}${x} ${y}`).join(" ");
          const end = tr[tr.length - 1];
          return (
            <g key={i}>
              <path d={d} {...draw(q)} strokeWidth="3" />
              {tr.slice(1).map(([x, y], k) => <circle key={k} cx={x} cy={y} r={7} fill="#fff" stroke="none" opacity={q > (k + 1) / tr.length ? 1 : 0} />)}
              {q >= 1 && <circle cx={end[0]} cy={end[1]} r={14 + Math.sin(t * 6 + i) * 4} stroke="#fff" strokeWidth="2" opacity=".5" />}
            </g>
          );
        })}
      </g>
    </svg>
  );
};

/* ═════════ viewfinder ═════════ */
export const Viewfinder: React.FC<{ t: number; w?: number; h?: number }> = ({ t, w = 1080, h = 1920 }) => (
  <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0 }}>
    <g stroke="#e8e8e8" strokeWidth="10" fill="none" strokeLinecap="square">
      <path d={`M60 250 V120 H190`} /><path d={`M${w - 60} 250 V120 H${w - 190}`} />
      <path d={`M60 ${h - 250} V${h - 120} H190`} /><path d={`M${w - 60} ${h - 250} V${h - 120} H${w - 190}`} />
    </g>
    <circle cx={w - 140} cy={180} r="16" fill="#ff2b2b" opacity={Math.floor(t * 2.2) % 2 ? 1 : 0.15} />
    <text x={w - 180} y={193} textAnchor="end" fontFamily={F.ui} fontWeight="600" fontSize="42" fill="#eee">REC</text>
    <g stroke="#ddd" strokeWidth="3" fill="none">
      <rect x="200" y="140" width="200" height="200" />
      {[1, 2].map((i) => <React.Fragment key={i}><line x1={200 + i * 66} x2={200 + i * 66} y1="140" y2="340" /><line y1={140 + i * 66} y2={140 + i * 66} x1="200" x2="400" /></React.Fragment>)}
      <rect x="100" y="150" width="34" height="80" rx="6" />
      <rect x="106" y={150 + 80 * (1 - 0.7)} width="22" height={80 * 0.7 - 6} fill="#ddd" />
    </g>
    <text x="100" y="640" fontFamily={F.ui} fontWeight="600" fontSize="30" fill="#ddd" transform="rotate(-90 100 640)">TIME:</text>
    <text x="100" y="1560" fontFamily={F.ui} fontWeight="600" fontSize="30" fill="#ddd" transform="rotate(-90 100 1560)">DATE:</text>
    <line x1="100" y1="660" x2="100" y2="1300" stroke="#bbb" strokeWidth="2" />
    <g fill="#ccc">
      {Array.from({ length: 40 }, (_, i) => <rect key={i} x={220 + i * 17} y={h - 220 - (i % 5 === 0 ? 20 : 8)} width="3" height={i % 5 === 0 ? 20 : 8} />)}
      <rect x={220 + ((t * 120) % 680)} y={h - 250} width="4" height="46" fill="#ff2b2b" />
    </g>
    <text x="220" y={h - 170} fontFamily={F.ui} fontSize="20" fill="#bbb" letterSpacing="4">ISO 800   F/1.8   4K 60   {`00:00:${String(Math.floor(t * 10) % 60).padStart(2, "0")}`}</text>
    <g stroke="#ddd" strokeWidth="3">
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={w - 160} x2={w - 160 + (i === 4 ? 40 : 20)} y1={760 + i * 34} y2={760 + i * 34} />)}
      <line x1={w - 160} x2={w - 160} y1="760" y2={760 + 8 * 34} />
    </g>
  </svg>
);

/* ═════════ identity rings ═════════ */
/** Glossy apple-fruit silhouette (not a brand logo). */
export const Apple: React.FC<{ s: number; color?: string; glow?: number }> = ({ s, color = "#fff", glow = 0 }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={{ filter: glow ? `drop-shadow(0 0 ${glow}px rgba(255,255,255,.9))` : undefined }}>
    <path d="M50 30 C 38 22, 16 24, 14 50 C 12 74, 30 94, 42 92 C 46 91, 48 89, 50 89 C 52 89, 54 91, 58 92 C 70 94, 88 74, 86 50 C 84 24, 62 22, 50 30 Z" fill={color} />
    <path d="M51 28 C 50 18, 55 10, 64 6 C 64 16, 58 24, 51 28 Z" fill={color} />
  </svg>
);
export const Rings: React.FC<{ t: number; a: number; r0?: number; n?: number }> = ({ t, a, r0 = 190, n = 6 }) => (
  <svg width="1400" height="1400" viewBox="-700 -700 1400 1400" style={{ position: "absolute", left: -700, top: -700, overflow: "visible", opacity: a }}>
    <defs><radialGradient id="rg-core"><stop offset="0" stopColor="#8a8a90" /><stop offset=".7" stopColor="#3a3a40" /><stop offset="1" stopColor="#1a1a1e" /></radialGradient></defs>
    {Array.from({ length: n }, (_, i) => {
      const ph = (t * 0.55 + i / n) % 1;
      const r = r0 + ph * 420;
      return <circle key={i} r={r} fill="none" stroke="#fff" strokeWidth={2.5 - ph * 1.5} opacity={(1 - ph) * 0.55} />;
    })}
    <circle r={r0 + 26} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2" />
    <circle r={r0} fill="url(#rg-core)" stroke="rgba(255,255,255,.6)" strokeWidth="3" />
  </svg>
);

/* ═════════ chalk ═════════ */
export const ChalkDefs: React.FC = () => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
    <filter id="chalky" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="3" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3" result="d" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.0 1.55" result="holes" />
      <feComposite in="d" in2="holes" operator="in" />
    </filter>
  </svg>
);
/** Chalk dust puff that follows the writing edge. */
export const ChalkDust: React.FC<{ x: number; y: number; t: number; at: number; dur: number; w: number }> = ({ x, y, t, at, dur, w }) => {
  const p = (t - at) / dur;
  if (p < 0 || p > 1.3) return null;
  const hx = x + w * Math.min(1, p);
  return (
    <>
      {Array.from({ length: 10 }, (_, i) => {
        const age = ((t * 7 + i * 0.37) % 1);
        return <div key={i} style={{ position: "absolute", left: hx - 10 + rnd(i) * 30 - age * 20, top: y + rnd(i + 5) * 60 + age * 50, width: 6, height: 6, borderRadius: 3, background: "rgba(240,245,235,.8)", opacity: (1 - age) * (p < 1 ? 0.8 : 1.3 - p) }} />;
      })}
    </>
  );
};

/* ═════════ search + selection + files ═════════ */
export const SearchBar: React.FC<{ x: number; y: number; w: number; text: string; a: number; caret?: boolean; t: number }> = ({ x, y, w, text, a, caret = true, t }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: 104, borderRadius: 52, background: "#fff", boxShadow: "0 20px 50px rgba(0,0,0,.18)", display: "flex", alignItems: "center", gap: 20, padding: "0 32px", fontFamily: F.ui, fontSize: 40, color: "#222", opacity: clamp(a * 2), transform: `scale(${0.8 + 0.2 * easeBack(clamp(a))})` }}>
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.6"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 L 21 21" strokeLinecap="round" /></svg>
    <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden" }}>{text}{caret && Math.floor(t * 3) % 2 === 0 && <span style={{ color: "#3b6cff" }}>|</span>}</span>
    <svg width="36" height="44" viewBox="0 0 24 30" fill="#3b6cff"><rect x="7" y="2" width="10" height="17" rx="5" /><path d="M3 14 C 3 21, 21 21, 21 14" stroke="#3b6cff" strokeWidth="2.4" fill="none" /><rect x="11" y="21" width="2" height="6" /></svg>
    <div style={{ width: 46, height: 46, borderRadius: 12, border: "4px solid #3b6cff", position: "relative" }}><div style={{ position: "absolute", left: 10, top: 10, width: 18, height: 18, borderRadius: 9, background: "#ff5a4f" }} /></div>
  </div>
);
/** Text-selection highlight with blue handles. */
export const Select: React.FC<{ x: number; y: number; w: number; h: number; p: number }> = ({ x, y, w, h, p }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w * easeOut(clamp(p)), height: h, background: "rgba(59,108,255,.2)", borderLeft: "4px solid #3b6cff", borderRight: p > 0.95 ? "4px solid #3b6cff" : undefined }}>
    <div style={{ position: "absolute", left: -12, top: -18, width: 20, height: 20, borderRadius: 10, background: "#3b6cff" }} />
    {p > 0.95 && <div style={{ position: "absolute", right: -12, bottom: -18, width: 20, height: 20, borderRadius: 10, background: "#3b6cff" }} />}
  </div>
);
/** Generic project-file icon (document with an extension badge). */
export const FileIcon: React.FC<{ s?: number; label?: string; color?: string }> = ({ s = 130, label = "AEP", color = "#2b1a8f" }) => (
  <svg width={s} height={s * 1.2} viewBox="0 0 100 120" style={{ filter: "drop-shadow(0 14px 16px rgba(20,10,80,.3))" }}>
    <path d="M12 4 H64 L88 28 V112 Q 88 116 84 116 H12 Q 8 116 8 112 V8 Q 8 4 12 4 Z" fill="#fff" />
    <path d="M64 4 V24 Q 64 28 68 28 H88 Z" fill="#dcd8f5" />
    <rect x="16" y="46" width="68" height="46" rx="12" fill={color} />
    <text x="50" y="78" textAnchor="middle" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="22" fill="#b8a8ff">{label}</text>
  </svg>
);

/* ═════════ glossy 3D app tiles (editor-tool icons, no brand marks) ═════════ */
export type TileGlyph = "keyframe" | "layers" | "pen" | "play" | "aep" | "wave";
const GLYPH: Record<TileGlyph, React.ReactNode> = {
  keyframe: <path d="M50 22 L 78 50 L 50 78 L 22 50 Z" fill="none" stroke="#fff" strokeWidth="7" strokeLinejoin="round" />,
  layers: <g fill="none" stroke="#fff" strokeWidth="6" strokeLinejoin="round"><path d="M50 22 L 80 38 L 50 54 L 20 38 Z" /><path d="M20 52 L 50 68 L 80 52" /><path d="M20 66 L 50 82 L 80 66" /></g>,
  pen: <g fill="none" stroke="#fff" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round"><path d="M50 20 L 70 58 L 50 80 L 30 58 Z" /><path d="M50 20 V 52" /><circle cx="50" cy="58" r="5" fill="#fff" /></g>,
  play: <path d="M40 30 L 72 50 L 40 70 Z" fill="#fff" />,
  aep: <text x="50" y="62" textAnchor="middle" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="30" fill="#fff" letterSpacing="1">AEP</text>,
  wave: <g stroke="#fff" strokeWidth="6" strokeLinecap="round">{[28, 39, 50, 61, 72].map((x, i) => <line key={x} x1={x} x2={x} y1={50 - [8, 18, 26, 16, 10][i]} y2={50 + [8, 18, 26, 16, 10][i]} />)}</g>,
};
export const AppTile: React.FC<{ s?: number; glyph: TileGlyph; hue?: [string, string]; style?: React.CSSProperties }> = ({ s = 150, glyph, hue = ["#5b45ff", "#1c128a"], style }) => (
  <div style={{ position: "relative", width: s, height: s, borderRadius: s * 0.26, background: `linear-gradient(145deg, ${hue[0]}, ${hue[1]})`, boxShadow: `0 ${s * 0.07}px 0 ${hue[1]}cc, 0 ${s * 0.22}px ${s * 0.3}px rgba(20,12,90,.35), inset 0 ${s * 0.03}px ${s * 0.02}px rgba(255,255,255,.45), inset 0 -${s * 0.04}px ${s * 0.06}px rgba(0,0,0,.25)`, ...style }}>
    <div style={{ position: "absolute", inset: s * 0.06, borderRadius: s * 0.2, border: `${Math.max(1.5, s * 0.012)}px solid rgba(255,255,255,.22)` }} />
    <div style={{ position: "absolute", left: s * 0.08, top: s * 0.05, width: s * 0.84, height: s * 0.42, borderRadius: `${s * 0.2}px ${s * 0.2}px ${s * 0.5}px ${s * 0.5}px`, background: "linear-gradient(180deg, rgba(255,255,255,.35), rgba(255,255,255,0))" }} />
    <svg width={s} height={s} viewBox="0 0 100 100" style={{ position: "absolute", left: 0, top: 0 }}>{GLYPH[glyph]}</svg>
  </div>
);

/** Design-tool selection frame with 8 handles + size label (draws on with p). */
export const SelFrame: React.FC<{ x: number; y: number; w: number; h: number; p: number; label?: string; color?: string }> = ({ x, y, w, h, p, label, color = "#2f6bff" }) => {
  if (p <= 0) return null;
  const e = easeOut(clamp(p));
  const hs = [[0, 0], [0.5, 0], [1, 0], [1, 0.5], [1, 1], [0.5, 1], [0, 1], [0, 0.5]];
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, pointerEvents: "none" }}>
      <svg width={w} height={h} style={{ position: "absolute", overflow: "visible" }}><rect x="0" y="0" width={w} height={h} fill="none" stroke={color} strokeWidth="3" {...draw(e)} /></svg>
      {hs.map(([hx, hy], i) => (
        <div key={i} style={{ position: "absolute", left: hx * w - 9, top: hy * h - 9, width: 18, height: 18, background: "#fff", border: `3px solid ${color}`, borderRadius: 3, transform: `scale(${clamp(p * 3 - i * 0.2)})` }} />
      ))}
      {label && <div style={{ position: "absolute", left: w / 2, top: h + 22, transform: `translateX(-50%) scale(${clamp(p * 2 - 0.6)})`, background: color, color: "#fff", fontFamily: F.ui, fontWeight: 600, fontSize: 24, padding: "5px 14px", borderRadius: 8, whiteSpace: "nowrap" }}>{label}</div>}
    </div>
  );
};
