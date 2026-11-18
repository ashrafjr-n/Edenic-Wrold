"""The star pod's empty slot: the chest's gold star, re-coloured pale clay.

    python3 tools/stars/empty-star.py   # -> public/assets/learn/star-empty.png

Same 3D shape and shading as `chest-star.png` (so the gold one lands exactly
on it), its sparkles taken out, its tone a pale blue-white.
"""

import os

import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(__file__)
LEARN = os.path.join(HERE, "..", "..", "public", "assets", "learn")
TONE = np.array([0.84, 0.87, 0.95])


def grey(lum):
    return Image.fromarray((lum * 255).astype("uint8"))


rgba = np.asarray(Image.open(os.path.join(LEARN, "chest-star.png")).convert("RGBA")).astype(float) / 255
rgb, alpha = rgba[..., :3], rgba[..., 3:]
lum = rgb @ [0.299, 0.587, 0.114]
# The sparkles: points brighter than their surroundings, filled from those.
smooth = np.asarray(grey(lum).filter(ImageFilter.MedianFilter(21))).astype(float) / 255
spark = np.asarray(grey((lum - smooth > 0.04).astype(float)).filter(ImageFilter.MaxFilter(9))) > 0
lum = np.where(spark, smooth, lum)[..., None]
# The shading kept round its mean, laid on the pale tone.
mean = (lum * alpha).sum() / alpha.sum()
shade = np.clip(TONE + (lum - mean) * 1.2, 0, 1)
Image.fromarray((np.concatenate([shade, alpha], -1) * 255).round().astype("uint8")).save(
    os.path.join(LEARN, "star-empty.png"), optimize=True)
