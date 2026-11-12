# Builds the complete STILLCUT prompts (NEW + EDIT) for the English dino video.
# Source of truth for the locked descriptors, rewritten from the real generated images.
# Run: python3 videos/dino-long-en/prompts/build_prompts.py
import os, re
H = os.path.dirname(os.path.abspath(__file__))
SHOTLIST = os.path.join(H, "..", "shotlist", "shotlist.md")

# ---------- locked blocks (rewritten from the real images) ----------
STYLE = ("Dark gritty animated survival story style for teens and adults, detailed digital painting, clean black outlines on the "
         "characters, realistic painterly background with depth, muted desaturated colours, dramatic cinematic lighting.")
ANAT = ("strict stick-figure anatomy: the only white part is the round head, the body under the clothes is a thin solid black stick figure "
        "with a short black stick neck, bare arms and legs are thin black lines, never skin, and the face has only eyes, eyebrows and a simple mouth, no nose, no ears")

def hero(eyes="calm", pack="on his back", wound=False):
    e = {"calm": "small solid black oval eyes",
         "fear": "big round white eyes with small black pupils (his eyes only in fear)",
         "closed": "eyes closed as two simple curved lines"}[eyes]
    s = ("The young man is a stick figure with a round off-white head about one third of his height, " + e +
         ", thin dark eyebrows, messy dark-brown hair tufts under a dark charcoal knit beanie with a small headlamp, "
         "an open worn rust-orange hooded jacket over a dark grey t-shirt, long thin black stick legs, simple black hands and dark hiking boots; "
         + ANAT + ".")
    if pack: s += f" His dark backpack is {pack}."
    if wound: s += " His right forearm is wrapped in a bandage torn from grey t-shirt cloth."
    return s

HANDS = "Only his hands are visible: simple solid black stick-figure hands coming out of the cuffs of a worn rust-orange jacket."
PIP = ("Pip is a tiny early mammal the size of a large mouse, with soft warm golden-brown fur, a cream belly, big shiny black eyes, "
       "a pointed pink nose with long whiskers, small round ears, pink paws and a long thin pink tail.")
TREX = "The Tyrannosaurus rex has dark grey-green scaly skin, golden eyes and one long pale scar across the left side of its snout."
BONE = ("a long pale dinosaur shoulder-blade bone as long as his arm, with a wide flat paddle-shaped blade at one end and a knobbly "
        "joint at the other")
MOM = ("The mother is a middle-aged stick-figure woman with a round off-white head about one third of her height, small black oval eyes, "
       "thin eyebrows, wavy shoulder-length dark-brown hair with a few silver strands, a mustard-yellow knitted cardigan over a navy top, "
       "dark trousers and black shoes; " + ANAT + ".")
FRA = ("The first friend is a tall, lanky stick-figure young man with a round off-white head, small black oval eyes, thick dark eyebrows, "
       "a wide easy grin, a big mop of tight black curls, round thin-rimmed glasses, a navy-blue hoodie, grey jeans and white sneakers.")
FRB = ("The second friend is a stick-figure young woman with a round off-white head, small black oval eyes, thin eyebrows, a cheeky "
       "lopsided smile, a long high copper-red ponytail, an olive-green bomber jacket over a white t-shirt, black jeans and dark maroon boots.")
ALLANAT = "All three have " + ANAT + "."

ROOTS = ("The place is the base of a giant moss-covered prehistoric tree in a misty fern forest, its huge twisting roots "
         "spreading over the moss, with a small round burrow hole between two roots.")
RIVER = "The place is the bank of a wide, slow, muddy brown river in a misty Late Cretaceous forest of conifers, ferns and cycads."
BANK = ("The place is a low, steep clay bank about as tall as a man above a wide, slow, muddy brown river in a misty prehistoric forest, "
        "with roots hanging over its edge and a pale band of dried flood mud at the same height on every trunk.")
ENTR = "In the bank, between the roots of a huge tree and a hand above the mud line, is a narrow round tunnel entrance exactly as wide as his shoulders."
TUN = "The place is a narrow tunnel dug into brown clay, as wide as his shoulders, with a smooth arched ceiling and thin roots poking through the walls."
ROOM = ("The place is a small bedroom at night: a wooden single bed with grey-blue bedding, a bedside table with a glowing lamp, dark blue "
        "walls with dinosaur posters, and a simple wooden desk.")
MUSEUM = ("The place is a quiet natural-history museum hall with a polished pale stone floor, tall dark wooden display cases and long "
          "skylights; one mounted Tyrannosaurus rex skeleton of aged ivory-brown fossil bone stands on a low dark plinth, its skull turned toward frame-left, "
          "with a faint pale healed groove across the left side of its snout bone.")

