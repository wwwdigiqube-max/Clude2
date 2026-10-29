// STARTER — a complete two-voice documentary in this style, built only from the generic parts (any topic).
// Script: starter/lines.json («why is the night sky dark?», 6 lines: A explains, B asks). Timing: vo-sample.json —
// the same shape tools/doc-build-vo.mjs writes, so this file works unchanged on real voices.
// To start a new video: copy this file to src/<slug>/Video.tsx, then
//   1) "../index" → "../styles/documentary"   2) "./vo-sample.json" → "./vo.json"   3) rewrite the scenes below.
// Pattern: one function per place (a pure function of t), a director that picks the place, and every time from the
// dialogue: C.S(n) line start · C.E(n) line end · C.W(n, "word") word onset. Never a bare number of seconds.
import React from "react";
import {
  bloom, Cam, Ctx, DocCanvas, ease, eyeGlyph, F, finish, godRays, H, k, label, landscape, layer, lerp, lightCore,
  linePts, makeCues, mixMood, mixPose, Mood, MOODS, morph, partial, person, POSE, qmark, quiet, scale, stage, STAND,
  title, VoJson, W,
} from "../index";
import VO from "./vo-sample.json";

const C = makeCues(VO as VoJson);
export const STARTER_FRAMES = C.FRAMES;

/** a custom mood for one idea: the sky as bright as the sun (line 3) */
const BLAZE: Mood = {
  ...MOODS.night, sky: ["#ffe2a8", "#fff2d4", "#ffffff"], ranges: ["#6a5468", "#433248", "#24182c"], haze: "#fff0d0", hazeA: 0.55,
  ground: ["#3a2a3c", "#120a16"], rim: "#ffffff", light: { kind: "sun", x: 960, y: 380, color: "#fff4d8", rays: 1.4 }, stars: 0, cloudA: 0, windows: 0.2, vig: "#2a1a10",
};

/** lines 1–4 and 6: a city at dusk turning to night; a person looks up; the sky fills with stars, blazes, goes dark */
function nightCity(c: Ctx, t: number) {
  const toNight = k(t, C.S(1), C.W(1, "سیاهه") + 0.6, ease.inOut);
  const more = k(t, C.W(3, "پر") - 0.2, C.W(3, "می‌رسید؛") + 0.4, ease.in); // stars multiply
  const blaze = k(t, C.W(3, "مثل") - 0.2, C.W(3, "خورشید") + 0.6, ease.inOut) * (1 - k(t, C.S(4) - 0.3, C.S(4) + 0.4)); // …then snap back
  const up = k(t, C.S(2), C.S(3) + 1.5, ease.inOutSine) * (1 - 0.6 * k(t, C.S(4), C.S(4) + 2, ease.inOutSine)); // camera tilts to the sky
  const cam: Cam = { x: 960 + 25 * Math.sin(t * 0.05), y: lerp(560, 440, up), z: 1 + 0.06 * k(t, 0, C.S(2)) };
  const sky: Mood = { ...MOODS.night, stars: 1 + 6 * more };
  landscape(c, t, cam, { mood: "dusk", to: [blaze > 0 ? mixMood(sky, BLAZE, blaze) : sky, toNight], city: 0.6, trees: 0.25 }, (cc, _lit, L) => {
    let pose = mixPose(STAND, POSE.lookUp, k(t, C.W(1, "نگاه") - 0.3, C.W(1, "نگاه") + 1, ease.inOutSine));
    pose = mixPose(pose, POSE.shield, blaze);
    person(cc, L, { x: 1040, h: 320, face: -1, pose, t });
  });
  // what is said, on the word it is said (titles switch themselves off inside portals)
  title(c, [{ s: "چرا شب", f: F.light }, { s: "تاریک", f: F.heavy }, { s: "است؟", f: F.light }], 960, 150, { size: 72, k: k(t, 0.3, 1.3), out: k(t, C.W(1, "سیاهه"), C.W(1, "سیاهه") + 0.6), shade: 0.4 });
  const q = k(t, C.W(2, "کجاش") - 0.1, C.W(2, "عجیبه") + 0.5), qo = k(t, C.E(2) + 0.2, C.E(2) + 0.8);
  if (q > 0 && qo < 1) {
    c.save();
    c.globalAlpha = 1 - qo;
    qmark(c, 1480, 250, 1.5, q);
    c.restore();
  }
  title(c, [{ s: "اگر جهان", f: F.light }, { s: "بی‌نهایت", f: F.heavy }, { s: "بود…", f: F.light }], 960, 150, { size: 64, k: k(t, C.W(3, "بی‌نهایت") - 0.2, C.W(3, "بی‌نهایت") + 0.6), out: k(t, C.W(3, "مثل") - 0.4, C.W(3, "مثل")), shade: 0.4 });
  title(c, [{ s: "آسمان", f: F.light }, { s: "روشن مثل خورشید", f: F.heavy }], 960, 150, { size: 64, k: k(t, C.W(3, "خورشید") - 0.2, C.W(3, "خورشید") + 0.6), out: k(t, C.S(4) - 0.3, C.S(4) + 0.2), shade: 0.3 });
  const eye = k(t, C.W(4, "سرنخه") - 0.4, C.W(4, "سرنخه") + 0.6, ease.out);
  if (eye > 0.001) eyeGlyph(c, 960, 330, 190, eye, 1 - k(t, C.E(4) + 0.2, C.E(4) + 0.8)); // closed = a flat line: guard
  title(c, [{ s: "تاریکی،", f: F.light }, { s: "یک سرنخ", f: F.heavy }], 960, 150, { size: 64, k: k(t, C.W(4, "سرنخه") - 0.2, C.W(4, "سرنخه") + 0.6), out: k(t, C.E(4) + 0.2, C.E(4) + 0.8), shade: 0.4 });
  title(c, [{ s: "نگاه به", f: F.light }, { s: "جوانیِ جهان", f: F.heavy }], 960, 150, { size: 64, k: k(t, C.W(6, "جوونیِ") - 0.2, C.W(6, "جوونیِ") + 0.6), shade: 0.4 });
}

