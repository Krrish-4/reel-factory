"""Preflight: does every asset claim match its record, and does every pair agree?

    python gen/check-assets.py                 # all compositions
    python gen/check-assets.py src/refina/changed

Exit 1 on any failure. This is the half of the registry that does the work --
the JSON only records; these checks are what make the record binding.

WHAT IT CATCHES, AND WHY EACH ONE IS HERE
-----------------------------------------
1. A label that claims something the asset's record contradicts. `<Card
   name="flood-06a" label="RHINOPLASTY" />` was typed from context, not
   knowledge, and nothing checked it. Invariant E says a label may never claim
   what the asset is not.

2. A pair whose two halves disagree about framing. Three generation runs each
   produced a ~900px head on a different canvas; the same woman changed size
   between beats and it reached the screen. Two images are a comparison only if
   they were normalised together.

3. A composition referencing an asset that looks like it belongs to a
   registered subject but was never registered.

VERIFIABLE VS WRONG
-------------------
A procedure label on a REGISTERED asset can be checked, so a disagreement fails.
The same label on an unregistered legacy asset cannot be checked at all -- that
is a warning that the claim is *unverifiable*, not an assertion that it is
wrong. The distinction is load-bearing: failing it would fail
`RefinaProtocolReel`, which is a signed-off cut nobody is allowed to change, and
a check that fires on untouchable work is a check everyone learns to skip.

DELIBERATELY NOT HERE
---------------------
No aesthetic threshold. Nothing in this file fails a build for being too static,
too slow or too anything. `docs/reel-invariants.md` rule P records what happened
the last time a number became a target: a slow zoom was added to a dead beat
purely to move `frozen_pct`, which did not work and would not have been a fix if
it had. These checks assert facts that are true or false.
"""
import argparse
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
REGISTRY = ROOT / "public" / "portraits" / "registry.json"

# two halves of a pair must agree this closely, in pixels, on the canonical frame
HEAD_W_TOL = 40.0
HEAD_TOP_TOL = 30.0

PROCEDURE = r"RHINOPLAST|FACELIFT|BLEPHAROPLAST|BLEPH|FILLER|BROW LIFT"
REF_ATTR = re.compile(r'(?:name|under|over|left|right)=\{?"([a-z0-9][a-z0-9-]+)"')
# Compositions usually bind an asset to a constant first — `const BEFORE =
# "demo1-before";` — so scanning JSX attributes alone found ZERO references in
# the very reel this was built for, and every registered asset looked unused.
REF_CONST = re.compile(
    r'^\s*(?:const|let)\s+[A-Z_][A-Za-z0-9_]*\s*=\s*"([a-z0-9][a-z0-9-]+)";', re.M
)
TAG = re.compile(r"<[A-Z][A-Za-z]*\b[^>]*?/?>", re.S)


def rel(p):
    try:
        return p.resolve().relative_to(ROOT)
    except ValueError:
        return p


def load_registry():
    if not REGISTRY.is_file():
        sys.exit(f"no registry at {REGISTRY}. Run gen/registry.py --ingest first.")
    return json.loads(REGISTRY.read_text(encoding="utf-8"))


