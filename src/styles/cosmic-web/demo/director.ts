// Video 18 director: a pure function of time → what every layer, the camera, the post chain and the overlay show.
// Sections follow the narration (cues.ts). World units: million light-years (Mly), Earth at the origin.
import { add, clamp01, lerp3, len, mul, norm, project, ramp, smooth, smoother, sub, window01, type V3, type View } from "./cam";
import { voidGalaxyCenters } from "./vgalpos";
import { E, S, TOTAL, W } from "./cues";
import { LG_CENTRE, M31, MWC } from "./lgroup";
import { AU, EARTH_R } from "./near";
import META from "./web-meta.json";

// ── world facts
type Void = { c: V3; r: number; name?: string };
const BIG = META.big as Void[];
export const BIG_VOIDS = BIG;
export const LV: Void = { c: META.special.local.c as V3, r: META.special.local.r };
export const BOO: Void = { c: META.special.bootes.c as V3, r: META.special.bootes.r };
export const LANI: V3 = [-150, 12, -60];
export const SUN: V3 = mul([Math.cos(1.3 + 2 * 2.1), 0, Math.sin(1.3 + 2 * 2.1)], -AU); // Earth = origin, the Sun 1 AU away
const plain = BIG.filter((v) => !v.name && len(v.c) < 650 && v.r > 70);
/** an ordinary void for "a random point in the universe" */
export const V2: Void = plain[2];
/** the lonely galaxies inside V2 (same positions the layer draws) */
export const VGALS = voidGalaxyCenters(V2.c, V2.r);
/** two touching voids for the dark-energy merger */
export const PAIR: [Void, Void] = (() => {
  let best: [Void, Void] = [plain[0], plain[1]], bd = 1e9;
  for (const a of plain) for (const b of plain) {
    if (a === b) continue;
    const d = len(sub(a.c, b.c)), gap = d - (a.r + b.r);
    if (gap > -40 && gap < 30 && Math.abs(gap) < bd && a.r > 80 && b.r > 80) { bd = Math.abs(gap); best = [a, b]; }
  }
  return best;
})();
/** a void with a rich cluster on its rim (dark energy vs gravity) */
export const DEV: Void = plain[0];

// ── state
export type Label = { at?: V3; xy?: [number, number]; text: string; k: number; dx?: number; dy?: number; box?: boolean; size?: number; teal?: boolean; line?: boolean };
export type RingO = { c: V3; r: number; k: number; label?: string; dash?: boolean; teal?: boolean; lw?: number };
export type MeasureO = { a: V3; b: V3; text: string; k: number };
export type ArrowO = { a: V3; b: V3; k: number; teal?: boolean; head?: boolean; w?: number };
export type MarkerO = { at: V3; k: number; text?: string; pulse?: number };
export type Overlay = {
  labels: Label[]; rings: RingO[]; measures: MeasureO[]; arrows: ArrowO[]; markers: MarkerO[];
  title?: { k: number };
  hills?: { k: number; alien?: boolean };
  scale?: { text: string; mly: number; k: number };
  counter?: { text: string; k: number };
  wedge?: { k: number; sweep: number; bubbles: number };
  foam?: { k: number };
  grid?: { k: number; stretch: number };
  photon?: { k: number; prog: number };
  rays?: { k: number };
  flows?: { k: number; prog: number };
  close?: { k: number };
  frame?: { k: number };
  light?: { k: number; prog: number };
  zel?: { k: number; D: number; flow: number; labels: { text: string; k: number; kind: "cluster" | "fil" | "wall" }[] };
  targets?: { at: V3; k: number; text?: string }[];
  photo?: { k: number; crop: number; scale: number };
  voidRing?: { k: number; r: number };
};
export type WebS = {
  fade: number; gain?: number; hgain?: number; aper?: number; win?: number; mask?: number; pow?: number; near?: number; dexp?: number;
  slab?: { n: V3; w: number; t: number }; inf?: { k: number; tear: number }; recede?: number; cls?: [number, number, number, number];
  hi?: { c: V3; r: number; k: number }; // a region of the web lit up in gold
};
export type State = {
  view: View;
  sky?: { fade: number; band?: number; tilt?: number };
  earth?: { fade: number; spin: number };
  solar?: { fade: number };
  nbr?: { fade: number };
  lg?: { mw: number; others: number; halo: number; merged: number; at?: V3; spin?: number };
  web?: WebS;
  fill?: { fade: number; keep: number };
  zel?: { fade: number; D: number; ripple: number; gain?: number; az?: number };
  cmb?: { fade: number; spot: number; zoom: number };
  solo?: { fade: number; kind: "blue" | "spiral"; spin: number };
  vgal?: number;
  post: { exposure: number; black: number; vig?: number; bloom?: number };
  ov: Overlay;
};
const ov0 = (): Overlay => ({ labels: [], rings: [], measures: [], arrows: [], markers: [] });

// ── camera keys: log-distance zoom with scale-aware focus (powers-of-ten style)
type CK = { t: number; D: number; f: V3; az: number; el: number; fov: number; roll?: number };
function camAt(t: number, K: CK[]): View {
  let i = 0;
  while (i < K.length - 2 && t >= K[i + 1].t) i++;
  const a = K[i], b = K[Math.min(i + 1, K.length - 1)];
  const s = a === b ? 0 : smoother(t, a.t, b.t);
  const lD = Math.log(a.D) + (Math.log(b.D) - Math.log(a.D)) * s;
  const D = Math.exp(lD);
  const w = Math.abs(b.D - a.D) > 1e-9 * Math.max(a.D, b.D) ? clamp01((D - a.D) / (b.D - a.D)) : s;
  const f = lerp3(a.f, b.f, w);
  const az = a.az + (b.az - a.az) * s, el = a.el + (b.el - a.el) * s, fov = a.fov + (b.fov - a.fov) * s, roll = (a.roll ?? 0) + ((b.roll ?? 0) - (a.roll ?? 0)) * s;
  const c = Math.cos(el);
  return { pos: add(f, [Math.sin(az) * c * D, Math.sin(el) * D, Math.cos(az) * c * D]), look: f, fov, roll };
}
const dip = (t: number, at: number, d = 0.35) => 1 - smooth(Math.abs(t - at), 0, d);

