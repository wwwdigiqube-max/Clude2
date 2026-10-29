import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Burst, FloatUp, floatStyle, Rings, Stream } from "../styles/receipt-ui/fx";
import { Button, Card, Cursor, Field, Missing, Notif, Phone, Toggle, fr } from "../styles/receipt-ui/kit";
import { C, clamp, easeBack, easeOut, FONT_MONO, FONT_UI, ramp, rnd, T } from "../styles/receipt-ui/theme";
import { TM } from "./times";

export type SP = { from: number };
/** local frame + converter from absolute seconds to local frames */
export const useLocal = (from: number) => {
  const f = useCurrentFrame();
  return { f, at: (sec: number) => fr(sec - from) };
};
export const pop = (f: number, a: number, d = 9) => ramp(f, a, a + d, easeBack);
/** decaying horizontal wobble after frame a */
export const wobble = (f: number, a: number, amp = 10) => (f < a || f > a + 18 ? 0 : Math.sin((f - a) * 2.4) * amp * Math.exp(-(f - a) / 5));
const EMOJI = "'Segoe UI Emoji'";

/* 1 · dark · lock screen at night: live 🚀 → waiting for first sale → legal notice ⚖️ */
export const Sc0: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const n = [pop(f, at(TM.deploy)), pop(f, at(TM.sale)), pop(f, at(TM.legal))];
  const enter = ramp(f, 0, 22, easeOut);
  const legal = f >= at(TM.legal);
  const rocketT = f - at(TM.deploy);
  return (
    <>
      {legal && <Rings x={540} y={1290} f={f} every={26} n={3} color={C.red} r0={200} r1={430} />}
      <div style={{ position: "absolute", inset: 0, transform: `perspective(1600px) rotateY(${(1 - enter) * 28}deg) translateY(${(1 - enter) * 90}px)`, opacity: enter }}>
        <div style={{ position: "absolute", inset: 0, ...floatStyle(f, 1, 7) }}>
          <Phone x={320} y={900} s={0.9} screen="radial-gradient(ellipse at 50% 0%, #2a2c4a 0%, #0b0b12 70%)">
            {/* night sky */}
            {Array.from({ length: 30 }, (_, i) => (
              <div key={i} style={{ position: "absolute", left: rnd(i) * 400, top: 20 + rnd(i + 9) * 260, width: 3, height: 3, borderRadius: 2, background: "#fff", opacity: 0.25 + 0.6 * Math.abs(Math.sin(f / 9 + i)) }} />
            ))}
            <div style={{ position: "absolute", left: 300, top: 40, fontFamily: EMOJI, fontSize: 40, transform: `rotate(${Math.sin(f / 20) * 8}deg)` }}>🌙</div>
            <div style={{ position: "absolute", left: 0, top: 80, width: 412, textAlign: "center", color: "#fff", fontFamily: FONT_UI }}>
              <div style={{ fontSize: 21, opacity: 0.8 }}>Thursday, September 18</div>
              <div style={{ fontSize: 112, fontWeight: 700, lineHeight: 1.05 }}>9:41</div>
            </div>
            <div style={{ position: "absolute", left: 0, top: 300, width: 412, display: "flex", flexDirection: "column" }}>
              {n[2] > 0 && <div style={{ transform: `translateX(${wobble(f, at(TM.legal), 12)}px)` }}><Notif a={n[2]} icon="⚖" color={C.red} app="Mail" title="Doe v. Vibely, Inc." body="Legal notice · damages sought" red /></div>}
              {n[1] > 0 && <Notif a={n[1]} icon="S" color={C.violet} app="Stripe" title="Payments ready" body="Waiting for your first sale · $0" />}
              {n[0] > 0 && <Notif a={n[0]} icon="▲" color="#000" app="Vercel" title="Deployment ready" body="vibely.app is live · built in 1 night" />}
            </div>
            {legal && <div style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 ${60 + 30 * Math.sin(f / 4)}px rgba(229,72,77,.55)`, borderRadius: 60 }} />}
          </Phone>
        </div>
      </div>
      {/* rocket launch on "deploy" */}
      {rocketT >= 0 && rocketT < 40 && (
        <div style={{ position: "absolute", left: 700 + rocketT * 6, top: 1500 - rocketT * 22, fontFamily: EMOJI, fontSize: 80, transform: `rotate(${-10 + rocketT}deg)`, opacity: rocketT < 30 ? 1 : 1 - (rocketT - 30) / 10 }}>🚀</div>
      )}
      <Burst x={540} y={1245} f={f} at={at(TM.deploy)} n={16} power={0.8} colors={["#fff", "#9db8ff", "#f5b700"]} />
      {legal && (
        <div style={{ position: "absolute", left: 720, top: 885, width: 84, height: 84, borderRadius: 42, background: C.red, color: "#fff", fontFamily: FONT_UI, fontWeight: 900, fontSize: 52,
          textAlign: "center", lineHeight: "84px", transform: `scale(${pop(f, at(TM.legal) + 2)})`, boxShadow: "0 0 40px rgba(229,72,77,.8)" }}>!</div>
      )}
    </>
  );
};

/* 2 · light · the product, then everything stacked behind it */
const LAYERS = [
  { t: "Google Fonts", s: "loaded from Google CDN", e: "🔤" },
  { t: "Analytics", s: "session replay · heatmaps", e: "📊" },
  { t: "Marketing emails", s: "waitlist · launch blast", e: "✉️" },
  { t: "Stripe", s: "subscriptions · renewals", e: "💳" },
  { t: "User uploads", s: "profile pictures · images", e: "🖼️" },
];
export const Sc1: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const r = ramp(f, at(TM.behind) - 4, at(TM.behind) + 14);
  const iso = (k: number) => `perspective(2200px) rotateX(${56 * k}deg) rotateZ(${-32 * k}deg)`;
  const slab: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: 620, height: 380, borderRadius: 26, boxSizing: "border-box" };
  const glow = f >= at(TM.product) ? Math.max(0, 1 - (f - at(TM.product)) / 30) : 0;
  const enter = ramp(f, 0, 16, easeOut);
  return (
    <>
      <div style={{ position: "absolute", left: 230, top: 900, width: 620, height: 380, transform: `scale(${0.86 * (0.9 + 0.1 * enter)})`, transformOrigin: "50% 0", opacity: enter }}>
        {LAYERS.map((l, i) => {
          const a = ramp(f, at(TM.behind) + 4 + i * 4, at(TM.behind) + 14 + i * 4, easeOut);
          const wave = a >= 1 ? Math.sin(f / 9 - i * 0.9) * 8 : 0;
          const pulse = 1 + 0.12 * Math.max(0, Math.sin(f / 5 - i));
          return (
            <div key={i} style={{ ...slab, transform: `translateY(${-40 + (i + 1) * 112 * a + wave}px) ${iso(1)}`, opacity: a, background: "#fff", border: `2px solid ${T.light.cardLine}`, zIndex: 10 - i,
              boxShadow: "0 30px 50px rgba(0,0,0,.12)", fontFamily: FONT_UI }}>
              <div style={{ position: "absolute", left: 40, bottom: 26, display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ width: 50, height: 50, borderRadius: 25, background: C.red, color: "#fff", fontSize: 34, fontWeight: 800, textAlign: "center", lineHeight: "50px", transform: `scale(${pulse})`, boxShadow: "0 0 18px rgba(229,72,77,.5)" }}>!</div>
                <div style={{ fontFamily: EMOJI, fontSize: 46 }}>{l.e}</div>
                <div><div style={{ fontSize: 46, fontWeight: 700, color: T.light.text, lineHeight: 1.05 }}>{l.t}</div><div style={{ fontSize: 26, color: T.light.sub }}>{l.s}</div></div>
              </div>
            </div>
          );
        })}
        {/* the product (top) */}
        <div style={{ ...slab, zIndex: 20, background: "#fff", boxShadow: `${T.light.shadow}, 0 0 0 ${glow * 14}px rgba(47,107,255,${glow * 0.35})`, overflow: "hidden",
          transform: `translateY(${-150 * r + (r < 1 ? Math.sin(f / 18) * 8 : 0)}px) ${iso(r)}`, fontFamily: FONT_UI }}>
          <div style={{ height: 50, background: "#f4f4f6", display: "flex", alignItems: "center", gap: 9, padding: "0 20px" }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}
            <span style={{ marginLeft: 16, flex: 1, height: 28, borderRadius: 14, background: "#fff", fontSize: 17, color: "#777", lineHeight: "28px", paddingLeft: 14 }}>vibely.app</span>
          </div>
          <div style={{ padding: "40px 46px", position: "relative" }}>
            <div style={{ fontSize: 50, fontWeight: 800, color: "#111", lineHeight: 1.1 }}>Build apps<br />in a night.</div>
            <div style={{ fontSize: 22, color: "#888", margin: "12px 0 24px" }}>AI-powered · ship today</div>
            <div style={{ display: "inline-block", position: "relative", overflow: "hidden", background: C.blue, color: "#fff", fontSize: 24, fontWeight: 700, padding: "14px 30px", borderRadius: 14 }}>
              Get started →
              <span style={{ position: "absolute", top: 0, bottom: 0, left: `${((f * 4) % 360) - 80}%`, width: "40%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,.45),transparent)" }} />
            </div>
            <div style={{ position: "absolute", right: 40, top: 30, fontFamily: EMOJI, fontSize: 80, transform: `rotate(${Math.sin(f / 14) * 10}deg) translateY(${Math.sin(f / 10) * -8}px)` }}>✨</div>
          </div>
        </div>
      </div>
      {glow > 0 && <Rings x={540} y={1060} f={f} at={at(TM.product)} color={C.blue} r0={180} r1={420} />}
    </>
  );
};

/* 3 · light · sign-up form with no age gate */
export const Sc2: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const email = "max@gmail.com".slice(0, Math.max(0, Math.floor((f - 6) / 2.2)));
  const typing = f > 4 && f < 40;
  const pw = "•".repeat(clamp(Math.floor((f - 40) / 2), 0, 9));
  const ageA = ramp(f, at(TM.limit), at(TM.limit) + 10, easeOut);
  const click = ramp(f, at(TM.age13), at(TM.age13) + 12);
  const done = f >= at(TM.age13) + 3;
  const k = interpolate(f, [at(TM.limit) + 6, at(TM.age13) - 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut });
  const cx = 930 - 170 * k - Math.sin(Math.PI * k) * 120;
  const cy = 1700 - 308 * k;
  const joined = pop(f, at(TM.age13) + 6);
  const flip = ramp(f, 0, 18, easeOut);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `perspective(1800px) rotateX(${(1 - flip) * 35}deg)`, transformOrigin: "50% 45%", opacity: flip }}>
        <Card mode="light" x={190} y={880} w={700} pad={40} style={{ boxShadow: `${T.light.shadow}${typing ? ", 0 0 0 6px rgba(47,107,255,.18)" : ""}` }}>
          <div style={{ fontSize: 36, fontWeight: 700 }}>Create account</div>
          <div style={{ fontSize: 20, color: T.light.sub, marginBottom: 22 }}>step 1 of 1 · takes 10 seconds</div>
          <Field mode="light" label="Email" value={email + (typing && f % 14 < 7 ? "|" : "")} w={620} />
          <div style={{ height: 102 * ageA, overflow: "hidden", position: "relative", transform: `translateX(${wobble(f, at(TM.limit) + 6, 14)}px)` }}>
            <Field mode="light" label="Age" value="Are you over 13?" w={620} bad />
            <Missing a={ageA} style={{ right: -6, top: 22 }} />
          </div>
          <Field mode="light" label="Password" value={pw} w={620} />
          <Button label={done ? "✓  Welcome, max" : "Create account"} color={done ? C.green : C.blue} w={620} press={click > 0 && click < 1 ? 1 - click : 0} />
          {joined > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 20, opacity: joined, transform: `translateY(${(1 - joined) * 20}px)` }}>
              <div style={{ position: "relative", width: 58, height: 58, borderRadius: 14, background: "#7dd87d", fontSize: 34, textAlign: "center", lineHeight: "58px", fontFamily: EMOJI }}>🧒
                <span style={{ position: "absolute", left: -8, bottom: -8, background: C.red, color: "#fff", fontSize: 17, fontWeight: 800, borderRadius: 11, padding: "1px 7px", fontFamily: FONT_UI,
                  transform: `scale(${1 + 0.15 * Math.max(0, Math.sin(f / 4))})` }}>13</span>
              </div>
              <div><div style={{ fontSize: 24, fontWeight: 700 }}>max · 13 y.o.</div><div style={{ fontSize: 18, color: T.light.sub }}>first sign-up · nobody asked</div></div>
              <div style={{ marginLeft: "auto", fontSize: 18, color: C.green, background: "rgba(47,179,107,.12)", padding: "4px 14px", borderRadius: 12 }}>● joined</div>
            </div>
          )}
        </Card>
      </div>
      {joined > 0 && <div style={{ position: "absolute", left: 800, top: 1520 + Math.sin(f / 8) * 10, fontFamily: EMOJI, fontSize: 70, transform: `scale(${joined}) rotate(${Math.sin(f / 10) * 12}deg)` }}>🎂</div>}
      <Burst x={760} y={1392} f={f} at={at(TM.age13) + 3} n={26} />
      <FloatUp x={540} y={1320} f={f} at={at(TM.age13) + 4} text="+1 user" color={C.green} />
      <Cursor x={cx} y={cy} click={click} a={ramp(f, at(TM.limit) + 4, at(TM.limit) + 10)} />
    </>
  );
};

/* 4 · dark · font request leaks the visitor's IP to Google */
export const Sc3: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const R = 280, CX = 540, CY = 1370;
  const draw = ramp(f, 2, 18, easeOut);
  const pt = (k: number): [number, number] => [CX - R * Math.cos(Math.PI * k), CY - R * Math.sin(Math.PI * k)];
  const font = ramp(f, at(TM.font), at(TM.font) + 22);
  const ip = ramp(f, at(TM.ip), at(TM.ip) + 24);
  const red = f >= at(TM.ip);
  const court = pop(f, at(TM.leak), 10);
  const gavel = ramp(f, at(TM.leak) - 4, at(TM.leak) + 3, (t) => t * t);
  const box = (x: number, emoji: string, head: string, city: string, addr: string, glow?: boolean, seed = 0) => (
    <div style={{ position: "absolute", left: x, top: 1400, width: 400, padding: "20px 26px", borderRadius: 20, background: T.dark.card, border: `1.5px solid ${glow ? C.red : T.dark.cardLine}`,
      fontFamily: FONT_UI, color: T.dark.text, boxShadow: glow ? "0 0 40px rgba(229,72,77,.45)" : T.dark.shadow, ...floatStyle(f, seed, 5) }}>
      <div style={{ position: "absolute", right: 22, top: 18, fontFamily: EMOJI, fontSize: 44 }}>{emoji}</div>
      <div style={{ fontSize: 18, color: T.dark.sub }}>{head}</div>
      <div style={{ fontSize: 30, fontWeight: 700 }}>{city}</div>
      <div style={{ fontSize: 19, color: T.dark.sub, fontFamily: FONT_MONO }}>{addr}</div>
    </div>
  );
  const [fx, fy] = pt(1 - font);
  const [ix, iy] = pt(ip);
  const arcLen = Math.PI * R;
  return (
    <>
      <Rings x={CX - R} y={CY} f={f} every={30} n={2} color="#9db8ff" r0={10} r1={70} />
      <Rings x={CX + R} y={CY} f={f} every={30} n={2} color={red ? C.red : C.blue} r0={10} r1={70} />
      <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={`M${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`} fill="none" stroke={red ? C.red : C.blue} strokeWidth="5" strokeDasharray={`${arcLen * draw} ${arcLen}`} strokeLinecap="round" opacity=".7" />
        <circle cx={CX - R} cy={CY} r="10" fill="#fff" /><circle cx={CX + R} cy={CY} r="10" fill={red ? C.red : C.blue} />
      </svg>
      {draw >= 1 && <Stream pt={(k) => pt(red ? k : 1 - k)} f={f} n={9} color={red ? C.red : "#9db8ff"} speed={red ? 0.03 : 0.018} />}
      {font > 0 && font < 1 && <div style={{ position: "absolute", left: fx - 80, top: fy - 24, width: 160, height: 48, borderRadius: 12, background: "#fff", color: "#111", fontFamily: FONT_MONO, fontSize: 19, textAlign: "center", lineHeight: "48px", fontWeight: 700, boxShadow: "0 0 26px rgba(157,184,255,.7)" }}>Aa Inter.woff2</div>}
      {ip > 0 && <div style={{ position: "absolute", left: ix - 95, top: iy - 24, width: 190, height: 48, borderRadius: 12, background: C.red, color: "#fff", fontFamily: FONT_MONO, fontSize: 21, textAlign: "center", lineHeight: "48px", fontWeight: 700, boxShadow: "0 0 30px rgba(229,72,77,.7)", transform: `scale(${1 + 0.1 * Math.sin(f / 3)})` }}>84.21.16.42</div>}
      {box(60, "🧑‍💻", "FROM · your visitor", "Berlin, DE", "84.21.16.42 · Telekom", false, 0)}
      {box(620, "🌐", "TO · fonts.gstatic.com", "Mountain View, US", "142.250.185.99 · Google", red && ip >= 1, 2)}
      <div style={{ position: "absolute", left: 150, top: 1570, width: 780, padding: "18px 26px", borderRadius: 12, background: C.paper, color: C.ink, fontFamily: "Georgia, serif", opacity: court, transform: `translateY(${(1 - court) * 30}px) rotate(-1deg)` }}>
        <div style={{ fontSize: 17, opacity: 0.6 }}>Landgericht München I · Urteil vom 20.01.2022 · Az. 3 O 17493/20</div>
        <div style={{ fontSize: 22 }}>„Die dynamische IP-Adresse stellt … ein personenbezogenes Datum dar.“ <b style={{ color: C.red }}>€100</b></div>
      </div>
      {gavel > 0 && <div style={{ position: "absolute", left: 800, top: 1500, fontFamily: EMOJI, fontSize: 96, transform: `rotate(${-70 + 70 * gavel}deg)`, transformOrigin: "80% 80%" }}>🔨</div>}
      <Burst x={880} y={1590} f={f} at={at(TM.leak) + 3} n={14} power={0.7} colors={["#f5b700", "#fff", C.red]} />
    </>
  );
};

/* 5 · light · analytics with session replay on by default → keystrokes recorded */
export const Sc4: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const on = ramp(f, at(TM.sess), at(TM.sess) + 8, easeOut);
  const rep = ramp(f, at(TM.behav) - 6, at(TM.behav) + 6, easeOut);
  const typedF = interpolate(f, [at(TM.behav), at(TM.rec)], [0, 7.99], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const typedN = clamp(Math.floor(typedF), 0, 7);
  const pw = "hunter2";
  const listen = pop(f, at(TM.rec));
  const row = (name: string, sub: string, k: number, extra?: React.ReactNode) => (
    <div style={{ display: "flex", alignItems: "center", padding: "14px 0", borderTop: `1.5px solid ${T.light.cardLine}` }}>
      <div style={{ flex: 1 }}><div style={{ fontSize: 26, fontWeight: 600 }}>{name}</div><div style={{ fontSize: 18, color: T.light.sub }}>{sub}</div></div>
      {extra}<Toggle on={k} mode="light" />
    </div>
  );
  const keyX = (i: number) => 190 + 30 + 45 + (620 - 7 * 62 - 60) / 2 + i * 72 + 31;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, ...floatStyle(f, 0, 5) }}>
        <Card mode="light" x={190} y={880} w={700} pad={36} a={ramp(f, 0, 14, easeOut)}>
          <div style={{ fontSize: 34, fontWeight: 700 }}>📊 Analytics</div>
          <div style={{ fontSize: 19, color: T.light.sub, marginBottom: 14 }}>settings · added 2 minutes ago</div>
          {row("Heatmaps", "clicks & scroll", 0)}
          {row("Session replay", "records the screen", on, on > 0.5 ? <span style={{ color: C.red, fontSize: 19, marginRight: 14, opacity: 0.6 + 0.4 * Math.sin(f / 4) }}>on by default</span> : null)}
          {row("Console logs", "errors only", 0)}
        </Card>
      </div>
      {on > 0 && <Rings x={820} y={1113} f={f} at={at(TM.sess)} color={C.green} r0={20} r1={90} />}
      <Card mode="light" x={190} y={1330} w={700} pad={30} a={rep}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div><div style={{ fontSize: 28, fontWeight: 700 }}>Session replay</div><div style={{ fontSize: 17, color: T.light.sub }}>user #4471 · 0:0{typedN + 2}</div></div>
          <div style={{ color: C.red, fontWeight: 700, fontSize: 20, opacity: f % 20 < 12 ? 1 : 0.35 }}>● REC</div>
        </div>
        <div style={{ display: "flex", gap: 20, margin: "14px 0" }}>
          <Field mode="light" label="what the user sees" value={"•".repeat(typedN)} w={305} mono style={{ marginBottom: 0 }} />
          <Field mode="light" label="what the replay gets" value={pw.slice(0, typedN)} w={305} bad mono style={{ marginBottom: 0 }} />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {pw.split("").map((c, i) => (
            <div key={i} style={{ width: 62, height: 62, borderRadius: 12, background: i === typedN - 1 ? "#dfe6ff" : T.light.field, boxShadow: i === typedN - 1 ? "0 0 0 3px rgba(47,107,255,.4)" : "0 3px 0 rgba(0,0,0,.12)", fontSize: 26, fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${i === typedN - 1 ? 4 : 0}px)` }}>{c}</div>
          ))}
        </div>
        {listen > 0 && <div style={{ position: "absolute", right: 30, bottom: -18, background: C.red, color: "#fff", fontSize: 19, fontWeight: 700, padding: "5px 14px", borderRadius: 14, transform: `scale(${listen})` }}>● 3rd party · listening</div>}
      </Card>
      {/* keystroke letters flying from the keyboard to the replay tape */}
      {rep > 0.9 && pw.split("").map((c, i) => {
        const p = typedF - i;
        if (p < 0 || p > 1) return null;
        const x = keyX(i) + (720 - keyX(i)) * p;
        const y = 1555 - 115 * p - Math.sin(Math.PI * p) * 60;
        return <div key={i} style={{ position: "absolute", left: x - 16, top: y - 20, width: 32, height: 40, borderRadius: 8, background: C.red, color: "#fff", fontFamily: FONT_MONO, fontWeight: 800, fontSize: 24, textAlign: "center", lineHeight: "40px" }}>{c}</div>;
      })}
      {/* REC frame + watching eye */}
      {rep > 0.5 && (
        <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0 }}>
          {[[176, 1316, 1, 1], [904, 1316, -1, 1], [176, 1694, 1, -1], [904, 1694, -1, -1]].map(([x, y, sx, sy], i) => (
            <path key={i} d={`M${x} ${y + 40 * sy} V${y} H${x + 40 * sx}`} stroke={C.red} strokeWidth="5" fill="none" opacity={0.5 + 0.5 * Math.sin(f / 5)} />
          ))}
        </svg>
      )}
      {rep > 0.5 && <div style={{ position: "absolute", left: 860, top: 1260 + Math.sin(f / 9) * 8, fontFamily: EMOJI, fontSize: 64, transform: `rotate(${Math.sin(f / 7) * 12}deg)` }}>👁️</div>}
      {listen > 0 && <Stream pt={(k) => [760 + k * 360, 1690 + Math.sin(k * 6) * 10]} f={f} n={6} color={C.red} speed={0.04} />}
    </>
  );
};

