"""Gives a cut-out animal a second coat for the review's Sort (a dog is a
dog in any colour): its blue becomes `colour`, keeping each pixel's light
and shade — mixed in, never a hue turned part way (that passes through
green where blue meets pink). Its pinks, whites and dark eyes stay.
Usage: coat.py in.png out.png [hex colour]"""
import sys
import numpy as np
from PIL import Image

src, dst = sys.argv[1:3]
colour = np.array([int((sys.argv[3] if len(sys.argv) > 3 else "e9b47a")[i:i + 2], 16) for i in (0, 2, 4)], np.float32) / 255

img = Image.open(src).convert("RGBA")
px = np.asarray(img).astype(np.float32) / 255
rgb = px[..., :3]
hsv = np.asarray(img.convert("RGB").convert("HSV")).astype(np.float32) / 255
h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
# How blue each pixel is: its hue near 205°, coloured enough to have one,
# light enough not to be an eye.
d = np.abs(((h - 205 / 360) + 0.5) % 1 - 0.5) * 360
blue = np.clip((54 - d) / 12, 0, 1) * np.clip((s - 0.04) / 0.06, 0, 1) * np.clip((v - 0.4) / 0.15, 0, 1)
# The coat's light and shade: each pixel's lightness against the blue's own.
lum = rgb @ np.array([0.3, 0.59, 0.11], np.float32)
ref = np.median(lum[blue > 0.8]) if (blue > 0.8).any() else 0.7
coat = np.clip(colour[None, None, :] * (lum / ref)[..., None], 0, 1)
# The blue comes out first (to its grey), then the coat goes in over the
# grey: blue and caramel never mix into green.
grey = np.repeat(lum[..., None], 3, 2)
plain = rgb * (1 - blue[..., None]) + grey * blue[..., None]
px[..., :3] = plain * (1 - blue[..., None]) + coat * blue[..., None]
Image.fromarray((px * 255 + 0.5).astype(np.uint8), "RGBA").save(dst)
