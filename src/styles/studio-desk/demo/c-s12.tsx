// Video 23 · S12 · «اگه می‌خوای توی این مسیر یادگیری کنار ما باشی، کافیه کلمه‌ی شروع رو همین جا برام بفرستی. دوشنبه رأس ساعت 12 ظهر» (104.0 – 114)
// a 30-day road with the group walking together → an Instagram comment sheet: «شروع» typed on a Persian keyboard, sent,
// then a flood of «شروع» → «دوشنبه» calendar + a watch whose hands land on 12:00 → «ظهر» → a closing ring + slow push-in that holds to 113.0 (no end card).
import React from "react";
import { Clip, Ico } from "./ui";
import { C, FA, MONO, NUM, S, SHADOW, UI, clamp, ease, grp, hit, lerp, pop, ramp, rnd, spring } from "./lib";
import { Av, Cam, Full, L, MeAv, SP, Shock, T, Tap, XI, drift, track, trackV } from "./c-kit";

// ── the 30-day road (content coords)
const PX = (u: number) => 540 - 330 * Math.sin(u * Math.PI * 2);
const PY = (u: number) => 1240 - u * 1000;
const MILES = [
  { u: 0, d: 1, ic: "play", side: 1 },
  { u: 0.25, d: 7, ic: "user", side: 1 },
  { u: 0.5, d: 14, ic: "palette", side: -1 },
  { u: 0.75, d: 21, ic: "loop", side: -1 },
  { u: 1, d: 30, ic: "star", side: -1 },
];
/** day number at road position u (piecewise through the milestones) */
const dayOf = (u: number) => {
  for (let i = 1; i < MILES.length; i++) if (u <= MILES[i].u) return Math.floor(MILES[i - 1].d + ((u - MILES[i - 1].u) / (MILES[i].u - MILES[i - 1].u)) * (MILES[i].d - MILES[i - 1].d));
  return 30;
};
const roadD = (u1: number, n = 90) => Array.from({ length: n + 1 }, (_, i) => (i / n) * u1).map((u, i) => `${i ? "L" : "M"}${PX(u).toFixed(1)},${PY(u).toFixed(1)}`).join(" ");
const normal = (u: number) => {
  const e = 0.002;
  const dx = PX(u + e) - PX(u - e), dy = PY(u + e) - PY(u - e);
  const l = Math.hypot(dx, dy);
  return [-dy / l, dx / l];
};
/** faint topographic contour rings (a map under the road) */
const CONTOURS = [[860, 1180, 0.4], [210, 560, 2.1], [900, 330, 4.2]].flatMap(([cx, cy, ph]) =>
  Array.from({ length: 8 }, (_, k) => {
    const r0 = 70 + k * 48;
    return Array.from({ length: 73 }, (_, i) => {
      const a = (i / 72) * Math.PI * 2;
      const r = r0 * (1 + 0.13 * Math.sin(3 * a + ph + k * 0.35) + 0.06 * Math.sin(5 * a + ph * 2 - k * 0.5));
      return `${i ? "L" : "M"}${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r * 0.82).toFixed(1)}`;
    }).join(" ") + " Z";
  }),
);
const WALKERS = [
  { id: 43, du: 0.03, off: -46 },
  { id: 38, du: 0.03, off: 46 },
  { id: 44, du: -0.026, off: -46 },
  { id: 45, du: -0.026, off: 46 },
];

// ── comments
const USERS = ["sara.design", "mamad.ai", "neda.films", "reza.edits", "parisa.studio", "ali.creates", "mina.reels", "amir.motion", "yasi.ai", "hoda.frames", "kian.cuts", "taraneh.vfx"];
const OLD = [
  { u: "sara.design", av: 15, tm: "2m", tx: "این واقعاً با هوش مصنوعیه؟!", lk: 312 },
  { u: "mamad.ai", av: 39, tm: "6m", tx: "من هم می‌خوام یاد بگیرم", lk: 148 },
  { u: "neda.films", av: 23, tm: "9m", tx: "فایل NFP رو از کجا بگیرم؟", lk: 96 },
  { u: "reza.edits", av: 27, tm: "14m", tx: "کیفیتش عالیه", lk: 51 },
];
const FLOOD_T0 = 108.82, FLOOD_DT = 0.05, FLOOD_N = 16;
const FLOOD_TX = ["شروع", "شروع 🔥", "شروع", "شروع!", "شروع ✋", "شروع", "شروع 🙌", "شروع", "شروع", "شروع 🔥", "شروع!!", "شروع", "شروع 👏", "شروع", "شروع ✋", "شروع"];
const AVS = [14, 16, 20, 21, 24, 25, 28, 29, 35, 18, 22, 26, 31, 34, 17, 19];
// Persian iOS keyboard (left → right)
const KB = [
  ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج", "چ"],
  ["ش", "س", "ی", "ب", "ل", "ا", "ت", "ن", "م", "ک", "گ"],
  ["ظ", "ط", "ز", "ر", "ذ", "د", "پ", "و"],
];
const TYPE: [string, number, number][] = [["ش", 107.6, 0.36], ["ر", 107.72, 0.52], ["و", 107.84, 0.74], ["ع", 107.96, 1]];
const WEEK = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

