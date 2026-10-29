import React, { useLayoutEffect, useRef } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

// Cinematic Earth, rendered per pixel from NASA public-domain textures (Blue Marble NG day, cloud_combined, Black Marble 2016):
// sun lighting with a soft terminator, city lights on the night side, ocean sun-glint, drifting clouds,
// Rayleigh-style atmosphere rim + halo, and a spreading "heat front" that browns the land, reddens the ocean,
// evaporates clouds and opens glowing cracks.

type Tex = { d: Uint8ClampedArray; w: number; h: number };
const TX: { day: Tex | null; night: Tex | null; cloud: Tex | null } = { day: null, night: null, cloud: null };
if (typeof window !== "undefined") {
  const hnd = delayRender("satellite-explainer earth textures");
  const load = (k: keyof typeof TX, file: string) =>
    new Promise<void>((res) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.width; c.height = img.height;
        const g = c.getContext("2d")!;
        g.drawImage(img, 0, 0);
        TX[k] = { d: g.getImageData(0, 0, img.width, img.height).data, w: img.width, h: img.height };
        res();
      };
      img.onerror = () => res();
      img.src = staticFile(file);
    });
  Promise.all([load("day", "styles/satellite-explainer/earth_day.jpg"), load("night", "styles/satellite-explainer/earth_night.jpg"), load("cloud", "styles/satellite-explainer/earth_clouds.jpg")]).then(() => continueRender(hnd));
}

// small periodic value-noise table over the sphere (u,v) for the ragged heat front and ocean anomaly speckle
const NW = 512, NH = 256;
const NOISE = (() => {
  const a = new Float32Array(NW * NH * 2);
  const hash = (x: number, y: number, s: number) => { let q = (x * 374761393 + y * 668265263 + s * 1442695041) | 0; q = Math.imul(q ^ (q >>> 13), 1274126177); return ((q ^ (q >>> 16)) >>> 0) / 4294967295; };
  const vn = (x: number, y: number, s: number, px: number) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const sx = xf * xf * (3 - 2 * xf), sy = yf * yf * (3 - 2 * yf);
    const a0 = hash(((xi % px) + px) % px, yi, s), b0 = hash((((xi + 1) % px) + px) % px, yi, s);
    const c0 = hash(((xi % px) + px) % px, yi + 1, s), d0 = hash((((xi + 1) % px) + px) % px, yi + 1, s);
    return a0 + (b0 - a0) * sx + (c0 - a0) * sy + (a0 - b0 - c0 + d0) * sx * sy;
  };
  for (let y = 0; y < NH; y++) for (let x = 0; x < NW; x++) {
    let v1 = 0, v2 = 0, amp = 0.5, f = 1;
    for (let o = 0; o < 5; o++) {
      v1 += amp * vn((x / NW) * 8 * f, (y / NH) * 4 * f, 1 + o, 8 * f);
      v2 += amp * vn((x / NW) * 24 * f, (y / NH) * 12 * f, 21 + o, 24 * f);
      amp *= 0.5; f *= 2;
    }
    a[(y * NW + x) * 2] = v1; a[(y * NW + x) * 2 + 1] = v2;
  }
  return a;
})();

export type EarthState = {
  lon0: number; lat0: number; roll?: number;
  sun: [number, number, number]; // light direction in view space: x right, y up, z toward the viewer
  clouds: number; cloudDrift: number; // amount 0..1, drift in degrees
  heat: number; front: number; epi: [number, number]; // heat amount, front radius (deg), epicentre lon/lat
  cracks: number; rimHeat: number; // 0..1
  lights?: number;
};

const smooth = (e0: number, e1: number, x: number) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const HEAT_STOPS: [number, number, number, number][] = [[0, 250, 226, 120], [0.3, 248, 170, 50], [0.6, 228, 70, 30], [0.85, 170, 20, 30], [1, 110, 0, 30]];
const heatCol = (v: number) => {
  for (let i = 1; i < HEAT_STOPS.length; i++) if (v <= HEAT_STOPS[i][0]) {
    const a = HEAT_STOPS[i - 1], b = HEAT_STOPS[i], k = (v - a[0]) / (b[0] - a[0]);
    return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, a[3] + (b[3] - a[3]) * k];
  }
  return [110, 0, 30];
};

// forward projection of lon/lat to the unit disc (x right, y down), for HUD markers. z<0 = far side
export const earthProject = (s: EarthState, lon: number, lat: number) => {
  const d2r = Math.PI / 180;
  const l = (lon - s.lon0) * d2r, p = lat * d2r, p0 = s.lat0 * d2r;
  const x = Math.cos(p) * Math.sin(l);
  const y = Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l);
  const z = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l);
  const r = ((s.roll ?? 0) * Math.PI) / 180;
  return { x: x * Math.cos(r) - y * Math.sin(r), y: -(x * Math.sin(r) + y * Math.cos(r)), z };
};

