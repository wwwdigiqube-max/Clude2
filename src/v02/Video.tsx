// V02 · dino concept test — the user's own CapCut cut (8 stills × 3 s, Flow images), re-timed to the narration,
// with light Persian captions, day labels and an end card. Horizontal 1920×1080, 24 fps. Audio is muxed afterwards
// (videos/02/audio.json → tools/doc-mix.mjs).
import React from "react";
import { AbsoluteFill, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import VO from "./vo.json";

export const V02_FPS = 24;
export const V02_FRAMES = Math.round(33.5 * V02_FPS);

// source cut order: s1, s2, s4, s3, s5, s6, s7, s8 (3 s each) → story order s1..s8
const SRC_INDEX = [0, 1, 3, 2, 4, 5, 6, 7];
const seg = VO.segs;
// each shot lasts from its line's start (minus a lead) to the next line's start
const START = seg.map((s, i) => (i === 0 ? 0 : s.start - 0.15));
const END = START.map((_, i) => (i < START.length - 1 ? START[i + 1] : 33.5));

const CAPTIONS = [
  "یه روز صبح بیدار میشی و می‌بینی ۶۶ میلیون سال عقب رفتی.",
  "گوشیت فقط یه پیام داره: برخورد شهاب‌سنگ، ۷ روز دیگه.",
  "یه سنگ ۱۰ کیلومتری، درست جایی که امروز مکزیکه.",
  "روز اول می‌فهمی که دایناسورهای بزرگ زنده نمی‌مونن.",
  "ولی حیوون‌های کوچیکی که زیر زمین زندگی می‌کنن، زنده موندن.",
  "پس شروع می‌کنی به کندن.",
  "روز هفتم، آسمون یهو روشن میشه…",
  "و یه چیزی پشت سرت داره نفس می‌کشه.",
];
const LABELS: Record<number, string> = { 2: "۱۰ کیلومتر", 3: "روز ۱", 5: "روز ۲ تا ۶", 6: "روز ۷" };

const Shot: React.FC<{ i: number; dur: number }> = ({ i, dur }) => {
  const f = useCurrentFrame();
  const t = f / V02_FPS;
  const rate = 3 / dur; // stretch the 3 s clip over the line
  // a little extra life: stomp shake on shot 1, slow push everywhere, flash into shot 7
  const shake = i === 0 && t > 0.45 && t < 0.9 ? Math.sin(t * 90) * 10 * (0.9 - t) * 2.2 : 0;
  const push = 1.02 + 0.04 * (t / dur);
  const flash = i === 6 ? interpolate(t, [0.9, 1.1, 1.9], [0, 0.55, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const label = LABELS[i];
  const lk = interpolate(t, [0.1, 0.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.6}px) scale(${push})` }}>
        <OffthreadVideo src={staticFile("v02/src.mp4")} startFrom={SRC_INDEX[i] * 3 * V02_FPS} playbackRate={rate} muted />
      </AbsoluteFill>
      {flash > 0 && <AbsoluteFill style={{ backgroundColor: "#fff3d6", opacity: flash }} />}
      {label && (
        <div style={{ position: "absolute", top: 60, right: 70, direction: "rtl", fontFamily: FONT_NUM, fontSize: 84, color: "#fff", background: "#b3261e", padding: "4px 34px 10px", borderRadius: 14, transform: `scale(${0.6 + 0.4 * lk}) rotate(-3deg)`, opacity: lk, boxShadow: "0 8px 0 rgba(0,0,0,.35)" }}>
          {label}
        </div>
      )}
    </AbsoluteFill>
  );
};

const Caption: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", bottom: 70, width: "100%", display: "flex", justifyContent: "center", opacity: k }}>
      <div style={{ direction: "rtl", fontFamily: FONT_TEXT, fontSize: 54, color: "#fff", background: "rgba(0,0,0,.62)", padding: "10px 34px 14px", borderRadius: 16, maxWidth: 1600, textAlign: "center" }}>{text}</div>
    </div>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const k = interpolate(f, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: `rgba(0,0,0,${0.55 * k})`, justifyContent: "center", alignItems: "center", direction: "rtl" }}>
      <div style={{ fontFamily: FONT_NUM, fontSize: 150, color: "#fff", transform: `scale(${0.8 + 0.2 * k})`, opacity: k, textShadow: "0 6px 0 #000" }}>ادامه‌اش رو می‌خوای؟</div>
      <div style={{ fontFamily: FONT_TEXT, fontSize: 56, color: "#ffd9a8", opacity: k, marginTop: 10 }}>کامنت کن 🦖</div>
    </AbsoluteFill>
  );
};

export const V02: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {START.map((s, i) => {
      const from = Math.round(s * V02_FPS);
      const dur = Math.round(END[i] * V02_FPS) - from;
      return (
        <Sequence key={i} from={from} durationInFrames={dur}>
          <Shot i={i} dur={dur / V02_FPS} />
        </Sequence>
      );
    })}
    {seg.map((s, i) => {
      const from = Math.round((s.start - 0.05) * V02_FPS);
      const to = Math.round((i < seg.length - 1 ? seg[i + 1].start - 0.2 : s.end + 0.3) * V02_FPS);
      return (
        <Sequence key={`c${i}`} from={from} durationInFrames={to - from}>
          <Caption text={CAPTIONS[i]} />
        </Sequence>
      );
    })}
    <Sequence from={Math.round(31.7 * V02_FPS)}>
      <EndCard />
    </Sequence>
  </AbsoluteFill>
);
