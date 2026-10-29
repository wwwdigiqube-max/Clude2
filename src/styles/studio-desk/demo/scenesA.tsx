// Video 23 · scenes 1–5 (vertical 1080×1920): Explore wall → the AI character's IG page + shop → YouTube channel →
// fame & money / easier than before / the tools maze → 30 days. Pure functions of the global time t.
import React from "react";
import { Img } from "remotion";
import { Clip, Ico } from "./ui";
import { C, E, FA, NUM, S, UI, clamp, ease, grp, hit, kfmt, lerp, pop, ramp, rnd, v23 } from "./lib";
import { AIco, Dots, IgGlyph, Mono, Notif, Odo, RClip, Touch, YtMark, holePath, shuffle, wob } from "./a-kit";
import { FilmSet, Laptop } from "./a-art";

type SP = { t: number; frame: number };
type P = React.CSSProperties;
const Full: React.FC<{ style?: P; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...style }}>{children}</div>
);
const Fx: React.FC<{ s?: number; w?: number; c?: string; style?: P; children?: React.ReactNode }> = ({ s = 32, w = 700, c = C.ink, style, children }) => (
  <div style={{ fontFamily: FA, fontSize: s, fontWeight: w, color: c, direction: "rtl", lineHeight: 1.3, whiteSpace: "nowrap", wordSpacing: "0.22em", ...style }}>{children}</div>
);
const Lx: React.FC<{ s?: number; w?: number; c?: string; style?: P; children?: React.ReactNode }> = ({ s = 24, w = 600, c = C.ink, style, children }) => (
  <div style={{ fontFamily: UI, fontSize: s, fontWeight: w, color: c, direction: "ltr", lineHeight: 1.2, whiteSpace: "nowrap", ...style }}>{children}</div>
);
const still = (n: number) => v23(`stills/s${String(n).padStart(2, "0")}.jpg`);
const fl = (t: number, a: number, d: number) => 1 - Math.pow(1 - ramp(t, a, a + d), 4);
const IG_LIN = "linear-gradient(45deg, #FEDA75 0%, #FA7E1E 28%, #D62976 55%, #962FBF 80%, #4F5BD5 100%)";
const OR = C.green; // the orange accent on light
const ON = C.neon; // the orange accent on dark

// ═════════════ S1 · the Explore wall (0 – 7.95) ═════════════
const TW = 240, TH = 426, PX = 256, PY = 442, COPY = 6 * PY;
const GIRL = 19, G_COL = 3, G_ROW = 2;
const HX = 540, HY = 590, R0 = 270; // hand-off circle = her face inside S2's phone screen
const HALF = (() => {
  const o = shuffle(48, 3);
  const s = new Set(o.slice(0, 24));
  if (!s.has(GIRL)) { s.delete(o.slice(0, 24).find((i) => i !== GIRL)!); s.add(GIRL); }
  return s;
})();
const VIEWS = ["1.2M", "3.8M", "12M", "940K", "2.4M", "6.1M", "1.7M", "18M", "4.3M", "2.9M", "1.1M", "5.5M", "8.2M", "2.0M"];

