# Shot list · part 1 (hook → day 5). Source of truth; run to regenerate part1.md + part1.json.
import json, re, os
HERE = os.path.dirname(__file__)
CHAR = ("the same character from the reference images (stick-figure young man about 20, plain round off-white head about one third of his height, "
        "small black oval eyes, thin eyebrows, messy dark-brown hair tufts sticking out under a dark charcoal knit beanie with a headlamp, "
        "open worn rust-orange hooded jacket over a dark grey t-shirt, dark backpack, long thin black stick arms and legs, simple black hands, dark hiking boots, not chibi)")
STYLE = ("dark gritty animated survival story style for teens and adults, detailed digital painting, clean black outlines on the character, "
         "realistic painterly background with depth, muted desaturated colours, dramatic cinematic lighting, 16:9, no text, no watermark")
FANDOGH = ("Fandogh, the same tiny early mammal from the reference image (the size of a large mouse, soft warm-brown fur, big shiny black eyes, "
           "pointed whiskered pink nose, small round ears, long thin tail)")
TREX = ("the same Tyrannosaurus rex from the reference image (dark grey-green scaly skin, a long pale scar across the left side of its snout, golden eyes, mouth closed)")
WORLD = "Late Cretaceous Hell Creek, Montana: ferns, conifers and early flowering trees, no long-necked sauropods"

PRE = [
 ("R1", "برگه‌ی فندق (یک بار)", "رفرنس: عکس جنگل (character-anchor) برای سبک",
  "Character reference sheet of a tiny Late Cretaceous mammal named Fandogh: the size of a large mouse, soft warm-brown fur, big shiny black eyes, pointed whiskered pink nose, small round ears, long thin tail. Top row: front, side, back, and curled up asleep. Bottom row: three expressions (curious sniffing, scared, content). Plain dark-grey background with soft dramatic light. Same art style as the reference image: detailed digital painting, clean black outlines, muted colours, not a cute cartoon, no text."),
 ("R2", "رفرنس تی‌رکس (یک بار)", "رفرنس: عکس جنگل برای سبک. زخم روی پوزه، نشانه‌ی «همان تی‌رکسِ روز اول» در پایان است",
  "Reference image of one specific Tyrannosaurus rex, full side view standing in a misty Late Cretaceous jungle: dark grey-green scaly skin, a long pale scar across the left side of its snout, golden eyes, mouth closed, realistic proportions, heavy and powerful. Same art style as the reference image: detailed digital painting, muted colours, dramatic light, 16:9, no text."),
]

# kind: new = عکس تازه · crop = برش از عکس قبلی · pair = دو عکس قبل/بعد · clip = کلیپ Flow · reuse = عکسی که قبلاً ساختی · code = گرافیک تدوین
S = []
def shot(part, narr, see, kind, prompt="", cam="", sfx="", motion="", src=""):
    S.append(dict(part=part, narr=narr, see=see, kind=kind, prompt=prompt, cam=cam, sfx=sfx, motion=motion, src=src))

P = lambda body, who="char": f"{body}; {CHAR if who in ('char','both') else ''}{'; ' if who=='both' else ''}{FANDOGH if who in ('fandogh','both') else ''}; {WORLD}; {STYLE}".replace("; ; ", "; ")

# ---- hook ----
shot("قلاب", "روز دهم.", "توی تونل تاریک؛ پسر به پهلو دراز کشیده و فندق رو به سینه‌اش گرفته. خاک از سقف می‌ریزه، نور قرمز از یه شکاف باریک", "new",
     P("Shot H1 – inside a narrow dark underground tunnel dug into clay, the young man lying on his side with wide terrified eyes, holding a tiny furry mammal against his chest, dirt and dust falling from the tunnel ceiling, a thin red-orange light coming through a narrow gap between stones at the entrance, low close shot", "both"),
     cam="لرزش ممتد + ذرات خاک که می‌ریزه؛ کارت «روز ۱۰» بالای کادر", sfx="غرش بم زمین، ریزش خاک")
