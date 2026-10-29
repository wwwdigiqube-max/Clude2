// World: the throne room of Ezekiel 1 (from video 19).
import { applyCam, bloom, blur, Cam, Ctx, layer, matchTransform, paint } from "../engine/canvas";
import { bokeh, CloudPal, clouds, godRays, mist, nebula, starsDeep } from "../engine/depth";
import { P } from "../engine/figure";
import { glow, motes, painterly, sparkles, vignette } from "../engine/fx";
import { lightBeing } from "../engine/light";
import { rgba, TAU } from "../engine/math";

const SEAT = P({ hipY: 0.3, torso: -0.02, head: 0.02, thF: 1.45, shF: 0.05, thB: 1.4, shB: 0.0, arF: 0.75, elF: 0.6, arB: 0.6, elB: 0.6 });

/** the throne vision, complete: storm clouds with flashes, rays, the bow of colours, wheels within wheels, the sea of
 *  glass reflecting the throne, the seated figure of light. cam = slow push (default a gentle drift). */
export function throneRoom(c: Ctx, t: number, cam: Cam = { x: 960, y: 520, z: 1.02 }) {
  const camP = (f: number): Cam => ({ x: 960 + (cam.x - 960) * f + Math.sin(t * 0.06) * 14 * f, y: 520 + (cam.y - 520) * f, z: 1 + (cam.z - 1) * f });
  // deep violet space, a nebula of glory, stars
  painterly(c, t, "#160f3a", "#2c1f5a", [
    { x: 960, y: 420, r: 760, c: "#6a58c8", a: 0.6 },
    { x: 960, y: 950, r: 800, c: "#2a1e5a", a: 0.7 },
    { x: 200, y: 200, r: 500, c: "#3a2c80", a: 0.6 },
    { x: 1720, y: 220, r: 500, c: "#3a2c80", a: 0.6 },
  ], 66);
  nebula(c, t, ["#4a3aa0", "#8a5ac0", "#f0e0ff"], 0.3, 41, 0.7);
  starsDeep(c, t, 160, 67, 0.7, Math.sin(t * 0.06) * 30, 0);
  const lit = layer("throne-lit", 0.5);
  // the storm cloud of Ezekiel 1:4 around the vision (far, slow), lit from within by flashes
  c.save();
  applyCam(c, camP(0.4));
  clouds(c, t, [
    { name: "cu4", x: 260, y: 230, w: 1250, sp: 1.5 }, { name: "cu5", x: 1680, y: 210, w: 1250, flip: true, sp: -1.5 },
    { name: "tower", x: 960, y: 120, w: 900, a: 0.55, crop: [0, 0.05, 1, 0.55] },
  ], STORM, 1);
  for (const [fx, fy, ph] of [[300, 260, 0], [1640, 240, 2.1], [980, 90, 4.2], [520, 120, 5.3]] as const) {
    const fl = Math.pow(Math.max(0, Math.sin(t * 0.83 + ph * 1.7)), 60) + 0.6 * Math.pow(Math.max(0, Math.sin(t * 1.9 + ph)), 90);
    if (fl > 0.01) {
      c.save();
      c.globalCompositeOperation = "screen";
      glow(c, fx, fy, 320, "#e8dcff", 0.55 * fl);
      c.restore();
    }
  }
  c.restore();
  c.save();
  applyCam(c, cam);
  // volumetric rays from behind the throne
  godRays(c, t, 960, 470, { n: 24, len: 1300, color: "#efe6ff", alpha: 0.2, width: 0.11, spin: 0.006, seed: 11, soft: 14 });
  // the bow of colours (Ezekiel 1:28): soft bands with a bright inner edge
  const cols = ["#ff8aa0", "#ffb36b", "#ffe48a", "#8fe0a0", "#7fc8ff", "#a99bff"];
  c.save();
  c.globalCompositeOperation = "screen";
  c.filter = `blur(${(6 * c.getTransform().a).toFixed(1)}px)`;
  cols.forEach((col, i) => {
    c.strokeStyle = rgba(col, 0.28);
    c.lineWidth = 22;
    c.beginPath();
    c.arc(960, 600, 400 + i * 18 + 5 * Math.sin(t * 0.8 + i), Math.PI * 1.03, Math.PI * 1.97);
    c.stroke();
  });
  c.filter = "none";
  c.strokeStyle = rgba("#ffffff", 0.35);
  c.lineWidth = 2;
  c.beginPath();
  c.arc(960, 600, 392, Math.PI * 1.04, Math.PI * 1.96);
  c.stroke();
  c.restore();
  sparkles(c, t, [540, 170, 840, 260], 14, 71, 0.9, "#ffffff", 8);
  // far wheels (smaller, fainter = depth), then the near ones
  ophan(c, t, 700, 560, 62, 0.45, 3);
  ophan(c, t, 1220, 560, 62, 0.45, 4);
  // the sea of glass: a floor in perspective, shimmering, reflecting the throne
  seaOfGlass(c, t);
  ophan(c, t, 450, 690, 125, 1, 1);
  ophan(c, t, 1470, 690, 125, 1, 2);
  // reflection: throne + figure mirrored in the glass
  const Rf = layer("throne-refl", 0.5);
  matchTransform(Rf, c);
  Rf.translate(0, 832 * 2);
  Rf.scale(1, -1);
  throneSeat(Rf, null, t);
  Rf.setTransform(1, 0, 0, 1, 0, 0);
  Rf.globalCompositeOperation = "destination-in";
  const rg = Rf.createLinearGradient(0, Rf.canvas.height * 0.77, 0, Rf.canvas.height);
  rg.addColorStop(0, "rgba(0,0,0,0.55)");
  rg.addColorStop(1, "rgba(0,0,0,0)");
  Rf.fillStyle = rg;
  Rf.fillRect(0, 0, Rf.canvas.width, Rf.canvas.height);
  paint(c, Rf, 0.6, "screen", blur(2.5, 1));
  throneSeat(c, lit, t);
  c.restore();
  motes(c, t, { n: 30, color: "#ffffff", alpha: 0.4, seed: 68, speed: 0.6, dust: true });
  bokeh(c, t, { n: 7, seed: 69, color: "#cfc0ff", alpha: 0.1, size: 70, px: (cam.z - 1) * 600, py: 0, rise: 4 });
  bloom(c, lit, 1, 50);
  vignette(c, 0.45, "#0c0720");
}
const STORM: CloudPal = { shade: "#140c34", mid: "#4a3c94", lit: "#e8deff", gamma: 1.05 };
/** the throne itself (with the seated figure of light): gold-edged violet arch, gems, steps in perspective */
function throneSeat(c: Ctx, lit: Ctx | null, t: number) {
  c.save();
  // steps: three trapezoids getting wider toward us
  for (let i = 0; i < 3; i++) {
    const y0 = 790 + i * 16, w0 = 160 + i * 50, w1 = 180 + i * 56;
    const g = c.createLinearGradient(0, y0, 0, y0 + 16);
    g.addColorStop(0, "#d8ccff");
    g.addColorStop(1, "#5a4aa8");
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(960 - w0, y0);
    c.lineTo(960 + w0, y0);
    c.lineTo(960 + w1, y0 + 16);
    c.lineTo(960 - w1, y0 + 16);
    c.closePath();
    c.fill();
    c.strokeStyle = rgba("#ffd98a", 0.8);
    c.lineWidth = 1.5;
    c.stroke();
  }
  // the seat: deep violet with a lighter inner panel and a gold outline
  const arch = new Path2D();
  arch.moveTo(838, 792);
  arch.lineTo(838, 470);
  arch.quadraticCurveTo(838, 358, 960, 292);
  arch.quadraticCurveTo(1082, 358, 1082, 470);
  arch.lineTo(1082, 792);
  arch.closePath();
  const tg = c.createLinearGradient(960, 300, 960, 800);
  tg.addColorStop(0, "#6a58c0");
  tg.addColorStop(1, "#211a4e");
  c.fillStyle = tg;
  c.fill(arch);
  c.save();
  c.clip(arch);
  const ig = c.createRadialGradient(960, 520, 10, 960, 520, 220);
  ig.addColorStop(0, "rgba(220,205,255,0.55)");
  ig.addColorStop(1, "rgba(120,100,220,0)");
  c.fillStyle = ig;
  c.fillRect(800, 280, 320, 520);
  c.restore();
  c.strokeStyle = "#ffd98a";
  c.lineWidth = 4;
  c.shadowColor = "#ffd98a";
  c.shadowBlur = 12 * c.getTransform().a;
  c.stroke(arch);
  // an inner gold line + armrests
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(856, 780);
  c.lineTo(856, 474);
  c.quadraticCurveTo(856, 372, 960, 314);
  c.quadraticCurveTo(1064, 372, 1064, 474);
  c.lineTo(1064, 780);
  c.stroke();
  c.shadowBlur = 0;
  for (const sd of [-1, 1]) {
    const g = c.createLinearGradient(960 + sd * 130, 690, 960 + sd * 130, 722);
    g.addColorStop(0, "#8a78d8");
    g.addColorStop(1, "#2a2060");
    c.fillStyle = g;
    c.fillRect(sd < 0 ? 790 : 1082, 690, 48, 30);
    c.strokeRect(sd < 0 ? 790 : 1082, 690, 48, 30);
  }
  // gems along the arch, twinkling
  for (let i = 0; i < 9; i++) {
    const u = i / 8, a = Math.PI * (1 + u);
    const gx = 960 + Math.cos(a) * 110, gy = 470 + Math.sin(a) * 160 * (u > 0 && u < 1 ? 1 : 0.2);
    const tw = 0.5 + 0.5 * Math.sin(t * 2 + i * 1.3);
    c.fillStyle = ["#ffe08a", "#9fe8ff", "#ffb0d0"][i % 3];
    c.globalAlpha = 0.7 + 0.3 * tw;
    c.beginPath();
    c.arc(gx, gy, 3.5, 0, TAU);
    c.fill();
    glow(c, gx, gy, 12 + 6 * tw, "#ffffff", 0.4 * tw);
  }
  c.restore();
  lightBeing(c, lit, { x: 960, y: 790, h: 340, t, k: 1, pose: SEAT, warm: 0.35, rays: 1.3, aura: 0.8, seed: 12 });
}
/** the sea of glass before the throne: a perspective floor of faint lines, shimmering light running across it */
function seaOfGlass(c: Ctx, t: number) {
  const yH = 600, yB = 1300, vx = 960;
  const g = c.createLinearGradient(0, yH, 0, 1100);
  g.addColorStop(0, "#d6ccff");
  g.addColorStop(0.25, "#8a7ad8");
  g.addColorStop(1, "#1e1650");
  c.save();
  c.fillStyle = g;
  c.globalAlpha = 0.92;
  c.fillRect(-500, yH, 2900, yB - yH);
  c.globalAlpha = 1;
  // the far edge of the glass dissolves into a bright mist
  mist(c, yH + 6, 46, "#e8e0ff", 0.85);
  // perspective lines converging on the throne (faint, fading out toward the far edge)
  c.strokeStyle = rgba("#ffffff", 0.07);
  c.lineWidth = 1.2;
  for (let i = -16; i <= 16; i++) {
    c.beginPath();
    c.moveTo(vx + i * 14, yH);
    c.lineTo(vx + i * 260, yB);
    c.stroke();
  }
  for (let j = 1; j < 14; j++) {
    const y = yH + 700 / (14 - j + 0.6) * 1.0 - 40;
    if (y < yH + 2) continue;
    c.globalAlpha = Math.min(1, (y - yH) / 260) * 0.6;
    c.beginPath();
    c.moveTo(-500, y);
    c.lineTo(2400, y);
    c.stroke();
  }
  c.globalAlpha = 1;
  // light running over the glass (slow bright bands)
  c.globalCompositeOperation = "screen";
  for (let i = 0; i < 4; i++) {
    const ph = ((t * 0.07 + i * 0.25) % 1);
    const y = yH + Math.pow(ph, 2) * 500;
    const bg = c.createLinearGradient(0, y - 20, 0, y + 20);
    bg.addColorStop(0, "rgba(255,255,255,0)");
    bg.addColorStop(0.5, rgba("#ffffff", 0.18 * Math.sin(ph * Math.PI)));
    bg.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = bg;
    c.fillRect(-500, y - 20, 2900, 40);
  }
  // glow of the throne on the glass
  glow(c, 960, 800, 520, "#efe6ff", 0.35);
  c.restore();
}
/** a wheel of Ezekiel's vision: a wheel within a wheel (two broad rims crossing at right angles) turning slowly
 *  in 3D, the rims full of eyes of light, fire glowing at the hub */
