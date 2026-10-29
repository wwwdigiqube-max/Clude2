// Studio Desk · demo = the reference film «۳۰ روز ویدیوسازی با AI + فایل NFP» — a vertical course reel (1080×1920,
// 113 s) on a voice-over: a warm paper desk with real app UI (Instagram, YouTube, Claude, a timeline, a calendar) ↔ a
// dark cinema for footage. Twelve scenes (S1…S12) overlap for transitions; each is a pure function of t.
// The kit ships it silent and without footage (lib.MEDIA = your files; empty slots show placeholders).
import React from "react";
import { Html5Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Frame23 } from "./frame";
import { FPS, useV23Fonts } from "./lib";
import { S1Hook, S2Page, S3YouTube, S4Tools, S5Days } from "./scenesA";
import { S6Showcase, S7Nfp, S8Demo } from "./scenesB";
import { S10Wall, S11Close, S12Cta, S9Auto } from "./scenesC";

export { FPS as DESK_FPS, FRAMES as DESK_FRAMES } from "./lib";
/** still times for the -Look composition */
export const DESK_LOOK = [0.4, 1.6, 3.6, 5.6, 7.3, 8.3, 11.6, 13.3, 15.6, 17.2, 20.6, 23.6, 26.3, 29.6, 30.9, 33.6, 36.9, 38.6, 40.7, 42.4, 44.1, 46.1, 48.3, 50.6, 53.4, 57.7, 59.5, 61.9, 64.2, 67.7, 70.6, 73.6, 76.6, 78.7, 81.6, 84.0, 86.8, 89.9, 93.6, 96.9, 97.7, 100.4, 103.3, 105.9, 108.7, 110.3, 112.0, 113.6];

/** times = still mode · audio = a file in public/ (e.g. "v01/mix.wav") · self = S7 shows this very film in an editor */
export const DeskVideo: React.FC<{ times?: number[]; audio?: string; self?: boolean }> = ({ times, audio, self = false }) => {
  useV23Fonts();
  const frame = useCurrentFrame();
  const t = times ? times[frame] ?? 0 : frame / FPS;
  const p = { t, frame };
  return (
    <Frame23 t={t} frame={frame}>
      <S2Page {...p} />
      <S3YouTube {...p} />
      <S4Tools {...p} />
      <S5Days {...p} />
      <S7Nfp {...p} self={self} />
      <S8Demo {...p} />
      <S9Auto {...p} />
      <S10Wall {...p} />
      <S11Close {...p} />
      <S12Cta {...p} />
      <S6Showcase {...p} />
      <S1Hook {...p} />
      {audio && !times && (
        <Sequence from={0} layout="none">
          <Html5Audio src={staticFile(audio)} />
        </Sequence>
      )}
    </Frame23>
  );
};
