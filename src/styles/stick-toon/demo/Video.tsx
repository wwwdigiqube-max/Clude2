import React from "react";
import { AbsoluteFill, Html5Audio as Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT_TEXT } from "../../../fonts";
import { Arm, BG, HeadMount, INK, Legs, solve, Torso, type Dims, type Pose } from "../rig/body";
import { add, hn, rot, type V } from "../rig/geom";
import { GirlHead, GuyHead } from "../rig/heads";
import { BEAT, END, flight, FPS, FRAMES, girlAt, guyAt } from "./timeline";
import VO from "./vo.json";
import { covered, Drip, Ground, GROUND, Rain, RAIN_FAR, RAIN_MID, RAIN_NEAR, RimDrips, Ripples, shelterOf, Tufts, Umbrella } from "./world";

export const STICK_FPS = FPS;
export const STICK_FRAMES = FRAMES;

const GUY: Dims = { Lt: 150, tw: 60, hip: 7, l1: 84, l2: 84, a1: 64, a2: 64, shY: 22, shoe: 34, hand: 8.5 };
const GIRL: Dims = { Lt: 132, tw: 52, hip: 7, l1: 64, l2: 64, a1: 38, a2: 62, shY: 22, shoe: 32, hand: 8 };

/** Everything about one frame of the world (called for the current frame and for past frames: drips). */
function world(f: number) {
  const g = guyAt(f);
  const w = girlAt(f);
  const fl = flight(f);
  const gr = solve(g.pose, GUY);
  const shelter = shelterOf(g.umb ?? (fl ? null : w.umb));
  const guyTop = add(gr.neck, rot([0, -186], g.pose.lean + g.headTilt));
  let wr = solve(w.pose, GIRL);
  const girlTop0 = add(wr.neck, rot([0, -138], w.pose.lean + w.headTilt));
  const guyWet = !covered(shelter, guyTop);
  const girlWet = !fl && !covered(shelter, girlTop0);
  // she shivers while the rain is on her
  if (girlWet && !fl) {
    const jx = hn(Math.floor(f / 2), 3) * 1.6;
    const jy = hn(Math.floor(f / 2), 5) * 0.8;
    const p: Pose = { ...w.pose, pelvis: add(w.pose.pelvis, [jx, jy]), handL: add(w.pose.handL, [jx, jy]), handR: add(w.pose.handR, [jx, jy]) };
    wr = solve(p, GIRL);
  }
  return { g, w, fl, gr, wr, shelter, guyTop, girlTop: girlTop0, guyWet, girlWet };
}

// ---------------------------------------------------------------------------
const Boil: React.FC<{ seed: number }> = ({ seed }) => (
  <filter id="boil" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.032" numOctaves={1} seed={seed} />
    <feDisplacementMap in="SourceGraphic" scale={2.4} xChannelSelector="R" yChannelSelector="G" />
  </filter>
);
const Grain: React.FC = () => (
  <>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={7} />
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 -0.18" />
    </filter>
    <rect width={720} height={1280} filter="url(#grain)" opacity={0.35} />
  </>
);

/** Drops running off wet hair: spawned on a rhythm, only while that head has been in the rain. */
function hairDrips(f: number, who: "guy" | "girl"): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const P = who === "guy" ? 9 : 11;
  const base = Math.floor(f / P) * P;
  for (let k = 0; k < 4; k++) {
    const t0 = base - k * P;
    if (t0 < 0) continue;
    const age = f - t0;
    const W = world(t0);
    if (who === "guy" ? !W.guyWet : !W.girlWet || W.fl) continue;
    const side = (t0 / P) % 2 ? 1 : -1;
    const r = who === "guy" ? W.gr : W.wr;
    const ang = who === "guy" ? W.g.pose.lean + W.g.headTilt : W.w.pose.lean + W.w.headTilt;
    const from = add(r.neck, rot([side * (who === "guy" ? 58 : 62), who === "guy" ? -40 : -44], ang));
    const y = from[1] + 0.6 * age * age;
    if (y > GROUND) continue;
    out.push(<Drip key={`${who}${t0}`} at={[from[0] + side * age * 0.4, y]} s={0.8} />);
  }
  return out;
}

