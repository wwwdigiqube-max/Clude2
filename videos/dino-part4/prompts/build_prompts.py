# Part 4 · Flow Agent batch prompts (≤10 frames per prompt). Run: python3 videos/dino-part4/prompts/build_prompts.py
# Built on the Part 3 builder. New for Part 4: every place is new (no tunnel / stone door / big tree), clean style refs (U4 family),
# dead dinosaurs are half-skeletal, arms always wrapped (HERO3), heels wrapped from day 94, present-day scenes in winter.
import os, re
H = os.path.dirname(os.path.abspath(__file__))
SHOT = os.path.join(H, "..", "shotlist", "shotlist.md")

STYLE = ("Dark gritty animated survival story style for teens and adults, detailed digital painting, clean black outlines on the characters, "
         "realistic painterly background with depth, muted desaturated colours, dramatic cinematic lighting.")
ANAT = ("Strict stick-figure anatomy for every person: the only white part is the round off-white head; the body under the clothes is a thin solid black "
        "stick figure; arms, hands, legs and bare feet are thin solid black, never white or skin-coloured; the face has only eyes, eyebrows and a simple mouth, no nose and no ears.")

REFS = {  # name: (what it looks like, file to attach)
 "HERO3":    ("the character sheet of the young man ready for the journey: dark crossed wraps on both forearms, a backpack with a turtle shell on top, a clay-sealed shell at the hip, a spear", "Q1-hero-journey"),
 "PIP":      ("the sheet of a tiny golden-brown mouse-like mammal", "R1-fandogh-sheet"),
 "MATE":     ("the snow-den image: the smaller ash-grey animal at his collar is Pip's mate", "U2-den-inside"),
 "DEN_IN":   ("the cutaway image of the small snow den under a rock shelf, with him asleep inside", "U2-den-inside"),
 "DEN_OUT":  ("the image of the snow den from outside: a rounded rock shelf on a clay bank, a deep snowdrift behind it, a low den mouth and a small fire", "U1-den-outside"),
 "ROAD":     ("the image of a long straight frozen river between burnt forests, like an empty road", "L1-road-east"),
 "NARROWS":  ("the image of the narrows: the river squeezed between high rock banks, the ice dark and see-through", "L2-narrows"),
 "HERD":     ("the image of a hollow between dead trees where a herd of duck-billed dinosaurs lies frozen under grey snow", "L3-herd-hollow"),
 "WIDE":     ("the image of a very wide frozen river with almost no banks, only ice and sky", "L4-wide-river"),
 "DUCK":     ("the image of a dead duck-billed dinosaur at the river's edge: front half frozen skin, back half bare bones in the ice", "U4-duckbill-ice"),
 "TRI":      ("the image of a dead Triceratops on top of a snowy riverbank: head and frill whole, back half bare ribs and bones", "U3-triceratops"),
 "BIRD":     ("the sheet of a small plain brown ground bird, standing and in flight", "U5-bird"),
 "SEA":      ("the image of the place where the frozen river reaches a grey, open, steaming sea with a dark sand beach", "U6-the-sea"),
 "CLIFF":    ("the image of a low winter cliff in the North Dakota badlands: a pale stripe through the rock, stone-turned tree roots above it, a small white post and a string square", "U7-badlands-cliff"),
 "FIELDMAP": ("the image of an old pencil field map on a table under a green lamp, a black finger on a small cross", "U9-field-map"),
 "SHELLS":   ("the sheet with the turtle shells: on the right, the shell sealed with grey clay and glowing at the edge is the fire shell; the middle one is the water bowl", "Q3-turtle-sheet"),
 "FUNGUS":   ("the sheet of a hoof-shaped tinder fungus and a smouldering slice of it", "Q6-tinder-fungus"),
 "MAP":      ("the image of the painted map page in his book: a winding river in the west running to a long blue inland sea", "Q7-book-map"),
 "BACKROOM": ("the image of the museum back room with a work table and a green lamp", "Q8-museum-backroom"),
 "MUSEUM":   ("the image of the museum hall with the T. rex skeleton", "A1-museum"),
 "MOM":      ("the character sheet of a woman in a mustard-yellow cardigan", "A3-mom"),
 "OLDW":     ("the character sheet of an old woman with a grey braid and a wide-brimmed field hat", "P3-old-woman"),
 "FRIEND_A": ("the character sheet of a teenage boy with curly black hair and glasses", "A4-friend-a"),
 "FRIEND_B": ("the character sheet of a teenage girl with a red ponytail", "A5-friend-b"),
}
LONG = {
 "HERO3": "the young man from HERO3: tired small black oval eyes, messy dark-brown hair under a dark charcoal beanie with a small headlamp whose lens is dark, faded rust-orange hooded jacket with both sleeves torn off ragged at mid-forearm, tufts of pale fern fluff at the collar, dark grey t-shirt with a torn bottom edge, thin black legs, worn brown boots. Both forearms are wrapped from wrist to elbow in dark charcoal cloth strips crossed diagonally like boxer's wraps, with small tufts of fern fluff at wrist and elbow; the two arms always look the same. His gear: a dark backpack with an empty turtle shell tied upside down on top (the water shell); the fire shell, a turtle shell closed with a lid of dried grey clay, hangs from a cord at his hip; a long wooden spear with a lashed grey stone tip",
 "PIP": "Pip: a tiny golden-brown mouse-sized early mammal with a cream belly, big shiny black eyes, pink nose, whiskers and a long thin pink tail",
 "MATE": "Pip's mate: smaller and slimmer than Pip, pale ash-grey fur, one white drop-shaped patch on her chest, white tail tip; never golden",
 "DEN_OUT": "the snow den: a big rounded shelf of grey rock juts out of a low clay bank a few steps from the frozen river; behind it the wind has piled the snow into a deep drift; a low round den mouth is dug into the drift right under the rock; the fire is always built OUTSIDE the den mouth, never inside",
 "MOM": "the mother from MOM: wavy shoulder-length dark-brown hair with silver strands, mustard-yellow cardigan over a navy top; tired, dark circles under her eyes",
 "OLDW": "the old woman from OLDW: small and wiry, long grey braid, sand-coloured field vest, olive shirt, wide-brimmed field hat outdoors (on the table indoors)",
 "FRIEND_A": "the boy from FRIEND_A: curly black hair, round glasses, navy hoodie",
 "FRIEND_B": "the girl from FRIEND_B: red ponytail, olive bomber jacket",
}
B = {}
def lab(n): return f"{int(n):03d}"
def new(batch, n, refs, shot, subject, place, *rest):
    light, comp = (rest if len(rest) == 2 else ("", rest[0] if rest else ""))
    t = f"FRAME p4-{lab(n)} · NEW · references: {', '.join(refs) if refs else 'none'}\n{shot} {subject}\n{place} {light}\n{comp}"
    B.setdefault(batch, []).append((n, re.sub(r"  +", " ", t)))
