// Video 08 v2 — «NFP: هر استایلی، کمتر از ۱۰ دقیقه» · Halftone Pop · vertical 1080×1920
// User's voice (untouched) + word alignment. Reference 2 (Pocketsflow) motion: persistent presenter, colour-burst,
// cover, zoom-through, whip-pan transitions, layered UI, recap collage, falling-letter end card.
import React from "react";
import { AbsoluteFill, Html5Audio as Audio, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import {
  Avatar, BG, BlurDefs, Btn, Card, Character, circleIn, clamp, Confetti, coverUp, DotGrid, easeOut, fa, Giant, Grain, K, LogoDrop, nodAt, Panel,
  Phone, PHONE, Plane, Pointer, pop, punch, ramp, RingStamp, Say, shake, ca, Sparkle, Tile, Timer, Tiny, typed, voiceAt, Wave, whipIn,
  whipOut, Word, zoomIn, zoomOut,
} from "../styles/halftone-pop";
import ENV from "./voice-env.json";
import WORDS_RAW from "./words.json";

const WORDS = WORDS_RAW as Word[];
const VENV = ENV as number[];
const FPS = 30;
const fr = (s: number) => Math.round(s * FPS);
const T = (si: number, needle: string) => {
  const w = WORDS.find((x) => x.si === si && x.w.includes(needle));
  if (!w) throw new Error(`no word ${needle} in ${si}`);
  return w.s;
};
const sent = (si: number) => WORDS.filter((w) => w.si === si);
const DIR = "v08/char";
const END = 26.5;
const VW = 1080;
export const V08_FRAMES = fr(END);

type SP = { t: number; f: number; v: number; nod: number };
const rnd2 = (i: number) => { const x = Math.sin(i * 91.7 + 13.1) * 43758.5453; return x - Math.floor(x); };

/** Production timer: starts at scene E, reaches 09:12 exactly when the voice says «آماده‌ست». */
const T0 = 9.9, TREADY = 16.92, TSEC = 552;
const timerSec = (t: number) => clamp((t - T0) / (TREADY - T0)) * TSEC;

/* ═════════ A · idea (white) ═════════ */
const SA: React.FC<SP> = ({ t, nod }) => {
  const idea = T(0, "ایده");
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: BG.white }} />
      <DotGrid t={t} />
      <Tiny text="برای سازنده‌ها" y={150} a={pop(t, 0.05)} />
      <Say words={sent(0)} t={t} y={205} size={112} accents={{ 1: { swash: true } }} />
      <Card x={640} y={690} w={330} h={250} a={pop(t, idea + 0.05, 0.45)} tilt={7} bg={K.yellow} hard>
        <div style={{ padding: "22px 26px", fontSize: 34, lineHeight: 1.5 }}>
          <div>ایده‌ی ویدیو:</div>
          <div style={{ fontFamily: FONT_TEXT, fontSize: 28, color: "rgba(17,17,20,.7)" }}>{typed("یه ریلز درباره‌ی…", fr(t), fr(idea + 0.3), 30)}</div>
        </div>
      </Card>
      <Tile x={90} y={640} w={220} h={200} color="#fff" kind="idea" label="ایده" a={pop(t, idea + 0.18, 0.45)} rot={-8} id="ta-idea" />
      <Character dir={DIR} track={[[0, "idea"]]} t={t} x={470} bottom={2080} h={1260} enter="left" nod={nod} />
      <Sparkle x={960} y={640} s={56} a={pop(t, idea + 0.3)} t={t} />
      <Sparkle x={560} y={640} s={36} a={pop(t, idea + 0.4)} t={t + 1} />
    </AbsoluteFill>
  );
};

