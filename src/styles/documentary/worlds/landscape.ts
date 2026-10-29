// The generic world for ANY topic: a place with real depth, set by a mood (time of day / weather) and a few switches.
// sky + sun/moon + stars → real clouds at two depths → three mountain ranges with aerial haze → mist → optional city
// skyline with lit windows → ground (optionally a lake/sea with reflections) → trees → YOUR figures/props (callback,
// world coords) → bloom → foreground bokeh + dust → vignette + grain.
// One call = one finished frame of a place:  landscape(c, t, cam, { mood: "dusk", city: 0.6 }, (c, lit, L) => { … })
import { applyCam, bloom, blur, Cam, Ctx, H, layer, matchTransform, W } from "../engine/canvas";
import { bokeh, CloudPal, clouds, godRays, mist, nebula, ridge, starsDeep } from "../engine/depth";
import { glow, grain, motes, painterly, vignette } from "../engine/fx";
import { clamp, fbm, lerp, mixHex, rgba, rng, TAU } from "../engine/math";

export type Mood = {
  sky: [string, string, string]; // top, middle, horizon
  ranges: [string, string, string]; // far, mid, near
  haze: string;
  hazeA: number;
  ground: [string, string]; // near the horizon, at our feet
  rim: string; // light catching edges
  light: { kind: "sun" | "moon" | "none"; x: number; y: number; color: string; rays: number };
  stars: number; // 0..1 (above 1 = more stars, e.g. 6 for a sky crowded with them)
  cloudNear: CloudPal;
  cloudFar: CloudPal;
  cloudA: number;
  windows: number; // 0..1 how many city windows are lit
  water: string;
  flash?: boolean; // storm lightning
  vig: string;
};
export const MOODS = {
  /** warm low sun just set: gold-lit clouds, violet ranges (reference: the desert of video 19) */
  dusk: {
    sky: ["#2e2147", "#9e6378", "#eaa577"], ranges: ["#7b5a73", "#5b4256", "#3a2a36"], haze: "#eaa577", hazeA: 0.5,
    ground: ["#6e4f58", "#2f2129"], rim: "#ffb27a", light: { kind: "sun", x: 760, y: 660, color: "#ffb070", rays: 1 }, stars: 0.3,
    cloudNear: { shade: "#4a2c4a", mid: "#a8607a", lit: "#ffc898", gamma: 0.95 }, cloudFar: { shade: "#6a4060", mid: "#b8748a", lit: "#ffd0a8", gamma: 1.1 },
    cloudA: 1, windows: 0.6, water: "#e9a98a", vig: "#140a16",
  },
  /** cool blue land, pink clouds, pale sun on the horizon */
  dawn: {
    sky: ["#34406e", "#c49ab6", "#ffd8b0"], ranges: ["#8c8cb4", "#5e6890", "#3a4266"], haze: "#ffd8c0", hazeA: 0.55,
    ground: ["#5a6078", "#232838"], rim: "#ffe2c4", light: { kind: "sun", x: 1300, y: 650, color: "#ffe0b8", rays: 0.7 }, stars: 0.15,
    cloudNear: { shade: "#5a5682", mid: "#c99ab8", lit: "#ffe6d4", gamma: 1 }, cloudFar: { shade: "#7a76a0", mid: "#d6aec4", lit: "#ffeadc", gamma: 1.1 },
    cloudA: 0.95, windows: 0.25, water: "#e8c8d0", vig: "#121428",
  },
  /** clear day, white clouds, high sun */
  day: {
    sky: ["#3f73c0", "#86b2e6", "#dce9f3"], ranges: ["#a3b8cf", "#7290ab", "#4c637a"], haze: "#dce9f3", hazeA: 0.6,
    ground: ["#7d8c5c", "#34432a"], rim: "#fff6e0", light: { kind: "sun", x: 1450, y: 170, color: "#fff4d8", rays: 0.45 }, stars: 0,
    cloudNear: { shade: "#7d93b4", mid: "#c9d7e9", lit: "#ffffff", gamma: 0.9 }, cloudFar: { shade: "#98abc6", mid: "#d6e1ee", lit: "#ffffff", gamma: 1 },
    cloudA: 1, windows: 0, water: "#9cc2e6", vig: "#0c1420",
  },
  /** moonlit night: stars in depth, milky way, blue ranges */
  night: {
    sky: ["#0a0f2c", "#18214e", "#3b3f7c"], ranges: ["#3a4282", "#2b3166", "#1a1e44"], haze: "#6a78c8", hazeA: 0.45,
    ground: ["#24285a", "#0b0b1c"], rim: "#c9d2ff", light: { kind: "moon", x: 470, y: 250, color: "#dfe6ff", rays: 0 }, stars: 1,
    cloudNear: { shade: "#0c1030", mid: "#2a3470", lit: "#c4ceff", gamma: 1.1 }, cloudFar: { shade: "#141a44", mid: "#2e3a7a", lit: "#8a98e0", gamma: 1.2 },
    cloudA: 0.85, windows: 1, water: "#3a4890", vig: "#070612",
  },
  /** dark storm: heavy clouds, lightning flashes */
  storm: {
    sky: ["#16181f", "#323648", "#5e6274"], ranges: ["#4a4e60", "#33364a", "#22242f"], haze: "#767a8c", hazeA: 0.5,
    ground: ["#3a3a42", "#121216"], rim: "#cfd6ff", light: { kind: "none", x: 960, y: 300, color: "#cfd6ff", rays: 0 }, stars: 0,
    cloudNear: { shade: "#121319", mid: "#3c3f50", lit: "#a9b0c8", gamma: 0.85 }, cloudFar: { shade: "#1e2029", mid: "#4a4e60", lit: "#9aa0b6", gamma: 1 },
    cloudA: 1, windows: 0.7, water: "#4a5064", flash: true, vig: "#08080c",
  },
  /** grey, soft, quiet (memory, loss, the past) */
  fog: {
    sky: ["#545b67", "#959ba4", "#c9cdd2"], ranges: ["#a3a8b0", "#82888f", "#5c6168"], haze: "#c9cdd2", hazeA: 0.75,
    ground: ["#5e625e", "#26282a"], rim: "#eef1f4", light: { kind: "sun", x: 1200, y: 360, color: "#f4f2ea", rays: 0.25 }, stars: 0,
    cloudNear: { shade: "#5a606a", mid: "#a4aab2", lit: "#eef0f2", gamma: 1 }, cloudFar: { shade: "#7a8088", mid: "#b4b9c0", lit: "#f0f2f4", gamma: 1.1 },
    cloudA: 0.8, windows: 0.3, water: "#a8b0b8", vig: "#16181c",
  },
  /** the same land touched by something beyond: lilac light, white rims (wonder, revelation) */
  heaven: {
    sky: ["#8b86ee", "#e7a6d2", "#ffe0b0"], ranges: ["#c09ad0", "#a07fb4", "#6f5488"], haze: "#ffe0b0", hazeA: 0.5,
    ground: ["#c49ab8", "#6c4f7a"], rim: "#ffffff", light: { kind: "sun", x: 960, y: 560, color: "#fff4f0", rays: 1.2 }, stars: 0,
    cloudNear: { shade: "#8a72c0", mid: "#d6b0e0", lit: "#fff6f0", gamma: 0.95 }, cloudFar: { shade: "#a088c8", mid: "#dcc0e8", lit: "#fff4ec", gamma: 1.1 },
    cloudA: 1, windows: 0, water: "#f6e6ff", vig: "#1a0f24",
  },
} satisfies Record<string, Mood>;
export type MoodName = keyof typeof MOODS;

