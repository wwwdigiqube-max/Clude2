---
name: nfp-style-pack
description: "پک سه سبک آماده روی کیت NFP-Alvana نسخه‌ی ۲ برای ساخت ویدیوی عمودی فارسی با محتوای خود کاربر. ۰۱ «قصه‌ی طلایی» — داستان روایی با یک راوی، تصویرسازی تخت گرم، نقشه و دیاگرام و کارت‌های کدی. ۰۲ «نقاب‌های سپیا» (استیک‌من) — دیالوگ چندصدایی سورئال با کاراکترهای نقاب‌دار، فیلم قدیمی سپیا و لب‌خوانی، همه با کد. ۰۳ «ذهن نقاشی‌شده» — نقاشی متحرک روی آهنگ در سه سبک مونک، رامبرانت و رنسانس. Use when the user wants a video like «ویدیوی مزرعه / الی»، «ویدیوی نقاب‌ها / بازی / استیک‌من»، «ویدیوی مونک / رامبرانت / رنسانس / ذهنی که آروم نمی‌گیره», or mentions «پک سبک‌ها» / nfp-style-pack."
---

# پک سبک‌های NFP: سه سبک آماده با کد کامل

این پک کد کامل سه ویدیوی ساخته‌شده با کیت **NFP-Alvana نسخه‌ی ۲** است، همراه دستور ساختشان. تو (مدل) با آن ویدیوی **تازه با محتوای خود کاربر** در همان سبک می‌سازی.
خروجی آماده نیست: صدا، آهنگ و تصویرهای اصلی ویدیوهای نمونه همراه پک نیستند.
با کاربر فارسی، کوتاه و خودمانی حرف بزن. فقط چیزی را بپرس که نمی‌دانی: کدام سبک، موضوع یا متن، و برای سبک ۰۳ آهنگ.

## ۰. پیش‌نیاز و قانون‌ها
- **پروژه‌ی سالم کیت NFP-Alvana نسخه‌ی ۲:** Node 24، ffmpeg و Chrome نصب باشد و `npx remotion studio` بالا بیاید.
  - اگر نیست، اول اسکیل `nfp-alvana` را برو (`SETUP.md`).
  - ابزارهای خط تولید از خود کیت می‌آیند، نه از این پک: `tools/script-prep`، `doc-voices`، `doc-build-vo`، `captions`، `doc-mix`، `beat-map`، `eleven-sfx`، `sfx-takes` و `eleven-music-plan`. موتور Art Motion هم مال کیت است.
- قانون‌های کیت این‌جا هم برقرارند: کیفیت (بخش ۶ `SKILL.md` کیت) و صدا (`AUDIO.md`).
- **کلید و رمز را هرگز در چت نخواه، چاپ نکن و جایی جز `.env` ننویس.** کاربر خودش کلید را در `.env` می‌گذارد.
- قراردادها:
  - `<PACK>` یعنی پوشه‌ی همین فایل.
  - `NN` یعنی شماره‌ی ویدیوی تازه در پروژه، مثلاً `07`.
  - فرمان‌ها از ریشه‌ی پروژه اجرا می‌شوند.

## ۱. کدام سبک؟
| | ۰۱ قصه‌ی طلایی | ۰۲ نقاب‌های سپیا (استیک‌من) | ۰۳ ذهن نقاشی‌شده |
|---|---|---|---|
| حس | داستان تعلیقی قسمت‌به‌قسمت، نور غروب طلایی | دیالوگ سورئال و مرموز، فیلم قدیمی | یک لحظه‌ی احساسی بی‌کلام، نقاشی موزه‌ای متحرک |
| قالب | 1080×1920، 30fps، حدود ۶۰ ثانیه | 1080×1920، 24fps، حدود ۳۵ ثانیه | 1080×1920، 30fps، هم‌طول آهنگ (۱۵ تا ۳۰ ثانیه) |
| صدا | یک راوی، موزیک، افکت آرام | ۲ تا ۳ صدای متفاوت، افکت ریز زیاد، موزیک کم | فقط آهنگ |
| تصویر | ۶ تا ۸ تصویر AI (ابزار ساخت عکس لازم است) + لایه‌های کدی | همه با کد | همه با کد (موتور Art Motion) |
| از کاربر | متن داستان | دیالوگ و شخصیت‌ها | آهنگ با حق استفاده + حس یا داستان |
| پوشه | `styles/01-golden-story/` | `styles/02-sepia-masks/` | `styles/03-art-mind/` |
| اول بخوان | `pipeline/direction.md`، `pipeline/image-prompts.md` | `pipeline/AGENTS.md` | `pipeline/AGENTS.md` |