# reference role sentences + Persian attachment labels
REF = {
 "C":    ("Use the attached character sheet of the young man in the rust-orange jacket as the identity reference for his head, hair, clothing and anatomy.", "شیت قهرمان `C2-character-sheet-v2`"),
 "P":    ("Use the attached sheet of the tiny brown mammal as the identity reference for Pip.", "شیت پیپ `R1-fandogh-sheet`"),
 "T":    ("Use the attached image of the scarred Tyrannosaurus rex as the identity reference for its skin, head and scar.", "رفرنس تی‌رکس `R2-trex-scar`"),
 "BUR":  ("Use the attached burrow sheet only for the clay bank, the tunnel entrance and the tunnel walls, not its framing.", "شیت لونه `R4-burrow-sheet`"),
 "BOOK": ("Use the attached image of the green library book as the reference for the book and its painted skeleton cover.", "عکس کتاب `A2-book`"),
 "MUS":  ("Use the attached museum image as the reference for the hall, the skeleton and the light.", "عکس موزه `A1-museum`"),
 "MOM":  ("Use the attached character sheet of the woman in the mustard cardigan as the identity reference for her.", "شیت مادر `A3-mom`"),
 "FA":   ("Use the attached sheet of the young man with round glasses and black curls as the identity reference for the first friend.", "شیت دوست ۱ `A4-friend-a`"),
 "FB":   ("Use the attached sheet of the young woman with the copper ponytail as the identity reference for the second friend.", "شیت دوست ۲ `A5-friend-b`"),
 "DAY":  ("Use the attached forest image only for the art style, colour grade and light, not its composition.", "عکس سبک روز `D2a`"),
 "NIGHT":("Use the attached tunnel image only for the art style and the night colour grade, not its composition.", "عکس سبک شب `H1`"),
 "ROOM": ("Use the attached bedroom image only for the room and the lamplight, not its framing.", "عکس اتاق `D1a`"),
 "ROOTS":("Use the attached image of the giant tree roots only for the place, not its light or framing.", "عکس ریشه‌ها `D2a`"),
 "RIVER":("Use the attached river image only for the river and the light, not its framing.", "عکس رود `D3a`"),
 "BANK": ("Use the attached clay riverbank image only for the place, the mud line and the bone, not its framing.", "عکس دیواره‌ی رسی `D5b`"),
 "BONE": ("Use the attached image only for the shape and colour of the bone.", "عکس استخوان `D4e`"),
 "D9A":  ("Use the attached day-nine image only for the bandage, the stones and the place, not its framing.", "عکس روز ۹ `D9a`"),
 "D10J": ("Use the attached image of the fallen T. rex only for the place and the position of the body, not its light.", "عکس تی‌رکس مرده `D10j`"),
 "D11A": ("Use the attached grey ash-covered image only for the art style, grey colour grade and dim light.", "عکس دنیای خاکستری `D11a`"),
 "D10I": ("Use the attached burning-forest image only for the fire, the art style and the colour of the light.", "عکس جنگل در آتش `D10i`"),
}
CLEAN = "Clean image with blank unbranded surfaces and no lettering anywhere. Wide 16:9 composition."

FR = {}
def new(n, refs, shot, who, action, place, light, pal, comp, clean=CLEAN):
    body = " ".join(REF[r][0] for r in refs)
    chars = " ".join(who)
    p = f"{body}\n\n{shot} {chars} {action}\n\n{place} {light}\n\n{STYLE}\n\nPalette: {pal}. {comp} {clean}"
    FR[n] = ("NEW", [REF[r][1] for r in refs], re.sub(r"  +", " ", p))

def edit(n, src, srclabel, change, preserve, only):
    p = (f"Edit the attached image.\n\nCHANGE: {change}\n\nPRESERVE EXACTLY: {preserve}\n\nOnly {only} differs. Everything else is 100% identical.")
    FR[n] = ("EDIT", [srclabel], p)

# ======================= ch 1 · Ten Days =======================
new(14, ["C", "ROOM", "BOOK"], "A medium shot from a high three-quarter angle, slightly above the desk, with a 35mm lens.",
    [hero(pack="sitting open on the desk in front of him")],
    "He stands at the desk late at night packing for school, holding the closed library book above the open backpack, about to drop it in; his face is calm and a little sleepy, his eyes on the book.",
    ROOM + " The open backpack sits at frame-left of the desk with its mouth toward the camera; beside it in a neat row lie two plain textbooks, a sandwich wrapped in white paper, two chocolate bars in plain brown wrappers and a clear plastic bottle half full of water. He stands at frame-right of the desk.",
    "The only light is the warm lamp on the bedside table behind him at frame-right, so warm light rims his head and the desk while the room falls into soft blue shadow.",
    "60% deep blue night shadow, 30% warm amber lamplight, 10% rust-orange jacket",
    "The open backpack and the row of items fill the lower-left half in sharp detail so they can be cropped as an insert; his hand with the book is at the centre. Exactly one person, one backpack, two textbooks, one sandwich, two chocolate bars, one bottle and one library book.")
new(17, ["BOOK"], "An extreme close-up insert, straight on, with a macro lens.", [],
    "Two simple solid black stick-figure hands hold the closed library book upright, its front cover filling most of the frame. The cover is a painted illustration of a Tyrannosaurus rex skeleton standing in a dim museum hall, its skull turned toward the left edge of the cover; on the left side of the skull's snout there is only a tiny pale line that is easy to miss. The worn corners and the faded dark-green cloth spine show at frame-left.",
    "The background is a soft, indistinct darkness.",
    "A small warm light from the upper left grazes the cover, picking out the texture of the worn paper and leaving the edges in shadow.",
    "60% aged ivory and sepia of the cover painting, 30% near-black darkness, 10% dark-green cloth",
    "The skull on the cover sits in the upper-left third, sharp enough to crop into later. Exactly one book and two hands.",
    "The cover and spine are blank, with no title and no lettering anywhere. Wide 16:9 composition.")
new(32, ["C", "DAY"], "A wide shot from a low angle, with a 35mm lens.", [hero()],
    "He stands on top of a large mossy boulder, one black hand shading his eyes, his body turned toward frame-right, scanning the far horizon with a searching, hopeful look.",
    "Below him a sea of prehistoric forest, tall conifers, ferns and palm-like cycads rolls away to distant blue hills under a wide, empty, hazy sky. He stands on the boulder at frame-left.",
    "Hot afternoon sun from the upper right throws a warm haze over the forest and lights the side of his face.",
    "60% hazy pale sky, 30% muted green forest, 10% rust-orange jacket",
    "The upper half of the frame is empty sky. Exactly one person.")
new(33, ["C", "DAY"], "A wide shot from directly behind him at shoulder height, with a 24mm lens.", [hero()],
    "He stands small at the edge of a high rise, seen from the back, arms hanging at his sides and head slightly lowered: the posture of someone who has run out of ideas.",
    "In front of him an endless prehistoric forest of conifers and ferns stretches to the horizon in every direction, an untouched wilderness. He stands at the bottom centre of the frame.",
    "Late-afternoon light from frame-left turns the haze gold and lays long soft shadows across the canopy.",
    "60% muted green forest, 30% golden haze, 10% rust-orange jacket",
    "He fills only one tenth of the frame height; the forest dominates. Exactly one person.")
