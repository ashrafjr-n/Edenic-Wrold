"""Chalk for Pinki's board (2026-10-14), into
`public/assets/learn/pinki/classroom/`:

- `chalk-frame.png`, `chalk-frame-pink.png`, `chalk-frame-dashed.png` — a
  rounded box drawn in chalk, a 9-slice image for CSS `border-image`: white,
  pink (the next course or lesson), dashed (a locked one). The line runs
  MARGIN in from the edge with round corners of RADIUS; CSS slices it at 80
  (the corners) and repeats the edges between.
- `chalk-grain.png` — a tile of chalk's grain, for a `mask-image` over what
  is written on the board (the slate shows through in specks).
- `chalk-smudge.png` — the faint arcs a board eraser leaves.
- `chalk-star.png`, `chalk-heart.png`, `chalk-sun.png`, `chalk-smile.png`,
  `chalk-burst.png`, `chalk-underline.png` — doodles drawn by hand round the
  hub's cards, and the line under "You can do it!".

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
WHITE, PINK = (247, 243, 233), (255, 176, 212)


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


def frame(color, dashed=False, seed=1, strength=0.5, width=WIDTH):
    rng = np.random.default_rng(seed)
    alpha = np.zeros((N * SS, N * SS), np.float32)
    pts = [
        (x * SS, y * SS, nx, ny)
        for x, y, nx, ny, along, part in box_path(0.5)
        if not (dashed and part == "edge" and ((along - MARGIN - RADIUS) % (DASH + GAP)) > DASH)
    ]
    chalk_line(alpha, pts, width * SS, rng, strength=strength)
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


YELLOW, MINT = (255, 224, 138), (182, 240, 200)


def hand(points, rng, amount):
    """A hand never draws the planned line: each point drifts a little."""
    return [(x + rng.normal(0, amount), y + rng.normal(0, amount)) for x, y in points]


def stroke(alpha, points, rng, width=9, strength=0.55, wobble=2.2):
    """One stroke of the chalk through `points` (doodle pixels)."""
    pts = [(x * SS, y * SS) for x, y in hand(points, rng, wobble)]
    chalk_line(alpha, curve(pts), width * SS, rng, strength=strength)


def edge(alpha, a, b, rng, over=0.06, bow=3.0, **kw):
    """A straight-ish line from a to b as a hand pulls it: a slight bow,
    running a little past both ends (the corners overlap, as drawn)."""
    (x0, y0), (x1, y1) = a, b
    dx, dy = x1 - x0, y1 - y0
    length = math.hypot(dx, dy) or 1
    nx, ny = -dy / length, dx / length
    k = rng.uniform(-1, 1) * bow
    pts = [(x0 - dx * over, y0 - dy * over), (x0 + dx * 0.5 + nx * k, y0 + dy * 0.5 + ny * k), (x1 + dx * over, y1 + dy * over)]
    stroke(alpha, pts, rng, **kw)


def ring_pts(cx, cy, rx, ry, a0=0.0, a1=math.tau, n=28):
    return [(cx + math.cos(a0 + (a1 - a0) * k / n) * rx, cy + math.sin(a0 + (a1 - a0) * k / n) * ry) for k in range(n + 1)]


def doodle(kind, seed):
    """Doodles a child's teacher draws round the cards: rubbed chalk, each
    stroke drawn by hand (drifting, overshooting, a second pass where a
    hand would go over it again) — never a clean icon."""
    rng = np.random.default_rng(seed)
    W = H = 200
    alpha = np.zeros((H * SS, W * SS), np.float32)
    if kind == "star":
        # Its outline, edge by edge, then a quicker second pass.
        tips = [(100 + math.cos(-math.pi / 2 + k * math.pi / 5) * (84 if k % 2 == 0 else 36), 108 + math.sin(-math.pi / 2 + k * math.pi / 5) * (84 if k % 2 == 0 else 36)) for k in range(11)]
        for k in range(10):
            edge(alpha, tips[k], tips[k + 1], rng, bow=1.5)
        for k in range(10):
            edge(alpha, tips[k], tips[k + 1], rng, width=6, strength=0.3, over=0.02, bow=1.5)
    elif kind == "heart":
        left = [(100, 170), (58, 128), (28, 86), (34, 50), (64, 34), (92, 50), (100, 66)]
        right = [(100, 66), (110, 48), (138, 34), (168, 50), (172, 88), (142, 128), (100, 170)]
        stroke(alpha, left, rng)
        stroke(alpha, right, rng)
        # Scribbled in, as a child's teacher fills one.
        for k in range(9):
            y = 58 + k * 12
            half = 62 * math.sqrt(max(0.0, 1 - ((y - 70) / 108) ** 2)) - k * 4
            stroke(alpha, [(100 - half + 6, y + 10), (100 + half - 6, y - 10)], rng, width=7, strength=0.32, wobble=2.5)
    elif kind == "sun":
        stroke(alpha, ring_pts(100, 100, 46, 44, -0.4, math.tau - 0.1), rng)
        for k in range(9):
            a = k * math.tau / 9 + rng.uniform(-0.12, 0.12)
            r0, r1 = 60, 60 + rng.uniform(22, 32)
            stroke(alpha, [(100 + math.cos(a) * r0, 100 + math.sin(a) * r0), (100 + math.cos(a) * r1, 100 + math.sin(a) * r1)], rng, width=8)
        for ex in (84, 116):
            stroke(alpha, [(ex - 2, 88), (ex + 2, 94)], rng, width=10, wobble=0.6)
        stroke(alpha, ring_pts(100, 104, 20, 16, 0.35, math.pi - 0.35, 12), rng, width=8)
    elif kind == "smile":
        stroke(alpha, ring_pts(100, 100, 74, 72, -0.6, math.tau - 0.25), rng)
        for ex in (74, 126):
            stroke(alpha, [(ex, 76), (ex + 1, 92)], rng, width=10, wobble=0.6)
        stroke(alpha, ring_pts(100, 108, 40, 32, 0.3, math.pi - 0.3, 14), rng)
    elif kind == "burst":
        # Three quick dashes, the "look here" marks.
        for a, r0 in ((-2.3, 40), (-1.6, 34), (-0.9, 40)):
            stroke(alpha, [(100 + math.cos(a) * r0, 150 + math.sin(a) * r0), (100 + math.cos(a) * (r0 + 70), 150 + math.sin(a) * (r0 + 70))], rng, width=9)
    return image(grained(alpha, rng), {"star": YELLOW, "heart": PINK, "sun": WHITE, "smile": WHITE, "burst": YELLOW}[kind], (W, H))


def underline(seed=23):
    """A long hand-pulled line under a cheer, a little wavy, darting up at
    its end."""
    rng = np.random.default_rng(seed)
    W, H = 600, 60
    alpha = np.zeros((H * SS, W * SS), np.float32)
    stroke(alpha, [(14, 38), (160, 31), (330, 34), (480, 27), (586, 18)], rng, width=10, wobble=1.5)
    stroke(alpha, [(60, 44), (260, 39), (440, 36)], rng, width=6, strength=0.25, wobble=1.5)
    return image(grained(alpha, rng), YELLOW, (W, H))


def grain_tile(seed=13, size=256):
    """Mostly solid, with specks and streaks where the chalk skipped. Tiles:
    the noise is blurred with wrap-around."""
    rng = np.random.default_rng(seed)
    g = rng.random((size, size)).astype(np.float32)
    for _ in range(3):
        g = (g + np.roll(g, 1, 0) + np.roll(g, -1, 0) + np.roll(g, 1, 1) + np.roll(g, -1, 1)) / 5
    g = (g - g.mean()) / g.std()
    alpha = np.clip(1.06 + 0.22 * g, 0.65, 1)
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
    alpha = alpha / alpha.max() * 0.05
    return image(alpha, WHITE, (W // 2, H // 2)).filter(ImageFilter.GaussianBlur(4))


if __name__ == "__main__":
    os.makedirs(DEST, exist_ok=True)
    save = lambda img, name: img.save(os.path.join(DEST, name), optimize=True)
    # Light, so a box never competes with what is in it; the next one's pink
    # stays the strongest line on the board.
    save(frame(WHITE, seed=3, strength=0.26, width=6), "chalk-frame.png")
    save(frame(PINK, seed=5, strength=0.45, width=6.5), "chalk-frame-pink.png")
    save(frame(WHITE, dashed=True, seed=7, strength=0.2, width=5.5), "chalk-frame-dashed.png")
    save(grain_tile(), "chalk-grain.png")
    save(smudge(), "chalk-smudge.png")
    # The doodles round the hub's cards, and the cheer's underline.
    for kind, seed in (("star", 31), ("heart", 37), ("sun", 41), ("smile", 43), ("burst", 47)):
        save(doodle(kind, seed), f"chalk-{kind}.png")
    save(underline(), "chalk-underline.png")