const mixArr = <T extends string[]>(a: T, b: T, k: number) => a.map((x, i) => mixHex(x, b[i], k)) as T;
/** blend two moods (dusk → night as a line plays). Clouds are cross-faded by landscape(), not mixed. */
export function mixMood(a: Mood, b: Mood, k: number): Mood {
  k = clamp(k);
  return {
    ...(k < 0.5 ? a : b),
    sky: mixArr(a.sky, b.sky, k), ranges: mixArr(a.ranges, b.ranges, k), haze: mixHex(a.haze, b.haze, k), hazeA: lerp(a.hazeA, b.hazeA, k),
    ground: mixArr(a.ground, b.ground, k), rim: mixHex(a.rim, b.rim, k), stars: lerp(a.stars, b.stars, k), windows: lerp(a.windows, b.windows, k),
    water: mixHex(a.water, b.water, k), vig: mixHex(a.vig, b.vig, k), cloudA: lerp(a.cloudA, b.cloudA, k),
    light: { kind: k < 0.5 ? a.light.kind : b.light.kind, x: lerp(a.light.x, b.light.x, k), y: lerp(a.light.y, b.light.y, k), color: mixHex(a.light.color, b.light.color, k), rays: lerp(a.light.rays, b.light.rays, k) },
  };
}