// ── sections
function nightSky(t: number, t0: number, t1: number, alien = false): State {
  const u = (t - t0) / (t1 - t0);
  const az = 0.9 + u * 0.12, el = 0.35 + u * 0.1;
  const dir: V3 = [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)];
  return { view: { pos: [0, 0, 0], look: mul(dir, 1e-20), fov: 62 }, sky: { fade: 1, band: alien ? 1.1 : 1, tilt: alien ? 1 : 0 }, post: { exposure: 1, black: 0, vig: 0.45 }, ov: { ...ov0(), hills: { k: 1, alien } } };
}

function s1(t: number): State {
  // the night sky; on "خطای دید" the ground falls away and we tilt up into the stars
  const st = nightSky(t, 0, S(3));
  const lift = smooth(t, W(2, "ما") - 0.3, S(3) - 0.2);
  st.view.fov = 62 - 10 * lift;
  const az = 0.9 + 0.12 * (t / S(3)), el = 0.35 + 0.1 * (t / S(3)) + 0.9 * lift * lift;
  st.view.look = mul([Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)], 1e-20);
  st.ov.hills = { k: 1 - lift };
  st.ov.labels.push({ at: mul(norm([0.85, 0.05, 0.52]), 1e-20), text: "راه شیری", k: window01(t, W(1, "راه") - 0.2, S(2) - 0.4, 0.5, 0.6), dy: -80, box: true, size: 28 });
  st.post.black = Math.max(1 - smooth(t, 0, 1.4), smooth(t, S(3) - 0.5, S(3) - 0.05));
  return st;
}

function s2s3(t: number): State {
  // inside an ordinary void: pitch black, only "you". Then the camera backs out and the bubbles appear.
  const c = V2.c;
  const out = norm([0.35, 0.25, 0.9]);
  const back = smoother(t, W(3, "ذره") + 0.3, W(4, "حفره‌های") + 0.4);
  const wide = smoother(t, W(4, "حفره‌های") + 0.4, S(6) - 3.4);
  const D = 6 * Math.pow(170 / 6, back) * Math.pow(900 / 170, wide);
  const az = 0.2 + 0.5 * back + 0.35 * wide + 0.01 * t, el = 0.15 + 0.25 * wide;
  const view: View = { pos: add(c, mul([Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)], D)), look: c, fov: 50 };
  void out;
  const webK = smooth(t, W(3, "ذره") + 0.2, W(4, "بیشترِ") + 0.5);
  const ov = ov0();
  ov.markers.push({ at: c, k: smooth(t, S(3) + 0.6, S(3) + 1.6) * (1 - smooth(t, W(4, "حباب‌های"), W(4, "حفره‌های"))), text: "شما", pulse: t });
  // outline the biggest voids once the web is out
  const ringsK = smooth(t, W(4, "حفره‌های") - 0.2, W(4, "حفره‌های") + 1.4);
  const grow = smooth(t, W(5, "بزرگ‌تر") - 0.4, E(5) + 0.8);
  if (ringsK > 0) {
    const near = BIG.filter((v) => len(sub(v.c, c)) < 520 && v !== BOO).slice(0, 7);
    near.forEach((v, i) => ov.rings.push({ c: v.c, r: v.r * (0.8 + 0.2 * grow), k: clamp01(ringsK * 1.6 - i * 0.12) * (1 - smooth(t, S(6) - 3.2, S(6) - 2.4)), label: i === 0 ? "حفره‌ی کیهانی" : undefined }));
  }
  ov.scale = { text: "۱۰۰ میلیون سال نوری", mly: 100, k: window01(t, W(5, "صدها") - 0.2, S(6) - 3.0, 0.6, 0.5) };
  ov.title = { k: window01(t, E(5) + 0.35, S(6) - 0.4, 0.9, 0.6) };
  const web: WebS = { fade: webK * (1 - 0.85 * smooth(t, E(5) + 0.2, E(5) + 1.0)), aper: 2 * (1 - back), win: Math.max(V2.r * 1.25, Math.min(D * 0.2, 130)), near: D * 0.2, gain: 2.8, hgain: 0.9 };
  return { view, web, post: { exposure: 1, black: smooth(t, S(6) - 0.45, S(6) - 0.05) }, ov };
}

