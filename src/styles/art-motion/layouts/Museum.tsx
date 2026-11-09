// Art Motion · «موزه‌ی متحرک» — a vertical reel that shows one art style like a painting on a gallery wall:
// a spot-lit dark wall, the moving painting in a frame that suits it (gold / black + mat / wood / glowing screen),
// entered by its signature transition, and a Persian placard (name, era, palette, transition, best use).
// Props are all data: { style: ArtStyle id, from?: scene the transition starts from, total? }.
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ArtFilmCanvas } from "../ArtCanvas";
import { ART } from "../runtime";
import { ART_STYLES, paletteOf, styleById, type ArtStyle } from "../catalog";
import { AM, useArtFonts } from "../fonts";

export const MUSEUM_SECONDS = 6.5;
const ORANGE = "#FF7A3D";
const PW = 960, PH = 540, PX = (1080 - PW) / 2, PY = 380;

const ease = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

const FRAMES: Record<string, { pad: number; style: React.CSSProperties; mat?: number; matCol?: string }> = {
  gold: {
    pad: 34,
    style: {
      background: "linear-gradient(135deg,#7a5418 0%,#f0d07e 22%,#a8792a 42%,#f6dc96 62%,#8a6420 82%,#e8c26a 100%)",
      boxShadow: "inset 0 0 0 3px rgba(60,38,8,.55), inset 0 0 0 9px rgba(255,236,170,.35), inset 0 0 18px 10px rgba(70,44,10,.55), 0 50px 90px rgba(0,0,0,.65)",
    },
    mat: 8,
    matCol: "#2a1c0c",
  },
  black: { pad: 18, style: { background: "#0d0d0f", boxShadow: "0 50px 90px rgba(0,0,0,.65), inset 0 0 0 1px rgba(255,255,255,.08)" }, mat: 30, matCol: "#efe9dd" },
  wood: {
    pad: 30,
    style: {
      background: "repeating-linear-gradient(90deg,#3d2616 0px,#4a2f1b 7px,#36210f 13px,#55361f 21px), linear-gradient(#5b3a22,#2e1a0c)",
      boxShadow: "inset 0 0 0 2px rgba(220,170,90,.35), inset 0 0 14px 6px rgba(0,0,0,.5), 0 50px 90px rgba(0,0,0,.65)",
    },
    mat: 10,
    matCol: "#e8dcc3",
  },
  none: { pad: 0, style: {} },
};

const Rise: React.FC<{ t: number; at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, at, children, style }) => {
  const k = ease(t, at, at + 0.5);
  return <div style={{ opacity: k, transform: `translateY(${(1 - k) * 22}px)`, ...style }}>{children}</div>;
};

