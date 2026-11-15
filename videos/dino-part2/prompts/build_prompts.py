# Part 2 · Flow Agent batch prompts (10 frames per prompt). Run: python3 videos/dino-part2/prompts/build_prompts.py
# Descriptors rewritten from the real assets P1–P8 (uploads/dino-part2/assets) and the Part 1 refs.
# STATE column of the shotlist (story-audit station 2) is written into each frame as sentences.
import os, re
H = os.path.dirname(os.path.abspath(__file__))
SHOT = os.path.join(H, "..", "shotlist", "shotlist.md")

STYLE = ("Dark gritty animated survival story style for teens and adults, detailed digital painting, clean black outlines on the "
         "characters, realistic painterly background with depth, muted desaturated colours, dramatic cinematic lighting.")
ANAT = ("Strict stick-figure anatomy for every person: the only white part is the round off-white head, about one third of the body height; "
        "the body under the clothes is a thin solid black stick figure with a short black stick neck; bare arms and legs are thin black lines, never skin; "
        "hands are simple solid black hands; the face has only eyes, eyebrows and a simple mouth, no nose and no ears.")

# ---------- locked descriptors (from the real images) ----------
HERO = ("the young man from HERO: tired small black oval eyes with heavy lid lines and dark shadows under them, thin dark eyebrows, longer messy dark-brown hair "
        "under a dark charcoal knit beanie with a small square headlamp on a brown strap, grey ash smudges on his cheeks, an open rust-orange hooded jacket that is faded, "
        "ash-stained and frayed at the hem, with both sleeves torn off ragged at mid-forearm, over a dark grey t-shirt with a ragged torn bottom edge, long thin black stick legs and worn dark-brown hiking boots; no backpack")
SCAR = ("The jacket sleeve on his own right arm is pushed up to the elbow, showing on his black right forearm the healed scar from HERO: one long pale scar with three short "
        "parallel pale claw lines beside it, no bandage")
SLEEVES = "Both jacket sleeves are down to his wrists; there is no bandage anywhere"
BANDAGE = ("This is weeks earlier: his own right forearm is still wrapped in a dirty bandage torn from grey t-shirt cloth, and his jacket looks a little less worn")
HANDS = "Only his hands and forearms are visible: simple solid black stick-figure hands coming out of the frayed cuffs of the faded rust-orange jacket"
PIP = "Pip from PIP: a tiny early mammal the size of a mouse, warm golden-brown fur, cream belly, big shiny black eyes, pointed pink nose with long whiskers, round pink-lined ears, pink paws and a long thin pink tail, a little thinner than before"
MATE = ("the female from MATE: clearly smaller and slimmer than Pip, with pale ash-grey fur (not golden-brown), one clear white drop-shaped patch on her chest and a white tip on her tail; "
        "big shiny black eyes, pink nose, long whiskers, long thin pink tail")
OLDW = ("the old woman from OLDW: small and wiry, fine wrinkle lines and crow's-feet, small black oval eyes, thin grey eyebrows, a calm kind half-smile, a long grey braid over "
        "her shoulder, a sun-faded olive-grey wide-brimmed canvas hat, a sand-coloured field vest with many pockets and a small brush in the chest pocket, a rolled-sleeve "
        "olive-green shirt, khaki work trousers and dusty brown lace-up boots")
DAD = ("the father from DAD: late thirties, small black oval eyes, thick dark eyebrows, a warm wide grin, short messy dark-brown hair under a dark charcoal knit beanie with a "
       "small square headlamp, a faded red bandana tied at his neck, a dusty khaki field shirt with rolled sleeves and two chest pockets, brown canvas trousers and dusty work boots")
MOM = ("the mother from MOM: middle-aged, small black oval eyes, thin eyebrows, wavy shoulder-length dark-brown hair with a few silver strands, a mustard-yellow knitted "
       "cardigan over a navy top, dark trousers and black shoes; she looks tired and older than in her photo, with faint dark circles under her eyes")
FRA = "the first friend from FRIEND1: tall and lanky, thick dark eyebrows, a big mop of tight black curls, round thin-rimmed glasses, a navy-blue hoodie, grey jeans and white sneakers"
FRB = "the second friend from FRIEND2: a long high copper-red ponytail, thin eyebrows, an olive-green bomber jacket over a white t-shirt, black jeans and dark maroon boots"
BONE = ("the bone shovel from BONE: one pale dinosaur shoulder blade as long as an arm, with a broad, flat, thin paddle-shaped blade at one end that narrows into "
        "one single thick rounded end, worn and stained with dried clay")
CROC = "the crocodile from CROC: a big crocodile with a heavy dark olive-grey armoured back of rough bony plates, a broad snout and pale yellow eyes"
CHAMP = ("the champsosaur from CHAMP: a slim, smooth, lizard-like freshwater reptile about two metres long, with a very long, very thin needle-like snout lined with tiny teeth, "
         "the back of the skull flaring wide behind small eyes set on top of the head, short sprawling webbed legs, a long flat smooth tail, olive-brown skin with a pale belly and no armour plates")
DUCK = ("one duck-billed dinosaur shaped like the ones in DUCKBILL: a broad flat duck-like beak, a long heavy tail, standing on its hind legs with its front hands down, "
        "grey-brown skin; it is starving, so thin that its ribs and hip bones show under sagging skin")

TUN = ("The place is the tunnel from TUNNEL: a low, narrow, round tunnel dug into brown clay, as wide as his shoulders and so low that when he sits the ceiling is just above his beanie, with a smooth arched ceiling and thin roots poking through the walls; "
       "at the entrance end, the round opening is framed by stacked flat grey stones and closed by one single large, smooth, flat grey stone slab (one piece, not a wall of blocks), leaving a vertical gap a hand wide between the slab's edge and the stacked stones.")
FIRE = " A small fire of twigs burns on the tunnel floor right at the gap of the stone door."
RIV = ("The place is the river from RIVER: a wide, slow, cold grey river with thin white ice along both edges, a low clay bank, burnt black bare trees and fallen logs "
       "dusted with grey ash-snow, and no green anywhere.")
DOOR_OUT = (" On the bank, under the roots of a huge burnt black tree, is the tunnel entrance from RIVER: a low opening built of stacked flat grey stones, "
            "closed by one large flat grey stone slab.")
EARLY = ("The place is the same river as in RIVER, but weeks earlier: no snow and no ice yet; the trees are freshly burnt black and bare, grey ash covers the ground, "
         "and thin smoke still hangs in the air.")
