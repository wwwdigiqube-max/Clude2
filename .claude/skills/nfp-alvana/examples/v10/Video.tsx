// Video 10 — «NFP» in Photocopy Story style (horizontal). Charlie (ElevenLabs v3) Persian narration, word-synced.
// v2 (user feedback): photos printed on the sheets (Unsplash, see public/v10/photos/CREDITS.md), marker that hugs the
// text (<Mark>), denser ref-like piles, BigStat typography, word-reveal subtitles higher up, fewer scribble SFX.
import React from "react";
import { AbsoluteFill, Html5Audio as Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import {
  BigStat, BlurDefs, chunkWords, clamp, CopyFx, Desk, easeBack, easeOut, fa, FullPaper, Icon, Lines, Mark, MCheck, MCross, MLine, Notif, P, PF, Photo, ramp,
  Rewind, rnd, Sheet, Stamp, Subs, World, Word,
} from "../styles/photocopy-story";
import WORDS_RAW from "./words.json";

const WORDS = WORDS_RAW as Word[];
const FPS = 30;
const fr = (s: number) => Math.round(s * FPS);
const clean = (w: string) => w.replace(/[،؛.…:!؟«»]/g, "");
const T = (si: number, needle: string, nth = 0) => {
  const exact = WORDS.filter((x) => x.si === si && clean(x.w) === needle);
  const hits = exact.length > nth ? exact : WORDS.filter((x) => x.si === si && clean(x.w).includes(needle));
  if (!hits[nth]) throw new Error(`no word ${needle} in ${si}`);
  return hits[nth].s;
};
const CHUNKS = chunkWords(WORDS, 7);
export const V10_END = 66.5;
export const V10_FRAMES = fr(V10_END);
const SW = 1920, SH = 1080;
const SUB_Y = 830;
const REC = (n: string) => staticFile(`v10/recap/${n}.jpg`);
const PH = (n: string) => `v10/photos/${n}.jpg`;
const POST = (i: number) => `v10/photos/posts/p${String((i % 22) + 1).padStart(2, "0")}.jpg`;
const G = { a: "#3a3733", b: "#57534d", c: "#6f6a62", d: "#4a4642" };

/* ═════════ printed desktop (the first screen): ideas get buried under the day ═════════ */
const IDEAS = ["ریلز «۳ اشتباه رایج»", "ولاگ یک روز کاری", "آموزش ادیت با گوشی", "پشت‌صحنه‌ی کار", "جواب سؤال‌های دایرکت"];
const NOTIFS: [string, string, string, string, string?][] = [
  ["۳۱", "تقویم", "جلسه‌ی تیم · ۱۰:۰۰", "۵ دقیقه‌ی دیگه"],
  ["پ", "پیام‌ها", "مدیر: گزارش رو فرستادی؟", "الان", "فوری"],
  ["@", "ایمیل", "۱۲ ایمیل خوانده‌نشده", "الان"],
  ["✓", "یادآور", "قبض، خرید، تماس با بانک", "۱ ساعت پیش"],
  ["۳۱", "تقویم", "جلسه با مشتری · ۱۴:۳۰", "امروز"],
  ["پ", "گروه کاری", "۴۸ پیام جدید", "الان"],
  ["⌂", "خانه", "قرار دکتر · ۱۸:۰۰", "امروز"],
  ["@", "ایمیل", "فاکتور این ماه آماده‌ست", "الان"],
  ["پ", "مامان", "شام میای؟", "الان"],
  ["✓", "یادآور", "تمدید بیمه‌ی ماشین", "دیروز", "فوری"],
  ["۳۱", "تقویم", "ددلاین پروژه · فردا", "امروز"],
  ["پ", "پیام‌ها", "مشتری: فایل‌ها کی می‌رسه؟", "الان"],
  ["@", "ایمیل", "یادآوری جلسه‌ی ساعت ۴", "الان"],
  ["⌂", "خانه", "تعمیرکار · ۱۷:۰۰", "امروز"],
  ["پ", "گروه کاری", "کسی گزارش رو دید؟", "الان"],
  ["✓", "یادآور", "خرید هفته", "امروز"],
  ["۳۱", "تقویم", "کلاس زبان · ۱۹:۳۰", "امروز"],
  ["پ", "پیام‌ها", "مدیر: جلسه جلو افتاد", "الان", "فوری"],
  ["@", "ایمیل", "۳ پیام از بانک", "الان"],
  ["پ", "گروه دوستان", "۱۲۰ پیام جدید", "الان"],
  ["✓", "یادآور", "زنگ به تعمیرگاه", "امروز"],
];
const NBG: Record<string, string> = { "۳۱": G.d, "پ": G.b, "@": G.a, "✓": G.c, "⌂": G.b };
const Desktop: React.FC<{ t: number }> = ({ t }) => {
  const busy = T(0, "وقت"), buried = 4.25;
  const idea = T(0, "ایده");
  return (
    <FullPaper>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 44, borderBottom: `1px solid ${P.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 30px", direction: "rtl", fontFamily: PF.ui, fontSize: 20, color: P.ink }}>
        <div style={{ display: "flex", gap: 26 }}><b>یادداشت‌ها</b><span>فایل</span><span>ویرایش</span><span>نمایش</span><span>پنجره</span></div>
        <div>دوشنبه ۸:۵۵ صبح</div>
      </div>
      {/* notes window with ideas */}
      <div style={{ position: "absolute", right: 110, top: 100, width: 720, height: 600, borderRadius: 18, background: "rgba(252,250,246,.88)", border: `1px solid ${P.line}`, boxShadow: "0 8px 20px rgba(0,0,0,.08)", direction: "rtl", fontFamily: PF.ui, padding: "26px 40px" }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: P.ink }}>ایده‌های محتوا</div>
        <div style={{ fontSize: 18, color: P.faint, marginBottom: 26 }}>۵ یادداشت · آخرین ویرایش: ۳ هفته پیش</div>
        <Mark p={ramp(t, idea + 0.1, idea + 0.55)} pad={22} sw={5} seed={2}>
          <div>
            {IDEAS.map((s, i) => (
              <div key={i} style={{ fontSize: 28, color: P.ink2, padding: "9px 0", opacity: ramp(t, 0.2 + i * 0.3, 0.35 + i * 0.3) }}>
                <span style={{ color: P.faint }}>ایده {fa(i + 1)} ·</span> {s}
              </div>
            ))}
          </div>
        </Mark>
      </div>
      {/* notification pile: 3 columns cascade until the ideas are buried */}
      {NOTIFS.map(([g, ti, b, tm, tag], i) => {
        const col = Math.floor(i / 7), row = i % 7;
        const at = col === 2 ? buried + row * 0.07 : busy - 0.12 + (col * 7 + row) * 0.055;
        const a = ramp(t, at, at + 0.18, easeOut);
        if (a <= 0) return null;
        const x = 50 + col * 610 + rnd(i * 3) * 30, y = 64 + row * 118 + rnd(i * 5) * 10;
        return <div key={i} style={{ position: "absolute", left: x, top: y, opacity: a, transform: `translateX(${(1 - a) * -70}px) rotate(${(rnd(i) - 0.5) * 1.6}deg)`, boxShadow: "0 6px 14px rgba(0,0,0,.12)", borderRadius: 18 }}><Notif g={g} title={ti} body={b} time={tm} bg={NBG[g]} tag={tag} w={580} /></div>;
      })}
      {/* dock */}
      <div style={{ position: "absolute", left: "50%", bottom: 26, transform: "translateX(-50%)", padding: "12px 20px", borderRadius: 26, background: "rgba(250,248,244,.8)", border: `1px solid ${P.line}`, display: "flex", gap: 18 }}>
        {[["@", G.a, 12], ["پ", G.b, 48], ["۳۱", G.d, 3], ["✓", G.c, 7], ["⌂", G.b, 1], ["▶", "#2a2724", 0]].map(([g, bg, n], i) => (
          <Icon key={i} g={g as string} bg={bg as string} s={66} badge={t > busy + i * 0.15 ? Math.min(n as number, Math.round(((t - busy - i * 0.15) / 0.8) * (n as number))) : 0} />
        ))}
      </div>
    </FullPaper>
  );
};

/* ═════════ AB · desktop → the pile of jobs (0 → 12.1) ═════════ */
const SCRIPT_TXT = ["سکانس ۱ — داخلی، روز", "باز شدن روی دست‌ها…", "راوی: «فکر می‌کردم…»", "سکانس ۲ — کات به بیرون"];
const STICKY: [number, number, number, string][] = [[3980, 820, -6, "قبل از ساعت ۵ تموم شه!"], [3220, 40, 4, "میکروفون شارژ؟"], [2380, 860, -3, "زیرنویس یادت نره"], [1580, 30, 5, "کاور؟ تامنیل؟"], [880, 880, -4, "نور پنجره فقط تا ۴"], [180, 60, 3, "هشتگ‌ها؟"]];
const AB: React.FC<{ t: number }> = ({ t }) => {
  const sc = T(1, "سناریو"), fl = T(1, "فیلم"), ed = T(1, "ادیت"), lo = T(1, "لوکیشن"), zh = T(1, "ظاهر"), en = T(1, "انرژی‌ت");
  const keys: [number, number, number, number, number?][] = [
    [0, 4600, 540, 2.02], [4.75, 4600, 540, 2.12], [5.75, 4380, 560, 1.02],
    [5.9, 3650, 530, 1.28], [6.95, 3620, 530, 1.32], [7.25, 2850, 520, 1.3], [7.95, 2830, 520, 1.34], [8.2, 2050, 520, 1.3], [8.6, 2040, 520, 1.33],
    [8.9, 1300, 520, 1.3], [9.85, 1290, 520, 1.34], [10.15, 620, 520, 1.3], [11.35, 620, 540, 1.38], [12.1, 2500, 540, 0.36],
  ];
  const battery = 1 - ramp(t, en, en + 0.8, easeOut) * 0.88;
  const mk = (at: number) => ramp(t, at + 0.05, at + 0.45);
  return (
    <World t={t} keys={keys} w={5600} h={1080} sw={SW} sh={SH} bg={P.desk} hand={2.5}>
      <Desk w={5600} h={1080} />
      {/* under-layer: sticky notes + stray prints so the desk never reads empty */}
      <Sheet x={2980} y={700} w={420} h={300} rot={8}><Photo src={PH("phone")} style={{ position: "absolute", inset: 16 }} /></Sheet>
      <Sheet x={1440} y={640} w={380} h={360} rot={-7}><Photo src={PH("cams")} style={{ position: "absolute", inset: 16 }} /></Sheet>
      <Sheet x={60} y={640} w={360} h={380} rot={6}><Photo src={PH("studio2")} style={{ position: "absolute", inset: 16 }} /></Sheet>
      {STICKY.map(([x, y, r, s], i) => (
        <Sheet key={i} x={x} y={y} w={300} h={170} rot={r} pin={false} style={{ backgroundColor: "#dcd5c6" }}>
          <div style={{ padding: "26px 24px", direction: "rtl", fontFamily: PF.ui, fontWeight: 700, fontSize: 28, color: P.ink, lineHeight: 1.4 }}>{s}</div>
        </Sheet>
      ))}
      {/* 1 · desktop print */}
      <Sheet x={4120} y={270} w={960} h={540} pin={t > 5.0}>
        <div style={{ width: 1920, height: 1080, transform: "scale(.5)", transformOrigin: "0 0" }}><Desktop t={t} /></div>
      </Sheet>
      {/* 2 · script */}
      <Sheet x={3340} y={130} w={620} h={800} rot={-2}>
        <div style={{ padding: "50px 54px", direction: "rtl", fontFamily: PF.ui, color: P.ink }}>
          <div style={{ fontSize: 22, color: P.faint }}>سند بدون عنوان — سناریو</div>
          <div style={{ margin: "14px 0 30px" }}><Mark p={mk(sc)} pad={18} seed={3}><span style={{ fontSize: 46, fontWeight: 700 }}>سناریوی ویدئو</span></Mark></div>
          {SCRIPT_TXT.map((l, i) => {
            const n = Math.ceil(clamp((t - sc - i * 0.3) / 0.5) * l.length);
            return <div key={i} style={{ fontFamily: PF.code, fontSize: 26, lineHeight: 2, color: i % 2 ? P.ink2 : P.ink }}>{l.slice(0, n)}{n > 0 && n < l.length ? "▍" : ""}</div>;
          })}
          <div style={{ marginTop: 20 }}><Lines n={7} w={500} seed={3} /></div>
        </div>
      </Sheet>
      {/* 3 · camera viewfinder (real photo) */}
      <Sheet x={2500} y={250} w={700} h={540} rot={2}>
        <div style={{ position: "absolute", left: 24, right: 24, top: 24, height: 400, border: "3px solid #333" }}>
          <Photo src={PH("film")} style={{ position: "absolute", inset: 0 }} zoom={1 + (t - fl) * 0.01} />
          {[0, 1].map((i) => <div key={i} style={{ position: "absolute", left: `${33.3 * (i + 1)}%`, top: 0, bottom: 0, width: 1.5, background: "rgba(255,255,255,.55)" }} />)}
          {[0, 1].map((i) => <div key={`h${i}`} style={{ position: "absolute", top: `${33.3 * (i + 1)}%`, left: 0, right: 0, height: 1.5, background: "rgba(255,255,255,.55)" }} />)}
          <div style={{ position: "absolute", right: 18, top: 14, fontFamily: PF.mono, fontWeight: 700, fontSize: 26, color: "#fff", direction: "ltr", textShadow: "0 1px 3px #000" }}><span style={{ color: "#c8352b" }}>●</span> REC 00:00:{String(Math.max(0, Math.floor((t - fl) * 3) % 60)).padStart(2, "0")}</div>
        </div>
        <div style={{ position: "absolute", right: 40, bottom: 30, direction: "rtl", fontFamily: PF.ui, fontWeight: 700, fontSize: 30, color: P.ink }}>
          <Mark p={mk(fl)} pad={14} seed={4}>برداشت ۷ · باز هم خراب شد</Mark>
        </div>
      </Sheet>
      {/* 4 · editing: monitor photo + timeline */}
      <Sheet x={1690} y={250} w={720} h={540} rot={-1.5}>
        <div style={{ padding: 24, direction: "ltr" }}>
          <Photo src={PH("timeline")} style={{ height: 210, border: "2px solid #444", marginBottom: 14 }} />
          {[[G.c, [[0, 30], [34, 22], [60, 30]]], ["#8a857c", [[10, 40], [55, 35]]], [G.b, [[0, 95]]]].map(([c, cl], r) => (
            <div key={r} style={{ position: "relative", height: 30, marginBottom: 7, background: "rgba(0,0,0,.05)" }}>
              {(cl as number[][]).map(([s, w], k) => <div key={k} style={{ position: "absolute", left: `${s}%`, width: `${w}%`, top: 3, bottom: 3, background: c as string, borderRadius: 4 }} />)}
            </div>
          ))}
          <div style={{ position: "absolute", left: 24 + ((t - ed) * 90 + 200) % 660, top: 248, width: 3, height: 120, background: P.red }} />
          <div style={{ direction: "rtl", marginTop: 16, fontFamily: PF.ui, fontSize: 24, color: P.ink }}>
            <Mark p={mk(ed)} pad={12} seed={5}>پروژه_نهایی_۳ · <b>۴ ساعت و ۱۲ دقیقه</b></Mark>
          </div>
        </div>
      </Sheet>
      {/* 5 · location booking */}
      <Sheet x={1020} y={190} w={560} h={660} rot={2.5}>
        <Photo src={PH("studio")} style={{ height: 330 }} pos="50% 60%" />
        <div style={{ padding: "22px 32px", direction: "rtl", fontFamily: PF.ui, color: P.ink }}>
          <Mark p={mk(lo)} pad={14} seed={6}><span style={{ fontSize: 38, fontWeight: 700 }}>رزرو استودیو</span></Mark>
          <div style={{ fontSize: 24, color: P.ink2, margin: "12px 0 16px" }}>۲ ساعت · فقط پنجشنبه‌ها خالیه</div>
          <div style={{ display: "inline-block", padding: "8px 22px", borderRadius: 10, background: G.a, color: "#f3efe8", fontSize: 24 }}>پرداخت و رزرو</div>
        </div>
      </Sheet>
      {/* 6 · mirror + energy */}
      <Sheet x={340} y={160} w={560} h={740} rot={-2}>
        <div style={{ position: "absolute", left: 50, right: 50, top: 40, height: 420, borderRadius: 230, border: "6px solid #3a3733", overflow: "hidden" }}>
          <Photo src={PH("mirror")} style={{ position: "absolute", inset: 0 }} pos="30% 40%" />
        </div>
        <div style={{ position: "absolute", left: 40, right: 40, top: 500, direction: "rtl", fontFamily: PF.ui, fontSize: 28, color: P.ink }}>
          <Mark p={mk(zh)} pad={12} seed={7}>مو <b>✓</b> · لباس <b>✓</b> · نور <b>✗</b></Mark>
          <div style={{ marginTop: 34 }}>
            <Mark p={mk(en)} pad={14} seed={8}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span>انرژی</span>
                <div style={{ position: "relative", width: 230, height: 54, border: "4px solid #333", borderRadius: 10 }}>
                  <div style={{ position: "absolute", right: 4, top: 4, bottom: 4, width: `${battery * 100}%`, maxWidth: 214, background: battery < 0.3 ? "#8a2a22" : "#555", borderRadius: 4 }} />
                  <div style={{ position: "absolute", left: -12, top: 15, width: 8, height: 18, background: "#333" }} />
                </div>
                <span style={{ fontFamily: PF.code, fontWeight: 700 }}>{fa(Math.round(battery * 100))}٪</span>
              </div>
            </Mark>
          </div>
        </div>
      </Sheet>
      {([[4380, 470, 3650, 350], [3340, 520, 2850, 320], [2500, 470, 2050, 640], [1690, 560, 1300, 520], [1020, 540, 620, 690]] as const).map(([ax, ay, bx, by], i) => (
        <MLine key={i} a={[ax, ay]} b={[bx, by]} p={ramp(t, 11.35 + i * 0.1, 11.6 + i * 0.1)} bend={80} sw={5} />
      ))}
    </World>
  );
};

/* ═════════ C · giant numbers over the calendar (12.1 → 16.1) ═════════ */
const DAYS = ["شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];
const SC: React.FC<{ t: number }> = ({ t }) => {
  const one = T(2, "ساخت"), half = T(2, "نصف"), many = T(2, "چند");
  const phase = t < half - 0.05 ? 0 : t < many - 0.05 ? 1 : 2;
  const st: { v: string; u: string; u2: string; at: number }[] = [
    { v: "۱", u: "ویدئو", u2: "فقط یکی", at: one },
    { v: "½", u: "روز", u2: "رفت که رفت", at: half },
    { v: "چند", u: "روز", u2: "برای یک ویدئو", at: many },
  ];
  const s = st[phase];
  return (
    <World t={t} keys={[[12.1, 960, 540, 1.12], [16.1, 960, 540, 1.0]]} sw={SW} sh={SH} bg={P.paper} hand={2}>
      <FullPaper>
        <div style={{ position: "absolute", inset: 60, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 14, direction: "rtl" }}>
          {Array.from({ length: 21 }, (_, i) => (
            <div key={i} style={{ border: `2px solid ${P.line}`, borderRadius: 8, padding: 12, fontFamily: PF.ui, fontSize: 20, color: P.ink2, background: i % 7 > 4 ? "rgba(0,0,0,.03)" : "transparent" }}>
              <div style={{ fontWeight: 700 }}>{DAYS[i % 7]} {fa(3 + i)}</div>
              {Array.from({ length: 1 + ((i * 3) % 3) }, (_, k) => <div key={k} style={{ marginTop: 8, height: 26, borderRadius: 5, background: "rgba(42,39,36,.16)" }} />)}
            </div>
          ))}
        </div>
      </FullPaper>
      {Array.from({ length: 21 }, (_, i) => {
        const col = 6 - (i % 7), row = Math.floor(i / 7);
        const w = (1920 - 120 - 6 * 14) / 7, h = (1080 - 120 - 2 * 14) / 3;
        return <MCross key={i} x={60 + col * (w + 14) + 20} y={60 + row * (h + 14) + 20} w={w - 40} h={h - 40} p={ramp(t, many + 0.2 + i * 0.03, many + 0.45 + i * 0.03)} sw={5} />;
      })}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 47%, rgba(233,229,221,.95) 30%, rgba(233,229,221,0) 62%)" }} />
      <BigStat key={phase} value={s.v} unit={s.u} unit2={s.u2} a={ramp(t, s.at - 0.05, s.at + 0.3)} size={phase === 2 ? 280 : 330} y={470} />
    </World>
  );
};

/* ═════════ D · wanted poster (16.1 → 17.25) ═════════ */
const SD: React.FC<{ t: number }> = ({ t }) => {
  const a = ramp(t, 16.1, 16.55, easeOut);
  return (
    <World t={t} keys={[[16.1, 960, 560, 1.12], [17.25, 960, 540, 1.04]]} sw={SW} sh={SH} bg="#c9c5bd" hand={2}>
      <FullPaper>
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 90 + i * 140, borderTop: "3px solid rgba(42,39,36,.55)" }}>
            <span style={{ position: "absolute", left: 30, top: -40, fontFamily: PF.code, fontWeight: 700, fontSize: 32, color: P.ink }}>{fa(200 - i * 15)}</span>
            <span style={{ position: "absolute", right: 30, top: -40, fontFamily: PF.code, fontWeight: 700, fontSize: 32, color: P.ink }}>{fa(200 - i * 15)}</span>
          </div>
        ))}
      </FullPaper>
      <div style={{ position: "absolute", left: 960 - 330, top: 110, width: 660, height: 800, transform: `perspective(1600px) rotateY(${(1 - a) * 70}deg) translateY(${(1 - a) * 40}px)`, boxShadow: "0 30px 50px rgba(0,0,0,.45)" }}>
        <Sheet x={0} y={0} w={660} h={800} pin={false} from="none">
          <div style={{ position: "absolute", inset: 22, border: "5px solid #2a2724", direction: "rtl", textAlign: "center", fontFamily: PF.ui, color: P.ink }}>
            <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: 4, marginTop: 24 }}>تحت تعقیب</div>
            <Photo src={PH("clock")} style={{ margin: "20px auto", width: 380, height: 300, border: "4px solid #2a2724" }} />
            <div style={{ fontSize: 92, fontWeight: 900, lineHeight: 1.1 }}>وقت آزاد</div>
            <div style={{ fontSize: 28, marginTop: 14, fontWeight: 700 }}>گم‌شده از: ۳ هفته پیش</div>
            <div style={{ fontSize: 22, marginTop: 6, color: P.ink2 }}>آخرین بار: قبل از شروع پیج دیده شده</div>
          </div>
        </Sheet>
      </div>
    </World>
  );
};

/* ═════════ E · «that's why we built NFP» (17.25 → 20.05) ═════════ */
const SE: React.FC<{ t: number }> = ({ t }) => {
  const nfp = T(3, "NFP");
  const drop = ramp(t, nfp - 0.35, nfp - 0.05, easeOut);
  return (
    <AbsoluteFill>
      <World t={t} keys={[[17.25, 960, 540, 1.2], [20.05, 960, 540, 1.32]]} sw={SW} sh={SH} bg="#0b0b0b" hand={2}>
        <Desk />
        <Sheet x={960 - 360} y={540 - 280} w={720} h={500} rot={-3} a={drop} from="top">
          <Photo src={PH("tired2")} style={{ position: "absolute", left: 30, right: 30, top: 30, height: 330 }} pos="50% 35%" />
          <div style={{ position: "absolute", left: 40, right: 40, bottom: 36, direction: "rtl", fontFamily: PF.ui, fontWeight: 700, fontSize: 34, color: P.ink }}>پرونده: ساخت محتوا</div>
        </Sheet>
        <Stamp x={960} y={520} text="NFP" a={ramp(t, nfp, nfp + 0.18)} size={150} rot={-8} sub="ساخته شد" />
      </World>
      {/* darkness lifts when the sheet lands (outside World so it always covers the whole frame) */}
      <AbsoluteFill style={{ background: `rgba(0,0,0,${0.62 - 0.4 * drop})` }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(255,240,215,.16), transparent 45%)", opacity: 0.5 + 0.5 * drop }} />
    </AbsoluteFill>
  );
};

/* ═════════ F · NFP + Claude, no pricey subscriptions (20.05 → 25.85) ═════════ */
const SUBS: [string, number, string][] = [["«الف»", 20, "پول"], ["«ب»", 25, "چندتا"], ["«ج»", 30, "مدل"], ["«د»", 25, "ویدئوساز"]];
const SF: React.FC<{ t: number }> = ({ t }) => {
  const nf = T(4, "NFP"), cl = T(4, "Claude"), bd = T(4, "بدون");
  return (
    <World t={t} keys={[[20.05, 960, 380, 1.15], [21.3, 960, 400, 1.1], [21.75, 960, 640, 1.0], [25.85, 960, 660, 1.07]]} w={1920} h={1500} sw={SW} sh={SH} bg={P.desk} hand={2.5}>
      <Desk w={1920} h={1500} />
      <Sheet x={1060} y={150} w={560} h={380} rot={2} a={ramp(t, nf - 0.15, nf + 0.25)} from="right">
        <div style={{ height: "100%", display: "grid", placeItems: "center", direction: "ltr", fontFamily: "'Arial Black', Arial", fontWeight: 900, fontSize: 150, color: P.ink }}>NFP</div>
      </Sheet>
      <Sheet x={300} y={160} w={560} h={380} rot={-2} a={ramp(t, cl - 0.15, cl + 0.25)} from="left">
        <div style={{ height: "100%", display: "grid", placeItems: "center", direction: "ltr", fontFamily: "Georgia, serif", fontSize: 130, color: P.ink }}>Claude</div>
      </Sheet>
      <svg width="1920" height="1500" style={{ position: "absolute", left: 0, top: 0 }}>
        <g stroke={P.redInk} strokeWidth="10" strokeLinecap="round">
          <path d="M960 290 V 410" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ramp(t, cl + 0.15, cl + 0.3)} />
          <path d="M900 350 H 1020" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ramp(t, cl + 0.3, cl + 0.45)} />
        </g>
      </svg>
      {SUBS.map(([n, price, w], i) => {
        const x = 1480 - i * 400;
        const a = ramp(t, bd + 0.15 + i * 0.12, bd + 0.45 + i * 0.12);
        return (
          <React.Fragment key={i}>
            <Sheet x={x} y={560} w={360} h={430} rot={[-2, 1.5, -1, 2][i]} a={a} from="bottom">
              <div style={{ padding: "30px 30px", direction: "rtl", fontFamily: PF.ui, color: P.ink }}>
                <div style={{ fontSize: 20, color: P.faint }}>فاکتور اشتراک</div>
                <div style={{ fontSize: 30, fontWeight: 700, margin: "6px 0 14px" }}>مدل ویدئوساز {n}</div>
                <div style={{ height: 110, background: `repeating-linear-gradient(${45 + i * 30}deg, rgba(42,39,36,.16) 0 10px, transparent 10px 20px)`, border: `2px solid ${P.line}`, marginBottom: 14, display: "grid", placeItems: "center", fontSize: 44, color: P.ink2 }}>▶</div>
                <Lines n={2} w={280} seed={i * 5} />
                <div style={{ borderTop: `2px dashed ${P.line}`, marginTop: 20, paddingTop: 14, display: "flex", justifyContent: "space-between", fontSize: 28 }}>
                  <span>ماهانه</span><b>{fa(price)} دلار</b>
                </div>
              </div>
            </Sheet>
            <MCross x={x + 50} y={620} w={260} h={310} p={ramp(t, T(4, w), T(4, w) + 0.3)} sw={9} />
          </React.Fragment>
        );
      })}
      <Sheet x={560} y={1020} w={800} h={100} rot={0.5} a={ramp(t, 24.3, 24.6)} from="bottom" pin={false}>
        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", direction: "rtl", fontFamily: PF.ui, fontWeight: 700, fontSize: 40, color: P.ink }}>
          <Mark kind="strike" p={ramp(t, T(4, "بدی") - 0.2, T(4, "بدی") + 0.2)} sw={9}>جمع اشتراک‌ها: {fa(100)} دلار در ماه</Mark>
        </div>
      </Sheet>
    </World>
  );
};

/* ═════════ G · one page → many pages → every day (25.85 → 32.5) ═════════ */
const PAGES = ["آشپزی", "سفر", "تکنولوژی", "ورزش", "کتاب", "مالی", "طنز", "مد"];
const Profile: React.FC<{ name: string; seed: number; t: number; mark: number }> = ({ name, seed, mark }) => (
  <div style={{ padding: "24px 22px", direction: "rtl", fontFamily: PF.ui, color: P.ink }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 84, height: 84, borderRadius: 42, border: "4px solid #444", overflow: "hidden" }}><Photo src={POST(seed * 3)} style={{ width: "100%", height: "100%" }} /></div>
      <div>
        <Mark p={mark} pad={10} sw={4} seed={seed}><div style={{ fontSize: 28, fontWeight: 700 }}>پیج {name}</div></Mark>
        <div style={{ fontSize: 18, color: P.faint }}>{fa(3 + seed)} پست امروز</div>
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 20 }}>
      {Array.from({ length: 6 }, (_, i) => <Photo key={i} src={POST(seed * 3 + i)} style={{ aspectRatio: "1" }} />)}
    </div>
  </div>
);
const SG: React.FC<{ t: number }> = ({ t }) => {
  const many = T(4, "چندتا", 1), topic = T(4, "موضوع‌های"), every = T(4, "هر");
  const pos = (i: number) => ({ x: 1920 * 1 + 120 + (3 - (i % 4)) * 430, y: 1080 + 90 + Math.floor(i / 4) * 470 });
  const keys: [number, number, number, number, number?][] = [[25.85, 3090, 1380, 1.9], [27.5, 3090, 1380, 1.97], [28.3, 2875, 1615, 0.98], [31.8, 2875, 1615, 1.02], [32.5, 2875, 1615, 0.42]];
  return (
    <World t={t} keys={keys} w={5760} h={3240} sw={SW} sh={SH} bg={P.desk} hand={2}>
      <Desk w={5760} h={3240} />
      {/* the massive wall of daily posts around */}
      {t > 31.3 && Array.from({ length: 22 * 12 }, (_, k) => {
        const c = k % 22, r = Math.floor(k / 22);
        const x = 180 + c * 250, y = 160 + r * 250;
        if (x > 1950 && x < 3800 && y > 1060 && y < 2150) return null;
        return (
          <div key={k} style={{ position: "absolute", left: x, top: y, width: 210, height: 210, background: P.paper, boxShadow: "0 4px 8px rgba(0,0,0,.4)", opacity: ramp(t, 31.3 + rnd(k) * 0.5, 31.5 + rnd(k) * 0.5), padding: 14 }}>
            <Img src={staticFile(POST(k))} style={{ width: 182, height: 140, objectFit: "cover", filter: "grayscale(1) contrast(1.2)" }} />
            <div style={{ position: "absolute", left: 50, top: 160, width: 110, height: 36, borderRadius: "50%", border: `4px solid ${P.redInk}` }} />
          </div>
        );
      })}
      {PAGES.map((n, i) => {
        const { x, y } = pos(i);
        const at = i === 1 ? 25.75 : many + (i < 1 ? 0 : i - 1) * 0.1;
        return (
          <React.Fragment key={i}>
            <Sheet x={x} y={y} w={380} h={420} rot={[-2, 1, 2, -1.5, 1.5, -2, 1, -1][i]} a={ramp(t, at, at + 0.3)} from={i === 1 ? "top" : "none"}>
              <Profile name={n} seed={i} t={t} mark={ramp(t, topic + i * 0.07, topic + 0.3 + i * 0.07)} />
            </Sheet>
            <Stamp x={x + 190} y={y + 330} text="هر روز ✓" a={ramp(t, every + i * 0.14, every + 0.14 + i * 0.14)} size={46} rot={-12 + (i % 3) * 5} />
          </React.Fragment>
        );
      })}
      {t > 31.6 && Array.from({ length: 16 }, (_, i) => {
        const ang = (i / 16) * Math.PI * 2;
        return <MLine key={i} a={[2880 + Math.cos(ang) * 2600, 1620 + Math.sin(ang) * 1500]} b={[2880 + Math.cos(ang) * 1100, 1620 + Math.sin(ang) * 650]} p={ramp(t, 31.7 + i * 0.02, 32.1 + i * 0.02)} arrow={false} bend={0} sw={6} o={0.8} />;
      })}
    </World>
  );
};

/* ═════════ H · not a simple video (32.5 → 34.2) ═════════ */
const SHs: React.FC<{ t: number }> = ({ t }) => {
  const x = T(5, "ساده");
  const toss = ramp(t, 33.85, 34.2, (k) => k * k);
  return (
    <World t={t} keys={[[32.5, 960, 540, 1.25], [34.2, 960, 540, 1.1]]} sw={SW} sh={SH} bg={P.desk} hand={3}>
      <Desk />
      <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${-toss * 1400}px, ${toss * 300}px) rotate(${-toss * 40}deg)`, transformOrigin: "960px 540px" }}>
        <Sheet x={560} y={220} w={800} h={560} rot={-1.5} a={ramp(t, 32.45, 32.7)} from="none">
          <div style={{ position: "absolute", inset: 40, background: "#2a2724", display: "grid", placeItems: "center", direction: "rtl", fontFamily: PF.ui, color: "#e9e5dd", textAlign: "center" }}>
            <div><div style={{ fontSize: 60, fontWeight: 700 }}>ویدئوی من</div><div style={{ fontSize: 26, opacity: 0.6, marginTop: 10 }}>متن سفید · موزیک پیش‌فرض · ۱ قالب</div></div>
          </div>
          <div style={{ position: "absolute", left: 40, bottom: 10, fontFamily: PF.code, fontSize: 22, color: P.ink2, direction: "rtl" }}>قالب_رایگان_۰۱.mp4</div>
        </Sheet>
        <MCross x={640} y={290} w={640} h={420} p={ramp(t, x - 0.05, x + 0.3)} sw={14} />
      </div>
    </World>
  );
};

