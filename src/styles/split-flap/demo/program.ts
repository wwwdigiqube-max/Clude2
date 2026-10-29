// Split-flap · demo = the reference film «24 HRS» (16.5 s, 16:9). The program: what every flap shows at time t (pure
// functions), the layout and the camera. Edit the texts, the timeline and the camera here; board.ts only draws.
// Music: ElevenLabs (pipeline/music-plan.json, 120 BPM, a beat and a hook from the first second), trimmed so the
// first kick lands at 0.10 — every time below is on that grid (kick(k) = 0.10 + 0.5·k).
//   0.10   HOOK: a flip wave explodes from the centre → a giant «24» (and «HRS» below); camera rushes back
//   2.1–4.1  «STARTS IN» locks letter by letter on the eighths
//   4.1–5.9  «24 HOURS» locks letter by letter on the eighths
//   6.1–7.5  build: the board shimmers harder · 7.56 the stop: blackout
//   8.1    DROP: the wave brings back a RED 24 and HRS · ripples on the kicks · 10.1–11.6 patterns · 12.1 back
//   13.1–13.6 all cream / all dark · the wide module cycles words
//   14.1   FINAL HIT: blackout, the logo lands, «24 HOURS» → «24:00:00» · colons blink · 15.95 → 23:59:59
import { BEAT, DROP, FINAL, LAST_TICK, clamp, rnd } from "./lib";
import { pixelText } from "../lib/pixel-font";

// ─────────────── layout (world units; a card is 1.0 × 1.5)
export const COLS = 34;
export const ROWS = 16;
export const PX = 1.18;
export const PY = 1.72;
export const CARD_W = 1.0;
export const HH = 0.75; // half card height
export const GAP = 0.024; // hinge gap
export const LOGO_ROW = 11; // the info panel: logo (wide module) · STARTS IN · 24 HOURS / 24:00:00
export const MSG_ROW = 12;
export const HERO_ROW = 13;
export const WIDE_N = 6;
export const WIDE_W = WIDE_N * PX - (PX - CARD_W);
export const ux = (c: number) => (c - (COLS - 1) / 2) * PX;
export const uy = (r: number) => ((ROWS - 1) / 2 - r) * PY;
export const FL = 0.09; // how long one leaf takes to fall
/** the kick grid of the trimmed song: kick k at 0.10 + 0.5 k */
export const kick = (k: number) => 0.1 + k * BEAT;
const e8 = (k: number) => 0.1 + (k * BEAT) / 2;

// ─────────────── faces
export type Face = { g: number; card: number; ink: number }; // glyph index (-1 = none), palette indices
export const P_BLACK = 0;
export const P_CREAM = 1;
export const P_RED = 2;
export const P_GREY = 3;
export const BLANK: Face = { g: -1, card: P_BLACK, ink: P_CREAM };
export const ON: Face = { g: -1, card: P_CREAM, ink: P_CREAM };
export const RED: Face = { g: -1, card: P_RED, ink: P_CREAM };
export const GREY: Face = { g: -1, card: P_GREY, ink: P_CREAM };
export const sameFace = (a: Face, b: Face) => a.g === b.g && a.card === b.card && a.ink === b.ink;

export const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:".split("");
const RANDOM_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// ─────────────── moves: at t the unit starts flipping to `to` in n steps of dt (intermediate faces from a pool)
type Move = { t: number; to: Face; n: number; dt: number; seed: number; pool: "char" | "pixel" | "none" };
export type FlipState = { a: Face; b: Face; p: number }; // falling leaf from a to b, p ∈ [0,1]; p = 1 → resting on b
export type Unit = { kind: "pixel" | "msg" | "hero"; idx: number; c: number; r: number; x: number; y: number; hero: number; init: Face; moves: Move[] };

