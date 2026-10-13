"""
Renders the site's silver-on-black background art (public/images/bg-*.webp).

These are computer-rendered abstract images, made so the site isn't bare before real photography
exists. Replace any of them with your own AI-generated or licensed photo by saving a file with the
same name (16:9, at least 2400 px wide, dark overall). See docs/IMAGE-GUIDE.md.

Usage: python3 scripts/render-backgrounds.py public/images
Requires: numpy, scipy, Pillow
"""
import sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

W, H = 2400, 1350
OUT = sys.argv[1] if len(sys.argv) > 1 else "public/images"
rng = np.random.default_rng(7)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
SILVER = np.array([0.80, 0.83, 0.88], np.float32)


def base(cx=0.7, cy=0.25, lift=0.10):
    """Gradient black with a faint cool silver glow."""
    d = np.hypot((xx - cx * W) / W, (yy - cy * H) / H)
    g = lift * np.exp(-(d / 0.55) ** 2) + 0.018 * (1 - yy / H)
    return g


def seg_dist(px, py, ax, ay, bx, by):
    vx, vy = bx - ax, by - ay
    t = np.clip(((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy + 1e-6), 0, 1)
    return np.hypot(px - (ax + t * vx), py - (ay + t * vy))


def lines(polys, widths, gains):
    L = np.zeros((H, W), np.float32)
    for pts, w, g in zip(polys, widths, gains):
        xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
        x0, x1 = int(max(0, min(xs) - 40)), int(min(W, max(xs) + 40))
        y0, y1 = int(max(0, min(ys) - 40)), int(min(H, max(ys) + 40))
        if x1 <= x0 or y1 <= y0:
            continue
        px, py = xx[y0:y1, x0:x1], yy[y0:y1, x0:x1]
        d = np.full(px.shape, 1e9, np.float32)
        for (ax, ay), (bx, by) in zip(pts[:-1], pts[1:]):
            d = np.minimum(d, seg_dist(px, py, ax, ay, bx, by))
        L[y0:y1, x0:x1] = np.maximum(L[y0:y1, x0:x1], g * np.clip(1 - d / w, 0, 1))
    return L


def bloom(L, *sig):
    out = L.copy()
    for s, a in sig:
        out += a * gaussian_filter(L, s)
    return out


def finish(lum, name, tint=SILVER, grain=0.012, vignette=0.55):
    v = 1 - vignette * (np.hypot((xx / W - 0.5) * 1.2, (yy / H - 0.5) * 1.4) ** 2)
    lum = np.clip(lum * v, 0, None)
    lum = lum / (1 + lum)  # soft tone map
    lum += rng.normal(0, grain, lum.shape).astype(np.float32)
    rgb = np.clip(lum[..., None] * tint[None, None, :] * 1.15, 0, 1)
    Image.fromarray((rgb * 255).astype(np.uint8)).save(f"{OUT}/{name}.webp", quality=82, method=6)
    print("wrote", name)


def roofline():
    """Nested gables receding into the dark, echoing the logo's roof."""
    cx, cy = 0.70 * W, 0.62 * H
    polys, widths, gains = [], [], []
    for k in range(14):
        s = 0.06 * 1.32 ** k * H
        pts = [(-1.15, 0.9), (-1.15, -0.05), (0, -0.95), (1.15, -0.05), (1.15, 0.9)]
        polys.append([(cx + x * s, cy + y * s) for x, y in pts])
        widths.append(1.2 + 0.35 * k ** 0.8)
        gains.append(0.25 + 0.75 * np.exp(-((k - 6.5) / 4.0) ** 2))
    L = lines(polys, widths, gains)
    sweep = 0.35 + 0.9 * np.exp(-(((xx - W * 0.8) * 0.6 + (yy - H * 0.1)) / (0.35 * W)) ** 2)
    L = bloom(L * sweep, (3, 0.9), (18, 0.6), (70, 0.5))
    floor = np.clip((yy - cy - 0.3 * H) / (0.4 * H), 0, 1)
    finish(base(0.72, 0.35, 0.16) + L * (1 - 0.7 * floor), "bg-roofline")


def brushed():
    n = rng.normal(0, 1, (H, W)).astype(np.float32)
    n = gaussian_filter(n, (0.6, 90))
    n = (n - n.min()) / (n.max() - n.min())
    band = np.exp(-(((xx - W * 0.55) + (yy - H * 0.5) * 1.6) / (0.22 * W)) ** 2)
    lum = base(0.3, 0.2, 0.06) + 0.05 + 0.22 * n * (0.35 + band) + 0.18 * band
    finish(lum, "bg-brushed", grain=0.008)


def topo():
    f = np.zeros((H, W), np.float32)
    for _ in range(9):
        cx, cy, s, a = rng.uniform(0, W), rng.uniform(0, H), rng.uniform(250, 700), rng.uniform(-1, 1)
        f += a * np.exp(-(((xx - cx) ** 2 + (yy - cy) ** 2) / (2 * s * s)))
    f += 0.15 * np.sin(xx / 310) * np.cos(yy / 270)
    k = 16
    frac = np.abs(((f * k) % 1.0) - 0.5)
    gx, gy = np.gradient(f * k)
    width = np.hypot(gx, gy) * 1.3 + 1e-4
    line = np.clip(1 - (0.5 - frac) / width, 0, 1) ** 3
    major = (np.floor(f * k) % 5 == 0).astype(np.float32)
    L = line * (0.35 + 0.65 * major)
    light = 0.25 + np.exp(-(np.hypot(xx - W * 0.35, yy - H * 0.45) / (0.45 * W)) ** 2)
    L = bloom(L * light * 0.9, (2, 0.6), (25, 0.35))
    finish(base(0.35, 0.45, 0.10) + L, "bg-topo")


def skyline():
    """A city skyline at night in layers of haze, with silver rim light and sparse lit windows."""
    lum = base(0.55, 0.15, 0.20)
    haze = 0.10 * np.exp(-((yy - 0.62 * H) / (0.12 * H)) ** 2)
    lum += haze
    for layer, (top, hmin, hmax, shade, rim) in enumerate([(0.62, 0.05, 0.22, 0.045, 0.30), (0.70, 0.08, 0.30, 0.022, 0.45), (0.80, 0.10, 0.40, 0.006, 0.6)]):
        x = 0
        mask = np.zeros((H, W), np.float32)
        edge = np.zeros((H, W), np.float32)
        lit = np.zeros((H, W), np.float32)
        while x < W:
            bw = int(rng.uniform(60, 220) * (1 + layer * 0.4))
            bh = int(rng.uniform(hmin, hmax) * H)
            y0 = int(top * H) - bh
            mask[y0:, x:x + bw] = 1
            edge[y0:y0 + 2, x:x + bw] = rim
            edge[y0:, x:x + 2] = rim * 0.35
            if layer > 0:
                for _ in range(int(bw * bh / 9000)):
                    wx = x + int(rng.uniform(6, bw - 10)); wy = y0 + int(rng.uniform(8, bh))
                    if wy < H - 4:
                        lit[wy:wy + 4, wx:wx + 3] = rng.uniform(0.25, 0.9)
            x += bw + int(rng.uniform(0, 30))
        lum = lum * (1 - mask) + mask * (shade + lit * (0.6 + 0.4 * layer))
        lum += bloom(edge, (2, 0.8), (14, 0.5)) * (0.6 + 0.4 * np.exp(-((xx - 0.6 * W) / (0.35 * W)) ** 2))
        lum += gaussian_filter(lit, 6) * 0.6
    finish(lum, "bg-skyline", vignette=0.45)


def silk():
    L = np.zeros((H, W), np.float32)
    x = xx[0]
    for i in range(38):
        t = i / 37
        y = H * (0.25 + 0.5 * t) + 120 * np.sin(x / 520 + t * 2.6) + 70 * np.sin(x / 230 + t * 5.0 + 1.3)
        yi = np.clip(y.astype(int), 0, H - 1)
        for dy in (-1, 0, 1):
            L[np.clip(yi + dy, 0, H - 1), np.arange(W)] += 0.35 * (1 - abs(dy) * 0.5) * (0.4 + 0.6 * np.sin(np.pi * t))
    L = gaussian_filter(L, 0.8)
    sheen = 0.3 + np.exp(-((xx - W * 0.62) / (0.25 * W)) ** 2)
    L = bloom(L * sheen, (6, 0.8), (40, 0.6))
    finish(base(0.6, 0.5, 0.08) + L * 0.9, "bg-silk")


def beams():
    """Searchlight beams sweeping up into a black night sky through light haze."""
    lum = base(0.5, 1.0, 0.05)
    for (x0, ang, w, g) in [(0.18, -0.32, 0.035, 0.55), (0.42, 0.10, 0.03, 0.4), (0.78, 0.38, 0.04, 0.6), (0.62, -0.05, 0.022, 0.3)]:
        ox, oy = x0 * W, H * 1.05
        dx, dy = np.sin(ang), -np.cos(ang)
        rx, ry = xx - ox, yy - oy
        along = rx * dx + ry * dy
        across = np.abs(rx * dy - ry * dx)
        width = w * W * 0.15 + along * w * 1.1
        cone = np.exp(-(across / np.maximum(width, 1)) ** 2) * (along > 0)
        fade = np.exp(-along / (1.1 * H))
        lum += g * cone * fade
    haze = gaussian_filter(rng.normal(0, 1, (H // 8 + 1, W // 8 + 1)).astype(np.float32), 6)
    haze = np.kron(haze, np.ones((8, 8), np.float32))[:H, :W]
    lum *= 1 + 0.35 * haze
    lum += 0.06 * np.exp(-((yy - H) / (0.18 * H)) ** 2)
    finish(lum, "bg-beams", vignette=0.4)


def arcs():
    """Concentric silver arcs radiating from a corner, like machined metal."""
    cx, cy = 1.05 * W, -0.15 * H
    r = np.hypot(xx - cx, yy - cy)
    ring = np.abs(((r / 26.0) % 1.0) - 0.5)
    line = np.clip(1 - ring / 0.06, 0, 1)
    major = (np.floor(r / 26.0) % 6 == 0).astype(np.float32)
    ang = np.arctan2(yy - cy, xx - cx)
    sheen = 0.25 + np.exp(-((ang - 2.3) / 0.35) ** 2)
    L = line * (0.12 + 0.3 * major) * sheen * np.exp(-r / (1.3 * W))
    L = bloom(L, (2, 0.6), (30, 0.4))
    finish(base(0.9, 0.0, 0.08) + L, "bg-arcs", vignette=0.4)


# Pass names to render only some, e.g. `... public/images beams arcs`.
ALL = {f.__name__: f for f in (roofline, brushed, topo, skyline, silk, beams, arcs)}
for name in (sys.argv[2:] or list(ALL)):
    ALL[name]()
