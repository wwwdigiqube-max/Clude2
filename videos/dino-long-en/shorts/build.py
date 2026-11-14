# Vertical Shorts/Reels cut from the main EN film: time windows of the main timeline (picture + final mix),
# reframed to 9:16 with burned word captions, a hook title and an end card. → src/dino-en/shorts.json + audio
import json, os, subprocess
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.join(H, "..", "..", "..")
W = json.load(open(os.path.join(H, "..", "voice", "words.json")))["words"]
S = json.load(open(os.path.join(H, "..", "voice", "sentences.json")))
def sent(t, end=False):
    for s in S:
        if s["text"].startswith(t): return s["end"] + 0.35 if end else s["start"] - 0.25
    raise KeyError(t)
TAIL = 2.6
# where to look inside the 16:9 picture (0..1 across) when the centre crop misses the subject
FOCUS = {157: .33, 158: .35, 165: .62, 170: .7, 214: .36, 215: .36, 220: .34, 230: .4}
SHORTS = [
  dict(id="DinoShort1", name="raptor", hook=["SOMETHING IS IN", "YOUR TUNNEL"], segs=[(sent("At midnight"), sent("But it could come back", True))]),
  dict(id="DinoShort2", name="trex-door", hook=["THE LAST DINOSAUR", "YOU'LL EVER SEE"], segs=[(sent("And then, outside"), sent("The last dinosaur you saw", True))]),
  dict(id="DinoShort3", name="scar", hook=["REMEMBER", "THIS SCAR"], segs=[(sent("In the evening, you find"), sent("Then it walks on", True)),
                                                                          (sent("In the days after"), sent("And one day, you'll stand", True))]),
]
out = []
for sh in SHORTS:
    local, words, t = [], [], 0.0
    for a, b in sh["segs"]:
        local.append([round(t, 3), round(a, 3), round(b, 3)])
        for w in W:
            if a <= w["s"] < b: words.append({"w": w["w"], "s": round(t + w["s"] - a, 3), "e": round(t + w["e"] - a, 3)})
        t += b - a
    dur = round(t + TAIL, 3)
    out.append({**sh, "segs": local, "words": words, "dur": dur, "focus": FOCUS})
    # audio: the same windows of the final mix, short crossfades, faded tail
    parts, flt = [], []
    for k, (a, b) in enumerate(sh["segs"]):
        parts += ["-ss", str(a), "-to", str(b), "-i", "out/mix-en-norm.wav"]
        flt.append(f"[{k}:a]afade=t=in:d=0.15,afade=t=out:st={b - a - 0.25:.3f}:d=0.25[a{k}]")
    n = len(sh["segs"])
    flt.append("".join(f"[a{k}]" for k in range(n)) + f"concat=n={n}:v=0:a=1,apad=pad_dur={TAIL},atrim=0:{dur}[o]")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *parts, "-filter_complex", ";".join(flt), "-map", "[o]", "-ar", "48000", "-ac", "2",
                    os.path.join(R, f"out/short-{sh['name']}.wav")], cwd=R, check=True)
    print(sh["id"], sh["name"], dur, "s,", len(words), "words")
json.dump(out, open(os.path.join(R, "src/dino-en/shorts.json"), "w"), ensure_ascii=False)