FOREST = "The place is the dead forest from FOREST: black burnt trunks and snapped stumps, grey ash and thin ash-snow covering the ground, no green anywhere."
MUSEUM = ("The place is the museum hall from MUSEUM: polished pale stone floor, tall dark wooden display cases, long skylights, and one mounted Tyrannosaurus rex skeleton of "
          "aged ivory-brown fossil bone on a low dark plinth, its skull turned toward frame-left.")
DIG = ("The place is the dig site from DIG: a shallow excavation pit in grey clay marked with a grid of white string on wooden stakes, layered grey, tan and rust badland hills, "
       "a faded canvas sun shade, buckets, brushes and a white cooler; in the pit lies the dark-brown fossil shoulder blade from DIG, half dug out of the grey clay.")
ROOM = ("The place is the bedroom from BEDROOM: a wooden single bed with grey-blue bedding, a bedside table with a lamp, dark blue walls covered with dinosaur posters, "
        "and a simple wooden desk; the posters show only pictures, no lettering.")
STORM = "Light: cold, dim, grey daylight under a sky of wet ash."
NOLET = "Clean image with blank unbranded surfaces and no lettering, letters, numbers or captions anywhere. Wide 16:9 composition."

REFS = {  # name: (what it looks like, for the agent) , (file the user attaches)
 "HERO":    ("the character sheet of a tired young man in a faded rust-orange jacket with both sleeves torn off at mid-forearm", "P1-hero-winter"),
 "PIP":     ("the sheet of a tiny golden-brown mouse-like mammal in several poses", "R1-fandogh-sheet"),
 "MATE":    ("the sheet of a small pale ash-grey mouse-like mammal with a white drop-shaped patch on her chest", "P2-pip-mate"),
 "OLDW":    ("the character sheet of an old woman with a grey braid and a wide-brimmed field hat", "P3-old-woman"),
 "DAD":     ("the character sheet of a smiling man with a red bandana and a beanie with a headlamp", "P4-dad"),
 "CHAMP":   ("the image of a slim long-snouted reptile lying on river ice", "P5-champsosaur"),
 "RIVER":   ("the image of a cold grey river in a burnt winter forest with a stone-slab door under tree roots", "P6-winter-river"),
 "DIG":     ("the image of a fossil dig site in rocky badlands with a white string grid", "P8-dig-site"),
 "TUNNEL":  ("the location sheet of a low, round clay tunnel with a stone-slab door; it sets the exact size and look of the tunnel", "P9-tunnel-sheet"),
 "BONE":    ("the image of a boy holding a large pale shoulder-blade bone", "D4e"),
 "BANDAGE": ("the image of the young man kneeling by a stone entrance with a bandage on his forearm, looking at a phone", "D9b"),
 "CROC":    ("the image of a crocodile in a muddy river", "D3b"),
 "DUCKBILL":("the image of a herd of duck-billed dinosaurs at a misty river", "D4a"),
 "FOREST":  ("the image of a grey burnt dead forest", "D11a"),
 "ROOTS":   ("the image of a huge mossy tree with big roots and a small burrow hole", "D2a"),
 "WALL":    ("the image of a young man scratching tally marks on a clay tunnel wall", "D11c"),
 "MOM":     ("the character sheet of a woman in a mustard-yellow cardigan", "A3-mom"),
 "FRIEND1": ("the character sheet of a tall young man with black curls and round glasses", "A4-friend-a"),
 "FRIEND2": ("the character sheet of a young woman with a copper-red ponytail", "A5-friend-b"),
 "MUSEUM":  ("the image of a museum hall with a T. rex skeleton", "A1-museum"),
 "BEDROOM": ("the image of a boy lying on a bed in a dark blue bedroom with dinosaur posters", "D1a"),
 "KITCHEN": ("the image of a woman in a mustard cardigan cooking in a warm kitchen", "قاب 134 قسمت اول"),
}

LONG = {"HERO": HERO, "PIP": PIP, "MATE": MATE, "OLDW": OLDW, "DAD": DAD, "MOM": MOM, "FRIEND1": FRA, "FRIEND2": FRB,
        "BONE": BONE, "CROC": CROC, "CHAMP": CHAMP, "DUCKBILL": DUCK}
HERO, PIP, MATE, OLDW, MOM = "the young man (HERO)", "Pip (PIP)", "Pip's female (MATE)", "the old woman (OLDW)", "the mother (MOM)"
DAD, FRA, FRB = "the father (DAD)", "the first friend (FRIEND1)", "the second friend (FRIEND2)"
BONE, CROC, CHAMP = "the bone shovel (BONE)", "the crocodile (CROC)", "the champsosaur (CHAMP)"
DUCK = "one starving duck-billed dinosaur (DUCKBILL), so thin that its ribs and hip bones show under sagging grey-brown skin"
SCAR = "Both jacket sleeves are torn off, ragged, at mid-forearm; below them his forearms and hands are plain solid black, with no scar marks and no bandage"
SLEEVES = SCAR
BANDAGE = "This is weeks earlier: his own right forearm is still wrapped in the dirty grey cloth bandage exactly as in BANDAGE"
HANDS = "Only his black hands and forearms are visible, coming out of the frayed cuffs of the faded rust-orange jacket"
LONG.update({"TUNNEL": TUN.replace("The place is the tunnel from TUNNEL: ", ""), "RIVER": RIV.replace("The place is the river from RIVER: ", "") + DOOR_OUT.replace(" from RIVER", ""),
     "FOREST": FOREST.replace("The place is the dead forest from FOREST: ", ""), "MUSEUM": MUSEUM.replace("The place is the museum hall from MUSEUM: ", ""),
     "DIG": DIG.replace("The place is the dig site from DIG: ", ""), "BEDROOM": ROOM.replace("The place is the bedroom from BEDROOM: ", "")})
TUN, RIV, FOREST, MUSEUM, DIG, ROOM = ("Place: the tunnel (TUNNEL).", "Place: the river (RIVER), in winter.", "Place: the dead forest (FOREST).",
                                       "Place: the museum hall (MUSEUM).", "Place: the dig site (DIG).", "Place: the bedroom (BEDROOM).")
DOOR_OUT = " The stone-slab tunnel entrance under the burnt tree roots is in view."
EARLY = "Place: the same river as RIVER, but weeks earlier: no snow and no ice yet, trees freshly burnt black, grey ash on the ground, thin smoke in the air."
NOLET = ""
def lab(n):
    m = re.match(r"(\d+)([a-z]?)$", str(n)); return f"{int(m.group(1)):03d}{m.group(2)}"
