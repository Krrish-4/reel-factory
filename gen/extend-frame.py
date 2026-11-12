"""Pad a promoted portrait so it COVERS the reel frame at base zoom.

    python gen/extend-frame.py public/portraits/sage-ratio1-before.png \
        --face-frac 0.30 --face-at 0.56 --in-place

THE PROBLEM THIS SOLVES. RefinaFlip and RefinaLips both composite their portrait
as a sized element on the stage (`fit` < 1) because the subject's face at cover
scale is larger than the corpus close band allows — ratio1 lands at 0.535 of
frame height against a band topping out at 0.453. That works, but it makes the
picture SMALLER than the frame, so it has edges. While the studio backdrop was
a different colour from the stage those edges read as a deliberate card. Once
gen/sage.py repaints the backdrop to the exact stage colour the top and side
edges vanish — and the bottom does not, because the subject's black turtleneck
runs right to it and stops in mid-air.

You cannot frame that out: centred, the shoulders only clear the frame bottom at
fit >= 1.21, which puts the face at 0.57 of frame height.

WHAT IT DOES INSTEAD. Rather than shrinking the picture until the face fits the
band, it grows the CANVAS: sage above and to the sides, the clamped bottom row
extended below, until the face is the requested fraction of a frame the picture
now covers completely. Nothing is scaled and no pixel of the subject is touched,
so this is padding, not resampling.

WHY THAT IS WORTH THE TROUBLE. A picture that covers the frame has no edges to
hide, so it can be zoomed and panned freely — and the framing is then expressed
as `zoom` + `focus`, which `anchors.ts` ALREADY models in `anchor()`, `faceRow()`
and `faceCol()`. Every ring, seam and mark follows the camera for free. The
alternative was a second transform applied outside the picture and kept in step
with it by hand, which is invariant S: the same calculation done twice, out by
up to 240px the first time this repo tried it.

BOTH HALVES OF A PAIR MUST BE PADDED IDENTICALLY or they stop being a pair.
Pass --like to copy another image's exact padding rather than re-deriving it;
a before and its after differ by a pixel or two in measured face position, and
re-deriving would shift one against the other and break every wipe in the reel.
"""
import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from align_core import face_anchor, metrics  # noqa: E402

FRAME_W, FRAME_H = 1080, 1920


def measure_backdrop(a, patch=40):
    corners = np.concatenate([
        a[:patch, :patch].reshape(-1, 3), a[:patch, -patch:].reshape(-1, 3),
    ])
    return np.median(corners, axis=0)


def face_box(im):
    """(top, height) of the facial skin box, in this image's own pixels."""
    top_row, cx, hw = metrics(im)
    _, ftop, fh, _ = face_anchor(im, (cx, top_row, hw))
    return float(ftop), float(fh)


def plan(im, face_frac, face_at):
    """(pad_left, pad_top, W, H) so the face is `face_frac` of the covered frame."""
    ftop, fh = face_box(im)
    # Face height must be `face_frac` of FRAME_H once the picture covers the
    # frame. Cover scale is s = max(FRAME_W/W, FRAME_H/H); we want the picture
    # to crop horizontally, not vertically, so s = FRAME_H/H and therefore
    # fh * FRAME_H / H = face_frac * FRAME_H  =>  H = fh / face_frac.
    H = int(round(fh / face_frac))
    # W must be wide enough that FRAME_W/W <= FRAME_H/H, i.e. the vertical fit
    # is the binding one. A little margin so rounding cannot invert it.
    W = max(im.width, int(round(H * FRAME_W / FRAME_H)) + 8)
    # Put the face centre at `face_at` down the padded canvas.
    want_centre = face_at * H
    pad_top = int(round(want_centre - (ftop + fh / 2)))
    if pad_top < 0:
        raise SystemExit(
            f"face already sits below {face_at:.2f} of the padded canvas "
            f"(needs pad_top {pad_top}); lower --face-at or raise --face-frac")
    if pad_top + im.height > H:
        raise SystemExit(
            f"padding {pad_top} above a {im.height}px source overflows H={H}; "
            f"raise --face-at or lower --face-frac")
    return (W - im.width) // 2, pad_top, W, H


def apply(im, pad_left, pad_top, W, H):
    a = np.asarray(im.convert("RGB")).astype(np.uint8)
    bg = measure_backdrop(a.astype(float)).round().astype(np.uint8)
    out = np.empty((H, W, 3), dtype=np.uint8)
    out[:, :] = bg
    out[pad_top:pad_top + a.shape[0], pad_left:pad_left + a.shape[1]] = a
    # Sides beside the subject: extend that row's own edge pixels, so a
    # non-uniform sweep does not band against flat backdrop.
    out[pad_top:pad_top + a.shape[0], :pad_left] = a[:, :1]
    out[pad_top:pad_top + a.shape[0], pad_left + a.shape[1]:] = a[:, -1:]
    # Below the subject: clamp the last row. gen/extend-pad.py has already
    # guaranteed that row is flat content, so this reads as the garment
    # continuing out of frame.
    out[pad_top + a.shape[0]:] = out[pad_top + a.shape[0] - 1]
    return Image.fromarray(out)


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("src", type=Path)
    ap.add_argument("--face-frac", type=float, default=0.30,
                    help="face height as a fraction of the frame, at zoom 1")
    ap.add_argument("--face-at", type=float, default=0.56,
                    help="where the face centre sits down the padded canvas")
    ap.add_argument("--like", type=Path,
                    help="copy this image's padding plan (use for the other half "
                         "of a pair — re-deriving would shift them apart)")
    ap.add_argument("--in-place", action="store_true")
    ap.add_argument("--out", type=Path)
    a_ = ap.parse_args()

    src = a_.src if a_.src.is_absolute() else Path.cwd() / a_.src
    im = Image.open(src).convert("RGB")
    if a_.like:
        p = json.loads(Path(str(a_.like) + ".pad.json").read_text(encoding="utf-8"))
        pad_left, pad_top, W, H = p["pad_left"], p["pad_top"], p["W"], p["H"]
        # A pair is only a pair if both halves are the same size going in.
        if (p["src_w"], p["src_h"]) != im.size:
            raise SystemExit(f"--like source was {p['src_w']}x{p['src_h']}, this is {im.size}")
    else:
        pad_left, pad_top, W, H = plan(im, a_.face_frac, a_.face_at)

    out_img = apply(im, pad_left, pad_top, W, H)
    dest = src if a_.in_place else (a_.out or src.with_name(src.stem + "-frame.png"))
    out_img.save(dest)
    Path(str(dest) + ".pad.json").write_text(json.dumps(
        {"pad_left": pad_left, "pad_top": pad_top, "W": W, "H": H,
         "src_w": im.width, "src_h": im.height}, indent=2), encoding="utf-8")

    ftop, fh = face_box(out_img)
    cover = max(FRAME_W / W, FRAME_H / H)
    print(f"wrote {dest}  {im.width}x{im.height} -> {W}x{H}"
          f"  (pad L{pad_left} T{pad_top})")
    print(f"  cover scale {cover:.4f}   face height on screen "
          f"{fh * cover / FRAME_H:.3f} of frame   face centre "
          f"{(ftop + fh / 2) / H:.3f} down the canvas")
    return 0


if __name__ == "__main__":
    sys.exit(main())
