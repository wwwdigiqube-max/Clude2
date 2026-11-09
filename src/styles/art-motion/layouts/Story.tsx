// Art Motion · «قصه در قاب» — a narrated reel told through moving paintings: one beat = one sentence = one art style.
// Each painting fills the frame (vertical: the 16:9 scene scaled to the full height, panned around `focus`), the next
// one enters with its own signature transition, and the sentence appears word by word in the caption band.
// Times come from the narration (vo = vo.json of tools/doc-build-vo: beat i = line i, every word appears when it is
// said) or are spread evenly (each). Optional: title card, voice/music file.
//   beats: [{ style, text, at?, focus?, key? }]  at = seconds the beat starts (overrides vo / each)
//   key = one word of the sentence to light up in the accent colour
import React from "react";
import { AbsoluteFill, Easing, Html5Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ArtFilmCanvas } from "../ArtCanvas";
import { styleById } from "../catalog";
import type { Seg } from "../film";
import { AM, useArtFonts } from "../fonts";
import { ART } from "../runtime";

/** focus: centre of the vertical crop, 0..1 across the painting (default: the style's own focus from the catalog) */
export type Beat = { style: string; text: string; at?: number; focus?: number; key?: string };
export type VO = { total: number; segs: { n: number; start: number; end: number }[]; words: { w: string; s: number; e: number; line: number }[] };
export type StoryProps = {
  beats: Beat[];
  /** vo.json from tools/doc-build-vo (one line per beat, same order) */
  vo?: VO;
  title?: string;
  sub?: string;
  /** seconds per beat when `at` is not given */
  each?: number;
  /** extra seconds after the last beat */
  tail?: number;
  layout?: "vertical" | "landscape";
  /** public/ path of the narration or music (optional) */
  audio?: string;
  accent?: string;
  t?: number;
};

const k01 = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

type Timing = Pick<StoryProps, "beats" | "each" | "tail" | "vo">;
/** start time of every beat */
export const storyTimes = (p: Timing) => p.beats.map((b, i) => b.at ?? p.vo?.segs[i]?.start ?? i * (p.each ?? 3));
export const storyLength = (p: Timing) => {
  const T = storyTimes(p);
  return Math.max(p.vo ? p.vo.total : 0, T[T.length - 1] + (p.vo ? 0.5 : (p.each ?? 3))) + (p.tail ?? 0.6);
};
/** when each word of beat i appears (seconds after the beat starts): the spoken word times if vo has the same words */
const wordTimes = (p: Timing, i: number, n: number, T: number[]) => {
  const seg = p.vo?.segs[i];
  if (seg) {
    const ws = p.vo!.words.filter((w) => w.line === seg.n);
    if (ws.length === n) return ws.map((w) => Math.max(0, w.s - T[i]));
    return Array.from({ length: n }, (_, j) => ((seg.end - seg.start) * 0.85 * j) / Math.max(1, n));
  }
  const per = Math.min(0.16, 0.9 / Math.max(1, n));
  return Array.from({ length: n }, (_, j) => 0.05 + j * per);
};
const storySegs = (p: StoryProps): Seg[] => {
  const T = storyTimes(p), L = storyLength(p);
  return p.beats.map((b, i) => {
    const S = styleById(b.style)!;
    const tr = i > 0 ? S.transition : undefined;
    // the transition is centred on the cut: it starts a little before the sentence
    const pre = tr ? Math.min(0.35, tr.dur * 0.5) : 0;
    const t0 = Math.max(0, T[i] - pre), t1 = i < p.beats.length - 1 ? Math.max(t0 + 0.4, T[i + 1] - Math.min(0.35, (styleById(p.beats[i + 1].style)!.transition?.dur ?? 0) * 0.5)) : L;
    return { id: S.scene!, dur: (i === 0 ? t1 : t1 - t0), ...(tr ? { transition: tr } : {}) };
  });
};

