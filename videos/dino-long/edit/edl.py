# Edit decision list for the long dino video → src/dino/edl.json (read by src/dino/Video.tsx).
# One entry per shot of the shot list (part1 + part2, 115 shots). Start = where that shot's narration begins in
# src/dino/vo.json (timing.py); end = the next shot's start.
#   img   "D1a" (uploads/dino-long/shots/D1a.jpg) · "s:shot01" (uploads/dino-short) · "c:D8c" clip (uploads/dino-long/clips)
#   cam   (z0, x0, y0, z1, x1, y1): zoom + focus point (0..1 of the image) at the shot's start → end
#   opts  in=[a,b] clip in/out (s) · punch · shake=px · hits=[cue…] · flip · grade=sepia|grey|red|night|dim|fever|warm
#         tr=blink|fade|flash · fx=[(kind, {…})] overlays/particles (times are cues, see T below)
import json, os, re
from timing import VO, L, SHOTS, out as WORD_AT, norm
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.join(H, "..", "..", "..")
words, segs = VO["words"], VO["segs"]
seg_by_n = {s["n"]: s for s in segs}

def line_with(sub):
    for l in L:
        if sub in l["fa"]: return seg_by_n[l["n"]]["start"]
    raise KeyError(sub)

# manual starts for shots whose narration changed after the shot list was written
MANUAL = {4: line_with("یه چیز خیلی بزرگ"), 21: line_with("عصر، بالاخره"), 103: line_with("] تا خود صبح"),
          115: line_with("اگه جای این شخصیت")}
START = []
for i, k in enumerate(WORD_AT):
    n = i + 1
    START.append(MANUAL.get(n, words[k]["s"] if k is not None else None))
START[0] = 0.0
END_TOTAL = VO["total"] + 2.5

def T(cue, n):
    """cue → absolute seconds. number = seconds after the shot start · "w:word" = that word's onset (first at/after
    the shot start) · "L:text" = start of the line containing text · "e:N" = N s before the shot end."""
    s0 = START[n - 1]
    if isinstance(cue, (int, float)): return round(s0 + cue, 3)
    if cue.startswith("w:"):
        q = norm(cue[2:])[0]
        cand = [w for w in words if w["s"] >= s0 - 0.05 and norm(w["w"])][:60]
        for test in (lambda a: a == q, lambda a: a.startswith(q[:4]) or q.startswith(a[:4])):
            for w in cand:
                if test(norm(w["w"])[0]): return w["s"]
        print("  ! cue not found:", n, cue, [w["w"] for w in cand[:12]])
        return round(s0 + 0.3, 3)
    if cue.startswith("L:"): return line_with(cue[2:])
    raise ValueError(cue)

E = {}
def S(n, img, cam=(1.04, .5, .5, 1.1, .5, .5), **o): E[n] = dict(img=img, cam=cam, **o)

day = lambda txt: ("day", {"text": txt, "at": 0.15})
rule = lambda txt, at, warm=False: ("rule", {"text": txt, "at": at, "warm": warm})
bat = lambda a, b=None, at=0.3: ("battery", {"from": a, "to": b if b is not None else a, "at": at})