shot("قلاب", "زمین زیر تنت می‌لرزه. خاک از سقف تونل می‌ریزه روی صورتت.", "زوم روی صورتش که خاک روش می‌ریزه", "crop", src="H1",
     cam="زوم ضربه‌ای به صورت، لرزش", sfx="ریزش خاک نزدیک")
shot("قلاب", "بیرون، آسمون رنگ آتیشه.", "بیرون در شب: آسمون قرمز و نارنجی، درخت‌های در حال سوختن، خاکستر", "new",
     P("Shot H2 – exterior at night, a burning prehistoric forest along a riverbank, the whole sky glowing red and orange, falling ash and embers, a small burrow entrance in a clay bank in the foreground, no character visible, wide shot", "none").replace("; ; ", "; "),
     cam="پوش آروم، جرقه‌های رو تصویر", sfx="ترق‌تروق آتیش، باد داغ")
shot("قلاب", "و دم ورودی، یه چیز خیلی بزرگ داره نفس می‌کشه.", "از داخل تونل به سمت ورودی: پشت شکاف سنگ‌ها، پوزه‌ی عظیم پولک‌دار با زخم، بخار نفس می‌آد تو", "clip",
     f"Shot H3 – view from inside a dark tunnel toward its entrance, a narrow gap between stacked stones, right behind the gap a gigantic scaly reptilian snout with flared nostrils fills the opening, {TREX}, warm breath steam drifting into the tunnel, red firelight behind; {WORLD}; {STYLE}",
     motion="The huge snout behind the gap breathes slowly, nostrils flare, puffs of warm steam roll into the dark tunnel, dust swirls in the red light. Static camera, very slow push-in. Keep the art style exactly as in the image. No dialogue, no text.",
     cam="فقط حرکت خود کلیپ؛ موزیک قطع", sfx="نفس عظیم و خیس، نزدیک")
shot("قلاب", "ده روز پیش، توی تخت خودت خوابیده بودی.", "کات به سیاهی ← کارت عنوان «۱۰ روز تا شهاب‌سنگی که دایناسورها رو نابود کرد»", "code",
     cam="کات به سیاهی روی «پیش»، عنوان با لرزش کوتاه", sfx="ضربه‌ی بم + سکوت")
# ---- day 1 ----
shot("روز ۱", "دیشب مثل هر شب بود. داشتی یه مستند دیگه درباره‌ی انقراض دایناسورها می‌دیدی، تا وقتی چشمات بسته شد.", "اتاق خواب شب؛ پسر با همون لباس‌ها روی تخت خوابش برده، کوله کنار تخت، گوشی روشن توی دستش", "new",
     P("Shot D1a – a cozy small bedroom at night, the young man fallen asleep on top of his bed fully dressed in his usual clothes after a hike, his backpack on the floor next to the bed, his phone glowing in his loose hand playing a documentary about dinosaurs, posters of dinosaurs on the wall, warm lamp light, medium shot").replace(f"; {WORLD}", ""),
     cam="پن آروم؛ کارت «روز ۱»", sfx="صدای ضعیف مستند از گوشی، ساعت دیواری")
shot("روز ۱", "گوشیت ۲۳ درصد شارژ داشت. گفتی صبح شارژش می‌کنی.", "کلوزآپ صفحه‌ی گوشی: مستند دایناسور + باتری ۲۳٪", "crop", src="D1a",
     cam="زوم به گوشی؛ آیکون باتری ۲۳٪ رو من می‌کشم", sfx="کلیک قفل گوشی")
shot("روز ۱", "صبح، به‌جای سقف اتاقت، برگ‌هایی می‌بینی که هرکدوم از تختت بزرگ‌ترن.", "پسر روی خزه‌ها دراز کشیده، چشم‌هاش تازه باز شده، از بالا", "new",
     P("Shot D1b – top-down view of the young man lying on his back on mossy jungle ground, eyes just opening, confused, giant fern leaves around him bigger than a bed, morning mist, soft sunbeams"),
     cam="ترنزیشن پلک‌زدن (سیاه ← باز)، زوم آروم به عقب", sfx="پرنده‌های عجیب، حشره‌ها")
