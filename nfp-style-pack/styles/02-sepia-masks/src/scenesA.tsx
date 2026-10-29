import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import { Arm, Expr } from "./chars";
import { E, mouth, S, SC, W } from "./cues";
import { Fog, Motes } from "./fx";
import type { SceneProps } from "./frame";
import { boil, clamp, drift, eback, eio, eo, lerp, P, pr, rnd } from "./theme";
import { Cam, Cone, FogBand, mix, Patch, Rope, Stage, StageLight, V3 } from "./a-hall";
import { CState, FigureA, FigureC, handEls, MaskAt, MaskPlace } from "./a-figs";

// ================= group A · «maskA» (A's close-up) and «room» (the vast stage, C wakes) =================

// cue words, spelled exactly as in vo.json (escaped so the Persian letters can't drift)
const WD = {
  nemigi: "\u0646\u0645\u06CC\u200C\u06AF\u06CC", // نمی‌گی
  alo: "\u0627\u0644\u0648", // الو
  aslan: "\u0627\u0635\u0644\u0627\u064B", // اصلاً
  inja: "\u0627\u06CC\u0646\u062C\u0627\u06CC\u06CC", // اینجایی
  vel: "\u0648\u0644\u0634", // ولش
  baba: "\u0628\u0627\u0628\u0627", // بابا
  khab: "\u062E\u0648\u0627\u0628\u0634", // خوابش
  begam: "\u0628\u06AF\u0645", // بگم
};
const T_NEMIGI = W(1, WD.nemigi);
const T_ALO = W(1, WD.alo);
const T_ASLAN = W(1, WD.aslan);
const T_INJA = W(1, WD.inja);
const T_VEL = W(2, WD.vel);
const T_BABA = W(2, WD.baba);
const T_KHAB = W(2, WD.khab);
const T_C = S(3);
const T_BEGAM = W(3, WD.begam);

// =====================================================================================================
// maskA — a whip push from the wide, foggy stage into an extreme close-up of A's cracked egg mask
// =====================================================================================================
const PUSH = 0.36; // the push curve (arrives ≈0.28 s, overshoots a hair, settles at 0.36 s)
const pushEase = Easing.bezier(0.55, 0, 0.35, 1.18);
const MASK_M = 0.32; // mask height, metres
const FA = 1100; // focal length, px
const A_FEET: V3 = [0.45, 0, 8.4];
const A_HEAD: V3 = [0.45, 1.6, 8.32];
const WIDE = { x: 640, y: 792, size: 92, tilt: -3 };

type Head = { x: number; y: number; size: number; tilt: number; squash: number; expr: Expr };

/** A's head in the close-up (screen px, before the close-up camera) */
const headA = (t: number): Head => {
  const m = mouth("A", t);
  let x = 552 + drift(t, 3, 8, 1.1);
  let y = 688 + drift(t, 5, 6, 0.9) + m * 8;
  let size = 1330;
  let tilt = 6 + drift(t, 7, 1.3, 1.3) + m * 0.9;
  let squash = 0;
  // pleading lean on «نمی‌گی؟»
  const plead = pr(t, T_NEMIGI - 0.05, 0.3) * (1 - pr(t, T_ALO - 0.12, 0.12));
  size *= 1 + 0.03 * plead;
  tilt += 2.5 * plead;
  y += 10 * plead;
  // «الو؟» — the eyes pop: stretch, overshoot, settle; the head jerks back a touch
  const ta = t - (T_ALO - 0.04);
  if (ta > 0) {
    squash += -0.13 * Math.exp(-ta / 0.075) * Math.cos((ta * 2 * Math.PI) / 0.2);
    y -= 22 * Math.exp(-ta / 0.14) * Math.min(1, ta / 0.03);
    size *= 1 - 0.02 * Math.exp(-ta / 0.2) * Math.min(1, ta / 0.04);
  }
  // «اصلاً» — annoyed squint, the head tips forward toward the lens
  const lean = pr(t, T_ASLAN - 0.06, 0.28);
  tilt += 6 * lean;
  size *= 1 + 0.06 * lean;
  y += 30 * lean;
  squash += 0.035 * lean;
  // «اینجایی؟» — a small exasperated shake
  const ts = t - T_INJA;
  if (ts > 0 && ts < 0.7) x += 11 * Math.sin(ts * 2 * Math.PI * 3.1) * (1 - ts / 0.7);
  let expr: Expr = "worried";
  if (t >= T_ALO - 0.04) expr = "alarmed";
  if (t >= T_ASLAN - 0.05) expr = "annoyed";
  if ((t > T_ALO - 0.2 && t < T_ALO - 0.11) || (t > E(1) + 0.04 && t < E(1) + 0.12)) expr = "closed";
  return { x, y, size, tilt, squash, expr };
};