# ---- hook ----
S(1, "H1", (1.28, .40, .48, 1.34, .38, .5), shake=3, fx=[("dust", {}), day("روز ۱۰")])
S(2, "H1", (2.1, .30, .48, 2.25, .30, .5), punch=True, shake=6, fx=[("dust", {"n": 70})])
S(3, "H2", (1.04, .5, .5, 1.16, .5, .45), fx=[("embers", {})])
S(4, "c:H3-breath-v3", (1, .5, .5, 1.04, .5, .5), **{"in": [0, 7.9]})
S(5, "black", fx=[("title", {"text": "ده روز قبل", "sub": "", "at": 0.1})])
# ---- day 1 ----
S(6, "D1a", (1.12, .42, .5, 1.12, .56, .5), tr="fade")
S(7, "D1a", (1.9, .5, .62, 2.1, .5, .62), fx=[bat(23, at="w:بیست")])
S(8, "D1b", (1.0, .5, .5, 1.12, .5, .4), tr="blink", fx=[("day", {"text": "روز ۱", "at": 1.0})])
S(9, "D1c", (1.08, .5, .5, 1.14, .5, .5), rot=[0, 1.5])
S(10, "s:shot01", (1.35, .28, .6, 1.35, .62, .55))
S(11, "s:shot01", (1.75, .66, .8, 1.85, .66, .8), punch=True, hits=[0.05])
S(12, "s:shot01", (1.12, .55, .5, 1.18, .55, .55), hits=["w:می‌کوبه", "w:می‌لرزه"], fx=[("dust", {"at": "w:می‌کوبه", "n": 50})])
S(13, "s:shot01", (1.6, .3, .68, 1.7, .3, .68))
S(14, "phone-10days", (1.12, .42, .5, 1.12, .56, .5))
S(15, "phone-10days", (1.7, .42, .6, 1.9, .42, .62), fx=[("notif", {"lines": ["برخورد: ۱۰ روز دیگه", "۳۰۰۰ کیلومتر جنوب"], "at": "w:برخورد"})])
S(16, "D1d", (1.05, .5, .5, 1.12, .5, .5), grade="sepia", jitter=True,
  fx=[("map", {"at": "w:سنگ"})])
S(17, "D1e", (1.12, .4, .5, 1.12, .6, .5))
S(18, "D1e", (1.3, .5, .55, 1.38, .5, .55))
S(19, "phone-10days", (2.2, .47, .36, 2.3, .47, .36), punch=True)
S(20, "phone-10days", (1.5, .42, .55, 1.55, .42, .55), fx=[("dim", {"at": 0.4, "to": 0.75}), bat(22, at="w:بیست")])
S(21, "trex-boy-scar", (1.15, .32, .45, 1.15, .62, .55), flip=True,
  fx=[("label", {"text": "۱۲ متر", "x": .40, "y": .30, "at": "w:دوازده"})])
S(22, "D1g", (1.0, .45, .4, 1.14, .45, .35))
S(23, "trex-boy-scar", (1.45, .68, .62, 1.45, .68, .62), flip=True)
# ---- day 2 ----
S(24, "D2a", (1.0, .5, .5, 1.08, .5, .5), fx=[day("روز ۲")])
S(25, "c:D2b-fandogh", (1, .5, .5, 1.04, .5, .5), **{"in": [0, 7.8]})
S(26, "D2b", (1.25, .52, .7, 1.3, .52, .7), freeze=True, fx=[("name", {"text": "فندق", "x": .62, "y": .42, "at": "w:فندق"})])
S(27, "D2c", (1.12, .42, .5, 1.12, .58, .5))
S(28, "c:D2b-fandogh", (1.15, .5, .62, 1.2, .5, .62), **{"in": [3.0, 7.8]})
S(29, "D2e", (1.05, .5, .45, 1.22, .55, .7))
S(30, "D2e", (1.22, .55, .7, 1.22, .55, .7), blur=8, fx=[("weights", {"at": "w:بیست"})])
S(31, "D2a", (1.35, .45, .5, 1.42, .45, .5), fx=[rule("قانون اول: کوچیک بمون", "L:] قانون اول")])
# ---- day 3 ----
S(32, "D3a", (1.12, .4, .5, 1.12, .6, .5), fx=[day("روز ۳")])
S(33, "c:D3b-croc-eye", (1, .5, .5, 1.05, .5, .5), **{"in": [0, 7.8]})
S(34, "D3b", (1.9, .52, .55, 2.0, .52, .55), punch=True)
S(35, "D3c", (1.1, .45, .55, 1.35, .45, .72))
S(36, "D3d", (1.12, .4, .5, 1.12, .6, .5),
  fx=[("chips", {"items": [["لاک‌پشت", "w:لاک‌پشت‌ها"], ["قورباغه", "w:قورباغه‌ها"], ["کروکودیل", "w:کروکودیل‌ها"]]})])
