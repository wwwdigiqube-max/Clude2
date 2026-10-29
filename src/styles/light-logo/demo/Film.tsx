// Light Logo · demo = the reference film: an AI-course intro, 15 s, 16:9, on a 12 s song (untouched) + a reverb
// ring-out to 15 s (pipeline/tail.cjs). The kit ships it silent. Everything happens on the song's own hits:
//   0–1.3 warp in, light rushes into the spark on the intro kicks · 1.3–2.3 the spark inhales on the riser
//   2.30 explosion → galaxy · 2.65 a neural network is built eighth by eighth, signals on the kicks
//   4.13 the network becomes a brain, arcs crackle around it · 5.15 it shatters · 5.6 the AI core (calm chords)
//   7.63 collapse · 7.95 / 8.13 / 8.38 / 8.62 AI chip → camera aperture → play → sparkle (hi-hats)
//   9.12–9.85 the sparkle streams into the logo, left to right, the halves apart along the cut line
//   10.30 big hit: the halves slam shut, arcs run along the cut · 10.59 the red slash streaks in as red light
//   10.7–11.1 the second line spreads in · then the logo of light breathes in its own space until the end (sweeps).
// Your logo: node tools/logo-trace.mjs logo.png <this folder> --accent=#hex --sub=x0,y0,x1,y1 --only=pts
// Your song: tools/beat-map.mjs → beats.json, then move TABLE / the hit constants / the camera keys onto its hits.
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { pulse, smooth } from "../../light-swarm/math";
import { applyCamera, cameraSpline, glitchAt, transitionAt, type CamKey, type Transition } from "../../light-swarm/timeline";
import { BEATS as BEATS0, FPS, H, KICKS as KICKS0, LY, SNARES as SNARES0, W, ease, hit, ramp } from "./lib";
import { Grain, Line } from "./ui";
import { buildLightEngine, type LightEngine } from "../lib/engine";
import { LOGO_DIST, LOGO_FOV, logoLayout, type LogoPts } from "../lib/shapes";
import LOGO_PTS from "./logo-pts.json";

const LOGO = LOGO_PTS as LogoPts;
const LAY = logoLayout(LOGO);
export const LIGHTLOGO_FPS = FPS;
export const LIGHTLOGO_DUR = 15;
export const LIGHTLOGO_FRAMES = LIGHTLOGO_DUR * FPS;
/** still times for the -Look composition */
export const LIGHTLOGO_LOOK = [0.3, 0.9, 1.8, 2.25, 2.4, 2.9, 3.4, 3.9, 4.3, 4.7, 5.0, 5.13, 5.25, 6.2, 7.0, 7.7, 7.9, 8.2, 8.45, 8.7, 9.3, 9.7, 10.0, 10.25, 10.33, 10.45, 10.55, 10.62, 10.8, 11.0, 11.2, 11.8, 12.2, 13.0, 14.0, 14.9];

// ─────────────── the song's grid (beats.json of the original song) extended past its end for the ring-out
const BEAT = 0.4955;
const BEATS = [...BEATS0, ...Array.from({ length: 8 }, (_, i) => BEATS0[BEATS0.length - 1] + (i + 1) * BEAT)];
const EIGHTHS = BEATS.flatMap((b, i) => (i + 1 < BEATS.length ? [b, (b + BEATS[i + 1]) / 2] : [b]));
const KICKS = KICKS0;
const SNARES = SNARES0;
const RISER = 2.3; // the riser's hit
const IMPACT = 5.15;
const SLAM = 10.3; // the big hit
const DOWN = 10.586; // the downbeat after it
const within = (t: number, a: number, b: number) => t >= a && t < b;

