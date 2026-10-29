import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FONT_TEXT } from "../fonts";
import dots from "../lib/geo/world-dots.json";
import { BlueDefs, Ground, InkDefs, Label, Robot, RobotLine, Sparkle } from "../styles/paper-blueprint/kit";
import { BlueChip, Shot } from "../styles/paper-blueprint/shot";
import { B, easeBack, easeOut, fa, faNum, FONT_MONO, P, ramp, rnd, typed, W, H } from "../styles/paper-blueprint/theme";

type SP = { g0: number; dur: number };

const mmss = (s: number) => `${fa(String(Math.floor(s / 60)).padStart(2, "0"))}:${fa(String(Math.floor(s % 60)).padStart(2, "0"))}`;

/* 6 ─ blueprint ─ every camera on earth */
const mx = (lon: number) => 960 + (lon - 5) * 4.3;
const my = (lat: number) => 480 - (lat - 11) * 4.3;
const CITIES: [number, number][] = [[51.4, 35.7], [139.7, 35.7], [-74, 40.7], [-0.1, 51.5], [77.2, 28.6], [-46.6, -23.5], [31.2, 30], [151.2, -33.9], [116.4, 39.9]];

export const S6: React.FC<SP> = ({ g0, dur }) => {
  const f = useCurrentFrame();
  const p = ramp(f, 10, 122, (t) => t);
  const front = 182 - p * 356;
  const secs = interpolate(p, [0, 1], [47, 582]);
  const cams = interpolate(p, [0, 1], [0, 1_000_000_000]);
  const pts = dots as [number, number][];
  return (
    <Shot world="blue" f={f} g0={g0} dur={dur} title="همه‌ی دوربین‌ها" chapter="۳ · دوربین‌ها" cx={960} cy={480} drift={0.03}
      parts={[["حالا نوبت دوربین‌هاست.", 8], ["همه‌ی دوربین‌های زمین.", 40]]}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <BlueDefs />
        <defs>
          <linearGradient id="beam" x1="0" x2="1">
            <stop offset="0" stopColor={B.line} stopOpacity="0" /><stop offset=".8" stopColor={B.line} stopOpacity=".22" /><stop offset="1" stopColor="#fff" stopOpacity=".9" />
          </linearGradient>
        </defs>
        <g>
          {pts.map(([lon, lat], i) => (
            <circle key={i} cx={mx(lon)} cy={my(lat)} r="2.1" fill={B.line} opacity=".2" />
          ))}
        </g>
        <g filter="url(#softGlow)">
          {pts.map(([lon, lat], i) => {
            if (rnd(i) > 0.5 || lon < front) return null;
            const near = 1 - Math.min(1, (lon - front) / 14);
            return <circle key={i} cx={mx(lon)} cy={my(lat)} r={2.3 + near * 2.2} fill={near > 0.3 ? "#fff" : B.line} opacity={0.6 + near * 0.4} />;
          })}
        </g>
        {p > 0 && p < 1 && (
          <g transform={`translate(${mx(front)} 0) scale(-1 1)`}>
            <rect x="-160" y="150" width="160" height="660" fill="url(#beam)" />
            <line x1="0" y1="150" x2="0" y2="810" stroke="#fff" strokeWidth="2" filter="url(#softGlow)" />
          </g>
        )}
        {CITIES.map(([lon, lat], i) => {
          const hit = ramp(f, 10 + ((182 - lon) / 356) * 112, 10 + ((182 - lon) / 356) * 112 + 26, easeOut);
          if (hit <= 0 || hit >= 1) return null;
          return <circle key={i} cx={mx(lon)} cy={my(lat)} r={6 + hit * 46} fill="none" stroke={B.pink} strokeWidth="2.5" opacity={1 - hit} />;
        })}
        {p >= 1 && <Sparkle x={mx(51.4)} y={my(35.7)} s={16} f={f} />}
      </svg>
      <Label x={1290} y={860} size={62} font="num" color={B.white} style={{ textShadow: "0 0 20px rgba(160,175,255,.5)" }}>{faNum(cams)}</Label>
      <Label x={1290} y={912} size={24} color={B.line} style={{ opacity: 0 }}>.</Label>
      <Label x={660} y={860} size={62} font="num" color={p >= 1 ? B.pink : B.white}>{mmss(secs)}</Label>
      <BlueChip x={1640} y={862} size={28}>دوربین</BlueChip>
      <BlueChip x={330} y={862} size={28}>از ۱۰ دقیقه</BlueChip>
    </Shot>
  );
};