S(37, "D3e", (1.15, .5, .5, 1.22, .5, .65))
S(38, "D3a", (1.3, .5, .5, 1.36, .5, .5), fx=[rule("قانون دوم: کنار آب بمون", "L:] قانون دوم")])
# ---- day 4 ----
S(39, "D4a", (1.05, .5, .5, 1.1, .5, .5), stomps=0.55, fx=[day("روز ۴")])
S(40, "D4a", (1.15, .5, .5, 1.2, .5, .5), hits=["w:بم"])
S(41, "c:D4b-stampede", (1.04, .5, .5, 1.08, .5, .5), shake=7, **{"in": [0, 5.6]})
S(42, "D4b-with-boy", (1.5, .25, .68, 1.6, .25, .68), shake=5, blur=1.5)
S(43, "D4d", (1.0, .5, .5, 1.1, .5, .5))
S(44, "D4e", (1.1, .5, .5, 1.4, .62, .35), fx=[("label", {"text": "بیل", "x": .72, "y": .22, "at": "w:بیلت"})])
# ---- day 5 ----
S(45, "D5a", (1.0, .5, .45, 1.1, .5, .45), fx=[day("روز ۵"), ("embers", {"n": 25})])
S(46, "D5a", (1.1, .5, .4, 1.25, .5, .8), fx=[("dim", {"at": "e:1.0", "to": 1, "dur": 0.9, "color": "#1c120b"})])
S(47, "D5b", (1.12, .6, .5, 1.12, .4, .5))
S(48, "D5c", (1.0, .55, .5, 1.35, .62, .48))
S(49, "D5b", (1.1, .35, .5, 1.3, .25, .55))
# ---- day 6 ----
S(50, "D6a", (1.05, .5, .5, 1.12, .5, .5), fx=[day("روز ۶"), ("sunsweep", {})])
S(51, "D6b", (1.05, .4, .5, 1.45, .22, .55))
S(52, "D6b", (1.2, .35, .5, 1.22, .35, .5), fx=[("compass", {"at": 0.2})])
S(53, "D6c", (1.05, .5, .5, 1.1, .5, .5), fx=[("depth", {"at": "w:یه"})])
S(54, "D6c", (1.1, .5, .5, 1.1, .5, .5), fx=[("heat", {"at": 0.3})])
S(55, "D6d", (1.0, .5, .5, 1.08, .5, .5))
S(56, "D6d", (1.25, .4, .5, 1.3, .4, .5), fx=[rule("قانون سوم: زیر زمین بمون", "L:] قانون سوم")])
# ---- day 7 ----
S(57, "D7a", (1.04, .5, .5, 1.1, .55, .5), fx=[day("روز ۷")])
S(58, "D7b", (1.0, .5, .5, 1.15, .5, .5))
S(59, "D7c", (1.12, .42, .5, 1.12, .58, .5))
S(60, "D7d", (1.1, .4, .5, 1.25, .35, .55), fx=[("photos", {"imgs": ["D1a"], "at": "w:عکس‌های"})])
S(61, "D7d", (1.8, .72, .7, 1.9, .72, .7))
S(62, "D7d", (1.3, .35, .55, 1.3, .35, .55), fx=[bat(22, 11, at=0.4)])
S(63, "D7e", (1.0, .5, .5, 1.08, .5, .5))
S(64, "D7e", (1.25, .5, .5, 1.02, .5, .5), grade="warm")
# ---- day 8 ----
S(65, "D8a", (1.05, .5, .5, 1.08, .5, .5), fx=[day("روز ۸")])
S(66, "D8a", (1.5, .5, .55, 1.65, .5, .55))
S(67, "D8b", (1.05, .5, .5, 1.12, .5, .5), shake=1.5)
S(68, "c:D8c", (1, .5, .5, 1.04, .5, .5), **{"in": [0, 7.5]})
S(69, "D8c", (1.6, .5, .5, 1.7, .5, .5), punch=True)
S(70, "D8d", (1.1, .5, .5, 1.15, .5, .5), hits=["w:پنجه‌اش"], fx=[("redflash", {"at": "w:ساعدت"})])
S(71, "D8d", (1.7, .3, .4, 1.8, .3, .4))
S(72, "D8e", (1.6, .28, .45, 1.6, .28, .45), fx=[bat(11, at=0.3)])
S(73, "c:D8e", (1, .5, .5, 1.03, .5, .5), tr="flash", **{"in": [0, 5.0]})
S(74, "D8e", (1.2, .5, .5, 1.25, .5, .5), pulses=True)
S(75, "D8f", (1.05, .5, .5, 1.1, .5, .5), fx=[("dawn", {"from": 0.85, "to": 0.4})])
S(76, "D8f", (1.1, .5, .5, 1.18, .5, .5), fx=[("dawn", {"from": 0.4, "to": 0.0})])
S(77, "D8f", (1.3, .3, .5, 1.3, .3, .5), fx=[bat(3, at="w:سه")])
# ---- day 9 ----
S(78, "D9a", (1.05, .5, .5, 1.12, .5, .5), grade="fever", fx=[day("روز ۹")])
S(79, "D9b", (1.05, .5, .5, 1.4, .25, .6))
S(80, "phone-10days", (1.7, .42, .6, 1.9, .42, .62), screen={"lines": []}, fx=[("notif", {"lines": ["برخورد: فردا"], "at": "w:فردا"})])
S(81, "phone-10days", (2.0, .40, .66, 2.05, .40, .66), screen={"lines": []}, fx=[bat(2, at=0.1, ), ("dim", {"at": "e:0.9", "to": 0.85})])
S(82, "D9c", (1.12, .5, .7, 1.12, .5, .3))
S(83, "D9d", (1.0, .5, .5, 1.12, .5, .5))
S(84, "D9c", (1.25, .5, .4, 1.0, .5, .5))
# ---- day 10 ----
S(85, "D10a", (1.04, .45, .5, 1.1, .55, .5), fx=[day("روز ۱۰")])
S(86, "D10a", (1.3, .6, .45, 1.36, .6, .45))
S(87, "c:D10b-light", (1.16, .58, .45, 1.2, .58, .45), **{"in": [0, 7.9]})
S(88, "D10a", (1.12, .5, .5, 1.16, .5, .5), shake=12, fx=[("dust", {"n": 60})])
S(89, "c:D10c-wave", (1.02, .5, .5, 1.06, .5, .5), shake=4, **{"in": [0, 4.6]})
S(90, "D10d", (1.2, .55, .45, 1.35, .25, .6))
S(91, "D10e", (1.12, .5, .5, 1.18, .5, .5), handheld=True)
S(92, "D10e", (1.2, .5, .5, 1.2, .5, .5), blur=3,
  fx=[("card", {"title": "تانیس، داکوتای شمالی", "sub": "ماهی‌های فسیلی با دونه‌های شیشه‌ای توی آبشش", "at": "w:داکوتای"})])
