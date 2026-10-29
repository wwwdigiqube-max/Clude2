import React from "react";
import { add, ik, limbPath, pt, rot, smooth, type V } from "./geom";

export const BG = "#a7aa94";
export const INK = "#141511";
export const LW = 4.4; // body line weight (720-space)

export type Dims = {
  Lt: number; // pelvis → neck
  tw: number; // torso width
  hip: number;
  l1: number;
  l2: number; // thigh / shin
  a1: number;
  a2: number; // upper / fore arm
  shY: number; // shoulder drop from neck
  shoe: number; // shoe half-width
  hand: number; // hand blob radius
};

export type Pose = {
  pelvis: V;
  lean: number; // deg, around pelvis
  sq: number; // torso squash/stretch (1 = rest)
  fx: number; // -1..1 which way the belly faces
  footL: V;
  footR: V;
  kneeL: number;
  kneeR: number; // ±1 bend side
  handL: V;
  handR: V;
  elbL: number;
  elbR: number;
  toeL?: number;
  toeR?: number; // shoe rotation deg
};

export type Rig = ReturnType<typeof solve>;

export function solve(p: Pose, d: Dims) {
  const L = d.Lt * p.sq;
  const wx = d.tw / 2 / Math.sqrt(p.sq);
  const W = (l: V): V => add(p.pelvis, rot(l, p.lean));
  const hipL = W([-d.hip, -4]);
  const hipR = W([d.hip, -4]);
  const shL = W([-5 + p.fx * 4, -L + d.shY]);
  const shR = W([5 + p.fx * 4, -L + d.shY]);
  const kneeL = ik(hipL, p.footL, d.l1, d.l2, p.kneeL);
  const kneeR = ik(hipR, p.footR, d.l1, d.l2, p.kneeR);
  const elbL = ik(shL, p.handL, d.a1, d.a2, p.elbL);
  const elbR = ik(shR, p.handR, d.a1, d.a2, p.elbR);
  const f = p.fx;
  const torsoLocal: V[] = [
    [0, -L],
    [f * wx * 0.6, -L * 0.8],
    [f * wx * 1.05, -L * 0.36],
    [f * wx * 0.72, -L * 0.03],
    [f * wx * 0.05, L * 0.06],
    [-f * wx * 0.55, -L * 0.04],
    [-f * wx * 0.62 - (1 - Math.abs(f)) * wx * 0.4, -L * 0.48],
    [-f * wx * 0.3 - (1 - Math.abs(f)) * wx * 0.25, -L * 0.88],
  ];
  const torso = smooth(torsoLocal.map(W), true);
  const neck = W([0, -L + 6]);
  return { p, d, hipL, hipR, shL, shR, kneeL, kneeR, elbL, elbR, torso, neck, L };
}

const Shoe: React.FC<{ at: V; fx: number; r: number; toe: number }> = ({ at, fx, r, toe }) => {
  const off = fx * r * 0.28;
  return (
    <path
      transform={`translate(${pt(at)}) rotate(${toe})`}
      d={`M${off - r} 19 C${off - r} -12 ${off - r * 0.5} -13 ${off} -13 C${off + r * 0.55} -13 ${off + r} -10 ${off + r} 19 Z`}
      fill={BG}
      stroke={INK}
      strokeWidth={LW}
      strokeLinejoin="round"
    />
  );
};

export const Legs: React.FC<{ r: Rig }> = ({ r }) => (
  <g fill="none" stroke={INK} strokeWidth={LW} strokeLinecap="round">
    <path d={limbPath(r.hipL, r.kneeL, r.p.footL, 0.97)} />
    <path d={limbPath(r.hipR, r.kneeR, r.p.footR, 0.97)} />
    <Shoe at={r.p.footL} fx={r.p.fx} r={r.d.shoe} toe={r.p.toeL ?? 0} />
    <Shoe at={r.p.footR} fx={r.p.fx} r={r.d.shoe} toe={r.p.toeR ?? 0} />
  </g>
);

export const Torso: React.FC<{ r: Rig }> = ({ r }) => (
  <path d={r.torso} fill={BG} stroke={INK} strokeWidth={LW} strokeLinejoin="round" />
);

export const Arm: React.FC<{ r: Rig; side: "L" | "R" }> = ({ r, side }) => {
  const s = side === "L" ? r.shL : r.shR;
  const e = side === "L" ? r.elbL : r.elbR;
  const h = side === "L" ? r.p.handL : r.p.handR;
  return (
    <g>
      <path d={limbPath(s, e, h, 0.85)} fill="none" stroke={INK} strokeWidth={LW} strokeLinecap="round" />
      <circle cx={h[0]} cy={h[1]} r={r.d.hand} fill={INK} />
    </g>
  );
};

/** Places a head (drawn in local space, origin = bottom-centre, up = −y) on the neck. */
export const HeadMount: React.FC<{ r: Rig; tilt: number; children: React.ReactNode }> = ({ r, tilt, children }) => (
  <g transform={`translate(${pt(r.neck)}) rotate(${r.p.lean + tilt})`}>{children}</g>
);