`<PACK>/preview.jpg` از هر سبک دو فریم نشان می‌دهد.

**صرفه‌جویی:**
- فقط پوشه‌ی سبک انتخاب‌شده را بخوان.
- `vo.json`، `captions.json`، `mouth.json` و `beats.json` داده‌ی ابزارها هستند. نخوانشان؛ اگر فیلدی لازم شد، با `node -e` فقط همان را چاپ کن.
- فایل‌های صحنه‌ی ۰۳ را کامل نخوان (هر کدام ۸۰ تا ۱۰۰ کیلوبایت). سربرگ هر فایل نقشه‌اش را می‌گوید؛ با Grep سراغ تابع لازم برو.

## ۲. نصب در پروژه (برای هر سبک یک بار)
| از پک | به پروژه |
|---|---|
| `styles/01-golden-story/src/*` | `src/v01/` |
| `styles/01-golden-story/public/img/*` | `public/v01/img/`: عکس‌های نمونه‌ی کوچک (۵۴۰px)، فقط برای تست نصب |
| `shared/public/grain.jpg` | `public/v01/grain.jpg` و `public/v02/grain.jpg` |
| `styles/01-golden-story/pipeline/*` | `videos/01/` |
| `styles/02-sepia-masks/src/*` | `src/v02/` |
| `styles/02-sepia-masks/dev-entries/*.ts` | `src/`: ورودی‌های جدا برای کار موازی (اختیاری) |
| `styles/02-sepia-masks/pipeline/*` | `videos/02/` |
| `styles/03-art-mind/src/*` | `src/v03/` |
| `styles/03-art-mind/engine-scenes/*.js` | `public/styles/art-motion/engine/scenes/` |
| `styles/03-art-mind/pipeline/AGENTS.md` | `videos/03/` |
| `tools/*.mjs` | `tools/` |
| `tools/analysis/*.py` | `tools/analysis/` (اختیاری؛ پایتون ۶۴بیتی و numpy لازم دارد) |

- **شماره‌ی پوشه:**
  - اگر `src/v01` (یا `v02`، `v03`) در پروژه هست، یک شماره‌ی آزاد `NN` بردار.
  - در فایل‌های کپی‌شده‌ی همان سبک، `v01/` را با `vNN/` عوض کن. این شامل مسیرهای `staticFile` و importهای `./v02/` در dev-entries است.
  - شناسه‌ی Compositionها را هم عوض کن.
- **دو ویدیو از سبک ۰۳ در یک پروژه:**
  - `Video.tsx` زمان‌بندی را در `window.U03` می‌گذارد و صحنه‌ها همان را می‌خوانند.
  - برای نسخه‌ی دوم، `U03` را به `UNN` و `u03_` را به `uNN_` عوض کن: در `Video.tsx`، داخل فایل‌های صحنه و در اسم خود فایل‌ها.
  - وگرنه دو ویدیو زمان‌بندی همدیگر را خراب می‌کنند.
