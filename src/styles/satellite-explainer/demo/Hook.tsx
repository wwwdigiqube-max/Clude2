import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from "remotion";
import { noise2D } from "@remotion/noise";
import vo from "./vo.json";
import { Earth, EarthState, HALO, earthProject } from "./Earth";
import { FA, ramp } from "./geo";
import { FONT_HERO, FONT_UI } from "./fx";

/*
  Opening hook, a 6-second story (all cues come from the narration words):
  1. frame 0: the sun cresting behind a night-side Earth (city lights).
  2. «بزرگ‌ترین» impact: white flash at the East Pacific, a thin shockwave races out, daylight sweeps in (3/4 lit),
     title slams «بزرگ‌ترین خشکسالی».
  3. the front wraps the planet: land dries, clouds evaporate, the El Niño tongue burns white-hot; the HUD runs
     ۲۰۲۶ → ۲۰۲۷ and the water readout climbs to +۳°C.
  4. «در انتظار زمینه…»: the planet turns 150° (Pacific → Australia → India) while the camera pushes in; heartbeats.
  5. «بیاین بهتون توضیح بدم»: 12 fps VHS rewind back to today, then a dive through real clouds into Central America.
*/

type W = { w: string; s: number; e: number; line: number };
const HW = (vo.words as W[]).filter((w) => w.line === 0);
export const HOOK_CUES = {
  big: HW[0].s, drought: HW[1].s, world: HW[2].s, dar: HW[3].s, zamine: HW[5].s, explain: HW[6].s,
};
const C = HOOK_CUES;
const RW0 = C.explain - 0.02, RW1 = RW0 + 0.8; // rewind window
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pulse = (t: number, at: number[], k = 7) => at.reduce((m, a) => Math.max(m, t >= a ? Math.exp(-(t - a) * k) : 0), 0);
const BEATS = [C.dar + 0.02, C.dar + 0.72, C.dar + 1.42];
const SPIN0 = -104, SPIN1 = -254; // natural rotation: Pacific → Australia → India

// story time for the damage: runs backwards (at 12 fps, stuttering) during the rewind
const storyT = (t: number) => {
  if (t <= RW0) return t;
  const q = Math.min(RW1, RW0 + Math.floor((t - RW0) * 12) / 12);
  return RW0 - ((q - RW0) / (RW1 - RW0)) * (RW0 - C.big);
};
const frontOf = (s: number) => (s <= C.big ? 0 : 190 * (1 - Math.exp(-1.24 * (s - C.big))));

export const hookState = (t: number): EarthState => {
  const s = storyT(t);
  const sunK = ramp(t, C.big, C.big + 0.55, Easing.bezier(0.3, 0, 0.2, 1));
  const S0 = [0.55, 0.62, -0.6], S1 = [0.72, 0.3, 0.62];
  const lon0 = t < C.dar
    ? interpolate(t, [0, C.big, C.dar], [-118, -114, -104], clamp)
    : t < RW0
      ? interpolate(t, [C.dar, RW0], [SPIN0, SPIN1], { ...clamp, easing: Easing.bezier(0.45, 0, 0.55, 1) })
      : interpolate(storyT(t), [C.big, RW0], [-94, SPIN1], clamp);
  return {
    lon0,
    lat0: t < RW0 ? interpolate(t, [0, C.world, RW0], [18, 8, 2], clamp) : interpolate(t, [RW0, RW1], [2, 12], clamp),
    sun: S0.map((v, i) => v + (S1[i] - v) * sunK) as [number, number, number],
    clouds: 1,
    cloudDrift: t * 2.2,
    heat: ramp(s, C.big - 0.02, C.big + 0.08),
    front: frontOf(s),
    epi: [-112, -2],
    cracks: ramp(s, C.drought + 0.2, C.zamine),
    rimHeat: ramp(s, C.drought + 0.3, C.zamine + 0.2),
    lights: 1 - 0.55 * sunK,
  };
};