B = {}   # batch -> list of (frame, text)
def new(batch, n, refs, shot, subject, place, light, pal, comp, clean=NOLET):
    t = (f"FRAME p2-{lab(n)} · NEW · references: {', '.join(refs) if refs else 'none'}\n"
         f"{shot} {subject}\n{place} {light}\nPalette: {pal}. {comp} {clean}")
    B.setdefault(batch, []).append((n, re.sub(r"  +", " ", t)))
def edit(batch, n, src, change, keep):
    t = (f"FRAME p2-{lab(n)} · EDIT of {src}\nChange only this: {change}\n"
         f"Keep exactly the same: {keep}. Everything else is 100% identical. {NOLET}")
    B.setdefault(batch, []).append((n, t))
KEEP = "the place and every object and its position, the camera angle, framing and lens, the light direction, colour and shadows, the colour grade and grain"

# ======================= A · tunnel, fire, days 40–55 =======================
new("A", 2, ["TUNNEL"], "An extreme close-up insert at eye level, 50mm lens.",
    "A small shelf cut into the brown clay wall of the tunnel. It is empty: only a few tiny white fish bones and one dry fish tail lie on its floor.",
    "Place: the clay wall of the tunnel (TUNNEL), with thin roots.", "Warm flickering firelight from the lower left; the rest falls into deep shadow.",
    "60% warm brown clay, 30% darkness, 10% pale fish bones", "The shelf fills the centre. No people and no animals.")
edit("A", 12, "image p2-002 (made above)",
     "the shelf now holds seven small dried silvery-brown river fish lying side by side in a neat row; the loose fish bones and the tail are gone",
     "the clay shelf, the wall, the roots, " + KEEP)
new("A", 4, ["HERO", "PIP", "TUNNEL"], "A medium close-up at eye level, 50mm lens, highest resolution because it will be cropped.",
    f"He kneels by the small fire, {HERO}. He holds a piece of soft white fungus up toward the flame between the black fingers of his right hand and studies it, his thin face hungry and doubtful. {SCAR}. Pip sits up beside his knee, stretching his nose toward the fungus, sniffing.",
    TUN + FIRE, "The small fire is the only light: warm orange on his face, the fungus and Pip; the tunnel behind falls into darkness.",
    "60% warm darkness, 30% firelight orange, 10% rust-orange jacket",
    "His face sits in the left third, the hand with the fungus at the centre and Pip in the right third, each large and sharp enough to crop on its own. Exactly one person and one Pip.")
new("A", 53, ["HERO", "TUNNEL"], "A close-up at eye level, 85mm lens, highest resolution.",
    f"He sits hunched close to the small fire, {HERO}. His face is thinner than in HERO: cheeks hollow, eyes sunken with dark rings, mouth a tight line. Both black hands are held out to the flame, trembling. {SCAR}.",
    TUN + FIRE, "Firelight from below lights his face and hands; everything else is dark.",
    "60% darkness, 30% firelight orange, 10% rust-orange jacket",
    "His face fills the upper-left half and his hands the lower-right, so the hands can be cropped as their own insert. Exactly one person.")
new("A", 66, ["PIP", "TUNNEL"], "A close shot at ground level, 50mm lens, highest resolution.",
    f"On the brown clay wall of the tunnel grow small clusters of soft white bracket fungus; a little apart, one cluster of bright orange fungus. {PIP} stands on his hind legs, sniffing the white fungus.",
    "Place: the clay wall of the tunnel (TUNNEL).", "Warm firelight from frame-left.",
    "60% warm brown clay, 30% darkness, 10% white and orange fungus",
    "White fungus and Pip at the centre-left, the orange cluster alone at frame-right, each croppable. Exactly one Pip and no people.")
new("A", 78, ["HERO", "TUNNEL"], "An extreme close-up insert from slightly above, 50mm lens.",
    f"{HANDS}. With a flat stick, his hands push a heap of glowing red coals to the back of the small fire and cover them with a thick layer of grey ash.",
    TUN + FIRE, "The coals and fire light the hands from below; the rest is dark.",
    "60% darkness, 30% red-orange coals, 10% grey ash", "The coals and the ash heap fill the centre. Exactly two hands.")
new("A", 80, ["HERO", "PIP", "TUNNEL"], "A close shot from above, 50mm lens.",
    f"He lies on his back on the tunnel floor, {HERO}, his eyes open, staring at the clay ceiling, sad and awake. {SLEEVES}. Pip sleeps curled up against the side of his neck, inside the collar of his jacket.",
    TUN, "A faint orange glow of buried coals from down the tunnel touches his face and Pip; the rest is soft darkness.",
    "60% soft darkness, 30% faint ember glow, 10% rust-orange jacket", "His head and Pip at the centre. Exactly one person and one Pip.")
new("A", 86, ["HERO", "PIP", "TUNNEL", "WALL"], "A medium shot at eye level, 35mm lens, highest resolution.",
    f"He stands at the clay wall of the tunnel, {HERO}, writing with a black stick of charcoal in his right hand: three short columns of rough charcoal marks run down the wall, plain strokes with no readable letters. Old tally marks scratched into the clay, like in WALL, cover another part of the wall. {SCAR}. His eyes are wet, but his mouth is set firm. Pip sits on the floor below, looking up at him.",
    TUN + FIRE, "The small fire at frame-left throws his shadow large across the wall.",
    "60% warm brown clay, 30% darkness, 10% rust-orange jacket",
    "His face in the left third, the charcoal marks at the centre-right, Pip at the bottom, the fire at the left edge, each croppable. Exactly one person and one Pip.")
new("A", 93, ["BONE", "TUNNEL"], "A medium close shot at eye level, 50mm lens, highest resolution.",
    f"{BONE[0].upper() + BONE[1:]} leans upright against the clay wall of the tunnel near the small fire, its broad flat blade facing the camera, smooth and blank. One simple solid black stick-figure hand rests on its rounded top end, coming in from frame-right.",
    TUN + FIRE, "Warm firelight from frame-left grazes the bone and shows its texture.",
    "60% warm brown clay, 30% darkness, 10% pale bone",
    "The flat blade fills the centre, large, flat and evenly lit, so lettering can be added later. Exactly one bone and one hand.")
