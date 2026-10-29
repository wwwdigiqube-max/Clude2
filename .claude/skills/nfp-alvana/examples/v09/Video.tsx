// Video 09 — Story Montage (English). Voice: reference narration (music removed with ElevenLabs Voice Isolator),
// word timings from ElevenLabs Speech-to-Text. 13 worlds + a "Made with NFP" outro.
import React from "react";
import { AbsoluteFill, Html5Audio as Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import {
  Apple, AppTile, BlurDefs, BpDeco, Callout, ChalkDefs, ChalkDust, CircuitFigure, clamp, draw, Dust, easeBack, easeOut, F, FileIcon, Grain, GridBox, Leak, LockTop,
  Notif, ramp, Rings, Ripple, rnd, SearchBar, Select, SelFrame, Sweep, TileGlyph, Viewfinder, Vignette, Wd, World,
} from "../styles/story-montage";
import WORDS_RAW from "./words.json";

type Word = { si: number; wi: number; w: string; s: number; e: number };
const WORDS = WORDS_RAW as Word[];
const FPS = 30;
const fr = (s: number) => Math.round(s * FPS);
const clean = (w: string) => w.toLowerCase().replace(/[“”"",.!?:]/g, "");
/** start time of a word in sentence si: exact match first (after stripping punctuation), then substring. */
const T = (si: number, needle: string, nth = 0) => {
  const n = clean(needle);
  const exact = WORDS.filter((x) => x.si === si && clean(x.w) === n);
  const hits = exact.length > nth ? exact : WORDS.filter((x) => x.si === si && clean(x.w).includes(n));
  if (!hits[nth]) throw new Error(`no word ${needle} in ${si}`);
  return hits[nth].s;
};
const IMG = (n: string) => staticFile(`v09/img/${n}`);
export const V09_END = 31;
export const V09_FRAMES = fr(V09_END);

/** Inline sentence: each word rises in exactly when spoken. items: [text, time, style?]. */
type It = [string, number, React.CSSProperties?];
const Inline: React.FC<{ t: number; x: number; y: number; items: It[]; size: number; font?: string; weight?: number; color?: string; gap?: number; w?: number; align?: "left" | "center"; anim?: "rise" | "write" | "slam" }> = ({ t, x, y, items, size, font = F.ui, weight = 600, color = "#fff", gap = 0.28, w, align = "left", anim = "rise" }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, display: "flex", flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start", alignItems: "baseline", columnGap: size * gap, rowGap: size * 0.15, fontFamily: font, fontWeight: weight, fontSize: size, lineHeight: 1.1, color }}>
    {items.map(([txt, at, st], i) => {
      const p = clamp((t - at + 0.03) / 0.28);
      const e = easeOut(p);
      const s: React.CSSProperties = anim === "write"
        ? { clipPath: `inset(-30% ${(1 - e) * 100}% -30% -5%)` }
        : anim === "slam" ? { transform: `scale(${2 - e})`, opacity: clamp(p * 4), filter: `blur(${(1 - e) * 5}px)` }
          : { transform: `translateY(${(1 - e) * size * 0.5}px)`, opacity: e, filter: `blur(${(1 - e) * 7}px)` };
      return <span key={i} style={{ display: "inline-block", whiteSpace: "nowrap", visibility: p > 0 ? "visible" : "hidden", ...s, ...st }}>{txt}</span>;
    })}
  </div>
);

/* ═════════ 1 · blueprint table (0 → 2.9) ═════════ */
const S1: React.FC<{ t: number }> = ({ t }) => {
  const zoomOut = ramp(t, 2.72, 2.95, (k) => k * k); // punch into the lock screen
  return (
    <AbsoluteFill style={{ transform: `scale(${1 + zoomOut * 2.2})`, filter: `blur(${zoomOut * 10}px)`, opacity: 1 - ramp(t, 2.85, 2.97) }}>
      <World t={t} keys={[[0, 540, 880, 1.4, -4], [1.3, 540, 960, 1.06, 0], [1.38, 540, 990, 1.06, 0], [1.72, 540, 2180, 1.0, 0], [2.95, 540, 2260, 1.1, 0]]} h={3000} bg="#1e1e20" hand={3}>
        <BpDeco w={1080} h={3000} t={t} />
        <Img src={IMG("phone-top.png")} style={{ position: "absolute", left: 300, top: 640, width: 540, transform: `rotate(${-30 + t * 3}deg)`, filter: "drop-shadow(0 40px 50px rgba(0,0,0,.6))" }} />
        <GridBox x={120 + 240 * ramp(t, 0, 1.2, easeOut)} y={660 + 120 * ramp(t, 0, 1.2, easeOut)} w={300} h={300} rot={-30 + t * 3} o={0.85} />
        <Wd text="PEOPLE" t={t} at={T(0, "People")} x={150} y={600} size={46} weight={500} ls={0.06} />
        <Wd text="DON'T" t={t} at={T(0, "don't")} x={370} y={600} size={46} weight={500} ls={0.06} />
        <Wd text="BUY" t={t} at={T(0, "buy")} x={560} y={608} size={34} weight={400} color="#8f8f94" ls={0.1} anim="blur" />
        <Inline t={t} x={170} y={1250} size={124} font={F.bebas} weight={400} gap={0.22} anim="slam" items={[["YOUR", T(0, "your"), { letterSpacing: "0.08em", textShadow: "0 0 30px rgba(255,255,255,.25)" }], ["PRODUCT", T(0, "product"), { letterSpacing: "0.08em", textShadow: "0 0 30px rgba(255,255,255,.25)" }]]} />
        <div style={{ position: "absolute", left: 990, top: 820, transform: "rotate(90deg)", transformOrigin: "0 0", fontFamily: F.ui, fontWeight: 700, fontSize: 22, color: "rgba(255,255,255,.6)", letterSpacing: 4 }}>456 JK / 789 O</div>
        {/* part 2 (camera pans down) */}
        <Img src={IMG("phone-top.png")} style={{ position: "absolute", left: -180, top: 1960, width: 760, filter: "drop-shadow(0 40px 50px rgba(0,0,0,.6))" }} />
        <GridBox x={560} y={2330} w={200} h={440} cell={50} o={ramp(t, 1.6, 1.9)} />
        <Callout pts={[[250, 2080], [250, 1990], [340, 1930], [980, 1930]]} p={ramp(t, T(1, "They"), T(1, "They") + 0.45, easeOut)} />
        <Wd text="THEY" t={t} at={T(1, "They")} x={360} y={1872} size={40} weight={500} ls={0.05} />
        <Wd text="BUY" t={t} at={T(1, "buy")} x={500} y={1872} size={40} weight={500} ls={0.05} />
        <Wd text="THE" t={t} at={T(1, "the")} x={615} y={1880} size={30} weight={400} color="#a9a9ae" ls={0.05} />
        <Wd text="REASON" t={t} at={T(1, "reason")} x={700} y={1872} size={40} weight={700} ls={0.05} anim="blur" />
        <Callout pts={[[700, 2380], [620, 2520], [300, 2520]]} p={ramp(t, T(1, "you"), T(1, "you") + 0.4, easeOut)} />
        <Wd text="YOU" t={t} at={T(1, "you")} x={300} y={2462} size={44} weight={500} ls={0.05} />
        <Wd text="BUILT" t={t} at={T(1, "built")} x={410} y={2462} size={44} weight={700} ls={0.05} />
        <Wd text="IT" t={t} at={T(1, "it.")} x={560} y={2478} size={30} weight={500} ls={0.05} />
        <div style={{ position: "absolute", left: 990, top: 2120, transform: "rotate(90deg)", transformOrigin: "0 0", fontFamily: F.ui, fontWeight: 700, fontSize: 22, color: "rgba(255,255,255,.6)", letterSpacing: 4 }}>REF 09 / 1080 × 1920</div>
      </World>
    </AbsoluteFill>
  );
};

/* ═════════ 2 · lock screen → notification → circuit card (2.9 → 7.45) ═════════ */
const S2: React.FC<{ t: number }> = ({ t }) => {
  const nIn = ramp(t, 2.96, 3.25, easeOut);
  const expand = ramp(t, 5.05, 5.5, easeOut);
  const cardH = 200 + expand * 860;
  const into = ramp(t, 7.1, 7.45, (k) => k * k * k);
  const q1 = T(2, "I"), sell = T(2, "sell"), phones = T(2, "phones"), is = T(2, "is"), boring = T(2, "boring");
  return (
    <AbsoluteFill style={{ opacity: ramp(t, 2.9, 3.0) }}>
      <World t={t} keys={[[2.9, 380, 520, 1.45, -3], [3.5, 540, 820, 1.08, 0], [4.9, 540, 860, 1.12, 0], [5.25, 540, 1020, 1.08, 0], [7.05, 540, 1060, 1.14, 0], [7.45, 540, 1200, 5.5, 0]]} bg="#2a0b4a" hand={3}>
        <Img src={IMG("lock-wallpaper.jpg")} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, objectFit: "cover", transform: `scale(${1.05 + 0.03 * Math.sin(t)})` }} />
        <LockTop t={t} />
        <Notif x={60} y={760} w={960} a={nIn} body={
          <span>
            {t >= 2.96 && "Because "}
            {t >= q1 && <span style={{ fontStyle: "italic" }}>“I{t >= sell && " sell"}{t >= phones && " phones”"}</span>}
            {t >= is && " is"}{t >= boring && " boring…"}
            {t >= 4.85 && <span style={{ display: "inline-block", marginLeft: 8, transform: `scale(${easeBack(ramp(t, 4.85, 5.05))})` }}>😒</span>}
          </span>
        } style={{ height: cardH, overflow: "hidden", borderRadius: 44 + expand * 10 }}>
          {expand > 0 && (
            <div style={{ position: "absolute", left: 30, right: 30, top: 170, height: 840, borderRadius: 34, background: "#050505", overflow: "hidden", opacity: expand }}>
              <div style={{ position: "absolute", left: 0, top: 100, transform: "scale(1)" }}><CircuitFigure p={ramp(t, 5.2, 6.9)} t={t} /></div>
              <Wd text="But" t={t} at={T(2, "but")} x={860} y={40} size={120} weight={800} anchor="right" anim="slam" />
              <Inline t={t} x={40} y={700} size={40} weight={500} color="#ddd" items={[["“I", T(2, "I", 1), { fontStyle: "italic" }], ["challenge", T(2, "challenge"), { fontStyle: "italic" }], ["the", T(2, "the"), { fontStyle: "italic" }], ["system”", T(2, "system"), { fontStyle: "italic", color: "#fff", fontWeight: 700 }]]} />
              <Inline t={t} x={40} y={765} size={46} weight={700} items={[["is", T(2, "is", 1)], ["a", T(2, "a")], ["movement.", T(2, "movement"), { textShadow: "0 0 24px rgba(255,255,255,.7)" }]]} />
            </div>
          )}
        </Notif>
        <Ripple x={560} y={850} t={t} at={4.98} />
      </World>
      <AbsoluteFill style={{ background: "#000", opacity: into }} />
    </AbsoluteFill>
  );
};

