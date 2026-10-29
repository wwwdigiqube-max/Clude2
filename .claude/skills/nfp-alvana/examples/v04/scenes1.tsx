import { evolvePath } from "@remotion/paths";
import { geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import land from "../lib/geo/land.json";
import { BlueDefs, DashedPath, Ground, InkDefs, Label, Robot, RobotLine, Sparkle, TickDial } from "../styles/paper-blueprint/kit";
import { BlueChip, PaperTag, Shot } from "../styles/paper-blueprint/shot";
import { B, easeBack, easeOut, fa, faNum, P, ramp, rnd, typed, W, H } from "../styles/paper-blueprint/theme";

type SP = { g0: number; dur: number };

const NAME = "آرمان کیانی";

/* 1 ─ paper ─ only a name */
export const S1: React.FC<SP> = ({ g0, dur }) => {
  const f = useCurrentFrame();
  const fall = ramp(f, 0, 18, (t) => t * t);
  const bounce = f > 18 && f < 30 ? Math.sin(((f - 18) / 12) * Math.PI) * 26 : 0;
  const unfold = ramp(f, 30, 46, easeBack);
  const ballY = interpolate(fall, [0, 1], [-80, 786]) - bounce;
  const noteX = interpolate(unfold, [0, 1], [1180, 1160]);
  const noteY = interpolate(unfold, [0, 1], [786, 450]);
  const write = ramp(f, 50, 80, (t) => t);
  const ring = ramp(f, 46, 64, easeOut);
  const robotX = interpolate(ramp(f, 16, 70, (t) => t), [0, 1], [-160, 560]);
  const walking = f > 16 && f < 70;
  const q = ramp(f, 86, 98, easeBack);
  return (
    <Shot world="paper" f={f} g0={g0} dur={dur} title="فقط یک اسم" chapter="۱ · اسم" stripe="blue" cx={1160} cy={450}
      parts={[["یک نفر رو باید پیدا کنی.", 12], ["فقط اسمش رو داری.", 60]]}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <InkDefs f={f} />
        <g filter="url(#boil)">
          <Ground y={820} seed={1} />
          <circle cx={1160} cy={450} r={250} fill="none" stroke={P.gold} strokeWidth="5" strokeDasharray={`${1571 * ring} 1571`} transform="rotate(-90 1160 450)" />
          {unfold < 0.05 && (
            <g transform={`translate(1180 ${ballY}) rotate(${f * 9})`}>
              <circle r="34" fill={P.paperLight} stroke={P.ink} strokeWidth="5" />
              <path d="M-20 -12 L2 -4 L-6 18 M8 -24 L2 -4 L24 6" stroke={P.ink} strokeWidth="2.5" fill="none" />
              <path d="M-4 10 A 28 28 0 0 0 26 -10" stroke="url(#hatch)" strokeWidth="12" fill="none" />
            </g>
          )}
          {unfold > 0 && (
            <g transform={`translate(${noteX} ${noteY}) rotate(${interpolate(unfold, [0, 1], [-40, -4])}) scale(${Math.max(0.05, unfold)})`}>
              <rect x="-290" y="-125" width="580" height="250" rx="6" fill={P.paperLight} stroke={P.ink} strokeWidth="5" />
              <path d="M-290 -125 L-230 -125 L-290 -65 Z" fill="url(#hatch)" />
              <path d="M-100 -122 L-60 122 M-290 10 L288 -6" stroke={P.ink} strokeWidth="1.5" opacity=".25" />
              <path d="M-250 70 L250 70" stroke={P.ink} strokeWidth="2" opacity=".2" strokeDasharray="10 8" />
            </g>
          )}
          <Robot x={robotX} y={820} s={1.12} f={f} walking={walking} mood={f > 84 ? "confused" : "calm"} look={f > 70 ? 1 : 0} />
        </g>
      </svg>
      {/* handwritten name, revealed right → left like a pen */}
      <div style={{ position: "absolute", left: 1160 - 280, top: 450 - 70, width: 560, textAlign: "center", direction: "rtl", fontFamily: FONT_TEXT, fontSize: 88, color: P.ink,
        transform: "rotate(-4deg)", clipPath: `inset(0 0 0 ${(1 - write) * 100}%)`, opacity: unfold > 0.95 ? 1 : 0 }}>
        {NAME}
      </div>
      <div style={{ position: "absolute", left: 1160 - 100, top: 172, width: 200, textAlign: "center", fontFamily: FONT_TEXT, fontSize: 28, color: P.ink, opacity: ring, direction: "rtl" }}>
        تنها سرنخ
      </div>
      <div style={{ position: "absolute", left: 610 - 60, top: 470, width: 120, textAlign: "center", fontFamily: FONT_NUM, fontSize: 130, color: P.gold,
        WebkitTextStroke: `5px ${P.ink}`, paintOrder: "stroke fill", transform: `scale(${q}) rotate(${Math.sin(f / 6) * 6}deg)`, opacity: q }}>
        ؟
      </div>
    </Shot>
  );
};

/* 2 ─ paper ─ eight billion people */
const Icon: React.FC<{ kind: "photo" | "home" | "phone" }> = ({ kind }) => (
  <g stroke={P.ink} strokeWidth="5" fill={P.paperLight} strokeLinejoin="round">
    {kind === "photo" && (<><rect x="-40" y="-28" width="80" height="58" rx="9" /><rect x="-18" y="-40" width="30" height="14" rx="4" /><circle cx="0" cy="2" r="16" /><circle cx="0" cy="2" r="6" fill={P.ink} /></>)}
    {kind === "home" && (<><path d="M-38 -2 L0 -38 L38 -2 V36 H-38 Z" /><rect x="-10" y="10" width="20" height="26" fill={P.ink} /></>)}
    {kind === "phone" && (<><rect x="-24" y="-40" width="48" height="80" rx="10" /><rect x="-15" y="-28" width="30" height="46" rx="3" fill={P.sea} /><circle cx="0" cy="29" r="4" fill={P.ink} /></>)}
  </g>
);

export const S2: React.FC<SP> = ({ g0, dur }) => {
  const f = useCurrentFrame();
  const pull = ramp(f, 0, 42);
  const z = interpolate(pull, [0, 1], [2.1, 1]);
  const GX = 720, GY = 560, GR = 270;
  const proj = geoOrthographic().scale(GR).translate([GX, GY]).rotate([-20 - f * 0.55, -14]);
  const path = geoPath(proj);
  const count = interpolate(ramp(f, 14, 70, easeOut), [0, 1], [0, 8_000_000_000]);
  const numA = ramp(f, 10, 24, easeOut);
  return (
    <Shot world="paper" f={f} g0={g0} dur={dur} title="۸ میلیارد نفر" chapter="۱ · اسم" stripe="gold" cx={GX} cy={GY} drift={0.02}
      parts={[["نه عکس،", 62], ["نه آدرس،", 74], ["نه شماره.", 86]]}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${z})`, transformOrigin: `${GX}px ${GY - GR - 40}px` }}>
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <InkDefs f={f} />
          <mask id="crescent">
            <circle cx={GX} cy={GY} r={GR} fill="#fff" />
            <circle cx={GX - 70} cy={GY - 60} r={GR} fill="#000" />
          </mask>
          <g filter="url(#boil)">
            <ellipse cx={GX} cy={GY + GR + 40} rx={200} ry={16} fill={P.ink} opacity=".12" />
            <circle cx={GX} cy={GY} r={GR} fill={P.sea} />
            <path d={path(geoGraticule10()) ?? ""} fill="none" stroke={P.ink} strokeWidth="1.2" opacity=".18" />
            <path d={path(land as never) ?? ""} fill={P.land} stroke={P.ink} strokeWidth="3" strokeLinejoin="round" />
            <circle cx={GX} cy={GY} r={GR} fill="url(#hatch)" mask="url(#crescent)" />
            <circle cx={GX} cy={GY} r={GR} fill="none" stroke={P.ink} strokeWidth="7" />
            <path d={`M${GX - 190} ${GY - 150} Q ${GX - 220} ${GY - 80} ${GX - 215} ${GY - 20}`} stroke="#fff" strokeWidth="9" fill="none" strokeLinecap="round" opacity=".6" />
            <Robot x={GX} y={GY - GR + 8} s={0.42} f={f} mood="determined" arm={0.55}
              hold={<g transform="rotate(-8)"><rect x="-4" y="-40" width="64" height="34" rx="3" fill={P.paperLight} stroke={P.ink} strokeWidth="4" /><path d="M6 -24 H48" stroke={P.ink} strokeWidth="3" /></g>} />
            {(["photo", "home", "phone"] as const).map((k, i) => {
              const t = 62 + i * 12;
              const a = ramp(f, t, t + 10, easeBack);
              const x = 1540 - i * 190;
              const strike = ramp(f, t + 6, t + 14, easeOut);
              const d = `M${x - 52} ${748} L${x + 52} ${672}`;
              const ev = evolvePath(strike, d);
              return (
                <g key={k}>
                  <g transform={`translate(${x} 710) scale(${a})`} opacity={a}><Icon kind={k} /></g>
                  {strike > 0 && <path d={d} stroke={P.red} strokeWidth="9" strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      <Label x={1420} y={430} size={100} font="num" color={P.ink} style={{ opacity: numA, transform: `translateY(${(1 - numA) * 20}px)` }}>{faNum(count)}</Label>
      <Label x={1420} y={540} size={40} color={P.ink} style={{ opacity: ramp(f, 30, 44) }}>آدم روی کره‌ی زمین</Label>
    </Shot>
  );
};

/* 3 ─ blueprint ─ the name goes into the search */
export const S3: React.FC<SP> = ({ g0, dur }) => {
  const f = useCurrentFrame();
  const t = typed(NAME, f, 12, 13);
  const words = t.split(" ");
  const dims = ramp(f, 54, 66, easeOut);
  const box = ramp(f, 64, 74, easeOut);
  const pill = ramp(f, 0, 10, easeOut);
  const nodes = [
    { x: 1480, y: 330, t: 76, label: "پست‌ها", d: "M1250 360 C 1330 250, 1400 260, 1416 318" },
    { x: 1560, y: 650, t: 86, label: "عکس‌ها", d: "M1250 400 C 1400 440, 1500 520, 1520 590" },
    { x: 1120, y: 730, t: 96, label: "ویدیوها", d: "M820 448 C 830 600, 960 700, 1056 724" },
  ];
  return (
    <Shot world="blue" f={f} g0={g0} dur={dur} title="جست‌وجو" chapter="۱ · اسم" cx={1260} cy={520}
      parts={[["هوش مصنوعی فقط همین اسم رو می‌گیره…", 10]]}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <BlueDefs />
        {/* vertical dimension line (reference detail) */}
        <g stroke={B.line} opacity={0.4 * pill} strokeWidth="1.5">
          <line x1="236" y1="316" x2="236" y2="446" /><line x1="226" y1="316" x2="246" y2="316" /><line x1="226" y1="446" x2="246" y2="446" />
          <line x1="236" y1="446" x2="236" y2="860" strokeDasharray="3 7" opacity=".6" />
          <line x1="236" y1="860" x2="600" y2="860" strokeDasharray="3 7" opacity=".6" />
        </g>
        {nodes.map((n, i) => (
          <DashedPath key={i} id={`s3a${i}`} d={n.d} f={f} start={n.t - 12} dur={16} />
        ))}
        {nodes.map((n, i) => {
          const a = ramp(f, n.t, n.t + 12, easeBack);
          return (
            <TickDial key={i} x={n.x} y={n.y} r={58} f={f} appear={a}>
              <g stroke={B.line} fill="none" strokeWidth="2.5" strokeLinejoin="round">
                {i === 0 && [0, 1].map((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={-26 + c * 28} y={-26 + r * 28} width="24" height="24" rx="4" />))}
                {i === 1 && (<><rect x="-30" y="-22" width="60" height="46" rx="5" /><path d="M-24 18 L-6 -2 L6 10 L14 2 L26 18" /><circle cx="12" cy="-10" r="5" /></>)}
                {i === 2 && (<><rect x="-30" y="-20" width="60" height="42" rx="6" /><path d="M-8 -8 L10 1 L-8 10 Z" fill={B.line} /></>)}
              </g>
            </TickDial>
          );
        })}
        <RobotLine x={1150} y={318} s={0.9} f={f} wave={f < 44} look={f > 44 ? -1 : 0} />
        {box > 0 && <Sparkle x={1210} y={330} s={18} f={f} />}
        <g transform="translate(330 381)" stroke={B.line} strokeWidth="4" fill="none" opacity={pill} strokeLinecap="round">
          <circle r="20" /><path d="M14 14 L30 30" />
        </g>
      </svg>
      {/* search pill */}
      <div style={{ position: "absolute", left: 270, top: 316, width: 980, height: 130, borderRadius: 70, border: `2px solid ${B.dim}`, opacity: pill }}>
        <div style={{ position: "absolute", inset: 10, borderRadius: 60, border: `2.5px solid ${B.line}`, boxShadow: "0 0 26px rgba(140,160,255,.3), inset 0 0 30px rgba(140,160,255,.12)", background: "rgba(10,14,50,.6)" }} />
        <div style={{ position: "absolute", left: 120, top: 14, width: 800, height: 100, direction: "rtl", textAlign: "right", fontFamily: FONT_TEXT, fontSize: 70, lineHeight: "100px", color: B.white, textShadow: "0 0 18px rgba(170,185,255,.55)" }}>
          <span style={{ position: "relative", display: "inline-block", padding: "0 14px", outline: `3px solid ${B.pink}`, outlineOffset: 2, borderRadius: 8, boxShadow: `0 0 ${24 * box}px ${B.pink}`,
            outlineColor: `rgba(255,61,154,${box})` }}>
            {words.map((w, i) => (
              <span key={i} style={{ position: "relative", display: "inline-block", marginLeft: i === 0 ? 22 : 0 }}>
                {w}
                <span style={{ position: "absolute", left: 4, right: 4, top: 118, height: 12, borderLeft: `2px solid ${B.line}`, borderRight: `2px solid ${B.line}`, borderBottom: `2px solid ${B.line}`, opacity: dims }} />
                <span style={{ position: "absolute", left: -60, right: -60, top: 132, textAlign: "center", fontSize: 28, lineHeight: "40px", color: B.line, opacity: dims, textShadow: "none" }}>
                  {i === 0 ? "نام" : "نام خانوادگی"}
                </span>
              </span>
            ))}
            <span style={{ opacity: f % 18 < 9 ? 1 : 0, color: B.pink }}>|</span>
          </span>
        </div>
      </div>
      {nodes.map((n, i) => (
        <BlueChip key={i} x={n.x} y={n.y + 104} a={ramp(f, n.t + 4, n.t + 14)}>{n.label}</BlueChip>
      ))}
    </Shot>
  );
};

/* 4 ─ blueprint ─ billions of posts */
const PostCard: React.FC<{ x: number; y: number; hot?: number; s?: number }> = ({ x, y, hot = 0, s = 1 }) => {
  const c = hot > 0 ? B.pink : B.line;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={hot > 0 ? 1 : 0.32} filter={hot > 0 ? "url(#softGlow)" : undefined}>
      <rect x="-65" y="-80" width="130" height="160" rx="10" fill={B.bg0} stroke={c} strokeWidth={hot > 0 ? 3 : 1.6} />
      <rect x="-53" y="-68" width="106" height="78" rx="5" fill="none" stroke={c} strokeWidth="1.4" />
      <path d="M-50 6 L-22 -26 L-2 -6 L14 -20 L50 8" fill="none" stroke={c} strokeWidth="1.4" />
      <circle cx="30" cy="-46" r="7" fill="none" stroke={c} strokeWidth="1.4" />
      <path d="M-53 30 H45 M-53 48 H20 M-53 64 H34" stroke={c} strokeWidth="3" strokeLinecap="round" opacity=".7" />
    </g>
  );
};

export const S4: React.FC<SP> = ({ g0, dur }) => {
  const f = useCurrentFrame();
  const COLS = 6, ROWS = 7, CH = 184, TOT = ROWS * CH;
  const bil = interpolate(ramp(f, 6, 120, (t) => t), [0, 1], [0, 4.2]);
  const sec = Math.round(interpolate(ramp(f, 6, 124, (t) => t), [0, 1], [0, 47]));
  const stop = ramp(f, 124, 132, easeOut);
  const matches = [
    { t: 36, x: 420, y: 330, to: [1700, 800], label: "چهره" },
    { t: 66, x: 800, y: 600, to: [1525, 800], label: "مکان" },
    { t: 96, x: 270, y: 700, to: [1350, 800], label: "فعالیت" },
  ];
  const R = 64, C = 2 * Math.PI * R;
  return (
    <Shot world="blue" f={f} g0={g0} dur={dur} title="میلیاردها پست" chapter="۲ · جست‌وجو" cx={1500} cy={560} drift={0.02}
      parts={[["…و بین میلیاردها پست و عکس می‌گرده.", 8]]}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <BlueDefs />
        <defs>
          <linearGradient id="fadeV" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" /><stop offset=".16" stopColor="#fff" /><stop offset=".84" stopColor="#fff" /><stop offset="1" stopColor="#000" />
          </linearGradient>
          <mask id="wallMask"><rect x="120" y="170" width="1000" height="740" fill="url(#fadeV)" /></mask>
        </defs>
        <g mask="url(#wallMask)">
          {Array.from({ length: COLS }, (_, c) => {
            const speed = 5 + (c % 3) * 2.2;
            const off = speed * f * (1 + f / 90);
            return Array.from({ length: ROWS }, (_, r) => {
              const y = 170 + ((((r * CH - off) % TOT) + TOT) % TOT) - CH / 2 + (c % 2) * 60;
              return <PostCard key={`${c}-${r}`} x={200 + c * 155} y={y} />;
            });
          })}
        </g>
        {/* scan bar */}
        <rect x="120" y={170 + ((f * 9) % 740)} width="1000" height="2" fill={B.line} opacity=".5" filter="url(#softGlow)" />
        {matches.map((m, i) => {
          const hot = ramp(f, m.t, m.t + 6, easeBack);
          const fly = ramp(f, m.t + 16, m.t + 34);
          if (hot <= 0) return null;
          const x = interpolate(fly, [0, 1], [m.x, m.to[0]]);
          const y = interpolate(fly, [0, 1], [m.y, m.to[1]]) - Math.sin(fly * Math.PI) * 120;
          const s = interpolate(fly, [0, 1], [1.08, 0.62]);
          return (
            <g key={i}>
              <PostCard x={x} y={y} hot={hot} s={s * (0.9 + 0.1 * hot)} />
              {fly < 1 && <Sparkle x={x - 60 * s} y={y - 76 * s} s={14} f={f} />}
            </g>
          );
        })}
        {/* timer ring */}
        <g transform="translate(1525 575) rotate(-90)">
          <circle r={R} fill="none" stroke={B.line} strokeWidth="3" opacity=".2" />
          <circle r={R} fill="none" stroke={stop > 0 ? B.pink : B.line} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(C * sec) / 60} ${C}`} filter="url(#softGlow)" />
        </g>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={1350 + i * 175 - 52} y={800 - 64} width="104" height="128" rx="9" fill="none" stroke={B.line} strokeWidth="1.4" strokeDasharray="5 6" opacity=".45" />
        ))}
      </svg>
      <Label x={1525} y={300} size={104} font="num" color={B.white} style={{ textShadow: "0 0 26px rgba(160,175,255,.6)" }}>
        {fa(bil.toFixed(1)).replace(".", "٫")}
        <span style={{ fontFamily: FONT_TEXT, fontSize: 48 }}> میلیارد</span>
      </Label>
      <Label x={1525} y={408} size={32} color={B.line}>پست و عکس بررسی شد</Label>
      <Label x={1525} y={585} size={44} font="num" color={stop > 0 ? B.pink : B.white}>{`${fa("00")}:${fa(String(sec).padStart(2, "0"))}`}</Label>
      <Label x={1525} y={682} size={26} color={B.line} style={{ opacity: ramp(f, 124, 134) }}>کمتر از یک دقیقه</Label>
      {matches.map((m, i) => (
        <Label key={i} x={m.to[0]} y={893} size={24} color={B.line} style={{ opacity: ramp(f, m.t + 32, m.t + 40) }}>{m.label}</Label>
      ))}
    </Shot>
  );
};

