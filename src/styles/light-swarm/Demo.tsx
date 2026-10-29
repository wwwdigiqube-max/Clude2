// Light Swarm demo film "Rise" (31 s, 16:9, no text, no characters):
// scattered light -> seed -> TREE (growth) -> pressure -> DIAMOND (strength) -> shatter, embers
// -> PHOENIX (rebirth) -> cold blue flame -> CROWN (mastery) -> star -> drop: galaxy -> a new seed.
// Every shape is built on the beat. To make a new film: copy this file, make a beat map with
// tools/beat-map.mjs, then edit TABLE (which shape when), KEYS (camera) and the scene moods.
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import T from "./demo-timing.json";
import { buildSwarmEngine, type SwarmEngine } from "./engine";
import { pulse, ramp, smooth } from "./math";
import { SHAPES } from "./shapes";
import { applyCamera, applyTransition, cameraSpline, glitchAt, type CamKey, type Transition } from "./timeline";

export const SWARM_DEMO_FRAMES = 929;
const B = T.bars;
const END = B[11];
const C = T.cues; // ignite = phoenix bursts into flame, dim = the star fades, drop = the big hit
const within = (t: number, a: number, b: number) => t >= a && t < b;
const SEED: [number, number, number] = [0, -14, 0];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const TABLE: Transition[] = [
  { t0: -0.01, D: 1.0, F: 0.9, q: 0, a: "cloud", b: "seed", ob: SEED, swirl: 2.0, turb: 8, dim: 1.0 },
  { t0: B[1], D: 2.9, F: 0.75, q: 1, a: "seed", b: "tree", oa: SEED, swirl: 0.3, turb: 2.5, dim: 0.5 },
  { t0: B[3], D: 0.45, F: 0.5, q: 0, a: "tree", b: "seed", swirl: 1.6, turb: 3, dim: 0.45 },
  { t0: 8.14, D: 2.9, F: 0.62, q: 1, a: "seed", b: "diamond", swirl: 0.4, turb: 2, dim: 0.6 },
  { t0: B[5], D: 0.12, F: 1.1, q: 0, a: "diamond", b: "embers", swirl: 0.6, turb: 9, dim: 0.18 },
  { t0: 13.86, D: 2.5, F: 0.85, q: 1, a: "embers", b: "phoenix", swirl: 0.5, turb: 3, dim: 0.6 },
  { t0: C.ignite, D: 0.55, F: 0.7, q: 0, a: "phoenix", b: "vortex", ob: [0, 6, 0], swirl: 2.5, turb: 3, dim: 0.3 },
  { t0: B[8], D: 2.9, F: 0.75, q: 1, a: "vortex", b: "crown", oa: [0, 6, 0], swirl: 0.3, turb: 2, dim: 0.6 },
  { t0: B[10], D: 0.25, F: 0.4, q: 0, a: "crown", b: "seed", swirl: 1.8, turb: 3, dim: 0.45 },
  { t0: C.drop, D: 0.1, F: 0.9, q: 0, a: "seed", b: "galaxy", swirl: 1.5, turb: 8, dim: 0.35 },
  { t0: 30.1, D: 0.12, F: 0.35, q: 0, a: "galaxy", b: "seed", swirl: 1.0, turb: 2, dim: 0.5 },
];
const HITS = [B[3], B[5], C.ignite, B[8], B[10], C.drop, END];
const BIG = [B[5], C.drop, END];
const KEYS: CamKey[] = [
  [0.0, 0.0, -0.05, 105, 0, -14, 0, 44],
  [1.55, 0.1, -0.03, 30, 0, -14, 0, 44],
  [3.6, 0.45, -0.08, 58, 0, -4, 0, 46],
  [5.6, 0.8, -0.06, 84, 0, 3, 0, 46],
  [7.43, 1.05, 0.02, 80, 0, 3, 0, 46],
  [8.14, 1.25, 0.16, 42, 0, 0, 0, 46],
  [10.3, 1.7, 0.3, 52, 0, 0, 0, 46],
  [12.6, 2.15, 0.26, 44, 0, 0, 0, 46],
  [13.15, 2.3, 0.2, 38, 0, 0, 0, 46],
  [13.9, 2.55, 0.1, 120, 0, 4, 0, 46],
  [16.0, 2.7, 0.05, 100, 0, 5, 0, 46],
  [19.4, 2.95, 0.1, 84, 0, 6, 0, 46],
  [20.6, 3.6, 0.32, 74, 0, 6, 0, 48],
  [21.72, 4.0, 0.36, 70, 0, 4, 0, 48],
  [24.6, 4.7, 0.28, 64, 0, 3, 0, 46],
  [27.43, 5.2, 0.22, 54, 0, 3, 0, 46],
  [28.84, 5.45, 0.18, 34, 0, 0, 0, 46],
  [29.7, 5.65, 0.62, 140, 0, 0, 0, 48],
  [30.25, 5.75, 0.6, 120, 0, 0, 0, 48],
  [30.95, 5.8, 0.55, 70, 0, 0, 0, 48],
];
const cam = cameraSpline(KEYS, [[B[1], 0.5], [B[5], 1.2], [16.0, 0.6], [C.drop, 1.4], [END, 0.8]]);

