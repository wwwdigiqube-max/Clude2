// Video 23 · S10 · «بیشتر از 20 سبک… با NFP… هر کدومشون رو می‌تونید تغییر بدید… اینستاگرام یا یوتیوب با Claude» (88.0 – 98.65)
// the 24-style wall flips in tile by tile → «20+» / «NFP» slam → zoom into one tile + a style inspector (colour / font / rhythm,
// live hue change) → the restyled tile flies into an Instagram phone; a YouTube watch page slides in; Claude feeds both.
import React from "react";
import { Clip, Ico } from "./ui";
import { C, MONO, NUM, S, UI, clamp, ease, hit, kfmt, lerp, pop, ramp, spring } from "./lib";
import { Av, B, ClaudeMark, Full, IgTile, L, MeAv, NfpAv, NfpMark, Pointer, SP, Shock, StatusBar, Still, T, XI, YtLockup, drift, shake, track, trackV } from "./c-kit";

const TW = 240, TH = 426, GX = 256, GY = 442, WW = 1008, WH = 2636;
const NAMES = ["HOLOGRAM HUD", "ATOMIC AGE", "TEST REEL", "STICK TOON", "SATELLITE", "RECEIPT UI", "LAUNCH REEL", "HALFTONE POP", "STORY MONTAGE", "DOCUMENTARY", "COSMIC WEB", "LIGHT SWARM", "PAPER BLUEPRINT", "PHOTOCOPY", "PIXEL COLLAGE", "DOC STARTER"];
const REELS = ["REEL · PAPER", "REEL · LAUNCH", "REEL · NOIR TYPE", "REEL · PHOTOCOPY", "REEL · DOCUMENTARY", "REEL · LIGHT SWARM", "REEL · TEST REEL", "REEL · HOLOGRAM"];
const tileName = (i: number) => (i < 16 ? NAMES[i] : REELS[i - 16]);
const tReveal = (i: number) => (i < 8 ? 0 : 88.06 + (i - 8) * 0.026);
const FLY = 0.22;
// colour stops of the hue slider (no green: amber → red → magenta → violet → blue)
const STOPS = ["#FF9A2E", "#F7782A", "#E5383B"]; // amber → orange → red (slider range)
const SWATCH = ["#FF9A2E", "#F7782A", "#E5383B", "#EEF3F5"]; // + ice white
const HEX = ["#FF9A2E", "#F7782A", "#E5383B"];
const FONTS = [{ f: MONO, n: "Chakra" }, { f: NUM, n: "Baskerville" }, { f: UI, n: "Inter" }];


