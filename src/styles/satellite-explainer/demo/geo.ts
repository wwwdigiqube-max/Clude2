import { Easing, interpolate } from "remotion";
import { noise2D } from "@remotion/noise";

import MG from "./mapgeo.json";

// Mercator map strip (tools/v14-maps.cjs): lon 90E → 330E, lat 82N → 78S, public/styles/satellite-explainer/map.jpg
export const MAP_W = MG.W;
export const MAP_H = MG.H;
export const PPD = MG.PPD;
const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const latOfY = (y: number) => ((2 * Math.atan(Math.exp((MG.YTOP - y) / MG.R)) - Math.PI / 2) * 180) / Math.PI;

export const SW = 1080;
export const SH = 1920;

// lon/lat → map px (longitudes wrap onto the Pacific-centred strip)
export const proj = (lon: number, lat: number) => {
  let e = lon - MG.LON0;
  while (e < -60) e += 360;
  while (e >= 300) e -= 360;
  return { x: e * PPD, y: MG.YTOP - MG.R * merc(lat) };
};
// keep the frame inside the map (lat/lon clamp in pixel space)
export const clampCam = <T extends Cam>(c: T): T => {
  const p = proj(c.lon, c.lat);
  const hw = SW / 2 / c.s, hh = SH / 2 / c.s;
  const x = Math.min(MAP_W - hw, Math.max(hw, p.x)), y = Math.min(MAP_H - hh, Math.max(hh, p.y));
  let lon = MG.LON0 + x / PPD; if (lon > 180) lon -= 360;
  return { ...c, lon, lat: latOfY(y) };
};

export type Cam = { lon: number; lat: number; s: number; tilt?: number; rot?: number };
export type Key = Cam & { t: number; ease?: (x: number) => number };

const lerpLon = (a: number, b: number, k: number) => {
  let d = b - a;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return a + d * k;
};

export const camAt = (keys: Key[], t: number): Cam => {
  if (t <= keys[0].t) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t <= b.t) {
      const k = (b.ease ?? Easing.bezier(0.65, 0, 0.25, 1))((t - a.t) / (b.t - a.t));
      return {
        lon: lerpLon(a.lon, b.lon, k),
        lat: a.lat + (b.lat - a.lat) * k,
        // zoom interpolates in log space so pushes feel even
        s: Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * k),
        tilt: (a.tilt ?? 0) + ((b.tilt ?? 0) - (a.tilt ?? 0)) * k,
        rot: (a.rot ?? 0) + ((b.rot ?? 0) - (a.rot ?? 0)) * k,
      };
    }
  }
  return keys[keys.length - 1];
};

// screen position of a lon/lat under a camera
export const toScreen = (c: Cam, lon: number, lat: number) => {
  const p = proj(lon, lat), o = proj(c.lon, c.lat);
  const dx = p.x - o.x;
  return { x: SW / 2 + dx * c.s, y: SH / 2 + (p.y - o.y) * c.s };
};

// organic hand-held drift + optional shake
export const drift = (t: number, amp = 6, shake = 0) => ({
  x: noise2D("dx", t * 0.15, 0) * amp + noise2D("sx", t * 9, 0) * shake,
  y: noise2D("dy", 0, t * 0.15) * amp + noise2D("sy", 0, t * 9) * shake,
});

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const ramp = (t: number, a: number, b: number, ease = Easing.bezier(0.33, 0, 0.2, 1)) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
export const win = (t: number, a: number, b: number, fin = 0.35, fout = 0.35) =>
  Math.min(ramp(t, a, a + fin), 1 - ramp(t, b - fout, b));
export const pop = (t: number, a: number, d = 0.45) =>
  interpolate(t, [a, a + d * 0.55, a + d * 0.8, a + d], [0, 1.12, 0.97, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad),
  });
export const FA = (n: number | string) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