/** where the mask sits on screen, including the push from the wide shot */
const placeA = (t: number): Head => {
  const h = headA(Math.max(t, 0));
  if (t >= PUSH) return h;
  const p = pushEase(clamp(t / PUSH));
  const size = h.size * Math.exp(Math.log(WIDE.size / h.size) * (1 - p));
  const q = clamp((size - WIDE.size) / (h.size - WIDE.size), 0, 1.2);
  return { ...h, size, x: lerp(WIDE.x, h.x, q), y: lerp(WIDE.y, h.y, q), tilt: lerp(WIDE.tilt, h.tilt, clamp(p)), squash: h.squash * clamp(p) };
};
/** the 3D camera that sees A's head exactly at that placement (so the stage moves with the push) */
const camFromPlace = (pl: Head): Cam => {
  const D = (FA * MASK_M) / pl.size;
  return { pos: [A_HEAD[0] - ((pl.x - 540) * D) / FA, A_HEAD[1] - ((960 - pl.y) * D) / FA, A_HEAD[2] - D], yaw: 0, pitch: 0, f: FA };
};
const zoomSpeed = (t: number) => Math.abs(Math.log(placeA(t).size) - Math.log(placeA(t - 0.02).size)) / 0.02;

/** the close-up camera: handheld drift, a slow creep, a bump on «الو» */
const camClose = (t: number) => {
  const amp = pr(t, 0.22, 0.6);
  let z = 1 + 0.035 * eio(clamp((t - PUSH) / (SC.room - PUSH)));
  let x = drift(t, 21, 7, 1.6) * amp;
  let y = drift(t, 23, 6, 1.25) * amp;
  const r = drift(t, 25, 0.35, 1.05) * amp;
  const tb = t - (T_ALO - 0.03);
  if (tb > 0) {
    const k = (tb / 0.05) * Math.exp(1 - tb / 0.05);
    z += 0.03 * k;
    y -= 9 * k;
    x += 6 * Math.sin(tb * 60) * Math.exp(-tb / 0.08);
  }
  return `translate(${x}px, ${y}px) rotate(${r}deg) scale(${z})`;
};

const MA_CONES: Cone[] = [
  { top: [-2.2, 11, 9.8], bot: [0.42, 0, 8.4], rt: 0.3, rb: 0.85, o: 0.5 },
  { top: [-2.3, 11, 18.6], bot: [-2.1, 0, 18.2], rt: 0.2, rb: 1.0, o: 0.42 },
  { top: [2.3, 11, 24.2], bot: [2.1, 0, 23.8], rt: 0.2, rb: 1.0, o: 0.38 },
];
const MA_PATCHES: Patch[] = [
  { c: [0.5, 0.01, 8.35], rx: 1.0, ry: 0.85, o: 0.6, plane: "y" },
  { c: [-2.1, 0.01, 18.2], rx: 1.3, ry: 1.1, o: 0.45, plane: "y" },
  { c: [2.1, 0.01, 23.8], rx: 1.3, ry: 1.1, o: 0.4, plane: "y" },
];
const FOG_LIT = mix(P.sepia, P.amber, 0.25);
const MA_ROPES: Rope[] = [
  { x: 0.6, z: 13.5, y: 5.2, seed: 1 },
  { x: -1.6, z: 18.5, y: 4.6, seed: 2 },
  { x: -2.6, z: 24, y: 5.0, seed: 3 },
  { x: 2.4, z: 20.5, y: 6.0, seed: 4 },
];
const MA_FOG: FogBand[] = [
  { z: 31, y: 1.5, h: 3.2, w: 8, n: 6, o: 0.6, col: FOG_LIT, speed: 0.22, seed: 11 },
  { z: 22, y: 0.4, h: 0.9, w: 10, n: 6, o: 0.55, col: FOG_LIT, speed: 0.3, seed: 12 },
  { z: 17, y: 2.6, h: 0.9, w: 11, n: 5, o: 0.4, col: FOG_LIT, speed: 0.24, seed: 16 },
  { z: 18, y: 7, h: 6, w: 12, n: 4, o: 0.2, col: P.sepia, speed: 0.15, seed: 13 },
  { z: 12, y: 0.3, h: 1.0, w: 5, n: 5, o: 0.42, col: FOG_LIT, speed: 0.35, seed: 14 },
  { z: 7.0, y: 0.1, h: 0.5, w: 3.5, n: 4, o: 0.4, col: P.sepia, speed: 0.4, seed: 15 },
];

