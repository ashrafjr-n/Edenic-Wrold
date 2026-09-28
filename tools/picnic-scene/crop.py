"""Crops the rendered layers into the Find activity's assets.

Run after `node tools/picnic-scene/render.cjs <name>`: writes the background as
a JPEG, each item cropped to its own pixels (shadow included), and prints every
item's box and hit area as percentages of the scene — paste them into
`data/scenes.ts`. The circles' picnic lives in `find/` itself (`picnic.jpg`);
every other scene in `find/<name>/` (`ground.jpg`).

    python3 tools/picnic-scene/crop.py squares
"""
import json
import os
import sys
from PIL import Image

NAME = sys.argv[1] if len(sys.argv) > 1 else "picnic"
HERE = os.path.dirname(__file__)
OUT = os.path.join(HERE, "out", NAME)
FIND = os.path.join(HERE, "../../public/assets/learn/pinki/shapes/find")
DEST = FIND if NAME == "picnic" else os.path.join(FIND, NAME)
GROUND = "picnic.jpg" if NAME == "picnic" else "ground.jpg"
os.makedirs(DEST, exist_ok=True)
W, H = 1000, 1250


def pct(r):
    return [round(r[0] / W * 100, 2), round(r[1] / H * 100, 2),
            round((r[2] - r[0]) / W * 100, 2), round((r[3] - r[1]) / H * 100, 2)]


Image.open(f"{OUT}/background.png").convert("RGB").save(
    f"{DEST}/{GROUND}", quality=86, optimize=True, progressive=True)
layout = {}
for name, meta in json.load(open(f"{OUT}/meta.json")).items():
    layer = Image.open(f"{OUT}/{name}.png")
    box = layer.split()[-1].point(lambda v: 255 if v > 6 else 0).getbbox()
    box = (max(0, box[0] - 6), max(0, box[1] - 6), min(W, box[2] + 6), min(H, box[3] + 6))
    layer.crop(box).save(f"{DEST}/{name}.png", optimize=True)
    hit = Image.open(f"{OUT}/{name}__hit.png").split()[-1].point(lambda v: 255 if v > 40 else 0).getbbox()
    layout[name] = {"shape": meta["shape"], "box": pct(box), "hit": pct(hit)}
print(json.dumps(layout, indent=1))
