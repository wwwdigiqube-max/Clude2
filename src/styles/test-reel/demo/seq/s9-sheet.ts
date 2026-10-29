// S9 · «اگر از اول این ویدئو رو ببینی و دقت کنی، میتونی در هر لحظه‌ش یک سبک و استایل انیمیشنی متفاوت پیدا کنی»
// (43.4 → 50.1) — r8's frame cards: every style of THIS video as a real frame on a white-bordered card, in a row.
// We arrive from inside card 15 (the recursion), «از اول» rewinds the row to card 01, «دقت کنی» lays a loupe on it,
// «هر لحظه‌ش» hops the loupe frame to frame, «یک سبک … متفاوت» deals the row into a wall of all 18, and we dive into
// the schematic card (white paper → S10).
import { bloom, Ctx, H, layer, matchTransform, scale, setScale, W } from "../../lib/canvas";
import { glow, grain, vignette } from "../../lib/fx";
import { txt } from "../../lib/hud";
import { clamp, ease, k, lerp, rgba } from "../../lib/math";
import { Wd } from "../cues";

export type SnapFn = (c: Ctx, t: number) => void;
let MOMENTS: [SnapFn, number, string][] = [];
/** the director registers what each card shows: [scene, time, style name] */
export const setMoments = (m: [SnapFn, number, string][]) => (MOMENTS = m);
const SNAPS = new Map<number, HTMLCanvasElement>();
export function snap(i: number) {
  let s = SNAPS.get(i);
  if (s) return s;
  const R0 = scale();
  s = document.createElement("canvas");
  s.width = 270;
  s.height = 480;
  const x = s.getContext("2d")!;
  setScale(R0);
  x.setTransform(0.25, 0, 0, 0.25, 0, 0);
  x.fillStyle = "#000";
  x.fillRect(0, 0, W, H);
  try {
    MOMENTS[i][0](x, MOMENTS[i][1]);
  } catch {
    // a scene that cannot draw small just stays black
  }
  SNAPS.set(i, s);
  return s;
}
/** render every card up front: a snapshot drawn in the middle of a scene would re-enter that scene's own layers
 *  (D2's gallery snapshotting D2 itself clobbered its light layer — a ghost of the laptop glow mid-pan) */
