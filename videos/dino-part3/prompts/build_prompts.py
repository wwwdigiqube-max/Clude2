# Part 3 · Flow Agent batch prompts (≤10 frames per prompt). Run: python3 videos/dino-part3/prompts/build_prompts.py
# Lessons from Part 2 are built into the RULES block (no scars, black arms, low tunnel, one-piece door, dark headlamp, fixed arm wraps).
import os, re
H = os.path.dirname(os.path.abspath(__file__))
SHOT = os.path.join(H, "..", "shotlist", "shotlist.md")

STYLE = ("Dark gritty animated survival story style for teens and adults, detailed digital painting, clean black outlines on the characters, "
         "realistic painterly background with depth, muted desaturated colours, dramatic cinematic lighting.")
ANAT = ("Strict stick-figure anatomy for every person: the only white part is the round off-white head; the body under the clothes is a thin solid black "
        "stick figure; arms, hands and legs are thin solid black lines, never white or skin-coloured; the face has only eyes, eyebrows and a simple mouth, no nose and no ears.")

REFS = {  # name: (what it looks like, file to attach)
 "HERO":    ("the character sheet of a tired young man in a faded rust-orange jacket with both sleeves torn off at mid-forearm", "P1-hero-winter"),
 "HERO3":   ("the character sheet of the same young man ready for a journey: dark crossed wraps on both forearms, a backpack with a turtle shell, a spear", "Q1-hero-journey"),
 "PIP":     ("the sheet of a tiny golden-brown mouse-like mammal", "R1-fandogh-sheet"),
 "MATE":    ("the image of two small mice in the snow: the smaller pale ash-grey one with a white chest patch is the mate", "p2-149-close"),
 "RIVER":   ("the image of a frozen grey river with a long crack in the ice and a burnt winter forest", "Q4-frozen-river"),
 "DOOR":    ("the image of the clay riverbank with the stone-slab tunnel entrance under the roots of a burnt tree", "P6-winter-river"),
 "TUNNEL":  ("the location sheet of the low round clay tunnel with the one-piece stone-slab door", "P9-tunnel-sheet"),
 "CHAMBER": ("the cross-section of the tunnel end chamber with a deep hollow, a stone fire pit and a chimney with a stone cap", "Q5-chamber-chimney"),
 "TURTLE":  ("the sheet of a sleeping turtle, a shell bowl with water and a clay-sealed glowing shell", "Q3-turtle-sheet"),
 "CROC":    ("the image of a crocodile in a muddy river", "D3b"),
 "BOOK":    ("the image of two hands holding a green library book with a painted T. rex skeleton on the cover", "قاب 017 قسمت اول"),
 "PAGES":   ("the image of an open book with painted natural-history illustrations", "قاب 045 قسمت اول"),
 "FUNGUS":  ("the sheet of a hoof-shaped bracket fungus on a dead tree and a smouldering slice", "Q6-tinder-fungus"),
 "DAD":     ("the character sheet of a bearded man with a red bandana and a beanie with a headlamp", "P4-dad"),
 "MOM":     ("the character sheet of a woman in a mustard-yellow cardigan", "A3-mom"),
 "OLDW":    ("the character sheet of an old woman with a grey braid and a wide-brimmed field hat", "P3-old-woman"),
 "BACKROOM":("the image of a museum back room with a work table, a green lamp and a fossil under a cloth", "Q8-museum-backroom"),
 "MUSEUM":  ("the image of a museum hall with a T. rex skeleton", "A1-museum"),
 "BEDROOM": ("the image of a woman sitting on her bed at night beside a lamp and a framed photo", "قاب p2-028"),
 "DIG":     ("the image of a fossil dig site in rocky badlands", "P8-dig-site"),
}
LONG = {
 "HERO": "the young man from HERO: tired small black oval eyes, messy dark-brown hair under a dark charcoal beanie with a small headlamp whose lens is dark, a faded rust-orange hooded jacket with BOTH sleeves torn off ragged at mid-forearm, bare thin black forearms with NO scars and NO bandage, dark grey t-shirt with a torn bottom edge, thin black legs, worn brown boots; no backpack unless a frame says so",
 "HERO3": "the young man from HERO3: same face and clothes as HERO, but both forearms wrapped from wrist to elbow in dark charcoal cloth strips crossed diagonally like boxer's wraps, with small tufts of pale fern fluff at the wrist and elbow, a little fluff at the collar; the two arms always look exactly the same",
 "PIP": "Pip: a tiny golden-brown mouse-sized early mammal with a cream belly, big shiny black eyes, pink nose, whiskers and a long thin pink tail",
 "MATE": "Pip's mate: smaller and slimmer than Pip, pale ash-grey fur, one white drop-shaped patch on her chest, white tail tip",
 "TUNNEL": "a low, narrow, round tunnel in brown clay with thin roots; he can only sit, kneel, lie or crawl inside; the door is ONE large flat stone slab set in a frame of stacked flat stones, with a hand-wide gap",
 "CHAMBER": "the end chamber of the tunnel: a small round clay room, a hollow dug below its floor lined with dead fern fronds, a small fire pit ringed with stones, and a fist-wide chimney hole in the clay roof above it",
 "RIVER": "the river frozen solid bank to bank, grey-white ice dusted with ash-snow, a long dark crack two hands wide over the deep pool, burnt black bare trees",
 "DAD": "the father from DAD: short dark beard, warm grin, red bandana, khaki field shirt, dark charcoal beanie with a small headlamp",
 "MOM": "the mother from MOM: wavy shoulder-length dark-brown hair with silver strands, mustard-yellow cardigan over a navy top; tired, dark circles under her eyes",
 "OLDW": "the old woman from OLDW: small and wiry, long grey braid, sand-coloured field vest, olive shirt; indoors her wide-brimmed hat lies on the table",
}
B = {}
def lab(n): return f"{int(n):03d}"
def new(batch, n, refs, shot, subject, place, *rest):
    light, comp = (rest if len(rest) == 2 else ("", rest[0] if rest else ""))
    t = f"FRAME p3-{lab(n)} · NEW · references: {', '.join(refs) if refs else 'none'}\n{shot} {subject}\n{place} {light}\n{comp}"
    B.setdefault(batch, []).append((n, re.sub(r"  +", " ", t)))
