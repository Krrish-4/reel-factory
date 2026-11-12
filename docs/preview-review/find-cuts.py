"""Find the frames where the phone screen actually changes, from the render.

    python docs/preview-review/find-cuts.py out/refina-preview-v10.mp4 570 700

Everything else in this folder reasons about what the code SHOULD do. This one
reads the finished file: it extracts the phone-screen region frame by frame over
a range and reports per-frame change, so a cut or a wipe can be located without
trusting the source at all. Use it whenever a beat "feels" out of sync -- it
settles whether the picture moved when we think it did.
"""
import subprocess
import sys

import numpy as np

W, H = 1080, 1920
# the phone occupies the middle of the frame; crop to it so headline and
# caption changes do not count as screen changes
CROP = (300, 480, 780, 1440)  # x0, y0, x1, y1


def frames(path, a, b):
    x0, y0, x1, y1 = CROP
    cmd = [
        "ffmpeg", "-v", "error",
        "-ss", str(a / 30), "-i", path,
        "-frames:v", str(b - a),
        "-vf", f"crop={x1-x0}:{y1-y0}:{x0}:{y0},scale=120:-1,format=gray",
        "-f", "rawvideo", "-",
    ]
    raw = subprocess.run(cmd, capture_output=True).stdout
    h = 120 * (y1 - y0) // (x1 - x0)
    n = len(raw) // (120 * h)
    return np.frombuffer(raw, np.uint8)[: n * 120 * h].reshape(n, h, 120)


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "out/refina-preview-v10.mp4"
    a = int(sys.argv[2]) if len(sys.argv) > 2 else 570
    b = int(sys.argv[3]) if len(sys.argv) > 3 else 700
    fr = frames(path, a, b).astype(np.float32)
    d = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))
    med = float(np.median(d))
    print(f"{path}  frames {a}-{b}   median per-frame change {med:.3f}\n")
    print(f"{'frame':>6} {'change':>8}")
    for i, v in enumerate(d):
        f = a + i + 1
        bar = "#" * min(60, int(v * 3))
        mark = ""
        if v > max(6.0, med * 8):
            mark = "  <== CUT"
        elif v > max(1.5, med * 3):
            mark = "  <- moving"
        print(f"{f:>6} {v:>8.2f} {bar}{mark}")


if __name__ == "__main__":
    sys.exit(main())
