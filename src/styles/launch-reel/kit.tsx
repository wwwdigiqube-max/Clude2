import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../../fonts";
import { A, clamp, easeBack, easeOut, fa, FONT_UI, Mode, ramp, rnd, T, V } from "./theme";

/* ───────── motion helpers ───────── */
/** Gentle idle float for any element (px / deg). */
export const float = (f: number, seed: number, amp = 14) => ({
  x: Math.sin(f / 37 + seed * 1.7) * amp * 0.6,
  y: Math.sin(f / 29 + seed * 2.3) * amp,
  r: Math.sin(f / 43 + seed) * amp * 0.12,
});
/** Pop-in 0→1 with overshoot, starting at frame `at`. */
export const pop = (f: number, at: number, len = 12) => ramp(f, at, at + len, easeBack);
/** Persian number with Persian decimal separator. */
export const faDec = (n: number, d = 1) => fa(n.toFixed(d)).replace(".", "٫");

/* ───────── backdrop ───────── */
/** Living gradient-mesh backdrop: drifting colour blobs + dot grid + vignette. `pulse` (0..1, music envelope) makes the glow breathe. */
export const Backdrop: React.FC<{ mode: Mode; f: number; pulse?: number; tint?: string; tint2?: string }> = ({ mode, f, pulse = 0, tint = A.violet, tint2 = A.mint }) => {
  const t = T[mode];
  const k = mode === "dark" ? 1 : 0.55;
  const blob = (x: number, y: number, r: number, c: string, o: number) => (
    <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: `radial-gradient(circle, ${c} 0%, transparent 68%)`, opacity: o * k * (0.8 + pulse * 0.45), transform: `scale(${1 + pulse * 0.08})` }} />
  );
  return (
    <AbsoluteFill style={{ background: `linear-gradient(170deg, ${t.bg} 0%, ${t.bg2} 100%)`, overflow: "hidden" }}>
      {blob(V.W * 0.2 + Math.sin(f / 70) * 120, V.H * 0.18 + Math.cos(f / 90) * 90, 620, tint, 0.55)}
      {blob(V.W * 0.85 + Math.cos(f / 80) * 110, V.H * 0.55 + Math.sin(f / 65) * 140, 700, tint2, 0.4)}
      {blob(V.W * 0.35 + Math.sin(f / 95 + 2) * 150, V.H * 0.92, 560, A.blue, 0.35)}
      <svg width={V.W} height={V.H} style={{ position: "absolute" }}>
        <defs>
          <pattern id={`lr-dot-${mode}`} width="36" height="36" patternUnits="userSpaceOnUse" patternTransform={`translate(0 ${(-f * 0.4) % 36})`}>
            <circle cx="18" cy="18" r="1.8" fill={t.dot} />
          </pattern>
          <radialGradient id={`lr-vig-${mode}`} cx="50%" cy="45%" r="75%">
            <stop offset="0.6" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity={mode === "dark" ? 0.55 : 0.08} />
          </radialGradient>
        </defs>
        <rect width={V.W} height={V.H} fill={`url(#lr-dot-${mode})`} />
        <rect width={V.W} height={V.H} fill={`url(#lr-vig-${mode})`} />
      </svg>
    </AbsoluteFill>
  );
};

/* ───────── transitions ───────── */
/** Incoming scene: rounded-rect iris from the centre (p 0→1). Put the whole scene inside. */
export const ClipReveal: React.FC<{ p: number; children: React.ReactNode }> = ({ p, children }) => {
  const e = easeOut(clamp(p));
  const iy = (1 - e) * 46, ix = (1 - e) * 40;
  return (
    <AbsoluteFill style={{ clipPath: e >= 1 ? undefined : `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${80 * (1 - e) + 8}px)`, transform: `scale(${1.08 - 0.08 * e})` }}>
      {children}
    </AbsoluteFill>
  );
};
/** Outgoing scene style (p 0→1 while the next one reveals): sinks back and dims — old out, then new in. */
export const exitStyle = (p: number): React.CSSProperties =>
  p <= 0 ? {} : { transform: `scale(${1 - 0.08 * easeOut(p)}) translateY(${-50 * easeOut(p)}px)`, filter: `brightness(${1 - 0.5 * p}) blur(${p * 6}px)` };

