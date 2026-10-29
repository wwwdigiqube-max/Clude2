// Video 23 · S9 · «اتوماسیون… هر روز… ریلزهای میلیونی… با سبک اختصاصی خودم… ویدیو تولید کنه» (79.2 – 88.35)
// iOS-style automation card → toggle ON → the card folds into the «هر روز» schedule dial → an n8n-like loop of three nodes;
// the camera visits each node while its panel opens (found reels → my style applied → finished videos queue).
import React from "react";
import { Clip, Ico } from "./ui";
import { C, FA, NUM, S, SHADOW, clamp, ease, grp, hit, kfmt, lerp, pop, ramp, rnd, spring } from "./lib";
import { Cam, Full, IgTile, L, NfpMark, SP, T, Tap, Toggle, XI, drift, mix, track, trackV } from "./c-kit";

const RX = 540, RY = 760, R = 330;
const P = (a: number): [number, number] => [RX + R * Math.cos((a * Math.PI) / 180), RY + R * Math.sin((a * Math.PI) / 180)];
const NODES = [
  { a: -90, l1: "پیدا کردن", l2: "ریلزهای میلیونی", meta: "INSTAGRAM · VIEWS ≥ 1M", ic: "search", on: () => S(232), done: () => S(236) + 0.62 },
  { a: 30, l1: "ساخت با", l2: "سبک خودم", meta: "CLAUDE + NFP", ic: "palette", on: () => S(240), done: () => S(242) + 0.3 },
  { a: 150, l1: "آماده‌ی", l2: "انتشار", meta: "QUEUE · 09:00", ic: "check", on: () => S(244), done: () => S(245) + 0.45 },
];
const NW = 340, NH = 140;
// found reels (panel above node 1)
const FEED = [
  { src: "tiles/t32.mp4", v: 48e3 },
  { src: "tiles/t30.mp4", v: 2.4e6, pick: 0 },
  { src: "tiles/t31.mp4", v: 310e3 },
  { src: "tiles/t25.mp4", v: 5.1e6, pick: 1 },
  { src: "tiles/t26.mp4", v: 92e3 },
  { src: "tiles/t33.mp4", v: 12e6, pick: 2 },
  { src: "tiles/t29.mp4", v: 640e3 },
];
const DONE_V = ["tiles/t24.mp4", "tiles/t22.mp4", "tiles/t21.mp4"];

/** arc path on the ring from angle a0 to a1 (deg, clockwise) */
const arc = (a0: number, a1: number, r = R) => {
  if (a1 - a0 < 0.5) return "";
  const [x0, y0] = [RX + r * Math.cos((a0 * Math.PI) / 180), RY + r * Math.sin((a0 * Math.PI) / 180)];
  const [x1, y1] = [RX + r * Math.cos((a1 * Math.PI) / 180), RY + r * Math.sin((a1 * Math.PI) / 180)];
  return `M${x0},${y0} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1},${y1}`;
};

