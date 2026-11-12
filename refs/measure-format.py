"""Turn a reference video into a measured FORMAT record.

    python refs/measure-format.py refs/corpus/ref-01.mp4 [--label "name"]

Writes refs/formats/<stem>.json and prints a summary.

WHY THIS EXISTS
---------------
Everything this repo knows about motion came from ONE video, measured frame by
frame. That is why the reels look good and also why they all look the same: a
single reference is a style, not a vocabulary. This script is the thing that
turns a pile of references into a vocabulary — run it on every ad worth
stealing from, and each becomes a record you can select rather than a vibe you
have to remember.

The separation that matters is TREATMENT (palette, type, motion feel) vs FORMAT
(structure, pacing, shot grammar). They are independent: two videos can share a
palette and share nothing else. The fields below deliberately measure format,
with only enough treatment signal to tell whether two references are cousins.

WHAT IS AND IS NOT MEASURED
---------------------------
Measured honestly: cut positions, shot lengths, frozen ratio, per-frame motion,
transition durations, background flatness, palette, text-band occupancy, speech
timing and speech/silence ratio.

Approximated, and flagged as such in the output: `face_ratio` uses a skin-tone
heuristic in the centre of the frame because OpenCV is not installed here. It
separates "big face on screen" from "chart on screen" well enough to be useful
and should not be quoted as accuracy.

NOT measured: what the words say, whether the thing is any good, and anything
requiring OCR. Read the contact sheet for that — the numbers describe rhythm,
not meaning.
"""
import argparse
import json
import os
import re
import subprocess
import sys

import numpy as np

W, H = 160, 284  # analysis resolution; aspect-preserving for 1080x1920


# ── decode ────────────────────────────────────────────────────────────
def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height,r_frame_rate",
         "-show_entries", "format=duration", "-of", "json", path],
        capture_output=True, text=True).stdout
    j = json.loads(out)
    st = j["streams"][0]
    num, den = st["r_frame_rate"].split("/")
    return {
        "width": st["width"],
        "height": st["height"],
        "fps": round(float(num) / float(den), 3),
        "duration": round(float(j["format"]["duration"]), 3),
    }


def gray_frames(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path,
         "-vf", f"scale={W}:{H},format=gray", "-f", "rawvideo", "-"],
        capture_output=True).stdout
    n = len(raw) // (W * H)
    return np.frombuffer(raw[: n * W * H], np.uint8).reshape(n, H, W).astype(np.float32)


def rgb_frames(path, every=6):
    """small RGB sample for palette work"""
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path,
         "-vf", f"select=not(mod(n\\,{every})),scale=64:114,format=rgb24",
         "-vsync", "0", "-f", "rawvideo", "-"],
        capture_output=True).stdout
    n = len(raw) // (64 * 114 * 3)
    return np.frombuffer(raw[: n * 64 * 114 * 3], np.uint8).reshape(n, 114, 64, 3)


# ── structure ─────────────────────────────────────────────────────────
def find_cuts(g):
    """-> (cut_frames, per-frame mean diff, per-frame fraction-changed)

    A cut is judged by the SPATIAL EXTENT of the change, not its magnitude.
    Using magnitude alone counted every element pop-in as a cut and reported a
    0.1s median shot for a video whose real median is ~3s: in this house style
    things arrive one at a time inside a held shot, and each arrival is a big
    local change. A real cut replaces most of the frame at once.
    """
    diff = np.abs(np.diff(g, axis=0))
    mean = diff.mean(axis=(1, 2))
    frac = (diff > 22).mean(axis=(1, 2))
    cuts, last = [], -99
    for i, v in enumerate(frac):
        if v > 0.28 and (i + 1) - last > 5:
            cuts.append(int(i + 1))
            last = i + 1
    return cuts, mean, frac


