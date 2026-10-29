// Atomic Age demo (the reference film, video 21) «باغ اتمی» — the shots. Each is a pure function of absolute time; every beat lands on a word of the
// narration (Wd(line, word)) and every shot starts where cues.SH says. Colour-field shots are drawn props (lib/art);
// six shots are GPT Image illustrations (public/styles/atomic-age/img) with live overlays measured on them
// (hr(): half-size grid → frame).
import { Ctx, H, W } from "../lib/canvas";
import { clamp, ease, hash, k, lerp, mixHex, rgba, rng, TAU } from "../lib/math";
import { img } from "../lib/img";
import { bigNum, burstPath, fa, faText, field, P, pop, printed, sparklePath, squash, tag } from "../lib/retro";
import { barley, beads, capsule, envelope, gardenPlate, grapefruit, magnifier, MAP_PTS, plant, pole, rays, seedIcon, seedPacket, usMap, zap } from "../lib/art";
import { SH, TOTAL, Wd } from "./cues";

const IMK = 1920 / 1672;
/** a point measured on the half-size grid of a 941×1672 illustration → frame coordinates */
const hr = (x: number, y: number): [number, number] => [x * 2 * IMK - 0.3, y * 2 * IMK];
function zoomAt(c: Ctx, z: number, cx: number, cy: number, dx = 0, dy = 0) {
  c.translate(cx + dx, cy + dy);
  c.scale(z, z);
  c.translate(-cx, -cy);
}
/** slow push (and drift) over [t0, t1] */
function kb(c: Ctx, t: number, t0: number, t1: number, z0: number, z1: number, cx: number, cy: number, dx = 0, dy = 0) {
  const u = ease.inOutSine(clamp((t - t0) / (t1 - t0)));
  zoomAt(c, lerp(z0, z1, u), cx, cy, dx * u, dy * u);
}
function picture(c: Ctx, name: string, fallback: string) {
  const im = img(name);
  if (im) c.drawImage(im, (W - 941 * IMK) / 2, 0, 941 * IMK, H);
  else field(c, fallback);
}
/** the hand-made shake of a stamp landing */
const thump = (t: number, t0: number, amp = 10) => (t > t0 && t < t0 + 0.35 ? Math.sin((t - t0) * 70) * amp * Math.exp(-(t - t0) / 0.08) : 0);
/** twinkling four-point sparkles around a point */
function twinkles(c: Ctx, x: number, y: number, t: number, spots: [number, number, number][], col = P.card) {
  const tw = 0.5 + 0.5 * Math.sin(t * 9);
  c.save();
  c.fillStyle = col;
  spots.forEach(([dx, dy, s], i) => {
    const w = 0.5 + 0.5 * Math.sin(t * 9 + i * 2.1);
    c.globalAlpha = 0.45 + 0.55 * w;
    c.fill(sparklePath(x + dx, y + dy, 22 * s * (0.75 + 0.35 * w)));
  });
  c.restore();
  void tw;
}

// ---------------- 1 · «سالِ ۱۹۴۹، دانشمندها دورِ یه میله‌ی رادیواکتیو، کاملاً عمداً یه زمین کشاورزی درست کردن.» ----------------
type GardenOpt = { g: number; rad: number; num: number; bang: number; z: number };
function garden(c: Ctx, t: number, o: GardenOpt) {
  c.save();
  zoomAt(c, o.z, 540, 760);
  c.translate(thump(t, Wd(1, "عمداً") + 0.02, 7), 0);
  gardenPlate(c, 540, 730, 450, 225, t, o.g);
  rays(c, 540, 730, t, o.rad * 0.9, { r0: 60, r1: 470, sy: 0.5, n: 3, speed: 0.55 });
  pole(c, 540, 730, 380, t, { lift: 1, glow: o.rad * (0.7 + 0.3 * Math.sin(t * 7)), star: 1.25, s: 1.25 });
  // «کاملاً عمداً»: a coral «!» badge stamped beside the capsule
  if (o.bang > 0) {
    const [sx, sy] = squash(t, Wd(1, "عمداً"), 0.22, 0.45);
    c.save();
    c.translate(770, 380);
    c.rotate(0.16);
    c.scale(o.bang * sx, o.bang * sy);
    printed(c, burstPath(0, 0, 112, 11, 0.7, 0.2), P.coral, t, { line: 3.4, plate: "#8e2a24", seed: 3 });
    faText(c, "!", 0, 6, { size: 150, weight: 900, color: P.card, plate: P.ink, t });
    c.restore();
  }
  // the «۱۹۴۹» sticker
  if (o.num > 0) {
    c.save();
    c.translate(540, 975);
    c.scale(o.num, o.num);
    c.rotate(-0.03);
    printed(c, burstPath(0, 0, 175, 16, 0.78, 0.12 + t * 0.05), P.must, t, { line: 3.4, seed: 6 });
    bigNum(c, fa("1949"), 0, 14, 205, t);
    c.restore();
  }
  c.restore();
}
export function sOpen(c: Ctx, t: number) {
  field(c, P.teal);
  garden(c, t, {
    g: k(t, Wd(1, "دانشمندها") - 0.1, Wd(1, "کشاورزی") + 0.5, ease.inOut),
    rad: k(t, Wd(1, "رادیواکتیو") - 0.15, Wd(1, "رادیواکتیو") + 0.35),
    num: pop(t, Wd(1, "هزار") - 0.12, 0.45),
    bang: pop(t, Wd(1, "عمداً") - 0.04, 0.3),
    z: 1 + 0.035 * k(t, 0, SH.zap + 0.2, ease.inOutSine),
  });
}
/** the last shot: back to the garden, the sprouts sink away, ending exactly on the first frame (the film loops) */
export function sLoop(c: Ctx, t: number) {
  field(c, P.teal);
  const t0 = SH.loop;
  garden(c, t, {
    g: 1 - k(t, t0 + 0.05, TOTAL - 0.3, ease.inOut),
    rad: 1 - k(t, t0, TOTAL - 0.25),
    num: 0,
    bang: 0,
    z: lerp(1.035, 1, k(t, t0, TOTAL - 0.05, ease.inOutSine)),
  });
}

