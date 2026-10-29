# List transients (local energy peaks) of an audio file at 20 ms resolution — to check effects land on their cues.
# usage: python -I transients.py file.wav [min_rise_db=7]
import sys, wave
import numpy as np

w = wave.open(sys.argv[1], "rb")
sr, ch, sw = w.getframerate(), w.getnchannels(), w.getsampwidth()
raw = w.readframes(w.getnframes())
dt = {2: np.int16, 4: np.int32}[sw]
x = np.frombuffer(raw, dtype=dt).astype(np.float32).reshape(-1, ch).mean(axis=1)
rise = float(sys.argv[2]) if len(sys.argv) > 2 else 7.0
hop = int(0.02 * sr)
n = len(x) // hop
e = np.array([20 * np.log10(np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2)) + 1e-9) for i in range(n)])
peaks = []
for i in range(5, n - 5):
    if e[i] == e[i - 5:i + 6].max() and e[i] - np.median(e[max(0, i - 25):i]) > rise:
        peaks.append((i * 0.02, e[i] - e.max()))
print("transients (s @ dB re max):")
print(", ".join(f"{t:.2f}@{d:.0f}" for t, d in peaks))
