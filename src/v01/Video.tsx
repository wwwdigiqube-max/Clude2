// V01 · «اگه زامبی‌ها حمله کنن» — 30s vertical, stick-toon rig, one narrator (Brian, eleven_v4).
// Every beat is keyed to the spoken words in vo.json (T.*). Characters on twos, camera on ones.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import { Arm, BG, HeadMount, INK, Legs, solve, type Dims, type Pose } from "../styles/stick-toon/rig/body";
import { clamp, E, hn, lerp, type Ease, type V } from "../styles/stick-toon/rig/geom";
import { GuyHead, type GuyFace } from "../styles/stick-toon/rig/heads";
import VO from "./vo.json";
import { PALE, ZFILL, ZombieHead, type ZFace } from "./zombie";

export const V01_FPS = 24;
export const V01_FRAMES = 732; // 30.5 s
export const V01_LOOK = [0.2, 1.5, 3.9, 6.9, 8.9, 11.5, 12.2, 14.2, 15.0, 17.9, 18.9, 21.3, 23.5, 26.1, 27.6, 29.6];

// ---- word cues (seconds) ----------------------------------------------------
const w = (i: number) => VO.words[i].s;
const T = {
  zom: w(3), think: w(6), sec: w(8), q: w(11),
  r1: w(12), dont: w(14), scream: w(16), z2: w(19), sound: w(21), come: w(22),
  r2: w(23), go: w(25), high: w(28), z3: w(30), ladder: w(34), up: w(36),
  r3: w(37), first: w(39), water: w(40), collect: w(41), not: w(43), gun: w(44), human: w(45), three: w(49), days: w(50), last3: w(52),
  r4: w(54), most: w(59), ring: VO.words[59].e + 0.12, phone: w(60), silent: w(61), end: VO.words[62].e,
};

const GY = 1000; // street level (world units)
const ROOF = 570; // roof level
const SC = 0.62; // character scale
const LAD_B: V = [697, GY];
const LAD_T: V = [769, ROOF - 12];

// ---- small helpers ----------------------------------------------------------
type K<T> = [number, T, Ease?];
function seg<T>(t: number, keys: K<T>[]): [T, T, number] {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][1], 0];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1, e] = keys[i + 1];
    if (t < t1) return [v0, v1, (e ?? E.io)((t - t0) / (t1 - t0))];
  }
  const l = keys[keys.length - 1][1];
  return [l, l, 0];
}
const tr = (t: number, keys: K<number>[]) => {
  const [a, b, k] = seg(t, keys);
  return lerp(a, b, k);
};
const lv = (a: V, b: V, k: number): V => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
function mixPose(a: Pose, b: Pose, k: number): Pose {
  const o = { ...b } as Record<string, unknown>;
  for (const key of Object.keys(a) as (keyof Pose)[]) {
    const va = a[key], vb = b[key];
    if (Array.isArray(va) && Array.isArray(vb)) o[key] = lv(va as V, vb as V, k);
    else if (typeof va === "number" && typeof vb === "number") o[key] = key.startsWith("knee") || key.startsWith("elb") ? (k < 0.5 ? va : vb) : lerp(va, vb, k);
  }
  return o as Pose;
}
const poseAt = (t: number, keys: K<Pose>[]) => {
  const [a, b, k] = seg(t, keys);
  return mixPose(a, b, k);
};
const P = (b: Pose, o: Partial<Pose>): Pose => ({ ...b, ...o });
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
const pop = (t: number, t0: number, d = 0.25) => clamp((t - t0) / d, 0, 1);
const fa = (n: number | string) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

// ---- rigs -------------------------------------------------------------------
const GUY: Dims = { Lt: 150, tw: 60, hip: 7, l1: 84, l2: 84, a1: 64, a2: 64, shY: 22, shoe: 34, hand: 8.5 };
const ZOM: Dims = { Lt: 140, tw: 66, hip: 8, l1: 80, l2: 80, a1: 78, a2: 78, shY: 24, shoe: 30, hand: 8 };

const STAND: Pose = {
  pelvis: [0, -184], lean: 0, sq: 1, fx: 0,
  footL: [-24, -18], footR: [24, -18], kneeL: 1, kneeR: -1,
  handL: [-46, -196], handR: [46, -196], elbL: 1, elbR: -1, toeL: 0, toeR: 0,
};
const STRETCH = P(STAND, { pelvis: [0, -190], sq: 1.06, handL: [-62, -452], handR: [62, -452], elbL: -1, elbR: 1 });
const SCARED = P(STAND, { pelvis: [-8, -174], lean: -8, sq: 0.95, footL: [-30, -18], footR: [26, -18], handL: [-30, -300], handR: [20, -306], elbL: 1, elbR: -1 });
const SHH = P(STAND, { pelvis: [0, -187], sq: 1.02, footL: [-18, -18], footR: [18, -18], handL: [-40, -200], handR: [6, -384], elbR: -1 });
const LOOKR = P(STAND, { fx: 0.5, handL: [-40, -198], handR: [48, -194] });
const HIPS = P(STAND, { fx: -0.3, handL: [-34, -196], handR: [34, -196], elbL: -1, elbR: 1, footL: [-30, -18], footR: [30, -18] });
const LAUGH = P(HIPS, { lean: -7, pelvis: [4, -180], sq: 0.97, handL: [-20, -230], handR: [26, -232] });
const HOLDUP = P(STAND, { fx: 0.4, handR: [76, -320], elbR: 1, handL: [-42, -198] });
const NOPE = P(HOLDUP, { handR: [48, -230], elbR: -1, handL: [-58, -330], elbL: 1 });
const THREE = P(NOPE, { handL: [-46, -420], elbL: -1, handR: [46, -214] });
const DRINK = P(STAND, { fx: 0.3, sq: 0.98, lean: -3, handR: [14, -370], elbR: -1, handL: [-44, -198] });
const FREEZE = P(DRINK, { lean: 0, sq: 1.02, handR: [30, -340], handL: [-46, -200] });
const POCKET = P(FREEZE, { handR: [30, -190], elbR: -1 });
const PHONE = P(FREEZE, { handR: [40, -326], elbR: -1, fx: 0 });
const SCREAM = P(PHONE, { lean: -10, pelvis: [6, -178], handL: [-66, -420], elbL: -1, sq: 0.97 });

const neutralFace = (): GuyFace => ({ yaw: 0, look: [0, 0], lids: 0.15, brow: 0, mouth: "neutral", open: 0, angry: 0, blush: 0, wet: 0, seed: 1 });

