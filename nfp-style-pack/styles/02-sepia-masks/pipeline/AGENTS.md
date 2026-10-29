> **Template (from the example film).** For your own film keep the code contract, the loop and the supervision rules; replace the story, the dialogue lines, the scene list and the reference section with yours (the example reference files under `videos/02/ref/` are not shipped — extract your own stills, or delete that section).

# Brief for the V02 scene builders — «بازی» (The Game)

## The film
A **vertical reel, 1080×1920, 24 fps, 34.4 s**, Remotion (React + SVG, all drawn in code — no generated images).
It is our own remake of a short surreal animation the user gave as reference (`videos/02/ref/ref.mp4`): three masked
figures in a vast, foggy, theatrical space talk about a game — "do you want to win, or not to lose?" — and the quiet one
turns out to be something bigger. **The sound is the main attraction**; the picture must sit perfectly on the dialogue.
Keep the reference's staging, camera rhythm and mood. **Change** the look: our palette, our characters, our props.

Reference frames (look at the ones for your scenes before you start — use the Read tool on the images):
- `videos/02/ref/sheet2fps.jpg` — the whole reference at 2 fps (10 per row, row 1 = 0–4.5 s, row 2 = 5–9.5 s, …)
- `videos/02/ref/k_00..k_15.jpg` — stills at 0.3, 1.5, 2.6, 4.2, 6.5, 9.5, 13.5, 16.2, 17.2, 19.5, 21.0, 22.0, 23.2, 24.5, 26.0, 28.6 s (reference times)
- `videos/02/ref/detail1.jpg` (0.05, 5.0, 11.0, 19.0 s) and `detail2.jpg` (21.2, 22.8, 26.5, 28.9 s), 540 px wide each
Reference timeline (its times, not ours): mask close-up 0–3.3 · vast room with a slumped figure 3.3–8.2 · two players at a
table under a giant eye 8.2–15.4 · two masks side by side 15.4–17.6 · black 17.6–18.4 · a giant six-pointed-star creature with
cards flying 18.4–24.3 (**we replace the star with an HOURGLASS body — do not draw a star**) · black 24.3–25.3 · clawed hands
reaching into a triangle of light 25.3–28.8 · TV static.
**Do not copy the reference's watermark, its exact character designs, its eye-in-a-shaft or its pyramids. Our versions are below.**

## Look (non-negotiable)
- **Sepia old horror film.** Colours only from `P` in `src/v02/theme.ts`: `bone` (masks, light cores), `boneShade`, `amber`,
  `amberHi` (light), `sepia` / `fog` / `floor` (atmosphere, surfaces), `ink` (silhouettes, outlines, darkness). The one accent is
  `ember` / `emberHot` — glowing eyes, hourglass sand, danger. No other hues, no pure white, no pure black backgrounds
  (use `ink`). The shell already lays a sepia unifier, vignette, grain, dust, scratches and flicker on top — don't add your own.
- **Paper-cut theatre look:** flat silhouettes and simple shapes, depth from layered fog, light cones (`LightCone`), glows
  (`Glow`), floating motes (`Motes`), long cast shadows, perspective floors. Hand-made "boil": use `boil(f, seed, amp)`
  (changes every 2 frames → 12 fps feel) on outlines/limbs so nothing looks vector-perfect.
- **Nothing is ever static.** Every shot: a slow camera move (push / drift / tilt — apply a transform to your scene layer),
  at least one living element (fog drift, motes, breathing, twitching fingers, flicker of a lamp), and a visible reaction on the
  key words (a head turn, a lean, a light change, a camera bump). Movements arrive fast and settle soft (ease-out);
  nothing stops dead.
