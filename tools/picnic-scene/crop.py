"""Crops the rendered layers into the site's assets.

A Find scene — run after `node tools/picnic-scene/render.cjs <name>`: writes
the background as a JPEG, each item cropped to its own pixels (shadow
included), and prints every item's box and hit area as percentages of the
scene — paste them into `data/scenes.ts`. The circles' picnic lives in the
Shapes `find/` itself (`picnic.jpg`); every other scene in `<dest>/<name>/`
(`ground.jpg`). `dest` defaults to the Shapes course's `find/`.

    python3 tools/picnic-scene/crop.py squares
    python3 tools/picnic-scene/crop.py red public/assets/learn/pinki/colors/find

Nova's garden — run after `render.cjs harvest <food>`: writes the garden
without the food (`ground.jpg`), the food (`item.png` — all five are alike),
what stands in front of it (`front.png`: a bed's near half and the basket)
and the basket's near half that goes over what is piled in it (`rim.png`),
both cut out of the garden, into `<dest>/<food>/`, and prints each food's
box and hit area (the part not behind the front), the two layers' boxes and
the basket's mouth — paste them into `data/garden.ts`. `dest` defaults to
`public/assets/learn/nova/fruits/garden`.

    python3 tools/picnic-scene/crop.py harvest-apple

Single things — run after `render.cjs thing ...`: crops each named PNG in
`out/things/` to its pixels (shadow included) and writes it, at most 512px,
into `dest`.

    python3 tools/picnic-scene/crop.py things public/assets/learn/pinki/colors/pots red blue
"""
import json
import os
import sys
from PIL import Image, ImageChops

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


def pct(r):
    return [round(r[0] / W * 100, 2), round(r[1] / H * 100, 2),
            round((r[2] - r[0]) / W * 100, 2), round((r[3] - r[1]) / H * 100, 2)]


if NAME.startswith("harvest-"):
    food = NAME[len("harvest-"):]
    out = os.path.join(HERE, "out", NAME)
    dest = os.path.join(ROOT, sys.argv[2] if len(sys.argv) > 2 else "public/assets/learn/nova/fruits/garden", food)
    os.makedirs(dest, exist_ok=True)
    ground = Image.open(f"{out}/background.png").convert("RGB")
    ground.save(f"{dest}/ground.jpg", quality=86, optimize=True, progressive=True)
    boxes = {}
    for layer_name in ("front", "rim"):
        mask = Image.open(f"{out}/{layer_name}mask.png").convert("L")
        cut = ground.convert("RGBA")
        cut.putalpha(mask)
        boxes[layer_name] = alpha_box(cut, pad=2)
        cut.crop(boxes[layer_name]).save(f"{dest}/{layer_name}.png", optimize=True)
    solid = Image.open(f"{out}/frontmask.png").convert("L").point(lambda v: 255 if v > 127 else 0)
    meta = json.load(open(f"{out}/meta.json"))
    items = []
    for k in range(meta["count"]):
        layer = Image.open(f"{out}/item{k}.png")
        box = alpha_box(layer)
        if k == 0:
            layer.crop(box).save(f"{dest}/item.png", optimize=True)
        seen = ImageChops.subtract(layer.split()[-1].point(lambda v: 255 if v > 40 else 0), solid)
        items.append({"box": pct(box), "hit": pct(seen.getbbox()), "tilt": meta["tilt"][k]})
    print(json.dumps({"items": items, "pivot": meta["pivot"], "front": pct(boxes["front"]), "rim": pct(boxes["rim"]), "basket": meta["basket"]}))
    sys.exit()

OUT = os.path.join(HERE, "out", NAME)
FIND = os.path.join(ROOT, sys.argv[2]) if len(sys.argv) > 2 else os.path.join(ROOT, "public/assets/learn/pinki/shapes/find")
DEST = FIND if NAME == "picnic" else os.path.join(FIND, NAME)
GROUND = "picnic.jpg" if NAME == "picnic" else "ground.jpg"
os.makedirs(DEST, exist_ok=True)


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
