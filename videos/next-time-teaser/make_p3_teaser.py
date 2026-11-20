# "NEXT TIME..." teaser for Part 3, placed at the end of Part 2 (same pattern as the Part 2 teaser in Part 1).
# Narration lines are cut from the finished Part 3 (picture + mix), so no new voice is needed.
import os, subprocess
from PIL import Image, ImageDraw, ImageFont
R = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
O = os.path.join(R, "out/teaser3"); os.makedirs(O, exist_ok=True)
V1 = os.path.join(R, "out/p3-final-v1.mp4")       # the episode as first rendered (old opening)
V3 = os.path.join(R, "videos/final-1080p/part3-day-70-after-the-asteroid-1080p.mp4")  # with the new hook
SFX = os.path.join(R, "out/sfxn")
A = lambda n: ImageFont.truetype(os.path.join(R, "public/fonts/Anton-Regular.ttf"), n)
CREAM, GOLD = (244, 234, 216), (255, 214, 140)

def card(name, lines):
    im = Image.new("RGB", (1920, 1080), (8, 7, 6)); d = ImageDraw.Draw(im)
    for text, size, color, y in lines: d.text((960, y), text, font=A(size), fill=color, anchor="mm")
    p = os.path.join(O, name + ".png"); im.save(p); return p

SEG = [  # (source, start, end) — each carries one narration line
    ("card", card("c-next", [("NEXT TIME…", 120, CREAM, 540)]), 1.6, "lib-whoosh"),
    (V3, 0.0, 2.9),        # Day seventy. The river is frozen.
    (V3, 3.2, 7.0),        # Under the ice, there is food… and something that breathes.
    (V1, 287.5, 289.4),    # WATER BENDS LIGHT
    (V1, 317.5, 320.8),    # The spear jerks in your hands.
    (V1, 681.3, 683.9),    # It doesn't even crack.
    (V1, 770.2, 772.25),   # She wakes up with her heart pounding
    (V1, 842.7, 844.8),    # "That's his handwriting."
    (V1, 915.8, 918.4),   # GONE EAST. DAY 88.
    (V1, 944.21, 946.0),    # …and follow it east.
    ("card", card("c-end", [("PART 3", 150, CREAM, 470), ("70 DAYS AFTER THE ASTEROID", 58, GOLD, 590),
                            ("SUBSCRIBE SO YOU DON'T MISS IT", 30, CREAM, 670)]), 3.5, "lib-boom"),
]
parts = []
for i, s in enumerate(SEG):
    out = os.path.join(O, f"s{i:02d}.mp4")
    if s[0] == "card":
        _, png, dur, sfx = s
        cmd = ["ffmpeg", "-loglevel", "error", "-y", "-loop", "1", "-t", str(dur), "-i", png, "-i", os.path.join(SFX, sfx + ".wav"),
               "-filter_complex", f"[0]fps=24,format=yuv420p,fade=t=in:d=0.25,fade=t=out:st={dur - 0.25}:d=0.25[v];"
               f"[1]aresample=48000,aformat=channel_layouts=stereo,volume=0.5,apad,atrim=0:{dur},afade=t=out:st={dur - 0.4}:d=0.4[a]",
               "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "16", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", out]
    else:
        src, a, b = s; dur = b - a
        cmd = ["ffmpeg", "-loglevel", "error", "-y", "-ss", str(a), "-t", str(dur), "-i", src,
               "-vf", f"fps=24,format=yuv420p,fade=t=in:d=0.12,fade=t=out:st={dur - 0.12}:d=0.12",
               "-af", f"aresample=48000,afade=t=in:d=0.06,afade=t=out:st={dur - 0.15}:d=0.15",
               "-c:v", "libx264", "-crf", "16", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", out]
    subprocess.run(cmd, check=True); parts.append(out)
lst = os.path.join(O, "list.txt"); open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
final = os.path.join(R, "videos/next-time-teaser/next-time-teaser-part3.mp4")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c:v", "libx264", "-crf", "18",
                "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", final], check=True)
print(final, subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", final], capture_output=True, text=True).stdout.strip())
