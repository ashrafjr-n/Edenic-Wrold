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

    python3 tools/picnic-scene/crop.py harvest-vegetables --grain

Nova's basket — run after `render.cjs basket`: writes the basket
(`basket.png`) and its near half, which goes over what is piled in it
(`basket-rim.png`), both on one box, into `dest`, and prints the mouth (%
of that box).

    python3 tools/picnic-scene/crop.py basket

Nova's seasons — run after `render.cjs season spring summer fall winter`:
crops each season's whole picture (its last frame) on ONE box (the four
pictures match), at most 800px, into `public/assets/learn/nova/seasons/
scenes/<season>.png`.

    python3 tools/picnic-scene/crop.py seasons

Bloo's weather — run after `render.cjs thing weather-sunny=weather:sunny@float
…` (all four): crops the four pictures on ONE box (they match — the review's
boxes and picks), at most 640px, with the grain, into
`public/assets/learn/bloo/weather/scenes/<weather>.png`.

    python3 tools/picnic-scene/crop.py weather

Making the weather — run after `render.cjs weathersteps sunny rainy windy
snowy`: crops every frame and sky layer of the four on ONE box (the
frames of a weather cross-fade, its sky lies over them), with one grain
for all of a weather, into `public/assets/learn/bloo/weather/make/
<weather>/`, and prints each sky layer's box (% of that box) for
`data/bloo-skies.ts`.

    python3 tools/picnic-scene/crop.py weathersteps

A lesson's backdrop — run after `render.cjs backdrop <name>`: blurs both
frames (the world stays known, never sharp enough to pull the eye) and
writes them as JPEGs, 1280px on the long side, into `dest`.

    python3 tools/picnic-scene/crop.py backdrop circle public/assets/learn/pinki/shapes/backdrop/circle

A friend's classroom — run after `render.cjs classroom <id>`: the wall,
sharp with a vignette (`<frame>.jpg`), and the chairs and desk in front,
blurred (`<frame>-desk.png`, the whole frame), both frames, into
`public/assets/learn/<id>/classroom/`.

    python3 tools/picnic-scene/crop.py classroom nova

A game card's picture on /play — run after `render.cjs backdrop
play-<name>`: the landscape frame, sharp, 1376px wide, into
`public/assets/play/<name>/<name>-card.jpg`.

    python3 tools/picnic-scene/crop.py playcard cups

Single things — run after `render.cjs thing ...`: crops each named PNG in
`out/things/` to its pixels (shadow included) and writes it, at most 512px,
into `dest`. `--grain` lays the clay buttons' grain over each (the
friends' look and the videos': Nova's vegetables and her cup; Bloo's
animals and their homes).

    python3 tools/picnic-scene/crop.py things public/assets/learn/pinki/colors/pots red blue
    python3 tools/picnic-scene/crop.py things public/assets/learn/nova/fruits/things carrot --grain
"""
import json
import os
import sys
import zlib
import numpy as np
from PIL import Image, ImageChops, ImageFilter

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


def one_box(prefix, names, dest):
    """`out/things/<prefix>-<name>.png` for every name, cut on ONE box (they
    match), at most 640px, with the grain, into `dest/<name>.png`."""
    dest = os.path.join(ROOT, dest)
    os.makedirs(dest, exist_ok=True)
    layers = {n: Image.open(os.path.join(HERE, "out", "things", f"{prefix}-{n}.png")) for n in names}
    boxes = [alpha_box(layer) for layer in layers.values()]
    box = (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))
    for n, layer in layers.items():
        cut = layer.crop(box)
        cut.thumbnail((640, 640), Image.LANCZOS)
        face = os.path.join(HERE, "out", "things", f"{prefix}-{n}.face.png")
        keep = Image.open(face).crop(box).resize(cut.size, Image.LANCZOS) if os.path.exists(face) else None
        grain(cut, zlib.crc32(n.encode()), keep).save(os.path.join(dest, f"{n}.png"), optimize=True)
    sys.exit()


if NAME == "weather":
    one_box("weather", ["sunny", "rainy", "windy", "snowy"], "public/assets/learn/bloo/weather/scenes")

if NAME == "weathersteps":
    weathers = ["sunny", "rainy", "windy", "snowy"]
    outs = {w: os.path.join(HERE, "out", f"weathersteps-{w}") for w in weathers}
    names = {w: sorted(n[:-4] for n in os.listdir(o) if n.endswith(".png") and not n.endswith(".face.png")) for w, o in outs.items()}
    boxes = [alpha_box(Image.open(os.path.join(outs[w], f"{n}.png"))) for w in weathers for n in names[w]]
    box = (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))
    sky = {}
    for w in weathers:
        dest = os.path.join(ROOT, "public/assets/learn/bloo/weather/make", w)
        os.makedirs(dest, exist_ok=True)
        for n in names[w]:
            cut = Image.open(os.path.join(outs[w], f"{n}.png")).crop(box)
            cut.thumbnail((640, 640), Image.LANCZOS)
            face = os.path.join(outs[w], f"{n}.face.png")
            keep = Image.open(face).crop(box).resize(cut.size, Image.LANCZOS) if os.path.exists(face) else None
            # One grain for all of a weather: its frames cross-fade without the grain jumping.
            grain(cut, zlib.crc32(w.encode()), keep).save(os.path.join(dest, f"{n}.png"), optimize=True)
            if n.startswith("sky"):
                l, t, r, b = cut.split()[-1].point(lambda v: 255 if v > 40 else 0).getbbox()
                sky.setdefault(w, []).append([round(l / cut.width * 100, 2), round(t / cut.height * 100, 2), round((r - l) / cut.width * 100, 2), round((b - t) / cut.height * 100, 2)])
    print(json.dumps({"size": [box[2] - box[0], box[3] - box[1]], "sky": sky}))
    sys.exit()

if NAME == "grow":
    # Growing Nova's vegetables — run after `render.cjs grow carrot potato
    # tomato pepper broccoli`: the soil (`ground.webp`, the same for all
    # five) into `grow/`, and for each food what each frame ADDS to the
    # soil — the plant, its shadow (the grass in front of its foot stays
    # the soil's: a difference matte against the soil alone, both grained
    # with ONE noise field so the grain never differs) — cut at the soil's
    # front edge into two sheets of frames, `<food>/above.webp` (it sways)
    # and `<food>/below.webp`, 8 frames a row. Prints the frame's size and,
    # per food, each sheet's cell and box (% of the frame), the foot (% of
    # the above cell — it sways about it) and where the vegetable is (% of
    # the frame) — paste into `data/grow.ts`.
    foods = ["carrot", "potato", "tomato", "pepper", "broccoli"]
    SCALE, COLS = 0.85, 8
    dest = os.path.join(ROOT, "public/assets/learn/nova/fruits/grow")
    os.makedirs(dest, exist_ok=True)
    seed = zlib.crc32(b"grow")
    ground = grain(Image.open(os.path.join(HERE, "out", "grow-carrot", "ground.png")), seed)
    G = np.asarray(ground).astype(np.int16)
    H0, W0 = G.shape[:2]
    mattes, metas = {}, {}
    for f in foods:
        out = os.path.join(HERE, "out", f"grow-{f}")
        metas[f] = json.load(open(os.path.join(out, "meta.json")))
        frames = []
        for k in range(metas[f]["frames"]):
            F = np.asarray(grain(Image.open(os.path.join(out, f"frame{k:02d}.png")), seed)).astype(np.int16)
            d = np.abs(F - G).max(axis=2)
            a = np.clip((d - 2) / 6, 0, 1) * (F[..., 3] / 255)
            px = F.astype(np.uint8).copy()
            px[..., 3] = (a * 255 + 0.5).astype(np.uint8)
            frames.append(px)
        mattes[f] = frames
    # One frame box for all: the soil and everything any plant ever adds.
    def bbox(mask):
        ys, xs = np.nonzero(mask)
        return [xs.min(), ys.min(), xs.max() + 1, ys.max() + 1]
    boxes = [bbox(G[..., 3] > 6)] + [bbox(m[..., 3] > 6) for f in foods for m in mattes[f]]
    fl, ft = max(0, min(b[0] for b in boxes) - 4), max(0, min(b[1] for b in boxes) - 4)
    fr, fb = min(W0, max(b[2] for b in boxes) + 4), min(H0, max(b[3] for b in boxes) + 4)
    fw, fh = fr - fl, fb - ft
    pct = lambda v, size: round(v / size * 100, 3)
    gb = bbox(G[..., 3] > 6)
    Image.fromarray(G.astype(np.uint8)).crop(gb).resize((round((gb[2] - gb[0]) * SCALE), round((gb[3] - gb[1]) * SCALE)), Image.LANCZOS).save(os.path.join(dest, "ground.webp"), quality=90, method=6)
    result = {"size": [round(fw * SCALE), round(fh * SCALE)], "ground": [pct(gb[0] - fl, fw), pct(gb[1] - ft, fh), pct(gb[2] - gb[0], fw), pct(gb[3] - gb[1], fh)], "foods": {}}
    for f in foods:
        meta = metas[f]
        foot = (meta["foot"][0] / 100 * W0, meta["foot"][1] / 100 * H0)
        # The soil's front edge: just under the foot (where the cut face starts).
        split = int(round(foot[1] + 26))
        os.makedirs(os.path.join(dest, f), exist_ok=True)
        entry = {"frames": meta["frames"], "cols": COLS, "emerge": meta["emerge"], "veg": [pct(meta["veg"][0] / 100 * W0 - fl, fw), pct(meta["veg"][1] / 100 * H0 - ft, fh)]}
        for part, rows in (("above", slice(0, split)), ("below", slice(split, H0))):
            ms = [m.copy() for m in mattes[f]]
            for m in ms:
                keep = np.zeros(H0, bool)
                keep[rows] = True
                m[~keep, :, 3] = 0
            b = None
            for m in ms:
                if (m[..., 3] > 4).any():
                    bb = bbox(m[..., 3] > 4)
                    b = bb if b is None else [min(b[0], bb[0]), min(b[1], bb[1]), max(b[2], bb[2]), max(b[3], bb[3])]
            b = [max(0, b[0] - 2), max(0, b[1] - 2), min(W0, b[2] + 2), min(H0, b[3] + 2)]
            cw, ch = round((b[2] - b[0]) * SCALE), round((b[3] - b[1]) * SCALE)
            n = len(ms)
            rows_n = (n + COLS - 1) // COLS
            sheet = Image.new("RGBA", (cw * COLS, ch * rows_n), (0, 0, 0, 0))
            for k, m in enumerate(ms):
                cell = Image.fromarray(m).crop(b).resize((cw, ch), Image.LANCZOS)
                sheet.paste(cell, ((k % COLS) * cw, (k // COLS) * ch))
            sheet.save(os.path.join(dest, f, f"{part}.webp"), quality=86, alpha_quality=92, method=6)
            entry[part] = {"cell": [cw, ch], "box": [pct(b[0] - fl, fw), pct(b[1] - ft, fh), pct(b[2] - b[0], fw), pct(b[3] - b[1], fh)]}
            if part == "above":
                entry[part]["foot"] = [pct(foot[0] - b[0], b[2] - b[0]), pct(foot[1] - b[1], b[3] - b[1])]
        result["foods"][f] = entry
    print(json.dumps(result))
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

if NAME == "classroom":
    # Pinki's classroom, both frames: the wall SHARP (2026-10-14, direct
    # request: its poster's words are read) with a soft vignette, as a
    # JPEG; the chairs and desk in front out of focus, as a PNG over it
    # (the whole frame). At most 1600px on the long side.
    who = sys.argv[2] if len(sys.argv) > 2 else "pinki"
    out = os.path.join(HERE, "out", f"classroom-{who}")
    dest = os.path.join(ROOT, f"public/assets/learn/{who}/classroom")
    os.makedirs(dest, exist_ok=True)
    for frame in ("portrait", "landscape"):
        back = Image.open(f"{out}/{frame}-back.png").convert("RGB")
        back.thumbnail((1600, 1600), Image.LANCZOS)
        w, h = back.size
        yy, xx = np.mgrid[0:h, 0:w]
        d = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h * 0.42) / (h / 2)) ** 2)
        shade = (1 - 0.16 * np.clip(d - 0.45, 0, 1) ** 1.6)[..., None]
        px = np.asarray(back).astype(np.float32) * shade
        Image.fromarray(np.clip(px, 0, 255).astype(np.uint8)).save(f"{dest}/{frame}.jpg", quality=84, optimize=True, progressive=True)
        # The whole frame, not cropped: the page lays it over the wall the
        # same way (cover), so the chairs stand where they were rendered.
        front = Image.open(f"{out}/{frame}-front.png").convert("RGBA")
        front.thumbnail((1600, 1600), Image.LANCZOS)
        # Blurred premultiplied, so the clear (black) pixels round the
        # chairs never bleed a dark rim into them.
        px = np.asarray(front).astype(np.float32) / 255
        a = px[..., 3:]
        blur = lambda ch: np.asarray(Image.fromarray((ch * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(max(front.size) * 0.006))).astype(np.float32) / 255
        alpha = blur(a[..., 0])
        rgb = np.stack([blur(px[..., c] * a[..., 0]) for c in range(3)], -1) / np.maximum(alpha, 1 / 255)[..., None]
        out_px = np.concatenate([np.clip(rgb, 0, 1), alpha[..., None]], -1)
        Image.fromarray((out_px * 255).round().astype(np.uint8), "RGBA").save(f"{dest}/{frame}-desk.png", optimize=True)
    sys.exit()

if NAME == "playcard":
    # A game card's picture on /play (2026-10-23) — run after `render.cjs
    # backdrop play-<name>`: the landscape frame, sharp (the card lays its
    # own wash over it), 1376px wide like the other cards' pictures, into
    # `public/assets/play/<name>/<name>-card.jpg`.
    name = sys.argv[2]
    dest = os.path.join(ROOT, f"public/assets/play/{name}")
    os.makedirs(dest, exist_ok=True)
    img = Image.open(os.path.join(HERE, "out", f"backdrop-play-{name}", "landscape.png")).convert("RGB")
    img.resize((1376, round(1376 * img.height / img.width)), Image.LANCZOS).save(f"{dest}/{name}-card.jpg", quality=84, optimize=True, progressive=True)
    sys.exit()

if NAME == "backdrop":
    name, dest = sys.argv[2], os.path.join(ROOT, sys.argv[3])
    os.makedirs(dest, exist_ok=True)
    for frame in ("portrait", "landscape"):
        img = Image.open(os.path.join(HERE, "out", f"backdrop-{name}", f"{frame}.png")).convert("RGB")
        img.thumbnail((1280, 1280), Image.LANCZOS)
        img.filter(ImageFilter.GaussianBlur(max(img.size) * 0.009)).save(f"{dest}/{frame}.jpg", quality=82, optimize=True, progressive=True)
    sys.exit()

if NAME == "seasons":
    # Each season's whole picture (its last frame), all four on ONE box —
    # the box of every frame, as when the frames were the lesson's third
    # step — so the four match (same size, the island in the same place).
    seasons = ["spring", "summer", "fall", "winter"]
    frames = {s: [Image.open(os.path.join(HERE, "out", f"season-{s}", f"frame{k}.png")) for k in range(5)] for s in seasons}
    boxes = [alpha_box(f) for fs in frames.values() for f in fs]
    box = (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))
    dest = os.path.join(ROOT, "public/assets/learn/nova/seasons/scenes")
    os.makedirs(dest, exist_ok=True)
    for s in seasons:
        cut = frames[s][-1].crop(box)
        cut.thumbnail((800, 800), Image.LANCZOS)
        cut.save(f"{dest}/{s}.png", optimize=True)
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
