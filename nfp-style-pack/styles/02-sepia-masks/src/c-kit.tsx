import React from "react";
import { boil, P, rnd } from "./theme";

// ================= group C kit: tapered ink limbs, spidery hands, playing cards, light rays, TV static =================
// Everything here draws INSIDE an <svg> (except Rays / StaticNoise, which are full-frame <svg> layers).
export type Pt = [number, number];
export const DEG = Math.PI / 180;
export const r1 = (n: number) => Math.round(n * 10) / 10;

/** closed outline of a tapered stroke through pts (ws = full width at each point) */
export const taper = (pts: Pt[], ws: number[]): string => {
  const n = pts.length;
  const L: string[] = [];
  const R: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    dx /= l;
    dy /= l;
    const w = ws[Math.min(i, ws.length - 1)] / 2;
    L.push(`${r1(pts[i][0] - dy * w)},${r1(pts[i][1] + dx * w)}`);
    R.push(`${r1(pts[i][0] + dy * w)},${r1(pts[i][1] - dx * w)}`);
  }
  return `M ${L.join(" L ")} L ${R.reverse().join(" L ")} Z`;
};

/** Catmull-Rom resample of a polyline (for smooth limbs); widths are interpolated */
export const smooth = (pts: Pt[], ws: number[], per = 5): [Pt[], number[]] => {
  if (pts.length < 3) return [pts, ws];
  const P2: Pt[] = [];
  const W2: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < per; k++) {
      const u = k / per;
      const u2 = u * u;
      const u3 = u2 * u;
      const c = (j: 0 | 1) =>
        0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3);
      P2.push([c(0), c(1)]);
      W2.push(ws[i] + (ws[i + 1] - ws[i]) * u);
    }
  }
  P2.push(pts[pts.length - 1]);
  W2.push(ws[ws.length - 1]);
  return [P2, W2];
};