export const S1Hook: React.FC<SP> = ({ t, frame }) => {
  if (t > 7.95) return null;
  const tS = S(7);
  const slam = ease.out(ramp(t, tS - 0.03, tS + 0.45));
  const reC = ease.io(ramp(t, 6.38, 6.85));
  const dive = ease.io(ramp(t, 6.72, 7.45));
  const gx = G_COL * PX + TW / 2, gy = COPY + G_ROW * PY + TH / 2;
  const scrollAt = (u: number) => 1560 + 620 * fl(u, -0.18, 0.9) + 560 * fl(u, S(1) - 0.05, 0.8) + 520 * fl(u, S(4) - 0.06, 0.8) + 430 * fl(u, S(6) - 0.14, 0.85) + 70 * ramp(u, tS, 6.4);
  const cyS = scrollAt(t);
  const vel = (scrollAt(t + 0.02) - scrollAt(t - 0.02)) / 0.04; // wall px / s
  const mb = clamp((vel - 400) / 2600) * 9 * (1 - reC); // motion blur along the scroll
  const cxS = 990 + 90 * Math.sin(t * 1.15 + 0.5);
  const cx = lerp(cxS, gx, reC), cy = lerp(cyS, gy, reC);
  const z0 = lerp(1.12, 0.97, ease.out(ramp(t, 0, 1.4)));
  const z = lerp(lerp(lerp(z0, 0.8, slam), 1.0, reC), (2 * R0) / TW, dive) * (1 + 0.03 * hit(t, tS, 0.22));
  const rx = lerp(lerp(lerp(30, 17, slam), 9, reC), 0, dive);
  const rz = lerp(lerp(lerp(-11, -6, slam), -3, reC), 0, dive);
  const sh = hit(t, tS, 0.32) * 18;
  const shx = Math.sin(t * 97) * sh, shy = Math.cos(t * 83) * sh;
  const rHole = 298 + 980 * ramp(t, 7.55, 7.93); // linear radius → the bright area grows over ~11 frames
  // the 50% overlay
  const kG = ease.out(ramp(t, tS - 0.02, tS + 0.35));
  const gOut = ease.in(ramp(t, 6.36, 6.66));
  const gA = kG * (1 - gOut);
  const arc = ease.out(ramp(t, tS + 0.02, tS + 0.7));
  const n50 = 50 * ease.out(ramp(t, tS, tS + 0.38));
  const GX0 = 540, GY0 = 650, GR = 318;
  const kLine = ease.out(ramp(t, S(8) - 0.08, S(8) + 0.3));
  const kAI = pop(t, S(13) - 0.04, 0.42);
  const searchOut = ease.in(ramp(t, 2.95, 3.2));
  const tiles: React.ReactNode[] = [];
  for (let c = 0; c < 2; c++) {
    for (let i = 0; i < 48; i++) {
      const col = i % 8, row = Math.floor(i / 8);
      const x = col * PX, y = c * COPY + row * PY;
      const id = c * 48 + i;
      const isHalf = HALF.has(i);
      const isGirl = c === 1 && i === GIRL;
      const d = Math.hypot(x + TW / 2 - cxS, y + TH / 2 - cyS) / 1400;
      const aiT = rnd(id * 1.37) < 0.45 ? lerp(0.15, 1.95, rnd(id * 2.9)) : lerp(1.98, 2.9, rnd(id * 3.3));
      const hasAI = isHalf || rnd(id * 5.1) < 0.6;
      const kAi = hasAI ? pop(t, aiT, 0.32) * (isHalf ? 1 : 1 - slam) * (1 - reC) : 0;
      const kFr = isHalf ? ease.out(ramp(t, tS + d * 0.3, tS + d * 0.3 + 0.25)) * (1 - reC) : 0;
      const kV = isHalf ? pop(t, S(9) + d * 0.55, 0.32) * (1 - reC) : 0;
      const dim = isGirl ? 0 : Math.max(isHalf ? 0 : 0.38 * slam * (1 - reC), lerp(0, 0.4, reC), dive * dive * 0.72);
      const vi = Math.floor(rnd(id * 9.1) * VIEWS.length);
      tiles.push(
        <div key={id} style={{ position: "absolute", left: x, top: y, width: TW, height: TH, borderRadius: 18, boxShadow: `0 0 0 9px ${C.dark}`, overflow: "hidden" }}>
          {dim > 0 && <div style={{ position: "absolute", inset: 0, background: "#000", opacity: dim }} />}
          {kFr > 0 && <div style={{ position: "absolute", inset: 0, borderRadius: 18, boxShadow: `inset 0 0 0 ${7 * kFr}px ${ON}, inset 0 0 40px rgba(255,122,61,${0.45 * kFr})` }} />}
          {kAi > 0 && (
            <div style={{ position: "absolute", left: 14, top: 14, transform: `scale(${kAi})`, transformOrigin: "0 0", display: "flex", alignItems: "center", gap: 7, padding: "9px 16px 9px 12px", borderRadius: 99, background: isHalf && slam > 0.5 ? ON : "rgba(255,255,255,.95)", boxShadow: "0 4px 14px rgba(0,0,0,.35)" }}>
              <Ico n="sparkle" s={25} c={isHalf && slam > 0.5 ? "#fff" : OR} fill />
              <span style={{ fontFamily: UI, fontWeight: 800, fontSize: 28, color: isHalf && slam > 0.5 ? "#fff" : C.ink }}>AI</span>
            </div>
          )}
          {kV > 0 && (
            <div style={{ position: "absolute", left: 14, bottom: 16, transform: `scale(${kV})`, transformOrigin: "0 100%", display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 99, background: "rgba(0,0,0,.62)" }}>
              <Ico n="play" s={18} c="#fff" fill />
              <span style={{ fontFamily: UI, fontWeight: 800, fontSize: 24, color: "#fff" }}>{VIEWS[vi]}</span>
            </div>
          )}
          {isGirl && reC > 0 && (
            <>
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 50%, transparent ${lerp(246, 120, ease.io(ramp(t, 7.0, 7.42)))}px, ${C.dark} ${lerp(247, 121, ease.io(ramp(t, 7.0, 7.42)))}px)`, opacity: ramp(t, 7.0, 7.1) }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: 18, boxShadow: "inset 0 0 0 6px #fff", opacity: ramp(t, 6.45, 6.7) * (1 - ramp(t, 6.95, 7.05)) }} />
              <svg width={TW} height={TH} style={{ position: "absolute", inset: 0, opacity: ramp(t, 6.95, 7.05) }}>
                <circle cx={TW / 2} cy={TH / 2} r={lerp(246, 120, ease.io(ramp(t, 7.0, 7.42))) - 1} fill="none" stroke="#fff" strokeWidth={5} />
              </svg>
            </>
          )}
        </div>,
      );
    }
  }
  return (
    <Full style={{ background: C.dark, clipPath: t >= 7.55 ? holePath(HX, HY, rHole) : undefined, opacity: 1 - 0.55 * ramp(t, 7.68, 7.93) }}>
      <div style={{ position: "absolute", inset: 0, perspective: 1700, perspectiveOrigin: `${HX}px ${HY - 160}px`, filter: `brightness(${lerp(1.42, 1.18, slam)}) contrast(1.04) saturate(1.12)` }}>
        {mb > 0.3 && <svg width={0} height={0} style={{ position: "absolute" }}><filter id="a-vblur" x="0" y="-2%" width="100%" height="104%"><feGaussianBlur stdDeviation={`0 ${mb.toFixed(2)}`} /></filter></svg>}
        <div style={{ position: "absolute", left: HX + shx, top: HY + shy, width: PX * 8, height: COPY * 2, transformOrigin: "0 0", transform: `scale(${z}) rotateX(${rx}deg) rotateZ(${rz}deg) translate(${-cx}px, ${-cy}px)`, filter: mb > 0.3 ? "url(#a-vblur)" : undefined }}>
          {[0, 1].map((c) => (
            <div key={c} style={{ position: "absolute", left: 0, top: c * COPY, width: 2032, height: 2636 }}>
              <Clip src="hook.mp4" t0={0} dur={8.2} />
            </div>
          ))}
          {tiles}
        </div>
      </div>
      {/* sheen + vignette */}
      <Full style={{ background: `linear-gradient(${115 + t * 6}deg, rgba(255,255,255,0) 30%, rgba(255,255,255,${0.07 * (1 - reC)}) 46%, rgba(255,255,255,0) 60%)` }} />
      <Full style={{ background: `radial-gradient(ellipse 80% 60% at 50% 46%, rgba(11,11,13,0) 40%, rgba(11,11,13,${0.06 + 0.2 * slam + 0.28 * reC}) 100%)` }} />
      {/* the Explore search bar */}
      {searchOut < 1 && (
        <div style={{ position: "absolute", left: 48, top: 150 - searchOut * 220, width: 984, height: 108, display: "flex", gap: 18, opacity: 1 - searchOut }}>
          <div style={{ flex: 1, borderRadius: 30, background: "rgba(38,38,42,.82)", border: "1.5px solid rgba(255,255,255,.10)", display: "flex", alignItems: "center", gap: 22, padding: "0 34px", direction: "rtl", boxShadow: "0 20px 50px rgba(0,0,0,.45)" }}>
            <Ico n="search" s={44} c="rgba(255,255,255,.75)" w={2.4} />
            {t < 1.2 ? (
              <>
                <div style={{ width: 3, height: 46, marginLeft: -12, background: ON, opacity: Math.floor(t * 2.5) % 2 ? 0 : 1 }} />
                <Fx s={40} w={500} c="rgba(255,255,255,.62)" style={{ marginRight: -14 }}>جستجو</Fx>
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", direction: "ltr" }}>
                <Lx s={42} w={600} c="#fff">{"ai video".slice(0, Math.round(8 * ramp(t, 1.25, 1.95)))}</Lx>
                <div style={{ width: 3, height: 46, marginLeft: 4, background: ON, opacity: t < 1.95 || Math.floor(t * 2.5) % 2 ? 1 : 0 }} />
              </div>
            )}
            <div style={{ flex: 1 }} />
            {t > 1.95 && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 99, background: "rgba(255,122,61,.18)", transform: `scale(${pop(t, 1.98, 0.35)})`, direction: "ltr" }}><Lx s={26} w={700} c={ON}>{kfmt(lerp(0, 3800000, ease.out(ramp(t, 1.98, 2.9))))}+</Lx><Lx s={24} w={500} c="rgba(255,255,255,.6)">reels</Lx></div>}
          </div>
          <div style={{ width: 108, height: 108, borderRadius: 30, background: "rgba(38,38,42,.82)", border: "1.5px solid rgba(255,255,255,.10)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + 0.12 * hit(t, S(0), 0.3)})` }}>
            <IgGlyph s={62} />
          </div>
        </div>
      )}
      {/* 50% gauge */}
      {gA > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: gA, transform: `scale(${1 + gOut * 0.35})`, transformOrigin: `${GX0}px ${GY0}px` }}>
          <Full style={{ background: `radial-gradient(circle at ${GX0}px ${GY0 + 80}px, rgba(11,11,13,.58) 0px, rgba(11,11,13,.4) 400px, rgba(11,11,13,.08) 820px)` }} />
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <circle cx={GX0} cy={GY0} r={GR + 78} fill="none" stroke="rgba(255,255,255,.14)" strokeWidth={2} strokeDasharray="3 15" transform={`rotate(${t * 14} ${GX0} ${GY0})`} />
            {Array.from({ length: 72 }, (_, i) => {
              const a = (i / 72) * Math.PI * 2 - Math.PI / 2;
              const on = i / 72 < arc * 0.5;
              const r1 = GR + 30, r2 = GR + (i % 6 === 0 ? 58 : 46);
              return <line key={i} x1={GX0 + Math.cos(a) * r1} y1={GY0 + Math.sin(a) * r1} x2={GX0 + Math.cos(a) * r2} y2={GY0 + Math.sin(a) * r2} stroke={on ? ON : "rgba(255,255,255,.28)"} strokeWidth={i % 6 === 0 ? 5 : 3} strokeLinecap="round" />;
            })}
            <circle cx={GX0} cy={GY0} r={GR} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth={16} />
            <circle cx={GX0} cy={GY0} r={GR} fill="none" stroke={ON} strokeWidth={16} strokeLinecap="round" strokeDasharray={`${Math.PI * GR * arc} ${Math.PI * 2 * GR}`} transform={`rotate(-90 ${GX0} ${GY0})`} />
            {arc > 0.02 && <circle cx={GX0 + Math.cos(-Math.PI / 2 + Math.PI * arc) * GR} cy={GY0 + Math.sin(-Math.PI / 2 + Math.PI * arc) * GR} r={17} fill="#fff" stroke={ON} strokeWidth={6} />}
            {[["0", 0], ["25", 1], ["50", 2], ["75", 3]].map(([l, q]) => {
              const a = (Number(q) / 4) * Math.PI * 2 - Math.PI / 2;
              return <text key={l} x={GX0 + Math.cos(a) * (GR + 92)} y={GY0 + Math.sin(a) * (GR + 92) + 9} textAnchor="middle" fontFamily={MONO_F} fontWeight={600} fontSize={26} fill={Number(q) <= 2 * arc ? ON : "rgba(255,255,255,.45)"}>{l}</text>;
            })}
          </svg>
          <div style={{ position: "absolute", left: 0, width: 1080, top: GY0 - 150, display: "flex", justifyContent: "center", alignItems: "flex-start", transform: `scale(${lerp(1.6, 1, ease.out(ramp(t, tS - 0.02, tS + 0.3))) + 0.05 * hit(t, S(9), 0.3)})`, transformOrigin: `540px 150px` }}>
            <Odo v={n50} s={250} c="#fff" dw={0.66} sep={false} />
            <div style={{ fontFamily: NUM, fontWeight: 700, fontSize: 170, color: ON, lineHeight: 1, marginTop: 66, marginLeft: 6 }}>%</div>
          </div>
          {kLine > 0 && (
            <Fx s={46} w={800} c="#fff" style={{ position: "absolute", left: 0, width: 1080, top: GY0 + 112, textAlign: "center", opacity: kLine * 0.92, transform: `translateY(${(1 - kLine) * 20}px)` }}>از ویدیوهای میلیونی</Fx>
          )}
          {/* view-count receipts flying out of the framed tiles */}
          {[["12M", -330, 0], ["4.3M", 0, 1], ["18M", 330, 2]].map(([v, dx, j]) => {
            const t0 = S(9) + (j as number) * 0.14;
            const k = t < t0 ? 0 : ease.back(ramp(t, t0, t0 + 0.4), 1.5);
            if (k <= 0) return null;
            return (
              <div key={v as string} style={{ position: "absolute", left: GX0 + (dx as number) - 150, top: GY0 + GR + 110 + (1 - clamp(k)) * 160 + Math.sin(t * 2.4 + (j as number)) * 6, width: 300, display: "flex", justifyContent: "center", opacity: clamp(k * 2), transform: `scale(${clamp(k, 0, 1.2)}) rotate(${((j as number) - 1) * -4}deg)` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 28px 16px 20px", borderRadius: 22, background: "rgba(22,22,26,.94)", border: "1.5px solid rgba(255,255,255,.12)", boxShadow: "0 16px 40px rgba(0,0,0,.5)", direction: "ltr" }}>
                  <div style={{ width: 46, height: 46, borderRadius: 23, background: ON, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico n="play" s={26} c="#fff" fill /></div>
                  <div>
                    <Lx s={46} w={800} c="#fff" style={{ letterSpacing: -1 }}>{v as string}</Lx>
                    <Mono s={15} c="rgba(255,255,255,.5)" ls={3} style={{ marginTop: 4 }}>VIEWS</Mono>
                  </div>
                </div>
              </div>
            );
          })}
          {kAI > 0 && (
            <div style={{ position: "absolute", left: GX0 + 150, top: GY0 + 150, transform: `rotate(-8deg) scale(${kAI})`, transformOrigin: "30% 50%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 40px 20px 32px", borderRadius: 999, background: ON, boxShadow: "0 18px 50px rgba(255,122,61,.45), 0 4px 10px rgba(0,0,0,.4)" }}>
                <Ico n="sparkle" s={64} c="#fff" fill />
                <span style={{ fontFamily: UI, fontWeight: 900, fontSize: 88, color: "#fff", letterSpacing: -2 }}>AI</span>
              </div>
            </div>
          )}
        </div>
      )}
      {/* hand-off: her REAL reel (exactly where S2's phone screen will be) fades in inside the closing circle */}
      {t >= 7.05 && (
        <div style={{ position: "absolute", left: SX0, top: SY0, width: RW, height: RH, opacity: ramp(t, 7.05, 7.32), clipPath: `circle(${lerp(430, R0, ease.io(ramp(t, 7.05, 7.42)))}px at ${HX - SX0}px ${HY - SY0}px)` }}>
          <RClip src="ig-real.mp4" t0={7.1} dur={1} from={0} />
        </div>
      )}
      {t >= 7.2 && (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: ramp(t, 7.2, 7.4) }}>
          <circle cx={HX} cy={HY} r={lerp(430, R0, ease.io(ramp(t, 7.05, 7.42))) + 4} fill="none" stroke="#fff" strokeWidth={5} />
        </svg>
      )}
      {t >= 7.55 && (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <circle cx={HX} cy={HY} r={rHole + 5} fill="none" stroke={ON} strokeWidth={8} opacity={1 - ramp(t, 7.75, 7.93)} />
        </svg>
      )}
    </Full>
  );
};
const MONO_F = "Chakra";

