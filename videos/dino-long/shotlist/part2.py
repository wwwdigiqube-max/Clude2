# Shot list · part 2 (day 6 → end). Source of truth; run to regenerate part2.md + part2.json.
import json, os
HERE = os.path.dirname(__file__)
CHAR = ("the same character from the reference images (stick-figure young man about 20, plain round off-white head about one third of his height, "
        "small black oval eyes, thin eyebrows, messy dark-brown hair tufts sticking out under a dark charcoal knit beanie with a headlamp, "
        "open worn rust-orange hooded jacket over a dark grey t-shirt, dark backpack, long thin black stick arms and legs, simple black hands, dark hiking boots, not chibi)")
STYLE = ("dark gritty animated survival story style for teens and adults, detailed digital painting, clean black outlines on the character, "
         "realistic painterly background with depth, muted desaturated colours, dramatic cinematic lighting, 16:9, no text, no watermark")
FANDOGH = ("Fandogh, the same tiny early mammal from the Fandogh reference image (the size of a large mouse, soft warm-brown fur, big shiny black eyes, "
           "pointed whiskered pink nose, small round ears, long thin tail)")
TREX = ("the same Tyrannosaurus rex from the T. rex reference image (dark grey-green scaly skin, a long pale scar across the left side of its snout, golden eyes)")
RAPTOR = ("a small feathered raptor dinosaur only knee-high to the young man (coyote-sized, its head no bigger than his hand; dark brown and grey feathers, "
          "long stiff feathered tail, slender scaly bird-like legs with a curved sickle claw on each foot, narrow toothy snout, glowing yellow eyes)")
RAPTOR_REF = "the same small feathered raptor from the raptor reference image"
WORLD = "Late Cretaceous Hell Creek, Montana: ferns, conifers and early flowering trees, no long-necked sauropods"
BANK = "the same low clay riverbank beside the same wide muddy brown river from the bank reference image"
TUNNEL = "the same narrow clay tunnel from the tunnel reference image"
EARTH = "the small earthen chamber at the deep end of the tunnel from the earth-tunnel reference image (earth walls and roots, no rocks, the entrance not visible)"
HOLE = "a small round entrance hole barely big enough for one person to crawl through on hands and knees (about as wide as the young man's shoulders)"

PRE = [
 ("R3", "رفرنس شکارچی با مقیاس (نسخه‌ی ۲، کوچیک)", "رفرنس: برگه‌ی شخصیت + رفرنس شکارچی قبلی (برای ظاهر) + شات ۱ (سبک شب)",
  "Reference image for scale: one small feathered raptor dinosaur standing next to the young man from the character reference, side view on a dark forest floor at night. The raptor is only knee-high to him: its back reaches his knee and its head is no bigger than his hand, a coyote-sized animal with dark brown and grey feathers, a long stiff feathered tail, slender scaly bird-like legs with a curved sickle claw on each foot, a narrow toothy snout and glowing yellow eyes, the same look as the raptor in the reference image but much smaller. Same art style as the reference images: detailed digital painting, clean dark outlines, muted colours, moonlight, 16:9, no text."),
]

S = []
def shot(part, narr, see, kind, prompt="", cam="", sfx="", motion="", src=""):
    S.append(dict(part=part, narr=narr, see=see, kind=kind, prompt=prompt, cam=cam, sfx=sfx, motion=motion, src=src))

def P(body, *who):
    locks = []
    if "char" in who: locks.append(CHAR)
    if "fandogh" in who: locks.append(FANDOGH)
    return "; ".join([body] + locks + [WORLD, STYLE])

# ---- day 6 ----
shot("روز ۶", "از طلوع تا غروب می‌کنی. دست‌هات تاول می‌زنه.", "پسر با استخون کتف توی دیواره‌ی رسی کنار رود می‌کنه، خاک می‌پره", "new",
     P(f"Shot D6a – sunrise, {BANK}, the young man digging into the clay bank with the flat paddle-shaped dinosaur shoulder-blade bone from the bone reference image, clumps of clay flying, sweat on his face, a small hole already started, medium shot", "char"),
     cam="کارت «روز ۶»؛ تایم‌لپس نور از طلوع به غروب", sfx="کندن خاک، نفس‌نفس")
shot("روز ۶", "ورودی کوچیک، که فقط خودت ازش رد بشی.", "ورودی کوچیک و گرد لونه توی دیواره‌ی رسی، پسر کنارش زانو زده", "new",
     P(f"Shot D6b – late afternoon, {BANK}, a small round burrow entrance dug into the clay bank, just big enough for one person to crawl through, roots hanging above it, the young man kneeling beside it with the bone shovel, dirt on his jacket, medium shot", "char"),
     cam="زوم به ورودی", sfx="خاک ریزان")
shot("روز ۶", "رو به شمال، پشت به جایی که سنگ می‌خوره.", "قطب‌نمای گرافیکی روی تصویر ورودی", "code", src="D6b",
     cam="قطب‌نما و فلش «جنوب ← برخورد» رو من می‌کشم", sfx="تیک")
