// Video 13 "Simp" — pose-to-pose timeline, staged from the reference (ricoanimations) beat by beat.
// 24fps, characters animated on twos. Word frames come from vo.json (see build-vo.mjs).
import type { Pose } from "../rig/body";
import { clamp, E, hn, lerp, st, tr, trV, type Ease, type Key, type V } from "../rig/geom";
import type { GirlFace, GuyFace } from "../rig/heads";
import VO from "./vo.json";

export const FPS = 24;

// ---------------------------------------------------------------------------
// pose snapshots + interpolation
// ---------------------------------------------------------------------------
export type Snap = Pose & { headTilt: number; umbTilt: number };
type PKey = [number, Snap, Ease?];

const lerpV = (a: V, b: V, t: number): V => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
function mix(a: Snap, b: Snap, t: number): Snap {
  const o = { ...b } as Snap;
  for (const k of Object.keys(a) as (keyof Snap)[]) {
    const va = a[k], vb = b[k];
    if (Array.isArray(va) && Array.isArray(vb)) (o as Record<string, unknown>)[k] = lerpV(va as V, vb as V, t);
    else if (typeof va === "number" && typeof vb === "number") {
      // bend directions are discrete: switch at the middle of the move
      (o as Record<string, unknown>)[k] = k.startsWith("knee") || k.startsWith("elb") ? (t < 0.5 ? va : vb) : lerp(va, vb, t);
    }
  }
  return o;
}
function poseAt(f: number, keys: PKey[]): Snap {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, a] = keys[i];
    const [f1, b, e] = keys[i + 1];
    if (f < f1) return mix(a, b, (e ?? E.io)((f - f0) / (f1 - f0)));
  }
  return keys[keys.length - 1][1];
}
const P = (base: Snap, over: Partial<Snap>): Snap => ({ ...base, ...over });

// ---------------------------------------------------------------------------
// GUY poses
// ---------------------------------------------------------------------------
const SPOT: Snap = {
  pelvis: [505, 700], lean: 0, sq: 1, fx: -0.2,
  footL: [480, 866], footR: [530, 866], kneeL: 1, kneeR: 1,
  handL: [452, 566], handR: [530, 698], elbL: -1, elbR: 1, toeL: 0, toeR: 0,
  headTilt: 0, umbTilt: 9,
};
const LEAN: Snap = {
  pelvis: [318, 705], lean: -5, sq: 1, fx: -0.6,
  footL: [294, 866], footR: [342, 866], kneeL: 1, kneeR: 1,
  handL: [200, 568], handR: [292, 630], elbL: -1, elbR: -1, toeL: 0, toeR: 0,
  headTilt: -13, umbTilt: -4,
};
const ANT = P(SPOT, { pelvis: [512, 727], lean: 12, sq: 0.87, fx: -0.6, handL: [470, 586], handR: [548, 716], headTilt: 6, umbTilt: 14 });
const LAUNCH = P(ANT, { pelvis: [474, 690], lean: -18, sq: 1.13, footL: [452, 842], footR: [534, 866], toeL: -18, handL: [432, 536], handR: [530, 690], headTilt: -6, umbTilt: -2 });
const AIR = P(LAUNCH, { pelvis: [382, 628], lean: -26, sq: 1.16, footL: [338, 806], footR: [474, 838], toeL: -24, toeR: 34, handL: [334, 510], handR: [440, 640], headTilt: -8, umbTilt: -14, elbR: -1 });
const LAND = P(AIR, { pelvis: [322, 772], lean: -5, sq: 0.74, footL: [262, 866], footR: [386, 866], kneeR: -1, toeL: 0, toeR: 0, handL: [270, 560], handR: [350, 690], headTilt: 7, umbTilt: -6 });
const RISE = P(LAND, { pelvis: [310, 690], lean: -3, sq: 1.08, footL: [286, 866], footR: [334, 866], kneeR: 1, handL: [222, 566], handR: [300, 640], headTilt: -2, umbTilt: -2 });
const LEAN_IN = P(LEAN, { sq: 0.98, headTilt: -10 });