new(39, ["C", "DAY"], "A close-up of his face from a slightly low angle, with an 85mm lens.", [hero(eyes="fear")],
    "He crouches among giant fern leaves, breathing hard, beads of sweat on his white head and his mouth a small trembling open line; his eyes stare toward frame-left, where the T. rex has just disappeared.",
    "Giant fern leaves frame his face, soft and out of focus.",
    "Warm low evening sun from frame-left catches his face and the fern edges, with deep green shadow behind.",
    "60% deep green shadow, 30% warm evening gold, 10% rust-orange jacket",
    "His face fills the right two thirds of the frame. Exactly one person.")
new(40, ["C", "ROOTS", "NIGHT"], "A medium-wide shot at ground level, with a 35mm lens.", [hero(eyes="fear", pack="on the ground beside him")],
    "He sits squeezed into the gap between two huge roots, knees pulled tight to his chest and arms wrapped around them, shivering, his eyes wide open, staring out into the dark toward frame-right. His headlamp is switched on and throws a thin cold beam onto the ground.",
    ROOTS + " He sits between the roots at frame-left; the small round burrow hole is dark and quiet at frame-right.",
    "It is night: faint blue moonlight filters down through the canopy from the upper right, and the headlamp's narrow white beam is the only other light.",
    "60% deep blue-black night, 30% dark mossy green, 10% pale headlamp light",
    "He fills the left third, sharp enough to crop to a close-up of his knees and face; the dark roots fill the rest. Exactly one person.")
new(42, ["C", "NIGHT"], "A close insert from his point of view, looking down, with a 35mm lens.", [HANDS],
    "His hands pull open the zip of the dark backpack lying on the mossy ground between giant roots; inside, the edges of textbooks, a paper-wrapped sandwich and a faded dark-green cloth book spine catch the light.",
    "The backpack lies on dark moss between two huge roots.",
    "The headlamp's white beam comes from the top of the frame and makes a bright oval on the open backpack; everything outside the oval is deep blue-black night.",
    "60% blue-black darkness, 30% pale headlamp white, 10% rust-orange cuffs",
    "The bright oval sits at the centre. Exactly two hands and one backpack.")
new(43, ["C", "BOOK", "NIGHT"], "An extreme close-up insert with a 50mm lens.", [HANDS],
    "His hands slide the hardcover library book out of the open dark backpack; the faded dark-green cloth spine with its small blank white sticker comes first, the painted cover still half inside the bag.",
    "The backpack lies on dark moss at night.",
    "The headlamp beam falls from above onto the book and hands; the rest of the frame sinks into blue-black darkness.",
    "60% blue-black darkness, 30% dark-green cloth and dark backpack, 10% pale headlamp light",
    "The book is at the centre of the frame. Exactly one book and two hands.")
new(45, ["BOOK"], "A top-down close shot of an open book, with a 50mm lens.", [],
    "Two simple solid black stick-figure hands hold the library book open on a two-page spread of full-colour painted natural-history illustrations on cream paper: on the left page, a tiny brown mouse-sized mammal standing among ferns; on the upper right page, a cutaway of the ground showing a small animal curled up in a burrow under tree roots; on the lower right page, a turtle and a frog at the edge of a freshwater river.",
    "Around the book there is only darkness.",
    "A warm circle of headlamp light falls on the pages from above, and the edges of the spread fade into darkness.",
    "60% cream paper, 30% muted greens and browns of the paintings, 10% warm light",
    "Three separate, clearly framed illustrations with clean gaps between them, so each can be cropped on its own. Exactly three illustrations and two hands.",
    "The pages hold illustrations only on plain cream paper, with no text, no captions and no lettering anywhere. Wide 16:9 composition.")
new(47, ["C", "BOOK", "NIGHT"], "An extreme close-up insert from above, with a 50mm lens.", [HANDS],
    "His right hand holds a plain blue school ballpoint pen over the cream back page of the open library book, which rests on his knee; three short lines of faint, illegible scribble run down the page, each with a small empty square drawn at its left.",
    "The book rests on his knee at night.",
    "The headlamp beam lights the page from above; everything else is blue-black darkness.",
    "60% blue-black darkness, 30% cream paper, 10% rust-orange cuff",
    "The page sits at the centre. Exactly one pen, one book and three short scribbled lines.",
    "The scribbles are abstract marks with no readable letters anywhere. Wide 16:9 composition.")

# ======================= ch 2 · The Smallest Thing =======================
new(56, ["C", "BOOK", "ROOTS"], "A medium shot at eye level, with a 50mm lens.", [hero(pack="on the ground beside him")],
    "Early morning. He sits on the moss with his back against a giant root, the open library book on his knees, reading closely with one black finger on the page; his face is focused and serious, and his headlamp is off.",
    ROOTS + " He sits at frame-left; the small round burrow hole is at frame-right.",
    "Soft golden morning light slants through the misty air from the upper right.",
    "60% mossy green, 30% golden morning haze, 10% rust-orange jacket",
    "Exactly one person and one open book whose pages show only illustrations.")
new(59, ["C", "P", "DAY"], "A close two-shot in profile at ground level, with an 85mm lens.", [hero(pack="on the ground behind him"), PIP],
    "He lies flat on his stomach on the moss at frame-left, chin resting on his folded black hands, his face level with Pip. Pip sits up on its hind legs at frame-right, at the mouth of a small round burrow hole between tree roots. They look straight into each other's eyes, curious and calm.",
    "Mossy roots and fern fronds frame them, soft and out of focus.",
    "Soft morning backlight from behind Pip outlines its fur and the edge of his white head.",
    "60% soft mossy green, 30% warm morning light, 10% rust-orange jacket",
    "His head at frame-left and Pip at frame-right, eye to eye on one horizontal line. Exactly one person and one Pip.")
new(61, ["C", "DAY"], "An extreme close-up insert with a 50mm lens.", [HANDS],
    "One hand holds half a sandwich of white bread with one bite taken out, its white paper wrapping peeled back; the other half, still wrapped, rests on his knee.",
    "Behind, the mossy forest floor is soft and blurred.",
    "Soft morning light from the upper right lights the bread.",
    "60% blurred mossy green, 30% white bread and paper, 10% rust-orange cuffs",
    "The sandwich is at the centre. Exactly one sandwich in two halves.")
