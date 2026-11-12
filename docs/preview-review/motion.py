"""Motion + content profile for a rendered reel.

    python docs/preview-review/motion.py out/refina-preview-v3.mp4 [beats.json]

Why this exists: this treatment holds a lot of still frames by design, so
"looks static" is not a useful judgement by eye. Two numbers make it concrete.

    motion[i]  = mean |frame_i - frame_{i-1}|   0 => a literally frozen frame
    content[i] = std(frame_i)                   low => a near-empty sage frame

Read them together and against a baseline, never in isolation:

  * A high frozen%% is normal here. `out/refina-protocol-v4.mp4` — the approved
    protocol cut — measures 75.7%% frozen, mean motion 0.80, mean content 46.0.
    Compare any new render to that, not to zero.
  * motion under-reports small elements. A dotted callout or a caption word
    barely moves the average of a 240px frame, so a beat can score "frozen"
    while a callout is drawing. Do not delete animation on this number alone.
  * content is the trustworthy one for finding dead air. Anything under ~10
    that is not a deliberate text-only beat (disclaimer, CTA) is blank sage and
    should be filled.

Also flags beat boundaries with no detectable cut — an empty beat cutting to
another empty beat is invisible, which happened at the `folder` boundary in v1.
"""
import subprocess, sys, json, tempfile, shutil, glob, os
import numpy as np
from PIL import Image

FROZEN = 0.35
CUT = 14.0

video = sys.argv[1] if len(sys.argv) > 1 else "out/refina-preview-v3.mp4"
beats = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else None

tmp = tempfile.mkdtemp(prefix="motion-")
try:
    subprocess.run(
        ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", video,
         "-vsync", "0", "-vf", "scale=240:-1", os.path.join(tmp, "%05d.png")],
        check=True)
    files = sorted(glob.glob(os.path.join(tmp, "*.png")))
    n = len(files)
    motion = np.zeros(n)
    content = np.zeros(n)
    prev = None
    for i, f in enumerate(files):
        a = np.asarray(Image.open(f).convert("L")).astype(np.float32)
        content[i] = a.std()
        if prev is not None:
            motion[i] = np.abs(a - prev).mean()
        prev = a
finally:
    shutil.rmtree(tmp, ignore_errors=True)

print(f"{video}: {n} frames")
print(f"  frozen {100*(motion[1:]<FROZEN).mean():5.1f}%   "
      f"mean motion {motion[1:].mean():.2f}   mean content {content.mean():.1f}")
print("  baseline (protocol v4): frozen 75.7%   motion 0.80   content 46.0")

if beats:
    print(f"\n{'beat':12s} {'frames':>7s} {'motion':>7s} {'frozen%':>8s} {'longest':>8s} {'content':>8s}")
    print("-" * 60)
    for name, (a, b) in beats.items():
        m = motion[a + 1:b]
        best = cur = 0
        for v in m < FROZEN:
            cur = cur + 1 if v else 0
            best = max(best, cur)
        flag = "  <-- blank" if content[a:b].mean() < 10 else ""
        print(f"{name:12s} {b-a:7d} {m.mean():7.2f} {(m<FROZEN).mean()*100:7.1f}% "
              f"{best:8d} {content[a:b].mean():8.1f}{flag}")

    starts = sorted(v[0] for v in beats.values())
    soft = [s for s in starts if s and motion[s] < CUT]
    if soft:
        print("\nbeat starts with no hard cut (motion < %.0f):" % CUT)
        for s in soft:
            print(f"  f{s:5d}  motion={motion[s]:6.2f}")
