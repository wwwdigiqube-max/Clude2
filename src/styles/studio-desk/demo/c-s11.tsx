// Video 23 · S11 · «دیگه پیج بالا آوردن و کانال یوتیوب زدن با هوش مصنوعی از این راحت‌تر نمیشه» (98.4 – 104.25)
// Instagram profile + YouTube channel growth cards (live counters, charts, milestones) → «با هوش مصنوعی» chip →
// the cards collapse into four app tiles and the payoff title lands word by word with an orange underline.
import React from "react";
import { Ico } from "./ui";
import { C, S, UI, clamp, ease, grp, hit, kfmt, lerp, pop, ramp, spring } from "./lib";
import { ClaudeMark, Full, IgTile, Still, L, NfpAv, NfpMark, SP, T, Tap, XI, YtLockup, YtLogo, drift, shake } from "./c-kit";

const sm = (a: number, b: number, x: number) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
/** Instagram: compounding growth with two viral spikes */
const curveIG = (u: number) => 0.8 * Math.pow(u, 2.4) + 0.05 * u + 0.07 * sm(0.4, 0.45, u) + 0.11 * sm(0.66, 0.71, u) + 0.006 * Math.sin(u * 31) * u;
/** YouTube: steps on upload days */
const curveYT = (u: number) => 0.5 * Math.pow(u, 2) + [0.18, 0.36, 0.52, 0.68, 0.84].reduce((a, c) => a + 0.1 * sm(c, c + 0.035, u), 0);
type Cv = (u: number) => number;

const Chart: React.FC<{ t: number; t0: number; t1: number; w: number; h: number; max: number; marks: number[]; label: (v: number) => string; curve: Cv; days?: number }> = ({ t, t0, t1, w, h, max, marks, label, curve, days = 30 }) => {
  const g = ease.io(ramp(t, t0, t1));
  const N = 90;
  const pts = Array.from({ length: N + 1 }, (_, i) => i / N).filter((u) => u <= g + 1e-6).map((u) => [u * w, h - curve(u) * h * 0.92]);
  if (g > 0 && pts.length && pts[pts.length - 1][0] < g * w) pts.push([g * w, h - curve(g) * h * 0.92]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const head = pts[pts.length - 1] ?? [0, h];
  const cur = curve(g) / curve(1) * max;
  const crossT = (m: number) => {
    for (let q = t0; q <= t1; q += 0.01) if ((curve(ease.io(ramp(q, t0, t1))) / curve(1)) * max >= m) return q;
    return 1e9;
  };
  return (
    <div style={{ position: "relative", width: w, height: h, direction: "ltr" }}>
      <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.green} stopOpacity={0.28} /><stop offset="100%" stopColor={C.green} stopOpacity={0} /></linearGradient>
        </defs>
        {marks.map((m) => {
          const y = h - (m / max) * curve(1) * h * 0.92;
          const crossed = cur >= m;
          return (
            <g key={m}>
              <line x1={0} y1={y} x2={w} y2={y} stroke={crossed ? C.green : C.ink} strokeOpacity={crossed ? 0.45 : 0.12} strokeWidth={2} strokeDasharray="4 8" />
            </g>
          );
        })}
        <line x1={0} y1={h} x2={w} y2={h} stroke={C.ink} strokeOpacity={0.15} strokeWidth={2} />
        {pts.length > 1 && <path d={`${d} L${head[0]},${h} L0,${h} Z`} fill="url(#cg)" />}
        {pts.length > 1 && <path d={d} stroke={C.green} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
        {g > 0 && <circle cx={head[0]} cy={head[1]} r={11} fill="#fff" stroke={C.green} strokeWidth={5} />}
        {g > 0 && g < 1 && <circle cx={head[0]} cy={head[1]} r={22 + 8 * Math.sin(t * 12)} fill={C.green} opacity={0.15} />}
      </svg>
      {marks.map((m) => {
        const y = h - (m / max) * curve(1) * h * 0.92;
        const crossed = cur >= m;
        const tc = t;
        return (
          <div key={m} style={{ position: "absolute", left: 0, top: y - 26, display: "flex", alignItems: "center", gap: 6, fontFamily: UI, fontWeight: 800, fontSize: 17, color: crossed ? C.green : C.ink3, transform: `scale(${1 + hit(tc, crossT(m), 0.3) * 0.3})`, transformOrigin: "0 50%" }}>
            {crossed && <div style={{ width: 8, height: 8, borderRadius: 4, background: C.green }} />}
            {label(m)}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, top: h + 8, fontFamily: UI, fontWeight: 600, fontSize: 15, color: C.ink3 }}>DAY 1</div>
      <div style={{ position: "absolute", right: 0, top: h + 8, fontFamily: UI, fontWeight: 600, fontSize: 15, color: C.ink3 }}>{`DAY ${days}`}</div>
      {g > 0.04 && (
        <div style={{ position: "absolute", left: clamp(head[0] - 70, 0, w - 140), top: head[1] < h * 0.55 ? head[1] + 20 : head[1] - 62, width: 140, display: "flex", justifyContent: "center" }}>
          <div style={{ padding: "6px 12px", borderRadius: 10, background: C.ink, color: "#fff", fontFamily: UI, fontWeight: 800, fontSize: 18, boxShadow: "0 6px 16px rgba(0,0,0,.25)", whiteSpace: "nowrap" }}>{`+${grp(cur)}`}</div>
        </div>
      )}
    </div>
  );
};

const Stat: React.FC<{ v: string; l: string; hl?: boolean }> = ({ v, l, hl }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 150 }}>
    <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 50, color: hl ? C.ink : C.ink, letterSpacing: -1, lineHeight: 1.05, direction: "ltr" }}>{v}</div>
    <T s={25} w={600} c={C.ink3}>{l}</T>
  </div>
);

