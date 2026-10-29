// World: a lilac sky in three cloud depths, the throne of light far above, the earth's curve below (from video 19).
import { applyCam, Cam, Ctx, H, W } from "../engine/canvas";
import { CloudPal, clouds, godRays, nebula, ridge, ridgePts, starsDeep } from "../engine/depth";
import { P } from "../engine/figure";
import { glow, sparkles } from "../engine/fx";
import { lightBeing, lightCore } from "../engine/light";
import { clamp, lerp, rgba, rng, TAU } from "../engine/math";
const par = (cam: Cam, f: number): Cam => ({ x: 960 + (cam.x - 960) * f, y: 540 + (cam.y - 540) * f, z: 1 + (cam.z - 1) * f });

/** the throne of light, far above: rays turning behind it, a bow of colours, a pointed arch with gold edges,
 *  steps, and the seated figure of light inside it */
export function throne(c: Ctx, lit: Ctx | null, x: number, y: number, s: number, t: number, k0 = 1) {
  if (k0 <= 0.002) return;
  godRays(c, t, x, y - 60 * s, { n: 22, len: 900 * s, color: "#fff2e0", alpha: 0.22 * k0, width: 0.12, spin: 0.01, seed: 17, soft: 10 });
  c.save();
  c.globalCompositeOperation = "screen";
  glow(c, x, y - 50 * s, 330 * s, "#efe6ff", 0.5 * k0);
  // the bow of colours (Ezekiel 1:28), faint
  const cols = ["#ff9ab0", "#ffc27a", "#fff08a", "#9ff0b0", "#8fd0ff", "#b9a8ff"];
  c.lineWidth = 9 * s;
  cols.forEach((col, i) => {
    c.strokeStyle = rgba(col, 0.16 * k0);
    c.beginPath();
    c.arc(x, y + 20 * s, (230 + i * 10) * s, Math.PI * 1.05, Math.PI * 1.95);
    c.stroke();
  });
  c.restore();
  c.save();
  c.globalAlpha = k0;
  // arch body: pale violet glass, gold edge
  const arch = new Path2D();
  arch.moveTo(x - 50 * s, y + 60 * s);
  arch.lineTo(x - 50 * s, y - 40 * s);
  arch.quadraticCurveTo(x - 50 * s, y - 104 * s, x, y - 146 * s);
  arch.quadraticCurveTo(x + 50 * s, y - 104 * s, x + 50 * s, y - 40 * s);
  arch.lineTo(x + 50 * s, y + 60 * s);
  arch.closePath();
  const g = c.createLinearGradient(x, y - 140 * s, x, y + 60 * s);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(1, "#cfc0ff");
  c.fillStyle = g;
  c.fill(arch);
  c.strokeStyle = "#ffd98a";
  c.lineWidth = 3 * s;
  c.shadowColor = "#ffd98a";
  c.shadowBlur = 10 * s * c.getTransform().a;
  c.stroke(arch);
  c.shadowBlur = 0;
  // steps
  c.fillStyle = "#f4eeff";
  c.fillRect(x - 74 * s, y + 54 * s, 148 * s, 13 * s);
  c.fillRect(x - 96 * s, y + 70 * s, 192 * s, 12 * s);
  c.strokeRect(x - 74 * s, y + 54 * s, 148 * s, 13 * s);
  c.strokeRect(x - 96 * s, y + 70 * s, 192 * s, 12 * s);
  c.restore();
  lightBeing(c, lit, { x, y: y + 52 * s, h: 120 * s, t, k: k0 * 0.95, pose: SEATED, warm: 0.3, rays: 0.6, aura: 0.6, seed: 5, pool: 0 });
  lightCore(c, lit, x, y - 60 * s, 60 * s, k0 * (0.35 + 0.1 * Math.sin(t * 1.3)), "#d8ccff", t);
  sparkles(c, t, [x - 240 * s, y - 280 * s, 480 * s, 380 * s], 12, 404, k0, "#ffffff", 9 * s);
}
const SEATED = P({ hipY: 0.3, torso: -0.02, head: 0.02, thF: 1.45, shF: 0.05, thB: 1.4, shB: 0.0, arF: 0.75, elF: 0.6, arB: 0.6, elB: 0.6 });