// ═════════════ S2 · the AI character's REAL Instagram (the user's screen recordings) (7.55 – 16.5) ═════════════
// ig-real.mp4 / ig-site.mp4 are 384×848 iOS recordings of @dahliamartinx, shown at 1.5× inside a phone (upscale cap ≈1.6×).
const RS = 1.5, RW = 384 * RS, RH = 848 * RS; // 576 × 1272 screen
const SX0 = 252, SY0 = 170; // screen top-left at home
type Seg = { a: number; b: number; src?: string; from?: number; rate?: number; img?: string };
const IG_SEGS: Seg[] = [
  { a: 7.1, b: 8.1, src: "ig-real.mp4", from: 0 }, // the transition reel (hand sweeps → her face); the iris opens on it
  { a: 8.1, b: 9.4, src: "ig-real.mp4", from: 5.3 }, // the real back-swipe into her profile, which loads
  { a: 9.4, b: 11.08, src: "ig-real.mp4", from: 1.6 }, // her red reel: the AI face
  { a: 11.08, b: 11.95, src: "ig-real.mp4", from: 7.45, rate: 3 }, // thumb-scroll through her reels grid (3×)
  { a: 11.95, b: 12.33, src: "ig-real.mp4", from: 18.75, rate: 2 }, // the real flick back to the top
  { a: 12.33, b: 16.6, img: "a/ig-hold.jpg" }, // header hold (last frame of the recording)
];
const SegView: React.FC<{ t: number; segs: Seg[] }> = ({ t, segs }) => {
  const s = segs.find((g) => t >= g.a && t < g.b);
  if (!s) return null;
  if (s.img) return <Img src={v23(s.img)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block", maxWidth: "none" }} />;
  return <div style={{ position: "absolute", inset: 0 }}><RClip src={s.src!} t0={s.a} dur={s.b - s.a} from={s.from} rate={s.rate} /></div>;
};
/** a realistic phone body around a screen of w×h whose top-left is (sx, sy) */
const PhoneBody: React.FC<{ sx: number; sy: number; w: number; h: number; children?: React.ReactNode }> = ({ sx, sy, w, h, children }) => {
  const b = 18, W = w + 2 * b, Hh = h + 2 * b;
  return (
    <>
      <div style={{ position: "absolute", left: sx - b + 40, top: sy + h - 40, width: W - 80, height: 120, borderRadius: "50%", background: "rgba(20,20,30,.28)", filter: "blur(40px)" }} />
      {[[-0.012, 0.19, 0.05], [-0.012, 0.27, 0.09], [-0.012, 0.38, 0.09], [1.002, 0.29, 0.13]].map(([fx, fy, fh], i) => (
        <div key={i} style={{ position: "absolute", left: sx - b + fx * W, top: sy - b + fy * Hh, width: W * 0.012, height: fh * Hh, borderRadius: 3, background: "#2A2A30" }} />
      ))}
      <div style={{ position: "absolute", left: sx - b, top: sy - b, width: W, height: Hh, borderRadius: 90, background: "linear-gradient(135deg,#46474D,#111114 26%,#0B0B0E 70%,#36373D)", boxShadow: "0 60px 120px rgba(10,10,20,.32), 0 14px 34px rgba(10,10,20,.22), inset 0 0 0 2px #55565C" }} />
      <div style={{ position: "absolute", left: sx, top: sy, width: w, height: h, borderRadius: 72, overflow: "hidden", background: "#000" }}>{children}</div>
    </>
  );
};
const RTag: React.FC<{ k: number; children?: React.ReactNode; style?: P }> = ({ k, children, style }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 18px 9px 14px", borderRadius: 99, background: "rgba(22,23,26,.92)", boxShadow: "0 10px 30px rgba(0,0,0,.3)", transform: `scale(${k})`, ...style }}>{children}</div>
);

export const S2Page: React.FC<SP> = ({ t }) => {
  if (t < 7.55 || t > 16.5) return null;
  // phone placement: home → left for the two callouts → home → up for the website → whip out
  const kL = ease.io(ramp(t, 10.98, 11.36)) * (1 - ease.io(ramp(t, 13.9, 14.28)));
  const kUp = ease.io(ramp(t, 14.5, 14.95));
  const whip = ease.in(ramp(t, 15.98, 16.32));
  const dx = -150 * kL - 1400 * whip;
  const dy = Math.sin(t * 1.3) * 6 - 210 * kUp;
  const push = 1 + 0.04 * ease.io(ramp(t, 8.3, 9.3)) * (1 - ramp(t, 9.3, 9.42)) + 0.035 * hit(t, S(24), 0.4);
  const sx = SX0 + dx, sy = SY0 + dy; // (approximate, push ignored) screen origin for absolute overlays
  const R = (x: number, y: number) => [sx + x * RS, sy + y * RS];
  // beats
  const kHandle = ease.out(ramp(t, S(18), S(18) + 0.35)) * (1 - ramp(t, 9.32, 9.4));
  const kFace = ease.out(ramp(t, S(22) - 0.08, S(22) + 0.25)) * (1 - ramp(t, 11.0, 11.08));
  const scan = ramp(t, S(25) - 0.02, S(25) + 0.55);
  const kAI = pop(t, S(24) - 0.04, 0.42) * (1 - ease.in(ramp(t, 10.95, 11.15)));
  const posts = 20 * ease.out(ramp(t, S(27) - 0.02, 11.58));
  const k20 = ease.out(ramp(t, S(27) - 0.06, S(27) + 0.3)) * (1 - ease.in(ramp(t, 12.06, 12.26)));
  const fk = ease.io(ramp(t, S(30), E(31)));
  const k90 = ease.out(ramp(t, S(30) - 0.02, S(30) + 0.35)) * (1 - ease.in(ramp(t, 13.72, 13.95)));
  const spot = ease.out(ramp(t, 12.3, 12.55)) * (1 - ramp(t, 13.75, 13.95));
  const kSite = ease.out(ramp(t, 14.45, 14.82));
  const kProd = ease.out(ramp(t, S(39) - 0.05, S(39) + 0.3));
  const tN = (j: number) => S(40) + 0.12 + j * 0.27;
  const orders = 126 + [0, 1, 2].filter((j) => t >= tN(j)).length;
  const kOrd = ease.back(ramp(t, S(40) - 0.1, S(40) + 0.3), 1.3) * (1 - whip);
  // the 93.8K box (rec coords → screen) and the 90K card
  const [, by0] = R(178, 126), [bx1, by1] = R(252, 176);
  return (
    <Full style={{ filter: whip > 0 ? `blur(${whip * 16}px)` : undefined }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${dx}px, ${dy}px) rotate(${Math.sin(t * 0.9) * 0.5}deg) scale(${push})`, transformOrigin: `${SX0 + RW / 2}px ${SY0 + RH / 2}px` }}>
        <PhoneBody sx={SX0} sy={SY0} w={RW} h={RH}>
          <SegView t={t} segs={IG_SEGS} />
          {/* «پیج این خانومه»: handle underline + avatar pulse (rec coords ×1.5) */}
          {kHandle > 0 && t > 8.3 && <div style={{ position: "absolute", left: 65 * RS, top: 86 * RS, width: 114 * RS * kHandle, height: 6, borderRadius: 3, background: ON }} />}
          {t > S(20) - 0.1 && t < S(20) + 1.1 && [0, 1].map((j) => {
            const k = ramp(t, S(20) - 0.1 + j * 0.28, S(20) + 0.6 + j * 0.28);
            return k > 0 && k < 1 ? <div key={j} style={{ position: "absolute", left: 53 * RS - 57 * (1.1 + k * 0.8), top: 150 * RS - 57 * (1.1 + k * 0.8), width: 114 * (1.1 + k * 0.8), height: 114 * (1.1 + k * 0.8), borderRadius: "50%", border: `${5 * (1 - k)}px solid ${ON}`, opacity: 1 - k }} /> : null;
          })}
          {/* «یک کاراکتر با AI ساخته»: face detection brackets + scan on her real reel */}
          {kFace > 0 && (
            <div style={{ position: "absolute", left: 104 * RS, top: 150 * RS, width: 186 * RS, height: 290 * RS, opacity: kFace, transform: `scale(${lerp(1.25, 1, kFace)})` }}>
              {[[0, 0, 0], [1, 0, 90], [1, 1, 180], [0, 1, 270]].map(([a, b, r], i) => (
                <div key={i} style={{ position: "absolute", left: a ? undefined : 0, right: a ? 0 : undefined, top: b ? undefined : 0, bottom: b ? 0 : undefined, width: 70, height: 70, transform: `rotate(${r}deg)`, borderTop: `6px solid ${ON}`, borderLeft: `6px solid ${ON}` }} />
              ))}
              {scan > 0 && scan < 1 && <div style={{ position: "absolute", left: 6, right: 6, top: `${scan * 100}%`, height: 160, marginTop: -160, background: "linear-gradient(180deg, rgba(255,122,61,0), rgba(255,122,61,.4))", borderBottom: `4px solid ${ON}`, boxShadow: `0 6px 20px ${ON}` }} />}
              <div style={{ position: "absolute", left: 0, top: -54, display: "flex", gap: 8 }}>
                <div style={{ padding: "7px 12px", borderRadius: 8, background: ON }}><Mono s={19} c="#fff" ls={2}>AI CHARACTER</Mono></div>
                {t > S(25) && <div style={{ padding: "7px 12px", borderRadius: 8, background: "rgba(0,0,0,.72)", transform: `scale(${pop(t, S(25), 0.3)})`, transformOrigin: "0 50%" }}><Mono s={19} c="#fff" ls={2}>{Math.round(99 * clamp(scan * 1.2))}%</Mono></div>}
              </div>
            </div>
          )}
          {/* «90 هزار فالوور»: spotlight on the REAL 93.8K */}
          {spot > 0 && (
            <div style={{ position: "absolute", left: 178 * RS, top: 126 * RS, width: 74 * RS, height: 50 * RS, borderRadius: 16, boxShadow: `0 0 0 2400px rgba(0,0,0,${0.5 * spot}), 0 0 0 ${5 * spot}px ${ON} inset`, transform: `scale(${1 + 0.08 * hit(t, E(31) - 0.05, 0.3)})` }} />
          )}
          {/* the website (IG in-app browser slides up) */}
          {kSite > 0 && (
            <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - kSite) * 100}%)`, boxShadow: "0 -20px 50px rgba(0,0,0,.5)" }}>
              <RClip src="ig-site.mp4" t0={14.45} dur={2.2} from={1.15} />
              {/* «محصول»: the upcoming product + Register Spot */}
              {kProd > 0 && (
                <>
                  <div style={{ position: "absolute", left: 36 * RS, top: 742 * RS, width: 312 * RS, height: 48 * RS, borderRadius: 14, boxShadow: `0 0 0 2400px rgba(0,0,0,${0.42 * kProd * (1 - ramp(t, S(40) + 0.05, S(40) + 0.3))}), inset 0 0 0 ${5 * kProd}px ${ON}` }} />
                  <div style={{ position: "absolute", left: 268 * RS, top: 670 * RS, width: 104 * RS, height: 60 * RS, borderRadius: 12, boxShadow: `inset 0 0 0 ${4 * kProd}px ${ON}` }} />
                </>
              )}
              {/* iOS order notifications (inside her phone) */}
              {[0, 1, 2].map((i) => {
                const k = t < tN(i) ? 0 : ease.back(ramp(t, tN(i), tN(i) + 0.42), 1.2);
                if (k <= 0) return null;
                let depth = 0;
                for (let j = i + 1; j < 3; j++) depth += ease.out(ramp(t, tN(j), tN(j) + 0.3));
                return (
                  <div key={i} style={{ position: "absolute", left: 18, top: lerp(-160, 196, k) + depth * 16, width: 1000, transformOrigin: "0 0", transform: `scale(${0.54 * (1 - depth * 0.05)})`, zIndex: 10 + i, filter: `brightness(${1 - depth * 0.07})` }}>
                    <Notif
                      title={<>سفارش جدید <span style={{ direction: "ltr", unicodeBidi: "isolate", fontFamily: UI, fontWeight: 700, fontSize: 30, color: "#8a8a8e" }}>#{1042 + i}</span></>}
                      body={["پیش‌خرید محصول تازه‌ات ثبت شد", "یک نفر دیگه هم پیش‌خرید کرد", "ظرفیت پیش‌فروش داره پر میشه"][i]}
                      icon={<div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg,#FF8A4C,#E2501A)", display: "flex", alignItems: "center", justifyContent: "center" }}><AIco n="bag" s={60} c="#fff" w={2.2} /></div>}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </PhoneBody>
      </div>
      {/* proof label */}
      {t < 15.9 && (() => {
        const k = ease.out(ramp(t, 7.95, 8.3)) * (1 - ramp(t, 14.4, 14.6));
        return k > 0 ? (
          <div style={{ position: "absolute", left: 0, width: 1080, top: 84 + dy * 0.3, display: "flex", justifyContent: "center", opacity: k }}>
            <RTag k={1}>
              <div style={{ width: 12, height: 12, borderRadius: 6, background: ON, opacity: Math.floor(t * 2.5) % 2 ? 0.35 : 1 }} />
              <Mono s={20} c="#fff" ls={3}>REAL SCREEN RECORDING</Mono>
              <IgGlyph s={30} c="#fff" />
            </RTag>
          </div>
        ) : null;
      })()}
      {/* «✦ AI» slam beside her face */}
      {kAI > 0 && (
        <div style={{ position: "absolute", left: sx + 548, top: R(0, 300)[1], transform: `rotate(-7deg) scale(${kAI})`, transformOrigin: "0 50%", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 34px 18px 26px", borderRadius: 999, background: ON, boxShadow: "0 18px 50px rgba(255,122,61,.4), 0 4px 10px rgba(0,0,0,.25)" }}>
            <Ico n="sparkle" s={54} c="#fff" fill />
            <span style={{ fontFamily: UI, fontWeight: 900, fontSize: 76, color: "#fff", letterSpacing: -2 }}>AI</span>
          </div>
          <div style={{ marginTop: 12, marginLeft: 10, padding: "6px 18px", borderRadius: 99, background: C.ink }}><Fx s={30} w={800} c="#fff">کاراکتر ساختگی</Fx></div>
        </div>
      )}
      {/* «20 ریلز» */}
      {k20 > 0 && (
        <div style={{ position: "absolute", left: 640, top: 560, width: 410, borderRadius: 40, background: "#fff", padding: "34px 34px 38px", boxShadow: "0 2px 4px rgba(0,0,0,.06), 0 24px 60px rgba(20,20,30,.18), 0 60px 140px rgba(20,20,30,.16)", opacity: clamp(k20 * 2), transform: `translateX(${(1 - k20) * 160}px) scale(${lerp(0.9, 1, k20)})` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Mono s={21} c={C.ink3}>REELS</Mono>
            <AIco n="reels" s={38} c={OR} w={2.2} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 4, transform: `scale(${1 + 0.07 * hit(t, 11.58, 0.3)})` }}>
            <Odo v={posts} s={250} c={C.ink} dw={0.66} sep={false} />
          </div>
          <Fx s={110} w={900} c={OR} style={{ textAlign: "center", marginTop: -26 }}>ریلز</Fx>
          <div style={{ display: "flex", gap: 5, marginTop: 16, direction: "rtl" }}>
            {Array.from({ length: 20 }, (_, i) => <div key={i} style={{ flex: 1, height: 16, borderRadius: 4, background: posts >= i + 0.5 ? OR : "#ECEAE4" }} />)}
          </div>
        </div>
      )}
      {/* «90K فالوور» with a leader from the real 93.8K */}
      {k90 > 0 && (
        <>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: clamp(k90 * 2) }}>
            <path d={`M${bx1} ${(by0 + by1) / 2} C ${bx1 + 120} ${(by0 + by1) / 2}, 560 520, 640 ${520}`} fill="none" stroke={ON} strokeWidth={5} strokeDasharray={`${1200 * k90} 2000`} strokeLinecap="round" />
            <circle cx={bx1} cy={(by0 + by1) / 2} r={9} fill={ON} />
          </svg>
          <div style={{ position: "absolute", left: 640, top: 430, width: 410, borderRadius: 40, background: "#fff", padding: "34px 34px 34px", boxShadow: "0 2px 4px rgba(0,0,0,.06), 0 24px 60px rgba(20,20,30,.18), 0 60px 140px rgba(20,20,30,.16)", opacity: clamp(k90 * 2), transform: `translateX(${(1 - k90) * 160}px) scale(${lerp(0.9, 1, k90)})` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Mono s={21} c={C.ink3}>FOLLOWERS</Mono>
              <div style={{ width: 14, height: 14, borderRadius: 7, background: ON }} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", direction: "ltr", marginTop: 4, transform: `scale(${1 + 0.07 * hit(t, E(31), 0.3)})` }}>
              <Odo v={90 * fk} s={160} c={C.ink} dw={0.66} sep={false} />
              <div style={{ fontFamily: NUM, fontWeight: 700, fontSize: 160, lineHeight: 1.3, color: C.ink, opacity: ramp(fk, 0.05, 0.2) }}>K</div>
            </div>
            <Fx s={100} w={900} c={OR} style={{ textAlign: "center", marginTop: -24 }}>فالوور</Fx>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 14 }}>
              {[38, 39, 40, 41, 43, 44].map((n, i) => (
                <div key={n} style={{ width: 52, height: 52, marginLeft: i ? -14 : 0, borderRadius: 26, overflow: "hidden", border: "3px solid #fff", boxShadow: "0 4px 10px rgba(0,0,0,.15)", transform: `scale(${pop(t, S(30) + 0.12 + i * 0.09, 0.3)})` }}>
                  <Img src={still(n)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", maxWidth: "none" }} />
                </div>
              ))}
            </div>
            <Fx s={28} w={600} c={C.ink3} style={{ textAlign: "center", marginTop: 10 }}>فقط با 20 ریلز</Fx>
          </div>
        </>
      )}
      {/* taps (screen-recording style) */}
      <Touch t={t} t0={S(37)} x={R(92, 290)[0]} y={R(92, 290)[1]} dark />
      <Touch t={t} t0={S(40)} x={R(320, 700)[0]} y={R(320, 700)[1]} dark />
      {/* pre-orders counter */}
      {kOrd > 0 && (
        <div style={{ position: "absolute", left: 690, top: 260, width: 350, borderRadius: 30, background: "#fff", padding: "22px 26px", boxShadow: "0 2px 4px rgba(0,0,0,.06), 0 24px 60px rgba(20,20,30,.2)", transform: `translateX(${(1 - clamp(kOrd)) * 220}px) rotate(${(1 - clamp(kOrd)) * 6}deg)`, opacity: clamp(kOrd * 2), direction: "rtl" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 50, height: 50, borderRadius: 16, background: "rgba(242,92,31,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><AIco n="bag" s={30} c={OR} w={2.4} /></div>
            <Fx s={32} w={800} c={C.ink}>پیش‌فروش امروز</Fx>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 8 }}>
            <div style={{ transform: `scale(${1 + 0.1 * Math.max(...[0, 1, 2].map((j) => hit(t, tN(j), 0.3)))})`, transformOrigin: "100% 100%" }}><Lx s={64} w={800} c={C.ink} style={{ letterSpacing: -1.5 }}>{orders}</Lx></div>
            <div style={{ padding: "5px 12px", borderRadius: 99, background: OR }}><Lx s={22} w={800} c="#fff">+{orders - 126}</Lx></div>
          </div>
        </div>
      )}
    </Full>
  );
};

// ═════════════ S3 · the REAL YouTube channel recording: 12 days, 23K (16.1 – 21.75) ═════════════
// yt-real.mp4 is 552×944 (YouTube web in a narrow window) → shown 1.55× in a dark browser window.
const YS = 1.55, YW = 552 * YS, YH = 944 * YS, BX = 112, BY = 140, BCH = 96, YCY = BY + BCH;
const YT_SEGS: Seg[] = [
  { a: 16.05, b: 18.3, src: "yt-real.mp4", from: 0.2 }, // channel header
  { a: 18.3, b: 19.3, src: "yt-real.mp4", from: 3.9, rate: 3 }, // fast scroll through their animated shorts
  { a: 19.3, b: 19.62, src: "yt-real.mp4", from: 11.9, rate: 2 }, // the real flick back up
  { a: 19.62, b: 21.27, src: "yt-real.mp4", from: 12.55 }, // header settled
  { a: 21.27, b: 21.8, img: "a/yt-hold.jpg" }, // last frame hold
];
const UPLOADS = [1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 2]; // 10 videos in 12 days (as in the real header)
export const S3YouTube: React.FC<SP> = ({ t, frame }) => {
  if (t < 16.1 || t > 21.75) return null;
  const kIn = ease.out(ramp(t, 16.1, 16.46));
  const gOut = ramp(t, 21.36, 21.72);
  const g = gOut > 0 && gOut < 1;
  const jx = g ? (rnd(frame * 1.7) - 0.5) * 120 * gOut : 0;
  const subs = 23000 * ease.out(ramp(t, S(53) - 0.04, S(54)));
  const kCard = ease.out(ramp(t, S(46) - 0.14, S(46) + 0.28));
  const days = 12 * ease.out(ramp(t, S(46), E(46)));
  const kBars = ease.io(ramp(t, S(52) - 0.05, S(54) + 0.1));
  const swap = ease.io(ramp(t, S(52) - 0.08, S(52) + 0.2));
  const kFlag = pop(t, S(49) - 0.04, 0.4) * (1 - swap);
  const spot = ease.out(ramp(t, 19.6, 19.86));
  const Y = (x: number, y: number) => [BX + x * YS, YCY + y * YS];
  const [hx0, hy0] = Y(122, 142), [hx1, hy1] = Y(246, 171);
  const CTOP = 828, CH = 440;
  const cellB = CH - 30;
  return (
    <Full style={{ opacity: 1 - ease.in(ramp(t, 21.55, 21.72)), filter: kIn < 1 ? `blur(${(1 - kIn) * 14}px)` : undefined }}>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - kIn) * 1300 + jx}px) translateY(${Math.sin(t * 1.2) * 5}px) skewX(${g ? (rnd(frame) - 0.5) * 14 * gOut : 0}deg)`, filter: g ? `hue-rotate(${gOut * 40}deg) contrast(${1 + gOut * 0.6})` : undefined }}>
        {/* browser window */}
        <div style={{ position: "absolute", left: BX + 40, top: BY + YH + BCH - 60, width: YW - 80, height: 120, borderRadius: "50%", background: "rgba(20,20,30,.3)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", left: BX, top: BY, width: YW, height: YH + BCH, borderRadius: 26, overflow: "hidden", background: "#0F0F0F", boxShadow: "0 60px 120px rgba(10,10,20,.35), 0 14px 34px rgba(10,10,20,.22), 0 0 0 1.5px rgba(255,255,255,.08)" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: YW, height: BCH, background: "#202124" }}>
            <div style={{ position: "absolute", left: 22, top: 17, display: "flex", gap: 9 }}>{["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}</div>
            <div style={{ position: "absolute", left: 104, top: 8, width: 360, height: 40, borderRadius: "12px 12px 0 0", background: "#35363A", display: "flex", alignItems: "center", gap: 10, padding: "0 14px" }}>
              <YtMark s={22} />
              <Lx s={19} w={500} c="#E8EAED">Day One Films - YouTube</Lx>
              <div style={{ flex: 1 }} />
              <AIco n="x" s={16} c="#9AA0A6" w={2.4} />
            </div>
            <div style={{ position: "absolute", left: 480, top: 18, color: "#9AA0A6" }}><Ico n="plus" s={20} c="#9AA0A6" w={2.4} /></div>
            <div style={{ position: "absolute", left: 0, top: 48, width: YW, height: 48, background: "#35363A", display: "flex", alignItems: "center", gap: 16, padding: "0 16px" }}>
              <AIco n="back" s={22} c="#9AA0A6" w={2.2} />
              <AIco n="backR" s={22} c="#5F6368" w={2.2} />
              <div style={{ flex: 1, height: 34, borderRadius: 17, background: "#202124", display: "flex", alignItems: "center", gap: 10, padding: "0 16px" }}>
                <Ico n="lock" s={16} c="#9AA0A6" w={2.2} />
                <Lx s={19} w={500} c="#E8EAED">youtube.com/<span style={{ color: "#9AA0A6" }}>@dayonefilmsofficial/videos</span></Lx>
              </div>
              <Dots s={22} c="#9AA0A6" v />
            </div>
          </div>
          <div style={{ position: "absolute", left: 0, top: BCH, width: YW, height: YH }}>
            <SegView t={t} segs={YT_SEGS} />
            {/* spotlight on the REAL "23.9K subscribers" */}
            {spot > 0 && <div style={{ position: "absolute", left: 122 * YS, top: 142 * YS, width: 124 * YS, height: 29 * YS, borderRadius: 12, boxShadow: `0 0 0 2400px rgba(0,0,0,${0.42 * spot}), inset 0 0 0 ${5 * spot}px ${ON}`, transform: `scale(${1 + 0.08 * hit(t, S(54), 0.3)})` }} />}
          </div>
        </div>
        <Touch t={t} t0={S(56)} x={Y(268, 287)[0]} y={Y(268, 287)[1]} dark />
        {t > S(56) + 0.05 && t < S(56) + 1 && (
          <div style={{ position: "absolute", left: hx1 + 18, top: hy0 - 10 - ease.out(ramp(t, S(56) + 0.05, S(56) + 0.9)) * 60, opacity: 1 - ramp(t, S(56) + 0.6, S(56) + 0.95) }}>
            <Lx s={46} w={800} c={ON}>+1</Lx>
          </div>
        )}
        {/* leader from the real count to the Studio card */}
        {spot > 0 && kCard > 0 && (
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <path d={`M${(hx0 + hx1) / 2} ${hy1} C ${(hx0 + hx1) / 2} ${hy1 + 200}, 200 ${CTOP - 120}, 220 ${CTOP + 40}`} fill="none" stroke={ON} strokeWidth={5} strokeDasharray={`${900 * spot} 2000`} strokeLinecap="round" />
            <circle cx={(hx0 + hx1) / 2} cy={hy1} r={8} fill={ON} />
          </svg>
        )}
        {/* Studio card: 12 days → 23K */}
        {kCard > 0 && (
          <div style={{ position: "absolute", left: 50, top: CTOP, width: 980, height: CH, borderRadius: 40, background: "#fff", boxShadow: "0 30px 90px rgba(0,0,0,.4), 0 6px 18px rgba(0,0,0,.18)", transform: `translateY(${(1 - kCard) * 700}px)`, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 40, right: 40, top: 30, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <YtMark s={42} />
                <Lx s={28} w={700} c={C.ink}>Studio</Lx>
                <Mono s={19} c={C.ink3} ls={3} style={{ marginLeft: 8 }}>{swap < 0.5 ? "CHANNEL AGE" : "SUBSCRIBERS"}</Mono>
              </div>
              <Fx s={32} w={800} c={C.ink2}>{swap < 0.5 ? "از شروع کانال" : "مشترک‌های کانال"}</Fx>
            </div>
            {/* phase 1 · 12 days */}
            <div style={{ position: "absolute", right: 40, top: 70, display: "flex", alignItems: "flex-end", gap: 22, direction: "rtl", opacity: 1 - swap, transform: `translateY(${-swap * 50}px)` }}>
              <div style={{ transform: `scale(${1 + 0.07 * hit(t, S(47), 0.3)})` }}><Odo v={days} s={150} c={C.ink} sep={false} dw={0.66} /></div>
              <Fx s={84} w={900} c={OR} style={{ paddingBottom: 26 }}>روز</Fx>
            </div>
            <div style={{ position: "absolute", left: 40, top: 92, opacity: 1 - swap }}>
              <Mono s={20} c={C.ink3} ls={3}>DAY 1 → DAY 12</Mono>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                <AIco n="film2" s={24} c={OR} w={2} />
                <Mono s={20} c={C.ink} ls={3}>{UPLOADS.slice(0, Math.max(0, Math.round(days))).reduce((a, b) => a + b, 0)} VIDEOS</Mono>
              </div>
            </div>
            {UPLOADS.map((n, i) =>
              Array.from({ length: n }, (_, j) => {
                const tt = S(46) + i * 0.055 + j * 0.05 + 0.04;
                const k = t < tt ? 0 : ease.back(ramp(t, tt, tt + 0.28), 1.6);
                if (k <= 0) return null;
                return (
                  <div key={`${i}-${j}`} style={{ position: "absolute", left: 40 + i * 76, top: cellB - 64 - 10 - (j + 1) * 42, width: 66, height: 37, borderRadius: 7, overflow: "hidden", transform: `scale(${clamp(k, 0, 1.2)})`, opacity: 1 - swap, boxShadow: "0 4px 10px rgba(0,0,0,.18)" }}>
                    <Img src={v23(`a/yt-t${((i * 2 + j) % 4) + 1}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", maxWidth: "none", display: "block" }} />
                  </div>
                );
              }),
            )}
            {/* phase 2 · 23K */}
            {swap > 0 && (
              <div style={{ position: "absolute", left: 40, top: 70, opacity: swap, transform: `translateY(${(1 - swap) * 50}px)`, display: "flex", alignItems: "flex-end", gap: 26, direction: "ltr" }}>
                <div style={{ display: "flex", alignItems: "flex-end", transform: `scale(${1 + 0.08 * hit(t, S(54), 0.3)})`, transformOrigin: "0 100%" }}>
                  <Odo v={subs / 1000} s={140} c={C.ink} sep={false} dw={0.66} />
                  <div style={{ fontFamily: NUM, fontWeight: 700, fontSize: 140, lineHeight: 1.3, color: C.ink, opacity: ramp(subs, 600, 1000) }}>K</div>
                </div>
                <Fx s={70} w={900} c={OR} style={{ paddingBottom: 26 }}>مشترک</Fx>
              </div>
            )}
            <svg width={980} height={CH} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
              {Array.from({ length: 12 }, (_, i) => {
                const x = 40 + i * 76, w = 64;
                const on = days > i + 0.5;
                const gg = Math.pow((i + 1) / 12, 2.6);
                const h = lerp(64, 64 + 150 * gg, kBars);
                const kOn = ease.out(ramp(t, S(46) + i * 0.055, S(46) + i * 0.055 + 0.2));
                return (
                  <g key={i}>
                    <rect x={x} y={cellB - h} width={w} height={h} rx={12} fill={on ? OR : "#F1F0EC"} opacity={on ? lerp(0.55, 1, kOn) : 1} />
                    <text x={x + w / 2} y={cellB - 21} textAnchor="middle" fontFamily={UI} fontWeight={800} fontSize={25} fill={on ? "#fff" : C.ink3}>{i + 1}</text>
                  </g>
                );
              })}
              {kBars > 0 && (() => {
                const pts = Array.from({ length: 12 }, (_, i) => [40 + i * 76 + 32, cellB - lerp(64, 64 + 150 * Math.pow((i + 1) / 12, 2.6), kBars) - 24]);
                const n = 1 + kBars * 11;
                const shown = pts.filter((_, i) => i <= n);
                const d = shown.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
                const hd = shown[shown.length - 1];
                return <g><path d={d} fill="none" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" /><circle cx={hd[0]} cy={hd[1]} r={10} fill="#fff" stroke={C.ink} strokeWidth={5} /></g>;
              })()}
            </svg>
            {kFlag > 0 && (
              <div style={{ position: "absolute", left: 40, top: 160, transform: `scale(${kFlag})`, transformOrigin: "20px 100px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 16px 9px 12px", borderRadius: 14, background: C.ink, direction: "rtl" }}>
                  <AIco n="flag" s={26} c={ON} w={2.4} />
                  <Fx s={26} w={800} c="#fff">شروع: اولین ویدیو</Fx>
                </div>
                <div style={{ width: 4, height: 40, marginLeft: 31, background: C.ink }} />
              </div>
            )}
          </div>
        )}
      </div>
      {g && <GlitchBars frame={frame} k={gOut} />}
    </Full>
  );
};
const GlitchBars: React.FC<{ frame: number; k: number }> = ({ frame, k }) => (
  <>
    {Array.from({ length: 9 }, (_, i) => {
      const y = rnd(frame * 3.1 + i * 7.7) * 1920, h = 8 + rnd(frame * 1.3 + i) * 90;
      const c = [ON, "#fff", "#000", ON, "#111"][i % 5];
      return <div key={i} style={{ position: "absolute", left: (rnd(i + frame) - 0.5) * 300, top: y, width: 1300, height: h, background: c, opacity: 0.35 + 0.6 * rnd(frame + i * 2.2) * Math.sin(k * Math.PI), mixBlendMode: i % 2 ? "normal" : "screen" }} />;
    })}
  </>
);

