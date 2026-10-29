// Where the lonely void galaxies sit (shared by the layer that draws them and the director that labels them).
export type VGal = { p: [number, number, number]; R: number; spiral: boolean };

export function voidGalaxyCenters(c: [number, number, number], r: number, count = 26): VGal[] {
  let s = 303;
  const rnd = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const out: VGal[] = [];
  for (let j = 0; j < count; j++) {
    let x = 0, y = 0, z = 0;
    do { x = rnd() * 2 - 1; y = rnd() * 2 - 1; z = rnd() * 2 - 1; } while (x * x + y * y + z * z > 1);
    const R = 0.15 + 0.35 * rnd();
    const spiral = rnd() >= 0.5;
    out.push({ p: [c[0] + x * r * 0.7, c[1] + y * r * 0.5, c[2] + z * r * 0.7], R, spiral });
  }
  return out;
}
