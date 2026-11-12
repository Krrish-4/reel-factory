---
name: reel-review
description: Judge whether a finished cut is good. Load after rendering, before calling a reel done, or when deciding what to fix next.
---

# Review

## Rule P: every reel goes through the reference pipeline

```
python refs/analyse.py out/<render>.mp4 --label ours-<name>
```

The same command, the same two authorities, the same report as the 21
references. Not "measure it and eyeball it" — the full pipeline including Gemini.

Self-measurement alone produced a cut that passed every check and was still
unpostable. The Gemini pass catches the class of defect pixel measurement is
structurally blind to. On its first run it found three that eight renders had
not: every caption missing its last word, the disclaimer beat reading as *"a
close-up preview of specific eye and lip procedures"*, and 17 devices with none
used twice.

**Read the semantic record for what it got WRONG about us.** When the model
misreads a beat, the beat is ambiguous. That misreading is the finding. Listing
two human subjects meant the reel changed who the face was. Describing nine
shots as one layout meant it was one layout.

## The trap

**Never move a metric instead of fixing the video.** 85% frozen led to a slow
zoom on every static beat. It did not work — the tool analyses at 160×284, so
0.45px/frame is invisible — and it would not have been a fix if it had. A
creeping zoom on an empty beat still reads as a frozen frame.

## Measure at the right resolution

`measure-format.py` analyses at **160×284**, where a jawline change and a 2px
slider handle are a fraction of a pixel. A cut that moves continuously read as
94.6% frozen there. Re-measured at **270×480** it was 9.5% still against a corpus
median of 12.2% — the *least* static of three reels, not the most.

Before dismissing **or acting on** a frozen number, re-measure a dozen corpus
reels at the resolution you are using and compare medians. Rule U.

## Quote corpus figures from the file

`refs/corpus-stats.json`, generated. Three remembered numbers drove real design
decisions and all three were wrong: "headline band 46.3%" (one reference's value;
median is 71.4, range 20.9–100 — two reels had their bursts shortened to chase
it), "243 wpm" (transcripts include on-screen text; real read ~170), and "every
reference has `notable_techniques`" (it is empty for all 21).

Four of nine axes are marked `"target": false` — the references disagree, so
there is nothing to hit. If a number is not in that table with an `n`, do not
quote it.

## Look at it at phone size

```
python gen/phone-sheet.py out/<render>.mp4 --shots src/refina/<reel>/shots.json
```

390px, one tile per beat. Every still judged in this repo was rendered at 1080
and looked at on a monitor — 2.8× the size the audience gets. The first time a
cut was viewed at 390: the entire annotation layer was illegible, a beat that
read as a considered diagram collapsed into a small photo in grey, and two beats
did not show their own claim at all.

**None of that is measurable and all of it is obvious in one glance.** This step
cannot pass or fail. It is the one that needs eyes.

## Also worth doing

A contact sheet of the whole reel (`ffmpeg tile`) shows composition repetition
that a beat-by-beat view hides.
