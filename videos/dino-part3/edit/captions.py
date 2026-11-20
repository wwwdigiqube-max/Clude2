# Part 3 captions (from the narration's character timings) + YouTube chapters (from the edit)
import json, os, re
H = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(H, "..")
TL = [x for x in json.load(open(os.path.join(D, "voice/timeline.json"))) if "text" in x]
SH = {s["id"]: s for s in json.load(open(os.path.join(H, "../../../src/dino-p3/edl.json")))["shots"]}
MAX = 84

def ts(t):
    t = max(0, t); h, r = divmod(t, 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}".replace(",1000", ",999")

cues = []
for x in TL:
    a = x["alignment"]; c = "".join(a["characters"]); S = a["character_start_times_seconds"]; E = a["character_end_times_seconds"]
    # sentences
    spans, st = [], 0
    for m in re.finditer(r'[.!?…]["”]?(\s+|$)', c):
        spans.append((st, m.end())); st = m.end()
    if st < len(c): spans.append((st, len(c)))
    for i0, i1 in spans:
        seg = c[i0:i1].strip()
        if not seg: continue
        parts = [(i0, i1)]
        if len(seg) > MAX:  # split long sentences at a comma or a dash near the middle
            cands = [m.end() + i0 for m in re.finditer(r"[,;:—]\s", c[i0:i1])]
            if cands:
                mid = min(cands, key=lambda k: abs(k - (i0 + i1) / 2)); parts = [(i0, mid), (mid, i1)]
        for p0, p1 in parts:
            txt = c[p0:p1].strip()
            while p0 < p1 and c[p0].isspace(): p0 += 1
            q1 = p1 - 1
            while q1 > p0 and c[q1].isspace(): q1 -= 1
            cues.append([x["t"] + S[p0], x["t"] + E[q1] + 0.25, txt])
for i in range(len(cues) - 1):  # no overlaps
    cues[i][1] = min(cues[i][1], cues[i + 1][0] - 0.02)
with open(os.path.join(D, "captions-en.srt"), "w") as f:
    for i, (a, b, t) in enumerate(cues, 1): f.write(f"{i}\n{ts(a)} --> {ts(b)}\n{t}\n\n")

CH = [("1", "The Shape Under the Ice"), ("11", "The Cold Comes After"), ("31", "The Book"), ("51", "Meanwhile"), ("63", "Learn to See"),
      ("85", "How Long?"), ("99", "Go Deeper"), ("115", "Get Ready"), ("137", "The Dream"), ("154", "The Handwriting"), ("166", "Gone East")]
def mmss(t): return f"{int(t // 60)}:{int(t % 60):02d}"
lines = [f"{mmss(0 if i == 0 else SH[k]['s'])} {n}" for i, (k, n) in enumerate(CH)]
open(os.path.join(D, "chapters-en.txt"), "w").write("\n".join(lines) + "\n")
print(len(cues), "cues ·", "\n".join(lines))
