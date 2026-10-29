import React from "react";
import { BG, INK } from "./body";
import { clamp, hn, smooth, type V } from "./geom";

// Heads are drawn in local space: origin = bottom-centre (neck), up = −y.
// Face features are authored in FRONT view and projected onto a cylinder / sphere
// rotated by `yaw` (−1..1 ≈ ±60°) — that is what makes real 3/4 head turns possible.

const FW = 3.6; // face line weight
const DARK = "#23241e";
const TONGUE = "#767a64";

type Proj = ReturnType<typeof projector>;
function projector(yaw: number, R: (y: number) => number) {
  const phi = yaw * 1.05;
  const th = (x: number, y: number) => Math.asin(clamp(x / R(y), -1, 1));
  // points turning past the silhouette pile up on the edge instead of wrapping round the back
  const H = Math.PI / 2;
  const P = (x: number, y: number, d = 0): V => [(R(y) + d) * Math.sin(clamp(th(x, y) + phi, -H, H)), y];
  const A = (a: number, y: number, d = 0): V => [(R(y) + d) * Math.sin(clamp(a + phi, -H, H)), y];
  const vis = (x: number, y: number) => Math.cos(th(x, y) + phi);
  const visA = (a: number) => Math.cos(a + phi);
  const ell = (cx: number, cy: number, rx: number, ry: number, n = 24, d = 0): V[] =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return P(cx + rx * Math.cos(a), cy + ry * Math.sin(a), d);
    });
  const line = (pts: V[], d = 0) => smooth(pts.map(([x, y]) => P(x, y, d)), false);
  const shape = (pts: V[], d = 0) => smooth(pts.map(([x, y]) => P(x, y, d)), true);
  return { phi, P, A, vis, visA, ell, line, shape };
}

export type EyeProps = {
  pr: Proj;
  id: string;
  c: V;
  rx: number;
  ry: number;
  lids: number; // 0 open → 1 closed
  look: V; // −1..1
  pupil: number;
  lash?: number; // 0 none, ±1 which side the lashes flick to
  bag?: boolean;
};

const Eye: React.FC<EyeProps> = ({ pr, id, c, rx, ry, lids, look, pupil, lash = 0, bag }) => {
  const [cx, cy] = c;
  const v = pr.vis(cx, cy);
  if (v < 0.08) return null;
  const lashes =
    lash !== 0 ? (
      <g stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none">
        {[0, 1, 2].map((i) => {
          const a = cy - ry * 0.25 + i * 5 - lids * ry * 0.6;
          return <path key={i} d={pr.line([[cx + lash * rx * 0.92, a], [cx + lash * (rx + 7), a - 4 + i * 2], [cx + lash * (rx + 13), a - 7 + i * 4]])} />;
        })}
      </g>
    ) : null;
  if (lids >= 0.92) {
    return (
      <g>
        <path d={pr.line([[cx - rx, cy + 1], [cx, cy + ry * 0.32], [cx + rx, cy + 1]])} fill="none" stroke={INK} strokeWidth={FW + 0.4} strokeLinecap="round" />
        {lashes}
      </g>
    );
  }
  const outline = smooth(pr.ell(cx, cy, rx, ry), true);
  const px = cx + clamp(look[0], -1, 1) * rx * 0.52;
  const py = cy + clamp(look[1], -1, 1) * ry * 0.5;
  const pp = pr.P(px, py, 1);
  const pv = Math.max(0.35, pr.vis(px, py));
  const lidY = cy - ry + lids * 2 * ry;
  const lidLine: V[] = [[cx - rx * 1.15, lidY - 1], [cx, lidY + ry * 0.1], [cx + rx * 1.15, lidY - 1]];
  const lidCap: V[] = [...lidLine, [cx + rx * 1.2, cy - ry * 1.4], [cx - rx * 1.2, cy - ry * 1.4]];
  return (
    <g>
      <clipPath id={id}>
        <path d={outline} />
      </clipPath>
      <path d={outline} fill={BG} />
      <g clipPath={`url(#${id})`}>
        <ellipse cx={pp[0]} cy={pp[1]} rx={pupil * pv} ry={pupil} fill={INK} />
        {lids > 0.02 && (
          <>
            <path d={pr.shape(lidCap)} fill={BG} />
            <path d={pr.line(lidLine)} fill="none" stroke={INK} strokeWidth={FW + 0.6} />
          </>
        )}
      </g>
      <path d={outline} fill="none" stroke={INK} strokeWidth={FW} />
      {bag && <path d={pr.line([[cx - rx * 0.6, cy + ry + 4], [cx, cy + ry + 7], [cx + rx * 0.6, cy + ry + 4]])} fill="none" stroke={INK} strokeWidth={2.2} strokeLinecap="round" />}
      {lashes}
    </g>
  );
};

