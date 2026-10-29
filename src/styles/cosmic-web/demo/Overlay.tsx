// Video 18 overlay (SVG over the 3D canvas): thin boxed labels, void outlines, measuring lines, arrows, "you are here"
// markers, title, ground silhouettes, and the special diagrams (1986 wedge map, soap foam, stretching grid, a light
// wave crossing a supervoid, dark-energy rays, Laniakea flows, closing darkness, viewfinder).
import React, { useMemo } from "react";
import { FONT_TEXT } from "../../../fonts";
import { add, len, mul, norm, project, sub, type V3, type View } from "./cam";
import { BIG_VOIDS, BOO, LANI, PAIR, SUN, type Overlay as Ov } from "./director";

const WD = 1920, HT = 1080;
const TEAL = "#5ff2d0";
const P = (v: View, p: V3) => project(v, p, WD, HT);
// any vector perpendicular to the view direction works for projected radii; top-down views need a fallback axis
const camRight = (v: View): V3 => { const d = norm(sub(v.look, v.pos)); const r: V3 = [-d[2], 0, d[0]]; return len(r) > 1e-3 ? norm(r) : [1, 0, 0]; };
const projR = (v: View, c: V3, r: number) => {
  const a = P(v, c); if (!a) return null;
  const b = P(v, add(c, mul(camRight(v), r))); if (!b) return null;
  return { x: a.x, y: a.y, r: Math.hypot(b.x - a.x, b.y - a.y) };
};
const estW = (s: string, size: number) => s.length * size * 0.5 + 34;

const Box: React.FC<{ x: number; y: number; text: string; k: number; size?: number; teal?: boolean; box?: boolean }> = ({ x, y, text, k, size = 28, teal, box = true }) => {
  if (k <= 0.001) return null;
  const w = estW(text, size), h = size * 1.75;
  const col = teal ? TEAL : "rgba(235,242,248,0.92)";
  return (
    <g opacity={k} transform={`translate(${x} ${y + (1 - k) * 10})`}>
      {box && <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="rgba(0,0,0,0.35)" stroke={teal ? TEAL : "rgba(255,255,255,0.7)"} strokeWidth={1.5} />}
      <text x={0} y={size * 0.36} textAnchor="middle" direction="rtl" fontFamily={FONT_TEXT} fontSize={size} fill={col} style={{ unicodeBidi: "plaintext" }}>{text}</text>
    </g>
  );
};

type WebData = { web: Float32Array; zel?: Float32Array };