/** the earth's curve: land with depth (far hazy hills → near green slopes), an atmosphere glowing on its rim */
const EARTH_R = 1860, EARTH_C: [number, number] = [960, 2650];
export function earth(c: Ctx, t: number) {
  // atmosphere: a soft bright band hugging the curve
  c.save();
  c.globalCompositeOperation = "screen";
  for (const [w, a] of [[90, 0.25], [36, 0.35], [10, 0.5]] as const) {
    c.strokeStyle = rgba("#ffe6d8", a);
    c.lineWidth = w;
    c.filter = "blur(" + (w * 0.4 * c.getTransform().a).toFixed(1) + "px)";
    c.beginPath();
    c.arc(EARTH_C[0], EARTH_C[1], EARTH_R + w * 0.3, Math.PI * 1.15, Math.PI * 1.85);
    c.stroke();
  }
  c.restore();
  c.save();
  c.beginPath();
  c.arc(EARTH_C[0], EARTH_C[1], EARTH_R, 0, TAU);
  c.clip();
  const g = c.createLinearGradient(0, 740, 0, 1100);
  g.addColorStop(0, "#f0c49a");
  g.addColorStop(0.18, "#d98e8a");
  g.addColorStop(0.5, "#7a4a6a");
  g.addColorStop(1, "#3a2442");
  c.fillStyle = g;
  c.fillRect(-500, 700, 2900, 900);
  // rolling land in bands: hazy far, deeper near
  ridge(c, { y0: 812, amp: 26, freq: 0.004, seed: 41, color: "#c9879a", haze: "#ffd9c8", hazeA: 0.5, sharp: 0.2, rim: "#ffe9d8", rimA: 0.35, rimW: 1.5, x0: -200, x1: 2200 });
  ridge(c, { y0: 850, amp: 30, freq: 0.0035, seed: 42, color: "#8a9a7a", haze: "#e8c8c0", hazeA: 0.35, sharp: 0.1, rim: "#f0ffd8", rimA: 0.35, rimW: 1.5, x0: -200, x1: 2200 });
  ridge(c, { y0: 905, amp: 34, freq: 0.003, seed: 43, color: "#5e8a64", sharp: 0.1, rim: "#d8ffc0", rimA: 0.3, rimW: 2, x0: -200, x1: 2200 });
  ridge(c, { y0: 980, amp: 30, freq: 0.0028, seed: 44, color: "#3f6a50", sharp: 0.1, x0: -200, x1: 2200 });
  // small trees along the near bands
  const r = rng(45);
  for (let i = 0; i < 40; i++) {
    const x = r() * 2000 - 40, near = r() < 0.5;
    const band = near ? 905 : 850;
    const yy = ridgePts({ y0: band, amp: near ? 34 : 30, freq: near ? 0.003 : 0.0035, seed: near ? 43 : 42, sharp: 0.1, x0: -200, x1: 2200 });
    const yi = yy[Math.max(0, Math.min(yy.length - 1, Math.round((x + 200) / 14)))][1];
    const sz = near ? 9 + r() * 6 : 5 + r() * 4;
    const sw = Math.sin(t * 0.8 + i) * 0.6;
    c.fillStyle = near ? "#2f5a44" : "#56786a";
    c.beginPath();
    c.ellipse(x + sw, yi - sz * 1.2, sz * 0.7, sz * 1.3, 0, 0, TAU);
    c.fill();
  }
  c.restore();
  // the rim line of the world, catching the light
  c.save();
  c.strokeStyle = rgba("#ffffff", 0.35);
  c.lineWidth = 2;
  c.beginPath();
  c.arc(EARTH_C[0], EARTH_C[1], EARTH_R, Math.PI * 1.2, Math.PI * 1.8);
  c.stroke();
  c.restore();
}
/** the sky: violet above → lilac → warm haze at the horizon; real clouds in three depths (graded lilac) */
const CL_NEAR: CloudPal = { shade: "#5a4a9a", mid: "#a898e0", lit: "#fff6f2", gamma: 0.95 };
const CL_MID: CloudPal = { shade: "#6e60b0", mid: "#b0a2e6", lit: "#f6eeff", gamma: 1.05 };
const CL_FAR: CloudPal = { shade: "#8a7cc8", mid: "#bcb0ec", lit: "#f2ecff", gamma: 1.15 };
export function skyBack(c: Ctx, t: number, cam: Cam) {
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#4a3ca8");
  g.addColorStop(0.45, "#8f7fe0");
  g.addColorStop(0.8, "#d6b4ec");
  g.addColorStop(1, "#f2c8d8");
  c.fillStyle = g;
  c.fillRect(-20, -20, W + 40, H + 40);
  nebula(c, t, ["#6a5ad0", "#9a7ae0", "#ffffff"], 0.18, 31, 0.6);
  starsDeep(c, t, 120, 61, 0.45 * (1 - 0.5 * clamp((cam.z - 0.85) * 2)), (cam.x - 960) * 0.3, (cam.y - 300) * 0.3);
  // far clouds near the horizon (they barely move with the camera)
  c.save();
  applyCam(c, par(cam, 0.35));
  clouds(c, t, [
    { name: "field", x: 420, y: 720, w: 1500, a: 0.7, sp: 2, crop: [0, 0.1, 1, 0.65] },
    { name: "field", x: 1560, y: 700, w: 1500, a: 0.7, flip: true, sp: 2, crop: [0, 0.1, 1, 0.65] },
  ], CL_FAR, 1, [-700, 2600]);
  c.restore();
  // mid clouds
  c.save();
  applyCam(c, par(cam, 0.7));
  clouds(c, t, [
    { name: "cu3", x: 240, y: 330, w: 1050, sp: 4 }, { name: "cu1", x: 1700, y: 300, w: 1150, flip: true, sp: 3 },
    { name: "cu2", x: 960, y: 520, w: 1300, a: 0.8, sp: 2.5 },
  ], CL_MID, 1, [-800, 2700]);
  c.restore();
}
/** high clouds around the throne: they slide in while it «stays out of reach» */
export function throneClouds(c: Ctx, t: number, veil: number) {
  clouds(c, t, [
    { name: "cu5", x: lerp(-700, -60, veil), y: -150, w: 1400 }, { name: "cu4", x: lerp(2650, 1980, veil), y: -170, w: 1450, flip: true },
    { name: "cu3", x: lerp(-500, 520, veil), y: 40, w: 1100, a: 0.9 }, { name: "cu1", x: lerp(2400, 1420, veil), y: 60, w: 1100, a: 0.9 },
  ], CL_NEAR, 1);
}

