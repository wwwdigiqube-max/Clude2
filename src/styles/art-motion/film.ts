// Art Motion · a film of art scenes: segments one after another, each entered by a transition (the engine's
// renderFrame/drawEra, ported). Pure function of t. Scenes are drawn at the engine stage (1920×1080 for the 35 art
// styles); layouts (Museum, Poem, …) place that canvas into a vertical frame.
import { engine, loadEngine, loadScene, SCENE_IMG } from "./runtime";

export type Transition = { type: string; dur: number; delay?: number; punch?: number | boolean; cx?: number; cy?: number; [k: string]: unknown };
/** off: start the scene this many seconds into its own timeline (e.g. a quick montage of each scene's best moment) */
export type Seg = { id: string; dur: number; transition?: Transition; off?: number };
type Era = Seg & { t0: number; t1: number; draw: (c: CanvasRenderingContext2D, lt: number, t: number, img: unknown, prev?: Era) => void };

export const filmLength = (segs: Seg[]) => segs.reduce((a, s) => a + s.dur, 0);

/** load everything a film needs (engine + every scene); resolve before the first draw */
export const prepareFilm = async (segs: Seg[], w = 1920, h = 1080) => {
  await loadEngine(w, h);
  for (const s of segs) await loadScene(s.id);
  for (const s of segs) {
    const ty = s.transition?.type;
    if (ty && !engine().TRANSITIONS[ty]) throw new Error(`art-motion: unknown transition «${ty}» (see TRANSITIONS in engine/transitions.js)`);
  }
};

/** opts.dpr: draw the 1920×1080 stage into a canvas dpr× bigger (sharp full-bleed vertical crops). Transitions are
 *  composed at 1× and scaled. */
export function makeFilm(segs: Seg[], W = 1920, H = 1080, opts: { punch?: number; dpr?: number } = {}) {
  const dpr = opts.dpr ?? 1;
  const G = engine();
  let acc = 0;
  const E: Era[] = segs.map((s) => {
    const e = { ...s, t0: acc, t1: acc + s.dur, draw: G.SCENES[s.id].draw } as Era;
    acc += s.dur;
    return e;
  });
  const total = acc;
  if (E.length) E[E.length - 1].t1 = 1e9;
  const mk = () => {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    return c;
  };
  const bufA = mk(), bufB = mk(), bufT = mk();
  const ctxOf = (c: HTMLCanvasElement) => c.getContext("2d") as CanvasRenderingContext2D;

  // one segment at local time; the beat "punch" of the entering transition scales the scene layer
  const drawEra = (c: CanvasRenderingContext2D, e: Era, t: number, prev?: Era, punchFrom?: Era, k = 1) => {
    const lt = t - e.t0 + (e.off ?? 0);
    c.save();
    c.setTransform(k, 0, 0, k, 0, 0);
    c.clearRect(0, 0, W, H);
    const pe = punchFrom || e;
    const pa = pe.transition ? (pe.transition.punch ?? opts.punch ?? 0.03) : 0;
    const amp = pa === true ? 0.03 : +pa || 0;
    const k60 = amp ? (t - pe.t0) * 60 : 99;
    const punch = k60 >= 0 && k60 < 20 ? 1 + amp * Math.pow(1 - k60 / 20, 1.5) : 1;
    if (punch !== 1) {
      c.translate(W / 2, H / 2);
      c.scale(punch, punch);
      c.translate(-W / 2, -H / 2);
    }
    e.draw(c, lt, t, SCENE_IMG, prev);
    c.restore();
  };

  const render = (ctx: CanvasRenderingContext2D, t: number) => {
    let k = E.findIndex((e) => t >= e.t0 && t < e.t1);
    if (k < 0) k = E.length - 1;
    const e = E[k], prev = E[k - 1];
    const tr = e.transition;
    const trDur = tr ? tr.dur + (tr.delay || 0) : 0;
    const lt = t - e.t0;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (prev && tr && lt < trDur) {
      drawEra(ctxOf(bufA), prev, t, E[k - 2], e);
      drawEra(ctxOf(bufB), e, t, prev);
      const p = G.U.clamp((lt - (tr.delay || 0)) / tr.dur);
      ctx.clearRect(0, 0, W * dpr, H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      G.TRANSITIONS[tr.type](ctx, bufA, bufB, p, { ...tr, id: e.id, from: prev.id, lt, t, W, H, tmp: bufT, IMG: SCENE_IMG });
    } else drawEra(ctx, e, t, prev, undefined, dpr);
    ctx.restore();
    return k;
  };
  return { total, render, eras: E };
}