function runPose(ph: number, dir: number, stride = 50, lift = 40, lean = 16): Pose {
  const s = Math.sin(ph * Math.PI * 2), c = Math.cos(ph * Math.PI * 2);
  return {
    pelvis: [dir * 6, -176 - Math.abs(s) * 9], lean: dir * lean, sq: 1, fx: dir * 0.9,
    footL: [dir * stride * s, -18 - Math.max(0, c) * lift], footR: [-dir * stride * s, -18 - Math.max(0, -c) * lift],
    kneeL: -dir, kneeR: -dir, toeL: dir * Math.max(0, c) * 25, toeR: dir * Math.max(0, -c) * 25,
    handL: [dir * (8 - 44 * s), -262], handR: [dir * (8 + 44 * s), -262], elbL: dir, elbR: dir,
  };
}
function climbPose(ph: number): Pose {
  const a = Math.sin(ph * Math.PI * 2);
  return {
    pelvis: [10, -170], lean: 10, sq: 1, fx: 0.9,
    footL: [-6, -18 - Math.max(0, a) * 34], footR: [2, -18 - Math.max(0, -a) * 34], kneeL: -1, kneeR: -1, toeL: 0, toeR: 0,
    handL: [42 + a * 4, -350 + a * 26], handR: [50 - a * 4, -330 - a * 26], elbL: 1, elbR: 1,
  };
}

// ---- guy ---------------------------------------------------------------------
type Char = { at: V; pose: Pose; tilt: number; face: GuyFace; hold?: "bottle" | "phone"; heart?: number; sweat?: boolean; three?: boolean; jitter?: number };

function ladderPt(u: number): V {
  return lv(LAD_B, LAD_T, u);
}

function guyAt(t: number, zx: number): Char {
  const f = neutralFace();
  let at: V = [300, GY];
  let pose: Pose = STAND;
  let tilt = 0;
  let hold: Char["hold"];
  let jitter = 0;
  const out: Partial<Char> = {};
  if (t < T.r2 + 0.2) {
    // S1 + S2 on the street
    pose = poseAt(t, [[0, STRETCH], [0.75, STRETCH], [1.0, STAND, E.out], [T.zom + 0.15, STAND], [T.zom + 0.4, SCARED, E.back], [T.r1, SCARED], [T.r1 + 0.3, SHH, E.out], [T.r2 - 0.1, SHH], [T.r2 + 0.2, LOOKR]]);
    if (t < 0.95) Object.assign(f, { lids: 0.9, mouth: "o", brow: 5, yaw: 0, look: [0, -0.4] });
    else if (t < T.zom) Object.assign(f, { lids: 0.35, mouth: "neutral", yaw: 0.05 });
    else if (t < T.r1) {
      Object.assign(f, { lids: 0, brow: 11, mouth: "o", yaw: t < T.think ? 0.55 : 0.2, look: t < T.think ? [1, 0] : [0.4, 0] });
      jitter = t > T.zom + 0.4 ? 1.4 : 0;
    } else {
      // frozen, eyes tracking the zombie
      const dx = zx - 300;
      Object.assign(f, { lids: 0, brow: 9, mouth: "flat", yaw: clamp(dx / 260, -0.5, 0.5), look: [clamp(dx / 120, -1, 1), 0.1] });
      if (t > T.sound - 0.1 && t < T.come + 0.2) Object.assign(f, { lids: 0.55, brow: 13, mouth: "grr" });
      out.heart = t > T.dont ? 1 : 0;
      out.sweat = t > T.dont + 0.3;
      if (t > T.r2 - 0.25) Object.assign(f, { yaw: 0.6, look: [1, 0], lids: 0.1, brow: 4, mouth: "neutral" });
    }
    tilt = t < 0.95 ? -8 : t > T.zom && t < T.r1 ? -5 : 0;
  } else if (t < T.go + 0.02) {
    pose = LOOKR;
    Object.assign(f, { yaw: 0.6, look: [1, -0.2], lids: 0.1, brow: 6, mouth: "neutral" });
  } else if (t < T.high + 0.05) {
    // run to the ladder
    const k = clamp((t - T.go) / (T.high + 0.05 - T.go), 0, 1);
    at = [lerp(300, LAD_B[0] - 14, E.io(k)), GY];
    pose = runPose((t - T.go) * 3.4, 1);
    Object.assign(f, { yaw: 0.8, look: [1, 0], lids: 0, brow: 10, mouth: "o" });
  } else if (t < T.z3 - 0.05) {
    // climb
    const t0 = T.high + 0.05, t1 = T.z3 - 0.05;
    const k = clamp((t - t0) / (t1 - t0), 0, 1);
    at = ladderPt(E.io(k) * 0.97);
    pose = climbPose((t - t0) * 3);
    Object.assign(f, { yaw: 0.85, look: [1, -0.6], lids: 0, brow: 10, mouth: "grr" });
  } else if (t < T.z3 + 0.55) {
    // hop over the parapet and walk to the middle of the roof
    const k = clamp((t - (T.z3 - 0.05)) / 0.6, 0, 1);
    at = [lerp(LAD_T[0] + 12, 900, E.out(k)), ROOF - Math.sin(Math.min(1, k * 1.6) * Math.PI) * 30];
    pose = runPose(k * 1.5, 1, 30, 26, 8);
    Object.assign(f, { yaw: 0.6, look: [1, 0], lids: 0, brow: 6, mouth: "neutral" });
  } else if (t < T.r3) {
    at = [900, ROOF];
    const laugh = t > T.up + 0.1;
    pose = poseAt(t, [[T.z3 + 0.55, STAND], [T.z3 + 0.85, HIPS, E.out], [T.up + 0.1, HIPS], [T.up + 0.3, LAUGH, E.back]]);
    Object.assign(f, laugh ? { yaw: -0.3, look: [-0.8, 0.8], lids: 0.35, brow: 4, mouth: "bigGrin" } : { yaw: -0.45, look: [-1, 0.9], lids: 0.4, brow: -1, mouth: "smug" });
    if (laugh) jitter = 1;
  } else if (t < T.r4) {
    // S4 — water, not guns
    at = [900, ROOF];
    pose = poseAt(t, [[T.r3, HIPS], [T.r3 + 0.3, STAND], [T.water, STAND], [T.water + 0.3, HOLDUP, E.back], [T.not, HOLDUP], [T.not + 0.2, NOPE, E.out], [T.human + 0.3, NOPE], [T.three - 0.2, THREE, E.back]]);
    hold = t > T.water + 0.05 ? "bottle" : undefined;
    if (t < T.water) Object.assign(f, { yaw: 0.35, look: [0.6, 0.2], lids: 0.15, brow: 3, mouth: "neutral" });
    else if (t < T.not) Object.assign(f, { yaw: 0.15, look: [0.5, -0.5], lids: 0.1, brow: 6, mouth: "smile" });
    else if (t < T.human) Object.assign(f, { yaw: Math.sin((t - T.not) * 18) * 0.35, look: [0, 0], lids: 0.25, brow: -2, mouth: "flat", angry: 0.4 });
    else Object.assign(f, { yaw: 0.05, look: [0, 0], lids: 0.1, brow: 7, mouth: "neutral" });
    out.three = t > T.three - 0.1;
  } else {
    // S5 — chill, the ring, the deadpan, the scream
    at = [920, ROOF];
    pose = poseAt(t, [[T.r4, STAND], [T.r4 + 0.4, DRINK, E.out], [T.ring, DRINK], [T.ring + 0.08, FREEZE, E.out], [T.ring + 0.45, FREEZE], [T.ring + 0.65, POCKET, E.io], [T.ring + 0.8, POCKET], [T.ring + 1.05, PHONE, E.back], [T.end + 0.1, PHONE], [T.end + 0.3, SCREAM, E.back]]);
    hold = t < T.ring + 0.1 ? "bottle" : t > T.ring + 0.8 ? "phone" : undefined;
    tilt = t < T.ring ? tr(t, [[T.r4 + 0.2, 0], [T.r4 + 0.6, -12], [T.most, -12], [T.most + 0.3, -4]]) : 0;
    if (t < T.ring) Object.assign(f, { yaw: 0.2, look: [0.3, -0.3], lids: 0.55, brow: -2, mouth: t < T.most ? "flat" : "smug" });
    else if (t < T.phone) Object.assign(f, { yaw: -0.15, look: [-0.4, 0.9], lids: 0, brow: 13, mouth: "o" });
    else if (t < T.end + 0.1) Object.assign(f, { yaw: 0, look: [0, 0.05], lids: 0.5, brow: -3, mouth: "flat" });
    else Object.assign(f, { yaw: -0.3, look: [-0.6, 0.6], lids: 0, brow: 15, mouth: "o" });
    if (t > T.end + 0.1) jitter = 2;
  }
  return { at, pose, tilt, face: f, hold, jitter, ...out };
}

