import React from "react";
import { Audio, staticFile, useCurrentFrame } from "remotion";
import { END, FRAMES, SC, SceneId, sceneEnd } from "./cues";
import { look, SceneProps, sceneAt, Shell } from "./frame";
import { SceneMaskA, SceneRoom } from "./scenesA";
import { SceneBlack1, SceneTable, SceneTwoMasks } from "./scenesB";
import { SceneBlack2, SceneHands, SceneHourglass, SceneHourglassClose, SceneStatic } from "./scenesC";
import { FPS } from "./theme";

// ================= V02 «بازی» — wiring only (scenes live in scenesA/B/C.tsx) =================
export type { SceneProps };

const SCENES: Record<SceneId, React.FC<SceneProps>> = {
  maskA: SceneMaskA,
  room: SceneRoom,
  table: SceneTable,
  twoMasks: SceneTwoMasks,
  black1: SceneBlack1,
  hourglass: SceneHourglass,
  hourglassClose: SceneHourglassClose,
  black2: SceneBlack2,
  hands: SceneHands,
  static: SceneStatic,
};

export const Frame02: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const id = sceneAt(t);
  const Scene = SCENES[id];
  return (
    <Shell t={t} f={f} id={id}>
      <Scene t={t} lt={t - SC[id]} f={f} dur={sceneEnd(id) - SC[id]} />
    </Shell>
  );
};

/** the film; `times` (s) turns it into a stills sheet (-Look compositions) */
export const Video02: React.FC<{ times?: number[]; withAudio?: boolean }> = ({ times, withAudio }) => {
  const fr = useCurrentFrame();
  const t = times ? times[Math.min(fr, times.length - 1)] : fr / FPS;
  const f = times ? Math.round(t * FPS) : fr;
  return (
    <>
      <Frame02 t={t} f={f} />
      {withAudio && !times && <Audio src={staticFile("v02/mix.wav")} />}
    </>
  );
};

export const V02_FRAMES = FRAMES;
export const V02_END = END;
export const V02_LOOK_A = look(["maskA", "room"], 5);
export const V02_LOOK_B = look(["table", "twoMasks", "black1"], 4);
export const V02_LOOK_C = look(["hourglass", "hourglassClose", "black2", "hands", "static"], 4);
export const V02_LOOK = [...V02_LOOK_A, ...V02_LOOK_B, ...V02_LOOK_C];
