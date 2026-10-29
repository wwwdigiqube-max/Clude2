import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import { Mask } from "./chars";
import { mouth, SC, W } from "./cues";
import { Fog, Glow, Motes } from "./fx";
import type { SceneProps } from "./frame";
import { boil, clamp, drift, eio, eo, lerp, P, pr, rnd } from "./theme";
import { Card, DEG, Hand, Limb, Pt, r1, Rays } from "./c-kit";

// ================= «hourglass» — the quiet one's true form =================
// A giant ink HOURGLASS body (the glass pivots on its waist inside the creature's skeleton), C's mask on a short neck,
// long arms in a palms-up shrug, spidery legs. Ember sand pours through the waist. Cards swirl, burst on «قانوناش»,
// and on «عوض» the glass FLIPS 180° (head + skeleton stay upright) — the full bulb is now on top, sand pours the other way.

// ---------- layout (screen px at camera scale 1) ----------
const WX = 540;
const WY = 900; // waist / pivot
const HB = 368; // bulb height
const BB = 335; // bulb half-width at the cap
const CAP = 28;
const HI = HB - 8; // cavity
const BI = BB - 23;
const DIP = 40; // depth of the sand funnel
const OX = 540; // card orbit centre
const OY = 760;
const LX = 540; // backlight centre
const LY = 720;
const CORNER = Math.hypot(BB + 28, HB + CAP);

/** two triangles tip to tip with slightly bulging sides, local coords (waist = 0,0) */
const bulbPath = (b: number, h: number, n: number, nh: number, bulge: number) => {
  const side = (x1: number, y1: number, x2: number, y2: number) => {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    let nx = y2 - y1;
    let ny = x1 - x2;
    const l = Math.hypot(nx, ny);
    nx /= l;
    ny /= l;
    if (nx * mx < 0) {
      nx = -nx;
      ny = -ny;
    }
    return `Q ${r1(mx + nx * bulge)} ${r1(my + ny * bulge)} ${x2} ${y2}`;
  };
  return `M ${-b} ${-h} L ${b} ${-h} ${side(b, -h, n, -nh)} L ${n} ${nh} ${side(n, nh, b, h)} L ${-b} ${h} ${side(-b, h, -n, nh)} L ${-n} ${-nh} ${side(
    -n,
    -nh,
    -b,
    -h,
  )} Z`;
};
const GLASS = bulbPath(BB, HB, 14, 11, 20);
const CAV = bulbPath(BI, HI, 5, 9, 16);
const CAPS = [-1, 1]
  .map((s) => {
    const y0 = s < 0 ? -HB - CAP : HB;
    return `M ${-BB - 28} ${y0 + 10} Q ${-BB - 28} ${y0} ${-BB - 18} ${y0} L ${BB + 18} ${y0} Q ${BB + 28} ${y0} ${BB + 28} ${y0 + 10} L ${BB + 28} ${y0 + CAP - 10} Q ${
      BB + 28
    } ${y0 + CAP} ${BB + 18} ${y0 + CAP} L ${-BB - 18} ${y0 + CAP} Q ${-BB - 28} ${y0 + CAP} ${-BB - 28} ${y0 + CAP - 10} Z`;
  })
  .join(" ");

// glass highlights only on the LEFT walls → after the flip they sit on the right (the turn reads)
const wallLine = (ax: number, ay: number, bx: number, by: number, off: number, u0: number, u1: number) => {
  const L = Math.hypot(bx - ax, by - ay);
  const dx = (bx - ax) / L;
  const dy = (by - ay) / L;
  const nx = ay < by ? dy : -dy; // inward normal
  const ny = ay < by ? -dx : dx;
  const p = (u: number) => `${r1(ax + dx * L * u + nx * off)} ${r1(ay + dy * L * u + ny * off)}`;
  return `M ${p(u0)} L ${p(u1)}`;
};
const HL_A = [wallLine(-BI, -HI, -5, -9, 30, 0.08, 0.6), wallLine(-BI, HI, -5, 9, 30, 0.08, 0.6)];
const HL_B = [wallLine(-BI, -HI, -5, -9, 50, 0.14, 0.38), wallLine(-BI, HI, -5, 9, 50, 0.14, 0.38)];

