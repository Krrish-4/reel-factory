"""Shared voiceover-timing core: script text in, per-word frames out.

This is the reusable half of `gen-words.py`, pulled out so a second reel does
not have to fork it. `gen-words.py` itself is deliberately NOT refactored onto
this module: it is pinned to `RefinaPreviewReel`, whose cut is signed off, and
rewriting its internals to prove a point would risk moving frames in an
approved reel for no benefit. When that reel is finally frozen, point it here
and delete its copies of these four functions.

Two modes, one output format:

  measure()  -- a voiceover exists. Phrase boundaries come from ffmpeg
                silencedetect; words are laid out on a SPEECH-TIME axis (all
                silence removed) so a line finishes exactly when the voice
                does. This is the real thing.

  estimate() -- no voiceover yet. Phrase durations come from a measured
                characters-per-second rate plus an explicit per-phrase pause,
                so the reel can be built, watched and judged before the read
                exists. Every frame it produces is provisional.

The point of having both behind one interface is that switching from one to
the other is a single argument, not a rewrite: build to `estimate()`, drop the
recorded VO in, re-run with `measure()`, and every cue and every word moves to
where the voice actually is. Nothing downstream is hand-placed either way.
"""
import io
import re
import subprocess

FPS = 30

# Fine enough to split a list read ("rhinoplasty, facelift, eyelid surgery").
NOISE, MINDUR = "-30dB", "0.06"


# ── measured mode ────────────────────────────────────────────────────


def duration(path):
    return float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", path], capture_output=True, text=True).stdout.strip())


def speech_segments(path, noise=NOISE, dur=MINDUR):
    """The [start, end] intervals where the narrator is actually speaking."""
    p = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", path,
         "-af", f"silencedetect=noise={noise}:d={dur}", "-f", "null", "-"],
        capture_output=True, text=True)
    starts = [float(m) for m in re.findall(r"silence_start: ([0-9.]+)", p.stderr)]
    ends = [float(m) for m in re.findall(r"silence_end: ([0-9.]+)", p.stderr)]
    total = duration(path)
    segs, cur = [], 0.0
    for i, s in enumerate(starts):
        if s > cur + 0.005:
            segs.append((cur, s))
        cur = ends[i] if i < len(ends) else total
    if cur < total - 0.005:
        segs.append((cur, total))
    return segs, total


def speech_axis(segs, a, b):
    """The speech intervals inside [a, b]."""
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


def measure(script, vo):
    """Lay `script` onto a real voiceover.

    `script` is [(text, pause_after_seconds)]; the pauses are ignored here —
    the audio has its own. Phrases are distributed across the detected speech
    segments in proportion to their character count, then each phrase's words
    are placed along the speech inside its own slot.
    """
    segs, total = speech_segments(vo)
    spoken = sum(e - s for s, e in segs)
    weights = [len(t) + 1 for t, _ in script]
    tot = sum(weights)

    # Phrase slots, in speech time, then mapped back to wall clock.
    bounds, acc = [], 0
    for w in weights:
        bounds.append(at_speech_fraction(segs, acc / tot))
        acc += w
    bounds.append(total)

    # Snap each slot start to the nearest real speech onset — the model gets
    # the proportions right but a phrase should begin where the voice does.
    onsets = [s for s, _ in segs]
    snapped = [min(onsets, key=lambda o: abs(o - b)) for b in bounds[:-1]]
    snapped = sorted(set(snapped)) if len(set(snapped)) == len(snapped) else bounds[:-1]

    cues = []
    for i, (text, _) in enumerate(script):
        f = round(snapped[i] * FPS)
        t = round((snapped[i + 1] if i + 1 < len(snapped) else total) * FPS)
        cues.append((f, t, text))

    rows = []
    for f, t, text in cues:
        words = text.split(" ")
        iv, sp = speech_axis(segs, f / FPS, t / FPS)
        if not iv or sp < 0.05:
            step = (t - f) * 0.85 / len(words)
            times = [round(f + k * step) for k in range(len(words))]
        else:
            ws = [len(w) + 1 for w in words]
            s = sum(ws)
            a, times = 0, []
            for w in ws:
                times.append(round(at_speech_fraction(iv, a / s) * FPS))
                a += w
        times = sorted(max(f, min(t - 1, x)) for x in times)
        rows.append((f, t, text, times))
    return rows, round(total * FPS), spoken / total


def estimate(script, cps, lead=0.0):
    """Lay `script` out with no voiceover, at `cps` characters per second.

    Character count, not word count: it is the better proxy for how long a
    phrase takes to say, because it separates "Rhinoplasty" from "a". `cps`
    should be MEASURED off the narrator's previous read, not guessed — see
    `narrator_rate()`.

    Each phrase gets `len(text)/cps` seconds of speech followed by its own
    declared pause, so a punchy short line can be given the silence it needs
    rather than inheriting an average. Words inside a phrase are spread by
    character weight across its speech, which is exactly what `measure()` does
    once the silence has been removed — so the two modes place words the same
    way, and only the phrase boundaries change when the real VO arrives.
    """
    rows, t = [], lead
    for text, pause in script:
        sp = len(text) / cps
        f = round(t * FPS)
        end = round((t + sp + pause) * FPS)
        words = text.split(" ")
        ws = [len(w) + 1 for w in words]
        s = sum(ws)
        a, times = 0, []
        for w in ws:
            times.append(round((t + sp * (a / s)) * FPS))
            a += w
        times = sorted(max(f, min(end - 1, x)) for x in times)
        rows.append((f, end, text, times))
        t += sp + pause
    return rows, round(t * FPS)


def narrator_rate(vo, script_words):
    """Characters per second of actual speech, and the pause fraction.

    Measured off a finished read so an estimate for the next script inherits
    this narrator's real pace instead of a book figure.
    """
    segs, total = speech_segments(vo)
    spoken = sum(e - s for s, e in segs)
    chars = sum(len(w) + 1 for w in script_words)
    return chars / spoken, 1 - spoken / total


# ── output ───────────────────────────────────────────────────────────


def write_ts(path, rows, header):
    """Emit the WordCue table.

    Written through io.open in UTF-8 rather than a shell redirect: on Windows
    `>` encodes in the console codepage (cp1252), which corrupts any non-ASCII
    character in the header and leaves a file TypeScript can still parse but
    Python cannot re-read. Header stays ASCII-only for the same reason.
    """
    buf = list(header)
    buf.append("export type WordCue = { f: number; t: number; s: string; w: number[] };")
    buf.append("export const WORD_CUES: WordCue[] = [")
    for f, t, s, times in rows:
        esc = s.replace("\\", "\\\\").replace('"', '\\"')
        buf.append(f'  {{ f: {f}, t: {t}, s: "{esc}", '
                   f'w: [{", ".join(str(x) for x in times)}] }},')
    buf.append("];")
    io.open(path, "w", encoding="utf-8", newline="\n").write("\n".join(buf) + "\n")