/* ═════════ I · «like the one you're watching» + REWIND (34.2 → 37.1) ═════════ */
const RECAP = ["a1", "a2", "b1", "b2", "c1", "d1", "e1", "f1", "g1", "g2", "h1", "a3"];
const SI: React.FC<{ t: number }> = ({ t }) => {
  const rw0 = T(6, "مثل"), rw1 = T(6, "می‌بینی") + 0.1;
  const inRw = t >= rw0 && t < rw1;
  const idx = RECAP.length - 1 - (Math.floor((t - rw0) * 10) % RECAP.length);
  const circ = ramp(t, rw1 + 0.05, rw1 + 0.4);
  return (
    <AbsoluteFill>
      <World t={t} keys={[[34.2, 960, 560, 1.2], [37.4, 960, 540, 1.04]]} sw={SW} sh={SH} bg={P.desk} hand={2}>
        <Desk />
        <Sheet x={210} y={100} w={1500} h={880} rot={-0.8} a={ramp(t, 34.2, 34.55)} from="bottom">
          <div style={{ padding: "26px 40px", direction: "rtl", fontFamily: PF.ui, fontWeight: 700, fontSize: 26, color: P.ink, display: "flex", alignItems: "center", gap: 14 }}>
            <span>کانتکت‌شیت ·</span>
            <Mark p={circ} pad={14} sw={6} seed={4}><span style={{ direction: "ltr", display: "inline-block", fontFamily: PF.mono }}>NFP_promo_v10.mp4</span></Mark>
            <span>· ۶۶ ثانیه</span>
            <span style={{ fontWeight: 900, fontSize: 54, color: P.redInk, transform: `rotate(-6deg) scale(${easeBack(circ)})`, marginRight: 30, display: "inline-block" }}>همین!</span>
          </div>
          <div style={{ position: "absolute", left: 40, right: 40, top: 110, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
            {RECAP.map((r, i) => (
              <div key={r} style={{ position: "relative", aspectRatio: "16/9", background: "#555", border: "3px solid #2a2724" }}>
                <Img src={REC(r)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(.6)" }} />
                <div style={{ position: "absolute", left: 6, bottom: 4, fontFamily: PF.mono, fontSize: 16, fontWeight: 700, color: "#fff", direction: "ltr", textShadow: "0 1px 2px #000" }}>{String(i * 5).padStart(2, "0")}s</div>
              </div>
            ))}
          </div>
        </Sheet>
      </World>
      {inRw && (
        <AbsoluteFill>
          <Img src={REC(RECAP[idx])} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.2) saturate(.6)", transform: `translateX(${Math.sin(t * 60) * 12}px) skewX(${Math.sin(t * 33) * 2}deg)` }} />
          <Rewind t={t} k={1} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ═════════ J · script, image, sound, edit ✓ (37.1 → 41.15) ═════════ */
const SJ: React.FC<{ t: number }> = ({ t }) => {
  const items: [string, number, React.ReactNode][] = [
    ["سناریو", T(6, "سناریو"), <div key="s" style={{ padding: "18px 26px" }}>{["سکانس ۱: قلاب", "سکانس ۲: مشکل", "سکانس ۳: راه‌حل"].map((l) => <div key={l} style={{ fontFamily: PF.ui, fontWeight: 600, fontSize: 26, lineHeight: 1.9, color: P.ink }}>{l}</div>)}<div style={{ marginTop: 10 }}><Lines n={3} w={420} /></div></div>],
    ["تصویر", T(6, "تصویر"), <Img key="i" src={REC("g2")} style={{ position: "absolute", inset: 18, width: "calc(100% - 36px)", height: "calc(100% - 36px)", objectFit: "cover", filter: "grayscale(.7)" }} />],
    ["صداگذاری", T(6, "صداگذاری"), <div key="a" style={{ position: "absolute", inset: 18, display: "flex", gap: 18 }}><Photo src={PH("mic")} style={{ width: 250, height: "100%" }} /><div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4, direction: "ltr" }}>{Array.from({ length: 26 }, (_, k) => <div key={k} style={{ flex: 1, height: `${20 + Math.abs(Math.sin(k * 1.3 + t * 3)) * 70}%`, background: "#4a4642", borderRadius: 3 }} />)}</div></div>],
    ["ادیت کامل", T(6, "ادیت"), <div key="e" style={{ position: "absolute", inset: 18, display: "flex", gap: 18 }}><Photo src={PH("editor")} style={{ width: 300, height: "100%" }} /><div style={{ flex: 1, paddingTop: 10 }}>{[0, 1, 2, 3].map((r) => <div key={r} style={{ position: "relative", height: 34, marginBottom: 12, background: "rgba(0,0,0,.05)" }}>{[0, 1, 2].map((c) => <div key={c} style={{ position: "absolute", left: `${c * 33 + rnd(r * 3 + c) * 8}%`, width: `${22 + rnd(r + c) * 8}%`, top: 3, bottom: 3, background: [G.c, "#8a857c", G.b, "#9c978d"][r], borderRadius: 4 }} />)}</div>)}</div></div>],
  ];
  return (
    <World t={t} keys={[[37.4, 960, 540, 1.1], [41.15, 960, 540, 1.0]]} sw={SW} sh={SH} bg={P.desk} hand={2.5}>
      <Desk />
      {items.map(([label, at, body], i) => {
        const x = [1010, 190, 1010, 190][i], y = [80, 80, 560, 560][i];
        return (
          <React.Fragment key={i}>
            <Sheet x={x} y={y} w={720} h={420} rot={[1.5, -1.5, -1, 2][i]} a={ramp(t, at - 0.25, at + 0.05)} from={i % 2 ? "left" : "right"}>
              <div style={{ position: "absolute", right: 26, top: 14, fontFamily: PF.ui, fontWeight: 700, fontSize: 34, color: P.ink, zIndex: 2 }}>{label}</div>
              <div style={{ position: "absolute", inset: "70px 0 0 0", direction: "rtl" }}>{body}</div>
            </Sheet>
            <MCheck x={x + 560} y={y + 250} s={100} p={ramp(t, at + 0.1, at + 0.4)} />
          </React.Fragment>
        );
      })}
    </World>
  );
};

/* ═════════ K · the traditional way: days + editor/camera/location (41.15 → 47.7) ═════════ */
const GANTT: [string, number, number][] = [["نگارش سناریو", 0, 1], ["پیش‌تولید و هماهنگی", 0.6, 1.6], ["فیلم‌برداری", 1.5, 2.8], ["تدوین", 2.6, 4.4], ["صداگذاری و خروجی", 4.2, 5]];
const SK: React.FC<{ t: number }> = ({ t }) => {
  const st = T(7, "ساختنش"), many = T(7, "چند"), ed = T(7, "ادیتور"), cam = T(7, "دوربین"), loc = T(7, "لوکیشن");
  const tags: [string, string, number, number][] = [["ادیتور", PH("editor"), ed, 2150], ["دوربین", PH("camop"), cam, 2600], ["لوکیشن", PH("studio2"), loc, 3050]];
  return (
    <World t={t} keys={[[41.15, 960, 540, 1.1], [44.4, 980, 540, 1.05], [44.85, 2600, 540, 1.0], [47.7, 2600, 540, 1.08]]} w={3700} sw={SW} sh={SH} bg={P.desk} hand={2.5}>
      <Desk w={3700} h={1080} />
      <Sheet x={260} y={110} w={1400} h={700} rot={-0.8} a={ramp(t, 41.1, 41.45)} from="bottom">
        <div style={{ padding: "36px 50px", direction: "rtl", fontFamily: PF.ui, color: P.ink }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 44, fontWeight: 700 }}>برنامه‌ی تولید — روش سنتی</div>
            <Mark p={ramp(t, many, many + 0.35)} pad={14} sw={6} seed={3}><span style={{ fontSize: 36, fontWeight: 900 }}>جمع: چند روز کار</span></Mark>
          </div>
          <div style={{ display: "flex", margin: "22px 280px 8px 0", fontSize: 22, color: P.ink2 }}>{Array.from({ length: 5 }, (_, d) => <div key={d} style={{ flex: 1 }}>روز {fa(d + 1)}</div>)}</div>
          {GANTT.map(([n, a, b], i) => {
            const p = ramp(t, st + i * 0.35, st + 0.5 + i * 0.35, easeOut);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", height: 92, borderTop: `1px solid ${P.line}` }}>
                <div style={{ width: 280, fontSize: 26 }}>{n}</div>
                <div style={{ position: "relative", flex: 1, height: 44 }}>
                  <div style={{ position: "absolute", right: `${(a / 5) * 100}%`, width: `${((b - a) / 5) * 100 * p}%`, top: 0, bottom: 0, background: "#5d5953", borderRadius: 6 }} />
                </div>
              </div>
            );
          })}
        </div>
      </Sheet>
      <Sheet x={2360} y={90} w={480} h={260} rot={1} a={ramp(t, 44.6, 44.9)} from="top">
        <div style={{ height: "100%", display: "grid", placeItems: "center", direction: "rtl", fontFamily: PF.ui, fontWeight: 900, fontSize: 90, color: P.ink }}>هزینه</div>
      </Sheet>
      {tags.map(([n, src, at, x], i) => (
        <React.Fragment key={i}>
          <Sheet x={x - 200} y={430} w={400} h={400} rot={[-3, 2, -2][i]} a={ramp(t, at - 0.15, at + 0.2)} from="bottom">
            <Photo src={src} style={{ position: "absolute", left: 22, right: 22, top: 22, height: 250 }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 285, direction: "rtl", fontFamily: PF.ui, color: P.ink, textAlign: "center" }}>
              <div style={{ fontSize: 46, fontWeight: 900 }}>{n}</div>
              <div style={{ fontSize: 22, color: P.ink2 }}>هزینه‌ی جدا · زمان جدا</div>
            </div>
          </Sheet>
          <MLine a={[x, 450]} b={[2600, 360]} p={ramp(t, at + 0.15, at + 0.45)} bend={-30} sw={5} />
        </React.Fragment>
      ))}
    </World>
  );
};

/* ═════════ L · $100 / 30 million (47.7 → 55.2) ═════════ */
const SL: React.FC<{ t: number }> = ({ t }) => {
  const nfp = T(8, "NFP"), others = T(8, "بقیه"), hundred = T(8, "۱۰۰"), thirty = T(8, "۳۰");
  const phase = t < hundred - 0.1 ? 0 : t < thirty - 0.1 ? 1 : 2;
  const p0 = phase === 1 ? hundred : thirty;
  // scattered evidence around the central card (invoices for $100, payslips + cash for 30M)
  const around: [number, number, number, number, number, React.ReactNode][] = phase === 1
    ? [[40, 60, 420, 300, -6, <Photo key="a" src={PH("phone")} style={{ position: "absolute", inset: 18 }} />],
      [1480, 40, 400, 330, 5, null], [30, 640, 400, 380, 4, null], [1500, 660, 380, 360, -5, <Photo key="b" src={PH("timeline")} style={{ position: "absolute", inset: 18 }} />]]
    : [[40, 50, 440, 320, -5, <Photo key="a" src={PH("money")} style={{ position: "absolute", inset: 18 }} />],
      [1470, 40, 420, 330, 6, <Photo key="b" src={PH("camop")} style={{ position: "absolute", inset: 18 }} />], [30, 650, 420, 370, 4, null], [1490, 650, 400, 370, -4, <Photo key="c" src={PH("stacks")} style={{ position: "absolute", inset: 18 }} />]];
  return (
    <World t={t} keys={[[47.7, 960, 540, 1.15], [51.3, 960, 540, 1.05], [55.2, 960, 540, 1.1]]} sw={SW} sh={SH} bg={P.desk} hand={2}>
      <Desk />
      {phase === 0 ? (
        <>
          <Sheet x={1080} y={200} w={560} h={640} rot={2} a={ramp(t, nfp - 0.1, nfp + 0.25)} from="right">
            <div style={{ height: "100%", display: "grid", placeItems: "center", direction: "ltr", fontFamily: "'Arial Black', Arial", fontWeight: 900, fontSize: 140, color: P.ink }}>NFP</div>
          </Sheet>
          <Sheet x={280} y={180} w={660} h={700} rot={-2} a={ramp(t, others - 0.15, others + 0.2)} from="left">
            <div style={{ padding: "40px 44px", direction: "rtl", fontFamily: PF.ui, color: P.ink }}>
              <div style={{ fontSize: 40, fontWeight: 700 }}>بقیه برای داشتنش:</div>
              {["اشتراک ماهانه‌ی مدل‌ها", "ادیتور", "فیلم‌بردار", "دوربین و لوکیشن"].map((l, i) => (
                <div key={l} style={{ fontSize: 32, padding: "18px 0", borderBottom: `1px solid ${P.line}`, opacity: ramp(t, others + 0.3 + i * 0.3, others + 0.5 + i * 0.3) }}>{fa(i + 1)}. {l}</div>
              ))}
            </div>
          </Sheet>
          <MLine a={[1080, 520]} b={[930, 520]} p={ramp(t, nfp + 0.3, nfp + 0.6)} bend={-30} sw={6} />
        </>
      ) : (
        <>
          {around.map(([x, y, w, h, r, body], i) => (
            <Sheet key={`${phase}-${i}`} x={x} y={y} w={w} h={h} rot={r} a={ramp(t, p0 - 0.1 + i * 0.06, p0 + 0.2 + i * 0.06)} from={i % 2 ? "right" : "left"}>
              {body ?? (
                <div style={{ padding: "28px 30px", direction: "rtl", fontFamily: PF.ui, color: P.ink }}>
                  <div style={{ fontSize: 26, fontWeight: 700 }}>{phase === 1 ? "فاکتور اشتراک ماهانه" : "فیش حقوقی · مهر"}</div>
                  <div style={{ margin: "16px 0" }}><Lines n={4} w={320} seed={i + phase * 4} /></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, fontWeight: 700, borderTop: `2px dashed ${P.line}`, paddingTop: 12 }}>
                    <span>{phase === 1 ? "مبلغ" : i === 2 ? "ادیتور" : "فیلم‌بردار"}</span><span>{phase === 1 ? `${fa([25, 30][i % 2])} دلار` : `${fa(i === 2 ? 18 : 12)} میلیون`}</span>
                  </div>
                </div>
              )}
            </Sheet>
          ))}
          <Sheet key={`c${phase}`} x={460} y={170} w={1000} h={620} rot={-1} a={ramp(t, p0 - 0.2, p0 + 0.1)} from="none" pin>
            {phase === 1
              ? <BigStat value="۱۰۰" count={100} kicker="هر ماه، فقط اشتراک" unit="دلار" unit2="برای مدل‌های ویدئوساز" a={ramp(t, hundred - 0.08, hundred + 0.35)} size={300} x={500} y={320} mark={ramp(t, T(8, "اشتراک"), T(8, "اشتراک") + 0.4)} />
              : <BigStat value="۳۰" count={30} kicker="یا هر ماه" unit="میلیون" unit2="تومان حقوق" cap="ادیتور + فیلم‌بردار" a={ramp(t, thirty - 0.08, thirty + 0.35)} capA={ramp(t, T(8, "ادیتور"), T(8, "ادیتور") + 0.3)} size={290} x={500} y={300} mark={ramp(t, T(8, "حقوق"), T(8, "حقوق") + 0.4)} />}
          </Sheet>
        </>
      )}
    </World>
  );
};

