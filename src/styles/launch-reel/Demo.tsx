// Launch Reel — starter template (18s vertical promo for a fictional signal bot «سیگنال‌یار»).
// Copy to src/vNN/Video.tsx, keep the beat-locked SCENES + CUES pattern, swap the scenes.
import React from "react";
import { AbsoluteFill, Html5Audio as Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT_TEXT } from "../../fonts";
import ENV from "../../lib/audio-env/ende-vol-10.json";
import {
  A, AppIcon, Backdrop, Bubble, ChatHeader, Chip, ClipReveal, Counter, CTA, Cursor, Dial24, easeOut, exitStyle, FPS, GlassBurst, Headline, InputBar,
  Kicker, Mode, Phone, PHONE, pop, ramp, Ripple, SFX, SignalCard, Toast, Ticker, Token, TokenKind, typed, TypingDots, V,
} from ".";

const MUSIC = "music/happy-beats-business-moves-vol-10-by-ende-dot-app.mp3";
/** Scene cuts sit on strong cues of the track (public/music/cues/*.music-cues.md). */
const CUTS = [0, 3.55, 7.11, 11.46, 14.73];
const END = 18;
export const LAUNCH_DEMO_FRAMES = END * FPS;
const TR = 12; // reveal length (frames); starts 6 frames before the cut so it lands on the beat

type SceneP = { f: number; pulse: number };

/* ───────── 1 · hook (dark) ───────── */
const TOKENS: { k: TokenKind; x: number; y: number; s: number; d: number }[] = [
  { k: "btc", x: 90, y: 250, s: 200, d: 1 },
  { k: "gold", x: 700, y: 330, s: 190, d: 0.9 },
  { k: "usd", x: 800, y: 1130, s: 160, d: 0.8 },
  { k: "index", x: 70, y: 1190, s: 180, d: 1 },
  { k: "eth", x: 520, y: 1400, s: 110, d: 0.5 },
  { k: "btc", x: 430, y: 120, s: 90, d: 0.4 },
];
const Hook: React.FC<SceneP> = ({ f, pulse }) => (
  <AbsoluteFill>
    <Backdrop mode="dark" f={f} pulse={pulse} />
    {TOKENS.map((t, i) => {
      const a = pop(f, 2 + i * 3, 16);
      const drift = -f * 1.2 * t.d;
      return (
        <div key={i} style={{ position: "absolute", left: t.x + Math.sin(f / 30 + i) * 14, top: t.y + drift + (1 - a) * 200, opacity: Math.min(1, a * 1.4) * (t.d < 0.6 ? 0.55 : 1), transform: `scale(${a})`, filter: t.d < 0.6 ? "blur(3px)" : undefined }}>
          <Token kind={t.k} s={t.s} f={f} seed={i} />
        </div>
      );
    })}
    <Headline text="بازار هیچ‌وقت نمی‌خوابه" f={f} at={4} mode="dark" y={700} size={132} accent={[2]} stagger={5} />
    <Headline text="تو چی؟" f={f} at={60} mode="dark" y={1010} size={96} color={A.mint} stagger={6} />
    <Ticker f={f} y={1660} mode="dark" a={ramp(f, 8, 20)} items={[["طلا", 0.8], ["بیت‌کوین", -1.2], ["دلار", 0.3], ["شاخص کل", 1.1], ["اتریوم", 2.4]]} />
  </AbsoluteFill>
);

