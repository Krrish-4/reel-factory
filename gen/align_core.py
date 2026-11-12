"""Shared alignment + region measurement, factored out of docs/preview-review/align.py.

Same normalisation as the 2026-08-10 review (head width + head-top row, flat
backdrop => reliable subject mask), so numbers produced here are comparable to
the table in docs/preview-review/README.md.
"""
import numpy as np
from PIL import Image

TARGET_HW = 900.0          # head width in the aligned canvas
CW, CH = 2200, 2900        # working canvas (cropped down at the end)
AX, AY = CW // 2, 500      # head-centre x, head-top y
BACKDROP = (183, 196, 204)

# Anatomical boxes, in head-widths from the anchor (x from head centre, y below
# head top). REBUILT 2026-08-26 — the originals came from align.py and had two
# faults that made them reject working renders: `nose` (0.62-1.10) and `eyes`
# (0.44-0.82) OVERLAPPED, so an under-eye change scored as a nose change, and
# every box was wide enough to dilute a thin change into its surroundings.
# These are disjoint in y and calibrated against measured peaks: a verified
# blepharoplasty peaks at y=0.69, a verified facelift at y=1.20.
# Units are FACE height (forehead-skin to chin) and FACE width, measured from
# the skin mask by `face_anchor()` -- NOT head-width from the top of the subject
# mask. The old anchor was the top of the HAIR, so a subject with a top-knot
# (swap1) had every box pushed up onto her brow while a flat-haired subject's
# landed correctly. Hair height is not a facial landmark.
REGIONS = {
    "eyes": (-0.44, 0.20, 0.44, 0.44),   # brow-line down past the under-eye bags
    "nose": (-0.17, 0.44, 0.17, 0.66),   # narrow: the nose, not the cheeks
    "lips": (-0.26, 0.66, 0.26, 0.84),   # vermilion, corners, philtrum base
    "jaw":  (-0.50, 0.72, 0.50, 1.02),   # mandible, jowls, chin -- MINUS lips
}

# `lips` ADDED 2026-08-31, calibrated by gen/calibrate-lips.py over all nine
# registered portraits: the mouth is found as a redness peak above local
# lower-face redness, and the box is the UNION of the measured bands, not the
# median, because it has to hold every subject's mouth. Measured union was
# y 0.677-0.813 and x +-0.252 at the corners; the box opens at 0.66 (exactly
# where `nose` stops, so the two stay disjoint) and closes at 0.84, which is
# headroom -- an augmentation renders the lips LARGER than the before it is
# scored against, and a box sized to the before would clip the very change it
# is measuring.
#
# `jaw` is the one box that cannot be made disjoint by moving an edge: the
# mandible genuinely wraps around the mouth on three sides. It is therefore
# carved instead. Before this, a lip change scored as a JAW change -- the exact
# fault the 2026-08-26 rebuild fixed for eyes/nose and left standing here only
# because no reel had ever targeted the mouth.
EXCLUDES = {"jaw": ("lips",)}


def metrics(im):
    """Return (head_top_row, head_centre_x, head_width) for a portrait."""
    a = np.asarray(im.convert("RGB")).astype(np.float32)
    H, W, _ = a.shape
    corners = np.concatenate([a[:40, :40].reshape(-1, 3), a[:40, -40:].reshape(-1, 3)])
    bg = np.median(corners, axis=0)
    mask = np.linalg.norm(a - bg, axis=2) > 28
    rows = mask.sum(axis=1)
    top = int(np.argmax(rows > 0.015 * W))
    bot = H - 1 - int(np.argmax(rows[::-1] > 0.015 * W))
    lo, hi = top, top + int(0.32 * (bot - top))
    widths, centres = [], []
    for r in range(lo, hi):
        idx = np.where(mask[r])[0]
        if idx.size:
            widths.append(idx[-1] - idx[0])
            centres.append(0.5 * (idx[-1] + idx[0]))
    if not widths:
        raise ValueError("no subject found — is the backdrop flat?")
    return top, float(np.median(centres)), float(np.percentile(widths, 92))


