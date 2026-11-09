// Art Motion · «شعر روی نقاشی متحرک» — a vertical reel: any art style full-bleed (the 16:9 painting fills the
// height and pans slowly across), a dark gradient, and Persian verse in Nastaliq, hemistich by hemistich.
// All data: { style, lines: [مصراع…], poet?, at?: [seconds each line appears], pan?: [from, to] (0..1 across; default = around the style's focus) }.
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ArtFilmCanvas } from "../ArtCanvas";
import { styleById } from "../catalog";
import { AM, useArtFonts } from "../fonts";
import { ART } from "../runtime";

const k01 = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

export type PoemProps = { style: string; lines: string[]; poet?: string; at?: number[]; pan?: [number, number]; duration?: number; t?: number };

export const Poem: React.FC<PoemProps> = ({ style, lines, poet, at, pan: panIn, duration, t: tIn }) => {
  ART.labels = "off";
  const ok = useArtFonts();
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const D = duration ?? durationInFrames / fps;
  const t = tIn ?? frame / fps;
  const S = styleById(style)!;
  const times = at ?? lines.map((_, i) => 0.8 + i * 2.2);
  // the painting is 1920×1080: scaled to the full height it is 3413 px wide; pan the 1080 window across it
  const sc = 1920 / 1080, wide = 1920 * sc, span = wide - 1080;
  // default: a slow drift across the style's subject (catalog focus = crop centre as a painting fraction)
  const c = S.focus ?? 0.6, toPos = (f: number) => Math.min(1, Math.max(0, (f * wide - 540) / span));
  const pan = panIn ?? [toPos(c - 0.12), toPos(c + 0.08)];
  const x = -span * interpolate(t, [0, D], pan, { easing: Easing.inOut(Easing.sin) });
  if (!ok) return <AbsoluteFill style={{ background: "#000" }} />;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: x, top: 0, width: wide, height: 1920 }}>
        <ArtFilmCanvas segs={[{ id: S.scene!, dur: D + 3 }]} t={t + 2} dpr={sc} />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 40%, rgba(5,4,8,.78) 62%, rgba(5,4,8,.9) 100%)" }} />
      <div style={{ position: "absolute", top: 1080, left: 60, width: 960, textAlign: "center", direction: "rtl" }}>
        {lines.map((ln, i) => {
          const q = k01(t, times[i], times[i] + 1.1);
          return (
            <div
              key={i}
              style={{
                fontFamily: AM.nast,
                fontSize: 66,
                lineHeight: 2.05,
                color: "#F6EEDF",
                opacity: q,
                filter: `blur(${(1 - q) * 8}px)`,
                transform: `translateY(${(1 - q) * 18}px)`,
                textShadow: "0 3px 18px rgba(0,0,0,.85)",
              }}
            >
              {ln}
            </div>
          );
        })}
        {poet && (
          <div style={{ fontFamily: AM.fa, fontWeight: 600, fontSize: 32, color: "#FF9A66", marginTop: 26, opacity: k01(t, times[times.length - 1] + 0.9, times[times.length - 1] + 1.6) }}>
            {poet}
          </div>
        )}
      </div>
      <div style={{ position: "absolute", top: 150, left: 0, width: 1080, textAlign: "center", opacity: k01(t, 0.2, 0.9) }}>
        <div style={{ fontFamily: AM.hud, fontWeight: 600, fontSize: 24, letterSpacing: 7, color: "rgba(255,255,255,.75)" }}>NFP · ART MOTION</div>
        <div style={{ fontFamily: AM.fa, fontWeight: 700, fontSize: 34, color: "#fff", direction: "rtl", marginTop: 6, textShadow: "0 2px 12px rgba(0,0,0,.8)" }}>{S.fa}</div>
      </div>
    </AbsoluteFill>
  );
};
