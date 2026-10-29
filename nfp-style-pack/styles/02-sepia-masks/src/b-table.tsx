import React from "react";
import { AbsoluteFill } from "remotion";
import { Arm, Expr, Mask } from "./chars";
import { SC, W } from "./cues";
import { Fog, Glow, Motes } from "./fx";
import type { SceneProps } from "./frame";
import { boil, clamp, drift, eback, eio, eo, lerp, P, pr, rnd } from "./theme";
import { hit, lerpPt, poly, Pt, qpt, rgba, smoothClosed, track, wob } from "./b-util";

// ================= SCENE «table» — two players at the hourglass table under the hanging CLOCK-EYE =================
// C (off screen): «هر دوتون حرف حساب زدین؛ منم دیگه حرفی نداشتم. … خب، کدومش؟ بُردن… یا نباختن؟»

const FLOOR = 1255; // wall/floor line (feet, benches, table foot)
const TOP = 1080; // table top surface
const EX = 540, EY = 560; // clock-eye centre (scene space)
const PIVOT: Pt = [540, -220]; // the eye hangs from here (pendulum pivot)

// every time comes from the dialogue
const K = {
  har: W(4, "هر"),
  dotun: W(4, "دوتون"),
  harf: W(4, "حرف"),
  hesab: W(4, "حساب"),
  zadin: W(4, "زدین"),
  manam: W(4, "منم"),
  nadashtam: W(4, "نداشتم"),
  khob: W(5, "خب"),
  kodum: W(5, "کدومش"),
  bordan: W(5, "بُردن"),
  ya: W(5, "یا"),
  nabakhtan: W(5, "نباختن"),
};

// ---------- clock hands: one jumping tick per second → whirl on «کدومش» → point at A on «بُردن» → at B on «نباختن» ----------
const tickA = (t: number) => {
  const s = Math.floor(t);
  const j = eback(clamp((t - s) / 0.11));
  return (s - 1 + j) * 30 + 40; // minute hand: 30° per second
};
const handAngles = (t: number) => {
  const m0 = tickA(K.kodum), h0 = m0 / 12 + 200;
  if (t < K.kodum) return { m: tickA(t), h: tickA(t) / 12 + 200, speed: 0 };
  const sx = (u: number) => 1 - Math.pow(1 - clamp(u), 2.2); // whirl: fastest at the start, slowing down
  const spinDur = K.bordan - K.kodum;
  const spinM = (tt: number) => m0 + 360 * 3.4 * sx((tt - K.kodum) / spinDur);
  const spinH = (tt: number) => h0 + 360 * 0.85 * sx((tt - K.kodum) / spinDur);
  if (t < K.bordan) {
    const speed = (spinM(t + 0.02) - spinM(t)) / 0.02;
    return { m: spinM(t), h: spinH(t), speed };
  }
  // lock both hands onto 9 o'clock (A, on the left), then swing to 3 o'clock (B)
  const next = (from: number, target: number) => from + ((((target - from) % 360) + 360) % 360);
  const mA = next(spinM(K.bordan), 270), hA = next(spinH(K.bordan), 270);
  const pA = eback(clamp((t - K.bordan) / 0.16));
  if (t < K.nabakhtan) return { m: lerp(spinM(K.bordan), mA, pA), h: lerp(spinH(K.bordan), hA, pA), speed: 0 };
  const pB = eback(clamp((t - K.nabakhtan) / 0.2));
  return { m: lerp(mA, mA + 180, pB), h: lerp(hA, hA + 180, pB), speed: 0 };
};

const blink = (t: number, a: number, close = 0.07, hold = 0.05, open = 0.14) =>
  t < a ? 0 : t < a + close ? eo((t - a) / close) : t < a + close + hold ? 1 : 1 - eio(clamp((t - a - close - hold) / open));

const rot = (p: Pt, c: Pt, deg: number): Pt => {
  const a = (deg * Math.PI) / 180, dx = p[0] - c[0], dy = p[1] - c[1];
  return [c[0] + dx * Math.cos(a) - dy * Math.sin(a), c[1] + dx * Math.sin(a) + dy * Math.cos(a)];
};

// ---------- soft light beam (nested slices, no blur filter) ----------
export const Beam: React.FC<{ a: Pt; b: Pt; w1: number; w2: number; o: number; id: string; color?: string; slices?: number }> = ({
  a,
  b,
  w1,
  w2,
  o,
  id,
  color = P.amberHi,
  slices = 6,
}) => {
  if (o <= 0.003) return null;
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
  const nx = -dy / L, ny = dx / L;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, mixBlendMode: "screen", pointerEvents: "none", overflow: "visible" }}>
      <defs>
        <linearGradient id={`b-beam-${id}`} gradientUnits="userSpaceOnUse" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}>
          <stop offset="0" stopColor={color} stopOpacity={1} />
          <stop offset="0.6" stopColor={color} stopOpacity={0.6} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {Array.from({ length: slices }, (_, k) => {
        const s = 1 - k / slices;
        const pts: Pt[] = [
          [a[0] + (nx * w1 * s) / 2, a[1] + (ny * w1 * s) / 2],
          [b[0] + (nx * w2 * s) / 2, b[1] + (ny * w2 * s) / 2],
          [b[0] - (nx * w2 * s) / 2, b[1] - (ny * w2 * s) / 2],
          [a[0] - (nx * w1 * s) / 2, a[1] - (ny * w1 * s) / 2],
        ];
        return <polygon key={k} points={poly(pts)} fill={`url(#b-beam-${id})`} opacity={(o / slices) * 1.7} />;
      })}
    </svg>
  );
};

