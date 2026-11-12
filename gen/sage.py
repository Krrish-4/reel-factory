"""Repaint a portrait's studio backdrop to the reels' flat sage.

    python gen/sage.py public/portraits/hero3-before.png --as sage-hero3-before

The last hand step between a generated render and a reel-ready asset. Portraits
come off the generator on a pale blue-grey sweep; the reels sit on flat sage
`#A3B5BA`, and a portrait dropped on sage without this keeps a visible halo.

**This does not key to alpha.** Keying asks "which pixels are background",
answers wrongly at every hair strand, and leaves a fringe. Instead the composite
is solved directly. An edge pixel is a mix of subject and backdrop with backdrop
coverage `c`:

    P   = (1-c)*F + c*BG          what the camera recorded
    out = (1-c)*F + c*SAGE        what we want
    =>  out = P + c*(SAGE - BG)

One add per pixel, no division, no thresholded cut-out. Semi-transparent hair
un-mixes correctly because a strand that is 30% covered gets 30% of the shift.

The only estimate is `c`, and it is deliberately conservative: a pixel is only
treated as backdrop if it is BOTH close to the measured backdrop colour AND
spatially connected to the frame border. Grey hair is close to this backdrop in
colour — without the connectivity test, a silver-haired subject gets her hair
repainted sage from the inside out.
"""
import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent

# The reels' background. CLAUDE.md rule 1: flat sage for the entire runtime,
# never cream. Verified against public/portraits/sage-before.png's own corners.
SAGE = np.array([163.0, 181.0, 186.0])

CORE_DIST = 22.0    # <= this from backdrop colour: certainly backdrop
EDGE_DIST = 95.0    # >= this: certainly subject. Between the two: partial cover.
REACH = 24          # px the backdrop may grow inward from the border-connected core


def measure_backdrop(a, patch=40):
    """Median of the TOP corners only — the sweep is flat, so this is exact.

    Not the bottom corners: the subject wears a black turtleneck that reaches
    the bottom edge, and including those corners drags the median to a dark
    grey the backdrop never was. Same convention as align_core.metrics().
    """
    corners = np.concatenate([
        a[:patch, :patch].reshape(-1, 3), a[:patch, -patch:].reshape(-1, 3),
    ])
    return np.median(corners, axis=0)


def dilate(mask, px):
    """Binary dilation by `px`, as repeated 3x3 max via array shifts."""
    m = mask.copy()
    for _ in range(px):
        g = m.copy()
        g[1:, :] |= m[:-1, :]
        g[:-1, :] |= m[1:, :]
        g[:, 1:] |= m[:, :-1]
        g[:, :-1] |= m[:, 1:]
        m = g
    return m


