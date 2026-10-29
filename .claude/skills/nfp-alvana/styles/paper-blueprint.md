# Paper × Blueprint
**وضعیت:** ✅ کد آماده در Remotion · `src/styles/paper-blueprint/` · پیش‌نمایش: `styles/previews/paper-blueprint.jpg` · قالب: کامپوزیشن `Style-PaperBlueprint`
**اسم‌های صدازدن:** «کاغذ و بلوپرینت»، «سبک ویدیو ۴»، «سبک مرورگر»، «دو دنیا»
**مرجع:** ویدیوی «how browsers work» · **اولین استفاده:** ویدیوی ۰۴ «فقط یک اسم»

## کی بزنیمش
توضیح یک فرایند فنی/هوش مصنوعی برای مخاطب عام؛ هر جا «دنیای واقعی» و «نگاه ماشین» دو روی یک داستان‌اند. افقی ۱۶:۹.

## ظاهر در یک نگاه
- **کاغذ = دنیای آدم‌ها:** کرم، راه‌راه اریب (`stripe="blue"|"gold"` یکی‌درمیان)، جوهر ضخیم با boil، هاشور، زمین. ربات قرمز.
- **بلوپرینت = نگاه ماشین:** سرمه‌ای، گرید، خط‌های نازک روشن، کمان نقطه‌چین + ستاره، گره تیک‌دار، ارغوانی فقط برای «پیدا شد».
- کات خشک بین دو دنیا؛ شات ۴–۵.۵ث؛ تیتر تایپ‌شونده بالا-راست، حلقه‌ی پیشرفت بالا-چپ، زیرنویس پایین.

## کد — شروع سریع
```tsx
import { Shot, Timeline, timeline, InkDefs, BlueDefs, Robot, … } from "../styles/paper-blueprint";
// کپی کن: src/styles/paper-blueprint/Demo.tsx → src/vNN/Video.tsx
const { starts, total } = timeline([135, 120, …]);   // مدت شات‌ها (فریم)
<Timeline total={total}><Series>…<Shot world="paper"|"blue" f g0 dur title chapter parts={[[متن, فریم], …]} stripe cx cy drift>…</Shot></Series></Timeline>
```
داخل هر Shot یک `<svg width={W} height={H}>`: برای کاغذ `<InkDefs f={f}/>` + `<g filter="url(#boil)">…</g>`؛ برای بلوپرینت `<BlueDefs/>`.

## قطعه‌ها (API)
| قطعه | دنیا | امضا |
|---|---|---|
| `Robot` | کاغذ | `x y s f walking mood(calm/determined/confused/happy) look(-1..1) arm(0..1) hold jump` — مبدأ بین پاها |
| `RobotLine` | آبی | `x y s f look wave` |
| `Ground` | کاغذ | `y x0 x1 seed` |
| `InkGlobe` | کاغذ | `cx cy r f spin lon0 tilt` — کره‌ی جوهری چرخان |
| `MapPin` `PushPin` | کاغذ | `x y s` (نوک پین = x,y) |
| `Polaroid` `Ticket` | کاغذ | در `<g transform>` بگذار؛ مرکز = 0,0 |
| `Corkboard` | کاغذ | `x y w h ground` |
| `StreetCam` | کاغذ | `x top ground pan f cone` — pan منفی = رو به پایین |
| `Person` + `CROWD` | هر دو | `s f ground line k kx dx`؛ `personX(s,f)`، `HEAD_Y` برای جای سر |
| `PaperTag` | کاغذ (HTML) | برچسب کاغذی سنجاق‌شده، `x y rot a size` |
| `SearchPill` | آبی (HTML) | `x y w f text size` یا children |
| `PostCard` | آبی | `x y hot s` |
| `DottedWorld` + `geoX/geoY` | آبی | `front`(طول جغرافیایی موج اسکن) `lit k cx cy` |
| `CamFeed` + `FaceBox` | آبی | فید دوربین مداربسته + کادر تشخیص چهره `locked label` |
| `TickDial` | آبی | `x y r f appear active` + آیکون در children |
| `DashedPath` | آبی | `id d f start dur` — خودش کشیده می‌شود با ستاره سرش |
| `Sparkle` | آبی | `x y s f` |
| `BlueChip` `Label` | HTML | برچسب با مرکز x,y (RTL-safe) |
| ابزار | — | `ramp fa faNum mmss typed rnd timeline` از `lib/util` |

