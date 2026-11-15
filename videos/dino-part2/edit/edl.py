# Part 2 EDL: frames.json (shot timing) + per-shot direction -> src/dino-p2/edl.json
# cam = [z0, x0, y0, z1, x1, y1]  (zoom, focus point in image coords 0..1)
import json, os, re
H = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(os.path.join(H, "frames.json")))
TL = [x for x in json.load(open(os.path.join(H, "../voice/timeline.json"))) if "text" in x]
TAIL = 6.0  # end card after the last line

def mood_at(t):
    for x in TL:
        if x["t"] - 0.6 <= t <= x["t"] + x["dur"]: return x["mood"]
    return "story"

# ---------- picture for each shot: (img, cam focus/zoom, extra) ----------
# img: p:NNN Part 2 frame · e:NNN Part 1 EN frame · Dxx Part 1 shot · c:NNN clip · a:file asset · cut:file
P = {}  # id -> dict(img=..., f=(x,y,z)) ; f = crop focus + zoom (z>1 = crop)
def p(i, img, x=0.5, y=0.5, z=1.0, **kw): P[str(i)] = dict(img=img, f=(x, y, z), **kw)

# 0 · Seven Fish
p(1, "a:T2-tunnel-door.jpg", .55, .55, 1.0, fx=["flicker"], tr="fade")
p(2, "p:002"); p(3, "p:004", .5, .38, 2.2, fx=["flicker"]); p(4, "p:004", .5, .45, 1.0, par="004", fx=["flicker"])
p(5, "p:004", .22, .24, 2.6, fx=["flicker"]); p(6, "p:004", .8, .56, 2.4, fx=["flicker"])
p(7, "p:012", .5, .5, 1.2, card=("bigcard", "7 → 0", "FISH LEFT"))
p(8, "black")
p(9, "a:T1-tunnel-section.jpg", .45, .55, 1.0)
p(10, "p:147", .3, .5, 1.0, card=("title", "AFTER THE ASTEROID · PART 2"), fx=["snow"], hits=[0.3])
# 1 · The Last of Them
p(11, "p:086", .86, .48, 2.0, fx=["flicker"], tr="fade"); p(12, "p:012", fx=["flicker"])
p(13, "D11a", fx=["ash"]); p(14, "e:235", fx=["ash"])
p(15, "p:016", .3, .4, 1.3, fx=["ash"], grade="memory"); p(16, "p:016", fx=["ash"], grade="memory"); p(17, "p:016", .78, .28, 2.6, grade="memory")
p(18, "p:018", grade="memory"); p(19, "p:020", .4, .55, 1.5, grade="memory"); p(20, "p:020", par="020", grade="memory")
p(21, "p:020", .52, .47, 3.0, grade="memory"); p(22, "p:020", .2, .47, 3.4, grade="memory"); p(23, "p:023", grade="memory", fx=["ash"])
p(24, "e:234", fx=["ash"]); p(25, "e:234", .5, .5, 1.15, card=("bigcard", "NO SUN → NO PLANTS", "no plant-eaters · then no hunters"))
p(26, "p:023", .5, .5, 1.2, card=("bigcard", "THE HUNGER.", "not the fire. the hunger after it.", "#ffcf86"))
p(27, "p:147", fx=["snow"])
p(28, "p:028"); p(29, "p:029"); p(30, "p:030", .55, .45, 1.05, grade="memory")
p(31, "p:080", .45, .45, 1.5, fx=["flicker"]); p(32, "p:032", grade="memory"); p(33, "p:030", .27, .5, 2.4, grade="memory")
p(34, "D1a", .86, .2, 3.0, grade="memory"); p(35, "D1a", .53, .22, 2.6, grade="memory")
p(36, "D1e", grade="memory"); p(37, "p:023", .65, .65, 1.4, grade="memory")
# 2 · Meanwhile
p(38, "a:P7-street.jpg", .5, .5, 1.0, day="NOW · DAY 50 MISSING", tr="fade", poster=dict(x=.683, y=.382, w=.095, rot=1)); p(39, "p:039"); p(40, "p:040"); p(41, "p:041")
p(42, "a:P7-street.jpg", .45, .6, 1.25, poster=dict(x=.683, y=.382, w=.095, rot=1)); p(43, "a:P7-street.jpg", .683, .38, 2.4, poster=dict(x=.683, y=.382, w=.095, rot=1))
p(44, "p:044"); p(45, "p:045"); p(46, "p:046"); p(47, "p:049", .35, .6, 1.6); p(48, "e:231")
p(49, "p:049", punch=True); p(50, "p:049", .34, .62, 2.6); p(51, "e:136", grade="memory"); p(52, "p:049", .34, .6, 3.0)
# 3 · Eat What Eats the Dead
p(53, "p:053", .5, .5, 1.0, par="053", fx=["flicker"], tr="fade"); p(54, "p:053", .5, .6, 2.4, fx=["flicker"])
p(55, "p:055", fx=["snow"]); p(56, "p:055", .38, .72, 2.4, fx=["snow"]); p(57, "p:103", .5, .6, 1.5, fx=["snow"])
p(58, "p:058"); p(59, "p:058", .62, .5, 2.6); p(60, "p:060"); p(61, "p:061", fx=["snow"])
p(62, "p:062", fx=["snow"]); p(63, "p:062", .82, .62, 2.4); p(64, "p:062", .5, .5, 1.0, fx=["snow"]); p(65, "p:062", .33, .42, 2.0)
p(66, "p:066", fx=["flicker"]); p(67, "p:066", .42, .6, 2.0, fx=["flicker"]); p(68, "p:066", .47, .45, 1.9, fx=["flicker"])
p(69, "p:066", .5, .5, 1.1, card=("rule", "⚠ ANIMALS CAN EAT WHAT KILLS YOU"))
p(70, "p:004", .35, .35, 1.6, fx=["flicker"]); p(71, "p:004", .22, .24, 2.2, card=("rule", "ONE DAY PROVES NOTHING"))
p(72, "p:066", .63, .46, 3.4); p(73, "p:075", .6, .6, 1.6, fx=["snow"]); p(74, "p:075", .62, .78, 2.6); p(75, "p:075", fx=["snow"])
p(76, "p:062", .5, .5, 1.1, card=("bigcard", "FRESH PLANTS ✗", "the things that live on the dead ✓"))
p(77, "p:075", .5, .5, 1.1, card=("rule", "RULE 4: EAT WHAT EATS THE DEAD", None, True))
p(78, "p:078", fx=["flicker"])
p(79, "p:078", .5, .5, 1.1, checklist=("FOOD · WATER · FIRE", [("grub logs at the door", "tick"), ("white fungus only", "tick"), ("sand-pit water", "tick"), ("coals under the ash", "tick")]))
# 4 · A Message for Mom
p(80, "p:080", fx=["flicker"], tr="fade"); p(81, "p:081"); p(82, "p:086", .6, .22, 3.2, fx=["flicker"]); p(83, "p:086", .43, .82, 3.4, fx=["flicker"])
p(84, "p:086", .35, .5, 1.3, fx=["flicker"]); p(85, "p:086", .2, .78, 2.8, fx=["flicker"]); p(86, "p:086", fx=["flicker"])
p(87, "p:086", .77, .35, 2.6, fx=["flicker"]); p("87a", "p:086", .6, .25, 2.8, fx=["flicker"])
p(88, "p:086", .6, .45, 1.15, checklist=("WINTER PLAN", [("food that keeps", "empty"), ("water when the river freezes", "empty"), ("firewood", "empty"), ("a deeper shelter", "empty", "?"), ("meat", "empty", "?")]))
p(89, "p:030", .6, .4, 1.4, grade="memory"); p(90, "p:086", .6, .22, 3.8, fx=["flicker"])
p(91, "p:093", .5, .5, 1.2, card=("bigcard", "1 IN MILLIONS", "almost nothing becomes a fossil"))
p(92, "e:225"); p(93, "p:093", fx=["flicker"]); p(94, "p:093", .75, .22, 2.6, fx=["flicker"])
p(95, "p:095", par="095", fx=["flicker"]); p(96, "p:095", .45, .6, 1.6, fx=["flicker"]); p(97, "p:095", .5, .63, 2.6, fx=["flicker"])
p(98, "p:095", .42, .71, 3.0, hand=dict(x=.42, y=.715, ww=.2, rot=-6, at=0.4, dur=3.0)); p(99, "e:136", grade="memory")
p(100, "p:093", .595, .78, 2.6, punch=True, hand=dict(x=.597, y=.8, ww=.13, rot=-6, at=0.15, dur=1.2, color="rgba(40,22,10,.95)"), fx=["flicker"])
# 5 · The River at Dawn
p(101, "a:T2-tunnel-door.jpg", .5, .5, 1.0, tr="fade"); p(102, "p:075", .3, .75, 2.2, fx=["snow"]); p(103, "p:103", fx=["snow"])
p(104, "p:103", .25, .85, 2.8, fx=["snow"]); p(105, "p:105", fx=["snow"]); p(106, "p:105", .45, .6, 2.4, grade="colder", fx=["snow"])
p(107, "p:107", fx=["snow"]); p(108, "p:105", .5, .5, 1.1, grade="colder", card=("bigcard", "COLD-BLOODED", "the colder it is, the slower they move"))
p(109, "p:109", par="109", fx=["snow"]); p(110, "p:110", fx=["snow"]); p(111, "p:111", par="111", fx=["snow"])
p(112, "p:103", .5, .62, 1.6, fx=["snow"], grade="colder"); p(113, "p:111", .13, .48, 3.0, punch=True, fx=["snow"])
p(114, "p:111", .8, .72, 2.3, fx=["snow"], grade="colder"); p(115, "p:115", par="115", fx=["snow"], hits=["snap"], flash="snap")
p(116, "p:115", .78, .45, 2.2, grade="colder", fx=["snow"]); p(117, "p:117", par="117", fx=["snow"])
p(118, "p:118", par="118"); p(119, "p:118", .4, .35, 3.0); p("119a", "p:118", .42, .6, 2.8)
p(120, "p:121", .5, .5, 1.0, day="NOW · DAY 66 MISSING", tr="fade"); p(121, "p:121", par="121"); p(122, "p:122")
p(123, "p:122", .12, .42, 2.6); p(124, "p:121", .33, .58, 3.2); p(125, "p:125"); p(126, "p:125", .5, .6, 1.0, grade="night"); p(127, "p:122", .12, .42, 3.4)
# 6 · The Night the Fire Died
p(128, "p:129", .88, .45, 2.4, tr="fade"); p(129, "p:129", grade="colder"); p(130, "p:130"); p(131, "p:129", .65, .7, 2.2)
p(132, "p:129", .5, .5, 1.1, card=("rule", "SMOKE KILLS QUIETLY")); p(133, "c:133", hits=[1.2]); p(134, "p:129", .42, .5, 3.2)
p(135, "p:135"); p(136, "p:078", .35, .75, 2.2); p(137, "p:137")
p(138, "c:137", clip=(0.0, 4.0)); p(139, "c:137", clip=(4.0, 7.9), fx=["glow"])
p(140, "p:140", fx=["flicker"]); p(141, "p:141", fx=["snow"]); p(142, "p:142", .6, .55, 1.3, fx=["flicker"]); p(143, "p:143", fx=["flicker"])
p(144, "p:086", .86, .45, 2.4, fx=["flicker"])
p(145, "p:086", .6, .45, 1.15, checklist=("WINTER PLAN", [("food that keeps", "tick"), ("water when the river freezes", "tick"), ("firewood", "tick"), ("a deeper shelter", "empty", "?"), ("meat", "empty", "?")]))
p(146, "a:T3-tunnel-end.jpg"); p("146a", "p:086", .86, .45, 2.0, card=("bigcard", "MEAT ?", None, "#ffcf86"))
p("146b", "c:146b"); p("146c", "p:146b", .75, .45, 2.4, fx=["flicker"], punch=True)
# 7 · Not Alone
p(147, "p:147", fx=["snow"], tr="fade"); p(148, "p:153", .53, .55, 3.0); p(149, "c:149", fx=["snow"])
p(150, "p:149-close", .6, .55, 2.6, fx=["snow"]); p(151, "p:149-close", .5, .6, 1.5, fx=["snow"]); p(152, "p:053", .4, .25, 2.6, fx=["flicker"])
p(153, "p:153"); p(154, "p:086", .86, .45, 2.4, fx=["flicker"])
p(155, "p:086", .86, .45, 2.0, rewrite=("FRIENDS: ONE", "…AND ONE MORE"))
# 8 · Sixty-Six Million Years Later
p(156, "a:P8-dig-site.jpg", day="NOW · DAY 76 MISSING", tr="fade"); p(157, "c:157", clip=(0.0, 5.0)); p(158, "c:157", clip=(5.0, 7.9))
p(159, "p:159", .5, .45, 1.2); p(160, "p:157", .48, .66, 2.4); p(161, "p:159", .45, .4, 1.9, punch=True, hand=dict(x=.47, y=.4, ww=.5, rot=-14, at=0.1, dur=1.0, color="rgba(28,18,10,.85)"))
p(162, "p:157", .62, .25, 2.6, cta=True); p(163, "p:159", .5, .45, 1.3, hand=dict(x=.47, y=.4, ww=.5, rot=-14, at=-9, dur=0.1, color="rgba(28,18,10,.85)"), endcard=True)