/* ───────── typography ───────── */
/**
 * Kinetic headline: words rise out of blur one by one (RTL). `accent` = word indices drawn on a violet pill that wipes in.
 * Keep it readable: ≥0.3s per word on screen after it lands.
 */
export const Headline: React.FC<{
  text: string; f: number; at: number; mode: Mode; y: number; size?: number; accent?: number[]; stagger?: number; x?: number; w?: number; color?: string; accentColor?: string; font?: string; out?: number;
}> = ({ text, f, at, mode, y, size = 118, accent = [], stagger = 4, x = 60, w = V.W - 120, color, accentColor = A.violet, font = FONT_NUM, out }) => {
  const words = text.split(" ");
  const gone = out === undefined ? 0 : ramp(f, out, out + 10);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, direction: "rtl", textAlign: "center", fontFamily: font, fontSize: size, lineHeight: 1.25, color: color ?? T[mode].text, opacity: 1 - gone, transform: `translateY(${-gone * 40}px)` }}>
      {words.map((wd, i) => {
        const p = ramp(f, at + i * stagger, at + i * stagger + 12, easeOut);
        const isA = accent.includes(i);
        const pill = ramp(f, at + i * stagger + 5, at + i * stagger + 15, easeOut);
        return (
          <span key={i} style={{ display: "inline-block", margin: `0 ${size * 0.12}px`, opacity: p, transform: `translateY(${(1 - p) * size * 0.55}px)`, filter: `blur(${(1 - p) * 10}px)`, position: "relative", color: isA ? "#fff" : undefined }}>
            {isA && <span style={{ position: "absolute", left: -size * 0.14, right: -size * 0.14, top: size * 0.12, bottom: size * 0.02, borderRadius: size * 0.22, background: `linear-gradient(135deg, ${accentColor}, ${A.violet2})`, transform: `scaleX(${pill})`, transformOrigin: "right", boxShadow: `0 ${size * 0.15}px ${size * 0.4}px ${accentColor}55`, zIndex: -1 }} />}
            {wd}
          </span>
        );
      })}
    </div>
  );
};

/** Small caps-style label above a headline. */
export const Kicker: React.FC<{ text: string; a: number; mode: Mode; y: number; color?: string }> = ({ text, a, mode, y, color = A.violet }) => (
  <div style={{ position: "absolute", left: 0, width: V.W, top: y, textAlign: "center", opacity: a, transform: `translateY(${(1 - a) * 20}px)` }}>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 14, direction: "rtl", padding: "12px 30px", borderRadius: 99, background: T[mode].card, border: `1.5px solid ${T[mode].cardLine}`, fontFamily: FONT_TEXT, fontSize: 36, color }}>
      <span style={{ width: 14, height: 14, borderRadius: 7, background: color, boxShadow: `0 0 18px ${color}` }} />
      {text}
    </span>
  </div>
);

