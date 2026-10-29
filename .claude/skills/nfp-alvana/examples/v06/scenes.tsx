// Video 06 — NPV. Ten shots, each keyed to narration words (times.ts). No typography.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  BentoTile, CardRow, clamp, Debris, DitherClouds, DotField, easeBack, easeOut, Emblem, Galaxy, GlyphRing, Hud, Hyperspace, K, Kaleido,
  PixelImage, Prism, ramp, rnd, SeaWorld, CloudWorld, skyFn, Snake, TileArt, Tunnel,
} from "../styles/pixel-collage";
import { Art, artBalls, artEdit, artIdea, artLand, artRabbit, artScript, artSend, artSky, artWave } from "./arts";
import { fr, TM } from "./times";

export type SP = { from: number; dur: number };
const useLocal = (from: number) => {
  const f = useCurrentFrame();
  return { f, at: (s: number) => fr(s - from) };
};
const Frame: React.FC<{ bg?: string; children: React.ReactNode }> = ({ bg = K.bg, children }) => (
  <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: "absolute", left: 0, top: 0 }}>
    <rect width="1920" height="1080" fill={bg} />
    {children}
  </svg>
);
const Flash: React.FC<{ f: number; at: number; color?: string; d?: number }> = ({ f, at, color = "#fff", d = 8 }) => {
  const t = f - at;
  return t >= 0 && t < d ? <rect width="1920" height="1080" fill={color} opacity={(1 - t / d) * 0.45} /> : null;
};

/* 1 · AI makes video easier (pixel build E1) → "but a serious problem" (glitch E4) */
export const Sc1: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const reveal = ramp(f, 2, 56, (t) => t);
  const g1 = ramp(f, at(TM.problem), at(TM.problem) + 5);
  const spike = (a: number) => (f >= a && f < a + 8 ? 1 - (f - a) / 8 : 0);
  const glitch = clamp(g1 * 0.25 + spike(at(TM.problem)) * 0.8 + spike(at(TM.serious)) * 0.9 + ramp(f, at(TM.serious), at(TM.price)) * 0.35);
  const z = 1 + f * 0.0012 + g1 * 0.05;
  return (
    <Frame>
      <g transform={`translate(960 540) scale(${z}) translate(-960 -540)`}>
        <PixelImage x={660} y={240} w={600} h={600} cols={30} rows={30} color={skyFn(f)} reveal={reveal} glitch={glitch} f={f} />
        <DitherClouds clusters={[[650, 300, 90], [1270, 420, 70], [690, 720, 110], [1250, 790, 85], [960, 225, 60]]} f={f} a={ramp(f, 18, 40)} />
        {g1 > 0 && <Hud x={610} y={196} w={700} h={688} f={f - at(TM.problem)} a={g1} />}
        <Debris cx={960} cy={540} f={f} at={at(TM.problem)} />
        <Debris cx={960} cy={540} f={f} at={at(TM.serious)} seed={9} n={34} />
      </g>
      <Flash f={f} at={at(TM.problem)} d={5} />
    </Frame>
  );
};

/* 2 · "subscription prices" — image collapses to a dot → tile hyperspace (E7) */
export const Sc2: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const shrink = ramp(f, 0, at(TM.subs), (t) => t * t);
  const s = interpolate(shrink, [0, 1], [1.05, 0.015]);
  return (
    <Frame>
      {shrink < 1 && (
        <g transform={`translate(960 540) scale(${s}) rotate(${shrink * 90}) translate(-960 -540)`}>
          <PixelImage x={660} y={240} w={600} h={600} cols={30} rows={30} color={skyFn(f + 150)} glitch={0.3} f={f} />
        </g>
      )}
      <circle cx="960" cy="540" r={f >= at(TM.subs) ? 0 : 6 + shrink * 10} fill={K.cyan} />
      <Hyperspace f={f} start={at(TM.subs)} n={170} />
      <Flash f={f} at={at(TM.subs)} color={K.cyan} d={4} />
    </Frame>
  );
};

