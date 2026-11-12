"""Compose a generation prompt from named clauses in gen/constraints.toml.

    python gen/prompts.py --recipe base_portrait --describe "late 40s White"
    python gen/prompts.py --list
    python gen/prompts.py --audit          # which specs bypass the clause file

    from prompts import compose
    text = compose("procedure_after", done="facelift - the jowls are gone")

WHY
---
Five spec files each carried their own copy of the same hard-won sentences, and
they had already drifted: the anti-filter clause exists in three wordings, and
the backdrop clause — which `align_core` depends on — is stated in full in two
files and paraphrased in a third. A constraint you have to remember to paste is
one you will eventually paste wrong.

`--audit` is the part that keeps this honest: it reports which spec files still
inline a clause instead of naming it, so consolidation is visible rather than
assumed.
"""
import argparse
import pathlib
import re
import sys
import tomllib

ROOT = pathlib.Path(__file__).resolve().parent
SPEC = ROOT / "constraints.toml"


def load():
    return tomllib.loads(SPEC.read_text(encoding="utf-8"))


def compose(recipe, sep=" ", **fields):
    """Join a recipe's clauses into one prompt, substituting {placeholders}."""
    d = load()
    if recipe not in d["recipe"]:
        raise SystemExit(f"unknown recipe {recipe!r}; have {sorted(d['recipe'])}")
    out = []
    for name in d["recipe"][recipe]["clauses"]:
        text = d["clause"][name]["text"]
        try:
            out.append(text.format(**fields) if fields else text)
        except KeyError as e:
            raise SystemExit(f"clause {name!r} needs field {e}")
    return sep.join(t.strip() for t in out)


def audit():
    """Which spec files still inline a clause rather than naming it?"""
    d = load()
    # a distinctive fragment of each clause, long enough not to match by chance
    marks = {n: re.sub(r"\s+", " ", c["text"])[:48]
             for n, c in d["clause"].items()}
    rows = []
    for f in sorted(ROOT.glob("*.toml")):
        if f.name == "constraints.toml":
            continue
        body = re.sub(r"\s+", " ", f.read_text(encoding="utf-8"))
        hits = [n for n, m in marks.items() if m in body]
        rows.append((f.name, hits))
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--recipe")
    ap.add_argument("--describe", default="{describe}")
    ap.add_argument("--need", default="{need}")
    ap.add_argument("--done", default="{done}")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--audit", action="store_true")
    a = ap.parse_args()
    d = load()

    if a.list:
        print("clauses:")
        for n, c in d["clause"].items():
            first = re.sub(r"\s+", " ", c["why"]).split(".")[0]
            print(f"  {n:20} {first}.")
        print("\nrecipes:")
        for n, r in d["recipe"].items():
            print(f"  {n:20} {' + '.join(r['clauses'])}")
        print("\ncasting rule:")
        print("  " + re.sub(r"\s+", " ", d["casting"]["rule"])[:200])

    if a.audit:
        print("\nspec files still inlining a clause instead of naming it:")
        any_hit = False
        for name, hits in audit():
            if hits:
                any_hit = True
                print(f"  {name:22} {', '.join(hits)}")
        if not any_hit:
            print("  none")
        print("\n(Inlining is not an error — these specs predate the clause file."
              "\n It is a list of what has not been consolidated yet.)")

    if a.recipe:
        print("\n" + compose(a.recipe, describe=a.describe, need=a.need,
                             done=a.done))
    if not (a.list or a.audit or a.recipe):
        ap.print_help()
    return 0


if __name__ == "__main__":
    sys.exit(main())
