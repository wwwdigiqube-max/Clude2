# script-en-v7.md -> chunks.json (paragraph chunks, max ~420 chars, split at sentences; "(pause)" -> pause item; mood per chunk)
import re, json, os
H = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(H, "..", "script-en-v7.md"), encoding="utf-8").read()
# mood: tense = fast, energetic · sad = softer, a touch slower · story = settings A, slightly faster
MOOD = [("tense", ["Slow. But not slow enough", "Something moves in the water", "At the water's edge", "You wake up coughing", "The fire is drowned", "Smoke in a closed tunnel",
                   "You crawl to the door", "You dig into the grey pile", "A thread of smoke"]),
        ("sad",   ["Back in the tunnel, you sit", "A few days later, Pip doesn", "When you were small, your dad", "He died when you were seven", "Back home, on your mom", "You haven't let yourself think",
                   "She doesn't know where you are", "You can't go back", "Your mom hasn't moved", "She stands in front of the T. rex",
                   "She looks at the floor", "You're happy for him", "But that night, the tunnel", "It's done. Whatever happens",
                   "(pause) You got your wish", "You got your wish", "Nobody laughs"])]
def mood(t):
    for m, keys in MOOD:
        if any(t.startswith(k) or k in t[:60] for k in keys): return m
    return "story"
items, ch = [], ""
for block in re.split(r"\n\s*\n", src):
    lines = [l.strip() for l in block.splitlines() if l.strip()]
    buf = []
    def flush():
        global buf
        if not buf: return
        text = " ".join(buf); buf = []
        sents = re.split(r"(?<=[.!?…\"])\s+(?=[A-Z\"…(])", text)
        cur = ""
        for s in sents:
            if cur and len(cur) + len(s) > 420: items.append({"ch": ch, "text": cur}); cur = s
            else: cur = (cur + " " + s).strip()
        if cur: items.append({"ch": ch, "text": cur})
    for l in lines:
        if l.startswith("# ") or l.startswith(">") or l == "---": continue
        if l.startswith("## "): flush(); ch = l[3:]; continue
        if l.startswith("[") and l.endswith("]"): flush(); items.append({"ch": ch, "tag": l}); continue
        if l == "(pause)": flush(); items.append({"ch": ch, "pause": 1.0}); continue
        if l.startswith("(pause)"): flush(); items.append({"ch": ch, "pause": 1.0}); l = l[7:].strip()
        buf.append(l)
    flush()
    items.append({"ch": ch, "para": True})
# mood: a chunk takes the mood of its first sentence; carry tense through a run of short lines
for it in items:
    if "text" in it: it["mood"] = mood(it["text"])
json.dump(items, open(os.path.join(H, "chunks.json"), "w"), ensure_ascii=False, indent=1)
T = [i for i in items if "text" in i]
print(len(T), "chunks", sum(len(i["text"]) for i in T), "chars")
for k, i in enumerate(items):
    if "text" in i and i["ch"].startswith(("5", "7")): print(k, i["mood"], len(i["text"]), i["text"][:70])