/* ═════════ 3 · "That's why Apple never says," (7.4 → 8.72) ═════════ */
const S3: React.FC<{ t: number }> = ({ t }) => {
  const ap = T(3, "Apple");
  return (
    <World t={t} keys={[[7.4, 540, 960, 1.12, 0], [8.72, 880, 960, 1.0, 0]]} w={2000} bg="#000" hand={2}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 2400, height: 1920, background: "radial-gradient(ellipse at 45% 55%, #1b1b1f, #000 60%)" }} />
      <Inline t={t} x={140} y={850} size={88} weight={600} color="#c9c9ce" gap={0.26} items={[["That's", T(3, "That's")], ["why", T(3, "why")], ["Apple", ap, { color: "#fff", fontWeight: 800, textShadow: "0 0 30px rgba(255,255,255,.5)" }], ["never", T(3, "never"), { color: "#fff" }], ["says", T(3, "says"), { color: "#fff" }]]} />
      <div style={{ position: "absolute", left: 620, top: 1040, transform: `translateY(${(1 - easeOut(ramp(t, ap, ap + 0.4))) * 200}px) rotate(${-8 + t * 4}deg)`, opacity: ramp(t, ap, ap + 0.3) }}>
        <Apple s={300} glow={30 + Math.sin(t * 8) * 8} />
      </div>
    </World>
  );
};