def edit(batch, n, src, change, keep):
    B.setdefault(batch, []).append((n, f"FRAME p4-{lab(n)} · EDIT of {src}\nChange only this: {change}\nKeep exactly the same: {keep}. Everything else is 100% identical."))
KEEP = "the place and every object and its position, the camera angle, framing and lens, the light and the colour grade"
GEAR = "Full gear as in HERO3: backpack with the water shell on top, the clay-lidded fire shell at his hip, the spear."
ROADDAY = "Place: the frozen river from ROAD. Light: flat grey impact-winter daylight, no sun, ash-snow on the ice."
WINTER = " Winter: everyone wears a warm coat or scarf over the clothes from their sheet, so the sheet colours (mustard cardigan, navy hoodie, olive jacket, sand vest) still show."

# ======================= A · day 88: the first night at the den, the first day on the road =======================
new("A", 1, ["DEN_OUT", "ROAD"], "A wide night shot from the middle of the frozen river, 24mm lens, highest resolution.",
    "The dark frozen river at midnight. On the low bank a few steps away, the rounded rock shelf with the snowdrift behind it (DEN_OUT); at the low den mouth, the last embers of a small fire glow weak orange, the only warm light in the whole frame.",
    "Place: DEN_OUT seen from the ice.", "Deep blue-grey night, no moon, faint ash-snow.", "No people visible. The den and the dark ice are both croppable.")
new("A", 2, ["ROAD"], "A low close shot at ice level, 35mm lens.",
    "A thin white crack races across the dark night ice of the river, from the foreground away into the darkness, splitting into fine branches.",
    "Place: the frozen river from ROAD, at night.", "Deep blue-grey night.", "The crack starts sharp in the foreground. No people.")
new("A", 3, ["DEN_IN", "HERO3", "PIP", "MATE"], "A cutaway cross-section of the den at night, eye level, 35mm lens, highest resolution.",
    "Inside the small snow den exactly like DEN_IN, the young man (HERO3) lies on his side on dead fern fronds, wide awake, eyes big round white circles with one black dot each (fear), listening. Pip (PIP) and his mate (MATE) are curled tight against his neck at the collar. The fire shell rests between his knees with a thin orange glow at the clay lid. His backpack lies beside him, his boots stand by his bare black feet.",
    "Place: DEN_IN.", "Night; a faint orange glow from the embers outside the den mouth.", "His face and the two animals at his neck are each large enough to crop. One person, two animals.")
new("A", 10, ["HERO3", "ROAD"], "An extreme wide shot from behind and slightly above, 24mm lens, highest resolution.",
    "A tiny figure (HERO3) walks away from the camera down the middle of the frozen river, which runs straight ahead into grey mist like an empty road; burnt black forest on both banks. " + GEAR,
    ROADDAY, "Grey morning light.", "He is small, in the centre; the white river leads into the mist. One person.")
new("A", 12, ["HERO3", "ROAD"], "A low close shot at ice level from the side, 50mm lens.",
    "Two worn brown boots walk step by step across grey ash-dusted river ice, one boot lifted mid-step; the bottom of the spear's shaft touches the ice beside them.",
    ROADDAY, "Only the boots and lower legs. One person.")
new("A", 13, ["HERO3", "SHELLS"], "An extreme close-up at chest height, 50mm lens, highest resolution.",
    "His two solid black hands, forearms in the dark crossed wraps, hold the fire shell (the clay-sealed shell from SHELLS) and lift its lid of dried grey clay; inside, a slice of brown tinder fungus glows bright orange; his lips at the top edge of the frame blow on it gently.",
    ROADDAY, "The orange glow lights his hands from below.", "The glowing fungus inside the shell is sharp and croppable on its own. Exactly two hands.")
