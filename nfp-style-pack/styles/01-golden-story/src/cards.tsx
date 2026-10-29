import React from "react";
import { AbsoluteFill } from "remotion";
import { C, clamp, eback, eo, F_HEAD, F_TEXT, fa, lerp, pr, rnd } from "./lib";

// ---------- icons (flat, coded) ----------
const Icon: React.FC<{ k: string; c?: string }> = ({ k, c = C.burnt }) => (
  <svg width={70} height={70} viewBox="0 0 70 70">
    {k === "water" && <path d="M35 8 C 50 30 56 40 56 48 A21 21 0 0 1 14 48 C 14 40 20 30 35 8 Z" fill={C.water} stroke={C.choco} strokeWidth={4} />}
    {k === "food" && (
      <g stroke={C.choco} strokeWidth={4}>
        <rect x={16} y={14} width={38} height={44} rx={6} fill={c} />
        <line x1={16} y1={26} x2={54} y2={26} />
        <line x1={16} y1={46} x2={54} y2={46} />
      </g>
    )}
    {k === "fuel" && (
      <g stroke={C.choco} strokeWidth={4}>
        <rect x={14} y={18} width={40} height={42} rx={6} fill={C.red} />
        <path d="M22 18 L22 10 L44 10 L50 18" fill="none" />
        <line x1={22} y1={30} x2={46} y2={50} />
      </g>
    )}
    {k === "hay" && (
      <g stroke={C.choco} strokeWidth={4}>
        <rect x={10} y={20} width={50} height={34} rx={6} fill={C.ochre} />
        <line x1={24} y1={20} x2={24} y2={54} />
        <line x1={46} y1={20} x2={46} y2={54} />
      </g>
    )}
    {k === "med" && (
      <g stroke={C.choco} strokeWidth={4}>
        <rect x={12} y={16} width={46} height={40} rx={8} fill={C.cream} />
        <path d="M30 26 h10 v8 h8 v10 h-8 v8 h-10 v-8 h-8 v-10 h8 Z" fill={C.red} strokeWidth={2} />
      </g>
    )}
  </svg>
);

const ROWS = [
  { k: "water", label: "آب ذخیره", v: 0.82 },
  { k: "food", label: "غذای کنسروی", v: 0.68 },
  { k: "fuel", label: "سوخت ژنراتور", v: 0.45 },
  { k: "hay", label: "خوراک حیوون‌ها", v: 0.58 },
  { k: "med", label: "دارو", v: 0.14, low: true },
];