// ---------- background: lit wall, tall lancet windows, stepped columns ----------
const lancet = (cx: number, top: number, w: number, bottom: number) =>
  `M ${cx - w / 2} ${bottom} L ${cx - w / 2} ${top + w * 0.95} Q ${cx - w / 2} ${top + w * 0.18} ${cx} ${top} Q ${cx + w / 2} ${top + w * 0.18} ${cx + w / 2} ${top + w * 0.95} L ${cx + w / 2} ${bottom} Z`;
const WINDOWS: [number, number, number, number][] = [
  [118, 300, 74, 900],
  [236, 400, 56, 900],
  [962, 300, 74, 900],
  [844, 400, 56, 900],
];

const Backdrop: React.FC<{ t: number; f: number; lamp: number }> = ({ t, f, lamp }) => {
  const col = (side: 1 | -1) => {
    const m = (x: number) => (side === 1 ? x : 1080 - x);
    const pts: Pt[] = [
      [-60, -300],
      [100, -300],
      [100, 130],
      [84, 130],
      [84, 186],
      [68, 186],
      [68, 1030],
      [86, 1030],
      [86, 1100],
      [106, 1100],
      [106, 1170],
      [130, 1170],
      [130, FLOOR + 140],
      [-60, FLOOR + 140],
    ];
    return poly(pts.map(([x, y]) => [m(x) + boil(f, x * 0.1 + y * 0.01 + side, 0.8), y]));
  };
  return (
    <>
      {/* the wall, lit by a big lamp behind the shaft */}
      <div
        style={{
          position: "absolute",
          left: -200,
          top: -200,
          width: 1480,
          height: 2320,
          background: `radial-gradient(ellipse 600px 760px at 740px 900px, ${rgba(P.amberHi, 0.9 * lamp)} 0%, ${rgba(P.amber, 0.92)} 24%, ${rgba(P.sepia, 1)} 52%, ${P.fog} 78%, ${P.ink} 100%)`,
        }}
      />
      {/* light spilling from the windows onto the wall */}
      {WINDOWS.map(([cx, top, w, bottom], i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: cx - w * 2.4,
            top: top - 80,
            width: w * 4.8,
            height: bottom - top + 170,
            background: `radial-gradient(ellipse 50% 50% at 50% 46%, ${rgba(P.amber, 0.26)} 0%, ${rgba(P.amber, 0)} 100%)`,
          }}
        />
      ))}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <linearGradient id="b-win" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={P.amberHi} stopOpacity={0.95} />
            <stop offset="0.5" stopColor={P.amber} stopOpacity={0.75} />
            <stop offset="1" stopColor={P.sepia} stopOpacity={0.4} />
          </linearGradient>
          <linearGradient id="b-colEdge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={P.amber} stopOpacity={0} />
            <stop offset="0.5" stopColor={P.amber} stopOpacity={0.55} />
            <stop offset="1" stopColor={P.amber} stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="b-wallFoot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={P.ink} stopOpacity={0} />
            <stop offset="1" stopColor={P.ink} stopOpacity={0.5} />
          </linearGradient>
        </defs>
        {WINDOWS.map(([cx, top, w, bottom], i) => (
          <g key={i} opacity={(i % 2 ? 0.52 : 0.66) * (0.9 + 0.1 * Math.sin(t * 2.1 + i))}>
            <path d={lancet(cx, top - 10, w + 20, bottom + 12)} fill={rgba(P.ink, 0.6)} />
            <path d={lancet(cx, top, w, bottom)} fill="url(#b-win)" />
            <line x1={cx} y1={top + w * 0.55} x2={cx} y2={bottom} stroke={P.ink} strokeWidth={5} />
            {[0.38, 0.66].map((k) => (
              <line key={k} x1={cx - w / 2} x2={cx + w / 2} y1={lerp(top, bottom, k)} y2={lerp(top, bottom, k)} stroke={P.ink} strokeWidth={4} />
            ))}
          </g>
        ))}
        {/* soft shadow where the wall meets the floor */}
        <rect x={-100} y={FLOOR - 120} width={1280} height={124} fill="url(#b-wallFoot)" />
        <rect x={-100} y={FLOOR + 3} width={1280} height={140} fill={P.ink} opacity={0.5} />
        {/* stepped columns framing the stage */}
        {([1, -1] as const).map((s) => (
          <g key={s}>
            <polygon points={col(s)} fill={P.ink} opacity={0.94} />
            <line x1={s === 1 ? 69 : 1011} y1={190} x2={s === 1 ? 69 : 1011} y2={1028} stroke="url(#b-colEdge)" strokeWidth={3} />
          </g>
        ))}
      </svg>
    </>
  );
};