/* people (shared by 7 and 8) */
type PersonSpec = { x0: number; v: number; h: number; ph: number; hat?: boolean; bag?: boolean; glasses?: boolean };
const PEOPLE: PersonSpec[] = [
  { x0: 120, v: 2.2, h: 1.0, ph: 0, bag: true },
  { x0: 330, v: 1.7, h: 0.92, ph: 1.3, hat: true },
  { x0: 520, v: 2.0, h: 1.06, ph: 2.1 },
  { x0: 700, v: 1.8, h: 1.1, ph: 0.6, glasses: true },
  { x0: 900, v: 2.4, h: 0.95, ph: 2.8, bag: true },
  { x0: 1060, v: 1.6, h: 1.02, ph: 1.8, hat: true },
  { x0: -60, v: 2.1, h: 0.9, ph: 0.3 },
];
const personX = (s: PersonSpec, f: number) => s.x0 + f * s.v;
const HEAD_Y = 182;

const Person: React.FC<{ s: PersonSpec; f: number; ground: number; line?: boolean; k?: number; kx?: number }> = ({ s, f, ground, line = false, k = 1, kx = 1 }) => {
  const x = personX(s, f) * kx;
  const w = f * 0.3 + s.ph;
  const sw = Math.sin(w) * 20;
  const bob = -Math.abs(Math.cos(w)) * 4;
  const ink = line ? B.line : P.ink;
  const fill = line ? B.bg0 : P.ink;
  const sw2 = line ? 2.6 : 0;
  return (
    <g transform={`translate(${x} ${ground}) scale(${s.h * k})`}>
      {!line && <ellipse cx="0" cy="3" rx="40" ry="6" fill={P.ink} opacity=".15" />}
      <g transform={`translate(0 ${bob})`} strokeLinecap="round" strokeLinejoin="round">
        <path d={`M-8 -82 L${-8 + sw} 0 M8 -82 L${8 - sw} 0`} stroke={ink} strokeWidth={line ? 2.6 : 13} fill="none" />
        {line && <path d={`M-8 -82 L${-8 + sw} 0 M8 -82 L${8 - sw} 0`} stroke={B.line} strokeWidth="2.6" />}
        <path d={`M-24 -146 L${-30 - sw * 0.6} -86 M24 -146 L${30 + sw * 0.6} -86`} stroke={ink} strokeWidth={line ? 2.6 : 11} fill="none" />
        <rect x="-27" y="-158" width="54" height="84" rx="18" fill={fill} stroke={ink} strokeWidth={sw2} />
        {s.bag && <rect x="22" y="-120" width="26" height="34" rx="5" fill={line ? B.bg0 : P.redDark} stroke={ink} strokeWidth={line ? 2.4 : 4} />}
        <circle cx="0" cy={-HEAD_Y} r="23" fill={fill} stroke={ink} strokeWidth={sw2} />
        {s.hat && <path d={`M-30 ${-HEAD_Y - 10} H30 M-18 ${-HEAD_Y - 10} V${-HEAD_Y - 34} H18 V${-HEAD_Y - 10}`} stroke={ink} strokeWidth={line ? 2.6 : 8} fill={fill} />}
        {s.glasses && (
          <g stroke={line ? B.white : P.paperLight} strokeWidth="2.6" fill="none">
            <circle cx="-9" cy={-HEAD_Y - 2} r="7" /><circle cx="9" cy={-HEAD_Y - 2} r="7" />
          </g>
        )}
      </g>
    </g>
  );
};