/* 6a · dark · launch email to 1,204 people with no unsubscribe link */
export const Sc5a: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const miss = ramp(f, at(TM.unsub), at(TM.unsub) + 8, easeOut);
  const enter = ramp(f, 0, 18, easeOut);
  const sendT = f - at(TM.promo);
  const sent = Math.round(interpolate(sendT, [0, 30], [0, 1204], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - enter) * 300}px) rotate(${(1 - enter) * 8}deg)`, opacity: enter }}>
        <div style={{ position: "absolute", inset: 0, ...floatStyle(f, 2, 6) }}>
          <Phone x={320} y={890} s={0.9} screen="#fff">
            <div style={{ padding: "90px 30px 0", fontFamily: FONT_UI, color: "#111" }}>
              <div style={{ fontSize: 32, fontWeight: 800 }}>we launched 🚀 <span style={{ fontSize: 16, background: "#eee", padding: "2px 8px", borderRadius: 6, fontWeight: 500 }}>Inbox</span></div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "18px 0" }}>
                <div style={{ width: 46, height: 46, borderRadius: 23, background: C.violet, color: "#fff", textAlign: "center", lineHeight: "46px", fontWeight: 800, fontSize: 22 }}>V</div>
                <div><div style={{ fontSize: 20, fontWeight: 700 }}>Vibely</div><div style={{ fontSize: 16, color: "#888" }}>to {sent.toLocaleString("en-US")} people · 9:41 AM</div></div>
              </div>
              <div style={{ fontSize: 20, lineHeight: 1.5, color: "#333" }}>Hey! Vibely is out of the waitlist and open to everyone today. The Pro plan is 50% off for the first 1,000 people.</div>
              <div style={{ display: "inline-block", background: C.violet, color: "#fff", fontWeight: 700, fontSize: 20, padding: "10px 20px", borderRadius: 10, margin: "18px 0" }}>Try Vibely →</div>
              <div style={{ fontSize: 18, color: "#999" }}>— the Vibely team</div>
              <div style={{ position: "relative", marginTop: 26, height: 70, borderRadius: 12, border: `2.5px dashed ${miss > 0 ? C.red : "#ddd"}`, background: miss > 0 ? C.redSoft : "transparent",
                color: C.red, fontSize: 19, display: "flex", alignItems: "center", paddingLeft: 16, opacity: 0.4 + 0.6 * miss, transform: `translateX(${wobble(f, at(TM.unsub), 10)}px)` }}>
                {miss > 0 ? "Unsubscribe link · postal address" : "footer"}
                <Missing a={miss} style={{ right: -8, top: -16 }} />
              </div>
            </div>
          </Phone>
        </div>
      </div>
      {/* envelopes fanning out to the list */}
      {Array.from({ length: 8 }, (_, i) => {
        const t = sendT - i * 3;
        if (t < 0 || t > 34) return null;
        const ang = (-150 + i * 40) * (Math.PI / 180);
        const d = t * 16;
        return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(ang) * d * 1.3 - 30, top: 1250 + Math.sin(ang) * d - 30, fontFamily: EMOJI, fontSize: 56, opacity: 1 - t / 34, transform: `rotate(${ang * 30}deg) scale(${0.6 + t / 40})` }}>✉️</div>;
      })}
      {miss > 0 && <Rings x={540} y={1650} f={f} at={at(TM.unsub)} color={C.red} r0={60} r1={260} />}
    </>
  );
};

/* 6b · light · Stripe subscription with hidden renewal terms */
export const Sc5b: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const click = ramp(f, at(TM.have), at(TM.have) + 12);
  const subbed = f >= at(TM.have) + 3;
  const terms = ramp(f, at(TM.terms), at(TM.terms) + 8, easeOut);
  const k = interpolate(f, [2, at(TM.have) - 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut });
  const cx = 920 - 140 * k + Math.sin(Math.PI * k) * 80, cy = 1650 - 480 * k;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const enter = ramp(f, 0, 16, easeOut);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${0.9 + 0.1 * enter})`, opacity: enter, transformOrigin: "50% 60%" }}>
        <Card mode="light" x={190} y={900} w={700} pad={38}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div><div style={{ fontSize: 19, color: T.light.sub }}>Subscribe to</div><div style={{ fontSize: 34, fontWeight: 700 }}>Vibely Pro</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 40, fontWeight: 800 }}>$29</div><div style={{ fontSize: 17, color: T.light.sub }}>per month</div></div>
          </div>
          <Field mode="light" label="Card" value="💳 •••• •••• •••• 4242" w={624} style={{ marginTop: 18 }} />
          <div style={{ position: "relative", overflow: "hidden", borderRadius: 18 }}>
            <Button label={subbed ? "✓  Subscribed" : "Subscribe"} color={subbed ? C.green : C.violet} w={624} press={click > 0 && click < 1 ? 1 - click : 0} />
            {!subbed && <span style={{ position: "absolute", top: 0, bottom: 0, left: `${((f * 5) % 300) - 60}%`, width: "30%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent)" }} />}
          </div>
          <div style={{ position: "relative", height: 84 * terms, overflow: "visible", opacity: terms, marginTop: 16, transform: `translateX(${wobble(f, at(TM.terms) + 4, 12)}px)` }}>
            <div style={{ height: 62, borderRadius: 12, border: `2.5px dashed ${C.red}`, background: C.redSoft, color: C.red, fontSize: 20, display: "flex", alignItems: "center", paddingLeft: 16 }}>Renews monthly until you cancel · cancel anytime</div>
            <Missing a={terms} style={{ right: -8, top: -14 }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            {months.map((m, i) => {
              const kk = ramp(f, at(TM.notShown) + i * 3, at(TM.notShown) + i * 3 + 6, easeBack);
              return (
                <div key={m} style={{ flex: 1, textAlign: "center", opacity: ramp(f, at(TM.terms) + 6 + i * 2, at(TM.terms) + 12 + i * 2), perspective: 400 }}>
                  <div style={{ height: 50, borderRadius: 10, background: kk > 0.5 ? C.redSoft : T.light.field, border: kk > 0.5 ? `2px solid ${C.red}` : "none", color: kk > 0.5 ? C.red : T.light.text, fontSize: 20, fontWeight: 700,
                    lineHeight: "50px", transform: `rotateX(${Math.sin(Math.PI * clamp(kk)) * 180}deg)` }}>$29</div>
                  <div style={{ fontSize: 16, color: T.light.sub, marginTop: 4 }}>{m}</div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 17, color: T.light.sub, marginTop: 16 }}>Powered by <b style={{ color: C.violet }}>stripe</b></div>
        </Card>
      </div>
      {months.map((m, i) => <FloatUp key={m} x={255 + i * 107} y={1300} f={f} at={at(TM.notShown) + i * 3 + 3} text="−$29" size={28} />)}
      <Burst x={780} y={1170} f={f} at={at(TM.have) + 3} n={18} colors={[C.green, C.violet, "#fff"]} power={0.8} />
      <Cursor x={cx} y={cy} click={click} a={ramp(f, 0, 6)} />
    </>
  );
};