let glyphOf: (ch: string) => number = () => -1;
const chFace = (ch: string): Face => (ch === " " ? BLANK : { g: glyphOf(ch), card: P_BLACK, ink: P_CREAM });
function poolFace(m: Move, j: number): Face {
  if (m.pool === "char") return chFace(RANDOM_CHARS[Math.floor(rnd(m.seed * 13.7 + j * 7.1) * RANDOM_CHARS.length)]);
  if (m.pool === "pixel") {
    const r = rnd(m.seed * 3.3 + j * 9.7);
    return r < 0.5 ? BLANK : r < 0.72 ? GREY : r < 0.93 ? ON : RED;
  }
  return m.to;
}
/** the state of one unit at time t */
export function unitState(u: { init: Face; moves: Move[] }, t: number): FlipState {
  let cur = u.init;
  const ms = u.moves;
  for (let i = 0; i < ms.length; i++) {
    const m = ms[i];
    if (m.t > t) break;
    const nextT = i + 1 < ms.length ? ms[i + 1].t : Infinity;
    const tt = Math.min(t, nextT);
    const k = Math.floor((tt - m.t) / m.dt); // the step in progress
    const curStart = cur;
    const face = (j: number) => (j <= 0 ? curStart : j >= m.n ? m.to : poolFace(m, j));
    if (k >= m.n) {
      cur = m.to;
      if (t < nextT) return { a: m.to, b: m.to, p: 1 };
      continue;
    }
    const p = clamp((tt - (m.t + k * m.dt)) / Math.min(FL, m.dt * 0.92));
    if (t < nextT) return { a: face(k), b: face(k + 1), p };
    cur = p >= 0.5 ? face(k + 1) : face(k); // interrupted by the next move
  }
  return { a: cur, b: cur, p: 1 };
}

// ─────────────── the program
/** the giant line drawn with whole flaps (lib/pixel-font.ts): [text, group] — group 1 turns red on the drop */
export const BIG: [string, number][] = [["24", 1], ["HRS", 2]];
export const MSG_TEXT = "STARTS IN";
export const HERO_TEXT = "24 HOURS";
export const HERO_CLOCK = "24:00:00";
export const HERO_FINAL = "23:59:59";
export type WideFace = number; // index into the wide module's faces: 0 blank, 1 logo, 2.. words
export const WIDE_WORDS = ["IDEA", "PROMPT", "CREATE", "STORY", "EDIT", "AI VIDEO", "VIRAL", "LAUNCH"];