// =============================================================================
// GUY — tall marshmallow head, big touching eyes, bulb nose, side-swept hair lock.
// =============================================================================
export type GuyFace = {
  yaw: number;
  look: V;
  lids: number;
  brow: number;
  mouth: "neutral" | "smile" | "grin" | "bigGrin" | "o" | "smug" | "flat" | "talk" | "grr";
  open?: number; // 0..1 jaw opening while talking
  angry?: number; // 0..1 inner brow ends pulled down
  blush: number;
  wet: number;
  seed: number;
};

const GUY_OUTLINE =
  "M-54 -32 C-56 -80 -60 -120 -57 -152 C-55 -185 -30 -191 0 -191 C30 -191 55 -185 57 -152 C60 -120 56 -80 54 -32 C53 -6 40 0 22 1 L-22 1 C-40 0 -53 -6 -54 -32 Z";

/** Open talking mouth: smile curve on top, jaw drops with `open`. Shared by both heads. */
function talkMouth(pr: Proj, id: string, cx: number, cy: number, w: number, open: number, smile: number) {
  const o = Math.max(0.12, open);
  const up: V[] = [[cx - w, cy - smile * 6], [cx - w * 0.35, cy + 1], [cx + w * 0.35, cy + 1], [cx + w, cy - smile * 6]];
  const lo: V[] = [[cx + w * 0.8, cy + 2 + o * 6], [cx + w * 0.3, cy + 4 + o * w * 0.95], [cx - w * 0.3, cy + 4 + o * w * 0.95], [cx - w * 0.8, cy + 2 + o * 6]];
  const d = pr.shape([...up, ...lo]);
  return (
    <g>
      <clipPath id={id}>
        <path d={d} />
      </clipPath>
      <path d={d} fill={DARK} />
      <g clipPath={`url(#${id})`}>
        {o > 0.35 && <path d={pr.shape([[cx - w * 1.1, cy - 12], [cx + w * 1.1, cy - 12], [cx + w * 1.1, cy + 4], [cx - w * 1.1, cy + 4]])} fill={BG} />}
        <path d={smooth(pr.ell(cx, cy + 4 + o * w * 0.95, w * 0.55, w * 0.3), true)} fill={TONGUE} />
      </g>
      <path d={d} fill="none" stroke={INK} strokeWidth={FW} strokeLinejoin="round" />
    </g>
  );
}