new(62, ["C", "P", "DAY"], "A wide shot at ground level, with a 35mm lens.", [hero(pack="on the ground behind him"), PIP],
    "He lies on his stomach on the mossy forest floor at frame-left, propped on his elbows, watching Pip with quiet, doubtful concentration. About an arm's length away at frame-right, Pip sits up beside a low bush hung with small bright red berries and a fern with brown seed clusters, holding one red berry in its tiny pink paws and nibbling it.",
    "Giant ferns and the mossy roots of a huge tree frame the scene.",
    "Soft golden morning light from the upper right falls across them both.",
    "60% mossy green, 30% golden morning light, 10% red berries and rust-orange jacket",
    "Both are sharp and large enough to crop: his face in the left third, Pip and the berries in the right third. Exactly one person and one Pip.")
new(66, ["C", "DAY"], "An extreme close-up insert with a 100mm macro lens.", [HANDS],
    "A single small bright red berry is pinched between two black fingers and held up close to the lens; behind it, his white head is soft and out of focus at frame-right.",
    "The background is a blur of fern greens.",
    "Late-afternoon light from frame-left makes the berry glow.",
    "60% blurred fern green, 30% soft shadow, 10% bright red berry",
    "The berry is at the centre. Exactly one berry.")
new(67, ["C", "DAY"], "A medium close-up from a slightly high angle, with a 50mm lens.", [hero()],
    "He kneels by a low bush of small red berries, stuffing handfuls into the deep pocket of his rust-orange jacket; a few berries spill onto the moss. His face is busy and hopeful.",
    "The berry bush and ferns surround him in the forest.",
    "Warm evening light from frame-left.",
    "60% muted green, 30% rust-orange jacket, 10% red berries",
    "His hands and the pocket are at the centre. Exactly one person.")
new(68, ["C", "DAY"], "An extreme close-up insert with a 50mm lens.", [HANDS],
    "One hand holds a clear plastic water bottle upside down, completely empty; one last drop hangs from its mouth.",
    "Behind it, a hot, hazy fern forest is blurred.",
    "Harsh midday sun from above glints on the bottle.",
    "60% hazy bleached green, 30% clear plastic highlights, 10% rust-orange cuff",
    "The bottle is at the centre. Exactly one bottle and one drop.")
new(69, ["C", "DAY"], "A close-up of his face at eye level, with an 85mm lens.", [hero()],
    "His tired eyes are half closed, each small black oval under one heavy lid line; his mouth is a small dry, cracked line, and beads of sweat run down his white head under the beanie. He squints toward frame-right, toward the sound of water.",
    "Behind him the forest is a hot, bleached blur.",
    "Harsh midday sun from overhead flattens the colours into a hot haze.",
    "60% bleached hazy green, 30% hot pale light, 10% rust-orange jacket",
    "His face fills the left two thirds. Exactly one person.")
new(79, ["RIVER"], "An extreme close-up insert from a slightly high angle, with a 50mm lens.", [],
    "Three small silvery river fish, each about the length of a hand, lie side by side on a flat sun-warmed grey stone to dry; the stone is darker where the fish are still wet.",
    RIVER + " The river is a soft blur behind the stone.",
    "Hot afternoon sun from the upper left makes the scales shine.",
    "60% warm grey stone, 30% muddy brown river blur, 10% silver scales",
    "The fish fill the centre. Exactly three fish.")
new(80, ["C", "RIVER"], "A wide shot from behind him, with a 35mm lens.", [hero()],
    "He sits small on the riverbank at frame-right, seen from behind, knees up, resting; beside him three small fish dry on a flat stone.",
    RIVER + " Warm mist hangs low over the water.",
    "The sun sets at frame-left behind the far trees, turning the haze over the water orange and pink; the air looks thick and warm.",
    "60% warm orange-pink haze, 30% dark tree silhouettes, 10% rust-orange jacket",
    "The river and sky fill most of the frame; he is small. Exactly one person.")

# ======================= ch 3 · A Shovel Made of Dinosaur =======================
new(87, ["C", "RIVER"], "A medium close-up at eye level, with an 85mm lens.", [hero(eyes="fear")],
    "He crouches behind a low bush on the riverbank, one black hand pressed flat against his chest, his body tense as if feeling a deep sound through his ribs; his eyes look far toward frame-left.",
    RIVER + " Behind him, blurred in the morning mist, a herd of duck-billed dinosaurs stands with heads raised.",
    "Cool misty morning light from frame-left.",
    "60% cool misty grey-green, 30% muddy river brown, 10% rust-orange jacket",
    "He fills the right half. Exactly one person.")
new(93, ["C", "BOOK", "BANK"], "A medium shot at eye level, with a 50mm lens.", [hero(pack="on the ground beside him")],
    "Morning. He sits on the clay riverbank with the open library book on his knees and " + BONE + " lying beside him; his face is serious and tight, eyes fixed on the page, eyebrows drawn together.",
    BANK + " He sits at frame-left of the bank.",
    "Pale morning light through mist from frame-right.",
    "60% misty river brown, 30% muted green, 10% rust-orange jacket",
    "Exactly one person, one book whose pages show only illustrations, and one bone.")
new(94, ["BOOK"], "A top-down close shot of one page of a book, with a 50mm lens.", [],
    "One full page of the library book shows a dramatic painted natural-history illustration on cream paper: a night sky filled with glowing streaks of burning debris falling back onto a vast prehistoric forest, the horizon glowing orange with fire. Two black stick-figure thumbs hold the edges of the page.",
    "Around the page there is only soft shadow.",
    "Soft daylight falls evenly on the page.",
    "60% cream paper and dark night sky, 30% glowing orange, 10% black thumbs",
    "The illustration fills most of the frame. Exactly one illustration.",
    "The page holds the illustration only, with no text, no captions and no lettering anywhere. Wide 16:9 composition.")
