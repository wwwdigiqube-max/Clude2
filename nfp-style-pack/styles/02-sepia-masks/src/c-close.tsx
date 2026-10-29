import React from "react";
import { AbsoluteFill } from "remotion";
import { Mask } from "./chars";
import { mouth, SC, W, WE } from "./cues";
import { Glow, Motes } from "./fx";
import type { SceneProps } from "./frame";
import { boil, clamp, drift, eio, eo, lerp, P, pr } from "./theme";
import { Card, DEG, Hand, Limb, Pt, r1, Rays } from "./c-kit";

// ================= «hourglassClose» — C's glowing face, the fan of rules, and a far bigger hand that rewrites one =================
const MS = 620; // mask size
const MWd = (MS * 200) / 260;
const MX = 540;
const MT = 160; // mask top
const PIV: Pt = [540, 1292]; // fan pivot (where C holds the cards)
const FR = 202;
const CS = 1.72; // card scale (≈172 × 241 px)
const FAN = [1, 3, 0, 2, 4, 5, 1]; // suits; #4 (the hourglass card — his card) is the one that gets rewritten
const TGT = 4;
const MARK: Pt[] = [
  [-30, -46],
  [24, -32],
  [-26, -12],
  [28, 2],
  [-22, 20],
  [22, 36],
  [-6, 50],
];
const MARK_C = MARK.reduce<number[]>((acc, p, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + Math.hypot(p[0] - MARK[i - 1][0], p[1] - MARK[i - 1][1]));
  return acc;
}, []);
const MARK_LEN = MARK_C[MARK_C.length - 1];
const markAt = (p: number): Pt => {
  const s = clamp(p) * MARK_LEN;
  for (let i = 1; i < MARK.length; i++)
    if (s <= MARK_C[i]) {
      const u = (s - MARK_C[i - 1]) / (MARK_C[i] - MARK_C[i - 1]);
      return [lerp(MARK[i - 1][0], MARK[i][0], u), lerp(MARK[i - 1][1], MARK[i][1], u)];
    }
  return MARK[MARK.length - 1];
};
const MARK_D = `M ${MARK.map((p) => p.join(" ")).join(" L ")}`;

type CardPose = { x: number; y: number; rot: number };
const toWorld = (c: CardPose, u: Pt): Pt => {
  const a = c.rot * DEG;
  return [c.x + (u[0] * Math.cos(a) - u[1] * Math.sin(a)) * CS, c.y + (u[0] * Math.sin(a) + u[1] * Math.cos(a)) * CS];
};

// the other hand: a massive pointing hand (fist, thumb, one long jointed finger with a nail = the pen).
// Local coords: the nail tip at (0,0), the finger points +y; the fist sits on the +x side, the forearm goes up (-y).
const GiantHand: React.FC<{ x: number; y: number; rot: number; s: number; color: string; f: number }> = ({ x, y, rot, s, color, f }) => {
  const j = (k: number) => boil(f, 950 + k, 2.5);
  const idx: Pt[] = [
    [0, -58],
    [6 + j(1), -245],
    [-4 + j(2), -432],
    [0, -640],
  ];
  const thumb: Pt[] = [
    [-48, -960],
    [-120 + j(3), -850],
    [-106 + j(4), -742],
    [-42, -690],
  ];
  return (
    <g transform={`translate(${r1(x)} ${r1(y)}) rotate(${r1(rot)}) scale(${s})`} fill={color}>
      <Limb pts={[[132, -940], [150, -1700], [172, -2700]]} ws={[330, 360, 390]} knobs={false} color={color} />
      <rect x={-56} y={-1004} width={382} height={364} rx={78} />
      <circle cx={274} cy={-648} r={56} />
      <circle cx={188} cy={-622} r={60} />
      <circle cx={100} cy={-628} r={58} />
      <Limb pts={thumb} ws={[94, 88, 72, 54]} color={color} />
      <Limb pts={idx} ws={[46, 66, 78, 98]} color={color} />
      <path d="M -19 -64 Q -15 -22 2 0 Q 13 -30 19 -64 Z" />
    </g>
  );
};

