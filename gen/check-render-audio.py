"""Postflight: the RENDER's own audio says the right words at the right frames.

    python gen/check-render-audio.py src/refina/size out/refina-size-v5.mp4

WHY THIS EXISTS. Every other audio check in this repo reads `public/`. The reel
does not: it reads whatever the renderer was pointed at, which for a big reel is
a per-reel `public-<name>/` copy. `size-v3` and `size-v4` both shipped with the
ORIGINAL 27-take voiceover because that copy was never re-synced after the read
was regenerated -- and because the pictures had been re-cut to the new cue
table, the read also ran ahead of them. `check-prosody` passed (it measured
`public/`), `shots.py --verify` passed (it measures the picture), and the phone
sheet is stills. Nothing looked at the finished file's audio.

`check-publicdir.py` guards the CAUSE. This guards the SYMPTOM, on the artefact
itself, which is invariant I: a claim about the finished thing is made against
the finished thing.

It extracts the render's audio track and runs the same per-cue recogniser check
`gen-voiceover.py` runs on the mp3 -- so it catches stale audio, an audio track
that drifted against the pictures, and a reel pointed at the wrong file.

NOTE the render's audio carries the SFX bed too, so a few extra frames of drift
here are normal; the tolerance is looser than the generator's for that reason.
"""
import pathlib
import re
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "docs" / "preview-review"))

CUE = re.compile(
    r"\{\s*f:\s*(\d+),\s*t:\s*(\d+),\s*s:\s*\"((?:[^\"\\]|\\.)*)\",\s*w:\s*\[([0-9,\s]*)\]"
)


def load_rows(ts_path):
    src = pathlib.Path(ts_path).read_text(encoding="utf-8")
    rows = []
    for m in CUE.finditer(src):
        text = m.group(3).encode().decode("unicode_escape")
        words = [int(x) for x in m.group(4).split(",") if x.strip()]
        rows.append((int(m.group(1)), int(m.group(2)), text, words))
    return rows


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return 2
    reel, render = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
    ts = reel / "words-vo.ts"
    if not ts.is_file():
        print(f"   no {ts} — this reel has no measured read")
        return 0
    if not render.is_file():
        print(f"   {render} does not exist")
        return 1

    rows = load_rows(ts)
    if not rows:
        print(f"   could not parse cues from {ts}")
        return 1

    from tts_deepgram import verify  # noqa: E402

    with tempfile.TemporaryDirectory() as tmp:
        wav = pathlib.Path(tmp) / "render-audio.mp3"
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-i", str(render), "-map", "0:a",
             "-c:a", "libmp3lame", "-b:a", "192k", "-ar", "24000", "-ac", "1",
             str(wav)],
            check=True,
        )
        print(f"   {len(rows)} cues against the audio inside {render.name}")
        # `verify` returns a REPORT DICT, not a bool. Taking it as truthy is how
        # this check silently passed everything on its first outing, which would
        # have made it worse than no check at all.
        r = verify(str(wav), rows, tolerance_frames=10)

    print(f"   {r['words']} words, max drift {r['max_drift_frames']}f, "
          f"mean {r['mean_drift_frames']}f, {r['interpolated']} interpolated, "
          f"{r['over_tolerance']} over {r['tolerance']}f")
    if r["worst"]:
        print(f"   worst: {r['worst'][0]} at {r['worst'][1]}f")

    # HARD limit is deliberately generous. The render's audio carries the SFX
    # bed on top of the read, so the recogniser has competition the mp3 does not
    # give it. What this is here to catch is audio that is the WRONG TAKE or
    # SHIFTED WHOLESALE against the pictures -- both of which land in the tens
    # of frames, not in ones.
    if r["max_drift_frames"] > 25 or r["words"] == 0:
        print("\n   FAIL: the audio in the render does not line up with the cue")
        print("   table. Check that the reel's public dir carries the CURRENT")
        print("   voiceover (gen/check-publicdir.py) and re-render.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
