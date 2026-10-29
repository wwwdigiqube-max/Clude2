import React from "react";
import { AbsoluteFill } from "remotion";
import { C, camAt, clamp, eback, eo, F_HEAD, F_TEXT, Key, lerp, pr, rnd, VH, VW } from "./lib";

// Aerial (top-down) farm drawn in code, same flat golden-hour look as the illustrations.
// World is 1600×2600 units; camera keys use world-normalized focus (0..1) and zoom (1 ≈ whole farm width).
export const MW = 1600, MH = 2600;

// layout (world units)
export const P = {
  house: { x: 640, y: 1240 },
  barn: { x: 1080, y: 860 },
  well: { x: 430, y: 960 },
  gate: { x: 800, y: 2120 },
  cows: { x: 1080, y: 1360 },
  hens: { x: 420, y: 1500 },
  horse: { x: 1120, y: 1720 },
  dog: { x: 700, y: 1450 },
  safe: { x: 660, y: 1300 },
};

// trees: forest belt outside the fence + a few near the house (deterministic)
const TREES: { x: number; y: number; r: number; dark: number }[] = [];
for (let i = 0; i < 520; i++) {
  const x = rnd(i * 3.1) * MW, y = rnd(i * 7.7 + 1) * MH;
  const inside = x > 230 && x < 1370 && y > 430 && y < 2190;
  if (inside) continue;
  TREES.push({ x, y, r: 34 + rnd(i * 1.3) * 34, dark: rnd(i * 5.1) });
}
for (const [x, y, r] of [
  [470, 1150, 46], [520, 1090, 38], [860, 1100, 44], [900, 1170, 36], [330, 640, 40], [1290, 1120, 42], [360, 1960, 44], [1250, 2000, 40],
] as const)
  TREES.push({ x, y, r, dark: 0.2 });

// forest eyes (the ones who hear the generator)
const EYES = [
  { x: 1440, y: 420 }, { x: 160, y: 760 }, { x: 1480, y: 1500 }, { x: 140, y: 1900 }, { x: 980, y: 2350 }, { x: 420, y: 300 }, { x: 1300, y: 2360 },
];

type Ring = { x: number; y: number; t0: number; color?: string; max?: number; period?: number; n?: number; w?: number };

export type MapState = {
  rings?: Ring[];
  eyesAt?: number; // eyes fade in
  pinAt?: number; // red pin on barn
  rulerAt?: number; // distance ruler barn → forest
  gatherAt?: [number, number]; // animals walk to the house between these times
  safeAt?: number; // dashed safe zone around the house
  ellieAt?: number; // Ellie marker in the house
  stampAt?: number; // «تقریباً غیرممکن»
  dusk?: number; // 0 = golden afternoon … 1 = dusk
};

const cowSpots = (cx: number, cy: number, i: number) => (
  <g key={`c${i}`} transform={`translate(${cx},${cy}) rotate(${-20 + rnd(i) * 40})`}>
    <ellipse cx={8} cy={8} rx={34} ry={20} fill="rgba(40,20,10,.35)" />
    <ellipse cx={0} cy={0} rx={34} ry={20} fill="#F3EAD8" />
    <ellipse cx={-10} cy={-6} rx={10} ry={8} fill="#2A1C14" />
    <ellipse cx={12} cy={6} rx={9} ry={6} fill="#2A1C14" />
    <ellipse cx={36} cy={0} rx={10} ry={9} fill="#E9D9BE" />
  </g>
);

