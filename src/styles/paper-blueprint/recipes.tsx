// Ready-made scene pieces for Paper × Blueprint (extracted from video 04).
// SVG pieces go inside a scene <svg> (paper ones need <InkDefs/>, blue ones need <BlueDefs/>).
// HTML pieces (SearchPill) go directly in the Shot.
import { geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import React from "react";
import { FONT_TEXT } from "../../fonts";
import land from "../../lib/geo/land.json";
import dots from "../../lib/geo/world-dots.json";
import { B, FONT_MONO, P, rnd } from "./theme";

/* ───────────── blueprint ───────────── */

/** Search bar (HTML). Children = custom content; otherwise `text` + blinking cursor. Top-left at (x,y). */
export const SearchPill: React.FC<{ x: number; y: number; w?: number; f: number; text?: string; size?: number; a?: number; children?: React.ReactNode }> = ({
  x, y, w = 980, f, text = "", size = 68, a = 1, children,
}) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: 130, borderRadius: 70, border: `2px solid ${B.dim}`, opacity: a }}>
    <div style={{ position: "absolute", inset: 10, borderRadius: 60, border: `2.5px solid ${B.line}`, boxShadow: "0 0 26px rgba(140,160,255,.3), inset 0 0 30px rgba(140,160,255,.12)", background: "rgba(10,14,50,.6)" }} />
    <svg width="80" height="130" style={{ position: "absolute", left: 30, top: 0 }}>
      <g transform="translate(40 62)" stroke={B.line} strokeWidth="4" fill="none" strokeLinecap="round"><circle r="20" /><path d="M14 14 L30 30" /></g>
    </svg>
    <div style={{ position: "absolute", left: 120, top: 14, width: w - 180, height: 100, direction: "rtl", textAlign: "right", fontFamily: FONT_TEXT, fontSize: size, lineHeight: "100px", color: B.white, textShadow: "0 0 18px rgba(170,185,255,.55)", whiteSpace: "nowrap" }}>
      {children ?? (<>{text}<span style={{ opacity: f % 18 < 9 ? 1 : 0, color: B.pink }}>|</span></>)}
    </div>
  </div>
);