function direct(t: number, E: SwarmEngine, c: THREE.PerspectiveCamera) {
  E.setPrev(applyCamera(cam, c, t));
  E.setTime(t);
  const beat = pulse(t, T.beats, 7);
  const kick = pulse(t, T.kicks, 10);
  const dim = within(t, C.dim + 0.08, C.dim + 0.5) ? 1 : 0;
  const fadeOut = smooth(30.62, 30.95, t);

  // ---- the swarm
  applyTransition(E, TABLE, t, T.kicks);
  const pu = E.partU;
  pu.kick.value = kick;
  pu.beat.value = beat;
  pu.pAmt.value = (dim ? 0.55 : 1) * (1 - fadeOut);
  pu.energy.value = t >= C.drop ? 0.3 : 0;
  pu.red.value = within(t, B[3], 8.3) ? 0.9 : within(t, B[5], 14.2) ? 0.6 : 0;
  pu.sizeK.value = within(t, B[10], C.drop) ? 1.2 : 1;

  // ---- spark bursts
  const bu = E.burstU;
  const ev = (i: number, tt: number, p: THREE.Vector3, speed: number, drag: number, curl: number, life: number) => {
    bu.evT.value[i] = tt;
    bu.evC.value[i].copy(p);
    bu.evP.value[i].set(speed, drag, curl, life);
  };
  ev(0, B[1], V(...SEED), 40, 2.5, 1.0, 1.6);
  ev(1, B[5], V(0, 0, 0), 110, 1.6, 1.6, 1.8);
  ev(2, C.drop, V(0, 0, 0), 230, 1.1, 2.0, 2.4);
  ev(3, END, V(0, 0, 0), 120, 1.6, 1.0, 1.0);
  ev(4, C.ignite, V(0, 6, 0), 60, 2.0, 2.0, 1.5);
  ev(5, -99, V(0, 0, 0), 1, 1, 1, 1);

  // ---- core glow: the seed, the pressure core, the star
  const cu = E.coreU;
  let amt = 0, size = 24, red = 0, green = 0.3;
  const pos = V(0, 0, 0);
  if (t < 4.6) {
    pos.set(...SEED);
    amt = smooth(0.3, 1.5, t) * 0.9 * (1 - smooth(B[1] + 0.3, 4.6, t)) + (t >= B[1] ? 0.8 * Math.exp(-(t - B[1]) * 8) : 0);
    size = 18 + 10 * beat;
  } else if (within(t, B[3], 9.4)) {
    amt = smooth(B[3], 8.0, t) * 1.1 * (1 - smooth(8.3, 9.4, t));
    size = 22;
    red = 0.8;
  } else if (within(t, B[10], END + 0.7)) {
    amt = smooth(27.6, 28.1, t) * (dim ? 0.18 : 1) * (t > C.drop ? 0.55 : 1) + (t >= C.drop ? 2.0 * Math.exp(-(t - C.drop) * 4) : 0) + (t >= 30.15 ? smooth(30.15, 30.3, t) * 1.3 : 0);
    size = 26 + 10 * beat;
    green = t > C.drop ? 0.6 : 0.3;
  }
  cu.cAmt.value = amt * (1 - fadeOut);
  cu.cSize.value = size;
  cu.cRed.value = red;
  cu.cGreen.value = green;
  cu.cPos.value.copy(pos);

  // ---- nebula mood per scene
  const nb = E.neb.U;
  nb.time.value = t;
  let bright = 0.62, energy = 0.18, nred = 0, radial = 0;
  const eC = V(0, 0, 0);
  if (t < B[1]) bright = 0.35 + 0.25 * ramp(t, 0, B[1]);
  else if (t < B[3]) {
    energy = 0.35;
    eC.set(0, 12, 0);
  } else if (t < 8.14) {
    nred = 0.6;
    bright = 0.55;
  } else if (t < B[5]) {
    bright = 0.7;
    energy = 0.12;
  } else if (t < 13.86) {
    nred = 0.5;
    bright = 0.75;
  } else if (t < C.ignite) {
    energy = 0.25;
    eC.set(0, 6, 0);
  } else if (t < B[8]) {
    energy = 0.45;
    radial = 0.6;
    eC.set(0, 6, 0);
  } else if (t < B[10]) {
    bright = 0.68;
    energy = 0.2;
  } else if (t < C.drop) {
    bright = dim ? 0.25 : 0.5;
    nred = dim ? 0.4 : 0;
  } else {
    bright = 1.25;
    energy = 0.8;
    radial = 0.5;
  }
  nb.bright.value = bright * (1 + 0.22 * kick) * (1 - fadeOut);
  nb.energy.value = energy;
  nb.pulse.value = kick * 0.3 + (t >= C.drop ? 1.8 * Math.exp(-(t - C.drop) * 2) : 0);
  nb.radial.value = radial;
  nb.red.value = nred;
  nb.eC.value.copy(eC);
  E.dustU.amt.value = 0.85 * (1 - fadeOut);

  // ---- grade
  const g = E.grade;
  g.set("seed", Math.floor(t * 30));
  g.set("glitch", glitchAt(t, HITS, BIG, T.snares, TABLE));
  g.set("flash", within(t, END, END + 0.05) ? 0.15 : 0);
  g.set("black", fadeOut);
  g.set("exposure", dim ? 0.7 : 1);
  g.set("ca", 0.0012 + 0.0025 * kick);
  E.bloom.intensity = 1.35 + 0.4 * kick + (t >= C.drop ? 0.5 * Math.exp(-(t - C.drop) * 2) : 0);
}

const World: React.FC<{ t: number }> = ({ t }) => {
  const { gl, scene, camera, size } = useThree();
  const E = useMemo(
    () => buildSwarmEngine(gl, scene, camera as THREE.PerspectiveCamera, size.width, size.height, { beats: T.beats, shapes: SHAPES }),
    [gl, scene, camera, size.width, size.height],
  );
  useLayoutEffect(() => {
    direct(t, E, camera as THREE.PerspectiveCamera);
  }, [t, E, camera]);
  useFrame(() => E.render(), 1);
  return null;
};

/** 1920x1080 @30, 929 frames. Render with --gl=angle --concurrency=1. audioSrc = your song cut (public/...). */
export const LightSwarmDemo: React.FC<{ audioSrc?: string }> = ({ audioSrc }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#04060a" }}>
      <ThreeCanvas width={width} height={height} gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}>
        <World t={frame / fps} />
      </ThreeCanvas>
      {audioSrc && (
        <Sequence from={0} layout="none">
          <Html5Audio src={staticFile(audioSrc)} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
