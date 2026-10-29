import React, { useLayoutEffect, useRef } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

// Orthographic globe rendered per-pixel from the graded world texture (public/styles/satellite-explainer/world.jpg).
const TW = 2048, TH = 1024;
let tex: Uint8ClampedArray | null = null;
const handle = typeof window !== "undefined" ? delayRender("satellite-explainer globe texture") : null;
if (typeof window !== "undefined") {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = TW; c.height = TH;
    const g = c.getContext("2d")!;
    g.drawImage(img, 0, 0, TW, TH);
    tex = g.getImageData(0, 0, TW, TH).data;
    if (handle !== null) continueRender(handle);
  };
  img.onerror = () => handle !== null && continueRender(handle);
  img.src = staticFile("styles/satellite-explainer/world.jpg");
}

export const Globe: React.FC<{
  size: number; lon0: number; lat0?: number; heat?: number; x?: number; y?: number; o?: number;
}> = ({ size, lon0, lat0 = 12, heat = 0, x = 0, y = 0, o = 1 }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv || !tex) return;
    const N = size;
    const g = cv.getContext("2d")!;
    const im = g.createImageData(N, N);
    const d = im.data;
    const R = N / 2 / 1.1;
    const p0 = (lat0 * Math.PI) / 180, sp0 = Math.sin(p0), cp0 = Math.cos(p0);
    const l0 = (lon0 * Math.PI) / 180;
    // light from upper-left-front
    const Lx = -0.55, Ly = -0.45, Lz = 0.7;
    for (let j = 0; j < N; j++) {
      const yy = (N / 2 - j) / R;
      for (let i = 0; i < N; i++) {
        const xx = (i - N / 2) / R;
        const r2 = xx * xx + yy * yy;
        const k = (j * N + i) * 4;
        if (r2 > 1) {
          // atmosphere halo
          const rr = Math.sqrt(r2);
          if (rr < 1.09) {
            const a = Math.pow(1 - (rr - 1) / 0.09, 2.2);
            d[k] = 120 + 135 * heat; d[k + 1] = 190 - 90 * heat; d[k + 2] = 255 - 190 * heat; d[k + 3] = 200 * a;
          }
          continue;
        }
        const z = Math.sqrt(1 - r2);
        // inverse orthographic
        const lat = Math.asin(z * sp0 + yy * cp0);
        const lon = l0 + Math.atan2(xx, z * cp0 - yy * sp0);
        let u = ((lon / (2 * Math.PI) + 0.5) % 1 + 1) % 1;
        const v = 0.5 - lat / Math.PI;
        const ti = ((Math.floor(v * TH) * TW + Math.floor(u * TW)) * 4);
        let lit = Math.max(0.18, xx * Lx + yy * -Ly + z * Lz) * 1.15;
        const rim = Math.pow(1 - z, 3);
        let R8 = tex[ti] * lit, G8 = tex[ti + 1] * lit, B8 = tex[ti + 2] * lit;
        if (heat > 0) { R8 = R8 + (255 - R8) * heat * 0.55; G8 = G8 * (1 - heat * 0.35); B8 = B8 * (1 - heat * 0.6); }
        d[k] = Math.min(255, R8 + rim * 120); d[k + 1] = Math.min(255, G8 + rim * 170); d[k + 2] = Math.min(255, B8 + rim * 255); d[k + 3] = 255;
      }
    }
    g.putImageData(im, 0, 0);
  });
  return <canvas ref={ref} width={size} height={size} style={{ position: "absolute", left: x - size / 2, top: y - size / 2, opacity: o }} />;
};
