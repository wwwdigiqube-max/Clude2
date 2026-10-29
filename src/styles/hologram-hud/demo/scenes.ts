// Hologram HUD demo (the reference film, video 22) «ساعت‌های GPS و اینشتین» — the shots (v2). Pure functions of time; every phrase of the narration gets its
// own animation and the camera never rests (user, v1: «جزئیات بیشتر، موشن‌های جذاب‌تر، مسیر ویدئو انرژی داشته باشه،
// مخاطب رو با انیمیشن‌های مختلف سرگرم کن»). Holograms are GPT Image renders (public/styles/hologram-hud/img) on black, composited as
// light over the projector beam. Image anchors (u, v) were measured on the renders.
import { Ctx, scale } from "../lib/canvas";
import { clamp, ease, hash, k, lerp, noise2, rgba, rng, TAU } from "../lib/math";
import { beam, brackets, burst, Chart, chartAxes, chartLine, chevrons, clockFace, dial, glowDot, grp, holo, HoloOpt, hud, hudW, numUnit, odometer, P, pinShape, reticle, rings, ruler, shock, sparks, toggle, typed } from "../lib/holo";
import { SH, Wd } from "./cues";

// ---------------- shared helpers ----------------
const rev = (t: number, t0: number, d = 0.55) => ease.out(clamp((t - t0) / d));
/** scale-in with overshoot, 0 before t0 */
const pop = (t: number, t0: number, d = 0.4) => (t < t0 ? 0 : ease.outBack(clamp((t - t0) / d)));
/** an impact envelope: 1 at t0, decays */
const hit = (t: number, t0: number, d = 0.3) => (t < t0 ? 0 : Math.exp(-(t - t0) / d));

/** a local camera: zoom z about the world point (fx, fy), which lands on the screen point (ax, ay) */
type LCam = { ax: number; ay: number; fx: number; fy: number; z: number; rot?: number };
function cam(c: Ctx, m: LCam) {
  c.translate(m.ax, m.ay);
  if (m.rot) c.rotate(m.rot);
  c.scale(m.z, m.z);
  c.translate(-m.fx, -m.fy);
}
const toS = (m: LCam, x: number, y: number): [number, number] => [m.ax + (x - m.fx) * m.z, m.ay + (y - m.fy) * m.z];

/** a hologram that assembles from sparks behind a rising scan line */
function materialize(c: Ctx, name: string, x: number, y: number, w: number, t: number, t0: number, seed: number, o: HoloOpt = {}, d = 0.6) {
  sparks(c, x, y, w * 0.55, w * 0.4, clamp((t - t0 + 0.3) / (d + 0.3)), seed);
  return holo(c, name, x, y, w, t, { ...o, reveal: rev(t, t0, d), seed });
}
function miniSat(c: Ctx, x: number, y: number, w: number, t: number, a = 1, seed = 1) {
  if (a <= 0.003 || w <= 1) return;
  holo(c, "satellite", x, y, w, t, { alpha: a, glitch: 0, seed, life: 0.4 });
}
/** a callout: a ring on the anchor, a leader line to an elbow, a typed label over a short underline (side ±1) */
function callout(c: Ctx, ax: number, ay: number, ex: number, ey: number, label: string, p: number, t: number, side: number, a = 1) {
  if (p <= 0 || a <= 0.003) return;
  const w = hudW(c, label, 24) + 26;
  const u1 = clamp(p / 0.35), u2 = clamp((p - 0.35) / 0.25);
  c.save();
  c.globalAlpha = clamp(p * 5) * a;
  c.strokeStyle = P.hi;
  c.lineWidth = 2;
  c.beginPath();
  c.arc(ax, ay, 10 + 3 * Math.sin(t * 5), 0, TAU);
  c.stroke();
  c.fillStyle = P.hot;
  c.beginPath();
  c.arc(ax, ay, 3.5, 0, TAU);
  c.fill();
  c.beginPath();
  c.moveTo(ax, ay);
  c.lineTo(lerp(ax, ex, u1), lerp(ay, ey, u1));
  if (u2 > 0) c.lineTo(ex + side * w * u2, ey);
  c.stroke();
  c.restore();
  typed(c, label, ex + (side * w) / 2, ey - 24, clamp((p - 0.5) / 0.5) * a, t, { size: 24, color: P.hi, alpha: a });
}
/** a dotted line with pulses running along it (a signal) */
function signal(c: Ctx, ax: number, ay: number, bx: number, by: number, t: number, p: number, col = P.amber) {
  if (p <= 0) return;
  const n = Math.max(8, Math.round(Math.hypot(bx - ax, by - ay) / 22)), m = Math.floor(n * clamp(p));
  c.save();
  c.fillStyle = col;
  for (let i = 0; i <= m; i++) {
    const u = i / n;
    c.globalAlpha = 0.3 + 0.7 * Math.max(0, Math.sin((u * 4 - t * 3.2) * Math.PI));
    c.beginPath();
    c.arc(lerp(ax, bx, u), lerp(ay, by, u), 3.5, 0, TAU);
    c.fill();
  }
  c.restore();
}
/** a Latin number in a ring */
function badge(c: Ctx, x: number, y: number, s: string, a: number, col = P.hot) {
  if (a <= 0.003) return;
  c.save();
  c.globalAlpha *= clamp(a);
  c.fillStyle = rgba("#000000", 0.55);
  c.strokeStyle = col;
  c.lineWidth = 2.5;
  c.beginPath();
  c.arc(x, y, 22, 0, TAU);
  c.fill();
  c.stroke();
  c.restore();
  hud(c, s, x, y + 1, { size: 21, color: col, alpha: a, weight: 700 });
}
/** an atom: three tilted electron orbits round a glowing nucleus */
function atom(c: Ctx, x: number, y: number, r: number, t: number, a: number, col = P.hot) {
  if (a <= 0.003 || r <= 0.5) return;
  c.save();
  c.globalAlpha *= clamp(a);
  c.strokeStyle = col;
  c.lineWidth = 2;
  for (let e = 0; e < 3; e++) {
    const rot = (e * Math.PI) / 3 + t * 0.7;
    c.beginPath();
    c.ellipse(x, y, r, r * 0.36, rot, 0, TAU);
    c.stroke();
    const u = t * 4.5 + e * 2.1, ex = Math.cos(u) * r, ey = Math.sin(u) * r * 0.36;
    c.fillStyle = P.hot;
    c.beginPath();
    c.arc(x + ex * Math.cos(rot) - ey * Math.sin(rot), y + ex * Math.sin(rot) + ey * Math.cos(rot), 3.5, 0, TAU);
    c.fill();
  }
  c.fillStyle = col;
  c.shadowColor = col;
  c.shadowBlur = 14 * scale();
  c.beginPath();
  c.arc(x, y, r * 0.2, 0, TAU);
  c.fill();
  c.restore();
}
/** a radar sweep with range rings */
function radar(c: Ctx, x: number, y: number, r: number, t: number, a: number) {
  const ang = t * 3.4;
  c.save();
  const g = c.createConicGradient(ang, x, y);
  g.addColorStop(0, rgba(P.amber, 0));
  g.addColorStop(0.8, rgba(P.amber, 0));
  g.addColorStop(1, rgba(P.amber, 0.32 * a));
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
  c.strokeStyle = rgba(P.amber, 0.22 * a);
  c.lineWidth = 1.5;
  for (let i = 1; i <= 3; i++) {
    c.beginPath();
    c.arc(x, y, (r * i) / 3, 0, TAU);
    c.stroke();
  }
  c.strokeStyle = rgba(P.hi, 0.8 * a);
  c.lineWidth = 2.5;
  c.beginPath();
  c.moveTo(x, y);
  c.lineTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r);
  c.stroke();
  c.restore();
}
/** the limb of a wireframe Earth (only the rim and the top of its grid, fading downward; no fill, so the
 *  projector below stays visible) */
function limb(c: Ctx, cx: number, cy: number, r: number, t: number, a: number) {
  if (a <= 0.003) return;
  const top = cy - r;
  c.save();
  const glow = c.createRadialGradient(cx, cy, r * 0.985, cx, cy, r * 1.07);
  glow.addColorStop(0, rgba(P.amber, 0.3 * a));
  glow.addColorStop(1, rgba(P.amber, 0));
  c.fillStyle = glow;
  c.beginPath();
  c.arc(cx, cy, r * 1.07, Math.PI * 1.05, Math.PI * 1.95);
  c.arc(cx, cy, r * 0.985, Math.PI * 1.95, Math.PI * 1.05, true);
  c.fill();
  c.beginPath();
  c.arc(cx, cy, r, 0, TAU);
  c.clip();
  const fade = c.createLinearGradient(0, top, 0, top + 300);
  fade.addColorStop(0, rgba(P.amber, 0.32 * a));
  fade.addColorStop(1, rgba(P.amber, 0));
  c.strokeStyle = fade;
  c.lineWidth = 1.6;
  for (let i = 1; i <= 7; i++) {
    c.beginPath();
    c.arc(cx, cy, r - i * 38, Math.PI * 1.05, Math.PI * 1.95);
    c.stroke();
  }
  // meridians turning slowly
  for (let j = 0; j < 14; j++) {
    const ph = ((j / 14) * Math.PI + t * 0.08) % Math.PI;
    c.beginPath();
    c.ellipse(cx, cy, Math.abs(Math.cos(ph)) * r, r, 0, Math.PI * 1.02, Math.PI * 1.98);
    c.stroke();
  }
  c.restore();
  c.save();
  c.strokeStyle = rgba(P.hi, 0.9 * a);
  c.lineWidth = 3;
  c.shadowColor = P.amber;
  c.shadowBlur = 22 * scale();
  c.beginPath();
  c.arc(cx, cy, r, Math.PI * 1.03, Math.PI * 1.97);
  c.stroke();
  c.restore();
}
/** a dark tag behind a label so it reads over line-work */
function tag(c: Ctx, s: string, x: number, y: number, a: number, col = P.hi, size = 24) {
  if (a <= 0.003) return;
  const w = hudW(c, s, size) + 30, h = size * 1.3 + 22;
  c.save();
  c.globalAlpha *= clamp(a);
  c.fillStyle = rgba("#000000", 0.6);
  c.fillRect(x - w / 2, y - h / 2, w, h);
  c.restore();
  brackets(c, x - w / 2, y - h / 2, w, h, col, a * 0.9, 10, 2);
  hud(c, s, x, y, { size, color: col, alpha: a });
}