new("A", 17, ["MAP", "HERO3"], "A top-down insert of the book page, 50mm lens, highest resolution.",
    "The painted map page from MAP, held open by his hands; one solid black thumb lies flat across the map from the winding river in the west to the long blue inland sea: the whole journey is one thumb wide. The edge of a dark forearm wrap shows at the frame edge.",
    "The map fills the frame.", "Dim grey daylight.", "The thumb on the map is croppable. No readable lettering.")
new("A", 21, ["ROAD"], "A wide shot at ice level, 24mm lens, highest resolution.",
    "Dusk on the frozen river: a hard wind drags long streams of ash-snow across the ice, the far end of the river already lost in darkness; in the foreground the low bank is bare grey clay and loose stones, with no snowdrift and no shelter.",
    "Place: the frozen river from ROAD.", "Fading cold blue dusk, darkness coming in from the east.", "The streaming snow and the bare bank are each croppable. No people.")
new("A", 24, ["HERO3", "ROAD"], "A medium shot at eye level, side view, 35mm lens.",
    "Walking on, he pulls half a grey fish out from under his jacket and bites into it, hungry; the fish is soft and pale, no blood. " + GEAR + " Pip and his mate are hidden in the jacket pockets.",
    ROADDAY, "Grey noon.", "One person.")
new("A", 60, ["ROAD"], "A very high top-down view at night, 24mm lens, highest resolution.",
    "From high above, the dark frozen river winds away for miles; long thin white crack lines run along it and across it, branching like lightning frozen into the ice.",
    "Place: the river from ROAD, at night.", "Dark blue night, the cracks the brightest thing.", "The crack lines are croppable close. No people.")

# ======================= B · day 88: the carcasses, the run, the rock shelf =======================
new("B", 25, ["HERO3", "DUCK"], "An extreme wide shot at ice level, 24mm lens, highest resolution.",
    "A tiny figure (HERO3) stands on the frozen river; ahead of him, something dark and huge lies across the ice: the dead duck-billed dinosaur from DUCK, its head and front legs on the bank, its back half bare bones locked in the ice. " + GEAR,
    "Place: the river at DUCK.", "Flat grey noon light.", "He is small, the carcass looms. One person.")
new("B", 28, ["HERO3", "PIP", "DUCK"], "A close shot of his face, three-quarter view, 85mm lens, highest resolution.",
    "He stares at the carcass, hungry and tempted, mouth slightly open; Pip (PIP) pokes his head out of the jacket pocket below. The carcass is a dark soft shape behind him.",
    "Place: the river at DUCK.", "Flat grey light.", "His face and Pip are each croppable; his head is turned enough that a crop can read as turning away. One person, one animal.")
new("B", 31, ["MATE", "PIP", "DUCK"], "A low extreme close-up on the carcass's neck, 85mm lens, highest resolution.",
    "Pip's mate (MATE), ash-grey with the white drop on her chest, digs into a deep fold of the frozen grey skin; packed inside the fold, hundreds of small black beetles frozen solid; Pip (PIP) right behind her, eating too.",
    "Place: the neck of DUCK.", "Flat grey light, frost on the skin.", "The beetles in the fold and the two animals are each croppable. Exactly two animals, no blood.")
new("B", 34, ["HERO3"], "An extreme close-up insert, 50mm lens.",
    "His two black hands, forearms in the dark crossed wraps, scoop small frozen black beetles into a small drawstring pouch of dark cloth.",
    "Place: the frozen skin of the carcass.", "Grey light.", "Exactly two hands and one pouch.")
new("B", 37, ["HERO3", "TRI"], "A medium-wide shot on top of the riverbank, 35mm lens, highest resolution.",
    "On top of the snowy bank he stands beside the huge frozen head of the Triceratops from TRI and lays one black hand on the horn above its dull, frosted eye; the horn is taller than he is. Behind, the back half of the animal is bare old ribs. " + GEAR,
    "Place: the bank from TRI.", "Late afternoon, the grey light starting to darken.", "His face next to the horn and his hand on the horn are each croppable. One person.")
new("B", 40, ["HERO3", "TRI"], "A medium-wide shot from the river, looking up, 35mm lens.",
    "He climbs down the snowy bank toward the river, worried, looking at the darkening sky; the Triceratops lies on the bank above him. " + GEAR,
    "Place: the bank from TRI.", "Dusk: the grey is turning dark.", "His worried face is croppable. One person.")
new("B", 43, ["HERO3", "ROAD"], "A medium action shot at ice level, 35mm lens.",
    "He runs along the frozen river, slipping, arms out for balance; the fire shell swings on its cord and knocks against his hip; wind throws snow at him. " + GEAR,
    "Place: the river from ROAD.", "Cold blue dusk, hard wind.", "One person, motion and urgency.")
edit("B", 44, "the attached image DEN_OUT",
     "there is NO den yet: the snowdrift behind the rock shelf is smooth and untouched, no den mouth, no air hole, no fire, no stone, no branches, no footprints. Dusk is a little darker",
     "the rock shelf, the bank, the river, the forest, the camera angle, framing and style")
new("B", 45, ["HERO3", "DEN_OUT"], "A medium shot from the side, 35mm lens, highest resolution.",
    "Kneeling at the side of the deep snowdrift right under the rock shelf (DEN_OUT), he digs into the snow with both black hands and the spear, throwing snow behind him; a dark half-dug hole. No fire yet. " + GEAR,
    "Place: DEN_OUT, before the den exists.", "Dusk.", "His face and the hole are croppable. One person.")
