# Launch Reel (لانچ محصول روی ضرب موزیک)
**وضعیت:** ✅ کد آماده در Remotion · `src/styles/launch-reel/` · قالب: کامپوزیشن `Style-LaunchReel` (`Demo.tsx`) · پیش‌نمایش: `styles/previews/launch-reel.jpg`
**اسم‌های صدازدن:** «سبک لانچ»، «سبک اپ‌استور»، «معرفی محصول»، «سبک brag»
**مرجع:** تون‌های `app-store` و `cinematic` در skill [/brag](https://github.com/latent-spaces/brag) (MIT) + لانچ‌ویدیوهای SaaS · **اولین استفاده:** دموی ربات سیگنال (۱۸ث)

## کی بزنیمش
معرفی اپ/ربات/محصول/سرویس، ۱۵–۲۵ ثانیه، **بدون نریشن**، با موزیک شاد و کات روی ضرب. عمودی 1080×1920 (ریلز). ساختار: قلاب (۲–۳ث) ← رونمایی (۳–۴ث) ← ۲–۳ ویژگی ← پایان + CTA (۳ث).

## ظاهر در یک نگاه
- پس‌زمینه‌ی **مش گرادیان زنده** (لکه‌های بنفش/نعنایی/آبی که آرام حرکت می‌کنند + گرید نقطه‌ای) که با **انرژی موزیک نفس می‌کشد** (`pulse`). صحنه‌ها یکی‌درمیان **تیره** و **روشن**.
- تیتر درشت (Lalezar) که کلمه‌به‌کلمه از بلور بالا می‌آید؛ **یک کلمه روی قرص بنفش** که از راست کشیده می‌شود.
- المان‌های براق سه‌بعدی: سکه‌ی بیت‌کوین/دلار/اتریوم، شمش طلا، کاشی نمودار — با لرزش سه‌بعدی CSS و سایه‌ی عمیق.
- UI واقعی: گوشی، چت با تایپ و ارسال، کارت سیگنال با نمودار خودکش، نوتیفیکیشن شیشه‌ای، صفحه‌ی ۲۴ساعته با رادار، شمارنده، دکمه‌ی CTA با برق و کلیک موس.
- ترنزیشن: **iris مستطیل گرد از وسط** برای صحنه‌ی جدید + فرورفتن و تار شدن صحنه‌ی قبلی (اول قبلی می‌رود، بعد جدید — بدون دوبار نوردهی).

## کد — شروع سریع
```tsx
import { Backdrop, Headline, Phone, SignalCard, Toast, Dial24, CTA, ClipReveal, exitStyle, SFX, … } from "../styles/launch-reel";
import ENV from "../lib/audio-env/ende-vol-10.json";   // پاکت انرژی موزیک (فریم‌به‌فریم 0..1)
```
1. آهنگ را از `public/music/` انتخاب کن و `public/music/cues/<track>.music-cues.md` را بخوان (ضرب‌ها و «strong cues»).
2. `CUTS` (ثانیه‌ی شروع صحنه‌ها) را روی strong cue ها بگذار؛ ورودهای کوچک روی ضرب‌ها (±۰.۱ث).
3. `Demo.tsx` را به `src/vNN/Video.tsx` کپی کن؛ صحنه‌ها = `React.FC<{f, pulse}>` با فریم محلی.
4. صدا: آرایه‌ی `CUES` = `[ثانیه, SFX.x, حجم]` — افکت **سر شروع حرکت**، نه آخرش.
5. آهنگ دیگر: `node tools/audio-env.mjs public/music/x.mp3 src/lib/audio-env/x.json` برای pulse.

## قطعه‌ها (API)
| قطعه | امضا |
|---|---|
| `Backdrop` | `mode f pulse tint tint2` |
| `ClipReveal` / `exitStyle(p)` | ورود iris / خروج صحنه — الگو در `LaunchReelDemo` |
| `Headline` | `text f at mode y size accent=[اندیس کلمه] stagger font color out` |
| `Kicker` | برچسب کوچک بالای تیتر `text a mode y color` |
| `Token` | `kind: btc/usd/eth/gold/index s f seed` — سکه/شمش/کاشی براق |
| `AppIcon` | لوگوی placeholder (مربع گرد گرادیانی با موج) `s f glow` |
| `Phone` + `PHONE` | `x y s mode rot` — بچه‌ها داخل صفحه‌ی 472×1012 |
| `ChatHeader` `Bubble` `TypingDots` `InputBar` | چت: `Bubble side=me/bot a top w` · `InputBar text f press` |
| `SignalCard` | `f at asset code dir rows=[[برچسب,مقدار,رنگ]] conf stampAt` |
| `Toast` | `icon=check/bell/up title sub a mode x y color` |
| `Dial24` | صفحه‌ی ۲۴ساعته با رادار `f a x y r mode hits=[ساعت]` |
| `Ticker` | نوار قیمت `f y mode items=[[نام, درصد]]` |
| `Counter` | شمارنده‌ی فارسی `f at to decimals prefix suffix size y` |
| `Chip` | قرص با نقطه‌ی رنگی `text a mode color` |
| `Cursor` `Ripple` `CTA` `GlassBurst` | موس، موج کلیک، دکمه با برق، انفجار شیشه‌ای (جشن غیرکودکانه) |
| کمکی | `pop(f, at)` ورود فنری · `float(f, seed)` · `faDec(n)` عدد اعشاری فارسی · `SFX.*` مسیر افکت‌های Kenney |

## صدا
موزیک: `public/music/` (ende.app، CC BY 4.0، بدون Content ID) حجم ۰.۳–۰.۴۵، فید ۰.۹ث آخر. افکت‌ها: `public/kenney/` (CC0) — راهنما `audio/sfx-kenney.md`. تون app-store = یک لایه‌ی سبک ثابت (drop/click برای هر کارت، bell برای پایان)، حجم ۰.۵–۰.۸. تایپ = `SFX.key(i)` برای هر حرف (فاصله‌ها بی‌صدا).

## درس‌ها
- ✓ کات روی strong cue آهنگ + ورودهای کوچک روی ضرب‌ها = حس «ادیت حرفه‌ای» بدون هیچ زحمت اضافه.
- ✓ متن باید بعد از نشستن حداقل ۰.۳ث برای هر کلمه بماند؛ ریتم از حرکت و کات می‌آید، نه از متن زودگذر (قانون brag).
- ⚠ تیتر بلند در عمودی می‌شکند — تیتر ۴ کلمه‌ای با size ≤ ۱۰۰، دوکلمه‌ای تا ۱۵۰.
- ⚠ متن روی رادار/المان متحرک: یک دیسک تیره‌ی پشت متن بگذار (مثل شمارنده‌ی صحنه‌ی ۴).
- ⚠ پایین قاب عمودی زود خالی می‌ماند — `Ticker` یا چیپ‌های شناور پرش می‌کنند.