const DROP = P(LEAN, { lean: -2, headTilt: -3 });
const LIFT = P(LEAN, { pelvis: [330, 700], lean: 6, fx: 0.3, footR: [366, 806], kneeR: -1, handL: [226, 568], handR: [336, 690], elbR: 1, headTilt: 2, umbTilt: 2 });
const STRIDE = P(LIFT, { pelvis: [420, 714], lean: 9, sq: 0.97, footL: [300, 866], toeL: 18, footR: [528, 866], kneeR: 1, handL: [330, 575], handR: [440, 700], headTilt: 3, umbTilt: 8 });
const CLOSE = P(STRIDE, { pelvis: [490, 702], lean: 3, sq: 1, footL: [468, 846], toeL: 0, footR: [530, 866], handL: [420, 570], handR: [520, 700], headTilt: 1, umbTilt: 9 });
const SETTLE = P(SPOT, { sq: 0.97, pelvis: [505, 703] });
const KLIFT = P(LIFT, { lean: 14, footR: [414, 766], toeR: -35, handR: [360, 640], headTilt: 6 });

// ending
const STEP = P(SPOT, { pelvis: [472, 702], footL: [448, 866], footR: [500, 866], handL: [430, 566], handR: [498, 700], umbTilt: 7, lean: -2, fx: -0.5 });
const EXTEND = P(STEP, { pelvis: [468, 700], lean: -6, handL: [240, 560], elbL: 1, handR: [500, 700], umbTilt: -8 });
const LETGO = P(EXTEND, { handL: [300, 590] });
const EMPTY = P(STEP, { lean: 0, handL: [446, 700], handR: [500, 700], elbL: -1, elbR: 1, umbTilt: 0 });
const PROFILE = P(EMPTY, { fx: 1, pelvis: [470, 700], footL: [452, 866], footR: [492, 866], handL: [470, 712], handR: [478, 706], elbL: 1, elbR: 1, headTilt: 2 });
const WINDUP = P(PROFILE, { pelvis: [476, 712], lean: 12, sq: 0.95, footL: [396, 786], kneeL: -1, handL: [440, 636], handR: [528, 636], elbL: -1, headTilt: 6 });
const KICK = P(WINDUP, { pelvis: [484, 700], lean: 26, sq: 1.04, footL: [214, 688], toeL: 90, handL: [522, 596], handR: [566, 616], elbL: 1, headTilt: 10 });
const RECOVER = P(PROFILE, { pelvis: [472, 703], lean: 3, footL: [450, 866], toeL: 0, handL: [470, 714], handR: [478, 708], headTilt: 8 });
const SLUMP = P(RECOVER, { lean: 5, sq: 0.98, headTilt: 10 });

const swoop = (t: number): PKey[] => [
  [t, ANT, E.out],
  [t + 3, LAUNCH, E.in2],
  [t + 7, AIR, E.out2],
  [t + 11, LAND, E.in2],
  [t + 16, RISE, E.out],
  [t + 22, LEAN, E.io],
];
const retreat = (t: number): PKey[] => [
  [t, DROP, E.io],
  [t + 6, LIFT, E.out],
  [t + 11, STRIDE, E.io],
  [t + 16, CLOSE, E.io],
  [t + 20, SETTLE, E.out],
  [t + 25, SPOT, E.io],
];
const kickRetreat = (t: number): PKey[] => [
  [t, DROP, E.io],
  [t + 4, KLIFT, E.out],
  [t + 8, STRIDE, E.io],
  [t + 12, CLOSE, E.io],
  [t + 16, SETTLE, E.out],
  [t + 21, SPOT, E.io],
];
const nuzzle = (t: number, n: number): PKey[] =>
  Array.from({ length: n }, (_, i) => [
    [t + i * 12 + 6, LEAN_IN, E.io] as PKey,
    [t + i * 12 + 12, LEAN, E.io] as PKey,
  ]).flat();

