"""Removes the dark brushed background from the supplied logo, keeping the silver artwork.

How it works (so it can be repeated on a new logo file):
1. Crop to the artwork plus a small margin.
2. Measure brightness. The background is near-black (under ~21 of 255); the silver art is mostly 60+.
3. Build transparency with a soft ramp between those levels, so edges stay smooth instead of jagged.
4. Keep only large solid shapes so background scratches disappear.
5. "Un-mix" the dark background from semi-transparent edge pixels so no dark halo remains.
6. Save PNG and WebP with transparency.
Usage: python3 scripts/cutout-logo.py public/brand/primed-real-estate-logo-original.png public/brand
"""
import sys
import numpy as np
from PIL import Image

src, outdir = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
a = np.asarray(im).astype(np.float32)
lum = a.mean(axis=2)

LOW, HIGH = 24.0, 58.0          # brightness ramp: below LOW = background, above HIGH = artwork
BG = np.array([7.0, 7.0, 8.0])  # measured background colour

alpha = np.clip((lum - LOW) / (HIGH - LOW), 0, 1)

# Keep only large solid shapes (house, letters, wordmark). The brushed-metal scratches in the
# background are thin streaks: they form small or sparse regions and are dropped here.
from scipy import ndimage
solid = ndimage.binary_opening(lum > 50, structure=np.ones((5, 5)))      # removes 1-4px streaks
labels, n = ndimage.label(ndimage.binary_dilation(solid, iterations=3))
sizes = ndimage.sum(np.ones_like(lum), labels, range(1, n + 1))
keep_ids = [i + 1 for i, sz in enumerate(sizes) if sz > 1500]
region = np.isin(labels, keep_ids)
# The wordmark band ("PRIMED REAL ESTATE") has no scratches but thin letters such as "I",
# so every bright pixel there is kept.
WORDMARK_TOP = 750  # row in the original 1920x1080 file where the wordmark band begins
region[WORDMARK_TOP:, :] |= lum[WORDMARK_TOP:, :] > LOW
region = ndimage.binary_dilation(region, iterations=4)  # small halo for soft edges
alpha = alpha * ndimage.gaussian_filter(region.astype(np.float32), 1.2)
alpha = alpha * alpha * (3 - 2 * alpha)  # smoothstep for soft edges
safe = np.maximum(alpha, 1e-3)[..., None]
rgb = np.clip((a - (1 - safe) * BG) / safe, 0, 255)
rgba = np.dstack([rgb, alpha * 255]).astype(np.uint8)
out = Image.fromarray(rgba, "RGBA")

# Crop to the visible artwork with a small margin.
ys, xs = np.where(alpha > 0.04)
pad = 12
box = (max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + pad, out.width), min(ys.max() + pad, out.height))
out = out.crop(box)
out.save(f"{outdir}/logo-cutout.png", optimize=True)
for w in (180, 360, 720):
    h = round(out.height * w / out.width)
    out.resize((w, h), Image.LANCZOS).save(f"{outdir}/logo-cutout-{w}.webp", quality=92, method=6)
print("size", out.size, "box", box)