new("B", 46, ["HERO3", "DEN_OUT"], "A wide shot, 35mm lens.",
    "He drags a bundle of dead black branches down the bank from the burnt forest above toward the rock shelf and the fresh den mouth (DEN_OUT). " + GEAR,
    "Place: DEN_OUT.", "The last grey minutes of light.", "One person.")

# ======================= C · nights at the den =======================
new("C", 48, ["HERO3", "DEN_OUT", "SHELLS", "PIP", "MATE"], "A medium shot at ground level, 35mm lens, highest resolution.",
    "Kneeling just outside the den mouth (DEN_OUT), he has lifted the clay lid of the fire shell and blows gently on a pinch of pale fern fluff with glowing fungus in it, laid in a small nest of black twigs; a first small flame. His backpack lies beside him. Pip (PIP) and his mate (MATE) peek out of his jacket pockets toward his collar.",
    "Place: the mouth of DEN_OUT.", "Dark; the small flame lights his face.", "His face, the flame and the two animals are each croppable. One person, two animals.")
new("C", 53, ["SHELLS", "DEN_OUT"], "An extreme close-up insert, 50mm lens.",
    "Two pieces of fish cook side by side on a flat stone pushed into the coals of the small fire: a whole grey fish, still frosted and stiff as wood, and a half fish for tomorrow, its skin already browning; beside the fire stands the water shell (the open shell bowl from SHELLS) full of clear chunks of river ice starting to melt.",
    "Place: the fire outside DEN_OUT.", "Warm firelight against blue night snow.", "The fish and the water shell are each croppable. No people.")
new("C", 55, ["HERO3", "SHELLS"], "An extreme close-up insert, 50mm lens.",
    "His black hands, forearms in the dark crossed wraps, place one glowing red coal and a fresh slice of tinder fungus into the fire shell; its lid of dried grey clay rests on his knee, ready to close.",
    "Place: by the fire outside the den.", "Warm firelight.", "Exactly two hands.")
new("C", 56, ["DEN_IN", "HERO3"], "A cutaway cross-section of the den, 35mm lens.",
    "Inside the snow den (DEN_IN) he sits hunched, boots off and standing beside him, rubbing one bare solid-black foot hard with both hands, wincing; his backpack lies at the back of the den.",
    "Place: DEN_IN.", "Night; firelight from the small fire outside the den mouth.", "One person.")
new("C", 62, ["HERO3", "DEN_OUT"], "A wide shot at eye level, 35mm lens, highest resolution.",
    "Morning: he crawls out of the low den mouth under the rock shelf (DEN_OUT) and stands up, the fire is cold ash, the frozen river beside him. " + GEAR,
    "Place: DEN_OUT.", "Flat grey morning light.", "His face and the den are croppable. One person.")
new("C", 164, ["HERO3", "DEN_OUT"], "A medium close shot, 50mm lens, highest resolution.",
    "Another evening, another snow den like DEN_OUT: sitting by the small fire at the den mouth, he lifts his head into the wind, eyes narrowed, lips parted, sniffing. He is thinner now: hollow cheeks, cracked lips, frost on the beanie. His backpack lies beside him.",
    "Place: a den mouth like DEN_OUT.", "Dusk, warm firelight on one side of his face.", "His face, lips and eyes are each croppable. One person.")

# ======================= D · day 89: the narrows, the frozen herd, the first bird =======================
new("D", 88, ["HERO3", "NARROWS"], "A medium-wide shot at ice level, 35mm lens, highest resolution.",
    "At the edge where the white ice turns dark and see-through (NARROWS), he stands still and taps the black ice ahead with the BUTT END of his spear, held upside down. " + GEAR,
    "Place: NARROWS.", "Grey noon light between the high banks.", "His face and his boots on the ice edge are each croppable. One person.")
new("D", 89, ["NARROWS"], "An extreme close-up at ice level, 50mm lens.",
    "The wooden butt end of the spear rests on dark, see-through ice with fast water and bubbles moving underneath; a sharp white crack line shoots out from it, then a second one.",
    "Place: NARROWS.", "Grey light.", "No hands visible except the spear.")
new("D", 92, ["HERO3", "HERD"], "A medium-wide shot, 35mm lens.",
    "He climbs through a dead burnt forest over fallen black trunks, grey ash up to his knees, away from the river. " + GEAR,
    "Place: the dead forest near HERD.", "Cold grey light.", "One person.")
new("D", 95, ["HERO3", "HERD"], "An extreme wide shot, 24mm lens, highest resolution.",
    "A tiny figure (HERO3) walks silently between the long grey snow humps of the frozen herd (HERD); here a flat beak, there a frozen foot; where small animals have eaten, old ribs show like boat frames. " + GEAR,
    "Place: HERD.", "Cold grey light.", "He is small among the humps. One person.")
new("D", 96, ["BIRD", "HERD"], "A medium close shot, 85mm lens, highest resolution.",
    "On the frozen head of one dead duck-billed dinosaur in the herd (HERD), a small plain brown bird (BIRD) stands and pecks at a fold of the frozen hide.",
    "Place: HERD.", "Cold grey light.", "The bird pecking is croppable close. Exactly one bird. No people.")