/* ═════════ B · how? (blue) ═════════ */
const TOOLS = [
  { kind: "film", label: "تدوین", sub: "۳ ساعت", color: K.orange },
  { kind: "mic", label: "صداگذاری", sub: "۱ ساعت", color: K.teal },
  { kind: "cc", label: "زیرنویس", sub: "۲ ساعت", color: K.purple },
  { kind: "wand", label: "موشن", sub: "۵ ساعت", color: K.yellow },
  { kind: "music", label: "موزیک", sub: "۱ ساعت", color: "#fff" },
  { kind: "render", label: "رندر", sub: "۲ ساعت", color: "#9fb6ff" },
] as const;
const SB: React.FC<SP> = ({ t, nod }) => {
  const start = T(1, "تبدیل"), q = T(1, "چه");
  const panic = ramp(t, q, q + 0.2) * (1 - ramp(t, 4.4, 4.6));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: BG.blue }} />
      <DotGrid t={t} color="rgba(255,255,255,.12)" />
      <div style={{ position: "absolute", left: 20, top: 820 }}>
        <Giant text="؟" size={900} a={ramp(t, q - 0.05, q + 0.3)} color="rgba(255,255,255,.18)" rot={-10 + Math.sin(t * 3) * 3} />
      </div>
      <Tiny text="مشکل همیشگی" y={150} color="rgba(255,255,255,.7)" />
      <Say words={sent(1)} t={t} y={205} size={86} color="#fff" accents={{ 5: { color: K.yellow, swash: true } }} br={[6]} />
      {TOOLS.map((tl, i) => {
        const at = start + i * 0.17;
        const col = i % 3, row = Math.floor(i / 3);
        return (
          <Tile key={i} x={690 - col * 310} y={590 + row * 280} w={280} h={250} color={tl.color} kind={tl.kind} label={tl.label} sub={tl.sub}
            a={ramp(t, at, at + 0.45)} rot={[-4, 3, -2, 5, -3, 2][i]} id={`tb-${i}`} shake={panic * (0.6 + 0.4 * Math.sin(t * 20 + i))} />
        );
      })}
      <div style={{ position: "absolute", left: 640, top: 1150, padding: "12px 28px", borderRadius: 999, background: K.red, color: "#fff", fontFamily: FONT_NUM, fontSize: 46, transform: `scale(${pop(t, q + 0.1)}) rotate(-6deg)`, direction: "rtl", boxShadow: "0 12px 30px rgba(0,0,0,.25)" }}>
        جمعاً {fa(14)} ساعت!
      </div>
      <Character dir={DIR} track={[[0, "idea"], [1.8, "confused"]]} t={t} x={470} bottom={2080} h={1260} at={-5} nod={nod} />
    </AbsoluteFill>
  );
};

