"""Build the FORMAT LIBRARY from every measured + described reference.

    python refs/library.py

Reads every refs/formats/*.record.json (plus the matching .semantic.json) and
writes refs/FORMAT-LIBRARY.md — the cross-corpus view that no single reference
can give you:

  1. every reference on the same measured axes, with OUR reels in the same table
  2. archetype spread — which KINDS of video are represented
  3. treatment clustering — how many share our palette, i.e. whether this corpus
     can actually fix the "every video looks the same" problem or only the
     structural half of it
  4. the animation catalogue, grouped by the primitive the model claimed, so the
     claims can be audited in ~30 groups instead of ~300 rows
  5. the consolidated BUILD LIST — animations with no primitive, deduplicated
     across references and ranked by how many references use them

ON THE BUILD LIST
-----------------
`we_already_have` is a hint, not a verdict. The model reliably over-matches:
it has called a globe wipe `Reveal` and a node-network spread `TagStack`. A name
outside our real export list is already nulled by analyse.py, but a real name
applied to the wrong motion survives. Section 4 exists to catch those by hand —
a wrong match silently deletes a work item, which is the expensive failure.
"""
import collections
import glob
import io
import json
import os
import re
import sys

OURS = ("ours-preview-v10", "ours-protocol-v4")


def norm(s):
    """Loose key so 'Bar Chart Growth' and 'bar-chart growth' group together."""
    return re.sub(r"[^a-z0-9 ]", "", (s or "").lower()).strip()


def load_all():
    recs = {}
    for p in sorted(glob.glob("refs/formats/*.record.json")):
        label = os.path.basename(p)[: -len(".record.json")]
        rec = json.load(io.open(p, encoding="utf-8"))
        sp = f"refs/formats/{label}.semantic.json"
        sem = json.load(io.open(sp, encoding="utf-8")) if os.path.exists(sp) else {}
        recs[label] = (rec, sem)
    measured_only = {}
    for p in sorted(glob.glob("refs/formats/*.json")):
        b = os.path.basename(p)
        if b.endswith((".record.json", ".semantic.json")):
            continue
        label = b[:-5]
        if label not in recs:
            measured_only[label] = json.load(io.open(p, encoding="utf-8"))
    return recs, measured_only