/* 3 · one model for image, one for video, one for audio — cards in depth (E2/E6) */
const TOOL_ARTS: Art[] = [artLand, artRabbit, artWave];
export const Sc3: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const times = [TM.image - 0.25, TM.video - 0.2, TM.audio - 0.2].map(at);
  const slide = ramp(f, times[1] - 2, times[1] + 10) + ramp(f, times[2] - 2, times[2] + 10);
  return (
    <Frame>
      <DitherClouds clusters={[[300, 200, 120], [1650, 880, 140]]} f={f} a={0.35} color="#6b6870" />
      <CardRow n={3} x={1200} y={540} w={900} h={560} slide={slide} shrink={0.72} gap={0.8}
        appear={(i) => ramp(f, times[i], times[i] + 10, easeBack)}
        render={(i) => TOOL_ARTS[i](900, 560, f, f - times[i])} />
    </Frame>
  );
};

/* 4 · separate subscriptions every month — card tunnel (E4) → renewal loop ring (E5) */
export const Sc4: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const speed = 26 + ramp(f, 0, at(TM.buy)) * 46;
  const split = ramp(f, at(TM.separate) - 4, at(TM.separate) + 10, easeOut);
  const out = ramp(f, at(TM.renew) - 2, at(TM.renew) + 8);
  const ring = ramp(f, at(TM.renew), at(TM.renew) + 10, easeBack);
  const dist = Array.from({ length: f + 1 }, (_, k) => 26 + ramp(k, 0, at(TM.buy)) * 46).reduce((a, b) => a + b, 0); // integrated speed
  return (
    <Frame>
      <g opacity={1 - out}>
        <Tunnel f={dist / speed} speed={speed} split={split} tint={ramp(f, at(TM.many), at(TM.many) + 10)} />
        <Hud x={120} y={90} w={1680} h={900} f={f} a={0.7} seed={4} />
      </g>
      <Debris cx={960} cy={540} f={f} at={at(TM.buy)} n={30} seed={4} />
      <Flash f={f} at={at(TM.buy)} d={5} />
      {ring > 0 && (
        <g transform={`translate(960 540) scale(${ring}) translate(-960 -540)`}>
          <GlyphRing cx={960} cy={540} r={170} f={f * 3} n={20} />
          <GlyphRing cx={960} cy={540} r={260} f={-f * 2} n={28} a={0.6} />
          <circle cx="960" cy="540" r={40 + 6 * Math.sin(f / 3)} fill="none" stroke={K.mint} strokeWidth="6" strokeDasharray="30 20" transform={`rotate(${f * 12} 960 540)`} />
        </g>
      )}
    </Frame>
  );
};

