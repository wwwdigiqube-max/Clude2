// Video 07 — NPV content in Paper × Blueprint. Same voice/timings as v06 (../v06/times).
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT_NUM } from "../fonts";
import {
  B, BlueChip, BlueDefs, clamp, DashedPath, easeBack, easeOut, Ground, H, InkDefs, P, PaperTag, PostCard, PushPin, ramp, rnd, Robot, RobotLine, Shot,
  Sparkle, Ticket, TickDial, W, Corkboard,
  AIMachine, Bulb, Calendar, Clapper, Coin, Film, InkBurst, LoopArrow, Mic, Moth, Plane, Press, Scissors, Script, Tokens, VideoCard, Wallet,
  InkTown, Schematic, BlueAmbience, Bunting, Cam, Dim, ForeGrass, InkConfetti, PaperAmbience,
} from "../styles/paper-blueprint";
import { fr, TM } from "../v06/times";

export type SP = { from: number; dur: number; g0: number };
const useLocal = (from: number) => {
  const f = useCurrentFrame();
  return { f, at: (s: number) => fr(s - from) };
};
const pop = (f: number, a: number, d = 10) => ramp(f, a, a + d, easeBack);
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>;
/** swinging pendulum angle after a drop */
const swing = (f: number, a: number, amp = 14) => (f < a ? 0 : Math.sin((f - a) / 4) * amp * Math.exp(-(f - a) / 30));
const Q: React.FC<{ x: number; y: number; a: number; f: number }> = ({ x, y, a, f }) => (
  <div style={{ position: "absolute", left: x - 60, top: y - 80, width: 120, textAlign: "center", fontFamily: FONT_NUM, fontSize: 130, color: P.gold, WebkitTextStroke: `5px ${P.ink}`,
    paintOrder: "stroke fill", transform: `scale(${a}) rotate(${Math.sin(f / 6) * 7}deg)`, opacity: a > 0 ? 1 : 0 }}>؟</div>
);

/* 1 · paper · AI makes video easier → but a real problem → subscription prices */
export const Sc1: React.FC<SP> = ({ from, dur, g0 }) => {
  const { f, at } = useLocal(from);
  const walkX = interpolate(ramp(f, 0, 38, (t) => t), [0, 1], [-160, 540]);
  const snap = f >= at(TM.easier) && f < at(TM.easier) + 8 ? 1 - (f - at(TM.easier)) / 8 : f < at(TM.easier) ? 1 : 0;
  const strip = ramp(f, at(TM.easier) + 2, at(TM.easier) + 26, easeOut);
  const tear = ramp(f, at(TM.problem), at(TM.problem) + 26, (t) => t * t);
  const q = pop(f, at(TM.problem) + 4);
  const tags = [{ x: 1150, t: at(TM.price) }, { x: 1390, t: at(TM.price) + 5 }, { x: 1630, t: at(TM.subs) + 2 }];
  return (
    <Shot world="paper" f={f} g0={g0} dur={dur} title="ساخت ویدیو با AI" chapter="۱ · مشکل" stripe="blue" cx={1050} cy={470}>
      <Cam f={f} keys={[[0, 620, 600, 1.55], [at(TM.easier), 700, 590, 1.45], [at(TM.easier) + 24, 1000, 580, 1.3], [at(TM.problem) + 10, 850, 560, 1.4], [at(TM.price) - 4, 850, 560, 1.4], [at(TM.price) + 14, 1150, 470, 1.05], [dur, 1150, 470, 1.1]]} shake={[at(TM.problem)]}>
      <Svg>
        <InkDefs f={f} />
        <g filter="url(#boil)">
          <InkTown f={f} base={820} seed={1} />
          <PaperAmbience f={f} seed={1} />
          <Ground y={820} seed={11} x0={-600} x1={2500} />
          <g transform="translate(800 590)"><AIMachine f={f} broken={ramp(f, at(TM.problem), at(TM.problem) + 6)} /></g>
          {/* film strip unrolling from the clapper, then tearing */}
          {Array.from({ length: 5 }, (_, i) => {
            const vis = clamp(strip * 5 - i);
            if (vis <= 0) return null;
            const fall = tear * (1 + i * 0.3);
            return (
              <g key={i} transform={`translate(${1010 + i * 150} ${604 + fall * (220 + i * 40)}) rotate(${fall * (i % 2 ? 40 : -35)}) scale(${vis})`} opacity={1 - clamp(tear * 1.4 - 0.4)}>
                <Film t={f + i * 7} />
              </g>
            );
          })}
          <InkBurst x={930} y={600} f={f} at={at(TM.easier)} />
          <InkBurst x={800} y={560} f={f} at={at(TM.problem)} color={P.red} r0={120} n={14} />
          <Robot x={walkX} y={820} s={1.1} f={f} walking={f < 38} mood={f >= at(TM.problem) ? "confused" : "happy"} look={f >= at(TM.price) ? 1 : 0} arm={0.7}
            hold={<g transform="translate(40 -30) scale(.8)"><Clapper open={snap} /></g>} />
          {/* price tags dropping on strings */}
          {tags.map((tg, i) => {
            const d = ramp(f, tg.t, tg.t + 10, (t) => t * t);
            if (d <= 0) return null;
            const y = -120 + d * 420;
            return (
              <g key={i} transform={`rotate(${swing(f, tg.t + 10)} ${tg.x} 0)`}>
                <path d={`M${tg.x} 0 V${y - 50}`} stroke={P.ink} strokeWidth="3" />
                <g transform={`translate(${tg.x} ${y})`}>
                  <path d="M-70 -50 H50 L80 0 L50 50 H-70 Z" fill={[P.gold, P.stripeGold, P.red][i]} stroke={P.ink} strokeWidth="5" strokeLinejoin="round" />
                  <circle cx="-44" cy="0" r="9" fill={P.paper} stroke={P.ink} strokeWidth="4" />
                  <g transform="translate(18 0) scale(.9)"><Coin /></g>
                </g>
              </g>
            );
          })}
          {tags.map((tg, i) => <InkBurst key={i} x={tg.x} y={300} f={f} at={tg.t + 10} r0={60} color={P.ink} n={8} />)}
        </g>
        <ForeGrass f={f} />
      </Svg>
      <Q x={520} y={500} a={q} f={f} />
      {tags.map((tg, i) => {
        const d = ramp(f, tg.t, tg.t + 10, (t) => t * t);
        return d > 0 ? <PaperTag key={i} x={tg.x} y={-120 + d * 420 + 96} rot={swing(f, tg.t + 10) * 0.6} size={28}>{["۲۹ دلار / ماه", "۳۵ دلار / ماه", "۲۲ دلار / ماه"][i]}</PaperTag> : null;
      })}
      </Cam>
    </Shot>
  );
};

