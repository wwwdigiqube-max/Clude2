// Dino long EN · "10 Days Before the Asteroid That Killed the Dinosaurs" — 1920×1080, 24 fps, silent picture (audio mixed
// separately and muxed). Every shot comes from src/dino-en/edl.json, built by videos/dino-long-en/edit/edl.py.
import React from "react";
import { AbsoluteFill, Freeze, Img, OffthreadVideo, interpolate, random, staticFile, useCurrentFrame, Easing } from "remotion";
import { continueRender, delayRender } from "remotion";
import EDL from "./edl.json";

// English fonts (all SIL OFL, in public/fonts)
const FONT_NUM = "Anton", FONT_TEXT = "Oswald", FONT_HAND = "Caveat";
const fontsHandle = delayRender("EN fonts");
Promise.all(([[FONT_NUM, "fonts/Anton-Regular.ttf"], [FONT_TEXT, "fonts/Oswald.ttf"], [FONT_HAND, "fonts/Caveat.ttf"]] as const).map(([f, file]) =>
  new FontFace(f, `url('${staticFile(file)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fontsHandle));

export const DINO_EN_FPS = 24;
const DINO_FPS = DINO_EN_FPS;
const ST = EDL as unknown as { look: [number, number][] };
export const DINO_EN_FRAMES = Math.ceil(EDL.total * DINO_FPS);
const W = 1920, HH = 1080;
type Fx = { kind: string; at: number; [k: string]: any };
type Shot = { n: number; s: number; e: number; img: string; cam: number[]; fx: Fx[]; hits: number[]; [k: string]: any };
const SHOTS = EDL.shots as unknown as Shot[];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.45, 0, 0.55, 1);
const k01 = (t: number, a: number, d = 0.35) => interpolate(t, [a, a + d], [0, 1], clamp);
const src = (img: string) =>
  img.startsWith("n:") ? staticFile(`dino-en/frames/${img.slice(2)}.jpg`)
  : img.startsWith("c:") ? staticFile(`dino/clips/${img.slice(2)}.mp4`)
  : img.startsWith("s:") ? staticFile(`dino/short/${img.slice(2)}.jpg`)
  : staticFile(`dino/shots/${img}.jpg`);
const RED = "#b3261e", CREAM = "#f4ead8", INK = "#15110d";

// ---------- camera ----------
const Camera: React.FC<{ shot: Shot; t: number; children: React.ReactNode }> = ({ shot, t, children }) => {
  const screen = shot.screen as { lines: string[] } | undefined;
  const d = shot.e - shot.s;
  const p = ease(Math.min(1, Math.max(0, t / d)));
  const [z0, x0, y0, z1, x1, y1] = shot.cam;
  let z = z0 + (z1 - z0) * p;
  if (shot.punch) z *= interpolate(t, [0, 0.22], [0.82, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const fx = x0 + (x1 - x0) * p, fy = y0 + (y1 - y0) * p;
  const w = W * z, h = HH * z;
  const left = Math.min(0, Math.max(W - w, W / 2 - fx * w));
  const top = Math.min(0, Math.max(HH - h, HH / 2 - fy * h));
  // shake: continuous + hits (decaying) + rhythmic stomps + alarm pulses + handheld drift
  const now = shot.s + t;
  let amp = shot.shake ?? 0;
  for (const hT of shot.hits) if (now >= hT) amp += 22 * Math.exp(-(now - hT) * 5);
  if (shot.stomps) amp += 9 * Math.exp(-((t % shot.stomps) * 9));
  if (shot.pulses) amp += 5 * Math.exp(-((t % 0.5) * 8));
  const sx = amp ? (random(`x${Math.floor(now * 24)}`) - 0.5) * 2 * amp : 0;
  const sy = amp ? (random(`y${Math.floor(now * 24)}`) - 0.5) * 2 * amp : 0;
  const hx = shot.handheld ? Math.sin(t * 1.3) * 10 + Math.sin(t * 3.1) * 4 : 0;
  const hy = shot.handheld ? Math.cos(t * 1.1) * 7 : 0;
  const rot = shot.rot ? shot.rot[0] + (shot.rot[1] - shot.rot[0]) * p : 0;
  const jitter = shot.jitter ? (random(`j${Math.floor(now * 8)}`) - 0.5) * 3 : 0;
  return (
    <div style={{ position: "absolute", left: left + sx + hx, top: top + sy + hy + jitter, width: w, height: h,
      transform: `rotate(${rot}deg) scaleX(${shot.flip ? -1 : 1})`, filter: shot.blur ? `blur(${shot.blur}px)` : undefined }}>
      {children}
      {screen && <PhoneScreen w={w} h={h} lines={screen.lines} />}
      {shot.scar && <ScarLine w={w} h={h} k={k01(now, shot.scar.at, 1.4)} pulse={now - shot.scar.at} {...shot.scar} />}
    </div>
  );
};

// Persian text on the phone screen of phone-10days.jpg (replaces the English text in the picture); image coordinates
const PhoneScreen: React.FC<{ w: number; h: number; lines: string[] }> = ({ w, h, lines }) => (
  <div style={{ position: "absolute", left: 0.397 * w, top: 0.735 * h, width: 0.08 * w, height: 0.27 * h, transform: "translate(-50%,-50%) rotate(-26deg)",
    background: "radial-gradient(ellipse at 50% 40%, #d8261c 0%, #9c120c 70%, #6d0a06 100%)", borderRadius: 0.008 * w,
    boxShadow: `0 0 ${0.01 * w}px ${0.004 * w}px rgba(255,60,40,.6)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0.002 * w }}>
    <div style={{ fontSize: 0.022 * w, color: "#ffe14a", lineHeight: 1, opacity: lines.length ? 1 : 0.9 }}>⚠</div>
    {lines.map((l, i) => (
      <div key={i} style={{ fontFamily: FONT_NUM, fontSize: (i === 1 ? 0.0135 : 0.0105) * w, color: "#fff", lineHeight: 1.15, textAlign: "center", textShadow: "0 0 6px rgba(0,0,0,.5)" }}>{l}</div>
    ))}
  </div>
);

