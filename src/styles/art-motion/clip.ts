// Art Motion · explainer grammars: one JSON spec → one clip of exactly spec.duration seconds (the engine's clip.js,
// ported). Contract (unchanged from the engine, see engine/README in the kit):
//   spec = { grammar, duration, fps=30, width=1920, height=1080, safe?: {top,bottom,left,right,fill?}, theme?, alpha?,
//            data?, cues: [{ at, kind, text?, sub?, data?, image?, frames?, fps?, loop? }] }
// Images are paths under public/ (staticFile) or data:/http URLs.
import { staticFile } from "remotion";
import { engine, loadEngine, loadGrammar } from "./runtime";

export type Cue = { at: number; kind: string; text?: string; sub?: string; data?: Record<string, unknown>; image?: string; frames?: string[]; fps?: number; loop?: boolean; [k: string]: unknown };
export type ClipSpec = {
  grammar: string;
  duration: number;
  fps?: number;
  width?: number;
  height?: number;
  safe?: { top?: number; bottom?: number; left?: number; right?: number; fill?: string };
  theme?: unknown;
  alpha?: boolean;
  data?: Record<string, unknown>;
  cues: Cue[];
};

const resolve = (p: string) => (/^(data:|https?:|\/)/.test(p) ? p : staticFile(p));

/** engine + grammar + images; returns the loaded image map (keyed by the spec's own paths) */
export const prepareClip = async (spec: ClipSpec) => {
  const W = spec.width ?? 1920, H = spec.height ?? 1080;
  await loadEngine(W, H);
  await loadGrammar(spec.grammar);
  const G = engine().CLIPS[spec.grammar];
  if (!G || typeof G.draw !== "function") throw new Error(`art-motion: no grammar «${spec.grammar}»`);
  const urls = new Set<string>();
  for (const q of spec.cues ?? []) {
    if (q.image) urls.add(q.image);
    for (const f of q.frames ?? []) urls.add(f);
  }
  const d = (spec.data ?? {}) as Record<string, any>;
  if (d.image) urls.add(d.image);
  if (d.character && typeof d.character === "object") Object.values(d.character.frames ?? {}).forEach((f) => urls.add(f as string));
  const IMG: Record<string, HTMLImageElement> = {};
  await Promise.all(
    [...urls].map(
      (u) =>
        new Promise<void>((res, rej) => {
          const im = new Image();
          im.onload = () => {
            IMG[u] = im;
            res();
          };
          im.onerror = () => rej(new Error(`art-motion: image failed ${u}`));
          im.src = resolve(u);
        }),
    ),
  );
  return IMG;
};

export function makeClip(spec: ClipSpec, IMG: Record<string, HTMLImageElement>) {
  const G = engine();
  const U = G.U, PAL = G.PAL, MD = G.MD, CLIP = (G.CLIP ??= {});
  const gram = G.CLIPS[spec.grammar];
  const W = spec.width ?? 1920, H = spec.height ?? 1080, FPS = spec.fps ?? 30;
  CLIP.lt = (t: number, at: number, fps: number) => t - at + 1 / fps;
  CLIP.p = (t: number, at: number, dur: number, fps: number) => U.clamp(CLIP.lt(t, at, fps) / dur);
  CLIP.fit = (iw: number, ih: number, bx: number, by: number, bw: number, bh: number) => {
    const s = Math.min(bw / iw, bh / ih), w = iw * s, h = ih * s;
    return { x: bx + (bw - w) / 2, y: by + (bh - h) / 2, w, h, s };
  };
  CLIP.sub = (r: number[], box: any) => ({ x: box.x + r[0] * box.w, y: box.y + r[1] * box.h, w: r[2] * box.w, h: r[3] * box.h });
  CLIP.text = (cue: any, ...fb: unknown[]) => (cue && (cue.text ?? cue.data?.text)) ?? fb.find((v) => v != null) ?? "";
  let pal = null;
  if (!(gram.legacyTheme && gram.legacyTheme(spec.theme))) pal = PAL.resolve(spec.theme);
  const cues = (spec.cues ?? [])
    .map((q, i) => ({ ...q, i, at: +q.at || 0 }))
    .sort((a, b) => a.at - b.at || a.i - b.i)
    .filter((q) => q.at <= spec.duration + 1e-9);
  for (const q of cues as any[])
    if (q.kind === "number") {
      const cap = q.text ?? q.sub ?? q.data?.text;
      if (cap != null) {
        q.text = cap;
        q.sub = cap;
      }
    }
  const safe = { top: 0, bottom: 0, left: 0, right: 0, ...(spec.safe ?? {}) };
  const box = { x: safe.left, y: safe.top, w: W - safe.left - safe.right, h: H - safe.top - safe.bottom };
  const ctx: any = {
    spec,
    data: spec.data ?? {},
    theme: spec.theme ?? {},
    pal,
    cues,
    W,
    H,
    FPS,
    u: Math.min(W, H) / 1080,
    portrait: H > W,
    alpha: !!spec.alpha,
    IMG,
    dur: spec.duration,
    safe,
    box,
    of: (...kinds: string[]) => cues.filter((q) => kinds.includes(q.kind)),
    lt: (t: number, at: number) => CLIP.lt(t, at, FPS),
    p: (t: number, at: number, d: number) => CLIP.p(t, at, d, FPS),
    still: (q: any) => q && (q.image ? IMG[q.image] : q.frames ? IMG[q.frames[0]] : null),
    frame: (q: any, t: number) => (!q ? null : q.frames ? MD.frameAt(q.frames.map((f: string) => IMG[f]), t - q.at, q.fps || 30, !!q.loop) : q.image ? IMG[q.image] : null),
  };
  if (gram.init) gram.init(ctx);
  const band =
    safe.fill && !spec.alpha
      ? (c: CanvasRenderingContext2D) => {
          c.fillStyle = safe.fill as string;
          if (safe.top) c.fillRect(0, 0, W, safe.top);
          if (safe.bottom) c.fillRect(0, H - safe.bottom, W, safe.bottom);
          if (safe.left) c.fillRect(0, 0, safe.left, H);
          if (safe.right) c.fillRect(W - safe.right, 0, safe.right, H);
        }
      : null;
  const render = (c: CanvasRenderingContext2D, t: number) => {
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, W, H);
    c.save();
    gram.draw(c, t, ctx);
    c.restore();
    if (band) band(c);
  };
  return { render, ctx, W, H };
}
