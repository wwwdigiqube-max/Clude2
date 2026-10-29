// Point-sprite material for everything made of light dots (cosmic web, galaxies, stars).
// Physical sprite size + depth-of-field circle of confusion; energy-conserving blur (a blurred point keeps its total light),
// slab clipping (2D "slice" views), sphere mask, global fade. Additive, no depth.
import * as THREE from "three";

export type PtsU = ReturnType<typeof ptsUniforms>;
export const ptsUniforms = () => ({
  uPx: { value: 1000 }, // pixels per unit at depth 1 (H / 2tan(fov/2))
  uK: { value: 1 }, // render units per local unit (group scale) — sizes below are in local units
  uR: { value: 0.03 }, // sprite physical radius (local units)
  uMinPx: { value: 1.4 },
  uMaxPx: { value: 380 },
  uGain: { value: 1 }, // brightness
  uFall: { value: 0.0 }, // brightness ∝ (dRef/depth)^uFall
  uDRef: { value: 10 },
  uAper: { value: 0 }, // DOF: CoC (px) at infinity
  uFocus: { value: 10 }, // focus depth (render units)
  uSlabN: { value: new THREE.Vector3(0, 1, 0) },
  uSlabW: { value: 0 },
  uSlabT: { value: 0 }, // half thickness (local units); 0 = off
  uMaskC: { value: new THREE.Vector3() },
  uMaskR: { value: 0 }, // sphere mask radius (local units); 0 = off
  uHole: { value: new THREE.Vector4(0, 0, 0, 0) }, // xyz centre, w radius: points inside fade out (local units)
  uHoleK: { value: 0 }, // 0..1 how empty the hole is
  uEvery: { value: 1 }, // draw only every n-th point (haze layers)
  uCls: { value: new THREE.Vector4(1, 1, 1, 1) }, // per-class gain: wall, filament, node, void galaxy
  uTint: { value: new THREE.Color(1, 1, 1) },
  uFade: { value: 1 },
  uSoft: { value: 2.2 }, // gaussian falloff of the sprite (higher = tighter core)
  uPow: { value: 1 }, // brightness = b^uPow (higher = only the brightest dots sparkle)
  uNear: { value: 0 }, // fade points closer than this depth (render units)
  uWin: { value: 0 }, // depth window: weight = exp(-((d - uFocus)/uWin)^2) (render units); 0 = off
  // dark energy: two voids inflate (push matter outward) and the wall between them tears
  uInf0: { value: new THREE.Vector4(0, 0, 0, 0) }, // xyz centre, w radius
  uInf1: { value: new THREE.Vector4(0, 0, 0, 0) },
  uInfK: { value: 0 }, // inflation amount (fraction of radius)
  uTearK: { value: 0 }, // 0..1 wall between the two voids dissolves
  uRecede: { value: 0 }, // far future: everything beyond uRecR moves away (fraction) and fades
  uRecR: { value: 8 },
  // colour per class: wall / filament / node (cluster, old stars) / void galaxy (young, blue)
  uC0: { value: new THREE.Color(0.9, 0.95, 1.0) },
  uC1: { value: new THREE.Color(0.9, 0.95, 1.0) },
  uC2: { value: new THREE.Color(1.0, 0.95, 0.88) },
  uC3: { value: new THREE.Color(0.62, 0.8, 1.0) },
});