// ---------- floor: perspective seams, lamp pool, long shadows toward the camera ----------
const Floor: React.FC<{ f: number; lamp: number }> = ({ f, lamp }) => {
  const VP: Pt = [540, 640];
  const yB = 2150;
  const seams = Array.from({ length: 17 }, (_, i) => {
    const x0 = 540 + (i - 8) * 78;
    const x1 = VP[0] + ((x0 - VP[0]) * (yB - VP[1])) / (FLOOR - VP[1]);
    return <line key={i} x1={x0} y1={FLOOR} x2={x1} y2={yB} stroke={P.ink} strokeWidth={2} opacity={0.22} />;
  });
  const rows = [1290, 1345, 1430, 1560, 1760].map((y, i) => <line key={i} x1={-100} x2={1180} y1={y} y2={y} stroke={P.ink} strokeWidth={2} opacity={0.14} />);
  // the hourglass table throws its own hourglass shadow toward us
  const sh: Pt[] = [
    [452, FLOOR],
    [628, FLOOR],
    [556, 1478],
    [812, 1730],
    [826, 1790],
    [254, 1790],
    [268, 1730],
    [524, 1478],
  ];
  const bj = sh.map(([x, y], i): Pt => [x + boil(f, 400 + i, 1.5), y + boil(f, 420 + i, 1.2)]);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: -120,
          top: FLOOR - 2,
          width: 1320,
          height: 1100,
          background: `radial-gradient(ellipse 520px 170px at 660px 40px, ${rgba(P.amber, 0.5 * lamp)} 0%, ${rgba(P.amber, 0)} 100%), linear-gradient(180deg, ${P.floor} 0%, ${P.fog} 32%, ${P.ink} 72%)`,
        }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id="b-shadow" gradientUnits="userSpaceOnUse" x1="0" y1={FLOOR} x2="0" y2={1800}>
            <stop offset="0" stopColor={P.ink} stopOpacity={0.92} />
            <stop offset="0.6" stopColor={P.ink} stopOpacity={0.7} />
            <stop offset="1" stopColor={P.ink} stopOpacity={0.15} />
          </linearGradient>
        </defs>
        {seams}
        {rows}
        <line x1={-100} x2={1180} y1={FLOOR} y2={FLOOR} stroke={P.ink} strokeWidth={4} opacity={0.6} />
        {/* players' long shadows (fanning out from the lamp) */}
        <polygon points={poly([[160, FLOOR], [300, FLOOR], [150, 1700], [-120, 1700]])} fill="url(#b-shadow)" opacity={0.55} />
        <polygon points={poly([[780, FLOOR], [920, FLOOR], [1200, 1700], [930, 1700]])} fill="url(#b-shadow)" opacity={0.55} />
        <polygon points={poly(bj)} fill="url(#b-shadow)" />
      </svg>
    </>
  );
};

// ---------- the shaft of shadow ----------
const Shaft: React.FC<{ f: number }> = ({ f }) => {
  const b = (s: number) => boil(f, 500 + s, 1.4);
  const core: Pt[] = [
    [372 + b(1), -400],
    [708 + b(2), -400],
    [604 + b(3), TOP],
    [476 + b(4), TOP],
  ];
  const soft: Pt[] = [
    [340, -400],
    [740, -400],
    [628, TOP],
    [452, TOP],
  ];
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id="b-shaft" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={P.fog} stopOpacity={1} />
          <stop offset="0.18" stopColor={P.ink} stopOpacity={1} />
          <stop offset="0.82" stopColor={P.ink} stopOpacity={1} />
          <stop offset="1" stopColor={P.fog} stopOpacity={1} />
        </linearGradient>
      </defs>
      <polygon points={poly(soft)} fill={P.ink} opacity={0.35} />
      <polygon points={poly(core)} fill="url(#b-shaft)" opacity={0.96} />
    </svg>
  );
};

