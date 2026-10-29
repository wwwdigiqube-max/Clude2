import { FONT_NUM } from "../../../fonts";
import React from "react";
import { Img, staticFile } from "remotion";
import { noise2D } from "@remotion/noise";
import { FA, clamp01, proj } from "./geo";

export const FONT_UI = "Vazirmatn";
export const FONT_HERO = FONT_NUM; // Lalezar (src/fonts.ts)

// GPT Image cut-outs (public/styles/satellite-explainer/img, webp with alpha); code fallbacks are drawn when missing
export const HAVE: Record<string, boolean> = {
  fan_body: true, fan_blades: true, fan_grille: true, earth_mindblown: true,
  cloud_rain: true, cloud_sun: true, sun: true, storm: true, sailboat: true, wheat_dry: true,
};

/* ---------- map-space pieces (children of the camera layer, units = map px) ---------- */

// soft glowing water mass made of a few drifting blurred ellipses
export const Blob: React.FC<{
  lon: number; lat: number; w: number; h: number; t: number; o: number;
  color: string; core?: string; seed?: string; rot?: number; blur?: number;
}> = ({ lon, lat, w, h, t, o, color, core, seed = "b", rot = 0, blur = 60 }) => {
  if (o <= 0.001) return null;
  const p = proj(lon, lat);
  const parts = [0, 1, 2, 3].map((i) => ({
    dx: noise2D(seed + i, t * 0.12, i) * w * 0.18 + (i - 1.5) * w * 0.12,
    dy: noise2D(seed + i + "y", i, t * 0.12) * h * 0.2,
    sw: w * (0.55 + 0.12 * noise2D(seed + "s" + i, t * 0.1, 3)),
    sh: h * (0.7 + 0.15 * noise2D(seed + "h" + i, 4, t * 0.1)),
  }));
  return (
    <div style={{ position: "absolute", left: p.x, top: p.y, opacity: o, transform: `rotate(${rot}deg)`, mixBlendMode: "screen" }}>
      {parts.map((q, i) => (
        <div key={i} style={{
          position: "absolute", left: q.dx - q.sw / 2, top: q.dy - q.sh / 2, width: q.sw, height: q.sh, borderRadius: "50%",
          background: `radial-gradient(closest-side, ${core ?? color} 0%, ${color} 45%, transparent 100%)`,
          filter: `blur(${blur}px)`, opacity: 0.85,
        }} />
      ))}
    </div>
  );
};

