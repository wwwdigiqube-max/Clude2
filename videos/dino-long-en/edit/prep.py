# Map every shot-list frame to its words in the narration and decide where the picture needs held silence
# ("—" graphic frames, pause-only frames). Writes voice/holds.json (read by voice/assemble.py) and edit/frames.json.
import json, re, os
H = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(H, "..", "voice") + "/"
rows, cur = [], None
for line in open(os.path.join(H, "..", "shotlist", "shotlist.md")):
    m = re.match(r"- \*\*#(\d+)\*\* · [\d:.]+ · `([^`]+)` (?:🆕 )?— (.*)", line)
    if m: cur = {"n": int(m.group(1)), "meth": m.group(2), "see": re.sub(r" · _.*", "", m.group(3)).strip(), "text": ""}; rows.append(cur)
    elif line.startswith("  > ") and cur: cur["text"] = line[4:].strip()
tok = lambda s: [w for w in (re.sub(r"[^\w%']", "", x.lower()) for x in re.sub(r"\(pause\)|—", " ", s).split()) if w]
W = json.load(open(D + "words.json"))["words"]; S = json.load(open(D + "sentences.json"))
wt = [re.sub(r"[^\w%']", "", w["w"].lower().replace("’", "'")) for w in W]
k = 0
for r in rows:
    tw = [x.replace("’", "'") for x in tok(r["text"])] if r["meth"] != "CUT" else []
    r["w0"] = k if tw else None
    for x in tw:
        assert wt[k] == x, (r["n"], x, wt[k], W[k])
        k += 1
    r["w1"] = k  # exclusive
assert k == len(W), (k, len(W))
holds = {}
gap_after = lambda si: (S[si + 1]["start"] - S[si]["end"]) if si + 1 < len(S) else 9
prev_end_word = None
for r in rows:
    if r["meth"] == "CUT": continue
    if r["w0"] is None and prev_end_word is not None:
        si = W[prev_end_word]["sent"]
        if r["text"] == "—": holds[si] = holds.get(si, 0) + 2.2
        elif gap_after(si) - holds.get(si, 0) < 1.3: holds[si] = holds.get(si, 0) + 1.4
    if r["w0"] is not None: prev_end_word = r["w1"] - 1
json.dump(holds, open(D + "holds.json", "w"))
json.dump(rows, open(os.path.join(H, "frames.json"), "w"), ensure_ascii=False, indent=0)
print(len(rows), "frames ·", len(holds), "holds", holds)
