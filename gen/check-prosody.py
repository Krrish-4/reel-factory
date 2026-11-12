"""Preflight: does the synthesised read sound like ONE person reading?

    python gen/check-prosody.py src/refina/size

Resolves the reel's voiceover and cue table, then defers to
`docs/preview-review/check-prosody.py`, which measures every phrase's speaking
rate, median pitch and RMS level against the read's own median.

WHY THIS IS A STAGE AND NOT A PARAGRAPH. `gen-voiceover.py` synthesises one TTS
call per unit and concatenates, and Aura-2 chooses pace, pitch and loudness
afresh for every call. Nothing in the pipeline had ever looked at whether the
pieces matched. `voiceover-size.mp3` shipped into a finished render with its
phrases spanning 111-417 wpm and 11.4 dB, and the defect was found by Rahul
listening to it -- invariant C, and the same shape as the music-bed failure that
made `gen/check-audio.py` a stage. Three numeric checks passed that read too.

It is PREFLIGHT for the same reason `check-audio` is: this is judgeable from the
audio file alone, and re-rendering 2000 frames is a slow way to learn that the
narrator changed halfway through.

The fix when it fails is almost never to re-roll the synthesis. It is to pass
`--group <reel>/shots.json` to `gen-voiceover.py`, which makes the unit of
synthesis the BEAT rather than the phrase, so a seam can only fall where there
is already a cut.
"""
import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
TOOL = ROOT / "docs" / "preview-review" / "check-prosody.py"


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    reel = pathlib.Path(sys.argv[1])
    shots = reel / "shots.json"
    cues = reel / "words-vo.ts"

    if not cues.is_file():
        print(f"   no {cues} — this reel has no synthesised read to check")
        return 0

    # The audio the reel actually plays, taken from the composition rather than
    # guessed from the directory name: a reel that points `<Audio>` at another
    # reel's file would otherwise be checked against the wrong read.
    audio = None
    for tsx in reel.glob("*.tsx"):
        m = tsx.read_text(encoding="utf-8")
        for mark in ('staticFile("', "staticFile('"):
            i = 0
            while (i := m.find(mark, i)) != -1:
                j = m.find(m[i + len(mark) - 1], i + len(mark))
                name = m[i + len(mark): j]
                if name.endswith(".mp3") and "voiceover" in name:
                    audio = ROOT / "public" / name
                i = j
    if audio is None or not audio.is_file():
        print(f"   no voiceover mp3 referenced by {reel} — nothing to check")
        return 0

    cmd = [sys.executable, str(TOOL), str(audio), "--cues", str(cues)]
    # Judge the UNIT OF SYNTHESIS. A phrase inside a continuously-spoken beat is
    # a slice of one delivery and its rate is noisy by construction; flagging
    # that is how a check earns a reputation for crying wolf.
    if shots.is_file():
        cmd += ["--group", str(shots)]
    r = subprocess.run(cmd)
    if r.returncode == 0:
        return 0

    if shots.is_file():
        plan = json.loads(shots.read_text(encoding="utf-8"))
        n = len(plan.get("beats", []))
        print(f"\n   FIX: re-run gen-voiceover.py with --group {shots}")
        print(f"   That synthesises {n} calls (one per beat) instead of one per")
        print("   phrase, so pace, pitch and level cannot change mid-beat.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
