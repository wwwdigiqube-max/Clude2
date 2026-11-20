# Part 3 EDL: frames.json (shot timing) + per-shot direction -> src/dino-p3/edl.json
# img: p:NNN Part 3 frame · q:NNN Part 2 frame · e:NNN Part 1 EN frame · Dxx Part 1 shot · a:file Part 3 asset · b:file Part 2 asset · black
import json, os
H = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(os.path.join(H, "frames.json")))
TL = [x for x in json.load(open(os.path.join(H, "../voice/timeline.json"))) if "text" in x]
TAGS = [x for x in json.load(open(os.path.join(H, "../voice/timeline.json"))) if "tag" in x]
TAIL = 6.0
MOM_INK = dict(ink="dino-p2/human/mom-i-survived-ink.png", ar="1138 / 226")
GONE_INK = dict(ink="dino-p3/human/gone-day88-ink.png", ar="654 / 520")

def mood_at(t):
    for x in TL:
        if x["t"] - 0.6 <= t <= x["t"] + x["dur"]: return x["mood"]
    return "story"

P = {}
def p(i, img, x=0.5, y=0.5, z=1.0, **kw): P[str(i)] = dict(img=img, f=(x, y, z), **kw)
Q4, Q3, Q5, Q7, Q8, Q6, Q1, T1 = "a:Q4-frozen-river.jpeg", "a:Q3-turtle-sheet.jpeg", "a:Q5-chamber-chimney.jpeg", "a:Q7-book-map.jpeg", "a:Q8-museum-backroom.jpeg", "a:Q6-tinder-fungus.jpeg", "a:Q1-hero-journey.jpeg", "b:T1-tunnel-section.jpg"