// builds quantise to eighths (the engine's grid); departures = t0 + D·buildOrder
const TABLE: Transition[] = [
  { t0: 0.02, D: 1.15, F: 0.38, q: 1, a: "cloud", b: "seed", swirl: 2.4, turb: 6, dim: 1.0 },
  { t0: RISER, D: 0.12, F: 0.8, q: 0, a: "seed", b: "galaxy", swirl: 3.2, turb: 5, dim: 0.8 },
  { t0: 2.63, D: 0.83, F: 0.4, q: 1, a: "galaxy", b: "network", swirl: 0.4, turb: 2.5, dim: 0.55 },
  { t0: 4.11, D: 0.55, F: 0.34, q: 1, a: "network", b: "brain", swirl: 0.7, turb: 2.5, dim: 0.55 },
  { t0: IMPACT, D: 0.1, F: 1.1, q: 0, a: "brain", b: "embers", swirl: 0.6, turb: 9, dim: 0.07 },
  { t0: 5.62, D: 1.7, F: 0.8, q: 1, a: "embers", b: "core", swirl: 0.5, turb: 2.5, dim: 0.6 },
  { t0: 7.63, D: 0.08, F: 0.22, q: 0, a: "core", b: "chip", swirl: 1.2, turb: 2, dim: 0.35 },
  { t0: 8.13, D: 0.02, F: 0.08, q: 0, a: "chip", b: "aperture", swirl: 0.35, turb: 0.8, dim: 0.3 },
  { t0: 8.38, D: 0.02, F: 0.08, q: 0, a: "aperture", b: "play", swirl: -0.35, turb: 0.8, dim: 0.3 },
  { t0: 8.62, D: 0.02, F: 0.09, q: 0, a: "play", b: "sparkle", swirl: 0.4, turb: 0.8, dim: 0.3 },
  // the letters leave the sparkle on four eighths (9.12 · 9.36 · 9.60 · 9.85), left to right
  { t0: 9.1, D: 0.95, F: 0.16, q: 1, a: "sparkle", b: "logo", swirl: 0.25, turb: 1.8, dim: 0.6 },
];
const HITS = [RISER, 2.654, IMPACT, 7.63, 8.13, 8.38, 8.62, SLAM];
const BIG = [RISER, IMPACT];

// ─────────────── camera A (0 → 7.95, orbits) and camera B (front-on symbols, the logo camera, then a slow push)
const KEYS_A: CamKey[] = [
  [0.0, -0.4, 0.16, 520, 0, 0, 0, 50],
  [0.62, -0.28, 0.12, 190, 0, 0, 0, 48],
  [1.3, -0.08, 0.06, 52, 0, 0, 0, 44],
  [2.26, 0.0, 0.05, 38, 0, 0, 0, 44],
  [2.75, 0.32, 0.5, 104, 0, 0, 0, 46],
  [3.3, 0.06, 0.12, 92, 0, 0, 0, 46],
  [4.02, -0.22, 0.06, 70, 0, 0, 0, 46],
  [4.45, 0.4, 0.1, 62, 0, 0, 0, 46],
  [5.1, 1.3, 0.08, 58, 0, 0, 0, 46],
  [5.6, 1.6, 0.18, 82, 0, 0, 0, 46],
  [7.62, 2.5, 0.22, 52, 0, 0, 0, 46],
];
const KEYS_B: CamKey[] = [
  [7.63, 0.0, 0.0, 78, 0, 0, 0, LOGO_FOV],
  [8.75, 0.0, 0.0, 84, 0, 0, 0, LOGO_FOV],
  [9.1, 0.0, 0.0, 114, 0, 0, 0, LOGO_FOV],
  [9.75, 0.0, 0.0, LOGO_DIST, 0, 0, 0, LOGO_FOV],
  [10.6, 0.0, 0.0, LOGO_DIST, 0, 0, 0, LOGO_FOV],
  [15.0, 0.035, 0.025, 88, 0, 0, 0, LOGO_FOV],
];
const camA = cameraSpline(KEYS_A, [[RISER, 1.6], [2.654, 0.5], [IMPACT, 1.7]]);
const camB = cameraSpline(KEYS_B, [[7.63, 0.5], [8.13, 0.35], [8.38, 0.35], [SLAM, 0.6]]);
const CUT = 7.63; // camera cut to front-on, on the chip
const cam = (t: number) => (t < CUT ? camA(t) : camB(t));

/** the logo halves: born apart along the cut line, slamming shut on the big hit (px; the 3D uses world units) */
export const splitPx = (t: number) => (t < 9.0 ? 0 : 74 * ease.out(ramp(t, 9.0, 9.15)) * (1 - ease.in(ramp(t, 10.2, SLAM))));
const WPP = (2 * LOGO_DIST * Math.tan((LOGO_FOV / 2) * (Math.PI / 180))) / 1080;
// the logo's ends: world x (sweeps of light, the arcs along the cut) and 1080p screen x (the 2D cut line)
const LX0 = LAY.x0w;
const LX1 = LAY.x1w;

