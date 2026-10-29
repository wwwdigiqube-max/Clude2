// Video 23 · word-by-word captions. Chunks = word-index ranges of words.json; display text fixes the transcript's
// Latin spellings (character → کاراکتر …). Keywords light up in the accent colour.
import React from "react";
import { C, E, FA, S, WD, ease, ramp } from "./lib";

const CHUNKS: [number, number][] = [
  [0, 6], [7, 15], [16, 20], [21, 25], [26, 34], [35, 40], [41, 50], [51, 57], [58, 62], [63, 68], [69, 74], [75, 79], [80, 87],
  [88, 94], [95, 103], [104, 110], [111, 115], [116, 119], [120, 124], [125, 130], [131, 136], [137, 141], [142, 150], [151, 158],
  [159, 163], [164, 169], [170, 177], [178, 183], [184, 192], [193, 197], [198, 204], [205, 209], [210, 215], [216, 221], [222, 227],
  [228, 233], [234, 237], [238, 242], [243, 246], [247, 254], [255, 258], [259, 265], [266, 271], [272, 276], [277, 284], [285, 291],
  [292, 297], [298, 300], [301, 308], [309, 313],
];
const FIX: Record<number, string> = {
  0: "کل اینستاگرام", 7: "50%", 15: "میشه", 18: "خانومه", 20: "ببین", 22: "کاراکتر", 29: "ریلز", 33: "فالوور", 40: "می‌فروشه", 56: "سابسکرایب", 57: "داره",
  6: "مصنوعی", 74: "شده", 87: "کنی", 103: "بدم", 128: "کاراکتری", 136: "بسازید", 154: "اینکه", 155: "", 169: "کنید", 171: "ریلز", 177: "کرده",
  183: "آسونه", 192: "گرفته", 194: "می‌کنم،", 197: "Claude", 221: "می‌کنه", 234: "ریلزهای", 246: "کنه", 276: "کنید", 291: "نمیشه", 302: "کلمه‌ی", 303: "«شروع»", 308: "بفرستی", 310: "رأس", 161: "Google Flow", 162: "",
};
const KEY = new Set([7, 13, 24, 30, 31, 46, 47, 53, 54, 61, 71, 85, 91, 92, 94, 100, 110, 119, 123, 124, 128, 134, 147, 148, 158, 165, 167, 171, 173, 175, 189, 190, 191, 199, 201, 207, 216, 220, 225, 229, 230, 235, 241, 251, 252, 256, 264, 269, 271, 273, 290, 297, 303, 309, 312, 313]);
const DARK: [number, number][] = [[0, 7.6], [16.1, 21.6], [37.25, 49.5], [89.3, 92.3]];
/** caption block top (vertical reel: above the Instagram UI, below the main visual area y ≈ 150–1260) */
export const CAP_Y = 1300;
const PERSIAN = /[؀-ۿ]/;

export const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t > 112.3) return null; // the end card carries the date itself
  const ci = CHUNKS.findIndex(([a, b], i) => {
    const next = CHUNKS[i + 1];
    const end = next ? Math.min(E(b) + 0.6, S(next[0]) - 0.05) : E(b) + 0.8;
    return t >= S(a) - 0.08 && t < end;
  });
  if (ci < 0) return null;
  const [a, b] = CHUNKS[ci];
  const dark = DARK.some(([x, y]) => t >= x && t < y);
  const words = [];
  for (let i = a; i <= b; i++) {
    const txt = FIX[i] ?? WD[i].w;
    if (!txt) continue;
    words.push({ i, txt });
  }
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: CAP_Y, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", rowGap: 4, columnGap: 14, maxWidth: 940, direction: "rtl", padding: "12px 28px", borderRadius: 22, background: dark ? "rgba(0,0,0,.62)" : "rgba(239,237,230,.86)", backdropFilter: "blur(6px)" }}>
        {words.map(({ i, txt }) => {
          const k = ease.out(ramp(t, S(i) - 0.06, S(i) + 0.14));
          const key = KEY.has(i);
          const col = key ? (dark ? C.neon : C.green) : dark ? "#fff" : C.ink;
          return (
            <span key={i} style={{ fontFamily: FA, fontWeight: key ? 900 : 700, fontSize: 50, color: col, opacity: k, transform: `translateY(${(1 - k) * 10}px)`, display: "inline-block", whiteSpace: "nowrap", direction: /[A-Za-z0-9]/.test(txt) && !PERSIAN.test(txt) ? "ltr" : "rtl" }}>{txt}</span>
          );
        })}
      </div>
    </div>
  );
};
