// ============================ V03 · RENAISSANCE — a night painted by Leonardo (sfumato) ============================
// «a mind that won't calm down»
//  WIDE  (0 → 6.32 s) a warm stone chamber at blue hour. Through an arched window: a Leonardesque valley — layered blue
//        pinnacles, a lake, a winding river, mist — under a pale moon (placed exactly where the engine's godRays
//        transition bursts, so the cut is born from the moon). A small oil lamp in a wall niche = the warm key light from
//        the upper left. He sits hunched on the edge of a linen bed, a little turned, hands on his knees.
//  CLOSE (5.87 → 17.6 s) Mona-Lisa framing against the valley. The hands clutch the head, the vortex thickens to the
//        peak, golden rays break through (13.0), then the spirals unwind into a few silver lines, the valley clears, the
//        eyes open — a small «o», then the faintest ambiguous smile.
//  How it is painted: every form (head, hands, body, drapery, bed linen) is a height field — ellipsoids, capsules and
//        drapes with Gaussian folds — lit per pixel by one Leonardesque light (warm key from the upper left, soft wrapped
//        terminator, cool reflected light in the shadows, silver moon rim, warm bounce) and softened = sfumato. The
//        thought-vortex is pure line: sepia, sanguine and gold strands with curls, like his water-turbulence studies.
//  Pure function of t: every random is seeded; the vortex rotation is the integral of its speed curve.
(() => {
const { W, H } = STAGE;                                   // 1080 × 1920
const { clamp, lerp, ss } = U, P = PAINT, TAU = Math.PI * 2;
const NS = 'u03renaissance_';
const RS = 1.25;                                           // world caches are drawn 1.25× (the push-in reaches 1.2×)
const MG = 48;                                             // world margin around the frame (camera drift)
const cached = (k, w, h, fn) => P.cached(NS + k, w, h, fn);
const scratch = k => P.scratch(NS + k);
const sized = (k, w, h) => cached(`sz_${k}_${w}x${h}`, w, h, () => {});
const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const smooth = (pts, closed = true) => RIG.smooth(pts, closed);
const rng = U.rng;
const T3 = () => window.U03;
const after = (t, t0, k) => (t < t0 ? 0 : (1 - Math.exp(-(t - t0) * 30)) * Math.exp(-(t - t0) * k));
const kv = (keys, t) => { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [t0, v0] = keys[i - 1], [t1, v1] = keys[i]; return lerp(v0, v1, ss(t0, t1, t)); } return keys[keys.length - 1][1]; };

// ---------------------------------------------------------------- timeline
function anx(t) {                                           // 0 calm … 1 the storm
  const u = T3();
  let a = 0.06;
  a += 0.34 * ss(u.swirlStart, u.TR_START, t);
  a += 0.12 * ss(u.eyesWide - 0.1, u.eyesWide + 0.5, t);
  a += 0.12 * ss(u.handsUp[0], u.squeeze + 0.2, t);
  a += 0.16 * ss(u.slits[0], u.slits[1], t);
  a += 0.20 * ss(u.slits[1], u.peak[0] + 0.3, t);
  a -= 0.42 * ss(u.peak[1] - 0.1, u.ease[1], t);
  a -= 0.26 * ss(u.handsDown[0], u.eyesOpen + 0.2, t);
  a -= 0.30 * ss(u.fade[0], u.fade[1] - 0.8, t);
  return clamp(a);
}
function barPulse(t) { const b = T3().bars; let last = -99; for (let i = 0; i < b.length; i++) { if (b[i] <= t) last = b[i]; else break; } return after(t, last, 3.4); }
function hitPulse(t) { const h = T3().hits; let v = 0; for (let i = 0; i < h.length; i++) v = Math.max(v, after(t, h[i], i === 2 ? 1.3 : 2.4) * (i === 2 ? 1 : 0.6)); return v; }
const omega = t => 0.42 + 2.5 * Math.pow(anx(t), 1.7) + 0.55 * barPulse(t);          // vortex angular speed (rad/s)
function vphase(t) { const n = Math.max(8, Math.ceil(t / 0.02)), dt = t / n; let s = 0; for (let i = 0; i < n; i++) s += omega((i + 0.5) * dt); return s * dt; }
const release = t => ss(T3().fade[0] - 0.3, T3().fade[1] - 0.6, t);                 // calm, silvery end

// ---------------------------------------------------------------- sprites, textures, helpers
const blobC = () => cached('blob', 128, 128, g => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.62)'); gr.addColorStop(0.7, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
const tint = col => cached('blob_' + col, 128, 128, g => { g.drawImage(blobC(), 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, 128, 128); });
const blob = (g, x, y, rx, ry, col, a) => { if (a <= 0.003) return; const o = g.globalAlpha; g.globalAlpha = o * Math.min(1, a); g.drawImage(tint(col), x - rx, y - ry, rx * 2, ry * 2); g.globalAlpha = o; };
function noiseTex(key, w, h, f, oct, seed, fn) {
  return cached('nz_' + key, w, h, g => { const im = g.createImageData(w, h), d = im.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = P.fbm(x * f + seed * 17.3, y * f + seed * 5.1, oct), i = (y * w + x) * 4, c = fn(n, x, y); d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = c[3] ?? 255; }
    g.putImageData(im, 0, 0); });
}
const nzWall = () => noiseTex('wall', 270, 480, 0.035, 5, 3, n => { const v = 128 + n * 120; return [v + 6, v, v - 8]; });
const QW = Math.ceil(W / 4), QH = Math.ceil(H / 4);
function softOf(src, key, px) { const B = sized('soft_' + key, QW, QH), g = B.getContext('2d'); g.reset(); g.filter = `blur(${px}px)`; g.drawImage(src, 0, 0, src.width, src.height, 0, 0, QW, QH); g.filter = 'none'; return B; }
function bake(key, bx, by, bw, bh, blurPx, fn, res = RS) {          // a painted world layer → cached, softened once
  return cached(key, Math.ceil(bw * res), Math.ceil(bh * res), g => {
    const raw = document.createElement('canvas'); raw.width = Math.ceil(bw * res); raw.height = Math.ceil(bh * res);
    const rg = raw.getContext('2d'); rg.scale(res, res); rg.translate(-bx, -by); fn(rg);
    if (blurPx > 0) { g.filter = `blur(${blurPx * res}px)`; g.drawImage(raw, 0, 0); g.filter = 'none'; g.globalAlpha = 0.55; g.drawImage(raw, 0, 0); g.globalAlpha = 1; }
    else g.drawImage(raw, 0, 0);
  });
}
const linGrad = (g, x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([k, c, a]) => gr.addColorStop(k, typeof c === 'string' ? c : rgba(c, a ?? 1))); return gr; };
const radGrad = (g, x, y, r0, r1, stops) => { const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([k, c, a]) => gr.addColorStop(k, typeof c === 'string' ? c : rgba(c, a ?? 1))); return gr; };
const archPath = (xl, xr, cy, yb) => { const p = new Path2D(), r = (xr - xl) / 2; p.moveTo(xl, yb); p.lineTo(xl, cy); p.arc(xl + r, cy, r, Math.PI, 0); p.lineTo(xr, yb); p.closePath(); return p; };
const polyP = pts => U.poly(pts);
const bandAlong = (pts, w0, w1 = w0) => KIT.ribbon(KIT.densify(pts, 6), q => lerp(w0, w1, q));
const INK = { sepia: [70, 42, 22], sang: [186, 82, 48], gold: [232, 190, 104], ivory: [246, 238, 216], silver: [214, 226, 234] };
const INKK = ['sepia', 'sang', 'gold', 'ivory', 'silver'];

