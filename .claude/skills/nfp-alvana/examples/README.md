# نمونه‌ها (سبک‌های قدیمی‌تر)
کد کامل ویدیوهای واقعی ساخته‌شده با سبک‌های قدیمی‌تر، برای الگوگرفتن. برای اجرا، پوشه را به `src/` پروژه کپی کن (ایمپورت‌ها `../styles/…` و `../fonts` را فرض می‌کنند) و فایل‌های صدا (`public/vNN/…`) را با صدای خودت جایگزین کن.

**سبک‌های جدیدتر** (hologram-hud، atomic-age، test-reel، stick-toon، satellite-explainer، cosmic-web، studio-desk، split-flap، light-logo) نمونه‌ی جدا ندارند: فیلم مرجعشان، کامل و قابل‌اجرا با عکس‌ها (بی‌صدا)، در خود سبک است (`template/src/styles/<id>/demo/`) و دستور ساختش، از متن تا صدا، در `pipeline/`.

| پوشه | سبک | چیست |
|---|---|---|
| v04 | Paper × Blueprint (نسخه‌ی اول) | «فقط یک اسم» — ۴۷ث افقی، بدون نریشن، زیرنویس |
| v05 | Receipt UI | «وایب‌کدینگ و دردسر حقوقی» — ۹۰ث عمودی، نریشن TTS (`v05-narration.mjs` = متن با توکن `tts|display`) |
| v06 | Pixel Collage | NPV — ۵۳ث افقی، ویس گوینده + Forced Alignment، بدون متن |
| v07 | Paper × Blueprint (نسخه‌ی پرجزئیات) | همان NPV با دوربین سینمایی و پس‌زمینه‌های تصویرسازی‌شده (زمان‌ها از `v06/times.ts`) |
| v08 | Halftone Pop | معرفی NFP — ۲۶ث عمودی، ویس خود گوینده + Forced Alignment، کاراکتر هافتون با ژست‌های ثابت (عکس‌های `public/v08/char/*.png` همراه نیست) |
| v09 | Story Montage | مونتاژ استعاری انگلیسی — ۳۱ث عمودی، ۱۱ عکس + دوربین بی‌وقفه (عکس‌ها و صدا همراه نیست؛ افکت‌هایش را `make-sfx-09.mjs` می‌سازد) |
| v19 | Documentary | «فرشته‌ی خداوند» — ۵:۴۷ افقی، **گفت‌وگوی دو گوینده** (Hooman/Farideh روی eleven_v4)، ۳۳ خط؛ مرجع کامل سبک (`styles/previews/documentary.jpg`). موتورش در `examples/v19/lib` (همان `src/styles/documentary/engine`)، متن و صداها در `pipeline/` (`doc-voices` → `doc-build-vo`)، صداگذاری در `audio.ts`. فونت Morabba همراه نیست: در `Video19.tsx` به Vazirmatn عوض کن و ابرها را از `public/styles/documentary/clouds` به `public/v19/clouds` کپی کن |
| v10 | Photocopy Story | داستان NFP — ۶۶ث افقی، TTS (`v10-narration.mjs`)، عکس‌های چاپی Unsplash (id و عکاس در `PHOTOS-CREDITS.md`؛ خودت دانلود کن) |