def element_events(mean, frac, cuts, fps):
    """Localised arrivals: something pops in without the shot changing.

    This is the build-up rhythm — cards, chips, chart bars and thumbnails
    landing one after another inside a static shot. It is one of the strongest
    format signals in the corpus and is invisible to a cut detector.
    """
    med = float(np.median(mean))
    cutset = {c for c in cuts}
    ev, last = [], -99
    for i, v in enumerate(mean):
        f = i + 1
        if v > max(4.0, med * 5) and frac[i] <= 0.28 and f not in cutset and f - last > 2:
            ev.append(f)
            last = f
    gaps = np.diff(ev) if len(ev) > 1 else np.array([])
    return {
        "count": len(ev),
        "per_min": round(len(ev) / (len(mean) / fps) * 60, 1),
        "median_gap_s": round(float(np.median(gaps)) / fps, 2) if gaps.size else None,
        "frames": ev[:40],
    }


def continuous_motion(g, cuts, fps, tiles_y=14, tiles_x=8):
    """Sustained movement confined to part of the frame — scrolls, drifts, pans.

    `element_events` only sees DISCRETE arrivals: a spike in mean difference
    from something popping into place. It is blind to anything that moves
    smoothly, because smooth motion never spikes.

    That blindness produced a real error. On ref-10 a stack of cards scrolls a
    new labelled item into view roughly once a second for fourteen seconds, and
    the detector reported SIX element arrivals for the whole reel — then that
    six was injected into the Gemini prompt as "roughly 6 discrete things
    animate onto this screen", actively teaching the model the video was sparse.
    It came back with four animations for a video containing at least fourteen.

    So motion is also measured by AREA. The frame is tiled; a frame counts as
    localised motion when some tiles are moving but most are not. Runs of such
    frames are continuous spans. A full-frame push fails the test (too much
    moving) and so does a still frame (too little), which is what separates this
    from both cuts and transitions.
    """
    diff = np.abs(np.diff(g, axis=0))
    n, H_, W_ = diff.shape
    ty, tx = H_ // tiles_y, W_ // tiles_x
    t = diff[:, : ty * tiles_y, : tx * tiles_x]
    t = t.reshape(n, tiles_y, ty, tiles_x, tx).mean(axis=(2, 4))
    active = (t > 6.0).reshape(n, -1).mean(axis=1)

    cutset = {c for c in cuts}
    local = [(0.02 < a < 0.35) and (i + 1) not in cutset for i, a in enumerate(active)]
    spans, i = [], 0
    while i < n:
        if local[i]:
            j = i
            while j < n and local[j]:
                j += 1
            if j - i >= 8:  # ~0.3s; shorter is a pop-in, not a scroll
                spans.append((int(i), int(j), round((j - i) / fps, 2)))
            i = j
        else:
            i += 1
    total = sum(sp[2] for sp in spans)
    return {
        "spans": len(spans),
        "total_s": round(total, 2),
        "pct_of_runtime": round(100 * total / (n / fps), 1),
        "median_span_s": round(float(np.median([sp[2] for sp in spans])), 2)
                         if spans else None,
        "longest_span_s": max((sp[2] for sp in spans), default=None),
        "_note": "movement confined to part of the frame, sustained over time — "
                 "scrolls and drifts, which element_events cannot see",
    }


def transitions(d, cuts, fps):
    """Sustained elevated motion that is NOT a single-frame cut = a transition."""
    med = float(np.median(d))
    hi = max(2.5, med * 2.6)
    spans, i = [], 0
    cutset = set(cuts)
    while i < len(d):
        if d[i] > hi:
            j = i
            while j < len(d) and d[j] > hi:
                j += 1
            length = j - i
            # ignore 1-2 frame spikes (those are the cuts) and keep real moves
            if length >= 4 and not any(c in cutset for c in range(i, j + 1)):
                spans.append((int(i), int(j), round(length / fps, 3)))
            i = j
        else:
            i += 1
    return spans


