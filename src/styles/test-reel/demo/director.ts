// Test Reel demo director: which scene draws at time t, and r8's reel frame over everything. Each scene is born from
// the previous one (black water → black laptop screen, the toss → the meter, the flare → the montage, the phone →
// a card of the contact sheet, the schematic card → paper, the burnt paper → the last photo).
import { Ctx } from "../lib/canvas";
import { k } from "../lib/math";
import { reelFrame, setStyleMarks } from "../lib/overlay";
import { TOTAL } from "./cues";
import { seqA } from "./seq/a-night";
import { seqB } from "./seq/b-brain";
import { seqC } from "./seq/c-ink";
import { D2_END, D2_START, seqD2 } from "./seq/d2-room";
import { seqS6, T_BULBS } from "./seq/s6-gauge";
import { G2_BEATS, G2_START, seqG2 } from "./seq/g2-montage";
import { H0, seqH } from "./seq/h-droste";
import { seqS9, setMoments, SnapFn, warmSnaps } from "./seq/s9-sheet";
import { seqS10 } from "./seq/s10-schematic";
import { seqS11 } from "./seq/s11-end";

const T_B = 3.0, T_C = 15.75, T_S9 = 43.4, T_S10 = 50.1, T_S11 = 54.6;
const SHOT_NAMES = ["SILHOUETTE", "KINETIC", "NEGATIVE", "OBJECT", "X-RAY POP", "FRAME BY FRAME", "PARTICLES", "BOKEH"];
setStyleMarks([
  [0, "NIGHT STATIC"],
  [T_B, "NEURAL MAP"],
  [T_C, "INK & WATER"],
  [D2_START, "MIXED MEDIA"],
  [D2_END, "ANALOG"],
  [T_BULBS, "LIGHT GRID"],
  ...G2_BEATS.filter((b) => b < H0 - 0.01).slice(0, 8).map((b, i) => [b, SHOT_NAMES[i]] as [number, string]),
  [H0, "RECURSION"],
  [T_S9, "CONTACT SHEET"],
  [T_S10, "SCHEMATIC"],
  [T_S11, "CINEMA"],
]);
/** a little contact sheet, for the card that stands for the contact sheet itself */
const sheetIcon: SnapFn = (c) => {
  c.fillStyle = "#050505";
  c.fillRect(0, 0, 1080, 1920);
  for (let i = 0; i < 18; i++) {
    c.fillStyle = "#f2f2ee";
    c.fillRect(140 + (i % 3) * 290, 330 + Math.floor(i / 3) * 215, 230, 180);
  }
};
const shotAt = (i: number) => (G2_BEATS[i] ?? G2_START + i * 0.47) + 0.2;
setMoments([
  [seqA, 1.8, "NIGHT STATIC"],
  [seqB, 10.6, "NEURAL MAP"],
  [seqC, 19.4, "INK & WATER"],
  [seqD2, 26.6, "MIXED MEDIA"],
  [seqS6, 32.6, "ANALOG"],
  [seqS6, 34.6, "LIGHT GRID"],
  ...SHOT_NAMES.map((n, i) => [seqG2, shotAt(i), n] as [SnapFn, number, string]),
  [seqH, 41.6, "RECURSION"],
  [sheetIcon, 0, "CONTACT SHEET"],
  [seqS10, 51.3, "SCHEMATIC"],
  [seqS11, 57.4, "CINEMA"],
]);
export function frame20(c: Ctx, t: number) {
  if (t >= D2_START) warmSnaps(); // the cards first, before any scene holds its layers
  if (t < T_B) seqA(c, t);
  else if (t < T_C) seqB(c, t);
  else if (t < D2_START) seqC(c, t);
  else if (t < D2_END) seqD2(c, t);
  else if (t < G2_START) seqS6(c, t);
  else if (t < H0) seqG2(c, t);
  else if (t < T_S9) seqH(c, t);
  else if (t < T_S10) seqS9(c, t);
  else if (t < T_S11) seqS10(c, t);
  else seqS11(c, t);
  reelFrame(c, t, 1 - k(t, TOTAL - 1.3, TOTAL - 0.1));
}