new("D", 98, ["BIRD", "HERO3", "HERD"], "An over-the-shoulder shot from behind the bird, 50mm lens.",
    "The small brown bird (BIRD) in the foreground, sharp, turns its head toward him; a few steps beyond it he (HERO3) stands still and looks back at the bird, curious, a tiny beginning of a smile. " + GEAR,
    "Place: HERD.", "Cold grey light.", "His face is croppable. One person, one bird.")
new("D", 100, ["BIRD", "HERD"], "A wide shot, 35mm lens.",
    "The small brown bird (BIRD) flies away low over the dead grey forest toward a grey horizon, wings spread as in the flight panel of BIRD.",
    "Place: above HERD.", "Grey sky, a slightly lighter band at the horizon.", "Exactly one bird. No people.")

# ======================= E · day 91: the fire nearly dies · day 94: heels =======================
new("E", 104, ["HERO3", "ROAD"], "A medium shot from the front, 35mm lens, highest resolution.",
    "He walks bent forward into a hard east wind full of grey snow, eyes half shut, the fire shell hanging forgotten at his hip on its cord. " + GEAR,
    "Place: the river from ROAD.", "Grey blizzard light, snow streaking sideways.", "His face and the shell at his hip are each croppable. One person.")
new("E", 106, ["HERO3", "SHELLS"], "An extreme close-up insert, 50mm lens, highest resolution.",
    "His black hands, forearms in the dark crossed wraps, lift the grey clay lid off the fire shell: inside, only dull grey ash, no glow at all.",
    "Place: on the ice in the wind.", "Cold grey light, snow flecks.", "The dead grey ash is croppable on its own. Exactly two hands.")
new("E", 108, ["SHELLS"], "A macro close-up into the tipped shell, 100mm lens, highest resolution.",
    "At the very bottom of a heap of soft grey ash inside the shell, one tiny red glowing dot, smaller than a seed.",
    "Place: inside the fire shell.", "Dark grey, the red dot the only colour.", "The dot at the centre. No hands.")
new("E", 109, ["HERO3", "ROAD"], "A medium shot at ice level, 35mm lens, highest resolution.",
    "He kneels on the ice with his back to the blizzard, hunched over the open fire shell held close to his face, shielding it with his whole body, blowing very gently. His backpack is on his back.",
    "Place: the river from ROAD.", "Grey blizzard behind him, his body a dark shelter.", "His face and the shell are croppable close. One person.")
new("E", 110, ["HERO3"], "An extreme close-up insert, 50mm lens.",
    "Black fingers pull a tuft of pale beige fern fluff out from under the dark crossed wrap at his wrist.",
    "Place: on the ice.", "Grey light.", "One forearm and hand, the fluff sharp.")
edit("E", 114, "image p4-108 (made above)",
     "a small tuft of pale fern fluff now lies on the red dot, and one thin thread of grey smoke rises from it", KEEP)
edit("E", 116, "image p4-114 (made above)",
     "the fluff glows bright orange along one edge and a curl of tinder fungus beside it glows too; the inside of the shell is lit warm orange", KEEP)
new("E", 117, ["HERO3", "ROAD"], "A medium shot at eye level, 50mm lens, highest resolution.",
    "He sits in the snow on the ice, exhausted, holding the closed fire shell tight against his chest with both arms, a faint orange glow at the edge of the clay lid; snow settling on his beanie. Backpack on.",
    "Place: the river from ROAD.", "Grey light, the wind calmer.", "His face and the warm shell are each croppable. One person.")
new("E", 139, ["ROAD", "HERO3"], "A very high top-down view, 24mm lens, highest resolution.",
    "From high above, the frozen river bends back and forth like a snake through grey burnt land; on it, one tiny dark figure with a backpack.",
    "Place: the river from ROAD, from the sky.", "Flat grey daylight.", "The figure is tiny, a dot. Leave quiet space at the top for a caption added later.")
new("E", 140, ["HERO3", "ROAD"], "A medium shot at ice level, 50mm lens.",
    "He sits on the ice, one boot off beside him, and wraps his black heel with a strip torn from the bottom of his dark grey t-shirt; his backpack sits beside him. No blood, no wound visible.",
    ROADDAY, "One person.")

# ======================= F · days 97–101: the wide river =======================
new("F", 141, ["HERO3"], "A close-up of his face, 85mm lens, highest resolution.",
    "He is much thinner now: hollow cheeks, cracked lips, white frost on his eyebrows and on the beanie, tired eyes; the collar fluff is grey with snow.",
    "Place: the wide frozen river.", "Flat grey light.", "Exactly one person. Leave a little space on one side for a caption added later.")
new("F", 142, ["MATE", "HERO3"], "An extreme close-up, 100mm lens, highest resolution.",
    "In the rust-orange jacket pocket, Pip's mate (MATE) sleeps curled up, ash-grey with the white drop on her chest; her belly is noticeably round.",
    "Place: the jacket pocket.", "Soft grey light.", "Exactly one animal.")
new("F", 144, ["HERO3", "WIDE"], "An extreme wide shot, 24mm lens, highest resolution.",
    "A tiny figure (HERO3) walks across the endless flat ice of the very wide river (WIDE); nothing but ice and a huge grey sky. " + GEAR,
    "Place: WIDE.", "Light grey daylight.", "He is a small dark mark in the lower third. One person.")