// beat frames (from the voice)
const L = Object.fromEntries(VO.lines.map((l) => [l.n, { a: Math.round(l.at * FPS), b: Math.round((l.at + l.dur) * FPS), words: l.words.map((w) => Math.round((l.at + w.t0) * FPS)) }]));
export const BEAT = {
  swoop1: 40,
  // he reacts only AFTER she finishes a sentence (user rule): face first, then the move
  drop1: L[2].b + 2,
  retreat1: L[2].b + 6,
  swoop2: L[3].b + 10,
  drop2: L[4].b + 2,
  retreat2: L[4].b + 6,
  swoop3: L[5].b + 10,
  pointAt: L[6].a - 2,
  angry: L[6].b + 2,
  kickRetreat: L[6].b + 6,
  slump: L[7].a,
  thunder: L[7].b + 8,
};
const T = BEAT.thunder;
export const END = {
  step: T + 14,
  extend: T + 24,
  look: T + 34,
  reach: T + 46,
  take: T + 56,
  turn: T + 70,
  windup: T + 82,
  kick: T + 92,
  fly: T + 94,
  recover: T + 104,
};
export const FRAMES = END.recover + 70;

const GUY_KEYS: PKey[] = [
  [0, SPOT],
  [BEAT.swoop1 - 1, SPOT],
  ...swoop(BEAT.swoop1),
  ...nuzzle(BEAT.swoop1 + 22, 3),
  [BEAT.retreat1 - 1, LEAN],
  ...retreat(BEAT.retreat1),
  [BEAT.swoop2 - 1, SPOT],
  ...swoop(BEAT.swoop2),
  ...nuzzle(BEAT.swoop2 + 22, 2),
  [BEAT.retreat2 - 1, LEAN],
  ...retreat(BEAT.retreat2),
  [BEAT.swoop3 - 1, SPOT],
  ...swoop(BEAT.swoop3),
  [BEAT.kickRetreat - 1, LEAN],
  ...kickRetreat(BEAT.kickRetreat),
  [END.step - 6, SPOT],
  [END.step, STEP, E.io],
  [END.extend, EXTEND, E.out],
  [END.take, EXTEND],
  [END.take + 4, LETGO, E.in2],
  [END.take + 10, EMPTY, E.io],
  [END.turn, EMPTY],
  [END.turn + 6, PROFILE, E.io],
  [END.windup, PROFILE],
  [END.windup + 8, WINDUP, E.out],
  [END.kick, WINDUP],
  [END.kick + 2, KICK, E.out],
  [END.kick + 8, KICK],
  [END.recover, RECOVER, E.io],
  [END.recover + 10, SLUMP, E.io],
];

// ---------------------------------------------------------------------------
// GIRL poses
// ---------------------------------------------------------------------------
const G_IDLE: Snap = {
  pelvis: [165, 742], lean: 0, sq: 1, fx: 0.3,
  footL: [150, 868], footR: [182, 868], kneeL: 1, kneeR: 1,
  handL: [174, 606], handR: [156, 612], elbL: 1, elbR: -1, toeL: 0, toeR: 0,
  headTilt: 4, umbTilt: 0,
};
const G_UP = P(G_IDLE, { pelvis: [158, 718], lean: -8, fx: -0.4, footL: [146, 846], footR: [198, 806], kneeR: 1, toeR: 30, handL: [12, 560], elbL: -1, handR: [190, 648], elbR: 1, headTilt: -8 });
const G_DOWN = P(G_UP, { pelvis: [158, 738], footL: [146, 868], footR: [200, 818], handL: [14, 574], headTilt: -5 });
const G_SLUMP = P(G_IDLE, { pelvis: [165, 746], lean: 2, handL: [150, 712], handR: [182, 712], elbL: -1, elbR: 1, headTilt: 10 });
const G_REACH = P(G_IDLE, { lean: 4, handR: [244, 586], elbR: 1, headTilt: -2, umbTilt: -8 });
const G_HOLD = P(G_IDLE, { handR: [196, 600], elbR: 1, headTilt: 0, umbTilt: -3 });