def main():
    recs, measured_only = load_all()
    if not recs:
        raise SystemExit("no records yet — run refs/batch.py first")
    L = []
    A = L.append

    A("# Format library\n")
    A(f"{len(recs)} analysed references"
      f"{f' (+{len(measured_only)} measured only)' if measured_only else ''}. "
      "Built by `refs/library.py` from the per-reference records.\n")

    # ── 1. the comparison table ──────────────────────────────────────
    A("## Every reference on the same axes\n")
    A("| ref | archetype | dur | frozen | arrivals/min | cuts/min | med shot | "
      "speech | ground |")
    A("|---|---|---|---|---|---|---|---|---|")
    rows = []
    for label, (rec, _) in recs.items():
        m = rec["measured"]
        rows.append((label, rec.get("archetype", "?"), rec["duration_s"],
                     m["pacing"]["frozen_pct"], m["element_events"]["per_min"],
                     m["pacing"]["cuts_per_min"], m["pacing"]["median_shot_s"],
                     m["audio"]["speech_pct"], m["treatment"]["dominant_hex"]))
    for label, m in measured_only.items():
        rows.append((label, "(ours)" if label in OURS else "(not described)",
                     m["duration_s"], m["pacing"]["frozen_pct"],
                     m["element_events"]["per_min"], m["pacing"]["cuts_per_min"],
                     m["pacing"]["median_shot_s"], m["audio"]["speech_pct"],
                     m["treatment"]["dominant_hex"]))
    for r in sorted(rows, key=lambda x: (x[0] in OURS, x[0])):
        A(f"| {r[0]} | {str(r[1])[:22]} | {r[2]:.0f}s | {r[3]}% | {r[4]} | "
          f"{r[5]} | {r[6]}s | {r[7]}% | `{r[8]}` |")
    A("")

    refs_only = [r for r in rows if r[0] not in OURS]
    if refs_only:
        def med(i):
            v = sorted(x[i] for x in refs_only)
            return v[len(v) // 2]
        A("**Corpus medians vs ours**\n")
        A("| axis | corpus | ours-preview-v10 | ours-protocol-v4 |")
        A("|---|---|---|---|")
        ours = {r[0]: r for r in rows if r[0] in OURS}
        for name, i in (("frozen %", 3), ("arrivals/min", 4),
                        ("cuts/min", 5), ("median shot s", 6), ("speech %", 7)):
            a = ours.get("ours-preview-v10")
            b = ours.get("ours-protocol-v4")
            A(f"| {name} | {med(i)} | {a[i] if a else '-'} | {b[i] if b else '-'} |")
        A("")

    # ── 2. archetypes ────────────────────────────────────────────────
    arche = collections.Counter(rec.get("archetype", "?") for rec, _ in recs.values())
    A("## Archetypes represented\n")
    for k, v in arche.most_common():
        A(f"- **{k}** — {v}")
    A("")

    # ── 3. treatment clustering ──────────────────────────────────────
    A("## Treatment spread\n")
    def rgb(h):
        h = h.lstrip("#")
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
    base = rgb("#A1B4B9")  # our sage
    near, far = [], []
    for label, (rec, _) in recs.items():
        c = rgb(rec["measured"]["treatment"]["dominant_hex"])
        d = sum(abs(c[i] - base[i]) for i in range(3))
        (near if d < 90 else far).append((label, rec["measured"]["treatment"]["dominant_hex"], d))
    A(f"- **{len(near)}** share our palette family (colour distance < 90 from "
      f"our `#A1B4B9`)")
    A(f"- **{len(far)}** are visually different worlds\n")
    if far:
        A("Visually distinct references — these are the ones that can break the "
          "look-alike problem:\n")
        for label, hexv, d in sorted(far, key=lambda x: -x[2]):
            A(f"- `{hexv}` {label} (distance {d})")
        A("")
    if not far:
        A("> **Every reference shares our palette.** This corpus can improve "
          "STRUCTURE but will not change how the videos look. To fix that, add "
          "references from outside this visual family.\n")

    # ── 4. animation catalogue, grouped for audit ────────────────────
    by_prim = collections.defaultdict(list)
    build = collections.defaultdict(list)
    total = 0
    for label, (_, sem) in recs.items():
        for a in sem.get("animations", []):
            total += 1
            prim = a.get("we_already_have")
            if prim:
                by_prim[prim].append((label, a))
            else:
                build[norm(a.get("name"))].append((label, a))

    A(f"## Claimed matches, for audit ({total} animations)\n")
    A("Grouped by the primitive the model claimed. Scan each group and ask "
      "whether that primitive really performs that motion — a wrong match here "
      "silently removes a work item.\n")
    for prim, items in sorted(by_prim.items(), key=lambda kv: -len(kv[1])):
        A(f"**`{prim}`** — {len(items)}")
        for label, a in items[:8]:
            A(f"  - {label}: {a.get('name')} · *{a.get('motion')}* · "
              f"{str(a.get('what_moves'))[:60]}")
        if len(items) > 8:
            A(f"  - …and {len(items) - 8} more")
        A("")

    # ── 5. the build list ────────────────────────────────────────────
    A(f"## Build list — {len(build)} animations with no primitive\n")
    A("> **Grouped by NAME, which barely deduplicates anything.** Every reel "
      "names the same mechanic differently, so this list runs at roughly four "
      "raw items per real component — the first corpus produced 57 entries that "
      "clustered into 10. `refs/cluster-build.py` does that grouping "
      "semantically; read `refs/BUILD-PLAN.md` for the version worth acting on. "
      "This section is the raw material, not the plan.\n")
    for key, items in sorted(build.items(), key=lambda kv: -len(kv[1])):
        a = items[0][1]
        where = ", ".join(sorted({l for l, _ in items}))
        A(f"### {a.get('name')}  ({len(items)}x — {where})\n")
        A(f"- **moves** {a.get('what_moves')}")
        A(f"- **motion** `{a.get('motion')}` · {a.get('direction')} · "
          f"{a.get('feel')}{' · staggered' if a.get('staggered') else ''}")
        A(f"- **purpose** {a.get('purpose')}")
        A(f"- **reusable as** {a.get('reusable_as')}")
        if a.get("would_need_building"):
            A(f"- **build** {a.get('would_need_building')}")
        if a.get("_claimed_but_unknown"):
            A(f"- *(model claimed `{a['_claimed_but_unknown']}`, which we do not have)*")
        A("")

    # ── 6. device inventory across the corpus ────────────────────────
    # Count DISTINCT devices per reel, normalised. `norm` alone left plurals and
    # near-duplicates ("Citation Card" / "citation overlay card") as separate
    # entries, which is how the corpus total reached a number I had to retract.
    def devkey(n):
        k = norm(n).replace(" ", "")
        return k.rstrip("s")

    dev = collections.Counter()
    for label, (rec, _) in recs.items():
        here = {devkey(d["name"]) for d in rec.get("device_inventory", []) if d.get("name")}
        for k in here:
            dev[k] += 1
    A(f"## Devices across the corpus ({len(dev)} distinct names)\n")
    A("> Distinct NAMES, not distinct devices. Reels name the same object very "
      "differently, so this over-counts for exactly the reason the raw build "
      "list does. Treat it as a vocabulary sample, not an inventory.\n")
    A(", ".join(k for k, _ in dev.most_common(60)))
    A("")

    out = "refs/FORMAT-LIBRARY.md"
    io.open(out, "w", encoding="utf-8").write("\n".join(L))
    print(f"wrote {out}")
    print(f"  {len(recs)} references, {total} animations, "
          f"{len(build)} to build, {len(dev)} devices")
    print(f"  archetypes: {dict(arche)}")
    print(f"  palette: {len(near)} like ours, {len(far)} different")


if __name__ == "__main__":
    sys.exit(main())