- **ثبت در `src/Root.tsx`** (کنار Compositionهای دیگر):
```tsx
import { V01_FRAMES, V01_LOOK, Video01 } from "./v01/Video";
import { V02_FRAMES, V02_LOOK, Video02 } from "./v02/Video";
import { FPS03, FRAMES03, LOOK03, Video03 } from "./v03/Video";
// داخل RemotionRoot:
<Composition id="V01-Story" component={Video01} durationInFrames={V01_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ withAudio: true }} />
<Composition id="V01-Story-Silent" component={Video01} durationInFrames={V01_FRAMES} fps={30} width={1080} height={1920} />
<Composition id="V01-Story-Look" component={Video01} durationInFrames={V01_LOOK.length} fps={30} width={1080} height={1920} defaultProps={{ times: V01_LOOK }} />
<Composition id="V02-Masks" component={Video02} durationInFrames={V02_FRAMES} fps={24} width={1080} height={1920} defaultProps={{ withAudio: true }} />
<Composition id="V02-Masks-Silent" component={Video02} durationInFrames={V02_FRAMES} fps={24} width={1080} height={1920} />
<Composition id="V02-Masks-Look" component={Video02} durationInFrames={V02_LOOK.length} fps={24} width={1080} height={1920} defaultProps={{ times: V02_LOOK }} />
<Composition id="V03-Munch" component={Video03} durationInFrames={FRAMES03} fps={FPS03} width={1080} height={1920} defaultProps={{ style: "munch" as const, withAudio: true }} />
<Composition id="V03-Munch-Silent" component={Video03} durationInFrames={FRAMES03} fps={FPS03} width={1080} height={1920} defaultProps={{ style: "munch" as const }} />
<Composition id="V03-Munch-Look" component={Video03} durationInFrames={LOOK03.length} fps={FPS03} width={1080} height={1920} defaultProps={{ style: "munch" as const, times: LOOK03 }} />
{/* rembrandt و renaissance: همین سه خط با style: "rembrandt" یا "renaissance" */}
```
  - نسخه‌ی «با صدا» فقط برای پیش‌نمایش در Studio است: ۰۱ از `vNN/vo.wav` پخش می‌کند، ۰۲ از `vNN/mix.wav` و ۰۳ از `vNN/song.wav`.
  - تا فایل صدا را نساخته‌ای، از نسخه‌های `-Silent` و `-Look` استفاده کن.
  - برای ۰۲، `V02_LOOK_A`، `V02_LOOK_B` و `V02_LOOK_C` هم هست: Look هر گروه صحنه جدا.
- **چک نصب:** `npx tsc --noEmit` را بزن و بعد یک Look بگیر (بخش ۴). اگر فریم‌ها مثل `preview.jpg` درآمدند، نصب درست است؛ داده‌ها و عکس‌ها هنوز مال نمونه‌اند. بعد محتوای کاربر را جایگزین کن.

## ۳. ساخت با محتوای خود کاربر

### ۰۱ · قصه‌ی طلایی (روایت + تصویرسازی)
1. **متن:** `videos/NN/script.json` به فرمت `tools/script-prep.mjs` (نمونه در همان پوشه است).
   - هر خط یک جمله‌ی کوتاه است.
   - ` / ` یعنی کارت زیرنویس تازه، و `*کلیدواژه*` کلمه را برجسته می‌کند.
   - برای عدد و اسم لاتین از `{گفتاری|نوشتاری}` استفاده کن.
   - ساختار نمونه: قلاب در جمله‌ی اول، بعد مسئله‌ها یکی‌یکی، بعد شمارش و فهرست، بعد کلیف‌هنگر، و در آخر کارت «قسمت دوم».
   - حدود ۱۱ خط می‌شود ۶۰ ثانیه.
2. **صدا:** صدای راوی در `voices.json` است. نمونه Sarah است، صدای پیش‌فرض ElevenLabs؛ هر صدای دیگری هم می‌شود.
   ```
   node tools/script-prep.mjs videos/NN
   node --env-file=.env tools/doc-voices.mjs videos/NN
   node tools/doc-build-vo.mjs videos/NN public/vNN/vo.wav src/vNN/vo.json --lead 0.2 --tail 0.4 --tempo 1.05
   node tools/captions.mjs videos/NN src/vNN/vo.json src/vNN/captions.json
   ```
   خط‌های ⚠ را گوش کن یا بازنویسی کن (`AUDIO.md` کیت، بخش پ).
3. **تصویر:** طبق `pipeline/image-prompts.md`.
   - اول شیت کاراکتر را بساز.
   - بعد هر صحنه را با شیت به‌عنوان عکس رفرنس بساز، تا چهره و لباس و پالت در همه‌ی شات‌ها یکی بماند.
   - قاب ۹:۱۶ و بدون متن باشد. بعد upscale کن تا عرض ۲۱۶۰.
   - اسم فایل‌ها: `public/vNN/img/s01_xxx.jpg`.
   - اگر ابزار ساخت عکس نداری، `RESOURCES.md` کیت را ببین یا سبک ۰۲ یا ۰۳ را پیشنهاد بده (همه با کد).
