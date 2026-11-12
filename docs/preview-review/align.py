"""Pixel-lock the procedure renders to a common frame with the source portrait.

Normalises by head width + head-top row (the backdrop is flat, so the subject
mask is reliable), then crops every image to the largest rectangle that all of
them actually cover.
"""
import numpy as np
from PIL import Image

D = os.environ.get("ALIGN_SRC", "./")
PROJ = "public/portraits/"
OUT = os.environ.get("SCRATCH", "out/scratch/")

ITEMS = [
    ("before",        PROJ + "alt-before.png"),
    ("rhinoplasty",   D + "rhinoplasty_2K_202608101421.jpeg"),
    ("facelift",      D + "facelift_2K_202608101643.jpeg"),
    ("eyelid",        D + "blepharoplasty_2K_202608101648.jpeg"),
    ("advisor",       D + "alt-after_2K_202608101725.jpeg"),
]

TARGET_HW = 900.0          # head width in the aligned canvas
CW, CH = 2200, 2900        # working canvas (cropped down at the end)
AX, AY = CW // 2, 500      # head-centre x, head-top y


def metrics(im):
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
    return top, float(np.median(centres)), float(np.percentile(widths, 92))


placed, rects = {}, []
for name, path in ITEMS:
    im = Image.open(path).convert("RGB")
    top, cx, hw = metrics(im)
    s = TARGET_HW / hw
    r = im.resize((int(round(im.width * s)), int(round(im.height * s))), Image.LANCZOS)
    px, py = int(round(AX - cx * s)), int(round(AY - top * s))
    canvas = Image.new("RGB", (CW, CH), (183, 196, 204))
    canvas.paste(r, (px, py))
    placed[name] = canvas
    rects.append((px, py, px + r.width, py + r.height))
    print(f"{name:12s} src={im.width}x{im.height} head_w={hw:7.1f} scale={s:.4f} -> paste=({px},{py})")

# largest rectangle covered by every image
L = max(r[0] for r in rects); T = max(r[1] for r in rects)
R = min(r[2] for r in rects); B = min(r[3] for r in rects)
L, T = max(L, 0), max(T, 0); R, B = min(R, CW), min(B, CH)
print(f"\ncommon crop: ({L},{T})-({R},{B})  =>  {R-L}x{B-T}")

aligned = {}
for name, c in placed.items():
    a = c.crop((L, T, R, B))
    aligned[name] = a
    a.save(OUT + f"hero-{name}.png")

# anchor position inside the cropped frame
ax, ay = AX - L, AY - T
hw = TARGET_HW
print(f"anchor in crop: ({ax},{ay})  head_w={hw}")

# ---- verification: how much changed, and where -------------------------
base = np.asarray(aligned["before"]).astype(np.float32)
for name in ["rhinoplasty", "facelift", "eyelid", "advisor"]:
    d = np.abs(np.asarray(aligned[name]).astype(np.float32) - base).mean(axis=2)
    reg = {
        "nose": (ax - 0.38 * hw, ay + 0.62 * hw, ax + 0.38 * hw, ay + 1.10 * hw),
        "eyes": (ax - 0.52 * hw, ay + 0.44 * hw, ax + 0.52 * hw, ay + 0.82 * hw),
        "jaw":  (ax - 0.62 * hw, ay + 0.85 * hw, ax + 0.62 * hw, ay + 1.45 * hw),
    }
    parts = []
    for k, (x0, y0, x1, y1) in reg.items():
        sub = d[int(y0):int(y1), int(x0):int(x1)]
        parts.append(f"{k}={sub.mean():5.2f}")
    print(f"{name:12s} " + "  ".join(parts))

np.save(OUT + "anchor.npy", np.array([ax, ay, hw]))
print("\nwrote hero-*.png")