# ---------- build ----------
DAYTAGS = {"1": "DAY 49", "11": "DAY 40", "53": "DAY 47", "80": "DAY 52", "147": "DAY 64"}
shots, prev_z = [], 1.0
for k, r in enumerate(R):
    d = P[r["id"]]
    s = R[k]["start"] - (0.12 if k else R[0]["start"])
    e = (R[k + 1]["start"] - 0.12) if k + 1 < len(R) else R[-1]["end"] + TAIL
    if k == 0: s = 0.0
    mood = mood_at(r["start"] + 0.2)
    x, y, z = d["f"]
    # camera move by mood: tense = faster push, sad = slow push, story = gentle
    dz = {"tense": 0.14, "story": 0.07, "sad": 0.045}[mood]
    if d["img"].startswith("c:"): dz = 0.03
    if k % 2 and mood != "tense" and z <= 1.2:   # alternate: pull out
        cam = [z + dz, x, y, z, x, y]
    else:
        cam = [z, x, y, z + dz, x + (0.02 if k % 3 == 0 else -0.015 if k % 3 == 1 else 0), y]
    sh = dict(n=k, id=r["id"], s=round(s, 3), e=round(e, 3), img=d["img"], cam=[round(v, 4) for v in cam], fx=[], hits=[])
    # snap moment inside 115
    snap = None
    if r["id"] == "115":
        a = [x for x in TL if x["i"] == 58][0]; txt = "".join(a["alignment"]["characters"]); j = txt.find("close,")
        snap = a["t"] + a["alignment"]["character_start_times_seconds"][j]
    for h in d.get("hits", []): sh["hits"].append(round(snap if h == "snap" else s + h, 3))
    if d.get("flash"): sh["fx"].append(dict(kind="redflash", at=round(snap, 3)))
    if d.get("grade"): sh["grade"] = d["grade"]
    if d.get("tr"): sh["tr"] = d["tr"]
    if d.get("punch"): sh["punch"] = True
    if d.get("par"): sh["par"] = dict(bg=f"cut:bg-{d['par']}.jpg", fg=f"cut:fg-{d['par']}.png", amt=1.6 if mood != "sad" else 0.9)
    if d.get("clip"): sh["in"] = list(d["clip"])
    if d.get("poster"): sh["poster"] = d["poster"]
    if d.get("hand"): sh["hand"] = dict(d["hand"], at=round(s + d["hand"]["at"], 3))
    for f in d.get("fx", []):
        if f == "snow": sh["fx"].append(dict(kind="snow", at=s, n=70))
        elif f == "ash": sh["fx"].append(dict(kind="ash", at=s, n=45))
        elif f == "flicker": sh["fx"].append(dict(kind="flicker", at=s, x=.3, y=.8, amt=0.3))
        elif f == "glow": sh["fx"].append(dict(kind="glow", at=s + 1.2))
    if any(f == "snow" for f in d.get("fx", [])) or d.get("grade") in ("cold", "colder"): sh["fx"].append(dict(kind="cold", at=s))
    if r["id"] in DAYTAGS: sh["fx"].append(dict(kind="day", at=s + 0.3, text=DAYTAGS[r["id"]]))
    if d.get("day"): sh["fx"].append(dict(kind="day", at=s + 0.3, text=d["day"]))
    if d.get("card"):
        c = d["card"]; at = s + 0.25
        if c[0] == "bigcard": sh["fx"].append(dict(kind="bigcard", at=at, text=c[1], sub=c[2], color=c[3] if len(c) > 3 else None))
        elif c[0] == "rule": sh["fx"].append(dict(kind="rule", at=at, text=c[1], warm=bool(c[3]) if len(c) > 3 else False))
        elif c[0] == "title": sh["fx"].append(dict(kind="title", at=at, text=c[1]))
    if d.get("checklist"):
        title, items = d["checklist"]
        sh["fx"].append(dict(kind="dim", at=s, to=0.45, dur=0.4))
        sh["fx"].append(dict(kind="checklist", at=s + 0.2, title=title, items=[dict(text=i[0], state=i[1], note=i[2] if len(i) > 2 else None) for i in items]))
    if d.get("rewrite"):
        sh["fx"].append(dict(kind="dim", at=s, to=0.5, dur=0.4))
        a = [x for x in TL if "and one more" in x["text"].lower()][0]; txt = "".join(a["alignment"]["characters"]).lower(); j = txt.find("and one more")
        sh["fx"].append(dict(kind="rewrite", at=s + 0.2, add=round(a["t"] + a["alignment"]["character_start_times_seconds"][j] - 0.3, 3), old=d["rewrite"][0], new=d["rewrite"][1]))
    if d.get("cta"): sh["fx"].append(dict(kind="cta", at=s + 1.5, q="WHAT WOULD YOU WRITE ON THE BONE?"))
    if d.get("endcard"):
        sh["fx"].append(dict(kind="cta", at=s, q="WHAT WOULD YOU WRITE ON THE BONE?")); sh["fx"].append(dict(kind="endcard", at=s + 0.3))
    if mood == "tense" and not d.get("par") and not d["img"].startswith("c:"): sh["handheld"] = True
    shots.append(sh)
total = shots[-1]["e"]
look = [[s["n"], round(0.6 * (s["e"] - s["s"]), 2)] for s in shots]
out = os.path.join(H, "../../../src/dino-p2/edl.json")
json.dump(dict(total=round(total, 3), shots=shots, look=look), open(out, "w"), ensure_ascii=False)
print(len(shots), "shots", round(total, 1), "s", "| tense", sum(1 for s in shots if s.get("handheld")), "| par", sum(1 for s in shots if s.get("par")),
      "| clips", sum(1 for s in shots if s["img"].startswith("c:")))
short = [(s["id"], round(s["e"] - s["s"], 2)) for s in shots if s["e"] - s["s"] < 1.0]
print("short shots:", short)
