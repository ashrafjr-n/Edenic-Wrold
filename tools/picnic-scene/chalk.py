"""Chalk for Pinki's board (2026-10-14), into
`public/assets/learn/pinki/classroom/`:

- `chalk-frame.png`, `chalk-frame-pink.png`, `chalk-frame-dashed.png` — a
  rounded box drawn in chalk, a 9-slice image for CSS `border-image`: white,
  pink (the next course or lesson), dashed (a locked one). The line runs
  MARGIN in from the edge with round corners of RADIUS; CSS slices it at 80
  (the corners) and repeats the edges between.
- `chalk-grain.png` — a tile of chalk's grain, for a `mask-image` over what
  is written on the board (the slate shows through in specks).
- `chalk-arrow.png` — a curved arrow in yellow chalk, at the next course.
- `chalk-smudge.png` — the faint arcs a board eraser leaves.

    python3 tools/picnic-scene/chalk.py
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
WHITE, PINK, YELLOW = (247, 243, 233), (255, 176, 212), (255, 224, 138)


def chalk_line(alpha, pts, width, rng, strength=0.5, spread=0.17):
    """Rubs chalk along `pts` — (x, y, normal x, normal y), already in drawn
    pixels — into `alpha`: overlapping soft dots scattered across the line,
    the hand's pressure and the line itself drifting a little."""
    drift = rng.uniform(0, math.tau, 3)
    for i, (x, y, nx, ny) in enumerate(pts):
        pressure = 0.78 + 0.22 * math.sin(i / 90 + drift[0]) * math.sin(i / 37 + drift[1])
        wobble = 0.9 * SS * math.sin(i / 55 + drift[2])
        for _ in range(3):
            off = rng.normal(0, spread) * width + wobble
            cx, cy = x + nx * off, y + ny * off
            r = width * rng.uniform(0.22, 0.36)
            x0, x1 = max(0, int(cx - r - 1)), min(alpha.shape[1], int(cx + r + 2))
            y0, y1 = max(0, int(cy - r - 1)), min(alpha.shape[0], int(cy + r + 2))
            if x1 <= x0 or y1 <= y0:
                continue
            yy, xx = np.mgrid[y0:y1, x0:x1]
            dot = np.clip(r - np.hypot(xx - cx, yy - cy), 0, 1) * strength * pressure
            alpha[y0:y1, x0:x1] = 1 - (1 - alpha[y0:y1, x0:x1]) * (1 - dot)


