// Procedural galaxies made of light dots (local units = Mly). Spiral (arms, bar, bulge), elliptical, dwarf.
// Classes in the packed attribute: 0 old disk stars (white), 2 bulge (warm), 3 young arm stars (blue).
import * as THREE from "three";
import { ptsFromPacked, ptsShare, ptsUniforms, type PtsU } from "./pts";

export type GalaxyOpts = {
  n?: number;
  R: number; // radius (Mly)
  kind?: "spiral" | "elliptical" | "dwarf";
  arms?: number;
  pitch?: number; // radians
  bar?: number; // bar length / R
  bulge?: number; // share of stars in the bulge
  blue?: number; // share of young blue stars in the arms
  thick?: number; // disk thickness / R
  axes?: [number, number, number]; // elliptical axis ratios
  seed?: number;
};

const mul32 = (s: number) => () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

export function galaxyPoints(o: GalaxyOpts): Float32Array {
  const rnd = mul32(o.seed ?? 7);
  const g = () => { let u = 0; while (u === 0) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); };
  const n = o.n ?? 60000, R = o.R, out = new Float32Array(n * 4);
  const kind = o.kind ?? "spiral";
  for (let i = 0; i < n; i++) {
    let x = 0, y = 0, z = 0, cls = 0, b = 0.3;
    if (kind === "elliptical") {
      const ax = o.axes ?? [1, 0.75, 0.6];
      // de Vaucouleurs-like: dense core, wide envelope
      const r = R * Math.pow(rnd(), 2.6) * 1.1;
      const th = rnd() * Math.PI * 2, ph = Math.acos(2 * rnd() - 1);
      x = r * Math.sin(ph) * Math.cos(th) * ax[0]; y = r * Math.cos(ph) * ax[1]; z = r * Math.sin(ph) * Math.sin(th) * ax[2];
      cls = rnd() < 0.85 ? 2 : 0; b = 0.15 + 0.5 * rnd();
    } else if (kind === "dwarf") {
      const r = R * Math.abs(g()) * 0.45;
      const th = rnd() * Math.PI * 2;
      x = r * Math.cos(th) * (1 + 0.4 * g() * 0.3); z = r * Math.sin(th) * 0.8; y = g() * R * 0.18;
      cls = rnd() < (o.blue ?? 0.35) ? 3 : 0; b = 0.15 + 0.6 * rnd() ** 2;
    } else {
      const arms = o.arms ?? 2, pitch = o.pitch ?? 0.24, bar = o.bar ?? 0, bulgeShare = o.bulge ?? 0.18;
      const u = rnd();
      if (u < bulgeShare) {
        const r = R * 0.11 * Math.abs(g());
        const th = rnd() * Math.PI * 2, ph = Math.acos(2 * rnd() - 1);
        x = r * Math.sin(ph) * Math.cos(th); y = r * Math.cos(ph) * 0.55; z = r * Math.sin(ph) * Math.sin(th);
        if (bar > 0 && rnd() < 0.5) { x = (rnd() * 2 - 1) * R * bar; z = g() * R * 0.035; y = g() * R * 0.02; }
        cls = 2; b = 0.25 + 0.6 * rnd();
      } else {
        const r = Math.min(1, -Math.log(1 - rnd() * 0.985) * 0.27) * R + R * 0.04;
        const inArm = rnd() < 0.72;
        const r0 = R * (0.08 + bar * 0.9);
        let th: number;
        if (inArm) {
          const k = Math.floor(rnd() * arms);
          const spread = 0.28 + 0.25 * (1 - r / R);
          th = Math.log(Math.max(r, r0) / r0) / Math.tan(pitch) + (k * 2 * Math.PI) / arms + g() * spread * 0.55;
          cls = rnd() < (o.blue ?? 0.28) && r > R * 0.2 ? 3 : 0;
        } else { th = rnd() * Math.PI * 2; cls = 0; }
        x = r * Math.cos(th); z = r * Math.sin(th); y = g() * R * (o.thick ?? 0.02) * (1 - 0.6 * r / R);
        b = (inArm ? 0.3 : 0.15) + 0.55 * rnd() ** 2;
      }
    }
    out[i * 4] = x; out[i * 4 + 1] = y; out[i * 4 + 2] = z; out[i * 4 + 3] = cls + Math.min(0.999, b);
  }
  return out;
}