// ---------------- 2 · «هدفشون چی بوده؟ که ژنِ گیاه‌ها رو تغییر بدن.» ----------------
const SHUF = [3, 0, 4, 1, 2];
export function sZap(c: Ctx, t: number) {
  field(c, P.must);
  const t0 = SH.zap;
  const fire = Wd(2, "ژنِ") - 0.12, hit = fire + 0.32, mix = Wd(2, "تغییر") - 0.05;
  const slide = k(t, t0 + 0.05, t0 + 0.5, ease.outBack);
  const shake = t > hit ? Math.exp(-(t - hit) / 0.4) * Math.sin((t - hit) * 46) * 0.16 : 0;
  plant(c, lerp(-320, 330, slide), 1075, 2.05, { grow: 1, t, sway: shake, seed: 3, mutate: 0.45 * k(t, mix, mix + 0.5) });
  // «چی بوده؟»: a question badge, until the gun takes its place
  const q = pop(t, Wd(2, "چی") - 0.05, 0.35) * (1 - k(t, Wd(2, "که") - 0.25, Wd(2, "که") - 0.05));
  if (q > 0.01) {
    c.save();
    c.translate(780, 420);
    c.rotate(-0.12 + Math.sin(t * 3) * 0.04);
    c.scale(q, q);
    printed(c, burstPath(0, 0, 120, 12, 0.72, 0.1), P.teal, t, { line: 3.4, plate: P.dteal, seed: 12 });
    faText(c, "؟", 0, 8, { size: 170, weight: 900, color: P.card, plate: P.ink, t });
    c.restore();
  }
  // the gamma gun: the capsule in a cream sparkle, aimed down-left at the plant
  const gun = pop(t, Wd(2, "که") - 0.1, 0.32);
  if (gun > 0) {
    const kick = t > hit - 0.3 && t < hit + 0.1 ? Math.sin(((t - hit + 0.3) / 0.4) * Math.PI) * 14 : 0;
    c.save();
    c.translate(810 + kick * 0.6, 360 - kick * 0.4);
    c.scale(gun, gun);
    printed(c, sparklePath(0, 0, 165, 0.33, Math.sin(t * 2) * 0.06), P.card, t, { line: 3.2, seed: 9 });
    capsule(c, 0, 0, 1.75, t, k(t, fire - 0.2, hit) * (1 - k(t, hit + 0.2, hit + 0.8)), -2.35);
    c.restore();
    tag(c, "پرتوی گاما", 810, 575, gun, t, { rot: -0.04 });
  }
  zap(c, 730, 440, 470, 680, t, k(t, fire, hit + 0.25, (x: number) => x));
  // genes, under the loupe; they jiggle, then reshuffle on «تغییر»
  const mg = pop(t, Wd(2, "گیاه‌ها") - 0.08, 0.4);
  if (mg > 0) {
    c.save();
    c.translate(780, 905);
    c.scale(mg, mg);
    magnifier(c, 0, 0, 175, t, (cc) => {
      const shuffled = t > mix + 0.18;
      beads(cc, 0, 0, 5, t, { order: shuffled ? SHUF : [0, 1, 2, 3, 4], jiggle: k(t, mix - 0.2, mix) * (1 - k(t, mix + 0.18, mix + 0.6)) * 3, s: 1.3 });
    });
    c.restore();
    tag(c, "ژن‌ها", 900, 735, pop(t, Wd(2, "گیاه‌ها") + 0.1, 0.3), t, { rot: 0.05 });
  }
}

