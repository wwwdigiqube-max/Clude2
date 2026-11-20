#!/usr/bin/env python3
"""Frame audit sheets for the Stay Small channel (skill: frame-audit).

Usage:
  python3 tools/frame_audit.py <shotlist.md> <frames_dir> <prefix> <out_dir> [frame ...]

  shotlist.md : the STILLCUT shot list (lines "- **#N** · t · `METHOD` — see · _رفرنس: ..._ · **وضعیت:** `STATE`")
  frames_dir  : folder with the generated frames, named <prefix><NNN>.jpg (e.g. p3-004.jpg)
  prefix      : file prefix, e.g. "p3-"
  out_dir     : where the sheets go (out/ is not committed)
  frame ...   : optional frame numbers; default = every NEW/EDIT frame

Writes:
  <out_dir>/frame-NNN.jpg  one sheet per frame: the frame big, its reference images, three 2x zooms
                           (left / centre / right), and the narration, refs and STATE as text.
  <out_dir>/story-K.jpg    every frame in story order, 4x4 per page, with its number and STATE,
                           for continuity across batches (arms, bag, door, river, light, eyes).
  <out_dir>/missing.txt    frames in the shot list that have no image yet.
"""
import os, re, sys, glob
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FONT = None
for f in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", os.path.join(ROOT, "public/fonts/Oswald.ttf")):
    if os.path.exists(f): FONT = f; break
def font(n): return ImageFont.truetype(FONT, n) if FONT else ImageFont.load_default()

# where reference tokens live (first match wins)
SEARCH = ["uploads/dino-part3/assets", "uploads/dino-part2/assets", "uploads/dino-long/refs", "uploads/dino-long/shots",
          "uploads/dino-long-en/assets", "uploads/dino-part2/frames", "uploads/dino-long-en/frames", "uploads/dino-part3/frames"]

def find_ref(tok):
    tok = tok.strip()
    m = re.match(r"(p2|p3|en):([\w-]+)", tok)
    if m:
        d = {"p2": "uploads/dino-part2/frames/p2-", "p3": "uploads/dino-part3/frames/p3-", "en": "uploads/dino-long-en/frames/"}[m.group(1)]
        for ext in (".jpg", ".jpeg", ".png"):
            p = os.path.join(ROOT, d + m.group(2) + ext)
            if os.path.exists(p): return p
        return None
    for d in SEARCH:
        hits = sorted(glob.glob(os.path.join(ROOT, d, tok + "*")))
        hits = [h for h in hits if h.lower().endswith((".jpg", ".jpeg", ".png"))]
        if hits: return hits[0]
    return None

def ref_tokens(refs):
    """'@hero-winter(P1) · @pip(R1) · a:Q4 · en:045 style' -> ['P1','R1','Q4','en:045']"""
    toks = []
    for part in refs.split("·"):
        part = part.strip()
        m = re.search(r"\(([^)]+)\)", part)
        t = m.group(1) if m else re.sub(r"^(@|a:|ref:\s*)", "", part).split(" ")[0]
        t = t.replace("a:", "")
        if t and t not in toks: toks.append(t)
    return toks

def parse(shotlist):
    rows, cur = [], None
    for line in open(shotlist, encoding="utf-8"):
        m = re.match(r"- \*\*#(\w+)\*\* · ([\d:.]+) · `([^`]+)`(?: 🆕)? — (.*)", line)
        if m:
            rest = m.group(4)
            refs = re.search(r"_رفرنس: (.*?)_", rest); st = re.search(r"\*\*وضعیت:\*\* `([^`]*)`", rest)
            see = re.sub(r" · _رفرنس.*", "", rest); see = re.sub(r" · \*\*وضعیت.*", "", see)
            cur = dict(id=m.group(1), t=m.group(2), meth=m.group(3), see=see.strip(), refs=refs.group(1) if refs else "",
                       state=st.group(1) if st else "", text="")
            rows.append(cur)
        elif cur and line.startswith("  > "): cur["text"] = line[4:].strip()
    return rows