export function buildProgram(glyphIndex: (ch: string) => number) {
  glyphOf = glyphIndex;
  const units: Unit[] = [];
  const upper = pixelText(BIG, COLS);
  let mx0 = COLS, mx1 = 0;
  upper.forEach((row) => row.forEach((v, c) => { if (v === 1) { mx0 = Math.min(mx0, c); mx1 = Math.max(mx1, c); } }));
  const c24 = (mx0 + mx1) / 2; // the centre column of the 24
  let seed = 1;
  const add = (u: Unit) => {
    units.push(u);
    return (t: number, to: Face, n = 1, dt = 0.1, pool: Move["pool"] = "none") => u.moves.push({ t, to, n, dt, seed: seed++, pool });
  };
  // ── the fields of pixels
  for (let r = 0; r < ROWS; r++) {
    if (r >= LOGO_ROW && r <= HERO_ROW) continue;
    for (let c = 0; c < COLS; c++) {
      const u: Unit = { kind: "pixel", idx: units.length, c, r, x: ux(c), y: uy(r), hero: -1, init: BLANK, moves: [] };
      const mv = add(u);
      const inUpper = r < LOGO_ROW;
      const grp = inUpper ? upper[r][c] : 0;
      const lit = grp > 0;
      // the strip under the panel: a bar of 24 segments (one per hour) that fills on the build
      const seg = !inUpper && c >= 5 && c < 29 ? c - 5 : -1;
      const face = lit ? ON : BLANK;
      const dist = Math.hypot((c - (COLS - 1) / 2) * PX, (r - MSG_ROW) * PY) / PX; // from the panel centre, in pitches
      const distHook = Math.hypot((c - c24) * PX, (r - 5) * PY) / PX; // from the centre of the 24
      // HOOK: the wave explodes out of the 24 on the first kick
      mv(kick(0) - FL + distHook * 0.022, face, 2, 0.06, "pixel");
      if (lit) for (const k of [1, 2, 3]) mv(kick(k) + r * 0.014 + c * 0.007, face, 1, 0.1);
      // build: the hour bar fills on the sixteenths, harder ripples, then a flicker, then the stop (blackout)
      if (seg >= 0) mv(6.1 + seg * 0.0575 + (r - HERO_ROW - 1) * 0.02, ON, 1, 0.1);
      if (lit) for (const k of [12, 13, 14]) mv(kick(k) + (ROWS - r) * 0.012, face, 1, 0.1);
      mv(7.3 + rnd(seed * 1.9) * 0.12, seg >= 0 ? ON : face, 3, 0.05, "pixel");
      mv(7.56 - FL + dist * 0.006, BLANK, 1, 0.1);
      // DROP: a red 24 and a cream HRS come back in one wave (the hour bar flashes red)
      const dropFace = grp === 1 ? RED : grp === 2 ? ON : seg >= 0 ? RED : BLANK;
      mv(DROP - FL + dist * 0.018, dropFace, 2, 0.06, "pixel");
      if (lit) for (const k of [17, 18, 19]) mv(kick(k) + r * 0.016 + c * 0.006, dropFace, 1, 0.1);
      if (seg >= 0) mv(kick(18) + seg * 0.012, BLANK, 1, 0.1);
      // 10.1–12.1: graphic patterns on the kicks
      const rr = r - MSG_ROW, cc = c - (COLS - 1) / 2;
      const PAT: [number, boolean, number][] = [
        [kick(20), r % 2 === 0, (r * 0.4 + c) * 0.01],
        [kick(21), (r + c) % 2 === 0, dist * 0.018],
        [kick(22), c % 3 !== 1, c * 0.012],
        [kick(23), Math.floor(Math.hypot(cc * 1.18, rr * 1.72) / 2.4) % 2 === 0, dist * 0.015],
      ];
      for (const [at, onP, d] of PAT) mv(at + d, onP ? ON : BLANK, 1, 0.1);
      // 12.1: the 24 and HRS again (cream) · 12.6 the 24 flashes red · 13.1 all cream · 13.6 all dark
      mv(kick(24) + dist * 0.014, face, 1, 0.1);
      if (grp === 1) {
        mv(kick(25) + r * 0.02, RED, 1, 0.1);
        mv(kick(25) + 0.25 + r * 0.02, ON, 1, 0.1);
      }
      mv(kick(26) + c * 0.008, ON, 1, 0.1);
      mv(kick(27) + (COLS - c) * 0.008, BLANK, 1, 0.1);
      mv(FINAL - FL + dist * 0.01, BLANK, 1, 0.1);
    }
  }
  // ── the message rows (centred character units)
  const mkRow = (text: string, row: number, kind: "msg" | "hero") =>
    text.split("").map((ch, k) => {
      const u: Unit = { kind, idx: units.length, c: k, r: row, x: (k - (text.length - 1) / 2) * PX, y: uy(row), hero: k, init: BLANK, moves: [] };
      return { u, mv: add(u), target: chFace(ch) };
    });
  const lockRow = (row: ReturnType<typeof mkRow>, first: number, busyFrom: number) =>
    row.forEach(({ u, mv, target }, k) => {
      const lockAt = e8(first + k);
      const n = 4 + (k % 3), dt = 0.07;
      const lockStart = lockAt - FL - (n - 1) * dt;
      for (let t = busyFrom; t < lockStart - 0.1; t += BEAT / 2) if (rnd(k * 17 + t * 3.1 + u.r) < 0.7) mv(t, chFace(RANDOM_CHARS[Math.floor(rnd(k * 31 + t * 7 + u.r) * RANDOM_CHARS.length)]), 1 + Math.floor(rnd(k + t * 9) * 2), 0.08, "char");
      mv(lockStart, target, n, dt, "char");
    });
  const msg = mkRow(MSG_TEXT, MSG_ROW, "msg");
  const hero = mkRow(HERO_TEXT, HERO_ROW, "hero");
  lockRow(msg, 8, 1.6); // S on 2.1 … N on 4.1
  lockRow(hero, 16, 3.4); // 2 on 4.1 … S on 5.85
  for (const row of [msg, hero])
    row.forEach(({ mv, target }, k) => {
      for (const t of [7.3, 7.42]) mv(t + k * 0.01, target, 1, 0.1); // the build shivers through the letters
      mv(DROP - FL + Math.abs(k - 4) * 0.025, target, 1, 0.1);
      for (const kk of [24, 26]) mv(kick(kk) + Math.abs(k - 4) * 0.02, target, 1, 0.1);
    });
  msg.forEach(({ mv, target }, k) => mv(FINAL - FL + Math.abs(k - 4) * 0.02, target, 1, 0.1));
  hero.forEach(({ mv }, k) => {
    const clock = chFace(HERO_CLOCK[k]);
    mv(FINAL - FL - 2 * 0.07, clock, 3, 0.07, "char"); // «24 HOURS» → «24:00:00» on the final hit
    if (HERO_CLOCK[k] === ":") for (let b = kick(29); b < 15.7; b += BEAT) {
      mv(b, BLANK, 1, 0.1);
      mv(b + 0.25, clock, 1, 0.1);
    }
    mv(LAST_TICK, chFace(HERO_FINAL[k]), 1, 0.1);
  });
  // ── the wide module: blank, words on the last bar, the logo on the final hit
  const wide: { t: number; to: WideFace; n: number; dt: number }[] = [
    { t: kick(24), to: 2 + 2, n: 4, dt: 0.25 },
    { t: kick(26), to: 2 + 7, n: 6, dt: 0.13 },
    { t: FINAL - 0.12, to: 1, n: 1, dt: 0.12 },
  ];
  const wideState = (t: number): { a: WideFace; b: WideFace; p: number } => {
    let cur: WideFace = 0;
    for (let i = 0; i < wide.length; i++) {
      const m = wide[i];
      if (m.t > t) break;
      const nextT = i + 1 < wide.length ? wide[i + 1].t : Infinity;
      const tt = Math.min(t, nextT);
      const k = Math.floor((tt - m.t) / m.dt);
      const start = cur;
      const face = (j: number): WideFace => (j <= 0 ? start : j >= m.n ? m.to : 2 + ((i * 3 + j * 5) % WIDE_WORDS.length));
      if (k >= m.n) {
        cur = m.to;
        if (t < nextT) return { a: m.to, b: m.to, p: 1 };
        continue;
      }
      const p = clamp((tt - (m.t + k * m.dt)) / Math.min(0.12, m.dt * 0.92));
      if (t < nextT) return { a: face(k), b: face(k + 1), p };
      cur = p >= 0.5 ? face(k + 1) : face(k);
    }
    return { a: cur, b: cur, p: 1 };
  };
  return { units, wideState };
}