- **Characters** (shared, in `src/v02/chars.tsx` — use them, don't redraw the masks):
  - `A` = the anxious one: `<Mask kind="A" expr="worried|alarmed|annoyed|closed" …>`
  - `B` = the bored one: `<Mask kind="B" expr="bored|smirk|closed" …>`
  - `C` = the quiet one / storyteller: `<Mask kind="C" expr="closed|awake" glow={0..1} …>` (ember eyes when awake)
  - Bodies are thin ink silhouettes: `Torso`, `Arm` (long spidery fingers), or your own ink shapes. Small heads-on-sticks
    proportions like the reference (long thin limbs, narrow torsos).
  - Props: `mouth={mouth("A", t)}` etc. (from `cues.ts`) on whoever is speaking and visible — **every visible speaker must
    lip-sync**. `squash`/`tilt` for reactions, `lit` for shadowed masks. `f` = the frame number (for the boil).
- **Layout:** subtitles are drawn by the shell at **y 1290–1450** (centre). Keep faces and key action out of that band.
  Below y ≈ 1550 Instagram covers the frame — background only. Top ~150 px: no key elements.
- Persian text in the picture: avoid it (the subtitles carry the words). If you must, font `F_TEXT`, `direction: rtl`.

## Dialogue (already recorded — `src/v02/vo.json`; timings below are OURS)
| line | who | text | starts |
|---|---|---|---|
| 1 | A | چرا هیچی نمی‌گی؟ … الو؟ … اصلاً اینجایی؟ | 0.25 (الو 1.71, اصلاً 2.41) |
| 2 | B | ولش کن بابا… فکر کنم خوابش برده. | 3.45 (فکر 5.05, خوابش 5.54) |
| 3 | C | چی بگم؟ | 7.33 |
| 4 | C | هر دوتون حرف حساب زدین؛ منم دیگه حرفی نداشتم. | 8.78 (منم 10.73) |
| 5 | C | خب، کدومش؟ بُردن… یا نباختن؟ | 12.31 (کدومش 13.07, بُردن 14.16, نباختن 15.66) |
| 6 | A | بُردن! | 16.64 |
| 7 | B | نباختن. | 18.27 |
| 8 | C | فرقی نمی‌کنه. | 19.55 |
| 9 | C | توی بازی‌ای که قانوناش هر لحظه عوض می‌شه، چطوری می‌خواین ببرین؟ | 21.07 (قانوناش 21.96, عوض 23.12, چطوری 24.28) |
| 10 | C | اونم وقتی قانون‌ها رو یکی دیگه می‌نویسه… هوم؟ | 25.69 (قانون‌ها 26.73, یکی 27.50, می‌نویسه 28.20, هوم 29.25) |
| 11 | C | حالا… بذارین یه قصه براتون تعریف کنم. | 30.79 (بذارین 31.75, قصه 32.39, کنم 33.26) |
**Never type these numbers in code** — use `S(n)`, `E(n)`, `W(line, "word")`, `WE(line, "word")` from `cues.ts`
(e.g. `W(1, "الو")`, `W(9, "عوض")`). Scene starts are `SC.<id>`; your scene also receives `lt` (local time) and `dur`.

## Scenes (cut points in `SC`, `src/v02/cues.ts`)
| id | from–to (s) | group |
|---|---|---|
| maskA | 0.00–3.55 | A |
| room | 3.55–8.73 | A |
| table | 8.73–16.58 | B |
| twoMasks | 16.58–19.62 | B |
| black1 | 19.62–20.69 | B |
| hourglass | 20.69–25.71 | C |
| hourglassClose | 25.71–28.95 | C |
| black2 | 28.95–29.69 | C |
| hands | 29.69–33.80 | C |
| static | 33.80–34.42 | C |

## Code contract
- Shared files — **read, never edit**: `src/v02/theme.ts`, `cues.ts`, `fx.tsx`, `chars.tsx`, `frame.tsx`, `devroot.tsx`,
  `Video.tsx`, `vo.json`, `mouth.json`, `captions.json`, `src/Root.tsx`.
- Your scene file: `src/v02/scenesA.tsx` / `scenesB.tsx` / `scenesC.tsx` (it currently holds a placeholder — replace it).
  Keep the export names (`SceneMaskA`, …) and the props type `SceneProps` (`{ t, lt, f, dur }`, import it from `./frame`).
  Extra files you need: create them, prefixed with your letter (`src/v02/a-room.tsx`, …).
- Every frame is a **pure function of time**: no `Math.random`, no `Date`, no state, no timers. Use `rnd(i)`, `boil`, `drift`.
- `<Img>` needs `maxWidth: "none"` (tailwind preflight caps images). Prefer SVG; give every SVG `<defs>` id a unique,
  group-prefixed name (`a-…`) because all scenes end up in one document.
- Performance: a frame should render in well under a second. Avoid big CSS `filter: blur()` on full-frame layers every frame
  (small elements are fine); prefer gradients. Don't animate thousands of DOM nodes.

## Your loop (iterate — look at the result every time; the bar is "would someone pay for this")
PowerShell, from `your project folder` (refresh PATH first in every command):
```
$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
npx.cmd tsc --noEmit                      # errors in other groups' files are not yours
npx.cmd remotion render src/index-v02<x>.ts <X>-Look out/work-<x>/look --sequence --image-format=jpeg --scale=0.5 --concurrency=4 --log=error
ffmpeg -v error -y -start_number 0 -i out/work-<x>/look/element-%02d.jpeg -vf "scale=270:-1,tile=5x3" -frames:v 1 out/work-<x>/sheet.jpg
npx.cmd remotion render src/index-v02<x>.ts <X>-Clip out/work-<x>/clip.mp4 --scale=0.5 --concurrency=4 --log=error
ffmpeg -v error -y -i out/work-<x>/clip.mp4 -vf "fps=6,scale=180:-1,tile=8x4" -frames:v 1 out/work-<x>/motion.jpg
```
(`<x>` = a / b / c, `<X>` = A / B / C.) Read the sheets with the Read tool, find faults (empty frame, cut-off parts, overlaps,
static moments, unreadable silhouettes, mouth not moving while speaking, wrong colours), fix, render again.
Do at least three rounds. Judge final quality on a couple of full-size stills (`--scale=1` with `remotion still … --frame=N`).

## What to report back (short)
1. What each of your scenes shows, in a few lines.
2. **Sound cue list** — the sound designer needs every visible event that should make a sound, with its exact time as a
   cue expression and seconds, e.g. `W(1,"الو") - 0.05 = 1.66 s — A's hand snaps up in front of the lens (cloth flick)`.
   Include camera hits, impacts, flips, creaks, glows, card flutters, ambience changes. Be exhaustive and precise.
3. Anything you could not finish or that looks weak.
