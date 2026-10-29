import React from "react";
import { boil, clamp, P, rnd } from "./theme";

// ================= group A · a tiny 3D projector + the theatre stage used by «maskA» and «room» =================
// World units are metres: x → right, y → up, z → into the stage (away from the audience).
// Everything here is a pure function of the camera and t (no state, no randomness).

export type V3 = [number, number, number];
export type Cam = { pos: V3; yaw: number; pitch: number; f: number };
export type Pt = { x: number; y: number; z: number; k: number };
export const CX = 540;
export const CY = 960;
const NEAR = 0.12;

/** world → camera space (yaw > 0 turns right, pitch > 0 looks up) */
export const toCam = (c: Cam, p: V3): V3 => {
  const dx = p[0] - c.pos[0];
  const dy = p[1] - c.pos[1];
  const dz = p[2] - c.pos[2];
  const cy = Math.cos(c.yaw), sy = Math.sin(c.yaw);
  const x1 = dx * cy - dz * sy;
  const z1 = dx * sy + dz * cy;
  const cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
  return [x1, dy * cp - z1 * sp, dy * sp + z1 * cp];
};
const toScr = (c: Cam, q: V3): [number, number] => [CX + (c.f * q[0]) / q[2], CY - (c.f * q[1]) / q[2]];
/** project a point; k = pixels per metre at that depth */
export const proj = (c: Cam, p: V3): Pt => {
  const q = toCam(c, p);
  const z = Math.max(q[2], NEAR);
  return { x: CX + (c.f * q[0]) / z, y: CY - (c.f * q[1]) / z, z: q[2], k: c.f / z };
};
const clipNear = (q: V3[]): V3[] => {
  const out: V3[] = [];
  for (let i = 0; i < q.length; i++) {
    const a = q[i], b = q[(i + 1) % q.length];
    const ai = a[2] >= NEAR, bi = b[2] >= NEAR;
    if (ai) out.push(a);
    if (ai !== bi) {
      const k = (NEAR - a[2]) / (b[2] - a[2]);
      out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, NEAR]);
    }
  }
  return out;
};
/** projected polygon (clipped at the near plane) as an SVG points string, or null */
export const poly = (c: Cam, pts: V3[]): string | null => {
  const q = clipNear(pts.map((p) => toCam(c, p)));
  if (q.length < 3) return null;
  return q.map((v) => toScr(c, v).map((n) => n.toFixed(1)).join(",")).join(" ");
};
/** projected segment as an SVG path "M … L …", or null */
export const seg = (c: Cam, a: V3, b: V3): string | null => {
  let qa = toCam(c, a), qb = toCam(c, b);
  if (qa[2] < NEAR && qb[2] < NEAR) return null;
  if (qa[2] < NEAR) [qa, qb] = [qb, qa];
  if (qb[2] < NEAR) {
    const k = (NEAR - qa[2]) / (qb[2] - qa[2]);
    qb = [qa[0] + (qb[0] - qa[0]) * k, qa[1] + (qb[1] - qa[1]) * k, NEAR];
  }
  const A = toScr(c, qa), B = toScr(c, qb);
  return `M ${A[0].toFixed(1)} ${A[1].toFixed(1)} L ${B[0].toFixed(1)} ${B[1].toFixed(1)}`;
};
const hull = (pts: [number, number][]) => {
  const s = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o: [number, number], a: [number, number], b: [number, number]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: [number, number][] = [];
  const up: [number, number][] = [];
  for (const q of s) {
    while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  for (const q of [...s].reverse()) {
    while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
    up.push(q);
  }
  return lo.slice(0, -1).concat(up.slice(0, -1));
};

// ---------- colour: only mixes of the palette ----------
const rgbOf = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex2 = (v: number) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0");
export const mix = (a: string, b: string, k: number) => {
  const A = rgbOf(a), B = rgbOf(b), q = clamp(k);
  return `#${A.map((v, i) => hex2(v + (B[i] - v) * q)).join("")}`;
};
export const HAZE = mix(P.fog, P.sepia, 0.62);
/** aerial perspective: far things melt into the warm haze */
export const haze = (col: string, dist: number, far = 24) => mix(col, HAZE, 1 - Math.exp(-Math.max(0, dist) / far));
const FACE = mix(P.ink, P.fog, 0.22); // front of a flat, in shadow (near-ink silhouette)
const EDGE = mix(P.sepia, P.amber, 0.4); // thickness of a flat, catching the stage light

// ================= the stage: plank floor, receding portals (wings + borders), a tall arched doorway =================
export const ST = {
  hw: 5.4,
  wingH: 16,
  wingT: 0.24,
  portals: [
    { z: 4.6, inL: -3.1, inR: 3.1, border: 8.8 },
    { z: 10.6, inL: -3.25, inR: 3.0, border: 8.6 },
    { z: 16.0, inL: -3.0, inR: 3.2, border: 8.35 },
    { z: 21.4, inL: -3.2, inR: 3.05, border: 8.1 },
    { z: 26.8, inL: -3.05, inR: 3.2, border: 7.9 },
  ],
  zBack: 33,
  door: { x: -0.35, w: 2.3, h: 7.4 },
};

export type FogBand = { z: number; y: number; h: number; w: number; n: number; o: number; col: string; speed: number; seed: number };
/** a fly-line hanging from the dark flies with a sandbag at its end (sways a little) */
export type Rope = { x: number; z: number; y: number; seed: number };
export type Cone = { top: V3; bot: V3; rt: number; rb: number; o: number };
/** a light ellipse lying on the floor (plane "y") or on a flat facing the audience (plane "z") */
export type Patch = { c: V3; rx: number; ry: number; o: number; plane: "y" | "z"; col?: string };

const arch = (x: number, w: number, h: number, z: number): V3[] => {
  const r = w / 2;
  const pts: V3[] = [[x - r, 0, z]];
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI - (i / 16) * Math.PI;
    pts.push([x + Math.cos(a) * r, h - r + Math.sin(a) * r, z]);
  }
  pts.push([x + r, 0, z]);
  return pts;
};