def wrap(d, text, x, y, w, f, fill):
    words, line = text.split(), ""
    for wd in words:
        t = (line + " " + wd).strip()
        if d.textlength(t, font=f) > w and line: d.text((x, y), line, font=f, fill=fill); y += f.size + 4; line = wd
        else: line = t
    if line: d.text((x, y), line, font=f, fill=fill); y += f.size + 4
    return y

def frame_sheet(r, img_path, out):
    W, H = 2400, 1500
    sh = Image.new("RGB", (W, H), (24, 24, 28)); d = ImageDraw.Draw(sh)
    im = Image.open(img_path).convert("RGB"); fw, fh = 1440, 810
    sh.paste(im.resize((fw, fh)), (20, 20))
    # 3 zooms of the frame (left / centre / right), 2x
    iw, ih = im.size
    for k, (x0, y0) in enumerate([(0.0, 0.25), (0.33, 0.25), (0.66, 0.25)]):
        c = im.crop((int(iw * x0), int(ih * y0), int(iw * (x0 + 0.34)), int(ih * (y0 + 0.5)))).resize((460, 380))
        sh.paste(c, (20 + k * 480, fh + 40))
    # references
    y = 20
    for t in ref_tokens(r["refs"])[:4]:
        p = find_ref(t)
        if not p: d.text((1490, y), f"ref {t}: not found", font=font(26), fill=(255, 120, 120)); y += 40; continue
        ri = Image.open(p).convert("RGB"); ri.thumbnail((880, 330))
        sh.paste(ri, (1490, y)); d.text((1490, y + ri.height + 2), t, font=font(24), fill=(255, 220, 120)); y += ri.height + 36
        if y > 1100: break
    # text
    f1, f2 = font(30), font(26)
    yy = fh + 440
    d.text((20, yy), f"#{r['id']}  {r['meth']}", font=font(36), fill=(255, 220, 120)); yy += 46
    yy = wrap(d, "TEXT: " + r["text"], 20, yy, 1440, f2, (230, 230, 230))
    yy = wrap(d, "STATE: " + (r["state"] or "-"), 20, yy, 1440, f2, (140, 220, 255))
    sh.save(out, quality=85)

def story_sheets(rows, frames_dir, prefix, out_dir):
    items = []
    for r in rows:
        p = os.path.join(frames_dir, f"{prefix}{r['id'].zfill(3)}.jpg")
        if os.path.exists(p): items.append((r, p))
    W, H, cols = 600, 338, 4
    for k in range(0, len(items), 16):
        page = items[k:k + 16]; rws = (len(page) + cols - 1) // cols
        sh = Image.new("RGB", (W * cols, (H + 54) * rws), (20, 20, 20)); d = ImageDraw.Draw(sh)
        for i, (r, p) in enumerate(page):
            x, y = (i % cols) * W, (i // cols) * (H + 54)
            sh.paste(Image.open(p).convert("RGB").resize((W - 6, H)), (x + 3, y))
            d.text((x + 6, y + H + 2), f"#{r['id']}", font=font(24), fill=(255, 220, 120))
            d.text((x + 80, y + H + 4), (r["state"] or r["see"])[:58], font=font(19), fill=(170, 220, 255))
        sh.save(os.path.join(out_dir, f"story-{k // 16 + 1}.jpg"), quality=82)
    return len(items)

def main():
    if len(sys.argv) < 5: print(__doc__); sys.exit(1)
    shot, frames_dir, prefix, out_dir = sys.argv[1:5]; only = set(sys.argv[5:])
    os.makedirs(out_dir, exist_ok=True)
    rows = [r for r in parse(shot) if r["meth"].startswith(("NEW", "EDIT"))]
    missing = []
    for r in rows:
        if only and r["id"] not in only: continue
        p = os.path.join(frames_dir, f"{prefix}{r['id'].zfill(3)}.jpg")
        if not os.path.exists(p): missing.append(r["id"]); continue
        frame_sheet(r, p, os.path.join(out_dir, f"frame-{r['id'].zfill(3)}.jpg"))
    n = story_sheets(rows, frames_dir, prefix, out_dir)
    open(os.path.join(out_dir, "missing.txt"), "w").write("\n".join(missing))
    print(f"{len(rows)} NEW/EDIT frames · {n} with images · missing: {missing or 'none'} -> {out_dir}")

if __name__ == "__main__":
    main()
