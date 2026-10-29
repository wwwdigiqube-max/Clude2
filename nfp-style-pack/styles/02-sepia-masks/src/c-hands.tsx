import React from "react";
import { AbsoluteFill } from "remotion";
import { W } from "./cues";
import { Glow, Motes } from "./fx";
import type { SceneProps } from "./frame";
import { boil, clamp, eio, eo, lerp, P, pr, rnd } from "./theme";
import { Hand, ik, Limb, Pt, r1, StaticNoise } from "./c-kit";

// ================= «hands» — high angle on a dark floor, a tall KEYHOLE of light; clawed arms creep in from the dark =================
const KC: Pt = [540, 560]; // keyhole circle
const KR = 128;
const SLOT_T = 640;
const SLOT_HW0 = 52;
const SLOT_HW1 = 300;
const KEY_SLOT = `M ${KC[0] - SLOT_HW0} ${SLOT_T} L ${KC[0] - SLOT_HW1 - 30} 2000 L ${KC[0] + SLOT_HW1 + 30} 2000 L ${KC[0] + SLOT_HW0} ${SLOT_T} Z`;
const VP: Pt = [540, -1500]; // floor vanishing point (planks)

type ArmDef = { sh: Pt; l1: number; l2: number; from: Pt; to: Pt; bend: number; a0: number; a1: number; s: number; w: number; m: number; cd: number; d: number };
const ARMS: ArmDef[] = [
  // left edge
  { sh: [-90, 300], l1: 300, l2: 290, from: [215, 430], to: [398, 522], bend: -1, a0: 18, a1: 8, s: 106, w: 23, m: 1, cd: 1, d: 0 },
  { sh: [-100, 820], l1: 330, l2: 300, from: [230, 900], to: [446, 962], bend: -1, a0: 22, a1: 6, s: 120, w: 26, m: 1, cd: 1, d: 0.35 },
  { sh: [-110, 1330], l1: 330, l2: 300, from: [170, 1400], to: [336, 1470], bend: -1, a0: 14, a1: 4, s: 128, w: 27, m: 1, cd: 1, d: 0.15 },
  // right edge
  { sh: [1170, 400], l1: 300, l2: 290, from: [870, 520], to: [682, 588], bend: 1, a0: 162, a1: 172, s: 112, w: 24, m: -1, cd: -1, d: 0.2 },
  { sh: [1180, 1050], l1: 330, l2: 300, from: [880, 1110], to: [664, 1152], bend: 1, a0: 158, a1: 172, s: 126, w: 26, m: -1, cd: -1, d: 0.55 },
  { sh: [1190, 1560], l1: 330, l2: 310, from: [930, 1600], to: [790, 1652], bend: 1, a0: 164, a1: 176, s: 132, w: 28, m: -1, cd: -1, d: 0.05 },
  // bottom
  { sh: [300, 2150], l1: 260, l2: 250, from: [290, 1820], to: [360, 1652], bend: 1, a0: -74, a1: -66, s: 120, w: 27, m: 1, cd: 1, d: 0.6 },
  { sh: [800, 2150], l1: 260, l2: 250, from: [790, 1830], to: [722, 1672], bend: -1, a0: -106, a1: -114, s: 120, w: 27, m: -1, cd: -1, d: 0.9 },
  // top corners
  { sh: [1120, -120], l1: 280, l2: 270, from: [890, 230], to: [662, 448], bend: -1, a0: 140, a1: 146, s: 102, w: 22, m: -1, cd: -1, d: 0.75 },
  { sh: [-60, -110], l1: 280, l2: 270, from: [190, 210], to: [418, 452], bend: 1, a0: 42, a1: 36, s: 100, w: 22, m: 1, cd: 1, d: 1.0 },
];