// ---------------- 1 · «ساعتِ ماهواره‌های جی‌پی‌اس رو عمداً کُند می‌سازن.» (also the closing shot) ----------------
const SAT = { x: 540, y: 500, w: 860 };
const satPt = (u: number, v: number): [number, number] => [SAT.x + (u - 0.5) * SAT.w, SAT.y + (v - 0.5) * SAT.w];
function openComp(c: Ctx, t: number, t0: number, slowAt: number, first: boolean) {
  const lead = first ? 0.25 : 0; // the very first frame already shows the satellite half-built (not a dark frame)
  const r = rev(t + lead, t0, 0.7);
  const z = first ? lerp(1.16, 1, ease.out(clamp(t / 1.8))) : lerp(1.1, 1, ease.out(clamp((t - t0) / 1.4)));
  c.save();
  cam(c, { ax: 540, ay: 700, fx: 540, fy: 700, z });
  beam(c, t, 780, 560, r);
  rings(c, 540, 790, 330, t, r * 0.8, 0.2);
  sparks(c, SAT.x, SAT.y, 470, 300, clamp((t + lead - t0 + 0.3) / 1.0), 2);
  holo(c, "satellite", SAT.x, SAT.y, SAT.w, t, { reveal: r, seed: 2 });
  if (first) {
    const [wx, wy] = satPt(0.24, 0.33), [bx, by] = satPt(0.56, 0.44), [nx, ny] = satPt(0.55, 0.74);
    const dimA = 1 - 0.45 * k(t, slowAt - 0.1, slowAt + 0.3);
    callout(c, wx, wy, 262, 222, "پنل خورشیدی", k(t, 0.4, 1.1, ease.out), t, -1, dimA);
    callout(c, bx, by, 815, 300, "ساعت اتمی", k(t, 0.7, 1.4, ease.out), t, 1, dimA);
    callout(c, nx, ny, 330, 655, "آنتن‌ها", k(t, 1.0, 1.7, ease.out), t, -1, dimA);
  }
  // the clock-setting dial: it pops up, trembles, then slams to «slow»
  const tIn = slowAt - 0.42, s = pop(t, tIn, 0.45);
  if (s > 0) {
    const v = t < slowAt ? Math.sin(t * 40) * 0.8 * clamp((t - tIn) / 0.2) : lerp(0, -38.6, ease.out(clamp((t - slowAt + 0.02) / 0.28)));
    dial(c, 540, 1000, 112, v, t, { label: "تنظیم ساعت", col: t > slowAt ? P.hot : P.amber, a: clamp((t - tIn) / 0.15), slam: hit(t, slowAt, 0.25), s });
  }
  shock(c, 540, 1000, (t - slowAt) / 0.7, 110, 340, P.hot, 7);
  burst(c, 540, 1000, (t - slowAt) / 0.5, 150, 340, P.hot, 20, 3);
  c.restore();
}
export function sOpen(c: Ctx, t: number) {
  openComp(c, t, 0, Wd(1, "کُند"), true);
}
export function sBack(c: Ctx, t: number) {
  openComp(c, t, SH.back, Wd(12, "کندتر"), false);
}

// ---------------- 2 · «گوشی‌تون با سیگنالِ حداقل چهار ماهواره، موقعیتتون رو پیدا می‌کنه؛» ----------------
const PH = { x: 540, y: 840, w: 1180 };
const PIN: [number, number] = [PH.x + 0.005 * PH.w, PH.y - 0.035 * PH.w];
const SATS: [number, number][] = [[170, 345], [385, 228], [695, 228], [910, 345]];
export function sPhone(c: Ctx, t: number) {
  const t0 = SH.phone, ts = Wd(2, "سیگنالِ") - 0.1, t4 = Wd(2, "چهار") - 0.3, tr0 = Wd(2, "ماهواره،") - 0.05, tl = Wd(2, "موقعیتتون") - 0.04;
  const push = ease.inOut(clamp((t - tl - 0.25) / 1.5));
  const m: LCam = { ax: 540, ay: 760, fx: lerp(540, PIN[0], push), fy: lerp(760, PIN[1], push), z: 1 + 0.025 * clamp((t - t0) / 2) + 0.14 * push };
  c.save();
  cam(c, m);
  beam(c, t, 1000, 400, rev(t, t0, 0.5));
  materialize(c, "phone", PH.x, PH.y, PH.w, t, t0 + 0.02, 5);
  // searching: a radar sweep round the phone
  const sw = k(t, ts, ts + 0.3) * (1 - k(t, tl - 0.3, tl + 0.1));
  if (sw > 0) radar(c, PIN[0], PIN[1], 430, t, sw);
  SATS.forEach(([x, y], i) => {
    const ti = t4 + i * 0.11;
    if (t < ti) return;
    const s = pop(t, ti, 0.4), a = clamp((t - ti) / 0.1);
    glowDot(c, x, y, 130, P.hot, 0.55 * hit(t, ti, 0.18));
    miniSat(c, x, y, 230 * s, t, a, 10 + i);
    badge(c, x + 72, y - 58, String(i + 1), a * clamp(s));
    signal(c, x, y + 40, PIN[0], PIN[1] - 40, t, k(t, ti + 0.1, ti + 0.6));
    // distance ring: grows until it passes through the phone (trilateration)
    const d = Math.hypot(PIN[0] - x, PIN[1] - y), rp = k(t, tr0 + i * 0.08, tr0 + 0.6 + i * 0.08, ease.out);
    if (rp > 0) {
      c.save();
      c.strokeStyle = rgba(rp < 1 ? P.hot : P.amber, rp < 1 ? 0.65 : 0.26 + 0.1 * Math.sin(t * 4 + i));
      c.lineWidth = 2.5;
      c.setLineDash([14, 9]);
      c.lineDashOffset = -t * 30 * (i % 2 ? 1 : -1);
      c.beginPath();
      c.arc(x, y, d * rp, 0, TAU);
      c.stroke();
      c.restore();
    }
  });
  // the fix: the rings meet and the pin drops onto the map
  if (t > tl) {
    const pd = clamp((t - tl) / 0.42);
    glowDot(c, PIN[0], PIN[1] - 20, 170, P.hot, 0.75 * hit(t, tl + 0.25, 0.25));
    shock(c, PIN[0], PIN[1], (t - tl - 0.3) / 0.7, 20, 230, P.hot, 6, 0.5);
    for (let i = 0; i < 3 && t - tl > 0.35; i++) {
      const ph = ((t - tl - 0.35) * 0.8 + i / 3) % 1;
      c.save();
      c.strokeStyle = rgba(P.hot, (1 - ph) * 0.8);
      c.lineWidth = 2.5;
      c.beginPath();
      c.ellipse(PIN[0], PIN[1], 18 + ph * 120, (18 + ph * 120) * 0.45, 0, 0, TAU);
      c.stroke();
      c.restore();
    }
    pinShape(c, PIN[0], PIN[1] - 150 * (1 - ease.outBack(pd)), 26, P.hot, clamp(pd * 4));
  }
  c.restore();
  // «you are here», tied to the pin on screen
  if (t > tl + 0.25) {
    const [px, py] = toS(m, PIN[0], PIN[1] - 60);
    const lp = k(t, tl + 0.25, tl + 0.7, ease.out);
    c.save();
    c.strokeStyle = P.hi;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(px + 22, py - 10);
    c.lineTo(lerp(px + 22, px + 140, lp), lerp(py - 10, py - 130, lp));
    if (lp > 0.99) c.lineTo(px + 140 + 210 * k(t, tl + 0.7, tl + 0.9), py - 130);
    c.stroke();
    c.restore();
    typed(c, "موقعیت شما", px + 245, py - 156, k(t, tl + 0.7, tl + 1.1), t, { size: 26, color: P.hot, glow: 10 });
    typed(c, "35.69°N  51.39°E", px + 245, py - 104, k(t, tl + 0.85, tl + 1.4), t, { size: 19, color: P.hi });
  }
}

