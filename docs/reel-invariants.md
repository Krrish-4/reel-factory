# Reel invariants — the failure modes, and the check that catches each

Every rule here comes from a real defect that shipped or nearly shipped in this
repo. Each one gives the incident, the invariant, and how it is checked. If a
rule has no check, that is stated — those are the ones that still need a human.

Read this before touching a reel. It is the deduplicated version of the rules
scattered through `CLAUDE.md`; `CLAUDE.md` stays the per-composition contract.

**A rule's letter is a stable ID, not a position.** Letters are assigned when a
rule is written and never reused, so citations elsewhere in the repo keep
pointing at the same rule. They are therefore not in strict alphabetical order
down the page: `DD` and `EE` sit mid-document because they were written early,
collided with `K` and `L`, and were given free letters rather than shifting
every rule after them and breaking fifteen citations of rule P.

---

## A. Geometry is derived from the asset, never typed as a number

**Incident.** The compare panel showed the hero cropped with
`height: 165%; transform: translateY(-16%)`. That window is 16%–76.6% of the
source, but her head starts at 3.08% — the crown was cut off by ~310 source px
and stayed that way for several renders. Separately, the swap deck's face crop
was hardcoded to the *previous* hero's head position, so after the hero was
replaced the contour ring drew on her chest.

**Invariant.** Any crop, scale or placement of a portrait is computed from that
asset's own measured metadata — `headTop`, `faceCx`, aspect ratio. A literal
percentage or pixel offset applied to a portrait is a bug waiting for the next
asset swap.