new("A", 95, ["HERO", "BONE", "TUNNEL"], "A medium close-up from a slightly high angle, 50mm lens, highest resolution.",
    f"He sits cross-legged by the small fire, {HERO}, with {BONE} across his knees, the flat blade toward the camera. With a sharp grey stone in his right hand he carves deep grooves into the blade: plain short straight strokes, not readable letters. {SCAR}; the scar is clearly visible. His fingertips have dark red smears of blood.",
    TUN + FIRE, "Warm firelight from frame-left on his hands, the blade and his face.",
    "60% warm darkness, 30% firelight orange, 10% pale bone",
    "His hands, the blade and his face are each large and sharp enough to crop on their own. Exactly one person and one bone.")

# ======================= B · the night the fire died =======================
new("B", 129, ["HERO", "TUNNEL"], "A medium-wide shot at floor level, 35mm lens, highest resolution.",
    f"He pushes himself up on one elbow on the tunnel floor, {HERO}, coughing hard with one hand over his mouth, his eyes squeezed and watering. {SLEEVES}. A low layer of thick grey smoke rolls along the ceiling. The fire at the stone door is a dark wet heap giving off thin white steam; the gap in the stone door is sealed with ice and packed snow.",
    TUN, "Almost dark: only a dim cold blue light seeps through the ice in the gap.",
    "60% blue-black darkness, 30% grey smoke, 10% rust-orange jacket",
    "His face at frame-left, the iced gap at frame-right, both croppable; his breath shows as a little vapour. Exactly one person.")
new("B", 130, ["TUNNEL"], "An extreme close-up insert at the stone door, 50mm lens.",
    "Water drips from melting snow in the gap of the stone door straight down onto the small fire, which hisses and steams; the top of the gap is glazed with clear ice and short icicles.",
    TUN, "The dying orange glow of the fire below meets a cold blue light through the ice above.",
    "60% cold blue-grey, 30% dying orange, 10% white steam", "The gap and the drip at the centre. No people.")
new("B", 133, ["HERO", "TUNNEL"], "A close shot, 35mm lens.",
    f"His black right fist punches through the thin sheet of ice sealing the gap of the stone door; ice shards fly, cold grey daylight and fresh air stream in, and grey smoke curls out through the gap. {SCAR}.",
    TUN, "A bright cold beam through the broken ice; the tunnel stays dark and smoky.",
    "60% dark smoke, 30% cold grey-white light, 10% rust-orange cuff", "The fist and the broken ice at the centre. Exactly one person.")
new("B", 135, ["HERO", "TUNNEL"], "A medium shot at eye level, 35mm lens.",
    f"He kneels by the dead, wet fire, {HERO}, working a bow drill: a curved stick with a cord, spinning a straight spindle into a flat piece of wood held down under his boot. No smoke at all. His black palms show pale raw blister marks; his face is exhausted and frustrated. {SLEEVES}.",
    TUN, "Dim cold light from the gap of the stone door at frame-right.",
    "60% cold dark brown, 30% grey light, 10% rust-orange jacket", "Exactly one person, one bow and one spindle.")
new("B", 137, ["HERO", "TUNNEL"], "An extreme close-up at floor level, 85mm lens, highest resolution.",
    "A stick digs into a grey heap of ash at the back of the dead fire, among wet black charcoal; at the very bottom, one tiny glowing red coal, like a small red eye. He kneels bent low over the ash, his face very close at frame-left, low to the floor, lips pursed, about to blow. Both legs are folded under him and hidden behind his body; only his two thin black arms are visible: his right hand holds the stick, his left hand holds a pinch of pale dry fern fluff beside the coal.",
    TUN, "Nearly black: the tiny red coal is the only warm light, faintly touching his lips.",
    "70% black, 20% grey ash, 10% glowing red", "The coal at the centre-right, his lips at frame-left, both croppable. Exactly one person.")
edit("B", 139, "image p2-137 (made above)",
     "a small bright flame rises from the fern fluff on the coal, and its warm orange light now lights his whole face; his eyes are open wide with relief",
     "his face, pose and hands, the ash heap, the stick, " + KEEP.replace("the light direction, colour and shadows, ", ""))
new("B", 140, ["HERO", "PIP", "TUNNEL"], "A close shot at floor level, 50mm lens.",
    f"He sleeps on his side right next to the stone door, {HERO}, eyes closed as two simple curved lines, his head just below the hand-wide gap. {SLEEVES}. Pip is curled up asleep against his neck inside the jacket collar. A little frost sparkles on the stones.",
    TUN + FIRE.replace("A small fire of twigs burns", "A very small low fire glows"), "The low fire lights his face warm orange; a thin cold blue line of light shows in the gap.",
    "60% darkness, 30% warm glow, 10% cold blue", "His head, Pip and the gap at the centre. Exactly one person and one Pip.")
new("B", 142, ["TUNNEL"], "An insert from slightly above, 50mm lens.",
    "On a flat grey stone beside the small fire, rows of dried, shrivelled brown grubs lie side by side, drying the way fish are dried.",
    TUN + FIRE, "Warm firelight from frame-left.",
    "60% warm darkness, 30% grey stone, 10% dried grubs", "The stone fills the centre. No people.")
new("B", 143, ["HERO", "TUNNEL"], "An extreme close-up insert, 50mm lens.",
    f"{HANDS}. He has cut his one clear plastic bottle in two: the top half, turned upside down as a funnel, is packed with layers of pale sand and crushed black charcoal and held over the bottom half. Grey snowmelt is poured in at the top, and clear drops fall from the neck into the bottom half. {SCAR}.",
    TUN + FIRE, "Firelight from the side shines through the plastic and the water drops.",
    "60% warm darkness, 30% clear plastic and water, 10% black charcoal", "The bottle filter at the centre. Exactly one bottle cut in two.")
new("B", 153, ["HERO", "TUNNEL"], "A wide shot from deep inside the tunnel, 24mm lens, highest resolution.",
    f"Far down the tunnel he sits alone by the small fire at the stone door, {HERO}, hugging his knees, small in the frame. There is an empty spot beside him where Pip used to sit. No Pip anywhere.",
    TUN + FIRE, "The small fire is the only light; the long tunnel around him falls into darkness.",
    "70% darkness, 20% firelight, 10% rust-orange jacket",
    "He is small at the centre; the tunnel walls frame him. Keep his face readable for a crop. Exactly one person and no animals.")

# ======================= C · outside: the first weeks, the sand pit, the forest =======================
new("C", 16, ["RIVER", "DUCKBILL"], "A wide shot at eye level, 35mm lens, highest resolution.",
    f"At the edge of the grey river stands {DUCK}, chewing on a burnt black branch.",
    EARLY, "Dim, smoky grey morning light; low mist over the water.",
    "60% ash grey, 30% grey-brown dinosaur, 10% black trees",
    "The dinosaur in side view fills the right two thirds, its head in the upper right; the river and mist at frame-left. Exactly one dinosaur and no people.")
