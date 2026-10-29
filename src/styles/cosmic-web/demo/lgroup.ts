// The Local Group (local unit = Mly, origin = Milky Way centre): Milky Way, Andromeda, Triangulum, ~80 dwarfs,
// and the faint grey halo of gas and dark matter that holds them together. Also the far-future merger (one elliptical).
import * as THREE from "three";
import { type V3, norm, add, mul } from "./cam";
import { galaxyPoints, makeGalaxy } from "./galaxy";
import { ptsFromPacked, ptsShare, ptsUniforms, type PtsU } from "./pts";

/** Milky Way centre in global coordinates (the Sun/Earth is the global origin). */
export const MWC: V3 = [-0.026, 0, 0];
/** Andromeda and Triangulum relative to the Milky Way centre. */
export const M31: V3 = mul(norm([-0.62, 0.2, -0.76]), 2.5);
export const M33: V3 = add(M31, [0.42, -0.22, 0.56]);
export const LG_CENTRE: V3 = mul(M31, 0.42);

const mul32 = (s: number) => () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

export function makeLocalGroup() {
  const group = new THREE.Group();
  const rnd = mul32(31);
  const g = () => { let u = 0; while (u === 0) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); };

  // Milky Way: barred spiral, seen in the xz plane; the Sun sits 26 000 ly out on +x
  const mw = makeGalaxy({ R: 0.05, n: 170000, arms: 2, bar: 0.24, pitch: 0.21, bulge: 0.16, blue: 0.3, thick: 0.018, seed: 3 });
  // Andromeda: bigger, tilted
  const m31 = makeGalaxy({ R: 0.1, n: 170000, arms: 2, pitch: 0.16, bulge: 0.24, blue: 0.22, thick: 0.02, seed: 5 });
  m31.group.position.set(...M31);
  m31.group.rotation.set(1.05, 0.6, 0.35);
  const m33 = makeGalaxy({ R: 0.03, n: 35000, arms: 2, pitch: 0.3, bulge: 0.08, blue: 0.4, seed: 8 });
  m33.group.position.set(...M33);
  m33.group.rotation.set(0.5, -0.4, 0.9);
  // far future: the merged giant elliptical ("Milkomeda") at the group centre
  const merged = makeGalaxy({ R: 0.14, n: 160000, kind: "elliptical", axes: [1, 0.72, 0.58], seed: 11 });
  merged.group.position.set(...LG_CENTRE);
  merged.group.visible = false;
  merged.su.uGain.value = 0.5; merged.su.uCls.value.set(1, 1, 0.3, 1); merged.gu.uGain.value = 0.12;

  // dwarfs: satellites of both big galaxies + field dwarfs
  const dw: { c: V3; R: number }[] = [];
  const around = (c: V3, n: number, rad: number) => { for (let i = 0; i < n; i++) dw.push({ c: add(c, [g() * rad, g() * rad * 0.7, g() * rad]), R: 0.002 + 0.008 * rnd() ** 2 }); };
  dw.push({ c: [0.11, -0.09, 0.07], R: 0.014 }, { c: [0.14, -0.12, 0.03], R: 0.008 }); // the two Magellanic Clouds
  around([0, 0, 0], 28, 0.22);
  around(M31, 30, 0.25);
  around(LG_CENTRE, 22, 1.1);
  const per = 500;
  const dwf = new Float32Array(dw.length * per * 4);
  dw.forEach((d, j) => {
    const p = galaxyPoints({ R: d.R, n: per, kind: "dwarf", seed: 100 + j, blue: 0.35 });
    for (let i = 0; i < per; i++) {
      const o = (j * per + i) * 4;
      dwf[o] = d.c[0] + p[i * 4]; dwf[o + 1] = d.c[1] + p[i * 4 + 1]; dwf[o + 2] = d.c[2] + p[i * 4 + 2]; dwf[o + 3] = p[i * 4 + 3];
    }
  });
  const dwarfs = ptsFromPacked(dwf);
  const du = dwarfs.material.uniforms;
  // dwarfs are faint smudges, not white balls: hundreds of stars in a few pixels must stay dim
  du.uR.value = 0.0004; du.uMinPx.value = 1.0; du.uGain.value = 0.22; du.uSoft.value = 3.0;
  const dGlow = ptsShare(dwarfs, ptsUniforms());
  const dgu = dGlow.material.uniforms;
  dgu.uEvery.value = 10; dgu.uR.value = 0.006; dgu.uMinPx.value = 2; dgu.uGain.value = 0; dgu.uSoft.value = 1.2;
  dGlow.visible = false;

  // halo: soft grey cloud around the whole group
  // many faint, very soft blobs = a smooth fog (a few big ones look blotchy)
  const hn = 7000, hf = new Float32Array(hn * 4);
  for (let i = 0; i < hn; i++) {
    const c = rnd() < 0.5 ? [0, 0, 0] : M31;
    const s = rnd() < 0.55 ? 0.45 : 1.25;
    hf.set([c[0] * 0.75 + LG_CENTRE[0] * 0.25 + g() * s, g() * s * 0.55, c[2] * 0.75 + LG_CENTRE[2] * 0.25 + g() * s, 0.3 + 0.2 * rnd()], i * 4);
  }
  const halo = ptsFromPacked(hf);
  const hu = halo.material.uniforms;
  hu.uR.value = 0.5; hu.uMinPx.value = 6; hu.uMaxPx.value = 700; hu.uGain.value = 0.0045; hu.uSoft.value = 0.9;
  hu.uTint.value = new THREE.Color(0.75, 0.8, 0.85);
  halo.renderOrder = -5;
  halo.visible = false; // a fog of soft sprites read as cotton wool; the group is shown by its galaxies alone

  group.add(halo, mw.group, m31.group, m33.group, merged.group, dGlow, dwarfs);
  const pts: PtsU[] = [mw.su, mw.gu, m31.su, m31.gu, m33.su, m33.gu, merged.su, merged.gu, du, dgu, hu];
  /** per frame: pixel scale + render units per Mly */
  const frame = (px: number, k: number) => pts.forEach((u) => { u.uPx.value = px; u.uK.value = k; });
  const fade = { mw: 1, others: 1, halo: 1 };
  const setFade = () => {
    mw.both("uFade", fade.mw);
    for (const G of [m31, m33]) G.both("uFade", fade.others);
    du.uFade.value = dgu.uFade.value = fade.others;
    hu.uFade.value = fade.halo;
  };
  return { group, mw, m31, m33, merged, dwarfs, halo, du, dgu, hu, frame, fade, setFade, dwarfList: dw };
}
