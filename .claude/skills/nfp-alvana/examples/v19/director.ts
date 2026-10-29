// Global timeline of video 19: which scene draws when, and the transitions between them (all cued to words).
// Portal sections re-use earlier scenes with their titles switched off, drifting slowly from an anchor moment.
import { E, S, W as Wd } from "./cues";
import { Ctx, H, layer, paint, scale, W } from "./lib/canvas";
import { glow, grain, vignette } from "./lib/fx";
import { clamp, ease, k, lerp, win } from "./lib/math";
import { popR, portal, stage } from "./lib/portal";
import { book, inkLine, qmark } from "./lib/lineart";
import { blobPath, partial } from "./lib/shape";
import { textOff, title } from "./lib/text";
import { drawFigTest } from "./scenes/figtest";
import { angelsRow, drawFinal, strikeName } from "./scenes/finale";
import { drawHagar } from "./scenes/hagar";
import { drawExodus, drawHolyPlace, drawHoreb, drawTabernacle } from "./scenes/moses";
import { drawMount } from "./scenes/mount";
import { vesica } from "./scenes/open";
import { drawPrologue, T as PT } from "./scenes/prologue";
import { drawDaniel, drawEzekiel, drawIsaiah, drawThroneRoom, portalLabel } from "./scenes/prophets";
import { drawSky } from "./scenes/sky";
import { drawVillage } from "./scenes/village";
import { drawGlory, drawWord } from "./scenes/word";

type Draw = (c: Ctx) => void;
/** run a scene with its titles off (it is shown inside a portal) */
const quiet = (fn: Draw): Draw => (c) => {
  const p = textOff.v;
  textOff.v = true;
  try {
    fn(c);
  } finally {
    textOff.v = p;
  }
};
const into = (id: string, fn: Draw) => {
  const L = layer(id);
  fn(L);
  return L;
};
// earlier scenes recalled inside portals: anchor time + slow drift
const R = {
  hagar: (t: number, t0: number) => quiet((c) => drawHagar(c, 109 + (t - t0) * 0.4)),
  sky: (t: number, t0: number) => quiet((c) => drawSky(c, 148 + (t - t0) * 0.3)),
  throne: (t: number, t0: number) => quiet((c) => drawThroneRoom(c, 166 + (t - t0) * 0.5)),
  horeb: (t: number, t0: number) => quiet((c) => drawHoreb(c, 189.5 + (t - t0) * 0.25)),
  holy: (t: number) => quiet((c) => drawHolyPlace(c, t)),
  glory: (t: number, t0: number) => quiet((c) => drawGlory(c, 233.5 + (t - t0) * 0.3)),
  mount: (t: number, t0: number) => quiet((c) => drawMount(c, 293.5 + (t - t0) * 0.3)),
};
// where each scene's subject sits on screen (centre + radius to show inside a portal)
const FOCUS = {
  hagar: { cx: 1000, cy: 600, crop: 520 },
  sky: { cx: 1050, cy: 780, crop: 380 },
  throne: { cx: 960, cy: 560, crop: 500 },
  horeb: { cx: 1250, cy: 700, crop: 470 },
  exodus: { cx: 680, cy: 640, crop: 470 },
  tab: { cx: 960, cy: 600, crop: 500 },
  holy: { cx: 960, cy: 560, crop: 500 },
  glory: { cx: 960, cy: 520, crop: 520 },
  mount: { cx: 1060, cy: 600, crop: 420 },
  village: { cx: 985, cy: 660, crop: 460 },
  prophet: { cx: 960, cy: 600, crop: 520 },
};
type Focus = { cx: number; cy: number; crop: number };
const RFULL = Math.hypot(W, H) / 2 + 20;
/** e = 0: the scene is full frame; e = 1: it sits in a portal at (x,y,r) showing `f` */
function morph(ctx: Ctx, id: string, draw: Draw, e: number, x: number, y: number, r: number, f: Focus, t: number, seed: number, alpha = 1) {
  if (e <= 0.0005) return draw(ctx);
  portal(ctx, { id, draw, x: lerp(960, x, e), y: lerp(540, y, e), r: lerp(RFULL, r, e), cx: lerp(960, f.cx, e), cy: lerp(540, f.cy, e), crop: lerp(RFULL, f.crop, e), seed, t, alpha });
}
const pop = (ctx: Ctx, id: string, draw: Draw, t: number, t0: number, x: number, y: number, r: number, f: Focus, seed: number, alpha = 1) => {
  const rr = popR(t, t0, r, 0.75);
  if (rr > 0.8) portal(ctx, { id, draw, x, y, r: rr, ...f, seed, t, alpha });
};
const label = (ctx: Ctx, s: string, x: number, y: number, t: number, t0: number, out = 0) => portalLabel(ctx, s, x, y, k(t, t0, t0 + 0.7), out);
const finish = (ctx: Ctx, t: number) => {
  vignette(ctx, 0.35, "#0b0612");
  grain(ctx, t, 0.14);
};
/** reveal `scene` through a lens (intersection of two circles), growing from the given size */
function lensReveal(ctx: Ctx, t: number, scene: Draw, g: number, cx: number, cy: number, d: number, r: number, vertical: boolean) {
  const L = into("lens", scene);
  const z = 1 + g * 7;
  L.save();
  L.translate(cx, cy);
  if (!vertical) L.rotate(Math.PI / 2);
  L.scale(z, z);
  L.translate(-cx, -cy);
  L.globalCompositeOperation = "destination-in";
  L.fill(vesica(cx, cy, d, r));
  L.restore();
  paint(ctx, L);
  ctx.save();
  ctx.translate(cx, cy);
  if (!vertical) ctx.rotate(Math.PI / 2);
  ctx.scale(z, z);
  ctx.translate(-cx, -cy);
  ctx.strokeStyle = "#ffffff";
  ctx.globalAlpha = 1 - g;
  ctx.lineWidth = 3 / z;
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 16 * scale();
  ctx.stroke(vesica(cx, cy, d, r));
  ctx.restore();
}

