"""Postflight: has THIS render been through the reference pipeline?

    python gen/check-analysed.py out/refina-flip-v6.mp4

Exit 1 if the render has no analysis, or has one belonging to a different file.

WHY THIS EXISTS
---------------
Rule P says a reel is not finished until `refs/analyse.py` has run on it —
measurement AND the Gemini pass — because self-measurement alone has already
shipped an unpostable cut, and three postable-blocker defects in mirror2-v3 were
found by the Gemini pass and by nothing else.

`RefinaFlip` then reached **v5** without that pass ever running. It was not
forgotten quietly either: CLAUDE.md said, in writing, "`refs/analyse.py` — rule
P, the Gemini pass — has NOT been run on any version." The rule was documented,
the gap was documented, and five renders happened anyway.

That is the whole lesson. Prose does not exit non-zero. Every other rule in this
repo that stuck got a script; this one had a paragraph. So it gets a script.

WHAT IT ASSERTS, AND WHY EACH ONE
---------------------------------
  the record exists         -- rule P at its most basic
  it names THIS file        -- `ours-flip-v5.record.json` sitting next to
                               `refina-flip-v6.mp4` is not an analysis of v6.
                               The label is derived from the filename, so a
                               stale record from the previous version is
                               exactly what you would find here.
  it is not older than the  -- re-rendering invalidates the analysis. This is
  render                       the case that bit flip: the source was edited
                               after v5 and the analysis, had there been one,
                               would have described a file that no longer
                               existed.
  it ran on PRIMARY         -- describe.py falls back on 503, and falling back
                               CHANGES THE RESULT. A degraded record is a
                               warning, not a failure: it is still a real pass.

WHAT IT REPORTS BUT WILL NOT FAIL ON
------------------------------------
Duration and device count, each against the generated corpus band, both read
from `refs/corpus-stats.json` rather than typed here (rule V). Neither is a
gate, and the device count in particular MUST NOT become one: `corpus-stats.py`
marks it `"target": false`, because its interquartile range is wider than half
its median. The references disagree, so there is nothing to hit, and a check
that fails a reel for disagreeing with a corpus that disagrees with itself is
the wolf-crier rule V warns about.

`devices` is a new axis and it is SEMANTIC — it comes from the Gemini record,
not from pixels. It is in `corpus-stats.json` for one reason: the device count
was quoted from memory while making decisions about two reels.

They are printed because the numbers are cheap once the record exists and both
have been quoted wrongly from memory before.
"""
import argparse
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
FORMATS = ROOT / "refs" / "formats"
CORPUS = ROOT / "refs" / "corpus-stats.json"
# describe.py's PRIMARY. Kept in sync by reading it there rather than typing it
# twice would be better; it is one string and describe.py owns the fallback
# chain, so a mismatch here is a warning about a warning.
PRIMARY_HINT = "gemini-3.5-flash"


def label_for(render: pathlib.Path) -> str:
    """out/refina-flip-v6.mp4 -> ours-flip-v6, the label analyse.py is given."""
    stem = render.stem
    for prefix in ("refina-", "reel-"):
        if stem.startswith(prefix):
            stem = stem[len(prefix):]
            break
    return f"ours-{stem}"


def band(axis: dict) -> str:
    if not axis:
        return ""
    t = "" if axis.get("target", False) else "  (corpus disagrees — not a target)"
    return (f"corpus median {axis['median']}, "
            f"q1-q3 {axis['q1']}-{axis['q3']}, range {axis['min']}-{axis['max']}{t}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("render", help="the finished mp4 this check is about")
    ap.add_argument("--label", help="override the derived label")
    a = ap.parse_args()

    render = pathlib.Path(a.render)
    if not render.is_file():
        print(f"   render not found: {render}")
        return 1

    label = a.label or label_for(render)
    measured = FORMATS / f"{label}.json"
    record = FORMATS / f"{label}.record.json"

    cmd = f"python refs/analyse.py {render.as_posix()} --label {label}"

    if not record.is_file():
        which = "nothing" if not measured.is_file() else "only the measured half"
        print(f"  FAIL  {render.name} has {which} — rule P has not been run on it.")
        print(f"        A reel is not finished until it has been through the")
        print(f"        reference pipeline. Measurement alone has already shipped")
        print(f"        a bad cut; the Gemini pass is the half that reads meaning.")
        print(f"\n        {cmd}")
        return 1

    rec = json.loads(record.read_text(encoding="utf-8"))

    # The record's own label is authoritative; the measured sibling carries the
    # source path, which is what proves the analysis is of THIS file.
    src = None
    if measured.is_file():
        src = json.loads(measured.read_text(encoding="utf-8")).get("source")

    fails = 0
    if src and pathlib.Path(src).name != render.name:
        print(f"  FAIL  {record.name} analysed {src}, not {render.name}.")
        print(f"        A record from a previous version is not an analysis of")
        print(f"        this one. Re-run:\n\n        {cmd}")
        fails += 1

    if record.stat().st_mtime < render.stat().st_mtime:
        print(f"  FAIL  {render.name} is NEWER than its analysis.")
        print(f"        The render moved after it was analysed, so the record")
        print(f"        describes a file that no longer exists. Re-run:")
        print(f"\n        {cmd}")
        fails += 1

    model = (rec.get("_provenance") or {}).get("meaning_authority", "")
    if PRIMARY_HINT not in model:
        print(f"  warn  analysed via {model or 'an unrecorded model'}, not "
              f"{PRIMARY_HINT}.")
        print(f"        A fallback changes the result; the pass is real but two")
        print(f"        reels analysed on different models cannot be compared.")

    if fails:
        return 1

    # ---- reported, never failed on -------------------------------------
    axes = {}
    if CORPUS.is_file():
        axes = json.loads(CORPUS.read_text(encoding="utf-8")).get("axes", {})

    dur = rec.get("duration_s")
    devices = rec.get("device_inventory") or []
    scenes = rec.get("scene_change_style") or {}

    print(f"{label}: analysed, record is current")
    if dur is not None:
        print(f"  runtime        {dur:.1f}s        {band(axes.get('duration_s'))}")
    print(f"  devices        {len(devices)}           {band(axes.get('devices'))}")
    if scenes:
        print(f"  scene changes  {scenes.get('pct_scene_changes_that_are_cuts')}% "
              f"are hard cuts, {scenes.get('carried_by_transition')} carried by "
              f"a transition")
    print("\n  The record is the thing to READ, not just to have:")
    print(f"    refs/formats/{label}.report.md")
    print("  Rule P exists because the Gemini pass finds defects no measurement")
    print("  does. A green line here means it ran, not that it was read.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