// ---------- the CLOCK-EYE ----------
const ClockEye: React.FC<{
  t: number;
  f: number;
  open: number;
  wide: number;
  gx: number;
  gy: number;
  sway: number;
  glow: number;
}> = ({ t, f, open, wide, gx, gy, sway, glow }) => {
  const x = EX, y = EY;
  const w = 150 * (1 + 0.1 * wide), h = 74 * (1 + 0.42 * wide);
  const R = 56;
  const bl = (s: number, a = 1.3) => boil(f, 600 + s, a);
  const xl = x - w + bl(1), yl = y + bl(2), xr = x + w + bl(3), yr = y + bl(4);
  const cu = y - 2 * h + bl(5), cd = y + 2 * h + bl(6);
  const almond = `M ${xl} ${yl} Q ${x} ${cu} ${xr} ${yr} Q ${x} ${cd} ${xl} ${yl} Z`;
  const uU = lerp(-0.16, 1, open), uL = lerp(0.16, 1, open);
  const lidU = `M ${xl} ${yl} Q ${x} ${cu} ${xr} ${yr} Q ${x} ${y - 2 * h * uU} ${xl} ${yl} Z`;
  const lidL = `M ${xl} ${yl} Q ${x} ${cd} ${xr} ${yr} Q ${x} ${y + 2 * h * uL} ${xl} ${yl} Z`;
  const ix = x + gx * 54, iy = y + gy * 22;
  const { m, h: hh, speed } = handAngles(t);
  const dir = (deg: number, r: number): Pt => [ix + Math.sin((deg * Math.PI) / 180) * r, iy - Math.cos((deg * Math.PI) / 180) * r];
  const hand = (deg: number, len: number, tail: number, sw: number, key: string, o = 1) => {
    const a = dir(deg, len), b = dir(deg + 180, tail);
    return (
      <g key={key} opacity={o}>
        <line x1={b[0]} y1={b[1]} x2={a[0]} y2={a[1]} stroke={P.emberHot} strokeWidth={sw * 2.6} strokeLinecap="round" opacity={0.28} />
        <line x1={b[0]} y1={b[1]} x2={a[0]} y2={a[1]} stroke={P.ember} strokeWidth={sw} strokeLinecap="round" />
      </g>
    );
  };
  // whirl: motion-blur fan behind the minute hand + ghost hands
  const blurDeg = clamp(speed / 14, 0, 150);
  const fan =
    speed > 400
      ? (() => {
          const a0 = dir(m - blurDeg, R * 0.86), a1 = dir(m, R * 0.86);
          return <path d={`M ${ix} ${iy} L ${a0[0]} ${a0[1]} A ${R * 0.86} ${R * 0.86} 0 0 1 ${a1[0]} ${a1[1]} Z`} fill={P.ember} opacity={0.32} />;
        })()
      : null;
  const ghosts = speed > 400 ? [1, 2, 3].map((k) => hand(m - k * clamp(speed / 50, 0, 26), R * 0.84, R * 0.16, 4, `g${k}`, 0.45 / k)) : null;
  // clock marks around the eye (it IS a clock); the mark under the minute hand lights up ember
  const mm = ((m % 360) + 360) % 360;
  const lit0 = clamp(1 - Math.abs(((0 - mm + 540) % 360) - 180) / 24);
  const marks = Array.from({ length: 12 }, (_, k) => {
    const a = (k * 30 * Math.PI) / 180;
    const rx = w + 44, ry = h + 58;
    const px = x + Math.sin(a) * rx, py = y - Math.cos(a) * ry;
    const d = Math.abs(((k * 30 - mm + 540) % 360) - 180); // angular distance to the hand
    const lit = clamp(1 - d / 24);
    const len = (k % 3 === 0 ? 22 : 12) + lit * 14;
    const ux = Math.sin(a), uy = -Math.cos(a);
    const gx0 = px + ux * len * 0.5, gy0 = py + uy * len * 0.5;
    return (
      <g key={k}>
        {lit > 0.02 && (
          <>
            <circle cx={gx0} cy={gy0} r={30} fill={P.ember} opacity={0.16 * lit} />
            <circle cx={gx0} cy={gy0} r={15} fill={P.ember} opacity={0.3 * lit} />
          </>
        )}
        {k !== 0 && (
          <line
            x1={px}
            y1={py}
            x2={px + ux * len}
            y2={py + uy * len}
            stroke={lit > 0.4 ? P.emberHot : k % 3 === 0 ? P.amberHi : P.amber}
            strokeWidth={(k % 3 === 0 ? 6 : 4) + lit * 3}
            strokeLinecap="round"
            opacity={Math.max(0.75 * glow, lit)}
          />
        )}
      </g>
    );
  });
  // chain it hangs from
  const links = [];
  for (let yy = PIVOT[1]; yy < y - h - 48; yy += 17) {
    const i = Math.round((yy - PIVOT[1]) / 17);
    links.push(
      i % 2 ? (
        <line key={i} x1={x} y1={yy - 6} x2={x} y2={yy + 6} stroke={P.amber} strokeWidth={3} opacity={0.5} />
      ) : (
        <ellipse key={i} cx={x} cy={yy} rx={5} ry={9} fill="none" stroke={P.amber} strokeWidth={2.5} opacity={0.5} />
      ),
    );
  }
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <clipPath id="b-eyeclip">
          <path d={almond} />
        </clipPath>
        <radialGradient id="b-sclera" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor={P.bone} />
          <stop offset="0.75" stopColor={P.bone} />
          <stop offset="1" stopColor={P.boneShade} />
        </radialGradient>
        <radialGradient id="b-dial" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={P.fog} />
          <stop offset="0.8" stopColor={P.ink} />
          <stop offset="1" stopColor={P.ink} />
        </radialGradient>
      </defs>
      <g transform={`rotate(${sway} ${PIVOT[0]} ${PIVOT[1]})`}>
        {links}
        {/* bracket on top of the eye */}
        <path
          d={`M ${x - 18} ${y - h - 50} L ${x + 18} ${y - h - 50} L ${x + 8} ${y - h - 30} L ${x - 8} ${y - h - 30} Z`}
          fill={lit0 > 0.4 ? P.emberHot : P.amber}
          opacity={0.55 + 0.45 * lit0}
        />
        {marks}
        <path d={almond} fill="url(#b-sclera)" />
        <g clipPath="url(#b-eyeclip)">
          <circle cx={ix} cy={iy} r={R + 9} fill={P.sepia} />
          <circle cx={ix} cy={iy} r={R + 9} fill="none" stroke={P.ink} strokeWidth={4} />
          <circle cx={ix} cy={iy} r={R} fill="url(#b-dial)" />
          {Array.from({ length: 12 }, (_, k) => {
            const major = k % 3 === 0;
            const a = dir(k * 30, R * (major ? 0.6 : 0.74)), b = dir(k * 30, R * 0.9);
            return <line key={k} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={major ? P.amberHi : P.boneShade} strokeWidth={major ? 4.5 : 2.5} strokeLinecap="round" />;
          })}
          {fan}
          {ghosts}
          {hand(hh + boil(f, 640, speed > 0 ? 0 : 0.6), R * 0.52, R * 0.12, 7.5, "h")}
          {hand(m + boil(f, 641, speed > 0 ? 0 : 0.6), R * 0.84, R * 0.18, 4.2, "m")}
          <circle cx={ix} cy={iy} r={9} fill={P.ink} stroke={P.ember} strokeWidth={3} />
          <ellipse cx={ix - R * 0.42} cy={iy - R * 0.46} rx={10} ry={6} fill={P.bone} opacity={0.8} transform={`rotate(-32 ${ix - R * 0.42} ${iy - R * 0.46})`} />
        </g>
        {open < 0.999 && (
          <>
            <path d={lidU} fill={P.boneShade} />
            <path d={lidL} fill={P.boneShade} />
            <path d={`M ${xl} ${yl} Q ${x} ${y - 2 * h * uU} ${xr} ${yr}`} fill="none" stroke={P.ink} strokeWidth={6} strokeLinecap="round" />
          </>
        )}
        <path d={almond} fill="none" stroke={P.ink} strokeWidth={10} />
      </g>
    </svg>
  );
};