4. **کد (`src/vNN/Video.tsx`):**
   - `T`: شروع هر شات از روی کلمه‌ها، با `cut(خط, "کلمه")`. **هیچ ثانیه‌ای را دستی تایپ نکن.**
     - `Wd(خط, "کلمه")` شروع کلمه است و `WdEnd` پایانش.
   - `SHOTS`: هر شات این‌ها را دارد:
     - `at`: زمان شروع.
     - `tin`: نوع ورود (`cut`، `whipL`، `whipR`، `whipU`، `zoom` یا `dip`).
     - `draw(t)`: چیزی که کشیده می‌شود.
   - `<Pic src keys>`: دوربین داخل عکس حرکت می‌کند.
     - هر کلید `{ t, x, y, z }` است: `x` و `y` نقطه‌ای از عکس است که وسط کادر می‌آید (بین ۰ و ۱)، و `z` بزرگ‌نمایی است.
     - دوربین هیچ‌وقت ثابت نماند.
   - لایه‌های کدی. هر کدام را که لازم داری نگه دار و متن و عددش را عوض کن:
     - `Map.tsx`: نقشه‌ی هوایی مزرعه با حلقه‌های صدا، با نقطه‌ها در `P`. برای داستان دیگر شکل‌ها را عوض کن یا حذفش کن.
     - `Diagram.tsx`: زنجیره‌ی برق، پمپ و چاه.
     - `cards.tsx`: `Inventory`، `NoiseMeter`، `Weeks` و `Part2` (کارت «قسمت دوم»).
     - `ui.tsx`: `Captions`، `CountCard`، `TimeChip`، `Tag`، `Burst`، `Flash`، و `Finish` که دانه و گرمای رنگ و وینیت را می‌دهد.
   - ریتم نمونه: هر ۱.۵ تا ۳ ثانیه یک شات یا لایه‌ی تازه.
   - رنگ‌ها در `C` داخل `lib.ts` هستند. فونت‌ها `F_HEAD` و `F_TEXT` در `lib.ts` هستند؛ پیش‌فرض لاله‌زار و وزیرمتن کیت است.
   - `V01_LOOK` را با زمان‌های مهم خودت پر کن و هر بار Look بگیر (بخش ۴).
5. **موزیک و افکت:**
   - **موزیک با حساب پولی:** `music-plan.json` را با `tools/eleven-music-plan.mjs` بساز.
   - **موزیک با حساب رایگان:** تکه‌های `music-cues.json` را با `tools/eleven-sfx.mjs` بساز (همان فرمت `sfx.json`). در `audio.json` پشت هم چیده می‌شوند و روی هم fade می‌خورند.
   - **افکت:** `sfx.json`، بعد `eleven-sfx`، بعد `sfx-takes` (`AUDIO.md` کیت، بخش ۳).
   - **میکس:** `audio.json` را با کیوهای کلمه‌ی داستان خودت بازنویسی کن، مثلاً `"W:5:تازه+0.4"`. بعد بزن:
     `node tools/doc-mix.mjs videos/NN/audio.json out/mixNN.wav`. خروجی `out/mixNN-norm.wav` روی ‎-14 LUFS است.
   - سطح‌های نمونه: `sfxGain` ۰.۳ و موزیک ۰.۱۵ تا ۰.۳. افکت‌ها خیلی آرام‌تر از راوی‌اند.
6. **رندر:** رندر `V01-Story-Silent`، بعد چسباندن صدا (بخش ۴).

### ۰۲ · نقاب‌های سپیا (دیالوگ چندصدایی، همه با کد)
1. **دیالوگ:** `script.json`.
   - `sp` گوینده است: `A`، `B` یا `C`.
   - برای هر خط یک تگ احساس بگذار، مثل `[nervous]`، `[bored]` یا `[mysterious]`.
   - جمله‌ها کوتاه باشند و مکث‌ها واقعی (`gap`).
   - متن مال خود کاربر باشد، نه ترجمه یا دوبله‌ی ویدیوی کس دیگر.
2. **صداها:** سه صدای واقعاً متفاوت از نظر سن، زیر و بمی و انرژی.
   - **ساده:** صداهای پیش‌فرض ElevenLabs.
   - **بهتر، طراحی صدا از روی توصیف:**
     - در `cast.json` برای هر شخصیت `desc` (توصیف انگلیسی صدا) و `text` (نمونه‌ی فارسی ۱۰۰ تا ۱۰۰۰ حرفی) بنویس.
     - بساز:
       ```
       node --env-file=.env tools/eleven-design.mjs design videos/NN/cast.json videos/NN/cast
       ```
     - کاربر سه نمونه‌ی هر شخصیت را گوش می‌دهد و یکی را انتخاب می‌کند.
     - ذخیره کن:
       ```
       node --env-file=.env tools/eleven-design.mjs save videos/NN/cast A-2 "اسم صدا" "توضیح کوتاه"
       ```
     - voice_id چاپ‌شده را در `voices.json` بگذار. الان آن‌جا placeholder است.
   - اگر طراحی صدا روی حساب کاربر خطا داد، از صداهای پیش‌فرض استفاده کن.
   - **صدای آدم واقعی را بدون رضایت خودش کلون نکن.**