/* ═════════ M · newspaper (55.2 → 58.75) ═════════ */
const HEAD = ["ماهی ۳۰ میلیون،", "فقط برای ادیتور و فیلم‌بردار"];
const SM: React.FC<{ t: number }> = ({ t }) => {
  const a = ramp(t, 55.2, 55.7, easeOut);
  const hw = HEAD.join(" ").split(" ");
  let k = 0;
  return (
    <World t={t} keys={[[55.2, 960, 540, 1.0], [58.75, 960, 480, 1.14, -1]]} sw={SW} sh={SH} bg={P.desk} hand={2}>
      <Desk />
      <div style={{ position: "absolute", left: 340, top: 30, width: 1240, height: 1020, transform: `rotate(${(1 - a) * 200 - 2}deg) scale(${0.3 + 0.7 * a})`, opacity: clamp(a * 3) }}>
        <Sheet x={0} y={0} w={1240} h={1020} pin={false} from="none">
          <div style={{ padding: "10px 56px 0", direction: "rtl", color: "#1c1a17" }}>
            <div style={{ textAlign: "center", fontFamily: PF.nast, fontSize: 84, lineHeight: 2.05, height: 150, overflow: "visible" }}>روزنامه‌ی سازنده</div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "4px double #1c1a17", borderBottom: "1px solid #1c1a17", padding: "6px 0", fontFamily: PF.ui, fontWeight: 700, fontSize: 18 }}><span>دوشنبه · شماره‌ی ۱۰</span><span>نسخه‌ی عصر</span><span>قیمت: یک ویدئو</span></div>
            <div style={{ fontFamily: PF.naskh, fontWeight: 700, fontSize: 70, lineHeight: 1.3, marginTop: 18, textAlign: "center" }}>
              {HEAD.map((line, li) => (
                <div key={li}>{line.split(" ").map((w) => { const i = k++; const wa = ramp(t, 55.45 + i * 0.09, 55.6 + i * 0.09); return <span key={i} style={{ opacity: wa, display: "inline-block", margin: "0 8px", transform: `translateY(${(1 - wa) * 12}px)` }}>{w}</span>; })}</div>
              ))}
            </div>
            <div style={{ fontFamily: PF.ui, fontSize: 26, textAlign: "center", color: "#4a4540", margin: "6px 0 18px", opacity: ramp(t, 55.45 + hw.length * 0.09, 55.7 + hw.length * 0.09) }}>سازنده‌ها هنوز برای هر ویدئو، روزها منتظر می‌مونن</div>
            <div style={{ display: "flex", gap: 34, borderTop: "1px solid #1c1a17", paddingTop: 18 }}>
              <div style={{ flex: 1.45 }}>
                <Photo src={PH("tired")} style={{ height: 380, border: "2px solid #1c1a17" }} pos="40% 50%" />
                <div style={{ fontFamily: PF.ui, fontSize: 17, color: "#4a4540", marginTop: 6 }}>ساعت ۲ بامداد؛ تدوین هنوز تموم نشده.</div>
              </div>
              <div style={{ flex: 1, fontFamily: PF.ui }}>
                <div style={{ fontWeight: 900, fontSize: 28 }}>هزینه‌ی تولید دستی</div>
                {[["ادیتور", "۱۸ میلیون"], ["فیلم‌بردار", "۱۲ میلیون"]].map(([n, v]) => (
                  <div key={n} style={{ display: "flex", justifyContent: "space-between", fontSize: 24, padding: "10px 0", borderBottom: `1px solid ${P.line}` }}><span>{n}</span><b>{v}</b></div>
                ))}
                <div style={{ marginTop: 10 }}>
                  <Mark p={ramp(t, 56.9, 57.3)} pad={12} sw={5} block>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, fontWeight: 900, padding: "6px 0" }}><span>جمع ماهانه</span><span>۳۰ میلیون</span></div>
                  </Mark>
                </div>
                <div style={{ fontFamily: PF.naskh, fontSize: 19, lineHeight: 1.75, textAlign: "justify", color: "#2f2b27", marginTop: 16 }}>
                  برای ساختن یک ویدئوی حرفه‌ای هنوز باید سناریو نوشت، لوکیشن گرفت، فیلم‌بردار آورد و روزها منتظر تدوین ماند؛ هزینه‌ای که بیشتر سازنده‌ها هر ماه تکرارش می‌کنند.
                </div>
              </div>
            </div>
          </div>
        </Sheet>
      </div>
    </World>
  );
};

