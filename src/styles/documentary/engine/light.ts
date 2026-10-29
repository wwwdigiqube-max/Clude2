// «فرشته‌ی خداوند»: a human figure made of light (v3, more detail and depth):
// volumetric rays behind the head · a sun-disc halo of fine turning rings · two tilted rings of light orbiting the
// body in 3D (back half behind, front half in front, beads riding them) · a luminous robe with light flowing up
// inside it and an iridescent edge · a bright core at the head with a starburst and a lens streak · light
// dissolving upward from the hem · a pool of light and ripples on the ground.
import { blur, Ctx, layer, matchTransform, paint, resOf, scale } from "./canvas";
import { godRays, lightPool } from "./depth";
import { Fig, jointAt, Pose, P, silhouette, STAND } from "./figure";
import { glow, sparkles } from "./fx";
import { clamp, ease, lerp, mixHex, rgba, rng, TAU } from "./math";

export const BEING_POSE: Pose = P({ arF: 0.55, elF: 0.35, arB: -0.5, elB: -0.25, torso: 0.0, head: 0.0 });
export type Being = {
  x: number; y: number; h: number; t: number; k: number;
  pose?: Pose; warm?: number; face?: 1 | -1; rays?: number; aura?: number; seed?: number; wind?: number;
  /** 0..1 orbit rings, halo rings, ground pool (default 1; small figures turn detail down themselves) */
  rings?: number; halo?: number; pool?: number;
};

/** one tilted ring around (cx,cy): radius R, tilt phi (0 = edge-on), in-plane rotation psi; half = back | front */
function orbit(c: Ctx, cx: number, cy: number, R: number, phi: number, psi: number, half: "back" | "front", t: number, sp: number, a: number, col: string, lw: number, beads: number, seed: number) {
  if (a <= 0.002) return;
  const ry = R * Math.abs(Math.sin(phi));
  const [a0, a1] = half === "back" ? [Math.PI, TAU] : [0, Math.PI];
  c.save();
  c.globalCompositeOperation = "screen";
  c.strokeStyle = rgba(col, a * (half === "back" ? 0.32 : 0.6));
  c.lineWidth = lw;
  c.shadowColor = col;
  c.shadowBlur = lw * 4 * scale();
  c.beginPath();
  c.ellipse(cx, cy, R, ry, psi, a0, a1);
  c.stroke();
  // beads of light riding the ring (brighter and bigger at the front)
  c.shadowBlur = 0;
  const r = rng(seed);
  for (let i = 0; i < beads; i++) {
    const th = ((r() * TAU + t * sp * (0.8 + r() * 0.4)) % TAU + TAU) % TAU;
    const front = th < Math.PI;
    if ((half === "front") !== front) continue;
    const depth = Math.sin(th); // +1 nearest
    const px = Math.cos(th) * R, py = Math.sin(th) * ry;
    const X = cx + px * Math.cos(psi) - py * Math.sin(psi), Y = cy + px * Math.sin(psi) + py * Math.cos(psi);
    const s = lw * (1.4 + 1.2 * (depth + 1));
    glow(c, X, Y, s * 5, col, a * (0.35 + 0.35 * depth));
    c.fillStyle = rgba("#ffffff", a * (0.6 + 0.4 * depth));
    c.beginPath();
    c.arc(X, Y, s * 0.55, 0, TAU);
    c.fill();
  }
  c.restore();
}

