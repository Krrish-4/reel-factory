"""Compare the caption WORD reveal against the speech it is captioning.

    python docs/preview-review/check-words.py

`Captions` in protocol/atoms.tsx lands words evenly across 85% of the cue's
slot:

    step = (t - f) * 0.85 / nwords      word k fades in over [f+k*step, +5]

The slot runs to 3 frames before the NEXT cue, which is not where the voice
stops -- the read leaves real pauses between phrases. So on a caption followed
by a pause, the words keep arriving into the silence long after the line has
been spoken, and the viewer reads a line that finishes well behind the voice.

This measures, per caption, where the last word lands versus where the speech
under that caption actually ends. Positive lag = words still arriving after the
voice has moved on.
"""
import re
import subprocess
import sys

FPS = 30
VO = "public/voiceover4.mp3"
REVEAL = 5  # frames a word takes to reach full opacity
SPREAD = 0.85

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


def main():
    segs = speech_segments(VO)
    print(f"{'cue f':>6} {'words':>5} {'done':>7} {'voice':>7} {'lag':>7}  text")
    print("-" * 96)
    lags = []
    for f, t, s in CUES:
        n = len(s.split(" "))
        step = (t - f) * SPREAD / max(1, n)
        done = f + (n - 1) * step + REVEAL          # last word fully in
        # speech under this caption's slot
        ov = [(max(a, f / FPS), min(b, t / FPS)) for a, b in segs
              if min(b, t / FPS) - max(a, f / FPS) > 0.02]
        if not ov:
            continue
        voice_end = max(b for _, b in ov) * FPS
        lag = (done - voice_end) / FPS
        flag = "  <-- words trail the voice" if lag > 0.35 else ""
        print(f"{f:>6} {n:>5} {done/FPS:>6.2f}s {voice_end/FPS:>6.2f}s "
              f"{lag:>+6.2f}s  {s[:38]:<38}{flag}")
        if lag > 0.35:
            lags.append((lag, f, n, s))

    print("\nworst — the line is still assembling after the voice has moved on:")
    for lag, f, n, s in sorted(lags, reverse=True):
        print(f"  f{f:<5} {lag:+.2f}s  ({n} words)  {s}")

    print(f"\n{len(lags)} of {len(CUES)} captions finish more than 0.35s late")


if __name__ == "__main__":
    sys.exit(main())
