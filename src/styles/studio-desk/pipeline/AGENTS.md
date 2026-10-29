# Brief for scene builders (multi-agent template)

The reference film of this style (113 s, 12 scenes, ~440 KB of scene code) was built by **three agents in parallel**: each owned one scene file. A fresh critic agent then reviewed stills and gave P1/P2/P3 fixes, and the same agents applied them (continued with SendMessage, so their context was kept). Use this brief as the template when your user **explicitly asks for agents** on a long, dense reel. Copy it next to your video and fill in the parts marked ✎.

## The video ✎
A **vertical Instagram reel, 1080×1920, 30 fps, ~114 s**, promoting ✎ (product / course). The narration is a Persian voice-over, already timed in `src/v01/words.json` (word / start / end, from forced alignment). Visuals are code (Remotion, React DOM) plus the maker's own footage. Goal: as detailed, precise and attractive as possible, so viewers stay to the end.

## Taste rules (non-negotiable)
- **Every shot is full of motion and elements.** That means an animated entrance, constant motion (camera drift, floating, particles), a hit on the keyword and a live decorative element. Nothing sits still after it appears.
- **Every sentence gets its own animation** and the energy stays high.
  - Vary the transitions: whip, zoom-through, drop, VHS, glitch, iris, pull-back.
  - Show exactly what is said. If the words say «دور می‌شود», the thing really moves away.
- **Maximum detail and realism.** UI mock-ups must look like the real apps: status bars, tab bars, icons, counters, timestamps, cursors, hover states, real shadows and depth. The test: would someone pay for this, and could others make it?
- **One idea, one focal point per shot.** Clutter reads as noise.
  - No pastel or sticker look.
  - No thick cartoon outlines.
  - No meaningless glow behind characters.
  - No neon tunnels.
- **Colour:**
  - Light world: a warm paper desk, `#EFEDE6`.
  - Dark world: a near-black cinema, `#0B0B0D`.
  - **One accent, orange:** `C.green` = `#F25C1F` on light and `C.neon` = `#FF7A3D` on dark. These are legacy names; green was rejected.
  - Red `C.red` only for "remove / expensive / wrong".
  - Brand colours appear only inside their own UI.
- **Numbers:** Latin digits. Big numbers use Libre Baskerville Bold (`NUM`); UI uses Inter (`UI`).
- **Persian text:**
  - Font `FA` (Vazirmatn), always `direction: rtl`.
  - Never animate Persian letter by letter, because the letters must stay joined. Animate word by word, or with wipes.
  - Never use `-webkit-text-stroke` on Persian.
- First frame not dark. Text must be readable: dark ink on the light desk, white on dark.

## Vertical layout
- **Main visual area:** x 40–1040, y 150–1260.
- **Captions:** drawn by the shared frame at y 1300–1450. Put nothing important there.
- **Below y ≈ 1500:** the Instagram UI covers the reel. Use it for background and decoration only.
- **Right edge:** keep important things out of the right 110 px when they sit low in the frame (the IG icons are there).

## Code
- Shared files (do **not** edit them):
  - `lib.ts`: timing, maths, colours, fonts, media slots.
  - `ui.tsx`: the UI kit.
  - `frame.tsx`: desk, captions, time context.
  - `captions.tsx`.
  - `Video.tsx`: the whole film.
  - `words.json`.
- Scene files: `scenesA.tsx` (S1–S5), `scenesB.tsx` (S6–S8), `scenesC.tsx` (S9–S12).
  - **Edit only your own scene file**, plus new files you create, prefixed with your group letter (e.g. `a-kit.tsx`).
  - Keep your exports' names and props (`S1Hook(t, frame)` …), because `Video.tsx` imports them.
  - Each scene is `({ t, frame }) => JSX | null`, a pure function of the global time `t` (seconds).
  - **Keep each scene's visibility window.** Scenes overlap for transitions.
- **Timing:**
  - `S(i)` / `E(i)` give the start / end of word `i`.
  - List words with: `node -e "const w=require('./src/v01/words.json');w.forEach((x,i)=>i>=A&&i<=B&&console.log(i,x.w,x.s,x.e))"`
  - Never hard-code a time when a word cue exists.
- **Helpers in `lib.ts`:**
  - Motion: `ramp(t,a,b)`, `win`, `ease.{out,in,io,expo,back}`, `spring(t,t0,d,bounce)`, `pop(t,t0,d)` (gated overshoot), `hit(t,t0,d)` (a 0→1→0 pulse).
  - Maths and formatting: `lerp`, `clamp`, `rnd(i)`, `grp(n)` (1,234), `kfmt(n)` (90K / 1.2M).
  - Style: colours `C`, `SHADOW`, fonts `FA` / `NUM` / `UI` / `MONO`.
  - Media: `v23(path)` resolves a media name through `MEDIA`.
- **`ui.tsx`:**
  - Pieces: `Ico` (icon set), `Abs`, `Card`, `Fa`, `Lat`, `Pill`, `BigNum`, `Phone` (w → h = 2.05·w), `ReelRail`, `typed(s,k)`, `Grain`, `Tag`.
  - **`Clip`**: `<Clip src t0 dur from />` plays a video that starts at global time `t0` (from `from` seconds into the file) and fills its parent.
    - It also works in the Look (stills) composition.
    - A clip that isn't in `MEDIA` shows a labelled `Slot`.
- Brand logos only from real SVG paths (e.g. `test-reel/lib/claude-logo`), never drawn guesses.

## Assets ✎
- Your clips go in `public/v01/clips/` (H.264, no audio), mapped in `MEDIA`.
- For each clip, note what happens when, e.g. `man.mp4` (1280×720, 10 s): man by an oil lamp, then a bottle pour, then a woman at 7–10 s. Agents choose moments from these notes.
- Stills (thumbnails at height 216) for walls and grids go in `public/v01/stills/`.
- Agents may add assets into `public/v01/<their letter>/`.

## Review loop (do it, look at the result, iterate)
- **Type check:** `node node_modules/typescript/bin/tsc --noEmit -p .`
  - Errors in other groups' files aren't yours; just make sure yours are clean.
- **Your stills:** use a dev entry that registers only your scenes (`src/index-a.ts` → a Root with `A-Look`), so an unfinished file of another group never breaks your render:
  ```
  npx remotion render src/index-a.ts A-Look out/work-a/look --sequence --image-format=jpeg --scale=0.5
  ffmpeg -v error -y -start_number 0 -i out/work-a/look/element-%02d.jpeg -vf "scale=360:-1,tile=6x3" -frames:v 1 out/work-a/sheet.jpg
  ```
  Look at the sheet; zoom into single stills when needed.
- **Motion:** render a short range with `--frames=A-B` and pull a few frames.
- **Performance:**
  - Keep ≤ ~10 simultaneous `Clip`s per frame.
  - Prefer CSS transforms.
  - Avoid huge blurred layers on every frame.

## Deliverable (each agent's final message)
1. What you built per scene, 2–3 lines each.
2. **A list of visual events for sound design**: `time (s) · event · suggested sound`.
   - Examples: whooshes on transitions, pops on appearances, ticks on counters, impacts on number slams, clicks or typing on UI.
   - Include every event that deserves a sound, with exact times from the word cues.
   - `pipeline/build-audio.mjs` turns these lists into ~230 placed effects.
3. Anything you could not do, or think should change.