function ophan(c: Ctx, t: number, x: number, y: number, R: number, a: number, seed: number) {
  c.save();
  c.globalCompositeOperation = "screen";
  glow(c, x, y, R * 0.9, "#ffc87a", 0.3 * a);
  glow(c, x, y, R * 0.25, "#fff2d8", 0.6 * a);
  const spin = t * 0.45 + seed, tilt = 0.35 + 0.15 * Math.sin(t * 0.2 + seed), yaw = t * 0.12 + seed * 1.7;
  type P3 = [number, number, number];
  const rim = (axis: 0 | 1): P3[] => {
    const o: P3[] = [];
    for (let j = 0; j <= 96; j++) {
      const th = (j / 96) * TAU + spin * (axis ? -1 : 1);
      // wheel 0 stands in the XY plane, wheel 1 in the YZ plane (crossing it)
      let px = axis ? 0 : Math.cos(th) * R, py = Math.sin(th) * R, pz = axis ? Math.cos(th) * R : 0;
      // yaw (about Y), then tilt (about X)
      const x1 = px * Math.cos(yaw) + pz * Math.sin(yaw), z1 = -px * Math.sin(yaw) + pz * Math.cos(yaw);
      px = x1;
      pz = z1;
      const y2 = py * Math.cos(tilt) - pz * Math.sin(tilt), z2 = py * Math.sin(tilt) + pz * Math.cos(tilt);
      o.push([x + px, y + y2, z2 / R]);
    }
    return o;
  };
  for (const axis of [0, 1] as const) {
    const pts = rim(axis);
    for (let j = 0; j < 96; j++) {
      const [x0, y0, z0] = pts[j], [x1, y1] = pts[j + 1];
      const d = (1 - z0) / 2; // 1 = nearest
      c.strokeStyle = rgba(axis ? "#f6e6c8" : "#efe6ff", a * (0.18 + 0.5 * d));
      c.lineWidth = R * (0.05 + 0.04 * d);
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(x0, y0);
      c.lineTo(x1, y1);
      c.stroke();
    }
    // eyes along the rim (bright pupils of light), brighter on the near side
    for (let j = 0; j < 96; j += 8) {
      const [ex, ey, ez] = pts[j];
      const d = (1 - ez) / 2;
      glow(c, ex, ey, R * (0.07 + 0.06 * d), "#ffffff", a * (0.3 + 0.6 * d));
    }
  }
  c.restore();
}
