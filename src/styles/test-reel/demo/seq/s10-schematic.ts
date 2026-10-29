// S10 · «به جزئیات اینقدر دقت کردم، تا هر چیزی رو بتونه بسازه» (50.1 → 54.6) — r8's technical schematics on paper.
// «جزئیات»: a maple leaf drafted line by line (outline, veins), its true extents dimensioned, callouts; «دقت کردم»: a
// steel ruler slides in and a ×3 loupe sits on the serrated margin. «هر چیزی»: hard cuts on the beat to a pocket radio
// and a camera-lens cross-section with its ray diagram (balloon numbers + a parts list, like patent drawings). On the
// beat of «بسازه» we pull back to all four sheets on the desk (leaf, radio, lens, a house elevation) and BUILT is
// stamped on the word. The paper burns to black from the edges into the last shot.
import { blur, Ctx, H, W } from "../../lib/canvas";
import { grain, vignette } from "../../lib/fx";
import { txt } from "../../lib/hud";
import { clamp, ease, fbm, hash, k, lerp, rgba, rng } from "../../lib/math";
import { BEATS, Wd } from "../cues";

const PAPER = "#e9e7e2", INKC = "#151515", ACC = "#e2531c";
type P = [number, number];
const T0 = 50.1;
/** draw a polyline up to fraction p (pen tracing) */
function trace(c: Ctx, pts: P[], p: number) {
  if (p <= 0 || pts.length < 2) return;
  let L = 0;
  const seg = pts.slice(1).map((q, i) => {
    const d = Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]);
    L += d;
    return d;
  });
  let left = L * clamp(p);
  c.beginPath();
  c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    if (left >= seg[i - 1]) {
      c.lineTo(pts[i][0], pts[i][1]);
      left -= seg[i - 1];
    } else {
      const f = left / seg[i - 1];
      c.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f));
      break;
    }
  }
  c.stroke();
}
const bez = (a: P, b: P, cc: P, d: P, n = 16): P[] => Array.from({ length: n + 1 }, (_, i) => {
  const u = i / n, v = 1 - u;
  return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * cc[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * cc[1] + u * u * u * d[1]];
});
const circ = (cx: number, cy: number, r: number, n = 40, a0 = -Math.PI / 2): P[] => Array.from({ length: n + 1 }, (_, i) => [cx + Math.cos(a0 + (i / n) * Math.PI * 2) * r, cy + Math.sin(a0 + (i / n) * Math.PI * 2) * r]);
const rect = (x0: number, y0: number, x1: number, y1: number): P[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]];
/** rounded rectangle as a closed polyline (clockwise from the top edge) */
function rr(x0: number, y0: number, x1: number, y1: number, r: number): P[] {
  const pts: P[] = [];
  const corner = (cx: number, cy: number, a0: number) => {
    for (let i = 0; i <= 6; i++) {
      const a = a0 + (i / 6) * (Math.PI / 2);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  };
  corner(x1 - r, y0 + r, -Math.PI / 2);
  corner(x1 - r, y1 - r, 0);
  corner(x0 + r, y1 - r, Math.PI / 2);
  corner(x0 + r, y0 + r, Math.PI);
  pts.push(pts[0]);
  return pts;
}
const toPath = (pts: P[]) => {
  const p = new Path2D();
  pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y)));
  p.closePath();
  return p;
};
function pen(c: Ctx, w: number, col = INKC) {
  c.strokeStyle = col;
  c.lineWidth = w;
  c.lineJoin = "round";
  c.lineCap = "round";
}
/** parallel hatching inside a path (glass, earth, sections) */
function hatch(c: Ctx, clip: Path2D, x0: number, y0: number, x1: number, y1: number, gap: number, alpha = 0.4, p = 1) {
  if (p <= 0) return;
  c.save();
  c.clip(clip);
  c.strokeStyle = rgba(INKC, alpha);
  c.lineWidth = 1;
  c.beginPath();
  const h = y1 - y0, n = Math.ceil((x1 - x0 + h) / gap);
  for (let i = 0; i < n * clamp(p); i++) {
    const s = x0 - h + i * gap;
    c.moveTo(s, y1);
    c.lineTo(s + h, y0);
  }
  c.stroke();
  c.restore();
}
/** a dimension: extension lines from a and b, the dimension line `off` away on the left of a→b, arrowheads, the
 *  label upright in a gap of the line */
