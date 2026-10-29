import React from "react";
import { interpolate } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import { Burst, FloatUp, floatStyle, Hearts, Rings } from "../styles/receipt-ui/fx";
import { Card, Missing, Stamp } from "../styles/receipt-ui/kit";
import { C, clamp, easeBack, easeOut, FONT_MONO, FONT_UI, ramp, rnd, T, typed } from "../styles/receipt-ui/theme";
import { pop, SP, useLocal, wobble } from "./scenesA";
import { FIX, TM } from "./times";

const EMOJI = "'Segoe UI Emoji'";
const AV = ["#3b82f6", "#ec4899", "#84cc16", "#f97316", "#8b5cf6", "#22c55e", "#eab308", "#14b8a6", "#f43f5e"];

/* 7 · dark · user uploads without a DMCA agent → every image a $150k risk */
export const Sc6: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const dm = pop(f, at(TM.dmca), 10);
  return (
    <>
      {AV.map((c, i) => {
        const x = 235 + (i % 3) * 210, y = 900 + Math.floor(i / 3) * 210;
        const prog = ramp(f, 4 + i * 3, at(TM.upload) + i * 2);
        const up = ramp(f, at(TM.upload) + i * 2, at(TM.upload) + i * 2 + 8, easeBack);
        const badT = f - (at(TM.bad) + i * 3);
        const bad = badT >= 0;
        const slam = bad ? interpolate(badT, [0, 5], [2.2, 1], { extrapolateRight: "clamp" }) : 1;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 190, height: 190, ...floatStyle(f, i, 4) }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 34, border: `2px solid ${bad ? C.red : T.dark.faint}`, background: bad ? "rgba(229,72,77,.16)" : up > 0.5 ? c : "transparent", overflow: "hidden",
              transform: `scale(${0.85 + 0.15 * Math.max(up, 0.001)})`, boxShadow: bad ? "0 0 30px rgba(229,72,77,.35)" : up > 0.5 ? `0 14px 30px ${c}55` : "none" }}>
              {up < 0.5 && (
                <svg width="190" height="190">
                  <circle cx="95" cy="95" r="34" fill="none" stroke={T.dark.faint} strokeWidth="5" />
                  <circle cx="95" cy="95" r="34" fill="none" stroke={C.blue} strokeWidth="5" strokeDasharray={`${214 * prog} 214`} transform="rotate(-90 95 95)" strokeLinecap="round" />
                  <path d="M95 110 V80 M82 92 L95 79 L108 92" stroke={C.blue} strokeWidth="5" fill="none" strokeLinecap="round" />
                </svg>
              )}
              {up >= 0.5 && !bad && <svg width="190" height="190"><circle cx="95" cy="72" r="34" fill="#fff" /><path d="M30 190 C 35 130, 155 130, 160 190 Z" fill="#fff" /></svg>}
              {bad && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.red, fontFamily: FONT_UI, fontWeight: 700, transform: `scale(${slam}) rotate(${(1 - 1 / slam) * 20}deg)` }}>
                  <div style={{ fontSize: 62 }}>©</div><div style={{ fontSize: 22 }}>$150,000</div>
                </div>
              )}
            </div>
          </div>
        );
      })}
      <Burst x={540} y={1110} f={f} at={at(TM.upload) + 6} n={24} colors={AV} power={0.9} />
      <Card mode="dark" x={190} y={1555} w={700} pad={24} a={dm} style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ fontFamily: EMOJI, fontSize: 50 }}>🛡️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, color: T.dark.sub }}>copyright.gov</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>DMCA agent registration</div>
          <div style={{ fontSize: 19, color: T.dark.sub }}><span style={{ display: "inline-block", width: 20, height: 20, border: `2px solid ${f % 16 < 8 ? C.red : T.dark.sub}`, borderRadius: 4, verticalAlign: "middle" }} /> I designate an agent · one form</div>
        </div>
        <div style={{ background: "#b7f34a", color: "#111", fontWeight: 800, fontSize: 30, padding: "10px 16px", borderRadius: 12, transform: `rotate(${8 + Math.sin(f / 6) * 6}deg)` }}>$6</div>
        <Missing a={dm} label="not registered" style={{ left: -10, top: -18 }} />
      </Card>
      {f >= at(TM.bad) && <Rings x={540} y={1110} f={f} at={at(TM.bad)} color={C.red} r0={120} r1={480} n={3} />}
    </>
  );
};