export const HALO = 1.12; // disc radius = canvas/2/HALO

export const Earth: React.FC<{ size: number; state: EarthState; style?: React.CSSProperties; bloom?: number; trail?: number }> = ({ size, state, style, bloom = 0.45, trail = 0 }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const refB = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    const day = TX.day, night = TX.night, cloud = TX.cloud;
    if (!cv || !day || !night || !cloud) return;
    const N = size, g = cv.getContext("2d")!;
    const im = g.createImageData(N, N), D = im.data;
    const R = N / 2 / HALO, C = N / 2;
    const d2r = Math.PI / 180;
    const p0 = state.lat0 * d2r, sp0 = Math.sin(p0), cp0 = Math.cos(p0), l0 = state.lon0 * d2r;
    const rl = ((state.roll ?? 0) * Math.PI) / 180, cr = Math.cos(rl), sr = Math.sin(rl);
    let [Sx, Sy, Sz] = state.sun; const sl = Math.hypot(Sx, Sy, Sz); Sx /= sl; Sy /= sl; Sz /= sl;
    // half vector for the glint (viewer at +z)
    let Hx = Sx, Hy = Sy, Hz = Sz + 1; const hl = Math.hypot(Hx, Hy, Hz); Hx /= hl; Hy /= hl; Hz /= hl;
    const eL = state.epi[0] * d2r, eP = state.epi[1] * d2r;
    const Ex = Math.cos(eP) * Math.cos(eL), Ey = Math.sin(eP), Ez = Math.cos(eP) * Math.sin(eL);
    const heat = state.heat, front = state.front, crk = state.cracks, rimH = state.rimHeat, clouds = state.clouds;
    const lightsK = state.lights ?? 1;
    const atR = 90 + 165 * rimH, atG = 150 - 40 * rimH, atB = 255 - 215 * rimH;
    const cdrift = state.cloudDrift / 360;
    const dw = day.w, dh = day.h, dd = day.d, nw = night.w, nh = night.h, nd = night.d, cw = cloud.w, ch = cloud.h, cd = cloud.d;
    const halo = HALO;
    for (let j = 0; j < N; j++) {
      const yy = (C - j) / R;
      for (let i = 0; i < N; i++) {
        const xx = (i - C) / R;
        const r2 = xx * xx + yy * yy;
        const k = (j * N + i) * 4;
        if (r2 > 1) {
          const rr = Math.sqrt(r2);
          if (rr < halo) {
            const a = Math.exp(-(rr - 1) * 30);
            const align = Math.max(0, (xx * Sx + yy * Sy) / rr);
            const inten = a * (0.22 + 1.1 * align * (0.35 + Math.max(0, -Sz) * 1.2) + 0.3 * rimH);
            D[k] = atR; D[k + 1] = atG; D[k + 2] = atB; D[k + 3] = Math.min(255, 255 * inten);
          }
          continue;
        }
        const z = Math.sqrt(1 - r2);
        const xr = xx * cr + yy * sr, yr = -xx * sr + yy * cr;
        const sinLat = z * sp0 + yr * cp0;
        const lat = Math.asin(sinLat);
        const lon = l0 + Math.atan2(xr, z * cp0 - yr * sp0);
        let u = lon / (2 * Math.PI) + 0.5; u -= Math.floor(u);
        const v = 0.5 - lat / Math.PI;
        // day (bilinear)
        let fx = u * dw - 0.5, fy = v * dh - 0.5; if (fx < 0) fx += dw;
        let x0 = fx | 0, y0 = fy | 0; const ax = fx - x0, ay = fy - y0;
        let x1 = x0 + 1; if (x1 >= dw) x1 = 0; if (y0 < 0) y0 = 0; const y1 = y0 + 1 < dh ? y0 + 1 : y0;
        const i00 = (y0 * dw + x0) * 4, i10 = (y0 * dw + x1) * 4, i01 = (y1 * dw + x0) * 4, i11 = (y1 * dw + x1) * 4;
        const w00 = (1 - ax) * (1 - ay), w10 = ax * (1 - ay), w01 = (1 - ax) * ay, w11 = ax * ay;
        let r = dd[i00] * w00 + dd[i10] * w10 + dd[i01] * w01 + dd[i11] * w11;
        let gg = dd[i00 + 1] * w00 + dd[i10 + 1] * w10 + dd[i01 + 1] * w01 + dd[i11 + 1] * w11;
        let b = dd[i00 + 2] * w00 + dd[i10 + 2] * w10 + dd[i01 + 2] * w01 + dd[i11 + 2] * w11;
        const oc = Math.min(1, Math.max(0, (b / (Math.max(r, gg) + 6) - 1.15) / 0.4));
        // heat front: the land dries region by region; the ocean only burns in the El Niño tongue
        let h = 0, ring = 0, tg = 0;
        const latd = lat / d2r, lond = lon / d2r;
        if (heat > 0.001) {
          const cl = Math.cos(lat);
          const cosd = cl * Math.cos(lon) * Ex + sinLat * Ey + cl * Math.sin(lon) * Ez;
          const dg = Math.acos(Math.max(-1, Math.min(1, cosd))) / d2r;
          // bilinear noise (no stair-steps along the limb)
          const nfx = u * NW - 0.5, nfy = v * NH - 0.5;
          let nx0 = Math.floor(nfx), ny0 = Math.floor(nfy);
          const nax = nfx - nx0, nay = nfy - ny0;
          let nx1 = nx0 + 1; if (nx0 < 0) nx0 += NW; if (nx1 >= NW) nx1 -= NW; if (ny0 < 0) ny0 = 0;
          const ny1 = ny0 + 1 < NH ? ny0 + 1 : ny0;
          const q00 = (ny0 * NW + nx0) * 2, q10 = (ny0 * NW + nx1) * 2, q01 = (ny1 * NW + nx0) * 2, q11 = (ny1 * NW + nx1) * 2;
          const c00 = (1 - nax) * (1 - nay), c10 = nax * (1 - nay), c01 = (1 - nax) * nay, c11 = nax * nay;
          const n1 = NOISE[q00] * c00 + NOISE[q10] * c10 + NOISE[q01] * c01 + NOISE[q11] * c11;
          const n2 = NOISE[q00 + 1] * c00 + NOISE[q10 + 1] * c10 + NOISE[q01 + 1] * c01 + NOISE[q11 + 1] * c11;
          const f = front + 18 * (n1 - 0.5);
          h = heat * smooth(f, f - 14, dg);
          // shockwave: thin white-hot core + soft falloff, perfectly round
          if (front > 0.3 && front < 179) { const q1 = (dg - front) / 0.7, q2 = (dg - front) / 4.5; ring = heat * (Math.exp(-q1 * q1) + 0.35 * Math.exp(-q2 * q2)); }
          if (h > 0.002) {
            if (oc > 0.02) {
              const inPac = lond > 150 || lond < -76 ? 1 : 0;
              const e = Math.min(1, Math.max(0, (lond >= 0 ? lond - 160 : lond + 200) / 120));
              const wid = 4.5 + 5 * e + 3 * n1;
              let tongue = inPac * Math.min(1, e * 1.3) * Math.exp(-((latd + 1.5) / wid) * ((latd + 1.5) / wid)) * (0.75 + 0.5 * n2);
              if (lond < -76) tongue += 0.5 * Math.exp(-((latd + 6) / 12) * ((latd + 6) / 12)) * Math.exp(-((lond + 82) / 7) * ((lond + 82) / 7));
              const tv = Math.min(1, tongue * 1.15);
              const m = h * oc * smooth(0.04, 0.35, tongue);
              if (m > 0.001) { const hc = heatCol(1 - tv * 0.95); r += (hc[0] - r) * m; gg += (hc[1] - gg) * m; b += (hc[2] - b) * m; }
              tg = tv * tv * h * oc;
              const m2 = h * oc * 0.22 * (1 - m);
              r += (40 - r) * m2; gg += (30 - gg) * m2; b += (48 - b) * m2;
            }
            if (oc < 0.98) {
              const lum = 0.3 * r + 0.59 * gg + 0.11 * b, m = h * (1 - oc) * 0.88;
              r += (lum * 1.3 + 52 - r) * m; gg += (lum * 0.95 + 20 - gg) * m; b += (lum * 0.5 - b) * m;
            }
          }
        }
        // cracks: a fine Worley network on the driest land
        let crack = 0;
        if (crk > 0.001 && h > 0.5 && oc < 0.5) {
          const X = lond * Math.cos(lat) * 0.7, Y = latd * 0.7;
          const cx = Math.floor(X), cy = Math.floor(Y);
          let f1 = 9, f2 = 9;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            const gx = cx + dx, gy = cy + dy;
            let q = Math.imul(gx * 73856093 ^ gy * 19349663, 2654435761);
            const hx = ((q >>> 8) & 1023) / 1023; q = Math.imul(q ^ (q >>> 15), 2246822519);
            const hy = ((q >>> 8) & 1023) / 1023;
            const ex = gx + 0.15 + 0.7 * hx - X, ey = gy + 0.15 + 0.7 * hy - Y;
            const dd2 = ex * ex + ey * ey;
            if (dd2 < f1) { f2 = f1; f1 = dd2; } else if (dd2 < f2) f2 = dd2;
          }
          const edge = Math.sqrt(f2) - Math.sqrt(f1);
          crack = smooth(0.05, 0.0, edge) * crk * ((h - 0.5) / 0.5) * (1 - oc) * 0.5;
        }
        // clouds (bilinear-lite: nearest is fine at this density), shaded, evaporate under heat
        let cu = u + cdrift; cu -= Math.floor(cu);
        const ci = (((v * ch) | 0) * cw + ((cu * cw) | 0)) * 4;
        let cA = Math.min(1, Math.max(0, (cd[ci] / 255 - 0.1) * 1.35)) * clouds * (1 - 0.97 * h);
        // lighting
        const ndl = xx * Sx + yy * Sy + z * Sz;
        const dayK = smooth(-0.14, 0.2, ndl);
        const diff = Math.max(0, ndl);
        const lit = 0.035 + 1.18 * Math.pow(diff, 0.8);
        let R8 = r * lit, G8 = gg * lit, B8 = b * lit;
        const cl8 = 255 * (0.04 + 1.08 * diff);
        R8 += (cl8 * (1 + 0.04 * rimH) - R8) * cA; G8 += (cl8 * (1 - 0.05 * rimH) - G8) * cA; B8 += (cl8 * (1.02 - 0.12 * rimH) - B8) * cA;
        // city lights on the night side
        const ni2 = (((v * nh) | 0) * nw + ((u * nw) | 0)) * 4;
        const city = Math.max(0, nd[ni2] - 68) / 187;
        if (city > 0) { const L = city * city * (1 - dayK) * (1 - 0.8 * cA) * lightsK * 330; R8 += L; G8 += L * 0.74; B8 += L * 0.42; }
        // sun glint on open ocean
        const nh2 = xx * Hx + yy * Hy + z * Hz;
        if (nh2 > 0.95 && oc > 0.1) { const sp = Math.pow(nh2, 420) * oc * (1 - cA) * dayK * (1 - 0.85 * h) * 120; R8 += sp; G8 += sp * (0.92 - 0.3 * rimH); B8 += sp * (0.8 - 0.6 * rimH); }
        // twilight band + atmosphere scattering toward the limb
        const tw = Math.exp(-(ndl / 0.05) * (ndl / 0.05)) * 0.07 * smooth(-0.06, 0.02, ndl);
        R8 += 255 * tw * 0.55; G8 += 120 * tw * 0.55; B8 += 50 * tw * 0.55;
        const fres = Math.pow(1 - z, 2.6) * (0.3 + 1.1 * Math.max(0, ndl + 0.35));
        R8 += atR * fres * 0.9; G8 += atG * fres * 0.9; B8 += atB * fres * 0.9;
        // emissive: heat front and cracks
        if (ring > 0.01) { R8 += 255 * ring * 1.5; G8 += 225 * ring * 1.5; B8 += 150 * ring * 1.5; }
        if (tg > 0.01) { R8 += 255 * tg * 0.55; G8 += 170 * tg * 0.55; B8 += 80 * tg * 0.55; }
        if (crack > 0.01) { R8 = R8 * (1 - crack * 0.4) + 255 * crack * 1.2; G8 = G8 * (1 - crack * 0.4) + 150 * crack * 1.2; B8 = B8 * (1 - crack * 0.4) + 40 * crack; }
        D[k] = R8 > 255 ? 255 : R8; D[k + 1] = G8 > 255 ? 255 : G8; D[k + 2] = B8 > 255 ? 255 : B8; D[k + 3] = 255;
      }
    }
    g.putImageData(im, 0, 0);
    const b2 = refB.current;
    if (b2) { const g2 = b2.getContext("2d")!; g2.clearRect(0, 0, N, N); g2.drawImage(cv, 0, 0); }
  });
  return (
    <div style={{ position: "absolute", ...style }}>
      <canvas ref={ref} width={size} height={size} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <canvas ref={refB} width={size} height={size} style={{
        position: "absolute", inset: 0, width: "100%", height: "100%", mixBlendMode: "screen",
        filter: `blur(${Math.round(size / 70)}px) brightness(1.5)`, opacity: bloom,
        transform: trail > 0.01 ? `scale(${1 + 0.12 * trail})` : undefined,
      }} />
    </div>
  );
};