3. **ساخت دیالوگ:**
   ```
   node tools/script-prep.mjs videos/NN
   node --env-file=.env tools/doc-voices.mjs videos/NN
   node tools/doc-build-vo.mjs videos/NN public/vNN/vo.wav src/vNN/vo.json --lead 0.2 --tail 0.4
   node tools/captions.mjs videos/NN src/vNN/vo.json src/vNN/captions.json
   node tools/mouth-env.mjs public/vNN/vo.wav src/vNN/mouth.json 24
   node tools/vo-pan.mjs public/vNN/vo.wav src/vNN/vo.json public/vNN/vo_pan.wav --left A --right B
   ```
   - `mouth.json` باز و بسته شدن دهان را با صدا هماهنگ می‌کند.
   - `vo_pan` صدای A را کمی به چپ و B را کمی به راست می‌برد؛ C وسط می‌ماند. `audio.json` نمونه همین فایل را می‌خواند.
4. **صحنه‌ها:**
   - **`cues.ts`:**
     - `SC` شروع هر صحنه از روی دیالوگ است: `S(n)` شروع خط n، `E(n)` پایانش، و `W(خط, "کلمه")`.
     - `SCENE_ORDER` ترتیب صحنه‌هاست.
     - با دیالوگ تازه، این‌ها را برای خط‌ها و کلمه‌های خودت بنویس.
   - **هر صحنه** یک کامپوننت `({ t, lt, f, dur })` است.
     - در `scenesA.tsx`، `scenesB.tsx` و `scenesC.tsx` تعریف می‌شوند. کد اصلی‌شان در `a-*`، `b-*` و `c-*` است.
     - در `SCENES` داخل `Video.tsx` سیم‌کشی می‌شوند.
   - **کاراکترها در `chars.tsx`:**
     - `Mask` سه نوع دارد: A، B و C. شکل، ترک، ابرو و رنگ را عوض کن تا بازیگرهای خودت شوند.
     - `Arm` و `Torso` بدن‌اند.
     - `mouth(sp, t)` دهان گوینده را باز می‌کند و `speaking(sp, t)` می‌گوید چه کسی حرف می‌زند.
   - **حس فیلم قدیمی:**
     - در `fx.tsx` و `frame.tsx`: دانه، فلیکر، لرزش قاب، وینیت و زیرنویس `Subs`.
     - پالت `P` در `theme.ts` است: سپیا، کهربایی، استخوانی، جوهری.
   - **کار سریع‌تر با ایجنت:**
     - می‌شود سه ایجنت موازی گرفت؛ هر کدام یک گروه صحنه را با ورودی خودش می‌سازد (`src/index-v02a.ts`، `b`، `c`).
     - گروه‌ها `A-Look` و `A-Clip` دارند، مثلاً: `npx remotion render src/index-v02a.ts A-Look out/a --sequence --image-format=jpeg --scale=0.5`.
     - بریف نمونه: `pipeline/AGENTS.md`.
     - ایجنت منتقد لازم نیست. خودت شیت‌های هر ایجنت را ببین و اصلاح بفرست.
5. **صدا (جذابیت اصلی این سبک):**
   - **موزیک:** خیلی کم زیر دیالوگ (`music-plan.json`: درون و ترمین، بی‌کلام). `musicKeys` در `audio.json` آن را موقع حرف زدن پایین می‌آورد.
   - **افکت:** یک افکت ریز روی هر حرکت. `sfx.json` ۲۴ نمونه دارد: پاپ نقاب، قژقژ گردن، درخشش چشم، تیک ساعت، چرخش کارت و غیره.
   - در `audio.json` هر افکت این شکل است: `[فایل، زمانِ اوج، حجم، آفست پیک]`.
   - **میکس:** `node tools/doc-mix.mjs videos/NN/audio.json out/mixNN.wav`.
   - پیش‌نمایش Studio از `public/vNN/mix.wav` پخش می‌کند؛ `out/mixNN-norm.wav` را آن‌جا کپی کن.