/* ═════════ 4 · "We sell iPhones." hand + floating phone (8.72 → 9.78) ═════════ */
const S4: React.FC<{ t: number }> = ({ t }) => {
  const we = T(3, "We"), ip = T(3, "iPhones");
  const drop = ramp(t, 8.7, 9.2, easeOut);
  const reach = ramp(t, 8.85, 9.35, easeOut);
  const neon = ramp(t, ip, ip + 0.25);
  const flick = neon > 0 && neon < 1 ? (Math.floor(t * 40) % 2 ? 1 : 0.35) : neon;
  return (
    <World t={t} keys={[[8.72, 540, 960, 1.12, 0], [9.78, 540, 940, 1.0, 0]]} bg="#000" hand={3}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 40%, #1a1a1d, #000 65%)" }} />
      <div style={{ position: "absolute", left: 0, width: 1080, top: 950, textAlign: "center", fontFamily: F.ui, fontWeight: 800, fontSize: 250, letterSpacing: -6, color: "transparent", WebkitTextStroke: "4px rgba(255,255,255,.95)", opacity: flick, textShadow: "0 0 40px rgba(255,255,255,.45)" }}>iPhones</div>
      <Img src={IMG("phone-float.png")} style={{ position: "absolute", left: 360, top: -560 + drop * 780, width: 360, transform: `rotate(${20 - drop * 8 + Math.sin(t * 2) * 3}deg)`, filter: "drop-shadow(0 30px 40px rgba(0,0,0,.8))" }} />
      <Img src={IMG("hand.png")} style={{ position: "absolute", left: 250, top: 1980 - reach * 820, width: 560 }} />
      <Wd text="We" t={t} at={we} x={120} y={930} size={84} weight={700} anim="pop" />
      <Wd text="sell" t={t} at={T(3, "sell")} x={960} y={930} size={84} weight={700} anchor="right" anim="pop" />
      <div style={{ position: "absolute", left: 930, top: 1150, opacity: ramp(t, ip, ip + 0.2) }}><Apple s={180} glow={40} /></div>
      <Sweep p={ramp(t, 9.3, 9.75)} w={220} o={0.35} />
    </World>
  );
};

/* ═════════ 5 · sky "Think different," (9.78 → 11.28) ═════════ */
const S5: React.FC<{ t: number }> = ({ t }) => {
  const th = T(4, "Think"), df = T(4, "different");
  const ext = (c: string) => Array.from({ length: 8 }, (_, i) => `${i + 1}px ${i + 1}px 0 ${c}`).join(",") + ", 14px 18px 30px rgba(0,40,120,.35)";
  return (
    <World t={t} keys={[[9.78, 540, 1700, 1.15, 0], [10.05, 540, 1020, 1.05, 0], [11.28, 540, 930, 1.12, 0]]} bg="#2f7df6" hand={2}>
      <Img src={IMG("sky.jpg")} style={{ position: "absolute", left: -60, top: -60, width: 1200, height: 2140, objectFit: "cover", transform: `translateY(${-t * 8}px)` }} />
      <Inline t={t} x={140} y={760} size={62} weight={600} font={F.round} items={[["They", T(4, "They")], ["say:", T(4, "say")]]} />
      <Wd text="Think" t={t} at={th} x={130} y={860} size={170} font={F.round} weight={700} anim="drop" glow={ext("#9cc3ff")} />
      <Wd text="Different." t={t} at={df} x={130} y={1040} size={190} font={F.round} weight={700} anim="drop" glow={ext("#9cc3ff")} />
      <div style={{ position: "absolute", left: 790, top: 640, transform: `scale(${easeBack(ramp(t, df, df + 0.35))}) translateY(${Math.sin(t * 3) * 8}px)`, transformOrigin: "20% 100%" }}>
        <svg width="220" height="170" viewBox="0 0 220 170"><g fill="#fff" filter="drop-shadow(0 8px 12px rgba(0,40,120,.3))"><circle cx="70" cy="80" r="50" /><circle cx="120" cy="60" r="55" /><circle cx="165" cy="90" r="42" /><circle cx="110" cy="105" r="48" /><circle cx="30" cy="150" r="14" /><circle cx="10" cy="168" r="7" /></g></svg>
        <div style={{ position: "absolute", left: 70, top: 30, fontSize: 80, fontFamily: "Segoe UI Emoji" }}>🧠</div>
      </div>
    </World>
  );
};

/* ═════════ 6 · viewfinder "and suddenly it's not a phone," (11.28 → 13.15) ═════════ */
const S6: React.FC<{ t: number }> = ({ t }) => {
  const shut = ramp(t, 11.28, 11.42);
  const focus = 1 - ramp(t, 11.3, 11.7, easeOut);
  const ph = T(4, "phone");
  return (
    <AbsoluteFill>
      <World t={t} keys={[[11.28, 540, 960, 1.18, 0], [13.15, 540, 960, 1.04, 0]]} bg="#141416" hand={7}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 45%, #333336, #0e0e10 70%)" }} />
        <Img src={IMG("phone-float.png")} style={{ position: "absolute", left: 540, top: 470, width: 340, transform: `rotate(${12 + Math.sin(t * 1.4) * 4}deg)`, filter: `blur(${focus * 12}px) drop-shadow(0 30px 40px rgba(0,0,0,.6))` }} />
        <Img src={IMG("phone-float.png")} style={{ position: "absolute", left: 210, top: 1350, width: 200, opacity: 0.35, transform: `rotate(${-24 + Math.sin(t) * 3}deg)`, filter: "blur(6px)" }} />
        <Inline t={t} x={140} y={1110} size={64} weight={500} items={[["And", T(4, "and")], ["suddenly…", T(4, "suddenly"), { color: "#a5a5aa" }]]} />
        <Inline t={t} x={200} y={1210} size={88} weight={600} items={[["it's", T(4, "it's")], ["not", T(4, "not"), { fontWeight: 800 }], ["a", T(4, "a")], ["phone.", ph, { fontWeight: 800 }]]} />
        <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0 }}>
          <path d="M470 1320 C 600 1310, 760 1318, 900 1306" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" {...draw(ramp(t, ph + 0.1, ph + 0.4, easeOut))} />
          <path d="M340 1312 C 380 1308, 420 1314, 450 1310" fill="none" stroke="#ff3b3b" strokeWidth="6" strokeLinecap="round" {...draw(ramp(t, T(4, "not") + 0.1, T(4, "not") + 0.3, easeOut))} />
        </svg>
      </World>
      <Viewfinder t={t} />
      <AbsoluteFill style={{ background: "#fff", opacity: 1 - shut }} />
    </AbsoluteFill>
  );
};

