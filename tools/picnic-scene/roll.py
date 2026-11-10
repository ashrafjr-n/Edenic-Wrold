"""Seasons lessons 1-4: the weather rolls in on the same island (2026-11-10).

After the season's spelling the camera walks BACK from the letter blocks to the word view while the
season's look dissolves into its weather's (the same camera path was rendered for both, `render.cjs
seasons <n> <n+4>`). Writes `world/<n>/<frame>/roll.mp4`, which lands sharp on the weather's word step.
Run from the repo root: python3 tools/picnic-scene/roll.py"""
import os, subprocess, tempfile, zlib
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
BLUR = 0.009
smooth = lambda a, b, t: (lambda x: x * x * (3 - 2 * x))(min(1, max(0, (t - a) / (b - a))))

for n in range(1, 5):
    for frame in ("landscape", "portrait"):
        season, weather = (os.path.join(HERE, "out", f"seasons-{k}-{frame}", "m1") for k in (n, n + 4))
        names = sorted(os.listdir(season))[::-1]
        to = os.path.join(ROOT, "public/assets/learn/bloo/seasons-weather/world", str(n), frame)
        with tempfile.TemporaryDirectory() as tmp:
            for k, name in enumerate(names):
                t = k / (len(names) - 1)
                a, b = Image.open(f"{season}/{name}").convert("RGB"), Image.open(f"{weather}/{name}").convert("RGB")
                img = Image.blend(a, b, smooth(0.35, 0.65, t))
                s = BLUR * (1 - smooth(0.0, 0.45, t)) * max(img.size)  # blurred at the spelling, sharp for the word
                (img if s < 0.3 else img.filter(ImageFilter.GaussianBlur(s))).save(f"{tmp}/{k:04d}.png")
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", "30", "-i", f"{tmp}/%04d.png", "-c:v", "libx264",
                            "-preset", "slow", "-crf", "25", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", f"{to}/roll.mp4"], check=True)
        print(n, frame, zlib.crc32(open(f"{to}/roll.mp4", "rb").read()))
