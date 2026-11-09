// Art Motion · ready Persian specs for the 8 explainer grammars (vertical 1080×1920 reels).
// Copy one, change the words and the timings (at = seconds; put each cue on the word it belongs to), render.
// Persian is RTL-aware (lib/fa.js); numbers stay Latin digits.
import type { ClipSpec } from "../clip";

const V = { fps: 30, width: 1080, height: 1920 } as const;
/** keep the bottom ~330px free for Instagram's caption/UI */
const SAFE = { top: 120, bottom: 330 };

export const SPEC_FLAT_COSMOS: ClipSpec = {
  grammar: "y1_kurzgesagt", duration: 9, ...V, safe: SAFE, theme: "navy",
  data: { center: "یک ریلز", center_style: { shape: "circle", ring: true } },
  cues: [
    { at: 0.2, kind: "title", text: "یک ریلز از چی ساخته شده؟" },
    { at: 1.2, kind: "point", text: "ایده" },
    { at: 1.8, kind: "point", text: "متن" },
    { at: 2.4, kind: "point", text: "صدا" },
    { at: 3.0, kind: "point", text: "تصویر" },
    { at: 4.0, kind: "highlight", data: { index: 3 } },
    { at: 5.3, kind: "enter", text: "تصویر", data: { index: 3 } },
    { at: 7.0, kind: "point", text: "رنگ" },
    { at: 7.6, kind: "point", text: "حرکت" },
  ],
};

export const SPEC_KINETIC: ClipSpec = {
  grammar: "y5_kinetic_type", duration: 8, ...V, safe: SAFE, theme: "poster",
  cues: [
    { at: 0.7, kind: "number", text: "سبک آماده در نسخه‌ی دو", data: { value: 63, suffix: " سبک" } },
    { at: 2.6, kind: "point", text: "قبلاً", sub: "هر ویدیو از صفر ساخته می‌شد", data: { label: "قبلاً", key: "از صفر" } },
    { at: 4.6, kind: "point", text: "حالا", sub: "یک سبک انتخاب کن و بساز", data: { label: "حالا", key: "انتخاب کن" } },
    { at: 6.4, kind: "highlight", data: { word: "حالا" } },
  ],
};

export const SPEC_WHITEBOARD: ClipSpec = {
  grammar: "y3_whiteboard", duration: 10, ...V, safe: SAFE, theme: "chalk",
  cues: [
    { at: 0, kind: "title", text: "یک هفته محتوا در سه قدم" },
    { at: 1.4, kind: "draw", text: "ایده", data: { icon: "bulb" } },
    { at: 2.4, kind: "point", text: "دوشنبه سه ایده بنویس" },
    { at: 3.9, kind: "draw", text: "ساخت", data: { icon: "screen" } },
    { at: 4.9, kind: "point", text: "سه‌شنبه با یک سبک آماده بساز" },
    { at: 6.4, kind: "draw", text: "انتشار", data: { icon: "check" } },
    { at: 7.4, kind: "point", text: "هر روز یکی را منتشر کن" },
    { at: 8.8, kind: "highlight", data: { index: 1 } },
  ],
};

export const SPEC_MATH: ClipSpec = {
  grammar: "t1_3b1b", duration: 10, ...V, safe: SAFE, theme: "ink",
  cues: [
    { at: 0, kind: "line", text: "خطا L(θ)", data: { values: [9, 5.8, 3.4, 1.8, 1, 0.8, 1, 1.8, 3.4, 5.8, 9], color: "BLUE_C" } },
    { at: 1.8, kind: "equation", data: { tokens: [{ s: "L", it: true, col: "BLUE_C" }, { s: "(", gap: 4 }, { s: "θ", it: true, col: "YELLOW", gap: 4 }, { s: ")" }] } },
    {
      at: 3.4,
      kind: "equation",
      data: { tokens: [{ s: "θ", it: true, col: "YELLOW" }, { s: "←", gap: 18 }, { s: "θ", it: true, col: "YELLOW", gap: 14 }, { s: "−", gap: 14 }, { s: "η", it: true, col: "GREEN_C", gap: 8 }, { s: "∇", gap: 4 }, { s: "L", it: true, col: "BLUE_C" }] },
    },
    { at: 5.0, kind: "point", text: "یک قدم کوچک، خلاف جهت شیب" },
    { at: 6.4, kind: "line", text: "خطا در حین آموزش", data: { values: [9, 6.2, 4.4, 3.2, 2.4, 1.9, 1.55, 1.3, 1.15, 1.05, 1], color: "TEAL_C" } },
    { at: 8.2, kind: "highlight", data: { target: "equation" } },
  ],
};