/* ═════════ 7 · identity rings (13.15 → 14.32) ═════════ */
const S7: React.FC<{ t: number }> = ({ t }) => {
  const id = T(4, "identity");
  const a = ramp(t, 13.15, 13.4);
  return (
    <World t={t} keys={[[13.15, 540, 960, 1.35, 0], [14.32, 540, 960, 1.05, 0]]} bg="#0c0c0e" hand={2}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, #2a2a2e, #09090b 60%)" }} />
      <div style={{ position: "absolute", left: 540, top: 960 }}><Rings t={t} a={a} /></div>
      <div style={{ position: "absolute", left: 540 - 110, top: 960 - 120, transform: `scale(${0.8 + 0.2 * easeBack(ramp(t, 13.2, 13.6))})` }}><Apple s={220} glow={25 + Math.sin(t * 6) * 10} /></div>
      {[[180, 520, 150, 0.2], [860, 1480, 220, 0.8], [900, 430, 90, 1.4], [150, 1500, 110, 2]].map(([x, y, s, ph], i) => (
        <Img key={i} src={IMG("cube.png")} style={{ position: "absolute", left: x - s / 2, top: y - s / 2 + Math.sin(t * 1.3 + ph) * 20, width: s, transform: `rotate(${t * (12 + i * 5) + ph * 40}deg)`, filter: `blur(${i % 2 ? 4 : 0}px) brightness(.8)`, opacity: a }} />
      ))}
      <Wd text="IT'S AN" t={t} at={T(4, "it's", 1)} x={540} y={600} size={78} font={F.poster} anchor="center" anim="track" ls={0.35} />
      <Wd text="IDENTITY" t={t} at={id} x={540} y={1270} size={130} font={F.poster} anchor="center" anim="track" ls={0.28} glow="0 0 40px rgba(255,255,255,.35)" />
    </World>
  );
};

