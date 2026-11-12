# QOVES motion reference — measured

Source: `instagram.com/p/DbwRks8qaIP` — "Can you tell if a man will age well?",
52.7s, 1080x1920, **24fps, 1265 frames**. Background flat `#A0B6C0` for 0-48.4s.

Measured by extracting **every frame** with
`docs/preview-review/analyse-reference.py`. This matters: 40 uniform samples
land 1.3s apart and the transitions here last 0.29-1.21s, so a sampled pass
cannot see them at all. Anything below that says "measured" came from all 1265
frames; anything that says "observed" came from reading a contact sheet of a
window at full frame rate.

## The headline finding

**It almost never hard-cuts.** One hard cut in the entire body (f213, 8.88s).
Six more exist only inside the closing montage. Every other beat boundary is a
**transition of 0.29-1.21s**.

| # | time | frames | dur | kind | best-fit easing |
|---|---|---|---|---|---|
| 1 | 0.67s | 25 | 1.04s | horizontal push | — |
| 2 | 2.92s | 29 | 1.21s | in-place morph | — |
| 3 | 4.58s | 20 | 0.83s | vertical push | easeInOut cubic |
| 4 | 8.88s | 2 | 0.08s | **hard cut** | — |
| 5 | 13.88s | 7 | 0.29s | scale / reveal | easeOut cubic |
| 6 | 17.38s | 27 | 1.12s | vertical push | easeInOut cubic |
| 7 | 20.50s | 23 | 0.96s | vertical push | easeInOut cubic |
| 8 | 21.71s | 14 | 0.58s | vertical push | easeInOut cubic |
| 9 | 28.21s | 23 | 0.96s | vertical push | easeIn cubic |
| 10 | 36.21s | 26 | 1.08s | vertical push | easeInOut cubic |
| 11 | 38.71s | 14 | 0.58s | scale / reveal | easeInOut cubic |
| 12 | 42.83s | 20 | 0.83s | scale / reveal | easeOut quad |
| 13 | 48.54s | 13 | 0.54s | wipe to outro | easeIn cubic |

**Median 20 frames @24fps = 0.83s → ~25 frames at 30fps.**
Held stretches between transitions run **1.2-7.0s**.

## Four findings that matter as much as the durations

**1. easeInOut cubic.** Fitted with error 0.005-0.07 across six transitions.
Accelerating *and* decelerating is most of what reads as "smooth". Ease-out
alone (arrive fast, settle) reads as mechanical by comparison.

**2. The type layer does not move.** During a plate slide, the headline and the
bottom caption stay exactly where they are — only the imagery travels.
Transitions are **plate-level, not frame-level**. Observed at f867-896: the
Clooney pair slides down and out while "Skin damage and hair loss undo it"
holds its position and blurs in place.

**3. Headlines blur OUT as well as in.** f874-878: the outgoing line
progressively blurs while the plate travels; the incoming line then sharpens
word by word over ~12 frames. We only ever blur in.

**4. Tags accumulate.** Checkmark tags (`Angularity ✓`, `Structure ✓`,
`Sexual dimorphism ✓`) pop in one per beat and **persist**, so the argument
visibly stacks up. They are not a progress indicator that moves — they are a
growing list.

## When to use which

| Situation | Device | Spec |
|---|---|---|
| New subject, same layout | horizontal push | 25f, outgoing exits one side as incoming enters the other |
| New beat, new layout | vertical push | 25f, easeInOut cubic |
| Same subject, new state | in-place morph / crossfade | ~29f |
| Small element arriving | scale / reveal | 7-14f, easeOut cubic |
| Something leaving for good | departure | easeIn cubic — accelerates away |
| Deliberate overload / climax | rapid montage | **2 frames per image** (~15/sec) |
| Ending | wipe to outro card | 13f, easeIn cubic, left-to-right |
| Genuine emphasis | hard cut | used **once** in 52s — spend it carefully |

## Stillness is not the problem

The reference measures **62.5% frozen**. Our `refina-preview-v5` measures 69.2%.
Comparable. The reference does not move more than us — it moves *between* beats,
where we cut. Do not chase the frozen percentage; chase the boundaries.

## Two mistakes made while measuring this

Recorded so they are not repeated:

- **The centroid classifier reported the opening as "dissolve in place."** It
  compares the first and last frame of a window, and a full traverse — outgoing
  exits left while incoming enters right — returns the centroid to centre. A
  contact sheet of f16-40 showed an unmistakable horizontal push. Always confirm
  a classification by looking at the window.
- **The ending was first called a background change.** Corner-pixel sampling
  showed `[160 182 192]` throughout, then `[243 243 243]` sweeping in from the
  right at f1163 and holding for the last 4.3s. It is better modelled as an
  **outro card over the sage** than as the stage changing colour — which keeps
  "flat sage for the entire runtime" intact.

## Reproducing

```bash
python docs/preview-review/analyse-reference.py <video.mp4>
```

Prints the motion profile, every event with its duration, the travel direction
and the best-fit easing. Run it against our own renders too — that is the
apples-to-apples check that our transitions land at ~25 frames and fit
easeInOut cubic the same way the reference's do.