/* 2 · blueprint · one model for image, one for video, one for audio — each its own bill */
const NodeIcon: React.FC<{ k: number; f: number }> = ({ k, f }) => (
  <g stroke={B.line} strokeWidth="3" fill="none" strokeLinejoin="round">
    {k === 0 && <><rect x="-30" y="-22" width="60" height="44" rx="5" /><path d="M-24 18 L-6 -2 L6 10 L14 2 L26 18" /><circle cx="12" cy="-10" r="5" /></>}
    {k === 1 && <><rect x="-30" y="-22" width="60" height="44" rx="6" /><path d="M-8 -10 L12 0 L-8 10 Z" fill={B.line} /></>}
    {k === 2 && Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${-27 + i * 9} ${-4 - 16 * Math.abs(Math.sin(f / 5 + i))} V${4 + 16 * Math.abs(Math.sin(f / 5 + i))}`} strokeWidth="4" strokeLinecap="round" />)}
    {k === 3 && <><path d="M-22 -26 H14 L24 -16 V26 H-22 Z" /><path d="M-12 -8 H12 M-12 4 H12 M-12 16 H4" /></>}
    {k === 4 && <><path d="M-26 -10 H26 M-26 10 H26" /><rect x={-18 + Math.sin(f / 8) * 12} y="-16" width="14" height="12" fill={B.line} /><rect x={4 - Math.sin(f / 8) * 12} y="4" width="18" height="12" fill={B.line} /></>}
    {k === 5 && <><circle cy="-6" r="16" /><path d="M-8 14 H8 M-6 22 H6" /></>}
  </g>
);
export const Sc2: React.FC<SP> = ({ from, dur, g0 }) => {
  const { f, at } = useLocal(from);
  const R: [number, number] = [520, 640];
  const nodes = [{ x: 1120, y: 330, t: at(TM.image) - 6 }, { x: 1450, y: 590, t: at(TM.video) - 6 }, { x: 1120, y: 850, t: at(TM.audio) - 6 }];
  return (
    <Shot world="blue" f={f} g0={g0} dur={dur} title="سه ابزار، سه اشتراک" chapter="۱ · مشکل" cx={1100} cy={590}>
      <Cam f={f} keys={[[0, 780, 600, 1.35], [at(TM.image), 900, 520, 1.3], [at(TM.video), 1100, 600, 1.2], [at(TM.audio), 1150, 620, 1.1], [dur, 1150, 600, 1.15]]} shake={[]}>
      <Svg>
        <BlueDefs />
        <Schematic f={f} camera={[330, 300, 0.8]} seed={3} />
        {nodes.map((n, i) => <DashedPath key={i} id={`s2p${i}`} d={`M${R[0] + 60} ${R[1] - 60} C ${R[0] + 300} ${R[1] - 60}, ${n.x - 260} ${n.y}, ${n.x - 72} ${n.y}`} f={f} start={n.t - 14} dur={14} />)}
        {nodes.map((n, i) => f > n.t + 4 && <Tokens key={`t${i}`} x1={R[0] + 60} y1={R[1] - 60} x2={n.x - 70} y2={n.y} f={f} speed={0.035} color={B.pink} />)}
        {nodes.map((n, i) => (
          <TickDial key={i} x={n.x} y={n.y} r={84} f={f} appear={pop(f, n.t)} active={f > n.t + 10}><NodeIcon k={i} f={f} /></TickDial>
        ))}
        {nodes.map((n, i) => f > n.t + 8 && f < n.t + 30 && <Sparkle key={`s${i}`} x={n.x + 60} y={n.y - 60} f={f} s={18} />)}
        <RobotLine x={R[0]} y={R[1] + 60} s={1.3} f={f} look={1} wave={f < 20} />
        {/* cost meter fills with every new tool */}
        {(() => {
          const lvl = nodes.reduce((a, n) => a + ramp(f, n.t + 14, n.t + 26, easeOut), 0) / 3;
          return (
            <g>
              <rect x="1720" y="300" width="80" height="560" rx="40" fill="none" stroke={B.line} strokeWidth="3" />
              <rect x="1730" y={850 - 540 * lvl} width="60" height={540 * lvl} rx="30" fill={B.pink} opacity=".85" filter="url(#softGlow)" />
              {[0.33, 0.66, 1].map((k) => <path key={k} d={`M1700 ${850 - 540 * k} h20`} stroke={B.line} strokeWidth="2" />)}
              {nodes.map((n, i) => {
                const p = clamp((f - n.t - 10) / 16);
                if (p <= 0 || p >= 1) return null;
                return <circle key={i} cx={n.x + 150 + (1760 - n.x - 150) * p} cy={n.y + (850 - 540 * ((i + 1) / 3) - n.y) * p - Math.sin(Math.PI * p) * 80} r="12" fill={B.pink} filter="url(#glow)" />;
              })}
            </g>
          );
        })()}
        <Dim x1={880} y1={330} x2={880} y2={850} a={ramp(f, nodes[2].t, nodes[2].t + 14)} label="3 × subscriptions" />
        <BlueAmbience f={f} target={[[...nodes].reverse().find((n) => f >= n.t)?.x ?? 1120, [...nodes].reverse().find((n) => f >= n.t)?.y ?? 330]} lock={1} />
      </Svg>
      {nodes.map((n, i) => (
        <BlueChip key={i} x={n.x + 150} y={n.y} a={pop(f, n.t + 8)} size={34} color={B.pink}>
          <span style={{ display: "inline-block", transform: `scale(${1 + 0.1 * Math.sin(f / 4 + i)})` }}>$ / ماه</span>
        </BlueChip>
      ))}
      </Cam>
    </Shot>
  );
};

/* 3 · paper · end of month: separate subscriptions, pay each, renew every month */
export const Sc3: React.FC<SP> = ({ from, dur, g0 }) => {
  const { f, at } = useLocal(from);
  const flip1 = ramp(f, at(TM.month), at(TM.month) + 10);
  const flipR = ((f - at(TM.renew)) % 14) / 14;
  const renewing = f >= at(TM.renew);
  const tk = [{ x: 1080, y: 560, t: at(TM.many) - 4, c: 0 }, { x: 1320, y: 620, t: at(TM.many) + 4, c: 1 }, { x: 1560, y: 560, t: at(TM.separate), c: 2 }];
  const buy = at(TM.buy);
  return (
    <Shot world="paper" f={f} g0={g0} dur={dur} title="هر ماه، تمدید" chapter="۲ · هزینه" stripe="gold" cx={1300} cy={450}>
      <Cam f={f} keys={[[0, 520, 560, 1.5], [at(TM.vids) - 6, 1150, 420, 1.35], [at(TM.separate) + 6, 1250, 500, 1.2], [at(TM.buy) - 2, 900, 540, 1.02], [at(TM.renew) + 4, 620, 480, 1.35], [dur, 620, 480, 1.42]]} shake={[]}>
      <Svg>
        <InkDefs f={f} />
        <g filter="url(#boil)">
          <InkTown f={f} base={840} seed={2} />
          <PaperAmbience f={f} seed={3} birds={2} />
          <Ground y={840} seed={13} x0={-600} x1={2500} />
          <Corkboard x={900} y={200} w={820} h={520} ground={840} />
          {[0, 1, 2].map((i) => {
            const a = pop(f, at(TM.vids) + i * 4);
            return a > 0 ? (
              <g key={`v${i}`}>
                <g transform={`translate(${1080 + i * 240} 330) rotate(${[-6, 4, -3][i] + swing(f, at(TM.vids) + i * 4, 5)}) scale(${a * 1.1})`}><Film t={f + i * 9} /></g>
                <PushPin x={1080 + i * 240} y={280} />
                <InkBurst x={1080 + i * 240} y={330} f={f} at={at(TM.vids) + i * 4 + 4} r0={70} n={8} />
              </g>
            ) : null;
          })}
          <g transform={`translate(600 470) rotate(${swing(f, at(TM.month), 5)})`}><Calendar flip={renewing ? flipR : flip1} red={renewing} /></g>
          {renewing && <g transform="translate(600 470)"><LoopArrow r={185} rot={(f - at(TM.renew)) * 14} /></g>}
          {tk.map((t, i) => {
            const a = pop(f, t.t);
            if (a <= 0) return null;
            return (
              <g key={i}>
                <g transform={`translate(${t.x} ${t.y}) rotate(${[-5, 4, -3][i] + swing(f, t.t, 4)}) scale(${a * 0.85})`}>
                  <g opacity={0.001}><Ticket /></g>
                  <path d="M-130 -62 H130 V-16 A 16 16 0 0 0 130 16 V62 H-130 V16 A 16 16 0 0 0 -130 -16 Z" fill={[P.sky, P.stripeGold, "#e9b0a4"][i]} stroke={P.ink} strokeWidth="5" />
                  <path d="M60 -58 V58" stroke={P.ink} strokeWidth="2.5" strokeDasharray="6 6" />
                  <g transform="translate(-40 0) scale(.9)"><NodeInk k={i} f={f} /></g>
                  {renewing && <g transform="translate(96 0)"><LoopArrow r={22} rot={(f - at(TM.renew)) * -18} /></g>}
                </g>
                <PushPin x={t.x} y={t.y - 58 * a} />
              </g>
            );
          })}
          {/* coins leaving the robot toward each ticket */}
          {tk.map((t, i) => [0, 1].map((k) => {
            const s = buy + i * 4 + k * 7;
            const p = clamp((f - s) / 16);
            if (p <= 0 || p >= 1) return null;
            const x = 150 + (t.x - 150) * p, y = 700 + (t.y - 700) * p - Math.sin(Math.PI * p) * 260;
            return <g key={`${i}${k}`} transform={`translate(${x} ${y}) rotate(${p * 360})`}><Coin /></g>;
          }))}
          {tk.map((t, i) => <InkBurst key={`b${i}`} x={t.x} y={t.y} f={f} at={buy + i * 4 + 16} r0={40} n={8} />)}
          <Robot x={330} y={840} s={1.05} f={f} mood={f >= buy ? "confused" : "calm"} look={1} arm={f >= buy && f < buy + 30 ? 1 : 0.2} />
          <g transform={`translate(150 780) rotate(${Math.sin(f / 9) * 3})`}><Wallet fill={1 - ramp(f, buy, buy + 30)} /></g>
          {f > at(TM.renew) && (() => {
            const t = f - at(TM.renew);
            return <g transform={`translate(${150 + t * 4 + Math.sin(t / 5) * 20} ${740 - t * 5})`}><Moth f={f} /></g>;
          })()}
        </g>
      </Svg>
      </Cam>
    </Shot>
  );
};
const NodeInk: React.FC<{ k: number; f: number }> = ({ k, f }) => (
  <g>
    {k === 0 && <g transform="scale(.8)"><Film t={f} /></g>}
    {k === 1 && <g transform="scale(.8)"><Clapper open={0.3 + 0.3 * Math.sin(f / 5)} /></g>}
    {k === 2 && <g transform="scale(.7)"><Mic t={f} /></g>}
  </g>
);

/* 4 · blueprint · looking for a way to remove the cost & back-and-forth between tools */
export const Sc4: React.FC<SP> = ({ from, dur, g0 }) => {
  const { f, at } = useLocal(from);
  const C: [number, number] = [960, 600];
  const N = [{ x: 440, y: 420 }, { x: 1480, y: 420 }, { x: 960, y: 900 }];
  const cut = ramp(f, at(TM.remove), at(TM.remove) + 12, easeOut);
  const back = f >= at(TM.back) - 4;
  // token bouncing tool → center → tool …
  const seg = Math.floor((f - at(TM.back)) / 9);
  const k = (((f - at(TM.back)) % 9) + 9) % 9 / 9;
  const a = N[((seg % 3) + 3) % 3], b = N[(((seg + 1) % 3) + 3) % 3];
  const tx = a.x + (b.x - a.x) * k, ty = a.y + (b.y - a.y) * k - Math.sin(Math.PI * k) * 120;
  return (
    <Shot world="blue" f={f} g0={g0} dur={dur} title="رفت‌وآمد بین ابزارها" chapter="۲ · هزینه" cx={960} cy={600}>
      <Cam f={f} keys={[[0, 960, 620, 1.45], [at(TM.back), 960, 620, 1.1], [at(TM.remove), 960, 600, 1.15], [dur, 960, 600, 1.45]]} shake={[at(TM.remove)]}>
      <Svg>
        <BlueDefs />
        <Schematic f={f} camera={[280, 260, 0.6]} cube={[1660, 830, 110]} seed={5} />
        {N.map((n, i) => <DashedPath key={i} id={`s4p${i}`} d={`M${C[0]} ${C[1]} L${n.x} ${n.y}`} f={f} start={at(TM.search) + i * 6} dur={14} color={cut > 0.5 ? "rgba(184,194,255,.25)" : B.line} />)}
        {N.map((n, i) => (
          <TickDial key={i} x={n.x} y={n.y} r={62} f={f} appear={pop(f, 4 + i * 5) * (1 - cut * 0.85)} active={back && cut < 0.5}><NodeIcon k={i} f={f} /></TickDial>
        ))}
        {back && cut < 1 && <g opacity={1 - cut}>
          <circle cx={tx} cy={ty} r="14" fill={B.pink} filter="url(#glow)" />
          {Array.from({ length: 6 }, (_, j) => <circle key={j} cx={tx - (b.x - a.x) * 0.02 * j} cy={ty - (b.y - a.y) * 0.02 * j} r={10 - j * 1.4} fill={B.pink} opacity={0.5 - j * 0.07} />)}
        </g>}
        {/* cost counter coins orbiting while searching */}
        {f < at(TM.remove) && Array.from({ length: 6 }, (_, j) => {
          const an = (j / 6) * Math.PI * 2 + f * 0.05;
          return <circle key={`c${j}`} cx={C[0] + Math.cos(an) * 150} cy={C[1] + Math.sin(an) * 60} r="9" fill="none" stroke={B.line} strokeWidth="3" opacity={ramp(f, at(TM.cost), at(TM.cost) + 10)} />;
        })}
        {/* cut marks */}
        {N.map((n, i) => {
          const p = ramp(f, at(TM.remove) + i * 3, at(TM.remove) + i * 3 + 8, easeOut);
          if (p <= 0) return null;
          const mx = (C[0] + n.x) / 2, my = (C[1] + n.y) / 2;
          return <g key={`x${i}`} stroke={B.pink} strokeWidth="8" strokeLinecap="round" filter="url(#softGlow)"><path d={`M${mx - 26 * p} ${my - 26 * p} L${mx + 26 * p} ${my + 26 * p} M${mx + 26 * p} ${my - 26 * p} L${mx - 26 * p} ${my + 26 * p}`} /></g>;
        })}
        {cut > 0 && <Sparkle x={C[0]} y={C[1] - 170} f={f} s={26} />}
        {back && Array.from({ length: 16 }, (_, j) => {
          const t0 = at(TM.back) + j * 3;
          const a2 = clamp((f - t0) / 6) * (1 - cut);
          if (a2 <= 0) return null;
          const p1 = N[j % 3], p2 = N[(j + 1 + (j % 2)) % 3];
          const cx1 = 960 + (rnd(j * 3) - 0.5) * 900, cy1 = 560 + (rnd(j * 5) - 0.5) * 600;
          return <path key={`tg${j}`} d={`M${p1.x} ${p1.y} Q ${cx1} ${cy1} ${p2.x} ${p2.y}`} fill="none" stroke={j % 3 ? B.line : B.pink} strokeWidth="2" opacity={a2 * 0.45} strokeDasharray="4 6" />;
        })}
        <RobotLine x={C[0]} y={C[1] + 60} s={1.1} f={f} look={Math.sin(f / 12)} />
        <BlueAmbience f={f} />
      </Svg>
      </Cam>
    </Shot>
  );
};

/* 5 · paper · we reached a method called NPV */
export const Sc5: React.FC<SP> = ({ from, dur, g0 }) => {
  const { f, at } = useLocal(from);
  const walkX = interpolate(ramp(f, 0, at(TM.reached) + 10, (t) => t), [0, 1], [-160, 640]);
  const sign = pop(f, at(TM.reached) + 8, 14);
  const reveal = ramp(f, at(TM.npv) - 2, at(TM.npv) + 12, easeOut);
  const jump = f > at(TM.npv) && f < at(TM.npv) + 18 ? Math.sin(((f - at(TM.npv)) / 18) * Math.PI) * 80 : 0;
  const ring = ramp(f, at(TM.npv), at(TM.npv) + 20, easeOut);
  return (
    <Shot world="paper" f={f} g0={g0} dur={dur} title="رسیدیم به…" chapter="۳ · NPV" stripe="blue" cx={1200} cy={440}>
      <Cam f={f} keys={[[0, 300, 640, 1.6], [at(TM.reached) + 10, 640, 620, 1.45], [at(TM.npv) - 4, 1000, 500, 1.2], [at(TM.npv) + 10, 1150, 470, 1.3], [dur, 1100, 480, 1.22]]} shake={[at(TM.npv) + 4]}>
      <Svg>
        <InkDefs f={f} />
        <g filter="url(#boil)">
          <InkTown f={f} base={820} seed={5} drift={0.05} />
          <PaperAmbience f={f} seed={5} />
          <Ground y={820} seed={17} x0={-600} x1={2500} />
          <path d="M700 1080 L1140 820 M1700 1080 L1260 820" stroke={P.ink} strokeWidth="5" />
          {Array.from({ length: 6 }, (_, i) => { const k = ((i / 6 + f * 0.01) % 1); const y = 820 + k * k * 260; const w = 20 + k * 60; return <path key={i} d={`M${1200 - w / 2} ${y} h${w}`} stroke={P.ink} strokeWidth={3 + k * 5} opacity=".6" />; })}
          <Bunting f={f} a={ramp(f, at(TM.npv), at(TM.npv) + 10)} />
          <circle cx="1200" cy="420" r="300" fill="none" stroke={P.gold} strokeWidth="6" strokeDasharray={`${1885 * ring} 1885`} transform="rotate(-90 1200 420)" />
          <g transform={`translate(1200 820) scale(${sign})`}>
            <rect x="-12" y="-420" width="24" height="420" fill={P.wood} stroke={P.ink} strokeWidth="5" />
            <rect x="-280" y="-520" width="560" height="230" rx="14" fill={P.paperLight} stroke={P.ink} strokeWidth="7" />
            <rect x="-280" y="-330" width="560" height="40" fill="url(#hatch)" />
          </g>
          <InkBurst x={1200} y={410} f={f} at={at(TM.npv) + 4} r0={150} n={16} />
          <InkConfetti f={f} at={at(TM.npv) + 4} n={46} />
          <Robot x={walkX} y={820} s={1.1} f={f} walking={f < at(TM.reached) + 10} mood={f >= at(TM.npv) ? "happy" : "determined"} look={1} jump={jump} arm={f >= at(TM.npv) ? 1 : 0} />
        </g>
      </Svg>
      <div style={{ position: "absolute", left: 1200 - 270, top: 820 + (-520 + 30) * sign, width: 540, textAlign: "center", fontFamily: FONT_NUM, fontSize: 150, lineHeight: "170px", color: P.red, direction: "ltr",
        clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`, opacity: sign, transform: `scale(${sign})`, letterSpacing: 8 }}>NPV</div>
      </Cam>
    </Shot>
  );
};

