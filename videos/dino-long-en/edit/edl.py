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

# =================== 2 · The Smallest Thing in the Forest ===================
S(50, cam=(1.04, .45, .5, 1.1, .4, .5), tr="fade")
S(51, "D2a", (1.0, .5, .5, 1.08, .5, .5), fx=[day(2)])
S(52, "c:D2b-fandogh", (1, .5, .5, 1.04, .5, .5), **{"in": [0, 7.8]})
S(53, "D2b", (1.25, .52, .7, 1.3, .52, .7), fx=[("name", {"text": "PIP", "x": .62, "y": .42, "at": "w:pip"})])
S(54, "D2c", (1.12, .42, .5, 1.12, .58, .5))
S(55, "c:D2b-fandogh", (1.15, .5, .62, 1.2, .5, .62), **{"in": [3.0, 7.8]})
S(56, cam=(1.05, .45, .5, 1.14, .42, .5))
S(57, "D2e", (1.22, .55, .7, 1.22, .55, .7), blur=8, fx=[("weights", {"at": 0.3})])
S(58, "D2e", (1.22, .55, .7, 1.22, .55, .7), blur=8, fx=[card("YOU: 70 KG", color="#ffcf86")])
S(59, cam=(1.45, .5, .55, 1.55, .5, .55))
S(60, "n:062", (1.6, .5, .55, 1.6, .5, .55), fx=[rule("RULE 1: STAY SMALL", "w:rule")])
S(61, cam=(1.05, .5, .5, 1.12, .5, .45))
S(62, cam=(1.04, .5, .5, 1.1, .5, .5))
S(63, cam=(2.6, .72, .74, 2.75, .72, .74))
S(64, cam=(2.4, .3, .38, 2.55, .3, .38))
S(65, cam=(1.3, .5, .6, 1.2, .5, .55))
S(66, cam=(1.04, .45, .5, 1.12, .42, .48))
S(67, cam=(1.04, .5, .5, 1.12, .55, .55))
S(68, cam=(1.05, .45, .45, 1.12, .45, .5), fx=[day(3)])
S(69, cam=(1.05, .45, .45, 1.14, .45, .42), grade="warm")
S(70, "D3a", (1.12, .4, .5, 1.12, .6, .5))
S(71, "c:D3b-croc-eye", (1, .5, .5, 1.05, .5, .5), **{"in": [0, 7.8]})
S(72, "D3b", (1.9, .52, .55, 2.0, .52, .55), punch=True)
S(73, "D3b", (1.04, .5, .5, 1.1, .5, .5))
S(74, "D3a", (1.5, .32, .5, 1.6, .3, .5))
S(75, "D3c", (1.1, .45, .55, 1.2, .45, .6))
S(76, "D3c", (1.2, .45, .6, 1.4, .45, .72))
S(77, "D3c", (2.0, .45, .75, 2.1, .45, .75))
S(78, "D3e", (1.12, .5, .5, 1.2, .5, .55))
S(79, cam=(1.05, .5, .5, 1.12, .55, .55))
S(80, cam=(1.04, .4, .5, 1.1, .6, .5), grade="warm")
S(81, "D3e", (1.3, .5, .55, 1.36, .5, .6))
S(82, "n:079", (1.15, .5, .5, 1.15, .5, .5), dimImg=0.45, fx=[check("Day 3", [it("SHELTER"), it("WATER", "tick"), it("FOOD", "half", "3 fish")])])
S(83, "D3d", (1.12, .4, .5, 1.12, .6, .5), fx=[("label", {"text": "TURTLE", "x": .3, "y": .55, "at": "w:turtles"}), ("label", {"text": "FROG", "x": .6, "y": .5, "at": "w:frogs"}),
  ("label", {"text": "CROCODILE", "x": .8, "y": .35, "at": "w:crocodiles"})])
