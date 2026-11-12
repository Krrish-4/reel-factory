"""Put a set of aligned portraits on ONE common framing.

    python gen/reframe.py --head-frac 0.60 public/portraits/demo1-*.png

WHY THIS EXISTS
---------------
`align_core` normalises every after against the before it was generated from,
and it does that by matching HEAD WIDTH IN PIXELS. Within one run that is
exactly right: the pair is frame-locked and only the face differs.

Across runs it is not enough. Each run picks its own output canvas, so three
sets that all carry a ~900px head came out on 1090x1373, 1335x1681 and
1840x2318 canvases — the same head at 82%, 67% and 50% of frame width. Composite
those full-bleed in consecutive beats and the subject jumps size every cut,
which reads as three different shots of three different distances.

So this is a second normalisation, on top of alignment: recrop every image so
the head occupies the SAME FRACTION of the frame and sits at the same height.
Alignment makes a pair comparable; this makes a whole reel continuous.

Run it on a set, not on one file — the point is agreement between them.
"""
import argparse
import glob
import sys

import numpy as np
from PIL import Image


def subject(im):
    """Mask of everything that is not the flat studio backdrop.

    Backdrop is sampled from the TOP corners only. The same note as sage.py:
    hair and a dark garment reach the bottom edge on these crops, so a median
    over all four corners is dragged toward the garment and the mask collapses.
    """
    a = np.asarray(im.convert("RGB")).astype(int)
    h, w = a.shape[:2]
    k = max(8, w // 60)
    corners = np.concatenate(
        [a[:k, :k].reshape(-1, 3), a[:k, -k:].reshape(-1, 3)]
    )
    bg = np.median(corners, axis=0)
    return (np.abs(a - bg).sum(axis=2) > 40), bg


def metrics(im):
    m, bg = subject(im)
    rows = np.where(m.any(axis=1))[0]
    if len(rows) == 0:
        raise SystemExit("no subject found — is the backdrop flat?")
    top = int(rows[0])
    # head width from the upper part of the subject, where the head is; p90
    # rather than max so a stray hair strand does not set the width
    band = m[top : top + max(1, int(0.42 * len(rows)))]
    widths = band.sum(axis=1)
    head_w = float(np.percentile(widths[widths > 0], 90))
    cols = np.where(band.any(axis=0))[0]
    cx = float((cols[0] + cols[-1]) / 2)
    return top, head_w, cx, bg


def reframe(path, head_frac, aspect, out_w):
    im = Image.open(path).convert("RGB")
    top, head_w, cx, bg = metrics(im)

    W = head_w / head_frac
    H = W * aspect
    left = cx - W / 2
    # head top sits at a constant fraction down the new frame, so she does not
    # slide vertically between beats either
    upper = top - 0.13 * H

    box = (int(round(left)), int(round(upper)),
           int(round(left + W)), int(round(upper + H)))

    # `Image.crop()` pads an out-of-bounds box with BLACK, and every crop here
    # runs off the plate (head-frac 0.6 on a tightly-framed source means asking
    # for more picture than exists). Pasting that padded crop onto a backdrop
    # canvas keeps the black — which is exactly what happened: every portrait
    # came back letterboxed, and the reel rendered a black surround inside every
    # frame before anyone traced it back here.
    #
    # So intersect first, then paste the valid region at its offset, and let the
    # backdrop show through everywhere the source did not reach.
    w, h = im.size
    canvas = Image.new("RGB", (box[2] - box[0], box[3] - box[1]),
                       tuple(int(v) for v in bg))
    ix0, iy0 = max(0, box[0]), max(0, box[1])
    ix1, iy1 = min(w, box[2]), min(h, box[3])
    if ix1 > ix0 and iy1 > iy0:
        canvas.paste(im.crop((ix0, iy0, ix1, iy1)), (ix0 - box[0], iy0 - box[1]))
    out = canvas.resize((out_w, int(round(out_w * aspect))), Image.LANCZOS)
    out.save(path)
    return head_w, W, box


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("paths", nargs="+")
    ap.add_argument("--head-frac", type=float, default=0.60,
                    help="head width as a fraction of the output frame width")
    ap.add_argument("--aspect", type=float, default=4 / 3,
                    help="output height / width")
    ap.add_argument("--out-width", type=int, default=1440)
    a = ap.parse_args()

    files = []
    for p in a.paths:
        files.extend(sorted(glob.glob(p)))
    if not files:
        sys.exit("no files matched")

    print(f"reframing {len(files)} to head-frac {a.head_frac}:")
    for f in files:
        hw, W, box = reframe(f, a.head_frac, a.aspect, a.out_width)
        print(f"  {f:44} head {hw:6.0f}px -> crop {int(W)}px wide  {box}")


if __name__ == "__main__":
    main()
