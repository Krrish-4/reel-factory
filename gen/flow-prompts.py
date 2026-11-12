"""Render a subject's before/after prompts from gen/subjects.toml to text files.

The prompts a render was made from are a casting decision and belong in the
spec, not in a shell history. This is the seam between subjects.toml (the
source of truth for WHO and WHAT PROCEDURE) and gen/flow.mjs (which only knows
how to drive the browser).

    python gen/flow-prompts.py --subject bleph2 --after blepharoplasty --out-dir gen/out/bleph2
    node gen/flow.mjs pair --before-file gen/out/bleph2/before.txt \
        --after-file gen/out/bleph2/after.txt --out gen/out/bleph2 --name bleph2

Replaces the prompt-building half of subject.py, which cannot run any more:
its gflow-cli backend does not support Google's migrated flow.google.com
frontend. See the header of gen/flow.mjs.
"""
import argparse
import pathlib
import sys
import tomllib

SPEC = pathlib.Path(__file__).resolve().parent / "subjects.toml"


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--subject", required=True, help="subject id in subjects.toml")
    ap.add_argument("--after", help="after id (default: the subject's first)")
    ap.add_argument("--out-dir", required=True)
    ap.add_argument("--angles", action="store_true",
                    help="also emit one prompt per [[angles.views]] entry")
    ap.add_argument("--spec", default=str(SPEC))
    a = ap.parse_args()

    spec = tomllib.loads(pathlib.Path(a.spec).read_text(encoding="utf-8"))
    subs = {s["id"]: s for s in spec["subjects"]}
    if a.subject not in subs:
        sys.exit(f"no subject '{a.subject}' in {a.spec}. Have: {', '.join(sorted(subs))}")
    sub = subs[a.subject]

    afters = {x["id"]: x for x in sub.get("afters", [])}
    if not afters:
        sys.exit(f"subject '{a.subject}' declares no afters")
    aid = a.after or next(iter(afters))
    if aid not in afters:
        sys.exit(f"no after '{aid}' on '{a.subject}'. Have: {', '.join(sorted(afters))}")
    aft = afters[aid]

    before = spec["base"]["portrait"].format(describe=sub["describe"], need=sub["need"])
    # An after may name another template section. Not every edit is a
    # procedure: [hair] holds the face still and changes only the hair, and the
    # default template's "actual cosmetic procedure" sentence is wrong for it.
    after = spec[aft.get("template", "after")]["template"].format(done=aft["done"])

    out = pathlib.Path(a.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    (out / "before.txt").write_text(before, encoding="utf-8")
    (out / "after.txt").write_text(after, encoding="utf-8")

    # A subject whose before is a SUPPLIED photograph (source = "photo") gets a
    # restage prompt instead: the photo is the identity anchor, uploaded through
    # `flow.mjs derive`, and only the studio setup changes. before.txt is still
    # written as the record of who is in the file, never as a prompt to submit.
    if sub.get("source") == "photo":
        (out / "restage.txt").write_text(spec["restage"]["template"], encoding="utf-8")
        print(f"restage : {out/'restage.txt'} -- supplied photo, do NOT submit before.txt")

    # Turntable views, if the spec declares any. Each is an i2i edit off the
    # subject's own frontal render, so identity is anchored to a file rather
    # than re-described -- a second description of the same face is a second
    # casting, and it shows.
    views = spec.get("angles", {}).get("views", [])
    if a.angles and views:
        tmpl = spec["angles"]["template"]
        for v in views:
            (out / f"angle-{v['id']}.txt").write_text(tmpl.format(view=v["view"]), encoding="utf-8")
        print(f"angles  : {len(views)} -> " + ", ".join(v["id"] for v in views))

    print(f"subject : {sub['id']}  ({sub['describe']})")
    print(f"after   : {aid}  target={aft['target']}")
    print(f"aspect  : {spec.get('aspect', '3:4')}")
    print(f"wrote   : {out/'before.txt'} ({len(before)} chars)")
    print(f"          {out/'after.txt'} ({len(after)} chars)")
    print()
    print(f"next: node gen/flow.mjs pair --before-file {out/'before.txt'} "
          f"--after-file {out/'after.txt'} --out {out} --name {sub['id']}")
    print(f"then: python gen/score.py <before> --target {aft['target']} <after>")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