/* ───────── glossy 3D tokens ───────── */
export type TokenKind = "btc" | "usd" | "gold" | "index" | "eth";
/** Glossy floating market token. Wobbles in 3D (CSS perspective). s = diameter px. */
export const Token: React.FC<{ kind: TokenKind; s?: number; f: number; seed?: number; style?: React.CSSProperties }> = ({ kind, s = 170, f, seed = 0, style }) => {
  const wob = Math.sin(f / 22 + seed * 3) * 32;
  const id = `tk-${kind}-${seed}`;
  const coin = (c1: string, c2: string, c3: string, glyph: string, gs = 58) => (
    <svg viewBox="-64 -64 128 128" width={s} height={s}>
      <defs>
        <radialGradient id={`${id}-b`} cx="35%" cy="28%" r="80%"><stop offset="0" stopColor={c1} /><stop offset=".55" stopColor={c2} /><stop offset="1" stopColor={c3} /></radialGradient>
        <linearGradient id={`${id}-r`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".85" /><stop offset=".5" stopColor={c2} /><stop offset="1" stopColor={c3} /></linearGradient>
      </defs>
      <circle cx="5" cy="6" r="56" fill={c3} />
      <circle r="56" fill={`url(#${id}-b)`} stroke={`url(#${id}-r)`} strokeWidth="6" />
      <circle r="42" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="2.5" />
      <text y={gs * 0.36} textAnchor="middle" fontFamily={FONT_UI} fontWeight="800" fontSize={gs} fill="#fff" style={{ filter: "drop-shadow(0 3px 0 rgba(0,0,0,.18))" }}>{glyph}</text>
      <ellipse cx="-18" cy="-30" rx="26" ry="11" fill="#fff" opacity=".35" transform="rotate(-28 -18 -30)" />
    </svg>
  );
  let body: React.ReactNode;
  if (kind === "btc") body = coin("#ffd08a", A.btc, "#b8620a", "₿");
  else if (kind === "usd") body = coin("#9ef0c9", A.green, "#0b6b3c", "$");
  else if (kind === "eth") body = coin("#c9c2ff", "#6f63ff", "#2b228f", "Ξ", 62);
  else if (kind === "gold")
    body = (
      <svg viewBox="-70 -50 140 100" width={s * 1.1} height={s * 0.8}>
        <defs>
          <linearGradient id={`${id}-t`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff3c4" /><stop offset="1" stopColor={A.gold} /></linearGradient>
          <linearGradient id={`${id}-f`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f2c25b" /><stop offset="1" stopColor="#a8741c" /></linearGradient>
        </defs>
        <polygon points="-44,-26 44,-26 60,-6 -60,-6" fill={`url(#${id}-t)`} />
        <polygon points="-60,-6 60,-6 60,26 -60,26" fill={`url(#${id}-f)`} />
        <polygon points="-60,-6 -44,-26 -44,-22 -58,-4" fill="#fff" opacity=".4" />
        <text y="15" textAnchor="middle" fontFamily={FONT_UI} fontWeight="700" fontSize="17" fill="#7a5210" opacity=".75">999.9</text>
        <rect x="-40" y="-23" width="40" height="5" rx="2.5" fill="#fff" opacity=".45" />
      </svg>
    );
  else
    body = (
      <svg viewBox="-64 -64 128 128" width={s} height={s}>
        <defs><linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#e6e4f5" /></linearGradient></defs>
        <rect x="-54" y="-54" width="108" height="108" rx="28" fill={`url(#${id}-g)`} stroke="rgba(91,61,245,.18)" strokeWidth="2" />
        {[-30, -14, 2, 18, 34].map((cx, i) => {
          const up = i !== 2;
          const h = [22, 30, 18, 36, 44][i];
          const cy = [12, 2, 6, -8, -18][i];
          return (
            <g key={i}>
              <line x1={cx} x2={cx} y1={cy - h / 2 - 7} y2={cy + h / 2 + 7} stroke={up ? A.green : A.red} strokeWidth="2.5" />
              <rect x={cx - 5} y={cy - h / 2} width="10" height={h} rx="2.5" fill={up ? A.green : A.red} />
            </g>
          );
        })}
        <path d="M-40 34 L-16 20 L4 26 L40 -4" fill="none" stroke={A.violet} strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  return (
    <div style={{ display: "inline-block", transform: `perspective(900px) rotateY(${wob}deg) rotateX(${wob * 0.25}deg)`, filter: "drop-shadow(0 30px 34px rgba(20,10,60,.28))", ...style }}>
      {body}
    </div>
  );
};

/** App icon: rounded-square gradient with a pulse-line glyph (placeholder product logo). */
export const AppIcon: React.FC<{ s?: number; f: number; glow?: number }> = ({ s = 200, f, glow = 0 }) => {
  const d = ramp(f % 60, 0, 40);
  return (
    <div style={{ width: s, height: s, borderRadius: s * 0.27, background: `linear-gradient(145deg, ${A.violet2}, ${A.violet} 55%, #3a21c9)`, boxShadow: `0 ${s * 0.18}px ${s * 0.4}px rgba(91,61,245,${0.35 + glow * 0.3}), inset 0 3px 0 rgba(255,255,255,.35)`, position: "relative", overflow: "hidden" }}>
      <svg viewBox="0 0 100 100" width={s} height={s} style={{ position: "absolute" }}>
        <path d="M14 56 H34 L42 34 L54 72 L62 48 H86" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={0} />
        <circle cx={14 + 72 * d} cy={56 - Math.sin(d * Math.PI * 3) * 8} r="5" fill={A.mint} opacity={1 - d} />
      </svg>
      <div style={{ position: "absolute", left: -s * 0.3, top: -s * 0.6, width: s * 1.2, height: s * 0.9, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,.28), transparent 70%)" }} />
    </div>
  );
};

/* ───────── phone + chat ───────── */
export const PHONE = { W: 500, H: 1040, SW: 472, SH: 1012 };
/** Phone mockup; children render inside the screen (472×1012, RTL-safe: give children explicit left/top). */
export const Phone: React.FC<{ x: number; y: number; s?: number; mode?: Mode; rot?: number; children?: React.ReactNode }> = ({ x, y, s = 1, mode = "light", rot = 0, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: PHONE.W, height: PHONE.H, transform: `scale(${s}) rotate(${rot}deg)`, transformOrigin: "center top", borderRadius: 78, background: "linear-gradient(145deg, #2a2a33, #0b0b10)", padding: 14, boxShadow: "0 60px 120px rgba(20,10,60,.35), 0 18px 40px rgba(0,0,0,.25), inset 0 2px 0 rgba(255,255,255,.18)" }}>
    <div style={{ position: "relative", width: PHONE.SW, height: PHONE.SH, borderRadius: 64, overflow: "hidden", background: mode === "dark" ? "#0d0d14" : "#f5f5f7" }}>
      {children}
      <div style={{ position: "absolute", left: PHONE.SW / 2 - 64, top: 16, width: 128, height: 36, borderRadius: 20, background: "#000" }} />
      <div style={{ position: "absolute", left: 40, top: 20, fontFamily: FONT_UI, fontWeight: 600, fontSize: 24, color: mode === "dark" ? "#fff" : "#111" }}>9:41</div>
    </div>
  </div>
);

export const ChatHeader: React.FC<{ name: string; sub: string; f: number }> = ({ name, sub, f }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: PHONE.SW, height: 150, background: "rgba(255,255,255,.92)", borderBottom: "1px solid rgba(0,0,0,.06)", direction: "rtl" }}>
    <div style={{ position: "absolute", right: 28, top: 72, display: "flex", alignItems: "center", gap: 16 }}>
      <AppIcon s={60} f={f} />
      <div>
        <div style={{ fontFamily: FONT_TEXT, fontSize: 28, color: "#111" }}>{name}</div>
        <div style={{ fontFamily: FONT_TEXT, fontSize: 20, color: A.mint }}>{sub}</div>
      </div>
    </div>
  </div>
);

/** Chat bubble. side "me" = accent bubble on the right, "bot" = white on the left. a = appear 0..1. */
export const Bubble: React.FC<{ side: "me" | "bot"; a: number; top: number; children: React.ReactNode; w?: number }> = ({ side, a, top, children, w }) => (
  <div style={{
    position: "absolute", top, [side === "me" ? "right" : "left"]: 22, maxWidth: w ?? 380, width: w, padding: "18px 24px", borderRadius: 30,
    borderBottomRightRadius: side === "me" ? 8 : 30, borderBottomLeftRadius: side === "bot" ? 8 : 30,
    background: side === "me" ? `linear-gradient(135deg, ${A.violet2}, ${A.violet})` : "#fff", color: side === "me" ? "#fff" : "#111",
    boxShadow: side === "me" ? "0 14px 30px rgba(91,61,245,.3)" : "0 12px 30px rgba(0,0,0,.08)", direction: "rtl", fontFamily: FONT_TEXT, fontSize: 30,
    opacity: clamp(a * 2), transform: `scale(${0.6 + 0.4 * a}) translateY(${(1 - a) * 30}px)`, transformOrigin: side === "me" ? "right bottom" : "left bottom",
  }}>
    {children}
  </div>
);

export const TypingDots: React.FC<{ f: number }> = ({ f }) => (
  <div style={{ display: "flex", gap: 8, padding: "4px 2px" }}>
    {[0, 1, 2].map((i) => <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: "#9a9aa6", transform: `translateY(${Math.sin(f / 3 - i) * -5}px)`, opacity: 0.5 + 0.5 * Math.sin(f / 3 - i) }} />)}
  </div>
);