// ---- zombies -----------------------------------------------------------------
type ZMode = "walk" | "sniff" | "reach" | "climb" | "fall" | "lie";
type ZState = { at: V; mode: ZMode; dir: number; ph: number; face: ZFace; s: number; rot?: number };

function zPose(z: ZState, t: number): { pose: Pose; tilt: number } {
  const d = z.dir;
  const s = Math.sin(z.ph * Math.PI * 2);
  const c = Math.cos(z.ph * Math.PI * 2);
  if (z.mode === "reach" || z.mode === "lie") {
    const a = Math.sin(t * 5 + z.face.seed), b = Math.sin(t * 5 + z.face.seed + 2);
    return {
      pose: {
        pelvis: [0, -182 + a * 3], lean: -d * 4, sq: 1, fx: d * 0.3,
        footL: [-22, -18], footR: [22, -18], kneeL: 1, kneeR: -1, toeL: 0, toeR: 0,
        handL: [-26 + d * 20, -440 + a * 26], handR: [26 + d * 20, -430 + b * 26], elbL: -1, elbR: 1,
      },
      tilt: -d * 10,
    };
  }
  if (z.mode === "climb") return { pose: climbPose(z.ph), tilt: 6 };
  if (z.mode === "fall") {
    return {
      pose: { ...STAND, pelvis: [0, -178], footL: [-30, -40], footR: [30, -70], kneeL: 1, kneeR: 1, handL: [-80, -380], handR: [70, -400], elbL: -1, elbR: 1 },
      tilt: -d * 10,
    };
  }
  const stop = z.mode === "sniff";
  const st = stop ? 0 : 1;
  return {
    pose: {
      pelvis: [d * 4, -178 - Math.abs(s) * 5 * st], lean: d * (stop ? 14 : 8), sq: 1, fx: d * 0.75,
      footL: [d * 24 * s * st, -18 - Math.max(0, c) * 16 * st], footR: [-d * 20 * s * st, -18 - Math.max(0, -c) * 4 * st],
      kneeL: -d, kneeR: -d, toeL: 0, toeR: -d * Math.max(0, -c) * 18 * st,
      handL: [d * 160, -330 + Math.sin(z.ph * 6.28 + 1) * 10], handR: [d * 146, -306 + Math.sin(z.ph * 6.28 + 2.4) * 10],
      elbL: d, elbR: d,
    },
    tilt: d * 4 + Math.sin(z.ph * 6.28) * 5,
  };
}

const zface = (seed: number, yaw: number, look: V, t: number, up = 0): ZFace => ({ yaw, look, open: 0.35 + 0.35 * Math.max(0, Math.sin(t * 3 + seed)), seed, up });

const Z1_STOP = 392;
function z1X(t: number): number {
  if (t < T.sound) return tr(t, [[0, 790], [T.sound, Z1_STOP, E.lin]]);
  if (t < T.come + 0.35) return Z1_STOP;
  return tr(t, [[T.come + 0.35, Z1_STOP], [T.ladder, 596, E.lin]]);
}
function zombies(t: number, guy: Char): ZState[] {
  const gx = guy.at[0], gy = guy.at[1];
  const lookAtGuy = (x: number): V => [clamp((gx - x) / 150, -1, 1), clamp((gy - 300 - GY + 200) / 300, -1, 1)];
  const list: ZState[] = [];
  const snap = t > T.ring + 0.35; // after the ring, every head snaps to the guy
  // Z1 — passes right in front of the guy, sniffs, moves on; later joins the crowd at the wall
  {
    const x = z1X(t);
    let mode: ZMode = "walk", dir = -1, yaw = -0.55, look: V = [-1, 0];
    if (t >= T.sound && t < T.come + 0.35) {
      mode = "sniff"; yaw = -0.7; look = [-1, 0.2];
    } else if (t >= T.come + 0.35) {
      dir = 1; yaw = 0.5; look = [1, 0];
      if (t > T.ladder) { mode = "reach"; yaw = 0.4; look = [1, -1]; }
    }
    if (snap) { yaw = 0.5; look = lookAtGuy(x); }
    list.push({ at: [x, GY], mode, dir, ph: t * 1.15, face: zface(3, yaw, look, t, mode === "reach" ? 1 : 0), s: 0.64 });
  }
  // Z2 — goes for the ladder and slips
  {
    let at: V = [tr(t, [[0, 905], [T.r2, 700, E.lin], [T.ladder - 0.15, LAD_B[0] - 20, E.lin]]), GY];
    let mode: ZMode = "walk", dir = -1, yaw = -0.5, look: V = [-1, 0], rot = 0;
    if (t > T.r2) { dir = 1; yaw = 0.5; look = [1, -0.6]; }
    if (t > T.ladder - 0.15 && t < T.up) {
      mode = "climb"; const k = clamp((t - (T.ladder - 0.15)) / (T.up - T.ladder + 0.15), 0, 1);
      at = ladderPt(0.1 * Math.sin(k * Math.PI * 0.9)); yaw = 0.8; look = [1, -1];
    } else if (t >= T.up && t < T.r3 + 1.6) {
      mode = "fall"; const k = clamp((t - T.up) / 0.38, 0, 1);
      at = [lerp(LAD_B[0] - 4, LAD_B[0] - 70, E.out(k)), GY - Math.sin(k * Math.PI) * 40];
      rot = -90 * E.in2(k);
      yaw = 0.2; look = [0, -1];
      if (t > T.r3 + 0.9) rot = tr(t, [[T.r3 + 0.9, -90], [T.r3 + 1.6, 0, E.back]]);
    } else if (t >= T.r3 + 1.6) {
      at = [LAD_B[0] - 70, GY]; mode = "reach"; yaw = 0.4; look = [1, -1];
      if (t > T.end - 1.1) {
        // the ring broke the rule: it climbs after all
        mode = "climb"; const k = clamp((t - (T.end - 1.1)) / 2.6, 0, 1);
        at = k === 0 ? at : ladderPt(lerp(0.0, 0.88, E.io(k)));
        if (k === 0) mode = "reach";
        yaw = 0.8; look = [1, -1];
      }
    }
    if (snap && mode !== "climb") { yaw = 0.5; look = lookAtGuy(at[0]); }
    list.push({ at, mode, dir, ph: t * 1.05 + 0.3, face: zface(7, yaw, look, t, mode === "reach" ? 1 : 0), s: 0.66, rot });
  }
  // Z3 — slow one, ends under the guy
  {
    const x = tr(t, [[0, 1060], [T.r3, 850, E.lin]]);
    const mode: ZMode = t > T.r3 ? "reach" : "walk";
    let yaw = -0.5, look: V = [-1, 0];
    if (mode === "reach") { yaw = 0.1; look = [0.3, -1]; }
    if (snap) { yaw = 0.1; look = lookAtGuy(x); }
    list.push({ at: [x, GY], mode, dir: -1, ph: t * 0.9 + 0.6, face: zface(11, yaw, look, t, mode === "reach" ? 1 : 0), s: 0.58 });
  }
  // the horde the ringtone calls in
  ([[T.ring + 0.3, 1320, 1010, 13, 0.6], [T.ring + 0.6, 1400, 1090, 17, 0.56], [T.ring + 0.5, 180, 470, 19, 0.62]] as const).forEach(([t0, x0, x1, seed, s]) => {
    if (t < t0) return;
    const dir = x1 > x0 ? 1 : -1;
    const k = clamp((t - t0) / 2.4, 0, 1);
    const arrived = k >= 1;
    const x = lerp(x0, x1, E.out2(k));
    list.push({ at: [x, GY], mode: arrived ? "reach" : "walk", dir, ph: t * 1.4 + seed, face: zface(seed, arrived ? 0.2 : dir * 0.5, lookAtGuy(x), t, arrived ? 1 : 0), s });
  });
  return list;
}