def grained(alpha, rng, amount=0.32):
    """Chalk skips over the board's tooth, leaving specks of slate."""
    noise = Image.fromarray((rng.random(alpha.shape) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(SS * 0.6))
    g = np.asarray(noise).astype(np.float32) / 255
    g = (g - g.mean()) / g.std()
    return alpha * np.clip(0.9 + amount * g, 0, 1)


def image(alpha, color, size):
    rgba = np.zeros((*alpha.shape, 4), np.uint8)
    rgba[..., :3] = color
    rgba[..., 3] = np.clip(alpha * 255, 0, 255).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA").resize(size, Image.LANCZOS)


def box_path(step):
    """Points round the rounded box (frame pixels, `step` apart): (x, y,
    normal x, normal y, the coordinate along an edge for dashes, which part)."""
    a, b, r = MARGIN, N - MARGIN, RADIUS
    pts = []

    def line(x0, y0, x1, y1, nx, ny):
        length = math.hypot(x1 - x0, y1 - y0)
        for k in range(int(length / step)):
            t = k * step / length
            x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            pts.append((x, y, nx, ny, x if ny else y, "edge"))

    def arc(cx, cy, a0):
        for k in range(int((math.pi / 2) * r / step)):
            th = a0 + k * step / r
            pts.append((cx + math.cos(th) * r, cy + math.sin(th) * r, math.cos(th), math.sin(th), 0, "corner"))

    line(a + r, a, b - r, a, 0, -1)
    arc(b - r, a + r, -math.pi / 2)
    line(b, a + r, b, b - r, 1, 0)
    arc(b - r, b - r, 0)
    line(b - r, b, a + r, b, 0, 1)
    arc(a + r, b - r, math.pi / 2)
    line(a, b - r, a, a + r, -1, 0)
    arc(a + r, a + r, math.pi)
    return pts


def frame(color, dashed=False, seed=1):
    rng = np.random.default_rng(seed)
    alpha = np.zeros((N * SS, N * SS), np.float32)
    pts = [
        (x * SS, y * SS, nx, ny)
        for x, y, nx, ny, along, part in box_path(0.5)
        if not (dashed and part == "edge" and ((along - MARGIN - RADIUS) % (DASH + GAP)) > DASH)
    ]
    chalk_line(alpha, pts, WIDTH * SS, rng)
    return image(grained(alpha, rng), color, (N, N))


def curve(points, step=0.5):
    """A Catmull-Rom curve through `points`, `step` apart, with normals."""
    p = [points[0], *points, points[-1]]
    out = []
    for i in range(1, len(p) - 2):
        (x0, y0), (x1, y1), (x2, y2), (x3, y3) = p[i - 1], p[i], p[i + 1], p[i + 2]
        n = int(math.hypot(x2 - x1, y2 - y1) / step) + 1
        for k in range(n):
            t = k / n
            t2, t3 = t * t, t * t * t
            x = 0.5 * (2 * x1 + (-x0 + x2) * t + (2 * x0 - 5 * x1 + 4 * x2 - x3) * t2 + (-x0 + 3 * x1 - 3 * x2 + x3) * t3)
            y = 0.5 * (2 * y1 + (-y0 + y2) * t + (2 * y0 - 5 * y1 + 4 * y2 - y3) * t2 + (-y0 + 3 * y1 - 3 * y2 + y3) * t3)
            out.append((x, y))
    pts = []
    for i, (x, y) in enumerate(out):
        x2, y2 = out[min(i + 1, len(out) - 1)]
        x1, y1 = out[max(i - 1, 0)]
        length = math.hypot(x2 - x1, y2 - y1) or 1
        pts.append((x, y, -(y2 - y1) / length, (x2 - x1) / length))
    return pts


def arrow(seed=11):
    """A loose curved arrow, down and to the right, its head at the end."""
    W, H = 220, 150
    rng = np.random.default_rng(seed)
    alpha = np.zeros((H * SS, W * SS), np.float32)
    s = lambda pts: [(x * SS, y * SS) for x, y in pts]
    chalk_line(alpha, curve(s([(22, 28), (70, 22), (132, 46), (176, 104)])), 8 * SS, rng)
    chalk_line(alpha, curve(s([(178, 108), (150, 98)])), 8 * SS, rng)
    chalk_line(alpha, curve(s([(178, 108), (184, 78)])), 8 * SS, rng)
    return image(grained(alpha, rng), YELLOW, (W, H))


def grain_tile(seed=13, size=256):
    """Mostly solid, with specks and streaks where the chalk skipped. Tiles:
    the noise is blurred with wrap-around."""
    rng = np.random.default_rng(seed)
    g = rng.random((size, size)).astype(np.float32)
    for _ in range(3):
        g = (g + np.roll(g, 1, 0) + np.roll(g, -1, 0) + np.roll(g, 1, 1) + np.roll(g, -1, 1)) / 5
    g = (g - g.mean()) / g.std()
    alpha = np.clip(0.95 + 0.42 * g, 0.25, 1)
    rgba = np.zeros((size, size, 4), np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = (alpha * 255).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA")


def smudge(seed=17):
    """A board wiped with an eraser: a few wide, very faint arcs."""
    W, H = 800, 500
    rng = np.random.default_rng(seed)
    alpha = np.zeros((H * 2, W * 2), np.float32)
    for cx, cy, r, a0, a1 in [(150, 560, 420, -1.3, -0.4), (700, -80, 380, 1.9, 2.8), (420, 640, 300, -2.6, -1.9)]:
        pts = []
        for k in range(int((a1 - a0) * r / 1.5)):
            th = a0 + k * 1.5 / r
            pts.append((2 * (cx + math.cos(th) * r), 2 * (cy + math.sin(th) * r), math.cos(th), math.sin(th)))
        chalk_line(alpha, pts, 240, rng, strength=0.05, spread=0.3)
    # Barely there: a trace of chalk dust, never a mark.
    alpha = alpha / alpha.max() * 0.09
    return image(alpha, WHITE, (W // 2, H // 2)).filter(ImageFilter.GaussianBlur(4))


if __name__ == "__main__":
    os.makedirs(DEST, exist_ok=True)
    save = lambda img, name: img.save(os.path.join(DEST, name), optimize=True)
    save(frame(WHITE, seed=3), "chalk-frame.png")
    save(frame(PINK, seed=5), "chalk-frame-pink.png")
    save(frame(WHITE, dashed=True, seed=7), "chalk-frame-dashed.png")
    save(grain_tile(), "chalk-grain.png")
    save(arrow(), "chalk-arrow.png")
    save(smudge(), "chalk-smudge.png")
