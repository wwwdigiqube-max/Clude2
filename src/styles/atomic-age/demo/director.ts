// Atomic Age demo director: which shot draws at t, the wipes between them (the reference's wavy colour wipe; a coral
// starburst for the punchy cuts), then the living corner decorations, the caption card and the paper grain.
import { Ctx } from "../lib/canvas";
import { clamp, ease } from "../lib/math";
import { burstPath, caption, deco, motes, P, paper, setLoop, wavePath } from "../lib/retro";
import { chunkAt, SH, TOTAL } from "./cues";
import * as S from "./scenes";

type Deco = { a: string; b: string; c: string };
const D: Record<string, Deco> = {
  teal: { a: P.must, b: P.coral, c: P.cream },
  must: { a: P.teal, b: P.coral, c: P.cream },
  coral: { a: P.must, b: P.teal, c: P.cream },
  cream: { a: P.teal, b: P.coral, c: P.must },
  sky: { a: P.coral, b: P.must, c: P.teal },
  img: { a: P.must, b: P.coral, c: P.cream },
};
type Shot = { t0: number; draw: (c: Ctx, t: number) => void; deco: Deco; wipe?: "wave" | "burst"; dir?: 1 | -1 };
setLoop(TOTAL);
const SHOTS: Shot[] = [
  { t0: 0, draw: S.sOpen, deco: D.teal },
  { t0: SH.zap, draw: S.sZap, deco: D.must, wipe: "wave", dir: 1 },
  { t0: SH.field, draw: S.sField, deco: D.img, wipe: "wave", dir: -1 },
  { t0: SH.control, draw: S.sControl, deco: D.img },
  { t0: SH.rows, draw: S.sRows, deco: D.sky, wipe: "wave", dir: 1 },
  { t0: SH.gardener, draw: S.sGardener, deco: D.img, wipe: "wave", dir: -1 },
  { t0: SH.packet, draw: S.sPacket, deco: D.coral, wipe: "burst" },
  { t0: SH.foods, draw: S.sFoods, deco: D.teal, wipe: "wave", dir: 1 },
  { t0: SH.texas, draw: S.sTexas, deco: D.img, wipe: "wave", dir: -1 },
  { t0: SH.post, draw: S.sPost, deco: D.img },
  { t0: SH.map, draw: S.sMap, deco: D.teal, wipe: "wave", dir: 1 },
  { t0: SH.result, draw: S.sResult, deco: D.img, wipe: "wave", dir: -1 },
  { t0: SH.fruit, draw: S.sFruit, deco: D.teal, wipe: "burst" },
  { t0: SH.un, draw: S.sUN, deco: D.cream, wipe: "wave", dir: 1 },
  { t0: SH.compare, draw: S.sCompare, deco: D.must, wipe: "wave", dir: -1 },
  { t0: SH.loop, draw: S.sLoop, deco: D.teal, wipe: "wave", dir: 1 },
];
const WIPE = 0.38;
export function frame21(c: Ctx, t: number) {
  let i = SHOTS.length - 1;
  while (i > 0 && t < SHOTS[i].t0) i--;
  const sh = SHOTS[i], prev = i > 0 ? SHOTS[i - 1] : null;
  const p = sh.wipe && prev ? clamp((t - sh.t0) / WIPE) : 1;
  if (p < 1 && prev) {
    prev.draw(c, t);
    const path = sh.wipe === "burst" ? burstPath(540, 820, 20 + 1900 * ease.in(p), 18, 0.8, p * 0.9) : wavePath(p, sh.dir ?? 1, i * 1.3);
    c.save();
    c.clip(path);
    sh.draw(c, t);
    c.restore();
    // the edge of the wipe, printed in coral
    c.save();
    c.strokeStyle = P.coral;
    c.lineWidth = sh.wipe === "burst" ? 22 : 14;
    c.lineJoin = "round";
    c.stroke(path);
    c.restore();
  } else sh.draw(c, t);
  deco(c, t, 1, p > 0.5 || !prev ? sh.deco : prev.deco);
  motes(c, t, 16, "#fff8e8", 0.22);
  caption(c, chunkAt(t), t);
  paper(c, t, 0.5);
}
