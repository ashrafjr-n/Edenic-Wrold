"""Chalk frames for Pinki's board (2026-10-14): a rounded box drawn in chalk,
as a 9-slice image for CSS `border-image` — rough edges, uneven pressure,
grain — so a course panel or a lesson's box on the board looks drawn, not
ruled. Three: white (`chalk-frame.png`), pink (`chalk-frame-pink.png`, the
next course or lesson) and dashed (`chalk-frame-dashed.png`, a locked one),
into `public/assets/learn/pinki/classroom/`.

    python3 tools/picnic-scene/chalk.py

The frame is N px square: the line runs MARGIN in from the edge, round
corners of RADIUS; CSS slices it at SLICE (the corners) and stretches the
edges between, so the grain on a long edge drags out along it, as chalk
does.
"""
import math
import os
import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(__file__)
DEST = os.path.join(HERE, "../../public/assets/learn/pinki/classroom")
N, MARGIN, RADIUS, WIDTH = 320, 24, 46, 7.5
SS = 3  # drawn this many times larger, then shrunk: smooth, not jagged
DASH, GAP = 18, 10


def path(n, margin, radius, step):
    """Points round the rounded box, `step` apart: (x, y, normal x, normal y,
    the coordinate along the edge for dashes, which part)."""
    a, b = margin, n - margin
    pts = []

    def line(x0, y0, x1, y1, nx, ny, part):
        length = math.hypot(x1 - x0, y1 - y0)
        for k in range(int(length / step)):
            t = k * step / length
            x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            pts.append((x, y, nx, ny, x if ny else y, part))

    def arc(cx, cy, a0, part):
        for k in range(int((math.pi / 2) * radius / step)):
            th = a0 + k * step / radius
            pts.append((cx + math.cos(th) * radius, cy + math.sin(th) * radius, math.cos(th), math.sin(th), k * step, part))

    line(a + radius, a, b - radius, a, 0, -1, "edge")
    arc(b - radius, a + radius, -math.pi / 2, "corner")
    line(b, a + radius, b, b - radius, 1, 0, "edge")
    arc(b - radius, b - radius, 0, "corner")
    line(b - radius, b, a + radius, b, 0, 1, "edge")
    arc(a + radius, b - radius, math.pi / 2, "corner")
    line(a, b - radius, a, a + radius, -1, 0, "edge")
    arc(a + radius, a + radius, math.pi, "corner")
    return pts


def frame(color, dashed=False, seed=1):
    rng = np.random.default_rng(seed)
    size = N * SS
    alpha = np.zeros((size, size), np.float32)
    yy, xx = np.mgrid[0:size, 0:size]
    w = WIDTH * SS
    # The hand's pressure drifts slowly round the box.
    drift = rng.uniform(0, math.tau, 3)
    pts = path(N, MARGIN, RADIUS, 0.5)
    for i, (x, y, nx, ny, along, part) in enumerate(pts):
        if dashed and part == "edge" and ((along - MARGIN - RADIUS) % (DASH + GAP)) > DASH:
            continue
        pressure = 0.78 + 0.22 * math.sin(i / 90 + drift[0]) * math.sin(i / 37 + drift[1])
        wobble = 0.9 * math.sin(i / 55 + drift[2])
        for _ in range(3):
            off = rng.normal(0, 0.17) * w + wobble * SS
            cx, cy = (x + nx * off / SS) * SS, (y + ny * off / SS) * SS
            r = w * rng.uniform(0.22, 0.36)
            x0, x1 = int(cx - r - 1), int(cx + r + 2)
            y0, y1 = int(cy - r - 1), int(cy + r + 2)
            d = np.hypot(xx[y0:y1, x0:x1] - cx, yy[y0:y1, x0:x1] - cy)
            dot = np.clip(r - d, 0, 1) * 0.5 * pressure
            alpha[y0:y1, x0:x1] = 1 - (1 - alpha[y0:y1, x0:x1]) * (1 - dot)
    # Grain: chalk skips over the board's tooth, leaving specks of slate.
    grain = Image.fromarray((rng.random((size, size)) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(SS * 0.6))
    g = np.asarray(grain).astype(np.float32) / 255
    g = (g - g.mean()) / g.std()
    alpha *= np.clip(0.9 + 0.32 * g, 0, 1)
    rgba = np.zeros((size, size, 4), np.uint8)
    rgba[..., :3] = color
    rgba[..., 3] = np.clip(alpha * 255, 0, 255).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA").resize((N, N), Image.LANCZOS)


if __name__ == "__main__":
    os.makedirs(DEST, exist_ok=True)
    frame((247, 243, 233), seed=3).save(os.path.join(DEST, "chalk-frame.png"), optimize=True)
    frame((255, 176, 212), seed=5).save(os.path.join(DEST, "chalk-frame-pink.png"), optimize=True)
    frame((247, 243, 233), dashed=True, seed=7).save(os.path.join(DEST, "chalk-frame-dashed.png"), optimize=True)
    print("slice at", MARGIN + RADIUS + 10, "px; the line is", MARGIN, "px in")
