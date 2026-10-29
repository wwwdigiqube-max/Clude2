// V03 «ذهنی که آروم نمی‌گیره» — REMBRANDT. A night painted by Rembrandt van Rijn.
//   SCENES['u03_rembrandt']        wide (0 → 6.32 s): an old-master bedchamber, one candle in a brass holder, crimson velvet,
//                                  rumpled white linen, a leaded window cold with moonlight; the figure hunched on the bed edge.
//   SCENES['u03_rembrandt_close']  close-up (5.87 → 17.6 s): both hands clutch the head under a golden vortex; peak; release.
// Method (as in 32_rembrandt): lit-state underpainting (cached room, a cached head study painted in strokes, per-frame
// figure in broad strokes) × a light map (umber ambient, the candle with the figure's long shadow carved out, face spots,
// the moon, the vortex's own light; half-res, multiply) → emissive paint (flame, moonstone eyes, gold-leaf / candle-smoke
// filaments, sparks, rings, dust) → light inside the silhouettes (moon reflection, the vortex on crown and knuckles) →
// highlight bloom → varnish, craquelure, canvas weave, vignette. Every frame is a pure function of t; times from window.U03.
(() => {
const P = PAINT, { clamp, lerp, rng, ss } = U, TAU = Math.PI * 2, NS = 'u03rembrandt_';
const X = () => window.U03;
const SW = () => STAGE.W, SH = () => STAGE.H;
const cached = (k, w, h, fn) => P.cached(NS + k, w, h, fn);
const scratch = k => P.scratch(NS + k);
const sized = (k, w, h) => cached('sz_' + k, w, h, () => {});

// ================= time =================
const key = (t, ks) => {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) {
    const a = ks[i - 1], b = ks[i], q = b[0] > a[0] ? (t - a[0]) / (b[0] - a[0]) : 1;
    return a[1] + (b[1] - a[1]) * q * q * (3 - 2 * q);
  }
  return ks[ks.length - 1][1];
};
const env = (t, at, att, dec) => t < at - att ? 0 : t < at ? ss(at - att, at, t) : t < at + dec ? Math.pow(1 - (t - at) / dec, 2) : 0;
const barP = t => X().bars.reduce((m, b) => Math.max(m, env(t, b, 0.04, 0.6)), 0);
const hitP = t => X().hits.reduce((m, h, i) => Math.max(m, env(t, h, 0.06, i === 2 ? 1.7 : 1.0) * (i === 2 ? 1 : 0.62)), 0);

// emotion arc: anx = anxiety (light tightens, flame nervous), sw = how bright/fast the thought-vortex is
function arcOf(t) {
  const x = X(), [s0, s1] = x.slits, [p0, p1] = x.peak, [, e1] = x.ease, [, h1] = x.handsDown, [f0, f1] = x.fade;
  const anx = key(t, [[0, 0.1], [x.swirlStart, 0.14], [x.eyesWide - 0.3, 0.38], [x.eyesWide + 0.3, 0.58], [x.CUT, 0.64], [x.handsUp[1], 0.74], [s1, 0.84], [p0, 1], [p1, 1], [e1, 0.5], [h1, 0.36], [f0 + 1.2, 0.18], [f1, 0.06]]);
  const sw = key(t, [[x.swirlStart, 0], [x.swirlStart + 0.8, 0.22], [x.eyesWide, 0.52], [x.CUT, 0.7], [s0, 0.76], [s1, 0.86], [p0, 1], [p1, 1], [e1, 0.8], [f0, 0.72], [f1, 0.16]]);
  return { anx, sw, bar: barP(t), hit: hitP(t), s0, s1, p0, p1 };
}
function faceOf(t) {
  const x = X(), [s0, s1] = x.slits, [p0, p1] = x.peak, [e0, e1] = x.ease, eo = x.eyesOpen;
  const open = key(t, [[0, 0.5], [x.eyesWide - 0.16, 0.52], [x.eyesWide + 0.12, 1.22], [x.squeeze - 0.09, 1.2], [x.squeeze + 0.05, 0], [s0 - 0.05, 0], [s0 + 0.3, 0.34], [s1 - 0.2, 0.3], [s1 + 0.2, 0], [eo - 0.1, 0], [eo + 0.16, 1.28], [eo + 1.4, 1.12]]);
  const blink = Math.max(env(t, 1.95, 0.08, 0.2), env(t, 3.35, 0.08, 0.22), env(t, 16.15, 0.07, 0.2));
  const squeeze = key(t, [[x.squeeze - 0.06, 0], [x.squeeze + 0.07, 1], [s0, 0.8], [s0 + 0.3, 0.3], [s1 - 0.15, 0.35], [p0 - 0.1, 0.95], [p0 + 0.2, 1], [p1, 1], [e0 + 0.6, 0.3], [e1, 0.18], [eo, 0]]);
  const knot = key(t, [[x.squeeze - 0.1, 0], [x.squeeze + 0.1, 0.7], [s0 + 0.3, 0.5], [s1, 0.62], [p0, 1], [p1, 1], [e0 + 0.7, 0.3], [e1, 0.18], [eo, 0]]);
  const worry = key(t, [[0, 0.25], [x.eyesWide - 0.1, 0.28], [x.eyesWide + 0.2, 0.8], [x.squeeze, 0.55], [s0 + 0.3, 0.75], [p0, 0.35], [p1, 0.4], [e0 + 0.5, 0.7], [eo + 0.3, 0.85], [x.END, 0.6]]);
  const teeth = key(t, [[s0, 0], [s0 + 0.4, 0.3], [s1, 0.38], [p0, 1], [p1, 1], [e0 + 0.5, 0]]);
  const mouthO = key(t, [[x.eyesWide - 0.05, 0], [x.eyesWide + 0.25, 0.42], [x.CUT, 0.38], [x.squeeze - 0.05, 0.3], [x.squeeze + 0.05, 0], [eo - 0.05, 0], [eo + 0.2, 0.72], [eo + 1.6, 0.42], [x.END, 0.36]]);
  const tremble = key(t, [[s1 - 0.4, 0], [p0, 1], [p1, 1], [e0 + 0.6, 0]]);
  return { open: open * (1 - blink), squeeze, knot, worry, teeth, mouthO, tremble };
}
// the candle: nervous with anxiety, leaning, and a flare on the music hits
function candleOf(t, A) {
  const calm = 0.05 * P.noise(t * 2.1, 1) + 0.03 * P.noise(t * 5.3, 4);
  const nerv = A.anx * (0.13 * P.noise(t * 7.3, 2) + 0.09 * P.noise(t * 14.1, 8));
  const fl = calm + nerv;
  const lean = A.anx * (0.32 + 0.22 * P.noise(t * 1.2, 6)) + 0.05 * P.noise(t * 3.1, 9);
  const I = (1 + 1.4 * fl) * (1 - 0.3 * A.anx) * (1 + 0.07 * A.bar) + 0.22 * A.hit;
  return { fl, lean, I, size: 1 - 0.36 * A.anx };
}

// ================= helpers =================
const dab = (g, x, y, r, rgb, a) => { if (a <= 0 || r <= 0) return; const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, `rgba(${rgb},${a})`); rg.addColorStop(0.5, `rgba(${rgb},${a * 0.5})`); rg.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = rg; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
const line = (g, pts, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); };
const quad = (g, a, b, c2, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(b[0], b[1], c2[0], c2[1]); g.stroke(); };
const lgrad = (g, x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };
const rgrad = (g, x0, y0, r0, x1, y1, r1, stops) => { const gr = g.createRadialGradient(x0, y0, r0, x1, y1, r1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };
const camM = cam => new DOMMatrix().translate(SW() / 2, SH() / 2).scale(cam.z).translate(-cam.x, -cam.y);
const tp = (m, x, y) => { const p = m.transformPoint(new DOMPoint(x, y)); return [p.x, p.y]; };
const brushOver = (cv, opt) => { const g = cv.getContext('2d'); g.save(); g.globalCompositeOperation = 'source-atop'; P.strokes(g, cv, { t: 0, boil: 0, outline: 0, alphaMask: true, ...opt }); g.restore(); };
const g2 = (u, v, x, y, sx, sy) => Math.exp(-((u - x) ** 2) / (2 * sx * sx) - ((v - y) ** 2) / (2 * sy * sy));
// palettes: value 0..1 → colour (Rembrandt flesh has an olive half-tone between warm light and red-brown shadow)
const FLESH = [[0, [32, 17, 8]], [0.14, [56, 30, 14]], [0.3, [100, 56, 28]], [0.42, [124, 100, 70]], [0.53, [164, 114, 70]], [0.66, [210, 158, 104]], [0.8, [234, 194, 138]], [0.92, [247, 220, 172]], [1, [253, 236, 202]]];
const CLOTH = [[0, [12, 7, 3]], [0.25, [28, 17, 9]], [0.5, [52, 34, 19]], [0.72, [92, 63, 38]], [0.88, [136, 97, 60]], [1, [172, 128, 82]]];
const LINEN = [[0, [52, 44, 34]], [0.35, [126, 112, 90]], [0.65, [204, 190, 164]], [0.85, [240, 230, 208]], [1, [254, 250, 238]]];
const ramp = (st, s) => { s = clamp(s); for (let i = 1; i < st.length; i++) if (s <= st[i][0]) { const [a, ca] = st[i - 1], [b, cb] = st[i], q = (s - a) / (b - a); return [lerp(ca[0], cb[0], q), lerp(ca[1], cb[1], q), lerp(ca[2], cb[2], q)]; } return st[st.length - 1][1]; };
const rgba = (c, a = 1, j = 0) => `rgba(${c[0] + j | 0},${c[1] + j | 0},${c[2] + j | 0},${a})`;
// broad brush strokes inside a path; shadeAt(x,y) → 0..1 picks from a palette; seeded → the same strokes every frame
function strokesIn(g, path, box, seed, n, pal, shadeAt, angAt, sz = 1, alpha = 1, jit = 0.14, angJ = 0.4) {
  const r = rng(seed), [x0, y0, x1, y1] = box; g.save(); g.clip(path); g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, r()), y = lerp(y0, y1, r()), s = clamp(shadeAt(x, y) + (r() - 0.5) * 2 * jit), c = ramp(pal, s);
    const a = angAt(x, y) + (r() - 0.5) * angJ, L = (24 + r() * 46) * sz, w = (7 + r() * 13) * sz, bend = (r() - 0.5) * L * 0.35, ax = Math.cos(a) * L / 2, ay = Math.sin(a) * L / 2;
    g.strokeStyle = rgba(c, (0.4 + r() * 0.45) * alpha, (r() - 0.5) * 10); g.lineWidth = w;
    g.beginPath(); g.moveTo(x - ax, y - ay); g.quadraticCurveTo(x - Math.sin(a) * bend, y + Math.cos(a) * bend, x + ax, y + ay); g.stroke();
  }
  g.restore();
}
// a thick, buttery stroke of light paint (soft shadow under it, the body, a lighter ridge, bristle grooves) — pixel units
function thick(c, pts, w, col, a = 1) {
  if (a <= 0.02 || w < 0.6) return;
  const D = KIT.resample(KIT.densify(pts, 6), Math.max(1.2, w * 0.22)), n = D.length; if (n < 3) return;
  const prof = q => Math.pow(Math.sin(Math.PI * clamp(q * 1.06)), 0.5) * (0.88 + 0.12 * Math.sin(q * 8 + w));
  const off = (dx, dy) => D.map(p => [p[0] + dx, p[1] + dy]);
  c.save(); c.globalAlpha = clamp(a);
  c.fillStyle = 'rgba(70,36,14,0.22)'; c.fill(KIT.ribbon(off(w * 0.14, w * 0.2), q => w * prof(q)));
  c.fillStyle = col; c.fill(KIT.ribbon(D, q => w * prof(q)));
  c.fillStyle = 'rgba(255,248,230,0.3)'; c.fill(KIT.ribbon(off(-w * 0.1, -w * 0.15), q => w * 0.36 * prof(q)));
  const r = rng((pts[0][0] * 7 + pts[0][1] * 13) | 0); c.lineCap = 'round';
  for (let k = 0; k < 3; k++) {
    const o = (r() - 0.5) * w * 0.55; c.strokeStyle = `rgba(150,100,56,${0.14 + r() * 0.1})`; c.lineWidth = Math.max(0.5, w * 0.06); c.beginPath();
    D.forEach((p, i) => { const A = D[Math.max(0, i - 1)], B = D[Math.min(n - 1, i + 1)], dx = B[0] - A[0], dy = B[1] - A[1], d = Math.hypot(dx, dy) || 1, xx = p[0] - dy / d * o, yy = p[1] + dx / d * o; i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); });
    c.stroke();
  }
  c.restore();
}

