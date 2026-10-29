// Light-swarm engine: 65k light particles that build one shape after another
// on the beat (each particle flies from the previous form to its place in build
// order), streak-dust, burst sparks, a core glow and a ray-marched filament
// nebula behind everything; bloom + glitch grade on top. All a pure function of
// time: the director sets uniforms per frame (see timeline.ts and Demo.tsx).
import * as THREE from "three";
import { BloomEffect, BlendFunction, Effect, EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { rng } from "./math";
import { makeNebula } from "./nebula";
import { makeSegSystem } from "./segs";
import { buildShapeTexture, N, SIDE, type ShapeGen } from "./shapes";

export type SwarmEngine = ReturnType<typeof buildSwarmEngine>;
export type SwarmOptions = {
  /** beat times in video seconds (wing flaps and beat-quantised builds use them) */
  beats: number[];
  /** shapes of this film, in texture order (built-in names or keys of extraShapes) */
  shapes: readonly string[];
  extraShapes?: Record<string, ShapeGen>;
  /** per-shape brightness of one particle (dense shapes need less) */
  dens?: Record<string, number>;
};
export const DEFAULT_DENS: Record<string, number> = { cloud: 1.1, seed: 0.06, tree: 0.85, diamond: 1.0, embers: 0.55, phoenix: 0.8, vortex: 0.4, crown: 0.9, galaxy: 0.5 };

// ---------------- post ----------------
class GradeEffect extends Effect {
  constructor() {
    super(
      "Grade16",
      /* glsl */ `
uniform float flash, black, seed, ca, vig, exposure, glitch;
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
    c = mix(c, c.gbr * vec3(0.5, 1.7, 1.2), bj * 0.7);
  }
  c *= exposure;
  c *= 1.0 - vig * smoothstep(0.08, 0.6, r2 * 1.6);
  c = mix(c, vec3(1.0), clamp(flash, 0.0, 1.0));
  c *= 1.0 - clamp(black, 0.0, 1.0);
  outputColor = vec4(clamp(c, 0.0, 1.0), 1.0);
}`,
      {
        blendFunction: BlendFunction.SET,
        uniforms: new Map<string, THREE.Uniform>([
          ["flash", new THREE.Uniform(0)],
          ["black", new THREE.Uniform(0)],
          ["seed", new THREE.Uniform(0)],
          ["ca", new THREE.Uniform(0.0015)],
          ["vig", new THREE.Uniform(0.5)],
          ["exposure", new THREE.Uniform(1)],
          ["glitch", new THREE.Uniform(0)],
        ]),
      },
    );
  }
  set(k: string, v: number) {
    this.uniforms.get(k)!.value = v;
  }
}
class SanitizeEffect extends Effect {
  constructor() {
    super("Sanitize16", `void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor){ vec3 c = inputColor.rgb; bool bad = any(isnan(c)) || any(isinf(c)); outputColor = vec4(bad ? vec3(0.0) : min(c, vec3(40.0)), 1.0); }`, { blendFunction: BlendFunction.SET });
  }
}

export function buildSwarmEngine(gl: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, W: number, H: number, opts: SwarmOptions) {
  const NB = opts.beats.length;
  const SHP = opts.shapes;
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
  const R = rng(7);

  // ---------------- dust ----------------
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
    makeSegSystem(
      DN,
      [{ name: "dp", size: 4, data: dPos }],
      /* glsl */ `
uniform mat4 prevVP; uniform float amt;
vec3 P(float e){ return dp.xyz; }
float WIDTH(){ return 1.2 + 1.8 * step(0.988, dp.w); }
float ALPHA(){ return amt * (0.18 + 0.6 * fract(dp.w * 7.31)) * (0.65 + 0.35 * sin(time * (0.7 + 2.0 * dp.w) + dp.w * 40.0)); }
vec3 COL(float e){ return mix(vec3(0.55, 0.75, 1.0), vec3(1.0, 0.95, 0.88), step(0.7, fract(dp.w * 13.7))) * (0.5 + 0.5 * e); }
`,
      dustU,
    ),
  );
  (dust.mesh.material as THREE.ShaderMaterial).vertexShader = (dust.mesh.material as THREE.ShaderMaterial).vertexShader.replace(
    "vec4 ca = projectionMatrix * viewMatrix * vec4(A, 1.0);",
    "vec4 ca = prevVP * vec4(A, 1.0);",
  );
  scene.add(dust.mesh);

  // ---------------- the swarm ----------------
  const { data, K } = buildShapeTexture(SHP, opts.extraShapes);
  const tex = new THREE.DataTexture(data, SIDE, SIDE * K, THREE.RGBAFormat, THREE.FloatType);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  const pid = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) pid.set([i, R()], i * 2);
  const partU = {
    shapeTex: { value: tex },
    sA: { value: 0 }, sB: { value: 1 }, offA: { value: new THREE.Vector3() }, offB: { value: new THREE.Vector3() },
    t0: { value: 0 }, D: { value: 1 }, F: { value: 0.6 }, quant: { value: 0 }, swirl: { value: 0 }, turb: { value: 4 },
    tPrev: { value: 0 }, beats: { value: opts.beats.slice() }, dens: { value: SHP.map((n) => opts.dens?.[n] ?? DEFAULT_DENS[n] ?? 0.8) },
    lastKick: { value: -9 }, kick: { value: 0 }, beat: { value: 0 }, pAmt: { value: 1 }, energy: { value: 0 }, red: { value: 0 }, sizeK: { value: 1 },
    phYaw: { value: -2.75 }, arrGain: { value: 1.6 }, flyDim: { value: 0.6 },
  };
  const S = { cloud: si("cloud"), seed: si("seed"), tree: si("tree"), diamond: si("diamond"), embers: si("embers"), phoenix: si("phoenix"), vortex: si("vortex"), crown: si("crown"), galaxy: si("galaxy") };
  const parts = reg(
    makeSegSystem(
      N,
      [{ name: "pid", size: 2, data: pid }],
      /* glsl */ `
#define NB ${NB}
uniform sampler2D shapeTex;
uniform float sA, sB, t0, D, F, quant, swirl, turb, tPrev, lastKick, kick, beat, pAmt, energy, red, sizeK, phYaw, arrGain, flyDim;
uniform vec3 offA, offB;
uniform float beats[NB];
uniform float dens[${KS}];
float hsh(float n){ return fract(sin(n * 12.9898) * 43758.5453); }
vec3 rotY(vec3 p, float a){ float c = cos(a), s = sin(a); return vec3(c*p.x - s*p.z, p.y, s*p.x + c*p.z); }
vec4 fetchS(float s, float id){
  int i = int(id + 0.5);
  return texelFetch(shapeTex, ivec2(i % ${SIDE}, i / ${SIDE} + int(s + 0.5) * ${SIDE}), 0);
}
float catOf(vec4 q){ return floor(q.w + 1e-4); }
float bOf(vec4 q){ return fract(q.w + 1e-4); }
// wing beat: one flap per two beats, the downstroke lands on beats 1 and 3
float flapTheta(float t){
  float c0 = beats[0], c1 = beats[2];
  for (int i = 0; i + 2 < NB; i += 2) { if (t >= beats[i]) { c0 = beats[i]; c1 = beats[i + 2]; } }
  float u = clamp((t - c0) / max(c1 - c0, 0.1), 0.0, 1.0);
  return 0.1 - 0.45 * cos(6.2831853 * u);
}
vec3 rotZp(vec3 p, vec3 c, float a){ vec3 d = p - c; float cs = cos(a), sn = sin(a); return c + vec3(cs*d.x - sn*d.y, sn*d.x + cs*d.y, d.z); }
vec3 shapeP(float s, vec4 q, float t){
  int k = int(s + 0.5);
  float cat = catOf(q), b = bOf(q);
  if (k == ${S.vortex}) {
    float h = fract(q.y + t * 0.28);
    float y = -26.0 + h * 62.0;
    float rad = (2.5 + 20.0 * pow(h, 1.6)) * (1.0 + 0.15 * q.z);
    float ang = q.x + t * 2.4 + y * 0.12;
    return vec3(cos(ang) * rad, y, sin(ang) * rad);
  }
  vec3 p = q.xyz;
  if (k == ${S.cloud}) p = rotY(p, t * 0.05);
  if (k == ${S.seed}) { p *= 1.0 + 0.45 * beat * step(0.5, cat); p = rotY(p, t * 0.9); }
  if (k == ${S.tree}) {
    float h = max(p.y + 14.0, 0.0);
    p.x += sin(t * 1.1 + p.y * 0.15) * 0.0011 * h * h;
    p.z += cos(t * 0.9 + p.y * 0.12) * 0.0008 * h * h;
  }
  if (k == ${S.diamond}) { p = rotY(p, t * 0.42); p.y += sin(t * 1.3) * 0.6; }
  if (k == ${S.embers}) { p = rotY(p, t * 0.08); p.y += sin(t * 0.7 + b * 40.0) * 1.6; }
  if (k == ${S.phoenix}) {
    float th = flapTheta(t);
    if (cat > 3.5 && cat < 5.5) {
      float sd = cat < 4.5 ? -1.0 : 1.0;
      vec3 piv = vec3(sd * 2.5, 7.0, 0.0);
      float d = length(p.xy - piv.xy);
      p = rotZp(p, piv, sd * th * (0.85 + 0.3 * clamp(d / 45.0, 0.0, 1.0)));
      p = piv + rotY(p - piv, -sd * 0.28 * th);
    }
    if (cat > 5.5) { float hy = max(-10.0 - p.y, 0.0); p.x += sin(t * 2.2 + p.y * 0.18) * 0.0012 * hy * hy; }
    if (cat > 2.5 && cat < 3.5) { float ph = fract(b * 7.31 + t * 0.85); p += vec3(sin(b * 91.0) * 1.5 * ph, ph * 7.0, -ph * 5.0); }
    p.y += -1.6 * th;
    p = rotY(p, phYaw + sin(t * 0.4) * 0.12);
  }
  if (k == ${S.crown}) p = rotY(p, t * 0.35);
  if (k == ${S.galaxy}) p = rotY(p, t * (0.4 - 0.28 * b));
  return p;
}
// when does this particle leave? (beat-quantised build: each beat releases the next part)
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
float pulseFront(float b){ return exp(-pow((b - (time - lastKick) * 1.15) / 0.035, 2.0)); }
float catBright(float s, vec4 q){
  int k = int(s + 0.5);
  float cat = catOf(q), b = bOf(q);
  float br = cat < 0.5 ? 0.13 : (cat < 1.5 ? 1.0 : (cat < 2.5 ? 1.45 : 0.9));
  if (k == ${S.phoenix} && cat > 2.5 && cat < 3.5) br *= (1.0 - fract(b * 7.31 + time * 0.85)) * 1.3;
  if (k == ${S.vortex}) { float h = fract(q.y + time * 0.28); br = 0.9 * smoothstep(0.0, 0.08, h) * (1.0 - smoothstep(0.7, 1.0, h)); }
  if (k == ${S.tree} && cat > 0.5) br += 1.6 * pulseFront(b);
  if (k == ${S.crown} && cat > 0.5 && b < 0.3) br += 1.4 * exp(-pow((b / 0.3 - fract((time - lastKick) * 0.9)) / 0.05, 2.0));
  if (k == ${S.diamond} && cat > 0.5) br += 1.1 * kick * step(0.6, hsh(floor(b * 14.0) + floor(lastKick * 10.0)));
  return br * dens[k];
}
vec3 catCol(float s, vec4 q){
  int k = int(s + 0.5);
  float cat = catOf(q);
  vec3 ice = vec3(0.68, 0.85, 1.0), white = vec3(1.0, 0.98, 0.95), neon = vec3(0.25, 1.0, 0.66), redc = vec3(1.0, 0.3, 0.26);
  float h = hsh(pid.x * 1.3);
  vec3 c = mix(ice, white, step(0.62, h));
  if (cat > 1.5 && cat < 2.5) c = (k == ${S.tree} || k == ${S.crown}) ? mix(neon, white, 0.25) : white;
  if (k == ${S.embers}) c = mix(redc, vec3(1.0, 0.72, 0.5), h);
  if (k == ${S.phoenix} && cat > 2.5 && cat < 3.5) c = mix(ice, neon, h);
  if (k == ${S.vortex}) c = mix(ice, neon, step(0.7, h));
  if (k == ${S.tree} && cat > 0.5) c = mix(c, neon, clamp(pulseFront(bOf(q)) * 1.5, 0.0, 1.0));
  return c;
}
float WIDTH(){ return (1.5 + 1.6 * step(0.93, pid.y)) * sizeK * (1.0 + 0.25 * kick); }
float ALPHA(){
  float br = mix(catBright(sA, QA), catBright(sB, QB), KE);
  float land = time > ARR ? arrGain * exp(-(time - ARR) * 6.0) * dens[int(sB + 0.5)] : 0.0;
  float tw = 0.78 + 0.22 * sin(time * (1.0 + 3.0 * pid.y) + pid.y * 60.0);
  return pAmt * (br * tw * mix(1.0, flyDim, INF) + land);
}
vec3 COL(float e){
  vec3 c = mix(catCol(sA, QA), catCol(sB, QB), KE);
  c = mix(c, vec3(0.25, 1.0, 0.66), energy * step(0.6, pid.y));
  c = mix(c, vec3(1.0, 0.25, 0.25), red * INF * step(0.5, pid.y));
  return c * (0.55 + 0.75 * e);
}
`,
      partU,
    ),
  );
  parts.U.lenFade.value = 0.06;
  scene.add(parts.mesh);

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
    makeSegSystem(
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
  vec3 tail = mix(vec3(0.25, 1.0, 0.66), vec3(1.0, 0.25, 0.25), step(0.75, fract(ba.w * 9.7)));
  return mix(tail * 0.8, vec3(1.0, 0.98, 0.95) * 2.2, e * e);
}
`,
      burstU,
    ),
  );
  scene.add(bursts.mesh);

  // ---------------- core glow ----------------
  const coreAttr = new Float32Array([0, 0, 0, 0, 0, 0, 0, 1]);
  const coreU = { cAmt: { value: 0 }, cSize: { value: 40 }, cPos: { value: new THREE.Vector3() }, cGreen: { value: 0.3 }, cRed: { value: 0 } };
  const core = reg(
    makeSegSystem(
      2,
      [{ name: "ca4", size: 4, data: coreAttr }],
      /* glsl */ `
