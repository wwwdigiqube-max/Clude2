// S6 · «اینقدر روی NFP کار کردم که هر مدل ویدئو یا انیمیشنی رو بتونه درست کنه» (31.45 → 36.2) — r8.
// a) an analog meter (the user's photo `img/gauge.png`): the needle climbs in steps on the beats to 5 while an
//    odometer of hours rolls up (all the work);  b) «هر مدل ویدئو یا انیمیشنی»: a wall of incandescent bulbs in
//    perspective lights up bulb by bulb (every bulb a style), shallow depth of field, then pulses and flares into G.
import { bloom, blur, Ctx, H, layer, matchTransform, scale, W } from "../../lib/canvas";
import { glow, grain, vignette } from "../../lib/fx";
import { txt } from "../../lib/hud";
import { clamp, ease, hash, k, lerp, rgba, rng, mixHex } from "../../lib/math";
import { project, rotX, rotY, V3 } from "../../lib/p3";
import { img } from "../../lib/img";
import { BEATS, Wd } from "../cues";

export const T_BULBS = 33.12;
// gauge photo geometry (1254×1254): needle pivot and the scale tick for every number
const G = { size: 1254, pivot: [628, 853] as [number, number], ticks: [[215, 545], [345, 468], [527, 383], [730, 383], [913, 455], [1040, 560]] as [number, number][] };
function tickAt(v: number): [number, number] {
  const i = Math.max(0, Math.min(4, Math.floor(v))), f = clamp(v - i);
  const a = G.ticks[i], b = G.ticks[i + 1];
  return [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
}
/** needle value with a damped spring after every step */
function needle(t: number) {
  const steps = BEATS.filter((b) => b >= Wd(6, "اینقدر") - 0.1 && b < T_BULBS).slice(0, 5);
  const vals = [0.9, 2.1, 3.2, 4.3, 5.0];
  let v = 0;
  steps.forEach((b, i) => {
    if (t >= b) {
      const u = t - b, prev = i ? vals[i - 1] : 0;
      v = vals[i] + (prev - vals[i]) * Math.exp(-u * 9) * Math.cos(u * 26);
    }
  });
  return v + 0.02 * Math.sin(t * 31) * clamp(v / 5);
}
function gaugeFallback(c: Ctx) {
  // only used if the photo is missing
  c.fillStyle = "#1a1612";
  c.fillRect(0, 0, G.size, G.size);
  const rg = c.createRadialGradient(628, 627, 300, 628, 627, 600);
  rg.addColorStop(0, "#c9a24d");
  rg.addColorStop(1, "#6b5122");
  c.fillStyle = rg;
  c.beginPath();
  c.arc(628, 627, 600, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#ece2c8";
  c.beginPath();
  c.arc(628, 627, 510, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "#111";
  c.lineWidth = 6;
  c.beginPath();
  G.ticks.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.stroke();
  G.ticks.forEach(([x, y], i) => txt(c, String(i), x, y - 70, { size: 90, weight: 700, align: "center", color: "#111" }));
}
function odometer(c: Ctx, x: number, y: number, value: number) {
  const digits = 5, w = 74, h = 104;
  c.save();
  c.fillStyle = "#0b0a09";
  c.beginPath();
  c.roundRect(x - (digits * w) / 2 - 14, y - h / 2 - 12, digits * w + 28, h + 24, 10);
  c.fill();
  c.strokeStyle = rgba("#c9a24d", 0.7);
  c.lineWidth = 3;
  c.stroke();
  for (let d = 0; d < digits; d++) {
    const place = Math.pow(10, digits - 1 - d);
    const raw = value / place;
    const digit = Math.floor(raw) % 10;
    // the units wheel rolls continuously, the others click over at the end
    const frac = d === digits - 1 ? raw - Math.floor(raw) : clamp(((value % place) / place - 0.92) / 0.08);
    const cx = x - (digits * w) / 2 + w * (d + 0.5);
    c.save();
    c.beginPath();
    c.rect(cx - w / 2 + 4, y - h / 2, w - 8, h);
    c.clip();
    const g = c.createLinearGradient(0, y - h / 2, 0, y + h / 2);
    g.addColorStop(0, "#1c1915");
    g.addColorStop(0.5, "#ede4cd");
    g.addColorStop(1, "#1c1915");
    c.fillStyle = g;
    c.fillRect(cx - w / 2 + 4, y - h / 2, w - 8, h);
    for (const [n, off] of [[digit, -frac], [(digit + 1) % 10, 1 - frac]] as const)
      txt(c, String(n), cx, y + off * h * 0.9, { size: 78, weight: 700, align: "center", color: "#16130f" });
    c.restore();
  }
  c.restore();
  txt(c, "HOURS ON THE ENGINE", x, y + h / 2 + 46, { size: 22, weight: 600, ls: 0.3, align: "center", color: "#d9c79a", alpha: 0.85 });
}
function seqGauge(c: Ctx, t: number) {
  const t0 = 31.45;
  const push = k(t, t0, T_BULBS, ease.inOutSine);
  const v = needle(t);
  c.fillStyle = "#080706";
  c.fillRect(0, 0, W, H);
  // the meter, filling the width (centre upper half), slow push-in, a kick on every step
  const kick = BEATS.filter((b) => b <= t && b >= t0).pop();
  const shake = kick ? Math.exp(-(t - kick) / 0.08) * 6 : 0;
  const s = (W / G.size) * (1.02 + 0.08 * push);
  const ox = 540 - G.size * s / 2 + (hash(Math.floor(t * 40)) - 0.5) * shake, oy = 760 - G.size * s / 2;
  c.save();
  c.translate(ox, oy);
  c.scale(s, s);
  const im = img("gauge");
  if (im) c.drawImage(im, 0, 0, G.size, G.size);
  else gaugeFallback(c);
  // warm light pooling from the top
  c.save();
  c.globalCompositeOperation = "soft-light";
  glow(c, 628, 300, 700, "#ffd9a0", 0.5);
  c.restore();
  // the needle: tapered black blade, its soft shadow on the dial, a brass cap over the pivot
  const [px, py] = G.pivot;
  const [tx, ty] = tickAt(v);
  const ang = Math.atan2(ty - py, tx - px), L = Math.hypot(tx - px, ty - py) * 0.97;
  for (const [dx, dy, col, a] of [[14, 18, "#000000", 0.28], [0, 0, "#0d0c0b", 1]] as const) {
    c.save();
    c.translate(px + dx, py + dy);
    c.rotate(ang);
    c.globalAlpha = a;
    if (a < 1) c.filter = blur(6 / s);
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(-70, -9);
    c.lineTo(L, -1.6);
    c.lineTo(L + 6, 0);
    c.lineTo(L, 1.6);
    c.lineTo(-70, 9);
    c.closePath();
    c.fill();
    c.restore();
  }
  const cap = c.createRadialGradient(px - 10, py - 12, 4, px, py, 34);
  cap.addColorStop(0, "#f2d79a");
  cap.addColorStop(1, "#5c4318");
  c.fillStyle = cap;
  c.beginPath();
  c.arc(px, py, 30, 0, Math.PI * 2);
  c.fill();
  c.restore();
  odometer(c, 540, 1530, 4380 * ease.inOut(clamp((t - Wd(6, "اینقدر") + 0.1) / (T_BULBS - Wd(6, "اینقدر") - 0.05))));
  vignette(c, 0.55, "#000000");
  grain(c, t, 0.2);
  const fi = 1 - k(t, t0, t0 + 0.12);
  if (fi > 0) {
    c.fillStyle = rgba("#ffffff", 0.6 * fi);
    c.fillRect(0, 0, W, H);
  }
}
// ---- the bulb wall ----
type Bulb = { p: V3; order: number; seed: number };
let BULBS: Bulb[] | null = null;
function bulbs() {
  const out: Bulb[] = [];
  const r = rng(44);
  for (let row = -9; row <= 9; row++)
    for (let col = -5; col <= 5; col++) {
      // the cascade runs diagonally from the near bottom corner
      const order = (col + 5) * 0.55 + (9 - row) * 0.7 + r() * 0.8;
      out.push({ p: [col * 140, row * 140, 0], order, seed: r() * 100 });
    }
  const mx = Math.max(...out.map((b) => b.order));
  out.forEach((b) => (b.order /= mx));
  BULBS = out;
}
function seqBulbs(c: Ctx, t: number) {
  if (!BULBS) bulbs();
  const t0 = T_BULBS;
  const on0 = Wd(6, "هر") - 0.15, on1 = Wd(6, "انیمیشنی") + 0.25;
  const pulseT = BEATS.filter((b) => b >= Wd(6, "بتونه") - 0.15 && b <= 36.2).pop();
  const pulse = pulseT !== undefined ? Math.exp(-(t - pulseT) / 0.2) : 0;
  const dive = k(t, 35.62, 36.2, ease.in);
  const cam = { x: lerp(-60, 0, k(t, t0, 36.2)), y: -40, z: lerp(-1500, -1250, k(t, t0, 36.2)) * (1 - 0.55 * dive), yaw: 0.0, pitch: 0, f: 1450 };
  c.fillStyle = "#040302";
  c.fillRect(0, 0, W, H);
  const lit = layer("b6-lit", 0.5);
  lit.save();
  matchTransform(lit, c);
  const far = layer("b6-far", 0.5);
  far.save();
  matchTransform(far, c);
  const rot = (p: V3): V3 => rotX(rotY(p, -0.62), 0.16);
  const list = BULBS!.map((b) => ({ b, q: rot(b.p) })).sort((a, b) => b.q[2] - a.q[2]);
  const drawBulb = (b: Bulb, q: V3, ctx: Ctx) => {
    const pr = project(q, cam);
    if (!pr) return;
    const [x, y, , sc] = pr;
    const r = 52 * sc;
    if (x < -r * 3 || x > W + r * 3 || y < -r * 3 || y > H + r * 3) return;
    const on = clamp((t - lerp(on0, on1, b.order)) / 0.06);
    const flick = on > 0 && on < 1 ? (hash(b.seed + Math.floor(t * 60)) > 0.4 ? 1 : 0.3) : 1;
    const chaseIn = k(t, on1, on1 + 0.35);
    const wave = Math.pow(0.5 + 0.5 * Math.cos((b.order * 7 - (t - on1) * 6) * Math.PI), 3);
    const level = on * flick * (0.9 + 0.1 * Math.sin(t * 7 + b.seed)) * lerp(1, 0.38 + 0.62 * wave, chaseIn) * (1 + 0.45 * pulse);
    // glass bulb: dark when off, a hot filament and an amber body when on
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
    const lv = Math.min(1, level);
    g.addColorStop(0, mixHex("#3a3530", "#fff3d6", lv));
    g.addColorStop(0.45, mixHex("#1d1a17", "#ffb347", lv * 0.9));
    g.addColorStop(1, mixHex("#0e0c0a", "#a8410f", lv * 0.85));
    ctx.save();
    ctx.globalAlpha = level > 0.05 ? 0.6 + 0.4 * Math.min(1, level) : 1;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    // socket ring + a glint
    ctx.strokeStyle = rgba("#000000", 0.6);
    ctx.lineWidth = Math.max(1, r * 0.08);
    ctx.stroke();
    ctx.fillStyle = rgba("#ffffff", 0.35);
    ctx.beginPath();
    ctx.ellipse(x - r * 0.35, y - r * 0.42, r * 0.18, r * 0.1, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (level > 0.05) {
      // the filament: a hot little coil in the middle of the glass
      ctx.save();
      ctx.strokeStyle = rgba("#fffbea", Math.min(1, 0.4 + 0.6 * level));
      ctx.lineWidth = Math.max(1, r * 0.07);
      ctx.beginPath();
      for (let s = 0; s <= 8; s++) {
        const u = s / 8, fx = x - r * 0.28 + u * r * 0.56, fy = y + r * 0.04 + Math.sin(u * Math.PI * 4) * r * 0.07;
        if (s === 0) ctx.moveTo(fx, fy);
        else ctx.lineTo(fx, fy);
      }
      ctx.stroke();
      ctx.restore();
      glow(lit, x, y, r * 1.55, "#ff9a3c", 0.5 * level);
      glow(lit, x, y, r * 0.55, "#fff1d0", 0.85 * Math.min(1, level));
    }
  };
  const depth = (q: V3) => project(q, cam)?.[2] ?? 0;
  // far rows into their own layer (soft, depth of field), then the near rows sharp on top
  for (const { b, q } of list) if (depth(q) > 1900) drawBulb(b, q, far);
  far.restore();
  c.save();
  c.filter = blur(7);
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.drawImage(far.canvas, 0, 0, c.canvas.width, c.canvas.height);
  c.restore();
  for (const { b, q } of list) if (depth(q) <= 1900) drawBulb(b, q, c);
  lit.restore();
  bloom(c, lit, 0.72 + 0.35 * pulse, 30);
  // the flare into the montage
  if (dive > 0) {
    c.fillStyle = rgba("#ffe6c0", Math.pow(dive, 2.2));
    c.fillRect(0, 0, W, H);
  }
  vignette(c, 0.5, "#000000");
  grain(c, t, 0.18);
  void scale;
}
export function seqS6(c: Ctx, t: number) {
  if (t < T_BULBS) return seqGauge(c, t);
  seqBulbs(c, t);
}
