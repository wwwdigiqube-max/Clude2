// Line 28: four walk up a mountain at dusk → at the top the one in front is transfigured: light gathers, a white
// flash, then he stands shining like the sun, robe white as light, translucent colour flames rising around him;
// the three fall to the ground.
import { applyCam, bloom, blur, Cam, Ctx, H, layer, paint, W } from "../lib/canvas";
import { figure, mixPose, P, Pose, walk } from "../lib/figure";
import { glow, grain, motes, painterly, sparkles, stars, vignette } from "../lib/fx";
import { clamp, ease, k, lerp, mixHex, rgba, rng, TAU, win } from "../lib/math";
import { title } from "../lib/text";
import { castShadow, CloudPal, clouds, godRays, lightPool, mist, ridge } from "../lib/depth";
import { haloRings } from "../lib/light";
const MD_NEAR: CloudPal = { shade: "#3a2648", mid: "#a0607a", lit: "#ffc49a", gamma: 0.95 };
const MD_FAR: CloudPal = { shade: "#5a3a5a", mid: "#b07088", lit: "#ffcca8", gamma: 1.1 };
const MS_NEAR: CloudPal = { shade: "#1a1238", mid: "#5a4a98", lit: "#e0d6ff", gamma: 1.05 };
const MS_FAR: CloudPal = { shade: "#221a48", mid: "#5e50a0", lit: "#c8bcf0", gamma: 1.15 };
const par = (cam: Cam, f: number): Cam => ({ x: 960 + (cam.x - 960) * f, y: 540 + (cam.y - 540) * f, z: 1 + (cam.z - 1) * f });
import { E, S, W as Wd } from "../cues";

/** the slope: from bottom-left up to a summit plateau at the right */
const slopeY = (x: number) => (x < 1180 ? 1040 - (x - 200) * 0.36 : 687 + Math.sin((x - 1180) * 0.01) * 4);
function mountCam(t: number): Cam {
  const top = k(t, Wd(28, "اونجا") - 1.0, Wd(28, "هویتِ") + 0.5, ease.inOutSine);
  const tr = k(t, Wd(28, "صورتش") - 0.4, Wd(28, "نور.") + 0.6, ease.inOutSine);
  return { x: lerp(lerp(860, 1180, top), 1240, tr), y: lerp(lerp(700, 560, top), 520, tr), z: lerp(lerp(1.0, 1.15, top), 1.32, tr) };
}
function walkers(t: number) {
  const t0 = Wd(28, "عیسی") - 0.8, t1 = Wd(28, "اونجا") + 0.4;
  const a = clamp((t - t0) / (t1 - t0));
  const lead = lerp(420, 1330, ease.inOutSine(a));
  return { moving: a > 0 && a < 1, xs: [lead, lead - 190, lead - 330, lead - 460], a };
}
const BOW: Pose = P({ hipY: 0.24, torso: 1.05, head: 0.35, thF: 0.75, shF: -1.45, thB: 0.6, shB: -1.5, arF: 0.9, elF: 0.4, arB: 0.8, elB: 0.4 });
const OPEN: Pose = P({ torso: -0.03, head: -0.12, arF: 0.75, elF: 0.15, arB: -0.6, elB: -0.1 });

