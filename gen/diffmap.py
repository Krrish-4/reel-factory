"""Render the per-pixel difference between a registered pair as a reel asset.

    python gen/diffmap.py ratio1-before ratio1-chin --as ratio-diff

THIS IS EVIDENCE, NOT AN ILLUSTRATION. "Same Nose" tells the viewer that the
change in its hook pair is nowhere near the nose, and then shows them the
difference map. If that map were drawn to look convincing the reel would be
asserting exactly the kind of thing `docs/reel-invariants.md` rule E exists to
stop. So it is computed from the two promoted masters, on the frame they already
share, with no smoothing that could move where the change appears.

WHAT IT DOES
    1. Both images are already on the canonical reel frame (promote.py), so no
       further alignment is needed and none is done — re-aligning here could
       shift the difference, which is the one thing that must not happen.
    2. Absolute difference, per pixel, collapsed across RGB by max rather than
       mean: a change that is strong in one channel is a change.
    3. Mapped through a single-hue ramp over a dark ground. One hue, because a
       rainbow heat map invents categories the data does not have.
    4. The face is kept faintly visible underneath so the viewer can see WHERE
       on the face the bright band sits. Without it the map is an abstract blob
       and the beat proves nothing.

The numbers the beat prints beside this come from `gen/score.py`, not from here.
"""
import argparse
import json
import pathlib
import sys

import numpy as np
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

PORTRAITS = HERE.parent / "public" / "portraits"
REGISTRY = PORTRAITS / "registry.json"


def load_registered(name):
    reg = json.loads(REGISTRY.read_text(encoding="utf-8"))
    if name not in reg:
        raise SystemExit(f"{name} is not in the registry; run gen/registry.py --ingest first")
    return Image.open(PORTRAITS / reg[name]["file"]).convert("RGB"), reg[name]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("before")
    ap.add_argument("after")
    ap.add_argument("--as", dest="name", required=True)
    ap.add_argument("--gain", type=float, default=3.4,
                    help="display gain on the difference; does not change WHERE it is")
    ap.add_argument("--under", type=float, default=0.30,
                    help="how much of the underlying face stays visible")
    ap.add_argument("--no-mask", dest="mask", action="store_false",
                    help="draw the difference over the whole frame (see rule Z)")
    a = ap.parse_args()

    b_img, b_rec = load_registered(a.before)
    c_img, c_rec = load_registered(a.after)
    if b_img.size != c_img.size:
        raise SystemExit(
            f"pair is not on one frame ({b_img.size} vs {c_img.size}); "
            "promote both through gen/promote.py first"
        )
    if b_rec.get("subject") != c_rec.get("subject"):
        raise SystemExit("refusing to difference two different subjects")

    b = np.asarray(b_img).astype(np.int16)
    c = np.asarray(c_img).astype(np.int16)

    # max over channels, not mean: a change that is strong in one channel is a
    # change, and averaging it with two quiet channels hides it.
    d = np.abs(c - b).max(axis=2).astype(np.float32)

    # RULE Z. The chips printed beside this map are region_score figures, which
    # are computed over `face_mask` -- facial skin only. Drawing the map over
    # the whole frame shows the viewer hair and collar churn while asserting
    # numbers that describe skin, and nothing in the beat says they are two
    # different pixel sets. That is exactly the defect rule Z records against
    # RefinaFlip's proof beat, found on a contact sheet and by nothing else.
    # `asym.py` was fixed for it; this tool was not, because no reel had used
    # it for a beat that prints figures until now.
    #
    # The shipped ratio-v5 map predates this and was rendered unmasked.
    if a.mask:
        from align_core import face_mask
        m = b_rec["measured"]
        skin = face_mask(b_img, (m["head_cx"], m["head_top"], m["head_w"]))
        # Feather, so the mask edge does not read as a sticker cut around the
        # face -- the same reason asym.py feathers its own. Radius is in
        # MASTER pixels (1440x1920 here), so a single-digit blur is invisible:
        # 9 left a hard edge along the jaw and hairline.
        from PIL import ImageFilter
        soft = np.asarray(
            Image.fromarray((skin * 255).astype(np.uint8)).filter(
                ImageFilter.GaussianBlur(26))
        ).astype(np.float32) / 255.0
        d = d * soft

    d = np.clip(d * a.gain, 0, 255) / 255.0

    # One hue. A rainbow ramp would invent categories the measurement does not
    # have, and this image is being shown as evidence.
    ground = np.asarray(b_img).astype(np.float32) * a.under
    hot = np.stack(
        [
            np.full_like(d, 255.0),
            255.0 - 90.0 * d,
            255.0 - 210.0 * d,
        ],
        axis=2,
    )
    out = ground * (1.0 - d[..., None]) + hot * d[..., None]
    out = np.clip(out, 0, 255).astype(np.uint8)

    dest = PORTRAITS / f"{a.name}.png"
    Image.fromarray(out).save(dest)
    print(f"wrote {dest}  {b_img.size[0]}x{b_img.size[1]}")
    print(f"  peak difference {np.abs(c - b).max(axis=2).max():.0f}/255, "
          f"mean {np.abs(c - b).max(axis=2).mean():.2f}")


if __name__ == "__main__":
    main()
