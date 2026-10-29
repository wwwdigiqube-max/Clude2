// Line 22: the royal glory of Yahweh in human form (warm, crowned with rays).
// Lines 24–25: «در ازل کلمه بود»: a point of light in the dark → a second light comes out of it (with God) →
// they overlap (was God); the overlap is the same mandorla as at the start, and the figure of light stands in it.
import { applyCam, bloom, blur, Ctx, layer, paint } from "../lib/canvas";
import { CloudPal, clouds, godRays, lightPool, nebula, starsDeep } from "../lib/depth";
import { grain, motes, painterly, sparkles, vignette } from "../lib/fx";
import { lightBeing, lightCore } from "../lib/light";
import { clamp, ease, k, lerp, rgba, rng, ss, TAU, win } from "../lib/math";
import { title } from "../lib/text";
import { E, S, W as Wd } from "../cues";
import { vesica } from "./open";

/** the royal glory: a large warm figure of light standing on lit clouds, a ring of cloud turning slowly behind,
 *  volumetric rays and a crown of fine rays (depth: hazy far clouds, a sharp cloud floor, blurred near clouds) */
const GPAL: CloudPal = { shade: "#1c0a1e", mid: "#7a3a50", lit: "#ffd9b0", gamma: 1.1 };
const GFAR: CloudPal = { shade: "#170a1c", mid: "#4e2440", lit: "#c98a80", gamma: 1.2 };
export function drawGlory(c: Ctx, t: number) {
  painterly(c, t, "#1e0d24", "#3a1a2e", [{ x: 960, y: 520, r: 820, c: "#7a3a4a", a: 0.7 }, { x: 960, y: 300, r: 560, c: "#ffb46a", a: 0.35 }], 120);
  nebula(c, t, ["#6a2a3a", "#a0583a", "#ffd9a0"], 0.3, 21, 0.8);
  const lit = layer("glory-lit", 0.5);
  const kk = k(t, Wd(22, "جلالِ") - 0.6, Wd(22, "شاهانه‌ی") + 0.6);
  const cam = { x: 960 + Math.sin(t * 0.07) * 14, y: 540 + Math.cos(t * 0.05) * 8, z: 1 + 0.035 * Math.sin(t * 0.04) };
  const tl = t - Wd(22, "جلالِ"); // local time: clouds drift from where they were placed
  // far: towering clouds on both sides, slow parallax (hazy = far)
  const F = layer("glory-far", 0.5);
  F.save();
  applyCam(F, { ...cam, x: 960 + (cam.x - 960) * 0.4 });
  clouds(F, tl, [
    { name: "cu5", x: 250, y: 420, w: 1150, sp: 3 }, { name: "cu4", x: 1680, y: 400, w: 1200, flip: true, sp: -3 },
    { name: "cu3", x: 960, y: 150, w: 1700, a: 0.45, sp: 1.5 },
  ], GFAR, 1);
  F.restore();
  paint(c, F, 0.8 * (0.5 + 0.5 * kk), "source-over", blur(2.5, 0.5));
  // the light behind: broad volumetric beams + a crown of fine rays
  c.save();
  applyCam(c, cam);
  godRays(c, t, 960, 340, { n: 16, len: 1100, color: "#ffd9a8", alpha: 0.22 * kk, width: 0.14, spin: 0.006, seed: 3, soft: 18 });
  c.globalCompositeOperation = "screen";
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * TAU + t * 0.03;
    const len = 330 + 220 * (0.5 + 0.5 * Math.sin(i * 5.1 + t * 0.7));
    c.strokeStyle = rgba(i % 2 ? "#ffd59a" : "#fff4dc", 0.1 * kk);
    c.lineWidth = i % 4 ? 1.5 : 3.5;
    c.beginPath();
    c.moveTo(960 + Math.cos(a) * 150, 340 + Math.sin(a) * 150);
    c.lineTo(960 + Math.cos(a) * len, 340 + Math.sin(a) * len);
    c.stroke();
  }
  c.globalCompositeOperation = "source-over";
  // mid: a sea of cloud he stands on, lit from above by him
  clouds(c, tl, [{ name: "sea1", x: 960, y: 1190, w: 2500, sp: 4 }], GPAL, 1);
  // his light spills over the cloud tops around him
  lightPool(c, 960, 990, 900, 220, "#ffcf9a", 0.55 * kk);
  lightBeing(c, lit, { x: 960, y: 990, h: 680, t, k: kk, warm: 0.85, rays: 1.3, aura: 1.1, seed: 31, pool: 0.7 });
  // light spilling over the cloud tops around his feet
  lightPool(c, 960, 985, 520, 70, "#ffe6c0", 0.5 * kk);
  sparkles(c, t, [500, 150, 920, 800], 22, 121, kk, "#fff2d0", 11);
  c.restore();
  // near: big out-of-focus cloud edges in the lower corners (drift faster = closer)
  const N = layer("glory-near", 0.5);
  N.save();
  applyCam(N, { ...cam, x: 960 + (cam.x - 960) * 1.8 });
  clouds(N, tl, [{ name: "cu4", x: -60, y: 1010, w: 1100, crop: [0, 0.1, 0.55, 0.6], sp: 5 }, { name: "cu4", x: 1990, y: 1000, w: 1100, flip: true, crop: [0.45, 0.1, 0.55, 0.6], sp: -5 }], GFAR, 1);
  N.restore();
  paint(c, N, 0.95, "source-over", blur(9, 0.5));
  motes(c, t, { n: 34, color: "#ffe2b0", alpha: 0.45 * kk, seed: 122, speed: 0.4, dust: true });
  bloom(c, lit, 1.0, 60);
  vignette(c, 0.5, "#120712");
  const out = k(t, Wd(22, "حالا") - 0.3, Wd(22, "حالا") + 0.4);
  title(c, [{ s: "جلالِ شاهانه‌ی", f: "MorabbaLight" }, { s: "یَهوه", f: "MorabbaHeavy" }], 960, 120, { size: 62, k: k(t, Wd(22, "جلالِ") - 0.1, Wd(22, "یَهوه‌ست") + 0.4), out, shade: 0.45 });
  title(c, [{ s: "به شکلِ", f: "MorabbaLight" }, { s: "یک انسان", f: "MorabbaHeavy" }], 960, 1000, { size: 52, k: k(t, Wd(22, "شکلِ") - 0.2, Wd(22, "انسان") + 0.5), out, shade: 0.45 });
  grain(c, t, 0.14);
}

