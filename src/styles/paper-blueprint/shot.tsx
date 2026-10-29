import React, { createContext, useContext } from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import { FONT_TEXT } from "../../fonts";
import { BlueBG, Caption, Chrome, PaperBG, World } from "./kit";
import { B, P } from "./theme";

/** Total video length for the progress ring. Defaults to the composition length. */
const TotalCtx = createContext<number | null>(null);
export const Timeline: React.FC<{ total: number; children: React.ReactNode }> = ({ total, children }) => (
  <TotalCtx.Provider value={total}>{children}</TotalCtx.Provider>
);

/** Common shot frame: background, slow camera drift on the content, chrome and caption on top. */
export const Shot: React.FC<{
  world: World; f: number; g0: number; dur: number; title: string; chapter: string; parts?: [string, number][];
  stripe?: "blue" | "gold"; cx?: number; cy?: number; drift?: number; children: React.ReactNode;
}> = ({ world, f, g0, dur, title, chapter, parts = [], stripe, cx, cy, drift = 0.035, children }) => {
  const cfg = useVideoConfig();
  const total = useContext(TotalCtx) ?? cfg.durationInFrames;
  const z = 1 + interpolate(f, [0, dur], [0, drift]);
  return (
    <AbsoluteFill>
      {world === "paper" ? <PaperBG stripe={stripe} cx={cx} cy={cy} /> : <BlueBG cx={cx} cy={cy} f={f} />}
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "50% 48%" }}>{children}</AbsoluteFill>
      <Chrome world={world} title={title} chapter={chapter} f={f} progress={(g0 + f) / total} />
      <Caption world={world} f={f} parts={parts} />
    </AbsoluteFill>
  );
};

/** Small paper strip with a hand-pinned label, positioned by its center. */
export const PaperTag: React.FC<{ x: number; y: number; rot?: number; a?: number; size?: number; children: React.ReactNode }> = ({ x, y, rot = 0, a = 1, size = 26, children }) => (
  <div
    style={{
      position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${0.85 + 0.15 * a})`, opacity: a,
      background: P.paperLight, border: `3px solid ${P.ink}`, borderRadius: 6, padding: "6px 18px 10px",
      fontFamily: FONT_TEXT, fontSize: size, color: P.ink, direction: "rtl", whiteSpace: "nowrap", boxShadow: "4px 5px 0 rgba(43,36,32,.18)",
    }}
  >
    {children}
  </div>
);

/** Blueprint chip label, positioned by its center. */
export const BlueChip: React.FC<{ x: number; y: number; a?: number; size?: number; color?: string; children: React.ReactNode }> = ({ x, y, a = 1, size = 26, color = B.line, children }) => (
  <div
    style={{
      position: "absolute", left: x, top: y, transform: `translate(-50%,-50%)`, opacity: a,
      fontFamily: FONT_TEXT, fontSize: size, color, direction: "rtl", whiteSpace: "nowrap", textShadow: "0 0 14px rgba(140,160,255,.45)",
    }}
  >
    {children}
  </div>
);
