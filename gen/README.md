# Asset generation — `gen/flow.mjs`

Scripted image generation for the reels, so assets stop coming from manual
prompting + `~/Downloads`. Drives Google Flow (Nano Banana Pro) through a headed
Chrome session.

**THE BACKEND CHANGED ON 2026-09-09 AND BOTH gflow CLIs ARE GONE.** Everything
below about *how to cast, screen, frame and register* still stands — it is the
expensive part and none of it depended on gflow. Only the transport was
replaced. Read "The generator, 2026-09-09" before running anything.

## What this does and does not solve

`docs/preview-review/README.md` recorded why the 2026-08-10 procedure previews
failed: a full-frame model re-synthesised the whole portrait instead of editing
one region, so the rhinoplasty moved the eyes more than the nose. The conclusion
was **use a masking / inpaint workflow**.

**gflow does not give us masking or inpaint.** It is the same class of
full-frame model, reached programmatically. What it changes is the *cost of an
attempt*: images are free on Flow, and a full sweep of every procedure against
every prompt strategy is now one command plus one screen. That turns "ask the
model nicely and hope" into an experiment we can actually run and grade — which
is the only honest way to find out whether this model family can localise an
edit at all, or whether we need a real inpainting tool.

`region` is the strategy that tests the masking idea within gflow's limits: it
sends a tight crop of the target area as a second reference image. It is a
hypothesis, not a fix.

## The loop

```bash
python gen/generate.py --dry-run          # see the commands, generate nothing
python gen/generate.py                    # full sweep from procedures.toml
python gen/score.py public/portraits/alt-before.png --target nose gen/out/<run>/rhinoplasty__*/*.jpg
```

1. **`procedures.toml`** — the spec. Procedures (what must change, and which
   anatomical box must move), and strategies (how we ask). Add a strategy; do
   not hand-edit prompts at the shell, or the result is not reproducible.
2. **`generate.py`** — runs every `procedure x strategy` pair through
   `gflow image i2i`, writes to `gen/out/<timestamp>/` (gitignored) and records
   `manifest.json` with the exact prompt, refs and command per render.
3. **Upscale is automatic.** Flow's download menu offers 1K / 2K / 4K, and gflow
   saves only the 1K original unless asked. `upscale = "2k"` in the spec makes
   `generate.py` fetch the 2K variant of every render (`image upscale`, the same
   server call that menu entry makes) and park it beside its 1K sibling as
   `<id>_N_2k.jpg`. Measured: **896x1200 -> 1792x2400**, 130 KB -> ~510 KB, which
   puts a render above the 1122x1402 source instead of below it. `--clean` adds a
   `_clean` copy cropped past the watermark. 4K is Ultra-tier gated and 403s.
4. **`score.py`** — the screen. Aligns each render to the source on head width +
   head-top row, then measures mean per-pixel change inside the nose / eyes /
   jaw boxes. A render passes only if its **target region moved at least 1.5x
   more than the loudest region it was meant to leave alone**.
5. Winners get pixel-locked by `docs/preview-review/align.py` and moved into
   `public/portraits/`. Nothing in `gen/out/` is a deliverable.

`align_core.py` holds the alignment and region maths, factored out of
`docs/preview-review/align.py` so the scorer and the aligner cannot drift apart.

## The screen is a filter, not a verdict

It exists to throw out renders that **provably did not do the procedure**, before
anyone spends attention on them. Calibrated against the measured batch:

| render | target | nose | eyes | jaw | ratio | verdict |
|---|---|---|---|---|---|---|
| `hero-rhinoplasty` | nose | 8.49 | 9.63 | 5.15 | 0.88 | FAIL |
| `hero-facelift` | jaw | 8.86 | 9.23 | 9.27 | 1.00 | FAIL |
| `hero-eyelid` | eyes | 8.14 | 9.35 | 5.05 | 1.15 | FAIL |
| `hero-advisor` | any | 53.28 | 54.50 | 81.62 | — | PASS |