6. **رندر:** رندر `V02-Masks-Silent`، بعد چسباندن صدا (بخش ۴).

### ۰۳ · ذهن نقاشی‌شده (نقاشی متحرک روی آهنگ)
سه سطح تغییر دارد:
- **سطح ۱: آهنگ خودت، همان داستان.**
  - آهنگ را ببر و بیت‌مپ بگیر:
    ```
    ffmpeg -i song.mp3 -ss <شروع> -t <طول> -ar 48000 public/vNN/song.wav
    node tools/beat-map.mjs public/vNN/song.wav src/vNN/beats.json
    ```
  - در `Video.tsx`، `END03` را برابر طول آهنگ بگذار.
  - مقدارهای `U03` را روی ضرب‌ها و اوج‌های آهنگ خودت بچین:
    - `TR_START` روی یک downbeat (از `bars`) نزدیک کات.
    - `peak` روی بخش اوج.
    - `hits` روی سه ضربه‌ی قوی.
    - `fade` تا پایان.
  - برای پیدا کردن ضربه‌ها `tools/analysis/transients.py` و `energy.py` کمک می‌کنند (`python -I`).
  - اسم کلیدها را عوض نکن؛ صحنه‌ها همه‌ی زمان‌ها را از `window.U03` می‌خوانند.
  - `LOOK03` را هم با زمان‌های تازه بچین.
- **سطح ۲: کاراکتر، اتاق یا رنگ تازه.**
  - در فایل صحنه‌ی همان سبک، تابع‌های کاراکتر (سر، چشم، دست)، اتاق و گرداب فکر را عوض کن.
  - سربرگ فایل می‌گوید کدام تابع چه می‌کشد.
- **سطح ۳: حس یا داستان تازه، یا سبک نقاشی تازه.**
  - `u03_munch.js` را کپی کن به `public/styles/art-motion/engine/scenes/u03_<style>.js`.
  - دو کلید را عوض کن: `SCENES['u03_<style>']` برای نمای باز و `SCENES['u03_<style>_close']` برای نمای نزدیک.
  - زبان نقاش را از صحنه‌ی اصلی کیت یاد بگیر. کاتالوگ صحنه‌ها در `styles/art-motion.md` کیت است.
  - در `STYLES03` یک ردیف با یک ترنزیشن کیت اضافه کن. نمونه‌ها: `screamWarp`، `chiaroscuro`، `godRays`.
  - بریف کامل و حلقه‌ی کار در `pipeline/AGENTS.md` است. برای سه سبک می‌شود سه ایجنت موازی گرفت.

**قانون‌های موتور (نشکن):**
- **بوم عمودی:** `ArtFilmCanvas` با `width={1080} height={1920}`. در صحنه بنویس `const { W, H } = STAGE`.
  - صورت و کار اصلی بین y≈250 و y≈1500 باشد؛ بالا و پایین کادر زیر UI اینستاگرام می‌رود.
- **هر فریم تابع خالص `t` است:** نه `Math.random`، نه `Date`، نه state بین فریم‌ها. به جایش `U.rng(seed)` و `P.boilSeed`.
- **اسم scratch canvas یکتا باشد،** با پیشوند سبک: `u03munch_…`.
- **بارگذاری صحنه:** موتور فایل را از روی id اولین seg بار می‌کند (`scenes/<id>.js`).
  - صحنه‌ی `_close` در همان فایل ثبت می‌شود، پس نمای باز باید seg اول باشد.
- **سرعت:** هدف حدود ۱۵۰ میلی‌ثانیه برای هر فریم است. رندر را با `--timeout=120000` بزن.

## ۴. حلقه‌ی چک و رندر (هر سه سبک)
```
npx remotion render <ID>-Look out/look --sequence --image-format=jpeg --scale=0.5 --concurrency=4 --log=error
ffmpeg -v error -y -start_number 0 -i out/look/element-%02d.jpeg -vf "scale=270:-1,tile=8x2" -frames:v 1 out/sheet.jpg
npx remotion still <ID>-Look out/full.jpg --frame=<n> --scale=1
npx remotion render <ID>-Silent out/clip.mp4 --scale=0.5 --concurrency=4
ffmpeg -v error -y -i out/clip.mp4 -vf "fps=4,scale=150:-1,tile=10x7" -frames:v 1 out/motion.jpg
```
- شیت را ببین.
- چند فریم را در اندازه‌ی کامل هم ببین: متن، چهره و دست.
- با `motion.jpg` حرکت و هماهنگی با صدا را چک کن.
- اگر کمتر از ۱۰ فریم Look داری، الگوی اسم فایل `element-%d.jpeg` است.

