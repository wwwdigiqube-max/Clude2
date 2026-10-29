// Light Logo · the light-swarm segment system with two upgrades:
//  • depth of field: every segment grows by its circle of confusion |depth − focus| / depth and dims to keep its
//    energy, so out-of-focus light turns into soft bokeh discs (uniforms focus, bokeh, maxCoc — shared objects)
//  • round caps: the soft falloff is a capsule, so short or wide segments read as discs, not squares.
import * as THREE from "three";
import { COMMON, type SegAttr } from "../../light-swarm/segs";

export type DofU = { focus: { value: number }; bokeh: { value: number }; maxCoc: { value: number } };
export const makeDof = (): DofU => ({ focus: { value: 100 }, bokeh: { value: 0 }, maxCoc: { value: 30 } });

// body must define: vec3 P(float end); float ALPHA(); vec3 COL(float end); float WIDTH();
export function makeSegs(count: number, attrs: SegAttr[], body: string, uniforms: Record<string, { value: unknown }>, dof: DofU | null) {
  const base = new THREE.PlaneGeometry(1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = base.index;
  geo.setAttribute("position", base.attributes.position);
  geo.setAttribute("uv", base.attributes.uv);
  for (const a of attrs) geo.setAttribute(a.name, new THREE.InstancedBufferAttribute(a.data, a.size));
  geo.instanceCount = count;
  const decl = attrs.map((a) => `attribute ${a.size === 1 ? "float" : "vec" + a.size} ${a.name};`).join("\n");
  const U = { time: { value: 0 }, res: { value: new THREE.Vector2(1920, 1080) }, px: { value: 1 }, gain: { value: 1 }, lenFade: { value: 0 }, ...(dof ?? makeDof()), ...uniforms };
  const mat = new THREE.ShaderMaterial({
    uniforms: U,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
${COMMON}
${decl}
uniform float focus, bokeh, maxCoc;
varying vec2 vUv; varying vec3 vCol; varying float vA; varying float vLen;
// a body may lower its own defocus (thin lines vanish when they are blurred with energy kept): set DOFK in WIDTH()
float DOFK = 1.0;
${body}
void main(){
  vec3 A = P(0.0), B = P(1.0);
  vec4 ca = projectionMatrix * viewMatrix * vec4(A, 1.0);
  vec4 cb = projectionMatrix * viewMatrix * vec4(B, 1.0);
  if (ca.w < 0.05 && cb.w < 0.05) { gl_Position = vec4(2.0,2.0,2.0,1.0); vA = 0.0; return; }
  if (ca.w < 0.05) ca = mix(cb, ca, (cb.w - 0.05) / max(cb.w - ca.w, 1e-4));
  if (cb.w < 0.05) cb = mix(ca, cb, (ca.w - 0.05) / max(ca.w - cb.w, 1e-4));
  vec2 sa = ca.xy / ca.w * res * 0.5, sb = cb.xy / cb.w * res * 0.5;
  vec2 d = sb - sa; float L = length(d);
  vec2 dir = L > 1e-3 ? d / L : vec2(1.0, 0.0);
  vec2 nrm = vec2(-dir.y, dir.x);
  float w0 = WIDTH() * px;
  float depth = 0.5 * (ca.w + cb.w);
  float coc = min(bokeh * DOFK * abs(depth - focus) / max(depth, 1.0), maxCoc) * px;
  float w = w0 + coc;
  float along = uv.x;
  float side = uv.y * 2.0 - 1.0;
  vec4 c = mix(ca, cb, along);
  vec2 s = mix(sa, sb, along) + nrm * side * w * 0.5 + dir * (along * 2.0 - 1.0) * w * 0.5;
  gl_Position = vec4(s / (res * 0.5) * c.w, c.z, c.w);
  vUv = vec2(along, side);
  vCol = COL(along);
  vLen = L / max(w, 1e-3);
  float keep = (w0 * w0) / (w * w);
  vA = ALPHA() * keep / (1.0 + vLen * lenFade);
}`,
    fragmentShader: /* glsl */ `
uniform float gain;
varying vec2 vUv; varying vec3 vCol; varying float vA; varying float vLen;
void main(){
  float s = vUv.x * (vLen + 1.0) - 0.5;
  float da = max(0.0, max(-s, s - vLen));
  float dc = abs(vUv.y) * 0.5;
  float e = clamp(1.0 - 2.0 * length(vec2(da, dc)), 0.0, 1.0);
  gl_FragColor = vec4(vCol * vA * e * e * gain, 1.0);
}`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  return { mesh, U, geo };
}
