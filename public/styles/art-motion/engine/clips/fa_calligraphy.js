// Clip · خوشنویسی متحرک (fa_calligraphy) — NFP-Alvana original grammar for Persian text: a manuscript page
// (ivory paper with gold «afshan» flecks, an illuminated border, a slowly turning gold «toranj» medallion), and each
// line written right to left in Nastaliq by a reed pen, with a little ink bleed. Lines are ruled with gold «jadval».
// cues: title (small heading above the lines, Vazirmatn) · line (one verse / hemistich / sentence; written at «at»)
//       sign (the author under the last line: «— حافظ») · highlight (data.word: that word turns to gold leaf with a swash)
// data: { paper?: '#f3e7c8', ink?: '#1d140e', gold?: '#c9a04a', frame?: '#1f3a8a' }  ·  spec.theme (PAL) also works
// safe: lines are laid out between top and H−bottom. Portrait and landscape.
CLIPS.fa_calligraphy = (() => {
const { clamp, lerp } = U;
const TAU = Math.PI * 2, NAST = 'LXGWWenKai-500', SANS = 'PuHui-Bold';
let PAPER = null, LINES = [], COL = null, FLECKS = [];
function paper(W, H, u, col) {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  g.fillStyle = col.paper; g.fillRect(0, 0, W, H);
  const r = U.rng(9);
  for (let k = 0; k < 2600; k++) { g.fillStyle = `rgba(120,90,50,${r() * 0.05})`; g.fillRect(r() * W, r() * H, 1 + r() * 3, 1 + r() * 3); }
  const gr = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.75);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(90,60,20,.22)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // illuminated border: outer lapis band, gold rules, a running gold vine, corner medallions
  const m = 46 * u, b = 34 * u;
  g.fillStyle = col.frame; g.fillRect(0, 0, W, m + b); g.fillRect(0, H - m - b, W, m + b); g.fillRect(0, 0, m + b, H); g.fillRect(W - m - b, 0, m + b, H);
  g.strokeStyle = col.gold; g.lineWidth = 4 * u; g.strokeRect(m * 0.5, m * 0.5, W - m, H - m); g.lineWidth = 3 * u; g.strokeRect(m + b, m + b, W - 2 * (m + b), H - 2 * (m + b));
  g.lineWidth = 1.5 * u; g.strokeRect(m + b + 10 * u, m + b + 10 * u, W - 2 * (m + b + 10 * u), H - 2 * (m + b + 10 * u));
  g.strokeStyle = col.gold; g.lineWidth = 2.4 * u; g.fillStyle = col.gold;
  const vine = (L, at) => { g.beginPath(); for (let s = 0; s <= L; s += 4) { const [x, y] = at(s, Math.sin(s / (30 * u)) * 9 * u); s ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    for (let s = 15 * u; s < L; s += 60 * u) { const [x, y] = at(s, Math.sin(s / (30 * u)) * 9 * u); g.beginPath(); g.ellipse(x, y, 6 * u, 3 * u, Math.cos(s / (30 * u)), 0, TAU); g.fill(); } };
  const c0 = m * 0.5 + (m + b - m * 0.5) / 2;
  vine(W - 2 * c0, (s, d) => [c0 + s, c0 + d]); vine(W - 2 * c0, (s, d) => [c0 + s, H - c0 + d]);
  vine(H - 2 * c0, (s, d) => [c0 + d, c0 + s]); vine(H - 2 * c0, (s, d) => [W - c0 + d, c0 + s]);
  for (const [x, y] of [[c0, c0], [W - c0, c0], [c0, H - c0], [W - c0, H - c0]]) { g.fillStyle = col.ver; g.beginPath(); g.arc(x, y, 20 * u, 0, TAU); g.fill(); g.strokeStyle = col.gold; g.lineWidth = 3 * u; g.stroke(); }
  return cv;
}
function toranj(c, x, y, R, rot, col, a) {          // the gold medallion: 16 lobes, a lapis heart, a slow turn
  c.save(); c.translate(x, y); c.rotate(rot); c.globalAlpha = a;
  c.strokeStyle = col.gold; c.lineWidth = R * 0.012;
  for (const k of [1, 0.9, 0.62]) { c.beginPath(); for (let i = 0; i <= 96; i++) { const ang = i * TAU / 96, rr = R * k * (0.86 + 0.14 * Math.cos(ang * 16)); c.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr * 0.62); } c.closePath(); c.stroke(); }
  for (let i = 0; i < 16; i++) { const ang = i * TAU / 16; c.beginPath(); c.ellipse(Math.cos(ang) * R * 0.76, Math.sin(ang) * R * 0.76 * 0.62, R * 0.06, R * 0.03, ang, 0, TAU); c.stroke(); }
  c.restore();
}
function pen(c, x, y, s, col) {                       // a reed pen (qalam), nib at (x, y)
  c.save(); c.translate(x, y); c.rotate(-1.05);
  c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(10 * s, 8 * s, 230 * s, 16 * s);
  c.fillStyle = '#b98a4e'; c.beginPath(); c.moveTo(0, 0); c.lineTo(26 * s, -7 * s); c.lineTo(240 * s, -7 * s); c.lineTo(240 * s, 7 * s); c.lineTo(26 * s, 7 * s); c.closePath(); c.fill();
  c.fillStyle = '#8a6232'; for (let k = 40; k < 240; k += 34) c.fillRect(k * s, -7 * s, 3 * s, 14 * s);
  c.fillStyle = col.ink; c.beginPath(); c.moveTo(0, 0); c.lineTo(14 * s, -4 * s); c.lineTo(14 * s, 4 * s); c.closePath(); c.fill();
  c.restore();
}
return {
  fonts: [NAST],
  safe: true,
  init(ctx) {
    const { W, H, u, box } = ctx, d = ctx.data || {}, p = ctx.pal;
    COL = { paper: d.paper || (p ? p.bg : '#f3e7c8'), ink: d.ink || (p ? p.ink : '#1d140e'), gold: d.gold || (p ? p.accent : '#c9a04a'), frame: d.frame || (p ? p.accent2 : '#1f3a8a'), ver: '#b8352a', sub: p ? p.sub : '#6b5440' };
    PAPER = paper(W, H, u, COL);
    const r = U.rng(4); FLECKS = Array.from({ length: 140 }, () => ({ x: (0.1 + r() * 0.8) * W, y: (0.1 + r() * 0.8) * H, s: (2 + r() * 5) * u, ph: r() * TAU }));
    const g = document.createElement('canvas').getContext('2d');
    const lines = ctx.of('line'), inner = Math.min(box.w, W - 220 * u) * 0.86;
    const size = (ctx.portrait ? 92 : 100) * u, font = `${size}px "${NAST}"`;
    // every cue wraps at word boundaries; its wrapped lines are written one after another inside the cue's time
    const rows = []; lines.forEach((q, i) => { const parts = TY.wrap(g, q.text || '', inner, font), nxt = lines[i + 1] ? lines[i + 1].at : ctx.dur;
      const total = clamp([...(q.text || '')].length / 11, 0.9, Math.max(0.9, nxt - q.at - 0.15)), n = [...(q.text || '')].length || 1; let acc = 0;
      for (const ptxt of parts) { const d = total * [...ptxt].length / n; rows.push({ q: { ...q, text: ptxt, at: q.at + acc }, d }); acc += d; } });
    const lh = size * (ctx.portrait ? 2.0 : 1.95), title = ctx.of('title')[0], sign = ctx.of('sign')[0];
    const blockH = rows.length * lh + (title ? 150 * u : 0) + (sign ? 90 * u : 0);
    let y = box.y + (box.h - blockH) / 2 + (title ? 150 * u : 0) + lh * 0.62;
    LINES = rows.map(({ q, d }) => { g.font = font; const w = g.measureText(q.text || '').width; const L = { q, x: W / 2, y, w, size, dur: d }; y += lh; return L; });
    ctx._title = title; ctx._sign = sign; ctx._lineY0 = LINES.length ? LINES[0].y - lh * 0.62 : box.y + box.h / 2; ctx._lineY1 = y - lh * 0.62;
  },
  draw(c, t, ctx) {
    const { W, H, u } = ctx;
    if (!ctx.alpha) c.drawImage(PAPER, 0, 0);
    toranj(c, W / 2, (ctx._lineY0 + ctx._lineY1) / 2, Math.min(W, H) * 0.44, t * 0.05, COL, 0.32);
    // afshan: gold flecks that catch the light now and then
    for (const f of FLECKS) { const tw = 0.35 + 0.65 * Math.max(0, Math.sin(t * 1.3 + f.ph)) ** 6; c.fillStyle = COL.gold; c.globalAlpha = 0.25 + 0.6 * tw; c.beginPath(); c.moveTo(f.x, f.y - f.s); c.lineTo(f.x + f.s * 0.6, f.y); c.lineTo(f.x, f.y + f.s); c.lineTo(f.x - f.s * 0.6, f.y); c.fill(); }
    c.globalAlpha = 1;
    const T = ctx._title;
    if (T && t >= T.at) { const a = clamp((t - T.at) / 0.5), hw = Math.min(W * 0.62, 620 * u), hh = 86 * u, hy = ctx._lineY0 - 120 * u;
      c.save(); c.globalAlpha = a; c.translate(W / 2, hy + (1 - a) * 10 * u);
      const plate = new Path2D(); plate.moveTo(-hw / 2, 0); plate.quadraticCurveTo(-hw / 2 - 40 * u, -hh / 2, -hw / 2, -hh); plate.lineTo(hw / 2, -hh); plate.quadraticCurveTo(hw / 2 + 40 * u, -hh / 2, hw / 2, 0); plate.closePath();
      c.fillStyle = COL.frame; c.fill(plate); c.strokeStyle = COL.gold; c.lineWidth = 4 * u; c.stroke(plate);
      c.font = `${(ctx.portrait ? 40 : 36) * u}px "${SANS}"`; c.fillStyle = '#f7dc8a'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(T.text || '', 0, -hh / 2 + 2 * u); c.restore(); }
    let tip = null;
    for (const L of LINES) {
      const lt = t - L.q.at; if (lt < 0) continue;
      const p = MO.sineInOut(clamp(lt / L.dur)), right = L.x + L.w / 2 + 14 * u, left = L.x - L.w / 2 - 14 * u, rx = lerp(right, left, p);
      // the gold jadval under the line draws with it
      c.strokeStyle = COL.gold; c.lineWidth = 2 * u; c.globalAlpha = 0.85; c.beginPath(); c.moveTo(right, L.y + L.size * 0.55); c.lineTo(lerp(right, left, Math.min(1, p * 1.1)), L.y + L.size * 0.55); c.stroke(); c.globalAlpha = 1;
      c.save(); c.beginPath(); c.rect(rx, L.y - L.size * 1.6, right - rx + 4, L.size * 2.6); c.clip();
      c.font = `${L.size}px "${NAST}"`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.shadowColor = 'rgba(29,20,14,.35)'; c.shadowBlur = 2.5 * u; c.fillStyle = COL.ink; c.fillText(L.q.text || '', L.x, L.y);
      c.restore();
      if (p < 1) tip = [rx, L.y + Math.sin(lt * 18) * L.size * 0.22];
      // highlight: the word turns to gold leaf and gets a swash under it
      const hq = ctx.of('highlight').find(h => h.at >= L.q.at - 30 && h.data && h.data.word && (L.q.text || '').includes(h.data.word));
      if (hq && t >= hq.at) {
        const hp = clamp((t - hq.at) / 0.6), wd = hq.data.word, txt = L.q.text || '', at = txt.indexOf(wd);
        c.save(); c.font = `${L.size}px "${NAST}"`; const wPre = c.measureText(txt.slice(0, at)).width, wW = c.measureText(wd).width; c.restore();
        const xr = L.x + L.w / 2 - wPre, xl = xr - wW;
        c.save(); c.beginPath(); c.rect(lerp(xr, xl, MO.sineInOut(hp)), L.y - L.size * 1.6, xr - lerp(xr, xl, MO.sineInOut(hp)) + 6 * u, L.size * 2.6); c.clip();
        const gg = c.createLinearGradient(0, L.y - L.size, 0, L.y + L.size); gg.addColorStop(0, '#f7dc8a'); gg.addColorStop(0.5, COL.gold); gg.addColorStop(1, '#8f6a1e');
        c.font = `${L.size}px "${NAST}"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = gg; c.shadowColor = 'rgba(255,220,120,.6)'; c.shadowBlur = 12 * u; c.fillText(txt, L.x, L.y); c.restore();
        c.strokeStyle = COL.ver; c.lineWidth = 4 * u; c.lineCap = 'round'; c.beginPath();
        for (let k = 0; k <= 30 * hp; k++) { const q = k / 30, x = lerp(xr, xl, q), y = L.y + L.size * 0.85 + Math.sin(q * Math.PI) * L.size * 0.18; k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
      }
    }
    const Sg = ctx._sign;
    if (Sg && t >= Sg.at) { const a = clamp((t - Sg.at) / 0.6); c.save(); c.globalAlpha = a; c.font = `${(ctx.portrait ? 44 : 40) * u}px "${SANS}"`; c.fillStyle = COL.ver; c.textAlign = 'center'; c.fillText(Sg.text || '', W / 2, ctx._lineY1 + 70 * u); c.restore(); }
    if (tip) pen(c, tip[0], tip[1], u * 1.1, COL);
  },
};
})();