/** Message composer with typed text + blinking caret + send button (press 0..1). */
export const InputBar: React.FC<{ text: string; f: number; press?: number; placeholder?: string }> = ({ text, f, press = 0, placeholder = "پیام…" }) => (
  <div style={{ position: "absolute", left: 18, right: 18, bottom: 34, height: 84, borderRadius: 42, background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,.08)", direction: "rtl", display: "flex", alignItems: "center", padding: "0 30px", fontFamily: FONT_TEXT, fontSize: 30, color: text ? "#111" : "#aaa" }}>
    <span>{text || placeholder}</span>
    {Math.floor(f / 8) % 2 === 0 && <span style={{ width: 3, height: 36, background: A.violet, marginRight: 4 }} />}
    <div style={{ position: "absolute", left: 12, top: 12, width: 60, height: 60, borderRadius: 30, background: `linear-gradient(135deg, ${A.violet2}, ${A.violet})`, transform: `scale(${1 - press * 0.18})`, display: "grid", placeItems: "center" }}>
      <svg width="30" height="30" viewBox="0 0 24 24"><path d="M20 12 L4 4 L7 12 L4 20 Z" fill="#fff" transform="rotate(180 12 12)" /></svg>
    </div>
  </div>
);

/* ───────── data cards ───────── */
/** Trading signal card: asset + direction badge, self-drawing chart with entry/target/stop, rows, confidence bar. */
export const SignalCard: React.FC<{
  f: number; at: number; asset: string; code: string; dir?: "buy" | "sell"; rows: [string, string, string][]; conf: number; w?: number; stampAt?: number;
}> = ({ f, at, asset, code, dir = "buy", rows, conf, w = 420, stampAt }) => {
  const draw = ramp(f, at + 4, at + 36, easeOut);
  const cw = w - 40, ch = 190;
  const pts = Array.from({ length: 28 }, (_, i) => {
    const x = (i / 27) * cw;
    const y = ch * 0.72 - i * 3.6 + Math.sin(i * 1.3) * 16 + Math.sin(i * 0.5) * 10 + (rnd(i + 3) - 0.5) * 12;
    return [x, y] as const;
  });
  const n = Math.max(2, Math.ceil(pts.length * draw));
  const line = pts.slice(0, n).map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const last = pts[n - 1];
  const good = dir === "buy" ? A.green : A.red;
  const st = stampAt === undefined ? 0 : pop(f, stampAt, 10);
  return (
    <div style={{ width: w, direction: "rtl", fontFamily: FONT_TEXT }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 32, color: "#111" }}>{asset}</div>
          <div style={{ fontFamily: FONT_UI, fontSize: 20, color: "#888", direction: "ltr", textAlign: "right" }}>{code}</div>
        </div>
        <div style={{ padding: "10px 22px", borderRadius: 16, background: good, color: "#fff", fontSize: 28, transform: `scale(${stampAt === undefined ? 1 : 0.4 + 0.6 * st}) rotate(${(1 - st) * -14}deg)`, opacity: stampAt === undefined ? 1 : st, boxShadow: `0 10px 24px ${good}55` }}>
          {dir === "buy" ? "خرید" : "فروش"}
        </div>
      </div>
      <svg width={cw} height={ch} style={{ margin: "14px 0 6px", overflow: "visible" }}>
        <defs>
          <linearGradient id="sc-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={good} stopOpacity=".28" /><stop offset="1" stopColor={good} stopOpacity="0" /></linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((k) => <line key={k} x1="0" x2={cw} y1={ch * k} y2={ch * k} stroke="rgba(0,0,0,.05)" />)}
        <line x1="0" x2={cw} y1={ch * 0.18} y2={ch * 0.18} stroke={A.green} strokeWidth="2" strokeDasharray="8 7" opacity={draw} />
        <line x1="0" x2={cw} y1={ch * 0.6} y2={ch * 0.6} stroke={A.violet} strokeWidth="2" strokeDasharray="8 7" opacity={draw} />
        <line x1="0" x2={cw} y1={ch * 0.9} y2={ch * 0.9} stroke={A.red} strokeWidth="2" strokeDasharray="8 7" opacity={draw} />
        <path d={`${line} L${last[0]} ${ch} L0 ${ch} Z`} fill="url(#sc-fill)" />
        <path d={line} fill="none" stroke={good} strokeWidth="4.5" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={last[0]} cy={last[1]} r={9 + Math.sin(f / 4) * 2} fill={good} opacity=".25" />
        <circle cx={last[0]} cy={last[1]} r="6" fill={good} />
      </svg>
      {rows.map(([k, v, c], i) => {
        const a = ramp(f, at + 14 + i * 5, at + 24 + i * 5, easeOut);
        return (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 2px", borderTop: "1px solid rgba(0,0,0,.06)", fontSize: 26, opacity: a, transform: `translateX(${(1 - a) * -30}px)` }}>
            <span style={{ color: "#777" }}>{k}</span>
            <span style={{ color: c }}>{v}</span>
          </div>
        );
      })}
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: "#777" }}>
        <span>اطمینان</span>
        <div style={{ flex: 1, height: 14, borderRadius: 7, background: "rgba(0,0,0,.07)", overflow: "hidden" }}>
          <div style={{ width: `${conf * ramp(f, at + 26, at + 50, easeOut) * 100}%`, height: "100%", borderRadius: 7, background: `linear-gradient(90deg, ${A.mint}, ${A.green})`, marginRight: 0, marginLeft: "auto" }} />
        </div>
        <span style={{ color: A.green, fontFamily: FONT_NUM, fontSize: 30 }}>{fa(Math.round(conf * 100 * ramp(f, at + 26, at + 50, easeOut)))}٪</span>
      </div>
    </div>
  );
};