/** the blurred dark room behind the close-up: warm key from the upper-left, soft flats, bokeh, fog, motes */
const CloseBgA: React.FC<{ t: number }> = ({ t }) => {
  const bokeh = Array.from({ length: 9 }, (_, i) => {
    const r = (k: number) => rnd(900 + i * 13 + k);
    const x = 60 + r(1) * 960 + Math.sin(t * (0.25 + r(2) * 0.3) + i) * 30;
    const y = 80 + r(3) * 1500 - t * (6 + r(4) * 10);
    const s = 26 + r(5) * 60;
    const o = (0.08 + r(6) * 0.2) * (0.6 + 0.4 * Math.sin(t * (0.8 + r(7)) + i * 2));
    return <circle key={i} cx={x} cy={y} r={s} fill="url(#a-cb-bok)" opacity={o} />;
  });
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <linearGradient id="a-cb-base" x1="0" y1="0" x2="0.65" y2="1">
            <stop offset={0} stopColor={mix(P.fog, P.sepia, 0.45)} />
            <stop offset={0.42} stopColor={P.fog} />
            <stop offset={1} stopColor={P.ink} />
          </linearGradient>
          <linearGradient id="a-cb-dk" x1="0" y1="0" x2="1" y2="0">
            <stop offset={0} stopColor={P.ink} stopOpacity={0} />
            <stop offset={0.5} stopColor={P.ink} stopOpacity={0.75} />
            <stop offset={1} stopColor={P.ink} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="a-cb-lt" x1="0" y1="0" x2="1" y2="0">
            <stop offset={0} stopColor={P.amber} stopOpacity={0} />
            <stop offset={0.5} stopColor={mix(P.sepia, P.amber, 0.6)} stopOpacity={0.55} />
            <stop offset={1} stopColor={P.amber} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="a-cb-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset={0} stopColor="#fff" stopOpacity={1} />
            <stop offset={0.75} stopColor="#fff" stopOpacity={0.6} />
            <stop offset={1} stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <mask id="a-cb-m">
            <rect width={1080} height={1920} fill="url(#a-cb-fade)" />
          </mask>
        </defs>
        <rect width={1080} height={1920} fill="url(#a-cb-base)" />
        <g mask="url(#a-cb-m)">
          <rect x={95 + drift(t, 31, 6, 0.5)} y={-40} width={170} height={2000} fill="url(#a-cb-lt)" />
          <rect x={330 + drift(t, 32, 6, 0.5)} y={-40} width={110} height={2000} fill="url(#a-cb-lt)" opacity={0.55} />
          <rect x={-120} y={-40} width={260} height={2000} fill="url(#a-cb-dk)" />
          <rect x={830 + drift(t, 33, 8, 0.4)} y={-40} width={340} height={2000} fill="url(#a-cb-dk)" />
          <rect x={760 + drift(t, 34, 6, 0.5)} y={-40} width={120} height={2000} fill="url(#a-cb-lt)" opacity={0.35} />
        </g>
      </svg>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, mixBlendMode: "screen" }}>
        <defs>
          <radialGradient id="a-cb-key" cx={0.12} cy={0.1} r={0.75} gradientTransform="translate(0.12 0.1) scale(1 0.5625) translate(-0.12 -0.1)">
            <stop offset={0} stopColor={P.amberHi} stopOpacity={0.62} />
            <stop offset={0.35} stopColor={P.amber} stopOpacity={0.28} />
            <stop offset={1} stopColor={P.amber} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="a-cb-bok">
            <stop offset={0} stopColor={P.amberHi} stopOpacity={0.9} />
            <stop offset={0.7} stopColor={P.amberHi} stopOpacity={0.55} />
            <stop offset={1} stopColor={P.amberHi} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="a-cb-beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset={0} stopColor={P.amberHi} stopOpacity={0} />
            <stop offset={0.5} stopColor={P.amberHi} stopOpacity={0.22} />
            <stop offset={1} stopColor={P.amberHi} stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect width={1080} height={1920} fill="url(#a-cb-key)" />
        <g transform={`rotate(-24 120 0)`}>
          <rect x={20 + drift(t, 35, 10, 0.6)} y={-200} width={360} height={2400} fill="url(#a-cb-beam)" opacity={0.8 + 0.2 * Math.sin(t * 2.1)} />
        </g>
        {bokeh}
      </svg>
      <Fog t={t + 3} y={1150} h={420} o={0.3} color={P.sepia} seed={21} speed={22} />
      <Fog t={t + 7} y={180} h={380} o={0.22} color={FOG_LIT} seed={22} speed={14} />
      <Motes t={t} x={40} y={60} w={520} h={900} n={22} seed={23} size={4} />
    </>
  );
};