/** line 5: our night shrinks into a portal (left); the beginning is born on the right; its light travels toward us
 *  and has not arrived yet (right → left = the order things happen) */
function origin(c: Ctx, t: number) {
  stage(c, t);
  const lit = layer("starter-lit", 0.5);
  const born = k(t, C.W(5, "شروع") - 0.3, C.W(5, "شروع") + 0.9, ease.out);
  godRays(c, t, 1450, 500, { n: 26, len: 420 * born, spread: Math.PI * 2, dir: 0, color: "#fff0d8", alpha: 0.2 * born, width: 0.06, spin: 0.02, seed: 4, soft: 10 });
  lightCore(c, lit, 1450, 500, 110 * born, born, "#ffe8c0", t);
  const go = 0.66 * k(t, C.W(5, "نورِ") - 0.2, C.W(5, "نرسیده.") + 0.4, ease.out); // stops two thirds of the way
  c.save();
  c.strokeStyle = "#fff2dc";
  c.lineCap = "round";
  c.shadowColor = "#ffe6c0";
  c.shadowBlur = 14 * scale();
  for (let i = 0; i < 5; i++) {
    c.lineWidth = i === 2 ? 4 : 2;
    c.globalAlpha = 0.9 - Math.abs(i - 2) * 0.15;
    partial(c, linePts(1450, 500, 1050, 470 + i * 14, 640, 505 + (i - 2) * 6), Math.max(0, go - 0.22), go);
  }
  c.restore();
  const e = k(t, C.S(5) - 0.4, C.S(5) + 0.7, ease.inOut) * (1 - k(t, C.S(6) - 0.6, C.S(6) + 0.5, ease.inOut));
  morph(c, "starter-us", quiet((cc) => nightCity(cc, t)), e, 470, 520, 200, { cx: 1040, cy: 760, crop: 520 }, t, 7);
  const lo = k(t, C.S(6) - 0.9, C.S(6) - 0.4);
  label(c, "آغاز", 1450, 760, t, C.W(5, "شروع"), lo);
  label(c, "ما", 470, 790, t, C.S(5) + 0.6, lo);
  bloom(c, lit, 1, 46);
  finish(c, t);
}

export function starterFrame(c: Ctx, t: number) {
  if (t > C.S(5) - 0.4 && t < C.S(6) + 0.5) origin(c, t);
  else nightCity(c, t);
  const fo = k(t, C.TOTAL - 1.6, C.TOTAL - 0.2, ease.in);
  if (fo > 0.001) {
    c.save();
    c.globalAlpha = fo;
    c.fillStyle = "#000";
    c.fillRect(-10, -10, W + 20, H + 20);
    c.restore();
  }
}
/** register: <Composition id="MyDoc" component={StarterVideo} durationInFrames={STARTER_FRAMES} fps={30} width={1920} height={1080} />
 *  with sound: pass audio="my-doc/mix-norm.wav" to DocCanvas; stills: defaultProps={{ times: [2, 8, 14, 20, 25, 31] }} */
export const StarterVideo: React.FC<{ times?: number[] }> = ({ times }) => <DocCanvas render={starterFrame} times={times} />;
