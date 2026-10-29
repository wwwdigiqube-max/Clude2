// Hologram HUD demo director: the dark room and the projector are always there; the shots change with a different
// transition each time (whip pan, zoom-through, a drop for gravity, a VHS rewind into 1977, a glitch, a pull-back),
// the camera kicks and shakes on the key words, and the HUD frame, the typed caption and the film finish go on top.
import { Ctx, H, layer, W } from "../lib/canvas";
import { clamp, ease, hash, lerp, noise2 } from "../lib/math";
import { caption, finish, frameHud, P, projector, rgba, room } from "../lib/holo";
import { chunkAt, SH, Wd } from "./cues";
import * as S from "./scenes";

type Tr = "cut" | "glitch" | "whip" | "zoom" | "drop" | "rewind" | "pull";
type Shot = { t0: number; draw: (c: Ctx, t: number) => void; tr: Tr };
const SHOTS: Shot[] = [
  { t0: 0, draw: S.sOpen, tr: "cut" },
  { t0: SH.phone, draw: S.sPhone, tr: "whip" },
  { t0: SH.earth, draw: S.sEarth, tr: "zoom" },
  { t0: SH.clocks, draw: S.sClocks, tr: "glitch" },
  { t0: SH.speed, draw: S.sSpeed, tr: "whip" },
  { t0: SH.gravity, draw: S.sGravity, tr: "drop" },
  { t0: SH.net, draw: S.sNet, tr: "glitch" },
  { t0: SH.light, draw: S.sLight, tr: "whip" },
  { t0: SH.map, draw: S.sMap, tr: "zoom" },
  { t0: SH.y1977, draw: S.s1977, tr: "rewind" },
  { t0: SH.testsat, draw: S.sTestSat, tr: "zoom" },
  { t0: SH.proof, draw: S.sProof, tr: "whip" },
  { t0: SH.fix, draw: S.sFix, tr: "glitch" },
  { t0: SH.back, draw: S.sBack, tr: "pull" },
];
const DUR: Record<Tr, number> = { cut: 0, glitch: 0.22, whip: 0.34, zoom: 0.42, drop: 0.45, rewind: 0.6, pull: 0.5 };

// ---- the camera: kicks (zoom punch) and shakes on the key words: [time, zoom, shake px] ----
const KICKS: [number, number, number][] = [
  [Wd(1, "کُند"), 0.05, 8],
  [Wd(2, "چهار"), 0.025, 0],
  [Wd(2, "موقعیتتون"), 0.04, 3],
  [Wd(3, "اتمی"), 0.03, 0],
  [Wd(4, "زمان"), 0.04, 5],
  [Wd(5, "هفت"), 0.05, 7],
  [Wd(5, "کُند"), 0.025, 0],
  [Wd(6, "جاذبه"), 0.03, 3],
  [Wd(6, "چهل"), 0.05, 7],
  [Wd(6, "تندتر"), 0.025, 0],
  [Wd(7, "سی"), 0.06, 13],
  [Wd(7, "جلو"), 0.03, 0],
  [Wd(8, "نور"), 0.03, 0],
  [Wd(8, "کیلومتر"), 0.05, 10],
  [Wd(9, "هفت،") + 0.1, 0.05, 9],
  [Wd(9, "باور"), 0.03, 0],
  [Wd(10, "اینشتین"), 0.03, 0],
  [Wd(10, "نکردن"), 0.04, 8],
  [Wd(11, "هفته"), 0.03, 0],
  [Wd(11, "جلو"), 0.03, 0],
  [Wd(11, "پیش‌بینی") + 0.2, 0.05, 6],
  [Wd(12, "هنوزم") + 0.1, 0.05, 6],
  [Wd(12, "کندتر"), 0.05, 8],
];
type Kick = { z: number; dx: number; dy: number; rot: number };
function kickAt(t: number): Kick {
  const q: Kick = { z: 1, dx: 0, dy: 0, rot: 0 };
  for (const [tk, amp, sh] of KICKS) {
    const d = t - tk;
    if (d < 0 || d > 1.2) continue;
    q.z += amp * (1 - Math.exp(-d / 0.03)) * Math.exp(-d / 0.2);
    if (sh) {
      const e = Math.exp(-d / 0.14);
      q.dx += (noise2(t * 38, tk) - 0.5) * 2 * sh * e;
      q.dy += (noise2(t * 38, tk + 50) - 0.5) * 2 * sh * e;
      q.rot += (noise2(t * 30, tk + 90) - 0.5) * 0.012 * (sh / 8) * e;
    }
  }
  return q;
}
function applyKick(c: Ctx, q: Kick) {
  c.translate(540 + q.dx, 700 + q.dy);
  c.rotate(q.rot);
  c.scale(q.z, q.z);
  c.translate(-540, -700);
}