/** A's thin ink hand snaps up in front of the lens and waves "hello?" on «الو», then drops away */
const WaveHand: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const t0 = T_ALO - 0.12;
  if (t < t0 || t > T_ALO + 0.72) return null;
  const at = (tt: number) => {
    const up = pr(tt, t0, 0.14, eback);
    const down = pr(tt, T_ALO + 0.46, 0.22, Easing.in(Easing.cubic));
    const tw = tt - T_ALO;
    const env = clamp(tw / 0.06) * (1 - 0.45 * clamp((tw - 0.1) / 0.36));
    const wave = tw > 0 ? Math.sin(tw * 2 * Math.PI * 4.3) * env : 0;
    return {
      x: 918 + wave * 52 + down * 70,
      y: lerp(2500, 960, up) + down * 1500 + Math.abs(wave) * 12,
      a: -96 + wave * 16 + down * 25,
    };
  };
  const h = at(t), h0 = at(t - 0.02);
  const v = Math.hypot(h.x - h0.x, h.y - h0.y) / 0.02;
  const blur = 1.4 + clamp(v / 2400) * 8;
  const ox = 330, oy = 150;
  const hx = h.x - ox + boil(f, 301, 3), hy = h.y - oy + boil(f, 302, 3);
  return (
    <div style={{ position: "absolute", left: ox, top: oy, width: 1080 - ox + 60, height: 1920 - oy, overflow: "hidden", filter: `blur(${blur}px)` }}>
      <Arm pts={[[hx + 300, hy + 1150], [hx + 90, hy + 560], [hx, hy]]} angle={h.a} width={54} fingers={370} spread={13} curl={0.1} />
    </div>
  );
};

