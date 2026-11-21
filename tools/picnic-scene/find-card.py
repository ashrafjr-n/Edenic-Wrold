"""`/play`'s Find card (2026-11-21): the three friends hide and peek in a simple
pastel meadow, and a clay magnifying glass finds Pinki.

Run `node tools/picnic-scene/find-card.cjs` first — it renders the meadow (`back`),
the near bushes and flowers (`front`, transparent) and the magnifier. Here the
friends (their PNGs, never 3D) are laid BETWEEN back and front, so Nova and Bloo
stand behind a bush each; the lens shows the meadow ×1.12, like a real one.

    python3 tools/picnic-scene/find-card.py   →  public/assets/play/find/find-card.jpg  (1376×860)
"""
import os
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(HERE, "out/find-card")
FR = os.path.join(ROOT, "public/assets/friends")
W, H = 1376, 860

def load(name, size=None):
    im = Image.open(os.path.join(OUT, name)).convert("RGBA")
    return im.resize(size, Image.LANCZOS) if size else im

canvas = load("back.png", (W, H))
front = load("front.png", (W, H))

def friend(name, height):
    im = Image.open(f"{FR}/{name}.png").convert("RGBA")
    return im.resize((round(im.width * height / im.height), height), Image.LANCZOS)

def put(im, cx, bottom, shadow=False):
    """Centre `im` on `cx`, its feet at `bottom`; `shadow` lays a soft ground shadow first."""
    if shadow:
        sh = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        ImageDraw.Draw(sh).ellipse((cx - im.width * 0.34, bottom - 14, cx + im.width * 0.34, bottom + 20), fill=(70, 130, 90, 90))
        canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(10)))
    canvas.alpha_composite(im, (cx - im.width // 2, bottom - im.height))

put(friend("nova", 440), 215, 640)
put(friend("bloo", 430), 1175, 630)
put(friend("pinki", 470), 690, 725, shadow=True)
canvas.alpha_composite(front)

# The magnifier, its lens over Pinki's face; the lens shows the meadow ×1.12.
mag = Image.open(os.path.join(OUT, "magnifier.png")).convert("RGBA")
S = 0.68
mag = mag.resize((round(mag.width * S), round(mag.height * S)), Image.LANCZOS)
LC, LR = (416 * S, 355 * S), 200 * S  # the glass's centre and radius in the resized image
MX, MY = 452, 200  # top-left of the magnifier on the card
cx, cy = MX + LC[0], MY + LC[1]
Z = 1.12
patch = canvas.crop((round(cx - LR / Z), round(cy - LR / Z), round(cx + LR / Z), round(cy + LR / Z))).resize((round(2 * LR), round(2 * LR)), Image.LANCZOS)
mask = Image.new("L", patch.size, 0)
ImageDraw.Draw(mask).ellipse((0, 0, patch.width - 1, patch.height - 1), fill=255)
shape = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
shape.alpha_composite(mag, (MX, MY))
alpha = shape.getchannel("A").filter(ImageFilter.GaussianBlur(11)).point(lambda a: int(a * 0.26))
sh = Image.new("RGBA", canvas.size, (110, 50, 90, 0)); sh.putalpha(alpha)
canvas.alpha_composite(sh, (14, 20))
canvas.paste(patch, (round(cx - LR), round(cy - LR)), mask)
canvas.alpha_composite(mag, (MX, MY))

out = os.path.join(ROOT, "public/assets/play/find/find-card.jpg")
canvas.convert("RGB").save(out, quality=88, optimize=True)
canvas.convert("RGB").save(os.path.join(OUT, "preview.png"))
print("wrote", out)
