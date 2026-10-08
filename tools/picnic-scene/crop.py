"""Crops the rendered layers into the site's assets.

A Find scene — run after `node tools/picnic-scene/render.cjs <name>`: writes
the background as a JPEG, each item cropped to its own pixels (shadow
included), and prints every item's box and hit area as percentages of the
scene — paste them into `data/scenes.ts`. The circles' picnic lives in the
Shapes `find/` itself (`picnic.jpg`); every other scene in `<dest>/<name>/`
(`ground.jpg`). `dest` defaults to the Shapes course's `find/`.

    python3 tools/picnic-scene/crop.py squares
    python3 tools/picnic-scene/crop.py red public/assets/learn/pinki/colors/find

Nova's garden — run after `render.cjs harvest <garden>`: writes the garden
without its food (`ground.jpg`), each kind of food once (`<food>.png` — all
of one kind are alike) and, if anything stands in front of them, that cut
out of the garden (`front.png`: the beds' near halves) into
`<dest>/<garden>/`, and prints each food's kind, box and hit area (the part
not behind the front) and the front's box — paste them into
`data/garden.ts`. `dest` defaults to
`public/assets/learn/nova/fruits/garden`.

    python3 tools/picnic-scene/crop.py harvest-fruits --grain

Nova's basket — run after `render.cjs basket`: writes the basket
(`basket.png`) and its near half, which goes over what is piled in it
(`basket-rim.png`), both on one box, into `dest`, and prints the mouth (%
of that box).

    python3 tools/picnic-scene/crop.py basket

Nova's seasons — run after `render.cjs season spring summer fall winter`:
crops every frame of the four seasons on ONE box (the four pictures
match), at most 800px, into `public/assets/learn/nova/seasons/<season>/
<k>.png`, and prints each step's spot (% of that box) for
`data/nova-scenes.ts`.

    python3 tools/picnic-scene/crop.py seasons

Bloo's weather — run after `render.cjs thing weather-sunny=weather:sunny@float
…` (all four): crops the four pictures on ONE box (they match — the review's
boxes and picks), at most 640px, with the grain, into
`public/assets/learn/bloo/weather/scenes/<weather>.png`.

    python3 tools/picnic-scene/crop.py weather

Bloo's horns — cut out of his own picture (`public/assets/friends/bloo.png`,
the same size) into `public/assets/learn/bloo/weather/bloo-horns.png`, to lie
over the hats he is given in the Weather lessons, so his horns come through
them: inside each horn's outline, every pixel with far more red than blue
(gold and its shine — never his blue felt).

    python3 tools/picnic-scene/crop.py horns

Single things — run after `render.cjs thing ...`: crops each named PNG in
`out/things/` to its pixels (shadow included) and writes it, at most 512px,
into `dest`. `--grain` lays the clay buttons' grain over each (the
friends' look: Nova's fruits and her cup; Bloo's animals, their homes and
their food).

    python3 tools/picnic-scene/crop.py things public/assets/learn/pinki/colors/pots red blue
    python3 tools/picnic-scene/crop.py things public/assets/learn/nova/fruits/things apple --grain
    python3 tools/picnic-scene/crop.py things public/assets/learn/bloo/animals/food bone milk grass pellets --grain
"""
import json
import os
import sys
import zlib
import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter

HERE = os.path.dirname(__file__)
ROOT = os.path.join(HERE, "../..")
NAME = sys.argv[1] if len(sys.argv) > 1 else "picnic"
W, H = 1000, 1250


def alpha_box(layer, threshold=6, pad=6):
    box = layer.split()[-1].point(lambda v: 255 if v > threshold else 0).getbbox()
    w, h = layer.size
    return (max(0, box[0] - pad), max(0, box[1] - pad), min(w, box[2] + pad), min(h, box[3] + pad))


