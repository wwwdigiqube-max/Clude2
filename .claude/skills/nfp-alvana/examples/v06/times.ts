import words from "./words.json";

type W = { si: number; wi: number; w: string; s: number; e: number };
const WORDS = words as W[];
const w = (si: number, needle: string, nth = 0) => {
  const hits = WORDS.filter((x) => x.si === si && x.w.includes(needle));
  const h = hits[nth] ?? hits[0];
  if (!h) throw new Error(`word ${needle} not in ${si}`);
  return h.s;
};
export const S = (si: number) => WORDS.find((x) => x.si === si)!.s;

export const TM = {
  easier: w(0, "راحت‌تر"), problem: w(0, "مشکل"), serious: w(0, "جدیه"), price: w(0, "قیمت"), subs: w(0, "اشتراک"),
  vids: w(2, "ویدئو"),
  image: w(1, "تصویر"), video: w(1, "ویدئو"), audio: w(1, "صدا"),
  month: w(2, "ماه"), many: w(2, "چندتا", 1), separate: w(2, "جدا"), buy: w(2, "بخری"), renew: w(2, "تمدید"),
  search: w(3, "دنبال"), cost: w(3, "هزینه"), back: w(3, "رفت‌وآمد"), tools: w(3, "ابزارها"), remove: w(3, "حذف"),
  reached: w(4, "رسیدیم"), npv: w(4, "NPV"),
  stage: w(5, "مرحله"), apart: w(5, "جدا"), whole: w(5, "کل"), together: w(5, "یکجا"),
  idea: w(6, "ایده"), script: w(6, "سناریو"), shots: w(6, "شات"), sound: w(6, "صداگذاری"), edit: w(6, "ادیت"), output: w(6, "خروجی"), send: w(6, "ارسال"),
  complete: w(7, "کامل"), outputs: w(7, "خروجی"), wow: w(7, "جذابه"),
  soon: w(8, "به‌زودی"), worry: w(8, "دغدغه"), make: w(8, "بسازید"),
};
export const VOICE_END = WORDS.at(-1)!.e;
export const END = VOICE_END + 1.8;
export const fr = (s: number) => Math.round(s * 30);