# ── treatment signal ──────────────────────────────────────────────────
def background(rgb):
    """Dominant colour and how flat the frame backgrounds are."""
    # corners are the least likely to hold subject
    c = np.concatenate([rgb[:, :12, :10], rgb[:, :12, -10:],
                        rgb[:, -12:, :10], rgb[:, -12:, -10:]], axis=2)
    c = c.reshape(c.shape[0], -1, 3).astype(np.float32)
    per_frame = c.mean(axis=1)
    dom = np.median(per_frame, axis=0)
    spread = float(np.median(c.std(axis=1).mean(axis=1)))
    drift = float(np.abs(per_frame - dom).mean())
    return {
        "dominant_rgb": [int(v) for v in dom],
        "dominant_hex": "#%02X%02X%02X" % tuple(int(v) for v in dom),
        "corner_flatness": round(spread, 2),
        "background_drift": round(drift, 2),
        "flat_background": bool(spread < 12 and drift < 14),
    }


def text_bands(g):
    """How often the headline band and caption band carry high-contrast marks.

    Text on a flat ground shows up as local contrast. This does not read the
    text; it measures whether those two tracks are in use, which is one of the
    strongest format signals there is.
    """
    def occupancy(band):
        # local contrast via difference from a blurred version (box filter)
        k = 5
        pad = np.pad(band, ((0, 0), (k, k), (k, k)), mode="edge")
        acc = np.zeros_like(band)
        for dy in range(-k, k + 1):
            for dx in range(-k, k + 1):
                acc += pad[:, k + dy: k + dy + band.shape[1],
                           k + dx: k + dx + band.shape[2]]
        local = acc / ((2 * k + 1) ** 2)
        contrast = np.abs(band - local)
        return (contrast > 18).mean(axis=(1, 2))

    top = occupancy(g[:, int(0.07 * H): int(0.22 * H), :])
    bot = occupancy(g[:, int(0.76 * H): int(0.93 * H), :])
    return {
        "headline_band_frames_pct": round(100 * float((top > 0.012).mean()), 1),
        "caption_band_frames_pct": round(100 * float((bot > 0.012).mean()), 1),
    }


def face_ratio(rgb):
    """APPROXIMATE. Skin-tone fraction in the central column, no face detector."""
    r = rgb[:, :, :, 0].astype(np.int16)
    gg = rgb[:, :, :, 1].astype(np.int16)
    b = rgb[:, :, :, 2].astype(np.int16)
    skin = (r > 80) & (gg > 40) & (b > 30) & (r > gg + 12) & (gg > b - 8)
    centre = skin[:, 20:95, 12:52]
    frac = centre.mean(axis=(1, 2))
    return {
        "approx_big_face_frames_pct": round(100 * float((frac > 0.22).mean()), 1),
        "approx_any_face_frames_pct": round(100 * float((frac > 0.07).mean()), 1),
        "_method": "skin-tone heuristic, not a face detector",
    }