It agrees with the human review on all four. It still only says a render *is not
disqualified* — passing the ratio is not the same as looking right, and a render
that passes here can still be rejected on sight. Never tune a prompt to move this
number; tune it to make the picture right, then confirm the number followed.

`+texture` flags a render that invented more skin detail than the source (all
three rejects scored ~1.9x; the good one scored 1.00) — the documented failure
where the "after" ends up with worse skin than the "before".

## Setup

`playwright-core` is a devDependency (`npm i`), and it drives the **real Chrome**
already on the machine via `channel: 'chrome'` — Playwright's bundled Chromium is
rejected by Google's sign-in, so this is not optional. Nothing else to install.

The Google session lives in a Chrome user-data-dir at `.gflow/profiles/default`
(inherited from the retired npm CLI; the directory is just a Chrome profile and
outlived the package). If it ever stops being signed in, open that profile in a
plain Chrome and sign in to `flow.google.com` by hand:

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" \
    --user-data-dir="$PWD/.gflow/profiles/default" https://flow.google.com/
```

**Close that window before running `flow.mjs`** — Chrome refuses a second
instance on a locked profile, and `freeProfile()` only force-clears it, which
leaves the profile flagged as crashed.

Every generation bills against that Google account's Flow allowance — images are
free, **Veo video costs credits**. `1010` credits at last check.

## Beyond stills

Not wired up yet, but available in the same CLI:

- `gflow video t2v / i2v` — Veo clips. **Spends credits.**
- `gflow character create` — a reusable face/body entity, so the same person
  holds across generations. Relevant to keeping one hero consistent across a reel.
- `gflow movie run movie.toml` — multi-scene manifest, character-consistent.
  The closest thing in the tool to our script-to-video goal; worth a look when
  the still pipeline is proven.
- `gflow mcp run` — exposes the whole surface to Claude Code over MCP.

## Caveats

- **Alpha, unofficial, not affiliated with Google.** Automating Flow is against
  Google's ToS and the account carries the risk. For Refina as a shipping
  product, the sanctioned path for Imagen/Veo is the Gemini API or Vertex AI.
  This is the right tool for iterating fast; it is not the right tool to build a
  customer-facing feature on.
- **Flow's UI drifts.** gflow fails fast with distinct exit codes (23 = selector
  drift, 14 = wrong browser, 36 = Flow host migrated) rather than silently
  burning credits. `generate.py` records the exit code per item and continues.
- Pinned to `playwright>=1.61,<1.62` upstream — an untested minor has silently
  wedged generations before. Do not loosen it.

## The generator, 2026-09-09 — `gen/flow.mjs` replaced gflow

**Both gflow CLIs are uninstalled and the fork clone is deleted.** Google moved
this account's Flow off Labs onto its own origin between 2026-08-31 and
2026-09-04: `labs.google/fx/tools/flow/project/<id>` now redirects to
`flow.google.com/project/<id>`, a rewritten frontend containing **zero Material
Symbols `<i>` elements**. Forcing `GFLOW_CLI_FLOW_HOST=labs.google` produced
**zero requests to labs.google** — the redirect is server-side and per-account,
so no flag, retry or re-login reaches the old frontend. Upstream tracks it as
[#639](https://github.com/ffroliva/gflow-cli/issues/639); as of v0.69.0 it drives
text-to-video and image-to-video on the migrated host, and **image generation is
still not ported**.

`@swissmarley/gflow-cli` (npm) got much further, because its selectors are role-
and text-based rather than ligature-based — that is the transferable finding.
It still broke in five places and was also removed.

**What replaced them:** `gen/flow.mjs`, playwright-core driving the real Chrome,
plus `gen/flow-prompts.py` which renders prompts out of `subjects.toml`. No CLI,
no fork, no auth layer of its own.

```
python gen/flow-prompts.py --subject bleph2 --after blepharoplasty --out-dir gen/out/bleph2
node   gen/flow.mjs pair --before-file gen/out/bleph2/before.txt \
           --after-file gen/out/bleph2/after.txt --out gen/out/bleph2 --name bleph2
