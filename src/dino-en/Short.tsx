// Vertical 9:16 Shorts/Reels cut from the EN dino film: windows of the main timeline, reframed (center crop follows the
// film's camera focus), with a hook title, big word-by-word captions in the safe zone and an end card. Audio is muxed later.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, staticFile, continueRender, delayRender } from "remotion";
import { SHOTS, ShotView } from "./Video";
import SH from "./shorts.json";

export const SHORT_FPS = 24;
type Short = { id: string; name: string; hook: string[]; focus: Record<string, number>; segs: [number, number, number][]; words: { w: string; s: number; e: number }[]; dur: number };
export const SHORTS = SH as unknown as Short[];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FONT = "Anton";
const h = delayRender("short font");
new FontFace(FONT, `url('${staticFile("fonts/Anton-Regular.ttf")}')`).load().then((f) => { document.fonts.add(f); continueRender(h); });

// main-film time for a local short time
const mainTime = (sh: Short, t: number) => {
  let seg = sh.segs[0];
  for (const s of sh.segs) if (t >= s[0]) seg = s;
  return Math.min(seg[1] + (t - seg[0]), seg[2] - 0.01);
};

// group words into 1-3 word chunks (break at punctuation) for big captions
const chunks = (ws: Short["words"]) => {
  const out: { words: Short["words"]; s: number; e: number }[] = [];
  let cur: Short["words"] = [];
  ws.forEach((w, i) => {
    cur.push(w);
    const end = /[.!?,…:]$/.test(w.w) || cur.length >= 3 || i === ws.length - 1 || (ws[i + 1] && ws[i + 1].s - w.e > 0.4);
    if (end) { out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e }); cur = []; }
  });
  return out;
};

const Captions: React.FC<{ sh: Short; t: number }> = ({ sh, t }) => {
  const cs = React.useMemo(() => chunks(sh.words), [sh]);
  const c = cs.find((x, i) => t >= x.s - 0.05 && t < (cs[i + 1]?.s ?? x.e + 0.6));
  if (!c || t > c.e + 0.6) return null;
  const pop = interpolate(t, [c.s - 0.05, c.s + 0.12], [0.85, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 1180, textAlign: "center", transform: `scale(${pop})` }}>
      {c.words.map((w, i) => {
        const on = t >= w.s - 0.03;
        return <span key={i} style={{ fontFamily: FONT, fontSize: 104, lineHeight: 1.1, margin: "0 12px", display: "inline-block",
          color: on ? "#ffd63a" : "#fff", WebkitTextStroke: "10px #000", paintOrder: "stroke fill", textShadow: "0 8px 0 rgba(0,0,0,.6)" }}>{w.w.toUpperCase()}</span>;
      })}
    </div>
  );
};

export const DinoShort: React.FC<{ idx: number }> = ({ idx }) => {
  const f = useCurrentFrame();
  const sh = SHORTS[idx];
  const t = f / SHORT_FPS;
  const body = t < sh.dur - 2.6;
  const now = mainTime(sh, Math.min(t, sh.dur - 2.61));
  let shot = SHOTS.find((s) => now >= s.s && now < s.e) ?? SHOTS[SHOTS.length - 1];
  let ts = now - shot.s;
  let held = false;
  if (shot.img === "black") { // a black beat reads as dead air on a phone: hold the last picture, darker
    const i = SHOTS.indexOf(shot); let j = i - 1;
    while (j > 0 && SHOTS[j].img === "black") j--;
    ts = SHOTS[j].e - SHOTS[j].s + (now - SHOTS[j].e) * 0.5; shot = SHOTS[j]; held = true;
  }
  const fx = sh.focus[String(shot.n)] ?? 0.5;
  const punch = interpolate(ts, [0, 0.3], [1.07, 1], clamp);
  const S = 1920 / 1080; // scale the 16:9 frame to fill the 9:16 height, keep the centre (the film's camera keeps its subject centred)
  const hookK = interpolate(t, [0, 0.15, 2.4, 2.8], [0, 1, 1, 0], clamp);
  const endK = interpolate(t, [sh.dur - 2.6, sh.dur - 2.2], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: Math.min(0, Math.max(1080 - 1920 * S * punch, 540 - fx * 1920 * S * punch)), top: (1920 - 1080 * S * punch) / 2, width: 1920, height: 1080,
        transform: `scale(${S * punch})`, transformOrigin: "0 0", filter: body ? (held ? "brightness(0.45)" : undefined) : `blur(${12 * endK}px) brightness(${1 - 0.5 * endK})` }}>
        <ShotView key={shot.n} shot={shot} t={ts} vertical />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)" }} />
      {body && <Captions sh={sh} t={t} />}
      {/* hook */}
      <div style={{ position: "absolute", top: 250, left: 60, right: 60, textAlign: "center", opacity: hookK, transform: `scale(${0.9 + 0.1 * hookK})` }}>
        {sh.hook.map((l, i) => <div key={i} style={{ fontFamily: FONT, fontSize: i ? 118 : 96, lineHeight: 1.05, color: i ? "#ffd63a" : "#fff",
          WebkitTextStroke: "10px #000", paintOrder: "stroke fill", textShadow: "0 8px 0 rgba(0,0,0,.6)" }}>{l}</div>)}
      </div>
      {/* end card */}
      {endK > 0 && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: endK }}>
          <div style={{ fontFamily: FONT, fontSize: 84, color: "#fff", textAlign: "center", lineHeight: 1.15, WebkitTextStroke: "8px #000", paintOrder: "stroke fill" }}>
            FULL STORY<br />ON YOUTUBE
          </div>
          <div style={{ marginTop: 36, fontFamily: FONT, fontSize: 120, color: "#3a1d06", background: "#ffcf86", padding: "6px 50px 18px", borderRadius: 22,
            transform: `scale(${0.9 + 0.1 * endK})` }}>STAY SMALL</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
