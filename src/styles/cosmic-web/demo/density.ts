// Cosmic web rendered like a real cosmological simulation (Millennium / Illustris style), not as sprites:
// every web point is split on the GPU into K sub-particles (instancing, jitter along its own thickness),
// each adds a little *mass* into a half-float density buffer (R = all matter, G = cluster matter, B = void galaxies),
// then a full-screen pass maps log(density) through a colour ramp (black → indigo → blue → ice → white, clusters gold)
// and adds a soft glow from the buffer's blurred mip levels. Result: smooth, continuous, finely detailed filaments.
import * as THREE from "three";
import type { PtsU } from "./pts";

const vert = /* glsl */ `
uniform float uPx, uK, uFocus, uSlabW, uSlabT, uMaskR, uHoleK, uFade, uNear, uWin, uAper, uSub, uMass;
uniform vec3 uSlabN, uMaskC, uHiC; uniform vec4 uHole, uCls, uInf0, uInf1, uJit; uniform float uInfK, uTearK, uRecede, uRecR, uHiR, uHiK;
attribute float a;
varying vec4 vM;
float hash(float n){ return fract(sin(n) * 43758.5453123); }
void main(){
  vM = vec4(0.0);
  gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 0.0;
  if (float(gl_InstanceID) >= uSub) return;
  float cls = floor(a); float b = fract(a);
  float w = cls < 0.5 ? uCls.x : cls < 1.5 ? uCls.y : cls < 2.5 ? uCls.z : uCls.w;
  if (uSlabT > 0.0) w *= 1.0 - smoothstep(uSlabT*0.55, uSlabT, abs(dot(uSlabN, position) - uSlabW));
  if (uMaskR > 0.0) w *= 1.0 - smoothstep(uMaskR*0.94, uMaskR, length(position - uMaskC));
  if (uHole.w > 0.0) w *= 1.0 - uHoleK * (1.0 - smoothstep(uHole.w*0.85, uHole.w, length(position - uHole.xyz)));
  if (w < 0.002) return;
  // sub-particle: gaussian jitter around the parent point, sized to the structure it belongs to
  float sig = cls < 0.5 ? uJit.x : cls < 1.5 ? uJit.y : cls < 2.5 ? uJit.z : uJit.w;
  float s0 = float(gl_VertexID) * 0.6180339 + float(gl_InstanceID) * 12.9898;
  float u1 = max(hash(s0 + 1.1), 1e-4), u2 = hash(s0 + 2.3), u3 = max(hash(s0 + 3.7), 1e-4), u4 = hash(s0 + 4.9);
  float r1 = sqrt(-2.0 * log(u1)), r2 = sqrt(-2.0 * log(u3));
  vec3 g = vec3(r1 * cos(6.2831853 * u2), r1 * sin(6.2831853 * u2), r2 * cos(6.2831853 * u4));
  vec3 p = position + (float(gl_InstanceID) > 0.5 ? g * sig : vec3(0.0));
  if (uInfK > 0.0) {
    for (int i = 0; i < 2; i++) {
      vec4 c = i == 0 ? uInf0 : uInf1;
      if (c.w <= 0.0) continue;
      vec3 dv = p - c.xyz; float r = length(dv);
      float k = uInfK * c.w * smoothstep(2.2*c.w, 0.6*c.w, r) * smoothstep(0.0, 0.5*c.w, r);
      p += dv / max(r, 1e-3) * k;
    }
  }
  if (uTearK > 0.0 && uInf0.w > 0.0 && uInf1.w > 0.0) {
    vec3 ax = uInf1.xyz - uInf0.xyz; float L = length(ax); ax /= L;
    vec3 mid = (uInf0.xyz + uInf1.xyz) * 0.5;
    float along = dot(position - mid, ax);
    float side = length((position - mid) - ax * along);
    float wall = exp(-along*along / (0.02*L*L)) * smoothstep(0.75*min(uInf0.w, uInf1.w), 0.2*min(uInf0.w, uInf1.w), side);
    w *= 1.0 - uTearK * wall;
  }
  if (uRecede > 0.0) {
    float r = length(p);
    float far = smoothstep(uRecR, uRecR * 1.6, r);
    p *= 1.0 + uRecede * far * 3.0;
    w *= 1.0 - smoothstep(0.2, 1.0, uRecede) * far;
  }
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float d = -mv.z;
  if (d < 1e-4) return;
  float fall = 1.0;
  if (uNear > 0.0) fall *= smoothstep(uNear * 0.3, uNear, d);
  if (uWin > 0.0) { float z = (d - uFocus) / uWin; fall *= exp(-z*z); }
  // depth of field: wider splat, same total mass
  float coc = uAper * abs(1.0 - uFocus / d);
  float s = clamp(sqrt(4.0 + coc*coc), 2.0, 48.0);
  // highlighted region (e.g. Laniakea): its matter lights up gold, the rest dims
  float hi = uHiK > 0.0 ? uHiK * (1.0 - smoothstep(uHiR * 0.82, uHiR, length(position - uHiC))) : 0.0;
  float m = uMass * b * w * fall * uFade * 4.0 / (s*s) / uSub * (1.0 - 0.6 * uHiK + 1.0 * hi);
  if (m < 1e-7) return;
  vM = vec4(m, cls > 1.5 && cls < 2.5 ? m : 0.0, cls > 2.5 ? m : 0.0, m * hi);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = s;
}`;
const frag = /* glsl */ `
varying vec4 vM;
void main(){
  vec2 q = gl_PointCoord * 2.0 - 1.0; float r2 = dot(q, q);
  if (r2 > 1.0) discard;
  float g = exp(-r2 * 3.0) * 1.05;
  gl_FragColor = vM * g;
}`;