/* 8 · light · fines have nothing to do with revenue */
const FINES = ["COPPA  $53,000", "Fonts  €100", "CIPA  $5,000", "CAN-SPAM  $53,000", "ARL  refund", "DMCA  $150,000"];
export const Sc7: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const zero = pop(f, at(TM.revenue), 10);
  const neq = pop(f, at(TM.relate), 8);
  // slot-machine roll before settling on 0
  const rolling = f < at(TM.revenue) + 12;
  const digit = rolling ? Math.floor(rnd(Math.floor(f / 2)) * 9) + 1 : 0;
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 890, width: 1080, textAlign: "center", fontFamily: FONT_TEXT, fontSize: 40, color: T.light.sub, direction: "rtl", opacity: zero }}>💰 درآمد تو تا امروز</div>
      <div style={{ position: "absolute", left: 290, top: 950, width: 500, height: 230, textAlign: "center", fontFamily: FONT_NUM, fontSize: 200, color: rolling ? T.light.sub : T.light.text, opacity: zero, transform: `scale(${0.8 + 0.2 * zero})`, direction: "ltr",
        filter: rolling ? "blur(1.5px)" : "none" }}>${digit}</div>
      <div style={{ position: "absolute", left: 440, top: 1150, width: 200, textAlign: "center", fontFamily: FONT_NUM, fontSize: 150, color: C.red, opacity: neq, transform: `scale(${interpolate(neq, [0, 1], [2.4, 1])}) rotate(${(1 - neq) * 30}deg)` }}>≠</div>
      {neq > 0 && <Rings x={540} y={1250} f={f} at={at(TM.relate)} color={C.red} r0={40} r1={260} />}
      {FINES.map((t, i) => {
        const t0 = at(TM.scary) + 4 + i * 5;
        const p = clamp((f - t0) / 12);
        if (p <= 0) return null;
        // drop + bounce
        const y = 1390 + Math.floor(i / 2) * 96;
        const drop = p < 0.7 ? -500 * (1 - p / 0.7) ** 2 : -Math.sin(((p - 0.7) / 0.3) * Math.PI) * 26;
        return (
          <div key={t} style={{ position: "absolute", left: 150 + (i % 2) * 400, top: y + drop, width: 380, height: 78, borderRadius: 16, background: "#fff", border: `2px solid ${C.red}`,
            color: C.red, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 25, textAlign: "center", lineHeight: "78px", boxShadow: "0 12px 26px rgba(229,72,77,.18)",
            transform: `rotate(${(i % 2 ? 1 : -1) * (1.5 + Math.sin(f / 12 + i) * 1.2)}deg)` }}>{t}</div>
        );
      })}
    </>
  );
};