## الگوهای ثابت (از ۰۴ — کد کامل در `examples/v04/scenes*.tsx`)
کاغذ مچاله → یادداشت با اسم · کره + شمارنده‌ی جمعیت + آیکون‌های خط‌خورده · نوار جست‌وجو با اندازه‌گذاری کلمه‌ها و کمان به گره‌ها · دیوار پست که می‌دود + ۳ مورد پیدا شده · تخته‌ی کارآگاهی با نخ قرمز · نقشه‌ی نقطه‌ای با موج اسکن · دوربین خیابانی + جمعیت · فید دوربین با قفل چهره و درصد · پین روی نقشه‌ی شهر · پایان با نوار جست‌وجو و جمله‌ی قلاب.

## صدا
از `public/sfx-lib/` (کاتالوگ: `audio/sfx-synth.md`). بستر: `node tools/music-bed.mjs spec.json out.wav`.

## نسخه‌ی «خفن» (ویدیوی ۰۷ — NPV) — قطعه‌ها در همین کیت (`cinema.tsx`, `backdrop.tsx`, `ink.tsx`)، نمونه‌ی کامل در `examples/v07/scenes.tsx`
پیش‌نمایش: `styles/previews/paper-blueprint-v07.jpg`. **از این نسخه شروع کن، نه ۰۴.**
- `cinema.tsx` → `Cam` (دوربین کی‌فریمی `[frame, x, y, zoom]` + دست‌لرزه + لرزش ضربه) · `TearIn` (ترنزیشن امضا: کاغذ پاره / بلوپرینت نئونی، ۱۴ فریم هم‌پوشانی در `Video.tsx`) · `PaperAmbience` (ابر جوهری، پرنده) · `ForeGrass` (علف پیش‌زمینه) · `InkConfetti` · `Bunting` · `BlueAmbience` (اسکن، چرخ‌دنده، ردیاب هدف با مختصات) · `Dim`.
- `backdrop.tsx` → `InkTown` (`town|factory|festival`: ساختمان‌های متنوع با پنجره‌ی روشن، دودکش و دود، درخت، آسیاب بادی، بالن + **مه کاغذی** که شهر را عقب می‌برد) · `Schematic` (نمای انفجاری دوربین با کال‌اوت، مدار چاپی با پالس نور، مکعب ایزومتریک).
- `ink.tsx` → آیکون‌های جوهری: کلاکت، سکه، تقویم، لامپ، سناریو، فیلم، میکروفون، قیچی، کارت ویدیو، هواپیمای کاغذی، فلش تمدید، `AIMachine`، کیف پول، پروانه‌ی بید، پرس مکانیکی، `InkBurst`، `Tokens`.

## درس‌ها
- ⚠ **درس از ویدیوهای قبلی روی ۰۷ v1: «خیلی ساده، جاهای خالی زیاد».** قانون: (۱) دوربین هر شات را از نمای نزدیک (zoom ۱.۳–۱.۶) شروع کن و روی کلمه‌های کلیدی پن/زوم کن؛ (۲) پس‌زمینه = تصویرسازی پرجزئیات (`InkTown`/`Schematic`)، **نه** نقطه/علامت ساده؛ (۳) بین پس‌زمینه و سوژه مه کاغذی (opacity ~۰.۴) تا خوانا بماند؛ (۴) ترنزیشن `TearIn` بین دو دنیا.
- ⚠ اول هر شات نباید خالی باشد — المان‌ها از فریم ۳–۵ ظاهر شوند، نه روی کلمه‌ی چند ثانیه بعد.
- ✓ نگاشت معنایی دو دنیا داستان را بدون نریشن خوانا کرد.
- ✓ شات‌های ۴–۵.۵ث برای خواندن زیرنویس فارسی لازم است (مرجع هر ۲ث کات دارد).
- ⚠ در SVG، `rotate` مثبت بردار (-1,0) را به **بالا** می‌برد.
- ⚠ `Robot` از clipPath با id ثابت استفاده می‌کند؛ دو ربات در یک svg با رنگ یکسان مشکلی ندارند.
- ⚠ آدم‌های فید دوربین باید بزرگ باشند (k≈1.6) وگرنه قاب خالی به نظر می‌رسد.
