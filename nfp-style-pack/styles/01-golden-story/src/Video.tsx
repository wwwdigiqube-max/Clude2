import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { Inventory, NoiseMeter, Part2, Weeks } from "./cards";
import { Diagram } from "./Diagram";
import { C, clamp, eo, FPS, lerp, pr, rnd, shake, Wd, WdEnd } from "./lib";
import { FarmMap, MW, MH, P } from "./Map";
import { Pic } from "./Pic";
import { Burst, Captions, CountCard, Finish, Flash, Tag, TimeChip } from "./ui";

// ---------------- shot starts: cut 2 frames before the word that starts the shot ----------------
const cut = (line: number, w: string, pre = 0.07) => Wd(line, w) - pre;
export const T = {
  kitchen: 0,
  well: cut(1, "چون"),
  diagram: cut(1, "تأمین"),
  faucet: cut(2, "دیگه"),
  gen: cut(3, "الی", 0.1),
  genPunch: cut(3, "ولی"),
  mapQuiet: cut(4, "توی", 0.1),
  mapRings: cut(4, "صدای"),
  mapEyes: cut(4, "موقعیتش"),
  animals: cut(5, "تازه", 0.1),
  silent: cut(7, "یعنی"),
  chaos: cut(7, "ساکت"),
  gate: cut(8, "پس", 0.1),
  gather: cut(8, "حیوون‌ها"),
  inventory: cut(8, "شروع", 0.25),
  porch: cut(9, "با", 0.1),
  porchDark: cut(10, "ولی"),
  barn: cut(11, "یه"),
  part2: WdEnd(11, "بود") + 0.55,
};
export const END = T.part2 + 3.8;
export const V01_FRAMES = Math.ceil(END * FPS);

type Tin = "cut" | "whipL" | "whipR" | "whipU" | "zoom" | "dip";
type Shot = { at: number; tin: Tin; draw: (t: number) => React.ReactNode };

// ---------------- living decoration ----------------
const Motes: React.FC<{ t: number; x: number; y: number; w: number; h: number; n?: number; color?: string; size?: number; seed?: number; glow?: boolean }> = ({
  t,
  x,
  y,
  w,
  h,
  n = 26,
  color = "#FFE2A8",
  size = 6,
  seed = 1,
  glow,
}) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const r = (k: number) => rnd(seed * 100 + i * 7 + k);
      const px = x + ((r(1) * w + Math.sin(t * (0.3 + r(2)) + i) * 30 + t * 8 * (r(3) - 0.3)) % w + w) % w;
      const py = y + ((r(4) * h - t * (10 + r(5) * 18)) % h + h) % h;
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (1 + r(6) * 2) + i));
      const s = size * (0.5 + r(7));
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: px,
            top: py,
            width: s,
            height: s,
            borderRadius: s,
            background: color,
            opacity: tw * 0.8,
            boxShadow: glow ? `0 0 ${s * 3}px ${s}px ${color}` : undefined,
          }}
        />
      );
    })}
  </>
);

