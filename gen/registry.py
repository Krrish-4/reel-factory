"""The asset registry: what every portrait IS, measured once, at ingest.

    python gen/registry.py --list
    python gen/registry.py --ingest gen/out/<run>/demo1/pair/demo1-overhead.png \
        --as demo1-overhead --subject demo1 --set conditions-20260826 \
        --depicts condition:overhead --role after --pairs-with demo1-before
    python gen/registry.py --export        # rewrite src/refina/assets.ts

WHY THIS EXISTS
---------------
Two bugs kept recurring and both are the same bug: facts about an image lived
somewhere other than the image.

1. FRAMING. Head geometry was recomputed in four places (`align_core`,
   `promote`, `reframe`, `docs/preview-review/align`) and stored in none. Three
   generation runs each produced a ~900px head on a different canvas -- 82%, 67%
   and 50% of frame width -- so the same woman changed size between beats and
   nobody noticed until it was on screen.

2. LABELS. `<Card name="flood-06a" label="RHINOPLASTY" />` is an assertion about
   what a photograph depicts, typed by hand, checked by nobody. Invariant E says
   a label may never claim something the asset is not, and it was enforced by me
   remembering.

So: measured geometry and the declared claim live together, in one record,
written when the asset is created. The label a composition renders is read FROM
that record, which makes mislabelling a build error rather than a discipline.

ONE FRAME, ENFORCED AT INGEST
-----------------------------
Every registered asset is reframed to `FRAME` on the way in. That is what
actually fixes the framing problem -- the registry only *detects* drift; the
canonical frame *removes* it, because two assets cannot disagree about a head
size they were both normalised to.

WHAT THIS DOES NOT KNOW
-----------------------
Provenance cannot be invented. An asset generated through `gen/subject.py`
carries its spec, prompt hash and screen result. An asset that predates this
file gets `depicts: unverified` and is never silently promoted to a claim --
`check-assets.py` fails a composition that labels one.
"""
import argparse
import hashlib
import io
import json
import pathlib
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, str(pathlib.Path(__file__).parent))

from align_core import REGIONS, face_anchor, metrics  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
REGISTRY = ROOT / "public" / "portraits" / "registry.json"
PORTRAITS = ROOT / "public" / "portraits"
TS_OUT = ROOT / "src" / "refina" / "assets.ts"

# The canonical frame every registered portrait is normalised to. `head_frac`
# is head width as a fraction of frame width; `head_top_frac` is where the top
# of the head sits down the frame. Change these and every asset must be
# re-ingested together -- they are a contract between assets, not a preference.
FRAME = {"w": 1440, "h": 1920, "head_frac": 0.60, "head_top_frac": 0.13}

# how a `depicts` value renders on screen; the registry is the only place a
# procedure name may be bound to an asset
DISPLAY = {
    "condition:overhead": "OVERHEAD",
    "condition:frontlit": "FRONT-LIT",
    "condition:wide-close": "WIDE, UP CLOSE",
    "condition:long-lens": "85MM, 2M BACK",
    "condition:chin-down": "CHIN DOWN",
    "condition:chin-level": "CHIN LEVEL",
    "condition:relaxed": "RELAXED",
    "condition:slight-lift": "SLIGHT LIFT",
    "procedure:facelift": "FACELIFT",
    "procedure:rhinoplasty": "RHINOPLASTY",
    "procedure:blepharoplasty": "UPPER BLEPHAROPLASTY",
    "procedure:chin-augmentation": "CHIN AUGMENTATION",
    "procedure:lip-augmentation": "LIP AUGMENTATION",
    "procedure:lip-reduction": "LIP REDUCTION",
    # RefinaTrio. Six feature edits in one render (brows, eyes, nose, lips,
    # skin, hair) with the face outline held -- not one procedure, so it is
    # labelled by what changed rather than by a procedure name it is not.
    "procedure:feature-refinement": "FEATURE REFINEMENT",
    # RefinaSize. Its hero is the one asset in this repo that is NOT a render:
    # a consented photograph of a real woman, restaged to the house portrait
    # and repainted by gen/sage.py. It gets a label of its own because the
    # reel's honesty depends on the viewer being able to tell which pictures
    # came out of a camera and which came out of a model.
    "photo:unmodified": "PHOTOGRAPH, UNMODIFIED",
    # RefinaBangs. The client's real photographs of the hero, restaged to the
    # house portrait by image edit -- two different sittings made to match.
    # "Unmodified" would be false and "same sitting" doubly so; the label says
    # what was done to them.
    "photo:edited": "EDITED PHOTOGRAPH",
    # A fringe added to a generated portrait. Names the operation, never an
    # outcome: it is a hair edit, not a procedure, and the face is not claimed
    # to be untouched (bangs2's measurably is not).
    "hair:fringe-generated": "FRINGE, GENERATED",
    # A TURNED HEAD IS A RENDER, NOT A SECOND SITTING. The angle views in
    # subjects.toml are generated i2i off a frontal master, so the side view is
    # a model's account of a face it has seen from the front — never evidence
    # of what that person's profile actually is. Labelling it "same sitting"
    # would claim a photograph that was never taken, which is rule E with the
    # asset record doing the lying. The label names the operation instead.
    "view:profile-generated": "SIDE VIEW, GENERATED",
    # The difference map for a GENERATED pair, not a computed one. Its label
    # names the two files and the operation, never an outcome -- the numbers
    # beside it describe pixels we can account for, not a face. Rule E.
    "derived:pair-difference": "THIS PAIR, PER-PIXEL DIFFERENCE",
    # Derived assets (gen/asym.py). These are not renders and not procedures --
    # each is a pure geometric operation on a registered master, so its label
    # names the OPERATION rather than an outcome. That is what lets RefinaFlip
    # put its evidence on screen: the claim a viewer reads is exactly the
    # transform that produced the picture, and it comes from the record.
    "derived:flip": "SAME FILE, FLIPPED",
    "derived:half-left": "LEFT HALF, DOUBLED",
    "derived:half-right": "RIGHT HALF, DOUBLED",
    "derived:mirror-difference": "PHOTO vs ITS MIRROR",
    "none": "",
    "unverified": "",
}