shot("روز ۱", "هوا داغ و خیسه. بوی خاک و گیاه می‌ده. نه صدای ماشینی، نه صدای آدمی.", "نمای اول‌شخص رو به بالا: سایبان سرخس‌های غول‌آسا با نور و مه", "new",
     P("Shot D1c – looking straight up from the forest floor at a towering canopy of giant ferns and prehistoric trees, sunbeams through humid mist, dragonflies, no character visible, wide shot", "none"),
     cam="چرخش آروم دوربین", sfx="جنگل باستانی، رطوبت")
shot("روز ۱", "کنارت یه چیزی از زمین تا بالای سرت رفته، شبیه تنه‌ی درخت.", "عکس اولی که ساختی (پسر کنار پای غول)", "reuse", src="shot01",
     cam="پن از پسر به سمت پا", sfx="سکوت ناگهانی جنگل")
shot("روز ۱", "ولی درخت نیست. پنجه داره.", "کلیپی که خودت ساختی: پسر چشمش رو می‌ماله و یهو به پنجه نگاه می‌کنه", "reuse", src="clip-wake-lookup (آماده است)",
     cam="کات روی لحظه‌ی بالا نگاه کردن", sfx="ضربه‌ی بم کوتاه")
shot("روز ۱", "پا آروم بلند میشه، یه قدم جلوتر می‌کوبه زمین، و زمین زیر تو می‌لرزه.", "عکس باز shot01 با لرزش شدید و گرد و خاک (کلیپ لازم نیست)", "code", src="shot01",
     cam="سایه‌ی پا روی زمین، لرزش شدید و ذرات خاک رو من می‌سازم؛ اعتبار Flow خرج نمیشه", sfx="قدم عظیم + لرزش")
shot("روز ۱", "نفس نمی‌کشی تا صدای قدم‌ها دور بشه.", "صورت پسر، یخ‌زده", "crop", src="shot01", cam="زوم خیلی آروم، سکوت", sfx="قدم‌ها که دور میشن")
shot("روز ۱", "گوشیت هنوز توی جیبته. آنتن نداره. اینترنت نداره.", "عکس گوشی که ساختی، با ویرایش «10 DAYS»", "reuse", src="shot02 (ویرایش‌شده)",
     prompt="Edit this image: change the text on the phone screen to \"ASTEROID IMPACT IN 10 DAYS\" and below it \"3000 KM SOUTH\", clear and readable. Keep everything else exactly the same.",
     cam="پن آروم", sfx="بوق بی‌آنتن")
shot("روز ۱", "ولی یه پیام روی صفحه‌ست. پیامی که دیشب نبود: «برخورد: ۱۰ روز دیگه. ۳۰۰۰ کیلومتر جنوب.»", "کلوزآپ صفحه", "crop", src="shot02",
     cam="زوم روی صفحه؛ متن فارسی پیام رو من روی صفحه می‌ذارم", sfx="آژیر هشدار کوتاه")
shot("روز ۱", "این برخورد رو از مستندهایی که همیشه می‌دیدی می‌شناسی. یه سنگ تقریباً ۱۰ کیلومتری، که می‌خوره جایی که امروز اسمش مکزیکه.", "خاطره: صفحه‌ی گوشی توی اتاق تاریک، شهاب‌سنگ عظیم نزدیک زمین", "new",
     "Shot D1d – a glowing phone screen in a dark bedroom showing a documentary illustration of a huge asteroid approaching planet Earth from space, the Gulf of Mexico visible on Earth, dramatic light; same art style as the reference image: detailed digital painting, muted colours, 16:9, no text, no watermark",
     cam="فلش‌بک: رنگ سپیا و لرزش تصویر؛ نقشه و برچسب «۱۰ کیلومتر · مکزیک» رو من می‌سازم", sfx="صدای ضعیف راوی مستند، ووش")
