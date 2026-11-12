"""Generate new subjects and their procedure before/afters, from gen/subjects.toml.

Two phases, because which face you get is a casting decision and should not be
made silently by taking whatever came back first:

    python gen/subject.py --candidates                       # 'before' portraits
    python gen/subject.py --run <dir> --pick rhino1=2 --pick lift1=1

Phase 1 generates `variants` candidate portraits per subject, each cast to
visibly NEED its procedure. You look at them. Phase 2 takes the ones you picked,
upscales each to 2K, generates every 'after' defined for that subject, upscales
those, then aligns the whole set (before + all afters) into ONE shared frame so
any two can be cross-faded or wipe-switched.

Free -- images cost no Flow credits. Requires `gflow auth login`.

THE BACKDROP IS NOT A STYLE CHOICE. `align_core.metrics()` locates the subject by
sampling the frame corners for a flat background; a textured or graded backdrop
silently breaks alignment, scoring, and the sage repaint the reels rely on.
"""
import argparse
import datetime
import json
import subprocess
import sys

from PIL import Image
import tomllib
from pathlib import Path

from align_core import align, face_mask, global_drift, region_score, texture_energy
from score import verdict_for
from generate import ROOT, find_gflow, strip_watermark, upscale

SPEC = Path(__file__).resolve().parent / "subjects.toml"


def run_gflow(cmd, label):
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        last = (res.stderr.strip().splitlines() or ["(no stderr)"])[-1]
        print(f"  ! {label} failed (exit {res.returncode}): {last}")
        return False
    return True


def renders_in(d: Path):
    """Generated files only -- skips refs, upscales and cleaned copies."""
    if not d.exists():
        return []
    return sorted(
        p for p in d.iterdir()
        if p.suffix.lower() in {".png", ".jpg", ".jpeg"}
        and not p.name.startswith("_")
        and "_2k" not in p.name
    )


def load_spec(path: Path):
    spec = tomllib.loads(path.read_text(encoding="utf-8"))
    by_id = {s["id"]: s for s in spec["subjects"]}
    return spec, by_id


def phase_candidates(spec, subjects, gflow, run_dir):
    """Generate the 'before' portraits and stop, so a human casts the face."""
    index = {"spec": str(SPEC.name), "subjects": {}}
    for sub in subjects:
        before_dir = run_dir / sub["id"] / "before"
        before_dir.mkdir(parents=True, exist_ok=True)
        prompt = spec["base"]["portrait"].format(
            describe=sub["describe"].strip(), need=sub["need"].strip()
        )
        print(f"\n=== {sub['id']}: {sub['describe']} ===")
        ok = run_gflow([gflow, "image", "t2i", prompt, "--model", spec["model"],
                        "--aspect", spec["aspect"], "-n", str(spec["variants"]),
                        "--out", str(before_dir), "--json"], f"t2i {sub['id']}")
        cands = renders_in(before_dir) if ok else []
        for i, c in enumerate(cands, 1):
            print(f"  [{i}] {c.name}")
        index["subjects"][sub["id"]] = {
            "describe": sub["describe"], "need": sub["need"],
            "prompt": prompt, "candidates": [c.name for c in cands],
        }
    (run_dir / "candidates.json").write_text(json.dumps(index, indent=2), encoding="utf-8")

    picks = " ".join(f"--pick {sid}=1" for sid in index["subjects"])
    print(f"\nCandidates in {run_dir}")
    print("Look at them, then:")
    print(f"  python gen/subject.py --run {run_dir.relative_to(ROOT).as_posix()} {picks}")
    return 0