// ---------- sand (columns, clipped by the cavity) ----------
const dipF = (x: number) => Math.pow(Math.max(0, 1 - Math.abs(x) / 108), 1.6);
const mound = (x: number) => Math.pow(Math.max(0, 1 - Math.abs(x) / (BI * 0.95)), 1.25);
const COLS = Array.from({ length: 41 }, (_, i) => -BB - 12 + (i / 40) * (2 * BB + 24));
const colPoly = (top: (x: number) => number, bot: (x: number) => number) => {
  const T = COLS.map((x) => `${r1(x)},${r1(top(x))}`);
  const B = COLS.map((x) => `${r1(x)},${r1(Math.max(top(x), bot(x)))}`).reverse();
  return `M ${T.join(" L ")} L ${B.join(" L ")} Z`;
};

const FLIPE = Easing.out(Easing.back(0.9));
const FLIPD = 0.55;
const eIn = (v: number) => v * v;
const OPEN = Easing.out(Easing.back(1.5));

// ---------- the swirling cards ----------
const NC = 24;
const CARDS = Array.from({ length: NC }, (_, i) => {
  const r = (k: number) => rnd(i * 13.7 + k * 3.1 + 500);
  return {
    r0: 270 + r(1) * 250,
    ph: r(2) * Math.PI * 2,
    w: 0.55 + r(3) * 0.55,
    yo: -360 + r(5) * 760,
    spin: (r(6) - 0.5) * 240,
    rot0: r(7) * 360,
    fs: 1.4 + r(8) * 2.6,
    fph: r(9) * 6.28,
    suit: Math.floor(r(10) * 6),
    s: 0.72 + r(11) * 0.42,
    burst: 1.55 + r(12) * 1.1,
    wob: r(13) * 6.28,
  };
});

const GlassSil: React.FC = () => (
  <g>
    <path d={GLASS} fill={P.ink} />
    <path d={CAPS} fill={P.ink} />
    {[-1, 1].map((sx) =>
      [-1, 1].map((sy) => <circle key={`${sx}${sy}`} cx={sx * (BB + 28)} cy={sy * (HB + CAP / 2)} r={17} fill={P.ink} />),
    )}
  </g>
);
const GlassDetail: React.FC = () => (
  <g>
    <path d={CAV} fill="url(#c-hg-cav)" />
    {HL_A.map((d, i) => (
      <path key={`a${i}`} d={d} stroke={P.bone} strokeWidth={8} strokeLinecap="round" opacity={0.17} fill="none" />
    ))}
    {HL_B.map((d, i) => (
      <path key={`b${i}`} d={d} stroke={P.bone} strokeWidth={3} strokeLinecap="round" opacity={0.13} fill="none" />
    ))}
    <path d={GLASS} fill="none" stroke={P.amberHi} strokeWidth={3} opacity={0.3} />
    <path d={CAPS} fill="none" stroke={P.amberHi} strokeWidth={2} opacity={0.25} />
  </g>
);