export type LandOpt = {
  mood: MoodName | Mood;
  /** blend toward another mood: [mood, 0..1] */
  to?: [MoodName | Mood, number];
  /** y of the horizon / ground line in world coords (default 700) */
  horizon?: number;
  /** 0..3 mountain ranges (default 3); amp = how tall (default 1) */
  ranges?: number;
  amp?: number;
  /** "none" | "few" | "many" (default "few") */
  clouds?: "none" | "few" | "many";
  /** 0..1 a city skyline on the horizon (density); windows follow the mood */
  city?: number;
  /** a lake/sea from the horizon down to this y (e.g. 860) */
  water?: number;
  /** 0..1 trees along the near ground */
  trees?: number;
  /** foreground bokeh + dust (default true) */
  air?: boolean;
  /** vignette + grain (default true; false when this world sits inside a portal or a layer you finish yourself) */
  finish?: boolean;
  seed?: number;
};
/** what the callback gets: where the ground is and where the light comes from (world coords) */
export type LandInfo = { horizon: number; groundY: (x: number) => number; lightX: number; mood: Mood };
const asMood = (m: MoodName | Mood): Mood => (typeof m === "string" ? MOODS[m] : m);
const par = (cam: Cam, f: number): Cam => ({ x: 960 + (cam.x - 960) * f, y: 540 + (cam.y - 540) * f, z: 1 + (cam.z - 1) * f });

