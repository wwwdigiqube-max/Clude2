// Lines 30–33. «هیچ‌وقت به عیسی نمی‌گه فرشته‌ی خداوند»: the name is struck through and falls away →
// «فقط یه فرشته؟» a row of messengers; the letter to the Hebrews: he is above the angels →
// finale: God become human, to make heaven and earth one again: the two circles of the opening return,
// slide into one, and a garden grows inside it under the light.
import { applyCam, bloom, Cam, Ctx, H, layer, W } from "../lib/canvas";
import { glow, grain, motes, painterly, sparkle, sparkles, vignette } from "../lib/fx";
import { lightBeing } from "../lib/light";
import { clamp, ease, k, lerp, mixHex, rgba, rng, ss, TAU, win } from "../lib/math";
import { arcPts, drawStrokes, linePts, Stroke } from "../lib/shape";
import { title, titleWidth } from "../lib/text";
import { bokeh, CloudPal, clouds, godRays, nebula, ridge, starsDeep } from "../lib/depth";
const FIN_CL: CloudPal = { shade: "#c88a9a", mid: "#ffd8c0", lit: "#fffaf2", gamma: 0.9 };
import { E, S, TOTAL, W as Wd } from "../cues";

/** «فرشته‌ی خداوند» struck through, then falling away (line 30) */
export function strikeName(c: Ctx, t: number, x: number, y: number) {
  const tin = Wd(30, "«فرشته‌ی") - 0.1, ts = Wd(30, "خداوند».") + 0.25, tf = S(31) + 0.1;
  if (t < tin) return;
  const fall = ease.in(clamp((t - tf) / 1.1));
  c.save();
  c.translate(x, y + fall * 520);
  c.rotate(-0.25 * fall);
  const segs = [{ s: "فرشته‌ی", f: "MorabbaLight" }, { s: "خداوند", f: "MorabbaHeavy" }];
  title(c, segs, 0, 0, { size: 62, k: k(t, tin, tin + 0.8), shade: 0.3, alpha: 1 - fall });
  const w = titleWidth(segs, 62);
  const p = ease.inOut(clamp((t - ts) / 0.5));
  if (p > 0) {
    c.strokeStyle = "#c9a8ff";
    c.lineWidth = 6;
    c.lineCap = "round";
    c.shadowColor = "#c9a8ff";
    c.shadowBlur = 10;
    c.globalAlpha = 1 - fall;
    c.beginPath();
    c.moveTo(w / 2 + 16, 4);
    c.lineTo(w / 2 + 16 - (w + 32) * p, 4 - 6 * p);
    c.stroke();
  }
  c.restore();
}

// line-art messengers (the same little figure as in the opening), bowing toward the one above them
const MSG: Stroke[] = [
  { pts: arcPts(0, -66, 9, -Math.PI / 2, Math.PI * 1.5, 30), t0: 0, t1: 0.6 },
  { pts: linePts(-9, -54, -15, -38, -20, 4, -26, 60, 26, 60, 20, 4, 15, -38, 9, -54), t0: 0.2, t1: 1.3 },
  { pts: linePts(-15, -38, -34, -10, -40, 14), t0: 0.7, t1: 1.3 },
  { pts: linePts(15, -38, 34, -10, 40, 14), t0: 0.7, t1: 1.3 },
];
export function angelsRow(c: Ctx, t: number) {
  const tin = Wd(32, "فرشته‌ست.") - 0.6;
  const a = ss(tin, tin + 0.6, t) * (1 - ss(E(32) + 0.5, E(32) + 1.4, t));
  if (a <= 0.002) return;
  const bow = k(t, Wd(32, "برتره.") - 0.6, Wd(32, "برتره.") + 0.6, ease.inOutSine);
  for (let i = 0; i < 7; i++) {
    const x = 960 + (i - 3) * 190, y = 880;
    c.save();
    c.translate(x, y + 60);
    c.rotate(bow * 0.35 * (i < 3 ? 1 : i > 3 ? -1 : 0));
    c.translate(0, -60);
    c.scale(0.9, 0.9);
    drawStrokes(c, MSG, t - tin - i * 0.08, { glow: 10, alpha: a * (i === 3 ? 0 : 1), width: 3 });
    if (i !== 3) sparkle(c, 0, -104, 9, a * ss(tin + 0.6, tin + 1.2, t) * (0.6 + 0.4 * Math.sin(t * 2.5 + i)), "#ffffff", 0);
    c.restore();
  }
}

