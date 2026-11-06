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

Nova's vegetable garden — run after `render.cjs veg`: the same as the shape
garden below, plus Basket Time's kitchen from lesson 1's layers: the room and
counter (`ground.jpg`), the counter alone (`counter.png`, over the friend
behind it), each thing, and the basket with its near half, into
`public/assets/learn/nova/fruits/kitchen/<frame>/`. Writes
`src/data/veg-garden.ts`.

    python3 tools/picnic-scene/crop.py veg

A course's world of stops — run after `render.cjs stops`: every frame of the
scroll, and `src/data/shape-stops.ts`.

    python3 tools/picnic-scene/crop.py stops

Nova's hill, The Seasons' world — run after `render.cjs hill`: as the shape
garden below, no Find. Writes `src/data/season-hill.ts`.

    python3 tools/picnic-scene/crop.py hill

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

Bloo dressed for each weather (the Weather lessons' "Which weather?",
2026-11-01) — run after `render.cjs thing bloo-sunny=bloo:sunny@float …`
(all four): crops the four on ONE box (they are a Pick's tiles), at most
640px, with the grain (none on the faces), into
`public/assets/learn/bloo/weather/dressed/<weather>.png`.

    python3 tools/picnic-scene/crop.py bloo

Bloo's weather — run after `render.cjs thing weather-sunny=weather:sunny@float
…` (all four): crops the four pictures on ONE box (they match — the review's
boxes and picks), at most 640px, with the grain, into
`public/assets/learn/bloo/weather/scenes/<weather>.png`.

    python3 tools/picnic-scene/crop.py weather

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

    python3 tools/picnic-scene/crop.py things public/assets/learn/pinki/shapes/things donut
    python3 tools/picnic-scene/crop.py things public/assets/learn/nova/fruits/things carrot --grain
"""
import json
import os
import shutil
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


if NAME == "bloo":
    one_box("bloo", ["sunny", "rainy", "windy", "snowy"], "public/assets/learn/bloo/weather/dressed")

if NAME == "weather":
    one_box("weather", ["sunny", "rainy", "windy", "snowy"], "public/assets/learn/bloo/weather/scenes")

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

if NAME == "stops":
    # A course's world of stops — run after `render.cjs stops [colors]`: every
    # frame of the scroll re-encoded into `<dest>/<frame>/`, and its data
    # module: the first frame a static import, the rest played by path with
    # one hash, each stop's box along the way and the scroll (0..1) at which
    # it stands nearest the middle. Shapes (2026-11-05) is the default;
    # `colors` (2026-11-06) writes `src/data/color-stops.ts`, golden stones,
    # and a mask sheet per frame with only the ways its frame shows.
    colors = len(sys.argv) > 2 and sys.argv[2] == "colors"
    dest = "public/assets/learn/pinki/colors/stops" if colors else "public/assets/learn/pinki/shapes/stops"
    imports, parts = [], []
    # How the picture moves between frames (where it grows from, % of the frame,
    # and how much), measured by best fit on neighbouring frames: re-measure if
    # the camera's way or the number of frames changes.
    flows = {"landscape": [50, -16, 1.024], "portrait": [50, 20, 1.03]} if colors else {"landscape": [50, -28, 1.017], "portrait": [50, 16, 1.022]}
    for frame in ("landscape", "portrait"):
        out = os.path.join(HERE, "out", f"stops-colors-{frame}" if colors else f"stops-{frame}")
        to = os.path.join(ROOT, dest, frame)
        shutil.rmtree(to, ignore_errors=True)
        os.makedirs(to)
        meta = json.load(open(f"{out}/meta.json"))
        ways = meta.get("ways", 4)
        crc = 0
        shown = []
        for f in range(meta["frames"]):
            name = f"f{f:03d}.jpg"
            Image.open(f"{out}/{name}").convert("RGB").save(f"{to}/{name}", quality=80, optimize=True, progressive=True)
            crc = zlib.crc32(open(f"{to}/{name}", "rb").read(), crc)
            # The ways' stones, one tile each, down one small PNG: white, the
            # mask as its alpha. Colors keeps only the tiles that show a stone.
            tw, th = (800, 450) if frame == "landscape" else (450, 800)
            tiles = []
            for k in range(ways):
                alpha = Image.open(f"{out}/w{f:03d}-{k}.png").convert("L").resize((tw, th), Image.LANCZOS)
                if colors and alpha.getbbox() is None:
                    continue
                tiles.append((k, alpha))
            shown.append([k for k, _ in tiles])
            if colors and not tiles:
                continue
            sheet = Image.new("LA", (tw, th * len(tiles)), (255, 0))
            for i, (_, alpha) in enumerate(tiles):
                sheet.paste(Image.merge("LA", (Image.new("L", (tw, th), 255), alpha)), (0, th * i))
            sheet.save(f"{to}/w{f:03d}.png", optimize=True)
            crc = zlib.crc32(open(f"{to}/w{f:03d}.png", "rb").read(), crc)
        keys = meta["keys"]
        focus = []
        for stop in range(len(keys[0])):
            dist = [abs(k[stop][1] + k[stop][3] / 2 - 58) for k in keys]
            focus.append(round(dist.index(min(dist)) / (len(keys) - 1), 3))
        imports.append(f'import {frame} from "../../{dest}/{frame}/f{meta["frames"] - 1:03d}.jpg";')
        parts.append(
            f'  {frame}: {{\n    first: {frame},\n    path: "/{dest[len("public/"):]}/{frame}/",\n    flow: {json.dumps(flows[frame])},\n    version: "{crc:08x}",\n    focus: {json.dumps(focus)},\n'
            + (f'    maskWays: {json.dumps(shown, separators=(",", ":"))},\n' if colors else "")
            + f'    keys: {json.dumps(keys, separators=(",", ":"))},\n  }},'
        )
    what, const, file = ("Pinki's Colors course", "COLOR_STOPS", "color-stops.ts") if colors else ("the Shapes course", "SHAPE_STOPS", "shape-stops.ts")
    ts = (
        f"/* GENERATED by `python3 tools/picnic-scene/crop.py stops{' colors' if colors else ''}` (after\n"
        f"   `render.cjs stops{' colors' if colors else ''}`) — {what}'s world of stops ({'2026-11-06' if colors else '2026-11-05'}).\n"
        "   Edit the scene, not this file. */\n"
        'import type { CourseStops } from "@/types/course";\n'
        + "\n".join(imports)
        + f"\n\n/** The camera going in as the page scrolls: {meta['frames']} frames, each stop's box\n    (% of the frame) at even steps along the way. */\nexport const {const}: CourseStops = {{\n  frames: {meta['frames']},\n"
        + ('  tint: "#ffc72e",\n  run: 720,\n' if colors else "")
        + "\n".join(parts) + "\n};\n"
    )
    open(os.path.join(ROOT, "src/data", file), "w").write(ts)
    sys.exit()

if NAME in ("garden", "forest", "veg", "hill"):
    FOREST = NAME == "forest"  # Pinki's colour forest (2026-11-05): the same kit, `out/forest-<n>-<frame>/`
    HILL = NAME == "hill"  # Nova's hill (2026-11-05): the same; every step over it out of focus, no Find
    VEG = NAME == "veg"  # Nova's vegetable garden (2026-11-05): the same; its last step is indoors, Basket Time in layers
    # Pinki's shape garden — run after `render.cjs garden <n…>`: for each
    # lesson and frame, into `public/assets/learn/pinki/shapes/garden/<n>/
    # <frame>/`: every station out of focus (`s<i>.jpg` — the Find's too,
    # for the lesson's end); every camera move as an H.264 clip (`m<i>.mp4`)
    # — the entry lands out of focus; a walk comes sharp at once (a
    # flower blooms where the step was done, the camera goes to the next
    # step's place, seen) and goes out of focus as it arrives; the tilt
    # down onto a shape lesson's picnic stays sharp; the end (the last
    # move) goes out of focus as it rises over the path in bloom — and
    # that Find in layers (`find/ground.jpg`, a PNG per thing). Then writes `src/data/shape-garden.ts`
    # (`--data` writes only that, from the last crop).
    import subprocess
    import tempfile

    BLUR = 0.009  # σ as a share of the picture's long side
    smooth = lambda a, b, t: (lambda x: x * x * (3 - 2 * x))(min(1, max(0, (t - a) / (b - a))))
    lessons = [int(a) for a in sys.argv[2:] if not a.startswith("--")] or (list(range(1, 12)) if FOREST else [1, 2, 3, 4, 5, 6] if VEG else [1, 2, 3, 4, 5])
    base = "public/assets/learn/pinki/colors/forest" if FOREST else "public/assets/learn/nova/fruits/world" if VEG else "public/assets/learn/nova/seasons/world" if HILL else "public/assets/learn/pinki/shapes/garden"
    # A step played sharp in the world: a Find, or Nova's kitchen.
    has_find = lambda lesson: not HILL and lesson <= (10 if FOREST else 5 if VEG else 4)
    GENERATED = "src/data/color-forest.ts" if FOREST else "src/data/veg-garden.ts" if VEG else "src/data/season-hill.ts" if HILL else "src/data/shape-garden.ts"

    def sigma(lesson, move, last, t):
        if move == 0:
            return 0 if FOREST and lesson <= 10 else BLUR * smooth(0.5, 1.0, t)
        # The colour lessons' first station stays sharp: its splash is the step.
        if FOREST and lesson <= 10 and move == 1:
            return BLUR * smooth(0.84, 1.0, t)
        come_in = 0 if has_find(lesson) and move == last else 1 - smooth(0.0, 0.12, t)
        go_out = 0 if has_find(lesson) and move == last - 1 else smooth(0.84, 1.0, t)
        return BLUR * max(come_in, go_out)

    def blurred(img, s):
        return img if s * max(img.size) < 0.3 else img.filter(ImageFilter.GaussianBlur(s * max(img.size)))

    data = {}
    # `--data`: only write `src/data/shape-garden.ts` again, from the last crop.
    for lesson in [] if "--data" in sys.argv else lessons:
        data[lesson] = {}
        for frame in ("landscape", "portrait"):
            out = os.path.join(HERE, "out", f"{NAME}-{lesson}-{frame}")
            to = os.path.join(ROOT, base, str(lesson), frame)
            os.makedirs(to, exist_ok=True)
            stations = sorted(int(f[1:-4]) for f in os.listdir(out) if f.startswith("s") and f.endswith(".png"))
            stills = []
            for i in stations:
                img = Image.open(f"{out}/s{i}.png").convert("RGB")
                img.thumbnail((1280, 1280), Image.LANCZOS)
                blurred(img, 0 if FOREST and lesson <= 10 and i == 0 else BLUR).save(f"{to}/s{i}.jpg", quality=82, optimize=True, progressive=True)
                stills.append(f"s{i}.jpg")
            moves = []
            for i in stations:
                frames = sorted(os.listdir(f"{out}/m{i}"))
                with tempfile.TemporaryDirectory() as tmp:
                    for k, name in enumerate(frames):
                        img = Image.open(f"{out}/m{i}/{name}").convert("RGB")
                        blurred(img, sigma(lesson, i, stations[-1], k / (len(frames) - 1))).save(f"{tmp}/{k:04d}.png")
                    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", "30", "-i", f"{tmp}/%04d.png",
                                    "-c:v", "libx264", "-preset", "slow", "-crf", "25", "-pix_fmt", "yuv420p",
                                    "-movflags", "+faststart", "-an", f"{to}/m{i}.mp4"], check=True)
                moves.append(f"m{i}.mp4?v={zlib.crc32(open(f'{to}/m{i}.mp4', 'rb').read()):08x}")
            find = None
            if has_find(lesson) and not VEG:
                fdir = f"{out}/find"
                shutil.rmtree(f"{to}/find", ignore_errors=True)
                os.makedirs(f"{to}/find")
                ground = Image.open(f"{fdir}/background.png").convert("RGB")
                W, H = ground.size
                ground.save(f"{to}/find/ground.jpg", quality=84, optimize=True, progressive=True)
                sized = lambda r: [round(r[0] / W * 100, 2), round(r[1] / H * 100, 2), round((r[2] - r[0]) / W * 100, 2), round((r[3] - r[1]) / H * 100, 2)]
                items = []
                for name, item in json.load(open(f"{out}/meta.json"))["items"].items():
                    layer = Image.open(f"{fdir}/{name}.png")
                    box = alpha_box(layer)
                    layer.crop(box).save(f"{to}/find/{name}.png", optimize=True)
                    hit = Image.open(f"{fdir}/{name}__hit.png").split()[-1].point(lambda v: 255 if v > 40 else 0).getbbox()
                    items.append({"id": name, "shape": item["shape"], "color": item.get("color"), "box": sized(box), "hit": sized(hit)})
                # Farthest first, so a nearer thing lies over a farther one.
                items.sort(key=lambda it: it["hit"][1] + it["hit"][3])
                find = {"items": items}
            data[lesson][frame] = {"stills": stills, "moves": moves, "find": find}
        print(f"garden {lesson}: done")
    # Keep what an earlier run wrote for the lessons not cropped this time.
    saved = os.path.join(HERE, "out", f"{NAME}.json")
    data = {**({int(k): v for k, v in json.load(open(saved)).items()} if os.path.exists(saved) else {}), **data}
    json.dump(data, open(saved, "w"))

    # `src/data/shape-garden.ts`: every picture a static import (cache-busted),
    # every clip a path with its hash.
    WORD = {"juice": "juice box", "icecream": "ice cream", "bowling": "bowling ball"}
    imports, worlds, finds = [], [], []
    def pic(lesson, frame, rel):
        name = f"{frame[0]}{lesson}_" + rel.replace("/", "_").replace(".", "_").replace("-", "_")
        imports.append(f'import {name} from "../../{base}/{lesson}/{frame}/{rel}";')
        return name
    for lesson in sorted(data):
        both = data[lesson]
        stations = []
        for i, still in enumerate(both["landscape"]["stills"]):
            stations.append(f"{{ landscape: {pic(lesson, 'landscape', still)}, portrait: {pic(lesson, 'portrait', both['portrait']['stills'][i])} }}")
        moves = [f'{{ landscape: "/{base[len("public/"):]}/{lesson}/landscape/{m}", portrait: "/{base[len("public/"):]}/{lesson}/portrait/{both["portrait"]["moves"][i]}" }}' for i, m in enumerate(both["landscape"]["moves"])]
        worlds.append(f"  {lesson}: {{\n    stations: [\n      {(',' + chr(10) + '      ').join(stations)},\n    ],\n    moves: [\n      {(',' + chr(10) + '      ').join(moves)},\n    ],\n  }},")
        if both["landscape"].get("find"):
            scenes = []
            for frame in ("landscape", "portrait"):
                rows = []
                for it in both[frame]["find"]["items"]:
                    shape = "null" if FOREST or it["shape"] is None else f'"{it["shape"]}"'
                    color = f', color: "{it["color"]}"' if it.get("color") else ""
                    rows.append(f'        {{ id: "{it["id"]}", src: {pic(lesson, frame, "find/" + it["id"] + ".png")}, word: "{WORD.get(it["id"], it["id"])}", shape: {shape}{color}, box: {json.dumps(it["box"])}, hit: {json.dumps(it["hit"])} }},')
                scenes.append(f"    {frame}: {{\n      background: {pic(lesson, frame, 'find/ground.jpg')},\n      items: [\n" + "\n".join(rows) + "\n      ],\n    },")
            finds.append(f"  {lesson}: {{\n" + "\n".join(scenes) + "\n  },")
    if HILL:
        ts = (
            "/* GENERATED by `python3 tools/picnic-scene/crop.py hill` (after\n"
            "   `render.cjs hill`) — Nova's hill, The Seasons' world (2026-11-05).\n"
            "   Edit the scene, not this file. */\n"
            'import type { LessonWorld } from "@/types/course";\n'
            + "\n".join(imports)
            + "\n\n/** Each Seasons lesson's camera round the tree (5 is the review): a still per\n    step after the reel and the move into each (0: the entry). */\n"
            + "export const SEASON_HILL: Record<number, LessonWorld> = {\n" + "\n".join(worlds) + "\n};\n"
        )
        open(os.path.join(ROOT, GENERATED), "w").write(ts)
        sys.exit()
    if VEG:
        # Basket Time's kitchen, one for all five lessons (lesson 1's layers):
        # the room and counter sharp (`ground.jpg`), the counter alone (laid
        # over the friend standing behind it), each thing cropped to its
        # pixels, the basket and its near half, into `kitchen/<frame>/`.
        kitchen = "public/assets/learn/nova/fruits/kitchen"
        saved_k = os.path.join(HERE, "out", "veg-kitchen.json")
        layout = json.load(open(saved_k)) if "--data" in sys.argv else {}
        for frame in [] if "--data" in sys.argv else ("landscape", "portrait"):
            out = os.path.join(HERE, "out", f"veg-1-{frame}")
            fdir = f"{out}/kitchen"
            to = os.path.join(ROOT, kitchen, frame)
            shutil.rmtree(to, ignore_errors=True)
            os.makedirs(to)
            meta = json.load(open(f"{out}/kitchen.json"))
            scene = Image.open(f"{fdir}/background.png").convert("RGB")
            W, H = scene.size
            scene.save(f"{to}/ground.jpg", quality=84, optimize=True, progressive=True)
            mask = Image.open(f"{fdir}/countermask.png").convert("L")
            counter = scene.convert("RGBA")
            counter.putalpha(mask)
            box = mask.getbbox()
            counter.crop(box).save(f"{to}/counter.png", optimize=True)
            sized = lambda r: [round(r[0] / W * 100, 2), round(r[1] / H * 100, 2), round((r[2] - r[0]) / W * 100, 2), round((r[3] - r[1]) / H * 100, 2)]
            one = {"counter": sized(box), "friend": meta["friend"], "items": []}
            for name in meta["items"]:
                layer = Image.open(f"{fdir}/{name}.png")
                box = alpha_box(layer)
                layer.crop(box).save(f"{to}/{name}.png", optimize=True)
                hit = Image.open(f"{fdir}/{name}__hit.png").split()[-1].point(lambda v: 255 if v > 40 else 0).getbbox()
                one["items"].append({"id": name, "box": sized(box), "hit": sized(hit)})
            one["items"].sort(key=lambda it: it["hit"][1] + it["hit"][3])
            basket = Image.open(f"{fdir}/basket.png")
            rim = basket.copy()
            rim.putalpha(ImageChops.multiply(basket.split()[-1], Image.open(f"{fdir}/rimmask.png").convert("L")))
            box = alpha_box(basket, pad=2)
            bw, bh = box[2] - box[0], box[3] - box[1]
            l, t, w, h = meta["mouth"]
            mouth = [(l / 100 * W - box[0]) / bw, (t / 100 * H - box[1]) / bh, w / 100 * W / bw, h / 100 * H / bh]
            basket.crop(box).save(f"{to}/basket.png", optimize=True)
            rim.crop(box).save(f"{to}/basket-rim.png", optimize=True)
            one["basket"] = {"box": sized(box), "mouth": [round(v * 100, 2) for v in mouth]}
            layout[frame] = one
        json.dump(layout, open(saved_k, "w"))
        VEGETABLES = ("carrot", "broccoli", "potato", "tomato", "pepper")
        frames = []
        def kpic(frame, rel):
            name = f"k{frame[0]}_" + rel.replace(".", "_").replace("-", "_")
            imports.append(f'import {name} from "../../{kitchen}/{frame}/{rel}";')
            return name
        for frame in ("landscape", "portrait"):
            one = layout[frame]
            rows = []
            for it in one["items"]:
                group = f', group: "{it["id"]}"' if it["id"] in VEGETABLES else ""
                rows.append(f'      {{ id: "{it["id"]}", src: {kpic(frame, it["id"] + ".png")}, word: "{it["id"]}", shape: null{group}, box: {json.dumps(it["box"])}, hit: {json.dumps(it["hit"])} }},')
            frames.append(
                f"  {frame}: {{\n    ground: {kpic(frame, 'ground.jpg')},\n    counter: {{ src: {kpic(frame, 'counter.png')}, box: {json.dumps(one['counter'])} }},\n"
                f"    friend: {json.dumps(one['friend'])},\n    basket: {{ src: {kpic(frame, 'basket.png')}, rim: {kpic(frame, 'basket-rim.png')}, mouth: {json.dumps(one['basket']['mouth'])}, box: {json.dumps(one['basket']['box'])} }},\n"
                "    items: [\n" + "\n".join(rows) + "\n    ],\n  },"
            )
        ts = (
            "/* GENERATED by `python3 tools/picnic-scene/crop.py veg` (after\n"
            "   `render.cjs veg`) — Nova's vegetable garden, the Vegetables course's\n"
            "   world (2026-11-05). Edit the scene, not this file. */\n"
            'import type { Framed, KitchenFrame, LessonWorld } from "@/types/course";\n'
            + "\n".join(imports)
            + "\n\n/** Each vegetable lesson's camera through the garden: a still per step after\n    the reel and the move into each (0: the entry). */\n"
            + "export const VEG_GARDEN: Record<number, LessonWorld> = {\n" + "\n".join(worlds) + "\n};\n\n"
            + "/** Basket Time's kitchen, the frame the camera comes in to, in layers. */\n"
            + "export const KITCHEN_FRAMES: Framed<KitchenFrame> = {\n" + "\n".join(frames) + "\n};\n"
        )
        open(os.path.join(ROOT, GENERATED), "w").write(ts)
        sys.exit()
    if FOREST:
        ts = (
            "/* GENERATED by `python3 tools/picnic-scene/crop.py forest` (after\n"
            "   `render.cjs forest`) — Pinki's colour forest, the Colors course's world\n"
            "   (2026-11-05). Edit the scene, not this file. */\n"
            'import type { Framed, LessonWorld, Scene } from "@/types/course";\n'
            + "\n".join(imports)
            + "\n\n/** Each Colors lesson's camera through the forest (11 is the review): a still\n    per step after the reel and the move into each (0: the entry). */\n"
            + "export const FOREST: Record<number, LessonWorld> = {\n" + "\n".join(worlds) + "\n};\n\n"
            + "/** Each colour lesson's Find, in the forest itself — its picnic on the\n    forest floor, seen from above: the ground and the things to tap, in both\n    frames (farthest first). */\n"
            + "export const FOREST_FIND: Record<number, Framed<Scene>> = {\n" + "\n".join(finds) + "\n};\n"
        )
        open(os.path.join(ROOT, GENERATED), "w").write(ts)
        sys.exit()
    ts = (
        "/* GENERATED by `python3 tools/picnic-scene/crop.py garden` (after\n"
        "   `render.cjs garden`) — Pinki's shape garden, the Shapes course's world\n"
        "   (2026-11-02). Edit the scene, not this file. */\n"
        'import type { Framed, LessonWorld, Scene } from "@/types/course";\n'
        + "\n".join(imports)
        + "\n\n/** Each Shapes lesson's camera through the garden: a still per step after\n    the reel and the move into each (0: the entry). */\n"
        + "export const GARDEN: Record<number, LessonWorld> = {\n" + "\n".join(worlds) + "\n};\n\n"
        + "/** Each shape lesson's Find, in the garden itself — its picnic on the\n    lawn, seen from above: the ground and the things to tap, in both\n    frames (farthest first). */\n"
        + "export const GARDEN_FIND: Record<number, Framed<Scene>> = {\n" + "\n".join(finds) + "\n};\n"
    )
    open(os.path.join(ROOT, "src/data/shape-garden.ts"), "w").write(ts)
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
