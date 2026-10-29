# Per-speaker pitch (F0) + spectral centroid + speaking rate from an isolated vocal stem and a Scribe STT json.
# Also measures the decay after phrase ends (reverb hint) and band-energy onsets of the background stem.
# usage: python -I voxstats.py vox.wav bg.wav stt.json
import json, sys, wave
import numpy as np

def load(path):
    with wave.open(path, "rb") as w:
        sr, n, ch, sw = w.getframerate(), w.getnframes(), w.getnchannels(), w.getsampwidth()
        raw = w.readframes(n)
    dt = {2: np.int16, 4: np.int32}[sw]
    x = np.frombuffer(raw, dtype=dt).astype(np.float32) / float(np.iinfo(dt).max)
    if ch > 1:
        x = x.reshape(-1, ch).mean(axis=1)
    return x, sr

def f0_frame(fr, sr, fmin=60, fmax=500):
    fr = fr - fr.mean()
    if np.sqrt((fr ** 2).mean()) < 0.01:
        return None
    ac = np.correlate(fr, fr, mode="full")[len(fr) - 1:]
    lo, hi = int(sr / fmax), int(sr / fmin)
    if hi >= len(ac):
        return None
    seg = ac[lo:hi]
    k = int(np.argmax(seg)) + lo
    if ac[k] < 0.35 * ac[0]:
        return None
    return sr / k

vox, sr = load(sys.argv[1])
bg, sr2 = load(sys.argv[2])
stt = json.load(open(sys.argv[3], encoding="utf8"))
words = [w for w in stt["words"] if w["type"] == "word"]

spk = {}
for w in words:
    spk.setdefault(w["speaker_id"], []).append(w)

win = int(0.04 * sr)
for s, ws in sorted(spk.items()):
    f0s, cents, dur = [], [], 0.0
    for w in ws:
        a, b = int(w["start"] * sr), int(w["end"] * sr)
        dur += w["end"] - w["start"]
        for i in range(a, max(a + 1, b - win), win // 2):
            fr = vox[i:i + win]
            if len(fr) < win:
                break
            f = f0_frame(fr, sr)
            if f:
                f0s.append(f)
            sp = np.abs(np.fft.rfft(fr * np.hanning(len(fr))))
            fq = np.fft.rfftfreq(len(fr), 1 / sr)
            if sp.sum() > 0:
                cents.append(float((sp * fq).sum() / sp.sum()))
    f0s = np.array(f0s)
    print(f"{s}: words={len(ws)} f0 median={np.median(f0s):.0f}Hz p10={np.percentile(f0s,10):.0f} p90={np.percentile(f0s,90):.0f} "
          f"(spread {np.percentile(f0s,90)/np.percentile(f0s,10):.2f}x) centroid={np.median(cents):.0f}Hz rate={len(ws)/max(dur,1e-3):.2f} words/s-of-speech")

# decay after phrase ends: energy (dB) in 50 ms windows after the last word of each speaker turn
def db(x):
    return 10 * np.log10(np.mean(x ** 2) + 1e-12)
print("\ndecay after turn ends (dB at +0/+100/+200/+300/+400 ms relative to last 100ms of speech):")
turns = []
for i, w in enumerate(words):
    nxt = words[i + 1] if i + 1 < len(words) else None
    if nxt is None or nxt["start"] - w["end"] > 0.45:
        turns.append(w["end"])
for e in turns:
    i = int(e * sr)
    ref = db(vox[i - int(0.1 * sr):i])
    vals = [db(vox[i + int(k * 0.1 * sr): i + int((k + 0.5) * 0.1 * sr)]) - ref for k in range(0, 5)]
    print(f"  end {e:6.2f}s: " + " ".join(f"{v:6.1f}" for v in vals))

# background: band energies per 50 ms, report onsets (jump > 8 dB over the previous 250 ms average)
hop = int(0.05 * sr2)
bands = {"sub<120": (20, 120), "low120-400": (120, 400), "mid400-2k": (400, 2000), "hi2k-8k": (2000, 8000), "air>8k": (8000, 16000)}
nfr = len(bg) // hop - 1
E = {k: np.zeros(nfr) for k in bands}
for j in range(nfr):
    fr = bg[j * hop:j * hop + 2 * hop] * np.hanning(2 * hop)
    sp = np.abs(np.fft.rfft(fr)) ** 2
    fq = np.fft.rfftfreq(2 * hop, 1 / sr2)
    for k, (lo, hi) in bands.items():
        E[k][j] = 10 * np.log10(sp[(fq >= lo) & (fq < hi)].sum() + 1e-12)
print("\nbackground onsets (band: time +dB):")
for k in bands:
    e = E[k]
    hits = []
    for j in range(6, nfr):
        prev = e[j - 6:j - 1].mean()
        if e[j] - prev > 8 and (not hits or j * 0.05 - hits[-1][0] > 0.3):
            hits.append((j * 0.05, e[j] - prev))
    print(f"  {k}: " + ", ".join(f"{t:.2f}(+{d:.0f})" for t, d in hits))
print("\nbackground band levels per second (dB):")
for k in bands:
    e = E[k]
    print(f"  {k:11s} " + " ".join(f"{e[int(s/0.05):int((s+1)/0.05)].mean():5.0f}" for s in range(0, int(nfr * 0.05))))