/** two-bone IK: elbow position for shoulder s → hand h (bend = ±1 picks the side) */
export const ik = (s: Pt, h: Pt, l1: number, l2: number, bend: number): Pt => {
  const dx = h[0] - s[0];
  const dy = h[1] - s[1];
  const d = Math.max(1, Math.min(Math.hypot(dx, dy), (l1 + l2) * 0.999));
  const a = Math.atan2(dy, dx);
  const c = Math.min(1, Math.max(-1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
  const b = Math.acos(c) * bend;
  return [s[0] + Math.cos(a + b) * l1, s[1] + Math.sin(a + b) * l1];
};

/** an ink limb (arm / leg) with knobbly joints */
export const Limb: React.FC<{ pts: Pt[]; ws: number[]; color?: string; curve?: boolean; knobs?: boolean; opacity?: number }> = ({
  pts,
  ws,
  color = P.ink,
  curve = false,
  knobs = true,
  opacity,
}) => {
  const [p2, w2] = curve ? smooth(pts, ws) : [pts, ws];
  return (
    <g opacity={opacity}>
      <path d={taper(p2, w2)} fill={color} />
      <circle cx={r1(pts[0][0])} cy={r1(pts[0][1])} r={r1(ws[0] * 0.5)} fill={color} />
      {knobs && pts.slice(1, -1).map((p, i) => <circle key={i} cx={r1(p[0])} cy={r1(p[1])} r={r1(ws[i + 1] * 0.64)} fill={color} />)}
    </g>
  );
};

// ---------- spidery hand ----------
export type HandOpts = {
  x: number; // wrist
  y: number;
  a: number; // direction the fingers point (deg, 0 = right, 90 = down)
  s: number; // finger length (px)
  m?: number; // ±1 mirror: thumb on the -v side (v = direction rotated +90°·m)
  spread?: number; // deg between fingers
  curl?: number; // 0 straight … 1.3 fist
  curls?: number[]; // per finger override (index → pinky)
  lens?: number[]; // finger length factors (index → pinky)
  cd?: number; // ±1 screen rotation sense of the curl
  f: number;
  seed: number;
  tw?: number; // twitch (boil) amount on the curl
  color?: string;
  palmL?: number; // palm length / s
  palmW?: number; // knuckle spacing / s
  w?: number; // finger base width / s
  thumb?: number; // thumb bend
  claw?: number; // claw length / s
  claws?: number[]; // per finger claw override (index → pinky)
};

type FingerGeo = { pts: Pt[]; ws: number[]; tip: Pt; ang: number; c: number };
export const handGeo = (o: HandOpts) => {
  const { x, y, s, f, seed } = o;
  const m = o.m ?? 1;
  const cd = o.cd ?? 1;
  const tw = o.tw ?? 0.08;
  const spread = o.spread ?? 13;
  const palmL = o.palmL ?? 0.32;
  const palmW = o.palmW ?? 0.08;
  const fw = (o.w ?? 0.07) * s;
  const claw = (o.claw ?? 0.1) * s;
  const a0 = o.a * DEG;
  const ux = Math.cos(a0);
  const uy = Math.sin(a0);
  const vx = -uy * m;
  const vy = ux * m;
  const lens = o.lens ?? [0.92, 1, 0.94, 0.74];
  const fingers: FingerGeo[] = [-1.5, -0.5, 0.5, 1.5].map((k, i) => {
    const bx = x + ux * s * palmL + vx * k * s * palmW;
    const by = y + uy * s * palmL + vy * k * s * palmW;
    const c = ((o.curls ? o.curls[i] : (o.curl ?? 0.3)) + boil(f, seed + i * 7.3, tw)) * cd;
    let ang = a0 + k * spread * DEG * m + c * 0.25;
    const L = s * lens[i];
    const pts: Pt[] = [[bx, by]];
    let px = bx;
    let py = by;
    [0.45, 0.32, 0.23].forEach((sg, j) => {
      if (j > 0) ang += c * 0.6;
      px += Math.cos(ang) * L * sg;
      py += Math.sin(ang) * L * sg;
      pts.push([px, py]);
    });
    const ca = ang + c * 0.45;
    const cl = o.claws ? o.claws[i] * s : claw;
    return { pts, ws: [fw, fw * 0.8, fw * 0.62, fw * 0.42], tip: [px + Math.cos(ca) * cl, py + Math.sin(ca) * cl], ang: ca, c };
  });
  // thumb (2 segments) on the -v side
  const tb: Pt = [x + ux * s * 0.1 - vx * s * palmW * 1.3, y + uy * s * 0.1 - vy * s * palmW * 1.3];
  let ta = a0 - 52 * DEG * m;
  const t1: Pt = [tb[0] + Math.cos(ta) * s * 0.3, tb[1] + Math.sin(ta) * s * 0.3];
  ta += (o.thumb ?? 0.35) * m + boil(f, seed + 40, (o.tw ?? 0.08) * 0.6);
  const t2: Pt = [t1[0] + Math.cos(ta) * s * 0.22, t1[1] + Math.sin(ta) * s * 0.22];
  const t3: Pt = [t2[0] + Math.cos(ta) * claw * 0.8, t2[1] + Math.sin(ta) * claw * 0.8];
  const k0 = fingers[0].pts[0];
  const k3 = fingers[3].pts[0];
  const palm = `M ${r1(x - vx * s * palmW * 1.15)} ${r1(y - vy * s * palmW * 1.15)} L ${r1(k0[0] - vx * fw * 0.55)} ${r1(k0[1] - vy * fw * 0.55)} L ${r1(
    k3[0] + vx * fw * 0.55,
  )} ${r1(k3[1] + vy * fw * 0.55)} L ${r1(x + vx * s * palmW * 0.9)} ${r1(y + vy * s * palmW * 0.9)} Z`;
  return { fingers, thumb: [tb, t1, t2] as Pt[], thumbTip: t3, palm, fw };
};

const clawPath = (p: Pt, tip: Pt, ang: number, w: number) => {
  const nx = -Math.sin(ang) * w * 0.5;
  const ny = Math.cos(ang) * w * 0.5;
  return `M ${r1(p[0] + nx)} ${r1(p[1] + ny)} L ${r1(tip[0])} ${r1(tip[1])} L ${r1(p[0] - nx)} ${r1(p[1] - ny)} Z`;
};

export const Hand: React.FC<HandOpts> = (o) => {
  const col = o.color ?? P.ink;
  const g = handGeo(o);
  return (
    <g>
      <path d={g.palm} fill={col} />
      <circle cx={r1(o.x)} cy={r1(o.y)} r={r1(g.fw * 1.05)} fill={col} />
      <path d={taper(g.thumb, [g.fw * 1.1, g.fw * 0.85, g.fw * 0.5])} fill={col} />
      <circle cx={r1(g.thumb[1][0])} cy={r1(g.thumb[1][1])} r={r1(g.fw * 0.55)} fill={col} />
      <path d={clawPath(g.thumb[2], g.thumbTip, Math.atan2(g.thumbTip[1] - g.thumb[2][1], g.thumbTip[0] - g.thumb[2][0]), g.fw * 0.5)} fill={col} />
      {g.fingers.map((fg, i) => (
        <g key={i}>
          <path d={taper(fg.pts, fg.ws)} fill={col} />
          <circle cx={r1(fg.pts[1][0])} cy={r1(fg.pts[1][1])} r={r1(fg.ws[1] * 0.62)} fill={col} />
          <circle cx={r1(fg.pts[2][0])} cy={r1(fg.pts[2][1])} r={r1(fg.ws[2] * 0.62)} fill={col} />
          <circle cx={r1(fg.pts[3][0])} cy={r1(fg.pts[3][1])} r={r1(fg.ws[3] * 0.5)} fill={col} />
          <path d={clawPath(fg.pts[3], fg.tip, fg.ang, fg.ws[3])} fill={col} />
        </g>
      ))}
    </g>
  );
};

// ---------- playing cards (generic pips only) ----------
// 0 diamond · 1 heart · 2 spade · 3 club · 4 hourglass · 5 eye     (pip paths live in a -1..1 box)
export const PIP: string[] = [
  "M 0 -1 L 0.72 0 L 0 1 L -0.72 0 Z",
  "M 0 0.95 C -0.25 0.62 -1 0.25 -1 -0.32 C -1 -0.85 -0.32 -1.05 0 -0.55 C 0.32 -1.05 1 -0.85 1 -0.32 C 1 0.25 0.25 0.62 0 0.95 Z",
  "M 0 -1 C 0.25 -0.62 1 -0.25 1 0.22 C 1 0.68 0.42 0.8 0.1 0.45 L 0.3 1 L -0.3 1 L -0.1 0.45 C -0.42 0.8 -1 0.68 -1 0.22 C -1 -0.25 -0.25 -0.62 0 -1 Z",
  "M -0.42 -0.5 A 0.42 0.42 0 1 1 0.42 -0.5 A 0.42 0.42 0 1 1 -0.42 -0.5 Z M -0.9 0.2 A 0.42 0.42 0 1 1 -0.06 0.2 A 0.42 0.42 0 1 1 -0.9 0.2 Z M 0.06 0.2 A 0.42 0.42 0 1 1 0.9 0.2 A 0.42 0.42 0 1 1 0.06 0.2 Z M -0.1 0.2 L 0.1 0.2 L 0.3 1 L -0.3 1 Z",
  "M -0.72 -1 L 0.72 -1 L 0.1 0 L 0.72 1 L -0.72 1 L -0.1 0 Z",
  "M -1 0 Q 0 -0.82 1 0 Q 0 0.82 -1 0 Z",
];

// card back: a lattice of small diamonds (one path)
const BACK_D = Array.from({ length: 5 }, (_, r) =>
  Array.from({ length: r % 2 ? 2 : 3 }, (_, c) => {
    const x = (r % 2 ? -12 : -24) + c * 24;
    const y = -44 + r * 22;
    return Math.abs(y) < 14 && Math.abs(x) < 14 ? "" : `M ${x} ${y - 7} L ${x + 5} ${y} L ${x} ${y + 7} L ${x - 5} ${y} Z`;
  }).join(" "),
).join(" ");

const Pip: React.FC<{ k: number; x: number; y: number; s: number; rot?: number; color?: string }> = ({ k, x, y, s, rot = 0, color = P.ink }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d={PIP[k]} fill={color} />
    {k === 5 && <circle cx={0} cy={0} r={0.34} fill={P.bone} />}
    {k === 5 && <circle cx={0} cy={0} r={0.16} fill={color} />}
  </g>
);

/** a bone playing card, 100×140 local units, centred; flip (rad): cos<0 shows the back */
export const Card: React.FC<{
  x: number;
  y: number;
  rot: number;
  flip?: number;
  s: number;
  suit: number;
  dim?: number;
  o?: number;
  f: number;
  seed: number;
  children?: React.ReactNode;
}> = ({ x, y, rot, flip = 0, s, suit, dim = 0, o = 1, f, seed, children }) => {
  const c = Math.cos(flip);
  const sx = (c < 0 ? -1 : 1) * Math.max(0.04, Math.abs(c));
  const face = c >= 0;
  const j = (k: number) => boil(f, seed + k, 0.7);
  return (
    <g transform={`translate(${r1(x)} ${r1(y)}) rotate(${r1(rot)}) scale(${(sx * s).toFixed(3)} ${s.toFixed(3)})`} opacity={o}>
      <rect x={-50 + j(1)} y={-70 + j(2)} width={100} height={140} rx={9} fill={face ? P.bone : P.ink} stroke={P.ink} strokeWidth={4.5} />
      {face ? (
        <g>
          <rect x={-41} y={-61} width={82} height={122} rx={4} fill="none" stroke={P.boneShade} strokeWidth={2} />
          <Pip k={suit} x={j(3) * 0.5} y={-2} s={23} />
          <Pip k={suit} x={-34} y={-49} s={8} />
          <Pip k={suit} x={34} y={49} s={8} rot={180} />
          <rect x={-38} y={-36} width={8} height={3} fill={P.ink} />
          <rect x={30} y={33} width={8} height={3} fill={P.ink} />
        </g>
      ) : (
        <g>
          <rect x={-40} y={-60} width={80} height={120} rx={5} fill="none" stroke={P.boneShade} strokeWidth={3} />
          <path d={BACK_D} fill={P.sepia} />
          <path d="M 0 -22 L 15 0 L 0 22 L -15 0 Z" fill="none" stroke={P.boneShade} strokeWidth={3} />
          <circle cx={0} cy={0} r={4} fill={P.boneShade} />
        </g>
      )}
      {children}
      {dim > 0.001 && <rect x={-53} y={-73} width={106} height={146} rx={10} fill={P.ink} opacity={dim} />}
    </g>
  );
};

// ---------- light rays (full-frame layer, screen blend) ----------
export const Rays: React.FC<{ id: string; cx: number; cy: number; n: number; rot: number; o: number; len: number; color?: string; seed?: number; spread?: number }> = ({
  id,
  cx,
  cy,
  n,
  rot,
  o,
  len,
  color = P.amberHi,
  seed = 1,
  spread = 1,
}) => {
  const rays = Array.from({ length: n }, (_, i) => {
    const r = (k: number) => rnd(seed * 50 + i * 7 + k);
    return { a: (rot + (i + r(1) * 0.6) * (360 / n)) * DEG, hw: (1.6 + r(2) * 4.8) * spread * DEG, op: o * (0.3 + r(3) * 0.7) };
  });
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, mixBlendMode: "screen", pointerEvents: "none", overflow: "visible" }}>
      <defs>
        <radialGradient id={`c-ray-${id}`} gradientUnits="userSpaceOnUse" cx={cx} cy={cy} r={len}>
          <stop offset="0" stopColor={color} stopOpacity={1} />
          <stop offset="0.3" stopColor={color} stopOpacity={0.6} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      {rays.map((r, i) =>
        [1, 0.6, 0.28].map((wk, k) => (
          <polygon
            key={`${i}-${k}`}
            points={`${cx},${cy} ${r1(cx + Math.cos(r.a - r.hw * wk) * len)},${r1(cy + Math.sin(r.a - r.hw * wk) * len)} ${r1(cx + Math.cos(r.a + r.hw * wk) * len)},${r1(
              cy + Math.sin(r.a + r.hw * wk) * len,
            )}`}
            fill={`url(#c-ray-${id})`}
            opacity={r.op / 2.2}
          />
        )),
      )}
    </svg>
  );
};