new(102, ["C", "BANK"], "A wide shot from a slightly low angle, with a 35mm lens.", [hero(pack="on the ground beside him")],
    "He kneels high on the clay bank, starting a new hole with " + BONE + ", attacking the clay with tired determination, brows drawn.",
    BANK + " Below him, his abandoned first hole sits lower on the bank; on the trunks beside him the pale band of dried flood mud runs a hand below the new hole.",
    "The sun sets at frame-left, throwing orange light across the clay and long shadows.",
    "60% orange-lit clay, 30% dark green forest, 10% rust-orange jacket",
    "He is at the centre-right, with the old hole and the mud band readable at frame-left. Exactly one person and one bone.")
new(103, ["C", "BOOK", "BANK"], "A medium shot at eye level, with a 50mm lens.", [hero(pack="on the ground beside him")],
    "Evening. He sits cross-legged on the clay bank, the open library book on his knee and a plain blue pen in his black hand, tapping it against the page, mouth pressed into a line, calculating. " + BONE[0].upper() + BONE[1:] + " lies beside him, and the small new hole is behind him.",
    BANK,
    "Dusky blue light with a last warm glow from frame-left.",
    "60% dusky blue-brown, 30% muted green, 10% rust-orange jacket",
    "Exactly one person, one book whose pages show only illustrations and faint scribbles, one pen and one bone.")
new(108, ["C", "BANK", "NIGHT"], "A medium-wide shot at ground level, with a 35mm lens.", [hero(eyes="closed", pack="under his head as a pillow")],
    "He sleeps curled on his side in the mud right outside a small, shallow hollow dug into the clay bank, " + BONE + " beside him; mud streaks his jacket and boots.",
    BANK,
    "It is night: cold blue moonlight falls from the upper right, and the river glints faintly behind.",
    "60% cold blue night, 30% dark clay brown, 10% muted rust-orange jacket",
    "He lies at the centre-bottom. Exactly one person and one bone.")
new(110, ["C", "BANK", "BUR"], "A medium shot from just outside a small cave in the clay bank, at ground level, with a 35mm lens.", [hero(eyes="fear", pack="lying outside the cave")],
    "He kneels inside a small rough cave dug into the clay bank, as deep as his arms can reach, holding " + BONE + ". At the peak of the moment the clay roof breaks apart above him and heavy chunks and a curtain of dirt crash down on his head and shoulders; his eyes stare up in shock and his free hand is thrown up.",
    BANK,
    "Early-morning light from behind the camera lights the falling clay, and the dust glows.",
    "60% brown clay and dust, 30% muted green, 10% rust-orange jacket",
    "The cave and its collapsing roof fill the centre; the bank around it stays wide enough to crop. Exactly one person.")
new(111, ["C", "BANK"], "A medium shot at ground level, with a 35mm lens.", [hero(eyes="closed", pack="half buried in the clay behind him")],
    "He crawls out on his elbows from a heap of collapsed clay, covered in dirt from beanie to boots, coughing hard with his mouth wide open; clumps of clay fall from his beanie.",
    BANK,
    "Morning light from frame-right, with dust hanging in the air.",
    "60% brown clay and dust, 30% muted green, 10% rust-orange jacket",
    "He crawls toward the camera at the centre. Exactly one person.")
new(114, ["C", "P", "BANK"], "A wide shot at eye level, with a 35mm lens.", [hero(pack="on the ground beside him"), PIP],
    "He sits in the mud at frame-left beside the heap of collapsed clay, shoulders slumped and arms on his knees, looking down at frame-right, thoughtful. There, Pip peeks out of a tiny, perfectly round burrow hole in the clay bank, no wider than a fist.",
    BANK,
    "Soft grey morning light from the upper right.",
    "60% grey-brown clay, 30% muted green, 10% rust-orange jacket",
    "His face in the left third and Pip at its hole in the right third, both sharp enough to crop on their own. Exactly one person and one Pip.")
new(117, ["C", "BUR", "BANK"], "A medium shot from the side at ground level, with a 35mm lens.", [hero(pack="lying in the mud nearby")],
    "He kneels at a fresh, narrow, perfectly round opening in the clay bank, exactly as wide as his shoulders, pushing his head and shoulders into it while he scrapes clay out behind him with " + BONE + "; a pile of fresh clay grows at his knees.",
    BANK + " " + ENTR,
    "Midday light from above, with the inside of the hole in deep shadow.",
    "60% brown clay, 30% muted green, 10% rust-orange jacket",
    "The narrow opening and his shoulders are at the centre. Exactly one person.")
new(118, ["C", "BUR", "NIGHT"], "A close shot inside the tunnel from just behind his head, with a 24mm lens.", [hero(pack="")],
    "He lies on his back in the tunnel, scraping the ceiling into a smooth rounded arch with the wide flat edge of a long pale dinosaur shoulder-blade bone; fresh scrape marks curve across the clay and crumbs fall.",
    TUN,
    "The only light is his headlamp beam, lighting the curved ceiling in warm brown and leaving the tunnel behind in darkness.",
    "60% warm brown clay, 30% darkness, 10% pale bone",
    "The arched ceiling fills the upper half. Exactly one person.")
new(123, ["C", "BUR", "NIGHT"], "A wide shot of the clay bank at night, at ground level, with a 35mm lens.", [hero(pack="")],
    "From the narrow round tunnel entrance, only his lower half sticks out: his thin black stick legs and dark hiking boots lie on the mud, the rest of him swallowed by the tunnel. The long pale bone lies beside the entrance.",
    BANK + " " + ENTR,
    "It is night: cold blue moonlight from the upper right silvers the mud and the boots.",
    "60% cold blue night, 30% dark clay brown, 10% pale bone",
    "The entrance and his boots sit at the centre-left, large enough to crop to the boots alone. Exactly one person.")

# ======================= ch 4 · Eleven Percent =======================
new(128, ["C", "BANK"], "An overhead extreme close-up, with a 50mm lens.", [HANDS],
    "His two hands lie palm-up on wet brown clay; the palms are torn, with pale ragged blister skin and dark red streaks of blood mixing into the clay.",
    "The ground is wet brown clay at the tunnel entrance.",
    "Harsh noon light from straight above.",
    "60% wet brown clay, 30% black hands, 10% dark red",
    "The hands fill the centre. Exactly two hands.")