/* 7 ─ paper ─ the street camera */
export const S7: React.FC<SP> = ({ g0, dur }) => {
  const f = useCurrentFrame();
  const pan = -(20 + Math.sin(f / 16) * 12); // negative = lens tilts down toward the street
  const led = f % 20 < 10;
  return (
    <Shot world="paper" f={f} g0={g0} dur={dur} title="خیابان" chapter="۳ · دوربین‌ها" stripe="gold" cx={1300} cy={420}
      parts={[["میلیون‌ها چهره،", 8], ["در هر ثانیه.", 34]]}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <InkDefs f={f} />
        <g filter="url(#boil)">
          {/* faint skyline */}
          <g stroke={P.ink} strokeWidth="3" fill="none" opacity=".22">
            {[[160, 470, 130], [300, 380, 150], [470, 520, 110], [600, 330, 170], [790, 450, 140], [950, 400, 120], [1090, 540, 150]].map(([x, y, w], i) => (
              <g key={i}>
                <rect x={x} y={y} width={w} height={820 - y} />
                {Array.from({ length: Math.floor((820 - y) / 60) }, (_, r) => (
                  <path key={r} d={`M${x + 22} ${y + 30 + r * 60} h18 M${x + w - 40} ${y + 30 + r * 60} h18`} strokeWidth="5" />
                ))}
              </g>
            ))}
          </g>
          <Ground y={820} seed={7} />
          {PEOPLE.map((s, i) => (
            <Person key={i} s={s} f={f} ground={820} />
          ))}
          {/* camera pole */}
          <rect x="1452" y="300" width="18" height="520" rx="4" fill={P.ink} />
          <path d="M1461 330 H1336" stroke={P.ink} strokeWidth="12" strokeLinecap="round" />
          <g transform={`translate(1340 350) rotate(${pan})`}>
            <path d="M-110 0 L-900 -180 L-900 300 Z" fill={P.gold} opacity=".16" />
            <path d="M-110 0 L-900 -180 L-900 300 Z" fill="url(#hatch)" opacity=".35" />
            <rect x="-120" y="-30" width="140" height="60" rx="12" fill={P.paperLight} stroke={P.ink} strokeWidth="6" />
            <rect x="-132" y="-38" width="120" height="16" rx="6" fill={P.ink} />
            <circle cx="-120" cy="2" r="20" fill={P.ink} />
            <circle cx="-120" cy="2" r="9" fill={P.sky} />
            <circle cx="0" cy="-8" r="6" fill={led ? P.red : P.redDark} />
            <rect x="-90" y="-10" width="80" height="34" fill="url(#hatch)" />
          </g>
          <circle cx="1340" cy="350" r="12" fill={P.ink} />
        </g>
      </svg>
    </Shot>
  );
};