export const Story: React.FC<StoryProps> = (p) => {
  const { beats, title, sub, layout = "vertical", audio, accent = "#FF9A66", t: tIn } = p;
  ART.labels = "off";
  const ok = useArtFonts();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = tIn ?? frame / fps;
  const segs = storySegs(p);
  const T = storyTimes(p);
  let k = 0;
  T.forEach((s, i) => t >= s - 0.12 && (k = i));
  const B = beats[k];
  const vertical = layout === "vertical";

  // pan: each beat drifts ±5% around its focus, alternating direction; the window glides to the next focus in the cut
  const sc = height / 1080, wide = 1920 * sc, span = Math.max(0, wide - width);
  // window centre (painting fraction) → pan position 0..1
  const fx = (i: number) => span ? ((beats[i].focus ?? styleById(beats[i].style)!.focus ?? 0.6) * wide - width / 2) / span : 0.5;
  const ends = (i: number): [number, number] => {
    const d = i % 2 ? -0.05 : 0.05;
    return [fx(i) - d, fx(i) + d];
  };
  const beatEnd = (i: number) => (i < beats.length - 1 ? T[i + 1] : storyLength(p));
  const posIn = (i: number, tt: number) => {
    const [a, b] = ends(i);
    return a + (b - a) * interpolate(tt, [T[i], beatEnd(i)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) });
  };
  let pos = posIn(k, t);
  if (k > 0) {
    const g = k01(t, T[k] - 0.12, T[k] + 0.5);
    pos = posIn(k - 1, t) * (1 - g) + pos * g;
  }
  const x = -span * Math.min(1, Math.max(0, pos));

  // caption: the beat's sentence, word by word (whole words: Persian letters stay joined)
  const words = B.text.split(/\s+/).filter(Boolean);
  const lt = t - T[k];
  const WT = wordTimes(p, k, words.length, T);
  const out = k < beats.length - 1 ? 1 - k01(t, T[k + 1] - 0.3, T[k + 1] - 0.05) : 1;
  const ttl = title ? 1 - k01(t, Math.max(1.4, (T[1] ?? 2) - 0.4), Math.max(1.8, (T[1] ?? 2))) : 0;

  if (!ok) return <AbsoluteFill style={{ background: "#000" }} />;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {audio && <Html5Audio src={staticFile(audio)} />}
      {vertical ? (
        <div style={{ position: "absolute", left: x, top: 0, width: wide, height }}>
          <ArtFilmCanvas segs={segs} t={t} dpr={sc} />
        </div>
      ) : (
        <ArtFilmCanvas segs={segs} t={t} />
      )}
      <AbsoluteFill
        style={{
          background: vertical
            ? "linear-gradient(rgba(0,0,0,.42) 0%, rgba(0,0,0,0) 16%, rgba(0,0,0,0) 52%, rgba(5,4,8,.72) 66%, rgba(5,4,8,.86) 100%)"
            : "linear-gradient(rgba(0,0,0,0) 55%, rgba(5,4,8,.78) 100%)",
        }}
      />
      {/* caption band (vertical: y≈1240–1520, above the Instagram UI) */}
      <div
        style={{
          position: "absolute",
          left: vertical ? 70 : 220,
          width: vertical ? 940 : 1480,
          top: vertical ? 1250 : 820,
          direction: "rtl",
          textAlign: "center",
          opacity: out,
          fontFamily: AM.fa,
          fontWeight: 700,
          fontSize: vertical ? 64 : 58,
          lineHeight: 1.5,
          color: "#F7F1E8",
          textShadow: "0 3px 18px rgba(0,0,0,.85)",
        }}
      >
        {words.map((w, i) => {
          const q = k01(lt, WT[i], WT[i] + 0.32);
          const hot = B.key && w.replace(/[،.؟!:«»]/g, "") === B.key;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginLeft: "0.28em",
                opacity: q,
                transform: `translateY(${(1 - q) * 16}px) scale(${hot ? 1 + 0.08 * k01(lt, WT[i] + 0.2, WT[i] + 0.45) : 1})`,
                filter: `blur(${(1 - q) * 6}px)`,
                color: hot ? accent : undefined,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      {/* style tag: which painting this is (small, top) */}
      <div style={{ position: "absolute", top: vertical ? 150 : 50, left: 0, width, textAlign: "center", opacity: 1 - ttl }}>
        <div style={{ fontFamily: AM.hud, fontWeight: 600, fontSize: 22, letterSpacing: 6, color: "rgba(255,255,255,.7)" }}>{styleById(B.style)!.en.toUpperCase()}</div>
        <div style={{ fontFamily: AM.fa, fontWeight: 700, fontSize: 30, color: "#fff", direction: "rtl", marginTop: 4, textShadow: "0 2px 12px rgba(0,0,0,.8)" }}>
          {styleById(B.style)!.fa} · <span style={{ color: accent }}>{styleById(B.style)!.era}</span>
        </div>
      </div>
      {title && (
        <div style={{ position: "absolute", top: vertical ? 300 : 120, left: 0, width, textAlign: "center", direction: "rtl", opacity: ttl * k01(t, 0.05, 0.5) }}>
          <div style={{ fontFamily: AM.fa, fontWeight: 900, fontSize: vertical ? 92 : 84, color: "#fff", lineHeight: 1.2, textShadow: "0 4px 26px rgba(0,0,0,.8)" }}>{title}</div>
          {sub && <div style={{ fontFamily: AM.fa, fontWeight: 600, fontSize: 36, color: accent, marginTop: 10, textShadow: "0 2px 12px rgba(0,0,0,.8)" }}>{sub}</div>}
        </div>
      )}
    </AbsoluteFill>
  );
};
