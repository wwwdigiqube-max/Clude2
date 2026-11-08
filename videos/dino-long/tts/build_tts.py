# Builds the narration lines (lines.json for tools/doc-voices.mjs) from script-fa-v3.md:
# numbers spelled out, an emotion tag per line, a pause after each line, and the new ending.
import json, os, re
H = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(H, "..", "script-fa-v3.md"), encoding="utf8").read()
body = src[src.index("## ۰"):]

# new ending (replaces the old last line)
OLD_END = "اگه می‌خوای بدونی بعد از تاریکی چی شد، توی کامنت فقط بنویس: فندق."
NEW_END = ("اگه جای تو بودی، روز اول اولین کارت چی بود؟ توی کامنت بنویس.\n"
           "و اگه دوست داری بدونی فندق و تو بعد از تاریکی چی کار کردین، اینم بنویس. اگه بخواید، اون قصه رو هم می‌سازیم.\n"
           "قصه‌ی بعدی، یه دنیای دیگه‌ست… و یه شمارش معکوس دیگه. سابسکرایب کن که از دستش ندی.")
assert OLD_END in body
body = body.replace(OLD_END, NEW_END)

NUM = {"۲۳": "بیست و سه", "۲۲": "بیست و دو", "۳۰۰۰": "سه هزار", "۶۶": "شصت و شش", "۱۰": "ده", "۱۲": "دوازده",
       "۲۵": "بیست و پنج", "۷۰": "هفتاد", "۱۱": "یازده", "۴۰": "چهل", "۷": "هفت", "۳": "سه", "۲": "دو"}
def spell(t):
    t = t.replace("۲۳ درصد", "بیست و سه درصد")
    for k in sorted(NUM, key=len, reverse=True):
        t = re.sub(rf"(?<![۰-۹]){k}(?![۰-۹])", NUM[k], t)
    return t

# section → default tag
SECTION_TAG = {"۰": "tense", "۱": "calm, curious", "۲": "calm, curious", "۳": "calm", "۴": "tense", "۵": "serious",
               "۶": "determined", "۷": "warm, soft", "۸": "tense", "۹": "sad, tired", "۱۰": "tense", "۱۱": "sad, soft"}
# line-specific tags (substring → tag)
OVERRIDE = [
    ("و دم ورودی، یه چیز خیلی بزرگ داره نفس می‌کشه", "whispering, scared"),
    ("ده روز پیش، توی تخت خودت", "soft"),
    ("ولی درخت نیست. پنجه داره", "scared"),
    ("نفس نمی‌کشی تا صدای قدم‌ها", "whispering"),
    ("پیامی که دیشب نبود", "tense"),
    ("«برخورد:", "ominous"),
    ("خودشون نمی‌دونن", "soft"),
    ("تو می‌دونی", "ominous"),
    ("یه لحظه، فقط یه لحظه", "whispering, scared"),
    ("قانون اول", "determined"), ("قانون دوم", "determined"), ("قانون سوم", "determined"),
    ("تنه نیست. کروکودیله", "scared"),
    ("گله رم می‌کنه", "excited, scared"),
    ("از امروز، بیلت یه دایناسوره", "determined"),
    ("ارزشش رو داشت", "warm, soft"),
    ("هفت روز توی دنیایی که هیچ‌کس رو نداشتی", "emotional, soft"),
    ("توی تاریکی، دو تا چشم زرد", "whispering, scared"),
    ("پنجه‌اش رو می‌کشه", "scared"),
    ("فقط یه چیز داری که این دنیا", "determined"),
    ("صدایی که شصت و شش میلیون سال زود", "excited"),
    ("آخرین شب دنیای دایناسورها", "sad, soft"),
    ("و فقط تو می‌دونی", "whispering"),
    ("هیچ‌کدومشون نمی‌دونن", "sad, soft"),
    ("بعد، از جنوب، یه نور", "tense"),
    ("این تخیل نیست", "serious"),
    ("و بعد، بیرون تونل، صدای قدم میاد", "whispering, scared"),
    ("تی‌رکسِ روز اوله", "whispering"),
    ("تمام شب، از اون پشت", "sad, soft"),
    ("هر بار آروم‌تر", "sad, whispering"),
    ("تا صبح…", "sad, whispering"),
    ("قطع میشه", "sad, whispering"),
    ("آخرین دایناسوری که دیدی", "sad, emotional"),
    ("کوچیک بمون… ولی تنها نمون", "emotional, soft"),
    ("یکی از نوه‌های خیلی خیلی دور فندق", "warm, playful"),
    ("آواز یه پرنده", "soft, hopeful"),
    ("به‌جز پرنده‌ها", "hopeful"),
    ("اگه جای تو بودی", "warm"), ("و اگه دوست داری بدونی", "warm"), ("قصه‌ی بعدی، یه دنیای دیگه‌ست", "warm, mysterious"),
]
# longer pauses after these (seconds)
PAUSE = {"روز دهم.": 0.7, "خودشون نمی‌دونن.": 0.5, "تو می‌دونی.": 1.0, "تنه نیست. کروکودیله.": 0.8,
         "هر بار آروم‌تر.": 1.2, "تا صبح…": 1.6, "قطع میشه.": 2.0, "آخرین دایناسوری که دیدی، دم خونه‌ی تو تموم شد.": 1.5,
         "آواز یه پرنده.": 1.0}

lines, sec = [], None
for raw in body.splitlines():
    s = raw.strip()
    if not s:
        if lines: lines[-1]["gap"] = max(lines[-1]["gap"], 0.6)  # paragraph break
        continue
    m = re.match(r"## ([۰-۹]+)\.", s)
    if m:
        sec = m.group(1)
        if lines: lines[-1]["gap"] = max(lines[-1]["gap"], 1.0)  # chapter break
        continue
    text = spell(s)
    tag = SECTION_TAG[sec]
    for sub, t in OVERRIDE:
        if spell(sub) in text: tag = t
    lines.append({"n": len(lines) + 1, "sp": "N", "sec": sec, "fa": f"[{tag}] {text}", "show": s, "gap": PAUSE.get(s, 0.35)})

json.dump(lines, open(os.path.join(H, "lines.json"), "w"), ensure_ascii=False, indent=1)
json.dump({"N": "1JqiFrwLTNZwY3Ardm7j", "model": "eleven_v4", "takes": 2, "lang": "fa", "format": "mp3_44100_128"},
          open(os.path.join(H, "voices.json"), "w"), indent=1)
chars = sum(len(re.sub(r"^\[.*?\]\s*", "", l["fa"])) for l in lines)
print(len(lines), "lines,", chars, "chars per take,", chars * 2, "for 2 takes")