// ═════════════ S4 · fame & money → easier than before → the tools maze (21.5 – 31.65) ═════════════
const TOOLS = [
  { fa: "ساخت عکس", en: "GPT Image · Midjourney", ic: "image", r: 0 },
  { fa: "ساخت ویدیو", en: "Veo · Kling · Seedance", ic: "video", r: 1 },
  { fa: "صداگذاری", en: "ElevenLabs", ic: "mic", r: 2 },
  { fa: "موزیک", en: "Suno", ic: "music", r: 3 },
  { fa: "ادیت و انیمیشن", en: "Remotion · CapCut", ic: "scissors", r: 4 },
  { fa: "پرامپت‌نویسی", en: "Prompting", ic: "type", r: -1 },
  { fa: "لب‌سینک", en: "Lip-sync", ic: "lip", r: -1 },
  { fa: "کاراکتر ثابت", en: "Consistency", ic: "person", r: -1 },
  { fa: "حرکت دوربین", en: "Camera control", ic: "camera", r: -1 },
  { fa: "آپ‌اسکیل", en: "4K Upscale", ic: "hd", r: -1 },
  { fa: "زیرنویس", en: "Captions", ic: "cc", r: -1 },
  { fa: "رنگ و نور", en: "Color grading", ic: "grade", r: -1 },
];
const SLOTS = Array.from({ length: 12 }, (_, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  return [col ? 300 : 780, 200 + row * 192 + (col ? 70 : 0)].map((v, j) => v + (rnd(i * 4.1 + j) - 0.5) * 70).concat([(rnd(i * 9.7) - 0.5) * 26]);
});
const SWAPS = [S(79), S(81), S(82), S(84)];
const PERMS = (() => {
  const ps = [Array.from({ length: 12 }, (_, i) => (i * 5) % 12)];
  for (let k = 0; k < SWAPS.length; k++) {
    const p = ps[ps.length - 1].slice();
    const o = shuffle(12, k + 11);
    for (let j = 0; j < 6; j += 2) { const a = o[j], b = o[j + 1]; [p[a], p[b]] = [p[b], p[a]]; }
    ps.push(p);
  }
  return ps;
})();
const MAZE = (() => {
  // recursive-backtracker maze on a 9×16 grid → wall segments
  const W = 9, H = 16, seen = new Set<number>(), walls = new Set<string>();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { walls.add(`h${x},${y}`); walls.add(`v${x},${y}`); }
  const st = [0]; seen.add(0); let n = 0;
  while (st.length) {
    const c = st[st.length - 1], x = c % W, y = Math.floor(c / W);
    const nb = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < W && b < H && !seen.has(b * W + a));
    if (!nb.length) { st.pop(); continue; }
    const [a, b] = nb[Math.floor(rnd(++n * 1.37) * nb.length)];
    if (a !== x) walls.delete(`v${Math.max(a, x)},${y}`); else walls.delete(`h${x},${Math.max(b, y)}`);
    seen.add(b * W + a); st.push(b * W + a);
  }
  return [...walls].map((s) => { const [x, y] = s.slice(1).split(",").map(Number); return s[0] === "h" ? [x, y, x + 1, y] : [x, y, x, y + 1]; });
})();
const ROUTE_Y = (j: number) => 236 + j * 206;