# 0 · The Shape Under the Ice
p(1, "p:001", par="001", fx=["snow"], tr="fade"); p(2, "p:001", .3, .82, 2.4, fx=["snow"])
p(3, "p:003", .5, .55, 1.1); p(4, "p:003", .5, .62, 1.8); p(5, "p:005", .45, .6, 1.15, fx=["snow"])
p(6, "e:079", grade="memory"); p(7, "p:003", .48, .6, 1.5); p(8, "p:001", .47, .52, 2.8, fx=["snow"])
p(9, "p:009", fx=["snow"], hits=[0.2], punch=True); p(10, "p:010", fx=["snow"], card=("title", "AFTER THE ASTEROID · PART 3"), cardat=0.9)
# 1 · The Cold Comes After
p(11, Q4, .5, .5, 1.05, fx=["snow"], card=("bigcard", "FIVE DAYS EARLIER", None)); p(12, "D10i"); p(13, "e:234", fx=["ash"]); p(14, "D11a", fx=["ash"])
p(15, Q4, .5, .5, 1.1, fx=["snow"], card=("bigcard", "IMPACT WINTER", "the sun is up there. it just can't get through.")); p(16, "q:103", fx=["snow"])
p(17, Q4, .4, .75, 1.8, fx=["snow"]); p(18, Q4, fx=["snow"]); p(19, "p:019", .5, .6, 1.05); p(20, "p:019", .5, .82, 2.0)
p(21, Q4, .25, .6, 1.6, fx=["snow"]); p(22, "p:022", fx=["snow"]); p(23, "p:022", .5, .5, 2.0, card=("bigcard", "REAL", "alligators do this today, in frozen swamps"))
p(24, "p:024", fx=["snow"]); p(25, "p:025", fx=["snow"]); p(26, "p:025", .62, .75, 2.4, fx=["snow"]); p(27, "p:019", .5, .7, 1.3)
p(28, "p:019", .5, .82, 2.4); p(29, "p:025", .6, .72, 2.0, fx=["snow"]); p(30, "q:146b", .43, .65, 2.4, fx=["flicker"])
# 2 · The Book
p(31, "p:031", fx=["flicker"], tr="fade"); p(32, "p:031", .66, .72, 2.4, fx=["flicker"]); p(33, "p:033", fx=["flicker"]); p(34, "p:031", .5, .55, 1.25)
p(35, "q:053", fx=["flicker"]); p(36, "p:036", par="036", fx=["flicker"]); p(37, "e:017"); p(38, "p:036", .62, .6, 2.2, fx=["flicker"])
p(39, "e:045"); p(40, "e:045", .84, .72, 2.6); p(41, "p:036", .72, .38, 2.6, fx=["flicker"]); p(42, "p:036", .7, .4, 2.9, fx=["flicker"])
p(43, "p:043"); p(44, "p:044"); p(45, Q4, fx=["snow"]); p(46, "p:036", .62, .62, 1.8, fx=["flicker"]); p(47, "p:047", fx=["flicker"])
p(48, "p:047", .45, .5, 1.4); p(49, "q:080", fx=["flicker"]); p(50, "q:080", .42, .45, 2.4)
# 3 · Meanwhile
p(51, Q8, tr="fade"); p(52, Q8, .63, .6, 2.2); p(53, "p:053"); p(54, "q:157"); p(55, "p:055")
p(56, "q:159", .5, .45, 1.2); p(57, "q:159", .47, .4, 1.6, hand=dict(x=.47, y=.4, ww=.5, rot=-14, at=0.2, dur=1.4, color="rgba(28,18,10,.85)", **MOM_INK))
p(58, "q:122", grade="memory"); p(59, Q8, .38, .35, 2.8); p(60, Q8, .5, .5, 1.05); p(61, "p:061"); p(62, "p:062")
# 4 · Learn to See
p(63, "p:001", .5, .55, 1.15, fx=["snow"], tr="fade"); p(64, "p:003", .5, .6, 1.6)
p(65, "p:003", .5, .55, 1.1, card=("bigcard", "WATER BENDS LIGHT", "the fish is deeper than it looks"))
p(66, "p:001", .47, .52, 2.4, fx=["snow"]); p(67, "p:067", fx=["snow"]); p(68, "p:003", .5, .62, 1.4); p(69, "p:005", .38, .7, 2.0, fx=["snow"])
p(70, "p:070", par="070", fx=["snow"], hits=[0.25]); p(71, "p:071", fx=["snow"]); p(72, "p:072", fx=["flicker"]); p(73, "p:073", par="073", fx=["flicker"])
p(74, "p:073", .76, .8, 2.4, fx=["flicker"]); p(75, Q4, .25, .65, 1.6, fx=["snow"]); p(76, "p:076", fx=["snow"]); p(77, "p:076", .72, .78, 2.6, fx=["snow"])
p(78, Q3, .3, .75, 2.4); p(79, "p:076", .7, .76, 2.0, fx=["snow"]); p(80, "p:080", fx=["flicker"]); p(81, Q3, .58, .72, 2.0)
p(82, "p:080", .32, .45, 2.6, fx=["flicker"]); p(83, "q:086", .82, .35, 2.0, fx=["flicker"], rewrite=("MEAT ?", "FOUND ✓"))
p(84, "p:070", .5, .5, 1.1, card=("rule", "RULE 5: LEARN FROM THE ONES WHO MADE IT", None, True))
# 5 · How Long?
p(85, "p:073", .68, .4, 2.2, fx=["flicker"], tr="fade"); p(86, "q:153"); p(87, T1); p(88, Q7); p(89, Q7, .55, .45, 1.8); p(90, Q7, .35, .55, 1.6)
p(91, "p:091", grade="memory"); p(92, "p:091", .38, .25, 2.6, grade="memory"); p(93, "p:093"); p(94, "p:036", .72, .38, 2.4, fx=["flicker"])
p(95, Q4, fx=["snow"]); p(96, "p:096", fx=["snow"]); p(97, "p:097", fx=["snow"]); p(98, "p:097", .55, .32, 2.2, fx=["snow"])
# 6 · Go Deeper
p(99, "q:147", fx=["snow"], tr="fade"); p(100, "p:100"); p(101, "q:129", .88, .4, 2.0, grade="colder"); p(102, T1)
p(103, T1, .5, .5, 1.1, card=("bigcard", "DEEPER = WARMER", "below the frozen layer, the ground holds its heat")); p(104, "q:058")
p(105, "p:105", fx=["flicker"]); p(106, Q5, .25, .82, 2.2); p(107, "q:130"); p(108, "p:108", fx=["flicker"]); p(109, "p:111"); p(110, "p:111", .55, .12, 2.4)
p(111, Q5, .38, .75, 1.6, fx=["flicker"]); p(112, "p:112", fx=["flicker"]); p(113, "p:112", .5, .6, 1.6, fx=["flicker"])
p(114, "q:086", .82, .35, 2.0, fx=["flicker"], rewrite=("A DEEPER SHELTER ?", "DONE ✓"))
# 7 · Get Ready
p(115, "q:086", fx=["flicker"], tr="fade")
p(116, "q:086", .6, .45, 1.15, checklist=("THE RIVER", [("fish for 2 weeks", "empty"), ("water", "empty"), ("carry the fire", "empty"), ("warm arms", "empty"), ("thick ice", "empty"), ("the book", "tick"), ("the spear", "tick")]))
p(117, "p:070", .55, .4, 1.6, fx=["snow"]); p(118, "p:118", fx=["snow"]); p(119, "q:142", fx=["flicker"]); p(120, "p:120", fx=["flicker"])
p(121, Q3, .5, .7, 2.2); p(122, "p:122", grade="memory"); p(123, "p:122", .5, .35, 2.2, grade="memory")
p(124, Q6, .5, .5, 1.1, card=("bigcard", "ÖTZI · 5,300 YEARS AGO", "he still carried fire in a fungus like this")); p(125, Q6); p(126, Q3, .68, .72, 2.2)
p(127, "p:127"); p(128, "p:128", fx=["flicker"]); p(129, "p:129", fx=["flicker"]); p(130, Q1, .34, .5, 1.45)
p(131, "p:131", fx=["snow"], hits=[0.3])
p(132, "q:086", .6, .45, 1.15, checklist=("THE RIVER", [("fish for 2 weeks", "tick"), ("water", "tick"), ("carry the fire", "tick"), ("warm arms", "tick"), ("thick ice", "tick"), ("the book", "tick"), ("the spear", "tick")]))
p(133, "p:133", par="133", fx=["flicker"]); p(134, "p:133", .57, .43, 2.8, fx=["flicker"]); p(135, "p:133", .57, .42, 3.6, fx=["flicker"]); p(136, "p:133", .5, .2, 2.0, fx=["flicker"])
# 8 · The Dream
p(137, "q:028", tr="fade"); p(138, "q:029"); p(139, "q:040"); p(140, "q:041"); p(141, "p:141"); p(142, "black", fx=["snow"])
p(143, "p:143", fx=["snow", "haze"]); p(144, "p:143", .37, .42, 2.6, fx=["snow", "haze"]); p(145, "p:145", fx=["snow", "haze"]); p(146, "p:145", .32, .62, 2.6, fx=["snow", "haze"])
p(147, "p:145", .32, .62, 3.2, fx=["snow", "haze"]); p(148, "p:150", .5, .45, 1.15, fx=["snow", "haze"]); p(149, "p:143", .35, .45, 2.2, fx=["snow", "haze"])
p(150, "p:150", fx=["snow", "haze"], punch=True); p(151, "p:151", hits=[0.1]); p(152, "p:151", .53, .35, 2.4); p(153, "q:029", .64, .38, 2.6, grade="memory")
# 9 · The Handwriting
p(154, "p:154", tr="fade"); p(155, "q:121"); p(156, "p:156"); p(157, "p:156", .82, .37, 2.6); p(158, "p:156", .82, .35, 3.4); p(159, "p:156", .29, .35, 2.6)
p(160, "p:160"); p(161, "q:159", .5, .45, 1.2, hand=dict(x=.47, y=.4, ww=.5, rot=-14, at=0.1, dur=1.6, color="rgba(28,18,10,.85)", **MOM_INK)); p(162, "p:162")
p(163, "q:159", .32, .4, 2.6, hand=dict(x=.47, y=.4, ww=.5, rot=-14, at=-9, dur=0.1, color="rgba(28,18,10,.85)", **MOM_INK)); p(164, "p:164", grade="memory")
p(165, "p:162", .5, .45, 1.5)
p(166, "p:166", par="166", day="DAY 88", tr="fade"); p(167, "p:166", .44, .65, 2.2); p(168, "p:166", .47, .55, 2.8); p(169, "p:169", par="169")
p(170, T1); p(171, "e:117", grade="memory"); p(172, "e:211", grade="memory"); p(173, "e:183", grade="memory"); p(174, "e:239", grade="memory")
p(175, "p:169", .6, .4, 2.2); p(176, "p:176", hand=dict(x=.76, y=.64, ww=.22, rot=-4, at=1.2, dur=2.4, color="rgba(18,14,10,.88)", **GONE_INK))
p(177, "p:176", .7, .58, 1.8, hand=dict(x=.76, y=.64, ww=.22, rot=-4, at=-9, dur=0.1, color="rgba(18,14,10,.88)", **GONE_INK))
p(178, "p:169", .42, .35, 2.6); p(179, "p:179", par="179", fx=["snow"]); p(180, "p:180", fx=["snow"]); p(181, "p:180", .67, .48, 2.6, fx=["snow"])
p(182, "p:180", .6, .5, 1.05, fx=["snow"], cta=True); p(183, "p:180", .6, .5, 1.2, fx=["snow"], endcard=True)

