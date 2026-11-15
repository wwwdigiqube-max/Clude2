// Part 2 edit pilot: the crocodile scene (~33 s). Layers: parallax cutouts, ash-snow particles, mood camera (tense shake + punch-ins),
// cold grade, sound design. This is the template for the full Part 2 edit.
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";

export const P2_FPS = 30;
const F = (s: number) => Math.round(s * P2_FPS);
const fr = (n: string) => staticFile(`dino-p2/frames/p2-${n}.jpg`);
const cut = (f: string) => staticFile(`dino-p2/cut/${f}`);
const sfx = (f: string) => staticFile(`dino/sfx/${f}`);

type Cam = { x: number; y: number; s: number }; // focus point (0..1) and zoom
type Shot = { a: number; b: number; img?: string; bg?: string; fg?: string; from: Cam; to: Cam; shake?: number; punch?: number;
  par?: number; grade?: "cold" | "colder"; flash?: number; snow?: boolean };

// times in seconds from the start of the slice (vo starts at 0.48)
const SHOTS: Shot[] = [
  { a: 0, b: 8.88, bg: cut("bg-111.jpg"), fg: cut("fg-111.png"), from: { x: .55, y: .5, s: 1.04 }, to: { x: .6, y: .55, s: 1.16 }, par: 1, snow: true },
  { a: 8.88, b: 10.47, img: fr("103"), from: { x: .5, y: .62, s: 1.5 }, to: { x: .5, y: .62, s: 1.62 }, snow: true, grade: "colder" },
  { a: 10.47, b: 13.31, img: fr("111"), from: { x: .14, y: .47, s: 3.0 }, to: { x: .14, y: .47, s: 3.15 }, punch: 12.45, snow: true },
  { a: 13.31, b: 16.4, img: fr("111"), from: { x: .82, y: .72, s: 2.2 }, to: { x: .76, y: .7, s: 2.45 }, snow: true, grade: "colder" },
  { a: 16.4, b: 20.4, bg: cut("bg-115.jpg"), fg: cut("fg-115.png"), from: { x: .5, y: .5, s: 1.12 }, to: { x: .52, y: .5, s: 1.0 }, par: -1.4, shake: 18.97, flash: 18.97, snow: true },
  { a: 20.4, b: 23.36, img: fr("115"), from: { x: .62, y: .52, s: 2.1 }, to: { x: .62, y: .52, s: 2.25 }, grade: "colder", snow: true },
  { a: 23.36, b: 27.01, img: cut("D3b.jpg"), from: { x: .55, y: .45, s: 1.6 }, to: { x: .55, y: .45, s: 1.85 }, grade: "colder" },
  { a: 27.01, b: 33.4, bg: cut("bg-117.jpg"), fg: cut("fg-117.png"), from: { x: .45, y: .55, s: 1.15 }, to: { x: .6, y: .45, s: 1.3 }, par: 1.6, snow: true },
];
export const P2_PILOT_FRAMES = F(33.4);

const camStyle = (c: Cam): React.CSSProperties => ({ transform: `scale(${c.s}) translate(${(0.5 - c.x) * 100}%, ${(0.5 - c.y) * 100}%)` });

const Snow: React.FC<{ n?: number }> = ({ n = 90 }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ pointerEvents: "none" }}>
    {Array.from({ length: n }, (_, i) => {
      const depth = 0.4 + random(`d${i}`) * 0.9, size = 2 + depth * 4.5, speed = 0.9 + depth * 1.6;
      const y = ((random(`y${i}`) * 1200 + f * speed) % 1200) - 60;
      const x = random(`x${i}`) * 1980 + Math.sin(f / (25 + random(`w${i}`) * 30) + i) * 18 * depth - 30;
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%",
        background: "rgba(225,228,232,0.85)", filter: depth < 0.7 ? "blur(1.5px)" : "none", opacity: 0.35 + depth * 0.45 }} />;
    })}
  </AbsoluteFill>;
};