/* ═════════ C+D · NFP styles → pick one (white) ═════════ */
const THUMBS = ["paper", "launch", "receipt", "pixel", "noir"];
const SC: React.FC<SP> = ({ t, nod }) => {
  const d = T(2, "ده‌ها"), build = T(2, "می‌سازیم"), pick = T(3, "انتخاب");
  const burst = ramp(t, d + 0.25, d + 0.6) * (1 - ramp(t, 7.9, 8.3));
  const sel = ramp(t, pick, pick + 0.35, easeOut);
  const px = 470, py = 640;
  const tw = 220, th = 170;
  const tpos = (i: number) => ({ x: 22 + (1 - (i % 2)) * (tw + 20), y: 250 + Math.floor(i / 2) * (th + 22) });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: BG.white }} />
      <DotGrid t={t} />
      {Array.from({ length: 16 }, (_, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        const at = d + 0.25 + ((i * 7) % 16) * 0.025;
        const a = ramp(t, at, at + 0.25) * burst;
        return (
          <div key={i} style={{ position: "absolute", left: 20 + col * 262, top: 560 + row * 330, width: 240, height: 300, borderRadius: 18, overflow: "hidden", border: `3px solid ${K.ink}`, opacity: a, transform: `scale(${0.7 + 0.3 * a}) rotate(${(rnd2(i) - 0.5) * 8}deg)`, background: "#222" }}>
            <img src={staticFile(`v08/thumbs/${THUMBS[i % 5]}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: i % 3 === 1 ? "grayscale(1) contrast(1.2)" : i % 3 === 2 ? "hue-rotate(40deg)" : undefined }} />
          </div>
        );
      })}
      <Tiny text={t < 8.25 ? "با NFP" : "انتخاب استایل"} y={150} />
      <Say words={sent(2)} t={t} y={205} size={82} accents={{ 1: { font: "'Arial Black', Arial", scale: 0.9 }, 2: { swash: true }, 3: { swash: true } }} out={8.2} />
      {t >= 8.25 && <Say words={sent(3)} t={t} y={205} size={104} accents={{ 2: { swash: true } }} />}
      <Phone x={px} y={py} rot={3 - 3 * ramp(t, 4.8, 5.4, easeOut)}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontFamily: "'Arial Black', Arial", fontWeight: 900, fontSize: 40 }}>N<span style={{ color: K.blue }}>F</span>P</div>
        <div style={{ position: "absolute", right: 26, top: 150, fontFamily: FONT_TEXT, fontSize: 36, direction: "rtl" }}>استایل‌ها</div>
        <div style={{ position: "absolute", left: 26, top: 158, fontFamily: FONT_TEXT, fontSize: 22, color: K.grey }}>{fa(Math.round(ramp(t, d, d + 1.2) * 36))} استایل</div>
        {[...THUMBS, null].map((img, i) => {
          const { x, y } = tpos(i);
          const at = img ? d + i * 0.12 : build;
          const a = ramp(t, at, at + 0.35);
          const isSel = i === 0;
          const grow = isSel ? sel : 0;
          return (
            <div key={i} style={{ position: "absolute", left: x + (0 - x) * grow, top: y + (0 - y) * grow, width: tw + (PHONE.W - 30 - tw) * grow, height: th + (PHONE.H - 30 - th) * grow, zIndex: isSel ? 5 : 1, borderRadius: 16 + 50 * grow, overflow: "hidden", border: `3px solid ${isSel && pick <= t ? K.blue : K.ink}`, opacity: clamp(a * 3) * (isSel ? 1 : 1 - sel * 0.6), transform: `scale(${0.7 + 0.3 * easeOut(a)})`, background: BG.paper }}>
              {img ? <img src={staticFile(`v08/thumbs/${img}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : (
                  <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", direction: "rtl", fontFamily: FONT_TEXT, fontSize: 22 }}>
                    <div style={{ textAlign: "center" }}>
                      <div>در حال ساخت…</div>
                      <div style={{ marginTop: 10, width: 170, height: 14, borderRadius: 7, background: "#e3e3e3", overflow: "hidden" }}>
                        <div style={{ width: `${(0.15 + 0.75 * ramp(t, build, build + 1.2)) * 100}%`, height: "100%", background: K.blue }} />
                      </div>
                    </div>
                  </div>
                )}
              {isSel && sel > 0.3 && <div style={{ position: "absolute", right: 24, top: 70, padding: "8px 20px", borderRadius: 999, background: K.blue, color: "#fff", fontFamily: FONT_TEXT, fontSize: 26, direction: "rtl", opacity: sel }}>✓ انتخاب شد</div>}
            </div>
          );
        })}
      </Phone>
      <Pointer x={px + 470 - 250 * ramp(t, 8.35, pick - 0.03, easeOut)} y={py + 1000 - 700 * ramp(t, 8.35, pick - 0.03, easeOut)} a={ramp(t, 8.3, 8.4) * (1 - ramp(t, pick + 0.4, pick + 0.55))} press={ramp(t, pick - 0.06, pick) - ramp(t, pick + 0.05, pick + 0.25)} />
      <Character dir={DIR} track={[[0, "present"], [8.35, "point"]]} t={t} x={250} bottom={2080} h={1080} at={4.95} nod={nod} />
    </AbsoluteFill>
  );
};

