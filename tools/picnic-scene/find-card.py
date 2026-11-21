"""`/play`'s Find card (2026-11-21): the three friends hide and peek in Nova's
candy-pink garden, and a clay magnifying glass finds Pinki.

The garden is the Find stage's own layers (`public/assets/play/find/garden/landscape/`
back + mid), re-lit by nothing — the near things (the big bush, the mushrooms, the
watering can) are cut from the FRONT layer and laid at new places so each friend
(their PNGs, never 3D) can stand BEHIND one. The lens shows the garden ×1.12, like
a real one. Run `node tools/picnic-scene/find-card.cjs` first (the magnifier).

    python3 tools/picnic-scene/find-card.py   →  public/assets/play/find/find-card.jpg  (1376×860)
"""
import os
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
G = os.path.join(ROOT, "public/assets/play/find/garden/landscape")
FR = os.path.join(ROOT, "public/assets/friends")
W, H = 1920, 1200
X0 = 1000  # where the 1920-wide window starts in the 3240-wide garden

back = Image.open(f"{G}/back.jpg").convert("RGBA")
mid = Image.open(f"{G}/mid.webp").convert("RGBA")
world = Image.alpha_composite(back, mid).crop((X0, 0, X0 + W, H))
front = Image.open(f"{G}/front.webp").convert("RGBA")
front = front.resize((3240, round(front.height * 3240 / front.width)))
FY = H - front.height

def piece(x0, x1):
    return front.crop((x0, 0, x1, front.height))

def friend(name, height):
    im = Image.open(f"{FR}/{name}.png").convert("RGBA")
    return im.resize((round(im.width * height / im.height), height), Image.LANCZOS)

canvas = world.copy()

def put(im, cx, bottom):
    """Centre `im` on `cx`, its feet at `bottom`."""
    canvas.alpha_composite(im, (cx - im.width // 2, bottom - im.height))

# Behind: the friends, each peeking over what hides them.
put(friend("nova", 640), 400, 1150)
put(friend("pinki", 580), 960, 1175)
put(friend("bloo", 620), 1640, 1160)

# In front: the bush (left), the mushrooms (middle), the watering can (right).
for (a, b), x in (((520, 1340), 20), ((1540, 1980), 780), ((2180, 2940), 1250)):
    p = piece(a, b)
    canvas.alpha_composite(p, (x, FY))

# The magnifier, lens over Pinki's face; the lens shows the garden ×1.12.
mag = Image.open(os.path.join(HERE, "out/find-card/magnifier.png")).convert("RGBA")
S = 0.95
mag = mag.resize((round(mag.width * S), round(mag.height * S)), Image.LANCZOS)
LC, LR = (416 * S, 355 * S), 200 * S  # the glass's centre and radius in the resized image
MX, MY = 655, 498  # top-left of the magnifier on the card (its lens over Pinki's face)
cx, cy = MX + LC[0], MY + LC[1]
Z = 1.12
patch = canvas.crop((round(cx - LR / Z), round(cy - LR / Z), round(cx + LR / Z), round(cy + LR / Z))).resize((round(2 * LR), round(2 * LR)), Image.LANCZOS)
mask = Image.new("L", patch.size, 0)
ImageDraw.Draw(mask).ellipse((0, 0, patch.width - 1, patch.height - 1), fill=255)
# a soft shadow under the whole magnifier
sh = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
shape = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
shape.alpha_composite(mag, (MX, MY))
alpha = shape.getchannel("A").filter(ImageFilter.GaussianBlur(16)).point(lambda a: int(a * 0.28))
sh = Image.new("RGBA", canvas.size, (120, 40, 80, 0)); sh.putalpha(alpha)
canvas.alpha_composite(sh, (22, 30))
canvas.paste(patch, (round(cx - LR), round(cy - LR)), mask)
canvas.alpha_composite(mag, (MX, MY))

out = os.path.join(ROOT, "public/assets/play/find/find-card.jpg")
canvas.convert("RGB").resize((1376, 860), Image.LANCZOS).save(out, quality=86, optimize=True)
canvas.convert("RGB").resize((960, 600)).save(os.path.join(HERE, "out/find-card/preview.png"))
print("wrote", out)