// ---- drawing ------------------------------------------------------------------
const Body: React.FC<{ r: ReturnType<typeof solve>; fill?: string; torn?: boolean }> = ({ r, fill = BG, torn }) => (
  <>
    <Legs r={r} />
    <path d={r.torso} fill={fill} stroke={INK} strokeWidth={4.4} strokeLinejoin="round" />
    {torn && (
      <g fill="none" stroke={INK} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
        <path d={`M${r.p.pelvis[0] - 18} ${r.p.pelvis[1] - 14} l8 -12 l7 10 l8 -14 l7 12`} />
        <path d={`M${r.neck[0] + 6} ${r.neck[1] + 40} q8 6 2 16`} />
      </g>
    )}
  </>
);

const Bottle: React.FC<{ at: V; rot?: number; s?: number }> = ({ at, rot = 0, s = 1 }) => (
  <g transform={`translate(${at[0]} ${at[1]}) rotate(${rot}) scale(${s})`}>
    <path d="M-13 -30 C-13 -42 -6 -46 -6 -54 L6 -54 C6 -46 13 -42 13 -30 L13 30 C13 36 -13 36 -13 30 Z" fill={PALE} stroke={INK} strokeWidth={3.4} strokeLinejoin="round" />
    <rect x={-7} y={-64} width={14} height={11} rx={2} fill={INK} />
    <path d="M-13 -6 L13 -6 M-13 8 L13 8" stroke={INK} strokeWidth={2} />
  </g>
);

const Phone: React.FC<{ at: V; t: number; ringing: boolean }> = ({ at, t, ringing }) => {
  const jig = ringing ? Math.sin(t * 90) * 4 : 0;
  const k = (t * 6) % 1;
  return (
    <g transform={`translate(${at[0] + jig} ${at[1] - 26})`}>
      <rect x={-17} y={-30} width={34} height={58} rx={6} fill={INK} />
      <rect x={-12} y={-23} width={24} height={40} rx={2} fill={PALE} />
      {ringing &&
        [1, -1].map((sd) =>
          [0, 1].map((i) => (
            <path key={`${sd}${i}`} d={`M${sd * (30 + i * 16 + k * 10)} -24 Q${sd * (40 + i * 16 + k * 10)} 0 ${sd * (30 + i * 16 + k * 10)} 24`} fill="none" stroke={INK} strokeWidth={3.4} strokeLinecap="round" opacity={1 - k * 0.6} />
          )),
        )}
    </g>
  );
};

const GuyView: React.FC<{ c: Char; t: number; frame: number }> = ({ c, t, frame }) => {
  let pose = c.pose;
  if (c.jitter) {
    const j: V = [hn(frame >> 1, 3) * c.jitter, hn(frame >> 1, 5) * c.jitter * 0.6];
    pose = { ...pose, pelvis: add(pose.pelvis, j), handL: add(pose.handL, j), handR: add(pose.handR, j) };
  }
  const r = solve(pose, GUY);
  const ringing = c.hold === "phone" && t < T.end + 0.6;
  const beat = (t * 2.6) % 1;
  return (
    <g transform={`translate(${c.at[0]} ${c.at[1]}) scale(${SC})`}>
      <Body r={r} />
      <HeadMount r={r} tilt={c.tilt}>
        <GuyHead f={c.face} id="guy" />
        {c.sweat &&
          [0, 1].map((i) => {
            const a = ((t * 1.3 + i * 0.5) % 1);
            return <path key={i} d={`M${62 - i * 128} ${-150 + a * 70} q-7 12 0 16 q7 -4 0 -16 Z`} fill={PALE} stroke={INK} strokeWidth={2.4} opacity={1 - a * 0.7} />;
          })}
      </HeadMount>
      {c.heart ? (
        <g transform={`translate(${r.neck[0] + 4} ${r.neck[1] + 70}) scale(${1 + (beat < 0.15 ? 0.35 : 0)})`}>
          <path d="M0 10 C-18 -4 -12 -18 0 -8 C12 -18 18 -4 0 10 Z" fill={INK} />
          {beat < 0.25 && <path d="M-30 -18 l-10 -8 M30 -18 l10 -8 M-34 4 l-12 0 M34 4 l12 0" stroke={INK} strokeWidth={3} strokeLinecap="round" />}
        </g>
      ) : null}
      <Arm r={r} side="L" />
      <Arm r={r} side="R" />
      {c.hold === "bottle" && <Bottle at={add(r.p.handR, [0, pose === DRINK ? -6 : -10])} rot={c.pose.handR[1] < -360 ? -150 : 0} />}
      {c.hold === "phone" && <Phone at={r.p.handR} t={t} ringing={ringing} />}
      {c.three && (
        <g stroke={INK} strokeWidth={5} strokeLinecap="round">
          {[-14, 0, 14].map((dx) => (
            <path key={dx} d={`M${r.p.handL[0] + dx * 0.8} ${r.p.handL[1] - 6} l${dx * 0.3} -26`} />
          ))}
        </g>
      )}
    </g>
  );
};

