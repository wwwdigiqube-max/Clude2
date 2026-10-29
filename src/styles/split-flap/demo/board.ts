// Split-flap · the board: instanced flap units (static top/bottom halves + a falling leaf with two faces and an edge),
// housings with axle pins, the wide logo module, a raking key light with real shadows, a light beam with dust, and the
// post chain (depth of field → bloom/vignette/ACES → chromatic aberration + grain). The lights follow the film's
// phases (see «lights» in update) — retime them with the program when you change the timeline.
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { BlendFunction, BloomEffect, ChromaticAberrationEffect, DepthOfFieldEffect, EffectComposer, EffectPass, NoiseEffect, RenderPass, ToneMappingEffect, ToneMappingMode, VignetteEffect } from "postprocessing";
import { COL, DROP, FINAL, clamp, ease, hit, lerp, ramp, rnd } from "./lib";
import { buildGlyphAtlas } from "../lib/glyphs";
// your logo: node tools/logo-trace.mjs <logo.png> src/styles/split-flap/demo --accent=#hex --only=paths
import LOGO from "./logo-paths.json";
import { CAM, CAM_CUTS, CARD_W, CHARS, COLS, GAP, HERO_ROW, HH, LOGO_ROW, MSG_ROW, P_BLACK, P_CREAM, P_GREY, P_RED, PX, PY, ROWS, WIDE_W, WIDE_WORDS, buildProgram, kick, unitState, uy, type Face } from "./program";

const lin = (hex: string) => new THREE.Color(hex);
const PAL = [lin("#0e0d0c"), lin(COL.cream), lin("#C2452F"), lin("#1c1a18")];
const INK = [lin("#151413"), lin("#F2E8D5"), lin("#C2452F"), lin("#252220")];
const PIECE_H = HH - GAP / 2;

// ─────────────── geometry: quads in card space (u across, v up the whole card; the hinge is v = 0.5)
function quad(x0: number, x1: number, y0: number, y1: number, z: number, v0: number, v1: number, facing: 1 | -1) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([x0, y0, z, x1, y0, z, x1, y1, z, x0, y1, z], 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 0, facing, 0, 0, facing, 0, 0, facing, 0, 0, facing], 3));
  const uv = [0, v0, 1, v0, 1, v1, 0, v1];
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute("aCardUV", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(facing > 0 ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2]);
  return g;
}
const vHingeTop = 0.5 + GAP / (4 * HH);
const vHingeBot = 0.5 - GAP / (4 * HH);
function halves(w: number) {
  return {
    top: quad(-w / 2, w / 2, GAP / 2, HH, -0.012, vHingeTop, 1, 1),
    bot: quad(-w / 2, w / 2, -HH, -GAP / 2, -0.012, 0, vHingeBot, 1),
    leafF: quad(-w / 2, w / 2, GAP / 2, HH, 0.004, vHingeTop, 1, 1),
    // the back of the leaf: after the leaf has fallen (rotated π about x) it shows the next face's bottom half upright
    leafB: quad(-w / 2, w / 2, GAP / 2, HH, -0.004, vHingeBot, 0, -1),
    edge: new THREE.BoxGeometry(w, PIECE_H, 0.008).translate(0, GAP / 2 + PIECE_H / 2, 0),
  };
}
function roundedRect(p: THREE.Shape | THREE.Path, x: number, y: number, w: number, h: number, r: number) {
  p.moveTo(x + r, y);
  p.lineTo(x + w - r, y);
  p.quadraticCurveTo(x + w, y, x + w, y + r);
  p.lineTo(x + w, y + h - r);
  p.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  p.lineTo(x + r, y + h);
  p.quadraticCurveTo(x, y + h, x, y + h - r);
  p.lineTo(x, y + r);
  p.quadraticCurveTo(x, y, x + r, y);
}
function bezelGeo(outerW: number, outerH: number, innerW: number, innerH: number) {
  const s = new THREE.Shape();
  roundedRect(s, -outerW / 2, -outerH / 2, outerW, outerH, 0.05);
  const hole = new THREE.Path();
  roundedRect(hole, -innerW / 2, -innerH / 2, innerW, innerH, 0.06);
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.09, bevelEnabled: true, bevelThickness: 0.014, bevelSize: 0.012, bevelSegments: 3, curveSegments: 8 });
  g.translate(0, 0, -0.035);
  return g;
}

