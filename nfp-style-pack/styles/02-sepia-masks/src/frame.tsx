import React from "react";
import { AbsoluteFill } from "remotion";
import caps from "./captions.json";
import { SC, SCENE_ORDER, SceneId, sceneEnd } from "./cues";
import { FilmFinish, weave } from "./fx";
import { clamp, F_TEXT, P, pr } from "./theme";

// Shared chrome of every frame (no scene imports here, so a group's dev entry can use it alone).
/** every scene gets: global time t (s), local time lt (s since the scene started), frame f, and its duration */
export type SceneProps = { t: number; lt: number; f: number; dur: number };

// ---------- subtitles: small, centred, lower third (old film print); C speaks in amber ----------
type Cap = { words: { w: string; s: number; e: number }[]; s: number; e: number; line: number };
const CAPS = caps as Cap[];
const LINE_SPEAKER: Record<number, string> = { 1: "A", 2: "B", 3: "C", 4: "C", 5: "C", 6: "A", 7: "B", 8: "C", 9: "C", 10: "C", 11: "C" };
export const Subs: React.FC<{ t: number }> = ({ t }) => {
  let idx = -1;
  for (let i = 0; i < CAPS.length; i++) if (t >= CAPS[i].s - 0.05) idx = i;
  if (idx < 0) return null;
  const c = CAPS[idx], next = CAPS[idx + 1];
  const endT = Math.min(c.e + 0.45, next ? next.s - 0.05 : c.e + 0.45);
  if (t > endT || t >= SC.static) return null;
  const o = pr(t, c.s - 0.05, 0.12) * (1 - pr(t, endT - 0.1, 0.1));
  const col = LINE_SPEAKER[c.line] === "C" ? P.amberHi : P.bone;
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        width: 900,
        top: 1290,
        textAlign: "center",
        direction: "rtl",
        fontFamily: F_TEXT,
        fontSize: 58,
        lineHeight: 1.35,
        color: col,
        opacity: clamp(o),
        textShadow: "0 0 3px #000, 0 2px 0 #000, 0 0 14px rgba(0,0,0,.9), 0 0 30px rgba(0,0,0,.7)",
      }}
    >
      {c.words.map((w) => w.w.replace(/\*/g, "")).join(" ")}
    </div>
  );
};

/** which scene is on screen at time t */
export const sceneAt = (t: number): SceneId => {
  let id: SceneId = "maskA";
  for (const s of SCENE_ORDER) if (t >= SC[s]) id = s;
  return id;
};

/** wraps a scene with projector weave + film finish + subtitles */
export const Shell: React.FC<{ t: number; f: number; id: SceneId; children: React.ReactNode }> = ({ t, f, id, children }) => {
  const wv = weave(f);
  return (
    <AbsoluteFill style={{ background: P.ink }}>
      <AbsoluteFill style={{ transform: `translate(${wv.x}px, ${wv.y}px) scale(1.01)` }}>{children}</AbsoluteFill>
      <FilmFinish f={f} dust={id === "static" ? 0 : 1} />
      <Subs t={t} />
    </AbsoluteFill>
  );
};

/** evenly spread stills inside a set of scenes (for -Look sheets) */
export const look = (ids: SceneId[], perScene = 4) =>
  ids.flatMap((id) => {
    const a = SC[id], b = sceneEnd(id);
    return Array.from({ length: perScene }, (_, i) => a + ((i + 0.5) / perScene) * (b - a));
  });