export const Inventory: React.FC<{ t: number; t0: number; rowsAt: number }> = ({ t, t0, rowsAt }) => {
  const p = pr(t, t0, 0.5, eback);
  const drift = (t - t0) * 6;
  return (
    <div
      style={{
        position: "absolute",
        left: 540,
        top: 700,
        width: 900,
        transform: `translate(-50%,-50%) translateY(${lerp(900, 0, p) - drift}px) rotate(${lerp(8, -1.5, p)}deg)`,
        background: C.cream,
        borderRadius: 26,
        boxShadow: "0 30px 70px rgba(0,0,0,.55)",
        padding: "34px 50px 46px",
        direction: "rtl",
        backgroundImage: "repeating-linear-gradient(0deg, rgba(58,36,24,.09) 0 2px, transparent 2px 64px)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `4px solid ${C.choco}`, paddingBottom: 12 }}>
        <span style={{ fontFamily: F_HEAD, fontSize: 76, color: C.choco }}>موجودی</span>
        <span style={{ fontFamily: F_TEXT, fontSize: 40, color: C.cream, background: C.burnt, borderRadius: 30, padding: "4px 24px 8px" }}>روز اول</span>
      </div>
      {ROWS.map((r, i) => {
        const rp = pr(t, rowsAt + i * 0.22, 0.35, eback);
        const fill = pr(t, rowsAt + i * 0.22 + 0.15, 0.7);
        return (
          <div
            key={r.k}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              marginTop: 26,
              opacity: clamp(rp * 2),
              transform: `translateX(${(1 - rp) * -80}px)`,
            }}
          >
            <Icon k={r.k} />
            <span style={{ fontFamily: F_TEXT, fontSize: 46, color: C.choco, width: 300 }}>{r.label}</span>
            <div style={{ flex: 1, height: 30, borderRadius: 15, background: "rgba(58,36,24,.15)", overflow: "hidden" }}>
              <div style={{ width: `${r.v * fill * 100}%`, height: "100%", borderRadius: 15, background: r.low ? C.red : C.amber }} />
            </div>
            {r.low && fill > 0.6 && (
              <span style={{ fontFamily: F_TEXT, fontSize: 38, color: C.cream, background: C.red, borderRadius: 20, padding: "2px 16px 6px", transform: `scale(${pr(t, rowsAt + 1.4, 0.3, eback)})` }}>
                کم
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ---------- weeks strip («چند هفته») ----------
export const Weeks: React.FC<{ t: number; t0: number; t1?: number }> = ({ t, t0, t1 = 1e9 }) => {
  if (t < t0) return null;
  const p = pr(t, t0, 0.4, eback), o = 1 - pr(t, t1, 0.3);
  return (
    <div style={{ position: "absolute", left: 540, top: 330, transform: `translate(-50%,0) scale(${p})`, opacity: o, direction: "rtl", display: "flex", gap: 16 }}>
      {[1, 2, 3, 4].map((w, i) => {
        const fp = pr(t, t0 + 0.25 + i * 0.22, 0.3, eback);
        return (
          <div
            key={w}
            style={{
              width: 170,
              height: 150,
              borderRadius: 22,
              background: fp > 0.5 ? C.amber : "rgba(30,18,12,.7)",
              border: `4px solid ${C.cream}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${0.85 + 0.15 * fp})`,
              boxShadow: "0 12px 30px rgba(0,0,0,.4)",
            }}
          >
            <span style={{ fontFamily: F_TEXT, fontSize: 34, color: fp > 0.5 ? C.choco : C.cream }}>هفته</span>
            <span style={{ fontFamily: F_HEAD, fontSize: 70, lineHeight: 1, color: fp > 0.5 ? C.choco : C.cream }}>{fa(w)}</span>
          </div>
        );
      })}
    </div>
  );
};

// ---------- noise meter (Ellie silent vs. the whole farm) ----------
export const NoiseMeter: React.FC<{ t: number; t0: number; level: number; label: string }> = ({ t, t0, level, label }) => {
  if (t < t0) return null;
  const p = pr(t, t0, 0.4, eback);
  const N = 14;
  return (
    <div
      style={{
        position: "absolute",
        left: 540,
        top: 330,
        transform: `translate(-50%,0) scale(${p})`,
        background: "rgba(30,18,12,.82)",
        border: `3px solid rgba(246,231,204,.35)`,
        borderRadius: 30,
        padding: "18px 34px 22px",
        direction: "rtl",
        display: "flex",
        alignItems: "center",
        gap: 24,
      }}
    >
      <span style={{ fontFamily: F_TEXT, fontSize: 42, color: C.cream, whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ display: "flex", gap: 7, alignItems: "flex-end", direction: "ltr" }}>
        {Array.from({ length: N }, (_, i) => {
          const lit = i / N < level + Math.sin(t * 17 + i) * 0.04 * level;
          const col = i > N * 0.72 ? C.red : i > N * 0.45 ? C.amber : C.cream;
          return <div key={i} style={{ width: 16, height: 26 + i * 4, borderRadius: 4, background: lit ? col : "rgba(246,231,204,.15)" }} />;
        })}
      </div>
      <span style={{ fontFamily: F_HEAD, fontSize: 56, color: level > 0.7 ? C.red : C.cream, width: 90, textAlign: "center" }}>
        {level < 0.02 ? fa(0) : fa(Math.round(level * 100))}
      </span>
    </div>
  );
};

// ---------- end card: «قسمت دوم» ----------
export const Part2: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const lt = t - t0;
  const p = pr(lt, 0.1, 0.5, eback);
  const line = pr(lt, 0.45, 0.6);
  const sub = pr(lt, 0.8, 0.4);
  const slit = 0.6 + 0.4 * Math.sin(lt * 2.2);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #3A2418 0%, #140B07 75%)" }}>
      {/* barn doors with a slit of light */}
      <svg width={1080} height={1920} style={{ position: "absolute", opacity: 0.55 }}>
        <g transform={`translate(540,1040) scale(${1 + lt * 0.02})`}>
          <rect x={-330} y={-420} width={320} height={760} fill="#2A1810" stroke="#4A2C1A" strokeWidth={10} />
          <rect x={10} y={-420} width={320} height={760} fill="#2A1810" stroke="#4A2C1A" strokeWidth={10} />
          <path d="M-330 -420 L-10 340 M-10 -420 L-330 340 M10 -420 L330 340 M330 -420 L10 340" stroke="#4A2C1A" strokeWidth={10} />
          <rect x={-10} y={-420} width={20} height={760} fill={C.red} opacity={0.35 * slit} />
          <rect x={-4} y={-420} width={8} height={760} fill="#FF8A5B" opacity={0.8 * slit} />
          <polygon points="-140,-500 0,-610 140,-500" fill="none" stroke="#4A2C1A" strokeWidth={10} />
        </g>
      </svg>
      {Array.from({ length: 26 }, (_, i) => {
        const y = (rnd(i) * 1920 - lt * (20 + rnd(i + 3) * 30)) % 1920;
        return <div key={i} style={{ position: "absolute", left: rnd(i + 7) * 1080, top: (y + 1920) % 1920, width: 5, height: 5, borderRadius: 3, background: C.amber, opacity: 0.25 + rnd(i + 1) * 0.3 }} />;
      })}
      <div style={{ position: "absolute", top: 560, width: 1080, textAlign: "center", direction: "rtl" }}>
        <div style={{ fontFamily: F_HEAD, fontSize: 230, color: C.cream, transform: `scale(${p})`, opacity: clamp(p * 2), textShadow: "0 14px 40px rgba(0,0,0,.6)" }}>
          قسمت دوم
        </div>
        <div style={{ margin: "0 auto", width: 520 * line, height: 12, borderRadius: 6, background: C.red }} />
        <div style={{ fontFamily: F_TEXT, fontSize: 72, color: C.red, marginTop: 40, opacity: sub, transform: `translateY(${(1 - sub) * 20}px)` }}>
          کی توی انبار بود؟
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1480,
          width: 1080,
          textAlign: "center",
          direction: "rtl",
          fontFamily: F_TEXT,
          fontSize: 44,
          color: C.cream,
          opacity: 0.75 * pr(lt, 1.3, 0.5, eo),
        }}
      >
        فالو کن تا قسمت بعد رو از دست ندی
      </div>
    </AbsoluteFill>
  );
};
