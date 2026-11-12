"""Measure a music bed: envelope, tempo, beat grid, and the best loop window.

    python docs/preview-review/analyse-bed.py <mp3> [--want 34.4]

WHY THIS EXISTS. CLAUDE.md's bed rules were all learned from a track that was
never measured first: `energyfields` turned out to be a 14-second -30dB TENSION
CUE with a tritone in the bass, run under a teaching reel, and `vortex` turned
out to be a riser whose RMS climbs from silence across 26.5s. **"Long" and
"loopable" are not the same property.** This prints the envelope in slices, so a
13 dB arc is visible before anything is built on it.

It also emits a BEAT GRID. Graphics cut to a bed only read as cut to it if the
frames come from the track's own onsets rather than from a guessed BPM — the
same argument as `WORD_CUES` for the voice.

METHOD, and its limits. Onset strength is the positive first difference of a
log-mel-ish band energy, summed across bands; tempo is the autocorrelation peak
of that envelope inside 60-180 BPM; the grid is then a fixed-tempo phase fit,
NOT per-beat tracking. That is the right trade for a bed: a steady phase grid is
what you want to cut to, and it will not wander on a quiet bar the way a
per-onset tracker does. It will be wrong on a track that changes tempo.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys

import numpy as np

SR = 22050
HOP = 256


def pcm(path: str) -> np.ndarray:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR),
         "-f", "f32le", "pipe:1"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def spectrogram(x: np.ndarray, n_fft: int = 1024) -> np.ndarray:
    n = 1 + (len(x) - n_fft) // HOP
    win = np.hanning(n_fft).astype(np.float32)
    idx = np.arange(n_fft)[None, :] + HOP * np.arange(n)[:, None]
    frames = x[idx] * win
    return np.abs(np.fft.rfft(frames, axis=1))


def onset_envelope(S: np.ndarray) -> np.ndarray:
    # Compress, then keep only energy INCREASES — a decay is not an onset.
    L = np.log1p(S * 8.0)
    d = np.diff(L, axis=0, prepend=L[:1])
    env = np.maximum(d, 0).sum(axis=1)
    env -= env.mean()
    return env / (env.std() + 1e-9)


def tempo_and_phase(env: np.ndarray, lo=60.0, hi=180.0):
    fps = SR / HOP
    ac = np.correlate(env, env, mode="full")[len(env) - 1:]
    lags = np.arange(len(ac))
    period = lags / fps
    ok = (period > 60.0 / hi) & (period < 60.0 / lo)
    if not ok.any():
        return None, None
    lag = lags[ok][np.argmax(ac[ok])]
    bpm = 60.0 * fps / lag
    # Fit phase: try every offset inside one beat, keep the one whose comb of
    # beat positions collects the most onset strength.
    best, best_off = -1e9, 0
    for off in range(int(lag)):
        idx = np.arange(off, len(env), lag).astype(int)
        s = env[idx].sum()
        if s > best:
            best, best_off = s, off
    return bpm, best_off / fps


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("mp3")
    ap.add_argument("--want", type=float, default=34.4,
                    help="length of the window to recommend")
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--json", default="")
    a = ap.parse_args()

    x = pcm(a.mp3)
    dur = len(x) / SR
    S = spectrogram(x)
    env = onset_envelope(S)
    fps_env = SR / HOP

    print(f"{a.mp3}\n  {dur:.2f}s\n")

    # ── envelope in 5s slices: is it a bed or a riser? ────────────────
    print("  RMS by 5s slice (dBFS)")
    step = int(SR * 5)
    rms = []
    for i in range(0, len(x) - step, step):
        seg = x[i:i + step]
        r = 20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-12)
        rms.append((i / SR, r))
    for t, r in rms:
        bar = "#" * max(0, int((r + 40) * 1.4))
        print(f"    {t:6.1f}s {r:7.1f}  {bar}")
    span = max(r for _t, r in rms) - min(r for _t, r in rms)
    print(f"\n  envelope span {span:.1f} dB  "
          f"{'-- FLAT ENOUGH TO LOOP' if span < 6 else '-- ARC: this is a riser, not a bed'}")

    # ── tempo and grid ───────────────────────────────────────────────
    bpm, phase = tempo_and_phase(env)
    if bpm is None:
        print("\n  no tempo found in 60-180 BPM")
        return 1
    beat = 60.0 / bpm
    print(f"\n  tempo {bpm:.1f} BPM   beat {beat:.3f}s   "
          f"phase {phase:.3f}s   bar (4/4) {beat*4:.2f}s")

    # ── the steadiest window of the requested length ─────────────────
    win = int(a.want / 5)
    if win >= 2 and len(rms) > win:
        best_i, best_sd = 0, 1e9
        for i in range(len(rms) - win):
            vals = [r for _t, r in rms[i:i + win]]
            sd = float(np.std(vals))
            if sd < best_sd:
                best_sd, best_i = sd, i
        start = rms[best_i][0]
        # snap to a downbeat so the reel starts on one
        bar = beat * 4
        k = round((start - phase) / bar)
        start = max(0.0, phase + k * bar)
        print(f"\n  steadiest {a.want:.1f}s window starts {start:.2f}s "
              f"(sd {best_sd:.2f} dB), snapped to a downbeat")

    # ── the grid, in frames ──────────────────────────────────────────
    beats = [phase + i * beat for i in range(int((dur - phase) / beat))]
    bars = beats[::4]
    print(f"\n  {len(beats)} beats, {len(bars)} bars")
    print("  first 8 beats (s):  " + "  ".join(f"{b:.2f}" for b in beats[:8]))
    if a.json:
        json.dump({"bpm": bpm, "beat": beat, "phase": phase,
                   "beats": beats, "bars": bars, "duration": dur},
                  open(a.json, "w"), indent=1)
        print(f"\n  wrote {a.json}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