new("F", 145, ["HERO3", "WIDE"], "A medium shot at ice level, 35mm lens, highest resolution.",
    "He sits on the ice with his backpack open in front of him, looking down into it, serious. The fire shell is at his hip.",
    "Place: WIDE.", "Grey noon.", "His face is croppable. One person.")
new("F", 146, [], "A top-down insert, 50mm lens, highest resolution.",
    "Laid out on the grey ice: one whole frozen grey fish and one half fish, a small handful of dried pale grubs, a few pieces of white fungus, and a small drawstring pouch of dark cloth.",
    "Place: on the ice.", "Flat grey light.", "Each item is croppable. No hands.")
new("F", 150, ["HERO3", "WIDE"], "A medium-wide shot, 35mm lens, highest resolution.",
    "He stands on the empty ice turned toward the west, looking back the way he came: only his own line of footprints across the white. " + GEAR,
    "Place: WIDE.", "Grey light.", "His face is croppable (doubt, then resolve). One person.")
new("F", 151, ["HERO3", "WIDE"], "A low close shot at ice level, 50mm lens.",
    "His two worn boots, toes pointing west, stand on ash-dusted ice; around them, footprints going both ways: the old line east and ten fresh steps back.",
    "Place: WIDE.", "Grey light.", "Only boots and lower legs. One person.")
new("F", 158, ["BIRD", "HERO3", "WIDE"], "A low-angle shot from behind him, looking up, 24mm lens, highest resolution.",
    "A flock of small brown birds (BIRD) flies low over his head, all in the same direction, toward the east horizon; he looks up at them. " + GEAR,
    "Place: WIDE.", "Grey sky.", "The flock and the horizon are croppable. One person.")

# ======================= G · day 104: the sea =======================
new("G", 169, ["HERO3", "SEA"], "A wide shot at ice level, 35mm lens, highest resolution.",
    "He walks forward testing each step with the spear: under him the grey ice thins into grey slush, and just ahead there is open dark water moving, with thin steam rising into the cold air. " + GEAR,
    "Place: where the river meets SEA.", "Morning; the grey is lighter, like paper held up to a lamp.", "The sky and the steaming water are croppable. One person.")
new("G", 170, ["HERO3", "SEA"], "A medium-wide shot from behind, 35mm lens.",
    "He climbs the last low bank of dark sand dunes, bent forward, using the spear as a stick. " + GEAR,
    "Place: the dunes of SEA.", "Lighter grey morning.", "One person.")
new("G", 173, ["HERO3", "SEA"], "An extreme wide shot from behind, 24mm lens, highest resolution.",
    "A tiny figure stands on top of the dune, facing a wide flat grey sea that is NOT frozen: slow waves, steam rising like breath, all the way to the horizon. " + GEAR,
    "Place: SEA.", "Lighter grey morning with a faint warmth over the water.", "He is small, centre-low. One person.")
new("G", 175, ["HERO3", "SEA", "PIP", "MATE"], "A medium shot at the waterline, side view, 35mm lens, highest resolution.",
    "He sits on the dark sand at the water's edge, boots beside him, bare black feet in the small waves, heels wrapped in strips of dark grey cloth; Pip (PIP) stands on his shoulder staring at the sea; his mate (MATE) peeks out of the pocket. Backpack on.",
    "Place: the beach of SEA.", "Soft lighter grey morning, steam over the water.", "His face, Pip on the shoulder and the mate in the pocket are each croppable.")
new("G", 178, ["SEA"], "A macro close-up at sand level, 100mm lens, highest resolution.",
    "In the wet dark sand where the warm water meets the shore, one tiny curled green fern sprout, no bigger than a thumbnail: the only green in the whole frame.",
    "Place: the beach of SEA.", "Soft grey morning light.", "The fern sharp at the centre, room around it. No people.")
new("G", 180, ["HERO3", "SEA"], "A close-up of his face, 85mm lens, highest resolution.",
    "Thin and exhausted, eyes wet but not crying, looking out at the sea; steam drifts behind him.",
    "Place: SEA.", "Soft lighter grey light on his face.", "Exactly one person.")
new("G", 182, ["SEA"], "A macro close-up, 100mm lens.",
    "At the waterline, the wet dark sand is full of pale shells; several clams are closed tight, alive, a thin film of water around them.",
    "Place: the beach of SEA.", "Soft grey light.", "One clam sharp at the centre. No people.")
new("G", 184, ["HERO3", "SEA", "PIP"], "A wide shot from behind, 35mm lens, highest resolution.",
    "He stands barefoot on the beach facing the steaming grey sea, Pip (PIP) on his shoulder, backpack on, boots in the sand behind him.",
    "Place: SEA.", "Lighter grey morning, a faint warmth over the water.", "One person, one animal.")

# ======================= H · now: back room, museum, the drive (days 98–99) =======================
new("H", 64, ["MOM", "OLDW", "BACKROOM"], "A medium-wide shot, 35mm lens, highest resolution.",
    "In the museum back room at night, the mother (MOM) and the old woman (OLDW) sit on opposite sides of the work table; between them under the green lamp lies the dark-brown fossil shoulder blade and an old folded field map; the old woman's hat lies on the table.",
    "Place: BACKROOM.", "Warm green lamplight, deep shadows.", "Both faces are croppable. Exactly two people. No readable lettering.")