/* 5 · searching for a way, back-and-forth between tools → removed (E8 pink snake) */
export const Sc5: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const wipe = ramp(f, 0, 9, easeOut);
  const tb = at(TM.back);
  const tr = at(TM.remove);
  const meander = (t: number): [number, number] => [-260 + t * 13, 600 + Math.sin(t / 15) * 210];
  const lissa = (t: number): [number, number] => [960 + Math.sin((t - tb) / 12 - 0.4) * 560, 560 + Math.sin((t - tb) / 8.5) * 250];
  const collapse = ramp(f, tr, tr + 18, easeOut);
  const path = (t: number): [number, number] => {
    let p: [number, number];
    if (t < tb) p = meander(t);
    else { const m = meander(tb), l = lissa(t), k = clamp((t - tb) / 14); p = [m[0] + (l[0] - m[0]) * k, m[1] + (l[1] - m[1]) * k]; }
    return [p[0] + (960 - p[0]) * collapse, p[1] + (540 - p[1]) * collapse];
  };
  const STK = [{ x: 420, y: 330, kind: 6, c1: K.blue, c2: K.green }, { x: 1500, y: 780, kind: 2, c1: "#f2f1f4", c2: K.ink }, { x: 1480, y: 270, kind: 8, c1: K.lav, c2: "#fff" }];
  return (
    <Frame bg={K.bg}>
      <circle cx="960" cy="540" r={wipe * 1200} fill={K.pink} />
      {/* dotted trail */}
      {Array.from({ length: 14 }, (_, i) => {
        const [x, y] = path(f - 40 - i * 3);
        return <circle key={i} cx={x} cy={y + 60} r={7 - i * 0.3} fill={[K.blue, K.green, "#9a9aa0"][i % 3]} opacity={(1 - collapse) * 0.8} />;
      })}
      {STK.map((s, i) => {
        const a = ramp(f, tb - 10 + i * 4, tb + i * 4, easeBack) * (1 - ramp(f, tr + i * 3, tr + i * 3 + 7, (t) => t * t));
        const hit = Math.max(0, 1 - Math.hypot(path(f)[0] - s.x, path(f)[1] - s.y) / 260);
        if (a <= 0) return null;
        return (
          <g key={i} transform={`translate(${s.x} ${s.y}) scale(${a * (1 + hit * 0.15)}) rotate(${Math.sin(f / 10 + i) * 6})`}>
            <g transform="translate(-110 -110)"><TileArt kind={s.kind} s={220} c1={s.c1} c2={s.c2} f={f} /></g>
          </g>
        );
      })}
      {STK.map((s, i) => {
        const t = f - (tr + i * 3 + 6);
        if (t < 0 || t > 22) return null;
        return Array.from({ length: 12 }, (_, k) => {
          const a = (k / 12) * Math.PI * 2;
          return <rect key={`${i}-${k}`} x={s.x + Math.cos(a) * t * 14 - 8} y={s.y + Math.sin(a) * t * 14 - 8} width="16" height="16" fill={[s.c1, s.c2, K.ink][k % 3]} opacity={1 - t / 22} />;
        });
      })}
      <Snake f={f} path={path} n={13} lag={2.4} head={160} grow={Math.min(ramp(f, 4, 30, easeOut), 1 - 0.85 * collapse)} />
    </Frame>
  );
};

/* 6 · "we found a method called NPV" — halftone bloom → kaleidoscope → emblem (E9) */
export const Sc6: React.FC<SP> = ({ from, dur }) => {
  const { f, at } = useLocal(from);
  const bloom = ramp(f, 0, 16, easeOut);
  const grow = ramp(f, 10, at(TM.npv) - 6, easeOut);
  const morph = ramp(f, at(TM.npv) - 22, at(TM.npv) + 8);
  const pal = f >= at(TM.npv) ? 1 : 0;
  const em = ramp(f, at(TM.npv), at(TM.npv) + 12, easeBack);
  // shrink into a tile before the next shot
  const shrink = ramp(f, dur - 14, dur, easeOut);
  const s = interpolate(shrink, [0, 1], [1, 0.14]);
  return (
    <Frame>
      <g transform={`translate(960 540) scale(${s}) translate(-960 -540)`}>
        <rect width="1920" height="1080" fill="#f4f7ea" />
        {grow < 1 && Array.from({ length: 1400 }, (_, i) => {
          const x = (i % 50) * 40 + 20, y = Math.floor(i / 50) * 40 + 20;
          const d = Math.hypot(x - 960, (y - 540) * 1.3) / 900;
          const r = 16 * clamp(1 - Math.abs(d - bloom * 0.8) * 2.2) * (1 - grow);
          return r > 0.5 ? <circle key={i} cx={x} cy={y} r={r} fill={K.lime} /> : null;
        })}
        {grow > 0 && <g opacity={clamp(grow * 3)}><Kaleido f={f} grow={grow} morph={morph} pal={pal} /></g>}
        {em > 0 && <Emblem x={960} y={540} s={250} f={f} a={1} rot={(1 - em) * -90} />}
      </g>
      <Flash f={f} at={at(TM.npv)} d={7} />
    </Frame>
  );
};