/* 6 · blueprint · instead of a separate service per step, the whole process in one place */
export const Sc6: React.FC<SP> = ({ from, dur, g0 }) => {
  const { f, at } = useLocal(from);
  const apart = ramp(f, at(TM.apart) - 6, at(TM.apart) + 14, easeOut);
  const hub = pop(f, at(TM.whole), 14);
  const join = ramp(f, at(TM.together) - 2, at(TM.together) + 16, easeOut);
  const C: [number, number] = [960, 580];
  return (
    <Shot world="blue" f={f} g0={g0} dur={dur} title="همه‌چیز یکجا" chapter="۳ · NPV" cx={960} cy={580}>
      <Cam f={f} keys={[[0, 960, 580, 1.2], [at(TM.apart), 960, 580, 1.0], [at(TM.together), 960, 580, 1.25], [dur, 960, 580, 1.6]]} shake={[at(TM.together) + 4]}>
      <Svg>
        <BlueDefs />
        <Schematic f={f} camera={[1600, 250, 0.65]} cube={[300, 830, 95]} seed={7} />
        {Array.from({ length: 6 }, (_, i) => {
          const an = (i / 6) * Math.PI * 2 - Math.PI / 2 + f * 0.003;
          const R = (360 + apart * 90) * (1 - join);
          const x = C[0] + Math.cos(an) * R * 1.35, y = C[1] + Math.sin(an) * R * 0.78;
          const ap = pop(f, 3 + i * 3);
          return (
            <g key={i}>
              {hub > 0 && join < 1 && <DashedPath id={`s6p${i}`} d={`M${x} ${y} L${C[0]} ${C[1]}`} f={f} start={at(TM.whole) + i * 2} dur={12} spark={false} />}
              {join > 0 && join < 1 && <Tokens x1={x} y1={y} x2={C[0]} y2={C[1]} f={f} speed={0.06} color="#fff" />}
              <g opacity={1 - join * 0.9}>
                <TickDial x={x + Math.sin(f / 9 + i) * 8 * (1 - join)} y={y} r={52 * (1 - join * 0.6)} f={f} appear={ap}><NodeIcon k={i} f={f} /></TickDial>
              </g>
              {apart > 0 && join < 0.3 && <text x={x + 46} y={y - 44} fill={B.pink} fontSize="30" fontWeight="700" opacity={apart}>$</text>}
            </g>
          );
        })}
        {[0, 1].map((k) => (
          <ellipse key={`o${k}`} cx={C[0]} cy={C[1]} rx={480 + k * 120} ry={260 + k * 70} fill="none" stroke={B.line} strokeWidth="1.5" strokeDasharray="4 12" opacity={0.35 * (1 - join)} transform={`rotate(${(k ? -1 : 1) * f * 0.2} ${C[0]} ${C[1]})`} />
        ))}
        {hub > 0 && (
          <g>
            {[0, 1, 2].map((k) => {
              const t = ((f - at(TM.together) - k * 8) % 30) / 30;
              return f > at(TM.together) ? <circle key={k} cx={C[0]} cy={C[1]} r={120 + t * 160} fill="none" stroke={B.pink} strokeWidth={4 * (1 - t)} opacity={1 - t} /> : null;
            })}
            <TickDial x={C[0]} y={C[1]} r={110 * (1 + join * 0.25)} f={f} appear={hub} active>
              <g transform={`scale(${1 + join * 0.3})`}>
                <rect x="-40" y="-40" width="80" height="80" rx="10" fill="none" stroke={B.white} strokeWidth="4" />
                <path d="M-14 -20 L22 0 L-14 20 Z" fill={B.pink} />
              </g>
            </TickDial>
            {join >= 1 && <Sparkle x={C[0] + 110} y={C[1] - 110} f={f} s={22} />}
          </g>
        )}
        <BlueAmbience f={f} target={hub > 0 ? C : undefined} lock={join} />
      </Svg>
      <BlueChip x={C[0]} y={C[1] + 190 + join * 30} a={hub} size={40} color={B.white}>NPV</BlueChip>
      </Cam>
    </Shot>
  );
};