def scan(paths):
    """Asset references, and any procedure label sitting in the SAME element.

    Pairing the two is what lets a claim be judged against a record rather than
    against a regex.
    """
    refs, claims = [], []
    for p in paths:
        # shots.json FIRST. The spec-driven reels name their assets in the shot
        # plan, not in TSX -- that is the whole point of the spec -- so scanning
        # only .tsx reported every asset in a compiled reel as "registered but
        # referenced by no composition". The warning was noise, and a check that
        # cries wolf on correct work is a check people learn to skip.
        for f in [] if p.is_file() else sorted(p.rglob("shots.json")):
            src = f.read_text(encoding="utf-8")
            for m in re.finditer(r'"(?:under|over|left|right|name)":\s*"([a-z0-9][a-z0-9-]+)"', src):
                refs.append((f, m.group(1), src[: m.start()].count(chr(10)) + 1))
        for f in [p] if p.is_file() else sorted(p.rglob("*.tsx")):
            src = f.read_text(encoding="utf-8")
            for rx in (REF_ATTR, REF_CONST):
                for m in rx.finditer(src):
                    refs.append((f, m.group(1), src[: m.start()].count("\n") + 1))
            for t in TAG.finditer(src):
                body = t.group(0)
                lbl = re.search(r'label=\{?"([^"]*(?:' + PROCEDURE + r')[^"]*)"',
                                body, re.I)
                if not lbl:
                    continue
                nm = REF_ATTR.search(body)
                claims.append((f, nm.group(1) if nm else None, lbl.group(1),
                               src[: t.start()].count("\n") + 1))
    return refs, claims


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("paths", nargs="*", default=None)
    a = ap.parse_args()
    paths = [pathlib.Path(p).resolve() for p in (a.paths or ["src/refina"])]

    reg = load_registry()
    refs, claims = scan(paths)
    fails, warns = [], []
    known = set(reg)
    referenced = {n for _, n, _ in refs}
    subjects = {reg[n].get("subject") for n in reg if reg[n].get("subject")}

    # 3 — an asset that belongs to a registered subject must be registered
    for f, n, ln in refs:
        if n in known:
            continue
        if any(n.startswith(f"{s}-") for s in subjects if s):
            fails.append(
                f"{rel(f)}:{ln} references '{n}', which looks like a registered "
                f"subject's asset but is not in the registry"
            )

    # 2 — pairs must agree on subject and framing
    for n, e in sorted(reg.items()):
        other = e.get("pairs_with")
        if not other:
            continue
        if other not in reg:
            fails.append(f"{n}: pairs_with '{other}' is not registered")
            continue
        if e.get("subject") != reg[other].get("subject"):
            fails.append(
                f"{n} pairs with {other} but they are different subjects "
                f"({e.get('subject')} vs {reg[other].get('subject')}) — this "
                f"reel's whole claim is that only one thing changed"
            )
        m, o = e["measured"], reg[other]["measured"]
        dw = abs(m["head_w"] - o["head_w"])
        dt = abs(m["head_top"] - o["head_top"])
        # A declared, WRITTEN exception downgrades to a warning. Some pairs are
        # supposed to disagree: a wide-lens shot changes apparent head width,
        # which is the phenomenon its beat exists to show. The escape hatch
        # requires a reason in the record rather than a loosened threshold,
        # because widening the tolerance to make a check pass is the same move
        # as adding a zoom to move frozen_pct (rule P).
        if e.get("framing_exempt") and (dw > HEAD_W_TOL or dt > HEAD_TOP_TOL):
            warns.append(
                f"{n} vs {other}: framing differs by {dw:.0f}px head width — "
                f"exempt: {e['framing_exempt']}"
            )
        elif dw > HEAD_W_TOL or dt > HEAD_TOP_TOL:
            fails.append(
                f"{n} vs {other}: framing disagrees by {dw:.0f}px head width / "
                f"{dt:.0f}px head top (tolerance {HEAD_W_TOL:.0f}/"
                f"{HEAD_TOP_TOL:.0f}). Re-ingest both together."
            )

    # 1 — a claim the record can contradict fails; one it cannot check warns
    for f, name, text, ln in claims:
        if name and name in reg:
            fails.append(
                f'{rel(f)}:{ln} types the label "{text}" on \'{name}\', whose '
                f"record says depicts={reg[name].get('depicts', 'unverified')}. "
                f"Use labelOf('{name}') so the claim cannot outrun the asset."
            )
        else:
            warns.append(
                f'{rel(f)}:{ln} claims "{text}"'
                + (f" for '{name}'" if name else "")
                + " — not registered, so the claim is unverifiable. Register the"
                  " asset or drop the procedure label."
            )

    for n in sorted(known - referenced):
        warns.append(f"{n} is registered but referenced by no composition")
    for f, n, ln in refs:
        if n in reg and reg[n].get("depicts") == "unverified":
            warns.append(
                f"{rel(f)}:{ln} uses '{n}', whose provenance is unverified — it "
                f"may appear, but may not be labelled"
            )

    print(f"registry: {len(reg)} assets; scanned {len(refs)} references")
    for w in warns:
        print(f"  warn  {w}")
    for x in fails:
        print(f"  FAIL  {x}")
    if fails:
        print(f"\n{len(fails)} failure(s)")
        return 1
    print("\nall verifiable asset claims match their records")
    return 0


if __name__ == "__main__":
    sys.exit(main())
