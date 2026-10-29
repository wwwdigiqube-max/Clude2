// Post chain for video 18: sanitize -> bloom -> tone map -> grade (exposure, contrast, saturation, cool tint, vignette,
// fade to black, fine grain). Half-float buffers: additive light dots go far above 1.0 in dense clusters.
import { BlendFunction, BloomEffect, Effect, EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import * as THREE from "three";

class SanitizeEffect extends Effect {
  constructor() {
    super("Sanitize18", `void mainImage(const in vec4 c, const in vec2 uv, out vec4 o){ vec3 x = c.rgb; bool bad = any(isnan(x)) || any(isinf(x)); o = vec4(bad ? vec3(0.0) : min(x, vec3(40.0)), 1.0); }`, { blendFunction: BlendFunction.SET });
  }
}
class GradeEffect extends Effect {
  constructor() {
    super(
      "Grade18",
      /* glsl */ `uniform float exposure, contrast, sat, vig, black, grain, seed, cool, lift;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + seed) * 43758.5453); }
      void mainImage(const in vec4 c, const in vec2 uv, out vec4 o){
        vec3 x = c.rgb * exposure;
        x = max(x - lift, 0.0) / (1.0 - lift);
        x = (x - 0.5) * contrast + 0.5;
        float l = dot(x, vec3(0.2126, 0.7152, 0.0722));
        x = mix(vec3(l), x, sat);
        x *= vec3(1.0 - 0.03*cool, 1.0, 1.0 + 0.05*cool);
        vec2 d = uv - 0.5; d.x *= 1.25;
        x *= 1.0 - vig * smoothstep(0.3, 0.85, length(d));
        x += (h(uv * 1000.0) - 0.5) * grain;
        x = mix(x, vec3(0.0), black);
        o = vec4(clamp(x, 0.0, 1.0), 1.0);
      }`,
      {
        blendFunction: BlendFunction.SET,
        uniforms: new Map<string, THREE.Uniform>(
          [["exposure", 1], ["contrast", 1.05], ["sat", 0.9], ["vig", 0.35], ["black", 0], ["grain", 0.012], ["seed", 0], ["cool", 1], ["lift", 0.0]].map(([k, v]) => [k as string, new THREE.Uniform(v)]),
        ),
      },
    );
  }
  set(k: string, v: number) {
    this.uniforms.get(k)!.value = v;
  }
}

export type Post = ReturnType<typeof makePost>;

export function makePost(gl: THREE.WebGLRenderer, scene: THREE.Scene, cam: THREE.PerspectiveCamera, w: number, h: number) {
  gl.outputColorSpace = THREE.SRGBColorSpace;
  gl.toneMapping = THREE.NoToneMapping;
  const composer = new EffectComposer(gl, { frameBufferType: THREE.HalfFloatType, multisampling: 0 });
  composer.addPass(new RenderPass(scene, cam));
  const bloom = new BloomEffect({ mipmapBlur: true, luminanceThreshold: 0.72, luminanceSmoothing: 0.3, intensity: 0.75, radius: 0.62 });
  const grade = new GradeEffect();
  composer.addPass(new EffectPass(cam, new SanitizeEffect()));
  composer.addPass(new EffectPass(cam, bloom, new ToneMappingEffect({ mode: ToneMappingMode.AGX }), grade));
  composer.setSize(w, h);
  return { composer, bloom, grade, render: () => composer.render(), dispose: () => composer.dispose() };
}