const Glow: React.FC<{ x: number; y: number; r: number; color: string; o: number }> = ({ x, y, r, color, o }) => (
  <div
    style={{
      position: "absolute",
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 70%)`,
      opacity: o,
      mixBlendMode: "screen",
    }}
  />
);

const RingPop: React.FC<{ t: number; t0: number; x: number; y: number; color?: string; max?: number }> = ({ t, t0, x, y, color = C.cream, max = 260 }) => {
  if (t < t0 || t > t0 + 0.6) return null;
  const p = eo(clamp((t - t0) / 0.6));
  const r = 30 + p * max;
  return <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, border: `${10 * (1 - p) + 2}px solid ${color}`, opacity: 1 - p }} />;
};

const SoundArcs: React.FC<{ t: number; t0: number; x: number; y: number; color?: string }> = ({ t, t0, x, y, color = C.cream }) => {
  if (t < t0) return null;
  return (
    <svg width={700} height={700} style={{ position: "absolute", left: x - 350, top: y - 350 }}>
      {[0, 1, 2, 3, 4, 5].map((j) => {
        const age = (t - t0 - j * 0.18) % 1.08;
        if (t - t0 - j * 0.18 < 0) return null;
        const r = 70 + age * 260;
        const o = 1 - age / 1.08;
        return (
          <g key={j} opacity={o} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round">
            <path d={`M ${350 - r * Math.cos(0.6)} ${350 - r * Math.sin(0.6)} A ${r} ${r} 0 0 0 ${350 - r * Math.cos(0.6)} ${350 + r * Math.sin(0.6)}`} />
            <path d={`M ${350 + r * Math.cos(0.6)} ${350 - r * Math.sin(0.6)} A ${r} ${r} 0 0 1 ${350 + r * Math.cos(0.6)} ${350 + r * Math.sin(0.6)}`} />
          </g>
        );
      })}
    </svg>
  );
};

const Drop: React.FC<{ t: number; t0: number; x: number; y: number; s?: number }> = ({ t, t0, x, y, s = 1 }) => {
  if (t < t0 || t > t0 + 0.55) return null;
  const lt = t - t0;
  const fall = lt < 0.15 ? 0 : 900 * (lt - 0.15) ** 2;
  const grow = clamp(lt / 0.15);
  return (
    <svg width={40} height={60} style={{ position: "absolute", left: x - 20 * s, top: y + fall, transform: `scale(${s * (0.5 + 0.5 * grow)})`, transformOrigin: "50% 0" }}>
      <path d="M20 2 C 30 20 34 30 34 38 A14 14 0 0 1 6 38 C 6 30 10 20 20 2 Z" fill="#CFE2DE" stroke="#1E120C" strokeWidth={3} opacity={1 - clamp((lt - 0.45) / 0.1)} />
    </svg>
  );
};

// ---------------- the shots ----------------
const SHOTS: Shot[] = [
  {
    at: T.kitchen,
    tin: "cut",
    draw: (t) => (
      <Pic src="v01/img/s01_kitchen.jpg" t={t} keys={[{ t: 0, x: 0.58, y: 0.4, z: 1.22 }, { t: T.well, x: 0.63, y: 0.36, z: 1.55, ease: eo }]}>
        {(m) => {
          const [wx, wy] = m(0.62, 0.12);
          return <Motes t={t} x={wx - 260} y={wy - 120} w={520} h={760} n={34} seed={1} />;
        }}
      </Pic>
    ),
  },
  {
    at: T.well,
    tin: "whipL",
    draw: (t) => (
      <Pic
        src="v01/img/s02_well.jpg"
        t={t}
        keys={[
          { t: T.well, x: 0.6, y: 0.22, z: 1.3 },
          { t: Wd(1, "چاه") + 0.05, x: 0.32, y: 0.62, z: 1.35, ease: eo },
          { t: T.diagram, x: 0.3, y: 0.64, z: 1.45 },
        ]}
      >
        {(m) => {
          const [x, y] = m(0.22, 0.64);
          return <Tag t={t} t0={Wd(1, "چاه")} x={x} y={y} text="چاه" />;
        }}
      </Pic>
    ),
  },
  {
    at: T.diagram,
    tin: "zoom",
    draw: (t) => (
      <Diagram
        t={t}
        keys={[
          { t: T.diagram, x: 0.55, y: 0.5, z: 1.0 },
          { t: Wd(1, "پمپش"), x: 0.58, y: 0.42, z: 1.18 },
          { t: Wd(1, "برق"), x: 0.42, y: 0.32, z: 1.22 },
          { t: Wd(2, "قطع") - 0.1, x: 0.35, y: 0.28, z: 1.3 },
          { t: Wd(2, "قطع") + 0.15, x: 0.3, y: 0.24, z: 1.5, ease: eo },
          { t: T.faucet, x: 0.55, y: 0.55, z: 1.15 },
        ]}
        labels={{ well: T.diagram + 0.3, pump: Wd(1, "پمپش"), power: Wd(1, "برق") }}
        cutAt={Wd(2, "قطع")}
        drainAt={Wd(2, "قطع") + 0.3}
      />
    ),
  },
  {
    at: T.faucet,
    tin: "dip",
    draw: (t) => (
      <Pic src="v01/img/s01_kitchen.jpg" t={t} grade={{ dark: 0.3, sat: 0.8 }} keys={[{ t: T.faucet, x: 0.7, y: 0.34, z: 2.3 }, { t: T.gen, x: 0.69, y: 0.36, z: 2.55 }]}>
        {(m) => {
          const [fx, fy] = m(0.703, 0.345);
          return (
            <>
              <Drop t={t} t0={T.faucet + 0.25} x={fx} y={fy} />
              <Drop t={t} t0={T.faucet + 1.0} x={fx} y={fy} s={0.8} />
              <Drop t={t} t0={Wd(2, "آب") - 0.1} x={fx} y={fy} s={0.55} />
              <Tag t={t} t0={Wd(2, "بکشه")} x={fx - 60} y={fy - 60} text="آب نمیاد" danger />
            </>
          );
        }}
      </Pic>
    ),
  },
  {
    at: T.gen,
    tin: "whipR",
    draw: (t) => (
      <Pic src="v01/img/s03_generator.jpg" t={t} keys={[{ t: T.gen, x: 0.45, y: 0.5, z: 1.12 }, { t: T.genPunch, x: 0.48, y: 0.6, z: 1.38, ease: eo }]}>
        {(m) => {
          const [lx, ly] = m(0.25, 0.45), [gx, gy] = m(0.43, 0.7);
          return (
            <>
              <Motes t={t} x={lx - 200} y={ly - 500} w={600} h={1100} n={40} seed={3} size={5} />
              <Tag t={t} t0={Wd(3, "ژنراتور")} x={gx} y={gy - 60} text="ژنراتور" />
            </>
          );
        }}
      </Pic>
    ),
  },
  {
    at: T.genPunch,
    tin: "zoom",
    draw: (t) => {
      const s1 = shake(t, Wd(3, "مشکل"), 16), s2 = shake(t, Wd(3, "بزرگ"), 10);
      return (
        <Pic
          src="v01/img/s03_generator.jpg"
          t={t}
          off={{ x: s1.x + s2.x + (t > Wd(3, "بزرگ") ? Math.sin(t * 70) * 3 : 0), y: s1.y + s2.y }}
          keys={[{ t: T.genPunch, x: 0.44, y: 0.73, z: 2.2 }, { t: T.mapQuiet, x: 0.44, y: 0.74, z: 2.45 }]}
        >
          {(m) => {
            const [gx, gy] = m(0.44, 0.72);
            return (
              <>
                <SoundArcs t={t} t0={Wd(3, "بزرگ")} x={gx} y={gy} />
                <Tag t={t} t0={Wd(3, "مشکل")} x={540} y={560} text="سروصدا!" danger />
              </>
            );
          }}
        </Pic>
      );
    },
  },
  {
    at: T.mapQuiet,
    tin: "whipU",
    draw: (t) => (
      <FarmMap
        t={t}
        keys={[{ t: T.mapQuiet, x: 0.66, y: 0.34, z: 2.4 }, { t: T.mapRings, x: 0.64, y: 0.36, z: 1.95 }]}
        st={{ dusk: 0.08 }}
      />
    ),
  },
  {
    at: T.mapRings,
    tin: "cut",
    draw: (t) => (
      <FarmMap
        t={t}
        keys={[
          { t: T.mapRings, x: 0.67, y: 0.33, z: 1.75 },
          { t: Wd(4, "چند") + 0.1, x: 0.7, y: 0.3, z: 1.6 },
          { t: T.mapEyes, x: 0.72, y: 0.27, z: 1.2 },
        ]}
        st={{ dusk: 0.1, rings: [{ x: P.barn.x, y: P.barn.y, t0: Wd(4, "ژنراتور"), max: 1150, period: 0.45 }], rulerAt: Wd(4, "چند") }}
      />
    ),
  },
  {
    at: T.mapEyes,
    tin: "zoom",
    draw: (t) => {
      const sh = shake(t, Wd(4, "لو"), 12);
      return (
        <FarmMap
          t={t}
          off={sh}
          keys={[
            { t: T.mapEyes, x: 0.86, y: 0.2, z: 2.0 },
            { t: Wd(4, "لو") - 0.05, x: 0.62, y: 0.32, z: 1.25 },
            { t: T.animals, x: 0.64, y: 0.33, z: 1.32 },
          ]}
          st={{
            dusk: 0.15,
            rings: [{ x: P.barn.x, y: P.barn.y, t0: Wd(4, "ژنراتور"), max: 1150, period: 0.45 }],
            eyesAt: T.mapEyes + 0.05,
            pinAt: Wd(4, "لو"),
          }}
        />
      );
    },
  },
  {
    at: T.animals,
    tin: "whipL",
    draw: (t) => {
      const sh = shake(t, Wd(6, "پارس"), 18, 0.5);
      return (
        <Pic
          src="v01/img/s04_animals.jpg"
          t={t}
          off={sh}
          keys={[
            { t: T.animals, x: 0.5, y: 0.45, z: 1.02 },
            { t: Wd(5, "نیست") - 0.05, x: 0.5, y: 0.45, z: 1.04 },
            { t: Wd(5, "نیست") + 0.12, x: 0.5, y: 0.47, z: 1.14, ease: eo },
            { t: Wd(6, "سی") - 0.6, x: 0.5, y: 0.48, z: 1.18 },
            { t: Wd(6, "سی"), x: 0.36, y: 0.6, z: 1.9, ease: eo },
            { t: Wd(6, "دوازده") - 0.4, x: 0.37, y: 0.6, z: 1.95 },
            { t: Wd(6, "دوازده"), x: 0.45, y: 0.37, z: 1.85, ease: eo },
            { t: Wd(6, "اسب") - 0.35, x: 0.45, y: 0.36, z: 1.9 },
            { t: Wd(6, "اسب"), x: 0.3, y: 0.18, z: 2.0, ease: eo },
            { t: Wd(6, "سگ") - 0.25, x: 0.3, y: 0.18, z: 2.02 },
            { t: Wd(6, "سگ"), x: 0.47, y: 0.79, z: 1.7, ease: eo },
            { t: Wd(6, "پارس") - 0.03, x: 0.47, y: 0.79, z: 1.74 },
            { t: Wd(6, "پارس") + 0.15, x: 0.45, y: 0.77, z: 2.0, ease: eo },
            { t: T.silent, x: 0.45, y: 0.77, z: 2.08 },
          ]}
        >
          {(m) => {
            const [dx, dy] = m(0.445, 0.735);
            return (
              <>
                <CountCard t={t} t0={Wd(6, "سی")} t1={Wd(6, "دوازده") - 0.3} x={540} y={430} n={30} label="مرغ" />
                <CountCard t={t} t0={Wd(6, "دوازده")} t1={Wd(6, "اسب") - 0.3} x={540} y={430} n={12} label="گاو" />
                <CountCard t={t} t0={Wd(6, "اسب")} t1={Wd(6, "سگ") - 0.2} x={540} y={430} n={1} label="اسب" />
                <CountCard t={t} t0={Wd(6, "سگ")} t1={Wd(6, "پارس") - 0.05} x={540} y={430} n={1} label="سگ" />
                <Burst t={t} t0={Wd(6, "پارس")} x={dx - 230} y={dy - 190} text="هاپ! هاپ!" size={130} />
              </>
            );
          }}
        </Pic>
      );
    },
  },
  {
    at: T.silent,
    tin: "dip",
    draw: (t) => (
      <>
        <Pic src="v01/img/s01_kitchen.jpg" t={t} grade={{ dark: 0.12 }} keys={[{ t: T.silent, x: 0.47, y: 0.25, z: 2.55 }, { t: T.chaos, x: 0.47, y: 0.23, z: 2.8 }]} />
        <NoiseMeter t={t} t0={T.silent + 0.1} level={0} label="صدای الی" />
      </>
    ),
  },
  {
    at: T.chaos,
    tin: "whipR",
    draw: (t) => {
      const a = Wd(7, "ساکت");
      const sh = shake(t, Wd(7, "تقریباً"), 16, 0.4);
      return (
        <>
          <FarmMap
            t={t}
            off={sh}
            keys={[{ t: T.chaos, x: 0.5, y: 0.56, z: 1.4 }, { t: T.gate, x: 0.5, y: 0.55, z: 1.16 }]}
            st={{
              dusk: 0.25,
              rings: [
                { x: P.hens.x, y: P.hens.y, t0: a, max: 520, period: 0.32, color: C.cream, w: 8 },
                { x: P.cows.x, y: P.cows.y, t0: a + 0.3, max: 620, period: 0.5, color: C.sand, w: 10 },
                { x: P.horse.x, y: P.horse.y, t0: a + 0.6, max: 520, period: 0.6, color: C.cream, w: 8 },
                { x: P.dog.x, y: P.dog.y, t0: a + 0.85, max: 700, period: 0.28, color: C.amber, w: 10 },
              ],
              stampAt: Wd(7, "تقریباً"),
            }}
          />
          <NoiseMeter t={t} t0={T.chaos} level={0.05 + 0.92 * pr(t, a, 1.6)} label="صدای مزرعه" />
        </>
      );
    },
  },
  {
    at: T.gate,
    tin: "cut",
    draw: (t) => {
      const lk = Wd(8, "قفل");
      return (
        <Pic src="v01/img/s05_gate.jpg" t={t} off={shake(t, lk, 12, 0.3)} keys={[{ t: T.gate, x: 0.48, y: 0.38, z: 1.25 }, { t: lk, x: 0.33, y: 0.62, z: 1.95 }, { t: T.gather, x: 0.32, y: 0.63, z: 2.05 }]}>
          {(m) => {
            const [px, py] = m(0.31, 0.645);
            return (
              <>
                <RingPop t={t} t0={lk} x={px} y={py} />
                <Glow x={px} y={py} r={160} color="#FFE2A8" o={0.6 * (1 - pr(t, lk, 0.5))} />
              </>
            );
          }}
        </Pic>
      );
    },
  },
  {
    at: T.gather,
    tin: "whipL",
    draw: (t) => (
      <FarmMap
        t={t}
        keys={[{ t: T.gather, x: 0.46, y: 0.56, z: 1.3 }, { t: T.inventory, x: 0.43, y: 0.52, z: 1.65 }]}
        st={{ dusk: 0.45, gatherAt: [T.gather + 0.1, T.gather + 1.6], safeAt: T.gather + 0.35, ellieAt: T.gather }}
      />
    ),
  },
  {
    at: T.inventory,
    tin: "dip",
    draw: (t) => (
      <>
        <Pic src="v01/img/s01_kitchen.jpg" t={t} grade={{ dark: 0.4, blur: 14 }} keys={[{ t: T.inventory, x: 0.5, y: 0.45, z: 1.3 }, { t: T.porch, x: 0.5, y: 0.45, z: 1.42 }]} />
        <Inventory t={t} t0={T.inventory} rowsAt={Wd(8, "حساب") - 0.1} />
      </>
    ),
  },
  {
    at: T.porch,
    tin: "dip",
    draw: (t) => (
      <Pic src="v01/img/s06_porch.jpg" t={t} keys={[{ t: T.porch, x: 0.45, y: 0.53, z: 1.75 }, { t: T.porchDark, x: 0.47, y: 0.5, z: 1.12, ease: eo }]}>
        {(m) => {
          const [lx, ly] = m(0.18, 0.635);
          return (
            <>
              <Glow x={lx} y={ly} r={190} color="#FFB24A" o={0.5 + 0.12 * Math.sin(t * 9) + 0.08 * Math.sin(t * 23)} />
              <Motes t={t} x={0} y={700} w={1080} h={700} n={22} seed={7} size={7} color="#FFD27A" glow />
              <Weeks t={t} t0={Wd(9, "چند")} t1={T.porchDark - 0.3} />
            </>
          );
        }}
      </Pic>
    ),
  },
  {
    at: T.porchDark,
    tin: "cut",
    draw: (t) => {
      const g = pr(t, T.porchDark, T.barn - T.porchDark, (x) => x);
      return (
        <Pic
          src="v01/img/s06_porch.jpg"
          t={t}
          grade={{ dark: lerp(0.3, 0.55, g), sat: 0.85 }}
          keys={[{ t: T.porchDark, x: 0.62, y: 0.45, z: 1.25 }, { t: T.barn, x: 0.82, y: 0.4, z: 2.4, ease: (x) => x }]}
        >
          {(m) => {
            const [lx, ly] = m(0.18, 0.635), [bx, by] = m(0.835, 0.395);
            const glint = pr(t, Wd(10, "خبر"), 0.5) * (0.7 + 0.3 * Math.sin(t * 6));
            return (
              <>
                <Glow x={lx} y={ly} r={200} color="#FFA040" o={0.45 + 0.12 * Math.sin(t * 9)} />
                <Glow x={bx} y={by} r={55} color={C.red} o={glint * 0.8} />
                <Motes t={t} x={0} y={600} w={1080} h={800} n={14} seed={9} size={6} color="#FFC56A" glow />
              </>
            );
          }}
        </Pic>
      );
    },
  },
  {
    at: T.barn,
    tin: "dip",
    draw: (t) => {
      const d = Wd(11, "داخل"), b = Wd(11, "بود");
      const rim = pr(t, d, 0.8);
      const out = pr(t, WdEnd(11, "بود") + 0.2, 0.3);
      return (
        <>
          <Pic
            src="v01/img/s07_barn_inside.jpg"
            t={t}
            off={shake(t, b, 10, 0.3)}
            keys={[{ t: T.barn, x: 0.52, y: 0.5, z: 1.05 }, { t: d, x: 0.5, y: 0.58, z: 1.32 }, { t: b - 0.03, x: 0.5, y: 0.6, z: 1.42 }, { t: b + 0.18, x: 0.5, y: 0.6, z: 1.75, ease: eo }, { t: T.part2, x: 0.5, y: 0.6, z: 1.8 }]}
          >
            {(m) => {
              const [sx, sy] = m(0.5, 0.6);
              return (
                <>
                  <Glow x={sx} y={sy - 160} r={300} color={C.red} o={0.12 + 0.3 * rim + 0.06 * Math.sin(t * 7)} />
                  <Motes t={t} x={0} y={300} w={1080} h={1200} n={18} seed={11} size={4} color="#C9805A" />
                </>
              );
            }}
          </Pic>
          <AbsoluteFill style={{ background: "#000", opacity: out }} />
        </>
      );
    },
  },
  { at: T.part2, tin: "cut", draw: (t) => <Part2 t={t} t0={T.part2} /> },
];

// ---------------- transitions: old leaves first, new arrives ----------------
const IN_D = 0.2, OUT_D = 0.12;
const inFx = (tin: Tin, lt: number): React.CSSProperties => {
  const p = eo(clamp(lt / IN_D));
  const q = 1 - p;
  switch (tin) {
    case "whipL":
      return { transform: `translateX(${q * 320}px)`, filter: `blur(${q * 16}px)` };
    case "whipR":
      return { transform: `translateX(${-q * 320}px)`, filter: `blur(${q * 16}px)` };
    case "whipU":
      return { transform: `translateY(${q * 420}px)`, filter: `blur(${q * 16}px)` };
    case "zoom":
      return { transform: `scale(${1 + q * 0.25})`, filter: `blur(${q * 12}px)` };
    default:
      return {};
  }
};
const outFx = (next: Tin, lt: number): React.CSSProperties => {
  const p = eo(clamp(lt / OUT_D));
  switch (next) {
    case "whipL":
      return { transform: `translateX(${-p * 320}px)`, filter: `blur(${p * 16}px)` };
    case "whipR":
      return { transform: `translateX(${p * 320}px)`, filter: `blur(${p * 16}px)` };
    case "whipU":
      return { transform: `translateY(${-p * 420}px)`, filter: `blur(${p * 16}px)` };
    case "zoom":
      return { transform: `scale(${1 + p * 0.12})`, filter: `blur(${p * 8}px)` };
    default:
      return {};
  }
};

export const Frame01: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  let i = 0;
  for (let k = 0; k < SHOTS.length; k++) if (t >= SHOTS[k].at) i = k;
  const sh = SHOTS[i], next = SHOTS[i + 1];
  const lt = t - sh.at;
  let style: React.CSSProperties = inFx(sh.tin, lt);
  if (next && t > next.at - OUT_D && next.tin !== "cut" && next.tin !== "dip") style = outFx(next.tin, t - (next.at - OUT_D));
  const dipIn = sh.tin === "dip" ? 1 - eo(clamp(lt / 0.22)) : 0;
  const dipOut = next && next.tin === "dip" ? pr(t, next.at - 0.12, 0.12) : 0;
  const warm = lerp(0.2, 0.04, clamp(t / T.barn));
  const vig = lerp(0.5, 0.8, clamp(t / T.part2));
  const showUi = t < T.part2;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill style={style}>{sh.draw(t)}</AbsoluteFill>
      <AbsoluteFill style={{ background: C.ink, opacity: Math.max(dipIn, dipOut) }} />
      <Flash t={t} t0={T.animals} max={0.35} />
      {showUi && <TimeChip t={t} hide={pr(t, T.part2 - 0.6, 0.4)} />}
      {showUi && <Captions t={t} />}
      <Finish f={f} warm={warm} vig={vig} />
    </AbsoluteFill>
  );
};

/** the film. `times` (seconds) turns it into a stills sheet for cheap frame checks (-Look). */
export const Video01: React.FC<{ times?: number[]; withAudio?: boolean }> = ({ times, withAudio }) => {
  const f = useCurrentFrame();
  const t = times ? times[Math.min(f, times.length - 1)] : f / FPS;
  return (
    <>
      <Frame01 t={t} f={f} />
      {withAudio && !times && <Audio src={staticFile("v01/vo.wav")} />}
    </>
  );
};

export const V01_LOOK = [
  0.1, 1.6, T.well + 0.8, T.diagram + 1.0, Wd(1, "برق") + 0.5, Wd(2, "قطع") + 0.15, T.faucet + 0.6, T.gen + 0.9, T.genPunch + 1.3, T.mapQuiet + 1,
  Wd(4, "چند") + 0.6, Wd(4, "لو") + 0.3, Wd(5, "نیست"), Wd(6, "سی") + 0.3, Wd(6, "دوازده") + 0.3, Wd(6, "اسب") + 0.3, Wd(6, "پارس") + 0.25, T.silent + 0.8,
  Wd(7, "تقریباً") + 0.4, Wd(8, "قفل") + 0.1, T.gather + 1.5, Wd(8, "حساب") + 1.5, Wd(9, "هفته") + 0.6, T.porchDark + 2.5, Wd(11, "داخل") + 0.4, Wd(11, "بود") + 0.3, T.part2 + 1.8,
];
export { MW, MH };
