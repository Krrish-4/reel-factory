---
name: reel-assets
description: Generate, screen, register and frame the images a reel uses. Load before creating a portrait or procedure preview, or when a pair looks mismatched.
---

# Assets

Full detail in `gen/README.md`. This is the part that keeps being got wrong.

## How a pair is generated — READ THIS FIRST, IT CHANGED 2026-09-09

**`gen/subject.py` and both gflow CLIs are retired.** Google moved this account's
Flow from `labs.google` to `flow.google.com`. gflow-cli anchors every selector on
Material Symbols ligatures, the new frontend renders none, and image generation
is not ported upstream (ffroliva/gflow-cli#639). `subject.py` now exits with a
pointer instead of failing at the auth layer, which is where the last session
lost an hour.

The replacement is `gen/flow.mjs` — playwright-core driving the real Chrome, no
CLI in between. Same two phases and the same `subjects.toml`:

```
python gen/flow-prompts.py --subject bleph2 --after blepharoplasty --out-dir gen/out/bleph2
node   gen/flow.mjs pair --before-file gen/out/bleph2/before.txt \
           --after-file gen/out/bleph2/after.txt --out gen/out/bleph2 --name bleph2
python gen/score.py gen/out/bleph2/bleph2-before-2k.jpeg --target eyes \
           gen/out/bleph2/bleph2-after-2k.jpeg
```

Then `promote.py` → `sage.py` → `registry.py --ingest`, unchanged.

**Prompts are never typed at the shell.** `flow-prompts.py` renders them from
`subjects.toml` through `[base].portrait` and `[after].template`, so a render is
always traceable to a casting decision in the spec. `flow.mjs` only knows how to
drive a browser.

**THE ORDER INSIDE `pair` IS LOAD-BEARING, NOT TIDINESS.** It downloads the
before at 2K *before* attaching it as the i2i ingredient, because "Add to prompt"
moves that tile out of the media grid into the session panel — where it can no
longer be downloaded at all. Get this backwards and you end up with a 2K after
and a 1K before, which is not a pair: two halves given different treatment is the
same defect as the `claim` beat in `RefinaFlip`, where two bands at different
offsets were captioned as one face seen two ways.

**A render that has not arrived is not a failed render.** Flow is routinely
slower than a 15-minute poll. Run `node gen/flow.mjs list --project <url>` before
regenerating — every apparent failure in testing was a render that landed late,
and regenerating spends credits to duplicate work already done.

The seven browser-level gotchas (the prompt box has no `role="textbox"`; every
image appears twice and only the media-grid copy has a menu; 2K is an async
server-side upscale; the settings popover commits on Save and ignores Escape)
are in the header of `gen/flow.mjs`. Read it before editing that file.

Measured end to end on `bleph2`: eyes 35.7, concentration 2.18, drift 5.3,
texture 0.70 — PASS on the first casting.

## The casting fix — the single most important thing here

**The before and the after are ONE casting decision, not two prompts.**

1. **Cast the before to visibly NEED the procedure.** Every early failure
   generated a woman with a fine nose and jaw and then asked to fix them. There
   was nothing to change, nothing changed, and the measurement of that nothing
   got blamed on the model.
2. **Ask for it "strong", never "subtle".** Every prompt in the failed batch said
   subtle.
3. **Forbid the failure you have measured, in words.** *"It is very important
   that it actually looks like the actual cosmetic procedure and not a filter or
   FaceTune."*
4. **Do not over-constrain.** One clause — "leave everything else exactly the
   same" — beat an eleven-item do-not-touch list, which scored second worst.

**Corollary, learned late:** a subject cast for one beat may be wrong for
another. `demo1` was cast "none of it extreme" so the light beat had something
subtle to find; a facelift on her then scored 17 against a threshold of 25,
twice, on two different briefs. Decide which beat the casting serves first.

## Constraints live in one file

`gen/constraints.toml` holds every hard-won clause with the failure that
produced it, and `gen/prompts.py` composes a prompt from named clauses.
`python gen/prompts.py --audit` reports which specs still inline a clause.

Recipes: `base_portrait`, `procedure_after`, `photographic_after`, `lens_after`.
Note that `conditions.toml` **inverts** `procedures.toml` — it changes the
photograph and holds the face still, which is why `score.py` is the wrong screen
for it.

## The screen

Three axes, because "did the procedure happen" is three questions: **strength**
(p90 inside the box ≥25), **concentration** (target vs loudest other ≥1.20),
**stillness** (median change over facial skin ≤15). Validated 8/8 against
hand-labelled renders. It only says a render is *not disqualified* — look at
every survivor.

## Framing: the bug that kept coming back

`align_core` normalises head width **in pixels**, but each run picks its own
canvas — the same ~900px head came out at 82%, 67% and 50% of frame width across
three runs, and the subject changed size between beats on screen.

**Every asset is ingested through the registry**, which reframes it to one
canonical frame:

```
python gen/registry.py --ingest <render> --as <name> --subject <s> \
    --depicts procedure:facelift --role after --pairs-with <control>
python gen/registry.py --export        # rewrites src/refina/assets.ts
```

## Labels come from the record

`<Card name="flood-06a" label="RHINOPLASTY" />` was an assertion typed from
context and checked by nobody. Use `labelOf(id)`. An unregistered asset returns
`""` — an unverified image renders with no claim rather than a guessed one.
`gen/check-assets.py` fails a label the record contradicts.

## Callouts come from the record too

`anchor(id, region, box, zoom, focus)` computes a feature's rectangle from face
geometry measured off the skin mask. A frame coordinate is not a fact about a
face; it is a fact about one composite of one image, and it stops being true the
moment the crop changes. Typed coordinates put TEMPLE on an under-eye, CHEEK on
a jaw, and JAWLINE on a nose twice.

The record is authoritative about **where** a feature is. It says nothing about
what a good annotation looks like — size the shape yourself.

## The watermark — and why 6% is not enough for an after

Every Flow render carries a **Gemini watermark**, bottom-right. `strip_watermark()`
in `gen/generate.py` crops the bottom 6%, which on a head-and-shoulders portrait
is turtleneck.

**That crop is sufficient for a `before` and NOT for an i2i `after`.** An after
carries TWO marks: its parent's, re-rendered as image content by the edit, plus a
fresh one Flow stamps higher up. Measured on a 1792x2400 `bleph2` after they span
rows 2153-2305 — **89.7% to 96.0% of height**, while the 6% crop only starts at
94.0%. So the documented crop takes the before's mark and leaves most of the
after's.

Crop ~11% for anything produced by `flow.mjs edit` / `pair`, and **look at the
result** — this was found by eye on a contact sheet, not by any check.

## Derived assets — when the second picture is computed, not generated

`gen/asym.py` builds a flip, two self-chimeras (each half doubled onto its own
mirror) and a mirror difference map from ONE registered master, by pure column
arithmetic. `RefinaFlip` is made of these.

```
python gen/asym.py --scan                       # rank every registered portrait
python gen/asym.py bleph1-before --emit bleph1   # flip / left / right / map + json
python gen/emit-asym.py bleph1 demo1 --ts src/refina/flip/measured.ts
python gen/registry.py --ingest public/portraits/bleph1-left.png --as bleph1-left \
    --subject bleph1 --depicts derived:half-left --role derived \
    --pairs-with bleph1-before --no-reframe
```

Three things worth knowing:

- **`score.py` does not apply.** There is no localisation question — the pair is
  exact by construction. That is also why this is the only reel in the repo that
  can put a measurement on screen with nothing generated behind it.
- **The midline is solved, not chosen**, by minimising the face's own mirror
  residual. Every number that comes out is therefore a LOWER bound.
- **`--no-reframe` is required.** A derived image is already on its source's
  pixel grid and re-framing it would break exactly the alignment that makes it
  evidence. Register the label as `derived:<operation>` so what the beat prints
  names the transform rather than an outcome.