edit("H", 68, "the attached image FIELDMAP",
     "the black finger has moved a fingernail's width along the old river channel and now points at a second small pencil cross right next to the first",
     "the map, its pencil lines, stains and creases, the table, the lamp light, the camera angle and framing")
new("H", 72, ["CLIFF"], "A painted cutaway cross-section of a rock cliff, 35mm lens, highest resolution.",
    "Layers of grey and tan rock; along one pale stripe, under a tangle of thick roots turned to stone, an old animal burrow: a rounded tunnel shape filled with darker stone-hard mud, like a cast. Painted like a museum diagram but without any labels.",
    "Place: inside the cliff from CLIFF.", "Even, cool light.", "No people. No labels, no lettering.")
new("H", 75, ["MOM", "FRIEND_A", "FRIEND_B", "MUSEUM"], "A medium-wide shot, 35mm lens, highest resolution.",
    "In the museum hall in front of the T. rex skeleton, the boy (FRIEND_A) holds up his phone to show the mother (MOM) a video; the girl (FRIEND_B) stands beside them watching her face. The phone screen glows on the mother's face; the screen shows only a blurred bright image.",
    "Place: MUSEUM.", "Museum daylight.", "The mother's face in the phone glow is croppable. Exactly three people. No readable lettering.")
new("H", 81, ["MOM", "OLDW", "FRIEND_A", "FRIEND_B"], "A wide shot from outside at night, 35mm lens, highest resolution.",
    "A car drives along an empty highway at night; through its lit windows we see four people: the old woman (OLDW) in the front passenger seat with an old folded field map on her knees, the mother (MOM) driving, the two teenagers (FRIEND_A, FRIEND_B) in the back.",
    "Place: an empty highway on the plains.", "Night, one street light, the dashboard glow inside.", "The car on the empty road is croppable wider. Exactly four people. No readable lettering, no licence plate text.")

# ======================= I · now: the badlands cliff in winter (days 100 and 114) =======================
new("I", 121, ["CLIFF"], "A wide shot, 24mm lens, highest resolution.",
    "A car stands at the end of the frozen dirt track at the foot of the snowy badlands hills from CLIFF; its engine just switched off, a little exhaust steam hanging in the cold air.",
    "Place: CLIFF, seen from the track.", "Pale winter morning.", "Leave quiet sky at the top for a caption added later. No people visible yet.")
new("I", 123, ["OLDW", "MOM", "FRIEND_A", "FRIEND_B", "CLIFF"], "A medium-wide shot, 35mm lens, highest resolution.",
    "The old woman (OLDW) walks ahead through the old snow among the striped hills, sure-footed; behind her the mother (MOM) and the two teenagers (FRIEND_A, FRIEND_B) follow in a line." + WINTER,
    "Place: the hills of CLIFF.", "Pale winter morning.", "The old woman's face is croppable. Exactly four people.")
new("I", 125, ["OLDW", "MOM", "FRIEND_A", "FRIEND_B", "CLIFF"], "A wide shot, 35mm lens, highest resolution.",
    "At the foot of the low cliff below the pale stripe, the old woman (OLDW) stands by the small white wooden post, talking; the two teenagers (FRIEND_A, FRIEND_B) listen; the mother (MOM) stands a little apart, looking somewhere else. Above them, the stone roots come out of the rock." + WINTER,
    "Place: CLIFF.", "Pale winter morning.", "The mother's distracted face is croppable. Exactly four people. The post has no readable writing.")
new("I", 128, ["MOM", "CLIFF"], "A medium shot from behind and to the side, 35mm lens, highest resolution.",
    "The mother (MOM) stands alone at the small white post and looks up at the dark twisted stone roots coming out of the cliff above her; her face is seen in profile, lips parted." + WINTER,
    "Place: CLIFF.", "Pale winter light.", "Her face in profile is croppable. One person.")
new("I", 186, ["OLDW", "MOM", "CLIFF"], "A medium-wide shot, 35mm lens, highest resolution.",
    "The old woman (OLDW) and the mother (MOM) kneel at the cliff face just under the stone roots and gently brush the crust of frozen mud and snow from the rock with small brushes." + WINTER,
    "Place: CLIFF.", "Cold winter light.", "Both faces croppable. Exactly two people.")
edit("I", 187, "the attached image CLIFF",
     "it is now night with a warm wind: the snow on the hills is melting, and thin streams of meltwater run down the cliff face under the stone roots, glistening, washing the rock dark and wet",
     "the cliff, the pale stripe, the stone roots, the post, the string square, the camera angle, framing and style")
new("I", 188, ["FRIEND_B", "FRIEND_A", "MOM", "OLDW", "CLIFF"], "A medium-wide shot, 35mm lens, highest resolution.",
    "Morning after the thaw, the hills brown and wet, snow gone: the girl (FRIEND_B) has stopped and points at the wet cliff right on the pale stripe under the stone roots; the boy (FRIEND_A), the mother (MOM) and the old woman (OLDW) come up behind her." + WINTER,
    "Place: CLIFF after the thaw.", "Wet, clear morning light.", "Exactly four people.")
