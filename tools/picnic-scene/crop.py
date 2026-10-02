"""Crops the rendered layers into the site's assets.

A Find scene — run after `node tools/picnic-scene/render.cjs <name>`: writes
the background as a JPEG, each item cropped to its own pixels (shadow
included), and prints every item's box and hit area as percentages of the
scene — paste them into `data/scenes.ts`. The circles' picnic lives in the
Shapes `find/` itself (`picnic.jpg`); every other scene in `<dest>/<name>/`
(`ground.jpg`). `dest` defaults to the Shapes course's `find/`.

    python3 tools/picnic-scene/crop.py squares
    python3 tools/picnic-scene/crop.py red public/assets/learn/pinki/colors/find

Single things — run after `render.cjs thing ...`: crops each named PNG in
`out/things/` to its pixels (shadow included) and writes it, at most 512px,
into `dest`.

    python3 tools/picnic-scene/crop.py things public/assets/learn/pinki/colors/pots red blue
"""
import json
import os
import sys
from PIL import Image

HERE = os.path.dirname(__file__)
ROOT = os.path.join(HERE, "../..")
NAME = sys.argv[1] if len(sys.argv) > 1 else "picnic"
W, H = 1000, 1250


def alpha_box(layer, threshold=6, pad=6):
    box = layer.split()[-1].point(lambda v: 255 if v > threshold else 0).getbbox()
    w, h = layer.size
    return (max(0, box[0] - pad), max(0, box[1] - pad), min(w, box[2] + pad), min(h, box[3] + pad))


if NAME == "things":
    dest = os.path.join(ROOT, sys.argv[2])
    os.makedirs(dest, exist_ok=True)
    for name in sys.argv[3:]:
        layer = Image.open(os.path.join(HERE, "out", "things", f"{name}.png"))
        thing = layer.crop(alpha_box(layer))
        thing.thumbnail((512, 512), Image.LANCZOS)
        thing.save(os.path.join(dest, f"{name}.png"), optimize=True)
    sys.exit()

OUT = os.path.join(HERE, "out", NAME)
FIND = os.path.join(ROOT, sys.argv[2]) if len(sys.argv) > 2 else os.path.join(ROOT, "public/assets/learn/pinki/shapes/find")
DEST = FIND if NAME == "picnic" else os.path.join(FIND, NAME)
GROUND = "picnic.jpg" if NAME == "picnic" else "ground.jpg"
os.makedirs(DEST, exist_ok=True)


def pct(r):
    return [round(r[0] / W * 100, 2), round(r[1] / H * 100, 2),
            round((r[2] - r[0]) / W * 100, 2), round((r[3] - r[1]) / H * 100, 2)]


Image.open(f"{OUT}/background.png").convert("RGB").save(
    f"{DEST}/{GROUND}", quality=86, optimize=True, progressive=True)
layout = {}
for name, meta in json.load(open(f"{OUT}/meta.json")).items():
    layer = Image.open(f"{OUT}/{name}.png")
    box = alpha_box(layer)
    layer.crop(box).save(f"{DEST}/{name}.png", optimize=True)
    hit = Image.open(f"{OUT}/{name}__hit.png").split()[-1].point(lambda v: 255 if v > 40 else 0).getbbox()
    layout[name] = {**meta, "box": pct(box), "hit": pct(hit)}
print(json.dumps(layout, indent=1))
