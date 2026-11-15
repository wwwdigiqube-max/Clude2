# Part 2 sound design: VO + scene beds (crossfaded) + sad pad + event SFX -> out/p2-mix.wav (-14 LUFS)
# SFX are pre-normalised to -23 LUFS in out/sfxn/ (see the command in the edit notes); volumes below are relative to that.
import json, os, re, subprocess
H = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(H, "../../.."))
E = json.load(open(os.path.join(ROOT, "src/dino-p2/edl.json"))); SH = E["shots"]; TOTAL = E["total"]
TL = [x for x in json.load(open(os.path.join(H, "../voice/timeline.json"))) if "text" in x]
N = lambda n: os.path.join(ROOT, "out/sfxn", n + ".wav")
by = {s["id"]: s for s in SH}

def word(phrase, after=0.0):
    """time of the first occurrence of phrase in the narration after a given time"""
    for x in TL:
        txt = "".join(x["alignment"]["characters"])
        j = txt.find(phrase)
        if j >= 0 and x["t"] + x["alignment"]["character_start_times_seconds"][j] >= after:
            return x["t"] + x["alignment"]["character_start_times_seconds"][j]
    raise SystemExit("word not found: " + phrase)

# ---------- scene of each shot -> bed ----------
TUN = {"002","004","012","053","066","078","080","086","093","095","118","129","130","133","135","137","140","142","143","146b","153"}
OUT = {"055","058","061","062","075","103","105","107","109","110","111","115","117","141","147","149","149-close"}
MEM = {"016","018","020","023","030","032"}
def scene(s):
    img = s["img"]; k = img.split(":")[-1].replace(".jpg", "")
    if img.startswith(("p:", "c:")):
        if k in TUN: return "tunnel"
        if k in OUT: return "winter"
        if k in MEM: return "memory"
        if k in {"049", "121", "122", "125"}: return "museum"
        if k == "046": return "school"
        if k in {"157", "159"}: return "dig"
        return "home"
    if "T1" in img or "T2" in img or "T3" in img: return "tunnel"
    if "P8" in img: return "dig"
    if "P7" in img: return "street"
    if img in ("e:231",): return "museum"
    if img in ("e:136",): return "memory2"
    if img in ("D11a", "e:234", "e:235", "D1e", "D1a", "e:225"): return "memory"
    return "none"
BEDS = {"tunnel": [("tunnel-tone", 0.55), ("fire", 0.22)], "winter": [("winter-wind", 0.45), ("river", 0.12)],
        "memory": [("wind", 0.3)], "museum": [("museum-hall", 0.5)], "school": [("school-hall", 0.55)],
        "street": [("winter-wind", 0.25)], "dig": [("winter-wind", 0.2)], "home": [], "memory2": [], "none": []}
segs = []
for s in SH:
    sc = scene(s)
    if segs and segs[-1][0] == sc: segs[-1][2] = s["e"]
    else: segs.append([sc, s["s"], s["e"]])
# sad pad: under the sad narration chunks
pads = [(x["t"] - 0.8, x["t"] + x["dur"] + 1.5) for x in TL if x["mood"] == "sad"]
merged = []
for a, b in pads:
    if merged and a - merged[-1][1] < 4: merged[-1][1] = b
    else: merged.append([a, b])

# ---------- events ----------
EV = []  # (name, time, vol)
def ev(name, t, vol=0.8): EV.append((name, round(t, 3), vol))
st = lambda i, d=0.0: by[str(i)]["s"] + d
ev("dig", st(3, .3), .5); ev("fandogh", st(6, .2), .5)
ev("lib-boom", st(10, .2), .8); ev("lib-whoosh", st(10), .5)
ev("stomp", st(23, .3), .35); ev("lib-thud", st(25, .25), .6); ev("lib-thud", st(26, .25), .8)
ev("door-knock", word("knocked") - 0.1, 1.0); ev("door-break", word("break it open") + 0.1, 0.9)
ev("paper", st(43, .2), .7); ev("lib-whoosh", st(51), .5); ev("lib-whoosh", st(99), .5)
ev("dig", st(55, .4), .6); ev("snow-steps", st(61, .3), .6); ev("dirt-trickle", st(62, .3), .5); ev("dig", st(65, .2), .5)
for i in (69, 71): ev("stamp", st(i, .25), .7)
ev("stamp", st(77, .25), .8); ev("dig", st(73, .3), .5); ev("dirt-trickle", st(74, .2), .5)
for i in ("79", "88", "145"): ev("paper", st(i, .2), .8)
ev("stone-carve", st(86, .3), .35); ev("stone-carve", st(87, .2), .3)
for i, d in ((95, .3), (96, .2), (96, 1.6), (97, .3), (98, .2)): ev("stone-carve", st(i, d), .55)
ev("lib-riser", st(100) - 1.6, .45); ev("heart", st(100, .1), .6)
ev("stone-slab", st(101, .3), .6); ev("croc-hiss", st(105, .4), .55); ev("croc-hiss", st(106, .2), .4)
ev("snow-steps", st(109, .5), .5); ev("snow-steps", st(110, .3), .5); ev("dig", st(111, .8), .55)
ev("water-surge", st(112, .1), .25); ev("fandogh", word("Pip squeaks") + .05, .9); ev("heart", st(114), .5)
snap = by["115"]["hits"][0]; ev("water-surge", snap - .15, .9); ev("lib-thud", snap, 1.0); ev("croc-hiss", snap + .2, .6); ev("stomp", snap, .5)
ev("heart", st(116), .45); ev("breath", st(116, .4), .4); ev("snow-steps", word("and run") - .1, .7)
ev("breath", st(118, .2), .45)
ev("breath", st(129, .1), .45); ev("seep", st(130, .1), .6)
ev("ice-punch", by["133"]["hits"][0] - .05, 1.0); ev("bow-drill", st(135, .2), .7); ev("dirt-trickle", st(136, .2), .5)
ev("breath", st(138, .2), .4); ev("flame-catch", st(139) - .4, .9)
ev("stone-carve", st("146b", .3), .35); ev("stone-carve", st("146b", 2.0), .3)
ev("mice-squeaks", st(149, .8), .6); ev("mice-squeaks", st(151, .3), .4); ev("stone-carve", st(154, .2), .35)
ev("fossil-brush", st(157, .4), .7); ev("fossil-brush", st(160, .1), .7)
ev("lib-riser", st(161) - 1.4, .4); ev("lib-boom", st(161, .1), .55); ev("lib-boom", st(163, .2), .6)

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
open("/tmp/p2fc.txt", "w").write(fc)
out = os.path.join(ROOT, "out/p2-mix.wav")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *inp, "-filter_complex_script", "/tmp/p2fc.txt", "-map", "[out]", "-ar", "48000", "-ac", "2", out], check=True)
print("beds", len(segs), "pad", len(merged), "events", len(EV), "->", out)