/* 9 · light · per user / per email / per session */
export const Sc8: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const rows = [
    { t: TM.user, icon: "👤", fa: "کاربر", n: 2410, u: "users", st: "به‌ازای هر نفر" },
    { t: TM.email, icon: "✉️", fa: "ایمیل", n: 1204, u: "emails", st: "به‌ازای هر ایمیل" },
    { t: TM.sess2, icon: "⏺️", fa: "سشن", n: 380, u: "sessions", st: "به‌ازای هر سشن" },
  ];
  const sales = pop(f, at(TM.dollar), 10);
  return (
    <>
      <div style={{ position: "absolute", left: 340, top: 880, width: 400, height: 76, borderRadius: 38, background: "#fff", boxShadow: T.light.shadow, fontFamily: FONT_MONO, fontSize: 30, fontWeight: 700,
        textAlign: "center", lineHeight: "76px", opacity: sales, transform: `scale(${0.8 + 0.2 * sales}) translateX(${wobble(f, at(TM.dollar) + 4, 8)}px)` }}>💵 SALES · <span style={{ color: C.red }}>$0</span></div>
      {rows.map((r, i) => {
        const a = pop(f, at(r.t) - 3, 9);
        const st = ramp(f, at(r.t) + 8, at(r.t) + 16);
        const cnt = Math.round(r.n * ramp(f, at(r.t), at(r.t) + 22, easeOut));
        return (
          <div key={i}>
            <Card mode="light" x={140} y={1000 + i * 225} w={800} h={190} a={a} pad={30} style={{ display: "flex", alignItems: "center", gap: 26, direction: "rtl" }}>
              <div style={{ fontSize: 70, fontFamily: EMOJI, transform: `scale(${1 + 0.1 * Math.sin(f / 6 + i)}) rotate(${Math.sin(f / 9 + i) * 8}deg)` }}>{r.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT_TEXT, fontSize: 46 }}>{r.fa}</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 26, color: C.red, direction: "ltr", textAlign: "right" }}>× {cnt.toLocaleString("en-US")} {r.u}</div>
              </div>
            </Card>
            <Stamp text={r.st} a={st} x={330} y={1090 + i * 225} size={40} rot={-9} />
            <Burst x={330} y={1090 + i * 225} f={f} at={at(r.t) + 12} n={12} colors={[C.red, "#ff9a9d"]} power={0.6} seed={i + 3} />
          </div>
        );
      })}
    </>
  );
};

