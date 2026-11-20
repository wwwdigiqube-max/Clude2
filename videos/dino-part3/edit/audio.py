# Part 3 sound design: VO + scene beds (crossfaded) + sad pad + event SFX -> out/p3-mix.wav (-14 LUFS)
# Same engine and levels as Part 2 (SFX pre-normalised to -23 LUFS in out/sfxn/). Restrained: one hit per beat, no stacking.
import json, os, subprocess
H = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(H, "../../.."))
E = json.load(open(os.path.join(ROOT, "src/dino-p3/edl.json"))); SH = E["shots"]; TOTAL = E["total"]
TL = [x for x in json.load(open(os.path.join(H, "../voice/timeline.json"))) if "text" in x]
N = lambda n: os.path.join(ROOT, "out/sfxn", n + ".wav")
by = {s["id"]: s for s in SH}

# ---------- scene of each shot -> bed ----------
def ids(*r):
    out = set()
    for x in r:
        if isinstance(x, tuple): out |= set(range(x[0], x[1] + 1))
        else: out.add(x)
    return {str(i) for i in out}
WINTER = ids((1, 2), (5, 5), (8, 11), (15, 18), (21, 26), 29, 45, 63, 66, 67, (69, 71), (75, 79), 84, (95, 99), 117, 118, 131, (179, 183))
UNDER = ids((3, 4), 7, (19, 20), (27, 28), 44, 64, 65, 68)
MEMORY = ids(6, (12, 14), 91, 92, 93, (122, 125), (171, 174))
MUSEUM = ids((51, 53), (56, 62), (155, 163), 165)
DIG = ids(54, 55, 154)
HOME = ids((137, 141), (151, 153), 164)
DREAM = ids((142, 150))
def scene(s):
    i = s["id"]
    for name, st in (("winter", WINTER), ("under", UNDER), ("memory", MEMORY), ("museum", MUSEUM), ("dig", DIG),
                     ("home", HOME), ("dream", DREAM)):
        if i in st: return name
    return "tunnel"  # everything else is inside the clay tunnel / chamber (fire, book, map, kit)
BEDS = {"tunnel": [("tunnel-tone", 0.55), ("fire", 0.22)], "winter": [("winter-wind", 0.45), ("river", 0.08)],
        "under": [("tunnel-tone", 0.3), ("river", 0.1)], "memory": [("wind", 0.3)], "museum": [("museum-hall", 0.5)],
        "dig": [("winter-wind", 0.22)], "home": [], "dream": [("wind", 0.22)]}
segs = []
for s in SH:
    sc = scene(s)
    if segs and segs[-1][0] == sc: segs[-1][2] = s["e"]
    else: segs.append([sc, s["s"], s["e"]])
pads = [(x["t"] - 0.8, x["t"] + x["dur"] + 1.5) for x in TL if x["mood"] == "sad"]
pads += [(by["142"]["s"], by["150"]["e"])]  # the dream
pads.sort(); merged = []
for a, b in pads:
    if merged and a - merged[-1][1] < 4: merged[-1][1] = max(merged[-1][1], b)
    else: merged.append([a, b])