edit("C", 23, "image p2-016 (made above)",
     "the duck-bill now lies collapsed on its side in the grey mud at the river's edge, still, eyes closed; the burnt branch lies beside its beak; the mist is lower and thicker",
     "the river, the bank, the burnt trees, the camera angle, framing and lens, the colour grade and grain")
new("C", 18, ["HERO", "BANDAGE", "RIVER"], "An extreme close-up insert at ground level, 50mm lens.",
    f"{HANDS}. {BANDAGE}. One hand pulls a single small bright green fern out of a wet hollow of dark mud, among grey ash and burnt twigs. The fern is the only green colour in the whole frame.",
    EARLY, STORM, "60% ash grey, 30% dark mud, 10% bright green fern", "The fern at the centre. Exactly one fern.")
new("C", 20, ["HERO", "BANDAGE", "RIVER", "DUCKBILL"], "A side-profile medium-wide shot at eye level, 35mm lens, highest resolution.",
    f"He stands at frame-left, {HERO}, holding the small green fern out at arm's length toward the huge drooping head of {DUCK}, which stands at frame-right with its beak almost touching the fern and its eye half closed, too weak to lift its head. {BANDAGE}.",
    EARLY + " Same place as image p2-016.", "Dim smoky grey light from frame-left.",
    "60% ash grey, 30% grey-brown dinosaur, 10% rust-orange jacket and green fern",
    "His face and the dinosaur's eye are each large enough to crop; he looks tiny next to the head. Exactly one person and one dinosaur.")
new("C", 55, ["HERO", "RIVER"], "A medium shot at eye level, 35mm lens.",
    f"He kneels on a strip of grey sand at the river's edge, {HERO}, digging a small pit with his black hands; grey water seeps into the bottom of the pit. {SLEEVES}.",
    RIV, STORM, "60% ash grey, 30% grey water, 10% rust-orange jacket", "He and the pit at the centre. Exactly one person.")
edit("C", 141, "image p2-055 (made above)",
     "he is gone; the water in the small sand pit is frozen solid into a disc of cloudy white ice, with frost on the sand around it and a thin layer of new snow",
     "the pit, the sand, the river, " + KEEP)
new("C", 58, ["PIP", "ROOTS"], "A close shot at ground level, 85mm lens, highest resolution.",
    f"Under the arch of huge roots like those in ROOTS, but now burnt black and dusted with grey ash, a small hollow holds a little pile of seeds and tiny nuts. {PIP} sits beside it, holding one seed in his paws and nibbling it.",
    "The roots are burnt black, the moss is gone and grey ash covers the ground.", "Dim cold grey light from frame-right.",
    "60% black roots, 30% grey ash, 10% golden fur and seeds", "Pip and the seed pile at the centre, croppable. Exactly one Pip and no people.")
new("C", 60, ["HERO"], "An extreme close-up insert from above, 50mm lens.",
    f"His open black stick-figure right palm, held flat, with only six tiny seeds in it: a handful for a mouse, nothing for a person. {SCAR}.",
    "Behind, grey ash on the ground, out of focus.", STORM, "60% blurred grey, 30% black hand, 10% seeds", "The palm at the centre. Exactly one hand.")
new("C", 61, ["HERO", "PIP", "FOREST"], "A wide shot at ground level, 35mm lens.",
    f"He crawls on his hands and knees across grey ash, {HERO}, following {PIP}, who runs ahead at frame-right toward a fallen log. His face is hungry and determined. {SLEEVES}.",
    FOREST, STORM, "60% ash grey, 30% black trunks, 10% rust-orange jacket", "Exactly one person and one Pip.")
new("C", 62, ["HERO", "PIP", "FOREST"], "A close shot at ground level, 50mm lens, highest resolution.",
    f"A big rotten fallen log lies on grey ash, its bark peeled. {PIP} digs into the soft rotten wood and holds a fat white grub in his mouth. At frame-left, {HANDS.lower()}, pulling back a slab of rotten wood that reveals more fat white grubs and a few black beetles.",
    FOREST, STORM, "60% grey ash and dark wood, 30% black hands, 10% white grubs",
    "Pip with the grub at frame-right and the hands with the grubs at frame-left, each croppable; the dead forest is visible behind. Exactly one Pip and two hands.")

# ======================= D · the river at dawn =======================
new("D", 75, ["HERO", "PIP", "RIVER"], "A wide shot at eye level, 35mm lens, highest resolution.",
    f"Right next to the tunnel entrance lie three wet, rotting logs in a row, covered with dead grey leaves. He kneels beside one he has just rolled over, {HERO}; under it, many fat white grubs. {PIP} sits on top of another log. {SLEEVES}.",
    RIV + DOOR_OUT, STORM, "60% ash grey, 30% dark wet wood, 10% white grubs and rust-orange jacket",
    "The logs and the grubs fill the lower half large enough to crop. Exactly one person and one Pip.")
new("D", 103, ["RIVER"], "A wide shot at eye level, 24mm lens, highest resolution.",
    "A calm, slow bend of the grey river near the clay bank; thin white ice along the edges; the mud at the water's edge soft and dark; a few faint circular ripples spread in the middle of the pool.",
    RIV, "Cold blue first light of dawn; low mist on the water.",
    "60% cold blue-grey water, 30% black trees, 10% white ice", "The pool fills the centre. No animals and no people visible.")
new("D", 105, ["CROC", "RIVER"], "A medium-wide shot at water level, 50mm lens.",
    f"Half under the water near the bank lies {CROC}, completely still; white frost covers the ridges of its back, and thin ice surrounds it.",
    RIV, "Cold blue dawn light, mist.", "60% cold blue-grey, 30% dark olive-grey crocodile, 10% white frost", "Exactly one crocodile.")
new("D", 107, ["CHAMP", "CROC", "RIVER"], "A medium-wide shot at water level, 50mm lens.",
    f"{CHAMP[0].upper() + CHAMP[1:]} rests on thin ice at the water's edge. At the left edge of the frame, the dark armoured back of the crocodile lies still in the water, partly out of frame.",
    RIV, "Cold blue dawn light, mist.", "60% cold blue-grey, 30% olive-brown reptile, 10% white ice",
    "The champsosaur fills the centre-right in side view so its thin snout and wide skull read clearly. One champsosaur and one partly visible crocodile.")