// ---------------- 3 · «توی یه آزمایشگاه در نیویورک، کبالت-۶۰ از راه دور بالا میومد.» ----------------
const F_POLE = { x: hr(230, 0)[0], base: hr(0, 425)[1], top: hr(0, 165)[1] };
export function sField(c: Ctx, t: number) {
  c.save();
  kb(c, t, SH.field, SH.control, 1.02, 1.1, F_POLE.x, 640);
  picture(c, "field", P.aqua);
  const glow = k(t, Wd(3, "کبالتِ") - 0.1, Wd(3, "کبالتِ") + 0.3) * (0.6 + 0.4 * Math.sin(t * 8));
  capsule(c, F_POLE.x, F_POLE.base - 34, 0.72, t, glow);
  c.restore();
  tag(c, "بروکهیون، نیویورک", 360, 1060, pop(t, Wd(3, "نیویورک") - 0.08, 0.32), t, { rot: -0.03 });
  const cb = pop(t, Wd(3, "کبالتِ") - 0.05, 0.32);
  if (cb > 0) {
    // a pointer from the label to the capsule
    const [lx, ly] = [790, 820];
    c.save();
    c.strokeStyle = P.ink;
    c.lineWidth = 3;
    c.setLineDash([8, 7]);
    c.globalAlpha *= clamp(cb);
    c.beginPath();
    c.moveTo(lx - 60, ly);
    c.lineTo(F_POLE.x + 50, F_POLE.base - 60);
    c.stroke();
    c.restore();
    tag(c, fa("کبالت-60"), lx, ly, cb, t, { size: 42, rot: 0.03, fill: P.coral, color: P.card });
  }
}
const C_WIN = { x0: hr(140, 0)[0], y0: hr(0, 40)[1], x1: W, y1: hr(0, 330)[1] };
const C_POLE = { x: hr(320, 0)[0], base: hr(0, 268)[1], top: hr(0, 95)[1] };
export function sControl(c: Ctx, t: number) {
  const t0 = SH.control;
  c.save();
  kb(c, t, t0, SH.rows, 1.0, 1.07, 700, 640);
  picture(c, "control", P.teal);
  // through the window: the capsule rides up the far pole, glowing, and radiates
  const lift = k(t, Wd(3, "بالا") - 0.3, Wd(3, "میومد") + 0.35, ease.inOut);
  c.save();
  c.beginPath();
  c.rect(C_WIN.x0, C_WIN.y0, C_WIN.x1 - C_WIN.x0, C_WIN.y1 - C_WIN.y0);
  c.clip();
  const cy = lerp(C_POLE.base - 14, C_POLE.top + 10, lift);
  rays(c, C_POLE.x, cy, t, lift * 0.8, { r0: 20, r1: 260, n: 3, speed: 0.8 });
  capsule(c, C_POLE.x, cy, 0.34, t, lift);
  c.restore();
  // console: the warning lamps above the dials blink while it rises
  [hr(247, 385), hr(285, 385), hr(327, 385)].forEach(([x, y], i) => {
    const on = lift > 0.05 && Math.floor(t * 6 + i * 1.7) % 3 !== 0;
    if (!on) return;
    c.fillStyle = "#ff7a4f";
    c.beginPath();
    c.arc(x, y - 52, 6, 0, TAU);
    c.fill();
    const g = c.createRadialGradient(x, y - 52, 1, x, y - 52, 26);
    g.addColorStop(0, rgba("#ffb07a", 0.7));
    g.addColorStop(1, rgba("#ffb07a", 0));
    c.fillStyle = g;
    c.fillRect(x - 26, y - 78, 52, 52);
  });
  c.restore();
  tag(c, "کنترل از راه دور", 330, 1070, pop(t, Wd(3, "راه") - 0.1, 0.3), t, { rot: -0.03 });
}

