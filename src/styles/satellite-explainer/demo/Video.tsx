import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, interpolate, staticFile, useCurrentFrame, continueRender, delayRender } from "remotion";
import { noise2D } from "@remotion/noise";
import vo from "./vo.json";
import TMAP from "./timemap.json";
import { Key, MAP_H, MAP_W, SH, SW, FA, camAt, clampCam, drift, pop, proj, ramp, toScreen, win } from "./geo";
import { AirCone, Blob, Captions, Fan, Rain, FONT_HERO, FONT_UI, HAVE, Icon, Label, Streaks, Thermo, Title, Word, groupWords } from "./fx";
import { Globe } from "./Globe";
import { Famine } from "./Famine";
import { Hook } from "./Hook";

export const SAT_FPS = 30;
export const SAT_FRAMES = Math.ceil((vo.total + 0.2) * SAT_FPS);

// Vazirmatn for UI/captions (Lalezar Circle is loaded globally by src/fonts.ts)
if (typeof window !== "undefined") {
  const h = delayRender("satellite-explainer fonts");
  Promise.all(
    [["Vazirmatn", "fonts/Vazirmatn-Bold.ttf", "700"], ["Vazirmatn", "fonts/Vazirmatn-Black.ttf", "900"]].map(([f, u, w]) =>
      new FontFace(f, `url('${staticFile(u)}')`, { weight: w }).load().then((ff) => document.fonts.add(ff)),
    ),
  ).then(() => continueRender(h)).catch(() => continueRender(h));
}

// visuals were cued on the first narration; map the current narration time onto it word by word
const mapT = (x: number) => {
  const A = TMAP as number[][];
  if (x <= A[0][0]) return A[0][1] + (x - A[0][0]);
  for (let i = 1; i < A.length; i++) if (x <= A[i][0]) { const [a0, b0] = A[i - 1], [a1, b1] = A[i]; return b0 + ((x - a0) * (b1 - b0)) / (a1 - a0); }
  return A[A.length - 1][1] + (x - A[A.length - 1][0]);
};

const WORDS = vo.words as Word[];
const GROUPS = groupWords(WORDS.filter((w) => w.line !== 0));
// in the hook the title carries the first half; only “بیاین بهتون توضیح بدم” is captioned
const HW = WORDS.filter((w) => w.line === 0);
// the title slam carries «بزرگ‌ترین خشکسالی دنیا»; captions take the rest
const GROUPS_HOOK = [HW.slice(3, 6), HW.slice(6)];

// scene windows (s)
const GLOBE = [58.85, 61.9] as const;
const FAMINE = [74.55, 84.0] as const;

const E = Easing.bezier(0.65, 0, 0.25, 1);
const WHIP = Easing.bezier(0.8, 0, 0.2, 1);
const KEYS: Key[] = [
  { t: 0, lon: -95, lat: 12, s: 0.55 },
  { t: 2.4, lon: -105, lat: 12, s: 0.34 },
  { t: 10.6, lon: -106, lat: 10, s: 0.37, ease: (x) => x },
  { t: 11.4, lon: -112, lat: 8, s: 0.33 },
  { t: 16.8, lon: -112, lat: 8, s: 0.35, ease: (x) => x },
  { t: 18.4, lon: -125, lat: 5, s: 0.29 },
  { t: 24.2, lon: -140, lat: 0, s: 0.28, ease: (x) => x },
  { t: 26.4, lon: -115, lat: 10, s: 0.34 },
  { t: 30.6, lon: -148, lat: 5, s: 0.33, ease: (x) => x },
  { t: 31.6, lon: -160, lat: 0, s: 0.3 },
  { t: 34.3, lon: 140, lat: -8, s: 0.33 },
  { t: 38.5, lon: 138, lat: -10, s: 0.35, ease: (x) => x },
  { t: 39.6, lon: -95, lat: -3, s: 0.36, ease: WHIP },
  { t: 43.6, lon: -100, lat: -3, s: 0.38, ease: (x) => x },
  { t: 45.9, lon: -130, lat: 0, s: 0.29 },
  { t: 47.2, lon: -140, lat: 2, s: 0.28 },
  { t: 52.7, lon: -135, lat: 0, s: 0.29, ease: (x) => x },
  { t: 53.7, lon: -125, lat: 0, s: 0.33 },
  { t: 58.85, lon: -122, lat: 0, s: 0.36, ease: (x) => x },
  { t: 61.95, lon: -110, lat: 55, s: 0.36 },
  { t: 64.4, lon: -108, lat: 55, s: 0.38, ease: (x) => x },
  { t: 65.4, lon: -100, lat: 38, s: 0.36 },
  { t: 67.9, lon: -98, lat: 36, s: 0.38, ease: (x) => x },
  { t: 68.8, lon: -85, lat: 8, s: 0.36 },
  { t: 70.95, lon: -85, lat: 5, s: 0.38, ease: (x) => x },
  { t: 71.75, lon: 130, lat: -14, s: 0.34, ease: WHIP },
  { t: 74.55, lon: 130, lat: -16, s: 0.37, ease: (x) => x },
  { t: 84.0, lon: -125, lat: 5, s: 0.27 },
  { t: 90.5, lon: -122, lat: 3, s: 0.29, ease: (x) => x },
  { t: 91.4, lon: -110, lat: -2, s: 0.42 },
  { t: 95.0, lon: -108, lat: -2, s: 0.46, ease: (x) => x },
  { t: 96.2, lon: -125, lat: 5, s: 0.3 },
  { t: 98.3, lon: -128, lat: 5, s: 0.29, ease: (x) => x },
  { t: 100.6, lon: -130, lat: 10, s: 0.265 },
  { t: 106, lon: -130, lat: 10, s: 0.265, ease: (x) => x },
];