const ZombieView: React.FC<{ z: ZState; t: number; id: string }> = ({ z, t, id }) => {
  const { pose, tilt } = zPose(z, t);
  const r = solve(pose, ZOM);
  return (
    <g transform={`translate(${z.at[0]} ${z.at[1]}) rotate(${z.rot ?? 0}) scale(${z.s})`}>
      <Body r={r} fill={ZFILL} torn />
      <HeadMount r={r} tilt={tilt}>
        <ZombieHead f={z.face} id={id} />
      </HeadMount>
      <Arm r={r} side="L" />
      <Arm r={r} side="R" />
    </g>
  );
};

// ---- world ------------------------------------------------------------------------
const SKY = Array.from({ length: 22 }, (_, i) => ({
  x: -500 + i * 115 + hn(i, 1) * 30,
  w: 70 + Math.abs(hn(i, 2)) * 70,
  h: 160 + Math.abs(hn(i, 3)) * 280,
  broken: Math.abs(hn(i, 4)) > 0.55,
}));
const PLUMES = [[-120, 0.0], [390, 0.35], [880, 0.7], [1330, 0.2]] as const;

const Skyline: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {/* sun low in the morning haze */}
    <circle cx={160} cy={tr(t, [[0, 640], [4, 600]])} r={70} fill="#c3c5ae" opacity={0.75} />
    {PLUMES.map(([x0, ph], i) =>
      Array.from({ length: 9 }, (_, j) => {
        const a = (t * 0.16 + j / 9 + ph) % 1;
        return <circle key={`${i}-${j}`} cx={x0 + Math.sin(a * 3 + i) * 18 + a * 90} cy={880 - a * 520} r={22 + a * 80} fill="#8a8d78" opacity={0.42 * (1 - a)} />;
      }),
    )}
    {SKY.map((b, i) => (
      <path
        key={i}
        d={b.broken ? `M${b.x} ${GY} L${b.x} ${GY - b.h} L${b.x + b.w * 0.4} ${GY - b.h + 22} L${b.x + b.w * 0.6} ${GY - b.h - 10} L${b.x + b.w} ${GY - b.h + 30} L${b.x + b.w} ${GY} Z` : `M${b.x} ${GY} L${b.x} ${GY - b.h} L${b.x + b.w} ${GY - b.h} L${b.x + b.w} ${GY} Z`}
        fill="#989b86"
      />
    ))}
    {SKY.filter((_, i) => i % 3 === 0).map((b, i) => (
      <path key={`a${i}`} d={`M${b.x + b.w / 2} ${GY - b.h} l0 -46 M${b.x + b.w / 2 - 10} ${GY - b.h - 30} l20 0`} stroke="#989b86" strokeWidth={4} />
    ))}
  </g>
);

const Building: React.FC = () => {
  const x0 = 760, x1 = 1160;
  const wins: React.ReactNode[] = [];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      const x = x0 + 48 + c * 118, y = ROOF + 46 + r * 112;
      const broken = (r * 3 + c) % 4 === 1;
      wins.push(
        <g key={`${r}${c}`}>
          <rect x={x} y={y} width={70} height={74} fill="#8a8d78" stroke={INK} strokeWidth={4} />
          <path d={`M${x + 35} ${y} L${x + 35} ${y + 74} M${x} ${y + 37} L${x + 70} ${y + 37}`} stroke={INK} strokeWidth={2.4} />
          {broken && <path d={`M${x + 8} ${y + 10} L${x + 30} ${y + 30} L${x + 18} ${y + 44} L${x + 48} ${y + 64}`} fill="none" stroke={PALE} strokeWidth={3} strokeLinecap="round" />}
        </g>,
      );
    }
  return (
    <g>
      <rect x={x0} y={ROOF} width={x1 - x0} height={GY - ROOF} fill="#a0a38d" stroke={INK} strokeWidth={4.4} />
      <rect x={x0 - 10} y={ROOF - 12} width={x1 - x0 + 20} height={14} fill={BG} stroke={INK} strokeWidth={4} />
      {wins}
      {/* boarded door */}
      <rect x={x0 + 160} y={GY - 120} width={80} height={120} fill="#8a8d78" stroke={INK} strokeWidth={4} />
      <path d={`M${x0 + 150} ${GY - 92} L${x0 + 250} ${GY - 70} M${x0 + 150} ${GY - 44} L${x0 + 250} ${GY - 58}`} stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <path d={`M${x0 + 150} ${GY - 92} L${x0 + 250} ${GY - 70} M${x0 + 150} ${GY - 44} L${x0 + 250} ${GY - 58}`} stroke="#b4b6a1" strokeWidth={4} strokeLinecap="round" />
      {/* antenna */}
      <path d={`M${x1 - 50} ${ROOF - 12} l0 -90 M${x1 - 72} ${ROOF - 82} l44 0 M${x1 - 66} ${ROOF - 60} l32 0`} stroke={INK} strokeWidth={3.6} strokeLinecap="round" />
    </g>
  );
};

const Ladder: React.FC = () => {
  const off: V = [34, 0];
  const a = LAD_B, b = LAD_T;
  const rungs = Array.from({ length: 11 }, (_, i) => lv(a, b, (i + 0.6) / 11.4));
  return (
    <g stroke={INK} strokeWidth={4} strokeLinecap="round">
      <path d={`M${a[0] - 17} ${a[1]} L${b[0] - 17} ${b[1] - 20}`} />
      <path d={`M${a[0] + off[0] - 17} ${a[1]} L${b[0] + off[0] - 17} ${b[1] - 20}`} />
      {rungs.map((p, i) => (
        <path key={i} d={`M${p[0] - 17} ${p[1]} L${p[0] + 17} ${p[1]}`} strokeWidth={3.4} />
      ))}
    </g>
  );
};

const Crate: React.FC<{ t: number }> = ({ t }) => {
  const x = 985, y = ROOF - 12;
  return (
    <g>
      {Array.from({ length: 6 }, (_, i) => {
        const k = pop(t, T.water + 0.05 + i * 0.1, 0.18);
        if (k <= 0) return null;
        return <Bottle key={i} at={[x - 34 + (i % 3) * 30, y - 46 - Math.floor(i / 3) * 6]} s={0.72 * E.back(k)} />;
      })}
      <rect x={x - 52} y={y - 46} width={104} height={46} fill="#a0a38d" stroke={INK} strokeWidth={4} />
      <path d={`M${x - 52} ${y - 23} L${x + 52} ${y - 23} M${x - 18} ${y - 46} L${x - 18} ${y} M${x + 18} ${y - 46} L${x + 18} ${y}`} stroke={INK} strokeWidth={2.6} />
    </g>
  );
};

