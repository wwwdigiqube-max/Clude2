import React from "react";
import { Arm, Expr, Mask, MaskKind } from "./chars";
import { Cam, poly, proj, Pt, ST, V3 } from "./a-hall";
import { Glow } from "./fx";
import { boil, lerp, P } from "./theme";

// ================= group A · ink figures standing in the 3D stage (joints in metres, projected each frame) =================

const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const limb = (pts: Pt[], w: number, key: string, col: string = P.ink) =>
  pts.slice(1).map((b, i) => {
    const a = pts[i];
    return (
      <line
        key={`${key}${i}`}
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke={col}
        strokeWidth={Math.max(1.6, (w * (a.k + b.k)) / 2)}
        strokeLinecap="round"
      />
    );
  });
const torso = (hl: Pt, hr: Pt, sl: Pt, sr: Pt, bulge: number) => {
  const ml = { x: (hl.x + sl.x) / 2 - bulge, y: (hl.y + sl.y) / 2 };
  const mr = { x: (hr.x + sr.x) / 2 + bulge, y: (hr.y + sr.y) / 2 };
  const top = { x: (sl.x + sr.x) / 2, y: Math.min(sl.y, sr.y) - Math.abs(sr.x - sl.x) * 0.12 };
  return `M ${hl.x} ${hl.y} Q ${ml.x} ${ml.y} ${sl.x} ${sl.y} Q ${top.x} ${top.y} ${sr.x} ${sr.y} Q ${mr.x} ${mr.y} ${hr.x} ${hr.y} Z`;
};

/** long shadow on the floor, thrown toward the audience by the doorway's backlight (fades out along its length) */
const doorShadow = (cam: Cam, base: V3, len: number, w0: number, w1: number, o: number, id: string) => {
  let dx = base[0] - ST.door.x, dz = base[2] - ST.zBack;
  const n = Math.hypot(dx, dz);
  dx /= n;
  dz /= n;
  const L = Math.max(0.3, Math.min(len, (base[2] - cam.pos[2] - 0.6) / Math.max(0.05, -dz)));
  const px = -dz, pz = dx;
  const tx = base[0] + dx * L, tz = base[2] + dz * L;
  const s = poly(cam, [
    [base[0] + (px * w0) / 2, 0.002, base[2] + (pz * w0) / 2],
    [base[0] - (px * w0) / 2, 0.002, base[2] - (pz * w0) / 2],
    [tx - (px * w1) / 2, 0.002, tz - (pz * w1) / 2],
    [tx + (px * w1) / 2, 0.002, tz + (pz * w1) / 2],
  ]);
  if (!s) return null;
  const p0 = proj(cam, base), p1 = proj(cam, [tx, 0, tz]);
  return (
    <>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y}>
          <stop offset={0} stopColor={P.ink} stopOpacity={o} />
          <stop offset={0.6} stopColor={P.ink} stopOpacity={o * 0.45} />
          <stop offset={1} stopColor={P.ink} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={s} fill={`url(#${id})`} />
    </>
  );
};