// ================= surface: varnish, craquelure, weave, vignette (fixed to the frame: the canvas we look at) =================
const surface = () => cached('surface', SW(), SH(), (g, cv) => {
  const W = cv.width, H = cv.height, m = P.canvas(W >> 3, H >> 3), mg = m.getContext('2d'), mi = mg.createImageData(m.width, m.height);
  for (let y = 0; y < m.height; y++) for (let x = 0; x < m.width; x++) { const v = 128 + 30 * P.fbm(x * 0.04 + 3, y * 0.04, 4), i = (y * m.width + x) * 4; mi.data[i] = mi.data[i + 1] = mi.data[i + 2] = v; mi.data[i + 3] = 255; }
  mg.putImageData(mi, 0, 0); g.drawImage(m, 0, 0, W, H);
  const img = g.getImageData(0, 0, W, H), d = img.data, r = rng(4242);
  for (let y = 0; y < H; y++) { const wy = Math.sin(y * 1.7); for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, wv = Math.sin(x * 1.7 + 1.2 * Math.sin(y * 0.03)) * wy, v = d[i] + wv * 5 + (r() - 0.5) * 14; d[i] = d[i + 1] = d[i + 2] = v; } }
  g.putImageData(img, 0, 0);
});
const mulLayer = () => cached('mul', SW(), SH(), (g, cv) => {
  const W = cv.width, H = cv.height;
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, H * 0.46); g.scale(1, 1.62);
  g.fillStyle = rgrad(g, 0, 0, W * 0.28, 0, 0, W * 0.78, [[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(150,118,84,0.3)'], [1, 'rgba(30,18,10,0.92)']]);
  g.fillRect(-W, -H, 2 * W, 2 * H); g.restore();
  g.globalAlpha = 0.3; g.drawImage(P.craquelure(NS + 'crack', 0.55), 0, 0); g.globalAlpha = 1;
});
const clothTex = () => cached('cloth', SW(), SH(), (g, cv) => {
  const W = cv.width, H = cv.height; g.fillStyle = '#808080'; g.fillRect(0, 0, W, H); g.lineCap = 'round';
  const r = rng(91);
  for (let i = 0; i < 6500; i++) { const x = r() * W, y = r() * H, a = Math.PI / 2 + 0.5 * P.noise(x * 0.004, y * 0.003) + (r() - 0.5) * 0.35, L = 26 + r() * 70, c = 128 + ((r() - 0.5) * 90 | 0);
    g.strokeStyle = `rgba(${c},${c},${c},${0.15 + r() * 0.3})`; g.lineWidth = 3 + r() * 9; g.beginPath(); g.moveTo(x - Math.cos(a) * L / 2, y - Math.sin(a) * L / 2); g.lineTo(x + Math.cos(a) * L / 2, y + Math.sin(a) * L / 2); g.stroke(); }
});

// ================= the room (wide) — lit-state underpainting, cached =================
const FLAME_W = [126, 752];          // candle flame base (world, wide)
const SEAT = [566, 1212];            // where he sits on the mattress (wide)
function velvet(g, x0f, x1f, y0, y1, folds, seed, litFrom, dark = 1) {
  // smooth edges: clip to a curve through the sampled outline, paint the folds a little past it
  const L = [], R = []; for (let y = y0; y <= y1 + 0.1; y += 30) { L.push([x0f(y), y]); R.push([x1f(y), y]); }
  const clip = RIG.smooth([...R, [x1f(y1), y1], [x0f(y1), y1], ...L.reverse()], true);
  const dst = g, T = P.canvas(g.canvas.width, g.canvas.height); g = T.getContext('2d');   // paint unclipped (fast), mask once
  for (let y = y0; y < y1; y += 4) {
    const xa = x0f(y) - 6, xb = x1f(y) + 6, w = xb - xa; if (w <= 2) continue;
    for (let x = xa; x < xb; x += 3) {
      const u = (x - xa) / w, f = u * folds + 0.45 * Math.sin(u * 7.3 + seed) + 0.32 * P.noise(y * 0.0032 + seed, u * 2.2);
      const c = Math.cos(f * TAU), s = Math.sin(f * TAU) * litFrom, lit = clamp(0.48 + 0.42 * c + 0.22 * s) * dark, sh = Math.pow(lit, 5);
      g.fillStyle = `rgb(${lerp(26, 150, lit) + 50 * sh | 0},${lerp(5, 30, lit * lit) + 26 * sh | 0},${lerp(4, 20, lit * lit) + 18 * sh | 0})`; g.fillRect(x, y, 3.6, 4.6);
    }
  }
  g.globalCompositeOperation = 'destination-in'; g.fill(clip);
  dst.drawImage(T, 0, 0);
}
function brassStick(g, cx, yBase, yTop) {
  const prof = [[0, 54], [-6, 56], [-14, 48], [-20, 28], [-26, 15], [-40, 12], [-52, 20], [-60, 12], [-96, 10], [-104, 16], [-112, 10], [-140, 9], [-146, 38], [-152, 40], [-156, 13], [-170, 14]];
  const k = (yBase - yTop) / 170, pts = [];
  prof.forEach(([y, w]) => pts.push([cx - w, yBase + y * k])); [...prof].reverse().forEach(([y, w]) => pts.push([cx + w, yBase + y * k]));
  g.fillStyle = lgrad(g, cx - 56, 0, cx + 56, 0, [[0, '#6a4614'], [0.22, '#e8c070'], [0.34, '#fff0b8'], [0.46, '#c89632'], [0.75, '#7a5418'], [1, '#3a2408']]);
  g.fill(U.poly(pts));
  [[0, 54, 11], [-146, 40, 8], [-52, 20, 5], [-104, 16, 4]].forEach(([y, w, h]) => {
    g.fillStyle = lgrad(g, cx - w, 0, cx + w, 0, [[0, '#8a6020'], [0.4, '#fff4c8'], [0.7, '#d8a848'], [1, '#6a4612']]);
    g.beginPath(); g.ellipse(cx, yBase + y * k - h * 0.4, w, h, 0, 0, TAU); g.fill();
  });
}
const roomWide = () => cached('roomW', SW(), SH(), (g, cv) => {
  const W = cv.width, H = cv.height, r = rng(1606);
  // ---- wall + floor ----
  const A = P.canvas(W, H), a = A.getContext('2d');
  a.fillStyle = lgrad(a, 0, 0, W * 0.5, H * 0.75, [[0, '#9c7c52'], [0.5, '#8c6e48'], [1, '#6c5840']]); a.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) { const x = r() * W, y = r() * 1450, rr = 70 + r() * 240; dab(a, x, y, rr, r() < 0.55 ? '70,46,24' : '186,154,108', r() < 0.55 ? 0.1 + r() * 0.16 : 0.07 + r() * 0.12); }
  a.fillStyle = lgrad(a, 0, 1490, 0, H, [[0, '#5a3e24'], [1, '#86603a']]); a.fillRect(0, 1490, W, H - 1490);
  a.strokeStyle = 'rgba(30,18,8,0.55)'; a.lineWidth = 3;
  for (let k = -14; k <= 14; k++) { a.beginPath(); a.moveTo(540 + k * 60, 1490); a.lineTo(540 + k * 190, H + 40); a.stroke(); }
  g.drawImage(A, 0, 0);
  P.strokes(g, A, { cell: 15, len: 48, width: 13, seed: 3, t: 0, boil: 0, outline: 0, jitterCol: 12,
    angle: (x, y) => y > 1490 ? Math.atan2(y - 1230, x - 540) + 0.08 * P.noise(x * 0.01, y * 0.01) : -1.0 + 1.7 * P.noise(x * 0.0025, y * 0.0025) });
  { const T = P.canvas(W, H), tg = T.getContext('2d'); tg.filter = 'blur(2.4px)'; tg.drawImage(cv, 0, 0); g.globalAlpha = 0.7; g.drawImage(T, 0, 0); g.globalAlpha = 1; }

  // ---- leaded window, cold with moonlight (upper right) ----
  const wx0 = 752, wy0 = 250, wx1 = 978, wy1 = 596;
  g.fillStyle = '#4a3c2e'; g.beginPath(); g.moveTo(wx0 - 28, wy0 - 20); g.lineTo(wx0, wy0); g.lineTo(wx0, wy1); g.lineTo(wx0 - 28, wy1 + 24); g.closePath(); g.fill();
  g.save(); g.beginPath(); g.rect(wx0, wy0, wx1 - wx0, wy1 - wy0); g.clip();
  g.fillStyle = rgrad(g, wx0 + 60, wy0 + 50, 10, wx0 + 100, wy0 + 150, 380, [[0, '#b8c8d6'], [0.3, '#7a8ea2'], [0.65, '#46586a'], [1, '#222c38']]); g.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
  for (let i = 0; i < 46; i++) { const x = wx0 + r() * (wx1 - wx0), y = wy0 + r() * (wy1 - wy0); dab(g, x, y, 8 + r() * 16, r() < 0.5 ? '200,214,226' : '30,40,52', 0.15 + r() * 0.2); }
  g.strokeStyle = '#14100a'; g.lineWidth = 3;
  for (let k = -10; k < 16; k++) { g.beginPath(); g.moveTo(wx0 + k * 32, wy0); g.lineTo(wx0 + k * 32 + 230, wy1); g.stroke(); g.beginPath(); g.moveTo(wx0 + k * 32, wy1); g.lineTo(wx0 + k * 32 + 230, wy0); g.stroke(); }
  g.restore();
  g.fillStyle = '#1c140c'; g.fillRect(wx0, wy0, wx1 - wx0, 9); g.fillRect(wx0, wy1 - 9, wx1 - wx0, 9); g.fillRect(wx0, wy0, 9, wy1 - wy0); g.fillRect(wx1 - 9, wy0, 9, wy1 - wy0);
  g.fillRect((wx0 + wx1) / 2 - 6, wy0, 12, wy1 - wy0); g.fillRect(wx0, 410, wx1 - wx0, 11);
  g.fillStyle = '#7a746a'; g.fillRect(wx0 - 32, wy1, wx1 - wx0 + 58, 13); g.fillStyle = '#342a20'; g.fillRect(wx0 - 32, wy1 + 13, wx1 - wx0 + 58, 9);

  // ---- crimson velvet curtain of the bed's canopy (left), gathered by a gold tie-back ----
  const C = P.canvas(W, H), cg = C.getContext('2d'), gy = 990;
  velvet(cg, () => -40, y => y < gy ? lerp(300, 214, ss(0, gy, y)) : lerp(214, 292, ss(gy, 1560, y)), -10, 1560, 3.6, 33, 1);
  cg.fillStyle = '#c8962e'; cg.beginPath(); cg.ellipse(214, gy, 26, 12, -0.2, 0, TAU); cg.fill(); cg.fillStyle = '#fff0b0'; cg.beginPath(); cg.ellipse(208, gy - 4, 11, 4, -0.2, 0, TAU); cg.fill();
  cg.strokeStyle = '#a8782a'; cg.lineWidth = 6; cg.beginPath(); cg.moveTo(214, gy + 8); cg.quadraticCurveTo(224, gy + 60, 210, gy + 110); cg.stroke();
  brushOver(C, { cell: 6, len: 26, width: 5, seed: 7, jitterCol: 8, angle: (x, y) => Math.PI / 2 + 0.25 * (x - 120) / 200 * (y < gy ? -1 : 1) });
  g.drawImage(C, 0, 0);

  // ---- the bed: post, a mattress under rumpled linen pressed down where he sits, pillow, crimson drape down the side ----
  const B = P.canvas(W, H), b = B.getContext('2d');
  b.fillStyle = '#3a2412'; b.fillRect(196, 820, 70, 470);
  b.fillStyle = lgrad(b, 236, 0, 280, 0, [[0, '#2e1c0e'], [0.35, '#7a5030'], [1, '#1e1208']]); b.fillRect(238, -10, 40, 1300);
  [300, 760, 1150].forEach(y => { b.fillStyle = lgrad(b, 228, 0, 288, 0, [[0, '#2e1c0e'], [0.35, '#8a5c34'], [1, '#1a1008']]); b.beginPath(); b.ellipse(258, y, 30, 46, 0, 0, TAU); b.fill(); });
  velvet(b, () => 150, () => W + 20, 1290, 1494, 4.5, 21, 1, 0.85);
  b.fillStyle = '#b8862e'; b.fillRect(150, 1468, W, 8); b.fillStyle = 'rgba(240,200,110,0.6)'; for (let x = 152; x < W; x += 8) b.fillRect(x, 1476, 2.2, 14 + 3 * Math.sin(x));
  b.fillStyle = lgrad(b, 0, 1490, 0, 1540, [[0, 'rgba(10,6,3,0.92)'], [1, 'rgba(10,6,3,0)']]); b.fillRect(150, 1490, W, 50);
  const top = new Path2D(); top.moveTo(150, 1052); top.lineTo(W + 20, 1052); top.lineTo(W + 20, 1264); top.lineTo(150, 1264); top.closePath();
  b.fillStyle = lgrad(b, 150, 1060, 900, 1250, [[0, '#f6eedc'], [0.45, '#e2d6bc'], [1, '#b4a68a']]); b.fill(top);
  // rumpled linen: folds wandering across, and creases radiating from where he sits (the mattress gives under him)
  strokesIn(b, top, [150, 1046, W, 1270], 41, 240, LINEN, (x, y) => 0.78 - 0.25 * (x - 150) / 900 + 0.18 * Math.sin(x * 0.03 + y * 0.05), (x, y) => -0.2 + 0.4 * P.noise(x * 0.004, y * 0.01), 1.1);
  b.save(); b.clip(top); b.lineCap = 'round';
  for (let i = 0; i < 22; i++) { const an = Math.PI + (i / 21) * Math.PI * 1.0 - 0.0, L = 90 + r() * 120, x0 = SEAT[0] + Math.cos(an) * 110, y0 = SEAT[1] + Math.sin(an) * 30;
    const x1 = SEAT[0] + Math.cos(an) * (110 + L), y1 = SEAT[1] + Math.sin(an) * (30 + L * 0.28);
    quad(b, [x0, y0], [(x0 + x1) / 2 + (r() - 0.5) * 20, (y0 + y1) / 2 + 6], [x1, y1], 9, 'rgba(96,78,54,0.42)'); quad(b, [x0 - 3, y0 - 6], [(x0 + x1) / 2, (y0 + y1) / 2 - 1], [x1 - 3, y1 - 6], 5, 'rgba(255,250,236,0.45)'); }
  b.restore();
  const hang = new Path2D(); hang.moveTo(150, 1258); for (let x = 150; x <= W + 20; x += 20) hang.lineTo(x, 1258 + 4 * Math.sin(x * 0.05)); for (let x = W + 20; x >= 150; x -= 18) hang.lineTo(x, 1306 + 8 * Math.sin(x * 0.035) + 3 * Math.sin(x * 0.11)); hang.closePath();
  b.fillStyle = lgrad(b, 0, 1258, 0, 1330, [[0, '#ece2ca'], [1, '#9a8a6a']]); b.fill(hang);
  strokesIn(b, hang, [150, 1250, W, 1340], 43, 90, LINEN, (x, y) => 0.75 - (y - 1258) / 120 + 0.2 * Math.sin(x * 0.11), () => Math.PI / 2, 0.8);
  const cov = new Path2D(); cov.moveTo(800, 1052); cov.lineTo(W + 20, 1052); cov.lineTo(W + 20, 1270); cov.lineTo(780, 1270); cov.bezierCurveTo(820, 1210, 760, 1130, 800, 1052); cov.closePath();
  b.save(); b.clip(cov); velvet(b, () => 760, () => W + 20, 1050, 1272, 2.2, 27, 1, 0.65); b.restore();
  const pil = RIG.smooth([[262, 1058], [320, 1034], [400, 1028], [474, 1042], [508, 1078], [496, 1132], [432, 1154], [340, 1158], [276, 1146], [250, 1104]], true);
  b.fillStyle = rgrad(b, 320, 1046, 10, 380, 1100, 220, [[0, '#fffaf0'], [0.45, '#eadcc2'], [1, '#9c8a6c']]); b.fill(pil);
  strokesIn(b, pil, [250, 1026, 510, 1160], 47, 60, LINEN, (x, y) => 0.95 - Math.hypot(x - 330, y - 1060) / 260, (x, y) => 0.15 * Math.sin(x * 0.02), 0.7);
  g.drawImage(B, 0, 0);
  // thick paint where the candle strikes the linen and the post
  [[[296, 1060], [350, 1046], [404, 1044]], [[318, 1092], [372, 1084]], [[214, 1120], [262, 1112]], [[176, 1268], [232, 1272]], [[300, 1166], [360, 1160], [410, 1170]]].forEach(p => thick(g, p, 8, '#fbf3e2', 0.7));

  // ---- small oak table with the brass candlestick ----
  const T = P.canvas(W, H), tg = T.getContext('2d');
  tg.fillStyle = lgrad(tg, 0, 1000, 240, 1036, [[0, '#8a5c32'], [1, '#4a2c16']]); tg.beginPath(); tg.moveTo(-20, 1004); tg.lineTo(232, 1004); tg.lineTo(244, 1036); tg.lineTo(-30, 1036); tg.closePath(); tg.fill();
  tg.fillStyle = '#c8945a'; tg.fillRect(-30, 1034, 276, 6);
  tg.fillStyle = lgrad(tg, 0, 1040, 0, 1116, [[0, '#4a2c16'], [1, '#2a180a']]); tg.fillRect(-26, 1040, 268, 76);
  tg.strokeStyle = 'rgba(150,100,55,0.5)'; tg.lineWidth = 3; tg.strokeRect(10, 1052, 200, 48); tg.fillStyle = '#c8962e'; tg.beginPath(); tg.arc(110, 1076, 6, 0, TAU); tg.fill();
  [[-4, 1116], [212, 1116]].forEach(([x, y]) => { tg.fillStyle = lgrad(tg, x - 14, 0, x + 14, 0, [[0, '#6a4222'], [0.4, '#9a6a3a'], [1, '#24140a']]); tg.fillRect(x - 13, y, 26, 440);
    for (let k = 0; k < 3; k++) { tg.beginPath(); tg.ellipse(x, y + 60 + k * 130, 18, 9, 0, 0, TAU); tg.fill(); } });
  brassStick(tg, FLAME_W[0], 1014, 862);
  const cx = FLAME_W[0], ct = FLAME_W[1] + 10;
  tg.fillStyle = lgrad(tg, cx - 12, 0, cx + 12, 0, [[0, '#d8c8a2'], [0.35, '#fff6e2'], [1, '#a8946e']]); tg.fillRect(cx - 12, ct, 24, 862 - ct);
  tg.fillStyle = 'rgba(255,250,232,0.95)'; tg.beginPath(); tg.ellipse(cx, ct, 12, 4, 0, 0, TAU); tg.fill();
  tg.fillStyle = '#efe0c0'; [[cx - 12, ct + 8, 26], [cx + 9, ct + 4, 40], [cx - 4, ct + 2, 14]].forEach(([x, y, L]) => { tg.beginPath(); tg.ellipse(x, y + L / 2, 3.2, L / 2, 0, 0, TAU); tg.fill(); });
  tg.strokeStyle = '#1a1008'; tg.lineWidth = 2.4; tg.beginPath(); tg.moveTo(cx, ct); tg.quadraticCurveTo(cx + 2, ct - 8, cx + 1, ct - 13); tg.stroke();
  g.drawImage(T, 0, 0);
  thick(g, [[cx - 8, ct + 18], [cx - 7, ct + 74]], 5, '#fff6e0', 0.85); thick(g, [[cx - 44, 1012], [cx - 12, 1005]], 5, '#fff0b8', 0.8);
});

// ================= the room (close-up): dark wall, a sliver of velvet, the window's cold breath =================
const roomClose = () => cached('roomC', SW(), SH(), (g, cv) => {
  const W = cv.width, H = cv.height, r = rng(2606);
  const A = P.canvas(W, H), a = A.getContext('2d');
  a.fillStyle = lgrad(a, 0, 0, W, H * 0.4, [[0, '#a07e52'], [0.55, '#86694a'], [1, '#5e5244']]); a.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { const x = r() * W, y = r() * H, rr = 90 + r() * 300; dab(a, x, y, rr, r() < 0.55 ? '70,46,24' : '190,158,112', r() < 0.55 ? 0.1 + r() * 0.16 : 0.07 + r() * 0.12); }
  g.drawImage(A, 0, 0);
  P.strokes(g, A, { cell: 18, len: 60, width: 16, seed: 13, t: 0, boil: 0, outline: 0, jitterCol: 12, angle: (x, y) => -0.9 + 1.8 * P.noise(x * 0.002, y * 0.002 + 5) });
  { const T = P.canvas(W, H), tg = T.getContext('2d'); tg.filter = 'blur(3px)'; tg.drawImage(cv, 0, 0); g.globalAlpha = 0.7; g.drawImage(T, 0, 0); g.globalAlpha = 1; }
  const C = P.canvas(W, H), cg = C.getContext('2d');
  velvet(cg, () => -30, y => 92 + 24 * Math.sin(y * 0.004 + 1), -10, H + 10, 1.6, 44, 1);
  brushOver(C, { cell: 7, len: 30, width: 6, seed: 9, jitterCol: 8, angle: () => Math.PI / 2 });
  g.drawImage(C, 0, 0);
  g.save(); g.beginPath(); g.rect(880, 130, 220, 500); g.clip();
  g.fillStyle = rgrad(g, 920, 200, 10, 980, 320, 440, [[0, '#a8b6c4'], [0.35, '#66788c'], [1, '#222a34']]); g.fillRect(880, 130, 220, 500);
  g.strokeStyle = '#14100a'; g.lineWidth = 5; for (let k = -8; k < 14; k++) { g.beginPath(); g.moveTo(880 + k * 58, 130); g.lineTo(880 + k * 58 + 320, 630); g.stroke(); g.beginPath(); g.moveTo(880 + k * 58, 630); g.lineTo(880 + k * 58 + 320, 130); g.stroke(); }
  g.restore();
  g.fillStyle = '#1c140c'; g.fillRect(866, 120, 22, 530); g.fillRect(866, 120, 240, 18); g.fillRect(866, 622, 240, 22);
});

// ================= the head: an egg painted like a Rembrandt head study (cached), key light from the left =================
const EGG = (() => { const o = []; for (let i = 0; i < 40; i++) { const a = i / 40 * TAU - Math.PI / 2, s = Math.sin(a), c = Math.cos(a); o.push([0.5 * c * (1 - 0.12 * s - (s > 0 ? 0.1 * s * s : 0)), 0.6 * s]); } return o; })();
let EGGP = null; const eggPath = () => EGGP || (EGGP = RIG.smooth(EGG, true));
const headM = (cam, h) => camM(cam).translate(h.x, h.y).rotate(h.rot * 180 / Math.PI).scale(h.w);
const EYE_X = 0.215, EYE_Y = -0.02;
const nrm3 = v => { const n = Math.hypot(...v); return v.map(x => x / n); };
const LC = nrm3([-0.55, -0.4, 0.74]);   // the candle: left, a little above and in front
const LT = nrm3([0.04, -0.84, 0.54]);   // the thought-vortex: above
// light on the egg as an ellipsoid (wrap lighting), plus the planes of a face; top = lit from above (symmetric planes)
function headShade(u, v, L, top) {
  const a = 0.5, b = 0.6, c = 0.46, q = Math.max(0.002, 1 - (u / a) ** 2 - (v / b) ** 2);
  const z = c * Math.sqrt(q); let nx = u / (a * a), ny = v / (b * b), nz = z / (c * c); const nn = Math.hypot(nx, ny, nz); nx /= nn; ny /= nn; nz /= nn;
  let s = clamp((nx * L[0] + ny * L[1] + nz * L[2] + 0.22) / 1.22);
  const lw = top ? 1 : 1, rw = top ? 1 : 0.45;           // left / right weights of the planes (the candle favours the left)
  s += 0.12 * lw * g2(u, v, -0.23, -0.16, 0.12, 0.032) + 0.12 * rw * g2(u, v, 0.23, -0.16, 0.12, 0.032);     // brow ridge
  s -= (top ? 0.3 : 0.2) * (g2(u, v, -0.215, -0.01, 0.12, 0.075) + g2(u, v, 0.215, -0.01, 0.12, 0.075));    // sockets
  s += 0.12 * lw * g2(u, v, -0.27, 0.12, 0.09, 0.05) + 0.12 * rw * g2(u, v, 0.27, 0.12, 0.09, 0.05);         // cheekbones
  s -= 0.08 * (g2(u, v, -0.43, -0.18, 0.05, 0.12) + g2(u, v, 0.43, -0.18, 0.05, 0.12));                      // temples
  s += 0.12 * g2(u, v, -0.02, 0.08, 0.02, 0.12) - (top ? 0.03 : 0.07) * g2(u, v, 0.042, 0.1, 0.03, 0.12);   // nose bridge
  s += 0.14 * g2(u, v, -0.008, 0.195, 0.026, 0.02) - 0.22 * g2(u, v, 0.012, 0.255, 0.05, 0.016);             // nose tip, the shadow under it
  s -= 0.12 * g2(u, v, 0, 0.42, 0.08, 0.022); s += 0.07 * g2(u, v, -0.03, 0.49, 0.08, 0.04);                  // under the lip, chin
  if (top) s -= 0.25 * ss(0.3, 0.6, v);                                                                         // the vortex leaves the jaw in shadow
  return clamp(s);
}
const HP = 640;   // head painting: px per head width
// mode 0: the candle alone; mode 1: candle + the vortex's warm gold from above (crossfaded per frame by its brightness)
const headPaint = mode => cached('headPaint' + mode, HP, HP * 1.2, (g) => {
  const ox = HP / 2, oy = HP * 0.6, egg = new Path2D(); egg.addPath(eggPath(), new DOMMatrix().translate(ox, oy).scale(HP));
  const val = (u, v) => { const sc = headShade(u, v, LC, false); if (!mode) return [sc, 0]; const st = headShade(u, v, LT, true); return [Math.max(sc, 0.18 + 0.85 * st), st]; };
  const col = (s, st) => { const c = ramp(FLESH, s); return mode ? [lerp(c[0], 255, 0.1 * st), lerp(c[1], 214, 0.14 * st), lerp(c[2], 140, 0.2 * st)] : c; };
  const sm = P.canvas(80, 96), smg = sm.getContext('2d'), im = smg.createImageData(80, 96);
  for (let y = 0; y < 96; y++) for (let x = 0; x < 80; x++) { const u = (x + 0.5) / 80 - 0.5, v = ((y + 0.5) / 96 - 0.5) * 1.2, [s, st] = val(u, v), c = col(s, st), i = (y * 80 + x) * 4; im.data[i] = c[0]; im.data[i + 1] = c[1]; im.data[i + 2] = c[2]; im.data[i + 3] = 255; }
  smg.putImageData(im, 0, 0);
  g.save(); g.clip(egg); g.imageSmoothingEnabled = true; g.drawImage(sm, 0, 0, HP, HP * 1.2);
  // the flesh built up in opaque filbert strokes that turn around the form, coloured by the local light
  const r = rng(616);
  for (let pass = 0; pass < 3; pass++) for (let i = 0; i < [2800, 2000, 800][pass]; i++) {
    const u = r() - 0.5, v = (r() - 0.5) * 1.2, j1 = r() - 0.5, warm = (r() - 0.5) * 18, rot = r() - 0.5, rl = r(), rw = r(), ra = r(); if ((u / 0.5) ** 2 + (v / 0.6) ** 2 > 1.04) continue;
    const [s0, st] = val(u, v); if (pass === 1 && s0 < 0.4) continue; if (pass === 2 && s0 < 0.66) continue;
    const s = clamp(s0 + j1 * (pass ? 0.1 : 0.07) + (pass === 2 ? 0.05 : 0)), c = col(s, st);
    const ang = Math.atan2(v / 1.44, u) + Math.PI / 2 + rot * (pass ? 1.1 : 0.7);
    const L = [30, 18, 14][pass] + rl * [34, 22, 16][pass], w = [10, 6, 5][pass] + rw * [10, 6, 4][pass], al = (s0 < 0.3 ? 0.4 : 0.62) + ra * 0.3;
    g.fillStyle = `rgba(${c[0] + warm | 0},${c[1] | 0},${c[2] - warm * 0.6 | 0},${al})`;
    g.save(); g.translate(ox + u * HP, oy + v * HP); g.rotate(ang); g.beginPath(); g.ellipse(0, 0, L / 2, w / 2, 0, 0, TAU); g.fill(); g.restore();
  }
  // loaded impasto where the light strikes: forehead, brow ridge, cheekbone, bridge of the nose (and from above: both brows, the crown)
  const p = (u, v) => [ox + u * HP, oy + v * HP], cream = mode ? '#fbe2a8' : '#f8e2b6';
  [[[-0.34, -0.36], [-0.25, -0.43], [-0.13, -0.47]], [[-0.39, -0.22], [-0.3, -0.29], [-0.18, -0.33]], [[-0.3, -0.42], [-0.2, -0.5], [-0.08, -0.53]], [[-0.42, -0.08], [-0.37, -0.15], [-0.3, -0.19]]].forEach(s => thick(g, s.map(q => p(...q)), 22, cream, 0.75));
  [[[-0.34, -0.17], [-0.24, -0.185], [-0.12, -0.17]], [[-0.38, 0.105], [-0.31, 0.07], [-0.22, 0.075]], [[-0.035, 0.03], [-0.03, 0.1], [-0.025, 0.17]], [[-0.04, 0.19], [-0.005, 0.2]]].forEach(s => thick(g, s.map(q => p(...q)), 16, '#fae6c0', 0.8));
  if (mode) [[[0.12, -0.17], [0.24, -0.185], [0.34, -0.17]], [[-0.1, -0.52], [0.04, -0.56], [0.18, -0.52]], [[0.04, -0.4], [0.16, -0.42], [0.28, -0.38]], [[0.22, 0.075], [0.31, 0.07], [0.37, 0.1]]].forEach(s => thick(g, s.map(q => p(...q)), 18, '#fde0a0', 0.7));
  [[[-0.1, 0.49], [-0.02, 0.51]], [[-0.2, 0.3], [-0.14, 0.36]]].forEach(s => thick(g, s.map(q => p(...q)), 14, '#e8c08c', 0.55));
  g.restore();
});
function eyeOpening(side, F) {
  const o = clamp(F.open, 0, 1.4), big = Math.max(0, o - 1), ex = side * EYE_X, ey = EYE_Y;
  const rx = 0.098 * (1 + 0.16 * big), up = 0.074 * Math.min(o, 1) + 0.05 * big, dn = 0.058 * Math.min(o, 1) + 0.035 * big;
  const sl = 0.028 * F.worry * (1 - 0.5 * Math.min(1, o)) - 0.016 * F.knot;
  const xi = ex - side * rx, xo = ex + side * rx, yi = ey - sl, yo = ey + sl * 0.6;
  const p = new Path2D(); p.moveTo(xi, yi);
  p.bezierCurveTo(lerp(xi, xo, 0.25), ey - up * 1.36, lerp(xi, xo, 0.75), ey - up * 1.36 + sl * 0.3, xo, yo);
  p.bezierCurveTo(lerp(xi, xo, 0.75), ey + dn * 1.36, lerp(xi, xo, 0.25), ey + dn * 1.36, xi, yi);
  return { p, ex, ey, rx, up, dn, xi, xo, yi, yo, o };
}
// per frame: the cached study (crossfaded toward the vortex-lit one), then what the face is doing — bold warm-dark strokes with lit edges
function paintHead(g, F, wt = 0) {
  const head = eggPath();
  g.save(); g.drawImage(headPaint(0), -0.5, -0.6, 1, 1.2);
  if (wt > 0.01) { g.globalAlpha = clamp(wt); g.drawImage(headPaint(1), -0.5, -0.6, 1, 1.2); g.globalAlpha = 1; }
  g.clip(head); g.lineCap = 'round';
  const k = F.knot, w = F.worry, q = F.squeeze, bi = -0.125 + 0.04 * k - 0.05 * w, bo = -0.112 + 0.012 * w - 0.01 * k;
  // the sockets tighten as he squeezes
  if (q > 0.02) [-1, 1].forEach(s => { g.save(); g.translate(s * EYE_X, EYE_Y); g.scale(1, 0.7); dab(g, 0, 0, 0.17, '40,16,5', 0.32 * q); g.restore(); });
  // brows: a warm-dark mass under the ridge, the lit ridge above it; the knot pulls them down and together
  [-1, 1].forEach(s => {
    const lit = s < 0 ? 1 : 0.35 + 0.5 * wt;
    quad(g, [s * (0.065 - 0.025 * k), bi + 0.03], [s * 0.2, (bi + bo) / 2 + 0.016], [s * 0.35, bo + 0.036], 0.036 + 0.02 * k, `rgba(52,20,6,${0.3 + 0.38 * k + 0.12 * w})`);
    quad(g, [s * (0.07 - 0.025 * k), bi - 0.018], [s * 0.2, (bi + bo) / 2 - 0.03], [s * 0.34, bo - 0.012], 0.03, `rgba(255,226,172,${0.35 * lit * (0.45 + 0.55 * Math.min(1, k + w))})`);
  });
  if (w > 0.05) for (let j = 0; j < 3; j++) { const y = -0.27 - j * 0.066, a2 = w * (0.4 - j * 0.09); quad(g, [-0.18 + j * 0.02, y + 0.024], [0, y - 0.034 * w - 0.008], [0.18 - j * 0.02, y + 0.024], 0.018, `rgba(76,32,10,${a2})`); quad(g, [-0.17 + j * 0.02, y + 0.004], [-0.04, y - 0.034 * w - 0.026], [0.1 - j * 0.02, y + 0.004], 0.016, `rgba(255,232,186,${a2 * 0.85})`); }
  if (k > 0.05) {   // deep furrows between the brows, a crease at the root of the nose
    [-1, 1].forEach(s => { quad(g, [s * 0.02, -0.092], [s * 0.046, -0.15], [s * 0.05, -0.21], 0.02 + (s < 0 ? 0.004 : 0), `rgba(58,22,6,${0.55 * k})`); quad(g, [s * 0.058, -0.098], [s * 0.08, -0.152], [s * 0.086, -0.2], 0.018, `rgba(255,226,172,${(s < 0 ? 0.45 : 0.2 + 0.3 * wt) * k})`); });
    quad(g, [-0.006, -0.1], [0.002, -0.14], [0.0, -0.17], 0.012, `rgba(58,22,6,${0.3 * k})`);
    quad(g, [-0.055, -0.068], [0, -0.084], [0.055, -0.068], 0.018, `rgba(58,22,6,${0.55 * k})`); quad(g, [-0.05, -0.05], [0, -0.062], [0.05, -0.05], 0.014, `rgba(255,226,172,${0.35 * k})`);
    [-1, 1].forEach(s => { quad(g, [s * 0.075, 0.2], [s * 0.13, 0.28], [s * (0.12 + 0.05 * F.teeth), 0.36], 0.02, `rgba(64,24,8,${0.5 * k})`); quad(g, [s * 0.09, 0.19], [s * 0.15, 0.27], [s * (0.14 + 0.05 * F.teeth), 0.35], 0.016, `rgba(255,224,170,${(s < 0 ? 0.4 : 0.15) * k})`); });   // nasolabial folds
  }
  // eyes
  [-1, 1].forEach(s => {
    const E = eyeOpening(s, F);
    if (E.o > 0.06) {
      g.fillStyle = rgrad(g, E.ex - 0.01, E.ey - E.up * 0.3, 0.005, E.ex, E.ey, E.rx * 1.15, [[0, '#fffcf2'], [0.45, '#eef1ea'], [0.8, '#b8c6ca'], [1, '#8a9ca4']]); g.fill(E.p);
      g.save(); g.clip(E.p);
      g.fillStyle = lgrad(g, 0, E.ey - E.up * 1.05, 0, E.ey - E.up * 0.1, [[0, 'rgba(40,28,20,0.65)'], [1, 'rgba(40,28,20,0)']]); g.fillRect(E.ex - 0.2, E.ey - 0.2, 0.4, 0.4);
      dab(g, E.ex + 0.01 * s, E.ey - E.up * 0.25, E.rx * 0.7, '160,196,226', 0.28);
      g.restore();
      g.strokeStyle = 'rgba(34,14,4,0.7)'; g.lineWidth = 0.013; g.beginPath(); g.moveTo(E.xi, E.yi);
      g.bezierCurveTo(lerp(E.xi, E.xo, 0.25), E.ey - E.up * 1.36, lerp(E.xi, E.xo, 0.75), E.ey - E.up * 1.36, E.xo, E.yo); g.stroke();
      quad(g, [lerp(E.xi, E.xo, 0.1), E.ey - E.up - 0.036], [E.ex, E.ey - E.up * 1.3 - 0.05], [lerp(E.xi, E.xo, 0.95), E.ey - E.up - 0.026], 0.014, 'rgba(48,20,6,0.3)');
      quad(g, [lerp(E.xi, E.xo, 0.2), E.ey + E.dn * 1.05 + 0.012], [E.ex, E.ey + E.dn * 1.3 + 0.02], [lerp(E.xi, E.xo, 0.85), E.ey + E.dn * 1.05 + 0.01], 0.012, `rgba(240,206,160,${s < 0 ? 0.3 : 0.06})`);
    } else {
      // shut: a bold warm-dark seam, the plump lit lid above it, a crease over the lid; squeezing bunches the cheek and fans the crow's feet
      const yy = E.ey + 0.012, lit = s < 0 ? 1 : 0.3 + 0.5 * wt, bend = 0.022 + 0.02 * q;
      quad(g, [E.xi, yy - 0.004], [E.ex, yy - 0.03 - 0.012 * q], [E.xo, yy - 0.004 + 0.004 * q], 0.034, `rgba(250,212,156,${0.3 * lit})`);
      quad(g, [E.xi, yy - 0.004], [E.ex, yy + bend], [E.xo, yy + 0.004 * q], 0.022 + 0.012 * q, 'rgba(36,12,3,0.92)');
      quad(g, [lerp(E.xi, E.ex, 0.25), yy - 0.042 - 0.012 * q], [E.ex, yy - 0.068 - 0.018 * q], [lerp(E.ex, E.xo, 0.85), yy - 0.036], 0.02, `rgba(58,22,6,${0.3 + 0.4 * q})`);
      quad(g, [lerp(E.xi, E.ex, 0.35), yy + 0.04 + 0.01 * q], [E.ex, yy + 0.058 + 0.016 * q], [lerp(E.ex, E.xo, 0.75), yy + 0.042 + 0.01 * q], 0.026, `rgba(252,218,164,${(0.16 + 0.3 * q) * lit})`);
      quad(g, [lerp(E.xi, E.ex, 0.4), yy + 0.068 + 0.012 * q], [E.ex, yy + 0.088 + 0.018 * q], [lerp(E.ex, E.xo, 0.7), yy + 0.07 + 0.012 * q], 0.018, `rgba(58,22,6,${0.15 + 0.4 * q})`);
      if (q > 0.05) for (let j = -1; j <= 1; j++) quad(g, [E.xo + s * 0.012, yy + j * 0.014], [E.xo + s * 0.045, yy + j * 0.03 - 0.004], [E.xo + s * 0.082, yy + j * 0.048 - 0.012], 0.016, `rgba(52,20,6,${0.6 * q})`);
    }
  });
  // mouth: neutral / small "o" / clenched teeth in a dark, tense mouth
  const my = 0.355, mT = F.teeth, mO = F.mouthO * (1 - mT), mN = clamp(1 - mT - mO);
  if (mN > 0.02) { quad(g, [-0.056, my + 0.01], [0, my - 0.008], [0.058, my + 0.012], 0.02, `rgba(48,14,4,${0.88 * mN})`); quad(g, [-0.044, my + 0.032], [-0.005, my + 0.044], [0.03, my + 0.034], 0.02, `rgba(250,206,160,${0.3 * mN})`); }
  if (mO > 0.02) { const rx = 0.024 + 0.016 * mO, ry = 0.014 + 0.028 * mO; g.fillStyle = `rgba(30,8,2,${mO})`; g.beginPath(); g.ellipse(0.002, my + 0.006, rx, ry, 0, 0, TAU); g.fill();
    g.strokeStyle = `rgba(140,60,36,${0.6 * mO})`; g.lineWidth = 0.014; g.stroke(); quad(g, [-rx * 0.8, my + ry + 0.016], [0, my + ry + 0.026], [rx * 0.6, my + ry + 0.018], 0.016, `rgba(250,206,160,${0.35 * mO})`); }
  if (mT > 0.02) {
    const hw = 0.075 + 0.085 * mT, hh = 0.022 + 0.028 * mT, p = new Path2D();
    p.moveTo(-hw, my + 0.004); p.bezierCurveTo(-hw * 0.6, my - hh * 1.5, hw * 0.6, my - hh * 1.5, hw, my + 0.004); p.bezierCurveTo(hw * 0.6, my + hh * 1.45, -hw * 0.6, my + hh * 1.45, -hw, my + 0.004); p.closePath();
    g.save(); g.globalAlpha = mT; g.fillStyle = '#1e0703'; g.fill(p); g.clip(p);
    g.fillStyle = lgrad(g, -hw, 0, hw, 0, [[0, '#7a6448'], [0.25, '#e6d4b0'], [0.6, '#cdb790'], [1, '#3e3020']]);
    g.beginPath(); g.roundRect(-hw * 0.8, my - hh * 0.95, hw * 1.6, hh * 0.9, hh * 0.3); g.roundRect(-hw * 0.74, my + hh * 0.08, hw * 1.48, hh * 0.82, hh * 0.3); g.fill();
    g.lineCap = 'round';
    [-0.5, -0.17, 0.17, 0.5].forEach((q, j) => { g.strokeStyle = `rgba(80,44,20,${0.3 + 0.08 * (j % 2)})`; g.lineWidth = 0.009; g.beginPath(); g.moveTo(q * hw * 1.1, my - hh * 0.9); g.lineTo(q * hw * 1.05 + 0.003, my - hh * 0.08); g.moveTo(q * hw * 1.0 + 0.012, my + hh * 0.12); g.lineTo(q * hw * 0.98 + 0.012, my + hh * 0.86); g.stroke(); });
    g.strokeStyle = 'rgba(70,36,16,0.45)'; g.lineWidth = 0.008; g.beginPath(); g.moveTo(-hw * 0.8, my); g.quadraticCurveTo(0, my + 0.006, hw * 0.8, my); g.stroke();
    g.restore();
    g.save(); g.globalAlpha = mT; g.lineCap = 'round';
    g.strokeStyle = 'rgba(122,54,30,0.85)'; g.lineWidth = 0.02; g.stroke(p);
    quad(g, [-hw * 0.7, my + hh * 1.55], [0, my + hh * 1.85], [hw * 0.4, my + hh * 1.6], 0.026, 'rgba(250,206,160,0.38)');
    [-1, 1].forEach(s => quad(g, [s * (hw + 0.008), my - 0.018], [s * (hw + 0.05), my + 0.03], [s * (hw + 0.03), my + 0.09], 0.02, 'rgba(58,22,6,0.55)'));
    g.restore();
  }
  g.restore();
}
// after the light: light that lives inside the silhouettes (no outline around them), occluded by the hands
//   head: the window's cold reflection on the shadow side, the vortex's gold falling on crown, brow, nose and cheekbones
function glowPass(sg, hm, hands, moon, gold, handGlow) {
  const G = scratch('glow'), g = G.getContext('2d'); g.reset();
  g.setTransform(hm); g.save(); g.clip(eggPath()); g.globalCompositeOperation = 'lighter';
  if (moon > 0.01) { g.fillStyle = lgrad(g, 0.3, 0, 0.5, -0.04, [[0, 'rgba(96,116,148,0)'], [0.75, `rgba(100,120,152,${0.16 * moon})`], [1, `rgba(126,146,178,${0.36 * moon})`]]); g.fillRect(0.2, -0.65, 0.4, 1.3); }
  if (gold > 0.01) {
    g.fillStyle = lgrad(g, 0, -0.62, 0, 0.3, [[0, `rgba(255,206,130,${0.42 * gold})`], [0.35, `rgba(255,196,116,${0.16 * gold})`], [1, 'rgba(255,190,110,0)']]); g.fillRect(-0.6, -0.65, 1.2, 1);
    [[-0.22, -0.17], [0.22, -0.17], [-0.02, 0.12], [-0.27, 0.1], [0.27, 0.1]].forEach(([u, v], i) => dab(g, u, v, i > 2 ? 0.1 : 0.12, '255,200,120', (i > 2 ? 0.14 : 0.2) * gold));
  }
  g.restore();
  g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; hands.forEach(d => { g.setTransform(d.m); g.fill(d.H.sil); });
  g.globalCompositeOperation = 'source-over';
  hands.forEach((d, i) => { const hg = handGlow[i]; if (!hg) return; g.save(); g.setTransform(d.m); g.clip(d.H.sil); g.globalCompositeOperation = 'lighter';
    if (hg.moon > 0.01) { g.fillStyle = lgrad(g, hg.outer * 0.25, 0, hg.outer * 0.15, 0, [[0, `rgba(120,140,172,${0.36 * hg.moon})`], [1, 'rgba(120,140,172,0)']]); g.fillRect(-0.4, -1.1, 0.8, 1.6); }
    if (hg.warm > 0.01) { g.fillStyle = lgrad(g, -hg.outer * 0.22, 0, -hg.outer * 0.02, 0, [[0, `rgba(255,190,130,${0.3 * hg.warm})`], [1, 'rgba(255,190,130,0)']]); g.fillRect(-0.4, -1.1, 0.8, 1.6); }
    if (hg.gold > 0.01) { g.fillStyle = lgrad(g, 0, -1.0, 0, -0.5, [[0, `rgba(255,200,120,${0.36 * hg.gold})`], [1, 'rgba(255,200,120,0)']]); g.fillRect(-0.4, -1.1, 0.8, 0.7); }
    g.restore(); });
  sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.globalCompositeOperation = 'lighter'; sg.drawImage(G, 0, 0); sg.restore();
}
// the moonstone eyes glow, with the candle's tiny reflection
function eyesGlow(c, m, F, k) {
  c.save(); c.setTransform(m); c.globalCompositeOperation = 'lighter';
  [-1, 1].forEach(s => {
    const E = eyeOpening(s, F); if (E.o <= 0.06) return;
    const a = k * clamp(E.o) * (0.85 + 0.3 * Math.max(0, E.o - 1));
    dab(c, E.ex, E.ey, E.rx * 2.3, '140,160,186', 0.2 * a);
    c.fillStyle = rgrad(c, E.ex, E.ey - E.up * 0.2, 0, E.ex, E.ey, E.rx * 1.1, [[0, `rgba(214,222,226,${0.55 * a})`], [1, `rgba(120,140,160,${0.12 * a})`]]); c.fill(E.p);
    c.save(); c.clip(E.p); dab(c, E.ex - 0.032, E.ey - E.up * 0.4, 0.018, '255,236,190', 0.95 * a); dab(c, E.ex - 0.032, E.ey - E.up * 0.4, 0.006, '255,255,240', a); c.restore();
  });
  c.restore();
}

// ================= hands: flesh in strokes, knuckles, creases; the thumb drawn separately =================
// hand space: wrist (0,0), fingers toward −y, thumb side +x, 1 unit = hand length (wrist → middle fingertip)
const HK = [[0.16, -0.47], [0.055, -0.5], [-0.05, -0.49], [-0.145, -0.455]];        // MCP knuckles: index, middle, ring, little
const HL = [0.42, 0.47, 0.44, 0.35], HW = [0.106, 0.11, 0.102, 0.09], HF = [0.09, 0.0, -0.09, -0.2];
const PALM = [[-0.135, 0.02], [0.125, 0.025], [0.19, -0.1], [0.215, -0.3], [0.212, -0.45], [0.11, -0.52], [0.0, -0.535], [-0.1, -0.52], [-0.19, -0.47], [-0.2, -0.3], [-0.17, -0.1]];
function chain(k0, a0, lens, curl, cw) { let a = a0, p = k0; const pts = [p]; lens.forEach((L, j) => { const cu = curl * cw[j]; a += cu; const LL = L * (1 - 0.16 * Math.abs(cu)); p = [p[0] + Math.sin(a) * LL, p[1] - Math.cos(a) * LL]; pts.push(p); }); return pts; }
function digitPath(pts, w0) {
  const n = pts.length, wid = pts.map((_, j) => w0 * lerp(1.02, 0.8, j / (n - 1))), Lf = [], Rt = [];
  const nrm = j => { const A = pts[Math.max(0, j - 1)], B = pts[Math.min(n - 1, j + 1)], dx = B[0] - A[0], dy = B[1] - A[1], d = Math.hypot(dx, dy) || 1; return [-dy / d, dx / d]; };
  for (let j = 0; j < n; j++) {
    const [nx, ny] = nrm(j), hw = wid[j] / 2; Lf.push([pts[j][0] + nx * hw, pts[j][1] + ny * hw]); Rt.push([pts[j][0] - nx * hw, pts[j][1] - ny * hw]);
    if (j < n - 1) { const M = [(pts[j][0] + pts[j + 1][0]) / 2, (pts[j][1] + pts[j + 1][1]) / 2], dx = pts[j + 1][0] - pts[j][0], dy = pts[j + 1][1] - pts[j][1], d = Math.hypot(dx, dy) || 1, hm = (wid[j] + wid[j + 1]) / 4 * 0.93;
      Lf.push([M[0] - dy / d * hm, M[1] + dx / d * hm]); Rt.push([M[0] + dy / d * hm, M[1] - dx / d * hm]); }
  }
  const T = pts[n - 1], Q = pts[n - 2], dx = T[0] - Q[0], dy = T[1] - Q[1], d = Math.hypot(dx, dy) || 1, e = wid[n - 1] * 0.5;
  return RIG.smooth([...Lf, [T[0] + dx / d * e, T[1] + dy / d * e], ...Rt.reverse()], true);
}
function handParts(h) {
  const fingers = HK.map((k0, i) => { const pts = chain(k0, HF[i] * h.spread, [0.44, 0.31, 0.25].map(s => s * HL[i]), h.curl * (1 + 0.14 * (1.5 - i) * (h.fanCurl || 0)), [0.3, 0.55, 0.45]); return { pts, w: HW[i], path: digitPath(pts, HW[i]), seed: 70 + i }; });
  const tpts = chain([0.165, -0.13], 0.92 + 0.4 * (h.thumb - 0.5), [0.22, 0.17], -0.5 * h.curl, [0.5, 0.5]);
  const palm = RIG.smooth(PALM, true), stub = RIG.limb([0, 0.02], [0, 0.42], 0.27, 0.3);
  const sil = new Path2D(); sil.addPath(palm); sil.addPath(stub); fingers.forEach(f => sil.addPath(f.path));
  return { fingers, thumb: { pts: tpts, w: 0.122, path: digitPath(tpts, 0.122), seed: 69 }, palm, stub, sil };
}
const handM = (cam, h) => camM(cam).translate(h.x, h.y).rotate(h.ang * 180 / Math.PI).scale(h.s * h.flip, h.s);
const along = (pts, q) => { const n = pts.length - 1, f = clamp(q) * n, j = Math.min(n - 1, Math.floor(f)), u = f - j, A = pts[j], B = pts[j + 1]; return [[lerp(A[0], B[0], u), lerp(A[1], B[1], u)], Math.atan2(B[1] - A[1], B[0] - A[0])]; };
// one digit: a base turned toward the light, then flesh strokes along it, joint creases and knuckle bumps
function paintDigit(g, f, lx, key, ao) {
  const n = f.pts.length, A = f.pts[0], Z = f.pts[n - 1], dx = Z[0] - A[0], dy = Z[1] - A[1], d = Math.hypot(dx, dy) || 1, w = f.w;
  let nx = -dy / d, ny = dx / d; if (nx * lx < 0) { nx = -nx; ny = -ny; }
  const M = [(A[0] + Z[0]) / 2, (A[1] + Z[1]) / 2];
  if (ao) { g.save(); g.filter = `blur(${ao}px)`; g.translate(-nx * w * 0.38, -ny * w * 0.38 + w * 0.08); g.fillStyle = 'rgba(26,10,3,0.6)'; g.fill(f.path); g.restore(); }
  const lo = 0.1 + 0.1 * key, hi = 0.42 + 0.46 * key;
  g.fillStyle = lgrad(g, M[0] + nx * w * 0.6, M[1] + ny * w * 0.6, M[0] - nx * w * 0.6, M[1] - ny * w * 0.6, [[0, rgba(ramp(FLESH, hi))], [0.45, rgba(ramp(FLESH, lerp(lo, hi, 0.62)))], [1, rgba(ramp(FLESH, lo))]]);
  g.fill(f.path);
  g.save(); g.clip(f.path); g.lineCap = 'round';
  const r = rng(f.seed);
  for (let k = 0; k < 18; k++) {
    const q = r() * 0.96, sx = r() - 0.5, [P0, ang] = along(f.pts, q), s = clamp(lerp(lo, hi, sx + 0.5) + (r() - 0.5) * 0.1);
    const px = P0[0] + nx * sx * w * 0.8, py = P0[1] + ny * sx * w * 0.8, L = 0.05 + r() * 0.07;
    g.strokeStyle = rgba(ramp(FLESH, s), 0.5 + r() * 0.35, (r() - 0.5) * 10); g.lineWidth = w * (0.22 + r() * 0.2);
    g.beginPath(); g.moveTo(px - Math.cos(ang) * L / 2, py - Math.sin(ang) * L / 2); g.lineTo(px + Math.cos(ang) * L / 2, py + Math.sin(ang) * L / 2); g.stroke();
  }
  for (let j = 1; j < n - 1; j++) {
    const P0 = f.pts[j], Pa = f.pts[j - 1], Pb = f.pts[j + 1], ex = Pb[0] - Pa[0], ey = Pb[1] - Pa[1], ed = Math.hypot(ex, ey) || 1, px = -ey / ed, py = ex / ed, hw = w * 0.3;
    quad(g, [P0[0] - px * hw, P0[1] - py * hw], [P0[0] + ex / ed * w * 0.1, P0[1] + ey / ed * w * 0.1], [P0[0] + px * hw, P0[1] + py * hw], w * 0.1, 'rgba(96,46,20,0.42)');
    dab(g, P0[0] + nx * w * 0.16 - ex / ed * w * 0.14, P0[1] + ny * w * 0.16 - ey / ed * w * 0.14, w * 0.34, '236,170,120', 0.3 * (0.3 + key));
  }
  const T = f.pts[n - 1]; dab(g, T[0], T[1], w * 0.55, '196,96,64', 0.24);
  g.restore();
}
function paintHand(g, h, H, withThumb) {
  const lx = h.lx, key = h.key, lo = 0.1 + 0.1 * key, hi = 0.42 + 0.46 * key;
  g.fillStyle = lgrad(g, -0.24 * lx, -0.3, 0.24 * lx, -0.2, [[0, rgba(ramp(FLESH, hi))], [0.45, rgba(ramp(FLESH, lerp(lo, hi, 0.6)))], [1, rgba(ramp(FLESH, lo))]]);
  g.fill(H.stub); g.fill(H.palm);
  g.save(); g.clip(H.palm); g.lineCap = 'round';
  const r = rng(61);
  for (let k = 0; k < 40; k++) {   // the back of the hand in short strokes running toward the knuckles
    const x = (r() - 0.5) * 0.42, y = -r() * 0.5, s = clamp(lerp(lo, hi, 0.5 - x * lx * 2.2) + (r() - 0.5) * 0.08), L = 0.04 + r() * 0.05;
    g.strokeStyle = rgba(ramp(FLESH, s), 0.35 + r() * 0.3, (r() - 0.5) * 8); g.lineWidth = 0.03 + r() * 0.03;
    g.beginPath(); g.moveTo(x, y + L / 2); g.lineTo(x + 0.15 * x * L, y - L / 2); g.stroke();
  }
  quad(g, [-0.18, -0.43], [0, -0.5], [0.19, -0.42], 0.06, 'rgba(70,30,10,0.18)');
  g.restore();
  if (withThumb) paintDigit(g, H.thumb, lx, key, h.s * 0.01);
  const ao = Math.max(1.2, h.s * 0.012);
  H.fingers.slice().reverse().forEach((f, i) => { paintDigit(g, f, lx, key, i ? ao : 0); const k0 = f.pts[0]; dab(g, k0[0] - lx * 0.01, k0[1] + 0.012, f.w * 0.6, '240,184,134', 0.32 * (0.35 + key)); });
}
// a hand on the canvas: cast shadow onto the head (screen-space offset away from the candle), then the hand
function drawHand(g, cam, h, opt = {}) {
  const m = handM(cam, h), H = handParts(h);
  if (opt.shadowOn) { g.save(); g.setTransform(opt.shadowOn.m); g.clip(opt.shadowOn.path); g.setTransform(new DOMMatrix().translate(h.s * cam.z * 0.05, h.s * cam.z * 0.03).multiply(m));
    g.filter = `blur(${(h.s * cam.z * 0.025).toFixed(1)}px)`; g.fillStyle = 'rgba(26,10,3,0.6)'; g.fill(H.sil); g.filter = 'none'; g.restore(); }
  g.save(); g.setTransform(m); paintHand(g, h, H, !opt.noThumb); g.restore();
  return { m, H };
}
function drawThumb(g, cam, h) { const m = handM(cam, h), H = handParts(h); g.save(); g.setTransform(m); paintDigit(g, H.thumb, h.lx, h.key, 0); g.restore(); }
// after the light: loaded paint on the knuckles (warm where the candle reaches; gold from the vortex above) — only at close range
function knuckles(c, d, warm, gold) {
  const { m, H } = d, sc = Math.hypot(m.a, m.b); if (sc < 200) return;
  const T = (p, dx = 0, dy = 0) => tp(m, p[0] + dx, p[1] + dy);
  H.fingers.forEach((f, i) => {
    const k0 = f.pts[0], k1 = f.pts[1], a = warm + 0.5 * gold;
    if (a > 0.03) { thick(c, [T(k0, -0.04, 0.014), T(k0, 0.03, -0.006)], 0.06 * sc, gold > warm ? '#e4b070' : '#d8a676', 0.42 * a); if (i < 3) thick(c, [T(k1, -0.03, 0.012), T(k1, 0.02, 0)], 0.045 * sc, '#d29c6c', 0.32 * a); }
  });
}

// ================= the thought-swirl: candle smoke and gold leaf =================
const FIL = (() => { const r = rng(5150), o = []; for (let i = 0; i < 38; i++) o.push({ ph: r() * TAU, sp: 0.75 + r() * 0.75, dir: r() < 0.86 ? 1 : -1, rr: 0.4 + r() * 0.6, yo: r() * 2 - 1, tilt: (r() - 0.5) * 0.42,
  turns: 0.55 + r() * 0.95, w: 0.8 + r() * 1.5, leaf: r() < 0.42, wob: r() * TAU, wobA: 0.03 + r() * 0.08, ecc: 0.86 + r() * 0.28, spi: r(), vx: r() < 0.3 }); return o; })();
const swSpeed = t => { const A = arcOf(t); return 0.5 + 1.5 * A.sw + 0.9 * A.hit; };
const swClock = t => { let s = 0; const dt = 1 / 30; for (let u = 0; u < t; u += dt) { const h = Math.min(dt, t - u); s += swSpeed(u + h / 2) * h; } return s; };
function swirlWide(t, head) {
  const x = X(), A = arcOf(t), g = clamp(key(t, [[x.swirlStart, 0], [x.swirlStart + 1.3, 0.2], [x.TR_START + 0.45, 1]]));
  const birth = i => x.swirlStart + Math.pow(i / 22, 1.1) * (x.TR_START - x.swirlStart);
  return { C: [head.x + 6, head.y - head.w * lerp(0.1, 0.7, ss(0, 1, g))], R: head.w * lerp(0.86, 1.62, ss(0, 1, g)), k: lerp(0.28, 0.4, g), ysp: lerp(0.12, 0.3, g),
    n: 23, birth, life: () => 1, bright: A.sw, vortex: 0, wscale: 1, A };
}
function swirlClose(t) {
  const x = X(), A = arcOf(t), [f0, f1] = x.fade, fq = ss(f0, f1, t), pk = ss(A.s1 - 0.3, A.p0, t) * (1 - ss(x.ease[0], x.ease[1] + 0.4, t));
  const birth = i => i < 23 ? -1 : x.handsUp[0] + (i - 23) / 15 * (A.p0 - x.handsUp[0]);
  const life = i => 1 - ss(f0 + (1 - i / 38) * 2.2, f0 + (1 - i / 38) * 2.2 + 0.9, t) * (i % 3 === 0 ? 0.75 : 1);
  return { C: [540, lerp(lerp(440, 405, pk), 500, fq)], R: lerp(lerp(455, 500, pk), 345, fq), k: lerp(lerp(0.42, 0.5, pk), 0.34, fq), ysp: lerp(0.3, 0.16, fq),
    n: 38, birth, life, bright: A.sw, vortex: pk, wscale: 1.7, A, fq };
}
function paintSwirl(gB, gF, S, t) {
  const clk = swClock(t);
  gB.lineCap = gF.lineCap = 'round'; gB.lineJoin = gF.lineJoin = 'round';
  for (let i = 0; i < S.n; i++) {
    const f = FIL[i], age = t - S.birth(i); if (age <= 0) continue;
    const on = ss(0, 0.9, age), life = S.life(i), a0 = S.bright * life * (0.35 + 0.65 * on); if (a0 < 0.01) continue;
    const vx = f.vx ? S.vortex : 0, len = f.turns * TAU * on * (1 + 0.6 * vx), head = f.ph + f.dir * f.sp * clk * (1 + 0.7 * vx);
    const M = Math.max(6, Math.ceil(len / 0.1)), rr0 = S.R * f.rr * (1 - 0.68 * vx), cyo = -0.32 * S.R * vx;
    const ct = Math.cos(f.tilt * (1 - vx)), st = Math.sin(f.tilt * (1 - vx));
    let prev = null, chunk = [], chunkZ = 0;
    const flush = (q, z, th) => {
      if (chunk.length < 2) return;
      const g = z > 0 ? gF : gB, dep = z > 0 ? 1 : 0.5, a = a0 * (0.08 + 0.92 * Math.pow(q, 1.3)) * dep;
      const glint = f.leaf ? Math.pow(Math.abs(Math.cos(2 * th + f.ph)), 6) : 0, w = f.w * S.wscale * (f.leaf ? 0.45 + 1.7 * Math.abs(Math.cos(2 * th + f.ph)) : 1) * (z > 0 ? 1 : 0.75);
      g.strokeStyle = f.leaf ? `rgba(255,${190 + 50 * glint | 0},${90 + 120 * glint | 0},${a})` : `rgba(255,234,196,${a * 0.9})`; g.lineWidth = w;
      g.beginPath(); chunk.forEach((p, k) => k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke();
      if (!f.leaf) { g.strokeStyle = `rgba(255,190,120,${a * 0.14})`; g.lineWidth = w * 4; g.stroke(); }
    };
    for (let j = 0; j <= M; j++) {
      const q = j / M, th = head - len * (1 - q);
      const sp = 1 - (0.35 + 0.5 * vx) * f.spi * (1 - q);
      const rr = rr0 * sp * (1 + f.wobA * Math.sin(3 * th + f.wob + 0.6 * clk));
      const px = rr * Math.cos(th) * f.ecc, py = S.k * rr * Math.sin(th) + f.yo * S.R * S.ysp * (1 - 0.7 * vx) + cyo;
      const pt = [S.C[0] + px * ct - py * st, S.C[1] + px * st + py * ct], z = Math.sin(th);
      if (prev && (chunk.length >= 5 || (z > 0) !== (chunkZ > 0))) { flush(q, chunkZ, th); chunk = [prev]; chunkZ = z; }
      if (!chunk.length) chunkZ = z;
      chunk.push(pt); prev = pt;
      if (j === M) flush(1, chunkZ, th);
    }
  }
}
const SPK = (() => { const r = rng(808); return Array.from({ length: 80 }, () => ({ f: (r() * 30) | 0, per: 0.7 + r() * 1.3, off: r() * 3, life: 0.4 + r() * 0.8, v: 50 + r() * 140, up: 30 + r() * 90, s: 0.7 + r() * 1.3, side: r() < 0.5 ? -1 : 1 })); })();
function paintSparks(g, S, t, nAct) {
  const spd = swSpeed(t), clk = swClock(t);
  g.save(); g.lineCap = 'round';
  for (let k = 0; k < Math.min(nAct, SPK.length); k++) {
    const sp = SPK[k], f = FIL[sp.f]; if (sp.f >= S.n || t - S.birth(sp.f) < 0.5) continue;
    const cyc = Math.floor((t + sp.off) / sp.per), tb = cyc * sp.per - sp.off, age = t - tb; if (age > sp.life || age < 0) continue;
    const th = f.ph + f.dir * f.sp * (clk - spd * age), rr = S.R * f.rr;
    const x0 = S.C[0] + rr * Math.cos(th) * f.ecc, y0 = S.C[1] + S.k * rr * Math.sin(th) + f.yo * S.R * S.ysp;
    const tx = -Math.sin(th) * f.dir, ty = Math.cos(th) * S.k * f.dir, q = age / sp.life;
    const x1 = x0 + (tx * sp.v + sp.side * 20) * age, y1 = y0 + ty * sp.v * age - sp.up * age;
    const a = Math.pow(1 - q, 1.5) * S.bright * S.life(sp.f);
    g.strokeStyle = `rgba(255,226,150,${a})`; g.lineWidth = sp.s * S.wscale; g.beginPath(); g.moveTo(x1 - tx * sp.v * 0.035, y1 - (ty * sp.v - sp.up) * 0.035); g.lineTo(x1, y1); g.stroke();
    g.fillStyle = `rgba(255,248,220,${a})`; g.beginPath(); g.arc(x1, y1, sp.s * 0.9 * S.wscale, 0, TAU); g.fill();
  }
  g.restore();
}
const RINGS = (() => { const r = rng(919); return Array.from({ length: 13 }, (_, i) => ({ a0: r() * TAU, sp: (0.3 + r() * 0.35) * (r() < 0.8 ? 1 : -1), rx: 1.05 + r() * 0.28, ry: 0.5 + r() * 0.5, yo: (r() - 0.6) * 0.7, size: 20 + r() * 24, tw: r() * TAU, born: i / 13, drift: 0.6 + r() * 0.9, up: r() })); })();
function paintRings(g, S, t, face) {
  const x = X(), [r0] = x.rings, [f0, f1] = x.fade, fq = ss(f0, f1 - 0.6, t);
  g.save(); g.lineCap = 'round';
  RINGS.forEach((R) => {
    const tb = r0 + R.born * 3.2; let a = ss(tb, tb + 0.6, t) * (1 - Math.pow(fq, 1.6) * (0.7 + 0.3 * R.up)); if (a < 0.01) return;
    const al = R.a0 + R.sp * (t - r0) * (1 + 0.5 * S.bright), ox = S.R * R.rx * (1 + 0.9 * fq * R.drift), oy = S.R * R.ry * (1 + 0.6 * fq * R.drift);
    const px = 540 + Math.cos(al) * ox, py = S.C[1] + 40 + Math.sin(al) * oy + R.yo * S.R * 0.6 - 300 * fq * (0.4 + R.up);
    if (face) a *= 1 - (1 - ss(face.rx * 0.75, face.rx * 1.05, Math.abs(px - face.x))) * ss(face.top - 40, face.top + 60, py);   // never across the face
    if (a < 0.01) return;
    const tang = Math.atan2(Math.cos(al) * oy, -Math.sin(al) * ox), sz = R.size * (1 + 0.15 * Math.sin(t * 3 + R.tw)), open = 0.22 + 0.2 * Math.abs(Math.sin(al + R.tw));
    g.save(); g.translate(px, py); g.rotate(tang);
    g.strokeStyle = `rgba(255,214,130,${0.85 * a})`; g.lineWidth = 3.2; g.beginPath(); g.ellipse(0, 0, sz, sz * open, 0, 0, TAU); g.stroke();
    g.strokeStyle = `rgba(255,244,214,${0.7 * a})`; g.lineWidth = 1.6; g.beginPath(); g.ellipse(0, 0, sz * 0.72, sz * open * 0.62, 0, 0, TAU); g.stroke();
    g.restore();
  });
  g.restore();
}
const GDUST = (() => { const r = rng(1313); return Array.from({ length: 150 }, () => ({ a: r() * TAU, rr: 0.3 + r() * 0.75, yo: r() * 2 - 1, rel: r(), vx: (r() - 0.5) * 60, vy: -(14 + r() * 46), s: 1.1 + r() * 2.2, tw: r() * TAU })); })();
function paintGoldDust(g, S, t) {
  const [f0] = X().fade; if (t < f0) return;
  g.save();
  GDUST.forEach(d => {
    const tr = f0 + d.rel * 2.6, age = t - tr; if (age < 0) return;
    const a = ss(0, 0.35, age) * (1 - ss(1.6, 3.4, age)) * (0.55 + 0.45 * Math.sin(t * 5 + d.tw)); if (a < 0.02) return;
    const x0 = S.C[0] + Math.cos(d.a) * S.R * d.rr * 1.1, y0 = S.C[1] + Math.sin(d.a) * S.R * S.k * d.rr + d.yo * S.R * 0.2;
    const px = x0 + d.vx * age + 10 * P.noise(d.tw + age * 0.6, 3), py = y0 + d.vy * age;
    dab(g, px, py, d.s * 3.2, '255,200,110', 0.22 * a); g.fillStyle = `rgba(255,240,200,${0.9 * a})`; g.beginPath(); g.arc(px, py, d.s * 0.7, 0, TAU); g.fill();
  });
  g.restore();
}
function composeSwirl(sg, S, t, cam, charL, extra) {
  const W = SW(), H = SH(), B = scratch('swB'), F = scratch('swF'), gb = B.getContext('2d'), gf = F.getContext('2d');
  gb.reset(); gf.reset(); const m = camM(cam); gb.setTransform(m); gf.setTransform(m);
  paintSwirl(gb, gf, S, t);
  paintSparks(gf, S, t, Math.round(14 + 50 * S.bright + 30 * S.A.hit));
  if (extra) extra(gb, gf);
  gb.setTransform(1, 0, 0, 1, 0, 0); gb.globalCompositeOperation = 'destination-out'; gb.drawImage(charL, 0, 0); gb.globalCompositeOperation = 'source-over';
  const Q = sized('swQ', W >> 2, H >> 2), q = Q.getContext('2d');
  q.reset(); q.filter = 'blur(5px)'; q.drawImage(B, 0, 0, W >> 2, H >> 2); q.drawImage(F, 0, 0, W >> 2, H >> 2); q.filter = 'none';
  sg.save(); sg.globalCompositeOperation = 'lighter';
  sg.globalAlpha = 0.95; sg.drawImage(Q, 0, 0, W, H); sg.globalAlpha = 0.5; sg.drawImage(Q, 0, 0, W, H);
  sg.globalAlpha = 1; sg.drawImage(B, 0, 0); sg.drawImage(F, 0, 0);
  sg.restore();
}

// ================= the candle flame (emissive) =================
function paintFlame(c, x, y, C, t, s = 1) {
  const lean = C.lean, h = (66 + 18 * C.fl) * s, tipX = x + Math.sin(lean) * h * 0.9 + 4 * s * P.noise(t * 6, 3) * (0.3 + C.fl), tipY = y - Math.cos(lean) * h;
  c.save(); c.globalCompositeOperation = 'lighter';
  dab(c, x, y - 24 * s, 200 * s * (1 + 0.2 * C.fl), '255,166,76', 0.32 * C.I);
  dab(c, x, y - 26 * s, 74 * s, '255,214,140', 0.5 * C.I);
  const body = (w, hh, col) => { const tx = lerp(x, tipX, hh), ty = lerp(y, tipY, hh); c.fillStyle = col; c.beginPath(); c.moveTo(x - w, y - 6 * s); c.bezierCurveTo(x - w * 1.1, y - 26 * s * hh, tx - w * 0.3, ty + 22 * s * hh, tx, ty); c.bezierCurveTo(tx + w * 0.3, ty + 22 * s * hh, x + w * 1.1, y - 26 * s * hh, x + w, y - 6 * s); c.quadraticCurveTo(x, y + 6 * s, x - w, y - 6 * s); c.fill(); };
  body(11 * s, 1, 'rgba(255,150,60,0.55)');
  body(8.5 * s, 0.86, 'rgba(255,214,120,0.8)');
  body(5.5 * s, 0.6, 'rgba(255,248,220,0.95)');
  c.fillStyle = 'rgba(90,120,255,0.35)'; c.beginPath(); c.ellipse(x, y - 4 * s, 7 * s, 5 * s, 0, 0, TAU); c.fill();
  c.restore();
  c.strokeStyle = 'rgba(20,10,4,0.8)'; c.lineWidth = 2 * s; c.beginPath(); c.moveTo(x, y + 2 * s); c.quadraticCurveTo(x + 1, y - 6 * s, x + 2 * s, y - 12 * s); c.stroke();
  return [tipX, tipY];
}

// ================= light map (half-res, multiply) with the figure's cast shadow carved out of the key light =================
function applyLight(sg, cam, ambient, keyPools, fillPools, shadow) {
  const W = SW(), H = SH(), w = W >> 1, h = H >> 1, L = sized('lm', w, h), g = L.getContext('2d');
  const pools = list => { g.setTransform(0.5, 0, 0, 0.5, 0, 0); CAM.apply(g, cam); g.globalCompositeOperation = 'lighter'; list.forEach(([x, y, r, col, a]) => { if (a > 0.004 && r > 1) P.pool(g, x, y, r, col, a); }); g.setTransform(1, 0, 0, 1, 0, 0); };
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, w, h);
  pools(keyPools);
  if (shadow && shadow.a > 0.01) {
    const Sh = sized('lmS', w, h), s2 = Sh.getContext('2d'), [lx, ly] = shadow.from;
    s2.setTransform(1, 0, 0, 1, 0, 0); s2.globalCompositeOperation = 'source-over'; s2.clearRect(0, 0, w, h);
    s2.setTransform(0.5, 0, 0, 0.5, 0, 0); s2.translate(lx, ly); s2.scale(shadow.k, shadow.k); s2.translate(-lx + shadow.dx, -ly + shadow.dy);
    s2.filter = `blur(${shadow.blur}px)`; s2.drawImage(shadow.layer, 0, 0); s2.filter = 'none';
    s2.setTransform(0.5, 0, 0, 0.5, 0, 0); s2.globalCompositeOperation = 'destination-out'; s2.drawImage(shadow.layer, 0, 0); s2.globalCompositeOperation = 'source-over'; s2.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'destination-out'; g.globalAlpha = shadow.a; g.drawImage(Sh, 0, 0); g.globalAlpha = 1;
  }
  pools(fillPools);
  g.globalCompositeOperation = 'destination-over'; g.fillStyle = ambient; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over';
  sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.globalCompositeOperation = 'multiply'; sg.drawImage(L, 0, 0, W, H); sg.restore();
}
// the figure layer onto the scene: softened a touch, like paint (no halo)
const layFigure = (sg, L) => { sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.filter = 'blur(1.1px)'; sg.drawImage(L, 0, 0); sg.filter = 'none'; sg.globalAlpha = 0.4; sg.drawImage(L, 0, 0); sg.restore(); };
// varnish, a bloom of the highlights only, craquelure, weave, vignette → onto the engine's canvas
function finish(c, S) {
  const W = SW(), H = SH(), sg = S.getContext('2d'), Q = sized('bq', W >> 2, H >> 2), q = Q.getContext('2d');
  sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0);
  q.reset(); q.filter = 'brightness(0.6) contrast(4) blur(7px)'; q.drawImage(S, 0, 0, W >> 2, H >> 2); q.filter = 'none';
  sg.globalCompositeOperation = 'screen'; sg.globalAlpha = 0.5; sg.drawImage(Q, 0, 0, W, H); sg.globalAlpha = 1;
  sg.globalCompositeOperation = 'soft-light'; sg.fillStyle = 'rgba(206,150,72,0.24)'; sg.fillRect(0, 0, W, H);
  sg.globalCompositeOperation = 'multiply'; sg.drawImage(mulLayer(), 0, 0);
  sg.globalCompositeOperation = 'overlay'; sg.globalAlpha = 0.5; sg.drawImage(surface(), 0, 0);
  sg.globalAlpha = 1; sg.globalCompositeOperation = 'screen'; sg.fillStyle = 'rgb(9,6,3)'; sg.fillRect(0, 0, W, H);   // never a digital black
  sg.restore();
  c.drawImage(S, 0, 0);
}