export const SceneHourglassClose: React.FC<SceneProps> = ({ t, lt, f, dur }) => {
  const T1 = SC.hourglassClose + dur;
  const tFirst = W(10, "اونم");
  const tWhen = W(10, "وقتی");
  const tRules = W(10, "قانون‌ها");
  const tOne = W(10, "یکی");
  const tElse = W(10, "دیگه");
  const tWr = W(10, "می‌نویسه");
  const tWrE = WE(10, "می‌نویسه");

  // ---------- the other hand: its shadow creeps in on «رو», the hand lands on «یکی», taps on «دیگه», writes on «می‌نویسه» ----------
  const inK = eo(pr(t, tOne - 0.16, 0.5));
  const preShadow = eio(pr(t, tOne - 0.45, 0.4));
  const tap = pr(t, tElse - 0.02, 0.06) * (1 - pr(t, tElse + 0.06, 0.2));
  const wp = clamp((t - tWr) / (tWrE - tWr));
  const lift = eio(pr(t, tWrE + 0.02, 0.35));
  const present = t > tOne - 0.2;

  // camera: slow push; a bump when the hand arrives
  const arrive = pr(t, tOne + 0.2, 0.05) * (1 - pr(t, tOne + 0.25, 0.35));
  const cam = 1 + 0.08 * eio(clamp(lt / dur)) + 0.02 * arrive;
  const camX = boil(f, 13, 5 * arrive, 1);
  const camY = boil(f, 14, 5 * arrive, 1) + drift(t, 2, 4);

  // ---------- the fan ----------
  const openK = eo(pr(t, tRules - 0.04, 0.4));
  const spread = lerp(9.5, 12.5, openK);
  const raise = 32 * eo(pr(t, tRules + 0.1, 0.35)) - 10 * tap;
  const riffle = (i: number) => 3.5 * Math.sin(clamp((t - tRules - i * 0.035) / 0.22) * Math.PI);
  const poses: CardPose[] = FAN.map((_, i) => {
    const a = (i - 3) * spread + riffle(i) + boil(f, 300 + i, 0.25);
    const R = FR + (i === TGT ? raise : 0);
    return { x: PIV[0] + Math.sin(a * DEG) * R, y: PIV[1] - Math.cos(a * DEG) * R, rot: a };
  });
  const order = [0, 1, 2, 3, 5, 6, TGT];
  const target = poses[TGT];

  // the nail tip in world coords (it follows the scrawl while writing); the hand swoops in from the top-right
  const hover = 1 - pr(t, tElse - 0.08, 0.1); // the nail hovers just above the card until «دیگه»
  const tipC = toWorld(target, present ? markAt(wp) : MARK[0]);
  const realTip: Pt = [tipC[0] + 620 * (1 - inK) + 50 * lift + 14 * hover, tipC[1] - 900 * (1 - inK) - 80 * lift - 28 * hover];
  const handRot = 22 + 14 * (1 - inK) + 3 * lift + boil(f, 960, 0.4);

  // ---------- C ----------
  const startle = eo(pr(t, tOne - 0.1, 0.12)) * (1 - 0.6 * eio(pr(t, tOne + 0.4, 0.6)));
  const up = eo(pr(t, tOne - 0.1, 0.07));
  const down = eo(pr(t, tWr, 0.18));
  const look: Pt = [lerp(lerp(drift(t, 4, 1.2), 3.4, up), 1.2, down), lerp(lerp(drift(t, 6, 1), -5.4, up), 4.8, down)];
  const tilt =
    drift(t, 1, 1.4) - 3 * startle + 2.5 * eio(pr(t, tWr, 0.4)) + 3 * eo(pr(t, tWhen, 0.3)) * (1 - eio(pr(t, tRules - 0.1, 0.4))) - 1.5 * eo(pr(t, tRules, 0.3));
  const lean = eo(pr(t, tFirst, 0.45)) * (1 - eio(pr(t, tOne - 0.3, 0.4))); // leans in to tell the secret
  const nod = Math.sin(clamp((t - tRules) / 0.36) * Math.PI);
  const headY = MT - 10 * startle + 10 * lean + 7 * nod + Math.sin(lt * 2.1) * 2;
  const lit = 1 - 0.38 * eio(pr(t, tOne - 0.12, 0.4));
  const dimP = clamp((t - (T1 - 0.6)) / 0.6);
  const dim = 0.9 * dimP * dimP * dimP;
  const eyeG = 1 + 0.25 * startle + 0.07 * Math.sin(t * 5.7);
  const m = mouth("C", t);
  const sq = -0.03 * startle;

  // C's hands holding the fan, long fingers draped over the card faces
  const holdHand = (side: number) => {
    const wr: Pt = [PIV[0] + side * 152 + boil(f, 50 + side, 1.2), PIV[1] - 8 + boil(f, 52 + side, 1.2)];
    const el: Pt = [PIV[0] + side * 340, PIV[1] + 250];
    const sh: Pt = [PIV[0] + side * 520, PIV[1] + 720];
    const drum = Math.max(0, Math.sin(clamp((t - tWhen) / 0.45) * Math.PI * 3)) * 0.3;
    return { wr, el, sh, a: side < 0 ? -64 : 244, curl: 0.38 + (side < 0 ? drum : 0) + 0.12 * startle, side };
  };
  const hands = [holdHand(-1), holdHand(1)];

  const eyeX = [MWd * 0.37, MWd * 0.63];
  const eyeY = MS * 0.4;
  const markW = toWorld(target, [0, 0]);
  const headBox: React.CSSProperties = { position: "absolute", left: MX - MWd / 2, top: headY, width: MWd, height: MS, transform: `rotate(${tilt}deg)`, transformOrigin: "50% 85%" };

  return (
    <AbsoluteFill style={{ background: P.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${camX}px, ${camY}px) scale(${cam})`, transformOrigin: "540px 660px" }}>
        {/* backlight behind the head (the same light as the reveal, closer) */}
        <div
          style={{
            position: "absolute",
            left: -120,
            top: -120,
            width: 1320,
            height: 2160,
            background: `radial-gradient(ellipse 66% 42% at 50% 29%, ${P.amberHi} 0%, ${P.amber} 30%, ${P.sepia} 60%, ${P.fog} 82%, ${P.ink} 100%)`,
          }}
        />
        <Rays id="cl" cx={540} cy={420} n={16} rot={lt * 4 + 30} o={0.4} len={1300} seed={11} />
        <Motes t={t} x={40} y={160} w={1000} h={1300} n={34} seed={12} color={P.amberHi} size={4} />
        {/* the shadow of something bigger slides over the light before we see it */}
        <div
          style={{
            position: "absolute",
            left: 520 + 420 * (1 - preShadow) - 120 * inK,
            top: -560 + 300 * preShadow,
            width: 900,
            height: 1100,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${P.ink} 0%, ${P.ink}00 68%)`,
            opacity: 0.75 * preShadow,
          }}
        />

        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {/* shoulders + neck */}
          <path
            d={`M -140 1920 C -40 1380 250 1060 474 ${930 + headY - MT} L 474 ${760 + headY - MT} L 606 ${760 + headY - MT} L 606 ${930 + headY - MT} C 830 1060 1120 1380 1220 1920 Z`}
            fill={P.ink}
            stroke={P.amber}
            strokeOpacity={0.4}
            strokeWidth={3}
          />
          {/* C's arms behind the fan */}
          {hands.map((h) => (
            <Limb key={`a${h.side}`} pts={[h.sh, h.el, h.wr]} ws={[46, 32, 22]} />
          ))}
          {/* the fan of cards */}
          {order.map((i) => (
            <Card key={i} x={poses[i].x} y={poses[i].y} rot={poses[i].rot} s={CS} suit={FAN[i]} f={f} seed={400 + i * 11} dim={i === TGT ? 0 : 0.06 + 0.035 * Math.abs(i - 3)}>
              {i === TGT && wp > 0 && (
                <path d={MARK_D} fill="none" stroke={P.ink} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={MARK_LEN} strokeDashoffset={MARK_LEN * (1 - wp)} />
              )}
            </Card>
          ))}
          {/* C's long fingers over the card faces */}
          {hands.map((h) => (
            <Hand
              key={`h${h.side}`}
              x={h.wr[0]}
              y={h.wr[1]}
              a={h.a}
              s={168}
              m={h.side < 0 ? -1 : 1}
              cd={h.side < 0 ? 1 : -1}
              spread={11}
              curl={h.curl}
              f={f}
              seed={600 + h.side * 13}
              tw={0.1}
              w={0.075}
            />
          ))}
        </svg>

        {/* the head */}
        <div style={headBox}>
          <Mask kind="C" size={MS} f={f} expr="awake" glow={1} mouth={m} lit={lit} squash={sq} style={{ position: "absolute", left: 0, top: 0 }} />
        </div>

        {/* the bigger hand: a shadow from above, rim-lit by the backlight */}
        {present && (
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            <defs>
              <filter id="c-cl-soft" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation={2.5} />
              </filter>
              <filter id="c-cl-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation={24} />
              </filter>
            </defs>
            <g filter="url(#c-cl-shadow)" opacity={0.55 * inK} transform="translate(50 70)">
              <GiantHand x={realTip[0]} y={realTip[1]} rot={handRot} s={1} color={P.ink} f={f} />
            </g>
            <g filter="url(#c-cl-soft)">
              <g transform="translate(-6 -5)" opacity={0.8}>
                <GiantHand x={realTip[0]} y={realTip[1]} rot={handRot} s={1} color={P.amberHi} f={f} />
              </g>
              <g opacity={0.97}>
                <GiantHand x={realTip[0]} y={realTip[1]} rot={handRot} s={1} color={P.ink} f={f} />
              </g>
            </g>
          </svg>
        )}

        {/* the light dies */}
        <div style={{ position: "absolute", left: -200, top: -200, width: 1480, height: 2320, background: P.ink, opacity: dim }} />

        {/* glowing things stay lit: the eyes, the fresh mark */}
        <div style={headBox}>
          <svg
            width={MWd}
            height={MS}
            viewBox="0 0 200 260"
            style={{ position: "absolute", left: 0, top: 0, overflow: "visible", transform: `scale(${1 + sq * 0.6}, ${1 - sq})`, transformOrigin: "50% 60%" }}
          >
            {[74, 126].map((cx) => (
              <g key={cx}>
                <circle cx={cx} cy={104} r={11} fill={P.ember} />
                <circle cx={cx + look[0]} cy={104 + look[1]} r={5.6} fill={P.emberHot} />
              </g>
            ))}
          </svg>
          {eyeX.map((x, i) => (
            <React.Fragment key={i}>
              <Glow x={x + look[0] * 2.4} y={eyeY + look[1] * 2.4} r={110 * eyeG} o={0.9} color={P.ember} />
              <Glow x={x + look[0] * 2.4} y={eyeY + look[1] * 2.4} r={40 * eyeG} o={0.85} color={P.emberHot} />
            </React.Fragment>
          ))}
          <Glow x={MWd / 2} y={MS * 0.74} r={90} o={0.5 * m} color={P.ember} />
        </div>
        {wp > 0 && (
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            <g transform={`translate(${r1(target.x)} ${r1(target.y)}) rotate(${r1(target.rot)}) scale(${CS})`}>
              <path d={MARK_D} fill="none" stroke={P.ember} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={MARK_LEN} strokeDashoffset={MARK_LEN * (1 - wp)} />
              <path d={MARK_D} fill="none" stroke={P.emberHot} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={MARK_LEN} strokeDashoffset={MARK_LEN * (1 - wp)} />
            </g>
            {wp < 1 &&
              Array.from({ length: 6 }, (_, i) => (
                <circle key={i} cx={r1(realTip[0] + boil(f, 700 + i, 30, 1))} cy={r1(realTip[1] + boil(f, 710 + i, 24, 1))} r={2.5} fill={P.emberHot} />
              ))}
          </svg>
        )}
        {wp > 0 && <Glow x={markW[0]} y={markW[1]} r={160} o={0.55 * (0.6 + 0.4 * wp)} color={P.ember} />}
        {wp > 0 && wp < 1 && <Glow x={realTip[0]} y={realTip[1]} r={70} o={0.9} color={P.emberHot} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ================= «black2» — only his eyes in the dark: one blink on «هوم؟», a questioning tilt, gone =================
// eye positions = where the close-up leaves them (camera push included) so the cut is seamless
const B2_EYES: Pt[] = [
  [485, 380],
  [618, 380],
];
export const SceneBlack2: React.FC<SceneProps> = ({ t, lt, f, dur }) => {
  const tHm = W(10, "هوم");
  // blink: shut in 2 frames, hold 1, open in 2
  const shut = pr(t, tHm - 0.02, 0.08, eio) * (1 - pr(t, tHm + 0.1, 0.09, eio));
  const open = Math.max(0.06, 1 - shut);
  const tiltK = eo(pr(t, tHm + 0.16, 0.32));
  const rot = 13 * tiltK + boil(f, 5, 0.4);
  const fade = 1 - eio(pr(lt, dur - 0.3, 0.3));
  const swell = 1 + 0.06 * Math.sin(lt * 5) + 0.12 * tiltK;
  const cx = (B2_EYES[0][0] + B2_EYES[1][0]) / 2;
  const cy = B2_EYES[0][1];
  return (
    <AbsoluteFill style={{ background: P.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ opacity: fade, transform: `rotate(${rot}deg) translateY(${-6 * tiltK}px)`, transformOrigin: `${cx}px ${cy}px` }}>
        {B2_EYES.map(([x, y], i) => (
          <Glow key={`g${i}`} x={x} y={y} r={150 * swell * (0.4 + 0.6 * open)} o={0.55} color={P.ember} />
        ))}
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          {B2_EYES.map(([x, y], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={28 * swell} ry={28 * swell * open} fill={P.ember} />
              <ellipse cx={x + 3} cy={y + 10 * open} rx={14 * swell} ry={14 * swell * open} fill={P.emberHot} />
            </g>
          ))}
        </svg>
        {B2_EYES.map(([x, y], i) => (
          <Glow key={`h${i}`} x={x} y={y} r={46 * swell} o={0.8 * open} color={P.emberHot} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
