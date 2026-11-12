"""Emit src/refina/lips/measured.ts — the numbers RefinaLips is allowed to draw.

Invariant B applied to EVIDENCE rather than to timing: no figure about a face is
typed into the composition. Two different kinds of number come out of here and
they have different standing, so they are emitted separately and labelled
separately.

  SCORES    per-region pixel change between the registered before and after,
            from gen/score.py's own machinery. These are statements about two
            image files, not about a face, which is the only kind of measurement
            this repo prints (rule E). The proof beat maps over them.

  GEOMETRY  the measured top and bottom row of each asset's vermilion, as a
            FRACTION OF FACE HEIGHT, so `faceRow(id, frac)` maps it through the
            identical cover calculation that draws the picture (invariant S).

WHY THE GEOMETRY HAS TO BE MEASURED AT ALL. `anchor()` builds its boxes from
REGIONS, which are fixed anatomical fractions. For a before and an after of one
subject the face geometry is near identical, so an anchored `lips` box is the
SAME BOX on both — a philtrum span drawn from it would be identical either side
of the edit. Beat 4's entire claim is that the gap shortens. Drawing that from
the fixed boxes would be drawing a difference that is not there, which is a
worse fault than not drawing it: the check would pass and the reel would lie.

    python gen/emit-lips.py lips1 lips2 --ts src/refina/lips/measured.ts
"""
import argparse
import json
import pathlib
import sys

import numpy as np
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from align_core import align, face_anchor, face_mask, global_drift, region_score  # noqa: E402

PORTRAITS = HERE.parent / "public" / "portraits"
REGISTRY = PORTRAITS / "registry.json"


