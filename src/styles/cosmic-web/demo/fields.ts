// 2D layers for "why bubbles": the Zeldovich growth field (particles), the oldest-light map (CMB, with the cold spot),
// plus small helper layers: Boötes "should be thousands" fill and the lonely void galaxies.
import * as THREE from "three";
import { BOO } from "./director";
import { galaxyPoints, makeGalaxy } from "./galaxy";
import { ptsFromPacked, ptsShare, ptsUniforms } from "./pts";
import { voidGalaxyCenters } from "./vgalpos";

// ── Zeldovich field: pos = q + D·Ψ(q). Field is 100 units wide in the xy plane (local units).
export function makeZel(data: Float32Array) {
  const n = data.length / 5;
  const q = new Float32Array(n * 3), psi = new Float32Array(n * 2), dl = new Float32Array(n);
  for (let i = 0; i < n; i++) { q[i * 3] = data[i * 5]; q[i * 3 + 1] = data[i * 5 + 1]; psi[i * 2] = data[i * 5 + 2]; psi[i * 2 + 1] = data[i * 5 + 3]; dl[i] = data[i * 5 + 4]; }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(q, 3));
  g.setAttribute("psi", new THREE.BufferAttribute(psi, 2));
  g.setAttribute("dl", new THREE.BufferAttribute(dl, 1));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e9);
  const U = { uD: { value: 0 }, uRip: { value: 0 }, uPx: { value: 1000 }, uK: { value: 1 }, uGain: { value: 1 }, uFade: { value: 1 }, uSize: { value: 0.32 }, uHaze: { value: 0 } };
  const mk = (haze: boolean) => new THREE.ShaderMaterial({
    uniforms: U,
    transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `attribute vec2 psi; attribute float dl; uniform float uD, uRip, uPx, uK, uGain, uFade, uSize, uHaze; varying float vA; varying vec3 vC;
      void main(){
        vA = 0.0;
        if (${haze ? "mod(float(gl_VertexID), 5.0) > 0.5" : "false"}) { gl_Position = vec4(2.0); gl_PointSize = 0.0; return; }
        vec3 p = vec3(position.xy + uD * psi, 0.0);
        float edge = 1.0 - smoothstep(42.0, 49.0, max(abs(position.x), abs(position.y)));
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float d = -mv.z;
        float core = max(${haze ? "3.0" : "1.6"}, ${haze ? "uSize * 6.0" : "uSize * 0.35"} * uK * uPx / d);
        gl_PointSize = min(core, 200.0);
        gl_Position = projectionMatrix * mv;
        float rip = 1.0 + uRip * dl * 1.3;
        vA = uGain * uFade * rip * edge * ${haze ? "0.05 * uHaze" : "0.42"} / (1.0 + 0.7 * uD);
        vC = mix(vec3(0.55, 0.66, 1.0), vec3(0.82, 0.88, 1.0), clamp(uD - 0.6, 0.0, 1.0)); // same blue as the simulation render
      }`,
    fragmentShader: /* glsl */ `varying float vA; varying vec3 vC; void main(){ if (vA <= 0.0) discard; vec2 q = gl_PointCoord*2.0-1.0; float r2 = dot(q,q); if (r2 > 1.0) discard; gl_FragColor = vec4(vC * vA * exp(-r2 * ${haze ? "2.5" : "4.0"}), 1.0); }`,
  });
  const pts = new THREE.Points(g, mk(false));
  const haze = new THREE.Points(g, mk(true));
  pts.frustumCulled = haze.frustumCulled = false;
  const group = new THREE.Group();
  group.add(haze, pts);
  return { group, U };
}

