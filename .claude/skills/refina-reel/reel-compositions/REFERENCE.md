---
name: reel-compositions
description: The existing Refina compositions and the invariants locked into each. Load before editing any reel that already exists.
---

# The existing compositions

These are the reels already in `src/refina/`, and the rules each one has earned.
`RefinaProtocolReel` and `RefinaPreviewReel` are SIGNED-OFF cuts — do not change
them to satisfy a new check; `gen/check-assets.py` deliberately downgrades
claims on their unregistered assets to warnings for exactly this reason.

# Refina reels

Nine compositions in one Remotion project (1080x1920 @30fps), registered in
`src/Root.tsx`. `CLAUDE.md` is the contract — read it first. This skill covers
the *workflows*, which are not obvious from the code.

## The one rule that breaks things

`src/refina/protocol/atoms.tsx` and `motion.tsx` are **shared libraries**.
`RefinaProtocolReel` (approved, `out/refina-protocol-v4.mp4`),
`RefinaPreviewReel` and `RefinaMirrorReel` all import them. Editing any of them
silently changes the approved cut. `src/refina/preview/*` is now shared too —
the mirror reel imports `plate`, `draw`, `swap` and `flood` from it unchanged,
and `RefinaFlip` imports `plate`, `draw` and `flood`'s `PhoneShell`.
**`src/refina/ratio/atoms.tsx` is shared as well**: `RefinaFlip` takes `Face`,
`Reveal`, `Mono`, `Tag`, `Sfx` and `Step` from it. That import is deliberate —
`ratio`'s `Face` is the only one in the repo that lays itself out explicitly
rather than via `object-fit`, which is what invariant S requires of any reel
that anchors a mark. Duplicating it would have re-introduced the bug.

To extend a shared component, **wrap it locally** instead. See
`MeasuredCallout` in `src/refina/preview/RefinaPreviewReel.tsx` — it computes a
safe leader length and calls the unmodified `Callout`.

Because `src/refina/` is untracked, `git diff` won't protect you. Hash before
and after:

```bash
md5sum src/refina/protocol/*.tsx > /tmp/before.md5
# ...work...
md5sum -c /tmp/before.md5
```

## Voiceover -> caption cues

Never hand-place caption frames. Derive them:

1. Join the VO parts (filenames with apostrophes break ffmpeg's Windows path
   handling — copy to `vo1.mp3` etc. first):
   `ffmpeg -i vo1.mp3 -i vo2.mp3 -i vo3.mp3 -filter_complex "[0:a][1:a][2:a]concat=n=3:v=0:a=1[a]" -map "[a]" out.mp3`
2. Detect phrase boundaries:
   `ffmpeg -i vo.mp3 -af "silencedetect=noise=-30dB:d=0.20" -f null -`
3. Split the script into caption-length phrases, distribute their words across
   the detected speech segments **proportionally to segment duration**, then
   snap each cue to the nearest segment start.
4. Set the composition's `TOTAL` to `round(duration * 30)` so frame count
   matches the audio exactly.

Sanity check: most cues should land within a few frames of a real segment
start. If they don't, the phrase split is wrong, not the maths.

`@remotion/captions` + Whisper would give true word-level timing — not yet
installed by choice.

## Portrait assets

**Assets are GENERATED as part of building the reel, not sourced beforehand.**
When a script arrives, the casting is already in it - read it out and generate,
do not go looking for an existing portrait that is nearly right.

### 1. Read the casting out of the script

Two questions, both answered by the script itself:

- **Which procedure?** Sometimes named outright ("rhinoplasty, facelift, eyelid
  surgery" in the preview reel). Sometimes implied by the action - the mirror
  reel's hero pulls her temple and lifts her cheek, which is a facelift and
  nothing else.
- **Who is she?** The subject has to visibly NEED that procedure, or the render
  has nothing to act on. This is the single thing that made procedure previews
  start working on 2026-08-26; see `gen/README.md`. A woman with a fine jaw
  cannot be given a legible facelift no matter how the prompt is worded.

Write both into `gen/subjects.toml` as a new `[[subjects]]` block. Casting and
prompts are data - never hand-type a prompt at the shell, or the render that
works cannot be reproduced.

### 2. Generate, screen, promote

```bash
python gen/subject.py --candidates                    # 'before' portraits, then LOOK
python gen/subject.py --run <dir> --pick <id>=<n>     # afters, 2K, screened
python gen/promote.py <run>/<id>/pair/<id>-<which>.png --as <name>
python gen/sage.py public/portraits/<name>.png --as sage-<name>
```

`subject.py` casts the subject, generates each after off the 2K before, strips
the Gemini watermark and aligns the set into one shared frame. `promote.py`
lands a chosen render on the reel's canonical frame (1218x1601, head top 76,
centre 617, head width 888) so it drops in beside the existing heroes.
`sage.py` repaints the studio backdrop to flat sage. That is the whole chain —
script to reel-ready asset, no hand steps.

