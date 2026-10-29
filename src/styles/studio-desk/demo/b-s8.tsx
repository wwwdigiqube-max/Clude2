// Video 23 · S8 (62.8 – 79.45), light desk: 4-step plan → the user's real 11M-view English reel on Instagram → download → whip into a
// claude.ai chat (attach, type, send) → Claude + NFP works through a checklist → before/after phones → a timeline that
// edits itself while «من: هیچ کاری».
import React from "react";
import { Img } from "remotion";
import { CREAM, Echo, Tune, typedW, CheckDot, ClaudeMark, Cursor, Device, Full, IgReelUI, Spinner, TERRA, Wave, slam } from "./b-kit";
import { C, FA, MONO, NUM, S, SHADOW, UI, clamp, ease, grp, hit, lerp, ramp, v23 } from "./lib";
import { Clip, Ico } from "./ui";

type P = React.CSSProperties;
const mono = (s: number, c: string, ls = 2): P => ({ fontFamily: MONO, fontWeight: 600, fontSize: s, letterSpacing: ls, color: c, direction: "ltr", whiteSpace: "nowrap", lineHeight: 1 });
const inter = (s: number, w: number, c: string): P => ({ fontFamily: UI, fontSize: s, fontWeight: w, color: c, direction: "ltr", whiteSpace: "nowrap", lineHeight: 1.15 });
const fa = (s: number, w: number, c: string): P => ({ fontFamily: FA, fontSize: s, fontWeight: w, color: c, direction: "rtl", whiteSpace: "nowrap", lineHeight: 1.35, wordSpacing: "0.2em" });
type R4 = { x: number; y: number; w: number; h: number };

// the real viral reel (EN) and its Persian NFP remake (frame-matched for the first 16 s).
// FA_READY = false → the FA phone temporarily shows viral-en.mp4 until viral-fa.mp4 is rendered.
const FA_READY = true;
const EN_SRC = "viral-en.mp4";
const FA_SRC = FA_READY ? "viral-fa.mp4" : "viral-en.mp4";
const VIEWS = 11; // millions (real count, from the Instagram «Likes and views» sheet)
const BA_FROM = 5.0; // before/after moment: the moon (same frame in both versions)
const lr = (a: R4, b: R4, k: number): R4 => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), w: lerp(a.w, b.w, k), h: lerp(a.h, b.h, k) });

const T8 = () => ({
  show: S(180), easy: S(183), dock: S(184) - 0.32, src: S(184), ig: S(188), m12: S(189), mil: S(190), view: S(191), dl: S(193), dl2: S(194),
  send: S(195), to: S(196), cl: S(197), now: S(198), cl2: S(199), nfp: S(201), same: S(202), vid: S(203), lang: S(206), fa: S(207), make: S(209),
  and: S(210), me: S(213), work: S(214), self: S(216), ed: S(220), end: S(221),
});