def edit(batch, n, src, change, keep):
    B.setdefault(batch, []).append((n, f"FRAME p3-{lab(n)} · EDIT of {src}\nChange only this: {change}\nKeep exactly the same: {keep}. Everything else is 100% identical."))
KEEP = "the characters, the place and every object and its position, the camera angle, framing and lens, the light and the colour grade"
ICE = "Place: the frozen river (RIVER). Light: dim grey half-light of noon under a sky of wet ash; ash-snow drifting."
IN = "Place: inside the tunnel (TUNNEL)."
FIRE_DOOR = " A small twig fire burns on the floor right at the gap of the stone-slab door; it is the only light."
FIRE_PIT = " A small fire burns in the stone fire pit of the chamber (CHAMBER); its smoke rises straight into the chimney hole in the roof."

# ======================= A · on the ice (arms bare) =======================
new("A", 1, ["HERO", "PIP", "RIVER"], "A wide shot at ice level, 35mm lens, highest resolution because it will be cropped.",
    "The young man (HERO) lies flat on his belly on the frozen river beside the long crack, peering into it, a long wooden spear with a lashed grey stone tip in his hands. Pip (PIP) sits at the edge of the crack, still. His bare black forearms rest on the ice.", ICE,
    "His face, the crack and Pip are each large enough to crop. Exactly one person and one Pip.")
new("A", 3, ["RIVER"], "A top-down close shot looking straight into the crack in the ice, 50mm lens.",
    "Through the dark water inside the crack, one slow grey fish as long as a forearm drifts near the bottom of a deep pool; small air bubbles under the ice edges.", ICE,
    "The fish is soft but readable at the centre. No people.")