shot("روز ۶", "و تونلی که اون‌قدر بره تو، که حداقل یه متر خاک بالای سرت باشه.", "برش عرضی کنار رود: تونل توی خاک، پسر داخلش، یه متر خاک بالای سرش، رود کنارش", "new",
     P("Shot D6c – a side cross-section cutaway view of the riverbank: the muddy river low on one side, the clay bank with a narrow tunnel dug sideways into it well ABOVE the water surface and above a pale dried-mud flood line on the bank, the young man crawling along the low narrow passage, which ends deeper inside in a small round chamber just tall enough to sit up in, a thick layer of earth and roots above him, grass and trees on top, clear educational illustration", "char"),
     cam="برچسب «۱ متر» و خط سطح سیل رو من می‌ذارم", sfx="ووش ملایم")
shot("روز ۶", "امیدواری خاک جلوی گرما رو بگیره. شاید حیوون‌های زیرزمینی همین‌طوری از اون روز جون سالم به در بردن.", "همون برش عرضی، فلش‌های گرما که به خاک می‌خورن", "code", src="D6c",
     cam="فلش‌های گرما از بالا که توی خاک متوقف میشن", sfx="هوهوی گرم")
shot("روز ۶", "شب، برای اولین بار توی خونه‌ی خودت می‌خوابی.", "داخل تونل شب؛ پسر جمع شده خوابیده، از ورودی کوچیک ستاره‌ها دیده میشن", "new",
     P(f"Shot D6d – night inside {EARTH}, the young man curled up asleep on the earthen floor with his backpack as a pillow, headlamp off, through the small round entrance hole (about as wide as his shoulders) a few stars and moonlight are visible, calm and cozy, close shot", "char"),
     cam="پوش خیلی آروم", sfx="جیرجیرک، رود دور")
shot("روز ۶", "قانون سوم: زیر زمین بمون.", "کارت قانون روی تصویر تونل", "crop", src="D6d", cam="کارت امضای «قانون سوم»", sfx="مهر/ضربه")
# ---- day 7 ----
shot("روز ۷", "فندق دیگه فرار نمی‌کنه. صبح دم ورودی منتظره.", "صبح؛ فندق جلوی ورودی لونه نشسته، پسر از تونل سرش رو بیرون میاره", "new",
     P(f"Shot D7a – morning, {BANK}, Fandogh sitting calmly right at the burrow entrance looking up, the young man's head and shoulders poking out of the tunnel, smiling slightly, soft golden light, close shot", "char", "fandogh"),
     cam="کارت «روز ۷»", sfx="پرنده‌ی صبح")
shot("روز ۷", "نصف دونه‌هات رو باهاش قسمت می‌کنی.", "کلوزآپ دست سیاه پسر با چندتا دونه؛ فندق یکی رو برمی‌داره", "new",
     P("Shot D7b – close-up of the young man's simple solid black hand held open with a few seeds on it, Fandogh taking one seed with its tiny paws, morning light, shallow depth of field", "fandogh"),
     cam="زوم آروم", sfx="جویدن ریز")
shot("روز ۷", "باهاش حرف می‌زنی. از خونه‌ات میگی، از اتاقت، از گوشی‌ای که یادت رفت شارژش کنی.", "پسر چهارزانو کنار ورودی، فندق روی زانوش گوش میده", "new",
     P(f"Shot D7c – the young man sitting cross-legged in front of the burrow entrance on {BANK}, talking softly and gesturing, Fandogh sitting on his knee looking up at him, warm afternoon light, the river behind, medium shot", "char", "fandogh"),
     cam="پن آروم", sfx="رود، صدای ملایم")
shot("روز ۷", "بعد گوشی رو روشن می‌کنی و عکس‌های خونه رو یکی‌یکی نشونش میدی. اتاقت. خیابون. آدم‌ها.", "از پشت شونه: گوشی روشن، فندق نور صفحه روی صورتشه", "new",
     P("Shot D7d – over-the-shoulder view: the young man's black hand holding his cracked phone toward Fandogh, the glowing screen showing a photo of a city street, Fandogh's face lit by the screen light, curious, dusk, close shot", "char", "fandogh"),
     cam="عکس‌ها رو من روی صفحه‌ی گوشی ورق می‌زنم (اتاق شات ۶، خیابون، آدم‌ها)", sfx="تیک ورق زدن")
shot("روز ۷", "جواب نمیده. ولی گوش میده.", "کلوزآپ صورت فندق با نور گوشی", "crop", src="D7d", cam="زوم به چشم‌های فندق", sfx="سکوت")
shot("روز ۷", "وقتی خاموشش می‌کنی، ۱۱ درصد مونده. ده درصد رو خرج عکس‌ها کردی. ارزشش رو داشت.", "صفحه‌ی گوشی خاموش میشه", "code", src="D7d",
     cam="باتری ۲۲٪ ← ۱۱٪ رو من می‌کشم", sfx="بیپ خاموش")