// journey: Earth → solar system → Milky Way → Andromeda → Local Group → Laniakea → cosmic web → Local Void
const MW_FOCUS: V3 = MWC;
const PAIR_MID: V3 = add(MWC, mul(M31, 0.5));
const LGF: V3 = add(MWC, LG_CENTRE);
const LVmid: V3 = mul(LV.c, 0.42);
const JK: CK[] = [
  { t: S(6) - 0.1, D: 3.4 * EARTH_R, f: [0, 0, 0], az: 0.25, el: 0.12, fov: 38 },
  { t: W(6, "خورشیدی") - 0.1, D: 4.2 * EARTH_R, f: [0, 0, 0], az: 0.42, el: 0.16, fov: 38 },
  { t: W(6, "دقیقه") + 0.2, D: 2.3 * AU, f: mul(SUN, 0.5), az: 0.9, el: 0.55, fov: 44 },
  { t: W(7, "عقب") - 0.1, D: 2.45 * AU, f: mul(SUN, 0.5), az: 1.0, el: 0.6, fov: 44 },
  { t: W(7, "کوچیک‌تر") + 0.2, D: 75 * AU, f: SUN, az: 1.2, el: 0.75, fov: 44 },
  { t: W(7, "باشه") + 0.2, D: 0.17, f: MW_FOCUS, az: 1.5, el: 0.95, fov: 44 },
  { t: S(8) - 0.2, D: 0.15, f: MW_FOCUS, az: 1.85, el: 0.88, fov: 44 },
  { t: W(8, "آندرومدا") - 0.1, D: 3.1, f: PAIR_MID, az: 1.55, el: 0.62, fov: 44 },
  { t: S(9) + 0.2, D: 2.9, f: PAIR_MID, az: 1.7, el: 0.6, fov: 44 },
  { t: W(9, "هشتاد") + 0.2, D: 10.5, f: LGF, az: 1.45, el: 0.62, fov: 46 },
  { t: S(10) + 0.4, D: 9.8, f: LGF, az: 1.62, el: 0.66, fov: 46 },
  { t: W(10, "لانیاکیا") + 0.4, D: 560, f: LANI, az: 1.2, el: 0.75, fov: 48 },
  { t: S(11) + 0.3, D: 520, f: LANI, az: 1.38, el: 0.7, fov: 48 },
  { t: W(11, "شبکه‌ی") + 0.6, D: 760, f: [0, 0, 0], az: 2.0, el: 0.35, fov: 50 },
  { t: S(13) - 0.2, D: 640, f: [0, 0, 0], az: 2.35, el: 0.42, fov: 50 },
  // seen from the side, so we sit visibly on the rim of the Local Void and can be seen moving away from it
  { t: W(13, "حفره‌ی") + 0.3, D: 340, f: LVmid, az: 1.6, el: 0.2, fov: 48 },
  { t: S(15), D: 320, f: mul(LV.c, 0.3), az: 1.68, el: 0.22, fov: 48 },
  { t: S(16) + 0.1, D: 300, f: [0, 0, 10], az: 1.75, el: 0.24, fov: 48 },
];
function s4(t: number): State {
  const view = camAt(t, JK);
  const D = len(sub(view.pos, view.look));
  const ov = ov0();
  const st: State = { view, post: { exposure: 1, black: 1 - smooth(t, S(6) - 0.05, S(6) + 0.7) }, ov };
  // layer visibility by scale (D in Mly)
  const L = Math.log10(D);
  st.earth = { fade: 1 - smooth(L, -11.8, -11.0), spin: t * 0.004 };
  st.sky = { fade: (1 - smooth(L, -7.5, -5.2)) * 0.9, band: 0.5 };
  st.solar = { fade: smooth(L, -14.3, -12.8) * (1 - smooth(L, -8.6, -7.6)) };
  st.nbr = { fade: smooth(L, -9.6, -8.0) * (1 - smooth(L, -3.4, -2.3)) };
  const mwK = smooth(L, -4.2, -2.4);
  st.lg = { mw: mwK, others: smooth(L, -1.4, -0.2), halo: smooth(L, 0.1, 0.8) * (1 - smooth(L, 2.0, 2.4)), merged: 0, spin: t };
  const webK = smooth(L, 1.3, 2.2);
  // "…between the filaments: darkness" — the web dims for a moment so the dark gaps dominate
  st.web = { fade: webK, gain: 2.6, hgain: 0.85, win: Math.min(Math.max(D * 0.18, 40), 120), aper: 3, dexp: 1 - 0.6 * window01(t, W(12, "تاریکی") - 0.3, W(12, "حفره‌ها") + 0.7, 0.6, 0.8) };
  if (L > 2.2) st.lg = { ...st.lg, mw: st.lg.mw * (1 - smooth(L, 2.2, 2.6)), others: st.lg.others * (1 - smooth(L, 2.2, 2.6)) };
  // overlay
  ov.labels.push({ at: [0, 0, 0], text: "زمین", k: window01(t, W(6, "زمین") - 0.1, W(6, "خورشیدی") + 0.4), dx: 0, dy: -150, box: true, line: true });
  ov.labels.push({ at: SUN, text: "خورشید", k: window01(t, W(6, "خورشیدی"), W(7, "منظومه‌ی") - 0.3, 0.5, 0.4), dy: -70, box: true, line: true });
  ov.light = { k: window01(t, W(6, "نورش") - 0.2, S(7) + 0.4, 0.3, 0.5), prog: ramp(t, W(6, "هشت") - 0.1, W(6, "برسه") + 0.3) };
  ov.labels.push({ at: lerp3(SUN, [0, 0, 0], 0.5), text: "۸ دقیقه‌ی نوری", k: window01(t, W(6, "هشت"), S(7) + 0.3, 0.3, 0.5), dy: 34, size: 26 });
  ov.labels.push({ at: SUN, text: "منظومه‌ی شمسی", k: window01(t, W(7, "منظومه‌ی") + 0.15, W(7, "کوچیک‌تر") + 0.8, 0.4, 0.6), dy: -110, box: true });
  ov.markers.push({ at: [0, 0, 0], k: window01(t, W(7, "کهکشانِ") - 0.2, S(8) - 0.2), text: "خورشید", pulse: t });
  ov.labels.push({ at: add(MWC, [0, 0.008, -0.03]), text: "راه شیری", k: window01(t, W(7, "شیری") - 0.3, S(8) + 1.2), dy: -230, box: true });
  ov.measures.push({ a: add(MWC, [-0.05, 0, 0]), b: add(MWC, [0.05, 0, 0]), text: "۱۰۰ هزار سال نوری", k: window01(t, W(7, "پهنای") - 0.3, S(8) + 0.6, 0.6, 0.5) });
  ov.labels.push({ at: add(MWC, [0, 0.004, 0]), text: "راه شیری", k: window01(t, W(8, "اون‌طرف‌تر") - 0.4, S(9) + 0.8), dy: 60, box: true });
  ov.labels.push({ xy: [960, 985], at: [0, 0, 0], text: "صدها میلیارد ستاره", k: window01(t, W(7, "صدها") - 0.2, S(8) - 0.3, 0.5, 0.5), size: 28 });
  ov.labels.push({ at: MWC, text: "همه‌ی تاریخ بشر", k: window01(t, W(9, "تاریخِ") - 0.2, S(10) + 0.4, 0.5, 0.5), dy: 46, size: 24 });
  ov.labels.push({ at: add(MWC, M31), text: "آندرومدا", k: window01(t, W(8, "آندرومدا") - 0.3, S(9) + 0.8), dy: -95, box: true });
  ov.measures.push({ a: add(MWC, mul(M31, 0.05)), b: add(MWC, mul(M31, 0.93)), text: "۲.۵ میلیون سال نوری", k: window01(t, W(8, "دو") + 0.3, W(8, "احتمالاً"), 0.6, 0.5) });
  ov.arrows.push({ a: add(MWC, mul(M31, 0.12)), b: add(MWC, mul(M31, 0.4)), k: window01(t, W(8, "می‌خورن") - 0.8, S(9) + 0.6, 0.6, 0.4), teal: true });
  ov.arrows.push({ a: add(MWC, mul(M31, 0.88)), b: add(MWC, mul(M31, 0.6)), k: window01(t, W(8, "می‌خورن") - 0.8, S(9) + 0.6, 0.6, 0.4), teal: true });
  ov.labels.push({ at: add(LGF, [0, 2.2, 0]), text: "گروه محلی", k: window01(t, W(9, "گروهِ") - 0.2, S(10) + 1.0), dy: -60, box: true });
  ov.labels.push({ at: add(LGF, [0, 2.2, 0]), text: "بیش از ۸۰ کهکشان", k: window01(t, W(9, "هشتاد") - 0.1, W(9, "کلِ")), dy: -10, size: 24 });
  ov.markers.push({ at: MWC, k: window01(t, W(9, "تاریخِ") - 0.2, S(10) + 0.8), text: "ما", pulse: t });
  // Laniakea: its own galaxies light up gold inside the blue web (no abstract sphere), with name and size
  const laniK = window01(t, W(10, "ابرخوشه‌ی") - 0.4, W(11, "پخش‌وپلا"), 1.2, 0.9);
  st.web.hi = { c: LANI, r: 260, k: laniK };
  ov.labels.push({ at: add(LANI, [0, 200, 0]), text: "ابرخوشه‌ی لانیاکیا", k: window01(t, W(10, "لانیاکیا") - 0.3, W(11, "پخش‌وپلا"), 0.6, 0.8), box: true, size: 30 });
  const vd = norm(sub(view.look, view.pos)), vr = norm([-vd[2], 0, vd[0]]); // measure across the screen, not along the view
  ov.measures.push({ a: add(add(LANI, mul(vr, -255)), [0, -150, 0]), b: add(add(LANI, mul(vr, 255)), [0, -150, 0]), text: "۵۲۰ میلیون سال نوری", k: window01(t, W(10, "پونصد") - 0.2, W(11, "پخش‌وپلا"), 0.6, 0.8) });
  ov.labels.push({ at: add(LANI, [0, 200, 0]), text: "حدود ۱۰۰ هزار کهکشان", k: window01(t, W(10, "صد") - 0.2, W(11, "پخش‌وپلا"), 0.5, 0.8), dy: 48, size: 24 });
  ov.markers.push({ at: [0, 0, 0], k: window01(t, W(10, "نقطه") - 0.2, S(12)), text: "ما", pulse: t });
  ov.labels.push({ at: [0, 0, 0], text: "شبکه‌ی کیهانی", xy: [960, 150], k: window01(t, W(11, "شبکه‌ی") - 0.3, S(12) + 0.8), box: true, size: 34 });
  // voids in between
  const vk = smooth(t, W(12, "حفره‌ها") - 0.3, W(12, "حفره‌ها") + 1.2) * (1 - smooth(t, S(13) + 0.4, S(13) + 1.4));
  if (vk > 0) BIG.filter((v) => v !== LV && v !== BOO && len(v.c) < 520).slice(0, 6).forEach((v, i) => ov.rings.push({ c: v.c, r: v.r * 0.85, k: clamp01(vk * 1.5 - i * 0.08) }));
  // the Local Void beside us (seen from the side: we sit just outside its rim)
  ov.rings.push({ c: LV.c, r: LV.r * 0.9, k: window01(t, W(13, "حفره‌ی") - 0.3, S(16) + 1.5, 1.2, 0.8), label: "حفره‌ی محلی" });
  // we move away from it: the marker really travels, leaving a trail
  const away = norm(sub([0, 0, 0], LV.c));
  const move = smoother(t, W(14, "دور") - 0.3, E(14) + 0.3) * 0.75 + smoother(t, S(15), S(16)) * 0.25;
  const us = mul(away, 46 * move);
  ov.markers.push({ at: us, k: window01(t, S(13), S(16) + 1.0), text: "ما", pulse: t });
  ov.arrows.push({ a: [0, 0, 0], b: us, k: move > 0.02 ? window01(t, W(14, "دور") - 0.3, S(16) + 0.6, 0.3, 0.5) : 0, teal: true, w: 2.5 });
  ov.labels.push({ at: us, text: "۲۶۰ کیلومتر در ثانیه", k: window01(t, W(14, "دویست") - 0.2, S(15) + 0.2, 0.5, 0.5), dy: 44, size: 26 });
  // "nothing on that side pulls us…"
  ov.labels.push({ at: LV.c, text: "خالی", k: window01(t, W(15, "اون") - 0.2, W(15, "ولی") + 0.6, 0.5, 0.6), size: 30, teal: false });
  // "…but all the matter on this side does": it lights up and pulls (arrows from us towards it)
  const pull = window01(t, W(15, "ولی") - 0.3, S(16) + 0.6, 0.8, 0.6);
  st.web.hi = laniK > 0.001 ? st.web.hi : { c: add(us, mul(away, 150)), r: 175, k: pull };
  const side = norm([away[2], 0, -away[0]]);
  [-0.6, 0, 0.6].forEach((a, i) => {
    const d = norm(add(mul(away, Math.cos(a)), mul(side, Math.sin(a))));
    ov.arrows.push({ a: add(us, mul(d, 10)), b: add(us, mul(d, 70)), k: clamp01(pull * 1.5 - i * 0.12), w: 2 });
  });
  ov.labels.push({ xy: [960, 985], text: "کشش گرانشی ماده‌ی اطراف", k: pull, box: true, size: 28, at: [0, 0, 0] });  return st;
}

