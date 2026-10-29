> **Template (from the example film).** For your own film keep the code contract, the loop and the engine rules; replace the story, the timeline values and the reference section with yours (the example reference files under `videos/03/ref/` are not shipped — extract your own stills, or delete that section).

# Brief for the V03 style builders — «ذهنی که آروم نمی‌گیره» (a mind that won't calm down)

## What the user wants (read twice)
- Three versions of ONE short reel, each a **moving painting in a famous painting style**: Munch expressionism,
  Rembrandt chiaroscuro, Renaissance sfumato. Same content, same purpose, same timing as the reference reel
  (`videos/03/ref/ref.mp4`, 17.6 s, vertical) — set to the reference's own song (already muxed by the main session).
- **The character must look like the reference character but not be a copy**, and each style gets its own version of
  him, painted the way that painter would paint him.
- Above all: **beauty.** The viewer should *enjoy looking at it*: museum-grade painterly richness, gorgeous light and
  colour, living texture, a thought-swirl that is itself beautiful, motion that breathes with the music.
  Bar: "would someone stop scrolling just to look at this painting move?"

## The reference (look at it first — Read these images)
- `videos/03/ref/keys.jpg` — 8 stills at 0.3, 2.5, 5.5, 6.2, 8.0, 11.0, 14.3, 16.5 s
- `videos/03/ref/sheet2fps.jpg` — the whole reel at 2 fps (10 per row: row 1 = 0–4.5 s …)
- `videos/03/ref/timing.jpg` — top: 5.4–6.4 s at 10 fps (the cut) · bottom: 13.2–15.6 s at 5 fps (the release)
**Story:** a slim, grey, hairless figure with an egg-shaped head and big pale glowing eyes (no pupils, dark sockets,
tiny mouth) sits hunched on the edge of a bed in a dark bedroom at night. White scribbled loops — racing thoughts —
appear above its head and grow into a dense whirling halo (overthinking / anxiety). Cut to a close-up: it clutches its
head with both hands, eyes squeezed shut, the storm peaks (teeth clenched, brows knotted), then eases; the hands slide
down to the chest, the eyes open wide, the swirl shrinks and small ring-shaped thoughts drift away. No text.

## Timeline (exact — read it from `window.U03` in your scene, never retype numbers)
| key | value | what happens |
|---|---|---|
| `U03.swirlStart` | 0.45 | first thought-strand appears above the head; then the swirl grows until the cut |
| `U03.eyesWide` | 4.2 | eyes widen (alarm) in the wide shot |
| `U03.TR_START` / `CUT` / `TR_DUR` | 5.87 / 6.067 / 0.45 | your style's signature transition (engine, automatic) wide → close |
| `U03.handsUp` | [6.2, 6.65] | close-up: both hands rise and clutch the head |
| `U03.squeeze` | 6.6 | eyes squeezed shut |
| `U03.slits` | [7.0, 9.6] | pained, half-open glowing slits |
| `U03.peak` | [10.0, 12.5] | the storm at its height: knotted brows, clenched teeth, trembling; swirl fastest/densest |
| `U03.ease` | [12.6, 14.0] | relaxing, eyes closed |
| `U03.handsDown` | [14.1, 14.6] | hands slide down to the chest |
| `U03.eyesOpen` | 14.7 | eyes open wide, small "o" mouth — quiet, a little lost |
| `U03.fade` | [14.7, 17.6] | the swirl shrinks and thins; rings drift away; calm returns |
| `U03.rings` | [6.5, 17.6] | small ring-thoughts orbit the head in the close-up |
| `U03.hits` | [7.5, 10.5, 13.0] | strongest music hits (13.0 biggest) → visible accents |
| `U03.bars` | 0.44 1.80 3.15 4.51 5.87 7.24 8.62 9.98 11.32 12.68 14.00 15.34 16.69 | downbeats → gentle pulses |
Music: instrumental, 176 BPM (bar ≈ 1.36 s).