const fogBlobs = (cam: Cam, t: number, b: FogBand, gid: string, key: string) => {
  const span = 2 * ST.hw + 16;
  return (
    <g key={key} style={{ mixBlendMode: "screen" }}>
      {Array.from({ length: b.n }, (_, i) => {
        const r = (k: number) => rnd(b.seed * 53 + i * 11 + k);
        const u = (((r(1) * span + t * b.speed * (0.5 + r(2))) % span) + span) % span;
        const edge = clamp(Math.min(u, span - u) / 3.5);
        const p = proj(cam, [-span / 2 + u, b.y + (r(3) - 0.5) * b.h * 0.5, b.z + (r(4) - 0.5) * 2]);
        if (p.z < 0.6) return null;
        const rx = (b.w * (0.6 + r(5) * 0.7) * p.k) / 2;
        const ry = (b.h * (0.5 + r(6) * 0.6) * p.k) / 2;
        return <ellipse key={i} cx={p.x} cy={p.y} rx={rx} ry={ry} fill={`url(#${gid})`} opacity={b.o * edge * (0.55 + r(7) * 0.45)} />;
      })}
    </g>
  );
};

/**
 * The stage drawn from camera `cam`. layer "back" = floor, back wall, doorway + everything with z ≥ split;
 * layer "front" = only portals / fog with z < split (drawn over the characters).
 */
