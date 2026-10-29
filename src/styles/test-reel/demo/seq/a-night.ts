// A · «میدونی، همیشه با خودم فکر میکردم» (0 → 3.0) — r5: a dark bedroom, someone in bed, the head a glowing
// TV-static silhouette, window-blind light falling across pillow and blanket. Blanket and pillow are a lit
// height field (real-looking folds, not drawn lines). The camera creeps in, then dives into the static.
import { applyCam, bloom, Ctx, H, layer, matchTransform, W } from "../../lib/canvas";
import { glow, grain, motes, vignette } from "../../lib/fx";
import { clamp, ease, fbm, k, rgba, rng } from "../../lib/math";
import { Wd } from "../cues";

const HEAD = { x: 548, y: 860, s: 112 };
/** bust silhouette (head with ears, neck, shoulders sinking into the pillow) — one direction, no self-cancelling */
function bust(c: Ctx, x: number, y: number, s: number) {
  c.beginPath();
  c.moveTo(x + s * 0.3, y + s * 0.7);
  c.bezierCurveTo(x + s * 0.72, y + s * 0.5, x + s * 0.8, y + s * 0.1, x + s * 0.76, y - s * 0.2);
  c.bezierCurveTo(x + s * 0.88, y - s * 0.12, x + s * 0.9, y + s * 0.16, x + s * 0.8, y + s * 0.26);
  c.bezierCurveTo(x + s * 0.86, y - s * 0.55, x + s * 0.55, y - s * 1.02, x, y - s * 1.02);
  c.bezierCurveTo(x - s * 0.55, y - s * 1.02, x - s * 0.86, y - s * 0.55, x - s * 0.8, y + s * 0.26);
  c.bezierCurveTo(x - s * 0.9, y + s * 0.16, x - s * 0.88, y - s * 0.12, x - s * 0.76, y - s * 0.2);
  c.bezierCurveTo(x - s * 0.8, y + s * 0.1, x - s * 0.72, y + s * 0.5, x - s * 0.3, y + s * 0.7);
  c.bezierCurveTo(x - s * 0.34, y + s * 1.05, x - s * 0.7, y + s * 1.2, x - s * 1.5, y + s * 1.38);
  c.bezierCurveTo(x - s * 2.1, y + s * 1.52, x - s * 2.3, y + s * 1.9, x - s * 2.3, y + s * 2.4);
  c.lineTo(x + s * 2.3, y + s * 2.4);
  c.bezierCurveTo(x + s * 2.3, y + s * 1.9, x + s * 2.1, y + s * 1.52, x + s * 1.5, y + s * 1.38);
  c.bezierCurveTo(x + s * 0.7, y + s * 1.2, x + s * 0.34, y + s * 1.05, x + s * 0.3, y + s * 0.7);
  c.closePath();
}
let NOISE: HTMLCanvasElement | null = null;
/** TV static at 12 fps (deterministic per frame) */
export function staticTile(t: number, bias = 0) {
  if (!NOISE) {
    NOISE = document.createElement("canvas");
    NOISE.width = 180;
    NOISE.height = 320;
  }
  const x = NOISE.getContext("2d")!;
  const img = x.createImageData(NOISE.width, NOISE.height);
  const r = rng(Math.floor(t * 12) * 7919 + 13);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = clamp(r() * 1.1 + bias - 0.05) * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  return NOISE;
}