new("A", 5, ["HERO", "RIVER"], "An extreme close-up from the side, 50mm lens.",
    "Two thin solid black hands grip a wooden spear upright above the crack, ready to strike; the grey stone tip trembles slightly. The ragged ends of the rust-orange sleeves show at the edge of the frame, forearms bare black.", ICE,
    "The stone tip is sharp at the centre, the dark water below. Exactly two hands.")
new("A", 9, ["HERO", "RIVER"], "A low side shot at ice level, 35mm lens, action.",
    "He drives the spear down into the crack; icy water splashes up in a burst of drops; his face is fierce and focused.", ICE, "One person.")
edit("A", 10, "image p3-009 (made above)", "the splash is gone; the spear tip hangs empty in the dark water, rings of ripples spread, no fish anywhere; his face is disappointed", KEEP)
new("A", 19, ["RIVER"], "A cutaway cross-section view of the river, like a diagram but painted, 24mm.",
    "Above: the thick grey ice sheet with snow on top. Below: dark slow water still flowing gently to the right; at the bottom, in the deepest pool, a dozen grey fish rest close together, barely moving.", "Place: under the frozen river.", "Cold blue-grey dim light filtering through the ice.")
new("A", 22, ["CROC", "RIVER"], "A low close shot at ice level, 85mm lens, highest resolution.",
    "The tip of a crocodile's snout, like the one in CROC, pokes up through a small round hole in the ice, nostrils just above the surface, white frost on its scales; the rest of the animal is hidden dark under the ice. Far behind, out of focus, a person's boots stand on the ice.", ICE,
    "The snout and its frosted nostrils fill the centre. One crocodile, no other animals.")
new("A", 24, ["HERO", "RIVER"], "A high wide shot from above, 24mm lens.",
    "On the white ice, a tiny figure (HERO) walks a wide careful arc around a small dark hole where a frosted crocodile snout pokes through; his footprints trace the curve in the snow.", ICE, "He is small; the empty ice dominates. One person.")
new("A", 25, ["HERO", "RIVER"], "A medium shot at eye level, 50mm lens, highest resolution.",
    "He kneels at the edge of the river ice and breaks off a clear chunk of ice with a stone; the ice chunk is clean and glassy, the snow around it grey with ash. Bare black forearms.", ICE,
    "His hands and the clear ice are large enough to crop. One person.")
new("A", 70, ["HERO", "RIVER"], "A medium action shot at ice level, 35mm lens.",
    "He pulls the spear up out of the crack with a grey fish on the stone tip, water spraying; his face lights up, triumphant. Bare black forearms.", ICE, "One person, one fish.")

# ======================= B · river & outside (arms bare) =======================
new("B", 67, ["PIP", "MATE", "HERO", "RIVER"], "A low close shot at ice level, 85mm lens, highest resolution.",
    "Pip (PIP) sits at the edge of the crack in the ice, still as a stone. Behind him, slightly out of focus, the young man's rust-orange jacket; from its pocket peeks the small pale ash-grey head of Pip's mate (MATE).", ICE,
    "Pip sharp in the foreground, the mate readable in the pocket. Exactly two animals.")
new("B", 71, ["HERO", "DOOR"], "A wide shot at eye level, 35mm lens.",
    "He walks across the snowy river ice toward the stone-slab tunnel entrance under the roots of the huge burnt tree, both hands pressed to his jacket where he carries the fish. Bare black forearms.", "Place: the riverbank from DOOR, river frozen.", "Dusky grey light.", "One person.")
new("B", 76, ["HERO", "RIVER"], "A medium-wide shot at ground level, 35mm lens, highest resolution.",
    "He kneels at the river's edge where the shore ice is broken, both bare black forearms pushed into soft dark mud up to the elbow, digging slowly. Far in the background, the small hole in the ice with the crocodile's snout.", ICE,
    "His face, his arms in the mud and the far hole are each croppable. One person.")