export const S10Wall: React.FC<SP> = ({ t }) => {
  if (t < 88.0 || t > 98.65) return null;
  const T20 = S(251), TNFP = S(256), TIG = S(269), TYT = S(271), TCL = S(273);
  // ── wall camera
  const [fx, fy, ax, ay, cs, rx, rz] = trackV(t, [
    [88.0, [504, 520, 540, 600, 1.32, 16, -5]],
    [88.45, [504, 700, 540, 690, 1.02, 12, -3.5]],
    [89.4, [504, 1300, 540, 760, 0.7, 9, -2.5]],
    [91.95, [504, 1318, 540, 760, 0.62, 6, -1.5]],
    [92.5, [504, 1318, 540, 760, 0.64, 2, 0]],
    [93.25, [120, 213, 300, 640, 2.0, 0, 0]],
    [94.8, [120, 213, 300, 640, 2.0, 0, 0]],
  ], ease.io);
  const sh = shake(t, T20, 16, 0.5), sh2 = shake(t, TNFP, 10, 0.4);
  const dr = drift(t, 0.8);
  const ent = ease.out(ramp(t, 88.0, 88.4));
  const scrim = ramp(t, T20 - 0.14, T20 + 0.06) * (1 - ease.io(ramp(t, 92.0, 92.45)));
  const dim = ease.io(ramp(t, 92.55, 93.1));
  const wallOut = ease.in(ramp(t, 94.78, 95.12));
  // inspector values
  const u = track(t, [[93.84, 0], [94.06, 1.0], [94.18, 0.86], [94.34, 0.5]]);
  const hue = -38 * u;
  const fontI = t >= 94.42 ? 1 : 0;
  const bpm = Math.round(track(t, [[94.5, 96], [94.74, 128]]));
  const beatPer = 60 / bpm;
  const beat = t > 93.3 ? Math.exp(-((t - 93.3) % beatPer) * 9) : 0;
  const kPanel = ease.out(ramp(t, S(263) - 0.25, S(263) + 0.15)) * (1 - ease.in(ramp(t, 94.78, 95.05)));
  // flight of the restyled tile into the phone
  const fly = ease.io(ramp(t, 94.8, 95.42));
  const PH = { x: 44, y: 376, w: 424 };
  const phH = PH.w * 2.05, bez = PH.w * 0.035;
  const scr = { x: PH.x + bez, y: PH.y + bez, w: PH.w - 2 * bez, h: phH - 2 * bez, r: PH.w * 0.11 };
  const tileScr = { x: 300 - 120 * 2.0, y: 640 - 213 * 2.0, w: TW * 2.0, h: TH * 2.0, r: 36 };
  const kPhone = ease.out(ramp(t, 95.12, 95.42));
  const kUi = (d = 0) => ease.out(ramp(t, TIG - 0.16 + d, TIG - 0.16 + d + 0.28));
  const kYt = spring(t, TYT - 0.12, 0.6, 0.22);
  const kCl = pop(t, TCL - 0.04, 0.42);
  const beamK = ease.out(ramp(t, TCL + 0.12, TCL + 0.45));
  const arrive = TCL + 0.75;
  const out = ease.in(ramp(t, 98.36, 98.64));
  const filt = `hue-rotate(${hue}deg) saturate(${1 + u * 0.25})`;
  return (
    <Full style={{ transform: `translate(${-out * 1250}px, 0) skewX(${out * 6}deg)`, opacity: 1 - out * 0.4 }}>
      {/* ═══ the wall ═══ */}
      {wallOut < 1 && (
        <div style={{ position: "absolute", inset: 0, perspective: 2400, perspectiveOrigin: "540px 760px", filter: scrim > 0.02 ? `blur(${scrim * 7}px)` : undefined, opacity: (1 - wallOut) * Math.min(1, ent * 1.5), transform: `translateY(${wallOut * 500}px)` }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: WW, height: WH, transformOrigin: "0 0", transform: `translate(${ax + sh.x + sh2.x + dr.x}px, ${ay + sh.y + sh2.y + dr.y}px) rotateX(${rx}deg) rotateZ(${rz + dr.r}deg) scale(${cs}) translate(${-fx}px, ${-fy}px)`, boxShadow: "0 60px 140px rgba(30,25,15,.25)", borderRadius: 30 }}>
            <Clip src="styles.mp4" t0={88.0} dur={10} />
            {Array.from({ length: 24 }, (_, i) => {
              const x = (i % 4) * GX, y = Math.floor(i / 4) * GY;
              const rv = i < 8 ? 1 : ease.out(ramp(t, tReveal(i), tReveal(i) + FLY));
              const fl = i < 8 ? 0 : hit(t, tReveal(i) + FLY - 0.04, 0.22);
              return (
                <div key={i} style={{ position: "absolute", left: x, top: y, width: TW, height: TH, borderRadius: 20, boxShadow: `0 0 0 10px ${C.desk}`, overflow: "hidden", perspective: 900 }}>
                  {i === 0 && t >= 92.4 && (
                    <div style={{ position: "absolute", inset: 0, filter: filt, transform: `scale(${1 + beat * 0.012})` }}>
                      <Clip src="tiles/t01.mp4" t0={88.0} dur={10} />
                    </div>
                  )}
                  {i === 0 && t >= 93.3 && (
                    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 74, background: "linear-gradient(#000 55%, rgba(0,0,0,0))", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 16, opacity: ramp(t, 93.3, 93.5) }}>
                      <div style={{ fontFamily: FONTS[fontI].f, fontWeight: 700, fontSize: 22, letterSpacing: fontI === 0 ? 4 : 1, color: "#FFC27A", filter: filt, transform: `scale(${1 + hit(t, 94.42, 0.25) * 0.15})` }}>EARTH · 2026</div>
                    </div>
                  )}
                  <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: fl * 0.55 }} />
                  {rv < 1 && <div style={{ position: "absolute", inset: -2, background: C.desk }} />}
                  {rv > 0 && (
                    <>
                      <div style={{ position: "absolute", left: 12, top: 12, padding: "5px 11px", borderRadius: 999, background: "rgba(10,10,12,.62)", opacity: rv * (1 - dim), fontFamily: MONO, fontWeight: 600, fontSize: 19, color: "#fff", letterSpacing: 1 }}>{String(i + 1).padStart(2, "0")}</div>
                      <div style={{ position: "absolute", left: 12, bottom: 14, padding: "6px 12px", borderRadius: 999, background: "rgba(255,255,255,.9)", opacity: rv * (1 - dim), fontFamily: MONO, fontWeight: 600, fontSize: 16, color: C.ink, letterSpacing: 1.2 }}>{tileName(i)}</div>
                    </>
                  )}
                  {i !== 0 && <div style={{ position: "absolute", inset: -2, background: C.desk, opacity: dim }} />}
                </div>
              );
            })}
            {Array.from({ length: 16 }, (_, q) => {
              const i = q + 8;
              const k = ease.out(ramp(t, tReveal(i), tReveal(i) + FLY));
              if (k <= 0 || k >= 1) return null;
              const x = (i % 4) * GX, y = Math.floor(i / 4) * GY;
              const dx = ((i % 4) - 1.5) * 90, dy = 520, rot = (i % 2 ? 9 : -9);
              return (
                <div key={i} style={{ position: "absolute", left: x, top: y, width: TW, height: TH, borderRadius: 20, overflow: "hidden", boxShadow: "0 30px 60px rgba(20,20,30,.35)", transform: `translate(${(1 - k) * dx}px, ${(1 - k) * dy}px) rotate(${(1 - k) * rot}deg) scale(${0.78 + 0.22 * k})`, opacity: Math.min(1, k * 3) }}>
                  <Still id={14 + i} />
                </div>
              );
            })}
            {/* selection frame on tile 0 */}
            {dim > 0 && <div style={{ position: "absolute", left: -7, top: -7, width: TW + 14, height: TH + 14, borderRadius: 26, border: `5px solid ${C.green}`, opacity: dim * (1 - fly) }} />}
          </div>
        </div>
      )}
      {/* counter HUD during the reveal */}
      {t < T20 + 0.1 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", justifyContent: "center", opacity: ramp(t, 88.1, 88.3) * (1 - ramp(t, T20 - 0.1, T20 + 0.05)) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 26px", borderRadius: 999, background: C.ink, boxShadow: "0 12px 30px rgba(0,0,0,.25)", direction: "rtl" }}>
            <Ico n="layers" s={26} c={C.neon} w={2.4} />
            <T s={28} w={800} c="#fff">سبک‌های NFP</T>
            <L s={28} w={800} mono c={C.neon}>{String(Array.from({ length: 24 }, (_, i) => i).filter((i) => t >= tReveal(i)).length).padStart(2, "0")}<span style={{ color: "#6E6F76" }}> / 24</span></L>
          </div>
        </div>
      )}
      {/* ═══ 20+ / NFP slam ═══ */}
      {scrim > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(11,11,13,${0.86 * scrim})` }} />}
      {t >= T20 - 0.02 && scrim > 0 && (() => {
        const sk = spring(t, T20 - 0.02, 0.5, 0.3);
        const ex = ease.in(ramp(t, 92.0, 92.42));
        return (
          <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", flexDirection: "column", alignItems: "center", transform: `translate(${sh.x * 0.5}px, ${-ex * 260 + sh.y * 0.5}px)`, opacity: 1 - ex }}>
            <div style={{ fontFamily: NUM, fontWeight: 700, fontSize: 400, lineHeight: 0.95, letterSpacing: -14, color: "#fff", direction: "ltr", transform: `scale(${1 + (1 - sk) * 1.5})`, opacity: clamp((t - T20) * 10 + 0.3), textShadow: "0 20px 80px rgba(0,0,0,.5)" }}>
              20<span style={{ color: C.neon }}>+</span>
            </div>
            <div style={{ display: "flex", gap: 22, direction: "rtl", marginTop: 26 }}>
              {[[252, "سبک", "#fff"], [253, "مختلف", C.neon], [254, "ویدیویی", "#fff"]].map(([wi, w, c]) => {
                const k = pop(t, S(wi as number) - 0.04, 0.35);
                return <T key={w as string} s={92} w={900} c={c as string} style={{ transform: `translateY(${(1 - Math.min(1, k)) * 40}px) scale(${k})`, opacity: Math.min(1, k * 2) }}>{w}</T>;
              })}
            </div>
            {t >= TNFP - 0.04 && (() => {
              const k = spring(t, TNFP - 0.04, 0.45, 0.3);
              return (
                <div style={{ display: "flex", alignItems: "center", gap: 34, direction: "rtl", marginTop: 40, transform: `scale(${0.4 + 0.6 * k})`, opacity: clamp((t - TNFP) * 8 + 0.4) }}>
                  <T s={86} w={800} c="rgba(255,255,255,.8)" style={{ marginTop: 18 }}>با</T>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <NfpMark s={170} c="#fff" />
                    <div style={{ width: 300 * ease.out(ramp(t, TNFP + 0.05, TNFP + 0.35)), height: 14, borderRadius: 7, background: C.neon, marginTop: 8 }} />
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })()}
      <Shock t={t} t0={T20} x={540} y={540} r0={120} r1={620} c={C.neon} w={10} />
      
      {/* ═══ style inspector ═══ */}
      {kPanel > 0 && <Inspector t={t} k={kPanel} u={u} fontI={fontI} bpm={bpm} beat={beat} />}
      {kPanel > 0 && <Timeline t={t} k={kPanel} filt={filt} bpm={bpm} />}
      {/* ═══ devices ═══ */}
      {t >= 94.8 && (
        <>
          {/* beams from Claude */}
          {beamK > 0 && (
            <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
              {[
                `M540,300 C540,350 ${PH.x + PH.w / 2},330 ${PH.x + PH.w / 2},${PH.y - 4}`,
                "M540,300 C540,350 760,360 760,436",
              ].map((d, i) => (
                <g key={i}>
                  <path d={d} stroke={C.ink} strokeOpacity={0.12} strokeWidth={14} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${beamK} 2`} />
                  <path d={d} stroke={C.green} strokeWidth={5} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${beamK} 2`} />
                  <path d={d} stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" pathLength={100} strokeDasharray="2 9" strokeDashoffset={-t * 60} opacity={beamK} />
                </g>
              ))}
            </svg>
          )}
          {/* phone */}
          <div style={{ position: "absolute", left: PH.x, top: PH.y, width: PH.w, height: phH, borderRadius: PH.w * 0.14, background: "#0D0D10", boxShadow: "0 40px 90px rgba(10,10,20,.35), inset 0 0 0 2px #2A2A30", opacity: kPhone, transform: `scale(${lerp(1.05, 1, kPhone)}) rotate(${-1.5 * kPhone + Math.sin(t * 1.3) * 0.4}deg) translateY(${Math.sin(t * 1.1) * 5}px)` }} />
          <div style={{ position: "absolute", left: lerp(tileScr.x, scr.x, fly), top: lerp(tileScr.y, scr.y, fly), width: lerp(tileScr.w, scr.w, fly), height: lerp(tileScr.h, scr.h, fly), borderRadius: lerp(tileScr.r, scr.r, fly), overflow: "hidden", background: "#000", transform: `rotate(${-1.5 * kPhone + Math.sin(t * 1.3) * 0.4}deg) translateY(${Math.sin(t * 1.1) * 5 * kPhone}px)`, transformOrigin: `${PH.w / 2 - bez}px ${phH / 2 - bez}px`, boxShadow: fly < 1 ? "0 30px 70px rgba(0,0,0,.3)" : "none" }}>
            <div style={{ position: "absolute", inset: 0, filter: filt }}><Clip src="tiles/t01.mp4" t0={94.8} from={0.5} dur={10} /></div>
            {t < 95.0 && <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: hit(t, 94.8, 0.2) * 0.6 }} />}
            {t > arrive && t < arrive + 0.5 && <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: hit(t, arrive, 0.4) * 0.45 }} />}
            {kPhone > 0 && <IgReelUi t={t} k={kUi} arrive={arrive} w={scr.w} h={scr.h} />}
          </div>
          {/* YouTube watch page */}
          {kYt > 0 && <YtCard t={t} k={kYt} arrive={arrive + 0.12} />}
          {/* packets travelling down the beams */}
          {t > TCL + 0.35 && t < arrive && (() => {
            const ks = [0, 0.18].map((d) => ease.in(ramp(t, TCL + 0.35 + d, arrive - 0.18 + d)));
            const bez = (k: number, p: number[][]) => {
              const m = 1 - k;
              return [0, 1].map((j) => m * m * m * p[0][j] + 3 * m * m * k * p[1][j] + 3 * m * k * k * p[2][j] + k * k * k * p[3][j]);
            };
            const paths = [[[540, 300], [540, 350], [PH.x + PH.w / 2, 330], [PH.x + PH.w / 2, PH.y]], [[540, 300], [540, 350], [760, 360], [760, 436]]];
            return paths.flatMap((pp, i) => ks.map((k, q) => {
              if (k <= 0 || k >= 1) return null;
              const [x, y] = bez(k, pp);
              return <div key={`${i}${q}`} style={{ position: "absolute", left: x - 16, top: y - 12, width: 32, height: 24, borderRadius: 6, background: C.green, border: "3px solid #fff", boxShadow: "0 4px 12px rgba(242,92,31,.5)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico n="play" s={11} c="#fff" fill /></div>;
            }));
          })()}
          {/* Claude in the middle */}
          {kCl > 0 && (
            <div style={{ position: "absolute", left: 540 - 190, top: 190, width: 380, height: 112, borderRadius: 56, background: "#fff", boxShadow: "0 2px 3px rgba(0,0,0,.06), 0 20px 50px rgba(20,20,30,.18)", display: "flex", alignItems: "center", justifyContent: "center", gap: 18, transform: `scale(${kCl * (1 + hit(t, arrive - 0.05, 0.3) * 0.05)})`, direction: "ltr" }}>
              <div style={{ transform: `rotate(${(t - TCL) * 50}deg)` }}><ClaudeMark s={64} /></div>
              <span style={{ fontFamily: UI, fontWeight: 800, fontSize: 46, letterSpacing: -1, color: C.ink }}>Claude</span>
              <div style={{ padding: "6px 12px", borderRadius: 12, background: C.ink, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontFamily: UI, fontWeight: 800, fontSize: 22, color: "#8B8C93" }}>+</span>
                <NfpMark s={26} c={C.neon} />
              </div>
            </div>
          )}
          <Shock t={t} t0={TCL} x={540} y={246} r0={120} r1={360} />
        </>
      )}
    </Full>
  );
};

// ── a little editor timeline under the zoomed tile (thumbnails follow the live colour)
const Timeline: React.FC<{ t: number; k: number; filt: string; bpm: number }> = ({ t, k, filt, bpm }) => {
  const X = 60, Y = 1092, W = 966;
  const ph = ((t - 92.6) * 0.16) % 1;
  return (
    <div style={{ position: "absolute", left: X, top: Y, width: W, height: 168, borderRadius: 28, background: "#fff", boxShadow: "0 2px 3px rgba(0,0,0,.06), 0 20px 50px rgba(20,20,30,.14)", transform: `translateY(${(1 - k) * 420}px)`, opacity: Math.min(1, k * 1.6), overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 22, right: 22, top: 12, display: "flex", justifyContent: "space-between", alignItems: "center", direction: "ltr" }}>
        <L s={16} w={700} mono c={C.ink3}>TIMELINE · 01_HOLOGRAM_HUD.nfp</L>
        <L s={18} w={800} mono c={C.green}>{`0:${String(Math.floor(ph * 10)).padStart(2, "0")} / 0:10`}</L>
      </div>
      <div style={{ position: "absolute", left: 22, top: 44, width: W - 44, height: 100, display: "flex", gap: 6, direction: "ltr" }}>
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i} style={{ width: 61, height: 100, borderRadius: 8, overflow: "hidden", flex: "none", background: "#000", filter: filt }}>
            <Still id={14} style={{ transform: `scale(${1.5 + (i % 4) * 0.25}) translate(${((i * 5) % 3 - 1) * 9}px, ${(((i * 7) % 5) - 2) * 16}px)` }} />
          </div>
        ))}
      </div>
      {Array.from({ length: 24 }, (_, i) => <div key={i} style={{ position: "absolute", left: 22 + i * ((W - 44) / 24) * (96 / bpm) * 1.33, top: 150, width: 3, height: 8, borderRadius: 2, background: i % 4 ? "#D9D6CD" : C.green }} />)}
      <div style={{ position: "absolute", left: 22 + ph * (W - 44) - 2, top: 36, width: 4, height: 116, borderRadius: 2, background: C.green, boxShadow: "0 0 10px rgba(242,92,31,.5)" }}>
        <div style={{ position: "absolute", left: -7, top: -8, width: 18, height: 14, borderRadius: 4, background: C.green }} />
      </div>
    </div>
  );
};

// ── the style inspector panel (screen space, right of the zoomed tile)
const Inspector: React.FC<{ t: number; k: number; u: number; fontI: number; bpm: number; beat: number }> = ({ t, k, u, fontI, bpm, beat }) => {
  const X = 566, Y = 222, W = 470, H = 846;
  const sx = 46, sw = W - 92; // slider geometry (local)
  const hueY = 300, bpmY = 680;
  const kx = sx + (1 - u) * sw; // rtl: amber on the right
  const bpmU = (bpm - 80) / 80;
  const bx = sx + (1 - bpmU) * sw;
  const sel = Math.round(u * 2);
  // pointer path (local coords)
  const [px, py] = trackV(t, [
    [93.5, [W + 60, H + 40]],
    [93.82, [kx, hueY + 4]],
    [94.34, [kx, hueY + 4]],
    [94.42, [W / 2, 470]],
    [94.5, [sx + (1 - (96 - 80) / 80) * sw, bpmY + 4]],
    [94.74, [bx, bpmY + 4]],
  ]);
  const dragging = (t > 93.82 && t < 94.34) || (t > 94.5 && t < 94.74);
  const ptX = t > 93.82 && t < 94.34 ? kx : t > 94.5 && t < 94.74 ? bx : px;
  const ci = Math.round(u * 2);
  const hexNow = STOPS[ci];
  return (
    <div style={{ position: "absolute", left: X, top: Y, width: W, height: H, borderRadius: 34, background: "#fff", boxShadow: "0 2px 3px rgba(0,0,0,.06), 0 30px 80px rgba(20,20,30,.20)", transform: `translateX(${(1 - k) * 560}px) rotate(${(1 - k) * 4}deg)`, opacity: Math.min(1, k * 1.5) }}>
      {/* header */}
      <div style={{ position: "absolute", right: 30, top: 28, display: "flex", alignItems: "center", gap: 16, direction: "rtl" }}>
        <div style={{ width: 66, height: 66, borderRadius: 20, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico n="wand" s={36} c={C.neon} w={2.4} /></div>
        <div>
          <T s={40} w={900}>تنظیمات سبک</T>
          <L s={16} w={700} mono c={C.ink3} style={{ textAlign: "right" }}>01 · HOLOGRAM HUD</L>
        </div>
      </div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 122, height: 2, background: "#EEECE6" }} />
      {/* colour */}
      <B x={0} y={146} w={W}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 30px", direction: "rtl" }}>
          <T s={32} w={800}>رنگ</T>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 10, background: "#F4F3EF" }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, background: hexNow }} />
            <L s={18} w={700} mono>{HEX[ci]}</L>
          </div>
        </div>
      </B>
      <div style={{ position: "absolute", left: 30, right: 30, top: 206, display: "flex", justifyContent: "space-between", direction: "rtl" }}>
        {SWATCH.map((c, i) => (
          <div key={i} style={{ width: 62, height: 62, borderRadius: 31, background: c, boxShadow: i === sel ? `0 0 0 4px #fff, 0 0 0 7px ${C.ink}` : "inset 0 0 0 1px rgba(0,0,0,.08)", transform: `scale(${i === sel ? 1.06 : 1})` }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: sx, top: hueY - 8, width: sw, height: 16, borderRadius: 8, background: `linear-gradient(270deg, ${STOPS.join(",")})`, boxShadow: "inset 0 1px 2px rgba(0,0,0,.15)" }} />
      <div style={{ position: "absolute", left: kx - 22, top: hueY - 22, width: 44, height: 44, borderRadius: 22, background: STOPS[ci], border: "6px solid #fff", boxShadow: "0 0 0 2px rgba(22,23,26,.85), 0 6px 14px rgba(0,0,0,.25)", transform: `scale(${dragging && t < 94.4 ? 1.12 : 1})` }} />
      {/* font */}
      <B x={30} y={350} w={W - 60}><T s={32} w={800}>فونت</T></B>
      <div style={{ position: "absolute", left: 30, top: 404, width: W - 60, height: 104, borderRadius: 20, background: "#F4F3EF", display: "flex", padding: 6, gap: 6, direction: "rtl" }}>
        {FONTS.map((f, i) => (
          <div key={i} style={{ flex: 1, borderRadius: 15, background: i === fontI ? C.ink : "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, transform: `scale(${i === fontI ? 1 + hit(t, 94.42, 0.25) * 0.08 : 1})` }}>
            <span style={{ fontFamily: f.f, fontWeight: 700, fontSize: 40, color: i === fontI ? "#fff" : C.ink, lineHeight: 1.1 }}>Aa</span>
            <span style={{ fontFamily: UI, fontWeight: 600, fontSize: 17, color: i === fontI ? "#A9AAB0" : C.ink3 }}>{f.n}</span>
          </div>
        ))}
      </div>
      {/* rhythm */}
      <B x={0} y={548} w={W}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 30px", direction: "rtl" }}>
          <T s={32} w={800}>ریتم</T>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, direction: "ltr" }}>
            <span style={{ fontFamily: UI, fontWeight: 800, fontSize: 40, color: C.ink, transform: `scale(${1 + beat * 0.06})`, display: "inline-block" }}>{bpm}</span>
            <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: 18, color: C.ink3 }}>BPM</span>
          </div>
        </div>
      </B>
      <div style={{ position: "absolute", left: 30, top: 610, width: W - 60, display: "flex", gap: 6, direction: "ltr" }}>
        {Array.from({ length: 16 }, (_, i) => {
          const step = Math.floor((t * bpm) / 60 * 2) % 16;
          return <div key={i} style={{ flex: 1, height: 34, borderRadius: 6, background: i === step ? C.green : i % 4 === 0 ? C.ink : "#E6E3DA", opacity: i === step ? 1 : 0.9 }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: sx, top: bpmY - 5, width: sw, height: 10, borderRadius: 5, background: "#E6E3DA" }} />
      <div style={{ position: "absolute", left: bx, top: bpmY - 5, width: sx + sw - bx, height: 10, borderRadius: 5, background: C.ink }} />
      <div style={{ position: "absolute", left: bx - 20, top: bpmY - 20, width: 40, height: 40, borderRadius: 20, background: "#fff", boxShadow: "0 0 0 2px rgba(22,23,26,.85), 0 6px 14px rgba(0,0,0,.25)" }} />
      {/* apply button */}
      <div style={{ position: "absolute", left: 30, right: 30, top: 742, height: 74, borderRadius: 22, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, direction: "rtl", boxShadow: "0 12px 26px rgba(242,92,31,.35)", transform: `scale(${1 + hit(t, 94.62, 0.3) * 0.04})` }}>
        <Ico n="sparkle" s={28} c="#fff" fill />
        <T s={32} w={900} c="#fff">اعمال روی ویدیو</T>
      </div>
      {t > 93.5 && <Pointer x={ptX} y={dragging ? (t < 94.4 ? hueY + 4 : bpmY + 4) : py} s={1.2} down={dragging} o={ramp(t, 93.5, 93.62)} />}
    </div>
  );
};