// ---- the bed as lit height fields (1/4 resolution, smoothed when drawn): back = wall + pillow, front = blanket ----
const BW = 300, BH = 520, SC = 4; // covers x -60..1140, y 160..2240 in design px
const OX = -60, OY = 160;
const TOP = (X: number) => 1000 + 26 * Math.sin(X * 0.004 + 1.3) + 10 * Math.sin(X * 0.013);
/** soft ridges along segments: cloth folds draped from the body to the sides */
const WRINKLES = (() => {
  const r = rng(77);
  const w: { x0: number; y0: number; x1: number; y1: number; wd: number; amp: number }[] = [];
  for (let i = 0; i < 16; i++) {
    const side = i % 2 ? 1 : -1, y0 = 1080 + r() * 900, x0 = 548 + side * (40 + r() * 90);
    w.push({ x0, y0, x1: x0 + side * (220 + r() * 380), y1: y0 + 80 + r() * 320, wd: 22 + r() * 40, amp: 0.18 + r() * 0.4 });
  }
  for (let i = 0; i < 5; i++) {
    const x0 = 120 + r() * 800;
    w.push({ x0, y0: 1040 + r() * 40, x1: x0 + 120 + r() * 200, y1: 1060 + r() * 70, wd: 14 + r() * 14, amp: 0.2 + r() * 0.2 });
  }
  return w;
})();
function segDist(px: number, py: number, w: { x0: number; y0: number; x1: number; y1: number }) {
  const vx = w.x1 - w.x0, vy = w.y1 - w.y0, l2 = vx * vx + vy * vy;
  const u = clamp(((px - w.x0) * vx + (py - w.y0) * vy) / l2);
  return [Math.hypot(px - (w.x0 + vx * u), py - (w.y0 + vy * u)), u] as const;
}
let BACK: HTMLCanvasElement | null = null, FRONT: HTMLCanvasElement | null = null;
const LGT = [0.55, -0.55, 0.62];
function shadeInto(img: ImageData, hgt: Float32Array, mask: Float32Array, base: number, t: number, wall: boolean) {
  for (let j = 1; j < BH - 1; j++) {
    for (let i = 1; i < BW - 1; i++) {
      const o = j * BW + i;
      const X = OX + i * SC, Y = OY + j * SC;
      let v: number;
      if (wall && mask[o] <= 0) v = 9 + 9 * (Y / 1100);
      else {
        const gx = (hgt[o + 1] - hgt[o - 1]) * 3.2, gy = (hgt[o + BW] - hgt[o - BW]) * 3.2;
        const nl = Math.hypot(gx, gy, 1);
        const dif = Math.max(0, (-gx * LGT[0] - gy * LGT[1] + LGT[2]) / nl);
        v = base * (0.22 + 0.9 * dif) * (0.62 + 0.5 * Math.max(0, hgt[o]));
      }
      // window-blind light: diagonal bands from the upper right
      const g1 = (X * 0.62 + Y * 0.78) * 0.016 + t * 0.05;
      const band = Math.max(0, Math.sin(g1)) ** 6 * Math.exp(-((((X * 0.78 - Y * 0.62) + 180) / 520) ** 2));
      v *= 1 + (wall && mask[o] <= 0 ? 0.6 : 1.5) * band * clamp((1350 - Y) / 300);
      img.data[o * 4] = v * 0.97;
      img.data[o * 4 + 1] = v;
      img.data[o * 4 + 2] = v * 1.05;
      img.data[o * 4 + 3] = wall ? 255 : 255 * clamp(mask[o]);
    }
  }
}
function bedFields(t: number) {
  if (!BACK) {
    BACK = document.createElement("canvas");
    FRONT = document.createElement("canvas");
    BACK.width = FRONT!.width = BW;
    BACK.height = FRONT!.height = BH;
  }
  const br = 1 + 0.015 * Math.sin(t * 1.4);
  const hB = new Float32Array(BW * BH), mB = new Float32Array(BW * BH);
  const hF = new Float32Array(BW * BH), mF = new Float32Array(BW * BH);
  for (let j = 0; j < BH; j++) {
    for (let i = 0; i < BW; i++) {
      const o = j * BW + i, X = OX + i * SC, Y = OY + j * SC;
      // pillow: soft rounded slab with creases
      const px = (X - 560) / 420, py = (Y - 905) / 190, d = Math.pow(Math.abs(px), 2.6) + Math.pow(Math.abs(py), 2.2);
      if (d < 1) {
        hB[o] = 0.75 * Math.pow(1 - d, 0.45) + 0.05 * Math.sin(X * 0.035 + Y * 0.02) * (1 - d) - 0.18 * Math.exp(-(((X - 548) / 140) ** 2 + ((Y - 900) / 120) ** 2));
        mB[o] = clamp((1 - d) * 8);
      }
      // blanket: the body under it + draped folds + a rolled top edge
      const top = TOP(X);
      if (Y > top - 8) {
        const along = (Y - top) / 1100, cxb = 548 + 30 * along;
        let h = 0.95 * br * Math.exp(-(((X - cxb) / (210 + 170 * along)) ** 2)) * (1 - 0.25 * along);
        for (const w of WRINKLES) {
          const [dd, u] = segDist(X, Y, w);
          h += w.amp * Math.exp(-((dd / w.wd) ** 2)) * Math.sin(Math.PI * clamp(u * 1.15)) ;
        }
        h += 0.18 * (fbm(X * 0.0035, Y * 0.0035, 3) - 0.5);
        h += 0.35 * Math.exp(-(((Y - top - 22) / 26) ** 2));
        hF[o] = h;
        mF[o] = clamp((Y - top + 8) / 8);
      }
    }
  }
  const ib = BACK.getContext("2d")!.createImageData(BW, BH), iff = FRONT!.getContext("2d")!.createImageData(BW, BH);
  shadeInto(ib, hB, mB, 62, t, true);
  shadeInto(iff, hF, mF, 40, t, false);
  BACK.getContext("2d")!.putImageData(ib, 0, 0);
  FRONT!.getContext("2d")!.putImageData(iff, 0, 0);
  return [BACK, FRONT!] as const;
}

