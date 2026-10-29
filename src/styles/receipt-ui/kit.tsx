import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../../fonts";
import { C, clamp, easeBack, easeOut, FONT_MONO, FONT_UI, FPS, Mode, ramp, rnd, T, V } from "./theme";

/* ───────── timing ───────── */
export type Word = { si: number; wi: number; w: string; s: number; e: number };

/** seconds → frames */
export const fr = (s: number) => Math.round(s * FPS);
/** First word in sentence `si` whose text contains `needle` (start time, seconds). */
export const wordAt = (words: Word[], si: number, needle: string, nth = 0) => {
  const hits = words.filter((w) => w.si === si && w.w.includes(needle));
  const w = hits[nth] ?? hits[0];
  if (!w) throw new Error(`word "${needle}" not in sentence ${si}`);
  return w.s;
};
export const sentStart = (words: Word[], si: number) => words.find((w) => w.si === si)!.s;
export const sentEnd = (words: Word[], si: number) => words.filter((w) => w.si === si).at(-1)!.e;

/* ───────── backdrop + scene frame ───────── */
/** Slow-drifting digital particles (dots, pluses, brackets) — keeps every frame alive. f = local frame. */
export const Ambient: React.FC<{ mode: Mode; f: number; n?: number }> = ({ mode, f, n = 34 }) => {
  const col = mode === "dark" ? "255,255,255" : "0,0,0";
  return (
    <svg width={V.W} height={V.H} style={{ position: "absolute" }}>
      {Array.from({ length: n }, (_, i) => {
        const depth = 0.4 + rnd(i * 3) * 0.9;
        const x = rnd(i) * V.W + Math.sin(f / 40 + i) * 16 * depth;
        const y = ((rnd(i + 50) * V.H - f * 0.9 * depth) % V.H + V.H) % V.H;
        const a = (0.06 + 0.1 * depth) * (0.6 + 0.4 * Math.sin(f / 12 + i * 2));
        const kind = i % 3;
        const s = 5 + depth * 6;
        return kind === 0 ? <circle key={i} cx={x} cy={y} r={s * 0.45} fill={`rgba(${col},${a})`} />
          : kind === 1 ? <path key={i} d={`M${x - s} ${y} H${x + s} M${x} ${y - s} V${y + s}`} stroke={`rgba(${col},${a})`} strokeWidth="2" />
          : <rect key={i} x={x - s * 0.6} y={y - s * 0.6} width={s * 1.2} height={s * 1.2} rx="2" fill="none" stroke={`rgba(${i % 2 ? "47,107,255" : col},${a * 1.4})`} strokeWidth="1.8" transform={`rotate(${f * 0.6 + i * 20} ${x} ${y})`} />;
      })}
    </svg>
  );
};

export const Backdrop: React.FC<{ mode: Mode; f?: number }> = ({ mode, f = 0 }) => (
  <AbsoluteFill style={{ background: T[mode].bg }}>
    <Ambient mode={mode} f={f} />
    <svg width={V.W} height={V.H} style={{ position: "absolute" }}>
      <defs>
        <pattern id={`g-${mode}`} width="44" height="44" patternUnits="userSpaceOnUse">
          <path d="M44 0 L0 0 0 44" fill="none" stroke={T[mode].grid} strokeWidth="1.5" />
        </pattern>
        <radialGradient id={`v-${mode}`} cx="50%" cy="45%" r="75%">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity={mode === "dark" ? 0.45 : 0.06} />
        </radialGradient>
      </defs>
      <rect width={V.W} height={V.H} fill={`url(#g-${mode})`} />
      <rect width={V.W} height={V.H} fill={`url(#v-${mode})`} />
    </svg>
  </AbsoluteFill>
);

/** Content wrapper with the reference's vertical motion-smear in/out (f = local frame, dur = scene length). */
/** Screen shake from impacts (local frames). */
export const shakeAt = (f: number, hits: number[], amp = 14) =>
  hits.reduce(([x, y], h) => {
    if (f < h || f > h + 16) return [x, y];
    const d = Math.exp(-(f - h) / 4.5);
    return [x + Math.sin((f - h) * 2.7) * amp * d, y + Math.cos((f - h) * 3.3) * amp * 0.6 * d];
  }, [0, 0]);

