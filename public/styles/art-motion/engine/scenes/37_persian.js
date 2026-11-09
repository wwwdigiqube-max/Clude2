// 37 · نگارگری ایرانی (Persian miniature) — NFP-Alvana original scene, in the engine's own conventions:
// pure function of time, seeded randomness, 1920×1080, everything code-drawn.
// Rules of the style: high horizon and stacked planes (no linear perspective), a gold sky with Chinese-cloud ribbons,
// flat jewel colours (lapis, turquoise, vermilion, gold, ivory), ornament everywhere (girih tiles, arabesque border),
// figures with moon faces, a cypress and a blossoming tree, a stream with a silver wave pattern, a Nastaliq cartouche.
// Motion: clouds drift, birds flap, petals fall, the stream flows, the cypress sways, steam rises from the cup,
// a gold glint runs round the border, the lantern flickers, and the verse writes itself right to left.
(() => {
const W = 1920, H = 1080, TAU = Math.PI * 2;
const C = {
  gold: '#d6a845', goldHi: '#f3d88a', goldDk: '#8f6a1e', lapis: '#1f3a8a', lapisDk: '#13245a', turq: '#2aa3a3', turqHi: '#7fd6cf',
  ver: '#c23a2b', verDk: '#7e2118', ivory: '#f3e7c8', rose: '#d97b8c', green: '#2f6b3d', greenHi: '#5d9a4c', greenDk: '#1d4528',
  hill: '#c9a6c8', hill2: '#e2c48e', brick: '#d9b48a', ink: '#2a1a12', skin: '#f2d6b8', water: '#9fc4d6', waterDk: '#5f8fae', white: '#fbf6ea',
};
const rng = U.rng;
const S = (a, b, x) => U.ss(a, b, x);
const P = (pts, close = true) => U.poly(pts, close);

// ---------- cached layers ----------
let tile = null, borderC = null, carpet = null;
function girihTile(sz) {             // one square of 8-point-star girih (two rotated squares + a cross between)
  const c = document.createElement('canvas'); c.width = sz; c.height = sz; const g = c.getContext('2d');
  g.fillStyle = C.ivory; g.fillRect(0, 0, sz, sz);
  const star = (x, y, r, fill, line) => { g.beginPath(); for (let i = 0; i < 16; i++) { const a = i * TAU / 16 - Math.PI / 2, rr = i % 2 ? r * 0.62 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = sz * 0.025; g.strokeStyle = line; g.stroke(); };
  for (const [x, y] of [[0, 0], [sz, 0], [0, sz], [sz, sz]]) star(x, y, sz * 0.32, C.lapis, C.goldDk);
  star(sz / 2, sz / 2, sz * 0.36, C.turq, C.goldDk);
  g.beginPath(); g.arc(sz / 2, sz / 2, sz * 0.1, 0, TAU); g.fillStyle = C.gold; g.fill();
  g.fillStyle = C.ver; for (const [x, y] of [[sz / 2, 0], [0, sz / 2], [sz, sz / 2], [sz / 2, sz]]) { g.beginPath(); g.arc(x, y, sz * 0.07, 0, TAU); g.fill(); }
  return c;
}
function makeBorder() {               // gold frame, lapis rules, an arabesque scroll running round
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = C.lapisDk; g.fillRect(0, 0, W, H);
  g.clearRect(70, 70, W - 140, H - 140);
  const band = (x0, y0, x1, y1, col, w) => { g.strokeStyle = col; g.lineWidth = w; g.strokeRect(x0, y0, x1 - x0, y1 - y0); };
  band(14, 14, W - 14, H - 14, C.gold, 6); band(62, 62, W - 62, H - 62, C.gold, 5); band(70, 70, W - 70, H - 70, C.ver, 3);
  // arabesque: a sine vine with leaves along the 48px band
  g.strokeStyle = C.gold; g.fillStyle = C.goldHi; g.lineWidth = 3.2;
  const vine = (L, at) => { g.beginPath(); for (let s = 0; s <= L; s += 4) { const [x, y] = at(s, Math.sin(s / 38) * 12); s ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    for (let s = 19; s < L; s += 76) { const [x, y] = at(s, Math.sin(s / 38) * 12); g.beginPath(); g.ellipse(x, y, 9, 4.5, Math.cos(s / 38), 0, TAU); g.fill(); } };
  vine(W - 76, (s, d) => [38 + s, 38 + d]); vine(W - 76, (s, d) => [38 + s, H - 38 + d]);
  vine(H - 76, (s, d) => [38 + d, 38 + s]); vine(H - 76, (s, d) => [W - 38 + d, 38 + s]);
  for (const [x, y] of [[38, 38], [W - 38, 38], [38, H - 38], [W - 38, H - 38]]) { g.fillStyle = C.ver; g.beginPath(); g.arc(x, y, 18, 0, TAU); g.fill(); g.strokeStyle = C.gold; g.stroke(); }
  return c;
}
function makeCarpet() {                // the flowered lawn: a flat green field with rows of tiny flowers
  const c = document.createElement('canvas'); c.width = W; c.height = 420; const g = c.getContext('2d');
  g.fillStyle = C.green; g.fillRect(0, 0, W, 420);
  const r = rng(37);
  for (let y = 14; y < 420; y += 30) for (let x = (y / 30 % 2) * 22; x < W; x += 44) {
    const jx = x + (r() - 0.5) * 10, jy = y + (r() - 0.5) * 8, col = [C.rose, C.ivory, C.goldHi, C.ver][Math.floor(r() * 4)];
    g.strokeStyle = C.greenHi; g.lineWidth = 2; g.beginPath(); g.moveTo(jx, jy + 9); g.lineTo(jx, jy); g.stroke();
    g.fillStyle = col; for (let k = 0; k < 5; k++) { const a = k * TAU / 5; g.beginPath(); g.arc(jx + Math.cos(a) * 4, jy + Math.sin(a) * 4, 3, 0, TAU); g.fill(); }
    g.fillStyle = C.gold; g.beginPath(); g.arc(jx, jy, 2, 0, TAU); g.fill();
  }
  return c;
}

// ---------- pieces ----------
function steam(c, t, x, y, h = 60) {   // two curling wisps from the cup (engine.js has U.steam; this scene stays standalone)
  c.save(); c.lineCap = 'round'; c.lineWidth = 2.5;
  for (let k = 0; k < 2; k++) { const ox = (k - 0.5) * 10, ph = t * 2.2 + k * 1.7 + 2;
    const g = c.createLinearGradient(0, y, 0, y - h); g.addColorStop(0, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.strokeStyle = g;
    c.beginPath(); for (let s = 0; s <= 24; s++) { const q = s / 24, yy = y - q * h, xx = x + ox + Math.sin(ph + q * 5) * 8 * q; s ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); }
  c.restore();
}
function sky(c, t) {
  const g = c.createLinearGradient(0, 70, 0, 380); g.addColorStop(0, '#e8c46a'); g.addColorStop(1, C.gold);
  c.fillStyle = g; c.fillRect(70, 70, W - 140, 330);
  // Chinese-cloud (tchi) ribbons: curling white/blue bands drifting slowly
  const r = rng(11);
  for (let k = 0; k < 5; k++) {
    const x0 = ((r() * W + t * (14 + k * 4)) % (W + 600)) - 300, y0 = 120 + r() * 170, s = 0.8 + r() * 0.6;
    c.save(); c.translate(x0, y0); c.scale(s, s);
    c.lineCap = 'round';
    for (const [col, w, dy] of [[C.lapis, 16, 0], [C.white, 9, 0]]) {
      c.strokeStyle = col; c.lineWidth = w; c.beginPath();
      for (let q = 0; q <= 60; q++) { const u = q / 60, x = u * 260, y = Math.sin(u * TAU * 1.5 + t * 0.6 + k) * 16 + dy; q ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.stroke();
      c.beginPath(); c.arc(0, 0, 18, Math.PI * 0.2, Math.PI * 1.9); c.stroke(); c.beginPath(); c.arc(260, Math.sin(TAU * 1.5 + t * 0.6 + k) * 16, 14, -Math.PI * 0.8, Math.PI * 0.9); c.stroke();
    }
    c.restore();
  }
}
function hills(c, t) {
  for (const [y, col, amp, fr, ph] of [[330, C.hill, 50, 0.004, 1], [380, C.hill2, 36, 0.006, 3]]) {
    c.fillStyle = col; c.beginPath(); c.moveTo(70, H);
    for (let x = 70; x <= W - 70; x += 10) c.lineTo(x, y - Math.abs(Math.sin(x * fr + ph)) * amp - Math.sin(x * fr * 3.1) * amp * 0.25);
    c.lineTo(W - 70, H); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(80,40,60,.35)'; c.lineWidth = 2; c.stroke();
  }
  // little rounded shrubs on the hills
  const r = rng(5);
  for (let k = 0; k < 14; k++) { const x = 120 + r() * 1000, y = 330 + r() * 70; c.fillStyle = r() < 0.5 ? C.greenHi : C.green; c.beginPath(); c.arc(x, y, 14 + r() * 10, Math.PI, 0); c.fill(); }
}
function cypress(c, x, y, h, t, seed) {
  const sw = Math.sin(t * 0.9 + seed) * 0.025;
  c.save(); c.translate(x, y); c.rotate(sw);
  c.fillStyle = C.greenDk; c.beginPath(); c.moveTo(0, -h);
  for (let q = 0; q <= 1; q += 0.05) c.lineTo(Math.sin(q * Math.PI) * h * 0.13 * (1 - q * 0.25) + Math.sin(q * 40) * 3, -h + q * h);
  for (let q = 1; q >= 0; q -= 0.05) c.lineTo(-Math.sin(q * Math.PI) * h * 0.13 * (1 - q * 0.25) - Math.sin(q * 40 + 1) * 3, -h + q * h);
  c.closePath(); c.fill();
  c.strokeStyle = C.green; c.lineWidth = 3; for (let q = 0.12; q < 0.95; q += 0.09) { c.beginPath(); c.arc(0, -h + q * h, h * 0.08, Math.PI * 0.15, Math.PI * 0.85); c.stroke(); }
  c.fillStyle = C.ink; c.fillRect(-5, -6, 10, 18);
  c.restore();
}
function blossomTree(c, x, y, t) {
  c.save(); c.translate(x, y);
  c.strokeStyle = '#5a3a24'; c.lineCap = 'round';
  const br = (x0, y0, a, L, w, d) => { if (d > 5) return; const x1 = x0 + Math.cos(a) * L, y1 = y0 + Math.sin(a) * L; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2 + 12, (y0 + y1) / 2, x1, y1); c.stroke();
    br(x1, y1, a - 0.45 + Math.sin(d * 3.1) * 0.15, L * 0.72, w * 0.66, d + 1); br(x1, y1, a + 0.4 + Math.cos(d * 2.3) * 0.15, L * 0.68, w * 0.62, d + 1); };
  br(0, 0, -Math.PI / 2 - 0.08, 150, 18, 0);
  // blossoms: clusters that breathe a little
  const r = rng(21);
  for (let k = 0; k < 120; k++) { const a = r() * TAU, d = Math.sqrt(r()) * 190, bx = Math.cos(a) * d * 1.1, by = -300 + Math.sin(a) * d * 0.62, s = 6 + r() * 6 + Math.sin(t * 2 + k) * 0.8;
    c.fillStyle = r() < 0.6 ? C.white : C.rose; for (let p = 0; p < 5; p++) { const pa = p * TAU / 5 + k; c.beginPath(); c.arc(bx + Math.cos(pa) * s * 0.55, by + Math.sin(pa) * s * 0.55, s * 0.42, 0, TAU); c.fill(); }
    c.fillStyle = C.gold; c.beginPath(); c.arc(bx, by, s * 0.2, 0, TAU); c.fill(); }
  c.restore();
}
function petals(c, t) {
  const r = rng(77);
  for (let k = 0; k < 26; k++) { const x0 = 230 + r() * 420, sp = 40 + r() * 40, ph = r() * 30;
    const y = 380 + ((t * sp + ph * 30) % 560), x = x0 + Math.sin(t * 1.5 + k) * 30 + (y - 380) * 0.25;
    c.save(); c.translate(x, y); c.rotate(t * 2 + k); c.fillStyle = r() < 0.5 ? C.white : C.rose; c.beginPath(); c.ellipse(0, 0, 7, 4, 0, 0, TAU); c.fill(); c.restore(); }
}
function stream(c, t) {
  const path = q => [70 + q * 1100, 900 + Math.sin(q * 5.5) * 40 + q * 40];
  c.save(); c.lineCap = 'round';
  c.strokeStyle = C.waterDk; c.lineWidth = 64; c.beginPath(); for (let q = 0; q <= 1; q += 0.01) { const [x, y] = path(q); q ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
  c.strokeStyle = C.water; c.lineWidth = 52; c.stroke();
  // the silver wave pattern flows downstream
  c.strokeStyle = C.white; c.lineWidth = 3;
  for (let k = 0; k < 26; k++) { const q = ((k / 26 + t * 0.03) % 1), [x, y] = path(q);
    c.beginPath(); c.arc(x, y - 4, 10, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); c.beginPath(); c.arc(x + 14, y + 8, 8, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
  c.restore();
}
function birds(c, t) {
  for (let k = 0; k < 4; k++) {
    const x = ((t * (70 + k * 18) + k * 420) % (W + 300)) - 150, y = 170 + k * 38 + Math.sin(t * 1.4 + k) * 14, flap = Math.floor(t * 8 + k) % 2;
    c.save(); c.translate(x, y); c.strokeStyle = C.ink; c.fillStyle = C.lapis; c.lineWidth = 3;
    c.beginPath(); c.ellipse(0, 0, 14, 6, 0, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(-4, 0); c.quadraticCurveTo(-10, flap ? -24 : 10, -22, flap ? -20 : 14); c.moveTo(4, 0); c.quadraticCurveTo(10, flap ? -24 : 10, 22, flap ? -20 : 14); c.stroke();
    c.fillStyle = C.ver; c.beginPath(); c.moveTo(14, -1); c.lineTo(22, 1); c.lineTo(14, 3); c.fill();
    c.restore();
  }
}
function pavilion(c, t) {
  const x0 = 1130, x1 = 1790, y0 = 210, y1 = 930;
  // the brick body and a girih tile dado
  c.fillStyle = C.brick; c.fillRect(x0, y0 + 90, x1 - x0, y1 - y0 - 90);
  c.save(); c.beginPath(); c.rect(x0, y0 + 90, x1 - x0, y1 - y0 - 90); c.clip();
  c.fillStyle = c.createPattern(tile, 'repeat'); c.fillRect(x0, y1 - 210, x1 - x0, 210);
  c.restore();
  c.strokeStyle = C.goldDk; c.lineWidth = 4; c.strokeRect(x0, y0 + 90, x1 - x0, y1 - y0 - 90);
  // crenellated top and a small dome
  c.fillStyle = C.turq; c.fillRect(x0 - 16, y0 + 70, x1 - x0 + 32, 26);
  c.fillStyle = C.lapis; for (let x = x0 - 10; x < x1 + 10; x += 46) { c.beginPath(); c.moveTo(x, y0 + 72); c.lineTo(x + 18, y0 + 40); c.lineTo(x + 36, y0 + 72); c.fill(); }
  c.fillStyle = C.turq; c.beginPath(); c.ellipse((x0 + x1) / 2, y0 + 40, 90, 110, 0, Math.PI, 0); c.fill(); c.strokeStyle = C.goldDk; c.stroke();
  c.fillStyle = C.gold; c.beginPath(); c.moveTo((x0 + x1) / 2 - 6, y0 - 70); c.lineTo((x0 + x1) / 2 + 6, y0 - 70); c.lineTo((x0 + x1) / 2, y0 - 110); c.fill();
  // the iwan: a pointed arch with a lapis frame and a turquoise inner field
  const ax = (x0 + x1) / 2, aw = 330, ay = y0 + 170, ab = y1 - 60;
  const arch = (w, top) => { const p = new Path2D(); p.moveTo(ax - w / 2, ab); p.lineTo(ax - w / 2, top + w * 0.45); p.quadraticCurveTo(ax - w / 2, top, ax, top - w * 0.12); p.quadraticCurveTo(ax + w / 2, top, ax + w / 2, top + w * 0.45); p.lineTo(ax + w / 2, ab); p.closePath(); return p; };
  c.fillStyle = C.lapis; c.fill(arch(aw + 60, ay - 40)); c.strokeStyle = C.gold; c.lineWidth = 5; c.stroke(arch(aw + 60, ay - 40));
  c.fillStyle = '#2a1e3a'; c.fill(arch(aw, ay));
  // hanging lantern, flickering
  const fl = 0.75 + 0.25 * Math.sin(t * 13) * Math.sin(t * 7.3 + 1);
  c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(ax, ay - 30); c.lineTo(ax, ay + 70); c.stroke();
  const gl = c.createRadialGradient(ax, ay + 92, 4, ax, ay + 92, 120 * fl); gl.addColorStop(0, `rgba(255,214,130,${0.55 * fl})`); gl.addColorStop(1, 'rgba(255,214,130,0)');
  c.fillStyle = gl; c.beginPath(); c.arc(ax, ay + 92, 130, 0, TAU); c.fill();
  c.fillStyle = C.gold; c.beginPath(); c.moveTo(ax - 18, ay + 74); c.lineTo(ax + 18, ay + 74); c.lineTo(ax + 12, ay + 112); c.lineTo(ax - 12, ay + 112); c.closePath(); c.fill();
  c.fillStyle = `rgba(255,236,170,${fl})`; c.beginPath(); c.arc(ax, ay + 92, 8, 0, TAU); c.fill();
  // spandrel tile panels
  c.save(); c.globalAlpha = 0.95; c.fillStyle = c.createPattern(tile, 'repeat');
  c.fillRect(x0 + 24, y0 + 120, ax - aw / 2 - 30 - 40 - x0 - 24 + 10, 230); c.fillRect(ax + aw / 2 + 40, y0 + 120, x1 - 24 - (ax + aw / 2 + 40), 230); c.restore();
  c.strokeStyle = C.goldDk; c.lineWidth = 3; c.strokeRect(x0 + 24, y0 + 120, ax - aw / 2 - 40 - x0 - 24, 230); c.strokeRect(ax + aw / 2 + 40, y0 + 120, x1 - 24 - (ax + aw / 2 + 40), 230);
  return { ax, ab, aw };
}
// a seated lady in the iwan (moon face, white scarf, vermilion robe with gold pattern) raising a cup
function lady(c, ax, ab, t) {
  const x = ax, y = ab - 20, lift = 0.5 + 0.5 * Math.sin(t * 0.8);
  c.save(); c.translate(x, y);
  // carpet under her
  c.fillStyle = C.ver; c.fillRect(-150, -12, 300, 24); c.strokeStyle = C.gold; c.lineWidth = 3; c.strokeRect(-150, -12, 300, 24);
  // robe (seated, kneeling): a broad rounded triangle
  c.fillStyle = C.ver; c.beginPath(); c.moveTo(-110, -10); c.quadraticCurveTo(-90, -150, -30, -200); c.lineTo(30, -200); c.quadraticCurveTo(95, -150, 110, -10); c.closePath(); c.fill();
  c.strokeStyle = C.verDk; c.lineWidth = 3; c.stroke();
  c.fillStyle = C.gold; const r = rng(3); for (let k = 0; k < 40; k++) { const px = (r() - 0.5) * 180, py = -10 - r() * 180; if (Math.abs(px) < 100 - (-py) * 0.35) { c.beginPath(); c.arc(px, py, 3, 0, TAU); c.fill(); } }
  // inner gown and sash
  c.fillStyle = C.turq; c.beginPath(); c.moveTo(-26, -196); c.lineTo(26, -196); c.lineTo(36, -60); c.lineTo(-36, -60); c.closePath(); c.fill();
  c.fillStyle = C.gold; c.fillRect(-40, -110, 80, 12);
  // the arm with the cup
  const hx = 60 + lift * 6, hy = -150 - lift * 34;
  c.strokeStyle = C.ver; c.lineWidth = 26; c.lineCap = 'round'; c.beginPath(); c.moveTo(30, -180); c.quadraticCurveTo(70, -140, hx, hy); c.stroke();
  c.fillStyle = C.skin; c.beginPath(); c.arc(hx, hy, 10, 0, TAU); c.fill();
  c.fillStyle = C.gold; c.beginPath(); c.moveTo(hx - 14, hy - 26); c.lineTo(hx + 14, hy - 26); c.quadraticCurveTo(hx + 10, hy - 6, hx, hy - 6); c.quadraticCurveTo(hx - 10, hy - 6, hx - 14, hy - 26); c.fill();
  steam(c, t, hx, hy - 30);
  // head: moon face, white scarf, small crown
  c.fillStyle = C.white; c.beginPath(); c.ellipse(0, -232, 50, 58, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(80,60,40,.35)'; c.lineWidth = 2; c.stroke();
  c.fillStyle = C.skin; c.beginPath(); c.ellipse(4, -228, 33, 38, 0, 0, TAU); c.fill();
  c.fillStyle = C.ink; c.beginPath(); c.ellipse(-8, -232, 6, 2.6, 0.1, 0, TAU); c.fill(); c.beginPath(); c.ellipse(16, -232, 6, 2.6, -0.1, 0, TAU); c.fill();
  c.strokeStyle = C.ink; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-16, -242); c.quadraticCurveTo(4, -250, 24, -242); c.stroke();
  c.fillStyle = C.ver; c.beginPath(); c.ellipse(4, -210, 6, 3, 0, 0, TAU); c.fill();
  c.fillStyle = C.gold; c.beginPath(); c.moveTo(-22, -282); c.lineTo(-12, -306); c.lineTo(0, -286); c.lineTo(12, -306); c.lineTo(22, -282); c.closePath(); c.fill();
  c.restore();
}
// an octagonal pool (howz) with a fountain: jets rise and fall, rings spread on the water
function pool(c, x, y, t) {
  const rx = 150, ry = 62, oct = (k, a, b) => { const p = new Path2D(); for (let i = 0; i < 8; i++) { const ang = i * TAU / 8 + TAU / 16; p.lineTo(x + Math.cos(ang) * a * k, y + Math.sin(ang) * b * k); } p.closePath(); return p; };
  c.fillStyle = C.ivory; c.fill(oct(1.16, rx, ry)); c.strokeStyle = C.goldDk; c.lineWidth = 3; c.stroke(oct(1.16, rx, ry));
  c.fillStyle = C.turq; c.fill(oct(1, rx, ry)); c.strokeStyle = C.lapis; c.lineWidth = 3; c.stroke(oct(1, rx, ry));
  c.save(); c.clip(oct(1, rx, ry));
  c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 2;
  for (let k = 0; k < 3; k++) { const q = ((t * 0.45 + k / 3) % 1); c.globalAlpha = 1 - q; c.beginPath(); c.ellipse(x, y, 20 + q * 130, 8 + q * 52, 0, 0, TAU); c.stroke(); }
  c.globalAlpha = 1; c.fillStyle = '#e8944a'; for (let k = 0; k < 3; k++) { const a = t * 0.7 + k * 2.1, fx = x + Math.cos(a) * 90, fy = y + Math.sin(a) * 34; c.save(); c.translate(fx, fy); c.rotate(a + Math.PI / 2); c.beginPath(); c.ellipse(0, 0, 11, 5, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(-10, 0); c.lineTo(-18, -6); c.lineTo(-18, 6); c.fill(); c.restore(); }
  c.restore();
  // the fountain: a gold spout and arcs of water drops
  c.fillStyle = C.gold; c.fillRect(x - 6, y - 26, 12, 26); c.beginPath(); c.arc(x, y - 28, 9, 0, TAU); c.fill();
  c.fillStyle = 'rgba(235,248,255,.9)';
  for (let j = 0; j < 6; j++) { const a = j * TAU / 6 + 0.3; for (let k = 0; k < 9; k++) { const q = ((t * 1.6 + k / 9) % 1), px = x + Math.cos(a) * 70 * q, py = y - 30 - Math.sin(Math.PI * q) * 70 + Math.sin(a) * 26 * q; c.beginPath(); c.arc(px, py, 3.2 * (1 - q * 0.5), 0, TAU); c.fill(); } }
}
// the orange-and-white cat of the series, at the foot of the steps, tail swaying
function cat(c, x, y, t) {
  c.save(); c.translate(x, y);
  const tw = Math.sin(t * 2.2) * 0.35;
  c.strokeStyle = '#e08a3c'; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath(); c.moveTo(40, -10); c.quadraticCurveTo(90, -20 + tw * 30, 80 + tw * 40, -70); c.stroke();
  c.fillStyle = '#e8944a'; c.beginPath(); c.ellipse(0, -40, 48, 44, 0, 0, TAU); c.fill();
  c.fillStyle = C.white; c.beginPath(); c.ellipse(-8, -26, 24, 24, 0, 0, TAU); c.fill();
  c.fillStyle = '#e8944a'; c.beginPath(); c.arc(-14, -102, 34, 0, TAU); c.fill();
  c.beginPath(); c.moveTo(-42, -118); c.lineTo(-38, -148); c.lineTo(-20, -128); c.fill(); c.beginPath(); c.moveTo(-6, -130); c.lineTo(10, -150); c.lineTo(14, -120); c.fill();
  const bl = (Math.floor(t * 1.3) % 5 === 0) && (t * 1.3 % 1) < 0.15;
  c.fillStyle = C.ink; if (bl) { c.fillRect(-30, -104, 12, 3); c.fillRect(-8, -104, 12, 3); } else { c.beginPath(); c.ellipse(-24, -104, 4, 6, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(-2, -104, 4, 6, 0, 0, TAU); c.fill(); }
  c.fillStyle = C.rose; c.beginPath(); c.arc(-13, -92, 4, 0, TAU); c.fill();
  c.restore();
}
// the Nastaliq cartouche: the verse writes itself right to left (a soft wipe), on ivory with a gold rule
function cartouche(c, t) {
  const x = 150, y = 96, w = 760, h = 150;
  c.save();
  c.fillStyle = C.ivory; c.fillRect(x, y, w, h); c.strokeStyle = C.gold; c.lineWidth = 6; c.strokeRect(x, y, w, h); c.strokeStyle = C.lapis; c.lineWidth = 2; c.strokeRect(x + 10, y + 10, w - 20, h - 20);
  const verse = window.PERSIAN_VERSE || 'دیدار می‌نمایی و پرهیز می‌کنی';
  const p = S(0.6, 3.6, t % 14);
  c.beginPath(); c.rect(x + w - 30 - (w - 60) * p, y, (w - 60) * p + 30, h); c.clip();
  c.fillStyle = C.ink; c.font = '58px "LXGWWenKai-500"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(verse, x + w / 2, y + h / 2 + 6);
  c.restore();
}
function glint(c, t) {            // a gold glint running round the frame
  const per = 2 * (W + H), d = (t * 520) % per;
  const at = s => s < W ? [s, 38] : s < W + H ? [W - 38, s - W] : s < 2 * W + H ? [W - (s - W - H), H - 38] : [38, H - (s - 2 * W - H)];
  const [gx, gy] = at(d), g = c.createRadialGradient(gx, gy, 0, gx, gy, 90);
  g.addColorStop(0, 'rgba(255,246,200,.85)'); g.addColorStop(1, 'rgba(255,246,200,0)');
  c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(gx - 90, gy - 90, 180, 180); c.restore();
}

SCENES['37_persian'] = {
  init() { tile = girihTile(96); borderC = makeBorder(); carpet = makeCarpet(); },
  draw(c, lt, t) {
    c.save(); c.beginPath(); c.rect(70, 70, W - 140, H - 140); c.clip();
    sky(c, lt); birds(c, lt); hills(c, lt);
    c.drawImage(carpet, 0, 620);
    c.save(); c.globalAlpha = 0.18; c.fillStyle = C.greenDk; c.fillRect(70, 620, W - 140, 6); c.restore();
    cypress(c, 210, 880, 560, lt, 0); cypress(c, 1000, 820, 420, lt, 2);
    blossomTree(c, 470, 860, lt);
    const pv = pavilion(c, lt);
    lady(c, pv.ax, pv.ab, lt);
    stream(c, lt);
    pool(c, 730, 760, lt);
    cat(c, 1010, 990, lt);
    petals(c, lt);
    cartouche(c, lt);
    c.restore();
    c.drawImage(borderC, 0, 0);
    glint(c, lt);
  },
};
})();
