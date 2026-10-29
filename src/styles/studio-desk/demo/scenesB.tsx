// Video 23 · scenes 6–8 (vertical 1080×1920): the dark cinema showcase of the user's own AI films → the NFP gift & no
// subscriptions → the Claude demo (12M reel → Persian remake → auto-edit). Pure functions of global time t.
import React from "react";
import { CLAUDE_ORANGE, CLAUDE_PATH } from "../../test-reel/lib/claude-logo";
import { CatTitle, Echo, Corners, CoverClip, Dust, FreezeClip, Full, GrainL, PixelDef, slam, tc } from "./b-kit";
import { C, FA, MONO, NUM, S, UI, clamp, ease, hit, lerp, ramp, rnd } from "./lib";
import { S7Body } from "./b-s7";
import { S8Body } from "./b-s8";

type SP = { t: number; frame: number };

/** the real Claude mark (other groups import this) */
export const Claude: React.FC<{ s?: number; c?: string }> = ({ s = 40, c = CLAUDE_ORANGE }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ display: "block", flex: "none" }}><path d={CLAUDE_PATH} fill={c} /></svg>
);

const mono = (s: number, c = "rgba(255,255,255,.7)", ls = 3): React.CSSProperties => ({ fontFamily: MONO, fontWeight: 600, fontSize: s, letterSpacing: ls, color: c, direction: "ltr", whiteSpace: "nowrap", lineHeight: 1 });

// ═════════════ S6 · showcase (37.2 – 49.75): cinematic · animation · music video · character · quality ═════════════
const T6 = () => ({
  a: 37.2, title: S(109), b: S(111), stamp: S(114), c: S(116), c2: S(119), d: S(120), m1: S(123), e: S(125), e2: S(128), e3: S(130), f: S(131), k4: S(133), sw: S(134), lp: S(135),
});
const SEGS = (): [number, number][] => { const x = T6(); return [[x.a, x.c], [x.c, x.d], [x.d, x.e], [x.e, x.f], [x.f, 49.15]]; };

/** top HUD: 5 category segments + labels + running timecode */
const TopHud: React.FC<{ t: number }> = ({ t }) => {
  const segs = SEGS();
  const ci = Math.max(0, segs.findIndex(([a, b]) => t >= a && t < b));
  const k = ease.out(ramp(t, 37.35, 37.8));
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 150, opacity: k, transform: `translateY(${(1 - k) * -20}px)` }}>
      <div style={{ display: "flex", gap: 10, direction: "rtl" }}>
        {segs.map(([a, b], i) => {
          const p = ramp(t, a, b);
          return (
            <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,.2)", overflow: "hidden" }}>
              <div style={{ width: `${p * 100}%`, height: "100%", background: i === ci ? C.neon : "rgba(255,255,255,.85)", marginRight: 0, marginLeft: "auto" }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: C.neon, opacity: 0.5 + 0.5 * Math.abs(Math.sin(t * 4)) }} />
          <span style={mono(19, "rgba(255,255,255,.75)", 4)}>NFP · AI FILMS</span>
        </div>
        <span style={mono(19, "rgba(255,255,255,.55)", 3)}>TC {tc(t - 37.2)}</span>
      </div>
    </div>
  );
};