**رندر نهایی و چسباندن صدا:**
```
npx remotion render <ID>-Silent out/vNN.mp4 --concurrency=4 --timeout=120000
ffmpeg -i out/vNN.mp4 -i out/mixNN-norm.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -movflags +faststart videos/NN/final.mp4
```
برای ۰۳، به جای فایل میکس، `public/vNN/song.wav` را بده.

## ۵. دام‌های شناخته‌شده
- **عکس نصفه:** Tailwind کیت عرض `<img>` را حداکثر ۱۰۰٪ می‌کند. روی هر `<Img>` بزرگ‌تر از کادر `style={{ maxWidth: "none" }}` بگذار. در `Pic.tsx` هست؛ در کد تازه یادت نرود.
- **زمان را حدس نزن:** همه‌ی زمان‌ها از `vo.json` (۰۱ و ۰۲) یا `beats.json` (۰۳) می‌آیند.
  - بعد از ساخت صدای تازه، کیوهایی که کلمه‌شان دیگر وجود ندارد خطای `cue not found` می‌دهند. این خطا خوب است؛ درستشان کن.
- **ElevenLabs در ایران:** خطای 403 یعنی پراکسی لازم است (`SETUP.md` کیت):
  `$env:HTTPS_PROXY='http://127.0.0.1:<پورت>'; $env:NODE_USE_ENV_PROXY='1'`
- **حساب رایگان ElevenLabs:**
  - Music API ندارد (خطای 402). به جایش `music-cues.json` با `eleven-sfx` یا موزیک آماده‌ی کیت (`public/music/`).
  - کیفیت 192 مجاز نیست (خطای 403). در `tools/doc-voices.mjs` و `tools/eleven-sfx.mjs`، `mp3_44100_192` را به `mp3_44100_128` عوض کن.
  - استفاده‌ی تجاری فقط با پلن پولی است.
- **امتیاز پایین STT** روی عدد و اسم لاتین معمولاً هشدار کاذب است. اما اگر یک کلمه در هر سه نسخه غلط خوانده شد، جمله را عوض کن.
- **سطح صدا:** افکت و موزیک همیشه خیلی آرام‌تر از گوینده باشند. با `--stems` در `doc-mix` اندازه بگیر: صدا حدود ‎-21، موزیک حدود ‎-33.
- **چسباندن صدا:** از `-shortest` استفاده نکن؛ پایان ویدیو بریده می‌شود.
- **دیسک:** Remotion در `%TEMP%` پوشه‌های `puppeteer_dev_chrome_profile-*` و `remotion-webpack-bundle-*` جا می‌گذارد. بعد از رندرها پاکشان کن:
  `Get-ChildItem $env:TEMP -Directory -Filter 'puppeteer_dev_chrome_profile-*' | Remove-Item -Recurse -Force`
  (همین فرمان را با فیلتر `remotion-webpack-bundle-*` هم بزن.)
- **فونت خود کاربر:** فایل `.ttf` را در `public/fonts/` بگذار و اسم فایل را در `lib.ts` (برای ۰۱) یا `theme.ts` (برای ۰۲) عوض کن.

## ۶. حق و اخلاق
- متن، داستان و دیالوگ مال خود کاربر باشد. ویدیوی کس دیگری را یک‌به‌یک کپی نکن: کاراکتر، رنگ و متن باید تازه باشند.
- آهنگ فقط با حق استفاده: ساخت خود کاربر، آهنگ مجوزدار، یا موزیک CC کیت با ذکر منبع.
- صدا: پیش‌فرض یا طراحی‌شده. کلون فقط با رضایت صاحب صدا.
- این‌ها عمداً همراه پک نیستند: ویدیوهای مرجع، آهنگ و صداهای ویدیوهای نمونه، فونت‌های شخصی و هیچ کلید یا شناسه‌ی حسابی.
