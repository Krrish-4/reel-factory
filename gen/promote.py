"""Land a generated render in the reel's canonical frame and name it properly.

The last mechanical gap between `gen/out/` (throwaway staging, UUID filenames,
whatever frame that run happened to produce) and `public/portraits/` (the frame
every composition already expects).

    python gen/promote.py out/subjects-.../swap1/pair/swap1-facelift.png --as hero3-facelift
    python gen/promote.py out/.../bleph1/pair/bleph1-before.png --as hero4-before --force

Every shipping portrait sits on ONE frame -- 1218x1601, head top y=76, centre
x=617, head width 888 -- so any two can be cross-faded, wipe-switched or slid
against each other and only the face moves. A render that skips this moves the
whole head on the cut.

This does NOT do the sage repaint. A promoted portrait still carries its studio
backdrop; see the skill's Portrait assets section for the composite formula that
turns it into a `sage-*`.
"""
import argparse
import sys
from pathlib import Path

from align_core import REEL_FRAME, align_to_reel, metrics

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / "public" / "portraits"


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("src", type=Path, help="render to promote")
    ap.add_argument("--as", dest="name", required=True,
                    help="destination stem, e.g. hero3-facelift (no extension)")
    ap.add_argument("--dest", type=Path, default=DEST, help="output dir")
    ap.add_argument("--force", action="store_true", help="overwrite an existing file")
    args = ap.parse_args()

    src = args.src if args.src.is_absolute() else Path.cwd() / args.src
    if not src.exists():
        sys.exit(f"not found: {src}")
    out = args.dest / f"{args.name}.png"
    if out.exists() and not args.force:
        sys.exit(f"{out} exists — pass --force to overwrite (it may be in a shipping cut)")

    landed = align_to_reel(src)
    top, cx, hw = metrics(landed)
    args.dest.mkdir(parents=True, exist_ok=True)
    landed.save(out)

    f = REEL_FRAME
    dt, dc, dw = top - f["head_top"], cx - f["centre_x"], hw - f["head_w"]
    print(f"wrote {out}  {landed.size[0]}x{landed.size[1]}")
    print(f"  head_top {top:.0f} (target {f['head_top']:.0f}, off by {dt:+.0f})")
    print(f"  centre_x {cx:.0f} (target {f['centre_x']:.0f}, off by {dc:+.0f})")
    print(f"  head_w   {hw:.0f} (target {f['head_w']:.0f}, off by {dw:+.0f})")
    # The estimator is a percentile over the subject mask, so a different
    # hairstyle shifts it a few px. Large drift means the source was not a
    # front-on portrait on a flat backdrop and will not cross-fade cleanly.
    if abs(dt) > 12 or abs(dc) > 12 or abs(dw) > 30:
        print("  ! drifted more than the set's own spread — check this against "
              "sage-before before using it in a cut")
    print("\nStill needs the sage repaint before it can sit on flat sage.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
