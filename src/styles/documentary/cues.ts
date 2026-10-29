// Timing from the dialogue: every cue of a documentary comes from vo.json (built by tools/doc-build-vo.mjs).
// vo.json = { total, segs: [{ n, sp, start, end }], words: [{ w, s, e, line }] }
export type VoJson = { total: number; segs: { n: number; sp: string; start: number; end: number }[]; words: { w: string; s: number; e: number; line: number }[] };

const clean = (w: string) => w.replace(/[،.؛:«»!؟?…"]/g, "").replace(/[ً-ْ]/g, "");

/** cue helpers for one dialogue:
 *  S(n) / E(n) = start / end of line n · W(n, word, occ) = onset of a word in line n (exact, else prefix; occ = which
 *  occurrence — needed when a word repeats, even with different punctuation) · WE = its end · SP(n) = speaker */
export function makeCues(vo: VoJson, fps = 30) {
  const seg = (n: number) => {
    const s = vo.segs.find((x) => x.n === n);
    if (!s) throw new Error(`no line ${n} in vo.json`);
    return s;
  };
  const hit = (n: number, txt: string, occ: number) => {
    const ws = vo.words.filter((w) => w.line === n);
    const want = clean(txt);
    let hits = ws.filter((w) => clean(w.w) === want);
    if (!hits.length) hits = ws.filter((w) => clean(w.w).startsWith(want));
    if (!hits[occ]) throw new Error(`cue word "${txt}" (#${occ}) not in line ${n}: ${ws.map((w) => w.w).join(" ")}`);
    return hits[occ];
  };
  return {
    TOTAL: vo.total,
    FRAMES: Math.ceil(vo.total * fps),
    S: (n: number) => seg(n).start,
    E: (n: number) => seg(n).end,
    SP: (n: number) => seg(n).sp,
    W: (n: number, txt: string, occ = 0) => hit(n, txt, occ).s,
    WE: (n: number, txt: string, occ = 0) => hit(n, txt, occ).e,
    /** pauses between lines (for lifting the music) */
    gaps: (): [number, number][] => vo.segs.slice(1).map((s, i) => [vo.segs[i].end, s.start] as [number, number]),
  };
}
export type Cues = ReturnType<typeof makeCues>;