// ─────────────── camera: [t, position, target, fov]; Catmull–Rom through the keys, eased per segment
export type CamKey = [number, [number, number, number], [number, number, number], number];
const MY = uy(MSG_ROW);
const HY = uy(HERO_ROW);
const G1 = (() => {
  const g = pixelText(BIG, COLS);
  let a = COLS, b = 0;
  g.forEach((row) => row.forEach((v, c) => { if (v === 1) { a = Math.min(a, c); b = Math.max(b, c); } }));
  return (a + b) / 2;
})();
const X24 = ux(G1 + 1); // the hook starts inside the big word of group 1 (the «24»)
const Y24 = uy(5); // the middle of the pixel letters (rows 1..9)
export const CAM: CamKey[] = [
  // hook: from inside the 24 straight back to the whole board
  [0.0, [X24 + 0.6, Y24 + 0.4, 9.5], [X24, Y24, 0], 34],
  [1.15, [2.0, 0.5, 52.0], [0, -0.5, 0], 31],
  [2.05, [-3.0, 0.0, 56.0], [0, -0.8, 0], 31],
  // STARTS IN (cut on the bar): along the row from the left
  [2.1, [-8.5, MY + 1.7, 7.5], [-3.4, MY, 0], 30],
  [4.05, [2.6, MY + 1.0, 8.0], [5.0, MY - 0.3, 0], 30],
  // 24 HOURS (cut on the bar): from the right, gliding left
  [4.1, [8.5, HY - 1.3, 7.5], [3.6, HY, 0], 30],
  [6.05, [-4.0, HY - 0.6, 9.5], [-1.2, HY + 0.3, 0], 30],
  // build: back to frontal — the panel, the hour bar filling below, the field above
  [6.1, [0.0, MY - 1.0, 13.0], [0, MY - 1.0, 0], 30],
  [7.55, [0.0, MY + 3.0, 32.0], [0, MY + 3.0, 0], 30],
  [8.1, [0.0, MY + 3.0, 29.5], [0, MY + 3.0, 0], 30],
  // DROP: whip back, then a slow orbit
  [8.6, [4.0, 1.5, 60.0], [0, -0.5, 0], 31],
  [10.1, [-9.0, 3.0, 53.0], [0, 0.0, 0], 31],
  [11.1, [-16.0, 8.0, 30.0], [-5.0, 4.0, 0], 31],
  [12.1, [14.0, 2.0, 38.0], [3.0, 0.0, 0], 31],
  [14.0, [0.5, MY + 0.3, 13.5], [0, MY, 0], 30],
  // the final: the panel, a slow push
  [14.35, [0, MY + 0.2, 16.8], [0, MY, 0], 30],
  [16.5, [0, MY + 0.2, 14.6], [0, MY, 0], 30],
];
/** where the path cuts instead of flowing */
export const CAM_CUTS = [2.1, 4.1];
