// World: the royal glory of Yahweh in human form (from video 19).
import { applyCam, bloom, blur, Ctx, layer, paint } from "../engine/canvas";
import { CloudPal, clouds, godRays, lightPool, nebula } from "../engine/depth";
import { motes, painterly, sparkles, vignette } from "../engine/fx";
import { lightBeing } from "../engine/light";
import { rgba, TAU } from "../engine/math";

const GPAL: CloudPal = { shade: "#1c0a1e", mid: "#7a3a50", lit: "#ffd9b0", gamma: 1.1 };
const GFAR: CloudPal = { shade: "#170a1c", mid: "#4e2440", lit: "#c98a80", gamma: 1.2 };
/** the royal glory: a large warm figure of light on a sea of cloud, towering clouds behind, rays and a crown of fine
 *  rays, blurred near clouds. kk = how present (0..1); tl = local time (clouds drift from where they were placed). */
export function gloryScene(c: Ctx, t: number, kk = 1, tl = 0) {
  painterly(c, t, "#1e0d24", "#3a1a2e", [{ x: 960, y: 520, r: 820, c: "#7a3a4a", a: 0.7 }, { x: 960, y: 300, r: 560, c: "#ffb46a", a: 0.35 }], 120);
  nebula(c, t, ["#6a2a3a", "#a0583a", "#ffd9a0"], 0.3, 21, 0.8);
  const lit = layer("glory-lit", 0.5);
  const cam = { x: 960 + Math.sin(t * 0.07) * 14, y: 540 + Math.cos(t * 0.05) * 8, z: 1 + 0.035 * Math.sin(t * 0.04) };
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
}

