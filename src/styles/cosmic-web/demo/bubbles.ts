// Void outlines as real 3D bubbles (not flat circles): a glass-like sphere with a bright fresnel rim, faint latitude /
// longitude lines that follow the perspective, the far hemisphere dimmer (depth), a soft iridescent film,
// and a "drawing" reveal that sweeps around the sphere. Positions in Mly (layer unit 1).
import * as THREE from "three";

const vert = /* glsl */ `varying vec3 vN; varying vec3 vV; varying vec3 vP;
void main(){ vP = position; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
const frag = /* glsl */ `uniform float uK, uSeed, uSpin; uniform vec3 uCol; varying vec3 vN; varying vec3 vV; varying vec3 vP;
// hairlines of constant on-screen width (derivatives), whatever the bubble size
float line(float x){ float f = abs(fract(x - 0.5) - 0.5); float w = fwidth(x); return 1.0 - smoothstep(0.4 * w, 1.4 * w, f); }
void main(){
  vec3 n = normalize(vN);
  float fr = 1.0 - abs(dot(n, normalize(vV)));
  float lat = asin(clamp(vP.y, -1.0, 1.0));
  float lon = atan(vP.z, vP.x) + uSpin;
  // reveal: the outline is drawn around the sphere
  float u = fract((atan(vP.z, vP.x) + 3.14159265) / 6.2831853 + uSeed);
  float reveal = smoothstep(uK * 1.08 - 0.08, uK * 1.08, u);
  float vis = (1.0 - reveal) * smoothstep(0.0, 0.15, uK);
  // only a soft luminous rim marks the edge of the darkness — no globe-like grid
  float rim = pow(fr, 7.0) * 0.45 + pow(fr, 26.0) * 0.9;
  float lift = 0.0 * line(lon) * lat;
  float back = gl_FrontFacing ? 1.0 : 0.3;
  vec3 c = uCol * (rim + lift) * back * vis;
  gl_FragColor = vec4(c, 1.0);
}`;

export type Bubbles = ReturnType<typeof makeBubbles>;
export function makeBubbles(n = 14) {
  const group = new THREE.Group();
  const geo = new THREE.SphereGeometry(1, 96, 48);
  const items = Array.from({ length: n }, (_, i) => {
    const U = { uK: { value: 0 }, uSeed: { value: (i * 0.618) % 1 }, uSpin: { value: 0 }, uCol: { value: new THREE.Color(0.85, 0.93, 1.0) } };
    const mesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: U, vertexShader: vert, fragmentShader: frag, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    mesh.frustumCulled = false;
    mesh.renderOrder = 5;
    mesh.visible = false;
    group.add(mesh);
    return { mesh, U };
  });
  /** Show the given bubbles this frame (centre Mly, radius Mly, appear 0..1, teal accent). */
  const set = (list: { c: [number, number, number]; r: number; k: number; teal?: boolean }[], t: number) => {
    items.forEach((it, i) => {
      const b = list[i];
      it.mesh.visible = !!b && b.k > 0.001;
      if (!b) return;
      it.mesh.position.set(b.c[0], b.c[1], b.c[2]);
      it.mesh.scale.setScalar(b.r);
      it.U.uK.value = Math.min(1, b.k);
      it.U.uSpin.value = t * 0.02 + i;
      if (b.teal) it.U.uCol.value.setRGB(0.37, 0.95, 0.82); else it.U.uCol.value.setRGB(0.85, 0.93, 1.0);
    });
    group.visible = list.some((b) => b.k > 0.001);
  };
  return { group, set };
}
