"""Generate cue and per-word timings for RefinaMirrorReel.

    python docs/preview-review/gen-words-mirror.py

THE SCRIPT BELOW IS THE SOURCE OF TRUTH for this reel. Frame numbers are not
typed anywhere -- not here, not in `words.ts`, not in the composition's beat
table. Edit the text, re-run, and every cue, every word and every beat boundary
moves with it.

TWO MODES
---------
There is no voiceover for this script yet; the user records it once the cut is
ready. So this runs in ESTIMATE mode, at a rate measured off the SAME
narrator's previous read (`public/voiceover4.mp3`): characters per second of
actual speech, plus an explicit pause after each phrase.

When the VO lands, drop it in as `public/voiceover5.mp3` and re-run. The script
switches to MEASURED mode by itself -- phrase boundaries come from
silencedetect and words are laid out on the speech-time axis. Nothing here
needs editing, and no frame anywhere is hand-placed in either mode.

    ffmpeg -i vo1.mp3 -i vo2.mp3 -filter_complex \\
      "[0:a][1:a]concat=n=2:v=0:a=1[a]" -map "[a]" public/voiceover5.mp3

WHY PAUSES ARE DECLARED PER PHRASE
----------------------------------
This script is written in short punches -- "Held it there." / "Let go." /
"At home. On your own time." Those lines are the pause; spreading one average
gap across them would flatten the thing that makes the writing work. So each
phrase carries the silence that should follow it, and the estimate honours it.
The measured mode ignores these numbers entirely -- the read has its own.
"""
import sys

sys.path.insert(0, "docs/preview-review")

import os  # noqa: E402

from voscript import FPS, estimate, measure, narrator_rate, write_ts  # noqa: E402

VO = "public/voiceover5.mp3"
REF_VO = "public/voiceover4.mp3"
OUT = "src/refina/mirror/words.ts"

# (phrase, seconds of silence after it)
SCRIPT = [
    # -- the mirror ---------------------------------------------------
    ("You've done it in the mirror.", 0.55),
    ("Pulled the skin back at your temples.", 0.45),
    ("Lifted your cheek with two fingers.", 0.45),
    ("Held it there.", 0.70),
    ("Let go.", 1.10),
    ("That is the whole decision.", 0.60),
    ("A guess you make with your hands", 0.25),
    ("and finish in your imagination.", 0.95),
    # -- so we built Refina -------------------------------------------
    ("So we built Refina.", 0.55),
    ("Upload one photo.", 0.45),
    ("Choose the procedure you're considering.", 0.45),
    ("And see it rendered on your own face.", 0.60),
    # split three ways on purpose: each negation gets its own picture
    ("Not a diagram.", 0.30),
    ("Not a gallery.", 0.30),
    ("Your face.", 0.95),
    # -- three things change ------------------------------------------
    ("Three things change once you can see it.", 0.80),
    # -- 1. you stop guessing -----------------------------------------
    ("First, you stop guessing.", 0.50),
    ("The picture in your head was never accurate.", 0.55),
    ("It was hope on a good day", 0.30),
    ("and dread on a bad one.", 0.70),
    ("Now it is just a photograph.", 0.90),
    # -- 2. what you don't want ---------------------------------------
    ("Second, you find out what you don't want.", 0.55),
    ("Ruling a procedure out is an answer too,", 0.35),
    ("and it costs you nothing here.", 0.90),
    # -- 3. before anyone is selling ----------------------------------
    ("And third, you decide before anyone is selling to you.", 0.60),
    ("At home. On your own time.", 0.55),
    ("Not across a desk from someone", 0.25),
    ("with a price list and a waiting room.", 0.90),
    # -- preview, not a promise ---------------------------------------
    ("Refina is a preview, not a promise.", 0.55),
    ("Your surgeon determines your result.", 0.80),
    ("But you should get to see it", 0.25),
    ("before you spend another year imagining it.", 0.85),
    # -- CTA ----------------------------------------------------------
    ("Search Refina AI on the App Store.", 0.40),
]

# The previous reel's script, used only to measure this narrator's pace.
REF_WORDS = (
    "Right now you're deciding whether to change your face based on someone "
    "else's before-and-afters We think you should be able to see it on yours "
    "So we built Refina Upload one photo choose a procedure and see a "
    "realistic preview of what it would look like on your own face "
    "rhinoplasty, facelift, eyelid surgery, and more There are three reasons "
    "this matters First, it's your face Every surgeon's gallery is someone "
    "else's bone structure someone else's skin someone else's starting point "
    "None of it tells you what happens to you Second, you can explore Compare "
    "the original and the preview side by side Try a different procedure "
    "Change your mind Change it back There's no cost to looking and nothing "
    "you do here is permanent And third, it makes the conversation easier "
    "Instead of walking into a consultation with a vague idea and a folder of "
    "other people's photos you walk in knowing what you actually want Refina "
    "is a preview, not a promise your surgeon determines your result But you "
    "shouldn't have to imagine it first Search Refina AI on the App Store"
).split(" ")

