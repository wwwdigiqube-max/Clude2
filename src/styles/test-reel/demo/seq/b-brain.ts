// B · L2–L3 (3.0 → 16.0) — img17: a low-poly network brain turning in 3D; English callouts type themselves on the
// words they echo. The breakdown (no bass) dims and glitches it; «دقیقاً توی همین فکرا» pulls the labels back
// and the whole brain collapses into one point of light (the target the HUD of C locks onto).
import { bloom, Ctx, H, layer, matchTransform, W } from "../../lib/canvas";
import { glow, grain, vignette } from "../../lib/fx";
import { callout, scramble, txt, typedLabel } from "../../lib/hud";
import { clamp, ease, fbm, k, lerp, rgba, rng } from "../../lib/math";
import { rotX, rotY, V3 } from "../../lib/p3";
import { DROP, pulse, S, Wd } from "../cues";

export const BRAIN_C = { x: 540, y: 960 };
let G: { p: V3[]; e: [number, number][]; start: [number, number][]; delay: number[] } | null = null;
function build() {
  const r = rng(2024);
  const p: V3[] = [];
  const nrm = (): V3 => {
    const z = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - z * z);
    return [s * Math.cos(a), z, s * Math.sin(a)];
  };
  // cerebrum: a bumpy ellipsoid shell split by the longitudinal fissure, flatter underneath
  while (p.length < 210) {
    const u = nrm();
    if (u[1] > 0.62) continue;
    if (Math.abs(u[2]) < 0.09 && u[1] < -0.15) continue;
    const bump = 1 + 0.07 * (fbm(u[0] * 2.2 + 3, u[1] * 2.2 + u[2] * 1.7, 3) - 0.5);
    const temporal = u[1] > 0.2 && u[0] > -0.2 ? 0.12 : 0;
    p.push([u[0] * 1.0 * bump, (u[1] * 0.7 - 0.08 + temporal) * bump, u[2] * 0.82 * bump]);
  }
  // cerebellum (back, low) + brainstem
  while (p.length < 255) {
    const u = nrm();
    if (u[1] < -0.3) continue;
    p.push([-0.62 + u[0] * 0.34, 0.5 + u[1] * 0.2, u[2] * 0.55]);
  }
  for (let i = 0; i < 16; i++) {
    const q = i / 15, a = r() * Math.PI * 2;
    p.push([-0.3 + q * 0.1 + Math.cos(a) * 0.09, 0.5 + q * 0.5, Math.sin(a) * 0.09]);
  }
  // edges: 3–4 nearest neighbours
  const e: [number, number][] = [];
  const seen = new Set<string>();
  for (let i = 0; i < p.length; i++) {
    const d = p.map((q, j) => [j, (q[0] - p[i][0]) ** 2 + (q[1] - p[i][1]) ** 2 + (q[2] - p[i][2]) ** 2] as [number, number]).filter(([j]) => j !== i).sort((a, b) => a[1] - b[1]);
    for (const [j, dd] of d.slice(0, 4)) {
      if (dd > 0.2) continue;
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        e.push([i, j]);
      }
    }
  }
  const start = p.map(() => [r() * W, r() * H] as [number, number]);
  const delay = p.map(() => r() * 0.5);
  G = { p, e, start, delay };
}
const SCALE = 300;
/** screen position of node i at time t */
function nodePos(i: number, t: number, collapse: number, yaw: number, pitch: number) {
  let q = G!.p[i];
  q = [-q[0], q[1], q[2]]; // frontal lobe to the left, like the reference
  q = rotY(q, yaw);
  q = rotX(q, pitch);
  const s = (SCALE * 4.2) / (4.2 + q[2]);
  const x = BRAIN_C.x + q[0] * s, y = BRAIN_C.y + q[1] * s;
  const f = ease.out(clamp((t - 3.0 - G!.delay[i]) / 0.7));
  const [sx, sy] = G!.start[i];
  const bx = lerp(sx, x, f), by = lerp(sy, y, f);
  return [lerp(bx, BRAIN_C.x, collapse), lerp(by, BRAIN_C.y, collapse), q[2], f] as const;
}
/** callouts: text, line, word, anchor (text sits above top anchors, below bottom ones) */
const LABELS: [string, number, string, number, number][] = [
  ["CREATORS", 2, "آدمی", 780, 560],
  ["VIDEOS / DAY", 2, "ویدئو", 300, 500],
  ["ENERGY ?", 2, "انرژی", 560, 430],
  ["DAILY REELS", 2, "ریلز", 300, 1350],
  ["ALWAYS ONLINE", 2, "فعاله", 790, 1390],
  ["NEVER TIRED", 2, "خسته", 830, 700],
  ["TIME ?", 3, "وقت", 560, 1510],
  ["CONTENT ×1000", 3, "محتوا", 250, 1180],
];
let NODE_FOR: number[] | null = null;