/* ═════════ 8 · chalkboard (14.32 → 18.22) ═════════ */
const S8: React.FC<{ t: number }> = ({ t }) => {
  const h1 = T(5, "Here's");
  const chalkStyle: React.CSSProperties = { filter: "url(#chalky)", color: "#eef3ea" };
  return (
    <World t={t} keys={[[14.32, 380, 700, 1.55, -2], [15.0, 470, 740, 1.42, 0], [16.2, 540, 840, 1.2, 0], [17.4, 540, 900, 1.12, 0], [18.22, 570, 950, 1.2, 1]]} bg="#161412" hand={3}>
      <Img src={IMG("chalkboard.jpg")} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, objectFit: "cover" }} />
      <div style={{ ...chalkStyle }}>
        <Wd text="HERE'S THE TRUTH:" t={t} at={h1} x={140} y={520} size={92} font={F.chalk} weight={700} color="#eef3ea" anim="write" dur={0.62} />
        <Inline t={t} x={140} y={690} size={60} font={F.hand} weight={400} color="#eef3ea" anim="write" items={[["People", T(6, "People")], ["don't", T(6, "don't")], ["want", T(6, "want")], ["features.", T(6, "features")]]} />
        <Inline t={t} x={140} y={800} w={720} size={60} font={F.hand} weight={400} color="#eef3ea" anim="write" items={[["They", T(7, "They")], ["want", T(7, "want")], ["to", T(7, "to")], ["feel", T(7, "feel")], ["like", T(7, "like")], ["they're", T(7, "they're")], ["part", T(7, "part")], ["of", T(7, "of")], ["something.", T(7, "something")]]} />
        <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0 }}>
          <g fill="none" stroke="#eef3ea" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M400 976 C 520 970, 640 980, 760 968" {...draw(ramp(t, T(7, "something") + 0.2, T(7, "something") + 0.5))} />
            {/* camera doodle (features) */}
            <g transform="translate(760 640)" opacity={1}>
              <path d="M0 20 H40 L52 4 H84 L96 20 H136 V100 H0 Z" {...draw(ramp(t, 15.3, 15.8))} />
              <circle cx="68" cy="60" r="26" {...draw(ramp(t, 15.5, 15.9))} />
              <circle cx="116" cy="36" r="6" {...draw(ramp(t, 15.8, 15.95))} />
            </g>
            {/* bar chart */}
            <g transform="translate(160 1180)">
              <path d="M0 0 V180 H240" {...draw(ramp(t, 15.8, 16.1))} />
              {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${30 + i * 44} 175 V${150 - i * 30}`} strokeWidth="18" {...draw(ramp(t, 16.0 + i * 0.08, 16.2 + i * 0.08))} />)}
              <path d="M20 120 L 80 90 L 130 100 L 220 20" {...draw(ramp(t, 16.4, 16.8))} />
              <path d="M200 18 L 222 18 L 222 40" {...draw(ramp(t, 16.8, 16.95))} />
            </g>
            {/* isometric box (part of something) */}
            <g transform="translate(640 1110)">
              <path d="M0 60 L 110 0 L 230 60 L 120 120 Z" {...draw(ramp(t, 17.2, 17.55))} />
              <path d="M0 60 V200 L 120 260 V120 M120 260 L 230 200 V60" {...draw(ramp(t, 17.4, 17.8))} />
              <path d="M150 40 L 180 -10 M200 50 L 250 20 M60 30 L 30 -20" {...draw(ramp(t, 17.7, 18.0))} />
            </g>
          </g>
        </svg>
      </div>
      <ChalkDust x={140} y={520} t={t} at={h1} dur={0.62} w={720} />
      <ChalkDust x={140} y={800} t={t} at={T(7, "They")} dur={1.4} w={700} />
    </World>
  );
};

/* ═════════ 9 · spotlight poster (18.22 → 19.74) ═════════ */
const S9: React.FC<{ t: number }> = ({ t }) => {
  const on = ramp(t, 18.22, 18.3);
  const flick = t < 18.36 ? (Math.floor(t * 50) % 2 ? 1 : 0.2) : 1;
  const words: [string, string, number, number, number][] = [
    ["THEY", "They", 320, 470, 96], ["DON'T", "don't", 300, 560, 200], ["BUY", "buy", 320, 770, 150], ["WHAT", "what", 300, 920, 175], ["YOU", "you", 320, 1100, 150], ["DO", "do.", 520, 1250, 260],
  ];
  const hits = words.map(([, n]) => T(8, n));
  const punchK = hits.reduce((m, h) => (t >= h && t < h + 0.18 ? Math.max(m, 1 - (t - h) / 0.18) : m), 0);
  const slide = ramp(t, 18.22, 18.5, easeOut);
  return (
    <AbsoluteFill style={{ transform: `scale(${1 + punchK * 0.025})` }}>
      <World t={t} keys={[[18.22, 540, 800, 1.18, 0], [19.74, 540, 1040, 1.08, 0]]} bg="#05090f" hand={3}>
        <Img src={IMG("spotlight-wall.jpg")} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, objectFit: "cover", opacity: on * flick }} />
        <div style={{ position: "absolute", left: -400 + slide * 1700, top: 900, width: 360, height: 220, background: "#e8e8e4", boxShadow: "0 10px 30px rgba(0,0,0,.5)", transform: "rotate(-4deg)", filter: `blur(${(1 - slide) * 6}px)`, opacity: 1 - slide }} />
        {words.map(([txt, n, x, y, s], i) => (
          <Wd key={i} text={txt} t={t} at={T(8, n)} x={x} y={y} size={s} font={F.poster} color="#c8d6e6" anim="slam" dur={0.18} style={{ mixBlendMode: "screen", textShadow: "0 0 20px rgba(160,200,255,.25)" }} />
        ))}
        <Dust t={t} n={50} x={300} w={480} y={0} h={1500} o={0.5 * on} />
      </World>
    </AbsoluteFill>
  );
};

/* ═════════ 10 · newspaper spin (19.74 → 21.24) ═════════ */
const S10: React.FC<{ t: number }> = ({ t }) => {
  const sp = ramp(t, 19.72, 20.25, easeOut);
  const ink: React.CSSProperties = { color: "#1f1a12", mixBlendMode: "multiply", opacity: 0.92 };
  return (
    <AbsoluteFill style={{ background: "#120c07" }}>
      <AbsoluteFill style={{ transform: `rotate(${(1 - sp) * 900}deg) scale(${0.08 + 0.92 * sp})` }}>
        <World t={t} keys={[[20.2, 540, 900, 1.05, 0], [21.24, 540, 660, 1.32, -1.5]]} bg="#120c07" hand={2} blur={false}>
          <Img src={IMG("newspaper.jpg")} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, objectFit: "cover" }} />
          <div style={{ position: "absolute", left: 0, width: 1080, top: 150, textAlign: "center", fontFamily: F.black, fontSize: 118, ...ink }}>The Daily Story</div>
          <div style={{ position: "absolute", left: 150, right: 150, top: 290, borderTop: "3px solid #2a2418", borderBottom: "1.5px solid #2a2418", padding: "6px 0", display: "flex", justifyContent: "space-between", fontFamily: F.news, fontWeight: 500, fontSize: 22, letterSpacing: 2, ...ink }}>
            <span>VOL. 09</span><span>SPECIAL EDITION</span><span>ONE COIN</span>
          </div>
          <Inline t={t} x={150} y={345} w={800} size={112} font={F.news} weight={700} gap={0.22} items={[["THEY", T(9, "They")], ["BUY", T(9, "buy")], ["THE", T(9, "the")], ["STORY", T(9, "story")], ["BEHIND", T(9, "behind")], ["IT", T(9, "it")]]} anim="slam" color="#1f1a12" />
        </World>
      </AbsoluteFill>
      <Vignette o={0.6} />
    </AbsoluteFill>
  );
};

/* ═════════ 11 · studio: folder + tiles + drag-in + search (21.24 → 25.58) ═════════ */
const TILES: { x: number; y: number; s: number; g: TileGlyph; hue: [string, string]; blur: number; ph: number }[] = [
  { x: 190, y: 360, s: 92, g: "layers", hue: ["#7b6bff", "#2c1fa8"], blur: 2, ph: 0 },
  { x: 880, y: 300, s: 84, g: "pen", hue: ["#4d7dff", "#18318f"], blur: 2, ph: 1 },
  { x: 150, y: 1170, s: 132, g: "keyframe", hue: ["#6b4dff", "#23128f"], blur: 0, ph: 2 },
  { x: 900, y: 840, s: 140, g: "play", hue: ["#3f8cff", "#123a9a"], blur: 0, ph: 3 },
  { x: 950, y: 1540, s: 96, g: "wave", hue: ["#8a5cff", "#35168f"], blur: 2, ph: 4 },
  { x: 40, y: 1700, s: 250, g: "aep", hue: ["#5b45ff", "#1c128a"], blur: 7, ph: 5 },
  { x: 1010, y: 170, s: 210, g: "keyframe", hue: ["#4d7dff", "#18318f"], blur: 7, ph: 6 },
];
const Arrow: React.FC<{ x: number; y: number; press?: number }> = ({ x, y, press = 0 }) => (
  <svg width="64" height="76" viewBox="0 0 28 32" style={{ position: "absolute", left: x, top: y, transform: `scale(${1 - press * 0.15})`, transformOrigin: "0 0", filter: "drop-shadow(0 8px 10px rgba(0,0,0,.3))" }}>
    <path d="M2 2 L2 25 L8 19.5 L12.5 29 L16.5 27.2 L12 18 L20 18 Z" fill="#111" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);
const S11: React.FC<{ t: number }> = ({ t }) => {
  const land = ramp(t, 21.24, 21.95, easeOut);
  const sb = T(10, "on");
  const url = "earnedits.com";
  const typedN = Math.round(clamp((t - T(10, "earnedits")) / 0.8) * url.length);
  const ae = T(10, "After"), pf = T(10, "project");
  // drag: cursor brings a project tile from bottom-right, drops it into the folder on «file»
  const drag = ramp(t, 22.35, T(10, "file"), easeOut);
  const dropIn = ramp(t, T(10, "file"), T(10, "file") + 0.3, (k) => k * k);
  const bounce = t > T(10, "file") + 0.2 && t < T(10, "file") + 0.6 ? Math.sin(((t - T(10, "file") - 0.2) / 0.4) * Math.PI) * 0.035 : 0;
  const dx = 900 + (540 - 900) * drag, dy = 1600 + (820 - 1600) * drag;
  const chip = ramp(t, ae - 0.05, ae + 0.25) * (1 - ramp(t, sb - 0.1, sb + 0.1));
  return (
    <World t={t} keys={[[21.24, 540, 980, 1.25, -3], [22.2, 540, 960, 1.04, 0], [24.1, 540, 960, 1.08, 1], [24.5, 540, 1000, 1.22, 0], [25.58, 540, 1000, 1.3, 0]]} bg="#c4c8d0" hand={3}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #f1f2f6 0%, #dde0e7 55%, #c3c8d2 100%)" }} />
      <div style={{ position: "absolute", left: -200, top: 1330, width: 1480, height: 700, background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,.55), transparent 60%)" }} />
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: rnd(i) * 1080 - 60, top: rnd(i + 20) * 1920 - 60 + Math.sin(t * 0.6 + i) * 30, width: 120 + rnd(i + 4) * 160, height: 120 + rnd(i + 4) * 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,.7), rgba(255,255,255,0) 65%)", filter: "blur(6px)", opacity: 0.6 }} />
      ))}
      <div style={{ position: "absolute", left: 540 - 330 * land, top: 1545, width: 660 * land, height: 90, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(30,30,60,.35), transparent 70%)", filter: "blur(8px)" }} />
      {TILES.map((tl, i) => (
        <div key={i} style={{ position: "absolute", left: tl.x - tl.s / 2, top: tl.y + Math.sin(t * 1.1 + tl.ph) * 16, transform: `rotate(${Math.sin(t * 0.7 + tl.ph) * 10 + (i % 2 ? 10 : -10)}deg) scale(${easeBack(ramp(t, 21.3 + i * 0.06, 21.65 + i * 0.06))})`, filter: tl.blur ? `blur(${tl.blur}px)` : undefined, opacity: tl.blur > 4 ? 0.85 : 1 }}>
          <AppTile s={tl.s} glyph={tl.g} hue={tl.hue} />
        </div>
      ))}
      {/* folder */}
      <div style={{ position: "absolute", left: 540 - 300, top: 690, width: 600, transform: `translate(${(1 - land) * -700}px, ${(1 - land) * 900}px) rotate(${(1 - land) * -50 - 3 + Math.sin(t * 1.5) * 1.2}deg) scale(${(0.6 + 0.4 * land) * (1 + bounce)})`, filter: "drop-shadow(0 50px 45px rgba(20,20,50,.35))" }}>
        <div style={{ position: "absolute", left: 360, top: -40 - ramp(t, T(10, "file") + 0.1, T(10, "file") + 0.5, easeOut) * 60, width: 170, height: 230, background: "linear-gradient(180deg,#fff,#eceae4)", borderRadius: 6, transform: "rotate(6deg)", boxShadow: "0 6px 14px rgba(0,0,0,.15)" }} />
        <Img src={IMG("folder.png")} style={{ position: "relative", width: 600 }} />
        <div style={{ position: "absolute", left: 90, top: 330, fontFamily: F.serif, fontSize: 64, color: "#e8dcb8", opacity: ramp(t, T(10, "Just"), T(10, "Just") + 0.25), textShadow: "0 2px 0 rgba(0,0,0,.35)" }}>Just for</div>
        <div style={{ position: "absolute", left: 80, top: 410, fontFamily: F.serif, fontSize: 108, color: "#f1e6c6", opacity: ramp(t, T(10, "editors"), T(10, "editors") + 0.25), transform: `scale(${0.9 + 0.1 * easeBack(ramp(t, T(10, "editors"), T(10, "editors") + 0.3))})`, transformOrigin: "0 50%", textShadow: "0 3px 0 rgba(0,0,0,.35)" }}>Editors</div>
        <div style={{ position: "absolute", left: 80, top: 560, width: 300 * ramp(t, T(10, "editors") + 0.1, T(10, "editors") + 0.5, easeOut), height: 3, background: "#d8c894", opacity: 0.8 }} />
        <Sweep p={ramp(t, 22.25, 22.85)} w={140} o={0.4} />
      </div>
      <div style={{ opacity: 1 - ramp(t, sb - 0.2, sb + 0.05) }}><SelFrame x={222} y={672} w={640} h={915} p={ramp(t, 21.95, 22.35)} label="600 × 900 · Editors.aep" /></div>
      {/* the project tile being dragged in */}
      {t >= 22.3 && dropIn < 1 && (
        <div style={{ position: "absolute", left: dx - 75, top: dy - 75, transform: `scale(${1 - dropIn * 0.8}) rotate(${(1 - drag) * 14}deg)`, opacity: 1 - dropIn * 0.6 }}>
          <AppTile s={150} glyph="aep" />
        </div>
      )}
      {t >= 22.3 && t < T(10, "file") + 0.5 && <Arrow x={dx + 40} y={dy + 40} press={drag > 0.98 ? 1 : 0} />}
      {/* «After Effects · project file» chip, above the folder */}
      <div style={{ position: "absolute", left: 540, top: 520, transform: `translateX(-50%) translateY(${(1 - easeOut(chip)) * 30}px)`, opacity: chip, display: "flex", alignItems: "center", gap: 14, padding: "14px 30px", borderRadius: 999, background: "rgba(255,255,255,.85)", boxShadow: "0 16px 40px rgba(30,20,90,.18)", fontFamily: F.ui, fontWeight: 600, fontSize: 34, color: "#24185f", whiteSpace: "nowrap" }}>
        <AppTile s={46} glyph="keyframe" />
        <span>After Effects</span><span style={{ opacity: 0.4 }}>·</span><span style={{ fontWeight: 400, opacity: t >= pf ? 1 : 0.2 }}>project file</span>
      </div>
      <SearchBar x={120} y={1000} w={840} a={ramp(t, sb, sb + 0.25)} text={url.slice(0, typedN)} t={t} />
      {t > T(10, "earnedits") + 0.85 && <Arrow x={860} y={1070} press={ramp(t, 25.3, 25.35) - ramp(t, 25.4, 25.5)} />}
    </World>
  );
};

/* ═════════ 12 · comment "link" + rocket (25.58 → 27.1) ═════════ */
const S12: React.FC<{ t: number }> = ({ t }) => {
  const cm = T(10, "comment"), lk = T(10, "link");
  const rk = ramp(t, 25.6, 26.4, (k) => k * k);
  const rx = -200 + rk * 1500, ry = 1700 - rk * 1900;
  return (
    <World t={t} keys={[[25.58, 540, 960, 1.2, 0], [27.1, 540, 980, 1.05, 0]]} bg="#fff" hand={2}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #ffffff 0%, #e9f0ff 55%, #cfdcff 100%)" }} />
      {Array.from({ length: 16 }, (_, i) => {
        const k = rk - i * 0.04;
        if (k <= 0 || k > 1) return null;
        return <div key={i} style={{ position: "absolute", left: -200 + k * 1500 - 20, top: 1700 - k * 1900 + 120, width: 60 + i * 6, height: 60 + i * 6, borderRadius: "50%", background: "rgba(255,255,255,.9)", boxShadow: "0 0 30px rgba(180,200,255,.8)", opacity: (1 - i / 16) * 0.8 }} />;
      })}
      <Img src={IMG("rocket.png")} style={{ position: "absolute", left: rx, top: ry, width: 300, transform: "rotate(10deg)" }} />
      <div style={{ position: "absolute", left: 610, top: 700, transform: `scale(${easeBack(ramp(t, cm, cm + 0.35))}) rotate(-8deg)` }}><FileIcon s={120} /></div>
      <Wd text="Comment" t={t} at={cm} x={540} y={850} size={104} weight={600} color="#111" anchor="center" anim="pop" />
      <div style={{ position: "absolute", left: 390, top: 1010, width: 300, height: 110 }}>
        <Select x={0} y={0} w={300} h={110} p={ramp(t, lk, lk + 0.3)} />
      </div>
      <Wd text="“Link”" t={t} at={lk} x={540} y={1025} size={92} weight={700} color="#1a3cff" anchor="center" anim="pop" italic />
      <Inline t={t} x={0} w={1080} y={1175} size={54} weight={500} color="#333" align="center" items={[["and", T(10, "and")], ["we'll", T(10, "we'll")], ["send", T(10, "send")], ["it.", T(10, "it.")]]} />
    </World>
  );
};

/* ═════════ 13 · outro «made with NFP» (27.1 → 31) ═════════ */
const RECAP = ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "r9", "r10", "r11", "r12"];
export const V09_RECAP: Record<string, number> = { r1: 40, r2: 80, r3: 115, r4: 190, r5: 250, r6: 280, r7: 310, r8: 360, r9: 410, r10: 505, r11: 580, r12: 690 };
const S13: React.FC<{ t: number }> = ({ t }) => {
  const k0 = 27.1, burst = 27.95;
  const conv = ramp(t, k0, burst, (k) => k * k);
  const flash = t >= burst ? 1 - ramp(t, burst, burst + 0.35) : 0;
  const letters = ["N", "F", "P"];
  const shake = t > burst && t < burst + 0.3 ? (1 - (t - burst) / 0.3) * 14 : 0;
  return (
    <AbsoluteFill style={{ background: "#050507", transform: `translate(${Math.sin(t * 90) * shake}px, ${Math.cos(t * 80) * shake}px)` }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(59,108,255,.25), transparent 55%)", opacity: ramp(t, burst, burst + 0.5) }} />
      {/* all worlds collapse into one point */}
      {t < burst + 0.05 && RECAP.map((r, i) => {
        const ang = (i / RECAP.length) * Math.PI * 2 + t * 0.8;
        const d = (1 - conv) * (620 + (i % 3) * 180);
        const s = 0.36 * (1 - conv * 0.85);
        return (
          <div key={r} style={{ position: "absolute", left: 540 + Math.cos(ang) * d - 540 * s, top: 960 + Math.sin(ang) * d * 1.3 - 960 * s, width: 1080 * s, height: 1920 * s, borderRadius: 28, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.6)", border: "2px solid rgba(255,255,255,.25)", transform: `perspective(1400px) rotateY(${Math.cos(ang) * 40}deg) rotateX(${Math.sin(ang) * 25}deg) rotate(${(1 - conv) * (i % 2 ? 14 : -14)}deg)`, opacity: ramp(t, k0 + i * 0.03, k0 + 0.15 + i * 0.03) }}>
            <Img src={staticFile(`v09/recap/${r}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        );
      })}
      {/* shockwave + particles */}
      {t >= burst && (
        <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0 }}>
          {[0, 1, 2].map((i) => {
            const p = clamp((t - burst - i * 0.08) / 0.9);
            return <circle key={i} cx="540" cy="960" r={40 + easeOut(p) * 900} fill="none" stroke="#9db6ff" strokeWidth={6 * (1 - p)} opacity={1 - p} />;
          })}
          {Array.from({ length: 60 }, (_, i) => {
            const p = clamp((t - burst) / 1.6);
            const an = rnd(i) * Math.PI * 2, sp = 300 + rnd(i + 9) * 700;
            return <circle key={i} cx={540 + Math.cos(an) * sp * easeOut(p)} cy={960 + Math.sin(an) * sp * easeOut(p)} r={2 + rnd(i + 3) * 3} fill={i % 3 ? "#fff" : "#8fb0ff"} opacity={(1 - p) * 0.9} />;
          })}
        </svg>
      )}
      {/* rotating thin rings behind the logo */}
      <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0, opacity: ramp(t, burst + 0.2, burst + 0.8) * 0.6 }}>
        {[260, 330, 410].map((r, i) => <circle key={i} cx="540" cy="960" r={r} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="2" strokeDasharray={i === 1 ? "4 14" : "120 40"} transform={`rotate(${t * (i % 2 ? -20 : 14)} 540 960)`} />)}
      </svg>
      {/* 3D carousel of every world, orbiting behind the logo */}
      {t > burst + 0.3 && RECAP.map((r, i) => {
        const ang = (i / RECAP.length) * Math.PI * 2 + (t - burst) * 0.55;
        const depth = (Math.sin(ang) + 1) / 2;
        const s = 0.13 + depth * 0.09;
        const a = ramp(t, burst + 0.3 + i * 0.03, burst + 0.8 + i * 0.03) * (0.18 + 0.4 * depth);
        return (
          <div key={"c" + r} style={{ position: "absolute", left: 540 + Math.cos(ang) * 470 - 540 * s, top: 1180 + Math.sin(ang) * 170 - 960 * s, width: 1080 * s, height: 1920 * s, borderRadius: 16, overflow: "hidden", opacity: a, filter: `blur(${(1 - depth) * 3}px)`, transform: `perspective(1200px) rotateY(${-Math.cos(ang) * 55}deg)`, border: "1.5px solid rgba(255,255,255,.3)" }}>
            <Img src={staticFile(`v09/recap/${r}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 90, top: 700, width: 900, height: 620, background: "radial-gradient(ellipse at 50% 50%, rgba(5,5,7,.92) 30%, rgba(5,5,7,0) 70%)", opacity: ramp(t, burst + 0.3, burst + 0.8) }} />
      {/* MADE WITH */}
      <Wd text="MADE WITH" t={t} at={burst + 0.25} x={540} y={760} size={40} font={F.wide} anchor="center" anim="track" ls={0.5} color="#b9c7ff" />
      {/* NFP chrome letters */}
      <div style={{ position: "absolute", left: 0, width: 1080, top: 840, display: "flex", justifyContent: "center", gap: 10, transform: `scale(${1 + 0.035 * ramp(t, burst + 0.6, V09_END, (k) => k)})` }}>
        {letters.map((c, i) => {
          const p = ramp(t, burst + 0.05 + i * 0.09, burst + 0.45 + i * 0.09, easeOut);
          const jit = t < burst + 0.8 ? (1 - clamp((t - burst) / 0.8)) : 0;
          return (
            <div key={c} style={{ position: "relative", fontFamily: F.poster, fontSize: 300, lineHeight: 1, transform: `scale(${1.8 - 0.8 * p}) translateY(${(1 - p) * 40}px)`, opacity: clamp(p * 3), filter: `blur(${(1 - p) * 14}px)` }}>
              <span style={{ position: "absolute", left: -10 * jit, top: 0, color: "rgba(255,40,90,.8)", mixBlendMode: "screen" }}>{c}</span>
              <span style={{ position: "absolute", left: 10 * jit, top: 0, color: "rgba(40,160,255,.8)", mixBlendMode: "screen" }}>{c}</span>
              <span style={{ position: "relative", backgroundImage: "linear-gradient(180deg, #ffffff 0%, #d9e2ff 38%, #6f7ea8 52%, #ffffff 70%, #aebcf0 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 0 30px rgba(120,150,255,.55))" }}>{c}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 300, top: 840, width: 480, height: 320, overflow: "hidden", mixBlendMode: "overlay" }}><Sweep p={ramp(t, burst + 0.9, burst + 1.5)} w={120} o={0.9} /><Sweep p={ramp(t, burst + 2.2, burst + 2.8)} w={90} o={0.7} /></div>
      <div style={{ position: "absolute", left: 540 - 230 * ramp(t, burst + 0.6, burst + 1.0, easeOut), top: 1170, width: 460 * ramp(t, burst + 0.6, burst + 1.0, easeOut), height: 4, background: "linear-gradient(90deg, transparent, #9db6ff, transparent)" }} />
      <Wd text="any style · any voice · minutes" t={t} at={burst + 1.0} x={540} y={1210} size={34} weight={400} color="rgba(220,228,255,.75)" anchor="center" anim="rise" ls={0.08} />
      <Dust t={t} n={40} o={0.35} />
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
      <AbsoluteFill style={{ background: "#000", opacity: ramp(t, V09_END - 0.6, V09_END) }} />
    </AbsoluteFill>
  );
};

/* ═════════ edit ═════════ */
const SHOTS: { C: React.FC<{ t: number }>; from: number; to: number }[] = [
  { C: S1, from: 0, to: 2.97 },
  { C: S2, from: 2.9, to: 7.45 },
  { C: S3, from: 7.4, to: 8.72 },
  { C: S4, from: 8.72, to: 9.78 },
  { C: S5, from: 9.78, to: 11.28 },
  { C: S6, from: 11.28, to: 13.15 },
  { C: S7, from: 13.15, to: 14.32 },
  { C: S8, from: 14.32, to: 18.22 },
  { C: S9, from: 18.22, to: 19.74 },
  { C: S10, from: 19.72, to: 21.24 },
  { C: S11, from: 21.24, to: 25.58 },
  { C: S12, from: 25.58, to: 27.1 },
  { C: S13, from: 27.1, to: V09_END },
];

const K = (p: string) => `kenney/${p}.ogg`;
const CUES: [number, string, number][] = [
  [0.02, K("impact/impactSoft_medium_001"), 0.45],
  [1.36, "sfx-lib/sweep.wav", 0.35],
  [2.72, "sfx-lib/whoosh.wav", 0.5],
  [2.96, "sfx-lib/notif.wav", 0.55],
  [4.85, K("interface/drop_002"), 0.5],
  [4.98, K("ui/click2"), 0.7],
  [5.05, "sfx-lib/sweep.wav", 0.3],
  [5.4, "sfx-lib/node1.wav", 0.3], [5.75, "sfx-lib/node2.wav", 0.3], [6.1, "sfx-lib/node3.wav", 0.3],
  [7.12, "sfx-lib/whoosh.wav", 0.45],
  [T(3, "Apple"), "sfx-lib/chime.wav", 0.25],
  [8.72, "sfx-lib/whoosh.wav", 0.35],
  [T(3, "iPhones"), "v09/buzz.wav", 0.35],
  [9.76, "sfx-lib/sweep.wav", 0.4],
  [T(4, "Think"), K("impact/impactSoft_medium_004"), 0.45],
  [T(4, "different"), K("interface/drop_001"), 0.5],
  [11.28, K("ui/switch11"), 0.6], [11.3, "sfx-lib/blip.wav", 0.4],
  [T(4, "phone") + 0.1, "v09/scribble.wav", 0.6],
  [13.15, "sfx-lib/whoosh.wav", 0.35],
  [T(4, "identity"), K("impact/impactBell_heavy_004"), 0.35],
  [14.3, "sfx-lib/sweep.wav", 0.35],
  [T(5, "Here's"), "v09/chalk.wav", 0.16],
  [T(6, "People"), "v09/chalk.wav", 0.13],
  [T(7, "They"), "v09/chalk.wav", 0.13], [T(7, "part"), "v09/chalk-short.wav", 0.12],
  [18.22, "v09/clunk.wav", 0.6],
  ...(["They", "don't", "buy", "what", "you", "do."] as const).map((n): [number, string, number] => [T(8, n), K("impact/impactSoft_heavy_00" + (n.length % 5)), 0.35]),
  [19.72, "sfx-lib/whoosh.wav", 0.5], [20.2, K("impact/impactPlank_medium_001"), 0.5],
  [21.24, "sfx-lib/sweep.wav", 0.35], [21.9, K("impact/impactSoft_heavy_002"), 0.45],
  [T(10, "project"), K("interface/drop_003"), 0.5],
  ...Array.from({ length: 12 }, (_, i): [number, string, number] => [T(10, "earnedits") + i * 0.066, `kenney/keyboard/keypress-${String(1 + ((i * 7) % 32)).padStart(3, "0")}.wav`, 0.4]),
  [25.56, "sfx-lib/whoosh.wav", 0.4], [25.62, "sfx-lib/riser.wav", 0.25],
  [T(10, "link"), K("interface/switch_002"), 0.5],
  [27.1, "sfx-lib/riser.wav", 0.5],
  [27.95, "sfx-lib/boom.wav", 0.8], [27.95, K("impact/impactBell_heavy_000"), 0.5],
  [28.9, "sfx-lib/chime.wav", 0.35],
];

export const Video09: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const leak = [2.9, 9.78, 14.32, 21.24].reduce((m, c) => (t >= c - 0.05 && t < c + 0.35 ? Math.max(m, 1 - Math.abs(t - c - 0.1) / 0.3) : m), 0);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <BlurDefs />
      <ChalkDefs />
      {SHOTS.map(({ C, from, to }, i) => (t >= from && t < to ? <AbsoluteFill key={i} style={{ zIndex: i }}><C t={t} /></AbsoluteFill> : null))}
      <AbsoluteFill style={{ zIndex: 50, pointerEvents: "none" }}>
        <Leak k={leak} />
        <Vignette o={0.35} />
        <Grain f={frame} o={0.1} />
      </AbsoluteFill>
      <Audio src={staticFile("v09/voice-isolated.mp3")} volume={1.15} />
      <Audio src={staticFile("music/happy-beats-business-moves-vol-1-by-ende-dot-app.mp3")} volume={(fm) => interpolate(fm, [0, 8, fr(26.9), fr(27.3), fr(V09_END - 1), fr(V09_END)], [0, 0.13, 0.13, 0.32, 0.32, 0], { extrapolateRight: "clamp" })} />
      {CUES.map(([s, file, v], i) => (
        <Sequence key={i} from={Math.max(0, fr(s))} layout="none">
          <Audio src={staticFile(file)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
