// Video 23 · group A vector art: shop products, the old film-set gear (crew, camera, lights), a laptop.
import React from "react";
import { C } from "./lib";

/** product renders, viewBox 0 0 100 100, soft studio shading */
export const Product: React.FC<{ i: number; s: number; hue?: string }> = ({ i, s }) => {
  const id = `pa${i}`;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{ display: "block" }}>
      <defs>
        <radialGradient id={`${id}bg`} cx="0.5" cy="0.38" r="0.75">
          <stop offset="0" stopColor={["#FBEFE6", "#F1EEE8", "#F7ECEF", "#ECEDEF"][i]} />
          <stop offset="1" stopColor={["#EBD6C6", "#DCD6CB", "#E7D3D9", "#D5D8DD"][i]} />
        </radialGradient>
        <radialGradient id={`${id}sh`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity=".28" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}glass`} x1="0" x2="1">
          <stop offset="0" stopColor="#7A3A12" />
          <stop offset=".35" stopColor="#C9671E" />
          <stop offset=".6" stopColor="#E3893A" />
          <stop offset="1" stopColor="#6E3210" />
        </linearGradient>
        <linearGradient id={`${id}metal`} x1="0" x2="1">
          <stop offset="0" stopColor="#8E8E93" />
          <stop offset=".4" stopColor="#F2F2F4" />
          <stop offset=".7" stopColor="#B8B8BE" />
          <stop offset="1" stopColor="#6D6D72" />
        </linearGradient>
        <linearGradient id={`${id}gold`} x1="0" x2="1">
          <stop offset="0" stopColor="#8C6A2C" />
          <stop offset=".45" stopColor="#F3D58A" />
          <stop offset=".7" stopColor="#C9A24A" />
          <stop offset="1" stopColor="#7A5A22" />
        </linearGradient>
        <linearGradient id={`${id}cloth`} x1="0" x2="1">
          <stop offset="0" stopColor="#CFC4B2" />
          <stop offset=".45" stopColor="#F1EADF" />
          <stop offset="1" stopColor="#BFB3A0" />
        </linearGradient>
        <linearGradient id={`${id}pf`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#FFD2B8" stopOpacity=".95" />
          <stop offset=".5" stopColor="#FF9A6B" stopOpacity=".9" />
          <stop offset="1" stopColor="#E25F2E" stopOpacity=".95" />
        </linearGradient>
        <linearGradient id={`${id}cap`} x1="0" x2="1">
          <stop offset="0" stopColor="#101114" />
          <stop offset=".45" stopColor="#3A3C42" />
          <stop offset="1" stopColor="#0B0C0E" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${id}bg)`} />
      <ellipse cx="50" cy="88" rx="26" ry="4.5" fill={`url(#${id}sh)`} />
      {i === 0 && (
        <g>
          {/* dropper serum */}
          <path d="M44.5 12c0-3 2.5-5 5.5-5s5.5 2 5.5 5v13h-11z" fill="#17181B" />
          <path d="M46.5 10.5c.6-1.6 1.8-2.3 3-2.4" stroke="#fff" strokeOpacity=".35" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <rect x="41" y="24" width="18" height="10" rx="1.6" fill={`url(#${id}metal)`} />
          <path d="M37 38c0-3 2-5 5-5h16c3 0 5 2 5 5v44c0 3-2 5-5 5H42c-3 0-5-2-5-5z" fill={`url(#${id}glass)`} />
          <rect x="40" y="50" width="20" height="24" rx="1.5" fill="#F7F2EA" />
          <text x="50" y="59" textAnchor="middle" fontFamily="Bask" fontWeight="700" fontSize="6.4" fill="#16171A">MIA</text>
          <rect x="44" y="62" width="12" height=".9" fill="#16171A" opacity=".5" />
          <rect x="45.5" y="65" width="9" height=".9" fill="#16171A" opacity=".35" />
          <text x="50" y="71" textAnchor="middle" fontFamily="InterV" fontWeight="700" fontSize="2.8" fill={C.green}>GLOW SERUM</text>
          <path d="M40.5 38v40" stroke="#fff" strokeOpacity=".45" strokeWidth="2" strokeLinecap="round" />
          <path d="M58.5 40v34" stroke="#fff" strokeOpacity=".18" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      )}
      {i === 1 && (
        <g>
          {/* hoodie */}
          <path d="M37 18c3-4 8-6 13-6s10 2 13 6l15 7c3 1.5 4.5 4 5 7l4 30c.3 2.4-1.6 4-3.8 3.6l-6-1-.2 19c0 2-1.6 3.4-3.6 3.4H27.6c-2 0-3.6-1.4-3.6-3.4l-.2-19-6 1C15.6 66 13.7 64.4 14 62l4-30c.5-3 2-5.5 5-7z" fill={`url(#${id}cloth)`} />
          <path d="M38 18c2.5 7 6.5 11 12 11s9.5-4 12-11c-3-3-7-5-12-5s-9 2-12 5z" fill="#BFB3A0" />
          <path d="M40.5 19.5c2.4 5 5.6 7.6 9.5 7.6s7.1-2.6 9.5-7.6" stroke="#A89C88" strokeWidth="1" fill="none" />
          <path d="M46 28v11M54 28v11" stroke="#8C806C" strokeWidth="1" strokeLinecap="round" />
          <circle cx="46" cy="40" r="1" fill="#8C806C" /><circle cx="54" cy="40" r="1" fill="#8C806C" />
          <path d="M36 60h28l-3 13H39z" fill="#D9CFBF" stroke="#BFB3A0" strokeWidth=".8" />
          <circle cx="50" cy="48" r="4.2" fill={C.green} />
          <path d="M48.2 48l1.8 1.8 2.6-3.2" stroke="#fff" strokeWidth="1.1" fill="none" strokeLinecap="round" />
          <path d="M23.8 64.6l.2 4M76.2 64.6l-.2 4" stroke="#A89C88" strokeWidth="1.4" />
          <path d="M27 80h46" stroke="#BFB3A0" strokeWidth="1.2" />
        </g>
      )}
      {i === 2 && (
        <g>
          {/* perfume */}
          <rect x="44" y="12" width="12" height="9" rx="1.5" fill={`url(#${id}gold)`} />
          <rect x="41" y="20" width="18" height="10" rx="2" fill={`url(#${id}gold)`} />
          <rect x="47" y="29" width="6" height="5" fill="#C9A24A" />
          <path d="M30 40c0-4 3-7 7-7h26c4 0 7 3 7 7v38c0 4-3 7-7 7H37c-4 0-7-3-7-7z" fill="#fff" fillOpacity=".55" stroke="#E7C9BC" strokeWidth="1.2" />
          <path d="M33.5 46c0-3 2-5 5-5h23c3 0 5 2 5 5v29c0 3-2 5-5 5h-23c-3 0-5-2-5-5z" fill={`url(#${id}pf)`} />
          <rect x="40" y="55" width="20" height="12" rx="1.2" fill="#fff" fillOpacity=".86" />
          <text x="50" y="62.6" textAnchor="middle" fontFamily="Bask" fontWeight="700" fontSize="5.4" fill="#16171A">N°3</text>
          <path d="M34 42l6-5M34 72V48" stroke="#fff" strokeOpacity=".7" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M66 50v22" stroke="#fff" strokeOpacity=".35" strokeWidth="1" strokeLinecap="round" />
        </g>
      )}
      {i === 3 && (
        <g>
          {/* cap */}
          <path d="M22 60c0-19 12-32 28-32s28 13 28 32z" fill={`url(#${id}cap)`} />
          <path d="M50 28v32M36 31c-4 8-5 18-5 29M64 31c4 8 5 18 5 29" stroke="#2C2E33" strokeWidth=".9" fill="none" />
          <circle cx="50" cy="28.5" r="2.4" fill="#2C2E33" />
          <path d="M20 60c-4 0-9 3-9 7 0 3 3 5 8 5h36c10 0 20-4 23-12z" fill="#1A1B1F" />
          <path d="M14 67c10-3 30-4 44-2" stroke="#3A3C42" strokeWidth="1" fill="none" />
          <rect x="41" y="40" width="18" height="10" rx="2" fill={C.green} />
          <text x="50" y="47.2" textAnchor="middle" fontFamily="InterV" fontWeight="800" fontSize="5" fill="#fff">MIA</text>
          <path d="M28 44c2-6 6-10 11-12" stroke="#fff" strokeOpacity=".22" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
      )}
    </svg>
  );
};

