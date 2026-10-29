// Style-Documentary: a 37-second two-voice mini documentary built only from the style's parts — use it as the
// starting template. Timing comes from demo-vo.json exactly as a real project's vo.json (tools/doc-build-vo.mjs);
// the demo is silent (no voices shipped): pass `audio` to DocCanvas once you have a mix.
//   line 1 A  «توی صحرا، زنی تنها کنار چشمه نشسته.»      → desert at dusk, a woman alone by the spring
//   line 2 B  «و بعد چی شد؟»                               → she looks up; a window of light opens
//   line 3 A  «یه پیکر نورانی ظاهر شد و باهاش حرف زد.»     → the figure of light; she kneels, reaches out
//   line 4 B  «این همون فرشته بود؟»                        → the desert shrinks into a portal; two more pop in
//   line 5 A  «پیامبرها همین پیکر رو روی تخت دیدن.»        → the portals merge and open on the throne room
//   line 6 B  «پس خدا خودش رو نشون می‌ده؟»                → cross-fade to the royal glory
//   line 7 A  «آره؛ جلالِ خدا، به شکلِ یک انسان.»           → titles, fade out
import React from "react";
import { makeCues, VoJson } from "./cues";
import { DocCanvas } from "./DocCanvas";
import { applyCam, bloom, Cam, Ctx, H, layer, paint, W } from "./engine/canvas";
import { castShadow } from "./engine/depth";
import { figure, mixPose } from "./engine/figure";
import { grain, motes, vignette } from "./engine/fx";
import { lightBeing } from "./engine/light";
import { ease, k, lerp, mixHex } from "./engine/math";
import { stage } from "./engine/portal";
import { blobPath } from "./engine/shape";
import { F, title } from "./engine/text";
import { POSE } from "./poses";
import { finish, into, label, morph, pop, quiet } from "./transitions";
import { desert, DESERT_SPOTS } from "./worlds/desert";
import { gloryScene } from "./worlds/glory";
import { fire, nightRange } from "./worlds/night";
import { throneRoom } from "./worlds/throne";
import VO from "./demo-vo.json";

const C = makeCues(VO as VoJson);
export const DOC_DEMO_FRAMES = C.FRAMES;
const mixCam = (a: Cam, b: Cam, e: number): Cam => ({ x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e), z: lerp(a.z, b.z, e) });

/** lines 1–3: the desert; a window of heaven opens and the figure of light stands in it */
function desertWorld(c: Ctx, t: number) {
  const cam = mixCam({ x: 960 + 30 * Math.sin(t * 0.05), y: 560, z: 1 + 0.04 * k(t, 0, C.S(2)) }, { x: 1100, y: 620, z: 1.25 }, k(t, C.S(3) - 0.5, C.S(3) + 2.5, ease.inOutSine));
  const g = k(t, C.W(2, "چی") - 0.2, C.W(3, "ظاهر") + 1.2, ease.inOut); // the window grows to fill the frame
  const lit = layer("demo-lit", 0.5);
  if (g < 0.999) desert(c, t, cam, 0);
  if (g > 0.001) {
    const L = layer("demo-heaven");
    desert(L, t, cam, 1);
    L.save();
    applyCam(L, cam);
    lightBeing(L, lit, { ...DESERT_SPOTS.being, t, k: k(t, C.W(3, "پیکر") - 0.4, C.W(3, "پیکر") + 1.2), face: -1, warm: 0.15 });
    if (g < 0.999) {
      L.globalCompositeOperation = "destination-in";
      L.fill(blobPath({ x: lerp(1360, 1080, g), y: lerp(520, 560, g), r: lerp(90, 1750, ease.in(g)), seed: 4, amp: 0.1, freq: 1.4, t: t * 0.15, sy: 1.1 }));
    }
    L.restore();
    paint(c, L);
  }
  // the woman: sitting alone → looks up → kneels → reaches out; her shadow follows the light
  c.save();
  applyCam(c, cam);
  const s = DESERT_SPOTS.sitter;
  let pose = mixPose(POSE.sitHug, POSE.sitUp, k(t, C.W(2, "بعد") - 0.3, C.W(2, "بعد") + 1.3, ease.inOutSine));
  pose = mixPose(pose, POSE.kneel, k(t, C.W(3, "حرف") - 0.6, C.W(3, "حرف") + 0.4, ease.inOutSine));
  pose = mixPose(pose, POSE.reach, k(t, C.W(3, "حرف") + 0.3, C.W(3, "حرف") + 1.4, ease.inOutSine));
  const f = { x: s.x, y: s.y, h: s.h, face: 1 as const, pose, t, head: "veil" as const, wind: 0.35, seed: 3 };
  castShadow(c, f, 600, 1.5, 0.4 * (1 - g), "#1e0e1a", 0.16, 5);
  castShadow(c, f, DESERT_SPOTS.being.x, 0.9, 0.5 * g, "#2a1838", 0.2, 7);
  figure(c, f, { base: mixHex("#3a2434", "#4a3858", g), base2: mixHex("#22141e", "#2a1f38", g), rim: mixHex("#ffb27a", "#efe6ff", g), rimW: 4 + 3 * g, light: [lerp(-1, 1, g), lerp(-0.25, -0.5, g)] });
  c.restore();
  motes(c, t, { n: 40, color: mixHex("#ffd6a8", "#ffffff", g), alpha: 0.45, seed: 21, speed: 0.35, dust: true });
  bloom(c, lit, 0.9, 50);
  vignette(c, 0.42, "#140a16");
  title(c, [{ s: "کنارِ", f: F.light }, { s: "چشمه", f: F.heavy }], 250, 160, { size: 64, k: k(t, C.W(1, "چشمه") - 0.2, C.W(1, "چشمه") + 0.6), out: k(t, C.E(1) + 0.6, C.E(1) + 1.2), align: "left", shade: 0.3 });
  title(c, [{ s: "پیکری", f: F.light }, { s: "نورانی", f: F.heavy }], 250, 160, { size: 64, k: k(t, C.W(3, "نورانی") - 0.2, C.W(3, "نورانی") + 0.6), out: k(t, C.E(3) + 0.3, C.E(3) + 0.9), align: "left", shade: 0.3 });
  grain(c, t, 0.15);
}
/** a night on the mountain: fire in a bush, a figure of light inside it, a man kneeling with his face hidden */
function nightWorld(c: Ctx, t: number) {
  const lit = nightRange(c, t, { x: 1100, y: 600, z: 1.12 }, 1); // leaves the camera applied
  fire(c, lit, 1380, 744, 1.35, t, 1, 3);
  lightBeing(c, lit, { x: 1380, y: 730, h: 230, t, k: 0.75, warm: 1, rays: 0.8, aura: 0.6, face: -1 });
  const f = { x: 1180, y: 860, h: 330, face: 1 as const, pose: POSE.kneelHide, t, head: "wrap" as const, beard: true, seed: 91 };
  castShadow(c, f, 1380, 1.3, 0.55, "#0a0812", 0.2, 6);
  figure(c, f, { base: "#2a2850", base2: "#12102a", rim: "#ffc488", rimW: 7, light: [1, -0.4] });
  c.restore();
  bloom(c, lit, 1, 46);
  vignette(c, 0.5, "#070612");
  grain(c, t, 0.15);
}

