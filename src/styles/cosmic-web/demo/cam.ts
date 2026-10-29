// Camera for video 18. The world is in million light-years (Mly) and spans ~20 orders of magnitude (Earth → the
// observable universe), so nothing is rendered in world units: the camera sits at the render-space origin and every
// layer is shifted/scaled by k = 10 / |look − pos| (the look point is always 10 render units away). Double precision
// stays in JS; the GPU only sees small numbers near what is on screen.
import * as THREE from "three";

export type V3 = [number, number, number];
export type View = { pos: V3; look: V3; fov: number; roll?: number };
export type Layer = { obj: THREE.Object3D; origin: V3; unit: number; onK?: (k: number) => void };

export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
export const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
export const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const norm = (a: V3): V3 => mul(a, 1 / (len(a) || 1));

export const RENDER_DIST = 10;

/** Set the three camera and every layer transform for this view. Returns k (render units per Mly). */
export function applyView(cam: THREE.PerspectiveCamera, v: View, layers: Layer[], aspect: number) {
  const dir = sub(v.look, v.pos);
  const k = RENDER_DIST / (len(dir) || 1e-30);
  cam.position.set(0, 0, 0);
  cam.up.set(0, 1, 0);
  const lk = mul(dir, k);
  cam.lookAt(lk[0], lk[1], lk[2]);
  if (v.roll) cam.rotateZ(v.roll);
  cam.fov = v.fov;
  cam.aspect = aspect;
  cam.near = 0.002;
  cam.far = 1e7;
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld(true);
  for (const L of layers) {
    if (!L.obj.visible) continue;
    const o = mul(sub(L.origin, v.pos), k);
    L.obj.position.set(o[0], o[1], o[2]);
    L.obj.scale.setScalar(k * L.unit);
    L.obj.updateMatrixWorld(true);
    L.onK?.(k * L.unit);
  }
  return k;
}

/** Screen position (px) of a world point (Mly) for overlays; null if behind the camera. */
export function project(v: View, p: V3, w: number, h: number): { x: number; y: number; d: number } | null {
  const cam = new THREE.PerspectiveCamera(v.fov, w / h, 0.002, 1e7);
  const dir = sub(v.look, v.pos);
  const k = RENDER_DIST / (len(dir) || 1e-30);
  const lk = mul(dir, k);
  cam.lookAt(lk[0], lk[1], lk[2]);
  if (v.roll) cam.rotateZ(v.roll);
  cam.updateMatrixWorld(true);
  const r = mul(sub(p, v.pos), k);
  const q = new THREE.Vector3(r[0], r[1], r[2]).applyMatrix4(cam.matrixWorldInverse);
  if (q.z > -1e-6) return null;
  const d = -q.z;
  q.applyMatrix4(cam.projectionMatrix);
  return { x: (q.x * 0.5 + 0.5) * w, y: (-q.y * 0.5 + 0.5) * h, d: d / k };
}

/** Pixel scale for point sprites: pixels per render unit at depth 1. */
export const pxScale = (fov: number, h: number) => h / (2 * Math.tan((fov * Math.PI) / 360));

// ── easing / ramps
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const smooth = (t: number, a: number, b: number) => { const x = ramp(t, a, b); return x * x * (3 - 2 * x); };
export const smoother = (t: number, a: number, b: number) => { const x = ramp(t, a, b); return x * x * x * (x * (x * 6 - 15) + 10); };
export const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const window01 = (t: number, a: number, b: number, fi = 0.6, fo = 0.6) => Math.min(smooth(t, a, a + fi), 1 - smooth(t, b - fo, b));

/** Orbit-style view: look at `look` from direction (az, el in radians) at distance `dist`. */
export function orbit(look: V3, az: number, el: number, dist: number, fov: number, roll = 0): View {
  const c = Math.cos(el);
  return { pos: add(look, [Math.sin(az) * c * dist, Math.sin(el) * dist, Math.cos(az) * c * dist]), look, fov, roll };
}