const GRADE: Record<string, string> = {
  sepia: "sepia(0.75) contrast(1.05) brightness(0.95)",
  grey: "grayscale(0.85) brightness(0.8) contrast(1.05)",
  red: "sepia(0.4) saturate(2.2) hue-rotate(-20deg) brightness(0.9)",
  dim: "brightness(0.6)",
  fever: "saturate(1.3) contrast(1.05)",
  warm: "sepia(0.25) saturate(1.15)",
  night: "brightness(0.7) saturate(0.8)",
};

const Picture: React.FC<{ shot: Shot; t: number }> = ({ shot, t }) => {
  if (shot.img === "black") return null;
  const style: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover",
    filter: [shot.grade && GRADE[shot.grade], shot.dimImg && `brightness(${shot.dimImg})`].filter(Boolean).join(" ") || undefined };
  if (shot.img.startsWith("c:")) {
    const [a, b] = shot.in ?? [0, 7.8];
    const need = shot.e - shot.s, have = b - a;
    const rate = Math.max(0.6, Math.min(1, have / need));
    const fps = DINO_FPS;
    // past the clip's out point → hold its last frame (Freeze pins the clip to the frame we compute)
    const local = Math.min(t * rate, have - 0.05);
    return (
      <Camera shot={shot} t={t}>
        <Freeze frame={Math.round(local * fps)}>
          <OffthreadVideo src={src(shot.img)} muted style={style} startFrom={Math.round(a * fps)} />
        </Freeze>
      </Camera>
    );
  }
  return (
    <Camera shot={shot} t={t}>
      <Img src={src(shot.img)} style={style} />
    </Camera>
  );
};

// ---------- particles ----------
const Particles: React.FC<{ t: number; kind: string; n?: number; at?: number }> = ({ t, kind, n, at = 0 }) => {
  const tt = t - at;
  if (tt < 0) return null;
  const N = n ?? (kind === "dust" ? 45 : kind === "glass" ? 90 : 55);
  const items = [];
  for (let i = 0; i < N; i++) {
    const r = (s: string) => random(`${kind}${i}${s}`);
    const speed = kind === "glass" ? 700 + 500 * r("v") : kind === "embers" ? -(60 + 90 * r("v")) : kind === "ash" ? 40 + 50 * r("v") : 160 + 260 * r("v");
    const life = 1080 / Math.abs(speed) + 0.5;
    const ph = (tt + r("p") * life) % life;
    const y = speed > 0 ? -20 + ph * speed : 1100 + ph * speed;
    const x = r("x") * 1920 + Math.sin((tt + r("w") * 9) * (kind === "ash" ? 0.8 : 2)) * (kind === "ash" ? 40 : 12);
    const size = kind === "glass" ? 2 : kind === "embers" ? 3 + 4 * r("s") : kind === "ash" ? 3 + 5 * r("s") : 2 + 4 * r("s");
    const color = kind === "embers" ? `rgba(255,${120 + 80 * r("c")},40,${0.6 + 0.4 * r("o")})`
      : kind === "ash" ? `rgba(200,195,190,${0.35 + 0.4 * r("o")})`
      : kind === "glass" ? `rgba(255,${200 + 55 * r("c")},170,0.9)` : `rgba(70,48,30,${0.5 + 0.4 * r("o")})`;
    items.push(<div key={i} style={{ position: "absolute", left: x, top: y, width: size, height: kind === "glass" ? 26 : size,
      borderRadius: kind === "glass" ? 1 : "50%", background: color, transform: kind === "glass" ? "rotate(12deg)" : undefined,
      boxShadow: kind === "embers" ? `0 0 ${size * 2}px rgba(255,140,40,.8)` : undefined }} />);
  }
  return <AbsoluteFill style={{ pointerEvents: "none" }}>{items}</AbsoluteFill>;
};

// ---------- graphics ----------
const Day: React.FC<{ k: number; text: string }> = ({ k, text }) => (
  <div style={{ position: "absolute", top: 56, right: 64, fontFamily: FONT_NUM, fontSize: 88, color: "#fff",
    background: RED, padding: "2px 36px 12px", borderRadius: 14, transform: `scale(${0.6 + 0.4 * k}) rotate(-3deg)`, opacity: k,
    boxShadow: "0 8px 0 rgba(0,0,0,.4)" }}>{text}</div>
);

const Rule: React.FC<{ k: number; text: string; warm?: boolean }> = ({ k, text, warm }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: `rgba(0,0,0,${0.35 * k})` }}>
    <div style={{ fontFamily: FONT_NUM, fontSize: 104, color: warm ? "#3a1d06" : CREAM, background: warm ? "#ffcf86" : INK,
      border: `6px solid ${warm ? "#fff2d8" : CREAM}`, padding: "10px 56px 26px", borderRadius: 18,
      transform: `scale(${interpolate(k, [0, 1], [1.6, 1])}) rotate(${warm ? 0 : -2}deg)`, opacity: k, boxShadow: "0 14px 0 rgba(0,0,0,.45)" }}>{text}</div>
  </AbsoluteFill>
);