export const S11Close: React.FC<SP> = ({ t }) => {
  if (t < 98.4 || t > 104.25) return null;
  const T_IG = S(278), T_SUB = S(284), T_AI = S(286), T1 = S(288), T2 = S(290), T3 = S(291);
  const inK = ease.out(ramp(t, 98.4, 98.82));
  const kYt = spring(t, 99.35, 0.6, 0.22);
  const col = ease.in(ramp(t, 102.12, 102.5));
  const exitUp = ease.in(ramp(t, 103.95, 104.24));
  const dr = drift(t, 1);
  const sh = shake(t, T2, 10, 0.4);
  const sh3 = shake(t, T3, 14, 0.45);
  const fol = (curveIG(ease.io(ramp(t, T_IG, 100.6))) / curveIG(1)) * 90000;
  const posts = Math.round(20 * ease.out(ramp(t, T_IG + 0.05, 100.3)));
  const subs = (curveYT(ease.io(ramp(t, 100.45, 101.75))) / curveYT(1)) * 23000;
  const subbed = t >= T_SUB;
  const kAi = spring(t, T_AI - 0.04, 0.5, 0.3);
  const push = 1 + ease.out(ramp(t, 102.6, 104.2)) * 0.035 + hit(t, T3, 0.3) * 0.04;
  // collapse targets (icon tiles)
  const tiles = [
    { x: 540 - 309, el: <IgTile s={132} /> },
    { x: 540 - 309 + 162, el: <div style={{ width: 132, height: 132, borderRadius: 32, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><YtLogo s={86} /></div> },
    { x: 540 - 309 + 324, el: <div style={{ width: 132, height: 132, borderRadius: 32, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><ClaudeMark s={80} /></div> },
    { x: 540 - 309 + 486, el: <div style={{ width: 132, height: 132, borderRadius: 32, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}><NfpMark s={44} c={C.neon} /></div> },
  ];
  const TY = 1012;
  return (
    <Full style={{ transform: `translate(${(1 - inK) * 1150 + dr.x}px, ${-exitUp * 1100 + dr.y}px) skewX(${(1 - inK) * -6}deg)` }}>
      {/* ═══ growth cards ═══ */}
      {col < 1 && (
        <>
          {/* Instagram profile */}
          <div style={{ position: "absolute", left: 60, top: 168, width: 960, height: 520, borderRadius: 40, background: "#fff", boxShadow: "0 2px 3px rgba(0,0,0,.06), 0 24px 70px rgba(20,20,30,.14)", overflow: "hidden", transformOrigin: `${tiles[0].x + 66 - 60}px ${TY + 66 - 168}px`, transform: `scale(${lerp(1, 0.14, col)})`, opacity: 1 - ramp(col, 0.6, 1) }}>
            <div style={{ position: "absolute", right: 34, top: 30, width: 136, height: 136, borderRadius: 68, background: `conic-gradient(from ${t * 120}deg, #F9CE34, #EE2A7B, #6228D7, #EE2A7B, #F9CE34)`, padding: 5 }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#fff", padding: 4 }}><NfpAv s={118} /></div>
            </div>
            <div style={{ position: "absolute", right: 200, top: 46, display: "flex", gap: 6, direction: "rtl" }}>
              <Stat v={String(posts)} l="پست" />
              <Stat v={grp(fol)} l="دنبال‌کننده" hl />
              <Stat v="12" l="دنبال‌شونده" />
            </div>
            <div style={{ position: "absolute", left: 32, top: 30, display: "flex", alignItems: "center", gap: 10 }}>
              <IgTile s={46} />
            </div>
            <div style={{ position: "absolute", right: 36, top: 182, display: "flex", alignItems: "center", gap: 12, direction: "rtl" }}>
              <L s={30} w={800}>nfp.studio</L>
              {t >= T_AI + 0.1 && <div style={{ transform: `scale(${pop(t, T_AI + 0.1, 0.3)})`, display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, background: C.ink }}><Ico n="sparkle" s={16} c={C.neon} fill /><L s={15} w={800} c="#fff">AI</L></div>}
              <T s={25} w={600} c={C.ink3}>· ریلزهای هوش مصنوعی، هر روز</T>
            </div>
            <div style={{ position: "absolute", left: 32, top: 182, padding: "6px 14px", borderRadius: 999, background: "#FFF0E8", display: "flex", alignItems: "center", gap: 6, opacity: ramp(t, T_IG + 0.2, T_IG + 0.4) }}>
              <Ico n="play" s={16} c={C.green} fill />
              <L s={18} w={800} c={C.green}>{`TOP REEL · ${kfmt(11e6 * ease.out(ramp(t, T_IG + 0.2, 100.4)))}`}</L>
            </div>
            <div style={{ position: "absolute", left: 40, top: 262 }}>
              <Chart t={t} t0={T_IG} t1={100.6} w={850} h={190} max={90000} marks={[10000, 50000]} label={(m) => `${m / 1000}K`} curve={curveIG} />
            </div>
          </div>
          {/* YouTube channel */}
          {kYt > 0 && (
            <div style={{ position: "absolute", left: 60, top: 728, width: 960, height: 520, borderRadius: 40, background: "#fff", boxShadow: "0 2px 3px rgba(0,0,0,.06), 0 24px 70px rgba(20,20,30,.14)", overflow: "hidden", transformOrigin: `${tiles[1].x + 66 - 60}px ${TY + 66 - 728}px`, transform: `translateY(${(1 - kYt) * 760}px) scale(${lerp(1, 0.14, col)})`, opacity: 1 - ramp(col, 0.6, 1) }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 92, background: "linear-gradient(100deg,#16171A,#2A2B31 60%,#3A2A22)" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 960, display: "flex", gap: 8, opacity: 0.35, transform: `translateX(${-(t * 20) % 130}px)` }}>
                  {Array.from({ length: 9 }, (_, i) => <div key={i} style={{ width: 122, height: 92, flex: "none", overflow: "hidden", borderRadius: 6 }}><Still id={[37, 34, 36, 35, 30, 37, 34, 36, 35][i]} /></div>)}
                </div>
                <div style={{ position: "absolute", left: 32, top: 26 }}><YtLockup s={30} dark /></div>
              </div>
              <div style={{ position: "absolute", right: 34, top: 50, width: 136, height: 136, borderRadius: 68, background: C.ink, border: "6px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(0,0,0,.18)" }}><NfpMark s={46} c={C.neon} /></div>
              <div style={{ position: "absolute", right: 196, top: 104, textAlign: "right", direction: "rtl" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, direction: "rtl" }}>
                  <L s={38} w={800}>NFP Studio</L>
                  {t >= T_AI + 0.2 && <div style={{ transform: `scale(${pop(t, T_AI + 0.2, 0.3)})`, display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, background: C.ink }}><Ico n="sparkle" s={16} c={C.neon} fill /><L s={15} w={800} c="#fff">AI</L></div>}
                </div>
                <L s={20} w={500} c="#606060" style={{ marginTop: 4 }}>{`@nfp.studio · ${grp(subs)} subscribers · 12 days`}</L>
              </div>
              <div style={{ position: "absolute", left: 32, top: 120, padding: "14px 26px", borderRadius: 999, background: subbed ? "#F2F2F2" : "#0F0F0F", display: "flex", alignItems: "center", gap: 8, transform: `scale(${1 + hit(t, T_SUB, 0.3) * 0.12})` }}>
                {subbed && <XI n="bellOn" s={22} c="#0F0F0F" w={2} />}
                <span style={{ fontFamily: UI, fontWeight: 700, fontSize: 21, color: subbed ? "#0F0F0F" : "#fff" }}>{subbed ? "Subscribed" : "Subscribe"}</span>
              </div>
              <Tap t={t} t0={T_SUB} x={32 + 90} y={120 + 26} from={[160, 200]} />
              <div style={{ position: "absolute", left: 40, top: 262 }}>
                <Chart t={t} t0={100.45} t1={101.75} w={850} h={190} max={23000} marks={[10000, 20000]} label={(m) => `${m / 1000}K`} curve={curveYT} days={12} />
              </div>
            </div>
          )}
          {/* «با هوش مصنوعی» chip on the seam */}
          {kAi > 0 && (
            <div style={{ position: "absolute", left: 0, right: 0, top: 660, display: "flex", justifyContent: "center", opacity: 1 - ramp(col, 0.2, 0.6) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 36px", borderRadius: 999, background: C.ink, boxShadow: "0 18px 40px rgba(0,0,0,.35)", transform: `scale(${0.3 + 0.7 * kAi}) rotate(${(1 - Math.min(1, kAi)) * -8}deg)`, direction: "rtl" }}>
                <div style={{ transform: `rotate(${t * 90}deg)` }}><Ico n="sparkle" s={44} c={C.neon} fill /></div>
                <T s={52} w={900} c="#fff">با <span style={{ color: C.neon }}>هوش مصنوعی</span></T>
              </div>
            </div>
          )}
        </>
      )}
      {/* ═══ payoff ═══ */}
      {t >= T1 - 0.05 && (
        <div style={{ position: "absolute", inset: 0, transform: `translate(${sh.x + sh3.x}px, ${sh.y + sh3.y}px) scale(${push})`, transformOrigin: "540px 620px" }}>
          {(() => {
            const k1 = ease.out(ramp(t, T1 - 0.05, T1 + 0.25));
            const k2 = spring(t, T2 - 0.04, 0.45, 0.3);
            const k3 = spring(t, T3 - 0.04, 0.45, 0.3);
            const ul = ease.io(ramp(t, T2 + 0.12, T3 + 0.05));
            return (
              <>
                <T s={124} w={900} style={{ position: "absolute", left: 0, right: 0, top: 236, textAlign: "center", opacity: k1, transform: `translateY(${(1 - k1) * -70}px)`, display: "flex", justifyContent: "center", gap: 34 }}><span>از</span><span>این</span></T>
                {t >= T2 - 0.04 && <T s={250} w={900} style={{ position: "absolute", left: 0, right: 0, top: 366, textAlign: "center", lineHeight: 1.15, transform: `scale(${1 + (1 - k2) * 0.9})`, opacity: clamp((t - T2) * 9 + 0.3) }}>راحت‌تر</T>}
                {ul > 0.01 && <svg width={1080} height={200} style={{ position: "absolute", left: 0, top: 640, overflow: "visible" }}>
                  <path d="M890 52 C 760 30, 560 70, 400 46 S 210 40, 175 62 L 205 50" stroke={C.green} strokeWidth={22 + hit(t, T3, 0.35) * 12} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${ul} 2`} />
                </svg>}
                {t >= T3 - 0.04 && <T s={170} w={900} c={C.green} style={{ position: "absolute", left: 0, right: 0, top: 712, textAlign: "center", transform: `translateY(${(1 - Math.min(1, k3)) * 30}px) scale(${0.85 + 0.15 * k3})`, clipPath: `inset(-40px 0 -40px ${(1 - ease.out(ramp(t, T3 - 0.04, T3 + 0.2))) * 100}%)` }}>نمیشه</T>}
              </>
            );
          })()}
        </div>
      )}
      {/* the four tiles: IG · YouTube · Claude · NFP */}
      {tiles.map((tl, i) => {
        const t0 = 102.36 + i * 0.07;
        if (t < t0) return null;
        const f = ease.out(ramp(t, t0, t0 + 0.4));
        const from = [[540 - 66, 360], [540 - 66, 920], [540 - 66, -260], [1180, TY]][i];
        const pulse = hit(t, T3 + 0.05 + i * 0.07, 0.32);
        const bob = Math.sin(t * 2.4 + i * 1.3) * 6 - pulse * 24;
        return (
          <div key={i} style={{ position: "absolute", left: lerp(from[0], tl.x, f), top: lerp(from[1], TY, f) + bob, width: 132, height: 132, borderRadius: 32, boxShadow: `0 2px 3px rgba(0,0,0,.08), 0 18px 40px rgba(20,20,30,.16), 0 0 0 ${pulse * 7}px rgba(242,92,31,${0.9 * pulse})`, transform: `scale(${lerp(0.4, 1, f)}) rotate(${(1 - f) * (i % 2 ? 14 : -14)}deg)`, opacity: Math.min(1, f * 3) }}>
            {tl.el}
            {i < 3 && <div style={{ position: "absolute", left: 132 + 2, top: 46, width: 30, height: 40, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UI, fontWeight: 800, fontSize: 38, color: C.ink2, opacity: ramp(t, 102.85, 103.0) }}>+</div>}
          </div>
        );
      })}
    </Full>
  );
};