/** A + B · cinematic: full-bleed man → scope band → coverflow of the user's films + «ساخته‌ی خودم با AI» stamp */
const Cinema: React.FC<{ t: number }> = ({ t }) => {
  const x = T6();
  const kBand = ease.io(ramp(t, 37.22, 37.52)); // full-bleed hand-off → 2.39:1 band within 0.3 s
  const kFlow = ease.io(ramp(t, x.b - 0.06, x.b + 0.5));
  const out = ease.in(ramp(t, x.c - 0.17, x.c));
  // man container: full → band → right card
  const full = { l: 0, tp: 0, w: 1080, h: 1920 }, band = { l: 0, tp: 610, w: 1080, h: 452 }, card = { l: 790, tp: 470, w: 330, h: 586 };
  const r1 = { l: lerp(full.l, band.l, kBand), tp: lerp(full.tp, band.tp, kBand), w: lerp(full.w, band.w, kBand), h: lerp(full.h, band.h, kBand) };
  const r = { l: lerp(r1.l, card.l, kFlow), tp: lerp(r1.tp, card.tp, kFlow), w: lerp(r1.w, card.w, kFlow), h: lerp(r1.h, card.h, kFlow) };
  // crop follows his face (≈ x 0.68, y 0.22 of the 1280×720 frame): centre of the still → face, then a slow push in the band
  const fxFull = lerp(0.5, 0.76, ease.io(ramp(t, 37.2, 37.45)));
  const zBand = lerp(1.08, 1.2, ease.io(ramp(t, 37.5, x.b)));
  const fx = lerp(lerp(fxFull, 0.92, kBand), 0.76, kFlow);
  const fy = lerp(lerp(0.5, 0.18, kBand), 0.5, kFlow);
  const push = lerp(lerp(1.0, zBand, kBand), 1.0, kFlow);
  // lamp flame position inside the band (for the anamorphic streak)
  const bs = Math.max(1080 / 1280, 452 / 720) * zBand;
  const flameX = 290 * bs - (1280 * bs - 1080) * 0.92, flameY = 610 + 460 * bs - (720 * bs - 452) * 0.18;
  const drift = lerp(16, -16, ramp(t, x.b, x.c)) * kFlow;
  const cardIn = ease.out(ramp(t, x.b - 0.02, x.b + 0.5));
  const st = slam(t, x.stamp, 0.2);
  const shake = st.sh * Math.sin(t * 90) * 7;
  const titleK = ramp(t, 37.42, 37.9);
  const sweep = ramp(t, x.stamp - 0.05, x.stamp + 0.6);
  return (
    <Full style={{ transform: `translateX(${-out * 1150}px) skewX(${out * 6}deg)`, filter: out > 0 ? `blur(${out * 22}px)` : undefined, perspective: 1600 }}>
      {/* scope-band guides */}
      {kBand > 0 && kFlow < 1 && (
        <Full style={{ opacity: kBand * (1 - kFlow) }}>
          {[610, 1062].map((y) => <div key={y} style={{ position: "absolute", left: 0, right: 0, top: y - 1, height: 1, background: "rgba(255,255,255,.22)" }} />)}
          {Array.from({ length: 28 }, (_, i) => <div key={i} style={{ position: "absolute", left: 20 + i * 38.5, top: 1070, width: 1, height: i % 4 === 0 ? 14 : 7, background: "rgba(255,255,255,.35)" }} />)}
          <div style={{ position: "absolute", left: 50, top: 566, display: "flex", gap: 26, alignItems: "center" }}>
            <span style={mono(20, C.neon, 4)}>● PLAY</span>
            <span style={mono(20, "rgba(255,255,255,.65)", 3)}>SC 01 · TK 03</span>
            <span style={mono(20, "rgba(255,255,255,.65)", 3)}>2.39 : 1</span>
          </div>
          <div style={{ position: "absolute", right: 50, top: 566 }}><span style={mono(20, "rgba(255,255,255,.65)", 3)}>{tc(t - 37.2)}</span></div>
          <div style={{ position: "absolute", left: 50, right: 50, top: 1112, display: "flex", justifyContent: "space-between" }}>
            {[["LENS", "35 mm"], ["IRIS", "T1.4"], ["ISO", "800"], ["SHUTTER", "180°"]].map(([a, b], i) => (
              <div key={a} style={{ display: "flex", flexDirection: "column", gap: 8, opacity: ease.out(ramp(t, 37.6 + i * 0.08, 37.9 + i * 0.08)) }}>
                <span style={mono(15, "rgba(255,255,255,.45)", 4)}>{a}</span>
                <span style={mono(28, i === 1 ? C.neon : "#fff", 2)}>{b}</span>
              </div>
            ))}
          </div>
        </Full>
      )}
      {/* anamorphic streak through the lamp flame (band phase) */}
      {kBand > 0 && kFlow < 1 && (
        <div style={{ position: "absolute", left: flameX - 700, width: 1400, top: flameY - 3, height: 6, zIndex: 2, mixBlendMode: "screen", opacity: kBand * (1 - kFlow) * (0.55 + 0.25 * Math.sin(t * 9) + 0.2 * Math.sin(t * 23)), background: "linear-gradient(90deg, rgba(255,140,70,0) 0%, rgba(255,140,70,.25) 30%, rgba(255,200,150,.95) 50%, rgba(255,140,70,.25) 70%, rgba(255,140,70,0) 100%)", filter: "blur(1.5px)" }} />
      )}
      {/* coverflow stage */}
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${drift}px)`, transformStyle: "preserve-3d" }}>
        {/* left card: train */}
        {cardIn > 0 && (
          <div style={{ position: "absolute", left: lerp(-420, -40, cardIn), top: 470, width: 330, height: 586, borderRadius: 22, overflow: "hidden", transform: `rotateY(${-34}deg)`, transformOrigin: "100% 50%", boxShadow: "0 40px 90px rgba(0,0,0,.7)", filter: "brightness(.74)" }}>
            <CoverClip src="train.mp4" t0={x.b - 0.06} from={2} dur={4} w={330} h={586} vw={720} vh={1280} fx={0.35} />
          </div>
        )}
        {/* the man: full → band → right card */}
        <div style={{ position: "absolute", left: r.l, top: r.tp, width: r.w, height: r.h, overflow: "hidden", borderRadius: kFlow * 22, transform: `rotateY(${kFlow * 34}deg)`, transformOrigin: "0% 50%", boxShadow: kFlow > 0 ? "0 40px 90px rgba(0,0,0,.7)" : undefined, filter: kFlow > 0 ? `brightness(${lerp(1, 0.74, kFlow)})` : undefined }}>
          <CoverClip src="man.mp4" t0={37.2} from={0} dur={x.c - 37.2 + 0.3} w={r.w} h={r.h} vw={1280} vh={720} fx={fx} fy={fy} z={push} />
          {kBand < 1 && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 62%, rgba(0,0,0,.75) 100%)", opacity: 1 - kBand }} />}
        </div>
        {/* centre card: koroush */}
        {cardIn > 0 && (
          <div style={{ position: "absolute", left: 540 - 255, top: lerp(420, 352, cardIn), width: 510, height: 906, borderRadius: 26, overflow: "hidden", transform: `translate(${shake}px, ${shake * 0.6}px) scale(${lerp(0.55, 1, cardIn)}) translateZ(${lerp(-400, 0, cardIn)}px)`, opacity: Math.min(1, cardIn * 1.6), boxShadow: "0 50px 120px rgba(0,0,0,.85), 0 0 0 1px rgba(255,255,255,.08)" }}>
            <CoverClip src="koroush.mp4" t0={x.b - 0.06} from={4.4} dur={2.4} w={510} h={906} vw={720} vh={1280} z={lerp(1.02, 1.1, ramp(t, x.b, x.c))} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,.6) 100%)" }} />
            {sweep > 0 && sweep < 1 && <div style={{ position: "absolute", top: -200, bottom: -200, left: lerp(-300, 700, sweep), width: 160, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,235,215,.28), rgba(255,255,255,0))", transform: "rotate(14deg)" }} />}
            <div style={{ position: "absolute", left: 22, top: 22, ...mono(17, "rgba(255,255,255,.85)", 3) }}>FILM 02 · 9:16</div>
            <div style={{ position: "absolute", right: 22, top: 20, width: 12, height: 12, borderRadius: 6, background: C.neon, boxShadow: `0 0 12px ${C.neon}` }} />
          </div>
        )}
        {/* reflection glow under the centre card */}
        {cardIn > 0 && <div style={{ position: "absolute", left: 140, top: 1210, width: 800, height: 90, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,122,61,.25), rgba(255,122,61,0) 70%)", opacity: cardIn }} />}
      </div>
      {/* stamp */}
      {st.o > 0 && (
        <div style={{ position: "absolute", left: 540, top: 1090, transform: `translate(-50%,-50%) rotate(-2deg) scale(${st.s})`, opacity: st.o }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 18, padding: "18px 34px 20px", borderRadius: 18, background: C.neon, boxShadow: "0 12px 30px rgba(0,0,0,.32)", direction: "rtl" }}>
            <Echo k={ramp(t, x.stamp + 0.18, x.stamp + 0.75)} r={18} c={C.neon} w={5} grow={0.28} />
            <Echo k={ramp(t, x.stamp + 0.3, x.stamp + 0.9)} r={18} c="rgba(255,255,255,.7)" w={3} grow={0.45} />
            <svg width={46} height={46} viewBox="0 0 24 24"><path d="M12 2l2.2 6.3L20.5 10.5 14.2 12.7 12 19l-2.2-6.3L3.5 10.5l6.3-2.2z" fill={C.ink} /></svg>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ fontFamily: FA, fontWeight: 900, fontSize: 54, color: C.ink, lineHeight: 1.2, whiteSpace: "nowrap", wordSpacing: "0.18em" }}>ساخته‌ی خودم با AI</div>
              <div style={{ ...mono(16, "rgba(22,23,26,.75)", 5), marginTop: 2 }}>MADE BY ME · 100% AI</div>
            </div>
          </div>
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, transform: `scale(${lerp(1, 0.78, kFlow)})`, transformOrigin: "1030px 180px" }}>
        <CatTitle fa="فیلم سینمایی" en="CINEMATIC" idx={1} k={titleK} hitK={hit(t, S(110), 0.3)} />
      </div>
    </Full>
  );
};

/** C · animation: city otter (wide) → split with the panda warriors */
const Anim: React.FC<{ t: number }> = ({ t }) => {
  const x = T6();
  const inK = ease.out(ramp(t, x.c, x.c + 0.24));
  const k2 = ease.io(ramp(t, x.c2 - 0.12, x.c2 + 0.34));
  const ch = lerp(880, 463, k2);
  const ky = 380;
  const pIn = ease.out(ramp(t, x.c2 - 0.05, x.c2 + 0.4));
  const fx = lerp(0.38, 0.47, ramp(t, x.c, x.c2));
  return (
    <Full style={{ transform: `translateX(${(1 - inK) * 1150}px) skewX(${(1 - inK) * 6}deg)`, filter: inK < 1 ? `blur(${(1 - inK) * 22}px)` : undefined }}>
      <div style={{ position: "absolute", left: 0, top: ky, width: 1080, height: ch, overflow: "hidden" }}>
        <CoverClip src="city.mp4" t0={x.c - 0.05} from={19.0} dur={x.d - x.c + 0.4} w={1080} h={ch} vw={1470} vh={630} fx={fx} fy={0.45} z={lerp(1.0, 1.04, ramp(t, x.c, x.d))} />
        <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 120px rgba(0,0,0,.55)" }} />
        <div style={{ position: "absolute", left: 24, bottom: 20, ...mono(18, "rgba(255,255,255,.9)", 3), padding: "7px 12px", background: "rgba(0,0,0,.45)", borderRadius: 8 }}>SHOT 14 · 3D ANIMATION</div>
      </div>
      {pIn > 0 && (
        <div style={{ position: "absolute", left: 0, top: ky + 463 + 14, width: 1080, height: 1258 - (ky + 463 + 14), overflow: "hidden", clipPath: `inset(${(1 - pIn) * 100}% 0 0 0)` }}>
          <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - pIn) * 120}px)` }}>
            <CoverClip src="panda.mp4" t0={x.c2 - 0.1} from={2.1} dur={x.d - x.c2 + 0.5} w={1080} h={1258 - (ky + 463 + 14)} vw={1280} vh={720} fx={0.45} fy={0.32} z={lerp(1.04, 1.0, ramp(t, x.c2, x.d))} />
          </div>
          <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 120px rgba(0,0,0,.55)" }} />
          <div style={{ position: "absolute", left: 24, bottom: 20, ...mono(18, "rgba(255,255,255,.9)", 3), padding: "7px 12px", background: "rgba(0,0,0,.45)", borderRadius: 8 }}>SHOT 03 · CG FEATURE</div>
        </div>
      )}
      {/* split seam */}
      {k2 > 0 && <div style={{ position: "absolute", left: 0, top: ky + 463 + 5, width: 1080 * k2, height: 4, background: C.neon, boxShadow: `0 0 18px ${C.neon}` }} />}
      <CatTitle fa="انیمیشن" en="ANIMATION" idx={2} k={ramp(t, x.c + 0.06, x.c + 0.5)} hitK={hit(t, x.c2, 0.3)} />
    </Full>
  );
};