// wind streaks flowing along the equator band; dir -1 = east→west
export const Streaks: React.FC<{
  t: number; o: number; lon0: number; lon1: number; lat0: number; lat1: number; n?: number; speed?: number;
  color?: string; width?: number; seed?: number;
}> = ({ t, o, lon0, lon1, lat0, lat1, n = 26, speed = 1, color = "rgba(255,255,255,0.9)", width = 5, seed = 1 }) => {
  if (o <= 0.001) return null;
  const a = proj(lon0, lat0), b = proj(lon1, lat1);
  const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x), y0 = Math.min(a.y, b.y), y1 = Math.max(a.y, b.y);
  const W = x1 - x0, H = y1 - y0;
  const lines = Array.from({ length: n }, (_, i) => {
    const r = (k: number) => Math.abs(Math.sin((i + 1) * 12.9898 * (k + seed) * 1.7)) % 1;
    const y = y0 + H * ((i + 0.5) / n) + (r(1) - 0.5) * H / n;
    const len = W * (0.12 + 0.18 * r(2));
    const v = (0.9 + 0.6 * r(3)) * speed;
    const phase = r(4);
    // position along the band, moving west (decreasing x); loops
    const u = (((phase - t * 0.055 * v) % 1) + 1) % 1;
    const xs = x0 + u * (W + len) - len;
    const amp = 10 + 14 * r(5);
    const pts = Array.from({ length: 9 }, (_, k) => {
      const xx = xs + (len * k) / 8;
      return `${xx.toFixed(1)},${(y + Math.sin(xx / 260 + i) * amp).toFixed(1)}`;
    }).join(" ");
    const edge = Math.min(1, u * 6, (1 - u) * 6);
    return <polyline key={i} points={pts} fill="none" stroke={`url(#sg${seed})`} strokeWidth={width * (0.7 + 0.6 * r(6))} strokeLinecap="round" opacity={edge * (0.6 + 0.4 * r(7))} />;
  });
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: o, filter: "drop-shadow(0 0 6px rgba(255,255,255,.55))" }} width={1} height={1}>
      <defs>
        <linearGradient id={`sg${seed}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={color} stopOpacity={1} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {lines}
    </svg>
  );
};

/* ---------- screen-space pieces ---------- */

export const Label: React.FC<{ x: number; y: number; text: string; o: number; s?: number; t?: number; side?: "l" | "r" | "c"; size?: number }> = ({ x, y, text, o, s = 1, t = 0, side = "c", size = 38 }) => {
  if (o <= 0.001) return null;
  const pulse = (t * 1.2) % 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: `scale(${s})` }}>
      <div style={{ position: "absolute", left: -9, top: -9, width: 18, height: 18, borderRadius: 9, background: "#fff", boxShadow: "0 0 18px rgba(255,255,255,.9)" }} />
      <div style={{ position: "absolute", left: -9 - 30 * pulse, top: -9 - 30 * pulse, width: 18 + 60 * pulse, height: 18 + 60 * pulse, borderRadius: "50%", border: "3px solid rgba(255,255,255,.8)", opacity: 1 - pulse }} />
      <div dir="rtl" style={{
        position: "absolute", top: -size * 0.75, whiteSpace: "nowrap",
        left: side === "l" ? undefined : side === "r" ? 22 : 0,
        right: side === "l" ? 22 : undefined,
        transform: side === "c" ? "translate(-50%, -70%)" : undefined,
        fontFamily: FONT_UI, fontWeight: 800, fontSize: size, color: "#fff",
        textShadow: "0 3px 10px rgba(0,0,0,.75), 0 0 2px rgba(0,0,0,.9)",
      }}>{text}</div>
    </div>
  );
};

export const Thermo: React.FC<{ x: number; y: number; level: number; o: number; s?: number; text?: string; hot?: boolean }> = ({ x, y, level, o, s = 1, text, hot = true }) => {
  if (o <= 0.001) return null;
  const c = hot ? "#ff3b30" : "#2f8cff";
  const H = 150, fill = 18 + (H - 36) * clamp01(level);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: `translate(-50%,-100%) scale(${s})`, transformOrigin: "50% 100%" }}>
      <svg width={70} height={H + 40} viewBox={`0 0 70 ${H + 40}`}>
        <defs>
          <linearGradient id="tg" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity=".95" /><stop offset=".5" stopColor="#dfe8ee" /><stop offset="1" stopColor="#fff" stopOpacity=".8" /></linearGradient>
        </defs>
        <rect x={22} y={6} width={26} height={H} rx={13} fill="url(#tg)" stroke="rgba(0,0,0,.25)" strokeWidth={2} />
        <circle cx={35} cy={H + 14} r={22} fill="url(#tg)" stroke="rgba(0,0,0,.25)" strokeWidth={2} />
        <rect x={29} y={6 + H - fill} width={12} height={fill + 8} rx={6} fill={c} />
        <circle cx={35} cy={H + 14} r={15} fill={c} />
        <circle cx={29} cy={H + 8} r={4} fill="#fff" opacity={0.7} />
        {[0.25, 0.5, 0.75].map((k) => <rect key={k} x={48} y={6 + H * (1 - k)} width={9} height={3} fill="rgba(0,0,0,.35)" />)}
      </svg>
      {text && (
        <div style={{ position: "absolute", left: 66, top: 8, fontFamily: FONT_HERO, fontSize: 44, color: "#fff", textShadow: `0 0 14px ${c}, 0 3px 8px rgba(0,0,0,.7)`, whiteSpace: "nowrap", direction: "ltr" }}>{text}</div>
      )}
    </div>
  );
};

/* icons: user PNG if present, else SVG */
const Cloud: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <g>
    <ellipse cx={100} cy={112} rx={78} ry={34} fill={dark ? "#5b6572" : "#eef2f6"} />
    <circle cx={72} cy={92} r={34} fill={dark ? "#6b7582" : "#f7f9fb"} />
    <circle cx={112} cy={78} r={44} fill={dark ? "#77818e" : "#fff"} />
    <circle cx={146} cy={100} r={28} fill={dark ? "#67717e" : "#f2f5f8"} />
    <ellipse cx={100} cy={128} rx={74} ry={16} fill={dark ? "#4a525c" : "#d5dde5"} opacity={0.8} />
  </g>
);
const SunG: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <g transform={`rotate(${t * 20} 100 100)`}>
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={96} y={10} width={8} height={30} rx={4} fill="#ffb300" transform={`rotate(${i * 30} 100 100)`} />
      ))}
    </g>
    <circle cx={100} cy={100} r={52} fill="url(#sunG)" />
    <circle cx={84} cy={82} r={14} fill="#fff" opacity={0.45} />
  </g>
);
export const Icon: React.FC<{ name: "cloud_rain" | "cloud_sun" | "sun" | "storm" | "sailboat" | "wheat_dry"; x: number; y: number; size: number; o: number; t: number; s?: number; rot?: number }> = ({ name, x, y, size, o, t, s = 1, rot = 0 }) => {
  if (o <= 0.001) return null;
  const wrap = (child: React.ReactNode) => (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, opacity: o, transform: `scale(${s}) rotate(${rot}deg)`, filter: "drop-shadow(0 10px 14px rgba(0,0,0,.35))" }}>{child}</div>
  );
  if (HAVE[name]) {
    const wet = name === "cloud_rain" || name === "storm";
    const flash = name === "storm" && Math.sin(t * 7.3) > 0.93 ? 1.8 : 1;
    return wrap(<>
      {wet && <Rain x={size / 2} y={size * 0.55} w={size * 0.62} h={size * 1.05} t={t} o={1} n={name === "storm" ? 30 : 20} color={name === "storm" ? "110,170,255" : "150,205,255"} />}
      <Img src={staticFile(`styles/satellite-explainer/img/${name}.webp`)} style={{ position: "relative", width: "100%", height: "100%", objectFit: "contain", maxWidth: "none", filter: `brightness(${flash})` }} />
    </>);
  }
  const rain = (n: number, col: string) => Array.from({ length: n }, (_, i) => {
    const ph = ((t * 1.6 + i * 0.37) % 1);
    const xx = 50 + (i * 100) / n + 10;
    return <line key={i} x1={xx - 6 * ph} y1={135 + ph * 60} x2={xx - 6 * ph - 5} y2={150 + ph * 60} stroke={col} strokeWidth={6} strokeLinecap="round" opacity={1 - ph} />;
  });
  const svg = (inner: React.ReactNode) => (
    <svg viewBox="0 0 200 220" width={size} height={size * 1.1}>
      <defs>
        <radialGradient id="sunG" cx=".4" cy=".35"><stop offset="0" stopColor="#fff6a8" /><stop offset=".55" stopColor="#ffc81e" /><stop offset="1" stopColor="#ff8a00" /></radialGradient>
      </defs>
      {inner}
    </svg>
  );
  switch (name) {
    case "sun": return wrap(svg(<SunG t={t} />));
    case "cloud_sun": return wrap(svg(<><g transform="translate(40 -30) scale(.8)"><SunG t={t} /></g><Cloud /></>));
    case "cloud_rain": return wrap(svg(<>{rain(5, "#3aa0ff")}<Cloud /></>));
    case "storm": return wrap(svg(<>{rain(7, "#2a7dff")}<Cloud dark /><polygon points="104,120 86,160 102,158 92,196 126,146 108,148 118,120" fill="#ffd21a" opacity={Math.sin(t * 13) > 0.3 ? 1 : 0.25} /></>));
    case "sailboat": return wrap(
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <path d="M100 20 L100 150 L40 150 Z" fill="#fff" /><path d="M108 40 L108 150 L160 150 Z" fill="#f1f4f7" />
        <path d="M30 158 L170 158 L150 182 L50 182 Z" fill="#fff" /><rect x={98} y={18} width={5} height={140} fill="#dde3e8" />
      </svg>);
    case "wheat_dry": return wrap(
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <circle cx={100} cy={100} r={88} fill="rgba(160,20,20,.85)" stroke="#fff" strokeWidth={8} />
        {[-18, 0, 18].map((d, i) => <g key={i} transform={`rotate(${d} 100 150)`}>
          <line x1={100} y1={150} x2={100} y2={50} stroke="#e8c27a" strokeWidth={6} />
          {[0, 1, 2, 3].map((k) => <ellipse key={k} cx={100 + (k % 2 ? 9 : -9)} cy={62 + k * 18} rx={7} ry={13} fill="#d9a441" transform={`rotate(${k % 2 ? 30 : -30} ${100 + (k % 2 ? 9 : -9)} ${62 + k * 18})`} />)}
        </g>)}
        <line x1={40} y1={40} x2={160} y2={160} stroke="#fff" strokeWidth={12} strokeLinecap="round" />
      </svg>);
  }
};

// desk fan: user PNG layers if present, else SVG; `ang` = blade angle, tilt = 3/4 turn
export const Fan: React.FC<{ x: number; y: number; size: number; ang: number; o: number; s?: number; tilt?: number; wobble?: number; speed?: number; nod?: number; dead?: number }> = ({ x, y, size, ang, o, s = 1, tilt = -28, wobble = 0, speed = 0, nod = 0, dead = 0 }) => {
  if (o <= 0.001) return null;
  const head = size * 0.78;
  const blades = HAVE.fan_blades
    ? <Img src={staticFile("styles/satellite-explainer/img/fan_blades.webp")} style={{ width: "100%", height: "100%", maxWidth: "none", transform: `rotate(${ang}deg)` }} />
    : (
      <svg viewBox="-100 -100 200 200" width="100%" height="100%" style={{ transform: `rotate(${ang}deg)` }}>
        {[0, 120, 240].map((a) => (
          <path key={a} transform={`rotate(${a})`} d="M0 -8 C 30 -70, 78 -60, 70 -20 C 62 6, 20 4, 0 0 Z" fill="url(#bl)" stroke="rgba(0,0,0,.12)" strokeWidth={1.5} />
        ))}
        <defs><linearGradient id="bl" x1="0" x2="1"><stop offset="0" stopColor="#dfe7ee" /><stop offset="1" stopColor="#ffffff" /></linearGradient></defs>
        <circle r={16} fill="#e9eef3" stroke="rgba(0,0,0,.18)" strokeWidth={2} /><circle r={6} fill="#b9c4ce" />
      </svg>
    );
  const grille = HAVE.fan_grille
    ? <Img src={staticFile("styles/satellite-explainer/img/fan_grille.webp")} style={{ width: "100%", height: "100%", maxWidth: "none" }} />
    : (
      <svg viewBox="-100 -100 200 200" width="100%" height="100%">
        <circle r={96} fill="none" stroke="#fff" strokeWidth={7} />
        {[30, 55, 78].map((r) => <circle key={r} r={r} fill="none" stroke="rgba(255,255,255,.75)" strokeWidth={2.2} />)}
        {Array.from({ length: 24 }, (_, i) => <line key={i} x1={0} y1={0} x2={0} y2={-96} stroke="rgba(255,255,255,.7)" strokeWidth={1.8} transform={`rotate(${i * 15})`} />)}
        <circle r={18} fill="#f4f7fa" stroke="rgba(0,0,0,.15)" strokeWidth={2} />
      </svg>
    );
  const body = HAVE.fan_body
    ? <Img src={staticFile("styles/satellite-explainer/img/fan_body.webp")} style={{ position: "absolute", left: -size * 0.1, top: size * 0.25, width: size * 1.2, height: size * 1.2, maxWidth: "none", objectFit: "contain" }} />
    : (
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ position: "absolute", left: 0, top: size * 0.45 }}>
        <rect x={88} y={40} width={24} height={90} rx={10} fill="#e9eef3" />
        <ellipse cx={100} cy={150} rx={70} ry={22} fill="#dfe6ec" /><ellipse cx={100} cy={142} rx={66} ry={18} fill="#fff" />
      </svg>
    );
  if (HAVE.fan_body && HAVE.fan_grille && HAVE.fan_blades) {
    // user PNGs as real 3D layers: stand (lower half of fan_body) + a head built in 3D
    // (back shell, cylinder rim, blades, front grille), turned 3/4 toward the ocean.
    const hd = size * 0.64, depth = hd * 0.2;
    const blur = Math.min(10, speed * 10);
    const rim = Array.from({ length: 10 }, (_, i) => i / 9);
    return (
      <div style={{
        position: "absolute", left: x - size / 2, top: y - size * 0.35, width: size, height: size, opacity: o,
        transform: `scale(${s}) rotate(${wobble}deg)`, transformOrigin: "50% 92%",
        filter: `drop-shadow(0 18px 20px rgba(0,0,0,.5)) grayscale(${dead * 0.5}) brightness(${1 - dead * 0.18})`,
      }}>
        {/* stand: only the neck + base of the PNG */}
        <Img src={staticFile("styles/satellite-explainer/img/fan_body.webp")} style={{ position: "absolute", left: 0, top: 0, width: size, height: size, maxWidth: "none", clipPath: "inset(56% 0 0 0)" }} />
        <div style={{ position: "absolute", left: size * 0.495 - hd / 2, top: size * 0.33 - hd / 2, width: hd, height: hd, perspective: 700 }}>
          <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateY(${tilt}deg) rotateX(${nod}deg)` }}>
            {/* back shell + motor housing */}
            <div style={{ position: "absolute", inset: hd * 0.02, borderRadius: "50%", transform: `translateZ(${-depth}px)`, background: "radial-gradient(circle at 42% 38%, #f4f7fa, #c9d3db 60%, #a4b1bc)" }} />
            <div style={{ position: "absolute", left: hd * 0.36, top: hd * 0.36, width: hd * 0.28, height: hd * 0.28, borderRadius: "50%", transform: `translateZ(${-depth * 1.6}px)`, background: "radial-gradient(circle at 40% 35%, #ffffff, #cfd8df)" }} />
            {/* cylinder rim (stacked rings) */}
            {rim.map((k) => (
              <div key={k} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `${hd * 0.035}px solid rgb(${232 - 40 * k},${238 - 38 * k},${243 - 35 * k})`, transform: `translateZ(${-depth * k}px)` }} />
            ))}
            {/* inner shadow so the white blades read */}
            <div style={{ position: "absolute", inset: hd * 0.04, borderRadius: "50%", transform: `translateZ(${-depth * 0.85}px)`, background: "radial-gradient(circle, rgba(120,140,155,.55), rgba(70,88,102,.75))" }} />
            {/* blades + motion blur disc */}
            <Img src={staticFile("styles/satellite-explainer/img/fan_blades.webp")} style={{
              position: "absolute", left: hd * 0.08, top: hd * 0.046, width: hd * 0.84, height: hd * 0.84, maxWidth: "none",
              transform: `translateZ(${-depth * 0.45}px) rotate(${ang}deg)`, transformOrigin: "50% 54%", filter: `blur(${blur}px)`, opacity: 1 - speed * 0.35,
            }} />
            <div style={{ position: "absolute", inset: hd * 0.09, borderRadius: "50%", transform: `translateZ(${-depth * 0.45}px)`, background: "radial-gradient(circle, rgba(255,255,255,.9) 0 12%, rgba(240,246,250,.55) 30%, rgba(230,238,244,.35) 80%, transparent 100%)", opacity: speed * 0.9 }} />
            {/* front grille */}
            <Img src={staticFile("styles/satellite-explainer/img/fan_grille.webp")} style={{ position: "absolute", left: -hd * 0.025, top: -hd * 0.025, width: hd * 1.05, height: hd * 1.05, maxWidth: "none", transform: "translateZ(1px)" }} />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size * 1.4, opacity: o, transform: `scale(${s}) rotate(${wobble}deg)`, filter: "drop-shadow(0 18px 22px rgba(0,0,0,.45))", perspective: 900 }}>
      {body}
      <div style={{ position: "absolute", left: (size - head) / 2, top: 0, width: head, height: head, transform: `rotateY(${tilt}deg)`, transformStyle: "preserve-3d" }}>
        <div style={{ position: "absolute", inset: head * 0.06, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,.18), rgba(200,220,235,.08))" }} />
        <div style={{ position: "absolute", inset: head * 0.08 }}>{blades}</div>
        <div style={{ position: "absolute", inset: 0 }}>{grille}</div>
      </div>
    </div>
  );
};