export const Stage: React.FC<{ cam: Cam; t: number; f: number; id: string; layer: "back" | "front"; split: number; fog?: FogBand[]; ropes?: Rope[] }> = ({
  cam,
  t,
  f,
  id,
  layer,
  split,
  fog = [],
  ropes = [],
}) => {
  const cz = cam.pos[2];
  const base: React.ReactNode[] = [];
  const defs: React.ReactNode[] = [];
  const ahead = (d: number) => proj(cam, [cam.pos[0], 0, cz + d]).y;
  if (layer === "back") {
    const hy = ahead(400);
    // back wall
    const wTop = proj(cam, [0, 18, ST.zBack]).y;
    const wBot = proj(cam, [0, 0, ST.zBack]).y;
    defs.push(
      <linearGradient key="bw" id={`a-${id}-bw`} gradientUnits="userSpaceOnUse" x1={0} y1={wTop} x2={0} y2={wBot}>
        <stop offset={0} stopColor={mix(P.ink, P.fog, 0.3)} />
        <stop offset={0.6} stopColor={mix(P.fog, HAZE, 0.5)} />
        <stop offset={1} stopColor={mix(HAZE, P.sepia, 0.35)} />
      </linearGradient>,
    );
    const bw = poly(cam, [[-40, 0, ST.zBack], [40, 0, ST.zBack], [40, 40, ST.zBack], [-40, 40, ST.zBack]]);
    if (bw) base.push(<polygon key="bw" points={bw} fill={`url(#a-${id}-bw)`} />);
    // the air above the stage glows faintly from the lamps in the flies (behind every flat)
    const ag = proj(cam, [0.4, 9.5, 22]);
    defs.push(
      <radialGradient key="air" id={`a-${id}-air`}>
        <stop offset={0} stopColor={P.amberHi} stopOpacity={0.42} />
        <stop offset={0.4} stopColor={P.amber} stopOpacity={0.2} />
        <stop offset={1} stopColor={P.amber} stopOpacity={0} />
      </radialGradient>,
    );
    if (ag.z > 1) base.push(<ellipse key="air" cx={ag.x} cy={ag.y} rx={11 * ag.k} ry={8 * ag.k} fill={`url(#a-${id}-air)`} style={{ mixBlendMode: "screen" }} />);
    // doorway: lit moulding + glowing opening
    const D = ST.door;
    const frame = poly(cam, arch(D.x, D.w + 0.7, D.h + 0.35, ST.zBack - 0.01));
    if (frame) base.push(<polygon key="dfr" points={frame} fill={haze(EDGE, ST.zBack - cz, 30)} opacity={0.9} />);
    const frame2 = poly(cam, arch(D.x, D.w + 0.3, D.h + 0.15, ST.zBack - 0.015));
    if (frame2) base.push(<polygon key="dfr2" points={frame2} fill={haze(P.fog, ST.zBack - cz, 40)} />);
    defs.push(
      <linearGradient key="door" id={`a-${id}-door`} x1="0" y1="0" x2="0" y2="1">
        <stop offset={0} stopColor={P.amberHi} />
        <stop offset={0.55} stopColor={mix(P.amberHi, P.bone, 0.6)} />
        <stop offset={1} stopColor={P.bone} />
      </linearGradient>,
    );
    const door = poly(cam, arch(D.x, D.w, D.h, ST.zBack - 0.02));
    if (door) base.push(<polygon key="door" points={door} fill={`url(#a-${id}-door)`} />);
    // floor: dark near the audience, warm haze far away
    const yNear = ahead(1.2), y3 = ahead(3), y8 = ahead(8), y18 = ahead(18);
    const span = Math.max(1, yNear - hy);
    const off = (y: number) => clamp((y - hy) / span);
    defs.push(
      <linearGradient key="fl" id={`a-${id}-fl`} gradientUnits="userSpaceOnUse" x1={0} y1={hy} x2={0} y2={yNear}>
        <stop offset={0} stopColor={mix(HAZE, P.sepia, 0.6)} />
        <stop offset={off(y18)} stopColor={mix(P.floor, HAZE, 0.5)} />
        <stop offset={off(y8)} stopColor={mix(P.floor, P.sepia, 0.1)} />
        <stop offset={off(y3)} stopColor={mix(P.floor, P.fog, 0.45)} />
        <stop offset={1} stopColor={mix(P.fog, P.ink, 0.3)} />
      </linearGradient>,
    );
    const fl = poly(cam, [[-ST.hw - 6, 0, cz - 3], [ST.hw + 6, 0, cz - 3], [ST.hw + 6, 0, ST.zBack], [-ST.hw - 6, 0, ST.zBack]]);
    if (fl) base.push(<polygon key="fl" points={fl} fill={`url(#a-${id}-fl)`} />);
    // planks: alternating boards catch a little light, dark seams between them (fade toward the vanishing point)
    defs.push(
      <linearGradient key="pl" id={`a-${id}-pl`} gradientUnits="userSpaceOnUse" x1={0} y1={hy} x2={0} y2={hy + Math.max(80, (y3 - hy) * 0.9)}>
        <stop offset={0} stopColor={P.ink} stopOpacity={0} />
        <stop offset={1} stopColor={P.ink} stopOpacity={0.55} />
      </linearGradient>,
      <linearGradient key="pb" id={`a-${id}-pb`} gradientUnits="userSpaceOnUse" x1={0} y1={hy} x2={0} y2={hy + Math.max(80, (y3 - hy) * 0.9)}>
        <stop offset={0} stopColor={P.amber} stopOpacity={0} />
        <stop offset={1} stopColor={P.amber} stopOpacity={0.09} />
      </linearGradient>,
    );
    const PW = 0.42;
    const planks: string[] = [];
    const boards: React.ReactNode[] = [];
    for (let i = 0, x = -ST.hw - 2; x <= ST.hw + 2.01; x += PW, i++) {
      const s = seg(cam, [x, 0, cz - 2], [x, 0, ST.zBack]);
      if (s) planks.push(s);
      if (i % 2 === 0 || rnd(i * 1.7) > 0.7) {
        const b = poly(cam, [[x, 0, cz - 2], [x + PW, 0, cz - 2], [x + PW, 0, ST.zBack], [x, 0, ST.zBack]]);
        if (b) boards.push(<polygon key={`b${i}`} points={b} fill={`url(#a-${id}-pb)`} opacity={0.6 + rnd(i * 2.3) * 0.8} />);
      }
    }
    // staggered plank ends
    for (let i = 0; i < 60; i++) {
      const x = -ST.hw - 2 + Math.floor(rnd(i * 3.1) * 30) * PW;
      const z = cz + 0.4 + rnd(i * 5.3) * 18;
      const s = seg(cam, [x, 0, z], [x + PW, 0, z]);
      if (s) planks.push(s);
    }
    base.push(<g key="pb">{boards}</g>);
    base.push(<path key="pl" d={planks.join(" ")} stroke={`url(#a-${id}-pl)`} strokeWidth={2.2} fill="none" />);
  }
  // portals + fog, far → near, filtered by layer
  const items: { z: number; el: React.ReactNode }[] = [];
  ST.portals.forEach((p, i) => {
    const inLayer = layer === "back" ? p.z >= split : p.z < split;
    if (!inLayer || p.z < cz + 0.15) return;
    const d = p.z - cz;
    const edge = haze(EDGE, d, 28), rim = haze(P.amber, d, 34);
    // faces fall off into the dark flies above, catch a little bounce from the floor below
    const fid = `a-${id}-ff${i}`;
    const yT = proj(cam, [0, 7, p.z]).y, yB = proj(cam, [0, 0, p.z]).y;
    defs.push(
      <linearGradient key={fid} id={fid} gradientUnits="userSpaceOnUse" x1={0} y1={yT} x2={0} y2={yB}>
        <stop offset={0} stopColor={haze(mix(FACE, P.ink, 0.6), d)} />
        <stop offset={0.7} stopColor={haze(FACE, d)} />
        <stop offset={1} stopColor={haze(mix(FACE, P.sepia, 0.22), d)} />
      </linearGradient>,
    );
    const face = `url(#${fid})`;
    const T = ST.wingT, H = ST.wingH;
    const els: React.ReactNode[] = [];
    for (const s of [-1, 1]) {
      // hand-cut flats: the inner edge boils a hair every other frame
      const xi = (s < 0 ? p.inL : p.inR) + boil(f, i * 7 + s * 3, 0.006 + d * 0.0006), xo = s * (ST.hw + 7);
      if (s * cam.pos[0] < s * xi) {
        const e = poly(cam, [[xi, 0, p.z], [xi, 0, p.z + T], [xi, H, p.z + T], [xi, H, p.z]]);
        if (e) els.push(<polygon key={`e${s}`} points={e} fill={edge} />);
      }
      const fp = poly(cam, [[xi, 0, p.z], [xo, 0, p.z], [xo, H, p.z], [xi, H, p.z]]);
      if (fp) els.push(<polygon key={`f${s}`} points={fp} fill={face} />);
      const rp = poly(cam, [[xi, 0, p.z], [xi + s * 0.05, 0, p.z], [xi + s * 0.05, H, p.z], [xi, H, p.z]]);
      if (rp) els.push(<polygon key={`r${s}`} points={rp} fill={rim} opacity={0.5} />);
      // contact shadow where the flat meets the floor
      const sh = poly(cam, [[xi, 0, p.z - 0.5], [xo, 0, p.z - 0.5], [xo, 0, p.z], [xi, 0, p.z]]);
      if (sh) els.push(<polygon key={`s${s}`} points={sh} fill={P.ink} opacity={0.35} />);
    }
    const by = p.border + boil(f, i * 7 + 40, 0.008 + d * 0.0006);
    if (cam.pos[1] < by) {
      const ue = poly(cam, [[-ST.hw - 7, by, p.z], [ST.hw + 7, by, p.z], [ST.hw + 7, by, p.z + T], [-ST.hw - 7, by, p.z + T]]);
      if (ue) els.push(<polygon key="ue" points={ue} fill={edge} />);
    }
    const bf = poly(cam, [[-ST.hw - 7, by, p.z], [ST.hw + 7, by, p.z], [ST.hw + 7, by + 10, p.z], [-ST.hw - 7, by + 10, p.z]]);
    if (bf) els.push(<polygon key="bf" points={bf} fill={face} />);
    const br = poly(cam, [[-ST.hw - 7, by, p.z], [ST.hw + 7, by, p.z], [ST.hw + 7, by + 0.05, p.z], [-ST.hw - 7, by + 0.05, p.z]]);
    if (br) els.push(<polygon key="br" points={br} fill={rim} opacity={0.45} />);
    items.push({ z: p.z, el: <g key={`p${i}`}>{els}</g> });
  });
  fog.forEach((b, i) => {
    const inLayer = layer === "back" ? b.z >= split : b.z < split;
    if (!inLayer) return;
    const gid = `a-${id}-fg${i}`;
    defs.push(
      <radialGradient key={gid} id={gid}>
        <stop offset={0} stopColor={b.col} stopOpacity={1} />
        <stop offset={0.5} stopColor={b.col} stopOpacity={0.5} />
        <stop offset={1} stopColor={b.col} stopOpacity={0} />
      </radialGradient>,
    );
    items.push({ z: b.z - 0.01, el: fogBlobs(cam, t, b, gid, `fg${i}`) });
  });
  ropes.forEach((r, i) => {
    const inLayer = layer === "back" ? r.z >= split : r.z < split;
    if (!inLayer || r.z < cz + 0.3) return;
    const d = r.z - cz;
    const sway = Math.sin(t * 0.9 + r.seed * 2.1) * 0.05 + Math.sin(t * 2.3 + r.seed) * 0.015;
    const bot: V3 = [r.x + sway, r.y, r.z];
    const s = seg(cam, [r.x, 18, r.z], bot);
    const pb = proj(cam, bot);
    const col = haze(mix(P.ink, P.fog, 0.35), d);
    const bw = 0.2 * pb.k, bh = 0.36 * pb.k;
    items.push({
      z: r.z,
      el: (
        <g key={`rope${i}`}>
          {s && <path d={s} stroke={col} strokeWidth={Math.max(1, 0.022 * pb.k)} fill="none" />}
          <path
            d={`M ${pb.x - bw * 0.3} ${pb.y} L ${pb.x + bw * 0.3} ${pb.y} Q ${pb.x + bw * 0.62} ${pb.y + bh * 0.5} ${pb.x + bw * 0.5} ${pb.y + bh} L ${pb.x - bw * 0.5} ${pb.y + bh} Q ${pb.x - bw * 0.62} ${pb.y + bh * 0.5} ${pb.x - bw * 0.3} ${pb.y} Z`}
            fill={col}
          />
        </g>
      ),
    });
  });
  items.sort((a, b) => b.z - a.z);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>{defs}</defs>
      {base}
      {items.map((it) => it.el)}
    </svg>
  );
};