const NodeCard: React.FC<{ i: number; t: number; count: number; o?: number }> = ({ i, t, count, o = 1 }) => {
  const n = NODES[i];
  const [x, y] = P(n.a);
  const k = pop(t, 81.55 + i * 0.12, 0.4);
  if (k <= 0) return null;
  const lit = t >= n.on(), done = t >= n.done();
  const hk = hit(t, n.on(), 0.32);
  const run = lit && !done;
  return (
    <div style={{ position: "absolute", left: x - NW / 2, top: y - NH / 2, width: NW, height: NH, borderRadius: 30, background: lit ? C.ink : "#fff", boxShadow: lit ? "0 20px 50px rgba(20,20,30,.28), 0 2px 4px rgba(0,0,0,.2)" : SHADOW, transform: `scale(${k * (1 + hk * 0.08)})`, opacity: o, zIndex: 3 }}>
      {/* icon tile (right side, rtl) */}
      <div style={{ position: "absolute", right: 22, top: 28, width: 84, height: 84, borderRadius: 24, background: lit ? C.green : "#F1F0EC", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: lit ? "0 8px 24px rgba(242,92,31,.45)" : "inset 0 0 0 1px rgba(0,0,0,.05)" }}>
        <Ico n={n.ic} s={44} c={lit ? "#fff" : C.ink3} w={2.4} />
      </div>
      {run && (
        <svg width={112} height={112} style={{ position: "absolute", right: 8, top: 14, transform: `rotate(${t * 520}deg)` }}>
          <circle cx={56} cy={56} r={52} fill="none" stroke={C.neon} strokeWidth={4} strokeDasharray="70 260" strokeLinecap="round" />
        </svg>
      )}
      <div style={{ position: "absolute", right: 128, top: 18, textAlign: "right" }}>
        <T s={33} w={900} c={lit ? "#fff" : C.ink} style={{ lineHeight: 1.12 }}>{n.l1}</T>
        <T s={33} w={900} c={lit ? "#fff" : C.ink} style={{ lineHeight: 1.12 }}>{n.l2}</T>
      </div>
      <L s={15} w={600} mono c={lit ? C.neon : C.ink3} style={{ position: "absolute", right: 128, bottom: 14 }}>{n.meta}</L>
      <L s={16} w={600} mono c={lit ? "#6E6F76" : "#B5B3AC"} style={{ position: "absolute", left: 18, top: 14 }}>{`0${i + 1}`}</L>
      {/* connector dots (n8n style) */}
      <div style={{ position: "absolute", left: -9, top: NH / 2 - 9, width: 18, height: 18, borderRadius: 9, background: lit ? C.green : "#fff", border: `3px solid ${lit ? C.ink : "#CFCBC0"}` }} />
      <div style={{ position: "absolute", right: -9, top: NH / 2 - 9, width: 18, height: 18, borderRadius: 9, background: lit ? C.green : "#fff", border: `3px solid ${lit ? C.ink : "#CFCBC0"}` }} />
      {count > 0 && (
        <div style={{ position: "absolute", left: -16, top: -18, minWidth: 48, height: 48, borderRadius: 24, background: C.green, border: "4px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 2, boxShadow: "0 6px 16px rgba(242,92,31,.4)", transform: `scale(${1 + hit(t, n.done() - 0.02, 0.3) * 0.3})` }}>
          {done ? <Ico n="check" s={24} c="#fff" w={3.6} /> : <L s={22} w={800} c="#fff">{count}</L>}
        </div>
      )}
    </div>
  );
};

/** the «هر روز» schedule dial (local 300×300) with a day/night sky */
const DialFace: React.FC<{ t: number; o: number }> = ({ t, o }) => {
  const t0 = S(230);
  const dayT = Math.max(0, (t - t0) / 0.8);
  // each day starts at 09:00; daylight (09→18) takes 60% of the cycle, the night is short
  const q = t < t0 ? 0 : dayT % 1;
  const hrsRaw = q < 0.6 ? 9 + (q / 0.6) * 9 : 18 + ((q - 0.6) / 0.4) * 15;
  const p = (((hrsRaw - 6) / 24) % 1 + 1) % 1; // p = 0 → 06:00 (sun on the left horizon)
  const a = p * Math.PI * 2;
  const nf = smoothN(0.5 - Math.sin(a) * 1.6);
  const hrs = hrsRaw % 24;
  const hhmm = `${String(Math.floor(hrs)).padStart(2, "0")}:${String(Math.floor((hrs % 1) * 60)).padStart(2, "0")}`;
  const sky = mix("#FFE7D2", "#17181D", nf);
  const sx = 150 - 108 * Math.cos(a), sy = 172 - 108 * Math.sin(a);
  const mx = 150 + 108 * Math.cos(a), my = 172 + 108 * Math.sin(a);
  const kTxt = pop(t, S(229), 0.35);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, borderRadius: "50%", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 300, height: 172, background: `linear-gradient(180deg, ${sky}, ${mix("#FFF6EC", "#2A2B33", nf)})` }} />
      {Array.from({ length: 14 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: 40 + rnd(i * 3.3) * 220, top: 18 + rnd(i * 7.1) * 130, width: 3 + rnd(i) * 2, height: 3 + rnd(i) * 2, borderRadius: 3, background: "#fff", opacity: nf * (0.5 + 0.5 * Math.sin(t * 6 + i)) }} />
      ))}
      {/* sun with turning rays */}
      <svg width={300} height={172} style={{ position: "absolute", left: 0, top: 0 }}>
        <g transform={`translate(${sx},${sy}) rotate(${t * 90})`}>
          {Array.from({ length: 10 }, (_, i) => <line key={i} x1={0} y1={-31} x2={0} y2={-40} stroke="#F7A14B" strokeWidth={4} strokeLinecap="round" transform={`rotate(${i * 36})`} />)}
          <circle r={24} fill="url(#sunG)" />
        </g>
        <defs>
          <radialGradient id="sunG" cx="40%" cy="38%"><stop offset="0%" stopColor="#FFC27A" /><stop offset="100%" stopColor={C.green} /></radialGradient>
        </defs>
        <g transform={`translate(${mx},${my})`}>
          <circle r={19} fill="#F4F0E6" />
          <circle cx={7} cy={-6} r={19} fill={mix("#FFE7D2", "#1B1C22", nf)} opacity={0.0} />
          <circle cx={-6} cy={4} r={3.5} fill="#D9D3C4" /><circle cx={5} cy={-6} r={2.5} fill="#D9D3C4" /><circle cx={6} cy={8} r={2} fill="#D9D3C4" />
        </g>
      </svg>
      {/* horizon + lower panel */}
      <div style={{ position: "absolute", left: 0, top: 170, width: 300, height: 130, background: "#fff", borderTop: `3px solid ${C.ink}` }} />
      <div style={{ position: "absolute", left: 0, top: 176, width: 300, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${kTxt})` }}>
        <T s={50} w={900}>هر روز</T>
        <L s={22} w={700} mono c={C.ink3} style={{ marginTop: -4 }}>{t < t0 ? "DAY 01 · 09:00" : `DAY ${String(Math.floor(dayT) + 1).padStart(2, "0")} · ${hhmm}`}</L>
      </div>
    </div>
  );
};
const smoothN = (x: number) => {
  const k = clamp(x);
  return k * k * (3 - 2 * k);
};

export const S9Auto: React.FC<SP> = ({ t }) => {
  if (t < 79.2 || t > 88.35) return null;
  const T_ON = S(225) + 0.25, M0 = S(227) - 0.02, M1 = S(227) + 0.45;
  const T_N1 = S(232), T_REELS = S(234), T_MIL = S(235), T_FIND = S(236), T_N2 = S(240), T_OWN = S(241), T_MINE = S(242), T_N3 = S(244), T_MAKE = S(245);
  // ── camera
  const [fx, fy, ax, ay, cs] = trackV(t, [
    [79.2, [540, 740, 540, 705, 1.08]],
    [80.2, [540, 740, 540, 705, 1.0]],
    [81.25, [540, 742, 540, 705, 1.0]],
    [81.95, [540, 690, 540, 722, 1.0]],
    [82.5, [540, 690, 540, 722, 1.01]],
    [83.0, [540, 405, 540, 640, 1.1]],
    [84.72, [540, 418, 540, 646, 1.1]],
    [85.3, [780, 1030, 540, 730, 1.3]],
    [86.62, [790, 1030, 540, 730, 1.33]],
    [87.1, [300, 1030, 540, 730, 1.3]],
    [87.58, [296, 1026, 540, 730, 1.32]],
    [88.02, [540, 760, 540, 720, 0.94]],
  ]);
  const dr = drift(t, 1);
  const zt = ease.in(ramp(t, 88.0, 88.35));
  // ── automation card → dial morph
  const wk = ease.out(ramp(t, 79.2, 79.5));
  const mk = ease.io(ramp(t, M0, M1));
  const cx = lerp(90, 390, mk), cy = lerp(300, 610, mk), cw = lerp(900, 300, mk), ch = lerp(880, 300, mk), cr = lerp(50, 150, mk);
  const kA = 1 - ramp(t, M0 + 0.05, M0 + 0.3);
  const kD = ramp(t, M0 + 0.14, M1 - 0.02);
  const on = clamp(spring(t, T_ON, 0.35, 0.2));
  const ringK = ease.io(ramp(t, 81.35, 82.05));
  // ── data flow progress along the ring
  const th = track(t, [[84.66, -90], [85.32, 30], [86.46, 30], [87.0, 150], [87.5, 150], [88.0, 270]]);
  const moving = (t > 84.66 && t < 85.32) || (t > 86.46 && t < 87.0) || (t > 87.5 && t < 88.0);
  // found reels → node 1
  const flyT = (j: number) => T_FIND + j * 0.1;
  const c1 = [0, 1, 2].filter((j) => t >= flyT(j) + 0.42).length;
  const counts = [c1, t >= NODES[1].done() ? 3 : 0, t >= NODES[2].done() ? 3 : 0];
  const N1 = P(-90);
  const FW: [number, number][] = [[S(232), 85.1], [85.1, 86.85], [86.85, 87.75]];
  const fw = FW.map(([a0, b0]) => Math.min(ramp(t, a0, a0 + 0.25), 1 - ramp(t, b0 - 0.25, b0)));
  const nodeO = (i: number) => 1 - 0.75 * Math.max(...fw.filter((_, j) => j !== i));
  const dialO = 1 - 0.45 * Math.max(fw[1], fw[2]);
  // the scan beam sweeps right → left; a card is scanned when the beam crosses its centre
  const beamX = (q: number) => lerp(1000, 80, ease.io(ramp(q, T_REELS + 0.08, T_MIL + 0.3)));
  const passT = (i: number) => {
    for (let q = T_REELS; q <= T_MIL + 0.3; q += 0.01) if (beamX(q) <= 948 - i * 132 - (q - 83.0) * 24 + 59) return q;
    return T_MIL + 0.3;
  };
  const kP1 = ease.out(ramp(t, T_N1 + 0.12, T_N1 + 0.45)) * (1 - ease.in(ramp(t, 84.8, 85.1)));
  const kP2 = ease.out(ramp(t, T_N2 - 0.02, T_N2 + 0.3)) * (1 - ease.in(ramp(t, 86.72, 86.98)));
  const status = t < S(232) ? "RUN #128 · WAITING 09:00" : t < T_MIL + 0.3 ? "SCANNING REELS…" : t < T_N2 ? "3 REELS ≥ 1M FOUND" : t < T_MINE + 0.3 ? "STYLING · CLAUDE + NFP" : t < T_MAKE + 0.45 ? "RENDERING 3 VIDEOS" : "QUEUED · 09:00 ✓";
  const kP3 = ease.out(ramp(t, T_N3 - 0.02, T_N3 + 0.3));
  return (
    <Full style={{ opacity: 1 - ramp(t, 88.12, 88.35) }}>
      <div style={{ position: "absolute", inset: 0, transformOrigin: "540px 720px", transform: `scale(${1 + zt * 1.8})` }}>
        <Cam fx={fx} fy={fy} ax={ax + dr.x} ay={ay + dr.y} s={cs} r={dr.r}>
          {/* ── the loop ring (dots conveyor + orange progress) */}
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            {Array.from({ length: 72 }, (_, i) => {
              const a = -90 + i * 5;
              if (i / 72 > ringK) return null;
              const w = 0.5 + 0.5 * Math.sin((a * Math.PI) / 180 * 6 - t * 5);
              const [x, y] = P(a);
              return <circle key={i} cx={x} cy={y} r={4 + w * 1.6} fill={C.ink} opacity={0.16 + w * 0.2} />;
            })}
            {th > -89.5 && <path d={arc(-90, th)} stroke={C.green} strokeWidth={9} fill="none" strokeLinecap="round" />}
            {th > -89.5 && <path d={arc(-90, th)} stroke="#FFB48C" strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray="6 30" strokeDashoffset={-t * 120} />}
            {moving && (() => {
              const [x, y] = P(th);
              return (
                <g>
                  {[1, 2, 3, 4].map((q) => { const [qx, qy] = P(th - q * 5); return <circle key={q} cx={qx} cy={qy} r={11 - q * 2} fill={C.green} opacity={0.5 - q * 0.1} />; })}
                  <circle cx={x} cy={y} r={20} fill={C.green} opacity={0.25} />
                  <circle cx={x} cy={y} r={12} fill={C.green} stroke="#fff" strokeWidth={4} />
                </g>
              );
            })()}
            {t > 87.0 && [0, 1, 2].map((q) => {
              const a = ((t - 87.0) * 160 + q * 120) % 360 - 90;
              if (a > th) return null;
              const [x, y] = P(a);
              return <circle key={q} cx={x} cy={y} r={8} fill="#fff" stroke={C.green} strokeWidth={4} />;
            })}
            {/* trigger spoke: dial → node 1 */}
            {ringK > 0.3 && <line x1={RX} y1={RY - 165} x2={RX} y2={N1[1] + NH / 2 + 4} stroke={C.ink} strokeOpacity={0.25} strokeWidth={4} strokeDasharray="3 12" strokeLinecap="round" />}
            {t > T_N1 - 0.3 && t < T_N1 + 0.05 && (() => {
              const k = ease.in(ramp(t, T_N1 - 0.3, T_N1));
              const y = lerp(RY - 165, N1[1] + NH / 2, k);
              return <circle cx={RX} cy={y} r={11} fill={C.green} stroke="#fff" strokeWidth={4} />;
            })()}
          </svg>
          {/* edge label */}
          {t >= T_N2 + 0.02 && (() => {
            const a = (-12 * Math.PI) / 180;
            return (
              <div style={{ position: "absolute", left: RX + 268 * Math.cos(a) - 66, top: RY + 268 * Math.sin(a) - 22, transform: `scale(${pop(t, T_N2 + 0.02, 0.35)})`, display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, background: "#fff", boxShadow: SHADOW }}>
                <div style={{ width: 10, height: 10, borderRadius: 5, background: C.green }} />
                <L s={20} w={700} mono>3 ITEMS</L>
              </div>
            );
          })()}
          {/* bezel ring around the dial */}
          {kD > 0 && (
            <svg width={380} height={380} style={{ position: "absolute", left: RX - 190, top: RY - 190, opacity: kD * dialO, transform: `rotate(${t * 12}deg)` }}>
              {Array.from({ length: 48 }, (_, i) => {
                const a = (i / 48) * Math.PI * 2;
                const r1 = i % 4 ? 172 : 166;
                return <line key={i} x1={190 + Math.cos(a) * 178} y1={190 + Math.sin(a) * 178} x2={190 + Math.cos(a) * r1} y2={190 + Math.sin(a) * r1} stroke={C.ink} strokeOpacity={i % 4 ? 0.2 : 0.45} strokeWidth={i % 4 ? 2 : 3} strokeLinecap="round" />;
              })}
            </svg>
          )}
          {/* ── the automation card / schedule dial (one morphing element) */}
          <div style={{ position: "absolute", left: cx, top: cy, width: cw, height: ch, borderRadius: cr, background: "#fff", boxShadow: "0 2px 3px rgba(0,0,0,.06), 0 24px 60px rgba(20,20,30,.16), 0 60px 120px rgba(20,20,30,.10)", overflow: "hidden", transform: `translateX(${(1 - wk) * 1180}px) skewX(${(1 - wk) * -12}deg)`, opacity: t > M1 ? dialO : 1, zIndex: 2 }}>
            {kA > 0 && (
              <div style={{ position: "absolute", left: 0, top: 0, width: 900, height: 880, opacity: kA, transformOrigin: "0 0", transform: `scale(${cw / 900}, ${ch / 880})` }}>
                {/* header */}
                <div style={{ position: "absolute", right: 50, top: 50, width: 132, height: 132, borderRadius: 36, background: "linear-gradient(150deg,#FF9156,#F25C1F 60%,#D9480F)", boxShadow: "0 14px 34px rgba(242,92,31,.40), inset 0 2px 0 rgba(255,255,255,.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ transform: `rotate(${(t - 79.2) * 40 + on * 360}deg)` }}><Ico n="loop" s={72} c="#fff" w={2.4} /></div>
                </div>
                <T s={80} w={900} style={{ position: "absolute", right: 214, top: 44 }}>اتوماسیون</T>
                <T s={33} w={600} c={C.ink3} style={{ position: "absolute", right: 216, top: 150 }}>ریلز میلیونی، هر روز، با سبک من</T>
                <div style={{ position: "absolute", left: 50, top: 46, display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 999, background: on > 0.5 ? "#FFF0E8" : "#F1F0EC" }}>
                  <div style={{ width: 12, height: 12, borderRadius: 6, background: on > 0.5 ? C.green : "#B9B7B0", boxShadow: on > 0.5 ? `0 0 0 ${4 + 4 * Math.abs(Math.sin(t * 5))}px rgba(242,92,31,.18)` : "none" }} />
                  <L s={20} w={700} mono c={on > 0.5 ? C.green : C.ink3}>{on > 0.5 ? "ACTIVE" : "OFF"}</L>
                </div>
                {/* rows */}
                {[
                  { y: 236, fa: "اجرای خودکار", el: <Toggle on={on} w={150} /> },
                  { y: 362, fa: "زمان", el: <div style={{ display: "flex", alignItems: "center", gap: 10 }}><L s={40} w={600} c={C.ink2}>09:00</L><XI n="chev" s={30} c="#B9B7B0" w={2.6} /></div> },
                  { y: 488, fa: "تکرار", el: <div style={{ display: "flex", alignItems: "center", gap: 10 }}><T s={38} w={700} c={C.ink2}>هر روز</T><XI n="chev" s={30} c="#B9B7B0" w={2.6} /></div> },
                  { y: 614, fa: "منبع", el: <div style={{ display: "flex", alignItems: "center", gap: 12 }}><IgTile s={46} /><L s={30} w={600} c={C.ink2}>Reels · views ≥ 1M</L><XI n="chev" s={30} c="#B9B7B0" w={2.6} /></div> },
                  { y: 740, fa: "سبک", el: <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ padding: "6px 12px", borderRadius: 12, background: C.ink }}><NfpMark s={26} c={C.neon} /></div><L s={28} w={600} mono c={C.ink2}>my-style.nfp</L><XI n="chev" s={30} c="#B9B7B0" w={2.6} /></div> },
                ].map((r, i) => (
                  <div key={i} style={{ position: "absolute", left: 50, right: 50, top: r.y, height: 120, borderTop: "2px solid #EEECE6", display: "flex", alignItems: "center", justifyContent: "space-between", direction: "rtl", background: i > 0 && on > 0.5 ? `rgba(242,92,31,${0.07 * hit(t, T_ON + 0.18 + i * 0.1, 0.4)})` : undefined }}>
                    <T s={42} w={800}>{r.fa}</T>
                    {r.el}
                  </div>
                ))}
                <L s={24} w={600} mono c={on > 0.5 ? C.green : C.ink3} style={{ position: "absolute", left: 50, top: 830 }}>{on > 0.5 ? "● NEXT RUN · TOMORROW 09:00" : "TAP TO ENABLE"}</L>
                <L s={24} w={600} mono c={C.ink3} style={{ position: "absolute", right: 50, top: 830 }}>WORKFLOW · 3 STEPS</L>
                <Tap t={t} t0={T_ON} x={50 + 75} y={236 + 60} from={[150, 230]} />
              </div>
            )}
            {kD > 0 && <div style={{ position: "absolute", left: (cw - 300) / 2, top: (ch - 300) / 2, width: 300, height: 300 }}><DialFace t={t} o={kD} /></div>}
          </div>
          {/* ── node 1 panel: trending reels scanned, million-view ones picked */}
          {kP1 > 0 && (
            <div style={{ position: "absolute", left: 70, top: 52, width: 940, height: 278, borderRadius: 30, background: "#fff", boxShadow: SHADOW, transformOrigin: "50% 100%", transform: `scaleY(${kP1})`, opacity: Math.min(1, kP1 * 2), zIndex: 1 }}>
              <div style={{ position: "absolute", right: 26, top: 14, display: "flex", alignItems: "center", gap: 10, direction: "rtl" }}>
                <Ico n="search" s={22} c={C.green} w={2.6} />
                <T s={24} w={800}>ریلزهای ترند امروز</T>
              </div>
              <L s={17} w={700} mono c={C.ink3} style={{ position: "absolute", left: 26, top: 19 }}>{`SCANNED ${grp(1240 * ease.out(ramp(t, T_REELS, T_MIL + 0.3)))} · FOUND ${FEED.filter((f, i) => f.pick !== undefined && t >= passT(i) + 0.12).length}`}</L>
            </div>
          )}
          {kP1 > 0 &&
            FEED.map((f, i) => {
              const tPass = passT(i);
              const k = ease.out(ramp(t, T_N1 + 0.3 + i * 0.05, T_N1 + 0.62 + i * 0.05));
              if (k <= 0) return null;
              const scroll = (t - 83.0) * 24;
              const bx = 948 - i * 132 - scroll, by = 100;
              const picked = f.pick !== undefined;
              const v = f.v * ease.out(ramp(t, tPass, tPass + 0.3));
              const hl = picked ? ramp(t, tPass + 0.12, tPass + 0.3) : ramp(t, T_MIL + 0.3, T_MIL + 0.45);
              const j = f.pick ?? 0;
              const fk = picked ? ease.io(ramp(t, flyT(j), flyT(j) + 0.42)) : 0;
              if (picked && fk >= 1) return null;
              const gone = picked ? 0 : ease.in(ramp(t, T_FIND + 0.1, T_FIND + 0.45));
              const tx = N1[0] + NW / 2 - 64, ty = N1[1];
              const x = lerp(bx, tx, fk) + 0, y = lerp(by, ty, fk) - Math.sin(fk * Math.PI) * 90;
              const sc = lerp(1, 0.22, fk);
              const edge = clamp((bx - 70) / 40) * clamp((1010 - (bx + 118)) / 40);
              return (
                <div key={i} style={{ position: "absolute", left: x - 59 * (1 - sc) * 0, top: y, width: 118, height: 210, borderRadius: 14, overflow: "hidden", background: "#111", transformOrigin: "50% 50%", transform: `translateY(${(1 - k) * -40 - gone * 60}px) scale(${sc})`, opacity: k * (picked ? Math.max(edge, fk > 0 ? 1 : 0) : edge * (1 - gone) * lerp(1, 0.4, hl)), boxShadow: picked && hl > 0 ? `0 0 0 ${4 * hl}px ${C.green}, 0 12px 30px rgba(242,92,31,${0.35 * hl})` : "0 6px 16px rgba(0,0,0,.18)", zIndex: picked ? 4 : 1 }}>
                  <Clip src={f.src} t0={T_N1 + 0.3} dur={5} />
                  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 70, background: "linear-gradient(transparent, rgba(0,0,0,.65))" }} />
                  <div style={{ position: "absolute", left: 7, bottom: 8, opacity: ramp(t, tPass - 0.02, tPass + 0.08), display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 999, background: picked && hl > 0.5 ? C.green : "rgba(0,0,0,.45)" }}>
                    <Ico n="play" s={12} c="#fff" fill />
                    <L s={15} w={800} c="#fff">{kfmt(v)}</L>
                  </div>
                  {picked && hl > 0 && (
                    <div style={{ position: "absolute", right: 6, top: 6, width: 30, height: 30, borderRadius: 15, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(t, tPass + 0.12, 0.3)})` }}>
                      <Ico n="check" s={18} c="#fff" w={3.6} />
                    </div>
                  )}
                </div>
              );
            })}
          {/* scan beam */}
          {t > T_REELS && t < T_MIL + 0.42 && (() => {
            const k = ease.io(ramp(t, T_REELS + 0.08, T_MIL + 0.3));
            const x = lerp(1000, 80, k);
            return (
              <div style={{ position: "absolute", left: x - 40, top: 92, width: 80, height: 226, zIndex: 5, background: "linear-gradient(90deg, transparent, rgba(242,92,31,.18) 45%, rgba(242,92,31,.18) 55%, transparent)", opacity: 1 - ramp(t, T_MIL + 0.28, T_MIL + 0.4) }}>
                <div style={{ position: "absolute", left: 39, top: 0, width: 3, height: 226, background: C.green, boxShadow: `0 0 14px ${C.green}` }} />
              </div>
            );
          })()}
          {/* ── node 2 panel: my style applied */}
          {kP2 > 0 && <StylePanel t={t} k={kP2} T_N2={T_N2} T_OWN={T_OWN} T_MINE={T_MINE} />}
          {/* ── node 3 panel: finished videos stack + publish queue */}
          {kP3 > 0 && <ReadyPanel t={t} k={kP3} T_N3={T_N3} T_MAKE={T_MAKE} />}
          {/* nodes on top */}
          {[0, 1, 2].map((i) => <NodeCard key={i} i={i} t={t} count={counts[i]} o={nodeO(i)} />)}
        </Cam>
      </div>
      {/* ── HUD: automation live */}
      {t > 81.4 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", justifyContent: "center", opacity: ramp(t, 81.4, 81.7) * (1 - zt) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 24px", borderRadius: 999, background: C.ink, boxShadow: "0 12px 30px rgba(0,0,0,.25)", direction: "rtl" }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, background: C.green, boxShadow: `0 0 0 ${3 + 5 * Math.abs(Math.sin(t * 4))}px rgba(242,92,31,.28)` }} />
            <T s={28} w={800} c="#fff">اتوماسیون روشن</T>
            <div style={{ width: 2, height: 24, background: "rgba(255,255,255,.2)" }} />
            <L s={18} w={700} mono c={C.neon}>{status}</L>
          </div>
        </div>
      )}
    </Full>
  );
};