function guyMouth(pr: Proj, m: GuyFace["mouth"], id: string, open = 0) {
  const stroke = { fill: "none", stroke: INK, strokeWidth: FW, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const crease = (x: number, y: number, s: number) => <path d={pr.line([[x, y - 6], [x + s * 4, y], [x + s * 1, y + 6]])} {...stroke} strokeWidth={2.6} />;
  if (m === "talk")
    return open < 0.08 ? (
      <g>
        <path d={pr.line([[-30, -68], [-14, -57], [6, -55], [26, -60], [34, -70]])} {...stroke} />
        {crease(36, -70, 1)}
      </g>
    ) : (
      talkMouth(pr, id, 2, -64, 28, open, 1.2)
    );
  if (m === "grr") return <path d={pr.line([[-20, -56], [-6, -62], [8, -62], [20, -55]])} {...stroke} />;
  if (m === "flat")
    return (
      <g>
        <path d={pr.line([[-20, -60], [0, -60], [20, -61]])} {...stroke} />
      </g>
    );
  if (m === "neutral")
    return (
      <g>
        <path d={pr.line([[-22, -62], [-6, -58], [10, -59], [24, -64]])} {...stroke} />
        {crease(26, -64, 1)}
      </g>
    );
  if (m === "smile")
    return (
      <g>
        <path d={pr.line([[-32, -70], [-15, -57], [6, -54], [26, -60], [35, -71]])} {...stroke} />
        {crease(-34, -70, -1)}
        {crease(37, -71, 1)}
      </g>
    );
  if (m === "o") {
    const o = smooth(pr.ell(4, -56, 9, 11), true);
    return <path d={o} fill={DARK} stroke={INK} strokeWidth={FW} />;
  }
  if (m === "smug") {
    const up: V[] = [[-30, -63], [-8, -60], [14, -62], [37, -75]];
    const lo: V[] = [[31, -62], [12, -52], [-10, -53], [-27, -59]];
    const d = pr.shape([...up, ...lo]);
    return (
      <g>
        <path d={d} fill={BG} {...{ stroke: INK, strokeWidth: FW, strokeLinejoin: "round" as const }} />
        {[-14, 0, 14].map((x) => (
          <path key={x} d={pr.line([[x, -60 - (x > 0 ? x * 0.12 : 0)], [x + 1, -55 - (x > 0 ? x * 0.1 : 0)]])} {...stroke} strokeWidth={2.2} />
        ))}
        {crease(39, -76, 1)}
      </g>
    );
  }
  const big = m === "bigGrin";
  const k = big ? 1.25 : 1;
  const up: V[] = [[-32 * k, -69 - (k - 1) * 8], [-11 * k, -64 - (k - 1) * 4], [11 * k, -64 - (k - 1) * 4], [32 * k, -70 - (k - 1) * 8]];
  const lo: V[] = [[28 * k, -56], [11 * k, -40 - (k - 1) * 30], [-11 * k, -40 - (k - 1) * 30], [-28 * k, -56]];
  const d = pr.shape([...up, ...lo]);
  return (
    <g>
      <clipPath id={id}>
        <path d={d} />
      </clipPath>
      <path d={d} fill={DARK} />
      <g clipPath={`url(#${id})`}>
        <path d={pr.shape([[-34 * k, -76], [34 * k, -78], [34 * k, -61 - (k - 1) * 6], [-34 * k, -60 - (k - 1) * 6]])} fill={BG} />
        <path d={smooth(pr.ell(2, -40 - (k - 1) * 26, 15 * k, 8 * k), true)} fill={TONGUE} />
      </g>
      <path d={d} fill="none" stroke={INK} strokeWidth={FW} strokeLinejoin="round" />
      {crease(-34 * k, -70 - (k - 1) * 8, -1)}
      {crease(34 * k, -71 - (k - 1) * 8, 1)}
    </g>
  );
}

export const GuyHead: React.FC<{ f: GuyFace; id: string }> = ({ f, id }) => {
  const pr = projector(f.yaw, () => 57);
  const s = { fill: "none", stroke: INK, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  // angry: the inner ends (towards the nose) drop, the outer ends lift
  const brow = (cx: number) => {
    const a = (f.angry ?? 0) * 15;
    const inner = cx < 0 ? 1 : -1;
    return pr.line([[cx - 17, -156 - f.brow * 0.6 + (inner < 0 ? a : -a * 0.4)], [cx, -163 - f.brow], [cx + 17, -156 - f.brow * 0.6 + (inner > 0 ? a : -a * 0.4)]]);
  };
  // side hair locks, authored in angle space (± side of the cylinder)
  const lock = (side: number) => {
    const pts: [number, number][] = [[1.62, -178], [1.24, -182], [1.13, -152], [1.16, -118], [1.24, -98], [1.44, -95], [1.62, -110]];
    return smooth(pts.map(([a, y]) => pr.A(side * a, y, 3)), true);
  };
  const tuftVis = pr.visA(0) > -0.2;
  return (
    <g>
      <clipPath id={`${id}-h`}>
        <path d={GUY_OUTLINE} />
      </clipPath>
      {/* hair tuft sticking above the head */}
      {tuftVis && (
        <g {...s} strokeWidth={FW}>
          <path d={pr.line([[-14, -188], [-12, -203], [-3, -192]])} />
          <path d={pr.line([[-3, -191], [6, -209], [11, -192]])} />
          <path d={pr.line([[11, -190], [22, -200], [22, -188]])} />
        </g>
      )}
      <path d={GUY_OUTLINE} fill={BG} stroke={INK} strokeWidth={4.2} strokeLinejoin="round" />
      <g clipPath={`url(#${id}-h)`}>
        {/* hairline + strands */}
        <path d={pr.line([[-57, -146], [-40, -160], [-22, -152], [-4, -165], [16, -156], [34, -167], [57, -150]])} {...s} strokeWidth={FW} />
        <path d={pr.line([[-12, -190], [-20, -176], [-24, -166]])} {...s} strokeWidth={2.4} />
        <path d={pr.line([[26, -190], [20, -178], [18, -170]])} {...s} strokeWidth={2.4} />
        {[1, -1].map((side) =>
          pr.visA(side * 1.25) > 0.05 ? <path key={side} d={lock(side)} fill={BG} stroke={INK} strokeWidth={FW} strokeLinejoin="round" /> : null,
        )}
        <Eye pr={pr} id={`${id}-el`} c={[-22, -126]} rx={22} ry={29} lids={f.lids} look={f.look} pupil={6} />
        <Eye pr={pr} id={`${id}-er`} c={[22, -126]} rx={22} ry={29} lids={f.lids} look={f.look} pupil={6} />
        {pr.vis(-20, -150) > 0.1 && <path d={brow(-20.5)} {...s} strokeWidth={(f.angry ?? 0) > 0.5 ? 4.4 : 3} />}
        {pr.vis(20, -150) > 0.1 && <path d={brow(20.5)} {...s} strokeWidth={(f.angry ?? 0) > 0.5 ? 4.4 : 3} />}
        {guyMouth(pr, f.mouth, `${id}-m`, f.open)}
        {f.blush > 0.01 && (
          <g {...s} strokeWidth={2.4} opacity={f.blush}>
            {[-46, -38, -30].map((x) => (
              <path key={x} d={pr.line([[x - 3, -84], [x + 3, -73]])} />
            ))}
          </g>
        )}
      </g>
      {/* bulb nose + nostril — outside the head clip so it sticks out past the face in profile */}
      <g clipPath={Math.abs(f.yaw) < 0.5 ? `url(#${id}-h)` : undefined}>
        <path d={smooth(pr.ell(4, -93, 20.5, 18, 22, 18), true)} fill={BG} stroke={INK} strokeWidth={FW} />
        <circle cx={pr.P(-4, -99, 19)[0]} cy={-99} r={2.4} fill={INK} opacity={0.9} />
      </g>
      {/* wet: little rain ticks bouncing off the top */}
      {f.wet > 0.05 &&
        [0, 1, 2, 3].map((i) => {
          const x = -40 + i * 27 + hn(i, f.seed) * 8;
          const y = -196 - Math.abs(hn(i + 9, f.seed)) * 8;
          return <path key={i} d={`M${x - 3} ${y - 3} L${x} ${y} L${x + 3} ${y - 3}`} {...s} strokeWidth={2} opacity={f.wet} />;
        })}
    </g>
  );
};

// =============================================================================
// GIRL — round head, sleepy lids + lashes, button nose, spiky wet fringe, ponytail.
// =============================================================================
export type GirlFace = {
  yaw: number;
  look: V;
  lids: number;
  worry: number; // +1 worried brows, −1 annoyed/flat
  mouth: "frown" | "flat" | "o" | "wobble" | "talk" | "happy";
  open?: number; // 0..1 while talking
  smile?: number; // −1 sad corners … +1 happy
  pony: number; // ponytail swing deg
  wet: number;
  seed: number;
};

const GCY = -72;
const GRX = 66;
const GRY = 71;
const girlR = (y: number) => GRX * Math.sqrt(Math.max(0.04, 1 - ((y - GCY) / GRY) ** 2));
const GIRL_OUTLINE = smooth(
  Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2;
    const jaw = Math.sin(a) > 0 ? 1 - 0.06 * Math.sin(a) ** 3 : 1;
    return [GRX * Math.cos(a) * jaw, GCY + GRY * Math.sin(a)] as V;
  }),
  true,
);

