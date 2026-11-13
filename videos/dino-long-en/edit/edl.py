# EN edit decision list → src/dino-en/edl.json (read by src/dino-en/Video.tsx).
# Timing comes from the narration (voice/words.json) through edit/frames.json (prep.py): a frame starts on its first word.
#   img   "D1a" old shot · "n:014" new EN frame · "s:shot01" · "c:D8c" clip · "black"
#   cam   (z0, x0, y0, z1, x1, y1) zoom + focus point (0..1 of the image) at the frame's start → end
#   opts  in=[a,b] · punch · shake=px · hits=[cue] · flip · grade · tr=blink|fade|flash · dimImg · scar={x1,y1,x2,y2,at}
#   fx    [(kind, {...})]; cue "at": seconds after frame start · "w:word" first matching word at/after the start · "e:N" N s before the end
import json, os, re
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.join(H, "..", "..", "..")
V = os.path.join(H, "..", "voice")
FR = json.load(open(os.path.join(H, "frames.json")))
WJ = json.load(open(os.path.join(V, "words.json"))); W = WJ["words"]
norm = lambda s: re.sub(r"[^\w%']", "", s.lower().replace("’", "'"))
byn = {f["n"]: f for f in FR}
live = [f for f in FR if f["meth"] != "CUT"]

# ---- start/end of every frame ----
start = {}
for i, f in enumerate(live):
    if f["w0"] is not None: start[f["n"]] = max(0.0, W[f["w0"]]["s"] - 0.12)
    else:
        prev = next((g for g in reversed(live[:i]) if g["w0"] is not None), None)
        start[f["n"]] = (W[prev["w1"] - 1]["e"] + 0.25) if prev else 0.0
start[live[0]["n"]] = 0.0
TOTAL = round(WJ["total"] + 2.0, 3)
end = {f["n"]: (start[live[i + 1]["n"]] if i + 1 < len(live) else TOTAL) for i, f in enumerate(live)}

def T(cue, n):
    s0 = start[n]
    if isinstance(cue, (int, float)): return round(s0 + cue, 3)
    if cue.startswith("e:"): return round(end[n] - float(cue[2:]), 3)
    if cue.startswith("w:"):
        q = norm(cue[2:])
        for w in W:
            if w["s"] >= s0 - 0.2 and norm(w["w"]).startswith(q): return w["s"]
        raise KeyError((n, cue))
    raise ValueError(cue)

# ---- source image of a frame (resolves CROP/REUSE chains) ----
def base_img(n):
    m = byn[n]["meth"]
    if m.startswith(("NEW", "EDIT")): return f"n:{n:03d}"
    if m.startswith("OLD "): x = m[4:]; return x
    if m.startswith("CLIP "): return "c:" + m[5:]
    if m == "TEXT": return "black"
    src = m.split("←", 1)[1]
    if src.startswith("#"): return base_img(int(src[1:]))
    return src

E = {}
def S(n, img=None, cam=(1.04, .5, .5, 1.1, .5, .5), **o): E[n] = dict(img=img or base_img(n), cam=cam, **o)
day = lambda d: ("day", {"text": f"DAY {d}/10", "at": 0.15})
rule = lambda txt, at=0.1, warm=False: ("rule", {"text": txt, "at": at, "warm": warm})
bat = lambda a, b=None, at=0.3: ("battery", {"from": a, "to": b if b is not None else a, "at": at})
card = lambda text, sub=None, at=0.05, color=None: ("bigcard", {"text": text, "sub": sub, "at": at, "color": color})
check = lambda title, items, stamp=None, at=0.1: ("checklist", {"title": title, "items": items, "stamp": stamp, "at": at})
it = lambda text, state="empty", note=None: {"text": text, "state": state, "note": note}

# =================== 0 · The Breathing ===================
S(1, "H1", (1.28, .40, .48, 1.34, .38, .5), shake=3, fx=[("dust", {}), day(10)])
S(2, "H1", (2.1, .30, .48, 2.25, .30, .5), punch=True, shake=6, fx=[("dust", {"n": 70})])
S(3, "H2", (1.04, .5, .5, 1.16, .5, .45), fx=[("embers", {})])
S(4, "c:H3-breath-v3", (1, .5, .5, 1.04, .5, .5), **{"in": [0, 7.9]})
S(5, "black")
S(6, "D1a", (1.12, .42, .5, 1.12, .56, .5), tr="fade")
S(7, "D5a", (1.04, .5, .55, 1.14, .5, .45), grade="warm", fx=[("embers", {"n": 30})])
S(8, "D1e", (1.1, .35, .5, 1.1, .62, .5))
S(9, "D2e", (1.2, .5, .7, 1.06, .5, .55), fx=[("glow", {"at": "w:if"})])
S(10, "black", fx=[("title", {"text": "10 DAYS", "at": 0.05}), ("card", {"title": "BEFORE THE ASTEROID", "sub": "that killed the dinosaurs", "at": 0.5})])
# =================== 1 · Ten Days ===================
S(11, "D1a", (1.3, .46, .5, 1.36, .5, .5), tr="fade")
S(12, "D1d", (1.05, .5, .5, 1.14, .5, .48))
S(13, "D1a", (2.3, .45, .72, 2.45, .45, .72), fx=[bat(23, at="w:23")])
S(14, cam=(1.06, .45, .5, 1.12, .48, .5))
S(15, cam=(2.0, .26, .68, 2.15, .3, .68))
S(16, cam=(2.1, .57, .45, 2.25, .57, .45))
S(17, cam=(1.0, .5, .5, 1.12, .45, .42), fx=[("card", {"title": "THE LAST DAY OF THE DINOSAURS", "at": 0.15})])
S(18, "black")
S(19, "D1b", (1.0, .5, .5, 1.12, .5, .4), tr="blink", fx=[day(1)])
S(20, "D1c", (1.08, .5, .5, 1.14, .5, .5), rot=[0, 1.5])
S(21, "s:shot01", (1.35, .28, .6, 1.35, .62, .55))
S(22, "s:shot01", (1.75, .66, .8, 1.85, .66, .8), punch=True, hits=[0.05])
S(23, "s:shot01", (1.4, .62, .72, 1.45, .62, .72), hits=["w:slams"], fx=[("dust", {"at": "w:slams", "n": 50})])
S(24, "s:shot01", (1.12, .55, .5, 1.18, .55, .55), hits=["w:jumps"], fx=[("dust", {"at": "w:jumps", "n": 60})])
S(25, "s:shot01", (1.6, .3, .68, 1.7, .3, .68))
S(26, "D1b", (1.7, .58, .6, 1.8, .58, .6))
S(27, "phone-10days", (1.12, .42, .5, 1.12, .56, .5))
S(28, "phone-10days", (1.7, .42, .6, 1.9, .42, .62))
S(29, "phone-10days", (1.9, .42, .6, 1.95, .42, .6), dimImg=0.5,
  fx=[("msg", {"lines": ["IMPACT: 10 DAYS", "3,000 KM SOUTH"], "at": 0.05}), bat(23, at=0.4)])
