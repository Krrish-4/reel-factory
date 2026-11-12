"""Validate caption<->voiceover alignment by coverage and implied speaking rate.

    python docs/preview-review/check-rate.py

There is no ASR here, so we cannot read the words out of the audio. But a bad
alignment is still falsifiable: a human read holds a fairly steady rate, so if
the text on screen is the text being spoken, chars/second should sit near the
reel's median. Text that implies 1.5x the median is too much text for that
audio; 0.5x is too little. Either way the caption is not covering the words.

Two corrections over the naive version, both of which produced false alarms:

  * A caption is an INTERVAL [f, t], not a point. Speech is checked for
    coverage by that interval, not by which cue started most recently.
  * silencedetect splits on breath pauses INSIDE a phrase (a list like
    "rhinoplasty, facelift, eyelid surgery" splits three ways). Segments wholly
    covered by one caption are merged into that caption before rating it.
"""
import re
import subprocess
import sys

FPS = 30
VO = "public/voiceover4.mp3"

CUES = [
    (0, 40, "Right now you're deciding"),
    (43, 89, "whether to change your face"),
    (92, 185, "based on someone else's before-and-afters"),
    (188, 233, "We think you should be able"),
    (236, 276, "to see it on yours"),
    (289, 334, "So we built Refina"),
    (337, 386, "Upload one photo"),
    (389, 427, "choose a procedure"),
    (430, 481, "and see a realistic preview"),
    (484, 596, "of what it would look like on your own face"),
    (599, 689, "rhinoplasty, facelift, eyelid surgery, and more"),
    (692, 765, "There are three reasons this matters"),
    (768, 825, "First, it's your face"),
    (828, 904, "Every surgeon's gallery is someone else's bone structure"),
    (907, 944, "someone else's skin"),
    (947, 998, "someone else's starting point"),
    (1001, 1094, "None of it tells you what happens to you"),
    (1097, 1170, "Second, you can explore"),
    (1173, 1285, "Compare the original and the preview side by side"),
    (1288, 1317, "Try a different procedure"),
    (1320, 1362, "Change your mind"),
    (1365, 1434, "Change it back"),
    (1437, 1485, "There's no cost to looking"),
    (1488, 1547, "and nothing you do here is permanent"),
    (1550, 1664, "And third, it makes the conversation easier"),
    (1667, 1725, "Instead of walking into a consultation"),
    (1728, 1771, "with a vague idea"),
    (1774, 1852, "and a folder of other people's photos"),
    (1855, 1926, "you walk in knowing what you actually want"),
    (1929, 2027, "Refina is a preview, not a promise"),
    (2030, 2097, "your surgeon determines your result"),
    (2100, 2190, "But you shouldn't have to imagine it first"),
    (2193, 2268, "Search Refina AI on the App Store"),
]


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


def overlap(a0, a1, b0, b1):
    return max(0.0, min(a1, b1) - max(a0, b0))


def main():
    segs = speech_segments(VO)
    cues = [(f / FPS, t / FPS, f, t, s) for f, t, s in CUES]

    # --- per caption: how much speech it covers, and the implied rate --------
    print(f"{'cue f':>6} {'caption span':>14} {'speech':>7} {'rate':>6} {'x':>5}  text")
    print("-" * 100)
    rates = []
    for c0, c1, f, t, s in cues:
        spoken = sum(overlap(c0, c1, a, b) for a, b in segs)
        rates.append(len(s) / spoken if spoken > 0.05 else None)
    good = sorted(r for r in rates if r)
    med = good[len(good) // 2]

    issues = []
    for (c0, c1, f, t, s), r in zip(cues, rates):
        spoken = sum(overlap(c0, c1, a, b) for a, b in segs)
        if r is None:
            print(f"{f:>6} {c0:>6.2f}-{c1:<7.2f} {spoken:>6.2f}s {'--':>6} {'--':>5}  "
                  f"{s[:40]:<40}  <-- NO SPEECH UNDER THIS CAPTION")
            issues.append((99.0, f, s, "no speech under caption"))
            continue
        x = r / med
        flag = ""
        if x > 1.45:
            flag = "  <-- too much text for the audio"
        elif x < 0.62:
            flag = "  <-- too little text for the audio"
        print(f"{f:>6} {c0:>6.2f}-{c1:<7.2f} {spoken:>6.2f}s {r:>6.1f} {x:>5.2f}  "
              f"{s[:40]:<40}{flag}")
        if flag:
            issues.append((abs(x - 1), f, s, flag.strip("  <-- ")))

    print(f"\nmedian rate {med:.1f} chars/s")

    # --- speech that no caption covers --------------------------------------
    print("\nspeech with no caption on screen:")
    dead = []
    for a, b in segs:
        covered = sum(overlap(a, b, c0, c1) for c0, c1, *_ in cues)
        if b - a - covered > 0.2:
            dead.append((a, b, b - a - covered))
    if not dead:
        print("  none")
    for a, b, gap in dead:
        print(f"  {a:6.2f}-{b:<6.2f}  {gap:.2f}s uncovered")

    # --- captions that overlap the wrong phrase -----------------------------
    print("\ncaption straddling a phrase boundary (shows during the previous line):")
    for i, (c0, c1, f, t, s) in enumerate(cues):
        if i == 0:
            continue
        # the segment the PREVIOUS caption's words live in
        prev = cues[i - 1]
        for a, b in segs:
            if a < c0 < b and overlap(prev[0], prev[1], a, b) > 0.25:
                print(f"  f{f:<5} '{s[:34]}' appears at {c0:.2f}s, "
                      f"but speech {a:.2f}-{b:.2f}s is still the previous line")
                issues.append((50.0, f, s, "straddles previous phrase"))
                break

    print("\nranked:")
    for _, f, s, why in sorted(issues, reverse=True):
        print(f"  f{f:<5} {why:<34} {s}")


if __name__ == "__main__":
    sys.exit(main())
