// Video 05 — «Vibe Coding و دردسر حقوقی» · vertical 1080×1920 · narration (ElevenLabs, Charlie v3) drives every cue.
import React from "react";
import { AbsoluteFill, Html5Audio as Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FlyChip } from "../styles/receipt-ui/fx";
import { Backdrop, Captions, fr, PromptPill, Receipt, ReceiptRow, Smear } from "../styles/receipt-ui/kit";
import { Mode } from "../styles/receipt-ui/theme";
import { Sc0, Sc1, Sc2, Sc3, Sc4, Sc5a, Sc5b, SP } from "./scenesA";
import { Sc6, Sc7, Sc8, Sc9, Sc10, Sc11, Sc12 } from "./scenesB";
import { E, FIX, S, TM, WORDS } from "./times";

// hits = impact moments (s) that shake the camera
const SCENES: { C: React.FC<SP>; mode: Mode; from: number; hits?: number[] }[] = [
  { C: Sc0, mode: "dark", from: 0, hits: [TM.legal] },
  { C: Sc1, mode: "light", from: S(1) },
  { C: Sc2, mode: "light", from: S(2) },
  { C: Sc3, mode: "dark", from: S(3), hits: [TM.leak + 0.1] },
  { C: Sc4, mode: "light", from: S(4) },
  { C: Sc5a, mode: "dark", from: S(5), hits: [TM.unsub] },
  { C: Sc5b, mode: "light", from: TM.orStripe },
  { C: Sc6, mode: "dark", from: S(6), hits: [TM.bad] },
  { C: Sc7, mode: "light", from: S(7), hits: [TM.relate] },
  { C: Sc8, mode: "light", from: S(8), hits: [TM.user + 0.27, TM.email + 0.27, TM.sess2 + 0.27] },
  { C: Sc9, mode: "dark", from: S(9) },
  { C: Sc10, mode: "light", from: S(10), hits: [TM.guar + 0.1] },
  { C: Sc11, mode: "dark", from: S(11) },
  { C: Sc12, mode: "dark", from: S(12) },
];
export const V05_END = E(12) + 1.4;
export const V05_FRAMES = fr(V05_END);
const until = (i: number) => (i + 1 < SCENES.length ? SCENES[i + 1].from : V05_END);

const ROWS: (ReceiptRow & { from?: [number, number] })[] = [
  { at: TM.deploy, label: "deploy · vibely.app", amount: "live", tone: "blue" },
  { at: TM.age13 + 0.3, label: "COPPA · no age gate", sub: "per user", amount: "$53,000", fixAt: FIX[0], from: [540, 1120] },
  { at: TM.leak, label: "Google Fonts · IP leak", sub: "per visitor", amount: "€100", fixAt: FIX[1], from: [820, 1450] },
  { at: TM.rec, label: "CIPA · session replay", sub: "per session", amount: "$5,000", fixAt: FIX[2], from: [720, 1450] },
  { at: TM.unsub, label: "CAN-SPAM · no unsub", sub: "per email", amount: "$53,000", fixAt: FIX[3], from: [540, 1620] },
  { at: TM.notShown, label: "ARL · silent renewal", sub: "per renewal", amount: "refund", tone: "blue", fixAt: FIX[4], from: [540, 1330] },
  { at: TM.dmca, label: "DMCA · no agent", sub: "per image", amount: "$150,000", fixAt: FIX[5], from: [540, 1110] },
];

const KEYS: Record<number, { keys?: string[]; reds?: string[]; icons?: Record<string, string> }> = {
  0: { keys: ["Vibe", "Coding", "شب"], reds: ["حقوقی"], icons: { Vibe: "✨", شب: "🌙", حقوقی: "⚖️" } },
  1: { keys: ["پشتش"], icons: { پشتش: "🕵️" } },
  2: { keys: ["۱۳"], icons: { "۱۳": "🎂", فرم: "📝" } },
  3: { keys: ["گوگل", "IP"], icons: { گوگل: "🔤", IP: "📍" } },
  4: { keys: ["Session", "Replay"], reds: ["ضبط"], icons: { Session: "⏺️", ضبط: "🎥" } },
  5: { keys: ["عضویت", "Stripe"], icons: { ایمیل: "📧", Stripe: "💳" } },
  6: { keys: ["DMCA"], icons: { عکس: "🖼️", DMCA: "©️" } },
  7: { reds: ["ترسناک"], icons: { ترسناک: "😱" } },
  8: { keys: ["دلار"], icons: { دلار: "💵" } },
  9: { keys: ["فراموش"], icons: { فراموش: "🫥" } },
  10: { keys: ["سریع"], reds: ["تضمین"], icons: { سریع: "⚡", تضمین: "⚠️" } },
  11: { keys: ["Claude"], icons: { Claude: "✳️", پرامپت: "🧾" } },
  12: { keys: ["«قانون»"], icons: { "«قانون»": "💬" } },
};