export function warmSnaps() {
  for (let i = 0; i < MOMENTS.length; i++) snap(i);
}
const CW = 300, CH = (CW * 16) / 9, GAP = 46;
const WALL = { cols: 6, cw: 132, gx: 158, gy: 300 };
const wallPos = (i: number): [number, number] => [540 + ((i % WALL.cols) - 2.5) * WALL.gx, 960 + (Math.floor(i / WALL.cols) - 1) * WALL.gy];
const rowX = (i: number) => i * (CW + GAP);
function card(c: Ctx, i: number, x: number, y: number, w: number, a: number, flash: number, label = true) {
  const h = (w * 16) / 9;
  c.save();
  c.globalAlpha *= a;
  c.fillStyle = "#f5f5f2";
  c.fillRect(x - w / 2 - w * 0.035, y - h / 2 - w * 0.035, w * 1.07, h + w * 0.07);
  c.drawImage(snap(i), x - w / 2, y - h / 2, w, h);
  if (flash > 0) {
    c.fillStyle = rgba("#ffffff", 0.6 * flash);
    c.fillRect(x - w / 2, y - h / 2, w, h);
  }
  c.restore();
  if (label && w < 200) {
    // small cards (the contact sheet): just the number, centred
    txt(c, `STYLE ${String(i + 1).padStart(2, "0")}`, x, y + h / 2 + 22, { size: 13, weight: 700, ls: 0.18, align: "center", alpha: 0.85 * a });
  } else if (label) {
    txt(c, `STYLE ${String(i + 1).padStart(2, "0")}`, x - w / 2, y + h / 2 + w * 0.14, { size: Math.max(12, w * 0.075), weight: 700, ls: 0.18, alpha: 0.9 * a });
    txt(c, MOMENTS[i]?.[2] ?? "", x + w / 2, y + h / 2 + w * 0.14, { size: Math.max(10, w * 0.055), weight: 500, ls: 0.14, align: "right", alpha: 0.6 * a });
  }
}
function loupe(c: Ctx, x: number, y: number, r: number, mag: number, src: (cc: Ctx) => void, a: number) {
  if (a <= 0.01) return;
  const L = layer("s9-loupe", 1);
  matchTransform(L, c);
  L.save();
  L.translate(x, y);
  L.scale(mag, mag);
  L.translate(-x, -y);
  src(L);
  L.restore();
  c.save();
  c.globalAlpha *= a;
  // drop shadow of the loupe body
  c.fillStyle = rgba("#000000", 0.5);
  c.beginPath();
  c.ellipse(x + r * 0.12, y + r * 0.16, r * 1.1, r * 1.1, 0, 0, Math.PI * 2);
  c.fill();
  c.save();
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.clip();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.drawImage(L.canvas, 0, 0);
  c.restore();
  // glass: chromatic rim + highlight; chrome + black body ring
  const rg = c.createRadialGradient(x, y, r * 0.75, x, y, r);
  rg.addColorStop(0, rgba("#000000", 0));
  rg.addColorStop(1, rgba("#000000", 0.45));
  c.fillStyle = rg;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "#1a1a1a";
  c.lineWidth = r * 0.16;
  c.beginPath();
  c.arc(x, y, r * 1.08, 0, Math.PI * 2);
  c.stroke();
  const ch = c.createLinearGradient(x - r, y - r, x + r, y + r);
  ch.addColorStop(0, "#f2f2f2");
  ch.addColorStop(0.5, "#6d6d6d");
  ch.addColorStop(1, "#e0e0e0");
  c.strokeStyle = ch;
  c.lineWidth = r * 0.045;
  c.beginPath();
  c.arc(x, y, r * 1.0, 0, Math.PI * 2);
  c.stroke();
  c.fillStyle = rgba("#ffffff", 0.18);
  c.beginPath();
  c.ellipse(x - r * 0.35, y - r * 0.45, r * 0.42, r * 0.16, -0.6, 0, Math.PI * 2);
  c.fill();
  c.restore();
}
export function seqS9(c: Ctx, t: number) {
  const n = MOMENTS.length || 18;
  const t0 = 43.4;
  const arrive = k(t, t0, t0 + 0.55, ease.out);
  const rewind = k(t, Wd(9, "اول") - 0.1, Wd(9, "ویدئو") + 0.55, ease.inOut);
  const lens = k(t, Wd(9, "دقت") - 0.25, Wd(9, "دقت") + 0.25, ease.out);
  const hop0 = Wd(9, "هر") - 0.15, hop1 = Wd(9, "لحظه‌ش") + 0.55;
  const hopP = clamp((t - hop0) / (hop1 - hop0));
  const deal = k(t, Wd(9, "یک") - 0.1, Wd(9, "انیمیشنی") + 0.2, ease.inOut);
  const dive = k(t, 49.55, 50.1, ease.in);
  c.fillStyle = "#050505";
  c.fillRect(0, 0, W, H);
  const lit = layer("s9-lit", 0.5);
  // the row camera: from card 15 back to card 01, then along the hops
  const hopIdx = Math.floor(hopP * 6);
  const focus = lerp(14, 0, rewind) + (t > hop0 ? Math.min(5, hopP * 6) : 0);
  const zIn = H / (CH * 1.07);
  const z = lerp(zIn, 1.0, arrive) * (1 + 0.25 * lens * (1 - deal));
  const blurX = Math.abs(rewind - k(t - 1 / 30, Wd(9, "اول") - 0.1, Wd(9, "ویدئو") + 0.55, ease.inOut)) * 30 * (CW + GAP);
  const rowAt = (cc: Ctx) => {
    for (let i = 0; i < n; i++) {
      const x = 540 + (rowX(i) - rowX(focus)) * z, y = 900;
      if (x < -CW * z || x > W + CW * z) continue;
      const fl = deal > 0 ? 0 : Math.exp(-Math.abs(i - focus) * 3) * 0;
      card(cc, i, x, y, CW * z, 1, fl);
    }
  };
  const wall = (cc: Ctx) => {
    // 6 × 3 contact sheet
    for (let i = 0; i < n; i++) {
      const [cx, cy] = wallPos(i);
      const tp = lerp(Wd(9, "یک"), Wd(9, "متفاوت"), i / (n - 1));
      const pop = t > tp ? Math.exp(-(t - tp) / 0.2) : 0;
      // from the row into the wall
      const rx = 540 + (rowX(i) - rowX(focus)) * z, ry = 900;
      const x = lerp(rx, cx, deal), y = lerp(ry, cy, deal), ww = lerp(CW * z, WALL.cw, deal);
      card(cc, i, x, y, ww * (1 + 0.12 * pop), 1, pop, deal > 0.7);
    }
  };
  c.save();
  // dive into the schematic card at the end
  const target = Math.min(n - 2, 16);
  if (dive > 0) {
    const [cx, cy] = wallPos(target);
    const zz = Math.exp(lerp(0, Math.log(H / ((WALL.cw * 16) / 9)), dive));
    c.translate(lerp(cx, 540, dive), lerp(cy, 960, dive));
    c.scale(zz, zz);
    c.translate(-cx, -cy);
  }
  if (deal <= 0) {
    if (blurX > 4) {
      // motion blur while rewinding
      for (let s = 0; s < 5; s++) {
        c.save();
        c.globalAlpha = 0.28;
        c.translate((s - 2) * blurX * 0.12, 0);
        rowAt(c);
        c.restore();
      }
    } else rowAt(c);
  } else wall(c);
  c.restore();
  // the loupe over the focused card (rides the hops)
  const la = lens * (1 - k(t, Wd(9, "یک") - 0.3, Wd(9, "یک") + 0.1));
  if (la > 0) {
    const hopU = hopP * 6 - hopIdx;
    const lx = 540 + (hopU < 0.25 ? -60 * (1 - hopU / 0.25) : 0), ly = 900 + Math.sin(t * 2) * 6;
    loupe(c, lx, ly, 200 * lens, 2.2, (cc) => rowAt(cc), la);
  }
  // rewind HUD
  const rw = k(t, Wd(9, "اول") - 0.15, Wd(9, "اول")) * (1 - k(t, Wd(9, "ویدئو") + 0.45, Wd(9, "ویدئو") + 0.7));
  if (rw > 0) {
    const tc = Math.max(0, 43 * (1 - rewind));
    txt(c, `◀◀  00:${String(Math.floor(tc)).padStart(2, "0")}:${String(Math.floor((tc % 1) * 30)).padStart(2, "0")}`, 540, 470, { size: 40, weight: 600, ls: 0.2, align: "center", alpha: rw * (0.6 + 0.4 * Math.abs(Math.sin(t * 8))) });
  }
  glow(lit, 540, 900, 400, "#ffffff", 0.08);
  bloom(c, lit, 0.5, 30);
  vignette(c, 0.45, "#000000");
  grain(c, t, 0.18);
  const wh = k(t, 49.85, 50.1);
  if (wh > 0) {
    c.fillStyle = rgba("#e9e7e2", wh);
    c.fillRect(0, 0, W, H);
  }
}
