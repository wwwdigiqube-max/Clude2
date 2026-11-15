# shotlist.md + voice/timeline.json -> frames.json: each shot gets its start/end time on the narration (seconds).
import json, re, os
H = os.path.dirname(os.path.abspath(__file__))
rows, cur = [], None
for line in open(os.path.join(H, "../shotlist/shotlist.md"), encoding="utf-8"):
    m = re.match(r"- \*\*#(\w+)\*\* · [\d:.]+ · `([^`]+)` (?:🆕 )?— (.*)", line)
    if m:
        see = re.sub(r" · _رفرنس.*", "", m.group(3)); see = re.sub(r" · \*\*وضعیت.*", "", see)
        cur = {"id": m.group(1), "meth": m.group(2), "see": see.strip(), "text": ""}; rows.append(cur)
    elif cur and line.startswith("  > "): cur["text"] = line[4:].strip()
tl = [x for x in json.load(open(os.path.join(H, "../voice/timeline.json"))) if "text" in x]
# global word list with times
W = []
for x in tl:
    a = x["alignment"]; ch = a["characters"]; st = a["character_start_times_seconds"]; en = a["character_end_times_seconds"]
    w, ws = "", None
    for c, s, e in zip(ch, st, en):
        if re.match(r"[\w'’]", c):
            if not w: ws = s
            w += c; we = e
        elif w: W.append((re.sub("’", "'", w.lower()), x["t"] + ws, x["t"] + we)); w = ""
    if w: W.append((w.lower(), x["t"] + ws, x["t"] + we))
norm = lambda s: [re.sub("’", "'", t.lower()) for t in re.findall(r"[\w'’]+", re.sub(r"\(pause\)", "", s))]
k = 0
for r in rows:
    ws = norm(r["text"])
    if not ws or r["text"] == "—": r["start"] = None; continue
    # find ws[0..2] starting at k
    for j in range(k, min(k + 40, len(W))):
        if [w[0] for w in W[j:j + min(3, len(ws))]] == ws[:3]: break
    else: r["start"] = None; r["unspoken"] = True; print("unspoken:", r["id"], r["text"][:50]); continue
    r["start"], r["end"] = W[j][1], W[j + len(ws) - 1][2]; r["pause"] = r["text"].startswith("(pause)"); k = j + len(ws)
# shots with no words ("—", graphics) sit between neighbours
for i, r in enumerate(rows):
    if r["start"] is None:
        prev_end = rows[i - 1]["end"] if i else 0.0
        nxt = next((x["start"] for x in rows[i + 1:] if x.get("start") is not None), prev_end + 2)
        r["start"], r["end"] = prev_end, nxt
json.dump(rows, open(os.path.join(H, "frames.json"), "w"), ensure_ascii=False, indent=0)
print(len(rows), "shots; last end", round(rows[-1]["end"], 1))