shot("روز ۷", "شب، وقتی بیدار میشی، توی جیب کاپشنت خوابیده.", "شب، ته تونل؛ پسر به پهلو خوابیده (صورتش پیداست)، فندق توی جیب کاپشنش جمع شده", "new",
     P(f"Shot D7e – night inside {EARTH}, medium shot like the earth-tunnel reference: the young man lying on his side half awake with a soft smile, his face clearly visible, Fandogh curled up asleep inside the pocket of his rust-orange jacket with only its head and tail showing, faint moonlight, peaceful", "char", "fandogh"),
     cam="پوش خیلی آروم", sfx="نفس آروم")
shot("روز ۷", "هفت روز توی دنیایی که هیچ‌کس رو نداشتی، و حالا یکی رو داری.", "همون، نمای کمی بازتر", "crop", src="D7e", cam="زوم به عقب، موزیک گرم", sfx="موزیک")
# ---- day 8 (rewritten: he is deep in the chamber; the entrance is never shown; the knee-high raptor crawls in) ----
shot("روز ۸", "نیمه‌شب. ته تونل بیدار میشی. یه صدای خراش از سمت ورودی. بو کشیدن.", "ته تونل، تاریک؛ پسر تازه بیدار شده و گوش میده، فندق توی جیبش گوش‌هاش رو تیز کرده", "new",
     P(f"Shot D8a – night, deep inside {EARTH}, almost dark, the young man just woken up, propped on one elbow, listening with wide eyes, his face clearly visible, Fandogh alert in his jacket pocket with ears up, the tunnel passage behind him disappearing into darkness, medium shot", "char", "fandogh"),
     cam="کارت «روز ۸»؛ تصویر تقریباً ثابت، فقط صدا", sfx="خراش و بو کشیدن از دور")
shot("روز ۸", "بعد صدای جلو اومدن. یه چیزی داره توی تونل میاد.", "همون، صورت پسر نزدیک‌تر", "crop", src="D8a", cam="زوم آروم به صورت", sfx="خش‌خش نزدیک‌شونده")
shot("روز ۸", "توی تاریکی، دو تا چشم زرد برق می‌زنه.", "ته راهروی تاریک تونل، نزدیک کف، دو تا چشم زرد کوچیک", "new",
     P(f"Shot D8b – looking down the dark narrow earth passage of the tunnel from the chamber, total darkness except two small glowing yellow eyes low near the floor of the passage, belonging to {RAPTOR_REF}, close to the ground, approaching", "none"),
     cam="لرزش خیلی ریز", sfx="خرخر آروم")
shot("روز ۸", "یه شکارچی پردار و چابک، که قدش فقط تا زانوی توئه. نه تی‌رکس؛ اون‌قدر کوچیک که توی تونل تو جا میشه.", "شکارچی کوچیک توی راهروی تنگ تونل به سمت دوربین میاد", "clip",
     P(f"Shot D8c – {RAPTOR_REF}, {RAPTOR}, creeping low through the narrow earth passage of the tunnel toward the camera, its body filling only the lower half of the passage, jaws slightly open, feathers bristling, lit faintly from behind by moonlight", "none"),
     motion="The small feathered raptor creeps forward through the narrow tunnel toward the camera, head low, then hisses and snaps once. Static camera. Keep the art style exactly as in the image. No dialogue, no text.",
     cam="فقط کلیپ", sfx="هیس، قدم‌های ریز")
shot("روز ۸", "هرچی کوچیکه، بی‌خطر نیست.", "زوم روی پنجه‌ی داسی", "crop", src="D8c", cam="زوم ضربه‌ای", sfx="ضربه‌ی بم")
shot("روز ۸", "پنجه‌اش رو می‌کشه. ساعدت می‌سوزه.", "پسر به دیوار اتاقک چسبیده، آستین پاره و خراش روی ساعد؛ شکارچی کوچیک جلوش؛ فندق توی جیب", "new",
     P(f"Shot D8d – inside {EARTH} at night, the young man pressed back against the earth wall, his face clearly visible and wincing, his rust-orange sleeve torn with three thin red scratch marks on his forearm (not gory), {RAPTOR_REF} crouched in front of him, only knee-high, Fandogh peeking terrified from his jacket pocket, dramatic medium shot", "char", "fandogh"),
     cam="لرزش، فلش قرمز ریز", sfx="خراش، آخ")