// ── the 4 steps (hero list → docked bar)
const STEPS: { fa?: string; en?: string; ico: string; auto: boolean }[] = [
  { fa: "دانلود", ico: "download", auto: false },
  { en: "Claude + NFP", ico: "claude", auto: false },
  { fa: "نسخه‌ی فارسی", ico: "type", auto: true },
  { fa: "ادیت خودکار", ico: "wand", auto: true },
];
const Stepper: React.FC<{ t: number }> = ({ t }) => {
  const x = T8();
  const dock = ease.io(ramp(t, x.dock, x.dock + 0.45));
  const active = t < x.dl ? -1 : t < x.send ? 0 : t < x.make ? 1 : t < x.and ? 2 : 3;
  const sweep = ramp(t, x.easy - 0.05, x.easy + 0.55);
  const titleK = ease.out(ramp(t, 62.95, 63.35)) * (1 - ease.in(ramp(t, x.dock - 0.1, x.dock + 0.2)));
  return (
    <>
      {titleK > 0 && (
        <div style={{ position: "absolute", left: 90, right: 90, top: 250, display: "flex", flexDirection: "column", alignItems: "flex-end", opacity: titleK, transform: `translateY(${(1 - titleK) * -30}px) scale(${1 + hit(t, x.easy, 0.3) * 0.06})`, transformOrigin: "100% 50%" }}>
          <span style={mono(22, C.green, 6)}>HOW IT WORKS</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18, direction: "rtl", marginTop: 6 }}>
            <span style={fa(92, 900, C.ink)}>فقط</span>
            <span style={{ fontFamily: NUM, fontWeight: 700, fontSize: 104, color: C.green, lineHeight: 1 }}>4</span>
            <span style={fa(92, 900, C.ink)}>قدم</span>
          </div>
        </div>
      )}
      {/* connector behind the docked chips */}
      {dock > 0 && <div style={{ position: "absolute", left: 60, top: 205, width: 960 * dock, height: 2, background: `repeating-linear-gradient(90deg, ${C.ink3} 0 8px, transparent 8px 14px)`, opacity: 0.6 }} />}
      {STEPS.map((s, i) => {
        const k = ease.back(ramp(t, 63.1 + i * 0.17, 63.5 + i * 0.17));
        if (k <= 0) return null;
        const hero: R4 = { x: 90, y: 470 + i * 176, w: 900, h: 150 };
        const chip: R4 = { x: 40 + (3 - i) * 254, y: 168, w: 238, h: 76 };
        const r = lr(hero, chip, dock);
        const on = active === i, done = active > i;
        const heroO = 1 - clamp(dock * 2), chipO = clamp(dock * 2 - 1);
        const sw = sweep > 0 && sweep < 1 ? clamp(1 - Math.abs(sweep * 4 - i) * 0.9) : 0;
        return (
          <div key={i} style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: lerp(30, 38, dock), background: on ? C.ink : "#fff", boxShadow: on ? "0 18px 40px rgba(20,20,30,.28)" : SHADOW, transform: `scale(${Math.min(1, k) * (1 + sw * 0.03) * (on ? 1 + hit(t, [x.dl, x.send, x.make, x.and][i], 0.3) * 0.12 : 1)})`, opacity: Math.min(1, k * 2), overflow: "hidden" }}>
            {heroO > 0 && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 28, padding: "0 34px", direction: "rtl", opacity: heroO }}>
                <span style={{ fontFamily: NUM, fontWeight: 700, fontSize: 56, color: C.green, width: 76, textAlign: "center", lineHeight: 1 }}>{`0${i + 1}`}</span>
                <div style={{ width: 84, height: 84, borderRadius: 22, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {s.ico === "claude" ? <ClaudeMark s={50} /> : <Ico n={s.ico} s={44} c="#fff" w={2.2} />}
                </div>
                {s.fa ? <span style={fa(54, 900, C.ink)}>{s.fa}</span> : <span style={inter(50, 800, C.ink)}>{s.en}</span>}
                <div style={{ flex: 1 }} />
                <span style={{ padding: "10px 18px", borderRadius: 999, background: s.auto ? "rgba(242,92,31,.12)" : "#F2F0EA", ...(s.auto ? fa(28, 800, C.green) : fa(28, 800, C.ink2)) }}>{s.auto ? "خودکار" : "کار شما"}</span>
                {sw > 0 && <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, rgba(242,92,31,0), rgba(242,92,31,${0.16 * sw}), rgba(242,92,31,0))` }} />}
              </div>
            )}
            {chipO > 0 && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 12, padding: "0 16px", direction: "rtl", opacity: chipO }}>
                <div style={{ width: 42, height: 42, borderRadius: 21, flex: "none", background: done ? C.green : on ? C.neon : "#ECEAE3", display: "flex", alignItems: "center", justifyContent: "center", ...inter(20, 800, on ? C.ink : C.ink2) }}>
                  {done ? <Ico n="check" s={22} c="#fff" w={3.4} /> : i + 1}
                </div>
                {s.fa ? <span style={fa(27, 800, on ? "#fff" : C.ink)}>{s.fa}</span> : <span style={inter(24, 800, on ? "#fff" : C.ink)}>{s.en}</span>}
                {on && <div style={{ position: "absolute", left: 16, right: 16, bottom: 8, height: 3, borderRadius: 2, background: "rgba(255,255,255,.15)" }}><div style={{ width: `${((t * 0.8) % 1) * 100}%`, height: "100%", background: C.neon, borderRadius: 2, marginLeft: "auto" }} /></div>}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

// ── phone with the real English reel + 11M views proof + stats column + download
const SrcPhone: React.FC<{ t: number }> = ({ t }) => {
  const x = T8();
  const inK = ease.out(ramp(t, x.dock + 0.1, x.src + 0.35));
  const dl = ease.io(ramp(t, x.dl, x.dl2 + 0.3));
  const dlOn = t >= x.dl;
  const w = 470;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - inK) * 1000}px) rotate(${(1 - inK) * 6}deg)`, transformOrigin: "275px 1250px" }}>
      <Device x={50} y={282} w={w}>
        <Clip src={EN_SRC} t0={x.dock} from={0} dur={14} />
        <IgReelUI sw={w * 0.936} t={t} likes="" comments="" shares="" user="your.page" caption="Tomorrow is 10/10/10." heartT={x.ig + 0.1} />
        {/* views pill on the reel */}
        {t >= x.m12 && (
          <div style={{ position: "absolute", left: 16, top: 104, transform: `scale(${ease.back(ramp(t, x.m12, x.m12 + 0.3))})`, transformOrigin: "0 50%", display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, background: "rgba(0,0,0,.55)" }}>
            <Ico n="play" s={18} c="#fff" fill />
            <span style={inter(19, 700, "#fff")}>{t < x.view ? `${(lerp(0, VIEWS, ease.out(ramp(t, x.m12, x.view))).toFixed(1))}M` : `${VIEWS}M`}</span>
          </div>
        )}
        {/* real views proof: Instagram «Likes and views» sheet slides up */}
        {(() => {
          const k = ease.out(ramp(t, x.m12 - 0.12, x.m12 + 0.25)) * (1 - ease.in(ramp(t, x.dl - 0.22, x.dl + 0.04)));
          if (k <= 0) return null;
          const sw = w * 0.936, sh = (sw * 200) / 590, u = sw / 590;
          const hl = ease.out(ramp(t, x.view - 0.06, x.view + 0.28));
          return (
            <>
              <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${0.5 * k})` }} />
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: sh + 64, borderRadius: `${22 * u}px ${22 * u}px 0 0`, overflow: "hidden", background: "#171A1C", transform: `translateY(${(1 - k) * (sh + 90)}px)`, boxShadow: "0 -10px 30px rgba(0,0,0,.4)" }}>
                <Img src={v23("b/views-11m.png")} style={{ width: sw, height: sh, display: "block", maxWidth: "none" }} />
                <div style={{ position: "absolute", left: 22 * u, right: 22 * u, top: sh + 6, height: 1, background: "rgba(255,255,255,.08)" }} />
                {hl > 0 && <div style={{ position: "absolute", left: 238 * u, top: 80 * u, width: 118 * u, height: 42 * u, borderRadius: 12 * u, border: `${3 * u + 1}px solid ${C.neon}`, boxShadow: `0 0 ${18 * hl}px ${C.neon}`, opacity: hl, transform: `scale(${lerp(1.5, 1, hl) + hit(t, x.view + 0.3, 0.3) * 0.08})` }} />}
              </div>
            </>
          );
        })()}
        {/* download overlay */}
        {dlOn && (
          <Full style={{ background: `rgba(0,0,0,${0.5 * (1 - ramp(t, x.dl2 + 0.35, x.dl2 + 0.6))})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "relative", width: 170, height: 170, opacity: 1 - ramp(t, x.dl2 + 0.35, x.dl2 + 0.6), transform: `scale(${ease.back(ramp(t, x.dl, x.dl + 0.3))})` }}>
              <svg width={170} height={170} style={{ position: "absolute", inset: 0 }}>
                <circle cx={85} cy={85} r={72} stroke="rgba(255,255,255,.25)" strokeWidth={10} fill="none" />
                <circle cx={85} cy={85} r={72} stroke={C.neon} strokeWidth={10} fill="none" strokeDasharray={`${dl * 452} 452`} transform="rotate(-90 85 85)" strokeLinecap="round" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                {dl < 1 ? <Ico n="download" s={46} c="#fff" w={2.6} style={{ transform: `translateY(${Math.sin(t * 12) * 3}px)` }} /> : <CheckDot s={56} k={ramp(t, x.dl2 + 0.3, x.dl2 + 0.45)} c={C.neon} />}
                <span style={inter(24, 800, "#fff")}>{`${Math.round(dl * 100)}%`}</span>
              </div>
            </div>
          </Full>
        )}
      </Device>
    </div>
  );
};
const Stats: React.FC<{ t: number }> = ({ t }) => {
  const x = T8();
  const igK = ease.out(ramp(t, x.ig - 0.1, x.ig + 0.3));
  const big = slam(t, x.m12, 0.2);
  const cnt = ease.out(ramp(t, x.m12, x.view + 0.1));
  const proof = ease.out(ramp(t, x.m12 + 0.25, x.m12 + 0.65));
  const proofO = 1 - ease.in(ramp(t, x.dl - 0.15, x.dl + 0.1));
  const hl = ease.out(ramp(t, x.view - 0.06, x.view + 0.28));
  const card = ease.out(ramp(t, x.dl - 0.05, x.dl + 0.3));
  const prog = ease.io(ramp(t, x.dl, x.dl2 + 0.3));
  const fly = ramp(t, x.send - 0.02, x.cl - 0.05);
  return (
    <div style={{ position: "absolute", left: 565, top: 300, width: 470 }}>
      {igK > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: igK, transform: `translateX(${(1 - igK) * 40}px)` }}>
          <div style={{ width: 16, height: 16, borderRadius: 8, background: C.ig }} />
          <span style={inter(28, 800, C.ink)}>Instagram</span>
          <span style={inter(28, 500, C.ink3)}>· Reels</span>
        </div>
      )}
      {big.o > 0 && (
        <div style={{ marginTop: 26, transform: `scale(${big.s}) translateX(${big.sh * Math.sin(t * 80) * 5}px)`, transformOrigin: "0% 60%", opacity: big.o }}>
          <div style={{ fontFamily: NUM, fontWeight: 700, fontSize: 196, lineHeight: 0.9, color: C.ink, letterSpacing: -6 }}>{`${VIEWS}M`}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14 }}>
            <Ico n="eye" s={34} c={C.green} w={2.2} />
            <span style={inter(38, 700, C.ink)}>{grp(cnt * VIEWS * 1e6)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
            <span style={fa(40, 900, C.green)}>ویو</span>
            <span style={inter(24, 500, C.ink3)}>views</span>
          </div>
        </div>
      )}
      {/* real views proof, magnified (the same Instagram sheet that slides up on the phone) */}
      {proof > 0 && proofO > 0 && (
        <div style={{ position: "absolute", left: 0, top: 440, width: 470, opacity: proofO, transform: `translateY(${(1 - proof) * 40}px) scale(${lerp(0.92, 1, proof)})`, transformOrigin: "0% 50%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, direction: "rtl", marginBottom: 12 }}>
            <span style={fa(30, 900, C.ink)}>اسکرین‌شات واقعی</span>
            <div style={{ flex: 1, height: 2, background: `repeating-linear-gradient(90deg, ${C.ink3} 0 8px, transparent 8px 14px)` }} />
            <span style={mono(15, C.green, 3)}>PROOF</span>
          </div>
          <div style={{ position: "relative", width: 470, height: (470 * 200) / 590, borderRadius: 22, overflow: "hidden", boxShadow: "0 30px 70px rgba(20,20,30,.28), 0 0 0 1px rgba(0,0,0,.25)" }}>
            <Img src={v23("b/views-11m.png")} style={{ width: 470, height: (470 * 200) / 590, display: "block", maxWidth: "none" }} />
            {hl > 0 && <div style={{ position: "absolute", left: 238 * 0.797, top: 80 * 0.797, width: 118 * 0.797, height: 42 * 0.797, borderRadius: 10, border: `3px solid ${C.neon}`, boxShadow: `0 0 ${16 * hl}px ${C.neon}`, opacity: hl, transform: `scale(${lerp(1.6, 1, hl) + hit(t, x.view + 0.3, 0.3) * 0.1})` }} />}
            {/* glass glint */}
            {proof > 0 && proof < 1 && <div style={{ position: "absolute", top: -40, bottom: -40, left: lerp(-200, 560, proof), width: 90, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.18), rgba(255,255,255,0))", transform: "rotate(14deg)" }} />}
          </div>
        </div>
      )}
      {/* download card */}
      {card > 0 && (
        <div style={{ position: "absolute", left: 0, top: 500, width: 470, height: 190, borderRadius: 26, background: "#fff", boxShadow: SHADOW, padding: "26px 26px", transform: `translateY(${(1 - card) * 60}px)`, opacity: card * (1 - ease.in(ramp(t, x.send + 0.15, x.send + 0.35))) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 74, height: 74, borderRadius: 18, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico n="film" s={40} c="#fff" w={1.8} /></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={inter(32, 800, C.ink)}>reel.mp4</span>
              <span style={inter(21, 500, C.ink3)}>{`${(prog * 13.2).toFixed(1)} / 13.2 MB · 0:24`}</span>
            </div>
          </div>
          <div style={{ marginTop: 24, height: 12, borderRadius: 6, background: "#ECEAE3", overflow: "hidden" }}><div style={{ width: `${prog * 100}%`, height: "100%", background: C.green, borderRadius: 6 }} /></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <span style={inter(19, 600, C.ink3)}>{prog < 1 ? "Downloading…" : "Saved to Downloads"}</span>
            <span style={inter(19, 800, prog < 1 ? C.ink2 : C.green)}>{`${Math.round(prog * 100)}%`}</span>
          </div>
        </div>
      )}
      <span style={{ display: "none" }}>{fly}</span>
    </div>
  );
};

// ── the claude.ai chat
const PROMPT = "این ویدیو رو با NFP فارسی بساز";
const CHECKS = (x: ReturnType<typeof T8>) => [
  { txt: "متن فارسی", sub: "script.fa.json · 8 lines", done: x.nfp },
  { txt: "صدای فارسی", sub: "voice.fa.wav · 0:24", done: x.vid },
  { txt: "انیمیشن با همون سبک", sub: "cosmic-minimal · 9 scenes", done: x.lang },
  { txt: "رندر نهایی", sub: "1080×1920 · H.264", done: x.fa + 0.16 },
];
const Attach: React.FC<{ t: number; s?: number }> = ({ t, s = 1 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 * s, padding: `${10 * s}px ${18 * s}px ${10 * s}px ${10 * s}px`, borderRadius: 16 * s, background: "#fff", border: "1px solid #E4E1D8", boxShadow: "0 2px 8px rgba(0,0,0,.05)", width: "fit-content" }}>
    <div style={{ position: "relative", width: 64 * s, height: 64 * s, borderRadius: 10 * s, overflow: "hidden", background: "#2a8a7c" }}>
      <Img src={v23("b/ven-thumb.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", maxWidth: "none" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico n="play" s={24 * s} c="#fff" fill /></div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 4 * s }}>
      <span style={inter(23 * s, 700, C.ink)}>reel.mp4</span>
      <span style={inter(17 * s, 500, C.ink3)}>MP4 · 13.2 MB</span>
    </div>
  </div>
);
const Chat: React.FC<{ t: number }> = ({ t }) => {
  const x = T8();
  const attached = t >= x.cl - 0.08;
  const ty = ramp(t, x.cl + 0.02, x.now + 0.12);
  const sendT = x.now + 0.2;
  const sent = t >= sendT;
  const sentK = ease.out(ramp(t, sendT, sendT + 0.3));
  const replyT = sendT + 0.3;
  const checks = CHECKS(x);
  const outK = ease.back(ramp(t, x.fa + 0.25, x.fa + 0.55));
  const W = 1000, H = 978;
  return (
    <div style={{ position: "absolute", left: 40, top: 282, width: W, height: H, borderRadius: 32, background: CREAM, boxShadow: "0 40px 100px rgba(20,20,30,.22), 0 0 0 1px rgba(0,0,0,.05)", overflow: "hidden" }}>
      {/* top bar */}
      <div style={{ height: 78, display: "flex", alignItems: "center", gap: 16, padding: "0 26px", borderBottom: "1px solid #ECE9E0" }}>
        <svg width={30} height={30} viewBox="0 0 24 24"><rect x={3} y={4} width={18} height={16} rx={3} stroke={C.ink2} strokeWidth={1.8} fill="none" /><line x1={9} y1={4} x2={9} y2={20} stroke={C.ink2} strokeWidth={1.8} /></svg>
        <span style={inter(24, 600, C.ink)}>{sent ? "10/10/10 reel → Persian" : "New chat"}</span>
        <svg width={16} height={16} viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke={C.ink3} strokeWidth={2.4} fill="none" /></svg>
        <div style={{ flex: 1 }} />
        <span style={{ padding: "9px 20px", borderRadius: 12, border: "1px solid #DDD9CE", ...inter(20, 600, C.ink) }}>Share</span>
      </div>
      {/* empty state */}
      {sentK < 1 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, opacity: 1 - sentK }}>
          <div style={{ transform: `rotate(${t * 25}deg)` }}><ClaudeMark s={74} /></div>
          <span style={{ fontFamily: NUM, fontWeight: 400, fontSize: 50, color: C.ink, letterSpacing: -0.5 }}>How can I help you today?</span>
          <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
            {[["type", "Write"], ["sparkle", "Learn"], ["layers", "Code"], ["star", "Life stuff"]].map(([ic, l], i) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 18px", borderRadius: 14, border: "1px solid #E3DFD4", background: "#fff", transform: `translateY(${Math.sin(t * 2 + i) * 2}px)` }}>
                <Ico n={ic} s={20} c={C.ink2} w={2} />
                <span style={inter(20, 600, C.ink2)}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* thread */}
      {sent && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 79, bottom: 128, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 34, right: 34, top: 26, transform: `translateY(${-150 * ease.io(ramp(t, x.fa + 0.15, x.fa + 0.5))}px)` }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, transform: `translateY(${(1 - sentK) * 300}px)`, opacity: sentK }}>
            <Attach t={t} s={1.05} />
            <div style={{ padding: "16px 28px", borderRadius: 24, background: "#EFECE3", ...fa(38, 700, C.ink) }}>{PROMPT}</div>
          </div>
          {t >= replyT && (
            <div style={{ marginTop: 22, direction: "rtl" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: ramp(t, replyT, replyT + 0.25) }}>
                <div style={{ transform: `rotate(${t * (t < checks[3].done ? 220 : 30)}deg) scale(${1 + Math.sin(t * 10) * 0.06 * (t < checks[3].done ? 1 : 0)})` }}><ClaudeMark s={46} /></div>
                <span style={fa(36, 700, C.ink)}>باشه! با NFP و همون سبک، فارسی‌ش می‌کنم.</span>
              </div>
              {t >= replyT + 0.25 && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, padding: "12px 18px", borderRadius: 14, background: "#F1EEE5", border: "1px solid #E4E0D5", width: "fit-content", direction: "ltr", opacity: ramp(t, replyT + 0.25, replyT + 0.45) }}>
                  <Tune s={22} c={C.ink2} />
                  <span style={mono(22, C.ink2, 1)}>Skill · nfp › cosmic-minimal</span>
                  <svg width={14} height={14} viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke={C.ink3} strokeWidth={2.6} fill="none" /></svg>
                </div>
              )}
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 4 }}>
                {checks.map((c, i) => {
                  const appear = i === 0 ? replyT + 0.4 : checks[i - 1].done;
                  if (t < appear) return null;
                  const k = ease.out(ramp(t, appear, appear + 0.22));
                  const done = t >= c.done;
                  const isRender = i === 3;
                  const rp = ease.io(ramp(t, appear + 0.05, c.done));
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 20px", borderRadius: 18, background: done ? "rgba(242,92,31,.08)" : "#F3F1EB", marginTop: 6, opacity: k, transform: `translateY(${(1 - k) * 14}px)` }}>
                      {done ? <CheckDot s={46} k={Math.min(1.15, (t - c.done) / 0.16) - hit(t, c.done + 0.16, 0.2) * 0.1} c={C.green} /> : <Spinner s={46} t={t} c={C.green} bg="rgba(0,0,0,.08)" />}
                      <span style={fa(40, 800, done ? C.ink : C.ink3)}>{c.txt}</span>
                      <div style={{ flex: 1 }} />
                      {isRender && !done ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 12, direction: "ltr" }}>
                          <div style={{ width: 220, height: 12, borderRadius: 6, background: "#E6E2D8", overflow: "hidden" }}><div style={{ width: `${rp * 100}%`, height: "100%", background: C.green }} /></div>
                          <span style={inter(22, 800, C.ink2)}>{`${Math.round(rp * 100)}%`}</span>
                        </div>
                      ) : (
                        <span style={mono(18, C.ink2, 1)}>{c.sub}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* output file */}
              {outK > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 14, padding: 14, borderRadius: 20, background: "#fff", border: `2px solid ${C.green}`, boxShadow: SHADOW, width: "fit-content", direction: "ltr", transform: `scale(${outK})`, transformOrigin: "100% 50%", marginLeft: "auto" }}>
                  <div style={{ position: "relative", width: 100, height: 100, borderRadius: 14, overflow: "hidden", background: "#2a8a7c" }}>
                    <Img src={v23("b/vfa-thumb.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", maxWidth: "none" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <span style={inter(29, 800, C.ink)}>numerology-1010-fa.mp4</span>
                    <span style={inter(21, 500, C.ink3)}>0:24 · 1080×1920 · Persian</span>
                  </div>
                  <div style={{ width: 66, height: 66, borderRadius: 33, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 10 }}><Ico n="play" s={30} c="#fff" fill /></div>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      )}
      {/* input box */}
      {(() => {
        const compact = ease.io(ramp(t, sendT, sendT + 0.35));
        const ih = lerp(attached ? 236 : 150, 92, compact);
        return (
          <div style={{ position: "absolute", left: 28, right: 28, bottom: 26, height: ih, borderRadius: 28, background: "#fff", border: "1px solid #E3DFD4", boxShadow: "0 6px 24px rgba(30,25,15,.08)", overflow: "hidden" }}>
            {attached && compact < 1 && (
              <div style={{ position: "absolute", left: 18, top: 16, transform: `scale(${ease.back(ramp(t, x.cl - 0.08, x.cl + 0.22))})`, transformOrigin: "0 50%", opacity: 1 - compact }}>
                <Attach t={t} s={0.88} />
              </div>
            )}
            {compact < 1 && (
              <div style={{ position: "absolute", left: 26, right: 26, top: attached ? 108 : 22, opacity: 1 - compact, display: "flex", justifyContent: "flex-end" }}>
                <span style={fa(34, 700, ty > 0 ? C.ink : C.ink3)}>{ty > 0 ? typedW(PROMPT, ty) : "پیامت رو بنویس…"}{ty > 0 && ty < 1 && Math.floor(t * 5) % 2 ? "|" : ""}</span>
              </div>
            )}
            {/* bottom row */}
            <div style={{ position: "absolute", left: 18, right: 18, bottom: 14, height: 58, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, border: "1px solid #E3DFD4", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico n="plus" s={26} c={C.ink2} w={2.2} /></div>
              <div style={{ width: 50, height: 50, borderRadius: 14, border: "1px solid #E3DFD4", display: "flex", alignItems: "center", justifyContent: "center" }}><Tune s={24} c={C.ink2} /></div>
              {compact > 0.5 && <span style={{ ...inter(22, 500, C.ink3), marginLeft: 8, opacity: (compact - 0.5) * 2 }}>Reply to Claude…</span>}
              <div style={{ flex: 1 }} />
              <span style={inter(21, 600, C.ink2)}>Opus</span>
              <svg width={14} height={14} viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke={C.ink3} strokeWidth={2.6} fill="none" /></svg>
              <div style={{ width: 54, height: 54, borderRadius: 15, marginLeft: 8, background: ty >= 1 && !sent ? TERRA : sent ? "#E8D3C9" : "#EDE9DF", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - hit(t, sendT - 0.12, 0.2) * 0.14})` }}>
                <svg width={26} height={26} viewBox="0 0 24 24"><path d="M12 19V5M5.5 11.5L12 5l6.5 6.5" stroke="#fff" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </div>
          </div>
        );
      })()}
      {/* click ripple on send */}
      {t > sendT - 0.14 && t < sendT + 0.4 && (
        <div style={{ position: "absolute", left: W - 28 - 18 - 27 - 60 * ramp(t, sendT - 0.14, sendT + 0.4), top: H - 26 - 14 - 29 - 60 * ramp(t, sendT - 0.14, sendT + 0.4), width: 120 * ramp(t, sendT - 0.14, sendT + 0.4), height: 120 * ramp(t, sendT - 0.14, sendT + 0.4), borderRadius: "50%", border: `3px solid ${TERRA}`, opacity: 1 - ramp(t, sendT - 0.14, sendT + 0.4) }} />
      )}
    </div>
  );
};

// ── auto-edit timeline
const TRACKS = ["ویدیو", "صدا", "موزیک", "افکت"];
const CLIPS = (() => {
  const a: { r: number; x: number; w: number; i: number }[] = [];
  const lens = [[150, 120, 180, 110, 160, 190], [300, 260, 330], [880], [70, 60, 80, 60, 70, 60, 80]];
  lens.forEach((row, r) => {
    let x0 = 0;
    row.forEach((w, j) => {
      const gap = r === 3 ? 60 : 6;
      a.push({ r, x: x0, w: Math.min(w, 880 - x0), i: j });
      x0 += w + gap;
    });
  });
  return a;
})();
const AutoEdit: React.FC<{ t: number }> = ({ t }) => {
  const x = T8();
  const inK = ease.out(ramp(t, x.and - 0.1, x.and + 0.35));
  const order = CLIPS.map((c, i) => ({ ...c, k: i })).sort((p, q) => p.x - q.x || p.r - q.r);
  const t0 = x.and + 0.15, t1 = x.ed - 0.1;
  const play = ramp(t, x.and + 0.3, 79.1);
  const tlX = 40, tlW = 860;
  const sx = tlW / 880;
  // Claude's cursor path over the timeline (screen coords)
  const path: [number, number, number][] = [[x.and, 900, 760], [x.me, 330, 1110], [x.work + 0.1, 560, 1150], [x.self, 720, 1066], [S(217) + 0.1, 440, 1190], [S(219), 820, 1150], [x.ed, 640, 1100], [79.1, 700, 1080]];
  let cx = path[0][1], cy = path[0][2];
  for (let i = 0; i < path.length - 1; i++) {
    const [ta, xa, ya] = path[i], [tb, xb, yb] = path[i + 1];
    if (t >= ta && t <= tb) { const k = ease.io(ramp(t, ta, tb)); cx = lerp(xa, xb, k); cy = lerp(ya, yb, k); }
    if (t > tb) { cx = xb; cy = yb; }
  }
  const clicks = path.slice(1, -1).map((p) => p[0]);
  const meK = ease.back(ramp(t, x.me, x.me + 0.35));
  const badge = slam(t, x.ed, 0.2);
  return (
    <>
      {/* timeline panel */}
      <div style={{ position: "absolute", left: 40, top: 1004, width: 1000, height: 256, borderRadius: 28, background: "#141418", boxShadow: "0 30px 80px rgba(10,10,20,.3)", transform: `translateY(${(1 - inK) * 500}px)`, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 22, top: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: C.neon, opacity: 0.5 + 0.5 * Math.abs(Math.sin(t * 6)) }} />
          <span style={mono(16, "#9A9CA3", 2)}>AUTO-EDIT · NFP</span>
        </div>
        <span style={{ position: "absolute", right: 22, top: 14, ...inter(18, 600, "#9A9CA3") }}>{`00:${String(Math.floor(play * 24)).padStart(2, "0")} / 00:24`}</span>
        {/* ruler */}
        {Array.from({ length: 23 }, (_, i) => <div key={i} style={{ position: "absolute", left: tlX + i * 40, top: i % 4 === 0 ? 46 : 52, width: 1.5, height: i % 4 === 0 ? 12 : 6, background: "rgba(255,255,255,.3)" }} />)}
        {TRACKS.map((l, r) => (
          <React.Fragment key={l}>
            <div style={{ position: "absolute", left: tlX, top: 70 + r * 44, width: tlW, height: 36, borderRadius: 8, background: "rgba(255,255,255,.035)" }} />
            <span style={{ position: "absolute", right: 16, top: 70 + r * 44 + 2, ...fa(20, 700, "#8A8C92") }}>{l}</span>
          </React.Fragment>
        ))}
        {order.map((c, n) => {
          const tt = lerp(t0, t1, n / order.length);
          const k = ease.out(ramp(t, tt, tt + 0.28));
          if (k <= 0) return null;
          const col = [C.neon, "#E9E6DE", "rgba(255,138,79,.55)", "#F6B38E"][c.r];
          return (
            <div key={n} style={{ position: "absolute", left: tlX + c.x * sx, top: 70 + c.r * 44 + (1 - k) * -60, width: c.w * sx, height: 36, borderRadius: 8, background: c.r === 0 ? "#2E2F36" : col, opacity: Math.min(1, k * 2), overflow: "hidden", boxShadow: k < 1 ? `0 0 ${20 * (1 - k)}px ${C.neon}` : undefined }}>
              {c.r === 0 && <div style={{ position: "absolute", inset: 0, display: "flex" }}>{Array.from({ length: Math.ceil(c.w / 60) }, (_, j) => <div key={j} style={{ width: 60, height: 36, flex: "none", overflow: "hidden", borderRight: "1px solid rgba(0,0,0,.4)" }}><Img src={v23(`b/vfa${String(1 + ((c.i * 3 + j) % 14)).padStart(2, "0")}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", maxWidth: "none" }} /></div>)}</div>}
              {c.r === 1 && <div style={{ position: "absolute", inset: "4px 6px" }}><Wave n={Math.round(c.w / 7)} w={c.w - 12} h={28} c="rgba(22,23,26,.55)" seed={c.i + 2} gap={2} /></div>}
              {c.r === 2 && <div style={{ position: "absolute", inset: "6px 6px" }}><Wave n={Math.round(c.w / 6)} w={c.w - 12} h={24} c="rgba(255,255,255,.7)" seed={9} gap={2} /></div>}
              {c.r === 3 && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico n="bolt" s={20} c={C.ink} fill /></div>}
            </div>
          );
        })}
        {/* cut markers */}
        {order.filter((c) => c.r === 0 && c.i > 0).map((c, n) => {
          const tt = lerp(t0, t1, order.indexOf(c) / order.length) + 0.2;
          const k = hit(t, tt, 0.5);
          return k > 0 ? <div key={`cut${n}`} style={{ position: "absolute", left: tlX + c.x * sx - 16, top: 34, opacity: k }}><Ico n="scissors" s={28} c={C.neon} w={2.2} /></div> : null;
        })}
        {/* playhead */}
        <div style={{ position: "absolute", left: tlX + play * tlW, top: 40, width: 3, height: 210, background: "#fff", boxShadow: "0 0 10px rgba(255,255,255,.6)" }}>
          <div style={{ position: "absolute", left: -8, top: -6, width: 19, height: 14, borderRadius: 3, background: "#fff" }} />
        </div>
      </div>
      {/* Claude's edit log */}
      <div style={{ position: "absolute", left: 40, top: 300, width: 292, display: "flex", flexDirection: "column", gap: 14, opacity: inK }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ClaudeMark s={22} />
          <span style={mono(16, C.ink2, 3)}>EDIT LOG</span>
        </div>
        {[
          { ico: "scissors", txt: "کات روی ضرب", tt: x.me },
          { ico: "type", txt: "زیرنویس فارسی", tt: x.work + 0.1 },
          { ico: "music", txt: "موزیک و افکت", tt: x.self },
          { ico: "palette", txt: "رنگ و نور", tt: S(217) + 0.1 },
          { ico: "check", txt: "خروجی نهایی", tt: S(219) },
        ].map((l, i) => {
          const k = Math.min(1, ease.back(ramp(t, l.tt, l.tt + 0.3)));
          if (k <= 0) return null;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 18, background: "#fff", boxShadow: SHADOW, direction: "rtl", transform: `scale(${k})`, transformOrigin: "100% 50%" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Ico n={l.ico} s={22} c="#fff" w={2.2} /></div>
              <span style={fa(25, 800, C.ink)}>{l.txt}</span>
              <div style={{ flex: 1 }} />
              <CheckDot s={28} k={ramp(t, l.tt + 0.15, l.tt + 0.35)} c={C.green} />
            </div>
          );
        })}
      </div>
      {/* the user's idle cursor */}
      {meK > 0 && (
        <div style={{ position: "absolute", left: 712, top: 470 + Math.sin(t * 1.5) * 3 }}>
          <Cursor s={42} />
          <div style={{ position: "absolute", left: 30, top: 58, transform: `scale(${meK})`, transformOrigin: "0 0", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
            <div style={{ padding: "12px 22px", borderRadius: 18, background: "#fff", boxShadow: SHADOW, ...fa(36, 900, C.ink) }}>من: هیچ کاری</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "rgba(22,23,26,.06)" }}>
              <Ico n="clock" s={20} c={C.ink3} w={2.2} />
              <span style={mono(17, C.ink3, 2)}>{`IDLE 00:${String(Math.floor(Math.max(0, t - x.me) * 3.3)).padStart(2, "0")}`}</span>
            </div>
          </div>
        </div>
      )}
      {/* Claude's cursor */}
      {inK > 0 && (
        <div style={{ position: "absolute", left: cx, top: cy, opacity: inK, zIndex: 5 }}>
          {clicks.map((c, i) => {
            const k = ramp(t, c, c + 0.4);
            return k > 0 && k < 1 ? <div key={i} style={{ position: "absolute", left: -40 * k, top: -40 * k, width: 80 * k, height: 80 * k, borderRadius: "50%", border: `3px solid ${C.neon}`, opacity: 1 - k }} /> : null;
          })}
          <Cursor s={38} c={C.green} stroke="#fff" />
          <div style={{ position: "absolute", left: 30, top: 42, display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 10, background: C.green, boxShadow: "0 6px 16px rgba(242,92,31,.35)" }}>
            <ClaudeMark s={20} c="#fff" />
            <span style={inter(18, 800, "#fff")}>Claude</span>
          </div>
        </div>
      )}
      {/* auto-edit badge */}
      {badge.o > 0 && (
        <div style={{ position: "absolute", left: 300, top: 960, transform: `translate(-50%,-50%) rotate(-2deg) scale(${badge.s})`, opacity: badge.o, zIndex: 6 }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16, padding: "16px 32px", borderRadius: 999, background: C.green, boxShadow: "0 20px 50px rgba(242,92,31,.4)", direction: "rtl" }}>
            <Echo k={ramp(t, x.ed + 0.18, x.ed + 0.75)} r={999} c={C.green} w={5} grow={0.3} />
            <Ico n="wand" s={40} c="#fff" w={2.4} />
            <span style={fa(48, 900, "#fff")}>ادیت خودکار</span>
          </div>
        </div>
      )}
    </>
  );
};