S(93, "D10g", (1.5, .52, .33, 1.6, .52, .33), fx=[("glass", {})])
S(94, "D5a", (1.08, .5, .45, 1.16, .5, .45), grade="red")
S(95, "H1", (1.3, .4, .48, 1.34, .4, .48), shake=3, fx=[("dust", {"n": 30})])
S(96, "H2", (1.04, .5, .5, 1.14, .5, .5), fx=[("embers", {})])
S(97, "H1", (2.0, .3, .48, 2.1, .3, .48))
S(98, "H1", (1.28, .42, .48, 1.3, .42, .48), hits=["w:می‌افته"], fx=[("shadow", {"at": "w:سایه‌اش"})])
S(99, "H3", (1.3, .55, .45, 1.45, .5, .5))
S(100, "c:H3-breath-v3", (1, .5, .5, 1.05, .5, .5), **{"in": [0, 7.9]})
S(101, "D10i", (1.0, .5, .5, 1.08, .5, .5))
S(102, "H1", (1.6, .3, .5, 1.68, .3, .5), grade="dim")
S(103, "black")
S(104, "D10j", (1.0, .5, .5, 1.05, .5, .5), fx=[("ash", {})], tr="fade")
# ---- after ----
S(105, "D11a", (1.12, .42, .5, 1.12, .58, .5), grade="grey", fx=[("ash", {})])
S(106, "D6c", (1.05, .5, .5, 1.35, .5, .62), grade="grey", fx=[("ash", {"n": 30})])
S(107, "D11c", (1.05, .5, .5, 1.1, .5, .5))
S(108, "D11c", (1.1, .5, .5, 1.12, .5, .5), dimImg=0.45,
  fx=[("tally", {"rows": [["موجودی:", "L:] موجودی"], ["روزهای بعد از پایان: ۴۰", "L:روزهای بعد از پایان"],
                          ["ماهی خشک: ۷ تا", "L:ماهی خشک"], ["دایناسورهای زنده‌مونده: صفر", "L:] دایناسورهای زنده‌مونده: صفر."],
                          ["دوستان: یکی، به اندازه‌ی یه موش", "L:دوستان"]]})])