new("B", 93, ["RIVER"], "A wide shot at eye level, 24mm lens.",
    "An imagined grey sea shore: a long flat beach of dark sand and pale shells, slow low waves, a little steam over the water, a few small birds on the shore; the sky the same ash grey but a touch warmer at the horizon.", "Place: a coast at the end of the world.", "Dim, soft, slightly warmer grey light.", "No people.")
new("B", 96, ["HERO", "RIVER"], "An extreme close-up at ice level, 50mm lens.",
    "A worn brown boot stamps on thin river ice; white cracks spider out from under the heel and dark water seeps up.", ICE, "The cracks at the centre.")
new("B", 97, ["RIVER"], "An extreme wide shot from a high bank, 24mm lens, highest resolution.",
    "The frozen river winds away east into grey mist like a long white road between black burnt trees.", ICE, "The river fills the lower half and vanishes into the distance. No people.")
new("B", 118, ["HERO", "DOOR"], "A medium shot at eye level, 35mm lens.",
    "He kneels in the snowbank beside the stone-slab tunnel entrance, burying several grey fish in the snow with his black hands. Bare black forearms.", "Place: DOOR, winter.", "Grey daylight.", "One person.")
new("B", 44, ["TURTLE", "RIVER"], "A painted cutaway cross-section, 24mm.",
    "Under the thick river ice and dark water, the soft mud at the bottom; buried in it, two sleeping turtles like the one in TURTLE and three small frogs, eyes closed, curled still.", "Place: the bottom of the frozen river.", "Dim cold blue light through the ice.",
    "The sleeping animals are each croppable. No people.")

# ======================= C · inside the tunnel (arms bare, fire at the door) =======================
new("C", 31, ["HERO", "TUNNEL"], "A medium shot at floor level, 35mm lens, highest resolution.",
    "He kneels at the back of the low nest chamber and pulls a dark, empty, sagging backpack out of the darkness. Bare black forearms.", IN + FIRE_DOOR, "Firelight from the far end; deep shadow.",
    "His face and the empty backpack are croppable. One person.")
new("C", 33, ["TUNNEL"], "An extreme close-up insert, 50mm lens.",
    "A school textbook burns in the small fire, its plain pages curling and blackening; the pages are blank, with no text.", IN + FIRE_DOOR, "Warm firelight.", "No people.")
new("C", 36, ["HERO", "PIP", "MATE", "BOOK", "TUNNEL"], "A medium shot at eye level, 35mm lens, highest resolution.",
    "He sits cross-legged by the small fire with the green library book from BOOK open on his knees, reading; Pip (PIP) and his mate (MATE) sit beside his knee in the warm light. Bare black forearms.", IN + FIRE_DOOR, "The fire lights his face and the pages.",
    "His face, the book and the two animals are each croppable. One person, two animals.")
new("C", 43, ["PAGES"], "A top-down extreme close-up of one book page, 50mm lens.",
    "A painted natural-history illustration on cream paper in the style of PAGES: a cutaway of a river bottom in winter, a turtle and a frog asleep in the mud under a layer of ice. Two black thumbs hold the page edges.", "The page fills the frame.", "Warm firelight.",
    "No text, no captions, no lettering anywhere.")
new("C", 47, ["HERO", "BOOK"], "An extreme close-up insert, 50mm lens.",
    "Two black hands carefully tear a blank cream page from the front of the green library book; the painted T. rex skeleton cover is visible at the edge.", IN, "Firelight.", "Exactly two hands and one book.")
new("C", 72, ["TUNNEL"], "An extreme close-up insert, 50mm lens.",
    "A small grey fish cooks on a flat stone pulled from the fire, the stone glowing hot, a little steam rising.", IN + FIRE_DOOR, "Warm firelight.", "No people.")
new("C", 73, ["HERO", "PIP", "MATE", "TUNNEL"], "A medium shot at eye level, 50mm lens, highest resolution.",
    "He sits by the fire eating cooked fish with his eyes closed in bliss; at his knee, Pip (PIP) and his mate (MATE) nibble small scraps of fish. Bare black forearms.", IN + FIRE_DOOR, "Warm firelight.",
    "His face and the two animals are each croppable.")