export const S8Body: React.FC<{ t: number }> = ({ t }) => {
  const x = T8();
  const whip = ease.in(ramp(t, x.send - 0.04, x.send + 0.22)); // phone/stats out to the left
  const chatIn = ease.out(ramp(t, x.send + 0.08, x.send + 0.42));
  const baK = ease.in(ramp(t, x.make - 0.14, x.make + 0.1)); // chat → before/after (gone before the phones settle)
  const aeK = ease.io(ramp(t, x.and - 0.1, x.and + 0.45)); // before/after → auto-edit
  const out = ease.in(ramp(t, 79.12, 79.4)); // fast whip-out to the left (S9 whips in on «حتی» 79.48)
  // flying file chip: download card → chat input
  const fly = ease.io(ramp(t, x.send + 0.05, x.cl - 0.1));
  const fx = lerp(800, 330, fly), fy = lerp(890, 1040, fly) - Math.sin(fly * Math.PI) * 260;
  // phones (before/after → auto-edit)
  const enR = lr({ x: 55, y: 290, w: 440, h: 0 }, { x: -520, y: 290, w: 440, h: 0 }, aeK);
  const faR = lr({ x: 585, y: 290, w: 440, h: 0 }, { x: 352, y: 280, w: 340, h: 0 }, aeK);
  const baIn = (d: number) => ease.out(ramp(t, x.make - 0.05 + d, x.make + 0.35 + d));
  const vs = ease.back(ramp(t, x.make + 0.15, x.make + 0.5)) * (1 - aeK);
  return (
    <Full style={{ transform: `translateX(${-out * 1350}px) skewX(${out * 10}deg)`, filter: out > 0 ? `blur(${out * 20}px)` : undefined }}>
      {/* phone + stats */}
      {whip < 1 && t >= x.dock && (
        <Full style={{ transform: `translateX(${-whip * 1250}px)`, filter: whip > 0 ? `blur(${whip * 18}px)` : undefined }}>
          <SrcPhone t={t} />
          <Stats t={t} />
        </Full>
      )}
      {/* chat */}
      {chatIn > 0 && baK < 1 && (
        <Full style={{ transform: `translateX(${(1 - chatIn) * 1250}px) translateY(${baK * 260}px) scale(${lerp(1, 0.7, baK)})`, transformOrigin: "540px 1100px", opacity: 1 - baK, filter: chatIn < 1 ? `blur(${(1 - chatIn) * 18}px)` : undefined }}>
          <Chat t={t} />
        </Full>
      )}
      {/* flying attachment */}
      {fly > 0 && fly < 1 && (
        <div style={{ position: "absolute", left: fx, top: fy, transform: `translate(-50%,-50%) rotate(${Math.sin(fly * Math.PI) * -10}deg) scale(${1 + Math.sin(fly * Math.PI) * 0.25})`, zIndex: 8, filter: "drop-shadow(0 30px 40px rgba(20,20,30,.3))" }}>
          <Attach t={t} s={1} />
        </div>
      )}
      {/* before / after → auto-edit preview */}
      {baK > 0 && out < 1 && (
        <>
          {enR.x > -500 && (
            <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - baIn(0)) * -700}px)`, opacity: Math.min(1, baIn(0) * 2) }}>
              <Device x={enR.x} y={enR.y} w={enR.w} style={{ filter: `saturate(${lerp(1, 0.7, ramp(t, x.make + 0.3, x.make + 0.6))})` }}>
                <Clip src={EN_SRC} t0={x.make - 0.05} from={BA_FROM} dur={6} />
                <div style={{ position: "absolute", left: 18, top: 56, padding: "8px 14px", borderRadius: 10, background: "rgba(0,0,0,.6)", ...mono(18, "#fff", 3) }}>ORIGINAL · EN</div>
              </Device>
            </div>
          )}
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - baIn(0.1)) * 700}px)`, opacity: Math.min(1, baIn(0.1) * 2) }}>
            <Device x={faR.x} y={faR.y} w={faR.w} shadow="0 50px 110px rgba(242,92,31,.28), 0 18px 40px rgba(20,18,30,.2)">
              <Clip src={FA_SRC} t0={x.make - 0.05} from={BA_FROM} dur={6} />
              <div style={{ position: "absolute", right: 16, top: 52, display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10, background: C.green, transform: `scale(${faR.w / 440})`, transformOrigin: "100% 0" }}>
                <span style={fa(24, 900, "#fff")}>نسخه‌ی فارسی</span>
                <span style={mono(15, "rgba(255,255,255,.85)", 2)}>NFP</span>
              </div>
            </Device>
          </div>
          {vs > 0 && (
            <div style={{ position: "absolute", left: 540, top: 760, transform: `translate(-50%,-50%) scale(${vs})`, zIndex: 3 }}>
              <div style={{ width: 120, height: 120, borderRadius: 60, background: "#fff", boxShadow: SHADOW, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ClaudeMark s={64} style={{ transform: `rotate(${t * 60}deg)` }} />
              </div>
              <svg width={200} height={40} style={{ position: "absolute", left: -40, top: 140, overflow: "visible" }}>
                <path d="M20 20 H170 M150 6 L172 20 L150 34" stroke={C.green} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="200" strokeDashoffset={200 * (1 - clamp(vs))} />
              </svg>
            </div>
          )}
        </>
      )}
      {aeK > 0 && <AutoEdit t={t} />}
      <Stepper t={t} />
    </Full>
  );
};
