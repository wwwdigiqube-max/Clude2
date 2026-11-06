// V01 · zombie head for the stick-toon rig: lumpy skull, mismatched eyes, stitched scar, jagged mouth.
// Local space like the rig heads: origin = neck (bottom-centre), up = −y. yaw −1..1 slides the features.
import React from "react";
import { INK } from "../styles/stick-toon/rig/body";
import { clamp, hn, smooth, type V } from "../styles/stick-toon/rig/geom";

export const ZFILL = "#8f927c"; // zombie skin / shirt: same olive family, a step darker than BG
export const PALE = "#dcdeca";
const DARK = "#23241e";

export type ZFace = { yaw: number; look: V; open: number; seed: number; up?: number };

const OUTLINE: V[] = [
  [-50, -22], [-56, -70], [-54, -124], [-42, -160], [-18, -184], [12, -186], [38, -170], [54, -138], [57, -86], [52, -36], [36, -4], [0, 2], [-34, -2],
];

export const ZombieHead: React.FC<{ f: ZFace; id: string }> = ({ f, id }) => {
  const yaw = clamp(f.yaw, -1, 1);
  const ox = yaw * 26;
  const k = 1 - Math.abs(yaw) * 0.32; // features squeeze when turned
  const X = (x: number) => ox + x * k;
  const up = (f.up ?? 0) * 10; // features ride up when looking up
  const s = { fill: "none", stroke: INK, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const lookX = clamp(f.look[0], -1, 1), lookY = clamp(f.look[1], -1, 1);
  const out = smooth(OUTLINE.map(([x, y]) => [x + hn(Math.round(x), f.seed) * 1.5, y] as V), true);
  const farHidden = (side: number) => yaw * side < -0.55; // eye on the far side disappears past ¾ view
  const o = clamp(f.open, 0, 1);
  const mY = -58 - up;
  const mouth = smooth(
    [
      [X(-24), mY - 2], [X(-8), mY - 6], [X(10), mY - 5], [X(25), mY - 1],
      [X(20), mY + 6 + o * 22], [X(4), mY + 9 + o * 26], [X(-12), mY + 7 + o * 22],
    ],
    true,
  );
  return (
    <g>
      <clipPath id={`${id}-c`}>
        <path d={out} />
      </clipPath>
      {/* sparse hair */}
      <g {...s} strokeWidth={2.6}>
        <path d={`M${X(-10)} -183 Q${X(-16)} -200 ${X(-26)} -204`} />
        <path d={`M${X(6)} -185 Q${X(10)} -204 ${X(2)} -212`} />
        <path d={`M${X(22)} -178 Q${X(32)} -192 ${X(40)} -190`} />
      </g>
      <path d={out} fill={ZFILL} stroke={INK} strokeWidth={4.2} strokeLinejoin="round" />
      <g clipPath={`url(#${id}-c)`}>
        {/* stitched scar across the forehead */}
        <path d={`M${X(-34)} ${-150 - up} Q${X(-12)} ${-160 - up} ${X(14)} ${-152 - up}`} {...s} strokeWidth={2.6} />
        {[-28, -18, -8, 3].map((x) => (
          <path key={x} d={`M${X(x)} ${-162 - up} L${X(x + 3)} ${-146 - up}`} {...s} strokeWidth={2.2} />
        ))}
        {/* big round eye */}
        {!farHidden(-1) && (
          <g>
            <ellipse cx={X(-21)} cy={-118 - up} rx={17 * k} ry={18} fill={PALE} stroke={INK} strokeWidth={3.4} />
            <circle cx={X(-21) + lookX * 9 * k} cy={-118 - up + lookY * 9} r={3.6} fill={INK} />
            <path d={`M${X(-34)} ${-96 - up} Q${X(-21)} ${-90 - up} ${X(-9)} ${-97 - up}`} {...s} strokeWidth={2.2} />
          </g>
        )}
        {/* small droopy eye */}
        {!farHidden(1) && (
          <g>
            <ellipse cx={X(22)} cy={-114 - up} rx={12 * k} ry={11} fill={PALE} stroke={INK} strokeWidth={3.2} />
            <circle cx={X(22) + lookX * 6 * k} cy={-112 - up + lookY * 5} r={3} fill={INK} />
            <path d={`M${X(8)} ${-118 - up} Q${X(22)} ${-112 - up} ${X(36)} ${-120 - up}`} fill={ZFILL} stroke={INK} strokeWidth={3.4} />
            <path d={`M${X(12)} ${-97 - up} Q${X(22)} ${-93 - up} ${X(32)} ${-98 - up}`} {...s} strokeWidth={2.2} />
          </g>
        )}
        {/* nose holes */}
        <circle cx={X(-3) + yaw * 6} cy={-86 - up} r={2.4} fill={INK} />
        <circle cx={X(6) + yaw * 6} cy={-86 - up} r={2.4} fill={INK} />
        {/* jagged mouth with teeth */}
        <path d={mouth} fill={DARK} stroke={INK} strokeWidth={3.4} strokeLinejoin="round" />
        {[-14, -2, 11].map((x, i) => (
          <path key={x} d={`M${X(x - 4)} ${mY - 4 + (i === 1 ? -1 : 0)} L${X(x)} ${mY + 4 + o * 4} L${X(x + 4)} ${mY - 4}`} fill={PALE} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
        ))}
      </g>
    </g>
  );
};