/** a mask placed on screen: centre (x, y), height `size`; rot/sy about a neck pivot (pivot = y + pv·size) */
export type MaskPlace = { x: number; y: number; size: number; rot: number; sy: number; pv: number };
export const MaskAt: React.FC<{
  kind: MaskKind;
  pl: MaskPlace;
  f: number;
  expr: Expr;
  mouth?: number;
  glow?: number;
  lit?: number;
  tilt?: number;
  squash?: number;
  opacity?: number;
  blur?: number;
}> = ({ kind, pl, f, expr, mouth = 0, glow = 0, lit = 1, tilt = 0, squash = 0, opacity = 1, blur = 0 }) => {
  const w = (pl.size * 200) / 260;
  return (
    <div
      style={{
        position: "absolute",
        left: pl.x - w / 2,
        top: pl.y - pl.size / 2,
        width: w,
        height: pl.size,
        transform: `rotate(${pl.rot}deg) scaleY(${pl.sy})`,
        transformOrigin: `50% ${50 + pl.pv * 100}%`,
        opacity,
        filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
      }}
    >
      <Mask kind={kind} size={pl.size} f={f} expr={expr} mouth={mouth} glow={glow} lit={lit} tilt={tilt} squash={squash} style={{ display: "block" }} />
    </div>
  );
};
/** screen position of a point given in mask-px offsets from the mask centre, after the MaskAt transform */
export const maskPoint = (pl: MaskPlace, ox: number, oy: number) => {
  const px = pl.x, py = pl.y + pl.pv * pl.size;
  const rx = ox, ry = (oy - pl.pv * pl.size) * pl.sy;
  const a = (pl.rot * Math.PI) / 180;
  return { x: px + rx * Math.cos(a) - ry * Math.sin(a), y: py + rx * Math.sin(a) + ry * Math.cos(a) };
};

/** ink hand + forearm as SVG elements (same build as the shared Arm, but embeddable / blurrable) */
export const handEls = (
  pts: [number, number][],
  angle: number,
  width: number,
  fingers: number,
  spread: number,
  curl: number,
  twitch: number[] = [0, 0, 0, 0],
  col: string = P.ink,
) => {
  const [hx, hy] = pts[pts.length - 1];
  const a0 = (angle * Math.PI) / 180;
  const fp = [-1.5, -0.5, 0.5, 1.5].map((k, i) => {
    const a = a0 + ((k * spread + twitch[i]) * Math.PI) / 180;
    const len = fingers * (i === 0 || i === 3 ? 0.8 : 1);
    const mx = hx + Math.cos(a) * len * 0.55, my = hy + Math.sin(a) * len * 0.55;
    const a2 = a + curl * 0.9 + (twitch[i] * Math.PI) / 360;
    const ex = mx + Math.cos(a2) * len * 0.5, ey = my + Math.sin(a2) * len * 0.5;
    return `M ${hx} ${hy} L ${mx} ${my} L ${ex} ${ey}`;
  });
  const at = a0 - (70 * Math.PI) / 180;
  const thumb = `M ${hx} ${hy} L ${hx + Math.cos(at) * fingers * 0.45} ${hy + Math.sin(at) * fingers * 0.45}`;
  return (
    <g>
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={col} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx={hx} cy={hy} rx={width * 1.3} ry={width} fill={col} transform={`rotate(${angle} ${hx} ${hy})`} />
      {fp.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={col} strokeWidth={width * 0.55} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      <path d={thumb} fill="none" stroke={col} strokeWidth={width * 0.55} strokeLinecap="round" />
    </g>
  );
};

// ---------------- A: standing, hunched toward the camera, hands up ("hello?") ----------------
export const FigureA: React.FC<{ cam: Cam; base: V3; head: V3; f: number }> = ({ cam, base, head, f }) => {
  const J = (v: V3, i: number) => proj(cam, [base[0] + v[0] + boil(f, 500 + i, 0.004), base[1] + v[1] + boil(f, 540 + i, 0.004), base[2] + v[2]]);
  const ftL = J([-0.15, 0, 0.02], 1), ftR = J([0.16, 0, -0.03], 2);
  const toL = J([-0.2, 0.02, -0.1], 3), toR = J([0.21, 0.02, -0.15], 4);
  const knL = J([-0.11, 0.48, -0.05], 5), knR = J([0.12, 0.48, -0.09], 6);
  const hpL = J([-0.075, 0.9, 0], 7), hpR = J([0.075, 0.9, 0], 8);
  const shL = J([-0.15, 1.33, -0.07], 9), shR = J([0.15, 1.34, -0.07], 10);
  const nk = J([0, 1.36, -0.08], 11);
  const elL = J([-0.29, 1.1, -0.14], 12), elR = J([0.29, 1.12, -0.15], 13);
  const wrL = J([-0.23, 1.28, -0.3], 14), wrR = J([0.24, 1.3, -0.31], 15);
  const hd = proj(cam, head);
  const sh = proj(cam, [base[0] + 0.12, 0, base[2] - 0.05]);
  const k = (hpL.k + hpR.k) / 2;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {doorShadow(cam, base, 9, 0.32, 0.9, 0.55, "a-shA")}
        <ellipse cx={sh.x} cy={sh.y} rx={0.5 * sh.k} ry={0.07 * sh.k} fill={P.ink} opacity={0.6} />
        {limb([hpL, knL, ftL, toL], 0.036, "ll")}
        {limb([hpR, knR, ftR, toR], 0.036, "lr")}
        <path d={torso(hpL, hpR, shL, shR, 0.03 * k)} fill={P.ink} />
        {limb([nk, hd], 0.04, "nk")}
      </svg>
      <Arm pts={[[shL.x, shL.y], [elL.x, elL.y], [wrL.x, wrL.y]]} angle={-122 + boil(f, 560, 3)} width={0.026 * wrL.k} fingers={0.11 * wrL.k} spread={16} curl={0.25} />
      <Arm pts={[[shR.x, shR.y], [elR.x, elR.y], [wrR.x, wrR.y]]} angle={-58 + boil(f, 561, 3)} width={0.026 * wrR.k} fingers={0.11 * wrR.k} spread={16} curl={0.25} />
    </>
  );
};