// camera: disc diameter + centre on screen
const hookCam = (t: number, end: number) => {
  const beat = pulse(t, BEATS);
  let D = t < C.big ? interpolate(t, [0, C.big], [1760, 1800], clamp)
    : t < C.dar ? interpolate(t, [C.big, C.world], [1800, 900], { ...clamp, easing: Easing.bezier(0.2, 0.75, 0.3, 1) })
    : t < RW0 ? interpolate(t, [C.dar, RW0], [900, 1170], { ...clamp, easing: Easing.bezier(0.4, 0, 0.6, 1) })
    : t < RW1 ? interpolate(t, [RW0, RW1], [1170, 1000], clamp)
    : interpolate(t, [RW1, end], [1000, 8500], { ...clamp, easing: Easing.in(Easing.exp) });
  D *= 1 + 0.03 * beat;
  const cy = t < C.big ? 1400
    : t < C.dar ? interpolate(t, [C.big, C.world], [1400, 1040], { ...clamp, easing: Easing.bezier(0.2, 0.75, 0.3, 1) })
    : t < RW1 ? interpolate(t, [RW0, RW1], [1040, 960], clamp)
    : 960;
  return { D, cx: 540, cy, beat };
};

const Sun: React.FC<{ x: number; y: number; k: number; streak: number }> = ({ x, y, k, streak }) => {
  if (k <= 0.001) return null;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: x - 480, top: y - 480, width: 960, height: 960, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,214,160,.5), rgba(255,150,70,.14) 35%, transparent 68%)", opacity: k }} />
      <div style={{ position: "absolute", left: x - 85, top: y - 85, width: 170, height: 170, borderRadius: "50%", background: "radial-gradient(circle, #fff 0%, #fff 24%, rgba(255,238,195,.9) 42%, rgba(255,170,80,0) 72%)", opacity: Math.min(1, k * 1.2) }} />
      {streak > 0.01 && <div style={{ position: "absolute", left: x - 700, top: y - 7, width: 1400, height: 14, borderRadius: 7, background: "linear-gradient(90deg, transparent, rgba(150,200,255,.5) 30%, rgba(255,255,255,.95) 50%, rgba(150,200,255,.5) 70%, transparent)", opacity: k * streak, filter: "blur(2px)" }} />}
    </AbsoluteFill>
  );
};

