# Shot start times: each shot's narration (shotlist part1/part2) is found in the narration word stream (src/dino/vo.json).
import json, os, re
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.join(H, "..", "..", "..")
VO = json.load(open(os.path.join(R, "src/dino/vo.json")))
L = json.load(open(os.path.join(H, "../tts/lines.json")))
SHOTS = [s for p in ("part1", "part2") for s in json.load(open(os.path.join(H, f"../shotlist/{p}.json")))["shots"]]
NUM = {"۳۰۰۰": "سه هزار", "۲۳": "بیست و سه", "۲۲": "بیست و دو", "۶۶": "شصت و شش", "۱۰": "ده", "۱۲": "دوازده", "۲۵": "بیست و پنج",
       "۷۰": "هفتاد", "۱۱": "یازده", "۴۰": "چهل", "۷": "هفت", "۳": "سه", "۲": "دو"}
def norm(t):
    for k in sorted(NUM, key=len, reverse=True): t = re.sub(rf"(?<![۰-۹]){k}(?![۰-۹])", NUM[k], t)
    t = re.sub(r"[ً-ْ]", "", t).replace("‌", "").replace("ي", "ی").replace("ك", "ک")
    t = re.sub(r"[^\w\s]", " ", t)
    return t.split()
W = [norm(w["w"])[0] if norm(w["w"]) else "" for w in VO["words"]]
def find(narr, pos):
    q = norm(narr)[:4]
    for n in (4, 3, 2):
        for i in range(pos, len(W)):
            if W[i:i + n] == q[:n]: return i
    return None
out, pos = [], 0
for i, s in enumerate(SHOTS):
    k = find(s["narr"], pos)
    out.append(k)
    if k is not None: pos = k + 1
if __name__ == "__main__":
    for i, (s, k) in enumerate(zip(SHOTS, out)):
        t = VO["words"][k]["s"] if k is not None else None
        print(i + 1, s.get("t"), "→", f"{int(t//60)}:{t%60:04.1f}" if t is not None else "??", s["narr"][:40])