/* ═════════ E · voice (sky panel) ═════════ */
const VOICES = [{ n: "صدای خودت", d: "آپلود فایل" }, { n: "گوینده‌ی مرد", d: "گرم · آرام" }, { n: "گوینده‌ی زن", d: "پرانرژی" }];
const SE: React.FC<SP> = ({ t, v }) => {
  const pick = T(4, "انتخاب");
  const sel = ramp(t, pick, pick + 0.2);
  const frame = fr(t);
  return (
    <Panel tint="sky">
      <DotGrid t={t} o={0.6} />
      <Timer sec={timerSec(t)} x={40} y={40} a={pop(t, 10.0)} />
      <Tiny text="انتخاب صدا" y={120} x={40} />
      <Say words={sent(4)} t={t} x={40} y={170} size={92} accents={{ 1: { swash: true } }} />
      <Phone x={130} y={520} s={0.98} rot={-2}>
        <div style={{ position: "absolute", right: 30, top: 90, fontFamily: FONT_TEXT, fontSize: 38, direction: "rtl" }}>صدای ویدیو</div>
        {VOICES.map((vo, i) => {
          const on = i === 0 ? sel : 0;
          const a = pop(t, 10.05 + i * 0.12);
          return (
            <div key={i} style={{ position: "absolute", left: 22, right: 22, top: 170 + i * 200, height: 176, borderRadius: 28, border: `3px solid ${on > 0.5 ? K.blue : K.line}`, background: on > 0.5 ? "#eef2ff" : "#fff", boxShadow: on > 0.5 ? "0 16px 30px rgba(47,91,234,.2)" : "none", padding: "20px 24px", direction: "rtl", opacity: a, transform: `translateX(${(1 - a) * 120}px)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ width: 44, height: 44, borderRadius: 22, border: `4px solid ${on > 0.5 ? K.blue : "#bbb"}`, display: "grid", placeItems: "center" }}><div style={{ width: 22, height: 22, borderRadius: 11, background: K.blue, transform: `scale(${on})` }} /></div>
                <div>
                  <div style={{ fontFamily: FONT_TEXT, fontSize: 32 }}>{vo.n}</div>
                  <div style={{ fontFamily: FONT_TEXT, fontSize: 20, color: K.grey }}>{vo.d}</div>
                </div>
              </div>
              <div style={{ marginTop: 16 }}><Wave env={VENV} frame={frame - i * 17} w={440} h={50} color={on > 0.5 ? K.blue : "#c9c9d1"} n={26} active={i !== 0 || on > 0.4} /></div>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 22, right: 22, bottom: 50, textAlign: "center" }}><Btn text="ادامه" bg={K.blue} size={30} style={{ width: "80%" }} /></div>
      </Phone>
      <Card x={610} y={900} w={370} h={300} a={pop(t, 10.6, 0.45)} tilt={4}>
        <div style={{ padding: "22px 26px", direction: "rtl" }}>
          <div style={{ fontSize: 30 }}>تنظیمات</div>
          {([["سرعت", 0.55], ["انرژی", 0.8]] as const).map(([n, val], i) => (
            <div key={i} style={{ marginTop: 26 }}>
              <div style={{ fontSize: 22, color: K.grey }}>{n}</div>
              <div style={{ position: "relative", height: 10, borderRadius: 5, background: "#e7e7ee", marginTop: 12 }}>
                <div style={{ position: "absolute", right: 0, width: `${val * ramp(t, 10.8 + i * 0.2, 11.4 + i * 0.2, easeOut) * 100}%`, height: "100%", borderRadius: 5, background: K.blue }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Pointer x={620 - 180 * ramp(t, 10.3, pick - 0.03, easeOut)} y={1500 - 690 * ramp(t, 10.3, pick - 0.03, easeOut)} a={ramp(t, 10.25, 10.4)} press={ramp(t, pick - 0.06, pick) - ramp(t, pick + 0.05, pick + 0.25)} />
      <Avatar dir={DIR} t={t} x={160} y={1690} d={210} voice={v} at={10.0} />
    </Panel>
  );
};

/* ═════════ F · send script (lavender panel) ═════════ */
const SF: React.FC<SP> = ({ t, v }) => {
  const send = T(5, "می‌فرستی");
  const fly = ramp(t, send + 0.1, send + 0.8, (k) => k * k);
  const msg = "یه ایده برای محتوا داری. برای اینکه تبدیل بشه به ویدئو، چه کار می‌کنی؟ توی NFP…";
  const sentNow = t >= send;
  return (
    <Panel tint="lav">
      <DotGrid t={t} o={0.6} />
      <Timer sec={timerSec(t)} x={40} y={40} />
      <Tiny text="ارسال متن" y={120} x={40} />
      <Say words={sent(5)} t={t} x={40} y={170} size={104} accents={{ 0: { color: K.purple, swash: true } }} />
      <Phone x={230} y={500} s={0.98} rot={2}>
        <div style={{ position: "absolute", right: 30, top: 90, fontFamily: FONT_TEXT, fontSize: 36, direction: "rtl" }}>متن ویدیو</div>
        <div style={{ position: "absolute", left: 24, right: 24, top: 170, borderRadius: 26, background: sentNow ? K.purple : "#f2f1f7", color: sentNow ? "#fff" : K.ink, padding: "22px 26px", fontFamily: FONT_TEXT, fontSize: 28, lineHeight: 1.7, direction: "rtl", transform: `translateY(${-ramp(t, send, send + 0.4, easeOut) * 40}px)` }}>
          {typed(msg, fr(t), fr(11.9), 55)}
        </div>
        <div style={{ position: "absolute", left: 24, right: 24, top: 640, direction: "rtl", fontFamily: FONT_TEXT, fontSize: 22, color: K.grey, opacity: ramp(t, send + 0.1, send + 0.3) }}>
          در حال ارسال… {fa(Math.round(ramp(t, send + 0.1, send + 0.9) * 100))}٪
          <div style={{ marginTop: 10, height: 12, borderRadius: 6, background: "#e7e6ef", overflow: "hidden" }}><div style={{ width: `${ramp(t, send + 0.1, send + 0.9) * 100}%`, height: "100%", background: K.purple }} /></div>
        </div>
        <div style={{ position: "absolute", left: 22, bottom: 44 }}><Btn text="ارسال ↑" bg={K.purple} size={30} pressed={ramp(t, send - 0.06, send) - ramp(t, send + 0.05, send + 0.25)} /></div>
      </Phone>
      <svg width={VW} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d="M330 1400 C 500 1250, 700 1150, 1100 760" fill="none" stroke={K.purple} strokeWidth="5" strokeDasharray="14 14" pathLength={1} strokeDashoffset={1 - fly} opacity={0.8} />
      </svg>
      <Plane x={330 + fly * 760} y={1400 - fly * 640 - Math.sin(fly * Math.PI) * 120} a={ramp(t, send + 0.05, send + 0.15)} s={210} rot={-30 - fly * 10} />
      <Avatar dir={DIR} t={t} x={880} y={1690} d={210} voice={v} at={11.95} ring={K.purple} />
    </Panel>
  );
};

/* ═════════ G · under 10 minutes (black) ═════════ */
const SG: React.FC<SP> = ({ t, f, nod }) => {
  const ten = T(6, "۱۰");
  const hit = [fr(ten) - fr(13.48)];
  const sh = shake(f, hit, 14);
  return (
    <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px) scale(${punch(f, hit, 0.06)})`, ...ca(f, hit) }}>
      <AbsoluteFill style={{ background: BG.black }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, rgba(47,91,234,${0.35 * ramp(t, ten, ten + 0.3)}), transparent 60%)` }} />
      <div style={{ position: "absolute", left: 0, width: VW, top: 400, display: "flex", justifyContent: "center" }}>
        <Giant text="۱۰" size={1000} a={ramp(t, ten - 0.04, ten + 0.25)} color={K.blue} shadow="14px 14px 0 #fff" />
      </div>
      <div style={{ position: "absolute", left: 80, top: 1180, fontFamily: FONT_NUM, fontSize: 90, color: "#fff", opacity: ramp(t, T(6, "دقیقه"), T(6, "دقیقه") + 0.2), transform: `rotate(-6deg) scale(${pop(t, T(6, "دقیقه"))})` }}>دقیقه</div>
      <Timer sec={timerSec(t)} x={40} y={70} />
      <Tiny text="سرعت" y={150} color="rgba(255,255,255,.6)" />
      <Say words={sent(6)} t={t} y={205} size={110} color="#fff" accents={{ 3: { color: K.blue } }} />
      <Character dir={DIR} track={[[0, "wow"]]} t={t} x={560} bottom={2080} h={1180} at={13.45} enter="bottom" nod={nod} />
    </AbsoluteFill>
  );
};

/* ═════════ H · ready, same style (mint panel) ═════════ */
const SH: React.FC<SP> = ({ t, nod }) => {
  const ready = T(7, "آماده");
  const done = t >= ready;
  return (
    <Panel tint="mint">
      <DotGrid t={t} o={0.6} />
      <Timer sec={timerSec(t)} x={40} y={40} done={done} />
      <Tiny text="خروجی" y={120} x={40} />
      <Say words={sent(7)} t={t} x={40} y={170} size={92} accents={{ 3: { color: K.teal, swash: true }, 4: { color: K.green } }} />
      <Card x={30} y={520} w={960} h={600} a={pop(t, 15.05, 0.5)} tilt={-1.5} style={{ borderRadius: 34 }}>
        <div style={{ height: 70, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", borderBottom: `2px solid ${K.line}` }}>
          <div style={{ fontSize: 30 }}>ویدئوی تو</div>
          <div style={{ padding: "6px 18px", borderRadius: 999, background: "#eef2ff", color: K.blue, fontSize: 24 }}>کاغذ × بلوپرینت</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 70, bottom: 0, background: "#000" }}>
          <Sequence from={fr(14.88)} layout="none">
            <OffthreadVideo src={staticFile("v08/demo-paper.mp4")} startFrom={fr(1.5)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </Sequence>
          <div style={{ position: "absolute", left: 24, right: 24, bottom: 20, height: 10, background: "rgba(255,255,255,.35)", borderRadius: 5 }}>
            <div style={{ width: `${ramp(t, 15, 17.9) * 100}%`, height: "100%", background: K.teal, borderRadius: 5 }} />
          </div>
        </div>
      </Card>
      <div style={{ position: "absolute", left: 640, top: 1030, padding: "14px 34px", borderRadius: 999, background: K.green, color: "#fff", fontFamily: FONT_NUM, fontSize: 56, transform: `rotate(-6deg) scale(${pop(t, ready, 0.35)})`, boxShadow: "0 16px 30px rgba(25,179,107,.35)", direction: "rtl" }}>آماده ✓</div>
      <Confetti x={800} y={1080} t={t} at={ready} n={46} />
      <Character dir={DIR} track={[[0, "wave"]]} t={t} x={330} bottom={2050} h={900} at={15.2} nod={nod} />
    </Panel>
  );
};

/* ═════════ I · recap collage + stamps (paper) ═════════ */
const RECAP = ["a", "b", "c", "e", "f", "g", "h", "c2", "b2"];
const SI: React.FC<SP> = ({ t }) => {
  const fast = T(8, "سریع"), cheap = T(8, "ارزون");
  const pull = ramp(t, 17.92, 18.6, easeOut);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: BG.paper }} />
      <DotGrid t={t} />
      <AbsoluteFill style={{ transform: `scale(${2.6 - 1.6 * pull})`, transformOrigin: "50% 58%", filter: `blur(${(1 - pull) * 6}px)` }}>
        {RECAP.map((r, i) => {
          const col = i % 3, row = Math.floor(i / 3);
          return (
            <div key={i} style={{ position: "absolute", left: 45 + col * 335, top: 520 + row * 470, width: 320, height: 450, borderRadius: 22, overflow: "hidden", border: `3px solid ${K.ink}`, boxShadow: "0 18px 30px rgba(20,24,60,.18)", transform: `rotate(${(rnd2(i + 3) - 0.5) * 5}deg)`, background: "#ddd" }}>
              <img src={staticFile(`v08/recap/${r}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          );
        })}
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 480, background: `linear-gradient(${BG.paper} 75%, rgba(246,245,241,0))` }} />
      <Tiny text="چرا NFP" y={150} />
      <Say words={sent(8).slice(0, 6)} t={t} y={205} size={104} accents={{ 1: { swash: true }, 2: { swash: true }, 4: { color: K.orange, swash: true }, 5: { color: K.orange, swash: true } }} />
      <RingStamp x={330} y={1050} r={230} a={ramp(t, fast, fast + 0.25)} text="سریع‌ترین" color={K.blue} rot={-12} />
      <RingStamp x={740} y={1480} r={230} a={ramp(t, cheap, cheap + 0.25)} text="ارزون‌ترین" color={K.orange} rot={8} />
    </AbsoluteFill>
  );
};

