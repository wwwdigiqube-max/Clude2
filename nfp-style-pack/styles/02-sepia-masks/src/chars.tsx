import React from "react";
import { boil, clamp, P, rnd } from "./theme";

// ================= the three masks (shared by every scene — do not redraw them elsewhere) =================
// A = the anxious one: cracked egg mask, teardrop eyes that tilt with emotion, nervous zig-zag mouth.
// B = the bored one: wide round mask, heavy half-lidded eyes, flat mouth, chipped rim.
// C = the quiet one / storyteller: long narrow mask, small round eye holes that GLOW ember when awake, stitched mouth.
// Mask coordinates: viewBox 0 0 200 260 (centre ≈ 100,130). `size` = rendered height in px.
export type MaskKind = "A" | "B" | "C";
export type Expr =
  | "worried" // A default: brows up in the middle, eyes tilted
  | "alarmed" // A: wide round eyes, brows high
  | "annoyed" // A: squinting lids, brows down in the middle
  | "bored" // B default
  | "closed" // eyes closed (sleep / blink)
  | "awake" // C: round eye holes
  | "smirk"; // B: one lid lower + mouth corner up

const EGG: Record<MaskKind, number[]> = {
  // M x0 y0  C (c1x c1y c2x c2y x y) ×4
  A: [100, 6, 160, 6, 194, 70, 194, 140, 194, 210, 152, 254, 100, 254, 48, 254, 6, 210, 6, 140, 6, 70, 40, 6, 100, 6],
  B: [100, 16, 170, 16, 197, 76, 197, 140, 197, 206, 156, 250, 100, 250, 44, 250, 3, 206, 3, 140, 3, 76, 30, 16, 100, 16],
  C: [100, 2, 152, 2, 176, 72, 176, 142, 176, 214, 140, 258, 100, 258, 60, 258, 24, 214, 24, 142, 24, 72, 48, 2, 100, 2],
};
const eggPath = (k: MaskKind, f: number, seed: number, sx = 1, sy = 1, dx = 0, dy = 0) => {
  const a = EGG[k].map((v, i) => (i % 2 === 0 ? (v - 100) * sx + 100 + dx : (v - 130) * sy + 130 + dy) + boil(f, seed + i, 0.9));
  return `M ${a[0]} ${a[1]} C ${a[2]} ${a[3]} ${a[4]} ${a[5]} ${a[6]} ${a[7]} C ${a[8]} ${a[9]} ${a[10]} ${a[11]} ${a[12]} ${a[13]} C ${a[14]} ${a[15]} ${a[16]} ${a[17]} ${a[18]} ${a[19]} C ${a[20]} ${a[21]} ${a[22]} ${a[23]} ${a[24]} ${a[25]} Z`;
};

