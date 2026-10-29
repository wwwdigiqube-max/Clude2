// Light Logo · the light-swarm engine re-voiced for a brand intro: warm light (cream, amber, white-hot), the brand
// red as the only accent, two particle systems (2 × 65k), depth of field, shockwave rings, electric arcs, and the
// behaviours of the shapes (network signals, orbiting core, data streams, kick pops on the symbols, the logo's
// cut-line jolt, the accent streak and the second line spreading in). Structure as styles/light-swarm/engine.ts.
// The logo comes in as data (logo-pts.json from tools/logo-trace.mjs) — the engine works for any logo.
import * as THREE from "three";
import { BloomEffect, BlendFunction, Effect, EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { rng } from "../../light-swarm/math";
import { makeDof, makeSegs } from "./segs";
import { buildShapeTexture, N, SIDE } from "../../light-swarm/shapes";
import { makeNebula } from "./nebula";
import { LIGHT_EXTRA, LIGHT_SHAPES, logoLayout, setLogo, type LogoPts } from "./shapes";

export type LightEngine = ReturnType<typeof buildLightEngine>;
// per-particle brightness; the swarm runs twice (2 × 65k particles), so each value is about half the single-swarm one
const DENS: Record<string, number> = { cloud: 0.72, seed: 0.035, galaxy: 0.3, network: 0.78, brain: 0.5, embers: 0.28, core: 0.36, chip: 0.3, aperture: 0.3, play: 0.32, sparkle: 0.4, vortex: 0.22, logo: 0.5 };

class Grade extends Effect {
  constructor() {
    super(
      "Grade24",
      /* glsl */ `
uniform float flash, black, seed, ca, vig, exposure, glitch, streak;
float gh(vec2 p){ p = fract(p*vec2(443.897, 441.423)); p += dot(p, p.yx+19.19); return fract((p.x+p.y)*p.x); }
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor){
  vec2 d = uv - 0.5;
  float r2 = dot(d, d);
  vec2 uv2 = uv;
  float bj = 0.0;
  if (glitch > 0.001) {
    float row = floor(uv.y * 54.0);
    float on = step(0.5, gh(vec2(row * 1.7, seed + 3.0)));
    uv2.x += (gh(vec2(row, seed)) - 0.5) * 0.09 * glitch * on;
    vec2 blk = floor(uv * vec2(18.0, 10.0));
    bj = step(0.84, gh(blk + seed)) * glitch;
    uv2 += (vec2(gh(blk + 1.0 + seed), gh(blk + 2.0 + seed)) - 0.5) * 0.06 * bj;
  }
  vec2 off = d * ca * (0.5 + r2 * 2.0) + vec2(0.014 * glitch, 0.0);
  vec3 c = vec3(texture2D(inputBuffer, uv2 - off).r, texture2D(inputBuffer, uv2).g, texture2D(inputBuffer, uv2 + off).b);
  if (glitch > 0.001) {
    c *= 1.0 - 0.3 * glitch * step(0.5, fract(uv.y * 270.0));
    c = mix(c, c.rrg * vec3(1.3, 0.7, 0.5), bj * 0.7);
  }
  if (streak > 0.001) {
    vec3 st = vec3(0.0);
    for (int i = 1; i <= 18; i++) {
      float o = float(i) * 0.0042;
      float w = exp(-float(i) * 0.17);
      st += (max(texture2D(inputBuffer, uv2 + vec2(o, 0.0)).rgb - 0.62, 0.0) + max(texture2D(inputBuffer, uv2 - vec2(o, 0.0)).rgb - 0.62, 0.0)) * w;
    }
    c += st * streak * vec3(1.0, 0.72, 0.48) * 0.16;
  }
  c *= exposure;
  c *= 1.0 - vig * smoothstep(0.08, 0.6, r2 * 1.6);
  c = mix(c, vec3(1.0, 0.97, 0.92), clamp(flash, 0.0, 1.0));
  c *= 1.0 - clamp(black, 0.0, 1.0);
  outputColor = vec4(clamp(c, 0.0, 1.0), 1.0);
}`,
      {
        blendFunction: BlendFunction.SET,
        uniforms: new Map<string, THREE.Uniform>([["flash", new THREE.Uniform(0)], ["black", new THREE.Uniform(0)], ["seed", new THREE.Uniform(0)], ["ca", new THREE.Uniform(0.0015)], ["vig", new THREE.Uniform(0.5)], ["exposure", new THREE.Uniform(1)], ["glitch", new THREE.Uniform(0)], ["streak", new THREE.Uniform(0)]]),
      },
    );
  }
  set(k: string, v: number) {
    this.uniforms.get(k)!.value = v;
  }
}
class Sanitize extends Effect {
  constructor() {
    super("Sanitize24", `void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor){ vec3 c = inputColor.rgb; bool bad = any(isnan(c)) || any(isinf(c)); outputColor = vec4(bad ? vec3(0.0) : min(c, vec3(40.0)), 1.0); }`, { blendFunction: BlendFunction.SET });
  }
}

export function buildLightEngine(gl: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, W: number, H: number, beats: number[], logo: LogoPts) {
  setLogo(logo);
  const ACX = logoLayout(logo).subCx; // the second line's centre (world x): it spreads in from here
  const NB = beats.length;
  const SHP = LIGHT_SHAPES as readonly string[];
  const si = (name: string) => SHP.indexOf(name);
  const KS = SHP.length;
  gl.toneMapping = THREE.NoToneMapping;
  camera.near = 0.05;
  camera.far = 3000;
  camera.aspect = W / H;
  camera.updateProjectionMatrix();
  const res = new THREE.Vector2(W, H);
  const pxScale = H / 1080;
  const neb = makeNebula(Math.round(W / 2), Math.round(H / 2));
  scene.background = neb.rt.texture;
  const all: { U: Record<string, { value: unknown }> }[] = [];
  const reg = <T extends { U: Record<string, { value: unknown }> }>(s: T) => {
    (s.U.res.value as THREE.Vector2).copy(res);
    s.U.px.value = pxScale;
    all.push(s);
    return s;
  };
  const R = rng(24);
  const dof = makeDof();

  // ---------------- dust (warm) ----------------
  const DN = 30000;
  const dPos = new Float32Array(DN * 4);
  for (let i = 0; i < DN; i++) {
    const u = R(), v = R();
    const th = u * Math.PI * 2, ph = Math.acos(2 * v - 1);
    const r = 20 + Math.pow(R(), 0.55) * 480;
    dPos.set([Math.sin(ph) * Math.cos(th) * r, Math.cos(ph) * r * 0.7, Math.sin(ph) * Math.sin(th) * r, R()], i * 4);
  }
  const dustU = { prevVP: { value: new THREE.Matrix4() }, amt: { value: 1 } };
  const dust = reg(
    makeSegs(
      DN,
      [{ name: "dp", size: 4, data: dPos }],
      /* glsl */ `
uniform mat4 prevVP; uniform float amt;
vec3 P(float e){ return dp.xyz; }
float WIDTH(){ return 1.2 + 1.8 * step(0.988, dp.w); }
float ALPHA(){ return amt * (0.16 + 0.55 * fract(dp.w * 7.31)) * (0.65 + 0.35 * sin(time * (0.7 + 2.0 * dp.w) + dp.w * 40.0)); }
vec3 COL(float e){ return mix(vec3(1.0, 0.78, 0.55), vec3(1.0, 0.95, 0.88), step(0.6, fract(dp.w * 13.7))) * (0.5 + 0.5 * e); }
`,
      dustU,
      dof,
    ),
  );
  (dust.mesh.material as THREE.ShaderMaterial).vertexShader = (dust.mesh.material as THREE.ShaderMaterial).vertexShader.replace("vec4 ca = projectionMatrix * viewMatrix * vec4(A, 1.0);", "vec4 ca = prevVP * vec4(A, 1.0);");
  scene.add(dust.mesh);

  // ---------------- the swarm ----------------
  const mkTex = () => {
    const { data, K } = buildShapeTexture(SHP, LIGHT_EXTRA);
    const tx = new THREE.DataTexture(data, SIDE, SIDE * K, THREE.RGBAFormat, THREE.FloatType);
    tx.minFilter = THREE.NearestFilter;
    tx.magFilter = THREE.NearestFilter;
    tx.needsUpdate = true;
    return tx;
  };
  const tex = mkTex();
  const tex2 = mkTex(); // a second, independently sampled set of every shape: twice the detail
  const mkPid = () => {
    const p = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) p.set([i, R()], i * 2);
    return p;
  };
  const pid = mkPid();
  const pid2 = mkPid();
  const partU = {
    shapeTex: { value: tex },
    sA: { value: 0 }, sB: { value: 1 }, offA: { value: new THREE.Vector3() }, offB: { value: new THREE.Vector3() },
    t0: { value: 0 }, D: { value: 1 }, F: { value: 0.6 }, quant: { value: 0 }, swirl: { value: 0 }, turb: { value: 4 },
    tPrev: { value: 0 }, beats: { value: beats.slice() }, dens: { value: SHP.map((n) => DENS[n] ?? 0.8) },
    lastKick: { value: -9 }, kick: { value: 0 }, beat: { value: 0 }, pAmt: { value: 1 }, energy: { value: 0 }, red: { value: 0 }, sizeK: { value: 1 },
    arrGain: { value: 1.5 }, flyDim: { value: 0.6 }, jolt: { value: 0 }, spin: { value: 0 },
    slashK: { value: 0 }, acadP: { value: 0 }, sweepX: { value: -99 }, sweepAmt: { value: 0 },
  };
  const S = Object.fromEntries(SHP.map((n, i) => [n, i])) as Record<string, number>;
  const SWARM_GLSL = `
#define NB ${NB}
uniform sampler2D shapeTex;
uniform float sA, sB, t0, D, F, quant, swirl, turb, tPrev, lastKick, kick, beat, pAmt, energy, red, sizeK, arrGain, flyDim, jolt, spin, slashK, acadP, sweepX, sweepAmt;
uniform vec3 offA, offB;
uniform float beats[NB];
uniform float dens[${KS}];
float hsh(float n){ return fract(sin(n * 12.9898) * 43758.5453); }
vec3 rotY(vec3 p, float a){ float c = cos(a), s = sin(a); return vec3(c*p.x - s*p.z, p.y, s*p.x + c*p.z); }
vec3 rotX(vec3 p, float a){ float c = cos(a), s = sin(a); return vec3(p.x, c*p.y - s*p.z, s*p.y + c*p.z); }
vec4 fetchS(float s, float id){
  int i = int(id + 0.5);
  return texelFetch(shapeTex, ivec2(i % ${SIDE}, i / ${SIDE} + int(s + 0.5) * ${SIDE}), 0);
}
float catOf(vec4 q){ return floor(q.w + 1e-4); }
float bOf(vec4 q){ return fract(q.w + 1e-4); }
float acadProg(float b){ return clamp((acadP - b) * 4.0, 0.0, 1.0); }
bool isSym(int k){ return k == ${S.chip} || k == ${S.aperture} || k == ${S.play} || k == ${S.sparkle}; }
vec3 shapeP(float s, vec4 q, float t){
  int k = int(s + 0.5);
  float cat = catOf(q), b = bOf(q);
  if (k == ${S.vortex}) {
    float h = fract(q.y + t * 0.32);
    float y = -30.0 + h * 64.0;
    float rad = (2.5 + 22.0 * pow(h, 1.5)) * (1.0 + 0.15 * q.z);
    float ang = q.x + t * (2.6 + spin) + y * 0.12;
    return vec3(cos(ang) * rad, y, sin(ang) * rad);
  }
  if (k == ${S.core} && cat > 6.5 && cat < 7.5) {
    float ring = floor(q.y + 0.5);
    float r = 23.0 + ring * 5.5 + q.z * 0.35;
    float dir = mod(ring, 2.0) < 0.5 ? 1.0 : -1.0;
    float a = q.x + t * (0.95 - 0.22 * ring) * dir;
    vec3 c = vec3(cos(a) * r, q.z * 0.12, sin(a) * r);
    c = rotX(c, 0.42 + ring * 0.62);
    return rotY(c, ring * 2.1 + t * 0.12);
  }
  if (k == ${S.core} && cat > 7.5) {
    float h = fract(q.y + t * 0.32);
    float a = q.x + t * 0.1;
    return vec3(cos(a) * q.z, -42.0 + h * 84.0, sin(a) * q.z);
  }
  vec3 p = q.xyz;
  if (k == ${S.cloud}) p = rotY(p, t * 0.05);
  if (k == ${S.seed}) { p *= 1.0 + 0.5 * beat * step(0.5, cat); p = rotY(p, t * 0.9); }
  if (k == ${S.galaxy}) p = rotY(p, t * (0.55 - 0.3 * b) + spin);
  if (k == ${S.network}) p = rotY(p, sin(t * 0.25) * 0.18);
  if (k == ${S.brain}) { p = rotY(p, t * 0.22); p *= 1.0 + 0.025 * kick; }
  if (k == ${S.embers}) { p = rotY(p, t * 0.08); p.y += sin(t * 0.7 + b * 40.0) * 1.6; }
  if (k == ${S.core}) { p = rotY(p, t * 0.3); p *= 1.0 + 0.07 * beat; }
  if (isSym(k)) { p *= 1.0 + 0.07 * kick; p = rotY(p, sin(t * 2.0) * 0.12); }
  if (k == ${S.logo}) {
    if (cat > 9.5 && cat < 10.5) p += vec3(34.0, 24.0, 8.0) * pow(1.0 - slashK, 2.0);
    if (cat > 10.5) { float pr = acadProg(b); p.x += (p.x - ${ACX.toFixed(3)}) * 0.6 * (1.0 - pr); p.y -= 1.5 * (1.0 - pr); }
    p.x += (p.y > 0.0 ? -1.0 : 1.0) * jolt;
  }
  return p;
}
float departT(float b, float jit){
  float tau = t0 + D * b;
  if (quant > 0.5) {
    float q = beats[0], qn = beats[1];
    for (int i = 0; i + 1 < NB; i++) { if (beats[i] <= tau + 0.02) { q = beats[i]; qn = beats[i + 1]; } }
    float fr = clamp((tau - q) / max(qn - q, 0.1), 0.0, 1.0);
    tau = q + fr * (qn - q) * 0.22 + jit * 0.05;
  } else tau += jit * 0.05;
  return tau;
}
float KE; float ARR; float INF; vec4 QA; vec4 QB;
vec3 morphAt(float t){
  float id = pid.x;
  QA = fetchS(sA, id);
  QB = fetchS(sB, id);
  vec3 a = shapeP(sA, QA, t) + offA;
  vec3 b = shapeP(sB, QB, t) + offB;
  float tau = departT(bOf(QB), pid.y);
  float k = clamp((t - tau) / F, 0.0, 1.0);
  float ke = 1.0 - pow(1.0 - k, 3.0);
  KE = ke; ARR = tau + F; INF = sin(3.14159 * k);
  vec3 p = mix(a, b, ke);
  if (k > 0.0) p = offB + rotY(p - offB, (1.0 - ke) * (1.0 - ke) * swirl);
  if (INF > 0.001) p += curl3(p * 0.035 + vec3(pid.y * 5.0, 0.0, t * 0.15)) * turb * INF;
  return p;
}
vec3 P(float e){ return e < 0.5 ? morphAt(tPrev) : morphAt(time); }
float pulseFront(float b){ return exp(-pow((b - (time - lastKick) * 1.25) / 0.04, 2.0)); }
float catBright(float s, vec4 q){
  int k = int(s + 0.5);
  float cat = catOf(q), b = bOf(q);
  float br = cat < 0.5 ? 0.13 : (cat < 1.5 ? 1.0 : (cat < 2.5 ? 1.45 : 0.9));
  if (k == ${S.network} && cat > 0.5) br += 2.2 * pulseFront(b);
  if (k == ${S.brain} && cat > 0.5) br += 2.6 * pulseFront(b) + 0.9 * pulseFront(b + 0.35);
  if (k == ${S.core} && cat > 6.5 && cat < 7.5) br = 0.75 + 0.6 * beat;
  if (k == ${S.core} && cat > 7.5) { float h = fract(q.y + time * 0.32); br = 0.85 * smoothstep(0.0, 0.12, h) * (1.0 - smoothstep(0.75, 1.0, h)); }
  if (k == ${S.logo}) {
    if (cat > 8.5 && cat < 9.5) br = 0.55;
    if (cat > 9.5 && cat < 10.5) br = 2.6 * step(0.001, slashK);
    if (cat > 10.5) br = 1.1 * acadProg(b);
    if (cat < 9.5 || cat > 10.5) br += sweepAmt * exp(-pow((q.x - sweepX) / 2.6, 2.0));
  }
  if (isSym(k) && cat > 0.5) br *= 1.0 + 0.6 * kick;
  return br * dens[k];
}
vec3 catCol(float s, vec4 q){
  int k = int(s + 0.5);
  float cat = catOf(q);
  vec3 cream = vec3(1.0, 0.92, 0.80), amber = vec3(1.0, 0.68, 0.38), white = vec3(1.0, 0.97, 0.93), redc = vec3(1.0, 0.33, 0.21);
  float h = hsh(pid.x * 1.3);
  vec3 c = mix(cream, amber, step(0.66, h));
  if (cat > 1.5 && cat < 2.5) c = white;
  if (k == ${S.embers}) c = mix(redc, vec3(1.0, 0.66, 0.42), h);
  if (k == ${S.network} && cat > 0.5) c = mix(c, redc, clamp(pulseFront(bOf(q)) * 1.6, 0.0, 1.0));
  if (k == ${S.brain} && cat > 0.5) c = mix(c, redc, clamp(pulseFront(bOf(q)) * 1.8, 0.0, 1.0));
  if (k == ${S.core} && cat > 7.5) c = mix(amber, redc, step(0.72, h));
  if (k == ${S.vortex}) c = mix(cream, redc, step(0.78, h));
  if (k == ${S.logo}) c = cat > 10.5 ? cream : (cat > 9.5 ? mix(redc, vec3(1.0, 0.6, 0.45), step(0.8, h)) : (cat > 8.5 ? amber : white));
  return c;
}
float WIDTH(){ DOFK = catOf(QB) < 0.5 ? 1.0 : 0.22; return (1.5 + 1.6 * step(0.93, pid.y)) * sizeK * (1.0 + 0.25 * kick); }
float ALPHA(){
  float br = mix(catBright(sA, QA), catBright(sB, QB), KE);
  float land = time > ARR && br > 1e-3 ? arrGain * exp(-(time - ARR) * 6.0) * dens[int(sB + 0.5)] : 0.0;
  float tw = 0.8 + 0.2 * sin(time * (1.0 + 3.0 * pid.y) + pid.y * 60.0);
  return pAmt * (br * tw * mix(1.0, flyDim, INF) + land);
}
vec3 COL(float e){
  vec3 c = mix(catCol(sA, QA), catCol(sB, QB), KE);
  c = mix(c, vec3(1.0, 0.36, 0.22), energy * step(0.62, pid.y));
  c = mix(c, vec3(1.0, 0.26, 0.2), red * INF * step(0.5, pid.y));
  return c * (0.55 + 0.75 * e);
}
`;
  const parts = reg(makeSegs(N, [{ name: "pid", size: 2, data: pid }], SWARM_GLSL, partU, dof));
  const parts2 = reg(makeSegs(N, [{ name: "pid", size: 2, data: pid2 }], SWARM_GLSL, { ...partU, shapeTex: { value: tex2 } }, dof));
  parts.U.lenFade.value = 0.06;
  parts2.U.lenFade.value = 0.06;
  scene.add(parts.mesh);
  scene.add(parts2.mesh);

  // ---------------- streak bursts ----------------
  const MAXB = 6;
  const BN = 9000;
  const bAttr = new Float32Array(BN * 4);
  for (let i = 0; i < BN; i++) bAttr.set([i % MAXB, R(), R(), R()], i * 4);
  const burstU = {
    evT: { value: Array.from({ length: MAXB }, () => -99) },
    evC: { value: Array.from({ length: MAXB }, () => new THREE.Vector3()) },
    evP: { value: Array.from({ length: MAXB }, () => new THREE.Vector4(30, 2, 1, 2)) },
    trail: { value: 0.12 },
  };
  const bursts = reg(
    makeSegs(
      BN,
      [{ name: "ba", size: 4, data: bAttr }],
      /* glsl */ `
uniform float evT[${MAXB}]; uniform vec3 evC[${MAXB}]; uniform vec4 evP[${MAXB}]; uniform float trail;
float AGE; vec4 EP;
vec3 dirOf(){ float th = ba.y * 6.2831853; float ph = acos(2.0 * ba.z - 1.0); return vec3(sin(ph)*cos(th), cos(ph)*0.75, sin(ph)*sin(th)); }
vec3 pos(float age){
  int e = int(ba.x + 0.5);
  vec4 p = evP[e];
  float dist = p.x / p.y * (0.35 + 0.65 * ba.w);
  vec3 q = evC[e] + dirOf() * dist * (1.0 - exp(-p.y * age));
  q += curl3(q * 0.06 + ba.yzw * 3.0) * p.z * age * exp(-age * 0.9) * 2.0;
  return q;
}
vec3 P(float e){
  int ev = int(ba.x + 0.5);
  AGE = time - evT[ev];
  EP = evP[ev];
  return pos(max(AGE - (1.0 - e) * trail * (0.6 + 0.8 * ba.z), 0.0));
}
float WIDTH(){ return 1.3 + 1.4 * step(0.9, ba.w); }
float ALPHA(){ if (AGE < 0.0 || AGE > EP.w) return 0.0; return smoothstep(0.0, 0.03, AGE) * (1.0 - smoothstep(EP.w * 0.55, EP.w, AGE)) * 0.8; }
vec3 COL(float e){
  vec3 tail = mix(vec3(1.0, 0.62, 0.32), vec3(1.0, 0.3, 0.2), step(0.7, fract(ba.w * 9.7)));
  return mix(tail * 0.8, vec3(1.0, 0.97, 0.92) * 2.2, e * e);
}
`,
      burstU,
      dof,
    ),
  );
  scene.add(bursts.mesh);

  // ---------------- shockwave rings (camera-facing, radial streaks) ----------------
  const MAXR = 6;
  const RN = 16000;
  const rAttr = new Float32Array(RN * 4);
  for (let i = 0; i < RN; i++) rAttr.set([i % MAXR, R(), R(), R()], i * 4);
  const ringU = {
    rT: { value: Array.from({ length: MAXR }, () => -99) },
    rC: { value: Array.from({ length: MAXR }, () => new THREE.Vector3()) },
    rP: { value: Array.from({ length: MAXR }, () => new THREE.Vector4(60, 5, 1, 1)) }, // radius, speed, life, brightness
  };
  const rings = reg(
    makeSegs(
      RN,
      [{ name: "ra", size: 4, data: rAttr }],
      /* glsl */ `
uniform float rT[${MAXR}]; uniform vec3 rC[${MAXR}]; uniform vec4 rP[${MAXR}];
float AGE; vec4 RP;
vec3 P(float e){
  int ev = int(ra.x + 0.5);
  AGE = time - rT[ev];
  RP = rP[ev];
  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  float a = ra.y * 6.2831853;
  float age = max(AGE - (1.0 - e) * 0.012, 0.0);
  float r = RP.x * (1.0 - exp(-age * RP.y)) * (1.0 + 0.04 * (ra.z - 0.5)) + (ra.w - 0.5) * 0.8;
  return rC[ev] + (right * cos(a) + up * sin(a)) * r;
}
float WIDTH(){ DOFK = 0.3; return 1.4 + 1.4 * step(0.92, ra.w); }
float ALPHA(){ if (AGE < 0.0 || AGE > RP.z) return 0.0; return RP.w * smoothstep(0.03, 0.1, AGE) * (1.0 - smoothstep(RP.z * 0.25, RP.z, AGE)); }
vec3 COL(float e){ return mix(vec3(1.0, 0.62, 0.34), vec3(1.0, 0.96, 0.9) * 1.8, e * e); }
`,
      ringU,
      dof,
    ),
  );
  scene.add(rings.mesh);

  // ---------------- electric arcs: fractal bolts that re-strike 15× a second (around a sphere, or along the cut line) ----------------
  const BOLTS = 22;
  const SEG = 30;
  const AN = BOLTS * SEG;
  const aAttr = new Float32Array(AN * 2);
  for (let i = 0; i < AN; i++) aAttr.set([Math.floor(i / SEG), i % SEG], i * 2);
  const arcU = { arcAmt: { value: 0 }, arcMode: { value: 0 }, arcR: { value: 20 }, arcC: { value: new THREE.Vector3() }, arcX: { value: new THREE.Vector2(-30, 30) } };
  const arcs = reg(
    makeSegs(
      AN,
      [{ name: "ab", size: 2, data: aAttr }],
      /* glsl */ `
uniform float arcAmt, arcMode, arcR; uniform vec3 arcC; uniform vec2 arcX;
float h1(float n){ return fract(sin(n * 91.345) * 47453.5453); }
float BLK; float SEED; float VIS;
vec3 dirOf(float s){ float th = h1(s) * 6.2831853; float z = h1(s + 3.1) * 2.0 - 1.0; float r = sqrt(1.0 - z * z); return vec3(r * cos(th), z, r * sin(th)); }
vec3 bolt(float u){
  vec3 A, B;
  if (arcMode < 0.5) { A = arcC + dirOf(SEED) * arcR; B = arcC + dirOf(SEED + 11.0) * arcR * (0.8 + 0.4 * h1(SEED + 2.0)); }
  else { float x = mix(arcX.x, arcX.y, h1(SEED)); float len = 6.0 + 16.0 * h1(SEED + 5.0); A = arcC + vec3(x, 0.0, 0.0); B = arcC + vec3(x + len * (h1(SEED + 7.0) < 0.5 ? -1.0 : 1.0), 0.0, 0.0); }
  vec3 d = B - A; float L = length(d);
  vec3 t = d / max(L, 1e-3);
  vec3 n1 = normalize(cross(t, abs(t.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
  vec3 n2 = cross(t, n1);
  float env = sin(3.14159 * u);
  float o1 = (vnoise3(vec3(u * 5.0, SEED, BLK)) - 0.5) * 1.0 + (vnoise3(vec3(u * 13.0, SEED + 4.0, BLK)) - 0.5) * 0.45 + (vnoise3(vec3(u * 31.0, SEED + 9.0, BLK)) - 0.5) * 0.18;
  float o2 = (vnoise3(vec3(u * 5.0, SEED + 20.0, BLK)) - 0.5) * 1.0 + (vnoise3(vec3(u * 13.0, SEED + 24.0, BLK)) - 0.5) * 0.45;
  float amp = L * 0.28 * (arcMode < 0.5 ? 1.0 : 0.35);
  return A + d * u + (n1 * o1 + n2 * o2 * (arcMode < 0.5 ? 1.0 : 0.25)) * amp * env;
}
vec3 P(float e){
  BLK = floor(time * 15.0);
  SEED = ab.x * 17.31 + BLK * 3.77;
  VIS = step(0.42, h1(ab.x * 7.7 + BLK * 1.3));
  return bolt((ab.y + e) / ${SEG}.0);
}
float WIDTH(){ DOFK = 0.15; return 1.3 + 0.9 * step(0.7, h1(ab.x)); }
float ALPHA(){ return arcAmt * VIS * (0.7 + 0.3 * h1(ab.x + BLK)); }
vec3 COL(float e){ return mix(vec3(1.0, 0.36, 0.22) * 1.6, vec3(1.0, 0.92, 0.85) * 2.4, 0.45 + 0.4 * h1(ab.x + 1.0)); }
`,
      arcU,
      dof,
    ),
  );
  scene.add(arcs.mesh);

  // ---------------- core glow ----------------
  const coreAttr = new Float32Array([0, 0, 0, 0, 0, 0, 0, 1]);
  const coreU = { cAmt: { value: 0 }, cSize: { value: 40 }, cPos: { value: new THREE.Vector3() }, cRed: { value: 0 } };
  const glow = reg(
    makeSegs(
      2,
      [{ name: "ca4", size: 4, data: coreAttr }],
      /* glsl */ `
uniform float cAmt, cSize, cRed; uniform vec3 cPos;
vec3 P(float e){ return cPos; }
float WIDTH(){ return ca4.w < 0.5 ? cSize : cSize * 4.0; }
float ALPHA(){ return cAmt * (ca4.w < 0.5 ? 1.0 : 0.2); }
vec3 COL(float e){ vec3 c = mix(vec3(1.0, 0.97, 0.92) * 3.0, vec3(1.0, 0.62, 0.32) * 1.6, ca4.w < 0.5 ? 0.1 : 0.5); return mix(c, vec3(1.0, 0.3, 0.22) * 2.0, cRed * (ca4.w < 0.5 ? 0.3 : 0.9)); }
`,
      coreU,
      null,
    ),
  );
  (glow.mesh.material as THREE.ShaderMaterial).fragmentShader = `
uniform float gain; varying vec2 vUv; varying vec3 vCol; varying float vA;
void main(){ vec2 q = vec2(vUv.x * 2.0 - 1.0, vUv.y); float r = length(q); float a = exp(-r * r * 5.0) + 0.6 * exp(-r * r * 40.0); gl_FragColor = vec4(vCol * vA * a * gain, 1.0); }`;
  scene.add(glow.mesh);

  // ---------------- post ----------------
  const composer = new EffectComposer(gl, { frameBufferType: THREE.HalfFloatType, multisampling: 4 });
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new EffectPass(camera, new Sanitize()));
  const bloom = new BloomEffect({ mipmapBlur: true, luminanceThreshold: 0.32, luminanceSmoothing: 0.3, intensity: 1.5, radius: 0.75, levels: 9 });
  composer.addPass(new EffectPass(camera, bloom, new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC })));
  const grade = new Grade();
  composer.addPass(new EffectPass(camera, grade));
  composer.setSize(W, H);

  const prevVP = new THREE.Matrix4();
  const render = () => {
    neb.render(gl, camera);
    dustU.prevVP.value.copy(prevVP);
    composer.render();
  };
  const setPrev = (m: THREE.Matrix4) => prevVP.copy(m);
  const setTime = (t: number) => all.forEach((s) => (s.U.time.value = t));
  return { neb, dustU, partU, burstU, ringU, arcU, coreU, dof, bloom, grade, render, setPrev, setTime, MAXB, MAXR, shapeIndex: si };
}
