"""Cuts a thing out of a course video's still — the videos' own animal,
fur and all — with BiRefNet (the open model best at hair and fur edges),
run straight on onnxruntime, and stands it alone over a soft contact
shadow, as a render: `crop.py things` then cuts it with the grain like the
rest (a stale `<out>.face.png` from a 3D render is removed — it would keep
the grain off where that one's eyes were).

Not a project dependency, like Playwright for `render.cjs`: a venv of its
own with `onnxruntime numpy pillow`, and the model (BiRefNet-general,
~970 MB, MIT) downloaded once into a folder of its own:

    python3 -m venv /tmp/cutenv && /tmp/cutenv/bin/pip install onnxruntime numpy pillow
    curl -L -o /tmp/birefnet/birefnet-general.onnx https://github.com/danielgatis/rembg/releases/download/v0.0.0/BiRefNet-general-epoch_244.onnx
    /tmp/cutenv/bin/python -I tools/picnic-scene/cut.py /tmp/birefnet/birefnet-general.onnx still.png tools/picnic-scene/out/things/dog.png
    python3 tools/picnic-scene/crop.py things public/assets/learn/bloo/animals/things dog --grain

A neighbour the matte takes in too (the cat's pink friend): name it as a
polygon in the still's pixels, `x,y x,y …` after the paths, and it is
dropped from the cut.

The cut-out's soft edge still carries the still's background: it is taken
back out (`decontaminate`), and the matte's faint floor zeroed (it drew a
pale box round the thing). `coat.py` gives it a second coat.
"""
import os
import sys
import numpy as np
import onnxruntime as ort
from PIL import Image, ImageChops, ImageDraw, ImageFilter

model, src, dst = sys.argv[1:4]
drop = [tuple(map(float, p.split(","))) for p in sys.argv[4:]]


def matte(img):
    """BiRefNet's alpha for `img`, at its size."""
    x = np.asarray(img.resize((1024, 1024), Image.BICUBIC)).astype(np.float32) / 255
    x = (x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
    x = x.transpose(2, 0, 1)[None].astype(np.float32)
    sess = ort.InferenceSession(model, providers=["CPUExecutionProvider"])
    out = sess.run(None, {sess.get_inputs()[0].name: x})[0]
    m = 1 / (1 + np.exp(-out[0, 0]))
    m = (m - m.min()) / (m.max() - m.min() + 1e-6)
    return Image.fromarray((m * 255).astype(np.uint8)).resize(img.size, Image.BICUBIC)


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

still = Image.open(src).convert("RGB")
cut = still.copy()
alpha = matte(still)
if drop:
    keep = Image.new("L", still.size, 255)
    ImageDraw.Draw(keep).polygon(drop, fill=0)
    alpha = ImageChops.multiply(alpha, keep.filter(ImageFilter.GaussianBlur(2)))
cut.putalpha(alpha)
cut = decontaminate(cut)
cut = cut.crop(cut.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox())

# Alone, over its own soft shadow, 1000px tall.
H = 1000
alone = cut.resize((int(cut.width * H / cut.height), H), Image.LANCZOS)
pad = int(alone.width * 0.2)
canvas = Image.new("RGBA", (alone.width + 2 * pad, H + int(alone.width * 0.12)), (0, 0, 0, 0))
sh = shadow((int(alone.width * 1.3), int(alone.width * 0.4)), alone.width * 0.9, alone.width * 0.14, 0.36)
canvas.alpha_composite(sh, (canvas.width // 2 - sh.width // 2, H - sh.height // 2 - 6))
canvas.alpha_composite(alone, (pad, 0))
canvas.save(dst)
face = dst.replace(".png", ".face.png")
if os.path.exists(face):
    os.remove(face)
print("cut", src, "->", dst, canvas.size)