/* 7 · paper · idea → script → shots → sound → edit → output… sent to you (conveyor + paper plane) */
const STEPS = [
  { t: TM.idea, C: (f: number) => <Bulb glow={0.6 + 0.4 * Math.sin(f / 4)} />, label: "ایده" },
  { t: TM.script, C: () => <Script />, label: "سناریو" },
  { t: TM.shots, C: (f: number) => <Film t={f} />, label: "شات‌ها" },
  { t: TM.sound, C: (f: number) => <Mic t={f} />, label: "صداگذاری" },
  { t: TM.edit, C: (f: number) => <Scissors t={f} />, label: "ادیت" },
  { t: TM.output, C: () => <VideoCard />, label: "خروجی" },
];
export const Sc7: React.FC<SP> = ({ from, dur, g0 }) => {
  const { f, at } = useLocal(from);
  const SPEED = 5.2; // px/frame
  const send = at(TM.send);
  const plane = clamp((f - send) / 34);
  const px = 1600 - plane * 1500, py = 520 - Math.sin(plane * Math.PI) * 330 - plane * 120;
  return (
    <Shot world="paper" f={f} g0={g0} dur={dur} title="از ایده تا خروجی" chapter="۴ · مراحل" stripe="gold" cx={960} cy={560}>
      <Cam f={f} keys={[[0, 500, 580, 1.5], [at(TM.shots), 700, 580, 1.4], [at(TM.edit), 1000, 580, 1.35], [at(TM.output) + 8, 1350, 600, 1.3], [at(TM.send), 1400, 560, 1.3], [at(TM.send) + 20, 900, 420, 1.0], [dur, 900, 420, 1.0]]} shake={[]}>
      <Svg>
        <InkDefs f={f} />
        <g filter="url(#boil)">
          <InkTown f={f} base={860} seed={7} variant="factory" />
          <PaperAmbience f={f} seed={7} birds={2} />
          <Ground y={860} seed={21} x0={-600} x1={2500} />
          {/* conveyor */}
          <rect x="150" y="640" width="1300" height="46" rx="23" fill={P.inkSoft} stroke={P.ink} strokeWidth="5" />
          {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${150 + ((i * 46 + f * SPEED) % 1300)} 646 v34`} stroke={P.paperLight} strokeWidth="4" opacity=".6" />)}
          {[176, 1424].map((x) => <g key={x} transform={`translate(${x} 663) rotate(${f * 8})`}><circle r="20" fill={P.gold} stroke={P.ink} strokeWidth="5" /><path d="M-14 0 H14 M0 -14 V14" stroke={P.ink} strokeWidth="4" /></g>)}
          <path d="M260 686 V860 M1340 686 V860" stroke={P.ink} strokeWidth="10" />
          {STEPS.map((s, i) => {
            const t0 = at(s.t) - 4;
            const a = pop(f, t0, 12);
            if (a <= 0) return null;
            const x = 240 + (f - t0) * SPEED;
            if (x > 1480) return null;
            const hop = Math.abs(Math.sin((f - t0) / 7)) * 6;
            return (
              <g key={i}>
                <g transform={`translate(${x} ${560 - hop}) scale(${a * 0.95})`}>{s.C(f)}</g>
                <InkBurst x={x} y={560} f={f} at={t0 + 4} r0={70} n={10} />
              </g>
            );
          })}
          <g transform="translate(800 540)"><Press f={f} /></g>
          {Array.from({ length: 40 }, (_, k) => { const tt = k * 26 + 7; return f >= tt && f < tt + 10 ? <InkBurst key={`pb${k}`} x={800} y={600} f={f} at={tt} r0={50} n={8} color={P.ink} /> : null; })}
          {plane > 0 && plane < 1 && (
            <g>
              <path d={Array.from({ length: 12 }, (_, k) => { const q = Math.max(0, plane - k * 0.03); return `${k ? "L" : "M"}${1600 - q * 1500} ${520 - Math.sin(q * Math.PI) * 330 - q * 120}`; }).join(" ")} fill="none" stroke={P.ink} strokeWidth="4" strokeDasharray="10 10" />
              <g transform={`translate(${px} ${py}) rotate(${-20 - plane * 20}) scale(1.4)`}><Plane /></g>
            </g>
          )}
          <Robot x={1640} y={860} s={1.05} f={f} mood={f >= send ? "happy" : "determined"} look={-1} arm={f >= at(TM.output) && f < send + 4 ? 1 : 0}
            hold={f >= at(TM.output) + 20 && f < send ? <g transform="translate(10 -50) scale(.6)"><VideoCard /></g> : undefined} />
        </g>
      </Svg>
      {STEPS.map((s, i) => {
        const t0 = at(s.t) - 4;
        const a = pop(f, t0 + 4, 10);
        const x = 240 + (f - t0) * SPEED;
        return a > 0 && x < 1480 ? <PaperTag key={i} x={x} y={740} a={a} size={26} rot={(i % 2 ? 3 : -3)}>{s.label}</PaperTag> : null;
      })}
      </Cam>
    </Shot>
  );
};

/* 8 · blueprint · completing the method — outputs light up */
export const Sc8: React.FC<SP> = ({ from, dur, g0 }) => {
  const { f, at } = useLocal(from);
  const prog = ramp(f, at(TM.complete) - 6, at(TM.outputs), easeOut);
  const wow = f >= at(TM.wow);
  return (
    <Shot world="blue" f={f} g0={g0} dur={dur} title="خروجی‌ها" chapter="۴ · مراحل" cx={960} cy={540}>
      <Cam f={f} keys={[[0, 960, 560, 1.4], [at(TM.outputs), 960, 560, 1.12], [at(TM.wow), 960, 560, 1.22], [dur, 960, 560, 1.35]]} shake={[at(TM.wow)]}>
      <Svg>
        <BlueDefs />
        <Schematic f={f} camera={[230, 560, 0.6]} cube={[1720, 560, 100]} seed={9} />
        {Array.from({ length: 6 }, (_, i) => {
          const x = 560 + (i % 3) * 400, y = 400 + Math.floor(i / 3) * 330;
          const hot = ramp(f, at(TM.outputs) + i * 4, at(TM.outputs) + i * 4 + 6, easeBack);
          const a = pop(f, i * 3 + 2);
          return (
            <g key={i} transform={`translate(${x} ${y + Math.sin(f / 14 + i) * 6}) scale(${(0.9 + 0.1 * a) * (wow ? 1.65 + 0.06 * Math.sin(f / 5 + i) : 1.6)}) translate(${-x} ${-y})`} opacity={a}>
              <PostCard x={x} y={y} hot={hot} s={1} />
              {hot > 0.5 && <path d={`M${x - 14} ${y - 40} L${x + 18} ${y - 22} L${x - 14} ${y - 4} Z`} fill={B.pink} />}
            </g>
          );
        })}
        {Array.from({ length: 6 }, (_, i) => {
          const t = at(TM.outputs) + i * 4 + 4;
          return f > t && f < t + 18 ? <Sparkle key={i} x={560 + (i % 3) * 400 + 100} y={400 + Math.floor(i / 3) * 330 - 125} f={f} s={22} /> : null;
        })}
        {/* completion bar */}
        {(() => {
          const idx = [0, 1, 2, 3, 4, 5].reverse().find((i) => f >= at(TM.outputs) + i * 4);
          const tg: [number, number] | undefined = idx === undefined ? undefined : [560 + (idx % 3) * 400, 400 + Math.floor(idx / 3) * 330];
          return <BlueAmbience f={f} target={tg} lock={idx === undefined ? 0 : 1} />;
        })()}
        <Dim x1={440} y1={250} x2={1480} y2={250} a={ramp(f, 4, 30)} label="outputs · 1920×1080" />
        <rect x="560" y="930" width="800" height="12" rx="6" fill={B.line} opacity=".2" />
        <rect x="560" y="930" width={800 * prog} height="12" rx="6" fill={prog >= 1 ? B.pink : B.line} filter="url(#softGlow)" />
        {wow && Array.from({ length: 16 }, (_, i) => {
          const t = f - at(TM.wow);
          const an = (i / 16) * Math.PI * 2;
          return t < 24 ? <circle key={`w${i}`} cx={960 + Math.cos(an) * (80 + t * 26)} cy={560 + Math.sin(an) * (60 + t * 18)} r={6 * (1 - t / 24)} fill={i % 2 ? B.pink : "#fff"} filter="url(#softGlow)" /> : null;
        })}
      </Svg>
      </Cam>
    </Shot>
  );
};

/* 9 · paper · soon you'll make videos without worry */
export const Sc9: React.FC<SP> = ({ from, dur, g0 }) => {
  const { f, at } = useLocal(from);
  const jump = [at(TM.worry), at(TM.make)].reduce((j, a) => j + (f > a && f < a + 16 ? Math.sin(((f - a) / 16) * Math.PI) * 60 : 0), 0);
  const pan = f / 2;
  const tag = pop(f, at(TM.make) + 2, 12);
  const fade = ramp(f, dur - 20, dur);
  return (
    <Shot world="paper" f={f} g0={g0} dur={dur} title="به‌زودی" chapter="۵ · به‌زودی" stripe="gold" cx={960} cy={430}>
      <Cam f={f} keys={[[0, 960, 640, 1.5], [at(TM.worry), 960, 560, 1.2], [dur, 960, 560, 1.28]]} shake={[]}>
      <Svg>
        <InkDefs f={f} />
        <g filter="url(#boil)">
          <InkTown f={f} base={820} seed={9} variant="festival" />
          <PaperAmbience f={f} seed={9} birds={4} />
          <Bunting f={f} />
          <Ground y={820} seed={23} x0={-600} x1={2500} />
          {/* sun with rotating rays */}
          <g transform={`translate(960 400) rotate(${pan})`}>
            {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M0 -150 L0 ${-200 - (i % 2) * 30}`} transform={`rotate(${i * 22.5})`} stroke={P.gold} strokeWidth="10" strokeLinecap="round" />)}
          </g>
          <circle cx="960" cy="400" r="120" fill={P.gold} stroke={P.ink} strokeWidth="6" />
          <circle cx="960" cy="400" r="120" fill="url(#hatch)" opacity=".4" />
          {/* paper plane looping */}
          <g transform={`translate(${960 + Math.cos(f / 16) * 420} ${380 + Math.sin(f / 16) * 170}) rotate(${(f / 16) * 57 + 90})`}><Plane /></g>
          <Robot x={960} y={820} s={1.15} f={f} mood="happy" arm={1} jump={jump} hold={<g transform="translate(10 -50) scale(.6)"><VideoCard /></g>} />
          <InkBurst x={960} y={560} f={f} at={at(TM.make)} r0={120} n={16} />
          <InkConfetti f={f} at={at(TM.worry)} n={60} x0={100} x1={1820} />
        </g>
        <ForeGrass f={f} />
        <rect width={W} height={H} fill="#000" opacity={fade} />
      </Svg>
      <PaperTag x={1420} y={700} a={tag} size={40} rot={-4}>NPV · به‌زودی</PaperTag>
      </Cam>
    </Shot>
  );
};

