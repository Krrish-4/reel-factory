"""Measure the cuts, transitions and easings in any reference reel.

    python docs/preview-review/analyse-reference.py <video.mp4>

Why it exists: sampling a 50s reel at 40 uniform frames lands them 1.3s apart,
and the transitions we care about last 0.3-1.2s. You cannot see them that way.
This extracts EVERY frame, then classifies.

Three passes:
  1. motion profile      -> where the events are, and how long each lasts
  2. centroid tracking   -> which direction the content travels
  3. easing fit          -> how it accelerates, vs standard easing curves

KNOWN LIMITATION (this bit me): pass 2 compares the first and last frame of a
window. A full traverse — outgoing exits left while incoming enters right —
returns the centroid to centre and reads as "in-place". Always confirm a
classification against a contact sheet of the window before trusting it.
"""
import subprocess, sys, tempfile, shutil, glob, os
import numpy as np
from PIL import Image

video = sys.argv[1] if len(sys.argv) > 1 else "out/refina-preview-v5.mp4"

fps = float(subprocess.run(
    ["ffprobe", "-v", "error", "-select_streams", "v:0",
     "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", video],
    capture_output=True, text=True).stdout.strip().split("/")[0])

tmp = tempfile.mkdtemp(prefix="ref-")
try:
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", video,
                    "-vsync", "0", "-vf", "scale=240:-1",
                    os.path.join(tmp, "%05d.png")], check=True)
    files = sorted(glob.glob(os.path.join(tmp, "*.png")))
    n = len(files)
    frames = [np.asarray(Image.open(f).convert("L")).astype(np.float32) for f in files]

    motion = np.zeros(n)
    content = np.zeros(n)
    for i, a in enumerate(frames):
        content[i] = a.std()
        if i:
            motion[i] = np.abs(a - frames[i - 1]).mean()

    med = float(np.median(motion[1:]))
    print(f"{video}: {n} frames @ {fps:.0f}fps ({n/fps:.1f}s)")
    print(f"  motion median {med:.2f}  mean {motion[1:].mean():.2f}  max {motion.max():.1f}")
    print(f"  frozen {100*(motion[1:]<0.35).mean():.1f}%   content {content.mean():.1f}")
    print("  reference (QOVES age reel): frozen 62.5%  motion 2.20  content 52.8\n")

    HI = max(3.0, med * 3.5)
    events, i = [], 1
    while i < n:
        if motion[i] > HI:
            j = i
            while j + 1 < n and motion[j + 1] > HI:
                j += 1
            events.append((i, j))
            i = j + 1
        else:
            i += 1

    BG = int(np.argmax(np.histogram(np.concatenate([f.ravel() for f in frames[::17]]),
                                    bins=256, range=(0, 256))[0]))

    def centroid(a):
        m = np.abs(a - BG) > 18
        if m.sum() < 50:
            return None, None, 0.0
        ys, xs = np.nonzero(m)
        return xs.mean(), ys.mean(), m.mean()

    def ease(t):
        return {"linear": t,
                "easeOut quad": 1 - (1 - t) ** 2,
                "easeOut cubic": 1 - (1 - t) ** 3,
                "easeOut quint": 1 - (1 - t) ** 5,
                "easeInOut cubic": np.where(t < .5, 4 * t ** 3, 1 - (-2 * t + 2) ** 3 / 2),
                "easeIn cubic": t ** 3}

    print(f"{len(events)} events above {HI:.2f}\n")
    print(f"{'start':>6} {'frames':>7} {'sec':>7} {'dur':>6} {'kind':<20} easing")
    print("-" * 74)
    for a, b in events:
        cnt = b - a + 1
        if cnt <= 2 and motion[a:b + 1].max() > med * 12:
            print(f"{a:6d} {cnt:7d} {a/fps:7.2f} {cnt/fps:6.2f} {'HARD CUT':<20} -")
            continue
        xs, ys, cs = [], [], []
        for k in range(max(0, a - 1), min(n, b + 2)):
            cx, cy, cov = centroid(frames[k])
            xs.append(cx); ys.append(cy); cs.append(cov)
        if any(v is None for v in xs):
            print(f"{a:6d} {cnt:7d} {a/fps:7.2f} {cnt/fps:6.2f} {'(frame empties)':<20} -")
            continue
        xs, ys, cs = np.array(xs), np.array(ys), np.array(cs)
        dx, dy, dc = xs[-1] - xs[0], ys[-1] - ys[0], cs[-1] - cs[0]
        if abs(dx) > 12 and abs(dx) > abs(dy) * 1.6:
            kind, track = f"push {'right' if dx>0 else 'left'}", xs
        elif abs(dy) > 12 and abs(dy) > abs(dx) * 1.6:
            kind, track = f"push {'down' if dy>0 else 'up'}", ys
        elif abs(dc) > 0.05:
            kind, track = "scale / reveal", cs
        else:
            kind, track = "in-place (verify!)", None
        best = "-"
        if track is not None and abs(track[-1] - track[0]) > 1e-6:
            norm = (track - track[0]) / (track[-1] - track[0])
            t = np.linspace(0, 1, len(norm))
            errs = {k: float(np.mean((norm - v) ** 2)) for k, v in ease(t).items()}
            k = min(errs, key=errs.get)
            best = f"{k} (err {errs[k]:.4f})"
        print(f"{a:6d} {cnt:7d} {a/fps:7.2f} {cnt/fps:6.2f} {kind:<20} {best}")
finally:
    shutil.rmtree(tmp, ignore_errors=True)