/* 8 ─ blueprint ─ face match */
export const S8: React.FC<SP> = ({ g0, dur }) => {
  const f = useCurrentFrame();
  const FX = 300, FY = 200, FW = 1060, FH = 600, GND = FY + FH - 50;
  const T = 3; // target index (glasses)
  const K = 1.6, KX = 0.78;
  const lock = ramp(f, 68, 74, easeOut);
  const zoom = ramp(f, 76, 110);
  const fz = Math.min(f, 76 + (f - 76) * 0.25); // people slow down during zoom
  const tgt = PEOPLE[T];
  const tx = FX + 60 + personX(tgt, fz) * KX;
  const ty = GND - HEAD_Y * tgt.h * K;
  const z = 1 + zoom * 0.7;
  const pct = interpolate(ramp(f, 84, 128, easeOut), [0, 1], [12, 90]);
  const confs = [23, 41, 17, 64, 35, 28, 12];
  return (
    <Shot world="blue" f={f} g0={g0} dur={dur} title="تطابق چهره" chapter="۳ · دوربین‌ها" cx={830} cy={500} drift={0.015}
      parts={[["و اون یه نفر،", 10], ["بین میلیون‌ها نفر.", 38]]}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <BlueDefs />
        <clipPath id="feed"><rect x={FX} y={FY} width={FW} height={FH} rx="10" /></clipPath>
        <rect x={FX} y={FY} width={FW} height={FH} rx="10" fill="rgba(6,9,34,.7)" stroke={B.dim} strokeWidth="2" />
        <g clipPath="url(#feed)">
          <g transform={`translate(${tx} ${ty}) scale(${z}) translate(${-tx} ${-ty})`}>
            <path d={`M${FX} ${GND} H${FX + FW}`} stroke={B.line} strokeWidth="1.5" opacity=".5" />
            {Array.from({ length: 14 }, (_, i) => (
              <path key={i} d={`M${FX + 40 + i * 80} ${GND} L${FX + FW / 2 + (i - 7) * 200} ${FY + FH}`} stroke={B.line} strokeWidth="1" opacity=".15" />
            ))}
            {PEOPLE.map((s, i) => (
              <g key={i} transform={`translate(${FX + 60} 0)`}>
                <Person s={s} f={fz} ground={GND} line k={K} kx={KX} />
              </g>
            ))}
            {PEOPLE.map((s, i) => {
              const hx = FX + 60 + personX(s, fz) * KX;
              const hy = GND - HEAD_Y * s.h * K;
              const isT = i === T;
              const vis = f > 6 + i * 4 && (isT ? true : f < 70 && (f + i * 3) % 11 < 8);
              if (!vis) return null;
              const c = isT && lock > 0 ? B.pink : B.line;
              const r = 34 * s.h * K;
              return (
                <g key={i} stroke={c} fill="none" strokeWidth={isT && lock > 0 ? 3 / z + 1 : 1.8} filter={isT && lock > 0 ? "url(#softGlow)" : undefined}>
                  <path d={`M${hx - r} ${hy - r + 12} V${hy - r} H${hx - r + 12} M${hx + r - 12} ${hy - r} H${hx + r} V${hy - r + 12} M${hx + r} ${hy + r - 12} V${hy + r} H${hx + r - 12} M${hx - r + 12} ${hy + r} H${hx - r} V${hy + r - 12}`} />
                  {!(isT && lock > 0) && (
                    <text x={hx - r} y={hy - r - 8} fill={B.line} stroke="none" fontSize="15" fontFamily={FONT_MONO} direction="ltr">{`${confs[i]}%`}</text>
                  )}
                </g>
              );
            })}
          </g>
        </g>
        {/* feed chrome */}
        <g stroke={B.white} strokeWidth="3" fill="none" opacity=".8">
          <path d={`M${FX - 14} ${FY + 40} V${FY - 14} H${FX + 40} M${FX + FW - 40} ${FY - 14} H${FX + FW + 14} V${FY + 40} M${FX + FW + 14} ${FY + FH - 40} V${FY + FH + 14} H${FX + FW - 40} M${FX + 40} ${FY + FH + 14} H${FX - 14} V${FY + FH - 40}`} />
        </g>
        <circle cx={FX + 34} cy={FY + 34} r="8" fill={B.coral} opacity={f % 24 < 14 ? 1 : 0.2} />
        <text x={FX + 52} y={FY + 41} fill={B.white} fontSize="20" fontFamily={FONT_MONO} direction="ltr" opacity=".85">REC</text>
        <text x={FX + FW - 24} y={FY + 41} fill={B.line} fontSize="18" fontFamily={FONT_MONO} textAnchor="end" direction="ltr" opacity=".75">
          {`CAM-04172 · 18:36:${String(21 + Math.floor(f / 30)).padStart(2, "0")}`}
        </text>
        {lock > 0 && zoom >= 1 && <Sparkle x={tx - 34 * tgt.h * K * z} y={ty - 34 * tgt.h * K * z} s={16} f={f} />}
        {/* match meter */}
        <g transform="translate(1440 560)" opacity={ramp(f, 80, 90)}>
          <rect x="0" y="0" width="340" height="10" rx="5" fill={B.line} opacity=".18" />
          <rect x="0" y="0" width={(340 * pct) / 100} height="10" rx="5" fill={B.pink} filter="url(#softGlow)" />
          <line x1={340 * 0.9} y1="-10" x2={340 * 0.9} y2="20" stroke={B.white} strokeWidth="2" opacity=".6" />
        </g>
      </svg>
      <Label x={1610} y={450} size={150} font="num" color={B.pink} style={{ opacity: ramp(f, 80, 90), textShadow: "0 0 30px rgba(255,61,154,.55)" }}>{`${fa(Math.round(pct))}٪`}</Label>
      <Label x={1610} y={625} size={32} color={B.line} style={{ opacity: ramp(f, 84, 96) }}>تطابق چهره</Label>
    </Shot>
  );
};