uniform float cAmt, cSize, cGreen, cRed; uniform vec3 cPos;
vec3 P(float e){ return cPos; }
float WIDTH(){ return ca4.w < 0.5 ? cSize : cSize * 4.0; }
float ALPHA(){ return cAmt * (ca4.w < 0.5 ? 1.0 : 0.2); }
vec3 COL(float e){ vec3 c = mix(vec3(1.0, 0.98, 0.94) * 3.0, vec3(0.25, 1.0, 0.65) * 1.6, ca4.w < 0.5 ? cGreen * 0.3 : cGreen); return mix(c, vec3(1.0, 0.3, 0.25) * 2.0, cRed * (ca4.w < 0.5 ? 0.3 : 0.9)); }
`,
      coreU,
    ),
  );
  (core.mesh.material as THREE.ShaderMaterial).fragmentShader = `
uniform float gain; varying vec2 vUv; varying vec3 vCol; varying float vA;
void main(){ vec2 q = vec2(vUv.x * 2.0 - 1.0, vUv.y); float r = length(q); float a = exp(-r * r * 5.0) + 0.6 * exp(-r * r * 40.0); gl_FragColor = vec4(vCol * vA * a * gain, 1.0); }`;
  scene.add(core.mesh);

  // ---------------- post ----------------
  const composer = new EffectComposer(gl, { frameBufferType: THREE.HalfFloatType, multisampling: 4 });
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new EffectPass(camera, new SanitizeEffect()));
  const bloom = new BloomEffect({ mipmapBlur: true, luminanceThreshold: 0.32, luminanceSmoothing: 0.3, intensity: 1.5, radius: 0.75, levels: 9 });
  composer.addPass(new EffectPass(camera, bloom, new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC })));
  const grade = new GradeEffect();
  composer.addPass(new EffectPass(camera, grade));
  composer.setSize(W, H);

  const prevVP = new THREE.Matrix4();
  const render = () => {
    neb.render(gl, camera);
    dustU.prevVP.value.copy(prevVP);
    composer.render();
  };
  const setPrev = (mtx: THREE.Matrix4) => prevVP.copy(mtx);
  const setTime = (t: number) => all.forEach((s) => (s.U.time.value = t));
  return { neb, dust, dustU, parts, partU, bursts, burstU, core, coreU, bloom, grade, composer, render, setPrev, setTime, MAXB, shapeIndex: si };
}