S(84, "D3a", (1.3, .5, .5, 1.36, .5, .5), fx=[rule("RULE 2: STAY NEAR WATER", "w:rule")])
# =================== 3 · A Shovel Made of Dinosaur ===================
S(85, "D4a", (1.05, .5, .5, 1.1, .5, .5), stomps=0.55, fx=[day(4)])
S(86, "D4a", (1.25, .55, .5, 1.32, .55, .5))
S(87, cam=(1.05, .55, .45, 1.14, .6, .42), hits=["w:deep"])
S(88, "c:D4b-stampede", (1.04, .5, .5, 1.08, .5, .5), shake=7, **{"in": [0, 5.6]})
S(89, "D4b-with-boy", (1.5, .25, .68, 1.6, .25, .68), shake=5, blur=1.5)
S(90, "D4d", (1.0, .5, .5, 1.1, .5, .5))
S(91, "D4e", (1.1, .5, .5, 1.3, .55, .4))
S(92, "D4e", (1.35, .6, .38, 1.5, .6, .35), fx=[("label", {"text": "SHOVEL", "x": .7, "y": .2, "at": "w:shovel"})])
S(93, cam=(1.05, .45, .5, 1.14, .45, .45), fx=[day(5)])
S(94, cam=(1.02, .5, .5, 1.1, .5, .5))
S(95, "D5a", (1.0, .5, .45, 1.1, .5, .45), fx=[("embers", {"n": 25})])
S(96, "D5a", (1.1, .5, .4, 1.25, .5, .8), fx=[("dim", {"at": "e:1.0", "to": 1, "dur": 0.9, "color": "#1c120b"})])
S(97, "D6c", (1.05, .5, .5, 1.1, .5, .55), fx=[rule("RULE 3: STAY UNDERGROUND", "w:rule")])
S(98, "D6a", (1.3, .42, .5, 1.36, .42, .5))
S(103, cam=(1.05, .45, .5, 1.12, .45, .45))
S(104, "D6a", (1.2, .5, .5, 1.2, .5, .5), blur=8, fx=[card("30 CM A DAY", "with a bone, in clay", at="w:30")])
S(105, "D6c", (1.05, .5, .5, 1.1, .5, .5), fx=[("depth", {"at": "w:meter"}), ("label", {"text": "2.5 M IN", "x": .45, "y": .82, "at": "w:two"})])
S(106, "D6c", (1.1, .5, .5, 1.1, .5, .5), blur=8, fx=[card("8 DAYS OF WORK")])
S(107, "n:103", (1.2, .5, .5, 1.2, .5, .5), dimImg=0.45, fx=[check("Day 5", [it("SHELTER", "half", "5%"), it("WATER", "tick"), it("FOOD", "half")], stamp="BEHIND", at="w:you")])
S(108, cam=(1.04, .5, .5, 1.1, .5, .55))
S(109, "D6a", (1.05, .5, .5, 1.12, .5, .5), fx=[day(6), ("sunsweep", {})])
S(110, cam=(1.08, .5, .5, 1.0, .5, .5), punch=True, shake=8, hits=[0.1], fx=[("dust", {"n": 80})])
S(111, cam=(1.1, .45, .5, 1.04, .45, .5), handheld=True)
S(112, cam=(1.04, .5, .5, 1.1, .5, .5))
S(113, "n:112", (1.1, .5, .5, 1.1, .5, .5), blur=8, fx=[card("4 DAYS LEFT", "8 days of digging", color="#ff8a7a")])
S(114, cam=(1.04, .45, .5, 1.12, .5, .5))
S(115, cam=(2.4, .6, .6, 2.6, .6, .6))
S(116, cam=(2.3, .33, .35, 2.45, .33, .35))
S(117, cam=(1.05, .45, .5, 1.14, .4, .5))
S(118, cam=(1.04, .5, .5, 1.12, .5, .45))
S(119, "n:118", (1.1, .5, .5, 1.1, .5, .5), blur=6, fx=[("arch", {"at": 0.05})])
S(120, "D6b", (1.05, .45, .5, 1.2, .35, .5), fx=[("compass", {"at": "w:north"})])
S(121, "D6b", (1.4, .45, .6, 1.5, .45, .6))
S(122, "n:117", (1.15, .5, .5, 1.15, .5, .5), dimImg=0.45, fx=[check("Day 6", [it("SHELTER", "half", "25%"), it("WATER", "tick"), it("FOOD", "half")], stamp="BACK ON TRACK")])
S(123, cam=(1.04, .45, .5, 1.12, .45, .5))
S(124, cam=(2.1, .5, .66, 2.25, .5, .66))
# =================== 4 · Eleven Percent ===================
S(125, "D7a", (1.04, .5, .5, 1.1, .55, .5), fx=[day(7)])
S(126, "D7b", (1.0, .5, .5, 1.15, .5, .5))
S(127, "D7b", (1.15, .5, .5, 1.15, .5, .5), dimImg=0.45, fx=[check("Day 7", [it("SHELTER", "half", "50%"), it("WATER", "tick"), it("FOOD", "half")])])
S(128, cam=(1.04, .5, .5, 1.12, .5, .5))
S(129, cam=(1.04, .5, .5, 1.12, .55, .55))
S(130, cam=(1.04, .4, .5, 1.1, .35, .45))
S(131, "D7c", (1.12, .42, .5, 1.12, .58, .5))
S(132, "D7d", (1.1, .4, .5, 1.25, .35, .55), fx=[bat(21, at=0.4)])
S(133, "D7d", (1.25, .35, .55, 1.3, .35, .55), blur=4, fx=[("photos", {"imgs": ["D1a"], "at": 0.1})])
S(134, "D7d", (1.3, .35, .55, 1.32, .35, .55), blur=4, fx=[("photos", {"imgs": ["n:134"], "at": 0.05})])
S(135, "D7d", (1.32, .35, .55, 1.34, .35, .55), blur=4, fx=[("photos", {"imgs": ["n:135"], "at": 0.05})])
S(136, cam=(1.04, .5, .5, 1.12, .5, .5), handheld=True)
S(137, cam=(2.0, .25, .42, 2.1, .25, .42), handheld=True)
S(138, cam=(1.4, .45, .5, 1.45, .45, .5), handheld=True)
S(139, cam=(2.0, .6, .62, 2.1, .6, .62), handheld=True)
S(140, "D7d", (1.8, .72, .7, 1.9, .72, .7), fx=[("dim", {"at": 0.3, "to": 0.6, "dur": 1.2})])
S(141, cam=(1.04, .5, .45, 1.1, .5, .42))
S(142, cam=(1.1, .5, .42, 1.14, .5, .42))
S(143, "n:128", (1.0, .5, .5, 1.06, .5, .5))
S(144, "n:128", (1.8, .35, .55, 1.9, .35, .55))
S(145, "D7c", (1.3, .5, .5, 1.35, .5, .5))
S(146, cam=(1.04, .45, .45, 1.12, .45, .42))
S(147, cam=(1.12, .45, .55, 1.04, .45, .5))
S(148, "D7c", (1.3, .5, .5, 1.3, .5, .5), blur=6, fx=[bat(21, 11, at=0.3), card("10% GONE ON HOME", at="w:ten")])
S(149, "D7c", (1.4, .55, .55, 1.45, .55, .55), grade="warm")
S(150, "D7e", (1.0, .5, .5, 1.08, .5, .5))
S(151, "D7e", (1.25, .5, .5, 1.02, .5, .5), grade="warm")
# =================== 5 · The Thing in the Tunnel ===================
S(152, cam=(1.05, .5, .5, 1.12, .5, .5), fx=[day(8)])
S(153, cam=(1.05, .5, .5, 1.1, .6, .5))
S(154, "n:153", (1.15, .5, .5, 1.15, .5, .5), dimImg=0.45, fx=[check("Day 8", [it("TUNNEL", "tick"), it("DOOR"), it("WATER", "tick"), it("FOOD", "half")])])
S(155, "D6d", (1.0, .5, .5, 1.08, .5, .5))
S(156, "D6d", (1.5, .3, .45, 1.55, .3, .45), fx=[("dim", {"at": 0.4, "to": 0.5, "dur": 1.2})])
S(157, "D8a", (1.05, .5, .5, 1.08, .5, .5))
S(158, "D8a", (1.5, .5, .55, 1.65, .5, .55))
S(159, "D8b", (1.3, .5, .5, 1.36, .5, .5))
S(160, "D8b", (1.05, .5, .5, 1.12, .5, .5), shake=1.5)
S(161, "c:D8c", (1, .5, .5, 1.04, .5, .5), **{"in": [0, 7.5]})
S(162, "D8c", (1.1, .5, .5, 1.15, .5, .5))
S(163, "D8c", (1.6, .5, .5, 1.7, .5, .5), punch=True)
S(164, "D8c", (1.3, .55, .5, 1.35, .55, .5))
S(165, "D8d", (1.1, .5, .5, 1.15, .5, .5), hits=["w:lunges"], fx=[("redflash", {"at": "w:claws"})])
S(166, "D8d", (1.7, .3, .4, 1.8, .3, .4))
S(167, "D8e", (1.6, .28, .45, 1.6, .28, .45))
S(168, "D8e", (1.6, .28, .45, 1.6, .28, .45), blur=6, fx=[bat(11, at=0.3)])
S(169, "c:D8e", (1, .5, .5, 1.03, .5, .5), tr="flash", **{"in": [0, 5.0]})
S(170, "D8e", (1.2, .5, .5, 1.25, .5, .5), pulses=True)
S(171, "D8f", (1.8, .75, .45, 1.9, .75, .45), fx=[("dust", {"n": 40})])
S(172, "D8f", (1.05, .5, .5, 1.1, .5, .5))
S(173, "D8f", (2.0, .58, .75, 2.1, .58, .75))
S(174, "D8f", (1.1, .5, .5, 1.1, .5, .5), blur=6, fx=[bat(11, 3, at=0.4), card("DEAD IN AN HOUR", "dawn is five hours away", at="w:dead")])
S(175, cam=(1.05, .5, .5, 1.1, .5, .5))
S(176, "D8a", (1.6, .5, .5, 1.7, .5, .5), grade="dim")
S(177, "black")
S(178, "D8f", (1.05, .5, .5, 1.12, .5, .5), fx=[("dawn", {"from": 0.6, "to": 0.0})])
S(179, "D8f", (1.12, .5, .5, 1.12, .5, .5), blur=6, fx=[bat(3, at=0.05)])
S(180, "D9a", (1.05, .5, .5, 1.12, .5, .5), grade="fever", fx=[day(9)])
S(181, "D9a", (1.4, .25, .55, 1.5, .25, .55), grade="fever")
S(182, cam=(1.05, .45, .5, 1.12, .5, .5))
S(183, cam=(1.04, .5, .5, 1.1, .45, .5))
S(184, cam=(2.0, .42, .5, 2.15, .42, .5))
S(185, "D9b", (1.05, .5, .5, 1.12, .45, .5))
S(186, "D9b", (1.15, .5, .5, 1.15, .5, .5), dimImg=0.45, fx=[check("Day 9", [it("SHELTER", "tick"), it("WATER", "tick"), it("FOOD", "half", "12 fish")], stamp="2 OF 3")])
S(187, "D9b", (2.1, .48, .33, 2.2, .48, .33))
S(188, "D9b", (2.0, .78, .82, 2.1, .78, .82))
# =================== 6 · The Last Normal Morning ===================
S(189, "D9b", (2.3, .55, .45, 2.4, .55, .45))
S(190, "D9b", (2.3, .55, .45, 2.3, .55, .45), dimImg=0.4, fx=[("msg", {"lines": ["IMPACT: TOMORROW"], "at": 0.05}), bat(2, at=0.4)])
S(191, "D9b", (2.1, .48, .33, 2.15, .48, .33), fx=[("dim", {"at": "e:0.9", "to": 0.85})])
S(192, "D9c", (1.12, .5, .7, 1.12, .5, .3))
S(193, "D9d", (1.0, .5, .5, 1.12, .5, .5))
S(194, "D9c", (1.25, .5, .4, 1.0, .5, .5))
S(195, "D10a", (1.04, .45, .5, 1.1, .55, .5), fx=[day(10)])
S(196, "D10a", (1.3, .62, .45, 1.36, .62, .45))
S(197, "D10a", (2.0, .33, .42, 2.1, .33, .42))
S(198, "c:D10b-light", (1.16, .58, .45, 1.2, .58, .45), **{"in": [0, 7.9]})
S(199, "black", fx=[("dim", {"at": 0.0, "to": 1, "dur": 0.12, "color": "#fffbe8"}), ("clock", {"text": "IMPACT +0 MIN", "at": 0.3})])
S(200, "n:045", (1.1, .5, .5, 1.14, .5, .5), shake=3)
S(201, "D10a", (1.12, .5, .5, 1.16, .5, .5), shake=12, fx=[("dust", {"n": 60}), ("clock", {"text": "+6 MIN", "at": 0.1})])
S(202, "c:D10c-wave", (1.02, .5, .5, 1.06, .5, .5), shake=4, **{"in": [0, 4.6]})
S(203, "D10c", (1.05, .5, .5, 1.12, .5, .5), shake=3)
S(204, "D10d", (1.2, .55, .45, 1.35, .25, .6))
S(205, "D10e", (1.12, .5, .5, 1.18, .5, .5), handheld=True)
S(206, "D10e", (1.2, .5, .5, 1.2, .5, .5), dimImg=0.45, fx=[check("Day 10", [it("SHELTER", "tick"), it("WATER", "tick"), it("FOOD", "tick")])])
S(207, "D10e", (1.7, .45, .6, 1.8, .45, .6))
S(208, "D10e", (1.2, .5, .5, 1.2, .5, .5), blur=8, fx=[card("NORTH DAKOTA", "fossil fish with impact glass in their gills", at="w:north")])
S(209, "D10g", (1.5, .52, .33, 1.6, .52, .33), fx=[("glass", {}), ("clock", {"text": "+20 MIN", "at": 0.1})])
S(210, "H2", (1.04, .5, .5, 1.1, .5, .5), grade="red", fx=[("embers", {})])
S(211, cam=(1.04, .5, .5, 1.1, .45, .5), shake=2)
S(212, "H2", (1.3, .6, .4, 1.38, .6, .4), fx=[("embers", {}), ("clock", {"text": "+45 MIN", "at": 0.1})])
S(213, "D10i", (1.3, .5, .3, 1.36, .5, .3), fx=[("embers", {})])
S(214, "H1", (1.3, .4, .48, 1.34, .4, .48), shake=3, fx=[("dust", {"n": 30})], hits=["w:heavy", "w:slow", "w:close"])
S(215, "H1", (1.28, .42, .48, 1.3, .42, .48), hits=["w:collapses"], fx=[("shadow", {"at": "w:shadow"})])
S(216, "H3", (1.3, .55, .45, 1.45, .5, .5))
S(217, "c:H3-breath-v3", (1, .5, .5, 1.05, .5, .5), **{"in": [0, 7.9]})
S(218, "D10i", (1.0, .5, .5, 1.08, .5, .5), fx=[("embers", {"n": 30})])
S(219, "D10i", (1.6, .45, .6, 1.7, .45, .6))
S(220, "H1", (1.6, .3, .5, 1.68, .3, .5), grade="dim")
S(221, "H3", (1.45, .5, .5, 1.55, .5, .5), grade="dim")
S(222, "black")
S(223, "black")
S(224, "D10j", (1.0, .5, .5, 1.05, .5, .5), fx=[("ash", {})], tr="fade")
# =================== 7 · Stay Small ===================
S(225, cam=(1.04, .5, .5, 1.1, .5, .55), fx=[("ash", {"n": 25})])
S(226, "n:225", (1.1, .5, .5, 1.1, .5, .5), blur=8, fx=[("layers", {"at": 0.05})])
S(227, "n:017", (1.0, .5, .5, 1.1, .45, .42), grade="night")
S(228, cam=(1.0, .45, .4, 2.0, .42, .3), scar={"x1": .381, "y1": .276, "x2": .45, "y2": .321, "at": "w:long"})
S(229, cam=(1.05, .5, .45, 1.1, .5, .42))
S(230, "n:136", (1.04, .5, .5, 1.12, .55, .35), handheld=True, grade="sepia")
S(231, cam=(1.04, .5, .5, 1.12, .55, .4))
S(232, "n:136", (2.0, .25, .42, 2.1, .25, .42), handheld=True)
S(233, "D11a", (1.12, .42, .5, 1.12, .58, .5), grade="grey", fx=[("ash", {})])
S(234, cam=(1.04, .5, .5, 1.1, .5, .5), fx=[("ash", {})])
S(235, cam=(1.04, .5, .5, 1.12, .5, .55), fx=[("ash", {})])
S(236, "D11a", (1.2, .5, .5, 1.2, .5, .5), blur=8, grade="grey", fx=[("ash", {}), card("IMPACT WINTER", "months. maybe years.", at="w:impact")])
S(237, cam=(1.04, .45, .5, 1.12, .4, .5), fx=[("embers", {"n": 25})])
S(238, cam=(1.04, .5, .5, 1.1, .55, .5))
S(239, cam=(1.04, .5, .5, 1.12, .5, .5))
S(240, "D11c", (2.0, .83, .86, 2.1, .83, .86))
S(241, "D11c", (1.05, .5, .5, 1.1, .5, .5))
S(242, "D11c", (1.12, .5, .5, 1.15, .5, .5), dimImg=0.45,
  fx=[("tally", {"rows": [["INVENTORY", "w:inventory"], ["DAYS AFTER THE END: 40", "w:days"], ["DRIED FISH: 7", "w:dried"], ["DINOSAURS LEFT: 0", "w:dinosaurs"], ["FRIENDS: 1", "w:friends"]]})])