// ---------------- C: slumped against a flat, asleep → wakes ----------------
export type CState = { lift: number; breath: number; shrug: number; sag: number; expr: Expr; glow: number; mouth: number };
export const FigureC: React.FC<{ cam: Cam; base: V3; f: number; st: CState }> = ({ cam, base, f, st }) => {
  const { lift, breath, shrug, sag } = st;
  const J = (v: V3, i: number) => proj(cam, [base[0] + v[0] + boil(f, 600 + i, 0.0035), base[1] + v[1] + boil(f, 640 + i, 0.0035), base[2] + v[2]]);
  const sh = 0.56 + breath * 0.01 + shrug * 0.05 + lift * 0.04 - sag * 0.02;
  const lean = -0.06 + lift * 0.045;
  const slope = (1 - lift) * 0.045; // slumped: his right shoulder (screen-left) hangs lower
  const hpL = J([-0.058, 0.1, -0.02], 1), hpR = J([0.058, 0.1, -0.02], 2);
  const knL = J([-0.13, 0.14, -0.37], 3), anL = J([-0.19, 0.06, -0.7], 4), toL = J([-0.21, 0.16, -0.74], 5);
  const knR = J([0.12, 0.27, -0.33], 6), anR = J([0.16, 0.06, -0.62], 7), toR = J([0.18, 0.16, -0.67], 8);
  const shL = J([lean - 0.115, sh - slope + shrug * 0.012, 0.05], 9), shR = J([lean + 0.105, sh + slope * 0.4 + shrug * 0.012, 0.05], 10);
  const nk = J([lean - 0.005, sh + 0.03, 0.05], 11);
  const elL = J([-0.19 - shrug * 0.06, 0.3 - slope + shrug * 0.06, -0.03], 12), wrL = J([-0.26 - shrug * 0.1, 0.04 + shrug * 0.17, -0.14 - shrug * 0.06], 13);
  const elR = J([0.19 + shrug * 0.06, 0.31 + shrug * 0.06, -0.06], 14), wrR = J([0.26 + shrug * 0.1, 0.04 + shrug * 0.17, -0.18 - shrug * 0.06], 15);
  // head: hanging in front of the chest → up, facing the camera (bobs with the breath while asleep)
  const hv = lerp3([lean + 0.05 + sag * 0.01, sh - 0.035 - sag * 0.06 + breath * 0.006, -0.11 - sag * 0.02], [lean - 0.01, sh + 0.235, 0.0], lift);
  const hd = proj(cam, [base[0] + hv[0], base[1] + hv[1], base[2] + hv[2]]);
  const size = 0.3 * hd.k;
  const pl: MaskPlace = { x: hd.x, y: hd.y, size, rot: lerp(25 + sag * 11, -9, lift), sy: lerp(0.8 - sag * 0.05, 1, lift), pv: 0.42 };
  const k = (hpL.k + hpR.k) / 2;
  const shd = proj(cam, [base[0], 0, base[2] - 0.15]);
  const eyeL = maskPoint(pl, -0.1 * size, -0.1 * size), eyeR = maskPoint(pl, 0.1 * size, -0.1 * size);
  const handAng = (a: number, b: number) => lerp(a, b, shrug);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {doorShadow(cam, [base[0], 0, base[2] - 0.1], 5.5, 0.5, 1.3, 0.5, "a-shC")}
        <ellipse cx={shd.x} cy={shd.y} rx={0.55 * shd.k} ry={0.09 * shd.k} fill={P.ink} opacity={0.55} />
        <path d={torso(hpL, hpR, shL, shR, 0.016 * k)} fill={P.ink} />
        {limb([hpL, knL, anL, toL], 0.034, "ll")}
        {limb([hpR, knR, anR, toR], 0.034, "lr")}
        {limb([nk, hd], 0.03, "nk")}
        {/* rim of the overhead beam on the shoulders and the raised knee */}
        <path
          d={`M ${shL.x} ${shL.y} Q ${(shL.x + shR.x) / 2} ${Math.min(shL.y, shR.y) - Math.abs(shR.x - shL.x) * 0.12} ${shR.x} ${shR.y}`}
          stroke={P.amberHi}
          strokeWidth={Math.max(1.2, 0.011 * k)}
          fill="none"
          strokeLinecap="round"
          opacity={0.55}
        />
        <path d={`M ${lerp(hpR.x, knR.x, 0.55)} ${lerp(hpR.y, knR.y, 0.55) - 0.012 * k} L ${knR.x} ${knR.y - 0.014 * k}`} stroke={P.amberHi} strokeWidth={Math.max(1, 0.009 * k)} strokeLinecap="round" opacity={0.45} />
      </svg>
      <Arm
        pts={[[shL.x, shL.y], [elL.x, elL.y], [wrL.x, wrL.y]]}
        angle={handAng(122, 168) + boil(f, 660, 2)}
        width={Math.max(2, 0.024 * wrL.k)}
        fingers={0.1 * wrL.k}
        spread={14}
        curl={lerp(0.55, 0.15, shrug)}
      />
      <Arm
        pts={[[shR.x, shR.y], [elR.x, elR.y], [wrR.x, wrR.y]]}
        angle={handAng(58, 12) + boil(f, 661, 2)}
        width={Math.max(2, 0.024 * wrR.k)}
        fingers={0.1 * wrR.k}
        spread={14}
        curl={lerp(0.55, 0.15, shrug)}
      />
      <MaskAt kind="C" pl={pl} f={f} expr={st.expr} mouth={st.mouth} glow={st.glow} lit={lerp(0.62, 1, lift)} />
      {st.glow > 0.02 && (
        <>
          <Glow x={eyeL.x} y={eyeL.y} r={size * 0.26} o={Math.min(1, st.glow * 1.6)} color={P.emberHot} />
          <Glow x={eyeR.x} y={eyeR.y} r={size * 0.26} o={Math.min(1, st.glow * 1.6)} color={P.emberHot} />
          <Glow x={eyeL.x} y={eyeL.y} r={size * 0.5} o={st.glow} />
          <Glow x={eyeR.x} y={eyeR.y} r={size * 0.5} o={st.glow} />
          <Glow x={(eyeL.x + eyeR.x) / 2} y={eyeL.y} r={size * 1.3} o={st.glow * 0.45} />
        </>
      )}
    </>
  );
};