/** a crew member in technical line-art (stroke only), feet at y=0 */
const Crew: React.FC<{ x: number; h: number; c: string; lean?: number }> = ({ x, h, c, lean = 0 }) => {
  const s = h / 100;
  return (
    <g transform={`translate(${x} 0) scale(${s}) rotate(${lean})`}>
      <circle cx="0" cy="-86" r="12" fill="#FBFAF7" stroke={c} strokeWidth={3 / s} />
      <path d="M-22 0V-44c0-14 9-26 22-26s22 12 22 26V0" fill="#FBFAF7" stroke={c} strokeWidth={3 / s} strokeLinejoin="round" />
      <path d="M-11 -64v20M11 -64v20" stroke={c} strokeOpacity=".35" strokeWidth={2 / s} />
    </g>
  );
};
const Note: React.FC<{ x: number; y: number; tx: number; ty: number; label: string; c: string; anchor?: "start" | "end" }> = ({ x, y, tx, ty, label, c, anchor = "start" }) => (
  <g>
    <circle cx={x} cy={y} r={4} fill={C.green} />
    <path d={`M${x} ${y}L${tx} ${ty}H${anchor === "start" ? tx + 8 : tx - 8}`} stroke={c} strokeOpacity=".55" strokeWidth="1.6" fill="none" />
    <text x={anchor === "start" ? tx + 12 : tx - 12} y={ty + 5} textAnchor={anchor} fontFamily="Chakra" fontWeight={600} fontSize={19} letterSpacing={2} fill={c}>{label}</text>
  </g>
);