/* ═════════ J · AI (black) ═════════ */
const SJ: React.FC<SP> = ({ t, nod }) => {
  const ai = T(8, "هوش");
  const glow = ramp(t, ai, ai + 0.5);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: BG.black }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 70%, rgba(47,91,234,${0.15 + 0.3 * glow}), transparent 60%)` }} />
      <Tiny text="روش جدید" y={150} color="rgba(255,255,255,.55)" />
      <Say words={sent(8).slice(6)} t={t} y={205} size={100} color="#fff" accents={{ 5: { color: "#7d9bff", swash: true }, 6: { color: "#7d9bff", swash: true } }} />
      {Array.from({ length: 7 }, (_, i) => (
        <Sparkle key={i} x={[180, 900, 260, 840, 540, 120, 960][i]} y={[760, 700, 980, 1000, 640, 1180, 1250][i]} s={[70, 56, 40, 64, 46, 34, 40][i]} a={ramp(t, ai + i * 0.07, ai + 0.3 + i * 0.07)} t={t + i} color={i % 2 ? "#7d9bff" : "#fff"} />
      ))}
      <Character dir={DIR} track={[[0, "point"]]} t={t} x={540} bottom={2080} h={1200} at={19.85} enter="bottom" nod={nod} />
    </AbsoluteFill>
  );
};

/* ═════════ K · end card (white) ═════════ */
const SK: React.FC<SP> = ({ t }) => {
  const nfp = T(9, "NFP");
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: BG.white }} />
      <DotGrid t={t} o={0.5} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(47,91,234,${0.14 * ramp(t, nfp, nfp + 0.6)}), transparent 55%)` }} />
      {THUMBS.concat(["paper"]).map((img, i) => {
        const a = ramp(t, 24.0 + i * 0.08, 24.45 + i * 0.08, easeOut);
        const ang = -38 + i * 15.2;
        return (
          <div key={i} style={{ position: "absolute", left: 540 - 110, top: 1700, width: 220, height: 300, borderRadius: 18, overflow: "hidden", border: `3px solid ${K.ink}`, boxShadow: "0 18px 30px rgba(20,24,60,.2)", transformOrigin: "50% 160%", transform: `rotate(${ang * a}deg) translateY(${(1 - a) * 300 + Math.sin(t * 2 + i) * 6}px)`, opacity: a, background: "#222" }}>
            <img src={staticFile(`v08/thumbs/${img}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, top: 0, width: VW, height: 872, overflow: "hidden", opacity: t >= nfp + 0.4 ? 1 : 0 }}>
        <Character dir={DIR} track={[[0, "peek"]]} t={t} x={560} bottom={935 + (1 - ramp(t, nfp + 0.4, nfp + 0.85, easeOut)) * 420} h={560} at={-5} enter="bottom" ht={{ cell: 5 }} />
      </div>
      <LogoDrop t={t} at={nfp - 0.1} x={540} y={960} size={260} />
      <Say words={sent(9)} t={t} y={1160} size={88} align="center" accents={{ 0: { font: "'Arial Black', Arial", scale: 0.85 }, 2: { swash: true } }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1400, textAlign: "center", opacity: ramp(t, 25.1, 25.4), transform: `translateY(${(1 - ramp(t, 25.1, 25.4, easeOut)) * 30}px)` }}>
        <Btn text="به‌زودی · منتظرمون باش" bg={K.blue} size={44} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1535, textAlign: "center", fontFamily: FONT_TEXT, fontSize: 28, color: K.grey, opacity: ramp(t, 25.4, 25.7), direction: "rtl" }}>هر استایلی · هر صدایی · کمتر از {fa(10)} دقیقه</div>
    </AbsoluteFill>
  );
};

/* ═════════ edit: scenes + transitions ═════════ */
type Tr = { kind: "none" | "circle" | "cover" | "zoom" | "whip" | "cut" | "pull"; at: number; dur: number; x?: number; y?: number };
const SCENES: { C: React.FC<SP>; tr: Tr }[] = [
  { C: SA, tr: { kind: "none", at: 0, dur: 0 } },
  { C: SB, tr: { kind: "circle", at: 1.55, dur: 0.45, x: 700, y: 300 } },
  { C: SC, tr: { kind: "cover", at: 4.5, dur: 0.45 } },
  { C: SE, tr: { kind: "zoom", at: 9.72, dur: 0.4, x: 740, y: 1190 } },
  { C: SF, tr: { kind: "whip", at: 11.7, dur: 0.38 } },
  { C: SG, tr: { kind: "cut", at: 13.48, dur: 0 } },
  { C: SH, tr: { kind: "circle", at: 14.88, dur: 0.45, x: 540, y: 1000 } },
  { C: SI, tr: { kind: "pull", at: 17.9, dur: 0.3 } },
  { C: SJ, tr: { kind: "cut", at: 19.85, dur: 0 } },
  { C: SK, tr: { kind: "circle", at: 22.95, dur: 0.5, x: 540, y: 960 } },
];
/** Frames used for the recap collage (render them with `remotion still` into public/v08/recap/). */
export const RECAP_FRAMES: Record<string, number> = { a: 40, b: 125, c: 215, c2: 275, e: 335, f: 395, g: 440, h: 520, b2: 100 };

const inStyle = (tr: Tr, p: number): React.CSSProperties => {
  if (tr.kind === "circle") return circleIn(p, tr.x ?? 540, tr.y ?? 960);
  if (tr.kind === "cover") return coverUp(p);
  if (tr.kind === "zoom") return zoomIn(p);
  if (tr.kind === "whip") return whipIn(p);
  if (tr.kind === "pull") return { opacity: clamp(p * 2) };
  return {};
};
const outStyle = (next: Tr, p: number): React.CSSProperties => {
  if (next.kind === "zoom") return zoomOut(p, next.x, next.y);
  if (next.kind === "whip") return whipOut(p);
  if (next.kind === "cover") return { transform: `translateY(${-easeOut(p) * 300}px) scale(${1 - 0.1 * easeOut(p)})`, filter: `brightness(${1 - 0.4 * p})` };
  return {};
};

/* ═════════ sound ═════════ */
const KN = (p: string) => `kenney/${p}.ogg`;
const CUES: [number, string, number][] = [
  [0.05, KN("impact/impactSoft_medium_001"), 0.5],
  [T(0, "ایده") + 0.05, KN("interface/drop_002"), 0.55],
  [1.55, "sfx-lib/sweep.wav", 0.35],
  ...TOOLS.map((_, i): [number, string, number] => [T(1, "تبدیل") + i * 0.17, KN(`casino/card-place-${(i % 4) + 1}`), 0.4]),
  [T(1, "چه") + 0.1, KN("interface/error_005"), 0.35],
  [4.5, "sfx-lib/whoosh.wav", 0.45],
  [T(2, "ده‌ها") + 0.25, KN("casino/card-fan-1"), 0.45],
  [T(3, "انتخاب") - 0.03, KN("ui/mouseclick1"), 0.85],
  [T(3, "انتخاب") + 0.05, KN("interface/bong_001"), 0.4],
  [9.72, "sfx-lib/whoosh.wav", 0.45],
  [T(4, "انتخاب") - 0.03, KN("interface/switch_002"), 0.7],
  [11.7, "sfx-lib/sweep.wav", 0.35],
  [T(5, "می‌فرستی") - 0.03, KN("interface/click_003"), 0.8],
  [T(5, "می‌فرستی") + 0.1, "sfx-lib/whoosh.wav", 0.4],
  [13.48, KN("impact/impactSoft_heavy_001"), 0.5],
  [T(6, "۱۰") - 0.02, KN("impact/impactPunch_medium_001"), 0.6],
  [14.88, "sfx-lib/sweep.wav", 0.3],
  [T(7, "آماده") - 0.02, KN("impact/impactBell_heavy_000"), 0.45],
  [T(7, "آماده") + 0.05, KN("casino/chips-collide-2"), 0.4],
  [17.9, "sfx-lib/whoosh.wav", 0.35],
  [T(8, "سریع") - 0.02, "sfx-lib/stamp.wav", 0.65],
  [T(8, "ارزون") - 0.02, "sfx-lib/stamp.wav", 0.65],
  [19.85, KN("impact/impactSoft_heavy_002"), 0.45],
  [T(8, "هوش") - 0.02, "sfx-lib/chime.wav", 0.3],
  [22.95, "sfx-lib/sweep.wav", 0.3],
  ...[0, 1, 2].map((i): [number, string, number] => [T(9, "NFP") + 0.2 + i * 0.09, KN(`impact/impactWood_light_00${i}`), 0.55]),
  [T(9, "NFP") + 0.55, KN("impact/impactBell_heavy_003"), 0.35],
];

export const Video08: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const v = voiceAt(VENV, WORDS, t);
  const nod = nodAt(WORDS, t) * 0.6;
  return (
    <AbsoluteFill style={{ background: BG.white, fontFamily: FONT_TEXT }}>
      <BlurDefs />
      {SCENES.map(({ C, tr }, i) => {
        const next = SCENES[i + 1]?.tr;
        const endVis = next ? next.at + next.dur : END + 1;
        if (t < tr.at || t >= endVis) return null;
        const pIn = tr.dur ? (t - tr.at) / tr.dur : 1;
        const pOut = next && next.dur ? clamp((t - next.at) / next.dur) : 0;
        return (
          <AbsoluteFill key={i} style={{ ...(next ? outStyle(next, pOut) : {}), zIndex: i }}>
            <AbsoluteFill style={inStyle(tr, pIn)}>
              <C t={t} f={frame - fr(tr.at)} v={v} nod={nod} />
            </AbsoluteFill>
          </AbsoluteFill>
        );
      })}
      <Grain f={frame} o={0.05} />
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(t, [END - 0.4, END], [0, 1], { extrapolateLeft: "clamp" }) }} />
      <Audio src={staticFile("v08/voice.mp3")} />
      <Audio src={staticFile("music/happy-beats-business-moves-vol-11-by-ende-dot-app.mp3")} volume={(fm) => 0.12 * interpolate(fm, [0, 10, fr(END - 1.2), fr(END)], [0, 1, 1, 0], { extrapolateRight: "clamp" })} />
      {CUES.map(([s, file, vol], i) => (
        <Sequence key={i} from={Math.max(0, fr(s))} layout="none">
          <Audio src={staticFile(file)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
