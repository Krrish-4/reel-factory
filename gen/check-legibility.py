"""Preflight: can the viewer actually read it?

    python gen/check-legibility.py src/refina/changed

Exit 1 on any failure. Two checks, both for defects that shipped.

TYPE FLOOR
----------
A phone viewport is about 390 CSS px against a 1080-wide composition, so type is
seen at roughly a third of its authored size. Judged at 390, an entire reel's
annotation layer was an unreadable smudge — the running index, "SAME FACE -
NOTHING TOUCHED", the reticle labels, and the AI PREVIEW - NOT MEDICAL ADVICE
compliance chip, which is the one piece of type in the reel that is not
optional. They were 12-18px.

What DID read at that size: the 44px numerals, the 29px chips, the serif
caption. So the floor is empirical, not guessed, and it sits at 26.

CAPTION HOLD
------------
A caption's LAST word has to be on screen long enough to read after it arrives.
Spreading words across a fixed fraction of the slot put the final word so late
that the completed sentence was legible for four frames — a seventh of a second,
every phrase in the reel. It was invisible to pixel measurement (the caption is
animating the whole time) and was caught only by having Gemini transcribe the
render, where every phrase came back truncated at exactly the word that never
arrived.

With measured word onsets there is nothing to compute, only to check: the last
word must arrive at least HOLD_FRAMES before its cue ends.

NOT AESTHETICS
--------------
Neither check scores taste. "This string is 14px" and "this word has 4 frames"
are true or false. See rule P for what happens when a check starts scoring
taste.
"""
import argparse
import pathlib
import re
import sys

TYPE_FLOOR = 26          # px at 1080 width
HOLD_FRAMES = 12         # a finished caption line must hold this long
# these carry meaning and get no exemption, whatever their size
LOAD_BEARING = re.compile(r"NOT MEDICAL ADVICE|PREVIEW", re.I)

FONTSIZE = re.compile(r"fontSize:\s*(\d+)")
SIZE_PROP = re.compile(r"\bsize=\{(\d+)\}")
CUE = re.compile(r"\{ f: (\d+), t: (\d+), s: \"(.*?)\", w: \[(.*?)\] \}")


def check_type(reel):
    fails, warns = [], []
    for f in sorted(reel.rglob("*.tsx")):
        src = f.read_text(encoding="utf-8")
        for rx, what in ((FONTSIZE, "fontSize"), (SIZE_PROP, "size prop")):
            for m in rx.finditer(src):
                v = int(m.group(1))
                if v >= TYPE_FLOOR:
                    continue
                line = src[: m.start()].count("\n") + 1
                ctx = src[max(0, m.start() - 200): m.start() + 200]
                # a default on a component definition is not itself a render
                if "= ({" in ctx and "React.FC" in ctx:
                    continue
                msg = (f"{f.name}:{line} {what} {v}px is below the {TYPE_FLOOR}px "
                       f"floor — unreadable at phone scale")
                (fails if LOAD_BEARING.search(ctx) else warns).append(msg)
    return fails, warns


def check_captions(reel):
    fails = []
    for name in ("words-vo.ts", "words.ts"):
        p = reel / name
        if not p.is_file():
            continue
        src = p.read_text(encoding="utf-8")
        rows = CUE.findall(src)
        if not rows:
            continue
        for i, (f, t, text, w) in enumerate(rows):
            onsets = [int(x) for x in w.split(",") if x.strip()]
            if not onsets:
                continue
            hold = int(t) - max(onsets)
            if hold < HOLD_FRAMES:
                fails.append(
                    f"{name} cue {i} holds its finished line for {hold} frames "
                    f"(needs {HOLD_FRAMES}): {text[:52]!r}"
                )
        return fails, len(rows)
    return fails, 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("reel")
    a = ap.parse_args()
    reel = pathlib.Path(a.reel)
    if not reel.is_dir():
        sys.exit(f"not a directory: {reel}")

    tf, tw = check_type(reel)
    cf, ncues = check_captions(reel)

    print(f"type floor {TYPE_FLOOR}px; caption hold {HOLD_FRAMES}f; "
          f"{ncues} cues checked")
    for w in tw:
        print(f"  warn  {w}")
    for x in tf + cf:
        print(f"  FAIL  {x}")
    if tf or cf:
        print(f"\n{len(tf) + len(cf)} failure(s)")
        return 1
    print("\neverything that has to be read is big enough and holds long enough")
    return 0


if __name__ == "__main__":
    sys.exit(main())
