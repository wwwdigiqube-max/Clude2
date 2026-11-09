// Art Motion · «سفر در تاریخ هنر» — several art styles one after another, each entered by its own signature
// transition, with a Persian tag (name · era) that changes with them. The engine's «Art History Speedrun» idea as a
// template: give it any list of styles (an evolution, «X through the ages», a playlist of looks).
//   layout 'landscape' (1920×1080, tag top-right) | 'vertical' (1080×1920, framed painting, title on top, tag under it)
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ArtFilmCanvas } from "../ArtCanvas";
import { filmLength, type Seg } from "../film";
import { styleById } from "../catalog";
import { AM, useArtFonts } from "../fonts";
import { ART } from "../runtime";

export type Stop = { style: string; dur?: number; label?: string; era?: string };
export type JourneyProps = { stops: Stop[]; layout?: "landscape" | "vertical"; title?: string; sub?: string; each?: number; t?: number };

const k01 = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

export const journeySegs = (stops: Stop[], each = 1.2): Seg[] =>
  stops.map((s, i) => {
    const S = styleById(s.style)!;
    return { id: S.scene!, dur: s.dur ?? each, ...(i > 0 && S.transition ? { transition: S.transition } : {}) };
  });
export const journeyLength = (stops: Stop[], each = 1.2) => filmLength(journeySegs(stops, each));

export const Journey: React.FC<JourneyProps> = ({ stops, layout = "vertical", title, sub, each = 1.2, t: tIn }) => {
  ART.labels = "off";
  const ok = useArtFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = tIn ?? frame / fps;
  const segs = journeySegs(stops, each);
  // which stop is on screen (the tag swaps at the middle of the entering transition)
  let acc = 0, k = 0;
  segs.forEach((s, i) => {
    const swap = acc + (s.transition ? s.transition.dur * 0.5 : 0);
    if (t >= swap) k = i;
    acc += s.dur;
  });
  const S = styleById(stops[k].style)!;
  const segStart = segs.slice(0, k).reduce((a, s) => a + s.dur, 0);
  const pop = k01(t, segStart + (segs[k].transition?.dur ?? 0) * 0.5, segStart + (segs[k].transition?.dur ?? 0) * 0.5 + 0.25);
  const name = stops[k].label ?? S.fa, era = stops[k].era ?? S.era;
  const Tag: React.FC<{ align: "right" | "center"; big?: number }> = ({ align, big = 64 }) => (
    <div style={{ direction: "rtl", textAlign: align, transform: `translateY(${(1 - pop) * 10}px)`, opacity: 0.35 + 0.65 * pop }}>
      <div style={{ fontFamily: AM.fa, fontWeight: 900, fontSize: big, color: "#fff", lineHeight: 1.15, textShadow: "0 3px 16px rgba(0,0,0,.75)" }}>{name}</div>
      <div style={{ fontFamily: AM.fa, fontWeight: 600, fontSize: big * 0.45, color: "#FFB27F", textShadow: "0 2px 10px rgba(0,0,0,.8)" }}>{era}</div>
    </div>
  );
  if (!ok) return <AbsoluteFill style={{ background: "#000" }} />;
  if (layout === "landscape")
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <ArtFilmCanvas segs={segs} t={t} />
        <div style={{ position: "absolute", top: 54, right: 70 }}>
          <Tag align="right" />
        </div>
      </AbsoluteFill>
    );
  const PW = 1000, PH = 562, PY = 670;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 45% at 50% 40%, #241d24, #0b090c 75%)" }}>
      <div style={{ position: "absolute", top: 340, width: 1080, textAlign: "center", direction: "rtl", opacity: k01(t, 0, 0.6) }}>
        {title && <div style={{ fontFamily: AM.fa, fontWeight: 900, fontSize: 76, color: "#F6EEE3", lineHeight: 1.2 }}>{title}</div>}
        {sub && <div style={{ fontFamily: AM.fa, fontWeight: 600, fontSize: 34, color: "#FF9A66", marginTop: 8 }}>{sub}</div>}
      </div>
      <div style={{ position: "absolute", left: (1080 - PW) / 2, top: PY, width: PW, height: PH, borderRadius: 18, overflow: "hidden", boxShadow: "0 40px 90px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.1)" }}>
        <ArtFilmCanvas segs={segs} t={t} />
      </div>
      <div style={{ position: "absolute", top: PY + PH + 60, width: 1080 }}>
        <Tag align="center" big={72} />
      </div>
      {/* a progress rail: one tick per stop */}
      <div style={{ position: "absolute", top: PY + PH + 290, left: 140, width: 800, display: "flex", gap: 6, direction: "rtl" }}>
        {stops.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i <= k ? "#FF7A3D" : "rgba(255,255,255,.14)" }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