def load():
    if REGISTRY.is_file():
        return json.loads(REGISTRY.read_text(encoding="utf-8"))
    return {}


def save(reg):
    REGISTRY.parent.mkdir(parents=True, exist_ok=True)
    REGISTRY.write_text(json.dumps(reg, indent=2, sort_keys=True) + "\n",
                        encoding="utf-8")


def backdrop(im):
    """Studio colour, sampled from the TOP corners only.

    Same reason `sage.py` gives: a dark garment reaches the bottom edge on these
    crops and drags a four-corner median toward it.
    """
    a = np.asarray(im.convert("RGB")).astype(int)
    k = max(8, a.shape[1] // 60)
    c = np.concatenate([a[:k, :k].reshape(-1, 3), a[:k, -k:].reshape(-1, 3)])
    return [int(v) for v in np.median(c, axis=0)]


def reframe_to_contract(im):
    """Put one portrait on FRAME. Returns the new image.

    Kept here rather than imported from `reframe.py` because the contract is a
    registry concept: an asset is not registered until it is on the frame, and
    the two must not be able to disagree about what the frame is.
    """
    top, cx, head_w = metrics(im)
    W = head_w / FRAME["head_frac"]
    H = W * (FRAME["h"] / FRAME["w"])
    left = cx - W / 2
    upper = top - FRAME["head_top_frac"] * H
    box = (int(round(left)), int(round(upper)),
           int(round(left + W)), int(round(upper + H)))

    # `Image.crop` pads out-of-bounds with BLACK, and these crops routinely run
    # off the plate. Pasting the padded crop kept a black letterbox baked into
    # every asset -- it reached the screen before anyone traced it here.
    w, h = im.size
    canvas = Image.new("RGB", (box[2] - box[0], box[3] - box[1]),
                       tuple(backdrop(im)))
    ix0, iy0 = max(0, box[0]), max(0, box[1])
    ix1, iy1 = min(w, box[2]), min(h, box[3])
    if ix1 > ix0 and iy1 > iy0:
        canvas.paste(im.crop((ix0, iy0, ix1, iy1)), (ix0 - box[0], iy0 - box[1]))
    return canvas.resize((FRAME["w"], FRAME["h"]), Image.LANCZOS)


def measure(im):
    """Everything about an image that is a fact rather than a claim."""
    top, cx, head_w = metrics(im)
    # anchor is (centre_x, head_top, head_width) and face_anchor wants the PIL
    # image, not an array -- it converts internally for the chroma mask
    fx, ftop, fh, fw = face_anchor(im, (cx, top, head_w))
    return {
        "w": im.size[0],
        "h": im.size[1],
        "head_top": round(float(top), 1),
        "head_cx": round(float(cx), 1),
        "head_w": round(float(head_w), 1),
        # face geometry from the SKIN mask, which a hairstyle cannot move --
        # this is what anatomical anchors are computed against
        "face": {
            "cx": round(fx, 1),
            "top": round(ftop, 1),
            "height": round(fh, 1),
            "width": round(fw, 1),
        },
        "backdrop": backdrop(im),
    }


def ingest(src, name, declared, dest=None, reframe=True):
    dest = pathlib.Path(dest or PORTRAITS) / f"{name}.png"
    im = Image.open(src).convert("RGB")
    if reframe:
        im = reframe_to_contract(im)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest)

    reg = load()
    entry = {k: v for k, v in declared.items() if v is not None}
    entry["file"] = dest.name
    entry["sha1"] = hashlib.sha1(dest.read_bytes()).hexdigest()[:16]
    entry["frame"] = "canonical" if reframe else "raw"
    entry["measured"] = measure(im)
    entry.setdefault("depicts", "unverified")
    entry.setdefault("subject", None)
    reg[name] = entry
    save(reg)
    return entry