export const SceneMaskA: React.FC<SceneProps> = ({ t, f }) => {
  const pl = placeA(t);
  const cam = camFromPlace(placeA(Math.min(t, PUSH - 0.001)));
  const hallO = 1 - pr(t, 0.16, 0.13);
  const bgO = pr(t, 0.13, 0.14);
  const sp = zoomSpeed(t);
  const hallBlur = clamp((sp - 1.5) * 0.9, 0, 16) + 10 * pr(t, 0.18, 0.12);
  const maskBlur = t < PUSH ? clamp((sp - 4) * 0.7, 0, 9) : 0;
  const m = mouth("A", t);
  const toPlace = (h: Head): MaskPlace => ({ x: h.x, y: h.y, size: h.size, rot: 0, sy: 1, pv: 0.1 });
  const ghosts =
    t < PUSH && sp > 3
      ? [1, 2, 3, 4].map((k) => {
          const g = placeA(t - k * 0.012);
          return (
            <MaskAt
              key={k}
              kind="A"
              pl={toPlace(g)}
              f={f}
              expr={g.expr}
              mouth={m}
              tilt={g.tilt}
              squash={g.squash}
              opacity={clamp((sp - 3) / 10) * (0.42 - k * 0.08)}
              blur={maskBlur + 2}
            />
          );
        })
      : null;
  // neck under the chin (close-up only): the chin sits 0.4·size below the mask's pivot (50% 60%)
  const neckO = bgO;
  const tr = (pl.tilt * Math.PI) / 180;
  const ns = pl.size / 1330;
  const nb = { x: pl.x - Math.sin(tr) * pl.size * 0.4, y: pl.y + pl.size * 0.1 + Math.cos(tr) * pl.size * 0.4 - 40 * ns };
  return (
    <AbsoluteFill style={{ background: P.ink, overflow: "hidden" }}>
      {hallO > 0.01 && (
        <AbsoluteFill style={{ opacity: hallO, filter: hallBlur > 0.4 ? `blur(${hallBlur.toFixed(1)}px)` : undefined }}>
          <Stage cam={cam} t={t + 4} f={f} id="ma" layer="back" split={8.6} fog={MA_FOG} ropes={MA_ROPES} />
          <StageLight cam={cam} id="mab" cones={MA_CONES} patches={MA_PATCHES} door={1} blur={10} flick={0.95 + 0.05 * Math.sin(t * 9.1)} />
          <FigureA cam={cam} base={A_FEET} head={A_HEAD} f={f} />
          <Stage cam={cam} t={t + 4} f={f} id="maf" layer="front" split={8.6} fog={MA_FOG} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ transform: camClose(t), transformOrigin: "50% 45%" }}>
        {bgO > 0.01 && (
          <AbsoluteFill style={{ opacity: bgO, transform: `scale(${lerp(0.92, 1, bgO)})` }}>
            <CloseBgA t={t} />
          </AbsoluteFill>
        )}
        {neckO > 0.01 && (
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: neckO }}>
            <defs>
              <linearGradient id="a-neck" x1="0" y1="0" x2="0" y2="1">
                <stop offset={0} stopColor={P.ink} stopOpacity={0.95} />
                <stop offset={1} stopColor={P.ink} stopOpacity={0.35} />
              </linearGradient>
            </defs>
            <path
              d={`M ${nb.x - 44 * ns} ${nb.y} C ${nb.x - 48 * ns} ${nb.y + 220 * ns}, ${nb.x - 80 * ns} ${nb.y + 420 * ns}, ${nb.x - 170 * ns} ${nb.y + 700 * ns} L ${nb.x + 200 * ns} ${nb.y + 700 * ns} C ${nb.x + 95 * ns} ${nb.y + 420 * ns}, ${nb.x + 52 * ns} ${nb.y + 220 * ns}, ${nb.x + 48 * ns} ${nb.y} Z`}
              fill="url(#a-neck)"
            />
          </svg>
        )}
        {ghosts}
        <MaskAt kind="A" pl={toPlace(pl)} f={f} expr={pl.expr} mouth={m} tilt={pl.tilt} squash={pl.squash} blur={maskBlur} />
        {/* key light from the upper-left: warm the lit side, shade the far side */}
        <AbsoluteFill
          style={{
            opacity: bgO,
            background: "linear-gradient(150deg, rgba(0,0,0,0) 38%, rgba(58,39,22,0.55) 78%, rgba(18,11,7,0.7) 100%)",
            mixBlendMode: "multiply",
          }}
        />
        <AbsoluteFill
          style={{
            opacity: bgO * (0.82 + 0.1 * Math.sin(t * 11.3) * Math.sin(t * 4.1) + (rnd(Math.floor(f / 3)) > 0.88 ? -0.12 : 0)),
            background: `radial-gradient(ellipse 60% 40% at 18% 14%, rgba(243,199,122,0.32) 0%, rgba(201,139,58,0.12) 45%, rgba(0,0,0,0) 75%)`,
            mixBlendMode: "screen",
          }}
        />
        <WaveHand t={t} f={f} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =====================================================================================================
// room — the vast stage from low behind A; C asleep against a flat; B (off-screen) shrugs it off; C wakes
// =====================================================================================================
const FR = 1100;
const C_BASE: V3 = [3.42, 0, 10.42];
const T_WAKE = T_C - 0.6;
const pushRoom = (t: number) => Easing.inOut(Easing.quad)(clamp((t - T_WAKE) / (SC.table - T_WAKE + 0.7)));