# Beat boundaries are expressed as CUE INDICES, never as frames. This is the
# whole point: the composition asks "where does cue 12 start?" and gets an
# answer derived from the audio, so re-running the generator after the real
# read arrives moves the pictures with the words automatically.
#
# name -> (first cue index, one past the last cue index)
BEATS = {
    "mirror1": (0, 1),     # You've done it in the mirror.
    "temples": (1, 2),
    "cheek": (2, 3),
    "held": (3, 4),
    "letgo": (4, 5),
    "decision": (5, 6),
    "imagination": (6, 8),
    "built": (8, 9),
    "step1": (9, 10),
    "step2": (10, 11),
    "step3": (11, 12),
    "notdiagram": (12, 13),
    "notgallery": (13, 14),
    "yourface": (14, 15),
    "three": (15, 16),
    "r1": (16, 18),        # First, you stop guessing / never accurate
    "hopedread": (18, 20),
    "photograph": (20, 21),
    "r2": (21, 22),        # Second, you find out what you don't want
    "rulingout": (22, 23),
    "nocost": (23, 24),
    "r3": (24, 25),        # And third, ... selling to you
    "athome": (25, 26),
    "desk": (26, 28),
    "disclaimer": (28, 30),
    "imagine": (30, 32),
    "cta": (32, 33),
}

# Headline track: one per section, held across many beats. Same index-based
# addressing, so these travel with the script too.
# (first cue, one past last, [lines], italic second line?)
HEADLINES = [
    (0, 5, ["You've done it", "in the mirror"], False),
    (5, 8, ["A guess you finish", "in your imagination"], True),
    (8, 15, ["See it on", "your own face"], False),
    (16, 21, ["1. You stop guessing"], False),
    # One line, not two: a two-line headline here runs down into the tag
    # stack below it and the two collide. Measured in the v1 render.
    (21, 24, ["2. What you don't want"], False),
    (24, 28, ["3. You decide first"], False),
    (28, 32, ["A preview,", "not a promise"], True),
]

# The chapter card, and the accumulating claim tags. Both must read as the same
# three things the section headlines above say, or the card stops being a table
# of contents for what follows.
REASON_INDEX = ["You stop guessing", "You find out what you don't want", "You decide first"]
REASON_TAGS = ["No more guessing", "Freedom to rule out", "You decide first"]


def main():
    words = " ".join(t for t, _ in SCRIPT).split(" ")
    measured = os.path.exists(VO)

    if measured:
        rows, total, spoken = measure(SCRIPT, VO)
        mode = f"MEASURED from {VO}"
        note = f"{len(rows)} cues, {spoken * 100:.0f}% speech"
    else:
        cps, pausefrac = narrator_rate(REF_VO, REF_WORDS)
        rows, total = estimate(SCRIPT, cps)
        mode = "ESTIMATED - no voiceover recorded yet"
        note = (f"{cps:.1f} chars/s measured off {REF_VO} "
                f"({pausefrac * 100:.0f}% of that read was pause)")

    header = [
        "/* GENERATED by docs/preview-review/gen-words-mirror.py - do not hand-edit.",
        " *",
        f" * {mode}",
        f" * {note}",
        " *",
        " * Edit the SCRIPT table in the generator and re-run. Cue frames, word",
        " * frames, beat bounds and the total length are all derived from it, so",
        " * nothing here can drift out of step with the words.",
        " *",
        " * WHEN THE VOICEOVER ARRIVES: save it as public/voiceover5.mp3 and re-run.",
        " * The generator switches to measured mode on its own and every frame in",
        " * this file moves to where the voice actually is.",
        " */",
    ]

    beats = {k: (rows[a][0], rows[b - 1][1]) for k, (a, b) in BEATS.items()}
    heads = [(rows[a][0], rows[b - 1][1], ls, it) for a, b, ls, it in HEADLINES]

    extra = ["", f"export const TOTAL = {total};", ""]
    extra.append("/** Beat bounds, derived from the cue table. [start, end) */")
    extra.append("export const BEATS = {")
    for k, (f, t) in beats.items():
        extra.append(f"  {k}: [{f}, {t}],")
    extra.append("} as const;")
    extra.append("")
    extra.append("/** Section headline track: one entry per section. */")
    extra.append("export const HEADLINES = [")
    for f, t, ls, it in heads:
        lines = ", ".join('"' + x.replace('"', '\\"') + '"' for x in ls)
        extra.append(f"  {{ f: {f}, t: {t}, lines: [{lines}], "
                     f"italicSecond: {str(it).lower()} }},")
    extra.append("] as const;")
    extra.append("")
    extra.append("export const REASON_INDEX = [")
    for r in REASON_INDEX:
        extra.append(f'  "{r}",')
    extra.append("] as const;")
    extra.append("")
    extra.append("export const REASON_TAGS = [")
    for r in REASON_TAGS:
        extra.append(f'  "{r}",')
    extra.append("] as const;")

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    write_ts(OUT, rows, header)
    with open(OUT, "a", encoding="utf-8", newline="\n") as fh:
        fh.write("\n".join(extra) + "\n")

    print(f"wrote {OUT}", file=sys.stderr)
    print(f"  mode   {mode}", file=sys.stderr)
    print(f"  rate   {note}", file=sys.stderr)
    print(f"  cues   {len(rows)}   words {len(words)}", file=sys.stderr)
    print(f"  total  {total} frames = {total / FPS:.2f}s", file=sys.stderr)
    print("", file=sys.stderr)
    print(f"{'cue':>4} {'start':>6} {'end':>6} {'secs':>6}  text", file=sys.stderr)
    for i, (f, t, s, _) in enumerate(rows):
        print(f"{i:>4} {f:>6} {t:>6} {(t - f) / FPS:>6.2f}  {s}", file=sys.stderr)
    print("", file=sys.stderr)
    for k, (f, t) in beats.items():
        print(f"  beat {k:<12} {f:>5} -> {t:>5}  ({(t - f) / FPS:.2f}s)", file=sys.stderr)


if __name__ == "__main__":
    sys.exit(main())