/* ═════════ N · webinar ticket + end (58.75 → 66.5) ═════════ */
const SN: React.FC<{ t: number }> = ({ t }) => {
  const web = T(9, "وبینار"), soon = T(9, "به‌زودی");
  const out = ramp(t, web - 0.1, web + 0.9, easeOut);
  return (
    <World t={t} keys={[[58.75, 960, 470, 1.18], [61.3, 960, 520, 1.12], [62.2, 960, 540, 0.92], [66.5, 960, 540, 0.96]]} sw={SW} sh={SH} bg={P.desk} hand={2}>
      <Desk />
      {/* printer slot */}
      <div style={{ position: "absolute", left: 460, top: 70, width: 1000, height: 46, borderRadius: 12, background: "#111", boxShadow: "inset 0 4px 10px rgba(0,0,0,.8), 0 2px 0 #333" }} />
      <div style={{ position: "absolute", left: 480, top: 90, width: 960, height: 740, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: -720 + out * 720 }}>
          <Sheet x={0} y={0} w={960} h={720} pin={false} from="none">
            <div style={{ position: "absolute", inset: 30, border: "3px dashed rgba(42,39,36,.5)", direction: "rtl", fontFamily: PF.ui, color: P.ink }}>
              <div style={{ padding: "30px 44px" }}>
                <div style={{ fontFamily: PF.code, fontWeight: 700, fontSize: 26, letterSpacing: 2 }}>دعوت‌نامه · بلیت شماره ۰۰۱</div>
                <div style={{ fontSize: 86, fontWeight: 900, lineHeight: 1.2, marginTop: 14 }}>وبینار آموزشی</div>
                <div style={{ fontSize: 70, fontWeight: 900, direction: "ltr", textAlign: "right", fontFamily: "'Arial Black', Arial" }}>NFP</div>
                <div style={{ display: "flex", gap: 60, marginTop: 26, fontSize: 30 }}>
                  <div><div style={{ color: P.faint, fontSize: 20 }}>زمان</div>به‌زودی</div>
                  <div><div style={{ color: P.faint, fontSize: 20 }}>مکان</div>آنلاین</div>
                  <div><div style={{ color: P.faint, fontSize: 20 }}>ظرفیت</div>محدود</div>
                </div>
              </div>
              <div style={{ position: "absolute", left: 40, bottom: 40, width: 170, height: 170, display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 2 }}>
                {Array.from({ length: 81 }, (_, i) => <div key={i} style={{ background: rnd(i * 3) > 0.5 || [0, 1, 2, 9, 11, 18, 19, 20, 6, 7, 8, 15, 17, 24, 25, 26, 54, 55, 56, 63, 65, 72, 73, 74].includes(i) ? "#2a2724" : "transparent" }} />)}
              </div>
            </div>
          </Sheet>
        </div>
      </div>
      <Stamp x={1240} y={640} text="به‌زودی" a={ramp(t, soon, soon + 0.18)} size={110} rot={-12} />
      <Sheet x={1560} y={260} w={300} h={260} rot={4} a={ramp(t, 61.5, 61.9)} from="right">
        <div style={{ height: "100%", display: "grid", placeItems: "center", direction: "ltr", fontFamily: "'Arial Black', Arial", fontWeight: 900, fontSize: 88, color: P.ink }}>NFP</div>
      </Sheet>
      <Sheet x={1540} y={560} w={340} h={260} rot={-3} a={ramp(t, 61.9, 62.3)} from="right">
        <Photo src={PH("editor")} style={{ position: "absolute", inset: 16 }} />
      </Sheet>
      <Sheet x={60} y={520} w={360} h={300} rot={-4} a={ramp(t, 61.7, 62.1)} from="left">
        <div style={{ padding: "30px 30px", direction: "rtl", fontFamily: PF.ui, fontWeight: 700, fontSize: 28, lineHeight: 1.8, color: P.ink }}>
          <div>✓ سناریو</div><div>✓ تصویر</div><div>✓ صدا</div><div>✓ ادیت</div>
        </div>
      </Sheet>
      <Sheet x={70} y={150} w={340} h={300} rot={3} a={ramp(t, 62.0, 62.4)} from="left">
        <Photo src={PH("mic")} style={{ position: "absolute", inset: 16 }} />
      </Sheet>
      <MLine a={[430, 670]} b={[700, 760]} p={ramp(t, 62.4, 62.8)} sw={5} />
    </World>
  );
};

