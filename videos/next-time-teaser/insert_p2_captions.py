# Part 2 captions/chapters after the Part 3 teaser was inserted before the end card (frame 19675)
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")); D = os.path.join(R, "videos/dino-part2")
CUT, TD = 19675 / 24, 684 / 24
TEASER = [(1.72, 2.4, "Day seventy."), (3.14, 4.22, "The river is frozen."), (4.68, 6.34, "Under the ice, there is food…"),
          (6.7, 7.82, "and something that breathes."), (8.68, 9.68, "Water bends light."), (10.52, 12.54, "The spear jerks in your hands."),
          (13.88, 14.9, "It doesn't even crack."), (16.48, 18.16, "She wakes up with her heart pounding."), (18.6, 19.72, "\"That's his handwriting.\""),
          (20.64, 22.38, "GONE EAST. DAY 88."), (22.96, 24.1, "…and follow it east.")]
def t2s(t): h, m, s = t.split(":"); return int(h) * 3600 + int(m) * 60 + float(s.replace(",", "."))
def s2t(x):
    h, r = divmod(x, 3600); m, s = divmod(r, 60); ms = min(999, int(round((s - int(s)) * 1000)))
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{ms:03d}"
p = os.path.join(D, "captions-en.srt"); src = open(p, encoding="utf-8").read().strip().split("\n\n")
if "Day seventy." in open(p).read(): raise SystemExit("already inserted")
cues = []
for blk in src:
    L = blk.split("\n"); a, b = [t2s(x.strip()) for x in L[1].split("-->")]; txt = " ".join(L[2:])
    if a >= CUT - 0.05: a, b = a + TD, b + TD
    elif b > CUT: b = CUT - 0.02
    cues.append((a, b, txt))
cues += [(CUT + a, CUT + b + 0.25, t) for a, b, t in TEASER]
cues.sort()
open(p, "w").write("".join(f"{i}\n{s2t(a)} --> {s2t(b)}\n{t}\n\n" for i, (a, b, t) in enumerate(cues, 1)))
c = os.path.join(D, "chapters-en.txt"); ch = open(c).read().strip()
m = int(CUT // 60); s = int(CUT % 60)
open(c, "w").write(ch + f"\n{m}:{s:02d} Next Time: Part 3\n")
print(len(cues), "cues; chapter", f"{m}:{s:02d}")