shot("روز ۸", "چاقو نداری. آتیش نداری. فقط یه چیز داری که این دنیا تا حالا ندیده.", "صورت مصمم پسر", "crop", src="D8d", cam="زوم به صورت", sfx="سکوت")
shot("روز ۸", "گوشی رو روشن می‌کنی. ۱۱ درصد.", "گوشی روشن میشه", "code", src="D8e", cam="باتری ۱۱٪", sfx="بیپ روشن")
shot("روز ۸", "آلارم رو می‌زنی و نور چراغ‌قوه رو مستقیم می‌گیری توی صورتش.", "پسر گوشی رو جلو گرفته، نور شدید توی صورت شکارچی کوچیک توی تونل", "clip",
     P(f"Shot D8e – inside {EARTH} at night, the young man holding his phone out toward {RAPTOR_REF}, a blinding white flashlight beam hitting its face in the narrow passage, the knee-high raptor recoiling with eyes squeezed shut, dust in the beam, medium shot", "char"),
     motion="The phone's flashlight blazes brighter and flickers, the small raptor screeches, spins around and scrambles away down the dark tunnel. Small camera shake. Keep the art style and character exactly as in the image. No dialogue, no text.",
     cam="فلش سفید روی کادر", sfx="آلارم گوشی، جیغ")
shot("روز ۸", "صدایی که ۶۶ میلیون سال زود به دنیا اومده، توی لونه می‌پیچه. شکارچی جیغ می‌کشه و توی شب گم میشه.", "ادامه‌ی کلیپ: فرار شکارچی", "crop", src="D8e", cam="اکوی آلارم", sfx="آلارم که اکو میشه")
shot("روز ۸", "ولی جرئت نمی‌کنی چراغ رو خاموش کنی. خون از دستت می‌چکه. فندق از جیبت بیرون میاد و کنار دستت می‌شینه.", "پسر توی اتاقک به دیوار تکیه داده، نور گوشی رو به راهرو، فندق کنار دستش", "new",
     P(f"Shot D8f – inside {EARTH}, the young man sitting with his back against the earth wall, exhausted, his face visible, holding his phone with its flashlight pointed down the dark passage, his scratched forearm resting on his knee, Fandogh sitting right next to his hand looking down the passage too, dust floating in the beam, medium shot", "char", "fandogh"),
     cam="تایم‌لپس نور از سیاه به آبی سحر", sfx="سکوت، چکه")
shot("روز ۸", "تا صبح، نور گوشی رو روی تونل نگه می‌داری و هیچ‌کدومتون تکون نمی‌خورین.", "همون، نور سحر", "crop", src="D8f", cam="ادامه‌ی تایم‌لپس", sfx="پرنده‌ی سحر")
shot("روز ۸", "وقتی آفتاب میزنه، خاموشش می‌کنی. ۳ درصد.", "گوشی خاموش میشه", "code", src="D8f", cam="باتری ۳٪", sfx="بیپ")
# ---- day 9 ----
shot("روز ۹", "تب داری. زخم دستت داغه.", "پسر رنگ‌پریده و عرق‌کرده، ساعدش با تیکه‌ای از تی‌شرت بسته شده", "new",
     P(f"Shot D9a – daylight, the young man sitting at the burrow entrance on {BANK}, pale and sweating with fever, his forearm wrapped in a strip of grey cloth, Fandogh beside him, tired eyes, medium close shot", "char", "fandogh"),
     cam="کارت «روز ۹»؛ تاری ملایم کناره‌ها (تب)", sfx="ضربان آروم")
shot("روز ۹", "با یه دست، آخرین ماهی‌ها رو خشک می‌کنی و ورودی رو با سنگ تنگ‌تر می‌کنی. فقط یه شکاف می‌مونه، برای هوا. دیگه هیچ‌چیز نباید بتونه بیاد تو.", "پسر با یه دست سنگ‌ها رو جلوی ورودی می‌چینه؛ ماهی‌ها روی سنگ", "new",
     P(f"Shot D9b – {BANK}, the young man using one hand to stack flat grey stones in front of the burrow entrance until only a tall thin vertical slit about as wide as a hand remains, a few small fish drying on a flat rock nearby, late afternoon, medium shot", "char"),
     cam="زوم به شکاف", sfx="سنگ روی سنگ")
shot("روز ۹", "گوشی رو یه بار دیگه روشن می‌کنی. پیام عوض شده: «برخورد: فردا.»", "عکس گوشی قرمز، این بار «فردا»", "reuse", src="عکس گوشی قرمز (ویرایش ۱۰ روز)",
     prompt="Edit this image: change the text on the phone screen to \"ASTEROID IMPACT: TOMORROW\", clear and readable, and make his face look more tired and pale. Keep everything else exactly the same.",
     cam="زوم به صفحه؛ متن فارسی رو من می‌ذارم", sfx="آژیر کوتاه")
shot("روز ۹", "۲ درصد. خاموشش می‌کنی.", "باتری ۲٪", "code", cam="باتری ۲٪ چشمک‌زن", sfx="بیپ ضعیف")
shot("روز ۹", "اون شب از تونل میای بیرون. آسمون پر از ستاره‌ست.", "شب؛ پسر بیرون لونه کنار رود نشسته، کهکشان راه شیری توی آسمون و آب", "new",
     P(f"Shot D9c – night, the young man sitting outside the burrow on {BANK}, seen from behind, Fandogh on his shoulder, looking up at a breathtaking sky full of stars and the Milky Way reflected in the calm river, wide shot", "char", "fandogh"),
     cam="تیلت آروم به آسمون", sfx="جیرجیرک، سکوت")
