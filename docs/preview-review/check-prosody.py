"""Measure a synthesised read phrase by phrase, to find where it does not match itself.

    python docs/preview-review/check-prosody.py public/voiceover-size.mp3 \
        --cues src/refina/size/words-vo.ts

WHY THIS EXISTS. `gen-voiceover.py` synthesises ONE TTS CALL PER PHRASE and
concatenates the results with declared silences between them. That is what makes
the timing exact — every word onset is measured against our own script — but it
also means the model chooses pace, pitch and intonation for each phrase with no
knowledge of the phrases either side of it. Nothing in the pipeline has ever
looked at whether the pieces sound like one person reading, and a per-phrase
cache keyed on (voice, text) means a line edited months apart can sit next to
one generated today.

Rahul heard it before any number was taken: "somewhere it is slow, somewhere it
is a different tone". Invariant C — when the ear and the metrics disagree, the
metrics are the thing that is wrong or missing. This is the missing one.

Three measurements, per phrase, all relative to the read's own median so the
absolute values of a voice never matter:

  wpm     speaking rate over the VOICED span only, so a declared pause after
          the phrase cannot make a fast phrase look slow.
  f0      median fundamental, by autocorrelation over voiced frames. This is
          "tone" in the sense that moves between takes -- a phrase delivered a
          couple of semitones high reads as a different person leaning in.
  dBFS    RMS over the voiced span. Level jumps are the other half of "tone".

Outliers are reported in SEMITONES for pitch, because that is the unit the ear
uses: 12*log2(f/median). Anything past ~1.5 semitones or ~15% off the median
rate is audible as a seam between two takes.
"""
import argparse
import json
import math
import pathlib
import re
import subprocess
import sys

import numpy as np

RATE = 24000
FPS = 30


def load_cues(path):
    """(start_frame, end_frame, text) per cue, from a generated words-vo.ts."""
    src = pathlib.Path(path).read_text(encoding="utf-8")
    out = []
    for m in re.finditer(r"\{ f: (\d+), t: (\d+), s: (\"(?:[^\"\\]|\\.)*\")", src):
        out.append((int(m.group(1)), int(m.group(2)), json.loads(m.group(3))))
    if not out:
        raise SystemExit(f"no cues parsed from {path}")
    return out


def decode(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1",
         "-ar", str(RATE), "-f", "s16le", "-"],
        check=True, stdout=subprocess.PIPE).stdout
    return np.frombuffer(raw, dtype="<i2").astype(np.float64) / 32768.0


def voiced_mask(x, win=int(RATE * 0.03), floor_db=-45.0):
    """Frame-wise voiced/unvoiced by RMS, against an absolute floor."""
    n = len(x) // win
    if n == 0:
        return np.zeros(0, dtype=bool), win
    fr = x[: n * win].reshape(n, win)
    rms = np.sqrt((fr ** 2).mean(axis=1) + 1e-12)
    return 20 * np.log10(rms + 1e-12) > floor_db, win


def f0_of(frame, lo=70.0, hi=320.0):
    """Autocorrelation pitch for one frame; None when it does not look periodic."""
    f = frame - frame.mean()
    if np.sqrt((f ** 2).mean()) < 1e-4:
        return None
    ac = np.correlate(f, f, mode="full")[len(f) - 1:]
    if ac[0] <= 0:
        return None
    ac = ac / ac[0]
    lag_lo, lag_hi = int(RATE / hi), int(RATE / lo)
    seg = ac[lag_lo:lag_hi]
    if len(seg) < 3:
        return None
    k = int(np.argmax(seg))
    # a real pitch peak is a clear one; 0.3 rejects noise and most fricatives
    if seg[k] < 0.3:
        return None
    return RATE / (lag_lo + k)