// ---------- analogue TV static: real per-pixel snow, new every frame (seeded by f → a pure function of time) ----------
const hexRGB = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const SNOW_LO = hexRGB(P.ink);
const SNOW_HI = hexRGB(P.bone);
export const StaticNoise: React.FC<{ f: number; seed?: number; cell?: number; k?: number; o?: number; style?: React.CSSProperties }> = ({
  f,
  seed = 1,
  cell = 4,
  k = 1.9,
  o = 1,
  style,
}) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const w = Math.round(1080 / cell);
  const h = Math.round(1920 / cell);
  React.useLayoutEffect(() => {
    const c = ref.current;
    const ctx = c ? c.getContext("2d") : null;
    if (!c || !ctx) return;
    const img = ctx.createImageData(w, h);
    const d = img.data;
    let s = ((f + 7) * 2654435761 + seed * 97531) >>> 0 || 1;
    const rand = () => {
      s ^= s << 13;
      s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5;
      s >>>= 0;
      return s / 4294967296;
    };
    for (let y = 0; y < h; y++) {
      const row = (rand() - 0.5) * 0.22; // line-to-line level jitter (analogue look)
      let prev = rand();
      for (let x = 0; x < w; x++) {
        const v = 0.64 * rand() + 0.36 * prev; // a little horizontal smear
        prev = v;
        const L = Math.min(1, Math.max(0, (v - 0.5) * k + 0.5 + row));
        const i = (y * w + x) * 4;
        d[i] = SNOW_LO[0] + (SNOW_HI[0] - SNOW_LO[0]) * L;
        d[i + 1] = SNOW_LO[1] + (SNOW_HI[1] - SNOW_LO[1]) * L;
        d[i + 2] = SNOW_LO[2] + (SNOW_HI[2] - SNOW_LO[2]) * L;
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [f, seed, w, h, k]);
  return <canvas ref={ref} width={w} height={h} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: o, pointerEvents: "none", ...style }} />;
};