# ---------- build ----------
tags = {}
for tg in TAGS:
    t = tg["tag"].strip("[]")
    if t.startswith(("DAY", "NOW")): tags[tg["t"]] = t.replace(" AFTER", "").replace("NOW · ", "NOW · ")
Q = "IF YOU HAD TO LEAVE, WHAT WOULD YOU TAKE?"
shots = []
for k, r in enumerate(R):
    d = P[r["id"]]
    s = R[k]["start"] - (0.12 if k else R[0]["start"])
    e = (R[k + 1]["start"] - 0.12) if k + 1 < len(R) else R[-1]["end"] + TAIL
    if k == 0: s = 0.0
    mood = mood_at(r["start"] + 0.2)
    x, y, z = d["f"]
    dz = {"tense": 0.14, "story": 0.07, "sad": 0.045}[mood]
    if k % 2 and mood != "tense" and z <= 1.2: cam = [z + dz, x, y, z, x, y]
    else: cam = [z, x, y, z + dz, x + (0.02 if k % 3 == 0 else -0.015 if k % 3 == 1 else 0), y]
    sh = dict(n=k, id=r["id"], s=round(s, 3), e=round(e, 3), img=d["img"], cam=[round(v, 4) for v in cam], fx=[], hits=[])
    for h in d.get("hits", []): sh["hits"].append(round(s + h, 3))
    for key in ("grade", "tr", "punch"):
        if d.get(key): sh[key] = d[key]
    if d.get("par"): sh["par"] = dict(bg=f"cut:bg-{d['par']}.jpg", fg=f"cut:fg-{d['par']}.png", amt=1.6 if mood != "sad" else 0.9)
    if d.get("hand"): sh["hand"] = dict(d["hand"], at=round(s + d["hand"]["at"], 3))
    for f in d.get("fx", []):
        if f == "snow": sh["fx"].append(dict(kind="snow", at=s, n=70))
        elif f == "ash": sh["fx"].append(dict(kind="ash", at=s, n=45))
        elif f == "flicker": sh["fx"].append(dict(kind="flicker", at=s, x=.3, y=.8, amt=0.3))
        elif f == "haze": sh["fx"].append(dict(kind="haze", at=s))
    if "snow" in d.get("fx", []) or d.get("grade") in ("cold", "colder"): sh["fx"].append(dict(kind="cold", at=s))
    for tt, text in tags.items():
        if s - 0.3 <= tt < e - 0.5: sh["fx"].append(dict(kind="day", at=round(max(s, tt) + 0.2, 3), text=text))
    if d.get("day"): sh["fx"].append(dict(kind="day", at=s + 0.3, text=d["day"]))
    if d.get("card"):
        c = d["card"]; at = s + d.get("cardat", 0.25)
        if c[0] == "bigcard": sh["fx"].append(dict(kind="bigcard", at=at, text=c[1], sub=c[2], color=c[3] if len(c) > 3 else None))
        elif c[0] == "rule": sh["fx"].append(dict(kind="rule", at=at, text=c[1], warm=bool(c[3]) if len(c) > 3 else False))
        elif c[0] == "title": sh["fx"].append(dict(kind="title", at=at, text=c[1]))
    if d.get("checklist"):
        title, items = d["checklist"]
        sh["fx"].append(dict(kind="dim", at=s, to=0.45, dur=0.4))
        sh["fx"].append(dict(kind="checklist", at=s + 0.2, title=title, items=[dict(text=i[0], state=i[1], note=i[2] if len(i) > 2 else None) for i in items]))
    if d.get("rewrite"):
        sh["fx"].append(dict(kind="dim", at=s, to=0.5, dur=0.4))
        sh["fx"].append(dict(kind="rewrite", at=s + 0.2, add=round(s + 1.1, 3), old=d["rewrite"][0], new=d["rewrite"][1]))
    if d.get("cta"): sh["fx"].append(dict(kind="cta", at=s + 1.2, q=Q))
    if d.get("endcard"): sh["fx"].append(dict(kind="cta", at=s, q=Q)); sh["fx"].append(dict(kind="endcard", at=s + 0.3))
    if mood == "tense" and not d.get("par"): sh["handheld"] = True
    shots.append(sh)
total = shots[-1]["e"]
look = [[s["n"], round(0.6 * (s["e"] - s["s"]), 2)] for s in shots]
json.dump(dict(total=round(total, 3), shots=shots, look=look), open(os.path.join(H, "../../../src/dino-p3/edl.json"), "w"), ensure_ascii=False)
print(len(shots), "shots", round(total, 1), "s | tense", sum(1 for s in shots if s.get("handheld")), "| par", sum(1 for s in shots if s.get("par")))
print("missing direction:", [r["id"] for r in R if r["id"] not in P])