/* ───────── 2 · reveal (light) ───────── */
const Reveal: React.FC<SceneP> = ({ f, pulse }) => {
  const rise = ramp(f, 0, 20, easeOut);
  const px = (V.W - PHONE.W) / 2, py = 1920 - (1920 - 700) * rise;
  const target = { x: V.W / 2, y: 700 + PHONE.H / 2 };
  const fly: { k: TokenKind; x: number; y: number }[] = [{ k: "btc", x: 80, y: 520 }, { k: "gold", x: 860, y: 620 }, { k: "index", x: 60, y: 1500 }, { k: "usd", x: 900, y: 1480 }];
  const absorbed = f >= 36;
  return (
    <AbsoluteFill>
      <Backdrop mode="light" f={f + 200} pulse={pulse} />
      <Kicker text="معرفی سیگنال‌یار" a={pop(f, 3, 12)} mode="light" y={120} />
      <Headline text="دستیار هوشمند بازار" f={f} at={8} mode="light" y={250} size={120} accent={[1]} />
      <Phone x={px} y={py} s={1}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 38%, ${A.violet2}, ${A.violet} 55%, #2a1799)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 34 }}>
          <div style={{ transform: `scale(${absorbed ? 1 + 0.12 * Math.max(0, 1 - (f - 36) / 10) : 1})` }}><AppIcon s={210} f={f} glow={pulse} /></div>
          <div style={{ fontFamily: FONT_TEXT, fontSize: 54, color: "#fff" }}>سیگنال‌یار</div>
        </div>
      </Phone>
      {!absorbed && fly.map((t, i) => {
        const p = ramp(f, 12 + i * 2, 36, (x) => x * x);
        const x = t.x + (target.x - 80 - t.x) * p, y = t.y + (target.y - 80 - t.y) * p;
        return <div key={i} style={{ position: "absolute", left: x, top: y, transform: `scale(${1 - 0.7 * p}) rotate(${p * 200}deg)`, opacity: pop(f, 2 + i * 2, 10) }}><Token kind={t.k} s={160} f={f} seed={i + 7} /></div>;
      })}
      <Ripple x={target.x} y={target.y - 60} f={f} at={36} color={A.mint} />
      <div style={{ position: "absolute", left: 40, top: 780 }}><Chip text="کریپتو" a={pop(f, 33)} mode="light" color={A.btc} /></div>
      <div style={{ position: "absolute", left: 700, top: 1000 }}><Chip text="بورس" a={pop(f, 49)} mode="light" color={A.violet} /></div>
      <div style={{ position: "absolute", left: 60, top: 1260 }}><Chip text="طلا" a={pop(f, 66)} mode="light" color={A.gold} /></div>
    </AbsoluteFill>
  );
};