/* big glowing title (النینیو / سوپر النینیو) */
export const Title: React.FC<{ text: string; o: number; s: number; glow: string; y?: number; size?: number; shake?: { x: number; y: number } }> = ({ text, o, s, glow, y = 760, size = 150, shake = { x: 0, y: 0 } }) => {
  if (o <= 0.001) return null;
  return (
    <div dir="rtl" style={{
      position: "absolute", left: 0, right: 0, top: y, textAlign: "center", opacity: o,
      transform: `translate(${shake.x}px, ${shake.y}px) scale(${s})`,
      fontFamily: FONT_HERO, fontSize: size, color: "#fff", lineHeight: 1.1,
      textShadow: `0 0 18px ${glow}, 0 0 46px ${glow}, 0 0 90px ${glow}, 0 6px 14px rgba(0,0,0,.6)`,
    }}>{text}</div>
  );
};

/* word-by-word captions */
export type Word = { w: string; s: number; e: number; line: number };
export const groupWords = (words: Word[]) => {
  const groups: Word[][] = [];
  let g: Word[] = [];
  for (const w of words) {
    g.push(w);
    const gap = words[words.indexOf(w) + 1] ? words[words.indexOf(w) + 1].s - w.e : 9;
    if (g.length >= 4 || /[.،؛؟!:]$|»$/.test(w.w) || gap > 0.35) { groups.push(g); g = []; }
  }
  if (g.length) groups.push(g);
  return groups;
};
export const Captions: React.FC<{ t: number; groups: Word[][]; y?: number; hide?: boolean }> = ({ t, groups, y = 1395, hide }) => {
  if (hide) return null;
  const g = groups.find((gg, i) => t >= gg[0].s - 0.08 && t < (groups[i + 1] ? Math.min(groups[i + 1][0].s - 0.08, gg.at(-1)!.e + 0.9) : gg.at(-1)!.e + 0.9));
  if (!g) return null;
  const k = clamp01((t - g[0].s + 0.08) / 0.16);
  return (
    <div dir="rtl" style={{
      position: "absolute", left: 60, right: 60, top: y, textAlign: "center",
      fontFamily: FONT_UI, fontWeight: 800, fontSize: 58, lineHeight: 1.35,
      transform: `translateY(${(1 - k) * 18}px)`, opacity: k,
    }}>
      {g.map((w, i) => {
        const on = t >= w.s - 0.03;
        return (
          <span key={i} style={{
            color: on ? "#fff" : "rgba(255,255,255,.55)",
            textShadow: "0 3px 12px rgba(0,0,0,.85), 0 0 3px rgba(0,0,0,.9)",
            margin: "0 7px", display: "inline-block",
            transform: `scale(${on && t < w.e ? 1.06 : 1})`,
          }}>{w.w.replace(/[«»ً-ْ]/g, "").replace(/\d/g, (d) => FA(d))}</span>
        );
      })}
    </div>
  );
};