// Boötes: fly there, outline, "thousands should be here" → "only ~60", fly into the centre, darkness, pull back to everything
const BOK: CK[] = [
  { t: S(16) + 0.1, D: 300, f: [0, 0, 10], az: 1.75, el: 0.24, fov: 48 },
  { t: W(16, "حفره‌ی", 1) - 0.4, D: 640, f: BOO.c, az: 2.35, el: 0.25, fov: 46 },
  { t: S(17) + 0.4, D: 600, f: BOO.c, az: 2.45, el: 0.27, fov: 46 },
  { t: E(18) + 0.3, D: 560, f: BOO.c, az: 2.7, el: 0.3, fov: 46 },
  { t: S(20) - 0.3, D: 6, f: BOO.c, az: 2.9, el: 0.32, fov: 54 },
  { t: S(21) - 0.1, D: 0.34, f: BOO.c, az: 3.6, el: 0.55, fov: 50 },
  { t: E(21) + 0.4, D: 0.28, f: BOO.c, az: 4.0, el: 0.6, fov: 50 },
  { t: W(22, "بیشترِ") + 0.1, D: 900, f: BOO.c, az: 4.3, el: 0.5, fov: 50 },
  { t: S(23) + 0.2, D: 3200, f: [0, 0, 0], az: 4.6, el: 0.55, fov: 42 },
];
function s5(t: number): State {
  const view = camAt(t, BOK);
  const D = len(sub(view.pos, view.look));
  const ov = ov0();
  const inside = D < BOO.r;
  const pullback = smooth(t, W(22, "ترسناک‌ترین"), S(23));
  const st: State = { view, post: { exposure: 1, black: 0 }, ov };
  const winNear = Math.max(Math.min(D * 0.38, BOO.r * 0.62), 60);
  st.web = { fade: 1, gain: 2.6, hgain: 0.85, win: winNear + (1600 - winNear) * pullback, aper: inside ? 2 : 3, mask: pullback > 0.5 ? 880 : 0 };
  // inside the void: only a slice around its empty centre is drawn → true darkness (the far walls stay out of view)
  if (t > S(20) - 1.5 && t < W(22, "بیشترِ")) { st.web.fade = 1 - 0.97 * smooth(t, S(20) - 1.5, S(20) + 2.5); st.web.win = BOO.r * 0.5; }
  st.fill = { fade: window01(t, W(17, "هزاران") - 0.3, E(18) + 1.8, 0.9, 1.0), keep: smooth(t, W(18, "فقط") - 0.2, W(18, "پیدا")) };
  // what if the Milky Way sat here?
  st.lg = { mw: window01(t, W(21, "راه") - 0.3, E(21) + 0.6, 0.8, 0.8), others: 0, halo: 0, merged: 0, at: BOO.c, spin: t };
  ov.rings.push({ c: BOO.c, r: BOO.r, k: window01(t, W(16, "حفره‌ی", 1) - 0.6, S(19) + 0.5, 1.2, 0.8), label: "حفره‌ی بوتیس" });
  const right: V3 = norm([Math.cos(2.6), 0, -Math.sin(2.6)]);
  ov.measures.push({ a: add(BOO.c, mul(right, -BOO.r)), b: add(BOO.c, mul(right, BOO.r)), text: "۳۳۰ میلیون سال نوری", k: window01(t, W(17, "سیصد") - 0.3, W(17, "باید"), 0.6, 0.6) });
  ov.labels.push({ at: add(BOO.c, [0, -BOO.r * 0.95, 0]), text: "کشف: ۱۹۸۱", k: window01(t, S(17), W(17, "حدودِ") + 0.6, 0.4, 0.5), dy: 44, box: true });
  // "most of the universe looks exactly like this" — voids marked all over the ball
  const allK = window01(t, W(22, "بیشترِ") - 0.3, S(23) + 0.3, 1.0, 0.6);
  if (allK > 0.001) BIG.filter((v) => v !== BOO && len(v.c) < 760).slice(0, 13).forEach((v, i) => ov.rings.push({ c: v.c, r: v.r * 0.85, k: clamp01(allK * 1.4 - i * 0.05) }));
  ov.counter = { text: t < W(18, "فقط") ? "انتظار: هزاران کهکشان" : "پیدا شده: حدود ۶۰", k: window01(t, W(17, "هزاران") - 0.2, E(18) + 1.0, 0.4, 0.6) };
  ov.labels.push({ xy: [960, 180], at: [0, 0, 0], text: "اگر راه شیری اینجا بود…", k: window01(t, W(21, "اگه") - 0.2, E(21) + 0.4, 0.6, 0.6), size: 30 });
  ov.labels.push({ xy: [960, 900], at: [0, 0, 0], text: "تا دهه‌ی ۱۹۶۰ نمی‌فهمیدیم کهکشان دیگری هست", k: window01(t, W(21, "دهه‌ی") - 0.2, E(21) + 0.4, 0.5, 0.6), size: 26 });
  st.post.black = 0.0;
  return st;
}