// ---------------------------------------------------------------- SCULPT: forms as height fields, lit like a Leonardo panel
const mkRamp = st => { const out = new Float32Array(768); for (let i = 0; i < 256; i++) { const v = i / 255; let k = 0; while (k < st.length - 2 && v > st[k + 1][0]) k++; const q = clamp((v - st[k][0]) / (st[k + 1][0] - st[k][0])); for (let j = 0; j < 3; j++) out[i * 3 + j] = lerp(st[k][1][j], st[k + 1][1][j], q); } return out; };
const SKIN_LUT = mkRamp([[0, [28, 20, 14]], [0.18, [60, 44, 31]], [0.38, [106, 88, 71]], [0.56, [146, 137, 122]], [0.76, [188, 180, 162]], [1, [226, 218, 198]]]);
const MATS = [
  { n: 'skin', lut: SKIN_LUT, sss: 1, wrap: 0.32, sheen: 0, shc: [0, 0, 0] },
  { n: 'tunic', lut: mkRamp([[0, [20, 7, 4]], [0.25, [50, 18, 11]], [0.5, [90, 36, 23]], [0.75, [132, 66, 45]], [1, [182, 112, 82]]]), sss: 0.3, wrap: 0.24, sheen: 0.12, shc: [140, 64, 46] },
  { n: 'mantle', lut: mkRamp([[0, [7, 14, 13]], [0.25, [18, 35, 33]], [0.5, [36, 64, 59]], [0.75, [68, 102, 91]], [1, [128, 162, 146]]]), sss: 0, wrap: 0.18, sheen: 0.3, shc: [96, 136, 126] },
  { n: 'lining', lut: mkRamp([[0, [30, 20, 7]], [0.3, [80, 57, 22]], [0.6, [138, 104, 48]], [0.85, [188, 152, 86]], [1, [228, 198, 136]]]), sss: 0, wrap: 0.2, sheen: 0.2, shc: [190, 150, 84] },
  { n: 'linen', lut: mkRamp([[0, [26, 25, 22]], [0.3, [72, 70, 63]], [0.55, [126, 123, 113]], [0.8, [180, 175, 161]], [1, [220, 214, 198]]]), sss: 0, wrap: 0.38, sheen: 0.04, shc: [200, 200, 200] },
  { n: 'nail', lut: mkRamp([[0, [38, 28, 22]], [0.4, [120, 104, 92]], [0.7, [182, 170, 158]], [1, [228, 220, 208]]]), sss: 0.5, wrap: 0.3, sheen: 0.1, shc: [255, 250, 240] },
  { n: 'cord', lut: mkRamp([[0, [14, 8, 4]], [0.5, [48, 30, 15]], [1, [130, 94, 56]]]), sss: 0, wrap: 0.2, sheen: 0.2, shc: [180, 140, 90] },
  { n: 'hand', lut: SKIN_LUT, sss: 1, wrap: 0.34, sheen: 0, shc: [0, 0, 0] },
];
const MI = {}; MATS.forEach((m, i) => { MI[m.n] = i; });
const NZT = (() => { const n = 128, a = new Float32Array(n * n); for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) a[j * n + i] = P.fbm(i * 0.09, j * 0.09 + 31.7, 3); return a; })();
// one Leonardesque light: warm key (upper left, wrapped soft terminator), cool reflected light in the shadow side,
// silver moon rim from behind-left, golden glow from the vortex above, warm bounce from below, velvet sheen
function shadePx(nx, ny, nz, ao, M, li, o) {
  let key = (nx * li.L[0] + ny * li.L[1] + nz * li.L[2] + M.wrap) / (1 + M.wrap); key = key < 0 ? 0 : key > 1 ? 1 : key; key = key * key * (3 - 2 * key) * 0.7 + key * 0.3;
  let v = (li.amb + key * li.keyI) * ao; v = v < 0 ? 0 : v > 1 ? 1 : v;
  const lut = M.lut, vi = (v * 255) | 0; let R = lut[vi * 3], G = lut[vi * 3 + 1], B = lut[vi * 3 + 2];
  if (M.sss) { const s = Math.exp(-(key - 0.3) * (key - 0.3) * 22) * M.sss * li.sss; R += 16 * s; G += 3 * s; B -= 7 * s; }
  let f = nx * 0.72 - ny * 0.1 + nz * 0.22; if (f > 0) { f *= li.fillI * (1 - key) * ao; R += li.fillCol[0] * f; G += li.fillCol[1] * f; B += li.fillCol[2] * f; }
  let r = -nx * 0.8 - ny * 0.38 - nz * 0.3; if (r > 0) { r = r * r * li.rimI; R += li.rimCol[0] * r; G += li.rimCol[1] * r; B += li.rimCol[2] * r; }
  let tg = -ny * 0.9 + nz * 0.1; if (tg > 0) { tg = tg * tg * li.glowI * ao; R += li.glowCol[0] * tg; G += li.glowCol[1] * tg; B += li.glowCol[2] * tg; }
  let bn = ny * 0.85 - nz * 0.1; if (bn > 0) { bn = bn * bn * li.bounceI; R += li.bounceCol[0] * bn; G += li.bounceCol[1] * bn; B += li.bounceCol[2] * bn; }
  if (M.sheen) { const s = (1 - nz) * (1 - nz) * M.sheen * (0.3 + key) * ao; R += M.shc[0] * s; G += M.shc[1] * s; B += M.shc[2] * s; }
  o[0] = R; o[1] = G; o[2] = B;
}
// primitives (world px; z = height toward the viewer): E ellipsoid, C capsule (tapered limb), D drape (mask laid over
// whatever is below, or hung at zf), G dent/bump, HP the plaster head. `onto` lays a form on the head's surface (fingers
// wrapping the skull); with `clip` the part that passes behind the skull's curve is hidden.
const E_ = (x, y, rx, ry, rz, z0, m, o = {}) => ({ k: 0, x, y, rx, ry, rz, z0, m, rot: o.rot || 0, blend: o.blend || 0, folds: o.folds || null, onto: o.onto || 0, clip: !!o.clip, lift: o.lift || 0, zon: o.zon ?? 0 });
const C_ = (a, b, ra, rb, za, zb, kz, m, o = {}) => ({ k: 1, a, b, ra, rb, za, zb, kz, m, blend: o.blend || 0, folds: o.folds || null, onto: o.onto || 0, clip: !!o.clip, lift: o.lift || 0, zon: o.zon ?? 0 });
const D_ = (mask, m, o = {}) => ({ k: 2, mask, m, over: o.over !== false, thick: o.thick ?? 8, zf: o.zf || null, soft: o.soft ?? 2.5, folds: o.folds || null });
const G_ = (x, y, sx, sy, h) => ({ k: 3, x, y, sx, sy, h });
const HP_ = (x, y, u, tilt, ex) => ({ k: 4, x, y, u, tilt, F: headFeatures(ex), m: 'skin' });
const fold = (pts, w, a, taper = 'both', per = 3) => ({ pts: pts.length > 2 ? KIT.densify(pts, per) : pts, w, a, t0: taper === 'both' || taper === 'start', t1: taper === 'both' || taper === 'end' });
function prepFold(f) {
  if (f.ok) return; const p = f.pts; let L = 0, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; f.cum = [0]; f.sl = [];
  for (let i = 0; i < p.length; i++) { x0 = Math.min(x0, p[i][0]); x1 = Math.max(x1, p[i][0]); y0 = Math.min(y0, p[i][1]); y1 = Math.max(y1, p[i][1]); if (i) { const l = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); f.sl.push(l); L += l; f.cum.push(L); } }
  const m = f.w * 2.6; Object.assign(f, { L: L || 1, bx0: x0 - m, bx1: x1 + m, by0: y0 - m, by1: y1 + m, iw: 1 / (f.w * f.w), ok: true });
}
function foldSum(folds, x, y) {
  let s = 0;
  for (let n = 0; n < folds.length; n++) { const f = folds[n]; if (x < f.bx0 || x > f.bx1 || y < f.by0 || y > f.by1) continue;
    const p = f.pts; let best = 1e18, bt = 0;
    for (let i = 0; i < p.length - 1; i++) { const ax = p[i][0], ay = p[i][1], dx = p[i + 1][0] - ax, dy = p[i + 1][1] - ay, l2 = dx * dx + dy * dy || 1;
      let t = ((x - ax) * dx + (y - ay) * dy) / l2; t = t < 0 ? 0 : t > 1 ? 1 : t; const ex = x - ax - dx * t, ey = y - ay - dy * t, d2 = ex * ex + ey * ey;
      if (d2 < best) { best = d2; bt = (f.cum[i] + t * f.sl[i]) / f.L; } }
    let e = 1; if (f.t0) { const q = Math.min(1, bt / 0.22); e *= q * q * (3 - 2 * q); } if (f.t1) { const q = Math.min(1, (1 - bt) / 0.22); e *= q * q * (3 - 2 * q); }
    s += f.a * e * Math.exp(-best * f.iw); }
  return s;
}
function maskOf(path, w, h, x0, y0, res, soft) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d', { willReadFrequently: true });
  if (soft > 0) g.filter = `blur(${soft}px)`; g.setTransform(res, 0, 0, res, -x0 * res, -y0 * res); g.fillStyle = '#fff'; g.fill(path);
  const d = g.getImageData(0, 0, w, h).data, m = new Float32Array(w * h); for (let k = 0; k < w * h; k++) m[k] = d[k * 4 + 3] / 255; return m;
}
function prep(p, x0, y0, res, w, h) {
  p.mi = MI[p.m] ?? 0;
  if (p.k === 0) { const c = Math.cos(p.rot), s = Math.sin(p.rot), ex = Math.abs(p.rx * c) + Math.abs(p.ry * s), ey = Math.abs(p.rx * s) + Math.abs(p.ry * c), mn = Math.min(p.rx, p.ry);
    Object.assign(p, { c, s, irx: 1 / p.rx, iry: 1 / p.ry, bx0: p.x - ex - 3, bx1: p.x + ex + 3, by0: p.y - ey - 3, by1: p.y + ey + 3, aa: mn * res * 0.5, qe: 2.2 / (mn * res) }); }
  else if (p.k === 1) { const r = Math.max(p.ra, p.rb) + 3; Object.assign(p, { dx: p.b[0] - p.a[0], dy: p.b[1] - p.a[1], bx0: Math.min(p.a[0], p.b[0]) - r, bx1: Math.max(p.a[0], p.b[0]) + r, by0: Math.min(p.a[1], p.b[1]) - r, by1: Math.max(p.a[1], p.b[1]) + r }); p.il2 = 1 / Math.max(1e-6, p.dx * p.dx + p.dy * p.dy); }
  else if (p.k === 2) { p._m = maskOf(p.mask, w, h, x0, y0, res, p.soft); p.bx0 = -1e9; p.bx1 = 1e9; p.by0 = -1e9; p.by1 = 1e9; }
  else if (p.k === 3) { p.ix = 1 / (p.sx * p.sx); p.iy = 1 / (p.sy * p.sy); p.bx0 = p.x - 3 * p.sx; p.bx1 = p.x + 3 * p.sx; p.by0 = p.y - 3 * p.sy; p.by1 = p.y + 3 * p.sy; }
  else { const c = Math.cos(p.tilt), s = Math.sin(p.tilt), R = 1.55 * p.u; Object.assign(p, { c, s, iu: 1 / p.u, bx0: p.x - R, bx1: p.x + R, by0: p.y - R, by1: p.y + R, aa: p.u * res * 0.5, qe: 2.4 / (p.u * res) }); }
  if (p.folds) p.folds.forEach(prepFold);
}
const SB = {};
function sbuf(key, w, h) {
  const S = SB[key]; if (S && S.w === w && S.h === h) return S;
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d');
  return (SB[key] = { cv, g, w, h, img: g.createImageData(w, h), H: new Float32Array(w * h), M: new Int8Array(w * h), A: new Float32Array(w * h), X: new Float32Array(w * h), I: new Float64Array((w + 1) * (h + 1)), Cn: new Float64Array((w + 1) * (h + 1)), I2: new Float64Array((w + 1) * (h + 1)) });
}
// render prims into buffer S covering world [x0, x0 + w/res] × [y0, y0 + h/res]; tiles cull the primitives
function sculpt(S, x0, y0, res, prims, li, opt = {}) {
  const { w, h } = S, Hh = S.H, Mi = S.M, Al = S.A, Xa = S.X, inv = 1 / res, HM = MI.hand, TS = 16;
  for (const p of prims) prep(p, x0, y0, res, w, h);
  let nHand = 0;
  for (let ty = 0; ty < h; ty += TS) for (let tx = 0; tx < w; tx += TS) {
    const i1 = Math.min(w, tx + TS), j1 = Math.min(h, ty + TS), wx0 = x0 + tx * inv, wx1 = x0 + i1 * inv, wy0 = y0 + ty * inv, wy1 = y0 + j1 * inv, L = [];
    for (let n = 0; n < prims.length; n++) { const p = prims[n]; if (p.bx1 >= wx0 && p.bx0 <= wx1 && p.by1 >= wy0 && p.by0 <= wy1) L.push(p); }
    const nl = L.length;
    for (let j = ty; j < j1; j++) { const y = y0 + (j + 0.5) * inv;
      for (let i = tx; i < i1; i++) { const x = x0 + (i + 0.5) * inv, k = j * w + i;
        let hm = -1e9, mi = -1, al = 0, hHead = -1e9, xa = 0;
        for (let pi = 0; pi < nl; pi++) { const p = L[pi];
          if (x < p.bx0 || x > p.bx1 || y < p.by0 || y > p.by1) continue;
          let hh, cov, base;
          if (p.k === 1) {
            const ax = x - p.a[0], ay = y - p.a[1]; let t = (ax * p.dx + ay * p.dy) * p.il2; t = t < 0 ? 0 : t > 1 ? 1 : t;
            const ex = ax - p.dx * t, ey = ay - p.dy * t, d2 = ex * ex + ey * ey, r = p.ra + (p.rb - p.ra) * t, re = r + inv;
            if (d2 >= re * re) continue;
            base = p.za + (p.zb - p.za) * t;
            if (p.onto > 0) { if (hHead > -1e8) base += (hHead + p.lift - base) * p.onto; else if (p.clip && p.onto > 0.5) continue; else base += (p.zon - base) * p.onto; }
            cov = (r - Math.sqrt(d2)) * res + 0.5; const q = r * r - d2; hh = base + p.kz * Math.sqrt(q > 0 ? q : 0);
          } else if (p.k === 0) {
            const dx = x - p.x, dy = y - p.y, u = (dx * p.c + dy * p.s) * p.irx, v = (-dx * p.s + dy * p.c) * p.iry, q = 1 - u * u - v * v;
            if (q <= -p.qe) continue;
            base = p.z0; if (p.onto > 0) { if (hHead > -1e8) base += (hHead + p.lift - base) * p.onto; else if (p.clip && p.onto > 0.5) continue; else base += (p.zon - base) * p.onto; }
            cov = q * p.aa + 0.5; hh = base + p.rz * Math.sqrt(q > 0 ? q : 0);
          } else if (p.k === 2) {
            const m = p._m[k]; if (m < 0.5) continue;
            if (p.over && hm > -1e8) base = hm; else if (p.zf) base = p.zf(x, y); else continue;
            const e = (m - 0.5) * 2; hh = base + p.thick * e * e * (3 - 2 * e); cov = 1;
          } else if (p.k === 3) {
            if (hm > -1e8) { const dx = x - p.x, dy = y - p.y; hm += p.h * Math.exp(-(dx * dx * p.ix + dy * dy * p.iy)); if (hHead > -1e8) hHead = hm; }
            continue;
          } else {
            const dx = x - p.x, dy = y - p.y, hx = (dx * p.c + dy * p.s) * p.iu, hy = (-dx * p.s + dy * p.c) * p.iu, v = hy / HB, sx = 1.0 - 0.16 * v - 0.12 * v * v, xe = hx / sx, q = 1 - xe * xe - v * v;
            if (q < -p.qe) continue;
            let f = 0; const F = p.F;
            for (let n = 0; n < F.length; n++) { const o = F[n]; let fx = hx - o.x, fy = hy - o.y; if (fx > o.bx || fx < -o.bx || fy > o.by || fy < -o.by) continue; if (o.rot) { const uu = fx * o.c + fy * o.s; fy = -fx * o.s + fy * o.c; fx = uu; } f += o.h * Math.exp(-(fx * fx * o.ix + fy * fy * o.iy)); }
            const fd = q > 0.1 ? 1 : q > 0 ? q * 10 : 0;
            hh = p.u * (Math.sqrt(q > 0 ? q : 0) * 0.92 + f * fd); cov = q * p.aa + 0.5;
            if (hh > hm) { hm = hh; mi = p.mi; xa = f < 0 ? -f * fd : 0; } hHead = hm; if (cov > al) al = cov;
            continue;
          }
          if (p.folds) hh += foldSum(p.folds, x, y);
          if (p.blend > 0 && hm > -1e8) { const d = hh - hm; if (d > 0) { mi = p.mi; xa = 0; } hm = (d > 0 ? hh : hm) + p.blend * Math.log1p(Math.exp(-Math.abs(d) / p.blend)); }
          else if (hh > hm) { hm = hh; mi = p.mi; xa = 0; }
          if (cov > al) al = cov;
        }
        Hh[k] = hm; Mi[k] = mi; Al[k] = mi < 0 ? 0 : al > 1 ? 1 : al < 0 ? 0 : al; Xa[k] = xa;
        if (mi === HM) nHand++;
      } }
  }
  // cavities: compare each height with its neighbourhood mean (integral image over the covered pixels)
  const R = Math.max(2, Math.round((opt.aoR || 8) * res)), I = S.I, Cn = S.Cn, I2 = S.I2, W1 = w + 1, hs = opt.handShadow && nHand > 0 ? opt.handShadow : null;
  for (let i = 0; i <= w; i++) { I[i] = 0; Cn[i] = 0; I2[i] = 0; }
  for (let j = 0; j < h; j++) { let rs = 0, rc = 0, rh = 0; I[(j + 1) * W1] = 0; Cn[(j + 1) * W1] = 0; I2[(j + 1) * W1] = 0;
    for (let i = 0; i < w; i++) { const k = j * w + i; if (Mi[k] >= 0) { rs += Hh[k]; rc++; if (Mi[k] === HM) rh += Al[k]; } const o = (j + 1) * W1 + i + 1; I[o] = I[o - W1] + rs; Cn[o] = Cn[o - W1] + rc; I2[o] = I2[o - W1] + rh; } }
  const box = (A, ia, ib, ja, jb) => A[jb * W1 + ib] - A[ja * W1 + ib] - A[jb * W1 + ia] + A[ja * W1 + ia];
  const d = S.img.data, o = [0, 0, 0], aoK = opt.aoK ?? 0.045, sh = opt.shadow, drop = 2.2 * inv, SKI = MI.skin;
  const hsx = hs ? Math.round(hs.dx * res) : 0, hsy = hs ? Math.round(hs.dy * res) : 0, hsr = hs ? Math.max(1, Math.round(hs.r * res)) : 0;
  for (let j = 0; j < h; j++) { const ya = Math.max(0, j - R), yb = Math.min(h, j + R + 1), wy = y0 + (j + 0.5) * inv;
    for (let i = 0; i < w; i++) {
      const k = j * w + i, o4 = k * 4, mi = Mi[k];
      if (mi < 0) { d[o4 + 3] = 0; continue; }
      const H0 = Hh[k];
      const hl = i > 0 && Mi[k - 1] >= 0 ? Hh[k - 1] : H0 - drop, hr = i < w - 1 && Mi[k + 1] >= 0 ? Hh[k + 1] : H0 - drop;
      const hu = j > 0 && Mi[k - w] >= 0 ? Hh[k - w] : H0 - drop, hd = j < h - 1 && Mi[k + w] >= 0 ? Hh[k + w] : H0 - drop;
      let nx = -(hr - hl) * res * 0.5, ny = -(hd - hu) * res * 0.5; const nl = 1 / Math.sqrt(nx * nx + ny * ny + 1); nx *= nl; ny *= nl;
      const xa0 = Math.max(0, i - R), xb0 = Math.min(w, i + R + 1), cnt = box(Cn, xa0, xb0, ya, yb), mean = cnt > 0 ? box(I, xa0, xb0, ya, yb) / cnt : H0;
      let ao = 1 - Math.min(1, Math.max(0, (mean - H0) * aoK)) * 0.62;
      if (Xa[k] > 0) ao *= 1 - Math.min(1, Xa[k] * 4.4) * 0.62;
      if (sh) ao *= 1 - 0.65 * sh[k];
      if (hs && mi === SKI) { const ci = i - hsx, cj = j - hsy, ia = Math.max(0, ci - hsr), ib = Math.min(w, ci + hsr + 1), ja = Math.max(0, cj - hsr), jb = Math.min(h, cj + hsr + 1);
        if (ib > ia && jb > ja) ao *= 1 - hs.k * box(I2, ia, ib, ja, jb) / ((ib - ia) * (jb - ja)); }
      const wx = x0 + (i + 0.5) * inv; ao *= 1 + 0.07 * NZT[(((wx * 0.11) | 0) & 127) + ((((wy * 0.11) | 0) & 127) << 7)];
      shadePx(nx, ny, nl, ao, MATS[mi], li, o);
      d[o4] = o[0]; d[o4 + 1] = o[1]; d[o4 + 2] = o[2]; d[o4 + 3] = 255 * Al[k];
    } }
  S.g.putImageData(S.img, 0, 0);
  if (opt.handMask) {                       // where the hands are: used to keep eyes/mouth marks under the fingers
    if (!S.mcv) { S.mcv = document.createElement('canvas'); S.mcv.width = w; S.mcv.height = h; S.mg = S.mcv.getContext('2d'); S.mimg = S.mg.createImageData(w, h); }
    const md = S.mimg.data; for (let k = 0; k < w * h; k++) { md[k * 4 + 3] = Mi[k] === HM || Mi[k] === MI.nail ? 255 * Al[k] : 0; } S.mg.putImageData(S.mimg, 0, 0);
  }
  return S;
}
// a static sculpt baked once: { cv, x, y, w, h } in world px
function sculptOnce(key, x, y, ww, hh, res, primsFn, li, opt = {}) {
  const k = NS + 'sc_' + key; if (SB[k]) return SB[k];
  const S = sbuf(k + '_buf', Math.ceil(ww * res), Math.ceil(hh * res)); sculpt(S, x, y, res, primsFn(), li, typeof opt === 'function' ? opt(S) : opt);
  const cv = document.createElement('canvas'); cv.width = S.w; cv.height = S.h; cv.getContext('2d').drawImage(S.cv, 0, 0);
  return (SB[k] = { cv, x, y, w: ww, h: hh });
}
// a live sculpt (every frame) into a fixed region
function sculptLive(key, x, y, ww, hh, res, prims, li, opt) {
  const S = sbuf(NS + 'live_' + key, Math.ceil(ww * res), Math.ceil(hh * res)); sculpt(S, x, y, res, prims, li, opt);
  return { cv: S.cv, x, y, w: ww, h: hh, S };
}
const drawSc = (g, s) => g.drawImage(s.cv, s.x, s.y, s.w, s.h);