const hops = (t0: number, t1: number): PKey[] => {
  const k: PKey[] = [];
  for (let t = t0, i = 0; t < t1; t += 4, i++) k.push([t, i % 2 ? G_DOWN : G_UP, i % 2 ? E.in2 : E.out2]);
  return k;
};
const GIRL_KEYS: PKey[] = [
  [0, G_IDLE],
  [BEAT.pointAt, G_IDLE],
  [BEAT.pointAt + 4, G_UP, E.out],
  ...hops(BEAT.pointAt + 8, L[6].b + 2),
  [L[6].b + 6, G_DOWN, E.io],
  [BEAT.slump, G_DOWN],
  [BEAT.slump + 8, G_SLUMP, E.io],
  [BEAT.slump + 30, G_SLUMP],
  [BEAT.slump + 42, G_IDLE, E.io],
  [END.reach, G_IDLE],
  [END.reach + 8, G_REACH, E.out],
  [END.take + 2, G_REACH],
  [END.take + 12, G_HOLD, E.io],
];

// ---------------------------------------------------------------------------
// talking
// ---------------------------------------------------------------------------
/** Jaw opening 0..1 for a speaker at frame f (on twos), from the voice envelope. */
export function jaw(frame: number, who: "G" | "D"): number {
  for (const l of VO.lines) {
    if (l.who !== who) continue;
    const i = frame - Math.round(l.at * FPS);
    if (i >= 0 && i < l.env.length) {
      const e = Math.max(l.env[i] ?? 0, (l.env[i + 1] ?? 0) * 0.8);
      return clamp((e - 0.1) / 0.55, 0, 1);
    }
  }
  return -1; // not speaking
}
const speaking = (f: number, n: number) => f >= L[n].a && f <= L[n].b;

// ---------------------------------------------------------------------------
// evaluation
// ---------------------------------------------------------------------------
const blinkAt = (f: number, at: number[]) => at.some((b) => f >= b && f < b + 3);

export function guyAt(f: number) {
  const s = poseAt(f, GUY_KEYS);
  const pose: Pose = { ...s, sq: s.sq * (1 + 0.012 * Math.sin((f / FPS) * Math.PI * 1.3)) };
  const sw = [BEAT.swoop1, BEAT.swoop2, BEAT.swoop3];
  const dropAt = [BEAT.drop1, BEAT.drop2, BEAT.angry];
  const inLean = sw.some((t, i) => f >= t + 16 && f < dropAt[i]);
  const excited = f < 40 ? f >= 30 : sw.some((t) => f >= t - 8 && f < t + 16);
  const angry = f >= BEAT.angry && f < BEAT.kickRetreat + 30;
  // poker face whenever he is not leaning / diving: listening from his spot, and the whole ending
  const poker = f >= 40 && !inLean && !excited;
  const end = f >= T;

  const yaw = tr(f, [
    [0, 0.28], [18, 0.28], [24, -0.36],
    [BEAT.swoop1 + 22, -0.25],
    [BEAT.retreat1 + 4, -0.25], [BEAT.retreat1 + 12, 0.12],
    [BEAT.swoop2 - 10, 0.12], [BEAT.swoop2 - 4, -0.36], [BEAT.swoop2 + 22, -0.25],
    [BEAT.retreat2 + 4, -0.25], [BEAT.retreat2 + 12, 0.12],
    [BEAT.swoop3 - 10, 0.12], [BEAT.swoop3 - 4, -0.36], [BEAT.swoop3 + 22, -0.25],
    [BEAT.kickRetreat + 2, -0.25], [BEAT.kickRetreat + 10, 0.12],
    [END.step - 8, 0.12], [END.step, -0.32],
    [END.turn, -0.32], [END.turn + 6, 1.0, E.io],
  ]);
  const lookK: Key<V>[] = [[0, [0, 0]], [12, [0, 0]], [14, [-1, 0.05], E.out]];
  const face: GuyFace = {
    yaw,
    look: inLean ? [-0.8, 0.55] : end && f >= END.turn + 6 ? [0.2, 0.45] : poker ? [-0.95, 0.1] : trV(f, lookK),
    lids: blinkAt(f, [204, 336, 570, END.turn + 20, END.recover + 30]) ? 1 : inLean ? 0.5 : f >= END.turn + 6 ? 0.55 : angry ? 0.3 : poker ? 0.4 : excited ? 0 : 0.1,
    brow: excited ? 10 : angry ? -7 : poker ? -3 : inLean ? -2 : 2,
    angry: angry ? 1 : 0,
    mouth: "neutral",
    blush: inLean ? 1 : 0,
    wet: 0,
    seed: Math.floor(f / 4),
  };
  // mouth
  const j = jaw(f, "G");
  if (j >= 0) {
    face.mouth = "talk";
    face.open = j;
  } else if (f >= END.windup && f < END.recover) face.mouth = "flat";
  else if (inLean) face.mouth = "smug";
  else if (excited) face.mouth = sw.some((t) => f >= t + 3 && f < t + 16) ? "bigGrin" : sw.some((t) => f >= t - 3) || f >= 36 ? "grin" : "smile";
  else if (angry) face.mouth = "grr";
  else if (poker) face.mouth = "flat";
  else face.mouth = "neutral";

  // umbrella in his left hand until she takes it
  const umb = f < END.take + 2 ? { grip: pose.handL, tilt: s.umbTilt, hold: 0 } : null;
  return { pose, headTilt: s.headTilt, face, umb, profile: f >= END.turn + 3 };
}