# ---------- events ----------
EV = []
def ev(name, t, vol=0.8): EV.append((name, round(t, 3), vol))
st = lambda i, d=0.0: by[str(i)]["s"] + d
hit = lambda i: by[str(i)]["hits"][0]
# §1 the ice
ev("breath", st(5, .3), .35)
ev("water-surge", hit(9) - .1, .8); ev("lib-thud", hit(9), .6)
ev("heart", st(10, .4), .4)
ev("lib-boom", st(11, .2), .5); ev("lib-whoosh", st(12), .4); ev("lib-boom", st(15, .2), .5)
ev("croc-hiss", st(22, .8), .45); ev("lib-thud", st(23, .3), .45)
ev("snow-steps", st(24, .3), .45); ev("ice-punch", st(25, .5), .55)
# §2 the bag and the book
ev("dirt-trickle", st(31, .3), .4); ev("flame-catch", st(33, .2), .45)
ev("paper", st(36, .4), .5); ev("paper", st(38, .2), .45); ev("paper", st(43, .2), .5)
ev("paper", st(47, .6), .8); ev("paper", st(47, 2.4), .6)
# §3 the museum
ev("lib-whoosh", st(51), .5); ev("stone-carve", st(57, .2), .3)
# §4 learning the water
ev("lib-whoosh", st(63), .4); ev("lib-thud", st(65, .3), .45); ev("fandogh", st(67, .6), .5)
ev("water-surge", hit(70) - .12, .85); ev("lib-thud", hit(70), .8); ev("breath", hit(70) + .8, .4)
ev("snow-steps", st(71, .3), .55); ev("mice-squeaks", st(74, .3), .4)
ev("dig", st(76, .4), .5); ev("dig", st(77, .2), .45); ev("dig", st(79, .2), .45)
ev("stone-carve", st(83, .3), .3); ev("lib-boom", st(84, .1), .55)
# §5 the map, the sea, the cold
ev("lib-whoosh", st(86), .4); ev("paper", st(88, .3), .7)
ev("ice-punch", st(96, .4), .6)
ev("lib-thud", st(103, .3), .45); ev("fandogh", st(104, .5), .45)
ev("dig", st(105, .4), .55); ev("dig", st(105, 2.4), .45)
ev("seep", st(107, .2), .55); ev("dirt-trickle", st(108, .5), .55); ev("dig", st(108, 2.0), .4)
ev("mice-squeaks", st(112, .5), .45)
ev("stone-carve", st(114, .3), .3); ev("stone-carve", st(115, .3), .28); ev("paper", st(116, .2), .6)
# §6 getting ready
ev("water-surge", st(117, .2), .4); ev("dig", st(118, .4), .45); ev("paper", st(120, .4), .4)
ev("lib-boom", st(124, .1), .5); ev("flame-catch", st(126, .2), .35)
ev("paper", st(129, .3), .35)
ev("stamp", hit(131) - .03, .9); ev("lib-thud", hit(131), .5); ev("paper", st(132, .2), .55)
# §7 mom, the dream, the bone
ev("lib-whoosh", st(137), .45)
ev("lib-whoosh", st(142, .2), .35)
ev("lib-thud", hit(151), .7); ev("breath", hit(151) + .1, .55); ev("heart", hit(151) + .5, .45)
ev("paper", st(160, .3), .5); ev("lib-riser", st(161) - 1.4, .35); ev("lib-boom", st(161, .1), .5)
ev("heart", st(163, .5), .35); ev("paper", st(164, .3), .35)
# §8 leaving
ev("lib-boom", st(166, .2), .5); ev("mice-squeaks", st(168, .5), .45)
ev("lib-whoosh", st(171), .4); ev("dig", st(171, .4), .4); ev("stone-slab", st(173, .3), .4)
g = by["176"]["hand"]["at"]; ev("stone-carve", g, .3); ev("stone-carve", g + 1.3, .26)
ev("stone-slab", st(179, .6), .8)
ev("snow-steps", st(180, .5), .35); ev("snow-steps", st(181, .3), .35)

# ---------- render with ffmpeg ----------
inp, fc, labels = ["-i", os.path.join(H, "../voice/vo-en.mp3")], "[0]aresample=48000,aformat=channel_layouts=mono,volume=1.0[vo];", ["[vo]"]
n = 1
for sc, a, b in segs:
    for name, vol in BEDS[sc]:
        dur = b - a; fi = min(1.0, dur / 3)
        inp += ["-stream_loop", "-1", "-i", N(name)]
        fc += (f"[{n}]atrim=0:{dur:.3f},asetpts=PTS-STARTPTS,afade=t=in:d={fi:.2f},afade=t=out:st={dur - fi:.3f}:d={fi:.2f},"
               f"volume={vol},adelay={int(a * 1000)}[b{n}];"); labels.append(f"[b{n}]"); n += 1
for a, b in merged:
    dur = b - a
    inp += ["-stream_loop", "-1", "-i", N("pad")]
    fc += f"[{n}]atrim=0:{dur:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=2,afade=t=out:st={max(0, dur - 2.5):.3f}:d=2.5,volume=0.35,adelay={int(max(0, a) * 1000)}[b{n}];"
    labels.append(f"[b{n}]"); n += 1
for name, t, vol in EV:
    inp += ["-i", N(name)]
    fc += f"[{n}]volume={vol},adelay={int(max(0, t) * 1000)}[b{n}];"; labels.append(f"[b{n}]"); n += 1
fc += "".join(labels) + f"amix=inputs={len(labels)}:normalize=0:duration=longest,atrim=0:{TOTAL:.3f},loudnorm=I=-14:TP=-1.5:LRA=11[out]"
fcp = os.path.join(ROOT, "out/p3fc.txt"); open(fcp, "w").write(fc)
out = os.path.join(ROOT, "out/p3-mix.wav")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *inp, "-filter_complex_script", fcp, "-map", "[out]", "-ar", "48000", "-ac", "2", out], check=True)
print("beds", len(segs), "pad", len(merged), "events", len(EV), "->", out)
