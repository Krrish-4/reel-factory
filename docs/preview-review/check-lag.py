"""How many words are on screen at the moment each phrase finishes being spoken?

    python docs/preview-review/check-lag.py

A non-circular test of the caption fix. When the voice stops speaking a phrase,
the whole line should be on screen. Count the words actually visible at that
instant under each model:

  OLD  words metered evenly across 85% of the cue slot (protocol/atoms.tsx)
  NEW  measured per-word frames from preview/words.ts

The old model spreads words across the slot, which includes the pause after the
phrase — so at the moment the voice stops, some words have not appeared yet.
That shortfall is the lag the viewer sees, and it is worst on the last word of
every line.
"""
import json
import re
import subprocess
import sys

FPS = 30
VO = "public/voiceover4.mp3"
WORDS_TS = "src/refina/preview/words.ts"


def speech_segments(path, noise="-35dB", dur="0.18"):
    p = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", path,
         "-af", f"silencedetect=noise={noise}:d={dur}", "-f", "null", "-"],
        capture_output=True, text=True)
    starts = [float(m) for m in re.findall(r"silence_start: ([0-9.]+)", p.stderr)]
    ends = [float(m) for m in re.findall(r"silence_end: ([0-9.]+)", p.stderr)]
    total = float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", path], capture_output=True, text=True).stdout.strip())
    segs, cur = [], 0.0
    for i, s in enumerate(starts):
        if s > cur + 0.01:
            segs.append((cur, s))
        cur = ends[i] if i < len(ends) else total
    if cur < total - 0.01:
        segs.append((cur, total))
    return segs


def load_cues():
    src = open(WORDS_TS, encoding="utf-8").read()
    out = []
    for m in re.finditer(
            r'\{ f: (\d+), t: (\d+), s: "((?:[^"\\]|\\.)*)", w: \[([0-9, ]+)\] \}', src):
        f, t, s, w = int(m.group(1)), int(m.group(2)), m.group(3), m.group(4)
        out.append((f, t, s.replace('\\"', '"'), [int(x) for x in w.split(",")]))
    return out


def main():
    segs = speech_segments(VO)
    cues = load_cues()
    print(f"{'cue':>6} {'n':>3} {'voice ends':>11} {'OLD shown':>10} {'NEW shown':>10}  text")
    print("-" * 92)
    old_short = new_short = 0
    for f, t, s, w in cues:
        words = s.split(" ")
        n = len(words)
        ov = [b for a, b in segs if min(b, t / FPS) - max(a, f / FPS) > 0.02]
        if not ov:
            continue
        vend = max(ov) * FPS
        step = (t - f) * 0.85 / n
        old = sum(1 for k in range(n) if f + k * step + 5 <= vend)
        new = sum(1 for k in range(n) if w[k] + 5 <= vend)
        old_short += n - old
        new_short += n - new
        mark = ""
        if old < n and new == n:
            mark = "  fixed"
        elif new < n:
            mark = f"  still {n - new} short"
        print(f"{f:>6} {n:>3} {vend/FPS:>10.2f}s {old:>7}/{n:<2} {new:>7}/{n:<2}  "
              f"{s[:34]:<34}{mark}")

    tot = sum(len(c[2].split(" ")) for c in cues)
    print(f"\nwords not yet on screen when their phrase ends:")
    print(f"  OLD model: {old_short} of {tot}")
    print(f"  NEW model: {new_short} of {tot}")


if __name__ == "__main__":
    sys.exit(main())