export const FarmMap: React.FC<{ t: number; keys: Key[]; st: MapState; off?: { x: number; y: number } }> = ({ t, keys, st, off = { x: 0, y: 0 } }) => {
  const k = camAt(keys, t);
  const s = (VW / MW) * k.z * 1.12;
  const dw = MW * s, dh = MH * s;
  const left = clamp(VW / 2 - k.x * dw, VW - dw, 0) + off.x;
  const top = clamp(VH / 2 - k.y * dh, VH - dh, 0) + off.y;
  const dusk = st.dusk ?? 0;
  const sh = { dx: 26, dy: 16 }; // long shadows (sun low, upper-left)

  // animal positions (gather to the house)
  const g = st.gatherAt ? pr(t, st.gatherAt[0], st.gatherAt[1] - st.gatherAt[0], Easing2) : 0;
  const to = (from: { x: number; y: number }, dx: number, dy: number) => ({
    x: lerp(from.x, P.safe.x + dx, g),
    y: lerp(from.y, P.safe.y + dy, g),
  });
  const cowsC = to(P.cows, 210, 120), hensC = to(P.hens, -170, 150), horseC = to(P.horse, 160, 260), dogC = to(P.dog, 0, 200);

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#3B2616" }}>
      <svg
        width={MW}
        height={MH}
        viewBox={`0 0 ${MW} ${MH}`}
        style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${left}px,${top}px) scale(${s})` }}
      >
        <defs>
          <pattern id="rowsA" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
            <rect width="28" height="28" fill="#D9A24E" />
            <rect width="28" height="9" fill="#C68B3C" />
          </pattern>
          <pattern id="rowsB" width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
            <rect width="34" height="34" fill="#C99245" />
            <rect width="34" height="11" fill="#E0B262" />
          </pattern>
          <pattern id="rowsC" width="30" height="30" patternUnits="userSpaceOnUse">
            <rect width="30" height="30" fill="#A8743A" />
            <rect width="30" height="8" fill="#B98446" />
          </pattern>
          <radialGradient id="sun" cx="0.1" cy="0.05" r="1.1">
            <stop offset="0" stopColor="#FFD08A" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFB060" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* ground */}
        <rect width={MW} height={MH} fill="#C08A45" />
        {/* fields */}
        <rect x={270} y={1620} width={430} height={520} rx={10} fill="url(#rowsA)" />
        <rect x={270} y={470} width={520} height={330} rx={10} fill="url(#rowsB)" />
        <rect x={880} y={1950} width={460} height={190} rx={10} fill="url(#rowsC)" />
        <rect x={1180} y={470} width={170} height={260} rx={10} fill="url(#rowsA)" />
        {/* dirt road: outside → gate → house → barn */}
        <path
          d={`M 800 2600 L ${P.gate.x} ${P.gate.y} C 800 1800 720 1560 ${P.house.x + 40} ${P.house.y + 110} M ${P.house.x + 120} ${P.house.y} C 860 1100 960 1000 ${P.barn.x - 40} ${P.barn.y + 140}`}
          stroke="#E7C489"
          strokeWidth={46}
          fill="none"
          strokeLinecap="round"
        />
        {/* fence (perimeter) */}
        <rect x={240} y={440} width={1120} height={1740} rx={30} fill="none" stroke="#F3DDB3" strokeWidth={7} strokeDasharray="26 14" opacity={0.9} />
        {/* gate */}
        <g transform={`translate(${P.gate.x},${P.gate.y + 60})`}>
          <rect x={-70} y={-10} width={140} height={20} fill="#6A4026" />
          <rect x={-82} y={-22} width={22} height={44} fill="#4A2C1A" />
          <rect x={60} y={-22} width={22} height={44} fill="#4A2C1A" />
        </g>
        {/* pens */}
        <rect x={P.cows.x - 170} y={P.cows.y - 130} width={340} height={260} rx={14} fill="#B88645" stroke="#7A4C2A" strokeWidth={8} />
        <rect x={P.horse.x - 130} y={P.horse.y - 110} width={260} height={220} rx={14} fill="#B98A49" stroke="#7A4C2A" strokeWidth={8} />
        <rect x={P.hens.x - 120} y={P.hens.y - 100} width={240} height={200} rx={14} fill="#C8975A" stroke="#7A4C2A" strokeWidth={6} />
        {/* coop */}
        <g transform={`translate(${P.hens.x - 70},${P.hens.y - 70})`}>
          <rect x={sh.dx} y={sh.dy} width={90} height={70} fill="rgba(40,20,10,.35)" />
          <rect width={90} height={70} fill="#9A4A2C" />
          <rect width={90} height={35} fill="#B0583A" />
        </g>
        {/* safe zone */}
        {st.safeAt !== undefined && t >= st.safeAt && (
          <circle
            cx={P.safe.x}
            cy={P.safe.y + 60}
            r={330 * pr(t, st.safeAt, 0.6, eback)}
            fill="rgba(246,231,204,.10)"
            stroke={C.cream}
            strokeWidth={8}
            strokeDasharray="30 18"
            strokeDashoffset={-t * 40}
          />
        )}
        {/* well */}
        <g transform={`translate(${P.well.x},${P.well.y})`}>
          <circle cx={sh.dx} cy={sh.dy} r={40} fill="rgba(40,20,10,.35)" />
          <circle r={40} fill="#8F7A66" />
          <circle r={26} fill="#3B4A4A" />
          <rect x={60} y={-40} width={80} height={70} fill="#7A5434" />
          <rect x={60} y={-40} width={80} height={34} fill="#93663F" />
        </g>
        {/* trees (shadows first) */}
        {TREES.map((tr, i) => (
          <circle key={`s${i}`} cx={tr.x + sh.dx} cy={tr.y + sh.dy} r={tr.r} fill="rgba(30,15,8,.4)" />
        ))}
        {TREES.map((tr, i) => (
          <g key={`t${i}`}>
            <circle cx={tr.x} cy={tr.y} r={tr.r} fill={tr.dark > 0.5 ? "#5B3B22" : "#6E4A28"} />
            <circle cx={tr.x - tr.r * 0.25} cy={tr.y - tr.r * 0.25} r={tr.r * 0.55} fill={tr.dark > 0.5 ? "#6C4A2A" : "#8A6034"} />
          </g>
        ))}
        {/* house */}
        <g transform={`translate(${P.house.x},${P.house.y})`}>
          <rect x={-120 + sh.dx * 1.6} y={-90 + sh.dy * 1.6} width={240} height={180} fill="rgba(30,15,8,.45)" />
          <rect x={-120} y={-90} width={240} height={180} fill="#A5492C" />
          {/* hip roof lit from the upper-left */}
          <polygon points="-120,-90 120,-90 60,0 -60,0" fill="#C8603A" />
          <polygon points="-120,90 120,90 60,0 -60,0" fill="#86381F" />
          <polygon points="-120,-90 -60,0 -120,90" fill="#B4532F" />
          <polygon points="120,-90 60,0 120,90" fill="#94402A" />
          <line x1={-60} y1={0} x2={60} y2={0} stroke="#E3B47E" strokeWidth={6} />
          <rect x={60} y={-60} width={26} height={26} fill="#5A2A1A" />
        </g>
        {/* barn */}
        <g transform={`translate(${P.barn.x},${P.barn.y})`}>
          <rect x={-130 + sh.dx * 2} y={-170 + sh.dy * 2} width={260} height={340} fill="rgba(30,15,8,.45)" />
          <rect x={-130} y={-170} width={130} height={340} fill="#B6482F" />
          <rect x={0} y={-170} width={130} height={340} fill="#933823" />
          <line x1={0} y1={-170} x2={0} y2={170} stroke="#E3C08C" strokeWidth={6} />
        </g>
        {/* animals */}
        {[0, 1, 2, 3, 4].map((i) => cowSpots(cowsC.x - 100 + (i % 3) * 95 + rnd(i) * 20, cowsC.y - 50 + Math.floor(i / 3) * 90 + rnd(i + 9) * 16, i))}
        {Array.from({ length: 22 }, (_, i) => {
          const hx = hensC.x - 90 + rnd(i * 2.3) * 180 + Math.sin(t * 3 + i) * 4;
          const hy = hensC.y - 60 + rnd(i * 4.1) * 140 + Math.cos(t * 2.6 + i) * 4;
          return (
            <g key={`h${i}`}>
              <circle cx={hx + 5} cy={hy + 4} r={10} fill="rgba(30,15,8,.3)" />
              <circle cx={hx} cy={hy} r={10} fill={i % 4 === 0 ? "#B0582E" : "#F1E2C4"} />
              <circle cx={hx + 6} cy={hy - 3} r={3} fill="#D9442A" />
            </g>
          );
        })}
        <g transform={`translate(${horseC.x},${horseC.y}) rotate(${25 + Math.sin(t) * 3})`}>
          <ellipse cx={10} cy={8} rx={56} ry={22} fill="rgba(30,15,8,.35)" />
          <ellipse rx={56} ry={22} fill="#7A4626" />
          <ellipse cx={58} rx={18} ry={12} fill="#6A3B20" />
          <rect x={-60} y={-4} width={22} height={8} fill="#3A2214" />
        </g>
        <g transform={`translate(${dogC.x},${dogC.y}) rotate(-30)`}>
          <ellipse cx={6} cy={5} rx={24} ry={11} fill="rgba(30,15,8,.35)" />
          <ellipse rx={24} ry={11} fill="#D8A15A" />
          <circle cx={26} r={9} fill="#E7B66E" />
          <circle cx={32} cy={0} r={5} fill="#F3E3C6" />
        </g>
        {/* Ellie marker */}
        {st.ellieAt !== undefined && t >= st.ellieAt && (
          <g transform={`translate(${P.house.x - 20},${P.house.y + 150}) scale(${pr(t, st.ellieAt, 0.4, eback)})`}>
            <circle r={44} fill="none" stroke={C.cream} strokeWidth={6} opacity={0.4 + 0.3 * Math.sin(t * 6)} />
            <circle r={22} fill={C.amber} stroke={C.cream} strokeWidth={6} />
            <circle cx={-4} cy={-12} r={9} fill="#C8612B" />
          </g>
        )}
        {/* warm sun wash */}
        <rect width={MW} height={MH} fill="url(#sun)" />
        <rect width={MW} height={MH} fill="#2A1630" opacity={0.42 * dusk} style={{ mixBlendMode: "multiply" }} />
        {/* sound rings */}
        {(st.rings ?? []).map((r, ri) => {
          const n = r.n ?? 4, period = r.period ?? 0.55, max = r.max ?? 900;
          return Array.from({ length: n * 3 }, (_, j) => {
            const age = t - r.t0 - j * period;
            if (age < 0) return null;
            const rr = 40 + age * (max / 1.8);
            if (rr > max) return null;
            const a = (1 - rr / max) * 0.9;
            return <circle key={`r${ri}_${j}`} cx={r.x} cy={r.y} r={rr} fill="none" stroke={r.color ?? C.cream} strokeWidth={r.w ?? 10} opacity={a} />;
          });
        })}
        {/* ruler barn → forest */}
        {st.rulerAt !== undefined && t >= st.rulerAt && (() => {
          const p = pr(t, st.rulerAt, 0.7);
          const x1 = P.barn.x + 40, y1 = P.barn.y - 190, x2 = lerp(x1, 1470, p), y2 = lerp(y1, 330, p);
          return (
            <g>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.cream} strokeWidth={8} strokeDasharray="18 12" />
              <circle cx={x1} cy={y1} r={12} fill={C.cream} />
              <circle cx={x2} cy={y2} r={12} fill={C.cream} opacity={p} />
            </g>
          );
        })()}
        {/* eyes in the forest */}
        {st.eyesAt !== undefined &&
          EYES.map((e, i) => {
            const p = pr(t, st.eyesAt! + i * 0.09, 0.3);
            if (p <= 0) return null;
            const blink = Math.sin(t * 3 + i * 2) > 0.97 ? 0.15 : 1;
            const ang = Math.atan2(P.barn.y - e.y, P.barn.x - e.x);
            const ox = Math.cos(ang) * 6 * pr(t, st.eyesAt! + 0.5 + i * 0.09, 0.4);
            return (
              <g key={`e${i}`} opacity={p} transform={`translate(${e.x},${e.y})`}>
                <circle r={62} fill="#120A06" opacity={0.75} />
                <ellipse cx={-14 + ox} cy={0} rx={8} ry={6 * blink} fill="#FF6A3D" />
                <ellipse cx={14 + ox} cy={0} rx={8} ry={6 * blink} fill="#FF6A3D" />
                <circle r={30} fill="#FF6A3D" opacity={0.12} />
              </g>
            );
          })}
        {/* red location pin on the barn */}
        {st.pinAt !== undefined && t >= st.pinAt && (() => {
          const p = pr(t, st.pinAt, 0.35, eback);
          const drop = (1 - pr(t, st.pinAt, 0.3, eo)) * -180;
          const pulse = ((t - st.pinAt) % 0.9) / 0.9;
          return (
            <g transform={`translate(${P.barn.x},${P.barn.y - 40 + drop})`}>
              <circle r={60 + pulse * 220} fill="none" stroke={C.red} strokeWidth={10} opacity={(1 - pulse) * p} />
              <g transform={`scale(${p * 1.7})`}>
                <path d="M0,0 C-30,-40 -40,-60 -40,-80 A40,40 0 1 1 40,-80 C40,-60 30,-40 0,0 Z" fill={C.red} stroke="#1E120C" strokeWidth={4} />
                <circle cy={-80} r={15} fill={C.cream} />
              </g>
            </g>
          );
        })()}
      </svg>
      {/* ruler label (screen space so text stays crisp) */}
      {st.rulerAt !== undefined && t >= st.rulerAt + 0.35 && (() => {
        const mx = left + ((P.barn.x + 40 + 1470) / 2) * s, my = top + ((P.barn.y - 190 + 330) / 2) * s;
        const p = pr(t, st.rulerAt + 0.35, 0.3, eback);
        return (
          <div
            style={{
              position: "absolute",
              left: mx,
              top: my,
              transform: `translate(-50%,-50%) rotate(-28deg) scale(${p})`,
              fontFamily: F_TEXT,
              fontSize: 44,
              background: C.cream,
              color: C.choco,
              padding: "6px 26px 10px",
              borderRadius: 30,
              direction: "rtl",
              whiteSpace: "nowrap",
              boxShadow: "0 8px 20px rgba(0,0,0,.35)",
            }}
          >
            چند صد متر
          </div>
        );
      })()}
      {st.stampAt !== undefined && t >= st.stampAt && (() => {
        const p = pr(t, st.stampAt, 0.22, eback);
        return (
          <div
            style={{
              position: "absolute",
              left: 540,
              top: 760,
              transform: `translate(-50%,-50%) rotate(-7deg) scale(${lerp(1.8, 1, p)})`,
              opacity: clamp(p * 2),
              fontFamily: F_HEAD,
              fontSize: 128,
              color: C.red,
              border: `10px solid ${C.red}`,
              borderRadius: 26,
              padding: "0px 40px 18px",
              background: "rgba(30,18,12,.78)",
              direction: "rtl",
              whiteSpace: "nowrap",
              lineHeight: 1.25,
            }}
          >
            تقریباً غیرممکن
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};

const Easing2 = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
