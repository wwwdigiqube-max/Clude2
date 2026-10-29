# Golden Story — image prompts (the ones the example film was made with)

Model used: Google **Nano Banana 2** (via Cloudinary `generate-image` / any image tool that takes a reference image).
Order matters: make the **character sheet first**, then make every scene **with the sheet (or an earlier scene) as the
reference image**, so the face, clothes, palette and drawing style stay identical across shots.
Scenes: 9:16, ~1K is enough — upscale ×4 afterwards (e.g. Cloudinary `e_upscale`) and resize to 2160 px wide.
Never put text in the images (the code draws all text, numbers and UI).

## Style base (append to every prompt)
Flat vector illustration, no outlines, subtle paper grain, palette of amber, burnt orange, ochre, terracotta, cream and
deep chocolate-brown shadows, golden-hour low sun, long warm shadows. No text, no letters, no watermark.

## 1 · Character sheet (16:9, 2K, no reference)
Character design sheet for a flat vector animated story. [style base]. Plain warm cream background. Show the same
character three times side by side: front view, three-quarter view, side view, full body, standing. Character: Ellie,
a woman in her early 30s, simple stylized flat character with small dot eyes, small nose, calm determined expression,
auburn copper hair tied in a low ponytail, mustard-yellow canvas work jacket over a cream shirt, dark brown jeans, tan
leather work boots, brown leather work gloves. Next to her: her farm dog, a medium tan-and-white shepherd mix with
pointed ears and white chest, sitting, front and side view. Consistent proportions, modern minimal style like a premium
explainer animation.

## 2 · Scenes (9:16, reference = the character sheet or the kitchen scene)
- **s01_kitchen** — Using the exact character design, flat vector style and warm palette of reference [1] (Ellie and
  her dog): interior of a rustic farmhouse kitchen in late afternoon, golden sunlight streaming through a window. Ellie
  stands at a deep sink filling large clear plastic water jugs, filled jugs and buckets on the wooden floor, her dog sits
  by her feet looking up. Calm empty area in the lower third.
- **s02_well** (reference = s01) — no people: a small weathered wooden pump house next to a round stone well, an
  electric pump with a thick black cable up to a wooden utility pole with power lines toward a farmhouse in the
  background, a metal pipe to the house, golden wheat fields, low sun. Keep the upper third as calm sky.
- **s03_generator** — inside a dark wooden barn, sliding door half open, a wedge of golden sunlight with floating dust;
  Ellie pulls a canvas tarp off a red-orange portable gasoline generator, a jerry can beside it.
- **s04_animals** — tall farmyard in front of a red barn, no people: top a brown horse by a fence, middle five cows in a
  pen, below many hens pecking, bottom foreground the dog barking with its mouth wide open.
- **s05_gate** — close-up at sunset: Ellie's gloved hands wrap a heavy steel chain around a wooden gate post and snap a
  brass padlock shut, her face partly visible, a dirt road to a dark treeline under a red-orange sky.
- **s06_porch** — farmhouse porch just after sunset, sky orange to dusky plum, Ellie on the steps with her dog, a
  glowing kerosene lantern, water jugs and supply crates behind, looking at a dark barn in the distance.
- **s07_barn_inside** (reference = s01, darker) — night: view from deep inside a dark barn through the gap of the door,
  in the foreground the silhouette of a person standing still, seen from behind, a thin blood-orange rim light; far away
  the farmhouse with one glowing window. Mostly near-black and chocolate shadows.

## Adapting to a new story
Write one scene per beat of the narration (6–8 images is plenty — the camera moves inside each picture and code adds
maps, diagrams, counters and cards). Keep the style base and the reference image; change only the scene sentence.