/* 9 ─ paper ─ found */
export const S9: React.FC<SP> = ({ g0, dur }) => {
  const f = useCurrentFrame();
  const PX = 860, PY = 440;
  const drop = ramp(f, 6, 18, (t) => t * t);
  const pinY = interpolate(drop, [0, 1], [-260, PY]) - (f > 18 && f < 26 ? Math.sin(((f - 18) / 8) * Math.PI) * 18 : 0);
  const burst = ramp(f, 18, 32, easeOut);
  const circ = ramp(f, 22, 40, easeOut);
  const jump = (f > 30 && f < 48 ? Math.sin(((f - 30) / 18) * Math.PI) : 0) * 70 + (f > 54 && f < 70 ? Math.sin(((f - 54) / 16) * Math.PI) : 0) * 45;
  const sign = ramp(f, 40, 54, easeBack);
  return (
    <Shot world="paper" f={f} g0={g0} dur={dur} title="پیدا شد" chapter="۴ · پیدا شد" stripe="blue" cx={PX} cy={PY}
      parts={[["پیدا شد.", 26], ["در کمتر از ۱۰ دقیقه، با احتمال ۹۰٪.", 50]]}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <InkDefs f={f} />
        <g filter="url(#boil)">
          <Ground y={820} seed={9} x0={1180} x1={1800} />
          <g transform="rotate(-2 740 470)">
            <rect x="300" y="200" width="880" height="540" rx="6" fill={P.paperLight} stroke={P.ink} strokeWidth="6" />
            <path d="M300 520 C 480 470, 640 600, 820 560 S 1100 470, 1180 520" stroke={P.sky} strokeWidth="34" fill="none" />
            <rect x="960" y="250" width="170" height="150" rx="10" fill={P.grass} opacity=".55" />
            <rect x="960" y="250" width="170" height="150" rx="10" fill="url(#hatch)" />
            <g stroke={P.ink} strokeWidth="3" fill="none" opacity=".75">
              {[420, 560, 700, 900, 1060].map((x) => <path key={x} d={`M${x} 204 V736`} />)}
              {[300, 420, 640].map((y) => <path key={y} d={`M304 ${y} H1176`} />)}
            </g>
            {Array.from({ length: 16 }, (_, i) => {
              const bx = 320 + (i % 8) * 108, by = 222 + Math.floor(i / 8) * 250;
              return <rect key={i} x={bx} y={by} width="80" height="60" fill="url(#hatchDense)" opacity=".5" />;
            })}
            {/* railway */}
            <path d="M304 460 H1176" stroke={P.ink} strokeWidth="4" />
            <path d="M304 474 H1176" stroke={P.ink} strokeWidth="4" />
            {Array.from({ length: 44 }, (_, i) => <path key={i} d={`M${310 + i * 20} 454 V480`} stroke={P.ink} strokeWidth="3" />)}
            <rect x="820" y="400" width="80" height="50" fill={P.paperLight} stroke={P.ink} strokeWidth="4" />
          </g>
          <circle cx={PX} cy={PY} r="110" fill="none" stroke={P.pink} strokeWidth="6" strokeDasharray={`${691 * circ} 691`} transform={`rotate(-90 ${PX} ${PY})`} />
          {burst > 0 && burst < 1 && Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2;
            const r1 = 50 + burst * 60, r2 = r1 + 26 * (1 - burst);
            return <path key={i} d={`M${PX + Math.cos(a) * r1} ${PY - 40 + Math.sin(a) * r1} L${PX + Math.cos(a) * r2} ${PY - 40 + Math.sin(a) * r2}`} stroke={P.gold} strokeWidth="6" strokeLinecap="round" />;
          })}
          <g transform={`translate(${PX} ${pinY})`}>
            <ellipse cx="0" cy="4" rx="22" ry="7" fill={P.ink} opacity={0.25 * drop} />
            <path d="M0 0 C -12 -30, -44 -52, -44 -86 A 44 44 0 1 1 44 -86 C 44 -52, 12 -30, 0 0 Z" fill={P.red} stroke={P.ink} strokeWidth="6" />
            <circle cx="0" cy="-86" r="16" fill={P.paperLight} stroke={P.ink} strokeWidth="4" />
            <path d="M-30 -110 Q -24 -124 -10 -128" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".6" />
          </g>
          {/* sign */}
          <g transform={`translate(1640 820) scale(${sign})`} opacity={sign}>
            <rect x="-8" y="-230" width="16" height="230" fill={P.wood} stroke={P.ink} strokeWidth="4" />
            <rect x="-170" y="-330" width="340" height="120" rx="8" fill={P.paperLight} stroke={P.ink} strokeWidth="6" />
            <rect x="-170" y="-230" width="340" height="20" fill="url(#hatch)" />
          </g>
          <Robot x={1380} y={820} s={1.05} f={f} mood={f > 20 ? "happy" : "determined"} jump={jump} arm={f > 30 ? 1 : 0} look={-1} />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 1640 - 160, top: 820 - 316, width: 320, textAlign: "center", direction: "rtl", fontFamily: FONT_TEXT, fontSize: 36, lineHeight: "46px", color: P.ink, opacity: sign, transform: `scale(${sign})`, transformOrigin: "50% 290px" }}>
        زمان: ۹ دقیقه<br />و ۴۲ ثانیه
      </div>
      <div style={{ position: "absolute", left: PX, top: PY - 178, transform: `translate(-50%,-50%) scale(${ramp(f, 34, 46, easeBack)})`, opacity: ramp(f, 34, 44),
        background: P.ink, color: P.paperLight, fontFamily: FONT_TEXT, fontSize: 28, padding: "6px 20px 10px", borderRadius: 10, whiteSpace: "nowrap", direction: "rtl" }}>
        ایستگاه مرکزی · ۱۸:۳۶
      </div>
    </Shot>
  );
};