def phase_afters(spec, by_id, picks, gflow, run_dir):
    """Take the chosen 'before' per subject and build every 'after' for it."""
    results = []
    for sid, n in picks.items():
        sub = by_id[sid]
        before_dir = run_dir / sid / "before"
        cands = renders_in(before_dir)
        if not cands:
            print(f"! {sid}: no candidates in {before_dir} — run --candidates first")
            continue
        if not 1 <= n <= len(cands):
            print(f"! {sid}: --pick {n} out of range (1..{len(cands)})")
            continue

        print(f"\n=== {sid}: before = [{n}] {cands[n - 1].name} ===")
        before_2k = upscale(gflow, cands[n - 1], spec["upscale"])
        if before_2k is None:
            print(f"! {sid}: could not upscale the before, skipping")
            continue

        # before + every after get aligned together, so all of them share one
        # frame — that is what lets SwapScene switch between two procedures.
        frame = {"before": strip_watermark(before_2k)}
        meta = []
        for aft in sub.get("afters", []):
            after_dir = run_dir / sid / aft["id"]
            after_dir.mkdir(parents=True, exist_ok=True)
            prompt = spec["after"]["template"].format(done=aft["done"].strip())
            print(f"  -> {aft['id']}")
            if not run_gflow([gflow, "image", "i2i", prompt, "--ref", str(before_2k),
                              "--model", spec["model"], "--aspect", spec["aspect"],
                              "-n", "1", "--out", str(after_dir), "--json"],
                             f"i2i {sid}/{aft['id']}"):
                continue
            got = renders_in(after_dir)
            if not got:
                print(f"  ! {aft['id']}: wrote nothing")
                continue
            big = upscale(gflow, got[0], spec["upscale"])
            if big is None:
                continue
            frame[aft["id"]] = strip_watermark(big)
            meta.append({"id": aft["id"], "target": aft["target"], "prompt": prompt})

        # A SUBJECT MAY LEGITIMATELY HAVE NO AFTERS. `asym1` is the first:
        # RefinaFlip's second picture is a horizontal flip and two self-chimeras
        # computed by gen/asym.py, so there is nothing to generate, nothing to
        # align it against, and nothing for score.py to screen -- the pair is
        # exact by construction. The 2K upscale and the watermark crop still
        # matter, so the before is written out on its own and the run stops
        # there rather than reporting a failure that did not happen.
        if not sub.get("afters"):
            pair_dir = run_dir / sid / "pair"
            pair_dir.mkdir(exist_ok=True)
            dest = pair_dir / f"{sid}-before.png"
            # `strip_watermark` hands back a PATH to the cleaned copy, not an
            # image, exactly as `align` expects further down.
            with Image.open(frame["before"]) as im:
                im.convert("RGB").save(dest)
                w, h = im.size
            print(f"  no afters declared — wrote {w}x{h} -> {dest}")
            print(f"  next: gen/promote.py {dest} --as {sid}-before")
            results.append({"subject": sid, "describe": sub["describe"],
                            "before": before_2k.name, "afters": [], "computed": True})
            continue

        if len(frame) < 2:
            print(f"! {sid}: no afters survived, nothing to align")
            continue

        aligned, anchor = align(list(frame.items()))
        pair_dir = run_dir / sid / "pair"
        pair_dir.mkdir(exist_ok=True)
        for k, im in aligned.items():
            im.save(pair_dir / f"{sid}-{k}.png")
        w, h = aligned["before"].size
        base_tex = texture_energy(aligned["before"], anchor)
        print(f"  aligned {len(aligned)} images at {w}x{h} -> {pair_dir}")

        mask = face_mask(aligned["before"], anchor)
        for m in meta:
            d = region_score(aligned["before"], aligned[m["id"]], anchor, mask)
            drift = global_drift(aligned["before"], aligned[m["id"]], anchor, mask)
            tex = texture_energy(aligned[m["id"]], anchor) / base_tex
            ok, why = verdict_for(d, drift, m["target"])
            # target "any" is a whole-face change (the advisor render, and every
            # entry in conditions.toml, where a passing render is one that moved
            # the PHOTOGRAPH and left the face alone). There is no region to
            # concentrate in, so concentration is undefined rather than zero —
            # this used to raise KeyError and lose a whole run's scores after
            # the images were already generated and aligned.
            if m["target"] in d:
                others = max(v for k, v in d.items() if k != m["target"])
                conc = d[m["target"]] / others if others else float("inf")
            else:
                conc = float("nan")
            m.update(regions=d, concentration=conc, drift=drift, texture=tex,
                     passed=ok, reason=why)
            print(f"    {m['id']:16s} eyes={d['eyes']:5.1f} nose={d['nose']:5.1f} "
                  f"jaw={d['jaw']:5.1f}  target={m['target']} conc={conc:4.2f} "
                  f"drift={drift:4.1f} tex={tex:.2f}  {'PASS' if ok else 'FAIL ' + why}")

        results.append({"subject": sid, "describe": sub["describe"],
                        "before": before_2k.name, "afters": meta,
                        "frame": f"{w}x{h}"})

    (run_dir / "results.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
    passed = sum(1 for r in results for a in r["afters"] if a.get("passed"))
    total = sum(len(r["afters"]) for r in results)
    print(f"\n{passed}/{total} afters passed the localisation screen. "
          f"Results: {run_dir / 'results.json'}")
    print("The screen only rejects renders that provably did not do the procedure — "
          "look at every survivor before using it.")
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--spec", type=Path, default=SPEC)
    ap.add_argument("--candidates", action="store_true",
                    help="phase 1: generate the 'before' portraits and stop")
    ap.add_argument("--run", type=Path, help="run dir from phase 1 (required for phase 2)")
    ap.add_argument("--pick", action="append", default=[], metavar="ID=N",
                    help="phase 2: use candidate N for subject ID (repeatable)")
    ap.add_argument("--subject", action="append", help="limit to these subject ids")
    ap.add_argument("--variants", type=int,
                    help="override spec `variants` for this run (phase 1 only)")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    spec, by_id = load_spec(args.spec)
    if args.variants:
        spec["variants"] = args.variants

    # RETIRED 2026-09-09. Google moved this account's Flow from labs.google to
    # flow.google.com; gflow-cli drives only the old frontend, image generation
    # is not ported (ffroliva/gflow-cli#639), and both CLIs have been uninstalled.
    # Failing loudly here beats the alternative -- the last session watched this
    # script 401 and spent an hour on the auth layer before finding the cause.
    sys.exit(
        "gen/subject.py is RETIRED -- its gflow-cli backend cannot drive Flow's\n"
        "migrated flow.google.com frontend, and gflow is no longer installed.\n"
        "\n"
        "Same two phases, same subjects.toml, now:\n"
        "\n"
        "    python gen/flow-prompts.py --subject <id> --after <id> --out-dir gen/out/<id>\n"
        "    node   gen/flow.mjs pair --before-file gen/out/<id>/before.txt \\\n"
        "               --after-file gen/out/<id>/after.txt --out gen/out/<id> --name <id>\n"
        "    python gen/score.py gen/out/<id>/<id>-before-2k.jpeg --target <region> \\\n"
        "               gen/out/<id>/<id>-after-2k.jpeg\n"
        "\n"
        "Then promote.py -> sage.py -> registry.py --ingest exactly as before.\n"
        "See the header of gen/flow.mjs and the Assets section of the refina-reel skill."
    )
    gflow = find_gflow()
    subjects = [s for s in spec["subjects"] if not args.subject or s["id"] in args.subject]
    if not subjects:
        sys.exit("no subjects selected — check --subject against subjects.toml")

    if args.dry_run:
        for sub in subjects:
            print(f"\n# {sub['id']} ({sub['describe']})")
            print("BEFORE: " + spec["base"]["portrait"].format(
                describe=sub["describe"].strip(), need=sub["need"].strip()))
            for aft in sub.get("afters", []):
                print(f"AFTER [{aft['id']}, scored on {aft['target']}]: "
                      + spec["after"]["template"].format(done=aft["done"].strip()))
        return 0

    if args.candidates:
        stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
        run_dir = ROOT / spec["out"] / f"subjects-{stamp}"
        run_dir.mkdir(parents=True, exist_ok=True)
        return phase_candidates(spec, subjects, gflow, run_dir)

    if not args.run or not args.pick:
        sys.exit("phase 2 needs --run <dir> and at least one --pick ID=N "
                 "(or use --candidates for phase 1)")
    run_dir = args.run if args.run.is_absolute() else ROOT / args.run
    picks = {}
    for p in args.pick:
        sid, _, n = p.partition("=")
        if sid not in by_id or not n.isdigit():
            sys.exit(f"bad --pick {p!r}; expected ID=N with ID one of {sorted(by_id)}")
        picks[sid] = int(n)
    return phase_afters(spec, by_id, picks, gflow, run_dir)


if __name__ == "__main__":
    sys.exit(main())
