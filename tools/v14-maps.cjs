// v14 map textures in Mercator (like the reference): lon 90E → 330E (240°), lat 82N → 78S.
// map.jpg (26 px/deg), landmask.png, sst_nino.png, sst_hot.png (half res). Usage: node tools/v14-maps.cjs [map|heat|all]
// Source (not shipped, public domain): NASA Blue Marble Next Generation, July, 21600×10800 → <textures dir>/src/bm07.jpg.
// Change G (lon/lat window) for another region. The kit's demo loads sst_*.webp: convert the PNGs (ffmpeg -c:v libwebp)
// or change the extensions in demo/Video.tsx.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
// kit: the satellite-explainer style folders; original project: video 14
const KIT = !fs.existsSync(path.join(__dirname, "../src/v14"));
const DIR = path.join(__dirname, KIT ? "../public/styles/satellite-explainer" : "../public/v14");
const GEO = path.join(__dirname, KIT ? "../src/styles/satellite-explainer/demo/mapgeo.json" : "../src/v14/mapgeo.json");
const G = { LON0: 90, SPAN: 240, PPD: 26, LATMAX: 82, LATMIN: -78 };
const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const R = (G.PPD * 180) / Math.PI;
const YTOP = R * merc(G.LATMAX);
const W = G.SPAN * G.PPD, H = Math.round(YTOP - R * merc(G.LATMIN));
const latOfY = (y) => (Math.atan(Math.sinh((YTOP - y) / R)) * 360) / Math.PI - 0; // inverse Mercator (deg)
const latAt = (y) => (2 * Math.atan(Math.exp((YTOP - y) / R)) - Math.PI / 2) * 180 / Math.PI;
fs.writeFileSync(GEO, JSON.stringify({ ...G, W, H, R, YTOP }));
const mode = process.argv[2] || "all";
const cl = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);
const lerp = (a, b, t) => a + (b - a) * t;

if (mode === "map" || mode === "all") {
  // source 21600×10800 (60 px/deg): take lon 90E→180 and -180→-30, horizontally scaled to W, full latitude
  const SH = 10800;
  const src = execFileSync("ffmpeg", ["-v", "error", "-i", path.join(DIR, "src/bm07.jpg"), "-filter_complex",
    `[0]split[a][b];[a]crop=5400:${SH}:16200:0[e];[b]crop=9000:${SH}:0:0[w];[e][w]hstack,scale=${W}:${SH}:flags=lanczos`, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: 1 << 30 });
  const out = Buffer.alloc(W * H * 3), mask = Buffer.alloc(W * H);
  const deep = [20, 78, 96], mid = [44, 120, 134], shallow = [120, 188, 190];
  for (let y = 0; y < H; y++) {
    const lat = latAt(y + 0.5);
    const sy = (90 - lat) * 60 - 0.5, y0 = Math.max(0, Math.floor(sy)), y1 = Math.min(SH - 1, y0 + 1), fy = sy - y0;
    for (let x = 0; x < W; x++) {
      const a = (y0 * W + x) * 3, b = (y1 * W + x) * 3;
      const r = lerp(src[a], src[b], fy), g = lerp(src[a + 1], src[b + 1], fy), bl = lerp(src[a + 2], src[b + 2], fy);
      const oc = Math.min(1, Math.max(0, (bl / (Math.max(r, g) + 4) - 1.08) / 0.35));
      const l = (r + g + bl) / 3;
      let lr = l + (r - l) * 1.15, lg = l + (g - l) * 1.15, lb = l + (bl - l) * 1.15;
      lr = 255 * Math.pow(cl(lr) / 255, 0.88); lg = 255 * Math.pow(cl(lg) / 255, 0.88); lb = 255 * Math.pow(cl(lb) / 255, 0.88);
      const t = Math.min(1, Math.max(0, (bl - 35) / 170));
      const c = t < 0.5 ? [0, 1, 2].map((k) => lerp(deep[k], mid[k], t * 2)) : [0, 1, 2].map((k) => lerp(mid[k], shallow[k], (t - 0.5) * 2));
      const i = (y * W + x) * 3;
      out[i] = cl(lerp(lr, c[0], oc)); out[i + 1] = cl(lerp(lg, c[1], oc)); out[i + 2] = cl(lerp(lb, c[2], oc));
      mask[y * W + x] = Math.round(255 * (1 - oc));
    }
  }
  fs.writeFileSync(path.join(DIR, "m.rgb"), out);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", `${W}x${H}`, "-i", path.join(DIR, "m.rgb"), "-q:v", "2", path.join(DIR, "map.jpg")]);
  fs.writeFileSync(path.join(DIR, "k.raw"), mask);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "gray", "-s", `${W}x${H}`, "-i", path.join(DIR, "k.raw"), "-vf", `scale=${W / 2}:${Math.round(H / 2)}`, path.join(DIR, "landmask.png")]);
  fs.unlinkSync(path.join(DIR, "m.rgb")); fs.unlinkSync(path.join(DIR, "k.raw"));
  console.log("map.jpg", W, H);
}