const StylePanel: React.FC<{ t: number; k: number; T_N2: number; T_OWN: number; T_MINE: number }> = ({ t, k, T_N2, T_OWN, T_MINE }) => {
  const [nx, ny] = P(30);
  const px = nx - 330, py = ny + 82;
  const wipe = ease.io(ramp(t, T_OWN + 0.05, T_OWN + 0.6));
  const sw = ["#16171A", C.green, "#EFEDE6", "#FFFFFF", "#8A8C92"];
  const kIt = (i: number) => pop(t, T_N2 + 0.15 + i * 0.07, 0.32);
  const bpmK = ramp(t, T_OWN, T_OWN + 0.5);
  return (
    <div style={{ position: "absolute", left: px, top: py, width: 540, height: 300, borderRadius: 30, background: "#fff", boxShadow: SHADOW, transformOrigin: "80% 0%", transform: `scale(${lerp(0.6, 1, k)})`, opacity: Math.min(1, k * 1.6), zIndex: 2 }}>
      {/* the reel being restyled (right side) */}
      <div style={{ position: "absolute", right: 18, top: 16, width: 152, height: 268, borderRadius: 16, overflow: "hidden", background: "#000", boxShadow: "0 10px 26px rgba(0,0,0,.22)" }}>
        <Clip src="tiles/t29.mp4" t0={T_N2} dur={2} style={{ filter: "grayscale(1) contrast(1.05) brightness(.92)" }} />
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 0 ${(1 - wipe) * 100}%)` }}>
          <Clip src="tiles/t29.mp4" t0={T_N2} dur={2} style={{ filter: "sepia(.28) saturate(1.45) contrast(1.12) brightness(1.02)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 16, background: "#0B0B0D" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 16, background: "#0B0B0D" }} />
          <NfpMark s={16} c="#fff" style={{ position: "absolute", left: 10, top: 24, opacity: 0.9 }} />
          <div style={{ position: "absolute", left: 10, right: 10, bottom: 30, padding: "6px 8px", borderRadius: 8, background: "rgba(11,11,13,.82)", borderRight: `4px solid ${C.green}` }}>
            <T s={18} w={900} c="#fff" style={{ textAlign: "center" }}>سفر <span style={{ color: C.neon }}>بی‌برگشت</span></T>
          </div>
        </div>
        {wipe > 0 && wipe < 1 && <div style={{ position: "absolute", top: 0, bottom: 0, left: `${(1 - wipe) * 100}%`, width: 4, marginLeft: -2, background: C.neon, boxShadow: `0 0 16px 4px rgba(255,122,61,.8)` }} />}
        {t >= T_MINE && (
          <div style={{ position: "absolute", left: 8, top: 22, transform: `scale(${pop(t, T_MINE, 0.35)}) rotate(-6deg)`, display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 999, background: C.green, boxShadow: "0 6px 14px rgba(242,92,31,.5)" }}>
            <Ico n="check" s={14} c="#fff" w={3.6} />
            <T s={16} w={900} c="#fff">سبک من</T>
          </div>
        )}
      </div>
      {/* style kit (left side) */}
      <div style={{ position: "absolute", right: 196, top: 18, display: "flex", alignItems: "center", gap: 10, direction: "rtl" }}>
        <T s={28} w={900}>سبک اختصاصی من</T>
      </div>
      <div style={{ position: "absolute", left: 20, top: 22, padding: "4px 10px", borderRadius: 8, background: C.ink, transform: `scale(${kIt(0)})` }}><NfpMark s={18} c={C.neon} /></div>
      <div style={{ position: "absolute", right: 196, top: 74, display: "flex", gap: 10, direction: "rtl" }}>
        {sw.map((c, i) => (
          <div key={i} style={{ width: 44, height: 44, borderRadius: 22, background: c, boxShadow: c === "#FFFFFF" || c === "#EFEDE6" ? "inset 0 0 0 2px #E2E0D9" : "none", transform: `scale(${kIt(i) * (1 + hit(t, T_OWN + i * 0.05, 0.25) * 0.25)})`, outline: i === 1 ? `3px solid ${C.green}` : undefined, outlineOffset: 3 }} />
        ))}
      </div>
      <div style={{ position: "absolute", right: 196, top: 140, display: "flex", alignItems: "center", gap: 12, direction: "rtl", transform: `scale(${kIt(3)})`, transformOrigin: "100% 50%" }}>
        <div style={{ width: 62, height: 62, borderRadius: 16, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontFamily: FA, fontWeight: 900, fontSize: 40, color: "#fff", lineHeight: 1 }}>آ</span></div>
        <div style={{ width: 62, height: 62, borderRadius: 16, background: "#F1F0EC", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontFamily: NUM, fontWeight: 700, fontSize: 30, color: C.ink, lineHeight: 1 }}>Aa</span></div>
        <div>
          <L s={17} w={700} c={C.ink}>Morabba Black</L>
          <L s={14} w={600} mono c={C.ink3}>TITLE · RTL</L>
        </div>
      </div>
      <div style={{ position: "absolute", right: 196, top: 222, display: "flex", alignItems: "flex-end", gap: 5, height: 48, direction: "ltr", transform: `scale(${kIt(4)})`, transformOrigin: "100% 50%" }}>
        <L s={18} w={800} mono c={C.green} style={{ marginRight: 10, alignSelf: "center" }}>{`${Math.round(lerp(96, 124, bpmK))} BPM`}</L>
        {Array.from({ length: 13 }, (_, i) => {
          const beat = Math.floor(t * 4.1) % 13;
          const h = 10 + 34 * Math.abs(Math.sin(i * 1.7 + t * 7)) * (0.5 + 0.5 * rnd(i));
          return <div key={i} style={{ width: 8, height: h, borderRadius: 4, background: i === beat ? C.green : C.ink, opacity: i === beat ? 1 : 0.75 }} />;
        })}
      </div>
    </div>
  );
};

const ReadyPanel: React.FC<{ t: number; k: number; T_N3: number; T_MAKE: number }> = ({ t, k, T_N3, T_MAKE }) => {
  const [nx, ny] = P(150);
  const px = nx - 214, py = ny + 82;
  const rows = [
    { d: "امروز", s: "09:00", ok: true },
    { d: "فردا", s: "09:00" },
    { d: "پس‌فردا", s: "09:00" },
  ];
  return (
    <div style={{ position: "absolute", left: px, top: py, width: 540, height: 300, borderRadius: 30, background: "#fff", boxShadow: SHADOW, transformOrigin: "40% 0%", transform: `scale(${lerp(0.6, 1, k)})`, opacity: Math.min(1, k * 1.6), zIndex: 2 }}>
      {/* stack of finished reels (right) */}
      {DONE_V.map((src, j) => {
        const tj = T_N3 + 0.08 + j * 0.2;
        const kk = spring(t, tj, 0.45, 0.25);
        if (kk <= 0) return null;
        const rot = [-7, 4, -2][j];
        return (
          <div key={j} style={{ position: "absolute", right: 30 + j * 20, top: 22 + j * 8, width: 138, height: 246, borderRadius: 14, overflow: "hidden", background: "#000", boxShadow: "0 12px 28px rgba(0,0,0,.28)", transform: `translateY(${(1 - kk) * -90}px) rotate(${rot * kk}deg) scale(${lerp(1.12, 1, Math.min(1, kk))})`, opacity: clamp((t - tj) * 16), zIndex: j }}>
            <Clip src={src} t0={tj} dur={2} />
            <div style={{ position: "absolute", right: 7, top: 7, padding: "3px 9px", borderRadius: 999, background: "rgba(255,255,255,.92)", display: "flex", gap: 4, alignItems: "center", direction: "rtl" }}>
              <T s={14} w={800}>روز</T><L s={14} w={800}>{j + 1}</L>
            </div>
            <div style={{ position: "absolute", left: 7, bottom: 7, width: 30, height: 30, borderRadius: 15, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(t, tj + 0.25, 0.3)})` }}>
              <Ico n="check" s={18} c="#fff" w={3.6} />
            </div>
          </div>
        );
      })}
      {/* publish queue (left) */}
      <div style={{ position: "absolute", left: 22, top: 20, width: 300 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", direction: "rtl" }}>
          <T s={26} w={900}>صف انتشار</T>
          <L s={15} w={700} mono c={C.ink3}>AUTO · DAILY</L>
        </div>
        {rows.map((r, i) => {
          const kk = pop(t, T_MAKE + i * 0.1, 0.3);
          return (
            <div key={i} style={{ marginTop: 14, height: 62, borderRadius: 16, background: i === 0 ? "#FFF1EA" : "#F6F5F1", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", direction: "rtl", transform: `scale(${kk})`, transformOrigin: "100% 50%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: i === 0 ? C.green : "#E6E3DA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ico n={i === 0 ? "check" : "clock"} s={20} c={i === 0 ? "#fff" : C.ink3} w={2.8} />
                </div>
                <T s={24} w={800}>{r.d}</T>
              </div>
              <L s={22} w={700} c={i === 0 ? C.green : C.ink3}>{r.s}</L>
            </div>
          );
        })}
      </div>
    </div>
  );
};