const Battery: React.FC<{ k: number; t: number; from: number; to: number }> = ({ k, t, from, to }) => {
  const v = Math.round(interpolate(t, [0.3, 1.6], [from, to], clamp));
  const low = v <= 5, col = v <= 11 ? "#ff4b3e" : "#7be36b";
  const blink = low ? (Math.floor(t * 3) % 2 ? 0.35 : 1) : 1;
  return (
    <div style={{ position: "absolute", top: 60, left: 70, display: "flex", alignItems: "center", gap: 20, opacity: k * blink,
      transform: `scale(${0.7 + 0.3 * k})`, transformOrigin: "left top" }}>
      <div style={{ width: 170, height: 84, border: "7px solid #fff", borderRadius: 16, padding: 7, background: "rgba(0,0,0,.55)", position: "relative" }}>
        <div style={{ width: `${Math.max(4, v)}%`, height: "100%", background: col, borderRadius: 6 }} />
        <div style={{ position: "absolute", right: -20, top: 22, width: 12, height: 26, background: "#fff", borderRadius: 3 }} />
      </div>
      <div style={{ fontFamily: FONT_NUM, fontSize: 96, color: "#fff", textShadow: "0 5px 0 #000" }}>{v}%</div>
    </div>
  );
};

const Label: React.FC<{ k: number; text: string; x: number; y: number }> = ({ k, text, x, y }) => (
  <div style={{ position: "absolute", left: x * W, top: y * HH, transform: `translate(-50%,-50%) scale(${0.5 + 0.5 * k})`, opacity: k,
    fontFamily: FONT_NUM, fontSize: 72, color: INK, background: CREAM, padding: "0 30px 8px", borderRadius: 12,
    boxShadow: "0 6px 0 rgba(0,0,0,.45)", whiteSpace: "nowrap" }}>{text}</div>
);

const Card: React.FC<{ k: number; title: string; sub?: string }> = ({ k, title, sub }) => (
  <div style={{ position: "absolute", bottom: 90, left: "50%", transform: `translate(-50%, ${(1 - k) * 40}px)`, opacity: k,
    background: "rgba(16,12,9,.85)", border: `4px solid ${CREAM}`, borderRadius: 18, padding: "14px 46px 22px", textAlign: "center" }}>
    <div style={{ fontFamily: FONT_NUM, fontSize: 76, color: CREAM }}>{title}</div>
    {sub && <div style={{ fontFamily: FONT_TEXT, fontSize: 40, color: "#e8cfa8", marginTop: 4 }}>{sub}</div>}
  </div>
);

const Msg: React.FC<{ k: number; lines: string[] }> = ({ k, lines }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
    <div style={{ background: "rgba(20,4,4,.88)", border: "5px solid #ff5a4a", borderRadius: 26, padding: "18px 54px 28px",
      textAlign: "center", transform: `scale(${0.7 + 0.3 * k})`, opacity: k, boxShadow: "0 0 60px rgba(255,60,40,.55)" }}>
      <div style={{ fontFamily: FONT_TEXT, fontSize: 34, color: "#ff9a8c", marginBottom: 6 }}>NEW MESSAGE</div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: FONT_NUM, fontSize: i ? 64 : 92, color: i ? "#ffd2c8" : "#fff" }}>{l}</div>
      ))}
    </div>
  </AbsoluteFill>
);

// phone message as a corner card (bottom-right), so the picture itself stays untouched
const Notif: React.FC<{ k: number; lines: string[] }> = ({ k, lines }) => (
  <div style={{ position: "absolute", right: 60, bottom: 70, display: "flex", alignItems: "center", gap: 22,
    background: "rgba(24,6,5,.9)", border: "4px solid #ff5a4a", borderRadius: 22, padding: "14px 34px 20px 30px",
    transform: `translateX(${(1 - k) * 120}px)`, opacity: k, boxShadow: "0 0 40px rgba(255,60,40,.45), 0 10px 0 rgba(0,0,0,.4)" }}>
    <div style={{ fontSize: 70, color: "#ffd23a", lineHeight: 1 }}>⚠</div>
    <div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: FONT_NUM, fontSize: i ? 50 : 72, color: i ? "#ffc9bf" : "#fff", lineHeight: 1.25 }}>{l}</div>
      ))}
    </div>
  </div>
);

