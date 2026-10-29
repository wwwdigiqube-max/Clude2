// V03 «ذهنی که آروم نمی‌گیره» (a mind that won't calm down) — painted the way EDVARD MUNCH would paint it.
//   SCENES['u03_munch']        wide shot: a hunched skull-headed figure on the edge of a bed at night, the thought-swirl grows
//   SCENES['u03_munch_close']  close-up: both hands clutch the head (The Scream), the storm peaks, then the night cools to blue
// Munch's language (the kit's study of it is scenes/19_munch.js):
//   · every surface = long, thin, translucent strokes integrated along a direction field that bends with time, laid over a flat
//     base of the same hue (the gaps show colour, never black) — walls, floorboards, sheets, the night fjord, the figure itself;
//   · a sexless skull-like figure in pale yellow-green with hollow ochre-green shadows (The Scream, 1893), dark wavy contours;
//   · a figure on the edge of a bed at night whose huge shadow looms on the wall behind it (Puberty, 1894);
//   · the pale moon and its reflection, the glowing "moon pillar", on a dark fjord (Moonlight / Starry Night, 1893–95);
//   · the finished frame is warped by rows and columns: the world itself flows.
// One anxiety curve A(t) (read from window.U03) drives everything: warp amplitude and speed, the room's strokes bending into a
// vortex around the head, saturation (at the peak the room turns into the Scream's blood-orange sky), the looming shadow, the
// swirl. The release cools the palette to night blues C(t), slows the warp, steadies the moon pillar and unravels the swirl.
// Pure function of t: every random number is seeded; "speeds" are integrated numerically on a fixed 1/30 s grid.
(() => {
  const P = PAINT, { clamp, lerp, rng, ss } = U, TAU = Math.PI * 2, PI = Math.PI, EZ = U.ease;
  const { W, H } = STAGE;
  const Q = () => window.U03;

  // ═══════════════════════ time: one anxiety curve drives the painting ═══════════════════════
  const kick = (t, at, rise, dec) => (t < at - rise ? 0 : t < at ? ss(at - rise, at, t) : Math.exp(-(t - at) / dec));
  const barPulse = (t) => { let s = 0; for (const b of Q().bars) s += kick(t, b, 0.025, 0.2); return Math.min(1, s); };
  const hitPulse = (t) => { const h = Q().hits; return Math.max(0.55 * kick(t, h[0], 0.04, 0.45), 0.7 * kick(t, h[1], 0.04, 0.5), kick(t, h[2], 0.05, 0.8)); };
  function anx(t) {
    const q = Q();
    if (t < q.TR_START) return 0.12 + 0.34 * ss(q.swirlStart, q.TR_START, t) + 0.1 * ss(q.eyesWide - 0.25, q.eyesWide + 0.35, t);
    let a = 0.56 + 0.1 * ss(q.handsUp[0], q.handsUp[1], t) + 0.14 * ss(q.slits[0], q.peak[0], t) + 0.2 * ss(q.peak[0] - 0.2, q.peak[0] + 1.4, t);
    a *= 1 - 0.6 * ss(q.hits[2] + 0.15, q.handsDown[1], t);
    return a * (1 - 0.78 * ss(q.handsDown[1] - 0.1, q.fade[1] - 0.8, t));
  }
  const coolOf = (t) => { const q = Q(); return ss(q.ease[1] - 0.25, q.fade[0] + 1.3, t); };
  // ∫ speed dt — the warp phase and the swirl rotation speed up with anxiety and SLOW DOWN on the release (no jumps)
  function phases(t) {
    const dt = 1 / 30, f = (x) => { const a = anx(x), h = hitPulse(x); return [1 + 1.35 * a + 0.9 * h, 0.3 + 1.7 * a + 1.6 * h]; };
    let ph = 0, rot = 0, x = 0, f0 = f(0);
    while (x + dt <= t) { const f1 = f(x + dt); ph += (f0[0] + f1[0]) * dt / 2; rot += (f0[1] + f1[1]) * dt / 2; x += dt; f0 = f1; }
    return [ph + f0[0] * (t - x), rot + f0[1] * (t - x)];
  }
  function gradeOf(t) {
    const A = anx(t), h = hitPulse(t), b = barPulse(t), C = coolOf(t), [ph, rot] = phases(t);
    return { t, A, h, b, C, ph, rot, sat: 0.82 + 0.3 * A + 0.25 * h - 0.06 * C, hot: clamp(ss(0.55, 1, A) * 0.85 + 0.35 * h) * (1 - C), vort: clamp(ss(0.3, 1, A) + 0.25 * h) };
  }

  // ═══════════════════════ colour: warm night → hot Scream → cool release ═══════════════════════
  const hex = P.hex;
  const mixc = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const satc = (c, s) => { const l = c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11; return [l + (c[0] - l) * s, l + (c[1] - l) * s, l + (c[2] - l) * s]; };
  const css = (c, a = 1) => `rgba(${clamp(c[0], 0, 255) | 0},${clamp(c[1], 0, 255) | 0},${clamp(c[2], 0, 255) | 0},${a})`;
  const tri = (w, h = w, c = w) => [hex(w), hex(h), hex(c)];
  const grade = (tr, G, k = 1) => { let c = mixc(tr[0], tr[1], G.hot); c = mixc(c, tr[2], G.C); c = satc(c, G.sat); return k === 1 ? c : [c[0] * k, c[1] * k, c[2] * k]; };
  const gcss = (tr, G, a = 1, k = 1) => css(grade(tr, G, k), a);
  const pal = (w, h, c) => w.map((x, i) => tri(x, h[i % h.length], c[i % c.length]));
  const palCss = (p, G, a, k = 1) => p.map((tr) => gcss(tr, G, a, k));
  const PAL = {
    // wall & floor are sorted dark → light: a slow noise picks the zone, so neighbouring strokes share a colour (painted
    // patches and bands, like the Scream's sky) instead of a random speckle (which reads as wood grain)
    wall: pal(['#2e1420', '#4a1814', '#6a2a16', '#5a3a1a', '#8a3418', '#7a5a2a', '#a8461c', '#c45a22', '#d8823a'],
      ['#4a1020', '#7a1414', '#a82a16', '#8a4a1a', '#c8301e', '#b8702a', '#e2541c', '#f08a24', '#f4b040'],
      ['#100c28', '#141434', '#1a1e48', '#1e2a50', '#24306a', '#2a3a6a', '#30407e', '#3a4a8a', '#4a5a9a']),
    floor: pal(['#2a140c', '#3a1c0e', '#4a2812', '#6a3a1a', '#7a4420', '#8a5226', '#9a6230'],
      ['#3a120a', '#4a1a0e', '#6a2412', '#8a3a1a', '#a8481e', '#b8562a', '#c87a30'],
      ['#0a0e20', '#0e1228', '#141834', '#1c2244', '#222c58', '#283466', '#34427a']),
    sheet: pal(['#5a4a5a', '#7a5e3a', '#967444', '#ae8a50', '#c4a462', '#d6ba78', '#e8d29c'],
      ['#6a4048', '#8a5a34', '#a8723e', '#c08848', '#d8a458', '#e8bc70', '#f4d494'],
      ['#3a4060', '#4a5478', '#5a6a90', '#6a7aa4', '#7c8cb8', '#94a2c8', '#aebcdc']),
    pillow: pal(['#a89878', '#c0ae86', '#d4c294', '#e2d4a8', '#efe4c0'], ['#b09070', '#c8a878', '#dcbc88', '#e8cc98', '#f4dcb0'], ['#6a7698', '#8490b0', '#9aa6c4', '#b0bad4', '#c8d0e4']),
    wood: pal(['#3a2014', '#5a3018', '#2a160e', '#6a3a1e', '#4a2614'], ['#4a1e10', '#6a2a14', '#30140c', '#7a3a1a', '#5a2410'], ['#141a34', '#1e2648', '#0e1228', '#283058', '#161c3a']),
    sky: pal(['#1a2a5a', '#24306a', '#2a3a7a', '#141c44', '#3a4a8a', '#30285a', '#1e2650'],
      ['#2a2a6a', '#6a2a4a', '#3a3a8a', '#8a2a2a', '#4a4a9a', '#b8401e', '#2a2a5a'],
      ['#14204a', '#1e2a5e', '#24346e', '#0e1638', '#30407e', '#22204a', '#182048']),
    band: pal(['#e2541c', '#f08a24', '#c8401e', '#f4a83a'], ['#f06a1e', '#f8a030', '#e04a1e', '#fcc048'], ['#7a3a4a', '#9a5a5a', '#5a2a44', '#a87060']),
    water: pal(['#14243e', '#1d3a6a', '#2c5a8a', '#0e1a34', '#284a7a', '#1a2c58'], ['#1a2a4e', '#2a4a7a', '#3a6a9a', '#141e3e', '#345a8a', '#24346a'], ['#101c36', '#183260', '#24507e', '#0a1430', '#20426e', '#14264e']),
    hill: pal(['#142a22', '#1e3a3a', '#24402e', '#0e1c1a', '#2a4a3a'], ['#1a2a1e', '#2a3a2a', '#3a4a2a', '#141c14', '#3a4a30'], ['#0e1a24', '#14283a', '#1a2e30', '#0a1418', '#1e3442']),
    gown: pal(['#161c34', '#20284a', '#0e1222', '#2a3460', '#080a14', '#221c40', '#1a2a3a', '#344272'],
      ['#1a1a34', '#28284c', '#120f20', '#343464', '#0a0a14', '#2a1c40', '#1e2238', '#40447a'],
      ['#101834', '#18244e', '#0a1028', '#223266', '#060a1c', '#181a44', '#122440', '#2c3e80']),
    skin: pal(['#d2cf92', '#c4c482', '#e4dcaa', '#b4b874', '#a2a864', '#d8c890'], ['#dcd48a', '#ccc474', '#ecdca0', '#bcb868', '#aaa858', '#e4c880'], ['#c4c49a', '#b4b88e', '#d8dab8', '#a4ac88', '#94a07e', '#ccc8a4']),
  };
  // Munch's face: pale yellow on the lit side (with a little of the room's orange reflected), ochre-green and blue-green in shadow
  const FACE_LIT = pal(['#eee6aa', '#e4d892', '#f4e8b4', '#dccf86', '#e8a868'], ['#f4e49a', '#ecd480', '#f8e8a4', '#e4c870', '#f09858'], ['#e2e4c8', '#d4d8b4', '#ecece0', '#c8ccaa', '#d0b8a0']);
  const FACE_MID = pal(['#d2cf92', '#c4c482', '#cfc88a', '#b8bc78', '#c8c690'], ['#dcd48a', '#ccc474', '#d8cc80', '#c0bc6a', '#d4ca84'], ['#c4c8a8', '#b4bc9a', '#c0c4a2', '#a8b294', '#bcc0a4']);
  const FACE_SH = pal(['#a8a860', '#8a9450', '#6e7c48', '#5a7468', '#7a7a40', '#94985a'], ['#aca458', '#909048', '#747a40', '#5e7060', '#807838', '#9a9450'], ['#8c9a84', '#748872', '#5a6e66', '#4a6670', '#667464', '#7c8c7a']);
  const BASE = {
    wall: tri('#5e2016', '#8a2816', '#16203e'), side: tri('#3e160f', '#5a1c10', '#0e1430'),
    floor: tri('#3e2210', '#4e1e0e', '#10142c'), floorFront: tri('#1e0e08', '#2a0c06', '#060814'),
    skyTop: tri('#0c1028', '#1a1030', '#080c22'), sky: tri('#1c2856', '#3a2050', '#141e48'), band: tri('#d8501c', '#f0601e', '#7a3a44'),
    water: tri('#14284c', '#1a2c50', '#0e1e3e'), waterDeep: tri('#0a1428', '#0e1630', '#060e22'),
    sheet: tri('#a8884e', '#b88a46', '#5a6890'), sheetShade: tri('#4e3420', '#5e3018', '#222a4a'), pillow: tri('#cdbb8c', '#d8b880', '#94a0c0'),
    wood: tri('#2e180e', '#3a180c', '#0e1226'), under: tri('#140a08', '#180806', '#04060e'),
    gown: tri('#121628', '#18142a', '#0e1630'), moonlit: tri('#4a5a8e', '#5a4a86', '#5a74b4'), skin: tri('#cfcb8e', '#d8d086', '#c6caa4'), skinHi: tri('#eee6b4', '#f6e6a6', '#e2e4c6'),
    skinSh: tri('#8e9452', '#949046', '#7c8c76'), skinDeep: tri('#4a5228', '#4e4a20', '#3c4c46'), socket: tri('#24220f', '#2a1e0c', '#121a28'),
  };
  const INK = '#150b16';

  // ═══════════════════════ brush tools ═══════════════════════
  const grid = (x0, y0, x1, y1, cell, seed) => { const r = rng(seed), o = []; for (let y = y0; y < y1; y += cell) for (let x = x0; x < x1; x += cell) o.push([x + (r() - 0.5) * cell, y + (r() - 0.5) * cell, r(), r()]); return o; };
  // long flowing strokes (kit P.flowLines + camera culling + graded colours): params[reg] = [steps, step, width]
  function flow(g, seeds, { region, angle, color, params, cull }) {
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i], sx = s[0], sy = s[1];
      if (cull && !cull(sx, sy)) continue;
      const reg = region(sx, sy); if (!reg) continue; const pr = params[reg]; if (!pr) continue;
      let x = sx, y = sy; g.beginPath(); g.moveTo(x, y);
      const n = pr[0] + ((s[3] * 8) | 0);
      for (let k = 0; k < n; k++) { const a = angle(x, y, reg); x += Math.cos(a) * pr[1]; y += Math.sin(a) * pr[1]; if (region(x, y) !== reg) break; g.lineTo(x, y); }
      g.strokeStyle = color(reg, sx, sy, s[2]); g.lineWidth = pr[2] * (0.7 + s[3] * 0.6); g.stroke();
    }
  }
  // the room spirals: blend a field angle toward an inward clockwise vortex around V (weight k, radius r)
  const vortex = (x, y, a, V, wk = 1) => {
    const dx = x - V.x, dy = y - V.y, w = V.k * wk * (0.3 + 0.7 * Math.exp(-(dx * dx + dy * dy) / (2 * V.r * V.r)));
    if (w < 0.02) return a;
    const b = Math.atan2(dy, dx) + PI / 2 + 0.5;
    return Math.atan2(Math.sin(a) * (1 - w) + Math.sin(b) * w, Math.cos(a) * (1 - w) + Math.cos(b) * w);
  };
  // colour zone: a slow noise over the wall picks the band (palette sorted dark → light), r1 jitters ±1.5 steps
  const zone = (p, sx, sy, r1, ph, f = 1) => { const z = clamp(0.5 + 1.05 * P.noise(sx * 0.0055 * f + 3.1, sy * 0.0014 * f - ph * 0.04 + 7.7)); return p[clamp(Math.round(z * (p.length - 1) + (r1 - 0.5) * 2.6), 0, p.length - 1)]; };
  const culler = (cam, m = 290) => (x, y) => { const sx = (x - cam.x) * cam.z + W / 2, sy = (y - cam.y) * cam.z + H / 2; return sx > -m && sx < W + m && sy > -m && sy < H + m; };
  const inPoly = (x, y, p) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const a = p[i], b = p[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
  // short painted strokes from local seeds (texture on a part, clip set by the caller)
  function strokesIn(g, seeds, map, angle, cols, w, step, n) {
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (const s of seeds) {
      let [x, y] = map(s[0], s[1]); g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < n; k++) { const a = angle(x, y, s); x += Math.cos(a) * step; y += Math.sin(a) * step; g.lineTo(x, y); }
      g.strokeStyle = cols[(s[2] * cols.length) | 0]; g.lineWidth = w * (0.7 + s[3] * 0.6); g.stroke();
    }
  }
  const blob = (g, p, r, c, a) => { const rg = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], r); rg.addColorStop(0, css(c, a)); rg.addColorStop(1, css(c, 0)); g.fillStyle = rg; g.fillRect(p[0] - r, p[1] - r, 2 * r, 2 * r); };
  const ink = (g, path, lw, a = 0.92) => { g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = INK; g.globalAlpha = a; g.lineWidth = lw; g.stroke(path); g.globalAlpha = 1; };
  const wob = (pts, amp, t, seed, sp = 0.55) => pts.map((p, i) => [p[0] + amp * P.noise(i * 0.61 + seed, t * sp), p[1] + amp * P.noise(i * 0.47 + seed + 31.7, t * sp + 5.3)]);
  const lerpPt = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  // a tube along a polyline (sleeves): fill, two open sides, the cuff end — so a sleeve never draws a line across the torso
  function tube(pts, wf) {
    const D = KIT.densify(pts, 8), n = D.length, Lp = [], Rp = [], N = [], Wd = [];
    for (let i = 0; i < n; i++) {
      const a = D[Math.max(0, i - 1)], b = D[Math.min(n - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const w = wf(i / (n - 1)); N.push([-dy, dx]); Wd.push(w);
      Lp.push([D[i][0] - dy * w / 2, D[i][1] + dx * w / 2]); Rp.push([D[i][0] + dy * w / 2, D[i][1] - dx * w / 2]);
    }
    const fill = new Path2D(); Lp.forEach((p, i) => (i ? fill.lineTo(p[0], p[1]) : fill.moveTo(p[0], p[1]))); for (let i = n - 1; i >= 0; i--) fill.lineTo(Rp[i][0], Rp[i][1]); fill.closePath();
    const side = (arr) => RIG.smooth(arr.filter((_, i) => i % 2 === 0 || i === arr.length - 1), false);
    const end = new Path2D(); end.moveTo(Lp[n - 1][0], Lp[n - 1][1]); end.quadraticCurveTo(D[n - 1][0] + (D[n - 1][0] - D[n - 2][0]) * 0.8, D[n - 1][1] + (D[n - 1][1] - D[n - 2][1]) * 0.8, Rp[n - 1][0], Rp[n - 1][1]);
    return { fill, a: side(Lp), b: side(Rp), end, D, N, Wd };
  }
  function paintSleeve(g, tb, G, lw) {
    g.fillStyle = gcss(BASE.gown, G); g.fill(tb.fill);
    g.save(); g.clip(tb.fill); g.lineCap = 'round';
    const cols = palCss(PAL.gown, G, 0.65), n = tb.D.length;
    for (let k = 0; k < 18; k++) {
      const v = (U.hash(k, 3) - 0.5) * 0.92, i0 = (U.hash(k, 7) * n * 0.55) | 0, i1 = Math.min(n - 1, i0 + 4 + ((U.hash(k, 9) * n * 0.6) | 0));
      g.beginPath();
      for (let i = i0; i <= i1; i++) { const p = tb.D[i], nn = tb.N[i], w = tb.Wd[i], x = p[0] + nn[0] * v * w, y = p[1] + nn[1] * v * w; i === i0 ? g.moveTo(x, y) : g.lineTo(x, y); }
      g.strokeStyle = cols[k % cols.length]; g.lineWidth = tb.Wd[0] * 0.17; g.stroke();
    }
    g.restore();
    ink(g, tb.a, lw); ink(g, tb.b, lw); ink(g, tb.end, lw * 0.9);
  }

  // ═══════════════════════ post: glow, shadow, warp, canvas ═══════════════════════
  const quarter = (k) => P.cached('u03munch_q' + k, W / 4, H / 4, () => {});
  const camMatrix = (cam, s = 1) => new DOMMatrix([cam.z * s, 0, 0, cam.z * s, (W / 2 - cam.x * cam.z) * s, (H / 2 - cam.y * cam.z) * s]);
  // a figure's shadow on the wall: silhouette (drawn in world coords by fn) projected by m, blurred at quarter size
  function castShadow(g, cam, m, fn, alpha, clipFn, blur = 5, sc = 1) {
    const A = quarter('shA'), ga = A.getContext('2d'); ga.setTransform(1, 0, 0, 1, 0, 0); ga.clearRect(0, 0, W / 4, H / 4);
    ga.setTransform(camMatrix(cam, 0.25).multiply(new DOMMatrix(m))); ga.fillStyle = '#2a1222'; ga.strokeStyle = '#2a1222'; ga.lineCap = 'round'; ga.lineJoin = 'round'; fn(ga);
    const B = quarter('shB'), gb = B.getContext('2d'); gb.setTransform(1, 0, 0, 1, 0, 0); gb.clearRect(0, 0, W / 4, H / 4); gb.filter = `blur(${blur}px)`; gb.drawImage(A, 0, 0); gb.filter = 'none';
    g.save(); if (clipFn) { g.beginPath(); clipFn(g); g.clip(); }
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.globalAlpha = clamp(alpha); g.drawImage(B, 0, 0, W / 4, H / 4, 0, 0, W * sc, H * sc); g.restore();
  }
  // shadow projection about an anchor: scale (sx, sy), lean (x shifts as the shadow rises), offset
  const proj = (ax, ay, sx, sy, lean, dx, dy) => [sx, 0, -lean, sy, ax * (1 - sx) + lean * ay + dx, ay * (1 - sy) + dy];
  const weave = () => P.cached('u03munch_weave', 96, 96, (g) => {
    const r = rng(9), img = g.createImageData(96, 96), d = img.data;
    for (let y = 0; y < 96; y++) for (let x = 0; x < 96; x++) {
      const i = (y * 96 + x) * 4, over = ((x >> 2) + (y >> 2)) % 2, th = over ? Math.sin(y * 1.57) : Math.sin(x * 1.57);
      const v = 128 + th * 14 + (r() - 0.5) * 26; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  });
  // night light on the room: dark corners, a cool moon glow from the window
  function roomLight(g, G, cx, cy, r0, r1, moon) {
    g.save(); g.globalCompositeOperation = 'multiply';
    const rg = g.createRadialGradient(cx, cy, r0, cx, cy, r1);
    rg.addColorStop(0, '#ffffff'); rg.addColorStop(0.55, 'rgb(212,194,206)'); rg.addColorStop(1, 'rgb(78,56,82)');
    g.fillStyle = rg; g.fillRect(-500, -500, W + 1000, H + 1000);
    g.globalCompositeOperation = 'screen';
    const mg = g.createRadialGradient(moon[0], moon[1], 10, moon[0], moon[1], moon[2]);
    mg.addColorStop(0, `rgba(150,160,200,${0.2 + 0.1 * G.C})`); mg.addColorStop(1, 'rgba(150,160,200,0)');
    g.fillStyle = mg; g.fillRect(moon[0] - moon[2], moon[1] - moon[2], moon[2] * 2, moon[2] * 2);
    g.restore();
  }
  // the whole world flows: rows then columns (kit KIT.warpRows / warpCols), then vignette and the canvas weave
  function finish(c, S, G) {
    const T2 = P.scratch('u03munch_warp'), g2 = T2.getContext('2d'); g2.reset();
    const ph = G.ph, aR = 3 + 9 * G.A + 7 * G.h + 1.6 * G.b, aC = 2 + 5.5 * G.A + 5 * G.h;
    g2.fillStyle = '#12080c'; g2.fillRect(0, 0, W, H);
    KIT.warpRows(g2, S, (y) => aR * Math.sin(y * 0.0085 + ph * 3.1) + 0.4 * aR * Math.sin(y * 0.024 - ph * 4.4), 4, aR * 1.4 + 2);
    c.save();
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    c.fillStyle = '#12080c'; c.fillRect(0, 0, W, H);
    KIT.warpCols(c, T2, (x) => aC * Math.sin(x * 0.0105 - ph * 2.7) + 0.35 * aC * Math.sin(x * 0.031 + ph * 3.3), 4, aC * 1.35 + 2);
    const vg = c.createRadialGradient(W / 2, H * 0.44, H * 0.28, W / 2, H * 0.5, H * 0.78);
    vg.addColorStop(0, 'rgba(14,6,16,0)'); vg.addColorStop(1, `rgba(14,6,16,${0.5 + 0.1 * G.C})`);
    c.fillStyle = vg; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'overlay'; c.globalAlpha = 0.18; c.fillStyle = c.createPattern(weave(), 'repeat'); c.fillRect(0, 0, W, H);
    c.restore();
  }

  // ═══════════════════════ the window: the Scream's fjord at night, the moon pillar ═══════════════════════
  const WSEEDS = {};
  function landscape(g, G, o) {
    const [x0, y0, x1, y1] = o.r, w = x1 - x0, h = y1 - y0, k = o.k, hor = o.hor, ph = G.ph, A = G.A, t = G.t;
    const seeds = WSEEDS[o.key] || (WSEEDS[o.key] = grid(x0 - 6 * k, y0 - 6 * k, x1 + 6 * k, y1 + 6 * k, 10 * k, 77 + o.key.length));
    g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
    const hf = (hor - y0) / h, sg = g.createLinearGradient(0, y0, 0, y1);
    sg.addColorStop(0, gcss(BASE.skyTop, G)); sg.addColorStop(hf * 0.8, gcss(BASE.sky, G)); sg.addColorStop(hf, gcss(BASE.band, G)); sg.addColorStop(Math.min(1, hf + 0.002), gcss(BASE.water, G)); sg.addColorStop(1, gcss(BASE.waterDeep, G));
    g.fillStyle = sg; g.fillRect(x0, y0, w, h);
    const bandH = (9 + 30 * A * (1 - G.C)) * k;   // the dying orange band: anxiety widens it (the Scream bleeding in), the release thins it
    const shore = (y) => x1 - w * 0.12 - w * 0.36 * Math.pow(clamp((y - hor) / (y1 - hor)), 0.7);
    const region = (x, y) => (x < x0 - 6 * k || x > x1 + 6 * k || y < y0 - 6 * k || y > y1 + 6 * k ? null : y < hor - bandH ? 'sky' : y < hor ? 'band' : x > shore(y) ? 'hill' : 'water');
    const wc = [x0 + w * 0.42, hor + (y1 - hor) * 0.55];
    const angle = (x, y, reg) => (reg === 'water' ? Math.atan2((y - wc[1]) * 2.4, x - wc[0]) + PI / 2 + 0.25 * Math.sin(ph * 2 + y * 0.02 / k)
      : reg === 'hill' ? -0.8 + 0.3 * Math.sin(y * 0.04 / k + ph * 2)
      : 0.45 * Math.sin(x * 0.022 / k + y * 0.03 / k - ph * 2.2) + 0.14 * Math.sin(y * 0.07 / k + ph * 3));
    const C_ = { sky: palCss(PAL.sky, G, 0.82), band: palCss(PAL.band, G, 0.88), water: palCss(PAL.water, G, 0.82), hill: palCss(PAL.hill, G, 0.88) };
    const color = (reg, sx, sy, r1) => { const p = C_[reg]; if (reg === 'sky') { const yy = sy + 9 * k * Math.sin(sx * 0.03 / k - ph * 2); const b = Math.floor((yy - y0) / (13 * k) + r1 * 0.8); return p[((b % p.length) + p.length) % p.length]; } return p[(r1 * p.length) | 0]; };
    flow(g, seeds, { region, angle, color, params: { sky: [14, 4 * k, 4.4 * k], band: [12, 4 * k, 3.8 * k], water: [14, 4 * k, 4.4 * k], hill: [9, 4 * k, 5 * k] } });
    // far hills on the horizon
    g.fillStyle = gcss(tri('#121a2a', '#1a1424', '#0c1222'), G);
    g.beginPath(); g.moveTo(x0, hor + 1); for (let x = x0; x <= x1 + 6 * k; x += 6 * k) g.lineTo(x, hor - (4 + 8 * (0.5 + 0.5 * Math.sin((x - x0) / w * 7 + 1))) * k * (x < x0 + w * 0.55 ? 1 : 0.45)); g.lineTo(x1 + 6 * k, hor + 1); g.closePath(); g.fill();
    // stars
    g.globalCompositeOperation = 'lighter';
    [[0.16, 0.1], [0.72, 0.17], [0.88, 0.06], [0.42, 0.27], [0.6, 0.04]].forEach(([u, v], i) => { const sx = x0 + u * w, sy = y0 + v * (hor - y0), a = 0.5 + 0.3 * Math.sin(t * 2.3 + i * 2); blob(g, [sx, sy], 7 * k, [255, 240, 200], a * 0.6); });
    // the moon: glow, disc, and its pillar on the water
    const [mx, my, mr] = o.moon;
    let rg = g.createRadialGradient(mx, my, mr * 0.4, mx, my, mr * 5.5);
    rg.addColorStop(0, 'rgba(255,236,170,0.5)'); rg.addColorStop(0.3, 'rgba(220,190,140,0.16)'); rg.addColorStop(1, 'rgba(120,120,160,0)');
    g.fillStyle = rg; g.fillRect(mx - mr * 5.5, my - mr * 5.5, mr * 11, mr * 11);
    const steady = 1 - 0.85 * G.C, wv = (1.5 + 7 * A) * k * steady;
    const pg = g.createLinearGradient(0, hor, 0, y1); pg.addColorStop(0, 'rgba(255,230,160,0.32)'); pg.addColorStop(1, 'rgba(255,230,160,0.06)');
    g.fillStyle = pg; g.fillRect(mx - mr * 2, hor, mr * 4, y1 - hor);
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#f4e8b8'; g.beginPath(); g.arc(mx, my, mr, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(255,250,225,0.7)'; g.lineWidth = 2.5 * k; g.lineCap = 'round';
    g.strokeStyle = 'rgba(255,252,236,0.45)'; g.lineWidth = mr * 0.22;
    for (let i = 0; i < 3; i++) { const yy = my + mr * (-0.4 + i * 0.38); g.beginPath(); g.moveTo(mx - mr * 0.6, yy); g.quadraticCurveTo(mx, yy - mr * 0.15, mx + mr * 0.55, yy + mr * 0.05); g.stroke(); }
    for (let y = hor + 2 * k; y < y1; y += 4 * k) {
      const q = (y - hor) / (y1 - hor), hw = mr * (0.7 + 0.6 * q) * (0.75 + 0.35 * (0.5 + 0.5 * Math.sin(y * 0.31 / k + ph * 2.6)));
      const dx = wv * Math.sin(y * 0.06 / k - ph * 3.4) + 0.5 * wv * Math.sin(y * 0.17 / k + ph * 5);
      g.strokeStyle = `rgba(250,236,180,${0.85 - 0.4 * q})`; g.lineWidth = 4.2 * k;
      g.beginPath(); g.moveTo(mx + dx - hw, y); g.quadraticCurveTo(mx + dx, y - 2 * k, mx + dx + hw, y); g.stroke();
    }
    g.restore();
  }
  function windowFrame(g, G, r, mull, trans, k) {
    const [x0, y0, x1, y1] = r, t = G.t;
    const line = (ax, ay, bx, by, lw, s) => { g.lineWidth = lw; g.beginPath(); for (let i = 0; i <= 12; i++) { const q = i / 12, e = Math.sin(q * PI); const x = lerp(ax, bx, q) + e * 3.5 * k * Math.sin(q * 5 + t * 1.2 + s), y = lerp(ay, by, q) + e * 3.5 * k * Math.sin(q * 4 + t * 1.05 + s * 2); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); };
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = gcss(tri('#c07038', '#e8862e', '#5a6aa8'), G, 0.5);
    line(x0 - 13 * k, y0 - 13 * k, x1 + 13 * k, y0 - 13 * k, 5 * k, 6); line(x1 + 13 * k, y0 - 13 * k, x1 + 13 * k, y1 + 10 * k, 5 * k, 7); line(x0 - 13 * k, y0 - 13 * k, x0 - 13 * k, y1 + 10 * k, 5 * k, 9);
    g.strokeStyle = 'rgba(20,10,18,0.96)';
    line(x0, y0, x1, y0, 17 * k, 0); line(x1, y0, x1, y1, 17 * k, 1); line(x1, y1, x0, y1, 20 * k, 2); line(x0, y1, x0, y0, 17 * k, 3);
    line(mull, y0, mull, y1, 10 * k, 4); line(x0, trans, x1, trans, 10 * k, 5);
    g.strokeStyle = gcss(tri('#c88a42', '#e8a040', '#6a7ab0'), G, 0.85); line(x0 - 20 * k, y1 + 15 * k, x1 + 20 * k, y1 + 15 * k, 8 * k, 8);
  }

  // ═══════════════════════ the figure: head, hands ═══════════════════════
  // skull-like egg: wide cranium, hollow cheeks, narrow jaw (unit = head width)
  const HEAD = [[0, -0.665], [0.27, -0.625], [0.455, -0.47], [0.532, -0.22], [0.522, 0.02], [0.468, 0.185], [0.392, 0.305], [0.345, 0.43], [0.24, 0.548], [0.105, 0.615], [0, 0.63], [-0.105, 0.615], [-0.24, 0.548], [-0.345, 0.43], [-0.392, 0.305], [-0.468, 0.185], [-0.522, 0.02], [-0.532, -0.22], [-0.455, -0.47], [-0.27, -0.625]];
  const FACE_SEEDS = (() => { const r = rng(404), o = []; for (let i = 0; i < 140; i++) o.push([(r() - 0.5) * 1.04, -0.66 + r() * 1.24, r(), r()]); return o; })();
  // an elliptical soft passage of colour (a shadow or light area painted wet-in-wet)
  const passage = (g, p, rx, ry, rot, c, a) => { g.save(); g.translate(p[0], p[1]); g.rotate(rot); g.scale(1, ry / rx); const rg = g.createRadialGradient(0, 0, 0, 0, 0, rx); rg.addColorStop(0, css(c, a)); rg.addColorStop(0.6, css(c, a * 0.55)); rg.addColorStop(1, css(c, 0)); g.fillStyle = rg; g.fillRect(-rx, -rx, 2 * rx, 2 * rx); g.restore(); };
  const EX = {
    tired: { open: 0.95, lid: 0.55, size: 0.95, squeeze: 0, closed: 0, brow: 0.3, knot: 0, mw: 0.05, mh: 0, teeth: 0, smile: -0.2 },
    alarm: { open: 1, lid: 0, size: 1.16, squeeze: 0, closed: 0, brow: 0.85, knot: 0, mw: 0.045, mh: 0.022, teeth: 0, smile: -0.1 },
    wideC: { open: 1, lid: 0.05, size: 1.12, squeeze: 0, closed: 0, brow: 0.8, knot: 0, mw: 0.06, mh: 0.004, teeth: 0, smile: -0.35 },
    squeeze: { open: 0, lid: 0, size: 1, squeeze: 1, closed: 0, brow: -0.6, knot: 0.55, mw: 0.1, mh: 0.022, teeth: 0.8, smile: -0.5 },
    slits: { open: 0.24, lid: 0.15, size: 1.08, squeeze: 0, closed: 0, brow: -0.55, knot: 0.45, mw: 0.095, mh: 0.03, teeth: 0.75, smile: -0.45 },
    peak: { open: 0, lid: 0, size: 1, squeeze: 1, closed: 0, brow: -1, knot: 1, mw: 0.155, mh: 0.06, teeth: 1, smile: -0.75 },
    ease: { open: 0, lid: 0, size: 1, squeeze: 0, closed: 1, brow: 0.25, knot: 0.08, mw: 0.06, mh: 0.006, teeth: 0, smile: -0.2 },
    lost: { open: 1, lid: 0, size: 1.2, squeeze: 0, closed: 0, brow: 0.75, knot: 0, mw: 0.035, mh: 0.042, teeth: 0, smile: 0 },
    calm: { open: 1, lid: 0.12, size: 1.12, squeeze: 0, closed: 0, brow: 0.55, knot: 0, mw: 0.04, mh: 0.018, teeth: 0, smile: -0.08 },
  };
  const mixE = (a, b, k) => { const o = {}; for (const key in a) o[key] = lerp(a[key], b[key], k); return o; };
  const exprAt = (keys, t) => { let e = keys[0][1]; for (let i = 1; i < keys.length; i++) { const [tk, ek, d = 0.25] = keys[i]; e = mixE(e, ek, ss(tk - d / 2, tk + d / 2, t)); } return e; };

  function socket(g, p, hw, E, tilt, G) {
    const rx = hw * 0.19 * (0.9 + 0.12 * E.size), ry = hw * 0.165 * (0.85 + 0.2 * E.size) * (1 - 0.15 * E.squeeze), c = grade(BASE.socket, G);
    g.save(); g.translate(p[0], p[1]); g.rotate(tilt); g.scale(1, ry / rx);
    const rg = g.createRadialGradient(0, 0, 0, 0, 0, rx);
    rg.addColorStop(0, css(c, 0.97)); rg.addColorStop(0.72, css(c, 0.9)); rg.addColorStop(1, css(c, 0));
    g.fillStyle = rg; g.beginPath(); g.arc(0, 0, rx, 0, TAU); g.fill();
    g.restore();
  }
  function eye(g, p, hw, E, tilt, sd, G) {
    const rx = hw * 0.106 * E.size, open = E.open * (1 - E.squeeze) * (1 - E.closed);
    g.save(); g.translate(p[0], p[1]); g.rotate(tilt); g.lineCap = 'round'; g.lineJoin = 'round';
    if (open > 0.015) {
      const ryT = Math.max(0.6, rx * open * (1 - 0.72 * E.lid)), ryB = Math.max(0.6, rx * open * (1 - 0.15 * E.lid));
      const glow = Math.min(1, open * 2.2) * (0.9 + 0.3 * G.b);
      g.globalCompositeOperation = 'lighter';
      const gr = rx * 2.2, rg = g.createRadialGradient(0, 0, rx * 0.5, 0, 0, gr);
      rg.addColorStop(0, `rgba(255,246,206,${0.34 * glow})`); rg.addColorStop(0.45, `rgba(220,214,160,${0.1 * glow})`); rg.addColorStop(1, 'rgba(200,200,150,0)');
      g.fillStyle = rg; g.fillRect(-gr, -gr, 2 * gr, 2 * gr);
      g.globalCompositeOperation = 'source-over';
      g.beginPath(); g.ellipse(0, 0, rx, ryT, 0, PI, TAU); g.ellipse(0, 0, rx, ryB, 0, 0, PI); g.closePath();
      const wg = g.createRadialGradient(-rx * 0.2, -ryT * 0.25, 0, 0, 0, rx * 1.05);
      wg.addColorStop(0, '#fffcea'); wg.addColorStop(0.65, '#f2ead0'); wg.addColorStop(1, '#d6cfa6');
      g.fillStyle = wg; g.fill();
      g.strokeStyle = 'rgba(22,14,12,0.6)'; g.lineWidth = hw * 0.009; g.stroke();
      if (E.lid > 0.05) { g.strokeStyle = INK; g.globalAlpha = Math.min(1, E.lid * 2); g.lineWidth = hw * 0.016; g.beginPath(); g.ellipse(0, 0, rx * 1.04, ryT * 1.05, 0, PI * 1.04, PI * 1.96); g.stroke(); g.globalAlpha = 1; }
    }
    const sq = E.squeeze * (1 - E.closed);
    if (sq > 0.02) {   // squeezed shut: the lids pressed into a tight ∩, creases fanning from the outer corner
      g.globalAlpha = Math.min(1, sq * 1.4); g.strokeStyle = INK; g.lineWidth = hw * 0.02;
      g.beginPath(); g.moveTo(-rx * 1.1, rx * 0.05); g.quadraticCurveTo(0, -rx * 0.45 * sq, rx * 1.1, rx * 0.05); g.stroke();
      g.lineWidth = hw * 0.012; g.beginPath(); g.moveTo(-rx * 0.8, rx * 0.24); g.quadraticCurveTo(0, rx * 0.42, rx * 0.8, rx * 0.24); g.stroke();
      const ox = sd * rx * 1.15;
      for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(ox, rx * 0.06 * k); g.lineTo(ox + sd * rx * 0.4, rx * 0.24 * k - rx * 0.05); g.stroke(); }
      g.globalAlpha = 1;
    }
    if (E.closed > 0.02) {   // eased: soft closed lids ‿ with a few lashes
      g.globalAlpha = Math.min(1, E.closed * 1.3); g.strokeStyle = INK; g.lineWidth = hw * 0.018;
      g.beginPath(); g.moveTo(-rx, -rx * 0.05); g.quadraticCurveTo(0, rx * 0.42, rx, -rx * 0.05); g.stroke();
      g.lineWidth = hw * 0.008;
      for (let k = 0; k < 3; k++) { const u = (k - 1) * 0.45 + sd * 0.25, xx = u * rx, yy = rx * 0.19 * (1 - u * u) + rx * 0.04; g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx + sd * rx * 0.1, yy + rx * 0.16); g.stroke(); }
      g.globalAlpha = 1;
    }
    g.restore();
  }
  function browsAndLines(g, M, hw, E, G) {
    g.strokeStyle = css(grade(BASE.socket, G), 0.85); g.lineCap = 'round';
    for (const sd of [-1, 1]) {
      const inner = M(sd * (0.075 - 0.02 * E.knot), -0.165 - 0.07 * E.brow + 0.035 * Math.max(0, -E.brow)), mid = M(sd * 0.2, -0.205 - 0.02 * E.brow - 0.01 * E.size), outer = M(sd * 0.33, -0.17 + 0.03 * E.brow);
      g.lineWidth = hw * 0.03; g.beginPath(); g.moveTo(inner[0], inner[1]); g.quadraticCurveTo(mid[0], mid[1], outer[0], outer[1]); g.stroke();
    }
    if (E.knot > 0.03) {
      g.globalAlpha = E.knot * 0.8; g.lineWidth = hw * 0.012;
      for (const sd of [-1, 1]) { const a = M(sd * 0.03, -0.24), m = M(sd * 0.012, -0.18), b = M(sd * 0.045, -0.12); g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(m[0], m[1], b[0], b[1]); g.stroke(); }
      for (let k = 0; k < 3; k++) { const yv = -0.3 - k * 0.07, w = 0.2 - k * 0.03, a = M(-w, yv + 0.02), m = M(0, yv - 0.025 * E.knot), b = M(w, yv + 0.02); g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(m[0], m[1], b[0], b[1]); g.stroke(); }
      g.globalAlpha = 1;
    }
  }
  function mouth(g, M, hw, E, tilt) {
    const c = M(0, 0.43), mw = E.mw * hw, mh = E.mh * hw, cy = -E.smile * 0.035 * hw;
    g.save(); g.translate(c[0], c[1]); g.rotate(tilt); g.lineCap = 'round'; g.lineJoin = 'round';
    if (mh < hw * 0.006) {
      g.strokeStyle = INK; g.lineWidth = hw * 0.016;
      g.beginPath(); g.moveTo(-mw, cy); g.quadraticCurveTo(0, -cy * 0.6 + hw * 0.004, mw, cy); g.stroke();
    } else {
      const path = new Path2D(); path.moveTo(-mw, cy); path.quadraticCurveTo(0, -mh * 1.15, mw, cy); path.quadraticCurveTo(0, mh * 1.5, -mw, cy); path.closePath();
      g.fillStyle = '#1c0e10'; g.fill(path);
      if (E.teeth > 0.05) {
        g.save(); g.clip(path); g.globalAlpha = E.teeth;
        g.fillStyle = '#ece2c0'; g.fillRect(-mw, -mh * 0.8, mw * 2, mh * 1.55);
        g.strokeStyle = '#3a2a20'; g.lineWidth = hw * 0.008; g.beginPath(); g.moveTo(-mw, mh * 0.08); g.lineTo(mw, mh * 0.08); g.stroke();
        for (let x = -mw + hw * 0.03; x < mw; x += hw * 0.032) { g.beginPath(); g.moveTo(x, -mh); g.lineTo(x + hw * 0.003, mh); g.stroke(); }
        g.restore();
      }
      g.strokeStyle = INK; g.lineWidth = hw * 0.013; g.stroke(path);
    }
    g.restore();
  }
  function drawHead(g, o) {
    const { x, y, hw, tilt, E, G } = o, t = G.t, ct = Math.cos(tilt), st = Math.sin(tilt);
    const M = (u, v) => [x + (u * ct - v * st) * hw, y + (u * st + v * ct) * hw];
    const head = RIG.smooth(HEAD.map(([u, v], i) => M(u + 0.016 * P.noise(i * 0.7 + 2.3, t * 0.45), v + 0.016 * P.noise(i * 0.9 + 9.1, t * 0.45))), true);
    g.fillStyle = gcss(BASE.skin, G); g.fill(head);
    g.save(); g.clip(head);
    blob(g, M(-0.2, -0.32), hw * 0.62, grade(BASE.skinHi, G), 0.8);              // moonlit cranium (the window is on the left)
    passage(g, M(0.4, 0.04), hw * 0.26, hw * 0.62, tilt + 0.12, grade(BASE.skinSh, G), 0.85);   // a long ochre-green passage down the far side
    passage(g, M(0.3, 0.36), hw * 0.13, hw * 0.24, tilt - 0.3, grade(BASE.skinDeep, G), 0.45 + 0.3 * clamp(hw / 430));  // hollow cheeks: the Scream's skull
    passage(g, M(-0.3, 0.37), hw * 0.11, hw * 0.2, tilt + 0.3, grade(BASE.skinDeep, G), 0.5);
    passage(g, M(-0.48, -0.12), hw * 0.1, hw * 0.24, tilt, grade(BASE.skinSh, G), 0.45);       // temple
    blob(g, M(0, 0.66), hw * 0.32, grade(BASE.skinDeep, G), 0.6);
    blob(g, M(0.02, 0.21), hw * 0.1, grade(BASE.skinSh, G), 0.4);
    blob(g, M(0.36, -0.46), hw * 0.3, [90, 110, 150], 0.2);                       // a cool blue note in the shadow
    blob(g, M(-0.44, 0.17), hw * 0.22, grade(tri('#e88a48', '#f07a30', '#c8a088'), G), 0.32);   // the room's orange, reflected on the lit cheek
    // long curved strokes that follow the skull: around the cranium, then down the cheeks converging on the chin
    const fk = 0.55 + 0.45 * clamp(hw / 430), cL = palCss(FACE_LIT, G, 0.46 * fk), cM = palCss(FACE_MID, G, 0.36 * fk), cS = palCss(FACE_SH, G, 0.4 * fk);
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (const s of FACE_SEEDS) {
      let u = s[0], v = s[1]; const dir = s[2] < 0.5 ? 1 : -1;
      g.beginPath(); let p = M(u, v); g.moveTo(p[0], p[1]);
      const steps = s[1] > 0.22 ? 5 : 10;
      for (let k = 0; k < steps; k++) {
        const ta = Math.atan2(v + 0.08, u * 1.15) + PI / 2, da = PI / 2 - u * 1.3, w = ss(-0.05, 0.3, v);
        const ax = Math.cos(ta) * (1 - w) + Math.cos(da) * w, ay = Math.sin(ta) * (1 - w) + Math.sin(da) * w, d = Math.hypot(ax, ay) || 1;
        const wv = 0.3 * Math.sin(s[3] * 9 + G.ph * 0.7 + k * 0.4), cw = Math.cos(wv), sw = Math.sin(wv);
        u += dir * 0.033 * (ax * cw - ay * sw) / d; v += dir * 0.033 * (ax * sw + ay * cw) / d;
        p = M(u, v); g.lineTo(p[0], p[1]);
      }
      const zn = s[0] < -0.14 ? cL : s[0] > 0.18 && s[1] < 0.3 ? cS : cM;
      g.strokeStyle = zn[(s[3] * zn.length) | 0]; g.lineWidth = hw * (0.02 + 0.014 * s[3]); g.stroke();
    }
    for (const sd of [-1, 1]) socket(g, M(sd * 0.205, 0), hw, E, tilt, G);
    browsAndLines(g, M, hw, E, G);
    g.fillStyle = css(grade(BASE.socket, G), 0.75);
    for (const sd of [-1, 1]) { const p = M(sd * 0.04, 0.275); g.beginPath(); g.ellipse(p[0], p[1], hw * 0.016, hw * 0.023, tilt + sd * 0.3, 0, TAU); g.fill(); }
    g.restore();
    for (const sd of [-1, 1]) eye(g, M(sd * 0.205, 0.005), hw, E, tilt, sd, G);
    mouth(g, M, hw, E, tilt);
    ink(g, head, hw * 0.024);
    ink(g, RIG.smooth(HEAD.map(([u, v], i) => M(u * 1.02 + 0.015 * P.noise(i * 0.5 + 40, t * 0.6), v * 1.02 + 0.015 * P.noise(i * 0.8 + 70, t * 0.6))), true), hw * 0.011, 0.5);
    return head;
  }
  // a hand with long wavy fingers, painted like the face (lit stroke down one side, ochre-green shadow down the other) with a
  // wavering contour. wr = wrist, ang = finger direction, L = palm length, sd = which side the thumb is on
  const sideLine = (g, C, off, col, w) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); C.forEach((p, j) => { const a = C[Math.max(0, j - 1)], b = C[Math.min(C.length - 1, j + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; const x = p[0] - dy / d * off, y = p[1] + dx / d * off; j ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); };
  function hand(g, o, G, lw) {
    const { wr, ang, L, sd, spread, curl, th, fl = 1, fwk = 1 } = o, t = G.t;
    const ca = Math.cos(ang), sa = Math.sin(ang), nx = -sa, ny = ca;
    const at = (u, v) => [wr[0] + ca * u + nx * v, wr[1] + sa * u + ny * v];
    const pw = L * 0.6 * fwk, skin = gcss(BASE.skin, G), cL = palCss(FACE_LIT, G, 0.42), cS = palCss(FACE_SH, G, 0.4), wa = L * 0.02;
    const FL = [0.95, 1.05, 0.98, 0.76], FV = [0.36, 0.12, -0.13, -0.37];
    g.lineCap = 'round'; g.lineJoin = 'round';
    const limb = (C, wBase, wTip, seed) => {   // a finger / the thumb from its centreline: fill, painted sides, wavering contour
      const n = C.length - 1, Lf = [], Rf = [];
      for (let j = 0; j <= n; j++) { const p0 = C[Math.max(0, j - 1)], p1 = C[Math.min(n, j + 1)]; let dx = p1[0] - p0[0], dy = p1[1] - p0[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d; const h = lerp(wBase, wTip, j / n) / 2; Lf.push([C[j][0] - dy * h, C[j][1] + dx * h]); Rf.push([C[j][0] + dy * h, C[j][1] - dx * h]); }
      const e = C[n], pe = C[n - 1], dd = Math.hypot(e[0] - pe[0], e[1] - pe[1]) || 1, tip = [e[0] + (e[0] - pe[0]) / dd * wTip * 0.4, e[1] + (e[1] - pe[1]) / dd * wTip * 0.4];
      const pts = wob([...Lf, tip, ...Rf.reverse()], wa, t, seed, 0.7);
      g.fillStyle = skin; g.fill(RIG.smooth(pts, true));
      sideLine(g, C, wBase * 0.22, cS[seed % cS.length], wBase * 0.3);
      sideLine(g, C, -wBase * 0.16, cL[(seed * 3) % cL.length], wBase * 0.2);
      ink(g, RIG.smooth(pts, false), lw);
    };
    for (let i = 0; i < 4; i++) {
      const base = at(L * 0.88, FV[i] * sd * pw), len = L * FL[i] * 1.34 * fl * (1 - 0.3 * curl), fw = L * 0.17 * fwk;
      let a = ang + spread * FV[i] * sd * 0.95, x = base[0], y = base[1];
      const C = [[x, y]];
      for (let j = 1; j <= 7; j++) { const q = j / 7; a += curl * 0.2 * -Math.sign(FV[i] * sd); const wv = 0.13 * Math.sin(q * 5 + t * 1.6 + i * 1.3); x += Math.cos(a + wv) * len / 7; y += Math.sin(a + wv) * len / 7; C.push([x, y]); }
      limb(C, fw, fw * 0.62, 90 + i * 13);
    }
    const palm = wob([at(0, -pw * 0.3), at(L * 0.2, -pw * 0.46), at(L * 0.78, -pw * 0.5), at(L * 0.97, -pw * 0.28), at(L * 1.0, 0), at(L * 0.97, pw * 0.28), at(L * 0.78, pw * 0.5), at(L * 0.2, pw * 0.46), at(0, pw * 0.3)], wa, t, 140, 0.7);
    const pp = RIG.smooth(palm, true);
    g.fillStyle = skin; g.fill(pp);
    g.save(); g.clip(pp);
    passage(g, at(L * 0.2, -sd * pw * 0.1), L * 0.32, L * 0.6, ang, grade(BASE.skinSh, G), 0.6); blob(g, at(L * 0.72, sd * pw * 0.15), L * 0.4, grade(BASE.skinHi, G), 0.5);
    for (let k = 0; k < 6; k++) { const v = (k / 5 - 0.5) * pw * 0.8, p0 = at(L * 0.05, v), p1 = at(L * 0.95, v * 0.9); g.strokeStyle = (k % 2 ? cS : cL)[k % 5]; g.lineWidth = L * 0.07; g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo((p0[0] + p1[0]) / 2 + nx * L * 0.04, (p0[1] + p1[1]) / 2 + ny * L * 0.04, p1[0], p1[1]); g.stroke(); }
    g.restore();
    ink(g, RIG.smooth([palm[2], palm[1], palm[0]], false), lw); ink(g, RIG.smooth([palm[6], palm[7], palm[8]], false), lw);
    const TC = [at(L * 0.3, sd * pw * 0.42)], ta = ang + sd * th, tl = L * 0.7;
    for (let j = 1; j <= 5; j++) { const q = j / 5, aa = ta - sd * 0.25 * q + 0.1 * Math.sin(t * 1.3 + q * 3), p = TC[j - 1]; TC.push([p[0] + Math.cos(aa) * tl / 5, p[1] + Math.sin(aa) * tl / 5]); }
    limb(TC, L * 0.2, L * 0.14, 160);
  }

  // ═══════════════════════ the thought-swirl: Munch's sky as separate loops of oil paint ═══════════════════════
  // Every strand is a loop of paint on its own tilted ring around the skull (3D: roll tz, tip tx, seen from a little above),
  // turning at its own speed. Its far half is painted BEFORE the figure (the skull hides it), its near half AFTER (it crosses
  // the forehead). Each loop is an oil stroke: uneven edges, opacity fading toward the dry end, lighter and darker bristle
  // threads broken where the brush runs dry; translucent, so colours mix where loops cross. Air between them: never a disc.
  const SW_COLS = [['#f6e2a8', 14], ['#f4c03a', 14], ['#f08a24', 12], ['#e2541c', 10], ['#f4d070', 8], ['#fff2cc', 5], ['#5a8ad0', 10], ['#3a6ab0', 8], ['#8ab0e0', 8], ['#c8301e', 6], ['#f0a040', 5]];
  const STRANDS = (() => {
    const r = rng(2024), bag = [];
    SW_COLS.forEach(([c, n]) => { for (let i = 0; i < n; i++) bag.push(c); });
    const o = [];
    for (let k = 0; k < 60; k++) {
      const eye = k % 10 === 7;
      o.push({ ph: r() * TAU, rr: eye ? 0.5 + r() * 0.25 : 0.42 + 0.58 * Math.sqrt(r()), span: TAU * (eye ? 1.8 : 0.55 + r() * 0.85), sp: (r() - 0.5) * 0.45, eye,
        ox: (r() - 0.5) * 0.32, oy: (r() - 0.5) * 0.5 - (eye ? 0.2 : 0), oz: (r() - 0.5) * 0.3, tx: (r() - 0.5) * 0.5, tz: (r() - 0.5) * 0.5,
        w: 0.5 + r() * 0.9, col: hex(bag[(r() * bag.length) | 0]), wf: 2 + ((r() * 3) | 0), wa: 0.03 + r() * 0.06,
        spd: (0.6 + r() * 0.8) * (r() < 0.1 ? -0.7 : 1), a: 0.62 + r() * 0.33, seed: 1 + r() * 9 });
    }
    Object.assign(o[0], { rr: 0.92, span: TAU * 1.3, w: 1.25, col: hex('#f6e2a8'), ox: 0, oy: 0.08, oz: 0, tx: 0.04, tz: -0.1, sp: 0.15, eye: false, a: 0.95, spd: 1 });
    Object.assign(o[1], { rr: 0.78, span: TAU * 0.95, w: 1.05, col: hex('#f08a24'), oy: -0.1, eye: false, a: 0.9, spd: 1.15 });
    Object.assign(o[2], { rr: 0.88, span: TAU * 0.8, w: 0.9, col: hex('#5a8ad0'), oy: 0.16, eye: false, a: 0.85 });
    return o;
  })();
  // sample each visible strand once per frame → runs of [x, y, taper, u, arc length], split where the loop passes behind / in front
  function swirlRuns(o) {
    const runs = [], G = o.G, N = Math.min(STRANDS.length, Math.ceil(o.n)), cp = Math.cos(o.pitch), sq = Math.sin(o.pitch);
    for (let k = 0; k < N; k++) {
      const s = STRANDS[k], rev = clamp(o.n - k); if (rev <= 0.001) continue;
      let a = s.a * o.alpha * ss(0, 0.4, rev); if (o.keep != null && k >= o.keep) a *= clamp(1 - (k - o.keep) / 5);
      if (a < 0.02) continue;
      const span = s.span * (0.12 + 0.88 * rev) * (1 - 0.35 * o.unravel), th0 = s.ph + G.rot * s.spd;
      const cz = Math.cos(s.tz), sz = Math.sin(s.tz), cx = Math.cos(s.tx), sx = Math.sin(s.tx);
      const X0 = o.cx + s.ox * o.R, Y0 = o.cy + s.oy * o.R * o.layer, Z0 = s.oz * o.R;
      const np = Math.max(12, Math.ceil(span * o.R * s.rr / 12));
      let cur = null, front = null, acc = 0, px = 0, py = 0;
      for (let i = 0; i <= np; i++) {
        const u = i / np, th = th0 + u * span;
        const r = o.R * (s.eye ? s.rr * (1 - 0.86 * u) : s.rr * (1 + s.sp * (u - 0.5))) * (1 + s.wa * Math.sin(th * s.wf + G.ph * 1.3 + k)) * (1 + 0.7 * o.unravel * u);
        const x0 = r * Math.cos(th), z0 = r * Math.sin(th), x1 = x0 * cz, y1 = x0 * sz;
        const y2 = y1 * cx - z0 * sx, z2 = y1 * sx + z0 * cx + Z0;
        const X = X0 + x1, Y = Y0 + y2 * cp + z2 * sq - o.lift * (0.3 + 0.7 * u), D = z2 * cp - y2 * sq;
        if (i) acc += Math.hypot(X - px, Y - py); px = X; py = Y;
        const f = D > 0, wq = 0.22 + 0.78 * Math.pow(Math.sin(PI * u), 0.6);
        if (f !== front) { if (cur && cur.length > 1) runs.push({ pts: cur, front, w: s.w, col: s.col, a, seed: s.seed }); cur = cur ? [cur[cur.length - 1]] : []; front = f; }
        cur.push([X, Y, wq, u, acc]);
      }
      if (cur && cur.length > 1) runs.push({ pts: cur, front, w: s.w, col: s.col, a, seed: s.seed });
    }
    return runs;
  }
  // one run of an oil stroke: body with uneven edges + bristle threads
  const BR_OFF = [-0.28, 0.02, 0.27], BR_MIX = [[255, 248, 228, 0.32], [44, 18, 30, 0.26], [255, 240, 210, 0.18]];
  function oilRun(g, r, base, col) {
    const pts = r.pts, n = pts.length, sk = r.seed, L = new Array(2 * n), R = new Array(2 * n), NX = new Array(n), NY = new Array(n);
    for (let i = 0; i < n; i++) {
      const p = pts[i], a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d; NX[i] = -dy; NY[i] = dx;
      const u = p[3], w = base * p[2] * (0.8 + 0.2 * Math.sin(u * 11 + sk) + 0.1 * Math.sin(u * 29 + sk * 2));
      const hl = w * (0.5 + 0.09 * Math.sin(u * 23 + sk * 3)), hr = w * (0.5 + 0.09 * Math.sin(u * 19 + sk * 5));
      L[2 * i] = p[0] - dy * hl; L[2 * i + 1] = p[1] + dx * hl; R[2 * i] = p[0] + dy * hr; R[2 * i + 1] = p[1] - dx * hr;
    }
    const p0 = pts[0], p1 = pts[n - 1], al = (u) => r.a * (0.5 + 0.5 * Math.pow(Math.sin(PI * clamp(u * 0.9 + 0.05)), 0.5));
    const ga = g.createLinearGradient(p0[0], p0[1], p1[0] + 0.01, p1[1]); ga.addColorStop(0, css(col, al(p0[3]))); ga.addColorStop(1, css(col, al(p1[3])));
    g.fillStyle = ga; g.beginPath(); g.moveTo(L[0], L[1]); for (let i = 1; i < n; i++) g.lineTo(L[2 * i], L[2 * i + 1]); for (let i = n - 1; i >= 0; i--) g.lineTo(R[2 * i], R[2 * i + 1]); g.closePath(); g.fill();
    g.lineCap = 'round';
    for (let j = 0; j < 3; j++) {
      const m = BR_MIX[j]; g.strokeStyle = css(mixc(col, m, m[3]), r.a * 0.42); g.lineWidth = Math.max(1, base * (0.13 + 0.04 * ((sk * (j + 1)) % 1)));
      g.setLineDash([base * (4.5 + j * 1.3 + (sk % 2)), base * (0.7 + 0.25 * j), base * (2.8 + j), base * (1.3 + 0.3 * j)]); g.lineDashOffset = -(p0[4] + sk * 37 + j * 23);
      g.beginPath();
      for (let i = 0; i < n; i++) { const p = pts[i], off = BR_OFF[j] * base * p[2], x = p[0] + NX[i] * off, y = p[1] + NY[i] * off; i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
    }
    g.setLineDash([]); g.lineCap = 'round';
  }
  const COOL_SW = [70, 100, 190];
  function drawRuns(g, runs, front, o) {
    const G = o.G;
    for (const r of runs) {
      if (r.front !== front) continue;
      const col = satc(mixc(r.col, mixc(r.col, COOL_SW, 0.7), G.C * 0.85), 0.95 + 0.2 * G.A + 0.2 * G.h);
      oilRun(g, r, r.w * o.wMul * (1 + 0.12 * G.b + 0.25 * G.h), col);
    }
  }
  // a soft warm glow only where the loops are densest (the core), cooler on the release
  function coreGlow(g, o, k) {
    const G = o.G, rr = o.R * 0.9, a = k * (0.14 + 0.2 * G.A + 0.28 * G.h + 0.08 * G.b) * clamp(o.n / 6) * (1 - 0.5 * G.C);
    if (a < 0.01) return;
    const c = mixc([255, 200, 120], [150, 180, 255], G.C), rg = g.createRadialGradient(0, 0, 0, 0, 0, rr);
    rg.addColorStop(0, css(c, a)); rg.addColorStop(0.45, css(c, a * 0.45)); rg.addColorStop(1, css(c, 0));
    g.save(); g.globalCompositeOperation = 'screen'; g.translate(o.cx, o.cy - o.lift * 0.5); g.scale(1, 0.55); g.fillStyle = rg; g.fillRect(-rr, -rr, 2 * rr, 2 * rr); g.restore();
  }
  // close-up: small looping brush-rings orbit the head, drift away on the release
  const RINGS = Array.from({ length: 14 }, (_, i) => { const r = rng(700 + i * 13); return { ph: i / 14 * TAU + (r() - 0.5) * 0.4, born: (i / 14) * 2.6 + r() * 0.25, sz: 0.8 + r() * 0.55, col: hex(['#f6e2a8', '#f08a24', '#f4c03a', '#fff2cc', '#e2541c', '#8ab0e0'][i % 6]), spd: 0.85 + r() * 0.3, out: 0.4 + r() * 0.8, stay: i % 5 === 2, tilt: (r() - 0.5) * 0.6, lo: r(), dy: (r() - 0.5) * 0.5 }; });
  function drawRings(g, G, o) {
    const q = Q(), t = G.t, f = ss(q.fade[0], q.fade[1] - 0.3, t);
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (const R of RINGS) {
      const age = t - q.rings[0] - R.born; if (age <= 0) continue;
      const pop = ss(0, 0.35, age), th = R.ph + G.rot * 0.42 * R.spd, go = R.stay ? 0.2 : 1;
      const k = 1 + f * R.out * 0.9 * go, x = o.cx + o.rx * k * Math.cos(th), y = o.cy + o.ry * k * Math.sin(th) + R.dy * o.ry - f * R.out * 190 * go;
      const a = pop * (R.stay ? 1 - 0.35 * f : 1 - ss(0.25, 0.9, f * (0.6 + R.lo * 0.4)));
      if (a < 0.02) continue;
      const sz = o.base * R.sz * (0.6 + 0.4 * pop) * (1 + 0.15 * G.h), ang = th + PI / 2 + R.tilt;
      const col = satc(mixc(R.col, mixc(R.col, COOL_SW, 0.6), G.C * 0.7), 1 + 0.2 * G.A);
      g.beginPath();
      for (let i = 0; i <= 44; i++) {
        const u = i / 44, p = u * TAU * 1.2 + t * 2.2 * R.spd, rr = sz * (1 - 0.22 * u), ex = rr * Math.cos(p), ey = rr * 0.36 * Math.sin(p);
        const px = x + ex * Math.cos(ang) - ey * Math.sin(ang), py = y + ex * Math.sin(ang) + ey * Math.cos(ang);
        i ? g.lineTo(px, py) : g.moveTo(px, py);
      }
      g.strokeStyle = css(col, 0.9 * a); g.lineWidth = o.lw; g.stroke();
      g.strokeStyle = css(mixc(col, [255, 250, 235], 0.45), 0.6 * a); g.lineWidth = o.lw * 0.3; g.stroke();
    }
  }

  // ═══════════════════════ WIDE: the bedroom ═══════════════════════
  // one-point perspective: vanishing point at the figure's eye level; back wall, two side walls, floorboards; bed along the back wall
  const WR = { VP: [540, 700], bx0: 110, bx1: 970, fy: 1180, win: [150, 380, 420, 940], hor: 700, moon: [232, 656, 22], mull: 300, trans: 560 };
  const floorY = (x) => { const { VP, bx0, bx1, fy } = WR, s = (fy - VP[1]) / (VP[0] - bx0); return x < bx0 ? fy + (bx0 - x) * s : x > bx1 ? fy + (x - bx1) * s : fy; };
  const BED_TOP = [[110, 975], [800, 975], [935, 1118], [-113, 1118]], BED_FOOT = [[800, 975], [800, 880], [935, 974], [935, 1118]];
  const BED_ALL = [[-160, 1140], [110, 975], [800, 975], [800, 876], [954, 968], [954, 1432], [-160, 1432]];
  const PILLOW = [[40, 990], [150, 981], [255, 990], [290, 1025], [268, 1070], [150, 1086], [20, 1082], [-30, 1052], [-18, 1006]];
  const DRAPE = [[-160, 1116], [935, 1118], [942, 1256], [-160, 1258]];
  const SEEDS_W = grid(-120, -120, W + 120, H + 120, 24, 11), SEEDS_BED = grid(-150, 860, 970, 1300, 14, 23);
  function wideRegion(x, y) {
    const w = WR.win;
    if (x > w[0] - 10 && x < w[2] + 10 && y > w[1] - 10 && y < w[3] + 10) return null;
    if (y > 868 && x < 960 && y < 1436 && inPoly(x, y, BED_ALL)) return null;
    if (y > floorY(x)) return 'floor';
    return x < WR.bx0 ? 'lw' : x > WR.bx1 ? 'rw' : 'wall';
  }
  // the wide shot's direction field: long vertical waves on the walls, boards converging on the vanishing point, all of it bent
  // toward a vortex around the head as anxiety rises (the nightshirt's strokes use it too)
  const wideField = (G, F) => { const V = { x: F.head.x, y: F.head.y - 130, k: G.vort, r: 520 }, ph = G.ph, VP = WR.VP;
    return (x, y, reg) => {
      let a;
      if (reg === 'floor') a = Math.atan2(y - VP[1], x - VP[0]) + 0.14 * Math.sin(x * 0.011 + ph * 2.1) + 0.07 * Math.sin(y * 0.03 - ph * 2.8);
      else a = -PI / 2 + 0.42 * Math.sin(y * 0.0085 + x * 0.004 + ph * 2.0) + 0.18 * Math.sin(x * 0.026 - ph * 2.6) + 0.26 * Math.sin(x * 0.0061 - y * 0.0043 + ph * 1.1) + (reg === 'lw' ? -0.22 : reg === 'rw' ? 0.22 : 0);
      return vortex(x, y, a, V, reg === 'floor' ? 0.45 : 1);
    }; };
  function wideRoom(g, G, cam, F) {
    const { VP, bx0, bx1, fy } = WR, ph = G.ph;
    g.fillStyle = gcss(BASE.wall, G); g.fillRect(bx0 - 2, -500, bx1 - bx0 + 4, fy + 502);
    g.fillStyle = gcss(BASE.side, G);
    g.beginPath(); g.moveTo(-500, -500); g.lineTo(bx0, -500); g.lineTo(bx0, fy); g.lineTo(-500, floorY(-500)); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(W + 500, -500); g.lineTo(bx1, -500); g.lineTo(bx1, fy); g.lineTo(W + 500, floorY(W + 500)); g.closePath(); g.fill();
    const fg = g.createLinearGradient(0, fy, 0, H + 200); fg.addColorStop(0, gcss(BASE.floor, G)); fg.addColorStop(1, gcss(BASE.floorFront, G));
    g.fillStyle = fg; g.beginPath(); g.moveTo(-500, floorY(-500)); g.lineTo(bx0, fy); g.lineTo(bx1, fy); g.lineTo(W + 500, floorY(W + 500)); g.lineTo(W + 500, H + 500); g.lineTo(-500, H + 500); g.closePath(); g.fill();
    const field = wideField(G, F);
    const cw = palCss(PAL.wall, G, 0.55), cs = palCss(PAL.wall, G, 0.55, 0.66), cf = palCss(PAL.floor, G, 0.6);
    flow(g, SEEDS_W, {
      cull: culler(cam), region: wideRegion,
      angle: field,
      color: (reg, sx, sy, r1) => zone(reg === 'wall' ? cw : reg === 'floor' ? cf : cs, sx, sy, r1, ph, reg === 'floor' ? 1.6 : 1),
      params: { wall: [40, 7, 15], lw: [36, 7, 14], rw: [36, 7, 14], floor: [30, 8, 13] },
    });
    // floorboard seams converging on the vanishing point, and the room's corner lines
    g.lineCap = 'round'; g.strokeStyle = gcss(tri('#1a0c08', '#200a06', '#060818'), G, 0.55);
    for (let k = -16; k <= 16; k++) {
      const dx = k * 64, dy = fy - VP[1];
      let prev = null;
      for (let i = 0; i <= 16; i++) {
        const s = 1 + i * 0.35, x = VP[0] + dx * s + 4 * Math.sin(i * 0.9 + ph * 1.5 + k), y = VP[1] + dy * s;
        if (y < floorY(x) - 1 || (y < 1436 && x < 960 && inPoly(x, y, BED_ALL))) { prev = null; continue; }
        if (prev) { g.lineWidth = 1.2 * s; g.beginPath(); g.moveTo(prev[0], prev[1]); g.lineTo(x, y); g.stroke(); }
        prev = [x, y];
      }
    }
    g.strokeStyle = 'rgba(22,8,10,0.75)'; g.lineWidth = 6;
    const edge = (pts, s) => { g.beginPath(); pts.forEach(([x, y], i) => { const xx = x + 3 * Math.sin(y * 0.01 + ph * 1.2 + s); i ? g.lineTo(xx, y) : g.moveTo(xx, y); }); g.stroke(); };
    edge(Array.from({ length: 14 }, (_, i) => [bx0, -60 + i * 95]), 1); edge(Array.from({ length: 14 }, (_, i) => [bx1, -60 + i * 95]), 2);
    edge([[bx1, fy], [bx1 + 40, fy + 44], [bx1 + 80, fy + 88], [bx1 + 160, fy + 178]], 3);
    wideBed(g, G, F);
    // Puberty: the figure's shadow looms on the wall behind it, larger as the anxiety grows
    const A = G.A, m = proj(548, 1110, 1.16 + 0.32 * A, 1.1 + 0.3 * A, 0.16 + 0.1 * A, 150 + 70 * A, -10);
    castShadow(g, cam, m, (s) => silhouetteWide(s, F), 0.66 + 0.18 * A, (cg) => { cg.rect(bx0, -500, bx1 - bx0, 975 + 500); BED_FOOT.forEach(([x, y], i) => (i ? cg.lineTo(x, y) : cg.moveTo(x, y))); cg.closePath(); }, 5, 0.5);
    roomLight(g, G, 560, 820, 230, 1150, [WR.moon[0], WR.moon[1], 520]);
  }
  function wideWindow(g, G) { landscape(g, G, { r: WR.win, hor: WR.hor, moon: WR.moon, k: 1, key: 'w' }); windowFrame(g, G, WR.win, WR.mull, WR.trans, 1); }
  function wideBed(g, G, F) {
    const ph = G.ph, poly = (pts) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
    g.fillStyle = gcss(BASE.under, G); g.fillRect(-160, 1240, 1115, 1432 - 1240);
    const fg = g.createLinearGradient(0, 1300, 0, 1432); fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(1, gcss(BASE.floor, G, 0.5)); g.fillStyle = fg; g.fillRect(-160, 1300, 1115, 132);
    g.fillStyle = gcss(BASE.wood, G); g.fillRect(-160, 1248, 1110, 52); g.fillRect(36, 1290, 22, 140);
    poly(BED_FOOT); g.fill(); g.fillRect(935, 962, 20, 470);
    g.fillStyle = gcss(BASE.sheet, G); poly(BED_TOP); g.fill();
    const hem = []; for (let x = 942; x >= -160; x -= 30) hem.push([x, 1252 + 8 * Math.sin(x * 0.05 + 1.3) + 4 * Math.sin(x * 0.13 + ph * 0.8)]);
    const drape = RIG.smooth([[-160, 1116], [935, 1118], [942, 1190], ...hem], true);
    const dg = g.createLinearGradient(0, 1118, 0, 1262); dg.addColorStop(0, gcss(BASE.sheet, G)); dg.addColorStop(1, gcss(BASE.sheetShade, G)); g.fillStyle = dg; g.fill(drape);
    const pil = RIG.smooth(PILLOW, true); g.fillStyle = gcss(BASE.pillow, G); g.fill(pil);
    const cS = palCss(PAL.sheet, G, 0.6), cD = palCss(PAL.sheet, G, 0.58, 0.8), cP = palCss(PAL.pillow, G, 0.6), cW = palCss(PAL.wood, G, 0.75);
    const seat = [548, 1110];
    const region = (x, y) => (x > 405 && x < 655 && y > 1062 && y < 1238 ? null : inPoly(x, y, PILLOW) ? 'pil' : inPoly(x, y, BED_FOOT) ? 'foot' : inPoly(x, y, BED_TOP) ? 'top' : inPoly(x, y, DRAPE) ? 'drape' : null);
    flow(g, SEEDS_BED, {
      region,
      angle: (x, y, reg) => {
        if (reg === 'drape') return PI / 2 + 0.22 * Math.sin(x * 0.025 + ph * 1.4);
        if (reg === 'pil') return 0.1 * Math.sin(x * 0.03 + ph) + 0.35 * Math.sin((y - 1032) * 0.05);
        if (reg === 'foot') return Math.atan2(y - 700, x - 540) + 0.15 * Math.sin(y * 0.05 + ph * 1.5);
        const a = 0.2 * Math.sin(x * 0.012 + y * 0.04 + ph * 1.3) + 0.08 * Math.sin(x * 0.04 - ph * 2), dx = x - seat[0], dy = y - seat[1], d = Math.hypot(dx, dy), w = Math.exp(-d / 170) * 0.8;
        const b = Math.atan2(dy, dx); return Math.atan2(Math.sin(a) * (1 - w) + Math.sin(b) * w, Math.cos(a) * (1 - w) + Math.cos(b) * w);
      },
      color: (reg, sx, sy, r1) => (reg === 'foot' ? cW[(r1 * cW.length) | 0] : zone(reg === 'drape' ? cD : reg === 'pil' ? cP : cS, sx, sy, r1, ph, 1.5)),
      params: { top: [24, 6, 10], drape: [16, 6, 10], pil: [14, 5, 9], foot: [16, 6, 9] },
    });
    // light and shade on the sheets: the far end and the dent under the figure in shadow, moonlight from the window on the near end
    g.save(); poly(BED_TOP); g.clip();
    blob(g, [548, 1112], 220, grade(BASE.sheetShade, G), 0.55);
    const sh = g.createLinearGradient(300, 0, 950, 0); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, gcss(tri('#2a1a20', '#3a1a14', '#0e1226'), G, 0.45)); g.fillStyle = sh; g.fillRect(300, 960, 660, 170);
    g.globalCompositeOperation = 'screen';
    const ml = g.createLinearGradient(0, 978, 0, 1116); ml.addColorStop(0, `rgba(176,186,222,${0.26 + 0.1 * G.C})`); ml.addColorStop(1, 'rgba(176,186,222,0.04)');
    g.fillStyle = ml; poly([[150, 978], [420, 978], [520, 1116], [200, 1116]]); g.fill();
    g.globalCompositeOperation = 'source-over'; g.strokeStyle = 'rgba(30,18,30,0.3)'; g.lineWidth = 9; g.beginPath(); g.moveTo(300, 978); g.lineTo(368, 1116); g.stroke();
    g.restore();
    g.save(); g.clip(pil); blob(g, [140, 1084], 120, grade(BASE.sheetShade, G), 0.55); blob(g, [120, 1000], 90, grade(tri('#f4ecd0', '#f8e8c0', '#d8e0f4'), G), 0.45); g.restore();
    g.save(); g.clip(drape); const dd = g.createLinearGradient(0, 1150, 0, 1262); dd.addColorStop(0, 'rgba(0,0,0,0)'); dd.addColorStop(1, gcss(tri('#1e1018', '#2a120e', '#080c1c'), G, 0.55)); g.fillStyle = dd; g.fillRect(-160, 1150, 1110, 115); g.restore();
    g.strokeStyle = gcss(tri('#5a4450', '#6a4038', '#2c3456'), G, 0.65); g.lineCap = 'round'; g.lineWidth = 4;
    [[[300, 1000], [420, 1050], [455, 1100]], [[700, 990], [660, 1050], [640, 1098]], [[820, 1010], [760, 1060], [690, 1100]], [[120, 1150], [128, 1200], [118, 1250]], [[790, 1135], [800, 1190], [792, 1250]], [[330, 1130], [336, 1190], [328, 1248]]].forEach((pts) => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); g.quadraticCurveTo(pts[1][0], pts[1][1] + 3 * Math.sin(ph * 1.3), pts[2][0], pts[2][1]); g.stroke(); });
    ink(g, pil, 4.2);
    const lineP = (pts, lw) => { g.lineWidth = lw; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); };
    g.strokeStyle = INK; g.globalAlpha = 0.85; lineP([[110, 975], [800, 975]], 4); lineP([[800, 876], [800, 975]], 5); lineP([[800, 876], [954, 968]], 6); lineP([[954, 968], [954, 1432]], 5); lineP([[-160, 1300], [940, 1300]], 4);
    g.globalAlpha = 1; ink(g, drape, 4.5);
  }
  function silhouetteWide(s, F) {
    const h = F.head;
    s.beginPath(); s.ellipse(h.x, h.y, h.hw * 0.53, h.hw * 0.65, h.tilt, 0, TAU); s.fill();
    s.beginPath(); F.shirt.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); s.fill();
    s.fillRect(h.x - 26, h.y + 60, 52, F.sy - h.y - 40);
    F.arms.forEach((A) => { s.lineWidth = 46; s.beginPath(); s.moveTo(A.S[0], A.S[1]); s.lineTo(A.E[0], A.E[1]); s.lineTo(A.Wr[0], A.Wr[1]); s.stroke(); });
    F.legs.forEach((L) => { s.lineWidth = 38; s.beginPath(); s.moveTo(L.knee[0], L.knee[1]); s.lineTo(L.ankle[0], L.ankle[1]); s.stroke(); });
  }
  // the wide figure: sits hunched on the edge of the bed in a slight 3/4 turn — a knee-length dark nightshirt draped over
  // the bent thighs, bare shins down to the floor, hands on the knees, head bowed; a gentle S-curve, never a symmetric tube
  const SHIRT_SEEDS_W = grid(-215, -50, 140, 420, 12, 31);
  function wideFig(t, G) {
    const q = Q(), al = ss(q.eyesWide - 0.25, q.eyesWide + 0.3, t), br = Math.sin(t * 1.65), sw = Math.sin(t * 0.55);
    const blink = 1 - Math.exp(-(((t - 2.62) / 0.06) ** 2));
    const head = { x: 522 + 3 * sw + 8 * al, y: 664 - 12 * al + 2.2 * Math.sin(t * 1.65 + 0.8), hw: 176, tilt: -0.14 + 0.1 * al + 0.02 * Math.sin(t * 0.83) };
    const sy = 846 - 2.5 * br - 8 * al, dx = 2 * sw;
    const shirt = [[502 + dx, sy - 32], [462 + dx, sy - 20], [430 + dx, sy + 4], [414 + dx, sy + 44], [409 + dx * 0.7, sy + 112], [418, 990], [430, 1050], [436, 1090],
      [400, 1128], [366, 1162], [352, 1194], [362, 1218], [392, 1228], [420, 1216], [454, 1224], [490, 1242], [528, 1240], [546, 1222],
      [560, 1194], [590, 1150], [624, 1112], [650, 1090], [656, 1040], [652, 980], [652 + dx * 0.7, sy + 112], [646 + dx, sy + 38], [628 + dx, sy + 6], [598 + dx, sy - 18], [556 + dx, sy - 32]];
    const legs = [{ knee: [390, 1210], ankle: [372, 1432], fa: PI / 2 + 0.42 }, { knee: [512, 1230], ankle: [494, 1454], fa: PI / 2 + 0.15 }];
    const arms = [{ S: [440 + dx, sy + 24], E: [404, 1012], Wr: [392, 1148], ang: PI / 2 + 0.06, sd: -1 }, { S: [622 + dx, sy + 20], E: [654, 1002], Wr: [570, 1152], ang: PI / 2 + 0.5, sd: 1 }];
    const E = exprAt([[0, EX.tired], [q.eyesWide, EX.alarm, 0.3]], t); E.open *= blink;
    return { head, sy, shirt, legs, arms, E };
  }
  function paintLeg(g, L, G, lw, t, i) {
    const ca = Math.cos(L.fa), sa = Math.sin(L.fa), nx = -sa, ny = ca, at = (u, v) => [L.ankle[0] + ca * u + nx * v, L.ankle[1] + sa * u + ny * v];
    blob(g, at(30, 0), 46, [8, 3, 6], 0.7);   // contact shadow on the floor
    const foot = RIG.smooth(wob([at(-12, -15), at(-12, 15), at(20, 19), at(42, 18), at(56, 7), at(55, -8), at(43, -19), at(20, -19)], 1.2, t, 60 + i * 9), true);
    g.fillStyle = gcss(BASE.skin, G); g.fill(foot);
    g.save(); g.clip(foot); blob(g, at(44, 4), 30, grade(BASE.skinHi, G), 0.45); blob(g, at(-2, 0), 24, grade(BASE.skinSh, G), 0.65); g.restore();
    ink(g, foot, lw * 0.8);
    g.strokeStyle = INK; g.lineWidth = 1.8; g.lineCap = 'round';
    for (let k = -1; k <= 1; k++) { const p0 = at(43, k * 8.5), p1 = at(54, k * 9); g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke(); }
    const mid = [lerp(L.knee[0], L.ankle[0], 0.4) - 6, lerp(L.knee[1], L.ankle[1], 0.4)];
    const tb = tube([L.knee, mid, L.ankle], (q) => 25 + 17 * (1 - q) + 8 * Math.sin(Math.min(1, q * 1.7) * PI));
    g.fillStyle = gcss(BASE.skin, G); g.fill(tb.fill);
    g.save(); g.clip(tb.fill);
    blob(g, [mid[0] + 22, mid[1]], 44, grade(BASE.skinSh, G), 0.7); blob(g, [mid[0] - 16, mid[1] - 30], 36, grade(BASE.skinHi, G), 0.5);
    blob(g, L.knee, 40, grade(BASE.skinDeep, G), 0.75);
    g.restore();
    ink(g, tb.a, lw); ink(g, tb.b, lw);
  }
  function paintWideFig(g, F, G) {
    const t = G.t, lw = 4.6, ph = G.ph, field = wideField(G, F);
    blob(g, [450, 1262], 150, [8, 3, 6], 0.55);   // the legs shade the drape and the floor behind them
    F.legs.forEach((L, i) => paintLeg(g, L, G, lw, t, i));
    const gp = RIG.smooth(wob(F.shirt, 3, t, 3), true);
    g.fillStyle = gcss(BASE.gown, G); g.fill(gp);
    g.save(); g.clip(gp);
    const knees = [[392, 1196], [512, 1214]];
    strokesIn(g, SHIRT_SEEDS_W, (u, v) => [548 + u, F.sy + v], (x, y) => {
      for (const kc of knees) { const dx = x - kc[0], dy = y - kc[1]; if (dx * dx + dy * dy < 1600) return Math.atan2(dy, dx) + PI / 2; }
      if (y > 1080) return 2.17 + 0.2 * Math.sin(x * 0.03 + y * 0.02 + ph * 1.6);
      return field(x, y, 'wall');
    }, palCss(PAL.gown, G, 0.62), 5.4, 7, 8);
    // moonlight from the window (upper left) on the shoulder, the top of the thighs and the knees; the far side in shadow
    const ml = grade(BASE.moonlit, G);
    blob(g, [428, F.sy + 40], 90, ml, 0.42); blob(g, [470, 1120], 80, ml, 0.3); blob(g, knees[0], 44, ml, 0.5); blob(g, knees[1], 40, ml, 0.38);
    blob(g, [600, 980], 110, [4, 4, 12], 0.45);
    g.strokeStyle = 'rgba(4,4,12,0.72)'; g.lineWidth = 4; g.lineCap = 'round';
    [[[548, 1098], [500, 1170], [452, 1226]], [[436, 1090], [548, 1112], [652, 1088]], [[600, 1120], [570, 1170], [548, 1220]], [[430, 1000], [470, 1060], [440, 1092]]].forEach((p) => { g.beginPath(); g.moveTo(p[0][0], p[0][1]); g.quadraticCurveTo(p[1][0] + 3 * Math.sin(ph * 1.6), p[1][1], p[2][0], p[2][1]); g.stroke(); });
    g.restore();
    ink(g, gp, lw);
    const hx = F.head.x, hy = F.head.y;
    const neck = RIG.smooth(wob([[hx - 23, hy + 80], [hx + 23, hy + 80], [hx + 28, F.sy - 24], [hx + 38, F.sy - 8], [hx - 38, F.sy - 8], [hx - 28, F.sy - 24]], 1.2, t, 80), true);
    g.fillStyle = gcss(BASE.skin, G); g.fill(neck); g.save(); g.clip(neck); blob(g, [hx + 6, hy + 104], 48, grade(BASE.skinDeep, G), 0.85); g.restore(); ink(g, neck, lw * 0.8);
    g.strokeStyle = INK; g.lineWidth = lw; g.beginPath(); g.moveTo(hx - 42, F.sy - 12); g.quadraticCurveTo(hx, F.sy + 8, hx + 42, F.sy - 12); g.stroke();
    drawHead(g, { ...F.head, E: F.E, G });
    F.arms.forEach((A) => {
      hand(g, { wr: A.Wr, ang: A.ang, L: 40, sd: A.sd, spread: 0.36, curl: 0.18, th: 0.55, fl: 0.82, fwk: 1.3 }, G, 1.9);
      const cuff = [A.Wr[0] + Math.cos(A.ang) * 5, A.Wr[1] + Math.sin(A.ang) * 5];
      paintSleeve(g, tube([A.S, A.E, cuff], (q) => lerp(50, 34, q)), G, lw);
    });
  }
  function wideSwirl(t, G, F) {
    const q = Q(), g1 = ss(q.swirlStart, q.TR_START + 0.1, t);
    const n = ss(q.swirlStart, q.swirlStart + 0.6, t) + 24 * Math.pow(ss(q.swirlStart + 0.55, q.TR_START + 0.05, t), 1.2);
    const R = lerp(130, 320, ss(q.swirlStart, q.TR_START - 0.2, t)) * (1 + 0.03 * G.b);
    return { cx: F.head.x + 6, cy: F.head.y - lerp(105, 200, g1), R, pitch: 0.4, layer: lerp(0.25, 0.6, g1), n, keep: null, unravel: 0, lift: 0, G, wMul: 13, alpha: 1 };
  }
  function camWide(t, G) {
    const e = 0.5 - 0.5 * Math.cos(PI * clamp(t / 6.32)), d = CAM.drift(t, 4, 0.4);
    return { x: 542 + 6 * e + d[0], y: 962 - 72 * e + d[1], z: 1 + 0.085 * e + 0.007 * G.b };
  }

  // ═══════════════════════ CLOSE-UP ═══════════════════════
  const CR = { win: [-90, 330, 250, 1330], hor: 850, moon: [92, 800, 40], mull: 118, trans: 610 };
  const SEEDS_C = grid(-170, -170, W + 170, H + 170, 30, 12), TORSO_SEEDS_C = grid(80, 1150, 1000, 2100, 26, 41);
  function closeFig(t, G) {
    const q = Q();
    const tre = clamp(ss(q.peak[0] - 0.3, q.peak[0] + 0.4, t) * (1 - ss(q.ease[0], q.ease[0] + 0.9, t)) + 0.9 * kick(t, q.hits[2], 0.04, 0.35) + 0.5 * kick(t, q.hits[1], 0.04, 0.3) + 0.35 * kick(t, q.hits[0], 0.04, 0.3));
    const sh = [tre * (3.4 * Math.sin(t * 47.1) + 2.2 * Math.sin(t * 29.3 + 1)), tre * 2.8 * Math.sin(t * 53.7 + 2)];
    const hu = EZ.inOut(ss(q.handsUp[0], q.handsUp[1], t)), hd = EZ.inOut(ss(q.handsDown[0], q.handsDown[1], t)), up = hu * (1 - hd);
    const lost = ss(q.eyesOpen - 0.2, q.eyesOpen + 0.5, t);
    const head = { x: 540 + 7 * Math.sin(t * 0.61) + sh[0], y: 842 + 6 * Math.sin(t * 1.05) + 12 * up - 10 * lost + sh[1], hw: 430, tilt: 0.022 * Math.sin(t * 0.7) - 0.03 * lost + sh[0] * 0.002 };
    const shY = 1268 - 22 * up + 3 * Math.sin(t * 1.4);
    const torso = [[478, shY - 46], [380, shY - 30], [262, shY + 2], [196, shY + 50], [160, shY + 152], [140, 1600], [120, 1800], [100, 2080], [980, 2080], [960, 1800], [940, 1600], [920, shY + 152], [884, shY + 50], [818, shY + 2], [700, shY - 30], [602, shY - 46]];
    // hands: below the frame → clutching the skull (palms on the temples, fingers up over the cranium) → sliding down the
    // sides of the face → resting low on the chest, apart, fingers loose (partly out of frame)
    const PRE = { wr: [318, 2210], el: [150, 2200], ang: -PI / 2 + 0.2, spread: 0.3, curl: 0.2, th: 2.2 };
    const UPP = { wr: [322, 994], el: [126, 1770], ang: -PI / 2 + 0.26, spread: 0.48 + 0.2 * tre, curl: 0.06 + 0.12 * tre, th: 2.3 };
    const MID = { wr: [258, 1390], el: [70, 1990], ang: -PI / 2 + 0.5, spread: 0.34, curl: 0.3, th: 2.0 };
    const REST = { wr: [262, 1880], el: [40, 2160], ang: -0.95, spread: 0.28, curl: 0.62, th: 1.5 };
    const mixP = (a, b, k) => ({ wr: lerpPt(a.wr, b.wr, k), el: lerpPt(a.el, b.el, k), ang: lerp(a.ang, b.ang, k), spread: lerp(a.spread, b.spread, k), curl: lerp(a.curl, b.curl, k), th: lerp(a.th, b.th, k) });
    const hdr = clamp((t - q.handsDown[0]) / (q.handsDown[1] - q.handsDown[0]));
    const L = mixP(mixP(mixP(PRE, UPP, hu), MID, ss(0, 0.55, hdr)), REST, ss(0.45, 1, hdr));
    L.wr[0] += -50 * Math.sin(PI * hu) * (1 - hd) + sh[0] * 1.3; L.wr[1] += sh[1] * 1.3 + 4 * Math.sin(t * 1.3) * (1 - 0.6 * hd);
    const Rr = { wr: [1080 - L.wr[0] + sh[0] * 0.4, L.wr[1] - sh[1] * 0.6 + 4 * Math.sin(t * 1.3 + 1)], el: [1080 - L.el[0], L.el[1]], ang: PI - L.ang, spread: L.spread, curl: L.curl, th: L.th };
    const arms = [{ ...L, S: [238, shY + 62], sd: 1 }, { ...Rr, S: [842, shY + 62], sd: -1 }];
    const KEYS = [[0, EX.wideC], [q.squeeze - 0.12, EX.squeeze, 0.3], [q.slits[0] + 0.1, EX.slits, 0.4], [q.slits[1] + 0.2, EX.peak, 0.4], [q.ease[0] + 0.35, EX.ease, 0.7], [q.eyesOpen + 0.05, EX.lost, 0.2], [16.3, EX.calm, 1.4]];
    const E = exprAt(KEYS, t);
    E.open *= 1 - Math.exp(-(((t - 16.05) / 0.06) ** 2));
    E.knot = Math.min(1, E.knot + 0.3 * G.h); E.teeth = Math.min(1, E.teeth + 0.2 * G.h);
    return { head, shY, torso, arms, up, hd, tre, E };
  }
  function silhouetteClose(s, F) {
    const h = F.head;
    s.beginPath(); s.ellipse(h.x, h.y, h.hw * 0.53, h.hw * 0.65, h.tilt, 0, TAU); s.fill();
    s.beginPath(); F.torso.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); s.fill();
    s.fillRect(h.x - 100, h.y + 150, 200, F.shY - h.y - 120);
    F.arms.forEach((A) => {
      s.lineWidth = 130; s.beginPath(); s.moveTo(A.S[0], A.S[1]); s.lineTo(A.el[0], A.el[1]); s.lineTo(A.wr[0], A.wr[1]); s.stroke();
      const c = [A.wr[0] + Math.cos(A.ang) * 120, A.wr[1] + Math.sin(A.ang) * 120]; s.beginPath(); s.ellipse(c[0], c[1], 85, 150, A.ang + PI / 2, 0, TAU); s.fill();
    });
  }
  // the close-up's one direction field: the wall's long vertical waves, bent into a vortex around the head as anxiety rises;
  // the robe is painted in the same field, so the figure belongs to the painting
  const closeField = (G, F) => { const V = { x: F.head.x, y: F.head.y - 260, k: G.vort, r: 640 }, ph = G.ph;
    return (x, y) => vortex(x, y, -PI / 2 + 0.42 * Math.sin(y * 0.007 + x * 0.0035 + ph * 2.0) + 0.18 * Math.sin(x * 0.02 - ph * 2.6) + 0.26 * Math.sin(x * 0.0047 - y * 0.0033 + ph * 1.1), V, 1); };
  function closeRoom(g, G, cam, F) {
    g.fillStyle = gcss(BASE.wall, G); g.fillRect(-500, -500, W + 1000, H + 1000);
    const cw = palCss(PAL.wall, G, 0.55), ph = G.ph, w = CR.win, field = closeField(G, F);
    flow(g, SEEDS_C, {
      cull: culler(cam), region: (x, y) => (x > w[0] - 12 && x < w[2] + 12 && y > w[1] - 12 && y < w[3] + 12 ? null : 'wall'),
      angle: field,
      color: (reg, sx, sy, r1) => zone(cw, sx, sy, r1, ph, 0.75), params: { wall: [42, 9, 19] },
    });
    const A = G.A, m = proj(540, 1900, 1.1 + 0.3 * A, 1.08 + 0.24 * A, 0.1 + 0.08 * A, 240 + 80 * A - 110 * G.C, 0);
    castShadow(g, cam, m, (s) => silhouetteClose(s, F), 0.5 + 0.22 * A - 0.12 * G.C, (cg) => { cg.rect(-500, -500, W + 1000, H + 1000); cg.rect(w[2] + 14, w[1] - 14, w[0] - w[2] - 28, w[3] - w[1] + 28); }, 5, 0.5);
    roomLight(g, G, 540, 780, 300, 1300, [CR.moon[0], CR.moon[1], 640]);
  }
  function closeWindow(g, G) { landscape(g, G, { r: CR.win, hor: CR.hor, moon: CR.moon, k: 1.7, key: 'c' }); windowFrame(g, G, CR.win, CR.mull, CR.trans, 1.6); }
  function paintTorso(g, F, G) {
    const field = closeField(G, F), t = G.t, lw = 10;
    const tp = RIG.smooth(wob(F.torso, 6, t, 5), true);
    g.fillStyle = gcss(BASE.gown, G); g.fill(tp);
    g.save(); g.clip(tp);
    strokesIn(g, TORSO_SEEDS_C, (u, v) => [u, v + (F.shY - 1268)], field, palCss(PAL.gown, G, 0.5), 13, 12, 15);
    blob(g, [540, F.shY + 40], 260, [6, 6, 16], 0.45);
    blob(g, [235, F.shY + 70], 190, grade(BASE.moonlit, G), 0.38); blob(g, [860, F.shY + 300], 260, [4, 4, 12], 0.4);
    g.restore();
    ink(g, tp, lw);
  }
  function paintCloseFig(g, F, G) {
    const t = G.t, lw = 10;
    F.arms.forEach((A) => paintSleeve(g, tube([A.S, lerpPt(A.S, A.el, 0.5), A.el], (q) => lerp(150, 128, q)), G, lw));
    const hx = F.head.x, hy = F.head.y;
    const neck = RIG.smooth(wob([[hx - 84, hy + 200], [hx + 84, hy + 200], [hx + 92, F.shY - 90], [hx + 120, F.shY - 20], [hx - 120, F.shY - 20], [hx - 92, F.shY - 90]], 3, t, 80), true);
    g.fillStyle = gcss(BASE.skin, G); g.fill(neck);
    g.save(); g.clip(neck); blob(g, [hx, hy + 300], 150, grade(BASE.skinDeep, G), 0.85); blob(g, [hx + 40, F.shY - 40], 120, grade(BASE.skinSh, G), 0.4);
    const nL = palCss(FACE_LIT, G, 0.4), nS = palCss(FACE_SH, G, 0.36); g.lineCap = 'round'; g.lineWidth = 13;
    for (let k = 0; k < 9; k++) { const x0 = hx - 84 + k * 21, c2 = k < 3 ? nL[k % nL.length] : nS[k % nS.length]; g.strokeStyle = c2; g.beginPath(); g.moveTo(x0, hy + 240); g.quadraticCurveTo(x0 + 8 * Math.sin(k + G.ph * 0.6), hy + 330, x0 + (x0 - hx) * 0.18, F.shY - 16); g.stroke(); }
    g.restore();
    ink(g, neck, lw * 0.85);
    const col = new Path2D(); col.moveTo(hx - 150, F.shY - 46); col.quadraticCurveTo(hx, F.shY + 40, hx + 150, F.shY - 46); col.lineTo(hx + 178, F.shY - 28); col.quadraticCurveTo(hx, F.shY + 74, hx - 178, F.shY - 28); col.closePath();
    g.fillStyle = gcss(tri('#2a3458', '#3a2c50', '#1e2a5a'), G); g.fill(col);
    g.strokeStyle = INK; g.lineWidth = lw; g.beginPath(); g.moveTo(hx - 150, F.shY - 46); g.quadraticCurveTo(hx, F.shY + 40, hx + 150, F.shY - 46); g.stroke();
    drawHead(g, { ...F.head, E: F.E, G });
    F.arms.forEach((A) => {
      if (A.wr[1] > 2060) return;
      hand(g, { wr: A.wr, ang: A.ang, L: 150, sd: A.sd, spread: A.spread, curl: A.curl, th: A.th }, G, 6.5);
      const cuff = [A.wr[0] + Math.cos(A.ang) * 16, A.wr[1] + Math.sin(A.ang) * 16];
      paintSleeve(g, tube([A.el, lerpPt(A.el, cuff, 0.55), cuff], (q) => lerp(128, 86, q)), G, lw);
    });
  }
  function closeSwirl(t, G, F) {
    const q = Q(), f = ss(q.fade[0] - 0.2, q.fade[1] - 0.2, t);
    const n = 26 + 16 * ss(q.handsUp[0], q.peak[0] + 0.5, t);
    const keep = lerp(60, 6, ss(q.fade[0] - 0.3, q.fade[1] - 0.5, t));
    const R = 470 * (1 + 0.06 * ss(q.slits[0], q.peak[0] + 1, t) + 0.08 * G.h + 0.025 * G.b) * (1 - 0.3 * f);
    return { cx: F.head.x * 0.4 + 540 * 0.6, cy: lerp(420, 470, f) + (F.head.y - 842) * 0.5, R, pitch: 0.4, layer: 0.6, n, keep, unravel: f, lift: 150 * f, G, wMul: 26, alpha: 1 - 0.2 * f };
  }
  function camClose(t, G) {
    const q = Q(), d = CAM.drift(t, 6, 1.3);
    const push = ss(q.peak[0] - 0.5, q.peak[1], t) * (1 - ss(q.hits[2] + 0.15, q.handsDown[1], t)), pull = ss(q.handsDown[0], q.fade[0] + 1.4, t);
    const z = (1 + 0.06 * push + 0.01 * G.b + 0.018 * kick(t, q.hits[0], 0.04, 0.4) + 0.024 * kick(t, q.hits[1], 0.04, 0.45) + 0.04 * kick(t, q.hits[2], 0.05, 0.6)) * (1 - 0.045 * pull);
    return { x: 540 + d[0], y: 962 - 70 * push + 25 * pull + d[1], z };
  }

  // ═══════════════════════ scenes ═══════════════════════
  // The room is painted into a half-resolution layer and upscaled once: thousands of overlapping wall strokes cost 4× less to
  // rasterize, and the background turns a touch softer than the figure, which brings him forward. Window, figure, swirl: full res.
  const halfLayer = (cam) => { const R = P.cached('u03munch_half', W / 2, H / 2, () => {}), r = R.getContext('2d'); r.reset(); r.fillStyle = '#1a0a0c'; r.fillRect(0, 0, W / 2, H / 2); r.setTransform(camMatrix(cam, 0.5)); return [R, r]; };
  const compositeHalf = (g, R) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(R, 0, 0, W / 2, H / 2, 0, 0, W, H); g.restore(); };
  const world = (cam) => { const S = P.scratch('u03munch_world'), g = S.getContext('2d'); g.reset(); g.fillStyle = '#1a0a0c'; g.fillRect(0, 0, W, H); g.setTransform(camMatrix(cam)); return [S, g]; };
  SCENES['u03_munch'] = {
    draw(c, lt, t) {
      const G = gradeOf(t), cam = camWide(t, G), [S, g] = world(cam), [R, r] = halfLayer(cam);
      const F = wideFig(t, G);
      wideRoom(r, G, cam, F);
      compositeHalf(g, R);
      wideWindow(g, G);
      const sw = wideSwirl(t, G, F), runs = swirlRuns(sw);
      coreGlow(g, sw, 1);
      drawRuns(g, runs, false, sw);
      paintWideFig(g, F, G);
      drawRuns(g, runs, true, sw);
      coreGlow(g, sw, 0.35);
      finish(c, S, G);
    },
  };
  SCENES['u03_munch_close'] = {
    draw(c, lt, t) {
      const G = gradeOf(t), cam = camClose(t, G), [S, g] = world(cam), [R, r] = halfLayer(cam);
      const F = closeFig(t, G);
      closeRoom(r, G, cam, F);
      paintTorso(r, F, G);
      compositeHalf(g, R);
      closeWindow(g, G);
      const sw = closeSwirl(t, G, F), runs = swirlRuns(sw);
      coreGlow(g, sw, 1);
      drawRings(g, G, { cx: 540, cy: 690, rx: 500, ry: 290, base: 46, lw: 8 });
      drawRuns(g, runs, false, sw);
      paintCloseFig(g, F, G);
      drawRuns(g, runs, true, sw);
      coreGlow(g, sw, 0.35);
      finish(c, S, G);
    },
  };
})();