// ---------------- 4 · «نزدیکِ اون میله، گیاه‌ها می‌مُردن، ولی اونایی که دورتر بودن، داشتن تغییر می‌کردن.» ----------------
export function sRows(c: Ctx, t: number) {
  const t0 = SH.rows, GY = 1010;
  c.fillStyle = P.aqua;
  c.fillRect(0, 0, W, H);
  c.fillStyle = P.must;
  c.beginPath();
  c.moveTo(0, GY);
  for (let x = 0; x <= W; x += 30) c.lineTo(x, GY - 14 * Math.sin(x / 260 + 0.6));
  c.lineTo(W, H);
  c.lineTo(0, H);
  c.closePath();
  c.fill();
  const pan = 70 * k(t, Wd(4, "اونایی") - 0.2, Wd(4, "دورتر") + 0.5, ease.inOut);
  c.save();
  c.translate(-pan, 0);
  rays(c, 150, GY - 640, t, 1, { r0: 60, r1: 1000, arc: [-0.75, 0.95], n: 4, speed: 0.45 });
  pole(c, 150, GY, 640, t, { lift: 1, glow: 0.75 + 0.25 * Math.sin(t * 7), star: 1 });
  const td = Wd(4, "می‌مُردن"), tc = Wd(4, "تغییر");
  [350, 530, 710, 890, 1070].forEach((x, i) => {
    const grow = k(t, t0 + 0.05 + i * 0.07, t0 + 0.55 + i * 0.07, ease.out);
    const wilt = i < 2 ? k(t, td - 0.25 + i * 0.12, td + 0.55 + i * 0.12, ease.inOut) : 0;
    const mut = i === 2 || i === 3 ? k(t, tc - 0.2 + (i - 2) * 0.15, tc + 0.5 + (i - 2) * 0.15, ease.inOut) : 0;
    plant(c, x, GY - 14 * Math.sin(x / 260 + 0.6), 1.02, { grow, wilt, mutate: mut, t, seed: i + 1 });
  });
  tag(c, "می‌مُردن", 440, 620, pop(t, td - 0.05, 0.32), t, { size: 46, fill: P.coral, color: P.card, rot: -0.05 });
  tag(c, "تغییر می‌کردن", 800, 620, pop(t, tc - 0.05, 0.32), t, { size: 46, rot: 0.04 });
  c.restore();
}

// ---------------- 5 · «خانواده‌ها هم برای باغچه‌شون بذرِ اتمی خریدن.» ----------------
export function sGardener(c: Ctx, t: number) {
  c.save();
  kb(c, t, SH.gardener, SH.packet, 1.03, 1.12, 640, 420, -20, 10);
  picture(c, "gardener", P.cream);
  const [px, py] = hr(318, 165);
  twinkles(c, px, py, t, [[-70, -50, 1], [60, -70, 0.7], [80, 30, 0.8]]);
  c.restore();
}
export function sPacket(c: Ctx, t: number) {
  field(c, P.coral);
  const t0 = SH.packet;
  const sun = new Path2D();
  sun.arc(540, 740, 340 * pop(t, t0, 0.35), 0, TAU);
  printed(c, sun, P.must, t, { line: 0, noPlate: true });
  // seeds spill out of the torn top on «اتمی», with gravity
  const ts = Wd(5, "اتمی") - 0.05;
  const r = rng(5);
  for (let i = 0; i < 30; i++) {
    const t1 = ts + r() * 0.5, vx = (r() - 0.5) * 520, vy = -360 - r() * 380, col = r() < 0.5 ? P.ink : P.brown, u = t - t1;
    if (u < 0) continue;
    seedIcon(c, 540 + vx * u, 520 + vy * u + 900 * u * u, 0.9, col);
  }
  const s = pop(t, t0, 0.42);
  const [sx] = squash(t, t0 + 0.3, 0.12, 0.5);
  seedPacket(c, 540, 760, 1.12 * s * sx, t, Math.sin(t * 2.6) * 0.04 + (1 - Math.min(1, s)) * 0.5, "بذرِ اتمی");
  twinkles(c, 540, 760, t, [[-240, -230, 1.2], [230, -170, 0.9], [-200, 230, 0.8], [250, 250, 1.1]]);
}

// ---------------- 6 · «ولی محصول‌های معروف اونجا، دیگه مثلِ قبل خوب نبودن.» ----------------
export function sFoods(c: Ctx, t: number) {
  field(c, P.teal);
  const tf = Wd(6, "محصول‌های") - 0.1, tl = Wd(6, "اونجا") - 0.1, tdull = Wd(6, "دیگه"), tx = Wd(6, "خوب") - 0.05;
  gardenPlate(c, 540, 900, 390, 195, t, 1);
  pole(c, 540, 900, 290, t, { lift: 1, glow: 0.5, star: 0.85 });
  // the famous foods float in, then settle onto the rings «اونجا»…
  const land = k(t, tl, tl + 0.55, ease.inOut);
  const g1 = pop(t, tf, 0.4), g2 = pop(t, tf + 0.15, 0.4);
  const bob = (i: number) => Math.sin(t * 2.2 + i) * 8 * (1 - land);
  // …and lose their colour and sag «دیگه مثلِ قبل خوب نبودن»
  const dull = k(t, tdull - 0.1, tdull + 0.7, ease.inOut);
  if (g1 > 0) {
    c.save();
    c.translate(lerp(330, 400, land), lerp(470, 820, land) + bob(0));
    c.scale(g1 * (1 - 0.12 * dull), g1 * (1 - 0.2 * dull));
    grapefruit(c, 0, 0, 125, t, 0.45, -0.2);
    if (dull > 0) {
      c.fillStyle = rgba("#6b5a3c", 0.55 * dull);
      c.beginPath();
      c.arc(0, 0, 125, 0, TAU);
      c.fill();
    }
    c.restore();
  }
  if (g2 > 0) {
    c.save();
    c.translate(lerp(770, 690, land), lerp(640, 930, land) + bob(1));
    c.rotate(0.55 * dull);
    c.scale(g2, g2);
    barley(c, 0, 0, 0.95, t, 1 - 0.25 * dull);
    if (dull > 0) {
      c.globalCompositeOperation = "source-atop";
      c.fillStyle = rgba("#7a6a4a", 0.5 * dull);
      c.fillRect(-60, -320, 120, 330);
    }
    c.restore();
  }
  // the big coral X
  const x1 = k(t, tx, tx + 0.18), x2 = k(t, tx + 0.12, tx + 0.3);
  c.save();
  c.translate(thump(t, tx + 0.05, 6), 0);
  c.lineCap = "round";
  for (const [p, a, b] of [[x1, [250, 700], [830, 1080]], [x2, [830, 700], [250, 1080]]] as const) {
    if (p <= 0) continue;
    const ex = lerp(a[0], b[0], p), ey = lerp(a[1], b[1], p);
    c.strokeStyle = "#8e2a24";
    c.lineWidth = 46;
    c.beginPath();
    c.moveTo(a[0] + 5, a[1] + 5);
    c.lineTo(ex + 5, ey + 5);
    c.stroke();
    c.strokeStyle = P.coral;
    c.lineWidth = 40;
    c.beginPath();
    c.moveTo(a[0], a[1]);
    c.lineTo(ex, ey);
    c.stroke();
  }
  c.restore();
}