/** one finished place. `draw` runs in world coords after the land (figures, props, light beings); `lit` is the bloom layer. */
export function landscape(c: Ctx, t: number, cam: Cam, o: LandOpt, draw?: (c: Ctx, lit: Ctx, L: LandInfo) => void) {
  const A = asMood(o.mood), B = o.to ? asMood(o.to[0]) : null, kk = o.to ? clamp(o.to[1]) : 0;
  const m = B ? mixMood(A, B, kk) : A;
  const hz = o.horizon ?? 700, seed = o.seed ?? 1, amp = o.amp ?? 1, nR = o.ranges ?? 3;
  const px = (cam.x - 960) * cam.z, py = (cam.y - 540) * cam.z;
  const flash = m.flash ? stormFlash(t, seed) : 0;
  // ---- sky (screen space) ----
  const L = m.light;
  painterly(c, t, m.sky[0], m.sky[2], [
    { x: L.x, y: L.y + 40, r: 900, c: m.sky[2], a: 0.85 },
    { x: 900, y: 300, r: 800, c: m.sky[1], a: 0.7 },
    { x: 1500, y: 120, r: 600, c: m.sky[0], a: 0.6 },
  ], seed + 3, 0.6);
  if (m.stars > 0.01) {
    if (m.stars > 0.6) {
      c.save();
      c.translate(960, 300);
      c.rotate(-0.42);
      c.translate(-960, -300);
      nebula(c, t, ["#3a4a9a", "#6a5aa8", "#e0e6ff"], 0.3 * Math.min(1, m.stars), seed + 83, 0.4, "screen", -px * 0.05, -py * 0.05);
      c.restore();
    }
    starsDeep(c, t, Math.round(260 * m.stars), seed + 82, Math.min(1, m.stars), px * 0.4, py * 0.4, "#ffffff", [0, 0, W, hz - 60]);
  }
  if (L.kind === "moon") moon(c, L.x - px * 0.08, L.y - py * 0.08, L.color);
  else if (L.kind === "sun") {
    c.save();
    c.globalCompositeOperation = "screen";
    glow(c, L.x - px * 0.1, L.y - py * 0.1, 560, L.color, 0.55);
    glow(c, L.x - px * 0.1, L.y - py * 0.1, 130, "#ffffff", L.y < hz - 200 ? 0.7 : 0.35);
    c.restore();
  }
  if (flash > 0.01) {
    c.save();
    c.globalCompositeOperation = "screen";
    glow(c, 600 + 700 * fbm(Math.floor(t / 4.3) + seed, 1, 1), 260, 900, "#c8d0ff", 0.55 * flash);
    c.restore();
  }
  // ---- real clouds, two depths (cross-faded when the mood changes) ----
  const cl = o.clouds ?? "few";
  if (cl !== "none") {
    const many = cl === "many";
    const far = [{ name: "field" as const, x: 700, y: hz - 230, w: 1900, a: 0.75, sp: 3, crop: [0, 0.05, 1, 0.62] as [number, number, number, number] }, ...(many ? [{ name: "cu2" as const, x: 1500, y: hz - 400, w: 1200, a: 0.6, sp: 2, flip: true }] : [])];
    const near = [
      { name: "cu3" as const, x: 420, y: hz - 530, w: 1150, sp: 5 },
      { name: "cu4" as const, x: 1560, y: hz - 580, w: 1200, flip: true, sp: 4, crop: [0, 0, 1, 0.8] as [number, number, number, number] },
      ...(many ? [{ name: "cu1" as const, x: 980, y: hz - 470, w: 900, a: 0.85, sp: 6 }, { name: "cu5" as const, x: -200, y: hz - 380, w: 900, a: 0.8, sp: 5, flip: true }] : []),
    ];
    for (const [mood, a] of B ? ([[A, 1 - kk], [B, kk]] as const) : ([[A, 1]] as const)) {
      if (a < 0.01) continue;
      c.save();
      applyCam(c, par(cam, 0.25));
      clouds(c, t, far, mood.cloudFar, a * mood.cloudA, [-900, 2800]);
      c.restore();
      c.save();
      applyCam(c, par(cam, 0.5));
      clouds(c, t, near, mood.cloudNear, 0.95 * a * mood.cloudA, [-900, 2800]);
      c.restore();
    }
    if (flash > 0.01) {
      c.save();
      c.globalCompositeOperation = "screen";
      c.fillStyle = rgba("#9aa4d8", 0.18 * flash);
      c.fillRect(0, 0, W, hz);
      c.restore();
    }
  }
  // ---- world (camera) ----
  const lit = layer("land-lit", 0.5);
  c.save();
  applyCam(c, cam);
  if (L.kind === "sun" && L.rays > 0.01)
    godRays(c, t, L.x, Math.min(L.y, hz - 30), { n: 20, len: 1400, spread: L.y > hz - 200 ? 2.6 : 3.4, dir: -Math.PI / 2, color: L.color, alpha: 0.15 * L.rays, width: 0.07, spin: 0.003, seed: seed + 9, soft: 12 });
  // three ranges, far → near, each hazier the farther it is (aerial perspective) and moving less with the camera
  const rr = [
    { f: 0.4, y0: hz - 50, a: 300, fr: 0.0024, c: m.ranges[0], hA: m.hazeA, rimA: 0.22 },
    { f: 0.25, y0: hz - 10, a: 200, fr: 0.0018, c: m.ranges[1], hA: m.hazeA * 0.6, rimA: 0.3 },
    { f: 0.12, y0: hz + 25, a: 120, fr: 0.0014, c: m.ranges[2], hA: m.hazeA * 0.3, rimA: 0.35 },
  ].slice(3 - nR);
  rr.forEach((r, i) => {
    c.save();
    c.translate((cam.x - 960) * r.f, (cam.y - 540) * r.f * 0.3);
    ridge(c, { y0: r.y0, amp: r.a * amp, freq: r.fr, seed: seed * 7 + i * 13, color: r.c, haze: m.haze, hazeA: r.hA, sharp: 0.75, rim: m.rim, rimA: r.rimA * (flash > 0.2 ? 1.8 : 1), rimW: 1.6, tex: i === rr.length - 1 ? 1 : 0 });
    c.restore();
    mist(c, r.y0 - 10, 60, m.haze, 0.3);
  });
  if (o.city) skyline(c, t, hz, o.city, m, seed, lit);
  // ground
  const gy = (x: number) => hz + 40 + Math.sin(x * 0.004 + seed) * 16 + fbm(x * 0.003, seed, 2) * 12;
  const g = c.createLinearGradient(0, hz, 0, 1100);
  g.addColorStop(0, m.ground[0]);
  g.addColorStop(1, m.ground[1]);
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(-600, gy(-600));
  for (let x = -600; x <= 2600; x += 40) c.lineTo(x, gy(x));
  c.lineTo(2600, 1500);
  c.lineTo(-600, 1500);
  c.fill();
  // light ripples on the ground (lit crests, wider apart toward us)
  c.save();
  c.strokeStyle = rgba(m.rim, 0.1);
  c.lineWidth = 1.6;
  const r0 = rng(seed + 318);
  for (let i = 0; i < 40; i++) {
    const y0 = hz + 70 + Math.pow(i / 40, 1.6) * 360, x0 = r0() * 2600 - 400, len = 80 + r0() * 220 * (1 + (y0 - hz) / 200);
    c.beginPath();
    for (let j = 0; j <= 10; j++) {
      const u = j / 10, x = x0 + u * len;
      const y = y0 - Math.sin(u * Math.PI) * 5;
      j ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.stroke();
  }
  c.restore();
  if (o.water) water(c, t, hz + 30, o.water, m, seed);
  if (o.trees) trees(c, t, o.trees, gy, m, seed, hz);
  const info: LandInfo = { horizon: hz, groundY: gy, lightX: L.kind === "none" ? 960 : L.x, mood: m };
  draw?.(c, lit, info);
  c.restore();
  bloom(c, lit, 0.9, 48);
  if (o.air !== false) {
    bokeh(c, t, { n: 10, seed: seed + 41, color: m.rim, alpha: 0.12, size: 1, px: px * 1.6, py: py * 1.6 });
    motes(c, t, { n: 40, color: m.rim, alpha: 0.35, seed: seed + 21, speed: 0.35, dust: true });
  }
  if (o.finish !== false) {
    vignette(c, 0.42, m.vig);
    grain(c, t, 0.15);
  }
  if (flash > 0.6) {
    c.save();
    c.globalCompositeOperation = "screen";
    c.fillStyle = rgba("#c8d0ff", 0.12 * (flash - 0.6));
    c.fillRect(0, 0, W, H);
    c.restore();
  }
  return info;
}

/** lightning: a sharp double pulse every ~4.3 s (deterministic) */
function stormFlash(t: number, seed: number) {
  const ph = (t / 4.3 + seed * 0.37) % 1;
  const p = (u: number) => Math.exp(-Math.pow((ph - u) / 0.006, 2));
  return clamp(p(0.02) + 0.7 * p(0.045));
}
function moon(c: Ctx, x: number, y: number, col: string) {
  c.save();
  c.globalCompositeOperation = "screen";
  glow(c, x, y, 520, "#9aa8ff", 0.4);
  glow(c, x, y, 150, col, 0.55);
  c.restore();
  const g = c.createRadialGradient(x - 14, y - 14, 4, x, y, 52);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(1, "#c9d2f4");
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, 50, 0, TAU);
  c.fill();
  c.fillStyle = rgba("#9aa4d0", 0.35);
  for (const [mx, my, mr] of [[-14, -10, 11], [12, 8, 8], [-4, 18, 6], [18, -16, 5]] as const) {
    c.beginPath();
    c.arc(x + mx, y + my, mr, 0, TAU);
    c.fill();
  }
}
/** a city on the horizon: three rows of blocks (hazier behind), lit windows that blink slowly, a few antenna lights */
function skyline(c: Ctx, t: number, hz: number, dens: number, m: Mood, seed: number, lit: Ctx) {
  const r = rng(seed + 501);
  for (let row = 0; row < 3; row++) {
    const col = mixHex(m.ranges[2 - row] ?? m.ranges[2], m.haze, 0.35 - row * 0.15), base = hz + 40 + row * 6;
    let x = -500 + r() * 60;
    while (x < 2500) {
      const w = 40 + r() * 90, h = (60 + r() * 220 * (1 - row * 0.25)) * (0.5 + dens * 0.7);
      if (r() < 0.35 + dens * 0.6) {
        c.fillStyle = col;
        c.fillRect(x, base - h, w, h + 60);
        c.fillStyle = rgba(m.rim, 0.18);
        c.fillRect(x, base - h, w, 2);
        // windows
        if (m.windows > 0.02 && row < 2) {
          const wr = rng(Math.floor(x * 7 + row * 101 + seed));
          for (let yy = base - h + 10; yy < base - 8; yy += 14)
            for (let xx = x + 6; xx < x + w - 8; xx += 12) {
              const on = wr() < m.windows * 0.55 && Math.sin(t * 0.3 + xx * 0.7 + yy) > -0.92;
              if (!on) continue;
              c.fillStyle = rgba("#ffd9a0", 0.55 + 0.3 * wr());
              c.fillRect(xx, yy, 5, 7);
            }
        }
        if (r() < 0.12 && m.windows > 0.3) {
          const blink = Math.sin(t * 3 + x) > 0.6 ? 1 : 0.2;
          lit.save();
          matchTransform(lit, c);
          glow(lit, x + w / 2, base - h - 20, 14, "#ff5a4a", blink);
          lit.restore();
          c.fillStyle = rgba("#ff6a5a", blink);
          c.fillRect(x + w / 2 - 2, base - h - 22, 4, 4);
        }
      }
      x += w + 4 + r() * 30;
    }
  }
}
/** a lake/sea: sky colours reflected, a column of light under the sun/moon, slow shimmer */
function water(c: Ctx, t: number, y0: number, y1: number, m: Mood, seed: number) {
  const g = c.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, mixHex(m.water, m.sky[2], 0.4));
  g.addColorStop(1, mixHex(m.water, m.ground[1], 0.55));
  c.fillStyle = g;
  c.fillRect(-600, y0, 3200, y1 - y0);
  const Lx = m.light.kind === "none" ? 960 : m.light.x;
  c.save();
  c.globalCompositeOperation = "screen";
  const cg = c.createLinearGradient(0, y0, 0, y1);
  cg.addColorStop(0, rgba(m.light.color, 0.45));
  cg.addColorStop(1, rgba(m.light.color, 0));
  c.fillStyle = cg;
  c.filter = blur(22);
  c.fillRect(Lx - 60, y0 + 4, 120, y1 - y0 - 8);
  c.filter = "none";
  c.restore();
  // soft shore line
  const sg = c.createLinearGradient(0, y1 - 14, 0, y1 + 10);
  sg.addColorStop(0, rgba(m.ground[0], 0));
  sg.addColorStop(1, rgba(m.ground[0], 0.9));
  c.fillStyle = sg;
  c.fillRect(-600, y1 - 14, 3200, 24);
  c.strokeStyle = rgba("#ffffff", 0.5);
  c.lineCap = "round";
  const r = rng(seed + 77);
  for (let i = 0; i < 70; i++) {
    const yy = y0 + 6 + Math.pow(r(), 1.5) * (y1 - y0 - 10), near = (yy - y0) / (y1 - y0);
    const ph = t * 0.6 + i * 1.7;
    const xx = Lx + (r() - 0.5) * (300 + near * 900) + Math.sin(ph) * 20;
    c.globalAlpha = (0.15 + 0.35 * Math.abs(Math.sin(ph * 1.3))) * (1 - Math.min(1, Math.abs(xx - Lx) / 700));
    c.lineWidth = 1.5 + near * 2;
    c.beginPath();
    c.moveTo(xx, yy);
    c.lineTo(xx + 14 + near * 40, yy);
    c.stroke();
  }
  c.globalAlpha = 1;
}
/** trees along the near ground: broad trees (clumpy dome crowns on forked trunks) and conifers, hazier the farther
 *  they stand, crowns breathing, lit on the side toward the light. The middle is kept open for the action. */
