import { Html5Audio as Audio } from "remotion";
import React from "react";
import { Sequence, staticFile } from "remotion";

// Scene lengths must match SCENES in NameSearch.tsx.
const DURS = [135, 120, 120, 150, 165, 150, 120, 150, 135, 165];
const START = DURS.reduce<number[]>((a, d, i) => [...a, i ? a[i - 1] + DURS[i - 1] : 0], []);

// [scene(1-based), local frame, sfx, volume] — every cue sits on a visible event.
const CUES: [number, number, string, number][] = [
  [1, 18, "thud", 0.8], [1, 30, "paper", 0.6], [1, 20, "steps", 0.5], [1, 86, "pop", 0.7],
  [2, 0, "thud", 0.5], [2, 14, "ticks", 0.5], [2, 68, "strike", 0.6], [2, 80, "strike", 0.6], [2, 92, "strike", 0.6],
  [3, 0, "blip", 0.6], [3, 12, "type", 0.7], [3, 64, "ping", 0.6], [3, 64, "sweep", 0.8], [3, 76, "node1", 0.6], [3, 86, "node2", 0.6], [3, 96, "node3", 0.6],
  [4, 6, "ticks", 0.45], [4, 64, "ticks", 0.4], [4, 36, "match", 0.7], [4, 66, "match", 0.7], [4, 96, "match", 0.7], [4, 124, "stop", 0.7],
  [5, 18, "pin", 0.8], [5, 58, "pin", 0.8], [5, 98, "pin", 0.8], [5, 124, "string", 0.7],
  [6, 8, "scan", 0.9], [6, 122, "stop", 0.6],
  [7, 2, "servo", 0.7], [7, 60, "servo", 0.6],
  [8, 10, "blip", 0.5], [8, 22, "blip", 0.45], [8, 36, "blip", 0.5], [8, 50, "blip", 0.45], [8, 68, "lock", 0.8], [8, 84, "riser", 0.8], [8, 128, "match", 0.7],
  [9, 18, "thud", 0.9], [9, 22, "chime", 0.8], [9, 30, "hop", 0.6], [9, 54, "hop", 0.5], [9, 40, "pop", 0.5],
  [10, 8, "type", 0.6], [10, 80, "boom", 0.9],
];

export const Soundtrack: React.FC = () => (
  <>
    <Audio src={staticFile("v04/music.wav")} volume={0.55} />
    {CUES.map(([s, f, name, v], i) => (
      <Sequence key={i} from={START[s - 1] + f} layout="none">
        <Audio src={staticFile(`v04/${name}.wav`)} volume={v} />
      </Sequence>
    ))}
  </>
);