shot("روز ۹", "از دور، اون صدای بم آشنا میاد. همون تی‌رکس.", "سایه‌ی تی‌رکس اون طرف رود جلوی ستاره‌ها", "new",
     P(f"Shot D9d – night, far across the starlit river, the dark silhouette of {TREX} standing on the opposite bank against the stars, tiny in the frame, majestic and lonely, no character visible, wide shot", "none"),
     cam="زوم خیلی آروم", sfx="بوم بم دور")
shot("روز ۹", "آخرین شب دنیای دایناسورها. و فقط تو می‌دونی.", "دوباره پسر و آسمون", "crop", src="D9c", cam="زوم به عقب، موزیک غمگین", sfx="موزیک")
# ---- day 10 ----
shot("روز ۱۰", "صبح عجیبی نیست. همین عجیبش می‌کنه. پرنده‌ها می‌خونن، حشره‌ها وزوز می‌کنن، چندتا تریسراتوپس اون طرف رود آب می‌خورن.", "صبح آروم؛ چندتا تریسراتوپس اون طرف رود آب می‌خورن؛ پسر دم ورودی", "new",
     P(f"Shot D10a – peaceful bright morning on {BANK}, a few Triceratops drinking from the river on the far bank, birds in the trees, dragonflies over the water, the young man sitting at the narrow stone gap of his burrow entrance watching, wide shot", "char"),
     cam="کارت «روز ۱۰»؛ پن آروم", sfx="پرنده، حشره، آب")
shot("روز ۱۰", "هیچ‌کدومشون نمی‌دونن.", "زوم روی تریسراتوپس‌ها", "crop", src="D10a", cam="زوم آروم", sfx="آب خوردن")
shot("روز ۱۰", "بعد، از جنوب، یه نور. نه مثل خورشید. مثل این‌که یکی اشتباهی چراغ آسمون رو روشن کرده باشه.", "آسمون جنوب یهو سفید و درخشان میشه؛ تریسراتوپس‌ها سرشون رو بلند می‌کنن", "clip",
     P("Shot D10b – the same riverbank in the morning, the whole sky toward the south suddenly glowing an unnatural blinding white-yellow beyond the horizon, the Triceratops on the far bank lifting their heads, long sharp shadows, eerie silence, wide shot", "none"),
     motion="The southern sky slowly brightens to a blinding white glow, light sweeps across the landscape, the Triceratops raise their heads and freeze, birds burst out of the trees. Slow push-in. Keep the art style exactly as in the image. No dialogue, no text.",
     cam="فقط کلیپ", sfx="سکوت کامل، بعد سوت زیر")
shot("روز ۱۰", "چند دقیقه بعد، زمین شروع می‌کنه به لرزیدن. نه مثل قدم تی‌رکس. مثل این‌که کل دنیا تکون بخوره.", "همون نما با لرزش شدید و گرد و خاک", "code", src="D10a", cam="لرزش شدید و طولانی، ریزش خاک", sfx="غرش زلزله")
shot("روز ۱۰", "رودخونه یهو عقب میره… و برمی‌گرده. یه دیوار آب، برخلاف جهت جریان، از رود بالا میاد و ماهی‌ها رو پرت می‌کنه روی ساحل.", "دیوار آب از رود بالا میاد، ماهی‌ها روی ساحل پرت میشن", "clip",
     P("Shot D10c – the same wide muddy river: a churning wall of brown water surging upstream against the current, fish flying through the air and landing on the banks, trees whipping, chaotic, wide shot", "none"),
     motion="The river first pulls back exposing mud, then a wall of water rushes upstream across the frame, fish are thrown onto the banks, spray everywhere. Handheld shake. Keep the art style exactly as in the image. No dialogue, no text.",
     cam="فقط کلیپ", sfx="غرش آب")
shot("روز ۱۰", "آب تا خط گل روی درخت‌ها بالا میاد. یه وجب پایین‌تر از ورودی لونه‌ات می‌ایسته.", "آب درست تا خط گل روی تنه‌ها؛ یه وجب زیر ورودی لونه می‌ایسته؛ پسر از شکاف نگاه می‌کنه", "new",
     P(f"Shot D10d – {BANK}: the flooded brown water has risen exactly up to the old dried mud line on the tree trunks from the flood-line reference image and stopped just a hand's width below the narrow stone gap of the burrow entrance, the young man's wide eyes peeking out through the gap, medium shot", "char"),
     cam="زوم از خط گل به ورودی", sfx="آب آروم میشه، نفس")
