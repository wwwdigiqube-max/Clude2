# script-en-v7.md -> chunks.json (paragraph chunks, max ~420 chars, split at sentences; "(pause)" -> pause item; mood per chunk)
import re, json, os
H = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(H, "..", "script-en-v6.md"), encoding="utf-8").read()
# mood: tense = fast, energetic · sad = softer, a touch slower · story = settings A, slightly faster
MOOD = [("tense", ["(pause) You strike", "You strike", "Back on the ice. You missed", "This time, you aim below", "Then the real cold comes", "The real cold comes"]),
        ("sad",   ["Before you sleep, you say good night", "The night before you leave", "Usually you just say good night", "That same night, sixty-six", "She hasn't slept",
                   "At some point after three", "She's standing in a forest", "She wakes up", "The next morning, your mom", "Your mom doesn't read them",
                   "But you don't go", "This hole in the mud", "Then you take the charcoal", "\"Thank you,\"", "You crawl out", "Then you pick up your spear"])]
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
# hand-picked moods (by chunk start), after listening to the test
OVR = {"Snow is falling, but it isn't white": "sad", "Sixty-six million years old. And on it": "sad", "\"That's his handwriting": "sad",
       "And sixty-six million years earlier, on a cold morning": "sad", "You need tinder for tomorrow": "sad", "The spear jerks": "tense",
       "Then you pick up your spear": "story"}
for it in items:
    for k, m in OVR.items():
        if it.get("text", "").startswith(k): it["mood"] = m
json.dump(items, open(os.path.join(H, "chunks.json"), "w"), ensure_ascii=False, indent=1)
T = [i for i in items if "text" in i]
print(len(T), "chunks", sum(len(i["text"]) for i in T), "chars")
for k, i in enumerate(items):
    if False: print(k, i["mood"], len(i["text"]), i["text"][:70])