const LampPost: React.FC<{ x: number }> = ({ x }) => (
  <g fill="none" stroke={INK} strokeWidth={4.4} strokeLinecap="round">
    <path d={`M${x} ${GY} L${x} ${GY - 360} Q${x} ${GY - 400} ${x + 40} ${GY - 395} L${x + 62} ${GY - 380}`} />
    <path d={`M${x + 50} ${GY - 384} l28 10 l-6 14 l-30 -10 Z`} fill={BG} />
    <path d={`M${x - 14} ${GY} L${x + 14} ${GY}`} />
  </g>
);

const Car: React.FC = () => (
  <g transform={`translate(520 ${GY}) rotate(-4)`}>
    <path d="M-110 -20 L-104 -58 L-60 -64 L-36 -100 L46 -100 L76 -62 L112 -56 L116 -20 Z" fill="#9a9d88" stroke={INK} strokeWidth={4.2} strokeLinejoin="round" />
    <path d="M-28 -92 L-6 -92 L-6 -64 L-50 -64 Z M4 -92 L40 -92 L60 -64 L4 -64 Z" fill="#8a8d78" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <path d="M12 -88 L28 -74 L22 -66" fill="none" stroke={PALE} strokeWidth={2.6} />
    {[-66, 70].map((x) => (
      <g key={x}>
        <circle cx={x} cy={-18} r={21} fill={INK} />
        <circle cx={x} cy={-18} r={8} fill="#9a9d88" />
      </g>
    ))}
  </g>
);

const MARKS = Array.from({ length: 90 }, (_, i) => ({ x: -400 + i * 24 + hn(i, 7) * 10, y: GY + 6 + Math.abs(hn(i, 8)) * 40, k: i % 3 }));
const Street: React.FC = () => (
  <g>
    <rect x={-800} y={GY} width={3200} height={900} fill="#9da08a" />
    <path d={`M-800 ${GY} L2400 ${GY}`} stroke={INK} strokeWidth={4.4} />
    {Array.from({ length: 30 }, (_, i) => (
      <path key={i} d={`M${-700 + i * 110} ${GY + 120} l56 0`} stroke="#b4b6a1" strokeWidth={8} strokeLinecap="round" />
    ))}
    <g fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" opacity={0.7}>
      {MARKS.map((m, i) => (m.k === 0 ? <path key={i} d={`M${m.x - 6} ${m.y - 3} L${m.x} ${m.y} L${m.x + 4} ${m.y - 4}`} /> : m.k === 1 ? <circle key={i} cx={m.x} cy={m.y} r={1.6} fill={INK} /> : <path key={i} d={`M${m.x - 5} ${m.y} L${m.x + 5} ${m.y}`} />))}
    </g>
  </g>
);

const Crows: React.FC<{ t: number }> = ({ t }) => (
  <g fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round">
    {[0, 1, 2].map((i) => {
      const x = -60 + t * 120 + i * 70, y = 500 - i * 30 + Math.sin(t * 2 + i) * 10;
      const flap = Math.sin(t * 14 + i * 2) * 8;
      return <path key={i} d={`M${x - 16} ${y - flap} Q${x - 6} ${y - 4} ${x} ${y} Q${x + 6} ${y - 4} ${x + 16} ${y - flap}`} />;
    })}
  </g>
);

const ASH = Array.from({ length: 46 }, (_, i) => ({ x: Math.abs(hn(i, 21)) * 760, y: Math.abs(hn(i, 22)) * 1300, v: 18 + Math.abs(hn(i, 23)) * 30, r: 1.4 + Math.abs(hn(i, 24)) * 2.4 }));
const Ash: React.FC<{ t: number }> = ({ t }) => (
  <g fill={INK} opacity={0.32}>
    {ASH.map((a, i) => {
      const y = (a.y + t * a.v) % 1300;
      const x = (a.x + Math.sin(t * 0.8 + i) * 14 - t * 9 + 760) % 760;
      return <circle key={i} cx={x} cy={y} r={a.r} />;
    })}
  </g>
);

// ---- camera ---------------------------------------------------------------------
type Cam = [number, number, number]; // world x, world y at screen centre, zoom
const close = (x: number, z: number, groundAt = 820, ground = GY): Cam => [x, ground - (groundAt - 640) / z, z];
function camAt(t: number): Cam {
  const keys: K<Cam>[] = [
    [0, close(320, 1.3)],
    [T.zom - 0.05, close(330, 1.33)],
    [T.zom + 0.25, close(740, 1.05), E.out],
    [T.think - 0.1, close(760, 1.1)],
    [T.think + 0.35, close(560, 0.8, 860), E.io],
    [T.r1 - 0.25, close(560, 0.84, 860)],
    [T.r1 + 0.1, close(300, 1.3), E.io],
    [T.r2 - 0.15, close(290, 1.42)],
    [T.r2 + 0.3, close(610, 0.72, 870), E.io],
    [T.r3 - 0.2, close(630, 0.76, 870)],
    [T.r3 + 0.25, close(935, 1.25, 800, ROOF), E.io],
    [T.r4 - 0.1, close(935, 1.32, 800, ROOF)],
    [T.r4 + 0.3, close(900, 0.92, 960), E.io],
    [T.ring + 0.3, close(905, 0.98, 960)],
    [T.ring + 0.75, close(850, 0.7, 870), E.out],
    [T.phone - 0.12, close(850, 0.72, 870)],
    [T.phone + 0.06, [935, 400, 1.65], E.out],
    [T.end + 0.05, [935, 392, 1.7]],
    [T.end + 0.3, close(840, 0.82, 900), E.out],
    [30.5, close(840, 0.86, 900)],
  ];
  const [a, b, k] = seg(t, keys);
  return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
}