// ---------- ember sand trickling from the eye onto the table (time leaking) ----------
const Sand: React.FC<{ t: number; src: Pt; o: number }> = ({ t, src, o }) => {
  const rate = 34, g = 2100;
  const y1 = TOP - 16;
  const fallT = Math.sqrt((2 * (y1 - src[1])) / g);
  const k0 = Math.floor(t * rate);
  const grains: React.ReactNode[] = [];
  for (let i = 0; i < Math.ceil(fallT * rate) + 1; i++) {
    const k = k0 - i;
    if (rnd(k * 5.3) < 0.3) continue; // irregular trickle
    const age = t - k / rate - rnd(k * 2.2) * 0.02;
    if (age < 0 || age > fallT) continue;
    const yy = src[1] + 0.5 * g * age * age;
    const xx = src[0] + (rnd(k * 1.7) - 0.5) * 6 * (0.3 + age) + Math.sin(age * 9 + k) * 1.2;
    grains.push(<circle key={k} cx={xx} cy={yy} r={1.1 + rnd(k * 3.1) * 2.1} fill={rnd(k) > 0.6 ? P.emberHot : P.ember} opacity={0.55 + rnd(k * 7.7) * 0.45} />);
  }
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: o, overflow: "visible" }}>
      <line x1={src[0]} y1={src[1] + 4} x2={src[0]} y2={src[1] + 60} stroke={P.ember} strokeWidth={2} strokeLinecap="round" opacity={0.5} />
      <line x1={src[0]} y1={src[1] + 4} x2={540} y2={y1} stroke={P.ember} strokeWidth={1.2} opacity={0.14} />
      {grains}
      <ellipse cx={540} cy={TOP - 13} rx={15} ry={5} fill={P.ember} />
      <ellipse cx={540} cy={TOP - 15} rx={7} ry={3} fill={P.emberHot} />
    </svg>
  );
};

// ---------- the table: a flat slab on two ink triangles tip to tip (an hourglass) ----------
const Table: React.FC<{ f: number; t: number; cardHop: number }> = ({ f, t, cardHop }) => {
  const b = (s: number, a = 1) => boil(f, 700 + s, a);
  const waist = 1172;
  const up: Pt[] = [
    [398 + b(1), TOP + 14],
    [682 + b(2), TOP + 14],
    [541 + b(3), waist],
    [539 + b(4), waist],
  ];
  const lo: Pt[] = [
    [538 + b(5), waist],
    [542 + b(6), waist],
    [630 + b(7), FLOOR],
    [450 + b(8), FLOOR],
  ];
  // face-up cards lying on the table + a deck in the middle; the top card jumps and flips over on «کدومش»
  const hopY = -Math.sin(cardHop * Math.PI) * 74;
  const flip = cardHop * Math.PI * 3; // one and a half flips: it lands face up
  const cardH = 4 + 34 * Math.abs(Math.sin(flip));
  const showFace = Math.cos(flip) < 0;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <polygon points={poly(up)} fill={P.ink} />
      <polygon points={poly(lo)} fill={P.ink} />
      {/* rim light on the hourglass legs from the lamp behind */}
      <line x1={up[0][0]} y1={up[0][1]} x2={540} y2={waist} stroke={P.amber} strokeWidth={2.5} opacity={0.45} />
      <line x1={up[1][0]} y1={up[1][1]} x2={540} y2={waist} stroke={P.amber} strokeWidth={2.5} opacity={0.45} />
      <line x1={540} y1={waist} x2={lo[3][0]} y2={FLOOR} stroke={P.amber} strokeWidth={2.5} opacity={0.35} />
      <line x1={540} y1={waist} x2={lo[2][0]} y2={FLOOR} stroke={P.amber} strokeWidth={2.5} opacity={0.35} />
      {/* slab */}
      <rect x={384 + b(9)} y={TOP} width={312} height={16} fill={P.ink} />
      <line x1={386} x2={694} y1={TOP + 1} y2={TOP + 1} stroke={P.amber} strokeWidth={3} opacity={0.7} />
      {/* cards on the table */}
      <polygon points={poly([[452, TOP - 1], [494, TOP - 1], [490, TOP - 6], [456, TOP - 6]])} fill={P.bone} stroke={P.ink} strokeWidth={1.5} />
      <polygon points={poly([[586, TOP - 1], [628, TOP - 1], [624, TOP - 6], [590, TOP - 6]])} fill={P.bone} stroke={P.ink} strokeWidth={1.5} />
      {[0, 1, 2].map((k) => (
        <rect key={k} x={518 - k * 0.5} y={TOP - 4 - k * 4} width={44} height={4} fill={k % 2 ? P.amber : P.boneShade} stroke={P.ink} strokeWidth={1.2} />
      ))}
      <g transform={`translate(540 ${TOP - 14 + hopY}) rotate(${Math.sin(cardHop * Math.PI) * 14})`}>
        <rect x={-22} y={-cardH / 2} width={44} height={cardH} rx={2} fill={showFace ? P.bone : P.amber} stroke={P.ink} strokeWidth={1.4} />
        {showFace && cardH > 14 && <path d={`M -6 ${-cardH * 0.25} L 6 ${-cardH * 0.25} L 0 0 L 6 ${cardH * 0.25} L -6 ${cardH * 0.25} L 0 0 Z`} fill={P.ink} />}
      </g>
    </svg>
  );
};

