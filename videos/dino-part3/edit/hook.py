# Part 3 cold open v2: a 9-second hook (Ian on eleven_v4) that replaces the old 40-second opening.
# Renders on its own (DinoP3-Hook) and is joined to the finished episode at old shot 10 ("and you miss").
import json, os
H = os.path.dirname(os.path.abspath(__file__))
FPS, TOTAL = 24, 219 / 24  # 9.125 s
Q4 = "a:Q4-frozen-river.jpeg"
snow = lambda s: [dict(kind="snow", at=s, n=70), dict(kind="cold", at=s)]
S = [  # (start, end, img, cam, extra)
    (0.00, 1.42, Q4, [1.05, .5, .5, 1.12, .5, .5], dict(fx=snow(0) + [dict(kind="day", at=0.25, text="DAY 70")])),
    (1.42, 3.06, Q4, [1.8, .4, .75, 1.95, .42, .75], dict(fx=snow(1.42))),
    (3.06, 5.06, "p:019", [1.05, .5, .6, 1.15, .5, .6], dict(fx=[])),
    (5.06, 6.96, "p:022", [1.0, .5, .48, 1.12, .5, .48], dict(fx=snow(5.06), breath=dict(x=.5, y=.44, dx=.15, dy=-1.0, size=.05))),
    (6.96, 8.10, "p:005", [1.15, .45, .6, 1.3, .45, .6], dict(fx=snow(6.96), handheld=True)),
    (8.10, TOTAL, "k:009", [1.0, .5, .5, 1.04, .5, .5], dict(fx=snow(8.10), hits=[8.30], punch=True, **{"in": [0.0, 1.0]})),
]
shots = []
for n, (s, e, img, cam, x) in enumerate(S):
    sh = dict(n=n, id=f"h{n + 1}", s=round(s, 3), e=round(e, 3), img=img, cam=cam, fx=x.pop("fx"), hits=x.pop("hits", []))
    sh.update(x); shots.append(sh)
json.dump(dict(total=TOTAL, shots=shots), open(os.path.join(H, "../../../src/dino-p3/hook.json"), "w"))
print(len(shots), "hook shots", TOTAL)
