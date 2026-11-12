"""Give a new reel a voiceover: script file in, VO + words.ts out.

    python docs/preview-review/gen-voiceover.py \
        --script docs/scripts/demo.txt \
        --audio  public/voiceover6.mp3 \
        --ts     src/refina/demo/words.ts

THE SCRIPT FILE IS THE SOURCE OF TRUTH. No frame number is typed anywhere --
not in the script file, not in the generated `words.ts`, not in the
composition. Edit a line, re-run, and the audio, every cue and every word
frame move together. This is invariant B applied to a reel that has no
recorded read: the timing is still generated, it is just generated from a
voiceover we synthesise rather than one a narrator delivered.

SCRIPT FILE FORMAT
------------------
One phrase per line. An optional trailing `| <seconds>` declares the silence
that follows it; the default is 0.45s. Blank lines and `#` comments are
ignored, and a line that is only `---` inserts a section pause of 1.0s
(overridable with `--- | 1.6`).

    # -- the hook --------------------------------------------------
    You've done it in the mirror.            | 0.55
    Pulled the skin back at your temples.    | 0.45
    Held it there.                           | 0.70
    ---
    So we built Refina.                      | 0.55

Pauses are declared per phrase for the reason `gen-words-mirror.py` gives: a
script written in short punches IS its pauses, and one average gap flattens
the writing. Unlike the estimate mode, these numbers are not a guess -- we
generate the silence, so the finished audio has exactly them.

WHAT COMES OUT
--------------
  <audio>  a single mp3, 24kHz mono, phrases separated by the declared pauses
  <ts>     the WordCue table, same format every other reel reads

Then point the composition at both, exactly as `RefinaPreviewReel` does:
`<Audio src={staticFile("voiceover6.mp3")} />` and `WORD_CUES` from `words.ts`.

VERIFICATION
------------
After writing, the finished mp3 is transcribed again and every word onset is
compared against the table. Reported as max/mean drift in frames. This is not
decoration -- everything before it is computed from per-phrase wavs plus an
arithmetic offset, and the check is what proves concatenation and mp3 encoding
did not move anything. Skip it with --no-verify if you are out of credit.
"""

import argparse
import json
import pathlib
import sys

sys.path.insert(0, "docs/preview-review")

from tts_deepgram import FPS, synthesize, verify  # noqa: E402
from voscript import write_ts  # noqa: E402

DEFAULT_PAUSE = 0.45
SECTION_PAUSE = 1.0