def export_ts(path=None):
    """Emit the record as a typed TS module the compositions import."""
    reg = load()
    path = pathlib.Path(path or TS_OUT)
    names = sorted(reg)
    out = [
        "/* GENERATED by gen/registry.py -- do not hand-edit.",
        " *",
        " * Measured geometry and the declared claim for every registered",
        " * portrait. A composition reads an asset's LABEL from here rather than",
        " * typing it, which is what makes invariant E structural instead of a",
        " * thing someone has to remember: a card cannot claim a procedure the",
        " * asset record does not carry.",
        " *",
        " * `face` is measured off the skin mask, so anatomical anchors survive a",
        " * change of hairstyle. See src/refina/anchors.ts for the mapping into",
        " * frame coordinates.",
        " */",
        "export type AssetFace = { cx: number; top: number; height: number; width: number };",
        "export type Asset = {",
        "  file: string;",
        "  subject: string | null;",
        "  depicts: string;",
        "  label: string;",
        "  role?: string;",
        "  pairsWith?: string;",
        "  set?: string;",
        "  w: number;",
        "  h: number;",
        "  face: AssetFace;",
        "};",
        "",
        f"export const FRAME = {json.dumps(FRAME)} as const;",
        "",
        "/** Anatomical boxes in FACE units: x is a fraction of face width from",
        " *  the face centre, y a fraction of face height from the face top.",
        " *  Emitted from gen/align_core.REGIONS so the screen that grades a",
        " *  render and the callout that points at it cannot drift apart. */",
        f"export const REGIONS = {json.dumps(REGIONS)} as const;",
        "export type RegionName = keyof typeof REGIONS;",
        "",
        "export const ASSETS = {",
    ]
    for n in names:
        e = reg[n]
        m = e["measured"]
        f = m["face"]
        out.append(
            f'  "{n}": {{ file: "{e["file"]}", subject: {json.dumps(e.get("subject"))}, '
            f'depicts: "{e.get("depicts", "unverified")}", '
            f'label: {json.dumps(DISPLAY.get(e.get("depicts", "unverified"), ""))}, '
            + (f'role: "{e["role"]}", ' if e.get("role") else "")
            + (f'pairsWith: "{e["pairs_with"]}", ' if e.get("pairs_with") else "")
            + (f'set: "{e["set"]}", ' if e.get("set") else "")
            + f'w: {m["w"]}, h: {m["h"]}, '
            f'face: {{ cx: {f["cx"]}, top: {f["top"]}, height: {f["height"]}, width: {f["width"]} }} }},'
        )
    out += ["} as const;", "",
            "export type AssetId = keyof typeof ASSETS;", ""]
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(out), encoding="utf-8", newline="\n")
    return path, len(names)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ingest", type=pathlib.Path)
    ap.add_argument("--as", dest="name")
    ap.add_argument("--subject")
    ap.add_argument("--set", dest="set_")
    ap.add_argument("--depicts", default="unverified")
    ap.add_argument("--role")
    ap.add_argument("--pairs-with", dest="pairs_with")
    ap.add_argument("--no-reframe", action="store_true")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--export", action="store_true")
    a = ap.parse_args()

    if a.ingest:
        if not a.name:
            sys.exit("--ingest needs --as <name>")
        if a.depicts not in DISPLAY:
            sys.exit(f"unknown --depicts {a.depicts!r}; known: {sorted(DISPLAY)}")
        e = ingest(a.ingest, a.name, {
            "subject": a.subject, "set": a.set_, "depicts": a.depicts,
            "role": a.role, "pairs_with": a.pairs_with,
        }, reframe=not a.no_reframe)
        m = e["measured"]
        print(f"{a.name}: {m['w']}x{m['h']}  head {m['head_w']:.0f}px "
              f"@ y{m['head_top']:.0f}  face h{m['face']['height']:.0f}  "
              f"depicts {e['depicts']}")

    if a.list:
        reg = load()
        print(f"{len(reg)} registered")
        for n in sorted(reg):
            e = reg[n]
            m = e["measured"]
            print(f"  {n:22} {e.get('depicts','?'):26} "
                  f"head {m['head_w']:6.1f} @ {m['head_top']:6.1f}  "
                  f"subj {e.get('subject')}")

    if a.export:
        p, n = export_ts()
        print(f"wrote {p} ({n} assets)")


if __name__ == "__main__":
    main()
