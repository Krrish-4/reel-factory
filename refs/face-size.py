"""How big is the face, and where does it sit? Measured, across a whole corpus.

    python refs/face-size.py refs/corpus/*.mp4 out/refina-changed-v2.mp4
    python refs/face-size.py --json refs/face-size.json refs/corpus/*.mp4

WHY THIS EXISTS
---------------
`measure-format.py` reports "big face %" from a skin-tone fraction inside a fixed
central column, and says so in its own docstring: "APPROXIMATE ... no face
detector". That is enough to answer "is there a face on screen" and useless for
"how big is it" — which is the question that actually separates our reels from
the references.

So this uses a real detector and reports the DISTRIBUTION of face size, not a
binary. Face height as a fraction of frame height is the number that matters for
a vertical reel: it is what makes a face read on a phone at arm's length.

WHAT IS MEASURED
----------------
Per sampled frame, the largest detected face:

  height_frac  face box height / frame height
  cx, cy       face centre, as fractions of frame width and height
  coverage     % of sampled frames with any face at all

Then per reel: the median and the spread of `height_frac` over frames that have
a face, plus how much that size VARIES within the reel — a reel that holds one
face size for its whole runtime is shot differently from one that cuts between a
wide and a close-up, and that variation is invisible in a median.

CAVEATS, STATED
---------------
A Haar cascade finds upright, roughly frontal faces. It misses steep profiles and
heavy occlusion, so `coverage` is a floor, not a census — a low number means
"the detector did not find a frontal face", which can mean the shot is a profile,
a crop tighter than the whole face, or no face at all. A crop tighter than the
face box is exactly the case that matters here, so read a low coverage alongside
the contact sheet rather than as an absence of faces.
"""
import argparse
import json
import pathlib
import statistics as st
import subprocess
import sys

import cv2
import numpy as np

W, H = 270, 480  # rule U: judge pictures at a resolution where detail survives


def frames(path, every):
    cmd = ["ffmpeg", "-v", "error", "-i", str(path), "-vf",
           f"select=not(mod(n\\,{every})),scale={W}:{H}", "-vsync", "0",
           "-pix_fmt", "gray", "-f", "rawvideo", "-"]
    raw = subprocess.run(cmd, capture_output=True).stdout
    n = len(raw) // (W * H)
    return np.frombuffer(raw, np.uint8)[: n * W * H].reshape(n, H, W)


def measure(path, every=15):
    casc = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    fr = frames(path, every)
    if not len(fr):
        return None
    hs, cxs, cys, hits = [], [], [], 0
    for g in fr:
        g = cv2.equalizeHist(g)
        faces = casc.detectMultiScale(g, scaleFactor=1.12, minNeighbors=5,
                                      minSize=(24, 24))
        if len(faces) == 0:
            continue
        x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
        hits += 1
        hs.append(h / H)
        cxs.append((x + w / 2) / W)
        cys.append((y + h / 2) / H)
    if not hs:
        return {"file": pathlib.Path(path).name, "frames": len(fr),
                "coverage_pct": 0.0, "median_height_frac": None}
    return {
        "file": pathlib.Path(path).name,
        "frames": len(fr),
        "coverage_pct": round(100 * hits / len(fr), 1),
        # every per-frame reading, so band boundaries can be derived from the
        # real distribution rather than from a reel-level median
        "samples": [round(v, 4) for v in hs],
        "median_height_frac": round(float(np.median(hs)), 3),
        "p10_height_frac": round(float(np.percentile(hs, 10)), 3),
        "p90_height_frac": round(float(np.percentile(hs, 90)), 3),
        # how much the framing changes within the reel: p90/p10 of face size
        "size_variation": round(float(np.percentile(hs, 90) /
                                      max(1e-6, np.percentile(hs, 10))), 2),
        "median_cx": round(float(np.median(cxs)), 3),
        "median_cy": round(float(np.median(cys)), 3),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("videos", nargs="+")
    ap.add_argument("--every", type=int, default=15)
    ap.add_argument("--json")
    a = ap.parse_args()

    rows = []
    for v in a.videos:
        r = measure(v, a.every)
        if r:
            rows.append(r)
            h = r["median_height_frac"]
            print(f"  {r['file'][:34]:36} cover {r['coverage_pct']:5.1f}%  "
                  f"face h {('  n/a' if h is None else f'{h:5.3f}')}  "
                  f"var {r.get('size_variation', 0):4.2f}  "
                  f"cy {r.get('median_cy', 0):.2f}")

    got = [r for r in rows if r["median_height_frac"] is not None]
    if len(got) > 1:
        hs = [r["median_height_frac"] for r in got]
        vs = [r["size_variation"] for r in got]
        print(f"\n  n={len(got)}  median face height {st.median(hs):.3f} of frame "
              f"(range {min(hs):.3f}-{max(hs):.3f})")
        print(f"           median size variation {st.median(vs):.2f}x within a reel")

    if a.json:
        pathlib.Path(a.json).write_text(json.dumps(rows, indent=2) + "\n",
                                        encoding="utf-8")
        print(f"\nwrote {a.json}")


if __name__ == "__main__":
    sys.exit(main())