export function demoFrame(c: Ctx, t: number) {
  // ---- lines 1–3 ----
  const tP = C.S(4) - 0.4;
  if (t < tP) return desertWorld(c, t);
  // ---- lines 4–5: portals in a row (read right → left), they merge, the last opens on the throne room ----
  const tM = C.W(5, "همین") - 0.3, tO = C.W(5, "تخت") - 0.1, tF = tO + 1.3;
  if (t < tF) {
    stage(c, t);
    const e = k(t, tP, tP + 1.1, ease.inOut);
    const merge = k(t, tM, tO, ease.inOut);
    const xs = [1400, 960, 520].map((x) => lerp(x, 960, merge));
    const fade = 1 - k(t, tO - 0.5, tO);
    morph(c, "d-desert", quiet((cc) => desertWorld(cc, t)), e, xs[0], 500, 200, { cx: 1000, cy: 600, crop: 520 }, t, 3, fade);
    pop(c, "d-night", quiet((cc) => nightWorld(cc, t)), t, C.W(4, "همون") - 0.2, xs[1], 500, 200, { cx: 1260, cy: 690, crop: 460 }, 4, fade);
    if (t < tO) pop(c, "d-throne", (cc) => throneRoom(cc, t), t, C.W(4, "فرشته") - 0.1, xs[2], 500, 200, { cx: 960, cy: 560, crop: 500 }, 5);
    else morph(c, "d-throne", (cc) => throneRoom(cc, t), 1 - k(t, tO, tF, ease.inOut), 960, 500, 200, { cx: 960, cy: 560, crop: 500 }, t, 5);
    const lo = k(t, tM - 0.3, tM + 0.2);
    label(c, "صحرا", xs[0], 770, t, tP + 0.9, lo);
    label(c, "بوته‌ی سوزان", xs[1], 770, t, C.W(4, "همون") + 0.3, lo);
    label(c, "تخت", xs[2], 770, t, C.W(4, "فرشته") + 0.4, lo);
    return finish(c, t);
  }
  // ---- line 5 end: the throne room ----
  const tG = C.S(6) - 0.4;
  const throne = (cc: Ctx) => {
    throneRoom(cc, t);
    title(cc, [{ s: "پیکری پرشکوه،", f: F.light }, { s: "شبیهِ انسان", f: F.heavy }], 960, 110, { size: 56, k: k(t, tF - 0.6, tF + 0.2), out: k(t, tG - 0.3, tG + 0.3), shade: 0.45 });
    grain(cc, t, 0.14);
  };
  if (t < tG) return throne(c);
  // ---- lines 6–7: cross-fade to the royal glory ----
  const glory = (cc: Ctx) => {
    gloryScene(cc, t, k(t, tG, tG + 1.6), t - tG);
    title(cc, [{ s: "جلالِ", f: F.light }, { s: "خدا", f: F.heavy }], 960, 120, { size: 64, k: k(t, C.W(7, "جلالِ") - 0.2, C.W(7, "خدا،") + 0.4), shade: 0.45 });
    title(cc, [{ s: "به شکلِ", f: F.light }, { s: "یک انسان", f: F.heavy }], 960, 1000, { size: 52, k: k(t, C.W(7, "شکلِ") - 0.2, C.W(7, "انسان.") + 0.4), shade: 0.45 });
    grain(cc, t, 0.14);
  };
  if (t < tG + 1.3) {
    throne(c);
    paint(c, into("d-glory", glory), k(t, tG, tG + 1.3, ease.inOut));
  } else glory(c);
  const fo = k(t, C.TOTAL - 1.8, C.TOTAL - 0.2, ease.in);
  if (fo > 0.001) {
    c.save();
    c.globalAlpha = fo;
    c.fillStyle = "#000";
    c.fillRect(-10, -10, W + 20, H + 20);
    c.restore();
  }
}

export const DocumentaryDemo: React.FC<{ times?: number[] }> = ({ times }) => <DocCanvas render={demoFrame} times={times} />;