/* 5 ─ paper ─ the corkboard dossier */
export const S5: React.FC<SP> = ({ g0, dur }) => {
  const f = useCurrentFrame();
  const T = [18, 58, 98];
  const pop = (i: number) => ramp(f, T[i], T[i] + 12, easeBack);
  const drop = (i: number) => (1 - ramp(f, T[i], T[i] + 10, easeOut)) * -70;
  const pins: [number, number][] = [[760, 318], [1060, 300], [1330, 418]];
  const str = ramp(f, 124, 150, easeOut);
  const d = `M${pins[0][0]} ${pins[0][1]} Q 910 360 ${pins[1][0]} ${pins[1][1]} Q 1200 380 ${pins[2][0]} ${pins[2][1]}`;
  const ev = evolvePath(str, d);
  const armUp = T.some((t) => f > t - 6 && f < t + 10) ? 1 : 0.15;
  return (
    <Shot world="paper" f={f} g0={g0} dur={dur} title="کمتر از یک دقیقه" chapter="۲ · جست‌وجو" stripe="blue" cx={1060} cy={470}
      parts={[["چه شکلیه؟", T[0] + 4], ["آخرین بار کجا بوده؟", T[1] + 4], ["آخرین کارش چی بوده؟", T[2] + 4]]}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <InkDefs f={f} />
        <g filter="url(#boil)">
          <Ground y={820} seed={3} />
          {/* board */}
          <path d="M640 760 L620 822 M1480 760 L1500 822" stroke={P.ink} strokeWidth="10" strokeLinecap="round" />
          <rect x="560" y="190" width="1000" height="580" rx="10" fill={P.wood} stroke={P.ink} strokeWidth="6" />
          <rect x="584" y="214" width="952" height="532" rx="4" fill={P.cork} stroke={P.ink} strokeWidth="4" />
          {Array.from({ length: 140 }, (_, i) => (
            <circle key={i} cx={600 + rnd(i) * 920} cy={230 + rnd(i + 99) * 500} r={1.5 + rnd(i + 7) * 2} fill={P.wood} opacity=".45" />
          ))}
          <rect x="584" y="700" width="952" height="46" fill="url(#hatch)" opacity=".7" />
          {/* 1 polaroid */}
          <g transform={`translate(760 ${440 + drop(0)}) rotate(-6) scale(${pop(0)})`} opacity={pop(0)}>
            <rect x="-112" y="-128" width="224" height="262" rx="4" fill="#fbf8f0" stroke={P.ink} strokeWidth="5" />
            <rect x="-94" y="-110" width="188" height="178" fill={P.sky} stroke={P.ink} strokeWidth="3" />
            <path d="M-80 68 C -70 20, -40 6, 0 6 C 40 6, 70 20, 80 68 Z" fill={P.ink} />
            <circle cx="0" cy="-36" r="38" fill={P.ink} />
            <path d="M-38 -48 C -30 -80, 30 -84, 40 -50 C 20 -66, -18 -66, -38 -48 Z" fill="#1a1512" />
            <g stroke={P.paperLight} strokeWidth="3" fill="none"><circle cx="-15" cy="-38" r="11" /><circle cx="17" cy="-38" r="11" /><path d="M-4 -38 H6" /></g>
            <rect x="-94" y="-110" width="188" height="178" fill="url(#hatch)" opacity=".4" />
          </g>
          {/* 2 map scrap */}
          <g transform={`translate(1060 ${400 + drop(1)}) rotate(4) scale(${pop(1)})`} opacity={pop(1)}>
            <path d="M-120 -96 L118 -100 L124 92 L10 98 L-122 94 Z" fill={P.paperLight} stroke={P.ink} strokeWidth="5" />
            <path d="M-120 -20 C -40 -30, 30 20, 122 0" stroke={P.sky} strokeWidth="14" fill="none" />
            <g stroke={P.ink} strokeWidth="2.5" opacity=".6"><path d="M-60 -98 V96 M40 -100 V96 M-122 50 H122 M-122 -60 H122" /></g>
            <path d="M16 18 l24 24 M40 18 l-24 24" stroke={P.red} strokeWidth="7" strokeLinecap="round" />
          </g>
          {/* 3 ticket */}
          <g transform={`translate(1330 ${480 + drop(2)}) rotate(-3) scale(${pop(2)})`} opacity={pop(2)}>
            <path d="M-130 -62 H130 V-16 A 16 16 0 0 0 130 16 V62 H-130 V16 A 16 16 0 0 0 -130 -16 Z" fill={P.stripeGold} stroke={P.ink} strokeWidth="5" />
            <path d="M60 -58 V58" stroke={P.ink} strokeWidth="2.5" strokeDasharray="6 6" />
            <path d="M80 -30 h34 M80 -10 h26 M80 10 h34 M80 30 h20" stroke={P.ink} strokeWidth="3" opacity=".7" />
          </g>
          {pins.map(([x, y], i) => (
            <g key={i} opacity={pop(i)} transform={`translate(${x} ${y + drop(i) * 0.4})`}>
              <circle r="13" fill={P.red} stroke={P.ink} strokeWidth="4" /><circle cx="-4" cy="-4" r="3.5" fill="#fff" opacity=".8" />
            </g>
          ))}
          {str > 0 && <path d={d} stroke={P.red} strokeWidth="4" fill="none" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />}
          <Robot x={330} y={820} s={1.05} f={f} mood="determined" look={1} arm={armUp}
            hold={<g transform="rotate(20)"><circle cx="0" cy="-16" r="9" fill={P.red} stroke={P.ink} strokeWidth="3.5" /><path d="M0 -8 V8" stroke={P.ink} strokeWidth="3.5" /></g>} />
        </g>
      </svg>
      <PaperTag x={1330} y={480} rot={-3} a={pop(2)} size={30}>بلیت قطار · ۱۸:۴۰</PaperTag>
      <PaperTag x={760} y={640} rot={3} a={ramp(f, T[0] + 10, T[0] + 20, easeBack)}>موی مشکی · عینک · ۱۸۰ سانت</PaperTag>
      <PaperTag x={1080} y={560} rot={-2} a={ramp(f, T[1] + 10, T[1] + 20, easeBack)}>آخرین مکان: ایستگاه مرکزی</PaperTag>
      <PaperTag x={1340} y={622} rot={2} a={ramp(f, T[2] + 10, T[2] + 20, easeBack)}>آخرین کار: خرید بلیت</PaperTag>
    </Shot>
  );
};