shot("روز ۱", "هر دایناسوری که امروز می‌بینی، ۱۰ روز وقت داره.", "دشت کنار رود: گله‌ی تریسراتوپس و اردک‌نوک دور، پسر کوچیک از پشت", "new",
     P("Shot D1e – a wide river valley at midday, the young man small in the foreground seen from behind standing on a rise, in the distance peaceful herds of Triceratops and duck-billed Edmontosaurus grazing along the river, epic wide shot"),
     cam="پن عریض", sfx="صدای گله‌ها دور، باد")
shot("روز ۱", "خودشون نمی‌دونن.", "زوم روی یه تریسراتوپس آروم", "crop", src="D1e", cam="زوم آروم", sfx="نفس آروم حیوون")
shot("روز ۱", "تو می‌دونی.", "زوم روی صورت پسر (از عکس گوشی)", "crop", src="shot02", cam="زوم ضربه‌ای به چشم‌ها", sfx="ضربه‌ی بم")
shot("روز ۱", "گوشی رو خاموش می‌کنی. ۲۲ درصد. از این به بعد، هر یه درصد، یه تصمیمه.", "دست و گوشی که خاموش میشه", "crop", src="shot02",
     cam="صفحه سیاه میشه؛ باتری ۲۲٪ رو من می‌کشم", sfx="بیپ خاموش شدن")
shot("روز ۱", "عصر، صاحب اون پا رو می‌بینی. تی‌رکس. ۱۲ متر از سر تا دم. از پشت سرخس‌ها رد میشه و بو می‌کشه.", "عکس تی‌رکس که ساختی (پسر پشت سرخس)", "reuse", src="shot04 (ویرایش‌شده)",
     prompt="Edit this image: add a long pale scar across the left side of the Tyrannosaurus rex's snout, and make the light warm late-afternoon. Keep everything else exactly the same.",
     cam="پن از تی‌رکس به پسر؛ برچسب «۱۲ متر»", sfx="قدم‌های سنگین، بو کشیدن")
shot("روز ۱", "یه لحظه، فقط یه لحظه، سرش سمت تو برمی‌گرده.", "کلوزآپ سر تی‌رکس لای سرخس‌ها، چشمش مستقیم به دوربین", "new",
     f"Shot D1g – close-up of the head of {TREX} slowly turning toward the camera between giant fern leaves, one golden eye looking straight at the viewer, warm late-afternoon light, tense; {WORLD}; {STYLE}",
     cam="زوم خیلی آروم به چشم؛ موزیک قطع", sfx="یه نفس عمیق دایناسور")
shot("روز ۱", "بعد میره.", "صورت ترسیده‌ی پسر", "crop", src="shot04", cam="ثابت؛ آزاد شدن نفس", sfx="قدم‌های دورشونده")
# ---- day 2 ----
shot("روز ۲", "صبح، کنار ریشه‌ی درختی که زیرش خوابیدی، یه سوراخ کوچیک می‌بینی.", "پسر کنار ریشه‌ی درخت غول‌آسا قوز کرده، یه سوراخ کوچیک", "new",
     P("Shot D2a – early morning, the young man crouching next to the huge roots of a giant tree, peering curiously at a small round burrow hole between the roots, soft golden light, medium shot"),
     cam="کارت «روز ۲»؛ پوش آروم", sfx="پرنده‌ی صبح")
shot("روز ۲", "یه حیوون پشمالو، اندازه‌ی یه موش بزرگ، سرش رو میاره بیرون. بو می‌کشه. برمی‌گرده تو.", "فندق سرش رو از سوراخ بیرون میاره", "clip",
     f"Shot D2b – close-up at ground level of a small burrow hole between tree roots, {FANDOGH} poking its head out, sniffing the air, morning light, the young man's boots blurred in the background; {WORLD}; {STYLE}",
     motion="The tiny mammal pokes its head out of the hole, sniffs the air with twitching whiskers, looks around, then quickly ducks back inside. Static camera. Keep the art style exactly as in the image. No dialogue, no text.",
     cam="فقط حرکت کلیپ", sfx="خش‌خش ریز، بو کشیدن")