**Check.** `docs/preview-review/check-pairs.py` measures head top, face centre
and changed-region bbox. Anything that positions a portrait takes those as
props (see `ConvergePanels`' `headFrac` / `faceDx`).

---

## B. Timing is generated from the audio, never hand-edited

**Incident.** Caption cues were derived once, then hand-nudged across many
sessions until they drifted. Worse: two separate passes "fixed" cue *start*
frames when the actual bug was inside the caption component — words were
metered evenly across the cue SLOT, which runs through the silence after the
phrase, so every line fell progressively behind the voice. Correcting starts
could never fix it.

**Invariant.** Cue frames and per-word frames are generated. Edit the
generator's script table and regenerate; never edit `words.ts` by hand.

**Check.** `gen-words.py` writes `src/refina/preview/words.ts`.
`check-lag.py` counts words not yet on screen when their phrase ends — it must
be **0**. `check-rate.py` flags any caption whose text implies a speaking rate
far from the median, which catches text assigned to the wrong span.

---

## C. When the user's eyes disagree with the metric, the metric is wrong

**Incident.** The user reported the rhinoplasty visual arriving late. Measuring
the render showed the cut landed on the exact frame the word was spoken, so I
concluded the timing was fine and the problem must be legibility — and shipped a
zoom into the images. It was not legibility. The fix was to move the clip two
seconds earlier, which is what the user had asked for in the first place.

**Invariant.** A perceptual report is evidence. Measurement can tell you *why*
something reads wrong; it cannot overrule the report that it does. If the
measurement says "correct" and the user says "wrong", the model of what is being
measured is incomplete — frame-alignment is not the same as reading right on
playback.

**Check.** None. This is a process rule: reproduce from the render, propose the
smallest change the user actually described, and ship that before theorising.

---

## D. Timing tables store durations, not just boundaries

**Incident.** `PROC_SPANS` is a list of boundaries. Asked to shift a clip two
seconds earlier, editing the first entry moved its start but left its end — the
clip stretched from 34 frames to 94 instead of moving, and swallowed the next
one's time.

**Invariant.** A structure where editing one number silently changes two clips
is a trap. Either store `(start, duration)`, or edit through a helper that
preserves length, or assert lengths after any boundary change.

**Check.** Print the derived per-clip lengths whenever spans change; they should
only differ where intended.

---

## E. A label may never claim something the asset is not

**Incident.** The swap beat was one prop away from rendering the card "Upper
Blepharoplasty" over `hero2-after`, which is a **facelift** render. Caught
before shipping, but only by reading the frame carefully.

**Invariant.** Every asset declares what it depicts. A procedure label renders
only if it matches the asset's declaration. Where the render does not exist, the
UI must not imply a result — `SwapScene` deliberately refuses to move its rail
selection until `afterAlt` is supplied.

**Check.** Make it structural: the label should come *from* the asset record,
not be passed alongside it. Until the asset registry exists (see the roadmap),
this is enforced by comment and review.

---

## F. Shell commands start from the repo root, and destructive steps never chain

**Incident.** `cd` into a scratch directory persisted across calls and broke
later commands repeatedly. Worse: a cleanup `rm` chained after a failed `cd`
still executed and deleted a finished render that had not yet been copied into
place.

**Invariant.** Every command establishes its own working directory explicitly.
Destructive operations (`rm`, overwriting `out/*.mp4`) never run in the same
chain as a step that can fail before them.

**Check.** Render to a temp path, verify, copy into `out/`, and only then clean
up — as three separate calls.

---

## G. Code edits use unique anchors, not regex

**Incident.** A find-and-replace intended for `ReasonIndex` matched an identical
closing block in `TagStack` and inserted the new element into the wrong
component. TypeScript caught it; it would not have if the two had had the same
variables in scope.

**Invariant.** Structured edits against a unique anchor. If a pattern appears
more than once, the anchor is not unique enough.

---

## H. Smoke-test before a full render

**Incident.** `converge={0}` produced an `interpolate` input range of `[0, 0]`,
which throws — discovered only when a still failed. A region ring carried
`transform="rotate(-90)"`, which swapped its radii, so a wide ellipse over the
eyes rendered as a tall ellipse down the nose.

**Invariant.** A full render is 6–8 minutes. One still per changed beat is
seconds and catches crashes and gross geometry errors.

**Check.** `npx remotion still <comp> <out> --frame=N` for each changed beat,
then look at them.

---

## I. Verify from the render, not from the source

**Incident.** Timing was repeatedly reasoned about from the source `.mp3` and
the component code. The definitive answers came from extracting the audio out of
the finished `.mp4` and from measuring per-frame picture change in the file
itself.

**Invariant.** Claims about the finished video are made against the finished
video.

**Check.** `find-cuts.py` reports the frames where the picture actually moved.
Extract the render's own audio for any timing claim.

---

## J. A transition cannot be longer than the beat it lands in

**Incident.** `RefinaMirrorReel`'s script splits "Not a diagram. Not a gallery.
Your face." into three one-second beats. The product device's plate used the
default 25-frame exit, so the phone was still travelling across `notdiagram`
for 25 of its 30 frames and completely covered the diagram it was supposed to
show. The same beat length also broke the cut INTO `notgallery`: `Drop` starts
its cards 240px above frame at zero opacity, so the beat's own first frame was
empty sage and the cut was invisible.

**Invariant.** A beat shorter than ~2x the transition needs a shorter
transition (`Plate`'s `t`), and anything that animates IN from off-screen at a
hard cut needs a negative `from` so it is already arriving when the cut lands.
`Plate` already clamps its own transition to `len / 2.2`; an outgoing plate
from the PREVIOUS beat does not know about the next beat's length, and that is
the gap.

**Check.** `motion.py` flags beat starts with no hard cut. Read the flagged
list against intent: a plate push is supposed to be invisible at its first
frame, a hard cut is not.

---

## K. Blurring an image exposes its edges

**Incident.** The hope/dread double exposure blurs two portraits and offsets
them. Blur pulls in the transparency just outside the bitmap, so the image's
top edge — invisible on the sharp portrait beats — drew a hard horizontal band
across the frame. Feathering it fixed the band; sliding one layer 16px
vertically then pushed its bright edge back out past the feather and the band
returned, fainter.

**Invariant.** Any blurred or brightness-shifted image layer needs its edges
feathered, and the feather has to be derived from the asset: it must fit inside
the strip of backdrop above the hairline (`headFrac * imgH`), or it eats the
crown. `Portrait`'s own `top * 0.3` is 90px on these heroes and would. Vertical
offsets applied to such a layer must stay well inside the feather.

**Check.** Render a still of the beat and look at the top edge. There is no
number for this one.

---

## L. `motion.py` scores a small element inside a large frame as frozen

**Incident.** `RefinaMirrorReel`'s `rulingout` (a seam sweeping across a 452px
composite) and `step3` (a slider inside a 440px phone) both measured **100%
frozen, motion 0.09**. Both are animating: differencing the render's own frames
across each beat shows 40,738 and 76,111 changed pixels.

**Invariant.** `motion.py`'s per-frame threshold is tuned for plate-level
change. Before acting on a "frozen" reading, difference the first and last
frames of the beat — a beat can be 100% frozen frame-to-frame and still change
completely across its length. This is the documented caveat in the script's own
docstring; it has now caused a false alarm in practice.

**Check.** Extract two frames from the RENDER and count pixels over a
threshold, rather than trusting the per-frame mean.

---

## The verification suite

| script | question it answers |
|---|---|
| `gen-words.py` | regenerates caption + per-word timings from the VO |
| `check-lag.py` | are any words still arriving after their phrase ends? |
| `check-rate.py` | is any caption's text wrong for the audio under it? |
| `check-sync.py` | does every cue start on a real phrase onset? |
| `check-words.py` | when does each line finish assembling? |
| `find-cuts.py` | which frames of the RENDER actually changed? |
| `check-pairs.py` | how big is each before/after change, and where? |
| `check-reveal.mjs` | when is a spring-driven SliderReveal really revealed? |
| `motion.py` | frozen-frame ratio vs the reference |
| `align.py` / `align-flood.py` | normalise a new portrait's framing |
| `voscript.py` | script text -> cue + per-word frames (measure or estimate) |
| `gen-words-mirror.py` | regenerates ALL of RefinaMirrorReel's timing from its script |

Read each script's docstring before trusting its output — several document
readings that produce confident false alarms.

---

## DD. Check what already exists before building it

**Incident.** A 20-component kit was built from the corpus without opening
`src/components/remocn/`, where 62 components were already vendored. Three are
outright duplicates — `AnimatedBarChart`, `TypewriterInput`, `InlineTextSwap` —
and `animated-line-chart` covers the one build-plan item that was skipped as not
worth it. Thirteen Remotion skills were installed at the time, including
`remotion-best-practices`, explicitly described as the router to all the others.
None was read.

**Invariant.** Search the inventories before writing a component:
`src/refina/kit/`, then `src/components/remocn/` (catalog in
`docs/remocn-catalog.md`), then the protocol primitives. Check the installed
skills before hand-rolling anything Remotion already solves.

---

## EE. An automated "we already have this" is a hint, not a verdict

**Incident.** Gemini's `we_already_have` field was used as the build list. A
hand audit of 108 claims rejected **23 (21%)** — a globe wipe called `Reveal`, a
node-network called `TagStack`, an animated bar chart called `StepPill`. Five
components were entirely hidden by wrong matches and appeared nowhere in the
plan. The error clusters on VAGUE primitives: `TrimPath` absorbs anything drawn
(3 of 4 wrong), `Montage` anything with several images (4 of 9). Narrow ones —
`StepPill`, `ChatThread`, `AnimatedCheckList` — were 100% correct.

**Invariant.** A wrong match is worse than a null, because null creates a work
item and a wrong match silently deletes one. Audit before building.

**Check.** `refs/AUDIT.md`, grouped by claimed primitive so ~20 groups are read
instead of ~300 rows.

---

## M. A model asked for seconds will answer in MM:SS

**Incident.** Three formats came back from one model, all meaning the same
thing: `1.07` (MM.SS decimal, meaning 67s), `101` (MMSS integer, 61s) and
`103.5` (MMSS with a fraction, 63.5s). Each hides differently — the decimal
makes the sequence run backwards, the integers exceed the runtime. 41
timestamps across 9 reels were corrupted, `merge-record.py` snapped the affected
scenes to `0.0s`, and **every one of those reels reported `ok`**.

**Invariant.** Normalise timestamps on ingest and assert monotonicity after.
Only rewrite when the reinterpreted value lands after its predecessor AND inside
the runtime — a conservative repair, never an invented one.

**Check.** `normalise_times()` in `describe.py`; the order and range assertions
in `verify.py`. Note `onscreen_text` legitimately runs out of order (items
coexist on screen), so only `timeline` and `shots` are held to strict order — a
first version flagged seven healthy reels and would have trained everyone to
ignore it.

---

## N. Free-tier quota is per key AND per model

**Incident.** A corpus run walked into a wall three times. Pinning to
`gemini-3.7-flash` gave 503 on every reel (newest = most contended); `3.6-flash`
then returned 429 quota-exceeded; `3.5-flash` answered in 1.2s while 3.6 was
refusing. Three repins, each dead for a different reason, none diagnosed until a
direct probe. Worse, a wall on the THIRD pass was not checked — only the first
two — so a reel was written with animations complete and timeline empty and
reported as finished.

**Invariant.** Probe, do not infer, when an API misbehaves: one call gives the
real status code. Check for the wall after EVERY pass; a half-analysed record
that looks finished never gets retried. Rotate keys with the model as the outer
loop and the key as the inner one, or a run degrades to a weaker model while a
fresh key sits unused.

**Also:** Files API uploads are scoped to the key that made them. A rotated key
referencing another key's file HANGS rather than erroring, which surfaces as a
timeout — the least informative symptom available.

---

## O. Verify a patch landed; do not trust that it printed

**Incident.** Two report fixes were announced as done and were not in the code —
the replacement anchors had not matched, the script printed "patched", and the
print was believed. The narrative arc kept rendering `1. 1. 1.` and device
counts stayed inflated for several more exchanges.

**Invariant.** After a scripted edit, grep for the new text or re-run the thing
it changes. "Patched" is the script's opinion, not evidence.

## P. Every reel we build goes through the reference pipeline before it ships

`python refs/analyse.py out/<render>.mp4 --label ours-<name>` — the same command,
the same two authorities, the same report as the 21 references. Not "measure it
and eyeball it". The full pipeline, including Gemini.

**Why this is a rule and not a suggestion.** Self-measurement alone produced a
cut that passed every check I ran and was still unpostable. `measure-format.py`
reported the mirror2 reel as 85.4% frozen, so I added a slow pan to every held
beat to move the number. That is the failure this rule exists to stop:

- It did not work. Frozen went 85.0% -> 85.4%. The tool analyses at 160x284, so
  a 0.45px/frame pan at 1080 is 0.067px/frame and vanishes.
- **It would have been wrong even if it had worked.** A creeping zoom over a
  beat with nothing in it still reads as a frozen frame to a viewer. Moving the
  metric is not the same as fixing the video, and a metric you can satisfy
  without improving anything is a metric you are now optimising against.

The Gemini pass catches the class of defect pixel measurement is structurally
blind to, and on the very first run it caught three that eight renders and four
measured passes had not:

- it transcribed the on-screen captions and **every phrase was missing its last
  word**, which is how we found the completed sentence is only legible for 4-9
  frames before it fades;
- it described the disclaimer beat as *"close-up preview of specific eye and lip
  procedures"* — the shot whose entire job is to disclaim was reading as a
  procedure claim;
- its device inventory showed **17 devices, none used twice**, against a corpus
  median of 11 with at least one recurring. A reel assembled by walking the
  component kit rather than designing a language.

None of those are visible in a pixel diff. All three are obvious to a viewer.

**Read the semantic record for what it got WRONG about us, not just what it got
right.** When the model misreads a beat, the beat is ambiguous. That misreading
is the finding.

## Q. On a flat-background treatment, most corpus numbers have a hard ceiling

Measured on `ours-mirror2-v4`: the fraction of the frame that is anything other
than flat sage, per beat.

    hook  41.7%   built 29.9%   r1  24.7%   close 22.8%   guess 19.7%
    r2    13.1%   r3    12.3%   cta  3.3%   three 2.8%
    whole reel: 22.0%

**Seventy-eight percent of the average frame is background that never changes.**
Everything else follows from that one number:

- `measure-format.py` declares a CUT when >28% of pixels change. If only 22% of
  the frame is ever non-background, a total content swap changes at most 22% —
  so a cut is *arithmetically undetectable*. Converting four section boundaries
  from pushes to hard cuts changed the measured cut count by zero, and the only
  two cuts in the reel are in `built`, the one beat above the threshold.
- "Frozen" is bounded the same way. A beat that is 97% background (`three`,
  `cta`) cannot measure as anything but frozen no matter what happens in it.
- Element arrivals are bounded too: a small object arriving in a big empty
  frame is a small change.

So do NOT read a flat-background reel's frozen/cuts/arrivals against the corpus
median and conclude "add motion". The corpus reels fill their frames; ours does
not. **The number to fix first is occupancy, and fixing it moves all three
others at once** — which is also spec rule 5, "visuals are large, never a small
element floating in a large empty field", arrived at from the other direction.

The hook is the proof: it is the most occupied beat (41.7%) and the least frozen
(47.7%), and it is the only beat nobody has complained about.

## R. An asset's facts live in its record, not in the composition

`public/portraits/registry.json`, written by `gen/registry.py` at ingest, and
checked by `gen/check-assets.py` before a render. Two bug classes collapse into
this one rule, and both had recurred often enough to be predictable.

**Framing.** Head geometry was recomputed in four places and stored in none, so
three generation runs each produced a ~900px head on a different canvas — 82%,
67% and 50% of frame width. The same woman changed size between beats and it
reached the screen. Every registered asset is now reframed to one canonical
`FRAME` on the way in, and a pair whose halves disagree by more than 40px of
head width fails the check.

**Claims.** `<Card name="flood-06a" label="RHINOPLASTY" />` is an assertion
about what a photograph depicts, typed from context and checked by nobody.
Labels now come from `labelOf(id)`, so a card cannot claim a procedure the
record does not carry. An unregistered asset returns `""` — an unverified image
renders with no claim rather than a guessed one.

**And callouts stop being eyeballed.** `TargetReticle` and `DimensionCallout`
take frame pixels, so every callout in this repo was placed by rendering a
still, looking at it, and typing numbers — TEMPLE landed on an under-eye, CHEEK
on a jaw, and a JAWLINE reticle on a nose twice. `anchor(id, region, box, zoom,
focus)` computes the rectangle from face geometry measured off the skin mask
plus the same `object-fit: cover` maths the component uses. A frame coordinate
is not a fact about a face; it is a fact about one composite of one image, and
it stops being true the moment the crop changes.

**The checks assert facts, never aesthetics.** Nothing in `check-assets.py`
fails a build for being too static — see rule P for what happens when a number
becomes a target. And a claim on an *unregistered* asset is a warning that it is
unverifiable, not a failure: failing it would fail the signed-off cuts, and a
check that fires on work nobody may change is a check everyone learns to skip.

## S. Deriving a mark and drawing the picture are one calculation, done twice

**Incident.** `anchor()` exists so a callout is computed from the asset's
measured face box instead of typed as frame pixels — rule A, and it works. But
`Face`, the component that actually draws the portrait, used
`object-fit: cover` + `object-position` + a CSS `transform: scale()`, and that
is **not the same maths**. CSS fits the image at zoom 1, applies
`object-position` to whatever space is left over, and only then scales about the
element's centre — so a zoomed image ends up with the vertical offset for focus
`0.5`, whatever focus it was given. `anchor()` folds the zoom into the fit and
applies focus afterwards.

The two agree only when `focus[1]` is `0.5` or `zoom` is `1`. Everywhere else
every anchored mark is out by `(frameH - frameH * zoom) * (focus[1] - 0.5)`:
21px on "Same Nose"'s hook, **92px** on its nose-and-chin beat, **240px** on its
lid beat. The rings and brackets were all being placed correctly — onto a
composite nobody was drawing.

This is rule A one level up. Rule A stops you typing a coordinate; it does not
stop you deriving one from a model of the layout that the renderer does not
share.

**Invariant.** The component that draws an asset and the function that anchors
marks onto it are ONE piece of geometry. If the anchor maths cannot be expressed
in the layout properties, the component lays itself out explicitly instead —
`ratio/atoms.tsx`'s `Face` performs `cover()` literally, in absolute pixels.

Two consequences worth knowing before doing this to another reel:

- **A clip becomes image-relative.** Once `Face` sizes itself to the zoomed
  image, an `inset()` on it is a percentage of the IMAGE, not the frame, so a
  "50%" wipe lands wherever the image happens to be. `Reveal` clips a
  frame-sized `AbsoluteFill` wrapping the image instead.
- **Fix it on your own side.** `anchors.ts` is shared with `RefinaChanged`,
  whose callouts were placed by eye against the old behaviour. Correcting the
  shared module would have silently moved them.

**Check.** `docs/preview-review/check-crops.py` prints, per beat, the source
rows the crop actually shows and where the anatomy lands in frame. It replicates
`Face`'s layout, so it fails the moment the two models diverge again.

---

## T. `promote.py` pads the bottom, and the pad lands in shot

**Incident.** Every portrait promoted onto the canonical frame is padded with
flat backdrop across its full width at the bottom — from source row 1753 on
`ratio1`, 1730 on `bleph1`. At full-bleed zooms below about 1.17 that pad is
inside the frame, and it draws a pale band under the subject's shoulders. Five
of "Same Nose"'s nine beats shipped it into their first stills, where it was
mistaken for a scrim artefact.

**Invariant.** A full-bleed beat's zoom and focus are solved against the asset's
measured pad row, not chosen by eye. The pad is a property of the promoted file,
so it moves with the asset and cannot be fixed once per reel.

**Check.** `check-crops.py` measures the pad row by scanning up for the last
non-flat row and flags any beat whose visible range reaches it. Exit code 1 if
any does.

## U. Compare against the corpus at the same resolution, or not at all

**Incident.** `measure-format.py` analyses at **160x284** (line 45). "Same Nose"
compares two portraits that differ only along the jawline and drives that
comparison with a 2px slider handle — at 160px wide the handle is a fifth of a
pixel and the jaw change is a few pixels, so the tool reported **94.6% frozen**
on a cut that a viewer sees moving continuously.

The temptation was to write that off as a resolution artefact and move on. That
would have been wrong, and it was checked rather than assumed: re-measuring
twelve reference reels at 270x480 put the corpus median at **16.3% still
frames**, our protocol cut at 35.8% and our previous explainer at 41.6%. The
reel really was too static — the first measurement was directionally right even
though its number was unusable.

Acting on it took v5 from 60.3% still to **11.4%**, past the corpus median. None
of that is visible in the 160px number, which moved 98.2% -> 94.6% across the
same five versions.

**Invariant.** A frozen-frame number is only meaningful against references
measured the same way. Before dismissing OR acting on one, re-measure a dozen
corpus reels at the resolution you are using and compare medians. Never compare
a number measured at one scale against a median measured at another.

**Check.** The corpus is on disk in `refs/corpus/*.mp4`. Decode at 270x480,
count frames where fewer than 0.25% of pixels change, and take the median. Ours
is a fair comparison only when both sides go through the identical pipeline.

**And the fix that worked is worth naming.** These beats compare pictures that
differ in one region, so a *seamless* wipe changes almost nothing on screen —
the comparison was happening subliminally. Turning the slider handle back on
took `one` from 37.6% still to 1.6% and `three` from 78.4% to 17.8%. That is not
motion added to move a metric; it is the device that makes the comparison
legible, which is why the number moved so far.

## V. Quote corpus numbers from the file, and read this document first

**Incident, twice over.** Three figures drove real design decisions and all three
were wrong. "Corpus headline band 46.3%" is ONE reference's value — the median is
71.4 and the range 20.9-100 — and two reels had their headline bursts shortened
to chase it, moving them *away* from the corpus. "Explainers run 243 wpm" came
from dividing Gemini transcripts by duration, and transcripts include on-screen
text; the real read is ~170. "Every reference has `notable_techniques`" was used
three times as evidence our reels were unremarkable; it is empty for all 21.

**Worse, a cross-session analysis repeated a mistake this file already covers.**
`ratio-v5` was called "the most static of the three, a slideshow" on a 94.6%
frozen reading — the exact number rule U documents as unusable for that cut. At
270x480 it measures **9.5% still against a corpus median of 12.2%**: the least
static of the three, better than the corpus. The reel actually outside the
corpus range was `changed-v2` at 36.2%. **Read this document before analysing a
render, not after.**

**Invariant.** Any corpus figure comes from `refs/corpus-stats.json`, generated
by `refs/corpus-stats.py`, which records the spread beside the median and marks
an axis `"target": false` when the references disagree. Four of nine do —
`cuts_per_min`, `median_shot_s`, `arrivals_per_min` and `headline_band_pct` —
and every number that was being chased is one of them. An axis with no consensus
is a stylistic choice, not a spec.

**Check.** `python refs/corpus-stats.py --show`. If a number is not in that
table with an `n` beside it, do not quote it.

## W. Declare what each beat does, then measure whether it did it

`shots.json` per reel: for every beat, its `composition` and whether it `moving`
or `static`. `gen/shots.py --emit` rejects a plan where two consecutive beats
share a composition (`ratio-v5` used one layout for all nine of its scenes) or
where too little of the runtime is declared moving. `--verify` measures the
RENDER and fails a beat declared moving that is not — it caught `changed`'s hook
at 14%, where one decisive wipe occupied 46 frames of a 163-frame beat and the
rest was a held still.

A declaration on its own is a promise; the verify pass is what makes it a claim.
And it names a specific beat rather than scoring the reel, which is the
difference between this and the gameable version rule P describes.

It measures at **270x480**, not the 160x284 `measure-format.py` uses, for the
reason rule U gives.

## X. A broken frame ships at a transition, every time

**Incident, three times.** `mirror2` f760 crashed and was caught only because a
sweep of stills happened to include it. `changed` carried a black letterbox in
every beat, baked in by a bug in its own reframe, caught only when someone
looked. `ratio-v5` f1518 is a plate mid-slide — a third of the frame empty, the
face pushed off the bottom, the caption across her eyes — and it is still in the
shipped file.

All three are one shape: a large, uniform, unexplained band at a frame edge. All
three sit at a transition boundary, which is precisely where nobody renders a
still.

**Check.** `python gen/check-frames.py out/<render>.mp4`. It compares each
frame's largest flat edge-band against the reel's own median, so a deliberate
letterbox does not fire on every frame and a one-off artefact does. On its first
run it found the frame that had been spotted by eye, two more in the same reel
that had not, and four blank sage frames in `changed` at a section boundary
after hours of iteration on that reel.

## Y. Shot size is declared per beat and measured from the render

**The gap this closes.** The asset registry (rule R) normalises an asset's OWN
frame — head at 60% of a 1440x1920 plate — which is what stopped the same head
appearing at 82%, 67% and 50% across three generation runs. It says nothing
about how big the face ends up ON SCREEN, because the composition then applies
its own `zoom` and `focus`. Those are different problems and only the first was
solved: the cut that passed every other check still measured a face height of
0.454 with 1.35x of travel.

**The bands are derived, never typed.** `refs/shot-bands.py` pools the per-frame
face-height distribution of the 21-reel corpus plus the two supplied framing
references — 1268 frames with a detected face, measured at 270x480 — and splits
it at its own terciles:

    wide    0.115-0.240   (median 0.175)   31% of corpus frames
    medium  0.240-0.310   (median 0.277)   33%
    close   0.310-0.453   (median 0.338)   32%

A single global target would be rule V all over again: per-reel medians run 0.121
to 0.412 because the references are not all shooting the same shot. The bands are
the sizes they actually shoot.

**Travel is the load-bearing number.** Corpus within-reel variation is 2.1x
(p90/p10 of face height), range 1.0-4.16, and only a handful sit below 1.35x.
The floor is set at 1.8x — below the median, so it is a floor and not a target.

**Check.** `python gen/shots.py <shots.json> --verify <render>`. Every beat
declares `shot`, and the render is measured against the band. On first run it
failed all nine beats of `changed-v2` and the travel floor.

**And it can only fail a beat, not fix one.** The references get their range by
cutting to compositions that are not portraits at all — index cards with
thumbnail faces, real-world photographs, phone insets — not by resizing the same
portrait. Full-bleed `object-fit: cover` cannot go below its cover scale without
revealing background, so a genuinely wide beat has to composite the portrait as
a sized element on the stage. That is a re-cut, not a parameter change.

---

## Z. A picture offered as evidence is computed over the same pixels as the number beside it

**Incident.** `RefinaFlip`'s proof beat shows a difference map of a face against
its own mirror, with three measured figures printed under it. The map was drawn
over the whole frame; the figures were computed over `align_core.face_mask` —
facial skin only. Hair is the highest-contrast edge in a portrait and does not
land on its own mirror, so the map lit the hairline far brighter than anything
on the face. The beat therefore showed a bright band around her hair while
asserting numbers that described her skin, and nothing in the frame told the
viewer those were two different regions.

Neither half was wrong on its own. Nobody would have caught it from the code,
and no check in the repo looks at both at once — it was visible the moment the
still was put on a contact sheet and looked at.

**Invariant.** When a beat prints a figure beside a picture, the picture is
rendered over the same pixel set the figure was computed from. If the two
cannot be made identical, the label says which is which. A number attached to
an image the viewer reads as its source is a claim about that image (rule E),
whatever the code intended.

**Check.** None automatic — this is a phone-sheet finding. `gen/asym.py`'s
`diff_map` now takes the same mask `measure()` uses, so for this reel the two
cannot diverge without someone passing a different one.

---

## AA. Two pictures are a comparison only if they share a crop

**Incident.** `RefinaFlip`'s claim beat is two full-width bands: "WHAT THE
MIRROR SHOWS YOU" over "WHAT THE CAMERA SHOWS EVERYONE". Each band windowed the
underlying composite at its own vertical offset, so the top band showed her brow
and the top of her eyes and the bottom band showed her mouth and chin — two
different parts of one face, captioned as though they were the same face seen
two ways. The beat's entire content is the comparison, and there was no
comparison in it.

This is rule A's argument at the level of a layout rather than an asset: the
offsets were typed per band, and two typed numbers that were never meant to
differ silently did.

**Invariant.** Any beat that places two pictures for comparison derives both
from ONE framing declaration. The bands share a single window offset and differ
only in the transform under test; the triptych's three panels share one
`objectPosition` for the same reason. Where the two must differ, the difference
is the thing being taught and gets a written exemption — as
`demo1-closeup`'s `framing_exempt` does.

**Check.** `check-assets.py` already enforces this between the two halves of a
registered PAIR. Inside one beat's layout it is unchecked; when a beat shows two
pictures, the framing is the first thing to look at on the phone sheet.

---

## BB. A full-bleed layer in motion scores as a CUT, not as motion — and a dissolve scores as nothing

**Incident.** `RefinaFlip` chased `shots.py --verify`'s moving-frame share through
five renders, and two of its beats moved the number the wrong way when the
gesture was made bigger.

`nuance` slid two full-frame chimeras off the sides of the frame. Staging them
so each left on its own — a larger, faster, more obvious move — took it from 15%
"moving" to **7%**. `measure()` counts a frame as moving when 2–35% of its tiles
changed; above 35% it is a CUT. A picture that fills the frame cannot move
without changing nearly every tile, so the largest gesture available scores
near zero.

`claim` and `rehearse` cross-faded a face into its own mirror and measured 5%
and 4%. Two near-identical images blended over ~40 frames move each pixel a
couple of units per frame, and almost no tile crosses the detector's 3.0
threshold. Rebuilt as a hard edge sweeping across the same two pictures, the
same beats measured **69%** and **97%**.

Rate matters as much as extent: `nuance`'s seams at ~2px/frame covered 80% of
the beat and registered 24%, because a slow edge does not shift a tile's mean
past threshold however many frames it covers.

**Invariant.** Motion that is meant to register is a BOUNDED region moving at a
visible rate — a seam, a panel, a card. Not a whole-frame transform, and not an
opacity blend between two similar pictures. This is not only a measurement
artefact: a haze between two images that already look alike does not read on a
phone either, which is why the rebuilt beats are better as well as higher-scoring.

**The trap.** Because bigger reads as worse here, the reflex is to conclude the
tool is blind and wave the beat through. It is blind at both ends, and it was
still right about all four beats: they did not read. Check the phone sheet
before deciding the measurement is wrong (rule C cuts both ways).

**Check.** `gen/shots.py --verify`, per beat, against the render.

---

## CC. A slower turn is not a better turn: a rotated plane is a line

**Incident.** `RefinaFlip`'s hook turns a photograph over to land on its own
mirror. Made continuous — 720° eased across the whole beat — it measured as the
reel's healthiest beat and PASSED the motion check. The phone sheet showed an
all-but-empty frame: at ~1.9°/frame the card sat within a few degrees of 90°,
where a plane projects to a line, for about ten frames, four times over.

**Invariant.** A 3D flip crosses an invisible state by construction. It is
fast through the crossing and held either side, and it is declared `static` if
that is what the holds make it. Do not spread a turn out to satisfy a motion
target.

**Check.** None automatic — the motion check actively rewarded the broken
version. `gen/phone-sheet.py`, and eyes.

---

## FF. A faster gesture scores LOWER: motion share counts frames, not speed

**Incident.** `RefinaFlip`'s `nuance` beat measured 24% moving against a 30%
floor, so its seams were sped up. The next render measured **19%** — the edit
moved it further from the floor it was meant to clear. The same edit made the
picture worse: at the beat's own sample frame the recede had already finished,
so v5 showed two chimera halves split mid-face and v6 showed a nearly normal
face with two thin lines near the edges. The Gemini pass, which had no access
to either number, listed that scene's devices as `text overlays` and did not
see the recede at all. Three readers, one verdict.

**Why it is structural, not a tuning miss.** `shots.py --verify` scores the
FRACTION OF FRAMES in which the picture changes. Per-frame speed only has to
clear the detector's threshold; past that, more speed buys nothing and the
shortened window costs share one frame at a time. `nuance` travels over
`[L*0.08, L*0.52]` — 44% of the beat, so 56% is held still *by construction*
before easing is considered — and `Easing.inOut(cubic)` parks velocity at zero
at both ends, leaving ~22-26% of the beat carrying real speed. Measured: 19%.
No speed setting passes a 30% floor out of a 44% window.

**Invariant.** To raise a beat's motion share, LENGTHEN the travel and FLATTEN
the easing. Never accelerate the gesture. `inOut` is actively wrong for this
metric — it spends the beat's motion budget on the two moments that score
worst. And if the gesture finishes early, the tail is dead air that no easing
curve can fill: give the beat a second gesture instead of a faster first one.

**The arithmetic is the check, and it is free.** The travel window as a
fraction of the beat is an UPPER BOUND on the score before easing takes its
cut. Compute it before rendering — an 8-minute render is a slow way to learn
that 44% cannot reach 30% after `inOut`.

**Check.** `gen/shots.py --verify`. The upper bound above, by hand, first.

---

## GG. A skill that is not on the skill path was never loaded

**Incident.** The `refina-reel` skill and its eight sub-references were written
to hold the pipeline: script, voiceover, assets, build, compositions, sound,
render, review. They were never activated. Across all 16 sessions in this
account the `Skill` tool was invoked six times, every one of them `watch` or
`artifact-design` — **`refina-reel`: never**. In the session that built
`RefinaFlip`, not one of the eight `REFERENCE.md` files was opened by any tool.

**Why it was impossible, not merely forgotten.** Skills load from the *current
working directory's* `.claude/skills`, from `~/.claude/skills`, or from an
installed plugin. This skill lived at `remotion-video/.claude/skills/`, every
session ran with cwd `C:\Users\rahul`, and `~/.claude/skills` did not exist. So
it was never in the skill list and could not have been called. What did reach
context was `SKILL.md` read with `cat`, because a memory note said to invoke
the skill — a router pulled in by accident of a note, with none of its routes
followed.

**The cost is specific and it is in this repo.** `reel-review` holds rule P;
never opened, and rule P was never run on `RefinaFlip` through five renders.
`reel-build` holds occupancy; never opened, and the `everyone` beat shipped a
2.2s hole. `reel-compositions` is 14KB of beat library; never opened, and the
reel was built from nine brand-new bespoke compositions reusing nothing.

**Invariant.** Living in the repo does not put a skill on the skill path. Either
it is linked into `~/.claude/skills`, installed as a plugin, or every session
starts in the repo directory. And a router is only followed if something makes
it followed — an index that is read while its chapters are skipped is worse
than one long file, because it reads as coverage.

**Check.** `gen/check-skills.py`, run as the first preflight stage.

---

## HH. A fixed anatomical box cannot show that something moved

**Incident.** `RefinaLips` beat 4 brackets the philtrum — nose base to lip edge
— on a before and its after, and its whole claim is that the gap shortens. The
obvious way to draw it was `anchor(id, "lips")` and `anchor(id, "nose")`, which
is how every other callout in the repo is placed. But `REGIONS` boxes are FIXED
fractions of face height, and a before and its after have near-identical face
geometry, so those are the SAME BOX on both. The two brackets would have come
out identical, on the one beat whose entire point is that they differ.

This would not have failed a check. Every mark would have been correctly derived
from the record, `check-assets.py` would have passed, and the beat would have
been drawn from measured geometry — of the wrong quantity. It is worse than an
unplaced mark: the reel would have shown two equal brackets under a caption
saying they are not equal.

**Invariant.** `anchor()` says where a REGION is. It does not say where a
FEATURE is, and it cannot say that a feature moved. Any beat whose claim is that
something changed position measures that landmark per asset and emits it
(`gen/emit-lips.py` -> `LANDMARKS`), the same way `gen/asym.py` emits a solved
midline. Reach for `anchor()` for "point at the mouth"; never for "the mouth is
higher than it was".

**Check.** None automatic — it needs someone to ask what a mark is derived from.
The cheap version is to print the two values: two landmarks that are equal to
four decimal places on a pair that visibly differs is the signature.

---

## II. A region box that no reel has targeted has never been tested

**Incident.** `align_core.REGIONS` was rebuilt on 2026-08-26 specifically to make
its boxes disjoint in y, because overlapping `eyes` and `nose` meant an under-eye
change scored as a nose change. The rebuild fixed the two boxes that a reel had
used. `jaw` — x -0.50..0.50, y 0.72..1.02 — still contained the whole mouth, so
a lip change had always scored as a JAW change. Nobody saw it because no reel had
ever targeted the mouth.

It was not harmless. Carving `lips` out moved `ratio1-chin`'s jaw from 35.3 to
44.0 and its concentration from 2.16 to 2.36: the mouth region had been diluting
the very number "Same Nose" prints on screen as its evidence.

**Invariant.** Adding a region is not additive. A new box that overlaps an
existing one changes that one's meaning, so the labelled renders the thresholds
were calibrated against get re-scored, and the delta is attributed to the carve
rather than assumed to be noise. `EXCLUDES` carves rather than moving an edge
where the anatomy genuinely wraps — the mandible really does surround the mouth
on three sides.

**Check.** Re-run the scorer over the hand-labelled pairs before and after any
`REGIONS` edit and diff the numbers. A refactor that is meant to be behaviour-
preserving for the other regions should show them identical to the decimal —
`eyes` and `nose` did, which is what proved the jaw delta was the carve.

---

## JJ. A tool fixed for one reel is not fixed for the repo

**Incident.** Rule Z was written after `RefinaFlip`'s proof beat drew a
difference map over the whole frame while printing figures computed over facial
skin only. The fix went into `gen/asym.py`, which is the tool that reel uses.
`gen/diffmap.py` — the tool the GENERATED pairs use, for `RefinaRatio` and now
`RefinaLips` — was never touched, and still drew unmasked. The next reel to put
a map beside a number would have reproduced the original defect exactly, with
the rule already written down and the incident already in this file.

**Invariant.** When an invariant is recorded against a tool, find every tool in
the repo that does that job and fix all of them, or say in the entry which ones
are still unfixed and why. Rule Z's own **Check** line said "`gen/asym.py`'s
`diff_map` now takes the same mask" — true, and it read as though the class of
defect had been closed.

**Check.** `gen/diffmap.py` now masks by default. The general version is a grep
for the sibling tool at the time the rule is written, which is cheaper than
rediscovering it two reels later.

---

## KK. A wipe between two near-identical pictures moves only where they differ

**Incident.** `RefinaLips` is a before/after reel whose pair differs, by design and
by measurement, almost nowhere except the mouth: lips 51.7 against nose 9.7 and
jaw 8.3. Its beats reveal the after with a hard edge travelling across the
picture, which invariant BB says is the device that reads as motion.

It measured 18%. The hook's seam is in flight for 52% of its frames, but on all
the frames where it is out on a cheek or a forehead the pixels either side of it
are identical, so nothing changes and the frame scores as frozen. `gap` and
`chin`, whose seam travels for 28 frames and then rests at centre, measured 5%.

Invariant BB says a dissolve between near-identical pictures crosses no
threshold. The wipe has the same problem for the same reason — the device is not
what failed, the CONTENT under it is. And the better the localisation of the
edit, the worse the wipe scores: a reel that succeeds at proving the change is
confined to one region has, by construction, two pictures that are identical
everywhere else.

**Invariant.** Motion from a wipe is proportional to the area where the two
layers disagree, not to the distance the seam travels. Where the layers differ
in one small region, the seam has to cross THAT region repeatedly, or the beat's
motion has to come from something else — a large element actually moving, or a
second layer that differs everywhere. `proof` wipes a photograph against a
false-colour map, which differ over the whole face, and passes on length alone.

**Check.** `gen/shots.py --verify`, per beat. The tell is a beat whose seam is
demonstrably in flight for most of its length and which still scores near zero.
Do not answer it by slowing the seam down (rule FF) or adding a creep (rule P) —
and do not answer it by declaring the beat `moving` harder. `gap` and `chin` are
declared STATIC here, because once their seam rests at centre they honestly are
a still split face with two brackets on it.

---

## LL. A metric that cannot see the defect will always say the mix is fine

**Incident.** Every music bed in this repo was levelled with
`silencedetect=noise=-32dB`, and every one passed: 92.8%, 93.0%, 100% speech.
Rahul played `lips-v1` and could not hear what the reel was saying over the
music. Measured against the read rather than against silence, the bed sat 11.8dB
under the voice and was **louder than the voice on 13.2% of speech windows**.
`bed-ratio`, in the shipped `ratio-v5`, is worse: 8.1dB and 20.3%.

`silencedetect` asks one question — "is the mix ever quiet?" — so **a louder bed
scores better on it**. The recipe then applied `dynaudnorm` to flatten the bed
*specifically so it would never dip*, which is what kept the number high. A bed
held at constant level under a voice that swings 30dB between stressed and
unstressed syllables buries every soft word ending. The measurement did not just
fail to catch the defect; it actively rewarded it.

This is rule P wearing a disguise. Rule P is usually recognisable because
somebody adds a creep to move a frozen number. Here nobody cheated: the tool was
the wrong instrument, everyone believed it, and it was quoted in CLAUDE.md as
evidence three times.

**Invariant.** A number is evidence only for the thing it measures. Before
quoting one as proof a defect is absent, state what the metric would do IF the
defect were present — and if the answer is "go up", or "not change", it is not
evidence. Masking is a ratio between two signals; no measurement of one signal
can detect it.

**Check.** `gen/check-audio.py`, a PREFLIGHT stage: short-window voice-over-bed
ratio in the windows where the voice is actually speaking. It fails under 15dB
median, over 2% inverted windows, or over 10% under 6dB of headroom. It fails
all three beds this repo had built when it was written, which is the point --
a check that passed everything already shipped would not have been worth adding.


---

## MM. A per-beat sampler must round its START up, or it measures the beat before

**Incident.** `gen/shots.py --verify` failed `RefinaNose`'s `test` beat: "declares
wide but its face measures 0.369, outside 0.115-0.24". That beat is three
instruction cards and contains no face at all.

`face_heights` samples every 5th frame and indexed the beat as
`range(a // every, z // every)`. For a beat starting at frame 922 that is index
184 — source frame **920**, which belongs to the previous beat. `resolve` is a
full-frame portrait, so exactly one borrowed frame carried a face, and a median
over a single-element list reported it as the beat's shot size. The beat was
failed for being framed as a close-up on a face it does not have.

The same floor silently misattributed up to `every - 1` frames of every beat to
the one after it. It only ever changes a verdict where the two beats differ in
what they show — which is precisely a scene boundary, i.e. the one place a shot
measurement is being asked a real question. `cta` was reporting a face too.

**Invariant.** A window that samples every Nth frame starts at `ceil(a / N)`,
not `a // N`. More generally: any per-beat measurement is wrong at its edges
first, and a beat boundary is where the content changes most, so an off-by-one
there is not a rounding detail — it is a measurement of the wrong scene.

**Check.** Fixed in `face_heights`. The tell was that a beat with no portrait in
it reported a face size at all: if a measurement returns a value for something
that cannot have one, do not adjust the declaration to match it.

---

## NN. Identical framing across consecutive beats reads as one long take

**Incident.** `RefinaNose` v1 ran four of its five portrait beats at the same
`fit`, deliberately reusing one travelling-seam device — device recurrence being
the documented fix for `ours-changed-v2`'s "17 devices, none used twice". The
Gemini pass then described beats 1 through 5 as **one 37-second scene**:
"full-bleed portrait with split-screen slider". Measured cuts: 1. Median shot:
26.17s.

That is `flip-v6`'s rejection — "long and thin" — arriving by a different route.
Recurrence had stopped reading as a signature and started reading as a single
unbroken take.

Giving each portrait beat its own framing, motivated by what the beat says —
`claim` pushes in because it is the beat that names the chin, `proof` pulls back
to make room for its readout, `mechanism` sits at medium because its line is
about the whole face — took the same reel to **6 scenes, 3 cuts, median shot
8.8s, 9 devices**, with no change to the script, the assets or the devices.

**Invariant.** A recurring device needs varying framing, or the recurrence
becomes monotony. Repeat the DEVICE and vary the SHOT; repeating both is one
scene however many beats the plan declares.

**Note on reading the evidence.** Gemini's scene COUNT is unstable — the same
reel came back as 6 scenes on one run and 4 on the next, once contradicting
itself between its own table and its summary in a single report. The direction
was reliable and reproducible; the integer was not. Use it as a signal that
beats are merging, never as a metric to hit.

**Check.** None automatic. `shots.py` already forbids two consecutive beats
sharing a `composition`; it does not look at `fit`, and a `fit` rule would be a
number to game rather than a cut decision. This is a rule-P finding: the fix is
a framing choice per beat, and the phone sheet is where the monotony is visible.

---

## OO. Matching the picture's background to the stage exposes the one edge it cannot hide

**Incident.** Every portrait beat in `RefinaFlip`, `RefinaLips` and the first
seven cuts of `RefinaNose` composites its picture at `fit` < 1, because the
subject's face at cover scale is larger than the corpus close band allows —
ratio1 lands at 0.535 against a band topping out at 0.453. That makes the
picture smaller than the frame, so it has edges, and the portrait's studio
backdrop (177, 197, 208) sits on a stage of (163, 181, 186): a ~20-level step
all the way round. Every face in the reel was a visible card on a field.

`gen/sage.py` has existed since the preview reel to fix exactly this and had
simply never been run on these assets. Running it removed the top and side
edges completely — and made the bottom one worse, because it was now the ONLY
seam in the frame: the subject's black turtleneck running to the picture's edge
and stopping in mid-air, with `promote.py`'s 167px of pad below it (rule T)
suddenly reading as stage.

**You cannot frame it out.** Centred, the shoulders only clear the frame bottom
at `fit` >= 1.21, which puts the face at 0.57 of frame height. Translating the
picture down far enough drops the chin into the caption band.

**Invariant.** A picture composited smaller than the frame has four edges. A
background repaint hides the ones the backdrop makes; it cannot hide the one the
SUBJECT makes. If the subject reaches an edge, the canvas has to grow rather
than the picture shrink — `gen/extend-pad.py` clamps the last flat content row
down, `gen/extend-frame.py` pads the canvas until the face is the wanted
fraction of a frame the picture now covers.

**And the payoff is larger than the edge.** Once the picture covers the frame,
framing is `zoom` + `focus`, which `anchors.ts` already models in `anchor()`,
`faceRow()` and `faceCol()` — so every ring, seam and band follows the camera
for free. The `fit` version needed a second transform outside the picture, kept
in step by hand, which is rule S: the same calculation done twice.

**The trap on the way there.** The first padding aimed for a 0.21 face so the
portrait could carry the reel's WIDE shot too. A head-and-shoulders crop has no
chest: the canvas needed 1340px of clamped turtleneck and the bottom third of
every frame became a flat black slab. That is rule Y's point arriving from the
other direction — *the references get their range by cutting to compositions
that are not portraits*. The masters are now padded only as far as MEDIUM and a
two-panel beat carries the wide end, because a panel CROPS the picture instead
of shrinking it.

**Check.** `gen/check-frames.py` finds the flat band, but it fires on the sage
margins of every reel in this repo, so it flags the treatment rather than the
defect. This one is a phone-sheet finding: at 390px a card edge round a face is
obvious and a code review of the same change shows nothing.

## PP. A label may name the operation, never a sitting that did not happen

`RefinaSize`'s `turn` beat shows a side view of its hero. The hero is a real
photograph; the side view is a RENDER, generated i2i off that frontal, so it is
a model's account of a face it has only ever seen from the front. The beat was
built with the tag `SAME SITTING`.

That is a claim about provenance, and it is false. No such photograph was ever
taken. It would have passed every check in the repo — `check-assets.py` verifies
that a label matches the RECORD, and the record said what the tag said — because
the record itself was wrong at ingest. The lie goes in upstream of the check.

**The rule.** When a picture did not come out of the camera, its label names the
OPERATION that produced it, exactly as `derived:flip` → SAME FILE, FLIPPED does
for the computed assets. `registry.py` gained two keys for this reel:

    photo:unmodified        PHOTOGRAPH, UNMODIFIED
    view:profile-generated  SIDE VIEW, GENERATED

The first exists because once ONE asset in a reel is a real photograph, the
viewer can no longer assume any of them are — so the camera's own pictures have
to say so too. This is rule E applied to the asset record rather than to a
figure: a printed number that has drifted from its pair is a false claim, and so
is a printed provenance.

**Check.** None, and there cannot be a mechanical one — the registry is the
authority a checker would consult. The guard is at INGEST: `--depicts` is a
claim about how the file was made, and the person typing it is the only one who
knows. The beat carries the compliance chip for the same reason.

## QQ. A seam is an edge between two pictures, or it is an artefact

`Reveal` draws its seam whenever progress is between 0.5 and 99.5. A sweep that
travels the full 0..100 therefore spends its turnarounds with the line sitting
on the very edge of the picture, where there is nothing on one side of it: at
390px that reads as a stray full-height rule down the side of the frame, not as
a comparison. `RefinaSize`'s `range-slider` sweeps **8..92** instead.

The same arithmetic bit the beat's other half. The bracket hands over from one
picture to the other as the seam crosses it, and the crossing point was computed
as `x / 1080`. `Pic` scales the picture about frame CENTRE while the bracket is
drawn outside it in frame coordinates, so at `fit` 0.72 the seam actually
reaches x=430 at 35.9%, not 39.8%, and the bracket reported the wrong picture
for 4% of every traverse. That is rule S at small scale: **a mark and the
picture it marks must go through the identical transform**, and any place the
two are computed separately is a place they will disagree.

**Check.** Neither is visible to `shots.py --verify` — both versions move. Both
came off a still. Render the beat and look at it.

## RR. A cache verified once is a second source of truth, and it will drift

`public/` is 191 MB and Remotion copies it before every render, so each big reel
gets a `public-<name>/` holding only the files it reads. `public-size/` was
built, verified byte-identical to a full-`public/` still by md5, and used from
then on.

The voiceover was then regenerated twice, into `public/`. Nothing copied it
across. **Two finished renders shipped with the original voiceover** — and
because the pictures had been re-cut to the new cue table in between, the read
also ran ahead of them by seconds. The defect survived a full `gen/check.py` run
twice, because every audio check in this repo reads `public/` and the reel does
not: it plays whatever the renderer was pointed at.

That is the general shape. A derived copy that is validated at creation and then
diverges silently is worse than no copy, because the one-time verification is
what buys the confidence to stop looking.

**Check.** `gen/check-publicdir.py` (preflight) md5s every file in a `public-*/`
against `public/` and fails on a difference — the CAUSE.
`gen/check-render-audio.py` (postflight) pulls the audio track out of the render
itself and runs the per-cue recogniser check against `words-vo.ts` — the
SYMPTOM, and invariant I applied to sound: v5 measured 12f max drift, v4 with
the stale audio measured 68f with 94 words out of tolerance.

## SS. A check that cannot fail is worse than no check

`gen/check-render-audio.py` was written to catch rule RR and, on its first run,
passed. It also passed a render that was known to be broken. The bug was one
line: `tts_deepgram.verify()` returns a REPORT DICT, and `ok = verify(...)` is
truthy for every possible report, including a catastrophic one.

A check like that is not neutral. It occupies the slot where a real check would
go, and its passing is read as evidence.

**Check.** Run a new check against an artefact you already know is broken,
before you trust it on one you do not. Here that was `out/refina-size-v4.mp4`,
still on disk — 68f max drift against v5's 12f. If there is no known-bad
artefact, break one on purpose.