// ---------------- 3 · «ماهواره‌هایی که بیست هزار کیلومتر بالاتر هستن و ساعتِ اتمی دارن.» ----------------
const EC = { x: 540, y: 700 }, ER = 209;
const ORB = [
  { rx: 400, ry: 140, rot: -0.38, w: 0.25, ph: 0.35 },
  { rx: 385, ry: 165, rot: 0.42, w: -0.2, ph: 2.6 },
  { rx: 420, ry: 115, rot: 1.3, w: 0.17, ph: 4.4 },
];
function orbPt(o: (typeof ORB)[number], u: number): [number, number] {
  const x = Math.cos(u) * o.rx, y = Math.sin(u) * o.ry;
  return [EC.x + x * Math.cos(o.rot) - y * Math.sin(o.rot), EC.y + x * Math.sin(o.rot) + y * Math.cos(o.rot)];
}
const behind = (u: number, p: [number, number]) => Math.sin(u) < 0 && Math.hypot(p[0] - EC.x, p[1] - EC.y) < ER + 8;
export function sEarth(c: Ctx, t: number) {
  const t0 = SH.earth, tk = Wd(3, "بیست") - 0.08, tc = Wd(3, "ساعتِ") - 0.1, tAt = Wd(3, "اتمی");
  const hero = orbPt(ORB[0], ORB[0].ph + (t - 12.5) * ORB[0].w);
  const pull = ease.inOut(clamp((t - tk) / 0.9)), dive = ease.inOut(clamp((t - tc) / 0.8));
  const m: LCam = { ax: 540, ay: 700, fx: lerp(EC.x, hero[0], dive), fy: lerp(EC.y, hero[1], dive), z: (1.06 - 0.06 * ease.out(clamp((t - t0) / 0.9))) * lerp(1, 0.8, pull) * lerp(1, 1.85, dive) };
  c.save();
  cam(c, m);
  const r = rev(t, t0, 0.6);
  beam(c, t, 960, 520, r * (1 - dive));
  rings(c, EC.x, EC.y, ER + 40, t, r * 0.5);
  materialize(c, "earth", EC.x, EC.y + 5, 540, t, t0, 7, { life: 0.3 });
  // spin: a light band sweeping across the globe and blinking cities
  if (r > 0.5) {
    c.save();
    c.beginPath();
    c.arc(EC.x, EC.y, ER, 0, TAU);
    c.clip();
    const bx = EC.x - ER - 100 + ((t * 0.22) % 1) * (2 * ER + 200);
    const g = c.createLinearGradient(bx - 70, 0, bx + 70, 0);
    g.addColorStop(0, rgba(P.hot, 0));
    g.addColorStop(0.5, rgba(P.hot, 0.16));
    g.addColorStop(1, rgba(P.hot, 0));
    c.fillStyle = g;
    c.fillRect(bx - 70, EC.y - ER, 140, ER * 2);
    const rr = rng(41);
    for (let i = 0; i < 26; i++) {
      const a = rr() * TAU, d = Math.sqrt(rr()) * ER * 0.92, ph = rr() * TAU;
      const tw = Math.max(0, Math.sin(t * (2 + rr() * 3) + ph));
      c.fillStyle = rgba(P.hot, tw * 0.9);
      c.beginPath();
      c.arc(EC.x + Math.cos(a) * d, EC.y + Math.sin(a) * d, 2.6, 0, TAU);
      c.fill();
    }
    c.restore();
  }
  // orbits, satellites with trails, atomic badges
  const oa = k(t, t0 + 0.3, t0 + 0.9);
  ORB.forEach((o, i) => {
    c.save();
    c.globalAlpha = oa * 0.6 * (1 - 0.6 * dive);
    c.strokeStyle = P.amber;
    c.setLineDash([3, 9]);
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(EC.x, EC.y, o.rx, o.ry, o.rot, 0, TAU);
    c.stroke();
    c.restore();
    for (let s = 0; s < 2; s++) {
      const u = o.ph + s * Math.PI + (t - 12.5) * o.w, p = orbPt(o, u);
      if (behind(u, p)) continue;
      // during the dive only the hero satellite stays
      const isHero = i === 0 && s === 0, sa = oa * (isHero ? 1 : 1 - 0.9 * dive);
      // trail
      c.save();
      c.lineCap = "round";
      for (let j = 1; j <= 16; j++) {
        const q0 = orbPt(o, u - Math.sign(o.w) * (j - 1) * 0.035), q1 = orbPt(o, u - Math.sign(o.w) * j * 0.035);
        c.strokeStyle = rgba(P.hot, sa * 0.7 * (1 - j / 17));
        c.lineWidth = 3.5 * (1 - j / 20);
        c.beginPath();
        c.moveTo(q0[0], q0[1]);
        c.lineTo(q1[0], q1[1]);
        c.stroke();
      }
      c.restore();
      const hs = isHero ? lerp(1, 1.9, dive) : 1;
      miniSat(c, p[0], p[1], (isHero ? 120 : 105) * hs, t, sa, 20 + i * 2 + s);
      const at = pop(t, tc + i * 0.07 + s * 0.04, 0.4);
      atom(c, p[0] + 44 * hs, p[1] - 34 * hs, 17 * at * hs, t, clamp(at) * (sa / Math.max(oa, 1e-3)));
    }
  });
  // altitude: a dimension line from the surface up to the orbit
  const dk = k(t, tk, tk + 0.6, ease.out) * (1 - k(t, tc - 0.2, tc + 0.1));
  if (dk > 0) {
    const a = -1.05, r0 = ER + 4, r1 = ER + 4 + 215 * dk;
    const [x0, y0] = [EC.x + Math.cos(a) * r0, EC.y + Math.sin(a) * r0], [x1, y1] = [EC.x + Math.cos(a) * r1, EC.y + Math.sin(a) * r1];
    c.save();
    c.strokeStyle = P.hot;
    c.lineWidth = 3;
    c.shadowColor = P.hot;
    c.shadowBlur = 12 * scale();
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(x1, y1);
    const nx = -Math.sin(a) * 16, ny = Math.cos(a) * 16;
    c.moveTo(x0 - nx, y0 - ny);
    c.lineTo(x0 + nx, y0 + ny);
    c.moveTo(x1 - nx, y1 - ny);
    c.lineTo(x1 + nx, y1 + ny);
    for (let i = 1; i < 10; i++) {
      const rr = lerp(r0, r1, i / 10);
      if (rr > r1) break;
      c.moveTo(EC.x + Math.cos(a) * rr - nx * 0.4, EC.y + Math.sin(a) * rr - ny * 0.4);
      c.lineTo(EC.x + Math.cos(a) * rr + nx * 0.4, EC.y + Math.sin(a) * rr + ny * 0.4);
    }
    c.stroke();
    c.restore();
  }
  c.restore();
  // screen-space readouts: the altitude counter, then the atomic clock
  const ca = k(t, tk, tk + 0.25) * (1 - k(t, tc - 0.2, tc + 0.1));
  if (ca > 0) {
    hud(c, "ارتفاع مدار", 540, 195, { size: 24, alpha: ca });
    numUnit(c, grp(20200 * ease.out(clamp((t - tk) / 1.0))), "کیلومتر", 540, 268, 84, { a: ca, s: 1 + 0.12 * hit(t, tk + 1.0, 0.2) });
  }
  const aa = k(t, tAt - 0.15, tAt + 0.25);
  if (aa > 0) {
    const [hx, hy] = toS(m, hero[0], hero[1]);
    tag(c, "ساعت اتمی", hx, hy + 190, aa, P.hot, 30);
    typed(c, "1 ثانیه = 9,192,631,770 نوسان اتم سزیم", 540, hy + 285, k(t, tAt + 0.1, tAt + 0.9), t, { size: 23, color: P.hi });
  }
}

// ---------------- 4 · «ولی اون بالا، زمان یه جورِ دیگه می‌گذره.» ----------------
export function sClocks(c: Ctx, t: number) {
  const t0 = SH.clocks, tu = Wd(4, "اون") - 0.05, tz = Wd(4, "زمان") - 0.05;
  const up = ease.inOut(clamp((t - tu) / 0.9));
  const m: LCam = { ax: 540, ay: 700, fx: 540, fy: lerp(860, 640, up), z: 1.04 + 0.04 * clamp((t - t0) / 3) };
  c.save();
  cam(c, m);
  const a0 = k(t, t0, t0 + 0.15); // fast: a glitch cut must not open on an empty frame
  limb(c, 540, 2380, 1340, t, a0);
  // the orbit arc high above
  c.save();
  c.strokeStyle = rgba(P.amber, 0.45 * a0);
  c.setLineDash([4, 10]);
  c.lineDashOffset = -t * 40;
  c.lineWidth = 2;
  c.beginPath();
  c.arc(540, 2380, 1945, Math.PI * 1.36, Math.PI * 1.64);
  c.stroke();
  c.restore();
  const base = -Math.PI / 2 + (t - t0) * 1.9, drift = Math.max(0, t - tz) * 0.55;
  const gA = k(t, t0, t0 + 0.18), sA = k(t, t0 + 0.04, t0 + 0.25), warp = t > tz;
  // the link between them
  c.save();
  c.strokeStyle = rgba(P.amber, 0.35 * sA);
  c.setLineDash([6, 8]);
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(410, 885);
  c.lineTo(675, 540);
  c.stroke();
  c.restore();
  clockFace(c, 320, 940, 100, base, t, { a: gA });
  hud(c, "ساعت روی زمین", 300, 805, { size: 24, alpha: gA });
  miniSat(c, 905, 330, 210, t, sA, 41);
  // ripples of warped time round the satellite clock
  if (warp)
    for (let i = 0; i < 3; i++) {
      const ph = ((t - tz) * 1.3 + i / 3) % 1;
      c.save();
      c.strokeStyle = rgba(P.hot, (1 - ph) * 0.5);
      c.lineWidth = 2.5;
      c.beginPath();
      c.arc(740, 470, 105 + ph * 230, 0, TAU);
      c.stroke();
      c.restore();
    }
  const sp = 1 + 0.06 * Math.sin((t - tz) * 9) * hit(t, tz, 0.6);
  c.save();
  c.translate(740, 470);
  c.scale(sp, sp);
  c.translate(-740, -470);
  clockFace(c, 740, 470, 100, base + drift, t, { a: sA, col: warp ? P.hot : P.amber, ghost: warp ? base : undefined });
  c.restore();
  hud(c, "ساعت ماهواره", 740, 335, { size: 24, alpha: sA, color: warp ? P.hot : P.amber });
  c.restore();
  // the gap, counted
  if (t > tz) {
    const a = k(t, tz, tz + 0.3), v = 0.000038 * ease.out(clamp((t - tz) / 1.5));
    hud(c, "اختلاف در یک روز", 300, 430, { size: 22, alpha: a });
    numUnit(c, "+" + v.toFixed(6), "ثانیه", 300, 492, 50, { a, s: 1 + 0.15 * hit(t, tz + 0.05, 0.2) });
  }
}

