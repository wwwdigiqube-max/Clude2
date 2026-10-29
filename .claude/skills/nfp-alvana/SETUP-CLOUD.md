# راه‌اندازی و عیب‌یابی در ابر (Claude Code cloud sessions)
این فایل را وقتی بخوان که setup یا doctor مشکلی گزارش کرد، یا کاربر درباره‌ی تنظیمات پرسید. برای کار روزانه همان `CLAUDE.md` ریشه کافی است.

## ۱. محیط
- **VM:**
  - Ubuntu 24.04 x86_64
  - حدود ۴ vCPU، ۱۶GB رم، ۳۰GB دیسک
  - **بدون GPU**
  - Node 22، Python 3، git و gh (gh از پروکسی GitHub احراز می‌شود)
  - ffmpeg و Chrome از پیش نصب نیستند. setup نصبشان می‌کند.
- **کاربر:** root. `apt-get` کار می‌کند.
- **شبکه:**
  - همه‌ی ترافیک از پروکسی امنیتی ابر رد می‌شود. برای فرایندها `HTTPS_PROXY=http://127.0.0.1:<port>` و `NODE_EXTRA_CA_CERTS` تنظیم شده.
  - `fetch` خود Node پروکسی را نمی‌شناسد. ابزارهای کیت با `tools/lib/net.mjs` از `undici` استفاده می‌کنند، پس فقط با `npm install` کار می‌کنند.
  - اسکریپت تازه‌ای که `fetch` دارد هم باید `import "./lib/net.mjs"` داشته باشد. اگر در پوشه‌ی دیگری است، مسیر را درست بده.
- **سطح شبکه‌ی پیش‌فرض (Trusted):**
  - مجاز: npm، PyPI، GitHub، `*.googleapis.com` (و دانلود Chrome از `storage.googleapis.com`)، مخزن‌های Ubuntu، `fonts.googleapis.com`.
  - **مجاز نیست:** `api.elevenlabs.io`، `api.telegram.org`، `remotion.media`.
  - میزبان غیرمجاز جواب `403` با هدر `x-deny-reason: host_not_allowed` می‌دهد.
- **زمان:**
  - دستور جلوی صحنه پیش‌فرض ۲ دقیقه، حداکثر ۱۰ دقیقه.
  - دستوری که به پس‌زمینه برود حداکثر ۳۰ دقیقه‌ی دیگر می‌ماند.
  - VM بعد از چند دقیقه بی‌کاری می‌خوابد. فایل‌ها می‌مانند، ولی کار در حال اجرا ممکن است از دست برود. رندر را با `render-chunks` و `RENDER_BUDGET_SEC` بزن (`CLAUDE.md`).
- **جلسه:**
  - هر جلسه یک clone تازه از ریپو است. هر چیزی که باید بماند، **commit و push به main** شود.
  - فایل‌های بیرون از ریپو (مثل `/opt/nfp`) در کش محیط می‌مانند، فقط اگر setup script محیط ساخته باشدشان.

- **پیوست‌های چت:**
  - در Remote Control مستند است که اپ Claude عکس‌ها را در `~/.claude/uploads/` ذخیره می‌کند و فایل‌های دیگر را به‌صورت `@` فایل می‌دهد.
  - برای جلسه‌ی ابری مستند نیست. اول همان‌جا را بگرد (`CLAUDE.md`)، بعد سراغ `uploads/` گیت‌هاب برو.

## ۲. چیزهایی که کاربر یک بار تنظیم کرده (راهنمای کاربر: `GUIDE-FA.md`)
همه در claude.ai/code هستند: آیکون ابر بالای کادر پیام → چرخ‌دنده‌ی کنار محیط (Edit environment).
1. **Setup script:** محتوای `scripts/environment-setup.sh`. ابزارهای سیستم و Chrome را یک بار نصب می‌کند و کش می‌شود. اگر نگذاشته باشد، `scripts/cloud-setup.sh` هر جلسه همان‌ها را نصب می‌کند (۱ تا ۳ دقیقه کندتر).
2. **Network secrets** (پلن Pro و Max)، برای ElevenLabs:
   - Allowed websites: `api.elevenlabs.io`
   - Custom headers: `xi-api-key`، با Prefix خالی و Value برابر کلید.
   - کلید وارد VM نمی‌شود. پروکسی خودش اضافه‌اش می‌کند، و همین secret میزبان را هم باز می‌کند.
3. **پلن Team و Enterprise** (Network secrets ندارند):
   - Environment variables: `ELEVENLABS_API_KEY=sk_…`
   - Network access روی **Custom**، با `api.elevenlabs.io` و تیک **Also include default list of common package managers**.
4. **تلگرام (اختیاری):**
   - Environment variables: `TELEGRAM_BOT_TOKEN=…` و `TELEGRAM_CHAT_ID=…`
   - Network access روی Custom، با `api.telegram.org` و تیک لیست پیش‌فرض.
   - توکن ربات در مسیر URL است، نه هدر. برای همین Network secret به کارش نمی‌آید.

بعد از تغییر تنظیمات، جلسه‌ی باز تا بیدار شدن بعدی مقدار قبلی را دارد. **جلسه‌ی تازه** شروع شود.

