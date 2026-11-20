# shift captions/chapters after the cold open was replaced by the 9.6 s hook (old 0-40.42 s -> new 0-9.625 s)
import re, os
H = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(H, "..")
CUT_OLD, CUT_NEW = 970 / 24, 231 / 24; SH = CUT_OLD - CUT_NEW
HOOK = [(0.05, 0.80, "Day seventy."), (1.53, 2.64, "The river is frozen."), (3.30, 5.07, "Under the ice, there is food…"),
        (5.34, 6.52, "and something that breathes."), (7.14, 7.78, "One spear."), (8.55, 9.17, "You strike…"), (9.85, 10.51, "and you miss.")]
def t2s(t): h, m, s = t.split(":"); return int(h) * 3600 + int(m) * 60 + float(s.replace(",", "."))
def s2t(x):
    h, r = divmod(x, 3600); m, s = divmod(r, 60); ms = int(round((s - int(s)) * 1000))
    if ms == 1000: ms = 999
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{ms:03d}"
src = open(os.path.join(D, "captions-en.srt"), encoding="utf-8").read().strip().split("\n\n")
cues = [(a, b + 0.2, t) for a, b, t in HOOK]
for blk in src:
    L = blk.split("\n"); a, b = [t2s(x.strip()) for x in L[1].split("-->")]
    if a >= 45.0: cues.append((a - SH, b - SH, " ".join(L[2:])))
open(os.path.join(D, "captions-en.srt"), "w").write("".join(f"{i}\n{s2t(a)} --> {s2t(b)}\n{t}\n\n" for i, (a, b, t) in enumerate(cues, 1)))
ch = []
for i, line in enumerate(open(os.path.join(D, "chapters-en.txt")).read().strip().split("\n")):
    t, name = line.split(" ", 1); m, s = t.split(":"); x = int(m) * 60 + int(s)
    x = 0 if i == 0 else x - SH
    ch.append(f"{int(x // 60)}:{int(x % 60):02d} {name}")
open(os.path.join(D, "chapters-en.txt"), "w").write("\n".join(ch) + "\n")
print(len(cues), "cues ·", " | ".join(ch))