shot("روز ۲", "اسمش رو می‌ذاری فندق.", "کلوزآپ فندق + اسمش روی تصویر", "crop", src="D2b", cam="فریز کوتاه + کارت اسم «فندق»", sfx="«پاپ» ملایم")
shot("روز ۲", "تی‌رکس برای زنده موندن هر روز خروارها گوشت لازم داره.", "سایه‌ی تی‌رکس بالای لاشه‌ی یه دایناسور، غیرخشن", "new",
     f"Shot D2c – silhouette of {TREX} standing over the body of a fallen duck-billed dinosaur at dusk, seen from far away through trees, not graphic, no blood; {WORLD}; {STYLE}",
     cam="پن کند", sfx="صدای بم دور")
shot("روز ۲", "فندق با چندتا دونه و حشره سیر میشه، و هر وقت خطر باشه، میره زیر زمین.", "فندق یه دونه رو با دست‌هاش گرفته و می‌جوه", "new",
     P("Shot D2d – close-up of Fandogh sitting up holding a seed in its tiny paws and nibbling it, a small beetle nearby, next to its burrow entrance, soft morning light", "fandogh"),
     cam="زوم آروم", sfx="جویدن ریز")
shot("روز ۲", "همون‌جا اولین قانون این دنیا رو می‌فهمی: هرچی بزرگه، تموم میشه.", "نمادین: سایه‌ی دایناسورهای بزرگ جلوی غروب، فندق جلوی سوراخ", "new",
     P("Shot D2e – symbolic composition at sunset: huge dark silhouettes of dinosaurs walking along the horizon, and in the foreground Fandogh sitting safely at the entrance of its burrow, warm orange sky, wide shot", "fandogh"),
     cam="فوکوس از دایناسورها به فندق", sfx="باد، صدای دور")
shot("روز ۲", "دانشمندها فکر می‌کنن بعد از برخورد، تقریباً هیچ حیوون خشکی بزرگ‌تر از حدود ۲۵ کیلو زنده نموند. اون‌هایی موندن که می‌تونستن قایم بشن و با غذای کم دووم بیارن.", "گرافیک: ترازو / خط ۲۵ کیلو روی تصویر تار", "code", src="D2e",
     cam="اینفوگرافیک من روی عکس تار", sfx="تیک‌تیک")
shot("روز ۲", "تو ۷۰ کیلویی. پس باید مثل فندق فکر کنی. قانون اول: کوچیک بمون.", "صورت مصمم پسر + کارت قانون", "crop", src="D2a",
     cam="کارت امضای «قانون اول: کوچیک بمون» (طراحی ثابت کانال)", sfx="مهر/ضربه")
# ---- day 3 ----
shot("روز ۳", "گلوت می‌سوزه. صدای آب رو دنبال می‌کنی تا می‌رسی به یه رود پهن و گل‌آلود.", "پسر با لب‌های خشک به یه رود پهن و گل‌آلود می‌رسه", "new",
     P("Shot D3a – hot hazy midday, the young man with dry cracked lips pushing through ferns and arriving at the bank of a wide brown muddy river, relief and caution on his face, wide shot"),
     cam="کارت «روز ۳»؛ پن به رود", sfx="آب رود، حشره‌ها")
shot("روز ۳", "لب آب، یه تنه‌ی درخت شناوره. آروم پلک می‌زنه.", "«تنه»ی شناور که یه چشم داره و پلک می‌زنه", "clip",
     "Shot D3b – close-up of the surface of a murky brown river, what looks like a floating log, then a reptile eye on it, a large prehistoric crocodile almost fully submerged, tense; " + f"{WORLD}; {STYLE}",
     motion="The floating 'log' stays still, then a reptile eye slowly opens and blinks once, small ripples move around it. Static camera. Keep the art style exactly as in the image. No dialogue, no text.",
     cam="فقط کلیپ", sfx="آب آروم، سکوت")