new("D", 109, ["HERO", "PIP", "BONE", "RIVER"], "A medium shot at eye level, 35mm lens.",
    f"He kneels outside the tunnel entrance at first light, {HERO}, {BONE} tied diagonally across his back with a cord, the blade above his shoulder. Pip's head peeks out of his jacket pocket. {SLEEVES}. His face is scared but set.",
    RIV + DOOR_OUT, "Cold blue dawn light; ash-snow drifting.", "60% cold blue-grey, 30% black trees, 10% rust-orange jacket and pale bone",
    "Exactly one person, one bone and one Pip.")
new("D", 110, ["HERO", "BONE", "RIVER"], "A medium-wide shot from below, 35mm lens.",
    f"He climbs down the low snowy clay bank backwards on his hands and knees, carefully and quietly, {HERO}, the bone tied across his back. Below him, the icy edge of the grey river. {SLEEVES}.",
    RIV, "Cold blue dawn light.", "60% cold blue-grey, 30% brown clay, 10% rust-orange jacket", "Exactly one person and one bone.")
new("D", 111, ["HERO", "PIP", "RIVER"], "A low close shot at the water's edge, 35mm lens, highest resolution.",
    f"He kneels in the soft dark clay at the edge of the icy water, {HERO}, his right arm pushed down into the clay up to the elbow; the bone is no longer visible. {SCAR}. His tense face looks toward the water. Behind him on the bank at frame-left, {PIP} stands up, alert. In the grey water at frame-right, a dark log-like shape drifts just under the surface toward his arm.",
    RIV, "Cold blue dawn light, mist on the water.", "60% cold blue-grey, 30% dark clay, 10% rust-orange jacket",
    "His face, Pip and the dark shape under the water are each large enough to crop. Exactly one person and one Pip.")
new("D", 115, ["HERO", "CROC", "RIVER"], "A medium-wide action shot at ground level, 35mm lens.",
    f"He is thrown backwards onto the clay bank, landing on his elbows, {HERO}, his eyes now big round white eyes with small black pupils in fear. At frame-right, {CROC} has lunged out of the water, and its long jaws snap shut in the mud exactly where his hand was, mud splashing. {SCAR}.",
    RIV, "Cold blue dawn light.", "60% cold blue-grey, 30% dark crocodile and mud, 10% rust-orange jacket",
    "The jaws in the mud at frame-right are large enough to crop on their own. Exactly one person and one crocodile.")
new("D", 117, ["HERO", "PIP", "RIVER"], "A medium-wide shot from behind and to the side, 35mm lens.",
    f"He scrambles up the snowy clay bank toward the stone door, {HERO}, mud on his arms and boots; Pip's head pokes out of his jacket pocket. He carries no bone. {SLEEVES}.",
    RIV + DOOR_OUT, "Cold blue dawn light.", "60% cold blue-grey, 30% brown mud, 10% rust-orange jacket", "Exactly one person and one Pip.")
new("D", 118, ["HERO", "PIP", "TUNNEL"], "A medium shot at eye level inside the tunnel, 35mm lens.",
    f"He sits on the floor with his back against the closed stone slab of the door, {HERO}, knees pulled up, shaking, his eyes wide; his muddy black hands rest on his knees, starting to clench into fists. Pip sits in his lap. He carries no bone. {SLEEVES}. No fire.",
    TUN, "Only a thin stripe of cold blue dawn light comes through the hand-wide gap beside him.",
    "60% blue-brown darkness, 30% cold blue stripe, 10% rust-orange jacket", "His face is croppable. Exactly one person and one Pip.")

new("D", "146b", ["HERO", "PIP", "TUNNEL"], "A medium close-up at eye level, 50mm lens, highest resolution.",
    f"He sits cross-legged by the small fire, {HERO}, sharpening the end of a long, straight, dry branch into a point with the sharp grey stone in his right hand; pale wood shavings fall onto the clay floor. {SCAR}. His face is calm, hard and determined, no longer scared. {PIP} sits beside his knee, watching the shavings.",
    TUN + FIRE, "Warm firelight from the side; the new wooden point catches the light.",
    "60% warm darkness, 30% firelight orange, 10% pale fresh wood",
    "His face, his hands with the stone and the sharpened point are each croppable; the long branch runs diagonally across the frame. Exactly one person, one branch and one Pip.")

# ======================= E · home, now =======================
new("E", 28, ["MOM"], "A medium-wide shot at eye level, 35mm lens, highest resolution.",
    f"In her bedroom at night, {MOM} sits on the edge of her bed, looking at a framed photograph standing on her nightstand.",
    "A modest bedroom with a wooden bed, a nightstand with a small lamp and the framed photo, a curtained window.",
    "Only the small warm lamp is on; the rest of the room is deep blue night.", "60% deep blue night, 30% warm lamplight, 10% mustard cardigan",
    "The framed photo is lit and sharp at the centre-right, large enough to crop. Exactly one person.")
new("E", 29, ["DAD", "MUSEUM"], "An extreme close-up insert, 50mm lens.",
    f"A framed photograph stands on a wooden nightstand beside a lamp. The photo shows a small five-year-old stick-figure boy with a round white head, messy dark-brown hair and a tiny rust-orange hoodie, riding on the shoulders of {DAD}; both are laughing in front of the mounted T. rex skeleton of the museum hall in MUSEUM.",
    "The nightstand is in a dark bedroom.", "Warm lamplight from frame-left; the photo has slightly faded colours.",
    "60% warm wood and shadow, 30% faded photo colours, 10% rust-orange", "The photo fills most of the frame. Exactly two people in the photo.")
new("E", 30, ["DAD", "DIG"], "An extreme close-up of an old photograph, 50mm lens.",
    f"An old faded sepia photograph with a white border and worn corners: the father (DAD) about ten years younger, dusty and grinning, kneels in a dig pit in the badlands of DIG with one hand on the partly exposed huge fossil skull of a Tyrannosaurus rex in the rock. In the lower-left foreground of the photo his dusty black hands hold a small dark fossil tooth up toward the camera.",
    "The photo lies on a dark wooden table.", "Soft even light.", "80% sepia tones, 20% dark wood", "Exactly one person in the photo; the hands with the tooth are croppable.")
edit("E", 32, "the attached image BEDROOM",
     "the young man is gone: the bed is empty and neatly made; the phone and the backpack are gone too; the lamp is still on",
     "the room, the posters, the lamp, the bed and the furniture and their positions, the camera angle, framing and lens, the night light, the colour grade and grain")