new("C", 80, ["HERO", "TURTLE", "TUNNEL"], "A medium shot at eye level, 50mm lens.",
    "He sits quietly by the fire, head bowed, thoughtful; beside him on the floor lie two empty, cleaned turtle shells like those in TURTLE. No blood, nothing graphic. Bare black forearms.", IN + FIRE_DOOR, "Soft firelight.", "One person, two empty shells.")
new("C", 100, ["TURTLE", "TUNNEL"], "An extreme close-up insert, 50mm lens.",
    "A turtle-shell bowl holds water frozen solid into white ice, an arm's length from a heap of grey ash with glowing red coals beneath it.", IN, "Cold light with a faint red glow.", "No people.")
new("C", 105, ["HERO", "TUNNEL", "CHAMBER"], "A medium shot at floor level, 35mm lens, highest resolution.",
    "In the end chamber, he kneels and digs a hollow into the floor with a sharp grey stone and his bare black hands; loose clay piles beside him.", IN + FIRE_DOOR, "Firelight from down the tunnel.",
    "His face and the hollow are croppable. One person.")

# ======================= D · chamber, fire pit (arms bare) =======================
new("D", 108, ["HERO", "CHAMBER"], "A medium shot, 35mm lens.",
    "Kneeling over a small ring of stones in the chamber, he pushes a long straight stick up into the clay roof above it; crumbs of clay fall. Bare black forearms.", "Place: the end chamber (CHAMBER).", "Dim firelight.", "One person.")
new("D", 111, ["CHAMBER", "TUNNEL"], "A medium-wide shot inside the chamber, 35mm lens.",
    "A small fire burns in the stone fire pit; its smoke rises straight up into a fist-wide hole in the clay roof and disappears; the chamber glows warm.", "Place: the end chamber (CHAMBER)." + FIRE_PIT, "Warm firelight.", "No people.")
new("D", 112, ["PIP", "MATE", "CHAMBER"], "A low close shot, 85mm lens, highest resolution.",
    "Pip (PIP) and his mate (MATE) drag dead brown fern fronds and a small scrap of dark grey cloth into the hollow under the chamber floor, building a nest.", "Place: the hollow in CHAMBER.", "Warm low firelight.", "Both animals croppable. Exactly two animals.")
new("D", 120, ["HERO", "CHAMBER"], "A medium shot, 35mm lens, highest resolution.",
    "By the fire pit, he packs the dark backpack with bundles of dried fish and dried grubs wrapped in leaves; the bag is growing full and heavy. Bare black forearms.", "Place: CHAMBER." + FIRE_PIT, "Warm firelight.", "His face and the backpack are croppable. One person.")
new("D", 127, ["HERO"], "A close shot, 85mm lens.",
    "His bare thin black forearms come out of the torn rust-orange sleeve ends; he hugs himself, shivering; frost glitters on the jacket.", "Place: CHAMBER, cold morning.", "Cold blue light.", "Exactly one person.")
new("D", 128, ["HERO"], "An extreme close-up insert, 50mm lens.",
    "His black hands stuff handfuls of pale beige fern fluff between his dark grey t-shirt and the rust-orange jacket.", "Place: CHAMBER.", "Firelight.", "Exactly two hands.")

# ======================= E · today: museum and home =======================
new("E", 53, ["OLDW", "BACKROOM"], "A medium-wide shot, 35mm lens.",
    "In the museum back room, two stick-figure colleagues in white lab coats stand by the table with the fossil bone, one shrugging, one smiling sceptically; the old woman (OLDW) sits looking at the bone, unconvinced.", "Place: BACKROOM.", "Warm lamplight.", "Exactly three people. No readable lettering.")
