"""Postflight: find frames with an unexplained empty band at an edge.

    python gen/check-frames.py out/refina-ratio-v5.mp4
    python gen/check-frames.py out/x.mp4 --margin 0.16 --show 8

Exit 1 if any frame is flagged.

WHY THIS EXISTS
---------------
A broken frame has reached the render in every reel this repo has produced, and
each was found by accident rather than by a check:

  mirror2   f760   -- the still crashed; caught only because a sweep of stills
                      happened to include that frame
  changed          -- a black letterbox baked into EVERY beat by a bug in
                      reframe.py; caught only when someone looked at a still
  ratio-v5  f1518  -- a plate caught mid-slide: a third of the frame empty, the
                      face pushed off the bottom, the caption across her eyes.
                      Still in the shipped file.

All three are the same shape: a large, uniform, unexplained band at an edge of
the frame. Nobody renders a still at a transition boundary, which is precisely
where they occur.

HOW IT DECIDES
--------------
For every sampled frame, measure the largest near-uniform margin at each edge as
a fraction of that dimension. A reel has a baseline -- a letterboxed design or a
flat stage will show margins on every frame -- so the test is not "has a margin"
but "has a margin far larger than this reel's own median". That way a deliberate
framing device does not fire on every frame, and a one-off transition artefact
does.

This is a FACT check, not an aesthetic one: it asks whether a frame contains a
band of nothing, which is true or false. It does not judge pacing. See rule P
for what happens when a check starts scoring taste.
"""
import argparse
import subprocess
import sys

import numpy as np

W, H = 160, 284  # same analysis resolution as refs/measure-format.py
UNIFORM_TOL = 6.0  # per-channel spread that still counts as "one flat colour"


def frames(path, every=2):
    """Decode to a small greyscale-ish RGB array; every Nth frame."""
    cmd = ["ffmpeg", "-v", "error", "-i", str(path), "-vf",
           f"select=not(mod(n\\,{every})),scale={W}:{H}", "-vsync", "0",
           "-pix_fmt", "rgb24", "-f", "rawvideo", "-"]
    raw = subprocess.run(cmd, capture_output=True).stdout
    a = np.frombuffer(raw, np.uint8)
    n = a.size // (W * H * 3)
    return a[: n * W * H * 3].reshape(n, H, W, 3).astype(np.int16)


def margin_fracs(f):
    """Largest near-uniform run inward from each edge, as a fraction."""
    out = []
    # rows from the top, rows from the bottom, cols from left, cols from right
    for axis, size, rev in ((0, H, False), (0, H, True), (1, W, False), (1, W, True)):
        lines = f if axis == 0 else f.transpose(1, 0, 2)
        if rev:
            lines = lines[::-1]
        # a line is flat if its own colour spread is tiny
        flat = lines.max(axis=1) - lines.min(axis=1)
        flat = (flat.max(axis=1) <= UNIFORM_TOL)
        # and it must also match the first line, or it is a different band
        run = 0
        for i, ok in enumerate(flat):
            if not ok:
                break
            if i and np.abs(lines[i].mean(axis=0) - lines[0].mean(axis=0)).max() > UNIFORM_TOL:
                break
            run = i + 1
        out.append(run / size)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--every", type=int, default=2, help="sample every Nth frame")
    ap.add_argument("--margin", type=float, default=0.14,
                    help="flag a margin this much larger than the reel's median")
    ap.add_argument("--show", type=int, default=10)
    a = ap.parse_args()

    v = frames(a.video, a.every)
    if not len(v):
        sys.exit(f"could not decode {a.video}")

    m = np.array([margin_fracs(f) for f in v])  # (n, 4)
    worst = m.max(axis=1)
    base = float(np.median(worst))
    limit = base + a.margin

    bad = [(int(i * a.every), float(worst[i]), int(np.argmax(m[i])))
           for i in range(len(v)) if worst[i] > limit]

    edges = ["top", "bottom", "left", "right"]
    print(f"{a.video}: {len(v)} frames sampled (every {a.every})")
    print(f"  median largest edge band {100 * base:4.1f}%   "
          f"flagging above {100 * limit:4.1f}%")

    if not bad:
        print("\nno frame carries an unexplained empty band")
        return 0

    # group consecutive flagged frames into spans, so one artefact reports once
    spans, run = [], [bad[0]]
    for prev, cur in zip(bad, bad[1:]):
        if cur[0] - prev[0] <= a.every * 3:
            run.append(cur)
        else:
            spans.append(run)
            run = [cur]
    spans.append(run)

    print(f"\n{len(spans)} span(s), {len(bad)} frames:")
    for s in spans[: a.show]:
        peak = max(s, key=lambda x: x[1])
        print(f"  f{s[0][0]}-{s[-1][0]}  worst f{peak[0]} "
              f"{100 * peak[1]:.0f}% of the {edges[peak[2]]} edge is one flat colour")
    if len(spans) > a.show:
        print(f"  ... and {len(spans) - a.show} more")
    print("\nRender a still at each worst frame and look before shipping.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
