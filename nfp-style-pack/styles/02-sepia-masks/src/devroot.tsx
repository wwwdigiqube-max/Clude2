import "../index.css";
import React from "react";
import { Audio, Composition, Sequence, staticFile, useCurrentFrame } from "remotion";
import { SC, SceneId, sceneEnd } from "./cues";
import { look, SceneProps, sceneAt, Shell } from "./frame";
import { FPS, P } from "./theme";

// A Remotion root that knows only ONE group's scenes, so a half-written file of another group never breaks your renders.
//   <G>-Look  : stills spread over your scenes (render with --sequence)
//   <G>-Clip  : your scenes as a moving clip with the dialogue (render to mp4 to check motion + sync)
export const makeDevRoot = (group: string, scenes: Partial<Record<SceneId, React.FC<SceneProps>>>, perScene = 5) => {
  const ids = Object.keys(scenes) as SceneId[];
  const times = look(ids, perScene);
  const a = Math.min(...ids.map((i) => SC[i])), b = Math.max(...ids.map((i) => sceneEnd(i)));
  const Frame: React.FC<{ t: number; f: number }> = ({ t, f }) => {
    const id = sceneAt(t);
    const Sc = scenes[id];
    return (
      <Shell t={t} f={f} id={id}>
        {Sc ? <Sc t={t} lt={t - SC[id]} f={f} dur={sceneEnd(id) - SC[id]} /> : <div style={{ background: P.ink, width: "100%", height: "100%" }} />}
      </Shell>
    );
  };
  const LookC: React.FC = () => {
    const fr = useCurrentFrame();
    const t = times[Math.min(fr, times.length - 1)];
    return <Frame t={t} f={Math.round(t * FPS)} />;
  };
  const ClipC: React.FC = () => {
    const fr = useCurrentFrame();
    const t = a + fr / FPS;
    return (
      <>
        <Frame t={t} f={Math.round(t * FPS)} />
        <Sequence from={-Math.round(a * FPS)} layout="none">
          <Audio src={staticFile("v02/vo.wav")} />
        </Sequence>
      </>
    );
  };
  const Root: React.FC = () => (
    <>
      <Composition id={`${group}-Look`} component={LookC} durationInFrames={times.length} fps={FPS} width={1080} height={1920} />
      <Composition id={`${group}-Clip`} component={ClipC} durationInFrames={Math.ceil((b - a) * FPS)} fps={FPS} width={1080} height={1920} />
    </>
  );
  return Root;
};