const MapFx: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const dash = interpolate(t, [0.5, 2.2], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", right: 70, top: 120, width: 720, height: 820, opacity: k, background: "rgba(232,214,180,.93)",
      border: `6px solid ${INK}`, borderRadius: 14, boxShadow: "0 12px 0 rgba(0,0,0,.4)" }}>
      <svg width={720} height={820} style={{ position: "absolute" }}>
        <path d="M120 60 Q260 40 420 80 L560 140 Q600 260 520 330 L470 420 Q520 520 470 600 L380 640 Q300 600 250 520 L180 430 Q120 300 120 60 Z"
          fill="#b9a27a" stroke={INK} strokeWidth={4} opacity={0.55} />
        <line x1={300} y1={190} x2={420} y2={690} stroke={RED} strokeWidth={8} strokeDasharray="22 16"
          strokeDashoffset={0} pathLength={1} style={{ strokeDasharray: `${dash} 1` }} />
        <circle cx={300} cy={190} r={18} fill={INK} />
        <circle cx={420} cy={700} r={34 + 6 * Math.sin(t * 6)} fill="none" stroke={RED} strokeWidth={8} opacity={dash} />
        <text x={430} y={712} fontSize={46} fill={RED} textAnchor="middle" fontWeight={900} opacity={dash}>✕</text>
      </svg>
      <div style={{ position: "absolute", left: 330, top: 160, fontFamily: FONT_NUM, fontSize: 48, color: INK }}>YOU (HELL CREEK)</div>
      <div style={{ position: "absolute", left: 120, top: 715, fontFamily: FONT_NUM, fontSize: 48, color: RED, opacity: dash }}>IMPACT (MEXICO)</div>
      <div style={{ position: "absolute", left: 380, top: 420, fontFamily: FONT_NUM, fontSize: 54, color: INK, opacity: dash,
        background: CREAM, padding: "0 16px 6px", borderRadius: 10 }}>3,000 KM</div>
    </div>
  );
};

const Weights: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const k2 = k01(t, 1.2), k3 = k01(t, 12.8);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: `rgba(0,0,0,${0.35 * k})` }}>
      <div style={{ opacity: k, transform: `scale(${0.8 + 0.2 * k})`, textAlign: "center" }}>
        <div style={{ fontFamily: FONT_TEXT, fontSize: 52, color: CREAM }}>AFTER THE IMPACT, LAND ANIMALS:</div>
        <div style={{ display: "flex", gap: 60, marginTop: 24, justifyContent: "center" }}>
          <div style={{ fontFamily: FONT_NUM, fontSize: 100, color: "#7be36b", background: "rgba(0,0,0,.6)", padding: "0 40px 14px", borderRadius: 16 }}>UNDER 25 KG ✓</div>
          <div style={{ fontFamily: FONT_NUM, fontSize: 100, color: "#ff5a4a", background: "rgba(0,0,0,.6)", padding: "0 40px 14px", borderRadius: 16, opacity: k2 }}>OVER 25 KG ✗</div>
        </div>
        <div style={{ fontFamily: FONT_NUM, fontSize: 80, color: "#ffcf86", marginTop: 30, opacity: k3 }}>YOU: 70 KG</div>
      </div>
    </AbsoluteFill>
  );
};

const Chips: React.FC<{ t0: number; now: number; items: [string, number][] }> = ({ now, items }) => (
  <div style={{ position: "absolute", bottom: 80, width: "100%", display: "flex", justifyContent: "center", gap: 34 }}>
    {items.map(([txt, at], i) => {
      const k = k01(now, at, 0.3);
      return <div key={i} style={{ fontFamily: FONT_NUM, fontSize: 66, color: INK, background: CREAM, padding: "0 30px 8px", borderRadius: 12,
        opacity: k, transform: `translateY(${(1 - k) * 30}px)`, boxShadow: "0 6px 0 rgba(0,0,0,.45)" }}>{txt} ✓</div>;
    })}
  </div>
);

const FloodLine: React.FC<{ k: number; y: number }> = ({ k, y }) => (
  <>
    <div style={{ position: "absolute", left: 0, top: y * HH, width: W * k, borderTop: "8px dashed #6fc3ff", filter: "drop-shadow(0 3px 0 #000)" }} />
    <div style={{ position: "absolute", left: 60, top: y * HH + 14, fontFamily: FONT_NUM, fontSize: 54, color: "#bfe6ff", opacity: k, textShadow: "0 4px 0 #000" }}>FLOOD LINE</div>
  </>
);

const Compass: React.FC<{ k: number; t: number }> = ({ k, t }) => (
  <div style={{ position: "absolute", right: 140, top: 210, width: 380, height: 560, opacity: k, transform: `scale(${0.7 + 0.3 * k})` }}>
    <div style={{ width: 300, height: 300, borderRadius: "50%", border: `8px solid ${CREAM}`, background: "rgba(0,0,0,.55)", position: "relative", margin: "0 auto" }}>
      <div style={{ position: "absolute", left: 136, top: 20, width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderBottom: `120px solid ${CREAM}` }} />
      <div style={{ position: "absolute", left: 136, top: 150, width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: `120px solid ${RED}` }} />
      <div style={{ position: "absolute", left: -200, right: -200, top: -100, textAlign: "center", fontFamily: FONT_NUM, fontSize: 60, color: CREAM, textShadow: "0 4px 0 #000", whiteSpace: "nowrap" }}>ENTRANCE FACES NORTH ↑</div>
    </div>
    <div style={{ textAlign: "center", fontFamily: FONT_NUM, fontSize: 58, color: "#ff8a7a", marginTop: 16, textShadow: "0 4px 0 #000", opacity: k01(t, 1.2), whiteSpace: "nowrap" }}>IMPACT: SOUTH ↓</div>
  </div>
);

const Depth: React.FC<{ k: number }> = ({ k }) => (
  <>
    <div style={{ position: "absolute", left: 1180, top: 250, width: 30, height: 300 * k, borderLeft: `8px solid ${CREAM}`, borderTop: `8px solid ${CREAM}`, borderBottom: k > 0.95 ? `8px solid ${CREAM}` : undefined }} />
    <div style={{ position: "absolute", left: 1240, top: 360, fontFamily: FONT_NUM, fontSize: 80, color: CREAM, opacity: k, textShadow: "0 5px 0 #000", whiteSpace: "nowrap" }}>1 M OF SOIL</div>
  </>
);