def landmarks(img, anchor):
    """(noseBase, lipTop, mouthLine) as fractions of FACE height.

    LUMINANCE, not redness. The first version of this used the same Cr-excess
    profile that sited the `lips` box, and it was wrong for the job: that
    profile peaks on the MOUTH LINE (the darkest, reddest row) and its band
    edges are set by the chin's own warmth, which does not fall back to the
    philtrum's baseline. Drawn on the pair, its "vermilion top" sat on the skin
    ABOVE the thin lip in the before, so the philtrum it implied was too short
    on exactly the side of the comparison that needed to be long.

    In a narrow central column the three landmarks are unmistakable in
    luminance instead:

        nostril shadow   a dark minimum around 0.57
        philtrum skin    the BRIGHTEST plateau on the lower face, ~200/255
        mouth line       the darkest row on the whole lower face, ~60-75/255

    The vermilion border is where the bright philtrum plateau ends, and that is
    what actually moved: 0.691 -> 0.639 on lips1, with the mouth line itself
    unchanged at 0.716.
    """
    cx, ftop, fh, fw = face_anchor(img, anchor)
    L = np.asarray(img.convert("L")).astype(np.float32)
    xs = slice(int(cx - 0.12 * fw), int(cx + 0.12 * fw))

    def row(frac):
        return int(ftop + frac * fh)

    def prof(a, b):
        ys = np.arange(row(a), row(b))
        return ys, np.array([float(np.mean(L[y, xs])) for y in ys])

    # mouth line: the darkest row on the lower face
    mys, ml = prof(0.66, 0.82)
    mouth = mys[int(np.argmin(ml))]

    # nose base: the nostril shadow is the dark minimum above the philtrum;
    # the base is where luminance has recovered most of the way out of it.
    nys, nl = prof(0.50, 0.66)
    dark = int(np.argmin(nl))
    after = nl[dark:]
    tgt = nl[dark] + 0.85 * (after.max() - nl[dark])
    nose = nys[dark + int(np.argmax(after >= tgt))]

    # lip top: walk DOWN from the philtrum plateau to where it has clearly
    # left it. The plateau is measured between the nose base and the mouth.
    pys, pl = prof((nose - ftop) / fh, (mouth - ftop) / fh)
    plateau = float(pl.max())
    floor = float(pl.min())
    thr = floor + 0.88 * (plateau - floor)
    top_i = int(np.argmax(pl >= thr))          # first row ON the plateau
    below = np.where(pl[top_i:] < thr)[0]
    lip_top = pys[top_i + int(below[0])] if below.size else mouth

    return ((nose - ftop) / fh, (lip_top - ftop) / fh, (mouth - ftop) / fh)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("subjects", nargs="+")
    ap.add_argument("--ts", type=pathlib.Path, required=True)
    a = ap.parse_args()

    reg = json.loads(REGISTRY.read_text(encoding="utf-8"))
    scores, geom = {}, {}
    for subj in a.subjects:
        # THE AFTER COMES FROM THE RECORD, NOT FROM A NAMING CONVENTION.
        # This used to be f"{subj}-lipaug", which assumed every lip pair in the
        # repo augments. RefinaSize runs the edit the other way -- its hero
        # already has the full mouth, so its generated half is a lip REDUCTION
        # and the tool exited on a subject that was correctly registered. The
        # pairing is already stated in registry.json (`role` and `pairs_with`),
        # so read it from there and the emitter works for any lip pair.
        before = f"{subj}-before"
        if before not in reg:
            raise SystemExit(f"{before} is not registered")
        afters = [
            n for n, e in reg.items()
            if e.get("pairs_with") == before and e.get("role") == "after"
        ]
        if len(afters) != 1:
            raise SystemExit(
                f"{before} needs exactly one registered after (role=after, "
                f"pairs_with={before}); found {afters or 'none'}. Ingest it with "
                f"--role after --pairs-with {before}."
            )
        after = afters[0]
        aligned, anc = align([("b", PORTRAITS / reg[before]["file"]),
                              ("c", PORTRAITS / reg[after]["file"])])
        mask = face_mask(aligned["b"], anc)
        d = region_score(aligned["b"], aligned["c"], anc, mask)
        drift = global_drift(aligned["b"], aligned["c"], anc, mask)
        others = max(v for k, v in d.items() if k != "lips")
        scores[subj] = {
            "lips": round(d["lips"], 1), "eyes": round(d["eyes"], 1),
            "nose": round(d["nose"], 1), "jaw": round(d["jaw"], 1),
            "concentration": round(d["lips"] / others, 2), "drift": round(drift, 1),
        }
        for n in (before, after):
            al, an = align([("p", PORTRAITS / reg[n]["file"])])
            nose, lip_top, mouth = landmarks(al["p"], an)
            geom[n] = {"noseBase": round(float(nose), 4),
                       "lipTop": round(float(lip_top), 4),
                       "mouthLine": round(float(mouth), 4),
                       "philtrum": round(float(lip_top - nose), 4)}
        print(f"{subj}: lips {d['lips']:.1f} conc {scores[subj]['concentration']:.2f} "
              f"drift {drift:.1f}")
        for n in (before, after):
            g = geom[n]
            print(f"    {n:16s} nose {g['noseBase']:.3f}  lipTop {g['lipTop']:.3f}  "
                  f"mouth {g['mouthLine']:.3f}  philtrum {g['philtrum']:.3f}")

    out = [
        "/* GENERATED by gen/emit-lips.py - do not hand-edit.",
        " *",
        " * SCORES are per-region pixel change between two registered image files,",
        " * measured over facial skin by align_core.region_score. They describe the",
        " * two FILES, never the face in them - which is the only kind of figure",
        " * this repo puts on screen (rule E).",
        " *",
        " * GEOMETRY is each asset's measured facial landmarks, as fractions of face",
        " * height, for faceRow(). It is measured per asset rather than taken from",
        " * the fixed REGIONS box because the fixed box is IDENTICAL on a before and",
        " * its after, so a philtrum span drawn from it would show no change on a",
        " * beat whose whole claim is that the gap shortens.",
        " */",
        "export type LipScore = { lips: number; eyes: number; nose: number; jaw: number;"
        " concentration: number; drift: number };",
        f"export const SCORES: Record<string, LipScore> = {json.dumps(scores, indent=2)};",
        "",
        "export type Landmarks = { noseBase: number; lipTop: number; mouthLine: number; philtrum: number };",
        f"export const LANDMARKS: Record<string, Landmarks> = {json.dumps(geom, indent=2)};",
        "",
    ]
    a.ts.parent.mkdir(parents=True, exist_ok=True)
    a.ts.write_text("\n".join(out), encoding="utf-8")
    print(f"wrote {a.ts}")


if __name__ == "__main__":
    main()