// ── the oldest light (CMB) as a Mollweide-style oval, 100 × 50 local units, with the cold spot.
export function makeCmb() {
  const U = { uFade: { value: 1 }, uSpot: { value: 0 }, uTime: { value: 0 } };
  const mat = new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthTest: false, depthWrite: false,
    vertexShader: "varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: /* glsl */ `uniform float uFade, uSpot; varying vec2 vP;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 6; i++){ s += a * n2(p); p = p * 2.07 + 13.1; a *= 0.5; } return s; }
      void main(){
        vec2 e = vP / vec2(50.0, 25.0);
        float r = dot(e, e);
        if (r > 1.0) discard;
        float v = fbm(vP * 0.16) * 0.75 + fbm(vP * 0.6 + 7.0) * 0.25;
        vec2 sp = vec2(22.0, -9.0);
        float ds = length(vP - sp);
        v -= 0.22 * exp(-ds*ds / 28.0);
        v = (v - 0.47) * 2.6;
        vec3 cold = vec3(0.04, 0.1, 0.38), mid = vec3(0.3, 0.4, 0.52), hot = vec3(0.98, 0.55, 0.24);
        vec3 c = v < 0.0 ? mix(mid, cold, clamp(-v * 1.2, 0.0, 1.0)) : mix(mid, hot, clamp(v * 1.2, 0.0, 1.0));
        c *= 0.85;
        c += vec3(0.8) * exp(-pow((sqrt(r) - 0.995) / 0.004, 2.0)) * 0.6;
        float edge = smoothstep(1.0, 0.985, r);
        float ring = uSpot * exp(-pow((ds - 7.5) / 0.35, 2.0)) * 1.6;
        c += vec3(0.6, 0.95, 1.0) * ring;
        c = mix(c, c * 0.35, uSpot * (1.0 - exp(-max(ds - 7.5, 0.0) * 0.08)) * 0.5);
        gl_FragColor = vec4(c * edge * uFade, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 50, 1, 1), mat);
  mesh.position.z = -0.5;
  return { mesh, U, spot: new THREE.Vector3(22, -9, 0) };
}

// ── Boötes: thousands of galaxies "that should be there" (class 0), ~60 that really are (class 3, blue)
export function makeFill() {
  let s = 77;
  const rnd = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const n = 2600, f = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    let x = 0, y = 0, z = 0;
    do { x = rnd() * 2 - 1; y = rnd() * 2 - 1; z = rnd() * 2 - 1; } while (x * x + y * y + z * z > 1);
    const r = BOO.r * 0.9;
    f.set([BOO.c[0] + x * r, BOO.c[1] + y * r, BOO.c[2] + z * r, (i < 60 ? 3 : 0) + 0.35 + 0.5 * rnd()], i * 4);
  }
  const p = ptsFromPacked(f);
  const u = p.material.uniforms;
  u.uR.value = 0.9; u.uMinPx.value = 3.4; u.uGain.value = 3.2; u.uSoft.value = 2.4;
  return { obj: p, u };
}

// ── a scatter of small blue void galaxies inside one void (global coordinates, Mly)
export function makeVoidGals(c: [number, number, number], r: number) {
  const gals = voidGalaxyCenters(c, r);
  const G = gals.length, per = 900, f = new Float32Array(G * per * 4);
  for (let j = 0; j < G; j++) {
    const { p: [ox, oy, oz], R, spiral } = gals[j];
    const p = galaxyPoints({ R, n: per, kind: spiral ? "spiral" : "dwarf", arms: 2, pitch: 0.4, bulge: 0.05, blue: 0.8, seed: 500 + j });
    for (let i = 0; i < per; i++) { const o = (j * per + i) * 4; f[o] = ox + p[i * 4]; f[o + 1] = oy + p[i * 4 + 1]; f[o + 2] = oz + p[i * 4 + 2]; f[o + 3] = 3 + (p[i * 4 + 3] % 1); }
  }
  const stars = ptsFromPacked(f);
  const u = stars.material.uniforms;
  u.uR.value = 0.004; u.uMinPx.value = 1.4; u.uGain.value = 1.3; u.uSoft.value = 2.4;
  const glow = ptsShare(stars, ptsUniforms());
  const g = glow.material.uniforms;
  g.uEvery.value = 9; g.uR.value = 0.05; g.uMinPx.value = 4; g.uGain.value = 0.9; g.uSoft.value = 1.3; g.uMaxPx.value = 120;
  g.uTint.value = new THREE.Color(0.55, 0.75, 1.0);
  const group = new THREE.Group();
  group.add(glow, stars);
  return { group, u, g };
}

// ── the lonely galaxies of the void-galaxy section (local unit Mly, centred at the origin)
export function makeSolo() {
  const blue = makeGalaxy({ R: 0.012, n: 50000, arms: 3, pitch: 0.42, bulge: 0.05, blue: 0.75, thick: 0.05, seed: 21 });
  blue.su.uTint.value = new THREE.Color(0.75, 0.88, 1.0);
  blue.gu.uTint.value = new THREE.Color(0.6, 0.8, 1.0);
  blue.group.rotation.set(0.9, 0.3, 0.2);
  if (blue.disk) { blue.disk.U.uOld.value = 0.35; blue.disk.U.uBlue.value = 1.0; } // young, gas-rich: little old yellow light
  const spiral = makeGalaxy({ R: 0.04, n: 170000, arms: 2, pitch: 0.2, bulge: 0.17, blue: 0.32, thick: 0.02, seed: 14 });
  spiral.group.rotation.set(0.55, 0.2, -0.25);
  void galaxyPoints;
  return { blue, spiral };
}
