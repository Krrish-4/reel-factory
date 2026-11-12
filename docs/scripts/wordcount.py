#!/usr/bin/env python
"""Measure a reel script against the length gate, before spending a synthesis.

The gate exists because flip-v6 was REJECTED at 88.1s as "long and thin"
against a corpus median of 55.5s, and because a script's length is only
discovered after gen-voiceover.py has already been paid for and every beat
bound has moved. This reads the same file format gen-voiceover.py does.

RATE IS CALIBRATED, NOT ASSUMED. Both finished vesta reads in this repo:
  lips  141 words, 9.7s declared pause, 61.6s render -> 163 wpm
  nose  132 words, 6.5s declared pause, 50.6s render -> 179 wpm
so 170 wpm is the midpoint and the estimate carries a +/- band from the two.
The real number still comes from the audio. This only stops a 90s script
reaching synthesis.

    python docs/scripts/wordcount.py docs/scripts/celeb-sweeney-lips.txt
"""
import re
import sys

LO_WPM, MID_WPM, HI_WPM = 163.0, 170.0, 179.0
BAND = (52.0, 66.0)  # corpus median 55.5s; flip-v6 rejected at 88.1s


def parse(path):
    lines = []
    for raw in open(path, encoding="utf-8"):
        s = raw.strip()
        if not s or s.startswith("#") or s == "---":
            continue
        text, _, pause = s.partition("|")
        lines.append((text.strip(), float(pause.strip() or 0.45)))
    return lines


def main(paths):
    bad = 0
    for path in paths:
        lines = parse(path)
        words = sum(len(re.findall(r"[\w'-]+", t)) for t, _ in lines)
        pause = sum(p for _, p in lines)
        est = words / MID_WPM * 60 + pause
        lo = words / HI_WPM * 60 + pause
        hi = words / LO_WPM * 60 + pause
        ok = BAND[0] <= est <= BAND[1]
        bad += not ok
        print(f"{path}")
        print(f"  lines {len(lines):3d}   words {words:4d}   declared pause {pause:5.2f}s")
        print(f"  est {est:5.1f}s  ({lo:.1f}-{hi:.1f}s)   "
              f"{'OK' if ok else f'OUT OF BAND {BAND[0]:.0f}-{BAND[1]:.0f}s'}")
        longest = max(lines, key=lambda l: len(re.findall(r"[\w'-]+", l[0])))
        n = len(re.findall(r"[\w'-]+", longest[0]))
        if n > 11:
            print(f"  longest line {n} words - reel-script/REFERENCE.md wants short punches: {longest[0]!r}")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:] or ["docs/scripts/lips.txt", "docs/scripts/nose.txt"]))
