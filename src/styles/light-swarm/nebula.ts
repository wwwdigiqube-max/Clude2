// Ray-marched filament nebula (the "cosmic web"), rendered at half resolution
// into a texture that becomes the scene background. Alvana palette:
// sapphire body, ice edges, neon-green energy where the intelligence flows.
import * as THREE from "three";
import { NOISE } from "./glsl";

export function makeNebula(w: number, h: number) {
  const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType });
  rt.texture.colorSpace = THREE.LinearSRGBColorSpace;
  const U = {
    invProj: { value: new THREE.Matrix4() },
    camWorld: { value: new THREE.Matrix4() },
    camPos: { value: new THREE.Vector3() },
    time: { value: 0 },
    bright: { value: 1 },
    energy: { value: 0 }, // neon green share
    eC: { value: new THREE.Vector3() }, // energy / eye centre
    radial: { value: 0 }, // filaments radiate around eC (the eye)
    pulse: { value: 0 },
    red: { value: 0 },
    seed: { value: 0 },
    scale: { value: 0.022 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: U,
    depthTest: false,
    depthWrite: false,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: /* glsl */ `
uniform mat4 invProj, camWorld; uniform vec3 camPos, eC;
uniform float time, bright, energy, radial, pulse, red, seed, scale;
varying vec2 vUv;
${NOISE}
float field(vec3 p, out float glow){
  vec3 q = p * scale;
  vec3 wv = vec3(fbm3(q*0.55 + vec3(0.0, time*0.015, seed)), fbm3(q*0.55 + vec3(5.2, 1.3, seed)), fbm3(q*0.55 + vec3(9.1, 4.7, -time*0.012)));
  q += (wv - 0.5) * 2.4;
  // radial organisation around the eye
  vec3 rp = p - eC;
  float rr = length(rp.xz);
  float ang = atan(rp.z, rp.x);
  vec3 qr = vec3(ang * 2.2, rr * scale * 1.6 - time*0.05, rp.y * scale * 3.0);
  q = mix(q, qr + (wv - 0.5) * 1.2, radial * smoothstep(400.0, 30.0, rr));
  float n = fbm3(q);
  float m = (n - 0.5) * 5.5;
  float ridge = clamp(1.0 - abs(m), 0.0, 1.0);
  float mask = smoothstep(0.47, 0.68, fbm3(p * scale * 0.22 + vec3(13.0, 7.0, seed)));
  float fil = pow(ridge, 13.0) * mask;
  float sheet = pow(ridge, 3.0) * 0.006 * mask;
  glow = pow(ridge, 30.0) * mask;
  return fil + sheet;
}
float h12(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  vec4 v = invProj * vec4(vUv * 2.0 - 1.0, 1.0, 1.0);
  v /= v.w;
  vec3 dir = normalize((camWorld * vec4(v.xyz, 0.0)).xyz);
  vec3 sapph = vec3(0.020, 0.110, 0.180);
  vec3 ice = vec3(0.55, 0.78, 1.0);
  vec3 neon = vec3(0.16, 0.95, 0.60);
  vec3 redc = vec3(0.95, 0.18, 0.2);
  float t = 3.0 + h12(vUv * 913.0 + seed) * 4.0;
  vec3 acc = vec3(0.0);
  float tr = 1.0;
  for (int i = 0; i < 52; i++){
    vec3 p = camPos + dir * t;
    float gl;
    float d = field(p, gl);
    float de = length(p - eC);
    float en = energy * exp(-de * 0.006) + pulse * exp(-de * 0.012);
    vec3 col = sapph * 1.8 + ice * gl * 3.5;
    col = mix(col, neon * (0.35 + 2.0 * gl), clamp(en, 0.0, 1.0) * 0.7);
    col += redc * red * gl * 1.5;
    float stepL = 2.0 + t * 0.06;
    acc += tr * col * d * stepL * 0.0075;
    tr *= exp(-d * stepL * 0.012);
    t += stepL;
    if (t > 700.0 || tr < 0.02) break;
  }
  gl_FragColor = vec4(acc * bright, 1.0);
}`,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  quad.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(quad);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const render = (gl: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) => {
    U.invProj.value.copy(camera.projectionMatrixInverse);
    U.camWorld.value.copy(camera.matrixWorld);
    U.camPos.value.setFromMatrixPosition(camera.matrixWorld);
    const prev = gl.getRenderTarget();
    gl.setRenderTarget(rt);
    gl.render(scene, cam);
    gl.setRenderTarget(prev);
  };
  return { rt, U, render };
}
