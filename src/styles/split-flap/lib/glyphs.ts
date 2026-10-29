// Video 25 · flap glyphs as a signed-distance-field atlas: every character is drawn on a full card (2:3, hinge at
// the middle) on a canvas, turned into a distance field (exact Euclidean distance transform) and packed in a small
// texture — the shader cuts the edge with smoothstep, so letters stay razor sharp even in extreme macro at 4K.
import * as THREE from "three";

const CW = 512; // raster card width
const CH = 768; // raster card height
const SW = 160; // distance-field cell width
const SH = 240; // distance-field cell height
const SPREAD = 30; // raster px mapped to ±0.5 of the field
export const ATLAS_COLS = 8;

const INF = 1e20;
/** 1D squared distance transform (Felzenszwalb & Huttenlocher) */
function edt1(f: Float64Array, n: number, d: Float64Array, v: Int32Array, z: Float64Array) {
  let k = 0;
  v[0] = 0;
  z[0] = -INF;
  z[1] = INF;
  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = INF;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
}
/** squared distance to the nearest "on" pixel, for every pixel */
function edt2(on: Uint8Array, w: number, h: number) {
  const g = new Float64Array(w * h);
  for (let i = 0; i < w * h; i++) g[i] = on[i] ? 0 : INF;
  const n = Math.max(w, h);
  const f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = g[y * w + x];
    edt1(f, h, d, v, z);
    for (let y = 0; y < h; y++) g[y * w + x] = d[y];
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = g[y * w + x];
    edt1(f, w, d, v, z);
    for (let x = 0; x < w; x++) g[y * w + x] = d[x];
  }
  return g;
}
/** signed distance (px, positive inside) from a canvas alpha mask */
function signedField(alpha: Uint8ClampedArray, w: number, h: number) {
  const inside = new Uint8Array(w * h), outside = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const a = alpha[i * 4 + 3] > 127;
    inside[i] = a ? 1 : 0;
    outside[i] = a ? 0 : 1;
  }
  const dIn = edt2(outside, w, h); // for inside pixels: distance to the nearest outside pixel
  const dOut = edt2(inside, w, h); // for outside pixels: distance to the nearest inside pixel
  const s = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) s[i] = inside[i] ? Math.sqrt(dIn[i]) - 0.5 : -(Math.sqrt(dOut[i]) - 0.5);
  return s;
}

export type GlyphAtlas = { tex: THREE.DataTexture; cols: number; rows: number; index: (ch: string) => number };

/** chars: every character the flaps can show (uppercase, digits, ':' …); font: a loaded font family */
export function buildGlyphAtlas(chars: string[], font: string): GlyphAtlas {
  const cols = ATLAS_COLS;
  const rows = Math.ceil(chars.length / cols);
  const AW = cols * SW, AH = rows * SH;
  const data = new Uint8Array(AW * AH * 4).fill(0);
  const cv = document.createElement("canvas");
  cv.width = CW;
  cv.height = CH;
  const ctx = cv.getContext("2d", { willReadFrequently: true })!;
  // size the font so a capital is 66% of the card height
  ctx.font = `400 200px ${font}`;
  const m = ctx.measureText("H");
  const capAt200 = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  const size = (0.66 * CH * 200) / capAt200;
  chars.forEach((ch, gi) => {
    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = "#fff";
    ctx.font = `400 ${size}px ${font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const mm = ctx.measureText(ch);
    // centre the glyph's own box on the hinge (the colon too)
    const y = CH / 2 + (mm.actualBoundingBoxAscent - mm.actualBoundingBoxDescent) / 2;
    ctx.fillText(ch, CW / 2, y);
    const img = ctx.getImageData(0, 0, CW, CH).data;
    const sd = signedField(img, CW, CH);
    const cx = (gi % cols) * SW, cy = Math.floor(gi / cols) * SH;
    for (let j = 0; j < SH; j++)
      for (let i = 0; i < SW; i++) {
        // cell row j counts up from the card's bottom (texture v up); canvas rows count down
        const fx = ((i + 0.5) / SW) * CW - 0.5, fy = (1 - (j + 0.5) / SH) * CH - 0.5;
        const x0 = Math.max(0, Math.min(CW - 2, Math.floor(fx))), y0 = Math.max(0, Math.min(CH - 2, Math.floor(fy)));
        const ax = fx - x0, ay = fy - y0;
        const s = sd[y0 * CW + x0] * (1 - ax) * (1 - ay) + sd[y0 * CW + x0 + 1] * ax * (1 - ay) + sd[(y0 + 1) * CW + x0] * (1 - ax) * ay + sd[(y0 + 1) * CW + x0 + 1] * ax * ay;
        const v = Math.max(0, Math.min(255, Math.round((0.5 + s / (2 * SPREAD)) * 255)));
        const o = ((cy + j) * AW + cx + i) * 4;
        data[o] = v;
        data[o + 1] = v;
        data[o + 2] = v;
        data[o + 3] = 255;
      }
  });
  const tex = new THREE.DataTexture(data, AW, AH, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 8;
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  const map = new Map(chars.map((c, i) => [c, i]));
  return { tex, cols, rows, index: (ch: string) => map.get(ch) ?? -1 };
}