new("E", 55, ["DIG"], "A wide painted cross-section of a rock cliff in the badlands, 35mm lens, highest resolution.",
    "Layers of grey and tan rock; one thin pale line of clay runs straight across all of them; inside that thin line lies the dark fossil shoulder blade.", "Place: the badlands from DIG.", "Bright cold light.", "The thin clay line and the bone are clear. No people. No labels.")
new("E", 61, ["OLDW", "BACKROOM"], "A medium shot, 50mm lens, highest resolution.",
    "The old woman (OLDW) leans over the fossil bone on the table and takes a photo of it with her phone; the phone screen is blank.", "Place: BACKROOM.", "Warm lamplight.", "One person.")
edit("E", 62, "image p3-061 (made above)", "the room is dark, the lamp is off, the bone lies covered with a white cloth, and the old woman is gone", "the room, the table, the shelves and the camera angle")
edit("E", 141, "the attached image BEDROOM", "the woman now lies asleep on top of the covers, curled on her side, the lamp still on", "the room, the bed, the nightstand, the framed photo, the camera angle, framing and light")
new("E", 151, ["MOM", "BEDROOM"], "A medium shot, 35mm lens.",
    "In the dark bedroom, the mother (MOM) sits bolt upright in bed, gasping, one hand on her chest, eyes wide.", "Place: the bedroom from BEDROOM.", "Almost dark; a faint blue light from the window.", "One person.")
new("E", 154, ["MOM", "MUSEUM"], "A wide shot at eye level, 35mm lens.",
    "The mother (MOM) stands alone at the closed glass doors of the museum in the early grey morning, her breath fogging; the hall inside is dark.", "Place: outside the museum from MUSEUM.", "Cold grey dawn.", "One person.")
new("E", 156, ["MOM", "OLDW", "BACKROOM"], "A medium-wide shot, 35mm lens, highest resolution.",
    "The old woman (OLDW) sits at the table with a white cloth over a bone; the mother (MOM) stands in the doorway, coat on, tired, holding the door frame.", "Place: BACKROOM, morning.", "Lamplight and grey morning light.",
    "Both faces croppable. Exactly two people.")
new("E", 160, ["OLDW", "BACKROOM"], "An extreme close-up insert, 50mm lens.",
    "Two black hands slowly pull a white cloth off the dark-brown fossil shoulder blade on the table.", "Place: BACKROOM.", "Warm lamplight.", "Exactly two hands and one bone.")
new("E", 162, ["MOM", "BACKROOM"], "A close-up of her face, 85mm lens.",
    "The mother (MOM) looks down at something on the table, lit from below by the lamp, eyes wet, lips parted.", "Place: BACKROOM.", "Warm lamplight from below.", "Exactly one person.")

# ======================= F · dream and memories =======================
new("F", 143, ["MOM", "DOOR"], "A wide shot at eye level, 35mm lens, highest resolution.",
    "In a dream, the mother (MOM) stands in a grey burnt forest by a frozen river, grey snow falling around her, a soft dreamy haze over everything.", "Place: the riverbank from DOOR, seen through a dream.", "Dim grey light, soft glow at the edges of the frame.", "One person.")
new("F", 145, ["HERO3", "DOOR"], "A wide shot from a distance, 50mm lens, highest resolution.",
    "In the dream: under the roots of the huge black tree beside the stone-slab entrance, a boy (HERO3) sits by a small fire, talking to it, his forearms in dark crossed wraps; grey snow falls; soft dreamy haze.", "Place: DOOR.", "Warm firelight inside a grey world.", "One person.")
new("F", 150, ["HERO3"], "A close-up of his face, 85mm lens.",
    "The boy (HERO3) looks up straight at the camera, firelight on his face, grey snowflakes drifting; soft dream haze.", "Place: by the fire under the roots.", "Warm firelight.", "Exactly one person.")
new("F", 91, ["DAD"], "A medium shot at eye level, 50mm lens, highest resolution.",
    "A memory: in a warm living room at night, the father (DAD) kneels by a window with snow falling outside, talking to a small seven-year-old stick-figure boy in a tiny rust-orange hoodie, both looking out.", "Place: a family home in winter.", "Warm lamplight inside, blue snow light outside; soft faded colours like an old memory.", "Exactly two people.")