S(243, "D11c", (1.15, .5, .5, 1.15, .5, .5), blur=6,
  fx=[("rules3", {"items": [["STAY SMALL", "w:stay"], ["STAY NEAR WATER", "w:near"], ["STAY UNDERGROUND", "w:underground"]]})])
S(244, "D11d", (1.05, .5, .5, 1.12, .5, .5))
S(245, "D11d", (1.12, .5, .5, 1.12, .5, .5), fx=[rule("STAY SMALL… BUT DON'T STAY ALONE", 0.05, warm=True)])
S(246, "D2e", (1.05, .5, .45, 1.15, .5, .6))
S(247, "D2e", (1.15, .5, .75, 1.05, .5, .35), fx=[("tree", {"items": [["HORSES", "w:horses"], ["WHALES", "w:whales"], ["APES", "w:apes"], ["PEOPLE", "w:people"]]})])
S(248, "D11-phone", (1.1, .5, .5, 1.35, .5, .45))
S(249, "D11f", (1.0, .5, .5, 1.08, .5, .5), fx=[("glow", {"at": "w:bird"})])
S(250, "D11c", (1.8, .62, .5, 1.9, .62, .5))
S(251, "D11c", (1.12, .5, .5, 1.15, .5, .5), dimImg=0.45, fx=[("rewrite", {"old": "DINOSAURS LEFT: 0", "new": "…EXCEPT THE BIRDS", "at": 0.05, "add": "w:except"})])
S(252, "D11d", (1.3, .5, .5, 1.35, .5, .5), fx=[("card", {"title": "DAY ONE: WHAT WOULD YOU DO FIRST?", "sub": "Tell me in the comments", "at": "w:tell"})])
S(253, "D11d", (2.0, .7, .45, 2.1, .7, .45), grade="warm")
S(254, "black", fx=[("title", {"text": "STAY SMALL. STAY ALIVE.", "at": 0.05}), ("card", {"title": "SUBSCRIBE", "sub": "for the next countdown", "at": 1.6})])

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
        if "add" in p: p["add"] = T(p["add"], n)
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