const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame(), len = F(s.b - s.a);
  const t = interpolate(f, [0, len], [0, 1], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) });
  const lerp = (k: keyof Cam) => s.from[k] + (s.to[k] - s.from[k]) * t;
  let cam: Cam = { x: lerp("x"), y: lerp("y"), s: lerp("s") };
  if (s.punch) { const p = F(s.punch - s.a); cam = { ...cam, s: cam.s * interpolate(f, [p, p + 3], [1, 1.18], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }; }
  let sx = 0, sy = 0;
  if (s.shake) { const k = F(s.shake - s.a), amp = interpolate(f, [k - 1, k, k + 14], [0, 26, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    sx = (random(`sx${f}`) - .5) * amp; sy = (random(`sy${f}`) - .5) * amp; }
  const par = (s.par ?? 0) * t * 1.6; // fg drifts more than bg -> depth
  const grade = s.grade === "colder" ? "saturate(0.75) brightness(0.92) contrast(1.08)" : "saturate(0.88) contrast(1.05)";
  const fl = s.flash ? interpolate(f, [F(s.flash - s.a) - 1, F(s.flash - s.a), F(s.flash - s.a) + 5], [0, 0.55, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const img: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" };
  return <AbsoluteFill style={{ background: "black", overflow: "hidden" }}>
    <AbsoluteFill style={{ ...camStyle(cam), filter: grade, translate: `${sx}px ${sy}px` }}>
      {s.img && <Img src={s.img} style={img} />}
      {s.bg && <Img src={s.bg} style={{ ...img, transform: `translateX(${-par * 0.4}%) scale(1.03)` }} />}
      {s.fg && <Img src={s.fg} style={{ ...img, transform: `translateX(${par}%) scale(${1.03 + Math.abs(s.par ?? 0) * t * 0.025})` }} />}
    </AbsoluteFill>
    {s.snow && <Snow />}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(40,60,90,0.12), rgba(10,20,40,0.18))", mixBlendMode: "multiply" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    {fl > 0 && <AbsoluteFill style={{ background: "white", opacity: fl }} />}
  </AbsoluteFill>;
};

const S = (t: number, file: string, vol = 1, dur?: number) => (
  <Sequence from={F(t)} durationInFrames={dur ? F(dur) : undefined}><Audio src={sfx(file)} volume={vol} /></Sequence>);

export const P2Pilot: React.FC = () => (
  <AbsoluteFill style={{ background: "black" }}>
    {SHOTS.map((s, i) => <Sequence key={i} from={F(s.a)} durationInFrames={F(s.b - s.a)}><ShotView s={s} /></Sequence>)}
    <Audio src={staticFile("dino-p2/pilot-vo.mp3")} />
    {/* beds */}
    <Audio src={sfx("river.wav")} volume={(f) => interpolate(f, [0, 20, F(16), F(20), F(31), F(33.4)], [0, 0.22, 0.22, 0.1, 0.12, 0], { extrapolateRight: "clamp" })} loop />
    <Audio src={sfx("wind.wav")} volume={0.12} loop />
    {/* events */}
    {S(1.2, "dig.wav", 0.35, 3)}
    {S(8.9, "water-surge.wav", 0.18, 1.6)}
    {S(10.45, "fandogh.wav", 0.8, 1.2)}
    {S(13.3, "heart.wav", 0.5, 3.4)}
    {S(16.5, "lib-whoosh.wav", 0.5)}
    {S(18.85, "water-surge.wav", 0.75, 2.5)}
    {S(18.97, "lib-thud.wav", 1.0)}
    {S(18.97, "stomp.wav", 0.45)}
    {S(20.4, "heart.wav", 0.4, 2.8)}
    {S(20.6, "breath.wav", 0.45, 2.6)}
    {S(27.6, "dig.wav", 0.4, 1.8)}
    {S(30.6, "footstep_grass_000.ogg", 0.7)}{S(31.0, "footstep_grass_001.ogg", 0.7)}{S(31.4, "footstep_grass_000.ogg", 0.7)}{S(31.8, "footstep_grass_001.ogg", 0.6)}
  </AbsoluteFill>
);
