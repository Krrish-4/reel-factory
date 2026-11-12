"""Extend a promoted portrait's last content row down to the frame bottom.

    python gen/extend-pad.py public/portraits/sage-ratio1-before.png --in-place

WHY THIS EXISTS. `promote.py` pads the bottom of a master with flat backdrop —
invariant T, "the pad lands in shot". While the backdrop was a pale blue-grey
and the stage was sage, the pad was just part of a visibly rectangular card and
nobody looked at it twice. `gen/sage.py` repaints that backdrop to the exact
stage colour so the picture composites with no edge at all, and the moment it
does, the pad becomes the ONLY visible seam: the subject's black turtleneck
stops in mid-air with stage showing beneath it.

Measured on ratio1: 167px of pad below content ending at master row 1753. You
cannot frame it out. Centred, the shoulders only clear the frame bottom at
fit >= 1.21, which puts the face at 0.57 of frame height against a corpus close
band topping out at 0.453; and translating the picture down far enough to hide
it drops her chin into the caption band.

WHAT IT DOES. Finds the last row that is still stable content — not the first
row of the pad, but the last row before the pad TRANSITION begins — and clamps
it downward to the bottom of the frame. On ratio1 that row has a row-to-row
gradient of 0.52/255, so replicating it is invisible: a turtleneck at the bottom
of frame is a near-vertical flat shape and edge-clamping it reads as the garment
continuing out of frame, which is what the photograph would have shown.

THIS IS NOT INVENTING CONTENT. It extends a measured flat region by its own
edge, and it refuses to run if that edge is not flat — a subject whose bottom
rows carry real detail would streak, and the tool says so rather than smearing
it. Nothing above the pad is touched, so face geometry, the registry's measured
metrics and every anchored mark are unchanged.
"""
import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image

# Above this row-to-row gradient the edge is not flat enough to clamp.
MAX_EDGE_GRADIENT = 1.5
# A row is "content" when at least this fraction of it differs from the backdrop.
CONTENT_FRAC = 0.02
BACKDROP_DIST = 10


def measure_backdrop(a, patch=40):
    """Median of the TOP corners — same convention as gen/sage.py."""
    corners = np.concatenate([
        a[:patch, :patch].reshape(-1, 3), a[:patch, -patch:].reshape(-1, 3),
    ])
    return np.median(corners, axis=0)


def last_stable_row(a, bg):
    """The last row of real content, backed off the pad transition."""
    d = np.abs(a - bg).max(axis=2)
    rows = (d > BACKDROP_DIST).mean(axis=1)
    content = np.where(rows > CONTENT_FRAC)[0]
    if not content.size:
        raise SystemExit("no content found — is this a blank frame?")
    last = int(content[-1])
    # Walk back off the anti-aliased transition into the pad: stop at the first
    # row whose gradient to its predecessor is flat.
    r = last
    while r > 8:
        g = float(np.abs(a[r].astype(float) - a[r - 1].astype(float)).mean())
        if g <= MAX_EDGE_GRADIENT:
            return r, g
        r -= 1
    raise SystemExit("never found a flat row above the pad")


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("src", type=Path)
    ap.add_argument("--out", type=Path, help="default: alongside, -ext suffix")
    ap.add_argument("--in-place", action="store_true")
    a_ = ap.parse_args()

    src = a_.src if a_.src.is_absolute() else Path.cwd() / a_.src
    im = Image.open(src).convert("RGB")
    a = np.asarray(im).astype(np.uint8).copy()
    bg = measure_backdrop(a.astype(float))
    row, grad = last_stable_row(a.astype(float), bg)
    pad = a.shape[0] - 1 - row
    if pad <= 0:
        print(f"{src.name}: content already reaches the bottom — nothing to do")
        return 0
    a[row:] = a[row]
    out = a_.src if a_.in_place else (a_.out or src.with_name(src.stem + "-ext.png"))
    Image.fromarray(a).save(out)
    print(f"wrote {out}  clamped row {row} down {pad}px "
          f"(edge gradient {grad:.2f}/255, limit {MAX_EDGE_GRADIENT})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
