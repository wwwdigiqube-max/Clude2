import React from "react";
import { AbsoluteFill } from "remotion";
import { Expr, Mask } from "./chars";
import { E, mouth, S, SC, W, WE } from "./cues";
import { Fog, Glow, Motes } from "./fx";
import type { SceneProps } from "./frame";
import { boil, clamp, drift, eio, eo, lerp, P, pr } from "./theme";
import { Beam, SceneTable } from "./b-table";
import { hit, rgba, track, wob } from "./b-util";

// ================= group B: «table» (b-table.tsx), «twoMasks», «black1» =================
export { SceneTable };

// ---------- SCENE «twoMasks» — A: «بُردن!»  B: «نباختن.» ----------
export const SceneTwoMasks: React.FC<SceneProps> = ({ t, lt, f, dur }) => {
  const tA = W(6, "بُردن"); // A's word
  const tB = S(7); // B's line
  const tSmirk = S(7) + 0.8; // B's voice has died out → the smirk
  const pan = eio(clamp(lt / dur));
  const fade = pr(t, E(7) - 0.42, 0.55, eio);

  // camera: slides from A to B, small hit on A's shout
  const camX = lerp(82, -82, pan) + drift(t, 2, 5);
  const camY = lerp(8, -8, pan) + drift(t, 5, 4);
  const camS = 1.02 + 0.05 * pan + 0.02 * hit(t, tA - 0.03, 0.05, 0.5);

  // A: anticipation squash → stretch-pop forward on the word → settle; glances at B; annoyed by B's answer
  const ant = pr(t, SC.twoMasks, 0.05) * (1 - pr(t, tA - 0.04, 0.05));
  const popA = hit(t, tA - 0.03, 0.08, 0.75);
  const squashA = 0.05 * ant - 0.1 * wob(t, tA - 0.03, 2.8, 5);
  const tiltA = track(t, -3, [[tA - 0.03, 3, 0.14], [E(6) + 0.08, 11, 0.32], [tB + 0.36, 4, 0.35]]) + boil(f, 1, 0.5);
  const exprA: Expr = t < E(6) + 0.05 ? "alarmed" : t < tB + 0.36 ? "worried" : "annoyed";
  const dxA = track(t, 0, [[tA - 0.03, 14, 0.12], [E(6) + 0.08, 22, 0.3], [tB + 0.36, 6, 0.4]]);
  const dyA = -popA * 18 + Math.sin(t * 2.2) * 3;

  // B: looks at A in the pause (with one bored blink), turns front and says it flatly, then the smirk
  const tiltB = track(t, 4, [[E(6) + 0.24, -10, 0.34], [tB - 0.14, -2, 0.28], [tSmirk, -6, 0.3]]) + boil(f, 2, 0.5);
  const blinkB = t > E(6) + 0.4 && t < E(6) + 0.4 + 0.17;
  const exprB: Expr = t > tSmirk ? "smirk" : blinkB ? "closed" : "bored";
  const dxB = track(t, 0, [[E(6) + 0.24, -16, 0.34], [tB - 0.14, -4, 0.3]]);
  const dyB = track(t, 0, [[tB, 7, 0.5, eio], [tSmirk, -5, 0.3]]) + Math.sin(t * 1.7 + 1) * 3;

  const lit = 1 - 0.4 * fade;
  const size = 700;
  const mw = (size * 200) / 260;
  const bulbTop = lerp(250, 175, pan);

  // parallax: the dark bulb and the fog behind slide less than the faces, the fog in front slides more
  const layer = (depth: number, extra?: React.CSSProperties): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    transform: `translate(${camX * depth}px, ${camY * depth}px) scale(${1 + (camS - 1) * depth})`,
    transformOrigin: "540px 840px",
    ...extra,
  });

  return (
    <AbsoluteFill style={{ background: P.ink, overflow: "hidden" }}>
      <div style={layer(0.45)}>
        {/* warm light from above, a huge dark bulb looming behind them */}
        <div
          style={{
            position: "absolute",
            left: -400,
            top: -300,
            width: 1880,
            height: 2520,
            background: `radial-gradient(ellipse 900px 560px at 940px 420px, ${rgba(P.amberHi, 0.75)} 0%, ${rgba(P.amber, 0.7)} 30%, ${rgba(P.sepia, 0.9)} 60%, ${P.fog} 100%)`,
          }}
        />
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <defs>
            <radialGradient id="b-bulb" cx="0.5" cy="0.3" r="0.7">
              <stop offset="0" stopColor={P.fog} />
              <stop offset="0.55" stopColor={P.ink} />
              <stop offset="1" stopColor={P.ink} />
            </radialGradient>
            <linearGradient id="b-bulbRim" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={P.amberHi} stopOpacity={0.9} />
              <stop offset="0.12" stopColor={P.amber} stopOpacity={0.35} />
              <stop offset="0.3" stopColor={P.amber} stopOpacity={0} />
            </linearGradient>
          </defs>
          <ellipse cx={540 + boil(f, 5, 1)} cy={bulbTop + 1300} rx={1150} ry={1300} fill="url(#b-bulb)" />
          <ellipse cx={540} cy={bulbTop + 1300} rx={1150} ry={1300} fill="none" stroke="url(#b-bulbRim)" strokeWidth={7} />
        </svg>
        <Fog t={t} y={380} h={600} o={0.3} color={P.sepia} seed={21} speed={22} />
        {/* warm light falling from above */}
        <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: lit }}>
          <Beam a={[430, -200]} b={[300, 1300]} w1={90} w2={420} o={0.16} id="tm1" />
          <Beam a={[650, -200]} b={[800, 1300]} w1={90} w2={420} o={0.13} id="tm2" />
        </div>
        <Motes t={t} x={-200} y={200} w={1480} h={1100} n={22} seed={23} size={3.5} />
        {/* warm pool behind the faces so the bone reads */}
        <Glow x={540} y={760} r={620} o={0.28 * lit} color={P.amber} />
      </div>
      <div style={layer(1)}>
        {/* the faces throw soft shadows onto the dark behind them */}
        {[
          [272 + dxA, 840 + dyA],
          [812 + dxB, 846 + dyB],
        ].map(([x, y], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - mw / 2 + 30,
              top: y - size / 2 + 44,
              width: mw,
              height: size,
              borderRadius: "50%",
              background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${rgba(P.ink, 0.6)} 0%, ${rgba(P.ink, 0.45)} 62%, ${rgba(P.ink, 0)} 100%)`,
            }}
          />
        ))}
        {/* soft contact shadows */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 980,
            width: 1080,
            height: 420,
            background: `radial-gradient(ellipse 520px 160px at 540px 140px, ${rgba(P.ink, 0.65)} 0%, ${rgba(P.ink, 0)} 100%)`,
          }}
        />
        <div style={{ position: "absolute", left: 272 - mw / 2 + dxA, top: 840 - size / 2 + dyA, width: mw, height: size, transform: `scale(${1 + 0.06 * popA})`, transformOrigin: "50% 60%" }}>
          <Mask kind="A" size={size} f={f} expr={exprA} mouth={mouth("A", t)} tilt={tiltA} squash={squashA} lit={lit} />
        </div>
        <div style={{ position: "absolute", left: 812 - mw / 2 + dxB, top: 846 - size / 2 + dyB, width: mw, height: size }}>
          <Mask kind="B" size={size} f={f} expr={exprB} mouth={mouth("B", t)} tilt={tiltB} lit={lit} />
        </div>
      </div>
      <div style={layer(1.35)}>
        <Fog t={t} y={1150} h={300} o={0.35} color={P.fog} seed={27} speed={16} />
      </div>
      {/* warm key light from the upper left, the faces fall off into shade below */}
      <div
        style={layer(1, {
          inset: undefined,
          left: -400,
          top: -300,
          width: 1880,
          height: 2520,
          transformOrigin: "940px 1140px",
          background: `radial-gradient(ellipse 760px 900px at 620px 760px, ${rgba(P.amberHi, 0.55)} 0%, ${rgba(P.amberHi, 0)} 70%)`,
          mixBlendMode: "soft-light",
        })}
      />
      <div
        style={layer(1, {
          inset: undefined,
          left: -400,
          top: -300,
          width: 1880,
          height: 2520,
          transformOrigin: "940px 1140px",
          background: `linear-gradient(180deg, ${rgba(P.fog, 0)} 0%, ${rgba(P.fog, 0)} 46%, ${rgba(P.sepia, 0.55)} 62%, ${rgba(P.fog, 0.9)} 80%)`,
          mixBlendMode: "multiply",
        })}
      />
      {/* the light starts to go */}
      <AbsoluteFill style={{ background: P.ink, opacity: 0.62 * fade }} />
    </AbsoluteFill>
  );
};

// ---------- SCENE «black1» — C in the dark: «فرقی نمی‌کنه.» ----------
// C's long mask (same proportions as chars.tsx, drawn here only as a faint rim) — eyes and mouth positions follow it
const C_EGG = [100, 2, 152, 2, 176, 72, 176, 142, 176, 214, 140, 258, 100, 258, 60, 258, 24, 214, 24, 142, 24, 72, 48, 2, 100, 2];
export const SceneBlack1: React.FC<SceneProps> = ({ t, lt, f, dur }) => {
  const open = pr(t, W(8, "فرقی") + 0.1, 0.44, eio);
  const narrow = pr(t, WE(8, "فرقی") + 0.14, 0.22, eo);
  const close = pr(t, E(8) - 0.1, 0.14, eio);
  const vis = open * (1 - close);
  const lid = clamp(open * (1 - 0.64 * narrow) * (1 - close));
  const cx = 540, cy = 650, k = 300 / 260;
  const X = (vx: number) => cx + (vx - 100) * k, Y = (vy: number) => cy + (vy - 130) * k;
  const a = C_EGG.map((v, i) => (i % 2 === 0 ? X(v) : Y(v)) + boil(f, 900 + i, 0.8));
  const egg = `M ${a[0]} ${a[1]} C ${a[2]} ${a[3]} ${a[4]} ${a[5]} ${a[6]} ${a[7]} C ${a[8]} ${a[9]} ${a[10]} ${a[11]} ${a[12]} ${a[13]} C ${a[14]} ${a[15]} ${a[16]} ${a[17]} ${a[18]} ${a[19]} C ${a[20]} ${a[21]} ${a[22]} ${a[23]} ${a[24]} ${a[25]} Z`;
  const ey = Y(104);
  const m = mouth("C", t);
  const s = 1 + 0.05 * clamp(lt / dur);
  const dy = drift(t, 8, 3);
  return (
    <AbsoluteFill style={{ background: P.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(0px, ${dy}px) scale(${s})`, transformOrigin: `${cx}px ${ey}px` }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.22 }}>
          <Motes t={t} x={200} y={300} w={680} h={800} n={7} seed={41} size={2.5} color={P.amber} />
        </div>
        <Glow x={cx} y={ey + 20} r={190} o={0.13 * vis} color={P.ember} />
        {[X(74), X(126)].map((x, i) => (
          <Glow key={i} x={x} y={ey} r={48} o={0.5 * vis * (0.85 + 0.3 * m)} color={P.ember} />
        ))}
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <defs>
            <linearGradient id="b-cRim" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={P.amber} stopOpacity={1} />
              <stop offset="0.45" stopColor={P.amber} stopOpacity={0.25} />
              <stop offset="0.7" stopColor={P.amber} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={egg} fill="none" stroke="url(#b-cRim)" strokeWidth={3} opacity={0.2 * vis} />
          {[X(74), X(126)].map((x, i) => {
            const ry = 12 * lid;
            const ang = (i === 0 ? 1 : -1) * 15 * narrow;
            return (
              <g key={i} transform={`rotate(${ang} ${x} ${ey})`} opacity={vis > 0.001 ? 1 : 0}>
                <ellipse cx={x} cy={ey} rx={13} ry={Math.max(0.6, ry)} fill={P.ember} />
                <ellipse cx={x} cy={ey} rx={6} ry={Math.max(0.4, ry * 0.5)} fill={P.emberHot} />
              </g>
            );
          })}
          {/* the stitched mouth glows faintly with every syllable */}
          <path
            d={`M ${X(64)} ${Y(192)} Q ${cx} ${Y(192) - 9 * m} ${X(136)} ${Y(192)} Q ${cx} ${Y(192) + 9 * m} ${X(64)} ${Y(192)} Z`}
            fill={P.ember}
            opacity={0.38 * m * vis}
          />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