/** Social post card (SVG). hot>0 = matched (pink + glow). */
export const PostCard: React.FC<{ x: number; y: number; hot?: number; s?: number }> = ({ x, y, hot = 0, s = 1 }) => {
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

/** Equirectangular projection used by DottedWorld (defaults fit 1920×1080 with room for title/caption). */
export const geoX = (lon: number, k = 4.3, cx = 960) => cx + (lon - 5) * k;
export const geoY = (lat: number, k = 4.3, cy = 480) => cy - (lat - 11) * k;

/** Dotted world map. `front` (longitude) = scan wave: dots east of it light up (subset `lit` fraction). */
export const DottedWorld: React.FC<{ front?: number | null; lit?: number; k?: number; cx?: number; cy?: number }> = ({ front = null, lit = 0.5, k = 4.3, cx = 960, cy = 480 }) => {
  const pts = dots as [number, number][];
  return (
    <g>
      {pts.map(([lon, lat], i) => <circle key={i} cx={geoX(lon, k, cx)} cy={geoY(lat, k, cy)} r="2.1" fill={B.line} opacity=".2" />)}
      {front !== null && (
        <g filter="url(#softGlow)">
          {pts.map(([lon, lat], i) => {
            if (rnd(i) > lit || lon < front) return null;
            const near = 1 - Math.min(1, (lon - front) / 14);
            return <circle key={i} cx={geoX(lon, k, cx)} cy={geoY(lat, k, cy)} r={2.3 + near * 2.2} fill={near > 0.3 ? "#fff" : B.line} opacity={0.6 + near * 0.4} />;
          })}
        </g>
      )}
    </g>
  );
};

/** CCTV feed frame chrome (SVG): brackets, REC dot, camera id + clock. Content goes inside via children (clipped). */
export const CamFeed: React.FC<{ x: number; y: number; w: number; h: number; f: number; cam?: string; children?: React.ReactNode }> = ({ x, y, w, h, f, cam = "CAM-04172", children }) => (
  <g>
    <clipPath id="camfeed"><rect x={x} y={y} width={w} height={h} rx="10" /></clipPath>
    <rect x={x} y={y} width={w} height={h} rx="10" fill="rgba(6,9,34,.7)" stroke={B.dim} strokeWidth="2" />
    <g clipPath="url(#camfeed)">{children}</g>
    <path d={`M${x - 14} ${y + 40} V${y - 14} H${x + 40} M${x + w - 40} ${y - 14} H${x + w + 14} V${y + 40} M${x + w + 14} ${y + h - 40} V${y + h + 14} H${x + w - 40} M${x + 40} ${y + h + 14} H${x - 14} V${y + h - 40}`}
      stroke={B.white} strokeWidth="3" fill="none" opacity=".8" />
    <circle cx={x + 34} cy={y + 34} r="8" fill={B.coral} opacity={f % 24 < 14 ? 1 : 0.2} />
    <text x={x + 52} y={y + 41} fill={B.white} fontSize="20" fontFamily={FONT_MONO} direction="ltr" opacity=".85">REC</text>
    <text x={x + w - 24} y={y + 41} fill={B.line} fontSize="18" fontFamily={FONT_MONO} textAnchor="end" direction="ltr" opacity=".75">
      {`${cam} · 18:36:${String(21 + Math.floor(f / 30) % 38).padStart(2, "0")}`}
    </text>
  </g>
);

/** Face-detection corner brackets around (x,y) with half-size r. */
export const FaceBox: React.FC<{ x: number; y: number; r: number; locked?: boolean; label?: string; sw?: number }> = ({ x, y, r, locked = false, label, sw = 1.8 }) => (
  <g stroke={locked ? B.pink : B.line} fill="none" strokeWidth={locked ? sw + 1.4 : sw} filter={locked ? "url(#softGlow)" : undefined}>
    <path d={`M${x - r} ${y - r + 12} V${y - r} H${x - r + 12} M${x + r - 12} ${y - r} H${x + r} V${y - r + 12} M${x + r} ${y + r - 12} V${y + r} H${x + r - 12} M${x - r + 12} ${y + r} H${x - r} V${y + r - 12}`} />
    {label && <text x={x - r} y={y - r - 8} fill={B.line} stroke="none" fontSize="15" fontFamily={FONT_MONO} direction="ltr">{label}</text>}
  </g>
);

/* ───────────── people (both worlds) ───────────── */

export type PersonSpec = { x0: number; v: number; h: number; ph: number; hat?: boolean; bag?: boolean; glasses?: boolean };
/** A walking crowd; index 3 wears glasses (the "target"). */
export const CROWD: PersonSpec[] = [
  { x0: 120, v: 2.2, h: 1.0, ph: 0, bag: true },
  { x0: 330, v: 1.7, h: 0.92, ph: 1.3, hat: true },
  { x0: 520, v: 2.0, h: 1.06, ph: 2.1 },
  { x0: 700, v: 1.8, h: 1.1, ph: 0.6, glasses: true },
  { x0: 900, v: 2.4, h: 0.95, ph: 2.8, bag: true },
  { x0: 1060, v: 1.6, h: 1.02, ph: 1.8, hat: true },
  { x0: -60, v: 2.1, h: 0.9, ph: 0.3 },
];
export const personX = (s: PersonSpec, f: number) => s.x0 + f * s.v;
export const HEAD_Y = 182; // head center above feet, before scaling (× s.h × k)

/** Walking silhouette (paper ink) or outline (blueprint, line=true). Origin = feet; k = size, kx = x-position factor. */
export const Person: React.FC<{ s: PersonSpec; f: number; ground: number; line?: boolean; k?: number; kx?: number; dx?: number }> = ({ s, f, ground, line = false, k = 1, kx = 1, dx = 0 }) => {
  const x = dx + personX(s, f) * kx;
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

/* ───────────── paper ───────────── */

/** Rotating ink globe with hatch crescent. */
export const InkGlobe: React.FC<{ cx: number; cy: number; r: number; f: number; spin?: number; lon0?: number; tilt?: number }> = ({ cx, cy, r, f, spin = 0.55, lon0 = -20, tilt = -14 }) => {
  const path = geoPath(geoOrthographic().scale(r).translate([cx, cy]).rotate([lon0 - f * spin, tilt]));
  const id = `cres${Math.round(cx)}${Math.round(cy)}`;
  return (
    <g>
      <mask id={id}>
        <circle cx={cx} cy={cy} r={r} fill="#fff" />
        <circle cx={cx - r * 0.26} cy={cy - r * 0.22} r={r} fill="#000" />
      </mask>
      <ellipse cx={cx} cy={cy + r + 40} rx={r * 0.74} ry={16} fill={P.ink} opacity=".12" />
      <circle cx={cx} cy={cy} r={r} fill={P.sea} />
      <path d={path(geoGraticule10()) ?? ""} fill="none" stroke={P.ink} strokeWidth="1.2" opacity=".18" />
      <path d={path(land as never) ?? ""} fill={P.land} stroke={P.ink} strokeWidth="3" strokeLinejoin="round" />
      <circle cx={cx} cy={cy} r={r} fill="url(#hatch)" mask={`url(#${id})`} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={P.ink} strokeWidth="7" />
      <path d={`M${cx - r * 0.7} ${cy - r * 0.55} Q ${cx - r * 0.82} ${cy - r * 0.3} ${cx - r * 0.8} ${cy - r * 0.07}`} stroke="#fff" strokeWidth="9" fill="none" strokeLinecap="round" opacity=".6" />
    </g>
  );
};

/** Red map pin; tip at (x,y). */
export const MapPin: React.FC<{ x: number; y: number; s?: number; shadow?: number }> = ({ x, y, s = 1, shadow = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="4" rx="22" ry="7" fill={P.ink} opacity={0.25 * shadow} />
    <path d="M0 0 C -12 -30, -44 -52, -44 -86 A 44 44 0 1 1 44 -86 C 44 -52, 12 -30, 0 0 Z" fill={P.red} stroke={P.ink} strokeWidth="6" />
    <circle cx="0" cy="-86" r="16" fill={P.paperLight} stroke={P.ink} strokeWidth="4" />
    <path d="M-30 -110 Q -24 -124 -10 -128" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".6" />
  </g>
);

/** Push-pin head (corkboard). */
export const PushPin: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}><circle r="13" fill={P.red} stroke={P.ink} strokeWidth="4" /><circle cx="-4" cy="-4" r="3.5" fill="#fff" opacity=".8" /></g>
);

/** Polaroid with a bust silhouette (glasses optional). Center at (0,0) — wrap in a transformed <g>. */
export const Polaroid: React.FC<{ glasses?: boolean }> = ({ glasses = true }) => (
  <g>
    <rect x="-112" y="-128" width="224" height="262" rx="4" fill="#fbf8f0" stroke={P.ink} strokeWidth="5" />
    <rect x="-94" y="-110" width="188" height="178" fill={P.sky} stroke={P.ink} strokeWidth="3" />
    <path d="M-80 68 C -70 20, -40 6, 0 6 C 40 6, 70 20, 80 68 Z" fill={P.ink} />
    <circle cx="0" cy="-36" r="38" fill={P.ink} />
    <path d="M-38 -48 C -30 -80, 30 -84, 40 -50 C 20 -66, -18 -66, -38 -48 Z" fill="#1a1512" />
    {glasses && <g stroke={P.paperLight} strokeWidth="3" fill="none"><circle cx="-15" cy="-38" r="11" /><circle cx="17" cy="-38" r="11" /><path d="M-4 -38 H6" /></g>}
    <rect x="-94" y="-110" width="188" height="178" fill="url(#hatch)" opacity=".4" />
  </g>
);

/** Ticket stub. Center at (0,0). */
export const Ticket: React.FC = () => (
  <g>
    <path d="M-130 -62 H130 V-16 A 16 16 0 0 0 130 16 V62 H-130 V16 A 16 16 0 0 0 -130 -16 Z" fill={P.stripeGold} stroke={P.ink} strokeWidth="5" />
    <path d="M60 -58 V58" stroke={P.ink} strokeWidth="2.5" strokeDasharray="6 6" />
    <path d="M80 -30 h34 M80 -10 h26 M80 10 h34 M80 30 h20" stroke={P.ink} strokeWidth="3" opacity=".7" />
  </g>
);

/** Corkboard on legs standing on the ground line. */
export const Corkboard: React.FC<{ x: number; y: number; w: number; h: number; ground?: number }> = ({ x, y, w, h, ground = 820 }) => (
  <g>
    <path d={`M${x + 80} ${y + h - 10} L${x + 60} ${ground + 2} M${x + w - 80} ${y + h - 10} L${x + w - 60} ${ground + 2}`} stroke={P.ink} strokeWidth="10" strokeLinecap="round" />
    <rect x={x} y={y} width={w} height={h} rx="10" fill={P.wood} stroke={P.ink} strokeWidth="6" />
    <rect x={x + 24} y={y + 24} width={w - 48} height={h - 48} rx="4" fill={P.cork} stroke={P.ink} strokeWidth="4" />
    {Array.from({ length: Math.round((w * h) / 4000) }, (_, i) => (
      <circle key={i} cx={x + 40 + rnd(i) * (w - 80)} cy={y + 40 + rnd(i + 99) * (h - 80)} r={1.5 + rnd(i + 7) * 2} fill={P.wood} opacity=".45" />
    ))}
    <rect x={x + 24} y={y + h - 70} width={w - 48} height="46" fill="url(#hatch)" opacity=".7" />
  </g>
);

/** Street CCTV camera on a pole. pan<0 tilts the lens down-left (SVG rotate sign!). */
export const StreetCam: React.FC<{ x: number; top?: number; ground?: number; pan: number; f: number; cone?: boolean }> = ({ x, top = 300, ground = 820, pan, f, cone = true }) => (
  <g>
    <rect x={x - 9} y={top} width="18" height={ground - top} rx="4" fill={P.ink} />
    <path d={`M${x} ${top + 30} H${x - 125}`} stroke={P.ink} strokeWidth="12" strokeLinecap="round" />
    <g transform={`translate(${x - 121} ${top + 50}) rotate(${pan})`}>
      {cone && <><path d="M-110 0 L-900 -180 L-900 300 Z" fill={P.gold} opacity=".16" /><path d="M-110 0 L-900 -180 L-900 300 Z" fill="url(#hatch)" opacity=".35" /></>}
      <rect x="-120" y="-30" width="140" height="60" rx="12" fill={P.paperLight} stroke={P.ink} strokeWidth="6" />
      <rect x="-132" y="-38" width="120" height="16" rx="6" fill={P.ink} />
      <circle cx="-120" cy="2" r="20" fill={P.ink} />
      <circle cx="-120" cy="2" r="9" fill={P.sky} />
      <circle cx="0" cy="-8" r="6" fill={f % 20 < 10 ? P.red : P.redDark} />
      <rect x="-90" y="-10" width="80" height="34" fill="url(#hatch)" />
    </g>
    <circle cx={x - 121} cy={top + 50} r="12" fill={P.ink} />
  </g>
);