export const SceneHourglass: React.FC<SceneProps> = ({ t, lt, f, dur }) => {
  const T0 = SC.hourglass;
  const T1 = T0 + dur;
  const tRules = W(9, "قانوناش");
  const tFlip = W(9, "عوض");
  const tHow = W(9, "چطوری");
  const tWin = W(9, "ببرین");
  const flip0 = tFlip - 0.04; // the glass starts to turn
  const tFreeze = flip0 - 0.2; // stream breaks during the wind-up
  const tS = flip0 + 0.24; // glass near upright again → sand starts to fall
  const theta = (tt: number) =>
    -7 * eio(clamp((tt - (flip0 - 0.26)) / 0.24)) * (1 - clamp((tt - flip0) / 0.08)) + 180 * FLIPE(clamp((tt - flip0) / FLIPD));
  const th = theta(t);

  // ---------- camera: hard hit on the cut, slow push, jolts on «قانوناش» and when the glass locks ----------
  const hit = 1 - eo(clamp(lt / 0.5));
  const lock = pr(t, flip0 + 0.27, 0.04) * (1 - pr(t, flip0 + 0.31, 0.45));
  const rulesK = pr(t, tRules - 0.02, 0.05) * (1 - pr(t, tRules + 0.03, 0.45));
  const cam = 1 + 0.075 * eio(clamp(lt / dur)) + 0.12 * hit * hit + 0.03 * lock + 0.02 * rulesK;
  const shake = 12 * hit * hit * hit + 8 * lock + 3 * rulesK;
  const camX = boil(f, 3, shake, 1);
  const camY = boil(f, 5, shake, 1) + 7 * lock;

  // ---------- body pose ----------
  const brace = eo(pr(t, flip0 - 0.14, 0.12)) * (1 - eio(pr(t, flip0 + 0.32, 0.5)));
  const dipY = 14 * brace + Math.sin(lt * 2.3) * 3;
  const howK = eo(pr(t, tHow - 0.06, 0.3)) * (1 - 0.55 * eio(pr(t, tWin + 0.35, 0.5)));
  const open = OPEN(clamp((lt - 0.02) / 0.5));
  const sy = 402 + dipY - 12 * howK; // shoulder line
  const cupY = WY - HB - CAP + dipY; // top of the glass cap
  const tilt =
    drift(t, 3, 1.6) - 3 * rulesK - 6 * eo(pr(t, tHow - 0.05, 0.28)) + 10 * eo(pr(t, tWin - 0.04, 0.3)) - 4 * eio(pr(t, tWin + 0.45, 0.5));
  const squash = -0.05 * pr(t, flip0 - 0.05, 0.08) * (1 - pr(t, flip0 + 0.25, 0.3));
  const eyeG = 1 + 0.5 * hit + 0.35 * rulesK + 0.3 * lock + 0.08 * Math.sin(t * 6.3);

  // arms: thrown open on the cut, a bigger shrug on «چطوری»
  const arm = (side: number) => {
    const sh: Pt = [WX + side * 60, sy + 10];
    const el: Pt = [WX + side * (lerp(190, 236, open) + 10 * howK) + boil(f, 20 + side, 1.5), sy + lerp(110, 72, open) - 8 * howK];
    const wr: Pt = [WX + side * (lerp(250, 338, open) + 20 * howK) + boil(f, 24 + side, 1.5), sy + lerp(20, -64, open) - 36 * howK + drift(t, 5 + side, 6)];
    const a = side > 0 ? -16 - 10 * howK - 8 * lock : 196 + 10 * howK + 8 * lock;
    return { sh, el, wr, a };
  };
  const arms = [arm(-1), arm(1)];
  const curl = lerp(1.05, 0.16, open) - 0.12 * lock;

  // legs: spidery, splayed to the bottom corners; they brace for the flip
  const legBase = WY + HB + CAP + 8;
  const legs = [1, -1].flatMap((side) =>
    [
      { hip: [150, 0], knee: [398, -150], ankle: [500, 80], foot: [528, 230], tip: [500, 262], w: 24, s: 1 },
      { hip: [72, 6], knee: [272, -66], ankle: [372, 140], foot: [394, 290], tip: [370, 318], w: 19, s: 2 },
    ].map((l) => {
      const j = (k: number, a: number) => boil(f, l.s * 31 + side * 7 + k, a);
      const tapK = Math.pow(Math.max(0, Math.sin(lt * 2.6 + l.s * 1.9 + side * 0.8)), 10); // a toe lifts now and then
      const pts: Pt[] = [
        [WX + side * l.hip[0], legBase + l.hip[1] + dipY * 0.6],
        [WX + side * (l.knee[0] + 26 * brace) + j(1, 2.5), legBase + l.knee[1] - 12 * brace + dipY * 0.4 + j(2, 2.5)],
        [WX + side * (l.ankle[0] + 10 * brace) + j(3, 2), legBase + l.ankle[1] + j(4, 2)],
        [WX + side * (l.foot[0] + 8 * tapK), legBase + l.foot[1] - 26 * tapK],
        [WX + side * (l.tip[0] + 14 * tapK) + j(5, 3), legBase + l.tip[1] - 34 * tapK],
      ];
      return { pts, w: l.w, key: `${side}-${l.s}` };
    }),
  );

  // ---------- sand ----------
  const preK = clamp((Math.min(t, tFreeze) - T0) / (tFreeze - T0));
  const L1 = HI * lerp(0.6, 0.46, preK);
  const pk1 = HI * lerp(0.3, 0.4, preK);
  const pe1 = HI * lerp(0.06, 0.1, preK);
  const pile1 = (x: number) => pe1 + (pk1 - pe1) * mound(x);
  const post = t >= tS;
  const postK = clamp((t - tS - 0.45) / Math.max(0.1, T1 - tS - 0.45));
  const L2 = HI * lerp(0.72, 0.63, postK);
  const pk2 = HI * lerp(0.1, 0.19, postK);
  const pe2 = HI * lerp(0.025, 0.05, postK);
  const pile2 = (x: number) => pe2 + (pk2 - pe2) * mound(x);
  const qU = (x: number) => eIn(clamp((t - tS - 0.1 * (Math.abs(x) / BI)) / 0.3));
  const qL = (x: number) => eIn(clamp((t - tS - 0.04 * (Math.abs(x) / BI)) / 0.26));
  const upper = !post
    ? colPoly((x) => -L1 + DIP * dipF(x), () => 0)
    : colPoly(
        (x) => lerp(-HI - 30, -L2 + DIP * dipF(x), qU(x)),
        (x) => lerp(-HI + pile1(x), 0, qU(x)),
      );
  const lower = !post
    ? colPoly((x) => HI - pile1(x), () => HI + 30)
    : colPoly(
        (x) => lerp(0, HI - pile2(x), qL(x)),
        (x) => lerp(L1 - DIP * dipF(x), HI + 30, qL(x)),
      );
  const streamO = !post ? 1 - clamp((t - tFreeze) / 0.06) : clamp((t - tS - 0.2) / 0.08);
  const streamEnd = !post ? HI - pk1 : HI - pk2;
  const sandRot = post ? th - 180 : th;

  // ---------- the turn: solid glass + trailing smear + whoosh arcs at the corners ----------
  const SH = 0.85 / 24;
  const thOld = theta(t - SH);
  const speed = Math.abs(th - thOld); // deg per 0.85 frame
  const trails = speed < 2 ? [] : Array.from({ length: 5 }, (_, k) => ({ a: theta(t - ((k + 1) / 5) * SH), o: 0.4 * (1 - k / 5) }));
  const arcO = clamp((speed - 6) / 20);
  const arc = (lx: number, ly: number, a0: number, a1: number) => {
    const R = Math.hypot(lx, ly);
    const b = Math.atan2(ly, lx);
    const p = (a: number): Pt => [WX + Math.cos(b + a * DEG) * R, WY + dipY + Math.sin(b + a * DEG) * R];
    const s = p(a0);
    const e = p(a1);
    return `M ${r1(s[0])} ${r1(s[1])} A ${r1(R)} ${r1(R)} 0 0 ${a1 > a0 ? 1 : 0} ${r1(e[0])} ${r1(e[1])}`;
  };

  // ---------- cards ----------
  const cardAt = (c: (typeof CARDS)[number], tt: number) => {
    const born = 0.3 + 0.7 * eo(clamp((tt - T0) / 0.7));
    const kB = eo(pr(tt, tRules - 0.03, 0.6));
    const relax = eio(pr(tt, tRules + 0.6, 2.6));
    const kick = 1.2 * eo(pr(tt, flip0, 0.8));
    const R = c.r0 * born * (1 + (c.burst - 1) * kB * (1 - 0.5 * relax));
    const ang = c.ph + c.w * (tt - T0) + kB * 0.8 + kick;
    const z = Math.sin(ang);
    const x = OX + Math.cos(ang) * R;
    const y = OY + c.yo * (1 + 0.45 * kB * (1 - 0.5 * relax)) + z * R * 0.2 + Math.sin(tt * 1.3 + c.wob) * 16;
    return {
      x,
      y,
      z,
      rot: c.rot0 + c.spin * (tt - T0) + kB * 220 * Math.sign(c.spin) + kick * 60,
      flip: c.fph + c.fs * (tt - T0) + kB * 3 * Math.PI + kick * 2,
      sc: c.s * (1 + 0.3 * z),
    };
  };
  const cardEls = (front: boolean) =>
    CARDS.flatMap((c, i) => {
      const p = cardAt(c, t);
      if (front !== p.z > 0) return [];
      const q = cardAt(c, t - 1 / 30);
      const fast = Math.hypot(p.x - q.x, p.y - q.y) > 18;
      const dim = front ? 0 : 0.18 + 0.5 * clamp(-p.z);
      const ghosts = fast ? [2 / 72, 1 / 72] : [];
      return [
        ...ghosts.map((d, k) => {
          const g = cardAt(c, t - d);
          return <Card key={`g${i}-${k}`} x={g.x} y={g.y} rot={g.rot} flip={g.flip} s={g.sc} suit={c.suit} dim={dim} o={k === 0 ? 0.16 : 0.32} f={f} seed={i * 9} />;
        }),
        <Card key={`c${i}`} x={p.x} y={p.y} rot={p.rot} flip={p.flip} s={p.sc} suit={c.suit} dim={dim} f={f} seed={i * 9} />,
      ];
    });

  // ---------- head ----------
  const MS = 270;
  const MWd = (MS * 200) / 260;
  const headTop = sy - 24 - MS * 0.985;
  const ex = [MWd * 0.37, MWd * 0.63];
  const ey = MS * 0.4;

  // light
  const flare = 1 + 0.6 * hit + 0.45 * rulesK + 0.3 * lock;
  const bgPush = 1 + (cam - 1) * 0.4;
  const nVert = Math.ceil((legBase + 30 - (sy + 90)) / 40);

  return (
    <AbsoluteFill style={{ background: P.fog, overflow: "hidden" }}>
      {/* backlight + slowly turning rays (less push = parallax) */}
      <AbsoluteFill style={{ transform: `scale(${bgPush})`, transformOrigin: `${LX}px ${LY}px` }}>
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 66% 40% at 50% ${(LY / 1920) * 100}%, ${P.bone} 0%, ${P.amberHi} 27%, ${P.amber} 55%, ${P.sepia} 80%, ${P.fog} 100%)`,
          }}
        />
        <Rays id="hg" cx={LX} cy={LY} n={18} rot={lt * 5 + 8} o={clamp(0.55 * flare, 0, 1)} len={1500} seed={4} />
        <Rays id="hg2" cx={LX} cy={LY} n={9} rot={-lt * 3 + 21} o={clamp(0.35 * flare, 0, 1)} len={1300} seed={9} spread={1.8} />
        <Glow x={LX} y={LY} r={520} o={0.35 * flare} color={P.bone} />
      </AbsoluteFill>

      <AbsoluteFill style={{ transform: `translate(${camX}px, ${camY}px) scale(${cam})`, transformOrigin: "540px 780px" }}>
        <Fog t={t} y={1080} h={360} o={0.2} color={P.amberHi} seed={21} speed={22} />
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <defs>
            <clipPath id="c-hg-clip" clipPathUnits="userSpaceOnUse">
              <path d={CAV} />
            </clipPath>
            <linearGradient id="c-hg-sand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={P.emberHot} />
              <stop offset="0.28" stopColor={P.ember} />
              <stop offset="1" stopColor={P.amber} />
            </linearGradient>
            <linearGradient id="c-hg-cav" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={P.sepia} stopOpacity={0.42} />
              <stop offset="0.35" stopColor={P.fog} stopOpacity={0.22} />
              <stop offset="1" stopColor={P.fog} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* cards behind the body */}
          {cardEls(false)}

          {/* skeleton: spine (seen only while the glass turns) + pelvis + legs */}
          <path d={`M ${WX} ${sy + 60} L ${WX} ${legBase + 30 + dipY}`} stroke={P.ink} strokeWidth={18} strokeLinecap="round" />
          {Array.from({ length: nVert }, (_, i) => (
            <ellipse key={i} cx={WX + boil(f, 60 + i, 1)} cy={sy + 90 + i * 40 + dipY * 0.3} rx={17} ry={8} fill={P.ink} />
          ))}
          <circle cx={WX} cy={WY + dipY} r={30} fill={P.ink} />
          {legs.map((l) => (
            <Limb key={l.key} pts={l.pts} ws={[l.w, l.w * 0.74, l.w * 0.5, l.w * 0.3, 2.5]} />
          ))}
          <ellipse cx={WX} cy={legBase + 4 + dipY * 0.7} rx={170} ry={28} fill={P.ink} />

          {/* whoosh arcs traced by the corners */}
          {arcO > 0.01 && (
            <g stroke={P.amberHi} fill="none" strokeLinecap="round" opacity={0.55 * arcO}>
              {[
                [BB + 28, -HB - CAP],
                [-BB - 28, HB + CAP],
                [-BB - 28, -HB - CAP],
                [BB + 28, HB + CAP],
              ].map(([lx, ly], i) => (
                <path key={i} d={arc(lx, ly, theta(t - SH * 2.2), th)} strokeWidth={i < 2 ? 7 : 4} />
              ))}
              <path d={arc(0, -CORNER * 0.62, theta(t - SH * 2.2), th)} strokeWidth={3} />
              <path d={arc(0, CORNER * 0.62, theta(t - SH * 2.2), th)} strokeWidth={3} />
            </g>
          )}
          {/* the glass: trailing smear, then the solid body at its current angle */}
          {trails
            .slice()
            .reverse()
            .map((tr, k) => (
              <g key={`tr${k}`} transform={`translate(${WX} ${r1(WY + dipY)}) rotate(${tr.a.toFixed(2)})`} opacity={tr.o}>
                <GlassSil />
              </g>
            ))}
          <g transform={`translate(${WX} ${r1(WY + dipY)}) rotate(${th.toFixed(2)})`}>
            <GlassSil />
            <GlassDetail />
          </g>
          {/* sand */}
          <g transform={`translate(${WX} ${r1(WY + dipY)}) rotate(${sandRot.toFixed(2)})`}>
            <g clipPath="url(#c-hg-clip)">
              <path d={upper} fill="url(#c-hg-sand)" />
              <path d={lower} fill="url(#c-hg-sand)" />
              {streamO > 0.01 && (
                <g opacity={streamO}>
                  <path d={`M 0 -4 Q ${boil(f, 70, 3)} ${r1(streamEnd / 2)} ${boil(f, 71, 1.5)} ${r1(streamEnd + 6)}`} stroke={P.ember} strokeWidth={8} fill="none" />
                  <path d={`M 0 -4 L ${boil(f, 71, 1.5)} ${r1(streamEnd + 6)}`} stroke={P.emberHot} strokeWidth={2.5} fill="none" />
                  {Array.from({ length: 8 }, (_, i) => {
                    const u = (t * 2.6 + i / 8) % 1;
                    return <circle key={i} cx={boil(f, 80 + i, 4)} cy={r1(u * streamEnd)} r={2.6} fill={P.emberHot} />;
                  })}
                  {Array.from({ length: 5 }, (_, i) => (
                    <circle key={`sp${i}`} cx={r1(boil(f, 90 + i, 26))} cy={r1(streamEnd - 6 - Math.abs(boil(f, 95 + i, 16)))} r={2.2} fill={P.emberHot} />
                  ))}
                </g>
              )}
              {/* cascade after the flip: grains falling to the waist */}
              {post &&
                t < tS + 0.42 &&
                Array.from({ length: 16 }, (_, i) => {
                  const q = clamp((t - tS - rnd(i + 300) * 0.12) / 0.3);
                  const x0 = (rnd(i + 310) - 0.5) * 2 * BI * 0.7;
                  return (
                    <circle
                      key={`cg${i}`}
                      cx={r1(x0 * (1 - q))}
                      cy={r1(lerp(-HI + 50 + rnd(i + 320) * 80, -12, eIn(q)))}
                      r={3}
                      fill={P.emberHot}
                      opacity={q < 1 ? 0.9 : 0}
                    />
                  );
                })}
            </g>
          </g>

          {/* torso with rib ridges, neck */}
          <path
            d={`M ${WX - 62} ${cupY + 6} L ${WX - 54} ${sy + 46} Q ${WX - 74} ${sy + 4} ${WX - 40} ${sy - 6} L ${WX + 40} ${sy - 6} Q ${WX + 74} ${sy + 4} ${
              WX + 54
            } ${sy + 46} L ${WX + 62} ${cupY + 6} Z`}
            fill={P.ink}
          />
          {[0, 1, 2, 3].map((k) =>
            [-1, 1].map((s) => {
              const cx = WX + s * (58 + k * 1.5) + boil(f, 120 + k * 2 + s, 0.8);
              const cy = sy + 50 + k * ((cupY - sy - 62) / 3.4);
              return <ellipse key={`${k}${s}`} cx={cx} cy={cy} rx={15} ry={5.5} fill={P.ink} transform={`rotate(${s * 24} ${cx} ${cy})`} />;
            }),
          )}
          <rect x={WX - 17} y={sy - 44} width={34} height={46} rx={8} fill={P.ink} />

          {/* arms */}
          {arms.map((a, i) => (
            <g key={i}>
              <Limb pts={[a.sh, a.el, a.wr]} ws={[21, 15, 10]} />
              <Hand
                x={a.wr[0]}
                y={a.wr[1]}
                a={a.a}
                s={98}
                m={i === 0 ? -1 : 1}
                cd={i === 0 ? 1 : -1}
                spread={15 + 4 * howK}
                curl={curl}
                f={f}
                seed={200 + i * 17}
                tw={0.07}
                w={0.08}
              />
            </g>
          ))}
        </svg>

        {/* glows: sand + backlight around the head */}
        <Glow x={WX} y={WY + dipY} r={90} o={0.55 * streamO + 0.25} color={P.ember} />
        {!post && <Glow x={WX} y={WY + dipY + HI - pk1 * 0.5} r={230} o={0.5} color={P.ember} />}
        {!post && <Glow x={WX} y={WY + dipY - L1 * 0.5} r={150} o={0.4} color={P.ember} />}
        {post && <Glow x={WX} y={WY + dipY - L2 * 0.55} r={210} o={0.5 * clamp((t - tS) / 0.3)} color={P.ember} />}
        <Glow x={WX} y={headTop + MS * 0.45} r={240} o={0.3} color={P.amberHi} />

        {/* head */}
        <div style={{ position: "absolute", left: WX - MWd / 2, top: headTop, width: MWd, height: MS, transform: `rotate(${tilt}deg)`, transformOrigin: "50% 92%" }}>
          <Mask
            kind="C"
            size={MS}
            f={f}
            expr="awake"
            glow={1}
            mouth={mouth("C", t)}
            squash={squash}
            lit={0.7 + 0.3 * hit}
            style={{ position: "absolute", left: 0, top: 0 }}
          />
          {ex.map((x, i) => (
            <React.Fragment key={i}>
              <Glow x={x} y={ey} r={110 * eyeG} o={1} color={P.ember} />
              <Glow x={x} y={ey} r={40 * eyeG} o={1} color={P.emberHot} />
            </React.Fragment>
          ))}
        </div>

        {/* cards in front */}
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {cardEls(true)}
        </svg>

        <Motes t={t} x={60} y={160} w={960} h={1300} n={46} seed={7} color={P.amberHi} size={5} />
        <Fog t={t} y={1420} h={440} o={0.55} color={P.sepia} seed={23} speed={18} />
      </AbsoluteFill>

      {/* the hit: bone flash on the cut, smaller pulse on «قانوناش» */}
      <AbsoluteFill style={{ background: P.bone, opacity: clamp(0.92 * Math.pow(hit, 1.6) + 0.22 * rulesK), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
