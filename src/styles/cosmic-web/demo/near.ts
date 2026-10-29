// Near-home layers: Earth (photo textures), the night sky (stars + Milky Way band), the solar system, nearby stars.
import * as THREE from "three";
import { ring } from "./galaxy";
import { ptsFromPacked, type PtsU } from "./pts";

export const MLY_PER_KM = 1 / 9.4607e18; // 1 Mly = 9.4607e18 km
export const EARTH_R = 6371 * MLY_PER_KM;
export const AU = 1.496e8 * MLY_PER_KM;
export const LY = 1e-6;

const mul32 = (s: number) => () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

// ── Earth: unit sphere (local unit = Earth radius). Day/night textures, clouds, thin blue rim, soft terminator.
export function makeEarth(tex: { day: THREE.Texture; night: THREE.Texture; clouds: THREE.Texture }) {
  for (const t of Object.values(tex)) { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; }
  const U = { day: { value: tex.day }, night: { value: tex.night }, clouds: { value: tex.clouds }, sun: { value: new THREE.Vector3(1, 0.2, 0.4).normalize() }, fade: { value: 1 }, spin: { value: 0 } };
  const mat = new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vV; varying vec2 vUv; uniform float spin;
      void main(){ vUv = uv + vec2(spin, 0.0); vN = normalize(mat3(modelMatrix) * normal); vec4 wp = modelMatrix * vec4(position, 1.0); vV = normalize(cameraPosition - wp.xyz); gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: /* glsl */ `uniform sampler2D day, night, clouds; uniform vec3 sun; uniform float fade; varying vec3 vN; varying vec3 vV; varying vec2 vUv;
      void main(){
        float l = dot(normalize(vN), sun);
        float dayK = smoothstep(-0.12, 0.25, l);
        vec3 d = texture2D(day, vUv).rgb; vec3 n = texture2D(night, vUv).rgb; float c = texture2D(clouds, vUv).r;
        vec3 lit = mix(d, vec3(1.0), c * 0.85) * (0.08 + 1.05 * max(l, 0.0));
        vec3 col = mix(n * vec3(1.0, 0.8, 0.55) * 1.6 * (1.0 - c), lit, dayK);
        float rim = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), 3.0);
        col += vec3(0.35, 0.6, 1.0) * rim * (0.25 + 0.9 * smoothstep(-0.3, 0.4, l));
        gl_FragColor = vec4(col * fade, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 64), mat);
  // atmosphere halo (back faces, additive)
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(1.06, 96, 48),
    new THREE.ShaderMaterial({
      uniforms: { sun: U.sun, fade: U.fade },
      vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(mat3(modelMatrix) * normal); vec4 wp = modelMatrix * vec4(position, 1.0); vV = normalize(cameraPosition - wp.xyz); gl_Position = projectionMatrix * viewMatrix * wp; }`,
      fragmentShader: /* glsl */ `uniform vec3 sun; uniform float fade; varying vec3 vN; varying vec3 vV;
        void main(){ float f = pow(max(0.0, 1.0 - abs(dot(normalize(vN), normalize(vV)))), 2.0); float lit = smoothstep(-0.4, 0.5, dot(normalize(vN), sun));
          gl_FragColor = vec4(vec3(0.3, 0.55, 1.0) * f * (0.15 + 0.85 * lit) * 1.4 * fade, 1.0); }`,
      side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    }),
  );
  const group = new THREE.Group();
  group.add(mesh, halo);
  return { group, U };
}

