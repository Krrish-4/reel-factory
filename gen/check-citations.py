"""A script line that sounds like research must carry its source. Preflight.

    python gen/check-citations.py src/refina/lips        # reel dir
    python gen/check-citations.py docs/scripts/lips.txt  # or a script directly
    python gen/check-citations.py --all                  # every script

WHY THIS EXISTS
---------------
The script rule used to be a flat ban: no study may be cited, because Refina's
content rules forbid inventing facts. That was too strong and it was costing us
the format the corpus is actually built on — 8 of 21 references make a claim and
slide a cited study under it, and `kit/CitationCard` was built for exactly that
and then had nothing to show.

The rule is now permissive: **cite whatever is real and recorded.** What is
banned is the SHAPE of authority without the substance — "studies show fuller
lips signal fertility" with nothing behind it.

A permissive rule needs a gate, and this repo has already learned what happens
without one. Rule P was written down, in CLAUDE.md, and RefinaFlip reached v5
ignoring it anyway; rule GG is a whole skill that was never once loaded. Prose
does not exit non-zero. So loosening the ban and adding this stage are one
change, not two, and the stage goes in at the same time as the loosening rather
than when the first citation lands — the risk starts the moment the ban lifts.

WHAT IT ASSERTS
---------------
For every spoken line whose wording reads as research, there is a
`# SOURCE:` comment above it in the same beat section, and that comment
carries a locator — a DOI or an http(s) URL. A reference with no locator is
not a source, it is a bibliography-shaped sentence.

WHAT IT CANNOT ASSERT
---------------------
That the source is real, that it says what the line says it says, or that it
has not been retracted. No parser can. This stage only makes the omission
loud; a human still has to have read the paper. Say so here rather than let
the green tick imply otherwise.
"""
import argparse
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Wording that borrows the authority of research. Each of these makes a listener
# hear "someone measured this", which is the thing that needs a receipt.
RESEARCH = re.compile(
    r"""\b(
        stud(y|ies) | research(ers)? | scientists? | et\s+al |
        journal | trial | meta-?analys(is|es) | experiments? |
        participants | respondents | surveys? | surveyed |
        data\s+(show|shows|suggest|suggests) |
        evidence\s+(show|shows|suggest|suggests) |
        scien(ce|tifically)\s+(say|says|shows|proven) |
        statistically | correlat(e|es|ed|ion) | proven\s+to |
        rated\s+(more|less|higher|lower) |
        (19|20)\d{2}
    )\b""",
    re.X | re.I,
)
PERCENT = re.compile(r"\d+\s*(%|per\s?cent)", re.I)
SOURCE = re.compile(r"^#\s*SOURCE\s*:\s*(?P<ref>.+)$", re.I)
LOCATOR = re.compile(r"(https?://|\bdoi\s*:|10\.\d{4,9}/)", re.I)
BEAT = re.compile(r"^#\s*--")


def shown(p: pathlib.Path):
    """Repo-relative where possible — a script under test may live anywhere."""
    try:
        return p.relative_to(ROOT)
    except ValueError:
        return p


def scripts_for(target: pathlib.Path):
    """A reel dir names its script in shots.json; a .txt is its own target."""
    if target.is_file() and target.suffix == ".txt":
        return [target]
    shots = target / "shots.json"
    if shots.is_file():
        named = json.loads(shots.read_text(encoding="utf-8")).get("script")
        if named:
            return [ROOT / named]
    return []


def check(path: pathlib.Path):
    """Return a list of complaint strings. Empty means clean."""
    bad = []
    sources = []          # SOURCE refs seen since the last beat header
    for n, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        s = raw.strip()
        if BEAT.match(s):
            sources = []
            continue
        m = SOURCE.match(s)
        if m:
            ref = m.group("ref").strip()
            if not LOCATOR.search(ref):
                bad.append(f"{path}:{n}: SOURCE has no DOI or URL - a reference "
                           f"without a locator is not a source: {ref!r}")
            sources.append(ref)
            continue
        if not s or s.startswith("#") or s == "---":
            continue
        spoken = s.partition("|")[0].strip()
        hit = RESEARCH.search(spoken) or PERCENT.search(spoken)
        if hit and not sources:
            bad.append(f"{path}:{n}: reads as research ({hit.group(0)!r}) with no "
                       f"# SOURCE: above it in this beat - {spoken!r}")
    return bad


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("target", nargs="?", help="reel dir or docs/scripts/<x>.txt")
    ap.add_argument("--all", action="store_true", help="every script in docs/scripts")
    a = ap.parse_args()

    if a.all or not a.target:
        paths = sorted((ROOT / "docs" / "scripts").glob("*.txt"))
    else:
        paths = scripts_for(pathlib.Path(a.target))
        if not paths:
            print(f"   no script found for {a.target} — nothing to check")
            return 0

    bad = []
    for p in paths:
        if not p.is_file():
            print(f"   script named but missing: {p}")
            bad.append(str(p))
            continue
        found = check(p)
        print(f"   {'FAIL' if found else 'ok  '}  {shown(p)}")
        bad += found

    if bad:
        print()
        for b in bad:
            print(f"   {b}")
        print("\n   Cite whatever is real. Put the reference on a '# SOURCE:' line")
        print("   above the claim, with its DOI or URL. If there is no source,")
        print("   rewrite the line as a fact the viewer can reproduce instead.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