shot("روز ۳", "تنه نیست. کروکودیله.", "زوم روی چشم کروکودیل", "crop", src="D3b", cam="زوم ضربه‌ای", sfx="ضربه‌ی بم")
shot("روز ۳", "پس لب آب نمی‌ری. چند قدم عقب‌تر، توی شن، یه چاله می‌کنی. آب آروم از لای شن نشت می‌کنه. گل‌آلودیش کمتره، و دور از دندون‌هاست.", "پسر چند قدم دورتر از رود توی شن چاله کنده و آب توش نشت می‌کنه", "new",
     P("Shot D3c – the young man kneeling on a sandy riverbank several steps away from the water, digging a small pit with his hands, clearer water slowly seeping into the bottom of the pit, the river and a crocodile far in the background, medium shot"),
     cam="زوم به آبی که نشت می‌کنه", sfx="کندن شن، قل‌قل آب")
shot("روز ۳", "یه چیز دیگه هم یادت میاد: توی اون انقراض، موجودات آب شیرین، مثل لاک‌پشت‌ها، قورباغه‌ها و حتی همین کروکودیل‌ها، بهتر از بقیه زنده موندن.", "حاشیه‌ی رود: لاک‌پشت روی کنده، قورباغه، کروکودیل دور", "new",
     "Shot D3d – calm river edge scene: a turtle resting on a half-sunken log, a frog on a lily pad, a crocodile far in the background, dragonflies, peaceful, no character visible; " + f"{WORLD}; {STYLE}",
     cam="پن آروم، برچسب‌های کوچیک اسم حیوون‌ها", sfx="قورباغه، آب")
shot("روز ۳", "قبل از این‌که از رود دور بشی، چندتا ماهی کوچیک رو که توی گودال‌های کم‌عمق ساحل گیر افتادن، با دست می‌گیری. روی سنگ‌های داغ پهنشون می‌کنی تا خشک بشن. غذای چند روزت جور میشه.", "پسر توی گودال کم‌عمق ماهی می‌گیره؛ ماهی‌ها روی سنگ‌های صاف", "new",
     P("Shot D3e – the young man crouching in a shallow pool on the riverbank catching a small fish with his bare hands, a few small fish already laid out on flat sun-warmed stones to dry, bright hot light, medium shot"),
     cam="از دست به سنگ‌ها", sfx="شلپ آب")
shot("روز ۳", "قانون دوم: کنار آب بمون.", "نمای باز رود + کارت قانون", "crop", src="D3a", cam="کارت امضای «قانون دوم»", sfx="مهر/ضربه")
# ---- day 4 ----
shot("روز ۴", "صبح، زمین می‌لرزه. این بار فرق داره. صدها قدم با هم. یه گله‌ی اردک‌نوک از کنار رود رد میشن. بزرگ، آروم، بی‌خیال.", "گله‌ی اردک‌نوک‌ها توی مه صبح کنار رود؛ پسر کوچیک جلوی کادر", "new",
     P("Shot D4a – misty morning, a large herd of duck-billed Edmontosaurus walking calmly along the riverbank, the young man small in the foreground hiding behind a bush watching in awe, wide shot"),
     cam="کارت «روز ۴»؛ لرزش ریتمیک قدم‌ها", sfx="صدها قدم، صدای گله")
shot("روز ۴", "بعد یه صدای بم و سنگین از دور. صدایی که بیشتر از گوش‌هات، توی سینه‌ات حسش می‌کنی.", "گله سرها رو بلند می‌کنه، نگران", "crop", src="D4a",
     cam="لرزش خیلی ریز تصویر هم‌زمان با صدا", sfx="بوم بم تی‌رکس (زیر صدا)")
shot("روز ۴", "گله رم می‌کنه. درخت‌ها می‌شکنن.", "گله در حال رم کردن، درخت‌های شکسته، گرد و خاک", "clip",
     P("Shot D4b – the herd of duck-billed Edmontosaurus panicking and stampeding through the forest toward the camera, trees snapping, dust clouds, chaos, dramatic low angle", "none"),
     motion="The herd stampedes past the camera in panic, trees crack and fall, dust explodes into the air, the ground shakes violently. Handheld camera shake. Keep the art style exactly as in the image. No dialogue, no text.",
     cam="لرزش شدید", sfx="رم کردن، شکستن چوب")