/* 7 · instead of a separate service per step, everything in one place — scattered tiles → bento (E10) */
const BENTO_ARTS: Art[] = [artSky, artRabbit, artWave, artScript, artEdit, artBalls, artIdea, artSend];
export const Sc7: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const T = 220, G = 14, X0 = 960 - (6 * T + 5 * G) / 2, Y0 = 540 - (2 * T + G) / 2;
  const slots: [number, number][] = [[0, 0], [1, 0], [0, 1], [1, 1], [4, 0], [5, 0], [4, 1], [5, 1]];
  const apart = ramp(f, at(TM.apart) - 6, at(TM.apart) + 16, easeOut);
  const em = ramp(f, 0, 10, easeOut);
  return (
    <Frame>
      {BENTO_ARTS.map((art, i) => {
        const appear = ramp(f, at(TM.stage) - 10 + i * 3, at(TM.stage) + i * 3, easeBack);
        if (appear <= 0) return null;
        const ang = rnd(i * 5) * Math.PI * 2;
        const R = 330 + apart * 180;
        const fx = 960 + Math.cos(ang) * R * 1.5 - T / 2 + Math.sin(f / 20 + i) * 20;
        const fy = 540 + Math.sin(ang) * R * 0.75 - T / 2 + Math.cos(f / 17 + i) * 16;
        const p = ramp(f, at(TM.together) - 2 + i * 1.5, at(TM.together) + 12 + i * 1.5);
        const [c, r] = slots[i];
        return (
          <g key={i} opacity={appear} >
            <BentoTile from={[fx, fy, (rnd(i) - 0.5) * 40]} to={[X0 + c * (T + G), Y0 + r * (T + G), T, T]} p={p}>
              {(w, h) => (
                <g transform={`scale(${appear})`}>
                  <svg width={w} height={h} overflow="hidden">{art(w, h, f, f - at(TM.stage))}</svg>
                  {p < 1 && <rect width={w} height={h} fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="10 8" opacity={0.5} />}
                </g>
              )}
            </BentoTile>
          </g>
        );
      })}
      {/* dashed "separate" tethers while apart */}
      {apart > 0 && f < at(TM.together) && BENTO_ARTS.map((_, i) => {
        const ang = rnd(i * 5) * Math.PI * 2;
        return <line key={i} x1={960} y1={540} x2={960 + Math.cos(ang) * 420 * 1.5} y2={540 + Math.sin(ang) * 420 * 0.75} stroke="#6b6870" strokeWidth="2" strokeDasharray="6 10" opacity={apart * 0.6} />;
      })}
      <Emblem x={960} y={540} s={interpolate(em, [0, 1], [152, 2 * T + G])} f={f} />
      <Flash f={f} at={at(TM.together) + 10} d={5} color={K.lime} />
    </Frame>
  );
};

/* 8 · idea → script → shots → sound → edit → output… sent (E6 receding cards) */
const PIPE: { t: number; art: Art }[] = [
  { t: TM.idea, art: artIdea }, { t: TM.script, art: artScript }, { t: TM.shots, art: artLand },
  { t: TM.sound, art: artWave }, { t: TM.edit, art: artEdit }, { t: TM.output, art: artSend },
];
export const Sc8: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const ts = PIPE.map((p) => at(p.t) - 3);
  const slide = ts.slice(1).reduce((s, t) => s + ramp(f, t - 2, t + 9, easeOut), 0);
  const fly = ramp(f, at(TM.send), at(TM.send) + 16, (t) => t * t);
  return (
    <Frame>
      <DotField f={f} a={0.5} />
      <g transform={`translate(${960 + fly * 200} 540) scale(${1 + fly * 3.2}) translate(-960 -540)`} opacity={1 - fly * 0.9}>
        <CardRow n={6} x={1280} y={540} w={620} h={760} slide={slide} shrink={0.76} gap={0.75}
          appear={(i) => ramp(f, ts[i], ts[i] + 10, easeBack)}
          render={(i) => PIPE[i].art(620, 760, f, f - ts[i])} />
      </g>
      {fly > 0 && Array.from({ length: 30 }, (_, i) => {
        const a = rnd(i) * Math.PI * 2, r1 = 100 + fly * 700 * rnd(i * 3), r2 = r1 + 120 * fly;
        return <line key={i} x1={960 + Math.cos(a) * r1} y1={540 + Math.sin(a) * r1 * 0.6} x2={960 + Math.cos(a) * r2} y2={540 + Math.sin(a) * r2 * 0.6} stroke="#fff" strokeWidth="2" opacity={1 - fly} />;
      })}
    </Frame>
  );
};