// ---- transitions ----
function shotLayer(id: string, sh: Shot, t: number, q: Kick) {
  const L = layer(id, 1);
  L.save();
  applyKick(L, q);
  sh.draw(L, t);
  L.restore();
  return L;
}
/** composite a shot layer moved / scaled about the stage centre */
function put(c: Ctx, L: Ctx, alpha: number, dx: number, dy: number, s: number) {
  if (alpha <= 0.003) return;
  c.save();
  const sc = c.canvas.width / W;
  c.setTransform(sc, 0, 0, sc, 0, 0);
  c.translate(540 + dx, 700 + dy);
  c.scale(s, s);
  c.translate(-540, -700);
  c.globalAlpha = clamp(alpha);
  c.globalCompositeOperation = "screen";
  c.drawImage(L.canvas, 0, 0, W, H);
  c.restore();
}
function transition(c: Ctx, t: number, A: Shot, B: Shot, p: number, q: Kick) {
  const LA = shotLayer("shotA", A, t, q), LB = shotLayer("shotB", B, t, q);
  const e = ease.inOut(p), bl = Math.sin(p * Math.PI);
  switch (B.tr) {
    case "whip": {
      // pan left: the old shot leaves to the right, the new one comes in from the left, smeared
      const dA = W * 1.1 * e, dB = -W * 1.1 * (1 - e);
      put(c, LA, 1, dA, 0, 1);
      put(c, LB, 1, dB, 0, 1);
      for (let j = 1; j <= 3; j++) {
        put(c, LA, 0.3 * bl, dA - j * 55 * bl, 0, 1);
        put(c, LB, 0.3 * bl, dB - j * 55 * bl, 0, 1);
      }
      break;
    }
    case "zoom":
      put(c, LA, 1 - ease.in(p), 0, 0, 1 + 1.3 * ease.in(p));
      put(c, LB, ease.out(clamp(p * 1.4)), 0, 0, lerp(0.55, 1, ease.out(p)));
      break;
    case "drop":
      put(c, LA, 1 - e, 0, H * 0.3 * ease.in(p), 1);
      put(c, LB, clamp(p * 3), 0, -H * 0.55 * (1 - ease.outBack(p)), 1);
      break;
    case "pull":
      put(c, LA, 1 - e, 0, 0, lerp(1, 0.55, e));
      put(c, LB, e, 0, 0, lerp(1.6, 1, ease.out(p)));
      break;
    case "rewind":
      put(c, LA, 1 - clamp(p * 2.2), 0, 0, 1);
      put(c, LB, clamp(p * 1.6 - 0.2), 0, 0, 1);
      break;
    default:
      put(c, LB, 1, 0, 0, 1);
  }
}
/** tear the frame into shifted bands (the canvas copies itself) */
function tear(c: Ctx, t: number, amt: number, bands = 9, shift = 140) {
  const f = Math.floor(t * 30);
  const cv = c.canvas, sc = cv.width / W;
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < bands; i++) {
    const y = hash(f * 7.1 + i) * cv.height, h = (10 + hash(f * 3.3 + i) * 90) * sc, dx = (hash(f * 5.7 + i) - 0.5) * shift * sc * amt;
    c.drawImage(cv, 0, y, cv.width, h, dx, y, cv.width, h);
  }
  c.globalCompositeOperation = "lighter";
  c.fillStyle = rgba(P.amber, 0.08 * amt);
  c.fillRect(0, hash(f + 9) * cv.height, cv.width, 6 * sc);
  c.restore();
}
/** VHS rewind: rolling bands, tracking noise and a ◀◀ mark */
function vhs(c: Ctx, t: number, amt: number) {
  tear(c, t, amt, 16, 220);
  const sc = c.canvas.width / W, f = Math.floor(t * 30);
  c.save();
  c.setTransform(sc, 0, 0, sc, 0, 0);
  c.globalCompositeOperation = "lighter";
  for (let i = 0; i < 5; i++) {
    const y = (H - ((t * 2400 + i * 397) % (H + 200))) | 0;
    c.fillStyle = rgba(P.hi, 0.12 * amt * (0.5 + hash(f + i)));
    c.fillRect(0, y, W, 3 + hash(f * 2 + i) * 14);
  }
  if (Math.floor(t * 8) % 2 === 0) {
    c.fillStyle = rgba(P.hot, 0.9 * amt);
    for (const x0 of [80, 122]) {
      c.beginPath();
      c.moveTo(x0, 235);
      c.lineTo(x0 + 40, 212);
      c.lineTo(x0 + 40, 258);
      c.closePath();
      c.fill();
    }
  }
  c.restore();
}

export function frame22(c: Ctx, t: number) {
  let i = SHOTS.length - 1;
  while (i > 0 && t < SHOTS[i].t0) i--;
  const sh = SHOTS[i], q = kickAt(t);
  room(c, t);
  c.save();
  applyKick(c, q);
  projector(c, t, 1);
  c.restore();
  const d = DUR[sh.tr], p = d > 0 ? (t - sh.t0) / d : 1;
  const layered = i > 0 && p < 1 && sh.tr !== "glitch" && sh.tr !== "cut";
  if (layered) transition(c, t, SHOTS[i - 1], sh, clamp(p), q);
  else {
    c.save();
    applyKick(c, q);
    sh.draw(c, t);
    c.restore();
  }
  if (i > 0 && sh.tr === "glitch" && p < 1) tear(c, t, 1 - p);
  if (sh.tr === "rewind" && p < 1) vhs(c, t, 1 - p * 0.7);
  frameHud(c, t);
  caption(c, chunkAt(t), t);
  finish(c, t);
}