// ── Instagram reel UI over the phone screen (w × h = the screen)
const IgReelUi: React.FC<{ t: number; k: (d?: number) => number; arrive: number; w: number; h: number }> = ({ t, k, arrive, w, h }) => {
  const likes = 1.92e6 + (t - S(269)) * 9e4 + (t > arrive ? 3.6e5 : 0);
  const heart = t > 95.95 ? ease.out(ramp(t, 95.95, 96.25)) * (1 - ramp(t, 96.4, 96.8)) : 0;
  const toast = ease.out(ramp(t, arrive, arrive + 0.3));
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 140, background: "linear-gradient(rgba(0,0,0,.45), transparent)", opacity: k() }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 330, background: "linear-gradient(transparent, rgba(0,0,0,.7))", opacity: k() }} />
      <div style={{ opacity: k() }}><StatusBar s={0.95} /></div>
      <div style={{ position: "absolute", left: 20, right: 20, top: 52, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: k(0.05), direction: "ltr" }}>
        <span style={{ fontFamily: UI, fontWeight: 800, fontSize: 25, color: "#fff" }}>Reels</span>
        <Ico n="camera" s={28} c="#fff" w={2} />
      </div>
      {/* right rail */}
      <div style={{ position: "absolute", right: 12, bottom: 108, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, color: "#fff", fontFamily: UI, fontWeight: 600, fontSize: 14, textShadow: "0 1px 4px rgba(0,0,0,.5)" }}>
        {[
          [<Ico key="h" n="heart" s={31} c={t > 95.95 ? "#FF3040" : "#fff"} fill={t > 95.95} w={2} />, kfmt(likes)],
          [<XI key="c" n="igcomment" s={29} c="#fff" w={2} />, "8.4K"],
          [<XI key="s" n="igsend" s={28} c="#fff" w={2} />, "31K"],
          [<XI key="b" n="bookmark" s={28} c="#fff" w={2} />, ""],
        ].map(([ic, l], i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transform: `scale(${k(0.06 + i * 0.05) * (i === 0 ? 1 + hit(t, 95.95, 0.3) * 0.35 : 1)})` }}>
            {ic}
            {l && <span>{l}</span>}
          </div>
        ))}
        <div style={{ display: "flex", gap: 3, transform: `scale(${k(0.28)})` }}>{[0, 1, 2].map((i) => <div key={i} style={{ width: 5, height: 5, borderRadius: 3, background: "#fff" }} />)}</div>
        <div style={{ width: 30, height: 30, borderRadius: 8, border: "2px solid #fff", overflow: "hidden", transform: `scale(${k(0.32)}) rotate(${t * 60}deg)` }}><Av id={37} s={26} /></div>
      </div>
      {/* bottom-left: account + caption + audio */}
      <div style={{ position: "absolute", left: 14, right: 70, bottom: 74, opacity: k(0.12), transform: `translateY(${(1 - k(0.12)) * 20}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, direction: "ltr" }}>
          <NfpAv s={36} ring />
          <span style={{ fontFamily: UI, fontWeight: 700, fontSize: 16, color: "#fff" }}>nfp.studio</span>
          <div style={{ padding: "4px 10px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,.8)", fontFamily: UI, fontWeight: 700, fontSize: 13, color: "#fff" }}>Follow</div>
        </div>
        <T s={17} w={600} c="#fff" style={{ marginTop: 8, textAlign: "left", direction: "rtl", width: "fit-content" }}>ساخته‌شده با Claude و NFP ✦</T>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, direction: "ltr", overflow: "hidden", width: 220 }}>
          <XI n="music" s={14} c="#fff" w={2.2} />
          <span style={{ fontFamily: UI, fontWeight: 500, fontSize: 13, color: "#fff", whiteSpace: "nowrap", transform: `translateX(${-((t * 30) % 120)}px)` }}>nfp.studio · Original audio · nfp.studio · Original audio</span>
        </div>
      </div>
      {/* tab bar */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 58, background: "#000", display: "flex", justifyContent: "space-around", alignItems: "center", opacity: k(0.18), direction: "ltr" }}>
        <XI n="home" s={25} c="#fff" w={2} />
        <Ico n="search" s={25} c="#fff" w={2} />
        <XI n="plusSq" s={25} c="#fff" w={2} />
        <XI n="reels" s={25} c="#fff" w={2.4} />
        <NfpAv s={27} />
      </div>
      {/* double-tap heart */}
      {heart > 0 && (
        <div style={{ position: "absolute", left: w / 2 - 70, top: h / 2 - 90 - (t - 95.95) * 40, transform: `scale(${heart * (1 + hit(t, 95.95, 0.25) * 0.25)}) rotate(-8deg)`, opacity: heart, filter: "drop-shadow(0 8px 20px rgba(0,0,0,.35))" }}>
          <Ico n="heart" s={140} c="#fff" fill />
        </div>
      )}
      {/* published toast */}
      {toast > 0 && (
        <div style={{ position: "absolute", left: 10, right: 10, top: 10, transform: `translateY(${(1 - toast) * -110}px)`, opacity: Math.min(1, toast * 1.5), padding: "12px 14px", borderRadius: 26, background: "rgba(246,246,248,.9)", backdropFilter: "blur(14px)", boxShadow: "0 10px 30px rgba(0,0,0,.35)", display: "flex", gap: 11, alignItems: "flex-start", direction: "ltr" }}>
          <IgTile s={40} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: UI, fontWeight: 700, fontSize: 15, color: "#111" }}>Instagram</span>
              <span style={{ fontFamily: UI, fontWeight: 500, fontSize: 13, color: "#8A8A8E" }}>now</span>
            </div>
            <T s={18} w={800} c="#111" style={{ textAlign: "right", marginTop: 1 }}>ریلز جدیدت منتشر شد ✓</T>
          </div>
        </div>
      )}
    </div>
  );
};

// ── YouTube watch page card
const YtCard: React.FC<{ t: number; k: number; arrive: number }> = ({ t, k, arrive }) => {
  const X = 494, Y = 436, W = 532;
  const vh = (W * 9) / 16;
  const pub = t > arrive;
  const prog = clamp(0.08 + (t - S(271)) * 0.035);
  const subs = t > arrive + 0.25;
  const views = 1.18e6 + (t - S(271)) * 2.2e4 + (pub ? 4.1e4 : 0);
  return (
    <div style={{ position: "absolute", left: X, top: Y, width: W, borderRadius: 28, background: "#fff", boxShadow: "0 2px 3px rgba(0,0,0,.06), 0 30px 80px rgba(20,20,30,.20)", overflow: "hidden", transform: `translateX(${(1 - k) * 640}px) rotate(${1.2 * k + Math.sin(t * 1.2 + 1) * 0.35}deg) translateY(${Math.sin(t * 1.05 + 2) * 5}px)` }}>
      {/* app bar */}
      <div style={{ height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", direction: "ltr" }}>
        <YtLockup s={22} />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Ico n="search" s={22} c="#0F0F0F" w={2.2} />
          <div style={{ position: "relative" }}><Ico n="bell" s={22} c="#0F0F0F" w={2} />{pub && <div style={{ position: "absolute", right: -7, top: -6, minWidth: 16, height: 16, borderRadius: 8, background: C.yt, color: "#fff", fontFamily: UI, fontWeight: 800, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(t, arrive, 0.3)})` }}>1</div>}</div>
          <MeAv s={28} />
        </div>
      </div>
      {/* player */}
      <div style={{ position: "relative", width: W, height: vh, background: "#000" }}>
        <Clip src="doc.mp4" t0={S(271) - 0.15} dur={10} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 60, background: "linear-gradient(transparent, rgba(0,0,0,.6))" }} />
        <div style={{ position: "absolute", left: 14, bottom: 16, display: "flex", alignItems: "center", gap: 10, direction: "ltr" }}>
          <div style={{ display: "flex", gap: 4 }}><div style={{ width: 5, height: 16, background: "#fff", borderRadius: 1 }} /><div style={{ width: 5, height: 16, background: "#fff", borderRadius: 1 }} /></div>
          <L s={14} w={600} c="#fff">{`${Math.floor(prog * 8.75)}:${String(Math.floor((prog * 525) % 60)).padStart(2, "0")} / 8:45`}</L>
        </div>
        <div style={{ position: "absolute", right: 14, bottom: 15, display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ padding: "1px 5px", borderRadius: 3, background: C.yt, fontFamily: UI, fontWeight: 800, fontSize: 10, color: "#fff" }}>HD</div>
          <Ico n="settings" s={18} c="#fff" w={2} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 4, background: "rgba(255,255,255,.3)" }}>
          <div style={{ width: `${prog * 100}%`, height: 4, background: C.yt }} />
          <div style={{ position: "absolute", left: `calc(${prog * 100}% - 7px)`, top: -5, width: 14, height: 14, borderRadius: 7, background: C.yt }} />
        </div>
        {t > arrive && t < arrive + 0.5 && <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: hit(t, arrive, 0.4) * 0.5 }} />}
      </div>
      {/* title + meta */}
      <div style={{ padding: "14px 20px 0" }}>
        <T s={27} w={900} style={{ whiteSpace: "normal", lineHeight: 1.35 }}>فرشته‌ی خداوند کیست؟ | مستند انیمیشنی</T>
        <L s={15} w={500} c="#606060" style={{ marginTop: 6 }}>{`${kfmt(views)} views · 3 days ago · #NFP`}</L>
      </div>
      {/* channel row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px 0", direction: "ltr" }}>
        <div style={{ width: 46, height: 46, borderRadius: 23, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}><NfpMark s={17} c={C.neon} /></div>
        <div style={{ flex: 1 }}>
          <L s={18} w={700} c="#0F0F0F">NFP Studio</L>
          <L s={14} w={500} c="#606060">{`${subs ? "86.1K" : "86K"} subscribers`}</L>
        </div>
        <div style={{ padding: "10px 18px", borderRadius: 999, background: subs ? "#F2F2F2" : "#0F0F0F", display: "flex", alignItems: "center", gap: 6, transform: `scale(${1 + hit(t, arrive + 0.25, 0.3) * 0.1})` }}>
          {subs && <XI n="bellOn" s={18} c="#0F0F0F" w={2} />}
          <span style={{ fontFamily: UI, fontWeight: 700, fontSize: 16, color: subs ? "#0F0F0F" : "#fff" }}>{subs ? "Subscribed" : "Subscribe"}</span>
        </div>
      </div>
      {/* actions */}
      <div style={{ display: "flex", gap: 10, padding: "14px 20px 14px", direction: "ltr" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 999, background: "#F2F2F2" }}>
          <XI n="thumb" s={18} c="#0F0F0F" w={2} />
          <span style={{ fontFamily: UI, fontWeight: 700, fontSize: 14, color: "#0F0F0F" }}>{pub ? "24K" : "23K"}</span>
          <div style={{ width: 1, height: 18, background: "#CFCFCF" }} />
          <XI n="thumb" s={18} c="#0F0F0F" w={2} style={{ transform: "scale(-1,-1)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 999, background: "#F2F2F2" }}><XI n="share" s={18} c="#0F0F0F" w={2} /><span style={{ fontFamily: UI, fontWeight: 700, fontSize: 14, color: "#0F0F0F" }}>Share</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 999, background: "#F2F2F2" }}><XI n="dl" s={18} c="#0F0F0F" w={2} /><span style={{ fontFamily: UI, fontWeight: 700, fontSize: 14, color: "#0F0F0F" }}>Save</span></div>
      </div>
      {/* up next */}
      <div style={{ borderTop: "1.5px solid #EFEFEF", padding: "12px 20px 18px", direction: "ltr" }}>
        <L s={15} w={700} c="#606060">Up next</L>
        <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
          <div style={{ width: 168, height: 94, borderRadius: 10, overflow: "hidden", position: "relative", flex: "none" }}>
            <Still id={11} />
            <div style={{ position: "absolute", right: 5, bottom: 5, padding: "1px 5px", borderRadius: 4, background: "rgba(0,0,0,.8)", fontFamily: UI, fontWeight: 700, fontSize: 11, color: "#fff" }}>6:12</div>
          </div>
          <div style={{ flex: 1 }}>
            <T s={21} w={800} style={{ whiteSpace: "normal", lineHeight: 1.35, textAlign: "right" }}>جنگجوهای پاندا | انیمیشن با هوش مصنوعی</T>
            <L s={13} w={500} c="#606060" style={{ marginTop: 4, textAlign: "right" }}>NFP Studio · 864K views · 1 week ago</L>
          </div>
        </div>
      </div>
      {pub && (
        <div style={{ position: "absolute", left: 16, top: 72, transform: `scale(${pop(t, arrive, 0.35)})`, transformOrigin: "0 0", display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, background: "rgba(255,255,255,.95)", boxShadow: "0 8px 22px rgba(0,0,0,.3)", direction: "rtl" }}>
          <div style={{ width: 24, height: 24, borderRadius: 12, background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico n="check" s={15} c="#fff" w={3.6} /></div>
          <T s={18} w={800}>منتشر شد</T>
        </div>
      )}
    </div>
  );
};