const ReelScreen: React.FC<{ t: number; likes: number }> = ({ t, likes }) => {
  const sw = ease.io(ramp(t, S(68), S(68) + 0.32));
  const dbl = t >= S(58) && t < S(58) + 0.9;
  const kd = ramp(t, S(58), S(58) + 0.9);
  const kAI = pop(t, S(66) - 0.05, 0.4);
  const scan = ramp(t, S(66), S(66) + 0.75);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#000" }}>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${-sw * 100}%)` }}><Clip src="koroush.mp4" t0={21.5} dur={4} from={3} /></div>
      {sw > 0 && <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - sw) * 100}%)` }}><Clip src="train.mp4" t0={S(68)} dur={2} from={1.6} /></div>}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.4) 0%, rgba(0,0,0,0) 16%, rgba(0,0,0,0) 62%, rgba(0,0,0,.65) 100%)" }} />
      {/* top */}
      <div style={{ position: "absolute", left: 30, right: 30, top: 54, display: "flex", justifyContent: "space-between", alignItems: "center", direction: "rtl" }}>
        <Fx s={42} w={800} c="#fff">ریلز</Fx>
        <Ico n="camera" s={46} c="#fff" w={2} />
      </div>
      {/* AI label + scan */}
      {kAI > 0 && (
        <div style={{ position: "absolute", left: 24, top: 130, transform: `scale(${kAI})`, transformOrigin: "0 0", display: "flex", alignItems: "center", gap: 10, padding: "10px 20px 10px 16px", borderRadius: 99, background: "rgba(255,255,255,.95)", direction: "rtl", boxShadow: "0 8px 24px rgba(0,0,0,.35)" }}>
          <Ico n="sparkle" s={30} c={OR} fill />
          <Fx s={30} w={800} c={C.ink}>ساخته‌شده با AI</Fx>
        </div>
      )}
      {scan > 0 && scan < 1 && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: `${scan * 100}%`, height: 220, marginTop: -220, background: `linear-gradient(180deg, rgba(255,122,61,0), rgba(255,122,61,.42))`, borderBottom: `4px solid ${ON}`, boxShadow: `0 0 24px ${ON}` }} />
          <div style={{ position: "absolute", right: 18, top: `${scan * 100}%`, marginTop: -44, padding: "6px 12px", borderRadius: 8, background: ON }}><Mono s={18} c="#fff" ls={2}>AI SCAN · {Math.round(scan * 99)}%</Mono></div>
          {[[0, 0, 0], [1, 0, 90], [1, 1, 180], [0, 1, 270]].map(([a, b, r], i) => (
            <div key={i} style={{ position: "absolute", left: a ? undefined : 18, right: a ? 18 : undefined, top: b ? undefined : 18, bottom: b ? 18 : undefined, width: 54, height: 54, transform: `rotate(${r}deg)`, borderTop: `5px solid ${ON}`, borderLeft: `5px solid ${ON}`, opacity: Math.sin(scan * Math.PI) }} />
          ))}
        </>
      )}
      {/* double-tap heart */}
      {dbl && (
        <div style={{ position: "absolute", left: 260 - 110, top: 520 - 110, transform: `scale(${t < S(58) + 0.25 ? ease.back(kd * 4, 2.2) : 1}) translateY(${-ease.in(ramp(t, S(58) + 0.5, S(58) + 0.9)) * 160}px) rotate(-8deg)`, opacity: 1 - ramp(t, S(58) + 0.55, S(58) + 0.9) }}>
          <Ico n="heart" s={220} c="#fff" fill style={{ filter: "drop-shadow(0 10px 30px rgba(0,0,0,.4))" }} />
        </div>
      )}
      {/* live hearts rising from the like button */}
      {Array.from({ length: 30 }, (_, i) => {
        const t0 = S(58) + 0.15 + i * 0.11;
        const k = ramp(t, t0, t0 + 1.5);
        if (k <= 0 || k >= 1) return null;
        const x = 28 + k * 70 + Math.sin(k * 8 + i * 1.7) * 22 + (rnd(i) - 0.5) * 30;
        const y = 420 - k * 300;
        return <div key={i} style={{ position: "absolute", left: x, top: y, opacity: Math.sin(k * Math.PI) * 0.95, transform: `scale(${0.45 + rnd(i * 3) * 0.6}) rotate(${(rnd(i * 5) - 0.5) * 40}deg)` }}><Ico n="heart" s={50} c={i % 3 ? "#FF3040" : "#FF5A6E"} fill style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,.35))" }} /></div>;
      })}
      {/* rail (RTL: left side) */}
      <div style={{ position: "absolute", left: 22, bottom: 210, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        {[["heart", kfmt(likes)], ["igComment", "3,102"], ["igSend", "41.2K"]].map(([n, l], i) => (
          <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transform: i === 0 ? `scale(${1 + 0.3 * hit(t, S(58), 0.3)})` : undefined }}>
            {n === "heart" ? <Ico n="heart" s={58} c={t >= S(58) ? "#FF3040" : "#fff"} fill={t >= S(58)} w={2} /> : <AIco n={n} s={56} c="#fff" w={2} />}
            <Lx s={24} w={600} c="#fff">{l}</Lx>
          </div>
        ))}
        <Dots s={44} c="#fff" />
        <div style={{ width: 56, height: 56, borderRadius: 12, border: "4px solid #fff", overflow: "hidden" }}><Img src={still(38)} style={{ width: "100%", height: "100%", objectFit: "cover", maxWidth: "none" }} /></div>
      </div>
      {/* user + caption (RTL: right) */}
      <div style={{ position: "absolute", right: 26, bottom: 64, width: 400, direction: "rtl" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 62, height: 62, borderRadius: 31, background: IG_LIN, padding: 3 }}><div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", border: "2px solid #000" }}><Img src={still(10)} style={{ width: "100%", height: "100%", objectFit: "cover", maxWidth: "none" }} /></div></div>
          <Lx s={28} w={700} c="#fff">ai.stories</Lx>
          <div style={{ padding: "6px 16px", borderRadius: 10, border: "2px solid rgba(255,255,255,.8)" }}><Fx s={24} w={700} c="#fff">دنبال کردن</Fx></div>
        </div>
        <Fx s={28} w={500} c="#fff" style={{ marginTop: 12 }}>کوروش بزرگ | فیلم کوتاه با AI <span style={{ color: "rgba(255,255,255,.6)" }}>... بیشتر</span></Fx>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}><Ico n="music" s={24} c="#fff" /><Lx s={24} w={500} c="#fff">Original audio · ai.stories</Lx></div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 6, background: "rgba(255,255,255,.25)" }}><div style={{ height: "100%", width: `${((t - 21.5) / 5.5) * 100}%`, background: "#fff" }} /></div>
    </div>
  );
};

const RPhone: React.FC<{ x: number; y: number; w: number; style?: P; children?: React.ReactNode }> = ({ x, y, w, style, children }) => {
  const h = w * 2.05, b = w * 0.036;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, ...style }}>
      {[[-0.012, 0.2, 0.06], [-0.012, 0.29, 0.1], [-0.012, 0.41, 0.1], [1.002, 0.3, 0.15]].map(([fx, fy, fh], i) => (
        <div key={i} style={{ position: "absolute", left: fx * w, top: fy * h, width: w * 0.012, height: fh * h, borderRadius: 3, background: "#2A2A30" }} />
      ))}
      <div style={{ position: "absolute", inset: 0, borderRadius: w * 0.15, background: "linear-gradient(135deg,#3A3B41,#0D0D10 30%,#0D0D10 70%,#2A2B31)", padding: b, boxShadow: "0 50px 100px rgba(10,10,20,.35), 0 12px 30px rgba(10,10,20,.25), inset 0 0 0 2px #4A4B52" }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: w * 0.12, overflow: "hidden", background: "#000" }}>
          {children}
          <div style={{ position: "absolute", left: "50%", top: w * 0.028, width: w * 0.28, height: w * 0.07, marginLeft: -w * 0.14, borderRadius: 99, background: "#000" }} />
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ x: number; y: number; k: number; ic: string; label: string; value: string; sub: string; t: number; bars?: boolean; bump?: number; pill?: string }> = ({ x, y, k, ic, label, value, sub, t, bars, bump = 0, pill = "LIVE" }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 430, borderRadius: 34, background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,.06), 0 24px 60px rgba(20,20,30,.16), 0 50px 120px rgba(20,20,30,.14)", padding: "28px 32px", direction: "rtl", opacity: clamp(k * 2), transform: `translateX(${(1 - k) * 420}px) rotate(${(1 - k) * 8}deg) translateY(${Math.sin(t * 1.6 + x) * 6}px)` }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 58, height: 58, borderRadius: 18, background: "rgba(242,92,31,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><AIco n={ic} s={34} c={OR} w={2.4} /></div>
      <Fx s={36} w={800} c={C.ink}>{label}</Fx>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 99, background: OR, direction: "ltr" }}><AIco n="up" s={20} c="#fff" w={3} /><Lx s={20} w={800} c="#fff">{pill}</Lx></div>
    </div>
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 14 }}>
      <div style={{ transform: `scale(${1 + 0.08 * bump})`, transformOrigin: "100% 100%" }}><Lx s={62} w={800} c={C.ink} style={{ letterSpacing: -1.5 }}>{value}</Lx></div>
      {bars && (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 64, width: 100, flex: "none", direction: "ltr" }}>
          {Array.from({ length: 7 }, (_, i) => <div key={i} style={{ width: 10, height: 70 * clamp(0.15 + Math.pow(i / 6, 1.6) * 0.85 * k), borderRadius: 4, background: i === 6 ? OR : "#E9E6DF" }} />)}
        </div>
      )}
    </div>
    <Fx s={27} w={500} c={C.ink3} style={{ marginTop: 6 }}>{sub}</Fx>
  </div>
);

export const S4Tools: React.FC<SP> = ({ t, frame }) => {
  if (t < 21.5 || t > 31.65) return null;
  const gIn = ramp(t, 21.5, 21.74);
  const gI = gIn > 0 && gIn < 1;
  const whip = ease.in(ramp(t, 31.28, 31.6));
  // A · phone
  const aOut = ease.in(ramp(t, 25.12, 25.48));
  const kF = ease.back(ramp(t, S(58) - 0.08, S(58) + 0.4), 1.3);
  const kM = ease.back(ramp(t, S(61) - 0.06, S(61) + 0.4), 1.3);
  const kD = ease.back(ramp(t, S(64) - 0.06, S(64) + 0.4), 1.3);
  const fol = 1204 + 38000 * ease.io(ramp(t, S(58), S(64))) + 12000 * ease.out(ramp(t, S(68), S(68) + 0.5));
  const money = 3480 * ease.io(ramp(t, S(61), S(65))) + 920 * ease.out(ramp(t, S(68), S(68) + 0.5));
  const likes = 182000 + 66000 * ease.io(ramp(t, S(58), 25.1));
  // A2 · before / after
  const kC = (i: number) => ease.back(ramp(t, 25.24 + i * 0.1, 25.68 + i * 0.1), 1.1);
  const easy = ease.out(ramp(t, S(71) - 0.04, S(71) + 0.35));
  // zoom-through into the laptop → maze
  const zk = ease.in(ramp(t, 27.0, 27.44));
  const zm = ease.io(ramp(t, 27.0, 27.44));
  const LSX = 364, LSY = 1009.5, LSW = 411, LSH = 256; // the laptop screen (screen coords, card settled)
  const Z = Math.pow(7.7, zk);
  const zcx = lerp(LSX, 540, zm), zcy = lerp(LSY, 960, zm);
  const rL = Math.max(0, zcx - (LSW * Z) / 2), rR = Math.min(1080, zcx + (LSW * Z) / 2);
  const rT = Math.max(0, zcy - (LSH * Z) / 2), rB = Math.min(1920, zcy + (LSH * Z) / 2);
  const mS = Math.min(1, (Z * LSW) / 1080);
  // B · maze
  const kMaze = t >= 27.0;
  const kQ = pop(t, S(79) - 0.05, 0.45) * (1 - ease.in(ramp(t, S(85) - 0.1, S(85) + 0.15)));
  const route = ease.io(ramp(t, S(85) - 0.04, S(85) + 0.42));
  const line = ease.io(ramp(t, S(85) + 0.12, S(86) + 0.12));
  const dot = ramp(t, S(86) - 0.05, S(87) + 0.1);
  const kOk = pop(t, S(87) - 0.12, 0.42);
  const permAt = (i: number) => {
    let p = SLOTS[PERMS[0][i]].slice();
    for (let k = 0; k < SWAPS.length; k++) {
      const q = SLOTS[PERMS[k + 1][i]];
      const s = ease.io(ramp(t, SWAPS[k] - 0.02, SWAPS[k] + 0.3));
      if (s > 0) {
        const arc = Math.sin(s * Math.PI) * 90 * (i % 2 ? 1 : -1);
        p = [lerp(p[0], q[0], s) + arc, lerp(p[1], q[1], s) - arc * 0.3, lerp(p[2], q[2], s)];
      }
    }
    return p;
  };
  return (
    <Full style={{ transform: `translateY(${-whip * 1920}px)`, filter: whip > 0 ? `blur(${whip * 14}px)` : undefined }}>
      {/* A + A2 layer (zooms into the laptop at the end) */}
      {zk < 1 && (
        <div style={{ position: "absolute", inset: 0, transformOrigin: `${LSX}px ${LSY}px`, transform: `translate(${zcx - LSX}px, ${zcy - LSY}px) scale(${Z})`, filter: zk > 0.4 ? `blur(${(zk - 0.4) * 8}px)` : undefined }}>
          {aOut < 1 && (
            <div style={{ position: "absolute", inset: 0, transform: `translateY(${aOut * 1500}px) rotate(${aOut * 7}deg)`, transformOrigin: "50% 100%", filter: gI ? `hue-rotate(${(1 - gIn) * 60}deg)` : undefined }}>
              <div style={{ position: "absolute", inset: 0, transform: `translateY(${Math.sin(t * 1.3) * 8}px) rotate(${Math.sin(t * 0.9) * 0.8}deg)` }}>
                <RPhone x={200} y={150} w={560}>
                  <ReelScreen t={t} likes={likes} />
                </RPhone>
              </div>
              <StatCard x={610} y={260} k={kF} t={t} ic="users" label="معروف شدن" value={`+${grp(fol)}`} sub="فالوور تازه در این ماه" bump={hit(t, S(68) + 0.2, 0.3)} />
              {kM > 0 && <StatCard x={610} y={620} k={kM} t={t} ic="dollar" label="پول درآوردن" value={`$${grp(money)}`} sub="درآمد این ماه از پیج" bars bump={hit(t, S(68) + 0.25, 0.3)} />}
              {kD > 0 && <StatCard x={610} y={930} k={kD} t={t} ic="igSend" label="همکاری با برند" value="$2,500" sub="پیشنهاد تبلیغ برای 3 ریلز" pill="NEW" />}
            </div>
          )}
          {t > 25.2 && (
            <>
              {/* BEFORE */}
              <div style={{ position: "absolute", left: 60, top: 150, width: 960, height: 500, borderRadius: 40, background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,.06), 0 24px 60px rgba(20,20,30,.12)", overflow: "hidden", transform: `translateY(${(1 - kC(0)) * -1300 + Math.sin(t * 1.7) * 6}px) rotate(${Math.sin(t * 1.1) * 0.5}deg) scale(${1 - 0.04 * easy})`, filter: `grayscale(${easy * 0.9})`, opacity: lerp(1, 0.78, easy) }}>
                <div style={{ position: "absolute", left: 40, right: 40, top: 30, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Mono s={22} c={C.ink3}>BEFORE · 2020</Mono>
                  <Fx s={64} w={900} c={C.ink}>قبل</Fx>
                </div>
                <div style={{ position: "absolute", left: 50, top: 108 }}><FilmSet w={860} t={t} /></div>
                <div style={{ position: "absolute", left: 40, right: 40, top: 412, display: "flex", gap: 14, justifyContent: "center", direction: "rtl" }}>
                  {[["users", "تیم 8 نفره"], ["dollar", "$50,000"], ["cal", "3 ماه"]].map(([ic, l], i) => (
                    <div key={i} style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, padding: "12px 24px", borderRadius: 99, background: "#F1F0EC" }}>
                      <AIco n={ic} s={32} c={i === 1 ? C.red : C.ink} w={2.2} />
                      <Fx s={32} w={800} c={i === 1 ? C.red : C.ink}>{l}</Fx>
                      <div style={{ position: "absolute", left: 14, right: 14, top: "50%", height: 5, marginTop: -2, borderRadius: 3, background: C.red, transformOrigin: "100% 50%", transform: `scaleX(${ease.out(ramp(t, S(71) + i * 0.1, S(71) + i * 0.1 + 0.25))})` }} />
                    </div>
                  ))}
                </div>
              </div>
              {/* VS */}
              <div style={{ position: "absolute", left: 540 - 46, top: 652, width: 92, height: 92, borderRadius: 46, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(t, 25.5, 0.35)}) rotate(${Math.sin(t * 2) * 6}deg)`, zIndex: 3, boxShadow: "0 10px 30px rgba(0,0,0,.25)" }}>
                <Mono s={30} c="#fff" ls={2}>VS</Mono>
              </div>
              {/* NOW */}
              <div style={{ position: "absolute", left: 60, top: 746, width: 960, height: 500, borderRadius: 40, background: "#fff", boxShadow: `0 2px 4px rgba(0,0,0,.06), 0 24px 60px rgba(20,20,30,.14), 0 0 0 ${5 * easy}px ${OR}`, overflow: "hidden", transform: `translateY(${(1 - kC(1)) * -1300 + Math.sin(t * 1.7 + 1.5) * 6}px) rotate(${Math.sin(t * 1.1 + 2) * 0.5}deg) scale(${1 + 0.035 * easy + 0.02 * hit(t, S(71), 0.3)})` }}>
                <div style={{ position: "absolute", left: 40, right: 40, top: 30, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Mono s={22} c={OR}>NOW · 2026</Mono>
                  <Fx s={64} w={900} c={C.ink}>حالا</Fx>
                </div>
                <div style={{ position: "absolute", left: 50, top: 130 }}>
                  <Laptop w={520}>
                    <Clip src="koroush.mp4" t0={25.2} dur={2.4} from={16.6} />
                    <div style={{ position: "absolute", left: 12, top: 12, display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 99, background: "rgba(255,255,255,.92)" }}><Ico n="sparkle" s={20} c={OR} fill /><Lx s={18} w={800}>AI</Lx></div>
                  </Laptop>
                </div>
                <div style={{ position: "absolute", right: 40, top: 140, display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-end" }}>
                  {[["person", "1 نفر"], ["laptop", "1 لپ‌تاپ + AI"], ["cal", "1 روز"], ["dollar", "$20 در ماه"]].map(([ic, l], i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 22px", borderRadius: 99, background: easy > 0.5 ? "rgba(242,92,31,.12)" : "#F1F0EC", direction: "rtl", transform: `scale(${pop(t, 25.6 + i * 0.08, 0.35)})`, transformOrigin: "100% 50%" }}>
                      <AIco n={ic} s={32} c={OR} w={2.2} />
                      <Fx s={32} w={800} c={C.ink}>{l}</Fx>
                    </div>
                  ))}
                </div>
              </div>
              {easy > 0 && (
                <div style={{ position: "absolute", left: 22, top: 708, width: 92, height: 92, borderRadius: 46, background: OR, border: "6px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(t, S(71), 0.4)})`, boxShadow: "0 10px 30px rgba(242,92,31,.4)", zIndex: 4 }}><Ico n="check" s={50} c="#fff" w={3.4} /></div>
              )}
            </>
          )}
        </div>
      )}
      {/* B · the maze (grows out of the laptop screen) */}
      {kMaze && (
        <div style={{ position: "absolute", left: rL, top: rT, width: rR - rL, height: rB - rT, overflow: "hidden", borderRadius: 6 * Z * (1 - zm), opacity: ramp(t, 27.0, 27.1), background: zm < 1 ? C.desk : undefined }}>
          <div style={{ position: "absolute", left: zcx - 540 * mS - rL, top: zcy - 960 * mS - rT, width: 1080, height: 1920, transformOrigin: "0 0", transform: `scale(${mS})`, background: zm < 1 ? C.desk : undefined }}>
            <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 1 - whip, transform: `translate(${Math.sin(t * 0.4) * 20}px, ${-((t - 27) * 14)}px)` }}>
              {MAZE.map(([x1, y1, x2, y2], i) => <line key={i} x1={x1 * 120 + 0} y1={y1 * 120 + 0} x2={x2 * 120} y2={y2 * 120} stroke={C.ink} strokeOpacity={0.09} strokeWidth={7} strokeLinecap="round" />)}
            </svg>
            {/* route line + nodes */}
            {line > 0 && (
              <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, zIndex: 3 }}>
                <line x1={968} y1={ROUTE_Y(0)} x2={968} y2={lerp(ROUTE_Y(0), ROUTE_Y(4), line)} stroke={OR} strokeWidth={10} strokeLinecap="round" />
                {[0, 1, 2, 3, 4].map((j) => {
                  const k = ease.back(ramp(t, S(85) + 0.12 + j * 0.1, S(85) + 0.42 + j * 0.1), 1.6);
                  const lit = dot > 0 && dot * 4.4 >= j;
                  return k > 0 ? <g key={j} transform={`translate(968 ${ROUTE_Y(j)}) scale(${clamp(k, 0, 1.3)})`}><circle r={38} fill={lit ? OR : "#fff"} stroke={OR} strokeWidth={6} /><text y={13} textAnchor="middle" fontFamily={UI} fontWeight={800} fontSize={36} fill={lit ? "#fff" : OR}>{j + 1}</text></g> : null;
                })}
                {dot > 0 && dot < 1 && <circle cx={968} cy={lerp(ROUTE_Y(0), ROUTE_Y(4), dot)} r={20} fill="#fff" stroke={OR} strokeWidth={8} />}
              </svg>
            )}
            {TOOLS.map((tl, i) => {
              const [px, py, pr] = permAt(i);
              const onR = tl.r >= 0;
              const jx = wob(t * 2.2, i, 10) * (1 - route), jy = wob(t * 2.6, i + 5, 8) * (1 - route);
              const tx = onR ? 520 : px < 540 ? 170 : 910, ty = onR ? ROUTE_Y(tl.r) : py;
              const k = route;
              const x = lerp(px + jx, tx, k), y = lerp(py + jy, ty, k);
              const w = onR ? lerp(430, 760, k) : 430;
              const dimK = onR ? 0 : k;
              const lit = onR && dot > 0 && dot * 4.4 >= tl.r;
              const ent = 1;
              return (
                <div key={i} style={{ position: "absolute", left: x - w / 2, top: y - 74, width: w, height: 148, borderRadius: 30, background: "#fff", boxShadow: lit ? `0 0 0 5px ${OR}, 0 24px 60px rgba(242,92,31,.25)` : "0 2px 4px rgba(0,0,0,.06), 0 18px 44px rgba(20,20,30,.14)", transform: `rotate(${lerp(pr + wob(t, i, 3), 0, k)}deg) scale(${lerp(1, 0.82, dimK) * clamp(ent, 0, 1.2)})`, opacity: lerp(1, 0.2, dimK) * (onR ? 1 : 1 - ramp(t, S(86) + 0.1, S(87))), filter: dimK > 0 ? `blur(${dimK * 3}px)` : undefined, display: "flex", alignItems: "center", gap: 22, padding: "0 28px", direction: "rtl", zIndex: onR ? 2 : 1 }}>
                  <div style={{ width: 84, height: 84, borderRadius: 24, background: lit ? OR : "#F1F0EC", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                    {AP_HAS(tl.ic) ? <AIco n={tl.ic} s={46} c={lit ? "#fff" : C.ink} w={2.2} /> : <Ico n={tl.ic} s={46} c={lit ? "#fff" : C.ink} w={2.2} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Fx s={40} w={900} c={C.ink}>{tl.fa}</Fx>
                    <Lx s={26} w={600} c={C.ink3} style={{ marginTop: 4, textAlign: "right" }}>{tl.en}</Lx>
                  </div>
                  {lit && <div style={{ transform: `scale(${pop(t, S(86) - 0.05 + tl.r * 0.11, 0.3)})` }}><Ico n="check" s={52} c={OR} w={3.4} /></div>}
                </div>
              );
            })}
            {kQ > 0 && (
              <div style={{ position: "absolute", left: 540, top: 760, transform: `translate(-50%, -50%) scale(${kQ * (1 + 0.04 * Math.sin(t * 6))}) rotate(${Math.sin(t * 3.2) * 9}deg)`, zIndex: 5 }}>
                <div style={{ width: 360, height: 360, borderRadius: 180, background: OR, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 30px 80px rgba(242,92,31,.4)" }}>
                  <div style={{ fontFamily: FA, fontWeight: 900, fontSize: 300, color: "#fff", lineHeight: 1, marginTop: 40 }}>؟</div>
                </div>
              </div>
            )}
            {kOk > 0 && (
              <div style={{ position: "absolute", left: 540, top: 1196, transform: `translate(-50%, -50%) scale(${kOk})`, zIndex: 6, display: "flex", alignItems: "center", gap: 16, padding: "20px 44px", borderRadius: 99, background: C.ink, boxShadow: "0 20px 50px rgba(0,0,0,.25)", direction: "rtl" }}>
                <div style={{ width: 56, height: 56, borderRadius: 28, background: OR, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico n="check" s={36} c="#fff" w={3.4} /></div>
                <Fx s={50} w={900} c="#fff">مسیر درست</Fx>
              </div>
            )}
          </div>
        </div>
      )}
      {gI && <GlitchBars frame={frame} k={1 - gIn} />}
    </Full>
  );
};
const AP_SET = new Set(["lip", "person", "hd", "cc", "grade"]);
const AP_HAS = (n: string) => AP_SET.has(n);

// ═════════════ S5 · 30 days, every style (31.4 – 37.65) ═════════════
const CAL_STILL = [14, 1, 39, 2, 15, 16, 3, 17, 40, 18, 6, 19, 41, 20, 7, 9, 21, 42, 22, 8, 23, 43, 24, 11, 25, 44, 30, 12, 32, 45];
const MAN_DAY = 16; // day 16 = row 2, middle column
const CATS: Record<number, string> = { 3: "سینمایی", 7: "انیمیشن", 11: "موزیک‌ویدیو", 19: "کاراکتر", 24: "تبلیغاتی", 28: "مستند" };
const STYLE_NAMES = ["HOLOGRAM HUD", "ATOMIC AGE", "TEST REEL", "STICK TOON", "SATELLITE", "RECEIPT UI", "LAUNCH REEL", "HALFTONE POP", "STORY MONTAGE", "DOCUMENTARY", "COSMIC WEB", "LIGHT SWARM", "PAPER BLUEPRINT", "PHOTOCOPY", "PIXEL COLLAGE"];
const CARD_Y = 404, CELL = 127, GAP = 10;
const cellXY = (d: number) => {
  const idx = d - 1 + 2, row = Math.floor(idx / 7), col = idx % 7;
  return [40 + 24 + (6 - col) * (CELL + GAP), CARD_Y + 96 + row * (CELL + GAP)];
};
const fillT = (d: number) => lerp(S(93) - 0.02, S(101), Math.pow((d - 1) / 29, 0.9));

export const S5Days: React.FC<SP> = ({ t }) => {
  if (t < 31.4 || t > 37.65) return null;
  const kIn = ease.out(ramp(t, 31.38, 31.72));
  const kCal = ease.out(ramp(t, 31.5, 32.0));
  const slam = ease.out(ramp(t, S(91) - 0.04, S(91) + 0.3));
  const settle = ease.io(ramp(t, S(93) - 0.05, S(93) + 0.4));
  const prog = ease.io(ramp(t, S(102) - 0.08, E(103) - 0.1));
  const zk = ease.in(ramp(t, 36.95, 37.24));
  const [mx, my] = cellXY(MAN_DAY);
  const ox = mx + CELL / 2, oy = my + CELL / 2;
  const filled = Array.from({ length: 30 }, (_, i) => i + 1).filter((d) => t >= fillT(d)).length;
  const fillS = Array.from({ length: 30 }, (_, i) => ramp(t, fillT(i + 1), fillT(i + 1) + 0.25)).reduce((a, b) => a + b, 0) / 30;
  const pct = Math.max(fillS, prog);
  const sh = hit(t, S(91), 0.3) * 14;
  // giant «30 روز»: centre slam → header
  const bx = 540, by = lerp(760, 236, settle), bs = lerp(1.0, 0.56, settle) * lerp(1.7, 1, slam);
  const tilt = 1 - ramp(t, 36.4, 36.9);
  return (
    <Full style={{ transform: `translateY(${(1 - kIn) * 1920}px)` }}>
      <div style={{ position: "absolute", inset: 0, transformOrigin: `${ox}px ${oy}px`, transform: `translate(${Math.sin(t * 90) * sh}px, ${Math.cos(t * 70) * sh}px) scale(${Math.pow(11, zk)})`, filter: zk > 0.2 ? `blur(${(zk - 0.2) * 8}px)` : undefined }}>
        {/* title before the slam */}
        <div style={{ position: "absolute", left: 0, width: 1080, top: 190, display: "flex", flexDirection: "column", alignItems: "center", opacity: 1 - slam, transform: `translateY(${-slam * 60}px)` }}>
          <Mono s={24} c={OR} ls={8}>30-DAY PROGRAM</Mono>
          <Fx s={70} w={900} c={C.ink} style={{ marginTop: 14 }}>دوره‌ی ویدیوسازی با AI</Fx>
        </div>
        {/* calendar */}
        <div style={{ position: "absolute", inset: 0, perspective: 1800 }}>
          <div style={{ position: "absolute", left: 40, top: CARD_Y, width: 1000, height: 862, borderRadius: 44, background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,.06), 0 30px 70px rgba(20,20,30,.14), 0 70px 160px rgba(20,20,30,.12)", transformOrigin: "50% 0", transform: `rotateX(${lerp(26, 0, kCal) + 3 * tilt * Math.sin(t * 0.8)}deg) rotateY(${2.5 * tilt * Math.sin(t * 0.6)}deg) translateY(${-(1 - kCal) * 120}px)`, opacity: clamp(kCal * 1.5) * lerp(1, 0.35, slam * (1 - settle)) }}>
            {["ش", "ی", "د", "س", "چ", "پ", "ج"].map((d, c) => (
              <Fx key={d} s={30} w={700} c={c === 6 ? OR : C.ink3} style={{ position: "absolute", left: 24 + (6 - c) * (CELL + GAP), width: CELL, top: 30, textAlign: "center" }}>{d}</Fx>
            ))}
            {/* padding days */}
            {[[0, "28"], [1, "29"], [32, "1"], [33, "2"], [34, "3"]].map(([idx, n]) => {
              const row = Math.floor((idx as number) / 7), col = (idx as number) % 7;
              return <div key={idx} style={{ position: "absolute", left: 24 + (6 - col) * (CELL + GAP), top: 96 + row * (CELL + GAP), width: CELL, height: CELL, borderRadius: 18, border: "2px dashed #ECEAE4" }}><Lx s={26} w={600} c="#D3D0C8" style={{ position: "absolute", right: 14, top: 10 }}>{n}</Lx></div>;
            })}
          </div>
        </div>
        {/* cells (flat, on top of the card, so the zoom target is exact) */}
        {Array.from({ length: 30 }, (_, i) => {
          const d = i + 1;
          const [x, y] = cellXY(d);
          const tf = fillT(d);
          const k = ease.out(ramp(t, tf, tf + 0.28));
          const cat = CATS[d];
          const kc = cat ? pop(t, S(96) + Object.keys(CATS).indexOf(String(d)) * 0.13, 0.38) : 0;
          const isMan = d === MAN_DAY;
          const today = !k && d === filled + 1;
          return (
            <div key={d} style={{ position: "absolute", left: x, top: y, width: CELL, height: CELL, borderRadius: 18, background: "#F4F3EF", overflow: "hidden", opacity: clamp(kCal * 1.5) * lerp(1, 0.35, slam * (1 - settle)), transform: `translateY(${-(1 - kCal) * 120}px)`, boxShadow: today ? `inset 0 0 0 ${3 + 2 * Math.sin(t * 10)}px ${OR}` : kc > 0 ? `inset 0 0 0 ${4 * clamp(kc)}px ${OR}` : undefined }}>
              {k > 0 && <Img src={isMan ? v23("a/man0.jpg") : still(CAL_STILL[i])} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: k, transform: `scale(${lerp(1.5, 1, k)})`, maxWidth: "none" }} />}
              {k > 0 && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.5), rgba(0,0,0,0) 42%)", opacity: k }} />}
              <Lx s={28} w={800} c={k > 0.5 ? "#fff" : C.ink3} style={{ position: "absolute", right: 12, top: 8 }}>{d}</Lx>
              {k > 0.5 && <div style={{ position: "absolute", left: 8, top: 8, width: 30, height: 30, borderRadius: 15, background: OR, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(t, tf + 0.12, 0.3)})` }}><Ico n="check" s={20} c="#fff" w={3.6} /></div>}
              {kc > 0 && <div style={{ position: "absolute", left: 6, right: 6, bottom: 8, display: "flex", justifyContent: "center", transform: `scale(${kc})`, transformOrigin: "50% 100%" }}><div style={{ padding: "5px 10px", borderRadius: 99, background: "rgba(255,255,255,.95)" }}><Fx s={20} w={800} c={C.ink}>{cat}</Fx></div></div>}
              {today && <div style={{ position: "absolute", left: 0, right: 0, bottom: 14, display: "flex", justifyContent: "center" }}><div style={{ width: 12, height: 12, borderRadius: 6, background: OR }} /></div>}
            </div>
          );
        })}
        {/* progress */}
        <div style={{ position: "absolute", left: 64, width: 952, top: CARD_Y + 790, opacity: clamp(kCal * 1.5) * ramp(t, 31.72, 31.92) * lerp(1, 0.35, slam * (1 - settle)), direction: "rtl" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Fx s={30} w={700} c={prog > 0.5 ? OR : C.ink2}>{prog > 0.5 ? "همه رو یاد گرفتی!" : `روز ${filled} از 30`}</Fx>
            <Lx s={34} w={800} c={pct > 0 ? OR : C.ink3} style={{ transform: `scale(${1 + 0.25 * hit(t, E(103) - 0.12, 0.3)})` }}>{Math.round(pct * 100)}%</Lx>
          </div>
          <div style={{ position: "relative", height: 20, borderRadius: 10, background: "#EEECE6", marginTop: 10, overflow: "hidden" }}>
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${pct * 100}%`, borderRadius: 10, background: `linear-gradient(270deg, ${OR}, ${ON})`, boxShadow: prog > 0 ? `0 0 ${16 * Math.sin(prog * Math.PI)}px ${ON}` : undefined }} />
          </div>
        </div>
        {/* «30 روز» */}
        {slam > 0 && (
          <div style={{ position: "absolute", left: bx, top: by, transform: `translate(-50%, -50%) scale(${bs})`, display: "flex", alignItems: "flex-end", gap: 40, direction: "rtl" }}>
            <div style={{ fontFamily: NUM, fontWeight: 700, fontSize: 400, color: C.ink, lineHeight: 0.9, letterSpacing: -12, direction: "ltr" }}>30</div>
            <div style={{ fontFamily: FA, fontWeight: 900, fontSize: 190, color: OR, lineHeight: 1.1, opacity: ramp(t, S(92) - 0.05, S(92) + 0.12), transform: `translateX(${(1 - ease.out(ramp(t, S(92) - 0.05, S(92) + 0.25))) * -60}px)` }}>روز</div>
          </div>
        )}
        {settle > 0 && (
          <Mono s={24} c={C.ink3} ls={6} style={{ position: "absolute", left: 0, width: 1080, top: 352, textAlign: "center", opacity: settle }}>
            STYLE {String(Math.max(1, Math.min(24, Math.ceil(filled * 0.8)))).padStart(2, "0")}/24 · <span style={{ color: OR }}>{STYLE_NAMES[filled % STYLE_NAMES.length]}</span>
          </Mono>
        )}
      </div>
      {/* the man cell grows to full-bleed (S6 starts on man.mp4 at 37.2) */}
      {zk > 0 && (() => {
        const k = ease.io(ramp(t, 36.95, 37.24));
        return (
          <div style={{ position: "absolute", left: lerp(mx, 0, k), top: lerp(my, 0, k), width: lerp(CELL, 1080, k), height: lerp(CELL, 1920, k), borderRadius: lerp(18, 0, k), overflow: "hidden", background: "#000" }}>
            {t < 37.2 ? <Img src={v23("a/man0.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", maxWidth: "none" }} /> : <Clip src="man.mp4" t0={37.2} dur={4.4} from={0} />}
          </div>
        );
      })()}
    </Full>
  );
};