new("F", 122, ["DAD", "FUNGUS"], "A medium shot, 50mm lens, highest resolution.",
    "A memory on a camping trip: the father (DAD) kneels by a dead tree in an autumn forest, pointing at a hoof-shaped bracket fungus (FUNGUS) on the trunk; a small boy in a tiny rust-orange hoodie watches closely.", "Place: an autumn forest of today.", "Warm soft afternoon light, faded like an old photo.", "Exactly two people.")
new("F", 164, ["MOM"], "An extreme close-up insert, 50mm lens.",
    "A white family fridge door covered with small handwritten paper notes held by magnets; the notes show only scribbles, no readable words.", "Place: a warm family kitchen.", "Soft morning light, warm memory colours.", "No people. No readable lettering.")

# ======================= G · the last night and leaving (arms WRAPPED) =======================
new("G", 129, ["HERO3"], "A medium close shot, 50mm lens, highest resolution.",
    "By the fire pit, he wraps his left forearm in dark charcoal cloth strips crossed diagonally over pale fern fluff; his right forearm is already wrapped exactly like in HERO3.", "Place: CHAMBER." + FIRE_PIT, "Warm firelight.", "His hands and face croppable. One person.")
new("G", 131, ["HERO3", "RIVER"], "An extreme close-up at ice level, 50mm lens.",
    "A worn brown boot stamps hard on thick grey river ice; a puff of snow flies up; the ice does not crack at all.", ICE, "The boot and the solid ice at the centre.")
new("G", 133, ["HERO3", "PIP", "MATE", "CHAMBER"], "A medium-wide shot, 35mm lens, highest resolution.",
    "The night before leaving: he (HERO3) sits by the fire pit hugging his knees, the full backpack and two turtle shells beside him; in the hollow below, Pip (PIP) and his mate (MATE) sleep curled together.", "Place: CHAMBER." + FIRE_PIT, "Warm firelight, deep shadows.",
    "His face, the gear and the sleeping animals are each croppable.")
new("G", 166, ["HERO3", "PIP", "MATE", "CHAMBER"], "A medium full shot at eye level, 35mm lens, highest resolution.",
    "He kneels in the chamber, fully ready exactly like HERO3: heavy backpack on, an empty turtle shell tied on top of it, a clay-sealed shell glowing at his hip, the spear in his hand; Pip's head peeks from one jacket pocket, his mate's grey head from the other.", "Place: CHAMBER.", "The fire is out; grey morning light from down the tunnel.",
    "The pockets, the glowing shell and his face are each croppable.")
new("G", 169, ["HERO3", "TUNNEL"], "A medium shot, 35mm lens, highest resolution.",
    "He sits in the low tunnel beside the clay wall covered with charcoal tally marks and lists (plain strokes, no readable words), one wrapped forearm reaching to touch the marks, gear on his back.", IN, "Grey morning light from the door gap.", "His face and the wall are croppable. One person.")
new("G", 176, ["HERO3"], "An extreme close-up insert, 50mm lens.",
    "A black hand coming out of a dark crossed forearm wrap writes with a stick of charcoal under rows of old tally marks on the clay wall; the new marks are plain strokes, not readable letters.", IN, "Grey light.", "One hand, the wall.")
new("G", 179, ["HERO3", "DOOR"], "A medium-wide shot at eye level, 35mm lens, highest resolution.",
    "Outside, in the snow, he pushes the one-piece stone slab across the tunnel entrance from the outside, leaning his weight into it; backpack on, spear propped beside him.", "Place: DOOR.", "Cold grey morning, falling ash-snow.", "His face and the slab are croppable. One person.")
new("G", 180, ["HERO3", "RIVER"], "An extreme wide shot from the bank behind him, 24mm lens, highest resolution.",
    "A tiny figure with a backpack and a spear (HERO3) walks east along the middle of the frozen river, away from the camera; behind, the huge burnt tree and the stone-slab entrance on the bank.", ICE,
    "He is small, centre; the white river leads into grey mist. One person.")

