// Hologram HUD kit (video 22, after the «GPS clocks» reference): a dark room, an amber projector disk at the bottom
// throwing a beam, amber holograms (the user's GPT Image renders on black, composited with «screen») that
// materialise out of converging sparks behind a rising scan line, float, breathe, turn a little, flicker and tear;
// HUD furniture — brackets, rings, a dial, charts, clock faces, a ruler, a toggle, an odometer — and impacts
// (shock rings, bursts, chevrons) for the key words.
// One colour family only (v2, the user rejected the blue): amber, white-hot for what matters, red for «slow / off /
// error». Every number is Latin digits in Chakra Petch (user's request); Persian labels in Vazir Code.
import { Ctx, H, layer, matchTransform, paint, scale, W } from "./canvas";
import { clamp, ease, hash, lerp, rgba, rng, TAU } from "./math";
import { img } from "./img";

export const P = {
  bg: "#0a0907",
  amber: "#ff9a3c",
  hi: "#ffc985",
  hot: "#fff0c8",
  key: "#ffb547",
  dim: "#8a5424",
  cream: "#f3e7d3",
  red: "#ff5a48",
};
export const FA = "FA"; // Morabba — captions
export const MONO = "VC"; // Vazir Code — Persian HUD labels
export const NUMF = "CP"; // Chakra Petch — every Latin digit and letter (font stacks put it first)
export const isFa = (s: string) => /[؀-ۿ]/.test(s);
/** 20200 → «20,200» */
export const grp = (n: number) => Math.round(n).toLocaleString("en-US");
/** a signed HUD number in Latin digits: «+38.6», «−07.2» */
export function num(x: number, dec = 1, sign = true, pad = 0) {
  const a = Math.abs(x).toFixed(dec).padStart(pad + (dec ? dec + 1 : 0), "0");
  return (sign ? (x < -1e-9 ? "−" : "+") : x < -1e-9 ? "−" : "") + a;
}