export function seqA(c: Ctx, t: number) {
  const think = k(t, Wd(1, "فکر") - 0.15, Wd(1, "فکر") + 0.5, ease.out);
  const dive = k(t, 2.35, 3.0, ease.in);
  const cam = { x: HEAD.x + 10 * Math.sin(t * 0.4), y: HEAD.y + 150 * (1 - dive) - 10, z: (1.02 + 0.08 * k(t, 0, 2.4, ease.inOutSine)) * (1 + 7 * dive) };
  c.save();
  c.fillStyle = "#060606";
  c.fillRect(0, 0, W, H);
  applyCam(c, cam);
  const [back, front] = bedFields(t);
  c.save();
  c.imageSmoothingEnabled = true;
  c.imageSmoothingQuality = "high";
  c.drawImage(back, OX, OY, BW * SC, BH * SC);
  c.restore();
  // the head: static, glowing
  const lit = layer("a-lit", 0.5);
  const bright = 0.78 + 0.22 * think + 0.06 * Math.sin(t * 9);
  c.save();
  bust(c, HEAD.x, HEAD.y, HEAD.s);
  c.clip();
  c.fillStyle = "#d6d6d6";
  c.fillRect(HEAD.x - 400, HEAD.y - 300, 800, 700);
  c.globalCompositeOperation = "multiply";
  c.drawImage(staticTile(t, 0.28 + 0.2 * think), HEAD.x - 260, HEAD.y - 140, 520, 720);
  c.globalCompositeOperation = "screen";
  c.fillStyle = rgba("#ffffff", 0.22 * think);
  c.fillRect(HEAD.x - 400, HEAD.y - 300, 800, 700);
  c.globalCompositeOperation = "source-over";
  // only the head and neck glow: the shoulders stay a dark silhouette with a faint rim of the static
  const sg = c.createLinearGradient(0, HEAD.y + 70, 0, HEAD.y + 150);
  sg.addColorStop(0, rgba("#0c0c0c", 0));
  sg.addColorStop(1, rgba("#0c0c0c", 0.96));
  c.fillStyle = sg;
  c.fillRect(HEAD.x - 400, HEAD.y + 70, 800, 400);
  c.restore();
  lit.save();
  matchTransform(lit, c);
  bust(lit, HEAD.x, HEAD.y, HEAD.s);
  lit.fillStyle = rgba("#ffffff", 0.5 * bright);
  lit.fill();
  lit.restore();
  c.save();
  c.imageSmoothingEnabled = true;
  c.imageSmoothingQuality = "high";
  c.drawImage(front, OX, OY, BW * SC, BH * SC);
  c.restore();
  c.save();
  c.globalCompositeOperation = "screen";
  glow(c, HEAD.x, HEAD.y - 10, 340, "#e8edf2", 0.28 * bright);
  glow(c, HEAD.x, HEAD.y - 20, 150, "#ffffff", 0.2 * bright);
  c.restore();
  c.restore();
  motes(c, t, { n: 40, color: "#e8edf2", alpha: 0.32, seed: 5, speed: 0.25, dust: true, area: [300, 300, 1000, 1000] });
  bloom(c, lit, 0.7, 44);
  vignette(c, 0.75, "#000000");
  // the dive: static takes the whole frame, thinning into scattered points (they become the brain's nodes)
  const fill = k(t, 2.55, 2.85, ease.in) * (1 - k(t, 2.85, 3.05));
  if (fill > 0.001) {
    c.save();
    c.globalAlpha = fill;
    c.imageSmoothingEnabled = false;
    c.drawImage(staticTile(t, 0.1), 0, 0, W, H);
    c.restore();
  }
  grain(c, t, 0.22);
  const fi = 1 - k(t, 0, 0.45);
  if (fi > 0.001) {
    c.fillStyle = rgba("#000000", fi);
    c.fillRect(0, 0, W, H);
  }
}