/* air blown out of the fan face: streaks leaving the grille and fanning out to the west */
export const AirCone: React.FC<{ x: number; y: number; t: number; power: number; o: number; len?: number; color?: string }> = ({ x, y, t, power, o, len = 620, color = "190,240,255" }) => {
  if (o <= 0.001) return null;
  const N = 34;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: o, filter: "drop-shadow(0 0 6px rgba(170,230,255,.8))" }}>
      {Array.from({ length: N }, (_, i) => {
        const r = (k: number) => (Math.abs(Math.sin((i + 1) * 91.7 * (k + 1))) * 1000) % 1;
        const ang = ((r(1) - 0.5) * 34 * Math.PI) / 180;
        const ph = (t * (0.9 + 0.5 * r(2)) * 1.1 + r(3)) % 1;
        const d = ph * len, L = 40 + 110 * r(4) * (0.4 + 0.6 * power);
        const x0 = x - d, y0 = y + Math.tan(ang) * d + Math.sin(d / 60 + i) * 6;
        const x1 = x0 + L, y1 = y0 - Math.tan(ang) * L;
        const a = Math.min(1, ph * 6) * (1 - ph) * power;
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={`rgba(${color},${a.toFixed(3)})`} strokeWidth={4 + 5 * r(5)} strokeLinecap="round" />;
      })}
    </svg>
  );
};

/* falling rain under a cloud (screen space) */
export const Rain: React.FC<{ x: number; y: number; w: number; h: number; t: number; o: number; n?: number; color?: string; slant?: number }> = ({ x, y, w, h, t, o, n = 26, color = "150,205,255", slant = -0.18 }) => {
  if (o <= 0.001) return null;
  return (
    <svg width={w + 60} height={h} style={{ position: "absolute", left: x - w / 2 - 30, top: y, opacity: o, overflow: "visible" }}>
      {Array.from({ length: n }, (_, i) => {
        const r = (k: number) => (Math.abs(Math.sin((i + 1) * 57.3 * (k + 3))) * 1000) % 1;
        const ph = (t * (1.6 + r(1)) + r(2)) % 1;
        const xx = 30 + r(3) * w, yy = ph * h, L = 26 + 22 * r(4);
        return <line key={i} x1={xx + slant * yy} y1={yy} x2={xx + slant * (yy + L)} y2={yy + L} stroke={`rgba(${color},${(0.9 * Math.min(1, (1 - ph) * 3)).toFixed(3)})`} strokeWidth={4} strokeLinecap="round" />;
      })}
    </svg>
  );
};
