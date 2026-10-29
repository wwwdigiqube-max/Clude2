// World: the holy place inside the tent — veil, lampstand, incense, the ark, the glory coming down (from video 19).
import { applyCam, bloom, Ctx, H, layer, W } from "../engine/canvas";
import { CloudPal, clouds, shaft } from "../engine/depth";
import { glow, motes, painterly, sparkles, vignette } from "../engine/fx";
import { lerp, rgba, TAU } from "../engine/math";

/** sh 0..1 = the shaft of glory coming down. The throne room on earth: inside the tent — veils with gold borders, a floor in perspective, the lampstand,
 *  incense rising, the ark under the wings of the cherubim, the glory coming down as a shaft of light */
const INCENSE: CloudPal = { shade: "#6a3a2a", mid: "#d8a070", lit: "#fff0d0", gamma: 1.0 };
export function holyPlace(c: Ctx, t: number, sh = 0) {
  painterly(c, t, "#2a1720", "#5a3020", [{ x: 960, y: 420, r: 700, c: "#ffcf80", a: 0.8 }, { x: 960, y: 900, r: 700, c: "#3a1e1a", a: 0.7 }], 98);
  const lit = layer("holy-lit", 0.5);
  const cam = { x: 960 + Math.sin(t * 0.08) * 16, y: 540, z: 1.02 + 0.02 * Math.sin(t * 0.05) };
  c.save();
  applyCam(c, cam);
  // the inner veil at the back: deep blue-purple-scarlet weave with a gold border and woven cherubim
  const vg = c.createLinearGradient(0, 240, 0, 700);
  vg.addColorStop(0, "#3a1e4a");
  vg.addColorStop(1, "#5a2034");
  c.fillStyle = vg;
  c.fillRect(470, 230, 980, 470);
  c.strokeStyle = rgba("#000000", 0.18);
  c.lineWidth = 10;
  for (let x = 500; x < 1450; x += 46) {
    c.beginPath();
    c.moveTo(x + Math.sin(t * 0.4 + x) * 2, 230);
    c.lineTo(x + 6, 700);
    c.stroke();
  }
  c.strokeStyle = rgba("#e9c46a", 0.55);
  c.lineWidth = 6;
  c.strokeRect(490, 250, 940, 430);
  c.lineWidth = 1.5;
  for (const sx of [620, 1300]) {
    c.beginPath();
    for (let i = 0; i <= 20; i++) {
      const u = i / 20;
      const xx = sx + (sx < 960 ? 1 : -1) * Math.sin(u * Math.PI) * 110, yy = 300 + u * 280;
      i ? c.lineTo(xx, yy) : c.moveTo(xx, yy);
    }
    c.stroke();
  }
  // the floor: boards running toward the ark (perspective)
  const fg = c.createLinearGradient(0, 700, 0, 1100);
  fg.addColorStop(0, "#6a3a22");
  fg.addColorStop(1, "#24120c");
  c.fillStyle = fg;
  c.fillRect(-100, 700, 2120, 500);
  c.strokeStyle = rgba("#000000", 0.25);
  c.lineWidth = 1.5;
  for (let i = -14; i <= 14; i++) {
    c.beginPath();
    c.moveTo(960 + i * 36, 700);
    c.lineTo(960 + i * 170, 1150);
    c.stroke();
  }
  // side curtains in the foreground with folds (they frame the view)
  for (const sd of [-1, 1]) {
    const x0 = sd < 0 ? -40 : W - 360;
    const cg = c.createLinearGradient(x0, 0, x0 + 400, 0);
    for (let i = 0; i <= 10; i++) cg.addColorStop(i / 10, i % 2 ? "#5a2244" : "#3a1430");
    c.fillStyle = cg;
    c.fillRect(x0, -40, 400, H + 80);
    c.fillStyle = rgba("#e9c46a", 0.5);
    c.fillRect(sd < 0 ? x0 + 392 : x0, -40, 8, H + 80);
  }
  // the lampstand on the left: seven flames flickering
  c.strokeStyle = "#d9a83a";
  c.lineWidth = 6;
  c.lineCap = "round";
  const lx = 560, ly = 760;
  c.beginPath();
  c.moveTo(lx, ly);
  c.lineTo(lx, ly - 200);
  c.stroke();
  c.lineWidth = 4;
  for (let i = 1; i <= 3; i++) {
    c.beginPath();
    c.arc(lx, ly - 200, i * 34, Math.PI * 0.02, Math.PI * 0.98);
    c.stroke();
  }
  for (let i = -3; i <= 3; i++) {
    const fx = lx + i * 34, fy = ly - 200 - (i === 0 ? 0 : 0) - 8;
    const fl = 0.8 + 0.2 * Math.sin(t * 9 + i * 1.7) * Math.sin(t * 6.1 + i);
    c.save();
    c.globalCompositeOperation = "screen";
    glow(c, fx, fy - 14, 46 * fl, "#ffb050", 0.6);
    c.fillStyle = "#fff0c0";
    c.beginPath();
    c.ellipse(fx + Math.sin(t * 4 + i) * 1.5, fy - 12, 5 * fl, 13 * fl, 0, 0, TAU);
    c.fill();
    c.restore();
  }
  // incense rising from the altar, slowly
  const ri = (t * 0.03) % 1;
  clouds(c, t, [{ name: "tower", x: 1330, y: lerp(560, 380, ri), w: 420, a: Math.sin(ri * Math.PI) * 0.35, crop: [0.2, 0.1, 0.6, 0.8] }], INCENSE, 1);
  c.fillStyle = "#c99a3c";
  c.fillRect(1300, 650, 60, 110);
  c.fillStyle = "#e9c46a";
  c.fillRect(1292, 644, 76, 10);
  // the ark: gold with a lighter lid, rings and poles
  const ag = c.createLinearGradient(0, 700, 0, 840);
  ag.addColorStop(0, "#f0cf6a");
  ag.addColorStop(1, "#9a6a20");
  c.fillStyle = ag;
  c.fillRect(800, 700, 320, 140);
  c.strokeStyle = rgba("#fff0b0", 0.6);
  c.lineWidth = 2;
  c.strokeRect(812, 712, 296, 116);
  c.fillStyle = "#ffe08a";
  c.fillRect(780, 690, 360, 18);
  c.fillStyle = "#b8862a";
  c.fillRect(720, 800, 480, 10);
  // wings of the cherubim meeting above, with feather lines
  for (const sd of [-1, 1]) {
    const wg = c.createLinearGradient(960 + sd * 200, 560, 960, 690);
    wg.addColorStop(0, "#ffe9a0");
    wg.addColorStop(1, "#c9962e");
    c.fillStyle = wg;
    c.beginPath();
    c.moveTo(960 + sd * 150, 690);
    c.quadraticCurveTo(960 + sd * 230, 540, 960 + sd * 16, 596);
    c.quadraticCurveTo(960 + sd * 120, 640, 960 + sd * 150, 690);
    c.fill();
    c.strokeStyle = rgba("#7a4a10", 0.35);
    c.lineWidth = 1.5;
    for (let i = 1; i < 6; i++) {
      c.beginPath();
      c.moveTo(960 + sd * (150 - i * 6), 690 - i * 4);
      c.quadraticCurveTo(960 + sd * (200 - i * 18), 590 + i * 4, 960 + sd * (30 + i * 12), 604 + i * 6);
      c.stroke();
    }
  }
  c.save();
  c.globalCompositeOperation = "screen";
  glow(c, 960, 520, 300 + 20 * Math.sin(t * 1.4), "#fff0c8", 0.6);
  c.restore();
  glow(lit, 960, 520, 220, "#ffffff", 0.7);
  if (sh > 0) {
    shaft(c, t, 960, -60, 960, lerp(-40, 720, sh), 60, 150, "#fff3d6", 0.5 * sh, 40, 101);
    glow(lit, 960, 680, 180, "#ffffff", sh);
  }
  sparkles(c, t, [700, 300, 520, 420], 14, 99, 1, "#fff3d0", 9);
  c.restore();
  motes(c, t, { n: 30, color: "#fff0c8", alpha: 0.5, seed: 100, speed: 0.6, dust: true });
  bloom(c, lit, 1.1, 60);
  vignette(c, 0.5, "#140808");
}