new("E", 39, ["MOM"], "A medium shot at eye level, 35mm lens, highest resolution.",
    f"In a narrow upstairs hallway in the early morning, {MOM} stands at a closed white bedroom door, knocking with one hand, the other on the door handle; her face is worried.",
    "A plain hallway with a wooden floor and family photos with blank frames on the wall.", "Pale early-morning light from a small window at the end of the hallway.",
    "60% pale cool morning grey, 30% white door, 10% mustard cardigan", "The door and the handle are croppable. Exactly one person.")
edit("E", 40, "image p2-039 (made above)",
     "she is gone; the bedroom door now hangs half open, broken at the lock, the wooden door frame splintered and cracked around the latch",
     "the hallway, the door, " + KEEP)
edit("E", 41, "the attached image BEDROOM",
     "it is morning: the young man is gone, the bed is empty with the blanket thrown back, the lamp is off, and pale morning daylight comes in through the shut window",
     "the room, the posters, the bed and the furniture and their positions, the camera angle, framing and lens, the colour grade and grain")
new("E", 44, ["MOM", "BEDROOM"], "A medium-wide shot from inside the room, 35mm lens.",
    f"{MOM} stands in the doorway of her son's empty bedroom in daylight, one hand on the door frame, looking at the empty bed.",
    ROOM + " A phone charger is plugged into the wall by the desk, its cable trailing over the desk with no phone on it.",
    "Soft grey daylight from the window.", "60% dark blue walls, 30% grey daylight, 10% mustard cardigan", "Exactly one person.")
new("E", 45, ["BEDROOM"], "An extreme close-up insert, 50mm lens.",
    "A white phone charger plugged into a wall socket on a dark blue wall next to a wooden desk; its cable trails across the desk and ends with no phone. A thin layer of dust on the desk.",
    "The bedroom from BEDROOM, out of focus behind.", "Soft grey daylight from the side.", "60% dark blue wall, 30% wood, 10% white cable", "Exactly one charger and one cable.")
edit("E", 81, "the attached image KITCHEN",
     "she is no longer cooking: the stove is off and there is no steam; she stands alone at the counter holding a mug in both hands, looking down, sad and tired; the morning light is greyer",
     "her face, hair, cardigan and stick-figure anatomy, the kitchen and every object and its position, the camera angle, framing and lens, the colour grade and grain")

# ======================= F · museum and the dig =======================
new("F", 46, ["FRIEND1", "FRIEND2"], "A medium shot at eye level, 35mm lens.",
    f"In a school corridor with grey lockers in the morning, {FRA} and {FRB} stand with their heads together over one phone, worried.",
    "Other students are only blurred shapes far away.", "Flat fluorescent light with grey daylight from windows.",
    "60% grey lockers, 30% clothing colours, 10% copper-red hair", "Exactly two people in focus. The phone screen is blank.")
new("F", 49, ["FRIEND1", "FRIEND2", "MUSEUM"], "A wide shot at eye level, 35mm lens, highest resolution.",
    f"{FRA[0].upper() + FRA[1:]} and {FRB} stand small in front of the giant skeleton in the empty hall, seen in three-quarter view from the front, looking up at it, unsmiling.",
    MUSEUM, "Soft daylight from the skylights; long shadows of the ribs on the floor.",
    "60% warm grey stone, 30% ivory bone, 10% copper-red hair", "Their faces are large enough to crop. Exactly two people and one skeleton.")
new("F", 121, ["MOM", "MUSEUM"], "A wide shot at eye level, 35mm lens, highest resolution.",
    f"{MOM[0].upper() + MOM[1:]} stands alone, small, in front of the giant skeleton, seen in three-quarter view from the front, looking up at it, her eyes wet.",
    MUSEUM, "Soft afternoon light from the skylights.", "60% warm grey stone, 30% ivory bone, 10% mustard cardigan",
    "Her face is large enough to crop. Exactly one person and one skeleton.")
new("F", 122, ["MOM", "OLDW", "MUSEUM"], "A medium-wide shot at eye level, 35mm lens, highest resolution.",
    f"{OLDW[0].upper() + OLDW[1:]} stops next to {MOM}; both look up at the skeleton's skull. The old woman is at frame-right with a small sad smile.",
    MUSEUM, "Soft afternoon light from the skylights.", "60% warm grey stone, 30% ivory bone, 10% mustard cardigan and olive hat",
    "Both faces are large enough to crop on their own. Exactly two people and one skeleton.")
new("F", 125, ["MOM", "OLDW", "MUSEUM"], "A wide shot at eye level, 35mm lens.",
    f"{MOM[0].upper() + MOM[1:]} and {OLDW} sit side by side on a wooden bench in the empty hall, talking quietly; the skeleton stands behind them.",
    MUSEUM, "Warm low sunset light through the skylights; the hall is closing and empty.",
    "60% warm amber light, 30% grey stone, 10% mustard cardigan", "Exactly two people and one skeleton.")
new("F", 157, ["OLDW", "DIG"], "A medium shot at ground level, 50mm lens.",
    f"{OLDW[0].upper() + OLDW[1:]} kneels in the dig pit, brushing grey dust off the dark-brown fossil shoulder blade with a soft brush. She has frozen mid-brush, her mouth falling open, staring at the bone.",
    DIG, "Cold, bright autumn afternoon sun, low in the sky, with long shadows.",
    "60% grey clay, 30% tan and rust rock, 10% dark-brown fossil", "Her face, her hand with the brush and the bone are each croppable. Exactly one person and one bone.")
new("F", 159, ["DIG"], "An extreme close-up from above, 85mm lens.",
    "The flat blade of the dark-brown fossil shoulder blade from DIG, stone with fine cracks, half in grey clay; a soft brush at the edge of the frame. Across the flat blade run a few deep, straight, man-made grooves, half hidden under a thin layer of grey dust; they are plain straight strokes, not readable letters.",
    "Grey clay around the bone.", "Low cold afternoon sun from the side makes the grooves cast shadows.",
    "60% dark-brown fossil, 30% grey clay, 10% pale dust", "The blade fills the frame, flat and evenly lit, so lettering can be added later. Exactly one bone.")

# ======================= G · Pip doesn't come back =======================
edit("G", 147, "the attached image RIVER",
     "it is night: dark blue night light, heavier falling snow, and a faint orange glow of a small fire leaking around the edge of the stone slab of the tunnel entrance",
     "the river, the ice, the trees, the roots, the stone entrance, the camera angle, framing and lens, the colour grade and grain")
