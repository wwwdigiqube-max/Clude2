# EN sound design → edit/audio.json (tools/doc-mix.mjs). No music (channel rule): narration on top, ambience beds
# under each place, effects on the visual events. Times come from edl.py (frame starts + word cues).
import json, os, contextlib, io, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
with contextlib.redirect_stdout(io.StringIO()):
    import edl
H = os.path.dirname(os.path.abspath(__file__))
P = json.load(open(os.path.join(H, "../../dino-long/sfx/peaks.json")))
D = "public/dino/sfx/"
st = lambda n: edl.start[n]; en = lambda n: edl.end[n]
cue = lambda n, c: edl.T(c, n)
SFX, BEDS = [], []
def fx(name, t, vol=0.8):
    ext = ".ogg" if name.startswith(("footstep", "switch")) else ".wav"
    SFX.append([D + name + ext, round(t, 3), vol, P.get(name, 0.05)])
def bed(name, a, b, vol=0.3):
    if b - a > 0.5: BEDS.append([D + name + ".wav", round(a, 3), round(b, 3), vol])
thud = lambda n, c=0.1, v=0.8: fx("lib-thud", cue(n, c), v)

# ---- 0 · hook ----
bed("quake-rumble", 0, st(3), 0.55); fx("dirt-trickle", 1.0, 0.6); fx("dirt-trickle", st(2) + 0.3, 0.7)
bed("fire", st(3), st(5), 0.4); bed("wind", st(3), st(4), 0.2)
fx("breath", st(4) + 1.2, 1.0); fx("breath", st(4) + 3.6, 0.8)
fx("lib-boom", st(5) + 0.1, 0.6)
fx("fireball", st(7) + 0.4, 0.5); bed("wind", st(7), st(8), 0.2); bed("morning-birds", st(8), st(10), 0.25)
fx("lib-boom", st(10) + 0.05, 0.9); fx("lib-whoosh", st(10) + 0.5, 0.4)
# ---- 1 · day 1 ----
fx("heart", st(12) + 0.4, 0.25); fx("lib-ping", cue(13, "w:23"), 0.3)
fx("lib-whoosh", st(17) + 0.1, 0.35)
bed("jungle", st(19), st(27), 0.3); bed("morning-birds", st(19), st(21), 0.25)
fx("lib-thud", st(22) + 0.05, 0.6); fx("stomp", cue(23, "w:slams"), 1.0); fx("quake-rumble", cue(24, "w:jumps"), 0.45)
fx("stomp", st(25) + 0.6, 0.35); fx("stomp", st(25) + 1.6, 0.2); fx("heart", st(25) + 0.2, 0.5)
fx("lib-notif", st(28) + 0.2, 0.6); fx("alert", st(29) + 0.05, 0.5); fx("switch_001", cue(31, "w:switch"), 0.6)
bed("wind", st(31), st(34), 0.22); bed("jungle", st(34), st(40), 0.25)
for k in range(3): fx("stomp", st(34) + 0.4 + k * 0.9, 0.4)
fx("breath", st(37) + 0.3, 0.7); fx("stomp", st(38) + 0.5, 0.35); fx("heart", st(39) + 0.1, 0.6)
bed("jungle", st(40), st(50), 0.18); bed("wind", st(40), st(50), 0.12)
fx("lib-whoosh", st(48) + 0.05, 0.35)
# ---- 2 · day 2-3 ----
bed("morning-birds", st(51), st(70), 0.3); fx("fandogh", st(52) + 1.0, 0.9); fx("fandogh", st(53) + 0.5, 0.6)
fx("far-bellow", st(54) + 0.4, 0.5); fx("fandogh", st(55) + 0.8, 0.6)
thud(60, 0.1); fx("fandogh", st(62) + 0.8, 0.5)
bed("jungle", st(68), st(70), 0.2); bed("river", st(70), st(85), 0.32)
fx("lib-whoosh", st(72) + 0.05, 0.5); fx("heart", st(73) + 0.1, 0.5); fx("seep", st(76) + 1.0, 0.6)
thud(84, 0.1)
# ---- 3 · day 4-6 ----
bed("river", st(85), st(125), 0.22)
for k in range(6): fx("stomp", st(85) + 0.3 + k * 0.55, 0.35)
fx("far-bellow", cue(87, "w:deep"), 1.0); fx("stampede", st(88) + 0.1, 1.0); fx("quake-rumble", st(88), 0.6)
fx("lib-thud", st(89) + 0.3, 0.6); fx("lib-whoosh", cue(92, "w:shovel"), 0.4)
fx("fireball", st(95) + 0.5, 0.7); bed("wind", st(95), st(97), 0.25); thud(97, 0.1)
for k in range(3): fx("dig", st(98) + 0.5 + k * 1.2, 0.5)
fx("dig", st(109) + 0.4, 0.6); fx("dig", st(109) + 1.7, 0.5)
fx("dirt-trickle", st(110), 0.9); fx("lib-thud", st(110) + 0.2, 0.9); fx("quake-rumble", st(110) + 0.1, 0.4)
fx("breath", st(111) + 0.3, 0.6); fx("fandogh", st(115) + 1.0, 0.6)
for k in range(3): fx("dig", st(117) + 0.5 + k * 1.3, 0.55)
fx("dig", st(118) + 0.6, 0.4); fx("lib-whoosh", st(122) + 0.05, 0.3)
# ---- 4 · day 7 ----
bed("morning-birds", st(125), st(150), 0.25); fx("fandogh", st(125) + 1.2, 0.7); fx("fandogh", st(126) + 0.8, 0.8)
fx("lib-whoosh", st(127) + 0.05, 0.3); fx("dig", st(128) + 0.3, 0.3)
fx("lib-notif", st(132) + 0.3, 0.4); fx("lib-ping", st(134) + 0.1, 0.25); fx("lib-ping", st(135) + 0.1, 0.25)
fx("heart", st(141) + 0.3, 0.35); fx("switch_001", cue(148, "w:switch"), 0.5)
bed("wind", st(150), st(152), 0.15)
# ---- 5 · day 8-9 ----
for k in range(3): fx("dig", st(152) + 0.4 + k * 1.1, 0.5)
fx("lib-whoosh", st(154) + 0.05, 0.3)
fx("raptor-scratch", cue(158, "w:scratching"), 0.9); fx("heart", st(159) + 0.2, 0.7); fx("raptor-scratch", st(160) + 0.4, 0.6)
fx("raptor-shriek", st(161) + 0.6, 0.4)
fx("raptor-shriek", cue(165, "w:lunges"), 0.9); fx("lib-thud", cue(165, "w:claws"), 0.5)
fx("switch_001", cue(168, "w:switch"), 0.6)
fx("alert", cue(169, "w:alarm"), 0.9); fx("alert", st(170) + 0.3, 0.8); fx("raptor-shriek", cue(171, "w:shrieks"), 0.9)
fx("heart", st(173) + 0.2, 0.4)
for k in range(2): fx("switch_001", st(175) + 0.3 + k * 1.6, 0.4)
fx("heart", st(176) + 0.1, 0.5); fx("raptor-scratch", st(177) + 0.4, 0.25)
bed("morning-birds", st(178), st(180), 0.15); fx("switch_001", st(178) + 1.2, 0.4)
bed("river", st(180), st(189), 0.25)
for k in range(3): fx("lib-thud", st(182) + 0.6 + k * 1.4, 0.35)
fx("lib-thud", st(183) + 1.6, 0.6); fx("lib-whoosh", st(186) + 0.05, 0.3)
# ---- 6 · day 10 ----
fx("switch_001", st(189) + 0.3, 0.5); fx("alert", st(190) + 0.1, 0.5)
bed("wind", st(192), st(195), 0.2); fx("far-bellow", st(193) + 0.5, 0.8)
bed("morning-birds", st(195), st(198), 0.4); bed("river", st(195), st(202), 0.3)
fx("lib-riser", st(198) - 0.4, 0.6); fx("lib-boom", st(199) + 0.05, 1.0)
fx("quake-rumble", st(201), 1.0); bed("quake-rumble", st(201), st(203), 0.4)
fx("water-surge", st(202) + 0.3, 1.0); fx("water-surge", st(203) + 0.2, 0.7)
bed("river", st(204), st(209), 0.35); fx("lib-whoosh", st(206) + 0.05, 0.3)
fx("glass-hail", st(209) + 0.2, 0.9); bed("fire", st(209), st(214), 0.35)
fx("lib-thud", st(211) + 1.0, 0.7)
bed("fire", st(212), st(224), 0.4)
for k in range(3): fx("stomp", st(214) + 0.6 + k * 0.8, 0.5 + 0.15 * k)
fx("lib-thud", cue(215, "w:collapses"), 1.0); fx("quake-rumble", cue(215, "w:collapses"), 0.5)
for k in range(5): fx("breath", st(216) + 0.4 + k * 2.6, 1.0 - 0.12 * k)
for k in range(2): fx("breath", st(220) + 0.4 + k * 3.5, 0.45 - 0.15 * k)
fx("breath", st(221) + 0.3, 0.3)
bed("morning-birds", st(224), st(225), 0.05)
# ---- 7 · after ----
bed("river", st(225), st(227), 0.3); bed("wind", st(225), st(233), 0.12)
fx("lib-whoosh", st(228) + 0.3, 0.3); fx("heart", st(229) + 0.1, 0.5)
fx("lib-riser", st(230) - 0.2, 0.3)
bed("wind", st(233), st(237), 0.35); bed("fire", st(237), st(239), 0.3)
bed("fire", st(239), st(241), 0.12); fx("fandogh", st(239) + 1.0, 0.4)
fx("dig", st(241) + 0.4, 0.3); fx("dig", st(242) + 0.8, 0.25)
thud(243, 0.1); fx("lib-thud", st(243) + 1.6, 0.6); fx("lib-thud", st(243) + 3.0, 0.6)
fx("lib-thud", st(245) + 0.05, 0.6)
bed("wind", st(244), st(249), 0.1); fx("bird-song", st(249) + 0.6, 0.9); bed("bird-song", st(249), edl.TOTAL, 0.25)
fx("lib-whoosh", st(251) + 0.05, 0.3)

SEN = json.load(open(os.path.join(H, "../voice/sentences.json")))
json.dump({"total": edl.TOTAL, "segs": [{"n": i + 1, "start": x["start"], "end": x["end"]} for i, x in enumerate(SEN)], "words": edl.W},
          open(os.path.join(H, "vo-mix.json"), "w"))
json.dump({"vo": "videos/dino-long-en/voice/vo-en.mp3", "voJson": "videos/dino-long-en/edit/vo-mix.json", "length": edl.TOTAL,
           "music": [], "sfx": SFX, "beds": BEDS, "sfxGain": 0.4, "voGain": 1.0},
          open(os.path.join(H, "audio.json"), "w"), ensure_ascii=False, indent=0)
print(len(SFX), "sfx,", len(BEDS), "beds")
