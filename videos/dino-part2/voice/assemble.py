# chunks/*.mp3 -> vo-en.mp3 + timeline.json (chunk offsets + char alignment) with mood-based gaps. Channel voice lock v2.
import json, subprocess, os
H = os.path.dirname(os.path.abspath(__file__)); os.chdir(H)
items = json.load(open("chunks.json"))
GAP = {"tense": 0.22, "story": 0.4, "sad": 0.6}       # between chunks
PAUSE, PARA, TAG, CHAP = 0.9, 0.25, 0.5, 1.0           # (pause) · paragraph · [DAY ..] card · new chapter
CH = ("adeclick=w=40:o=75:t=1.8:b=2,highpass=f=70,equalizer=f=140:t=q:w=1:g=2.5,equalizer=f=350:t=q:w=1.2:g=-2,equalizer=f=3800:t=q:w=1.5:g=2,deesser=i=0.4,"
      "acompressor=threshold=-22dB:ratio=2:attack=12:release=180:makeup=2,aecho=0.85:0.5:28|46:0.14|0.09,loudnorm=I=-16:TP=-1.5:LRA=11")
def dur(f): return float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f],capture_output=True,text=True).stdout)
parts, tl, t, prev, lastch = [], [], 0.0, None, None
for i, it in enumerate(items):
    if "pause" in it: parts.append(("s", PAUSE)); t += PAUSE; continue
    if "para" in it: parts.append(("s", PARA)); t += PARA; continue
    if "tag" in it: parts.append(("s", TAG)); tl.append({"i": i, "tag": it["tag"], "t": round(t, 3)}); t += TAG; continue
    if prev is not None:
        g = CHAP if it["ch"] != lastch else GAP[it["mood"]]
        parts.append(("s", g)); t += g
    f = f"chunks/{i:03d}.mp3"; d = dur(f); a = json.load(open(f.replace(".mp3", ".json")))["alignment"]
    tl.append({"i": i, "ch": it["ch"], "mood": it["mood"], "t": round(t, 3), "dur": round(d, 3), "text": it["text"], "alignment": a})
    parts.append(("f", f)); t += d; prev, lastch = it, it["ch"]
inputs, fc = [], ""
for n, (k, v) in enumerate(parts):
    inputs += ["-i", v] if k == "f" else ["-f", "lavfi", "-t", str(v), "-i", "anullsrc=r=44100:cl=mono"]
    fade = f",afade=t=in:d=0.012,afade=t=out:st={dur(v)-0.015:.3f}:d=0.015" if k == "f" else ""   # no clicks at chunk seams
    fc += f"[{n}]aresample=44100,aformat=channel_layouts=mono{fade}[a{n}];"
fc += "".join(f"[a{n}]" for n in range(len(parts))) + f"concat=n={len(parts)}:v=0:a=1,{CH}"
open("/tmp/fc.txt", "w").write(fc)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *inputs, "-filter_complex_script", "/tmp/fc.txt", "-ar", "48000", "-b:a", "192k", "vo-en.mp3"], check=True)
json.dump(tl, open("timeline.json", "w"))
print("vo-en.mp3", round(dur("vo-en.mp3"), 1), "s · planned", round(t, 1))
