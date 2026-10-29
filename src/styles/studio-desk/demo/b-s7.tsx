// Video 23 · S7 (49.45 – 63.05), light desk: gift box → NFP file → two monthly subscriptions struck out («لازم نیست») →
// NFP + Claude → a timeline that stretches to 10:24 → the Claude Code editor building this very reel.
import React from "react";
import { Img } from "remotion";
import { CheckDot, Echo, Ring, typedW, ClaudeMark, Full, Glint, Spinner, Toggle, Wave, mss, slam } from "./b-kit";
import { C, FA, MONO, NUM, S, SHADOW, UI, clamp, ease, hit, lerp, ramp, rnd, v23 } from "./lib";
import { Clip, Ico } from "./ui";

type P = React.CSSProperties;
const mono = (s: number, c: string, ls = 2): P => ({ fontFamily: MONO, fontWeight: 600, fontSize: s, letterSpacing: ls, color: c, direction: "ltr", whiteSpace: "nowrap", lineHeight: 1 });
const inter = (s: number, w: number, c: string): P => ({ fontFamily: UI, fontSize: s, fontWeight: w, color: c, direction: "ltr", whiteSpace: "nowrap", lineHeight: 1.15 });
const fa = (s: number, w: number, c: string): P => ({ fontFamily: FA, fontSize: s, fontWeight: w, color: c, direction: "rtl", whiteSpace: "nowrap", lineHeight: 1.3, wordSpacing: "0.2em" });

/** «20+ سبک آماده» with the number isolated LTR (U+2066 … U+2069) */
const STYLES20 = "\u206620+\u2069\u00A0 \u0633\u0628\u06A9 \u0622\u0645\u0627\u062F\u0647";

const T7 = () => ({
  drop: 49.45, snap: S(147) - 0.02, wig: S(138), hop1: S(140), hop2: S(144), open: S(146), file: S(147), nfp: S(148), boxOut: S(150), up: S(151),
  without: S(153), money: S(156), subs: S(158), hf: S(159), gf: S(161), no: S(163), wth: S(164), cl: S(165), vid: S(166), long: S(167), make: S(168),
  self: S(170), reels: S(171), claude: S(173), nfp2: S(175), made: S(176), done: S(177),
});