/* 9 · completing the method — portals through worlds (E11) */
const Portal: React.FC<{ p: number; small: [number, number, number, number]; children: React.ReactNode }> = ({ p, small, children }) => {
  const e = easeOut(clamp(p));
  const [sx, sy, sw, sh] = small;
  const x = sx * (1 - e), y = sy * (1 - e), w = sw + (1920 - sw) * e, h = sh + (1080 - sh) * e;
  return (
    <g>
      {e < 1 && <rect x={x - 3} y={y - 3} width={w + 6} height={h + 6} fill="none" stroke="#ffffff" strokeOpacity=".5" strokeWidth="2" />}
      <svg x={x} y={y} width={w} height={h} viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">{children}</svg>
    </g>
  );
};
export const Sc9: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const p1 = ramp(f, at(TM.complete), at(TM.complete) + 22);
  const p2 = ramp(f, at(TM.wow) - 4, at(TM.wow) + 18);
  const in2 = ramp(f, at(TM.outputs), at(TM.outputs) + 10, easeOut);
  const enter = ramp(f, 0, 12, easeOut);
  return (
    <Frame>
      <g transform={`translate(960 540) scale(${0.25 + 0.75 * enter}) translate(-960 -540)`}>
        <SeaWorld w={1920} h={1080} f={f} id="a" />
        <Portal p={p1} small={[700, 330, 520, 420]}>
          <CloudWorld w={1920} h={1080} f={f} id="b" />
          <Prism cx={960} cy={540} f={f} s={0.9 + 0.2 * p1} a={clamp(p1 * 2)} />
          {in2 > 0 && (
            <Portal p={p2} small={[960 - 200 * in2, 540 - 140 * in2, 400 * in2, 280 * in2]}>
              <Galaxy w={1920} h={1080} f={f} id="c" />
              <Emblem x={960} y={540} s={200} f={f} a={clamp(p2 * 2)} />
            </Portal>
          )}
        </Portal>
        {p1 < 0.3 && <Emblem x={960} y={540} s={120} f={f} a={1 - p1 * 3} />}
      </g>
    </Frame>
  );
};

/* 10 · soon you'll make videos without worry — galaxy collapses, symbols converge into the emblem (E12) */
export const Sc10: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const col = ramp(f, 6, 30, easeOut);
  const conv = ramp(f, at(TM.worry) - 8, at(TM.make) - 2, easeOut);
  const em = ramp(f, at(TM.make) - 4, at(TM.make) + 10, easeBack);
  const fade = ramp(f, fr(TM.make - from) + 42, fr(TM.make - from) + 58);
  const SYM = [K.red, K.orange, K.mint, K.blue, K.lav, K.yellow];
  return (
    <Frame>
      {col < 1 && (
        <g transform={`translate(960 540) scale(${1 - col * 0.97}) translate(-960 -540)`} opacity={1 - col}>
          <Galaxy w={1920} h={1080} f={f + 130} id="d" />
        </g>
      )}
      {em < 1 && SYM.map((c, i) => {
        const ang = (i / SYM.length) * Math.PI * 2 + f * 0.01;
        const R = 260 * (1 - conv) + 20;
        const a = ramp(f, 16 + i * 3, 26 + i * 3);
        const x = 960 + Math.cos(ang) * R * 1.4, y = 540 + Math.sin(ang) * R;
        return i % 2 ? <circle key={i} cx={x} cy={y} r={16} fill={c} opacity={a} /> : <rect key={i} x={x - 15} y={y - 15} width="30" height="30" rx="6" fill={c} opacity={a} transform={`rotate(${f * 4} ${x} ${y})`} />;
      })}
      {em > 0 && <Emblem x={960} y={540} s={210} f={f} a={1} rot={(1 - em) * 45} />}
      {em > 0 && [0, 1, 2].map((k) => {
        const t = f - at(TM.make) - k * 6;
        return t > 0 && t < 30 ? <circle key={k} cx="960" cy="540" r={150 + t * 12} fill="none" stroke={K.lime} strokeWidth={5 * (1 - t / 30)} opacity={1 - t / 30} /> : null;
      })}
      <rect width="1920" height="1080" fill="#000" opacity={fade} />
    </Frame>
  );
};