export const GirlHead: React.FC<{ f: GirlFace; id: string }> = ({ f, id }) => {
  const pr = projector(f.yaw * 0.9, girlR);
  const s = { fill: "none", stroke: INK, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const brow = (cx: number, inner: number) =>
    pr.line([[cx - inner * 16, -106], [cx, -110 - f.worry * 1.5], [cx + inner * 16, -106 - f.worry * 7]]);
  const ear = (side: number) => {
    const a = side * 1.5;
    const v = pr.visA(a);
    if (v < -0.4) return null;
    const [x] = pr.A(a, -64, 6);
    const w = 11 * Math.max(0.45, Math.abs(Math.sin(a + pr.phi)));
    const sx = Math.sign(x) || side;
    return (
      <g key={side}>
        <ellipse cx={x} cy={-64} rx={w} ry={14} fill={BG} stroke={INK} strokeWidth={FW} />
        <path d={`M${x + sx * w * 0.35} ${-71} Q${x - sx * w * 0.2} ${-64} ${x + sx * w * 0.3} ${-57}`} {...s} strokeWidth={2.4} />
      </g>
    );
  };
  // ponytail hangs off the back, on the side opposite the face
  const back = f.yaw >= -0.05 ? -1 : 1;
  const px = back * (50 + 14 * Math.min(1, Math.abs(f.yaw) * 1.6));
  const pony = smooth(
    [[0, -8], [back * 22, -6], [back * 40, 16], [back * 44, 58], [back * 36, 100], [back * 28, 112], [back * 26, 92], [back * 22, 50], [back * 10, 14]],
    true,
  );
  const wetTicks = f.wet > 0.05;
  return (
    <g>
      <clipPath id={`${id}-h`}>
        <path d={GIRL_OUTLINE} />
      </clipPath>
      <g transform={`translate(${px} -122) rotate(${f.pony})`}>
        <path d={pony} fill={BG} stroke={INK} strokeWidth={FW + 0.4} strokeLinejoin="round" />
        <path d={smooth([[back * 12, 6], [back * 26, 40], [back * 28, 86]], false)} {...s} strokeWidth={2.2} />
      </g>
      {ear(-1)}
      {ear(1)}
      <path d={GIRL_OUTLINE} fill={BG} stroke={INK} strokeWidth={4.2} />
      <g clipPath={`url(#${id}-h)`}>
        {/* ponytail tie shows through at the back edge */}
        <path d={pr.line([[-66, -112], [-44, -126], [-26, -114], [-10, -130], [6, -117], [24, -131], [42, -117], [56, -127], [66, -108]])} {...s} strokeWidth={FW} />
        <path d={pr.line([[-30, -140], [-18, -126]])} {...s} strokeWidth={2.2} />
        <path d={pr.line([[12, -142], [20, -128]])} {...s} strokeWidth={2.2} />
        <Eye pr={pr} id={`${id}-el`} c={[-23, -80]} rx={19.5} ry={20.5} lids={f.lids} look={f.look} pupil={4.6} lash={-1} bag />
        <Eye pr={pr} id={`${id}-er`} c={[23, -80]} rx={19.5} ry={20.5} lids={f.lids} look={f.look} pupil={4.6} lash={1} bag />
        {pr.vis(-23, -106) > 0.1 && <path d={brow(-23, 1)} {...s} strokeWidth={2.8} />}
        {pr.vis(23, -106) > 0.1 && <path d={brow(23, -1)} {...s} strokeWidth={2.8} />}
        <path d={smooth(pr.ell(5, -54, 9.5, 8.5, 18, 8), true)} fill={BG} stroke={INK} strokeWidth={FW} />
        {f.mouth === "talk" || f.mouth === "happy" ? (
          (f.open ?? 0) < 0.08 && f.mouth === "talk" ? (
            <path d={pr.line([[-10, -33 + (f.smile ?? 0) * 3], [0, -35], [10, -33 + (f.smile ?? 0) * 3]])} {...s} strokeWidth={FW} />
          ) : (
            talkMouth(pr, `${id}-m`, 2, -37, f.mouth === "happy" ? 17 : 11, f.mouth === "happy" ? Math.max(0.45, f.open ?? 0) : (f.open ?? 0), f.mouth === "happy" ? 1.3 : (f.smile ?? 0))
          )
        ) : f.mouth === "o" ? (
          <path d={smooth(pr.ell(3, -32, 5.5, 7), true)} fill={DARK} stroke={INK} strokeWidth={3} />
        ) : (
          <path
            d={pr.line(
              f.mouth === "frown"
                ? [[-11, -31], [-3, -35], [8, -34], [13, -30]]
                : f.mouth === "wobble"
                  ? [[-11, -33], [-5, -36], [0, -32], [5, -36], [11, -33]]
                  : [[-9, -33], [0, -34], [10, -33]],
            )}
            {...s}
            strokeWidth={FW}
          />
        )}
      </g>
      {/* wet crown: tiny splash ticks and stray curls */}
      <g {...s} strokeWidth={2.2}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = Math.PI * (1.12 + i * 0.152);
          const x = Math.cos(a) * (GRX + 7);
          const y = GCY + Math.sin(a) * (GRY + 7);
          const j = wetTicks ? hn(i, f.seed) * 2.5 : 0;
          return <path key={i} d={`M${x - 3 + j} ${y - 2} q3 ${4} 6 0`} opacity={0.35 + 0.65 * f.wet} />;
        })}
      </g>
    </g>
  );
};
