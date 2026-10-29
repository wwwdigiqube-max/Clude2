// Tiny 3D: points in world space (y down), a pinhole camera, projection to the 1080×1920 frame.
import { H, W } from "./canvas";

export type V3 = [number, number, number];
export type Cam3 = { x: number; y: number; z: number; yaw: number; pitch: number; roll?: number; f: number; cx?: number; cy?: number };
export const rotY = ([x, y, z]: V3, a: number): V3 => [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];
export const rotX = ([x, y, z]: V3, a: number): V3 => [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
export const rotZ = ([x, y, z]: V3, a: number): V3 => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z];
export const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const scl3 = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
/** screen x, y, depth (camera z) and the pixel scale at that depth; null behind the camera */
export function project(p: V3, cam: Cam3): [number, number, number, number] | null {
  let q: V3 = [p[0] - cam.x, p[1] - cam.y, p[2] - cam.z];
  q = rotY(q, -cam.yaw);
  q = rotX(q, -cam.pitch);
  if (cam.roll) q = rotZ(q, -cam.roll);
  if (q[2] < 1) return null;
  const s = cam.f / q[2];
  return [(cam.cx ?? W / 2) + q[0] * s, (cam.cy ?? H / 2) + q[1] * s, q[2], s];
}
/** draw a 3D polyline (skips segments behind the camera) */
export function line3(c: CanvasRenderingContext2D, pts: V3[], cam: Cam3, close = false) {
  c.beginPath();
  let pen = false;
  const all = close ? [...pts, pts[0]] : pts;
  for (const p of all) {
    const s = project(p, cam);
    if (!s) {
      pen = false;
      continue;
    }
    if (pen) c.lineTo(s[0], s[1]);
    else c.moveTo(s[0], s[1]);
    pen = true;
  }
  c.stroke();
}