export const Hook: React.FC<{ t: number; end: number }> = ({ t, end }) => {
  const st = hookState(t);
  const cam = hookCam(t, end);
  const s = storyT(t);
  const rew = t > RW0 && t < RW1 + 0.04 ? 1 : 0;
  const dive = ramp(t, RW1, end, Easing.in(Easing.cubic));
  const hit = pulse(t, [C.big], 9);
  const shake = {
    x: noise2D("hs", t * 10, 0) * (1.5 + 6 * hit + 3 * cam.beat) + (rew ? noise2D("rw", Math.floor(t * 12), 1) * 5 : 0),
    y: noise2D("hs", 0, t * 10) * (1.5 + 6 * hit + 3 * cam.beat) + (rew ? Math.round(noise2D("rv", Math.floor(t * 12), 2)) * 6 : 0),
  };
  const disp = cam.D * HALO;
  const px = Math.min(1500, Math.round(disp / 2) * 2);
  const sc = disp / px;
  // sun: cresting the upper-right limb on frame 0, then it stays in space beside the planet
  const a = (24 * Math.PI) / 180;
  const D0 = 1760, cy0 = 1400;
  const rise = 0.05 + 0.04 * ramp(t, 0, C.big + 0.3);
  const s0 = { x: 540 + Math.sin(a) * D0 * 0.5 * (1 + rise), y: cy0 - Math.cos(a) * D0 * 0.5 * (1 + rise) };
  const park = ramp(t, C.big, C.world, Easing.bezier(0.3, 0, 0.2, 1));
  const sun = { x: s0.x + (935 - s0.x) * park, y: s0.y + (560 - s0.y) * park };
  const sunI = (0.9 + 0.25 * st.rimHeat) * (1 - ramp(t, RW1, RW1 + 0.2));
  const streak = 1 - ramp(t, C.big + 0.2, C.world);
  // HUD
  const hudO = ramp(t, C.world - 0.1, C.world + 0.2) * (1 - ramp(t, RW1 - 0.1, RW1));
  const yearK = ramp(s, C.big + 0.05, RW0 - 0.3, (x) => x);
  const m = Math.min(23, Math.floor(yearK * 23.999));
  const yy = 2026 + Math.floor(m / 12), mm = (m % 12) + 1;
  const temp = 3.0 * yearK;
  // epicentre lock-on
  const epi = earthProject(st, st.epi[0], st.epi[1]);
  const epiX = cam.cx + epi.x * cam.D * 0.5, epiY = cam.cy + epi.y * cam.D * 0.5;
  const retO = ramp(t, C.big, C.big + 0.08) * (1 - ramp(t, C.drought + 0.2, C.world)) * (epi.z > 0 ? 1 : 0);
  // title
  const slam = t >= C.big ? interpolate(t, [C.big, C.big + 0.17], [1.25, 1], { ...clamp, easing: Easing.out(Easing.quad) }) : 0;
  const titleO = ramp(t, C.big, C.big + 0.06) * (1 - ramp(t, C.dar - 0.25, C.dar));
  const worldS = t >= C.world ? interpolate(t, [C.world, C.world + 0.12, C.world + 0.2], [0.6, 1.12, 1], clamp) : 0;
  const scorch = st.rimHeat;
  return (
    <AbsoluteFill style={{ background: "#010206", overflow: "hidden" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="hk-rgb" x="-5%" y="-5%" width="110%" height="110%">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feOffset in="r" dx={4} dy={0} result="ro" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="gb" />
          <feOffset in="gb" dx={-3} dy={0} result="gbo" />
          <feBlend in="ro" in2="gbo" mode="screen" />
        </filter>
      </svg>

      <AbsoluteFill style={{ filter: rew ? "url(#hk-rgb)" : undefined, transform: `translate(${shake.x}px, ${shake.y}px)` }}>
        {/* deep space: faint blue nebula + twinkling stars */}
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 25% 15%, rgba(40,60,120,.22), transparent 55%), radial-gradient(ellipse at 85% 75%, rgba(30,40,90,.18), transparent 55%)" }} />
        {Array.from({ length: 120 }, (_, i) => {
          const x = (i * 197.3) % 1080, y = (i * 331.7 + t * (6 + (i % 5) * 3)) % 1920;
          const tw = 0.5 + 0.5 * Math.sin(t * (2 + (i % 7)) + i);
          return <div key={i} style={{ position: "absolute", left: x, top: y, width: i % 9 === 0 ? 4 : 2, height: i % 9 === 0 ? 4 : 2, borderRadius: 2, background: "#fff", opacity: (0.2 + 0.55 * tw) * (1 - dive) }} />;
        })}

        {/* sun disc sits behind the planet */}
        <div style={{ position: "absolute", left: sun.x - 140, top: sun.y - 140, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, #fff 0 26%, rgba(255,222,165,.9) 42%, rgba(255,150,60,0) 70%)", opacity: sunI }} />

        {/* the planet */}
        <div style={{ position: "absolute", left: cam.cx - px / 2, top: cam.cy - px / 2, width: px, height: px, transform: `scale(${sc})`, filter: dive > 0.02 ? `blur(${dive * 5}px)` : undefined }}>
          <Earth size={px} state={st} style={{ inset: 0 }} bloom={0.32 + 0.25 * scorch + 0.35 * dive} trail={dive} />
        </div>

        {/* heartbeat: a faint heat ring leaves the planet on each beat */}
        {BEATS.map((b, i) => {
          const k = (t - b) / 0.9;
          if (k <= 0 || k >= 1 || rew) return null;
          const r = cam.D * 0.5 * (1.02 + 0.35 * k);
          return <div key={i} style={{ position: "absolute", left: cam.cx - r, top: cam.cy - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `${3 + 3 * (1 - k)}px solid rgba(255,140,60,${(0.55 * (1 - k)).toFixed(3)})`, boxShadow: `0 0 30px rgba(255,110,40,${(0.35 * (1 - k)).toFixed(3)})` }} />;
        })}

        {/* embers off the scorched limb */}
        {scorch > 0.02 && Array.from({ length: 22 }, (_, i) => {
          const ph = (t * (0.22 + (i % 6) * 0.05) + i * 0.173) % 1;
          const an = (i / 22) * Math.PI * 2 + 0.3;
          const r0 = cam.D * 0.5 * (1.0 + ph * 0.4);
          return <div key={i} style={{ position: "absolute", left: cam.cx + Math.cos(an) * r0, top: cam.cy + Math.sin(an) * r0 - ph * 80, width: 5, height: 5, borderRadius: 3, background: "#ffc46b", boxShadow: "0 0 10px 3px rgba(255,120,20,.8)", opacity: Math.sin(ph * Math.PI) * scorch * (1 - dive) * (rew ? 0 : 1) }} />;
        })}

        {/* impact flash + lock-on at the epicentre */}
        {t >= C.big && t < C.big + 0.1 && epi.z > 0 && (
          <div style={{ position: "absolute", left: epiX - 160, top: epiY - 160, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, #fff 0 18%, rgba(255,240,200,.8) 35%, transparent 70%)", opacity: 1 - (t - C.big) / 0.1 }} />
        )}
        {retO > 0.01 && (
          <div style={{ position: "absolute", left: epiX, top: epiY, opacity: retO }}>
            <svg width={200} height={200} style={{ position: "absolute", left: -100, top: -100, overflow: "visible" }}>
              <circle cx={100} cy={100} r={46} fill="none" stroke="rgba(255,255,255,.9)" strokeWidth={3} />
              <g stroke="#fff" strokeWidth={3}>
                <line x1={20} y1={100} x2={62} y2={100} /><line x1={138} y1={100} x2={180} y2={100} />
                <line x1={100} y1={20} x2={100} y2={62} /><line x1={100} y1={138} x2={100} y2={180} />
              </g>
              <circle cx={100} cy={100} r={6} fill="#ffcf6b" />
            </svg>
            <div dir="rtl" style={{ position: "absolute", left: 60, top: -70, whiteSpace: "nowrap", fontFamily: FONT_UI, fontWeight: 900, fontSize: 40, color: "#fff", textShadow: "0 0 14px rgba(255,140,60,.9), 0 3px 8px rgba(0,0,0,.8)" }}>النینیو</div>
          </div>
        )}

        {/* dive: real cloud layers rushing past */}
        {dive > 0.01 && [0, 1, 2, 3].map((i) => {
          const k = Math.min(1, Math.max(0, dive * 1.5 - i * 0.16));
          if (k <= 0) return null;
          const sc2 = 0.9 + k * k * 6;
          return <Img key={i} src={staticFile("styles/satellite-explainer/earth_clouds.jpg")} style={{
            position: "absolute", left: 540 - 1600, top: 960 - 800, width: 3200, height: 1600, maxWidth: "none",
            transform: `translate(${(i - 1.5) * 90}px, ${(i % 2 ? -1 : 1) * 70}px) scale(${sc2}) rotate(${i * 47}deg)`,
            mixBlendMode: "screen", opacity: Math.sin(k * Math.PI) * 0.95, filter: `blur(${1 + k * 9}px) contrast(1.5) brightness(1.15)`,
          }} />;
        })}
      </AbsoluteFill>

      {/* sun bloom + sunrise streak on top */}
      <Sun x={sun.x + shake.x} y={sun.y + shake.y} k={sunI} streak={streak} />
      {/* subtle vignette keeps space black */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.55) 100%)", pointerEvents: "none" }} />

      {/* title slam */}
      {titleO > 0.01 && (
        <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", opacity: titleO, transform: `scale(${slam})`, filter: slam > 1.05 ? `blur(${(slam - 1) * 8}px)` : undefined }}>
          <span style={{ fontFamily: FONT_HERO, fontSize: 112, color: "#fff", textShadow: "0 0 22px rgba(255,160,90,.55), 0 6px 16px rgba(0,0,0,.8)" }}>بزرگ‌ترین </span>
          <span style={{ fontFamily: FONT_HERO, fontSize: 124, color: "#ffb347", textShadow: "0 0 26px rgba(255,110,20,.95), 0 0 70px rgba(255,70,0,.7), 0 6px 16px rgba(0,0,0,.8)" }}>خشکسالی</span>
          <div style={{ fontFamily: FONT_HERO, fontSize: 96, color: "#fff", lineHeight: 1.1, transform: `scale(${worldS})`, opacity: worldS > 0 ? 1 : 0, textShadow: "0 0 20px rgba(255,140,60,.6), 0 6px 14px rgba(0,0,0,.8)" }}>دنیا</div>
        </div>
      )}

      {/* ============ HUD: time machine + water temperature ============ */}
      {hudO > 0.01 && (
        <AbsoluteFill style={{ opacity: hudO, pointerEvents: "none", transform: `translateY(${(1 - hudO) * -30}px)` }}>
          {[[60, 90, 1], [1020, 90, -1]].map(([x, y, sx], i) => (
            <svg key={i} width={70} height={70} style={{ position: "absolute", left: x - (sx < 0 ? 70 : 0), top: y }}>
              <path d={`M${sx > 0 ? 2 : 68} 44 L${sx > 0 ? 2 : 68} 2 L${sx > 0 ? 44 : 26} 2`} fill="none" stroke="rgba(255,255,255,.75)" strokeWidth={4} />
            </svg>
          ))}
          <div style={{ position: "absolute", left: 150, right: 150, top: 104, height: 200 }}>
            {/* date */}
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, textAlign: "center", direction: "ltr", fontFamily: FONT_HERO, fontSize: 64, color: "#fff", textShadow: "0 0 18px rgba(255,140,60,.8)" }}>
              <span style={{ fontFamily: FONT_UI, fontWeight: 900, fontSize: 38, marginRight: 16, color: rew ? "#7fd8ff" : "#ffd166" }}>{rew ? "◀◀" : "▶▶"}</span>
              {FA(yy)}<span style={{ fontSize: 40, opacity: 0.8 }}>/{FA(String(mm).padStart(2, "0"))}</span>
            </div>
            {/* track */}
            <div style={{ position: "absolute", left: 0, right: 0, top: 98, height: 3, background: "rgba(255,255,255,.3)" }} />
            <div style={{ position: "absolute", left: 0, width: `${yearK * 100}%`, top: 97, height: 5, background: `linear-gradient(90deg, #ffd166, ${yearK > 0.6 ? "#ff3b1f" : "#ff9f40"})`, boxShadow: "0 0 14px rgba(255,120,40,.9)" }} />
            <div style={{ position: "absolute", left: `calc(${yearK * 100}% - 11px)`, top: 88, width: 22, height: 22, borderRadius: 11, background: "#fff", boxShadow: "0 0 16px rgba(255,200,120,1)" }} />
            <div style={{ position: "absolute", left: -8, top: 112, fontFamily: FONT_HERO, fontSize: 34, color: "rgba(255,255,255,.7)" }}>{FA(2026)}</div>
            <div style={{ position: "absolute", right: -8, top: 112, fontFamily: FONT_HERO, fontSize: 34, color: yearK > 0.6 ? "#ff6a3d" : "rgba(255,255,255,.7)" }}>{FA(2027)}</div>
            {/* water temperature readout */}
            <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: FONT_UI, fontWeight: 800, fontSize: 30, color: "rgba(255,255,255,.8)" }}>
              دمای آب اقیانوس آرام{" "}
              <span dir="ltr" style={{ unicodeBidi: "isolate", fontFamily: FONT_HERO, fontSize: 46, color: temp > 1.8 ? "#ff5a36" : "#ffd166", textShadow: "0 0 14px rgba(255,90,40,.8)" }}>+{FA(temp.toFixed(1)).replace(".", "٫")}°C</span>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* VHS rewind artefacts */}
      {rew === 1 && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,.25) 0 2px, transparent 2px 5px)" }} />
          {[0, 1].map((i) => {
            const y = ((Math.floor(t * 12) / 12) * (900 + i * 500) + i * 700) % 2200 - 140;
            return <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y, height: 50 + i * 30, background: "linear-gradient(0deg, transparent, rgba(255,255,255,.2), transparent)", mixBlendMode: "screen" }} />;
          })}
        </AbsoluteFill>
      )}
      {/* white-out into the explainer (pure white on the last 2 frames) */}
      <AbsoluteFill style={{ background: "#fff", opacity: Math.min(1, ramp(t, end - 0.3, end - 0.066)) }} />
    </AbsoluteFill>
  );
};