if (mode === "heat" || mode === "all") {
  const w = W / 2, h = Math.round(H / 2);
  const mask = execFileSync("ffmpeg", ["-v", "error", "-i", path.join(DIR, "landmask.png"), "-vf", `scale=${w}:${h}`, "-f", "rawvideo", "-pix_fmt", "gray", "-"], { maxBuffer: 1 << 28 });
  const hash = (x, y, s) => { let q = (x * 374761393 + y * 668265263 + s * 1442695041) | 0; q = (q ^ (q >>> 13)) * 1274126177 | 0; return ((q ^ (q >>> 16)) >>> 0) / 4294967295; };
  const sm = (t) => t * t * (3 - 2 * t);
  const vn = (x, y, s) => { const xi = Math.floor(x), yi = Math.floor(y), xf = sm(x - xi), yf = sm(y - yi); const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s); return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf; };
  const fbm = (x, y, s) => { let v = 0, a = 0.5, f = 1; for (let o = 0; o < 6; o++) { v += a * vn(x * f, y * f, s + o * 17); f *= 2.07; a *= 0.5; } return v; };
  const stops = [[-1, [40, 60, 190]], [-0.45, [70, 170, 225]], [-0.1, [185, 228, 235]], [0.12, [240, 232, 190]], [0.32, [250, 215, 80]], [0.6, [245, 140, 35]], [0.95, [215, 35, 30]], [1.35, [120, 0, 35]]];
  const col = (v) => { if (v <= stops[0][0]) return stops[0][1]; for (let i = 1; i < stops.length; i++) if (v <= stops[i][0]) { const [a, ca] = stops[i - 1], [b, cb] = stops[i]; const t = (v - a) / (b - a); return ca.map((c, k) => c + (cb[k] - c) * t); } return stops.at(-1)[1]; };
  const g = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s));
  const dlon = (a, b) => { let d = a - b; while (d > 180) d -= 360; while (d < -180) d += 360; return d; };
  const make = (name, field, landAlpha, alphaOf) => {
    const out = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y++) {
      const lat = latAt((y + 0.5) * 2);
      for (let x = 0; x < w; x++) {
        let lon = G.LON0 + (x * 2) / G.PPD; if (lon > 180) lon -= 360;
        const n = fbm(x / 70, y / 70, 1), sp = fbm(x / 11, y / 11, 7), v = field(lon, lat, n, sp), c = col(v), i = y * w + x;
        const land = mask[i] / 255;
        out[i * 4] = c[0]; out[i * 4 + 1] = c[1]; out[i * 4 + 2] = c[2];
        out[i * 4 + 3] = Math.round(255 * alphaOf(v) * (1 - land * (1 - landAlpha)));
      }
    }
    fs.writeFileSync(path.join(DIR, "h.raw"), out);
    execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", `${w}x${h}`, "-i", path.join(DIR, "h.raw"), path.join(DIR, name)]);
    fs.unlinkSync(path.join(DIR, "h.raw")); console.log(name);
  };
  // near-normal water mostly see-through so the teal ocean shows; anomalies opaque
  const soft = (v) => Math.min(1, 0.28 + 1.1 * Math.abs(v - 0.02));
  make("sst_nino.png", (lon, lat, n, sp) => {
    const inPac = lon > 150 ? 1 : lon < 0 ? Math.max(0, Math.min(1, (-77 - lon) / 6)) : 0;
    const tongue = inPac * g(lat, -1, 5.5 + 3 * n) * Math.max(0, Math.min(1, (dlon(lon, 160) + 10) / 60)) * 1.25 * (0.8 + 0.4 * n);
    const coast = (lon < -76 ? 1 : 0) * g(lat, -5, 12) * g(dlon(lon, -82), 0, 10) * 0.5;
    const ne = g(lat, 38, 9) * g(dlon(lon, -150), 0, 20) * 0.8;
    const south = g(lat, -35, 8) * g(dlon(lon, -120), 0, 25) * 0.45;
    return -0.15 + 0.55 * (n - 0.5) + 0.7 * (sp - 0.5) + tongue + coast + ne + south;
  }, 0, soft);
  make("sst_hot.png", (lon, lat, n, sp) => 0.55 + 0.7 * (n - 0.5) + 0.8 * (sp - 0.5) + 0.35 * g(lat, 0, 15), 0.5, () => 0.9);
}