function applyTr(E: LightEngine, t: number) {
  const tr = transitionAt(TABLE, t);
  const pu = E.partU;
  pu.sA.value = E.shapeIndex(tr.a);
  pu.sB.value = E.shapeIndex(tr.b);
  pu.offA.value.set(...(tr.oa ?? [0, 0, 0]));
  pu.offB.value.set(...(tr.ob ?? [0, 0, 0]));
  pu.t0.value = tr.t0;
  pu.D.value = tr.D;
  pu.F.value = tr.F;
  pu.quant.value = tr.q;
  pu.swirl.value = tr.swirl;
  pu.turb.value = tr.turb;
  pu.flyDim.value = tr.dim ?? 0.6;
  pu.arrGain.value = tr.D < 0.1 ? 0.3 : 1.5;
  pu.tPrev.value = t - 0.06;
  let lk = -9;
  for (const k of KICKS) if (k <= t) lk = k;
  pu.lastKick.value = lk;
}

function direct(t: number, E: LightEngine, c: THREE.PerspectiveCamera) {
  const tt = t;
  const camNow = (x: number) => (tt >= CUT && x < CUT ? camB(CUT) : cam(x));
  E.setPrev(applyCamera(camNow, c, tt));
  const kick = pulse(tt, KICKS, 10);
  // a small lens punch on the kicks of the groove and the hi-hat run
  if (within(tt, 2.65, IMPACT) || within(tt, CUT, 8.8)) {
    c.fov -= 1.6 * kick;
    c.updateProjectionMatrix();
  }
  E.setTime(tt);
  const k = cam(tt);
  const beat = pulse(tt, BEATS, 7);
  applyTr(E, tt);
  const pu = E.partU;
  pu.kick.value = kick;
  pu.beat.value = beat;
  const inhale = ramp(tt, 1.75, RISER); // the spark sucks everything in before the explosion
  pu.pAmt.value = (0.4 + 0.6 * smooth(0, 0.35, tt)) * (within(tt, IMPACT, 5.6) ? 0.42 + 0.58 * ramp(tt, 5.22, 5.6) : 1);
  pu.energy.value = within(tt, 5.62, 7.63) ? 0.12 : 0;
  pu.red.value = within(tt, 4.95, IMPACT) ? 0.9 : within(tt, IMPACT, 5.6) ? 0.5 : within(tt, 7.5, CUT) ? 0.7 : 0;
  pu.sizeK.value = (within(tt, CUT, 9.1) ? 1.15 : 1) * (1 - 0.35 * inhale * (tt < RISER ? 1 : 0));
  pu.spin.value = within(tt, RISER, 2.9) ? 2.6 * (1 - ease.out(ramp(tt, RISER, 2.9))) + 0.4 : 0;
  pu.jolt.value = splitPx(tt) * WPP;
  // the logo: slash streaks in onto the downbeat, ACADEMY spreads in, sweeps of light run across the letters
  pu.slashK.value = tt < 10.42 ? 0 : ease.out(ramp(tt, 10.42, DOWN));
  pu.acadP.value = 1.3 * ramp(tt, 10.66, 11.15);
  const sw = (a: number) => ramp(tt, a, a + 0.75);
  const s1 = sw(11.85);
  const s2 = sw(13.55);
  const sweep = s1 > 0 && s1 < 1 ? s1 : s2 > 0 && s2 < 1 ? s2 : -1;
  pu.sweepX.value = sweep < 0 ? -999 : LX0 - 8 + (LX1 - LX0 + 16) * ease.io(sweep);
  pu.sweepAmt.value = sweep < 0 ? 0 : 1.7 * Math.sin(Math.PI * sweep);

  // depth of field: focus on the look point; how shallow depends on the scene
  E.dof.focus.value = k.pos.distanceTo(k.look);
  E.dof.bokeh.value = tt < RISER ? 18 : tt < 4.1 ? 26 : tt < IMPACT ? 34 : tt < CUT ? 40 : tt < 9.1 ? 16 : 7;
  E.dof.maxCoc.value = 26;

  // bursts (streak sparks) and shockwave rings
  const bu = E.burstU;
  const ev = (i: number, at: number, speed: number, drag: number, curl: number, life: number) => {
    bu.evT.value[i] = at;
    bu.evC.value[i].set(0, 0, 0);
    bu.evP.value[i].set(speed, drag, curl, life);
  };
  ev(0, RISER, 190, 1.4, 1.6, 2.0);
  ev(1, 2.654, 50, 2.4, 1.2, 0.9);
  ev(2, 4.13, 55, 2.2, 1.2, 0.9);
  ev(3, IMPACT, 150, 1.6, 1.6, 1.8);
  ev(4, CUT, 55, 2.4, 1.0, 0.6);
  ev(5, 8.62, 45, 2.4, 1.2, 0.6);
  const ru = E.ringU;
  const ring = (i: number, at: number, r: number, speed: number, life: number, b: number) => {
    ru.rT.value[i] = at;
    ru.rC.value[i].set(0, 0, 0);
    ru.rP.value[i].set(r, speed, life, b);
  };
  ring(0, 0.7, 30, 6.0, 0.5, 0.45);
  ring(1, RISER, 120, 3.2, 1.2, 0.7);
  ring(2, 2.654, 60, 4.5, 0.6, 0.35);
  ring(3, IMPACT, 130, 3.0, 1.2, 0.7);
  ring(4, CUT + 0.08, 52, 6.0, 0.45, 0.6);
  ring(5, SLAM, 95, 3.4, 1.1, 0.55);

  // electric arcs: around the brain before it breaks, inside the core, along the cut line on the slam
  const au = E.arcU;
  let arc = 0;
  let mode = 0;
  let R = 16;
  if (within(tt, 4.45, IMPACT)) arc = 0.25 + 0.6 * ramp(tt, 4.45, IMPACT) + 0.5 * pulse(tt, SNARES, 14);
  else if (within(tt, 6.6, 7.6)) {
    arc = 0.35 * pulse(tt, BEATS, 8);
    R = 13;
  } else if (within(tt, CUT + 0.12, 8.12)) {
    arc = 0.7;
    R = 24;
  } else if (within(tt, SLAM, SLAM + 0.45)) {
    arc = 1.2 * (1 - ramp(tt, SLAM + 0.1, SLAM + 0.45));
    mode = 1;
  } else if (within(tt, 11.1, 11.4)) {
    arc = 0.55 * (1 - ramp(tt, 11.1, 11.4));
    mode = 1;
  }
  au.arcAmt.value = arc;
  au.arcMode.value = mode;
  au.arcR.value = R;
  au.arcC.value.set(0, 0, 0);
  au.arcX.value.set(LX0, LX1);

  // the glow at the heart
  const cu = E.coreU;
  let amt = 0;
  let size = 24;
  let red = 0;
  if (tt < RISER) {
    amt = smooth(0.1, 1.2, tt) * (0.7 + 0.8 * inhale) + 0.45 * pulse(tt, KICKS, 12);
    size = 14 + 12 * beat + 18 * inhale;
  } else if (tt < 2.9) {
    amt = 0.5 + 1.3 * hit(tt, RISER, 0.12);
    size = 22 + 16 * hit(tt, RISER, 0.2);
  } else if (within(tt, 4.9, IMPACT)) {
    amt = 0.5 * ramp(tt, 4.9, IMPACT);
    red = 0.8;
  } else if (within(tt, 5.62, 7.63)) {
    amt = smooth(5.7, 6.4, tt) * (0.85 + 0.3 * beat);
    size = 26 + 10 * beat;
  } else if (within(tt, CUT, 9.1)) {
    amt = 0.12 + 0.3 * hit(tt, CUT, 0.08);
    size = 18;
  }
  cu.cAmt.value = amt;
  cu.cSize.value = size;
  cu.cRed.value = red;
  cu.cPos.value.set(0, 0, 0);

  // nebula mood
  const nb = E.neb.U;
  nb.time.value = tt;
  let bright = 0.5;
  let energy = 0.0;
  let radial = 0;
  if (tt < RISER) bright = 0.25 + 0.3 * ramp(tt, 0, RISER);
  else if (tt < 2.9) {
    bright = 0.62;
    radial = 0.6;
  } else if (tt < IMPACT) bright = 0.55;
  else if (tt < 5.6) bright = 0.32;
  else if (tt < 7.63) {
    bright = 0.66;
    energy = 0.22;
  } else if (tt < 9.1) bright = 0.45;
  else bright = 0.42 - 0.08 * ramp(tt, 9.6, 10.3) + 0.12 * hit(tt, SLAM, 0.4);
  nb.bright.value = bright * (1 + 0.24 * kick);
  nb.energy.value = energy;
  nb.pulse.value = kick * 0.25 + 1.8 * hit(tt, RISER, 0.5) + 1.1 * hit(tt, IMPACT, 0.45) + 0.6 * hit(tt, SLAM, 0.4);
  nb.radial.value = radial;
  nb.red.value = within(tt, 4.7, IMPACT) ? 0.6 * ramp(tt, 4.7, IMPACT) : 0;
  nb.eC.value.set(0, 0, 0);
  E.dustU.amt.value = 0.85;

  const g = E.grade;
  g.set("seed", Math.floor(tt * 30));
  g.set("glitch", glitchAt(tt, HITS, BIG, SNARES, TABLE));
  g.set("flash", 0);
  g.set("black", 0);
  g.set("exposure", within(tt, IMPACT, 5.6) ? 0.72 + 0.08 * ramp(tt, 5.3, 5.6) : 1);
  g.set("ca", 0.0012 + 0.0028 * kick + 0.004 * hit(tt, RISER, 0.12) + 0.003 * hit(tt, SLAM, 0.1));
  g.set("streak", 0.35 + 1.6 * hit(tt, RISER, 0.25) + 1.2 * hit(tt, IMPACT, 0.25) + 1.4 * hit(tt, SLAM, 0.3) + (tt > SLAM ? 0.45 : 0));
  E.bloom.intensity = (1.3 + 0.35 * kick + 0.4 * hit(tt, RISER, 0.3) + 0.3 * hit(tt, IMPACT, 0.3) + 0.35 * hit(tt, SLAM, 0.3)) * (within(tt, CUT, 9.1) ? 0.8 : 1) + (tt > SLAM ? 0.25 : 0);
}