// ---------- the room ----------
let NOISE: HTMLCanvasElement[] | null = null;
function makeNoise() {
  NOISE = [0, 1, 2].map((v) => {
    const cv = document.createElement("canvas");
    cv.width = 360;
    cv.height = 640;
    const x = cv.getContext("2d")!;
    const im = x.createImageData(360, 640);
    const r = rng(7 + v * 13);
    for (let i = 0; i < im.data.length; i += 4) {
      const n = 128 + (r() - 0.5) * 70;
      im.data[i] = im.data[i + 1] = im.data[i + 2] = n;
      im.data[i + 3] = 255;
    }
    x.putImageData(im, 0, 0);
    return cv;
  });
}
export function room(c: Ctx, t: number) {
  c.fillStyle = P.bg;
  c.fillRect(0, 0, W, H);
  // warm haze where the projector light falls
  const g = c.createRadialGradient(540, 1250, 40, 540, 1150, 1100);
  g.addColorStop(0, rgba("#3a2410", 0.55));
  g.addColorStop(0.5, rgba("#1a1109", 0.35));
  g.addColorStop(1, rgba("#000000", 0));
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  // a faint dot grid drifting up (the room is never still)
  const off = (t * 14) % 60;
  c.fillStyle = rgba(P.amber, 0.05);
  for (let y = 60 - off; y < H; y += 60) {
    const row = Math.round((y + off) / 60);
    for (let x = 30 + (row % 2) * 30; x < W; x += 60) c.fillRect(x, y, 2, 2);
  }
}
/** film grain + a slow scan band + vignette over the whole frame */
export function finish(c: Ctx, t: number) {
  if (!NOISE) makeNoise();
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = "overlay";
  c.globalAlpha = 0.22;
  c.drawImage(NOISE![Math.floor(t * 24) % 3], 0, 0, c.canvas.width, c.canvas.height);
  c.restore();
  const band = ((t * 0.18) % 1.3) * H - 200;
  const g = c.createLinearGradient(0, band - 120, 0, band + 120);
  g.addColorStop(0, rgba(P.amber, 0));
  g.addColorStop(0.5, rgba(P.amber, 0.035));
  g.addColorStop(1, rgba(P.amber, 0));
  c.fillStyle = g;
  c.fillRect(0, band - 120, W, 240);
  const v = c.createRadialGradient(540, 900, 500, 540, 900, 1250);
  v.addColorStop(0, rgba("#000000", 0));
  v.addColorStop(1, rgba("#000000", 0.6));
  c.fillStyle = v;
  c.fillRect(0, 0, W, H);
}
/** thin HUD furniture around the stage: a status line with a running atomic clock, side tick rails */
export function frameHud(c: Ctx, t: number) {
  c.save();
  // status line
  const y = 132;
  c.strokeStyle = rgba(P.amber, 0.28);
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(60, y + 26);
  c.lineTo(1020, y + 26);
  c.stroke();
  for (let i = 0; i <= 48; i++) {
    const x = 60 + i * 20, L = i % 6 === 0 ? 9 : 4;
    c.beginPath();
    c.moveTo(x, y + 26);
    c.lineTo(x, y + 26 + L);
    c.stroke();
  }
  // a marker running along it
  const mx = 60 + ((t * 70) % 960);
  c.fillStyle = rgba(P.hi, 0.6);
  c.fillRect(mx - 1, y + 20, 3, 14);
  c.textBaseline = "middle";
  c.font = `500 22px ${NUMF}`;
  c.direction = "ltr";
  c.textAlign = "left";
  c.fillStyle = rgba(P.amber, 0.55);
  c.fillText("GPS  L1  1575.42 MHz", 62, y);
  // the running clock: hh:mm:ss.µs (the micro-seconds churn every frame)
  const T = 8 * 3600 + 14 * 60 + 27 + t, f = Math.floor(t * 30);
  const hh = Math.floor(T / 3600) % 24, mm = Math.floor(T / 60) % 60, ss = Math.floor(T) % 60;
  const us = (Math.floor((T % 1) * 1e6) + Math.floor(hash(f) * 997)) % 1e6;
  const s = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}.${String(us).padStart(6, "0")}`;
  c.textAlign = "right";
  c.fillStyle = rgba(P.hi, 0.7);
  c.fillText(s, 1018, y);
  // blinking live dot
  if (Math.floor(t * 2) % 2 === 0) {
    c.fillStyle = rgba(P.red, 0.85);
    c.beginPath();
    c.arc(1018 - c.measureText(s).width - 18, y, 5, 0, TAU);
    c.fill();
  }
  // side rails
  c.strokeStyle = rgba(P.amber, 0.2);
  c.lineWidth = 1.5;
  const off = (t * 18) % 24;
  for (const [x, dir] of [[34, 1], [1046, -1]] as const) {
    c.beginPath();
    c.moveTo(x, 210);
    c.lineTo(x, 1150);
    for (let yy = 210 + off; yy < 1150; yy += 24) {
      const big = Math.round((yy - off - 210) / 24) % 5 === 0;
      c.moveTo(x, yy);
      c.lineTo(x + dir * (big ? 12 : 6), yy);
    }
    c.stroke();
  }
  c.restore();
}

// ---------- the projector ----------
export const PROJ = { x: 540, y: 1505 };
export function projector(c: Ctx, t: number, power = 1) {
  const { x, y } = PROJ;
  c.save();
  // light pool on the floor
  const g = c.createRadialGradient(x, y, 10, x, y, 300);
  g.addColorStop(0, rgba(P.amber, 0.35 * power));
  g.addColorStop(1, rgba(P.amber, 0));
  c.fillStyle = g;
  c.save();
  c.translate(x, y);
  c.scale(1, 0.25);
  c.fillRect(-300, -300, 600, 600);
  c.restore();
  // the disk: rings that breathe, a dashed ring that turns, a bright core
  c.globalCompositeOperation = "lighter";
  for (let i = 0; i < 4; i++) {
    const k = i / 3, br = 0.55 + 0.45 * Math.sin(t * 3 - i * 0.9);
    c.strokeStyle = rgba(i === 0 ? P.hi : P.amber, (0.65 - k * 0.35) * power * (0.7 + 0.3 * br));
    c.lineWidth = i === 0 ? 4 : 2;
    c.beginPath();
    c.ellipse(x, y, 175 - i * 38, 30 - i * 6.5, 0, 0, TAU);
    c.stroke();
  }
  c.setLineDash([18, 14]);
  c.lineDashOffset = -t * 60;
  c.strokeStyle = rgba(P.hi, 0.4 * power);
  c.lineWidth = 2;
  c.beginPath();
  c.ellipse(x, y, 212, 38, 0, 0, TAU);
  c.stroke();
  c.setLineDash([]);
  const core = c.createRadialGradient(x, y, 2, x, y, 120);
  core.addColorStop(0, rgba("#fff2dc", 0.75 * power));
  core.addColorStop(0.35, rgba(P.amber, 0.35 * power));
  core.addColorStop(1, rgba(P.amber, 0));
  c.fillStyle = core;
  c.save();
  c.translate(x, y);
  c.scale(1, 0.22);
  c.beginPath();
  c.arc(0, 0, 160, 0, TAU);
  c.fill();
  c.restore();
  c.restore();
}
/** the faint light cone from the projector up to a hologram, motes rising in it */
export function beam(c: Ctx, t: number, yTop: number, wTop: number, a: number) {
  if (a <= 0) return;
  const { x, y } = PROJ;
  c.save();
  c.globalCompositeOperation = "lighter";
  const g = c.createLinearGradient(0, y, 0, yTop);
  g.addColorStop(0, rgba(P.amber, 0.14 * a));
  g.addColorStop(1, rgba(P.amber, 0.0));
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(x - 150, y);
  c.lineTo(x - wTop / 2, yTop);
  c.lineTo(x + wTop / 2, yTop);
  c.lineTo(x + 150, y);
  c.closePath();
  c.fill();
  const r = rng(3);
  c.fillStyle = P.hi;
  for (let i = 0; i < 46; i++) {
    const u = (r() + t * (0.08 + r() * 0.1)) % 1, side = r() - 0.5;
    const yy = lerp(y, yTop, u), w = lerp(300, wTop, u);
    c.globalAlpha = a * 0.55 * Math.sin(u * Math.PI);
    c.fillRect(x + side * w * 0.9, yy, 2, 2);
  }
  c.restore();
}

// ---------- holograms ----------
export type HoloOpt = { reveal?: number; alpha?: number; glitch?: number; seed?: number; life?: number; tint?: number };
/** an amber render on black, composited as light: scan-line reveal from the bottom, flicker, scanlines, tearing.
 *  life (0..1) makes it float, breathe and turn a little; tint (0..1) turns it red (switched off / failed). */
export function holo(c: Ctx, name: string, cx: number, cy: number, w: number, t: number, o: HoloOpt = {}) {
  const im = img(name);
  if (!im) return null;
  const life = o.life ?? 1, seed = o.seed ?? 1;
  cy += Math.sin(t * 1.3 + seed) * 8 * life;
  w *= 1 + 0.012 * Math.sin(t * 2.1 + seed) * life;
  const sx = 1 - 0.05 * life * (0.5 + 0.5 * Math.cos(t * 0.8 + seed));
  const h = (w * im.height) / im.width, ww = w * sx;
  const rev = clamp(o.reveal ?? 1);
  if (rev <= 0) return null;
  const f = Math.floor(t * 30);
  const flick = (0.88 + 0.12 * Math.sin(t * 23 + seed)) * (hash(f * 1.7 + seed) < 0.03 ? 0.55 : 1) * (rev < 1 ? 0.6 + 0.4 * (hash(f + seed * 3) > 0.3 ? 1 : 0) : 1);
  const L = layer("holo", 0.75);
  L.save();
  matchTransform(L, c);
  const x0 = cx - ww / 2, y0 = cy - h / 2;
  const yr = y0 + h * (1 - rev);
  L.beginPath();
  L.rect(x0 - 60, yr, ww + 120, h + 60);
  L.clip();
  // tint: turn the amber towards red with a colour filter (black stays black, so no box shows round the render)
  if (o.tint) L.filter = `hue-rotate(${(-26 * clamp(o.tint)).toFixed(1)}deg) saturate(${(1 + 0.7 * clamp(o.tint)).toFixed(2)})`;
  L.drawImage(im, x0, y0, ww, h);
  // tearing: a horizontal slice shifted for a frame now and then
  const g = o.glitch ?? 1;
  const tear = g * (hash(f * 3.3 + seed) < 0.06 * Math.max(1, g) ? 1 : 0);
  if (tear) {
    const sy = y0 + hash(f + seed) * h, sh = 8 + hash(f * 2 + seed) * 40 * Math.max(1, g), dx = (hash(f * 5 + seed) - 0.5) * 50 * Math.max(1, g);
    L.clearRect(x0 - 60, sy, ww + 120, sh);
    L.drawImage(im, 0, ((sy - y0) / h) * im.height, im.width, Math.min(im.height, (sh / h) * im.height), x0 + dx, sy, ww, sh);
  }
  L.filter = "none";
  // scanlines cut out of it
  L.globalCompositeOperation = "destination-out";
  L.fillStyle = rgba("#000000", 0.4);
  const off = (t * 40) % 6;
  for (let y = y0 - 6 + off; y < y0 + h; y += 6) L.fillRect(x0 - 60, y, ww + 120, 2);
  L.restore();
  c.save();
  paint(c, L, (o.alpha ?? 1) * flick, "screen");
  // the reveal edge
  if (rev < 1) {
    c.globalCompositeOperation = "lighter";
    const gr = c.createLinearGradient(0, yr - 18, 0, yr + 18);
    gr.addColorStop(0, rgba(P.hot, 0));
    gr.addColorStop(0.5, rgba(P.hot, 0.9));
    gr.addColorStop(1, rgba(P.hot, 0));
    c.fillStyle = gr;
    c.fillRect(x0 - 30, yr - 18, ww + 60, 36);
  }
  c.restore();
  return { x: x0, y: y0, w: ww, h, cx, cy };
}
/** sparks rushing in and gathering on (x, y) while a hologram materialises (p 0→1) */
export function sparks(c: Ctx, x: number, y: number, rx: number, ry: number, p: number, seed = 1) {
  if (p <= 0 || p >= 1) return;
  const r = rng(seed * 17 + 3);
  c.save();
  c.globalCompositeOperation = "lighter";
  c.lineCap = "round";
  for (let i = 0; i < 56; i++) {
    const a = r() * TAU, d = 0.7 + r() * 1.5, lag = r() * 0.45, tx = (r() - 0.5) * rx * 0.9, ty = (r() - 0.5) * ry * 0.9, hotC = r() < 0.35;
    const u = ease.in(clamp((p - lag) / (1 - lag)));
    if (u <= 0 || u >= 1) continue;
    const px = x + tx + Math.cos(a) * rx * d * (1 - u), py = y + ty + Math.sin(a) * ry * d * (1 - u);
    const tail = 8 + 22 * (1 - u), al = 0.9 * Math.sin(u * Math.PI);
    c.strokeStyle = rgba(hotC ? P.hot : P.amber, al * 0.7);
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(px, py);
    c.lineTo(px + Math.cos(a) * tail, py + Math.sin(a) * tail);
    c.stroke();
    // a bright head, so it reads as a spark flying in, not a scratch
    c.fillStyle = rgba(P.hot, al);
    c.beginPath();
    c.arc(px, py, 2.4, 0, TAU);
    c.fill();
  }
  c.restore();
}
/** two counter-rotating dashed HUD rings with a tick ring, squashed by sy (a pedestal ring in perspective) */
export function rings(c: Ctx, x: number, y: number, r: number, t: number, a: number, sy = 1) {
  if (a <= 0.003) return;
  c.save();
  c.globalAlpha *= clamp(a);
  c.translate(x, y);
  c.scale(1, sy);
  c.strokeStyle = P.amber;
  c.lineWidth = 2 / Math.max(0.3, sy);
  for (const [rr, sp, n, len] of [[r, 0.35, 3, 0.9], [r * 1.1, -0.22, 5, 0.42]] as const) {
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * TAU + t * sp;
      c.beginPath();
      c.arc(0, 0, rr, a0, a0 + len);
      c.stroke();
    }
  }
  c.strokeStyle = rgba(P.hi, 0.6);
  c.lineWidth = 1.5 / Math.max(0.3, sy);
  for (let i = 0; i < 72; i++) {
    const an = (i / 72) * TAU - t * 0.12, L = i % 6 === 0 ? 12 : 5;
    c.beginPath();
    c.moveTo(Math.cos(an) * (r - 10), Math.sin(an) * (r - 10));
    c.lineTo(Math.cos(an) * (r - 10 - L), Math.sin(an) * (r - 10 - L));
    c.stroke();
  }
  c.restore();
}
/** corner brackets around a box */
export function brackets(c: Ctx, x: number, y: number, w: number, h: number, col: string, a: number, len = 34, lw = 3) {
  if (a <= 0.01) return;
  c.save();
  c.globalAlpha *= clamp(a);
  c.strokeStyle = col;
  c.lineWidth = lw;
  c.lineCap = "square";
  c.beginPath();
  for (const [px, py, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]] as const) {
    c.moveTo(px, py + sy * len);
    c.lineTo(px, py);
    c.lineTo(px + sx * len, py);
  }
  c.stroke();
  c.restore();
}
/** a bracket box that snaps on: grows from the centre, overshoots, settles */
export function focusBox(c: Ctx, x: number, y: number, w: number, h: number, p: number, col = P.amber) {
  if (p <= 0) return;
  const s = ease.outBack(clamp(p));
  const cx = x + w / 2, cy = y + h / 2;
  brackets(c, cx - (w / 2) * s, cy - (h / 2) * s, w * s, h * s, col, clamp(p * 2));
}
/** a target lock: four brackets fly in from far and clamp onto (x, y); a dashed circle turns */
export function reticle(c: Ctx, x: number, y: number, r: number, p: number, t: number, col = P.hot) {
  if (p <= 0) return;
  const e = ease.out(clamp(p)), d = lerp(r * 3.2, r, e);
  brackets(c, x - d, y - d, d * 2, d * 2, col, clamp(p * 3), r * 0.45, 3);
  c.save();
  c.globalAlpha *= clamp(p * 2);
  c.strokeStyle = col;
  c.lineWidth = 2;
  c.setLineDash([10, 8]);
  c.lineDashOffset = -t * 40;
  c.beginPath();
  c.arc(x, y, r * 0.72, 0, TAU);
  c.stroke();
  c.setLineDash([]);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + Math.PI / 4;
    c.beginPath();
    c.moveTo(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5);
    c.lineTo(x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.95);
    c.stroke();
  }
  c.restore();
}

// ---------- impacts ----------
/** an expanding ring that fades (p 0→1) */
export function shock(c: Ctx, x: number, y: number, p: number, r0: number, r1: number, col = P.hot, lw = 6, sy = 1) {
  if (p <= 0 || p >= 1) return;
  const r = lerp(r0, r1, ease.out(p));
  c.save();
  c.globalCompositeOperation = "lighter";
  c.strokeStyle = rgba(col, Math.pow(1 - p, 1.4) * 0.9);
  c.lineWidth = lw * (1 - p) + 1;
  c.shadowColor = col;
  c.shadowBlur = 18 * scale();
  c.beginPath();
  c.ellipse(x, y, r, r * sy, 0, 0, TAU);
  c.stroke();
  c.restore();
}
/** radial light streaks flying out (p 0→1) */
export function burst(c: Ctx, x: number, y: number, p: number, r0: number, r1: number, col = P.hot, n = 18, seed = 1) {
  if (p <= 0 || p >= 1) return;
  const r = rng(seed * 31 + 7), e = ease.out(p);
  c.save();
  c.globalCompositeOperation = "lighter";
  c.lineCap = "round";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + (r() - 0.5) * 0.3, len = (0.4 + r() * 0.6) * (r1 - r0) * 0.45;
    const d = lerp(r0, r1 * (0.7 + r() * 0.3), e);
    c.strokeStyle = rgba(r() < 0.5 ? col : P.amber, (1 - p) * 0.9);
    c.lineWidth = 3 * (1 - p) + 1;
    c.beginPath();
    c.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
    c.lineTo(x + Math.cos(a) * (d - len * (1 - p * 0.5)), y + Math.sin(a) * (d - len * (1 - p * 0.5)));
    c.stroke();
  }
  c.restore();
}
/** a soft round glow (additive) */
export function glowDot(c: Ctx, x: number, y: number, r: number, col: string, a = 1) {
  if (a <= 0.003 || r <= 0) return;
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, a));
  g.addColorStop(0.3, rgba(col, a * 0.45));
  g.addColorStop(1, rgba(col, 0));
  c.save();
  c.globalCompositeOperation = "lighter";
  c.fillStyle = g;
  c.fillRect(x - r, y - r, r * 2, r * 2);
  c.restore();
}
/** stacked chevrons that run in one direction (dir −1 = up, 1 = down) */
export function chevrons(c: Ctx, x: number, y: number, dir: number, t: number, col: string, a = 1, s = 22, n = 3) {
  if (a <= 0.003) return;
  c.save();
  c.strokeStyle = col;
  c.lineWidth = 5;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.shadowColor = col;
  c.shadowBlur = 10 * scale();
  for (let i = 0; i < n; i++) {
    const ph = (t * 2.2 - i / n) % 1;
    c.globalAlpha = a * (0.25 + 0.75 * Math.pow(1 - Math.abs(ph - 0.5) * 2, 2));
    const yy = y + dir * (i - (n - 1) / 2) * s * 0.9;
    c.beginPath();
    c.moveTo(x - s, yy - dir * s * 0.45);
    c.lineTo(x, yy + dir * s * 0.45);
    c.lineTo(x + s, yy - dir * s * 0.45);
    c.stroke();
  }
  c.restore();
}
/** a map pin with its point at (x, y) */
export function pinShape(c: Ctx, x: number, y: number, s: number, col: string, a = 1) {
  if (a <= 0.003) return;
  c.save();
  c.globalAlpha *= clamp(a);
  c.fillStyle = col;
  c.shadowColor = col;
  c.shadowBlur = 20 * scale();
  c.beginPath();
  c.moveTo(x, y);
  c.bezierCurveTo(x - s * 0.35, y - s * 0.7, x - s, y - s * 1.1, x - s, y - s * 1.7);
  c.arc(x, y - s * 1.7, s, Math.PI, 0);
  c.bezierCurveTo(x + s, y - s * 1.1, x + s * 0.35, y - s * 0.7, x, y);
  c.fill();
  c.shadowBlur = 0;
  c.globalCompositeOperation = "destination-out";
  c.beginPath();
  c.arc(x, y - s * 1.7, s * 0.42, 0, TAU);
  c.fill();
  c.restore();
}

// ---------- type ----------
/** HUD type reads small in Persian at the reference sizes: everything is set 30% larger */
const HUD_SCALE = 1.3;
export type HudOpt = { size?: number; color?: string; align?: CanvasTextAlign; alpha?: number; glow?: number; weight?: number };
/** a Latin run inside Persian text: a number (with its sign, separators, unit letters) or a Latin word */
const LAT = /[+−-]?[0-9A-Za-z][0-9A-Za-z°%.,:/×]*/g;
type Run = { s: string; lat: boolean; w: number };
const latFont = (size: number, weight: number) => `${weight} ${size * 0.95}px ${NUMF}`;
const faFont = (size: number) => `${size}px ${MONO}`;
/** split a HUD string into runs and measure them. Persian runs keep Vazir Code alone (its own spaces — a font stack
 *  with Chakra Petch first squeezed the Persian word spaces); Latin runs use Chakra Petch. No Persian = one Latin run. */
function layoutRuns(c: Ctx, s: string, size: number, weight: number) {
  const runs: Run[] = [];
  if (!isFa(s)) runs.push({ s, lat: true, w: 0 });
  else {
    let last = 0;
    for (const m of s.matchAll(LAT)) {
      const i = m.index ?? 0;
      if (i > last) runs.push({ s: s.slice(last, i), lat: false, w: 0 });
      runs.push({ s: m[0], lat: true, w: 0 });
      last = i + m[0].length;
    }
    if (last < s.length) runs.push({ s: s.slice(last), lat: false, w: 0 });
  }
  let w = 0;
  for (const r of runs) {
    c.font = r.lat ? latFont(size, weight) : faFont(size);
    c.direction = r.lat ? "ltr" : "rtl";
    r.w = c.measureText(r.s).width;
    w += r.w;
  }
  return { runs, w, rtl: isFa(s) };
}
/** HUD text: Persian in Vazir Code, every Latin digit/letter run in Chakra Petch, laid out right-to-left */
export function hud(c: Ctx, s: string, x: number, y: number, o: HudOpt = {}) {
  if ((o.alpha ?? 1) <= 0.003 || !s) return;
  const size = (o.size ?? 28) * HUD_SCALE;
  c.save();
  c.globalAlpha *= clamp(o.alpha ?? 1);
  c.textBaseline = "middle";
  c.fillStyle = o.color ?? P.amber;
  if (o.glow) {
    c.shadowColor = o.color ?? P.amber;
    c.shadowBlur = o.glow * scale();
  }
  const { runs, w } = layoutRuns(c, s, size, o.weight ?? 500);
  const align = o.align ?? "center";
  let xr = align === "center" ? x + w / 2 : align === "left" || align === "start" ? x + w : x;
  for (const r of runs) {
    c.font = r.lat ? latFont(size, o.weight ?? 500) : faFont(size);
    c.direction = r.lat ? "ltr" : "rtl";
    c.textAlign = "right";
    c.fillText(r.s, xr, y);
    xr -= r.w;
  }
  c.restore();
}
/** width of a HUD string (same layout as hud) */
export function hudW(c: Ctx, s: string, size = 28, weight = 500) {
  c.save();
  const { w } = layoutRuns(c, s, size * HUD_SCALE, weight);
  c.restore();
  return w;
}
/** typed HUD text (characters appear one by one, a block cursor while typing) */
export function typed(c: Ctx, s: string, x: number, y: number, p: number, t: number, o: HudOpt = {}) {
  if (p <= 0) return;
  const n = s.length, k = Math.min(n, Math.ceil(clamp(p) * n));
  const cur = p < 1 || Math.floor(t * 3) % 2 === 0 ? "▌" : "";
  hud(c, s.slice(0, k) + (p < 1.2 ? cur : ""), x, y, o);
}
export type NumOpt = { col?: string; a?: number; glow?: number; below?: boolean; unitCol?: string; s?: number };
/** a big Latin number with its Persian unit (to its left, or centred below) */
export function numUnit(c: Ctx, n: string, unit: string, x: number, y: number, size: number, o: NumOpt = {}) {
  const a = o.a ?? 1;
  if (a <= 0.003) return;
  const col = o.col ?? P.hot;
  c.save();
  c.globalAlpha *= clamp(a);
  c.translate(x, y);
  c.scale(o.s ?? 1, o.s ?? 1);
  c.textBaseline = "middle";
  c.font = `700 ${size}px ${NUMF}`;
  c.direction = "ltr";
  const wn = c.measureText(n).width;
  // the Persian unit never drops below a readable size
  const uf = `${Math.max(size * (o.below ? 0.3 : 0.34), 25)}px ${MONO}`;
  c.font = uf;
  c.direction = "rtl";
  const wu = unit ? c.measureText(unit).width : 0;
  const draw = (xr: number, align: CanvasTextAlign) => {
    c.font = `700 ${size}px ${NUMF}`;
    c.direction = "ltr";
    c.textAlign = align;
    c.fillStyle = col;
    c.shadowColor = col;
    c.shadowBlur = (o.glow ?? 16) * scale();
    c.fillText(n, xr, 0);
    c.shadowBlur = 0;
  };
  if (o.below) {
    draw(0, "center");
    if (unit) {
      c.font = uf;
      c.direction = "rtl";
      c.textAlign = "center";
      c.fillStyle = o.unitCol ?? P.amber;
      c.fillText(unit, 0, size * 0.74);
    }
  } else {
    const gap = size * 0.22, right = (wn + (unit ? gap + wu : 0)) / 2;
    draw(right, "right");
    if (unit) {
      c.font = uf;
      c.direction = "rtl";
      c.textAlign = "right";
      c.fillStyle = o.unitCol ?? P.amber;
      c.fillText(unit, right - wn - gap, size * 0.1);
    }
  }
  c.restore();
}
/** a mechanical counter: digit boxes whose digits roll (count up or down) */
export function odometer(c: Ctx, v: number, n: number, x: number, y: number, size: number, o: { col?: string; a?: number; box?: boolean } = {}) {
  const a = o.a ?? 1;
  if (a <= 0.003) return;
  const col = o.col ?? P.hot, dw = size * 0.74, dh = size * 1.12, gap = size * 0.12;
  const x0 = x - (n * dw + (n - 1) * gap) / 2;
  c.save();
  c.globalAlpha *= clamp(a);
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.font = `700 ${size}px ${NUMF}`;
  c.direction = "ltr";
  for (let i = 0; i < n; i++) {
    const p = n - 1 - i, pw = Math.pow(10, p);
    const base = ((Math.floor(v / pw) % 10) + 10) % 10;
    const lower = v - Math.floor(v / pw) * pw;
    const roll = p === 0 ? v - Math.floor(v) : clamp(lower - (pw - 1));
    const bx = x0 + i * (dw + gap);
    if (o.box !== false) {
      c.fillStyle = rgba("#000000", 0.45);
      c.fillRect(bx, y - dh / 2, dw, dh);
      c.strokeStyle = rgba(P.amber, 0.7);
      c.lineWidth = 2;
      c.strokeRect(bx, y - dh / 2, dw, dh);
    }
    c.save();
    c.beginPath();
    c.rect(bx, y - dh / 2, dw, dh);
    c.clip();
    c.fillStyle = col;
    c.shadowColor = col;
    c.shadowBlur = 14 * scale();
    c.fillText(String(base), bx + dw / 2, y - roll * dh + size * 0.04);
    c.fillText(String((base + 1) % 10), bx + dw / 2, y + (1 - roll) * dh + size * 0.04);
    c.restore();
    if (o.box !== false) {
      c.strokeStyle = rgba("#000000", 0.6);
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(bx, y);
      c.lineTo(bx + dw, y);
      c.stroke();
    }
  }
  c.restore();
}

// ---------- instruments ----------
/** circular gauge: tick ring, turning HUD rings, a value arc (clockwise +, counter-clockwise −), number + unit.
 *  slam (0..1) = an impact pulse on the value */
export function dial(c: Ctx, x: number, y: number, r: number, v: number, t: number, o: { label?: string; max?: number; col?: string; a?: number; slam?: number; s?: number } = {}) {
  const a = o.a ?? 1;
  if (a <= 0.003) return;
  const max = o.max ?? 50, col = o.col ?? P.amber, slam = o.slam ?? 0;
  c.save();
  c.globalAlpha *= clamp(a);
  c.translate(x, y);
  const s = (o.s ?? 1) * (1 + 0.08 * slam);
  c.scale(s, s);
  c.strokeStyle = rgba(P.amber, 0.55);
  c.lineWidth = 2;
  for (let i = 0; i < 60; i++) {
    const an = (i / 60) * TAU - Math.PI / 2 + t * 0.05, L = i % 5 === 0 ? 14 : 7;
    c.beginPath();
    c.moveTo(Math.cos(an) * (r + 18), Math.sin(an) * (r + 18));
    c.lineTo(Math.cos(an) * (r + 18 + L), Math.sin(an) * (r + 18 + L));
    c.stroke();
  }
  rings(c, 0, 0, r + 50, t, 0.55);
  c.strokeStyle = rgba(P.amber, 0.18);
  c.lineWidth = 12;
  c.beginPath();
  c.arc(0, 0, r, 0, TAU);
  c.stroke();
  const sweep = clamp(Math.abs(v) / max) * TAU * 0.95;
  if (sweep > 0.001) {
    c.strokeStyle = col;
    c.lineWidth = 12 + 6 * slam;
    c.shadowColor = col;
    c.shadowBlur = (18 + 24 * slam) * scale();
    c.beginPath();
    if (v >= 0) c.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + sweep);
    else c.arc(0, 0, r, -Math.PI / 2 - sweep, -Math.PI / 2);
    c.stroke();
    // the bright end of the arc
    const ea = v >= 0 ? -Math.PI / 2 + sweep : -Math.PI / 2 - sweep;
    c.fillStyle = "#fff6e6";
    c.beginPath();
    c.arc(Math.cos(ea) * r, Math.sin(ea) * r, 9, 0, TAU);
    c.fill();
    c.shadowBlur = 0;
  }
  c.restore();
  const ns = s * (1 + 0.15 * slam);
  numUnit(c, num(v, 1, true, 2), "", x, y - 10 * s, r * 0.42 * ns, { col: col === P.amber ? P.hi : col, a, glow: 12 + 24 * slam });
  hud(c, "میکروثانیه در روز", x, y + r * 0.4 * s, { size: r * 0.13 * s, color: P.amber, alpha: a * 0.85 });
  if (o.label) hud(c, o.label, x, y - (r + 72) * s, { size: 30, color: P.amber, alpha: a });
}
/** a line chart: faint grid, axes with Latin ticks, a line drawn up to progress p, a glowing head */
export type Chart = { x: number; y: number; w: number; h: number; xMax: number; yMax: number; xTicks: number[]; yTicks: number[]; xLabel: string; yLabel: string };
export function chartAxes(c: Ctx, ch: Chart, a: number) {
  if (a <= 0.003) return;
  c.save();
  c.globalAlpha *= clamp(a);
  c.strokeStyle = rgba(P.amber, 0.12);
  c.lineWidth = 1;
  for (const v of ch.yTicks) {
    const yy = ch.y + ch.h - (v / ch.yMax) * ch.h;
    c.beginPath();
    c.moveTo(ch.x, yy);
    c.lineTo(ch.x + ch.w, yy);
    c.stroke();
  }
  for (const v of ch.xTicks) {
    const xx = ch.x + (v / ch.xMax) * ch.w;
    c.beginPath();
    c.moveTo(xx, ch.y);
    c.lineTo(xx, ch.y + ch.h);
    c.stroke();
  }
  c.strokeStyle = rgba(P.amber, 0.7);
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(ch.x, ch.y);
  c.lineTo(ch.x, ch.y + ch.h);
  c.lineTo(ch.x + ch.w, ch.y + ch.h);
  c.stroke();
  for (const v of ch.xTicks) {
    const xx = ch.x + (v / ch.xMax) * ch.w;
    c.beginPath();
    c.moveTo(xx, ch.y + ch.h);
    c.lineTo(xx, ch.y + ch.h + 8);
    c.stroke();
    hud(c, String(v), xx, ch.y + ch.h + 30, { size: 20, alpha: 0.85 });
  }
  for (const v of ch.yTicks) {
    const yy = ch.y + ch.h - (v / ch.yMax) * ch.h;
    c.beginPath();
    c.moveTo(ch.x - 8, yy);
    c.lineTo(ch.x, yy);
    c.stroke();
    hud(c, String(v), ch.x - 14, yy, { size: 20, align: "right", alpha: 0.85 });
  }
  hud(c, ch.xLabel, ch.x + ch.w / 2, ch.y + ch.h + 72, { size: 24, alpha: 0.9 });
  hud(c, ch.yLabel, ch.x + 10, ch.y - 34, { size: 24, align: "center" });
  c.restore();
}
/** draw a polyline in chart coordinates up to fraction p; returns the head point */
export function chartLine(c: Ctx, ch: Chart, pts: [number, number][], p: number, col = P.amber, o: { fill?: boolean; dash?: boolean; w?: number } = {}) {
  if (p <= 0) return null;
  const toX = (v: number) => ch.x + (v / ch.xMax) * ch.w, toY = (v: number) => ch.y + ch.h - (v / ch.yMax) * ch.h;
  let L = 0;
  const seg = pts.slice(1).map((q, i) => {
    const d = Math.hypot(toX(q[0]) - toX(pts[i][0]), toY(q[1]) - toY(pts[i][1]));
    L += d;
    return d;
  });
  let left = L * clamp(p);
  const out: [number, number][] = [[toX(pts[0][0]), toY(pts[0][1])]];
  for (let i = 1; i < pts.length; i++) {
    const a: [number, number] = [toX(pts[i - 1][0]), toY(pts[i - 1][1])], b: [number, number] = [toX(pts[i][0]), toY(pts[i][1])];
    if (left >= seg[i - 1]) {
      out.push(b);
      left -= seg[i - 1];
    } else {
      const f = seg[i - 1] > 0 ? left / seg[i - 1] : 0;
      out.push([lerp(a[0], b[0], f), lerp(a[1], b[1], f)]);
      break;
    }
  }
  c.save();
  if (o.fill !== false) {
    const g = c.createLinearGradient(0, ch.y, 0, ch.y + ch.h);
    g.addColorStop(0, rgba(col, 0.22));
    g.addColorStop(1, rgba(col, 0.02));
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(out[0][0], ch.y + ch.h);
    out.forEach(([x, y]) => c.lineTo(x, y));
    c.lineTo(out[out.length - 1][0], ch.y + ch.h);
    c.closePath();
    c.fill();
  }
  c.strokeStyle = col;
  c.lineWidth = o.w ?? 4;
  if (o.dash) c.setLineDash([16, 10]);
  c.shadowColor = col;
  c.shadowBlur = 16 * scale();
  c.beginPath();
  out.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.stroke();
  c.setLineDash([]);
  const [hx, hy] = out[out.length - 1];
  c.fillStyle = "#fff4e0";
  c.shadowColor = P.hot;
  c.shadowBlur = 22 * scale();
  c.beginPath();
  c.arc(hx, hy, 8, 0, TAU);
  c.fill();
  c.restore();
  return [hx, hy] as [number, number];
}
/** an analog clock face: the second hand sweeps with a motion trail; «ghost» = where a correct clock would point
 *  (the gap between them is filled — red when behind, hot when ahead) */
export function clockFace(c: Ctx, x: number, y: number, r: number, ang: number, t: number, o: { col?: string; a?: number; ghost?: number; sx?: number; back?: boolean } = {}) {
  const a = o.a ?? 1;
  if (a <= 0.003) return;
  const col = o.col ?? P.amber;
  c.save();
  c.globalAlpha *= clamp(a);
  c.translate(x, y);
  c.scale(o.sx ?? 1, 1);
  c.fillStyle = rgba("#000000", 0.3);
  c.beginPath();
  c.arc(0, 0, r, 0, TAU);
  c.fill();
  c.strokeStyle = col;
  c.lineWidth = 3;
  c.shadowColor = col;
  c.shadowBlur = 12 * scale();
  c.beginPath();
  c.arc(0, 0, r, 0, TAU);
  c.stroke();
  c.shadowBlur = 0;
  c.lineWidth = 2;
  for (let i = 0; i < 60; i++) {
    const an = (i / 60) * TAU, L = i % 5 === 0 ? 12 : 5;
    c.beginPath();
    c.moveTo(Math.cos(an) * (r - 6), Math.sin(an) * (r - 6));
    c.lineTo(Math.cos(an) * (r - 6 - L), Math.sin(an) * (r - 6 - L));
    c.stroke();
  }
  if (o.ghost !== undefined) {
    const g = o.ghost, ahead = ang > g;
    const fc = ahead ? P.hot : P.red;
    c.fillStyle = rgba(fc, 0.35);
    c.beginPath();
    c.moveTo(0, 0);
    c.arc(0, 0, r * 0.82, Math.min(g, ang), Math.max(g, ang));
    c.closePath();
    c.fill();
    c.strokeStyle = rgba(P.cream, 0.45);
    c.lineWidth = 3;
    c.setLineDash([6, 6]);
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(Math.cos(g) * r * 0.74, Math.sin(g) * r * 0.74);
    c.stroke();
    c.setLineDash([]);
  }
  // motion trail behind the second hand (ahead of it when the clock runs backwards)
  c.lineCap = "round";
  for (let i = 1; i <= 7; i++) {
    const an = ang - (o.back ? -1 : 1) * i * 0.05;
    c.strokeStyle = rgba(P.hot, 0.28 * (1 - i / 8));
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(Math.cos(an) * r * 0.74, Math.sin(an) * r * 0.74);
    c.stroke();
  }
  c.lineWidth = 5;
  c.strokeStyle = P.hot;
  c.shadowColor = P.hot;
  c.shadowBlur = 10 * scale();
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(Math.cos(ang) * r * 0.76, Math.sin(ang) * r * 0.76);
  c.stroke();
  c.lineWidth = 3;
  c.strokeStyle = col;
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(Math.cos(ang / 12) * r * 0.45, Math.sin(ang / 12) * r * 0.45);
  c.stroke();
  c.fillStyle = P.hot;
  c.beginPath();
  c.arc(0, 0, 6, 0, TAU);
  c.fill();
  c.restore();
}
/** a toggle switch: on 0..1 slides the knob; hot when on, red when off */
export function toggle(c: Ctx, x: number, y: number, on: number, a = 1, s = 1) {
  if (a <= 0.003) return;
  const w = 130, h = 58;
  c.save();
  c.globalAlpha *= clamp(a);
  c.translate(x, y);
  c.scale(s, s);
  const col = on > 0.5 ? P.hot : P.red;
  c.strokeStyle = col;
  c.lineWidth = 3;
  c.fillStyle = rgba(col, 0.15);
  c.beginPath();
  c.roundRect(-w / 2, -h / 2, w, h, h / 2);
  c.fill();
  c.stroke();
  const kx = lerp(-w / 2 + h / 2, w / 2 - h / 2, ease.inOut(clamp(on)));
  c.fillStyle = col;
  c.shadowColor = col;
  c.shadowBlur = 18 * scale();
  c.beginPath();
  c.arc(kx, 0, h / 2 - 8, 0, TAU);
  c.fill();
  c.restore();
}
/** a timeline ruler (years) with a marker */
export function ruler(c: Ctx, x: number, y: number, w: number, y0: number, y1: number, at: number, a = 1) {
  if (a <= 0.003) return;
  c.save();
  c.globalAlpha *= clamp(a);
  c.strokeStyle = rgba(P.amber, 0.7);
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(x, y);
  c.lineTo(x + w, y);
  for (let yr = y0; yr <= y1; yr++) {
    const xx = x + ((yr - y0) / (y1 - y0)) * w, L = yr % 10 === 0 ? 16 : yr % 5 === 0 ? 10 : 5;
    c.moveTo(xx, y);
    c.lineTo(xx, y + L);
  }
  c.stroke();
  for (let yr = Math.ceil(y0 / 10) * 10; yr <= y1; yr += 10) hud(c, String(yr), x + ((yr - y0) / (y1 - y0)) * w, y + 42, { size: 22, alpha: 0.85 });
  const mx = x + ((at - y0) / (y1 - y0)) * w;
  c.fillStyle = P.hot;
  c.shadowColor = P.hot;
  c.shadowBlur = 12 * scale();
  c.beginPath();
  c.moveTo(mx, y - 4);
  c.lineTo(mx - 12, y - 24);
  c.lineTo(mx + 12, y - 24);
  c.closePath();
  c.fill();
  c.restore();
}

// ---------- the caption: typed as it is spoken ----------
export type CapWord = { w: string; kw: boolean; s: number; e: number };
export type Chunk = { words: CapWord[]; s: number; e: number };
const CAP = { size: 56, maxW: 780, lineH: 76, y: 1290 };
const isNum = (w: string) => /[0-9]/.test(w);
// numbers in Chakra Petch (a trailing «،» falls back to Morabba); Persian words in Morabba alone, so the word
// spaces stay Morabba's
const capFont = (w: string) => (isNum(w) ? `700 ${CAP.size * 0.92}px ${NUMF}, ${FA}` : `700 ${CAP.size}px ${FA}`);
function capW(c: Ctx, s: string) {
  c.font = capFont(s);
  return c.measureText(s).width;
}
export function caption(c: Ctx, ch: Chunk | null, t: number) {
  if (!ch) return;
  const fade = clamp((t - ch.e) / 0.12);
  if (t < ch.s - 0.1 || fade >= 1) return;
  c.save();
  c.direction = "rtl";
  c.font = capFont("ا");
  const sp = c.measureText(" ").width * 1.1;
  // rows of the full chunk (so typed text never re-flows)
  const rows: { ws: CapWord[]; widths: number[]; w: number }[] = [{ ws: [], widths: [], w: 0 }];
  for (const wd of ch.words) {
    const ww = capW(c, wd.w);
    let row = rows[rows.length - 1];
    if (row.ws.length && row.w + sp + ww > CAP.maxW) {
      row = { ws: [], widths: [], w: 0 };
      rows.push(row);
    }
    row.w += (row.ws.length ? sp : 0) + ww;
    row.ws.push(wd);
    row.widths.push(ww);
  }
  const wMax = Math.max(...rows.map((r) => r.w)), bw = wMax + 80, bh = rows.length * CAP.lineH + 40;
  const x0 = 540 - bw / 2, y0 = CAP.y - bh / 2;
  c.globalAlpha *= 1 - fade;
  c.fillStyle = rgba("#000000", 0.5);
  c.fillRect(x0, y0, bw, bh);
  brackets(c, x0, y0, bw, bh, P.amber, 0.9, 22, 3);
  c.textBaseline = "middle";
  const cur: { p: [number, number] | null } = { p: null };
  rows.forEach((row, ri) => {
    let x = 540 + row.w / 2;
    const yy = CAP.y - ((rows.length - 1) * CAP.lineH) / 2 + ri * CAP.lineH + 2;
    row.ws.forEach((wd, i) => {
      const ww = row.widths[i];
      const u = (t - wd.s + 0.03) / Math.max(0.12, Math.min(0.3, wd.e - wd.s));
      if (u > 0) {
        c.font = capFont(wd.w);
        c.direction = "rtl";
        c.textAlign = "right";
        // the word being spoken burns white-hot; keywords stay bright amber
        const hot = t < wd.e + 0.15;
        c.fillStyle = wd.kw ? (hot ? P.hot : P.key) : P.cream;
        if (wd.kw) {
          c.shadowColor = P.key;
          c.shadowBlur = (hot ? 22 : 10) * scale();
        }
        if (isNum(wd.w)) {
          // numbers type left → right: reveal the whole word through a growing window
          const vis = ww * clamp(u);
          c.save();
          c.beginPath();
          c.rect(x - ww - 4, yy - 50, vis + 4, 100);
          c.clip();
          c.fillText(wd.w, x, yy);
          c.restore();
          cur.p = [x - ww + vis + (u < 1 ? 20 : 0), yy];
          if (u >= 1) cur.p = [x - ww - 6, yy];
        } else {
          const chars = [...wd.w], k = Math.min(chars.length, Math.ceil(clamp(u) * chars.length));
          const part = chars.slice(0, k).join("");
          c.fillText(part, x, yy);
          cur.p = [x - c.measureText(part).width - 6, yy];
        }
        c.shadowBlur = 0;
      }
      x -= ww + sp;
    });
  });
  // the block cursor after the last typed letters
  if (cur.p && Math.floor(t * 3.2) % 2 === 0) {
    const [cx, cy] = cur.p;
    c.fillStyle = P.cream;
    c.fillRect(cx - 14, cy - 26, 12, 48);
  }
  c.restore();
}
export { layer, rgba };