/** the old way: a film set drawn as a technical line illustration (camera on tripod, light kit, boom, video village, crew). viewBox 0 0 900 300 */
export const FilmSet: React.FC<{ w: number; t: number; c?: string }> = ({ w, t, c = C.ink }) => {
  const sway = Math.sin(t * 2.2) * 2.2;
  const L = { stroke: c, strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const F = "#FBFAF7";
  return (
    <svg width={w} height={(w * 300) / 900} viewBox="0 0 900 300" style={{ display: "block", overflow: "visible" }}>
      {/* floor + perspective */}
      <path d="M0 290H900" {...L} strokeOpacity=".5" />
      {[-3, -2, -1, 1, 2, 3].map((i) => <path key={i} d={`M${450 + i * 60} 290L${450 + i * 150} 300`} stroke={c} strokeOpacity=".12" strokeWidth="2" />)}
      {/* video village: monitor on a stand + director's chair */}
      <g>
        <path d="M118 290V186M96 290l22-30 22 30" {...L} fill="none" />
        <rect x="64" y="122" width="108" height="66" rx="6" fill={F} {...L} />
        <rect x="72" y="130" width="92" height="50" rx="2" fill="#2A2C31" />
        <path d="M110 146v18l15-9z" fill="#fff" fillOpacity=".7" />
        <rect x="72" y="176" width={92 * ((t * 0.3) % 1)} height="4" fill={C.green} />
        <path d="M190 236h52M196 236l40 54M236 236l-40 54M192 236v-28h48v28" {...L} fill="none" />
        <path d="M194 214h44" stroke={c} strokeWidth="6" strokeOpacity=".25" />
      </g>
      {/* boom operator + boom pole */}
      <g transform="translate(0 290)"><Crew x={300} h={104} c={c} lean={-4} /></g>
      <g transform={`rotate(${sway} 318 214)`}>
        <path d="M318 214L452 46" {...L} strokeWidth="4" />
        <rect x="438" y="20" width="58" height="24" rx="12" transform="rotate(-38 467 32)" fill={F} {...L} />
        {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${446 + i * 7} ${22 + i * -5.4}l-4 -7`} stroke={c} strokeOpacity=".45" strokeWidth="1.6" />)}
      </g>
      {/* cinema camera on a tripod */}
      <g>
        <path d="M470 176L402 290M470 176L470 284M470 176L538 290M424 252h92" {...L} fill="none" />
        <rect x="448" y="160" width="44" height="18" rx="4" fill={F} {...L} />
        <path d="M448 170L376 196" {...L} strokeWidth="4" />
        <rect x="416" y="100" width="104" height="60" rx="8" fill={F} {...L} />
        <path d="M428 112h32M428 122h22" stroke={c} strokeOpacity=".35" strokeWidth="2.2" />
        <rect x="520" y="110" width="34" height="42" rx="4" fill={F} {...L} />
        <path d="M528 110v42M538 110v42" stroke={c} strokeOpacity=".35" strokeWidth="2" />
        <path d="M554 104l42-14v82l-42-14z" fill={F} {...L} />
        <path d="M426 100V86h70v14" {...L} fill="none" />
        <rect x="374" y="96" width="38" height="32" rx="3" fill={F} {...L} />
        <rect x="379" y="101" width="28" height="22" fill="#2A2C31" />
        <path d="M412 112h4" {...L} />
        <circle cx="446" cy="60" r="24" fill={F} {...L} />
        <circle cx="498" cy="60" r="24" fill={F} {...L} />
        <circle cx="446" cy="60" r="6" fill={c} /><circle cx="498" cy="60" r="6" fill={c} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${446 + Math.cos(t * 3 + i * 2.1) * 16} ${60 + Math.sin(t * 3 + i * 2.1) * 16}L446 60`} stroke={c} strokeOpacity=".4" strokeWidth="2" />)}
        <circle cx="537" cy="162" r="9" fill={F} {...L} />
        <circle cx="508" cy="112" r="5" fill={C.red} opacity={0.35 + 0.65 * (Math.sin(t * 7) > 0 ? 1 : 0)} />
      </g>
      {/* light kit */}
      <g>
        <path d="M770 290V118M738 290l32-44 32 44" {...L} fill="none" />
        <path d="M712 30h116l-24 84h-68z" fill={F} {...L} />
        <path d="M722 40h96M730 64h80M737 88h66" stroke={c} strokeOpacity=".22" strokeWidth="2" />
        <rect x="760" y="112" width="20" height="12" fill={c} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${706 - i * 4} ${58 + i * 22}l-${54 + i * 8} ${10 + i * 12}`} stroke={C.green} strokeOpacity={0.4 + 0.3 * Math.sin(t * 6 + i)} strokeWidth="3" strokeDasharray="6 7" strokeLinecap="round" />)}
      </g>
      {/* crew */}
      <g transform="translate(0 290)">
        {[[28, 98], [612, 102], [662, 94], [860, 100]].map(([x, h], i) => <Crew key={i} x={x} h={h} c={c} lean={i % 2 ? 3 : -2} />)}
      </g>
      {/* annotations */}
      <Note x={520} y={100} tx={566} ty={46} label="CINEMA CAM · $25K" c={C.ink2} />
      <Note x={790} y={30} tx={830} ty={6} label="LIGHT KIT ×6" c={C.ink2} anchor="end" />
      <Note x={444} y={40} tx={404} ty={14} label="BOOM OP" c={C.ink2} anchor="end" />
      <Note x={612} y={186} tx={572} ty={150} label="CREW ×8" c={C.ink2} />
      <Note x={118} y={122} tx={150} ty={96} label="VIDEO VILLAGE" c={C.ink2} />
    </svg>
  );
};

/** laptop (screen is a slot for children). w = total width */
export const Laptop: React.FC<{ w: number; children?: React.ReactNode }> = ({ w, children }) => {
  const sw = w * 0.8, sh = sw * 0.64;
  return (
    <div style={{ position: "relative", width: w, height: sh + w * 0.075 }}>
      <div style={{ position: "absolute", left: (w - sw) / 2, top: 0, width: sw, height: sh, borderRadius: w * 0.03, background: "#1B1C20", padding: w * 0.018, boxShadow: "inset 0 0 0 2px #3A3B41, 0 20px 40px rgba(20,20,30,.25)" }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: w * 0.012, overflow: "hidden", background: "#000" }}>{children}</div>
        <div style={{ position: "absolute", left: "50%", top: w * 0.006, width: w * 0.008, height: w * 0.008, marginLeft: -w * 0.004, borderRadius: 99, background: "#3A3B41" }} />
      </div>
      <div style={{ position: "absolute", left: 0, top: sh - 2, width: w, height: w * 0.05, borderRadius: `${w * 0.006}px ${w * 0.006}px ${w * 0.03}px ${w * 0.03}px`, background: "linear-gradient(180deg,#E9E9EC 0%,#C9CACF 55%,#9A9BA1 100%)", boxShadow: "0 18px 30px rgba(20,20,30,.25)" }}>
        <div style={{ position: "absolute", left: "50%", top: 0, width: w * 0.16, height: w * 0.016, marginLeft: -w * 0.08, borderRadius: `0 0 ${w * 0.012}px ${w * 0.012}px`, background: "#B4B5BA" }} />
      </div>
    </div>
  );
};