/* 10 · dark · vibe coding ships everything… except the legal part */
const FILES = ["auth.tsx", "stripe.ts", "upload.ts", "emails.ts", "analytics.ts"];
const CODE = ["export async function POST(req) {", "  const user = await auth(req);", "  await stripe.subscriptions.create({", "  const url = await upload(file);", "  track('signup', { email });", "  return Response.json({ ok: true });", "}", "import { Resend } from 'resend';"];
export const Sc9: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const prompt = "build me a SaaS with login, payments & uploads";
  const gone = ramp(f, at(TM.forget), at(TM.forget) + 14);
  const border = `conic-gradient(from ${f * 6}deg, #d97757, #6a5cff, #2f6bff, #d97757)`;
  return (
    <>
      {/* scrolling code behind */}
      <div style={{ position: "absolute", left: 80, top: 860, width: 920, height: 860, overflow: "hidden", opacity: 0.16, fontFamily: FONT_MONO, fontSize: 24, color: "#9db8ff", lineHeight: "40px",
        WebkitMaskImage: "linear-gradient(transparent, #000 20%, #000 80%, transparent)" }}>
        <div style={{ transform: `translateY(${-((f * 3) % 320)}px)` }}>{Array.from({ length: 30 }, (_, i) => <div key={i}>{CODE[i % CODE.length]}</div>)}</div>
      </div>
      {FILES.map((n, i) => {
        const t0 = 18 + i * 6;
        const p = ramp(f, t0, t0 + 12, easeOut);
        if (p <= 0) return null;
        const y = interpolate(p, [0, 1], [1420, 900 + i * 74]);
        return (
          <div key={n} style={{ position: "absolute", left: 250, top: y, width: 580, height: 60, borderRadius: 14, background: T.dark.card, border: `1.5px solid ${T.dark.cardLine}`, overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", boxSizing: "border-box", fontFamily: FONT_MONO, fontSize: 24, color: T.dark.text, transform: `scale(${0.6 + 0.4 * p})` }}>
            <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${ramp(f, t0 + 6, t0 + 16) * 100}%`, background: "rgba(47,179,107,.12)" }} />
            <span style={{ position: "relative" }}>📄 {n}</span><span style={{ color: C.green, position: "relative" }}>{p >= 1 ? "✓ generated" : "…"}</span>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 250, top: 900 + 5 * 74, width: 580, height: 60, borderRadius: 14, border: `2px dashed ${T.dark.faint}`, boxSizing: "border-box",
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", fontFamily: FONT_MONO, fontSize: 24, color: T.dark.sub,
        opacity: ramp(f, 50, 60) * (1 - 0.85 * gone), filter: `blur(${gone * 6}px)`, transform: `translateX(${gone * 80}px) rotate(${gone * 6}deg)`, textDecoration: gone > 0.3 ? "line-through" : "none" }}>
        <span>⚖️ legal-review.md</span><span>skipped</span>
      </div>
      <Burst x={560} y={1300} f={f} at={at(TM.forget) + 4} n={16} colors={["#777", "#999", "#555"]} power={0.5} />
      <div style={{ position: "absolute", left: 127, top: 1397, width: 826, height: 196, borderRadius: 32, background: border, opacity: 0.9 }} />
      <Card mode="dark" x={130} y={1400} w={820} pad={26} style={{ height: 190 }}>
        <div style={{ fontSize: 27, minHeight: 80, fontFamily: FONT_UI }}>{typed(prompt, f, 2, 40)}<span style={{ opacity: f % 16 < 8 ? 1 : 0 }}>|</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: T.dark.sub }}><span>＋  ⚙</span><span>Claude · <span style={{ background: "#d97757", color: "#fff", borderRadius: 8, padding: "2px 9px" }}>↑</span></span></div>
      </Card>
    </>
  );
};

/* 11 · light · fast ✓ / legal ✗ */
export const Sc10: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const rows = [
    { t: TM.fast, fa: "ساختن محصول", chip: "سریع", ok: true, e: "⚡" },
    { t: TM.guar, fa: "قانونی بودنش", chip: "تضمین نشده", ok: false, e: "⚠️" },
  ];
  const speed = ramp(f, at(TM.fast), at(TM.fast) + 10, easeOut);
  return (
    <>
      <Card mode="light" x={140} y={960} w={800} pad={40} style={{ direction: "rtl" }}>
        <div style={{ fontFamily: FONT_UI, fontSize: 22, color: T.light.sub, direction: "ltr", textAlign: "left", marginBottom: 10 }}>🤖 AI · build report</div>
        {rows.map((r, i) => {
          const a = pop(f, at(r.t) - 2, 9);
          const col = r.ok ? C.green : C.red;
          return (
            <div key={i} style={{ padding: "26px 0", borderTop: i ? `1.5px solid ${T.light.cardLine}` : "none", opacity: 0.25 + 0.75 * a, transform: `translateX(${r.ok ? 0 : wobble(f, at(r.t) + 3, 14)}px)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
                <div style={{ width: 70, height: 70, borderRadius: 35, background: a > 0.5 ? col : T.light.field, color: "#fff", fontSize: 40, fontWeight: 800, textAlign: "center", lineHeight: "70px", fontFamily: FONT_UI,
                  transform: `scale(${0.7 + 0.3 * a}) rotate(${(1 - a) * -90}deg)`, boxShadow: a > 0.5 ? `0 0 26px ${col}88` : "none" }}>{a > 0.5 ? (r.ok ? "✓" : "✕") : ""}</div>
                <div style={{ flex: 1, fontFamily: FONT_TEXT, fontSize: 48, color: T.light.text }}>{r.fa}</div>
                <div style={{ fontFamily: EMOJI, fontSize: 44, opacity: a, transform: `rotate(${Math.sin(f / 5) * 10}deg)` }}>{r.e}</div>
                <div style={{ fontFamily: FONT_TEXT, fontSize: 32, color: col, background: r.ok ? "rgba(47,179,107,.12)" : C.redSoft, padding: "6px 22px 10px", borderRadius: 16, opacity: a }}>{r.chip}</div>
              </div>
              {r.ok && <div style={{ height: 12, borderRadius: 6, background: T.light.field, marginTop: 16, overflow: "hidden" }}><div style={{ width: `${speed * 100}%`, height: "100%", background: C.green }} /></div>}
              {!r.ok && a > 0 && <div style={{ height: 12, borderRadius: 6, marginTop: 16, background: `repeating-linear-gradient(-45deg, ${C.red}33 0 12px, transparent 12px 24px)`, backgroundPosition: `${f * 2}px 0` }} />}
            </div>
          );
        })}
      </Card>
      <Burst x={250} y={1110} f={f} at={at(TM.fast) + 4} n={16} colors={[C.green, "#fff", "#f5b700"]} power={0.7} />
      {f >= at(TM.guar) && <Rings x={250} y={1290} f={f} at={at(TM.guar)} color={C.red} r0={40} r1={180} />}
    </>
  );
};

/* 12 · dark · the prompt → Claude → everything fixed (receipt strikes through) */
const FIXES = ["Age gate added", "Fonts self-hosted", "Replay masks inputs", "Unsubscribe + address", "Renewal terms shown", "DMCA agent · $6"];
export const Sc11: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const text = "این پرامپت رو روی اپم اجرا کن و همه‌ی مشکلات حقوقی رو پیدا کن";
  const border = `conic-gradient(from ${f * 5}deg, #d97757, #2fb36b, #2f6bff, #d97757)`;
  const done = f >= at(FIX[5]) + 12;
  return (
    <>
      <div style={{ position: "absolute", left: 126, top: 876, width: 828, height: 238, borderRadius: 33, background: border, filter: "blur(1px)", opacity: 0.95 }} />
      <Card mode="dark" x={130} y={880} w={820} pad={26} style={{ height: 230 }}>
        <div style={{ display: "inline-block", fontSize: 19, background: "rgba(47,107,255,.2)", color: "#9db8ff", padding: "5px 14px", borderRadius: 12, marginBottom: 12 }}>📎 legal-check-prompt.md</div>
        <div style={{ fontFamily: FONT_TEXT, fontSize: 30, minHeight: 90, direction: "rtl", lineHeight: 1.5 }}>{typed(text, f, at(TM.claude) - 8, 30)}</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: T.dark.sub }}><span>＋  ⚙</span><span>✳️ Claude · <span style={{ background: f > at(FIX[0]) ? C.green : "#d97757", color: "#fff", borderRadius: 8, padding: "2px 9px" }}>{f > at(FIX[0]) ? "✓" : "↑"}</span></span></div>
      </Card>
      {FIXES.map((t, i) => {
        const a = pop(f, at(FIX[i]), 8);
        const sweep = ramp(f, at(FIX[i]), at(FIX[i]) + 12, easeOut);
        return (
          <div key={t} style={{ position: "absolute", left: 130, top: 1150 + i * 84, width: 820, height: 70, borderRadius: 16, background: T.dark.card, border: `1.5px solid ${a > 0 ? "rgba(47,179,107,.5)" : T.dark.cardLine}`, overflow: "hidden",
            display: "flex", alignItems: "center", gap: 18, padding: "0 24px", boxSizing: "border-box", fontFamily: FONT_UI, fontSize: 26, color: T.dark.text, opacity: 0.2 + 0.8 * a, transform: `translateX(${(1 - a) * 30}px)` }}>
            <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${sweep * 100}%`, background: "linear-gradient(90deg, rgba(47,179,107,.25), rgba(47,179,107,.05))" }} />
            <span style={{ color: C.green, fontWeight: 800, position: "relative", transform: `scale(${1 + 0.5 * Math.sin(Math.PI * clamp(sweep * 2))})` }}>✓</span><span style={{ position: "relative" }}>{t}</span>
          </div>
        );
      })}
      {FIX.map((x, i) => <Burst key={i} x={170} y={1185 + i * 84} f={f} at={at(x) + 2} n={8} colors={[C.green, "#b7f3c9"]} power={0.4} seed={i} />)}
      <Burst x={540} y={420} f={f} at={at(FIX[5]) + 12} n={40} power={1.3} colors={[C.green, "#fff", "#f5b700", C.blue]} />
      {done && <FloatUp x={540} y={560} f={f} at={at(FIX[5]) + 12} text="TOTAL $0 ✓" color={C.green} size={44} dur={40} />}
    </>
  );
};

/* 13 · dark · CTA: comment «قانون» */
export const Sc12: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const word = "قانون";
  const tp = typed(word, f, at(TM.comment) - 4, 10);
  const sentAt = at(TM.comment) + 22;
  const sent = f > sentAt;
  const heart = pop(f, sentAt + 2, 10);
  const plane = f - sentAt;
  const enter = ramp(f, 0, 16, easeOut);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - enter) * 200}px)`, opacity: enter }}>
        <Card mode="dark" x={130} y={900} w={820} pad={30}>
          <div style={{ textAlign: "center", fontSize: 24, fontWeight: 700, marginBottom: 20 }}>💬 Comments · {(1204 + (sent ? 1 : 0)).toLocaleString("en-US")}</div>
          {[0.8, 0.55, 0.7].map((w, i) => (
            <div key={i} style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 22, opacity: 0.5 + 0.5 * Math.abs(Math.sin(f / 20 + i)) }}>
              <div style={{ width: 54, height: 54, borderRadius: 27, background: AV[i * 3] }} />
              <div style={{ flex: 1 }}><div style={{ width: `${w * 60}%`, height: 14, borderRadius: 7, background: T.dark.faint, marginBottom: 10 }} /><div style={{ width: `${w * 100}%`, height: 14, borderRadius: 7, background: T.dark.field }} /></div>
            </div>
          ))}
          {sent && (
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 22, opacity: pop(f, sentAt, 8), transform: `translateY(${(1 - pop(f, sentAt, 8)) * 40}px)`, background: "rgba(47,107,255,.12)", borderRadius: 18, padding: 10 }}>
              <div style={{ width: 54, height: 54, borderRadius: 27, background: C.blue, textAlign: "center", lineHeight: "54px", fontFamily: EMOJI, fontSize: 30 }}>🙋</div>
              <div style={{ flex: 1, fontFamily: FONT_TEXT, fontSize: 40, direction: "rtl", textAlign: "left" }}>{word}</div>
              <div style={{ fontSize: 44, transform: `scale(${1 + 0.5 * Math.sin(Math.PI * clamp(heart))})`, color: heart > 0 ? C.red : T.dark.sub }}>{heart > 0 ? "♥" : "♡"}</div>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 14, height: 80, borderRadius: 40, border: `2px solid ${sent ? T.dark.cardLine : C.blue}`, padding: "0 16px 0 26px",
            boxShadow: !sent && tp ? `0 0 ${20 + 10 * Math.sin(f / 3)}px rgba(47,107,255,.5)` : "none" }}>
            <div style={{ flex: 1, fontFamily: FONT_TEXT, fontSize: 36, direction: "rtl", textAlign: "left", color: tp ? T.dark.text : T.dark.sub }}>{sent ? "" : tp || "یه کامنت بذار…"}</div>
            <div style={{ width: 54, height: 54, borderRadius: 27, background: tp && !sent ? C.blue : T.dark.faint, color: "#fff", fontSize: 28, textAlign: "center", lineHeight: "54px",
              transform: plane >= 0 && plane < 14 ? `translate(${plane * 6}px, ${-plane * 22}px) scale(${1 - plane / 20})` : "none" }}>↑</div>
          </div>
        </Card>
      </div>
      <Hearts x={820} y={1500} f={f} a={sentAt + 4} b={sentAt + 60} n={16} />
      <Burst x={820} y={1480} f={f} at={sentAt} n={20} colors={[C.blue, "#fff", C.red]} power={0.8} />
      {sent && <Rings x={540} y={1300} f={f} at={sentAt} color={C.blue} r0={100} r1={500} n={3} />}
    </>
  );
};