shot("روز ۴", "خودت رو پشت یه تنه‌ی افتاده پرت می‌کنی و چشمات رو می‌بندی.", "پسر پشت یه تنه‌ی افتاده، سرش رو گرفته", "new",
     P("Shot D4c – the young man diving behind a large fallen tree trunk, covering his head with his arms, eyes shut, dust and leaves flying over him, giant legs blurred passing behind, close dynamic shot"),
     cam="لرزش + تاری حرکت", sfx="قدم‌های عبوری، نفس‌نفس")
shot("روز ۴", "وقتی گرد و خاک می‌شینه، یکی‌شون جا مونده. زیر دست‌وپای بقیه موند.", "گرد و خاک نشسته؛ یه اردک‌نوک بی‌حرکت افتاده، پسر کوچیک نزدیک میشه", "new",
     P("Shot D4d – the dust settling in shafts of light, one duck-billed dinosaur lying still on its side among broken trees, not graphic, no blood, the young man small and quiet walking toward it, somber wide shot"),
     cam="سکوت؛ پوش آروم", sfx="سکوت، پرنده‌ی تنها")
shot("روز ۴", "کنارش زانو می‌زنی. و یه چیزی می‌بینی که لازمش داری: استخون کتفش. پهن، صاف، اندازه‌ی یه پارو. از امروز، بیلت یه دایناسوره.", "پسر یه استخون پهن و صاف رو مثل پارو بالا گرفته", "new",
     P("Shot D4e – the young man kneeling, holding up a large flat pale shoulder-blade bone the size of a paddle with both hands, looking at it with determination, the fallen dinosaur out of focus far behind, not graphic, medium shot"),
     cam="زوم روی استخون؛ برچسب «بیل»", sfx="ضربه‌ی کوتاه")
# ---- day 5 ----
shot("روز ۵", "سنگ ۳۰۰۰ کیلومتر دورتر می‌خوره. ولی آسمون همه‌جا یکیه. دانشمندها فکر می‌کنن چند دقیقه بعد از برخورد، تیکه‌های داغی که به آسمون پرت شدن، مثل میلیون‌ها شهاب برمی‌گردن و هوا رو داغ می‌کنن. خیلی از جنگل‌ها آتیش می‌گیرن.", "تصویر خیالی: آسمون پر از هزاران شهاب داغ روی جنگل", "new",
     "Shot D5a – vision of the near future: a night sky full of thousands of glowing streaks of debris raining down over a vast prehistoric forest, the horizon starting to glow orange with wildfires, epic and terrifying, no character visible; " + f"{WORLD}; {STYLE}",
     cam="کارت «روز ۵»؛ رنگ خاطره/پیش‌بینی، نقشه‌ی ۳۰۰۰ کیلومتر رو من می‌سازم", sfx="ووش‌های دور، غرش آسمان")
shot("روز ۵", "روی زمین، جایی برای قایم شدن نیست. زیر زمین شاید باشه.", "دوربین از آسمون میره پایین زیر خاک", "code", src="D5a",
     cam="تیلت به پایین و ترنزیشن به سیاهی خاک", sfx="سکوت")
shot("روز ۵", "یه دیواره‌ی رسی کنار رود پیدا می‌کنی. ولی قبل از کندن، به تنه‌ی درخت‌ها نگاه می‌کنی.", "پسر جلوی دیواره‌ی رسی کنار رود، بیل استخونی روی شونه", "new",
     P("Shot D5b – the young man standing in front of a tall clay riverbank wall, the flat bone shovel resting on his shoulder, looking around thoughtfully, trees along the bank, afternoon light, medium wide shot"),
     cam="پن", sfx="رود")
shot("روز ۵", "روی همه‌شون یه خط گل خشک‌شده هست. تا اینجا آب بالا اومده. سیل.", "کلوزآپ تنه‌ی درخت با خط گل خشک؛ دست پسر روی خط", "new",
     P("Shot D5c – close-up of several tree trunks along the river with a clear horizontal line of dried mud showing an old flood level, the young man's black hand touching the mud line, realization"),
     cam="زوم روی خط", sfx="ضربه‌ی کوتاه")
