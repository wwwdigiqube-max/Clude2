// Art Motion · the runtime: loads the vendored huashu-art-motion engine (MIT, public/styles/art-motion/engine/) into
// the page exactly as its own HTML does — plain scripts that hang globals on window (U, KIT, PAINT, BRUSH, RENDER,
// POST, CAM, TYPO, CH, UI, …, TRANSITIONS, SCENES, CLIPS) — then lets React draw any scene / clip / transition at
// any time t. Everything the engine draws is a pure function of t (seeded randomness), so Remotion can render it
// frame by frame, in any order, on any number of workers.
//
// Persian: the engine's CJK text families (PuHui-*, NotoSansSC, NotoSerifSC, LXGWWenKai) are re-pointed at Persian
// OFL fonts, and every Latin family gets an Arabic-script face (unicode-range) — so Persian text in any grammar /
// label renders in Vazirmatn (or Nastaliq for the art labels) without touching the engine code.
import { staticFile } from "remotion";

type AnyRec = Record<string, any>;
const W_ = () => window as unknown as AnyRec;

export const ENGINE_DIR = "styles/art-motion/engine";
const url = (p: string) => staticFile(`${ENGINE_DIR}/${p}`);

/** load order = the engine's own index.html / clip.html (minus the Huashu character rig, which is not MIT-licensed art) */
const LIBS = [
  "lib/util.js", "lib/paint.js", "lib/brush.js", "lib/render.js", "lib/post.js", "lib/rig.js", "lib/kit.js", "lib/motion.js",
  "lib/camera.js", "lib/diagram.js", "lib/typo.js", "lib/chart.js", "lib/palettes.js", "lib/ui.js", "lib/collage.js", "lib/media.js", "lib/toon.js", "lib/fa.js",
  "transitions.js",
];

const evalScript = async (path: string) => {
  const res = await fetch(url(path));
  if (!res.ok) throw new Error(`art-motion: ${path} (HTTP ${res.status})`);
  const src = await res.text();
  // indirect eval = global scope, exactly like a <script> tag
  (0, eval)(`${src}\n//# sourceURL=art-motion/${path}`);
};

// ---------------- fonts ----------------
const FA = { // Persian OFL fonts in public/fonts (shipped with the kit)
  regular: "fonts/Vazirmatn-Regular.ttf",
  semibold: "fonts/Vazirmatn-SemiBold.ttf",
  bold: "fonts/Vazirmatn-Bold.ttf",
  black: "fonts/Vazirmatn-Black.ttf",
  naskh: "fonts/NotoNaskhArabic.ttf",
  nastaliq: "fonts/NotoNastaliqUrdu.ttf",
};
const ARABIC = "U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F, U+066B-066C";
/** CJK families of the engine → Persian files (all weights the engine asks for) */
const CJK_TO_FA: Record<string, [string, string][]> = {
  "PuHui-Medium": [["500", FA.semibold]],
  "PuHui-Bold": [["700", FA.bold]],
  "PuHui-Heavy": [["800", FA.black]],
  "PuHui-Black": [["900", FA.black]],
  NotoSansSC: [["100 450", FA.regular], ["451 650", FA.semibold], ["651 799", FA.bold], ["800 900", FA.black]],
  NotoSerifSC: [["200 900", FA.naskh]],
  "LXGWWenKai-500": [["500", FA.nastaliq]],
  "NotoSerifJP-600": [["600", FA.naskh]], // unused by the shipped scenes; kept so FONT_FACES stays complete
};
const weightOf = (family: string) => {
  const m = /-(\d00)i?$/.exec(family);
  const w = m ? +m[1] : 400;
  return w >= 800 ? FA.black : w >= 700 ? FA.bold : w >= 500 ? FA.semibold : FA.regular;
};

