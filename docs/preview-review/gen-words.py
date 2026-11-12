"""Generate per-word caption timings that track the voice, not the cue slot.

    python docs/preview-review/gen-words.py

THE BUG THIS FIXES
------------------
`Captions` (protocol/atoms.tsx) meters words across 85% of the CUE SLOT:

    step = (t - f) * 0.85 / nwords

A slot runs until 3 frames before the next cue, so it spans the phrase AND the
pause after it. The voice does not speak during that pause. Metering words
across the whole slot therefore runs them slower than the speech, and the lag
compounds word by word — the line is always a little behind, and worst at the
end. Correcting where a cue STARTS (which is what the previous pass did) does
not touch this: the drift is inside the caption.

THE FIX
-------
Words are laid out on a SPEECH-TIME axis. All the silence under a caption is
removed, the remaining speech is measured, and the words are distributed across
that — so word k lands at the fraction of *spoken* time its characters occupy,
and the last word lands exactly as the voice stops.

Character count is the weight. It is not a real forced aligner (that needs an
acoustic model), but on a steady read it tracks far better than wall-clock
spreading, and unlike the old model it cannot drift into a pause.

Output is a TypeScript table consumed by `preview/captions.tsx`.
"""
import io
import re
import subprocess
import sys

FPS = 30
VO = "public/voiceover4.mp3"
# fine enough to split a list read ("rhinoplasty, facelift, eyelid surgery")
NOISE, MINDUR = "-30dB", "0.06"

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


# Hand-measured word onsets, for cues where char-weighting misreads the read.
#
# Character count assumes a steady rate. It breaks on an emphasised word: in
# the procedure list the narrator leans on "rhinoplasty" and leaves a beat
# after it, so the model put "facelift," at f614 when the second burst does
# not start until f635 -- 21 frames early, which is what made the slides look
# out of step. Where the burst structure has actually been measured, it wins
# over the model.
#
# Bursts measured at noise=-30dB:d=0.06:
#   f599-615   "rhinoplasty,"
#   f635-662   "facelift, eyelid surgery,"
#   f672-685   "and more"
OVERRIDES = {
    599: [599, 635, 645, 652, 672, 678],
}


def speech_segments(path, noise=NOISE, dur=MINDUR):
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
        if s > cur + 0.005:
            segs.append((cur, s))
        cur = ends[i] if i < len(ends) else total
    if cur < total - 0.005:
        segs.append((cur, total))
    return segs


def speech_axis(segs, a, b):
    """The speech intervals inside [a, b], and their total duration."""
    iv = []
    for s, e in segs:
        lo, hi = max(s, a), min(e, b)
        if hi - lo > 0.005:
            iv.append((lo, hi))
    return iv, sum(e - s for s, e in iv)


def at_speech_fraction(iv, frac):
    """Wall-clock time at `frac` of the way through the speech intervals."""
    total = sum(e - s for s, e in iv)
    want = frac * total
    for s, e in iv:
        d = e - s
        if want <= d:
            return s + want
        want -= d
    return iv[-1][1]


OUT = "src/refina/preview/words.ts"


def main():
    segs = speech_segments(VO)
    rows, report = [], []
    for f, t, s in CUES:
        words = s.split(" ")
        iv, spoken = speech_axis(segs, f / FPS, t / FPS)
        if not iv or spoken < 0.05:
            # no speech under the slot: fall back to even spread over 85%
            step = (t - f) * 0.85 / len(words)
            times = [round(f + k * step) for k in range(len(words))]
        else:
            weights = [len(w) + 1 for w in words]
            tot = sum(weights)
            acc, times = 0, []
            for w in weights:
                times.append(round(at_speech_fraction(iv, acc / tot) * FPS))
                acc += w
        if f in OVERRIDES:
            times = OVERRIDES[f]
            assert len(times) == len(words), f"override {f}: {len(times)} vs {len(words)} words"
        # never let a word land before the cue or after its slot
        times = [max(f, min(t - 1, x)) for x in times]
        times = sorted(times)
        rows.append((f, t, s, times))
        old_step = (t - f) * 0.85 / len(words)
        old_last = f + (len(words) - 1) * old_step
        report.append((f, s, old_last, times[-1], iv[-1][1] * FPS))

    buf = []
    def emit(x=""):
        buf.append(x)
    emit("/* GENERATED by docs/preview-review/gen-words.py - do not hand-edit.")
    emit(" *")
    emit(" * Per-word appearance frames, measured from public/voiceover4.mp3.")
    emit(" * Words are laid out on a speech-time axis (silence removed), so the")
    emit(" * line finishes exactly when the voice does instead of drifting into")
    emit(" * the pause after it. See the generator for why the old even spread")
    emit(" * across 85% of the cue slot ran progressively late.")
    emit(" */")
    emit("export type WordCue = { f: number; t: number; s: string; w: number[] };")
    emit("export const WORD_CUES: WordCue[] = [")
    for f, t, s, times in rows:
        esc = s.replace('"', '\\"')
        emit(f'  {{ f: {f}, t: {t}, s: "{esc}", w: [{", ".join(str(x) for x in times)}] }},')
    emit("];")

    # Written here rather than via a shell redirect: on Windows `>` encodes in
    # the console codepage (cp1252), which corrupts any non-ASCII character in
    # the header and leaves a file TypeScript can still parse but Python cannot
    # re-read. Write it ourselves, in UTF-8, and keep the header ASCII-only.
    io.open(OUT, "w", encoding="utf-8", newline="\n").write("\n".join(buf) + "\n")
    print(f"wrote {OUT}: {len(rows)} cues, "
          f"{sum(len(r[3]) for r in rows)} words", file=sys.stderr)

    print("\n/* last word: old model vs measured end of speech", file=sys.stderr)
    print(f"{'cue':>6} {'old':>7} {'new':>7} {'voice':>7} {'gained':>7}", file=sys.stderr)
    for f, s, old_last, new_last, voice in report:
        print(f"{f:>6} {old_last/FPS:>6.2f}s {new_last/FPS:>6.2f}s "
              f"{voice/FPS:>6.2f}s {(old_last-new_last)/FPS:>+6.2f}s  {s[:34]}",
              file=sys.stderr)


if __name__ == "__main__":
    sys.exit(main())