/** additive light: door bloom + floor spill, cones from the flies, pools/patches. Screen-blended. */
export const StageLight: React.FC<{
  cam: Cam;
  id: string;
  cones: Cone[];
  patches?: Patch[];
  door?: number;
  blur?: number;
  flick?: number;
}> = ({ cam, id, cones, patches = [], door = 1, blur = 14, flick = 1 }) => {
  const D = ST.door;
  const zb = ST.zBack;
  const dc = proj(cam, [D.x, D.h * 0.42, zb]);
  const db = proj(cam, [D.x, 0, zb]);
  const zNear = cam.pos[2] + 0.4;
  const spillN = proj(cam, [D.x, 0, cam.pos[2] + 2.5]);
  const spill = poly(cam, [[D.x - D.w * 0.5, 0, zb], [D.x + D.w * 0.5, 0, zb], [D.x + D.w * 2.4, 0, zNear], [D.x - D.w * 2.4, 0, zNear]]);
  const cone = cones.map((c, i) => {
    const pts: [number, number][] = [];
    for (let j = 0; j < 24; j++) {
      const a = (j / 24) * Math.PI * 2;
      for (const [cc, r] of [[c.top, c.rt], [c.bot, c.rb]] as const) {
        const q = toCam(cam, [cc[0] + Math.cos(a) * r, cc[1], cc[2] + Math.sin(a) * r]);
        if (q[2] > NEAR * 2) pts.push(toScr(cam, q));
      }
    }
    if (pts.length < 3) return null;
    const h = hull(pts);
    const a = proj(cam, c.top), b = proj(cam, c.bot);
    return { i, pts: h.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" "), a, b, o: c.o };
  });
  const patch = patches.map((p, i) => {
    const pts: V3[] = [];
    for (let j = 0; j < 28; j++) {
      const a = (j / 28) * Math.PI * 2;
      pts.push(p.plane === "y" ? [p.c[0] + Math.cos(a) * p.rx, p.c[1], p.c[2] + Math.sin(a) * p.ry] : [p.c[0] + Math.cos(a) * p.rx, p.c[1] + Math.sin(a) * p.ry, p.c[2]]);
    }
    return { i, s: poly(cam, pts), o: p.o, col: p.col ?? P.amber };
  });
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", mixBlendMode: "screen", pointerEvents: "none" }}>
      <defs>
        <radialGradient id={`a-${id}-dg`}>
          <stop offset={0} stopColor={P.amberHi} stopOpacity={0.75} />
          <stop offset={0.25} stopColor={P.amber} stopOpacity={0.38} />
          <stop offset={1} stopColor={P.amber} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`a-${id}-sp`} gradientUnits="userSpaceOnUse" x1={0} y1={db.y} x2={0} y2={spillN.y}>
          <stop offset={0} stopColor={P.amberHi} stopOpacity={0.6} />
          <stop offset={0.12} stopColor={P.amber} stopOpacity={0.34} />
          <stop offset={0.5} stopColor={P.amber} stopOpacity={0.16} />
          <stop offset={1} stopColor={P.amber} stopOpacity={0.05} />
        </linearGradient>
        <radialGradient id={`a-${id}-pool`}>
          <stop offset={0} stopColor={P.amberHi} stopOpacity={0.85} />
          <stop offset={0.45} stopColor={P.amber} stopOpacity={0.42} />
          <stop offset={1} stopColor={P.amber} stopOpacity={0} />
        </radialGradient>
        <filter id={`a-${id}-cb`} filterUnits="userSpaceOnUse" x={-80} y={-80} width={1240} height={2080}>
          <feGaussianBlur stdDeviation={blur} />
        </filter>
        {cone.map((c) =>
          c ? (
            <linearGradient key={c.i} id={`a-${id}-c${c.i}`} gradientUnits="userSpaceOnUse" x1={c.a.x} y1={c.a.y} x2={c.b.x} y2={c.b.y}>
              <stop offset={0} stopColor={P.amberHi} stopOpacity={c.o * flick} />
              <stop offset={0.6} stopColor={P.amberHi} stopOpacity={c.o * 0.72 * flick} />
              <stop offset={1} stopColor={P.amber} stopOpacity={c.o * 0.55 * flick} />
            </linearGradient>
          ) : null,
        )}
      </defs>
      {door > 0 && <circle cx={dc.x} cy={dc.y} r={D.h * 1.25 * dc.k} fill={`url(#a-${id}-dg)`} opacity={door} />}
      {door > 0 && spill && <polygon points={spill} fill={`url(#a-${id}-sp)`} opacity={door} />}
      {patch.map((p) => (p.s ? <polygon key={`pt${p.i}`} points={p.s} fill={`url(#a-${id}-pool)`} opacity={p.o * flick} /> : null))}
      <g filter={`url(#a-${id}-cb)`}>{cone.map((c) => (c ? <polygon key={c.i} points={c.pts} fill={`url(#a-${id}-c${c.i})`} /> : null))}</g>
    </svg>
  );
};
