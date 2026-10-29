// D2 · «کامپیوترم رو باز میکردم و به رفیق عزیزم کلاد میگفتم: برو این محتوا رو بساز! و خودم رو راحت کردم از تمام
// سختی‌های تولید ویدئو» (23.4 → 31.45) — mixed media: the user's photo of a real room at night, and a small chalk
// stickman living in it. We pull out of the laptop's black screen (C's black water); he hops onto the keyboard and
// stomps the power key on «باز»; Claude's card flies out of the screen on «کلاد» and he waves at it; he points while
// the prompt types, snaps on «بساز» — videos fly out and pin themselves on the wall; he jumps off the desk, runs over
// the rug and flops on the sofa; the burdens of video-making appear as chalk doodles, get crumpled into a ball, and he
// flicks it into the wastebasket on «ویدئو».
import { bloom, blur, Ctx, H, layer, matchTransform, paint, scale, W } from "../../lib/canvas";
import { glow, grain, vignette } from "../../lib/fx";
import { txt } from "../../lib/hud";
import { clamp, ease, hash, k, lerp, rgba, rng } from "../../lib/math";
import { img } from "../../lib/img";
import { mixSP, runSP, SP, SPOSE, stickman } from "../../lib/stick";
import { CLAUDE_ORANGE, CLAUDE_PATH } from "../../lib/claude-logo";
import { BEATS, Wd } from "../cues";
import { snap } from "./s9-sheet";

