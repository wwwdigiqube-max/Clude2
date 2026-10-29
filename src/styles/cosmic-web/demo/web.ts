// The cosmic web layer: a simulation-style density render (density.ts) for the structure itself, plus a sparse layer of
// crisp sparkles for the brightest galaxies (so it reads as galaxies, not as gas).
import * as THREE from "three";
import { makeDensity } from "./density";
import { ptsFromPacked } from "./pts";

export type Web = ReturnType<typeof makeWeb>;

export function makeWeb(packed: Float32Array, w: number, h: number) {
  const group = new THREE.Group();
  const dots = ptsFromPacked(packed);
  const du = dots.material.uniforms;
  du.uR.value = 0.02;
  du.uMinPx.value = 1.5;
  du.uMaxPx.value = 24;
  du.uGain.value = 1.6;
  du.uSoft.value = 3.4;
  du.uPow.value = 3.2; // only the brightest galaxies sparkle
  du.uCls.value.set(0.25, 0.7, 1.0, 1.4);
  du.uC0.value.set(0.8, 0.86, 1.0); du.uC1.value.set(0.86, 0.92, 1.0); du.uC2.value.set(1.0, 0.9, 0.7); du.uC3.value.set(0.6, 0.78, 1.0);
  dots.renderOrder = 1;
  group.add(dots);
  // the density pass shares the dots' shaping uniforms (window, slab, dark energy…)
  const dens = makeDensity(dots.geometry, du, w, h);
  /** Shared settings. */
  const both = <K extends keyof typeof du>(k: K, v: (typeof du)[K]["value"]) => { (du[k] as { value: unknown }).value = v; };
  return { group, dots, du, dens, both };
}