const vert = /* glsl */ `
uniform float uPx, uK, uR, uMinPx, uMaxPx, uGain, uFall, uDRef, uAper, uFocus, uSlabW, uSlabT, uMaskR, uHoleK, uEvery, uFade, uPow, uNear, uWin;
uniform vec3 uSlabN, uMaskC, uTint, uC0, uC1, uC2, uC3; uniform vec4 uHole, uCls, uInf0, uInf1; uniform float uInfK, uTearK, uRecede, uRecR;
attribute float a; // integer part = class (0 wall, 1 filament, 2 node, 3 void galaxy), fraction = brightness
varying vec3 vC; varying float vA;
float h11(float n){ return fract(sin(n*12.9898)*43758.5453); }
void main(){
  vA = 0.0; vC = vec3(0.0);
  gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 0.0;
  if (uEvery > 1.5 && mod(float(gl_VertexID), uEvery) > 0.5) return;
  float cls = floor(a); float b = pow(fract(a), uPow);
  float w = cls < 0.5 ? uCls.x : cls < 1.5 ? uCls.y : cls < 2.5 ? uCls.z : uCls.w;
  if (uSlabT > 0.0) w *= 1.0 - smoothstep(uSlabT*0.55, uSlabT, abs(dot(uSlabN, position) - uSlabW));
  if (uMaskR > 0.0) w *= 1.0 - smoothstep(uMaskR*0.94, uMaskR, length(position - uMaskC));
  if (uHole.w > 0.0) w *= 1.0 - uHoleK * (1.0 - smoothstep(uHole.w*0.85, uHole.w, length(position - uHole.xyz)));
  if (w < 0.002) return;
  vec3 p = position;
  if (uInfK > 0.0) {
    for (int i = 0; i < 2; i++) {
      vec4 c = i == 0 ? uInf0 : uInf1;
      if (c.w <= 0.0) continue;
      vec3 dv = p - c.xyz; float r = length(dv);
      // push outward, strongest at the rim, fading two radii out
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
  float core = max(uMinPx, uR * uK * uPx / d);
  float coc = uAper * abs(1.0 - uFocus / d);
  float s = min(uMaxPx, sqrt(core*core + coc*coc));
  float e = core*core / (s*s);
  float fall = uFall > 0.0 ? pow(clamp(uDRef / d, 0.02, 3.0), uFall) : 1.0;
  if (uNear > 0.0) fall *= smoothstep(uNear * 0.3, uNear, d);
  if (uWin > 0.0) { float z = (d - uFocus) / uWin; fall *= exp(-z*z); }
  vA = uGain * b * w * e * fall * uFade;
  if (vA < 0.0015) { vA = 0.0; return; }
  vC = cls > 2.5 ? uC3 : cls > 1.5 ? uC2 : cls > 0.5 ? uC1 : uC0;
  vC = mix(vC, vec3(1.0, 0.97, 0.92), smoothstep(0.55, 0.95, b) * 0.6); // the brightest dots burn white
  vC *= uTint;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = s;
}`;
const frag = /* glsl */ `
uniform float uSoft; varying vec3 vC; varying float vA;
void main(){
  if (vA <= 0.0) discard;
  vec2 q = gl_PointCoord*2.0 - 1.0; float r2 = dot(q, q);
  if (r2 > 1.0) discard;
  float g = exp(-r2 * uSoft * 2.0) - exp(-uSoft * 2.0);
  gl_FragColor = vec4(vC * vA * g, 1.0);
}`;

export function ptsMaterial(u = ptsUniforms()) {
  const m = new THREE.ShaderMaterial({ uniforms: u, vertexShader: vert, fragmentShader: frag, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending });
  return m as THREE.ShaderMaterial & { uniforms: PtsU };
}

/** Points object from packed [x,y,z,a] floats. */
export function ptsFromPacked(f: Float32Array, u = ptsUniforms()) {
  const n = f.length / 4;
  const pos = new Float32Array(n * 3), a = new Float32Array(n);
  for (let i = 0; i < n; i++) { pos[i * 3] = f[i * 4]; pos[i * 3 + 1] = f[i * 4 + 1]; pos[i * 3 + 2] = f[i * 4 + 2]; a[i] = f[i * 4 + 3]; }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("a", new THREE.BufferAttribute(a, 1));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e9);
  const p = new THREE.Points(g, ptsMaterial(u));
  p.frustumCulled = false;
  return p as THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial & { uniforms: PtsU }>;
}

/** Same geometry, another look (e.g. a haze layer drawn from every n-th point with big soft sprites). */
export function ptsShare(src: THREE.Points, u = ptsUniforms()) {
  const p = new THREE.Points(src.geometry, ptsMaterial(u));
  p.frustumCulled = false;
  return p as THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial & { uniforms: PtsU }>;
}
