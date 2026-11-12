"""Does the music bed let the voiceover through? Preflight, before any render.

THE DEFECT THIS EXISTS FOR
--------------------------
`bed-lips.mp3` was levelled with `silencedetect=noise=-32dB`, which reported
100% speech, and shipped into a cut where the bed was LOUDER THAN THE VOICE on
13% of speech windows. Rahul heard it immediately; no check in the repo could.

`silencedetect` cannot detect masking. It asks one question -- "is the mix ever
quiet?" -- and a LOUDER bed scores BETTER on it. The old recipe then flattened
the bed with `dynaudnorm` precisely so it would never dip, which is what kept
that number high. A bed held at a constant level under a voice that swings 30dB
between stressed and unstressed syllables buries every soft word ending.

That is rule P wearing a disguise: a number was moved instead of the mix being
fixed, and the number could not have said otherwise.

WHAT THIS MEASURES INSTEAD
--------------------------
Short-window RMS of the voice and of the bed, and the ratio BETWEEN THEM in the
windows where the voice is actually speaking. That is the quantity a listener
experiences and the one `silencedetect` is blind to.

    python gen/check-audio.py src/refina/lips
    python gen/check-audio.py --vo public/voiceover-lips.mp3 --bed public/bed-lips.mp3

Broadcast practice keeps a bed 15-20dB under narration. The floors here are
deliberately looser than that -- they are a defect gate, not a mix engineer.
"""
import argparse
import pathlib
import re
import subprocess
import sys
import tempfile
import wave

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Calibrated on the three beds this repo has built. Ducked measured 34.3dB
# median / 1.5% inverted; a flat -11dB bed measured 23.2 / 0.0; the shipped
# recipe measured 11.8 / 13.2 and is the thing being caught.
MIN_MEDIAN_DB = 15.0     # median voice-over-bed while speaking
MAX_INVERTED = 2.0       # % of speech windows where the bed is LOUDER
MAX_UNDER_6DB = 10.0     # % of speech windows with under 6dB of headroom

WIN_S = 0.05


def decode(path, tmp):
    """Mono 16k wav, so both signals are on one clock."""
    out = pathlib.Path(tmp) / (pathlib.Path(path).stem + ".wav")
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", str(path), "-ac", "1", "-ar", "16000", str(out)],
        check=True)
    w = wave.open(str(out))
    a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return a, w.getframerate()


def envelope(x, win):
    m = len(x) // win * win
    if m == 0:
        return np.zeros(0)
    r = np.sqrt((x[:m].reshape(-1, win) ** 2).mean(axis=1) + 1e-12)
    return 20 * np.log10(r + 1e-12)


def analyse(vo_path, bed_path):
    with tempfile.TemporaryDirectory() as tmp:
        vo, sr = decode(vo_path, tmp)
        bed, _ = decode(bed_path, tmp)
    n = min(len(vo), len(bed))
    if n == 0:
        raise SystemExit("one of the tracks is empty")
    win = int(WIN_S * sr)
    dv = envelope(vo[:n], win)
    db = envelope(bed[:n], win)
    m = min(len(dv), len(db))
    dv, db = dv[:m], db[:m]
    # "speaking" = within 32dB of the voice's own peak. Silence sits far below.
    speaking = dv > (dv.max() - 32)
    if speaking.sum() < 10:
        raise SystemExit("no speech found in the voiceover track")
    snr = dv[speaking] - db[speaking]
    return {
        "median": float(np.median(snr)),
        "p10": float(np.percentile(snr, 10)),
        "inverted": float((snr < 0).mean() * 100),
        "under6": float((snr < 6).mean() * 100),
        "under10": float((snr < 10).mean() * 100),
        "bed_in_gaps": float(db[~speaking].mean()) if (~speaking).any() else float("nan"),
        "windows": int(speaking.sum()),
    }


def tracks_for(reel_dir):
    """The mp3s a reel actually plays, read out of its composition.

    Read from the TSX rather than guessed from a naming convention, so a beat
    that swaps in a different bed is still the thing being measured.
    """
    vo = bed = None
    for tsx in pathlib.Path(reel_dir).glob("*.tsx"):
        for name in re.findall(r'staticFile\(\s*"([^"]+\.mp3)"\s*\)', tsx.read_text(encoding="utf-8")):
            p = ROOT / "public" / name
            if not p.exists():
                continue
            if "bed" in name.lower():
                bed = p
            elif "voiceover" in name.lower() or "vo" in name.lower():
                vo = p
    return vo, bed


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("reel", nargs="?", help="a reel directory, e.g. src/refina/lips")
    ap.add_argument("--vo")
    ap.add_argument("--bed")
    a = ap.parse_args()

    if a.vo and a.bed:
        vo, bed = pathlib.Path(a.vo), pathlib.Path(a.bed)
    elif a.reel:
        vo, bed = tracks_for(a.reel)
    else:
        raise SystemExit("give a reel directory, or --vo and --bed")

    if vo is None:
        print("  no voiceover track found — nothing to check")
        return 0
    if bed is None:
        print("  no music bed — nothing can mask the read")
        return 0

    r = analyse(vo, bed)
    print(f"voice over bed, measured across {r['windows']} speaking windows")
    print(f"  median              {r['median']:6.1f} dB   (floor {MIN_MEDIAN_DB:.0f})")
    print(f"  10th percentile     {r['p10']:6.1f} dB")
    print(f"  under 10 dB         {r['under10']:6.1f} %")
    print(f"  under  6 dB         {r['under6']:6.1f} %   (max {MAX_UNDER_6DB:.0f})")
    print(f"  bed LOUDER than VO  {r['inverted']:6.1f} %   (max {MAX_INVERTED:.0f})")
    print(f"  bed level in gaps   {r['bed_in_gaps']:6.1f} dB")

    fails = []
    if r["median"] < MIN_MEDIAN_DB:
        fails.append(f"bed sits only {r['median']:.1f} dB under the read (need {MIN_MEDIAN_DB:.0f})")
    if r["inverted"] > MAX_INVERTED:
        fails.append(f"the bed is LOUDER than the voice on {r['inverted']:.1f}% of speech "
                     f"windows (max {MAX_INVERTED:.0f}%)")
    if r["under6"] > MAX_UNDER_6DB:
        fails.append(f"{r['under6']:.1f}% of speech has under 6 dB of headroom "
                     f"(max {MAX_UNDER_6DB:.0f}%)")

    if fails:
        for f in fails:
            print(f"  FAIL  {f}")
        print("\n  Duck the bed under the voice rather than lowering it flat:")
        duck = ('ffmpeg -y -i <bed> -i <vo> -filter_complex '
                '"[1:a]highpass=f=200,lowpass=f=4000[k];'
                '[0:a][k]sidechaincompress=threshold=0.006:ratio=12:'
                'attack=15:release=350[out]" -map "[out]" '
                '-ar 44100 -ac 2 -b:a 128k <bed>')
        print("    " + duck)
        print("  Do NOT reach for silencedetect to confirm the fix: it cannot see masking,")
        print("  and a louder bed scores better on it.")
        return 1
    print("  the read is clear of the bed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