export const StickVideo: React.FC<{ audio?: boolean }> = ({ audio = false }) => {
  const frame = useCurrentFrame();
  const f = frame - (frame % 2); // characters + rain on twos
  const W = world(f);
  const { g, w, fl, gr, wr, shelter } = W;
  g.face.wet = W.guyWet ? 1 : 0;
  w.face.wet = W.girlWet ? 1 : 0;
  const armBehind = g.pose.handL[0] < 252 && f < END.take + 8;
  const heads: V[] = [];
  if (W.guyWet) heads.push(W.guyTop);
  if (W.girlWet) heads.push(W.girlTop);

  // ---- effects -------------------------------------------------------------
  const fx: React.ReactNode[] = [];
  for (const t of [BEAT.swoop1, BEAT.swoop2, BEAT.swoop3]) {
    if (f >= t + 3 && f <= t + 11) {
      const k = 1 - (f - t - 3) / 9;
      [0, 1, 2].forEach((i) => {
        const p = gr.p.pelvis;
        const y = p[1] - 30 - i * 62;
        const x = p[0] + 48 + i * 10;
        fx.push(<path key={`sl${t}${i}`} d={`M${x} ${y} L${x + (120 - i * 25) * k} ${y - 26 * k}`} />);
      });
    }
    if (f >= t + 11 && f <= t + 21) {
      const k = (f - t - 11) / 10;
      [262, 386].forEach((x0, j) => {
        [-1, 0.2, 1].forEach((dir, i) => {
          const s = j === 0 ? -1 : 1;
          const x = x0 + s * (18 + k * 44) * (0.6 + i * 0.3) + dir * 4;
          const y = GROUND - 8 - (i + 1) * 26 * k + 70 * k * k;
          fx.push(<Drip key={`sp${t}${j}${i}`} at={[x, y]} s={0.8 * (1 - k * 0.5)} />);
        });
        if (k < 0.5) fx.push(<path key={`sw${t}${j}`} d={`M${x0 - 30} ${GROUND - 2} Q${x0} ${GROUND - 18 * (1 - k)} ${x0 + 30} ${GROUND - 2}`} />);
      });
    }
  }
  // kick: smear arc + impact burst
  if (f >= END.kick && f <= END.kick + 6) {
    const k = (f - END.kick) / 6;
    fx.push(<path key="arc" d={`M${470} ${800} Q${330} ${760 - 40 * k} ${230} ${688}`} opacity={1 - k} strokeWidth={3} />);
    fx.push(<path key="arc2" d={`M${460} ${820} Q${320} ${790} ${240} ${720}`} opacity={0.7 * (1 - k)} />);
    if (f >= END.kick + 2)
      Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2 + 0.3;
        const r0 = 16 + k * 20, r1 = 34 + k * 30;
        fx.push(<path key={`b${i}`} d={`M${200 + Math.cos(a) * r0} ${688 + Math.sin(a) * r0} L${200 + Math.cos(a) * r1} ${688 + Math.sin(a) * r1}`} opacity={1 - k} />);
      });
  }
  // flight trail
  if (fl && fl.t < 0.8) {
    const c: V = [165 + fl.dx, 700 + fl.dy];
    [0, 1].forEach((i) => fx.push(<path key={`tr${i}`} d={`M${c[0] + 60 + i * 26} ${c[1] + 80 + i * 20} Q${c[0] + 140} ${c[1] + 60} ${c[0] + 170 + i * 30} ${c[1] + 140}`} opacity={0.8 - fl.t} />));
  }

  const flash = frame >= BEAT.thunder && frame < BEAT.thunder + 10 ? [0.5, 0.35, 0, 0, 0.3, 0.18, 0.08, 0.03, 0, 0][frame - BEAT.thunder] : 0;
  const titleOn = frame < 52;

  const girlGroup = (
    <g transform={fl ? `translate(${fl.dx} ${fl.dy}) rotate(${fl.rot} 165 700)` : undefined}>
      {w.umb && <Umbrella u={w.umb} f={f} />}
      <Legs r={wr} />
      <Torso r={wr} />
      <HeadMount r={wr} tilt={w.headTilt}>
        <GirlHead f={w.face} id="girl" />
      </HeadMount>
      <Arm r={wr} side="L" />
      <Arm r={wr} side="R" />
    </g>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <svg viewBox="0 0 720 1280" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <Boil seed={Math.floor(frame / 4)} />
        </defs>
        <rect width={720} height={1280} fill={BG} />
        <Rain f={f} drops={RAIN_FAR} shelters={[shelter]} />
        <Rain f={f} drops={RAIN_MID} shelters={[shelter]} heads={heads} />
        <g filter="url(#boil)">
          <Ground />
          <Ripples f={f} />
          <Tufts at={[128, 214, 452, 560]} />
          {g.umb && <Umbrella u={g.umb} f={f} />}
          {armBehind && <Arm r={gr} side="L" />}
          {girlGroup}
          <Legs r={gr} />
          {g.profile && <Arm r={gr} side="R" />}
          <Torso r={gr} />
          <HeadMount r={gr} tilt={g.headTilt}>
            <GuyHead f={g.face} id="guy" />
          </HeadMount>
          {!armBehind && <Arm r={gr} side="L" />}
          {!g.profile && <Arm r={gr} side="R" />}
          <RimDrips f={f} s={shelter} />
          {hairDrips(f, "guy")}
          {!fl && hairDrips(f, "girl")}
          <g fill="none" stroke={INK} strokeWidth={2.6} strokeLinecap="round">
            {fx}
          </g>
        </g>
        <Rain f={f} drops={RAIN_NEAR} shelters={[shelter]} heads={heads} />
        <Grain />
        {flash > 0 && <rect width={720} height={1280} fill="#f4f6ea" opacity={flash} />}
      </svg>
      {titleOn && (
        <div style={{ position: "absolute", left: 0, top: 150, width: "100%", textAlign: "center", direction: "rtl", fontFamily: FONT_TEXT, fontSize: 82, color: "#fbfbf6", textShadow: "0 2px 6px rgba(0,0,0,.18)" }}>
          سیمپ!
        </div>
      )}

      {/* ---- sound (the film's own voice + effects; pass audio when the files exist) ---- */}
      {audio && (<>
      <Audio src={staticFile("styles/stick-toon/sfx/rain.mp3")} volume={0.12} />
      {VO.lines.map((l) => (
        <Sequence key={l.n} from={Math.round(l.at * FPS)} layout="none">
          <Audio src={staticFile(`styles/stick-toon/vo/${String(l.n).padStart(2, "0")}.mp3`)} volume={1} />
        </Sequence>
      ))}
      {[BEAT.swoop1, BEAT.swoop2, BEAT.swoop3].map((t) => (
        <React.Fragment key={t}>
          <Sequence from={t - 2} layout="none"><Audio src={staticFile("styles/stick-toon/sfx/squeak.mp3")} volume={0.18} /></Sequence>
          <Sequence from={t + 3} layout="none"><Audio src={staticFile("styles/stick-toon/sfx/whoosh.mp3")} volume={0.32} /></Sequence>
          <Sequence from={t + 11} layout="none"><Audio src={staticFile("styles/stick-toon/sfx/land.mp3")} volume={0.38} /></Sequence>
        </React.Fragment>
      ))}
      {[BEAT.retreat1, BEAT.retreat2, BEAT.kickRetreat].map((t, i) => (
        <React.Fragment key={t}>
          <Sequence from={t + (i === 2 ? 8 : 11)} layout="none"><Audio src={staticFile("styles/stick-toon/sfx/step.mp3")} volume={0.22} /></Sequence>
          <Sequence from={t + (i === 2 ? 12 : 16)} layout="none"><Audio src={staticFile("styles/stick-toon/sfx/step.mp3")} volume={0.18} /></Sequence>
        </React.Fragment>
      ))}
      {Array.from({ length: 7 }, (_, i) => BEAT.pointAt + 8 + i * 8).map((t) => (
        <Sequence key={t} from={t} layout="none"><Audio src={staticFile("styles/stick-toon/sfx/hop.mp3")} volume={0.14} /></Sequence>
      ))}
      <Sequence from={BEAT.thunder} layout="none"><Audio src={staticFile("styles/stick-toon/sfx/thunder.mp3")} volume={0.9} /></Sequence>
      <Sequence from={END.take} layout="none"><Audio src={staticFile("styles/stick-toon/sfx/grab.mp3")} volume={0.55} /></Sequence>
      <Sequence from={END.turn} layout="none"><Audio src={staticFile("styles/stick-toon/sfx/turn.mp3")} volume={0.45} /></Sequence>
      <Sequence from={END.windup} layout="none"><Audio src={staticFile("styles/stick-toon/sfx/windup.mp3")} volume={0.45} /></Sequence>
      <Sequence from={END.kick + 2} layout="none"><Audio src={staticFile("styles/stick-toon/sfx/thwack.mp3")} volume={0.9} /></Sequence>
      <Sequence from={END.fly} layout="none"><Audio src={staticFile("styles/stick-toon/sfx/fly.mp3")} volume={0.55} /></Sequence>
      </>)}
    </AbsoluteFill>
  );
};