/** Overlay that doesn't smear: receipt, captions, countdown pill. */
const Overlay: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const idx = SCENES.findLastIndex((s) => s.from <= t + 1e-6);
  const mode = SCENES[Math.max(0, idx)].mode;
  return (
    <AbsoluteFill>
      <Receipt rows={ROWS} t={t} x={540} w={600} maxH={560} flashSales={TM.revenue} total={{ at: E(8) - 0.3, value: "$100,000+", fixedValue: "$0", fixAt: FIX[5] + 0.4 }} />
      {ROWS.map((r, i) => r.from && <FlyChip key={i} from={r.from} f={f} at={fr(r.at)} text={r.amount} />)}
      <Captions words={WORDS} t={t} mode={mode} keyMap={KEYS} y={620} size={66} />
      <PromptPill t={t} revealAt={S(11)} mode={mode} />
    </AbsoluteFill>
  );
};

// [time (s), sfx, volume]
const CUES: [number, string, number][] = [
  [TM.deploy, "notif", 0.6], [TM.sale, "notif", 0.5], [TM.legal, "error", 0.7],
  [TM.behind, "sweep", 0.6],
  [S(2) + 0.2, "type", 0.35], [TM.limit, "error", 0.55], [TM.age13, "click", 0.7], [TM.age13 + 0.25, "match", 0.4],
  [TM.font, "sweep", 0.5], [TM.ip, "blip", 0.6], [TM.leak, "error", 0.5],
  [TM.sess, "click", 0.55], [TM.behav, "type", 0.45], [TM.rec, "error", 0.5],
  [TM.unsub, "error", 0.55], [TM.have, "click", 0.7], [TM.terms, "error", 0.5], [TM.notShown, "ticks", 0.3],
  [TM.upload, "pop", 0.5], [TM.dmca, "error", 0.55], [TM.bad, "glitch", 0.35],
  [TM.revenue, "thud", 0.6], [TM.relate, "stamp", 0.5],
  [TM.user + 0.27, "stamp", 0.7], [TM.email + 0.27, "stamp", 0.7], [TM.sess2 + 0.27, "stamp", 0.7],
  [S(9) + 0.1, "type", 0.35], [TM.forget, "error", 0.45],
  [TM.fast, "match", 0.55], [TM.guar, "error", 0.6],
  [TM.claude - 0.27, "type", 0.35], ...FIX.map((x): [number, string, number] => [x, "blip", 0.5]), [FIX[5] + 0.4, "chime", 0.6],
  [TM.comment - 0.1, "type", 0.35], [TM.comment + 0.75, "pop", 0.6],
  // receipt printing
  ...ROWS.slice(1).map((r): [number, string, number] => [r.at, "print", 0.45]),
  // cuts
  ...SCENES.slice(1).map((s): [number, string, number] => [s.from - 0.08, "whoosh", 0.18]),
];

export const Video05: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {SCENES.map((s, i) => (
      <Sequence key={i} from={fr(s.from)} durationInFrames={fr(until(i)) - fr(s.from)}>
        <SceneBody i={i} />
      </Sequence>
    ))}
    <Overlay />
    <Audio src={staticFile("v05/narration.mp3")} volume={1} />
    <Audio src={staticFile("v05/music.wav")} volume={0.13} />
    {CUES.map(([t, n, v], i) => (
      <Sequence key={`c${i}`} from={Math.max(0, fr(t))} layout="none">
        <Audio src={staticFile(`sfx-lib/${n}.wav`)} volume={v} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

const SceneBody: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const s = SCENES[i];
  const dur = fr(until(i)) - fr(s.from);
  return (
    <>
      <Backdrop mode={s.mode} f={f} />
      <Smear f={f} dur={dur} id={`sm${i}`} inF={i === 0 ? 0 : 7} hits={(s.hits ?? []).map((h) => fr(h - s.from))}>
        <s.C from={s.from} />
      </Smear>
    </>
  );
};