export function seqB(c: Ctx, t: number) {
  if (!G) build();
  const retract = k(t, Wd(4, "دقیقاً"), Wd(4, "فکرا") - 0.3, ease.inOut);
  const collapse = k(t, Wd(4, "فکرا") - 0.3, 15.72, ease.in);
  const dim = 1 - 0.35 * k(t, 9.6, 10.4) * (1 - collapse);
  const yaw = 0.42 * Math.sin((t - 3) * 0.32) + 2.2 * collapse * collapse;
  const pitch = 0.1 + 0.05 * Math.sin(t * 0.5);
  c.fillStyle = "#000";
  c.fillRect(0, 0, W, H);
  const n = G!.p.length;
  const P = Array.from({ length: n }, (_, i) => nodePos(i, t, collapse, yaw, pitch));
  if (!NODE_FOR) NODE_FOR = LABELS.map(([, , , ax, ay]) => {
    let best = 0, bd = 1e9;
    for (let i = 0; i < n; i++) {
      const q = nodePos(i, 8, 0, 0, 0.1);
      const d = Math.hypot(q[0] - ax, q[1] - ay);
      if (d < bd) [bd, best] = [d, i];
    }
    return best;
  });
  // edges (nearer = brighter); glitchy jitter in the breakdown
  const brk = k(t, 9.6, 10.2) * (1 - k(t, DROP - 0.4, DROP));
  const lit = layer("b-lit", 0.5);
  lit.save();
  matchTransform(lit, c);
  c.save();
  c.lineWidth = 1.4;
  for (const [i, j] of G!.e) {
    const a = P[i], b = P[j];
    const ff = Math.min(a[3], b[3]);
    if (ff < 0.6) continue;
    const z = (a[2] + b[2]) / 2, near = clamp(0.62 - z * 0.45);
    const jit = brk > 0 && Math.sin(i * 12.9 + Math.floor(t * 14)) > 0.93 ? (Math.sin(j * 7 + t * 40) * 14) : 0;
    c.strokeStyle = rgba("#e8eef6", (0.18 + 0.5 * near) * dim * (ff - 0.6) / 0.4);
    c.beginPath();
    c.moveTo(a[0] + jit, a[1]);
    c.lineTo(b[0] + jit, b[1]);
    c.stroke();
  }
  c.restore();
  // nodes; a random few flash on every beat
  const pl = pulse(t, 0.2), bi = Math.floor(t * 2.6);
  for (let i = 0; i < n; i++) {
    const [x, y, z, f] = P[i];
    const near = clamp(0.62 - z * 0.45);
    const hot = pl > 0.05 && (i * 7 + bi * 13) % 9 === 0 ? pl : 0;
    const rr = (1.6 + 2.6 * near) * (1 + 1.4 * hot) * (1 + 1.5 * collapse);
    c.fillStyle = rgba("#ffffff", clamp((0.35 + 0.65 * near) * dim + hot) * clamp(f * 1.4));
    c.beginPath();
    c.arc(x, y, rr, 0, Math.PI * 2);
    c.fill();
    if (hot > 0.2) {
      lit.fillStyle = rgba("#ffffff", hot);
      lit.beginPath();
      lit.arc(x, y, rr * 3, 0, Math.PI * 2);
      lit.fill();
    }
  }
  // callouts on their words
  LABELS.forEach(([s, line, word, ax, ay], li) => {
    const t0 = Wd(line, word) - 0.12;
    if (t < t0) return;
    const node = P[NODE_FOR![li]];
    const pLine = clamp((t - t0) / 0.22) * (1 - retract);
    callout(c, node[0], node[1], ax, ay, pLine, dim);
    const up = ay < BRAIN_C.y;
    const ty = ay + (up ? -34 : 36);
    const typing = (t - t0 - 0.12) / 0.45;
    const glitch = brk > 0 && Math.sin(li * 3.1 + Math.floor(t * 5)) > 0.85;
    const out = retract;
    if (out > 0) {
      txt(c, scramble(s, 1 - out, t, li), ax, ty, { size: 30, weight: 500, ls: 0.16, align: "center", color: "#ffffff", alpha: (1 - out) * dim });
    } else if (glitch) {
      txt(c, scramble(s, 0.4, t, li), ax, ty, { size: 30, weight: 500, ls: 0.16, align: "center", color: "#ffffff", alpha: dim });
    } else typedLabel(c, s, ax, ty, typing, t, { size: 30, weight: 500, ls: 0.16, align: "center", color: "#ffffff", alpha: dim, seed: li });
  });
  // the collapse ends in a single point of light
  if (collapse > 0) {
    c.save();
    c.globalCompositeOperation = "screen";
    glow(c, BRAIN_C.x, BRAIN_C.y, 60 + 260 * collapse, "#ffffff", 0.9 * collapse);
    c.restore();
    lit.fillStyle = rgba("#ffffff", collapse);
    lit.beginPath();
    lit.arc(BRAIN_C.x, BRAIN_C.y, 30 + 40 * collapse, 0, Math.PI * 2);
    lit.fill();
  }
  lit.restore();
  bloom(c, lit, 1, 30);
  vignette(c, 0.45, "#000000");
  grain(c, t, 0.16);
  void S;
}