# ── audio ─────────────────────────────────────────────────────────────
def speech(path, duration):
    p = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", path,
         "-af", "silencedetect=noise=-32dB:d=0.15", "-f", "null", "-"],
        capture_output=True, text=True)
    starts = [float(m) for m in re.findall(r"silence_start: ([0-9.]+)", p.stderr)]
    ends = [float(m) for m in re.findall(r"silence_end: ([0-9.]+)", p.stderr)]
    segs, cur = [], 0.0
    for i, s in enumerate(starts):
        if s > cur + 0.01:
            segs.append((cur, s))
        cur = ends[i] if i < len(ends) else duration
    if cur < duration - 0.01:
        segs.append((cur, duration))
    spoken = sum(b - a for a, b in segs)
    gaps = [starts[i] - (ends[i - 1] if i else 0) for i in range(len(starts))]
    return {
        "speech_segments": len(segs),
        "speech_pct": round(100 * spoken / duration, 1),
        "median_phrase_s": round(float(np.median([b - a for a, b in segs])), 2) if segs else 0,
        "has_music_bed": bool(len(starts) > 0 and spoken / duration > 0.55
                              and len([g for g in gaps if g > 0.4]) < len(starts) * 0.5),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("path")
    ap.add_argument("--label", default=None)
    a = ap.parse_args()

    meta = probe(a.path)
    fps, dur = meta["fps"], meta["duration"]
    g = gray_frames(a.path)
    rgb = rgb_frames(a.path)

    cuts, d, frac = find_cuts(g)
    trans = transitions(d, cuts, fps)
    elems = element_events(d, frac, cuts, fps)
    cont = continuous_motion(g, cuts, fps)
    med = float(np.median(d))

    bounds = [0] + cuts + [len(g)]
    shots = [(bounds[i + 1] - bounds[i]) / fps for i in range(len(bounds) - 1)]
    shots = [s for s in shots if s > 0.05]

    rec = {
        "label": a.label or os.path.splitext(os.path.basename(a.path))[0],
        "source": a.path,
        "canvas": {k: meta[k] for k in ("width", "height", "fps")},
        "duration_s": dur,
        "pacing": {
            "cuts": len(cuts),
            "cuts_per_min": round(len(cuts) / dur * 60, 1),
            "median_shot_s": round(float(np.median(shots)), 2) if shots else None,
            "shortest_shot_s": round(float(np.min(shots)), 2) if shots else None,
            "longest_shot_s": round(float(np.max(shots)), 2) if shots else None,
            "frozen_pct": round(100 * float((d < max(0.6, med * 0.5)).mean()), 1),
        },
        "element_events": elems,
        "continuous_motion": cont,
        "transitions": {
            "count": len(trans),
            "median_s": round(float(np.median([t[2] for t in trans])), 2) if trans else None,
            "spans_s": [t[2] for t in trans][:20],
        },
        "treatment": {**background(rgb), **text_bands(g)},
        "subject": face_ratio(rgb),
        "audio": speech(a.path, dur),
        "cut_frames": cuts,
    }

    os.makedirs("refs/formats", exist_ok=True)
    out = f"refs/formats/{rec['label']}.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(rec, f, indent=2)

    print(f"\n{rec['label']}  {meta['width']}x{meta['height']} @{fps}  {dur:.1f}s")
    print(f"  pacing      {rec['pacing']['cuts']} cuts "
          f"({rec['pacing']['cuts_per_min']}/min), median shot "
          f"{rec['pacing']['median_shot_s']}s, frozen {rec['pacing']['frozen_pct']}%")
    print(f"  shots       shortest {rec['pacing']['shortest_shot_s']}s, "
          f"longest {rec['pacing']['longest_shot_s']}s")
    print(f"  transitions {rec['transitions']['count']}, median "
          f"{rec['transitions']['median_s']}s")
    e = rec["element_events"]
    print(f"  build-up    {e['count']} element arrivals ({e['per_min']}/min), "
          f"median gap {e['median_gap_s']}s")
    c = rec["continuous_motion"]
    print(f"  continuous  {c['spans']} sustained local-motion spans, "
          f"{c['total_s']}s = {c['pct_of_runtime']}% of runtime "
          f"(longest {c['longest_span_s']}s)")
    t = rec["treatment"]
    print(f"  ground      {t['dominant_hex']} flat={t['flat_background']} "
          f"(flatness {t['corner_flatness']}, drift {t['background_drift']})")
    print(f"  type tracks headline band {t['headline_band_frames_pct']}% of frames, "
          f"caption band {t['caption_band_frames_pct']}%")
    s = rec["subject"]
    print(f"  subject     big face {s['approx_big_face_frames_pct']}% "
          f"(approx), any face {s['approx_any_face_frames_pct']}%")
    au = rec["audio"]
    print(f"  audio       {au['speech_pct']}% speech, {au['speech_segments']} phrases, "
          f"median {au['median_phrase_s']}s, music bed={au['has_music_bed']}")
    print(f"\nwrote {out}")


if __name__ == "__main__":
    sys.exit(main())
