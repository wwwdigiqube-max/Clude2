// S11 · «NFP... به‌زودی، از آلوانا.» (54.6 → 59.9) — r8's last shot: the user's photo of someone working late at
// a laptop by a window. It breathes (slow push, laptop light flicker, dust in the window beam, drifting bokeh).
// *NFP* writes itself in italic on its word, the music's final hit flares the window, «coming soon» types on
// «به‌زودی», the Alvana mark lands on «آلوانا», and the whole frame fades to black.
import { bloom, blur, Ctx, H, layer, matchTransform, scale, W } from "../../lib/canvas";
import { glow, grain, vignette } from "../../lib/fx";
import { txt } from "../../lib/hud";
import { clamp, ease, hash, k, lerp, rgba, rng } from "../../lib/math";
import { img } from "../../lib/img";
import { TOTAL, Wd } from "../cues";

const IW = 941, IH = 1672;
export const MUSIC_HIT = 55.43;
function alvana(c: Ctx, x: number, y: number, size: number, a: number) {
  if (a <= 0) return;
  const s = size / 64;
  c.save();
  c.globalAlpha = a;
  c.translate(x - size / 2, y - size / 2);
  c.scale(s, s);
  const bg = c.createLinearGradient(0, 0, 64, 64);
  bg.addColorStop(0, "#121a28");
  bg.addColorStop(1, "#070a10");
  c.fillStyle = bg;
  c.beginPath();
  c.roundRect(0, 0, 64, 64, 15);
  c.fill();
  c.strokeStyle = rgba("#ffffff", 0.12);
  c.lineWidth = 0.6;
  c.stroke();
  c.save();
  c.beginPath();
  c.rect(0, 0, 64, 28.6);
  c.rect(0, 32.5, 64, 31.5);
  c.clip();
  c.fillStyle = "#f1e9db";
  c.beginPath();
  c.arc(32, 32, 21, 0, Math.PI * 2);
  c.arc(32, 32, 8.8, 0, Math.PI * 2, true);
  c.fill("evenodd");
  c.fillRect(40.8, 32, 12.2, 21);
  c.restore();
  c.restore();
}
/** italic display type with a projector flicker while it appears */
function italic(c: Ctx, s: string, x: number, y: number, size: number, weight: number, a: number, t: number, col = "#f1e9db", ls = 0.04) {
  if (a <= 0) return;
  const fl = a < 1 ? (hash(Math.floor(t * 24) + s.length) > 0.35 ? 1 : 0.35) : 1;
  c.save();
  c.font = `italic ${weight} ${size}px CP`;
  c.letterSpacing = `${(size * ls).toFixed(1)}px`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.globalAlpha = clamp(a) * fl;
  c.fillStyle = col;
  c.shadowColor = rgba("#ffffff", 0.35);
  c.shadowBlur = 18 * scale();
  c.fillText(s, x, y);
  c.restore();
}
export function seqS11(c: Ctx, t: number) {
  const t0 = 54.6;
  const fadeIn = k(t, t0, t0 + 0.55);
  const hit = t > MUSIC_HIT ? Math.exp(-(t - MUSIC_HIT) / 0.35) : 0;
  const z = 1.0 + 0.07 * k(t, t0, TOTAL, ease.inOutSine) + 0.012 * hit;
  c.fillStyle = "#000";
  c.fillRect(0, 0, W, H);
  const lit = layer("s11-lit", 0.5);
  c.save();
  // push toward the person and the laptop
  const fx = 390 * (W / IW), fy = 1250 * (H / IH);
  c.translate(fx, fy);
  c.scale(z, z);
  c.translate(-fx, -fy);
  lit.save();
  matchTransform(lit, c);
  const sx = W / IW, sy = H / IH;
  const im = img("end");
  if (im) c.drawImage(im, 0, 0, W, H);
  // the laptop screen breathes (light on the face and hands)
  const lx = 665 * sx, ly = 1360 * sy;
  const flick = 0.85 + 0.1 * Math.sin(t * 13) + 0.05 * Math.sin(t * 31);
  c.save();
  c.globalCompositeOperation = "screen";
  glow(c, lx, ly, 330, "#dfe6ef", 0.16 * flick);
  c.restore();
  glow(lit, lx, ly, 90, "#ffffff", 0.5 * flick);
  // dust drifting in the window beam
  const r = rng(12);
  for (let i = 0; i < 90; i++) {
    const u = r(), v = r();
    const bx = lerp(150, 520, v) * sx + (u - 0.5) * 160, by = lerp(380, 1050, v) * sy + ((t * (6 + r() * 14) + r() * 400) % 400) - 200;
    const a = 0.25 + 0.6 * r() * (0.6 + 0.4 * Math.sin(t * 2 + i));
    c.fillStyle = rgba("#ffffff", a * fadeIn);
    c.beginPath();
    c.arc(bx, by, 0.8 + r() * 1.8, 0, Math.PI * 2);
    c.fill();
  }
  // the final hit lights the window up
  if (hit > 0.01) {
    c.save();
    c.globalCompositeOperation = "screen";
    glow(c, 40 * sx, 500 * sy, 900, "#e8eef6", 0.4 * hit);
    c.restore();
    glow(lit, 40 * sx, 500 * sy, 400, "#ffffff", hit);
  }
  lit.restore();
  c.restore();
  // drifting bokeh in front (out of focus)
  c.save();
  c.filter = blur(10);
  const br = rng(4);
  for (let i = 0; i < 7; i++) {
    const x = br() * W + Math.sin(t * 0.3 + i) * 30, y = br() * H * 0.7 + Math.cos(t * 0.25 + i) * 20, rr = 30 + br() * 70;
    c.fillStyle = rgba("#ffffff", (0.05 + 0.06 * br()) * fadeIn);
    c.beginPath();
    c.arc(x, y, rr, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
  bloom(c, lit, 0.7, 40);
  // the sign-off in the dark upper half
  const nfp = k(t, Wd(11, "اِن") - 0.08, Wd(11, "پی...") + 0.15, ease.out);
  italic(c, "*NFP*", 540, 560 - 14 * (1 - nfp), 190, 700, nfp, t);
  const soon = clamp((t - Wd(11, "به‌زودی،") + 0.06) / 0.5);
  const str = "coming soon";
  italic(c, str.slice(0, Math.ceil(soon * str.length)), 540, 700, 46, 500, soon > 0 ? 1 : 0, t + 99, "#e9e3d8", 0.32);
  const alv = k(t, Wd(11, "آلوانا.") - 0.12, Wd(11, "آلوانا.") + 0.4, ease.outBack);
  alvana(c, 540, 860 + 16 * (1 - alv), 104, clamp(alv));
  txt(c, "ALVANA", 540, 968 + 8 * (1 - alv), { size: 26, weight: 600, ls: 0.62, align: "center", color: "#f1e9db", alpha: clamp(alv) * 0.95 });
  vignette(c, 0.55, "#000000");
  grain(c, t, 0.22);
  if (fadeIn < 1) {
    c.fillStyle = rgba("#000000", 1 - fadeIn);
    c.fillRect(0, 0, W, H);
  }
  // fade to black
  const fo = k(t, TOTAL - 1.3, TOTAL - 0.08, ease.in);
  if (fo > 0) {
    c.fillStyle = rgba("#000000", fo);
    c.fillRect(0, 0, W, H);
  }
}