function trees(c: Ctx, t: number, dens: number, gy: (x: number) => number, m: Mood, seed: number, hz: number) {
  const r = rng(seed + 900);
  const n = Math.round(4 + dens * 16);
  const list = Array.from({ length: n }, () => ({ x: -300 + r() * 2500, s: 0.55 + r() * 0.8, dy: 30 + r() * 140, kind: r() < 0.3 ? 1 : 0, sd: r() * 100 }))
    .filter((p) => !(p.x > 720 && p.x < 1230))
    .sort((p, q) => p.dy - q.dy);
  const side = m.light.kind === "none" ? 0 : Math.sign(m.light.x - 960) || 1;
  for (const p of list) {
    const y = gy(p.x) + p.dy, s = p.s * (0.75 + (p.dy / 170) * 0.5), h = 180 * s;
    const col = mixHex(m.ground[1], m.haze, 0.3 * (1 - clamp((y - hz - 40) / 220)));
    const rr = rng(Math.floor(p.sd * 1000));
    c.fillStyle = col;
    c.strokeStyle = col;
    c.lineCap = "round";
    if (p.kind === 1) {
      // conifer: stacked jagged tiers
      c.fillRect(p.x - 3 * s, y - h * 0.18, 6 * s, h * 0.18);
      for (let k = 0; k < 6; k++) {
        const u = k / 6, w = (1 - u) * 46 * s + 6 * s, yb = y - h * (0.12 + u * 0.78), sw = Math.sin(t * 0.8 + p.sd + k) * 1.5 * s * u;
        c.beginPath();
        c.moveTo(p.x - w + sw, yb);
        c.lineTo(p.x - w * 0.55 + sw, yb - 4 * s);
        c.lineTo(p.x + sw * 1.4, yb - h * 0.26);
        c.lineTo(p.x + w * 0.55 + sw, yb - 4 * s);
        c.lineTo(p.x + w + sw, yb);
        c.closePath();
        c.fill();
      }
      if (side) {
        c.strokeStyle = rgba(m.rim, 0.28);
        c.lineWidth = 1.6;
        c.beginPath();
        c.moveTo(p.x, y - h * 0.9);
        c.lineTo(p.x + side * 40 * s, y - h * 0.14);
        c.stroke();
      }
      continue;
    }
    // broad tree: forked trunk + clumpy dome crown
    c.lineWidth = 9 * s;
    c.beginPath();
    c.moveTo(p.x, y);
    c.quadraticCurveTo(p.x - 3 * s, y - h * 0.3, p.x + 2 * s, y - h * 0.42);
    c.stroke();
    c.lineWidth = 4.5 * s;
    for (const [dx, dy] of [[-30, -0.62], [26, -0.66], [4, -0.72]]) {
      c.beginPath();
      c.moveTo(p.x + 2 * s, y - h * 0.4);
      c.quadraticCurveTo(p.x + dx * 0.4 * s, y - h * 0.55, p.x + dx * s, y + dy * h);
      c.stroke();
    }
    const blobs: [number, number, number][] = [];
    for (let k = 0; k < 11; k++) {
      const a = Math.PI * (0.05 + 0.9 * (k / 10)) + (rr() - 0.5) * 0.3, R = (0.55 + rr() * 0.45) * 52 * s;
      blobs.push([p.x + Math.cos(a) * R * 1.15, y - h * 0.62 - Math.sin(a) * R * 0.75 + (rr() - 0.5) * 8 * s, (15 + rr() * 13) * s]);
    }
    blobs.push([p.x, y - h * 0.66, 34 * s], [p.x - 26 * s, y - h * 0.6, 24 * s], [p.x + 26 * s, y - h * 0.6, 24 * s]);
    for (const [bx, by, br] of blobs) {
      const sw = Math.sin(t * 0.7 + p.sd + bx * 0.01) * 2 * s;
      c.beginPath();
      c.arc(bx + sw, by, br, 0, TAU);
      c.fill();
    }
    if (side) {
      c.strokeStyle = rgba(m.rim, 0.3);
      c.lineWidth = 2;
      for (const [bx, by, br] of blobs) {
        if (by > y - h * 0.62 && Math.sign(bx - p.x) !== side) continue;
        const sw = Math.sin(t * 0.7 + p.sd + bx * 0.01) * 2 * s;
        const a0 = side > 0 ? -Math.PI * 0.55 : -Math.PI * 1.05;
        c.beginPath();
        c.arc(bx + sw, by, br, a0, a0 + Math.PI * 0.6);
        c.stroke();
      }
    }
  }
}