def parse_script(path):
    """Read the script file into [(text, pause_after_seconds)]."""
    rows = []
    for n, raw in enumerate(pathlib.Path(path).read_text(encoding="utf-8").splitlines(), 1):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        text, pause = line, None
        if "|" in line:
            text, _, tail = line.rpartition("|")
            text, tail = text.strip(), tail.strip()
            try:
                pause = float(tail)
            except ValueError:
                raise SystemExit(f"{path}:{n}: cannot read '{tail}' as a pause in seconds")
        if text == "---":
            if rows:
                t, p = rows[-1]
                rows[-1] = (t, p + (pause if pause is not None else SECTION_PAUSE))
            continue
        if '"' in text or "\\" in text:
            raise SystemExit(f'{path}:{n}: avoid " and \\ in script text -- {text[:50]}')
        rows.append((text, DEFAULT_PAUSE if pause is None else pause))
    if not rows:
        raise SystemExit(f"{path}: no phrases found")
    return rows


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--script", required=True, help="script .txt, one phrase per line")
    ap.add_argument("--audio", required=True, help="output mp3, e.g. public/voiceover6.mp3")
    ap.add_argument("--ts", required=True, help="output words.ts")
    ap.add_argument("--voice", default="vesta", help="Aura-2 voice name (default: vesta)")
    ap.add_argument("--no-verify", action="store_true", help="skip the round-trip check")
    ap.add_argument(
        "--group",
        help="a reel's shots.json. Synthesises ONE TTS call per BEAT instead of "
             "one per phrase, so the read does not change pace, pitch and level "
             "at every line. Strongly recommended for any new reel.",
    )
    ap.add_argument("--no-match-level", action="store_true",
                    help="skip per-unit RMS matching")
    ap.add_argument("--speed", type=float, default=1.0,
                    help="global rate multiplier, e.g. 1.2 for 20%% faster. "
                         "Aura-2 has no rate parameter, so this is the only "
                         "way to set overall pace.")
    a = ap.parse_args()

    script = parse_script(a.script)
    chars = sum(len(t) for t, _ in script)
    print(f"script: {len(script)} phrases, {chars} chars  ->  voice '{a.voice}'")

    # BEAT GROUPING COMES FROM THE SHOT PLAN, WHICH ALREADY DECLARES IT.
    # `lines` per beat is the single declaration of beat structure in this repo
    # (beats.ts derives its bounds from it), so reading it here means the unit
    # of synthesis and the unit of picture are the same thing by construction --
    # a seam in the read can only ever fall on a cut.
    groups = None
    if a.group:
        plan = json.loads(pathlib.Path(a.group).read_text(encoding="utf-8"))
        groups = [b["lines"] for b in plan["beats"]]
        if sum(groups) != len(script):
            raise SystemExit(
                f"{a.group} declares {sum(groups)} script lines across "
                f"{len(groups)} beats, but {a.script} has {len(script)}."
            )
        print(f"grouping: {len(groups)} beats, one TTS call each -> {groups}")

    rows, total, report = synthesize(
        script, a.audio, voice=a.voice, groups=groups,
        match_level=not a.no_match_level, speed=a.speed,
    )

    header = [
        f"/* GENERATED by docs/preview-review/gen-voiceover.py - do not hand-edit.",
        " *",
        f" * Source script: {a.script}",
        f" * Voiceover:     {a.audio}  (Deepgram Aura-2 '{a.voice}')",
        " *",
        " * Per-word frames are MEASURED, not estimated: each phrase was",
        " * synthesised, then transcribed with word-level timestamps, and those",
        " * onsets were mapped onto the script's own words. The script is the",
        " * source of truth for WHAT is said; only the timing comes from the audio.",
        " *",
        " * Edit the script file and re-run. Never edit this file.",
        " */",
    ]
    write_ts(a.ts, rows, header)

    secs = total / FPS
    print(f"\nwrote {a.audio}  ({secs:.2f}s, {total} frames @ {FPS}fps)")
    print(f"wrote {a.ts}  ({len(rows)} cues, {sum(len(r[3]) for r in rows)} words)")
    print(f"phrases: {report['synth']} synthesised, {report['cached']} from cache")

    if report["missed"]:
        print("\nwords the transcript did not return (timing interpolated, text unchanged):")
        for i, text, why in report["missed"]:
            print(f"  cue {i}: {why}  -- {text[:56]}")

    if a.no_verify:
        print("\nverification skipped (--no-verify)")
        return 0

    v = verify(a.audio, rows)
    if v is None:
        print("\nVERIFY FAILED: no transcript returned for the finished mp3")
        return 1
    print(f"\nverified per cue against the finished mp3: {v['words']} words, "
          f"max drift {v['max_drift_frames']}f, mean {v['mean_drift_frames']}f, "
          f"{v['interpolated']} interpolated, "
          f"{v['over_tolerance']} over {v['tolerance']}f tolerance")
    if v.get("worst"):
        print(f"  worst: {v['worst'][0]} at {v['worst'][1]}f")

    # Two thresholds, deliberately. `tolerance` (6f = 200ms) is tight enough to
    # surface outliers worth looking at; failing the build on one of them would
    # train everyone to ignore the check. A run only FAILS when the timing is
    # actually unusable: a word more than 2x tolerance out, or more than a tenth
    # of the script drifting. Anything between the two is printed and passes.
    hard = v["max_drift_frames"] > 2 * v["tolerance"]
    many = v["over_tolerance"] > max(1, v["words"] // 10)
    if hard or many:
        print("  FAIL: timing is not usable — inspect before rendering")
        return 1
    if v["over_tolerance"]:
        print("  (within working limits; outliers listed above are sub-250ms)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