export function drawMount(c: Ctx, t: number) {
  const cam = mountCam(t);
  const build = k(t, Wd(28, "هویتِ") - 0.2, Wd(28, "آشکار") + 0.3, ease.in);
  const shine = k(t, Wd(28, "آشکار") + 0.2, Wd(28, "صورتش") + 0.4);
  const white = k(t, Wd(28, "لباسش،") - 0.2, Wd(28, "نور.") + 0.2);
  painterly(c, t, mixHex("#3b2a5a", "#1e1640", shine), mixHex("#e8987a", "#5a3f78", shine), [
    { x: 1300, y: 600, r: 800, c: mixHex("#ffb07a", "#8a6ab0", shine), a: 0.7 },
    { x: 300, y: 200, r: 600, c: "#4a3a7a", a: 0.6 },
  ], 160, 0.5);
  stars(c, t, [0, 0, W, 500], 60, 161, 0.4 * (1 - shine));
  // dusk clouds in two depths; they darken and turn violet when he shines
  c.save();
  applyCam(c, par(cam, 0.3));
  const CF = [{ name: "field" as const, x: 900, y: 520, w: 2300, a: 0.7, sp: 3, crop: [0, 0.05, 1, 0.62] as [number, number, number, number] }];
  clouds(c, t, CF, MD_FAR, 1 - shine, [-1200, 3100]);
  clouds(c, t, CF, MS_FAR, shine, [-1200, 3100]);
  c.restore();
  c.save();
  applyCam(c, par(cam, 0.55));
  const CN = [{ name: "cu3" as const, x: 300, y: 200, w: 1100, sp: 5 }, { name: "cu5" as const, x: 1650, y: 160, w: 1150, flip: true, sp: 4 }];
  clouds(c, t, CN, MD_NEAR, 0.95 * (1 - shine), [-1100, 3000]);
  clouds(c, t, CN, MS_NEAR, 0.95 * shine, [-1100, 3000]);
  c.restore();
  const lit = layer("mount-lit", 0.5);
  c.save();
  applyCam(c, cam);
  // the farthest ranges, hazy (aerial perspective)
  c.save();
  c.translate((cam.x - 960) * 0.35, (cam.y - 540) * 0.2);
  ridge(c, { y0: 700, amp: 240, freq: 0.0024, seed: 165, color: mixHex("#8a5a7a", "#4a3a78", shine), haze: mixHex("#ffb08a", "#9a7ad0", shine), hazeA: 0.5, sharp: 0.8, rim: "#ffd8b8", rimA: 0.25, rimW: 1.5 });
  c.restore();
  mist(c, 720, 70, mixHex("#e8a08a", "#7a62b0", shine), 0.35);
  // distant ranges
  c.fillStyle = mixHex("#6a4a72", "#3e2f62", shine);
  c.beginPath();
  c.moveTo(-400, 900);
  for (let x = -400; x <= 2400; x += 50) c.lineTo(x, 760 - Math.abs(Math.sin(x * 0.003)) * 160 - Math.sin(x * 0.011) * 20);
  c.lineTo(2400, 1400);
  c.lineTo(-400, 1400);
  c.fill();
  // the mountain itself
  c.fillStyle = mixHex("#2e2236", "#221a34", shine);
  c.beginPath();
  c.moveTo(-400, 1400);
  for (let x = -400; x <= 2400; x += 20) c.lineTo(x, slopeY(x) + Math.sin(x * 0.05) * 3);
  c.lineTo(2400, 1400);
  c.closePath();
  c.fill();
  // sparse grass tufts along the slope
  c.strokeStyle = mixHex("#1e1626", "#3e2c46", shine);
  c.lineWidth = 2;
  const r = rng(162);
  for (let i = 0; i < 60; i++) {
    const x = r() * 2000, y = slopeY(x);
    const sw = Math.sin(t * 1.4 + x * 0.05) * 3;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + sw - 4, y - 12 - r() * 10);
    c.moveTo(x + 4, y);
    c.lineTo(x + sw + 3, y - 10 - r() * 8);
    c.stroke();
  }
  c.restore();
  // the colour flames rising around him (translucent, like light through glass)
  const W0 = walkers(t);
  const jx = W0.xs[0], jy = slopeY(jx);
  if (shine > 0.01) {
    // translucent colour flames rising behind him, soft-edged (blurred layer, added as light)
    const cols = ["#7ee0a0", "#ffb46a", "#ff9ec8", "#8fe8ff", "#c9a8ff", "#ffe08a"];
    const F = layer("mount-flames", 0.5);
    F.save();
    applyCam(F, cam);
    for (let i = 0; i < 14; i++) {
      const col = cols[i % cols.length];
      const life = (t * (0.3 + (i % 4) * 0.07) + i * 0.41) % 1;
      const bx = jx + (i - 6.5) * 22 + Math.sin(t * 0.8 + i) * 12;
      const hgt = (200 + (i % 5) * 50) * (0.6 + 0.4 * Math.sin(life * Math.PI));
      const by = jy - 10 - life * 140;
      const w = 30 + (i % 3) * 10, sway = Math.sin(t * 1.3 + i * 1.7) * 26;
      F.globalAlpha = 0.55 * Math.sin(life * Math.PI);
      F.fillStyle = col;
      F.beginPath();
      F.moveTo(bx - w, by);
      F.bezierCurveTo(bx - w * 1.2, by - hgt * 0.5, bx + sway - w * 0.2, by - hgt * 0.8, bx + sway, by - hgt);
      F.bezierCurveTo(bx + sway + w * 0.2, by - hgt * 0.8, bx + w * 1.2, by - hgt * 0.5, bx + w, by);
      F.closePath();
      F.fill();
    }
    F.restore();
    paint(c, F, shine, "screen", blur(9, 0.5));
    c.save();
    applyCam(c, cam);
    c.globalCompositeOperation = "screen";
    glow(c, jx, jy - 140, 420 * shine + 1, "#fff2dc", 0.38 * shine);
    c.restore();
  }
  c.save();
  applyCam(c, cam);
  if (shine > 0.01) {
    godRays(c, t, jx + 8, jy - 210, { n: 22, len: 950, spread: Math.PI * 1.3, dir: -Math.PI / 2, color: "#fff4e0", alpha: 0.24 * shine, width: 0.09, spin: 0, seed: 166, soft: 10 });
    lightPool(c, jx, jy + 4, 700, 110, "#fff0d8", 0.6 * shine);
  }
  // the four
  for (let i = 3; i >= 0; i--) {
    const x = W0.xs[i], y = slopeY(x);
    let pose: Pose = W0.moving ? walk(t * 0.85 + i * 0.27, 0.9) : P({ head: -0.05 });
    if (W0.moving) pose.torso += 0.12; // climbing
    if (i === 0) pose = mixPose(pose, OPEN, k(t, Wd(28, "صورتش") - 0.5, Wd(28, "صورتش") + 1.0));
    else pose = mixPose(pose, BOW, k(t, Wd(28, "صورتش") - 0.2 + i * 0.15, Wd(28, "صورتش") + 1.2 + i * 0.15, ease.inOutSine));
    const isJ = i === 0;
    const base = isJ ? mixHex(mixHex("#3a2a40", "#e9e1ff", shine), "#ffffff", white) : "#2a1f30";
    const base2 = isJ ? mixHex(mixHex("#20161f", "#c9b8ff", shine), "#fff6e6", white) : "#150f18";
    if (!isJ && shine > 0.01) castShadow(c, { x, y, h: 230, face: 1, pose, t, head: "wrap", beard: true, seed: 170 + i }, jx, 1.2, 0.55 * shine, "#0c0814", 0.2, 5);
    figure(c, { x, y, h: 230, face: 1, pose, t, head: "wrap", beard: true, seed: 170 + i, wind: 0.3 }, {
      base, base2, rim: isJ ? "#ffffff" : mixHex("#ffb07a", "#fff1d0", shine), rimW: isJ ? 3 + 4 * shine : 3, light: isJ ? [0, -1] : [1, -0.3],
    });
    if (isJ && (build > 0 || shine > 0)) {
      const hd: [number, number] = [x + 8, y - 210];
      c.save();
      c.globalCompositeOperation = "screen";
      glow(c, hd[0], hd[1], 46 + 60 * shine, "#fffbe8", Math.max(build * 0.6, shine)); // face like the sun
      c.restore();
      haloRings(c, hd[0], hd[1], 30 * (0.6 + 0.4 * shine), t, shine, "#fff0d8");
      lit.save();
      applyCam(lit, cam);
      glow(lit, hd[0], hd[1], 90 + 70 * shine, "#ffffff", Math.max(build, shine) * 0.8);
      glow(lit, x, y - 110, 170, "#ffffff", shine * (0.3 + 0.4 * white));
      lit.restore();
    }
  }
  sparkles(c, t, [jx - 300, jy - 520, 600, 520], 16, 163, shine, "#ffffff", 10);
  c.restore();
  motes(c, t, { n: 30, color: "#ffffff", alpha: 0.4 * shine, seed: 164, speed: 0.4, dust: true });
  bloom(c, lit, 0.9, 55);
  vignette(c, 0.45, "#0e0814");
  // the flash
  const fl = 0.92 * win(t, Wd(28, "آشکار") - 0.15, Wd(28, "آشکار") + 0.12, Wd(28, "آشکار") + 0.3, Wd(28, "آشکار") + 1.2);
  if (fl > 0.001) {
    c.save();
    c.globalAlpha = fl;
    c.fillStyle = "#fffdf6";
    c.fillRect(-10, -10, W + 20, H + 20);
    c.restore();
  }
  const out = k(t, E(28) + 0.4, E(28) + 1.1);
  title(c, [{ s: "متی ۱۷", f: "MorabbaLight" }], 250, 140, { size: 40, k: k(t, Wd(28, "کوه،") - 0.3, Wd(28, "کوه،") + 0.5), out: k(t, Wd(28, "هویتِ") - 0.3, Wd(28, "هویتِ") + 0.3), align: "left", glow: 10 });
  title(c, [{ s: "مثلِ", f: "MorabbaLight" }, { s: "خورشید", f: "MorabbaHeavy" }], 460, 300, { size: 64, k: k(t, Wd(28, "خورشید") - 0.2, Wd(28, "می‌درخشه") + 0.4), out, shade: 0.35 });
  title(c, [{ s: "سفید", f: "MorabbaHeavy" }, { s: "مثلِ نور", f: "MorabbaLight" }], 460, 400, { size: 64, k: k(t, Wd(28, "سفید") - 0.2, Wd(28, "نور.") + 0.4), out, shade: 0.35 });
  grain(c, t, 0.14);
}
export const _mt = { rgba, TAU, S, H };