export const S12Cta: React.FC<SP> = ({ t }) => {
  if (t < 104.0) return null;
  const tPath = S(296), tLearn = S(297), tUs = S(298), tBe = S(300), tSend = S(307) + 0.04, tMon = S(309), t12 = S(312), tNoon = S(313);
  const dr = drift(t, 1);
  // phase envelopes
  const swipe = ease.io(ramp(t, 106.62, 106.95)); // Instagram-style swipe up into the reel
  const pathOut = swipe;
  const sheetK = ease.out(ramp(t, 106.96, 107.3));
  const sheetOut = ease.in(ramp(t, 109.3, 109.62));
  const reelK = (t >= 106.62 ? 1 : 0) * (1 - ramp(t, 109.38, 109.62));
  return (
    <Full>
      {/* ═══ A · the learning road ═══ */}
      {pathOut < 1 && <div style={{ position: "absolute", inset: 0, transform: `translateY(${-swipe * 1920}px)` }}><Road t={t} tPath={tPath} tLearn={tLearn} tUs={tUs} tBe={tBe} o={1} dr={dr} /></div>}
      {/* ═══ B · the reel behind + comment sheet ═══ */}
      {reelK > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: reelK, background: "#000", transform: `translateY(${(1 - swipe) * 1920}px)` }}>
          <div style={{ position: "absolute", inset: 0, filter: "brightness(.62)", transform: `scale(${1.04 - sheetK * 0.04})` }}><Clip src="koroush.mp4" t0={106.7} dur={8} from={3.4} /></div>
          <FloatingStarts t={t} />
        </div>
      )}
      {sheetK > 0 && sheetOut < 1 && <Sheet t={t} k={sheetK} out={sheetOut} tSend={tSend} />}
      {/* ═══ C · Monday 12:00 ═══ */}
      {t > tMon - 0.25 && <Monday t={t} tMon={tMon} t12={t12} tNoon={tNoon} dr={dr} />}
    </Full>
  );
};

