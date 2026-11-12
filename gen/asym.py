"""Mirror-symmetry measurement, and the two chimeras a face makes with itself.

    python gen/asym.py --scan                      # rank every registered control
    python gen/asym.py ratio1-before               # measure one, print the table
    python gen/asym.py ratio1-before --emit asym1  # + write flip / chimeras / map

THIS IS EVIDENCE, NOT AN ILLUSTRATION — the same standing `gen/diffmap.py` has.
"You've Never Seen Your Own Face" tells the viewer that the face in the mirror
and the face in a photograph are two different pictures, and then shows the
difference. So every image this writes is a pure geometric operation on ONE
registered master: a horizontal flip, a half doubled onto itself, or an absolute
difference. Nothing is generated, retouched or re-rendered, which is the whole
reason this reel can put a measurement on screen without making a claim about a
person. Contrast the procedure previews, where the "after" is a model's guess.

THE MIDLINE IS SOLVED, NOT CHOSEN
    A vertical axis typed as "the middle of the image" would make a badly
    centred portrait look asymmetric and would be a fact about the crop, not
    about the face (invariant A). Instead the axis is the one that makes the
    face as symmetric as it can possibly be: we sweep candidate axes across the
    face box and keep the argmin of the mirror residual over facial skin.

    That choice is deliberately generous. Every number below is therefore a
    LOWER BOUND on the asymmetry — what is left after the face has been given
    its best available midline. A reel that overstates its evidence is exactly
    what rule E exists to stop, so the measurement leans the other way.

WHAT THE RESIDUAL CONTAINS
    Everything that differs between the picture and its mirror: shape, and also
    light. On this portrait set that is a small term — `subject.py`'s
    `BASE_PORTRAIT` pins soft even frontal light precisely so the backdrop stays
    flat for `align_core` — but it is not zero, and the on-screen label says
    what was measured rather than what we would like it to mean:

        PER-PIXEL DIFFERENCE, THIS PHOTO vs ITS MIRROR

    That is a computable statement about one image file. "Her face is N%
    asymmetric" would be a facial statistic, and this repo does not print those.

Region rows reuse `align_core.REGIONS`, so asymmetry is reported in the same
anatomical boxes the procedure screen uses and the two are comparable.
"""
import argparse
import json
import pathlib
import sys

import numpy as np
from PIL import Image, ImageFilter

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import align_core  # noqa: E402

PORTRAITS = HERE.parent / "public" / "portraits"
REGISTRY = PORTRAITS / "registry.json"


def load_registered(name):
    reg = json.loads(REGISTRY.read_text(encoding="utf-8"))
    if name not in reg:
        raise SystemExit(f"{name} is not in the registry; gen/registry.py --ingest it first")
    return Image.open(PORTRAITS / reg[name]["file"]).convert("RGB"), reg[name]


def _anchor(img):
    """(head_top, head_centre_x, head_width) — align_core's frame of reference."""
    top, cx, hw = align_core.metrics(img)
    return (cx, top, hw)


def mirror_columns(arr, axis):
    """arr mirrored about a vertical axis, plus a validity mask.

    out[y, x] = arr[y, round(2*axis - x)]. Columns whose partner falls outside
    the image are invalid — they are not compared, rather than being compared
    against an edge-clamped copy of themselves, which would read as perfect
    symmetry exactly where there is no data.
    """
    W = arr.shape[1]
    src = np.rint(2.0 * axis - np.arange(W)).astype(np.int64)
    valid = (src >= 0) & (src < W)
    return arr[:, np.clip(src, 0, W - 1)], valid


def solve_midline(img, anchor, mask=None):
    """The vertical axis that minimises the face's own mirror residual.

    Swept over the face box in half-pixel steps. Returns (axis_x, residual).
    """
    if mask is None:
        mask = align_core.face_mask(img, anchor)
    a = np.asarray(img).astype(np.float32).mean(axis=2)
    cx, ftop, fh, fw = align_core.face_anchor(img, anchor)

    # Only the face itself votes on the midline; hair partings and a collar are
    # not landmarks, and face_mask has already excluded them.
    ys = slice(max(int(ftop), 0), int(ftop + fh))
    band = a[ys]
    bmask = mask[ys]

    best, best_axis = None, cx
    for step in np.arange(-0.14 * fw, 0.14 * fw + 1e-6, 0.5):
        axis = cx + step
        m, valid = mirror_columns(band, axis)
        mm, _ = mirror_columns(bmask, axis)
        use = bmask & mm & valid[None, :]
        if use.sum() < 2000:
            continue
        r = float(np.abs(band - m)[use].mean())
        if best is None or r < best:
            best, best_axis = r, axis
    if best is None:
        raise SystemExit("could not solve a midline — is the face box empty?")
    return float(best_axis), best


def measure(img, anchor=None):
    """Full mirror-asymmetry record for one portrait."""
    anchor = anchor or _anchor(img)
    mask = align_core.face_mask(img, anchor)
    axis, _ = solve_midline(img, anchor, mask)

    a = np.asarray(img).astype(np.float32)
    m, valid = mirror_columns(a, axis)
    # max over channels, matching diffmap.py: a change strong in one channel is
    # a change, and averaging it with two quiet channels hides it.
    d = np.abs(a - m).max(axis=2)
    use = mask & mirror_columns(mask, axis)[0] & valid[None, :]

    cx, ftop, fh, fw = align_core.face_anchor(img, anchor)
    regions = {}
    for k, (x0, y0, x1, y1) in align_core.REGIONS.items():
        rs = slice(max(int(ftop + y0 * fh), 0), int(ftop + y1 * fh))
        # A region box is defined about the face centre; measure it about the
        # SOLVED axis so a region's asymmetry is not an artefact of the box.
        cs = slice(max(int(axis + x0 * fw), 0), int(axis + x1 * fw))
        vals = d[rs, cs][use[rs, cs]]
        regions[k] = float(np.percentile(vals, 90)) if vals.size >= 200 else float("nan")

    vals = d[use]
    return {
        "axis": axis,
        "axis_offset_px": float(axis - cx),
        "p90": float(np.percentile(vals, 90)),
        "median": float(np.median(vals)),
        "mean": float(vals.mean()),
        "regions": regions,
        "face": {"cx": cx, "top": ftop, "h": fh, "w": fw},
        "px": int(vals.size),
    }


