# Loudness-ish profile of audio files: RMS dB per 0.5 s + low/high band split, and onsets (> +6 dB jumps).
# usage: python -I energy.py a.wav [b.wav ...]
import sys, wave
import numpy as np

def load(p):
    with wave.open(p, "rb") as w:
        sr, n, ch, sw = w.getframerate(), w.getnframes(), w.getnchannels(), w.getsampwidth()
        raw = w.readframes(n)
    dt = {2: np.int16, 4: np.int32}[sw]
    x = np.frombuffer(raw, dtype=dt).astype(np.float32) / float(np.iinfo(dt).max)
    return (x.reshape(-1, ch).mean(axis=1) if ch > 1 else x), sr

for p in sys.argv[1:]:
    x, sr = load(p)
    hop = sr // 2
    rows = []
    for i in range(0, len(x) - hop, hop):
        fr = x[i:i + hop]
        sp = np.abs(np.fft.rfft(fr * np.hanning(len(fr)))) ** 2
        fq = np.fft.rfftfreq(len(fr), 1 / sr)
        tot = 10 * np.log10(sp.sum() + 1e-12)
        low = 10 * np.log10(sp[fq < 150].sum() + 1e-12)
        hi = 10 * np.log10(sp[fq > 2000].sum() + 1e-12)
        rows.append((i / sr, tot, low, hi))
    print(f"\n== {p}")
    print("t(s) " + " ".join(f"{r[0]:5.1f}" for r in rows))
    print("all  " + " ".join(f"{r[1]:5.0f}" for r in rows))
    print("low  " + " ".join(f"{r[2]:5.0f}" for r in rows))
    print("high " + " ".join(f"{r[3]:5.0f}" for r in rows))
    ons = [f"{rows[k][0]:.1f}(+{rows[k][1]-rows[k-1][1]:.0f})" for k in range(1, len(rows)) if rows[k][1] - rows[k - 1][1] > 6]
    print("onsets:", ", ".join(ons))