// ─────────────────────────────── A · road
const Road: React.FC<{ t: number; tPath: number; tLearn: number; tUs: number; tBe: number; o: number; dr: { x: number; y: number; r: number } }> = ({ t, tPath, tLearn, tUs, tBe, o, dr }) => {
  const pp = ease.io(ramp(t, tPath - 0.05, tLearn + 0.3));
  // group centre walks up the road on «کنار ما»
  const uc = track(t, [[tUs - 0.25, 0.035], [106.98, 0.13]], (k) => k);
  const walking = t > tUs - 0.25 && t < 106.98;
  const ent = ease.out(ramp(t, 104.0, 104.2));
  const [sx, sy, sax, say, ss] = trackV(t, [
    [104.0, [540, 1150, 540, 860, 1.38]],
    [104.85, [545, 1130, 540, 870, 1.32]],
    [105.85, [540, 740, 540, 722, 0.9]],
  ]);
  // follow-cam on the group (close-up), blended in after the whole-road reveal
  const fw = ease.io(ramp(t, 105.86, 106.3));
  const fx = lerp(sx, PX(uc) + 10, fw), fy = lerp(sy, PY(uc) - 30, fw), ax = lerp(sax, 540, fw), ay = lerp(say, 760, fw), s = lerp(ss, 1.72, fw);
  const labelO = 1 - ramp(t, 105.9, 106.15);
  const zoomOut = 0;
  const [gnx, gny] = normal(uc);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, transform: `translateY(${(1 - ent) * 900}px) scale(${1 - zoomOut * 0.12})`, transformOrigin: "540px 760px" }}>
      <Cam fx={fx} fy={fy} ax={ax + dr.x} ay={ay + dr.y} s={s} r={dr.r}>
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {CONTOURS.map((d, i) => <path key={i} d={d} stroke={C.ink} strokeOpacity={0.07} strokeWidth={2} fill="none" />)}
          <path d={roadD(1)} stroke={C.ink} strokeOpacity={0.34} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray="2 17" strokeDashoffset={-t * 20} />
          {MILES.slice(1).map((m, i) => <circle key={i} cx={PX(m.u)} cy={PY(m.u)} r={36} fill="none" stroke={C.ink} strokeOpacity={0.28 * ramp(t, 104.08 + i * 0.05, 104.25 + i * 0.05)} strokeWidth={4} strokeDasharray="6 9" />)}
          {pp > 0 && <path d={roadD(pp)} stroke="#fff" strokeWidth={62} fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 8px 14px rgba(20,20,30,.12))" }} />}
          {pp > 0 && <path d={roadD(pp)} stroke={C.ink} strokeOpacity={0.18} strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray="14 18" strokeDashoffset={-t * 30} />}
          {t > tUs - 0.25 && <path d={roadD(Math.min(uc + 0.03, pp))} stroke={C.green} strokeWidth={14} fill="none" strokeLinecap="round" />}
          <circle cx={PX(0)} cy={PY(0)} r={12} fill={C.green} />
        </svg>
        {/* milestones */}
        {MILES.map((m, i) => {
          const k = i === 0 ? pop(t, 104.06, 0.4) : pop(t, lerp(tPath - 0.05, tLearn + 0.3, m.u) - 0.02, 0.4);
          if (k <= 0) return null;
          const x = PX(m.u), y = PY(m.u);
          const reached = uc + 0.03 >= m.u - 0.01 && t > tUs - 0.25;
          const fin = m.d === 30;
          return (
            <React.Fragment key={i}>
              <div style={{ position: "absolute", left: x - 42, top: y - 42, width: 84, height: 84, borderRadius: 42, background: fin ? C.green : reached ? C.ink : "#fff", border: `6px solid ${fin ? "#fff" : C.ink}`, boxShadow: SHADOW, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k})` }}>
                <Ico n={m.ic} s={38} c={fin || reached ? "#fff" : C.ink} w={2.4} fill={m.ic === "play" || m.ic === "star"} />
              </div>
              <div style={{ position: "absolute", left: m.side > 0 ? x + 60 : x - 60 - 190, top: y - 34, width: 190, display: "flex", justifyContent: m.side > 0 ? "flex-start" : "flex-end", transform: `scale(${k})`, transformOrigin: m.side > 0 ? "0 50%" : "100% 50%", opacity: labelO }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 999, background: fin ? C.ink : "#fff", boxShadow: SHADOW, direction: "rtl" }}>
                  <T s={32} w={900} c={fin ? "#fff" : C.ink}>روز</T>
                  <span style={{ fontFamily: NUM, fontWeight: 700, fontSize: 34, color: fin ? C.neon : C.green, lineHeight: 1 }}>{m.d}</span>
                </div>
              </div>
              {fin && (
                <svg width={80} height={110} style={{ position: "absolute", left: x - 6, top: y - 150, transform: `scale(${k})`, transformOrigin: "0 100%", overflow: "visible" }}>
                  <line x1={6} y1={110} x2={6} y2={4} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
                  <path d={`M6 6 Q 30 ${2 + Math.sin(t * 6) * 6} 58 12 Q 40 26 58 44 Q 30 ${34 + Math.sin(t * 6 + 1) * 6} 6 40 Z`} fill={C.green} />
                </svg>
              )}
            </React.Fragment>
          );
        })}
        {/* the group: 2 × 2 formation walking together */}
        {WALKERS.map((w, i) => {
          const k = pop(t, 104.08 + i * 0.05, 0.4);
          if (k <= 0) return null;
          const u = clamp(uc + w.du, 0, 1);
          const [nx, ny] = normal(u);
          const step = walking ? Math.abs(Math.sin(t * 8.5 + i * 1.6)) : 0.12 * Math.abs(Math.sin(t * 3 + i));
          const x = PX(u) + nx * w.off, y = PY(u) + ny * w.off - step * 12;
          return (
            <div key={i} style={{ position: "absolute", left: x - 42, top: y - 42, transform: `scale(${k}) rotate(${walking ? Math.sin(t * 8.5 + i * 1.6) * 5 : 0}deg)`, zIndex: 3 }}>
              <div style={{ position: "absolute", left: 18, top: 84 + step * 12, width: 48, height: 12, borderRadius: "50%", background: "rgba(0,0,0,.16)", transform: `scale(${1 - step * 0.3})` }} />
              <div style={{ width: 84, height: 84, borderRadius: 42, background: "#fff", border: `5px solid ${C.ink}`, boxShadow: "0 10px 22px rgba(0,0,0,.22)", display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}><Ico n="user" s={42} c={C.ink} w={2.4} /></div>
            </div>
          );
        })}
        {/* «you» joins from the right-hand side on «باشی» */}
        {t >= tBe - 0.3 && (() => {
          const jk = ease.out(ramp(t, tBe - 0.3, tBe + 0.18));
          const off = lerp(420, 128, jk);
          const step = Math.abs(Math.sin(t * 8.5 + 4));
          const x = PX(uc) + gnx * off, y = PY(uc) + gny * off - step * 12;
          return (
            <div style={{ position: "absolute", left: x - 46, top: y - 46, zIndex: 4 }}>
              <div style={{ width: 92, height: 92, borderRadius: 46, background: C.green, border: "5px solid #fff", boxShadow: "0 10px 24px rgba(242,92,31,.45)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico n="user" s={46} c="#fff" w={2.6} /></div>
              <div style={{ position: "absolute", left: 104, top: 20, transform: `scale(${pop(t, tBe - 0.02, 0.3)})`, transformOrigin: "0 50%" }}>
                <div style={{ padding: "5px 18px", borderRadius: 999, background: C.green, boxShadow: "0 6px 14px rgba(242,92,31,.4)" }}><T s={30} w={900} c="#fff">تو</T></div>
              </div>
            </div>
          );
        })()}
        {/* «کنار ما» label, below-left of the group */}
        {t >= tUs - 0.05 && (() => {
          const k = pop(t, tUs - 0.05, 0.4);
          return (
            <div style={{ position: "absolute", right: 1080 - PX(uc) - 30, top: PY(uc) + 78, transform: `scale(${k})`, transformOrigin: "100% 0", zIndex: 5 }}>
              <div style={{ padding: "12px 26px", borderRadius: 999, background: C.ink, boxShadow: "0 14px 30px rgba(0,0,0,.3)", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex" }}>{[0, 1, 2].map((j) => <div key={j} style={{ width: 38, height: 38, borderRadius: 19, marginLeft: j ? -12 : 0, background: "#fff", border: `3px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico n="user" s={20} c={C.ink} w={2.6} /></div>)}</div>
                <T s={38} w={900} c="#fff">کنار ما</T>
              </div>
            </div>
          );
        })()}
      </Cam>
      {/* header chip (screen) */}
      <div style={{ position: "absolute", left: 44, top: 150, display: "flex", justifyContent: "flex-start", opacity: ramp(t, 104.05, 104.25), transform: `translateY(${(1 - ease.out(ramp(t, 104.05, 104.3))) * -40}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 26px", borderRadius: 999, background: "#fff", boxShadow: SHADOW, direction: "rtl" }}>
          <Ico n="loop" s={26} c={C.green} w={2.6} />
          <T s={28} w={900}>مسیر یادگیری</T>
          <div style={{ width: 2, height: 24, background: "#E6E3DA" }} />
          <L s={22} w={800} mono c={C.green}>{`DAY ${String(dayOf(Math.max(0, uc - 0.035))).padStart(2, "0")} / 30`}</L>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────── B · comments
const FloatingStarts: React.FC<{ t: number }> = ({ t }) => (
  <>
    {Array.from({ length: 16 }, (_, i) => {
      const t0 = 108.72 + i * 0.055;
      if (t < t0) return null;
      const k = ramp(t, t0, t0 + 1.3);
      const x = 60 + rnd(i * 3.7) * 760, y = 410 - k * 280 + rnd(i * 1.9) * 40;
      return (
        <div key={i} style={{ position: "absolute", left: x, top: y, opacity: Math.min(1, k * 6) * (1 - ramp(k, 0.6, 1)), transform: `scale(${0.8 + rnd(i) * 0.4})`, display: "flex", alignItems: "center", gap: 8, padding: "8px 16px 8px 8px", borderRadius: 999, background: "rgba(0,0,0,.45)", direction: "rtl" }}>
          <Av id={AVS[i % AVS.length]} s={48} />
          <T s={34} w={900} c="#fff">شروع</T>
        </div>
      );
    })}
  </>
);

type Row = { u: string; av: number; tm: string; tx: string; lk: number; me?: boolean; t0: number };
const Sheet: React.FC<{ t: number; k: number; out: number; tSend: number }> = ({ t, k, out, tSend }) => {
  const SY = 392; // sheet top
  const rows: Row[] = [
    ...OLD.map((o) => ({ ...o, t0: -1 })),
    { u: "your.page", av: 10, tm: "now", tx: "شروع", lk: 0, me: true, t0: tSend + 0.16 },
    ...Array.from({ length: FLOOD_N }, (_, i) => ({ u: USERS[(i + 4) % USERS.length], av: AVS[i], tm: "now", tx: FLOOD_TX[i], lk: 0, t0: FLOOD_T0 + i * FLOOD_DT })),
  ];
  const RH = 112;
  const list = rows.filter((r) => t >= r.t0);
  // newest first; each newer row pushes the others down smoothly
  const yOf = (r: Row) => {
    let y = 0;
    for (const o of rows) if (o.t0 > r.t0 && t >= o.t0) y += RH * ease.out(ramp(t, o.t0, o.t0 + 0.16));
    const base = OLD.indexOf(OLD.find((o) => o.u === r.u && r.t0 < 0) as (typeof OLD)[number]);
    return (r.t0 < 0 ? base * RH : -RH * (1 - ease.out(ramp(t, r.t0, r.t0 + 0.16)))) + y;
  };
  const typedK = TYPE.filter(([, tt]) => t >= tt).map(([, , f]) => f).pop() ?? 0;
  const sent = t >= tSend;
  const count = 1284 + (t >= tSend ? 1 : 0) + Math.round(Math.max(0, t - FLOOD_T0) * 1300);
  const focus = t >= 107.4;
  const kbD = ease.io(ramp(t, tSend + 0.08, tSend + 0.34));
  const kb = ease.out(ramp(t, 107.18, 107.45)) * (1 - kbD);
  const IY = lerp(736, 1380, kbD), EY = lerp(660, 1304, kbD), LH = lerp(540, 1180, kbD);
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - k) * 1500 + out * 1500}px)` }}>
      <div style={{ position: "absolute", left: 0, top: SY, width: 1080, height: 1920 - SY, borderRadius: "44px 44px 0 0", background: "#fff", boxShadow: "0 -20px 60px rgba(0,0,0,.35)" }}>
        <div style={{ position: "absolute", left: 500, top: 16, width: 80, height: 8, borderRadius: 4, background: "#D4D4D4" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 38, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, direction: "rtl" }}>
          <T s={36} w={800}>کامنت‌ها</T>
          <div style={{ padding: "4px 12px", borderRadius: 999, background: t >= FLOOD_T0 ? C.green : "#F0F0F0", transform: `scale(${1 + hit(t, FLOOD_T0, 0.3) * 0.15})` }}><L s={20} w={800} c={t >= FLOOD_T0 ? "#fff" : "#737373"}>{grp(count)}</L></div>
        </div>
        <XI n="igsend" s={34} c={C.ink} w={2} style={{ position: "absolute", left: 40, top: 44 }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 108, height: 1.5, background: "#EFEFEF" }} />
        {/* list */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 112, height: LH, overflow: "hidden" }}>
          {list.map((r) => {
            const y = yOf(r) + 14;
            if (y > LH + 20) return null;
            const ink = ease.out(ramp(t, r.t0, r.t0 + 0.2));
            const hl = r.me ? 1 - ramp(t, r.t0 + 0.6, r.t0 + 1.4) : r.t0 > 0 ? 0.5 * (1 - ramp(t, r.t0, r.t0 + 0.5)) : 0;
            return (
              <div key={r.u + r.t0} style={{ position: "absolute", left: 0, right: 0, top: y, height: RH, background: `rgba(242,92,31,${0.09 * hl})`, opacity: r.t0 < 0 ? 1 : ink, transform: `translateX(${r.t0 < 0 ? 0 : (1 - ink) * 60}px)` }}>
                {r.me ? <MeAv s={68} style={{ position: "absolute", right: 36, top: 14 }} /> : <Av id={r.av} s={68} style={{ position: "absolute", right: 36, top: 14 }} />}
                <div style={{ position: "absolute", right: 124, top: 14, display: "flex", alignItems: "baseline", gap: 10, direction: "rtl" }}>
                  <L s={22} w={700}>{r.u}</L>
                  <L s={20} w={500} c="#8E8E8E">{r.tm}</L>
                </div>
                <T s={33} w={r.me || r.t0 > 0 ? 900 : 700} c={C.ink} style={{ position: "absolute", right: 124, top: 44 }}>{r.tx}</T>
                <div style={{ position: "absolute", left: 40, top: 26, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <Ico n="heart" s={26} c={r.lk > 200 ? "#FF3040" : "#8E8E8E"} fill={r.lk > 200} w={2} />
                  {r.lk > 0 && <L s={15} w={600} c="#8E8E8E">{r.lk}</L>}
                </div>
              </div>
            );
          })}
        </div>
        {/* emoji row */}
        <div style={{ position: "absolute", left: 40, right: 40, top: EY, height: 60, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1.5px solid #EFEFEF", paddingTop: 10 }}>
          {["❤️", "🙌", "🔥", "👏", "😢", "😍", "😮", "😂"].map((e) => <span key={e} style={{ fontSize: 40, lineHeight: 1 }}>{e}</span>)}
        </div>
        {/* input bar */}
        <div style={{ position: "absolute", left: 30, right: 30, top: IY, height: 96, display: "flex", alignItems: "center", gap: 16, direction: "rtl" }}>
          <MeAv s={70} />
          <div style={{ flex: 1, height: 84, borderRadius: 42, border: `2px solid ${focus ? "#C7C7C7" : "#DBDBDB"}`, display: "flex", alignItems: "center", padding: "0 28px", position: "relative", direction: "rtl" }}>
            {!sent && typedK > 0 ? (
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <span style={{ fontFamily: FA, fontWeight: 800, fontSize: 48, color: C.ink, clipPath: `inset(-10px 0 -10px ${(1 - typedK) * 100}%)`, lineHeight: 1.2 }}>شروع</span>
              </div>
            ) : (
              <T s={34} w={600} c="#9A9A9A">{sent ? "کامنت بنویس…" : "کامنت بنویس…"}</T>
            )}
            {focus && !sent && Math.floor(t * 2.6) % 2 === 0 && <div style={{ position: "absolute", right: 28 + (typedK > 0 ? 112 * typedK + 4 : 0), top: 20, width: 3, height: 44, borderRadius: 2, background: "#0095F6" }} />}
          </div>
          <div style={{ width: 72, height: 72, borderRadius: 36, background: typedK > 0 && !sent ? "#0095F6" : "#B2DFFC", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + hit(t, tSend, 0.25) * 0.18})`, flex: "none" }}>
            <XI n="up" s={38} c="#fff" w={3} />
          </div>
        </div>
        <Tap t={t} t0={tSend} x={30 + 36} y={736 + 48} from={[220, 360]} />
        {/* sent comment flying into the list */}
        {t >= tSend && t < tSend + 0.17 && (() => {
          const f = ease.io(ramp(t, tSend, tSend + 0.17));
          return <T s={40} w={900} style={{ position: "absolute", right: lerp(150, 124, f), top: lerp(752, 112 + 14 + 44, f), opacity: 1 - f * 0.3, transform: `scale(${lerp(1, 0.83, f)})`, transformOrigin: "100% 0" }}>شروع</T>;
        })()}
      </div>
      {/* keyboard */}
      <Keyboard t={t} k={kb} y={1480} />
    </div>
  );
};

const Keyboard: React.FC<{ t: number; k: number; y: number }> = ({ t, k, y }) => {
  const kw = 78, gap = 12, kh = 100;
  const press = (ch: string) => {
    const e = TYPE.find(([c]) => c === ch);
    return e ? hit(t, e[1] - 0.02, 0.2) : 0;
  };
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: 1080, height: 1920 - y, background: "#D3D6DC", transform: `translateY(${(1 - k) * 700}px)`, borderTop: "1px solid #BFC2C8" }}>
      {/* suggestion bar */}
      <div style={{ height: 70, display: "flex", alignItems: "center", justifyContent: "space-around", direction: "rtl" }}>
        {["شروع", "شروعش", "شروع کنیم"].map((s, i) => <T key={i} s={30} w={i === 0 && t >= 107.9 ? 800 : 600} c={t >= 107.9 ? C.ink : "#8D8F94"}>{t >= 107.9 ? s : ["سلام", "مرسی", "عالی"][i]}</T>)}
      </div>
      {KB.map((row, ri) => {
        const total = row.length * kw + (row.length - 1) * gap;
        const x0 = (1080 - total) / 2 + (ri === 2 ? -48 : 0);
        return row.map((ch, ci) => {
          const p = press(ch);
          const x = x0 + ci * (kw + gap), ky = 74 + ri * (kh + 14);
          return (
            <React.Fragment key={ch}>
              <div style={{ position: "absolute", left: x, top: ky, width: kw, height: kh, borderRadius: 12, background: p > 0 ? "#F2F2F2" : "#fff", boxShadow: "0 2px 0 #8C8F94", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: FA, fontWeight: 500, fontSize: 40, color: "#111", lineHeight: 1 }}>{ch}</span>
              </div>
              {p > 0 && (
                <div style={{ position: "absolute", left: x - 16, top: ky - 130, width: kw + 32, height: 150, borderRadius: 18, background: "#fff", boxShadow: "0 6px 20px rgba(0,0,0,.25)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 18, opacity: Math.min(1, p * 3) }}>
                  <span style={{ fontFamily: FA, fontWeight: 600, fontSize: 64, color: "#111", lineHeight: 1 }}>{ch}</span>
                </div>
              )}
            </React.Fragment>
          );
        });
      })}
      <div style={{ position: "absolute", right: 30, top: 74 + 2 * 114, width: 120, height: kh, borderRadius: 12, background: "#ABB0BA", boxShadow: "0 2px 0 #8C8F94", display: "flex", alignItems: "center", justifyContent: "center" }}><XI n="backspace" s={40} c="#111" w={2} /></div>
      <div style={{ position: "absolute", left: 30, top: 74 + 3 * 114, width: 1020, height: kh, display: "flex", gap: 12, direction: "ltr" }}>
        <div style={{ width: 130, borderRadius: 12, background: "#ABB0BA", boxShadow: "0 2px 0 #8C8F94", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UI, fontWeight: 500, fontSize: 30, color: "#111" }}>123</div>
        <div style={{ width: 100, borderRadius: 12, background: "#ABB0BA", boxShadow: "0 2px 0 #8C8F94", display: "flex", alignItems: "center", justifyContent: "center" }}><XI n="smile" s={40} c="#111" w={1.8} /></div>
        <div style={{ flex: 1, borderRadius: 12, background: "#fff", boxShadow: "0 2px 0 #8C8F94", display: "flex", alignItems: "center", justifyContent: "center" }}><T s={30} w={500} c="#111">فاصله</T></div>
        <div style={{ width: 200, borderRadius: 12, background: "#ABB0BA", boxShadow: "0 2px 0 #8C8F94", display: "flex", alignItems: "center", justifyContent: "center" }}><T s={30} w={600} c="#111">بازگشت</T></div>
      </div>
    </div>
  );
};

// ─────────────────────────────── C · Monday 12:00
const Monday: React.FC<{ t: number; tMon: number; t12: number; tNoon: number; dr: { x: number; y: number; r: number } }> = ({ t, tMon, t12, tNoon, dr }) => {
  const kCal = spring(t, tMon - 0.2, 0.6, 0.25);
  const kClock = spring(t, tMon + 0.18, 0.55, 0.25);
  const ring = ease.io(ramp(t, tMon + 0.25, tMon + 0.6));
  // minutes relative to 12:00
  const spin = ramp(t, S(310), t12);
  const sp = spin < 1 ? 1 - Math.pow(1 - spin, 1.6) * (1 - spin * 0.0) : 1;
  let m = -283 * (1 - ease.io(sp));
  if (t > t12) m += 5 * Math.exp(-11 * (t - t12)) * Math.sin(34 * (t - t12));
  const CX = 540, CY = 868, R = 236;
  const hs = R / 262;
  const kNoon = pop(t, tNoon - 0.03, 0.4);
  const sunK = ease.out(ramp(t, tNoon - 0.15, tNoon + 0.45));
  const evK = pop(t, t12 + 0.05, 0.35);
  // final beat: an orange ring closes around the bezel from 12 o'clock, then the watch settles with a soft pulse
  const T_RING = tNoon + 0.25, T_DONE = tNoon + 0.7;
  const close = ease.io(ramp(t, T_RING, T_DONE));
  const done = hit(t, T_DONE, 0.35);
  return (
    <div style={{ position: "absolute", inset: 0, transformOrigin: "540px 720px", transform: `translate(${dr.x}px, ${dr.y}px) scale(${1 + ease.out(ramp(t, tNoon + 0.05, 113.0)) * 0.035})` }}>
      {/* noon sun behind the clock */}
      {sunK > 0 && (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          <g transform={`translate(${lerp(CX, 790, sunK)},${lerp(CY, 640, sunK)}) rotate(${t * 30})`}>
            {Array.from({ length: 16 }, (_, i) => <line key={i} x1={0} y1={-96} x2={0} y2={-130} stroke={C.green} strokeWidth={8} strokeLinecap="round" transform={`rotate(${i * 22.5})`} opacity={0.85} />)}
            <circle r={84} fill={C.green} />
            <circle r={84} fill="url(#sunR)" />
          </g>
          <defs><radialGradient id="sunR" cx="38%" cy="35%"><stop offset="0%" stopColor="#FFC08A" /><stop offset="100%" stopColor={C.green} stopOpacity={0} /></radialGradient></defs>
        </svg>
      )}
      {/* calendar page */}
      {kCal > 0 && (
        <div style={{ position: "absolute", left: 130, top: 168, width: 820, height: 412, borderRadius: 36, background: "#fff", boxShadow: "0 2px 3px rgba(0,0,0,.06), 0 30px 70px rgba(20,20,30,.16)", overflow: "visible", transform: `translateY(${(1 - kCal) * -620}px) rotate(${(1 - kCal) * 6}deg)` }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 74, borderRadius: "36px 36px 0 0", background: C.ink, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 34px" }}>
            <L s={24} w={700} mono c="#B4B5BB">MONDAY · WEEK 01</L>
            <T s={26} w={800} c="#fff">شروع دوره</T>
          </div>
          {t < tMon + 0.24 && (() => {
            const flip = ease.in(ramp(t, tMon - 0.06, tMon + 0.22));
            return (
              <div style={{ position: "absolute", left: 0, right: 0, top: 74, height: 338, borderRadius: "0 0 36px 36px", background: "#fff", transformOrigin: "50% 0", transform: `perspective(1100px) rotateX(${flip * 100}deg)`, zIndex: 3, boxShadow: `0 ${18 * flip}px 30px rgba(0,0,0,${0.18 * flip})` }}>
                <T s={132} w={900} c={C.ink3} style={{ position: "absolute", left: 0, right: 0, top: -4, textAlign: "center" }}>یکشنبه</T>
                <div style={{ position: "absolute", left: 60, right: 60, top: 178, display: "flex", justifyContent: "space-between", direction: "rtl" }}>
                  {WEEK.map((d, i) => <div key={i} style={{ width: 68, height: 68, borderRadius: 34, display: "flex", alignItems: "center", justifyContent: "center", border: i === 1 ? "3px solid #CFCBC0" : "none" }}><span style={{ fontFamily: FA, fontWeight: 900, fontSize: 32, color: "#B9B7B0", lineHeight: 1 }}>{d}</span></div>)}
                </div>
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 60, borderRadius: "0 0 36px 36px", background: `linear-gradient(transparent, rgba(0,0,0,${0.08 + flip * 0.15}))` }} />
              </div>
            );
          })()}
          {[230, 590].map((x) => <div key={x} style={{ position: "absolute", left: x - 14, top: -22, width: 28, height: 56, borderRadius: 14, background: "linear-gradient(90deg,#9A9CA3,#E6E7EA 50%,#9A9CA3)", boxShadow: "0 3px 6px rgba(0,0,0,.3)" }} />)}
          <T s={132} w={900} style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", transform: `scale(${1 + hit(t, tMon, 0.3) * 0.06})` }}>دوشنبه</T>
          <div style={{ position: "absolute", left: 60, right: 60, top: 252, display: "flex", justifyContent: "space-between", direction: "rtl" }}>
            {WEEK.map((d, i) => (
              <div key={i} style={{ position: "relative", width: 68, height: 68, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {i === 2 && <div style={{ position: "absolute", inset: 0, borderRadius: 34, background: C.green, transform: `scale(${ring})` }} />}
                {i === 2 && (
                  <svg width={92} height={92} style={{ position: "absolute", left: -12, top: -12, overflow: "visible" }}>
                    <circle cx={46} cy={46} r={44} fill="none" stroke={C.green} strokeWidth={4} pathLength={1} strokeDasharray={`${ring} 2`} transform="rotate(-90 46 46)" />
                  </svg>
                )}
                <span style={{ position: "relative", fontFamily: FA, fontWeight: 900, fontSize: 32, color: i === 2 && ring > 0.5 ? "#fff" : i < 2 ? "#B9B7B0" : C.ink2, lineHeight: 1 }}>{d}</span>
              </div>
            ))}
          </div>
          {evK > 0 && (
            <div style={{ position: "absolute", left: 60, right: 60, top: 344, display: "flex", justifyContent: "center" }}>
              <div style={{ transform: `scale(${evK})`, display: "flex", alignItems: "center", gap: 12, padding: "8px 26px", borderRadius: 999, background: "#FFE1D1", direction: "rtl" }}>
                <div style={{ width: 14, height: 14, borderRadius: 7, background: C.green }} />
                <T s={30} w={900} c={C.ink}>شروع دوره‌ی <span style={{ fontFamily: "InterV", fontWeight: 800 }}>30</span> روزه</T>
              </div>
            </div>
          )}
        </div>
      )}
      {/* the watch */}
      {kClock > 0 && (
        <div style={{ position: "absolute", left: CX - R - 16, top: CY - R - 16, width: 2 * R + 32, height: 2 * R + 32, transform: `scale(${Math.min(1.05, kClock) * (1 + hit(t, t12, 0.3) * 0.05 + done * 0.025)})` }}>
          <svg width={2 * R + 32} height={2 * R + 32} style={{ overflow: "visible" }}>
            <defs>
              <radialGradient id="face" cx="45%" cy="38%"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#F1EFE9" /></radialGradient>
              <filter id="hs" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="5" floodOpacity="0.28" /></filter>
            </defs>
            <g transform={`translate(${R + 16},${R + 16})`}>
              <circle r={R + 12} fill={C.ink} />
              <circle r={R + 4} fill="#2C2D33" />
              {close > 0 && <circle r={R + 4} fill="none" stroke={C.green} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={`${close} 2`} transform="rotate(-90)" style={{ filter: `drop-shadow(0 0 ${6 + done * 14}px rgba(255,122,61,.7))` }} />}
              <circle r={R - 4} fill="url(#face)" />
              {Array.from({ length: 60 }, (_, i) => {
                const a = (i / 60) * Math.PI * 2;
                const big = i % 5 === 0;
                const r1 = R - 18, r2 = big ? R - 50 : R - 30;
                const lit = big && i === 0 && t > t12;
                return <line key={i} x1={Math.sin(a) * r1} y1={-Math.cos(a) * r1} x2={Math.sin(a) * r2} y2={-Math.cos(a) * r2} stroke={lit ? C.green : C.ink} strokeOpacity={big ? 1 : 0.4} strokeWidth={big ? 9 : 3} strokeLinecap="round" />;
              })}
              {[["12", 0], ["3", 90], ["6", 180], ["9", 270]].map(([n, a]) => {
                const r = R - 84, ar = ((a as number) * Math.PI) / 180;
                return <text key={n as string} x={Math.sin(ar) * r} y={-Math.cos(ar) * r + 19} textAnchor="middle" fontFamily={NUM} fontWeight={700} fontSize={50} fill={n === "12" && t > t12 ? C.green : C.ink}>{n}</text>;
              })}
              <text x={0} y={-58} textAnchor="middle" fontFamily={UI} fontWeight={900} fontStyle="italic" fontSize={30} fill={C.ink} letterSpacing={-1}>NFP</text>
              <text x={0} y={-34} textAnchor="middle" fontFamily={MONO} fontWeight={600} fontSize={13} fill={C.ink3} letterSpacing={3}>30 DAYS</text>
              {/* ghost trails while spinning */}
              {t < t12 && t > S(310) && [3, 2, 1].map((j) => {
                const mm = -283 * (1 - ease.io(clamp(spin - j * 0.025)));
                return <line key={j} x1={0} y1={0} x2={Math.sin((mm * 6 * Math.PI) / 180) * (R - 40)} y2={-Math.cos((mm * 6 * Math.PI) / 180) * (R - 40)} stroke={C.ink} strokeOpacity={0.1 * (4 - j)} strokeWidth={10} strokeLinecap="round" />;
              })}
              {/* hour */}
              <g transform={`rotate(${m * 0.5}) scale(${hs})`} filter="url(#hs)"><path d="M-9,26 L-7,-140 Q0,-156 7,-140 L9,26 Z" fill={C.ink} /></g>
              {/* minute */}
              <g transform={`rotate(${m * 6}) scale(${hs})`} filter="url(#hs)"><path d="M-6,30 L-4.5,-212 Q0,-226 4.5,-212 L6,30 Z" fill={C.ink} /></g>
              {/* seconds */}
              <g transform={`rotate(${t < t12 ? m * 24 + Math.max(0, Math.min(t, S(310)) - tMon - 0.18) * 60 * (1 - ease.io(sp)) : Math.floor((t - t12) * 1) * 6})`}>
                <line x1={0} y1={46} x2={0} y2={-R + 24} stroke={C.green} strokeWidth={4} strokeLinecap="round" />
                <circle cy={46} r={9} fill={C.green} />
              </g>
              <circle r={15} fill={C.green} stroke="#fff" strokeWidth={4} />
            </g>
          </svg>
          {t > t12 && (
            <div style={{ position: "absolute", left: -100, right: -100, top: 2 * R + 32 + 22, display: "flex", justifyContent: "center", alignItems: "center", gap: 22, direction: "rtl" }}>
              <div style={{ fontFamily: NUM, fontWeight: 700, fontSize: 76, color: C.ink, lineHeight: 1, transform: `scale(${pop(t, t12 + 0.02, 0.35)})`, direction: "ltr" }}>12:00</div>
              {kNoon > 0 && <div style={{ transform: `scale(${kNoon * (1 + (t > tNoon + 0.45 ? Math.sin((t - tNoon - 0.45) * 5) * 0.018 : 0) + done * 0.05)})`, padding: "4px 26px 10px", borderRadius: 999, background: C.green, boxShadow: "0 10px 26px rgba(242,92,31,.4)" }}><T s={58} w={900} c="#fff">ظهر</T></div>}
            </div>
          )}
        </div>
      )}
      <Shock t={t} t0={t12} x={CX} y={CY} r0={R} r1={R + 220} w={10} />
      <Shock t={t} t0={T_DONE} x={CX} y={CY} r0={R + 10} r1={R + 110} w={5} d={0.33} c={C.neon} />
    </div>
  );
};