/** In the beginning: dark, a point of light, a second light from it, then one overlapping light */
export function drawWord(c: Ctx, t: number) {
  painterly(c, t, "#07040c", "#0d0716", [{ x: 960, y: 540, r: 700, c: "#1d1030", a: 0.8 }], 130, 0.4);
  // the dark before the beginning has depth: a faint nebula and stars at three depths, slowly turning
  const lightUp = ss(Wd(24, "ازل") - 0.3, Wd(24, "کلمه") + 1.5, t);
  nebula(c, t, ["#2a1a4a", "#4a2a5a", "#c8b0ff"], 0.12 + 0.2 * lightUp, 133, 0.6);
  c.save();
  c.translate(960, 540);
  c.rotate(t * 0.006);
  c.translate(-960, -540);
  starsDeep(c, t, 240, 131, 0.75 * ss(S(24), S(24) + 3, t), Math.sin(t * 0.05) * 40, 0);
  c.restore();
  const lit = layer("word-lit", 0.5);
  const born = k(t, Wd(24, "ازل") - 0.3, Wd(24, "کلمه") + 0.6, ease.out);
  const apart = k(t, Wd(24, "با") - 0.3, Wd(24, "بود،", 1) + 0.3, ease.inOut);
  const one = k(t, Wd(24, "کلمه", 2) - 0.2, Wd(24, "بود.»", 2) + 0.3, ease.inOut);
  const d = lerp(0, 230, apart) * (1 - 0.55 * one); // centres stay overlapping: distinct, yet one
  const xA = 960 - d / 2, xB = 960 + d / 2;
  const r = lerp(0, 230, born);
  // before the light: dust spirals in from the dark and gathers into one point
  const v0 = Wd(24, "انجیلِ") + 0.2, v1 = Wd(24, "ازل") + 0.2;
  if (t > v0 && t < v1 + 1.5) {
    const rr = rng(240);
    c.save();
    c.globalCompositeOperation = "screen";
    c.fillStyle = "#ffffff";
    for (let i = 0; i < 520; i++) {
      const a0 = rr() * TAU, r0 = 220 + rr() * 820, dl = rr() * 0.4;
      const u = clamp((t - v0 - dl * (v1 - v0)) / ((v1 - v0) * (1 - dl)));
      const e = ease.in(u);
      const rad = r0 * (1 - e), ang = a0 + e * 3.2;
      const al = Math.min(1, u * 3) * (1 - k(t, v1, v1 + 1.2)) * (0.4 + 0.6 * rr());
      const px = 960 + Math.cos(ang) * rad, py = 540 + Math.sin(ang) * rad * 0.7;
      // a short trail along the spiral (motion)
      const e0 = ease.in(Math.max(0, u - 0.04)), rad0 = r0 * (1 - e0), ang0 = a0 + e0 * 3.2;
      c.globalAlpha = al * 0.45;
      c.strokeStyle = i % 5 ? "#ffffff" : "#ffd9a0";
      c.lineWidth = 1 + e;
      c.beginPath();
      c.moveTo(960 + Math.cos(ang0) * rad0, 540 + Math.sin(ang0) * rad0 * 0.7);
      c.lineTo(px, py);
      c.stroke();
      c.globalAlpha = al;
      c.beginPath();
      c.arc(px, py, 1 + 1.5 * e, 0, TAU);
      c.fill();
    }
    c.restore();
  }
  // two discs of light (screen) — the overlap reads brightest: the mandorla
  c.save();
  c.globalCompositeOperation = "screen";
  for (const [x, col] of [[xA, "#ffe2b0"], [xB, "#c9b8ff"]] as const) {
    const g = c.createRadialGradient(x, 540, 0, x, 540, r * 1.6);
    g.addColorStop(0, rgba(col, 0.9));
    g.addColorStop(0.45, rgba(col, 0.35));
    g.addColorStop(1, rgba(col, 0));
    c.fillStyle = g;
    c.fillRect(x - r * 2, 540 - r * 2, r * 4, r * 4);
  }
  c.restore();
  // circle outlines (line art) and the mandorla where they overlap
  c.save();
  c.strokeStyle = "#ffffff";
  c.shadowColor = "#ffffff";
  c.shadowBlur = 12;
  c.lineWidth = 2.5;
  c.globalAlpha = 0.85 * apart;
  for (const x of [xA, xB]) {
    c.beginPath();
    c.arc(x, 540, r, 0, TAU);
    c.stroke();
  }
  c.restore();
  lightCore(c, lit, 960, 540, 60 * born * (1 - apart * 0.5), born, "#ffe9c2", t);
  godRays(c, t, 960, 540, { n: 28, len: 900 * born, color: "#fff2dc", alpha: 0.2 * born, width: 0.06, spin: 0.01, seed: 134, soft: 6 });
  const bring = clamp((t - Wd(24, "ازل") + 0.1) / 1.6);
  if (bring > 0 && bring < 1) {
    c.save();
    c.globalCompositeOperation = "screen";
    c.strokeStyle = rgba("#ffffff", 0.6 * (1 - bring));
    c.lineWidth = 3;
    c.beginPath();
    c.arc(960, 540, 40 + 700 * ease.out(bring), 0, TAU);
    c.stroke();
    c.restore();
  }
  // line 25: the figure of light stands in the overlap — the same paradox
  const fig = k(t, Wd(25, "این") - 0.2, Wd(25, "فرشته‌ی") + 0.5);
  if (fig > 0.01 && d > 10) {
    c.save();
    c.translate(960, 540);
    c.rotate(Math.PI / 2);
    c.translate(-960, -540);
    c.globalAlpha = 0.35 * fig;
    c.fillStyle = "#ffffff";
    c.fill(vesica(960, 540, d / 2, r));
    c.restore();
    lightBeing(c, lit, { x: 960, y: 740, h: 380, t, k: fig, warm: 0.4, rays: 1, aura: 0.5 });
  }
  sparkles(c, t, [600, 260, 720, 560], 14, 132, born, "#ffffff", 8);
  bloom(c, lit, 1.1, 60);
  vignette(c, 0.55, "#040208");
  // texts
  const out = k(t, E(25) + 0.3, E(25) + 1.0);
  title(c, [{ s: "یوحنا ۱:۱", f: "MorabbaLight" }], 960, 120, { size: 36, k: k(t, Wd(24, "یوحنا") - 0.2, Wd(24, "یوحنا") + 0.6), out, glow: 10 });
  title(c, [{ s: "«در ازل", f: "MorabbaLight" }, { s: "کلمه", f: "MorabbaHeavy" }, { s: "بود؛", f: "MorabbaLight" }], 960, 930, { size: 50, k: k(t, Wd(24, "«در") - 0.1, Wd(24, "بود؛") + 0.3), out: k(t, Wd(25, "با") - 0.4, Wd(25, "با")), shade: 0.3 });
  title(c, [{ s: "کلمه", f: "MorabbaHeavy" }, { s: "با خدا بود،", f: "MorabbaLight" }, { s: "و کلمه", f: "MorabbaLight" }, { s: "خدا بود»", f: "MorabbaHeavy" }], 960, 1000, { size: 50, k: k(t, Wd(24, "کلمه", 1) - 0.1, Wd(24, "بود.»", 2) + 0.3), out: k(t, Wd(25, "با") - 0.4, Wd(25, "با")), shade: 0.3 });
  title(c, [{ s: "با خدا", f: "MorabbaBold" }], 960 + 380, 540, { size: 60, k: k(t, Wd(25, "با") - 0.1, Wd(25, "بود،") + 0.3), out, shade: 0.3 });
  title(c, [{ s: "خودِ خدا", f: "MorabbaHeavy" }], 960 - 380, 540, { size: 64, k: k(t, Wd(25, "خودِ") - 0.1, Wd(25, "بود.", 1) + 0.3), out, shade: 0.3 });
  grain(c, t, 0.15);
}
export const _w = { win };