// ---------------- 5 · «سرعتِ زیادِ ماهواره‌ها، ساعتشون رو روزی هفت میلیونیومِ ثانیه کُند می‌کنه،» ----------------
function streaks(c: Ctx, t: number, t0: number, a: number) {
  if (a <= 0.003) return;
  const r = rng(77), dt = t - t0, go = dt < 0.6 ? 0.5 * dt * dt / 0.6 : dt - 0.3; // accelerate in
  c.save();
  c.lineCap = "round";
  for (let i = 0; i < 80; i++) {
    const y = 170 + r() * 980, depth = r(), sp = 700 + depth * 2200, len = 60 + depth * 320;
    const x = ((r() * 1700 + go * sp) % 1700) - 300;
    c.strokeStyle = rgba(depth > 0.8 ? P.hi : P.amber, a * (0.06 + depth * 0.32));
    c.lineWidth = 1 + depth * 2;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x - len, y);
    c.stroke();
  }
  c.restore();
}
export function sSpeed(c: Ctx, t: number) {
  const t0 = SH.speed, tsc = Wd(5, "ساعتشون") - 0.1, t7 = Wd(5, "هفت") - 0.03, tm = Wd(5, "میلیونیومِ"), tk = Wd(5, "کُند");
  streaks(c, t, t0, k(t, t0, t0 + 0.3));
  const m: LCam = { ax: 540, ay: 700, fx: 540, fy: 700, z: 1.02 + 0.05 * clamp((t - t0) / 5) };
  c.save();
  cam(c, m);
  // the satellite flies (right → left), banking and buzzing with speed
  const jx = (noise2(t * 9, 1) - 0.5) * 7, jy = (noise2(t * 9, 7) - 0.5) * 7;
  c.save();
  c.translate(560 + jx, 560 + jy);
  c.rotate(-0.07 + 0.025 * Math.sin(t * 1.3));
  c.translate(-560, -560);
  materialize(c, "satellite", 560, 560, 660, t, t0, 31);
  c.restore();
  // its clock, squeezed along the motion; the hand lags behind where a resting clock would point
  const ca = pop(t, tsc, 0.45);
  if (ca > 0) {
    const base = -Math.PI / 2 + (t - tsc) * 2.4;
    const lag = Math.max(0, t - tsc - 0.25) * 0.42 + 0.3 * ease.out(clamp((t - t7) / 0.35));
    c.save();
    c.translate(845, 875);
    c.scale(ca, ca);
    c.translate(-845, -875);
    clockFace(c, 845, 875, 88, base - lag, t, { a: clamp(ca), sx: 0.8, ghost: t > tsc + 0.3 ? base : undefined, col: P.red });
    c.restore();
    hud(c, "ساعت ماهواره", 845, 990, { size: 22, alpha: clamp(ca) });
  }
  c.restore();
  // readouts
  const a = k(t, t0, t0 + 0.25);
  typed(c, "اثر سرعت", 540, 192, k(t, t0, t0 + 0.4), t, { size: 26 });
  const sv = 14000 * ease.out(clamp((t - t0 - 0.1) / 1.1)), f = Math.floor(t * 30);
  numUnit(c, grp(sv >= 13990 ? 14000 + Math.floor(hash(f) * 9) - 4 : sv), "کیلومتر بر ساعت", 540, 262, 76, { a });
  // the speed bar
  for (let i = 0; i < 30; i++) {
    const on = i / 30 < sv / 14000;
    c.fillStyle = rgba(on ? (i > 26 ? P.hot : P.amber) : P.dim, a * (on ? 0.95 : 0.35));
    c.fillRect(240 + i * 20.5, 318, 15, 12);
  }
  // −7.2 slams in
  if (t > t7) {
    const s = pop(t, t7, 0.35) * (1 + 0.25 * hit(t, t7 + 0.1, 0.18) + 0.12 * hit(t, tk, 0.2));
    numUnit(c, "−7.2", "میکروثانیه در روز", 300, 870, 112, { col: P.red, below: true, s, glow: 22 });
    chevrons(c, 520, 860, 1, t, P.red, clamp((t - t7) / 0.2), 20);
    shock(c, 300, 870, (t - t7) / 0.6, 60, 260, P.red, 6);
  }
  typed(c, "1 میکروثانیه = یک میلیونیوم ثانیه", 540, 1088, k(t, tm - 0.05, tm + 0.7), t, { size: 22, color: P.hi });
}

