"""Warp OUR voiceover onto the lip movements of a generated clip.

    python docs/preview-review/align-vo-to-lips.py \
        --clip  applyforme/clips/flowA-raw.mp4 \
        --vo    applyforme/vo/afm4b-hook-iris.mp3 \
        --script docs/scripts/afm4b-hook.txt --beat 1 \
        --out   applyforme/vo/afm4b-hook-aligned.mp3

WHY THIS EXISTS, AND WHY THE OBVIOUS VERSION DOES NOT WORK
----------------------------------------------------------
Google Flow generates its own voice and gives no way to supply one, so a clip's
mouth is locked to a read we did not choose and cannot reuse — a different voice
on the footage beats than on the drawn beats is not a host, it is two people.

The first attempt at this problem went the other way: keep the audio, stretch
the VIDEO. That failed, and the failure is instructive. A uniform time-stretch
lines up the first frame and the last and nothing in between, because two takes
of the same sentence do not merely differ in length — they put the stress in
different places. Endpoint alignment is not lip-sync.

So this bends the AUDIO, per word, onto positions the picture already has:

  1. transcribe the clip's own audio      -> when her mouth says each word
  2. transcribe our read                  -> when our voice says each word
  3. align BOTH onto the SCRIPT           -> a common index, character-level,
                                             so the script's wording stays
                                             authoritative (see `align()`)
  4. cut our read at PHRASE boundaries and time-scale each phrase to its target

WARP PER PHRASE, NOT PER WORD. The first version segmented on every word onset
and produced factors swinging 0.63-1.50 across a read that is only 3.9% off
overall. Those swings are not pace differences, they are quantisation: Deepgram
returns onsets on a coarse grid, and on a 200ms word that grid IS the
measurement. Warping each tiny segment by half would warble.

Phrase boundaries are real silences, so they are measured reliably. Inside a
phrase a 3.9% difference accumulates to ~0.14s over 3.7s — under five frames,
and invisible at word level. The granularity has to match what the measurement
can actually resolve.

AND THE TAIL IS THE SPEECH, NOT THE FILE. A generated clip holds after the last
syllable — this one runs 10.0s with speech ending at 8.56s. Mapping our audio
onto the FILE's end asked the final word to stretch 3.4x. The last phrase ends
where her mouth stops; silence pads the rest.

CHOOSE THE VOICE FOR PACE FIRST. Measured against this clip, Flow read at 167
wpm voiced; Aura-2's 25 feminine voices run 173-286 (median 237). `iris` at
173.2 is +3.9% and every other voice is +16% or worse. At +3.9% the warp is
inaudible; at +40% it would sound like a tape machine. The audition
(`audition-voices.py --gender feminine`) is the step that makes this work, and
it is not optional.

WHAT THIS DOES NOT GIVE YOU. Word-accurate sync, not phoneme-accurate: inside a
long word her mouth may lead or trail the sound slightly. At 9:16 under captions
that is invisible, but do not claim frame-accuracy for it.
"""

from __future__ import annotations

import argparse
import pathlib
import re
import subprocess
import sys
import tempfile

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from tts_deepgram import align, api_key, transcribe  # noqa: E402

MAX_ATEMPO_LINK = 2.0  # ffmpeg's per-filter bound; chained past it


def beat_lines(path: str, beat: int) -> list[str]:
    out, cur = [], 0
    for raw in pathlib.Path(path).read_text(encoding="utf-8").splitlines():
        s = raw.strip()
        m = re.match(r"#\s*--\s*(\d+)\.", s)
        if m:
            cur = int(m.group(1))
            continue
        if not s or s.startswith("#") or s == "---":
            continue
        if cur == beat:
            out.append(s.partition("|")[0].strip())
    if not out:
        sys.exit(f"no spoken lines for beat {beat} in {path}")
    return out


def to_wav(path: str) -> bytes:
    return subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-ar", "16000", "-ac", "1",
         "-f", "wav", "pipe:1"], capture_output=True, check=True).stdout


def dur(path: str) -> float:
    return float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", path], capture_output=True, text=True,
        check=True).stdout.strip())