# ---------- write ----------
rows = {}
for line in open(SHOT, encoding="utf-8"):
    m = re.match(r"- \*\*#(\d+)\*\* · ([\d:.]+) · `([^`]+)`", line)
    if m: rows[int(m.group(1))] = m.group(3)
need = {n for n, m in rows.items() if m.startswith(("NEW", "EDIT"))}
have = {n for v in B.values() for n, _ in v}
assert need == have, (sorted(need - have), sorted(have - need))
TITLE = {"A": "روی یخ (دست‌ها لخت)", "B": "رود و بیرون (دست‌ها لخت)", "C": "داخل تونل، آتیش دم در (دست‌ها لخت)", "D": "اتاقک و اجاق (دست‌ها لخت)",
         "E": "امروز: موزه و خونه", "F": "خواب و خاطره‌ها", "G": "شب آخر و رفتن (دست‌ها پیچیده)"}
for i, k in enumerate("ABCDEFG", 1):
    frames = B[k]
    used = [r for r in REFS if any(re.search(r"\b" + r + r"\b", t) for _, t in frames)]
    if "HERO3" in used and "HERO" in used and k == "G": used.remove("HERO")
    names = ", ".join(f"p3-{lab(n)}" for n, _ in frames)
    rules = [STYLE, ANAT,
             "Every character, animal, place and object must look exactly like its reference. Do not invent new characters.",
             "Never draw scars, wounds or a light bandage on the young man's arms.",
             "His headlamp is always switched off: its lens is dark.",
             "Inside the tunnel he can only sit, kneel, lie or crawl, never stand; the tunnel door is always one single flat stone slab in a frame of stacked flat stones.",
             "Wide 16:9, highest quality. No lettering, numbers, captions, logos or watermarks in any image.",
             f"Name each image exactly with its frame code: {names}.",
             "An EDIT frame changes only what it says, starting from the image it names."]
    if any(re.search(r"\bHERO3\b", t) for _, t in frames): rules.insert(3, "Whenever the young man appears in this batch, both of his forearms are wrapped exactly as in HERO3: dark charcoal crossed strips with tufts of fern fluff. Never bare, never a light bandage.")
    if any(re.search(r"\bHERO\b", t) for _, t in frames): rules.insert(3, "In every frame of this batch his jacket sleeves are torn off at mid-forearm and his forearms are bare solid black. He wears NO BACKPACK at all (the backpack stays at the back of the tunnel), unless a frame says he is holding or packing it.")
    head = (f"You are making {len(frames)} still frames for a dark animated survival story, one image per frame, in the order below.\n\nATTACHED REFERENCES (match them exactly):\n"
            + "\n".join(f"- {r} = {REFS[r][0]}" for r in used) + "\n\n"
            + ("CAST AND PLACES:\n" + "\n".join(f"- {r}: {LONG[r]}" for r in used if r in LONG) + "\n\n" if any(r in LONG for r in used) else "")
            + "RULES FOR EVERY FRAME:\n" + "\n".join("- " + x for x in rules) + "\n")
    body = "\n\n".join(t for _, t in frames)
    att = " · ".join(f"`{REFS[r][1]}` ({r})" for r in used)
    md = [f"# دسته‌ی {k} · {TITLE[k]} · {len(frames)} قاب\n", f"**قاب‌ها:** {names}  ", f"**پیوست (همه با هم):** {att}  ",
          "**Flow:** حالت **Agent** روشن، ۱۶:۹، بالاترین کیفیت. کل بلوک زیر را یک‌جا پیست کن.\n", "```", head + "\n" + body, "```", ""]
    open(os.path.join(H, f"{i:02d}-batch-{k}.md"), "w", encoding="utf-8").write("\n".join(md))
    print(k, len(frames), "frames,", len((head + body).split()), "words,", len(used), "refs:", " ".join(REFS[r][1] for r in used))