## Code contract (Art Motion engine, NFP kit v2)
- Your ONLY file: `public/styles/art-motion/engine/scenes/u03_<style>.js` (it holds a placeholder — replace it).
  It must register **two** scenes in one IIFE (shared helpers inside):
  ```js
  (() => { /* shared character + painting helpers */
    SCENES['u03_<style>']       = { draw(c, lt, t) { /* WIDE shot, used 0 → 6.32 s */ } };
    SCENES['u03_<style>_close'] = { draw(c, lt, t) { /* CLOSE-UP, used 5.87 → 17.6 s */ } };
  })();
  ```
  `t` = film seconds (use it with `U03`), `lt` = seconds since that segment started. Draw the WHOLE frame every call.
- **Portrait stage:** `const { W, H } = STAGE;` → 1080 × 1920. The vertical frame is native — compose for it.
  Keep faces and key action between y ≈ 250 and y ≈ 1500 (top ~150 and bottom ~330 px are covered by Instagram UI);
  the swirl may rise into the upper area.
- Engine globals you can use (plain scripts on `window`): `U` (clamp, lerp, ease, rng(seed), …), `P`/`PAINT`
  (scratch canvases, noise/fbm, texture, grain, craquelure, flowSeeds/flowLines, impasto, inkWash, watercolor,
  lightMap/applyLight/litClip/castShadow/pool, glowStroke, film, vignette, bloom, gateWeave …), `KIT` (warpRows,
  warpCols, …), `CAM` (apply, pushTo, drift, motionBlur …), `RIG` (ik2, limb, stretch …). Read the libs you use in
  `public/styles/art-motion/engine/lib/` (they are short) — **and study your style's original scene file first**:
  it is the best example of that painter's language in this engine (see your group below). Copy its palette and its
  techniques; then paint *our* room and *our* character with them.
- **Do not edit** any other file: engine libs, original scenes, `transitions.js`, `src/v03/Video.tsx`, `src/Root.tsx`.
- Every frame must be a **pure function of t**: no `Math.random`, no Date, no state carried between frames
  (`U.rng(seed)` / `P.boilSeed(t, fps)` for hand-made boil). Scratch canvases (`P.scratch(name)`) need unique names:
  prefix them `u03<style>_`.
- Performance: aim ≤ 150 ms per frame at 1080×1920.

## Your loop (iterate; look every time)
PowerShell, from `your project folder` (refresh PATH in every command):
```
$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
npx.cmd remotion render V03-<Style>-Look out/work-<style>/look --sequence --image-format=jpeg --scale=0.5 --concurrency=4 --log=error
ffmpeg -v error -y -start_number 0 -i out/work-<style>/look/element-%02d.jpeg -vf "scale=270:-1,tile=8x2" -frames:v 1 out/work-<style>/sheet.jpg
npx.cmd remotion render V03-<Style>-Silent out/work-<style>/clip.mp4 --scale=0.5 --concurrency=4 --log=error
ffmpeg -v error -y -i out/work-<style>/clip.mp4 -vf "fps=4,scale=150:-1,tile=10x7" -frames:v 1 out/work-<style>/motion.jpg
npx.cmd remotion still V03-<Style>-Look out/work-<style>/full_<n>.jpg --frame=<n> --scale=1 --log=error
```
(`<Style>` = Munch / Rembrandt / Renaissance, `<style>` = munch / rembrandt / renaissance.) The Look frames are the
16 times 0.3 1.5 3.0 4.6 5.7 6.05 6.5 7.6 9.0 10.8 12.0 13.2 14.35 15.0 16.2 17.4 s — compare them with the reference.
Do at least 4 rounds. Judge the final look on several **full-size** stills: texture, light, the face, the hands.
**Disk is tight (~3 GB free):** after every render run
`Get-ChildItem $env:TEMP -Directory -Filter 'puppeteer_dev_chrome_profile-*' | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue`
and keep only your latest stills/clip in `out/work-<style>/`.

## Report back (short)
1. What your two shots show and how the character looks. 2. What makes it beautiful (the 3–4 strongest choices).
3. ms per frame. 4. Anything weak or unfinished.
