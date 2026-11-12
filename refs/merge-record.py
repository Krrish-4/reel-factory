"""Merge the measured record and the semantic record into one format record.

    python refs/merge-record.py ref-01-piercings-explainer

Reads  refs/formats/<label>.json          (measured  — measure-format.py)
       refs/formats/<label>.semantic.json (semantic  — describe.py)
Writes refs/formats/<label>.record.json   (canonical)

THE POINT
---------
Neither half is usable alone. The measured record knows exactly when the picture
changed and nothing about what it changed to. The semantic record knows what is
on screen and guesses at time — it is produced from roughly one frame per
second, so its boundaries are soft by up to a second either way.

Merging snaps each described scene onto the nearest measured cut. The result is
a scene list that is both named and frame-accurate, which is the only form that
can actually be rebuilt.

It also reconciles the two counts, and the disagreement is itself information:
where the model reports more scenes than there are hard cuts, the difference is
the number of scene changes carried by a TRANSITION rather than a cut. That
ratio is one of the most transferable things about a house style.
"""
import argparse
import io
import json
import os
import sys

SNAP_TOLERANCE_S = 1.6  # a 1fps description cannot be tighter than this


def load(label, suffix):
    p = f"refs/formats/{label}{suffix}"
    if not os.path.exists(p):
        raise SystemExit(f"missing {p}")
    return json.load(io.open(p, encoding="utf-8"))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("label")
    a = ap.parse_args()

    m = load(a.label, ".json")
    s = load(a.label, ".semantic.json")

    fps = m["canvas"]["fps"]
    cuts_s = [c / fps for c in m["cut_frames"]]
    boundaries = [0.0] + cuts_s + [m["duration_s"]]

    scenes, snapped = [], 0
    for sh in s.get("shots", []):
        start = float(sh.get("approx_start", 0))
        near = min(boundaries, key=lambda b: abs(b - start))
        hit = abs(near - start) <= SNAP_TOLERANCE_S
        if hit:
            snapped += 1
        scenes.append({
            "start_s": round(near if hit else start, 3),
            "start_frame": int(round((near if hit else start) * fps)),
            "end_s": round(float(sh.get("approx_end", 0)), 3),
            "snapped_to_measured_cut": bool(hit),
            "layout": sh.get("layout"),
            "description": sh.get("description"),
            "devices": sh.get("devices", []),
        })

    # consolidated device inventory: the top-level list is usually thin, the
    # per-shot lists are where the real vocabulary is
    inv = {}
    for d in s.get("devices", []):
        inv[d["name"].lower()] = {
            "name": d["name"],
            "what_it_is": d.get("what_it_is"),
            "how_it_animates": d.get("how_it_animates"),
            "shots": [],
        }
    for i, sc in enumerate(scenes):
        for name in sc["devices"]:
            k = name.lower()
            inv.setdefault(k, {"name": name, "what_it_is": None,
                               "how_it_animates": None, "shots": []})
            inv[k]["shots"].append(i)

    hard = len(m["cut_frames"])
    described = len(scenes)
    rec = {
        "label": a.label,
        "archetype": s.get("format_archetype"),
        "one_line": s.get("one_line"),
        "canvas": m["canvas"],
        "duration_s": m["duration_s"],
        "measured": {
            "pacing": m["pacing"],
            "transitions": m["transitions"],
            "element_events": m["element_events"],
            # carried through so cross-corpus comparison can see it — it was
            # measured but never merged, so every reference read 0% continuous
            # motion against our own reels' 9.4%, which inverted the finding
            "continuous_motion": m.get("continuous_motion", {}),
            "treatment": m["treatment"],
            "audio": m["audio"],
        },
        "scene_change_style": {
            "described_scenes": described,
            "hard_cuts": hard,
            # A described scene change with no cut under it was carried by a
            # transition. The reverse also happens: more measured cuts than
            # described scene changes means the DESCRIPTION under-counted, not
            # that 428% of changes are cuts. Reported as a ratio with an
            # explicit flag rather than a percentage that can exceed 100.
            "cuts_per_described_change":
                round(hard / max(1, described - 1), 2),
            "pct_scene_changes_that_are_cuts":
                min(100.0, round(100 * hard / max(1, described - 1), 1)),
            "description_undercounted_scenes": bool(hard > described - 1),
            "carried_by_transition": max(0, described - 1 - hard),
            "note": "cuts vs described scene changes; if "
                    "description_undercounted_scenes is true the model listed "
                    "fewer scenes than there are measured cuts, so the "
                    "percentage is a floor",
        },
        "scenes": scenes,
        "device_inventory": sorted(inv.values(), key=lambda d: -len(d["shots"])),
        "hook": s.get("hook"),
        "narrative_arc": s.get("narrative_arc"),
        "onscreen_text": s.get("onscreen_text"),
        "transcript": s.get("transcript"),
        "cta": s.get("cta"),
        "subjects": s.get("subjects"),
        "notable_techniques": s.get("notable_techniques"),
        "what_makes_it_work": s.get("what_makes_it_work"),
        "_provenance": {
            "time_authority": "measure-format.py (every frame)",
            "meaning_authority": f"describe.py via {s.get('_meta',{}).get('model')}",
            "snap_tolerance_s": SNAP_TOLERANCE_S,
            "scenes_snapped_to_a_measured_cut": f"{snapped}/{described}",
        },
    }

    out = f"refs/formats/{a.label}.record.json"
    io.open(out, "w", encoding="utf-8").write(
        json.dumps(rec, indent=2, ensure_ascii=False))

    print(f"\n{a.label}  —  {rec['archetype']}")
    print(f"  {described} described scenes, {hard} hard cuts")
    print(f"  {rec['scene_change_style']['carried_by_transition']} scene changes "
          f"carried by a transition "
          f"({rec['scene_change_style']['pct_scene_changes_that_are_cuts']}% are cuts)")
    print(f"  {snapped}/{described} scenes snapped onto a measured cut")
    print(f"  {len(rec['device_inventory'])} distinct devices")
    print(f"\n  device inventory:")
    for d in rec["device_inventory"][:14]:
        print(f"    {len(d['shots'])}x  {d['name']}")
    print(f"\nwrote {out}")


if __name__ == "__main__":
    sys.exit(main())
