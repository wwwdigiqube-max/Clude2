# Re-assemble the EN narration with a directed rhythm: sentence-level pauses + varied gaps. Free (no TTS).
# Output: voice/vo-en.mp3 (mastered, lighter compression) + voice/sentences.json (start/end of every sentence in the final file)
import json, re, subprocess, wave, os, numpy as np
D = "videos/dino-long-en/voice/"; T = "out/vo2/"; os.makedirs(T, exist_ok=True)
SR = 44100
items = json.load(open(D + "chunks.json"))
# beats that land harder with a held breath BEFORE them
BEFORE = ["It isn't a tree", "It has claws", "It blinks", "It isn't a log", "It's not a dream", "You weigh 70", "Then the roof comes down",
          "Everything you dug, gone", "One of them didn't get up", "It lunges", "Just one thing this world", "It shrieks",
          "Then, in the south, a light", "Like someone switched", "The T. rex. From day one", "It can't get in", "Then it stops",
          "The last dinosaur you saw", "A long scar", "The same skeleton", "One of them was you", "Stay small… but",
          "A bird, singing", "Dinosaurs left: zero", "Pip followed you", "It's right.", "Food for the dark", "It was worth it",
          "And now you have someone", "Maybe this is all a dream", "The pain is real", "Now you have to prove it", "3%."]
def load(i):
    w = f"{T}c{i}.wav"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", f"{D}chunksA/{i:02d}.mp3", "-ac", "1", "-ar", str(SR), w])
    x = wave.open(w); return np.frombuffer(x.readframes(x.getnframes()), np.int16)
out, sents, t = [], [], 0.0
def add(arr):
    global t
    out.append(arr); t += len(arr) / SR
sil = lambda s: np.zeros(int(s * SR), np.int16)
prev_ch = None
for i, c in enumerate(items):
    if "pause" in c: add(sil(1.4)); continue
    if prev_ch is not None:
        add(sil(1.3 if c["ch"] != prev_ch else 0.85 if c["text"].startswith("Day ") else 0.55))
    prev_ch = c["ch"]
    x = load(i); al = json.load(open(f"{D}chunksA/{i:02d}.json"))["alignment"]
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    text = "".join(chars)
    # sentence spans in this chunk
    spans = [(m.start(), m.end()) for m in re.finditer(r"[^.!?…]+[.!?…]+[\"”’]?|[^.!?…]+$", text)]
    spans = [(a + len(text[a:b]) - len(text[a:b].lstrip()), b) for a, b in spans if text[a:b].strip()]
    cut0 = 0
    for k, (a, b) in enumerate(spans):
        s_text = text[a:b].strip()
        s_start = st[a]; s_end = en[b - 1]
        if k + 1 < len(spans):
            nxt = text[spans[k + 1][0]:spans[k + 1][1]].strip(); n_start = st[spans[k + 1][0]]
            cut = nxt0 = (s_end + n_start) / 2
            if any(nxt.startswith(p) for p in BEFORE): extra = 0.55
            elif len(s_text.split()) <= 3 and len(nxt.split()) <= 3 and n_start - s_end > 0.2:  # staccato: tighten the natural gap
                extra = 0; cut = s_end + 0.08; nxt0 = n_start - 0.08
            else: extra = 0
        else:
            cut = nxt0 = len(x) / SR; extra = 0
        seg = x[int(cut0 * SR):int(cut * SR)]
        sents.append({"chunk": i, "text": s_text, "start": round(t + (s_start - cut0), 3), "end": round(t + (s_end - cut0), 3)})
        add(seg); add(sil(extra)); cut0 = nxt0
y = np.concatenate(out)
w = wave.open(T + "raw.wav", "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes()); w.close()
CH = ("highpass=f=70,equalizer=f=140:t=q:w=1:g=2.5,equalizer=f=350:t=q:w=1.2:g=-2,equalizer=f=3800:t=q:w=1.5:g=2,deesser=i=0.4,"
      "acompressor=threshold=-22dB:ratio=2:attack=12:release=180:makeup=2,aecho=0.85:0.5:28|46:0.14|0.09,loudnorm=I=-16:TP=-1.5:LRA=11")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", T + "raw.wav", "-af", CH, "-ar", "48000", "-b:a", "192k", D + "vo-en.mp3"])
json.dump(sents, open(D + "sentences.json", "w"), ensure_ascii=False, indent=0)
print("sentences", len(sents), "duration", f"{int(t//60)}:{t%60:04.1f}")