// Why bubbles: question over the ball → rewind → near-uniform young universe → oldest light → gravity → the web grows
function s6(t: number): State {
  const ov = ov0();
  const st: State = { view: { pos: [0, 0, 200], look: [0, 0, 0], fov: 40 }, post: { exposure: 1, black: 0 }, ov };
  if (t < W(24, "برگردیم") + 0.4) {
    // the universe ball keeps turning, zooming in a little
    st.view = camAt(t, [
      { t: S(23) + 0.2, D: 3200, f: [0, 0, 0], az: 4.6, el: 0.55, fov: 42 },
      { t: W(24, "برگردیم") + 0.4, D: 2400, f: [0, 0, 0], az: 5.0, el: 0.6, fov: 42 },
    ]);
    st.web = { fade: 1 - smooth(t, W(24, "برگردیم") - 0.2, W(24, "برگردیم") + 0.4), gain: 3.0, hgain: 1.15, win: 1500, mask: 880 };
    st.post.black = dip(t, W(24, "برگردیم") + 0.4, 0.4);
    return st;
  }
  // the 2D field (zel): rewind, ripples, CMB, growth. Field is 100 units wide, seen face-on.
  const tz0 = W(24, "برگردیم") + 0.4;
  const rewind = 1 - smoother(t, tz0, tz0 + 1.6); // starts formed, rewinds to smooth
  const grow = smoother(t, W(25, "گرانش"), E(25) + 0.4) * 0.5 + smoother(t, S(26), W(26, "خوشه‌های") + 0.6) * 0.72;
  const D = t < W(25, "گرانش") ? 1.22 * rewind : grow;
  const cmbK = window01(t, W(24, "قدیمی‌ترین") - 0.3, S(25) + 0.2, 0.7, 0.8);
  const zoom = 1 + 0.25 * smooth(t, tz0, E(26));
  st.view = { pos: [0, 0, 56 / zoom], look: [0, 0, 0], fov: 44, roll: 0.02 * Math.sin(t * 0.2) };
  st.zel = { fade: smooth(t, tz0 - 0.2, tz0 + 0.4) * (1 - 0.85 * cmbK) * (1 - smooth(t, E(26) + 0.4, S(27) - 0.1)), D, ripple: (1 - smooth(D, 0.05, 0.4)) * (t > tz0 + 1.2 ? 1 : 0), gain: 1 };
  st.cmb = { fade: cmbK, spot: 0, zoom: 1 };
  ov.labels.push({ xy: [960, 150], at: [0, 0, 0], text: "یک در صد هزار", k: window01(t, W(24, "حدودِ") - 0.2, W(24, "هنوز") + 0.3, 0.4, 0.5), box: true, size: 30 });
  ov.labels.push({ xy: [960, 150], at: [0, 0, 0], text: "قدیمی‌ترین نورِ جهان", k: cmbK, box: true, size: 30 });
  ov.labels.push({ xy: [960, 150], at: [0, 0, 0], text: "گرانش", k: window01(t, W(25, "گرانش") - 0.1, E(25) + 0.3, 0.4, 0.5), box: true, size: 30 });
  const yrs = t < S(26) ? "۳۸۰ هزار سال پس از مهبانگ" : t < W(26, "رشته") ? "۱ میلیارد سال" : t < W(26, "خوشه‌های") ? "۵ میلیارد سال" : "۱۳.۸ میلیارد سال";
  ov.counter = { text: yrs, k: window01(t, W(25, "گرانش"), E(26) + 0.3, 0.5, 0.4) };
  // line 25: arrows show matter actually flowing towards the denser spots; line 26: the structures are named on the field
  ov.zel = {
    k: st.zel.fade, D,
    flow: window01(t, W(25, "هر") - 0.2, E(25) + 0.6, 0.6, 0.6),
    labels: [
      { text: "دیواره", kind: "wall", k: window01(t, W(26, "دیواره‌ها") - 0.2, W(26, "رشته") + 0.2, 0.4, 0.5) },
      { text: "رشته", kind: "fil", k: window01(t, W(26, "رشته") - 0.2, W(26, "خوشه‌های") + 0.2, 0.4, 0.5) },
      { text: "خوشه‌ی کهکشانی", kind: "cluster", k: window01(t, W(26, "خوشه‌های") - 0.2, E(26) + 0.4, 0.4, 0.5) },
    ],
  };
  st.post.black = dip(t, S(27) - 0.05, 0.3);
  // 1986: the wedge map
  if (t >= S(27) - 0.05) {
    st.zel = undefined;
    st.cmb = undefined;
    ov.counter = undefined;
    ov.wedge = { k: window01(t, S(27), E(27) + 0.6, 0.5, 0.5), sweep: smoother(t, W(27, "اخترشناس‌ها") - 0.3, W(27, "زدن") + 0.3), bubbles: smooth(t, W(27, "حباب"), W(27, "حباب", 2) + 0.4) };
    ov.labels.push({ xy: [960, 110], at: [0, 0, 0], text: "۱۹۸۶ · نقشه‌ی یک برش از آسمان", k: window01(t, W(27, "سالِ") - 0.2, E(27) + 0.5, 0.5, 0.5), box: true, size: 28 });
    st.post.black = dip(t, S(28) - 0.25, 0.3);
  }
  // soap foam: a thin slice of the real web, top-down, with glossy bubble rims
  if (t >= S(28) - 0.25) {
    ov.wedge = undefined;
    ov.labels = [];
    const u = (t - S(28)) / (S(30) - S(28));
    st.view = { pos: [20 + 60 * u, 700 - 120 * u, 10], look: [20 + 60 * u, 0, 0], fov: 40, roll: 0.15 + 0.05 * u };
    const flow = smooth(t, S(29), E(29));
    st.web = { fade: 1, gain: 7.5, hgain: 2.6, slab: { n: [0, 1, 0], w: 0, t: 62 }, aper: 0, cls: [0.12 + 0.25 * flow, 0.7 + 0.2 * flow, 1.0, 1.4] };
    ov.foam = { k: window01(t, W(28, "کفِ") - 0.3, S(29) + 1.0, 0.8, 0.8) };
    ov.arrows = [];
    const fk = window01(t, W(29, "حفره‌ها") - 0.3, E(29) + 0.6, 0.6, 0.6);
    if (fk > 0) BIG.filter((v) => Math.abs(v.c[1]) < 60 && len(sub(v.c, st.view.look)) < 420).slice(0, 6).forEach((v) => {
      for (let a = 0; a < 6; a++) { const d: V3 = [Math.cos(a * 1.047 + 0.3), 0, Math.sin(a * 1.047 + 0.3)]; ov.arrows.push({ a: add(v.c, mul(d, v.r * 0.25)), b: add(v.c, mul(d, v.r * (0.25 + 0.5 * fk))), k: fk, w: 1.6 }); }
    });
    ov.labels.push({ xy: [960, 130], at: [0, 0, 0], text: "طناب‌کشی کیهانی", k: window01(t, W(29, "طنابکشیِ") - 0.2, E(29) + 0.5, 0.4, 0.5), box: true, size: 30 });
    st.post.black = Math.max(dip(t, S(28) - 0.25, 0.3), smooth(t, S(30) - 0.5, S(30) - 0.05));
  }
  return st;
}