def chimera(img, axis, side):
    """One half of the face, doubled onto its own mirror.

    Pure column arithmetic on the source pixels: the kept half is untouched and
    the other half is its reflection. No blending across the seam — a feathered
    join would be a retouch, and the hard seam is honest about what the picture
    is. Everything outside the face (hair, shoulders, backdrop) is mirrored too,
    which is why these read as a whole photograph rather than a cut-out.
    """
    a = np.asarray(img)
    m, _ = mirror_columns(a, axis)
    W = a.shape[1]
    xs = np.arange(W)
    keep_left = xs <= axis
    take = keep_left if side == "left" else ~keep_left
    out = np.where(take[None, :, None], a, m)
    return Image.fromarray(out.astype(np.uint8))


def diff_map(img, axis, gain=3.4, under=0.30, anchor=None, mask=None):
    """The face against its own mirror, one hue over the dimmed original.

    Same construction as gen/diffmap.py — one hue because a rainbow ramp would
    invent categories the measurement does not have, and the face left faintly
    visible underneath because otherwise the map is an abstract blob and the
    beat proves nothing.

    THE MAP IS RESTRICTED TO FACIAL SKIN, AND THAT IS AN HONESTY FIX, NOT A
    COSMETIC ONE. The first render lit up the hairline far more brightly than
    anything on the face: hair is the highest-contrast edge in the frame and it
    does not fall in the same place as its own mirror, so it dominated the
    picture. Meanwhile the figures printed beside it (`measure()`) are computed
    over `face_mask` only. A beat that shows hair while reporting skin is
    claiming its numbers describe what the viewer is looking at when they do
    not — rule E. Same mask, same pixels, one statement.

    The mask edge is feathered, because a hard cut-out reads as a sticker laid
    on the photograph rather than as a measurement of it.
    """
    a = np.asarray(img).astype(np.float32)
    m, valid = mirror_columns(a, axis)
    d = np.abs(a - m).max(axis=2)
    d = np.clip(d * gain, 0, 255) / 255.0
    d[:, ~valid] = 0.0

    if mask is None and anchor is not None:
        mask = align_core.face_mask(img, anchor)
    if mask is not None:
        soft = np.asarray(
            Image.fromarray((mask * 255).astype(np.uint8)).filter(
                ImageFilter.GaussianBlur(9)
            )
        ).astype(np.float32) / 255.0
        d = d * soft

    ground = a * under
    hot = np.stack([np.full_like(d, 255.0), 255.0 - 90.0 * d, 255.0 - 210.0 * d], axis=2)
    out = ground * (1.0 - d[..., None]) + hot * d[..., None]
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def _row(name, r):
    g = r["regions"]
    return (f"{name:24} p90 {r['p90']:6.2f}  med {r['median']:5.2f}  "
            f"eyes {g['eyes']:6.2f}  nose {g['nose']:6.2f}  jaw {g['jaw']:6.2f}  "
            f"axis {r['axis_offset_px']:+6.1f}px")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("name", nargs="?")
    ap.add_argument("--scan", action="store_true", help="rank every registered portrait")
    ap.add_argument("--emit", metavar="STEM",
                    help="write <STEM>-flip / -left / -right / -map beside the master")
    ap.add_argument("--gain", type=float, default=3.4)
    a = ap.parse_args()

    if a.scan:
        reg = json.loads(REGISTRY.read_text(encoding="utf-8"))
        rows = []
        for name in sorted(reg):
            try:
                img, _ = load_registered(name)
                rows.append((name, measure(img)))
            except Exception as e:                       # noqa: BLE001
                print(f"{name:24} SKIP {e}")
        rows.sort(key=lambda t: -t[1]["p90"])
        print("\nranked by mirror residual (higher = reads as more asymmetric)\n")
        for name, r in rows:
            print(_row(name, r))
        return

    if not a.name:
        raise SystemExit("give a registered name, or --scan")

    img, rec = load_registered(a.name)
    r = measure(img)
    print(_row(a.name, r))
    print(f"  {r['px']} skin px compared, face {r['face']['w']:.0f}x{r['face']['h']:.0f}")

    if a.emit:
        axis = r["axis"]
        outs = {
            f"{a.emit}-flip": img.transpose(Image.FLIP_LEFT_RIGHT),
            f"{a.emit}-left": chimera(img, axis, "left"),
            f"{a.emit}-right": chimera(img, axis, "right"),
            f"{a.emit}-map": diff_map(img, axis, gain=a.gain,
                                      anchor=_anchor(img)),
        }
        for stem, im in outs.items():
            p = PORTRAITS / f"{stem}.png"
            im.save(p)
            print(f"  wrote {p.name}  {im.size[0]}x{im.size[1]}")
        (PORTRAITS / f"{a.emit}-asym.json").write_text(
            json.dumps({"source": a.name, **r}, indent=2), encoding="utf-8")
        print(f"  wrote {a.emit}-asym.json")


if __name__ == "__main__":
    main()