shot("روز ۱۰", "وقتی آب عقب میره، می‌دوی پایین و هرچی ماهی روی ساحل مونده جمع می‌کنی. غذای روزهای تاریک.", "پسر روی ساحل خیس ماهی‌ها رو جمع می‌کنه و توی کاپشنش می‌ریزه", "new",
     P(f"Shot D10e – {BANK} after the water drops, the young man scrambling on the wet muddy shore gathering flopping fish into his rolled-up jacket, the strange bright sky above, urgency, medium shot", "char"),
     cam="دوربین دستی", sfx="شلپ، نفس‌نفس")
shot("روز ۱۰", "این تخیل نیست. دانشمندها توی داکوتای شمالی ماهی‌هایی پیدا کردن که توی آبششون دونه‌های ریز شیشه‌ای از همین برخورد گیر کرده بود.", "فسیل ماهی توی سنگ، با دونه‌های ریز شیشه‌ای در آبشش", "new",
     "Shot D10f – documentary close-up of a fossil fish preserved in grey rock, with tiny round glassy beads lodged in its gill area, a small ruler at the edge, museum lighting, no character visible, same art style as the reference image: detailed digital painting, clean outlines, muted colours, 16:9, no text, no watermark",
     cam="برچسب «تانیس، داکوتای شمالی» رو من می‌ذارم", sfx="ووش")
shot("روز ۱۰", "بعد همون دونه‌ها از آسمون شروع می‌کنن به باریدن. ریز و داغ، مثل تگرگ شیشه‌ای.", "دونه‌های ریز درخشان از آسمون می‌بارن و روی برگ و آب جلز ولز می‌کنن؛ پسر کلاهش رو گرفته", "new",
     P(f"Shot D10g – {BANK}, tiny glowing glass beads raining down from a reddening sky, sizzling on leaves and dimpling the river, the young man running toward the burrow holding his hood over his head, medium shot", "char"),
     cam="ذرات درخشان روی تصویر", sfx="تق‌تق ریز، جلز ولز")
shot("روز ۱۰", "آسمون کم‌کم قرمز میشه.", "آسمون پر از شهاب (همون تصویر روز ۵)", "reuse", src="شات ۴۵ (آسمون پر از شهاب)",
     cam="رنگ قرمزتر، پوش", sfx="غرش آسمون")
shot("روز ۱۰", "فندق رو توی جیبت محکم نگه می‌داری و میری ته تونل.", "عکس شات ۱ (تونل با فندق)", "reuse", src="شات ۱ (تونل)", cam="لرزش", sfx="ریزش خاک")
shot("روز ۱۰", "بیرون، اولین درخت‌ها آتیش می‌گیرن.", "عکس شات ۳ (جنگل در آتیش)", "reuse", src="شات ۳ (جنگل در آتیش)", cam="پوش آروم", sfx="آتیش")
shot("روز ۱۰", "و بعد، بیرون تونل، صدای قدم میاد. سنگین. آروم. نزدیک.", "صورت پسر که گوش میده", "crop", src="شات ۱", cam="زوم به صورت", sfx="قدم سنگین")
shot("روز ۱۰", "یه جثه‌ی غول‌پیکر بیرون لونه روی زمین می‌افته و سایه‌اش کامل ورودی رو می‌پوشونه.", "از داخل تونل: شکاف سنگی ورودی با یه سایه‌ی عظیم تاریک میشه", "new",
     P(f"Shot D10h – view from inside {TUNNEL} toward the tall thin vertical slit between stacked stones at its entrance (only as wide as a hand), the red firelight outside suddenly blocked by a huge dark shadow falling across the slit, dust shaking loose, ominous", "none"),
     cam="لرزش ضربه‌ای روی افتادن", sfx="افتادن عظیم، لرزش")
shot("روز ۱۰", "تی‌رکسِ روز اوله.", "عکس شات ۴ (پوزه با زخم پشت شکاف)", "reuse", src="شات ۴ (پوزه پشت شکاف)", cam="زوم روی زخم", sfx="سکوت")
shot("روز ۱۰", "پوزه‌ی بزرگش درست پشت شکاف ورودیه و نفس‌های گرمش از لای سنگ‌ها توی تونل می‌پیچه.", "کلیپ نفس (نسخه‌ی آروم شات ۴)", "reuse", src="کلیپ نفس تی‌رکس (شات ۴)", cam="فقط کلیپ", sfx="نفس عظیم")
shot("روز ۱۰", "نمی‌تونه بیاد تو. جونی هم براش نمونده که بخواد. فقط از آتیش بیرون پناه آورده به خنکی خاک دم لونه‌ات.", "از بیرون: تی‌رکس افتاده جلوی ورودی لونه کنار رود، جنگل پشتش می‌سوزه", "new",
     P(f"Shot D10i – exterior at night: {TREX} lying collapsed on its side on the riverbank right in front of the small stone-blocked burrow entrance, its scarred snout resting at the gap, the forest burning behind, ash and embers falling, heartbreaking, wide shot", "none"),
     cam="پوش خیلی آروم، موزیک غمگین", sfx="آتیش دور، نفس سنگین")