/** Notification toast (glass pill). icon = "check" | "bell" | "up". */
export const Toast: React.FC<{ icon: "check" | "bell" | "up"; title: string; sub?: string; a: number; mode: Mode; x: number; y: number; w?: number; color?: string }> = ({ icon, title, sub, a, mode, x, y, w = 860, color = A.green }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: 132, borderRadius: 40, background: T[mode].card, border: `1.5px solid ${T[mode].cardLine}`, boxShadow: T[mode].shadow, backdropFilter: "blur(20px)", direction: "rtl", display: "flex", alignItems: "center", gap: 26, padding: "0 30px", opacity: clamp(a * 1.6), transform: `translateY(${(1 - a) * -80}px) scale(${0.85 + 0.15 * a})` }}>
    <div style={{ width: 78, height: 78, borderRadius: 24, background: `${color}22`, display: "grid", placeItems: "center", flexShrink: 0 }}>
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        {icon === "check" && <path d="M5 12.5 L10 17 L19 7" />}
        {icon === "bell" && <path d="M6 16 V11 a6 6 0 0 1 12 0 V16 L19.5 18 H4.5 Z M10 20.5 a2 2 0 0 0 4 0" />}
        {icon === "up" && <path d="M4 17 L10 11 L14 15 L20 8 M14 8 H20 V14" />}
      </svg>
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: FONT_TEXT, fontSize: 36, color: T[mode].text }}>{title}</div>
      {sub && <div style={{ fontFamily: FONT_TEXT, fontSize: 26, color: T[mode].sub, marginTop: 4 }}>{sub}</div>}
    </div>
    <div style={{ fontFamily: FONT_TEXT, fontSize: 22, color: T[mode].sub }}>الان</div>
  </div>
);