shot("روز ۵", "پس جای لونه رو بالاتر از اون خط انتخاب می‌کنی. یه وجب بالاتر. فقط محض احتیاط.", "دیواره‌ی رسی با خط‌چین سطح سیل و فلش «یه وجب بالاتر»", "crop", src="D5b",
     cam="خط‌چین و فلش رو من می‌کشم (همین خط در روز ۱۰ دوباره دیده میشه)", sfx="تیک")

# ---- references to attach in Flow (computed from the prompt) ----
def refs(s):
    pr = s["prompt"]
    if s["kind"] == "reuse":
        return ["خود عکس " + s["src"].split(" ")[0] + " (ویرایش)"] if pr else []
    if s["kind"] in ("crop", "code"):
        return []
    if s["kind"] == "clip" and not pr:
        return ["فریم اول: " + s["src"]]
    r = []
    if CHAR in pr: r += ["عکس جنگل", "برگه‌ی شخصیت"]
    else: r += ["عکس جنگل (فقط برای سبک)"]
    if "Fandogh" in pr or "tiny furry mammal" in pr: r += ["برگه‌ی فندق"]
    if TREX in pr: r += ["رفرنس تی‌رکس"]
    return r
for s in S:
    s["refs"] = refs(s)

# ---- numbering + timing (narration ≈ 2.2 words/s + pause) ----
t = 0.0
for i, s in enumerate(S, 1):
    s["n"] = i
    w = len(s["narr"].split())
    d = max(2.6, w / 2.2 + 0.5)
    s["t"] = f"{int(t//60)}:{int(t%60):02d}"
    t += d
NEW = [s for s in S if s["kind"] == "new"]
CLIP = [s for s in S if s["kind"] == "clip"]
json.dump(dict(pre=PRE, shots=S, total=t), open(os.path.join(HERE, "part1.json"), "w"), ensure_ascii=False, indent=1)
KIND = dict(new="🖼 عکس تازه", crop="✂️ برش از عکس قبلی", clip="🎬 کلیپ Flow", reuse="♻️ عکسی که قبلاً ساختی", code="🎨 گرافیک تدوین", pair="🔁 دو عکس")
L = [f"# جدول شات‌ها · بخش ۱ (قلاب تا روز ۵)\n",
     f"- {len(S)} شات · حدود {int(t//60)}:{int(t%60):02d} دقیقه",
     f"- {len(NEW)} عکس تازه + {len(CLIP)} کلیپ Flow (عکس اول کلیپ‌ها هم تازه است، جز کلیپ shot01)",
     "- همه‌ی عکس‌ها 16:9، در یک پروژه‌ی Flow.",
     "- **رفرنس هر عکس:** عکس جنگل + برگه‌ی شخصیت. برای شات‌های فندق، برگه‌ی فندق. برای تی‌رکس، رفرنس تی‌رکس.\n",
     "## قدم صفر: دو رفرنس (یک بار برای کل کانال)\n"]
for rid, title, note, pr in PRE:
    L += [f"**{rid} · {title}**  \n{note}\n```\n{pr}\n```\n"]
L += ["## شات‌ها\n"]
for s in S:
    L += [f"**شات {s['n']} · {s['part']} · {s['t']}** · {KIND[s['kind']]}" + (f" (از {s['src']})" if s['src'] else ""),
          f"- 🎙 {s['narr']}", f"- 👁 {s['see']}"] + ([f"- 📎 رفرنس: {' + '.join(s['refs'])}"] if s['refs'] else [])
    if s["prompt"]:
        L += [f"- اسم فایل: `{s['prompt'].split(' – ')[0] if s['prompt'].startswith('Shot') else 'ویرایش ' + s['src']}`", "```", s["prompt"], "```"]
    if s["motion"]:
        L += ["- 🎬 پرامپت حرکت (Frames to Video، Fast، ۸ ثانیه):", "```", s["motion"], "```"]
    L += [f"- 🎥 {s['cam']}", f"- 🔊 {s['sfx']}", ""]
open(os.path.join(HERE, "part1.md"), "w").write("\n".join(L))
print(len(S), "shots", round(t), "s", len(NEW), "new", len(CLIP), "clips")