/** the NFP file icon (300×380 at s=1) */
const NfpFile: React.FC<{ s?: number; t: number; glow?: number }> = ({ s = 1, t, glow = 0 }) => (
  <div style={{ position: "relative", width: 300 * s, height: 380 * s }}>
    {glow > 0 && <div style={{ position: "absolute", left: -120 * s, top: -120 * s, width: 540 * s, height: 620 * s, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(242,92,31,${0.35 * glow}) 0%, rgba(242,92,31,0) 62%)` }} />}
    <svg width={300 * s} height={380 * s} viewBox="0 0 300 380" style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 26px 34px rgba(20,20,30,.25))", overflow: "visible" }}>
      <defs>
        <linearGradient id="nfpPaper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#F1EFE9" /></linearGradient>
      </defs>
      <path d="M24 0h184l92 92v264a24 24 0 01-24 24H24a24 24 0 01-24-24V24A24 24 0 0124 0z" fill="url(#nfpPaper)" />
      <path d="M208 0v68a24 24 0 0024 24h68z" fill="#E2DFD6" />
      <rect x={0} y={300} width={300} height={80} rx={0} fill="#16171A" clipPath="inset(0 round 0 0 24px 24px)" />
      <path d="M0 300h300v56a24 24 0 01-24 24H24a24 24 0 01-24-24z" fill="#16171A" />
    </svg>
    {/* style swatches (real style frames) */}
    <div style={{ position: "absolute", left: 30 * s, top: 34 * s, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 * s, width: 150 * s }}>
      {[14, 15, 16, 19, 23, 37].map((n, i) => (
        <div key={n} style={{ height: 52 * s, borderRadius: 8 * s, overflow: "hidden", background: "#ddd", transform: `translateY(${Math.sin(t * 3 + i) * 1.5 * s}px)` }}>
          <Img src={v23(`stills/s${n}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", maxWidth: "none" }} />
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", left: 26 * s, top: 160 * s, fontFamily: UI, fontWeight: 900, fontStyle: "italic", fontSize: 104 * s, letterSpacing: -4 * s, color: C.ink, lineHeight: 1 }}>NFP</div>
    <div style={{ position: "absolute", left: 30 * s, top: 270 * s, width: 140 * s, height: 8 * s, borderRadius: 4 * s, background: C.green }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 300 * s, height: 80 * s, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${24 * s}px` }}>
      <span style={mono(17 * s, "rgba(255,255,255,.65)", 2 * s)}>NFP.zip</span>
      <span style={{ ...fa(22 * s, 800, "#fff") }}>{STYLES20}</span>
    </div>
  </div>
);

/** premium matte-black gift box, front view. body 440×330, lid 470×96; (cx, bottom) anchor */
const GiftBox: React.FC<{ t: number; seam: number; lidK: number; open: number; snap: number; lidY: number; lidR: number }> = ({ t, seam, lidK, open, snap, lidY, lidR }) => (
  <>
    {/* body */}
    <div style={{ position: "absolute", left: 320, top: 680, width: 440, height: 330, borderRadius: "6px 6px 16px 16px", background: "linear-gradient(90deg, #121316 0%, #23242A 18%, #1B1C21 60%, #0F1013 100%)", boxShadow: "inset 0 2px 0 rgba(255,255,255,.08), inset 0 -20px 40px rgba(0,0,0,.35)", overflow: "hidden" }}>
      {[0, 1].map((h) => (
        <div key={h} style={{ position: "absolute", left: 192 + h * 28, top: 0, width: 28, height: 330, overflow: "hidden", transformOrigin: h ? "0% 100%" : "100% 100%", transform: `translateY(${ease.in(snap) * 60}px) rotate(${(h ? 1 : -1) * ease.out(snap) * 24}deg)`, opacity: 1 - ease.in(snap) }}>
          <div style={{ position: "absolute", left: -h * 28, top: 0, width: 56, height: 330, background: "linear-gradient(90deg, #C9461A, #FF8A4F 45%, #E9561C 70%, #B63E14)" }} />
          <div style={{ position: "absolute", left: -h * 28, top: 0, width: 56, height: 330, background: "repeating-linear-gradient(180deg, rgba(255,255,255,.07) 0 2px, transparent 2px 7px)" }} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 28, bottom: 26, ...mono(15, "rgba(255,255,255,.38)", 5) }}>NFP · GIFT</div>
      <div style={{ position: "absolute", right: 28, bottom: 24, width: 26, height: 26, borderRadius: 13, border: "2px solid rgba(255,255,255,.22)" }} />
      {/* top inner shadow under the lid */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 26, background: "linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,0))", opacity: 1 - open }} />
    </div>
    {/* seam light */}
    {seam > 0 && <div style={{ position: "absolute", left: 330, top: 674 + lidY * 0.5, width: 420, height: 10, borderRadius: 5, background: "#FFD3B8", boxShadow: `0 0 ${20 + seam * 40}px ${6 + seam * 14}px rgba(255,122,61,${0.45 * seam})`, opacity: seam * (1 - open) }} />}
    {/* light leaking out of the seam: thin rising streaks */}
    {seam > 0.05 && open < 1 && Array.from({ length: 7 }, (_, i) => {
      const xx = 350 + i * 62 + Math.sin(t * 3 + i) * 6;
      const hh = (40 + rnd(i * 5) * 110) * seam * (0.7 + 0.3 * Math.sin(t * 9 + i * 2));
      return <div key={i} style={{ position: "absolute", left: xx, top: 676 - hh + lidY, width: 3, height: hh, borderRadius: 2, background: "linear-gradient(0deg, rgba(255,170,110,.9), rgba(255,170,110,0))", opacity: seam * (1 - open) }} />;
    })}
    {/* lid */}
    {lidK < 1 && (
      <div style={{ position: "absolute", left: 305, top: 600, width: 470, height: 96, transform: `translate(${lidK * 380}px, ${-lidK * 760 + lidY}px) rotate(${lidK * 38 + lidR}deg)`, opacity: 1 - ease.in(lidK) }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 12, background: "linear-gradient(90deg, #17181C 0%, #2C2D33 22%, #222329 60%, #141518 100%)", boxShadow: "0 10px 24px rgba(0,0,0,.35), inset 0 2px 0 rgba(255,255,255,.1)" }} />
        <div style={{ position: "absolute", left: 207, top: 0, width: 56, height: 96, background: "linear-gradient(90deg, #C9461A, #FF8A4F 45%, #E9561C 70%, #B63E14)" }} />
        {/* bow */}
        <svg width={260} height={120} viewBox="-130 -110 260 120" style={{ position: "absolute", left: 105, top: -96, overflow: "visible", transform: `rotate(${Math.sin(t * 3) * 2}deg)`, transformOrigin: "50% 100%" }}>
          <defs>
            <linearGradient id="bowG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF9A62" /><stop offset="1" stopColor="#D24C19" /></linearGradient>
          </defs>
          <path d="M-8 -6 C-60 -90 -130 -70 -110 -20 C-98 6 -40 4 -8 -6Z" fill="url(#bowG)" />
          <path d="M8 -6 C60 -90 130 -70 110 -20 C98 6 40 4 8 -6Z" fill="url(#bowG)" />
          <path d="M-14 -10 C-50 -60 -96 -56 -92 -28" stroke="rgba(120,30,0,.35)" strokeWidth={5} fill="none" />
          <path d="M14 -10 C50 -60 96 -56 92 -28" stroke="rgba(120,30,0,.35)" strokeWidth={5} fill="none" />
          <path d="M-10 -4 L-46 40 L-30 44 L-4 6Z M10 -4 L46 40 L30 44 L4 6Z" fill="#C9461A" />
          <rect x={-22} y={-22} width={44} height={30} rx={10} fill="#E9561C" />
          <rect x={-14} y={-18} width={14} height={6} rx={3} fill="rgba(255,255,255,.35)" />
        </svg>
      </div>
    )}
  </>
);

/** a monthly-subscription card (text wordmark only; no logos, no prices) */
const SubCard: React.FC<{ name: string; plan: string; card: string; credits: number; t: number; k: number; strike: number; off: number; load: number }> = ({ name, plan, card, credits, t, k, strike, off, load }) => {
  const dim = clamp(strike * 1.4);
  const skel = load < 1;
  return (
    <div style={{ position: "relative", width: 940, height: 290, borderRadius: 30, background: "#fff", boxShadow: SHADOW, overflow: "hidden", opacity: Math.min(1, k * 1.5) }}>
      {skel ? (
        <div style={{ position: "absolute", inset: 0, padding: 34 }}>
          <div style={{ position: "absolute", right: 34, top: 40, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={inter(19, 600, C.ink3)}>Loading plan…</span>
            <Spinner s={30} t={t} c={C.ink2} bg="rgba(0,0,0,.08)" />
          </div>
          {[[88, 88, 0, 0], [320, 40, 112, 6], [220, 26, 112, 60], [880, 2, 0, 136], [260, 30, 0, 176], [200, 30, 440, 176], [180, 30, 690, 176]].map(([w, h, x, y], i) => (
            <div key={i} style={{ position: "absolute", left: 34 + x, top: 34 + y, width: w, height: h, borderRadius: i === 0 ? 22 : 10, background: `linear-gradient(90deg, #EEECE6 0%, #F8F7F3 ${((t * 160) % 100)}%, #EEECE6 100%)` }} />
          ))}
        </div>
      ) : (
        <div style={{ position: "absolute", inset: 0, padding: "34px 36px", filter: `grayscale(${dim})`, opacity: lerp(1, 0.55, dim) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ width: 88, height: 88, borderRadius: 22, background: "linear-gradient(145deg,#2A2B31,#101114)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,.12)" }}>
              <Ico n="video" s={44} c="#fff" w={1.8} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ ...inter(48, 800, C.ink), letterSpacing: -1 }}>{name}</span>
              <span style={inter(23, 500, C.ink3)}>{plan}</span>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 999, background: "#F2F0EA" }}>
              <span style={fa(26, 800, C.ink)}>اشتراک ماهانه</span>
              <Ico n="loop" s={24} c={C.ink} w={2.2} />
            </div>
          </div>
          <div style={{ height: 2, background: C.line, margin: "26px 0 22px" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Toggle on={1 - off} w={66} />
              <span style={inter(23, 600, C.ink2)}>Auto-renew</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Ico n="card" s={30} c={C.ink2} w={1.8} />
              <span style={{ ...inter(23, 600, C.ink2), letterSpacing: 1 }}>•••• {card}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={inter(21, 600, C.ink3)}>Credits</span>
              <div style={{ width: 130, height: 10, borderRadius: 5, background: "#ECEAE3", overflow: "hidden" }}><div style={{ width: `${credits * 100}%`, height: "100%", background: C.ink }} /></div>
            </div>
          </div>
        </div>
      )}
      {/* strike */}
      {strike > 0 && (
        <svg width={940} height={290} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <line x1={20} y1={168} x2={20 + 900 * ease.out(strike)} y2={168 - 70 * ease.out(strike)} stroke={C.red} strokeWidth={11} strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
};

/** a long-video timeline that zooms out from 0:15 to 10:24 */
const SHOTS = (() => {
  const a: { s: number; l: number; img: number }[] = [];
  let s = 0, i = 0;
  while (s < 640) { const l = 3 + rnd(i * 2.3 + 1) * 7; a.push({ s, l, img: 14 + (i * 7) % 34 }); s += l; i++; }
  return a;
})();
const LongTimeline: React.FC<{ t: number; D: number; W: number; play: number }> = ({ t, D, W, play }) => {
  const steps = [5, 10, 30, 60, 120];
  const step = steps.find((s) => D / s <= 6) ?? 120;
  const labels: number[] = [];
  for (let v = 0; v <= D + 0.01; v += step) labels.push(v);
  return (
    <div style={{ position: "relative", width: W, height: 300 }}>
      {/* ruler */}
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 34 }}>
        {Array.from({ length: Math.floor(D / (step / 5)) + 1 }, (_, i) => {
          const v = i * (step / 5);
          return <div key={i} style={{ position: "absolute", left: (v / D) * W, top: i % 5 === 0 ? 20 : 26, width: 1.5, height: i % 5 === 0 ? 14 : 8, background: "rgba(255,255,255,.35)" }} />;
        })}
        {labels.map((v) => <div key={v} style={{ position: "absolute", left: (v / D) * W + 6, top: 0, ...inter(17, 600, "rgba(255,255,255,.55)") }}>{mss(v)}</div>)}
      </div>
      {/* V1 shots */}
      <div style={{ position: "absolute", left: 0, top: 48, width: W, height: 110, overflow: "hidden", borderRadius: 10 }}>
        {SHOTS.filter((sh) => sh.s < D).map((sh, i) => {
          const x = (sh.s / D) * W, w = Math.max(1, (sh.l / D) * W - 2);
          return (
            <div key={i} style={{ position: "absolute", left: x, top: 0, width: w, height: 110, borderRadius: Math.min(8, w / 3), overflow: "hidden", background: i % 5 === 0 ? C.green : i % 2 ? "#3A3B42" : "#2A2B31" }}>
              {w > 34 && <Img src={v23(`stills/s${String(sh.img).padStart(2, "0")}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", maxWidth: "none", opacity: 0.92 }} />}
            </div>
          );
        })}
      </div>
      {/* A1 voice */}
      <div style={{ position: "absolute", left: 0, top: 172, width: W, height: 48, borderRadius: 10, background: "rgba(255,255,255,.06)", overflow: "hidden", padding: "0 6px", display: "flex", alignItems: "center" }}>
        <Wave n={Math.round(W / 9)} w={W - 12} h={40} c="rgba(255,255,255,.75)" seed={3} gap={3} />
      </div>
      {/* A2 music */}
      <div style={{ position: "absolute", left: 0, top: 230, width: W, height: 40, borderRadius: 10, background: "rgba(242,92,31,.18)", overflow: "hidden", padding: "0 6px", display: "flex", alignItems: "center" }}>
        <Wave n={Math.round(W / 7)} w={W - 12} h={30} c="rgba(255,138,79,.85)" seed={7} gap={2} />
      </div>
      {/* playhead */}
      <div style={{ position: "absolute", left: play * W, top: 22, width: 3, height: 260, background: C.neon, boxShadow: `0 0 10px ${C.neon}` }}>
        <div style={{ position: "absolute", left: -9, top: -10, width: 21, height: 16, borderRadius: 4, background: C.neon }} />
      </div>
      <span style={{ display: "none" }}>{t}</span>
    </div>
  );
};

/** the Claude Code + preview editor window that "made this reel" */
const CODE_LINES = (x: ReturnType<typeof T7>) => [
  { t: x.reels - 0.05, txt: "متن و زمان‌بندی روی صدا", sub: "words.json · 314 words" },
  { t: x.claude, txt: "12 صحنه + انیمیشن", sub: "scenes A · B · C" },
  { t: x.nfp2, txt: "فیلم‌های خودم + افکت‌ها", sub: "clips · sfx · music" },
  { t: x.made, txt: "رندر 1080×1920", sub: "30 fps · H.264" },
];
const Editor: React.FC<{ t: number; self: boolean }> = ({ t, self }) => {
  const x = T7();
  const prog = ramp(t, x.self, 63.05);
  const prompt = "با NFP یه ریلز عمودی بساز";
  const ty = ramp(t, x.self + 0.05, x.self + 0.5);
  const lines = CODE_LINES(x);
  const st = slam(t, x.made, 0.2);
  const sh = st.sh * Math.sin(t * 95) * 8;
  return (
    <div style={{ position: "absolute", left: 40, top: 170, width: 1000, height: 1090, borderRadius: 30, background: "#141418", boxShadow: "0 50px 120px rgba(10,10,20,.4), 0 0 0 1px rgba(0,0,0,.5)", overflow: "hidden", transform: `translate(${sh}px, ${sh * 0.5}px)` }}>
      {/* title bar */}
      <div style={{ height: 58, background: "#1C1C21", display: "flex", alignItems: "center", padding: "0 22px", gap: 10, borderBottom: "1px solid #26262C" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 15, height: 15, borderRadius: 8, background: c }} />)}
        <div style={{ flex: 1, textAlign: "center", ...inter(20, 600, "#9A9CA3") }}>reel-23 — Claude Code · NFP</div>
        <span style={mono(16, "#6E7078", 2)}>1080×1920 · 30fps</span>
      </div>
      {/* preview */}
      <div style={{ position: "absolute", left: 24, top: 82, width: 420, height: 747, borderRadius: 18, overflow: "hidden", background: "#000", boxShadow: "0 0 0 1px #2A2A31" }}>
        <Clip src={self ? "self.mp4" : "hook.mp4"} t0={x.self - 0.3} from={self ? 0.2 : 0} dur={3.4} />
        <div style={{ position: "absolute", left: 14, top: 14, padding: "6px 10px", borderRadius: 6, background: "rgba(0,0,0,.6)", ...mono(14, "#fff", 2) }}>PREVIEW</div>
        <div style={{ position: "absolute", right: 14, top: 14, width: 12, height: 12, borderRadius: 6, background: C.neon, opacity: 0.5 + 0.5 * Math.abs(Math.sin(t * 5)) }} />
      </div>
      {/* transport */}
      <div style={{ position: "absolute", left: 24, top: 846, width: 420, display: "flex", alignItems: "center", gap: 14 }}>
        <Ico n="play" s={26} c="#fff" fill />
        <span style={inter(19, 600, "#C9CBD1")}>{`${mss(lerp(42, 62, prog))} / 1:53`}</span>
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#2A2A31" }}><div style={{ width: `${lerp(37, 54, prog)}%`, height: "100%", borderRadius: 3, background: C.neon }} /></div>
      </div>
      {/* Claude Code panel */}
      <div style={{ position: "absolute", left: 464, top: 82, width: 512, height: 790, borderRadius: 18, background: "#0C0C0F", border: "1px solid #26262C", padding: "22px 24px", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ClaudeMark s={32} />
          <span style={inter(25, 700, "#fff")}>Claude Code</span>
          <div style={{ flex: 1 }} />
          <span style={{ padding: "5px 12px", borderRadius: 999, background: "rgba(255,122,61,.15)", border: `1px solid ${C.neon}`, ...mono(15, C.neon, 2) }}>NFP</span>
        </div>
        <div style={{ height: 1, background: "#26262C", margin: "18px 0 22px" }} />
        {/* prompt */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ ...mono(26, C.neon, 0), marginTop: 6 }}>{">"}</span>
          <span style={{ ...fa(29, 700, "#fff"), whiteSpace: "normal", flex: 1, textAlign: "right" }}>{typedW(prompt, ty)}{ty < 1 && Math.floor(t * 4) % 2 ? "|" : ""}</span>
        </div>
        {/* tool call */}
        {t > x.self + 0.45 && (
          <div style={{ marginTop: 20, opacity: ramp(t, x.self + 0.45, x.self + 0.7) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: 5, background: C.neon }} />
              <span style={mono(19, "#E8E8EA", 1)}>Skill(nfp) · studio-desk</span>
            </div>
            <div style={{ ...mono(17, "#6E7078", 1), marginTop: 9, marginLeft: 22 }}>⎿ 20+ styles · kit loaded</div>
          </div>
        )}
        {/* checklist */}
        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 16 }}>
          {lines.map((l, i) => {
            const appear = i === 0 ? x.self + 0.6 : lines[i - 1].t;
            if (t < appear) return null;
            const done = t >= l.t;
            const k = ease.out(ramp(t, appear, appear + 0.25));
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, direction: "rtl", opacity: k, transform: `translateY(${(1 - k) * 16}px)` }}>
                {done ? <CheckDot s={34} k={Math.min(1, (t - l.t) / 0.18) + hit(t, l.t + 0.1, 0.25) * 0.15} c={C.neon} /> : <Spinner s={34} t={t} c={C.neon} bg="rgba(255,255,255,.12)" />}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                  <span style={fa(28, 700, done ? "#fff" : "#8A8C92")}>{l.txt}</span>
                  <span style={mono(15, "#6E7078", 1)}>{l.sub}</span>
                </div>
              </div>
            );
          })}
        </div>
        {/* render progress */}
        {t > x.reels && (() => {
          const rp = ease.io(ramp(t, x.reels, x.made));
          return (
            <div style={{ marginTop: 26, padding: "16px 18px", borderRadius: 12, background: "#141418", border: "1px solid #26262C", opacity: ramp(t, x.reels, x.reels + 0.3) }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={mono(16, rp < 1 ? "#9A9CA3" : C.neon, 1)}>{rp < 1 ? "* rendering…" : "✓ render done · 1:53"}</span>
                <span style={mono(16, C.neon, 1)}>{`${Math.round(rp * 100)}%`}</span>
              </div>
              <div style={{ marginTop: 12, height: 8, borderRadius: 4, background: "#26262C", overflow: "hidden" }}><div style={{ width: `${rp * 100}%`, height: "100%", background: C.neon }} /></div>
              <div style={{ marginTop: 10, ...mono(15, "#6E7078", 1) }}>{`frame ${String(Math.round(rp * 3420)).padStart(4, "0")} / 3420 · 1080×1920`}</div>
            </div>
          );
        })()}
        {/* footer */}
        <div style={{ position: "absolute", left: 24, right: 24, bottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, border: "1px solid #2A2A31" }}>
            <span style={mono(20, C.neon, 0)}>{">"}</span>
            <div style={{ width: 11, height: 24, background: Math.floor(t * 2.5) % 2 ? "#fff" : "transparent" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <span style={mono(14, "#55575E", 1)}>esc to interrupt</span>
            <span style={mono(14, "#55575E", 1)}>{`${(8.2 + prog * 4.6).toFixed(1)}k tokens`}</span>
          </div>
        </div>
      </div>
      {/* timeline */}
      <div style={{ position: "absolute", left: 24, top: 896, width: 952, height: 172, borderRadius: 16, background: "#0F0F12", border: "1px solid #26262C", padding: "12px 14px 12px 54px" }}>
        {["V1", "V2", "A1", "A2"].map((l, i) => <div key={l} style={{ position: "absolute", left: 14, top: 38 + i * 32, ...mono(14, "#6E7078", 1) }}>{l}</div>)}
        <div style={{ position: "relative", height: 20 }}>
          {Array.from({ length: 22 }, (_, i) => <div key={i} style={{ position: "absolute", left: i * 41, top: i % 4 === 0 ? 4 : 10, width: 1.5, height: i % 4 === 0 ? 14 : 8, background: "rgba(255,255,255,.3)" }} />)}
        </div>
        {[0, 1, 2, 3].map((r) => (
          <div key={r} style={{ position: "relative", height: 26, marginTop: 6, display: "flex", gap: 3 }}>
            {r === 2 ? <Wave n={110} w={880} h={24} c="rgba(255,255,255,.7)" seed={11} gap={2} /> : r === 3 ? <Wave n={110} w={880} h={18} c="rgba(255,138,79,.6)" seed={5} gap={2} /> :
              Array.from({ length: r === 0 ? 14 : 9 }, (_, j) => (
                <div key={j} style={{ flex: 1 + rnd(r * 17 + j) * 2, borderRadius: 5, overflow: "hidden", background: r === 1 ? (j % 3 === 0 ? C.neon : "rgba(255,122,61,.35)") : "#2E2F36", opacity: r === 1 && j % 2 ? 0 : 1 }}>
                  {r === 0 && <Img src={v23(`stills/s${String(14 + ((j * 5) % 34)).padStart(2, "0")}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", maxWidth: "none" }} />}
                </div>
              ))}
          </div>
        ))}
        <div style={{ position: "absolute", left: 54 + lerp(0.37, 0.54, prog) * 884, top: 8, width: 3, height: 156, background: C.neon, boxShadow: `0 0 8px ${C.neon}` }} />
      </div>
      {/* stamp */}
      {st.o > 0 && (
        <div style={{ position: "absolute", left: 500, top: 560, transform: `translate(-50%,-50%) rotate(-2deg) scale(${st.s})`, opacity: st.o }}>
          <div style={{ position: "relative", padding: "26px 40px 28px", borderRadius: 26, background: C.green, boxShadow: "0 16px 40px rgba(0,0,0,.35)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <Echo k={ramp(t, x.made + 0.18, x.made + 0.75)} r={26} c={C.neon} w={5} grow={0.25} />
            <Echo k={ramp(t, x.made + 0.3, x.made + 0.9)} r={26} c="rgba(255,255,255,.8)" w={3} grow={0.4} />
            <span style={fa(70, 900, "#fff")}>همین ویدیو</span>
            <div style={{ display: "flex", alignItems: "center", gap: 14, direction: "rtl" }}>
              <span style={fa(46, 800, "#fff")}>ساخته‌ی Claude + NFP</span>
              <ClaudeMark s={46} c="#fff" />
            </div>
            <span style={{ ...mono(16, "rgba(255,255,255,.8)", 5), marginTop: 4 }}>THIS VERY REEL</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const S7Body: React.FC<{ t: number; self: boolean }> = ({ t, self }) => {
  const x = T7();
  // ── gift box
  // the box is already falling into frame when the iris opens (49.45), lands at 49.62
  const fall = ramp(t, x.drop, x.drop + 0.17);
  const land = x.drop + 0.17;
  const by = t < land ? -420 * (1 - ease.in(fall)) : -Math.abs(Math.sin((t - land) * 14)) * 30 * Math.exp(-(t - land) * 7);
  const squash = hit(t, land, 0.22) * 0.1;
  // tension: the lid rattles on every word, harder each time; light leaks grow; slow push-in
  const RAT = [S(138), S(139), S(140), S(141), S(143), S(145), x.open];
  let lidY = 0, lidR = 0, jit = 0;
  RAT.forEach((b, i) => { const k = hit(t, b, 0.2), g = 0.45 + (i / (RAT.length - 1)) * 0.9; lidY -= k * 22 * g; lidR += k * (i % 2 ? 1 : -1) * 3.2 * g; jit += Math.sin((t - b) * 70) * hit(t, b, 0.25) * 4 * g; });
  const wig = Math.sin((t - x.wig) * 30) * 5 * hit(t, x.wig, 0.6) + jit * 0.4;
  const hop = jit;
  const seam = clamp(0.15 + ease.in(ramp(t, x.wig, x.snap)) * 0.75 + RAT.reduce((a, b, i) => a + hit(t, b, 0.3) * (0.2 + i * 0.05), 0));
  const snap = ramp(t, x.snap, x.snap + 0.3);
  const lidK = ease.out(ramp(t, x.snap + 0.02, x.snap + 0.5));
  const open = ramp(t, x.snap + 0.02, x.snap + 0.17);
  const boxOut = ease.in(ramp(t, x.boxOut - 0.05, x.boxOut + 0.4));
  // ── file
  const rise = ease.out(ramp(t, x.snap + 0.04, x.nfp - 0.02));
  const slamN = hit(t, x.nfp, 0.3);
  const toTop = ease.io(ramp(t, x.up - 0.05, x.up + 0.5));
  const toLock = ease.io(ramp(t, x.wth - 0.08, x.cl + 0.3));
  const fileCx = lerp(540, 300, toLock);
  const BS = lerp(1.16, 1.32, ease.io(ramp(t, land, x.snap))), BY = 1070; // box world: slow push-in around (540, 1010), bottom at y 1070
  const rawCy = lerp(900, 470, rise), rawS = lerp(0.72, 1, rise) * (1 + slamN * 0.08);
  const fileCy = lerp(lerp(BY + (rawCy - 1010) * BS, 318, toTop), 410, toLock);
  const fileS = lerp(lerp(rawS * BS, 0.66, toTop), 0.78, toLock) * (toTop > 0 ? 1 + slamN * 0.08 : 1);
  const bob = Math.sin(t * 2.4) * 8 * rise;
  const freeFile = t >= x.nfp - 0.02;
  // ── subscriptions
  const head = ease.out(ramp(t, x.up + 0.1, x.up + 0.45));
  const cardK = (i: number) => ease.out(ramp(t, x.up + 0.12 + i * 0.16, x.up + 0.5 + i * 0.16));
  const load = (i: number) => ramp(t, x.up + 0.3 + i * 0.16, x.up + 0.31 + i * 0.16);
  const strike = (i: number) => ramp(t, x.no - 0.04 + i * 0.1, x.no + 0.3 + i * 0.1);
  const off = (i: number) => ease.io(ramp(t, x.no + 0.28 + i * 0.1, x.no + 0.45 + i * 0.1));
  const subsOut = (i: number) => ease.in(ramp(t, x.wth - 0.12 + i * 0.07, x.wth + 0.3 + i * 0.07));
  const pulseIn = (i: number) => hit(t, [x.hf, x.gf][i], 0.3);
  const stamp = slam(t, x.no + 0.14, 0.2);
  // ── claude + long video
  const kCl = Math.min(1.12, ease.back(ramp(t, x.cl - 0.12, x.cl + 0.3)));
  const kTl = ease.out(ramp(t, x.vid - 0.2, x.vid + 0.3));
  const zoom = ease.io(ramp(t, x.vid, x.long + 0.22));
  const D = lerp(15, 624, zoom);
  const lngSlam = hit(t, x.long + 0.22, 0.3);
  // ── editor push
  const up = ease.in(ramp(t, x.self - 0.25, x.self + 0.12));
  const edK = ease.out(ramp(t, x.self - 0.15, x.self + 0.35));
  const exit = ease.in(ramp(t, 62.72, 63.05));
  return (
    <Full>
      {/* everything before the editor */}
      {up < 1 && (
        <Full style={{ transform: `translateY(${-up * 1400}px)` }}>
          <Full style={{ transform: `translate(0px, ${BY - 1010}px) scale(${BS})`, transformOrigin: "540px 1010px", overflow: "visible" }}>
          {/* rays */}
          {open > 0 && boxOut < 1 && (
            <>
              <div style={{ position: "absolute", left: 540 - 520, top: 660 - 520, width: 1040, height: 1040, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,170,110,.38) 0%, rgba(255,140,80,.12) 35%, rgba(255,140,80,0) 62%)", transform: `scale(${ease.out(open)})`, opacity: 1 - boxOut }} />
              <div style={{ position: "absolute", left: 540 - 190, top: 660 - 900, width: 380, height: 900, background: "linear-gradient(0deg, rgba(255,190,140,.55) 0%, rgba(255,170,110,.18) 45%, rgba(255,170,110,0) 100%)", WebkitMaskImage: "linear-gradient(90deg, transparent, black 30%, black 70%, transparent)", maskImage: "linear-gradient(90deg, transparent, black 30%, black 70%, transparent)", transform: `scaleY(${ease.out(open)})`, transformOrigin: "50% 100%", opacity: (1 - boxOut) * (0.75 + 0.25 * Math.sin(t * 7)) }} />
              <div style={{ position: "absolute", left: 540, top: 660 }}>
                <Ring k={ramp(t, x.snap, x.snap + 0.55)} r0={120} r1={520} c={C.green} w={4} />
                <Ring k={ramp(t, x.snap + 0.1, x.snap + 0.7)} r0={120} r1={640} c="rgba(242,92,31,.6)" w={2} />
              </div>
            </>
          )}
          {/* box group */}
          {t >= x.drop && boxOut < 1 && (
            <>
              <div style={{ position: "absolute", left: 540 - 270 * lerp(0.4, 1, ease.in(fall)), top: 990, width: 540 * lerp(0.4, 1, ease.in(fall)), height: 52, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(30,25,20,.35), rgba(30,25,20,0) 70%)", opacity: (1 - boxOut) * lerp(0.3, 1, fall) }} />
              {/* dust puff on landing */}
              {t > land && t < land + 0.6 && Array.from({ length: 10 }, (_, i) => {
                const k = (t - land) / 0.6, sd = i < 5 ? -1 : 1;
                return <div key={i} style={{ position: "absolute", left: 540 + sd * (200 + k * (60 + rnd(i) * 140)), top: 1000 - k * (20 + rnd(i * 3) * 50), width: 14 + rnd(i * 5) * 16, height: 14 + rnd(i * 5) * 16, borderRadius: "50%", background: "rgba(160,150,135,.35)", opacity: 1 - k, transform: `scale(${0.6 + k})` }} />;
              })}
              <Full style={{ transform: `translateY(${by + hop + boxOut * 1100}px) rotate(${wig}deg) scale(${1 + squash * 0.6}, ${1 - squash})`, transformOrigin: "540px 1010px", opacity: 1 - boxOut * 0.3 }}>
                {open > 0 && (
                  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
                    <path d="M320 682 L760 682 L728 646 L352 646 Z" fill="#0A0A0C" opacity={open} />
                    <path d="M352 646 L728 646 L760 682 L320 682 Z" fill="url(#inG)" opacity={open} />
                    <defs><linearGradient id="inG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF7A3D" stopOpacity={0.55} /><stop offset="1" stopColor="#FF7A3D" stopOpacity={0} /></linearGradient></defs>
                  </svg>
                )}
                {/* the file rises from inside */}
                {rise > 0 && !freeFile && (
                  <div style={{ position: "absolute", left: 540 - 150, top: rawCy - 190 + bob - (by + hop), transform: `scale(${rawS})`, transformOrigin: "50% 50%" }}>
                    <NfpFile t={t} glow={1} />
                  </div>
                )}
                <GiftBox t={t} seam={seam} lidK={lidK} open={open} snap={snap} lidY={lidY} lidR={lidR} />
              </Full>
            </>
          )}
          {/* sparkle glints around the box */}
          {t > x.wig && t < x.snap + 0.2 &&
            Array.from({ length: 9 }, (_, i) => {
              const tt = x.wig + i * 0.24;
              const k = ramp(t, tt, tt + 0.9);
              if (k <= 0 || k >= 1) return null;
              const a = rnd(i * 3 + 1) * Math.PI * 2;
              const r = 300 + rnd(i) * 130;
              return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * r - 20, top: 800 + Math.sin(a) * r * 0.75 - 20 }}><Glint s={34 + rnd(i * 7) * 34} c={i % 3 ? C.green : C.ink} o={Math.sin(k * Math.PI)} rot={k * 90} /></div>;
            })}
          </Full>
          {/* bonus title above the box */}
          {(() => {
            const k = ease.out(ramp(t, x.drop + 0.12, x.drop + 0.55)) * (1 - ease.in(ramp(t, x.snap - 0.2, x.snap + 0.1)));
            if (k <= 0) return null;
            return (
              <div style={{ position: "absolute", left: 0, right: 0, top: 236, display: "flex", flexDirection: "column", alignItems: "center", opacity: k, transform: `translateY(${(1 - k) * -30}px) scale(${1 + hit(t, x.wig, 0.3) * 0.07})` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 60 * k, height: 2, background: C.green }} />
                  <span style={mono(22, C.green, 7)}>BONUS · GIFT</span>
                  <div style={{ width: 60 * k, height: 2, background: C.green }} />
                </div>
                <span style={{ ...fa(88, 900, C.ink), marginTop: 6 }}>هدیه‌ی دوره</span>
              </div>
            );
          })()}
          {/* file (free, after the box) */}
          {freeFile && (
            <div style={{ position: "absolute", left: fileCx - 150, top: fileCy - 190 + bob * (1 - toLock), transform: `scale(${fileS})`, zIndex: 3 }}>
              <NfpFile t={t} glow={1 - toTop * 0.6} />
            </div>
          )}
          {/* slam ring + chips on NFP */}
          {t > x.nfp && t < x.up + 0.3 && (
            <>
              <div style={{ position: "absolute", left: 540, top: 395 }}>
                <Ring k={ramp(t, x.nfp, x.nfp + 0.6)} r0={200} r1={420} c={C.green} w={6} />
                <Ring k={ramp(t, x.nfp + 0.12, x.nfp + 0.75)} r0={200} r1={520} c={C.green} w={3} />
              </div>
              {[
                { l: STYLES20, x: 850, y: 190, d: 0.05, dark: true },
                { l: "Claude Skill", x: 235, y: 560, d: 0.15, dark: false },
              ].map((c, i) => {
                const k = ease.back(ramp(t, x.nfp + c.d, x.nfp + c.d + 0.35)) * (1 - ease.in(ramp(t, x.up - 0.1, x.up + 0.2)));
                if (k <= 0) return null;
                return (
                  <div key={i} style={{ position: "absolute", left: c.x, top: c.y + Math.sin(t * 3 + i) * 8, transform: `translate(-50%,-50%) scale(${k})`, padding: "14px 24px", borderRadius: 999, background: c.dark ? C.ink : "#fff", boxShadow: SHADOW, ...(c.dark ? fa(36, 800, "#fff") : inter(34, 700, C.ink)) }}>{c.l}</div>
                );
              })}
            </>
          )}
          {/* subscriptions */}
          {head > 0 && subsOut(1) < 1 && (
            <div style={{ position: "absolute", left: 70, right: 70, top: 492, display: "flex", alignItems: "center", gap: 16, direction: "rtl", opacity: head * (1 - subsOut(0)), transform: `translateY(${(1 - head) * 20}px)` }}>
              <span style={{ ...fa(40, 900, hit(t, x.subs, 0.35) > 0.4 ? C.green : C.ink), display: "inline-block", transform: `scale(${1 + hit(t, x.subs, 0.35) * 0.1})`, transformOrigin: "100% 50%" }}>اشتراک‌های ماهانه</span>
              <div style={{ flex: 1, height: 2, background: `repeating-linear-gradient(90deg, ${C.ink3} 0 10px, transparent 10px 18px)` }} />
              <span style={mono(18, C.ink3, 3)}>/ MONTH</span>
            </div>
          )}
          {[0, 1].map((i) => {
            const k = cardK(i);
            if (k <= 0 || subsOut(i) >= 1) return null;
            const o = subsOut(i);
            return (
              <div key={i} style={{ position: "absolute", left: 70, top: 570 + i * 320, transform: `translateX(${(1 - k) * 900}px) translateY(${o * 1300 + Math.sin(t * 2.2 + i * 1.7) * 5}px) rotate(${(i ? 7 : -6) * o + (1 - k) * 4}deg) scale(${1 + pulseIn(i) * 0.03})` }}>
                {/* recurring monthly charge ticks (no prices) */}
                {t >= x.money && t < x.no + 0.2 && Array.from({ length: 5 }, (_, n) => {
                  const t0 = x.money + i * 0.27 + n * 0.55;
                  const kk = ramp(t, t0, t0 + 0.9);
                  if (kk <= 0 || kk >= 1) return null;
                  return (
                    <div key={n} style={{ position: "absolute", right: 40 + (n % 2) * 120, top: 6 - ease.out(kk) * 62, zIndex: 2, opacity: Math.sin(kk * Math.PI) * 1.4, transform: `scale(${Math.min(1, ease.back(clamp(kk * 4)))})`, display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", borderRadius: 999, background: "#fff", border: `2px solid ${C.red}`, boxShadow: "0 8px 20px rgba(200,16,46,.18)", direction: "rtl" }}>
                      <span style={fa(28, 800, C.red)}>هر ماه</span>
                      <span style={inter(30, 800, C.red)}>−$</span>
                    </div>
                  );
                })}
                <SubCard name={["Higgsfield", "Google Flow"][i]} plan={["Pro plan · renews Nov 10", "AI Ultra · renews Nov 10"][i]} card={["4821", "4821"][i]} credits={[0.87, 0.64][i]} t={t} k={k} strike={strike(i)} off={off(i)} load={load(i)} />
              </div>
            );
          })}
          {stamp.o > 0 && subsOut(1) < 1 && (
            <div style={{ position: "absolute", left: 540, top: 875, transform: `translate(-50%,-50%) translateY(${subsOut(1) * 1300}px) rotate(-2deg) scale(${stamp.s})`, opacity: stamp.o }}>
              <div style={{ padding: "16px 46px 20px", borderRadius: 22, border: `9px solid ${C.red}`, background: "rgba(255,255,255,.94)", boxShadow: "0 12px 30px rgba(120,0,20,.16)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={fa(96, 900, C.red)}>لازم نیست</span>
                <span style={{ ...mono(18, C.red, 6), marginTop: -4 }}>NOT NEEDED</span>
              </div>
            </div>
          )}
          {/* NFP + Claude lockup */}
          {kCl > 0 && (
            <>
              <div style={{ position: "absolute", left: 540, top: 410, transform: `translate(-50%,-50%) scale(${kCl})`, fontFamily: UI, fontWeight: 200, fontSize: 110, color: C.ink3, lineHeight: 1 }}>+</div>
              <div style={{ position: "absolute", left: 790 - 150, top: 410 - 160 + Math.sin(t * 2.4 + 1) * 8, width: 300, height: 320, borderRadius: 44, background: "#fff", boxShadow: SHADOW, transform: `scale(${kCl})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
                <div style={{ transform: `rotate(${t * 20}deg)` }}><ClaudeMark s={150} /></div>
                <span style={{ fontFamily: NUM, fontWeight: 700, fontSize: 54, color: C.ink, letterSpacing: -1 }}>Claude</span>
              </div>
              {/* data flow dots between file and Claude */}
              {Array.from({ length: 4 }, (_, i) => {
                const k = ((t * 0.9 + i / 4) % 1);
                return <div key={i} style={{ position: "absolute", left: lerp(430, 650, k) - 5, top: 560 + Math.sin(k * Math.PI) * -26 - 5, width: 10, height: 10, borderRadius: 5, background: C.green, opacity: Math.sin(k * Math.PI) * kCl }} />;
              })}
            </>
          )}
          {/* long video timeline */}
          {kTl > 0 && (
            <div style={{ position: "absolute", left: 40, top: 680, width: 1000, height: 500, borderRadius: 32, background: "#141418", boxShadow: "0 40px 100px rgba(10,10,20,.32)", transform: `translateY(${(1 - kTl) * 700}px)`, padding: "28px 30px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 92 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 16, transform: `scale(${1 + lngSlam * 0.12})`, transformOrigin: "0 70%" }}>
                  <span style={{ fontFamily: NUM, fontWeight: 700, fontSize: 84, color: D > 600 ? C.neon : "#fff", letterSpacing: -2, lineHeight: 1 }}>{mss(D)}</span>
                  <span style={mono(18, "rgba(255,255,255,.45)", 3)}>DURATION</span>
                </div>
                {t > x.long - 0.05 && (
                  <div style={{ transform: `scale(${ease.back(ramp(t, x.long - 0.05, x.long + 0.25))})`, padding: "12px 24px", borderRadius: 999, background: C.green, ...fa(34, 900, "#fff") }}>ویدیوی بلند</div>
                )}
              </div>
              <div style={{ marginTop: 24 }}>
                <LongTimeline t={t} D={D} W={940} play={clamp((t - x.vid) * 0.07 + 0.02)} />
              </div>
              {t > x.make && (
                <div style={{ position: "absolute", left: 30, bottom: -82, display: "flex", alignItems: "center", gap: 12, padding: "12px 22px", borderRadius: 999, background: "#fff", boxShadow: SHADOW, transform: `scale(${ease.back(ramp(t, x.make, x.make + 0.3))})`, transformOrigin: "0 50%" }}>
                  <CheckDot s={30} k={ramp(t, x.make + 0.05, x.make + 0.3)} c={C.green} />
                  <span style={inter(24, 700, C.ink)}>Render complete · 10:24 · 1080p</span>
                </div>
              )}
            </div>
          )}
        </Full>
      )}
      {/* the editor: this very reel */}
      {edK > 0 && (
        <Full style={{ transform: `translateY(${(1 - edK) * 1400 + exit * 1500}px) rotate(${exit * 6}deg)`, transformOrigin: "50% 100%" }}>
          <Editor t={t} self={self} />
        </Full>
      )}
    </Full>
  );
};