const World: React.FC<{ t: number }> = ({ t }) => {
  const { gl, scene, camera, size } = useThree();
  // deps = the numbers, never the size object (otherwise the whole world is rebuilt every frame)
  const E = useMemo(() => buildLightEngine(gl, scene, camera as THREE.PerspectiveCamera, size.width, size.height, EIGHTHS, LOGO), [gl, scene, camera, size.width, size.height]);
  useLayoutEffect(() => {
    direct(t, E, camera as THREE.PerspectiveCamera);
  }, [t, E, camera]);
  useFrame(() => E.render(), 1);
  return null;
};

/**
 * 1920×1080 design space; at 4K the 2D layers scale ×2, the 3D renders natively. times = still mode (one time in
 * seconds per frame) · audio = a file in public/ (your song, e.g. "v01/song.wav"; the kit ships the film silent).
 */
export const LightLogoVideo: React.FC<{ times?: number[]; audio?: string }> = ({ times, audio }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const S = height / H;
  const t = times ? times[Math.min(frame, times.length - 1)] : frame / FPS;
  const split = splitPx(t);
  const lineO = ramp(t, 9.9, 10.1) * (1 - ramp(t, SLAM + 0.05, SLAM + 0.3));
  const slam = hit(t, SLAM, 0.08);
  return (
    <AbsoluteFill style={{ background: "#050403" }}>
      {(
        <ThreeCanvas width={width} height={height} gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}>
          <World t={t} />
        </ThreeCanvas>
      )}
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `scale(${S})`, transformOrigin: "0 0" }}>
        {lineO > 0 && <Line x0={LAY.sx0 - 45 - split} x1={LAY.sx1 + 45 + split} y={LY} th={2 + 5 * slam} glow={1.2 + 2.5 * slam} o={lineO * 0.9} />}
        <Grain frame={frame} o={0.045} />
      </div>
      {audio && !times && (
        <Sequence from={0} layout="none">
          <Html5Audio src={staticFile(audio)} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