shot("روز ۱۰", "تمام شب، از اون پشت صدای نفس‌هاش رو می‌شنوی. هر بار آروم‌تر.", "پسر و فندق توی تونل (برش از شات ۱)", "crop", src="شات ۱", cam="خیلی کند", sfx="نفس‌هایی که آروم‌تر میشن")
shot("روز ۱۰", "تا صبح… قطع میشه.", "سیاهی کامل", "code", cam="سیاهی + سکوت ۲ ثانیه", sfx="سکوت")
shot("روز ۱۰", "آخرین دایناسوری که دیدی، دم خونه‌ی تو تموم شد.", "سحر خاکستری؛ تی‌رکس بی‌حرکت جلوی ورودی، خاکستر روش نشسته", "new",
     P(f"Shot D10j – grey ashy dawn, {TREX} lying motionless in front of the stone-blocked burrow entrance on the riverbank, a thin layer of pale ash settling on its body, smoke drifting, burnt trees, silence, somber wide shot", "none"),
     cam="ثابت، خاکستر روی تصویر", sfx="باد سرد")
# ---- after the end ----
shot("بعد از پایان", "بعد، تاریکی میاد. دود و خاکستر کل آسمون رو می‌پوشونه. ماه‌ها آفتاب درست‌وحسابی نمی‌تابه. گیاه‌ها خشک میشن، و دنیای بزرگ‌ها هم باهاشون.", "دنیای خاکستری؛ درخت‌های سوخته، آسمون تیره، خاکستر مثل برف روی رود", "new",
     P("Shot D11a – a dark ash-grey world: burnt dead trees along the same river, a heavy dim grey sky with no sun, ash falling like snow onto the water, no life visible, no character, wide shot", "none"),
     cam="پن کند؛ رنگ تقریباً سیاه‌وسفید", sfx="باد، سکوت")
shot("بعد از پایان", "ولی زیر زمین، کنار رود، دو تا موجود کوچیک هنوز نفس می‌کشن.", "برش عرضی (مثل روز ۶): بالا دنیای خاکستری، پایین پسر و فندق توی تونل با یه نور کوچیک", "new",
     P("Shot D11b – a side cross-section cutaway of the riverbank like an educational illustration: above ground a dead grey ash-covered world, below ground the narrow tunnel where the young man and Fandogh huddle together around a tiny warm glow, warm vs cold contrast", "char", "fandogh"),
     cam="زوم به تونل", sfx="نفس آروم")
shot("بعد از پایان", "گوشی دیگه روشن نمیشه. پس روی دیوار تونل خط می‌کشی.", "دیوار رسی تونل پر از خط‌های شمارش؛ دست پسر با یه سنگ تیز", "new",
     P("Shot D11c – close-up of the clay tunnel wall covered with scratched tally marks in groups of five, the young man's black hand scratching another line with a sharp stone, his dead black phone lying below, dim warm light", "char"),
     cam="فهرست «موجودی» رو من با خط دست فارسی روی دیوار می‌نویسم", sfx="خراش سنگ")
shot("بعد از پایان", "موجودی: روزهای بعد از پایان: ۴۰. ماهی خشک: ۷ تا. دایناسورهای زنده‌مونده: صفر. دوستان: یکی، به اندازه‌ی یه موش.", "خط‌به‌خط نوشته شدن فهرست روی دیوار", "code", src="D11c",
     cam="هر خط روی کلمه‌اش ظاهر میشه", sfx="خراش برای هر خط")
shot("بعد از پایان", "قانون‌ها رو یه بار دیگه برای خودت تکرار می‌کنی. کوچیک بمون. کنار آب بمون. زیر زمین بمون.", "سه کارت قانون پشت سر هم", "code", src="D11c", cam="سه کارت امضا", sfx="سه ضربه")
shot("بعد از پایان", "و یکی جدید، که هیچ کتابی یادت نداده بود: کوچیک بمون… ولی تنها نمون.", "پسر و فندق کنار هم دم ورودی، به دنیای خاکستری نگاه می‌کنن؛ فندق روی دستش", "new",
     P("Shot D11d – the young man and Fandogh sitting side by side at the stone gap of the burrow entrance, Fandogh resting on his open black hand, both looking out at the grey ash-covered world, a faint warm light on their faces, emotional close shot", "char", "fandogh"),
     cam="کارت «قانون آخر» با رنگ گرم", sfx="موزیک اصلی")
shot("بعد از پایان", "حیوون‌های کوچیکی مثل فندق از این تاریکی زنده بیرون اومدن. میلیون‌ها سال بعد، از نسل پستاندارهای کوچیکی مثل اون، اسب‌ها و نهنگ‌ها و میمون‌ها به وجود اومدن. و آدم‌ها.", "تصویرسازی درخت زندگی: از یه پستاندار کوچیک تا اسب، نهنگ، میمون و انسان", "new",
     "Shot D11e – an elegant illustrated evolution chart: a tiny early mammal at the bottom, branching upward into silhouettes of a horse, a whale, a monkey and finally a human, warm golden light, painterly, no text, same art style as the reference image: detailed digital painting, clean outlines, muted colours, 16:9, no watermark",
     cam="تیلت از پایین به بالا، شاخه‌ها یکی‌یکی", sfx="موزیک اوج")
