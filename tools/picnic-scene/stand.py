"""Stands a video still's cut-out (`cut.py`) where the 3D animal stood in
its world, and makes the animal alone. `with.png` / `bare.png` are the
world rendered with and without its animal, in the videos' light — the
difference between them is where it stood:

    node tools/picnic-scene/render.cjs thing world-dog=animalWorld:dog@float@hd@warm wbare-dog=animalWorld:dog@float@hd@bare@warm
    /tmp/cutenv/bin/python -I tools/picnic-scene/stand.py out/cut/dog.png out/things/world-dog.png out/things/wbare-dog.png <world.png> <thing.png> 0.86

The cut-out's soft edge still carries the still's background: it is taken
back out (`decontaminate`). Both get a soft contact shadow in the site's
shadow hue and the clay buttons' grain (`crop.py`'s, the same recipe);
the world is cut to its pixels at most 640px, the thing at most 512px.
`scale` sizes the still to the 3D animal's height."""
import sys, zlib
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

cut_p, with_p, bare_p, out_world, out_thing = sys.argv[1:6]
SCALE = float(sys.argv[6]) if len(sys.argv) > 6 else 1.0

def decontaminate(img):
    """The still's background bleeds into the fur's soft edge: estimate it
    (a wide blur of what is round the thing) and take it back out."""
    px = np.asarray(img).astype(np.float32) / 255
    # The matte never quite reaches 0 off the thing: a faint box round it.
    px[..., 3:4] = np.clip((px[..., 3:4] - 0.04) / 0.96, 0, 1)
    a = px[..., 3:4]
    rgb = px[..., :3]
    w = (1 - a) ** 4
    blur = lambda x: np.asarray(Image.fromarray((np.clip(x, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(14))).astype(np.float32) / 255
    bw = blur(np.repeat(w, 3, 2))
    bg = blur(rgb * w) / np.maximum(bw, 1e-3)
    fg = np.where(a > 0.02, (rgb - (1 - a) * bg) / np.maximum(a, 0.05), rgb)
    out = np.concatenate([np.clip(fg, 0, 1), a], 2)
    return Image.fromarray((out * 255 + 0.5).astype(np.uint8), "RGBA")

def grain(img, seed):
    rng = np.random.default_rng(seed)
    w, h = img.size
    coarse = Image.fromarray(rng.normal(0, 1, (h // 2 + 1, w // 2 + 1)).astype(np.float32), "F").resize((w, h), Image.BICUBIC)
    noise = 0.7 * np.asarray(coarse) + 0.45 * rng.normal(0, 1, (h, w))
    layer = np.clip(0.5 + 0.065 * noise, 0, 1)[..., None]
    px = np.asarray(img.convert("RGBA")).astype(np.float32) / 255
    base = px[..., :3]
    px[..., :3] = np.where(base < 0.5, 2 * base * layer, 1 - 2 * (1 - base) * (1 - layer))
    return Image.fromarray((np.clip(px, 0, 1) * 255 + 0.5).astype(np.uint8), "RGBA")

def shadow(size, w, h, opacity):
    """A soft contact shadow, a tint of the site's shadow hue."""
    s = Image.new("L", size, 0)
    d = ImageDraw.Draw(s)
    cx, cy = size[0] / 2, size[1] / 2
    d.ellipse([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], fill=int(255 * opacity))
    s = s.filter(ImageFilter.GaussianBlur(h * 0.45))
    out = Image.new("RGBA", size, (52, 48, 96, 0))
    out.putalpha(s)
    return out

cut = decontaminate(Image.open(cut_p).convert("RGBA"))
cut = cut.crop(cut.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox())

with_, bare = Image.open(with_p).convert("RGBA"), Image.open(bare_p).convert("RGBA")
diff = np.abs(np.asarray(with_).astype(int) - np.asarray(bare).astype(int)).sum(2) > 40
ys, xs = np.nonzero(diff)
l, t, r, b = xs.min(), ys.min(), xs.max(), ys.max()
h = int((b - t) * SCALE)
w = int(cut.width * h / cut.height)
dog = cut.resize((w, h), Image.LANCZOS)
cx = (l + r) // 2
world = bare.copy()
sh = shadow((int(w * 1.4), int(w * 0.5)), w * 0.92, w * 0.16, 0.42)
world.alpha_composite(sh, (cx - sh.width // 2, b - sh.height // 2 - int(h * 0.01)))
world.alpha_composite(dog, (cx - w // 2, b - h))
box = world.getchannel("A").point(lambda v: 255 if v > 6 else 0).getbbox()
world = world.crop(box)
world.thumbnail((640, 640), Image.LANCZOS)
grain(world, zlib.crc32(out_world.encode())).save(out_world, optimize=True)

# The thing alone: the dog over its own soft shadow, at most 512px.
H = 1000
dog = cut.resize((int(cut.width * H / cut.height), H), Image.LANCZOS)
pad = int(dog.width * 0.2)
canvas = Image.new("RGBA", (dog.width + 2 * pad, H + int(dog.width * 0.12)), (0, 0, 0, 0))
sh = shadow((int(dog.width * 1.3), int(dog.width * 0.4)), dog.width * 0.9, dog.width * 0.14, 0.36)
canvas.alpha_composite(sh, (canvas.width // 2 - sh.width // 2, H - sh.height // 2 - 6))
canvas.alpha_composite(dog, (pad, 0))
canvas = canvas.crop(canvas.getchannel("A").point(lambda v: 255 if v > 6 else 0).getbbox())
canvas.thumbnail((512, 512), Image.LANCZOS)
grain(canvas, zlib.crc32(out_thing.encode())).save(out_thing, optimize=True)
print("3D dog box", (l, t, r, b), "world", world.size, "thing", canvas.size)
