"""Screen procedure renders on three axes before anyone spends attention on them.

REBUILT 2026-08-26. The first version rejected four renders that were verifiably
good, because it measured the wrong thing three different ways: it averaged over
boxes that included hair and the turtleneck collar (which the generator redraws
every pass), its `nose` and `eyes` boxes overlapped so an under-eye change scored
as a nose change, and it anchored on the top of the subject mask -- the top of
the HAIR -- so a subject with a top-knot had every box shifted onto her brow.

What a usable procedure render has to be, all three at once:

  STRENGTH       the target region actually moved enough to read at reel speed.
                 The 2026-08-10 blepharoplasty was rejected as "marginal
                 localisation, far too weak" -- localised but invisible.
  CONCENTRATION  it moved more than the regions it was meant to leave alone.
  STILLNESS      the rest of the face did NOT quietly re-render underneath.
                 Without this, two procedures on one subject cannot be told
                 apart, and a before/after cross-fade shimmers everywhere.

    python gen/score.py before.png --target eyes after1.png after2.png
    python gen/score.py before.png --target any advisor.png     # whole-face

This is a SCREEN, not a verdict. It rejects renders that provably did not do the
procedure. Everything that survives still has to be looked at.
"""
import argparse
import sys
from pathlib import Path

from align_core import align, face_mask, global_drift, region_score, texture_energy

# Calibrated against eight labelled renders: the four verified good on
# 2026-08-26 (bleph1, lift1, swap1 x2) and the four judged by hand on
# 2026-08-10 (hero-rhinoplasty/facelift/eyelid bad, hero-advisor good).
MIN_STRENGTH = 25.0      # p90 change inside the target region
MIN_CONCENTRATION = 1.20  # target p90 / loudest other region
MAX_DRIFT = 15.0         # median change over all facial skin
MIN_WHOLE_FACE = 12.0    # for --target any, where concentration is meaningless


def verdict_for(d, drift, target):
    """(passed, reason). Reason names the FIRST axis that failed."""
    if target == "any":
        return (max(d.values()) >= MIN_WHOLE_FACE, "no real change")
    strength = d[target]
    others = max(v for k, v in d.items() if k != target)
    conc = strength / others if others else float("inf")
    if strength < MIN_STRENGTH:
        return False, f"too weak to read ({strength:.0f} < {MIN_STRENGTH:.0f})"
    if conc < MIN_CONCENTRATION:
        loudest = max((k for k in d if k != target), key=lambda k: d[k])
        return False, f"not localised - moved {loudest} as much"
    if drift > MAX_DRIFT:
        return False, f"whole face re-rendered (drift {drift:.0f})"
    return True, ""


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("source", type=Path, help="the 'before' every candidate is measured against")
    ap.add_argument("candidates", type=Path, nargs="+", help="renders to screen")
    ap.add_argument("--target", choices=["eyes", "nose", "lips", "jaw", "any"], required=True,
                    help="the region this procedure must move ('any' = whole-face)")
    ap.add_argument("--verbose", action="store_true", help="print alignment metrics")
    args = ap.parse_args()

    items = [("before", args.source)] + [(c.stem, c) for c in args.candidates]
    aligned, anchor = align(items, verbose=args.verbose)
    base = aligned["before"]
    mask = face_mask(base, anchor)
    base_tex = texture_energy(base, anchor)

    print(f"\nsource: {args.source}    target: {args.target}")
    print(f"{'render':34s} {'eyes':>6s} {'nose':>6s} {'lips':>6s} {'jaw':>6s} "
          f"{'conc':>5s} {'drift':>6s} {'tex':>5s}  verdict")
    print("-" * 108)

    failures = 0
    for name, _ in items[1:]:
        d = region_score(base, aligned[name], anchor, mask)
        drift = global_drift(base, aligned[name], anchor, mask)
        tex = texture_energy(aligned[name], anchor) / base_tex
        ok, why = verdict_for(d, drift, args.target)
        failures += 0 if ok else 1
        if args.target == "any":
            conc = float("nan")
        else:
            others = max(v for k, v in d.items() if k != args.target)
            conc = d[args.target] / others if others else float("inf")
        # Regenerated skin invents pigmentation and fine lines; flag, do not gate.
        note = "  +texture" if tex > 1.15 else ""
        print(f"{name[:34]:34s} {d['eyes']:6.1f} {d['nose']:6.1f} {d['lips']:6.1f} "
              f"{d['jaw']:6.1f} {conc:5.2f} {drift:6.1f} {tex:5.2f}  "
              f"{'PASS' if ok else 'FAIL  ' + why}{note}")

    n = len(items) - 1
    print(f"\n{n - failures}/{n} passed. Thresholds: strength>={MIN_STRENGTH:.0f}, "
          f"concentration>={MIN_CONCENTRATION:.2f}, drift<={MAX_DRIFT:.0f}.")
    print("Passing is not approval - it only means the render is not disqualified. "
          "Look at every survivor.")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