// ---------- a seated ink player (computed facing right, mirrored for the right side) ----------
type Side = "L" | "R";
const Player: React.FC<{
  side: Side;
  t: number;
  f: number;
  up: number; // 0 hunched … 1 sat up straight
  back: number; // 0 … 1 leaned back
  tilt: number;
  hdx: number;
  hdy: number;
  squash: number;
  expr: Expr;
  drum: number; // finger drumming 0..1
  jiggle?: number; // nervous knee 0..1
  seed: number;
}> = ({ side, t, f, up, back, tilt, hdx, hdy, squash, expr, drum, jiggle = 0, seed }) => {
  const mx = (x: number) => (side === "L" ? x : 1080 - x);
  const M = (p: Pt): Pt => [mx(p[0]), p[1]];
  const ma = (deg: number) => (side === "L" ? deg : 180 - deg);
  const bo = (s: number, a = 1.4) => boil(f, seed + s, a);
  const breath = Math.sin(t * 1.9 + seed) * 2.6;
  const hip: Pt = [236, 1146];
  const neck0 = lerpPt(lerpPt([320, 998], [266, 950], up), [184, 974], back);
  const ctrl = lerpPt(lerpPt([224, 1012], [246, 1062], up), [206, 1074], back);
  const neck: Pt = [neck0[0], neck0[1] + breath];
  // torso outline around a curved spine
  const L: Pt[] = [], R: Pt[] = [];
  const N = 8;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const p = qpt(hip, ctrl, neck, u);
    const dx = 2 * (1 - u) * (ctrl[0] - hip[0]) + 2 * u * (neck[0] - ctrl[0]);
    const dy = 2 * (1 - u) * (ctrl[1] - hip[1]) + 2 * u * (neck[1] - ctrl[1]);
    const l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l, ny = dx / l;
    const wd = u < 0.68 ? lerp(34, 48, Math.sin(((u / 0.68) * Math.PI) / 2)) : lerp(48, 18, Math.pow((u - 0.68) / 0.32, 1.25));
    L.push([p[0] + (nx * wd) / 2 + bo(i), p[1] + (ny * wd) / 2 + bo(i + 20)]);
    R.push([p[0] - (nx * wd) / 2 + bo(i + 40), p[1] - (ny * wd) / 2 + bo(i + 60)]);
  }
  const torso = smoothClosed([...L, ...R.reverse()].map(M));
  const sh = qpt(hip, ctrl, neck, 0.84);
  const shoulder: Pt = [sh[0] + 8, sh[1] + 2];
  // arms: elbows rest on the table, near hand holds a fan of cards, far hand lies on the table
  const nerv = side === "L" ? Math.sin(t * 13) * 2.2 : 0;
  const elbow = lerpPt(lerpPt([404, TOP + 2], [398, TOP + 2], up), [350, TOP - 16], back);
  const hand0 = lerpPt(lerpPt([446, TOP - 56 + nerv], [440, TOP - 76], up), [394, TOP - 80], back);
  const hand: Pt = [hand0[0] + bo(88, 1), hand0[1] + bo(89, 1)];
  const elbow2 = lerpPt(lerpPt([390, TOP + 2], [386, TOP + 2], up), [340, TOP - 4], back);
  const hand2 = lerpPt(lerpPt([466, TOP - 2], [462, TOP - 2], up), [398, TOP - 6], back);
  const curl2 = 0.2 + 0.45 * drum * Math.max(0, Math.sin(t * 2 * Math.PI * 5.5)) + boil(f, seed + 90, 0.08);
  // legs
  const jig = jiggle * Math.sin(t * Math.PI * 2 * 6.5) * 3.2; // nervous knee bounce
  const legN: Pt[] = [[hip[0] + 8, hip[1] + 4], [324 + bo(70, 1), 1130 + jig], [330, FLOOR - 4 + Math.max(0, jig) * 0.3], [356, FLOOR]];
  const legF: Pt[] = [[hip[0] - 4, hip[1]], [310 + bo(71, 1), 1124], [312, FLOOR - 4], [336, FLOOR]];
  // head
  const size = 152;
  const hoff = lerpPt(lerpPt([30, -98], [6, -104], up), [-16, -100], back);
  const head: Pt = [neck[0] + hoff[0] + hdx, neck[1] + hoff[1] + hdy];
  const mw = (size * 200) / 260;
  // cards fan in the near hand
  const fan = [-26, -8, 10].map((a, i) => {
    const ang = (side === "L" ? a : -a) + boil(f, seed + 100 + i, 1.2);
    const [hx, hy] = M(hand);
    return (
      <g key={i} transform={`translate(${hx} ${hy}) rotate(${ang})`}>
        <rect x={-17} y={-58} width={34} height={50} rx={3} fill={P.amber} stroke={P.ink} strokeWidth={3} />
        <path d="M -7 -46 L 7 -46 L 0 -33 L 7 -20 L -7 -20 L 0 -33 Z" fill={P.ink} opacity={0.85} />
      </g>
    );
  });
  const bench = side === "L" ? 150 : 1080 - 286;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {/* bench */}
        <rect x={bench} y={1150} width={136} height={FLOOR - 1150} fill={P.ink} />
        <line x1={bench} x2={bench + 136} y1={1151} y2={1151} stroke={P.amber} strokeWidth={3} opacity={0.5} />
        <polyline points={poly(legF.map(M))} fill="none" stroke={P.ink} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <Arm
        pts={[M([shoulder[0] - 10, shoulder[1] + 8]), M([elbow2[0] + bo(83, 1.2), elbow2[1] + bo(84, 0.8)]), M([hand2[0] + bo(85, 0.8), hand2[1]])]}
        angle={ma(4)}
        width={8}
        fingers={34}
        spread={11}
        curl={curl2}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <path d={torso} fill={P.ink} />
        <line x1={mx(neck[0])} y1={neck[1] + 6} x2={mx(head[0])} y2={head[1] + 40} stroke={P.ink} strokeWidth={11} strokeLinecap="round" />
        <polyline points={poly(legN.map(M))} fill="none" stroke={P.ink} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", left: mx(head[0]) - mw / 2, top: head[1] - size / 2, width: mw, height: size }}>
        <Mask kind={side === "L" ? "A" : "B"} size={size} f={f} expr={expr} tilt={tilt} squash={squash} />
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {fan}
      </svg>
      <Arm
        pts={[M(shoulder), M([elbow[0] + bo(86, 1.2), elbow[1] + bo(87, 0.8)]), M(hand)]}
        angle={ma(-62)}
        width={8.5}
        fingers={30}
        spread={13}
        curl={0.55 + boil(f, seed + 80, 0.06)}
      />
    </>
  );
};

