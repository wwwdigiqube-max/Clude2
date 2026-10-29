// H · «این ویدئویی که داری میبینی هم، دقیقاً همینطوری ساخته شده» (39.63 → 43.4) — r4: the montage keeps playing on
// a phone held by a giant black hand in a black-and-white dune desert; pulling out, the phone shows this very scene,
// and we keep pulling out through it (an infinite, self-similar zoom). On «همینطوری» the same prompt bar as D's Claude
// card types «make this video» in the sky of every level (no NFP name on screen — the voice says it).
// At the end the camera dives into a moon, which picks up hatching and becomes the first planet of I.
import { bloom, Ctx, H, layer, matchTransform, W } from "../../lib/canvas";
import { glow, grain, vignette } from "../../lib/fx";
import { txt } from "../../lib/hud";
import { CLAUDE_ORANGE, CLAUDE_PATH } from "../../lib/claude-logo";
import { clamp, ease, k, lerp, rgba, rng } from "../../lib/math";
import { Wd } from "../cues";
import { montage2 as montage } from "./g2-montage";

const P = { x: 300, y: 980, w: 160, h: 160 * (1920 / 1080) };
const F = P.h / H;
const Q = { x: P.x / (1 - F), y: P.y / (1 - F) };
export const MOON = { x: 820, y: 300, r: 150 };
export const H0 = 39.95;
/** ζ: −1 = inside the phone (its screen fills the frame), 0 = the scene, >0 = pulled out through the recursion */
export function zeta(t: number) {
  if (t < 40.6) return lerp(-1, 0, ease.out(clamp((t - H0) / (40.6 - H0))));
  return lerp(0, 1.3, ease.inOut(clamp((t - 40.6) / (43.4 - 40.6))));
}
const DUNES = [
  { base: 1060, a: 26, f: 0.006, ph: 1.0, dark: "#4a4a4a", light: "#bdbdbd" },
  { base: 1180, a: 40, f: 0.0045, ph: 2.6, dark: "#3a3a3a", light: "#d2d2d2" },
  { base: 1380, a: 70, f: 0.0035, ph: 0.4, dark: "#2a2a2a", light: "#e2e2e2" },
  { base: 1650, a: 110, f: 0.0026, ph: 4.1, dark: "#1c1c1c", light: "#ececec" },
];
const duneY = (d: (typeof DUNES)[number], x: number) => d.base + d.a * Math.sin(x * d.f + d.ph) + d.a * 0.45 * Math.sin(x * d.f * 2.3 + d.ph * 1.7);
function scene(c: Ctx, t: number, made: number) {
  const g = c.createLinearGradient(0, 0, 0, 1020);
  g.addColorStop(0, "#141414");
  g.addColorStop(0.75, "#8c8c8c");
  g.addColorStop(1, "#f4f4f4");
  c.fillStyle = g;
  c.fillRect(0, 0, W, 1030);
  // sun rays behind the horizon
  c.save();
  c.globalCompositeOperation = "screen";
  c.strokeStyle = rgba("#ffffff", 0.08);
  c.lineWidth = 18;
  for (let i = 0; i < 14; i++) {
    const a = -Math.PI / 2 + (i - 6.5) * 0.16 + Math.sin(t * 0.2) * 0.02;
    c.beginPath();
    c.moveTo(540, 1010);
    c.lineTo(540 + Math.cos(a) * 1400, 1010 + Math.sin(a) * 1400);
    c.stroke();
  }
  c.restore();
  // the moon
  const mg = c.createRadialGradient(MOON.x - 50, MOON.y - 50, 20, MOON.x, MOON.y, MOON.r);
  mg.addColorStop(0, "#f0f0f0");
  mg.addColorStop(1, "#9a9a9a");
  c.fillStyle = mg;
  c.beginPath();
  c.arc(MOON.x, MOON.y, MOON.r, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = rgba("#6e6e6e", 0.35);
  for (const [dx, dy, r] of [[-40, -20, 38], [30, 40, 26], [-10, 60, 18], [50, -50, 22]] as const) {
    c.beginPath();
    c.arc(MOON.x + dx, MOON.y + dy, r, 0, Math.PI * 2);
    c.fill();
  }
  // jagged peaks on the horizon
  c.fillStyle = "#5c5c5c";
  c.beginPath();
  c.moveTo(0, 1030);
  const r = rng(4);
  for (let x = 0; x <= W; x += 40) c.lineTo(x, 1010 - (r() < 0.2 ? 60 + r() * 120 : r() * 30));
  c.lineTo(W, 1030);
  c.closePath();
  c.fill();
  // dunes, shaded strip by strip from their slope (lit faces / shadow faces)
  for (const d of DUNES) {
    for (let x = -10; x < W + 10; x += 6) {
      const y = duneY(d, x), sl = (duneY(d, x + 3) - duneY(d, x - 3)) / 6;
      const lightness = clamp(0.5 - sl * 4);
      c.fillStyle = mixGrey(d.dark, d.light, lightness);
      c.fillRect(x, y, 7, 1920 - y);
    }
  }
  // the prompt that made it (in every level of the recursion at once)
  if (made > 0) promptBar(c, 540, 600, made, t);
  // the hand behind the phone: forearm from the bottom-left, a palm that narrows into the wrist
  c.fillStyle = "#050505";
  c.beginPath();
  c.moveTo(-80, 1920);
  c.bezierCurveTo(40, 1720, 190, 1520, 268, 1400);
  c.bezierCurveTo(282, 1330, 288, 1250, 300, 1175);
  c.lineTo(462, 1165);
  c.bezierCurveTo(480, 1260, 470, 1350, 432, 1418);
  c.bezierCurveTo(360, 1560, 270, 1760, 236, 1920);
  c.closePath();
  c.fill();
}
/** D's input bar, alone in the sky: the mark, «make this video» typing, the orange send key pressed at the end */
function promptBar(c: Ctx, x: number, y: number, p: number, t: number) {
  const inA = ease.outBack(clamp(p / 0.3));
  const w = 700, h = 104;
  c.save();
  c.translate(x, y);
  c.scale(inA, inA);
  c.globalAlpha = clamp(p * 4);
  c.fillStyle = rgba("#000000", 0.35);
  c.beginPath();
  c.roundRect(-w / 2 + 6, -h / 2 + 12, w, h, 52);
  c.fill();
  c.fillStyle = "#1d1c1a";
  c.beginPath();
  c.roundRect(-w / 2, -h / 2, w, h, 52);
  c.fill();
  c.strokeStyle = rgba("#ffffff", 0.22);
  c.lineWidth = 2;
  c.stroke();
  c.save();
  c.translate(-w / 2 + 58, 0);
  c.scale(1.5, 1.5);
  c.translate(-12, -12);
  c.fillStyle = CLAUDE_ORANGE;
  c.fill(new Path2D(CLAUDE_PATH));
  c.restore();
  const str = "make this video";
  const typed = str.slice(0, Math.ceil(clamp((p - 0.15) / 0.6) * str.length));
  const caret = p < 0.8 && Math.floor(t * 2.6) % 2 === 0 ? "|" : "";
  txt(c, typed + caret, -w / 2 + 104, 2, { size: 36, weight: 500, ls: 0.01, color: "#f2efe8" });
  const press = p > 0.85 ? 1 - 0.12 * Math.sin(clamp((p - 0.85) / 0.15) * Math.PI) : 1;
  c.save();
  c.translate(w / 2 - 56, 0);
  c.scale(press, press);
  c.fillStyle = typed.length ? CLAUDE_ORANGE : rgba("#ffffff", 0.18);
  c.beginPath();
  c.roundRect(-34, -34, 68, 68, 18);
  c.fill();
  c.strokeStyle = "#ffffff";
  c.lineWidth = 4.5;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.beginPath();
  c.moveTo(0, 18);
  c.lineTo(0, -18);
  c.moveTo(-14, -4);
  c.lineTo(0, -18);
  c.lineTo(14, -4);
  c.stroke();
  c.restore();
  c.restore();
}
function phone(c: Ctx) {
  c.fillStyle = "#121212";
  c.beginPath();
  c.roundRect(P.x - 11, P.y - 16, P.w + 22, P.h + 32, 24);
  c.fill();
  c.strokeStyle = rgba("#ffffff", 0.35);
  c.lineWidth = 2;
  c.stroke();
}
/** thumb up the left edge (in front of the bezel), four fingertips curled over the right edge */
function fingers(c: Ctx) {
  c.fillStyle = "#050505";
  c.strokeStyle = "#050505";
  c.lineCap = "round";
  c.lineJoin = "round";
  // thumb: base at the heel of the palm, two segments, rounded tip resting on the left bezel
  c.lineWidth = 30;
  c.beginPath();
  c.moveTo(286, 1372);
  c.quadraticCurveTo(262, 1318, 276, 1262);
  c.stroke();
  c.lineWidth = 24;
  c.beginPath();
  c.moveTo(276, 1262);
  c.quadraticCurveTo(286, 1214, 306, 1190);
  c.stroke();
  // fingers: each comes from behind the phone and curls onto the front over the right bezel
  const tips: [number, number, number][] = [[1196, 21, 0], [1236, 22, 4], [1276, 21, 6], [1314, 18, 8]];
  for (const [y, w, d] of tips) {
    c.lineWidth = w;
    c.beginPath();
    c.moveTo(488 - d, y + 18);
    c.quadraticCurveTo(500 - d, y - 4, 476 - d, y - 10);
    c.lineTo(456 - d * 0.5, y - 2);
    c.stroke();
  }
  // the edge of the palm under the phone
  c.beginPath();
  c.moveTo(292, 1270);
  c.quadraticCurveTo(380, 1300, 470, 1268);
  c.lineTo(470, 1300);
  c.quadraticCurveTo(380, 1340, 292, 1300);
  c.closePath();
  c.fill();
}
function mixGrey(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1, 3), 16), pb = parseInt(b.slice(1, 3), 16);
  const v = Math.round(pa + (pb - pa) * t);
  return `rgb(${v},${v},${v})`;
}
/** the whole recursive frame; `inner` draws what plays on the innermost phone before the recursion takes over */
export function droste(c: Ctx, t: number, lit: Ctx) {
  const z = zeta(t);
  const made = k(t, Wd(8, "همینطوری") - 0.1, Wd(8, "ساخته") + 0.1);
  const recursive = t > Wd(8, "داری");
  // the outermost level that still covers the frame; before the recursion starts, level 0 is always the outermost
  const jo0 = Math.floor(-z + 1e-6);
  const jo = recursive ? -Math.ceil(z - 1e-6) : Math.min(0, jo0);
  c.save();
  const base = c.getTransform();
  let depth = 0;
  for (let j = jo; depth < 5; j++, depth++) {
    const s = Math.pow(F, z + j);
    if (s < 0.003) break;
    c.setTransform(base.translate(Q.x, Q.y).scale(s, s).translate(-Q.x, -Q.y));
    scene(c, t, made);
    phone(c);
    // what's on this phone: the next level (recursive) or the montage (before «داری»)
    c.beginPath();
    c.roundRect(P.x, P.y, P.w, P.h, 12);
    c.clip();
    if (!recursive && j >= 0) {
      c.save();
      c.translate(P.x, P.y);
      c.scale(F, F);
      const L = layer("h-mlit", 0.25);
      montage(c, t, L);
      c.restore();
      break;
    }
  }
  c.restore();
  // the hand's thumb and fingers sit in front of each phone: draw them per level again (outside the clips)
  c.save();
  for (let j = jo, depth = 0; depth < 5; j++, depth++) {
    const s = Math.pow(F, z + j);
    if (s < 0.003) break;
    c.setTransform(base.translate(Q.x, Q.y).scale(s, s).translate(-Q.x, -Q.y));
    fingers(c);
    if (!recursive && j >= 0) break;
  }
  c.restore();
  // a flash on the phone screen when it switches to «this video»
  const sw = t > Wd(8, "داری") ? Math.exp(-(t - Wd(8, "داری")) / 0.15) : 0;
  if (sw > 0.02) {
    const s = Math.pow(F, z);
    c.save();
    c.setTransform(base.translate(Q.x, Q.y).scale(s, s).translate(-Q.x, -Q.y));
    c.fillStyle = rgba("#ffffff", 0.8 * sw);
    c.fillRect(P.x, P.y, P.w, P.h);
    c.restore();
  }
  void lit;
  return z;
}
export function seqH(c: Ctx, t: number) {
  c.fillStyle = "#000";
  c.fillRect(0, 0, W, H);
  const lit = layer("h-lit", 0.5);
  lit.save();
  matchTransform(lit, c);
  // the final dive into a moon (the level whose scale is closest to 0.8)
  const dive = 0 * k(t, 42.95, 43.4, ease.in);
  const z = zeta(t);
  const j0 = -Math.ceil(z - 1e-6);
  let jm = j0, best = 9;
  for (let j = j0; j < j0 + 4; j++) {
    const d = Math.abs(Math.log(Math.pow(F, z + j) / 0.8));
    if (d < best) [best, jm] = [d, j];
  }
  const sm = Math.pow(F, z + jm);
  const mx = Q.x + (MOON.x - Q.x) * sm, my = Q.y + (MOON.y - Q.y) * sm, mr = MOON.r * sm;
  const target = { x: 540, y: 760, r: 190 };
  const zz = Math.exp(lerp(0, Math.log(target.r / mr), dive));
  c.save();
  c.translate(lerp(mx, target.x, dive), lerp(my, target.y, dive));
  c.scale(zz, zz);
  c.translate(-mx, -my);
  droste(c, t, lit);
  c.restore();
  lit.restore();
  // the moon picks up r2's hatching as it arrives
  if (dive > 0.3) {
    const cx = lerp(mx, target.x, dive), cy = lerp(my, target.y, dive), cr = mr * zz;
    c.save();
    c.globalAlpha = clamp((dive - 0.3) / 0.7);
    c.beginPath();
    c.arc(cx, cy, cr, 0, Math.PI * 2);
    c.clip();
    c.strokeStyle = "#060606";
    c.lineCap = "round";
    const r = rng(3);
    for (let i = 0; i < 9; i++) {
      const yy = cy - cr + (i + 0.5) * (2 * cr / 9);
      c.lineWidth = cr * (0.04 + r() * 0.08);
      c.beginPath();
      c.moveTo(cx - cr * 1.1, yy + cr * 0.25);
      c.bezierCurveTo(cx - cr * 0.3, yy - cr * 0.2 + r() * 10, cx + cr * 0.3, yy + cr * 0.2, cx + cr * 1.1, yy - cr * 0.2);
      c.stroke();
    }
    c.restore();
    // the sky around it goes black
    const blk = clamp((dive - 0.4) / 0.6);
    c.save();
    c.beginPath();
    c.rect(0, 0, W, H);
    c.arc(cx, cy, cr, 0, Math.PI * 2, true);
    c.fillStyle = rgba("#000000", blk);
    c.fill("evenodd");
    c.restore();
  }
  bloom(c, lit, 0.5, 30);
  vignette(c, 0.4, "#000000");
  grain(c, t, 0.18);
  void glow;
}
