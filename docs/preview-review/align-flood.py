"""Normalise every flood image so all faces are the same size and position.

    python docs/preview-review/align-flood.py

The hook cycles a new face every 2-3 frames. If head size and position drift
between images the montage reads as jumpy and out of ratio — the faces have to
land in the same place or the eye tracks the jump instead of the change.

Two fixes at once:

  1. Head width and head-top row are normalised across ALL images (not just
     within a before/after pair), using the flat studio backdrop to find the
     subject — the same method as align.py.
  2. Output keeps the sources' 3:4 shape. The Flood component shows it
     `contain`ed over a blurred copy of itself, so the phone screen is filled
     without inventing image that was never photographed.

Where a source does not cover the frame, its edge pixels are replicated
outward. A flat fill leaves a visible rectangle because these backdrops are
vignetted rather than truly flat — edge replication continues the gradient.
"""
from PIL import Image
import numpy as np
import os

P = "public/portraits/"
SRC = P + "_flood-src/"

# 3:4, the sources' own shape. Do NOT use the phone's 9:16 here: these are
# head-and-shoulders portraits, and no single head size makes every source
# cover a 9:16 frame — a tight headshot has almost nothing below the chin.
# Forcing it padded half the frame with replicated turtleneck. The Flood
# component fills the phone with a blurred copy behind instead.
W, H = 760, 1004
HEAD_W = 560              # 74% of frame width; covers most sources outright
HEAD_TOP = 150
HEAD_CX = W // 2

PAIRS = [
    ("01", SRC + "flood00-before.png", SRC + "flood00-after.png"),
    ("02", P + "hero-before.png",      P + "hero-advisor.png"),
    ("03", P + "front-before.png",     P + "front-after.png"),
    ("08", P + "flood 8 before.png",   P + "flood8 after.png"),
    ("09", P + "flood 9 before.png",   P + "flood 9 after.png"),
]
SINGLES = [("10", P + "flood10.png")]


def metrics(im):
    a = np.asarray(im.convert("RGB")).astype(np.float32)
    h, w, _ = a.shape
    corners = np.concatenate([a[:40, :40].reshape(-1, 3), a[:40, -40:].reshape(-1, 3)])
    bg = np.median(corners, axis=0)
    mask = np.linalg.norm(a - bg, axis=2) > 28
    rows = mask.sum(axis=1)
    top = int(np.argmax(rows > 0.015 * w))
    bot = h - 1 - int(np.argmax(rows[::-1] > 0.015 * w))
    lo, hi = top, top + max(4, int(0.32 * (bot - top)))
    widths, centres = [], []
    for r in range(lo, hi):
        idx = np.where(mask[r])[0]
        if idx.size:
            widths.append(idx[-1] - idx[0])
            centres.append(0.5 * (idx[-1] + idx[0]))
    return top, float(np.median(centres)), float(np.percentile(widths, 92)), bg


def place(src, dst):
    im = Image.open(src).convert("RGB")
    top, cx, hw, bg = metrics(im)
    s = HEAD_W / hw
    r = np.asarray(im.resize(
        (max(1, int(round(im.width * s))), max(1, int(round(im.height * s)))),
        Image.LANCZOS))
    h, w, _ = r.shape
    ox = int(round(HEAD_CX - cx * s))
    oy = int(round(HEAD_TOP - top * s))
    pad_t, pad_l = max(0, oy), max(0, ox)
    pad_b, pad_r = max(0, H - oy - h), max(0, W - ox - w)
    padded = np.pad(r, ((pad_t, pad_b), (pad_l, pad_r), (0, 0)), mode="edge")
    y0, x0 = -oy + pad_t, -ox + pad_l
    Image.fromarray(padded[y0:y0 + H, x0:x0 + W]).save(dst)
    return hw, s


print(f"target: {W}x{H}, head {HEAD_W}px wide, head-top y={HEAD_TOP}\n")
for tag, b, a in PAIRS:
    for path, suffix in ((b, "b"), (a, "a")):
        if not os.path.exists(path):
            print(f"  MISSING {path}")
            continue
        hw, s = place(path, f"{P}flood-{tag}{suffix}.png")
        print(f"  flood-{tag}{suffix}  src head {hw:6.1f}px  scale {s:5.3f}")
for tag, path in SINGLES:
    hw, s = place(path, f"{P}flood-{tag}.png")
    print(f"  flood-{tag}   src head {hw:6.1f}px  scale {s:5.3f}")