export function renderFrame(ctx: Ctx, t: number) {
  if (t < 0) return drawFigTest(ctx, -t);

  // ---- 1–8: the prologue (ends by diving into the page of Genesis = Hagar's desert) ----
  if (t < PT.end) return drawPrologue(ctx, t);
  // ---- 9–13: Hagar (ends in white) ----
  if (t < E(13) + 0.35) return drawHagar(ctx, t);
  // ---- 14–16a: the paradox in the sky ----
  const tP = Wd(16, "خیلی");
  if (t < tP) return drawSky(ctx, t);

  // ---- 16b: three prophets in portals → they merge → the throne vision ----
  const tMerge = Wd(16, "چی") - 1.0, tOpen = Wd(16, "چی") + 0.2, tFull = tOpen + 1.1;
  if (t < tFull) {
    stage(ctx, t);
    const eSky = k(t, tP, tP + 1.2, ease.inOut);
    const skyAway = k(t, Wd(16, "اشعیا،") - 0.5, Wd(16, "اشعیا،") + 0.4, ease.inOut); // stays until the first prophet appears
    morph(ctx, "p-sky", (c) => drawSky(c, t), eSky, lerp(960, 960, skyAway), lerp(520, -260, skyAway), 210, FOCUS.sky, t, 3);
    const merge = k(t, tMerge, tOpen, ease.inOut);
    const xs = [1400, 960, 520].map((x) => lerp(x, 960, merge)); // read right → left
    const draws: Draw[] = [(c) => drawIsaiah(c, t), (c) => drawEzekiel(c, t), (c) => drawDaniel(c, t)];
    const t0s = [Wd(16, "اشعیا،"), Wd(16, "حزقیال"), Wd(16, "دانیال،")].map((x) => x - 0.15);
    const fade = 1 - k(t, tOpen - 0.4, tOpen);
    for (let i = 0; i < 3; i++) pop(ctx, "p-pr" + i, draws[i], t, t0s[i], xs[i], 500, 200, FOCUS.prophet, 11 + i, i === 1 ? 1 : fade);
    const names = ["اشعیا", "حزقیال", "دانیال"];
    for (let i = 0; i < 3; i++) label(ctx, names[i], xs[i], 770, t, t0s[i] + 0.2, k(t, tMerge - 0.3, tMerge + 0.3));
    // the merged portal opens into what they saw
    if (t > tOpen - 0.6) {
      const e = 1 - k(t, tOpen, tFull, ease.inOut);
      const a = k(t, tOpen - 0.6, tOpen);
      morph(ctx, "p-throne", (c) => drawThroneRoom(c, t), e, 960, 500, 200, FOCUS.throne, t, 12, a);
    }
    return finish(ctx, t);
  }
  if (t < S(17)) return drawThroneRoom(ctx, t);

  // ---- 17: «the one on the throne and the angel… the same?» → the two portals overlap → Horeb ----
  if (t < S(18) + 1.4) {
    stage(ctx, t);
    const e = k(t, S(17), S(17) + 1.1, ease.inOut);
    const join = k(t, Wd(17, "یه") - 0.2, Wd(17, "نفرن؟") + 0.6, ease.inOut);
    const xr = lerp(1280, 1050, join), xl = lerp(640, 870, join); // throne first (right), angel (left)
    morph(ctx, "g-throne", R.throne(t, S(17)), e, xr, 520, 230, FOCUS.throne, t, 21);
    pop(ctx, "g-angel", R.sky(t, S(17)), t, Wd(17, "فرشته‌ی") - 0.2, xl, 520, 230, FOCUS.sky, 22);
    label(ctx, "تختِ آسمان", xr, 800, t, S(17) + 0.8, join);
    label(ctx, "فرشته‌ی یَهوه", xl, 800, t, Wd(17, "فرشته‌ی") + 0.2, join);
    // the lens where they overlap glows, then opens onto Horeb
    const glowK = win(t, Wd(17, "نفرن؟") - 0.2, Wd(17, "نفرن؟") + 0.6, S(18), S(18) + 0.4);
    if (join > 0.5) {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = glowK * 0.7;
      ctx.translate(960, 520);
      ctx.rotate(Math.PI / 2);
      ctx.translate(-960, -520);
      ctx.fillStyle = "#ffffff";
      ctx.fill(vesica(960, 520, (xr - xl) / 2, 230));
      ctx.restore();
    }
    if (t > S(18) - 0.2) lensReveal(ctx, t, (c) => drawHoreb(c, t), k(t, S(18) - 0.2, S(18) + 1.4, ease.in), 960, 520, (xr - xl) / 2, 230, false);
    return finish(ctx, t);
  }
  // ---- 18–20a: Horeb ----
  const tLater = Wd(20, "بعدتر");
  if (t < tLater) return drawHoreb(ctx, t);
  // ---- 20b–21: bush → pillar → tabernacle portals; the tabernacle opens; inside: the throne room on earth ----
  const tTab = Wd(21, "خیمه‌ی");
  const tHoly = Wd(21, "تالارِ") - 0.8;
  if (t < tHoly + 0.9) {
    stage(ctx, t);
    const e = k(t, tLater, tLater + 1.2, ease.inOut);
    const focus = k(t, tTab - 0.1, tTab + 1.2, ease.inOut);
    const away = 1 - k(t, tTab - 0.1, tTab + 0.7);
    morph(ctx, "j-horeb", (c) => drawHoreb(c, t), e, lerp(1420, 2220, focus), 500, 210, FOCUS.horeb, t, 31, away);
    pop(ctx, "j-exo", (c) => drawExodus(c, t), t, Wd(20, "اسرائیل") - 0.2, lerp(960, 960, focus), lerp(500, 1400, focus), 210, FOCUS.exodus, 32, away);
    label(ctx, "بوته‌ی سوزان", 1420, 770, t, tLater + 1.0, 1 - away);
    label(ctx, "ستونِ ابر و آتش", 960, 770, t, Wd(20, "ستونِ") - 0.1, 1 - away);
    label(ctx, "خیمه‌ی عبادت", 500, 770, t, Wd(20, "خیمه‌ی") + 0.2, focus);
    // the tabernacle: born small, then it fills the frame
    const tb0 = Wd(20, "خیمه‌ی") - 0.2;
    if (t < tTab - 0.1) pop(ctx, "j-tab", (c) => drawTabernacle(c, t), t, tb0, 500, 500, 210, FOCUS.tab, 33);
    else morph(ctx, "j-tab", (c) => drawTabernacle(c, t), 1 - focus, 500, 500, 210, FOCUS.tab, t, 33);
    // into the tent: cross-zoom to the holy place
    if (t > tHoly) {
      const g = k(t, tHoly, tHoly + 0.9, ease.inOut);
      const L = into("holy-in", (c) => drawHolyPlace(c, t));
      paint(ctx, L, g, "source-over");
    }
    return finish(ctx, t);
  }
  // ---- 21b–22a: the throne room on earth, then four portals gather into the royal glory ----
  const tRow = S(22) + 0.2;
  const tGlory = Wd(22, "جلالِ") - 0.3;
  if (t < tRow) return drawHolyPlace(ctx, t);
  const tHold = Wd(22, "حالا");
  if (t < tHold) {
    stage(ctx, t);
    const e = k(t, tRow, tRow + 1.1, ease.inOut);
    const merge = k(t, tGlory, tGlory + 1.0, ease.inOut);
    const X = [1500, 1140, 780, 420].map((x) => lerp(x, 960, merge)); // right → left
    const fade = 1 - k(t, tGlory + 0.6, tGlory + 1.1);
    pop(ctx, "l-hagar", R.hagar(t, tRow), t, tRow + 0.1, X[0], 500, 165, FOCUS.hagar, 41, fade);
    pop(ctx, "l-throne", R.throne(t, tRow), t, tRow + 0.3, X[1], 500, 165, FOCUS.throne, 42, fade);
    pop(ctx, "l-horeb", R.horeb(t, tRow), t, tRow + 0.5, X[2], 500, 165, FOCUS.horeb, 43, fade);
    morph(ctx, "l-holy", R.holy(t), e, X[3], 500, 165, FOCUS.holy, t, 44, fade);
    // what they all are: the glory in human form
    if (t > tGlory + 0.6) {
      const eg = 1 - k(t, tGlory + 0.9, tGlory + 2.0, ease.inOut);
      morph(ctx, "l-glory", (c) => drawGlory(c, t), eg, 960, 500, 165, FOCUS.glory, t, 45, k(t, tGlory + 0.6, tGlory + 0.9));
    }
    if (eRow(t, tRow, tGlory)) {
      const lo = k(t, tGlory - 0.3, tGlory + 0.2);
      label(ctx, "هاجر", X[0], 720, t, tRow + 0.5, lo);
      label(ctx, "تخت", X[1], 720, t, tRow + 0.7, lo);
      label(ctx, "بوته", X[2], 720, t, tRow + 0.9, lo);
      label(ctx, "خیمه", X[3], 720, t, tRow + 1.1, lo);
    }
    return finish(ctx, t);
  }
  // ---- 22b–23: hold on to that → Jesus? ----
  const tWord = Wd(24, "انجیلِ") - 1.0;
  if (t < tWord + 1.2) {
    stage(ctx, t);
    const e = k(t, tHold, tHold + 1.2, ease.inOut);
    const fade = 1 - k(t, tWord, tWord + 0.7);
    morph(ctx, "m-glory", R.glory(t, tHold), e, 1260, 500, 230, FOCUS.glory, t, 51, fade);
    pop(ctx, "m-mount", R.mount(t, tHold), t, Wd(22, "عیسی.") - 0.1, 680, 500, 230, FOCUS.mount, 52, fade);
    label(ctx, "فرشته‌ی خداوند", 1260, 790, t, tHold + 1.0, 1 - fade);
    label(ctx, "عیسی", 680, 790, t, Wd(22, "عیسی.") + 0.3, 1 - fade);
    // «اون چه ربطی به این داستان داره؟»: a dashed thread of light tries to connect them, with a question on it
    const tl = Wd(23, "ربطی") - 0.4;
    if (t > tl) {
      const p = k(t, tl, tl + 0.9) * fade;
      ctx.save();
      inkLine(ctx, "#ffffff", 3, 12);
      ctx.setLineDash([14, 14]);
      ctx.lineDashOffset = -t * 30;
      ctx.globalAlpha = p;
      ctx.beginPath();
      ctx.moveTo(1150, 300);
      ctx.quadraticCurveTo(970, 120, 790, 300);
      ctx.stroke();
      ctx.restore();
      qmark(ctx, 970, 150, 0.8, k(t, tl + 0.5, tl + 1.3) * fade);
    }
    if (t > tWord) paint(ctx, into("m-word", (c) => drawWord(c, t)), k(t, tWord, tWord + 1.2, ease.inOut));
    return finish(ctx, t);
  }
  // ---- 24–25: the Word ----
  const tVil = S(26) + 1.2;
  if (t < tVil) return drawWord(ctx, t);
  if (t < tVil + 1.4) {
    drawWord(ctx, t);
    paint(ctx, into("o-vil", (c) => drawVillage(c, t)), k(t, tVil, tVil + 1.4, ease.inOut));
    return;
  }
  // ---- 26–27: the tent among us; «= the tabernacle»; people gather ----
  const tSplit = S(27) - 0.1, tBack = Wd(27, "حضورِ") - 0.6;
  if (t < tSplit) return drawVillage(ctx, t);
  if (t < tBack + 1.1) {
    stage(ctx, t);
    const e = k(t, tSplit, tSplit + 1.0, ease.inOut) * (1 - k(t, tBack, tBack + 1.1, ease.inOut));
    const fade = 1 - k(t, tBack, tBack + 0.6);
    pop(ctx, "p-tab", (c) => drawTabernacle(c, 219 + (t - tSplit) * 0.3), t, Wd(27, "خیمه‌ی") - 0.3, 660, 500, 230, FOCUS.tab, 61, fade);
    label(ctx, "خیمه‌ی عبادت", 660, 790, t, Wd(27, "خیمه‌ی"), 1 - fade);
    label(ctx, "=", 960, 500, t, Wd(27, "عبادت.") - 0.2, 1 - fade);
    morph(ctx, "p-vil", (c) => drawVillage(c, t), e, 1260, 500, 230, FOCUS.village, t, 62);
    return e > 0.001 ? finish(ctx, t) : undefined;
  }
  // ---- 28: the mountain (village → mountain through an organic window) ----
  const tM = Wd(28, "یه") - 0.4;
  if (t < tM) return drawVillage(ctx, t);
  const tTwo = S(29) + 0.1;
  if (t < tTwo) {
    if (t < tM + 1.6) {
      drawVillage(ctx, t);
      const g = k(t, tM, tM + 1.6, ease.inOut);
      const L = into("r-mount", (c) => drawMount(c, t));
      L.save();
      L.globalCompositeOperation = "destination-in";
      L.fill(blobPath({ x: 1500, y: 360, r: 40 + g * 1600, seed: 7, amp: 0.12, freq: 1.4, t: t * 0.2, sx: 1.1 }));
      L.restore();
      paint(ctx, L);
      return;
    }
    return drawMount(ctx, t);
  }
  // ---- 29–32: «God appearing like a human» / «God become human»; the name struck through; above the angels ----
  const tBig = Wd(33, "خدایی") - 1.2;
  if (t < tBig) {
    stage(ctx, t);
    const e = k(t, tTwo, tTwo + 1.1, ease.inOut);
    const leftAway = k(t, S(30) + 0.3, S(30) + 1.3, ease.inOut);
    const center = k(t, S(30) + 0.8, S(30) + 2.0, ease.inOut);
    const up = k(t, Wd(32, "نمی‌خواستن") - 0.2, Wd(32, "خیال") + 0.4, ease.inOut);
    const rise = k(t, Wd(32, "از", 0) - 0.4, Wd(32, "برتره.") + 0.4, ease.inOut);
    const jx = lerp(lerp(640, 700, center), 960, up), jy = lerp(lerp(500, 500, center), lerp(400, 330, rise), up);
    const jr = lerp(240, 200, up);
    pop(ctx, "s-angel", R.hagar(t, tTwo), t, Wd(29, "فرشته‌ی") - 0.3, lerp(1280, 2220, leftAway), 500, 240, FOCUS.hagar, 71, 1 - leftAway);
    label(ctx, "خدا، شبیهِ انسان", 1280, 800, t, Wd(29, "خدا") - 0.1, leftAway);
    // «عیسی خودِ یَهوه بود»: a crown of rays (the glory of the throne) opens around his portal
    const tg = Wd(33, "خودِ") - 0.4;
    if (t > tg) gloryRays(ctx, jx, jy, jr, k(t, tg, tg + 1.0), t);
    morph(ctx, "s-mount", R.mount(t, tTwo), e, jx, jy, jr, FOCUS.mount, t, 72);
    label(ctx, "خدا، انسان‌شده", 640, 800, t, Wd(29, "خداست") - 0.1, center);
    // «… و عیسی، خداست که انسان شده»: an arrow of light from the angel's portal to Jesus' portal
    const ta = Wd(29, "عیسی،") - 0.3;
    if (t > ta) {
      const p = k(t, ta, ta + 0.9) * (1 - leftAway);
      ctx.save();
      inkLine(ctx, "#ffffff", 4, 14);
      ctx.globalAlpha = 1 - leftAway;
      const pts: [number, number][] = Array.from({ length: 40 }, (_, i) => { const u = i / 39; return [lerp(1180, 740, u), 270 - Math.sin(u * Math.PI) * 110]; });
      partial(ctx, pts, 0, p);
      if (p > 0.95) {
        ctx.beginPath();
        ctx.moveTo(740 + 26, 270 - 16);
        ctx.lineTo(740, 270);
        ctx.lineTo(740 + 30, 270 + 10);
        ctx.stroke();
      }
      ctx.restore();
    }
    // «توی عهدِ جدید»: the New Testament opens; the name will appear under it and be struck through
    const tn = Wd(30, "عهدِ") - 0.3;
    if (t > tn) {
      const bo = ease.outBack(clamp((t - tn) / 0.6), 1.3) * (1 - k(t, S(31) + 0.5, S(31) + 1.2));
      if (bo > 0.01) {
        book(ctx, 1340, 400, 0.7 * bo, k(t, tn + 0.3, tn + 1.0), 0, 0.3);
        title(ctx, [{ s: "عهدِ جدید", f: "MorabbaBold" }], 1340, 560, { size: 44, k: k(t, tn + 0.4, tn + 1.0), out: k(t, S(31) + 0.4, S(31) + 1.0) });
      }
    }
    strikeName(ctx, t, 1340, 690);
    // «چرا؟»
    qmark(ctx, 1640, 430, 1.0, k(t, S(31) - 0.1, S(31) + 0.6) * (1 - k(t, S(32) + 0.6, S(32) + 1.2)));
    angelsRow(ctx, t);
    title(ctx, [{ s: "عبرانیان ۱", f: "MorabbaLight" }], 960, 90, { size: 36, k: k(t, Wd(32, "عبرانیان") - 0.2, Wd(32, "عبرانیان") + 0.6), out: k(t, E(32) + 0.4, E(32) + 1.0), glow: 10 });
    return finish(ctx, t);
  }
  // ---- 33: the portal opens into the finale ----
  if (t < tBig + 2.2) {
    stage(ctx, t);
    const g = k(t, tBig, tBig + 2.2, ease.inOut);
    const drawBoth: Draw = (c) => {
      R.mount(t, tTwo)(c);
      paint(c, into("t-final", (cc) => drawFinal(cc, t)), clamp(g * 1.6 - 0.3));
    };
    // the rays fade as the portal opens
    gloryRays(ctx, 960, 330, 200, 1 - k(t, tBig, tBig + 0.8), t);
    morph(ctx, "t-j", drawBoth, 1 - g, 960, 330, 200, FOCUS.mount, t, 72);
    return finish(ctx, t);
  }
  drawFinal(ctx, t);
}
const eRow = (t: number, a: number, b: number) => t > a && t < b + 1.0;
/** a slowly turning crown of rays around a portal (the throne's glory) */
function gloryRays(ctx: Ctx, x: number, y: number, r: number, a: number, t: number) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  glow(ctx, x, y, r * 1.9, "#fff2d8", 0.4 * a);
  ctx.translate(x, y);
  ctx.rotate(t * 0.05);
  for (let i = 0; i < 40; i++) {
    const ang = (i / 40) * Math.PI * 2;
    const len = r * (0.35 + 0.3 * (0.5 + 0.5 * Math.sin(i * 5.3 + t * 0.8))) * ease.out(a);
    ctx.strokeStyle = `rgba(255,244,220,${(0.5 * a).toFixed(3)})`;
    ctx.lineWidth = i % 3 ? 2 : 4;
    ctx.beginPath();
    ctx.moveTo(Math.cos(ang) * (r + 18), Math.sin(ang) * (r + 18));
    ctx.lineTo(Math.cos(ang) * (r + 18 + len), Math.sin(ang) * (r + 18 + len));
    ctx.stroke();
  }
  ctx.restore();
}