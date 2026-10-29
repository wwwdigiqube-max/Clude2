// Test Reel demo timing: the narration (vo.json, built with tools/doc-build-vo.mjs --tempo 1.13) and the music window
// (edited ElevenLabs track: the drop sits on «راه‌حلی» at 16.04). Every cue is a word or a beat — no loose numbers.
import { makeCues, VoJson } from "../../documentary/cues";
import VO from "./vo.json";
import BEATMAP from "./beats.json";

export const C = makeCues(VO as VoJson);
export const { S, E, W: Wd, WE } = C;
export const FPS = 30;
export const TOTAL = 59.9;
export const FRAMES = Math.round(TOTAL * FPS);
/** song time at video t = 0 */
export const MUSIC_START = 0; // beats.json comes from the edited music (public/styles/test-reel/demo/music.mp3) — already on the video clock
/** the drop (bass back after the breakdown) in video time */
export const DROP = 16.04;
/** beats (video time) */
export const BEATS: number[] = (BEATMAP as { beats: number[] }).beats.map((b) => b - MUSIC_START).filter((b) => b > -1 && b < TOTAL + 1);
/** the first beat at or after t */
export const beatAfter = (t: number) => BEATS.find((b) => b >= t - 1e-3) ?? t;
/** the last beat at or before t */
export const beatBefore = (t: number) => [...BEATS].reverse().find((b) => b <= t + 1e-3) ?? t;
/** 0..1 decaying pulse on every beat (1 at the hit) */
export function pulse(t: number, decay = 0.18) {
  const b = beatBefore(t);
  return t >= b ? Math.exp(-(t - b) / decay) : 0;
}
/** index of the beat at or before t */
export const beatIndex = (t: number) => BEATS.filter((b) => b <= t + 1e-3).length - 1;