export const Overlay18: React.FC<{ t: number; view: View; ov: Ov } & WebData> = ({ t, view, ov, web, zel }) => {
  // ── data from the web cloud, prepared once
  const wedgeDots = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let i = 0; i < web.length; i += 4 * 3) {
      const x = web[i], y = web[i + 1], z = web[i + 2], b = web[i + 3] % 1;
      if (Math.abs(y) > 5) continue;
      const r = Math.hypot(x, z); if (r > 420 || r < 12) continue;
      const a = Math.atan2(x, -z); if (Math.abs(a) > 1.08) continue;
      if (b < 0.08 && (i / 12) % 3 !== 0) continue;
      out.push([r / 420, a, b]);
    }
    return out.slice(0, 2600);
  }, [web]);
  const wedgeVoids = useMemo(() => BIG_VOIDS.filter((v) => Math.abs(v.c[1]) < v.r * 0.7).map((v) => {
    const r = Math.hypot(v.c[0], v.c[2]), a = Math.atan2(v.c[0], -v.c[2]);
    return { r: r / 420, a, s: Math.sqrt(Math.max(0, v.r * v.r - v.c[1] * v.c[1])) / 420 };
  }).filter((v) => v.r < 0.95 && Math.abs(v.a) < 1.0).slice(0, 7), []);
  const flows = useMemo(() => {
    const lines: V3[][] = [];
    for (let i = 0; i < web.length && lines.length < 90; i += 4 * 997) {
      const p: V3 = [web[i], web[i + 1], web[i + 2]];
      const cls = Math.floor(web[i + 3]);
      const d = len(sub(p, LANI));
      if (cls < 1 || d > 300 || d < 60) continue;
      const mid = add(mul(add(p, LANI), 0.5), mul(norm([-(p[2] - LANI[2]), 0, p[0] - LANI[0]]), d * 0.18));
      const pts: V3[] = [];
      for (let s = 0; s <= 16; s++) { const u = s / 16 * 0.88; const a = mul(p, (1 - u) * (1 - u)), b = mul(mid, 2 * u * (1 - u)), c = mul(LANI, u * u); pts.push(add(add(a, b), c)); }
      lines.push(pts);
    }
    return lines;
  }, [web]);

  // growth field picks: a sparse set of arrow particles + anchors for "wall / filament / cluster" labels
  const zelPts = useMemo(() => {
    const out = { arrows: [] as number[], maxPsi: 1, cluster: 0, fil: 0, wall: 0 };
    if (!zel) return out;
    const n = zel.length / 5;
    let maxPsi = 1e-6, best = -1e9, dFil = 1e9, dWall = 1e9;
    for (let j = 0; j < 140; j++) {
      const i = (j * 2654435761) % n;
      const x = zel[i * 5], y = zel[i * 5 + 1];
      if (Math.abs(x) > 30 || Math.abs(y) > 17) continue; // keep them on screen
      out.arrows.push(i);
      maxPsi = Math.max(maxPsi, Math.hypot(zel[i * 5 + 2], zel[i * 5 + 3]));
    }
    for (let i = 0; i < n; i += 7) {
      const x = zel[i * 5], y = zel[i * 5 + 1], dl = zel[i * 5 + 4];
      if (Math.abs(x) > 22 || Math.abs(y) > 12) continue;
      if (dl > best) { best = dl; out.cluster = i; }
      if (Math.abs(dl - 0.55) < dFil && Math.hypot(x + 14, y) < 10) { dFil = Math.abs(dl - 0.55); out.fil = i; }
      if (Math.abs(dl - 0.3) < dWall && Math.hypot(x - 14, y + 2) < 10) { dWall = Math.abs(dl - 0.3); out.wall = i; }
    }
    out.maxPsi = maxPsi;
    return out;
  }, [zel]);
  const els: React.ReactNode[] = [];
  let key = 0;
  // ground silhouettes (night sky shots)
  if (ov.hills && ov.hills.k > 0.001) {
    const k = ov.hills.k, alien = ov.hills.alien;
    els.push(
      <g key={key++} opacity={k}>
        <defs>
          <linearGradient id="hz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={alien ? "rgba(70,140,150,0.0)" : "rgba(60,90,150,0.0)"} /><stop offset="1" stopColor={alien ? "rgba(70,150,160,0.35)" : "rgba(70,100,170,0.35)"} /></linearGradient>
        </defs>
        <rect x={0} y={700} width={WD} height={260} fill="url(#hz)" />
        {alien ? (
          <path d="M0 935 C120 930 160 868 260 862 C360 856 380 905 470 902 C560 899 600 846 720 842 C840 838 860 880 960 884 C1100 890 1120 812 1260 806 C1380 802 1400 870 1500 874 C1620 879 1660 852 1760 850 C1840 849 1880 870 1920 872 L1920 1080 L0 1080 Z" fill="#010305" />
        ) : (
          <path d="M0 925 C240 880 420 905 600 890 C800 872 900 930 1110 905 C1320 880 1500 860 1700 892 C1800 905 1880 900 1920 895 L1920 1080 L0 1080 Z" fill="#010205" />
        )}
        <path d={alien ? "M0 1000 C400 960 700 990 1100 975 C1500 960 1700 990 1920 975 L1920 1080 L0 1080 Z" : "M0 1010 C380 970 760 1000 1100 985 C1450 970 1700 1000 1920 990 L1920 1080 L0 1080 Z"} fill="#000" />
      </g>,
    );
  }
  // light travelling from the Sun to the Earth
  if (ov.light && ov.light.k > 0.001) {
    const a = P(view, SUN), b = P(view, [0, 0, 0]);
    if (a && b) {
      const u = ov.light.prog, x = a.x + (b.x - a.x) * u, y = a.y + (b.y - a.y) * u;
      els.push(<g key={key++} opacity={ov.light.k}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(255,240,200,0.55)" strokeWidth={1.5} strokeDasharray="6 8" /><circle cx={x} cy={y} r={7} fill="#fff6d8" /><circle cx={x} cy={y} r={20} fill="rgba(255,230,170,0.25)" /></g>);
    }
  }
  // Laniakea flows
  if (ov.flows && ov.flows.k > 0.001) {
    flows.forEach((pts, i) => {
      const pp = pts.map((p) => P(view, p)).filter(Boolean) as { x: number; y: number }[];
      if (pp.length < 4) return;
      const prog = Math.min(1, Math.max(0, ov.flows!.prog * 1.4 - (i % 7) * 0.05));
      const n = Math.max(2, Math.round(pp.length * prog));
      const d = pp.slice(0, n).map((q, j) => `${j ? "L" : "M"}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(" ");
      els.push(<path key={key++} d={d} stroke={TEAL} strokeOpacity={0.42 * ov.flows!.k} strokeWidth={1.3} fill="none" />);
      const h = pp[n - 1];
      els.push(<circle key={key++} cx={h.x} cy={h.y} r={2.2} fill={TEAL} opacity={0.8 * ov.flows!.k} />);
    });
  }
  // void outlines are drawn in 3D (bubbles.ts); here only their labels, above the projected sphere
  for (const r of ov.rings) {
    if (r.k <= 0.001 || !r.label) continue;
    const q = projR(view, r.c, r.r);
    if (!q || q.r < 4 || q.r > 3000) continue;
    els.push(<Box key={key++} x={q.x} y={q.y - q.r - 34} text={r.label} k={Math.min(1, r.k * 1.6 - 0.3)} teal={r.teal} size={26} />);
  }  // measuring lines
  for (const m of ov.measures) {
    if (m.k <= 0.001) continue;
    const a = P(view, m.a), b = P(view, m.b);
    if (!a || !b) continue;
    const u = Math.min(1, m.k * 1.3), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const ex = a.x + (b.x - a.x) * u, ey = a.y + (b.y - a.y) * u;
    const nx = -(b.y - a.y), ny = b.x - a.x, nl = Math.hypot(nx, ny) || 1;
    const tk = (x: number, y: number) => <line x1={x - (nx / nl) * 9} y1={y - (ny / nl) * 9} x2={x + (nx / nl) * 9} y2={y + (ny / nl) * 9} stroke="rgba(255,255,255,0.85)" strokeWidth={1.5} />;
    els.push(<g key={key++} opacity={Math.min(1, m.k * 1.5)}><line x1={a.x} y1={a.y} x2={ex} y2={ey} stroke="rgba(255,255,255,0.85)" strokeWidth={1.5} strokeDasharray="7 6" />{tk(a.x, a.y)}{u > 0.98 && tk(b.x, b.y)}</g>);
    els.push(<Box key={key++} x={mx} y={my - 34} text={m.text} k={Math.min(1, m.k * 1.5 - 0.3)} size={24} box={false} />);
  }
  // arrows
  for (const ar of ov.arrows) {
    if (ar.k <= 0.001) continue;
    const a = P(view, ar.a), b = P(view, ar.b);
    if (!a || !b) continue;
    const u = Math.min(1, ar.k), ex = a.x + (b.x - a.x) * u, ey = a.y + (b.y - a.y) * u;
    const ang = Math.atan2(b.y - a.y, b.x - a.x), hs = 12;
    const col = ar.teal ? TEAL : "rgba(255,255,255,0.85)";
    els.push(
      <g key={key++} opacity={Math.min(1, ar.k * 1.4)}>
        <line x1={a.x} y1={a.y} x2={ex} y2={ey} stroke={col} strokeWidth={ar.w ?? 2} />
        <path d={`M${ex} ${ey} L${ex - hs * Math.cos(ang - 0.45)} ${ey - hs * Math.sin(ang - 0.45)} M${ex} ${ey} L${ex - hs * Math.cos(ang + 0.45)} ${ey - hs * Math.sin(ang + 0.45)}`} stroke={col} strokeWidth={ar.w ?? 2} fill="none" />
      </g>,
    );
  }
  // markers ("you are here")
  for (const m of ov.markers) {
    if (m.k <= 0.001) continue;
    const a = P(view, m.at);
    if (!a) continue;
    els.push(
      <g key={key++} opacity={m.k}>
        <circle cx={a.x} cy={a.y} r={16} fill="url(#tealGlow)" />
        <circle cx={a.x} cy={a.y} r={3.5} fill={TEAL} />
      </g>,
    );
    if (m.text) els.push(<Box key={key++} x={a.x} y={a.y - 52} text={m.text} k={m.k} teal size={24} box={false} />);
  }
  // labels
  for (const l of ov.labels) {
    if (l.k <= 0.001) continue;
    let x = 0, y = 0;
    if (l.xy) { x = l.xy[0]; y = l.xy[1]; } else if (l.at) { const a = P(view, l.at); if (!a) continue; x = a.x + (l.dx ?? 0); y = a.y + (l.dy ?? 0); if (l.line) els.push(<line key={key++} x1={a.x} y1={a.y - 14} x2={x} y2={y + 22} stroke="rgba(255,255,255,0.55)" strokeWidth={1.2} opacity={l.k} />); }
    els.push(<Box key={key++} x={x} y={y} text={l.text} k={l.k} size={l.size ?? 28} teal={l.teal} box={l.box ?? false} />);
  }
  // scale bar
  if (ov.scale && ov.scale.k > 0.001) {
    const q = projR(view, view.look, ov.scale.mly);
    if (q) {
      const L = Math.min(500, q.r), x1 = 1780, x0 = x1 - L, y = 1000;
      els.push(<g key={key++} opacity={ov.scale.k}><line x1={x0} y1={y} x2={x1} y2={y} stroke="rgba(255,255,255,0.85)" strokeWidth={1.5} /><line x1={x0} y1={y - 8} x2={x0} y2={y + 8} stroke="white" strokeWidth={1.5} /><line x1={x1} y1={y - 8} x2={x1} y2={y + 8} stroke="white" strokeWidth={1.5} /></g>);
      els.push(<Box key={key++} x={(x0 + x1) / 2} y={y - 32} text={ov.scale.text} k={ov.scale.k} size={22} box={false} />);
    }
  }
  if (ov.counter && ov.counter.k > 0.001) els.push(<Box key={key++} x={1640} y={90} text={ov.counter.text} k={ov.counter.k} size={26} />);
  // 1986 wedge map
  if (ov.wedge && ov.wedge.k > 0.001) {
    const cx = 960, cy = 1010, R = 860, w = ov.wedge;
    const arc = (r: number) => `M${cx + r * Math.sin(-1.08)} ${cy - r * Math.cos(-1.08)} A${r} ${r} 0 0 1 ${cx + r * Math.sin(1.08)} ${cy - r * Math.cos(1.08)}`;
    els.push(
      <g key={key++} opacity={w.k}>
        <path d={`M${cx} ${cy} L${cx + R * Math.sin(-1.08)} ${cy - R * Math.cos(-1.08)}`} stroke="rgba(255,255,255,0.5)" strokeWidth={1.2} />
        <path d={`M${cx} ${cy} L${cx + R * Math.sin(1.08)} ${cy - R * Math.cos(1.08)}`} stroke="rgba(255,255,255,0.5)" strokeWidth={1.2} />
        <path d={arc(R)} stroke="rgba(255,255,255,0.5)" strokeWidth={1.2} fill="none" />
        <path d={arc(R * w.sweep)} stroke={TEAL} strokeOpacity={0.6 * (1 - w.bubbles)} strokeWidth={1.5} fill="none" />
        {wedgeDots.filter((d) => d[0] < w.sweep).map((d, i) => <circle key={i} cx={cx + d[0] * R * Math.sin(d[1])} cy={cy - d[0] * R * Math.cos(d[1])} r={1.7 + d[2] * 2.2} fill="rgba(240,246,255,0.92)" />)}
        {wedgeVoids.map((v, i) => { const x = cx + v.r * R * Math.sin(v.a), y = cy - v.r * R * Math.cos(v.a), rr = v.s * R * 0.8; const C = 2 * Math.PI * rr; return <circle key={`v${i}`} cx={x} cy={y} r={rr} fill="none" stroke={TEAL} strokeWidth={1.6} strokeDasharray={`${C * Math.min(1, Math.max(0, w.bubbles * 1.5 - i * 0.08))} ${C}`} />; })}
        <circle cx={cx} cy={cy} r={5} fill={TEAL} />
      </g>,
    );
    els.push(<Box key={key++} x={cx} y={cy + 38} text="ما" k={w.k} teal size={22} box={false} />);
  }
  // soap foam rims on the slice
  if (ov.foam && ov.foam.k > 0.001) {
    BIG_VOIDS.filter((v) => Math.abs(v.c[1]) < v.r * 0.6).forEach((v, i) => {
      const rr = Math.sqrt(Math.max(0, v.r * v.r - v.c[1] * v.c[1])) * 0.8;
      const q = projR(view, [v.c[0], 0, v.c[2]], rr);
      if (!q || q.x < -q.r || q.x > WD + q.r || q.y < -q.r || q.y > HT + q.r) return;
      els.push(
        <g key={key++} opacity={ov.foam!.k * 0.85}>
          <circle cx={q.x} cy={q.y} r={q.r} fill="url(#film)" />
          <circle cx={q.x} cy={q.y} r={q.r} fill="none" stroke="url(#irid)" strokeWidth={2.2} />
          <path d={`M${q.x - q.r * 0.62} ${q.y - q.r * 0.45} A${q.r * 0.78} ${q.r * 0.78} 0 0 1 ${q.x - q.r * 0.05} ${q.y - q.r * 0.76}`} stroke="rgba(255,255,255,0.75)" strokeWidth={3} strokeLinecap="round" fill="none" />
        </g>,
      );
      void i;
    });
  }
  // stretching grid (dark energy vs gravity)
  if (ov.grid && ov.grid.k > 0.001) {
    const [a] = PAIR;
    const qv = projR(view, a.c, a.r);
    const ax = norm(sub(PAIR[1].c, a.c));
    const qc = P(view, add(lerp(a.c, PAIR[1].c), mul(ax, -(len(sub(PAIR[1].c, a.c)) / 2 + a.r + 30))));
    if (qv && qc) {
      const s = ov.grid.stretch;
      const warp = (x: number, y: number) => {
        const dx = x - qv.x, dy = y - qv.y, r = Math.hypot(dx, dy) || 1;
        const push = s * 0.5 * qv.r * Math.exp(-Math.pow(r / (1.15 * qv.r), 2)) * Math.min(1, r / (0.3 * qv.r));
        let X = x + (dx / r) * push, Y = y + (dy / r) * push;
        const cx = qc.x - X, cy = qc.y - Y, rc = Math.hypot(cx, cy) || 1;
        const pull = s * 0.22 * qv.r * Math.exp(-Math.pow(rc / (0.5 * qv.r), 2));
        X += (cx / rc) * pull; Y += (cy / rc) * pull;
        return [X, Y];
      };
      const lines: string[] = [];
      for (let gx = -40; gx <= WD + 40; gx += 64) { let d = ""; for (let y = -40; y <= HT + 40; y += 16) { const [X, Y] = warp(gx, y); d += `${d ? "L" : "M"}${X.toFixed(1)} ${Y.toFixed(1)}`; } lines.push(d); }
      for (let gy = -40; gy <= HT + 40; gy += 64) { let d = ""; for (let x = -40; x <= WD + 40; x += 16) { const [X, Y] = warp(x, gy); d += `${d ? "L" : "M"}${X.toFixed(1)} ${Y.toFixed(1)}`; } lines.push(d); }
      els.push(<g key={key++} opacity={ov.grid.k}>{lines.map((d, i) => <path key={i} d={d} stroke={TEAL} strokeOpacity={0.22} strokeWidth={1.1} fill="none" />)}</g>);
    }
  }
  // a light wave crossing the supervoid
  if (ov.photon && ov.photon.k > 0.001) {
    const q = projR(view, BOO.c, BOO.r);
    const y0 = q ? q.y : 540, xa = q ? q.x - q.r : 700, xb = q ? q.x + q.r : 1220;
    const xEnd = -40 + (WD + 80) * ov.photon.prog;
    let ph = 0, prev: [number, number] | null = null;
    const segs: React.ReactNode[] = [];
    for (let x = -40; x <= xEnd; x += 4) {
      const inside = Math.min(1, Math.max(0, (x - xa) / (xb - xa)));
      const lam = 46 * (1 + 0.45 * inside);
      ph += (2 * Math.PI * 4) / lam;
      const y = y0 + 22 * Math.sin(ph);
      if (prev) {
        const c = inside;
        const col = `rgb(${Math.round(190 + 65 * c)},${Math.round(225 - 60 * c)},${Math.round(255 - 140 * c)})`;
        segs.push(<line key={x} x1={prev[0]} y1={prev[1]} x2={x} y2={y} stroke={col} strokeWidth={2.4} strokeLinecap="round" />);
      }
      prev = [x, y];
    }
    els.push(<g key={key++} opacity={ov.photon.k} filter="url(#glow)">{segs}</g>);
    if (prev) els.push(<circle key={key++} cx={prev[0]} cy={prev[1]} r={6} fill="#fff" opacity={ov.photon.k} />);
  }
  // dark energy rays
  if (ov.rays && ov.rays.k > 0.001) {
    const k = ov.rays.k, paths: React.ReactNode[] = [];
    for (let i = 0; i < 44; i++) {
      const a0 = (i / 44) * Math.PI * 2;
      let d = "";
      for (let r = 30; r < 1200; r += 24) { const a = a0 + 0.35 * Math.sin(r / 260 + i) * (r / 1200) + 0.0006 * r; d += `${d ? "L" : "M"}${(960 + Math.cos(a) * r).toFixed(1)} ${(540 + Math.sin(a) * r * 0.75).toFixed(1)}`; }
      paths.push(<path key={i} d={d} stroke={TEAL} strokeOpacity={0.28} strokeWidth={1.2} fill="none" strokeDasharray={`${1400 * k} 2000`} />);
    }
    els.push(<g key={key++} opacity={Math.min(1, k * 1.5)}>{paths}</g>);
  }
  if (ov.frame && ov.frame.k > 0.001) {
    const k = ov.frame.k, x0 = 470, y0 = 170, x1 = 1450, y1 = 880, L = 46;
    const c = (x: number, y: number, sx: number, sy: number) => `M${x} ${y + sy * L} L${x} ${y} L${x + sx * L} ${y}`;
    els.push(<g key={key++} opacity={k} stroke="rgba(255,255,255,0.75)" strokeWidth={1.6} fill="none"><path d={c(x0, y0, 1, 1)} /><path d={c(x1, y0, -1, 1)} /><path d={c(x0, y1, 1, -1)} /><path d={c(x1, y1, -1, -1)} /><path d="M950 540 L970 540 M960 530 L960 550" /></g>);
    els.push(<Box key={key++} x={x0 + 80} y={y1 + 30} text="شبیه‌سازی" k={k * 0.8} size={20} box={false} />);
  }
  // empty zone around the lonely galaxy (screen-centred)
  if (ov.voidRing && ov.voidRing.k > 0.001) {
    const r = ov.voidRing.r, C = 2 * Math.PI * r;
    els.push(<circle key={key++} cx={960} cy={540} r={r} fill="none" stroke={TEAL} strokeOpacity={0.75} strokeWidth={1.6} strokeDasharray={`${C * Math.min(1, ov.voidRing.k * 1.2)} ${C}`} transform="rotate(-90 960 540)" opacity={ov.voidRing.k} />);
  }
  if (ov.photo && ov.photo.k > 0.001 && ov.photo.crop < 0.99) {
    els.push(<text key={key++} x={1880} y={1050} textAnchor="end" fontFamily="Inter, Arial, sans-serif" fontSize={17} fill="rgba(255,255,255,0.6)" opacity={ov.photo.k * (1 - ov.photo.crop)}>Image: ESA/Hubble &amp; NASA, N. Grogin (STScI) — CC BY 4.0</text>);
  }
  // growth field: matter flowing towards denser spots (arrows along the displacement field) + named structures
  if (ov.zel && ov.zel.k > 0.001 && zel) {
    const D = ov.zel.D;
    const pos = (i: number): V3 => [zel[i * 5] + D * zel[i * 5 + 2], zel[i * 5 + 1] + D * zel[i * 5 + 3], 0];
    if (ov.zel.flow > 0.001) {
      zelPts.arrows.forEach((i, j) => {
        const a = P(view, pos(i)); if (!a) return;
        const L = 6.5 * Math.hypot(zel[i * 5 + 2], zel[i * 5 + 3]) / zelPts.maxPsi;
        const dir = Math.atan2(zel[i * 5 + 3], zel[i * 5 + 2]);
        const b = P(view, [pos(i)[0] + Math.cos(dir) * L, pos(i)[1] + Math.sin(dir) * L, 0]); if (!b) return;
        const k = Math.min(1, ov.zel!.flow * 1.4 - (j % 9) * 0.04);
        if (k <= 0) return;
        const ex = a.x + (b.x - a.x) * k, ey = a.y + (b.y - a.y) * k, ang = Math.atan2(b.y - a.y, b.x - a.x);
        els.push(<g key={key++} opacity={0.9 * ov.zel!.flow}><line x1={a.x} y1={a.y} x2={ex} y2={ey} stroke="rgba(255,255,255,0.85)" strokeWidth={1.7} /><path d={`M${ex} ${ey} L${ex - 7 * Math.cos(ang - 0.5)} ${ey - 7 * Math.sin(ang - 0.5)} M${ex} ${ey} L${ex - 7 * Math.cos(ang + 0.5)} ${ey - 7 * Math.sin(ang + 0.5)}`} stroke="rgba(255,255,255,0.8)" strokeWidth={1.3} fill="none" /></g>);
      });
    }
    for (const l of ov.zel.labels) {
      if (l.k <= 0.001) continue;
      const a = P(view, pos(zelPts[l.kind])); if (!a) continue;
      els.push(<circle key={key++} cx={a.x} cy={a.y} r={14} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={1.4} opacity={l.k} />);
      els.push(<line key={key++} x1={a.x} y1={a.y - 14} x2={a.x} y2={a.y - 60} stroke="rgba(255,255,255,0.6)" strokeWidth={1.2} opacity={l.k} />);
      els.push(<Box key={key++} x={a.x} y={a.y - 82} text={l.text} k={l.k} size={26} />);
    }
  }
  // quiet target marks (corner brackets) on lonely galaxies
  for (const g of ov.targets ?? []) {
    if (g.k <= 0.001) continue;
    const a = P(view, g.at); if (!a) continue;
    const s = 26, L = 9;
    const c = (sx: number, sy: number) => `M${a.x + sx * s} ${a.y + sy * (s - L)} L${a.x + sx * s} ${a.y + sy * s} L${a.x + sx * (s - L)} ${a.y + sy * s}`;
    els.push(<g key={key++} opacity={g.k} stroke="rgba(190,225,255,0.85)" strokeWidth={1.4} fill="none"><path d={c(-1, -1)} /><path d={c(1, -1)} /><path d={c(-1, 1)} /><path d={c(1, 1)} /></g>);
    if (g.text) els.push(<Box key={key++} x={a.x} y={a.y - 50} text={g.text} k={g.k} size={24} />);
  }
  if (ov.title && ov.title.k > 0.001) {
    const k = ov.title.k;
    els.push(
      <g key={key++} opacity={k} transform={`translate(960 520) scale(${1.04 - 0.04 * k})`}>
        <text x={0} y={0} textAnchor="middle" direction="rtl" fontFamily={FONT_TEXT} fontSize={104} fill="#f2f6fa" filter="url(#softGlow)">ترسناک‌ترین جای جهان</text>
        <line x1={-260 * k} y1={50} x2={260 * k} y2={50} stroke="rgba(255,255,255,0.5)" strokeWidth={1.2} />
        <text x={0} y={104} textAnchor="middle" direction="rtl" fontFamily={FONT_TEXT} fontSize={34} fill="rgba(220,232,240,0.75)">حفره‌های کیهانی</text>
      </g>,
    );
  }
  if (ov.close && ov.close.k > 0.001) {
    const r = 1300 - 1150 * ov.close.k;
    els.push(
      <g key={key++}>
        <defs><radialGradient id="closeG" cx={960} cy={540} r={r} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#000" stopOpacity={0} /><stop offset="0.55" stopColor="#000" stopOpacity={0.15} /><stop offset="1" stopColor="#000" stopOpacity={1} /></radialGradient></defs>
        <rect x={0} y={0} width={WD} height={HT} fill="url(#closeG)" />
      </g>,
    );
  }
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${WD} ${HT}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="tealGlow"><stop offset="0" stopColor={TEAL} stopOpacity={0.55} /><stop offset="1" stopColor={TEAL} stopOpacity={0} /></radialGradient>
        <radialGradient id="film"><stop offset="0.7" stopColor="#ffffff" stopOpacity={0} /><stop offset="0.93" stopColor="#bfe9ff" stopOpacity={0.06} /><stop offset="1" stopColor="#ffffff" stopOpacity={0.12} /></radialGradient>
        <linearGradient id="irid" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity={0.8} /><stop offset="0.35" stopColor={TEAL} stopOpacity={0.55} /><stop offset="0.65" stopColor="#c8a8ff" stopOpacity={0.45} /><stop offset="1" stopColor="#ffffff" stopOpacity={0.25} /></linearGradient>
        <filter id="glow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="softGlow" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="10" result="b" /><feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.6 0" result="c" /><feMerge><feMergeNode in="c" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      {els}
    </svg>
  );
};
const lerp = (a: V3, b: V3): V3 => mul(add(a, b), 0.5);
