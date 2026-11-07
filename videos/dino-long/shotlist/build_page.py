import json, os, html
H = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(H, "part1.json")))
data = json.dumps(d, ensure_ascii=False).replace("</", "<\\/")
page = r'''<title>شات‌های دایناسور · بخش ۱</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;800&family=JetBrains+Mono:wght@400&display=swap">
<style>
/* Layout: one column of shot cards, sticky filter bar; prompts are LTR code blocks with copy buttons */
:root{
  --bg:#f3f1ec; --surface:#ffffff; --ink:#1d1f1a; --muted:#6b6d63; --line:#dedbd2;
  --rust:#b0532a; --rust-soft:#f4e3d9; --code:#f6f5f1; --ok:#3f7a4b;
  --f-body:"Vazirmatn", Tahoma, sans-serif; --f-mono:"JetBrains Mono", ui-monospace, Menlo, monospace;
}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){
  --bg:#141613; --surface:#1d201b; --ink:#ebe9e2; --muted:#9a9c91; --line:#30332c;
  --rust:#e07a4a; --rust-soft:#3a2418; --code:#181a16; --ok:#7fbf8c; color-scheme:dark}}
:root[data-theme="dark"]{--bg:#141613; --surface:#1d201b; --ink:#ebe9e2; --muted:#9a9c91; --line:#30332c;
  --rust:#e07a4a; --rust-soft:#3a2418; --code:#181a16; --ok:#7fbf8c; color-scheme:dark}
body{background:var(--bg);color:var(--ink);font-family:var(--f-body);font-size:15px;line-height:1.75;direction:rtl}
.wrap{max-width:760px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:20px 60px}
h1{font-size:1.45rem;font-weight:800;margin:0 0 4px;text-wrap:balance}
.sub{color:var(--muted);margin:0 0 14px}
.stats{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.stat{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:6px 12px;font-size:.88rem}
.stat b{font-variant-numeric:tabular-nums}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:10;background:var(--bg)}
.bar{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:var(--bg);padding-block:8px;display:flex;gap:6px;flex-wrap:wrap;border-bottom:1px solid var(--line);margin-bottom:14px}
.bar button{font:inherit;font-size:.85rem;border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:999px;padding:4px 12px;cursor:pointer}
.bar button[aria-pressed="true"]{background:var(--rust);border-color:var(--rust);color:#fff}
.bar .prog{margin-inline-start:auto;color:var(--muted);font-size:.85rem;align-self:center;font-variant-numeric:tabular-nums}
h2{font-size:1.05rem;margin:24px 0 10px;color:var(--rust)}
.card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin-bottom:10px;display:grid;gap:6px;min-width:0}
.card.done{opacity:.55}
.head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.num{font-weight:800;font-variant-numeric:tabular-nums}
.part{color:var(--muted);font-size:.85rem}
.kind{font-size:.8rem;border-radius:6px;padding:1px 8px;background:var(--rust-soft);color:var(--ink)}
.kind.crop,.kind.code{background:transparent;border:1px dashed var(--line);color:var(--muted)}
.done-box{margin-inline-start:auto;display:flex;align-items:center;gap:4px;font-size:.82rem;color:var(--muted)}
.row{margin:0}
.lbl{color:var(--muted);font-size:.8rem;margin-inline-end:4px}
.narr{font-weight:600}
.code{position:relative;background:var(--code);border:1px solid var(--line);border-radius:8px;min-width:0}
.code pre{margin:0;padding:10px 12px 10px 12px;direction:ltr;text-align:left;font-family:var(--f-mono);font-size:.78rem;line-height:1.55;white-space:pre-wrap;word-break:break-word}
.code .cap{display:flex;justify-content:space-between;align-items:center;padding:6px 10px 0;font-size:.78rem;color:var(--muted)}
.copy{font:inherit;font-size:.8rem;border:1px solid var(--rust);color:var(--rust);background:transparent;border-radius:6px;padding:2px 10px;cursor:pointer}
.copy.ok{border-color:var(--ok);color:var(--ok)}
button:focus-visible,input:focus-visible{outline:2px solid var(--rust);outline-offset:2px}
.refs{display:flex;flex-wrap:wrap;gap:6px;align-items:center;background:var(--rust-soft);border-radius:8px;padding:6px 10px}
.chip{background:var(--surface);border:1px solid var(--rust);color:var(--ink);border-radius:999px;padding:0 10px;font-size:.82rem;font-weight:600}
.note{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px 14px;font-size:.9rem}
.note a{color:var(--rust)}
.note ul{margin:4px 0;padding-inline-start:18px}
</style>
<div class="wrap">
  <h1>شات‌های دایناسور · بخش ۱</h1>
  <p class="sub">«۱۰ روز تا شهاب‌سنگی که دایناسورها رو نابود کرد»؛ از قلاب تا آخر روز ۵</p>
  <div class="stats" id="stats"></div>
  <div class="note">
    <ul>
      <li>همه‌ی عکس‌ها <b>16:9</b>، در یک پروژه‌ی Flow.</li>
      <li>رفرنس‌های هر شات بالای کارتش نوشته شده (📎). فقط همون‌ها رو بده.</li>
      <li><b>عکس سبک:</b> دیگه عکس جنگل آبی رو نده. برای شات‌های روز، <b>شات ۲۴ (پسر کنار ریشه)</b>؛ برای شب و آتیش، <b>شات ۱ (تونل)</b>.</li>
      <li>✂️ و 🎨 عکس نمی‌خوان؛ کار تدوین منه. فقط 🖼 و 🎬 رو بساز.</li>
      <li>♻️ یعنی یکی از ۳ عکسی که <b>قبلاً توی پروژه‌ی تست</b> ساختی؛ چیزی نساز. اگه پرامپت ویرایش داشت، همون عکس رو ویرایش کن. اگه توی پروژه‌ی جدید نداریشون، از اینجا بگیر و آپلود کن:<br><a href="https://github.com/wwwdigiqube-max/Clude2/raw/main/uploads/dino-short/shot01.jpg">عکس پای غول</a> · <a href="https://github.com/wwwdigiqube-max/Clude2/raw/main/uploads/dino-short/shot02.jpg">عکس گوشی قرمز</a> · <a href="https://github.com/wwwdigiqube-max/Clude2/raw/main/uploads/dino-short/shot04.jpg">عکس تی‌رکس پشت سرخس</a></li>
      <li>اسم هر فایل رو همون <b>Shot …</b> اول پرامپت بذار.</li>
    </ul>
  </div>
  <div class="bar" role="toolbar" aria-label="فیلتر">
    <button data-f="all" aria-pressed="true">همه</button>
    <button data-f="make" aria-pressed="false">فقط چیزهایی که باید بسازم</button>
    <button data-f="clip" aria-pressed="false">کلیپ‌ها</button>
    <span class="prog" id="prog"></span>
  </div>
  <div id="list"></div>
</div>
<script>
const D = __DATA__;
const KIND = {new:"🖼 عکس تازه", crop:"✂️ برش از عکس قبلی", clip:"🎬 کلیپ Flow", reuse:"♻️ عکس ساخته‌شده", code:"🎨 گرافیک تدوین"};
const fa = s => String(s).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
let done = {}; try { done = JSON.parse(localStorage.getItem("dino-p1-done") || "{}"); } catch (e) {}
const save = () => { try { localStorage.setItem("dino-p1-done", JSON.stringify(done)); } catch (e) {} };
const el = (t, c, txt) => { const e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e; };
function codeBlock(cap, text){
  const box = el("div","code"); const h = el("div","cap"); h.append(el("span",null,cap));
  const b = el("button","copy","کپی"); b.type="button";
  b.addEventListener("click", () => {
    const ok = () => { b.textContent = "کپی شد"; b.classList.add("ok"); setTimeout(()=>{b.textContent="کپی";b.classList.remove("ok")},1600); };
    const sel = () => { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = "انتخاب شد، کپی کن"; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, sel); else sel();
  });
  h.append(b); const pre = el("pre",null,text); box.append(h, pre); return box;
}
const makes = s => s.kind==="new" || s.kind==="clip" || (s.kind==="reuse" && s.prompt);
function stats(){
  const S = D.shots, n = S.length, m = Math.round(D.total/60);
  const items = [["شات", n], ["دقیقه", "~"+m], ["عکس تازه", S.filter(s=>s.kind==="new").length], ["کلیپ Flow", S.filter(s=>s.kind==="clip").length], ["رفرنس", D.pre.length]];
  const box = document.getElementById("stats"); box.textContent="";
  items.forEach(([k,v]) => { const s = el("div","stat"); const b = el("b",null,fa(v)); s.append(b, " "+k); box.append(s); });
  const todo = S.filter(makes).concat(D.pre.map(p=>({n:p[0]})));
  const d = todo.filter(s => done[s.n]).length;
  document.getElementById("prog").textContent = `ساخته‌شده: ${fa(d)} از ${fa(todo.length)}`;
}
function card(s){
  const c = el("article","card"+(done[s.n]?" done":""));
  const h = el("div","head");
  h.append(el("span","num","شات "+fa(s.n)), el("span","part",`${s.part} · ${fa(s.t)}`), el("span","kind "+s.kind, KIND[s.kind] + (s.src ? ` · ${s.src}` : "")));
  if (makes(s)) {
    const lab = el("label","done-box"); const cb = el("input"); cb.type="checkbox"; cb.id="d"+s.n; cb.checked=!!done[s.n];
    cb.addEventListener("change",()=>{ done[s.n]=cb.checked; save(); c.classList.toggle("done",cb.checked); stats(); });
    lab.append(cb, "ساختم"); h.append(lab);
  }
  c.append(h);
  if (s.refs && s.refs.length) {
    const rf = el("div","refs"); rf.append(el("span","lbl", s.kind==="clip" && s.prompt ? "📎 رفرنس عکس فریم اول:" : "📎 رفرنس:"));
    s.refs.forEach(x => rf.append(el("span","chip",x))); c.append(rf);
  }
  const r1 = el("p","row narr"); r1.append(el("span","lbl","🎙"), s.narr); c.append(r1);
  const r2 = el("p","row"); r2.append(el("span","lbl","👁"), s.see); c.append(r2);
  if (s.prompt) c.append(codeBlock(s.kind==="reuse" ? "پرامپت ویرایش (Nano Banana)" : "پرامپت عکس", s.prompt));
  if (s.motion) c.append(codeBlock("پرامپت حرکت · Frames to Video · Fast · ۸ ثانیه", s.motion));
  const r3 = el("p","row"); r3.append(el("span","lbl","🎥"), s.cam); c.append(r3);
  const r4 = el("p","row"); r4.append(el("span","lbl","🔊"), s.sfx); c.append(r4);
  c.dataset.kind = s.kind; c.dataset.make = makes(s) ? "1" : "0";
  return c;
}
function render(f){
  const L = document.getElementById("list"); L.textContent="";
  if (f !== "clip") {
    L.append(el("h2",null,"قدم صفر: دو رفرنس (یک بار برای کل کانال)"));
    D.pre.forEach(([id,title,note,pr]) => {
      const c = el("article","card"+(done[id]?" done":"")); const h = el("div","head");
      h.append(el("span","num",id), el("span","kind new",title));
      const lab = el("label","done-box"); const cb = el("input"); cb.type="checkbox"; cb.id="d"+id; cb.checked=!!done[id];
      cb.addEventListener("change",()=>{ done[id]=cb.checked; save(); c.classList.toggle("done",cb.checked); stats(); });
      lab.append(cb,"ساختم"); h.append(lab); c.append(h, el("p","row",note), codeBlock("پرامپت", pr)); L.append(c);
    });
  }
  let part = "";
  D.shots.forEach(s => {
    if (f==="make" && !makes(s)) return; if (f==="clip" && s.kind!=="clip") return;
    if (s.part !== part) { part = s.part; L.append(el("h2",null,part)); }
    L.append(card(s));
  });
}
document.querySelectorAll(".bar button").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".bar button").forEach(x => x.setAttribute("aria-pressed", x===b ? "true":"false"));
  render(b.dataset.f);
}));
stats(); render("all");
</script>
'''.replace("__DATA__", data)
open(os.path.join(H, "part1.html"), "w").write(page)
print("ok", len(page))
