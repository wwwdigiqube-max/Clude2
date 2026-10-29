import React from "react";
import { AbsoluteFill } from "remotion";
import { C, camAt, clamp, eo, Key, lerp, pr, rnd, VH, VW } from "./lib";
import { Tag } from "./ui";

// Cutaway of the farm's water: power pole → electric pump → well shaft → groundwater, pipe to the house.
// power on until `cutAt`; then the cable dies and the water column drains (from `drainAt`).
const CABLE = "M 214 318 C 330 520 470 640 604 724";
const PIPE_UP = "M 640 1560 L 640 738";
const PIPE_HOUSE = "M 640 738 L 980 738";

export const Diagram: React.FC<{
  t: number;
  keys: Key[];
  labels: { well: number; pump: number; power: number };
  cutAt: number;
  drainAt: number;
}> = ({ t, keys, labels, cutAt, drainAt }) => {
  const k = camAt(keys, t);
  const dw = VW * k.z, dh = VH * k.z;
  const left = clamp(VW / 2 - k.x * dw, VW - dw, 0), top = clamp(VH / 2 - k.y * dh, VH - dh, 0);
  const on = t < cutAt;
  const drain = pr(t, drainAt, 1.3, (x) => x * x);
  const waterTop = lerp(738, 1540, drain); // top of the water column in the shaft pipe
  const spark = t >= cutAt && t < cutAt + 0.5;
  const fanA = on ? t * 900 : cutAt * 900 + (1 - Math.exp(-(t - cutAt) * 3)) * 120;
  const map = (x: number, y: number): [number, number] => [left + x * k.z, top + y * k.z];
  const flick = on ? 1 : t < cutAt + 0.35 ? (Math.sin(t * 80) > 0 ? 0.9 : 0.2) : 0;

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#3A2418" }}>
      <svg
        width={VW}
        height={VH}
        style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${left}px,${top}px) scale(${k.z})` }}
      >
        <defs>
          <linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F4D7A3" />
            <stop offset="1" stopColor="#E59A4F" />
          </linearGradient>
          <pattern id="aq" width="60" height="30" patternUnits="userSpaceOnUse" patternTransform={`translate(${(t * 20) % 60},0)`}>
            <rect width="60" height="30" fill="#7E9C98" />
            <path d="M0 15 Q15 5 30 15 T60 15" stroke="#A9C3BC" strokeWidth="4" fill="none" />
          </pattern>
        </defs>
        {/* sky + sun + far hills */}
        <rect width={VW} height={770} fill="url(#dsky)" />
        <circle cx={820} cy={600} r={110} fill="#FBE6BC" opacity={0.85} />
        <path d="M0 700 Q 200 640 420 690 T 820 670 T 1080 690 L1080 770 L0 770 Z" fill="#C98945" />
        <path d="M0 730 Q 260 690 520 730 T 1080 720 L1080 770 L0 770 Z" fill="#B97A3A" />
        {/* soil layers */}
        <rect y={760} width={VW} height={250} fill="#A8692F" />
        <rect y={1000} width={VW} height={250} fill="#8A5428" />
        <rect y={1250} width={VW} height={210} fill="#6B3F20" />
        <rect y={1450} width={VW} height={190} fill="url(#aq)" />
        <rect y={1640} width={VW} height={280} fill="#4A2A16" />
        {Array.from({ length: 70 }, (_, i) => (
          <ellipse key={i} cx={rnd(i) * VW} cy={790 + rnd(i + 50) * 640} rx={6 + rnd(i + 9) * 12} ry={4 + rnd(i + 3) * 7} fill="#5A3319" opacity={0.45} />
        ))}
        {/* grass edge */}
        <rect y={752} width={VW} height={18} fill="#C9934A" />
        {/* well shaft */}
        <rect x={604} y={760} width={72} height={800} fill="#3E2414" />
        <rect x={596} y={760} width={10} height={800} fill="#8C7660" />
        <rect x={674} y={760} width={10} height={800} fill="#8C7660" />
        {/* pipes (empty) */}
        <path d={PIPE_UP} stroke="#4F5A58" strokeWidth={22} fill="none" />
        <path d={PIPE_HOUSE} stroke="#4F5A58" strokeWidth={22} fill="none" />
        {/* water in the pipes */}
        <line x1={640} y1={1560} x2={640} y2={waterTop} stroke={C.water} strokeWidth={12} />
        {drain < 0.15 && <path d={PIPE_HOUSE} stroke={C.water} strokeWidth={12} fill="none" opacity={1 - drain / 0.15} />}
        {on && (
          <>
            <path d={PIPE_UP} stroke="#E8F2EE" strokeWidth={5} fill="none" strokeDasharray="10 40" strokeDashoffset={t * 160} />
            <path d={PIPE_HOUSE} stroke="#E8F2EE" strokeWidth={5} fill="none" strokeDasharray="10 40" strokeDashoffset={-t * 160} />
          </>
        )}
        {/* pump house */}
        <g>
          <rect x={530} y={600} width={220} height={160} fill="#7A5434" />
          <polygon points="510,610 640,540 770,610" fill="#93663F" />
          <rect x={530} y={600} width={220} height={18} fill="#5E3F27" />
        </g>
        {/* pump motor with fan */}
        <g transform="translate(640,724)">
          <circle r={34} fill="#2F3B3A" stroke="#1E120C" strokeWidth={4} />
          <g transform={`rotate(${fanA})`}>
            {[0, 90, 180, 270].map((a) => (
              <rect key={a} x={-4} y={-28} width={8} height={24} fill="#C9D4CF" transform={`rotate(${a})`} />
            ))}
          </g>
          <circle r={6} fill={on ? C.amber : "#555"} />
        </g>
        {/* power pole */}
        <rect x={200} y={250} width={28} height={520} fill="#5A3A22" />
        <rect x={140} y={300} width={150} height={16} fill="#4A2C1A" />
        <path d="M -10 290 Q 80 330 150 304" stroke="#2A1A10" strokeWidth={4} fill="none" />
        <path d="M -10 330 Q 100 360 280 304" stroke="#2A1A10" strokeWidth={4} fill="none" />
        {/* cable to the pump */}
        <path d={CABLE} stroke="#1E120C" strokeWidth={9} fill="none" />
        {on && <path d={CABLE} stroke="#FFD27A" strokeWidth={7} fill="none" strokeDasharray="14 46" strokeDashoffset={-t * 220} />}
        {on && <path d={CABLE} stroke="#FFB347" strokeWidth={22} fill="none" opacity={0.18} />}
        {/* spark at the cut */}
        {spark && (
          <g transform="translate(214,318)">
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2, p = (t - cutAt) / 0.5;
              return (
                <line
                  key={i}
                  x1={Math.cos(a) * 20 * p}
                  y1={Math.sin(a) * 20 * p}
                  x2={Math.cos(a) * (30 + 90 * p)}
                  y2={Math.sin(a) * (30 + 90 * p)}
                  stroke="#FFE7A8"
                  strokeWidth={6 * (1 - p) + 1}
                  strokeLinecap="round"
                />
              );
            })}
            <circle r={40 * (1 - (t - cutAt) / 0.5)} fill="#FFF1C9" opacity={0.9} />
          </g>
        )}
        {/* the house (right edge) with its window light */}
        <g>
          <rect x={960} y={590} width={160} height={170} fill="#B4532F" />
          <polygon points="940,600 1060,520 1180,600" fill="#8C3B24" />
          <rect x={990} y={640} width={50} height={56} fill={flick > 0.5 ? "#FFE1A0" : "#3B2A20"} />
          {flick > 0.5 && <circle cx={1015} cy={668} r={70} fill="#FFD27A" opacity={0.25} />}
        </g>
        {/* water table dims a little when the pump stops */}
        <rect y={1450} width={VW} height={190} fill="#1E120C" opacity={0.25 * drain} />
      </svg>
      {(() => {
        const [wx, wy] = map(680, 930), [px, py] = map(700, 690), [cx, cy] = map(400, 560), [kx, ky] = map(214, 300);
        return (
          <>
            <Tag t={t} t0={labels.well} x={wx + 150} y={Math.min(wy, 1150)} text="چاه" />
            <Tag t={t} t0={labels.pump} x={px + 60} y={py - 40} text="پمپ برقی" />
            <Tag t={t} t0={labels.power} x={cx} y={cy - 30} text="برق" t1={cutAt - 0.05} />
            <Tag t={t} t0={cutAt + 0.05} x={kx + 120} y={ky - 40} text="قطع برق" danger />
          </>
        );
      })()}
      {/* power-loss darkening */}
      <AbsoluteFill style={{ background: "#1E120C", opacity: on ? 0 : 0.28 * eo(clamp((t - cutAt) / 0.4)) }} />
    </AbsoluteFill>
  );
};
