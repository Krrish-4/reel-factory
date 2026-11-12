"""Every check, in order, for one reel. This is the pipeline.

    python gen/check.py src/refina/changed                        # preflight
    python gen/check.py src/refina/changed out/refina-changed.mp4 # + postflight

Exit 1 if anything fails.

WHY THIS EXISTS
---------------
Eight checking tools were built and none of them ran unless someone remembered
to type its name. `npm run lint` was eslint and tsc; six of the eight were not
mentioned in CLAUDE.md at all; one reel out of five had a shot plan. A check
nobody runs is a check that does not exist, and every one of these was written
because something reached a render without being noticed.

So: one entry point, run in a fixed order, that fails loudly.

PREFLIGHT runs against the source and needs no render:
  check-skills     the refina-reel skill is loadable from outside this dir at
                   all, and its router has no dead routes
  check-assets     labels match their records; paired assets agree on framing
  check-legibility type big enough to read at phone scale; every caption's
                   last word arrives with time left to read it
  check-citations  a line that sounds like research names a real source,
                   with a DOI or URL; no source, no research wording
  shots --emit   the plan itself: no two adjacent beats share a composition,
                 enough of the runtime is declared moving, every beat declares
                 a shot size

POSTFLIGHT runs against a finished render:
  check-frames   no frame carries an unexplained empty band at an edge
  shots --verify a beat declared moving actually moves; a beat's face size
                 lands in its declared band; the reel travels far enough
  check-analysed rule P: this exact render has been through refs/analyse.py,
                 measurement AND the Gemini pass
  phone-sheet    writes a contact sheet at 390px, the width the audience gets

The phone sheet cannot pass or fail — it is the one step that needs eyes. It is
last so it is the thing left on screen when the run finishes, because the
defects it catches (type too small to read, an annotation on the wrong feature,
a beat that does not show its own claim) are invisible to every check above it.

A REEL WITHOUT A SHOT PLAN IS REPORTED, NOT SKIPPED SILENTLY
-----------------------------------------------------------
Four of the five reels in this repo have no `shots.json`. That is a real gap and
it prints as one, rather than the run going green because there was nothing to
check.
"""
import argparse
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent


def run(label, argv, optional=False):
    print(f"\n── {label} " + "─" * max(0, 58 - len(label)))
    r = subprocess.run([sys.executable, *argv], cwd=ROOT)
    if r.returncode == 0:
        return True
    if optional:
        print(f"   ({label} reported problems; not fatal)")
        return True
    return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("reel", help="reel source dir, e.g. src/refina/changed")
    ap.add_argument("render", nargs="?", help="finished mp4 for postflight")
    ap.add_argument("--skip-phone", action="store_true")
    ap.add_argument("--skip-analysis", action="store_true",
                    help="skip the rule P gate while iterating on a cut that "
                         "is not ready to be analysed yet")
    a = ap.parse_args()

    reel = pathlib.Path(a.reel)
    shots = reel / "shots.json"
    ok = True

    print(f"checking {reel}" + (f" against {a.render}" if a.render else " (preflight only)"))

    ok &= run("skill path", ["gen/check-skills.py"])
    ok &= run("assets", ["gen/check-assets.py", str(reel)])
    ok &= run("legibility", ["gen/check-legibility.py", str(reel)])
    # A script line that borrows the authority of research carries its
    # source. Preflight because it reads the script file, and because the
    # ban this replaced was prose that got ignored (rules P and GG).
    ok &= run("citations", ["gen/check-citations.py", str(reel)])
    # PREFLIGHT, deliberately: the bed can be judged from the audio files
    # alone, and an 8-minute render is a slow way to learn that the music
    # is sitting on top of the read.
    ok &= run("audio", ["gen/check-audio.py", str(reel)])
    # Does the synthesised read sound like ONE person? One TTS call per phrase
    # lets Aura-2 re-choose pace, pitch and level at every line, and
    # voiceover-size.mp3 shipped into a finished render at 111-417 wpm and
    # 11.4 dB before Rahul heard it. Preflight, same argument as `audio`.
    ok &= run("prosody", ["gen/check-prosody.py", str(reel)])
    # A per-reel `public-<name>/` is a SECOND COPY of assets that keep changing,
    # verified byte-identical once and then never again. size-v3 and v4 both
    # shipped with the pre-fix voiceover because nothing copied the regenerated
    # mp3 across. Scoped to this reel so another reel's drift cannot fail it.
    pub = ROOT / f"public-{reel.name}"
    if pub.is_dir():
        ok &= run("public dir", ["gen/check-publicdir.py", pub.name])

    if shots.is_file():
        ok &= run("shot plan", ["gen/shots.py", str(shots), "--emit"])
    else:
        print(f"\n── shot plan " + "─" * 50)
        print(f"   NO {shots} — this reel declares no compositions, no motion")
        print("   and no shot sizes, so none of that can be checked.")
        ok = False

    if a.render:
        if not pathlib.Path(a.render).is_file():
            print(f"\n   render not found: {a.render}")
            return 1
        ok &= run("frames", ["gen/check-frames.py", a.render])
        if shots.is_file():
            ok &= run("motion + face size",
                      ["gen/shots.py", str(shots), "--verify", a.render])
        # The reel plays whatever the RENDERER was pointed at, not `public/`.
        # size-v3 and v4 both shipped the pre-fix voiceover, misaligned against
        # their own pictures, and every other check passed. Invariant I: a claim
        # about the finished artefact is made against the finished artefact.
        # NOT behind --skip-analysis: this is a property of the file, not a
        # call out to an external describer.
        ok &= run("render audio", ["gen/check-render-audio.py", str(reel), a.render])
        if not a.skip_analysis:
            ok &= run("rule P — analysed", ["gen/check-analysed.py", a.render])
        if not a.skip_phone:
            out = f"{pathlib.Path(a.render).stem}-phone.png"
            argv = ["gen/phone-sheet.py", a.render, "--out", out]
            if shots.is_file():
                argv += ["--shots", str(shots)]
            else:
                argv += ["--at", "60", "300", "600", "900", "1200"]
            run("phone sheet", argv, optional=True)
            print(f"\n   LOOK AT {out} BEFORE SHIPPING. Nothing above this line")
            print("   can tell you whether a label is readable, an annotation is")
            print("   on the right feature, or a beat shows what it claims.")

    print("\n" + "=" * 62)
    print("all checks passed" if ok else "FAILURES ABOVE — see each section")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