def atempo_chain(factor: float) -> str:
    """ffmpeg caps atempo at [0.5, 2.0]; compose it for anything outside."""
    parts, f = [], factor
    while f > MAX_ATEMPO_LINK:
        parts.append("atempo=2.0")
        f /= MAX_ATEMPO_LINK
    while f < 0.5:
        parts.append("atempo=0.5")
        f /= 0.5
    parts.append(f"atempo={f:.6f}")
    return ",".join(parts)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--clip", required=True)
    ap.add_argument("--vo", required=True)
    ap.add_argument("--script", required=True)
    ap.add_argument("--beat", type=int, default=1)
    ap.add_argument("--out", required=True)
    ap.add_argument("--cap", type=float, default=1.18,
                    help="hard limit on any one segment's time-scale")
    ap.add_argument("--every", type=int, default=3,
                    help="subdivide a long segment every N words")
    ap.add_argument("--minseg", type=float, default=0.75,
                    help="never make a segment shorter than this")
    ap.add_argument("--split", type=float, default=0.14,
                    help="also cut a phrase at any internal pause this long")
    ap.add_argument("--warn", type=float, default=0.15,
                    help="report any segment stretched more than this")
    a = ap.parse_args()

    lines = beat_lines(a.script, a.beat)
    words = " ".join(lines).split(" ")
    # Which word index each script line starts and ends at.
    spans, n = [], 0
    for ln in lines:
        k = len(ln.split(" "))
        spans.append((n, n + k - 1))
        n += k

    key = api_key()
    lip_stt = transcribe(to_wav(a.clip), key)
    vo_stt = transcribe(to_wav(a.vo), key)
    lips, _m1 = align(words, lip_stt)
    ours, _m2 = align(words, vo_stt)
    if lips is None or ours is None:
        sys.exit("a transcript came back empty; cannot align")

    # End of the LAST word on each side, so a held tail is never stretched into.
    lip_end = max(e for _w, _s, e in lip_stt)
    vo_end = max(e for _w, _s, e in vo_stt)
    clip_len, vo_len = dur(a.clip), dur(a.vo)

    def end_of(stt, onset):
        """The end time of the transcript token that starts at `onset`.

        `align()` returns starts only, but a phrase has to be fitted on its
        SPEECH span — see the note below on why start-to-start is wrong.
        """
        best, gap = None, 1e9
        for _w, s, e in stt:
            d = abs(s - onset)
            if d < gap:
                best, gap = e, d
        return best if best is not None else onset

    print(f"{len(words)} words in {len(lines)} phrase(s) | clip {clip_len:.2f}s "
          f"(speech ends {lip_end:.2f}s) | our vo {vo_len:.2f}s\n")
    # SPLIT FURTHER AT REAL INTERNAL PAUSES.
    #
    # One factor per script line is too coarse when a line is long: inside
    # "You're applying for 50 different jobs with the same CV" the two reads
    # put their stress in different places and a single stretch cannot hold
    # both ends. Any gap the CLIP itself leaves — a real breath, not a
    # quantisation artefact — is another trustworthy anchor, so the phrase is
    # cut there too. Word onsets remain too noisy to warp on; a 120ms silence
    # is not.
    def gaps_inside(w0, w1):
        cut = []
        for i in range(w0, w1):
            e = end_of(lip_stt, lips[i])
            if lips[i + 1] - e >= a.split:
                cut.append(i)
        return cut

    # A long segment with no pause in it still drifts, because two reads of one
    # breath put their stress in different places — uniform scaling fixes
    # overall PACE but not rhythm SHAPE. Subsampled word onsets are the only
    # anchors left: every `--every` words, so quantisation (which sank the
    # per-word version at 0.63-1.50) averages out over a longer span while the
    # map still follows the shape.
    def subdivide(w0, w1):
        out, start = [], w0
        i = w0
        while i < w1:
            j = min(i + a.every, w1)
            if lips[j] - lips[start] >= a.minseg and w1 - j >= a.every:
                out.append((start, j - 1))
                start = j
            i = j
        out.append((start, w1))
        return out

    fine = []
    for w0, w1 in spans:
        start = w0
        pieces = []
        for i in gaps_inside(w0, w1):
            pieces.append((start, i))
            start = i + 1
        pieces.append((start, w1))
        for x, y in pieces:
            fine.extend(subdivide(x, y))
    if len(fine) > len(spans):
        print(f"  split {len(spans)} line(s) into {len(fine)} segment(s) "
              f"at pauses >= {a.split:.2f}s\n")
    spans = fine
    lines = [" ".join(words[x:y + 1]) for x, y in spans]

    print(f"  {'segment':<34}{'ours':>13}{'lips':>13}{'stretch':>9}{'slip':>10}")

    work = pathlib.Path(tempfile.mkdtemp())
    parts, worst, worst_p, cursor = [], 1.0, "", 0.0
    for i, (w0, w1) in enumerate(spans):
        # SPEECH span to SPEECH span. Fitting start-of-phrase to
        # start-of-NEXT-phrase looks equivalent and is not: that span is speech
        # PLUS the pause after it, so the factor is part pause, and applying it
        # to the words lands them early while the gap runs long. Rahul heard
        # exactly that. The pause is not stretched at all — it is set from the
        # clip's own measurement, below.
        s0, s1 = ours[w0], end_of(vo_stt, ours[w1])
        d0, d1 = lips[w0], end_of(lip_stt, lips[w1])
        if s1 <= s0 or d1 <= d0:
            continue
        # Target from the REAL position, not the ideal one, so a segment that
        # ran long is compressed by the next rather than pushing it late.
        # The gap below will advance `cursor` to d0 when it is behind, so the
        # effective start is max(cursor, d0) — using `cursor` raw here reads the
        # PREVIOUS segment's end, which mis-sized a phrase by 359ms.
        target = max(0.12, d1 - max(cursor, d0))
        factor = (s1 - s0) / target
        # CAP THE WARP. Subdividing a continuous phrase finds genuine local
        # rhythm differences — Flow says "50 different jobs" in 0.84s where iris
        # takes 1.16s — and forcing that gives +38% on three words, which is far
        # more audible than the uniform +17.5% it replaced. Clamped, the residual
        # is a few tens of ms of position carried into the next segment, which
        # nobody can see; an over-stretched vowel is something everybody hears.
        factor = min(max(factor, 1 / a.cap), a.cap)

        # Silence up to this phrase's onset, measured from where the assembled
        # file ACTUALLY is — not from the ideal timeline.
        #
        # THE DRIFT BUG THIS FIXES: `atempo` does not land on its target
        # length, and `-ss/-to` on an mp3 seeks to a frame boundary. Each
        # segment therefore comes out a few tens of ms off, and if the next gap
        # is computed from the IDEAL position those errors accumulate — phrase
        # one reads fine, phrase two slips, phrase three is visibly adrift.
        # Rahul heard exactly that progression. Correcting against the real
        # position puts every error into silence, where it cannot be heard,
        # and stops it compounding.
        gap = d0 - cursor
        if gap > 0.005:
            g = work / f"g{i:03d}.wav"
            subprocess.run(
                ["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i",
                 "anullsrc=r=44100:cl=mono", "-t", f"{gap:.4f}", str(g)],
                check=True)
            parts.append(g)
            cursor += dur(str(g))

        # `-ss`/`-to` BEFORE `-i`, so they trim the INPUT.
        #
        # Placed after `-i` they are output options and apply AFTER the filter
        # chain: atempo stretched the phrase to 3.76s and `-to` then cut it
        # straight back to the 3.20s it started at. The segment came out at
        # exactly its source length and the warp silently did nothing — which
        # reads as the sync getting worse down the clip, because only the
        # phrases that needed no stretch were landing.
        seg = work / f"s{i:03d}.wav"
        subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-ss", f"{s0:.4f}",
             "-to", f"{s1:.4f}", "-i", a.vo, "-filter:a", atempo_chain(factor),
             "-ar", "44100", "-ac", "1", str(seg)], check=True)
        parts.append(seg)
        got = dur(str(seg))
        cursor += got
        slip = (got - (d1 - d0)) * 1000
        flag = "  <-- " if abs(factor - 1) > a.warn else ""
        label = lines[i][:32]
        print(f"  {label:<34}{s0:6.2f}-{s1:6.2f}{d0:6.2f}-{d1:6.2f}"
              f"{factor:9.3f}{slip:+8.0f}ms{flag}")
        if abs(factor - 1) > abs(worst - 1):
            worst, worst_p = factor, label

    # Hold silence under the clip's own tail rather than stretching into it.
    tail = clip_len - cursor
    if tail > 0.02:
        t = work / "tail.wav"
        subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i",
             "anullsrc=r=44100:cl=mono", "-t", f"{tail:.4f}", str(t)], check=True)
        parts.append(t)

    lst = work / "list.txt"
    lst.write_text("".join(f"file '{p.as_posix()}'\n" for p in parts),
                   encoding="utf-8")
    # Pin the result to the clip's exact length. `atempo` and mp3 seeking each
    # land a few ms out and the errors accumulate across segments — measured
    # 847ms short over three. `apad` then `-t` makes the output exactly as long
    # as the picture, so the mux can never drift.
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0",
         "-i", str(lst), "-af", "apad", "-t", f"{clip_len:.4f}",
         "-codec:a", "libmp3lame", "-q:a", "2", a.out],
        check=True)

    out_len = dur(a.out)
    print(f"\nworst stretch {worst:.3f} on '{worst_p}'  "
          f"({(worst - 1) * 100:+.1f}%)")
    print(f"wrote {a.out}  {out_len:.2f}s against clip {clip_len:.2f}s "
          f"({(out_len - clip_len) * 1000:+.0f} ms)")
    if abs(worst - 1) > 0.25:
        print("\nWARNING: a segment moved more than 25%. That is audible. "
              "Re-audition for a voice closer to the clip's pace rather than "
              "accepting it.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
