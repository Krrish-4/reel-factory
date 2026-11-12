---
name: reel-script
description: Write or revise a reel script. Load before drafting copy, choosing an archetype, or deciding how long a reel should be.
---

# Script

> **Celebrity or trending-topic reel? Follow [PROCESS.md](./PROCESS.md)**: the
> merged v2 process (fact grading, hook variants, 9-beat skeleton with a
> Dossier pivot and comment bait). It overrides this file where the two differ.

## The shape every corpus explainer shares

14 of the 21 references are evidence or educational explainers. Both of our own
reels first measured as **product demo**, and that gap is the thing to close.
Every explainer in the set runs this sequence:

1. **A question about the viewer's own face**, over a recognisable image with an
   analytical overlay. Usually literally a question: *"Do you have cute eyes or
   hot eyes?"*, *"Should you lie about getting work done?"*
2. **A flat claim.** *"The lips can make or break a face."*
3. **Evidence.** Named studies in 8 of them — see the constraint below.
4. **Two to four numbered criteria**, each with its own visual proof.
5. **A nuance that complicates the claim.** *"None of this means the surgery did
   nothing."* This is what makes them read as teaching rather than selling. Every
   one of them has it. **Do not cut it for time.**
6. **No-hierarchy reassurance**, then a single-line CTA at the very end.

Five of them also carry a **self-test** — something the viewer can do right now.
It is the most saveable moment in the format.

## The constraint that shapes everything

**No study may be cited without a real source — and a real source may be cited.**
Refina's content rules forbid inventing facts. They do not forbid research.

This used to read "eight references lean on named research; we cannot", and that
was too strong. It banned the format the corpus is actually built on — 8 of 21
references make a claim and slide a cited study under it — and left
`kit/CitationCard`, the only device recurring across four or more reels, with
nothing to show. **Cite whatever is real and recorded.** What is banned is the
*shape* of authority without the substance: "studies show fuller lips signal
fertility", with nothing behind it.

A citation carries its own receipt, in the script file, above the claim:

```
# SOURCE: Author et al. (2021), Journal. https://doi.org/10.xxxx/yyyy
In that trial, participants rated them higher.            | 0.30
```

`gen/check-citations.py` fails a script whose wording reads as research and
carries no `# SOURCE:` line with a DOI or URL. It is a preflight stage in
`gen/check.py`, not a paragraph, because prose does not exit non-zero — the
lesson of rules P and GG. **It cannot tell you the source is real, says what you
claim, or has not been retracted.** Someone still has to have read the paper.

**Absent a recorded source, earn authority another way — and this is still the
default,** because it is cheaper and it is what both shipped explainers do. From
physical facts the viewer can reproduce themselves, or from a measurement we
actually computed and can label honestly (`PER-REGION PIXEL CHANGE, THIS PAIR`
claims a computable difference between two images, not a millimetre measurement
of a face).

And nothing may enter the script that the asset cannot support. If a beat says
"chin down hides a jawline", the asset has to show that at phone size or the
line is a claim the picture does not keep.

## Pacing

Run `python refs/corpus-stats.py --show` — do not quote from memory.

| axis | corpus | note |
|---|---|---|
| duration | 55.5s median (12.6–91) | a target |
| speech | 96.3% (86.5–100) | a target; ours ran 65% |
| cuts/min, shot length, arrivals/min, headline band | — | **NOT targets**, the references disagree |

Real read rate is ~170 wpm. An earlier "243 wpm" figure was wrong — it came from
dividing Gemini transcripts by duration, and transcripts include on-screen text.

## Write in short phrases

One phrase per line, each with its own declared pause. A script written in short
punches *is* its pauses, and one average gap flattens the writing. Long lines
also mean most frames show a partial sentence and the caption track becomes
wall-to-wall text.

The script file is the source of truth — see [Voiceover](../reel-voiceover/REFERENCE.md)
for the format. Nothing downstream types a frame number.

## Before writing

Read `refs/FORMAT-LIBRARY.md` for archetype spread, and at least two
`refs/formats/ref-*.report.md` for the archetype you are aiming at.