// ---------- finale ----------
const R0 = 300;
type Tree = { x: number; base: number; h: number; r: number; d: number; c: string };
let TREES: Tree[] | null = null;
function trees() {
  const r = rng(330);
  const greens = ["#2f7a52", "#3f9a5e", "#4aa868", "#2a6a5a"];
  TREES = [];
  for (let i = 0; i < 11; i++) {
    const x = -R0 * 0.9 + (i / 10) * R0 * 1.8 + (r() - 0.5) * 30;
    if (Math.abs(x) < 80) continue; // the centre stays open for the figure
    const far = i % 2 === 0;
    TREES.push({ x, base: far ? 92 : 150 + r() * 26, h: far ? 64 + r() * 26 : 110 + r() * 50, r: far ? 24 + r() * 8 : 38 + r() * 14, d: Math.abs(x) / R0, c: greens[Math.floor(r() * greens.length)] });
  }
  TREES.sort((a, b) => a.base - b.base);
}
/** a soft band of hills across the circle (local x from centre) */
function hills(c: Ctx, y0: number, amp: number, f: number, ph: number, col: string, a: number) {
  c.globalAlpha = a;
  c.fillStyle = col;
  c.beginPath();
  c.moveTo(960 - R0 - 10, 540 + R0 + 10);
  for (let x = -R0 - 10; x <= R0 + 10; x += 12) c.lineTo(960 + x, 540 + y0 + Math.sin(x * f + ph) * amp);
  c.lineTo(960 + R0 + 10, 540 + R0 + 10);
  c.closePath();
  c.fill();
  c.globalAlpha = 1;
}
function finalCam(t: number): Cam {
  return { x: 960, y: 540, z: 1 + 0.08 * ss(Wd(33, "دوباره") - 1, TOTAL, t) };
}
export function drawFinal(c: Ctx, t: number) {
  if (!TREES) trees();
  const cam = finalCam(t);
  const tC = Wd(33, "اینکه") - 0.3, tJoin = Wd(33, "یک") - 0.2, tOne = Wd(33, "دوباره") - 0.1;
  const grow = k(t, tOne, tOne + 3.2, ease.out);
  painterly(c, t, mixHex("#1c1026", "#2c1c48", grow), mixHex("#120a19", "#2a1a30", grow), [
    { x: 960, y: 540, r: 760, c: mixHex("#2a173b", "#6a4a9a", grow), a: 0.8 },
    { x: 960, y: 300, r: 500, c: "#ffd9a0", a: 0.25 * grow },
  ], 331, 0.5);
  // space around the circles: nebula, deep stars, soft light drifting in front
  nebula(c, t, ["#4a2a6a", "#7a3f6e", mixHex("#c9a8ff", "#ffe0b0", grow)], 0.28 + 0.12 * grow, 337, 0.8);
  starsDeep(c, t, 220, 338, 0.75, Math.sin(t * 0.04) * 40, Math.cos(t * 0.03) * 20);
  bokeh(c, t, { n: 10, seed: 339, color: mixHex("#c9b0ff", "#ffe0b0", grow), alpha: 0.12, size: 70, rise: 5 });
  const lit = layer("final-lit", 0.5);
  c.save();
  applyCam(c, cam);
  // the two realms: apart → sliding together → one circle
  const d = lerp(lerp(R0 * 1.05, R0 * 0.62, k(t, tJoin, tJoin + 1.6, ease.inOut)), 0, k(t, tOne, tOne + 1.2, ease.inOut));
  const draw = k(t, tC, tC + 1.2);
  const ring: Stroke[] = [
    { pts: arcPts(0, 0, R0, -Math.PI / 2, Math.PI / 2, 120), t0: 0, t1: 1 },
    { pts: arcPts(0, 0, R0, -Math.PI / 2, -Math.PI * 1.5, 120), t0: 0, t1: 1 },
  ];
  // inside the united circle: heaven's light above, a garden growing below
  if (grow > 0.001) {
    c.save();
    c.beginPath();
    c.arc(960, 540, R0, 0, TAU);
    c.clip();
    const sky = c.createLinearGradient(0, 540 - R0, 0, 540 + R0);
    sky.addColorStop(0, "#b9a8ff");
    sky.addColorStop(0.45, "#ffd9b0");
    sky.addColorStop(1, "#ffb08a");
    c.globalAlpha = grow;
    c.fillStyle = sky;
    c.fillRect(960 - R0, 540 - R0, R0 * 2, R0 * 2);
    c.globalAlpha = 1;
    // real clouds drifting in the garden's sky, heaven's light pouring down through them
    clouds(c, t, [
      { name: "cu3", x: 960 - 150, y: 540 - R0 * 0.62, w: 520, sp: 6, a: 0.85 }, { name: "cu1", x: 960 + 190, y: 540 - R0 * 0.75, w: 480, flip: true, sp: 5, a: 0.8 },
      { name: "field", x: 960, y: 540 - R0 * 0.18, w: 900, sp: 4, a: 0.6, crop: [0, 0.05, 1, 0.6] },
    ], FIN_CL, grow, [960 - R0 - 500, 960 + R0 + 500]);
    c.save();
    c.globalCompositeOperation = "screen";
    glow(c, 960, 540 - R0 * 0.55, R0 * 0.95, "#fff6e0", 0.7 * grow);
    c.restore();
    godRays(c, t, 960, 540 - R0 * 0.95, { n: 14, len: R0 * 2.2, spread: 1.4, dir: Math.PI / 2, color: "#fff4dc", alpha: 0.25 * grow, width: 0.1, spin: 0, seed: 341, soft: 8 });
    // a far hazy range on the horizon (depth)
    c.globalAlpha = grow;
    ridge(c, { y0: 540 + 70, amp: 60, freq: 0.006, seed: 342, color: "#c9a0b8", haze: "#ffe8d8", hazeA: 0.6, sharp: 0.6, x0: 960 - R0 - 20, x1: 960 + R0 + 20, step: 6, bottom: 540 + R0 + 20 });
    c.globalAlpha = 1;
    // birds crossing the garden sky
    c.strokeStyle = rgba("#5a3a4a", 0.7 * grow);
    c.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const bx = 960 - R0 + (((t * (28 + i * 6) + i * 140) % (R0 * 2 + 100))) - 50, by = 540 - R0 * 0.35 - i * 18 + Math.sin(t * 0.8 + i) * 8;
      const fl = Math.sin(t * 7 + i * 2) * 5;
      c.beginPath();
      c.moveTo(bx - 9, by - fl);
      c.quadraticCurveTo(bx - 4, by - 3, bx, by);
      c.quadraticCurveTo(bx + 4, by - 3, bx + 9, by - fl);
      c.stroke();
    }
    // the land rises in three soft bands
    const rise = (1 - ease.out(grow)) * 180;
    hills(c, 70 + rise, 16, 0.02, 0.5, "#9fd0b0", grow);
    hills(c, 128 + rise * 1.3, 22, 0.015, 1.7, "#62ad7c", grow);
    // a stream winds down from the hills
    c.save();
    c.globalAlpha = grow;
    c.strokeStyle = "#a8ecff";
    c.lineCap = "round";
    for (const [w, a] of [[26, 0.5], [12, 0.9]] as const) {
      c.lineWidth = w;
      c.globalAlpha = grow * a;
      c.beginPath();
      c.moveTo(960 - 30, 540 + R0 + 20);
      c.bezierCurveTo(960 + 70, 540 + 230 + rise, 960 - 90, 540 + 170 + rise, 960 + 6, 540 + 120 + rise * 1.3);
      c.stroke();
    }
    c.restore();
    // trees grow up from the ground, the far ones first
    for (const tr of TREES!) {
      const g = ease.outBack(clamp((grow * 1.6 - tr.d * 0.5 - (tr.base > 120 ? 0.25 : 0)) / 0.6), 1.3);
      if (g <= 0) continue;
      const bx = 960 + tr.x, by = 540 + tr.base + rise * (tr.base > 120 ? 1.6 : 1.0);
      const sw = Math.sin(t * 0.9 + tr.x) * 2;
      c.save();
      c.translate(bx, by);
      c.scale(g, g);
      c.fillStyle = "#3a2a2a";
      c.fillRect(-4, -tr.h * 0.55, 8, tr.h * 0.55);
      c.fillStyle = tr.c;
      for (const [ox, oy, rr] of [[0, -tr.h * 0.75, 1], [-tr.r * 0.6, -tr.h * 0.6, 0.75], [tr.r * 0.6, -tr.h * 0.62, 0.7]] as const) {
        c.beginPath();
        c.arc(ox + sw, oy, tr.r * rr, 0, TAU);
        c.fill();
      }
      c.fillStyle = rgba("#e8ffc0", 0.28);
      c.beginPath();
      c.arc(-tr.r * 0.2 + sw, -tr.h * 0.75 - tr.r * 0.35, tr.r * 0.45, 0, TAU);
      c.fill();
      c.restore();
    }
    hills(c, 205 + rise * 1.6, 14, 0.012, 2.6, "#3f8a5e", grow);
    // flowers in the near meadow
    const fr = rng(333);
    for (let i = 0; i < 60; i++) {
      const x = 960 + (fr() - 0.5) * R0 * 1.8, y = 540 + 215 + fr() * 70 + rise * 1.6;
      const g = clamp((grow - 0.35 - fr() * 0.35) / 0.25);
      if (g <= 0) continue;
      c.fillStyle = ["#ff9ec8", "#ffe08a", "#ffffff", "#ffb46a", "#c9a8ff"][i % 5];
      c.beginPath();
      c.arc(x, y, (2.5 + fr() * 4) * g, 0, TAU);
      c.fill();
    }
    // big leaves framing the bottom corners, swaying
    for (const sd of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const g = clamp((grow - 0.2 - i * 0.1) / 0.4);
        if (g <= 0) continue;
        c.save();
        c.translate(960 + sd * (R0 * 0.75 - i * 40), 540 + R0 * 0.95);
        c.rotate(sd * (-0.6 - i * 0.35) + Math.sin(t * 0.8 + i) * 0.05);
        c.scale(g, g);
        c.fillStyle = ["#24604a", "#2f7a52", "#3a8f5e"][i];
        c.beginPath();
        c.moveTo(0, 0);
        c.quadraticCurveTo(-42, -110, 0, -190);
        c.quadraticCurveTo(42, -110, 0, 0);
        c.fill();
        c.strokeStyle = rgba("#c8ffb0", 0.3);
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(0, -6);
        c.lineTo(0, -170);
        c.stroke();
        c.restore();
      }
    }
    c.restore();
  }
  // the figure of light standing where heaven and earth meet (then in the united circle)
  lightBeing(c, lit, { x: 960, y: 540 + 150, h: 320, t, k: k(t, Wd(33, "خدایی") - 0.6, Wd(33, "خدایی") + 1.0), warm: 0.6, rays: 1.2, aura: 0.7, seed: 44 });
  // line art circles
  c.save();
  c.translate(960, 540 - d);
  drawStrokes(c, ring, draw, { glow: 14, alpha: 0.95, width: 3 });
  c.restore();
  c.save();
  c.translate(960, 540 + d);
  drawStrokes(c, ring, draw, { glow: 14, alpha: 0.95, width: 3 });
  c.restore();
  if (d > 1) {
    // where they overlap, light
    c.save();
    c.globalCompositeOperation = "screen";
    glow(c, 960, 540, 140 * (1 - d / (R0 * 1.05)) + 20, "#fff2d8", 0.6 * draw);
    c.restore();
  }
  lit.save();
  applyCam(lit, cam);
  glow(lit, 960, 540 - R0 * 0.4, 240, "#ffffff", 0.6 * grow);
  lit.restore();
  sparkles(c, t, [960 - R0 * 1.4, 540 - R0 * 1.4, R0 * 2.8, R0 * 2.8], 22, 334, draw, "#ffffff", 10);
  c.restore();
  motes(c, t, { n: 36, color: "#fff2d0", alpha: 0.5 * grow, seed: 335, speed: 0.4, dust: true });
  bloom(c, lit, 1.1, 60);
  vignette(c, 0.5, "#0b0612");
  // texts
  title(c, [{ s: "آسمان", f: "MorabbaBold" }], 960 + R0 + 190, 540 - R0 * 0.8, { size: 52, k: k(t, Wd(33, "آسمان") - 0.1, Wd(33, "آسمان") + 0.6), out: k(t, tOne - 0.4, tOne + 0.3), shade: 0.3 });
  title(c, [{ s: "زمین", f: "MorabbaBold" }], 960 + R0 + 190, 540 + R0 * 0.8, { size: 52, k: k(t, Wd(33, "زمین") - 0.1, Wd(33, "زمین") + 0.6), out: k(t, tOne - 0.4, tOne + 0.3), shade: 0.3 });
  title(c, [{ s: "یک بار", f: "MorabbaLight" }, { s: "برای همیشه", f: "MorabbaHeavy" }], 960, 1000, { size: 54, k: k(t, Wd(33, "یک") - 0.1, Wd(33, "همیشه،") + 0.4), out: k(t, E(33) + 0.4, E(33) + 1.4), shade: 0.35 });
  // fade out
  const fo = k(t, TOTAL - 2.6, TOTAL - 0.4, ease.in);
  if (fo > 0.001) {
    c.save();
    c.globalAlpha = fo;
    c.fillStyle = "#000";
    c.fillRect(-10, -10, W + 20, H + 20);
    c.restore();
  }
  grain(c, t, 0.14 * (1 - fo));
}
export const _f = { win, sparkle, H };