/** a halo like an engraved sun around a head: fine rings (one dashed, turning), radial ticks, beads of light */
export function haloRings(ctx: Ctx, x: number, y: number, R: number, t: number, a: number, mid = "#e4dcff") {
  if (a <= 0.002 || R < 2) return;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.translate(x, y);
  ctx.strokeStyle = rgba("#ffffff", 0.55 * a);
  ctx.lineWidth = Math.max(1, R * 0.03);
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 6 * scale();
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, TAU);
  ctx.stroke();
  ctx.rotate(t * 0.12);
  ctx.setLineDash([R * 0.09, R * 0.14]);
  ctx.strokeStyle = rgba(mid, 0.45 * a);
  ctx.beginPath();
  ctx.arc(0, 0, R * 1.32, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.rotate(-t * 0.2);
  ctx.strokeStyle = rgba("#ffffff", 0.22 * a);
  ctx.beginPath();
  ctx.arc(0, 0, R * 1.7, 0, TAU);
  ctx.stroke();
  ctx.lineWidth = Math.max(0.8, R * 0.02);
  for (let i = 0; i < 36; i++) {
    const an = (i / 36) * TAU;
    ctx.strokeStyle = rgba("#ffffff", (i % 3 ? 0.18 : 0.35) * a);
    ctx.beginPath();
    ctx.moveTo(Math.cos(an) * R * 1.38, Math.sin(an) * R * 1.38);
    ctx.lineTo(Math.cos(an) * R * (i % 3 ? 1.55 : 1.64), Math.sin(an) * R * (i % 3 ? 1.55 : 1.64));
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  for (let i = 0; i < 6; i++) {
    const an = (i / 6) * TAU + t * 0.25;
    glow(ctx, Math.cos(an) * R * 1.7, Math.sin(an) * R * 1.7, R * 0.15, "#ffffff", 0.7 * a);
  }
  ctx.restore();
}

export function lightBeing(ctx: Ctx, lit: Ctx | null, b: Being) {
  const { x, y, h, t, k, pose = BEING_POSE, warm = 0, face = 1, rays = 1, aura = 1, seed = 7, wind = 0.25 } = b;
  if (k <= 0.002) return;
  const detail = clamp((h - 90) / 160); // tiny figures stay simple
  const rings = (b.rings ?? 1) * detail, halo = (b.halo ?? 1) * detail, pool = b.pool ?? 1;
  const low = mixHex("#9d8dff", "#ffb866", warm), mid = mixHex("#dcd4ff", "#ffe6b8", warm), deep = mixHex("#6f5ad8", "#e2873a", warm);
  const irA = mixHex("#ff9fd6", "#ffd27a", warm), irB = mixHex("#8fe6ff", "#ffffff", warm * 0.5);
  const f: Fig = { x, y, h, face, pose, t, head: "none", wind, seed };
  const hd = jointAt(f, "head");
  const cx = x, cy = y - h * 0.52;
  const app = ease.out(clamp(k * 1.2)); // things grow out as it appears
  const breath = 1 + 0.025 * Math.sin(t * 1.1 + seed);
  const res = resOf(ctx) || 1;

  // 1) deep aura + volumetric rays behind the head
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  glow(ctx, cx, cy, h * 0.95 * breath, mid, 0.3 * k * aura);
  glow(ctx, hd[0], hd[1], h * 0.42, "#ffffff", 0.3 * k);
  ctx.restore();
  if (rays > 0) {
    // broad soft beams + a finer set on top
    godRays(ctx, t, hd[0], hd[1], { n: 14, len: h * (1.0 + 0.6 * rays) * app, color: mid, alpha: 0.16 * k * Math.min(2.4, rays), width: 0.16, spin: 0.008, seed: seed + 2, soft: 14, r0: h * 0.04 });
    godRays(ctx, t, hd[0], hd[1], { n: 34, len: h * (0.8 + 0.45 * rays) * app, color: "#ffffff", alpha: 0.13 * k * Math.min(2.4, rays), width: 0.035, spin: -0.014, seed: seed + 3, soft: 3, r0: h * 0.04 });
  }

  // 2) the sun-disc halo: fine rings, one dashed and turning, beads riding the outer one
  if (halo > 0.01) haloRings(ctx, hd[0], hd[1], h * 0.13 * app, t, k * halo, mid);

  // 3) orbit rings: back halves first
  const R1 = h * 0.4 * lerp(0.7, 1, app), R2 = h * 0.33 * lerp(0.7, 1, app);
  const phi1 = 0.28 + 0.06 * Math.sin(t * 0.31 + seed), psi1 = -0.32 + 0.08 * Math.sin(t * 0.21 + seed);
  const phi2 = 0.22 + 0.05 * Math.sin(t * 0.27 + seed * 2), psi2 = 0.42 + 0.07 * Math.sin(t * 0.19 + seed);
  const lw = Math.max(1, h * 0.0045);
  const oy1 = cy + h * 0.02, oy2 = cy - h * 0.12;
  orbit(ctx, cx, oy1, R1, phi1, psi1, "back", t, 0.55, k * rings, mid, lw, 5, seed + 11);
  orbit(ctx, cx, oy2, R2, phi2, psi2, "back", t, -0.75, k * rings * 0.8, "#ffffff", lw * 0.8, 4, seed + 12);

  // 4) the body: luminous robe, lit from within, light flowing up inside it
  const B = layer("being-" + res, res);
  matchTransform(B, ctx);
  const g = B.createLinearGradient(0, y - h, 0, y);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.3, mixHex("#ffffff", mid, 0.55));
  g.addColorStop(0.7, mixHex(mid, low, 0.6));
  g.addColorStop(1, mixHex(low, deep, 0.45));
  const sil = silhouette(B, f, g);
  B.globalCompositeOperation = "source-atop";
  // volume: brighter core toward the light, deeper colour at the edges and hem
  const vg = B.createRadialGradient(x - face * h * 0.04, y - h * 0.62, h * 0.02, x, y - h * 0.5, h * 0.62);
  vg.addColorStop(0, "rgba(255,255,255,0.6)");
  vg.addColorStop(0.5, "rgba(255,255,255,0)");
  vg.addColorStop(1, rgba(deep, 0.45));
  B.fillStyle = vg;
  B.fillRect(x - h, y - h * 1.2, h * 2, h * 1.4);
  // soft cloth folds (deeper colour), so the robe has form
  B.lineCap = "round";
  for (let i = -2; i <= 2; i++) {
    B.strokeStyle = rgba(deep, 0.16);
    B.lineWidth = h * 0.018;
    B.beginPath();
    B.moveTo(x + i * h * 0.045, y - h * 0.5);
    B.quadraticCurveTo(x + i * h * 0.07 + Math.sin(t * 0.7 + i) * h * 0.01, y - h * 0.25, x + i * h * 0.1, y);
    B.stroke();
  }
  // flowing light: thin streams rising through the robe (dashes moving up)
  B.lineCap = "round";
  const r = rng(seed + 5);
  const nS = Math.round(lerp(6, 16, detail));
  for (let i = 0; i < nS; i++) {
    const u = (i + 0.5) / nS - 0.5;
    const sx = x + u * h * 0.34;
    const sp = 40 + r() * 50;
    B.strokeStyle = rgba(i % 3 ? "#ffffff" : mid, 0.32 + 0.2 * r());
    B.lineWidth = Math.max(1, h * (0.004 + r() * 0.004));
    B.setLineDash([h * (0.03 + r() * 0.05), h * (0.04 + r() * 0.06)]);
    B.lineDashOffset = (t * sp * h) / 400 + r() * 100;
    B.beginPath();
    for (let j = 0; j <= 24; j++) {
      const v = j / 24;
      const yy = y - v * h * 0.95;
      const xx = sx * (1 - v * 0.35) + x * v * 0.35 + Math.sin(v * 7 + t * 1.3 + i * 1.9) * h * 0.012;
      j ? B.lineTo(xx, yy) : B.moveTo(xx, yy);
    }
    B.stroke();
  }
  B.setLineDash([]);
  // iridescent fringe + soft glow edge, then the body itself
  const R = scale();
  const o = Math.max(1.5, h * 0.007) * R * res;
  paint(ctx, B, 0.45 * k, "screen", `drop-shadow(${o}px 0 ${o * 1.5}px ${irA}) drop-shadow(${-o}px 0 ${o * 1.5}px ${irB})`);
  paint(ctx, B, 0.32 * k, "screen", blur(h * 0.03, res));
  paint(ctx, B, k);

  // 5) orbit rings: front halves
  orbit(ctx, cx, oy1, R1, phi1, psi1, "front", t, 0.55, k * rings, mid, lw, 5, seed + 11);
  orbit(ctx, cx, oy2, R2, phi2, psi2, "front", t, -0.75, k * rings * 0.8, "#ffffff", lw * 0.8, 4, seed + 12);

  // 6) the head: a bright core, a four-point star and a thin lens streak
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const pulse = 0.85 + 0.15 * Math.sin(t * 1.7 + seed);
  glow(ctx, hd[0], hd[1], h * 0.15, "#ffffff", 0.95 * k);
  glow(ctx, cx, cy - h * 0.05, h * 0.42, mid, 0.4 * k);
  // a thin horizontal lens streak and a shorter vertical one through the head
  ctx.translate(hd[0], hd[1]);
  const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, h * 0.6);
  sg.addColorStop(0, rgba("#ffffff", 0.6 * k * pulse));
  sg.addColorStop(0.4, rgba(mid, 0.25 * k * pulse));
  sg.addColorStop(1, rgba(mid, 0));
  ctx.fillStyle = sg;
  ctx.save();
  ctx.scale(1, 0.016);
  ctx.fillRect(-h * 0.6, -h * 0.6, h * 1.2, h * 1.2);
  ctx.restore();
  ctx.scale(0.014, 0.45);
  ctx.fillRect(-h * 0.6, -h * 0.6, h * 1.2, h * 1.2);
  ctx.restore();

  // 7) light dissolving upward from the hem; motes around
  const hem = sil.hem;
  let hx0 = Infinity, hx1 = -Infinity, hy = -Infinity;
  for (const [px, py] of hem) {
    hx0 = Math.min(hx0, px);
    hx1 = Math.max(hx1, px);
    hy = Math.max(hy, py);
  }
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const rp = rng(seed + 9);
  const nP = Math.round(lerp(8, 30, detail));
  for (let i = 0; i < nP; i++) {
    const life = (t * (0.18 + rp() * 0.22) + rp()) % 1;
    const px = x + lerp(hx0, hx1, rp()) * face + Math.sin(t * 0.9 + i * 2.1) * h * 0.03 * life + (rp() - 0.5) * h * 0.25 * life;
    const py = y + hy - h * 0.08 * rp() - life * h * 0.55;
    const s = Math.max(0.8, h * (0.004 + rp() * 0.006)) * (1 - life * 0.5);
    ctx.globalAlpha = k * Math.sin(life * Math.PI) * 0.9;
    ctx.fillStyle = i % 4 ? "#ffffff" : mid;
    ctx.beginPath();
    ctx.arc(px, py, s, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  sparkles(ctx, t, [x - h * 0.45, y - h * 1.05, h * 0.9, h * 1.0], Math.round(lerp(5, 12, detail)), seed + 31, k * 0.85, "#ffffff", h * 0.03);

  // 8) the ground answers: a pool of light and slow ripples (standing figures only)
  const standing = pose.hipY > 0.42;
  if (pool > 0.01 && standing) {
    lightPool(ctx, x, y + h * 0.005, h * 0.75, h * 0.09, mid, 0.6 * k * pool);
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 2; i++) {
      const ph = ((t * 0.33 + i * 0.5) % 1);
      ctx.strokeStyle = rgba("#ffffff", 0.35 * k * pool * (1 - ph) * detail);
      ctx.lineWidth = Math.max(1, h * 0.004);
      ctx.beginPath();
      ctx.ellipse(x, y + h * 0.005, h * (0.15 + 0.6 * ph), h * (0.02 + 0.07 * ph), 0, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (lit) {
    lit.save();
    matchTransform(lit, ctx);
    glow(lit, hd[0], hd[1], h * 0.24, "#ffffff", k);
    glow(lit, cx, cy, h * 0.5, mid, 0.7 * k);
    if (standing) glow(lit, x, y, h * 0.35, mid, 0.4 * k * pool);
    lit.restore();
  }
}
/** soft light body without a figure (throne glow / pillar / point of light) */
export function lightCore(ctx: Ctx, lit: Ctx | null, x: number, y: number, r: number, k: number, color = "#ffffff", t = 0) {
  if (k <= 0.002) return;
  const p = 1 + 0.04 * Math.sin(t * 1.3);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  glow(ctx, x, y, r * 2.2 * p, color, 0.35 * k);
  glow(ctx, x, y, r * p, "#ffffff", 0.95 * k);
  ctx.restore();
  if (lit) {
    lit.save();
    matchTransform(lit, ctx);
    glow(lit, x, y, r * 1.6, "#ffffff", k);
    lit.restore();
  }
}
export const _u = { clamp, rgba, STAND, scale };