// ================= the scene =================
export const SceneTable: React.FC<SceneProps> = ({ t, lt, f, dur }) => {
  // ----- camera: one slow push-in, a hit on «کدومش», small re-frames toward whoever is in the spotlight -----
  const p = clamp(lt / dur);
  const push = 0.55 * p + 0.45 * eio(p);
  const kHit = hit(t, K.kodum - 0.02, 0.05, 0.7);
  const s = 1.035 + 0.13 * push + 0.04 * kHit + 0.014 * hit(t, K.bordan - 0.02, 0.04, 0.45) + 0.014 * hit(t, K.nabakhtan - 0.02, 0.04, 0.45);
  const camX = track(t, 0, [[K.bordan - 0.02, 26, 0.4], [K.nabakhtan - 0.02, -26, 0.45]]) + drift(t, 1, 3) + wob(t, K.kodum, 7, 9) * 6;
  const camY = drift(t, 2, 4) + wob(t, K.kodum + 0.01, 6, 8) * 5 - 14 * push;

  // ----- lamp: breathes and flickers a little -----
  const lamp = 0.9 + 0.06 * Math.sin(t * 5.3) * Math.sin(t * 1.7) + (rnd(Math.floor(f / 3) * 1.3) > 0.9 ? -0.08 : 0);

  // ----- the clock-eye -----
  const wake = lerp(0.1, 1, pr(t, SC.table + 0.04, 0.3, eio));
  const halfLid = track(t, 0, [[K.khob, 0.5, 0.35, eio], [K.kodum - 0.03, 0, 0.06]]);
  const open = clamp(wake - Math.max(blink(t, K.zadin + 0.34), blink(t, K.nadashtam + 0.3, 0.08, 0.06, 0.18), halfLid));
  const wide = track(t, 0, [[K.kodum - 0.03, 1, 0.12, eback], [K.bordan, 0.3, 0.5, eio]]);
  const gx =
    track(t, 0, [
      [K.har - 0.03, -0.85, 0.1],
      [K.dotun - 0.02, 0.85, 0.12],
      [K.hesab + 0.05, 0, 0.35, eio],
      [K.kodum - 0.03, 0, 0.08],
      [K.bordan - 0.02, -0.95, 0.09],
      [K.ya, -0.4, 0.45, eio], // «…یا» — the eye drifts back, weighing it
      [K.nabakhtan - 0.02, 0.95, 0.1],
    ]) + drift(t, 3, 0.05, 1.3);
  const gy = track(t, 0, [
    [K.manam, 0.6, 0.45, eio],
    [K.khob, 0, 0.4, eio],
    [K.kodum - 0.03, -0.25, 0.08],
    [K.bordan - 0.02, 0.35, 0.1],
    [K.nabakhtan - 0.02, 0.35, 0.1],
  ]);
  const sway = 1.1 * Math.cos(Math.PI * t) * (1 - 0.6 * wide);
  const eyeBottom = rot([EX, EY + 74 * (1 + 0.42 * wide)], PIVOT, sway);

  // ----- the players -----
  const lookUpA = track(t, 0, [[K.har + 0.04, 0.8, 0.3], [K.harf, 0, 0.3], [K.kodum, 1, 0.12], [K.bordan, 0.2, 0.3], [K.nabakhtan, 0, 0.4]]);
  const lookUpB = track(t, 0, [[K.har + 0.12, 0.7, 0.32], [K.harf + 0.06, 0, 0.3], [K.kodum + 0.04, 1, 0.12], [K.bordan, 0, 0.3]]);
  const glanceA = track(t, 0, [[K.harf + 0.04, 1, 0.22], [K.manam, 0, 0.4, eio], [K.nabakhtan + 0.12, 1, 0.25]]);
  const glanceB = track(t, 0, [[K.harf + 0.14, 1, 0.24], [K.manam + 0.1, 0, 0.42, eio], [K.bordan + 0.14, 1, 0.25], [K.nabakhtan, 0, 0.3]]);
  const startA = hit(t, K.kodum, 0.05, 0.4), startB = hit(t, K.kodum + 0.04, 0.05, 0.4);
  const upA = track(t, 0, [[K.bordan - 0.02, 1, 0.2, eback], [K.nabakhtan, 0.1, 0.5, eio]]);
  const backB = track(t, 0, [[K.nabakhtan - 0.02, 1, 0.26, eback]]);
  const drumA = pr(t, K.khob + 0.05, 0.1) * (1 - pr(t, K.kodum - 0.05, 0.05));

  // ----- spotlight: «بُردن» → A, «نباختن» → B -----
  const spotA = pr(t, K.bordan - 0.02, 0.05) * (1 - pr(t, K.nabakhtan - 0.02, 0.05));
  const spotB = pr(t, K.nabakhtan - 0.02, 0.05);
  const spot = Math.max(spotA, spotB);
  const holeX = lerp(300, 780, pr(t, K.nabakhtan - 0.02, 0.08, eio));
  // the lamp "snaps" on: a short over-bright flash, then it settles
  const flashA = hit(t, K.bordan - 0.02, 0.03, 0.3), flashB = hit(t, K.nabakhtan - 0.02, 0.03, 0.3);
  const spotOA = spotA * (1 + 0.7 * flashA), spotOB = spotB * (1 + 0.7 * flashB);

  // depth layers: the wall moves less than the stage, the low fog in front moves more (parallax push-in)
  const layer = (depth: number, extra?: React.CSSProperties): React.CSSProperties => ({
    transform: `translate(${camX * depth}px, ${camY * depth}px) scale(${1 + (s - 1) * depth})`,
    transformOrigin: "540px 1080px", // keeps the stage floor above the subtitle band while pushing in
    ...extra,
  });

  return (
    <AbsoluteFill style={{ background: P.ink, overflow: "hidden" }}>
      <AbsoluteFill style={layer(0.55)}>
        <Backdrop t={t} f={f} lamp={lamp} />
        <Fog t={t} y={360} h={520} o={0.22} color={P.fog} seed={11} speed={9} />
      </AbsoluteFill>
      {/* side light from the upper corners onto each player */}
      <AbsoluteFill style={layer(0.8, { mixBlendMode: "screen" })}>
        <Beam a={[30, -120]} b={[350, 1130]} w1={60} w2={380} o={0.34 * lamp} id="l" />
        <Beam a={[1050, -120]} b={[730, 1130]} w1={60} w2={380} o={0.34 * lamp} id="r" />
        <Motes t={t} x={110} y={240} w={300} h={860} n={16} seed={3} size={3.5} />
        <Motes t={t} x={670} y={240} w={300} h={860} n={16} seed={7} size={3.5} />
      </AbsoluteFill>
      <AbsoluteFill style={layer(1)}>
        <Floor f={f} lamp={lamp} />
        {/* spotlight pools on the floor */}
        {[
          [300, spotOA],
          [780, spotOB],
        ].map(([x, o], i) =>
          o > 0.002 ? (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x - 230,
                top: FLOOR - 40,
                width: 460,
                height: 110,
                background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${rgba(P.amberHi, 0.75)} 0%, ${rgba(P.amber, 0.35)} 55%, ${rgba(P.amber, 0)} 100%)`,
                opacity: clamp(o),
                mixBlendMode: "screen",
              }}
            />
          ) : null,
        )}
        <Shaft f={f} />
        <Fog t={t} y={1150} h={170} o={0.3} color={P.sepia} seed={4} speed={12} />
        <Player
          side="L"
          t={t}
          f={f}
          up={upA}
          back={0}
          tilt={8 + glanceA * 7 + lookUpA * 3 - upA * 6 + boil(f, 31, 0.7)}
          hdx={glanceA * 7}
          hdy={-lookUpA * 9 - startA * 16}
          squash={-0.07 * startA}
          expr="worried"
          drum={drumA}
          jiggle={1 - pr(t, K.kodum - 0.05, 0.08)}
          seed={100}
        />
        <Player
          side="R"
          t={t}
          f={f}
          up={0}
          back={backB}
          tilt={-(8 + glanceB * 7 + lookUpB * 3) + backB * 10 + boil(f, 32, 0.7)}
          hdx={-glanceB * 7}
          hdy={-lookUpB * 9 - startB * 14}
          squash={-0.06 * startB}
          expr={backB > 0.3 ? "smirk" : "bored"}
          drum={0}
          seed={200}
        />
        <Table f={f} t={t} cardHop={clamp((t - K.kodum - 0.02) / 0.46)} />
        {/* spotlight: the rest of the room drops into shadow */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 250px 440px at ${holeX}px 1030px, ${rgba(P.ink, 0)} 0%, ${rgba(P.ink, 0)} 46%, ${rgba(P.ink, 0.74)} 100%)`,
            opacity: spot,
          }}
        />
        <Beam a={[300, -260]} b={[300, FLOOR + 20]} w1={120} w2={380} o={0.5 * spotOA} id="sa" slices={3} />
        <Beam a={[780, -260]} b={[780, FLOOR + 20]} w1={120} w2={380} o={0.5 * spotOB} id="sb" slices={3} />
        {/* the eye */}
        <Glow x={EX} y={EY} r={330} o={0.22 + 0.12 * kHit} color={P.amber} />
        <Sand t={t} src={eyeBottom} o={0.7 * (1 - 0.7 * spot)} />
        <ClockEye t={t} f={f} open={open} wide={wide} gx={gx} gy={gy} sway={sway} glow={lamp} />
      </AbsoluteFill>
      {/* low fog in front of the stage */}
      <AbsoluteFill style={layer(1.4)}>
        <Fog t={t} y={1330} h={260} o={0.26} color={P.sepia} seed={9} speed={18} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