// ---------------- 6 · «ولی چون اون بالا جاذبه ضعیف‌تره، روزی چهل و پنج میلیونیوم تندتر می‌شن.» ----------------
const G = { yH: 400, Hc: 520, F: 720, Z0: 620, Zc: 780, R0: 250 };
const gproj = (X: number, Y: number, Z: number): [number, number] => [540 + (X * G.F) / (Z + G.Z0), G.yH + ((G.Hc - Y) * G.F) / (Z + G.Z0)];
function wellY(X: number, Z: number, D: number, t: number, wv: number) {
  const r = Math.hypot(X, Z - G.Zc);
  return -D / (1 + (r / G.R0) ** 2) + wv * 22 * Math.sin(r * 0.018 - t * 7) * Math.exp(-r / 800);
}
function grid3d(c: Ctx, t: number, D: number, wv: number, a: number) {
  c.save();
  c.lineWidth = 1.6;
  const depthFade = c.createLinearGradient(0, 540, 0, 1010);
  depthFade.addColorStop(0, rgba(P.amber, 0.12 * a));
  depthFade.addColorStop(1, rgba(P.amber, 0.55 * a));
  for (let j = 0; j <= 22; j++) {
    const Z = (j / 22) * 1900;
    c.strokeStyle = rgba(P.amber, a * 0.62 * (1 - Z / 2300));
    c.beginPath();
    for (let i = 0; i <= 52; i++) {
      const X = -1300 + (i / 52) * 2600, [x, y] = gproj(X, wellY(X, Z, D, t, wv), Z);
      if (i) c.lineTo(x, y);
      else c.moveTo(x, y);
    }
    c.stroke();
  }
  c.strokeStyle = depthFade;
  for (let i = 0; i <= 26; i++) {
    const X = -1300 + (i / 26) * 2600;
    c.beginPath();
    for (let j = 0; j <= 52; j++) {
      const Z = (j / 52) * 1900, [x, y] = gproj(X, wellY(X, Z, D, t, wv), Z);
      if (j) c.lineTo(x, y);
      else c.moveTo(x, y);
    }
    c.stroke();
  }
  c.restore();
}
export function sGravity(c: Ctx, t: number) {
  const t0 = SH.gravity, tg = Wd(6, "جاذبه") - 0.05, tw = Wd(6, "ضعیف‌تره"), t45 = Wd(6, "چهل") - 0.03, tf = Wd(6, "تندتر");
  const m: LCam = { ax: 540, ay: 700, fx: 540, fy: 700, z: 1.0 + 0.05 * clamp((t - t0) / 5) };
  c.save();
  cam(c, m);
  const a = k(t, t0, t0 + 0.4);
  const D = t < tg ? 200 : 200 + 220 * (1 - Math.exp(-(t - tg) / 0.22) * Math.cos((t - tg) * 13));
  const wv = hit(t, tg, 1.2);
  // far half of the orbit, the sheet, the Earth in its well, the near half
  const Ro = 640, Yo = 170, th = -1.0 + 0.32 * (t - t0);
  const orbit = (from: number, to: number) => {
    c.save();
    c.strokeStyle = rgba(P.amber, 0.55 * a);
    c.setLineDash([4, 9]);
    c.lineWidth = 2;
    c.beginPath();
    for (let i = 0; i <= 40; i++) {
      const q = lerp(from, to, i / 40), [x, y] = gproj(Ro * Math.cos(q), Yo, G.Zc + Ro * Math.sin(q));
      if (i) c.lineTo(x, y);
      else c.moveTo(x, y);
    }
    c.stroke();
    c.restore();
  };
  orbit(0, Math.PI);
  grid3d(c, t, D, wv, a);
  const [ex, ey] = gproj(0, -D, G.Zc);
  glowDot(c, ex, ey, 260, P.amber, 0.35 * a);
  holo(c, "earth", ex, ey - 74, 200, t, { reveal: rev(t, t0 + 0.1, 0.5), seed: 51, life: 0.2 });
  // gravity arrows on the sheet: long near the Earth, short far away
  const ar = k(t, tg, tg + 0.5);
  if (ar > 0) {
    c.save();
    c.strokeStyle = rgba(P.hi, 0.7 * ar);
    c.lineWidth = 2.5;
    c.lineCap = "round";
    for (let q = 0; q < 10; q++) {
      const ang = (q / 10) * TAU + 0.3;
      for (const rr of [330, 560, 860]) {
        const len = 150 / (1 + (rr / G.R0) ** 2) + 18;
        const X0 = Math.cos(ang) * rr, Z0 = G.Zc + Math.sin(ang) * rr, X1 = Math.cos(ang) * (rr - len), Z1 = G.Zc + Math.sin(ang) * (rr - len);
        if (Z1 < 0) continue;
        const [x0, y0] = gproj(X0, wellY(X0, Z0, D, t, wv), Z0), [x1, y1] = gproj(X1, wellY(X1, Z1, D, t, wv), Z1);
        c.beginPath();
        c.moveTo(x0, y0);
        c.lineTo(x1, y1);
        const ha = Math.atan2(y1 - y0, x1 - x0);
        c.moveTo(x1, y1);
        c.lineTo(x1 - Math.cos(ha - 0.5) * 9, y1 - Math.sin(ha - 0.5) * 9);
        c.moveTo(x1, y1);
        c.lineTo(x1 - Math.cos(ha + 0.5) * 9, y1 - Math.sin(ha + 0.5) * 9);
        c.stroke();
      }
    }
    c.restore();
  }
  orbit(Math.PI, TAU);
  // the satellite riding the orbit with its clock; a clock down on the Earth
  const SX = Ro * Math.cos(th), SZ = G.Zc + Ro * Math.sin(th), [sx, sy] = gproj(SX, Yo, SZ), ss = G.F / (SZ + G.Z0);
  miniSat(c, sx, sy, 300 * ss, t, a, 53);
  const base = -Math.PI / 2 + (t - t0) * 1.6, fast = Math.max(0, t - t45) * 1.25;
  clockFace(c, sx + 105 * ss + 30, sy - 95 * ss - 20, 46, base + fast, t, { a, col: t > t45 ? P.hot : P.amber, ghost: t > t45 ? base : undefined });
  clockFace(c, ex - 150, ey - 60, 46, base, t, { a });
  c.restore();
  // labels on the sheet
  tag(c, "جاذبه‌ی ضعیف‌تر", 850, 470, k(t, tw - 0.1, tw + 0.3));
  tag(c, "جاذبه‌ی قوی‌تر", 230, 840, k(t, tw + 0.15, tw + 0.55));
  typed(c, "اثر جاذبه", 540, 192, k(t, t0, t0 + 0.4), t, { size: 26 });
  if (t > t45) {
    const s = pop(t, t45, 0.35) * (1 + 0.25 * hit(t, t45 + 0.1, 0.18) + 0.12 * hit(t, tf, 0.2));
    numUnit(c, "+45.8", "میکروثانیه در روز", 540, 282, 112, { col: P.hot, below: true, s, glow: 24 });
    chevrons(c, 290, 280, -1, t, P.hot, clamp((t - t45) / 0.2), 20);
    chevrons(c, 790, 280, -1, t, P.hot, clamp((t - t45) / 0.2), 20);
    shock(c, 540, 282, (t - t45) / 0.6, 60, 300, P.hot, 6);
  }
}

// ---------------- 7 · «پس در کل، روزی حدودِ سی و هشت میلیونیومِ ثانیه جلو می‌افتن.» ----------------
function card(c: Ctx, x: number, y: number, label: string, n: string, col: string, a: number) {
  if (a <= 0.003) return;
  const w = 290, h = 180;
  c.save();
  c.globalAlpha *= clamp(a);
  c.fillStyle = rgba("#000000", 0.5);
  c.fillRect(x - w / 2, y - h / 2, w, h);
  c.restore();
  brackets(c, x - w / 2, y - h / 2, w, h, col, a, 24, 3);
  hud(c, label, x, y - 52, { size: 24, color: P.amber, alpha: a });
  numUnit(c, n, "", x, y + 18, 76, { col, a, glow: 16 });
}
const NL = { x: 140, y: 720, s: 13 }; // number line: −10 … 50
const nlX = (v: number) => NL.x + (v + 10) * NL.s;
function arrowH(c: Ctx, x0: number, x1: number, y: number, col: string, a: number) {
  if (a <= 0.003 || Math.abs(x1 - x0) < 1) return;
  const d = Math.sign(x1 - x0);
  c.save();
  c.globalAlpha *= clamp(a);
  c.strokeStyle = col;
  c.lineWidth = 5;
  c.lineCap = "round";
  c.shadowColor = col;
  c.shadowBlur = 12 * scale();
  c.beginPath();
  c.moveTo(x0, y);
  c.lineTo(x1, y);
  c.moveTo(x1, y);
  c.lineTo(x1 - d * 16, y - 11);
  c.moveTo(x1, y);
  c.lineTo(x1 - d * 16, y + 11);
  c.stroke();
  c.restore();
}
export function sNet(c: Ctx, t: number) {
  const t0 = SH.net, tl = Wd(7, "کل،"), tc = Wd(7, "سی") - 0.02, tj = Wd(7, "جلو");
  const m: LCam = { ax: 540, ay: 640, fx: 540, fy: 640, z: 1.02 + 0.05 * clamp((t - t0) / 4.5) };
  c.save();
  cam(c, m);
  // two effects slide in, speed up and collide
  const ca = k(t, t0, t0 + 0.4, ease.out), mv = ease.in(clamp((t - (tc - 0.8)) / 0.8));
  if (t < tc) {
    card(c, lerp(820, 690, mv) + (1 - ca) * 400, 400, "سرعت", "−7.2", P.red, ca);
    card(c, lerp(260, 390, mv) - (1 - ca) * 400, 400, "جاذبه", "+45.8", P.hot, ca);
  }
  glowDot(c, 540, 400, 340, P.hot, 0.9 * hit(t, tc, 0.16));
  shock(c, 540, 400, (t - tc) / 0.8, 60, 560, P.hot, 9);
  burst(c, 540, 400, (t - tc) / 0.6, 80, 440, P.hot, 26, 7);
  if (t >= tc) {
    typed(c, "در مجموع", 540, 220, k(t, tc, tc + 0.3), t, { size: 26 });
    numUnit(c, "+38.6", "میکروثانیه در روز", 540, 395, 150, { col: P.hot, below: true, s: pop(t, tc, 0.45) * (1 + 0.15 * hit(t, tc + 0.12, 0.2)), glow: 26 });
  }
  // the number line: −7.2, then +45.8 from there, lands on +38.6
  const la = k(t, tl - 0.3, tl + 0.1);
  if (la > 0) {
    c.save();
    c.globalAlpha = la;
    c.strokeStyle = rgba(P.amber, 0.7);
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(nlX(-10), NL.y);
    c.lineTo(nlX(50), NL.y);
    for (let v = -10; v <= 50; v += 5) {
      c.moveTo(nlX(v), NL.y);
      c.lineTo(nlX(v), NL.y + (v % 10 === 0 ? 14 : 7));
    }
    c.stroke();
    c.restore();
    for (let v = -10; v <= 50; v += 10) hud(c, (v < 0 ? "−" : "") + Math.abs(v), nlX(v), NL.y + 38, { size: 19, alpha: la * 0.85 });
    const p1 = k(t, tl - 0.1, tl + 0.35), p2 = k(t, tl + 0.4, tc - 0.1);
    arrowH(c, nlX(0), nlX(-7.2 * p1), NL.y - 30, P.red, la);
    if (p2 > 0) {
      arrowH(c, nlX(-7.2), nlX(-7.2 + 45.8 * p2), NL.y - 62, P.hot, la);
      hud(c, "+45.8", nlX(-7.2 + 22.9), NL.y - 92, { size: 20, color: P.hot, alpha: clamp(p2 * 3) });
    }
    if (p1 > 0.5) hud(c, "−7.2", nlX(-3.6), NL.y - 8, { size: 18, color: P.red, alpha: la });
    if (t > tc) {
      const mx = nlX(38.6), g = hit(t, tc, 0.4);
      c.save();
      c.strokeStyle = P.hot;
      c.lineWidth = 4;
      c.shadowColor = P.hot;
      c.shadowBlur = (14 + 30 * g) * scale();
      c.beginPath();
      c.moveTo(mx, NL.y - 120);
      c.lineTo(mx, NL.y + 22);
      c.stroke();
      c.restore();
      shock(c, mx, NL.y - 50, (t - tc) / 0.6, 10, 120, P.hot, 5);
    }
  }
  // a clock that runs ahead of the true time (it appears right after the sum, then jumps on «جلو»)
  const ka = pop(t, tc + 0.3, 0.45);
  if (ka > 0) {
    const base = -Math.PI / 2 + (t - tj) * 1.4, jump = 0.6 * ease.outBack(clamp((t - tj) / 0.3));
    c.save();
    c.translate(540, 1000);
    c.scale(ka, ka);
    c.translate(-540, -1000);
    clockFace(c, 540, 1000, 100, base + jump, t, { a: clamp(ka), col: t > tj ? P.hot : P.amber, ghost: t > tj ? base : undefined });
    c.restore();
    if (t > tj) tag(c, "جلو", 720, 940, k(t, tj + 0.1, tj + 0.3), P.hot, 26);
  }
  c.restore();
}

