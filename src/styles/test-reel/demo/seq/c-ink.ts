// C · «دقیقاً توی همین فکرا بود که راه‌حلی پیدا کردم، که دیگه نیاز نبود وقت بذارم، ادیتور بگیرم، دوربین بگیرم، یا همیشه
// برم بشینم تو دفتر که ویدئو درست کنم.» (15.75 → 23.4) — r2, redrawn with care: the point the brain collapsed into falls
// like a drop into black water and lands on the drop of the music; out of the splash a man rises waist-deep (a real
// human contour in white brush line, hatched on the shadow side, mirrored in the water). Four burdens orbit him as
// hatched planets — TIME, EDITOR, CAMERA, OFFICE — and each bursts into ink on its own word; its drops fall into the
// water and ring it. At the end the camera sinks into the dark water (the black of the laptop screen in D).
import { bloom, blur, Ctx, H, layer, matchTransform, paint, scale, W } from "../../lib/canvas";
import { glow, grain, vignette } from "../../lib/fx";
import { txt } from "../../lib/hud";
import { clamp, ease, k, lerp, rgba, rng } from "../../lib/math";
import { DROP, Wd } from "../cues";

const WATER = 1380;
const S = 165; // px per figure unit (head height)
const X0 = 540;
const C_START = 15.75;
type P2 = [number, number];
type Seg = { c1?: P2; c2?: P2; p: P2 };
/** right half of the contour, from the crown down to the centre below the water (unit coords, y down) */
const RIGHT: Seg[] = [
  { c1: [0.22, 0], c2: [0.38, 0.12], p: [0.385, 0.42] },
  { c1: [0.42, 0.45], c2: [0.43, 0.62], p: [0.39, 0.7] },
  { c1: [0.37, 0.86], c2: [0.28, 0.97], p: [0.2, 1.02] },
  { p: [0.19, 1.22] },
  { c1: [0.24, 1.33], c2: [0.48, 1.38], p: [0.82, 1.45] },
  { c1: [0.98, 1.48], c2: [1.06, 1.58], p: [1.07, 1.8] },
  { c1: [1.1, 2.2], c2: [1.15, 2.6], p: [1.16, 2.9] },
  { c1: [1.18, 3.1], c2: [1.2, 3.3], p: [1.2, 3.6] },
  { p: [1.01, 3.6] },
  { c1: [1.0, 3.2], c2: [0.98, 2.95], p: [0.97, 2.62] },
  { c1: [0.96, 2.3], c2: [0.95, 2.06], p: [0.93, 1.93] },
  { c1: [0.86, 2.3], c2: [0.74, 2.8], p: [0.7, 3.05] },
  { c1: [0.72, 3.2], c2: [0.75, 3.38], p: [0.78, 3.65] },
  { p: [0, 3.7] },
];
/** the figure's outline as a Path2D (head tilt and a touch of contrapposto make it alive) */
function figurePath(y0: number, t: number, tilt: number) {
  const br = Math.sin(t * 1.3) * 0.012; // breathing lifts the shoulders
  const tr = (x: number, y: number, side: number): P2 => {
    let X = x * side, Y = y;
    if (y < 1.1) {
      // head tilt around the neck
      const a = tilt, cx = 0, cy = 1.1;
      const dx = X - cx, dy = Y - cy;
      X = cx + dx * Math.cos(a) - dy * Math.sin(a);
      Y = cy + dx * Math.sin(a) + dy * Math.cos(a);
    }
    if (y > 1.25 && y < 2.2) Y += side * 0.03 - br;
    return [X0 + X * S, y0 + Y * S];
  };
  const p = new Path2D();
  const start = tr(0, 0, 1);
  p.moveTo(start[0], start[1]);
  // right side down
  for (const s of RIGHT) {
    const e = tr(s.p[0], s.p[1], 1);
    if (s.c1 && s.c2) {
      const a = tr(s.c1[0], s.c1[1], 1), b = tr(s.c2[0], s.c2[1], 1);
      p.bezierCurveTo(a[0], a[1], b[0], b[1], e[0], e[1]);
    } else p.lineTo(e[0], e[1]);
  }
  // left side up (mirror, reversed)
  for (let i = RIGHT.length - 1; i >= 0; i--) {
    const s = RIGHT[i];
    const prev = i > 0 ? RIGHT[i - 1].p : [0, 0];
    const e = tr(prev[0], prev[1], -1);
    if (s.c1 && s.c2) {
      const a = tr(s.c2[0], s.c2[1], -1), b = tr(s.c1[0], s.c1[1], -1);
      p.bezierCurveTo(a[0], a[1], b[0], b[1], e[0], e[1]);
    } else p.lineTo(e[0], e[1]);
  }
  p.closePath();
  return p;
}
const BURDENS = [
  { name: "TIME", word: "وقت", r: 92, ph: 0.3, icon: 0 },
  { name: "EDITOR", word: "ادیتور", r: 104, ph: 1.9, icon: 1 },
  { name: "CAMERA", word: "دوربین", r: 98, ph: 3.45, icon: 2 },
  { name: "OFFICE", word: "دفتر", r: 108, ph: 5.0, icon: 3 },
];
function orbit(i: number, t: number) {
  const th = BURDENS[i].ph + 0.42 * (t - 16.3);
  const z = Math.sin(th);
  const sc = 0.78 + 0.32 * (z + 1) / 2;
  return { x: X0 + Math.cos(th) * 410, y: 1010 - 95 * Math.cos(th) + 80 * z, z, sc };
}
function icon(c: Ctx, kind: number, x: number, y: number, s: number, t: number) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.strokeStyle = "#050505";
  c.fillStyle = "#050505";
  c.lineWidth = 0.07;
  c.lineCap = "round";
  c.lineJoin = "round";
  if (kind === 0) {
    c.beginPath();
    c.arc(0, 0, 0.8, 0, Math.PI * 2);
    c.stroke();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      c.beginPath();
      c.moveTo(Math.cos(a) * 0.66, Math.sin(a) * 0.66);
      c.lineTo(Math.cos(a) * 0.76, Math.sin(a) * 0.76);
      c.stroke();
    }
    const m = t * 4, hh = t * 0.35;
    c.lineWidth = 0.09;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(Math.sin(m) * 0.6, -Math.cos(m) * 0.6);
    c.moveTo(0, 0);
    c.lineTo(Math.sin(hh) * 0.4, -Math.cos(hh) * 0.4);
    c.stroke();
  } else if (kind === 1) {
    c.strokeRect(-0.85, -0.6, 1.7, 1.2);
    const rows = [[-0.7, 0.5, 0.95, -0.3], [-0.35, 0.95, 0.7, 0.05], [-0.75, 0.25, 0.55, 0.35]];
    rows.forEach(([a, b], r) => {
      c.fillRect(a, -0.42 + r * 0.32, b - a, 0.2);
    });
    const ph = -0.6 + ((t * 0.4) % 1.2);
    c.fillStyle = "#c2410c";
    c.fillRect(ph, -0.6, 0.06, 1.2);
  } else if (kind === 2) {
    c.beginPath();
    c.roundRect(-0.85, -0.45, 1.7, 1.05, 0.15);
    c.stroke();
    c.beginPath();
    c.roundRect(-0.35, -0.68, 0.55, 0.25, 0.06);
    c.stroke();
    c.beginPath();
    c.arc(0, 0.08, 0.36, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(0, 0.08, 0.18, 0, Math.PI * 2);
    c.fill();
  } else {
    c.strokeRect(-0.55, -0.85, 1.1, 1.7);
    for (let r = 0; r < 4; r++)
      for (let q = 0; q < 3; q++) c.fillRect(-0.4 + q * 0.3, -0.7 + r * 0.32, 0.18, 0.18);
    c.fillRect(-0.15, 0.55, 0.3, 0.3);
  }
  c.restore();
}
/** r2's planet: white sphere, black brush bands, a medallion with the icon, a shaded limb */
function planet(c: Ctx, x: number, y: number, r: number, i: number, t: number, crack: number, deco = false) {
  c.save();
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.clip();
  c.fillStyle = "#f3f3f1";
  c.fillRect(x - r, y - r, 2 * r, 2 * r);
  const rr = rng(i * 17 + 5);
  c.strokeStyle = "#060606";
  c.lineCap = "round";
  const tilt = -0.25 + i * 0.12;
  for (let j = 0; j < 9; j++) {
    const yy = -r + (j + 0.5) * ((2 * r) / 9);
    c.save();
    c.translate(x, y);
    c.rotate(tilt);
    c.lineWidth = r * (0.035 + rr() * 0.07);
    c.beginPath();
    c.moveTo(-r * 1.2, yy + r * 0.18 + Math.sin(t + j) * 2);
    c.bezierCurveTo(-r * 0.4, yy - r * 0.16, r * 0.3, yy + r * 0.2, r * 1.2, yy - r * 0.16);
    c.stroke();
    c.restore();
  }
  // medallion
  if (!deco) {
  c.fillStyle = "#f3f3f1";
  c.beginPath();
  c.arc(x, y, r * 0.52, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "#060606";
  c.lineWidth = 2;
  c.beginPath();
  c.arc(x, y, r * 0.52, 0, Math.PI * 2);
  c.stroke();
  icon(c, BURDENS[i].icon, x, y, r * 0.42, t);
  }
  // limb shading (light from the upper left)
  const sg = c.createRadialGradient(x - r * 0.4, y - r * 0.45, r * 0.15, x, y, r * 1.08);
  sg.addColorStop(0, rgba("#ffffff", 0.2));
  sg.addColorStop(0.62, rgba("#000000", 0));
  sg.addColorStop(1, rgba("#000000", 0.62));
  c.fillStyle = sg;
  c.fillRect(x - r, y - r, 2 * r, 2 * r);
  // cracks right before it bursts
  if (crack > 0) {
    c.strokeStyle = "#000";
    c.lineWidth = 3;
    const cr = rng(i * 7 + 1);
    for (let q = 0; q < 6; q++) {
      let px = x + (cr() - 0.5) * r * 0.3, py = y + (cr() - 0.5) * r * 0.3;
      const a0 = cr() * Math.PI * 2;
      c.beginPath();
      c.moveTo(px, py);
      for (let s = 0; s < 5; s++) {
        const a = a0 + (cr() - 0.5) * 0.9, L = r * 0.26 * crack;
        px += Math.cos(a) * L;
        py += Math.sin(a) * L;
        c.lineTo(px, py);
      }
      c.stroke();
    }
  }
  c.restore();
  c.strokeStyle = rgba("#ffffff", 0.95);
  c.lineWidth = 2.5;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.stroke();
}
type Drop = { x: number; y: number; vx: number; vy: number; s: number };
const G = 1900;
function drops(n: number, seed: number, up = 0): Drop[] {
  const r = rng(seed);
  return Array.from({ length: n }, () => {
    const a = r() * Math.PI * 2, sp = 260 + r() * 760;
    return { x: 0, y: 0, vx: Math.cos(a) * sp * (up ? 0.6 : 1), vy: Math.sin(a) * sp - up * (500 + r() * 700), s: 3 + r() * 8 };
  });
}
const BURSTS = BURDENS.map((_, i) => drops(38, 100 + i));
const SPLASH = drops(30, 77, 1);
/** ink drops thrown from (x0,y0) at time t0; each falls into the water and leaves a ring */
function inkDrops(c: Ctx, lit: Ctx, list: Drop[], x0: number, y0: number, t0: number, t: number, rings: [number, number][]) {
  const u = t - t0;
  if (u < 0) return;
  for (const d of list) {
    // time it reaches the water
    const A = 0.5 * G, B = d.vy, Cc = y0 - WATER;
    const disc = B * B - 4 * A * Cc;
    const hit = disc > 0 ? (-B + Math.sqrt(disc)) / (2 * A) : 9;
    if (u < hit) {
      const x = x0 + d.vx * u, y = y0 + d.vy * u + 0.5 * G * u * u;
      const vx = d.vx, vy = d.vy + G * u, sp = Math.hypot(vx, vy) || 1;
      c.save();
      c.translate(x, y);
      c.rotate(Math.atan2(vy, vx));
      c.fillStyle = "#f4f4f4";
      c.beginPath();
      c.ellipse(0, 0, d.s * (1 + Math.min(2.2, sp / 600)), d.s * 0.7, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();
      lit.fillStyle = rgba("#ffffff", 0.6);
      lit.beginPath();
      lit.arc(x, y, d.s * 1.6, 0, Math.PI * 2);
      lit.fill();
    } else rings.push([x0 + d.vx * hit, t0 + hit]);
  }
}
function ring(c: Ctx, x: number, t0: number, t: number, big = 1) {
  const u = t - t0;
  if (u < 0 || u > 1.4) return;
  const rx = (6 + 90 * ease.out(clamp(u / 1.2))) * big;
  c.strokeStyle = rgba("#ffffff", 0.75 * (1 - u / 1.4));
  c.lineWidth = 2;
  c.beginPath();
  c.ellipse(x, WATER + 6, rx, rx * 0.16, 0, 0, Math.PI * 2);
  c.stroke();
}

export function seqC(c: Ctx, t: number) {
  const fall = clamp((t - C_START) / (DROP - C_START));
  const rise = ease.out(k(t, DROP, DROP + 0.95));
  const sink = k(t, Wd(4, "که", 2) + 0.1, 23.35, ease.inOut);
  const tilt = lerp(0.04, -0.18, k(t, Wd(4, "ویدئو") - 0.6, Wd(4, "کنم.") + 0.2, ease.inOutSine));
  c.fillStyle = "#000";
  c.fillRect(0, 0, W, H);
  const lit = layer("ci-lit", 0.5);
  c.save();
  // the camera sinks into the water at the end
  c.translate(540, WATER);
  c.scale(1 + 1.3 * sink, 1 + 1.3 * sink);
  c.translate(-540, -WATER - 560 * sink);
  lit.save();
  matchTransform(lit, c);
  // stars and two far planets for depth
  const sr = rng(9);
  c.fillStyle = "#ffffff";
  for (let i = 0; i < 140; i++) {
    c.globalAlpha = 0.15 + 0.6 * sr();
    const s = sr() < 0.08 ? 2.6 : 1.5;
    c.fillRect(sr() * W, sr() * (WATER - 80), s, s);
  }
  c.globalAlpha = 1;
  const appear = k(t, DROP + 0.2, DROP + 1.2);
  if (appear > 0) {
    c.save();
    c.globalAlpha = 0.28 * appear;
    planet(c, 190 + 8 * Math.sin(t * 0.2), 430, 175, 0, t * 0.3, 0, true);
    planet(c, 905, 560, 46, 2, t * 0.3, 0, true);
    c.restore();
  }
  // the falling drop (before the music drops)
  if (t < DROP) {
    const y = lerp(960, WATER, fall * fall);
    c.save();
    c.globalCompositeOperation = "screen";
    glow(c, 540, y, 120, "#ffffff", 0.5);
    c.restore();
    const g = c.createLinearGradient(0, y - 160 * fall, 0, y);
    g.addColorStop(0, rgba("#ffffff", 0));
    g.addColorStop(1, rgba("#ffffff", 0.9));
    c.fillStyle = g;
    c.fillRect(536, y - 160 * fall, 8, 160 * fall);
    c.fillStyle = "#ffffff";
    c.beginPath();
    c.arc(540, y, 9, 0, Math.PI * 2);
    c.fill();
    lit.fillStyle = "#ffffff";
    lit.beginPath();
    lit.arc(540, y, 26, 0, Math.PI * 2);
    lit.fill();
  }
  const rings: [number, number][] = [];
  // water: the impact rings + every burden's drops
  const wl = layer("ci-water", 1);
  matchTransform(wl, c);
  for (let i = 0; i < 4; i++) {
    const u = t - DROP - i * 0.16;
    if (u > 0 && u < 2.4) {
      const rx = 30 + 620 * ease.out(clamp(u / 2.2));
      wl.strokeStyle = rgba("#ffffff", 0.85 * (1 - u / 2.4));
      wl.lineWidth = 3 - i * 0.5;
      wl.beginPath();
      wl.ellipse(540, WATER + 4, rx, rx * 0.15, 0, 0, Math.PI * 2);
      wl.stroke();
    }
  }
  // calm rings around the waist, always
  if (t > DROP) {
    for (let i = 0; i < 6; i++) {
      const ph = ((i + (t - DROP) * 0.5) % 6) / 6;
      const rx = 150 + ph * 470;
      wl.strokeStyle = rgba("#ffffff", (1 - ph) * 0.55 * rise);
      wl.lineWidth = 1.5 + (1 - ph) * 1.5;
      for (let s = 0; s < 3; s++) {
        const a0 = s * 2.1 + i, len = 1.2 + (s % 2) * 0.8;
        wl.beginPath();
        wl.ellipse(540, WATER + 8, rx, rx * 0.15, 0, a0, a0 + len);
        wl.stroke();
      }
    }
  }
  // burdens: behind the man first, then in front
  const order = BURDENS.map((_, i) => ({ i, o: orbit(i, t) })).sort((a, b) => a.o.z - b.o.z);
  const inFront = (z: number) => z >= 0;
  const drawBurden = (i: number, o: ReturnType<typeof orbit>) => {
    const tk = Wd(4, BURDENS[i].word) - 0.04;
    const crack = clamp((t - tk) / 0.14);
    const gone = t > tk + 0.14;
    const inA = ease.outBack(clamp((t - DROP - 0.35 - i * 0.14) / 0.6));
    if (inA <= 0) return;
    const r = BURDENS[i].r * o.sc * inA;
    if (!gone) planet(c, o.x, o.y, r, i, t, crack);
    // its label (frozen where the planet burst, drifting up as it fades)
    const ob = t > tk ? orbit(i, tk) : o;
    const rb = BURDENS[i].r * ob.sc * inA;
    const lx = ob.x, ly = ob.y - rb - 30 - 30 * clamp((t - tk - 0.2) / 0.4);
    const strike = clamp((t - tk) / 0.25);
    const la = clamp((t - DROP - 0.6 - i * 0.14) / 0.3) * (1 - clamp((t - tk - 0.25) / 0.35));
    if (la > 0) {
      txt(c, BURDENS[i].name, lx, ly, { size: 30, weight: 600, ls: 0.22, align: "center", alpha: la * (1 - 0.4 * strike) });
      if (strike > 0) {
        c.strokeStyle = rgba("#ffffff", la);
        c.lineWidth = 3;
        const w = 22 * BURDENS[i].name.length;
        c.beginPath();
        c.moveTo(lx - w / 2, ly);
        c.lineTo(lx - w / 2 + w * strike, ly);
        c.stroke();
      }
    }
  };
  for (const { i, o } of order) if (!inFront(o.z)) drawBurden(i, o);
  const y0 = WATER - 3.35 * S + (1 - rise) * 620 + 640 * sink * sink;
  const fig = figurePath(y0, t, tilt);
  // the man rising out of the splash
  if (t > DROP) {
    // reflection: the figure mirrored in the water, broken into rippling slices
    for (let q = 0; q < 34; q++) {
      const yy = WATER + 2 + q * 16, off = Math.sin(t * 2.2 + q * 0.9) * (4 + q * 0.5);
      c.save();
      c.beginPath();
      c.rect(-200, yy, W + 400, 16);
      c.clip();
      c.translate(off, 2 * WATER);
      c.scale(1, -1);
      c.globalAlpha = 0.42 * (1 - q / 34) * rise * (1 - sink) * (1 - sink);
      c.strokeStyle = "#ffffff";
      c.lineWidth = 2.5;
      c.stroke(fig);
      c.restore();
    }
    c.save();
    c.beginPath();
    c.rect(-200, -200, W + 400, WATER + 200);
    c.clip();
    // the body: black fill, hatching on the shadow side, brush contour
    c.fillStyle = "#000";
    c.fill(fig);
    const hl = layer("ci-hatch", 1);
    matchTransform(hl, c);
    hl.save();
    hl.clip(fig);
    hl.strokeStyle = "#ffffff";
    hl.lineWidth = 1.6;
    for (let yy = y0 - 40; yy < WATER + 60; yy += 9) {
      hl.beginPath();
      hl.moveTo(X0 - 40, yy + 40);
      hl.lineTo(X0 + 260, yy - 60);
      hl.stroke();
    }
    hl.restore();
    hl.save();
    hl.setTransform(1, 0, 0, 1, 0, 0);
    hl.globalCompositeOperation = "destination-in";
    const m = c.getTransform();
    const gx0 = m.a * (X0 + 0.15 * S) + m.e, gx1 = m.a * (X0 + 1.2 * S) + m.e;
    const hg = hl.createLinearGradient(gx0, 0, gx1, 0);
    hg.addColorStop(0, "rgba(0,0,0,0)");
    hg.addColorStop(1, "rgba(0,0,0,0.42)");
    hl.fillStyle = hg;
    hl.fillRect(0, 0, hl.canvas.width, hl.canvas.height);
    hl.restore();
    paint(c, hl, rise);
    // collarbones (a few interior lines read as real anatomy)
    c.strokeStyle = rgba("#ffffff", 0.5 * rise);
    c.lineWidth = 1.8;
    for (const sd of [-1, 1]) {
      c.beginPath();
      c.moveTo(X0 + sd * 0.16 * S, y0 + 1.33 * S);
      c.quadraticCurveTo(X0 + sd * 0.38 * S, y0 + 1.42 * S, X0 + sd * 0.64 * S, y0 + 1.42 * S);
      c.stroke();
    }
    // brush contour: a main stroke + a thinner offset pass + a dry broken pass
    c.lineJoin = "round";
    c.strokeStyle = "#ffffff";
    c.lineWidth = 3.4;
    c.stroke(fig);
    c.save();
    c.translate(0.9, -0.7);
    c.lineWidth = 1.3;
    c.globalAlpha = 0.6;
    c.stroke(fig);
    c.restore();
    c.save();
    c.setLineDash([22, 9, 6, 14]);
    c.lineDashOffset = -t * 6;
    c.translate(-1.2, 1.0);
    c.lineWidth = 1;
    c.globalAlpha = 0.45;
    c.stroke(fig);
    c.restore();
    lit.save();
    lit.beginPath();
    lit.rect(-200, -200, W + 400, WATER + 200);
    lit.clip();
    lit.strokeStyle = rgba("#ffffff", 0.7);
    lit.lineWidth = 6;
    lit.stroke(fig);
    lit.restore();
    c.restore();
  }
  for (const { i, o } of order) if (inFront(o.z)) drawBurden(i, o);
  // the splash on the drop and the burdens' ink
  inkDrops(c, lit, SPLASH, 540, WATER, DROP, t, rings);
  const fl = t > DROP ? Math.exp(-(t - DROP) / 0.12) : 0;
  if (fl > 0.01) {
    c.save();
    c.globalCompositeOperation = "screen";
    glow(c, 540, WATER, 520, "#ffffff", 0.45 * fl);
    c.fillStyle = rgba("#ffffff", 0.9 * fl);
    c.beginPath();
    c.ellipse(540, WATER + 2, 700 * (0.6 + 0.4 * fl), 5 + 6 * fl, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
    glow(lit, 540, WATER, 260, "#ffffff", fl);
    lit.fillStyle = rgba("#ffffff", fl);
    lit.beginPath();
    lit.ellipse(540, WATER + 2, 760, 16, 0, 0, Math.PI * 2);
    lit.fill();
  }
  BURDENS.forEach((b, i) => {
    const tk = Wd(4, b.word) - 0.04 + 0.14;
    const o = orbit(i, tk);
    inkDrops(c, lit, BURSTS[i], o.x, o.y, tk, t, rings);
    if (t > tk && t < tk + 0.25) glow(lit, o.x, o.y, b.r * 2, "#ffffff", 1 - (t - tk) / 0.25);
  });
  for (const [x, t0] of rings) ring(wl, x, t0, t);
  paint(c, wl, 1);
  lit.restore();
  c.restore();
  bloom(c, lit, 1.0, 34);
  vignette(c, 0.5, "#000000");
  grain(c, t, 0.2);
  const fo = k(t, 23.15, 23.4);
  if (fo > 0) {
    c.fillStyle = rgba("#000000", fo);
    c.fillRect(0, 0, W, H);
  }
  void blur;
  void scale;
}