// lonely void galaxies → a small blue one → a lovely lonely spiral → the night sky of a planet with nothing behind the stars
function s7(t: number): State {
  const ov = ov0();
  const st: State = { view: { pos: [0, 0, 1], look: [0, 0, 0], fov: 45 }, post: { exposure: 1, black: 0 }, ov };
  if (t < S(31) - 0.3) {
    const c = V2.c, u = (t - S(30)) / (S(31) - S(30));
    st.view = { pos: add(c, [30 - 18 * u, 8, 40 - 10 * u]), look: add(c, [0, 0, -20 * u]), fov: 52 };
    st.web = { fade: 0.35, gain: 2.6, hgain: 0.9, win: V2.r * 0.9, aper: 3, cls: [0.1, 0.5, 0.8, 0] };
    // "here and there, a few lonely galaxies": the on-screen ones nearest the centre get a quiet target mark
    const tk = window01(t, W(30, "اینجا") - 0.2, S(31) - 0.4, 0.6, 0.4);
    ov.targets = VGALS.map((g) => ({ g, q: project(st.view, g.p, 1920, 1080) }))
      .filter((o) => o.q && o.q.x > 200 && o.q.x < 1720 && o.q.y > 160 && o.q.y < 920)
      .sort((a, b) => Math.hypot(a.q!.x - 960, a.q!.y - 540) - Math.hypot(b.q!.x - 960, b.q!.y - 540))
      .slice(0, 3)
      .map((o, i) => ({ at: o.g.p, k: clamp01(tk * 1.6 - i * 0.25), text: i === 0 ? "کهکشانِ تنها" : undefined }));
    st.vgal = 1;
    ov.labels.push({ xy: [960, 140], at: [0, 0, 0], text: "کهکشان‌های حفره", k: window01(t, W(30, "کهکشانِ") - 0.3, S(31), 0.5, 0.4), box: true, size: 30 });
    st.post.black = Math.max(1 - smooth(t, S(30) - 0.2, S(30) + 0.5), smooth(t, S(31) - 0.6, S(31) - 0.3));
    return st;
  }
  if (t < S(32) - 0.3) {
    const u = (t - S(31)) / (S(32) - S(31));
    st.solo = { fade: smooth(t, S(31) - 0.3, S(31) + 0.6) * (1 - smooth(t, S(32) - 0.6, S(32) - 0.3)), kind: "blue", spin: t };
    st.view = { pos: add([0, 0, 0], [Math.sin(0.4 + 0.25 * u) * 0.05, 0.026 - 0.006 * u, Math.cos(0.4 + 0.25 * u) * 0.05]), look: [0, 0, 0], fov: 40 };
    const lb = (txt: string, w: string, i: number) => ov.labels.push({ xy: [1460, 380 + i * 90], at: [0, 0, 0], text: txt, k: window01(t, W(31, w) - 0.2, S(32) - 0.4, 0.4, 0.4), box: true, size: 30 });
    lb("کوچک‌تر", "کوچیک‌تر", 0); lb("آبی‌تر", "آبی‌ترن", 1); lb("پُر از گاز", "گاز", 2); lb("پیرشدن آرام", "آروم‌تر", 3);
    st.post.black = dip(t, S(32) - 0.3, 0.3);
    return st;
  }
  if (t < S(33) - 0.3) {
    // the real Hubble photograph of MCG+01-02-015; then everything but the galaxy goes dark and it shrinks to a dot
    const crop = smoother(t, W(32, "که") - 0.3, W(32, "تقریباً") - 0.2);
    const shrink = smoother(t, W(32, "تقریباً") - 0.4, E(32) + 0.8);
    ov.photo = { k: smooth(t, S(32) - 0.3, S(32) + 0.7), crop, scale: (1 + 0.06 * ramp(t, S(32), W(32, "که"))) * (1 - 0.93 * shrink) };
    ov.frame = { k: window01(t, W(32, "تلسکوپِ") - 0.2, W(32, "که") + 0.2, 0.5, 0.6) };
    ov.labels.push({ xy: [960, 975], at: [0, 0, 0], text: "یک کهکشانِ تنها در دلِ حفره · عکسِ تلسکوپِ هابل", k: window01(t, W(32, "یه") - 0.2, W(32, "که") + 0.3, 0.5, 0.5), size: 26 });
    ov.voidRing = { k: window01(t, W(32, "تقریباً") - 0.3, S(33) - 0.3, 0.8, 0.4), r: 120 + 300 * shrink };
    ov.labels.push({ xy: [960, 975], at: [0, 0, 0], text: "تا ۱۰۰ میلیون سال نوری: هیچ کهکشانی", k: window01(t, W(32, "تقریباً") - 0.3, S(33) - 0.4, 0.5, 0.4), size: 26 });
    st.post.black = dip(t, S(33) - 0.3, 0.3);
    return st;
  }
  const sky = nightSky(t, S(33), S(34), true);
  sky.post.black = Math.max(1 - smooth(t, S(33) - 0.3, S(33) + 0.6), smooth(t, S(34) - 1.2, S(34) - 0.2));
  sky.ov.labels.push({ xy: [960, 150], at: [0, 0, 0], text: "پشتِ ستاره‌ها: هیچ کهکشانی نیست", k: window01(t, W(33, "پشتِ") - 0.2, E(33), 0.5, 0.6), size: 28 });
  return sky;
}