/* ───────── 3 · chat + signal (light) ───────── */
const Q = "الان طلا بخرم؟";
const TYPE_AT = 6, CPS = 14, SEND = 48, CARD = 66, STAMP = 114;
const Chat: React.FC<SceneP> = ({ f, pulse }) => {
  const push = 1 + 0.04 * ramp(f, 0, 130);
  return (
    <AbsoluteFill>
      <Backdrop mode="light" f={f + 400} pulse={pulse} tint={A.blue} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <Headline text="فقط بپرس" f={f} at={3} mode="light" y={110} size={130} accent={[1]} />
        <Phone x={(V.W - PHONE.W) / 2} y={360} s={1.12}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #eef0f6, #e6e3f3)" }} />
          <ChatHeader name="سیگنال‌یار" sub="آنلاین · ۲۴ ساعته" f={f} />
          <Bubble side="me" a={pop(f, SEND + 2)} top={180}>{Q}</Bubble>
          {f >= SEND + 8 && f < CARD && <Bubble side="bot" a={pop(f, SEND + 8)} top={290}><TypingDots f={f} /></Bubble>}
          <Bubble side="bot" a={pop(f, CARD, 14)} top={290} w={440}>
            <SignalCard f={f} at={CARD} asset="طلا · انس جهانی" code="XAU/USD" rows={[["ورود", "۲٬۳۴۵", "#111"], ["هدف", "۲٬۳۸۰", A.green], ["حد ضرر", "۲٬۳۲۵", A.red]]} conf={0.86} w={392} stampAt={STAMP} />
          </Bubble>
          <InputBar text={f < SEND ? typed(Q, f, TYPE_AT, CPS) : ""} f={f} press={ramp(f, SEND - 3, SEND) - ramp(f, SEND, SEND + 6)} />
        </Phone>
        <div style={{ position: "absolute", left: 24, top: 1080 }}><Chip text="تحلیل تکنیکال" a={pop(f, 74)} mode="light" color={A.violet} style={{ fontSize: 32 }} /></div>
        <div style={{ position: "absolute", left: 690, top: 1320 }}><Chip text="اخبار لحظه‌ای" a={pop(f, 82)} mode="light" color={A.mint} style={{ fontSize: 32 }} /></div>
        <Ticker f={f + 90} y={1700} mode="light" a={ramp(f, 4, 16)} items={[["طلا", 0.8], ["بیت‌کوین", -1.2], ["دلار", 0.3], ["شاخص کل", 1.1], ["اتریوم", 2.4]]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────── 4 · 24/7 watch (dark) ───────── */
const Watch: React.FC<SceneP> = ({ f, pulse }) => {
  const cnt = 64;
  return (
    <AbsoluteFill>
      <Backdrop mode="dark" f={f + 600} pulse={pulse} tint={A.mint} tint2={A.violet} />
      <Headline text="۲۴ ساعته حواسش هست" f={f} at={3} mode="dark" y={150} size={98} accent={[0]} />
      <Dial24 f={f} a={pop(f, 2, 16)} x={V.W / 2} y={760} r={300} mode="dark" hits={[3, 9, 14, 21]} />
      <div style={{ position: "absolute", left: V.W / 2 - 215, top: 760 - 215, width: 430, height: 430, borderRadius: "50%", background: "radial-gradient(circle, rgba(7,7,12,.92) 55%, rgba(7,7,12,0) 72%)", opacity: ramp(f, cnt - 4, cnt + 6) }} />
      <Counter f={f} at={cnt} to={12.4} prefix="+" suffix="٪" size={120} y={690} color={A.mint} />
      <div style={{ position: "absolute", left: 0, width: V.W, top: 850, textAlign: "center", fontFamily: FONT_TEXT, fontSize: 34, color: "#8b8b99", opacity: ramp(f, cnt + 6, cnt + 14) }}>بازدهی این ماه</div>
      <Toast icon="check" title="هدف اول لمس شد" sub="طلا · ۱٫۵٪ سود" a={pop(f, 17, 14)} mode="dark" x={110} y={1180} />
      <Toast icon="bell" title="سیگنال جدید: بیت‌کوین" sub="ساعت ۳:۱۰ بامداد" a={pop(f, 33, 14)} mode="dark" x={110} y={1340} color={A.amber} />
      <Toast icon="up" title="هدف دوم لمس شد" sub="طلا · ۳٫۲٪ سود" a={pop(f, 49, 14)} mode="dark" x={110} y={1500} />
    </AbsoluteFill>
  );
};

/* ───────── 5 · outro + CTA (light) ───────── */
const CLICK = 66;
const Outro: React.FC<SceneP> = ({ f, pulse }) => {
  const iconA = pop(f, 2, 14);
  const cur = ramp(f, 40, 62, easeOut);
  const cx = 900 + (560 - 900) * cur, cy = 1820 + (1380 - 1820) * cur;
  const press = ramp(f, CLICK - 2, CLICK) - ramp(f, CLICK + 2, CLICK + 8);
  const orbit: TokenKind[] = ["btc", "gold", "usd", "eth"];
  return (
    <AbsoluteFill>
      <Backdrop mode="light" f={f + 800} pulse={pulse} />
      {orbit.map((k, i) => {
        const ang = f / 26 + (i * Math.PI) / 2;
        const z = Math.sin(ang);
        return <div key={i} style={{ position: "absolute", left: 540 - 55 + Math.cos(ang) * 330, top: 420 - 55 + z * 90, transform: `scale(${(0.75 + 0.25 * z) * iconA})`, zIndex: z > 0 ? 2 : 0, opacity: iconA }}><Token kind={k} s={110} f={f} seed={i + 20} /></div>;
      })}
      <div style={{ position: "absolute", left: 540 - 150, top: 270, transform: `scale(${iconA}) rotate(${(1 - iconA) * -20}deg)`, zIndex: 1 }}><AppIcon s={300} f={f} glow={pulse} /></div>
      <Ripple x={540} y={420} f={f} at={3} color={A.violet} />
      <Headline text="سیگنال‌یار" f={f} at={8} mode="light" y={700} size={170} />
      <Headline text="بازار رو ۲۴ ساعته برات می‌پاد" f={f} at={16} mode="light" y={950} size={64} font={FONT_TEXT} color="#6d6d78" stagger={2} />
      <CTA text="شروع رایگان در تلگرام" a={pop(f, 33, 14)} f={f} x={160} y={1300} pressed={press} />
      <Ripple x={540} y={1375} f={f} at={CLICK} color="#fff" />
      <GlassBurst x={540} y={1375} f={f} at={CLICK} />
      <Cursor x={cx} y={cy} press={press} a={ramp(f, 38, 44)} />
    </AbsoluteFill>
  );
};

const SCENES: { C: React.FC<SceneP>; mode: Mode }[] = [
  { C: Hook, mode: "dark" }, { C: Reveal, mode: "light" }, { C: Chat, mode: "light" }, { C: Watch, mode: "dark" }, { C: Outro, mode: "light" },
];

/* ───────── sound: [seconds, file, volume] — SFX at the START of the visible motion ───────── */
const s = (i: number, local: number) => CUTS[i] + local / FPS;
const CUES: [number, string, number][] = [
  [0.27, SFX.reveal[0], 0.7],
  ...[0, 1, 2, 3].map((i): [number, string, number] => [s(0, 2 + i * 3), SFX.pop[i % 3], 0.45]),
  [s(0, 60), SFX.bong, 0.55],
  [s(1, 0), SFX.card[0], 0.6],
  [s(1, 36), SFX.bell, 0.55],
  [s(1, 33), SFX.pop[0], 0.6], [s(1, 49), SFX.pop[1], 0.6], [s(1, 66), SFX.pop[2], 0.6],
  ...Array.from(Q).map((_, i): [number, string, number] => [s(2, TYPE_AT + (i * FPS) / CPS), SFX.key(i * 7 + 3), 0.5]).filter((_, i) => Q[i] !== " "),
  [s(2, SEND - 2), SFX.click, 0.8],
  [s(2, CARD), SFX.card[1], 0.55],
  [s(2, STAMP), SFX.reveal[1], 0.8],
  [s(3, 2), SFX.reveal[2], 0.6],
  [s(3, 17), SFX.card[0], 0.55], [s(3, 33), SFX.toggle, 0.55], [s(3, 49), SFX.card[0], 0.55],
  [s(3, 64), SFX.chips, 0.7],
  [s(4, 2), SFX.bell, 0.7],
  [s(4, 33), SFX.pop[1], 0.6],
  [s(4, CLICK - 2), SFX.mouse, 0.9],
  [s(4, CLICK), SFX.coins, 0.6],
];

export const LaunchReelDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = (ENV as number[])[frame] ?? 0;
  const starts = CUTS.map((c) => Math.round(c * FPS));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SCENES.map(({ C }, i) => {
        const st = starts[i];
        const next = starts[i + 1] ?? Infinity;
        if (frame < st - 6 || frame >= next + TR) return null;
        const pIn = i === 0 ? 1 : (frame - (st - 6)) / TR;
        const pOut = next === Infinity ? 0 : Math.max(0, Math.min(1, (frame - (next - 6)) / TR));
        return (
          <AbsoluteFill key={i} style={exitStyle(pOut)}>
            <ClipReveal p={pIn}><C f={frame - st} pulse={pulse} /></ClipReveal>
          </AbsoluteFill>
        );
      })}
      <Audio src={staticFile(MUSIC)} volume={(f) => 0.42 * interpolate(f, [0, 6, (END - 0.9) * FPS, END * FPS], [0, 1, 1, 0], { extrapolateRight: "clamp" })} />
      {CUES.map(([t, file, v], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(t * FPS))} layout="none">
          <Audio src={staticFile(file)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
