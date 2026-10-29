// Image → black halftone dots (computed once per image in a canvas, cached). Keeps a white "paper" base inside the
// silhouette like printed halftone. Works with transparent PNGs; opaque images get their white background keyed out.
import React, { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { K } from "./theme";

export type Halftoned = { url: string; w: number; h: number };
export type HalftoneOpts = {
  width: number; // output width px (height keeps aspect)
  cell?: number; // dot grid pitch px
  ink?: string;
  paper?: string | null; // base colour inside the silhouette (null = none)
  gamma?: number; // >1 = lighter midtones
  contrast?: number;
  tone?: number; // 0 = pure dots on white · 0.3–0.5 = keep a soft grey shading under the dots (reads as 3D form)
};

const cache = new Map<string, Promise<Halftoned>>();

const load = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("image load failed: " + src.slice(0, 80)));
    i.src = src;
  });

async function make(src: string, o: Required<HalftoneOpts>): Promise<Halftoned> {
  const img = await load(src);
  const W = Math.round(o.width), H = Math.round((img.height * W) / img.width);
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.drawImage(img, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H).data;
  const N = W * H;
  const lum = new Float32Array(N), A = new Uint8Array(N);
  let transparent = 0;
  for (let i = 0; i < N; i++) {
    lum[i] = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255;
    A[i] = d[i * 4 + 3];
    if (A[i] < 200) transparent++;
  }
  // No real alpha → flood-fill near-white background from the borders.
  if (transparent < N * 0.01) {
    const stack: number[] = [];
    const push = (i: number) => { if (A[i] && lum[i] > 0.9) { A[i] = 0; stack.push(i); } };
    for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
    for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
    while (stack.length) {
      const i = stack.pop()!, x = i % W, y = (i / W) | 0;
      if (x > 0) push(i - 1);
      if (x < W - 1) push(i + 1);
      if (y > 0) push(i - W);
      if (y < H - 1) push(i + W);
    }
  }
  const out = document.createElement("canvas");
  out.width = W; out.height = H;
  const o2 = out.getContext("2d")!;
  if (o.paper) {
    const base = o2.createImageData(W, H);
    const m = o.paper.match(/\w\w/g)!.map((h) => parseInt(h, 16));
    for (let i = 0; i < N; i++)
      if (A[i] > 40) {
        const k = 1 - o.tone * (1 - Math.min(1, lum[i] * 1.08)); // soft grey shading toward the paper colour
        base.data[i * 4] = m[0] * k; base.data[i * 4 + 1] = m[1] * k; base.data[i * 4 + 2] = m[2] * k; base.data[i * 4 + 3] = A[i];
      }
    o2.putImageData(base, 0, 0);
  }
  o2.fillStyle = o.ink;
  const s = o.cell;
  for (let row = 0, y = 0; y < H + s; y += s * 0.866, row++) {
    for (let x = row % 2 ? s / 2 : 0; x < W + s; x += s) {
      let sum = 0, cov = 0, n = 0;
      for (let yy = Math.max(0, Math.floor(y - s / 2)); yy < Math.min(H, y + s / 2); yy += 2)
        for (let xx = Math.max(0, Math.floor(x - s / 2)); xx < Math.min(W, x + s / 2); xx += 2) {
          const i = yy * W + xx;
          n++;
          if (A[i] > 100) { sum += lum[i]; cov++; }
        }
      if (!n || cov < n * 0.35) continue;
      const L = sum / cov;
      const dark = Math.pow(Math.min(1, Math.max(0, (1 - L - 0.04) * o.contrast)), o.gamma);
      const r = (s / 2) * 1.18 * Math.sqrt(dark);
      if (r < 0.45) continue;
      o2.beginPath();
      o2.arc(x, y, r, 0, Math.PI * 2);
      o2.fill();
    }
  }
  return { url: out.toDataURL("image/png"), w: W, h: H };
}

/** Halftone an image once (cached); blocks rendering until ready. */
export const useHalftone = (src: string, opts: HalftoneOpts): Halftoned | null => {
  const o: Required<HalftoneOpts> = { cell: 7, ink: K.ink, paper: "#ffffff", gamma: 1.05, contrast: 1.15, tone: 0, ...opts };
  const key = `${src.slice(0, 200)}|${src.length}|${o.width}|${o.cell}|${o.ink}|${o.paper}|${o.gamma}|${o.contrast}|${o.tone}`;
  const [ht, setHt] = useState<Halftoned | null>(null);
  const [handle] = useState(() => delayRender("halftone " + key.slice(0, 60), { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    let p = cache.get(key);
    if (!p) { p = make(src, o); cache.set(key, p); }
    p.then((r) => { setHt(r); continueRender(handle); }).catch((e) => { console.error(e); continueRender(handle); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return ht;
};

export const HalftoneImg: React.FC<{ src: string; opts: HalftoneOpts; style?: React.CSSProperties }> = ({ src, opts, style }) => {
  const ht = useHalftone(src, opts);
  if (!ht) return null;
  return <img src={ht.url} width={ht.w} height={ht.h} style={{ display: "block", ...style }} />;
};