/** 24-hour watch dial: ticks, Persian hours, sweeping radar arc; `hits` (hours) light up when the sweep passes. */
export const Dial24: React.FC<{ f: number; a: number; x: number; y: number; r?: number; mode: Mode; hits?: number[]; speed?: number }> = ({ f, a, x, y, r = 300, mode, hits = [], speed = 4.2 }) => {
  const ang = (f * speed) % 360;
  const t = T[mode];
  const pt = (deg: number, rr: number) => [Math.sin((deg * Math.PI) / 180) * rr, -Math.cos((deg * Math.PI) / 180) * rr];
  return (
    <svg width={r * 2 + 80} height={r * 2 + 80} viewBox={`${-r - 40} ${-r - 40} ${r * 2 + 80} ${r * 2 + 80}`} style={{ position: "absolute", left: x - r - 40, top: y - r - 40, opacity: a, transform: `scale(${0.7 + 0.3 * a}) rotate(${(1 - a) * -40}deg)` }}>
      <defs>
        <radialGradient id="d24-bg"><stop offset="0" stopColor={A.violet} stopOpacity=".16" /><stop offset="1" stopColor={A.violet} stopOpacity="0" /></radialGradient>
        <linearGradient id="d24-sw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={A.mint} stopOpacity="0" /><stop offset="1" stopColor={A.mint} stopOpacity=".5" /></linearGradient>
      </defs>
      <circle r={r} fill="url(#d24-bg)" stroke={t.cardLine} strokeWidth="2" />
      <circle r={r * 0.66} fill="none" stroke={t.cardLine} strokeWidth="2" strokeDasharray="4 10" />
      {Array.from({ length: 96 }, (_, i) => {
        const big = i % 4 === 0;
        const [x1, y1] = pt(i * 3.75, r - (big ? 34 : 18));
        const [x2, y2] = pt(i * 3.75, r - 6);
        const near = ((ang - i * 3.75 + 360) % 360) < 40;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={near ? A.mint : t.sub} strokeOpacity={near ? 0.9 : big ? 0.5 : 0.25} strokeWidth={big ? 4 : 2} strokeLinecap="round" />;
      })}
      {[0, 6, 12, 18].map((h) => {
        const [tx, ty] = pt(h * 15, r - 72);
        return <text key={h} x={tx} y={ty + 14} textAnchor="middle" fontFamily={FONT_NUM} fontSize="40" fill={t.sub}>{fa(h === 0 ? 24 : h)}</text>;
      })}
      <path d={`M0 0 L${pt(ang - 50, r - 8).join(" ")} A${r - 8} ${r - 8} 0 0 1 ${pt(ang, r - 8).join(" ")} Z`} fill="url(#d24-sw)" transform={`rotate(0)`} />
      <line x1="0" y1="0" x2={pt(ang, r - 8)[0]} y2={pt(ang, r - 8)[1]} stroke={A.mint} strokeWidth="4" strokeLinecap="round" />
      {hits.map((h, i) => {
        const deg = h * 15;
        const since = ((ang - deg + 360) % 360) / speed;
        const lit = since < 30 ? 1 - since / 30 : 0;
        const [hx, hy] = pt(deg, r * 0.66);
        return (
          <g key={i}>
            <circle cx={hx} cy={hy} r={14 + lit * 30} fill={A.mint} opacity={0.12 + lit * 0.3} />
            <circle cx={hx} cy={hy} r="10" fill={A.mint} />
          </g>
        );
      })}
      <circle r="16" fill={A.violet} />
      <circle r="6" fill="#fff" />
    </svg>
  );
};