export function girlAt(f: number) {
  const s = poseAt(f, GIRL_KEYS);
  const pose: Pose = { ...s, sq: s.sq * (1 + 0.01 * Math.sin((f / FPS) * Math.PI * 1.7)) };
  const pointing = f >= BEAT.pointAt && f < BEAT.slump;
  const touched = f >= END.look + 6 && f < END.kick;
  // shiver while she stands in the rain (set by the caller through `wet`)
  const face: GirlFace = {
    yaw: pointing ? -0.55 : f >= END.look + 6 ? 0.5 : 0.3,
    look: pointing
      ? [-1, -0.25]
      : f >= END.look && f < END.look + 6
        ? [0.3, -1]
        : touched
          ? [1, 0.05]
          : speaking(f, 1) || (f > L[1].a && f < L[1].b + 8)
            ? [0.95, -0.05]
            : [0.15, 0.65],
    lids: blinkAt(f, [34, 150, 330, 470]) ? 1 : pointing ? 0 : touched ? 0.06 : f >= T && f < T + 3 ? 0.15 : f >= L[5].a && f < L[5].words[0] ? 0.72 : 0.54,
    worry: pointing ? -0.7 : touched ? 1.6 : speaking(f, 4) ? 1.6 : speaking(f, 3) || speaking(f, 7) ? 1.35 : 1,
    mouth: "frown",
    pony: 0,
    wet: 0,
    seed: Math.floor(f / 4),
  };
  const j = jaw(f, "D");
  if (j >= 0) {
    face.mouth = pointing ? "happy" : "talk";
    face.open = j;
    face.smile = speaking(f, 2) ? -0.5 : speaking(f, 5) ? -0.8 : -1.2;
  } else if (pointing) {
    face.mouth = "happy";
    face.open = 0.5;
  } else if (touched) face.mouth = "o";
  else if (f >= END.kick) face.mouth = "o";
  else face.mouth = speaking(f, 4) ? "wobble" : "frown";
  // ponytail follows the hops + the thunder flinch
  face.pony = pointing ? Math.sin(f * 0.8) * 10 : tr(f, [[0, 0], [T, 0], [T + 2, 12, E.out], [T + 6, -7], [T + 10, 3], [T + 14, 0]]);
  const umb = f >= END.take + 2 ? { grip: pose.handR, tilt: s.umbTilt, hold: 26 } : null;
  return { pose, headTilt: s.headTilt + (pointing ? hn(Math.floor(f / 2), 4) * 2 : 0), face, umb };
}

/** Girl flying off after the kick: translation + spin (applied around her middle). */
export function flight(f: number) {
  const t = (f - END.fly) / 18;
  if (t <= 0) return null;
  return { dx: -620 * t, dy: -980 * t + 520 * t * t, rot: -760 * t, t };
}

export const LINE_FRAMES = L;
export { st };