export const Smear: React.FC<{ f: number; dur: number; id: string; children: React.ReactNode; inF?: number; outF?: number; push?: number; hits?: number[] }> = ({
  f, dur, id, children, inF = 7, outF = 6, push = 0.06, hits = [],
}) => {
  const a = inF > 0 ? 1 - ramp(f, 0, inF, easeOut) : 0;
  const b = outF > 0 ? ramp(f, dur - outF, dur, (t) => t * t) : 0;
  const k = Math.max(a, b);
  const dy = a * 160 - b * 160;
  const z = 1 + push * (f / Math.max(1, dur)); // slow camera push-in
  const [sx, sy] = shakeAt(f, hits);
  return (
    <AbsoluteFill style={{ transform: `translate(${sx}px, ${dy + sy}px) scale(${z}) scaleY(${1 + k * 0.25})`, transformOrigin: "50% 62%", opacity: 1 - k * 0.6, filter: k > 0.01 ? `url(#${id})` : undefined }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id={id} x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation={`0 ${k * 38}`} /></filter>
      </svg>
      {children}
    </AbsoluteFill>
  );
};

/* ───────── captions (word-synced) ───────── */
const isLatin = (w: string) => /^[A-Za-z«]*[A-Za-z]/.test(w);

/** Keyword highlight: Figma-like selection box with handles. */
export const SelectBox: React.FC<{ a: number; color?: string; children: React.ReactNode }> = ({ a, color = C.blue, children }) => (
  <span style={{ position: "relative", display: "inline-block", padding: "0 12px" }}>
    <span style={{ position: "absolute", inset: "4px 0 2px", background: color === C.blue ? C.blueSoft : C.redSoft, border: `3px solid ${color}`, borderRadius: 6, opacity: a, transform: `scale(${0.9 + 0.1 * a})` }} />
    {[["-7px", "auto", "-7px", "auto"], ["auto", "-7px", "auto", "-7px"]].map(([t, r, l, b], i) => (
      <span key={i} style={{ position: "absolute", top: t, right: r, left: l, bottom: b, width: 13, height: 13, borderRadius: 7, background: "#fff", border: `3px solid ${color}`, opacity: a }} />
    ))}
    <span style={{ position: "relative" }}>{children}</span>
  </span>
);

/**
 * Shows the chunk of the current sentence being spoken: spoken words appear on their start time,
 * the newest word is full-contrast, older ones fade to gray. keys = display words to box (blue); reds = box red.
 */
export const Captions: React.FC<{ words: Word[]; t: number; mode: Mode; keyMap?: Record<number, { keys?: string[]; reds?: string[]; icons?: Record<string, string> }>; y?: number; size?: number; maxWords?: number }> = ({
  words, t, mode, keyMap = {}, y = 640, size = 70, maxWords = 5,
}) => {
  const cur = [...words].reverse().find((w) => w.s <= t + 0.02);
  if (!cur) return null;
  const keys = keyMap[cur.si]?.keys ?? [];
  const reds = keyMap[cur.si]?.reds ?? [];
  const icons = keyMap[cur.si]?.icons ?? {};
  const sent = words.filter((w) => w.si === cur.si);
  // chunk the sentence: break after punctuation or every maxWords
  const chunks: Word[][] = [[]];
  sent.forEach((w) => {
    const c = chunks[chunks.length - 1];
    c.push(w);
    if (/[،,:.!؟]$/.test(w.w) || c.length >= maxWords) chunks.push([]);
  });
  // never leave a 1–2 word tail alone: merge it into the previous chunk
  for (let i = chunks.length - 1; i > 0; i--) {
    if (chunks[i].length > 0 && chunks[i].length < 3 && chunks[i - 1].length + chunks[i].length <= maxWords + 3) {
      chunks[i - 1].push(...chunks[i]);
      chunks.splice(i, 1);
    }
  }
  const chunk = chunks.find((c) => c.includes(cur)) ?? [];
  // group consecutive Latin words so "Vibe Coding" reads LTR inside the RTL line
  const groups: Word[][] = [];
  chunk.forEach((w) => {
    const g = groups[groups.length - 1];
    if (g && isLatin(w.w) && isLatin(g[g.length - 1].w)) g.push(w);
    else groups.push([w]);
  });
  const th = T[mode];
  const renderWord = (w: Word) => {
    if (w.s > t + 0.02) return <span key={w.wi} style={{ opacity: 0 }}>{w.w}</span>;
    const age = t - w.s;
    const inA = clamp(age / 0.12);
    const isCur = w === cur || age < 0.25;
    const bare = w.w.replace(/[،,:.!؟]$/, "");
    const red = reds.some((k) => bare.includes(k));
    const key = red || keys.some((k) => bare.includes(k));
    const color = isCur || key ? th.text : th.sub;
    const inner = <span style={{ color, transition: "none" }}>{w.w}</span>;
    const iconKey = Object.keys(icons).find((k) => bare.includes(k));
    const ip = ramp(age * FPS, 0, 9, easeBack);
    return (
      <span key={w.wi} style={{ display: "inline-block", opacity: inA, transform: `translateY(${(1 - inA) * 14}px)`, margin: "0 9px" }}>
        {iconKey && (
          <span style={{ display: "inline-block", fontFamily: "'Segoe UI Emoji'", fontSize: size * 0.8, margin: "0 6px", transform: `scale(${ip}) rotate(${(1 - ip) * -40 + Math.sin(age * 5) * 6}deg) translateY(${Math.sin(age * 4) * -4}px)` }}>
            {icons[iconKey]}
          </span>
        )}
        {key ? <SelectBox a={ramp(age * FPS, 0, 6, easeBack)} color={red ? C.red : C.blue}>{inner}</SelectBox> : inner}
      </span>
    );
  };
  return (
    <div style={{ position: "absolute", left: 70, top: y, width: V.W - 140, textAlign: "center", direction: "rtl", fontFamily: FONT_TEXT, fontSize: size, lineHeight: 1.45 }}>
      {groups.map((g, i) =>
        g.length > 1 || isLatin(g[0].w) ? (
          <span key={i} style={{ display: "inline-block", direction: "ltr", fontFamily: FONT_UI, fontWeight: 600, fontSize: size * 0.92 }}>{g.map(renderWord)}</span>
        ) : (
          renderWord(g[0])
        ),
      )}
    </div>
  );
};

/* ───────── receipt ───────── */
export type ReceiptRow = { at: number; label: string; sub?: string; amount: string; tone?: "red" | "blue" | "ink"; fixAt?: number };

/** The printing receipt hanging from the top edge. t in seconds. `sales` row stays at the bottom. */
export const Receipt: React.FC<{ rows: ReceiptRow[]; t: number; x?: number; w?: number; total?: { at: number; value: string; fixedValue?: string; fixAt?: number }; flashSales?: number; maxH?: number }> = ({
  rows, t, x = 540, w = 560, total, flashSales, maxH = 560,
}) => {
  const vis = rows.filter((r) => r.at <= t);
  const RH = 62;
  const printing = rows.some((r) => t - r.at >= 0 && t - r.at < 0.35);
  const bodyH = 118 + vis.length * RH + (total && t >= total.at ? 56 : 0) + 64;
  const offset = Math.min(0, maxH - bodyH); // scroll up once long
  const flash = flashSales !== undefined && t >= flashSales ? 0.5 + 0.5 * Math.sin((t - flashSales) * 14) : 0;
  return (
    <div style={{ position: "absolute", left: x - w / 2 + (printing ? Math.sin(t * 95) * 2.5 : 0), top: -12 + offset + (printing ? Math.sin(t * 70) * 3 : 0), width: w, fontFamily: FONT_MONO, color: C.ink,
      filter: "drop-shadow(0 22px 30px rgba(0,0,0,.28))", transform: `rotate(${Math.sin(t * 0.9) * 0.6}deg)`, transformOrigin: "50% 0" }}>
      <div style={{ background: C.paper, padding: "34px 34px 18px", clipPath: "polygon(0 0,100% 0,100% calc(100% - 14px),96% 100%,92% calc(100% - 14px),88% 100%,84% calc(100% - 14px),80% 100%,76% calc(100% - 14px),72% 100%,68% calc(100% - 14px),64% 100%,60% calc(100% - 14px),56% 100%,52% calc(100% - 14px),48% 100%,44% calc(100% - 14px),40% 100%,36% calc(100% - 14px),32% 100%,28% calc(100% - 14px),24% 100%,20% calc(100% - 14px),16% 100%,12% calc(100% - 14px),8% 100%,4% calc(100% - 14px),0 100%)" }}>
        <div style={{ fontSize: 27, fontWeight: 700, letterSpacing: 1 }}>VIBE-CODED APP</div>
        <div style={{ fontSize: 19, opacity: 0.55, marginBottom: 14 }}>invoice · no. 0001 · {printing ? "printing…" : "unpaid"}</div>
        {vis.map((r, i) => {
          const p = clamp((t - r.at) / 0.3);
          const fixed = r.fixAt !== undefined && t >= r.fixAt;
          const col = fixed ? C.green : r.tone === "blue" ? C.blue : r.tone === "ink" ? C.ink : C.red;
          return (
            <div key={i} style={{ height: RH * p, overflow: "hidden", opacity: p, position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, paddingTop: 6 }}>
                <span style={{ textDecoration: fixed ? "line-through" : "none" }}>{r.label}</span>
                <span style={{ color: col, fontWeight: 700 }}>{fixed ? "✓ fixed" : r.amount}</span>
              </div>
              {r.sub && <div style={{ fontSize: 17, opacity: 0.5 }}>{r.sub}</div>}
            </div>
          );
        })}
        {total && t >= total.at && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, fontWeight: 700, borderTop: "2px dashed rgba(0,0,0,.35)", paddingTop: 10, marginTop: 6 }}>
            <span>TOTAL</span>
            <span style={{ color: total.fixAt !== undefined && t >= total.fixAt ? C.green : C.red }}>{total.fixAt !== undefined && t >= total.fixAt ? total.fixedValue : total.value}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, fontWeight: 700, borderTop: "2px dashed rgba(0,0,0,.35)", paddingTop: 10, marginTop: 8,
          background: flash ? `rgba(229,72,77,${0.18 * flash})` : "transparent" }}>
          <span>SALES</span><span>$0</span>
        </div>
      </div>
    </div>
  );
};