export const Mask: React.FC<{
  kind: MaskKind;
  size: number; // px height
  f: number; // frame (for the hand-made boil)
  expr?: Expr;
  mouth?: number; // 0..1 open (from cues.mouth)
  glow?: number; // 0..1 (C's eyes)
  tilt?: number; // degrees
  squash?: number; // -0.15..0.15 (stretch on surprise / squash on impact)
  lit?: number; // 0..1 brightness of the bone (0.55 = in shadow)
  style?: React.CSSProperties;
}> = ({ kind, size, f, expr, mouth = 0, glow = 0, tilt = 0, squash = 0, lit = 1, style }) => {
  const e: Expr = expr ?? (kind === "A" ? "worried" : kind === "B" ? "bored" : "awake");
  const seed = kind === "A" ? 11 : kind === "B" ? 37 : 71;
  const m = clamp(mouth);
  const j = (n: number, s: number, amp = 0.8) => n + boil(f, seed + s, amp);
  const ink = P.ink;
  const w = (size * 200) / 260;
  const eyes: React.ReactNode[] = [];
  const brows: React.ReactNode[] = [];
  let mouthEl: React.ReactNode = null;

  if (kind === "A") {
    const tiltDeg = e === "worried" ? 14 : e === "annoyed" ? -10 : 0;
    const ry = e === "alarmed" ? 34 : e === "annoyed" ? 16 : 29;
    const rx = e === "alarmed" ? 25 : 21;
    for (const [cx, sgn] of [[66, 1], [134, -1]] as const) {
      if (e === "closed") {
        eyes.push(<path key={cx} d={`M ${cx - 20} ${j(112, cx)} q 20 12 40 0`} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />);
      } else {
        eyes.push(
          <ellipse key={cx} cx={j(cx, cx)} cy={j(e === "annoyed" ? 116 : 110, cx + 1)} rx={rx} ry={ry} fill={ink} transform={`rotate(${tiltDeg * sgn} ${cx} 110)`} />,
        );
        if (e === "annoyed") eyes.push(<rect key={`l${cx}`} x={cx - 30} y={86} width={60} height={22} fill={P.bone} />);
      }
      // brows: worried = inner end up; annoyed = inner end down; alarmed = both high
      const inner = cx < 100 ? 92 : 108, outer = cx < 100 ? 40 : 160;
      const yIn = e === "worried" ? 64 : e === "annoyed" ? 86 : e === "alarmed" ? 58 : 70;
      const yOut = e === "worried" ? 80 : e === "annoyed" ? 70 : e === "alarmed" ? 62 : 74;
      if (e !== "closed")
        brows.push(<path key={`b${cx}`} d={`M ${j(outer, cx + 5)} ${j(yOut, cx + 6)} L ${j(inner, cx + 7)} ${j(yIn, cx + 8)}`} stroke={ink} strokeWidth={6} strokeLinecap="round" />);
    }
    mouthEl =
      m > 0.06 || e === "alarmed" ? (
        <ellipse cx={j(100, 90)} cy={j(200, 91)} rx={14 + 12 * m} ry={Math.max(e === "alarmed" ? 16 : 4, 4 + 24 * m)} fill={ink} />
      ) : (
        <path
          d={`M 66 ${j(198, 92)} l 11 -7 l 11 7 l 11 -7 l 11 7 l 11 -7 l 11 7`}
          stroke={ink}
          strokeWidth={6}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      );
  } else if (kind === "B") {
    for (const cx of [64, 136]) {
      if (e === "closed") {
        eyes.push(<path key={cx} d={`M ${cx - 24} ${j(116, cx)} q 24 10 48 0`} stroke={ink} strokeWidth={7} fill="none" strokeLinecap="round" />);
      } else {
        const lid = e === "smirk" && cx > 100 ? 8 : 0;
        eyes.push(<path key={cx} d={`M ${cx - 26} ${j(110 + lid, cx)} A 26 20 0 0 0 ${cx + 26} ${j(110 + lid, cx + 1)} Z`} fill={ink} />);
        eyes.push(<path key={`l${cx}`} d={`M ${cx - 30} ${j(108 + lid, cx + 2)} L ${cx + 30} ${j(110 + lid, cx + 3)}`} stroke={ink} strokeWidth={7} strokeLinecap="round" />);
      }
    }
    mouthEl =
      m > 0.06 ? (
        <rect x={j(100 - (26 - 6 * m), 90)} y={j(190 - 9 * m, 91)} width={52 - 12 * m} height={4 + 20 * m} rx={6} fill={ink} />
      ) : (
        <path d={`M 72 ${j(192, 92)} L ${e === "smirk" ? 124 : 128} ${j(e === "smirk" ? 186 : 192, 93)}`} stroke={ink} strokeWidth={7} strokeLinecap="round" />
      );
  } else {
    for (const cx of [74, 126]) {
      if (e === "closed") {
        eyes.push(<path key={cx} d={`M ${cx - 17} ${j(106, cx)} q 17 10 34 0`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />);
      } else {
        eyes.push(<circle key={cx} cx={j(cx, cx)} cy={j(104, cx + 1)} r={12} fill={ink} />);
        if (glow > 0.01) {
          eyes.push(<circle key={`g${cx}`} cx={cx} cy={104} r={11} fill={P.ember} opacity={glow} />);
          eyes.push(<circle key={`h${cx}`} cx={cx} cy={104} r={5} fill={P.emberHot} opacity={glow} />);
        }
      }
    }
    // stitched mouth that splits open when he talks
    const open = 2 + 18 * m;
    mouthEl = (
      <g>
        {m > 0.06 ? (
          <path d={`M 62 192 Q 100 ${192 - open} 138 192 Q 100 ${192 + open} 62 192 Z`} fill={glow > 0.01 ? P.ember : ink} opacity={1} />
        ) : (
          <path d={`M 62 ${j(192, 90)} L 138 ${j(192, 91)}`} stroke={ink} strokeWidth={4} strokeLinecap="round" />
        )}
        {[70, 84, 98, 112, 126].map((x, i) => (
          <path key={x} d={`M ${x} ${j(184 - (m > 0.06 ? open * 0.4 : 0), 95 + i)} L ${x + 4} ${j(200 + (m > 0.06 ? open * 0.4 : 0), 99 + i)}`} stroke={ink} strokeWidth={3.5} strokeLinecap="round" />
        ))}
      </g>
    );
  }

  const specks = Array.from({ length: 14 }, (_, i) => (
    <circle key={i} cx={30 + rnd(seed + i) * 140} cy={30 + rnd(seed + i + 50) * 200} r={1 + rnd(seed + i + 9) * 1.8} fill={i % 3 ? P.boneShade : P.sepia} opacity={0.5} />
  ));
  const crack =
    kind === "A" ? (
      <path d="M 60 20 l 9 22 l -8 14 l 12 20 l -4 10" stroke={ink} strokeWidth={3} fill="none" strokeLinejoin="round" />
    ) : kind === "B" ? (
      <path d="M 164 210 l -12 8 l 5 11 l -9 7" stroke={ink} strokeWidth={3} fill="none" strokeLinejoin="round" />
    ) : null;

  return (
    <svg
      width={w}
      height={size}
      viewBox="0 0 200 260"
      style={{ overflow: "visible", transform: `rotate(${tilt}deg) scale(${1 + squash * 0.6}, ${1 - squash})`, transformOrigin: "50% 60%", ...style }}
    >
      <g style={{ filter: `brightness(${0.35 + 0.65 * lit})` }}>
        <path d={eggPath(kind, f, seed)} fill={P.boneShade} />
        <path d={eggPath(kind, f, seed + 3, 0.93, 0.93, -4, -7)} fill={P.bone} />
        {specks}
        {crack}
        {brows}
        {eyes}
        {mouthEl}
        <path d={eggPath(kind, f, seed)} fill="none" stroke={ink} strokeWidth={8} />
      </g>
    </svg>
  );
};

// ================= limbs: thin ink arms with long spidery fingers (silhouettes) =================
/** an arm through points (screen px) ending in a hand. angle = direction the hand points (deg, 0 = right, 90 = down). */
export const Arm: React.FC<{
  pts: [number, number][];
  angle: number;
  width?: number;
  fingers?: number; // finger length px
  spread?: number; // degrees between fingers
  curl?: number; // 0 straight … 1 claw
  color?: string;
}> = ({ pts, angle, width = 7, fingers = 46, spread = 16, curl = 0.3, color = P.ink }) => {
  const [hx, hy] = pts[pts.length - 1];
  const a0 = (angle * Math.PI) / 180;
  const fingerPaths = [-1.5, -0.5, 0.5, 1.5].map((k, i) => {
    const a = a0 + ((k * spread) * Math.PI) / 180;
    const len = fingers * (i === 0 || i === 3 ? 0.8 : 1);
    const mx = hx + Math.cos(a) * len * 0.55, my = hy + Math.sin(a) * len * 0.55;
    const a2 = a + curl * 0.9 * (k < 0 ? 1 : 1);
    const ex = mx + Math.cos(a2) * len * 0.5, ey = my + Math.sin(a2) * len * 0.5;
    return `M ${hx} ${hy} L ${mx} ${my} L ${ex} ${ey}`;
  });
  // thumb
  const at = a0 - (70 * Math.PI) / 180;
  const thumb = `M ${hx} ${hy} L ${hx + Math.cos(at) * fingers * 0.45} ${hy + Math.sin(at) * fingers * 0.45}`;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx={hx} cy={hy} rx={width * 1.3} ry={width} fill={color} transform={`rotate(${angle} ${hx} ${hy})`} />
      {fingerPaths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeWidth={width * 0.55} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      <path d={thumb} fill="none" stroke={color} strokeWidth={width * 0.55} strokeLinecap="round" />
    </svg>
  );
};

/** a thin tapered ink torso (neck at top) — for seated / slumped bodies */
export const Torso: React.FC<{ x: number; y: number; h: number; w: number; lean?: number; color?: string }> = ({ x, y, h, w, lean = 0, color = P.ink }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
    <path
      d={`M ${x - w * 0.18} ${y} C ${x - w * 0.5 + lean * 0.3} ${y + h * 0.35} ${x - w * 0.55 + lean} ${y + h * 0.8} ${x - w * 0.42 + lean} ${y + h} L ${x + w * 0.42 + lean} ${y + h} C ${x + w * 0.55 + lean} ${y + h * 0.8} ${x + w * 0.5 + lean * 0.3} ${y + h * 0.35} ${x + w * 0.18} ${y} Z`}
      fill={color}
    />
  </svg>
);