The screen (`gen/score.py`) checks three things and agrees with human judgement
8/8 on the labelled set: **strength** (did the target region move enough to
read), **concentration** (more than the regions it should have left alone) and
**stillness** (the rest of the face did not re-render underneath). Passing is
not approval - it only means a render is not disqualified. Look at every
survivor, and trust a difference map over the numbers when they disagree.

Two things it cannot do yet. Rhinoplasty casting is unsolved: "beautiful"
appears to cancel "big nose", so the before comes back with an ordinary nose.
And a render with high **drift** has re-rendered the whole face, which makes two
procedures on one subject impossible to tell apart - that is what still blocks
`SwapScene`'s `afterAlt`.

### 3. What the two remaining steps do (now scripted, kept here because the maths matters):

1. **`align.py`** — normalises framing by head width and head-top row, then
   crops every image to the region they all cover. The image generator's
   framing drifts between runs; without this, switching between two renders
   moves the whole head. It also prints per-region difference numbers, which is
   how you tell whether a procedure render actually changed the right anatomy.
2. **Sage repaint** — portraits carry a studio backdrop that won't sit on flat
   sage. Don't key to alpha; solve the composite directly. For a pixel that is
   a mix of subject and backdrop with coverage `a`:

   ```
   out = P + (1 - a) * (SAGE - BG)
   ```

   One add, no division, and semi-transparent hair unmixes correctly instead of
   keeping a fringe. Result is `sage-*.png`, which composites at any size with
   no visible edge.

All five `sage-*` heroes share one frame: 1218x1601, head top y=77,
`headFrac` 0.0481. New renders must go through both steps - `promote.py` does
the framing, `sage.py` the repaint.

`sage.py`'s coverage estimate is deliberately conservative: a pixel counts as
backdrop only if it is BOTH near the measured backdrop colour AND spatially
connected to the frame border. Grey hair is close to this backdrop in colour, so
without the connectivity test a silver-haired subject gets repainted from the
inside out.

(The measured set actually sits at head top 76 / head width 888; the 900 above
is the pre-crop target. `align_core.REEL_FRAME` carries the measured values,
because a new asset has to match the SET, not the note.)

## Two checks that are cheaper than a render

Both were written after "Same Nose" shipped defects into its first stills that a
type-check could not see and a still could only show one beat at a time.

```bash
python docs/preview-review/check-crops.py     # what each beat's crop shows
python gen/emit-measured.py <results.json> --subject X --after Y --ts <file>
```

`check-crops.py` replicates `Face`'s layout and prints, per beat, the source
rows visible and where the nose/jaw land in frame. It catches two things:
`promote.py`'s bottom pad drifting into shot (invariant T), and anatomy the beat
talks about sitting outside the frame — the nose-and-chin beat first shipped
with the chin below the bottom edge, so its CHIN bracket had no lower end.

`emit-measured.py` turns `gen/score.py`'s output into a TypeScript table, so a
reel that prints a measurement on screen reads it from the scorer rather than
from a number somebody typed. It refuses to publish a pair that failed the
localisation screen.

**And the geometry trap they exist around:** deriving a mark and drawing the
picture must be ONE calculation. `anchor()` and a CSS `object-fit` + `scale`
composite are not the same maths, and the marks were out by up to 240px while
both halves looked correct. Invariant S has the details.

## Judging a rendered cut

```bash
python docs/preview-review/motion.py out/<file>.mp4 docs/preview-review/beats-preview.json
```

Two numbers per beat. **Read them against the baseline, never against zero** —
the approved protocol cut measures 75.7% frozen.

- `motion` **under-reports small elements.** A dotted callout or a slider inside
  a phone barely moves a 240px frame's average, so a beat can read "100% frozen"
  while something is visibly animating. Never delete animation on this alone.
- `content` is the trustworthy signal. Under ~10 means genuinely blank sage —
  unless it's a deliberately text-only beat (disclaimer, CTA).

It also flags beat starts with no hard cut. An empty beat cutting to another
empty beat is an invisible boundary.

