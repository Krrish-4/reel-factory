# Making a reel from a script

What to do when handed a script. Written after measuring 21 reference reels
frame by frame (`refs/`), building a component kit, and shipping four reels — so
the numbers here are measured, not preferred.

Read `docs/reel-invariants.md` first for the failure modes. This is the
procedure.

---

## 1. The targets a reel has to hit

Medians across 21 measured references, against our own two reels:

| axis | corpus | ours-preview-v10 | ours-protocol-v4 |
|---|---|---|---|
| frozen frames | **50.5%** | 80.8% | 85.1% |
| element arrivals / min | **88.8** | 64.9 | 25.5 |
| continuous motion | **27.3%** of runtime | 9.4% | 10.1% |
| cuts / min | 4.0 | 4.0 | 5.4 |
| median shot | 7.5s | 10.4s | 7.1s |
| speech | **96.3%** | 74.5% | 85.3% |

**Four gaps, and they are the brief for any new reel:**

1. **We are ~30 points too frozen.** Not one reference is as static as ours.
2. **We land too few things.** 89/min is the norm; our best is 65 and the
   protocol reel is 25.
3. **We have almost no continuous motion.** 9% against 27%. A frame can be
   filled two ways — things *arriving* (ref-01: 118/min) or things *travelling*
   (ref-10: 64% continuous, zero hard cuts). We do neither, we hold and cut.
4. **We carry ~17 seconds of dead air.** 74.5% speech against 96.3% means a
   music bed, not more spot effects; 16 one-shots total about 8 seconds.

Our cut rate is already exactly on the median. The problem was never scene
pacing — it is density *inside* scenes.

## 2. Pick an archetype, then match its numbers

Per-archetype medians, for archetypes with more than one example:

| archetype | n | dur | frozen | arrivals/min | continuous | cuts/min | shot | speech |
|---|---|---|---|---|---|---|---|---|
| evidence explainer | 8 | 61s | 49.1% | 95.5 | 27.6% | 5.1 | 6.2s | 95.4% |
| educational explainer | 6 | 54s | 43.2% | 89.4 | 28.0% | 3.0 | 18.6s | 94.2% |
| listicle | 2 | 28s | 59.8% | 34.3 | 28.3% | 1.4 | 13.5s | 99.8% |

Both reels we have made are **product demos**, which does not appear in this
corpus at all — 8 of 21 are evidence explainers, where a claim is made and a
cited study appears under it. That format's `CitationCard` is the only device
recurring across four or more reels, and it is open to us: a real source may be
cited, recorded on a `# SOURCE:` line and gated by `gen/check-citations.py`.

A listicle is a genuinely different shape: half the runtime, a third of the
arrival rate, near-continuous speech. Do not carry evidence-explainer pacing
into one.

## 3. Check what exists before writing anything

Three inventories, in the order to search them:

1. **`src/refina/kit/`** — 20 components built from this corpus. Each absorbs
   several reference animations; `refs/BUILD-PLAN.md` says which.
2. **`src/components/remocn/`** — 62 vendored components. See
   `docs/remocn-catalog.md`. **Read `docs/remocn-integration.md` first** — four
   things bite, including that every remocn text component hardcodes its own
   font stack and so may not carry headline or caption type in a shipping reel.
3. **`src/refina/protocol/motion.tsx` + `preview/draw.tsx`** — the original
   primitives.

This order matters because it has already gone wrong: a component kit was built
without checking `src/components/remocn/`, and three components
(`AnimatedBarChart`, `TypewriterInput`, `InlineTextSwap`) duplicate ones that
were already installed.

## 4. Timing comes from the voiceover, never from a guess

```
python docs/preview-review/gen-words.py      # rewrites preview/words.ts
```

Cue frames AND per-word frames are generated from the audio. Edit the
generator's `CUES` table — never `words.ts`. Beat boundaries derive from cue
frames.

`check-lag.py` must report **0** words arriving after their phrase ends.

## 5. Motion vocabulary

From `docs/qoves-motion-reference.md`, measured: ~25-frame plate transitions,
easeInOut cubic, roughly half of all scene changes carried by a transition
rather than a cut.

Element arrivals are what close the density gap — a beat that holds a static
card is a beat that should be assembling one. `StaggerGrid`, `TagStack`,
`AnimatedCheckList` and `CardStack` all convert a still frame into an arriving
one without changing the content.

For continuous motion use `CardScrollStack` or `CardCarousel`. ref-10 carries
fourteen labelled cards past the viewer in a single unbroken shot with **zero**
hard cuts, and reads as busier than reels with five times its cut rate.

## 6. Sound

56 effects in `public/sfx/` across 7 categories. `ui-tech` maps onto app-demo
beats, `transition` onto plate moves, `cinematic` onto section openings.
`meme-comedy`, `gaming` and `cartoon-retro` do not fit this brand's register.

The 17-second silence gap needs a **bed**, not more one-shots. The long
cinematic textures (`vortex` 26.5s, `energyfields` 14s, `film-burn` 30s) are the
only loopable material currently available.

## 7. Verify from the render, never from the source

```
python refs/measure-format.py out/<render>.mp4 --label ours-<name>
python refs/library.py          # puts it in the table beside all 21 references
```

That is the check that matters: does the finished file hit the targets in §1.
Everything else — `find-cuts.py`, `check-lag.py`, stills per changed beat — is
in `docs/reel-invariants.md`.