export const Museum: React.FC<{ style: string; from?: string; total?: number; t?: number }> = ({ style, from, total = 63, t: tIn }) => {
  ART.labels = "off"; // the placard names the style; the painting stays clean
  const ok = useArtFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = tIn ?? frame / fps;
  const S = styleById(style) as ArtStyle;
  const i = ART_STYLES.indexOf(S);
  const prev = from ?? ART_STYLES[(i - 1 + ART_STYLES.length) % ART_STYLES.length].scene!;
  const segs = [
    { id: prev, dur: 0.5 },
    { id: S.scene!, dur: MUSEUM_SECONDS, transition: S.transition },
  ];
  const fr = FRAMES[S.frame ?? "black"];
  const pal = paletteOf(S);
  const glow = pal[0] ?? "#8090ff";
  const appear = ease(t, 0, 0.45);
  const push = interpolate(t, [0, MUSEUM_SECONDS], [1, 1.035]);
  const lineW = ease(t, 1.35, 1.9) * 260;
  // dust in the spotlight: deterministic, slow, always moving
  const dust = Array.from({ length: 22 }, (_, k) => {
    const r = (n: number) => ((Math.sin(k * 127.1 + n * 311.7) * 43758.5453) % 1 + 1) % 1;
    const sp = 18 + r(1) * 26, y = 1250 - ((t * sp + r(2) * 1100) % 1100), x = 540 + (r(3) - 0.5) * 760 + Math.sin(t * 0.6 + k) * 18;
    return { x, y, s: 2 + r(4) * 3, a: 0.15 + r(5) * 0.35 };
  });
  if (!ok) return <AbsoluteFill style={{ background: "#0f0d11" }} />;
  return (
    <AbsoluteFill style={{ background: "#0f0d11", overflow: "hidden" }}>
      {/* wall: soft plaster gradient, the spot from above, a vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 42% at 50% 30%, rgba(255,226,180,.20), rgba(255,226,180,0) 70%), linear-gradient(#1b171d,#0e0c10)" }} />
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,.012) 0 2px, rgba(0,0,0,.012) 2px 4px)" }} />
      {dust.map((d, k) => (
        <div key={k} style={{ position: "absolute", left: d.x, top: d.y, width: d.s, height: d.s, borderRadius: "50%", background: "#ffe6c0", opacity: d.a * appear, filter: "blur(0.6px)" }} />
      ))}
      {/* header */}
      <Rise t={t} at={0.05} style={{ position: "absolute", top: 170, left: 0, width: 1080, textAlign: "center" }}>
        <div style={{ fontFamily: AM.hud, fontWeight: 600, fontSize: 26, letterSpacing: 7, color: ORANGE }}>NFP-ALVANA · ART MOTION</div>
        <div style={{ fontFamily: AM.fa, fontWeight: 600, fontSize: 28, color: "rgba(240,232,220,.7)", marginTop: 10, direction: "rtl" }}>
          سبک {S.no} از {total}
        </div>
      </Rise>
      {/* the painting */}
      <div
        style={{
          position: "absolute",
          left: PX - fr.pad - (fr.mat ?? 0),
          top: PY - fr.pad - (fr.mat ?? 0),
          width: PW + 2 * (fr.pad + (fr.mat ?? 0)),
          height: PH + 2 * (fr.pad + (fr.mat ?? 0)),
          opacity: appear,
          transform: `translateY(${(1 - appear) * 30}px)`,
          ...fr.style,
          ...(S.frame === "none" ? { borderRadius: 22, boxShadow: `0 0 90px ${glow}66, 0 40px 90px rgba(0,0,0,.6)`, border: "1px solid rgba(255,255,255,.14)" } : {}),
        }}
      >
        <div style={{ position: "absolute", left: fr.pad, top: fr.pad, right: fr.pad, bottom: fr.pad, background: fr.matCol ?? "transparent", boxShadow: fr.mat ? "inset 0 0 12px rgba(0,0,0,.35)" : undefined }} />
        <div style={{ position: "absolute", left: fr.pad + (fr.mat ?? 0), top: fr.pad + (fr.mat ?? 0), width: PW, height: PH, overflow: "hidden", borderRadius: S.frame === "none" ? 20 : 0, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.4)" }}>
          <div style={{ width: PW, height: PH, transform: `scale(${push})` }}>
            <ArtFilmCanvas segs={segs} t={t} />
          </div>
        </div>
      </div>
      {/* placard */}
      <div style={{ position: "absolute", top: 1035, left: 60, width: 960, textAlign: "center", direction: "rtl", color: "#F3ECE2" }}>
        <Rise t={t} at={0.75}>
          <div style={{ fontFamily: AM.fa, fontWeight: 900, fontSize: 100, lineHeight: 1.15 }}>{S.fa}</div>
        </Rise>
        <Rise t={t} at={0.95}>
          <div style={{ fontFamily: AM.hud, fontWeight: 600, fontSize: 34, letterSpacing: 4, color: "#bfb3a4", direction: "ltr", marginTop: 4 }}>{S.en.toUpperCase()}</div>
        </Rise>
        <Rise t={t} at={1.1}>
          <div style={{ fontFamily: AM.fa, fontWeight: 600, fontSize: 34, color: "#d9ccbb", marginTop: 14 }}>{S.era}</div>
        </Rise>
        <div style={{ height: 4, width: lineW, background: ORANGE, margin: "26px auto 26px", borderRadius: 2, boxShadow: `0 0 14px ${ORANGE}88` }} />
        <div style={{ display: "flex", justifyContent: "center", gap: 18, direction: "ltr" }}>
          {pal.slice(0, 6).map((c, k) => {
            const q = ease(t, 1.55 + k * 0.07, 1.95 + k * 0.07);
            return (
              <div key={k} style={{ textAlign: "center", opacity: q, transform: `scale(${0.6 + 0.4 * q})` }}>
                <div style={{ width: 58, height: 58, borderRadius: 29, background: c, boxShadow: "0 0 0 3px rgba(255,255,255,.14), 0 8px 18px rgba(0,0,0,.5)" }} />
                <div style={{ fontFamily: AM.hud, fontWeight: 500, fontSize: 17, color: "#9d9284", marginTop: 8 }}>{c.toUpperCase()}</div>
              </div>
            );
          })}
        </div>
        <Rise t={t} at={2.05}>
          <div style={{ fontFamily: AM.fa, fontWeight: 600, fontSize: 31, color: "#e9dfd2", marginTop: 30 }}>
            <span style={{ color: ORANGE }}>ترنزیشن امضا: </span>
            {S.trFa}
          </div>
        </Rise>
        <Rise t={t} at={2.25}>
          <div style={{ fontFamily: AM.fa, fontWeight: 400, fontSize: 29, lineHeight: 1.6, color: "#cfc3b4", marginTop: 12 }}>
            <span style={{ color: ORANGE, fontWeight: 600 }}>مناسب برای: </span>
            {S.best}
          </div>
        </Rise>
      </div>
      {/* a soft vignette over everything */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