/* ═════════ edit ═════════ */
const SHOTS: { C: React.FC<{ t: number }>; from: number; to: number }[] = [
  { C: AB, from: 0, to: 12.1 },
  { C: SC, from: 12.1, to: 16.1 },
  { C: SD, from: 16.1, to: 17.25 },
  { C: SE, from: 17.25, to: 20.05 },
  { C: SF, from: 20.05, to: 25.85 },
  { C: SG, from: 25.85, to: 32.5 },
  { C: SHs, from: 32.5, to: 34.2 },
  { C: SI, from: 34.2, to: 37.4 },
  { C: SJ, from: 37.4, to: 41.15 },
  { C: SK, from: 41.15, to: 47.7 },
  { C: SL, from: 47.7, to: 55.2 },
  { C: SM, from: 55.2, to: 58.75 },
  { C: SN, from: 58.75, to: V10_END },
];
/** Recap stills (for the contact sheet / rewind / photos): name → frame. Render with `remotion still` into public/v10/recap/. */
export const V10_RECAP: Record<string, number> = { a1: 60, a2: 150, a3: 200, b1: 270, b2: 330, c1: 440, d1: 500, e1: 575, f1: 700, g1: 880, g2: 950, h1: 1000 };

const K = (p: string) => `kenney/${p}.ogg`;
// marker sound only on a few key strokes (user: too many scribbles were annoying)
const SCRIB = (s: number, v = 0.16): [number, string, number] => [s, "v09/scribble.wav", v];
const CUES: [number, string, number][] = [
  ...[0.2, 0.55, 0.9, 1.25, 1.6].map((s): [number, string, number] => [s, K("interface/click_002"), 0.2]),
  ...Array.from({ length: 8 }, (_, i): [number, string, number] => [T(0, "وقت") - 0.12 + i * 0.16, "sfx-lib/notif.wav", 0.16 + (i % 2) * 0.06]),
  ...Array.from({ length: 4 }, (_, i): [number, string, number] => [4.25 + i * 0.12, "sfx-lib/notif.wav", 0.14]),
  SCRIB(T(0, "ایده") + 0.1, 0.2),
  [5.0, "sfx-lib/whoosh.wav", 0.3],
  ...[6.95, 7.95, 8.6, 9.85].map((s): [number, string, number] => [s, "sfx-lib/sweep.wav", 0.14]),
  [11.7, "sfx-lib/whoosh.wav", 0.3],
  [T(2, "ساخت"), K("impact/impactSoft_heavy_001"), 0.5], [T(2, "نصف"), K("impact/impactSoft_heavy_002"), 0.45], [T(2, "چند"), K("impact/impactSoft_heavy_003"), 0.5],
  [16.1, "v10/flutter.wav", 0.45],
  [17.25, K("impact/impactSoft_medium_000"), 0.3],
  [T(3, "NFP") - 0.3, "v10/flutter.wav", 0.4], [T(3, "NFP"), "sfx-lib/stamp.wav", 0.75],
  [T(4, "NFP") - 0.1, K("casino/card-slide-1"), 0.4], [T(4, "Claude") - 0.1, K("casino/card-slide-2"), 0.4],
  SCRIB(T(4, "پول")), SCRIB(T(4, "بدی") - 0.2),
  [T(4, "چندتا", 1), "sfx-lib/whoosh.wav", 0.3],
  ...Array.from({ length: 8 }, (_, i): [number, string, number] => [T(4, "هر") + i * 0.14, "sfx-lib/stamp.wav", 0.25]),
  [32.0, "sfx-lib/whoosh.wav", 0.3],
  SCRIB(T(5, "ساده"), 0.22), [33.85, "v10/flutter.wav", 0.4],
  [34.2, K("casino/card-slide-3"), 0.35],
  [T(6, "مثل") - 0.05, K("interface/switch_002"), 0.4], [T(6, "مثل"), "v10/rewind2.wav", 0.8], [T(6, "می‌بینی") + 0.08, K("interface/switch_005"), 0.4],
  ...(["سناریو", "تصویر", "صداگذاری", "ادیت"] as const).map((w): [number, string, number] => [T(6, w) - 0.2, K("casino/card-place-2"), 0.35]),
  [41.15, K("casino/card-slide-4"), 0.35], [44.85, "sfx-lib/whoosh.wav", 0.3],
  ...(["ادیتور", "دوربین", "لوکیشن"] as const).map((w): [number, string, number] => [T(7, w) - 0.1, K("casino/card-place-3"), 0.35]),
  [T(8, "NFP") - 0.1, K("casino/card-slide-1"), 0.35],
  [T(8, "۱۰۰") - 0.05, K("impact/impactSoft_heavy_004"), 0.55], [T(8, "۳۰") - 0.05, K("impact/impactSoft_heavy_000"), 0.55],
  [55.2, "sfx-lib/whoosh.wav", 0.4], [55.65, K("impact/impactPlank_medium_002"), 0.5],
  [T(9, "وبینار") - 0.1, "sfx-lib/print.wav", 0.5], [T(9, "به‌زودی"), "sfx-lib/stamp.wav", 0.7],
  [61.5, K("casino/card-slide-2"), 0.3],
];

