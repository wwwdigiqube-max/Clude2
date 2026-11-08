# Audio plan for the long dino video → videos/dino-long/edit/audio.json (tools/doc-mix.mjs). No music (user's choice):
# narration on top, ambience beds under each place, effects on the visual events. Cues use the same shot/word timing as edl.py.
import json, os, contextlib, io
with contextlib.redirect_stdout(io.StringIO()):
    import edl
H = os.path.dirname(os.path.abspath(__file__))
P = json.load(open(os.path.join(H, "../sfx/peaks.json")))
D = "public/dino/sfx/"
st = lambda n: edl.START[n - 1]                       # shot start
cue = lambda n, c: edl.T(c, n)                        # word/line cue inside shot n
SFX, BEDS = [], []
def fx(name, t, vol=0.8):
    SFX.append([D + name + ".wav", round(t, 3), vol, P.get(name, 0.05)])
def bed(name, a, b, vol=0.3):
    BEDS.append([D + name + ".wav", round(a, 3), round(b, 3), vol])

# ---- hook ----
bed("quake-rumble", 0, st(3), 0.55); fx("dirt-trickle", 1.0, 0.6); fx("dirt-trickle", st(2) + 0.3, 0.7)
bed("fire", st(3), st(5), 0.4); bed("wind", st(3), st(4), 0.2)
fx("breath", st(4) + 1.2, 1.0); fx("breath", st(4) + 3.6, 0.8)
fx("lib-boom", st(5) + 0.1, 0.6)
# ---- day 1 ----
bed("morning-birds", st(8), st(14), 0.35)
fx("stomp", cue(12, "w:می‌کوبه"), 1.0); fx("quake-rumble", cue(12, "w:می‌کوبه") + 1.0, 0.4)
fx("heart", st(13) + 0.3, 0.7); fx("stomp", st(13) + 1.6, 0.35)
fx("lib-notif", st(15) + 0.2, 0.6)
fx("lib-whoosh", st(16) + 0.1, 0.5)
fx("lib-click", st(20) + 0.6, 0.4) if os.path.exists(D + "lib-click.wav") else None
bed("morning-birds", st(17), st(21), 0.3)
fx("stomp", st(21) + 0.5, 0.5); fx("breath", st(21) + 3.0, 0.5); fx("stomp", st(23) + 0.3, 0.45)
fx("heart", st(22) + 0.4, 0.6)
# ---- day 2 ----
bed("morning-birds", st(24), st(32), 0.3)
fx("fandogh", st(25) + 1.0, 0.9); fx("fandogh", st(26) + 0.6, 0.7)
fx("stomp", st(27) + 1.0, 0.4); fx("lib-thud", cue(31, "L:] قانون اول"), 0.8)
# ---- day 3 ----
bed("river", st(32), st(39), 0.35); fx("lib-whoosh", st(34) + 0.05, 0.6); fx("seep", st(35) + 2.0, 0.6)
fx("lib-thud", cue(38, "L:] قانون دوم"), 0.8)
# ---- day 4 ----
bed("river", st(39), st(45), 0.2)
for i in range(6): fx("stomp", st(39) + 0.3 + i * 0.55, 0.35)
fx("far-bellow", cue(40, "w:بم"), 1.0); fx("stampede", st(41) + 0.1, 1.0); fx("quake-rumble", st(41), 0.6)
fx("lib-thud", st(42) + 0.4, 0.6); fx("lib-whoosh", cue(44, "w:بیلت"), 0.4)
# ---- day 5 ----
fx("fireball", st(45) + 0.6, 0.7); bed("wind", st(45), st(47), 0.25)
bed("river", st(47), st(50), 0.3)
# ---- day 6 ----
bed("river", st(50), st(57), 0.25)
for i in range(4): fx("dig", st(50) + 0.4 + i * 1.3, 0.6)
fx("dig", st(51) + 0.5, 0.4); fx("lib-whoosh", st(52) + 0.2, 0.4)
fx("lib-thud", cue(56, "L:] قانون سوم"), 0.8)
# ---- day 7 ----
bed("morning-birds", st(57), st(63), 0.3); fx("fandogh", st(57) + 1.2, 0.7); fx("fandogh", st(61) + 0.6, 0.8)
fx("lib-notif", st(60) + 0.3, 0.4); fx("lib-ping", st(62) + 0.4, 0.4)
# ---- day 8 ----
fx("raptor-scratch", st(65) + 2.4, 0.9); fx("heart", st(66) + 0.5, 0.7); fx("raptor-scratch", st(66) + 2.0, 0.7)
fx("raptor-shriek", st(68) + 0.6, 0.45); fx("lib-whoosh", st(69) + 0.05, 0.5)
fx("raptor-shriek", cue(70, "w:پنجه‌اش"), 0.8); fx("lib-thud", cue(70, "w:ساعدت"), 0.5)
fx("lib-notif", st(72) + 0.2, 0.5)
fx("alert", st(73) + 0.1, 0.9); fx("alert", st(74) + 0.2, 0.8); fx("alert", st(74) + 2.2, 0.6)
fx("raptor-shriek", cue(74, "w:جیغ") if True else st(74) + 4, 1.0)
fx("heart", st(76) + 0.5, 0.4)
# ---- day 9 ----
bed("river", st(78), st(82), 0.2); fx("lib-notif", st(80) + 0.2, 0.5)
bed("wind", st(82), st(85), 0.15); fx("far-bellow", cue(83, "w:بم"), 0.9)
# ---- day 10 ----
bed("morning-birds", st(85), st(87), 0.45); bed("river", st(85), st(88), 0.25)
fx("fireball", st(87) + 1.0, 0.9); fx("lib-riser", st(87) + 3.5, 0.5)
fx("quake-rumble", st(88) + 0.2, 1.0); bed("quake-rumble", st(88), st(89), 0.6)
fx("water-surge", st(89) + 1.5, 1.0); bed("river", st(89), st(92), 0.45)
bed("glass-hail", st(93), st(95), 0.55); bed("fire", st(93), st(95), 0.25)
bed("fire", st(95), st(103), 0.3); fx("fireball", st(96) + 0.4, 0.5)
fx("stomp", st(97) + 0.6, 0.6); fx("stomp", st(97) + 2.2, 0.75)
fx("stomp", cue(98, "w:می‌افته"), 1.0); fx("lib-boom", cue(98, "w:می‌افته") + 0.05, 0.5)
fx("breath", st(99) + 0.6, 0.8); fx("breath", st(100) + 1.0, 1.0); fx("breath", st(100) + 4.0, 0.8)
fx("breath", st(102) + 0.8, 0.5); fx("breath", st(102) + 4.5, 0.3)
# ---- after ----
bed("wind", st(104), st(107), 0.35)
for i in range(5): fx("dig", st(107) + 1.0 + i * 0.9, 0.25)
bed("wind", st(107), st(113), 0.12)
fx("bird-song", cue(113, "L:آواز یه پرنده") - 0.4, 0.9)
bed("morning-birds", st(115), edl.END_TOTAL, 0.12)

A = {"vo": "public/dino/vo.wav", "voJson": "src/dino/vo.json", "length": edl.END_TOTAL, "music": [],
     "beds": BEDS, "sfx": SFX, "sfxGain": 0.45, "voGain": 1.0}
json.dump(A, open(os.path.join(H, "audio.json"), "w"), ensure_ascii=False, indent=1)
print(len(SFX), "effects,", len(BEDS), "beds")