def backdrop_coverage(a, bg):
    """Per-pixel backdrop coverage `c` in [0,1]."""
    d = np.linalg.norm(a - bg, axis=2)

    # Colour alone: 1 at the backdrop colour, ramping to 0 at EDGE_DIST.
    c = np.clip((EDGE_DIST - d) / (EDGE_DIST - CORE_DIST), 0.0, 1.0)

    # Connectivity: flood the certainly-backdrop pixels inward from the border,
    # so only backdrop that actually reaches the frame edge counts. PIL's
    # floodfill is C-side; a numpy reconstruction would need ~1000 dilations.
    # .copy() is load-bearing: an image from Image.fromarray is READ-ONLY, so
    # floodfill silently draws into an internal copy while np.asarray keeps
    # reading the original buffer — every pixel comes back unfilled.
    core = Image.fromarray(((d <= CORE_DIST).astype(np.uint8) * 255)).copy()
    seeds = [(0, 0), (core.width - 1, 0), (core.width // 2, 0)]
    for s in seeds:
        if core.getpixel(s) == 255:
            ImageDraw.floodfill(core, s, 128, thresh=0)
    connected = np.asarray(core) == 128

    # Let it reach a little past the core so the soft hair boundary is included,
    # but no further — that is what stops interior grey hair being repainted.
    return c * dilate(connected, REACH)


def graded_backdrop(a, bg0, loose=70.0, rounds=3):
    """A smooth per-pixel backdrop field, for a sweep that is NOT flat.

    RefinaBangs' portraits came back on a graded blue sweep: light at the top,
    noticeably bluer toward the lower corners. Measured off the top corners
    alone, those lower corners sit past CORE_DIST and survive the repaint as
    hard blue islands either side of the shoulders.

    So the backdrop is modelled instead of sampled: take everything connected
    to the top or side edges within `loose` of the current estimate (skin, hair
    and the black turtleneck are all far past that from a blue sweep), fit a
    quadratic surface per channel to it, and repeat against the fitted field so
    the selection follows the gradient down the frame.
    """
    h, w, _ = a.shape
    yy, xx = np.mgrid[0:h, 0:w]
    X = np.stack([np.ones(h * w), xx.ravel() / w, yy.ravel() / h,
                  (xx.ravel() / w) ** 2, (yy.ravel() / h) ** 2,
                  xx.ravel() * yy.ravel() / (w * h)], axis=1)
    field = np.broadcast_to(bg0, a.shape).copy()
    for _ in range(rounds):
        d = np.linalg.norm(a - field, axis=2)
        m = Image.fromarray(((d <= loose).astype(np.uint8) * 255)).copy()
        for sx, sy in [(0, 0), (w - 1, 0), (w // 2, 0)] +                 [(0, y) for y in range(0, h, 40)] + [(w - 1, y) for y in range(0, h, 40)]:
            if m.getpixel((sx, sy)) == 255:
                ImageDraw.floodfill(m, (sx, sy), 128, thresh=0)
        sel = (np.asarray(m) == 128).ravel()
        coef, *_ = np.linalg.lstsq(X[sel], a.reshape(-1, 3)[sel], rcond=None)
        field = (X @ coef).reshape(h, w, 3)
    return field


def backdrop_coverage_field(a, field):
    """`backdrop_coverage` against a per-pixel field, seeded down both sides."""
    d = np.linalg.norm(a - field, axis=2)
    c = np.clip((EDGE_DIST - d) / (EDGE_DIST - CORE_DIST), 0.0, 1.0)
    core = Image.fromarray(((d <= CORE_DIST).astype(np.uint8) * 255)).copy()
    h, w = d.shape
    for s in [(0, 0), (w - 1, 0), (w // 2, 0)] +             [(0, y) for y in range(0, h, 40)] + [(w - 1, y) for y in range(0, h, 40)]:
        if core.getpixel(s) == 255:
            ImageDraw.floodfill(core, s, 128, thresh=0)
    connected = np.asarray(core) == 128
    return c * dilate(connected, REACH)


def repaint(src, sage=SAGE, graded=False):
    im = Image.open(src).convert("RGB") if not isinstance(src, Image.Image) else src.convert("RGB")
    a = np.asarray(im).astype(np.float64)
    bg = measure_backdrop(a)
    if graded:
        field = graded_backdrop(a, bg)
        c = backdrop_coverage_field(a, field)[..., None]
        out = a + c * (sage - field)
    else:
        c = backdrop_coverage(a, bg)[..., None]
        out = a + c * (sage - bg)
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)), bg, c[..., 0]


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("src", type=Path)
    ap.add_argument("--as", dest="name", help="destination stem (default: sage-<source stem>)")
    ap.add_argument("--dest", type=Path, default=ROOT / "public" / "portraits")
    ap.add_argument("--force", action="store_true")
    # RefinaTrio's brief sets ivory/charcoal/soft grey, not sage. Same repaint,
    # different target; sage stays the default so every existing call is unchanged.
    ap.add_argument("--colour", help="target backdrop as hex, e.g. D8D3CB (default: sage)")
    ap.add_argument("--graded", action="store_true",
                    help="model a non-flat sweep as a smooth field instead of one colour")
    args = ap.parse_args()
    target = SAGE if not args.colour else np.array(
        [int(args.colour.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4)], dtype=float)

    src = args.src if args.src.is_absolute() else Path.cwd() / args.src
    if not src.exists():
        sys.exit(f"not found: {src}")
    name = args.name or f"sage-{src.stem}"
    out_path = args.dest / f"{name}.png"
    if out_path.exists() and not args.force:
        sys.exit(f"{out_path} exists — pass --force (it may be in a shipping cut)")

    img, bg, c = repaint(src, target, graded=args.graded)
    args.dest.mkdir(parents=True, exist_ok=True)
    img.save(out_path)

    a = np.asarray(img).astype(float)
    corners = measure_backdrop(a)
    print(f"wrote {out_path}  {img.size[0]}x{img.size[1]}")
    print(f"  source backdrop {bg.round(0)} -> {corners.round(0)}  (target {target.round(0)})")
    print(f"  fully repainted {100 * (c > 0.99).mean():4.1f}% of frame, "
          f"partial (hair edges) {100 * ((c > 0.01) & (c < 0.99)).mean():4.1f}%, "
          f"untouched {100 * (c <= 0.01).mean():4.1f}%")
    if np.abs(corners - target).max() > 2:
        print("  ! corners did not land on sage — is the source backdrop flat?")
    return 0


if __name__ == "__main__":
    sys.exit(main())
