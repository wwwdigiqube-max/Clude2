// Presenter character: GPT pose images (transparent PNG, square) → halftone print → code motion.
// No lip-sync (overlay mouths looked fake): life comes from entrance, idle sway, pose switches with squash, and a voice ring.
import React from "react";
import { staticFile } from "remotion";
import { HalftoneImg, HalftoneOpts } from "./halftone";
import { clamp, easeBack, easeOut, K, ramp } from "./theme";

export type Pose = "idea" | "confused" | "present" | "point" | "wow" | "wave" | "peek" | "head";
/** Pose timeline: [seconds, pose][] (sorted). */
export type PoseTrack = [number, Pose][];

export const HT_CHAR: Partial<HalftoneOpts> = { cell: 6, tone: 0.42, gamma: 1.1, contrast: 1.05 };

const poseAt = (track: PoseTrack, t: number) => {
  let i = 0;
  for (let k = 0; k < track.length; k++) if (t >= track[k][0]) i = k;
  return { pose: track[i][1], since: t - track[i][0], idx: i };
};

/**
 * Big presenter. x = centre, bottom = y of the image bottom, h = displayed size (square images).
 * enter: "left" | "right" | "bottom" slide-in with overshoot at `at` (s). Poses switch with a squash-and-stretch pop.
 */
export const Character: React.FC<{
  dir: string; track: PoseTrack; t: number; x: number; bottom: number; h: number; at?: number; enter?: "left" | "right" | "bottom"; flip?: boolean;
  exit?: number; nod?: number; ht?: Partial<HalftoneOpts>;
}> = ({ dir, track, t, x, bottom, h, at = 0, enter = "left", flip = false, exit, nod = 0, ht }) => {
  const { pose, since } = poseAt(track, t);
  const e = ramp(t, at, at + 0.55, easeBack);
  const out = exit === undefined ? 0 : ramp(t, exit, exit + 0.4, (k) => k * k);
  const sw = since < 0.25 ? Math.sin((since / 0.25) * Math.PI) : 0; // squash on pose change
  const idle = Math.sin(t * 1.9) * 0.9;
  const bob = Math.sin(t * 2.6) * 5;
  const off = (1 - e) + out;
  const tx = enter === "left" ? -off * h * 0.9 : enter === "right" ? off * h * 0.9 : 0;
  const ty = enter === "bottom" ? off * h * 0.7 : 0;
  return (
    <div style={{
      position: "absolute", left: x - h / 2, top: bottom - h + bob - nod * 10, width: h, height: h,
      transform: `translate(${tx}px, ${ty}px) rotate(${idle + (1 - e) * (enter === "left" ? -12 : 12)}deg) scale(${(flip ? -1 : 1) * (1 + sw * 0.035)}, ${1 - sw * 0.03})`,
      transformOrigin: "50% 100%",
    }}>
      <HalftoneImg src={staticFile(`${dir}/${pose}.png`)} opts={{ width: Math.round(h), ...HT_CHAR, ...ht }} />
    </div>
  );
};

/** Round talking-head avatar with a voice ring that pulses with the narration (no fake mouth). */
export const Avatar: React.FC<{ dir: string; t: number; x: number; y: number; d?: number; voice?: number; at?: number; ring?: string; bg?: string }> = ({ dir, t, x, y, d = 200, voice = 0, at = 0, ring = K.blue, bg = "#fff" }) => {
  const e = ramp(t, at, at + 0.4, easeBack);
  const img = d * 1.18;
  return (
    <div style={{ position: "absolute", left: x - d / 2, top: y - d / 2, width: d, height: d, transform: `scale(${e})` }}>
      {[0, 1].map((k) => (
        <div key={k} style={{ position: "absolute", inset: -(8 + voice * (18 + k * 16)), borderRadius: "50%", border: `${4 - k}px solid ${ring}`, opacity: (0.7 - k * 0.3) * clamp(voice * 1.6) }} />
      ))}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: bg, border: `4px solid ${K.ink}`, overflow: "hidden", transform: `rotate(${Math.sin(t * 2) * 2}deg)` }}>
        <div style={{ position: "absolute", left: (d - img) / 2, top: d * 0.04, width: img, height: img, transform: `translateY(${Math.sin(t * 3) * 2}px)` }}>
          <HalftoneImg src={staticFile(`${dir}/head.png`)} opts={{ width: Math.round(img), ...HT_CHAR, cell: 4 }} />
        </div>
      </div>
    </div>
  );
};

/** Voice activity 0..1 (loudness gated to spoken words) — drives rings/glows, not mouths. */
export type Word = { si: number; wi: number; w: string; s: number; e: number };
export const voiceAt = (env: number[], words: Word[], t: number, fps = 30) => {
  const inWord = words.some((w) => t >= w.s - 0.03 && t <= w.e + 0.05);
  return inWord ? clamp(((env[Math.round(t * fps)] ?? 0) - 0.08) * 1.6) : 0;
};
/** Small nod on each stressed word start (0..1). */
export const nodAt = (words: Word[], t: number) => words.reduce((m, w) => (t >= w.s && t < w.s + 0.25 ? Math.max(m, easeOut(1 - (t - w.s) / 0.25)) : m), 0);
