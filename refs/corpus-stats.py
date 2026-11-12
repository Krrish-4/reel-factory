"""Compute the corpus statistics, so nobody has to remember them.

    python refs/corpus-stats.py            # rewrite refs/corpus-stats.json
    python refs/corpus-stats.py --show     # print the table

WHY THIS EXISTS
---------------
Three numbers drove real design decisions in this repo and all three were wrong.

  "corpus headline band 46.3%"  -- that is ref-01's value. The median is 71.4
                                   and the range is 20.9 to 100. Two reels had
                                   their headline bursts SHORTENED to chase it,
                                   which moved them away from the corpus.
  "corpus explainers run 243 wpm" -- derived by dividing Gemini transcripts by
                                   duration. Transcripts include on-screen text,
                                   so the figure was inflated; the real read is
                                   about 170.
  "every reference has notable_techniques" -- it is empty for all 21. It was
                                   used three times as evidence our reels were
                                   unremarkable.

Each was a remembered or single-sample number quoted as a target. The fix is the
same one the asset registry applies to labels: put the fact in a generated file
so it cannot be misquoted, and record the SPREAD next to it so a number with no
consensus cannot masquerade as a target.

NOT EVERY AXIS IS A TARGET
--------------------------
An axis whose references disagree wildly is a stylistic choice, not a spec. Any
axis whose interquartile range exceeds `SPREAD_LIMIT` of its median is marked
`"target": false` and should be read as "the corpus does not agree", not as a
number to hit. `headline_band` fails this test, which is exactly why quoting a
single reference's value for it was so misleading.
"""
import argparse
import glob
import io
import json
import pathlib
import statistics as st

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "refs" / "corpus-stats.json"

# an axis whose IQR is wider than this fraction of its median is not a target
SPREAD_LIMIT = 0.55

AXES = [
    ("frozen_pct", "pacing", "frozen_pct", "% of frames with no visible change"),
    ("cuts_per_min", "pacing", "cuts_per_min", "hard cuts per minute"),
    ("median_shot_s", "pacing", "median_shot_s", "median shot length, seconds"),
    ("arrivals_per_min", "element_events", "per_min", "discrete element arrivals per minute"),
    ("continuous_motion_pct", "continuous_motion", "pct_of_runtime", "% of runtime under sustained localised movement"),
    ("speech_pct", "audio", "speech_pct", "% of runtime carrying speech"),
    ("headline_band_pct", "treatment", "headline_band_frames_pct", "% of frames with something in the top band"),
    ("caption_band_pct", "treatment", "caption_band_frames_pct", "% of frames with something in the caption band"),
    ("duration_s", None, "duration_s", "runtime, seconds"),
]


def load_refs():
    out = []
    for p in sorted(glob.glob(str(ROOT / "refs" / "formats" / "ref-*.json"))):
        if ".record." in p or ".semantic." in p:
            continue
        out.append(json.load(io.open(p, encoding="utf-8")))
    return out


def load_records():
    """The merged records — the only place the SEMANTIC axes live.

    Everything in AXES is measured by measure-format.py and is a fact about
    pixels. `devices` is not: it is Gemini's inventory of what a reel does, and
    it is here because "how many distinct devices does a reel use" was quoted
    from memory twice while making decisions about two reels.
    """
    out = []
    for p in sorted(glob.glob(str(ROOT / "refs" / "formats" / "ref-*.record.json"))):
        out.append(json.load(io.open(p, encoding="utf-8")))
    return out


def summarise(values):
    values = sorted(v for v in values if v is not None)
    n = len(values)
    med = st.median(values)
    q1 = values[int(0.25 * (n - 1))]
    q3 = values[int(0.75 * (n - 1))]
    iqr = q3 - q1
    return {
        "n": n,
        "median": round(med, 1),
        "min": round(values[0], 1),
        "max": round(values[-1], 1),
        "q1": round(q1, 1),
        "q3": round(q3, 1),
        # a wide spread means the references disagree; treating the median as a
        # target then invents a consensus that does not exist
        "target": bool(med and (iqr / abs(med)) <= SPREAD_LIMIT),
    }


def build():
    refs = load_refs()
    if not refs:
        raise SystemExit("no reference records found under refs/formats/")
    stats = {}
    for name, sec, key, desc in AXES:
        vals = [(r[sec][key] if sec else r[key]) for r in refs]
        s = summarise(vals)
        s["description"] = desc
        stats[name] = s

    records = load_records()
    if records:
        s = summarise([len(r.get("device_inventory") or []) for r in records])
        s["description"] = ("distinct visual devices Gemini inventoried; "
                            "SEMANTIC, from the record, not measured from pixels")
        stats["devices"] = s

    return {
        "_note": (
            "GENERATED by refs/corpus-stats.py. Quote numbers from here, never "
            "from memory and never from one reference. An axis with "
            "\"target\": false has an interquartile range wider than "
            f"{SPREAD_LIMIT:.0%} of its median -- the references disagree, so "
            "there is nothing to hit."
        ),
        "references": len(refs),
        "axes": stats,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--show", action="store_true")
    a = ap.parse_args()

    data = build()
    OUT.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)}  ({data['references']} references)")

    if a.show or True:
        print(f"\n{'axis':24}{'median':>9}{'range':>16}{'target?':>10}")
        for k, v in data["axes"].items():
            rng = f"{v['min']}-{v['max']}"
            print(f"{k:24}{v['median']:>9}{rng:>16}"
                  f"{('yes' if v['target'] else 'NO'):>10}")
        bad = [k for k, v in data["axes"].items() if not v["target"]]
        if bad:
            print("\nnot targets (references disagree): " + ", ".join(bad))


if __name__ == "__main__":
    main()
