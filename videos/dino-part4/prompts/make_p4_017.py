# p4-017: Q7 map crop + one black silhouette hand, finger from the river to the inland sea (AI edits kept inventing a new map).
# Run: python3 videos/dino-part4/prompts/make_p4_017.py uploads/dino-part3/assets/Q7-book-map.jpeg uploads/dino-part4/frames/p4-017.jpg
from PIL import Image, ImageDraw, ImageFilter
import sys
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB").crop((450, 276, 450+1472, 276+828)); W, H = im.size; K = 3
m = Image.new("L", (W*K, H*K), 0); d = ImageDraw.Draw(m)
def P(x, y): return (x*K, y*K)
def seg(a, b, wd):
    d.line([P(*a), P(*b)], fill=255, width=int(wd*K))
    for c in (a, b): d.ellipse([P(c[0]-wd/2, c[1]-wd/2), P(c[0]+wd/2, c[1]+wd/2)], fill=255)
d.polygon([P(330, H), P(350, 600), P(420, 500), P(560, 470), P(640, 560), P(650, 700), P(600, H)], fill=255)  # palm + wrist
import math
a,b=(520,452),(925,522); dx,dy=b[0]-a[0],b[1]-a[1]; L=math.hypot(dx,dy); nx,ny=-dy/L,dx/L
w0,w1=52,40
d.polygon([P(a[0]+nx*w0,a[1]+ny*w0),P(b[0]+nx*w1,b[1]+ny*w1),P(b[0]-nx*w1,b[1]-ny*w1),P(a[0]-nx*w0,a[1]-ny*w0)],fill=255)
d.ellipse([P(b[0]-w1,b[1]-w1),P(b[0]+w1,b[1]+w1)],fill=255); d.ellipse([P(a[0]-w0,a[1]-w0),P(a[0]+w0,a[1]+w0)],fill=255)
seg((540, 560), (650, 590), 104)    # curled middle
seg((530, 650), (640, 680), 100)    # curled ring
seg((510, 740), (615, 765), 94)     # curled little
seg((420, 560), (520, 530), 84)     # thumb tucked along the side
m = m.resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.8))
sh = m.filter(ImageFilter.GaussianBlur(20)).point(lambda v: int(v*0.45))
off = Image.new("L", (W, H), 0); off.paste(sh, (16, 20))
im = Image.composite(Image.new("RGB", (W, H), (20, 14, 8)), im, off)
im = Image.composite(Image.new("RGB", (W, H), (6, 6, 6)), im, m)
im.resize((1920, 1080), Image.LANCZOS).save(out, quality=95)