const camRoom = (t: number): Cam => {
  const lt = t - SC.room;
  const dr = eio(clamp(lt / 3.3));
  const push = pushRoom(t);
  return {
    pos: [lerp(2.42, 2.22, dr) + push * 0.12 + drift(t, 41, 0.012, 1.3), lerp(0.55, 0.6, dr) + push * 0.06 + drift(t, 43, 0.008, 1.1), 6.9 + lt * 0.025 + push * 1.55],
    yaw: 0.1 + dr * 0.012 + push * 0.13 + drift(t, 45, 0.003, 0.9),
    pitch: -0.232 + drift(t, 47, 0.003, 0.8) + push * 0.05,
    f: FR,
  };
};

const ROOM_CONES: Cone[] = [
  { top: [3.15, 7.5, 10.15], bot: [3.45, 0, 10.2], rt: 0.14, rb: 0.75, o: 0.62 },
  { top: [0.3, 11, 19.5], bot: [0.1, 0, 19.0], rt: 0.2, rb: 1.0, o: 0.46 },
  { top: [-1.8, 11, 26.0], bot: [-1.6, 0, 25.5], rt: 0.2, rb: 0.95, o: 0.4 },
];
const ROOM_PATCHES: Patch[] = [
  { c: [3.4, 0.01, 10.1], rx: 0.95, ry: 0.8, o: 0.75, plane: "y" },
  { c: [0.1, 0.01, 19.0], rx: 1.3, ry: 1.1, o: 0.6, plane: "y" },
  { c: [-1.6, 0.01, 25.5], rx: 1.2, ry: 1.0, o: 0.5, plane: "y" },
  { c: [3.72, 0.95, 10.59], rx: 0.75, ry: 1.15, o: 0.85, plane: "z" },
];
const ROOM_ROPES: Rope[] = [
  { x: 1.2, z: 15, y: 3.2, seed: 5 },
  { x: 2.4, z: 20.5, y: 6.0, seed: 4 },
  { x: -0.4, z: 22, y: 4.2, seed: 6 },
];
const ROOM_FOG: FogBand[] = [
  { z: 31, y: 1.5, h: 3.2, w: 8, n: 6, o: 0.6, col: FOG_LIT, speed: 0.22, seed: 1 },
  { z: 24, y: 0.35, h: 0.9, w: 10, n: 6, o: 0.6, col: FOG_LIT, speed: 0.3, seed: 2 },
  { z: 19, y: 2.7, h: 0.9, w: 11, n: 5, o: 0.42, col: FOG_LIT, speed: 0.24, seed: 7 },
  { z: 20, y: 6.5, h: 6, w: 12, n: 4, o: 0.3, col: FOG_LIT, speed: 0.15, seed: 3 },
  { z: 14, y: 0.25, h: 0.7, w: 8, n: 6, o: 0.5, col: FOG_LIT, speed: 0.35, seed: 4 },
  { z: 12.5, y: 4.5, h: 4, w: 9, n: 3, o: 0.16, col: FOG_LIT, speed: 0.2, seed: 6 },
  { z: 9.2, y: 0.1, h: 0.4, w: 5, n: 5, o: 0.32, col: P.sepia, speed: 0.4, seed: 5 },
];

