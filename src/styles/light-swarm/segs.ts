// GPU line/streak systems: every instance is one segment whose two endpoints are
// computed in the vertex shader (pure function of time), expanded to a
// screen-space quad of constant pixel width. Additive, glow-friendly.
import * as THREE from "three";
import { NOISE } from "./glsl";

export type SegAttr = { name: string; size: 1 | 2 | 3 | 4; data: Float32Array };

export const COMMON = /* glsl */ `
uniform float time;
uniform vec2 res;
uniform float px;
uniform float gain;
uniform float lenFade;
${NOISE}
vec3 curl3(vec3 p){
  float e = 0.1;
  vec3 dx = vec3(e,0,0), dy = vec3(0,e,0), dz = vec3(0,0,e);
  float n1 = vnoise3(p+dy), n2 = vnoise3(p-dy), n3 = vnoise3(p+dz), n4 = vnoise3(p-dz), n5 = vnoise3(p+dx), n6 = vnoise3(p-dx);
  return vec3((n1-n2) - (n3-n4), (n3-n4) - (n5-n6), (n5-n6) - (n1-n2)) / (2.0*e);
}
`;

// body must define: vec3 P(float end); float ALPHA(); vec3 COL(float end); float WIDTH();
export function makeSegSystem(count: number, attrs: SegAttr[], body: string, uniforms: Record<string, { value: unknown }> = {}, opts: { additive?: boolean } = {}) {
  const base = new THREE.PlaneGeometry(1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = base.index;
  geo.setAttribute("position", base.attributes.position);
  geo.setAttribute("uv", base.attributes.uv);
  for (const a of attrs) geo.setAttribute(a.name, new THREE.InstancedBufferAttribute(a.data, a.size));
  geo.instanceCount = count;
  const decl = attrs.map((a) => `attribute ${a.size === 1 ? "float" : "vec" + a.size} ${a.name};`).join("\n");
  const U = { time: { value: 0 }, res: { value: new THREE.Vector2(1920, 1080) }, px: { value: 1 }, gain: { value: 1 }, lenFade: { value: 0 }, ...uniforms };
  const mat = new THREE.ShaderMaterial({
    uniforms: U,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: opts.additive === false ? THREE.NormalBlending : THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
${COMMON}
${decl}
varying vec2 vUv; varying vec3 vCol; varying float vA; varying float vLen;
${body}
void main(){
  vec3 A = P(0.0), B = P(1.0);
  vec4 ca = projectionMatrix * viewMatrix * vec4(A, 1.0);
  vec4 cb = projectionMatrix * viewMatrix * vec4(B, 1.0);
  // keep both ends in front of the camera
  if (ca.w < 0.05 && cb.w < 0.05) { gl_Position = vec4(2.0,2.0,2.0,1.0); vA = 0.0; return; }
  if (ca.w < 0.05) ca = mix(cb, ca, (cb.w - 0.05) / max(cb.w - ca.w, 1e-4));
  if (cb.w < 0.05) cb = mix(ca, cb, (ca.w - 0.05) / max(ca.w - cb.w, 1e-4));
  vec2 sa = ca.xy / ca.w * res * 0.5, sb = cb.xy / cb.w * res * 0.5;
  vec2 d = sb - sa; float L = length(d);
  vec2 dir = L > 1e-3 ? d / L : vec2(1.0, 0.0);
  vec2 nrm = vec2(-dir.y, dir.x);
  float w = WIDTH() * px;
  float along = uv.x;           // 0 at A, 1 at B
  float side = uv.y * 2.0 - 1.0;
  vec4 c = mix(ca, cb, along);
  vec2 s = mix(sa, sb, along) + nrm * side * w * 0.5 + dir * (along * 2.0 - 1.0) * w * 0.5;
  gl_Position = vec4(s / (res * 0.5) * c.w, c.z, c.w);
  vUv = vec2(along, side);
  vCol = COL(along);
  vLen = L / max(w, 1e-3);
  vA = ALPHA() / (1.0 + vLen * lenFade);
}`,
    fragmentShader: /* glsl */ `
uniform float gain;
varying vec2 vUv; varying vec3 vCol; varying float vA; varying float vLen;
void main(){
  float e = 1.0 - abs(vUv.y);
  float core = e * e;
  gl_FragColor = vec4(vCol * vA * core * gain, 1.0);
}`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  return { mesh, U, geo };
}

// build strip segments from per-vertex params: each segment gets (paramA, paramB)
export function stripsToSegs(strips: number[][][]) {
  let n = 0;
  for (const s of strips) n += s.length - 1;
  const a = new Float32Array(n * 4), b = new Float32Array(n * 4);
  let k = 0;
  for (const s of strips)
    for (let i = 0; i < s.length - 1; i++) {
      a.set(s[i].concat([0, 0, 0, 0]).slice(0, 4), k * 4);
      b.set(s[i + 1].concat([0, 0, 0, 0]).slice(0, 4), k * 4);
      k++;
    }
  return { n, a, b };
}