// ---------------- 7 · «تگزاسی‌ها بذر و قلمه‌ی گریپ‌فروت فرستادن، تا از اونجا پرتو جذب کنن.» ----------------
export function sTexas(c: Ctx, t: number) {
  c.save();
  kb(c, t, SH.texas, SH.post, 1.03, 1.12, 470, 420, 0, 20);
  picture(c, "texas", P.must);
  const [ex, ey] = hr(185, 295);
  twinkles(c, ex - 40, ey - 50, t, [[0, 0, 1.1], [70, 40, 0.7]]);
  c.restore();
  tag(c, "تگزاس", 260, 1070, pop(t, Wd(7, "تگزاسی‌ها") - 0.05, 0.3), t, { size: 46, rot: -0.04, fill: P.must });
}
export function sPost(c: Ctx, t: number) {
  const t0 = SH.post;
  c.save();
  kb(c, t, t0, SH.map, 1.04, 1.1, 600, 760);
  picture(c, "post", P.teal);
  // an envelope sails in and lands on the parcel
  const tp = t0 + 0.3;
  const u = k(t, t0, tp, ease.out);
  if (u > 0) {
    const [ex, ey] = hr(265, 205);
    const x = lerp(-120, ex, u), y = lerp(260, ey, u) - Math.sin(u * Math.PI) * 120;
    const [sx, sy] = squash(t, tp, 0.2, 0.4);
    c.save();
    c.translate(x, y);
    c.scale(1.3 * sx, 1.3 * sy);
    envelope(c, 0, 0, 1, t, (1 - u) * -0.8 + 0.06);
    c.restore();
  }
  // the postmark thumps
  const pm = pop(t, tp + 0.15, 0.22);
  if (pm > 0) {
    const [x, y] = hr(370, 300);
    c.save();
    c.translate(x, y);
    c.rotate(-0.2);
    c.scale(1.35 - 0.35 * pm, 1.35 - 0.35 * pm);
    c.globalAlpha = Math.min(1, pm) * 0.9;
    c.strokeStyle = P.coral;
    c.lineWidth = 7;
    c.beginPath();
    c.arc(0, 0, 70, 0, TAU);
    c.stroke();
    c.lineWidth = 3;
    c.beginPath();
    c.arc(0, 0, 56, 0, TAU);
    c.stroke();
    faText(c, "پست", 0, 2, { size: 44, weight: 900, color: P.coral });
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      for (let x2 = 0; x2 <= 120; x2 += 8) c.lineTo(80 + x2, -24 + i * 16 + Math.sin(x2 / 12) * 5);
      c.stroke();
    }
    c.restore();
  }
  c.restore();
}
const MAP = { x: 70, y: 470, w: 940, h: 506 };
const mp = (p: [number, number]): [number, number] => [MAP.x + p[0] * MAP.w, MAP.y + p[1] * MAP.h];
export function sMap(c: Ctx, t: number) {
  field(c, P.teal);
  const t0 = SH.map, tz = Wd(7, "پرتو") - 0.05;
  const m = pop(t, t0, 0.35);
  c.save();
  c.translate(540, 710);
  c.scale(m, m);
  c.translate(-540, -710);
  usMap(c, MAP.x, MAP.y, MAP.w, MAP.h, t, 1, k(t, t0 + 0.05, t0 + 0.4));
  const TX = mp(MAP_PTS.texas), NY = mp(MAP_PTS.ny);
  const ctrl: [number, number] = [640, 300];
  const at = (u: number): [number, number] => [lerp(lerp(TX[0], ctrl[0], u), lerp(ctrl[0], NY[0], u), u), lerp(lerp(TX[1], ctrl[1], u), lerp(ctrl[1], NY[1], u), u)];
  // the dotted route draws itself
  const route = k(t, t0 + 0.05, t0 + 0.4);
  c.fillStyle = P.coral;
  for (let i = 0; i <= 40 * route; i++) {
    const [x, y] = at(i / 40);
    c.beginPath();
    c.arc(x, y, 4.5, 0, TAU);
    c.fill();
  }
  // Texas: a little grapefruit tree; New York: the lab's pole
  c.save();
  c.translate(TX[0], TX[1]);
  const tree = new Path2D();
  tree.arc(0, -46, 34, 0, TAU);
  printed(c, tree, P.olive, t, { line: 2.4, plate: P.dteal, seed: 71 });
  c.fillStyle = "#e9a23a";
  for (const [dx, dy] of [[-14, -52], [12, -38], [4, -62]] as const) {
    c.beginPath();
    c.arc(dx, dy, 8, 0, TAU);
    c.fill();
  }
  c.strokeStyle = P.ink;
  c.lineWidth = 5;
  c.beginPath();
  c.moveTo(0, -14);
  c.lineTo(0, 6);
  c.stroke();
  c.restore();
  pole(c, NY[0], NY[1] + 8, 100, t, { lift: 1, glow: 0.4 + 0.6 * k(t, tz - 0.1, tz + 0.2), s: 0.45 });
  // envelopes along the route: seeds (1959) then cuttings (1963), both arriving before the zap
  const legs: [number, number, string][] = [[t0 + 0.1, tz - 0.12, fa("1959") + " · بذر"], [t0 + 0.3, tz + 0.02, fa("1963") + " · قلمه"]];
  legs.forEach(([a, b, label], i) => {
    if (t < a) return;
    const u = clamp((t - a) / (b - a));
    if (u < 1) {
      const [x, y] = at(ease.inOut(u));
      const [x2, y2] = at(ease.inOut(Math.min(1, u + 0.02)));
      envelope(c, x, y, 0.62, t, Math.atan2(y2 - y, x2 - x) * 0.35);
    }
    tag(c, label, 330 + i * 30, 1030 + i * 70, pop(t, a, 0.3), t, { size: 36, fill: i ? P.must : P.card });
  });
  tag(c, "نیویورک", NY[0] - 70, NY[1] + 85, pop(t, t0 + 0.15, 0.3), t, { size: 34 });
  tag(c, "تگزاس", TX[0] - 120, TX[1] - 70, pop(t, t0 + 0.1, 0.3), t, { size: 34, fill: P.must });
  c.restore();
  // zap at New York on «پرتو»
  if (t > tz) {
    const s = pop(t, tz, 0.3);
    c.save();
    c.translate(NY[0] - 60, NY[1] - 120);
    c.scale(s, s);
    printed(c, burstPath(0, 0, 105, 12, 0.66, t * 0.3), P.coral, t, { line: 3.2, plate: "#8e2a24", seed: 77 });
    faText(c, "جِزّ!", 0, 4, { size: 54, weight: 900, color: P.card, plate: P.ink, t });
    c.restore();
  }
}