/* 10 ─ blueprint ─ outro */
export const S10: React.FC<SP> = ({ g0, dur }) => {
  const f = useCurrentFrame();
  const t = typed("فقط با یک اسم.", f, 8, 13);
  const l1 = ramp(f, 58, 72, easeOut);
  const l2 = ramp(f, 80, 94, easeOut);
  const ul = ramp(f, 96, 110, easeOut);
  const out = ramp(f, 138, 162);
  return (
    <AbsoluteFill>
      <Shot world="blue" f={f} g0={g0} dur={dur} title="فقط یک اسم" chapter="۴ · پیدا شد" cx={960} cy={470} drift={0.05}>
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <BlueDefs />
          <RobotLine x={1350} y={352} s={0.9} f={f} look={0} />
          <g transform="translate(540 417)" stroke={B.line} strokeWidth="4" fill="none" strokeLinecap="round"><circle r="20" /><path d="M14 14 L30 30" /></g>
        </svg>
        <div style={{ position: "absolute", left: 460, top: 352, width: 1000, height: 130, borderRadius: 70, border: `2px solid ${B.dim}` }}>
          <div style={{ position: "absolute", inset: 10, borderRadius: 60, border: `2.5px solid ${B.line}`, boxShadow: "0 0 26px rgba(140,160,255,.3), inset 0 0 30px rgba(140,160,255,.12)", background: "rgba(10,14,50,.6)" }} />
          <div style={{ position: "absolute", left: 130, top: 14, width: 800, height: 100, direction: "rtl", textAlign: "right", fontFamily: FONT_TEXT, fontSize: 66, lineHeight: "100px", color: B.white, textShadow: "0 0 18px rgba(170,185,255,.55)" }}>
            {t}<span style={{ opacity: f % 18 < 9 ? 1 : 0, color: B.pink }}>|</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: 160, top: 590, width: 1600, textAlign: "center", direction: "rtl", fontFamily: FONT_TEXT, fontSize: 64, color: B.white, textShadow: "0 0 22px rgba(160,175,255,.45)" }}>
          <span style={{ display: "inline-block", opacity: l1, transform: `translateY(${(1 - l1) * 18}px)`, filter: `blur(${(1 - l1) * 6}px)` }}>حالا فکر کن اون اسم،&nbsp;</span>
          <span style={{ display: "inline-block", opacity: l2, transform: `translateY(${(1 - l2) * 18}px)`, filter: `blur(${(1 - l2) * 6}px)`, position: "relative" }}>
            <span style={{ position: "relative", display: "inline-block" }}>
              اسم تو
              <span style={{ position: "absolute", right: 0, bottom: 4, height: 6, width: `${ul * 100}%`, background: B.pink, borderRadius: 3, boxShadow: `0 0 16px ${B.pink}` }} />
            </span>{" "}
            باشه.
          </span>
        </div>
      </Shot>
      <AbsoluteFill style={{ background: "#000", opacity: out }} />
    </AbsoluteFill>
  );
};