python gen/score.py gen/out/bleph2/bleph2-before-2k.jpeg --target eyes \
           gen/out/bleph2/bleph2-after-2k.jpeg
```

`promote.py` → `sage.py` → `registry.py --ingest` are unchanged. `subject.py`
now exits with this path printed rather than failing at the auth layer.

**Three things that are not obvious and cost a session:**

1. **Download the before at 2K BEFORE attaching it as an i2i ingredient.**
   "Add to prompt" moves that tile out of the media grid into the session panel,
   and only the grid copy has a working menu. Backwards, you get a 2K after and
   a 1K before — which is not a pair.
2. **A late render is not a failed render.** Flow is routinely slower than a
   15-minute poll. Run `node gen/flow.mjs list --project <url>` before spending
   credits on a regeneration; every apparent failure in testing had landed late.
3. **Chrome gets OOM-killed on this machine** (16 GB, ~3.5 GB free) after the
   download bytes arrive but before they are saved. `downloadsPath` plus a
   harvest fallback recovers the file instead of paying for the render twice.

The remaining browser-level gotchas are in the header of `gen/flow.mjs`.

**THE WATERMARK CROP IS NOT ENOUGH FOR AN i2i AFTER.** `strip_watermark()` crops
the bottom 6%. An after carries TWO sparkles — its parent's, re-rendered as image
content by the edit, plus a fresh one Flow stamps higher. Measured on a 1792x2400
`bleph2` after they span rows 2153-2305, **89.7%-96.0% of height**, while the 6%
crop starts at 94.0%. Crop ~11% for anything from `flow.mjs edit`/`pair`, and
look at the result.

**The Gemini API route is still the better long-term answer** and is unchanged:
`gemini-3-pro-image` is the same Nano Banana Pro model, both keys in
`~/.config/gemini/.env` resolve it, and it returns
`429 ... free_tier_requests, limit: 0` until billing is enabled on the project.
That is a billing switch, not a code problem, and it removes the browser stack
entirely.

## Measured: first run, 2026-08-25 (`gen/out/20260825-183951`)

Rhinoplasty against all three strategies, 2 variants each, on `alt-before.png`.
Model `nano-pro`. Free. The pipeline works end to end; the renders do not.

| strategy | nose | eyes | jaw | ratio | verdict |
|---|---|---|---|---|---|
| plain | 15.72 / 8.48 | 18.44 / 9.19 | 15.86 / 6.07 | 0.85 / 0.92 | FAIL |
| constrained | 9.21 / 7.98 | 9.64 / 8.89 | 6.03 / 5.46 | 0.96 / 0.90 | FAIL |
| region | 13.38 / 8.00 | 19.30 / 8.98 | 7.82 / 6.08 | 0.69 / 0.89 | FAIL |

**0 of 6 localised.** Every render moved the eyes more than the nose, the same
way the 2026-08-10 batch did (0.88). No strategy beat the naive baseline;
`constrained` — the one that spells out every feature to leave alone — landed at
0.96 and 0.90, i.e. nowhere. `region`, which sends a crop of the nose as a second
reference, came out **worst** at 0.69.

`region` did change something, just not anatomy: it changed the **framing**. The
model read the close crop as a composition hint and returned a tighter portrait.
The prompt has more influence over the camera than over the nose.

**~~Conclusion: prompt engineering does not fix localisation on this model
family.~~ THIS WAS WRONG — see "The casting fix" below (2026-08-26).** What the
six attempts actually showed is that *these* prompts did not work. All three
asked for a "subtle" change on a subject who needed nothing, and none of them
forbade the failure mode we had already measured. That is a bad experiment, not
a model limitation.

### Three things the screen could not see

Found by looking at the renders, which is why nothing ships on the numbers alone.

1. **Every render carries a visible Gemini watermark** — a four-point sparkle in
   the bottom-right, same offset each time (`gen/out/_watermark-check.png` shows
   all six). This affects *all* gflow output, not just procedure edits. Anything
   used in a reel must be cropped past it or covered. Check this on any new
   render before compositing.
2. **Framing drifts violently between generations.** `plain` returned a wider
   shot with more shoulder; `region` returned a much tighter one. Neither matches
   the source. `align.py` is not optional hygiene here, it is load-bearing.
3. **Output is 896x1200 JPEG (~130 KB)** — *smaller* than the 1122x1402 source
   and visibly softer (texture energy 0.66-0.89 vs source). The reel is 1080x1920.
   **Now fixed** — see step 3 above; `upscale = "2k"` is on by default.

## The 2K upscale, and the 401 that hid it (2026-08-26)

Flow's download menu has always offered a 2K option; gflow saves the 1K original
by default because that is the URL the generation response hands back. `gflow
image upscale <mediaId> --scale 2k` makes the same `upsampleImage` call the menu
entry does. The media UUID is just the render's filename minus gflow's `_N`
suffix, so anything already generated can be upscaled without regenerating.

Verified on `90a96801-…`: **1792x2400, 502 KB**, from an 896x1200 / 130 KB
original.

**The watermark survives the upscale**, scaled with everything else — measured at
47x47 px, 5.3% from the right edge and 4.0% from the bottom. `strip_watermark()`
crops the bottom 6%, which on these portraits is turtleneck. It writes a `_clean`
copy and never touches the master.

**The upscale does not touch localisation.** The cleaned 2K of the same failing
render still scores 12.84 / 14.45 / 10.82 — ratio 0.89, the identical failure at
twice the resolution. It also carries `+texture 2.00`: the upscaler invents skin
detail, the same ~1.9x seen on the original 2K batch. Sharper is not better here.

### Debugging note worth keeping

The first upscale attempt returned **401** while `gflow auth status` reported the
session verified. Both were true: `auth status` probes
`labs.google/fx/api/auth/session`, which kept answering AUTHENTICATED, while the
tRPC cookie surface (`project.createProject`) had gone stale — an ~18-hour-old
session. **`auth status` passing does not mean the session works.** If a call
401s, re-run `gflow auth login --browser chrome` before debugging anything else,
and remember the login completes when you **close the Chrome window** — it waits
on that, not on the sign-in.

## New subjects: `subject.py` (2026-08-26) — RETIRED, see `flow.mjs pair`

**`subject.py` no longer runs**; `node gen/flow.mjs pair` is the two-phase
equivalent and `gen/flow-prompts.py` renders its prompts from the same
`subjects.toml`. The section is kept because the SHAPE of the loop is unchanged
and the measured findings below are still the record.

`generate.py` edits one fixed portrait. `subject.py` made the person too:

    t2i (new woman) -> 2K -> i2i (procedure) -> 2K -> de-watermark -> align pair -> score

```bash
python gen/subject.py --name hero3 --describe "early 50s, South Asian"
python gen/subject.py --name hero4 --describe "late 40s, Black" --procedure facelift
```

`--describe` is the only thing you supply; the rest of the shot is pinned in
`BASE_PORTRAIT`. **The plain seamless backdrop in that prompt is load-bearing, not
styling** — `align_core.metrics()` finds the subject by sampling the frame corners
for a flat background, so a textured or graded backdrop silently breaks alignment,
scoring and the sage repaint. Do not make it more interesting.

With the default `--variants 2` it stops after the candidate portraits so you can
choose a face before spending the rest of the chain on it; resume with
`--run <dir> --pick N`.

### First run: `subject-hero3-20260826-184851`

Worked end to end. `--describe "early 50s, South Asian"`, procedure `advisor`.
Both images 1792x2400 at 2K, **1891x2369 after alignment**, watermark cropped,
identity unmistakably held, and the pair is frame-locked to each other (head
widths 853 vs 847 px before normalisation) so it can be cross-faded or wiped.

**But the change is weak.** Measured against its own before:

| pair | nose | eyes | jaw | texture |
|---|---|---|---|---|
| `hero3` (this run) | 18.11 | 20.55 | 13.18 | 0.97 |
| `hero-advisor` (the render the reel actually uses) | 53.28 | 54.50 | 81.62 | 1.00 |

Roughly **a third of the change** of the advisor render that was signed off as
"large, clearly legible". Texture 0.97 is good news — nothing invented, no skin
downgrade — but at reel speed this pair may not read as a change at all. The
pipeline is sound; the `advisor` wording in `PROCEDURES` needs pushing harder
before a pair from it goes in a cut.

## The casting fix — procedure edits DO work (2026-08-26)

Rahul's correction, and it is the important entry in this file. The before and
after are **one casting decision, not two prompts**:

1. **Cast the before to visibly NEED the procedure.** Every earlier attempt
   generated a woman with a fine nose and jaw and then asked to fix them. There
   was nothing to change, so nothing changed, and the measurement of that
   nothing got blamed on the model.
2. **Ask for it "strong", never "subtle".** Every prompt in the failed batch
   said subtle.
3. **Forbid the actual failure mode in words**: *"it is very important that it
   actually looks like the actual cosmetic procedure and not a filter or
   FaceTune."* We had measured global beautification-instead-of-regional-edit and
   then never told the model not to do it.
4. **Stop over-constraining.** One clause — "leave everything else exactly the
   same and unchanged" — beats an eleven-item do-not-touch list.

Spec lives in `subjects.toml`; run it with `subject.py`. Results from
`subjects-20260826-191551`, judged by eye off before/after/difference maps:

| subject | after | verdict |
|---|---|---|
| `bleph1` | blepharoplasty | **Works.** Change ringed tightly on the eyes, bags reduced, rest of face untouched. |
| `lift1` | facelift | **Works.** Change peaks along the mandible and submental band (y=1.20 head-widths). |
| `swap1` | facelift | Works, but weak — jawline tightens modestly. Under-eye bags correctly left alone. |
| `swap1` | blepharoplasty | **Works.** Bags clearly reduced, jowls correctly left alone. |

`swap1` is the `SwapScene` `afterAlt` asset: one face, one frame, two procedures
that are each honestly labellable because each after explicitly names what it
must NOT touch.

### The screen scored all four FAIL, and the screen was wrong — now rebuilt

`score.py` rejected every one of these. Three faults, in order of size:

1. **Hair and collar dominate.** The generator redraws flyaway hair and the
   turtleneck collar on every pass. Those are the highest-contrast edges in the
   frame, and a mean-over-box swamps the facial change with them. `swap1`'s
   blepharoplasty appeared to change the jaw at y=1.35 — that was the collar.
2. **The boxes overlap.** `nose` spans y 0.62-1.10 and `eyes` spans 0.44-0.82,
   so an under-eye bag change is counted as a *nose* change. That is why both
   blepharoplasties scored higher on nose than on eyes.
3. **Mean over a large box dilutes a concentrated change.** A facelift moves a
   thin band along the jawline; averaging it over the whole cheek washes it out.

A fourth fault surfaced during the rebuild: the boxes were anchored on
`metrics()`'s head-top, which is the top of the **hair**. `swap1` wears a
top-knot, so every one of her boxes sat 200px high — the eye box was on her brow.
Hair height is not a facial landmark.

## The rebuilt screen (2026-08-26)

Three axes, because "did the procedure happen" turned out to be three questions:

| axis | what it asks | how | threshold |
|---|---|---|---|
| **strength** | did the target region move enough to read at reel speed | p90 of change inside the box | >= 25 |
| **concentration** | did it move more than the regions it should have left alone | target p90 / loudest other | >= 1.20 |
| **stillness** | did the rest of the face quietly re-render underneath | median change over all facial skin | <= 15 |

Strength is a separate axis because the 2026-08-10 blepharoplasty was rejected as
*"marginal localisation, far too weak to read"* — it was localised and still
useless. Stillness is separate because a render can move the right region and
also regenerate everything else, which is what makes two procedures on one face
impossible to tell apart.

Mechanically, three things changed in `align_core.py`:

- **`face_mask()`** — skin found by YCbCr chroma (luma-independent, so a lit
  cheek and a shadowed jowl both count), bounded to the face box. Hair, collar
  and backdrop are excluded. This is the big one: the generator redraws flyaway
  hair and the turtleneck every pass, and those edges were dominating every mean.
- **`face_anchor()`** — boxes are now positioned from the **skin**, in face-height
  units, not from the top of the subject mask. See the top-knot note above.
- **p90, not mean** — a procedure moves a thin band inside a box that is mostly
  unchanged cheek; a mean washes it out.

### Validation

Calibrated and checked against eight labelled renders — the four judged by hand
on 2026-08-26 and the four from the 2026-08-10 review:

| render | strength | conc | drift | human | screen |
|---|---|---|---|---|---|
| `bleph1/blepharoplasty` | 34.3 | 1.27 | 9.0 | good | PASS |
| `lift1/facelift` | 29.0 | 1.55 | 6.0 | good | PASS |
| `swap1/facelift` | 30.3 | 1.42 | 5.3 | good | PASS |
| `swap1/blepharoplasty` | 79.0 | 0.67 | **19.7** | *disputed* | FAIL |
| `hero-rhinoplasty` | 18.0 | 0.90 | 6.0 | bad | FAIL (too weak) |
| `hero-facelift` | 22.7 | 1.26 | 6.7 | bad | FAIL (too weak) |
| `hero-eyelid` | 19.3 | 1.38 | 5.7 | bad | FAIL (too weak) |
| `hero-advisor` | 130.3 | — | 52.7 | good | PASS |

**8/8 consistent**, and it fails the three old renders for the reason the review
actually gave — weakness — rather than a coincidentally-right one.

`swap1/blepharoplasty` is the one worth knowing about. It reduces the under-eye
bags markedly and by eye looks clean, but its drift is 19.7 against its own
facelift's 5.3: the whole face re-rendered underneath. That is exactly the
failure that would break SwapScene, where two procedures on one face have to
differ *only* in the region each claims. The screen caught what looking did not.

## Script to reel-ready, end to end (2026-08-26)

```bash
python gen/subject.py --candidates                 # cast; then LOOK at the faces
python gen/subject.py --run <dir> --pick <id>=<n>  # afters, 2K, watermark off, screened
python gen/promote.py <run>/<id>/pair/<id>-<which>.png --as <name>   # reel frame
python gen/sage.py public/portraits/<name>.png --as sage-<name>      # flat sage
```

Verified on a generated render: 1218x1601, backdrop `[162,180,186]` against the
existing set's `[163,181,186]`. An already-framed portrait round-trips through
`promote.py` at 0.00 mean difference.

**`promote.py`** puts a render on the frame every shipping portrait shares, so
any two can be cross-faded or wipe-switched and only the face moves. Note the
frame is measured, not documented: the skill says head width 900, the actual set
sits at 888 (900 was the pre-crop target). `align_core.REEL_FRAME` carries the
measured values — a new asset has to match the SET, not the note.

**`sage.py`** solves the composite rather than keying:

    P = (1-c)*F + c*BG   ->   out = P + c*(SAGE - BG)

One add, no division, and a hair strand that is 30% covered gets 30% of the
shift — so semi-transparent hair un-mixes instead of keeping a pale fringe from
the old backdrop. Two things that bit during the build, both now commented in
the source: the backdrop must be sampled from the TOP corners only (the black
turtleneck reaches the bottom edge and drags the median dark), and the flood
fill needs `Image.fromarray(...).copy()` because an image from `fromarray` is
read-only — `floodfill` silently draws into an internal copy and every pixel
comes back unfilled.