// ---------------- 8a · «سیگنال‌ها با سرعتِ نور میان؛ پس همین مقدار کم هم تاثیرش رو میذاره؛» ----------------
export function sLight(c: Ctx, t: number) {
  const t0 = SH.light, tc = Wd(8, "سرعتِ") - 0.05, tn = Wd(8, "نور"), tp = Wd(8, "پس") - 0.05, tk = Wd(8, "کم") - 0.05;
  const m: LCam = { ax: 540, ay: 700, fx: 540, fy: 700, z: 1.03 + 0.04 * clamp((t - t0) / 4) };
  c.save();
  cam(c, m);
  materialize(c, "satellite", 800, 330, 360, t, t0, 61, { life: 0.5 });
  materialize(c, "phone", 250, 880, 560, t, t0 + 0.12, 62, { life: 0.4 });
  const A: [number, number] = [770, 420], B: [number, number] = [300, 735];
  const la = k(t, t0 + 0.2, t0 + 0.6);
  c.save();
  c.strokeStyle = rgba(P.amber, 0.35 * la);
  c.lineWidth = 2;
  c.setLineDash([3, 7]);
  c.beginPath();
  c.moveTo(A[0], A[1]);
  c.lineTo(B[0], B[1]);
  c.stroke();
  c.restore();
  // photons racing down the line
  if (t > tc) {
    c.save();
    c.lineCap = "round";
    for (let i = 0; i < 4; i++) {
      const u = (t - tc) * 1.5 - i * 0.25;
      if (u < 0) continue;
      const f = u % 1, hx = lerp(A[0], B[0], f), hy = lerp(A[1], B[1], f), tl = 0.16;
      const tx = lerp(A[0], B[0], Math.max(0, f - tl)), ty = lerp(A[1], B[1], Math.max(0, f - tl));
      const g = c.createLinearGradient(tx, ty, hx, hy);
      g.addColorStop(0, rgba(P.hot, 0));
      g.addColorStop(1, rgba(P.hot, 0.95));
      c.strokeStyle = g;
      c.lineWidth = 6;
      c.beginPath();
      c.moveTo(tx, ty);
      c.lineTo(hx, hy);
      c.stroke();
      glowDot(c, hx, hy, 36, P.hot, 0.8);
    }
    c.restore();
    glowDot(c, B[0], B[1], 90, P.hot, 0.5 * (0.5 + 0.5 * Math.sin(t * 9)) * k(t, tc + 0.5, tc + 0.7));
  }
  c.restore();
  // the speed of light
  const ra = k(t, tc, tc + 0.3);
  typed(c, "سرعت نور", 300, 192, k(t, tc, tc + 0.4), t, { size: 26 });
  numUnit(c, "299,792", "کیلومتر بر ثانیه", 300, 258, 60, { a: ra, s: 1 + 0.18 * hit(t, tn, 0.2) });
  // what one microsecond costs, and 38 of them
  const r1 = k(t, tp, tp + 0.2);
  if (r1 > 0) {
    hud(c, "1 میکروثانیه", 1000, 905, { size: 24, align: "right", alpha: r1 });
    const L1 = 280 * k(t, tp + 0.15, tp + 0.6, ease.out);
    c.save();
    c.strokeStyle = P.hi;
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(800, 905);
    c.lineTo(800 - L1, 905);
    for (let i = 0; i <= 6; i++) {
      const x = 800 - (L1 * i) / 6;
      c.moveTo(x, 905 - (i % 3 === 0 ? 14 : 7));
      c.lineTo(x, 905 + (i % 3 === 0 ? 14 : 7));
    }
    c.stroke();
    c.restore();
    numUnit(c, "300", "متر", 455, 905, 40, { a: k(t, tp + 0.5, tp + 0.7), col: P.hi, glow: 10 });
  }
  const r2 = k(t, tk, tk + 0.2);
  if (r2 > 0) {
    hud(c, "38 میکروثانیه", 1000, 1035, { size: 24, align: "right", alpha: r2, color: P.hot });
    const nOn = Math.floor(38 * k(t, tk + 0.15, tk + 0.95, (x) => x));
    for (let i = 0; i < 38; i++) {
      c.fillStyle = rgba(i < nOn ? (i === nOn - 1 ? P.hot : P.amber) : P.dim, r2 * (i < nOn ? 0.95 : 0.3));
      c.fillRect(800 - (i + 1) * 7.4, 1023, 5.4, 24);
    }
    const ok = k(t, tk + 0.95, tk + 1.1);
    numUnit(c, "11.4", "کیلومتر", 455, 1035, 46, { a: ok, s: 1 + 0.25 * hit(t, tk + 0.95, 0.2), glow: 18 });
  }
}

// ---------------- 8b · «روزی حدودِ یازده کیلومتر خطا در مکان‌یابی!» ----------------
type Poly = { pts: [number, number][]; w: number; a: number };
const MAP = (() => {
  const r = rng(91), rot = -0.22, cx = 540, cy = 700;
  const R = (x: number, y: number): [number, number] => [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)];
  const roads: Poly[] = [];
  const line = (x0: number, y0: number, x1: number, y1: number, w: number, a: number, bend: number) => {
    const pts: [number, number][] = [], nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny) || 1, n = bend ? 12 : 1;
    for (let i = 0; i <= n; i++) {
      const u = i / n, b = Math.sin(u * Math.PI) * bend;
      pts.push(R(lerp(x0, x1, u) + (nx / L) * b, lerp(y0, y1, u) + (ny / L) * b));
    }
    roads.push({ pts, w, a });
  };
  const E = 1600;
  for (let x = -E; x <= E; x += 44) {
    let y = -E;
    while (y < E) {
      const L = 60 + r() * 220;
      if (r() > 0.3) line(x, y, x, y + L, 1.4, 0.28, 0);
      y += L + 20 + r() * 60;
    }
  }
  for (let y = -E; y <= E; y += 44) {
    let x = -E;
    while (x < E) {
      const L = 60 + r() * 220;
      if (r() > 0.3) line(x, y, x + L, y, 1.4, 0.28, 0);
      x += L + 20 + r() * 60;
    }
  }
  for (let x = -E; x <= E; x += 170 + r() * 110) line(x, -E, x + (r() - 0.5) * 120, E, 3.2, 0.5, (r() - 0.5) * 90);
  for (let y = -E; y <= E; y += 160 + r() * 120) line(-E, y, E, y + (r() - 0.5) * 120, 3.2, 0.5, (r() - 0.5) * 90);
  // buildings: small blocks between the streets
  const blocks: [number, number][][] = [];
  for (let i = 0; i < 420; i++) {
    const bx = Math.round((r() * 2 - 1) * E / 44) * 44 + 8, by = Math.round((r() * 2 - 1) * E / 44) * 44 + 8, bw = 10 + r() * 22, bh = 10 + r() * 22;
    blocks.push([R(bx, by), R(bx + bw, by), R(bx + bw, by + bh), R(bx, by + bh)]);
  }
  const river: [number, number][] = [];
  for (let i = 0; i <= 80; i++) {
    const u = i / 80;
    river.push(R(-E + u * 2 * E, 300 + Math.sin(u * 9.5) * 110 + Math.sin(u * 2.9) * 80));
  }
  return { roads, river, blocks };
})();
function drawMap(c: Ctx, a: number) {
  if (a <= 0.003) return;
  c.save();
  c.fillStyle = rgba(P.amber, 0.09 * a);
  c.strokeStyle = rgba(P.amber, 0.22 * a);
  c.lineWidth = 1;
  for (const b of MAP.blocks) {
    c.beginPath();
    b.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.fill();
    c.stroke();
  }
  c.lineCap = "round";
  for (const rd of MAP.roads) {
    c.strokeStyle = rgba(P.amber, rd.a * a);
    c.lineWidth = rd.w;
    c.beginPath();
    rd.pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.stroke();
  }
  const path = () => {
    c.beginPath();
    MAP.river.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  };
  c.strokeStyle = rgba(P.amber, 0.13 * a);
  c.lineWidth = 54;
  path();
  c.stroke();
  c.strokeStyle = rgba(P.hi, 0.35 * a);
  c.lineWidth = 2;
  c.setLineDash([10, 12]);
  path();
  c.stroke();
  c.restore();
}
const gpsPin = (s: number): [number, number] => {
  const d = 470 * s, ang = -2.2 + 0.25 * Math.sin(s * 5);
  return [540 + Math.cos(ang) * d + Math.sin(s * 11) * 14, 700 + Math.sin(ang) * d];
};
export function sMap(c: Ctx, t: number) {
  const t0 = SH.map, t11 = Wd(8, "یازده") - 0.05, tkm = Wd(8, "کیلومتر"), tloc = Wd(8, "مکان‌یابی");
  const drift = ease.inOut(clamp((t - t0 - 0.15) / (tkm - t0 - 0.1)));
  const m: LCam = { ax: 540, ay: 700, fx: lerp(540, 470, drift), fy: lerp(700, 560, drift), z: lerp(1.25, 0.95, ease.out(clamp((t - t0) / 1.8))) };
  c.save();
  cam(c, m);
  const a = k(t, t0, t0 + 0.35);
  drawMap(c, a);
  // the error radius, the drift path, the two pins
  const g = gpsPin(drift), dist = Math.hypot(g[0] - 540, g[1] - 700);
  const wob = t > tloc ? Math.sin((t - tloc) * 18) * 10 * hit(t, tloc, 0.5) : 0;
  c.save();
  c.strokeStyle = rgba(P.red, 0.7 * a);
  c.lineWidth = 2.5;
  c.setLineDash([12, 9]);
  c.lineDashOffset = -t * 30;
  c.beginPath();
  c.arc(540, 700, Math.max(1, dist), 0, TAU);
  c.stroke();
  c.setLineDash([]);
  c.strokeStyle = rgba(P.red, 0.85 * a);
  c.lineWidth = 3;
  c.beginPath();
  for (let i = 0; i <= 40; i++) {
    const q = gpsPin((drift * i) / 40);
    if (i) c.lineTo(q[0], q[1]);
    else c.moveTo(q[0], q[1]);
  }
  c.stroke();
  c.restore();
  glowDot(c, 540, 700, 80, P.hot, 0.5 * a);
  pinShape(c, 540, 700, 22, P.hot, a);
  shock(c, g[0], g[1], (t - tkm) / 0.6, 10, 160, P.red, 6);
  shock(c, g[0], g[1], (t - tkm - 0.2) / 0.6, 10, 160, P.red, 4);
  pinShape(c, g[0] + wob, g[1], 24, P.red, a * (Math.floor(t * 8) % 4 === 0 && t > tkm ? 0.6 : 1));
  c.restore();
  const [tx, ty] = toS(m, 540, 700), [gx, gy] = toS(m, g[0], g[1]);
  tag(c, "موقعیت واقعی", tx + 120, ty + 70, k(t, t0 + 0.2, t0 + 0.5), P.hot, 22);
  tag(c, "موقعیت GPS", gx - 30, gy - 100, k(t, t0 + 0.4, t0 + 0.7), P.red, 22);
  // the error, counted
  const v = 11.4 * ease.out(clamp((t - t11) / (tkm - t11 + 0.15)));
  const ea = k(t, t11 - 0.15, t11 + 0.1);
  hud(c, "خطای مکان‌یابی در یک روز", 540, 1010, { size: 24, alpha: ea });
  numUnit(c, v.toFixed(1), "کیلومتر", 540, 1080, 84, { col: P.red, a: ea, s: 1 + 0.22 * hit(t, tkm + 0.1, 0.2), glow: 22 });
  if (t > tkm) brackets(c, 300, 1035, 480, 95, P.red, Math.floor(t * 6) % 2 ? 1 : 0.4, 20, 3);
}