// ---- captions + titles (HTML overlay, 1080×1920) -------------------------------------
const KW = new Set(["زامبی‌ها", "ندو", "جیغ", "بلند", "نردبون", "آب", "اسلحه", "سه", "روز", "بی‌صدا", "گوشیتو"]);
type Chunk = { words: { w: string; s: number; e: number; kw: boolean }[]; s: number; e: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Chunk["words"] = [];
  VO.words.forEach((wd, i) => {
    const raw = wd.w;
    const clean = raw.replace(/\.\.\./g, "").replace(/[،.:…]/g, "");
    const show = clean === "سه" ? "۳" : clean;
    cur.push({ w: show, s: wd.s, e: wd.e, kw: KW.has(clean.replace("؟", "")) });
    const next = VO.words[i + 1];
    if (/[،.:؟…]/.test(raw) || cur.length >= 3 || !next || next.line !== wd.line) {
      out.push({ words: cur, s: cur[0].s, e: 0 });
      cur = [];
    }
  });
  out.forEach((c, i) => {
    const last = c.words[c.words.length - 1].e;
    c.s -= 0.06;
    c.e = out[i + 1] ? Math.min(out[i + 1].s - 0.02, last + 0.6) : last + 0.4;
  });
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const c = CHUNKS.find((ch) => t >= ch.s && t < ch.e);
  if (!c) return null;
  const k = E.back(clamp((t - c.s) / 0.14, 0, 1));
  return (
    <div style={{ position: "absolute", left: 0, top: 1300, width: "100%", display: "flex", justifyContent: "center" }}>
      <div
        style={{
          direction: "rtl", fontFamily: FONT_TEXT, fontSize: 66, lineHeight: 1.25, color: INK, background: "#e4e5d3", padding: "12px 30px 16px", borderRadius: 18,
          border: `5px solid ${INK}`, boxShadow: `8px 8px 0 ${INK}`, transform: `rotate(-1.2deg) scale(${0.8 + 0.2 * k})`, opacity: k, display: "flex", gap: 16, whiteSpace: "nowrap",
        }}
      >
        {c.words.map((wd, i) => {
          const on = t >= wd.s - 0.03 && t < wd.e + 0.08;
          return (
            <span key={i} style={{ padding: "0 10px", borderRadius: 10, background: on ? INK : "transparent", color: on ? "#eef0dc" : wd.kw ? "#2f3127" : INK, fontFamily: wd.kw ? FONT_NUM : FONT_TEXT, fontSize: wd.kw ? 74 : 66 }}>
              {wd.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const RULES: [number, number, string, string][] = [
  [T.r1, T.r2, "۱", "ساکت باش"],
  [T.r2, T.r3, "۲", "برو بالا"],
  [T.r3, T.r4, "۳", "آب، نه اسلحه"],
  [T.r4, T.end + 0.2, "۴", "؟؟؟"],
];
const Badge: React.FC<{ t: number }> = ({ t }) => {
  const r = RULES.find(([a, b]) => t >= a - 0.05 && t < b);
  if (!r) return null;
  const [a, b, n, label0] = r;
  const label = n === "۴" && t > T.phone ? "گوشی رو بی‌صدا کن!" : label0;
  const kin = E.back(clamp((t - a + 0.05) / 0.25, 0, 1));
  const kout = clamp((t - (b - 0.15)) / 0.15, 0, 1);
  const swap = n === "۴" ? E.back(clamp((t - T.phone) / 0.2, 0, 1)) : 1;
  return (
    <div style={{ position: "absolute", left: 0, top: 168, width: "100%", display: "flex", justifyContent: "center", transform: `translateY(${(1 - kin) * -220 - kout * 260}px) rotate(${(1 - kin) * 6}deg)` }}>
      <div style={{ direction: "rtl", display: "flex", alignItems: "center", gap: 22, background: INK, color: "#eef0dc", borderRadius: 999, padding: "14px 40px 18px 22px", fontFamily: FONT_NUM, fontSize: 70, boxShadow: "0 10px 0 rgba(20,21,17,.25)" }}>
        <span style={{ width: 92, height: 92, borderRadius: 999, background: "#eef0dc", color: INK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 66 }}>{n}</span>
        <span style={{ fontFamily: FONT_TEXT, fontSize: 40, opacity: 0.8 }}>قانون</span>
        <span style={{ transform: `scale(${n === "۴" && t > T.phone ? 0.7 + 0.3 * swap : 1})`, display: "inline-block" }}>{label}</span>
      </div>
    </div>
  );
};

const Title: React.FC<{ t: number }> = ({ t }) => {
  if (t > T.r1 + 0.1) return null;
  const k1 = E.back(clamp((t - 0.05) / 0.25, 0, 1));
  const k2 = E.back(clamp((t - T.zom + 0.05) / 0.25, 0, 1));
  const out = clamp((t - (T.r1 - 0.2)) / 0.25, 0, 1);
  return (
    <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center", direction: "rtl", fontFamily: FONT_NUM, color: INK, transform: `translateY(${-out * 300}px)` }}>
      <div style={{ fontSize: 104, lineHeight: 1.1, transform: `scale(${k1})`, opacity: k1 }}>اگه فردا صبح</div>
      <div style={{ fontSize: 124, lineHeight: 1.15, transform: `scale(${k2}) rotate(-2deg)`, opacity: k2, marginTop: 10 }}>
        <span style={{ background: INK, color: "#eef0dc", padding: "0 26px", borderRadius: 16 }}>زامبی‌ها</span> حمله کنن؟
      </div>
    </div>
  );
};

const Stopwatch: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.sec - 0.05 || t > T.r1 + 0.05) return null;
  const k = E.back(clamp((t - T.sec + 0.05) / 0.22, 0, 1));
  const n = Math.min(3, Math.floor((t - T.sec) / 0.32));
  const q = t > T.q + 0.25;
  const ang = (t - T.sec) * 520;
  return (
    <svg viewBox="-120 -140 240 260" style={{ position: "absolute", left: 700, top: 520, width: 300, height: 325, transform: `scale(${k}) rotate(${Math.sin(t * 30) * (q ? 4 : 1)}deg)` }}>
      <rect x={-18} y={-136} width={36} height={26} rx={6} fill={INK} />
      <circle r={102} fill="#e4e5d3" stroke={INK} strokeWidth={12} />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d="M0 -84 L0 -70" stroke={INK} strokeWidth={6} transform={`rotate(${i * 30})`} strokeLinecap="round" />
      ))}
      <path d="M0 0 L0 -64" stroke={INK} strokeWidth={7} strokeLinecap="round" transform={`rotate(${ang})`} opacity={0.35} />
      <text x={0} y={30} textAnchor="middle" fontFamily={FONT_NUM} fontSize={q ? 110 : 96} fill={INK}>
        {q ? "؟" : fa(n)}
      </text>
    </svg>
  );
};

const WaterVsGun: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.water - 0.05 || t > T.r4) return null;
  const kw = E.back(clamp((t - T.water + 0.05) / 0.25, 0, 1));
  const kg = E.back(clamp((t - T.gun + 0.05) / 0.25, 0, 1));
  const kx = E.back(clamp((t - T.gun - 0.25) / 0.18, 0, 1));
  const swap = clamp((t - T.human) / 0.25, 0, 1); // icons leave, "3 days" arrives
  const kd = E.back(clamp((t - T.three + 0.05) / 0.25, 0, 1));
  const out = clamp((t - (T.r4 - 0.2)) / 0.2, 0, 1);
  const card = (x: number, k: number, child: React.ReactNode) => (
    <g transform={`translate(${x} 0) scale(${k})`}>
      <rect x={-110} y={-110} width={220} height={220} rx={34} fill="#e4e5d3" stroke={INK} strokeWidth={9} />
      {child}
    </g>
  );
  return (
    <svg viewBox="0 0 1080 300" style={{ position: "absolute", left: 0, top: 360, width: 1080, height: 300, opacity: 1 - out }}>
      <g transform={`translate(0 ${150 - swap * 40})`} opacity={1 - swap}>
        {card(700, kw, (
          <g>
            <path d="M0 -70 C30 -28 52 -2 52 26 C52 56 28 74 0 74 C-28 74 -52 56 -52 26 C-52 -2 -30 -28 0 -70 Z" fill={INK} />
            <path d="M-22 22 C-22 40 -10 50 4 52" fill="none" stroke="#e4e5d3" strokeWidth={8} strokeLinecap="round" />
          </g>
        ))}
        {kw > 0.5 && <path d="M760 70 l22 24 l40 -50" fill="none" stroke={INK} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />}
        {card(380, kg, (
          <g transform="scale(1.05)">
            <path d="M-74 -36 L58 -36 L58 -4 L-6 -4 L-14 54 L-50 54 L-40 -4 L-74 -4 Z" fill={INK} />
            <path d="M-10 -4 Q-6 18 10 16" fill="none" stroke={INK} strokeWidth={8} />
            <rect x={58} y={-30} width={22} height={14} fill={INK} />
          </g>
        ))}
        {kx > 0 && (
          <g transform={`translate(380 0) scale(${1.6 - 0.6 * kx})`} opacity={kx} stroke="#2a2b23" strokeWidth={26} strokeLinecap="round">
            <path d="M-96 -96 L96 96 M96 -96 L-96 96" stroke={INK} strokeWidth={34} />
            <path d="M-96 -96 L96 96 M96 -96 L-96 96" stroke="#e4e5d3" strokeWidth={12} />
          </g>
        )}
      </g>
      {kd > 0 && (
        <g transform={`translate(540 150) scale(${kd})`}>
          <text x={150} y={52} textAnchor="middle" fontFamily={FONT_NUM} fontSize={150} fill={INK} style={{ direction: "rtl" }}>
            ۳ روز
          </text>
          {[0, 1, 2].map((i) => {
            const cx = -40 - i * 120;
            const gone = t > T.days + 0.25 + i * 0.28;
            return (
              <g key={i} transform={`translate(${cx} 0)`}>
                <circle r={36} fill={gone ? "#e4e5d3" : INK} stroke={INK} strokeWidth={8} />
                {Array.from({ length: 8 }, (_, j) => (
                  <path key={j} d="M0 -48 L0 -62" stroke={INK} strokeWidth={8} strokeLinecap="round" transform={`rotate(${j * 45})`} />
                ))}
                {gone && <path d="M-44 44 L44 -44" stroke={INK} strokeWidth={10} strokeLinecap="round" />}
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
};

const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const t0 = T.end + 0.3;
  if (t < t0) return null;
  const k = E.back(clamp((t - t0) / 0.3, 0, 1));
  const k2 = E.back(clamp((t - t0 - 0.25) / 0.3, 0, 1));
  const bob = Math.sin(t * 5) * 10;
  return (
    <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center", direction: "rtl", color: INK }}>
      <svg viewBox="-160 -90 320 200" style={{ width: 300, height: 188, transform: `translateY(${bob}px) scale(${k})` }}>
        <path d="M-70 30 L-120 110 L120 110 L70 30 Z" fill="#e4e5d3" opacity={0.75} />
        <ellipse cx={0} cy={-18} rx={58} ry={46} fill="#e4e5d3" stroke={INK} strokeWidth={9} />
        <ellipse cx={0} cy={16} rx={140} ry={36} fill={INK} />
        {[-90, -30, 30, 90].map((x, i) => (
          <circle key={x} cx={x} cy={16} r={9} fill={(Math.floor(t * 8) + i) % 2 ? "#e4e5d3" : "#8a8d78"} />
        ))}
      </svg>
      <div style={{ fontFamily: FONT_TEXT, fontSize: 52, marginTop: 6, transform: `scale(${k})`, opacity: k }}>قسمت بعد</div>
      <div style={{ fontFamily: FONT_NUM, fontSize: 104, lineHeight: 1.15, transform: `scale(${k2}) rotate(-2deg)`, opacity: k2 }}>
        اگه <span style={{ background: INK, color: "#eef0dc", padding: "0 22px", borderRadius: 16 }}>آدم‌فضایی‌ها</span> بیان؟
      </div>
    </div>
  );
};

// ---- the film -------------------------------------------------------------------------
const Boil: React.FC<{ seed: number }> = ({ seed }) => (
  <filter id="boil" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={1} seed={seed} />
    <feDisplacementMap in="SourceGraphic" scale={2.2} xChannelSelector="R" yChannelSelector="G" />
  </filter>
);

export const V01: React.FC<{ times?: number[] }> = ({ times }) => {
  const frame0 = useCurrentFrame();
  const frame = times ? Math.round(times[frame0] * V01_FPS) : frame0;
  const t = frame / V01_FPS; // camera + overlays: on ones
  const tc = (frame - (frame % 2)) / V01_FPS; // characters: on twos
  const z1x = z1X(tc);
  const guy = guyAt(tc, z1x);
  const zs = zombies(tc, guy);
  const [cx, cy, z] = camAt(t);
  // ring shake
  const shake = t > T.ring && t < T.ring + 0.6 ? Math.sin(t * 80) * 4 : 0;
  const world = `translate(${360 + shake} 640) scale(${z}) translate(${-cx} ${-cy})`;
  const pz = 1 + (z - 1) * 0.35; // far layer parallax
  const far = `translate(360 640) scale(${pz}) translate(${-(cx * 0.45 + 300)} ${-(cy * 0.6 + GY * 0.4)})`;

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <svg viewBox="0 0 720 1280" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <Boil seed={Math.floor(frame / 4)} />
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={7} />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 -0.18" />
          </filter>
        </defs>
        <rect width={720} height={1280} fill={BG} />
        <g transform={far}>
          <Skyline t={t} />
          {t < T.r1 && <Crows t={t} />}
        </g>
        <g transform={world}>
          <Street />
          <g filter="url(#boil)">
            <LampPost x={90} />
            <Car />
            <Building />
            <Crate t={tc} />
            <Ladder />
            {zs.map((zz, i) => (
              <ZombieView key={i} z={zz} t={tc} id={`z${i}`} />
            ))}
            <GuyView c={guy} t={tc} frame={frame} />
            {/* dust where Z2 lands */}
            {tc > T.up + 0.3 && tc < T.up + 1.0 &&
              [0, 1, 2, 3].map((i) => {
                const k = (tc - T.up - 0.3) / 0.7;
                return <circle key={i} cx={LAD_B[0] - 140 + i * 40 + (i - 1.5) * k * 40} cy={GY - 14 - k * 30} r={14 + k * 18} fill="#b4b6a1" stroke={INK} strokeWidth={2.4} opacity={1 - k} />;
              })}
          </g>
        </g>
        <Ash t={t} />
        <rect width={720} height={1280} filter="url(#grain)" opacity={0.3} />
      </svg>
      <Title t={t} />
      <Stopwatch t={t} />
      <Badge t={t} />
      <WaterVsGun t={t} />
      <Captions t={t} />
      <EndCard t={t} />
    </AbsoluteFill>
  );
};