S(30, "phone-10days", (2.2, .47, .36, 2.3, .47, .36), punch=True)
S(31, "D1e", (1.12, .4, .5, 1.12, .6, .5), fx=[bat(22, at="w:22"), ("dim", {"at": "w:start", "to": 0.0})])
S(32, cam=(1.04, .4, .5, 1.12, .3, .45))
S(33, cam=(1.12, .5, .6, 1.04, .5, .5))
S(34, "trex-boy-scar", (1.15, .32, .45, 1.15, .62, .55), flip=True)
S(35, "trex-boy-scar", (1.05, .5, .5, 1.1, .5, .5), flip=True, fx=[("label", {"text": "12 METERS", "x": .5, "y": .22, "at": "w:12"})])
S(36, "D1g", (1.0, .45, .4, 1.14, .45, .35))
S(37, "D1g", (2.2, .62, .38, 2.4, .62, .38))
S(38, "trex-boy-scar", (1.45, .68, .62, 1.45, .68, .62), flip=True)
S(39, cam=(1.05, .55, .45, 1.14, .58, .42))
S(40, cam=(1.04, .45, .5, 1.1, .4, .5))
S(41, cam=(1.9, .3, .55, 2.0, .3, .52))
S(42, cam=(1.04, .5, .5, 1.12, .5, .5))
S(43, cam=(1.04, .5, .5, 1.12, .5, .5))
S(44, cam=(1.12, .45, .45, 1.2, .45, .45), grade="night")
S(45, cam=(1.02, .5, .5, 1.08, .5, .5))
S(46, cam=(2.2, .3, .45, 2.2, .7, .45))
S(47, cam=(1.04, .5, .5, 1.12, .55, .45))
S(48, "n:047", (1.2, .5, .5, 1.2, .5, .5), dimImg=0.4,
  fx=[check("Day 1: the plan", [it("SHELTER: 1 m of soil overhead"), it("WATER"), it("FOOD for the dark")])])
S(49, "n:040", (2.3, .28, .42, 2.45, .28, .42))

# ---- defaults for everything not hand-set yet: gentle push, crops zoom in ----
for f in live:
    n = f["n"]
    if n in E: continue
    m = f["meth"]
    if m == "TEXT": S(n, "black", fx=[card(f["text"][:40] if f["text"] not in ("—", "(pause)") else "")])
    elif m.startswith("CROP"): S(n, cam=(1.6, .5, .5, 1.7, .5, .5))
    else: S(n, cam=(1.04, .5, .5, 1.1, .5, .5))

# ---- resolve ----
shots = []
for f in live:
    n = f["n"]; e = dict(E[n]); s0, s1 = start[n], end[n]
    fx = []
    for kind, p in e.pop("fx", []):
        p = dict(p); p.setdefault("at", 0.0); p["at"] = T(p["at"], n)
        for k in ("items", "rows"):
            if k in p and p[k] and isinstance(p[k][0], (list, tuple)): p[k] = [[a, T(c, n)] for a, c in p[k]]
        fx.append({"kind": kind, **p})
    e["hits"] = [T(c, n) for c in e.get("hits", [])]
    if "scar" in e: e["scar"] = {**e["scar"], "at": T(e["scar"]["at"], n)}
    shots.append({"n": n, "s": round(s0, 3), "e": round(s1, 3), **e, "fx": fx})
for a in shots: assert a["e"] - a["s"] >= 0.6, (a["n"], round(a["e"] - a["s"], 2))
look = [[s["n"], round(0.6 * (s["e"] - s["s"]), 2)] for s in shots]
json.dump({"total": TOTAL, "shots": shots, "look": look}, open(os.path.join(R, "src/dino-en/edl.json"), "w"), ensure_ascii=False, indent=0)
short = sorted(((round(s["e"] - s["s"], 2), s["n"]) for s in shots))[:5]
print(len(shots), "shots,", TOTAL, "s · shortest", short)
