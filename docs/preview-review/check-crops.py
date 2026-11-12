"""What each beat's crop actually shows, computed from the assets.

    python docs/preview-review/check-crops.py

Answers two questions that cost a render each to answer by eye:

1. IS THE PROMOTE PAD IN FRAME? `gen/promote.py` lands every portrait on one
   canonical frame by padding, and the pad is flat backdrop across the full
   width at the bottom of the file. At low zoom it lands inside the picture as
   a pale band under the subject's shoulders — visible in the first stills of
   "Same Nose" on five of nine beats, and easy to mistake for a scrim artefact.
   The pad's first row is MEASURED here, not assumed, by scanning up for the
   last row that is not flat.

2. IS THE ANATOMY THE BEAT TALKS ABOUT ACTUALLY IN FRAME? The nose-and-chin
   beat first shipped with the chin below the bottom edge, so its CHIN bracket
   had no visible lower end — the one thing the beat exists to show.

This replicates `Face`'s layout, which is `anchors.cover()` performed literally.
If that component's maths changes, this changes with it; they are one thing.

NOTE it does not read the composition — the table below is maintained by hand
alongside the beats. It is a check on chosen numbers, not a source of them.
"""
import io
import re
import sys

import numpy as np
from PIL import Image

W, H = 1080, 1920

# (beat, asset, zoom, focus-y) — keep in step with src/refina/ratio/RefinaRatio.tsx
BEATS = [
    ("hook", "ratio1-before", 1.20, 0.30),
    ("claim", "ratio1-before", 1.20, 0.34),
    ("proof", "ratio1-before", 1.50, 0.30),
    ("one", "ratio1-before", 1.30, 0.58),
    ("two", "bleph1-before", 1.52, 0.26),
    ("three", "ratio1-before", 1.18, 0.34),
    ("nuance", "ratio1-before", 1.18, 0.32),
    ("test", "ratio1-before", 1.20, 0.26),
    ("close", "ratio1-before", 1.18, 0.32),
]

# face-height fractions, from gen/align_core.REGIONS via src/refina/assets.ts
NOSE_BOT, JAW_BOT = 0.66, 1.02


def assets():
    src = io.open("src/refina/assets.ts", encoding="utf-8").read()
    out = {}
    pat = (r'"([\w-]+)": \{ file:.*?w: (\d+), h: (\d+), face: \{ cx: ([\d.]+), '
           r'top: ([\d.]+), height: ([\d.]+), width: ([\d.]+) \}')
    for m in re.finditer(pat, src):
        n, w, h, cx, top, fh, fw = m.groups()
        out[n] = dict(w=int(w), h=int(h), cx=float(cx), top=float(top),
                      fh=float(fh), fw=float(fw))
    return out


def pad_row(name):
    """First row of the flat backdrop pad at the bottom of a promoted file."""
    im = np.asarray(Image.open(f"public/portraits/{name}.png").convert("RGB")).astype(int)
    for y in range(im.shape[0] - 1, 0, -1):
        if im[y].std(axis=0).max() > 6:
            return y + 1
    return im.shape[0]


def main():
    A = assets()
    pads = {n: pad_row(n) for n in sorted({b[1] for b in BEATS})}
    for n, p in pads.items():
        print(f"{n}: promote pad starts at source row {p}")
    print()
    bad = 0
    hdr = f"{'beat':7s} {'zoom':>5s} {'fy':>5s}  {'src rows shown':>16s}  {'pad':>5s}  anatomy in frame"
    print(hdr)
    print("-" * len(hdr))
    for name, asset, zoom, fy in BEATS:
        a = A[asset]
        s = max(W / a["w"], H / a["h"]) * zoom
        dh, dw = a["h"] * s, a["w"] * s
        offY = (H - dh) * fy
        top_src, bot_src = -offY / s, (H - offY) / s
        face_top = offY + a["top"] * s
        nose_bot = offY + (a["top"] + NOSE_BOT * a["fh"]) * s
        jaw_bot = offY + (a["top"] + JAW_BOT * a["fh"]) * s
        pad_in = bot_src > pads[asset]
        notes = []
        if pad_in:
            bad += 1
            notes.append("PAD VISIBLE")
        if face_top < 0:
            notes.append("face top cropped")
        if dw < W - 1:
            notes.append("image narrower than frame")
        print(f"{name:7s} {zoom:5.2f} {fy:5.2f}  {top_src:6.0f}..{bot_src:<8.0f} "
              f"{'SHOWS' if pad_in else 'ok':>5s}  "
              f"faceTop {face_top:5.0f}  noseBot {nose_bot:5.0f}  jawBot {jaw_bot:5.0f}"
              + ("   <- " + ", ".join(notes) if notes else ""))
    print()
    if bad:
        print(f"{bad} beat(s) show the promote pad — raise zoom or lower focus-y.")
    else:
        print("no beat shows the promote pad.")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