const Heat: React.FC<{ t: number; k: number }> = ({ t, k }) => (
  <>
    {[0, 1, 2, 3, 4].map((i) => {
      const y = interpolate(t, [0.2 + i * 0.15, 1.4 + i * 0.15], [-120, 260], clamp);
      return <div key={i} style={{ position: "absolute", left: 360 + i * 300, top: y, opacity: k, fontSize: 110, color: "#ff6a2a", textShadow: "0 0 20px #ff3300" }}>↓</div>;
    })}
    <div style={{ position: "absolute", left: 0, right: 0, top: 370, borderTop: "6px dashed #ffb070", opacity: k01(t, 1.6) }} />
  </>
);

const Photos: React.FC<{ now: number; at: number; imgs: string[] }> = ({ now, at, imgs }) => (
  <>
    {imgs.map((im, i) => {
      const k = k01(now, at + i * 1.6, 0.4);
      const out = k01(now, at + (i + 1) * 1.6, 0.3) * (i < imgs.length - 1 ? 1 : 0);
      return <div key={i} style={{ position: "absolute", right: 140 - out * 600, top: 170, width: 640, height: 360, opacity: k * (1 - out),
        transform: `rotate(${4 - i * 7}deg) scale(${0.8 + 0.2 * k})`, border: "14px solid #fff", borderBottomWidth: 50, boxShadow: "0 18px 30px rgba(0,0,0,.5)" }}>
        <Img src={src(im)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>;
    })}
  </>
);

const Tally: React.FC<{ now: number; rows: [string, number][] }> = ({ now, rows }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center" }}>
    {rows.map(([txt, at], i) => {
      const k = k01(now, at, 0.4);
      const n = Math.round(txt.length * Math.min(1, (now - at) / 0.9));
      return <div key={i} style={{ fontFamily: FONT_NUM, fontSize: i ? 78 : 96, color: i ? CREAM : "#ffcf86", opacity: k, marginBottom: 8,
        textShadow: "0 0 2px #000, 0 5px 0 #000", letterSpacing: 0 }}>{txt.slice(0, Math.max(0, n))}</div>;
    })}
  </div>
);

const Rules3: React.FC<{ now: number; items: [string, number][] }> = ({ now, items }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 26 }}>
    {items.map(([txt, at], i) => {
      const k = k01(now, at, 0.3);
      return <div key={i} style={{ fontFamily: FONT_NUM, fontSize: 92, color: CREAM, background: INK, border: `5px solid ${CREAM}`, padding: "0 44px 16px",
        borderRadius: 16, opacity: k, transform: `scale(${interpolate(k, [0, 1], [1.5, 1])}) rotate(${(i - 1) * 2}deg)`, boxShadow: "0 10px 0 rgba(0,0,0,.45)" }}>{txt}</div>;
    })}
  </AbsoluteFill>
);

const Tree: React.FC<{ now: number; items: [string, number][] }> = ({ now, items }) => {
  const pos = [[0.2, 0.2], [0.42, 0.12], [0.62, 0.16], [0.82, 0.24]];
  return (
    <>
      {items.map(([txt, at], i) => {
        const k = k01(now, at, 0.35);
        const [x, y] = pos[i];
        return (
          <React.Fragment key={i}>
            <svg width={W} height={HH} style={{ position: "absolute", left: 0, top: 0, opacity: k }}>
              <path d={`M ${0.55 * W} ${0.78 * HH} Q ${0.5 * W} ${0.45 * HH} ${x * W} ${y * HH + 60}`} stroke={CREAM} strokeWidth={8} fill="none" strokeLinecap="round"
                pathLength={1} strokeDasharray={`${k} 1`} />
            </svg>
            <Label k={k} text={txt} x={x} y={y} />
          </React.Fragment>
        );
      })}
    </>
  );
};

const Rewrite: React.FC<{ now: number; at: number; add: number; old: string; nw: string }> = ({ now, at, add, old, nw }) => {
  const strike = k01(now, at + 0.3, 0.8), k2 = k01(now, add, 0.5);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "relative", fontFamily: FONT_NUM, fontSize: 96, color: CREAM, textShadow: "0 5px 0 #000" }}>
        {old}
        <div style={{ position: "absolute", right: 0, top: "55%", height: 10, width: `${strike * 100}%`, background: RED, borderRadius: 5 }} />
      </div>
      <div style={{ fontFamily: FONT_NUM, fontSize: 110, color: "#ffcf86", opacity: k2, transform: `scale(${0.8 + 0.2 * k2})`, textShadow: "0 6px 0 #000" }}>{nw}</div>
    </AbsoluteFill>
  );
};

const Cta: React.FC<{ k: number; k2: number }> = ({ k, k2 }) => (
  <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 90, background: `rgba(0,0,0,${0.25 * k + 0.4 * k2})` }}>
    <div style={{ opacity: k * (1 - k2), transform: `translateY(${(1 - k) * 40}px)`, textAlign: "center", background: "rgba(16,12,9,.85)",
      border: `4px solid ${CREAM}`, borderRadius: 20, padding: "16px 50px 24px" }}>
      <div style={{ fontFamily: FONT_NUM, fontSize: 78, color: CREAM }}>DAY ONE: WHAT WOULD YOU DO FIRST?</div>
      <div style={{ fontFamily: FONT_TEXT, fontSize: 44, color: "#ffcf86" }}>Tell me in the comments 💬</div>
    </div>
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: k2 }}>
      <div style={{ fontFamily: FONT_NUM, fontSize: 120, color: "#fff", textShadow: "0 7px 0 #000", transform: `scale(${0.85 + 0.15 * k2})` }}>STAY SMALL. STAY ALIVE.</div>
      <div style={{ marginTop: 26, fontFamily: FONT_NUM, fontSize: 70, color: "#fff", background: RED, padding: "4px 50px 16px", borderRadius: 16, boxShadow: "0 8px 0 rgba(0,0,0,.45)" }}>SUBSCRIBE 🔔</div>
    </AbsoluteFill>
  </AbsoluteFill>
);


