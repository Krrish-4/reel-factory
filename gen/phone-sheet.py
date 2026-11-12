"""Look at a cut the way the audience does: 390px wide, one tile per beat.

    python gen/phone-sheet.py out/refina-changed-v2.mp4 --shots src/refina/changed/shots.json
    python gen/phone-sheet.py out/x.mp4 --at 120 480 900 --out sheet.png

WHY THIS EXISTS
---------------
Every still judged in this repo was rendered at 1080 wide and looked at on a
monitor. A phone viewport is about 390 CSS px. That is a 2.8x difference in
linear size and it hides an entire class of defect -- the first time a cut was
viewed at 390 the findings were immediate and none of them had been noticed at
1080:

  - the whole annotation layer was illegible: the running index, "SAME FACE -
    NOTHING TOUCHED", the compliance chip, the reticle labels. 13-18px type at
    1080 is 5-6px on a phone.
  - a beat that reads as a considered diagram at 1080 collapsed into a small
    photo floating in grey.
  - two beats did not show their own claim at all -- a chin tilt and a mouth
    lift that are visible at full size and invisible at phone size.

None of that is measurable and all of it is obvious in one glance at the right
size. So the tool does not score anything; it just makes the correct-sized look
cheap enough to do before every render.

TYPE FLOOR
----------
As a rule of thumb from the same session: anything that must be READ wants
>= 28px at 1080 (about 10px on a phone), and anything load-bearing -- a
compliance chip, a procedure label -- wants more. Below ~20px at 1080 it is
decoration, so either size it up or accept that it is texture and stop
counting on it to carry meaning.
"""
import argparse
import json
import pathlib
import re
import subprocess
import sys

from PIL import Image, ImageDraw

PHONE_W = 390
RATIO = 1920 / 1080


def cue_bounds(shots_path):
    """Beat spans from the shot plan plus its cue table, if one is given."""
    spec = json.loads(pathlib.Path(shots_path).read_text(encoding="utf-8"))
    cues = pathlib.Path(spec["cues"])
    rows = re.findall(r"\{ f: (\d+), t: (\d+),",
                      cues.read_text(encoding="utf-8"))
    out, i = [], 0
    for b in spec["beats"]:
        a = int(rows[i][0])
        z = int(rows[i + b["lines"] - 1][1])
        # a third of the way in: past the entrance, before the exit
        out.append((b["name"], a + (z - a) // 3))
        i += b["lines"]
    return out


def grab(video, frame, w, h):
    p = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(video), "-vf",
         f"select=eq(n\\,{frame}),scale={w}:{h}", "-vsync", "0",
         "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"],
        capture_output=True)
    if not p.stdout:
        return None
    import io as _io
    return Image.open(_io.BytesIO(p.stdout)).convert("RGB")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--shots", help="shots.json, to place one tile per beat")
    ap.add_argument("--at", nargs="*", type=int, help="explicit frame numbers")
    ap.add_argument("--cols", type=int, default=5)
    ap.add_argument("--out", default=None)
    a = ap.parse_args()

    if a.shots:
        picks = cue_bounds(a.shots)
    elif a.at:
        picks = [(str(f), f) for f in a.at]
    else:
        sys.exit("give --shots or --at")

    w = PHONE_W
    h = int(round(w * RATIO))
    tiles = []
    for name, f in picks:
        im = grab(a.video, f, w, h)
        if im is None:
            print(f"  ! could not read frame {f}")
            continue
        d = ImageDraw.Draw(im)
        cap = f"{name}  f{f}"
        d.rectangle([0, 0, 8 * len(cap) + 12, 22], fill=(12, 14, 16))
        d.text((6, 6), cap, fill=(255, 255, 255))
        tiles.append(im)

    if not tiles:
        sys.exit("no frames read")
    cols = min(a.cols, len(tiles))
    rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * w, rows * h), (18, 20, 22))
    for i, t in enumerate(tiles):
        sheet.paste(t, ((i % cols) * w, (i // cols) * h))

    out = a.out or str(pathlib.Path(a.video).with_suffix("").name + "-phone.png")
    sheet.save(out)
    print(f"wrote {out}  ({len(tiles)} beats at {w}px, the width a phone gives you)")
    print("Look at it before rendering again. If a label cannot be read here, "
          "it is not in the video.")


if __name__ == "__main__":
    sys.exit(main())
