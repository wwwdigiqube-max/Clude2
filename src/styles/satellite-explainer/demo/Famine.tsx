import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { noise2D } from "@remotion/noise";
import { FA, clamp01, pop, ramp } from "./geo";
import { FONT_HERO, FONT_UI, Icon } from "./fx";

// 1876–1878: old-film look over a sepia world map, famine regions, death toll counter.
// t = seconds since the start of the scene
const WW = 3900; // world width on screen (px) → 10.8 px/deg
const latC = 8;
let lonC = 40;
const wx = (lon: number) => { let d = lon - lonC; while (d > 180) d -= 360; while (d < -180) d += 360; return 540 + d * (WW / 360); };
const wy = (lat: number) => 960 - (lat - latC) * (WW / 360);

const SPOTS: [number, number, number][] = [
  // lon, lat, appear (s)
  [78, 20, 4.5], [112, 36, 4.75], [31, 25, 6.15], [26, -27, 6.4], [-7, 32, 6.65], [-40, -7, 7.6],
];

export const Famine: React.FC<{ t: number; dur: number }> = ({ t, dur }) => {
  const fr = Math.floor(t * 24); // film runs at 24 "frames" for flicker/jitter
  const jit = { x: noise2D("fj", fr, 0) * 3, y: noise2D("fj", 0, fr) * 4 };
  const flick = 0.9 + 0.1 * noise2D("fl", fr * 0.7, 1);
  // start on the Pacific (the 1877 El Niño), then swing west to the famine lands
  lonC = interpolate(t, [0, 3.2, 4.3, 5.2, 6.3, 7.0, 7.8, dur], [-140, -130, 96, 92, 22, 18, -30, -33], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => x * x * (3 - 2 * x) });
  const pan = 0;
  const mapL = 540 - (lonC + 180) * (WW / 360);
  const inO = ramp(t, 0, 0.5);
  const outO = 1 - ramp(t, dur - 0.35, dur);
  const yearK = clamp01((t - 0.45) / 0.9);
  const yearTxt = "۱۸۷۶–۱۸۷۸".slice(0, Math.ceil(yearK * 9));
  const tongue = ramp(t, 1.9, 2.7);
  const cnt = interpolate(t, [5.75, 7.9], [0, 40_000_000], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => 1 - Math.pow(1 - x, 3) });
  const cntO = ramp(t, 5.6, 5.95);
  const pctO = pop(t, 6.55, 0.5);
  const fmt = (n: number) => FA(Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "٬"));
  return (
    <AbsoluteFill style={{ background: "#0d0a07", opacity: inO * outO }}>
      <AbsoluteFill style={{ transform: `translate(${jit.x - pan}px, ${jit.y}px)`, filter: `sepia(0.85) contrast(1.15) brightness(${0.78 * flick}) saturate(0.8)` }}>
        {[-1, 0, 1].map((k) => <Img key={k} src={staticFile("styles/satellite-explainer/world.jpg")} style={{ position: "absolute", left: mapL + k * WW, top: wy(90), width: WW, height: WW / 2, maxWidth: "none" }} />)}
        {/* the 1877 El Niño warm tongue (sepia red) */}
        <div style={{
          position: "absolute", left: wx(-170) - 0 * (WW / 360), top: wy(8), width: 95 * (WW / 360), height: 16 * (WW / 360), opacity: tongue * 0.8,
          borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,120,90,.95), rgba(255,90,70,.5) 55%, transparent)", filter: "blur(18px)",
        }} />
      </AbsoluteFill>

      {/* famine markers */}
      {SPOTS.map(([lon, lat, a], i) => {
        const s = pop(t, a, 0.5);
        const x = wx(lon) - pan + jit.x, y = wy(lat) + jit.y;
        const ring = ((t - a) * 0.9) % 1;
        return s > 0 ? (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: x - 60 * ring - 20, top: y - 60 * ring - 20, width: 40 + 120 * ring, height: 40 + 120 * ring, borderRadius: "50%", border: "4px solid rgba(220,40,30,.8)", opacity: (1 - ring) * s }} />
            <div style={{ position: "absolute", left: x - 1.5, top: y, width: 3, height: 56 * s, background: "rgba(220,40,30,.9)" }} />
            <Icon name="wheat_dry" x={x} y={y - 8} size={92} o={1} t={t} s={s} />
          </React.Fragment>
        ) : null;
      })}

      {/* year */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", direction: "ltr",
        fontFamily: FONT_HERO, fontSize: 150, color: "#f3e6cf", opacity: yearK > 0 ? 1 : 0,
        textShadow: "0 0 30px rgba(255,190,120,.35), 0 6px 18px rgba(0,0,0,.8)", letterSpacing: 2,
        transform: `translate(${jit.x}px, ${jit.y}px) scale(${1 + 0.04 * (1 - ramp(t, 0.4, 1.6))})`,
      }}>{yearTxt}</div>

      {/* death toll */}
      <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", opacity: cntO }}>
        <div style={{ fontFamily: FONT_UI, fontWeight: 800, fontSize: 44, color: "#f0d9b5", textShadow: "0 3px 10px #000" }}>حدود</div>
        <div style={{ fontFamily: FONT_HERO, fontSize: 118, color: "#fff", lineHeight: 1.1, textShadow: "0 0 26px rgba(230,30,20,.9), 0 0 60px rgba(230,30,20,.6), 0 6px 14px #000" }}>
          {fmt(cnt)} <span style={{ fontSize: 60 }}>نفر</span>
        </div>
        <div style={{
          display: "inline-block", marginTop: 16, padding: "10px 28px", borderRadius: 40, background: "rgba(200,25,20,.9)",
          fontFamily: FONT_UI, fontWeight: 800, fontSize: 44, color: "#fff", transform: `scale(${pctO})`, opacity: pctO > 0 ? 1 : 0,
          boxShadow: "0 8px 30px rgba(200,25,20,.5)",
        }}>۳٪ جمعیت جهان</div>
      </div>

      {/* film: sprockets, scratches, dust, vignette, grain */}
      {[0, 1].map((side) => (
        <div key={side} style={{ position: "absolute", top: -60 + ((t * 480) % 96), [side ? "right" : "left"]: 0, width: 64, height: 2200, background: "#050403" }}>
          {Array.from({ length: 23 }, (_, i) => <div key={i} style={{ position: "absolute", left: 18, top: i * 96 + 20, width: 28, height: 44, borderRadius: 7, background: "#cfc3ad", opacity: 0.85 }} />)}
        </div>
      ))}
      {[0, 1, 2].map((i) => {
        const on = noise2D("sc" + i, fr * 0.31, 2) > 0.35;
        return on ? <div key={i} style={{ position: "absolute", left: 120 + ((noise2D("sx" + i, fr * 0.2, 0) + 1) / 2) * 840, top: 0, width: 2, height: 1920, background: "rgba(255,245,225,.35)" }} /> : null;
      })}
      {Array.from({ length: 10 }, (_, i) => {
        const n = noise2D("dust" + i, fr * 1.3, i);
        return n > 0.55 ? <div key={i} style={{ position: "absolute", left: ((noise2D("dx" + i, fr, 1) + 1) / 2) * 1080, top: ((noise2D("dy" + i, 1, fr) + 1) / 2) * 1920, width: 5 + 8 * n, height: 5 + 8 * n, borderRadius: "50%", background: "rgba(20,15,10,.8)" }} /> : null;
      })}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(10,6,2,.85) 100%)" }} />
    </AbsoluteFill>
  );
};