export const Video10: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const rw0 = T(6, "مثل"), rw1 = T(6, "می‌بینی") + 0.1;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <BlurDefs />
      {SHOTS.map(({ C, from, to }, i) => (t >= from && t < to ? <AbsoluteFill key={i}><C t={t} /></AbsoluteFill> : null))}
      <CopyFx f={frame} />
      <Subs chunks={CHUNKS} t={t} y={SUB_Y} size={36} />
      <AbsoluteFill style={{ background: "#000", opacity: interpolate(t, [V10_END - 0.7, V10_END], [0, 1], { extrapolateLeft: "clamp" }) }} />
      <Audio src={staticFile("v10/voice.mp3")} />
      <Audio src={staticFile("music/happy-beats-business-moves-vol-9-by-ende-dot-app.mp3")} volume={(fm) => interpolate(fm, [0, 10, fr(rw0), fr(rw0) + 3, fr(rw1), fr(rw1) + 6, fr(V10_END - 1.5), fr(V10_END)], [0, 0.1, 0.1, 0.03, 0.03, 0.1, 0.1, 0], { extrapolateRight: "clamp" })} />
      {CUES.map(([s, file, v], i) => (
        <Sequence key={i} from={Math.max(0, fr(s))} layout="none">
          <Audio src={staticFile(file)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