let fontsP: Promise<void> | null = null;
const loadFonts = () =>
  (fontsP ??= (async () => {
    await evalScript("lib/fonts.js");
    const faces = W_().FONT_FACES as { family: string; url: string; desc?: AnyRec }[];
    const out: { family: string; url: string; desc?: AnyRec }[] = [];
    for (const f of faces) {
      if (CJK_TO_FA[f.family]) {
        for (const [weight, file] of CJK_TO_FA[f.family]) out.push({ family: f.family, url: staticFile(file), desc: { weight } });
        continue;
      }
      out.push({ ...f, url: url(f.url) });
      // Persian glyphs inside any Latin family → Vazirmatn of a matching weight
      out.push({ family: f.family, url: staticFile(f.desc?.weight ? FA.semibold : weightOf(f.family)), desc: { ...(f.desc ?? {}), unicodeRange: ARABIC } });
    }
    // the engine's glyph checker reads one cmap per family: keep the first (main) face of each
    const seen = new Set<string>();
    W_().FONT_FACES = out.filter((f) => !f.desc?.unicodeRange && !seen.has(f.family) && seen.add(f.family));
    await Promise.all(
      out.map(async (f) => {
        const ff = new FontFace(f.family, `url(${f.url})`, f.desc ?? {});
        await ff.load();
        document.fonts.add(ff);
      }),
    );
    await document.fonts.ready;
  })());

// ---------------- engine ----------------
let libsP: Promise<void> | null = null;
/** U.setStage size the libraries were last laid out for */
let stage = "";
export const loadEngine = (w = 1920, h = 1080) =>
  (libsP ??= (async () => {
    W_().SCENES ??= {};
    W_().SIGNATURE ??= "NFP"; // the flat-illustration scene signs its picture
    W_().CLIPS ??= {};
    W_().TRANSITIONS ??= {};
    await loadFonts();
    for (const p of LIBS) await evalScript(p);
    await W_().U.loadCmaps();
    patchEngine();
  })()).then(() => setStage(w, h));

export const setStage = (w: number, h: number) => {
  const k = `${w}x${h}`;
  if (k === stage) return;
  W_().U.setStage(w, h);
  stage = k;
};

const sceneP: Record<string, Promise<void>> = {};
const IMG: AnyRec = {};
/** load scenes/<id>.js once and run its init */
export const loadScene = (id: string) =>
  (sceneP[id] ??= (async () => {
    if (!W_().SCENES[id]) await evalScript(`scenes/${id}.js`);
    const sc = W_().SCENES[id];
    if (!sc || typeof sc.draw !== "function") throw new Error(`art-motion: scenes/${id}.js did not register SCENES['${id}']`);
    if (sc.init) await sc.init(IMG);
  })());

const clipP: Record<string, Promise<void>> = {};
export const loadGrammar = (g: string) => (clipP[g] ??= W_().CLIPS[g] ? Promise.resolve() : evalScript(`clips/${g}.js`));

export const engine = () => W_() as AnyRec;
export const SCENE_IMG = IMG;

// ---------------- Persian art labels ----------------
// Several scenes print their own style name (KIT.label) in Chinese. Options (set before drawing):
//   ART.labels = 'fa'  → the Persian name in Nastaliq (default) · 'off' → no label (our layouts print their own placard) · 'source' → as shipped
export const ART = { labels: "fa" as "fa" | "off" | "source" };
const LABEL_FA: Record<string, [string, string]> = {
  水墨写意: ["آب‌مرکب", "نقاشی چینی · بادا شانرن"],
  金色时期: ["دوره‌ی طلایی", "گوستاو کلیمت · ۱۹۰۷"],
  表现主义: ["اکسپرسیونیسم", "ادوارد مونک · ۱۸۹۳"],
  敦煌壁画: ["دیوارنگاره‌ی دون‌هوانگ", "غارهای موگائو"],
  无限波点: ["خال‌های بی‌پایان", "یایوی کوساما · ۱۹۶۵"],
};
function patchEngine() {
  const K = W_().KIT;
  if (!K || K.__faPatched) return;
  const orig = K.label;
  K.label = (c: CanvasRenderingContext2D, o: AnyRec) => {
    if (ART.labels === "off") return;
    if (ART.labels === "fa" && LABEL_FA[o.title]) {
      const [t, s] = LABEL_FA[o.title];
      // Persian must not be letter-spaced (it breaks the joins); Nastaliq for the title, Vazirmatn for the line under it
      const swap = (font: string | undefined, fam: string) => (font ? font.replace(/"[^"]+"/, `"${fam}"`) : font);
      return orig(c, { ...o, title: t, sub: s, spacing: 0, tFont: swap(o.tFont, "LXGWWenKai-500"), sFont: swap(o.sFont, "PuHui-Bold") });
    }
    return orig(c, o);
  };
  K.__faPatched = true;
}