def measure(x):
    """(wpm-able voiced seconds, median f0, rms dBFS) for one phrase's samples."""
    m, win = voiced_mask(x)
    if not m.any():
        return 0.0, None, -120.0
    voiced_s = int(m.sum()) * win / RATE
    fr = x[: len(m) * win].reshape(len(m), win)
    pitches = [p for i in range(len(m)) if m[i] for p in (f0_of(fr[i]),) if p]
    rms = np.sqrt((fr[m] ** 2).mean() + 1e-12)
    med = float(np.median(pitches)) if pitches else None
    return voiced_s, med, 20 * math.log10(rms + 1e-12)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("--cues", required=True)
    ap.add_argument("--group", help="a reel's shots.json — judge per BEAT, not per phrase")
    ap.add_argument("--rate-tol", type=float, default=0.25, help="fraction off median wpm")
    ap.add_argument("--pitch-tol", type=float, default=2.0, help="semitones off median f0")
    ap.add_argument("--level-tol", type=float, default=3.0, help="dB off median RMS")
    a = ap.parse_args()

    x = decode(a.audio)
    cues = load_cues(a.cues)

    # WHAT GETS JUDGED IS THE UNIT OF SYNTHESIS, NOT THE PHRASE.
    #
    # A phrase inside a continuously-spoken beat is a slice of one delivery, cut
    # at a boundary that often falls mid-breath, so its rate is noisy and its
    # variation is the narrator's own phrasing -- which is what a read is
    # supposed to have. Flagging that is how a check teaches people to skip it.
    # The defect this exists to catch is two separately-generated units that do
    # not match each other, so when the reel declares beats, judge beats.
    units = None
    if a.group:
        plan = json.loads(pathlib.Path(a.group).read_text(encoding="utf-8"))
        counts = [b["lines"] for b in plan["beats"]]
        names = [b["name"] for b in plan["beats"]]
        if sum(counts) != len(cues):
            raise SystemExit(
                f"{a.group} declares {sum(counts)} lines, cue table has {len(cues)}"
            )
        # A BEAT MAY DECLARE ITSELF EXEMPT, IN WRITING.
        # Same pattern as `framing_exempt` in the asset registry: the honest way
        # to handle a measurement that is right about the number and wrong about
        # the meaning is a stated reason on the specific case, never a threshold
        # quietly widened until everything passes. A hook that opens on a
        # question SHOULD sit high -- that is the format, not a seam.
        exempt = {b["name"]: b.get("prosody_exempt") for b in plan["beats"]}
        units, k = [], 0
        for nm, n in zip(names, counts):
            units.append((nm, list(range(k, k + n))))
            k += n

    rows = []
    for f, t, text in cues:
        seg = x[int(f / FPS * RATE): int(t / FPS * RATE)]
        voiced_s, f0, db = measure(seg)
        words = len(text.split())
        wpm = words / voiced_s * 60 if voiced_s > 0.05 else 0.0
        rows.append(dict(f=f, t=t, text=text, wpm=wpm, f0=f0, db=db, words=words))

    # Collapse to units when the reel declares them. A unit is measured over its
    # OWN span of audio, not averaged from its phrases, so a mid-beat pause the
    # model chose is inside the measurement exactly as a listener hears it.
    if units is not None:
        judged = []
        for nm, idx in units:
            f, t = rows[idx[0]]["f"], rows[idx[-1]]["t"]
            seg = x[int(f / FPS * RATE): int(t / FPS * RATE)]
            voiced_s, f0, db = measure(seg)
            words = sum(rows[j]["words"] for j in idx)
            judged.append(dict(
                f=f, t=t, text=nm, words=words, f0=f0, db=db,
                exempt=exempt.get(nm),
                wpm=words / voiced_s * 60 if voiced_s > 0.05 else 0.0,
            ))
        label, noun = "beat", "beats"
    else:
        judged = rows
        label, noun = "phrase", "phrases"

    med_wpm = float(np.median([r["wpm"] for r in judged if r["wpm"] > 0]))
    med_f0 = float(np.median([r["f0"] for r in judged if r["f0"]]))
    med_db = float(np.median([r["db"] for r in judged]))

    print(f"{a.audio}   {len(rows)} phrases in {len(judged)} {noun}")
    print(f"  median: {med_wpm:.0f} wpm · {med_f0:.1f} Hz · {med_db:.1f} dBFS\n")
    print(f"  {'#':>3} {'wpm':>5} {'d%':>6} {'Hz':>6} {'semi':>6} {'dBFS':>6} {'dB':>5}  {label}")

    bad = []
    for i, r in enumerate(judged, 1):
        dr = (r["wpm"] - med_wpm) / med_wpm if med_wpm else 0
        ds = 12 * math.log2(r["f0"] / med_f0) if r["f0"] else 0.0
        dd = r["db"] - med_db
        flag = ""
        if abs(dr) > a.rate_tol:
            flag += "R"
        if abs(ds) > a.pitch_tol:
            flag += "P"
        if abs(dd) > a.level_tol:
            flag += "L"
        if flag and r.get("exempt"):
            flag = "-"          # declared, with a reason; shown, never failed
        elif flag:
            bad.append((i, flag, r, dr, ds, dd))
        print(f"  {i:>3} {r['wpm']:>5.0f} {dr*100:>+5.0f}% "
              f"{(r['f0'] or 0):>6.1f} {ds:>+6.2f} {r['db']:>6.1f} {dd:>+5.1f}  "
              f"{flag:<3} {r['text'][:44]}")

    for r in judged:
        if r.get("exempt"):
            print(f"\n  exempt: {r['text']} — {r['exempt']}")

    print()
    if not bad:
        print(f"  every {label} sits inside tolerance of the read's own median")
        return 0
    print(f"  {len(bad)} {label}(s) outside tolerance "
          f"(R=rate P=pitch L=level):")
    for i, flag, r, dr, ds, dd in bad:
        why = []
        if "R" in flag:
            why.append(f"{dr*100:+.0f}% rate")
        if "P" in flag:
            why.append(f"{ds:+.2f} semitones")
        if "L" in flag:
            why.append(f"{dd:+.1f} dB")
        print(f"    {label} {i:>2} f{r['f']}  {', '.join(why)}  {r['text']}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