function dimLine(c: Ctx, a: P, b: P, off: number, label: string, p: number, ea: P = a, eb: P = b) {
  if (p <= 0) return;
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
  const ux = dx / L, uy = dy / L, nx = uy, ny = -ux;
  const sg = Math.sign(off) || 1;
  const A: P = [a[0] + nx * off, a[1] + ny * off], B: P = [b[0] + nx * off, b[1] + ny * off];
  const pe = clamp(p / 0.35), pd = clamp((p - 0.25) / 0.45);
  c.save();
  c.strokeStyle = ACC;
  c.fillStyle = ACC;
  c.lineWidth = 1.5;
  c.beginPath();
  for (const [o, e] of [[ea, A], [eb, B]] as [P, P][]) {
    // from the feature (a small gap) to just past the dimension line, along the normal
    const dl = (e[0] - o[0]) * nx + (e[1] - o[1]) * ny;
    const s0: P = [e[0] - nx * (dl - 8 * Math.sign(dl || 1)), e[1] - ny * (dl - 8 * Math.sign(dl || 1))], ex: P = [e[0] + nx * 10 * sg, e[1] + ny * 10 * sg];
    c.moveTo(s0[0], s0[1]);
    c.lineTo(lerp(s0[0], ex[0], pe), lerp(s0[1], ex[1], pe));
  }
  c.stroke();
  if (pd > 0) {
    const M: P = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
    const e0: P = [lerp(M[0], A[0], pd), lerp(M[1], A[1], pd)], e1: P = [lerp(M[0], B[0], pd), lerp(M[1], B[1], pd)];
    c.beginPath();
    c.moveTo(e0[0], e0[1]);
    c.lineTo(e1[0], e1[1]);
    c.stroke();
    if (pd > 0.97) {
      for (const [x, y, d] of [[A[0], A[1], 1], [B[0], B[1], -1]] as const) {
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + ux * 15 * d - nx * 4.5, y + uy * 15 * d - ny * 4.5);
        c.lineTo(x + ux * 15 * d + nx * 4.5, y + uy * 15 * d + ny * 4.5);
        c.closePath();
        c.fill();
      }
    }
    const la = clamp((p - 0.7) / 0.3);
    if (la > 0) {
      const ang = Math.atan2(uy, ux), up = Math.abs(ang) > Math.PI / 2 + 0.01 ? ang + Math.PI : ang;
      c.save();
      c.translate(M[0], M[1]);
      c.rotate(up);
      const w = label.length * 11.5 + 18;
      c.fillStyle = PAPER;
      c.fillRect(-w / 2, -12, w, 24);
      txt(c, label, 0, 1, { size: 19, weight: 600, ls: 0.06, align: "center", color: ACC, alpha: la });
      c.restore();
    }
  }
  c.restore();
}
/** a named callout: elbow leader from the target into a label column */
function callout(c: Ctx, target: P, lx: number, ly: number, s: string, p: number) {
  if (p <= 0) return;
  const q = clamp(p / 0.6), e: P = [lx - 46, ly];
  c.save();
  pen(c, 1.3);
  c.beginPath();
  c.moveTo(target[0], target[1]);
  if (q < 0.7) {
    const f = q / 0.7;
    c.lineTo(lerp(target[0], e[0], f), lerp(target[1], e[1], f));
  } else {
    c.lineTo(e[0], e[1]);
    c.lineTo(lerp(e[0], lx - 12, (q - 0.7) / 0.3), ly);
  }
  c.stroke();
  c.fillStyle = INKC;
  c.beginPath();
  c.arc(target[0], target[1], 3.6, 0, Math.PI * 2);
  c.fill();
  c.restore();
  txt(c, s, lx, ly, { size: 21, weight: 600, ls: 0.08, color: INKC, alpha: clamp((p - 0.4) / 0.4) });
}
/** a numbered balloon with its leader (patent-drawing style) */
function balloon(c: Ctx, target: P, at: P, n: number, p: number) {
  if (p <= 0) return;
  const q = clamp(p / 0.5), R = 17;
  const dx = at[0] - target[0], dy = at[1] - target[1], L = Math.hypot(dx, dy) || 1;
  const end: P = [at[0] - (dx / L) * R, at[1] - (dy / L) * R];
  c.save();
  pen(c, 1.3);
  c.beginPath();
  c.moveTo(target[0], target[1]);
  c.lineTo(lerp(target[0], end[0], q), lerp(target[1], end[1], q));
  c.stroke();
  c.fillStyle = INKC;
  c.beginPath();
  c.arc(target[0], target[1], 3.2, 0, Math.PI * 2);
  c.fill();
  if (q >= 1) {
    const s = ease.outBack(clamp((p - 0.5) / 0.3));
    c.fillStyle = PAPER;
    c.lineWidth = 1.8;
    c.beginPath();
    c.arc(at[0], at[1], R * Math.max(0.01, s), 0, Math.PI * 2);
    c.fill();
    c.stroke();
    txt(c, String(n), at[0], at[1] + 1, { size: 18, weight: 700, align: "center", color: INKC, alpha: clamp((p - 0.6) / 0.2) });
  }
  c.restore();
}
function partsList(c: Ctx, items: string[], x: number, y: number, p: number) {
  items.forEach((s, i) => {
    const a = clamp((p - i * 0.07) / 0.25);
    if (a <= 0) return;
    txt(c, String(i + 1).padStart(2, "0"), x, y + i * 34, { size: 17, weight: 700, ls: 0.06, color: ACC, alpha: a });
    txt(c, s, x + 44, y + i * 34, { size: 17, weight: 600, ls: 0.1, color: INKC, alpha: a });
  });
}
function sheet(c: Ctx, title: string, no: number, a: number) {
  c.fillStyle = PAPER;
  c.fillRect(0, 0, W, H);
  // faint 5 mm grid
  c.strokeStyle = rgba("#000000", 0.045);
  c.lineWidth = 1;
  c.beginPath();
  for (let x = 60; x < W; x += 30) {
    c.moveTo(x, 300);
    c.lineTo(x, 1640);
  }
  for (let y = 300; y < 1640; y += 30) {
    c.moveTo(60, y);
    c.lineTo(1020, y);
  }
  c.stroke();
  c.strokeStyle = INKC;
  c.lineWidth = 2;
  c.strokeRect(60, 300, 960, 1340);
  txt(c, title, 84, 340, { size: 26, weight: 700, ls: 0.12, color: INKC, alpha: a });
  // title block
  c.lineWidth = 1.4;
  c.strokeRect(620, 1560, 400, 80);
  c.beginPath();
  c.moveTo(620, 1600);
  c.lineTo(1020, 1600);
  c.moveTo(820, 1560);
  c.lineTo(820, 1640);
  c.stroke();
  const o = { size: 14, weight: 600 as const, ls: 0.12, color: INKC, alpha: 0.75 };
  txt(c, `DWG  AL-20-0${no}`, 634, 1581, o);
  txt(c, `SHEET  ${no}/4`, 834, 1581, o);
  txt(c, "SCALE  1:1", 634, 1621, o);
  txt(c, "DRAWN  ·  CLAUDE", 834, 1621, o);
  txt(c, "REV. 20", 84, 1612, { ...o, size: 16 });
}
// ---- 1 · the maple leaf: five lobes, serrated margin, veins ----
const LC = { x: 450, y: 1000, R: 360 };
let LEAF: { outline: P[]; veins: P[][]; box: [number, number, number, number]; petiole: P; tip: P; serr: P; pv: P; sv: P } | null = null;
function leaf() {
  const { x: cx, y: cy, R } = LC;
  const lobes: [number, number][] = [[-90, 1.0], [-38, 0.86], [10, 0.6], [170, 0.6], [218, 0.86]];
  const pts: P[] = [];
  const r = rng(5);
  const steps = 260;
  for (let i = 0; i <= steps; i++) {
    const a = (-90 + (i / steps) * 360) * (Math.PI / 180);
    let rad = 0.32;
    for (const [la, ll] of lobes) {
      const d = Math.abs((((a * 180) / Math.PI - la + 540) % 360) - 180);
      rad = Math.max(rad, ll * Math.exp(-(d * d) / (2 * 15 * 15)));
    }
    const bd = Math.abs((((a * 180) / Math.PI - 90 + 540) % 360) - 180);
    if (bd < 14) rad = Math.min(rad, 0.22);
    const ser = 0.025 * (i % 4 < 2 ? 1 : -0.4) * (rad > 0.4 ? 1 : 0.4);
    pts.push([cx + Math.cos(a) * R * (rad + ser + (r() - 0.5) * 0.006), cy + Math.sin(a) * R * (rad + ser)]);
  }
  const veins: P[][] = [];
  for (const [la, ll] of lobes) {
    const a = (la * Math.PI) / 180;
    veins.push(bez([cx, cy + 60], [cx + Math.cos(a) * R * 0.2, cy + Math.sin(a) * R * 0.2 + 30], [cx + Math.cos(a) * R * 0.6, cy + Math.sin(a) * R * 0.6], [cx + Math.cos(a) * R * ll * 0.94, cy + Math.sin(a) * R * ll * 0.94]));
    for (let s = 1; s <= 3; s++) {
      const f = s / 4.2, bx = cx + Math.cos(a) * R * ll * f, by = cy + Math.sin(a) * R * ll * f;
      for (const sd of [-1, 1]) {
        const b2 = a + sd * 0.75;
        veins.push([[bx, by], [bx + Math.cos(b2) * R * 0.16, by + Math.sin(b2) * R * 0.16]]);
      }
    }
  }
  const petiole: P = [cx, cy + R * 0.62];
  veins.push([[cx, cy + 60], petiole]);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const box: [number, number, number, number] = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  const tip = pts.reduce((m, p) => (p[1] < m[1] ? p : m), pts[0]);
  const serr = pts[Math.round((88 / 360) * steps)]; // just below the right lobe's sinus: teeth along the flank
  // veins: each lobe pushes its primary then six secondaries — lobe 1 (upper right) is veins[7..13]
  LEAF = { outline: pts, veins, box, petiole, tip, serr, pv: veins[7][9], sv: veins[10][1] };
}
function drawLeaf(c: Ctx, t: number, full = false) {
  if (!LEAF) leaf();
  const L = LEAF!;
  const at = (a: number, b: number, f: (x: number) => number = ease.inOut) => (full ? 1 : k(t, a, b, f));
  sheet(c, "TECHNICAL SCHEMATIC: LEAF", 1, full ? 1 : clamp((t - T0) / 0.2));
  const pO = at(T0 + 0.05, Wd(10, "جزئیات") + 0.55);
  const pV = at(Wd(10, "جزئیات") + 0.1, Wd(10, "اینقدر") + 0.4);
  c.save();
  pen(c, 3);
  trace(c, L.outline, pO);
  c.lineWidth = 1.6;
  L.veins.forEach((v, i) => trace(c, v, clamp(pV * 1.6 - i * 0.03)));
  c.restore();
  // the true extents: width over the lobe tips, height from the top lobe to the end of the petiole
  const [x0, y0, x1] = L.box;
  const wpx = x1 - x0, hpx = L.petiole[1] - y0;
  const left = L.outline.reduce((m, q) => (q[0] < m[0] ? q : m), L.outline[0]), right = L.outline.reduce((m, q) => (q[0] > m[0] ? q : m), L.outline[0]);
  dimLine(c, [x0, y0], [x1, y0], 46, "120 mm", at(Wd(10, "اینقدر") - 0.1, Wd(10, "دقت") + 0.1), left, right);
  dimLine(c, [x0, L.petiole[1]], [x0, y0], 52, `${Math.round((120 * hpx) / wpx)} mm`, at(Wd(10, "اینقدر"), Wd(10, "دقت") + 0.2), L.petiole, L.tip);
  const tc0 = Wd(10, "دقت") - 0.1;
  const cp = (i: number) => (full ? 1 : clamp((t - tc0 - i * 0.09) / 0.3));
  const LX = 790;
  callout(c, L.tip, LX, 650, "LOBE TIP", cp(0));
  callout(c, L.pv, LX, 750, "PRIMARY VEIN", cp(1));
  callout(c, L.sv, LX, 850, "SECONDARY VEIN", cp(2));
  callout(c, L.serr, LX, 990, "SERRATE MARGIN", cp(3));
  callout(c, L.petiole, LX, 1200, "PETIOLE", cp(4));
  if (full) return;
  // the steel ruler slides in under the leaf
  const ru = k(t, Wd(10, "دقت") - 0.2, Wd(10, "کردم،") + 0.1, ease.out);
  if (ru > 0) {
    const y = 1430, rx = lerp(-900, 110, ru);
    const g = c.createLinearGradient(0, y, 0, y + 70);
    g.addColorStop(0, "#d9dcdf");
    g.addColorStop(0.5, "#a9aeb3");
    g.addColorStop(1, "#cfd3d6");
    c.fillStyle = rgba("#000000", 0.2);
    c.fillRect(rx + 8, y + 10, 860, 70);
    c.fillStyle = g;
    c.fillRect(rx, y, 860, 70);
    c.strokeStyle = "#2a2a2a";
    c.lineWidth = 1.4;
    c.beginPath();
    for (let i = 0; i <= 160; i++) {
      const x = rx + 20 + i * 5.1, l = i % 10 === 0 ? 26 : i % 5 === 0 ? 18 : 10;
      c.moveTo(x, y);
      c.lineTo(x, y + l);
    }
    c.stroke();
    for (let i = 0; i <= 16; i++) txt(c, String(i), rx + 20 + i * 51, y + 44, { size: 15, weight: 600, align: "center", color: "#2a2a2a" });
  }
  // a ×3 loupe on the serrated margin
  const lp = k(t, Wd(10, "کردم،") - 0.05, Wd(10, "کردم،") + 0.3, ease.outBack) * (1 - k(t, Wd(10, "هر") - 0.2, Wd(10, "هر")));
  if (lp > 0) {
    const [lx, ly] = [L.serr[0] - 18, L.serr[1] + 6], r = 104 * lp;
    c.save();
    c.fillStyle = rgba("#000000", 0.18);
    c.beginPath();
    c.arc(lx + 10, ly + 14, r + 6, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.arc(lx, ly, r, 0, Math.PI * 2);
    c.clip();
    c.fillStyle = PAPER;
    c.fillRect(lx - r, ly - r, 2 * r, 2 * r);
    c.translate(lx, ly);
    c.scale(3, 3);
    c.translate(-lx, -ly);
    pen(c, 1.1);
    trace(c, L.outline, 1);
    c.lineWidth = 0.6;
    L.veins.forEach((v) => trace(c, v, 1));
    c.restore();
    // glass sheen + the rim
    c.save();
    c.beginPath();
    c.arc(lx, ly, r, 0, Math.PI * 2);
    c.clip();
    const sh = c.createLinearGradient(lx - r, ly - r, lx + r, ly + r);
    sh.addColorStop(0, rgba("#ffffff", 0.28));
    sh.addColorStop(0.45, rgba("#ffffff", 0));
    c.fillStyle = sh;
    c.fillRect(lx - r, ly - r, 2 * r, 2 * r);
    c.restore();
    pen(c, 7);
    c.beginPath();
    c.arc(lx, ly, r, 0, Math.PI * 2);
    c.stroke();
    txt(c, "×3", lx + r * 0.78, ly - r * 0.9, { size: 22, weight: 700, color: ACC, alpha: clamp(lp) });
  }
}
// ---- 2 · a pocket radio ----
function drawRadio(c: Ctx, p: number) {
  sheet(c, "TECHNICAL SCHEMATIC: POCKET RADIO", 2, clamp(p * 4));
  const s = (a: number, b: number) => clamp((p - a) / (b - a));
  c.save();
  pen(c, 2.8);
  trace(c, rr(140, 840, 600, 1140, 38), s(0, 0.35));
  pen(c, 1.4);
  trace(c, rr(156, 856, 584, 1124, 26), s(0.08, 0.4));
  // feet
  trace(c, [[190, 1140], [190, 1152], [250, 1152], [250, 1140]], s(0.3, 0.42));
  trace(c, [[490, 1140], [490, 1152], [550, 1152], [550, 1140]], s(0.3, 0.42));
  // speaker grille: a ring and a hex field of perforations growing from the centre
  pen(c, 2);
  trace(c, circ(280, 990, 104), s(0.12, 0.42));
  trace(c, circ(280, 990, 96), s(0.16, 0.44));
  const g = s(0.2, 0.62);
  c.fillStyle = INKC;
  for (let row = -5; row <= 5; row++)
    for (let col = -5; col <= 5; col++) {
      const x = 280 + col * 19 + (row % 2 ? 9.5 : 0), y = 990 + row * 16.5, d = Math.hypot(x - 280, y - 990);
      if (d > 86 || d / 86 > g) continue;
      c.beginPath();
      c.arc(x, y, 4, 0, Math.PI * 2);
      c.fill();
    }
  // tuning panel: window, scale, numbers, needle
  pen(c, 2);
  trace(c, rect(400, 880, 570, 944), s(0.18, 0.45));
  pen(c, 1.2);
  trace(c, rect(408, 888, 562, 936), s(0.22, 0.48));
  const ts = s(0.3, 0.6);
  c.beginPath();
  for (let i = 0; i <= 20; i++) {
    if (i / 20 > ts) break;
    const x = 414 + i * 7.1, l = i % 4 === 0 ? 12 : 6;
    c.moveTo(x, 936);
    c.lineTo(x, 936 - l);
  }
  c.stroke();
  ["88", "92", "96", "100", "104", "108"].forEach((n, i) => txt(c, n, 414 + i * 28.4, 903, { size: 12, weight: 600, align: "center", color: INKC, alpha: clamp(ts * 6 - i) }));
  if (ts > 0.5) {
    c.save();
    pen(c, 2.4, ACC);
    c.beginPath();
    c.moveTo(470.8, 889);
    c.lineTo(470.8, 935);
    c.stroke();
    c.restore();
  }
  // brand plate
  pen(c, 1.4);
  trace(c, rr(400, 962, 570, 992, 9), s(0.32, 0.55));
  txt(c, "AM  ·  FM", 485, 978, { size: 13, weight: 700, ls: 0.3, align: "center", color: INKC, alpha: s(0.5, 0.65) });
  // two knurled knobs with pointers
  for (const [kx, ang] of [[440, -0.9], [530, 0.6]] as const) {
    pen(c, 2);
    trace(c, circ(kx, 1070, 30), s(0.3, 0.55));
    pen(c, 1.2);
    trace(c, circ(kx, 1070, 19), s(0.35, 0.58));
    const kn = s(0.4, 0.7);
    c.beginPath();
    for (let i = 0; i < 24 * kn; i++) {
      const a = (i / 24) * Math.PI * 2;
      c.moveTo(kx + Math.cos(a) * 30, 1070 + Math.sin(a) * 30);
      c.lineTo(kx + Math.cos(a) * 35, 1070 + Math.sin(a) * 35);
    }
    c.stroke();
    if (kn > 0.5) {
      pen(c, 2.4);
      c.beginPath();
      c.moveTo(kx, 1070);
      c.lineTo(kx + Math.sin(ang) * 17, 1070 - Math.cos(ang) * 17);
      c.stroke();
    }
  }
  // corner screws
  for (const [x, y] of [[176, 876], [564, 876], [176, 1104], [564, 1104]] as const) {
    pen(c, 1.4);
    trace(c, circ(x, y, 7, 16), s(0.4, 0.6));
    if (p > 0.6) {
      c.beginPath();
      c.moveTo(x - 4.5, y + 4.5);
      c.lineTo(x + 4.5, y - 4.5);
      c.stroke();
    }
  }
  // telescopic antenna: three tubes narrowing to a ball tip
  const ux = 0.447, uy = -0.894, ax = 560, ay = 840;
  const segs: [number, number, number][] = [[0, 122, 6.5], [118, 226, 4.5], [222, 312, 2.8]];
  segs.forEach(([a, b, hw], i) => {
    const q = s(0.35 + i * 0.08, 0.5 + i * 0.08);
    if (q <= 0) return;
    const bb = lerp(a, b, q), nx = -uy * hw, ny = ux * hw;
    pen(c, 1.5);
    c.beginPath();
    c.moveTo(ax + ux * a + nx, ay + uy * a + ny);
    c.lineTo(ax + ux * bb + nx, ay + uy * bb + ny);
    c.lineTo(ax + ux * bb - nx, ay + uy * bb - ny);
    c.lineTo(ax + ux * a - nx, ay + uy * a - ny);
    c.closePath();
    c.stroke();
  });
  if (p > 0.66) {
    pen(c, 1.6);
    c.beginPath();
    c.arc(ax + ux * 320, ay + uy * 320, 7.5, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(ax, ay, 9, 0, Math.PI * 2);
    c.stroke();
  }
  c.restore();
  // dimensions, balloons, parts list
  dimLine(c, [140, 1152], [600, 1152], -50, "148 mm", s(0.45, 0.8));
  dimLine(c, [140, 1140], [140, 840], 46, "96 mm", s(0.5, 0.85));
  const bp = (i: number) => s(0.5 + i * 0.06, 0.78 + i * 0.06);
  balloon(c, [ax + ux * 200, ay + uy * 200], [760, 690], 1, bp(0));
  balloon(c, [562, 912], [690, 880], 2, bp(1));
  balloon(c, [235, 900], [200, 770], 3, bp(2));
  balloon(c, [553, 1090], [680, 1090], 4, bp(3));
  partsList(c, ["TELESCOPIC ANTENNA", "TUNING SCALE  88–108 MHz", "SPEAKER GRILLE  Ø 66 mm", "VOLUME / TUNE KNOBS"], 110, 1300, s(0.6, 1));
}
// ---- 3 · a camera lens in cross-section, with its ray diagram ----
const AX = 1000;
/** a lens element: left surface through (x0−s0, axis), right surface through (x1+s1, axis), half-height h */
function element(x0: number, x1: number, h: number, s0: number, s1: number) {
  const p = new Path2D();
  p.moveTo(x0, AX - h);
  p.quadraticCurveTo(x0 - 2 * s0, AX, x0, AX + h);
  p.lineTo(x1, AX + h);
  p.quadraticCurveTo(x1 + 2 * s1, AX, x1, AX - h);
  p.closePath();
  return p;
}
const ELEMENTS: [number, number, number, number, number][] = [
  [212, 238, 142, 26, -16],
  [278, 314, 112, -14, -14],
  [360, 396, 108, 20, 20],
  [396, 430, 108, -20, -4],
  [520, 548, 96, 16, 12],
  [590, 612, 90, -8, 10],
];
const BARREL: [number, number][] = [[190, 150], [190, 196], [262, 196], [262, 176], [300, 176], [300, 186], [440, 186], [440, 176], [470, 176], [470, 182], [548, 182], [548, 166], [650, 166], [650, 140], [700, 140], [700, 126], [726, 126], [726, 108]];
function drawLens(c: Ctx, p: number) {
  sheet(c, "TECHNICAL SCHEMATIC: CAMERA LENS", 3, clamp(p * 4));
  const s = (a: number, b: number) => clamp((p - a) / (b - a));
  c.save();
  // optical axis (dash-dot)
  c.save();
  pen(c, 1.4, ACC);
  c.setLineDash([26, 7, 4, 7]);
  trace(c, [[110, AX], [980, AX]], s(0, 0.3));
  c.restore();
  // the barrel, top and bottom
  pen(c, 2.6);
  for (const sg of [-1, 1]) trace(c, BARREL.map(([x, r]) => [x, AX + sg * r] as P), s(0.04, 0.4));
  pen(c, 1.3);
  for (const sg of [-1, 1]) trace(c, [[196, AX + sg * 150], [650, AX + sg * 150], [650, AX + sg * 120], [726, AX + sg * 108]], s(0.1, 0.42));
  // focus-ring knurling and aperture-ring ticks
  const kn = s(0.25, 0.55);
  c.beginPath();
  for (let x = 304; x < 438 * 1; x += 6) {
    if ((x - 304) / 134 > kn) break;
    for (const sg of [-1, 1]) {
      c.moveTo(x, AX + sg * 176);
      c.lineTo(x, AX + sg * 186);
    }
  }
  for (let x = 476; x < 546; x += 12) {
    if ((x - 476) / 70 > kn) break;
    c.moveTo(x, AX - 182);
    c.lineTo(x, AX - 174);
  }
  c.stroke();
  // elements: outlined, then hatched like glass in section
  ELEMENTS.forEach(([x0, x1, h, s0, s1], i) => {
    const q = s(0.12 + i * 0.05, 0.38 + i * 0.05);
    if (q <= 0) return;
    const path = element(x0, x1, h, s0, s1);
    c.save();
    c.globalAlpha *= clamp(q * 1.5);
    c.fillStyle = rgba("#ffffff", 0.35);
    c.fill(path);
    hatch(c, path, x0 - 40, AX - h, x1 + 40, AX + h, 9, 0.32, q);
    pen(c, 2);
    c.stroke(path);
    c.restore();
  });
  // iris diaphragm
  const ir = s(0.4, 0.6);
  if (ir > 0) {
    pen(c, 5);
    c.beginPath();
    c.moveTo(470, AX - 176);
    c.lineTo(470, AX - lerp(176, 62, ir));
    c.moveTo(470, AX + 176);
    c.lineTo(470, AX + lerp(176, 62, ir));
    c.stroke();
  }
  // rays from infinity: spread a little after the negative group, converge on the focal point
  const F: P = [900, AX];
  const g = [[110, 1], [212, 1], [300, 1.06], [413, 0.97], [470, 0.9], [534, 0.79], [601, 0.64], [900, 0]] as const;
  const rp = s(0.45, 0.9);
  c.save();
  pen(c, 1.3, rgba(ACC, 0.85));
  for (const h0 of [118, 64, -64, -118]) trace(c, g.map(([x, f]) => [x, AX - h0 * f] as P), rp);
  c.restore();
  if (rp > 0.95) {
    c.fillStyle = ACC;
    c.beginPath();
    c.arc(F[0], F[1], 6, 0, Math.PI * 2);
    c.fill();
    txt(c, "F", F[0] + 2, F[1] + 30, { size: 19, weight: 700, align: "center", color: ACC });
  }
  c.restore();
  dimLine(c, [190, AX - 196], [726, AX - 196], 58, "62 mm", s(0.5, 0.85));
  dimLine(c, [580, AX + 186], [900, AX + 186], -66, "f = 50 mm", s(0.6, 0.95));
  const bp = (i: number) => s(0.55 + i * 0.05, 0.8 + i * 0.05);
  balloon(c, [214, AX - 96], [128, 690], 1, bp(0));
  balloon(c, [372, AX - 186], [372, 690], 2, bp(1));
  balloon(c, [398, AX + 70], [330, 1330], 3, bp(2));
  balloon(c, [470, AX + 120], [500, 1330], 4, bp(3));
  balloon(c, [712, AX - 126], [780, 690], 5, bp(4));
  balloon(c, [F[0], F[1]], [960, 900], 6, bp(5));
  partsList(c, ["FRONT ELEMENT", "FOCUS RING", "CEMENTED DOUBLET", "IRIS DIAPHRAGM", "BAYONET MOUNT", "FOCAL POINT"], 110, 1400, s(0.65, 1));
}
// ---- 4 · a house elevation (only on the final spread) ----
function drawHouse(c: Ctx) {
  sheet(c, "TECHNICAL SCHEMATIC: HOUSE", 4, 1);
  c.save();
  // ground + earth hatch
  pen(c, 3);
  trace(c, [[120, 1220], [960, 1220]], 1);
  pen(c, 1.1);
  c.beginPath();
  for (let x = 126; x < 960; x += 14) {
    c.moveTo(x, 1222);
    c.lineTo(x - 12, 1240);
  }
  c.stroke();
  // walls with siding
  c.fillStyle = PAPER;
  c.fillRect(230, 900, 620, 320);
  c.strokeStyle = rgba(INKC, 0.28);
  c.lineWidth = 1;
  c.beginPath();
  for (let y = 924; y < 1220; y += 24) {
    c.moveTo(230, y);
    c.lineTo(850, y);
  }
  c.stroke();
  pen(c, 2.6);
  trace(c, rect(230, 900, 850, 1220), 1);
  // windows (masked from the siding), mullions, sills
  for (const x of [290, 670]) {
    c.fillStyle = PAPER;
    c.fillRect(x, 960, 120, 140);
    pen(c, 2.2);
    trace(c, rect(x, 960, x + 120, 1100), 1);
    pen(c, 1.2);
    trace(c, rect(x + 8, 968, x + 112, 1092), 1);
    trace(c, [[x + 60, 968], [x + 60, 1092]], 1);
    trace(c, [[x + 8, 1030], [x + 112, 1030]], 1);
    pen(c, 2);
    trace(c, rect(x - 10, 1100, x + 130, 1110), 1);
  }
  // door with panels, knob, step
  c.fillStyle = PAPER;
  c.fillRect(500, 1040, 80, 180);
  pen(c, 2.2);
  trace(c, rect(500, 1040, 580, 1220), 1);
  pen(c, 1.2);
  for (const [x0, y0, y1] of [[510, 1052, 1122], [544, 1052, 1122], [510, 1134, 1208], [544, 1134, 1208]] as const) trace(c, rect(x0, y0, x0 + 26, y1), 1);
  c.fillStyle = INKC;
  c.beginPath();
  c.arc(570, 1130, 4, 0, Math.PI * 2);
  c.fill();
  pen(c, 2);
  trace(c, rect(486, 1208, 594, 1220), 1);
  // roof with tile courses, attic window, chimney
  const roof = toPath([[190, 910], [540, 640], [890, 910], [870, 925], [540, 672], [210, 925]]);
  c.fillStyle = PAPER;
  c.fill(roof);
  c.save();
  c.clip(roof);
  c.strokeStyle = rgba(INKC, 0.45);
  c.lineWidth = 1;
  c.beginPath();
  for (let y = 650; y < 930; y += 14) {
    c.moveTo(150, y);
    c.lineTo(930, y);
  }
  c.stroke();
  c.restore();
  pen(c, 2.6);
  c.stroke(roof);
  // gable wall under the roof + the round attic window
  c.fillStyle = PAPER;
  c.fill(toPath([[230, 900], [540, 672], [850, 900]]));
  pen(c, 2.2);
  trace(c, [[230, 900], [540, 672], [850, 900]], 1);
  trace(c, circ(540, 800, 34), 1);
  pen(c, 1.2);
  trace(c, circ(540, 800, 26), 1);
  trace(c, [[514, 800], [566, 800]], 1);
  trace(c, [[540, 774], [540, 826]], 1);
  c.fillStyle = PAPER;
  c.fillRect(680, 640, 55, 140);
  pen(c, 2.2);
  trace(c, [[680, 748], [680, 640], [735, 640], [735, 790]], 1);
  trace(c, rect(672, 628, 743, 640), 1);
  c.restore();
  dimLine(c, [230, 1220], [850, 1220], -70, "9.40 m", 1);
  dimLine(c, [940, 1220], [940, 640], -30, "8.80 m", 1);
  balloon(c, [540, 640], [540, 560], 1, 1);
  balloon(c, [708, 628], [790, 580], 2, 1);
  balloon(c, [290, 1030], [160, 1030], 3, 1);
  balloon(c, [580, 1150], [690, 1165], 4, 1);
  partsList(c, ["RIDGE", "CHIMNEY", "WINDOW  W-01", "DOOR  D-01"], 110, 1400, 1);
}
// ---- the final spread: all four sheets on the desk, stamped ----
const GRID = { s: 0.46, xs: [276.5, 803.5], ys: [503.5, 1416.5] };
function spread(c: Ctx, t: number, tAll: number, tStamp: number) {
  const z = ease.outQuint(clamp((t - tAll) / 0.3));
  const stamp = t >= tStamp ? Math.exp(-(t - tStamp) / 0.09) : 0;
  const shake = stamp * 9;
  c.fillStyle = "#1b1a18";
  c.fillRect(0, 0, W, H);
  c.save();
  c.translate(Math.sin(t * 91) * shake, Math.cos(t * 77) * shake);
  const sheets: [number, number, (cc: Ctx) => void, number][] = [
    [0, 0, (cc) => drawLeaf(cc, t, true), -0.025],
    [1, 0, (cc) => drawRadio(cc, 1), 0.02],
    [0, 1, (cc) => drawLens(cc, 1), 0.015],
    [1, 1, (cc) => drawHouse(cc), -0.02],
  ];
  // the lens sheet (the one on screen) shrinks into its place; the others slide in around it
  sheets.forEach(([gx, gy, draw, rot], i) => {
    const isLens = i === 2;
    const cx = GRID.xs[gx], cy = GRID.ys[gy];
    const fx = isLens ? lerp(540, cx, z) : cx + (gx ? 1 : -1) * 700 * (1 - z), fy = isLens ? lerp(960, cy, z) : cy + (gy ? 1 : -1) * 300 * (1 - z);
    const sc = isLens ? lerp(1, GRID.s, z) : GRID.s;
    c.save();
    c.translate(fx, fy);
    c.rotate(rot * z);
    c.scale(sc, sc);
    c.translate(-540, -960);
    c.fillStyle = rgba("#000000", 0.45 * z);
    c.fillRect(24, 34, W, H);
    c.beginPath();
    c.rect(0, 0, W, H);
    c.clip();
    draw(c);
    c.restore();
  });
  // BUILT, stamped on its word
  const st = t >= tStamp ? ease.outBack(clamp((t - tStamp) / 0.16)) : 0;
  if (st > 0) {
    c.save();
    c.translate(540, 960);
    c.rotate(-0.16);
    c.scale(1.7 - 0.7 * st, 1.7 - 0.7 * st);
    c.globalAlpha = Math.min(1, st);
    // ink: a solid stamp with worn gaps
    c.fillStyle = rgba(ACC, 0.94);
    c.beginPath();
    c.roundRect(-210, -74, 420, 148, 10);
    c.roundRect(-196, -60, 392, 120, 6);
    c.fill("evenodd");
    txt(c, "BUILT", 0, 6, { size: 96, weight: 700, ls: 0.22, align: "center", color: ACC });
    c.globalCompositeOperation = "destination-out";
    const r = rng(41);
    for (let i = 0; i < 120; i++) {
      c.fillStyle = rgba("#000000", 0.5 + 0.5 * r());
      c.beginPath();
      c.arc((r() - 0.5) * 420, (r() - 0.5) * 148, 0.8 + r() * 2.6, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  }
  c.restore();
}
export function seqS10(c: Ctx, t: number) {
  const tAny = Wd(10, "هر") - 0.06;
  const tLens = BEATS.find((b) => b > tAny + 0.3) ?? tAny + 0.6;
  const tAll = BEATS.find((b) => b > tLens + 0.3) ?? tLens + 0.47;
  const tStamp = Math.max(tAll + 0.1, Wd(10, "بسازه.") + 0.02);
  if (t < tAny) drawLeaf(c, t);
  else if (t < tLens) drawRadio(c, ease.out(clamp((t - tAny) / 0.48)));
  else if (t < tAll) drawLens(c, ease.out(clamp((t - tLens) / 0.42)));
  else spread(c, t, tAll, tStamp);
  // the paper burns to black from the edges: a ragged ember line closing in, scorched paper just inside it
  const burn = k(t, 54.1, 54.6, ease.in);
  if (burn > 0) {
    const R0 = lerp(1150, -120, burn);
    const edge = new Path2D();
    const N = 180;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      const n = fbm(Math.cos(a) * 1.8 + 7.3, Math.sin(a) * 1.8 + 3.1, 4) - 0.5;
      const rr = Math.max(0, R0 + 180 * n + 16 * Math.sin(a * 17 + t * 4));
      const x = 540 + Math.cos(a) * rr, y = 960 + Math.sin(a) * rr * 1.3;
      if (i) edge.lineTo(x, y);
      else edge.moveTo(x, y);
    }
    edge.closePath();
    c.save();
    c.clip(edge);
    c.filter = blur(18);
    c.strokeStyle = rgba("#5a2a0c", 0.75);
    c.lineWidth = 90;
    c.stroke(edge);
    c.restore();
    const out = new Path2D();
    out.rect(-20, -20, W + 40, H + 40);
    out.addPath(edge);
    c.fillStyle = "#000";
    c.fill(out, "evenodd");
    c.save();
    c.globalCompositeOperation = "screen";
    c.filter = blur(6);
    c.strokeStyle = rgba("#ff6a1a", 0.9);
    c.lineWidth = 14;
    c.stroke(edge);
    c.filter = "none";
    c.strokeStyle = rgba("#ffd28a", 0.9);
    c.lineWidth = 2.5;
    c.stroke(edge);
    c.restore();
  }
  vignette(c, 0.25, "#3a3530");
  grain(c, t, 0.12);
  void hash;
}