export const SceneHands: React.FC<SceneProps> = ({ t, lt, f, dur }) => {
  const tQ = W(11, "قصه");
  const tNow = W(11, "حالا");

  // light: a breathing bulb, a fit of flicker on «قصه»
  const FL = [1, 0.22, 0.9, 0.1, 0.55, 1, 0.35, 0.95, 0.7, 1];
  const fq = Math.floor((t - tQ + 0.02) * 24);
  const flick = fq >= 0 && fq < FL.length ? FL[fq] : 1;
  const intf = eio(pr(lt, dur - 0.62, 0.62)); // analogue interference creeping in
  const lightK = flick * (0.94 + 0.06 * boil(f, 41, 1, 3)) * (1 - 0.35 * intf * (rnd(f * 3.1) > 0.6 ? 1 : 0.3)) * (0.82 + 0.18 * eo(clamp(lt / 0.5)));

  // camera: high angle, slow push toward the keyhole
  const cam = 1 + 0.09 * eio(clamp(lt / dur));
  const camRot = 0.9 * eio(clamp(lt / dur));
  const jit = boil(f, 9, 26 * intf * intf, 1);

  // creeping: slow advance + spidery lurches + a lunge while the light stutters
  const creep = (a: ArmDef, i: number) => {
    const base = 0.4 * clamp((lt - a.d * 0.4) / 3.6);
    let steps = 0;
    for (let k = 0; k < 6; k++) {
      const tk = a.d * 0.5 + 0.2 + k * (0.52 + rnd(i * 10 + k) * 0.3);
      steps += 0.085 * eo(pr(lt, tk, 0.14));
    }
    const lunge = 0.2 * eo(pr(t, tQ + 0.03 + rnd(i + 50) * 0.08, 0.18));
    return clamp(base + steps + lunge, 0, 1.15);
  };

  const arms = ARMS.map((a, i) => {
    const p = creep(a, i);
    const hand: Pt = [lerp(a.from[0], a.to[0], p) + boil(f, i * 5 + 1, 2), lerp(a.from[1], a.to[1], p) + boil(f, i * 5 + 2, 2)];
    const el = ik(a.sh, hand, a.l1, a.l2, a.bend);
    const ang = lerp(a.a0, a.a1, clamp(p)) + boil(f, i * 5 + 3, 3);
    const curls = [0, 1, 2, 3].map((k) => 0.55 + 0.3 * Math.max(0, Math.sin(lt * 8 + k * 1.4 + i * 2.1)) + (flick < 0.5 ? 0.35 : 0));
    return { a, i, hand, el, ang, curls };
  });

  const armEl = (x: (typeof arms)[number], shadow: boolean) => (
    <g key={`${shadow ? "s" : "a"}${x.i}`}>
      <Limb pts={[x.a.sh, x.el, x.hand]} ws={[x.a.w, x.a.w * 0.7, x.a.w * 0.48]} />
      <Hand
        x={x.hand[0]}
        y={x.hand[1]}
        a={x.ang}
        s={x.a.s}
        m={x.a.m}
        cd={x.a.cd}
        spread={12}
        curls={x.curls}
        f={f}
        seed={1000 + x.i * 31}
        tw={0.14}
        claw={0.13}
      />
    </g>
  );

  // planks converging to the far end
  const planks = Array.from({ length: 19 }, (_, k) => {
    const xb = 540 + (k - 9) * 150;
    return `M ${VP[0]} ${VP[1]} L ${r1(VP[0] + (xb - VP[0]) * 1.12)} ${r1(VP[1] + (1920 - VP[1]) * 1.12)}`;
  });
  const seams = Array.from({ length: 70 }, (_, i) => {
    const k = Math.floor(rnd(i + 900) * 18);
    const yy = 80 + rnd(i + 950) * 1840;
    const s = (yy - VP[1]) / (1920 - VP[1]);
    const x0 = VP[0] + (540 + (k - 9) * 150 - VP[0]) * s;
    const x1 = VP[0] + (540 + (k - 8) * 150 - VP[0]) * s;
    return `M ${r1(x0)} ${r1(yy)} L ${r1(x1)} ${r1(yy)}`;
  });
  const grain = Array.from({ length: 46 }, (_, i) => {
    const k = (rnd(i + 1300) - 0.5) * 7;
    const y0 = 380 + rnd(i + 1400) * 1500;
    const len = 60 + rnd(i + 1500) * 220;
    const sx = (yy: number) => VP[0] + (540 + k * 150 - VP[0]) * ((yy - VP[1]) / (1920 - VP[1]));
    return `M ${r1(sx(y0))} ${r1(y0)} L ${r1(sx(y0 + len))} ${r1(y0 + len)}`;
  });

  // interference bars
  const barY = ((lt * 1450 + 300) % 2400) - 240;
  const barY2 = ((lt * 920 + 1500) % 2300) - 160;

  return (
    <AbsoluteFill style={{ background: P.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateX(${jit}px) rotate(${camRot}deg) scale(${cam})`, transformOrigin: "540px 760px" }}>
        {/* the dark floor */}
        <div
          style={{
            position: "absolute",
            left: -150,
            top: -150,
            width: 1380,
            height: 2220,
            background: `radial-gradient(ellipse 60% 46% at 50% 44%, ${P.fog} 0%, ${P.fog} 38%, ${P.ink} 100%)`,
          }}
        />
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <defs>
            <linearGradient id="c-hd-light" gradientUnits="userSpaceOnUse" x1="0" y1="420" x2="0" y2="1920">
              <stop offset="0" stopColor={P.bone} />
              <stop offset="0.28" stopColor={P.amberHi} />
              <stop offset="0.7" stopColor={P.amber} />
              <stop offset="1" stopColor={P.sepia} />
            </linearGradient>
            <clipPath id="c-hd-key">
              <circle cx={KC[0]} cy={KC[1]} r={KR} />
              <path d={KEY_SLOT} />
            </clipPath>
          </defs>
          {/* soft penumbra around the keyhole */}
          {[1.13, 1.07, 1.03].map((k, i) => (
            <g key={i} transform={`translate(${KC[0]} ${KC[1]}) scale(${k}) translate(${-KC[0]} ${-KC[1]})`} opacity={0.12 * lightK} fill={P.amberHi}>
              <circle cx={KC[0]} cy={KC[1]} r={KR} />
              <path d={KEY_SLOT} />
            </g>
          ))}
          {/* the keyhole of light */}
          <g opacity={lightK} fill="url(#c-hd-light)">
            <circle cx={KC[0]} cy={KC[1]} r={KR} />
            <path d={KEY_SLOT} />
          </g>
          {/* floor boards: dark lines everywhere, grain only shows in the light */}
          <g stroke={P.ink} fill="none">
            {planks.map((d, i) => (
              <path key={i} d={d} strokeWidth={4} opacity={0.55} />
            ))}
            {seams.map((d, i) => (
              <path key={`s${i}`} d={d} strokeWidth={3} opacity={0.45} />
            ))}
          </g>
          <g clipPath="url(#c-hd-key)" stroke={P.sepia} fill="none" opacity={0.55 * lightK}>
            {grain.map((d, i) => (
              <path key={i} d={d} strokeWidth={2 + (i % 3)} />
            ))}
          </g>
          {/* arms: cast shadows first, then the ink */}
          <g opacity={0.38} transform="translate(10 34)">
            {arms.map((x) => armEl(x, true))}
          </g>
          {arms.map((x) => armEl(x, false))}
        </svg>
        <Glow x={KC[0]} y={KC[1]} r={420} o={0.3 * lightK} color={P.amberHi} />
        <Motes t={t} x={330} y={360} w={420} h={1300} n={30} seed={31} color={P.amberHi} size={4} />
        {/* the light stutters → everything sinks into the dark */}
        <div style={{ position: "absolute", left: -150, top: -150, width: 1380, height: 2220, background: P.ink, opacity: (1 - lightK) * 0.55 }} />
      </AbsoluteFill>

      {/* analogue interference creeping in (last ~0.6 s) */}
      {intf > 0.001 && (
        <>
          <StaticNoise f={f} seed={3} o={0.85 * Math.pow(intf, 1.8)} />
          <div style={{ position: "absolute", left: 0, top: barY, width: 1080, height: 170, background: `linear-gradient(${P.ink}00, ${P.ink}, ${P.ink}00)`, opacity: 0.6 * intf }} />
          <div style={{ position: "absolute", left: 0, top: barY2, width: 1080, height: 46, background: P.bone, opacity: 0.16 * intf }} />
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
            {Array.from({ length: 6 }, (_, i) => (
              <rect key={i} x={0} y={r1(rnd(f * 3.7 + i) * 1920)} width={1080} height={2 + rnd(f + i * 9) * 5} fill={P.bone} opacity={0.4 * intf * rnd(f * 1.9 + i)} />
            ))}
          </svg>
        </>
      )}
      {/* «حالا…» — the light swells up as the story starts */}
      <AbsoluteFill style={{ background: P.amberHi, mixBlendMode: "soft-light", opacity: 0.25 * eo(pr(t, tNow, 0.4)) * (1 - pr(t, tNow + 0.4, 0.8)) }} />
    </AbsoluteFill>
  );
};

// ================= «static» — the set dies into TV snow =================
export const SceneStatic: React.FC<SceneProps> = ({ lt, f, dur }) => {
  const flash = 1 - eo(clamp(lt / 0.12));
  const ghost = 1 - eio(clamp(lt / 0.3));
  const barY = 1700 - (lt / dur) * 2400;
  const offY = pr(lt, dur - 0.16, 0.1, eio); // CRT collapse → a line
  const offX = pr(lt, dur - 0.07, 0.07, eio); // → a dot
  return (
    <AbsoluteFill style={{ background: P.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 - offX * 0.985}, ${1 - offY * 0.994})`, transformOrigin: "540px 960px" }}>
        <StaticNoise f={f} seed={5} style={{ transform: `translateX(${boil(f, 3, 14, 1)}px)` }} />
        <StaticNoise f={f} seed={9} cell={2} k={2.4} o={0.22} />
        {/* the keyhole burns through for a moment */}
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, mixBlendMode: "soft-light", opacity: 0.7 * ghost }}>
          <circle cx={KC[0]} cy={KC[1]} r={KR} fill={P.bone} />
          <path d={KEY_SLOT} fill={P.bone} />
        </svg>
        <div style={{ position: "absolute", left: 0, top: barY, width: 1080, height: 300, background: `linear-gradient(${P.bone}00, ${P.bone}, ${P.bone}00)`, opacity: 0.22 }} />
        <div style={{ position: "absolute", left: 0, top: barY + 520, width: 1080, height: 120, background: `linear-gradient(${P.ink}00, ${P.ink}, ${P.ink}00)`, opacity: 0.45 }} />
        <AbsoluteFill style={{ background: P.bone, opacity: 0.55 * flash + 0.85 * offY }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
