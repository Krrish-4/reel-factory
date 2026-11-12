"""Derive the `lips` region box from the portraits themselves.

Invariant A: geometry is derived from the asset, never typed. The existing
REGIONS boxes were calibrated against measured peaks; this does the same job
for the mouth, which no reel has targeted before.

Method: lips carry more Cr (redness) than the skin around them and form a
strong horizontal band. For every registered portrait we take the face-anchored
frame, build a redness-excess profile over rows in the plausible mouth zone,
and report the band at half-peak. The median across subjects is the box.

It ALSO reports what share of that band survives `face_mask`, because the mask
keys on chroma distance from a mid-face patch and lips are chromatically the
least skin-like thing on a face -- if the mask eats them, `region_score`
returns nan and a lips reel has no number to print.

    python gen/calibrate-lips.py
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from align_core import align, face_anchor, face_mask   # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
PORTRAITS = ROOT / "public" / "portraits"


def lip_profile(img, anchor):
    """(rows, redness-excess profile, face geometry, mask-survival per row)."""
    cx, ftop, fh, fw = face_anchor(img, anchor)
    a = np.asarray(img.convert("RGB")).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b
    mask = face_mask(img, anchor)

    # Skin reference from the CHEEKS, left and right of the mouth, so the
    # reference cannot be contaminated by the lips it is meant to find.
    def band(y0, y1, x0, x1):
        return (slice(int(ftop + y0 * fh), int(ftop + y1 * fh)),
                slice(int(cx + x0 * fw), int(cx + x1 * fw)))
    cheeks = np.concatenate([cr[band(0.60, 0.80, -0.48, -0.30)].ravel(),
                             cr[band(0.60, 0.80, 0.30, 0.48)].ravel()])
    ref = float(np.median(cheeks))

    # Search BELOW the nose box (which ends at 0.66). Two subjects peaked at
    # y~0.55-0.60 on the first pass -- nostril shadow, not mouth. The mouth is
    # under the nose by anatomy, so the window starts where `nose` stops.
    ys = np.arange(int(ftop + 0.66 * fh), int(ftop + 0.98 * fh))
    xs = slice(int(cx - 0.26 * fw), int(cx + 0.26 * fw))
    prof = np.array([float(np.mean(np.clip(cr[y, xs] - ref, 0, None))) for y in ys])
    surv = np.array([float(mask[y, xs].mean()) for y in ys])
    return ys, prof, (cx, ftop, fh, fw), surv, ref


def main():
    names = sorted(p.stem for p in PORTRAITS.glob("*-before.png"))
    if not names:
        sys.exit("no *-before.png portraits found")

    print(f"{'subject':16s} {'peak y':>7s} {'y0':>6s} {'y1':>6s} {'x core':>7s} {'x corner':>8s} {'mask%':>6s}")
    print("    (fractions of face height and face width)")
    print("-" * 78)
    rows = []
    for n in names:
        p = PORTRAITS / f"{n}.png"
        try:
            aligned, anchor = align([("p", p)])
            img = aligned["p"]
            ys, prof, (cx, ftop, fh, fw), surv, ref = lip_profile(img, anchor)
        except Exception as e:                                  # noqa: BLE001
            print(f"{n:16s}  skipped: {e}")
            continue
        if prof.max() <= 0:
            print(f"{n:16s}  skipped: no redness peak")
            continue
        # Baseline-subtract: the chin is redder than cheek too, so a raw
        # half-peak rule never drops below threshold and the band runs to the
        # window edge. What we want is the lip PEAK above local lower-face
        # redness, not everything redder than a cheek.
        prof = prof - np.median(prof)
        pk = int(np.argmax(prof))
        half = prof.max() * 0.5
        lo = pk
        while lo > 0 and prof[lo] > half:
            lo -= 1
        hi = pk
        while hi < len(prof) - 1 and prof[hi] > half:
            hi += 1
        y0 = (ys[lo] - ftop) / fh
        y1 = (ys[hi] - ftop) / fh
        ypk = (ys[pk] - ftop) / fh

        # Width from a COLUMN profile over the measured band, not a single row:
        # one row's half-max lands on whatever shadow sits on it, and gave
        # 0.094 on one subject and 0.365 on another for the same anatomy.
        a = np.asarray(img.convert("RGB")).astype(np.float32)
        r_, g_, b_ = a[..., 0], a[..., 1], a[..., 2]
        cr = 128 + 0.5 * r_ - 0.418688 * g_ - 0.081312 * b_
        cols = np.arange(int(cx - 0.45 * fw), int(cx + 0.45 * fw))
        band_rows = slice(ys[lo], ys[hi] + 1)
        cprof = np.array([float(np.mean(cr[band_rows, x] - ref)) for x in cols])
        cprof = cprof - np.median(cprof)
        if cprof.max() > 0:
            idx = np.where(cprof > cprof.max() * 0.5)[0]
            xhalf = max(abs(cols[idx[0]] - cx), abs(cols[idx[-1]] - cx)) / fw
            j = np.where(cprof > cprof.max() * 0.25)[0]
            xcorner = max(abs(cols[j[0]] - cx), abs(cols[j[-1]] - cx)) / fw
        else:
            xhalf = xcorner = float("nan")
        mpct = float(np.mean(surv[lo:hi + 1])) * 100
        rows.append((y0, y1, xhalf, mpct, xcorner))
        print(f"{n:16s} {ypk:7.3f} {y0:6.3f} {y1:6.3f} {xhalf:7.3f} {xcorner:8.3f} {mpct:6.1f}")

    if not rows:
        sys.exit("nothing measured")
    arr = np.array(rows, dtype=float)
    med = np.nanmedian(arr, axis=0)
    print("-" * 78)
    print(f"{'MEDIAN':16s} {'':7s} {med[0]:6.3f} {med[1]:6.3f} {med[2]:7.3f} {med[4]:8.3f} {med[3]:6.1f}")
    u_y0, u_y1, u_x = np.nanmin(arr[:, 0]), np.nanmax(arr[:, 1]), np.nanmax(arr[:, 2])
    print(f"{'UNION':16s} {'':7s} {u_y0:6.3f} {u_y1:6.3f} {u_x:7.3f} {np.nanmax(arr[:, 4]):8.3f}")
    print()
    print(f"  measured union     y {u_y0:.3f}-{u_y1:.3f}   x core +-{u_x:.3f}   x corner +-{np.nanmax(arr[:, 4]):.3f}")
    print(f"  nose box ends at   y 0.660   <- lips must start at or below it")
    print(f"  jaw box starts at  y 0.720   <- OVERLAPS the mouth; must be carved")
    if med[3] < 60:
        print(f"\nWARNING: only {med[3]:.0f}% of the lip band survives face_mask(). "
              "region_score() would measure mostly non-lip pixels or return nan.")


if __name__ == "__main__":
    main()