// ---------------- 9 · «سالِ ۱۹۷۷، هنوز همه باور نداشتن؛» ----------------
const CR = { x: 540, y: 820, w: 980 };
const crPt = (u: number, v: number): [number, number] => [CR.x + (u - 0.5) * CR.w, CR.y + (v - 0.5) * (CR.w / 1.5)];
const MONS: [number, number][] = [[0.28, 0.26], [0.5, 0.27], [0.735, 0.28]];
const HEADS: [number, number][] = [[0.219, 0.29], [0.449, 0.31], [0.755, 0.33]];
export function s1977(c: Ctx, t: number) {
  const t0 = SH.y1977, t7 = Wd(9, "هفت،"), th = Wd(9, "هنوز") - 0.12, tb = Wd(9, "باور") - 0.05;
  const e = ease.inOut(clamp((t - t0 - 0.05) / (t7 + 0.12 - t0 - 0.05)));
  const yr = lerp(2026, 1977, e);
  const ya = k(t, t0, t0 + 0.2);
  odometer(c, yr, 4, 540, 300, 118, { a: ya, col: P.hot });
  shock(c, 540, 300, (t - t7 - 0.12) / 0.6, 160, 460, P.hot, 6, 0.4);
  ruler(c, 170, 432, 740, 1960, 2030, yr, ya);
  // while the years roll back: a big clock spinning backwards inside a tunnel of rings rushing in
  const ra = k(t, t0 + 0.05, t0 + 0.3) * (1 - k(t, th - 0.25, th + 0.2));
  if (ra > 0) {
    c.save();
    for (let i = 0; i < 7; i++) {
      const ph = (i / 7 + 1.6 * e + 0.3 * (t - t0)) % 1, rr = lerp(900, 170, ph);
      c.strokeStyle = rgba(P.amber, ra * 0.38 * Math.sin(ph * Math.PI));
      c.lineWidth = 2 + 3 * ph;
      c.beginPath();
      c.ellipse(540, 780, rr, rr * 0.92, 0, 0, TAU);
      c.stroke();
    }
    c.restore();
    clockFace(c, 540, 780, 165 * (0.85 + 0.15 * ra), -Math.PI / 2 - 70 * e, t, { a: ra, col: P.hot, back: true });
  }
  const m: LCam = { ax: 540, ay: 800, fx: 540, fy: 800, z: 1 + 0.05 * clamp((t - th) / 2) };
  c.save();
  cam(c, m);
  beam(c, t, 1000, 900, rev(t, th, 0.5));
  const box = materialize(c, "control", CR.x, CR.y, CR.w, t, th, 9, { life: 0.3 });
  if (box) {
    // the CRT screens flicker and roll
    const f = Math.floor(t * 30);
    MONS.forEach(([u, v], i) => {
      const [x, y] = crPt(u, v), w = 112, h = 62, fl = 0.1 + 0.18 * hash(f * 1.3 + i * 7);
      c.save();
      c.globalCompositeOperation = "lighter";
      c.fillStyle = rgba(P.amber, fl * rev(t, th + 0.3, 0.3));
      c.fillRect(x - w / 2, y - h / 2, w, h);
      const ry = y - h / 2 + ((t * 0.7 + i * 0.3) % 1) * h;
      c.fillStyle = rgba(P.hot, 0.25 * rev(t, th + 0.3, 0.3));
      c.fillRect(x - w / 2, ry, w, 4);
      c.restore();
    });
  }
  // doubt: red question marks pop over their heads
  HEADS.forEach(([u, v], i) => {
    const s = pop(t, tb + i * 0.1, 0.35);
    if (s <= 0) return;
    const [x, y] = crPt(u, v);
    const yy = y - 135 + Math.sin(t * 5 + i) * 6;
    glowDot(c, x, yy, 70, P.red, 0.35 * s);
    c.save();
    c.translate(x, yy);
    c.scale(s, s);
    hud(c, "؟", 0, 0, { size: 62, color: P.red, glow: 18, weight: 700 });
    c.restore();
  });
  c.restore();
}

// ---------------- 10 · «اولین ماهواره‌ی آزمایشی رو فرستادن، ولی از نظریه‌ی اینشتین استفاده نکردن.» ----------------
const LIMB = { x: 540, y: 2420, r: 1330 };
export function sTestSat(c: Ctx, t: number) {
  const t0 = SH.testsat, ta = Wd(10, "آزمایشی") - 0.1, te = Wd(10, "اینشتین") - 0.15, tu = Wd(10, "استفاده"), tn = Wd(10, "نکردن") - 0.02;
  const m: LCam = { ax: 540, ay: 700, fx: 540, fy: 700, z: 1.0 + 0.04 * clamp((t - t0) / 5.5) };
  c.save();
  cam(c, m);
  limb(c, LIMB.x, LIMB.y, LIMB.r, t, k(t, t0, t0 + 0.4));
  // launch: the satellite climbs from behind the Earth, then steps aside for Einstein
  const L = ease.out(clamp((t - t0 - 0.05) / 1.6)), side = ease.inOut(clamp((t - te + 0.35) / 0.7));
  const sx = lerp(lerp(600, 540, L), 300, side), sy = lerp(lerp(1180, 560, L), 450, side), sw = lerp(lerp(240, 700, L), 470, side);
  c.save();
  c.beginPath();
  c.rect(-200, -200, 1480, 2400);
  c.arc(LIMB.x, LIMB.y, LIMB.r, 0, TAU, true);
  c.clip();
  // exhaust: sparks streaming back along the climb
  const ex = 1 - k(t, t0 + 1.2, t0 + 1.8);
  if (ex > 0) {
    const r = rng(15);
    c.save();
    c.globalCompositeOperation = "lighter";
    for (let i = 0; i < 70; i++) {
      const age = (t * 1.6 + r()) % 1, spread = (r() - 0.5) * 60 * age;
      const px = sx + spread + (r() - 0.5) * 10, py = sy + sw * 0.28 + age * 260;
      c.fillStyle = rgba(r() < 0.4 ? P.hot : P.amber, (1 - age) * 0.8 * ex);
      c.beginPath();
      c.arc(px, py, 2 + (1 - age) * 3, 0, TAU);
      c.fill();
    }
    c.restore();
    glowDot(c, sx, sy + sw * 0.3, 120, P.hot, 0.5 * ex);
  }
  holo(c, "testsat", sx, sy, sw, t, { reveal: rev(t, t0, 0.45), seed: 11, life: 0.6 });
  c.restore();
  // what it was
  const la = 1 - k(t, te - 0.3, te);
  callout(c, sx, sy + sw * 0.02, 700, 820, "ساعت اتمی سزیم", k(t, ta + 0.35, ta + 1.0, ease.out), t, 1, la);
  // Einstein, and the relativity switch
  const ea = rev(t, te, 0.6);
  if (t > te - 0.3) {
    const off = t > tn;
    materialize(c, "einstein", 765, 640, 470, t, te, 13, { alpha: off ? lerp(1, 0.45, k(t, tn, tn + 0.3)) : 1, tint: off ? 0.85 * k(t, tn, tn + 0.2) : 0, glitch: off ? 1 + 4 * hit(t, tn, 0.3) : 1 });
    brackets(c, 555, 420, 420, 440, off ? P.red : P.amber, ea * (off && Math.floor(t * 8) % 2 ? 0.5 : 1), 30, 3);
    const pa = k(t, te + 0.25, te + 0.55);
    hud(c, "اصلاحیه‌ی نسبیت", 300, 838, { size: 26, alpha: pa });
    // the switch shows ON, pulses on «استفاده», snaps OFF on «نکردن»
    const on = t < tn ? 1 : 1 - ease.outBack(clamp((t - tn) / 0.2));
    toggle(c, 300, 910, clamp(on), pa, 1.15 * (1 + 0.12 * hit(t, tu, 0.2) + 0.15 * hit(t, tn, 0.2)));
    hud(c, t < tn ? "روشن" : "خاموش", 300, 982, { size: 26, color: t < tn ? P.hot : P.red, alpha: pa, glow: 10 });
    shock(c, 300, 910, (t - tn) / 0.6, 40, 220, P.red, 6);
  }
  c.restore();
  const da = k(t, ta, ta + 0.3) * (1 - k(t, te - 0.4, te - 0.1));
  hud(c, "NTS-2", 540, 205, { size: 54, color: P.hot, alpha: da, glow: 16, weight: 700 });
  typed(c, "23 ژوئن 1977", 540, 272, k(t, ta + 0.1, ta + 0.6), t, { size: 24, alpha: da });
}

