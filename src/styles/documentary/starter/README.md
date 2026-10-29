# شروع یک ویدئو مستند (برای هر موضوعی)
مسیر کامل در `styles/documentary.md` ← «مسیر کامل». خلاصه:
1. `lines.json`، `voices.json`، `audio.json` و `direction.md` را در `my-doc/` کپی کن (کنار `src/`، نه داخل public) و برای موضوع خودت بازنویسی کن.
   - `lines.json` = دیالوگ. `sp`: گوینده (A توضیح می‌دهد، B می‌پرسد). `[tag]`: حس جمله. `gap`: مکث بعد از خط (ثانیه). `take`: انتخاب دستی نسخه بعد از گوش‌دادن.
   - `voices.json` = شناسه‌ی صداها (Hooman و Farideh از کتابخانه‌ی ElevenLabs؛ پلن پولی. صداهای حسابت: `tools/eleven-voices.mjs`).
   - `direction.md` = اسکلت داستان + جدول شات (هر خط ← دنیا، اتفاق روی کلمه، متن).
   - `audio.json` = موزیک، افکت و صدای زمینه برای `tools/doc-mix.mjs`. زمان‌ها عدد یا کیو: `S:n` `E:n` `W:n:کلمه` `end` (+/− ثانیه).
2. `Video.tsx` را به `src/my-doc/Video.tsx` کپی کن؛ دو ایمپورت را عوض کن (`"../index"` ← `"../styles/documentary"`، `"./vo-sample.json"` ← `"./vo.json"`) و صحنه‌ها را از روی direction.md بنویس.
3. `vo-sample.json` زمان‌بندی ساختگی همین نمونه است؛ با صدای واقعی، `tools/doc-build-vo.mjs` فایل `vo.json` با همین شکل می‌سازد.
نمونه‌ی اجراشده: `npx remotion render Style-Documentary-Starter out/starter.mp4` (بی‌صدا).
