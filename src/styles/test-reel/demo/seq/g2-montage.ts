// S7 · «هر سبک موشنی، هر نوع ادیتی، هر استایل انیمیشنی» (36.2 → 39.7) — r8's cut-per-beat reel, each beat a new
// micro-style built on real public-domain Muybridge silhouettes: floating bodies, a pendulum with runners, a
// negative with speed streaks, a card flipping, x-ray heads in colour discs, frame-by-frame cards, a particle
// swarm, glowing figures round a street lamp. MOTION / EDIT / ANIMATION land on their spoken words.
// `montage2()` also plays on the phone at the start of H.
import { bloom, blur, Ctx, H, layer, matchTransform, W } from "../../lib/canvas";
import { glow, grain, vignette } from "../../lib/fx";
import { txt } from "../../lib/hud";
import { clamp, ease, hash, lerp, rgba, rng } from "../../lib/math";
import { img } from "../../lib/img";
import { BEATS, Wd } from "../cues";

export const G2_START = 36.2;
export const G2_BEATS = BEATS.filter((b) => b >= G2_START - 0.02 && b < 42);
const RUN = (i: number) => img(`run${((i % 10) + 10) % 10}`);
const JUMP = (i: number) => img(`jump${1 + (((i % 7) + 7) % 7)}`);
/** a silhouette (white PNG with alpha) tinted to `col` (via a small cached tint layer) */
const tintCache = new Map<string, HTMLCanvasElement>();
function sil(c: Ctx, im: HTMLImageElement | null, x: number, y: number, h: number, col = "#ffffff", a = 1, rot = 0, flip = false) {
  if (!im || a <= 0.01) return;
  const key = im.src + col;
  let tc = tintCache.get(key);
  if (!tc) {
    tc = document.createElement("canvas");
    tc.width = im.naturalWidth;
    tc.height = im.naturalHeight;
    const x2 = tc.getContext("2d")!;
    x2.drawImage(im, 0, 0);
    x2.globalCompositeOperation = "source-in";
    x2.fillStyle = col;
    x2.fillRect(0, 0, tc.width, tc.height);
    tintCache.set(key, tc);
  }
  const w = (h * im.naturalWidth) / im.naturalHeight;
  c.save();
  c.globalAlpha *= a;
  c.translate(x, y);
  c.rotate(rot);
  if (flip) c.scale(-1, 1);
  c.drawImage(tc, -w / 2, -h / 2, w, h);
  c.restore();
}
const SHOTS: ((c: Ctx, u: number, t: number, lit: Ctx) => void)[] = [
  // 1 · bodies floating/falling in the dark (r8)
  (c, u, t, lit) => {
    c.fillStyle = "#030303";
    c.fillRect(0, 0, W, H);
    const r = rng(11);
    for (let i = 0; i < 9; i++) {
      const x = 120 + r() * 840, y0 = 200 + r() * 1500, s = 160 + r() * 340, sp = 120 + r() * 260;
      const y = y0 + (u + t * 0.05) * sp, rot = (r() - 0.5) * 2.4 + u * (r() - 0.5) * 1.5;
      sil(c, JUMP(i), x, y, s, "#f2f2f2", 0.9, rot, r() < 0.5);
      glow(lit, x, y, s * 0.5, "#ffffff", 0.35);
    }
  },
  // 2 · a pendulum swinging over a curved track of runners (r8) — MOTION
  (c, u, t, lit) => {
    c.fillStyle = "#050505";
    c.fillRect(0, 0, W, H);
    const px = 540, py = 300, L = 980, a = Math.sin(t * 3.1) * 0.55;
    const bx = px + Math.sin(a) * L, by = py + Math.cos(a) * L;
    c.strokeStyle = rgba("#ffffff", 0.85);
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(px, py);
    c.lineTo(bx, by);
    c.stroke();
    c.beginPath();
    c.arc(540, 300, L, Math.PI * 0.22, Math.PI * 0.78);
    c.stroke();
    // runners riding the arc
    for (let i = 0; i < 7; i++) {
      const ang = Math.PI * (0.27 + i * 0.075), rx = 540 + Math.cos(ang) * (L - 8), ry = 300 + Math.sin(ang) * (L - 8);
      sil(c, RUN(Math.floor(t * 12) + i * 3), rx, ry - 70, 150, "#f4f4f4", 0.95, ang - Math.PI / 2);
    }
    c.fillStyle = "#f4f4f4";
    c.beginPath();
    c.arc(bx, by, 38, 0, Math.PI * 2);
    c.fill();
    glow(lit, bx, by, 120, "#ffffff", 0.9);
    // a little mechanical caption (r8)
    txt(c, "T = 2π√(L/g)", 140, 420, { size: 22, weight: 500, ls: 0.1, alpha: 0.7 });
    void u;
  },
  // 3 · the negative: black runners streaking over white (r8)
  (c, u, t) => {
    c.fillStyle = "#f1f1ef";
    c.fillRect(0, 0, W, H);
    for (let row = 0; row < 4; row++) {
      const y = 360 + row * 360, sp = 900 + row * 260;
      const x = ((u * sp + row * 410) % 1500) - 200;
      // speed streaks behind
      c.fillStyle = rgba("#000000", 0.08);
      for (let s = 0; s < 6; s++) c.fillRect(x - 520 + s * 40, y - 60 + s * 22, 420 - s * 50, 4);
      c.save();
      c.filter = blur(1.2);
      sil(c, RUN(Math.floor(t * 14) + row * 2), x, y, 260, "#0d0d0d", 1);
      c.restore();
    }
  },
  // 4 · a playing card turning over (r8) — EDIT
  (c, u) => {
    c.fillStyle = "#e9e8e4";
    c.fillRect(0, 0, W, H);
    const fl = ease.inOut(clamp(u / 0.32));
    const sx = Math.cos(fl * Math.PI);
    const face = sx < 0;
    c.save();
    c.translate(540, 900);
    c.fillStyle = rgba("#000000", 0.18);
    c.filter = blur(14);
    c.beginPath();
    c.roundRect(-150 * Math.abs(sx) + 20, -200 + 30, 300 * Math.abs(sx), 420, 18);
    c.fill();
    c.filter = "none";
    c.scale(Math.max(0.02, Math.abs(sx)), 1);
    c.fillStyle = "#fbfaf6";
    c.beginPath();
    c.roundRect(-150, -210, 300, 420, 18);
    c.fill();
    c.strokeStyle = rgba("#000000", 0.25);
    c.lineWidth = 2;
    c.stroke();
    if (face) {
      txt(c, "K", -112, -160, { size: 54, weight: 700, color: "#c1121f" });
      txt(c, "♥", -112, -108, { size: 44, weight: 700, color: "#c1121f" });
      txt(c, "♥", 0, 6, { size: 190, weight: 700, align: "center", color: "#c1121f" });
    } else {
      c.fillStyle = "#1d3557";
      c.beginPath();
      c.roundRect(-128, -188, 256, 376, 10);
      c.fill();
      c.strokeStyle = rgba("#ffffff", 0.35);
      for (let i = -12; i < 12; i++) {
        c.beginPath();
        c.moveTo(-128, i * 34);
        c.lineTo(128, i * 34 + 120);
        c.stroke();
      }
    }
    c.restore();
  },
  // 5 · x-ray heads in colour discs (r8)
  (c, u, t) => {
    c.fillStyle = "#070707";
    c.fillRect(0, 0, W, H);
    const discs: [number, number, number, string][] = [[540, 860, 260, "#d62828"], [210, 420, 120, "#2a9d8f"], [880, 380, 110, "#3a86ff"], [200, 1430, 125, "#f77f00"], [860, 1460, 140, "#c9184a"]];
    discs.forEach(([x, y, r, col], i) => {
      const p = ease.outBack(clamp((u - i * 0.03) / 0.16));
      if (p <= 0) return;
      const rr = r * p;
      c.fillStyle = col;
      c.beginPath();
      c.arc(x, y, rr, 0, Math.PI * 2);
      c.fill();
      // head in profile with a glowing brain net
      c.save();
      c.translate(x, y + rr * 0.08);
      c.scale(rr / 100, rr / 100);
      c.fillStyle = rgba("#000000", 0.55);
      c.beginPath();
      c.moveTo(-30, 70);
      c.bezierCurveTo(-55, 30, -60, -45, -10, -62);
      c.bezierCurveTo(40, -78, 70, -30, 62, 8);
      c.lineTo(72, 22);
      c.lineTo(58, 28);
      c.lineTo(60, 44);
      c.bezierCurveTo(50, 54, 30, 50, 22, 70);
      c.closePath();
      c.fill();
      c.strokeStyle = rgba("#ffffff", 0.75);
      c.lineWidth = 1.4;
      const nr = rng(i + 3);
      const pts = Array.from({ length: 16 }, () => [-38 + nr() * 76, -52 + nr() * 50] as [number, number]);
      for (let a = 0; a < pts.length; a++)
        for (let b = a + 1; b < pts.length; b++)
          if (Math.hypot(pts[a][0] - pts[b][0], pts[a][1] - pts[b][1]) < 26) {
            c.beginPath();
            c.moveTo(pts[a][0], pts[a][1]);
            c.lineTo(pts[b][0], pts[b][1]);
            c.stroke();
          }
      c.restore();
      void t;
    });
  },
  // 6 · frame by frame: the runner's cycle on a row of cards (r8) — ANIMATION
  (c, u, t) => {
    c.fillStyle = "#050505";
    c.fillRect(0, 0, W, H);
    const n = 10, cw = 150, ch = 210, gap = 26;
    const shift = -u * 420;
    for (let i = 0; i < n + 3; i++) {
      const x = 80 + i * (cw + gap) + shift, y = 860;
      c.fillStyle = "#f4f4f2";
      c.fillRect(x - cw / 2, y - ch / 2, cw, ch);
      sil(c, RUN(i), x, y + 8, ch * 0.86, "#0c0c0c", 1);
      txt(c, String(i + 1).padStart(2, "0"), x, y + ch / 2 + 26, { size: 18, weight: 600, ls: 0.15, align: "center", alpha: 0.7 });
    }
    void t;
  },
  // 7 · a swarm of particles, letterboxed (r8)
  (c, u, t, lit) => {
    c.fillStyle = "#000";
    c.fillRect(0, 0, W, H);
    c.fillStyle = "#0e0e0e";
    c.fillRect(70, 520, 940, 880);
    const r = rng(5);
    for (let i = 0; i < 900; i++) {
      const s = r(), ph = r() * 6.28;
      const a = t * 1.6 + s * 4.2 + Math.sin(ph + t) * 0.3;
      const x = 540 + Math.cos(a) * (120 + s * 380) + Math.sin(ph * 3 + t * 2) * 30;
      const y = 960 + Math.sin(a * 1.3) * (90 + s * 260) - s * 120 + u * 40;
      if (x < 70 || x > 1010 || y < 520 || y > 1400) continue;
      c.fillStyle = rgba("#ffffff", 0.35 + 0.6 * r());
      c.fillRect(x, y, 2.4, 2.4);
    }
    glow(lit, 540, 900, 300, "#ffffff", 0.25);
    txt(c, "N = 900", 96, 500, { size: 18, weight: 500, ls: 0.15, alpha: 0.6 });
  },
  // 8 · glowing figures round a street lamp, orange bokeh (r8)
  (c, u, t, lit) => {
    c.fillStyle = "#06070b";
    c.fillRect(0, 0, W, H);
    glow(c, 540, 520, 900, "#ff8a2a", 0.35);
    c.fillStyle = "#121212";
    c.fillRect(530, 520, 20, 1400);
    glow(lit, 540, 500, 160, "#ffb060", 1);
    const r = rng(8);
    for (let i = 0; i < 26; i++) {
      const bx = r() * W, by = r() * H, br = 30 + r() * 90;
      c.fillStyle = rgba(r() < 0.6 ? "#ff9a3c" : "#7aa2ff", 0.12 + 0.1 * r());
      c.beginPath();
      c.arc(bx, by + u * 30, br, 0, Math.PI * 2);
      c.fill();
    }
    for (let i = 0; i < 5; i++) {
      const x = 200 + i * 170, y = 900 + Math.sin(t * 2 + i) * 60;
      sil(c, JUMP(i + 2), x, y, 260, "#ffb366", 0.95, Math.sin(i) * 0.6);
      glow(lit, x, y, 140, "#ff9a3c", 0.7);
    }
  },
];
/** the micro-shot playing at t (one per beat from 36.2; it keeps cycling after) */
export function montage2(c: Ctx, t: number, lit: Ctx) {
  const i = Math.max(0, G2_BEATS.filter((b) => b <= t + 1e-3).length - 1);
  const t0 = G2_BEATS[i] ?? G2_START;
  SHOTS[i % SHOTS.length](c, t - t0, t, lit);
  return i % SHOTS.length;
}
const LIGHT_SHOTS = new Set([2, 3]);
/** big words on their spoken words, with an RGB split on impact */
function word(c: Ctx, s: string, t: number, t0: number, t1: number, size: number, dark: boolean) {
  if (t < t0 || t > t1) return;
  const hit = Math.exp(-(t - t0) / 0.12);
  c.save();
  c.translate(540, 960);
  c.scale(1 + 0.3 * hit, 1 + 0.3 * hit);
  for (const [dx, col] of [[-14 * hit, "#ff2d55"], [14 * hit, "#2db8ff"]] as const) {
    c.globalCompositeOperation = dark ? "multiply" : "screen";
    txt(c, s, dx, 0, { size, weight: 700, ls: 0.04, align: "center", color: col, alpha: 0.8 * hit });
  }
  c.globalCompositeOperation = "source-over";
  txt(c, s, 0, 0, { size, weight: 700, ls: 0.04, align: "center", color: dark ? "#0a0a0a" : "#ffffff", glow: dark ? 0 : 18 });
  c.restore();
}
export function seqG2(c: Ctx, t: number) {
  const lit = layer("g2-lit", 0.5);
  lit.save();
  matchTransform(lit, c);
  const i = montage2(c, t, lit);
  lit.restore();
  bloom(c, lit, 0.9, 30);
  const light = LIGHT_SHOTS.has(i);
  word(c, "MOTION", t, Wd(7, "موشنی") - 0.05, Wd(7, "هر", 1) - 0.05, 190, light);
  word(c, "EDIT", t, Wd(7, "ادیتی") - 0.05, Wd(7, "هر", 2) - 0.05, 300, light);
  word(c, "ANIMATION", t, Wd(7, "انیمیشنی") - 0.05, Wd(7, "انیمیشنی") + 0.55, 150, light);
  // a white frame on every cut (r8)
  const b = G2_BEATS.filter((x) => x <= t + 1e-3).pop() ?? G2_START;
  const fl = Math.exp(-(t - b) / 0.045);
  if (fl > 0.05) {
    c.fillStyle = rgba("#ffffff", 0.4 * fl);
    c.fillRect(0, 0, W, H);
  }
  vignette(c, 0.35, "#000000");
  grain(c, t, 0.2);
  void hash;
  void lerp;
}