shot("بعد از پایان", "۶۶ میلیون سال بعد، یکی از نوه‌های خیلی خیلی دور فندق داره همین ویدیو رو می‌بینه.", "دست بیننده توی اتاق تاریک، گوشی که تصویر فندق رو نشون میده", "reuse", src="شات ۱۶ (گوشی در اتاق)",
     prompt="Edit this image: change the picture on the phone screen to a cozy illustration of a tiny brown furry mammal sitting at the entrance of a burrow, in the same art style. Keep the hand, the room and everything else exactly the same.",
     cam="زوم به صفحه", sfx="موزیک آروم")
shot("بعد از پایان", "و همون موقع، از بیرون تونل، یه صدا میاد. آواز یه پرنده.", "یه پرنده‌ی کوچیک روی شاخه‌ی سوخته بیرون تونل می‌خونه؛ اولین پرتو نور", "new",
     P("Shot D11f – outside the burrow in the grey ash-covered world, a small bird perched on a burnt branch, singing with its beak open, a single thin ray of pale sunlight breaking through the dark clouds onto it, hope, close shot", "none"),
     cam="نور گرم آروم زیاد میشه", sfx="آواز پرنده (تنها صدا)")
shot("بعد از پایان", "یه خط رو روی دیوار پاک می‌کنی و از نو می‌نویسی: دایناسورهای زنده‌مونده: صفر… به‌جز پرنده‌ها.", "دیوار تونل؛ «صفر» پاک میشه و «به‌جز پرنده‌ها» نوشته میشه", "crop", src="D11c",
     cam="متن رو من پاک و بازنویسی می‌کنم", sfx="خراش")
shot("بعد از پایان", "اگه می‌خوای بدونی بعد از تاریکی چی شد، توی کامنت فقط بنویس: فندق.", "کارت پایانی روی تصویر پسر و فندق", "code", src="D11d",
     cam="کارت «کامنت کن: فندق»", sfx="موزیک پایانی")

# ---- references (max 3, most specific first) ----
def refs(s):
    pr = s["prompt"]
    if s["kind"] == "reuse":
        return ["فقط خود " + s["src"] + " برای ویرایش"] if pr else []
    if s["kind"] in ("crop", "code"):
        return []
    r = []
    if CHAR in pr: r.append("برگه‌ی شخصیت")
    if FANDOGH in pr: r.append("برگه‌ی فندق")
    if TREX in pr: r.append("رفرنس تی‌رکس")
    if "raptor reference" in pr: r.append("رفرنس شکارچی کوچیک (R3 نسخه‌ی ۲)")
    if "bone reference" in pr: r.append("عکس استخون: شات ۴۴")
    if "flood-line reference" in pr: r.append("عکس خط سیل: شات ۴۸")
    if "bank reference" in pr: r.append("عکس دیواره‌ی کنار رود: شات ۴۷")
    if "earth-tunnel reference" in pr: r.append("عکس داخل تونل: شات ۱ (فقط برای فضای تونل)")
    if "tunnel reference" in pr and "earth-tunnel reference" not in pr: r.append("عکس تونل: شات ۱")
    body = pr.split(";")[0].lower()
    night = any(k in body for k in ("night", "darkness", "ash", "burning", "inside", "dim ", "fire"))
    style = "عکس سبک شب: شات ۱ (تونل)" if night else "عکس سبک روز: شات ۲۴ (کنار ریشه)"
    if "عکس تونل: شات ۱" in r or any("تونل خاکی" in x for x in r): style = None
    if style and len(r) < 3: r.append(style + ("" if CHAR in pr else " (فقط برای سبک)"))
    return r[:3]
for s in S:
    s["refs"] = refs(s)

# ---- numbering (continues after part 1) + timing ----
p1 = json.load(open(os.path.join(HERE, "part1.json")))
start_n = len(p1["shots"]) + 1
t = p1["total"]
for i, s in enumerate(S):
    s["n"] = start_n + i
    w = len(s["narr"].split())
    d = max(2.6, w / 2.2 + 0.5)
    s["t"] = f"{int(t//60)}:{int(t%60):02d}"
    t += d
NEW = [s for s in S if s["kind"] == "new"]
CLIP = [s for s in S if s["kind"] == "clip"]
json.dump(dict(pre=PRE, shots=S, total=t, start=p1["total"]), open(os.path.join(HERE, "part2.json"), "w"), ensure_ascii=False, indent=1)
print(len(S), "shots", round(t - p1["total"]), "s", len(NEW), "new", len(CLIP), "clips; ends at", f"{int(t//60)}:{int(t%60):02d}")