// ── photographic disk: the diffuse light of billions of unresolved stars, with spiral arms that break into clumps,
// a warm bulge (and bar), pink star-forming knots and dark dust lanes on the inner edge of each arm.
// Premultiplied output: rgb = light, alpha = dust → the dust darkens whatever lies behind the disk.
export function galaxyDisk(o: GalaxyOpts) {
  const arms = o.arms ?? 2, pitch = o.pitch ?? 0.24, bar = o.bar ?? 0;
  const U = {
    uFade: { value: 1 }, uGain: { value: 2.4 }, uSeed: { value: (o.seed ?? 1) * 7.31 }, uArms: { value: arms }, uTanP: { value: Math.tan(pitch) },
    uR0: { value: 0.08 + bar * 0.9 }, uBar: { value: bar }, uBlue: { value: o.blue ?? 0.28 }, uBulge: { value: o.bulge ?? 0.18 }, uDust: { value: 1 }, uOld: { value: 1 },
  };
  const geo = new THREE.PlaneGeometry(2.3, 2.3, 1, 1);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.ShaderMaterial({
    uniforms: U,
    transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendEquation: THREE.AddEquation,
    vertexShader: "varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: /* glsl */ `uniform float uFade, uGain, uSeed, uArms, uTanP, uR0, uBar, uBlue, uBulge, uDust, uOld; varying vec2 vP;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed) * 43758.5453); }
      float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 6; i++){ s += a * n2(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 3.1; a *= 0.5; } return s; }
      void main(){
        float r = length(vP);
        if (r > 1.12) discard;
        float th = atan(vP.y, vP.x);
        float ph = th - log(max(r, uR0) / uR0) / uTanP;               // same log-spiral as the star points
        float arm = pow(0.5 + 0.5 * cos(uArms * ph + 0.35 * (fbm(vP * 5.0) - 0.5)), 5.0);
        float armIn = pow(0.5 + 0.5 * cos(uArms * (ph + 0.36) + 0.5 * (fbm(vP * 7.0 + 4.0) - 0.5)), 14.0);  // thin lane on the inner (trailing) edge
        float disk = exp(-r / 0.26) * smoothstep(1.1, 0.75, r);
        float clump = fbm(vP * 9.0) ;
        float fine = fbm(vP * 26.0 + 7.0);
        float bulge = exp(-pow(r / (0.07 + 0.25 * uBulge * 0.5), 1.4)) * (0.6 + 2.6 * uBulge);
        float barL = uBar > 0.0 ? exp(-pow(vP.y / 0.04, 2.0) - pow(vP.x / (uBar * 0.9), 4.0)) * 0.45 : 0.0;
        float armK = smoothstep(0.06, 0.28, r);
        float knots = smoothstep(0.45, 0.85, clump) * 1.4 + 0.25;  // arms break into star-cloud knots
        float young = arm * armK * knots * disk * (0.75 + 0.5 * fine);
        float old = disk * (0.28 + 0.2 * clump) * (0.85 + 0.3 * fine);
        float hii = smoothstep(0.78, 0.92, fine) * arm * armK * smoothstep(1.0, 0.3, r) * 0.9;
        vec3 cOld = vec3(1.0, 0.86, 0.68), cYoung = mix(vec3(0.9, 0.94, 1.0), vec3(0.5, 0.66, 1.0), clamp(uBlue * 1.8, 0.0, 1.0)), cCore = vec3(1.0, 0.8, 0.5), cHii = vec3(1.0, 0.38, 0.6);
        vec3 col = (cOld * old * 0.5 + cCore * (bulge + barL) * 1.1) * uOld + cYoung * young * 1.6 + cHii * hii * 1.2;
        float dust = armIn * armK * smoothstep(0.95, 0.3, r) * (0.25 + 0.75 * smoothstep(0.38, 0.68, fbm(vP * 18.0 + 2.0))) * uDust;
        col *= 1.0 - 0.8 * dust;
        float a = clamp(dust * 0.75 * smoothstep(1.0, 0.6, r), 0.0, 0.9);
        gl_FragColor = vec4(col * uGain * uFade, a * uFade);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 2;
  return { mesh, U };
}

export type Galaxy = ReturnType<typeof makeGalaxy>;
/** Stars + a soft glow layer (every n-th star as a big blob) in one group. Spin around the group's local y. */
export function makeGalaxy(o: GalaxyOpts) {
  const group = new THREE.Group();
  const spin = new THREE.Group();
  group.add(spin);
  const stars = ptsFromPacked(galaxyPoints(o));
  const su = stars.material.uniforms;
  // dense cores burn out (and bloom into a grey disc): the bulge is dimmed per star, the glow layer is subtle
  su.uR.value = o.R * 0.003;
  su.uMinPx.value = 1.3;
  su.uGain.value = 0.6;
  su.uSoft.value = 2.4;
  su.uCls.value.set(1, 1, 0.3, 1.2);
  const glow = ptsShare(stars, ptsUniforms());
  const gu = glow.material.uniforms;
  gu.uEvery.value = 6;
  gu.uR.value = o.R * 0.06;
  gu.uMinPx.value = 2;
  gu.uMaxPx.value = 260;
  gu.uGain.value = 0.2;
  gu.uSoft.value = 1.4;
  gu.uCls.value.set(1, 1, 0.2, 1.1);
  spin.add(glow, stars);
  // spirals get the photographic disk (scaled to R); stars stay on top as resolved sparkle
  const disk = (o.kind ?? "spiral") === "spiral" ? galaxyDisk(o) : null;
  if (disk) {
    disk.mesh.scale.setScalar(o.R);
    spin.add(disk.mesh);
    su.uGain.value = 0.42; su.uMinPx.value = 1.0; su.uSoft.value = 3.2; su.uPow.value = 2.2; // fine resolved stars: only the brightest sparkle
    gu.uGain.value = 0; glow.visible = false; // the disk carries the diffuse light
  }
  const all: PtsU[] = [su, gu];
  /** Sets a uniform on both layers (and the disk's fade). */
  const both = (k: keyof PtsU, v: number) => { all.forEach((u) => ((u[k] as { value: unknown }).value = v)); if (disk && k === "uFade") disk.U.uFade.value = v; };
  /** Call every frame: pixel scale and render-units-per-Mly (from the camera). */
  const frame = (px: number, kRender: number) => { both("uPx", px); both("uK", kRender); };
  return { group, spin, stars, glow, su, gu, disk, both, frame, R: o.R };
}

/** Ring of line segments (orbit, outline). */
export function ring(r: number, color = 0xffffff, opacity = 0.35, seg = 256) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= seg; i++) { const a = (i / seg) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); }
  const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), m);
}