/** D · music video: beat-cut skeleton / cat / boy + equalizer + now-playing chip, glitch in */
const BEAT = 0.36;
const MSHOTS: { src: string; from: number }[] = [
  { src: "skeleton.mp4", from: 1.4 },
  { src: "skeleton.mp4", from: 1.4 },
  { src: "cat.mp4", from: 2.1 },
  { src: "boy.mp4", from: 0.25 },
  { src: "skeleton.mp4", from: 5.2 },
  { src: "boy.mp4", from: 8.4 },
];
const MusicFrame: React.FC<{ t: number }> = ({ t }) => {
  const x = T6();
  const n = clamp(Math.floor((t - x.d) / BEAT), 0, MSHOTS.length - 1);
  // shots 0 and 1 are one continuous take
  const si = n <= 1 ? 0 : n;
  const st = x.d + si * BEAT;
  const sh = MSHOTS[si];
  const bt = x.d + n * BEAT;
  const z = (sh.src === "cat.mp4" ? 1.12 : 1.0) + 0.06 * Math.exp(-Math.max(0, t - bt) * 9);
  return <CoverClip key={si} src={sh.src} t0={st} from={sh.from} dur={BEAT * (si === 0 ? 2 : 1) + 0.3} w={1080} h={1920} vw={720} vh={1280} z={z} fy={0.4} />;
};
const Music: React.FC<{ t: number }> = ({ t }) => {
  const x = T6();
  const g = ramp(t, x.d - 0.1, x.d + 0.2); // glitch window
  const glitch = g > 0 && g < 1;
  const n = Math.floor((t - x.d) / BEAT);
  const bt = x.d + Math.max(0, n) * BEAT;
  const env = Math.exp(-Math.max(0, t - bt) * 7);
  const out = ease.in(ramp(t, x.e - 0.16, x.e + 0.06));
  const fr = Math.floor(t * 30);
  return (
    <Full style={{ transform: `scale(${1 + out * 0.8})`, opacity: 1 - out, filter: out > 0 ? `blur(${out * 16}px)` : undefined, transformOrigin: "50% 45%" }}>
      <Full style={{ transform: glitch ? `translateX(${(rnd(fr) - 0.5) * 60}px)` : undefined, filter: glitch ? `contrast(1.35) brightness(${1 + (rnd(fr + 3) - 0.5) * 0.4})` : undefined }}>
        <MusicFrame t={t} />
      </Full>
      {/* glitch slices: the same frame displaced */}
      {glitch &&
        [0, 1, 2].map((i) => {
          const y0 = rnd(fr * 3 + i) * 1700, h = 40 + rnd(fr * 5 + i) * 160;
          return (
            <Full key={i} style={{ clipPath: `inset(${y0}px 0 ${1920 - y0 - h}px 0)`, transform: `translateX(${(rnd(fr * 7 + i) - 0.5) * 220}px)`, filter: i === 1 ? "invert(1) contrast(1.2)" : i === 2 ? "brightness(1.7) contrast(1.3)" : undefined }}>
              <MusicFrame t={t} />
            </Full>
          );
        })}
      {glitch && Array.from({ length: 7 }, (_, i) => <div key={`gb${i}`} style={{ position: "absolute", left: rnd(fr + i * 11) * 900, top: rnd(fr * 2 + i * 7) * 1900, width: 60 + rnd(fr + i) * 400, height: 4 + rnd(i + fr) * 18, background: i % 3 === 0 ? C.neon : i % 3 === 1 ? "#fff" : "#000", opacity: 0.85 }} />)}
      {/* scanlines + beat edge glow */}
      <Full style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,.16) 0px, rgba(0,0,0,.16) 2px, transparent 2px, transparent 5px)", opacity: 0.5 }} />
      <Full style={{ boxShadow: `inset 0 0 ${140 + env * 120}px rgba(255,122,61,${0.12 + env * 0.38})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 420, background: "linear-gradient(180deg, rgba(0,0,0,.7), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 960, height: 560, background: "linear-gradient(0deg, rgba(0,0,0,.85) 30%, rgba(0,0,0,0))" }} />
      {/* now playing chip */}
      {(() => {
        const k = ease.out(ramp(t, x.d + 0.1, x.d + 0.45));
        return (
          <div style={{ position: "absolute", left: 50, top: 214, display: "flex", alignItems: "center", gap: 16, padding: "12px 20px 12px 14px", borderRadius: 999, background: "rgba(20,20,24,.72)", border: "1px solid rgba(255,255,255,.12)", opacity: k, transform: `translateX(${(1 - k) * -40}px)` }}>
            <div style={{ width: 54, height: 54, borderRadius: 27, background: "repeating-radial-gradient(circle, #111 0px, #111 2px, #2a2a2e 3px, #111 4px)", position: "relative", transform: `rotate(${t * 400}deg)`, boxShadow: "0 0 0 2px rgba(255,255,255,.15)" }}>
              <div style={{ position: "absolute", left: 18, top: 18, width: 18, height: 18, borderRadius: 9, background: C.neon }} />
              <div style={{ position: "absolute", left: 25, top: 25, width: 4, height: 4, borderRadius: 2, background: "#111" }} />
              <div style={{ position: "absolute", left: 6, top: 10, width: 14, height: 4, borderRadius: 2, background: "rgba(255,255,255,.25)", transform: "rotate(-40deg)" }} />
            </div>
            <div>
              <div style={mono(18, "#fff", 3)}>TRACK 03 · 166 BPM</div>
              <div style={{ display: "flex", gap: 7, marginTop: 9 }}>
                {[0, 1, 2, 3].map((i) => <div key={i} style={{ width: 26, height: 6, borderRadius: 3, background: ((n % 4) + 4) % 4 === i ? C.neon : "rgba(255,255,255,.25)" }} />)}
              </div>
            </div>
          </div>
        );
      })()}
      {/* equalizer */}
      {(() => {
        const k = ease.out(ramp(t, x.d, x.d + 0.35));
        return (
          <div style={{ position: "absolute", left: 50, right: 50, top: 1060, height: 190, display: "flex", alignItems: "flex-end", gap: 7 }}>
            {Array.from({ length: 34 }, (_, i) => {
              const c = Math.abs(i - 16.5) / 17;
              const v = clamp((0.2 + 0.8 * env * (1 - c * 0.6)) * (0.45 + 0.55 * Math.abs(Math.sin(t * (7 + rnd(i) * 9) + i * 1.3))) + rnd(i * 3) * 0.08, 0.06, 1) * k;
              return (
                <div key={i} style={{ flex: 1, height: 190 * v, display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{ height: 6, borderRadius: 2, background: v > 0.62 ? C.neon : "rgba(255,255,255,.9)" }} />
                  <div style={{ flex: 1, borderRadius: 3, background: "linear-gradient(0deg, rgba(255,255,255,.2), rgba(255,255,255,.75))" }} />
                </div>
              );
            })}
          </div>
        );
      })()}
      <CatTitle fa="موزیک ویدیو" en="MUSIC VIDEO" idx={3} k={ramp(t, x.d + 0.12, x.d + 0.55)} hitK={hit(t, x.m1, 0.3)} />
    </Full>
  );
};

/** E · character: dialog with face tracking → zoom into the girl (lock + landmarks) → cast strip */
const Character: React.FC<{ t: number }> = ({ t }) => {
  const x = T6();
  const inK = ease.out(ramp(t, x.e - 0.06, x.e + 0.28));
  const zin = ease.in(ramp(t, x.e2 - 0.22, x.e2 + 0.05)); // zoom into the woman's face
  const gIn = ease.out(ramp(t, x.e2 - 0.04, x.e2 + 0.32));
  const lock = ease.out(ramp(t, x.e2 + 0.05, x.e2 + 0.38));
  const cast = (i: number) => ease.out(ramp(t, x.e3 - 0.08 + i * 0.09, x.e3 + 0.3 + i * 0.09));
  const fo = ramp(t, x.f - 0.16, x.f); // mosaic out
  const px = lerp(1, 46, ease.in(fo));
  const jit = (i: number) => Math.sin(t * 5 + i) * 4;
  return (
    <Full style={{ transform: `scale(${lerp(0.72, 1, inK)})`, opacity: Math.min(1, inK * 1.4), filter: fo > 0 ? "url(#pxOut)" : undefined }}>
      {fo > 0 && <PixelDef id="pxOut" s={px} />}
      {/* dialog with two tracked faces */}
      {zin < 1 && (
        <Full style={{ transform: `scale(${lerp(1, 4.2, zin)})`, transformOrigin: "262px 660px", opacity: 1 - ease.in(ramp(t, x.e2 - 0.08, x.e2 + 0.05)) }}>
          <CoverClip src="dialog.mp4" t0={x.e - 0.2} from={1.0} dur={x.e2 - x.e + 0.5} w={1080} h={1920} vw={720} vh={1280} z={1.04} fy={0.4} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.6) 0%, rgba(0,0,0,0) 24%, rgba(0,0,0,0) 70%, rgba(0,0,0,.7) 100%)" }} />
          {[
            { cx: 262 + jit(1), cy: 660 + jit(2), w: 200, h: 240, l: "CHAR_A · 97.4%", d: 0.12 },
            { cx: 782 + jit(3), cy: 646 + jit(4), w: 214, h: 256, l: "CHAR_B · 98.1%", d: 0.26 },
          ].map((b, i) => {
            const k = ease.out(ramp(t, x.e + b.d, x.e + b.d + 0.3));
            if (k <= 0) return null;
            return (
              <React.Fragment key={i}>
                <Corners x={b.cx - b.w / 2} y={b.cy - b.h / 2} w={b.w} h={b.h} L={34} c={C.neon} sw={4} o={k} spread={(1 - k) * 40} />
                <div style={{ position: "absolute", left: b.cx - b.w / 2, top: b.cy - b.h / 2 - 38, opacity: k, ...mono(21, C.neon, 2) }}>{b.l}</div>
              </React.Fragment>
            );
          })}
        </Full>
      )}
      {/* the girl close-up */}
      {gIn > 0 && (
        <Full style={{ transform: `scale(${lerp(1.35, 1, gIn) * lerp(1, 1.05, ramp(t, x.e2, x.f))})`, opacity: Math.min(1, gIn * 2), transformOrigin: "50% 45%" }}>
          <CoverClip src="girl.mp4" t0={x.e2 - 0.05} from={1.5} dur={x.f - x.e2 + 0.4} w={1080} h={1920} vw={720} vh={1280} fy={0.3} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 55%, rgba(0,0,0,.82) 100%)" }} />
          {/* face mesh */}
          {lock > 0 && (
            <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: lock * (1 - cast(0) * 0.85) }}>
              {(() => {
                const P: [number, number][] = [[330, 718], [790, 718], [250, 590], [430, 580], [690, 580], [860, 592], [540, 930], [460, 990], [620, 990], [410, 1196], [670, 1196], [540, 1170], [540, 1250], [200, 900], [880, 900]];
                const L: [number, number][] = [[0, 1], [0, 6], [1, 6], [6, 9], [6, 10], [9, 11], [11, 10], [9, 12], [12, 10], [2, 3], [4, 5], [0, 13], [1, 14], [13, 9], [14, 10], [7, 8], [3, 6], [4, 6]];
                const sc = ramp(t, x.e2 + 0.1, x.e2 + 0.7);
                return (
                  <>
                    {L.map(([a, b], i) => <line key={i} x1={P[a][0]} y1={P[a][1]} x2={P[b][0]} y2={P[b][1]} stroke="rgba(255,255,255,.35)" strokeWidth={1.5} strokeDasharray={`${400 * ramp(t, x.e2 + 0.1 + i * 0.015, x.e2 + 0.45 + i * 0.015)} 400`} />)}
                    {P.map(([px1, py1], i) => <circle key={i} cx={px1} cy={py1} r={i < 2 ? 7 : 5} fill={i < 2 ? C.neon : "#fff"} opacity={0.6 + 0.4 * Math.abs(Math.sin(t * 6 + i))} />)}
                    {sc > 0 && sc < 1 && <rect x={170} y={lerp(470, 1270, sc)} width={740} height={3} fill={C.neon} opacity={0.9} />}
                    {sc > 0 && sc < 1 && <rect x={170} y={lerp(470, 1270, sc) - 90} width={740} height={90} fill="url(#scanG)" />}
                    <defs><linearGradient id="scanG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.neon} stopOpacity={0} /><stop offset="1" stopColor={C.neon} stopOpacity={0.22} /></linearGradient></defs>
                  </>
                );
              })()}
            </svg>
          )}
          {lock > 0 && <Corners x={170} y={470} w={740} h={800} L={70} c={C.neon} sw={6} o={lock} spread={(1 - lock) * 120} />}
          {lock > 0 && (
            <div style={{ position: "absolute", left: 170, top: 422, display: "flex", gap: 14, alignItems: "center", opacity: lock }}>
              <div style={{ padding: "6px 12px", background: C.neon, borderRadius: 6, ...mono(18, C.ink, 3) }}>LOCKED</div>
              <span style={mono(18, "#fff", 3)}>CHARACTER 07 · ID MATCH 99.2%</span>
            </div>
          )}
        </Full>
      )}
      {/* cast strip */}
      {cast(0) > 0 && (
        <div style={{ position: "absolute", left: 50, right: 50, top: 1046, height: 206, display: "flex", gap: 16, direction: "rtl" }}>
          {[
            { src: "girl.mp4", from: 2.4, vw: 720, vh: 1280, fx: 0.5, fy: 0.3, z: 1.6, l: "CHAR 07" },
            { src: "koroush.mp4", from: 18.2, vw: 720, vh: 1280, fx: 0.5, fy: 0.35, z: 1.5, l: "CHAR 12" },
            { src: "train.mp4", from: 3.0, vw: 720, vh: 1280, fx: 0.22, fy: 0.28, z: 2.4, l: "CHAR 03" },
            null,
          ].map((c, i) => {
            const k = cast(i);
            return (
              <div key={i} style={{ flex: 1, height: 206, borderRadius: 20, overflow: "hidden", position: "relative", background: c ? "#000" : "rgba(255,255,255,.04)", border: c ? (i === 0 ? `3px solid ${C.neon}` : "1px solid rgba(255,255,255,.25)") : "2px dashed rgba(255,255,255,.35)", opacity: k, transform: `translateY(${(1 - k) * 120}px)`, boxShadow: "0 20px 50px rgba(0,0,0,.6)" }}>
                {c ? (
                  <>
                    <CoverClip src={c.src} t0={x.e3 - 0.1} from={c.from} dur={1.4} w={233} h={206} vw={c.vw} vh={c.vh} fx={c.fx} fy={c.fy} z={c.z} />
                    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 70, background: "linear-gradient(0deg, rgba(0,0,0,.8), rgba(0,0,0,0))" }} />
                    <div style={{ position: "absolute", left: 12, bottom: 12, ...mono(15, "#fff", 2) }}>{c.l}</div>
                    <div style={{ position: "absolute", right: 10, top: 10, width: 26, height: 26, borderRadius: 13, background: C.neon, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width={16} height={16} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke={C.ink} strokeWidth={3.5} fill="none" strokeLinecap="round" /></svg>
                    </div>
                  </>
                ) : (
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <div style={{ fontFamily: UI, fontWeight: 300, fontSize: 80, color: "#fff", lineHeight: 0.8, transform: `rotate(${t * 40}deg)` }}>+</div>
                    <div style={mono(15, "rgba(255,255,255,.7)", 2)}>NEW CHAR</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <CatTitle fa="کاراکتر" en="CHARACTER" idx={4} k={ramp(t, x.e + 0.1, x.e + 0.5)} hitK={hit(t, x.e2, 0.3)} />
    </Full>
  );
};

/** F · quality: mosaic-in on the king's face, 4K slam, pixel → sharp sweep, loupe on the eye */
const Quality: React.FC<{ t: number }> = ({ t }) => {
  const x = T6();
  const FROM = 17.9, END = 19.93;
  const inK = ramp(t, x.f, x.f + 0.28);
  const blk = t < x.sw ? lerp(46, 18, ease.out(inK)) : 18;
  const sweep = ease.io(ramp(t, x.sw - 0.02, x.sw + 0.62));
  const sy = lerp(0, 1920, sweep);
  const push = lerp(1.0, 1.14, ease.io(ramp(t, x.f, 49.5)));
  const live = x.f + (END - FROM);
  const face = (f?: React.CSSProperties) => (
    <div style={{ position: "absolute", inset: 0, transform: `scale(${push})`, transformOrigin: "540px 820px", ...f }}>
      {t < live ? <CoverClip src="koroush.mp4" t0={x.f} from={FROM} dur={END - FROM} w={1080} h={1920} vw={720} vh={1280} /> : <FreezeClip src="koroush.mp4" at={END - 0.03} t={t} />}
    </div>
  );
  const k4 = slam(t, x.k4, 0.2);
  const lp = ease.out(ramp(t, x.lp - 0.05, x.lp + 0.35));
  const Z = 2.7 * push;
  const eye = { x: 540 + (370 - 540) * push, y: 820 + (660 - 820) * push };
  const L = { x: 800, y: 600, r: 150 };
  const sharp = sweep >= 1;
  return (
    <Full>
      <PixelDef id="pxQ" s={blk} />
      {face()}
      {/* pixelated layer above the sweep line */}
      {sweep < 1 && <div style={{ position: "absolute", inset: 0, clipPath: `inset(${sy}px 0 0 0)`, filter: "url(#pxQ)" }}>{face()}</div>}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 45%, rgba(0,0,0,.55) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 420, background: "linear-gradient(180deg, rgba(0,0,0,.65), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, height: 640, background: "linear-gradient(0deg, rgba(0,0,0,.88) 25%, rgba(0,0,0,0))" }} />
      {/* sweep line */}
      {sweep > 0 && sweep < 1 && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: sy - 160, height: 160, background: "linear-gradient(180deg, rgba(255,122,61,0), rgba(255,122,61,.28))" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: sy - 2, height: 4, background: "#fff", boxShadow: `0 0 20px 6px ${C.neon}` }} />
          <div style={{ position: "absolute", right: 50, top: sy - 40, ...mono(18, "#fff", 3) }}>{`UPSCALE ${Math.round(sweep * 100)}%`}</div>
        </>
      )}
      {/* resolution chip */}
      <div style={{ position: "absolute", left: 40, top: 204, display: "flex", alignItems: "center", gap: 12, padding: "8px 16px 8px 8px", borderRadius: 14, background: "rgba(10,10,12,.55)", opacity: ramp(t, x.f + 0.1, x.f + 0.4) }}>
        <div style={{ padding: "8px 14px", borderRadius: 8, background: sharp ? C.neon : "rgba(255,255,255,.14)", border: sharp ? "none" : "1px solid rgba(255,255,255,.3)", ...mono(22, sharp ? C.ink : "#fff", 3), transform: `scale(${1 + hit(t, x.sw + 0.62, 0.3) * 0.2})` }}>{sharp ? "2160 × 3840" : "720 × 1280"}</div>
        <span style={mono(18, "rgba(255,255,255,.6)", 3)}>{sharp ? "SHARP ✓" : "SOURCE"}</span>
      </div>
      {/* loupe */}
      {lp > 0 && (
        <>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: lp }}>
            <line x1={eye.x} y1={eye.y} x2={L.x - L.r * 0.82} y2={L.y + L.r * 0.55} stroke={C.neon} strokeWidth={3} strokeDasharray={`${500 * lp} 500`} />
            <circle cx={eye.x} cy={eye.y} r={34} stroke={C.neon} strokeWidth={3} fill="none" />
          </svg>
          <div style={{ position: "absolute", left: L.x - L.r, top: L.y - L.r, width: L.r * 2, height: L.r * 2, borderRadius: L.r, overflow: "hidden", transform: `scale(${lp})`, boxShadow: `0 0 0 5px ${C.neon}, 0 30px 70px rgba(0,0,0,.7)` }}>
            <div style={{ position: "absolute", left: L.r - 370 * Z, top: L.r - 660 * Z, width: 1080 * Z, height: 1920 * Z }}>
              {t < live ? <CoverClip src="koroush.mp4" t0={x.f} from={FROM} dur={END - FROM} w={1080 * Z} h={1920 * Z} vw={720} vh={1280} /> : <FreezeClip src="koroush.mp4" at={END - 0.03} t={t} />}
            </div>
            <svg width={L.r * 2} height={L.r * 2} style={{ position: "absolute", inset: 0 }}>
              <line x1={L.r} y1={20} x2={L.r} y2={L.r * 2 - 20} stroke="rgba(255,255,255,.45)" strokeWidth={1.5} />
              <line x1={20} y1={L.r} x2={L.r * 2 - 20} y2={L.r} stroke="rgba(255,255,255,.45)" strokeWidth={1.5} />
            </svg>
          </div>
          <div style={{ position: "absolute", left: L.x - L.r, top: L.y + L.r + 16, width: L.r * 2, textAlign: "center", opacity: lp, ...mono(18, "#fff", 3) }}>×2.7 · DETAIL</div>
        </>
      )}
      {/* 4K */}
      {k4.o > 0 && (
        <div style={{ position: "absolute", left: 60, top: 940, transform: `scale(${k4.s}) translate(${k4.sh * Math.sin(t * 80) * 6}px, 0)`, transformOrigin: "0% 60%", opacity: k4.o }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
            <div style={{ fontFamily: NUM, fontWeight: 700, fontSize: 250, lineHeight: 0.82, color: "#fff", letterSpacing: -8, textShadow: "0 10px 60px rgba(0,0,0,.6)" }}>4K</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 14 }}>
              <div style={{ padding: "6px 12px", border: `2px solid ${C.neon}`, borderRadius: 8, ...mono(20, C.neon, 3) }}>ULTRA HD</div>
              <div style={mono(18, "rgba(255,255,255,.75)", 3)}>HDR · 10-BIT</div>
            </div>
          </div>
          <div style={{ width: 420 * ease.out(ramp(t, x.k4 + 0.2, x.k4 + 0.6)), height: 6, background: C.neon, marginTop: 16, borderRadius: 3 }} />
        </div>
      )}
      <CatTitle fa="کیفیت" en="ULTRA DETAIL" idx={5} k={ramp(t, x.f + 0.12, x.f + 0.55)} hitK={hit(t, x.sw, 0.3)} />
    </Full>
  );
};

export const S6Showcase: React.FC<SP> = ({ t, frame }) => {
  if (t < 37.2 || t > 49.75) return null;
  const x = T6();
  const fadeIn = ramp(t, 37.2, 37.42);
  const iris = ease.in(ramp(t, 49.12, 49.55));
  const R = iris * 1400;
  const mask = iris > 0 ? `radial-gradient(circle at 540px 800px, transparent ${R}px, black ${R + 1.5}px)` : undefined;
  return (
    <Full style={{ background: C.dark, opacity: fadeIn, WebkitMaskImage: mask, maskImage: mask }}>
      {t < x.c + 0.02 && <Cinema t={t} />}
      {t >= x.c - 0.02 && t < x.d + 0.2 && <Anim t={t} />}
      {t >= x.d - 0.12 && t < x.e + 0.08 && <Music t={t} />}
      {t >= x.e - 0.08 && t < x.f + 0.02 && <Character t={t} />}
      {t >= x.f && <Quality t={t} />}
      {/* whip streaks around the C cut */}
      {Math.abs(t - x.c) < 0.2 && (
        <Full style={{ opacity: 1 - Math.abs(t - x.c) / 0.2 }}>
          {Array.from({ length: 14 }, (_, i) => <div key={i} style={{ position: "absolute", left: rnd(i * 3 + Math.floor(t * 30)) * 600 - 100, top: 200 + rnd(i * 7) * 1300, width: 500 + rnd(i) * 600, height: 2 + rnd(i * 5) * 4, background: "rgba(255,240,230,.5)", borderRadius: 4 }} />)}
        </Full>
      )}
      {/* zoom-through flash at the E cut */}
      {Math.abs(t - x.e + 0.02) < 0.05 && <Full style={{ background: "#FFF3EA", opacity: 0.22 }} />}
      <Dust t={t} />
      <GrainL frame={frame} o={0.07} />
      <TopHud t={t} />
      {iris > 0 && iris < 1 && <div style={{ position: "absolute", left: 540 - R - 6, top: 800 - R - 6, width: (R + 6) * 2, height: (R + 6) * 2, borderRadius: "50%", border: `5px solid ${C.neon}`, boxShadow: `0 0 30px ${C.neon}` }} />}
    </Full>
  );
};

// ═════════════ S7 · NFP gift, no subscriptions, long videos with Claude, this reel itself (49.45 – 63.05) ═════════════
export const S7Nfp: React.FC<SP & { self: boolean }> = ({ t, self }) => {
  if (t < 49.45 || t > 63.05) return null;
  return <S7Body t={t} self={self} />;
};

// ═════════════ S8 · demo (62.8 – 79.45) ═════════════
export const S8Demo: React.FC<SP> = ({ t }) => {
  if (t < 62.8 || t > 79.45) return null;
  return <S8Body t={t} />;
};