// ---------------- 11 · «سه هفته بعد، ساعتِ ماهواره دقیقاً همون‌قدری جلو افتاده بود که نسبیت پیش‌بینی کرده بود.» ----------------
function calendar(c: Ctx, x: number, y: number, s: number, p: number, a: number) {
  if (a <= 0.003) return;
  const cw = 64, chh = 52, gp = 8, w = 7 * cw + 6 * gp, h = 3 * chh + 2 * gp;
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.globalAlpha *= clamp(a);
  for (let i = 0; i < 21; i++) {
    const col = i % 7, row = Math.floor(i / 7), on = p * 21 > i;
    const cx = w / 2 - cw - col * (cw + gp), cy = -h / 2 + row * (chh + gp); // days run right → left
    const fresh = on ? clamp(1 - (p * 21 - i) / 3) : 0;
    c.fillStyle = rgba(on ? P.amber : "#000000", on ? 0.3 + 0.5 * fresh : 0.35);
    c.fillRect(cx, cy, cw, chh);
    c.strokeStyle = rgba(on ? P.hot : P.amber, on ? 0.9 : 0.4);
    c.lineWidth = 2;
    c.strokeRect(cx, cy, cw, chh);
    c.font = `600 22px CP`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = on ? P.hot : rgba(P.amber, 0.5);
    c.fillText(String(i + 1), cx + cw / 2, cy + chh / 2 + 1);
  }
  c.restore();
  hud(c, "3 هفته", x, y - (h / 2 + 40) * s, { size: 30 * Math.max(0.7, s), color: P.hot, alpha: a, glow: 10 });
}
const PROOF: Chart = { x: 190, y: 400, w: 720, h: 450, xMax: 21, yMax: 900, xTicks: [0, 7, 14, 21], yTicks: [0, 300, 600, 900], xLabel: "روز", yLabel: "میکروثانیه جلو" };
const MEAS: [number, number][] = [[0, 0], [3, 112], [5, 196], [7, 265], [10, 384], [12, 455], [14, 538], [17, 648], [19, 727], [21, 802]];
export function sProof(c: Ctx, t: number) {
  const t0 = SH.proof, th = Wd(11, "سه") - 0.05, tw = Wd(11, "هفته"), tj = Wd(11, "جلو"), tn = Wd(11, "نسبیت"), tp = Wd(11, "پیش‌بینی");
  const m: LCam = { ax: 540, ay: 640, fx: 540, fy: 640, z: 1.0 + 0.05 * clamp((t - t0) / 5.5) };
  c.save();
  cam(c, m);
  // three weeks fly by on a calendar, which then parks at the top
  const shrink = ease.inOut(clamp((t - (tw + 0.75)) / 0.5));
  calendar(c, 540, lerp(600, 250, shrink), lerp(1, 0.48, shrink), clamp((t - th) / 0.9), k(t, t0, t0 + 0.2));
  const ca = k(t, tw + 0.85, tw + 1.25);
  chartAxes(c, PROOF, ca);
  const head = chartLine(c, PROOF, MEAS, k(t, tw + 1.1, tj + 0.45, ease.inOut), P.amber);
  const pp = k(t, tn - 0.05, tp + 0.25, ease.inOut);
  const ph = chartLine(c, PROOF, [[0, 0], [21, 38.6 * 21]], pp, P.hot, { fill: false, dash: true, w: 3 });
  const lock = clamp((t - tp - 0.2) / 0.45);
  if (ph && lock > 0) {
    reticle(c, ph[0], ph[1], 44, lock, t, P.hot);
    shock(c, ph[0], ph[1], (t - tp - 0.5) / 0.6, 30, 200, P.hot, 6);
    tag(c, "تطابق: اختلاف کمتر از 1%", 640, 330, k(t, tp + 0.5, tp + 0.8), P.hot, 22);
  }
  void head;
  c.restore();
  // the two numbers, side by side (measured on the right: read first)
  const ma = k(t, tj, tj + 0.3), pa = k(t, tn, tn + 0.3);
  hud(c, "اندازه‌گیری", 760, 1010, { size: 22, alpha: ma });
  numUnit(c, "+38.2", "در روز", 760, 1072, 50, { col: P.hi, a: ma, s: 1 + 0.15 * hit(t, tj + 0.05, 0.2) });
  hud(c, "پیش‌بینی نسبیت", 320, 1010, { size: 22, alpha: pa, color: P.hot });
  numUnit(c, "+38.6", "در روز", 320, 1072, 50, { col: P.hot, a: pa, s: 1 + 0.15 * hit(t, tp, 0.2) });
}

// ---------------- 12 · «و برای همینه که هنوزم، ساعتِ ماهواره‌ها رو …» ----------------
export function sFix(c: Ctx, t: number) {
  const t0 = SH.fix, ton = Wd(12, "هنوزم") - 0.05;
  const m: LCam = { ax: 540, ay: 640, fx: 540, fy: 640, z: 1.0 + 0.06 * clamp((t - t0) / 2.6) };
  c.save();
  cam(c, m);
  const a = k(t, t0, t0 + 0.12), on = k(t, ton, ton + 0.22);
  hud(c, "اصلاحیه‌ی نسبیت", 540, 380, { size: 32, alpha: a });
  glowDot(c, 540, 500, 260, P.hot, 0.7 * hit(t, ton + 0.15, 0.25));
  toggle(c, 540, 500, on, a, 1.7 * (1 + 0.15 * hit(t, ton + 0.15, 0.2)));
  shock(c, 540, 500, (t - ton - 0.15) / 0.7, 80, 420, P.hot, 8);
  burst(c, 540, 500, (t - ton - 0.15) / 0.55, 130, 420, P.hot, 22, 9);
  hud(c, on > 0.5 ? "روشن" : "خاموش", 540, 605, { size: 30, color: on > 0.5 ? P.hot : P.red, alpha: a, glow: 10 });
  // the clock is tuned a hair slow: 10.23 MHz → 10.22999999543 MHz
  const fa = k(t, ton + 0.3, ton + 0.6);
  hud(c, "فرکانس ساعت ماهواره", 540, 745, { size: 24, alpha: fa });
  const full = "10.22999999543", n = Math.min(full.length, 5 + Math.floor(9 * k(t, ton + 0.5, ton + 1.2, (x) => x)));
  if (fa > 0) {
    c.save();
    c.globalAlpha = fa;
    c.font = `700 66px CP`;
    c.direction = "ltr";
    c.textBaseline = "middle";
    const w = c.measureText(full).width, x0 = 540 - w / 2, head = full.slice(0, 5), tail = full.slice(5, n);
    c.textAlign = "left";
    c.fillStyle = P.hi;
    c.shadowColor = P.amber;
    c.shadowBlur = 10 * scale();
    c.fillText(head, x0, 832);
    c.fillStyle = P.hot;
    c.shadowColor = P.hot;
    c.shadowBlur = 22 * scale();
    c.fillText(tail, x0 + c.measureText(head).width, 832);
    c.restore();
  }
  hud(c, "مگاهرتز", 540, 902, { size: 22, alpha: fa });
  typed(c, "به‌جای 10.23", 540, 965, k(t, ton + 1.1, ton + 1.5), t, { size: 22, color: P.amber, alpha: 0.85 });
  c.restore();
}
