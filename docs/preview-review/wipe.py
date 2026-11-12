"""Build wipe tests from the aligned heroes: does the change survive a crop-in?"""
import numpy as np
from PIL import Image, ImageDraw

OUT = os.environ.get("SCRATCH", "out/scratch/")
ax, ay, hw = np.load(OUT + "anchor.npy")

img = {n: Image.open(OUT + f"hero-{n}.png").convert("RGB")
       for n in ["before", "rhinoplasty", "facelift", "eyelid", "advisor"]}
W, H = img["before"].size

def box(dx, y0, y1):
    return (int(ax - dx * hw), int(ay + y0 * hw), int(ax + dx * hw), int(ay + y1 * hw))

REGION = {
    "rhinoplasty": box(0.38, 0.62, 1.10),   # nose
    "eyelid":      box(0.52, 0.44, 0.82),   # eyes
    "facelift":    box(0.62, 0.85, 1.45),   # jaw + neck
    "advisor":     (0, 0, W, H),            # full frame
}

# --- sanity: draw the crop boxes on the before -------------------------
prev = img["before"].copy()
d = ImageDraw.Draw(prev)
for n, c in [("rhinoplasty", (255, 80, 80)), ("eyelid", (80, 200, 255)), ("facelift", (120, 255, 120))]:
    d.rectangle(REGION[n], outline=c, width=7)
prev.resize((W // 2, H // 2), Image.LANCZOS).save(OUT + "boxes.png")

# --- full-frame switch strip: does the head stay locked? ---------------
order = ["before", "rhinoplasty", "facelift", "eyelid", "advisor"]
tw = 400
strip = Image.new("RGB", (tw * len(order), int(H * tw / W)), (0, 0, 0))
for i, n in enumerate(order):
    strip.paste(img[n].resize((tw, int(H * tw / W)), Image.LANCZOS), (i * tw, 0))
strip.save(OUT + "switch_strip.png")

FR = 28
for name in ["rhinoplasty", "facelift", "eyelid", "advisor"]:
    x0, y0, x1, y1 = REGION[name]
    b = img["before"].crop((x0, y0, x1, y1))
    a = img[name].crop((x0, y0, x1, y1))
    cw = 640
    ch = int(b.height * cw / b.width)
    b, a = b.resize((cw, ch), Image.LANCZOS), a.resize((cw, ch), Image.LANCZOS)

    frames = []
    for f in range(FR):
        t = f / (FR - 1)
        seam = int(t * cw)
        fr = b.copy()
        if seam > 0:
            fr.paste(a.crop((0, 0, seam, ch)), (0, 0))
        dd = ImageDraw.Draw(fr)
        dd.line([(seam, 0), (seam, ch)], fill=(255, 255, 255), width=3)
        frames.append(fr)
    frames = frames + frames[::-1]
    frames[0].save(OUT + f"wipe_{name}.gif", save_all=True, append_images=frames[1:],
                   duration=70, loop=0, optimize=True)

    # static filmstrip at 5 seam positions for inspection
    picks = [0, FR // 4, FR // 2, 3 * FR // 4, FR - 1]
    fs = Image.new("RGB", (cw * len(picks) + 8 * (len(picks) + 1), ch + 16), (15, 15, 15))
    for i, p in enumerate(picks):
        fs.paste(frames[p], (8 + i * (cw + 8), 8))
    fs.save(OUT + f"filmstrip_{name}.png")
    print(f"wipe_{name}.gif  crop={x1-x0}x{y1-y0}")

# side-by-side before/after of the crop region, no seam
for name in ["rhinoplasty", "facelift", "eyelid"]:
    x0, y0, x1, y1 = REGION[name]
    b = img["before"].crop((x0, y0, x1, y1)); a = img[name].crop((x0, y0, x1, y1))
    cw = 760; ch = int(b.height * cw / b.width)
    pair = Image.new("RGB", (cw * 2 + 24, ch + 16), (15, 15, 15))
    pair.paste(b.resize((cw, ch), Image.LANCZOS), (8, 8))
    pair.paste(a.resize((cw, ch), Image.LANCZOS), (cw + 16, 8))
    pair.save(OUT + f"pair_{name}.png")
print("done")