def align(items, verbose=False):
    """items: [(name, path)]. Returns (dict name->PIL.Image, (ax, ay, head_w)).

    Every returned image shares one frame, so any two can be differenced or
    cross-faded and only the face moves.
    """
    placed, rects = {}, []
    for name, path in items:
        im = Image.open(path).convert("RGB")
        top, cx, hw = metrics(im)
        s = TARGET_HW / hw
        r = im.resize((int(round(im.width * s)), int(round(im.height * s))), Image.LANCZOS)
        px, py = int(round(AX - cx * s)), int(round(AY - top * s))
        canvas = Image.new("RGB", (CW, CH), BACKDROP)
        canvas.paste(r, (px, py))
        placed[name] = canvas
        rects.append((px, py, px + r.width, py + r.height))
        if verbose:
            print(f"{name:24s} src={im.width}x{im.height} head_w={hw:7.1f} scale={s:.4f}")

    L = max(r[0] for r in rects); T = max(r[1] for r in rects)
    R = min(r[2] for r in rects); B = min(r[3] for r in rects)
    L, T = max(L, 0), max(T, 0); R, B = min(R, CW), min(B, CH)
    aligned = {n: c.crop((L, T, R, B)) for n, c in placed.items()}
    return aligned, (AX - L, AY - T, TARGET_HW)


def region_diff(base_img, cand_img, anchor):
    """Mean per-pixel difference inside each anatomical box."""
    ax, ay, hw = anchor
    base = np.asarray(base_img).astype(np.float32)
    d = np.abs(np.asarray(cand_img).astype(np.float32) - base).mean(axis=2)
    out = {}
    for k, (x0, y0, x1, y1) in REGIONS.items():
        sub = d[int(ay + y0 * hw):int(ay + y1 * hw), int(ax + x0 * hw):int(ax + x1 * hw)]
        out[k] = float(sub.mean())
    return out


def texture_energy(img, anchor):
    """High-frequency energy over the face box — proxy for invented skin texture.

    The 2026-08-10 review found regenerated 'afters' carry more visible
    pigmentation and fine lines than the source. This is the cheap screen for it.
    """
    ax, ay, hw = anchor
    a = np.asarray(img.convert("L")).astype(np.float32)
    face = a[int(ay + 0.20 * hw):int(ay + 1.30 * hw), int(ax - 0.55 * hw):int(ax + 0.55 * hw)]
    lap = face[1:-1, 1:-1] * 4 - face[:-2, 1:-1] - face[2:, 1:-1] - face[1:-1, :-2] - face[1:-1, 2:]
    return float(np.abs(lap).mean())


def face_mask(img, anchor):
    """Boolean mask of facial SKIN — no hair, no collar, no backdrop.

    This is the fix for the screen's biggest fault. The generator redraws
    flyaway hair and the turtleneck collar on every pass, and those are the
    highest-contrast edges in the frame: an unmasked mean attributes their
    churn to whatever box they fall in. A verified blepharoplasty appeared to
    change the jaw because the collar moved.

    Skin is found by chroma, not brightness, so it survives the shadow/lighting
    differences a real edit produces. The reference patch is sampled from the
    mid-face, which is skin in every portrait this pipeline generates.
    """
    ax, ay, hw = anchor
    a = np.asarray(img.convert("RGB")).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    # YCbCr chroma — luma-independent, so a lit cheek and a shadowed jowl match.
    cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b
    cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b
    y = 0.299 * r + 0.587 * g + 0.114 * b

    patch = (slice(int(ay + 0.80 * hw), int(ay + 1.00 * hw)),
             slice(int(ax - 0.18 * hw), int(ax + 0.18 * hw)))
    ref_cb, ref_cr = np.median(cb[patch]), np.median(cr[patch])
    chroma = np.hypot(cb - ref_cb, cr - ref_cr)

    mask = (chroma < 18) & (y > 40)
    # Bound it to the face box as well, so a skin-toned backdrop or a hand
    # elsewhere in frame cannot leak in.
    box = np.zeros_like(mask)
    box[max(int(ay + 0.30 * hw), 0):int(ay + 1.60 * hw),
        max(int(ax - 0.62 * hw), 0):int(ax + 0.62 * hw)] = True
    return mask & box