export const SPEC_KEYNOTE: ClipSpec = {
  grammar: "t2_keynote_ui", duration: 10, ...V, safe: SAFE,
  data: { eyebrow: "NFP-ALVANA", title: "نسخه‌ی دو آمد", subtitle: "سبک‌های تازه برای ساخت ویدیو" },
  cues: [
    { at: 0, kind: "title" },
    { at: 1.6, kind: "card", text: "36 سبک هنری", sub: "از نقاشی غار تا ون‌گوگ و نگارگری", data: { icon: "layers" } },
    { at: 3.0, kind: "card", text: "9 زبان توضیحی", sub: "تخته‌سفید، کلاژ، چارت، خوشنویسی…", data: { icon: "play" } },
    { at: 4.4, kind: "card", text: "فارسی، راست‌به‌چپ", sub: "متن و عدد سر جای خودشان", data: { icon: "check" } },
    { at: 7.0, kind: "number", text: "سبک آماده در کیت", data: { value: 63, suffix: " سبک", label: "روی هم" } },
  ],
};

export const SPEC_CHART: ClipSpec = {
  grammar: "t3_finance_chart", duration: 8, ...V, safe: SAFE, theme: "paper",
  data: {
    title: "کتابخانه‌ی سبک NFP بزرگ‌تر شد",
    unit: "تعداد سبک‌های آماده در هر نسخه",
    source: "منبع: تاریخچه‌ی نسخه‌های NFP-Alvana",
    chart: "bar",
    decimals: 0,
    series: [
      { label: "v1.0", value: 8 },
      { label: "v1.1", value: 9 },
      { label: "v1.2", value: 15 },
      { label: "v1.3", value: 18 },
      { label: "v2.0", value: 63 },
    ],
    highlight: { index: 4, text: "3.5 برابر", sub: "63 ÷ 18" },
  },
  cues: [
    { at: 0.3, kind: "bar", data: { index: [0, 1, 2, 3] } },
    { at: 2.4, kind: "bar", data: { index: 4 } },
    { at: 4.6, kind: "highlight" },
  ],
};

/** Vox collage: needs images — stills of the art pack (public/styles/art-motion/demo/) */
export const SPEC_COLLAGE: ClipSpec = {
  grammar: "y2_vox", duration: 9, ...V, safe: SAFE, theme: "wood",
  cues: [
    { at: 0, kind: "image", image: "styles/art-motion/demo/vangogh.jpg", text: "ون‌گوگ · 1889", data: { fit: "cover", focus: [0.4, 0.45] } },
    { at: 1.8, kind: "highlight", data: { rect: [0.37, 0.04, 0.12, 0.26] } },
    { at: 4.0, kind: "image", image: "styles/art-motion/demo/monet.jpg", text: "مونه · 1899", data: { fit: "cover", focus: [0.5, 0.45] } },
    { at: 6.4, kind: "title", text: "هر دو را کد کشیده، نه دست" },
  ],
};

/** Storytime: a character frame library (transparent PNGs, feet at the bottom centre). Here: the boy from the
 *  Claude videos; make your own with GPT Image (prompts in the card). */
const BOY = "styles/art-motion/demo/boy";
export const SPEC_STORYTIME: ClipSpec = {
  grammar: "y4_storytime", duration: 9, ...V, safe: SAFE, theme: "snow",
  data: {
    character: {
      frames: Object.fromEntries(["rest", "talk", "talk_open", "point", "point_open", "shrug", "shrug_open", "type", "react", "back"].map((p) => [p, `${BOY}/${p}.png`])),
    },
  },
  cues: [
    { at: 0.1, kind: "insert", text: "3000 خط", sub: "یه سایت برام بساز", data: { hit: 1.7, count: 3000, unit: "خط" } },
    { at: 3.0, kind: "react" },
    { at: 4.3, kind: "point", text: "اولین بار که از هوش مصنوعی کد خواستم…", sub: "اینا رو کجا بچسبونم؟", data: { pose: "point" } },
    { at: 7.0, kind: "highlight", data: { mark: "؟" } },
  ],
};

/** Animated calligraphy (NFP original): Persian verse written in Nastaliq on an illuminated manuscript page */
export const SPEC_CALLIGRAPHY: ClipSpec = {
  grammar: "fa_calligraphy", duration: 10, ...V, safe: SAFE,
  cues: [
    { at: 0.2, kind: "title", text: "از دیوان حافظ" },
    { at: 0.8, kind: "line", text: "دوش دیدم که ملائک\nدر میخانه زدند" },
    { at: 3.6, kind: "line", text: "گل آدم بسرشتند\nو به پیمانه زدند" },
    { at: 6.6, kind: "highlight", data: { word: "ملائک" } },
    { at: 7.4, kind: "sign", text: "— حافظ" },
  ],
};