// ---------- EN additions ----------
// a pale healed scar traced over the picture (image coordinates 0..1), so the reveal reads at a glance
const ScarLine: React.FC<{ w: number; h: number; k: number; pulse: number; x1: number; y1: number; x2: number; y2: number }> = ({ w, h, k, pulse, x1, y1, x2, y2 }) => {
  const glow = 0.55 + 0.45 * Math.sin(Math.max(0, pulse) * 3);
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, opacity: k > 0 ? 1 : 0 }}>
      <line x1={x1 * w} y1={y1 * h} x2={x1 * w + (x2 - x1) * w * k} y2={y1 * h + (y2 - y1) * h * k} stroke={`rgba(255,236,200,${0.55 + 0.35 * glow})`}
        strokeWidth={0.0042 * w} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 ${0.006 * w}px rgba(255,200,120,${glow}))` }} />
    </svg>
  );
};

// the hero's handwritten checklist (back page of the book)
type Item = { text: string; state?: "empty" | "tick" | "half"; note?: string };
const Checklist: React.FC<{ k: number; t: number; title: string; items: Item[]; stamp?: string }> = ({ k, t, title, items, stamp }) => (
  <div style={{ position: "absolute", left: 90, top: 110, width: 760, padding: "34px 44px 40px", background: "#efe3c6", borderRadius: 6,
    transform: `translateY(${(1 - k) * 60}px) rotate(-2.5deg)`, opacity: k, boxShadow: "0 20px 40px rgba(0,0,0,.55)",
    backgroundImage: "repeating-linear-gradient(0deg, transparent 0 63px, rgba(60,90,140,.22) 63px 65px)" }}>
    <div style={{ fontFamily: FONT_HAND, fontSize: 64, color: "#1d2c4a", lineHeight: 1, marginBottom: 14 }}>{title}</div>
    {items.map((it, i) => {
      const ki = k01(t, 0.25 + i * 0.35, 0.3);
      const tk = it.state === "tick" ? k01(t, 0.6 + i * 0.35, 0.25) : 0;
      return (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, opacity: ki, height: 64 }}>
          <div style={{ width: 44, height: 44, border: "4px solid #1d2c4a", borderRadius: 4, position: "relative", flexShrink: 0 }}>
            {it.state === "tick" && <div style={{ position: "absolute", left: 2, top: -22, fontFamily: FONT_HAND, fontSize: 76, color: "#a3201a", opacity: tk, transform: `scale(${0.5 + 0.5 * tk})` }}>✓</div>}
            {it.state === "half" && <div style={{ position: "absolute", left: 4, bottom: 4, width: 28, height: 14, background: "#a3201a", opacity: 0.8 }} />}
          </div>
          <div style={{ fontFamily: FONT_HAND, fontSize: 58, color: "#1d2c4a", whiteSpace: "nowrap" }}>{it.text}</div>
          {it.note && <div style={{ fontFamily: FONT_HAND, fontSize: 52, color: "#a3201a", whiteSpace: "nowrap" }}>{it.note}</div>}
        </div>
      );
    })}
    {stamp && <div style={{ position: "absolute", right: 30, bottom: 26, fontFamily: FONT_NUM, fontSize: 64, color: "#b3261e", border: "6px solid #b3261e",
      padding: "0 18px", transform: `rotate(-12deg) scale(${interpolate(k01(t, 0.4 + items.length * 0.35, 0.25), [0, 1], [2, 1])})`, opacity: k01(t, 0.4 + items.length * 0.35, 0.25) }}>{stamp}</div>}
  </div>
);

// full-frame text card (numbers, facts) over a dimmed picture
const BigCard: React.FC<{ k: number; text: string; sub?: string; color?: string }> = ({ k, text, sub, color }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: `rgba(0,0,0,${0.55 * k})` }}>
    <div style={{ textAlign: "center", opacity: k, transform: `scale(${interpolate(k, [0, 1], [1.25, 1])})` }}>
      <div style={{ fontFamily: FONT_NUM, fontSize: 190, lineHeight: 1.05, color: color ?? CREAM, textShadow: "0 9px 0 rgba(0,0,0,.6)", letterSpacing: 2 }}>{text}</div>
      {sub && <div style={{ fontFamily: FONT_TEXT, fontSize: 58, color: "#e8cfa8", marginTop: 14, textShadow: "0 4px 0 #000" }}>{sub}</div>}
    </div>
  </AbsoluteFill>
);

// IMPACT +6 MIN clock tag
const Clock: React.FC<{ k: number; text: string }> = ({ k, text }) => (
  <div style={{ position: "absolute", top: 56, left: 64, fontFamily: FONT_NUM, fontSize: 76, color: "#fff", background: "#7a0e09", border: "4px solid #ff5a4a",
    padding: "2px 30px 8px", borderRadius: 12, opacity: k, transform: `scale(${0.7 + 0.3 * k})`, transformOrigin: "left top", boxShadow: "0 0 30px rgba(255,60,40,.5)" }}>{text}</div>
);

// arch: weight arrows pushed into the walls
const Arch: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const a = k01(t, 0.8, 0.8);
  return (
    <AbsoluteFill style={{ background: `rgba(0,0,0,${0.5 * k})`, justifyContent: "center", alignItems: "center" }}>
      <svg width={900} height={620} style={{ opacity: k }}>
        <path d="M150 560 L150 300 A300 260 0 0 1 750 300 L750 560" fill="none" stroke={CREAM} strokeWidth={22} strokeLinecap="round" />
        {[[450, 20, 450, 120], [250, 80, 190, 210], [650, 80, 710, 210]].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x1 + (x2 - x1) * a} y2={y1 + (y2 - y1) * a} stroke="#ff8a3a" strokeWidth={14} markerEnd="url(#ah)" opacity={a} />
        ))}
        {[[175, 330, 70, 450], [725, 330, 830, 450]].map(([x1, y1, x2, y2], i) => (
          <line key={"w" + i} x1={x1} y1={y1} x2={x1 + (x2 - x1) * k01(t, 1.8, 0.7)} y2={y1 + (y2 - y1) * k01(t, 1.8, 0.7)} stroke="#ffcf86" strokeWidth={14} markerEnd="url(#ah)" opacity={k01(t, 1.8, 0.4)} />
        ))}
        <defs><marker id="ah" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#ffcf86" /></marker></defs>
      </svg>
    </AbsoluteFill>
  );
};

// how a fossil forms: ground layers, the body drops in and is covered
const Layers: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const cover = k01(t, 1.2, 1.6);
  return (
    <AbsoluteFill style={{ background: `rgba(0,0,0,${0.6 * k})`, justifyContent: "center", alignItems: "center" }}>
      <svg width={1400} height={700} style={{ opacity: k }}>
        {[["#6b4a2e", 0], ["#7d5a38", 1], ["#8f6b45", 2], ["#5d3f27", 3]].map(([c, i]) => (
          <rect key={i as number} x={0} y={260 + (i as number) * 110} width={1400} height={110} fill={c as string} stroke="#2a1c10" strokeWidth={3} />
        ))}
        <rect x={0} y={260 - 110 * cover} width={1400} height={110 * cover} fill="#8a6a4a" stroke="#2a1c10" strokeWidth={3} />
        <g transform="translate(470 300)" opacity={1}>
          <path d="M0 40 Q80 -10 180 20 L320 10 Q400 0 460 30 L420 50 Q300 60 200 55 Q90 70 0 40 Z" fill="none" stroke={CREAM} strokeWidth={6} />
          {[60, 110, 160, 210, 260].map((x) => <line key={x} x1={x + 40} y1={25} x2={x + 30} y2={60} stroke={CREAM} strokeWidth={5} />)}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- one shot ----------
const ShotView: React.FC<{ shot: Shot; t: number }> = ({ shot, t }) => {
  const now = shot.s + t, d = shot.e - shot.s;
  const layers: React.ReactNode[] = [];
  shot.fx.forEach((f, i) => {
    const k = k01(now, f.at);
    const lt = now - f.at;
    switch (f.kind) {
      case "dust": case "embers": case "ash": case "glass":
        layers.push(<Particles key={i} t={now - shot.s} kind={f.kind} n={f.n} at={f.at - shot.s} />); break;
      case "day": layers.push(<Day key={i} k={k} text={f.text} />); break;
      case "rule": layers.push(<Rule key={i} k={k} text={f.text} warm={f.warm} />); break;
      case "battery": layers.push(<Battery key={i} k={k} t={lt} from={f.from} to={f.to} />); break;
      case "label": case "name": layers.push(<Label key={i} k={k} text={f.text} x={f.x ?? 0.5} y={f.y ?? 0.2} />); break;
      case "msg": layers.push(<Msg key={i} k={k} lines={f.lines} />); break;
      case "notif": layers.push(<Notif key={i} k={k} lines={f.lines} />); break;
      case "map": layers.push(<MapFx key={i} k={k} t={lt} />); break;
      case "weights": layers.push(<Weights key={i} k={k} t={lt} />); break;
      case "chips": layers.push(<Chips key={i} t0={shot.s} now={now} items={f.items} />); break;
      case "floodline": layers.push(<FloodLine key={i} k={k01(now, f.at, 0.8)} y={f.y} />); break;
      case "compass": layers.push(<Compass key={i} k={k} t={lt} />); break;
      case "depth": layers.push(<Depth key={i} k={k01(now, f.at, 0.6)} />); break;
      case "heat": layers.push(<Heat key={i} k={k} t={lt} />); break;
      case "photos": layers.push(<Photos key={i} now={now} at={f.at} imgs={f.imgs} />); break;
      case "card": layers.push(<Card key={i} k={k} title={f.title} sub={f.sub} />); break;
      case "tally": layers.push(<Tally key={i} now={now} rows={f.rows} />); break;
      case "rules3": layers.push(<Rules3 key={i} now={now} items={f.items} />); break;
      case "tree": layers.push(<Tree key={i} now={now} items={f.items} />); break;
      case "rewrite": layers.push(<Rewrite key={i} now={now} at={f.at} add={f.add} old={f.old} nw={f.new} />); break;
      case "cta": layers.push(<Cta key={i} k={k} k2={shot.fx.find((x) => x.kind === "endcard") ? k01(now, shot.fx.find((x) => x.kind === "endcard")!.at, 0.6) : 0} />); break;
      case "dim": {
        const dk = interpolate(now, [f.at, f.at + (f.dur ?? 1.2)], [0, f.to ?? 0.8], clamp);
        layers.push(<AbsoluteFill key={i} style={{ background: f.color ?? "#000", opacity: dk }} />); break;
      }
      case "dawn": {
        const a = interpolate(t, [0, d], [f.from, f.to], clamp);
        layers.push(<AbsoluteFill key={i} style={{ background: "#020611", opacity: a }} />);
        layers.push(<AbsoluteFill key={i + "b"} style={{ background: "#3b6fb0", mixBlendMode: "soft-light", opacity: 0.6 * (1 - a) }} />); break;
      }
      case "sunsweep": {
        const a = interpolate(t, [0, d], [0, 1], clamp);
        layers.push(<AbsoluteFill key={i} style={{ background: `linear-gradient(180deg, rgba(255,${200 - 90 * a},${120 - 80 * a},${0.12 + 0.25 * a}), rgba(80,20,0,${0.25 * a}))`, mixBlendMode: "multiply" }} />); break;
      }
      case "redflash": layers.push(<AbsoluteFill key={i} style={{ background: "#c4120c", opacity: interpolate(now, [f.at, f.at + 0.08, f.at + 0.5], [0, 0.45, 0], clamp) }} />); break;
      case "shadow": layers.push(<AbsoluteFill key={i} style={{ background: "radial-gradient(ellipse at 72% 40%, rgba(0,0,0,.92) 0%, rgba(0,0,0,.7) 30%, rgba(0,0,0,0) 62%)", opacity: k01(now, f.at, 0.5) }} />); break;
      case "glow": layers.push(<AbsoluteFill key={i} style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(255,214,140,.45), rgba(255,180,90,0) 65%)", opacity: k01(now, f.at, 2.5), mixBlendMode: "screen" }} />); break;
      case "title": {
        const sh = (random(`t${Math.floor(now * 24)}`) - 0.5) * 8 * Math.exp(-lt * 2);
        layers.push(<AbsoluteFill key={i} style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ fontFamily: FONT_NUM, fontSize: 170, color: CREAM, opacity: k, transform: `translate(${sh}px, ${sh * 0.6}px) scale(${0.9 + 0.1 * k})`, textShadow: "0 8px 0 #4a0d08" }}>{f.text}</div>
        </AbsoluteFill>); break;
      }
      case "endcard": break;
      case "checklist": layers.push(<Checklist key={i} k={k} t={lt} title={f.title} items={f.items} stamp={f.stamp} />); break;
      case "bigcard": layers.push(<BigCard key={i} k={k} text={f.text} sub={f.sub} color={f.color} />); break;
      case "clock": layers.push(<Clock key={i} k={k} text={f.text} />); break;
      case "arch": layers.push(<Arch key={i} k={k} t={lt} />); break;
      case "layers": layers.push(<Layers key={i} k={k} t={lt} />); break;
    }
  });
  // vignettes per grade
  const vignette = shot.grade === "fever"
    ? <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(120,20,0,.55) 100%)", backdropFilter: undefined }} />
    : <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,.35) 100%)" }} />;
  // transitions in
  let trIn: React.ReactNode = null;
  if (shot.tr === "fade") trIn = <AbsoluteFill style={{ background: "#000", opacity: interpolate(t, [0, 0.5], [1, 0], clamp) }} />;
  if (shot.tr === "flash") trIn = <AbsoluteFill style={{ background: "#fffbe8", opacity: interpolate(t, [0, 0.06, 0.6], [0, 1, 0], clamp) }} />;
  if (shot.tr === "blink") {
    const o = interpolate(t, [0, 0.35, 0.55, 0.75, 1.1], [0, 0.15, 0, 0.1, 0.5], clamp);
    const lid = (1 - Math.min(1, o * 2)) * 0.5 * HH * (t < 1.1 ? 1 : 0);
    trIn = <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: lid, background: "#000", borderBottomLeftRadius: "50% 40px", borderBottomRightRadius: "50% 40px" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: lid, background: "#000", borderTopLeftRadius: "50% 40px", borderTopRightRadius: "50% 40px" }} />
    </>;
  }
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <Picture shot={shot} t={t} />
      {shot.img !== "black" && vignette}
      {layers}
      {trIn}
    </AbsoluteFill>
  );
};

export const DinoLongEn: React.FC<{ times?: number[] }> = ({ times }) => {
  const f = useCurrentFrame();
  const now = times ? times[f] : f / DINO_FPS;
  let i = SHOTS.findIndex((s) => now >= s.s && now < s.e);
  if (i < 0) i = now < SHOTS[0].s ? 0 : SHOTS.length - 1;
  const shot = SHOTS[i];
  return <ShotView key={shot.n} shot={shot} t={now - shot.s} />;
};

// review frames: [shot, seconds after the shot start] → node tools … render DinoLong-Look
const LOOK: [number, number][] = ST.look ?? [];
export const DINO_EN_LOOK = LOOK.map(([n, dt]) => (SHOTS.find((x) => x.n === n) ?? SHOTS[0]).s + dt);
// one frame per shot (60 % into it) for a full review pass
export const DINO_EN_ALL = SHOTS.map((s) => s.s + 0.6 * (s.e - s.s));