// ── Night sky: stars (Points, concentrated toward the galactic plane) + Milky Way band (shader sphere).
// Lives at the render origin (around the camera), so it only rotates with the view.
export function makeSky(pano: THREE.Texture | null) {
  const rnd = mul32(42);
  const n = 16000, f = new Float32Array(n * 4);
  const plane = new THREE.Vector3(0.25, 0.94, -0.22).normalize(); // galactic pole in sky coordinates
  for (let i = 0; i < n; i++) {
    let v = new THREE.Vector3(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1);
    while (v.lengthSq() > 1 || v.lengthSq() < 1e-4) v.set(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1);
    v.normalize();
    if (rnd() < 0.45) { const h = v.dot(plane); v.addScaledVector(plane, -h * 0.85).normalize(); } // crowd the band
    const m = Math.pow(rnd(), 5.5); // few bright, many faint
    f.set([v.x * 900, v.y * 900, v.z * 900, (rnd() < 0.08 ? 3 : rnd() < 0.2 ? 2 : 0) + Math.min(0.999, 0.05 + m)], i * 4);
  }
  const stars = ptsFromPacked(f);
  const su = stars.material.uniforms;
  su.uR.value = 0; su.uMinPx.value = 2.0; su.uGain.value = 3.5; su.uSoft.value = 3.0; su.uPow.value = 1.2; // sparkle on top of the photo
  stars.renderOrder = -50;
  // the band is a real photograph: ESO's 360° Milky Way panorama (ESO/S. Brunier, CC BY 4.0), mapped in galactic
  // coordinates (centre of the galaxy at the middle of the image), so the core, dust lanes and Magellanic Clouds are real
  const core = new THREE.Vector3(0.85, 0.05, 0.52).normalize();
  const gx = core.clone().addScaledVector(plane, -core.dot(plane)).normalize();
  const gy = new THREE.Vector3().crossVectors(plane, gx);
  if (pano) { pano.colorSpace = THREE.SRGBColorSpace; pano.anisotropy = 8; pano.generateMipmaps = true; pano.minFilter = THREE.LinearMipmapLinearFilter; }
  const bandU = { pole: { value: plane }, gx: { value: gx }, gy: { value: gy }, fade: { value: 1 }, gain: { value: 1 }, pano: { value: pano }, tint: { value: new THREE.Color(1, 1, 1) } };
  const band = new THREE.Mesh(
    new THREE.SphereGeometry(950, 128, 64),
    new THREE.ShaderMaterial({
      uniforms: bandU,
      side: THREE.BackSide, depthTest: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending,
      vertexShader: "varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: /* glsl */ `uniform vec3 pole, gx, gy, tint; uniform float fade, gain; uniform sampler2D pano; varying vec3 vD;
        void main(){ vec3 d = normalize(vD);
          float l = atan(dot(d, gy), dot(d, gx));
          float b = asin(clamp(dot(d, pole), -1.0, 1.0));
          vec2 uv = vec2(0.5 - l / 6.2831853, 0.5 + b / 3.1415927);
          vec3 c = texture2D(pano, uv).rgb;
          c = max(c - 0.015, 0.0) * 1.15;                          // keep the sky background truly black
          gl_FragColor = vec4(c * tint * gain * fade, 1.0);
          #include <colorspace_fragment>
        }`,
    }),
  );  band.renderOrder = -60;
  const group = new THREE.Group();
  group.add(band, stars);
  return { group, su, bandU, stars, band };
}

// ── Solar system (local unit = AU): orbit rings, planets, the Sun as a glow.
export function makeSolar() {
  const group = new THREE.Group();
  const R = [0.39, 0.72, 1, 1.52, 5.2, 9.58, 19.2, 30.1];
  const rings = R.map((r, i) => { const l = ring(r, i === 2 ? 0x8ff7e0 : 0xffffff, i === 2 ? 0.55 : 0.22); group.add(l); return l; });
  const f = new Float32Array((R.length + 1) * 4);
  f.set([0, 0, 0, 2.999], 0); // the Sun
  R.forEach((r, i) => { const a = 1.3 + i * 2.1; f.set([Math.cos(a) * r, 0, Math.sin(a) * r, (i === 2 ? 3 : 0) + 0.9], (i + 1) * 4); });
  const bodies = ptsFromPacked(f);
  const bu = bodies.material.uniforms;
  bu.uR.value = 0; bu.uMinPx.value = 6; bu.uGain.value = 2.2; bu.uSoft.value = 2.6;
  const sunGlow = ptsFromPacked(new Float32Array([0, 0, 0, 2.999]));
  const gu = sunGlow.material.uniforms;
  gu.uR.value = 0; gu.uMinPx.value = 110; gu.uGain.value = 0.55; gu.uSoft.value = 3.2;
  group.add(sunGlow, bodies);
  const angle = (i: number) => 1.3 + i * 2.1;
  /** planet position (AU) — Earth = index 2 */
  const planet = (i: number): [number, number, number] => [Math.cos(angle(i)) * R[i], 0, Math.sin(angle(i)) * R[i]];
  const setFade = (k: number) => { rings.forEach((l) => ((l.material as THREE.LineBasicMaterial).opacity = (l === rings[2] ? 0.55 : 0.22) * k)); bu.uFade.value = k; gu.uFade.value = k; };
  return { group, rings, bodies, sunGlow, bu, gu, planet, setFade, uniforms: [bu, gu] as PtsU[] };
}

// ── Nearby stars around the Sun (local unit = Mly; ~1000 ly ball), for the zoom between the solar system and the galaxy.
export function makeNeighbours() {
  const rnd = mul32(9);
  const n = 9000, f = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const r = 0.0012 * Math.cbrt(rnd());
    const th = rnd() * Math.PI * 2, ph = Math.acos(2 * rnd() - 1);
    f.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.45, r * Math.sin(ph) * Math.sin(th), (rnd() < 0.1 ? 3 : rnd() < 0.3 ? 2 : 0) + Math.min(0.999, 0.05 + Math.pow(rnd(), 4))], i * 4);
  }
  const p = ptsFromPacked(f);
  const u = p.material.uniforms;
  u.uR.value = 0; u.uMinPx.value = 2.2; u.uGain.value = 14; u.uSoft.value = 2.8; u.uPow.value = 0.7;
  return { obj: p, u };
}