// ---------------------------------------------------------------- the valley (landscape units; wide window = world px)
const RANGES = [
  { base: 768, depth: 46, det: 4.2, seed: 3, ex: 1.25,
    peaks: [[150, 60, 34], [212, 92, 24], [246, 120, 16], [292, 70, 26], [360, 44, 44], [452, 56, 30], [530, 40, 40], [584, 86, 24], [622, 132, 15], [662, 96, 24], [742, 74, 32], [812, 116, 20], [868, 70, 36]],
    top: [190, 204, 198], col: [162, 182, 182], low: [180, 192, 182], mist: [208, 210, 186] },
  { base: 806, depth: 46, det: 6, seed: 7, ex: 1.2,
    peaks: [[140, 102, 40], [196, 138, 22], [236, 96, 26], [280, 58, 30], [322, 30, 34], [612, 34, 36], [672, 70, 26], [716, 112, 18], [756, 146, 22], [806, 104, 30], [872, 120, 30]],
    top: [150, 172, 176], col: [120, 146, 154], low: [140, 158, 154], mist: [188, 196, 176] },
  { base: 880, depth: 70, det: 5, seed: 11, ex: 1.7,
    peaks: [[160, 64, 70], [300, 36, 80], [450, 48, 64], [600, 58, 70], [760, 76, 60], [900, 54, 80]],
    top: [100, 124, 116], col: [76, 98, 90], low: [62, 78, 68], mist: [142, 154, 142] },
];
const RIVER = [[470, 790], [452, 812], [498, 838], [468, 866], [404, 896], [362, 936], [396, 982], [468, 1026], [520, 1088], [498, 1160]];
const ridgeH = (x, R) => { let h = 0; for (const [px, ph, pw] of R.peaks) h += ph * Math.exp(-Math.pow(Math.abs(x - px) / pw, R.ex)); return h + P.fbm(x * 0.035, R.seed, 3) * R.det + Math.abs(P.noise(x * 0.19, R.seed + 5)) * R.det * 0.6; };
const riverX = y => { for (let i = 1; i < RIVER.length; i++) if (y <= RIVER[i][1]) { const a = RIVER[i - 1], b = RIVER[i]; return lerp(a[0], b[0], (y - a[1]) / (b[1] - a[1])); } return -999; };
function landscape(g, o) {             // o: { x0, x1, y0, y1, moon:[x,y,r], step }
  const r = rng(31), X0 = o.x0 - 30, X1 = o.x1 + 30, st = o.step || 2;
  // the blue-hour sky: lapis above, luminous green-gold afterglow at the horizon
  g.fillStyle = linGrad(g, 0, 140, 0, 772, [[0, '#1c3242'], [0.3, '#2d4c5c'], [0.55, '#4b707a'], [0.74, '#7a9a94'], [0.87, '#a8b9a2'], [0.95, '#c9c7a0'], [1, '#d6c99a']]);
  g.fillRect(X0, Math.min(o.y0, 140) - 30, X1 - X0, 800 - Math.min(o.y0, 140));
  for (let k = 0; k < 26; k++) { const x = lerp(X0, X1, r()), y = lerp(150, 520, r()), a = 0.15 + r() * 0.3; g.fillStyle = `rgba(236,240,230,${a})`; g.beginPath(); g.arc(x, y, 0.6 + r() * 0.9, 0, TAU); g.fill(); }
  if (o.moon) moonDisk(g, ...o.moon);
  for (let k = 0; k < 11; k++) { const x = lerp(X0, X1, r()), y = 430 + r() * 230, w = 50 + r() * 150, hh = 3 + r() * 8, near = o.moon ? Math.exp(-Math.hypot(x - o.moon[0], y - o.moon[1]) / 260) : 0;
    blob(g, x, y, w, hh, near > 0.3 ? '#e2e6d8' : '#b0c0bc', 0.12 + 0.25 * near + r() * 0.08); }
  RANGES.forEach((R, ri) => {
    if (ri === 1) lake(g, o);
    const pts = []; let minY = 1e9;
    for (let x = X0; x <= X1; x += st) { const y = R.base - ridgeH(x, R); pts.push([x, y]); minY = Math.min(minY, y); }
    const path = new Path2D(); path.moveTo(X0, R.base + R.depth); pts.forEach(p => path.lineTo(p[0], p[1])); path.lineTo(X1, R.base + R.depth); path.closePath();
    g.fillStyle = linGrad(g, 0, minY, 0, R.base + R.depth, [[0, R.top], [0.35, R.col], [0.75, R.low], [1, R.mist]]); g.fill(path);
    g.save(); g.clip(path);
    const rr = rng(40 + ri);
    for (let k = 0; k < (X1 - X0) / 5; k++) { const x = lerp(X0, X1, rr()), y0 = R.base - ridgeH(x, R) + 2, len = 10 + rr() * 50, slope = ridgeH(x + 3, R) - ridgeH(x - 3, R);
      g.strokeStyle = slope > 0 ? `rgba(232,238,228,${0.05 + rr() * 0.08})` : `rgba(20,34,40,${0.05 + rr() * 0.1})`; g.lineWidth = 0.8 + rr() * 1.6;
      g.beginPath(); g.moveTo(x, y0); g.lineTo(x + (rr() - 0.5) * 6, y0 + len); g.stroke(); }
    g.fillStyle = linGrad(g, 0, R.base - 26, 0, R.base + R.depth, [[0, R.mist, 0], [0.6, R.mist, 0.55], [1, R.mist, 0.85]]); g.fillRect(X0, R.base - 26, X1 - X0, R.depth + 26);
    g.restore();
    if (ri === 2) town(g);
  });
  const vy = 872, vp = new Path2D(); vp.moveTo(X0, 1200); for (let x = X0; x <= X1; x += st * 2) vp.lineTo(x, vy + 6 * P.noise(x * 0.02, 13) + 10 * Math.max(0, P.noise(x * 0.006, 2))); vp.lineTo(X1, 1200); vp.closePath();
  g.fillStyle = linGrad(g, 0, vy, 0, 1180, [[0, '#506052'], [0.25, '#3c483b'], [0.6, '#2d3429'], [1, '#22251c']]); g.fill(vp);
  g.save(); g.clip(vp);
  for (let k = 0; k < 40; k++) { const x = lerp(X0, X1, r()), y = vy + 20 + r() * 280, s = 0.6 + (y - vy) / 160; blob(g, x, y, 40 * s, 7 * s, r() < 0.5 ? '#58684f' : '#1c2218', 0.25 + r() * 0.2); }
  const rp = KIT.densify(RIVER, 8);
  g.fillStyle = '#1a201a'; g.fill(KIT.ribbon(rp, q => 6 + q * 34));
  g.fillStyle = linGrad(g, 0, 790, 0, 1160, [[0, '#ccd5c6'], [0.4, '#abbab4'], [1, '#81958f']]); g.fill(KIT.ribbon(rp, q => 2.5 + q * 26));
  bridge(g, 352, 934);
  g.strokeStyle = 'rgba(176,170,140,.32)'; g.lineWidth = 3; g.beginPath(); g.moveTo(560, 1180); g.bezierCurveTo(600, 1080, 520, 1000, 580, 930); g.bezierCurveTo(610, 900, 640, 905, 660, 890); g.stroke();
  for (let k = 0; k < 70; k++) { const x = lerp(X0, X1, r()), y = vy - 4 + r() * 300, s = 0.35 + (y - vy + 10) / 120; if (Math.abs(x - riverX(y)) < 14 + 10 * s) continue;
    g.fillStyle = rgba(mix([44, 60, 54], [18, 24, 16], clamp((y - vy) / 200)), 0.95);
    if (r() < 0.55) { g.beginPath(); g.ellipse(x, y - 12 * s, 3.6 * s, 14 * s, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(200,214,200,.12)'; g.beginPath(); g.ellipse(x - 1.2 * s, y - 14 * s, 1.4 * s, 10 * s, 0, 0, TAU); g.fill(); }
    else { g.beginPath(); g.arc(x, y - 6 * s, 8 * s, 0, TAU); g.fill(); } }
  g.restore();
  for (let k = 0; k < 14; k++) { const x = lerp(X0, X1, r()), y = 880 + r() * 90; blob(g, x, y, 90 + r() * 120, 10 + r() * 10, '#c6cab8', 0.2 + r() * 0.2); }
}
function lake(g, o) {
  const y0 = 764, y1 = 806;
  g.fillStyle = linGrad(g, 0, y0, 0, y1, [[0, '#d8d4b2'], [0.3, '#c4c8b2'], [1, '#a1b2ac']]); g.fillRect(o.x0 - 30, y0, o.x1 - o.x0 + 60, y1 - y0);
  const r = rng(61); for (let k = 0; k < 40; k++) { const x = lerp(o.x0, o.x1, r()), y = lerp(y0 + 2, y1, r()); g.fillStyle = r() < 0.5 ? 'rgba(242,240,222,.28)' : 'rgba(90,110,110,.18)'; g.fillRect(x, y, 10 + r() * 40, 0.8); }
}
function bridge(g, x, y) {
  g.save(); g.fillStyle = '#8e927f'; g.fillRect(x - 34, y - 6, 74, 5); g.fillStyle = '#6d7062'; g.fillRect(x - 34, y - 1, 74, 6);
  g.fillStyle = '#1e241e'; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(x - 24 + k * 18, y + 6, 6.5, Math.PI, 0); g.lineTo(x - 17.5 + k * 18, y + 7); g.lineTo(x - 30.5 + k * 18, y + 7); g.fill(); }
  g.fillStyle = 'rgba(222,226,208,.35)'; g.fillRect(x - 34, y - 6, 74, 1.2); g.restore();
}
function town(g) {
  g.save(); const r = rng(71), bx = 640, by = 858;
  for (let k = 0; k < 9; k++) { const x = bx + k * 7 + r() * 4, w = 6 + r() * 5, h = 6 + r() * 9, y = by - 4 - Math.sin(k / 8 * Math.PI) * 10;
    g.fillStyle = '#8c907f'; g.fillRect(x, y - h, w, h); g.fillStyle = '#5a5048'; g.beginPath(); g.moveTo(x - 1, y - h); g.lineTo(x + w / 2, y - h - 3.5); g.lineTo(x + w + 1, y - h); g.fill(); }
  g.fillStyle = '#929583'; g.fillRect(bx + 30, by - 40, 6, 30); g.fillStyle = '#5a5048'; g.beginPath(); g.moveTo(bx + 29, by - 40); g.lineTo(bx + 33, by - 47); g.lineTo(bx + 37, by - 40); g.fill();
  g.fillStyle = '#ffd27e'; g.fillRect(bx + 18, by - 14, 1.8, 1.8);
  g.restore();
}
function moonDisk(g, x, y, r) {
  g.save();
  g.fillStyle = radGrad(g, x, y, r, r * 12, [[0, [218, 228, 214], 0.26], [0.3, [192, 208, 198], 0.08], [1, [192, 208, 198], 0]]); g.fillRect(x - r * 12, y - r * 12, r * 24, r * 24);
  g.fillStyle = radGrad(g, x, y, r * 0.8, r * 3.4, [[0, [238, 240, 224], 0.5], [1, [238, 240, 224], 0]]); g.fillRect(x - r * 3.4, y - r * 3.4, r * 6.8, r * 6.8);
  g.fillStyle = radGrad(g, x - r * 0.3, y - r * 0.3, 0, r * 1.05, [[0, '#fcf9ec'], [0.75, '#efebd6'], [1, '#dcd8c2']]); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.clip(); g.filter = `blur(${Math.max(0.6, r * 0.08)}px)`;
  [[0.28, -0.22, 0.34], [-0.25, 0.08, 0.3], [0.08, 0.38, 0.22], [-0.05, -0.35, 0.18]].forEach(([dx, dy, rr]) => { g.fillStyle = 'rgba(140,144,132,.26)'; g.beginPath(); g.arc(x + dx * r, y + dy * r, rr * r, 0, TAU); g.fill(); });
  g.restore();
}

// ---------------------------------------------------------------- the plaster head: an egg, sculpted per pixel
const HB = 1.45;                                            // half-height in head units (half-width ≈ 1.0): taller than wide
const headS = v => 1.0 - 0.16 * v - 0.12 * v * v;          // width profile: broad cranium, narrowing to a soft chin
const EYE_Y = 0.12, MOUTH_Y = 0.885;
function headFeatures(ex) {
  const F = [], pb = ex.pitch || 0, yw = ex.yaw || 0;
  const add = (x, y, sx, sy, h, rot = 0) => { if (Math.abs(h) < 2e-4) return; x += yw * 0.2; y += pb; const c = Math.cos(rot), s = Math.sin(rot), e = 2.7;
    F.push({ x, y, ix: 1 / (sx * sx), iy: 1 / (sy * sy), h, c, s, rot: rot !== 0, bx: e * (Math.abs(sx * c) + Math.abs(sy * s)), by: e * (Math.abs(sx * s) + Math.abs(sy * c)) }); };
  const sq = ex.squeeze, op = ex.open, kn = ex.knot, wo = ex.worry, cl = ex.clench, ey = EYE_Y;
  for (const sd of [-1, 1]) {
    const es = 1 - 0.3 * yw * sd;
    add(sd * 0.42, ey + 0.02 * sq, (0.28 - 0.02 * sq) * es, 0.22 + 0.03 * op - 0.045 * sq, -0.17 - 0.035 * sq);        // eye socket
    add(sd * 0.42, ey - 0.26 + 0.04 * sq + 0.025 * kn - 0.04 * wo, 0.3, 0.075, 0.05);                                // brow ridge
    add(sd * 0.16, ey - 0.24 + 0.05 * kn - 0.05 * wo, 0.1, 0.065, 0.015 + 0.035 * kn);                              // inner brow
    add(sd * 0.86, ey - 0.32, 0.13, 0.3, -0.035);                                                                   // temple
    add(sd * 0.5, ey + 0.28 - 0.07 * sq, 0.21, 0.15, 0.04 + 0.045 * sq);                                            // cheekbone
    add(sd * 0.42, ey + 0.6, 0.18, 0.16, -0.028);                                                                   // cheek hollow
    add(sd * 0.52, ey + 0.86, 0.18, 0.22, -0.014);                                                                  // jaw
    for (let k = -1; k <= 1; k++) add(sd * 0.71, ey + k * 0.05, 0.07, 0.011, -0.016 * sq, sd * k * 0.35);          // crow's feet
    add(sd * 0.065, ey - 0.2, 0.016, 0.1, -0.034 * kn, sd * 0.15);                                                 // vertical furrows
    add(sd * 0.09, ey + 0.14, 0.05, 0.012, -0.014 * kn * sq, sd * 0.5);                                            // nose wrinkles
    add(sd * (0.13 + 0.04 * cl), MOUTH_Y - 0.01, 0.05, 0.04, 0.012 * ex.smile + 0.012 * cl);                      // mouth corners
  }
  add(0, ey - 0.18, 0.04, 0.06, 0.014 * kn);
  for (const y of [ey - 0.54, ey - 0.66]) add(0, y + 0.04 * kn, 0.22, 0.012, -0.006 * (wo + 0.7 * kn));
  add(0, ey + 0.13, 0.07, 0.2, 0.045); add(0, ey + 0.43, 0.085, 0.07, 0.07); add(-0.065, ey + 0.48, 0.04, 0.03, -0.012); add(0.065, ey + 0.48, 0.04, 0.03, -0.012);
  const mw = 0.11 + 0.08 * cl - 0.05 * ex.oh;
  add(0, MOUTH_Y, mw, 0.02 + 0.035 * ex.oh, -0.025 - 0.035 * ex.oh); add(0, MOUTH_Y - 0.035, mw * 0.9, 0.025, 0.014); add(0, MOUTH_Y + 0.04, mw * 0.8, 0.028, 0.018);
  add(0, MOUTH_Y - 0.12, 0.03, 0.04, -0.006); add(0, 1.2, 0.17, 0.11, 0.03); add(0, MOUTH_Y + 0.16, 0.1, 0.025, -0.012);
  for (const d of ex.dents || []) add(d[0], d[1] - pb, d[2], d[2], d[3]);                                          // fingertips pressing the skull
  return F;
}
const headStore = {};
function renderHead(key, ub, ex, li) {
  const w = Math.ceil(ub * 2.2) + 8, h = Math.ceil(ub * 3.0) + 8, cx = w / 2, cy = h / 2;
  let S = headStore[key];
  if (!S || S.w !== w || S.h !== h) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'); S = headStore[key] = { cv, g, w, h, img: g.createImageData(w, h), Hh: new Float32Array(w * h), Ff: new Float32Array(w * h), Qq: new Float32Array(w * h) }; }
  const { Hh, Ff, Qq } = S, d = S.img.data, F = headFeatures(ex), nF = F.length, CZ = 0.92, M = MATS[0], o = [0, 0, 0];
  for (let j = 0; j < h; j++) {
    const y = (j - cy) / ub, v = y / HB, v2 = v * v, sx = headS(v);
    for (let i = 0; i < w; i++) {
      const k = j * w + i, x = (i - cx) / ub, xe = x / sx, q = 1 - xe * xe - v2; Qq[k] = q;
      if (q < -0.06) { Hh[k] = 0; Ff[k] = 0; continue; }
      let f = 0;
      for (let n = 0; n < nF; n++) { const p = F[n]; let dx = x - p.x, dy = y - p.y; if (dx > p.bx || dx < -p.bx || dy > p.by || dy < -p.by) continue;
        if (p.rot) { const uu = dx * p.c + dy * p.s; dy = -dx * p.s + dy * p.c; dx = uu; } f += p.h * Math.exp(-(dx * dx * p.ix + dy * dy * p.iy)); }
      const fd = q > 0.1 ? 1 : q > 0 ? q * 10 : 0;
      Ff[k] = f * fd; Hh[k] = Math.sqrt(q > 0 ? q : 0) * CZ + f * fd;
    }
  }
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const k = j * w + i, o4 = k * 4, q = Qq[k];
    if (q < -0.03 || i === 0 || j === 0 || i === w - 1 || j === h - 1) { d[o4 + 3] = 0; continue; }
    let nx = -(Hh[k + 1] - Hh[k - 1]) * ub * 0.5, ny = -(Hh[k + w] - Hh[k - w]) * ub * 0.5; const nl = 1 / Math.sqrt(nx * nx + ny * ny + 1); nx *= nl; ny *= nl;
    const dep = -Ff[k]; let ao = 1 - (dep > 0 ? Math.min(1, dep * 4.4) : 0) * 0.66;
    ao *= 1 + 0.05 * NZT[(((i * 40 / ub) | 0) & 127) + ((((j * 40 / ub) | 0) & 127) << 7)];
    shadePx(nx, ny, nl, ao, M, li, o);
    d[o4] = o[0]; d[o4 + 1] = o[1]; d[o4 + 2] = o[2]; d[o4 + 3] = 255 * clamp((q + 0.03) / 0.05);
  }
  S.g.putImageData(S.img, 0, 0);
  return S;
}
function headPath(hx, hy, u, tilt) {
  const p = [], c = Math.cos(tilt), s = Math.sin(tilt);
  for (let i = 0; i <= 72; i++) { const a = i / 72 * TAU, v = -Math.cos(a), y = v * HB, x = Math.sin(a) * headS(v) * Math.sqrt(Math.max(0, 1 - v * v)) * 0.995;
    p.push([hx + (x * c - y * s) * u, hy + (x * s + y * c) * u]); }
  return polyP(p);
}
// eyes, lids, mouth — in head units on top of the modelled head (soft, no hard outlines)
function faceMarks(g, ex, uz, glowA) {
  const px = 1 / uz, pb = ex.pitch || 0, yw = ex.yaw || 0, bl = k => `blur(${Math.max(0.6, uz * k)}px)`;
  for (const sd of [-1, 1]) {
    const es = 1 - 0.3 * yw * sd, ex0 = sd * 0.42 + yw * 0.2, ey = EYE_Y + 0.02 * ex.squeeze + pb, xi = ex0 - sd * 0.2 * es, xo = ex0 + sd * 0.23 * es, yi = ey + 0.012, yo = ey + 0.01 + 0.03 * ex.sad;
    const op = clamp(ex.open, 0, 1.15), hu = 0.175 * Math.pow(op, 0.85), hl = 0.13 * op;
    if (op > 0.03) {
      const eye = new Path2D(); eye.moveTo(xi, yi);
      eye.bezierCurveTo(lerp(xi, xo, 0.18), ey - hu * 1.33, lerp(xi, xo, 0.82), ey - hu * 1.33, xo, yo);
      eye.bezierCurveTo(lerp(xo, xi, 0.2), ey + hl * 1.33, lerp(xo, xi, 0.8), ey + hl * 1.33, xi, yi); eye.closePath();
      g.save(); g.filter = bl(0.03); g.lineWidth = 0.05; g.strokeStyle = 'rgba(28,18,10,.3)'; g.stroke(eye); g.restore();
      g.save(); g.globalCompositeOperation = 'screen'; g.filter = bl(0.06); g.fillStyle = `rgba(214,228,224,${0.5 * glowA})`; g.fill(eye); g.restore();
      g.save(); g.filter = bl(0.008);
      g.fillStyle = radGrad(g, ex0 - sd * 0.02, ey - hu * 0.25, 0, 0.26, [[0, '#f4f5ed'], [0.55, '#dfe4da'], [1, '#b0b7ac']]); g.fill(eye); g.restore();
      g.save(); g.clip(eye); g.filter = bl(0.014);
      g.strokeStyle = 'rgba(60,44,30,.6)'; g.lineWidth = 0.06; g.beginPath(); g.moveTo(xi, yi); g.bezierCurveTo(lerp(xi, xo, 0.18), ey - hu * 1.33, lerp(xi, xo, 0.82), ey - hu * 1.33, xo, yo); g.stroke();
      g.restore();
    }
    if (op < 0.2) {
      const k = 1 - op / 0.2, sqz = ex.squeeze;
      g.save(); g.filter = bl(0.007); g.lineCap = 'round';
      g.strokeStyle = `rgba(46,30,18,${0.66 * k})`; g.lineWidth = Math.max(1.6 * px, 0.016 + 0.01 * sqz);
      g.beginPath(); g.moveTo(xi, yi); g.quadraticCurveTo(ex0, ey + 0.05 - 0.03 * sqz, xo, yo); g.stroke();
      if (sqz > 0.05) {
        g.strokeStyle = `rgba(46,30,18,${0.4 * k * sqz})`; g.lineWidth = Math.max(1.2 * px, 0.011);
        g.beginPath(); g.moveTo(lerp(xi, xo, 0.15), ey - 0.06); g.quadraticCurveTo(ex0, ey - 0.1 - 0.02 * sqz, lerp(xi, xo, 0.9), ey - 0.045); g.stroke();
        g.beginPath(); g.moveTo(lerp(xi, xo, 0.25), ey + 0.07); g.quadraticCurveTo(ex0, ey + 0.1, lerp(xi, xo, 0.85), ey + 0.06); g.stroke();
        for (let m = -1; m <= 1; m++) { g.beginPath(); g.moveTo(xo + sd * 0.02, yo + m * 0.02); g.lineTo(xo + sd * (0.09 + 0.02 * Math.abs(m)), yo + m * 0.055); g.stroke(); }
      }
      g.restore();
    }
  }
  if (ex.knot > 0.05) { g.save(); g.filter = bl(0.01); g.lineCap = 'round'; g.strokeStyle = `rgba(52,34,20,${0.42 * ex.knot})`; g.lineWidth = Math.max(1.5 * px, 0.016);
    const x0 = yw * 0.2, b = EYE_Y + pb;
    for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(x0 + sd * 0.05, b - 0.08); g.quadraticCurveTo(x0 + sd * 0.075, b - 0.17, x0 + sd * 0.06, b - 0.26); g.stroke();
      g.beginPath(); g.moveTo(x0 + sd * 0.12, b - 0.16); g.quadraticCurveTo(x0 + sd * 0.3, b - 0.25 + 0.03 * ex.knot, x0 + sd * 0.58, b - 0.2); g.stroke(); }
    g.restore(); }
  const my = MOUTH_Y + 0.005 + pb, mx = yw * 0.2;
  g.save(); g.translate(mx, 0); g.filter = bl(0.006); g.lineCap = 'round';
  const neutralA = clamp(1 - ex.clench - ex.oh);
  if (neutralA > 0.01) { const sm = ex.smile, sad = ex.sad;
    g.strokeStyle = `rgba(52,32,22,${0.72 * neutralA})`; g.lineWidth = Math.max(1.6 * px, 0.016);
    g.beginPath(); g.moveTo(-0.1, my + 0.012 * sad - 0.014 * sm); g.quadraticCurveTo(0, my - 0.012 * sad + 0.016 * sm, 0.1, my + 0.012 * sad - 0.014 * sm); g.stroke();
    if (sm > 0.05) { g.filter = bl(0.02); g.fillStyle = `rgba(60,38,26,${0.32 * sm})`; for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * 0.118, my - 0.014, 0.022, 0, TAU); g.fill(); } g.filter = bl(0.006); }
    g.strokeStyle = `rgba(236,226,206,${0.26 * neutralA})`; g.lineWidth = Math.max(1.4 * px, 0.012); g.beginPath(); g.moveTo(-0.05, my + 0.04); g.quadraticCurveTo(0, my + 0.05, 0.05, my + 0.04); g.stroke();
  }
  if (ex.clench > 0.01) { const a = ex.clench, mw = 0.14 + 0.04 * a, mh = 0.045 + 0.02 * a;
    g.globalAlpha = a; g.fillStyle = '#2a1810'; g.beginPath(); g.roundRect(-mw, my - mh, 2 * mw, 2 * mh, mh * 0.8); g.fill();
    g.fillStyle = '#d6cebb'; g.beginPath(); g.roundRect(-mw * 0.9, my - mh * 0.78, 1.8 * mw, mh * 0.72, 0.012); g.fill(); g.beginPath(); g.roundRect(-mw * 0.85, my + mh * 0.08, 1.7 * mw, mh * 0.66, 0.012); g.fill();
    g.strokeStyle = 'rgba(80,60,44,.5)'; g.lineWidth = Math.max(1 * px, 0.006); for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(k * mw * 0.24, my - mh * 0.75); g.lineTo(k * mw * 0.24, my + mh * 0.72); g.stroke(); }
    g.strokeStyle = 'rgba(40,24,16,.8)'; g.lineWidth = Math.max(1.4 * px, 0.01); g.beginPath(); g.moveTo(-mw * 0.9, my + 0.003); g.lineTo(mw * 0.9, my + 0.003); g.stroke();
    g.globalAlpha = 1; }
  if (ex.oh > 0.01) { const a = ex.oh; g.globalAlpha = a; g.fillStyle = '#2c1a12'; g.beginPath(); g.ellipse(0, my + 0.005, 0.042, 0.052, 0, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(214,196,176,.4)'; g.lineWidth = Math.max(1.2 * px, 0.01); g.beginPath(); g.ellipse(0, my + 0.012, 0.05, 0.06, 0, 0.2, Math.PI - 0.2); g.stroke(); g.globalAlpha = 1; }
  g.restore();
}
function drawHead(g, key, hx, hy, u, tilt, z, ex, li, glowA) {
  const ub = Math.max(40, Math.round(u * z * (u > 150 ? 0.52 : 1)));
  const S = renderHead(key, ub, ex, li);
  g.save(); g.translate(hx, hy); g.rotate(tilt);
  g.save(); g.scale(u / ub, u / ub); g.drawImage(S.cv, -S.w / 2, -S.h / 2); g.restore();
  g.scale(u, u); faceMarks(g, ex, u * z, glowA);
  g.restore();
}

// ---------------------------------------------------------------- hands & arms: one soft continuous form each
// A hand is a skeleton { wrist, heel, palm, fingers[4][4 joints], fr, thumb[3], tr } in world px. In the grip the
// skeleton is laid out in head units (palm on the temple, fingers curling up over the cranium, thumb by the ear) and
// its forms are laid ONTO the skull surface — the parts that pass behind the skull's curve are hidden.
const L2 = (a, b, e) => [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e];
const angD = (a, b) => { let d = b - a; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return d; };
const GRIP = [   // head units, left side of the skull as seen (x mirrored for the other hand): MCP → PIP → DIP → tip
  [[0.72, -0.44], [0.64, -0.76], [0.53, -0.99], [0.43, -1.14]],
  [[0.8, -0.52], [0.75, -0.86], [0.65, -1.11], [0.54, -1.28]],
  [[0.88, -0.58], [0.86, -0.9], [0.79, -1.13], [0.69, -1.29]],
  [[0.95, -0.6], [0.96, -0.86], [0.92, -1.05], [0.85, -1.18]],
];
function gripSkel(sd, hp, tight, tr, t) {
  const u = CHEAD.u, c = Math.cos(hp.tilt), s = Math.sin(hp.tilt), Wp = (x, y) => [hp.x + (x * c - y * s) * u, hp.y + (x * s + y * c) * u];
  const loc = GRIP.map((J, fi) => J.map(([x, y], ji) => { const k = ji * (0.035 * tight + 0.01 * tr * Math.sin(t * 29 + fi * 1.9 + sd)); return [x - k * 0.5, y + k]; }));
  const fingers = loc.map(J => J.map(([x, y]) => Wp(sd * x, y)));
  const wrist = Wp(sd * 1.12, 0.32), heel = Wp(sd * 1.06, 0.14), knuck = Wp(sd * 0.86, -0.54), palmC = Wp(sd * 0.99, -0.13);
  const dents = loc.map(J => [sd * lerp(J[2][0], J[3][0], 0.6), lerp(J[2][1], J[3][1], 0.6), 0.075, -0.012 - 0.02 * tight]);
  return { wrist, heel, palm: { c: palmC, ang: Math.atan2(knuck[1] - wrist[1], knuck[0] - wrist[0]), rx: 0.135 * u, ry: 0.37 * u, rz: 0.07 * u }, fingers,
    fr: [0.066, 0.07, 0.065, 0.055].map(r => r * u), thumb: [Wp(sd * 1.0, -0.02), Wp(sd * 1.0, 0.2), Wp(sd * 0.96, 0.38)], tr: 0.14 * u, thr: 0.07 * u, dents };
}
function chestSkel(sd) {                // resting softly low on the chest: full backs of the hands, fingers together, loosely curled
  const x = 540 + sd * 268, y = 1856 + (sd > 0 ? 30 : 0), a = -Math.PI / 2 - sd * 1.12, s = 360, side = sd < 0 ? 1 : -1, fx = 0.9, curl = 0.38, spread = 0.02;
  const ca = Math.cos(a + Math.PI / 2), sa = Math.sin(a + Math.PI / 2), Wp = q => { const lx = q[0] * side * s * fx, ly = q[1] * s; return [x + lx * ca - ly * sa, y + lx * sa + ly * ca]; };
  const dir = an => [Math.sin(an), -Math.cos(an)];
  const fingers = FING.map(([bx, by, ang, L], fi) => { let an = ang * (0.4 + 1.3 * spread), px = bx * 0.8, py = by; const J = [[px, py]], seg = [0.45, 0.31, 0.24], bend = [0.25, 0.9, 0.75];
    for (let k = 0; k < 3; k++) { const f = Math.cos(Math.min(1.3, curl * bend[k] * (1 + 0.12 * fi))), d = dir(an); px += d[0] * L * seg[k] * f; py += d[1] * L * seg[k] * f; J.push([px, py]); }
    return J.map(Wp); });
  let an = 0.6 + 0.3 * spread, px = 0.11, py = -0.07; const T = [[px, py]];
  [[0.2, 0.15], [0.17, 0.35]].forEach(([L, b]) => { const f = Math.cos(Math.min(1.2, curl * b)), d = dir(an); px += d[0] * L * f; py += d[1] * L * f; T.push([px, py]); an -= 0.2 + 0.35 * curl; });
  const wrist = Wp([0, 0.06]), knuck = Wp([0, -0.45]);
  return { wrist, heel: Wp([0, -0.04]), palm: { c: Wp([0, -0.23]), ang: Math.atan2(knuck[1] - wrist[1], knuck[0] - wrist[0]), rx: 0.2 * s * fx, ry: 0.27 * s, rz: 0.065 * s }, fingers,
    fr: FING.map(f => f[4] * 0.7 * s), thumb: T.map(Wp), tr: 0.1 * s, thr: 0.066 * s, dents: [] };
}
const FING = [[0.13, -0.44, 0.1, 0.47, 0.084], [0.04, -0.465, 0.02, 0.52, 0.088], [-0.05, -0.452, -0.07, 0.49, 0.082], [-0.135, -0.415, -0.17, 0.39, 0.07]];
function lerpSkel(A, B, e, arc) {
  const off = p => [p[0] + arc[0], p[1] + arc[1]], LL = (a, b) => off(L2(a, b, e));
  return { wrist: LL(A.wrist, B.wrist), heel: LL(A.heel, B.heel), palm: { c: LL(A.palm.c, B.palm.c), ang: A.palm.ang + angD(A.palm.ang, B.palm.ang) * e, rx: lerp(A.palm.rx, B.palm.rx, e), ry: lerp(A.palm.ry, B.palm.ry, e), rz: lerp(A.palm.rz, B.palm.rz, e) },
    fingers: A.fingers.map((J, fi) => J.map((p, ji) => LL(p, B.fingers[fi][ji]))), fr: A.fr.map((r, i) => lerp(r, B.fr[i], e)), thumb: A.thumb.map((p, i) => LL(p, B.thumb[i])), tr: lerp(A.tr, B.tr, e), thr: lerp(A.thr, B.thr, e), dents: A.dents };
}
// the forms of one hand: a flattened back of the hand, a wrist, slender tapering fingers merged softly (no joints)
function skelPrims(K, o) {             // o: { onto, clip, zf, press, thumb }
  const P = [], Hd = 'hand', on = o.onto, zf = o.zf;
  P.push(E_(K.palm.c[0], K.palm.c[1], K.palm.rx, K.palm.ry, K.palm.rz, zf, Hd, { rot: K.palm.ang - Math.PI / 2, onto: on, lift: 3, zon: 10 }));
  P.push(C_(K.wrist, K.heel, K.tr * 1.02, K.tr * 1.12, zf - 6, zf - 1, 0.75, Hd, { blend: 14, onto: on, lift: 2, zon: 8 }));
  K.fingers.forEach((J, fi) => {
    const r0 = K.fr[fi], zz = zf + 3 + (3 - fi) * 1.2, rr = [[1.04, 0.93], [0.93, 0.84], [0.84, 0.7]];
    for (let k = 0; k < 3; k++) P.push(C_(J[k], J[k + 1], r0 * rr[k][0], r0 * rr[k][1], zz, zz - (k === 2 ? 3 * o.press : 0), 0.85, Hd, { blend: k === 0 ? 10 : 2.5, onto: on, clip: o.clip, lift: 2.5 - (k === 2 ? 2.5 * o.press : 0), zon: 9 }));
    P.push(C_(L2(J[2], J[3], 0.5), L2(J[2], J[3], 0.92), r0 * 0.44, r0 * 0.38, zz + r0 * 0.6, zz + r0 * 0.5, 0.32, 'nail', { blend: 2, onto: on, clip: o.clip, lift: 2.5 + r0 * 0.62 - 2.5 * o.press, zon: 9 + r0 * 0.6 }));
  });
  if (o.thumb > 0.02) { const T = K.thumb, r = K.thr * (0.75 + 0.25 * o.thumb);
    P.push(C_(T[0], T[1], r * 0.98, r * 0.86, zf + 1, zf + 1, 0.8, Hd, { blend: 10, onto: on, lift: 2, zon: 10 }));
    P.push(C_(T[1], T[2], r * 0.86, r * 0.7, zf + 1, zf, 0.8, Hd, { blend: 7, onto: on, lift: 2, zon: 10 })); }
  return P;
}
// a forearm with soft musculature, the loose red sleeve slid back toward the elbow in a few large folds
function armPrims(Wr, E, sd, seed) {
  const v = [E[0] - Wr[0], E[1] - Wr[1]], L = Math.hypot(v[0], v[1]), d = [v[0] / L, v[1] / L]; let n = [-d[1], d[0]]; if (n[0] * sd < 0) n = [-n[0], -n[1]];
  const Pq = (q, o = 0) => [Wr[0] + v[0] * q + n[0] * o, Wr[1] + v[1] * q + n[1] * o], r = rng(seed), P = [], folds = [];
  P.push(C_(Pq(-0.06), Pq(0.6), 36, 58, 56, 28, 0.85, 'skin', { blend: 14 }));
  P.push(C_(Pq(0.16, 14), Pq(0.56, 20), 32, 44, 50, 30, 0.6, 'skin', { blend: 24 }));        // brachioradialis
  P.push(C_(Pq(0.22, -14), Pq(0.54, -17), 30, 40, 48, 28, 0.5, 'skin', { blend: 24 }));      // flexors
  for (let k = 0; k < 4; k++) { const q = 0.46 + k * 0.17 + (r() - 0.5) * 0.05, w = lerp(84, 116, clamp((q - 0.38) / 0.75)), sk = (k % 2 ? 1 : -1) * (0.07 + r() * 0.06);
    folds.push(fold([Pq(q - sk, w), Pq(q + sk * 0.2, 0), Pq(q + sk, -w)], 22 + r() * 12, (k % 2 ? 11 : -15) * (0.8 + 0.4 * r()), 'both', 3)); }
  folds.push(fold([Pq(0.44, 38), Pq(0.78, 48), Pq(1.12, 42)], 16, -9)); folds.push(fold([Pq(0.5, -40), Pq(0.84, -50), Pq(1.12, -46)], 16, -8));
  P.push(C_(Pq(0.38), Pq(1.16), 84, 120, 76, 16, 0.72, 'tunic', { folds }));
  P.push(C_(Pq(0.39, 86), Pq(0.39, -86), 15, 15, 126, 126, 0.75, 'tunic', { blend: 7 }));       // the sleeve's rolled hem
  P.push(C_(Pq(0.378, 84), Pq(0.378, -84), 4.4, 4.4, 139, 139, 0.8, 'lining', { blend: 2 }));   // ochre trim
  return P;
}

// ---------------------------------------------------------------- the thought-vortex: Leonardo's deluge studies, in line only
// Several interlocking eddies of different sizes and turning directions (disk coordinates, tilted into perspective); each
// strand is a spiral around one eddy with a curl at its start, drawn with a pressure that swells and thins (hairline →
// chalk). Eddies are born one by one; they wander and revolve; at the release they weaken and the strands unwind.
const EDDIES = [   // [dx, dy, size, turn, birth (s after the first strand)]
  [0, 0, 1, 1, 0], [-0.6, -0.12, 0.5, -1, 1.3], [0.58, -0.05, 0.46, -1, 2.1], [-0.28, 0.44, 0.36, 1, 2.9], [0.36, 0.48, 0.33, 1, 3.5],
  [0.08, -0.58, 0.3, -1, 4.2], [-0.86, 0.3, 0.27, 1, 6.6], [0.86, 0.26, 0.27, 1, 7.4], [-0.5, -0.5, 0.22, 1, 8.4], [0.6, -0.48, 0.22, -1, 9.2],
];
function pickInk(x, wts) { let s = 0; for (const k of INKK) s += wts[k] || 0; let v = x * s; for (const k of INKK) { v -= wts[k] || 0; if (v <= 0) return k; } return 'sang'; }
function vortexLines(t, V) {
  const phi = vphase(t), out = [], eds = [];
  EDDIES.forEach(([dx, dy, sz, turn, bt], i) => { const on = ss(V.t0 + bt, V.t0 + bt + 0.9, t); if (on <= 0) return;
    const a = Math.atan2(dy, dx) + 0.07 * phi, rd = Math.hypot(dx, dy) * (1 + 0.25 * (V.unwind || 0));
    eds.push({ x: rd * Math.cos(a) + 0.04 * Math.sin(phi * 0.4 + i), y: rd * Math.sin(a) + 0.04 * Math.cos(phi * 0.33 + i * 2), sz: sz * (0.4 + 0.6 * on), turn, w: sz * on }); });
  let wsum = 0; eds.forEach(e => { wsum += e.w; });
  for (let k = 0; k < V.slots; k++) {
    const born = V.birth(k); if (t < born) continue;
    const r0 = rng(k * 9176 + 17 + V.seed), first = V.first && k === 0;
    const per = first ? V.first.per : lerp(V.life[0], V.life[1], r0());
    const tt = t - born, n = Math.floor(tt / per), tau = (tt - n * per) / per;
    const isFirst = first && n === 0, rr = rng(k * 7919 + n * 104729 + V.seed);
    let pick = rr() * wsum, E0 = eds[0]; for (const e of eds) { pick -= e.w; if (pick <= 0) { E0 = e; break; } }
    if (isFirst) E0 = eds[0];
    const th0 = rr() * TAU, sz = E0.sz;
    let span = isFirst ? V.first.span : (1.0 + rr() * 2.2) * Math.PI;
    let ro = (isFirst ? V.first.ro : lerp(0.35, 1.0, Math.sqrt(rr()))) * sz;
    let ri = ro * (isFirst ? V.first.ri : lerp(0.06, 0.55, rr() * rr()));
    const nl = isFirst ? 1 : 1 + Math.floor(rr() * 2.4), dr = (0.012 + rr() * 0.014) * Math.sqrt(sz);
    const chalk = !isFirst && rr() < 0.22, col = isFirst ? 'sang' : pickInk(rr(), chalk ? V.chalkInks : V.inks), col2 = rr() < 0.4 ? pickInk(rr(), V.inks) : col;
    const w = (isFirst ? 1.6 : chalk ? lerp(2.0, 3.0, rr()) : lerp(0.5, 1.4, rr())) * V.wMul, spd = (0.75 + rr() * 0.6) * E0.turn * (0.7 + 0.6 / (0.6 + sz));
    const curl = isFirst || rr() < V.curlP, cs = rr() < 0.5 ? 1 : -1, cR = (0.03 + rr() * 0.05) * V.R * Math.sqrt(sz), cT = 1.1 + rr() * 1.1;
    const zA = (rr() - 0.5) * 0.14, zP = rr() * TAU, aRand = (chalk ? 0.75 : 0.55) + 0.4 * rr(), pf = 4 + rr() * 8, pp = rr() * TAU;
    const uw = V.unwind || 0; span *= 1 - 0.5 * uw; ri = lerp(ri, ro * 0.95, uw); ro *= 1 + 0.3 * uw;
    const hd = ss(0, isFirst ? 0.5 : 0.42, tau), tl = ss(isFirst ? 0.8 : 0.6, 1, tau);
    if (hd - tl < 0.015) continue;
    const alpha = V.alpha * (isFirst ? 1 : aRand) * (V.slotA ? V.slotA(k) : 1);
    if (alpha < 0.02) continue;
    const N = Math.max(12, Math.ceil(span * ro * V.R * (hd - tl) / 6)), base = [];
    for (let i = 0; i <= N; i++) { const s = lerp(tl, hd, i / N); base.push([th0 + spd * phi + span * s * E0.turn, ro * Math.pow(ri / ro, Math.pow(s, 0.85))]); }
    for (let j = 0; j < nl; j++) {
      const off = (j - (nl - 1) / 2) * dr, pts = [];
      for (const [th, r] of base) { const rj = Math.max(0.005, r + off * (0.5 + 0.5 * r / sz)), ct = Math.cos(th), st = Math.sin(th), dx = E0.x + rj * ct, dy = E0.y + rj * st, rr2 = dx * dx + dy * dy;
        const lift = V.R * (V.dome * Math.max(0, 1 - rr2) + zA * rj * Math.sin(2 * th + zP));
        pts.push([V.cx + V.R * dx, V.cy + V.R * dy * V.tilt - lift, dy > 0.18 ? 1 : -1]); }
      if (curl && tl < 0.02 && pts.length > 3) {
        const p0 = pts[0], p1 = pts[2]; let dx = p1[0] - p0[0], dy = p1[1] - p0[1]; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
        const R = cR * (1 + 0.18 * j), ccx = p0[0] - dy * cs * R, ccy = p0[1] + dx * cs * R, a0 = Math.atan2(p0[1] - ccy, p0[0] - ccx), M = Math.ceil(cT * 26), cp = [];
        for (let i = 0; i < M; i++) { const q = i / M, a = a0 - cs * (1 - q) * cT * TAU, rad = R * Math.pow(0.18, 1 - q); cp.push([ccx + Math.cos(a) * rad, ccy + Math.sin(a) * rad, p0[2]]); }
        pts.unshift(...cp);
      }
      out.push({ pts, w: w * (j === 0 ? 1 : 0.65), col: j === 1 ? col2 : col, a: alpha * (j === 0 ? 1 : 0.8), pf, pp });
    }
  }
  return out;
}
function drawLines(lines, gB, gF, wk = 1) {
  const bat = new Map();
  const get = (lay, col, a) => { const al = Math.round(a * 14) / 14, k = lay + col + al; let e = bat.get(k); if (!e) { e = { p: new Path2D(), col, a: al, lay }; bat.set(k, e); } return e.p; };
  for (const L of lines) {
    const p = L.pts, n = p.length; if (n < 2) continue;
    const lx = new Float32Array(n), ly = new Float32Array(n), rx = new Float32Array(n), ry = new Float32Array(n);
    for (let i = 0; i < n; i++) { const a = p[Math.max(0, i - 1)], b = p[Math.min(n - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const q = i / (n - 1), hw = 0.5 * L.w * wk * Math.pow(Math.sin(Math.PI * (q * 0.97 + 0.015)), 0.5) * (0.55 + 0.45 * Math.sin(q * (L.pf || 6) + (L.pp || 0))) + 0.14;
      lx[i] = p[i][0] - dy * hw; ly[i] = p[i][1] + dx * hw; rx[i] = p[i][0] + dy * hw; ry[i] = p[i][1] - dx * hw; }
    let s = 0;
    for (let i = 1; i <= n; i++) {
      if (i === n || (p[i][2] >= 0) !== (p[s][2] >= 0)) { const e = Math.min(n - 1, i);
        if (e > s) { const path = get(p[s][2] >= 0 ? 'F' : 'B', L.col, L.a); path.moveTo(lx[s], ly[s]); for (let k = s + 1; k <= e; k++) path.lineTo(lx[k], ly[k]); for (let k = e; k >= s; k--) path.lineTo(rx[k], ry[k]); path.closePath(); }
        s = i; }
    }
  }
  for (const e of bat.values()) { const g = e.lay === 'F' ? gF : gB; if (!g) continue; g.fillStyle = rgba(INK[e.col], e.a); g.fill(e.p); }
}
function rays(c, cx, cy, amt, t, len) {
  if (amt < 0.01) return;
  c.save(); c.globalCompositeOperation = 'lighter';
  const r = rng(77), n = 28, rot = t * 0.1;
  for (let i = 0; i < n; i++) { const a = i / n * TAU + rot + (r() - 0.5) * 0.18, wd = 0.01 + r() * 0.028, L = len * (0.55 + r() * 0.55), al = amt * (0.16 + r() * 0.3) * (0.7 + 0.3 * Math.sin(t * 2.6 + i * 1.7));
    c.fillStyle = linGrad(c, cx, cy, cx + Math.cos(a) * L, cy + Math.sin(a) * L, [[0, [255, 228, 156], al], [0.3, [255, 208, 122], al * 0.55], [1, [255, 200, 110], 0]]);
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a - wd) * L, cy + Math.sin(a - wd) * L); c.lineTo(cx + Math.cos(a + wd) * L, cy + Math.sin(a + wd) * L); c.closePath(); c.fill(); }
  c.fillStyle = radGrad(c, cx, cy, 0, len * 0.4, [[0, [255, 238, 186], 0.55 * amt], [0.4, [255, 220, 150], 0.2 * amt], [1, [255, 210, 140], 0]]); c.fillRect(cx - len * 0.4, cy - len * 0.4, len * 0.8, len * 0.8);
  c.restore();
}
function vortexBack(c, t, V, applyCam) {
  const B = scratch('vB'), F = scratch('vF'), gb = B.getContext('2d'), gf = F.getContext('2d');
  gb.reset(); gf.reset(); applyCam(gb); applyCam(gf);
  drawLines(vortexLines(t, V), gb, gf, 1);
  c.drawImage(B, 0, 0);
}
function vortexFront(c, glowAmt) {
  const B = scratch('vB'), F = scratch('vF');
  c.drawImage(F, 0, 0);
  if (glowAmt > 0.01) { const G = sized('vglow', QW, QH), gg = G.getContext('2d'); gg.reset(); gg.drawImage(B, 0, 0, QW, QH); gg.drawImage(F, 0, 0, QW, QH);
    const Gs = softOf(G, 'vglow', 2.5); c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = glowAmt; c.drawImage(Gs, 0, 0, W, H); c.restore(); }
}

// ---------------------------------------------------------------- WIDE: camera & geometry (world px)
function camWide(t) {
  const e = clamp(t / 6.32), k = 0.65 * e + 0.35 * e * e * (3 - 2 * e), d = CAM.drift(t, 2.2, 1.3);
  return { x: 540 + d[0], y: 960 - 62 * k + d[1], z: CAM.zlerp(1, 1.2, k) };
}
let MOONW = null;
const moonW = () => MOONW || (MOONW = CAM.toWorld(camWide(T3().CUT), 247.5, 533.3));      // = the godRays burst point at the cut
const WIN = { cx: 480, spring: 625, rOut: 335, rIn: 295, sill: 985 };
const OUTER = archPath(WIN.cx - WIN.rOut, WIN.cx + WIN.rOut, WIN.spring, 1003);
const INNER = archPath(WIN.cx - WIN.rIn, WIN.cx + WIN.rIn, WIN.spring, WIN.sill);
const SKYP = archPath(WIN.cx - WIN.rIn + 40, WIN.cx + WIN.rIn - 24, 636, WIN.sill);
const BKW = { x: 170, y: 320, w: 620, h: 680 };
const NICHE = { x: 88, top: 586, bot: 700, hw: 34 };
const FLOOR_Y = 1245;
const FLAME = [107, 673];
const WHEAD = { x: 566, y: 718, u: 70 };
const LI_W = { L: [-0.72, -0.38, 0.58], keyI: 0.9, amb: 0.07, sss: 1, fillI: 0.35, fillCol: [66, 86, 106], rimI: 0.5, rimCol: [118, 148, 172], glowI: 0, glowCol: [190, 150, 90], bounceI: 0.22, bounceCol: [70, 30, 18] };

const BACKW = () => bake('backW', BKW.x, BKW.y, BKW.w, BKW.h, 1.1, g => { const m = moonW(); landscape(g, { x0: BKW.x, x1: BKW.x + BKW.w, y0: BKW.y, y1: BKW.y + BKW.h, moon: [m[0], m[1], 19], step: 2 }); });
function wallW(g) {
  g.fillStyle = '#3d2c1d'; g.fillRect(-MG, -MG, W + 2 * MG, FLOOR_Y + MG + 10);
  g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.55; g.drawImage(nzWall(), -MG, -MG, W + 2 * MG, FLOOR_Y + MG + 10); g.restore();
  const r = rng(12); for (let k = 0; k < 30; k++) blob(g, r() * W, r() * FLOOR_Y, 80 + r() * 200, 60 + r() * 160, r() < 0.5 ? '#5a4330' : '#24180e', 0.12 + r() * 0.12);
  g.fillStyle = linGrad(g, 0, -MG, 0, 760, [[0, [8, 5, 2], 0.82], [1, [8, 5, 2], 0]]); g.fillRect(-MG, -MG, W + 2 * MG, 810);
  g.fillStyle = linGrad(g, 0, 0, W + MG, 0, [[0, [8, 5, 2], 0], [0.55, [8, 5, 2], 0.05], [1, [8, 5, 2], 0.45]]); g.fillRect(-MG, -MG, W + 2 * MG, FLOOR_Y + MG);
  g.fillStyle = linGrad(g, 0, 190, 0, 236, [[0, '#6e5a40'], [0.18, '#8a7454'], [0.3, '#4a3a28'], [0.75, '#2a1e12'], [1, 'rgba(20,12,6,0)']]); g.fillRect(-MG, 190, W + 2 * MG, 46);
  g.save(); g.globalCompositeOperation = 'screen';
  g.fillStyle = radGrad(g, FLAME[0], FLAME[1], 6, 700, [[0, [255, 196, 120], 0.55], [0.18, [236, 158, 86], 0.26], [0.5, [200, 120, 60], 0.08], [1, [200, 120, 60], 0]]); g.fillRect(-MG, -MG, W + 2 * MG, FLOOR_Y + MG);
  g.fillStyle = radGrad(g, 470, 700, 200, 620, [[0, [150, 176, 190], 0.18], [1, [150, 176, 190], 0]]); g.fillRect(-MG, 100, W + 2 * MG, 1100);
  g.restore();
}
function windowW(g) {
  g.save(); g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 26; g.shadowOffsetX = 12; g.shadowOffsetY = 10;
  g.fillStyle = linGrad(g, WIN.cx - WIN.rOut, 0, WIN.cx + WIN.rOut, 0, [[0, '#a08766'], [0.45, '#86704f'], [1, '#5a4934']]); g.fill(OUTER); g.restore();
  g.save(); g.clip(OUTER);
  g.fillStyle = radGrad(g, FLAME[0], FLAME[1], 10, 520, [[0, [255, 210, 150], 0.4], [1, [255, 210, 150], 0]]); g.globalCompositeOperation = 'screen'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
  g.strokeStyle = 'rgba(40,28,16,.45)'; g.lineWidth = 1.4;
  for (let a = Math.PI; a <= TAU + 0.01; a += Math.PI / 13) { g.beginPath(); g.moveTo(WIN.cx + Math.cos(a) * WIN.rIn, WIN.spring + Math.sin(a) * WIN.rIn); g.lineTo(WIN.cx + Math.cos(a) * WIN.rOut, WIN.spring + Math.sin(a) * WIN.rOut); g.stroke(); }
  for (let y = WIN.spring + 60; y < WIN.sill; y += 64) { g.beginPath(); g.moveTo(WIN.cx - WIN.rOut, y); g.lineTo(WIN.cx - WIN.rIn, y); g.moveTo(WIN.cx + WIN.rIn, y); g.lineTo(WIN.cx + WIN.rOut, y); g.stroke(); }
  g.strokeStyle = 'rgba(238,222,190,.35)'; g.lineWidth = 2.2; g.stroke(archPath(WIN.cx - WIN.rIn - 9, WIN.cx + WIN.rIn + 9, WIN.spring, 1003));
  g.strokeStyle = 'rgba(30,20,10,.45)'; g.lineWidth = 3; g.stroke(archPath(WIN.cx - WIN.rIn - 4, WIN.cx + WIN.rIn + 4, WIN.spring, 1003));
  g.restore();
  g.fillStyle = linGrad(g, WIN.cx - 20, 0, WIN.cx + 20, 0, [[0, '#a89070'], [1, '#6a5640']]); g.beginPath(); g.moveTo(WIN.cx - 17, WIN.spring - WIN.rIn + 2); g.lineTo(WIN.cx + 17, WIN.spring - WIN.rIn + 2); g.lineTo(WIN.cx + 24, WIN.spring - WIN.rOut - 8); g.lineTo(WIN.cx - 24, WIN.spring - WIN.rOut - 8); g.closePath(); g.fill();
  g.fillStyle = linGrad(g, WIN.cx - WIN.rIn, 0, WIN.cx + WIN.rIn, 0, [[0, '#2a2420'], [0.12, '#3a3632'], [0.88, '#5e5a52'], [1, '#8a8676']]); g.fill(INNER);
  g.save(); g.clip(INNER); g.fillStyle = linGrad(g, 0, WIN.spring - WIN.rIn, 0, WIN.spring, [[0, [10, 8, 6], 0.55], [1, [10, 8, 6], 0]]); g.fillRect(0, 0, W, WIN.spring); g.restore();
  g.fillStyle = linGrad(g, 0, WIN.sill, 0, WIN.sill + 18, [[0, '#b8a888'], [1, '#8a7a5e']]); g.fillRect(WIN.cx - WIN.rOut - 8, WIN.sill - 2, 2 * WIN.rOut + 16, 18);
  g.fillStyle = 'rgba(214,226,232,.28)'; g.fillRect(WIN.cx - WIN.rIn + 40, WIN.sill - 2, 2 * WIN.rIn - 64, 3);
  g.fillStyle = linGrad(g, 0, WIN.sill + 16, 0, WIN.sill + 32, [[0, '#4e4232'], [1, 'rgba(30,22,14,0)']]); g.fillRect(WIN.cx - WIN.rOut - 8, WIN.sill + 16, 2 * WIN.rOut + 16, 16);
}
function nicheW(g) {
  const { x, top, bot, hw } = NICHE, p = archPath(x - hw, x + hw, top + hw, bot);
  g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 10; g.fillStyle = '#7a6448'; g.fill(archPath(x - hw - 8, x + hw + 8, top + hw, bot + 8)); g.restore();
  g.fillStyle = linGrad(g, 0, top, 0, bot, [[0, '#1c120a'], [1, '#3a2614']]); g.fill(p);
  g.save(); g.clip(p); g.globalCompositeOperation = 'screen'; g.fillStyle = radGrad(g, FLAME[0], FLAME[1], 2, 70, [[0, [255, 200, 120], 0.9], [0.4, [220, 130, 60], 0.35], [1, [200, 110, 50], 0]]); g.fillRect(x - hw, top, hw * 2, bot - top); g.restore();
  g.fillStyle = '#8a7252'; g.fillRect(x - hw - 10, bot, hw * 2 + 20, 8);
  g.fillStyle = linGrad(g, x - 20, 0, x + 18, 0, [[0, '#d08a54'], [0.5, '#9a5a30'], [1, '#4a2410']]);
  g.beginPath(); g.ellipse(x - 2, bot - 9, 17, 8, 0, 0, TAU); g.fill();
  g.beginPath(); g.moveTo(x + 8, bot - 14); g.quadraticCurveTo(FLAME[0] + 2, bot - 22, FLAME[0] + 3, FLAME[1] + 12); g.lineTo(FLAME[0] - 4, FLAME[1] + 14); g.quadraticCurveTo(x + 4, bot - 8, x + 2, bot - 6); g.fill();
  g.strokeStyle = '#6a3a1c'; g.lineWidth = 3; g.beginPath(); g.arc(x - 20, bot - 12, 6, Math.PI * 0.6, Math.PI * 1.7); g.stroke();
  g.fillStyle = 'rgba(255,214,150,.6)'; g.beginPath(); g.ellipse(x - 2, bot - 15, 9, 2.4, 0, 0, TAU); g.fill();
}
function floorW(g) {
  // terracotta cotto in perspective, each tile slightly different, worn edges catching the lamp
  const VP = [540, 760], FH = 4850, F = 1000, proj = (X, Z) => [VP[0] + F * X / Z, VP[1] + FH / Z], r = rng(23), T = 0.78;
  g.fillStyle = '#2a140a'; g.fillRect(-MG, FLOOR_Y, W + 2 * MG, H - FLOOR_Y + MG);
  const zw = FH / (FLOOR_Y - VP[1]);
  for (let z0 = zw, j = 0; z0 > 3.4; z0 -= T, j++) { const z1 = z0 - T;
    for (let i = -18; i < 18; i++) { const X0 = i * T, X1 = X0 + T, q = [proj(X0, z0), proj(X1, z0), proj(X1, z1), proj(X0, z1)];
      if (q[2][0] < -MG - 300 || q[3][0] > W + MG + 300) continue;
      const gap = 1.2 + 3.2 * (FH / z1 - (FLOOR_Y - VP[1])) / (H - FLOOR_Y), cx = (q[0][0] + q[2][0]) / 2;
      const inset = (p, k) => [lerp(p[0], cx, k * 0.02), p[1]];
      const tile = new Path2D(); const qi = [[q[0][0] + gap, q[0][1] + gap * 0.5], [q[1][0] - gap, q[1][1] + gap * 0.5], [q[2][0] - gap, q[2][1] - gap * 0.5], [q[3][0] + gap, q[3][1] - gap * 0.5]].map(p => inset(p, 1));
      qi.forEach((p, k) => k ? tile.lineTo(...p) : tile.moveTo(...p)); tile.closePath();
      const tone = r(); g.fillStyle = linGrad(g, 0, q[0][1], 0, q[2][1], [[0, mix([176, 92, 54], [140, 70, 40], tone)], [1, mix([150, 76, 44], [112, 54, 30], tone)]]); g.fill(tile);
      g.save(); g.clip(tile); blob(g, cx + (r() - 0.5) * 30, (q[0][1] + q[2][1]) / 2, 50, 12, r() < 0.5 ? '#e0a874' : '#4a200e', 0.2 + 0.15 * r()); g.restore();
      g.strokeStyle = 'rgba(255,214,170,.18)'; g.lineWidth = 1; g.beginPath(); g.moveTo(...qi[3]); g.lineTo(...qi[2]); g.stroke(); } }
  // light: warm pool from the lamp, cool breath from the window, darkness toward the edges
  g.save(); g.globalCompositeOperation = 'multiply';
  g.fillStyle = linGrad(g, 0, FLOOR_Y, 0, H + MG, [[0, [90, 66, 54]], [0.15, [170, 140, 120]], [0.55, [196, 168, 148]], [1, [96, 72, 60]]]); g.fillRect(-MG, FLOOR_Y, W + 2 * MG, H - FLOOR_Y + MG);
  g.restore();
  g.save(); g.globalCompositeOperation = 'screen';
  g.fillStyle = radGrad(g, 300, 1400, 20, 640, [[0, [255, 186, 112], 0.3], [1, [255, 186, 112], 0]]); g.fillRect(-MG, FLOOR_Y, W + 2 * MG, H);
  g.fillStyle = radGrad(g, 660, 1380, 20, 420, [[0, [170, 196, 210], 0.1], [1, [170, 196, 210], 0]]); g.fillRect(-MG, FLOOR_Y, W + 2 * MG, H);
  g.restore();
  g.fillStyle = radGrad(g, 470, 1470, 300, 1000, [[0, [12, 6, 3], 0], [1, [12, 6, 3], 0.66]]); g.fillRect(-MG, FLOOR_Y, W + 2 * MG, H - FLOOR_Y + MG);
  g.fillStyle = linGrad(g, 0, FLOOR_Y - 6, 0, FLOOR_Y + 40, [[0, [10, 6, 3], 0.85], [1, [10, 6, 3], 0]]); g.fillRect(-MG, FLOOR_Y - 6, W + 2 * MG, 46);
  // cast shadows (the lamp is high on the left): under the bed, and his soft shadow stretching to the right
  g.save(); g.filter = 'blur(14px)';
  g.fillStyle = 'rgba(6,3,1,.78)'; g.beginPath(); g.moveTo(-MG, 1196); g.lineTo(714, 1196); g.lineTo(790, 1290); g.lineTo(-MG, 1290); g.fill();
  g.fillStyle = 'rgba(6,3,1,.6)'; g.beginPath(); g.moveTo(452, 1352); g.quadraticCurveTo(560, 1330, 700, 1336); g.quadraticCurveTo(860, 1346, 930, 1372); g.quadraticCurveTo(820, 1396, 660, 1388); g.quadraticCurveTo(520, 1384, 452, 1366); g.fill();
  g.filter = 'blur(5px)'; g.fillStyle = 'rgba(4,2,1,.8)'; g.beginPath(); g.ellipse(476, 1360, 34, 8, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(636, 1354, 34, 8, 0, 0, TAU); g.fill();
  g.restore();
}
function bedFrameW(g) {
  const hb = smooth([[-40, 1196], [-40, 902], [-6, 880], [30, 896], [32, 1196]]);
  g.fillStyle = linGrad(g, -40, 0, 34, 0, [[0, '#1e110a'], [0.6, '#4a2c18'], [1, '#7a4c2a']]); g.fill(hb);
  [[-10], [682]].forEach(([x]) => { g.fillStyle = linGrad(g, x, 0, x + 26, 0, [[0, '#6a4024'], [0.4, '#8a5832'], [1, '#2a160a']]); g.beginPath(); g.moveTo(x, 1188); g.lineTo(x + 26, 1188); g.lineTo(x + 22, 1220); g.quadraticCurveTo(x + 30, 1236, x + 22, 1252); g.lineTo(x + 20, 1266); g.lineTo(x + 6, 1266); g.lineTo(x + 4, 1252); g.quadraticCurveTo(x - 4, 1236, x + 4, 1220); g.closePath(); g.fill(); });
  g.fillStyle = linGrad(g, 0, 1166, 0, 1196, [[0, '#9a6a40'], [0.15, '#6a4226'], [1, '#2a170a']]); g.fillRect(-MG, 1166, 760 + MG, 30);
}
function linenPrims() {
  const P = [], r = rng(77);
  const top = polyP([[-60, 996], [668, 996], [712, 1082], [-60, 1082]]);
  P.push(D_(top, 'linen', { over: false, thick: 0, soft: 1.5, zf: (x, y) => (y - 996) * 0.95, folds: [
    fold([[500, 1052], [430, 1034], [330, 1016], [230, 1004]], 7, -6, 'end'), fold([[506, 1040], [470, 1022], [420, 1004]], 6, -4, 'end'),
    fold([[600, 1050], [636, 1028], [672, 1006]], 6, -6, 'end'), fold([[590, 1038], [608, 1018], [628, 1000]], 5, -4, 'end'),
    fold([[320, 1064], [210, 1052], [90, 1048]], 10, 3.5), fold([[270, 1030], [150, 1020]], 9, 2.5), fold([[660, 1072], [700, 1066]], 6, 3) ] }));
  P.push(G_(548, 1050, 86, 26, -13));
  const hem = []; for (let x = 716; x >= -60; x -= 6) hem.push([x, 1170 + 5 * Math.sin(x * 0.07 + 1) + 3 * Math.sin(x * 0.19)]);
  const hang = polyP([[-60, 1080], [712, 1080], [716, 1164], ...hem]);
  const hf = []; let x = -40;
  while (x < 712) { const w = 10 + r() * 14, a = (r() < 0.5 ? -1 : 1) * (5 + r() * 9); hf.push(fold([[x + (r() - 0.5) * 8, 1084], [x + (r() - 0.5) * 14, 1130], [x + (r() - 0.5) * 18, 1182]], w, a, 'start')); x += 26 + r() * 42; }
  hf.push(fold([[470, 1182], [500, 1124], [524, 1088]], 8, -8, 'start')); hf.push(fold([[630, 1182], [606, 1124], [584, 1088]], 8, -8, 'start'));
  P.push(D_(hang, 'linen', { over: false, thick: 0, soft: 1.2, zf: (x, y) => 82 + (y - 1082) * 0.05, folds: hf }));
  P.push(E_(126, 1006, 100, 42, 30, 10, 'linen', { folds: [fold([[60, 1004], [126, 1012], [190, 1002]], 10, -6)] }));
  return P;
}
const LINENW = () => sculptOnce('linen', -60, 940, 780, 260, RS, linenPrims, { ...LI_W, L: [-0.7, -0.45, 0.56], keyI: 0.9, amb: 0.09, rimI: 0.45, fillI: 0.25 });
const FRONTW = () => bake('frontW', -MG, -MG, W + 2 * MG, H + 2 * MG, 1.0, g => {
  wallW(g); windowW(g); nicheW(g); floorW(g); bedFrameW(g); drawSc(g, LINENW());
  g.save(); g.filter = 'blur(10px)'; g.fillStyle = 'rgba(8,4,2,.45)'; g.beginPath(); g.ellipse(690, 1040, 60, 34, -0.2, 0, TAU); g.fill(); g.restore();   // his shadow on the linen
  g.save(); g.globalCompositeOperation = 'destination-out'; g.fill(SKYP); g.restore();
});
// ---- the wide figure: hunched on the edge of the bed, turned a little to the right, wrapped in the mantle (a soft
//      pyramid in Leonardo's way): rounded back on the left, near shoulder higher, red tunic in the opening, forearms
//      resting on the lap, hands loose on the knees, the mantle falling in heavy folds over the thighs and the bed edge.
function figWPrims() {
  const P = [], T = 'tunic', S = 'skin', M = 'mantle', Lg = 'lining';
  // bare shins and feet, turned toward the right
  for (const [K, A, s] of [[[522, 1128], [504, 1334], -1], [[642, 1116], [654, 1324], 1]]) {
    P.push(C_(K, A, 29, 16, 118, 112, 0.85, S, { blend: 8 }));
    P.push(C_([K[0] + s * 8, K[1] + 34], [K[0] + s * 5, K[1] + 118], 22, 14, 112, 110, 0.8, S, { blend: 12 }));
    P.push(E_(A[0] + 10, A[1] + 19, 26, 14, 13, 114, S, { rot: 0.18, blend: 8 }));
    for (let q = 0; q < 5; q++) P.push(E_(A[0] - 3 + q * 7.4, A[1] + 31 - Math.abs(q - 1.6) * 1.3 + q * 1.4, 4.2, 5.5, 4.5, 120, S, { blend: 2.5 }));
  }
  // the body under the mantle
  P.push(E_(514, 912, 112, 118, 70, 30, T));                                       // rounded hunched back / ribcage
  P.push(E_(576, 950, 82, 100, 62, 56, T, { blend: 26 }));                         // chest, turned toward the right
  P.push(C_([452, 852], [652, 878], 40, 34, 88, 82, 0.85, T, { blend: 30 }));     // shoulders, the near one higher
  P.push(C_([450, 860], [440, 982], 34, 28, 94, 104, 0.85, T, { blend: 26 }));    // near upper arm
  P.push(C_([654, 884], [684, 984], 30, 25, 84, 94, 0.85, T, { blend: 26 }));     // far upper arm
  P.push(E_(548, 1040, 128, 56, 46, 62, T, { blend: 30 }));                        // pelvis
  P.push(C_([502, 1046], [520, 1110], 50, 44, 74, 128, 0.8, T, { blend: 24 }));
  P.push(C_([600, 1040], [640, 1098], 46, 40, 72, 122, 0.8, T, { blend: 24 }));
  P.push(E_(520, 1116, 44, 36, 24, 122, T, { blend: 16 })); P.push(E_(640, 1104, 40, 33, 24, 116, T, { blend: 16 }));
  P.push(C_([568, 784], [554, 842], 22, 28, 92, 100, 0.95, S, { blend: 14 }));    // neck, mostly hidden by the bowed head
  P.push(C_([560, 1000], [614, 994], 4, 4, 118, 118, 1, 'cord'));                  // girdle in the opening
  // the mantle over the lap: over the knees to mid-shin, spilling over the bed edge on the left in heavy folds
  const lap = [[404, 1028], [480, 1014], [560, 1010], [640, 1012], [690, 1028], [698, 1070], [688, 1112], [676, 1152], [668, 1198], [646, 1216], [618, 1206], [600, 1212], [580, 1236], [560, 1248], [540, 1242], [522, 1228], [502, 1236], [478, 1228], [452, 1220], [426, 1224], [400, 1212], [392, 1150], [396, 1086]];
  const hem = lap.slice(8, 21);
  P.push(D_(smooth(lap), M, { thick: 10, zf: (x, y) => 122 - (y - 1120) * 0.12, folds: [
    fold([[582, 1100], [576, 1170], [566, 1244]], 14, -17, 'start'), fold([[520, 1134], [516, 1180], [514, 1228]], 12, 8, 'start'), fold([[642, 1120], [646, 1166], [652, 1208]], 12, 8, 'start'),
    fold([[548, 1132], [546, 1190], [544, 1240]], 9, -8, 'start'), fold([[606, 1126], [610, 1170], [614, 1210]], 9, -8, 'start'),
    fold([[412, 1090], [410, 1150], [408, 1214]], 12, 7, 'start'), fold([[436, 1096], [434, 1160], [436, 1222]], 10, -9, 'start'), fold([[460, 1108], [460, 1170], [462, 1226]], 10, 6, 'start'), fold([[482, 1118], [484, 1176], [488, 1230]], 9, -7, 'start'),
    fold([[520, 1100], [494, 1066], [468, 1040]], 8, -6), fold([[640, 1090], [660, 1060], [678, 1036]], 8, -6), fold([[566, 1062], [586, 1044], [604, 1030]], 8, -5),
    fold([[428, 1050], [480, 1072], [528, 1076], [600, 1060]], 14, 6)] }));
  P.push(D_(bandAlong(hem, 9), Lg, { thick: 3, soft: 1.2 }));
  // forearms in red sleeves resting on the lap, ochre cuffs, loose hands on the knees
  P.push(C_([440, 982], [512, 1084], 26, 19, 112, 160, 0.85, T, { blend: 20, folds: [fold([[450, 1000], [470, 1040], [492, 1066]], 6, -6), fold([[462, 992], [486, 1030]], 5, 4)] }));
  P.push(C_([684, 984], [654, 1076], 24, 18, 102, 150, 0.85, T, { blend: 20, folds: [fold([[680, 1006], [668, 1050]], 5, -5)] }));
  P.push(C_([500, 1080], [526, 1066], 4, 4, 172, 172, 0.8, Lg, { blend: 2 })); P.push(C_([642, 1072], [666, 1066], 3.6, 3.6, 162, 162, 0.8, Lg, { blend: 2 }));
  for (const [Wr, s, z0] of [[[514, 1084], 1, 166], [[656, 1076], -1, 156]]) {
    P.push(E_(Wr[0] + 4 * s, Wr[1] + 20, 15, 21, 7, z0, S, { rot: -0.12 * s, blend: 6 }));                   // back of the hand
    for (let f = 0; f < 4; f++) { const bx = Wr[0] + 4 * s - 10 + f * 6.8, by = Wr[1] + 36 + Math.abs(f - 1.5) * 1.6;
      P.push(C_([bx, by], [bx + (f - 1.5) * 0.9 + s, by + 20 - Math.abs(f - 1.5) * 3], 3.9, 3.1, z0 + 5, z0, 0.9, S, { blend: 4 })); }
    P.push(C_([Wr[0] + 14 * s, Wr[1] + 10], [Wr[0] + 20 * s, Wr[1] + 28], 5, 4, z0 + 3, z0 + 4, 0.9, S, { blend: 5 }));
  }
  // the mantle over the back, shoulders and upper arms, open in front over the red chest; ochre linings
  const nearH = [[560, 798], [508, 804], [460, 824], [424, 856], [402, 908], [394, 970], [402, 1022], [424, 1052], [452, 1056], [476, 1026], [500, 984], [522, 930], [540, 878], [552, 836]];
  const farH = [[574, 804], [618, 822], [660, 852], [690, 900], [702, 958], [698, 1010], [680, 1034], [662, 1010], [644, 964], [626, 912], [610, 866], [594, 830]];
  P.push(D_(smooth(nearH), M, { thick: 11, folds: [fold([[430, 880], [414, 960], [418, 1030]], 7, -7), fold([[454, 860], [444, 940], [446, 1030]], 6, 6), fold([[480, 850], [470, 930], [466, 1010]], 6, -6), fold([[508, 830], [494, 880]], 6, 4)] }));
  P.push(D_(smooth(farH), M, { thick: 10, folds: [fold([[668, 880], [684, 950], [686, 1010]], 7, -6), fold([[640, 860], [652, 930], [660, 1000]], 6, 5)] }));
  P.push(D_(bandAlong([[552, 836], [540, 878], [522, 930], [500, 984], [476, 1026], [452, 1056]], 6, 8), Lg, { thick: 2, soft: 1 }));
  P.push(D_(bandAlong([[594, 830], [610, 866], [626, 912], [644, 964], [662, 1010]], 6, 7), Lg, { thick: 2, soft: 1 }));
  P.push(D_(bandAlong([[552, 846], [572, 856], [596, 848]], 4), Lg, { thick: 2, soft: 1 }));
  return P;
}
const FIGW = () => sculptOnce('figW', 380, 740, 340, 640, RS, figWPrims, LI_W, S => ({ aoR: 7, aoK: 0.05, shadow: maskOf(headPath(WHEAD.x + 18, WHEAD.y + 26, WHEAD.u, 0.1), S.w, S.h, 380, 740, RS, 9) }));

// ---------------------------------------------------------------- CLOSE-UP: camera, background, body
function camClose(t) {
  const u = T3(), d = CAM.drift(t, 4, 2.1);
  const push = 0.055 * ss(u.slits[1] - 0.4, u.peak[0] + 1.2, t) * (1 - ss(u.peak[1] + 0.6, u.handsDown[1], t)) + 0.012 * hitPulse(t);
  const pull = -0.045 * ss(u.eyesOpen - 0.3, u.fade[1], t);
  return { x: 540 + d[0], y: 960 + d[1] - 20 * ss(u.eyesOpen - 0.3, u.fade[1], t), z: 1 + push + pull };
}
const CHEAD = { x: 540, y: 880, u: 236 };
const LS_C = { s: 1.9, hz: 1150 };
const BGC = () => bake('bgC', -MG, -MG, W + 2 * MG, H + 2 * MG, 1.6, g => {
  const s = LS_C.s; g.save(); g.translate(540 - 540 * s, LS_C.hz - 768 * s); g.scale(s, s);
  const x0 = 540 - (540 + MG) / s, x1 = 540 + (540 + MG) / s, y0 = 768 + (-MG - LS_C.hz) / s, y1 = 768 + (H + MG - LS_C.hz) / s;
  landscape(g, { x0, x1, y0, y1, moon: [540 + (247.5 - 540) / s, 768 + (533.3 - LS_C.hz) / s, 15.5], step: 1.2 });
  g.restore();
  g.fillStyle = linGrad(g, 0, -MG, 0, 1000, [[0, [10, 16, 22], 0.5], [1, [10, 16, 22], 0]]); g.fillRect(-MG, -MG, W + 2 * MG, 1050);   // deeper night above
}, 1.1);
const LI_C = { L: [-0.66, -0.46, 0.6], keyI: 0.86, amb: 0.07, sss: 1, fillI: 0.42, fillCol: [66, 88, 110], rimI: 0.55, rimCol: [118, 148, 176], glowI: 0.25, glowCol: [200, 160, 92], bounceI: 0.36, bounceCol: [80, 32, 18] };
function torsoCPrims() {
  const P = [], S = 'skin';
  P.push(E_(540, 1850, 620, 580, 220, -40, S));
  for (const sd of [-1, 1]) {
    // (shoulder capsule removed by supervisor: the tunic/mantle now cover the shoulders; its edge showed as a crease line)
    P.push(C_([540 + sd * 66, 1160], [540 + sd * 16, 1352], 15, 11, 74, 106, 0.32, S, { blend: 24 }));        // a hint of the sterno-mastoid
    P.push(C_([540 + sd * 24, 1366], [540 + sd * 150, 1346], 10, 8, 100, 94, 0.55, S, { blend: 12 }));        // clavicle heads
  }
  P.push(C_([540, 1090], [540, 1352], 74, 90, 38, 30, 0.9, S, { blend: 36 }));
  P.push(G_(540, 1372, 22, 16, -11));
  const neckline = [[422, 1312], [446, 1346], [490, 1372], [540, 1382], [590, 1372], [634, 1346], [658, 1312]];
  const tun = [[-80, 1236], [140, 1214], [300, 1212], [422, 1240], ...neckline, [658, 1240], [780, 1212], [940, 1214], [1160, 1236], [1160, 2000], [-80, 2000]];
  P.push(D_(polyP(tun), 'tunic', { thick: 12, soft: 3, folds: [
    fold([[452, 1424], [440, 1650], [462, 1990]], 30, 9, 'start'), fold([[500, 1440], [506, 1700], [494, 1990]], 18, -11, 'start'), fold([[580, 1440], [574, 1700], [586, 1990]], 18, -11, 'start'),
    fold([[628, 1424], [642, 1650], [620, 1990]], 30, 9, 'start'), fold([[540, 1450], [540, 1990]], 26, 6, 'start'), fold([[470, 1392], [456, 1470]], 10, -6), fold([[610, 1392], [624, 1470]], 10, -6),
    fold([[300, 1440], [380, 1560], [420, 1700]], 16, -8), fold([[780, 1440], [700, 1560], [660, 1700]], 16, -8), fold([[340, 1340], [420, 1330]], 12, -5), fold([[740, 1340], [660, 1330]], 12, -5)] }));
  P.push(D_(bandAlong(neckline, 13), 'lining', { thick: 5, soft: 2 }));
  for (const sd of [-1, 1]) {
    const X = x => sd < 0 ? x : W - x;
    const m = [[X(-80), 1250], [X(100), 1232], [X(230), 1226], [X(306), 1250], [X(334), 1362], [X(342), 1480], [X(324), 1640], [X(310), 1800], [X(316), 2000], [X(-80), 2000]];
    P.push(D_(smooth(m), 'mantle', { thick: 30, soft: 3, folds: [
      fold([[X(100), 1390], [X(88), 1600], [X(112), 1990]], 34, 15, 'start'), fold([[X(168), 1382], [X(150), 1600], [X(176), 1990]], 24, -17, 'start'),
      fold([[X(236), 1374], [X(228), 1600], [X(250), 1990]], 30, 13, 'start'), fold([[X(290), 1378], [X(292), 1600], [X(284), 1990]], 20, -12, 'start'),
      fold([[X(30), 1420], [X(150), 1460], [X(260), 1490]], 20, -8)] }));
    P.push(D_(bandAlong([[X(306), 1322], [X(334), 1362], [X(342), 1480], [X(324), 1640], [X(310), 1800], [X(316), 2000]], 22, 26), 'lining', { thick: 6, soft: 2 }));
  }
  return P;
}
const TORSO_C = () => sculptOnce('torsoC', -80, 1040, W + 160, 940, 0.6, torsoCPrims, LI_C, S => ({ aoR: 14, aoK: 0.035, shadow: maskOf(headPath(CHEAD.x + 50, CHEAD.y + 64, CHEAD.u, 0), S.w, S.h, -80, 1040, 0.6, 14) }));

// ---------------------------------------------------------------- the panel: varnish, craquelure, brushwork, gesso
const OVER = () => cached('over', W, H, g => {
  g.fillStyle = radGrad(g, W / 2, H * 0.44, W * 0.32, H * 0.74, [[0, [18, 10, 4], 0], [0.55, [18, 10, 4], 0.26], [1, [8, 4, 2], 0.78]]); g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(150,108,38,.07)'; g.fillRect(0, 0, W, H);
  const r = rng(4); g.lineCap = 'round';
  for (let k = 0; k < 11000; k++) { const x = r() * W, y = r() * H, a = r() * Math.PI, L = 10 + r() * 18;
    g.strokeStyle = r() < 0.5 ? 'rgba(255,236,200,.02)' : 'rgba(20,10,0,.026)'; g.lineWidth = 5 + r() * 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
  // craquelure: a fine irregular network, visible only up close
  const cell = 22, nx = Math.ceil(W / cell) + 3, ny = Math.ceil(H / cell) + 3, pts = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) pts.push([(i - 1) * cell + (r() - 0.5) * cell * 0.9, (j - 1) * cell + (r() - 0.5) * cell * 0.9]);
  const cr = new Path2D(), edge = (a, b) => { cr.moveTo(a[0], a[1]); for (let s = 1; s <= 3; s++) { const q = s / 3; cr.lineTo(lerp(a[0], b[0], q) + (s < 3 ? (r() - 0.5) * 6 : 0), lerp(a[1], b[1], q) + (s < 3 ? (r() - 0.5) * 6 : 0)); } };
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const p = pts[j * nx + i]; if (i < nx - 1 && r() < 0.7) edge(p, pts[j * nx + i + 1]); if (j < ny - 1 && r() < 0.6) edge(p, pts[(j + 1) * nx + i]); }
  g.strokeStyle = 'rgba(26,14,4,.085)'; g.lineWidth = 0.8; g.stroke(cr);
  g.save(); g.translate(0.8, 0.8); g.strokeStyle = 'rgba(255,240,206,.04)'; g.lineWidth = 0.6; g.stroke(cr); g.restore();
  g.drawImage(P.grain(NS + 'gesso', 0.07, [40, 26, 12], 0.1), 0, 0);
});
function finish(c) {
  const B = sized('bloom', QW, QH), gb = B.getContext('2d'); gb.reset(); gb.filter = 'blur(7px) brightness(1.05)'; gb.drawImage(c.canvas, 0, 0, c.canvas.width, c.canvas.height, 0, 0, QW, QH);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = 'screen'; c.globalAlpha = 0.22; c.drawImage(B, 0, 0, QW, QH, 0, 0, c.canvas.width, c.canvas.height);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.drawImage(OVER(), 0, 0, c.canvas.width, c.canvas.height);
  c.restore();
}

// ---------------------------------------------------------------- WIDE: draw
function exWide(t) {
  const u = T3(), wide = ss(u.eyesWide - 0.05, u.eyesWide + 0.22, t), blink = Math.exp(-Math.pow((t - 2.55) / 0.06, 2));
  return { open: lerp(0.36, 1.05, wide) * (1 - blink), squeeze: 0, knot: 0.1 + 0.15 * wide, worry: lerp(0.35, 0.95, wide), clench: 0, oh: 0.45 * wide, smile: 0, sad: 1 - wide, pitch: lerp(0.12, 0.05, wide), yaw: 0.2 };
}
function drawWide(c, t) {
  const u = T3(), cam = camWide(t), A = anx(t), bp = barPulse(t), apply = g => CAM.apply(g, cam);
  c.save(); apply(c);
  c.drawImage(BACKW(), BKW.x, BKW.y, BKW.w, BKW.h);
  c.save(); c.clip(INNER);
  const m = moonW(); c.globalCompositeOperation = 'screen';
  c.fillStyle = radGrad(c, m[0], m[1], 10, 150, [[0, [220, 230, 220], 0.16 + 0.12 * bp], [1, [220, 230, 220], 0]]); c.fillRect(m[0] - 150, m[1] - 150, 300, 300);
  c.globalCompositeOperation = 'source-over';
  for (let k = 0; k < 16; k++) { const r = rng(900 + k), y = 760 + r() * 150 - 60 * A * r(), sp = 6 + r() * 10, x = BKW.x + ((r() * 900 + t * sp) % 900) - 150;
    blob(c, x, y, 120 + r() * 140, 12 + r() * 16 + 10 * A, A > 0.4 && r() < 0.5 ? '#9aa096' : '#d2d4c2', (0.12 + 0.2 * r()) * (0.45 + A)); }
  c.fillStyle = `rgba(16,20,26,${0.3 * A})`; c.fillRect(BKW.x, BKW.y, BKW.w, BKW.h);
  for (let k = 0; k < 10; k++) { const x = m[0] - 30 + k * 7 + Math.sin(t * 3 + k) * 3, tw = Math.max(0, Math.sin(t * 7 + k * 2.1)); c.fillStyle = `rgba(250,248,232,${0.55 * tw})`; c.fillRect(x, 770 + (k % 3) * 3, 5 + (k % 2) * 4, 1.2); }
  c.restore();
  c.drawImage(FRONTW(), -MG, -MG, W + 2 * MG, H + 2 * MG);
  const fl = 1 + 0.06 * Math.sin(t * 13) + 0.04 * Math.sin(t * 29 + 1), sw = Math.sin(t * 7) * 1.2;
  c.save(); c.globalCompositeOperation = 'screen';
  c.fillStyle = radGrad(c, FLAME[0], FLAME[1], 2, 90 * fl, [[0, [255, 214, 140], 0.75], [0.3, [255, 160, 70], 0.25], [1, [255, 140, 60], 0]]); c.fillRect(FLAME[0] - 100, FLAME[1] - 100, 200, 200);
  c.restore();
  c.fillStyle = radGrad(c, FLAME[0], FLAME[1] + 2, 0, 9 * fl, [[0, '#fffbe8'], [0.45, '#ffd36a'], [1, 'rgba(255,140,40,0)']]);
  c.beginPath(); c.moveTo(FLAME[0] - 4, FLAME[1] + 4); c.quadraticCurveTo(FLAME[0] - 4, FLAME[1] - 6, FLAME[0] + sw, FLAME[1] - 15 * fl); c.quadraticCurveTo(FLAME[0] + 4, FLAME[1] - 6, FLAME[0] + 4, FLAME[1] + 4); c.closePath(); c.fill();
  c.restore();
  // the deluge (line only), born as one spiral at swirlStart
  const grow = ss(u.swirlStart, u.TR_START + 0.3, t);
  const V = { cx: 560, cy: 476, R: lerp(90, 340, Math.pow(grow, 0.8)), tilt: 0.5, dome: 0.1, seed: 1, slots: 64, wMul: 1.15, curlP: 0.55, alpha: 0.95, t0: u.swirlStart,
    birth: k => k === 0 ? u.swirlStart : u.swirlStart + 0.6 + (k - 1) * 0.083, life: [1.9, 3.3], first: { per: 4.6, span: 3.4 * Math.PI, ro: 0.95, ri: 0.1 },
    inks: { sepia: 0.34, sang: 0.4, gold: 0.12 + 0.06 * A, ivory: 0.12 }, chalkInks: { sepia: 0.4, sang: 0.6 } };
  if (t >= u.swirlStart) vortexBack(c, t, V, apply);
  // the figure (sculpted body + per-pixel head) → sfumato
  const F = scratch('fig'), g = F.getContext('2d'); g.reset(); apply(g);
  const br = Math.sin(t * TAU / 3.6), rise = -3 * ss(u.eyesWide, u.eyesWide + 0.4, t);
  g.save(); g.translate(548, 1340); g.scale(1, 1 + 0.0035 * br); g.translate(-548, -1340 + rise * 0.4); drawSc(g, FIGW()); g.restore();
  const li = { ...LI_W, glowI: 0.1 + 0.45 * A + 0.25 * bp };
  drawHead(g, 'w', WHEAD.x + 1.2 * Math.sin(t * 0.8), WHEAD.y + 1.4 * br - 7 * ss(u.eyesWide - 0.05, u.eyesWide + 0.35, t) + rise, WHEAD.u, 0.1 * (1 - 0.5 * ss(u.eyesWide - 0.1, u.eyesWide + 0.4, t)) + 0.01 * Math.sin(t * 1.3), cam.z, exWide(t), li, 1);
  c.save(); c.filter = 'blur(1.2px)'; c.drawImage(F, 0, 0); c.filter = 'none'; c.globalAlpha = 0.7; c.drawImage(F, 0, 0); c.restore();
  if (t >= u.swirlStart) vortexFront(c, 0.3 + 0.25 * A + 0.25 * bp);
  c.save();
  c.fillStyle = radGrad(c, W / 2, H * 0.42, W * 0.25, H * 0.68, [[0, [14, 9, 5], 0], [1, [14, 9, 5], 0.18 + 0.4 * A]]); c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'screen'; const hs = CAM.toScreen(cam, 560, 560);
  c.fillStyle = radGrad(c, hs[0], hs[1], 10, 420, [[0, [255, 214, 150], 0.05 + 0.07 * bp + 0.04 * A], [1, [255, 214, 150], 0]]); c.fillRect(0, 0, W, H);
  c.restore();
  finish(c);
}

// ---------------------------------------------------------------- CLOSE: draw
let EXK = null;
function exKeys() {
  if (EXK) return EXK; const u = T3();
  EXK = {
    open: [[u.TR_START, 1.0], [u.squeeze - 0.03, 1.0], [u.squeeze + 0.1, 0], [u.slits[0], 0], [u.slits[0] + 0.25, 0.3], [u.slits[1] - 0.15, 0.3], [u.slits[1] + 0.15, 0], [u.eyesOpen - 0.02, 0], [u.eyesOpen + 0.2, 1.08], [u.eyesOpen + 1.0, 0.96]],
    squeeze: [[u.TR_START, 0], [u.squeeze - 0.03, 0], [u.squeeze + 0.1, 0.85], [u.slits[0], 0.8], [u.slits[0] + 0.25, 0.42], [u.slits[1] - 0.15, 0.45], [u.peak[0], 1], [u.peak[1], 1], [u.ease[0] + 0.6, 0.15], [u.eyesOpen - 0.02, 0.1], [u.eyesOpen + 0.1, 0]],
    knot: [[u.TR_START, 0.25], [u.squeeze, 0.3], [u.squeeze + 0.15, 0.6], [u.slits[1], 0.65], [u.peak[0], 1], [u.peak[1], 1], [u.ease[0] + 0.7, 0.12], [u.eyesOpen + 0.3, 0], [u.END, 0]],
    worry: [[u.TR_START, 0.9], [u.squeeze, 0.9], [u.squeeze + 0.15, 0.25], [u.ease[0], 0.25], [u.ease[1], 0.4], [u.eyesOpen + 0.2, 0.75], [u.fade[1] - 1, 0.3]],
    clench: [[u.TR_START, 0], [u.slits[0], 0], [u.slits[0] + 0.3, 0.35], [u.slits[1] - 0.4, 0.3], [u.peak[0], 1], [u.peak[1], 1], [u.ease[0] + 0.5, 0]],
    oh: [[u.TR_START, 0.35], [u.squeeze, 0.3], [u.squeeze + 0.12, 0], [u.eyesOpen, 0], [u.eyesOpen + 0.25, 1], [u.fade[0] + 1.4, 0.85], [u.fade[0] + 2.1, 0]],
    smile: [[u.fade[0] + 1.6, 0], [u.fade[1] - 0.5, 0.75]],
    sad: [[u.TR_START, 1], [u.peak[0], 0.6], [u.ease[1], 0.6], [u.fade[0] + 1.5, 0.6], [u.fade[1] - 0.6, 0]],
  };
  return EXK;
}
const trem = t => { const u = T3(); return ss(u.peak[0] - 0.4, u.peak[0] + 0.2, t) * (1 - ss(u.peak[1] - 0.1, u.ease[0] + 0.5, t)) * (1 + 0.6 * hitPulse(t)); };
function exClose(t) { const K = exKeys(), tr = trem(t), u = T3(); return { open: kv(K.open, t) + (t > u.slits[0] && t < u.slits[1] ? 0.04 * Math.sin(t * 9) : 0), squeeze: kv(K.squeeze, t), knot: clamp(kv(K.knot, t) + 0.1 * tr * Math.sin(t * 23)), worry: kv(K.worry, t), clench: kv(K.clench, t), oh: kv(K.oh, t), smile: kv(K.smile, t), sad: kv(K.sad, t), pitch: 0, yaw: 0.03 * Math.sin(t * 0.5) }; }
function headPoseC(t) {
  const u = T3(), tr = trem(t), br = Math.sin(t * TAU / 3.4);
  const jx = tr * (2.4 * Math.sin(t * 41) + 1.5 * Math.sin(t * 67 + 1)), jy = tr * 1.8 * Math.sin(t * 53 + 2);
  const press = 9 * ss(u.squeeze - 0.1, u.squeeze + 0.3, t) * (1 - ss(u.ease[0], u.ease[1], t)) + 5 * tr;
  const lift = -10 * ss(u.eyesOpen - 0.1, u.eyesOpen + 0.5, t);
  return { x: CHEAD.x + jx, y: CHEAD.y + press + lift + jy + 2 * br, tilt: -0.03 + 0.018 * Math.sin(t * 0.6) + tr * 0.012 * Math.sin(t * 37) + 0.05 * ss(u.fade[0] + 0.8, u.fade[1], t) };
}
// the hands: rise and clutch the head (palms on the temples, fingers over the skull), tighten and tremble at the peak,
// slide down at handsDown and rest softly on the chest
function handsC(t, hp) {
  const u = T3(), up = ss(u.handsUp[0], u.handsUp[1], t), dn = ss(u.handsDown[0], u.handsDown[1], t), tr = trem(t);
  const grip = ss(u.squeeze - 0.05, u.squeeze + 0.2, t);
  const tight = clamp(0.3 * grip + 0.6 * ss(u.slits[1], u.peak[0] + 0.3, t) * (1 - ss(u.peak[1], u.ease[0] + 0.5, t)) + 0.25 * tr) * (1 - dn);
  const e = U.ease.inOut(dn), riseE = U.ease.out(up), lift = (1 - riseE) * 1050, hands = [], dents = [];
  for (const sd of [-1, 1]) {
    const G = gripSkel(sd, hp, tight, tr, t);
    let K = dn > 0 ? lerpSkel(G, chestSkel(sd), e, [sd * Math.sin(dn * Math.PI) * 40, 0]) : G;
    if (lift > 0.5) K = lerpSkel(K, K, 0, [0, lift]);
    const onto = ss(0.85, 1, riseE) * (1 - ss(0, 0.28, dn));
    if (onto > 0.3) G.dents.forEach(d => dents.push([d[0], d[1], d[2], d[3] * onto]));
    hands.push({ sd, K, onto, clip: onto > 0.5, press: tight, elb: [lerp(540 + sd * 560, 540 + sd * 470, e), lerp(1720 + lift * 0.3, 2010, e)] });
  }
  return { hands, dents, vis: up };
}
function ringSketches(g, t, front) {
  const u = T3(); if (t < u.rings[0]) return;
  const appear = ss(u.rings[0], u.rings[0] + 1.0, t), ph = 0.45 * (t - u.rings[0]) + 0.08 * vphase(t);
  g.save(); g.lineCap = 'round';
  for (let k = 0; k < 9; k++) {
    const r = rng(300 + k), a = r() * TAU + ph * (0.75 + r() * 0.5), leave = ss(u.fade[0] + 0.1 * k, u.fade[0] + 1.7 + 0.12 * k, t);
    const depth = Math.sin(a); if ((depth >= 0) !== front) continue;
    const x = 540 + 560 * (1 + 0.5 * leave) * Math.cos(a), y = 640 + 120 * (1 + 0.6 * leave) * depth - 260 * leave * (0.5 + r() * 0.7);
    const sc = (24 + r() * 14) * (1 + 0.28 * depth) * (0.4 + 0.6 * appear) * (1 + 0.4 * leave), al = (0.5 + 0.35 * (depth * 0.5 + 0.5)) * appear * (1 - leave);
    if (al < 0.02) continue;
    const spin = t * (1.6 + r() * 2.2) * (r() < 0.5 ? 1 : -1), turns = 1.7 * (1 - 0.6 * leave);
    for (let j = 0; j < 2; j++) {
      g.beginPath(); for (let i = 0; i <= 40; i++) { const q = i / 40, ang = spin + q * turns * TAU, rad = sc * (0.25 + 0.75 * q) * (1 + 0.08 * j); g[i ? 'lineTo' : 'moveTo'](x + Math.cos(ang) * rad, y + Math.sin(ang) * rad * 0.55); }
      g.strokeStyle = rgba(j ? INK.gold : (leave > 0.3 ? INK.silver : INK.sang), al * (j ? 0.55 : 0.85)); g.lineWidth = j ? 1.2 : 2.1; g.stroke();
    }
  }
  g.restore();
}
function drawClose(c, t) {
  const u = T3(), cam = camClose(t), A = anx(t), bp = barPulse(t), rel = release(t), apply = g => CAM.apply(g, cam);
  const camBg = { x: lerp(540, cam.x, 0.4), y: lerp(960, cam.y, 0.4), z: Math.pow(cam.z, 0.4) };
  // the valley + living air
  c.save(); CAM.apply(c, camBg);
  c.drawImage(BGC(), -MG, -MG, W + 2 * MG, H + 2 * MG);
  c.globalCompositeOperation = 'screen';
  c.fillStyle = radGrad(c, 247.5, 533.3, 20, 420, [[0, [220, 230, 222], 0.12 + 0.1 * bp + 0.25 * rel], [1, [220, 230, 222], 0]]); c.fillRect(-MG, -MG, W + 2 * MG, H);
  c.globalCompositeOperation = 'source-over';
  const mistA = clamp(0.35 + 0.85 * A - 0.9 * rel);
  for (let k = 0; k < 22; k++) { const r = rng(1900 + k), y = 1000 + r() * 320 - 200 * A * r() + 120 * rel * r(), sp = 8 + r() * 14, x = ((r() * 1700 + t * sp) % 1700) - 300;
    blob(c, x, y, 260 + r() * 300, 26 + r() * 40 + 30 * A, A > 0.5 && r() < 0.6 ? '#7f8680' : '#cdd2c2', (0.1 + 0.18 * r()) * mistA); }
  c.fillStyle = `rgba(12,14,20,${0.4 * A * (1 - rel)})`; c.fillRect(-MG, -MG, W + 2 * MG, H + 2 * MG);
  c.restore();
  const burst = clamp(after(t, u.hits[2] - 0.12, 1.25) + 0.3 * ss(u.peak[0], u.peak[0] + 0.8, t) * (1 - ss(u.peak[1], u.hits[2] - 0.1, t)) + 0.35 * after(t, u.hits[1] - 0.05, 2.2));
  const V = { cx: 540, cy: 410 - 30 * rel, R: 480 * (1 - 0.25 * rel), tilt: 0.52, dome: 0.12, seed: 2, slots: 112, wMul: 1.7, curlP: 0.6 + 0.2 * A, alpha: 0.95 * (1 - 0.6 * rel), t0: u.swirlStart,
    birth: k => u.TR_START - 3.2 + k * 0.028, life: [1.6, 3.0], unwind: rel,
    slotA: k => (k < lerp(66, 112, ss(u.slits[0], u.peak[0], t)) * (1 - 0.82 * rel) ? 1 : 0),
    inks: rel > 0.01 ? { sepia: 0.3 * (1 - rel), sang: 0.36 * (1 - rel), gold: 0.12 * (1 - rel), ivory: 0.12, silver: 0.7 * rel } : { sepia: 0.3, sang: 0.4, gold: 0.12 + 0.1 * A, ivory: 0.12 },
    chalkInks: rel > 0.01 ? { sepia: 0.3, sang: 0.4, silver: 0.6 * rel } : { sepia: 0.4, sang: 0.6 } };
  c.save(); apply(c);
  c.globalCompositeOperation = 'screen'; c.fillStyle = radGrad(c, V.cx, V.cy, 40, 900, [[0, [150, 178, 186], 0.14 + 0.08 * A], [1, [150, 178, 186], 0]]); c.fillRect(-MG, -MG, W + 2 * MG, 1500); c.globalCompositeOperation = 'source-over';
  rays(c, V.cx, V.cy - V.R * V.dome * 0.4, burst, t, 1100);
  ringSketches(c, t, false);
  c.restore();
  vortexBack(c, t, V, apply);
  // the figure: torso (baked) → arms → head and hands in ONE height field → eyes/mouth kept under the fingers
  const F = scratch('fig'), g = F.getContext('2d'); g.reset(); apply(g);
  const br = Math.sin(t * TAU / 3.4);
  g.save(); g.translate(540, 1920); g.scale(1, 1 + 0.003 * br); g.translate(-540, -1920); drawSc(g, TORSO_C()); g.restore();
  const hp = headPoseC(t), ex = exClose(t), HS = handsC(t, hp), vis = HS.vis > 0.001;
  ex.dents = HS.dents;
  const li = { ...LI_C, keyI: 0.86 + 0.06 * bp, amb: 0.07 + 0.05 * rel, rimI: 0.55 + 0.5 * rel, glowI: (0.22 + 0.36 * A + 0.22 * bp + 0.8 * burst) * (1 - 0.7 * rel) };
  if (vis) { const AP = []; HS.hands.forEach((h, i) => AP.push(...armPrims(h.K.wrist, h.elb, h.sd, 41 + i)));
    drawSc(g, sculptLive('arms', -80, 860, 1240, 1160, 0.34, AP, { ...li, glowI: li.glowI * 0.3 }, { aoR: 16, aoK: 0.035 })); }
  const PR = [HP_(hp.x, hp.y, CHEAD.u, hp.tilt, ex)];
  if (vis) HS.hands.forEach(h => PR.push(...skelPrims(h.K, { onto: h.onto, clip: h.clip, zf: 250, press: h.press, thumb: 1 })));
  const HH = sculptLive('headhands', 150, 440, 780, 1520, 0.5, PR, li, { aoR: 9, aoK: 0.035, handShadow: vis ? { dx: 16, dy: 13, r: 11, k: 0.55 } : null, handMask: vis });
  drawSc(g, HH);
  const FM = scratch('fm'), fm = FM.getContext('2d'); fm.reset(); apply(fm);
  fm.save(); fm.translate(hp.x, hp.y); fm.rotate(hp.tilt); fm.scale(CHEAD.u, CHEAD.u); faceMarks(fm, ex, CHEAD.u * cam.z, 1); fm.restore();
  if (vis && HH.S.mcv) { fm.globalCompositeOperation = 'destination-out'; fm.drawImage(HH.S.mcv, HH.x, HH.y, HH.w, HH.h); fm.globalCompositeOperation = 'source-over'; }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(FM, 0, 0); g.restore();
  c.save(); c.filter = 'blur(1.4px)'; c.drawImage(F, 0, 0); c.filter = 'none'; c.globalAlpha = 0.75; c.drawImage(F, 0, 0); c.restore();
  vortexFront(c, 0.35 + 0.3 * A + 0.25 * bp + 0.5 * burst);
  c.save(); apply(c); ringSketches(c, t, true); c.restore();
  c.save();
  c.fillStyle = radGrad(c, W / 2, H * 0.45, W * 0.22, H * 0.7, [[0, [12, 8, 5], 0], [1, [12, 8, 5], 0.16 + 0.42 * A]]); c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'screen';
  c.fillStyle = radGrad(c, 540, 470, 20, 700, [[0, [255, 220, 160], 0.04 + 0.07 * bp + 0.22 * burst], [1, [255, 220, 160], 0]]); c.fillRect(0, 0, W, H);
  if (rel > 0) { c.fillStyle = `rgba(170,190,206,${0.09 * rel})`; c.fillRect(0, 0, W, H); }
  c.restore();
  finish(c);
}

SCENES['u03_renaissance'] = { draw(c, lt, t) { drawWide(c, t); } };
SCENES['u03_renaissance_close'] = { draw(c, lt, t) { drawClose(c, t); } };
})();
