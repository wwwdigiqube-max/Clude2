// Lines 26–27: «این کلمه انسان شد و در میان ما خیمه زد»: a drop of light falls from the night sky into a village
// of tents and flat-roofed houses; one small tent glows from inside → ἐσκήνωσεν «چادرش را برپا کرد» →
// people come out and gather around the light: the presence of the unseen God among people.
import { applyCam, bloom, Cam, Ctx, H, layer } from "../lib/canvas";
import { figure, figureFlat, mixPose, P, walk } from "../lib/figure";
import { glow, grain, motes, painterly, sparkle, sparkles, vignette } from "../lib/fx";
import { clamp, ease, k, lerp, mixHex, rgba, rng, ss, TAU } from "../lib/math";
import { castShadow, CloudPal, clouds, godRays, lightPool, mist, nebula, ridge, starsDeep } from "../lib/depth";
import { title } from "../lib/text";
import { E, S, W as Wd } from "../cues";

const TENT: [number, number] = [1010, 820];
const VNIGHT: CloudPal = { shade: "#0c1030", mid: "#2a3472", lit: "#b4c0ff", gamma: 1.1 };
const par = (cam: Cam, f: number): Cam => ({ x: 960 + (cam.x - 960) * f, y: 540 + (cam.y - 540) * f, z: 1 + (cam.z - 1) * f });
function villageCam(t: number): Cam {
  const down = k(t, Wd(26, "انسان") - 0.6, Wd(26, "زد».") + 0.2, ease.inOutSine);
  const close = k(t, Wd(27, "حضورِ") - 0.6, Wd(27, "آدم‌ها.") + 0.5, ease.inOutSine);
  return { x: lerp(960, 990, close), y: lerp(lerp(-300, 560, down), 660, close), z: lerp(lerp(0.95, 1.0, down), 1.25, close) };
}
type House = { x: number; y: number; w: number; h: number; tent: boolean; win: number };
let HOUSES: House[] | null = null;
function houses() {
  const r = rng(260);
  HOUSES = [];
  for (let i = 0; i < 26; i++) {
    const x = -60 + r() * 2040, y = 760 + r() * 120;
    if (Math.abs(x - TENT[0]) < 140 && y > 790) continue;
    HOUSES.push({ x, y, w: 90 + r() * 110, h: 64 + r() * 84, tent: r() < 0.45, win: r() });
  }
  HOUSES.sort((a, b) => a.y - b.y);
}
function drop(t: number) {
  const t0 = Wd(26, "انسان") - 0.2, t1 = Wd(26, "خیمه") + 0.15;
  const a = clamp((t - t0) / (t1 - t0));
  const e = ease.in(a);
  return { on: t > t0 && a < 1, x: lerp(1060, TENT[0], e) + Math.sin(a * 4) * 25, y: lerp(-520, TENT[1] - 40, e), t1 };
}
export function drawVillage(c: Ctx, t: number) {
  if (!HOUSES) houses();
  const cam = villageCam(t);
  const d = drop(t);
  const g0 = ease.out(clamp((t - d.t1) / 1.2)); // the tent lights up
  painterly(c, t, "#141d4a", "#3a3f7c", [{ x: 1200, y: 300, r: 760, c: "#3e4a9a", a: 0.6 }, { x: 400, y: 800, r: 600, c: "#262a5a", a: 0.7 }], 140, 0.5);
  const lit = layer("vil-lit", 0.5);
  // the night in depth: milky way, stars that slide past at different speeds as we come down, moonlit clouds
  c.save();
  c.translate(960, 400);
  c.rotate(0.35);
  c.translate(-960, -400);
  nebula(c, t, ["#3a4a9a", "#5a4aa0", "#dfe6ff"], 0.3, 141, 0.5, "screen", 0, -(cam.y - 560) * 0.1);
  c.restore();
  starsDeep(c, t, 280, 141, 0.95, 0, (cam.y - 560) * 0.6);
  c.save();
  applyCam(c, par(cam, 0.45));
  clouds(c, t, [
    { name: "cu3", x: 380, y: -80, w: 1100, a: 0.8, sp: 5 }, { name: "cu1", x: 1620, y: -160, w: 1100, a: 0.75, flip: true, sp: 4 },
    { name: "field", x: 960, y: 420, w: 2300, a: 0.5, sp: 3, crop: [0, 0.05, 1, 0.6] },
  ], VNIGHT, 1, [-1200, 3100]);
  c.restore();
  c.save();
  applyCam(c, cam);
  // the star of the night high above, with fine rays
  godRays(c, t, 1060, -560, { n: 12, len: 260, color: "#ffffff", alpha: 0.35, width: 0.05, spin: 0.02, seed: 141, soft: 3 });
  sparkle(c, 1060, -560, 30, 0.95, "#ffffff", 0);
  // far mountains (hazy) → nearer hills → the village; mist between them
  c.save();
  c.translate((cam.x - 960) * 0.3, (cam.y - 560) * 0.25);
  ridge(c, { y0: 700, amp: 200, freq: 0.0022, seed: 146, color: "#2c3672", haze: "#5a66b8", hazeA: 0.55, sharp: 0.8, rim: "#b8c2ff", rimA: 0.25, rimW: 1.5 });
  c.restore();
  mist(c, 690, 60, "#4a56a8", 0.35);
  c.save();
  c.globalCompositeOperation = "screen";
  glow(c, 600, 640, 700, "#8a96e0", 0.3);
  c.restore();
  ridge(c, { y0: 790, amp: 70, freq: 0.0018, seed: 147, color: "#232b5c", haze: "#3a4490", hazeA: 0.35, sharp: 0.2, rim: "#8a96e0", rimA: 0.3, rimW: 1.5 });
  for (const hs of HOUSES!) {
    c.fillStyle = mixHex("#2a2f5e", "#5a3a3a", g0 * clamp(1 - Math.abs(hs.x - TENT[0]) / 700));
    if (hs.tent) {
      c.beginPath();
      c.moveTo(hs.x - hs.w * 0.6, hs.y);
      c.lineTo(hs.x, hs.y - hs.h * 0.9);
      c.lineTo(hs.x + hs.w * 0.6, hs.y);
      c.closePath();
      c.fill();
    } else {
      c.fillRect(hs.x - hs.w / 2, hs.y - hs.h, hs.w, hs.h);
      if (hs.win > 0.4) {
        c.fillStyle = rgba("#ffbf73", 0.55 + 0.15 * Math.sin(t * 2 + hs.x));
        c.fillRect(hs.x - 6, hs.y - hs.h * 0.6, 12, 16);
      }
    }
  }
  // the falling light
  if (d.on) {
    glow(c, d.x, d.y, 90, "#ffffff", 0.8);
    c.fillStyle = "#ffffff";
    c.beginPath();
    c.ellipse(d.x, d.y, 12, 20, 0, 0, TAU);
    c.fill();
    sparkles(c, t, [d.x - 50, d.y - 260, 100, 240], 7, 142, 0.9, "#ffffff", 8);
  }
  // the small tent that receives it
  c.fillStyle = mixHex("#2a2440", "#6a4038", g0);
  c.beginPath();
  c.moveTo(TENT[0] - 90, TENT[1]);
  c.lineTo(TENT[0], TENT[1] - 110);
  c.lineTo(TENT[0] + 90, TENT[1]);
  c.closePath();
  c.fill();
  c.fillStyle = rgba("#ffe0a8", g0);
  c.beginPath();
  c.moveTo(TENT[0] - 22, TENT[1]);
  c.lineTo(TENT[0], TENT[1] - 62);
  c.lineTo(TENT[0] + 22, TENT[1]);
  c.closePath();
  c.fill();
  c.save();
  c.globalCompositeOperation = "screen";
  glow(c, TENT[0], TENT[1] - 40, 300 * g0 + 1, "#ffcf8a", 0.65 * g0);
  c.restore();
  lightPool(c, TENT[0], TENT[1] + 10, 620 * g0 + 1, 90, "#ffcf8a", 0.5 * g0);
  // people come out of the houses and gather, looking at the light
  const gather = k(t, Wd(27, "حضورِ") - 0.5, E(27) + 1.0, ease.inOut);
  if (gather > 0) {
    const r = rng(143);
    for (let i = 0; i < 9; i++) {
      const side = i % 2 ? 1 : -1;
      const x0 = TENT[0] + side * (420 + r() * 300), x1 = TENT[0] + side * (120 + r() * 140);
      const x = lerp(x0, x1, gather), y = TENT[1] + 10 + r() * 40;
      const moving = gather > 0.02 && gather < 0.98;
      const pose = moving ? walk(t * 0.9 + r() * 3, 0.8) : P({ head: -0.15, arF: 0.4, elF: 0.6 });
      const f = { x, y, h: 120 + r() * 30, face: (side > 0 ? -1 : 1) as 1 | -1, pose, t, head: (r() > 0.5 ? "veil" : "wrap") as "veil" | "wrap", seed: 150 + i };
      castShadow(c, f, TENT[0], 0.9, 0.45 * ss(0, 0.15, gather) * g0, "#0a0814", 0.18, 4);
      if (i < 4) figure(c, f, { base: "#2a2236", base2: "#16121e", rim: "#ffcf8a", rimW: 3, light: [-side, -0.3], alpha: ss(0, 0.15, gather) });
      else {
        c.globalAlpha = ss(0, 0.15, gather);
        figureFlat(c, f, "#1c1828");
        c.globalAlpha = 1;
      }
    }
  }
  c.restore();
  lit.save();
  applyCam(lit, cam);
  glow(lit, TENT[0], TENT[1] - 40, 200, "#ffd9a0", g0);
  lit.restore();
  motes(c, t, { n: 24, color: "#ffe2b0", alpha: 0.35 * g0, seed: 144, speed: 0.4, dust: true });
  bloom(c, lit, 1, 50);
  vignette(c, 0.5, "#05060f");
  // labels
  const out = k(t, S(27) - 0.2, S(27) + 0.5);
  title(c, [{ s: "«در میانِ ما", f: "MorabbaLight" }, { s: "خیمه زد»", f: "MorabbaHeavy" }], 960, 140, { size: 62, k: k(t, Wd(26, "«در") - 0.1, Wd(26, "زد».") + 0.4), out, shade: 0.4 });
  title(c, [{ s: "ἐσκήνωσεν", f: "serif" }], 960, 225, { size: 44, k: k(t, Wd(26, "یونانی‌ش") - 0.2, Wd(26, "یونانی‌ش") + 0.6), out, glow: 12 });
  title(c, [{ s: "=", f: "MorabbaLight" }, { s: "چادرش را برپا کرد", f: "MorabbaBold" }], 960, 295, { size: 40, k: k(t, Wd(26, "چادرش") - 0.2, Wd(26, "کرد.") + 0.3), out, glow: 12, shade: 0.35 });
  title(c, [{ s: "حضورِ خدای", f: "MorabbaLight" }, { s: "نادیدنی", f: "MorabbaHeavy" }, { s: "، میانِ آدم‌ها", f: "MorabbaLight" }], 960, 140, { size: 54, k: k(t, Wd(27, "حضورِ") - 0.1, Wd(27, "آدم‌ها.") + 0.4), out: k(t, E(27) + 0.6, E(27) + 1.3), shade: 0.4 });
  grain(c, t, 0.15);
}
export const _v = { H, mixPose };