const cState = (t: number, f: number): CState => {
  const breath = Math.sin(((t - SC.room) * 2 * Math.PI) / 3.1) * 1.4;
  // «خوابش…» — he nods off a little deeper: the head drops, catches, settles
  const tn = t - (T_KHAB - 0.02);
  const nod = tn <= 0 ? 0 : tn < 0.18 ? eo(tn / 0.18) : 1 - 0.5 * eio(clamp((tn - 0.18) / 0.4));
  const sag = nod * (1 - pr(t, T_WAKE - 0.1, 0.2));
  // creaky head lift: slow rise, catch, jerk, settle
  const l1 = pr(t, T_WAKE, 0.24, eio) * 0.38;
  const l2 = pr(t, T_WAKE + 0.29, 0.07, eo) * 0.34;
  const l3 = pr(t, T_WAKE + 0.37, 0.3, eo) * 0.28;
  const tremor = t > T_WAKE + 0.2 && t < T_WAKE + 0.3 ? boil(f, 77, 0.02) : 0;
  const lift = clamp(l1 + l2 + l3 + tremor);
  const shrug = pr(t, T_BEGAM - 0.03, 0.14, eo) * (1 - pr(t, T_BEGAM + 0.42, 0.3, eio));
  const open = t >= T_WAKE + 0.36;
  // ember ignition: catches fast, flares a touch, stutters once, settles at ~0.6 with a slow pulse
  const to = t - (T_WAKE + 0.36);
  const ign = to <= 0 ? 0 : clamp(to / 0.12) * (0.6 + 0.2 * Math.exp(-Math.max(0, to - 0.12) / 0.25));
  const stutter = t > T_WAKE + 0.45 && t < T_WAKE + 0.49 ? 0.4 : 1;
  const glow = open ? ign * stutter * (0.93 + 0.07 * Math.sin(t * 9)) : 0;
  return { lift, breath, shrug, sag, expr: open ? "awake" : "closed", glow, mouth: mouth("C", t) };
};

/** A's huge out-of-focus hand in the foreground, reaching toward C */
const RoomHand: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const lt = t - SC.room;
  const give = pr(t, T_VEL + 0.2, 1.3, eio) * 0.8 + pr(t, T_BABA + 0.2, 0.8, eio) * 0.2;
  const flinch = pr(t, T_WAKE + 0.3, 0.09, eo) * (1 - 0.55 * pr(t, T_WAKE + 0.65, 0.7, eio));
  const push = pushRoom(t);
  const br = Math.sin((lt * 2 * Math.PI) / 2.6);
  const hx = 372 - give * 46 - flinch * 70 - push * 300 + br * 4;
  const hy = 1112 + give * 60 + br * 8 + push * 140 - flinch * 26;
  const ang = -44 + give * 20 - flinch * 14 + br * 1.5;
  const tw = [0, 1, 2, 3].map((i) => Math.sin(t * (1.7 + i * 0.6) + i * 2) * 3 + boil(f, 700 + i, 1.5));
  const bx = -80, by = 820, bw = 760, bh = 760;
  const sc = 1 + push * 0.25;
  return (
    <div style={{ position: "absolute", left: bx, top: by, width: bw, height: bh, overflow: "hidden", filter: "blur(5px)" }}>
      <svg width={bw} height={bh} viewBox={`${bx} ${by} ${bw} ${bh}`} style={{ display: "block" }}>
        <g transform={`translate(${hx} ${hy}) scale(${sc}) translate(${-hx} ${-hy})`}>
          {handEls([[-160, hy + 230], [hx - 200, hy + 95], [hx, hy]], ang, 48, 235, 15 + flinch * 7, 0.2 + give * 0.4 - flinch * 0.2, tw, P.ink)}
        </g>
      </svg>
    </div>
  );
};

export const SceneRoom: React.FC<SceneProps> = ({ t, f }) => {
  const cam = camRoom(t);
  const st = cState(t, f);
  const roll = drift(t, 51, 0.25, 0.7);
  return (
    <AbsoluteFill style={{ background: P.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `rotate(${roll}deg) scale(1.025)` }}>
        <Stage cam={cam} t={t} f={f} id="rm" layer="back" split={10.3} fog={ROOM_FOG} ropes={ROOM_ROPES} />
        <StageLight cam={cam} id="rmb" cones={ROOM_CONES} patches={ROOM_PATCHES} door={1} blur={9} flick={0.94 + 0.06 * Math.sin(t * 7.3) * Math.sin(t * 3.1)} />
        <FigureC cam={cam} base={C_BASE} f={f} st={st} />
        <Stage cam={cam} t={t} f={f} id="rmf" layer="front" split={10.3} fog={ROOM_FOG} />
        <Motes t={t} x={600} y={260} w={330} h={760} n={18} seed={31} size={3.5} />
        <Motes t={t + 9} x={330} y={180} w={260} h={640} n={12} seed={32} size={2.5} />
        <RoomHand t={t} f={f} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