def region_score(base_img, cand_img, anchor, mask=None):
    """Per-region change, measured only on facial skin, at the 90th percentile.

    p90 not mean: a procedure moves a thin band (a jawline, a lid crease) inside
    a box that is mostly unchanged cheek, and a mean over that box washes the
    signal out. p90 asks "how big is the change where it actually happened".
    Returns {region: value}; a region with too little skin in it yields nan.
    """
    base = np.asarray(base_img).astype(np.float32)
    d = np.abs(np.asarray(cand_img).astype(np.float32) - base).mean(axis=2)
    if mask is None:
        mask = face_mask(base_img, anchor)
    cx, ftop, fh, fw = face_anchor(base_img, anchor)

    def box_mask(rect):
        x0, y0, x1, y1 = rect
        m = np.zeros(d.shape, dtype=bool)
        m[max(int(ftop + y0 * fh), 0):int(ftop + y1 * fh),
          max(int(cx + x0 * fw), 0):int(cx + x1 * fw)] = True
        return m

    out = {}
    for k, rect in REGIONS.items():
        sel = box_mask(rect) & mask
        for other in EXCLUDES.get(k, ()):          # carve out overlapping boxes
            sel &= ~box_mask(REGIONS[other])
        vals = d[sel]
        out[k] = float(np.percentile(vals, 90)) if vals.size >= 200 else float("nan")
    return out


def face_anchor(img, anchor):
    """(centre_x, face_top, face_height, face_width) from the skin mask.

    Facial landmarks are the only stable frame of reference here. `metrics()`
    anchors on the top of the subject mask, which is the top of the HAIR: a
    top-knot moves it 200px and every anatomical box with it. Skin does not
    move when a hairstyle does.
    """
    m = face_mask(img, anchor)
    rows = m.sum(axis=1)
    if not rows.any():
        raise ValueError("no facial skin found -- is the backdrop flat?")
    thresh = 0.18 * rows.max()
    idx = np.where(rows > thresh)[0]
    top, bot = int(idx[0]), int(idx[-1])
    cols = m[top:bot].sum(axis=0)
    cidx = np.where(cols > 0.18 * cols.max())[0]
    cx = 0.5 * (cidx[0] + cidx[-1])
    return float(cx), float(top), float(bot - top), float(cidx[-1] - cidx[0])


def global_drift(base_img, cand_img, anchor, mask=None):
    """Median change across ALL facial skin — how much re-rendered everywhere.

    A procedure should move one region and leave the rest. A high median means
    the model regenerated the whole face and the regional change is riding on
    top of it, which is what makes two procedures on one subject impossible to
    tell apart (swap1's blepharoplasty: median 19.7 against its own facelift's
    5.3, while its eye change was genuine).
    """
    if mask is None:
        mask = face_mask(base_img, anchor)
    d = np.abs(np.asarray(cand_img).astype(np.float32)
               - np.asarray(base_img).astype(np.float32)).mean(axis=2)
    return float(np.median(d[mask]))


# The frame every shipping portrait already lives in. Measured off
# public/portraits/hero-before.png, NOT copied from the docs -- the skill says
# "head top y=77, headFrac 0.0481, head width 900", but 900 is the pre-crop
# target and the real set sits at 888. New assets must match the SET, not the
# note, or a cross-fade against sage-before will drift.
REEL_FRAME = {"size": (1218, 1601), "head_top": 76.0, "centre_x": 617.0, "head_w": 888.0}


def align_to_reel(src, frame=None, backdrop=BACKDROP):
    """Land any portrait in the reel's canonical frame, drop-in with sage-*/hero-*.

    `align()` normalises a SET against itself and crops to whatever rectangle
    they share, which is right for scoring a pair and useless for shipping: the
    output frame changes with every run. This puts one image on the fixed frame
    the compositions already expect, so a generated render can replace or join
    the existing heroes without moving the head.
    """
    f = frame or REEL_FRAME
    im = Image.open(src).convert("RGB") if not isinstance(src, Image.Image) else src.convert("RGB")
    top, cx, hw = metrics(im)
    scale = f["head_w"] / hw
    r = im.resize((max(int(round(im.width * scale)), 1),
                   max(int(round(im.height * scale)), 1)), Image.LANCZOS)
    canvas = Image.new("RGB", f["size"], backdrop)
    canvas.paste(r, (int(round(f["centre_x"] - cx * scale)),
                     int(round(f["head_top"] - top * scale))))
    return canvas