## ۳. اگر کاربر از «قالب» (template) آمده، نه از bootstrap
ریپو از اول کیت را دارد و `CLAUDE.md` همین فایل‌هاست. hook هم خودش اجرا می‌شود. فقط گزارش doctor را بخوان و اولین ویدیو را شروع کن.

## ۴. عیب‌یابی
| نشانه | علت | راه‌حل |
|---|---|---|
| doctor: `ffmpeg missing` | apt شکست خورد، یا شبکه‌ی محیط None است | `bash scripts/cloud-setup.sh` و لاگ `/tmp/nfp-apt.log`. اگر apt نشد، setup از ffmpeg خود Remotion استفاده می‌کند (`/usr/local/bin/ffmpeg`) |
| `error while loading shared libraries: libnss3.so` | کتابخانه‌های Chrome نصب نیستند | `apt-get install -y libnss3 libgbm1 libasound2t64 libatk-bridge2.0-0 libcups2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libxfixes3 libpango-1.0-0 libcairo2 libdbus-1-3 libatk1.0-0` |
| Remotion: `Could not find a browser` یا دانلود `remotion.media` شکست خورد | Remotion می‌خواهد Chrome را از `remotion.media` بگیرد که مجاز نیست | `bash scripts/cloud-setup.sh` (از `storage.googleapis.com` می‌گیرد) یا `REMOTION_CHROME=/opt/nfp/chrome-headless-shell-linux64/chrome-headless-shell` |
| رندر سه‌بعدی خطای WebGL یا صفحه‌ی سیاه می‌دهد | GPU نیست | `--gl=swangle` (پیش‌فرض ابر در `remotion.config.ts`). اگر باز نشد: `--gl=swiftshader` |
| `Timeout exceeded rendering the component initially` | لود داده یا فونت در CPU کند است | `--timeout=300000` |
| رندر وسط کار قطع شد | دستور به سقف زمان خورد، یا VM خوابید | همان دستور `render-chunks` را دوباره بزن. از تکه‌ی بعدی ادامه می‌دهد |
| ElevenLabs `401` | کلید نیست یا اشتباه است | کاربر Network secret را بسازد یا دوباره بسازد (بخش ۲). بعد جلسه‌ی تازه |
| ElevenLabs `403 host_not_allowed` یا `ECONNREFUSED` | secret تعریف نشده و میزبان مجاز نیست | همان (بخش ۲) |
| ابزار Node خطای `fetch failed` یا `ENOTFOUND` می‌دهد | `undici` نصب نیست، یا اسکریپت `net.mjs` را import نکرده | `npm install` و `import "./lib/net.mjs"` |
| `git push` به main رد شد | main محافظت‌شده است یا جلو رفته | `git fetch origin main && git merge origin/main`، بعد دوباره push. اگر نشد: شاخه + PR + merge با `gh api` (`deliver.mjs` خودش این کار را می‌کند) |
| `gh pr ...` خطای GraphQL می‌دهد | پروکسی GitHub فقط REST را قبول می‌کند | از `gh api repos/{owner}/{repo}/...` استفاده کن |
| GitHub فایل را قبول نکرد | فایل بالای ۱۰۰MB است | `deliver.mjs` نسخه‌ی ۴۵MB می‌سازد. فایل خام بزرگ را commit نکن |
| کاربر لینک را باز می‌کند و 404 می‌بیند | ریپو خصوصی است و کاربر در GitHub وارد نشده | در مرورگر گوشی با همان اکانت GitHub وارد شود |
| دیسک پر شد | تکه‌ها و فریم‌های قدیمی | پاک کردن `out/chunks`، `out/look` و `node_modules/.cache` |

## ۵. دانلود مرجع و عکس آزاد
- **پیش‌نیاز:** Network access محیط روی **Full**. Trusted این دامنه‌ها را ندارد.
- **یوتیوب:** `pip install yt-dlp` و `yt-dlp -f "mp4[height<=1080]" <link> -o uploads/ref.mp4`.
- **Google Drive:** `pip install gdown` و `gdown --fuzzy <link> -O uploads/`.
- **Dropbox:** `?dl=1` را به آخر لینک اضافه کن، بعد `curl -L`.
- **عکس آزاد:** از API ویکی‌مدیا (commons.wikimedia.org) با فیلتر لایسنس PD یا CC0 بگیر. اسم صاحب و لایسنس را در `videos/NN/CREDITS.md` بنویس.

## ۶. اتوماسیون (Routines)
کاربر می‌تواند در claude.ai/code/routines یک «روتین» بسازد که روی همین ریپو و همین محیط، روزانه یا هفتگی خودش اجرا شود.
- **نمونه‌ی دستور:** «طبق CLAUDE.md یک ریلز ۳۰ ثانیه‌ای با سبک hologram-hud درباره‌ی یک واقعیت علمی جالب بساز، بدون سؤال، و با deliver روی main و تلگرام بفرست».
- روتین بدون تأیید کار می‌کند و از سهمیه‌ی اشتراک کم می‌کند.
- دستورش باید کامل و بی‌ابهام باشد: موضوع، سبک، طول، صدا، تحویل.
