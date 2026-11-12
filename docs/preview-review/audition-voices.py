#!/usr/bin/env python
"""Audition every Aura-2 voice of one gender on the same line, and MEASURE them.

    python docs/preview-review/audition-voices.py \
        --script docs/scripts/celeb-sweeney-lips.txt --beat 1 \
        --gender feminine --out out/voice-audition-female

WHY THIS EXISTS AS A TOOL
-------------------------
CLAUDE.md: "Pick the voice before tuning pacing, not after." Swapping apollo for
jupiter took a finished ApplyForMe reel from 34.5s to 27.1s with no script
change, because the fifteen male voices run 114-207 wpm -- nearly a 2x spread.
That audition was done ad hoc and left behind only a folder of mp3s, so the
numbers behind the decision are gone and the next reel has to redo it. This
does the same job and writes the measurements next to the audio.

IT AUDITIONS THE BEAT, NOT A PHRASE. One synthesis call carries every line of
the beat, which is the same unit `gen-voiceover.py --group` uses. A phrase
synthesised alone is a slice of a delivery cut mid-breath and its rate is noisy
by construction -- that is the finding that produced `--group` in the first
place, and an audition measured the wrong way would pick the wrong voice.

WHAT IS MEASURED, and why each one decides something:
  wpm     words over the VOICED span. The pacing lever. A reel's length is set
          here before a single frame is cut.
  pitch   median F0 by autocorrelation. Decides what a music bed may do -- the
          ApplyForMe bed had to be high-passed at 150 Hz because its body sat
          on jupiter's 87 Hz fundamental.
  dur     wall-clock of the take, pauses included. What the viewer sits through.
  peak    guards against Aura-2's silent-200 failure; `speak()` retries but a
          quiet-but-not-silent take still reads oddly beside the others.

The voice list comes from the Deepgram /v1/models endpoint, not from a table
here, so it cannot go stale. Gender comes from each model's own `tags`.

Takes are cached by (text, voice) in refs/.tts-cache, so a re-run is free.
"""
from __future__ import annotations

import argparse
import array
import io
import json
import math
import pathlib
import re
import subprocess
import sys
import urllib.request
import wave

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

from tts_deepgram import api_key, peak_dbfs, speak, voiced_seconds  # noqa: E402

MODELS_URL = "https://api.deepgram.com/v1/models"


def beat_lines(path, beat):
    """The spoken lines of the Nth `# -- N. name ---` section of a script file."""
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
        sys.exit(f"no spoken lines found for beat {beat} in {path}")
    return out


def voices(key, gender, lang="en"):
    req = urllib.request.Request(MODELS_URL, headers={"Authorization": f"Token {key}"})
    data = json.load(urllib.request.urlopen(req, timeout=30))
    rows = []
    for m in data.get("tts", []):
        cn = m.get("canonical_name", "")
        if not cn.startswith("aura-2-") or not cn.endswith(f"-{lang}"):
            continue
        md = m.get("metadata", {}) or {}
        tags = [t.lower() for t in md.get("tags", [])]
        if gender not in tags:
            continue
        rows.append({
            "name": m["name"],
            "accent": md.get("accent", ""),
            "age": md.get("age", ""),
            "tags": [t for t in md.get("tags", []) if t.lower() != gender],
        })
    return sorted(rows, key=lambda r: r["name"])


def samples(wav_bytes):
    with wave.open(io.BytesIO(wav_bytes), "rb") as w:
        rate, n = w.getframerate(), w.getnframes()
        frames = w.readframes(n)
    a = array.array("h")
    a.frombytes(frames[: len(frames) - (len(frames) % 2)])
    return a, rate


def median_f0(wav_bytes, lo=70.0, hi=400.0, win_s=0.04, floor_db=-40.0):
    """Median fundamental over voiced windows, by autocorrelation peak.

    Restricted to 70-400 Hz: below is rumble, above is where a whispered or
    breathy window starts reporting a harmonic as the fundamental.
    """
    a, rate = samples(wav_bytes)
    win = int(win_s * rate)
    lo_lag, hi_lag = int(rate / hi), int(rate / lo)
    picks = []
    for i in range(0, len(a) - win, win):
        chunk = [float(x) for x in a[i:i + win]]
        rms = math.sqrt(sum(x * x for x in chunk) / len(chunk))
        if rms <= 0 or 20 * math.log10(rms / 32768.0) < floor_db:
            continue
        mean = sum(chunk) / len(chunk)
        chunk = [x - mean for x in chunk]
        best, best_lag = 0.0, 0
        for lag in range(lo_lag, min(hi_lag, len(chunk) - 1)):
            s = sum(chunk[j] * chunk[j + lag] for j in range(len(chunk) - lag))
            if s > best:
                best, best_lag = s, lag
        if best_lag:
            picks.append(rate / best_lag)
    if not picks:
        return 0.0
    picks.sort()
    return picks[len(picks) // 2]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--script", required=True)
    ap.add_argument("--beat", type=int, default=1)
    ap.add_argument("--gender", default="feminine", choices=["feminine", "masculine"])
    ap.add_argument("--out", default="out/voice-audition")
    ap.add_argument("--only", help="comma-separated voice names, for a re-listen")
    args = ap.parse_args()

    key = api_key()
    lines = beat_lines(args.script, args.beat)
    text = " ".join(lines)
    words = len(re.findall(r"[\w'-]+", text))
    out = pathlib.Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    vs = voices(key, args.gender)
    if args.only:
        want = {v.strip() for v in args.only.split(",")}
        vs = [v for v in vs if v["name"] in want]
    print(f"beat {args.beat} of {args.script}  ({words} words)")
    for ln in lines:
        print(f"   {ln}")
    print(f"\n{len(vs)} {args.gender} voices -> {out}\n")

    rows = []
    for i, v in enumerate(vs, 1):
        wav, cached = speak(text, v["name"], key)
        a, rate = samples(wav)
        dur = len(a) / float(rate)
        voiced = voiced_seconds(wav)
        wpm = words / voiced * 60 if voiced else 0.0
        f0 = median_f0(wav)
        mp3 = out / f"{v['name']}.mp3"
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-f", "wav", "-i", "pipe:0",
             "-codec:a", "libmp3lame", "-b:a", "128k", str(mp3)],
            input=wav, check=True,
        )
        rows.append({**v, "dur": round(dur, 2), "wpm": round(wpm, 1),
                     "f0": round(f0, 1), "peak": round(peak_dbfs(wav), 1),
                     "file": mp3.name})
        print(f"  {i:2d}/{len(vs)}  {v['name']:11s} {dur:5.2f}s  "
              f"{wpm:6.1f} wpm  {f0:6.1f} Hz  {'cached' if cached else 'synth'}")

    (out / "audition.json").write_text(
        json.dumps({"script": args.script, "beat": args.beat, "text": text,
                    "words": words, "voices": rows}, indent=2), encoding="utf-8")

    wpms = sorted(r["wpm"] for r in rows)
    f0s = sorted(r["f0"] for r in rows if r["f0"])
    print(f"\nwpm   {wpms[0]:.0f}-{wpms[-1]:.0f}  "
          f"({wpms[-1] / wpms[0]:.2f}x spread, median {wpms[len(wpms) // 2]:.0f})")
    print(f"pitch {f0s[0]:.0f}-{f0s[-1]:.0f} Hz  (median {f0s[len(f0s) // 2]:.0f})")
    print(f"\n{out / 'audition.json'}")


if __name__ == "__main__":
    main()
