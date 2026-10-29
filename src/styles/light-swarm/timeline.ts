// Director helpers for light-swarm films: the transition table, the camera
// spline and the glitch hits. Everything is a pure function of t.
import * as THREE from "three";
import type { SwarmEngine } from "./engine";
import { clamp, hash, lastIdx, pulse } from "./math";

type Vec = [number, number, number];

/**
 * One morph from shape `a` to shape `b`.
 * t0 start · D how long departures are spread (build) · F flight time of one particle
 * q 1 = depart in beat batches (each beat releases the next part of the build), 0 = continuous
 * oa / ob world offset of the source / target shape · swirl spiral-in (rad) · turb curl noise in flight
 * dim brightness while flying (0.2 for a shatter where everything flies at once, ~0.6 for a build)
 */
export type Transition = { t0: number; D: number; F: number; q: 0 | 1; a: string; b: string; oa?: Vec; ob?: Vec; swirl: number; turb: number; dim?: number };

export const transitionAt = (table: Transition[], t: number) => {
  let k = 0;
  for (let i = 0; i < table.length; i++) if (t >= table[i].t0) k = i;
  return table[k];
};
/** Is any transition still flying at time t? */
export const flying = (table: Transition[], t: number) => table.some((x) => t >= x.t0 && t < x.t0 + x.D + x.F);

/** Push the transition that is active at t into the particle uniforms. */
export function applyTransition(E: SwarmEngine, table: Transition[], t: number, kicks: number[]) {
  const tr = transitionAt(table, t);
  const pu = E.partU;
  pu.sA.value = E.shapeIndex(tr.a);
  pu.sB.value = E.shapeIndex(tr.b);
  pu.offA.value.set(...(tr.oa ?? [0, 0, 0]));
  pu.offB.value.set(...(tr.ob ?? [0, 0, 0]));
  pu.t0.value = tr.t0;
  pu.D.value = tr.D;
  pu.F.value = tr.F;
  pu.quant.value = tr.q;
  pu.swirl.value = tr.swirl;
  pu.turb.value = tr.turb;
  pu.flyDim.value = tr.dim ?? 0.6;
  pu.tPrev.value = t - 0.06;
  const ki = lastIdx(t, kicks);
  pu.lastKick.value = ki >= 0 ? kicks[ki] : -9;
  return tr;
}

/** Camera key: [t, azimuth, elevation, distance, lookX, lookY, lookZ, fov]. */
export type CamKey = [number, number, number, number, number, number, number, number];

/** Monotone cubic spline through the keys (distance interpolated in log space), plus decaying shakes [t, amount]. */
export function cameraSpline(keys: CamKey[], shakes: [number, number][] = []) {
  const NCH = 7;
  const kv = (i: number, c: number) => (c === 2 ? Math.log(keys[i][c + 1]) : keys[i][c + 1]);
  const n = keys.length;
  const tang: number[][] = [];
  for (let c = 0; c < NCH; c++) {
    const d: number[] = [];
    for (let i = 0; i < n - 1; i++) d.push((kv(i + 1, c) - kv(i, c)) / (keys[i + 1][0] - keys[i][0]));
    tang.push(keys.map((_, i) => (i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (2 * d[i - 1] * d[i]) / (d[i - 1] + d[i]))));
  }
  return (t: number) => {
    const tt = clamp(t, keys[0][0], keys[n - 1][0]);
    let i = 0;
    while (i < n - 2 && keys[i + 1][0] <= tt) i++;
    const h = keys[i + 1][0] - keys[i][0];
    const s = (tt - keys[i][0]) / h;
    const h00 = 2 * s * s * s - 3 * s * s + 1, h10 = s * s * s - 2 * s * s + s, h01 = -2 * s * s * s + 3 * s * s, h11 = s * s * s - s * s;
    const v: number[] = [];
    for (let c = 0; c < NCH; c++) v.push(h00 * kv(i, c) + h10 * h * tang[c][i] + h01 * kv(i + 1, c) + h11 * h * tang[c][i + 1]);
    const [az, el, ld, lx, ly, lz, fov] = v;
    const d = Math.exp(ld);
    const look = new THREE.Vector3(lx, ly, lz);
    const pos = look.clone().add(new THREE.Vector3(Math.sin(az) * Math.cos(el) * d, Math.sin(el) * d, Math.cos(az) * Math.cos(el) * d));
    let sh = 0;
    for (const [ts, a] of shakes) if (t >= ts) sh = Math.max(sh, a * Math.exp(-(t - ts) * 7));
    if (sh > 0.001) {
      const f = Math.floor(t * 30);
      pos.add(new THREE.Vector3((hash(f) - 0.5) * sh, (hash(f + 7.3) - 0.5) * sh, 0));
    }
    return { pos, look, fov, az };
  };
}

/** Apply a camera function at t (and return the view-projection of the previous frame for streaks). */
export function applyCamera(cam: (t: number) => { pos: THREE.Vector3; look: THREE.Vector3; fov: number }, c: THREE.PerspectiveCamera, t: number, fps = 30) {
  const tmp = c.clone();
  const set = (o: THREE.PerspectiveCamera, tt: number) => {
    const k = cam(tt);
    o.position.copy(k.pos);
    o.up.set(0, 1, 0);
    o.lookAt(k.look);
    o.fov = k.fov;
    o.updateProjectionMatrix();
    o.updateMatrixWorld(true);
  };
  set(c, t);
  set(tmp, t - 1 / fps);
  return new THREE.Matrix4().multiplyMatrices(tmp.projectionMatrix, tmp.matrixWorldInverse);
}

/** Glitch amount: a hit on each scene change (big ones stronger) + small flickers on snares while shapes fly. */
export function glitchAt(t: number, hits: number[], big: number[], snares: number[], table: Transition[]) {
  let g = 0;
  for (const x of hits) {
    const d = t - x + 0.07;
    if (d >= 0 && d < 0.3) g = Math.max(g, (big.includes(x) ? 0.9 : 0.55) * Math.exp(-d * 11) * (hash(Math.floor(t * 30) + x) > 0.25 ? 1 : 0.3));
  }
  if (flying(table, t) && pulse(t, snares, 30) > 0.5) g = Math.max(g, 0.14);
  return g;
}
