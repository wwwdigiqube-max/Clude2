// Backdrops: warm heaven-light and lilac heaven, both with real clouds (screen space; from video 19's opening).
import { Ctx, H, W } from "../engine/canvas";
import { CloudPal, clouds, godRays } from "../engine/depth";
import { motes, painterly, ribbons, stars } from "../engine/fx";

/** warm heaven-light world (inside the metaballs): peach sky, soft real clouds in two depths, rays from above */
const WARM_NEAR: CloudPal = { shade: "#e49890", mid: "#f7c4a4", lit: "#fff7ea", gamma: 0.9 };
const WARM_FAR: CloudPal = { shade: "#f0b09c", mid: "#f8d2b4", lit: "#fff4e4", gamma: 1.1 };
export function warmBg(c: Ctx, t: number, a = 1) {
  c.save();
  c.globalAlpha = a;
  painterly(c, t, "#f8c495", "#ec9a88", [
    { x: 960, y: 520, r: 760, c: "#ffe2a8", a: 0.75 },
    { x: 260, y: 900, r: 620, c: "#e889a0", a: 0.55 },
    { x: 1700, y: 120, r: 600, c: "#ffb27c", a: 0.6 },
    { x: 1750, y: 950, r: 520, c: "#f19bb0", a: 0.45 },
    { x: 200, y: 120, r: 520, c: "#ffe2a6", a: 0.6 },
  ], 7);
  const dx = Math.sin(t * 0.05) * 20;
  c.save();
  c.translate(dx * 0.4, 0);
  clouds(c, t, [
    { name: "field", x: 960, y: 930, w: 2300, a: 0.55, sp: 3, crop: [0, 0.05, 1, 0.7] },
    { name: "cu2", x: 1500, y: 170, w: 1300, a: 0.5, sp: 2, flip: true },
  ], WARM_FAR, a, [-900, 2800]);
  c.restore();
  c.save();
  c.translate(dx, 0);
  clouds(c, t, [
    { name: "cu3", x: 240, y: 150, w: 1100, a: 0.8, sp: 4 }, { name: "cu1", x: 1780, y: 320, w: 1000, a: 0.7, sp: 3.5, flip: true },
    { name: "cu4", x: 120, y: 1020, w: 1100, a: 0.6, sp: 5, crop: [0, 0, 1, 0.75] },
  ], WARM_NEAR, a, [-900, 2800]);
  c.restore();
  godRays(c, t, 960, -60, { n: 16, len: 1300, spread: 1.6, dir: Math.PI / 2, color: "#fff4dc", alpha: 0.2 * a, width: 0.09, spin: 0, seed: 23, soft: 16 });
  motes(c, t, { n: 34, color: "#fff7dc", alpha: 0.5, seed: 11, dust: true });
  c.restore();
}
/** lavender sky: real clouds graded lilac in two depths, light ribbons, faint stars */
const LAV_NEAR: CloudPal = { shade: "#6a5ad0", mid: "#ad9ef0", lit: "#f8f2ff", gamma: 0.95 };
const LAV_FAR: CloudPal = { shade: "#8676dc", mid: "#b8acf2", lit: "#efe8ff", gamma: 1.1 };
export function lavBg(c: Ctx, t: number, a = 1) {
  if (a <= 0.002) return;
  c.save();
  c.globalAlpha = a;
  painterly(c, t, "#8d86f0", "#b48be8", [
    { x: 960, y: 480, r: 700, c: "#c9b8ff", a: 0.7 },
    { x: 200, y: 900, r: 620, c: "#7d6ee0", a: 0.6 },
    { x: 1700, y: 200, r: 600, c: "#a68cf2", a: 0.6 },
  ], 4);
  stars(c, t, [0, 0, W, H], 70, 4, 0.5 * a);
  clouds(c, t, [
    { name: "field", x: 960, y: 960, w: 2300, a: 0.6, sp: 3, crop: [0, 0.05, 1, 0.7] },
    { name: "cu5", x: 1650, y: 140, w: 1200, a: 0.45, sp: 2 },
  ], LAV_FAR, a, [-900, 2800]);
  clouds(c, t, [
    { name: "cu3", x: 180, y: 130, w: 1050, a: 0.75, sp: 4 }, { name: "cu1", x: 1820, y: 860, w: 1000, a: 0.65, sp: 3.5, flip: true },
    { name: "cu2", x: 160, y: 900, w: 900, a: 0.6, sp: 4.5, crop: [0, 0.3, 1, 0.7] },
  ], LAV_NEAR, a, [-900, 2800]);
  ribbons(c, t, [{ x0: 1100, y0: -50, x1: 1950, y1: 420, bend: 160 }, { x0: -60, y0: 640, x1: 700, y1: 1130, bend: -140 }], "#f0e8ff", 0.2 * a);
  motes(c, t, { n: 26, color: "#ffffff", alpha: 0.4, seed: 12, dust: true });
  c.restore();
}