/** Price ticker strip scrolling right→left. items: [name, change%]. */
export const Ticker: React.FC<{ f: number; y: number; mode: Mode; items: [string, number][]; speed?: number; a?: number }> = ({ f, y, mode, items, speed = 3, a = 1 }) => {
  const row = [...items, ...items, ...items];
  const cell = 330;
  const off = (f * speed) % (items.length * cell);
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: V.W, height: 96, overflow: "hidden", opacity: a, borderTop: `1.5px solid ${T[mode].cardLine}`, borderBottom: `1.5px solid ${T[mode].cardLine}`, background: T[mode].card }}>
      <div style={{ position: "absolute", top: 0, left: -off, display: "flex", direction: "ltr" }}>
        {row.map(([n, c], i) => (
          <div key={i} style={{ width: cell, height: 96, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, direction: "rtl", fontFamily: FONT_TEXT, fontSize: 32, color: T[mode].text }}>
            <span>{n}</span>
            <span style={{ color: c >= 0 ? A.green : A.red, fontFamily: FONT_NUM }}>{c >= 0 ? "▲" : "▼"} {faDec(Math.abs(c))}٪</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Count-up number (Persian digits). */
export const Counter: React.FC<{ f: number; at: number; dur?: number; to: number; decimals?: number; prefix?: string; suffix?: string; size?: number; color?: string; x?: number; y: number; w?: number }> = ({ f, at, dur = 24, to, decimals = 1, prefix = "", suffix = "", size = 200, color = A.green, x = 0, y, w = V.W }) => {
  const p = ramp(f, at, at + dur, easeOut);
  const a = pop(f, at, 10);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, textAlign: "center", direction: "rtl", fontFamily: FONT_NUM, fontSize: size, color, opacity: clamp(a * 1.5), transform: `scale(${0.6 + 0.4 * a})`, textShadow: `0 20px 60px ${color}55` }}>
      {prefix}{faDec(to * p, decimals)}{suffix}
    </div>
  );
};

/** Pill chip with a leading dot. */
export const Chip: React.FC<{ text: string; a: number; mode: Mode; color?: string; style?: React.CSSProperties }> = ({ text, a, mode, color = A.violet, style }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "16px 32px", borderRadius: 99, background: T[mode].card, border: `1.5px solid ${T[mode].cardLine}`, boxShadow: T[mode].shadow, direction: "rtl", fontFamily: FONT_TEXT, fontSize: 38, color: T[mode].text, opacity: clamp(a * 1.5), transform: `scale(${0.5 + 0.5 * a}) translateY(${(1 - a) * 30}px)`, ...style }}>
    <span style={{ width: 16, height: 16, borderRadius: 8, background: color, boxShadow: `0 0 16px ${color}` }} />
    {text}
  </div>
);