def grain(img, seed, keep=None):
    """The `--noise` the clay buttons wear (`globals.css`): grey noise of
    ~2px grains, blended `overlay` — midtones move, black (the shadow)
    stays black. None where `keep` is white (a face's glossy eyes and
    mouth). Seeded, so a re-crop gives the same picture."""
    rng = np.random.default_rng(seed)
    w, h = img.size
    coarse = Image.fromarray(rng.normal(0, 1, (h // 2 + 1, w // 2 + 1)).astype(np.float32), "F").resize((w, h), Image.BICUBIC)
    noise = 0.7 * np.asarray(coarse) + 0.45 * rng.normal(0, 1, (h, w))
    if keep is not None:
        noise = noise * (1 - np.asarray(keep.convert("L")).astype(np.float32) / 255)
    layer = np.clip(0.5 + 0.065 * noise, 0, 1)[..., None]
    px = np.asarray(img.convert("RGBA")).astype(np.float32) / 255
    base = px[..., :3]
    mixed = np.where(base < 0.5, 2 * base * layer, 1 - 2 * (1 - base) * (1 - layer))
    px[..., :3] = mixed
    return Image.fromarray((np.clip(px, 0, 1) * 255 + 0.5).astype(np.uint8), "RGBA")


if NAME == "weather":
    weathers = ["sunny", "rainy", "windy", "snowy"]
    dest = os.path.join(ROOT, "public/assets/learn/bloo/weather/scenes")
    os.makedirs(dest, exist_ok=True)
    layers = {w: Image.open(os.path.join(HERE, "out", "things", f"weather-{w}.png")) for w in weathers}
    boxes = [alpha_box(layer) for layer in layers.values()]
    box = (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))
    for w, layer in layers.items():
        cut = layer.crop(box)
        cut.thumbnail((640, 640), Image.LANCZOS)
        face = os.path.join(HERE, "out", "things", f"weather-{w}.face.png")
        keep = Image.open(face).crop(box).resize(cut.size, Image.LANCZOS) if os.path.exists(face) else None
        grain(cut, zlib.crc32(w.encode()), keep).save(os.path.join(dest, f"{w}.png"), optimize=True)
    sys.exit()

# Each horn's outline, % of Bloo's picture — drawn a little wide.
HORNS = [[(27, 5), (34, 0), (42, 4), (47, 13), (44, 19), (36, 21), (28, 19)], [(75, 21), (83, 14), (93, 14), (96, 20), (92, 33), (85, 33), (78, 28)]]

if NAME == "horns":
    bloo = Image.open(os.path.join(ROOT, "public/assets/friends/bloo.png")).convert("RGBA")
    W, H = bloo.size
    px = np.asarray(bloo).astype(np.float32) / 255
    gold = np.clip((px[..., 0] - px[..., 2] - 0.04) / 0.1, 0, 1)
    region = Image.new("L", (W, H), 0)
    draw = ImageDraw.Draw(region)
    for poly in HORNS:
        draw.polygon([(x / 100 * W, y / 100 * H) for x, y in poly], fill=255)
    region = np.asarray(region.filter(ImageFilter.GaussianBlur(1))).astype(np.float32) / 255
    px[..., 3] *= region * gold
    px[px[..., 3] < 1 / 255] = 0  # nothing kept under what is not there: a far smaller file
    dest = os.path.join(ROOT, "public/assets/learn/bloo/weather")
    os.makedirs(dest, exist_ok=True)
    Image.fromarray((px * 255 + 0.5).astype(np.uint8), "RGBA").save(os.path.join(dest, "bloo-horns.png"), optimize=True)
    sys.exit()

if NAME == "things":
    dest = os.path.join(ROOT, sys.argv[2])
    os.makedirs(dest, exist_ok=True)
    names = [a for a in sys.argv[3:] if not a.startswith("--")]
    for name in names:
        layer = Image.open(os.path.join(HERE, "out", "things", f"{name}.png"))
        box = alpha_box(layer)
        thing = layer.crop(box)
        thing.thumbnail((512, 512), Image.LANCZOS)
        if "--grain" in sys.argv:
            face = os.path.join(HERE, "out", "things", f"{name}.face.png")
            keep = Image.open(face).crop(box).resize(thing.size, Image.LANCZOS) if os.path.exists(face) else None
            thing = grain(thing, zlib.crc32(name.encode()), keep)
        thing.save(os.path.join(dest, f"{name}.png"), optimize=True)
    sys.exit()


def pct(r):
    return [round(r[0] / W * 100, 2), round(r[1] / H * 100, 2),
            round((r[2] - r[0]) / W * 100, 2), round((r[3] - r[1]) / H * 100, 2)]


if NAME.startswith("harvest-"):
    garden = NAME[len("harvest-"):]
    out = os.path.join(HERE, "out", NAME)
    where = [a for a in sys.argv[2:] if not a.startswith("--")]
    dest = os.path.join(ROOT, where[0] if where else "public/assets/learn/nova/fruits/garden", garden)
    os.makedirs(dest, exist_ok=True)
    ground = Image.open(f"{out}/background.png").convert("RGB")
    W, H = ground.size
    ground.save(f"{dest}/ground.jpg", quality=86, optimize=True, progressive=True)
    # What stands in front of the food — none in a garden of trees alone.
    front = None
    solid = Image.new("L", ground.size, 0)
    if os.path.exists(f"{out}/frontmask.png"):
        mask = Image.open(f"{out}/frontmask.png").convert("L")
        cut = ground.convert("RGBA")
        cut.putalpha(mask)
        front = alpha_box(cut, pad=2)
        cut.crop(front).save(f"{dest}/front.png", optimize=True)
        solid = mask.point(lambda v: 255 if v > 127 else 0)
    meta = json.load(open(f"{out}/meta.json"))
    items = []
    for k in range(meta["count"]):
        food = meta["foods"][k]
        layer = Image.open(f"{out}/item{k}.png")
        box = alpha_box(layer)
        # One picture per food — all of one kind are alike.
        if food not in meta["foods"][:k]:
            cut = layer.crop(box)
            if "--grain" in sys.argv:
                cut = grain(cut, zlib.crc32(food.encode()))
            cut.save(f"{dest}/{food}.png", optimize=True)
        seen = ImageChops.subtract(layer.split()[-1].point(lambda v: 255 if v > 40 else 0), solid)
        items.append({"food": food, "box": pct(box), "hit": pct(seen.getbbox()), "tilt": meta["tilt"][k]})
    print(json.dumps({"items": items, **({"front": pct(front)} if front else {})}))
    sys.exit()

if NAME == "seasons":
    # Every frame of every season on ONE box, so the four pictures match
    # (same size, the island in the same place).
    seasons = ["spring", "summer", "fall", "winter"]
    frames = {s: [Image.open(os.path.join(HERE, "out", f"season-{s}", f"frame{k}.png")) for k in range(5)] for s in seasons}
    boxes = [alpha_box(f) for fs in frames.values() for f in fs]
    box = (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))
    W, H = frames["spring"][0].size
    bw, bh = box[2] - box[0], box[3] - box[1]
    spots = {}
    for s in seasons:
        dest = os.path.join(ROOT, "public/assets/learn/nova/seasons", s)
        os.makedirs(dest, exist_ok=True)
        for k, f in enumerate(frames[s]):
            cut = f.crop(box)
            cut.thumbnail((800, 800), Image.LANCZOS)
            cut.save(f"{dest}/{k}.png", optimize=True)
        meta = json.load(open(os.path.join(HERE, "out", f"season-{s}", "meta.json")))
        spots[s] = [[round((x / 100 * W - box[0]) / bw * 100, 2), round((y / 100 * H - box[1]) / bh * 100, 2)] for x, y in meta["spots"]]
    print(json.dumps({"ratio": round(bw / bh, 4), "spots": spots}))
    sys.exit()

if NAME == "basket":
    out = os.path.join(HERE, "out", "basket")
    dest = os.path.join(ROOT, sys.argv[2] if len(sys.argv) > 2 else "public/assets/learn/nova/fruits/garden")
    basket = Image.open(f"{out}/basket.png")
    rim = basket.copy()
    rim.putalpha(ImageChops.multiply(basket.split()[-1], Image.open(f"{out}/rimmask.png").convert("L")))
    box = alpha_box(basket, pad=2)
    W, H = basket.size
    l, t, w, h = json.load(open(f"{out}/meta.json"))["mouth"]
    bw, bh = box[2] - box[0], box[3] - box[1]
    mouth = [(l / 100 * W - box[0]) / bw, (t / 100 * H - box[1]) / bh, w / 100 * W / bw, h / 100 * H / bh]
    for name, layer in (("basket", basket), ("basket-rim", rim)):
        cut = layer.crop(box)
        cut.thumbnail((512, 512), Image.LANCZOS)
        cut.save(f"{dest}/{name}.png", optimize=True)
    print(json.dumps({"mouth": [round(v * 100, 2) for v in mouth]}))
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