// fan blade angle: full speed, then spin-down between a and b
const fanAngle = (t: number) => {
  const w = 1500, a = 6.45, b = 7.45;
  if (t < a) return w * t;
  const d = b - a, u = Math.min(t - a, d);
  return w * a + w * (u - (u * u) / (2 * d));
};

export const SatelliteVideo: React.FC<{ audio?: boolean }> = ({ audio = false }) => {
  const frame = useCurrentFrame();
  const tReal = frame / SAT_FPS;
  const t = mapT(tReal);
  const cam = clampCam(camAt(KEYS, t));
  const camN = clampCam(camAt(KEYS, mapT(tReal + 1 / SAT_FPS)));
  const vx = (proj(camN.lon, camN.lat).x - proj(cam.lon, cam.lat).x) * cam.s;
  const vy = (proj(camN.lon, camN.lat).y - proj(cam.lon, cam.lat).y) * cam.s;
  const vz = Math.abs(Math.log(camN.s / cam.s)) * 900;
  const blurX = Math.min(36, Math.abs(vx) * 0.22 + vz * 0.15), blurY = Math.min(36, Math.abs(vy) * 0.22 + vz * 0.15);

  // impacts: super El Niño slam, 2027 slam
  const slam = Math.max(1 - ramp(t, 14.62, 15.3), 0) * (t >= 14.62 ? 1 : 0) + (t >= 100.72 ? 1 - ramp(t, 100.72, 101.5) : 0);
  const dr = drift(t, 7, slam * 22);
  const o = proj(cam.lon, cam.lat);
  const S = (lon: number, lat: number) => toScreen(cam, lon, lat);

  const HOOK_END = (TMAP as number[][])[0][0];
  const inHook = tReal < HOOK_END;
  const inGlobe = t >= GLOBE[0] && t < GLOBE[1];
  const inFamine = t >= FAMINE[0] && t < FAMINE[1];

  // ---- layer opacities
  // fan story: warm haze sits offshore → the fan blows it west (cool water) → fan dies → warmth creeps back to the coast
  const fanPow = t < 6.45 ? ramp(t, 1.5, 2.1) : 1 - ramp(t, 6.45, 7.45, (x) => x);
  const coolAir = Math.min(ramp(t, 2.4, 4.2), 1 - ramp(t, 7.0, 8.6));
  const warmLonE = t < 6.45 ? interpolate(t, [0.6, 2.6, 6.3], [-112, -114, -140], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: E }) : interpolate(t, [6.8, 9.4], [-140, -112], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: E });
  const warmEarly = (t < 6.45 ? interpolate(t, [0.6, 1.4, 2.6, 6.2], [0, 0.85, 0.85, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : interpolate(t, [6.6, 8.8], [0.25, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })) * (1 - ramp(t, 16.8, 17.6));
  const heat1 = win(t, 8.35, 17.4, 0.01, 0.8);
  const heatWipe1 = ramp(t, 8.35, 9.5, Easing.bezier(0.5, 0, 0.3, 1));
  const heat2 = win(t, 84.4, 96.8, 0.01, 1.2);
  const heatWipe2 = ramp(t, 84.4, 86.0, (x) => x);
  const hotAll = ramp(t, 98.2, 100.4);
  const winds = t < 50 ? ramp(t, 19.2, 20.4) : 1 - ramp(t, 49.4, 50.6);
  const windSpeed = t < 49.4 ? 1 : 1 - 0.8 * ramp(t, 49.4, 50.6);
  const windsLate = win(t, 31.0, 46.3, 0.5, 0.6) * 0.55;
  // warm pool: pushed west (31–34), sits by Indonesia, back east (50.5–52.6)
  const warmLon = t < 40 ? interpolate(t, [31.2, 34.2], [-140, 150], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: E })
    : interpolate(t, [50.5, 52.8], [150, 240], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: E });
  const warmO = Math.max(win(t, 31.2, 39.2, 0.6, 0.6), win(t, 50.4, 58.9, 0.5, 0.3)) * 0.95;
  const warmW = t < 45 ? 1900 : interpolate(t, [50.5, 53], [1500, 3600], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const coldO = win(t, 42.0, 46.3, 0.6, 0.6);
  const now2O = win(t, 86.5, 100.3, 0.8, 1.2);

  const sun = (lon: number, lat: number, a: number, b: number, size = 150, dy = 0) => {
    const p = S(lon, lat);
    return <Icon name="sun" x={p.x} y={p.y + dy} size={size} t={t} o={win(t, a, b, 0.25, 0.4)} s={pop(t, a)} />;
  };
  const icon = (name: Parameters<typeof Icon>[0]["name"], lon: number, lat: number, a: number, b: number, size = 170, dy = 0) => {
    const p = S(lon, lat);
    return <Icon name={name} x={p.x} y={p.y + dy + Math.sin(t * 2 + lon) * 6} size={size} t={t} o={win(t, a, b, 0.25, 0.4)} s={pop(t, a)} />;
  };

  return (
    <AbsoluteFill style={{ background: "#0a2530", overflow: "hidden" }}>
      {/* ===================== MAP WORLD ===================== */}
      {!inHook && !inGlobe && !inFamine && (
        <AbsoluteFill style={{ filter: blurX + blurY > 1.2 ? `url(#v14whip)` : undefined }}>
          <svg width={0} height={0} style={{ position: "absolute" }}>
            <filter id="v14whip"><feGaussianBlur stdDeviation={`${blurX.toFixed(1)} ${blurY.toFixed(1)}`} /></filter>
          </svg>
          <div style={{
            position: "absolute", left: 0, top: 0, width: MAP_W, height: MAP_H, transformOrigin: "0 0",
            transform: `translate(${SW / 2 - o.x * cam.s + dr.x}px, ${SH / 2 - o.y * cam.s + dr.y}px) scale(${cam.s})`,
          }}>
            <Img src={staticFile("styles/satellite-explainer/map.jpg")} style={{ position: "absolute", left: 0, top: 0, width: MAP_W, height: MAP_H, maxWidth: "none" }} />

            {/* heat maps (satellite style) */}
            {heat1 > 0 && (
              <Img src={staticFile("styles/satellite-explainer/sst_nino.webp")} style={{
                position: "absolute", left: 0, top: 0, width: MAP_W, height: MAP_H, maxWidth: "none", opacity: heat1 * 0.85,
                clipPath: `inset(0 0 0 ${(1 - heatWipe1) * 100}%)`,
              }} />
            )}
            {heat2 > 0 && (
              <Img src={staticFile("styles/satellite-explainer/sst_nino.webp")} style={{
                position: "absolute", left: 0, top: 0, width: MAP_W, height: MAP_H, maxWidth: "none", opacity: heat2 * 0.85 * (1 - hotAll),
                clipPath: `inset(0 0 ${(1 - heatWipe2) * 100}% 0)`,
              }} />
            )}
            {hotAll > 0 && (
              <Img src={staticFile("styles/satellite-explainer/sst_hot.webp")} style={{ position: "absolute", left: 0, top: 0, width: MAP_W, height: MAP_H, maxWidth: "none", opacity: hotAll * 0.72 }} />
            )}

            {/* fan's cool breath, then the warm water that takes over */}
            <Blob lon={-100 - 16 * ramp(t, 2.4, 6.4)} lat={-4} w={1400 + 1000 * ramp(t, 2.4, 6.4)} h={900} t={t} o={coolAir * 0.75} color="rgba(80,200,255,.75)" core="rgba(190,240,255,.9)" seed="cool" />
            <Blob lon={warmLonE} lat={-2} w={2300 + 700 * ramp(t, 7, 9.5)} h={950} t={t} o={warmEarly * 0.72 * (1 - heat1 * 0.6)} color="rgba(255,90,90,.75)" core="rgba(255,150,150,.85)" seed="w1" />

            {/* trade winds */}
            <Streaks t={t} o={winds * (t < 46 ? 1 : 0.85)} lon0={-82} lon1={150} lat0={15} lat1={-15} n={75} speed={windSpeed} seed={1} width={9} />
            <Streaks t={t} o={windsLate} lon0={-82} lon1={150} lat0={12} lat1={-12} n={16} speed={0.8} seed={2} width={8} />

            {/* warm pool */}
            <Blob lon={warmLon} lat={-2} w={warmW} h={900} t={t} o={warmO} color="rgba(255,85,85,.78)" core="rgba(255,160,150,.9)" seed="pool" />
            {/* Australia glow + Indonesia rain belt */}
            <Blob lon={134} lat={-25} w={1300} h={900} t={t} o={win(t, 34.8, 38.9, 0.4, 0.5) * 0.55} color="rgba(255,220,60,.8)" seed="au" blur={40} />
            {/* Peru / Ecuador cold upwelling */}
            <Blob lon={-88} lat={-6} w={1700} h={1000} t={t} o={coldO * 0.85} color="rgba(60,210,255,.8)" core="rgba(200,250,255,.95)" seed="cold" />
            <Streaks t={t} o={coldO * 0.8} lon0={-100} lon1={-80} lat0={2} lat1={-14} n={12} speed={1.2} color="rgba(200,245,255,1)" width={5} seed={5} />

            {/* impacts */}
            <Blob lon={-112} lat={56} w={3000} h={950} t={t} o={win(t, 62.4, 71.7, 0.5, 0.6) * 0.8} color="rgba(255,60,50,.8)" core="rgba(255,120,90,.9)" seed="ca" rot={-16} blur={45} />
            <Blob lon={-97} lat={32} w={2500} h={560} t={t} o={win(t, 65.9, 71.7, 0.5, 0.6) * 0.9} color="rgba(40,140,255,.85)" core="rgba(140,210,255,.95)" seed="us" blur={35} />
            <Blob lon={-79} lat={-3} w={650} h={1400} t={t} o={win(t, 69.6, 74.4, 0.4, 0.5) * 0.95} color="rgba(20,90,255,.9)" core="rgba(110,180,255,1)" seed="sa" rot={18} blur={30} />
            <Blob lon={128} lat={-14} w={3000} h={1800} t={t} o={win(t, 71.8, 75.2, 0.5, 0.6) * 0.75} color="rgba(255,150,30,.85)" core="rgba(255,210,90,.9)" seed="dr" blur={50} />

            {/* now: the record warm tongue glow */}
            <Blob lon={-120} lat={-1} w={3600} h={700} t={t} o={now2O * 0.55 * (0.8 + 0.2 * Math.sin(t * 5))} color="rgba(255,40,40,.8)" seed="now" blur={50} />
            <Blob lon={-125} lat={0} w={4200} h={1400} t={t} o={win(t, 95.4, 101.5, 0.6, 1.2) * 0.8} color="rgba(255,90,40,.8)" core="rgba(255,190,120,.95)" seed="rel" />
          </div>
        </AbsoluteFill>
      )}

      {/* ===================== SCREEN-SPACE OVERLAYS (map scenes) ===================== */}
      {!inHook && !inGlobe && !inFamine && (
        <AbsoluteFill>
          {/* ---- the giant fan on the Peru coast */}
          {t < 18.6 && (() => {
            const p = S(-83, -5);
            const SZ = 330;
            const fx = p.x - 30, fy = p.y - 200;
            // failure: sputter (6.45–7.3), head droops and turns, colour drains
            const sput = t > 6.45 && t < 7.4 ? Math.sin(t * 55) * 5 * (1 - ramp(t, 6.45, 7.4)) + (Math.sin(t * 23) > 0.6 ? 3 : 0) : 0;
            const die = ramp(t, 7.05, 7.9, Easing.bezier(0.5, 0, 0.2, 1.4));
            const shrink = 1 - ramp(t, 17.5, 18.5);
            const spin = t < 6.45 ? 1 : 1 - ramp(t, 6.45, 7.45, (x) => x);
            const hx = fx - SZ * 0.06, hy = fy - SZ * 0.02 + die * SZ * 0.05;
            return (
              <>
                <AirCone x={hx - SZ * 0.2} y={hy} t={t} power={fanPow} o={ramp(t, 1.6, 2.2) * (1 - ramp(t, 7.4, 8.2))} />
                <Fan x={fx} y={fy} size={SZ} ang={fanAngle(t)} o={ramp(t, 1.2, 1.5) * shrink} s={pop(t, 1.3, 0.55) * (0.3 + 0.7 * shrink)}
                  wobble={sput - die * 7} speed={spin} nod={die * 24} tilt={-34 - die * 10} dead={die} />
                {/* sparks from the motor as it fails */}
                {[6.62, 6.95, 7.2].map((a, j) => {
                  const k = (t - a) / 0.45;
                  if (k <= 0 || k >= 1) return null;
                  return Array.from({ length: 9 }, (_, i) => {
                    const an = (i / 9) * Math.PI * 2 + j;
                    const d = 18 + k * (60 + (i % 3) * 25);
                    return <div key={j * 10 + i} style={{ position: "absolute", left: hx + SZ * 0.08 + Math.cos(an) * d, top: hy + Math.sin(an) * d + k * k * 40, width: 7, height: 7, borderRadius: 4, background: "#ffe27a", boxShadow: "0 0 10px 3px rgba(255,190,60,.9)", opacity: 1 - k }} />;
                  });
                })}
                {/* smoke from the back of the motor */}
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const k = (t - 7.2 - i * 0.14) / 1.9;
                  if (k <= 0 || k >= 1) return null;
                  return <div key={i} style={{ position: "absolute", left: hx + SZ * 0.12 + i * 10 - 35 + k * 30, top: hy - SZ * 0.2 - k * 220, width: 55 + k * 110, height: 55 + k * 110, borderRadius: "50%", background: "rgba(70,74,80,.6)", filter: "blur(16px)", opacity: (1 - k) * 0.9 }} />;
                })}
              </>
            );
          })()}
          {/* ring highlighting the East Pacific */}
          {t > 9.0 && t < 17.4 && (() => {
            const c = S(-112, -2);
            const k = ramp(t, 9.0, 10.0, (x) => x);
            return (
              <svg width={SW} height={SH} style={{ position: "absolute", left: 0, top: 0, opacity: 1 - ramp(t, 16.8, 17.4) }}>
                <ellipse cx={c.x} cy={c.y} rx={460} ry={250} fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round"
                  strokeDasharray={2300} strokeDashoffset={2300 * (1 - k)} transform={`rotate(-8 ${c.x} ${c.y})`} style={{ filter: "drop-shadow(0 0 10px rgba(255,255,255,.8))" }} />
              </svg>
            );
          })()}
          {/* labels */}
          {(() => {
            const L = (lon: number, lat: number, text: string, a: number, b: number, side: "l" | "r" | "c" = "c") => {
              const p = S(lon, lat);
              return <Label x={p.x} y={p.y} text={text} o={win(t, a, b, 0.25, 0.35)} s={pop(t, a)} t={t} side={side} />;
            };
            return (
              <>
                {L(-120, 8, "اقیانوس آرام", 3.9, 7.2)}
                {L(117, 0, "اندونزی", 33.6, 38.9, "l")}
                {L(134, -24, "استرالیا", 34.75, 38.9)}
                {L(-75, -10, "پرو", 40.2, 45.9, "r")}
                {L(-78.5, -1.5, "اکوادور", 41.2, 45.9, "r")}
                {L(-100, 57, "کانادا", 62.45, 65.3)}
                {L(-97, 27.5, "جنوب ایالات متحده", 64.5, 68.0)}
                {L(-75, 0, "آمریکای جنوبی", 68.6, 71.4, "r")}
              </>
            );
          })()}

          {/* trade-wind name + direction */}
          {(() => {
            const o1 = win(t, 20.7, 30.4, 0.3, 0.5) * (t < 49 ? 1 : 1 - ramp(t, 49.4, 50.2));
            const o2 = win(t, 47.0, 50.2, 0.3, 0.4);
            const p = S(-150, 17);
            const oo = Math.max(o1, o2);
            return oo > 0 ? (
              <div dir="rtl" style={{
                position: "absolute", left: p.x - 300, top: p.y - 60, width: 600, textAlign: "center", opacity: oo,
                transform: `rotate(-5deg) scale(${pop(t, t < 40 ? 20.75 : 47.0)}) translateY(${t > 49.4 ? ramp(t, 49.4, 50.2) * 60 : 0}px)`,
                fontFamily: FONT_UI, fontWeight: 900, fontSize: 64, color: "#fff", letterSpacing: 1,
                textShadow: "0 0 20px rgba(160,230,255,.9), 0 4px 12px rgba(0,0,0,.7)",
              }}>بادهای تجاری</div>
            ) : null;
          })()}
          {t > 22.5 && t < 24.6 && (
            <>
              {[0, 1, 2].map((i) => {
                const k = ((t - 22.6) * 1.2 + i / 3) % 1;
                const p = S(-130, 0);
                return <div key={i} style={{ position: "absolute", left: p.x + 260 - k * 520, top: p.y - 40, fontSize: 110, color: "#fff", opacity: Math.sin(k * Math.PI) * win(t, 22.6, 24.5, 0.2, 0.3), fontFamily: FONT_UI, fontWeight: 900, textShadow: "0 0 20px rgba(255,255,255,.8)" }}>‹</div>;
              })}
              {(() => { const p = S(-88, 6); return <Label x={p.x} y={p.y} text="شرق" o={win(t, 22.6, 24.5, 0.2, 0.3)} s={pop(t, 22.6)} t={t} />; })()}
              {(() => { const p = S(-175, 6); return <Label x={p.x} y={p.y} text="غرب" o={win(t, 23.15, 24.5, 0.2, 0.3)} s={pop(t, 23.15)} t={t} />; })()}
            </>
          )}

          {/* sailing ships riding the trade winds */}
          {[[-118, 9, 0], [-132, 4, 0.25], [-145, 11, 0.5]].map(([lon, lat, d], i) => {
            const a = 26.5 + d;
            const lonNow = lon - (t - 24.4) * 5.5;
            const p = S(lonNow, lat);
            const oo = win(t, a, 31.0, 0.3, 0.5);
            return oo > 0 ? (
              <React.Fragment key={i}>
                <div style={{ position: "absolute", left: p.x + 30, top: p.y + 58, width: 180, height: 6, borderRadius: 3, opacity: oo * 0.7, background: "linear-gradient(90deg, rgba(255,255,255,.9), transparent)" }} />
                <Icon name="sailboat" x={p.x} y={p.y + Math.sin(t * 3 + i) * 5} size={175} t={t} o={oo} s={pop(t, a)} rot={Math.sin(t * 2.5 + i) * 4} />
              </React.Fragment>
            ) : null;
          })}

          {/* rain over Indonesia, sun over the dry Peru coast */}
          {(() => { const p = S(122, -3); return <Rain x={p.x} y={p.y - 60} w={380} h={170} t={t} o={win(t, 36.55, 38.9, 0.3, 0.4) * 0.8} n={30} />; })()}
          {icon("cloud_rain", 108, 4, 36.45, 38.9, 180, -80)}
          {icon("storm", 124, 0, 36.7, 38.9, 160, -60)}
          {icon("cloud_rain", 140, -4, 36.95, 38.9, 150, -60)}
          {icon("cloud_sun", -72, -14, 44.6, 46.2, 190, -40)}

          {/* "every 2–7 years" chip */}
          {(() => {
            const oo = win(t, 47.0, 49.3, 0.25, 0.35);
            if (oo <= 0) return null;
            return (
              <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", opacity: oo }}>
                <div style={{ display: "inline-block", padding: "16px 34px", borderRadius: 50, background: "rgba(8,30,40,.72)", border: "2px solid rgba(255,255,255,.35)", transform: `scale(${pop(t, 47.0)})`, fontFamily: FONT_UI, fontWeight: 900, fontSize: 52, color: "#fff" }}>
                  هر <span style={{ color: "#ffd166", fontFamily: FONT_HERO, fontSize: 64 }}>۵</span> سال یه بار
                </div>
              </div>
            );
          })()}

          {/* thermometers in the East Pacific */}
          {[[-132, -2, 54.1, "+۱°"], [-112, 1, 54.45, "+۲°"], [-96, -4, 54.62, "+۱٫۵°"]].map(([lon, lat, a, txt], i) => {
            const p = S(lon as number, lat as number);
            return <Thermo key={i} x={p.x} y={p.y} level={0.25 + 0.5 * ramp(t, (a as number) + 0.2, (a as number) + 1.4)} o={win(t, a as number, 58.8, 0.2, 0.3)} s={1.4 * pop(t, a as number)} text={txt as string} />;
          })}

          {/* impacts icons */}
          {sun(-112, 60, 62.9, 65.3, 150, -20)}
          {sun(-92, 52, 63.2, 65.3, 130, -20)}
          {icon("cloud_rain", -102, 36, 66.05, 68.0, 170, -90)}
          {icon("cloud_rain", -86, 35, 66.3, 68.0, 150, -90)}
          {icon("storm", -80, -1, 69.7, 71.6, 190, -90)}
          {sun(118, -3, 72.9, 74.6, 150)}
          {sun(124, -17, 73.2, 74.6, 170, -60)}
          {(() => { const p = S(118, 2); return <Label x={p.x} y={p.y} text="اندونزی" o={win(t, 71.4, 74.5, 0.2, 0.3)} s={pop(t, 71.4)} t={t} side="l" />; })()}
          {(() => { const p = S(134, -30); return <Label x={p.x} y={p.y} text="استرالیا" o={win(t, 72.1, 74.5, 0.2, 0.3)} s={pop(t, 72.1)} t={t} />; })()}
          {/* drought cracks over Australia */}
          {t > 72.9 && t < 74.6 && (() => {
            const p = S(134, -24);
            const k = ramp(t, 72.95, 73.9);
            return (
              <svg width={600} height={420} viewBox="0 0 600 420" style={{ position: "absolute", left: p.x - 300, top: p.y - 210, opacity: win(t, 72.9, 74.55, 0.2, 0.3) }}>
                {["M300 210 L240 150 L200 90 L150 70", "M300 210 L380 170 L450 110", "M300 210 L330 290 L300 350 L330 400", "M300 210 L200 260 L120 250", "M240 150 L180 170", "M380 170 L400 250 L470 290", "M330 290 L410 330"].map((d, i) => (
                  <path key={i} d={d} fill="none" stroke="rgba(60,25,5,.85)" strokeWidth={6 - i * 0.4} strokeLinecap="round" strokeDasharray={400} strokeDashoffset={400 * (1 - k)} />
                ))}
              </svg>
            );
          })()}

          {/* ---- NOW: satellite data frame */}
          {(() => {
            const oo = win(t, 84.1, 97.0, 0.4, 0.8);
            if (oo <= 0) return null;
            const scan = ramp(t, 84.4, 86.0, (x) => x);
            return (
              <AbsoluteFill style={{ opacity: oo }}>
                {scan < 1 && <div style={{ position: "absolute", left: 0, right: 0, top: scan * SH - 3, height: 6, background: "rgba(255,255,255,.9)", boxShadow: "0 0 30px 8px rgba(255,255,255,.6)" }} />}
                <div dir="rtl" style={{ position: "absolute", left: 40, right: 40, top: 150, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 28px", borderRadius: 22, background: "rgba(5,15,22,.72)", border: "1px solid rgba(255,255,255,.18)", fontFamily: FONT_UI, fontWeight: 700, fontSize: 34, color: "#fff" }}>
                  <span><span style={{ color: "#ff4d4d" }}>●</span> داده‌ی ماهواره‌ای · دمای سطح آب</span>
                  <span style={{ opacity: 0.8, fontFamily: FONT_HERO }}>{FA(2026)}</span>
                </div>
                <div style={{ position: "absolute", left: 90, right: 90, top: 268, height: 18, borderRadius: 9, background: "linear-gradient(90deg, #2a3cbe, #50bee6, #eef0e6, #fadc50, #f58c23, #d7231e, #780023)" }} />
                <div dir="rtl" style={{ position: "absolute", left: 90, right: 90, top: 292, display: "flex", justifyContent: "space-between", fontFamily: FONT_UI, fontWeight: 700, fontSize: 28, color: "rgba(255,255,255,.85)" }}>
                  <span>گرم‌تر</span><span>عادی</span><span>سردتر</span>
                </div>
              </AbsoluteFill>
            );
          })()}
          {/* record badge */}
          {(() => {
            const oo = win(t, 87.9, 90.6, 0.25, 0.35);
            if (oo <= 0) return null;
            return (
              <div dir="rtl" style={{ position: "absolute", left: 0, top: 560, width: SW, textAlign: "center", opacity: oo, transform: `scale(${pop(t, 87.9)})` }}>
                <span style={{ display: "inline-block", padding: "14px 34px", borderRadius: 16, background: "#e0231a", fontFamily: FONT_UI, fontWeight: 900, fontSize: 54, color: "#fff", boxShadow: `0 0 ${30 + 20 * Math.sin(t * 8)}px rgba(255,40,30,.9)` }}>قوی‌ترین تا امروز؟</span>
              </div>
            );
          })()}
          {/* big thermometer + counter */}
          {(() => {
            const oo = win(t, 90.6, 95.3, 0.3, 0.4);
            if (oo <= 0) return null;
            const v = interpolate(t, [91.0, 93.6, 94.3], [0, 3.0, 3.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => 1 - Math.pow(1 - x, 2) });
            return (
              <>
                <Thermo x={820} y={1180} level={v / 3.3} o={oo} s={1.9 * pop(t, 90.6)} />
                <div style={{ position: "absolute", left: 60, top: 760, direction: "ltr", fontFamily: FONT_HERO, fontSize: 170, color: "#fff", opacity: oo, textShadow: "0 0 30px rgba(255,50,40,.9), 0 0 80px rgba(255,50,40,.6), 0 8px 16px rgba(0,0,0,.6)" }}>
                  +{FA(v.toFixed(1)).replace(".", "٫")}°C
                </div>
              </>
            );
          })()}

          {/* heat rising into the atmosphere */}
          {t > 95.3 && t < 101 && Array.from({ length: 14 }, (_, i) => {
            const lon = -165 + i * 6.3, lat = -4 + ((i * 37) % 9) - 4;
            const p = S(lon, lat);
            const a = 95.5 + (i % 7) * 0.2;
            const k = ramp(t, a, a + 1.2);
            const oo = win(t, a, 100.9, 0.2, 0.6);
            const len = 260 + (i % 4) * 90;
            return oo > 0 ? (
              <svg key={i} width={60} height={len * k + 60} style={{ position: "absolute", left: p.x - 30, top: p.y - len * k - 40, opacity: oo, overflow: "visible" }}>
                <defs><linearGradient id={`ar${i}`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ff7a2e" stopOpacity={0} /><stop offset="1" stopColor="#ff8a3c" /></linearGradient></defs>
                <path d={`M30 ${len * k + 40} Q ${30 + Math.sin(i) * 16} ${(len * k) / 2 + 40} 30 34`} stroke={`url(#ar${i})`} strokeWidth={15} fill="none" strokeLinecap="round" />
                <polygon points="30,-6 6,40 54,40" fill="#ff8a3c" />
              </svg>
            ) : null;
          })}
          {/* atmosphere arc */}
          <div style={{ position: "absolute", left: -300, right: -300, top: -1650, height: 1900, borderRadius: "50%", boxShadow: `0 40px 60px -10px rgba(255,90,40,${0.9 * win(t, 96.8, 104.5, 1.0, 0.8)})`, opacity: win(t, 96.8, 104.5, 1.0, 0.8) }} />
          {/* global heat grade */}
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 10%, rgba(255,210,120,.75), rgba(255,110,30,.35) 45%, rgba(120,20,0,.2) 100%)", mixBlendMode: "screen", opacity: hotAll * (1 - ramp(t, 104.2, 105.3)) }} />
        </AbsoluteFill>
      )}

      {/* ===================== GLOBE: the world's weather goes crazy ===================== */}
      {inGlobe && (() => {
        const k = t - GLOBE[0];
        const shake = drift(t, 0, 6 + 14 * ramp(k, 0.6, 2.2));
        const flash = noise2D("lt", Math.floor(t * 12), 0) > 0.55 ? 1 : 0;
        const heat = 0.08 + 0.3 * ramp(k, 0.5, 2.5);
        const blown = HAVE.earth_mindblown && k > 1.25;
        return (
          <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #0d3a3f 0%, #051317 70%)" }}>
            {Array.from({ length: 60 }, (_, i) => (
              <div key={i} style={{ position: "absolute", left: (i * 173) % SW, top: (i * 331) % SH, width: 3, height: 3, borderRadius: 2, background: "#fff", opacity: 0.25 + 0.5 * ((i * 7) % 5) / 5 }} />
            ))}
            <div style={{ position: "absolute", inset: 0, transform: `translate(${shake.x}px, ${shake.y}px) scale(${0.85 + 0.2 * ramp(k, 0, 0.5)})` }}>
              {!blown && <Globe size={900} lon0={-100 + k * 35} lat0={10} heat={heat} x={SW / 2} y={880} />}
              {blown && <Img src={staticFile("styles/satellite-explainer/img/earth_mindblown.webp")} style={{ position: "absolute", left: SW / 2 - 420, top: 880 - 460, width: 840, height: 840, maxWidth: "none", transform: `scale(${pop(t, GLOBE[0] + 1.25, 0.5)})` }} />}
              {(["storm", "sun", "cloud_rain", "storm", "sun"] as const).map((n, i) => {
                const ang = k * 1.6 + (i * Math.PI * 2) / 5;
                return <Icon key={i} name={n} x={SW / 2 + Math.cos(ang) * 470} y={880 + Math.sin(ang) * 470 * 0.55} size={170} t={t} o={ramp(k, 0.15 + i * 0.1, 0.4 + i * 0.1)} s={pop(t, GLOBE[0] + 0.15 + i * 0.1)} />;
              })}
            </div>
            <AbsoluteFill style={{ background: "rgba(200,230,255,.5)", opacity: flash * 0.35 * ramp(k, 0.4, 0.8) }} />
          </AbsoluteFill>
        );
      })()}

      {inHook && <Hook t={tReal} end={HOOK_END} />}
      {!inHook && tReal < HOOK_END + 0.4 && <AbsoluteFill style={{ background: "#fff", opacity: 0.85 * (1 - ramp(tReal, HOOK_END, HOOK_END + 0.4)) }} />}

      {/* ===================== 1876–1878 ===================== */}
      {inFamine && <Famine t={t - FAMINE[0]} dur={FAMINE[1] - FAMINE[0]} />}

      {/* ===================== TITLES ===================== */}
      {(() => {
        const s1 = pop(t, 11.62, 0.5);
        const one = t >= 11.6 && t < 14.6;
        const two = t >= 14.6 && t < 17.1;
        const out = 1 - ramp(t, 16.6, 17.1);
        return (
          <>
            {one && <Title text="النینیو" o={1} s={s1} glow="rgba(40,110,255,.95)" y={740} size={170} />}
            {two && <Title text="سوپر النینیو" o={out} s={pop(t, 14.6, 0.4) * (1 + 0.03 * Math.sin(t * 9))} glow="rgba(255,40,30,.95)" y={740} size={170} shake={drift(t, 0, 10 * (1 - ramp(t, 14.6, 15.4)))} />}
          </>
        );
      })()}
      {/* 2027 */}
      {t > 100.6 && (() => {
        const s = pop(t, 100.68, 0.5);
        const hz = noise2D("hz", t * 3, 0) * 3;
        return (
          <>
            <div style={{
              position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", direction: "ltr", fontFamily: FONT_HERO, fontSize: 290, color: "#fff",
              transform: `scale(${s}) skewX(${hz * 0.6}deg)`, opacity: 1 - ramp(t, 104.6, 105.3),
              textShadow: "0 0 30px rgba(255,140,40,1), 0 0 90px rgba(255,80,20,.9), 0 0 160px rgba(255,60,0,.7), 0 10px 20px rgba(0,0,0,.5)",
            }}>{FA(2027)}</div>
            <div dir="rtl" style={{
              position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center", fontFamily: FONT_UI, fontWeight: 900, fontSize: 64, color: "#fff",
              opacity: win(t, 102.35, 105.3, 0.3, 0.6), transform: `translateY(${(1 - ramp(t, 102.35, 102.8)) * 30}px)`,
              textShadow: "0 0 24px rgba(255,90,20,.9), 0 4px 12px rgba(0,0,0,.6)",
            }}>گرم‌ترین سالِ تاریخ</div>
          </>
        );
      })()}

      {/* flashes on the two slams and the scene cuts */}
      <AbsoluteFill style={{ background: "#fff", pointerEvents: "none", opacity:
        Math.max(1 - ramp(t, 14.6, 14.95), 0) * (t >= 14.6 ? 0.55 : 0)
        + (t >= 100.68 ? (1 - ramp(t, 100.68, 101.1)) * 0.7 : 0)
        + (t >= GLOBE[0] ? (1 - ramp(t, GLOBE[0], GLOBE[0] + 0.25)) * 0.6 : 0)
        + (t >= GLOBE[1] ? (1 - ramp(t, GLOBE[1], GLOBE[1] + 0.25)) * 0.5 : 0)
        + (t >= FAMINE[1] ? (1 - ramp(t, FAMINE[1], FAMINE[1] + 0.35)) * 0.6 : 0) }} />

      {/* grade: vignette + grain */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,10,15,.45) 100%)", pointerEvents: "none" }} />
      <AbsoluteFill style={{ opacity: 0.06, mixBlendMode: "overlay", backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' seed='${frame % 7}'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")` }} />

      <Captions t={tReal} groups={inHook ? GROUPS_HOOK : GROUPS} hide={t > 100.6} />
      <AbsoluteFill style={{ background: "#000", opacity: ramp(t, 104.9, 105.5) }} />

      {audio && <Html5Audio src={staticFile("styles/satellite-explainer/mix.mp3")} />}
    </AbsoluteFill>
  );
};