new(129, ["BONE", "BUR"], "An insert at ground level, with a 50mm lens.", [],
    "The bone, " + BONE.replace("as long as his arm", "as long as an arm") + ", lies dropped in the mud at a narrow round tunnel entrance, a few dark red smears on its knobbly end, crumbs of clay around it.",
    "The tunnel entrance is a dark round hole in a clay bank by a muddy river.",
    "Harsh noon light from above, with a short shadow under the bone.",
    "60% brown clay, 30% pale bone, 10% dark red",
    "The bone lies diagonally across the frame. Exactly one bone.")
new(130, ["C", "BUR", "DAY"], "A medium-wide shot at eye level, with a 35mm lens.", [hero(pack="on the ground beside him")],
    "He sits slumped with his back against the clay bank beside the tunnel entrance, head tipped back against the clay, eyes half closed under heavy lid lines, his torn black hands resting palm-up on his knees; the long pale bone lies dropped at his feet.",
    BANK + " " + ENTR,
    "Flat, hot noon light from above; the river glitters behind.",
    "60% brown clay, 30% muddy river, 10% rust-orange jacket",
    "He sits at frame-left, the tunnel entrance at frame-right. Exactly one person.")
new(134, ["MOM"], "A candid smartphone snapshot at eye level, slightly off-centre, with a wide phone lens.", [MOM],
    "She stands at the stove in a small warm family kitchen and turns toward the camera with a surprised, warm laugh, holding a wooden spoon over a steaming pot.",
    "The kitchen has pale tiles, plants on the windowsill and plain unlabelled jars on a shelf.",
    "Warm morning sun from a window at frame-left fills the room.",
    "60% warm cream kitchen, 30% soft wood tones, 10% mustard cardigan",
    "She is at the centre-right. Exactly one person.")
new(135, ["C", "FA", "FB"], "A cheerful group selfie taken at arm's length with a wide phone lens, at eye level.",
    [hero(pack="on his back").replace("; " + ANAT, ""), FRA, FRB, ALLANAT],
    "The hero is in the centre holding the phone, the first friend at frame-left and the second friend at frame-right, all three squeezed together, grinning.",
    "Behind them stands a plain school building with blank walls and wide steps.",
    "Bright afternoon sun from frame-right.",
    "60% pale school walls and sky, 30% clothing colours, 10% copper-red hair",
    "Exactly three people.")
new(136, ["C", "MUS", "FA", "FB"], "A wide selfie-video frame taken from the hero's outstretched phone, with a wide lens slightly below face height.",
    [hero(pack="on his back").replace("; " + ANAT, ""), FRA, FRB, ALLANAT],
    "The hero fills the lower frame-left, laughing at the lens and pointing back over his shoulder with his thumb; behind him at the centre the first friend doubles over laughing, and the second friend at frame-right laughs with a hand over her mouth.",
    MUSEUM + " The skeleton towers behind them, its skull high in the upper-right quarter of the frame.",
    "Soft daylight falls from the skylights above and to the left, throwing long gentle shadows of the ribs across the floor.",
    "60% warm grey stone and shadow, 30% aged ivory bone, 10% rust-orange jacket",
    "The upper-right quarter shows only the skull, ribs and skylights, clear of people, so it can be cropped as an empty view of the hall. Exactly three people and one skeleton.")
new(141, ["C", "RIVER"], "A close-up of his face at eye level, with an 85mm lens.", [hero()],
    "His face crumples: his eyes glisten under sad slanted brows, one tear runs down his white cheek, and his mouth trembles in a wavering line. He looks down at the dark phone in his hands at the bottom of the frame.",
    RIVER + " The river is soft and blurred behind him.",
    "Soft overcast afternoon light from frame-left.",
    "60% soft muddy river brown, 30% muted green, 10% rust-orange jacket",
    "His face fills the right two thirds. Exactly one person.")
new(146, ["C", "RIVER"], "A close-up from a slightly low angle, with an 85mm lens.", [hero()],
    "He lifts his head, a drying tear track on his white cheek, his eyes narrowed under hard angled brows and his mouth set in a firm straight line; he stares toward frame-right with new determination.",
    RIVER + " The river is soft and blurred behind him.",
    "Late-afternoon sun breaks through from frame-right and lights his face.",
    "60% warm late light, 30% soft river brown, 10% rust-orange jacket",
    "His face fills the left two thirds. Exactly one person.")
new(147, ["C", "BANK"], "A medium-wide shot from a low angle, with a 35mm lens.", [hero()],
    "He rises to his feet on the riverbank, gripping " + BONE + " in one fist, and turns toward frame-right, where the tunnel entrance waits in the clay bank; his face is determined.",
    BANK + " " + ENTR,
    "Golden late-afternoon light from frame-right.",
    "60% golden clay, 30% muted green, 10% rust-orange jacket",
    "He stands at frame-left, the tunnel entrance at frame-right. Exactly one person and one bone.")

# ======================= ch 5 · The Thing in the Tunnel =======================
new(182, ["C", "BUR", "D9A"], "A medium shot at eye level, with a 35mm lens.", [hero(pack="on the ground nearby", wound=True)],
    "One-handed, he drags a heavy round river stone up the clay bank with his left hand, his bandaged right forearm held tight against his chest; his body leans hard, sweat on his white head, his eyes feverish and tired. A half-built ring of stacked grey stones already surrounds the tunnel entrance.",
    BANK + " " + ENTR,
    "Heavy grey afternoon light from frame-left.",
    "60% grey stone and clay, 30% muted green, 10% rust-orange jacket",
    "He is at frame-left, the stone ring at frame-right. Exactly one person.")