S(109, "D11c", (1.12, .5, .5, 1.15, .5, .5), dimImg=0.45,
  fx=[("rules3", {"items": [["کوچیک بمون", "w:کوچیک"], ["کنار آب بمون", "w:کنار"], ["زیر زمین بمون", "w:زیر"]]})])
S(110, "D11d", (1.05, .5, .5, 1.12, .5, .5), fx=[rule("کوچیک بمون… ولی تنها نمون", "L:ولی تنها نمون", warm=True)])
S(111, "D2e", (1.15, .5, .75, 1.05, .5, .35),
  fx=[("tree", {"items": [["اسب‌ها", "w:اسب‌ها"], ["نهنگ‌ها", "w:نهنگ‌ها"], ["میمون‌ها", "w:میمون‌ها"], ["آدم‌ها", "L:] و آدم‌ها"]]})])
S(112, "D11-phone", (1.1, .5, .5, 1.35, .5, .45))
S(113, "D11f", (1.0, .5, .5, 1.08, .5, .5), fx=[("glow", {"at": "L:آواز یه پرنده"})])
S(114, "D11c", (1.12, .5, .5, 1.15, .5, .5), dimImg=0.45,
  fx=[("rewrite", {"old": "دایناسورهای زنده‌مونده: صفر", "new": "… به‌جز پرنده‌ها", "at": 0.3, "add": "w:به‌جز"})])
S(115, "D11d", (1.1, .5, .5, 1.04, .5, .5),
  fx=[("cta", {"at": 0.4}), ("endcard", {"at": "L:قصه‌ی بعدی"})])

def resolve(n, v):
    if isinstance(v, dict): return {k: resolve(n, x) if k in ("at", "add") else (resolve_list(n, x) if k in ("items", "rows") else x) for k, x in v.items()}
    if isinstance(v, str) and v.startswith("e:"): return ("E", float(v[2:]))
    return T(v, n)
def resolve_list(n, xs): return [[a, T(c, n)] for a, c in xs]

shots = []
for n in range(1, len(SHOTS) + 1):
    e = dict(E[n]); s0 = START[n - 1]; s1 = START[n] if n < len(SHOTS) else END_TOTAL
    s0 = s0 - 0.12 if n > 1 else 0; s1 = s1 - 0.12 if n < len(SHOTS) else s1
    fx = []
    for kind, p in e.pop("fx", []):
        p = dict(p); p.setdefault("at", 0.0)
        p = {k: (T(v, n) if k in ("at", "add") and not (isinstance(v, str) and v.startswith("e:")) else v) for k, v in p.items()}
        for k in ("at",):
            if isinstance(p[k], str): p[k] = round(s1 - float(p[k][2:]), 3)
        for k in ("items", "rows"):
            if k in p: p[k] = [[a, T(c, n)] for a, c in p[k]]
        fx.append({"kind": kind, **p})
    e["hits"] = [T(c, n) for c in e.get("hits", [])]
    shots.append({"n": n, "s": round(s0, 3), "e": round(s1, 3), **e, "fx": fx})

# sanity: shots must be in order and at least 1 s long
for a in shots:
    assert a["e"] - a["s"] >= 0.9, (a["n"], a["e"] - a["s"])
json.dump({"total": END_TOTAL, "shots": shots}, open(os.path.join(R, "src/dino/edl.json"), "w"), ensure_ascii=False, indent=0)
print(len(shots), "shots,", END_TOTAL, "s")
