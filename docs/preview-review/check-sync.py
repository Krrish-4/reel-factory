"""Check that every caption cue is aligned to the voiceover it belongs to.

    python docs/preview-review/check-sync.py

The captions in RefinaPreviewReel.tsx were placed once, by distributing the
script's words across ffmpeg silencedetect segments proportionally. Nothing has
re-checked that since, and the cue map has been hand-edited many times while
beats moved.

Naive "distance to nearest speech onset" is NOT the right metric: several
captions are continuations inside one long spoken segment, where a large offset
from the segment's start is correct. So cues are first assigned to the speech
segment that contains them, then judged two different ways:

  * FIRST cue in a segment  -> must start within a few frames of the onset.
    Leading slightly is good (the eye needs to catch the line); lagging is a
    visible desync.
  * LATER cues in a segment -> judged against where the words actually fall,
    estimated by distributing the segment's duration across its cues in
    proportion to their character counts. This is the same model that placed
    them, so a large error means the map has drifted since.

Also checks that the LAST cue of each segment stays up until the voice stops.
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

BEATS = {
    "hook": (0, 140), "yours": (140, 289), "built": (289, 337),
    "step1": (337, 389), "step2": (389, 430), "step3": (430, 599),
    "procedures": (599, 692), "reasons": (692, 768), "r1": (768, 1001),
    "notyou": (1001, 1097), "r2": (1097, 1288), "swap": (1288, 1437),
    "nocost": (1437, 1550), "r3": (1550, 1667), "folder": (1667, 1855),
    "knowing": (1855, 1929), "disclaimer": (1929, 2100),
    "imagine": (2100, 2193), "cta": (2193, 2276),
}


def speech_segments(path, noise="-35dB", dur="0.18"):
    """-> [(start_s, end_s)] of SPEECH, inverted from silencedetect."""
    p = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", path,
         "-af", f"silencedetect=noise={noise}:d={dur}", "-f", "null", "-"],
        capture_output=True, text=True)
    # silencedetect logs at info level -- do NOT pass -v error, it hides these
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


def phrases(segs, gap=0.35):
    """Merge segments split by a breath pause into one spoken phrase.

    silencedetect breaks on any pause over its threshold, so a list read
    ("rhinoplasty, facelift, eyelid surgery") comes back as three segments and a
    dramatic pause splits a sentence in half. Those are not phrase boundaries
    and treating them as such produced a page of false alarms. Only a gap of
    `gap` seconds or more is treated as a real boundary.
    """
    out = [list(segs[0])]
    for a, b in segs[1:]:
        if a - out[-1][1] < gap:
            out[-1][1] = b
        else:
            out.append([a, b])
    return [tuple(p) for p in out]


def assign(cues, segs):
    """cue -> index of the segment it belongs to (the one containing its start,
    else the next one starting within 0.5s: a caption may lead its phrase)."""
    out = []
    for f, t, s in cues:
        cs = f / FPS
        idx = None
        for i, (a, b) in enumerate(segs):
            if a - 1e-9 <= cs <= b + 1e-9:
                idx = i
                break
        if idx is None:
            nxt = [i for i, (a, _) in enumerate(segs) if a >= cs]
            if nxt and segs[nxt[0]][0] - cs <= 0.5:
                idx = nxt[0]
        out.append(idx)
    return out


def main():
    segs = phrases(speech_segments(VO))
    owner = assign(CUES, segs)
    groups = {}
    for i, g in enumerate(owner):
        groups.setdefault(g, []).append(i)

    print(f"{len(segs)} speech segments, {len(CUES)} cues\n")

    bad = []
    print(f"{'cue f':>6} {'start':>7} {'pos':<5} {'expect':>7} {'err':>7}  text")
    print("-" * 94)
    for g in sorted(k for k in groups if k is not None):
        a, b = segs[g]
        idxs = groups[g]
        # distribute the segment across its cues by character count
        weights = [len(CUES[i][2]) for i in idxs]
        tot = sum(weights)
        acc, expect = 0.0, []
        for w in weights:
            expect.append(a + (b - a) * acc / tot)
            acc += w
        for k, i in enumerate(idxs):
            f, t, s = CUES[i]
            err = (f / FPS - expect[k]) * FPS
            pos = "1st" if k == 0 else f"{k+1}/{len(idxs)}"
            tol = 5 if k == 0 else 12
            flag = ""
            if abs(err) > tol:
                flag = "  <-- LAGS" if err > 0 else "  <-- LEADS"
                bad.append((abs(err), f, err, pos, s))
            print(f"{f:>6} {f/FPS:>6.2f}s {pos:<5} {expect[k]:>6.2f}s "
                  f"{err:>+6.1f}f  {s[:40]:<40}{flag}")
        # does the last caption of the segment hold until the voice stops?
        last = CUES[idxs[-1]]
        d = (last[1] / FPS - b) * FPS
        if d < -4:
            print(f"       {'':>7} {'':<5} {'':>7} {'':>7}  ^ ends {-d:.0f}f before "
                  f"voice stops ({b:.2f}s)")

    orphan = [CUES[i] for i, g in enumerate(owner) if g is None]
    if orphan:
        print("\ncues not inside any speech segment:")
        for f, t, s in orphan:
            print(f"  f{f:<5} {f/FPS:6.2f}s  {s}")

    print("\nranked problems:")
    if not bad:
        print("  none beyond tolerance")
    for a, f, err, pos, s in sorted(bad, reverse=True):
        print(f"  f{f:<5} {err:+6.1f}f ({err/FPS:+.2f}s) {pos:<5} {s}")

    print("\nbeat starts not on a cue frame:")
    cf = {c[0] for c in CUES}
    miss = [f"  {n:<11} f{a}" for n, (a, b) in BEATS.items() if a not in cf and a != 0]
    print("\n".join(miss) if miss else "  all beat starts land on a cue")


if __name__ == "__main__":
    sys.exit(main())