new(183, ["C", "P", "BUR"], "A wide shot from deep inside the tunnel looking toward the entrance, with a 24mm lens.", [hero(pack="", wound=True), PIP],
    "He kneels just inside the entrance, seen from behind, dragging a big flat stone across the opening with his left hand, his bandaged right forearm tucked against his body; Pip sits beside his knee. The stone slab nearly covers the round opening, leaving a vertical gap a hand wide.",
    TUN,
    "Golden sunset light pours through the hand-wide gap and lays one thin bright stripe across the tunnel floor, his shoulder and Pip; the rest of the tunnel is warm brown darkness.",
    "60% warm brown darkness, 30% golden stripe of light, 10% rust-orange jacket",
    "The gap is sharp at the centre-right, large enough to crop as its own shot. Exactly one person and one Pip.")

# ======================= ch 7 · Stay Small =======================
new(225, ["T", "D10J"], "A wide shot from across the river, at eye level, with a 35mm lens.", [TREX],
    "Days later, a thick flood of brown mud and water has risen over the body of the fallen Tyrannosaurus rex in front of the stone door in the clay bank; only the ridge of its back, part of its tail and the top of its head with the scar still break the surface of the mud.",
    BANK.replace(" in a misty Late Cretaceous forest", "") + " The forest behind is burnt black and bare.",
    "Flat grey light under a sky dark with ash; the sun is hidden.",
    "60% grey ash light, 30% brown mud, 10% dark grey-green skin",
    "The half-buried body runs across the centre. Exactly one dinosaur, shown calmly and without wounds.")
new(229, ["C", "NIGHT"], "A close-up of his face, slightly from below, with an 85mm lens.", [hero(eyes="fear", pack="", wound=True)],
    "Inside the dark tunnel he stares down at something in his hands below the frame, frozen in a quiet shock, mouth slightly open.",
    TUN,
    "The warm flicker of a small fire near the entrance lights one side of his face; the other side falls into darkness.",
    "60% darkness, 30% warm firelight, 10% rust-orange jacket",
    "His face fills the centre. Exactly one person.")
new(234, ["D11A"], "An extreme wide shot from a high bank, with a 24mm lens.", [],
    "The river valley lies under a sky completely blacked out by thick, rolling smoke and dust; the forest along the river is burnt, black and leafless; a dim reddish smudge marks where the sun should be.",
    "The wide muddy river winds through the burnt valley.",
    "Almost no light reaches the ground: everything is dim grey with a faint red tint from the hidden sun.",
    "60% black smoke, 30% ash grey, 10% dim red",
    "The sky fills the upper two thirds. The valley is an empty, lifeless wilderness.")
new(235, ["D11A"], "A close shot at ground level, with a 50mm lens.", [],
    "A cluster of wilted, drooping ferns is covered in a thick layer of grey ash; flakes of ash are still falling.",
    "The ground is grey ash with burnt twigs.",
    "Cold, dim grey light with no shadows.",
    "60% ash grey, 30% dead olive-brown fronds, 10% black twigs",
    "The ferns fill the frame. An empty, lifeless scene.")
new(237, ["C", "D10I"], "A medium shot at dusk, at eye level, with a 50mm lens.", [hero(wound=True)],
    "He walks toward frame-left away from the burning forest, carrying a thick branch whose tip glows with a smouldering orange ember, shielding the ember with his left hand; his face is careful and focused.",
    "Behind him the prehistoric forest burns; sparks and ash drift through the air.",
    "The fire behind him at frame-right rims his outline in orange, and the ember lights his hand and face from below.",
    "60% dark smoky brown, 30% fire orange, 10% rust-orange jacket",
    "He is at the centre-left. Exactly one person.")
new(238, ["C", "P", "BUR"], "A wide shot from inside the tunnel looking toward the closed stone door, with a 24mm lens.", [hero(pack="", wound=True), PIP],
    "A small fire of twigs burns right at the hand-wide gap of the stone door, its smoke drifting out through the gap; he sits a little further in, feeding it one twig, Pip beside him.",
    TUN,
    "The small fire is the only light: warm orange on the clay walls, his face and Pip, with dim grey daylight in the gap.",
    "60% warm brown darkness, 30% firelight orange, 10% grey smoke",
    "The fire and gap are at the centre, he and Pip at frame-left. Exactly one person, one Pip and one small fire.")
new(239, ["C", "P", "NIGHT"], "A close shot at eye level, with an 85mm lens.", [hero(eyes="closed", pack="under his head as a pillow", wound=True), PIP],
    "He lies asleep on his side in the small round nest chamber at the end of the tunnel; Pip is curled up asleep against the side of his neck, inside the collar of his jacket.",
    TUN,
    "A faint orange ember glow from down the tunnel touches his head and Pip; the rest is soft darkness.",
    "60% soft darkness, 30% warm ember glow, 10% rust-orange jacket",
    "His head and Pip are at the centre. Exactly one person and one Pip.")

# ======================= EDITs (always from the ORIGINAL image) =======================
PRES = "the young man's round white head, beanie and headlamp, hair, jacket, t-shirt, boots and stick-figure anatomy"
edit(50, 40, "عکس قاب #40 (اصلی)",
     "He has fallen asleep: his eyes are closed as two simple curved lines, his head has slumped sideways against the root, and his headlamp is switched off, so its white beam is gone.",
     f"{PRES}; his hugging pose apart from the slumped head; the roots, the moss, the backpack and the burrow hole and their positions; the camera angle, framing and lens; the blue moonlight, its direction and the shadows; the colour grade, contrast and grain.",
     "his sleep and the dark headlamp")
edit(112, 110, "عکس قاب #110 (اصلی)",
     "The moment is over: the young man is gone from the frame, and the small cave has fully collapsed into a still heap of broken clay with the dust settled.",
     "the clay bank, the roots, the tree trunks, the pale mud band, the river and every object and its position; the camera angle, framing and lens; the light direction, colour and shadows; the colour grade, contrast and grain.",
     "the collapsed, empty cave")
edit(142, 141, "عکس قاب #141 (اصلی)",
     "His eyes are closed as two simple curved lines, squeezed shut.",
     f"{PRES}; the tear on his cheek, the trembling mouth, the head angle and the phone in his hands; the blurred river behind; the camera angle, framing and lens; the light direction, colour and shadows; the colour grade, contrast and grain.",
     "the closed eyes")