const compVert = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
const compFrag = /* glsl */ `
uniform sampler2D dens; uniform float uExp, uFade, uGlow, uWarm;
varying vec2 vUv;
vec3 ramp(float v){
  vec3 c = mix(vec3(0.0), vec3(0.045, 0.04, 0.13), smoothstep(0.02, 0.22, v));
  c = mix(c, vec3(0.16, 0.2, 0.58), smoothstep(0.18, 0.48, v));
  c = mix(c, vec3(0.5, 0.68, 1.0), smoothstep(0.42, 0.72, v));
  c = mix(c, vec3(0.95, 0.97, 1.0), smoothstep(0.68, 0.98, v));
  return c * (1.0 + max(v - 0.95, 0.0) * 2.5);
}
// highlighted structure (e.g. Laniakea): its own warm ramp, so it reads as gold, not grey
vec3 rampGold(float v){
  vec3 c = mix(vec3(0.0), vec3(0.16, 0.08, 0.02), smoothstep(0.02, 0.22, v));
  c = mix(c, vec3(0.75, 0.42, 0.1), smoothstep(0.18, 0.5, v));
  c = mix(c, vec3(1.0, 0.78, 0.4), smoothstep(0.45, 0.75, v));
  c = mix(c, vec3(1.0, 0.96, 0.86), smoothstep(0.72, 0.98, v));
  return c * (1.0 + max(v - 0.95, 0.0) * 2.5);
}
void main(){
  vec4 d0 = texture2D(dens, vUv);
  vec4 d1 = textureLod(dens, vUv, 2.5);
  vec4 d2 = textureLod(dens, vUv, 4.5);
  vec4 d3 = textureLod(dens, vUv, 6.5);
  float m = 0.45 * d0.r + 0.9 * d1.r;   // the slightly blurred level makes filaments continuous
  float v = log(1.0 + m * uExp) / log(1.0 + 260.0);
  vec3 c = ramp(v);
  // clusters glow warm, void galaxies cold
  float warm = clamp(d0.g / max(d0.r, 1e-6), 0.0, 1.0);
  float cold = clamp(d0.b / max(d0.r, 1e-6), 0.0, 1.0);
  c = mix(c, c * vec3(1.3, 0.98, 0.62), warm * smoothstep(0.45, 0.9, v) * uWarm);
  c = mix(c, c * vec3(0.7, 0.9, 1.4), cold);
  // highlighted region: its share of the matter turns gold
  float hiF = clamp((d0.a + 0.5 * d1.a) / max(d0.r + 0.5 * d1.r, 1e-6), 0.0, 1.0);
  c = mix(c, rampGold(v), smoothstep(0.05, 0.6, hiF));
  // soft halo of light around the structure
  float gm = 0.55 * d2.r + 0.45 * d3.r;
  float gv = log(1.0 + gm * uExp * 0.9) / log(1.0 + 260.0);
  c += vec3(0.22, 0.27, 0.62) * smoothstep(0.05, 0.75, gv) * 0.55 * uGlow;
  gl_FragColor = vec4(c * uFade, 1.0);
}`;

export type Density = ReturnType<typeof makeDensity>;

/** `u` is the dots layer's uniform set: the density pass shares all the shaping uniforms (slab, window, dark energy…). */
export function makeDensity(src: THREE.BufferGeometry, u: PtsU, w: number, h: number) {
  const ig = new THREE.InstancedBufferGeometry();
  ig.setAttribute("position", src.getAttribute("position"));
  ig.setAttribute("a", src.getAttribute("a"));
  ig.instanceCount = 12;
  ig.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e9);
  const extra = { uSub: { value: 12 }, uMass: { value: 1 }, uJit: { value: new THREE.Vector4(1.1, 1.5, 1.3, 0.15) }, uHiC: { value: new THREE.Vector3() }, uHiR: { value: 1 }, uHiK: { value: 0 } };
  const mat = new THREE.ShaderMaterial({
    uniforms: { ...u, ...extra },
    vertexShader: vert, fragmentShader: frag,
    transparent: true, depthTest: false, depthWrite: false,
    // pure additive in all four channels (alpha carries the highlighted mass)
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor,
  });
  const pts = new THREE.Points(ig, mat);
  pts.frustumCulled = false;
  const group = new THREE.Group();
  group.add(pts);
  const scene = new THREE.Scene();
  scene.add(group);
  const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, format: THREE.RGBAFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });
  const CU = { dens: { value: rt.texture }, uExp: { value: 1 }, uFade: { value: 1 }, uGlow: { value: 1 }, uWarm: { value: 1 } };
  const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ uniforms: CU, vertexShader: compVert, fragmentShader: compFrag, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  quad.frustumCulled = false;
  quad.renderOrder = -100;
  /** Render the density buffer (call before the main pass). */
  const draw = (gl: THREE.WebGLRenderer, cam: THREE.Camera) => {
    const prev = gl.getRenderTarget();
    gl.setRenderTarget(rt);
    gl.setClearColor(0x000000, 0);
    gl.clear(true, false, false);
    gl.render(scene, cam);
    gl.setRenderTarget(prev);
  };
  const setSub = (k: number) => { const n = Math.max(1, Math.min(12, Math.round(k))); ig.instanceCount = n; extra.uSub.value = n; };
  return { group, pts, quad, rt, CU, extra, draw, setSub, dispose: () => { rt.dispose(); mat.dispose(); ig.dispose(); } };
}