// ================= WIDE: hunched on the edge of the bed, turned three-quarters toward the candle =================
function poseWide(t) {
  const x = X(), A = arcOf(t), F = faceOf(t);
  const wide = ss(x.eyesWide - 0.22, x.eyesWide + 0.3, t), br = Math.sin(t * TAU / 3.4 + 0.6), sway = P.noise(t * 0.32, 3.7);
  const trem = (0.3 + 1.4 * wide) * A.anx * P.noise(t * 10, 5), hunch = 1 - 0.65 * wide;
  return { A, F, wide, br, hunch, trem, head: { x: 528 + 5 * sway + trem, y: 730 - 16 * wide + 2.5 * br + 8 * hunch, w: 222, rot: -0.1 * hunch + 0.025 * sway + 0.01 * trem } };
}
const sleeve = (A, B, C, wa, wb, wc) => { const p = new Path2D(); p.addPath(RIG.taper(A, B, wa, wb, 6)); p.addPath(RIG.taper(B, C, wb, wc, 3)); p.addPath(RIG.limb(B, B, wb * 0.98, wb * 0.98)); return p; };
function figureWide(g, cam, Pz) {
  const sh = 2.5 * Pz.br - 7 * Pz.wide + 5 * Pz.hunch, m = camM(cam);
  g.setTransform(m); g.lineCap = 'round'; g.lineJoin = 'round';
  // bare shins and feet: down from the bent knees to the floor
  [[318, 1672], [500, 1700]].forEach(([x2, y2]) => { g.save(); g.translate(x2, y2); g.scale(1, 0.3); dab(g, 0, 0, 90, '10,5,2', 0.55); g.restore(); });   // contact shadows on the floor
  [[[338, 1296], [324, 1610], 0.66], [[498, 1316], [506, 1642], 0.48]].forEach(([K, Ak, lit], i) => {
    const shin = RIG.taper(K, Ak, 72, 44, 12);
    g.fillStyle = lgrad(g, K[0] - 40, 0, K[0] + 40, 0, [[0, rgba(ramp(FLESH, 0.82 * lit))], [0.5, rgba(ramp(FLESH, 0.5 * lit))], [1, rgba(ramp(FLESH, 0.14))]]); g.fill(shin);
    strokesIn(g, shin, [K[0] - 50, K[1], K[0] + 50, Ak[1]], 300 + i, 26, FLESH, (x2) => (0.75 - (x2 - K[0] + 30) / 90) * lit, () => Math.PI / 2, 0.5);
  });
  [[306, 1640, -0.35, 0.6], [492, 1670, -0.2, 0.45]].forEach(([fx, fy, a, lit]) => { g.save(); g.translate(fx, fy); g.rotate(a);
    const foot = RIG.smooth([[-26, -26], [24, -28], [42, -4], [46, 16], [30, 30], [-30, 30], [-48, 16], [-42, -6]], true);
    g.fillStyle = lgrad(g, -46, -20, 46, 20, [[0, rgba(ramp(FLESH, 0.8 * lit))], [0.55, rgba(ramp(FLESH, 0.45 * lit))], [1, rgba(ramp(FLESH, 0.12))]]); g.fill(foot);
    for (let k = 0; k < 5; k++) dab(g, -28 + k * 14, 26, 8, '80,40,18', 0.4);
    g.restore(); });
  // the robe: torso turned three-quarters, the lap over the thighs (resting on the mattress), folds draping over the knees
  const body = RIG.smooth([[532, 892 - sh], [488, 904 - sh], [452, 932 - sh], [432, 992], [426, 1082], [432, 1160], [448, 1196],
    [404, 1226], [356, 1258], [320, 1286], [306, 1322], [320, 1354], [364, 1366], [398, 1356], [426, 1388], [452, 1406], [478, 1376], [490, 1362], [532, 1368], [556, 1342], [552, 1302], [574, 1266],
    [628, 1236], [678, 1216], [692, 1160], [690, 1060], [678, 982], [650, 934 - sh], [608, 904 - sh], [566, 892 - sh]], true);
  g.fillStyle = lgrad(g, 300, 1000, 720, 1200, [[0, '#5a3c22'], [0.4, '#3a2614'], [0.75, '#24160a'], [1, '#160d06']]); g.fill(body);
  const shadeRobe = (x2, y2) => clamp(0.58 - (x2 - 330) / 430 + 0.16 * Math.sin((x2 - 440) / 20 + 0.6 * Math.sin(y2 / 90)) + 0.4 * g2(x2, y2, 330, 1290, 40, 26) + 0.3 * g2(x2, y2, 516, 1310, 40, 24));
  const angRobe = (x2, y2) => y2 > 1215 ? (y2 > 1300 ? Math.PI / 2 + 0.2 : Math.PI - 0.55) : Math.PI / 2 + 0.08 * Math.sin(x2 * 0.03);
  strokesIn(g, body, [300, 880, 700, 1410], 101, 320, CLOTH, shadeRobe, angRobe, 1.25, 0.9, 0.06, 0.16);
  g.save(); g.clip(body);
  // the folds, laid in as long strokes: troughs in umber, ridges catching the candle on the lit side
  [[452, 960, 446, 1190, 1], [492, 930, 484, 1196, 0.8], [602, 950, 612, 1200, 0.3], [648, 990, 662, 1206, 0.15]].forEach(([x0, y0, x1, y1, lit]) => {
    quad(g, [x0, y0], [(x0 + x1) / 2 + 6, (y0 + y1) / 2], [x1, y1], 18, 'rgba(10,5,2,0.5)');
    quad(g, [x0 - 12, y0 + 10], [(x0 + x1) / 2 - 8, (y0 + y1) / 2], [x1 - 12, y1 - 6], 9, `rgba(170,122,76,${0.42 * lit})`); });
  quad(g, [462, 1214], [396, 1238], [334, 1274], 20, 'rgba(184,134,84,0.55)'); quad(g, [636, 1236], [578, 1262], [522, 1300], 18, 'rgba(150,108,66,0.42)');   // the thigh tops
  quad(g, [456, 1230], [404, 1262], [356, 1300], 14, 'rgba(10,5,2,0.4)'); quad(g, [604, 1262], [560, 1290], [534, 1326], 14, 'rgba(10,5,2,0.42)');
  line(g, [[444, 1316], [432, 1356], [452, 1404]], 26, 'rgba(10,5,2,0.6)');                                  // the hollow between the knees
  [[316, 1300, 330, 1360], [346, 1306, 366, 1366], [508, 1322, 520, 1372], [540, 1318, 552, 1368]].forEach(([x0, y0, x1, y1], i) => quad(g, [x0, y0], [x0 + 4, (y0 + y1) / 2], [x1, y1], 7, `rgba(${i % 2 ? '12,6,2,0.5' : '176,128,80,0.4'})`));
  g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.4; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(clothTex(), 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.restore(); g.setTransform(m);
  // far arm (viewer's left): down the side, forearm forward to the far knee
  const farS = sleeve([458, 952 - sh], [426, 1112], [352, 1236], 90, 80, 68);
  g.fillStyle = lgrad(g, 340, 0, 480, 0, [[0, '#6a4a2c'], [0.5, '#3a2614'], [1, '#1e1208']]); g.fill(farS);
  strokesIn(g, farS, [330, 940, 490, 1250], 111, 60, CLOTH, (x2, y2) => clamp(0.85 - (x2 - 350) / 130 + 0.15 * Math.sin(y2 * 0.04)), (x2, y2) => y2 > 1110 ? Math.PI - 0.9 : Math.PI / 2 + 0.2, 0.8);
  g.fillStyle = '#efe4c8'; g.beginPath(); g.ellipse(354, 1238, 36, 14, 0.5, 0, TAU); g.fill();
  // linen collar and the shirt at the throat
  const shirt = new Path2D(); shirt.moveTo(522, 888 - sh); shirt.lineTo(570, 888 - sh); shirt.lineTo(560, 1002); shirt.lineTo(530, 1002); shirt.closePath();
  g.fillStyle = rgba(ramp(LINEN, 0.6)); g.fill(shirt);
  const collar = RIG.smooth([[462, 890 - sh], [484, 922 - sh], [514, 946 - sh], [542, 954 - sh], [570, 944 - sh], [598, 916 - sh], [614, 886 - sh], [594, 878 - sh], [568, 892 - sh], [542, 898 - sh], [514, 892 - sh], [486, 880 - sh]], true);
  g.fillStyle = rgba(ramp(LINEN, 0.66)); g.fill(collar);
  strokesIn(g, collar, [458, 870 - sh, 618, 958 - sh], 121, 30, LINEN, (x2) => clamp(1.02 - (x2 - 466) / 160), (x2) => 0.5 * (x2 - 540) / 80, 0.42);
  g.save(); g.clip(collar); line(g, [[541, 898 - sh], [541, 952 - sh]], 2.5, 'rgba(90,72,50,0.55)'); g.restore();
  // neck, mostly in the head's shadow
  g.fillStyle = lgrad(g, 512, 0, 572, 0, [[0, '#c89462'], [0.5, '#7a4c2a'], [1, '#3a2010']]); g.beginPath(); g.moveTo(514, 836); g.lineTo(566, 836); g.lineTo(570, 892 - sh); g.lineTo(510, 892 - sh); g.closePath(); g.fill();
  dab(g, 544, 860, 36, '24,10,3', 0.65);
  // head
  const hm = headM(cam, Pz.head); g.setTransform(hm); paintHead(g, Pz.F, 0.6 * Pz.A.sw);
  // near arm (viewer's right): from the near shoulder down and forward to the near knee
  g.setTransform(m);
  const nearS = sleeve([640, 950 - sh], [680, 1102], [532, 1262], 92, 82, 70);
  g.fillStyle = lgrad(g, 520, 0, 700, 0, [[0, '#5a3c22'], [0.4, '#3a2614'], [1, '#1a1008']]); g.fill(nearS);
  strokesIn(g, nearS, [510, 940, 720, 1280], 131, 70, CLOTH, (x2, y2) => clamp(0.6 - (x2 - 520) / 200 + 0.25 * g2(x2, y2, 600, 1200, 60, 40)), (x2, y2) => y2 > 1100 ? Math.PI - 0.75 : Math.PI / 2 - 0.2, 0.8);
  g.fillStyle = '#d8ccb0'; g.beginPath(); g.ellipse(534, 1262, 36, 14, 0.4, 0, TAU); g.fill();
  // the hands resting on the knees, fingers draped over the kneecaps (the near one in a little less light)
  const hF = { x: 350, y: 1246, ang: Math.PI + 0.3, s: 98, flip: -1, spread: 0.4, curl: 0.55, thumb: 0.45, fanCurl: 0, lx: -1, key: 1 };
  const hN = { x: 530, y: 1268, ang: Math.PI + 0.36, s: 96, flip: -1, spread: 0.4, curl: 0.55, thumb: 0.45, fanCurl: 0, lx: -1, key: 0.75 };
  const dF = drawHand(g, cam, hF), dN = drawHand(g, cam, hN);
  g.setTransform(1, 0, 0, 1, 0, 0);
  return { hm, dF, dN };
}

SCENES['u03_rembrandt'] = { draw: (c, lt, t) => drawWide(c, lt, t) };
function drawWide(c, lt, t) {
  const W = SW(), H = SH(), x = X();
  const Pz = poseWide(t), A = Pz.A, C = candleOf(t, A);
  // camera: starts wide on the whole bed, a slow push toward the head, a breath of drift, a whisper on the downbeats
  const e = U.ease.inOut(clamp(t / (x.TR_START + 0.45))), [dx, dy] = CAM.drift(t, 2.2, 1.3);
  const cam = { x: 540 + dx, y: lerp(990, 880, e) + dy, z: CAM.zlerp(1.008, 1.11, e) * (1 + 0.006 * A.bar) };
  const m = camM(cam);
  const S = scratch('scene'), sg = S.getContext('2d'); sg.reset();
  sg.setTransform(m); sg.drawImage(roomWide(), 0, 0); sg.setTransform(1, 0, 0, 1, 0, 0);
  const L = scratch('char'), lg = L.getContext('2d'); lg.reset();
  const fig = figureWide(lg, cam, Pz);
  layFigure(sg, L);
  // light: umber ambient; the candle (its long shadow of the figure thrown on wall, bed and floor); the face spot; moon; thoughts
  const Sw = swirlWide(t, Pz.head), [fx, fy] = FLAME_W, I = C.I, sz = C.size, h = Pz.head, amb = lerp(1, 0.6, A.anx);
  applyLight(sg, cam, `rgb(${22 * amb | 0},${16 * amb | 0},${10 * amb | 0})`, [
    [fx, fy - 20, 980 * sz, '255,204,142', 0.4 * I], [fx, fy - 20, 500 * sz, '255,216,164', 0.52 * I], [fx, fy - 20, 180, '255,238,206', 0.55 * I],
    [h.x - 0.16 * h.w, h.y - 0.05 * h.w, 0.9 * h.w, '255,244,226', 0.62 * I], [420, 1290, 260, '255,226,180', 0.32 * I], [340, 1140, 300, '255,230,190', 0.3 * I], [400, 1650, 240, '255,206,150', 0.22 * I],
  ], [
    [866, 420, 250, '120,140,172', 0.42], [880, 1170, 320, '112,130,162', 0.3], [740, 860, 300, '86,100,130', 0.12], [Sw.C[0], Sw.C[1], Sw.R * 1.3, '255,206,130', 0.28 * Sw.bright],
    [h.x, h.y - 0.3 * h.w, 0.8 * h.w, '255,214,150', 0.3 * Sw.bright],
  ], { layer: L, from: tp(m, fx, fy - 20), k: 1.42, dx: 0, dy: -8, blur: 5, a: 0.78 });
  sg.save(); sg.setTransform(m); sg.beginPath(); sg.rect(752, 250, 226, 346); sg.clip(); sg.globalCompositeOperation = 'screen'; sg.globalAlpha = 0.24; sg.drawImage(roomWide(), 0, 0); sg.restore();
  glowPass(sg, fig.hm, [fig.dF, fig.dN], 0.8, Sw.bright * 0.5, []);
  eyesGlow(sg, fig.hm, Pz.F, 1);
  sg.save(); sg.setTransform(m); const [tx, ty] = paintFlame(sg, fx, fy, C, t);
  sg.globalCompositeOperation = 'lighter';
  P.particles(70, 31, t * 0.4, { x0: 20, x1: 940, y0: 1250, y1: 260, speed: 30, drift: 30, life: 10 }).forEach((d, i) => {
    const dd = Math.hypot(d.x - fx, d.y - fy), a = clamp(1 - dd / 760) ** 2 * (0.5 + 0.5 * Math.sin(t * 3 + i * 1.7)) * I; if (a < 0.02) return;
    sg.fillStyle = `rgba(255,226,170,${0.75 * a})`; sg.beginPath(); sg.arc(d.x, d.y, 1 + d.s * 1.5, 0, TAU); sg.fill(); });
  sg.restore();
  composeSwirl(sg, Sw, t, cam, L, (gb) => {
    const a = ss(x.swirlStart - 0.6, x.swirlStart + 0.4, t) * (1 - 0.6 * ss(x.eyesWide, x.TR_START, t)); if (a < 0.01) return;
    const ex = Sw.C[0] - Sw.R * 0.92, ey = Sw.C[1] - 6, pts = [];
    for (let j = 0; j <= 40; j++) { const q = j / 40, yy = lerp(ty - 4, ey, ss(0, 1, q)) - 140 * Math.sin(q * Math.PI) * (1 - q * 0.4), xx = lerp(tx, ex, q * q) + 10 * Math.sin(q * 11 - t * 2.6) * q; pts.push([xx, yy]); }
    gb.lineCap = 'round'; line(gb, pts, 2.2, `rgba(255,232,196,${0.3 * a})`); line(gb, pts, 9, `rgba(255,200,140,${0.05 * a})`);
  });
  finish(c, S);
}

// ================= CLOSE-UP: both hands clutch the head; the vortex; the release =================
function handPoseClose(t, side) {
  const x = X(), [u0, u1] = x.handsUp, [d0, d1] = x.handsDown, F = faceOf(t);
  const low = { x: 196, y: 2140, ang: 0.06, spread: 1.25, curl: 0.1, thumb: 0.8 };
  const onHead = { x: 244, y: 1222, ang: 0.13, spread: 0.85, curl: 0.46, thumb: 0.5 };
  const cheek = { x: 290, y: 1430, ang: 0.32, spread: 0.8, curl: 0.2, thumb: 0.5 };
  const chest = { x: 176, y: 1990, ang: 1.08, spread: 0.65, curl: 0.62, thumb: 0.35 };
  const mix = (a, b, q) => ({ x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), ang: lerp(a.ang, b.ang, q), spread: lerp(a.spread, b.spread, q), curl: lerp(a.curl, b.curl, q), thumb: lerp(a.thumb, b.thumb, q) });
  let p;
  if (t < u0) p = low;
  else if (t < u1) { const q = U.ease.out(ss(u0, u1, t)); p = mix(low, onHead, q); p.curl = lerp(0.08, onHead.curl, ss(0.55, 1, q)); p.spread = lerp(1.3, onHead.spread, ss(0.4, 1, q)); }
  else if (t < d0) p = { ...onHead };
  else if (t < d1) { const q = ss(d0, d1, t); p = q < 0.5 ? mix(onHead, cheek, ss(0, 0.5, q)) : mix(cheek, chest, ss(0.5, 1, q)); }
  else p = chest;
  // gripping harder at the peak (fingers press into the skull), trembling; a small settling breath afterwards
  const tr = F.tremble, ph = side > 0 ? 0 : 3.3;
  p.curl += 0.1 * tr + 0.02 * Math.sin(t * 1.7 + ph) * (t > d1 ? 1 : 0); p.y -= 7 * tr; p.x += 5 * tr;
  p.x += tr * 3 * P.noise(t * 18 + ph, 2); p.y += tr * 3 * P.noise(t * 16 + ph, 5);
  return { ...p, x: side < 0 ? p.x : 1080 - p.x, ang: side < 0 ? p.ang : -p.ang, s: 370, flip: side < 0 ? 1 : -1, fanCurl: 0.5, lx: side < 0 ? -1 : 1, key: side < 0 ? 1 : 0.36, side };
}
function poseClose(t) {
  const x = X(), A = arcOf(t), F = faceOf(t);
  const br = Math.sin(t * TAU / 3.2), tr = F.tremble, jx = tr * 3.2 * P.noise(t * 17, 1.3);
  const sq = ss(x.squeeze - 0.12, x.squeeze + 0.15, t) * (1 - ss(x.eyesOpen - 0.3, x.eyesOpen + 0.3, t)), lift = ss(x.eyesOpen - 0.1, x.eyesOpen + 0.5, t);
  const head = { x: 540 + jx + 4 * P.noise(t * 0.4, 2), y: 1010 + 14 * sq + 6 * tr - 6 * lift + 3 * br, w: 522, rot: 0.025 * P.noise(t * 0.45, 9) + 0.0035 * jx };
  const hl = handPoseClose(t, -1), hr = handPoseClose(t, 1);
  hl.x += jx; hr.x += jx; hl.y += 14 * sq; hr.y += 14 * sq;
  return { A, F, br, head, sq, lift, hl, hr, up: ss(x.handsUp[0], x.handsUp[1], t) * (1 - ss(x.handsDown[0], x.handsDown[1], t)) };
}
function figureClose(g, cam, Pz, wt) {
  const m = camM(cam), sh = 4 * Pz.br - 6 * Pz.sq - 8 * Pz.F.tremble, h = Pz.head;
  g.setTransform(m); g.lineCap = 'round'; g.lineJoin = 'round';
  // robe over the shoulders and chest: broad strokes, the left shoulder catching the candle, the rest sinking into the dark
  const body = RIG.smooth([[426, 1362 - sh], [270, 1404 - sh], [132, 1462 - sh], [42, 1544 - sh], [-40, 1660], [-60, 1980], [1140, 1980], [1120, 1660], [1038, 1544 - sh], [948, 1462 - sh], [810, 1404 - sh], [654, 1362 - sh]], true);
  g.fillStyle = lgrad(g, 0, 1400, 1080, 1620, [[0, '#4a3220'], [0.3, '#2e1e10'], [0.62, '#1c1208'], [1, '#100a04']]); g.fill(body);
  strokesIn(g, body, [-40, 1350, 1120, 1960], 201, 360, CLOTH, (x2, y2) => clamp(0.78 - x2 / 620 + 0.2 * Math.sin(x2 * 0.022 + 1.5 * Math.sin(y2 * 0.006)) + 0.32 * g2(x2, y2, 190, 1470, 130, 60)),
    (x2, y2) => y2 < 1490 ? Math.atan2(80, x2 < 540 ? -300 : 300) : Math.PI / 2 + (x2 - 540) / 1600, 1.5);
  g.save(); g.clip(body); g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.45; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(clothTex(), 0, 0); g.restore(); g.setTransform(m);
  // neck, deep in the head's shadow
  g.fillStyle = lgrad(g, 462, 0, 630, 0, [[0, '#b88454'], [0.45, '#5e381e'], [1, '#22120a']]); g.beginPath(); g.moveTo(474, 1270); g.lineTo(610, 1270); g.lineTo(628, 1390 - sh); g.lineTo(456, 1390 - sh); g.closePath(); g.fill();
  dab(g, 552, 1320, 116, '20,8,2', 0.8);
  // linen falling band: matte, soft painted folds
  const collar = RIG.smooth([[402, 1368 - sh], [472, 1392 - sh], [540, 1400 - sh], [608, 1392 - sh], [678, 1368 - sh], [706, 1408 - sh], [666, 1492 - sh], [602, 1516 - sh], [550, 1428 - sh], [530, 1428 - sh], [478, 1516 - sh], [414, 1492 - sh], [374, 1408 - sh]], true);
  g.fillStyle = rgba(ramp(LINEN, 0.6)); g.fill(collar);
  strokesIn(g, collar, [366, 1360 - sh, 712, 1522 - sh], 211, 90, LINEN, (x2, y2) => clamp(0.95 - (x2 - 380) / 340 + 0.12 * Math.sin(x2 * 0.06 + y2 * 0.02)), (x2) => Math.PI / 2 + (x2 - 540) / 520, 0.75, 0.8);
  g.save(); g.clip(collar); g.lineCap = 'round';
  [[440, 1400, 426, 1486], [486, 1404, 474, 1500], [600, 1404, 612, 1500], [644, 1400, 658, 1486]].forEach(([a0, b0, a1, b1], i) => { line(g, [[a0, b0 - sh], [a1, b1 - sh]], 9, `rgba(96,80,58,${i < 2 ? 0.28 : 0.4})`); line(g, [[a0 - 9, b0 - sh], [a1 - 9, b1 - sh]], 6, `rgba(255,250,236,${i < 2 ? 0.3 : 0.08})`); });
  line(g, [[540, 1404 - sh], [540, 1430 - sh]], 5, 'rgba(70,52,34,0.5)'); g.restore();
  // thumbs go behind the head (behind the jaw, where the ears would be)
  const hands = [Pz.hl, Pz.hr].filter(hp => hp.y < 2120);
  hands.forEach(hp => { if (hp.y < 1420) drawThumb(g, cam, hp); });
  const hm = headM(cam, h); g.setTransform(hm); paintHead(g, Pz.F, wt);
  // forearms in dark sleeves with linen cuffs, then the hands; fingertips press little shadows into the skull
  const out = [];
  hands.forEach(hp => {
    g.setTransform(m);
    const s = hp.side, dir = [Math.sin(hp.ang), -Math.cos(hp.ang)], wr = [hp.x, hp.y];
    const elbow = [hp.x - dir[0] * 330 + s * 64, Math.max(hp.y - dir[1] * 470, 1960)];
    const sl = sleeve(elbow, [lerp(elbow[0], wr[0], 0.5), lerp(elbow[1], wr[1], 0.5)], [wr[0] - dir[0] * 100, wr[1] - dir[1] * 100], 236, 200, 160);
    g.fillStyle = s < 0 ? '#3a2614' : '#1a1008'; g.fill(sl);
    strokesIn(g, sl, [wr[0] - 240, wr[1] - 60, wr[0] + 240, 1980], 221 + s, 70, CLOTH, (x2) => s < 0 ? clamp(0.9 - (x2 - wr[0] + 120) / 220) : clamp(0.32 - (x2 - wr[0] + 90) / 360), () => Math.PI / 2 - s * 0.15, 1);
    const cm = camM(cam).translate(hp.x, hp.y).rotate(hp.ang * 180 / Math.PI).scale(hp.s);
    g.setTransform(cm); g.fillStyle = lgrad(g, -0.2, 0, 0.2, 0, s < 0 ? [[0, '#efe4cc'], [1, '#8e8064']] : [[0, '#7e7462'], [1, '#34302a']]);
    g.beginPath(); for (let k = 0; k <= 16; k++) { const q = k / 16, xx = lerp(-0.2, 0.2, q), yy = 0.27 + 0.025 * Math.sin(q * 18); k ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.lineTo(0.19, 0.42); g.lineTo(-0.19, 0.42); g.closePath(); g.fill();
    const onHead = hp.y < 1420 ? { m: hm, path: eggPath() } : null;
    const d = drawHand(g, cam, hp, { shadowOn: onHead, noThumb: !!onHead });
    if (onHead) { g.save(); g.setTransform(hm); g.clip(eggPath()); g.setTransform(d.m); d.H.fingers.forEach(f => { const T = f.pts[3], Q = f.pts[2]; dab(g, T[0] + (T[0] - Q[0]) * 0.5, T[1] + (T[1] - Q[1]) * 0.5, f.w * 0.75, '34,12,3', 0.5 * (0.5 + Pz.F.tremble)); }); g.restore(); }
    out.push({ hp, ...d });
  });
  g.setTransform(1, 0, 0, 1, 0, 0);
  return { hm, hands: out };
}
SCENES['u03_rembrandt_close'] = { draw: (c, lt, t) => drawClose(c, lt, t) };
function drawClose(c, lt, t) {
  const W = SW(), H = SH(), x = X();
  const Pz = poseClose(t), A = Pz.A, C = candleOf(t, A), S0 = swirlClose(t);
  // camera: gentle drift, a small push on the peak, a slight pull-back at the release, nudges on the hits
  const push = ss(A.s1 - 0.4, A.p0 + 0.8, t) * (1 - ss(x.ease[0] + 0.3, x.ease[1], t)), pull = ss(x.handsDown[0], x.fade[0] + 1.4, t), [dx, dy] = CAM.drift(t, 3, 2.1);
  const cam = { x: 540 + dx, y: lerp(lerp(965, 990, push), 945, pull) + dy, z: 1.045 * (1 + 0.06 * push + 0.014 * A.hit + 0.005 * A.bar) * (1 - 0.022 * pull) };
  const m = camM(cam);
  const intro = ss(x.CUT - 0.1, x.TR_START + x.TR_DUR + 0.05, t), I = C.I * lerp(0.9, 1, intro), sz = C.size, amb = lerp(1, 0.5, A.anx) * lerp(0.55, 1, intro), b = S0.bright * (1 + 0.5 * A.hit);
  const wt = clamp(0.85 * b * (0.35 + 0.65 * A.anx) * Pz.up + 0.25 * b);    // how much the vortex lights his face from above
  const S = scratch('scene'), sg = S.getContext('2d'); sg.reset();
  sg.setTransform(m); sg.drawImage(roomClose(), 0, 0); sg.setTransform(1, 0, 0, 1, 0, 0);
  const L = scratch('char'), lg = L.getContext('2d'); lg.reset();
  const fig = figureClose(lg, cam, Pz, wt);
  layFigure(sg, L);
  // light: the candle just out of frame on the left (key) and the vortex above — the face is the brightest flesh in the picture;
  // the head's shadow thrown on the wall to the right; darkness closes in at the peak; at the cut the candle glow comes up first
  const h = Pz.head;
  const keyP = [
    [-240, 1060, 1350 * sz, '255,204,142', 0.46 * I], [-120, 1040, 780 * sz, '255,216,164', 0.42 * I],
    [h.x - 0.18 * h.w, h.y - 0.08 * h.w, 0.85 * h.w, '255,244,226', 0.6 * I * lerp(0.75, 1, sz)], [190, 1460, 360, '255,220,170', 0.26 * I],
    [-40, 1000, 560, '255,190,110', 0.45 * (1 - intro)],
  ];
  if (Pz.up > 0.2) keyP.push([Pz.hl.x + 40, Pz.hl.y - 200, 280, '255,226,180', 0.3 * I * Pz.up]);
  applyLight(sg, cam, `rgb(${22 * amb | 0},${16 * amb | 0},${10 * amb | 0})`, keyP, [
    [1160, 330, 820, '104,122,156', 0.26 * intro], [Pz.hr.x - 10, Pz.hr.y - 200, 280, '176,138,104', 0.3 * Pz.up * intro],
    [S0.C[0], S0.C[1], S0.R * 1.35, '255,206,130', 0.44 * b * lerp(0.5, 1, intro)], [h.x, h.y - 0.3 * h.w, 0.85 * h.w, '255,216,156', 0.42 * wt],
  ], { layer: L, from: tp(m, -240, 1060), k: 1.22, dx: 0, dy: 0, blur: 7, a: 0.78 });
  sg.save(); sg.setTransform(m); sg.beginPath(); sg.rect(888, 138, 200, 484); sg.clip(); sg.globalCompositeOperation = 'screen'; sg.globalAlpha = 0.16 * intro; sg.drawImage(roomClose(), 0, 0); sg.restore();
  const gold = 0.85 * b * A.anx * Pz.up;
  glowPass(sg, fig.hm, fig.hands, intro, wt * 0.9, fig.hands.map(hh => ({ moon: hh.hp.side < 0 ? 0 : 0.8 * intro, warm: hh.hp.side < 0 ? 0 : 0.8 * intro * Pz.up, outer: hh.hp.side < 0 ? 1 : -1, gold })));
  eyesGlow(sg, fig.hm, Pz.F, 1.15);
  composeSwirl(sg, S0, t, cam, L, (gb, gf) => { paintRings(gf, S0, t, { x: h.x, rx: h.w * 0.5, top: h.y - h.w * 0.62 }); paintGoldDust(gf, S0, t); });
  sg.save(); sg.setTransform(m); sg.globalCompositeOperation = 'lighter';
  P.particles(46, 57, t * 0.35, { x0: 0, x1: 760, y0: 1700, y1: 500, speed: 24, drift: 40, life: 12 }).forEach((d, i) => {
    const a = clamp(1 - Math.hypot(d.x - 300, d.y - 1080) / 620) * (0.5 + 0.5 * Math.sin(t * 2.6 + i * 1.3)) * I; if (a < 0.03) return;
    sg.fillStyle = `rgba(255,226,170,${0.6 * a})`; sg.beginPath(); sg.arc(d.x, d.y, 1.2 + d.s * 1.8, 0, TAU); sg.fill(); });
  sg.restore();
  const Lh = clamp(0.5 + 0.5 * I) * (1 - 0.3 * A.anx) * intro;
  fig.hands.forEach(hh => knuckles(sg, hh, hh.hp.side < 0 ? 0.9 * Lh : 0.1 * Lh, gold));
  finish(c, S);
}
})();