edit(152, "D6a", "عکس قدیمی `D6a`",
     "He is at the edge of exhaustion: his eyes are half closed under heavy lid lines, his mouth is open, panting, and beads of sweat fly from his white head.",
     f"{PRES}; his digging pose and the bone in his hands; the clay bank, the hole, the river and every object and its position; the camera angle, framing and lens; the light direction, colour and shadows; the colour grade, contrast and grain.",
     "his exhausted face and the sweat")
edit(153, "D6c", "عکس قدیمی `D6c`",
     "The tunnel is finished: it runs about three times deeper into the clay bank and ends in a small round nest chamber just big enough to sit up in, with the dark backpack lying inside it.",
     f"{PRES}; his pose inside the tunnel; the cross-section of the bank, the roots, the river, the pale mud band and the forest above; the camera angle, framing and lens; the light direction, colour and shadows; the colour grade, contrast and grain.",
     "the longer tunnel and its nest chamber")
edit(175, "D8f", "عکس قدیمی `D8f`",
     "The light is off: the phone's flashlight beam and the headlamp are dark, the tunnel is almost black, and only faint blue light from the entrance outlines his shape; his two eyes are the brightest thing in the frame.",
     f"{PRES}; his sitting pose, the phone in his hand and Pip beside him; the tunnel walls and their shape; the camera angle, framing and lens; the colour grade, contrast and grain.",
     "the darkness")
edit(211, 183, "عکس قاب #183 (اصلی)",
     "The light outside has changed: instead of golden sunset, an angry red-orange glow and falling glowing sparks show through the hand-wide gap, and the stripe of light across the floor, his shoulder and Pip turns red.",
     f"{PRES}; the bandage on his right forearm; Pip and its position; his pose dragging the stone; the stone door, the gap and the tunnel walls; the camera angle, framing and lens; the colour grade, contrast and grain.",
     "the colour of the light outside")
edit(228, 17, "عکس قاب #17 (اصلی)",
     "On the cover painting, the scar on the skeleton's skull is now clearly visible: one long pale healed groove runs across the left side of the snout bone.",
     "the two black hands and their grip; the book, its worn corners and dark-green spine; the rest of the cover painting, the skeleton's pose and the museum hall; the camera angle, framing and lens; the light direction, colour and shadows; the colour grade, contrast and grain.",
     "the visible scar")

edit(231, 136, "عکس قاب #136 (اصلی، همون که ساختی)",
     "The three young people are gone: the hall in front of the skeleton is empty, showing the polished stone floor and the long shadows of the ribs where they stood.",
     "the skeleton, its pose, the skull and every bone; the plinth, the display cases, the skylights and the hall and every object and its position; the camera angle, framing and lens; the light direction, colour and shadows; the colour grade, contrast and grain.",
     "the empty hall")

# ---------- read shotlist for timing + text ----------
rows = {}
order = []
cur = None
for line in open(SHOTLIST, encoding="utf-8"):
    m = re.match(r"- \*\*#(\d+)\*\* · ([\d:.]+) · `([^`]+)`.*?— (.*)", line)
    if m:
        cur = int(m.group(1)); order.append(cur)
        rows[cur] = dict(t=m.group(2), method=m.group(3), see=re.sub(r" · _.*", "", m.group(4)).strip(), text="")
    elif cur and line.startswith("  > "):
        rows[cur]["text"] = line[4:].strip()
def end(n):
    i = order.index(n)
    return rows[order[i + 1]]["t"] if i + 1 < len(order) else "16:24.0"
CH = [(1, "۱ · Ten Days", 11, 49), (2, "۲ · The Smallest Thing in the Forest", 50, 84), (3, "۳ · A Shovel Made of Dinosaur", 85, 124),
      (4, "۴ · Eleven Percent", 125, 151), (5, "۵ تا ۷ · The Thing in the Tunnel → Stay Small", 152, 254)]

# sanity: every NEW/EDIT in the shotlist has a prompt (#112 moves CROP → EDIT)
need = {n for n, r in rows.items() if r["method"].startswith(("NEW", "EDIT"))} | {112, 231}
miss, extra = need - FR.keys(), FR.keys() - need
assert not miss and not extra, (sorted(miss), sorted(extra))

def words(s): return len(s.split())
HEAD = ("> هر بلوک کد یک پرامپت کامل است: کپی کن و مستقیم در Flow پیست کن. **پیوست**‌ها را قبل از پیست اضافه کن.\n"
        "> قاب‌های `M` (مادر) را با بالاترین رزولوشن بساز؛ از آن‌ها برش می‌زنم.\n"
        "> عکس هر قاب را با همان شماره ذخیره کن (مثلاً `014.jpg`) و در `uploads/dino-long-en/frames/` آپلود کن.\n")
stats = []
for k, title, a, b in CH:
    L = [f"# پرامپت‌ها · فصل {title}\n", HEAD]
    for n in order:
        if not (a <= n <= b) or n not in FR: continue
        kind, att, p = FR[n]
        r = rows[n]
        mother = r["method"] == "NEW·M"
        tag = "EDIT" if kind == "EDIT" else ("NEW · M" if mother else "NEW")
        sett = "۱۶:۹ · بالاترین رزولوشن (4K) — مادرِ برش‌ها" if mother else "۱۶:۹ · 2K"
        if kind == "EDIT": sett = "۱۶:۹ · Nano Banana (ویرایش) · از عکس **اصلی**"
        L += [f"### #{n:03d} · {r['t']}–{end(n)} · {tag}",
              f"**متن:** {r['text']}  ", f"**چی می‌بینیم:** {r['see']}  ",
              f"**پیوست:** {' · '.join(att)}  ", f"**تنظیمات:** {sett}", "", "```", p, "```", ""]
        stats.append((n, kind, words(p), len(att)))
    open(os.path.join(H, f"0{k}-ch{k}.md"), "w", encoding="utf-8").write("\n".join(L))
print(len(FR), "prompts")
for n, kind, w, a in stats:
    if kind == "NEW" and not (120 <= w <= 480) or a > 3: print("check", n, kind, w, "words", a, "attachments")