/* ───────── progress pill ("the prompt · at the end") ───────── */
export const PromptPill: React.FC<{ t: number; revealAt: number; mode: Mode; y?: number }> = ({ t, revealAt, mode, y = 1752 }) => {
  const left = Math.max(0, Math.ceil(revealAt - t));
  const p = clamp(t / revealAt);
  const th = T[mode];
  return (
    <div style={{ position: "absolute", left: 540 - 250, top: y, width: 500, height: 60, borderRadius: 30, background: th.card, boxShadow: th.shadow, overflow: "hidden", direction: "rtl" }}>
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${p * 100}%`, background: mode === "dark" ? "rgba(229,72,77,.22)" : "rgba(229,72,77,.12)" }} />
      <div style={{ position: "absolute", right: 26, top: 0, height: 60, display: "flex", alignItems: "center", gap: 12, fontFamily: FONT_TEXT, fontSize: 25, color: th.text }}>
        <span style={{ width: 11, height: 11, borderRadius: 6, background: C.red, display: "inline-block" }} />
        پرامپت · آخر ویدیو
      </div>
      <div style={{ position: "absolute", left: 26, top: 0, height: 60, display: "flex", alignItems: "center", fontFamily: FONT_TEXT, fontSize: 24, color: th.sub }}>
        {left > 0 ? `${left.toLocaleString("fa-IR")} ث` : "حالا!"}
      </div>
    </div>
  );
};

/* ───────── UI atoms ───────── */
export const Card: React.FC<{ mode: Mode; x: number; y: number; w: number; h?: number; a?: number; children?: React.ReactNode; style?: React.CSSProperties; pad?: number }> = ({ mode, x, y, w, h, a = 1, children, style, pad = 34 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: T[mode].card, borderRadius: 30, boxShadow: T[mode].shadow, border: `1.5px solid ${T[mode].cardLine}`,
    padding: pad, boxSizing: "border-box", fontFamily: FONT_UI, color: T[mode].text, opacity: a, transform: `translateY(${(1 - a) * 40}px) scale(${0.96 + 0.04 * a})`, ...style }}>
    {children}
  </div>
);

export const Missing: React.FC<{ a: number; label?: string; style?: React.CSSProperties }> = ({ a, label = "missing", style }) => (
  <span style={{ position: "absolute", display: "inline-block", background: C.red, color: "#fff", fontFamily: FONT_UI, fontWeight: 700, fontSize: 20, padding: "4px 14px", borderRadius: 16,
    transform: `rotate(-4deg) scale(${ramp(a * 10, 0, 10, easeBack)})`, opacity: a > 0 ? 1 : 0, boxShadow: "0 6px 14px rgba(229,72,77,.4)", ...style }}>{label}</span>
);

export const Toggle: React.FC<{ on: number; mode: Mode }> = ({ on, mode }) => (
  <span style={{ display: "inline-block", position: "relative", width: 78, height: 44, borderRadius: 22, background: interpolate(on, [0, 1], [0, 1]) > 0.5 ? C.green : T[mode].faint }}>
    <span style={{ position: "absolute", top: 5, left: 5 + on * 34, width: 34, height: 34, borderRadius: 17, background: "#fff", boxShadow: "0 2px 5px rgba(0,0,0,.25)" }} />
  </span>
);

export const Field: React.FC<{ mode: Mode; label: string; value?: string; w?: number; bad?: boolean; mono?: boolean; style?: React.CSSProperties }> = ({ mode, label, value = "", w = 560, bad, mono, style }) => (
  <div style={{ width: w, marginBottom: 20, ...style }}>
    <div style={{ fontSize: 20, color: T[mode].sub, marginBottom: 6 }}>{label}</div>
    <div style={{ height: 62, borderRadius: 14, background: bad ? C.redSoft : T[mode].field, border: bad ? `2.5px dashed ${C.red}` : "none", display: "flex", alignItems: "center", padding: "0 20px",
      fontSize: 26, fontFamily: mono ? FONT_MONO : FONT_UI, color: bad ? C.red : T[mode].text, boxSizing: "border-box" }}>{value}</div>
  </div>
);

export const Button: React.FC<{ label: string; color?: string; w?: number; press?: number }> = ({ label, color = C.blue, w = 560, press = 0 }) => (
  <div style={{ width: w, height: 70, borderRadius: 18, background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 27, fontWeight: 700, fontFamily: FONT_UI,
    transform: `scale(${1 - 0.04 * press})`, boxShadow: `0 10px 22px ${color}55` }}>{label}</div>
);

/** macOS-style pointer; click = 0..1 pulse. */
export const Cursor: React.FC<{ x: number; y: number; click?: number; a?: number }> = ({ x, y, click = 0, a = 1 }) => (
  <svg width="60" height="70" style={{ position: "absolute", left: x - 6, top: y - 4, opacity: a, overflow: "visible" }}>
    {click > 0 && click < 1 && <circle cx="6" cy="4" r={10 + click * 34} fill="none" stroke={C.blue} strokeWidth="4" opacity={1 - click} />}
    <path d="M6 4 L6 50 L18 39 L27 60 L35 56 L26 36 L42 36 Z" fill="#111" stroke="#fff" strokeWidth="3" strokeLinejoin="round" transform={`scale(${1 - 0.1 * Math.sin(Math.PI * clamp(click * 3))})`} />
  </svg>
);

/** Phone frame (content area 400×800 at inner offset). */
export const Phone: React.FC<{ x: number; y: number; s?: number; a?: number; screen?: string; children?: React.ReactNode }> = ({ x, y, s = 1, a = 1, screen = "#000", children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 440, height: 880, transform: `scale(${s})`, transformOrigin: "top left", opacity: a }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: 72, background: "#1c1c1f", boxShadow: "0 40px 90px rgba(0,0,0,.5), inset 0 0 0 3px #3a3a3f" }} />
    <div style={{ position: "absolute", inset: 14, borderRadius: 60, background: screen, overflow: "hidden" }}>{children}</div>
    <div style={{ position: "absolute", left: 160, top: 30, width: 120, height: 34, borderRadius: 17, background: "#000" }} />
  </div>
);

/** iOS-like notification row. */
export const Notif: React.FC<{ icon: string; color: string; app: string; title: string; body: string; a: number; red?: boolean }> = ({ icon, color, app, title, body, a, red }) => (
  <div style={{ margin: "0 14px 12px", padding: "16px 18px", borderRadius: 26, background: "rgba(60,60,66,.72)", backdropFilter: "blur(10px)", display: "flex", gap: 14, fontFamily: FONT_UI,
    opacity: a, transform: `translateY(${(1 - a) * -30}px) scale(${0.94 + 0.06 * a})`, border: red ? `2px solid ${C.red}` : "none" }}>
    <div style={{ width: 52, height: 52, borderRadius: 13, background: color, color: "#fff", fontWeight: 800, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, color: "#b9b9c0" }}><span>{app}</span><span>now</span></div>
      <div style={{ fontSize: 21, fontWeight: 700, color: "#fff" }}>{title}</div>
      <div style={{ fontSize: 19, color: red ? "#ff8a8d" : "#d6d6dc" }}>{body}</div>
    </div>
  </div>
);

/** Rubber stamp (Persian text ok). */
export const Stamp: React.FC<{ text: string; a: number; x: number; y: number; rot?: number; size?: number; color?: string }> = ({ text, a, x, y, rot = -8, size = 64, color = C.red }) => {
  const s = interpolate(ramp(a * 10, 0, 10, easeOut), [0, 1], [2.2, 1]);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: a > 0 ? Math.min(1, a * 3) * 0.92 : 0,
      border: `6px solid ${color}`, borderRadius: 14, padding: "6px 26px 12px", color, fontFamily: FONT_TEXT, fontSize: size, whiteSpace: "nowrap", direction: "rtl" }}>{text}</div>
  );
};

export const BigNum: React.FC<{ x: number; y: number; size?: number; color: string; children: React.ReactNode; a?: number }> = ({ x, y, size = 160, color, children, a = 1 }) => (
  <div style={{ position: "absolute", left: x - 400, top: y - size * 0.7, width: 800, textAlign: "center", fontFamily: FONT_NUM, fontSize: size, color, opacity: a, transform: `scale(${0.8 + 0.2 * a})`, direction: "ltr" }}>{children}</div>
);