export const D2_START = 23.4;
export const D2_END = 31.45;
const IW = 1672, IH = 941; // room.png
const SCREEN: [number, number][] = [[78, 431], [178, 429], [180, 508], [80, 512]]; // laptop screen corners
const SC = { x: 129, y: 470 };
const BIN = { x: 1613, y: 676 };
const H_STICK = 74;
type Cam = { x: number; y: number; z: number };
type Key = [number, number];
/** piecewise ease between keys [time, value] */
function kf(t: number, keys: Key[], f: (x: number) => number = ease.inOut) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
      return lerp(v0, v1, f(clamp((t - t0) / (t1 - t0))));
    }
  }
  return keys[keys.length - 1][1];
}
function camAt(t: number): Cam {
  const pull = k(t, D2_START, 24.35, ease.outQuint);
  const pan = k(t, 27.9, 29.45, ease.inOutSine);
  const settle = k(t, 29.45, D2_END, ease.inOutSine);
  let x = lerp(SC.x, 245, pull), y = lerp(SC.y, 505, pull), z = Math.exp(lerp(Math.log(13), Math.log(2.9), pull));
  z *= 1 + 0.05 * k(t, 24.35, 27.9);
  x = lerp(x, 1395, pan);
  y = lerp(y, 497, pan);
  z = lerp(z, 2.2, pan);
  x = lerp(x, 1420, settle);
  y = lerp(y, 525, settle);
  z = lerp(z, 2.35, settle);
  return { x, y, z };
}
const toScreen = (cam: Cam, X: number, Y: number): [number, number] => [540 + (X - cam.x) * cam.z, 960 + (Y - cam.y) * cam.z];
// ---- the stickman's performance ----
function stickAt(t: number): { x: number; y: number; face: 1 | -1; pose: SP; pelvis?: boolean; rot?: number; smile: number; look: number } {
  const tLand = Wd(5, "باز") , tWave0 = Wd(5, "به") + 0.12, tPoint = Wd(5, "میگفتم:") - 0.05, tSnap = Wd(5, "بساز!");
  const tJump = Wd(5, "و", 1) + 0.02, tFloor = tJump + 0.42, tSofaJ = tFloor + 0.62, tSofa = tSofaJ + 0.3;
  const breathe = (p: SP) => mixSP(p, SPOSE.stand, 0);
  if (t < tLand - 0.36) return { x: 318, y: 515, face: -1, pose: breathe(mixSP(SPOSE.stand, SPOSE.crouch, k(t, tLand - 0.52, tLand - 0.36))), smile: 0.3, look: 0.3 };
  if (t < tLand) {
    const u = (t - (tLand - 0.36)) / 0.36;
    return { x: lerp(318, 236, u), y: lerp(515, 510, u) - Math.sin(u * Math.PI) * 46, face: -1, pose: SPOSE.jump, smile: 0.5, look: 0.2 };
  }
  if (t < tWave0) {
    const st = k(t, tLand, tLand + 0.22, ease.out);
    return { x: 236, y: 510, face: -1, pose: mixSP(SPOSE.crouch, SPOSE.press, st), smile: 0.4, look: 0.5 };
  }
  if (t < tPoint) {
    const w = mixSP(SPOSE.wave, { ...SPOSE.wave, elF: 0.5 + 0.6 * Math.sin(t * 18) }, 1);
    return { x: 236, y: 510, face: 1, pose: mixSP(SPOSE.press, w, k(t, tWave0, tWave0 + 0.2)), smile: 0.9, look: 0.0 };
  }
  if (t < tSnap - 0.12) {
    const talk = mixSP(SPOSE.point, { ...SPOSE.point, lean: 0.14 + 0.05 * Math.sin(t * 9) }, 1);
    return { x: 236, y: 510, face: 1, pose: mixSP(SPOSE.wave, talk, k(t, tPoint, tPoint + 0.2)), smile: 0.6, look: -0.2 };
  }
  if (t < tJump) {
    const sn = k(t, tSnap - 0.12, tSnap + 0.05, ease.out);
    const hop = t > tSnap + 0.25 && t < tSnap + 0.45 ? Math.sin(((t - tSnap - 0.25) / 0.2) * Math.PI) * 10 : 0;
    return { x: 236, y: 510 - hop, face: 1, pose: mixSP(SPOSE.point, SPOSE.snap, sn), smile: 1, look: 0.4 };
  }
  if (t < tFloor) {
    const u = (t - tJump) / (tFloor - tJump);
    return { x: lerp(236, 430, u), y: lerp(510, 798, u * u) - Math.sin(u * Math.PI) * 70, face: 1, pose: SPOSE.jump, smile: 1, look: 0.5 };
  }
  if (t < tSofaJ) {
    const u = (t - tFloor) / (tSofaJ - tFloor);
    const land = k(t, tFloor, tFloor + 0.1);
    return { x: lerp(430, 1078, ease.inOut(u)), y: 798 + (1 - land) * 0, face: 1, pose: mixSP(SPOSE.crouch, runSP(t * 3.4), land), smile: 0.9, look: 0.5 };
  }
  if (t < tSofa) {
    const u = (t - tSofaJ) / (tSofa - tSofaJ);
    return { x: lerp(1078, 1222, u), y: lerp(798, 590, u) - Math.sin(u * Math.PI) * 60, face: 1, pose: SPOSE.jump, smile: 1, look: 0.4 };
  }
  // lying on the sofa (head on the armrest), the flick on «ویدئو»
  const fl = k(t, Wd(5, "ویدئو.") - 0.12, Wd(5, "ویدئو.") + 0.05, ease.out) * (1 - k(t, Wd(5, "ویدئو.") + 0.3, Wd(5, "ویدئو.") + 0.6));
  const flop = k(t, tSofa, tSofa + 0.25, ease.out);
  const pose = mixSP(mixSP(SPOSE.crouch, SPOSE.lie, flop), SPOSE.flick, fl);
  return { x: 1238, y: 583, face: 1, pose, pelvis: flop > 0.5, smile: 1, look: 0.3 };
}
// ---- the room photo, the laptop screen, light ----
function room(c: Ctx, t: number, cam: Cam, lit: Ctx, on: number) {
  const im = img("room");
  c.save();
  c.translate(540 - cam.x * cam.z, 960 - cam.y * cam.z);
  c.scale(cam.z, cam.z);
  if (im) {
    c.imageSmoothingQuality = "high";
    c.drawImage(im, 0, 0, IW, IH);
  } else {
    c.fillStyle = "#0d1018";
    c.fillRect(0, 0, IW, IH);
  }
  // city lights twinkling in the window
  const r = rng(31);
  for (let i = 0; i < 26; i++) {
    const x = 440 + r() * 500, y = 360 + r() * 140, ph = r() * 6.28;
    const a = 0.15 + 0.35 * Math.max(0, Math.sin(t * (1 + r() * 2) + ph));
    c.fillStyle = rgba(r() < 0.7 ? "#ffd59a" : "#9fc4ff", a);
    c.fillRect(x, y, 2.2, 2.2);
  }
  // the laptop screen: off → a flash → Claude's UI glowing
  const [a, b, cc, d] = SCREEN;
  c.save();
  c.beginPath();
  c.moveTo(a[0], a[1]);
  c.lineTo(b[0], b[1]);
  c.lineTo(cc[0], cc[1]);
  c.lineTo(d[0], d[1]);
  c.closePath();
  c.clip();
  if (on > 0) {
    const g = c.createLinearGradient(a[0], a[1], d[0], d[1]);
    g.addColorStop(0, rgba("#f3eee6", on));
    g.addColorStop(1, rgba("#e9e2d6", on));
    c.fillStyle = g;
    c.fillRect(70, 420, 120, 100);
    // tiny UI on the screen: a top bar, a centred orange mark, an input line
    c.fillStyle = rgba("#d9d2c4", on);
    c.fillRect(70, 431, 120, 6);
    c.save();
    c.translate(122, 462);
    c.scale(0.9, 0.9);
    c.translate(-12, -12);
    c.fillStyle = rgba(CLAUDE_ORANGE, on);
    c.fill(new Path2D(CLAUDE_PATH));
    c.restore();
    c.fillStyle = rgba("#ffffff", on);
    c.beginPath();
    c.roundRect(92, 487, 74, 9, 3);
    c.fill();
    const boot = t < Wd(5, "باز") + 0.12 ? 1 : Math.exp(-(t - Wd(5, "باز") - 0.12) / 0.12);
    c.fillStyle = rgba("#ffffff", 0.9 * boot * on);
    c.fillRect(70, 420, 120, 100);
  }
  c.restore();
  if (on > 0) {
    // the screen's light on the desk, the wall and the lamp
    c.save();
    c.globalCompositeOperation = "screen";
    glow(c, SC.x + 30, SC.y + 10, 260, "#bcd2ff", 0.32 * on * (0.95 + 0.05 * Math.sin(t * 11)));
    glow(c, SC.x + 10, SC.y + 40, 120, "#ffffff", 0.18 * on);
    c.restore();
    lit.save();
    lit.fillStyle = rgba("#ffffff", 0.7 * on);
    lit.fillRect(80, 432, 98, 78);
    lit.restore();
  }
  c.restore();
}
// ---- chalk doodles of the burdens ----
type Doodle = { x: number; y: number; s: number; draw: (c: Ctx) => void };
const chalkLine = (c: Ctx, pts: [number, number][], seed: number) => {
  const r = rng(seed);
  c.beginPath();
  pts.forEach(([x, y], i) => {
    const jx = (r() - 0.5) * 1.6, jy = (r() - 0.5) * 1.6;
    i ? c.lineTo(x + jx, y + jy) : c.moveTo(x + jx, y + jy);
  });
  c.stroke();
};
const circlePts = (x: number, y: number, r: number, n = 26): [number, number][] => Array.from({ length: n + 1 }, (_, i) => [x + Math.cos((i / n) * Math.PI * 2) * r, y + Math.sin((i / n) * Math.PI * 2) * r]);
const DOODLES: Doodle[] = [
  // camera on a tripod
  { x: 1478, y: 724, s: 1, draw: (c) => {
    chalkLine(c, [[-30, -22], [30, -22], [30, 18], [-30, 18], [-30, -22]], 1);
    chalkLine(c, circlePts(0, -2, 13), 2);
    chalkLine(c, [[-12, -22], [-6, -32], [8, -32], [12, -22]], 3);
    chalkLine(c, [[0, 18], [-34, 70]], 4);
    chalkLine(c, [[0, 18], [34, 70]], 5);
    chalkLine(c, [[0, 18], [0, 72]], 6);
  } },
  // ring light on a stand
  { x: 1556, y: 590, s: 1, draw: (c) => {
    chalkLine(c, circlePts(0, 0, 34), 7);
    chalkLine(c, circlePts(0, 0, 22), 8);
    chalkLine(c, [[0, 34], [0, 150]], 9);
    chalkLine(c, [[-26, 196], [0, 150], [26, 196]], 10);
  } },
  // a clock
  { x: 1150, y: 470, s: 1, draw: (c) => {
    chalkLine(c, circlePts(0, 0, 30), 11);
    chalkLine(c, [[0, 0], [0, -20]], 12);
    chalkLine(c, [[0, 0], [14, 6]], 13);
  } },
  // tangled cables
  { x: 1370, y: 780, s: 1, draw: (c) => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 40; i++) {
      const u = i / 40;
      pts.push([-70 + u * 140 + Math.sin(u * 19) * 18, Math.cos(u * 23) * 12 + Math.sin(u * 7) * 6]);
    }
    chalkLine(c, pts, 14);
  } },
  // a pile of papers + a coffee cup
  { x: 1100, y: 770, s: 1, draw: (c) => {
    for (let i = 0; i < 4; i++) chalkLine(c, [[-34 + i * 2, -i * 9], [34 + i * 2, -i * 9 - 3]], 15 + i);
    chalkLine(c, [[44, -30], [48, 0], [70, 0], [74, -30]], 20);
    chalkLine(c, [[74, -24], [84, -20], [74, -10]], 21);
  } },
];
const BALL = { x: 1262, y: 520 };
function doodles(c: Ctx, t: number, lit: Ctx) {
  const t0 = Wd(5, "تمام") - 0.1;
  const gather = k(t, Wd(5, "تولید") - 0.08, Wd(5, "تولید") + 0.25, ease.in);
  if (t < t0) return;
  c.save();
  c.strokeStyle = "#f4f1ea";
  c.lineCap = "round";
  c.lineJoin = "round";
  c.lineWidth = 2.6;
  c.shadowColor = "#ffffff";
  c.shadowBlur = 8 * scale();
  DOODLES.forEach((d, i) => {
    const ti = t0 + i * 0.13;
    const p = clamp((t - ti) / 0.2);
    if (p <= 0 || gather >= 1) return;
    c.save();
    const x = lerp(d.x, BALL.x, gather), y = lerp(d.y, BALL.y, gather), s = lerp(1, 0.08, gather);
    c.translate(x, y);
    c.rotate(gather * (i % 2 ? 2 : -2));
    c.scale(s * (0.6 + 0.4 * ease.outBack(p)), s * (0.6 + 0.4 * ease.outBack(p)));
    c.globalAlpha = p;
    d.draw(c);
    c.restore();
  });
  c.restore();
  // the crumpled chalk ball, flicked into the bin
  if (gather > 0.85) {
    const tf = Wd(5, "ویدئو.") + 0.02;
    const u = clamp((t - tf) / 0.42);
    const x = lerp(BALL.x, BIN.x, u), y = lerp(BALL.y, BIN.y, u) - Math.sin(u * Math.PI) * 120;
    if (u < 1) {
      c.save();
      c.strokeStyle = "#f4f1ea";
      c.lineWidth = 2.2;
      c.shadowColor = "#ffffff";
      c.shadowBlur = 8 * scale();
      const r = rng(77);
      c.translate(x, y);
      c.rotate(t * 9);
      c.beginPath();
      for (let i = 0; i < 30; i++) {
        const a = r() * 6.28, rr = 6 + r() * 7;
        i ? c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : c.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      c.stroke();
      c.restore();
      glow(lit, x, y, 24, "#ffffff", 0.6);
    }
    // swish!
    const sw = t - (tf + 0.42);
    if (sw > 0 && sw < 0.5) {
      c.save();
      c.strokeStyle = rgba("#f4f1ea", 1 - sw / 0.5);
      c.lineWidth = 2.4;
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i - 2.5) * 0.35, r0 = 14 + sw * 60, r1 = r0 + 14;
        c.beginPath();
        c.moveTo(BIN.x + Math.cos(a) * r0, BIN.y - 6 + Math.sin(a) * r0);
        c.lineTo(BIN.x + Math.cos(a) * r1, BIN.y - 6 + Math.sin(a) * r1);
        c.stroke();
      }
      c.restore();
    }
  }
}
// ---- the videos Claude makes: they fly out of the screen and pin themselves on the wall ----
const SLOTS = Array.from({ length: 8 }, (_, i) => ({ x: 1205 + (i % 4) * 96, y: 300 + Math.floor(i / 4) * 132 }));
function gallery(c: Ctx, t: number, lit: Ctx) {
  const t0 = Wd(5, "بساز!") + 0.05;
  SLOTS.forEach((s, i) => {
    const ts = t0 + i * 0.09;
    const u = clamp((t - ts) / 0.75);
    if (u <= 0) return;
    const e = ease.inOut(u);
    const x = lerp(SC.x + 10, s.x, e), y = lerp(SC.y, s.y, e) - Math.sin(e * Math.PI) * 160;
    const w = lerp(14, 58, e), h = (w * 16) / 9;
    c.save();
    c.translate(x, y);
    c.rotate((1 - e) * (i % 2 ? 0.6 : -0.6) + (u >= 1 ? Math.sin(i * 3.1) * 0.05 : 0));
    c.fillStyle = "#f5f2ea";
    c.fillRect(-w / 2 - 2.5, -h / 2 - 2.5, w + 5, h + 5);
    c.drawImage(snap(i % 9), -w / 2, -h / 2, w, h);
    if (u >= 1) {
      c.fillStyle = "#d94f3a";
      c.beginPath();
      c.arc(0, -h / 2 - 1, 3.2, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
    glow(lit, x, y, w, "#ffffff", 0.5 * (1 - u * 0.6));
  });
}
// ---- Claude's card (screen space) ----
function card(c: Ctx, t: number, cam: Cam) {
  const tIn = Wd(5, "کلاد") - 0.3, tType0 = Wd(5, "برو") - 0.05, tSend = Wd(5, "بساز!");
  const tOut = Wd(5, "و", 1) + 0.05;
  // (outBack(0) is not exactly 0 in floating point — gate on time, or a 12% card sits on the screen from the start)
  if (t <= tIn) return;
  const inK = ease.outBack(clamp((t - tIn) / 0.5));
  const outK = k(t, tOut, tOut + 0.35, ease.in);
  if (outK >= 1) return;
  const [sx, sy] = toScreen(cam, SC.x, SC.y);
  const cx = lerp(sx, 540, inK), cy = lerp(sy, 600, inK) - outK * 80;
  const s = lerp(0.12, 1, inK) * (1 - 0.15 * outK);
  const Wc = 860, Hc = 470;
  c.save();
  c.globalAlpha = 1 - outK;
  c.translate(cx, cy);
  c.scale(s, s);
  // frosted glass: what is behind, blurred
  const L = layer("d2-frost", 0.5);
  L.save();
  L.setTransform(1, 0, 0, 1, 0, 0);
  L.filter = `blur(${(14 * scale() * 0.5).toFixed(1)}px)`;
  L.drawImage(c.canvas, 0, 0, L.canvas.width, L.canvas.height);
  L.restore();
  c.save();
  c.beginPath();
  c.roundRect(-Wc / 2, -Hc / 2, Wc, Hc, 30);
  c.clip();
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = 1 - outK;
  c.drawImage(L.canvas, 0, 0, c.canvas.width, c.canvas.height);
  c.restore();
  c.fillStyle = rgba("#1d1c1a", 0.84);
  c.fillRect(-Wc / 2, -Hc / 2, Wc, Hc);
  c.restore();
  c.strokeStyle = rgba("#ffffff", 0.16);
  c.lineWidth = 2;
  c.beginPath();
  c.roundRect(-Wc / 2, -Hc / 2, Wc, Hc, 30);
  c.stroke();
  // header: the mark + Claude
  c.save();
  c.translate(-Wc / 2 + 52, -Hc / 2 + 58);
  c.scale(1.7, 1.7);
  c.translate(-12, -12);
  c.rotate(0);
  c.fillStyle = CLAUDE_ORANGE;
  c.fill(new Path2D(CLAUDE_PATH));
  c.restore();
  c.save();
  c.font = `400 38px LB`;
  c.fillStyle = "#f2efe8";
  c.textBaseline = "middle";
  c.fillText("Claude", -Wc / 2 + 92, -Hc / 2 + 60);
  c.restore();
  txt(c, "●  online", Wc / 2 - 40, -Hc / 2 + 60, { size: 20, weight: 500, ls: 0.1, align: "right", color: "#7bd88f", alpha: 0.9 });
  c.fillStyle = rgba("#ffffff", 0.08);
  c.fillRect(-Wc / 2 + 30, -Hc / 2 + 104, Wc - 60, 2);
  const sent = t >= tSend;
  const prompt = "make this content";
  const typed = prompt.slice(0, Math.floor(clamp((t - tType0) / (tSend - tType0 - 0.08)) * prompt.length));
  if (!sent) {
    // greeting + the input box with the prompt being typed
    c.save();
    c.font = `400 34px LB`;
    c.fillStyle = rgba("#f2efe8", 0.85);
    c.textBaseline = "middle";
    c.fillText("How can I help you today?", -Wc / 2 + 44, -40);
    c.restore();
    c.fillStyle = rgba("#ffffff", 0.07);
    c.beginPath();
    c.roundRect(-Wc / 2 + 30, Hc / 2 - 130, Wc - 60, 96, 22);
    c.fill();
    c.strokeStyle = rgba("#ffffff", 0.14);
    c.stroke();
    const caret = Math.floor(t * 2.6) % 2 === 0 ? "|" : "";
    txt(c, (typed || "") + caret, -Wc / 2 + 58, Hc / 2 - 82, { size: 32, weight: 500, ls: 0.01, color: "#ffffff" });
    // send button
    c.fillStyle = typed.length ? CLAUDE_ORANGE : rgba("#ffffff", 0.18);
    c.beginPath();
    c.roundRect(Wc / 2 - 104, Hc / 2 - 114, 64, 64, 16);
    c.fill();
    c.strokeStyle = "#ffffff";
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(Wc / 2 - 72, Hc / 2 - 64);
    c.lineTo(Wc / 2 - 72, Hc / 2 - 100);
    c.moveTo(Wc / 2 - 86, Hc / 2 - 86);
    c.lineTo(Wc / 2 - 72, Hc / 2 - 100);
    c.lineTo(Wc / 2 - 58, Hc / 2 - 86);
    c.stroke();
  } else {
    // the message, and Claude at work
    const u = t - tSend;
    c.fillStyle = rgba("#ffffff", 0.1);
    c.beginPath();
    c.roundRect(Wc / 2 - 380, -Hc / 2 + 132, 340, 72, 20);
    c.fill();
    txt(c, prompt, Wc / 2 - 60, -Hc / 2 + 168, { size: 30, weight: 500, align: "right", color: "#ffffff" });
    c.save();
    c.translate(-Wc / 2 + 64, -Hc / 2 + 270);
    c.rotate(u * 3);
    c.scale(1.3, 1.3);
    c.translate(-12, -12);
    c.fillStyle = CLAUDE_ORANGE;
    c.fill(new Path2D(CLAUDE_PATH));
    c.restore();
    c.save();
    c.font = `400 30px LB`;
    c.fillStyle = "#f2efe8";
    c.textBaseline = "middle";
    c.fillText("Creating your videos" + ".".repeat(1 + (Math.floor(u * 6) % 3)), -Wc / 2 + 110, -Hc / 2 + 270);
    c.restore();
    c.fillStyle = rgba("#ffffff", 0.1);
    c.fillRect(-Wc / 2 + 110, -Hc / 2 + 320, Wc - 180, 8);
    c.fillStyle = CLAUDE_ORANGE;
    c.fillRect(-Wc / 2 + 110, -Hc / 2 + 320, (Wc - 180) * clamp(u / 0.55), 8);
    for (let i = 0; i < 6; i++) {
      const p = ease.outBack(clamp((u - 0.08 - i * 0.05) / 0.25));
      if (p <= 0) continue;
      const tw = 82, th = (tw * 16) / 9 * 0.62;
      c.save();
      c.translate(-Wc / 2 + 150 + i * 112, Hc / 2 - 70);
      c.scale(p, p);
      c.drawImage(snap(i), -tw / 2, -th / 2, tw, th);
      c.strokeStyle = rgba("#ffffff", 0.3);
      c.strokeRect(-tw / 2, -th / 2, tw, th);
      c.restore();
    }
  }
  c.restore();
}
export function seqD2(c: Ctx, t: number) {
  const cam = camAt(t);
  const on = t >= Wd(5, "باز") ? 1 : 0;
  c.fillStyle = "#000";
  c.fillRect(0, 0, W, H);
  const lit = layer("d2-lit", 0.5);
  lit.save();
  matchTransform(lit, c);
  lit.translate(540 - cam.x * cam.z, 960 - cam.y * cam.z);
  lit.scale(cam.z, cam.z);
  room(c, t, cam, lit, on);
  c.save();
  c.translate(540 - cam.x * cam.z, 960 - cam.y * cam.z);
  c.scale(cam.z, cam.z);
  gallery(c, t, lit);
  // the stickman, with a soft contact shadow
  const S = stickAt(t);
  if (!S.pelvis) {
    c.save();
    c.fillStyle = rgba("#000000", 0.35);
    c.filter = blur(3 * cam.z);
    c.beginPath();
    c.ellipse(S.x, S.y + 1, H_STICK * 0.22, H_STICK * 0.04, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
  stickman(c, { x: S.x, y: S.y, h: H_STICK, face: S.face, pose: S.pose, t, pelvis: S.pelvis, smile: S.smile, look: S.look }, { color: "#f4f1ea", width: 3.4, glow: 8 });
  stickman(lit, { x: S.x, y: S.y, h: H_STICK, face: S.face, pose: S.pose, t, pelvis: S.pelvis, smile: S.smile, look: S.look }, { color: "#ffffff", width: 5 });
  doodles(c, t, lit);
  c.restore();
  lit.restore();
  bloom(c, lit, 0.75, 26);
  card(c, t, cam);
  vignette(c, 0.45, "#000000");
  grain(c, t, 0.16);
  void paint;
  void hash;
  void kf;
  void BEATS;
}
