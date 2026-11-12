"""Cluster the raw build list into buildable component families.

    python refs/cluster-build.py

Reads every refs/formats/*.semantic.json, collects the animations with no
matching primitive, and writes refs/BUILD-PLAN.md.

WHY THIS IS A SEPARATE STEP
---------------------------
`library.py` deduplicates by animation NAME, and every reference names things
differently — "Bar Chart Staggered Growth", "Brow Density Scale Pointer",
"Industry influence radial network". The result was 57 items each used exactly
once, which is a list, not a plan: it tells you nothing about what to build
first because it hides the fact that a dozen of those are one chart component.

So the clustering is done semantically. The whole raw list goes to the model in
one call with instructions to group by WHAT YOU WOULD ACTUALLY WRITE, not by
what the animation was called, and to rank families by leverage — how many
distinct references a single component would unlock.

The output is a roadmap: build this one thing, satisfy these nine animations.
"""
import glob
import io
import json
import os
import sys
import importlib.util

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("d", os.path.join(HERE, "describe.py"))
D = importlib.util.module_from_spec(spec)
spec.loader.exec_module(D)


PROMPT = """You are turning a raw list of animations into an ENGINEERING PLAN.

Each item below was found in a real short-form video ad and has no equivalent in
our Remotion component library. Different videosname the same underlying mechanic
differently, so the list is far more repetitive than it looks.

Group them into COMPONENT FAMILIES: one family per component we would actually
write. Group by the mechanic and the shape of the code, not by the name or the
subject matter. A bar chart growing, a radial network spreading and a timeline
filling may or may not be one component — decide on the code, and say why.

Rank families by LEVERAGE: how many distinct source references one component
would unlock, and how reusable it is beyond them.

We already have: {primitives}

Return ONLY JSON:
{{
  "families": [
    {{"component": "the name we would give it, PascalCase",
      "what_it_does": "one sentence",
      "mechanic": "the actual animation mechanic in plain terms",
      "covers": ["exact names from the input list that this family absorbs"],
      "refs": ["source reference ids that used it"],
      "leverage": "high | medium | low",
      "effort": "small | medium | large",
      "why_this_grouping": "why these belong in one component",
      "build_notes": "concrete implementation notes for Remotion",
      "reusable_beyond": "what else it would let us make"}}
  ],
  "recommended_order": ["component names, best first, with a reason appended after ' — '"],
  "not_worth_building": [{{"item": "", "why": ""}}]
}}

Be decisive. Fewer, better-chosen families beat a one-to-one restatement of the
input. If two items differ only in what is being displayed, they are one
component.

THE LIST:
{items}
"""


def main():
    items, by_ref = [], {}
    for p in sorted(glob.glob("refs/formats/*.semantic.json")):
        label = os.path.basename(p)[: -len(".semantic.json")]
        sem = json.load(io.open(p, encoding="utf-8"))
        for a in sem.get("animations", []):
            if a.get("we_already_have"):
                continue
            items.append({
                "ref": label,
                "name": a.get("name"),
                "what_moves": a.get("what_moves"),
                "motion": a.get("motion"),
                "direction": a.get("direction"),
                "staggered": a.get("staggered"),
                "purpose": a.get("purpose"),
                "build": a.get("would_need_building"),
            })
            by_ref.setdefault(label, []).append(a.get("name"))

    if not items:
        raise SystemExit("no unbuilt animations found")
    print(f"clustering {len(items)} unbuilt animations from {len(by_ref)} references")

    key = D.api_key()
    prompt = PROMPT.format(primitives=D.OUR_PRIMITIVES,
                           items=json.dumps(items, indent=1, ensure_ascii=False))
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"response_mime_type": "application/json",
                             "temperature": 0.2, "max_output_tokens": 32768},
    }
    import urllib.request
    import time
    parsed = None
    for model in D.MODELS:
        for attempt in range(4):
            try:
                r = urllib.request.Request(
                    f"{D.API}/v1beta/models/{model}:generateContent",
                    data=json.dumps(body).encode(),
                    headers={"x-goog-api-key": key,
                             "Content-Type": "application/json"})
                d = json.load(urllib.request.urlopen(r, timeout=600))
                txt = "".join(p.get("text", "")
                              for p in d["candidates"][0]["content"]["parts"])
                parsed = json.loads(txt)
                print(f"  clustered via {model}")
                break
            except Exception as e:  # noqa: BLE001
                detail = str(e)
                if hasattr(e, "read"):
                    detail = e.read()[:200].decode(errors="replace")
                if "limit: 0" in detail:
                    break
                time.sleep(5 * (attempt + 1))
        if parsed:
            break
    if not parsed:
        raise SystemExit("clustering failed")

    fams = parsed.get("families", [])
    L = ["# Build plan\n",
         f"{len(items)} animations across {len(by_ref)} references that our "
         f"component library cannot produce, clustered into "
         f"**{len(fams)} components**.\n",
         "Generated by `refs/cluster-build.py`. The raw per-reference lists are "
         "in each `*.report.md`; this is the deduplicated engineering view.\n"]
    A = L.append

    order = parsed.get("recommended_order") or []
    if order:
        A("## Recommended order\n")
        for i, o in enumerate(order, 1):
            A(f"{i}. {o}")
        A("")

    A("## Components\n")
    rank = {"high": 0, "medium": 1, "low": 2}
    for f in sorted(fams, key=lambda x: (rank.get(x.get("leverage"), 3),
                                         -len(x.get("refs") or []))):
        A(f"### `{f.get('component')}`\n")
        A(f"{f.get('what_it_does')}\n")
        A(f"- **leverage** {f.get('leverage')} · **effort** {f.get('effort')} · "
          f"**used by {len(f.get('refs') or [])} references**")
        A(f"- **mechanic** {f.get('mechanic')}")
        A(f"- **why one component** {f.get('why_this_grouping')}")
        A(f"- **build** {f.get('build_notes')}")
        A(f"- **unlocks** {f.get('reusable_beyond')}")
        covers = f.get("covers") or []
        if covers:
            A(f"- **absorbs {len(covers)}**: " + "; ".join(covers[:12]))
        A("")

    nope = parsed.get("not_worth_building") or []
    if nope:
        A("## Judged not worth building\n")
        for n in nope:
            A(f"- **{n.get('item')}** — {n.get('why')}")
        A("")

    out = "refs/BUILD-PLAN.md"
    io.open(out, "w", encoding="utf-8").write("\n".join(L))
    print(f"wrote {out}: {len(fams)} components from {len(items)} animations")
    for f in sorted(fams, key=lambda x: (rank.get(x.get("leverage"), 3),
                                         -len(x.get("refs") or [])))[:12]:
        A2 = f"  {f.get('leverage'):<7} {f.get('effort'):<7} "
        print(A2 + f"{f.get('component'):<28} absorbs "
                   f"{len(f.get('covers') or []):>2}")


if __name__ == "__main__":
    sys.exit(main())