/* ───────── interaction ───────── */
/** Mouse pointer. press 0..1 squashes it. */
export const Cursor: React.FC<{ x: number; y: number; press?: number; a?: number }> = ({ x, y, press = 0, a = 1 }) => (
  <svg width="70" height="80" viewBox="0 0 28 32" style={{ position: "absolute", left: x, top: y, opacity: a, transform: `scale(${1 - press * 0.15})`, transformOrigin: "0 0", filter: "drop-shadow(0 8px 10px rgba(0,0,0,.3))" }}>
    <path d="M2 2 L2 25 L8 19.5 L12.5 29 L16.5 27.2 L12 18 L20 18 Z" fill="#111" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);
/** Expanding click ring. */
export const Ripple: React.FC<{ x: number; y: number; f: number; at: number; color?: string }> = ({ x, y, f, at, color = A.violet }) => {
  if (f < at) return null;
  const p = ramp(f, at, at + 18, easeOut);
  return <div style={{ position: "absolute", left: x - 90 * p, top: y - 90 * p, width: 180 * p, height: 180 * p, borderRadius: "50%", border: `4px solid ${color}`, opacity: 1 - p }} />;
};

/** Call-to-action button with moving shine; pressed 0..1. */
export const CTA: React.FC<{ text: string; a: number; f: number; x: number; y: number; w?: number; pressed?: number }> = ({ text, a, f, x, y, w = 760, pressed = 0 }) => {
  const shine = ((f % 70) / 70) * (w + 400) - 200;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: 150, borderRadius: 75, background: `linear-gradient(135deg, ${A.violet2}, ${A.violet} 60%, #3a21c9)`, boxShadow: `0 ${30 - pressed * 18}px 70px rgba(91,61,245,.45), inset 0 3px 0 rgba(255,255,255,.3)`, display: "grid", placeItems: "center", overflow: "hidden", fontFamily: FONT_TEXT, fontSize: 50, color: "#fff", direction: "rtl", opacity: clamp(a * 1.5), transform: `scale(${(0.6 + 0.4 * a) * (1 - pressed * 0.06)})` }}>
      <div style={{ position: "absolute", left: shine, top: -40, width: 120, height: 240, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent)", transform: "rotate(20deg)" }} />
      {text}
    </div>
  );
};

/** Burst of glossy glass shapes (celebration without looking childish). */
export const GlassBurst: React.FC<{ x: number; y: number; f: number; at: number; n?: number; power?: number; colors?: string[] }> = ({ x, y, f, at, n = 26, power = 34, colors = [A.violet, A.violet2, A.mint, A.gold, "#ffffff"] }) => {
  const t = f - at;
  if (t < 0 || t > 90) return null;
  return (
    <svg width={V.W} height={V.H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {Array.from({ length: n }, (_, i) => {
        const ang = rnd(i * 7 + 1) * Math.PI * 2;
        const v = power * (0.45 + rnd(i * 3 + 2) * 0.7);
        const drag = (1 - Math.pow(0.93, t)) / 0.07;
        const px = x + Math.cos(ang) * v * drag;
        const py = y + Math.sin(ang) * v * drag - 6 * drag + 0.35 * t * t * 0.5;
        const s = 14 + rnd(i * 5) * 22;
        const o = interpolate(t, [0, 5, 60, 90], [0, 1, 1, 0], { extrapolateRight: "clamp" });
        const c = colors[i % colors.length];
        const rot = t * (4 + rnd(i) * 8) * (i % 2 ? 1 : -1);
        const kind = i % 3;
        return (
          <g key={i} transform={`translate(${px} ${py}) rotate(${rot})`} opacity={o}>
            {kind === 0 && <rect x={-s / 2} y={-s / 3} width={s} height={s * 0.66} rx={s * 0.18} fill={c} />}
            {kind === 1 && <circle r={s / 2.4} fill={c} />}
            {kind === 2 && <path d={`M0 ${-s / 2} L${s / 2} ${s / 2.4} L${-s / 2} ${s / 2.4} Z`} fill={c} />}
            <ellipse cx={-s * 0.12} cy={-s * 0.14} rx={s * 0.22} ry={s * 0.08} fill="#fff" opacity=".6" />
          </g>
        );
      })}
    </svg>
  );
};