**Camera moves must clear ~0.3px/frame at the frame edge or x264 discards them.**
`amount ~= beatFrames / 1500` is the floor. A 5% push over 200 frames is
invisible — this has been shipped by mistake twice now.

## Which animation to use when

The motion language is **measured**, not invented — see
`docs/qoves-motion-reference.md` for the full table and how it was derived.
Short version:

| Situation | Device | Spec |
|---|---|---|
| New beat, new layout | vertical push | 25f, easeInOut cubic |
| New subject, same layout | horizontal push | 25f, out one side / in the other |
| Same subject, new state | in-place morph | ~29f crossfade |
| Small element arriving | scale / reveal | 7-14f, easeOut cubic |
| Something leaving | departure | easeIn cubic — accelerates away |
| Climax / overload | rapid montage | 2 frames per image |
| Ending | wipe to outro card | 13f, left-to-right |
| Genuine emphasis | hard cut | the reference spends **one** in 52s |

Three rules that are easy to get wrong:

1. **easeInOut cubic**, not ease-out, for anything travelling between beats.
   Accelerating *and* decelerating is most of what "smooth" means here.
2. **Transitions are plate-level.** The imagery slides; the headline and caption
   tracks stay put. Never slide the whole frame.
3. **Text blurs out as well as in.** An outgoing headline blurs while its plate
   travels.

Do not use `TransitionSeries` from `@remotion/transitions`: it overlaps
sequences by shortening the total, which drifts the reel out of sync with the
voiceover cumulatively. Overlap the plates inside the existing absolute
`<Sequence>` boundaries instead.

## Before calling anything done

Render stills and *look* at them:

```bash
npx remotion still RefinaPreviewReel out/check.png --frame=985
```

A contact sheet of one frame per beat catches more than watching the video does.
Bugs found this way that no type-check would catch: callout labels running off
frame, a checklist overlapping the caption band, and `VerdictTag` printing a
double ✗ because its own glyph was repeated in the `text` prop.

## Commands

```bash
npm run dev                                                   # studio
npx tsc --noEmit && npx eslint src                            # must pass
npx remotion render RefinaPreviewReel out/x.mp4 --codec h264
```

Keep `remotion.config.ts` on PNG frames + CRF 18. All `@remotion/*` packages
must sit on exactly the same version or Remotion refuses to start.

## Script-to-frames, the generated path

`RefinaMirrorReel` is the first reel where **no frame number is written by
hand**. It is the shape the rest should move to.

```
docs/preview-review/voscript.py            reusable core: measure / estimate / emit
docs/preview-review/gen-words-mirror.py    THE SCRIPT, as text + per-phrase pauses
        -> src/refina/mirror/words.ts      cues, per-word frames, BEATS, HEADLINES, TOTAL
```

The composition addresses beats by NAME (`BEATS.held[0]`), and even the opening
footage's retime anchors are `(beat, source frame)` pairs — so re-running the
generator moves the pictures with the words. Two modes behind one interface:

* **estimate** — no voiceover yet. Phrase length from a chars/second rate
  *measured off the same narrator's previous read*, plus each phrase's own
  declared pause. Never guess the rate; run `narrator_rate()` on a finished VO.
* **measure** — the real thing, once `public/voiceover5.mp3` exists.

Switching between them is one `os.path.exists`. Nothing downstream changes.

## Retiming real footage

`src/refina/mirror/mirror.tsx` retimes a 10s take so its actions land on the
lines that name them, and freezes it dead on "Held it there."

Do **not** use `playbackRate` for this. Remotion maps media time as
`startFrom + (frame - startFrom) * rate`, which cannot express a piecewise map
with a stop in it without off-by-one pain. Instead compute the source position
for every frame and hand it to `<Freeze frame={…}>` wrapping a plain
`<OffthreadVideo>`; the child then shows exactly `frame / fps` seconds. An
arbitrary time map, freezes included, becomes one `interpolate` over anchors.

Measure the gesture before writing anchors:

```bash
ffmpeg -i public/hero-clip.mp4 -vf "select='not(mod(n\,12))',scale=200:-1,tile=8x2" -frames:v 1 sheet.png
```

## When webpack dies during a render

```
node_modules/webpack/lib/util/hash/wasm-hash.js:151
TypeError: Cannot read properties of undefined (reading 'length')
```

That is a stale bundle cache, not your code — it reproduces on every retry and
survives a clean type-check. `rm -rf node_modules/.cache/webpack` and re-render.
