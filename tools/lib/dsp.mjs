// Tiny DSP toolkit for synthesized SFX and music beds (44.1k mono, 16-bit WAV).
import fs from "node:fs";

export const SR = 44100;
export const TAU = Math.PI * 2;

let seed = 11;
export const reseed = (s) => { seed = s >>> 0; };
export const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
export const noise = () => rnd() * 2 - 1;
export const buf = (s) => new Float32Array(Math.ceil(s * SR));
export const lowpass = (x, fc) => { let y = 0; const o = new Float32Array(x.length); for (let i = 0; i < x.length; i++) { const c = typeof fc === "function" ? fc(i) : fc; y += (1 - Math.exp((-TAU * c) / SR)) * (x[i] - y); o[i] = y; } return o; };
export const highpass = (x, fc) => { const l = lowpass(x, fc); return x.map((v, i) => v - l[i]); };
/** Oscillator; f may be a function of time (s). shape: sine | tri | saw | sq */
export const osc = (s, f, shape = "sine") => { const b = buf(s); let ph = 0; for (let i = 0; i < b.length; i++) { ph += (typeof f === "function" ? f(i / SR) : f) / SR; const p = ph % 1;
  b[i] = shape === "sine" ? Math.sin(TAU * p) : shape === "tri" ? 4 * Math.abs(p - 0.5) - 1 : shape === "sq" ? (p < 0.5 ? 0.6 : -0.6) : 2 * p - 1; } return b; };
/** Multiply by fn(progress 0..1, seconds). */
export const env = (b, fn) => { for (let i = 0; i < b.length; i++) b[i] *= fn(i / b.length, i / SR); return b; };
/** Exponential decay with short attack. */
export const dec = (b, tau, atk = 0.003) => env(b, (_, s) => Math.min(1, s / atk) * Math.exp(-s / tau));
export const mix = (d, s, at = 0, g = 1) => { const o = Math.round(at * SR); for (let i = 0; i < s.length && o + i < d.length; i++) if (o + i >= 0) d[o + i] += s[i] * g; return d; };
export const nz = (s) => { const b = buf(s); for (let i = 0; i < b.length; i++) b[i] = noise(); return b; };
export const norm = (b, pk) => { let m = 0; for (const v of b) m = Math.max(m, Math.abs(v)); if (m) for (let i = 0; i < b.length; i++) b[i] *= pk / m; return b; };
export const bell = (f, s = 1.2, tau = 0.4) => { const b = buf(s); [[1, 1], [2.01, 0.35], [3.02, 0.12]].forEach(([m, g]) => mix(b, dec(osc(s, f * m), tau / m), 0, g)); return b; };
export const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

export const writeWav = (url, b) => {
  const d = Buffer.alloc(b.length * 2);
  for (let i = 0; i < b.length; i++) d.writeInt16LE(Math.round(Math.max(-1, Math.min(1, b[i])) * 32767), i * 2);
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + d.length, 4); h.write("WAVE", 8); h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(d.length, 40);
  fs.writeFileSync(url, Buffer.concat([h, d]));
};