// ─────────────── the card material: the face (card colour + SDF glyph) is computed per fragment from instance attributes
function cardMaterial(atlas: ReturnType<typeof buildGlyphAtlas>, key: string) {
  const m = new THREE.MeshStandardMaterial({ roughness: 0.46, metalness: 0, envMapIntensity: 0.05 });
  m.customProgramCacheKey = () => `card-${key}`;
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uSdf = { value: atlas.tex };
    sh.uniforms.uGrid = { value: new THREE.Vector2(atlas.cols, atlas.rows) };
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float aGlyph; attribute vec3 aCard; attribute vec3 aInk; attribute vec2 aCardUV;\nvarying float vGlyph; varying vec3 vCardC; varying vec3 vInkC; varying vec2 vCard;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvGlyph = aGlyph; vCardC = aCard; vInkC = aInk; vCard = aCardUV;");
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
uniform sampler2D uSdf; uniform vec2 uGrid;
varying float vGlyph; varying vec3 vCardC; varying vec3 vInkC; varying vec2 vCard;
float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
float topPiece = step(0.5, vCard.y);
vec2 cp = vec2((vCard.x - 0.5) * ${CARD_W.toFixed(4)}, (vCard.y - 0.5) * ${(2 * HH).toFixed(4)});
float yc = topPiece > 0.5 ? cp.y - ${(GAP / 2).toFixed(4)} : -cp.y - ${(GAP / 2).toFixed(4)};
// rounded corners on every half-card piece
vec2 qq = abs(vec2(cp.x, yc - ${(PIECE_H / 2).toFixed(4)})) - (vec2(${(CARD_W / 2).toFixed(4)}, ${(PIECE_H / 2).toFixed(4)}) - 0.045);
if (length(max(qq, 0.0)) + min(max(qq.x, qq.y), 0.0) - 0.045 > 0.0) discard;
float inkM = 0.0;
if (vGlyph > -0.5) {
  float gi = floor(vGlyph + 0.5);
  vec2 cell = vec2(mod(gi, uGrid.x), floor(gi / uGrid.x));
  vec2 auv = (cell + clamp(vCard, 0.003, 0.997)) / uGrid;
  float d = texture2D(uSdf, auv).r;
  float w = max(fwidth(d) * 0.75, 1e-4);
  inkM = smoothstep(0.5 - w, 0.5 + w, d);
}
vec3 base = vCardC;
base *= 0.9 + 0.1 * clamp(yc / ${HH.toFixed(3)}, 0.0, 1.0) * (topPiece > 0.5 ? 1.0 : -0.4) + 0.04;
base *= 0.955 + 0.09 * h21(floor(vCard * vec2(640.0, 960.0)));
base *= 1.0 - 0.5 * smoothstep(0.04, 0.0, yc);
diffuseColor.rgb = mix(base, vInkC, inkM);`,
      )
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.3, inkM);");
  };
  return m;
}

// ─────────────── the wide module faces (canvas: blank · the logo · destination words)
function wideFaces(font: string) {
  const TW = 2560, TH = Math.round((TW * (2 * HH)) / WIDE_W);
  const make = (draw: (ctx: CanvasRenderingContext2D) => void) => {
    const cv = document.createElement("canvas");
    cv.width = TW;
    cv.height = TH;
    const ctx = cv.getContext("2d")!;
    // card with rounded corners (alpha) and a faint vertical sheen
    const r = (0.045 / (2 * HH)) * TH;
    const gr = ctx.createLinearGradient(0, 0, 0, TH);
    gr.addColorStop(0, "#1b1a19");
    gr.addColorStop(0.5, "#131211");
    gr.addColorStop(1, "#181716");
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.roundRect(0, 0, TW, TH, r);
    ctx.fill();
    draw(ctx);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  };
  const blank = make(() => {});
  const logo = make((ctx) => {
    // the logo's cut line (LOGO.cut) sits exactly on the hinge; the whole box fits the card
    const [x0, y0, x1, y1] = LOGO.box;
    const s = Math.min((0.674 * TW) / (x1 - x0), (0.94 * (TH / 2)) / Math.max(LOGO.cut - y0, y1 - LOGO.cut));
    ctx.save();
    ctx.translate(TW / 2 - ((x0 + x1) / 2) * s, TH / 2 - LOGO.cut * s);
    ctx.scale(s, s);
    ctx.fillStyle = COL.cream;
    ctx.fill(new Path2D(LOGO.main), "evenodd");
    for (const a of LOGO.sub) ctx.fill(new Path2D(a), "evenodd");
    if (LOGO.accent) {
      ctx.fillStyle = "#D24A33";
      ctx.fill(new Path2D(LOGO.accent), "evenodd");
    }
    ctx.restore();
  });
  const words = WIDE_WORDS.map((wd) =>
    make((ctx) => {
      ctx.font = `400 ${TH * 0.62}px ${font}`;
      ctx.fillStyle = COL.cream;
      ctx.textAlign = "center";
      const m = ctx.measureText(wd);
      ctx.fillText(wd, TW / 2, TH / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2);
    }),
  );
  return [blank, logo, ...words];
}

export type Board = ReturnType<typeof buildBoard>;
export function buildBoard(gl: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, W: number, H: number, font: string, dbg = "") {
  gl.toneMapping = THREE.NoToneMapping;
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
  scene.background = new THREE.Color("#030303");
  const pm = new THREE.PMREMGenerator(gl);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  // the room only adds a whisper of reflection (material.envMapIntensity does not scale scene.environment)
  scene.environmentIntensity = 0.025;
  camera.near = 0.05;
  camera.far = 400;
  camera.aspect = W / H;
  camera.updateProjectionMatrix();

  const atlas = buildGlyphAtlas(CHARS, font);
  const prog = buildProgram(atlas.index);
  const units = prog.units;
  const N = units.length;

  // ─── instanced flap units
  const hv = halves(CARD_W);
  const mkInst = (geo: THREE.BufferGeometry, key: string) => {
    const g = geo.clone();
    g.setAttribute("aGlyph", new THREE.InstancedBufferAttribute(new Float32Array(N).fill(-1), 1));
    g.setAttribute("aCard", new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3));
    g.setAttribute("aInk", new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3));
    const mesh = new THREE.InstancedMesh(g, cardMaterial(atlas, key), N);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    scene.add(mesh);
    return mesh;
  };
  const TOP = mkInst(hv.top, "top");
  const BOT = mkInst(hv.bot, "bot");
  const LF = mkInst(hv.leafF, "lf");
  const LB = mkInst(hv.leafB, "lb");
  const EDGE = new THREE.InstancedMesh(hv.edge, new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.5 }), N);
  EDGE.castShadow = true;
  EDGE.frustumCulled = false;
  scene.add(EDGE);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1), zero = new THREE.Vector3(0, 0, 0), X = new THREE.Vector3(1, 0, 0);
  units.forEach((u, i) => {
    m4.compose(pos.set(u.x, u.y, 0), q.identity(), one);
    TOP.setMatrixAt(i, m4);
    BOT.setMatrixAt(i, m4);
  });
  // housings, axle pins, back plate, band bars, frame
  const bezel = new THREE.InstancedMesh(bezelGeo(PX - 0.012, PY - 0.012, CARD_W + 0.07, 2 * HH + 0.07), new THREE.MeshStandardMaterial({ color: 0x0a0909, roughness: 0.48, metalness: 0.2, envMapIntensity: 0.08 }), N);
  const axle = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.016, 0.016, 0.05, 12).rotateZ(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x9a948c, roughness: 0.25, metalness: 1, envMapIntensity: 0.35 }), N * 2);
  units.forEach((u, i) => {
    m4.compose(pos.set(u.x, u.y, 0), q.identity(), one);
    bezel.setMatrixAt(i, m4);
    for (const s of [-1, 1]) {
      m4.compose(pos.set(u.x + s * (CARD_W / 2 + 0.024), u.y, 0), q.identity(), one);
      axle.setMatrixAt(i * 2 + (s > 0 ? 1 : 0), m4);
    }
  });
  bezel.castShadow = bezel.receiveShadow = true;
  axle.castShadow = true;
  scene.add(bezel, axle);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(COLS * PX + 1.2, ROWS * PY + 1.2), new THREE.MeshStandardMaterial({ color: 0x060606, roughness: 0.9 }));
  back.position.z = -0.07;
  back.receiveShadow = true;
  scene.add(back);
  const metal = new THREE.MeshStandardMaterial({ color: 0x24201c, roughness: 0.32, metalness: 0.75, envMapIntensity: 0.25 });
  const bar = (w: number, h: number, x: number, y: number) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.24), metal);
    b.position.set(x, y, 0.06);
    b.castShadow = b.receiveShadow = true;
    scene.add(b);
  };
  const BW = COLS * PX + 0.5, BH = ROWS * PY + 0.5;
  const plate = new THREE.Mesh(new THREE.BoxGeometry(BW, 3 * PY, 0.05), new THREE.MeshStandardMaterial({ color: 0x080707, roughness: 0.62, metalness: 0.15 }));
  plate.position.set(0, uy(MSG_ROW), -0.05);
  plate.receiveShadow = true;
  scene.add(plate);
  bar(BW, 0.14, 0, (uy(LOGO_ROW - 1) + uy(LOGO_ROW)) / 2);
  bar(BW, 0.14, 0, (uy(HERO_ROW) + uy(HERO_ROW + 1)) / 2);
  bar(BW + 0.3, 0.3, 0, BH / 2);
  bar(BW + 0.3, 0.3, 0, -BH / 2);
  bar(0.3, BH, -BW / 2, 0);
  bar(0.3, BH, BW / 2, 0);

  // ─── the wide logo module (cols 5..10 of the logo row)
  const faces = wideFaces(font);
  const wv = halves(WIDE_W);
  const wideMat = () => new THREE.MeshStandardMaterial({ map: faces[0], roughness: 0.55, metalness: 0, alphaTest: 0.5, envMapIntensity: 0.05 });
  const wTop = new THREE.Mesh(wv.top, wideMat());
  const wBot = new THREE.Mesh(wv.bot, wideMat());
  const wLeaf = new THREE.Group();
  const wLF = new THREE.Mesh(wv.leafF, wideMat());
  const wLB = new THREE.Mesh(wv.leafB, wideMat());
  const wEdge = new THREE.Mesh(wv.edge, new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.5 }));
  wLeaf.add(wLF, wLB, wEdge);
  const wide = new THREE.Group();
  wide.add(wTop, wBot, wLeaf);
  for (const s of [-1, 1]) {
    const a = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 12).rotateZ(Math.PI / 2), axle.material);
    a.position.set(s * (WIDE_W / 2 + 0.028), 0, 0);
    wide.add(a);
  }
  const wBezel = new THREE.Mesh(bezelGeo(6 * PX - 0.012, PY - 0.012, WIDE_W + 0.07, 2 * HH + 0.07), bezel.material);
  wide.add(wBezel);
  wide.position.set(0, uy(LOGO_ROW), 0);
  wide.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  scene.add(wide);

  // ─── lights
  scene.add(new THREE.HemisphereLight(0xfff0e0, 0x080604, 0.006));
  const key = new THREE.SpotLight(0xffd8ae, 0, 0, 0.2, 0.7, 2);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  key.shadow.bias = -0.00012;
  key.shadow.normalBias = 0.015;
  key.shadow.camera.near = 2;
  key.shadow.camera.far = 160;
  scene.add(key, key.target);
  const sweep = new THREE.SpotLight(0xfff1dc, 0, 0, 0.12, 0.9, 2);
  scene.add(sweep, sweep.target);
  const rim = new THREE.SpotLight(0xff3b26, 0, 0, 0.28, 0.8, 2);
  scene.add(rim, rim.target);

  // ─── the beam (an additive cone along the key light) and dust in it
  const beamMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uAmt: { value: 0 }, uCol: { value: new THREE.Color(0xffd2a0) } },
    vertexShader: "varying vec3 vN; varying vec3 vV; varying float vY; void main(){ vY = position.y; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
    fragmentShader: "uniform float uAmt; uniform vec3 uCol; varying vec3 vN; varying vec3 vV; varying float vY; void main(){ float f = pow(abs(dot(vN, vV)), 2.5); float along = smoothstep(0.5, 0.2, vY) * smoothstep(-0.5, -0.1, vY); gl_FragColor = vec4(uCol * uAmt * f * along, 1.0); }",
  });
  const beam = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 64, 1, true), beamMat);
  beam.frustumCulled = false;
  scene.add(beam);
  const DN = 6000;
  const dp = new Float32Array(DN * 4);
  for (let i = 0; i < DN; i++) dp.set([(rnd(i * 1.3) - 0.5) * 52, (rnd(i * 2.7) - 0.5) * 34, 0.3 + rnd(i * 4.1) * 34, rnd(i * 5.9)], i * 4);
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.Float32BufferAttribute(dp.filter((_, i) => i % 4 < 3), 3));
  dustGeo.setAttribute("seed", new THREE.Float32BufferAttribute(dp.filter((_, i) => i % 4 === 3), 1));
  const dustMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uT: { value: 0 }, uLP: { value: new THREE.Vector3() }, uLD: { value: new THREE.Vector3(0, 0, -1) }, uCos: { value: 0.9 }, uAmt: { value: 1 }, uPx: { value: H / 1080 } },
    vertexShader: `uniform float uT, uCos, uAmt, uPx; uniform vec3 uLP, uLD; attribute float seed; varying float vA;
void main(){
  vec3 p = position + vec3(sin(uT * 0.31 + seed * 40.0) * 0.4, mod(uT * 0.12 + seed * 9.0, 2.0) - 1.0, cos(uT * 0.23 + seed * 23.0) * 0.4);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float c = dot(normalize(p - uLP), uLD);
  float inBeam = smoothstep(uCos - 0.03, uCos + 0.02, c);
  vA = uAmt * (0.06 + 0.9 * inBeam) * (0.4 + 0.6 * seed);
  gl_PointSize = (1.4 + 3.2 * seed) * uPx * 26.0 / max(0.5, -mv.z);
  gl_Position = projectionMatrix * mv;
}`,
    fragmentShader: "varying float vA; void main(){ vec2 d = gl_PointCoord - 0.5; float a = exp(-dot(d, d) * 14.0); gl_FragColor = vec4(vec3(1.0, 0.86, 0.66) * a * vA, 1.0); }",
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  dust.frustumCulled = false;
  scene.add(dust);

  // ─── post
  const composer = new EffectComposer(gl, { frameBufferType: THREE.HalfFloatType, multisampling: 4 });
  composer.addPass(new RenderPass(scene, camera));
  const dof = new DepthOfFieldEffect(camera, { focusDistance: 10, focusRange: 3, bokehScale: 3, resolutionScale: 0.75 });
  dof.target = new THREE.Vector3();
  composer.addPass(new EffectPass(camera, dof));
  const bloom = new BloomEffect({ mipmapBlur: true, luminanceThreshold: 0.72, luminanceSmoothing: 0.25, intensity: 0.6, radius: 0.72 });
  const vignette = new VignetteEffect({ darkness: 0.62, offset: 0.32 });
  composer.addPass(new EffectPass(camera, bloom, vignette, new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC })));
  const ca = new ChromaticAberrationEffect({ offset: new THREE.Vector2(0.0004, 0.0002), radialModulation: true, modulationOffset: 0.25 });
  const noise = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY, premultiply: false });
  noise.blendMode.opacity.value = 0.22;
  composer.addPass(new EffectPass(camera, ca, noise));
  composer.setSize(W, H);

  // ─── per-frame update
  const setFace = (mesh: THREE.InstancedMesh, i: number, f: Face) => {
    const g = mesh.geometry;
    (g.attributes.aGlyph.array as Float32Array)[i] = f.g;
    const c = PAL[f.card], k = INK[f.ink];
    (g.attributes.aCard.array as Float32Array).set([c.r, c.g, c.b], i * 3);
    (g.attributes.aInk.array as Float32Array).set([k.r, k.g, k.b], i * 3);
  };
  const theta = (p: number) => Math.PI * Math.min(1, p ** 1.7);
  const camAt = (t: number) => {
    const cuts = [-1, ...CAM_CUTS, 1e9];
    let s = 0;
    while (t >= cuts[s + 1]) s++;
    const ks = CAM.filter((k) => k[0] >= cuts[s] - 1e-6 && k[0] < cuts[s + 1] - 1e-6);
    let i = 0;
    while (i < ks.length - 2 && t >= ks[i + 1][0]) i++;
    const k1 = ks[i], k2 = ks[Math.min(i + 1, ks.length - 1)];
    const k0 = ks[Math.max(0, i - 1)], k3 = ks[Math.min(i + 2, ks.length - 1)];
    const span = Math.max(1e-6, k2[0] - k1[0]);
    let u = clamp((t - k1[0]) / span);
    u = k2[0] === 8.6 || k2[0] === 1.15 ? ease.expo(u) : k2[0] === 14.35 ? ease.out(u) : ease.sine(u);
    const cr = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
    const v3 = (j: 1 | 2) => new THREE.Vector3(cr(k0[j][0], k1[j][0], k2[j][0], k3[j][0]), cr(k0[j][1], k1[j][1], k2[j][1], k3[j][1]), cr(k0[j][2], k1[j][2], k2[j][2], k3[j][2]));
    return { pos: v3(1), target: v3(2), fov: lerp(k1[3], k2[3], u) };
  };
  const shakeAt = (t: number) => {
    const f = Math.floor(t * 30);
    let kp = 0;
    for (let k = 17; k < 28; k++) kp = Math.max(kp, hit(t, kick(k), 0.06));
    const amp = 0.3 * hit(t, 0.1, 0.2) + 0.38 * hit(t, DROP, 0.22) + 0.26 * hit(t, FINAL, 0.2) + (t > DROP && t < FINAL ? 0.05 * kp : 0) + (t > 12.6 && t < FINAL ? 0.03 + 0.14 * ramp(t, 12.6, 14.0) : 0) + 0.012;
    return new THREE.Vector3((rnd(f * 1.7) - 0.5) * amp, (rnd(f * 3.1 + 2) - 0.5) * amp, 0);
  };
  const MY = uy(MSG_ROW);
  const kickPulse = (t: number) => {
    let v = 0;
    for (let k = 0; k < 33; k++) v = Math.max(v, hit(t, kick(k), 0.09));
    return v;
  };

  const update = (t: number) => {
    // flaps
    for (let i = 0; i < N; i++) {
      const st = unitState(units[i], t);
      const flipping = st.p < 1;
      setFace(TOP, i, st.b);
      setFace(BOT, i, flipping ? st.a : st.b);
      if (flipping) {
        q.setFromAxisAngle(X, theta(st.p));
        m4.compose(pos.set(units[i].x, units[i].y, 0), q, one);
        setFace(LF, i, st.a);
        setFace(LB, i, st.b);
      } else m4.compose(pos.set(units[i].x, units[i].y, 0), q.identity(), zero);
      LF.setMatrixAt(i, m4);
      LB.setMatrixAt(i, m4);
      EDGE.setMatrixAt(i, m4);
    }
    for (const mesh of [TOP, BOT, LF, LB]) {
      const g = mesh.geometry;
      g.attributes.aGlyph.needsUpdate = true;
      g.attributes.aCard.needsUpdate = true;
      g.attributes.aInk.needsUpdate = true;
    }
    for (const mesh of [LF, LB, EDGE]) mesh.instanceMatrix.needsUpdate = true;
    // the wide module
    const ws = prog.wideState(t);
    const wf = ws.p < 1;
    (wTop.material as THREE.MeshStandardMaterial).map = faces[ws.b];
    (wBot.material as THREE.MeshStandardMaterial).map = faces[wf ? ws.a : ws.b];
    (wLF.material as THREE.MeshStandardMaterial).map = faces[ws.a];
    (wLB.material as THREE.MeshStandardMaterial).map = faces[ws.b];
    wLeaf.visible = wf;
    wLeaf.rotation.x = theta(ws.p);

    // camera
    const k = camAt(t);
    const sh = shakeAt(t);
    camera.position.copy(k.pos).add(sh);
    camera.up.set(0, 1, 0);
    camera.lookAt(k.target.clone().add(sh.multiplyScalar(0.4)));
    camera.fov = k.fov;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
    dof.target!.copy(k.target);

    dof.cocMaterial.focusRange = t < 0.6 ? 2 : t < 2.1 ? 14 : t < 6.1 ? 1.3 : t < DROP ? lerp(3, 10, ramp(t, 6.1, 7.5)) : t < FINAL ? 14 : 5;
    dof.bokehScale = t < 2.1 ? 2.4 : t < 6.1 ? 4.2 : t < DROP ? 3 : t < FINAL ? 2.2 : 2.6;

    // lights: the whole board on the hook → a pool on the panel (STARTS IN / 24 HOURS) → the board again → the final pool
    const kTarget = new THREE.Vector3();
    const kPos = new THREE.Vector3();
    let kAngle = 0.6, kI = 0;
    const kp = kickPulse(t);
    const BOARD_POS = new THREE.Vector3(-30, 26, 52), BOARD_T = new THREE.Vector3(0, -0.5, 0);
    const PANEL_POS = new THREE.Vector3(-12, 5, 22), PANEL_T = new THREE.Vector3(0, MY - 0.8, 0);
    if (t < 2.1) {
      kPos.copy(BOARD_POS);
      kTarget.copy(BOARD_T);
      kAngle = 0.6;
      kI = 7600 * (1 + 1.3 * hit(t, 0.1, 0.35)) * (0.9 + 0.2 * kp) * ramp(t, 0.0, 0.1);
    } else if (t < 6.1) {
      kPos.copy(PANEL_POS);
      kTarget.copy(PANEL_T);
      kAngle = 0.34;
      kI = 2700 * (0.92 + 0.16 * kp);
    } else if (t < 7.56) {
      const a = ease.in(ramp(t, 6.1, 7.5));
      kPos.lerpVectors(PANEL_POS, BOARD_POS, a);
      kTarget.lerpVectors(PANEL_T, BOARD_T, a);
      kAngle = lerp(0.34, 0.6, a);
      kI = lerp(2700, 8200, a) * (0.9 + 0.2 * kp);
    } else if (t < DROP) {
      kPos.copy(BOARD_POS);
      kTarget.copy(BOARD_T);
      kAngle = 0.6;
      kI = 1500;
    } else if (t < FINAL) {
      kPos.copy(BOARD_POS);
      kTarget.copy(BOARD_T);
      kAngle = 0.6;
      kI = 8200 * (1 + 1.2 * hit(t, DROP, 0.35)) * (0.82 + 0.3 * kp);
    } else {
      kTarget.set(0, MY, 0);
      kPos.set(-8, MY + 7, 28);
      kAngle = 0.22;
      kI = 3300 * (1 + 0.7 * hit(t, FINAL, 0.3));
      key.penumbra = 0.95;
    }
    if (t < FINAL) key.penumbra = 0.7;
    key.position.copy(kPos);
    key.target.position.copy(kTarget);
    key.angle = kAngle;
    key.intensity = kI;
    key.target.updateMatrixWorld();
    // the sweep: a narrow light crossing the board on the board-phase and across the logo on the ring-out
    const sw1 = ramp(t, 10.1, 12.1), sw2 = ramp(t, 14.5, 16.2);
    if (sw1 > 0 && sw1 < 1) {
      sweep.position.set(lerp(-46, 46, sw1), 18, 30);
      sweep.target.position.set(lerp(-20, 20, sw1), 3, 0);
      sweep.angle = 0.14;
      sweep.intensity = 5200 * Math.sin(Math.PI * sw1);
    } else if (sw2 > 0 && sw2 < 1) {
      sweep.position.set(lerp(-16, 16, ease.io(sw2)), uy(LOGO_ROW) + 9, 18);
      sweep.target.position.set(lerp(-5, 5, ease.io(sw2)), uy(LOGO_ROW), 0);
      sweep.angle = 0.06;
      sweep.intensity = 2600 * Math.sin(Math.PI * sw2);
    } else sweep.intensity = 0;
    sweep.target.updateMatrixWorld();
    // red rim from below on the final hit
    rim.position.set(2, uy(HERO_ROW) - 16, 8);
    rim.target.position.set(0, uy(HERO_ROW) - 0.8, 0);
    rim.angle = 0.32;
    rim.intensity = t >= FINAL ? 900 * (0.55 + 0.45 * hit(t, FINAL, 0.5)) * ramp(t, FINAL, FINAL + 0.05) : t >= DROP && t < DROP + 0.6 ? 900 * hit(t, DROP, 0.25) : 0;
    rim.target.updateMatrixWorld();
    // the beam follows the key
    const dir = kTarget.clone().sub(kPos);
    const L = dir.length();
    dir.normalize();
    beam.position.copy(kPos).addScaledVector(dir, L * 0.5);
    beam.scale.set(L * Math.tan(kAngle) * 1.05, L, L * Math.tan(kAngle) * 1.05);
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
    beamMat.uniforms.uAmt.value = (t < DROP ? 0.05 : 0.025) * clamp(kI / 3000, 0.25, 1.4);
    const du = dustMat.uniforms;
    du.uT.value = t;
    du.uLP.value.copy(kPos);
    du.uLD.value.copy(dir);
    du.uCos.value = Math.cos(kAngle);
    du.uAmt.value = t < DROP ? 1 : 0.6;

    // grade
    bloom.intensity = 0.55 + 0.6 * hit(t, DROP, 0.3) + 0.4 * hit(t, FINAL, 0.3);
    ca.offset.set(0.0004 + 0.003 * hit(t, DROP, 0.12) + 0.002 * hit(t, FINAL, 0.12), 0.0002);
  };
  if (dbg.includes("noenv")) scene.environment = null;
  const render = () => {
    if (dbg.includes("nokey")) key.intensity = 0;
    if (dbg.includes("nobeam")) beam.visible = false;
    if (dbg.includes("nodust")) dust.visible = false;
    if (dbg.includes("nopost")) gl.render(scene, camera);
    else composer.render();
  };
  return { update, render, units };
}
export { P_BLACK, P_CREAM, P_GREY, P_RED };