// ---------------- 8 · «نتیجه‌ش شد تولیدِ «استار روبی» و «ریو رد».» ----------------
/** the result on a breakfast table: a push into the grapefruit, which glints */
export function sResult(c: Ctx, t: number) {
  c.save();
  kb(c, t, SH.result, SH.fruit + 0.4, 1.04, 1.16, 528, 760);
  picture(c, "breakfast", P.teal);
  // steam over the coffee
  const [cx, cy] = hr(75, 465);
  c.strokeStyle = rgba("#ffffff", 0.55);
  c.lineWidth = 6;
  c.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    const ph = t * 1.6 + i * 2.1;
    c.globalAlpha = 0.35 + 0.25 * Math.sin(ph);
    c.beginPath();
    for (let s = 0; s <= 12; s++) {
      const u = s / 12;
      const x = cx - 30 + i * 30 + Math.sin(u * 5 + ph) * 12, y = cy - u * 170 - ((t * 30) % 30);
      if (s === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.stroke();
  }
  c.globalAlpha = 1;
  const [gx, gy] = hr(230, 330);
  twinkles(c, gx, gy, t, [[-150, -90, 1.3], [160, -110, 1], [190, 60, 0.8], [-170, 80, 0.9]]);
  c.restore();
}
export function sFruit(c: Ctx, t: number) {
  field(c, P.teal);
  const t0 = SH.fruit, tr = Wd(8, "روبی»"), t2 = Wd(8, "«ریو") - 0.1;
  const s1 = pop(t, t0, 0.45);
  if (s1 > 0) {
    c.save();
    c.translate(700, 520);
    c.scale(s1, s1);
    printed(c, sparklePath(0, 0, 250, 0.3, t * 0.15), P.card, t, { line: 3, seed: 81 });
    c.restore();
  }
  // the first half rolls in from the right and blushes
  const roll = k(t, t0 + 0.02, t0 + 0.45, ease.out);
  if (roll > 0) grapefruit(c, lerp(1300, 700, roll), 520, 165, t, lerp(0.12, 0.6, k(t, tr - 0.1, tr + 0.4)), (1 - roll) * -4);
  tag(c, "استار روبی · " + fa("1970"), 700, 750, pop(t, Wd(8, "«استار") + 0.05, 0.32), t, { rot: -0.03 });
  const s2 = pop(t, t2, 0.4);
  if (s2 > 0) {
    c.save();
    c.translate(360, 860);
    c.scale(s2, s2);
    printed(c, sparklePath(0, 0, 210, 0.3, -t * 0.15), P.must, t, { line: 3, seed: 82 });
    grapefruit(c, 0, 0, 148, t, 1, 0.3);
    c.restore();
    tag(c, "ریو رد · " + fa("1984"), 360, 1060, pop(t, t2 + 0.1, 0.32), t, { rot: 0.03, fill: P.coral, color: P.card });
  }
}

// ---------------- 9 · «سازمان ملل بیش از ۳۴۰۰ گونه‌ی جهش‌یافته ثبت کرده، مثلِ جوِ «گلدن پرامیس»؛ که بیشترشون با پرتو درست شدن.» ----------------
const RAD = (() => {
  // 24 of the 34 seeds were made with radiation (≈ 70 %)
  const r = rng(91), idx = Array.from({ length: 34 }, (_, i) => i).sort(() => r() - 0.5);
  return new Set(idx.slice(0, 24));
})();
const GOLD = 23;
export function sUN(c: Ctx, t: number) {
  field(c, P.cream);
  tag(c, "پایگاه داده‌ی سازمان ملل", 540, 205, pop(t, Wd(9, "سازمان") - 0.05, 0.32), t);
  const tn0 = Wd(9, "سه") - 0.1, tn1 = Wd(9, "چهارصد") + 0.35;
  const num = Math.round((3400 * k(t, tn0, tn1, ease.out)) / 10) * 10;
  const ns = pop(t, tn0 - 0.1, 0.4);
  if (ns > 0) {
    c.save();
    c.translate(540, 450);
    c.scale(ns, ns);
    printed(c, sparklePath(0, 0, 190, 0.34, t * 0.1), P.teal, t, { line: 3, plate: P.dteal, seed: 92 });
    bigNum(c, fa(num) + "+", 0, 10, 170, t);
    c.restore();
  }
  // isotype grid: one seed = 100 varieties
  const g0 = Wd(9, "گونه‌ی") - 0.1, g1 = Wd(9, "کرده") + 0.15;
  const fr = Wd(9, "بیشترشون") - 0.05, fr1 = Wd(9, "درست") + 0.3;
  const gold = Wd(9, "«گلدن") - 0.05;
  for (let i = 0; i < 34; i++) {
    const col = i % 7, row = Math.floor(i / 7);
    const x = 205 + col * 95, y = 672 + row * 88;
    const s = pop(t, lerp(g0, g1, i / 33), 0.25);
    if (s <= 0) continue;
    const flip = RAD.has(i) ? k(t, lerp(fr, fr1 - 0.25, col / 6), lerp(fr, fr1 - 0.25, col / 6) + 0.25) : 0;
    let colr = flip > 0.5 ? P.must : P.ink;
    if (i === GOLD && t > gold) colr = P.coral;
    c.save();
    c.translate(x, y);
    c.scale(s * Math.abs(Math.cos(flip * Math.PI)) + 0.001, s);
    if (i === GOLD && t > gold) {
      const pg = pop(t, gold, 0.3);
      c.scale(1 + 0.25 * pg, 1 + 0.25 * pg);
    }
    seedIcon(c, 0, 0, 1.25, colr);
    c.restore();
  }
  // the barley and its tag
  const bg = k(t, gold - 0.05, gold + 0.6, ease.out);
  if (bg > 0) barley(c, 950, 1075, 0.82, t, bg);
  tag(c, "گلدن پرامیس · " + fa("1966"), 905, 745, pop(t, gold + 0.05, 0.32), t, { size: 30, fill: P.must, rot: 0.05 });
  // legend, then the radiation share
  const leg = pop(t, g1 + 0.1, 0.3) * (1 - k(t, fr - 0.1, fr));
  if (leg > 0) faText(c, "هر دانه = " + fa(100) + " گونه", 540, 1108, { size: 36, weight: 700, color: P.ink, alpha: leg });
  tag(c, "بیش از " + fa("70") + "٪ با پرتو", 540, 1105, pop(t, fr + 0.15, 0.32), t, { fill: P.must });
}

// ---------------- 10 · «پرتو کارِ همون جهشِ طبیعی رو می‌کرد، ولی سریع‌تر.» ----------------
function clock(c: Ctx, x: number, y: number, r: number, ang: number, t: number, fast: number) {
  const f = new Path2D();
  f.arc(x, y, r, 0, TAU);
  printed(c, f, P.card, t, { line: 3, seed: 101 + x });
  c.strokeStyle = P.ink;
  c.lineWidth = 2.4;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    c.beginPath();
    c.moveTo(x + Math.cos(a) * (r - 6), y + Math.sin(a) * (r - 6));
    c.lineTo(x + Math.cos(a) * (r - 14), y + Math.sin(a) * (r - 14));
    c.stroke();
  }
  if (fast > 0) {
    c.fillStyle = rgba(P.coral, 0.35 * fast);
    c.beginPath();
    c.moveTo(x, y);
    c.arc(x, y, r - 16, ang - 1.4 * fast, ang);
    c.closePath();
    c.fill();
  }
  c.lineWidth = 6;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(x, y);
  c.lineTo(x + Math.cos(ang) * (r - 20), y + Math.sin(ang) * (r - 20));
  c.stroke();
  c.fillStyle = P.ink;
  c.beginPath();
  c.arc(x, y, 7, 0, TAU);
  c.fill();
}
export function sCompare(c: Ctx, t: number) {
  field(c, P.must);
  const tR = Wd(10, "پرتو") - 0.08, tN = Wd(10, "جهشِ") - 0.08, tK = Wd(10, "می‌کرد"), tF = Wd(10, "ولی"), tS = Wd(10, "سریع‌تر");
  // right: radiation (said first) · left: natural mutation
  const r = pop(t, tR, 0.38), l = pop(t, tN, 0.38);
  if (r > 0) {
    c.save();
    c.translate(770, 540);
    c.scale(r * 1.15, r * 1.15);
    const d = new Path2D();
    d.arc(0, 0, 150, 0, TAU);
    printed(c, d, P.card, t, { line: 3, seed: 111 });
    printed(c, sparklePath(0, 0, 110, 0.32, t * 0.4), P.coral, t, { line: 2.4, seed: 112, noPlate: true });
    capsule(c, 0, 0, 1.0, t, 0.6, 0.4);
    c.restore();
    tag(c, "پرتو", 770, 330, r, t, { size: 44, fill: P.coral, color: P.card });
    beads(c, 770, 810, 5, t, { hot: t > tK ? 2 : undefined, hotCol: P.coral, s: 1.12, seed: 1 });
  }
  if (l > 0) {
    c.save();
    c.translate(310, 540);
    c.scale(l * 1.15, l * 1.15);
    const d = new Path2D();
    d.arc(0, 0, 150, 0, TAU);
    printed(c, d, P.teal, t, { line: 3, plate: P.dteal, seed: 113 });
    const drop = new Path2D();
    drop.moveTo(0, -84);
    drop.bezierCurveTo(54, -10, 62, 40, 0, 78);
    drop.bezierCurveTo(-62, 40, -54, -10, 0, -84);
    printed(c, drop, P.card, t, { line: 3, seed: 114 });
    c.restore();
    tag(c, "جهشِ طبیعی", 310, 330, l, t, { size: 44 });
    beads(c, 310, 810, 5, t, { hot: t > tK + 0.15 ? 2 : undefined, hotCol: P.teal, s: 1.12, seed: 1 });
  }
  const eq = pop(t, tK + 0.2, 0.3);
  if (eq > 0) faText(c, "=", 540, 800, { size: 120, weight: 900, color: P.ink, plate: P.coral, t, alpha: clamp(eq) });
  // clocks: nature's hand crawls, radiation's spins
  const cl = pop(t, tF - 0.2, 0.35);
  if (cl > 0) {
    const fast = k(t, tF, tF + 0.3);
    c.save();
    c.translate(310, 975);
    c.scale(cl * 1.15, cl * 1.15);
    clock(c, 0, 0, 78, -Math.PI / 2 + (t - tF) * 0.25, t, 0);
    c.restore();
    c.save();
    c.translate(770, 975);
    c.scale(cl * 1.15, cl * 1.15);
    clock(c, 0, 0, 78, -Math.PI / 2 + Math.max(0, t - tF) * 14 * fast, t, fast);
    c.restore();
  }
  tag(c, "سریع‌تر", 770, 1112, pop(t, tS - 0.05, 0.32), t, { size: 46, fill: P.coral, color: P.card, rot: -0.03 });
  void mixHex;
  void hash;
}