// dark energy: title → stretching grid → two voids merge → light loses energy → cold spot → the future → darkness closes in
function s8(t: number): State {
  const ov = ov0();
  const st: State = { view: { pos: [0, 0, 1], look: [0, 0, 0], fov: 45 }, post: { exposure: 1, black: 0 }, ov };
  if (t < S(35) - 0.3) {
    ov.rays = { k: window01(t, S(34), S(35) - 0.2, 1.0, 0.4) };
    ov.labels.push({ xy: [960, 540], at: [0, 0, 0], text: "انرژیِ تاریک", k: window01(t, W(34, "انرژیِ") - 0.3, S(35) - 0.3, 0.6, 0.4), box: true, size: 46 });
    st.post.black = 1 - smooth(t, S(34) - 0.2, S(34) + 0.5);
    return st;
  }
  if (t < S(37) - 0.3) {
    // a slice through two touching voids; first the grid (35), then they inflate and merge (36)
    const [a, b] = PAIR;
    const mid = lerp3(a.c, b.c, 0.5), ax = norm(sub(b.c, a.c));
    let nrm = norm([ax[1] * 0 - ax[2] * 1, ax[2] * 0 - ax[0] * 0, ax[0] * 1 - ax[1] * 0]); // ax × y
    if (len(nrm) < 0.1) nrm = [0, 1, 0];
    nrm = norm([-(ax[2]), 0, ax[0]]);
    const up: V3 = norm([ax[1] * nrm[2] - ax[2] * nrm[1], ax[2] * nrm[0] - ax[0] * nrm[2], ax[0] * nrm[1] - ax[1] * nrm[0]]);
    void up;
    const span = len(sub(b.c, a.c)) + a.r + b.r;
    const u = (t - S(35)) / (S(37) - S(35));
    st.view = { pos: add(mid, mul(nrm, span * 0.95 * (1 - 0.06 * u))), look: mid, fov: 46 };
    const inf = smoother(t, W(36, "حفره‌ها") - 0.2, W(36, "یکی") + 0.4);
    const tear = smoother(t, W(36, "نازک") - 0.1, W(36, "یکی"));
    st.web = { fade: 1, gain: 6.5, hgain: 2.4, slab: { n: nrm, w: mid[0] * nrm[0] + mid[1] * nrm[1] + mid[2] * nrm[2], t: 72 }, inf: { k: 0.42 * inf, tear }, cls: [0.15, 0.75, 1.0, 1.2] };
    ov.grid = { k: window01(t, S(35), S(36) + 0.4, 0.6, 0.6), stretch: smooth(t, W(35, "انبساطِ") - 0.4, E(35)) };
    ov.labels.push({ at: a.c, text: "انرژی تاریک", k: window01(t, W(35, "حفره‌ها") - 0.3, S(36) + 0.3, 0.4, 0.4), dy: 0, box: true, size: 26, teal: true });
    ov.labels.push({ at: add(mid, mul(ax, -(a.r + 30))), text: "گرانش", k: window01(t, W(35, "گرانش") - 0.3, S(36) + 0.3, 0.4, 0.4), box: true, size: 26 });
    const mk = window01(t, S(36) - 0.2, S(37) - 0.2, 0.6, 0.4);
    const merged = smooth(t, W(36, "یکی") - 0.3, W(36, "یکی") + 0.6);
    ov.rings.push({ c: a.c, r: a.r * (0.82 + 0.3 * inf), k: mk * (1 - merged) });
    ov.rings.push({ c: b.c, r: b.r * (0.82 + 0.3 * inf), k: mk * (1 - merged) });
    ov.rings.push({ c: mid, r: (span / 2) * (0.88 + 0.1 * inf), k: mk * merged, teal: true });
    st.post.black = Math.max(1 - smooth(t, S(35) - 0.3, S(35) + 0.4), smooth(t, S(37) - 0.6, S(37) - 0.3));
    return st;
  }
  if (t < S(38) - 0.3) {
    // light crossing a supervoid, then the CMB map with the cold spot
    const cmb = smooth(t, W(37, "بعضی"), W(37, "بعضی") + 0.6);
    const c = BOO.c, u = (t - S(37)) / (S(38) - S(37));
    const sw = W(37, "بعضی");
    st.view = t < sw ? { pos: add(c, [Math.sin(2.2 + 0.2 * u) * 560, 90, Math.cos(2.2 + 0.2 * u) * 560]), look: c, fov: 46 } : { pos: [0, 0, 62], look: [0, 0, 0], fov: 46 };
    st.web = { fade: 1 - smooth(t, sw - 0.5, sw), gain: 2.6, hgain: 0.85, win: BOO.r * 0.62, aper: 3 };
    ov.photon = { k: window01(t, S(37), W(37, "بعضی") + 0.2, 0.5, 0.6), prog: smoother(t, W(37, "نوری") - 0.5, W(37, "می‌ذاره") + 0.4) };
    ov.rings.push({ c: BOO.c, r: BOO.r * 0.95, k: window01(t, W(37, "ابرحفره‌ی") - 0.4, W(37, "بعضی") - 0.1, 0.8, 0.4) });
    ov.labels.push({ xy: [960, 130], at: [0, 0, 0], text: "ابرحفره", k: window01(t, W(37, "ابرحفره‌ی") - 0.3, W(37, "بعضی"), 0.4, 0.5), box: true, size: 28 });
    st.cmb = { fade: cmb, spot: smooth(t, W(37, "لکه‌ی") - 0.2, W(37, "لکه‌ی") + 0.8), zoom: 1 + 0.35 * smooth(t, W(37, "لکه‌ی"), E(37) + 0.5) };
    ov.labels.push({ xy: [960, 110], at: [0, 0, 0], text: "نقشه‌ی قدیمی‌ترین نورِ جهان", k: window01(t, W(37, "بعضی"), S(38) - 0.3, 0.5, 0.4), box: true, size: 28 });
    st.post.black = Math.max(1 - smooth(t, S(37) - 0.3, S(37) + 0.4), smooth(t, S(38) - 0.6, S(38) - 0.3));
    return st;
  }
  // the future, from the Local Group
  const view = camAt(t, [
    { t: S(38) - 0.3, D: 90, f: LGF, az: 0.6, el: 0.42, fov: 46 },
    { t: W(38, "همه‌ی"), D: 70, f: LGF, az: 0.75, el: 0.45, fov: 46 },
    { t: S(39), D: 14, f: LGF, az: 0.9, el: 0.5, fov: 46 },
    { t: W(39, "دورتادورش") + 0.4, D: 1.2, f: LGF, az: 1.05, el: 0.42, fov: 46 },
    { t: E(40) + 1.0, D: 0.9, f: LGF, az: 1.15, el: 0.4, fov: 46 },
  ]);
  st.view = view;
  const rec = smoother(t, W(38, "انبساط") - 0.2, E(38) + 0.6);
  st.web = { fade: 1, gain: 2.6, hgain: 0.85, win: 120, aper: 3, recede: rec };
  const mergeK = smooth(t, W(39, "یه") - 0.3, W(39, "شدن") + 0.4);
  st.lg = { mw: 1 - mergeK, others: 1 - mergeK, halo: 0.5 * (1 - mergeK), merged: mergeK, spin: t };
  ov.counter = { text: "۱۰۰ میلیارد سال بعد", k: window01(t, W(38, "صد") - 0.3, S(39) + 0.5, 0.5, 0.6) };
  ov.labels.push({ at: LGF, text: "میلکومدا", k: window01(t, W(39, "بزرگ") - 0.2, S(40) - 0.2, 0.5, 0.5), dy: -120, box: true });
  ov.close = { k: smoother(t, W(39, "دورتادورش"), E(40) + 0.4) };
  st.post.black = Math.max(1 - smooth(t, S(38) - 0.3, S(38) + 0.4), smooth(t, E(40) + 0.6, S(41) - 0.3));
  return st;
}

function s9(t: number): State {
  const st = nightSky(t, S(41), TOTAL);
  st.post.black = Math.max(1 - smooth(t, S(41) - 0.3, S(41) + 1.2), smooth(t, E(42) + 0.6, TOTAL - 0.8));
  return st;
}

export function direct(t: number): State {
  if (t < S(3)) return s1(t);
  if (t < S(6) - 0.05) return s2s3(t);
  if (t < S(16) + 0.1) return s4(t);
  if (t < S(23) + 0.2) return s5(t);
  if (t < S(30) - 0.05) return s6(t);
  if (t < S(34) - 0.2) return s7(t);
  if (t < S(41) - 0.3) return s8(t);
  return s9(t);
}
export { smooth, ramp, window01 };