new("G", 149, ["PIP", "MATE", "RIVER"], "A low close shot at ground level, 85mm lens, highest resolution.",
    f"In the snow at the foot of the stone slab of the tunnel entrance, {PIP} and {MATE} sit side by side, close together, looking toward the camera. Pip is clearly bigger and stockier, with golden-brown fur; she is smaller, slimmer and pale ash-grey, so the two are easy to tell apart.",
    RIV + DOOR_OUT, "Pale grey morning light; a few ash-snow flakes.",
    "60% grey snow and stone, 30% black roots, 10% golden fur", "Both animals are sharp and each face is croppable. Exactly two animals and no people.")

# ---------- write batch files ----------
rows = {}
for line in open(SHOT, encoding="utf-8"):
    m = re.match(r"- \*\*#(\d+[a-z]?)\*\* · ([\d:.]+) · `([^`]+)`.*?— (.*)", line)
    if m: rows[m.group(1)] = m.group(3)
need = {n for n, meth in rows.items() if meth.startswith(("NEW", "EDIT"))}
have = {str(n) for v in B.values() for n, _ in v}
assert need == have, (sorted(need - have), sorted(have - need))

TITLE = {"A": "تونل و آتش (روز ۴۰ تا ۵۵)", "B": "شبی که آتش مرد", "C": "بیرون: هفته‌های اول، چاله‌ی شنی، جنگل مرده",
         "D": "رود در سپیده‌دم", "E": "خونه، امروز", "F": "موزه و محل حفاری", "G": "پیپ برنمی‌گرده"}
allfiles = []
for i, k in enumerate("ABCDEFG", 1):
    frames = B[k]
    used = []
    for _, t in frames:
        for r in REFS:
            if re.search(r"\b" + r + r"\b", t) and r not in used: used.append(r)
    names = ", ".join(f"p2-{lab(n)}" for n, _ in frames)
    head = (f"You are making {len(frames)} still frames for a dark animated survival story, one image per frame, in the order below.\n\n"
            "ATTACHED REFERENCES (match them exactly):\n" + "\n".join(f"- {r} = {REFS[r][0]}" for r in used) + "\n\n"
            + ("CAST AND PLACES:\n" + "\n".join(f"- {r}: {LONG[r]}" for r in used if r in LONG) + "\n\n" if any(r in LONG for r in used) else "")
            + "RULES FOR EVERY FRAME:\n"
            f"- {STYLE}\n- {ANAT}\n"
            "- Every character, animal, place and object must look exactly like its reference. Do not invent new characters.\n"
            "- The young man never wears a backpack. His headlamp is always switched off: its lens is dark and casts no light (the battery died weeks ago).\n"
            "- The tunnel door is always one single large smooth flat stone slab set in a frame of stacked flat stones, with a hand-wide vertical gap; never a wooden door, never a wall of blocks.\n"
            "- The tunnel is low and narrow: inside it he can only sit, kneel, lie or crawl, never stand; when he sits, the clay ceiling is just above his beanie.\n"
            "- His arms and hands are always thin solid black, never white or skin-coloured, even in close-ups.\n"
            "- Both of his jacket sleeves are torn off, ragged, at mid-forearm (as in HERO). His forearms and hands are always plain solid black: never draw scars or marks on them. No bandage unless a frame says so.\n"
            "- Wide 16:9, highest quality. No lettering, numbers, captions, logos or watermarks in any image.\n"
            f"- Name each image exactly with its frame code: {names}.\n"
            "- An EDIT frame changes only what it says, starting from the image it names.\n")
    body = "\n\n".join(t for _, t in frames)
    att = " · ".join(f"`{REFS[r][1]}` ({r})" for r in used)
    md = [f"# دسته‌ی {k} · {TITLE[k]} · {len(frames)} قاب\n",
          f"**قاب‌ها:** {names}  ",
          f"**پیوست (همه با هم):** {att}  ",
          "**Flow:** حالت **Agent** روشن، ۱۶:۹، بالاترین کیفیت. کل بلوک زیر را یک‌جا پیست کن.\n",
          "```", head + "\n" + body, "```", ""]
    fn = f"{i:02d}-batch-{k}.md"
    open(os.path.join(H, fn), "w", encoding="utf-8").write("\n".join(md))
    allfiles.append((fn, len(frames), len((head + body).split()), len(used)))
REDO = {"B": ["129", "135", "137", "139", "153"]}
for k, keep in REDO.items():
    frames = [(n, t) for n, t in B[k] if str(n) in keep]
    used = [r for r in REFS if any(re.search(r"\b" + r + r"\b", t) for _, t in frames)]
    names = ", ".join(f"p2-{lab(n)}" for n, _ in frames)
    head = (f"You are making {len(frames)} still frames for a dark animated survival story, one image per frame, in the order below.\n\n"
            "ATTACHED REFERENCES (match them exactly):\n" + "\n".join(f"- {r} = {REFS[r][0]}" for r in used) + "\n\n"
            + "CAST AND PLACES:\n" + "\n".join(f"- {r}: {LONG[r]}" for r in used if r in LONG) + "\n\n"
            + "RULES FOR EVERY FRAME:\n"
            f"- {STYLE}\n- {ANAT}\n"
            "- Copy the tunnel exactly from TUNNEL: its size, clay walls and its door.\n"
            "- The tunnel door is always one single large smooth flat stone slab set in a frame of stacked flat stones, with a hand-wide vertical gap; never a wooden door, never a wall of blocks.\n"
            "- The tunnel is low and narrow: inside it he can only sit, kneel, lie or crawl, never stand; when he sits, the clay ceiling is just above his beanie.\n"
            "- He never wears a backpack. His arms, legs and hands are always thin solid black and attached to his body correctly; never extra limbs.\n"
            "- No bandage. Wide 16:9, highest quality. No lettering, numbers, captions, logos or watermarks in any image.\n"
            f"- Name each image exactly with its frame code: {names}.\n"
            "- An EDIT frame changes only what it says, starting from the image it names.\n")
    body = "\n\n".join(t for _, t in frames)
    att = " · ".join(f"`{REFS[r][1]}` ({r})" for r in used)
    md = [f"# دسته‌ی {k} · دوباره‌سازی {len(frames)} قاب\n", f"**قاب‌ها:** {names}  ", f"**پیوست (همه با هم):** {att}  ",
          "**Flow:** حالت **Agent** روشن، ۱۶:۹، بالاترین کیفیت. کل بلوک زیر را یک‌جا پیست کن.\n", "```", head + "\n" + body, "```", ""]
    open(os.path.join(H, f"02b-batch-{k}-redo.md"), "w", encoding="utf-8").write("\n".join(md))
for a in allfiles: print(a)
print("total", sum(a[1] for a in allfiles))
