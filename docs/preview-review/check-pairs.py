"""How visible is each procedure's before/after change, and WHERE is it?

    python docs/preview-review/check-pairs.py

The procedure slides cut in on the frame their name is spoken and the wipe is
half done a quarter-second later -- both verified. So if the change still reads
as arriving late, the delay is not in the timing but in the IMAGE: a small or
badly-placed difference takes the viewer a beat to find, and that beat is
indistinguishable from a sync error.

Reports, per pair, the mean absolute difference over the whole frame, the
difference restricted to the region the procedure actually claims to alter, and
where the change is really concentrated. A pair whose largest change is nowhere
near its named feature will never read as that procedure, however well timed.
"""
import os
import sys

import numpy as np
from PIL import Image

P = "public/portraits/"

# region of interest as fractions of the image (x0, y0, x1, y1), by procedure
PAIRS = [
    ("Rhinoplasty", "flood-06b", "flood-06a", (0.30, 0.30, 0.70, 0.62)),
    ("Facelift", "flood-04b", "flood-04a", (0.15, 0.35, 0.85, 0.85)),
    ("Upper Bleph", "flood-05b", "flood-05a", (0.25, 0.25, 0.75, 0.50)),
]


def load(name):
    for ext in (".png", ".jpg", ".jpeg"):
        p = P + name + ext
        if os.path.exists(p):
            return Image.open(p).convert("RGB")
    return None


def main():
    for label, b, a, roi in PAIRS:
        ib, ia = load(b), load(a)
        if ib is None or ia is None:
            print(f"{label:<12} MISSING {b if ib is None else a}")
            continue
        if ib.size != ia.size:
            ia = ia.resize(ib.size, Image.LANCZOS)
        A = np.asarray(ib).astype(np.float32)
        B = np.asarray(ia).astype(np.float32)
        d = np.abs(A - B).mean(axis=2)
        h, w = d.shape

        x0, y0, x1, y1 = roi
        sub = d[int(y0 * h):int(y1 * h), int(x0 * w):int(x1 * w)]

        # where is the change actually concentrated? (coarse 3x3 blocks)
        blocks = []
        for r in range(3):
            for c in range(3):
                blk = d[r * h // 3:(r + 1) * h // 3, c * w // 3:(c + 1) * w // 3]
                blocks.append((blk.mean(), f"{'top mid low'.split()[r]}-"
                                           f"{'left centre right'.split()[c]}"))
        blocks.sort(reverse=True)

        # how much of the frame changes enough to be noticeable at all
        frac = float((d > 12).mean())
        print(f"{label:<12} {b} -> {a}  {ib.size[0]}x{ib.size[1]}")
        print(f"{'':<12}   whole frame  mean |diff| {d.mean():5.2f}"
              f"   pixels >12: {frac * 100:5.1f}%")
        print(f"{'':<12}   named region mean |diff| {sub.mean():5.2f}"
              f"   ({'x'.join(str(v) for v in sub.shape[::-1])})")
        print(f"{'':<12}   biggest change: {blocks[0][1]} ({blocks[0][0]:.2f}), "
              f"then {blocks[1][1]} ({blocks[1][0]:.2f})")
        verdict = ("region leads" if sub.mean() >= d.mean() * 1.15
                   else "CHANGE IS NOT IN THE NAMED REGION")
        print(f"{'':<12}   -> {verdict}\n")


if __name__ == "__main__":
    sys.exit(main())
