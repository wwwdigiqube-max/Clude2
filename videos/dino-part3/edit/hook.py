# Part 3 cold open: a 9.6-second hook (Ian, same voice and model as the episode) that replaces the old 40-second opening.
# Renders on its own (DinoP3-Hook) and is joined to the finished episode at old shot 10 ("and you miss").
import json, os
H = os.path.dirname(os.path.abspath(__file__))
FPS, TOTAL = 24, 231 / 24  # 9.625 s; "and you miss" lands on old shot 10
Q4 = "a:Q4-frozen-river.jpeg"
snow = lambda s: [dict(kind="snow", at=s, n=70), dict(kind="cold", at=s)]
S = [  # (start, end, img, cam, extra), cut on the phrases of voice/v4test/hook-v2.mp3
    (0.00, 1.45, Q4, [1.05, .5, .5, 1.12, .5, .5], dict(fx=snow(0) + [dict(kind="day", at=0.2, text="DAY 70")])),
    (1.45, 3.20, Q4, [1.8, .4, .75, 1.95, .42, .75], dict(fx=snow(1.45))),
    (3.20, 5.25, "p:019", [1.05, .5, .6, 1.15, .5, .6], dict(fx=[])),
    (5.25, 7.05, "p:022", [1.0, .5, .48, 1.12, .5, .48], dict(fx=snow(5.25), breath=dict(x=.5, y=.44, dx=.15, dy=-1.0, size=.05))),
    (7.05, 8.45, "p:005", [1.15, .45, .6, 1.3, .45, .6], dict(fx=snow(7.05), handheld=True)),
    (8.45, TOTAL, "k:009", [1.0, .5, .5, 1.04, .5, .5], dict(fx=snow(8.45), hits=[8.62], punch=True, **{"in": [0.0, 1.0]})),
]
shots = []
for n, (s, e, img, cam, x) in enumerate(S):
    sh = dict(n=n, id=f"h{n + 1}", s=round(s, 3), e=round(e, 3), img=img, cam=cam, fx=x.pop("fx"), hits=x.pop("hits", []))
    sh.update(x); shots.append(sh)
json.dump(dict(total=TOTAL, shots=shots), open(os.path.join(H, "../../../src/dino-p3/hook.json"), "w"))
print(len(shots), "hook shots", TOTAL)
