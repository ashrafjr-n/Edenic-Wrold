"""Stands a video still's cut-out (`cut.py`) where the 3D animal stood in
its world, and makes the animal alone — both as renders, so `crop.py`
cuts them as it cuts the rest. `with.png` / `bare.png` are the world drawn
with and without its animal (`@hd`, in the videos' light) — the
difference between them is where it stood:

    node tools/picnic-scene/render.cjs thing wwith-dog=animalWorld:dog@float@hd@warm wbare-dog=animalWorld:dog@float@hd@bare@warm
    /tmp/cutenv/bin/python -I tools/picnic-scene/stand.py out/cut/dog.png out/things/wwith-dog.png out/things/wbare-dog.png out/things/world-dog.png out/things/dog.png 0.86
    python3 tools/picnic-scene/crop.py animals
    python3 tools/picnic-scene/crop.py things public/assets/learn/bloo/animals/things dog --grain

The cut-out's soft edge still carries the still's background: it is taken
back out (`decontaminate`), and the matte's faint floor zeroed. Both get
a soft contact shadow in the site's shadow hue; the world comes out at
the 1x renders' size (800px, so `crop.py animals` cuts all four worlds on
one box), the thing at 1000px tall. `scale` sizes the still to the 3D
animal's height. A stale `<name>.face.png` from the 3D animal is removed —
it would keep the grain off where its eyes were."""
import os, sys
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
cx = (l + r) // 2
world = bare.copy()
sh = shadow((int(w * 1.4), int(w * 0.5)), w * 0.92, w * 0.16, 0.42)
world.alpha_composite(sh, (cx - sh.width // 2, b - sh.height // 2 - int(h * 0.01)))
world.alpha_composite(cut.resize((w, h), Image.LANCZOS), (cx - w // 2, b - h))
world.resize((800, 800), Image.LANCZOS).save(out_world)

# The thing alone: the animal over its own soft shadow.
H = 1000
alone = cut.resize((int(cut.width * H / cut.height), H), Image.LANCZOS)
pad = int(alone.width * 0.2)
canvas = Image.new("RGBA", (alone.width + 2 * pad, H + int(alone.width * 0.12)), (0, 0, 0, 0))
sh = shadow((int(alone.width * 1.3), int(alone.width * 0.4)), alone.width * 0.9, alone.width * 0.14, 0.36)
canvas.alpha_composite(sh, (canvas.width // 2 - sh.width // 2, H - sh.height // 2 - 6))
canvas.alpha_composite(alone, (pad, 0))
canvas.save(out_thing)
for out in (out_world, out_thing):
    face = out.replace(".png", ".face.png")
    if os.path.exists(face):
        os.remove(face)
print("3D animal at", (l, t, r, b), "->", out_world, out_thing)
