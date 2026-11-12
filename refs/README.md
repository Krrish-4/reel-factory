# Reference corpus

Raw videos in `corpus/`, one measured record per reference in `formats/`.

    python refs/analyse.py "https://www.instagram.com/p/XXXX/" --label ref-NN-name

One command. It downloads, measures every frame, describes the video with
Gemini, merges the two, and writes a report. ~3 minutes, mostly unattended.

Produces in `formats/`:

- `<label>.json` — **measured**, every frame. Pacing, cuts, element-arrival
  rate, transitions, palette, text bands, speech. *Authority on time.*
- `<label>.semantic.json` — **described** by Gemini in two passes (animation,
  content). *Authority on meaning.* Its timings are soft.
- `<label>.record.json` — **merged**: described scenes snapped onto measured
  cuts, plus the device inventory.
- `<label>.report.md` — **read this one.** Animation-first: the animation
  language, the measured rhythm, and every animation split into "we can build
  this" versus "we cannot", each with its purpose and how to reuse it.

Plus a contact sheet in `sheets/<label>.png`.

## Three things that were wrong and are now fixed

Worth knowing before you trust an output:

1. **Cut detection by magnitude counted every pop-in as a cut** — 53 cuts and a
   0.1s median shot for a video whose real median is 4.9s. Cuts are now judged
   by how much of the frame changed, and the pop-ins became their own much more
   useful metric, `element_events`.
2. **One big prompt made the model skim** — 6 animations and zero devices for a
   video with 109 measured element arrivals. Split into two focused passes, and
   the measured numbers are injected into both prompts so it cannot skim.
3. **Given only primitive names it claimed we could already build everything** —
   it matched an animated bar chart to `StepPill`, a numbered step badge. The
   prompt now carries a one-line definition of each primitive and an explicit
   instruction that a wrong match is worse than a null. Same video went from
   "0 we cannot build" to 7 real work items.

## Why two tools and not one

They fail in opposite directions and neither is sufficient.

A video model cannot see a 7-frame transition, because it samples about one
frame per second — ask it for a duration and it will invent a confident number.
Pixel measurement cannot read a word, hear a syllable, or tell a chart from a
face; before `describe.py` existed the meaning came from a human squinting at 24
stills of a video that lands an element every 0.1s.

So the division is strict: **Gemini says WHAT, ffmpeg+numpy says WHEN and HOW
FAST.** `describe.py` explicitly instructs the model to describe animation in
words and not numbers, for exactly this reason.

## Why the corpus exists

The reels in this repo derive their entire motion language from ONE measured
reference. That is why they look good and why they all look alike. A corpus
turns a style into a vocabulary.

Keep two axes separate when reading a record:

- **FORMAT** — structure, pacing, shot grammar, device inventory
- **TREATMENT** — palette, type, motion feel

They vary independently. `ref-01` shares our treatment almost exactly and has a
completely different format, which is the proof. A corpus of references that all
share one treatment will improve structure and change nothing visually.

## Always run the tool on our own output too

`ours-preview-v10` and `ours-protocol-v4` are in `formats/`. A reference number
means nothing without ours measured by the same instrument on the same day.

## What the corpus concluded

Measured medians over all 21 references, against our own reels:

| axis | corpus | ours-preview-v10 | ours-protocol-v4 |
|---|---|---|---|
| frozen frames | 50.5% | 80.8% | 85.1% |
| element arrivals / min | 88.8 | 64.9 | 25.5 |
| continuous motion | 27.3% | 9.4% | 10.1% |
| cuts / min | 4.0 | 4.0 | 5.4 |
| speech | 96.3% | 74.5% | 85.3% |

Cut rate already matches. The deficit is density inside scenes: we are 30 points
too frozen, land a third fewer elements, have a third the continuous motion, and
carry ~17s of dead air.

`docs/making-a-reel.md` turns those numbers into a procedure.

## Two corrected measurements

Both were wrong in the record for a while and both changed a conclusion:

- **continuous motion never reached `record.json`.** It was measured but not
  merged, so every reference read 0% against our reels' 9.4% — inverting the
  finding. The corpus median is 27.3%.
- **`pct_scene_changes_that_are_cuts` could exceed 100%** (428% at worst). More
  measured cuts than described scene changes means the DESCRIPTION under-counted
  — true for 5 of 21 — not that a percentage broke its ceiling. Now capped, with
  `description_undercounted_scenes` flagging it.
