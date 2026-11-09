// FA · Persian (RTL) layer for the engine — NFP-Alvana addition, loaded after every other lib.
// 1) Canvas text that contains Arabic script is shaped with direction = 'rtl' (numbers, Latin words and punctuation
//    land in the right place: «3,000 خط», «NFP رو دارم», «می‌خوای؟»). textAlign left/center/right stay absolute.
// 2) TY.wrap never breaks inside a Persian word (the engine broke CJK text per character).
// 3) TY.charsIn animates Persian word by word, right to left (per-character drawing would cut the joins).
// 4) FA.isRtl / FA.runsX: helpers the grammars use to lay coloured runs (pre · key · post) right to left.
(() => {
const AR = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
const FA = window.FA = {};
FA.isRtl = s => AR.test(String(s || ''));

const P = CanvasRenderingContext2D.prototype;
if (!P.__faPatched) {
  for (const m of ['fillText', 'strokeText', 'measureText']) {
    const orig = P[m];
    P[m] = function (s, ...a) {
      if (typeof s === 'string' && AR.test(s) && this.direction !== 'rtl') {
        const d = this.direction; this.direction = 'rtl';
        try { return orig.call(this, s, ...a); } finally { this.direction = d; }
      }
      return orig.call(this, s, ...a);
    };
  }
  P.__faPatched = true;
}

// x of each run when a line made of runs (in reading order) is centred / right- / left-aligned at x.
// returns [{ s, x }] with x = the LEFT edge of each run (draw with align 'left').
FA.runsX = (c, runs, x, align, widthOf) => {
  const ws = runs.map(r => widthOf(r)), tot = ws.reduce((a, b) => a + b, 0);
  const rtl = runs.some(r => AR.test(r));
  let left = align === 'center' ? x - tot / 2 : align === 'right' ? x - tot : x;
  const out = [];
  if (!rtl) { for (let i = 0; i < runs.length; i++) { out.push({ s: runs[i], x: left }); left += ws[i]; } return out; }
  let right = left + tot;                                    // RTL: the first run sits at the right end
  for (let i = 0; i < runs.length; i++) { right -= ws[i]; out.push({ s: runs[i], x: right }); }
  return out;
};

if (window.TY) {
  const TY = window.TY;
  // words: Latin/digit tokens (engine) + Persian letters, ZWNJ and Persian punctuation stay together
  TY.wrap = (c, text, maxW, font) => {
    c.save(); if (font) c.font = font;
    const toks = String(text).match(/[A-Za-z0-9.,%+\-'’؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿‌‍]+\s*|\s+|./gu) || [], lines = []; let cur = '';
    for (const tk of toks) {
      if (tk === '\n') { lines.push(cur); cur = ''; continue; }
      if (cur && c.measureText(cur + tk.trimEnd()).width > maxW && !/^[，。、：；！？」』）》,.!?)،؛؟]$/.test(tk)) { lines.push(cur.trimEnd()); cur = tk.trimStart(); }
      else cur += tk;
    }
    if (cur.trim()) lines.push(cur.trimEnd());
    c.restore(); return lines;
  };
  // numbers with a Persian unit («61 سبک»): Persian words are drawn whole, runs in right-to-left visual order
  const tab0 = TY.tabular;
  TY.tabular = (c, str, x, y, o = {}) => {
    if (!AR.test(str)) return tab0(c, str, x, y, o);
    const dw = o.digitW || c.measureText('0').width;
    const runs = String(str).split(/([؀-ۿﭐ-﷿ﹰ-﻿‌]+(?:\s+[؀-ۿﭐ-﷿ﹰ-﻿‌]+)*)/)
      .filter(r => r !== '').reverse()
      .map(r => AR.test(r) ? r : r.replace(/^(\s*)([\s\S]*?)(\s*)$/, (m, a, b, c) => c + b + a));   // leading/trailing spaces flip sides
    const wOf = r => AR.test(r) ? c.measureText(r).width : [...r].reduce((a, ch) => a + (/[0-9]/.test(ch) ? dw : c.measureText(ch).width), 0);
    const ws = runs.map(wOf), total = ws.reduce((a, b) => a + b, 0), al = o.align || 'left';
    let cx = al === 'right' ? x - total : al === 'center' ? x - total / 2 : x;
    const ta = c.textAlign;
    runs.forEach((r, i) => { if (AR.test(r)) { c.textAlign = 'left'; c.fillText(r, cx, y); } else tab0(c, r, cx, y, { ...o, align: 'left', digitW: dw }); cx += ws[i]; });
    c.textAlign = ta; return total;
  };
  const charsIn0 = TY.charsIn;
  TY.charsIn = (c, str, x, y, lt, o = {}) => {
    if (!AR.test(str)) return charsIn0(c, str, x, y, lt, o);
    const { font, color, dur = 0.35, stagger = 0.04, dy = 24, scale0 = 1, align = 'left', ease = MO.cubicOut, shadow } = o;
    c.save(); c.font = font; c.textBaseline = 'alphabetic'; c.fillStyle = color; const A0 = c.globalAlpha;
    const words = String(str).split(/(\s+)/).filter(Boolean);
    const ws = words.map(w => c.measureText(w).width), tw = ws.reduce((a, b) => a + b, 0);
    let right = align === 'center' ? x + tw / 2 : align === 'right' ? x : x + tw;
    let k = 0;
    words.forEach((w, i) => {
      right -= ws[i]; if (/^\s+$/.test(w)) return;
      const q = U.clamp((lt - k * stagger * 2.5) / dur); k++;
      if (q > 0) {
        const e = ease(q); c.save(); c.globalAlpha = A0 * U.clamp(q * 2.2);
        c.translate(right + ws[i] / 2, y + dy * (1 - e)); const s = U.lerp(scale0, 1, e); c.scale(s, s);
        if (shadow) { c.shadowColor = shadow.color; c.shadowOffsetX = shadow.x || 0; c.shadowOffsetY = shadow.y || 0; c.shadowBlur = shadow.blur || 0; }
        c.textAlign = 'center'; c.fillText(w, 0, 0); c.restore();
      }
    });
    c.restore(); return tw;
  };
}
})();