new("I", 189, ["CLIFF"], "An extreme close-up, 85mm lens, highest resolution.",
    "In the wet grey rock right under the stone roots, on the pale stripe, one long edge that is perfectly straight and flat, the edge of a flat stone slab set in the cliff, too straight to be natural; water drips past it.",
    "Place: the face of CLIFF.", "Wet morning light.", "The edge across the centre, room around it to crop wider. No people.")

# ---------- write ----------
rows = {}
for line in open(SHOT, encoding="utf-8"):
    m = re.match(r"- \*\*#(\d+)\*\* · ([\d:.]+) · `([^`]+)`", line)
    if m: rows[int(m.group(1))] = m.group(3)
need = {n for n, m in rows.items() if m.startswith(("NEW", "EDIT"))}
have = {n for v in B.values() for n, _ in v}
assert need == have, (sorted(need - have), sorted(have - need))
TITLE = {"A": "روز ۸۸: شب لونه و روز اول جاده", "B": "روز ۸۸: لاشه‌ها، دویدن، تخته‌سنگ", "C": "شب‌های لونه", "D": "روز ۸۹: تنگه، گله، پرنده",
         "E": "روز ۹۱: آتیش تقریباً می‌میره · روز ۹۴: پاشنه", "F": "روزهای ۹۷ تا ۱۰۱: رود پهن", "G": "روز ۱۰۴: دریا",
         "H": "زمان حال: اتاق پشتی، موزه، سفر شبانه", "I": "زمان حال: صخره‌ی بدلندز در زمستون"}
for i, k in enumerate("ABCDEFGHI"):
    frames = B[k]
    used = [r for r in REFS if any(re.search(r"\b" + r + r"\b", t) for _, t in frames)]
    names = ", ".join(f"p4-{lab(n)}" for n, _ in frames)
    rules = [STYLE, ANAT,
             "Every character, animal, place and object must look exactly like its reference. Do not invent new characters.",
             "EYES: every stick-figure person has only two kinds of eyes. Normally: small solid black ovals with no white, no iris and no pupil (lids and brows show the mood). Only in a moment of fear or shock: big round white eyes with one small black dot. Never realistic human eyes, never cartoon eyes with highlights.",
             "Wide 16:9, highest quality. No lettering, numbers, captions, logos or watermarks in any image.",
             f"Name each image exactly with its frame code: {names}.",
             "An EDIT frame changes only what it says, starting from the image it names."]
    if "HERO3" in used:
        rules[3:3] = ["Whenever the young man appears, both forearms are wrapped exactly as in HERO3: dark charcoal crossed strips with tufts of fern fluff. Never bare, never a light bandage, never scars.",
                      "His headlamp is always switched off: its lens is dark.",
                      "Every place on his journey is new and open: there is NO tunnel, NO stone door, NO stacked stones and NO huge tree with roots anywhere in his frames. Inside the snow den the roof is the flat underside of the grey rock shelf and packed snow, never roots.",
                      "The fire shell is always a brown turtle shell closed with a rounded lump of dried grey clay, tied with a cord, a thin orange glow at the clay edge. Never an orange ball, a canteen or a gourd. It smoulders; it has no tall flame.",
                      "In close-ups of his hands, never draw a dark silhouette face or a nose; if any part of his head is in frame, it is the round off-white head."]
    if "MATE" in used or "PIP" in used:
        rules.insert(3, "Pip is golden-brown; his mate is smaller and ash-grey with a white drop on her chest. Never swap their colours.")
    if any(r in used for r in ("DUCK", "TRI", "HERD")):
        rules.insert(3, "Every dead dinosaur is half-skeletal exactly like its reference: the front half (head, neck, front legs) has frozen grey skin; from the hips back only old, dry, grey-brown bones. No blood, no red flesh, no gore.")
    if k in "HI":
        rules.insert(3, "This is the present day: modern clothes, ordinary modern things. All people are stick figures as described above.")
    head = (f"You are making {len(frames)} still frames for a dark animated survival story, one image per frame, in the order below.\n\nATTACHED REFERENCES (match them exactly):\n"
            + "\n".join(f"- {r} = {REFS[r][0]}" for r in used) + "\n\n"
            + ("CAST AND PLACES:\n" + "\n".join(f"- {r}: {LONG[r]}" for r in used if r in LONG) + "\n\n" if any(r in LONG for r in used) else "")
            + "RULES FOR EVERY FRAME:\n" + "\n".join("- " + x for x in rules) + "\n")
    body = "\n\n".join(t for _, t in frames)
    files = {}
    for r in used: files.setdefault(REFS[r][1], []).append(r)
    att = " · ".join(f"`{fn}` ({'/'.join(rs)})" for fn, rs in files.items())
    md = [f"# دسته‌ی {k} · {TITLE[k]} · {len(frames)} قاب\n", f"**قاب‌ها:** {names}  ", f"**پیوست (همه با هم، {len(files)} عکس):** {att}  ",
          "**Flow:** حالت **Agent** روشن، ۱۶:۹، بالاترین کیفیت. کل بلوک زیر را یک‌جا پیست کن.  ",
          "**آپلود:** https://github.com/wwwdigiqube-max/Clude2/upload/main/uploads/dino-part4/frames\n", "```", head + "\n" + body, "```", ""]
    open(os.path.join(H, f"{10 + i:02d}-batch-{k}.md"), "w", encoding="utf-8").write("\n".join(md))
    print(k, len(frames), "frames,", len((head + body).split()), "words,", len(files), "files:", " ".join(files))
