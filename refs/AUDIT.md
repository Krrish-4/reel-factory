# Mapping audit — the claimed matches, checked by hand

The `we_already_have` field is produced by the model and it over-matches. A
wrong match is expensive in a way a wrong *name* is not: it silently deletes a
work item, so the component never gets built and nobody knows it is missing.
`analyse.py` already nulls any primitive name we do not export, which catches
invented names but not a real name applied to the wrong motion.

This is that second pass, done against what each primitive actually does.

**108 claimed matches · 23 rejected (21%) · 85 upheld.**

---

## Rejected, and what they actually are

| ref | animation | claimed | actually |
|---|---|---|---|
| ref-12 | Stacked Eye Crops (`translate`) | `PopIn` | **CardStack** — PopIn scales, it does not translate a stack |
| ref-07 | Facial Feature Bounding Box | `PopIn` | **ScanOverlay** — a targeting box, not a scale-up |
| ref-09 | Eye Scan Bounding Box | `PopIn` | **ScanOverlay** — HUD frame with label |
| ref-03 | Eyebrow Bounding Corner Callouts | `DrawnCallout` | **ScanOverlay** — L-brackets, no leader line |
| ref-18 | Dimension Callout Line | `DrawnCallout` | **`DimensionCallout`** — already built; measures between two points with end ticks |
| ref-21 | Callout Badge Pop (`scale`) | `DrawnCallout` | **`StaggerGrid`** — cards popping, nothing draws |
| ref-14 | Text Swap Header | `Reveal` | **`InlineTextSwap`** — already built; "Masculine" → "Feminine" in place |
| ref-10 | Headline Crossfade | `Reveal` | **`InlineTextSwap`** — same mechanic |
| ref-11 | Focus Selector Box | `Reveal` | **ScanOverlay** — a framing box, not a scale-fade |
| ref-19 | Beard Mesh Overlay | `Reveal` | **FaceMesh** — a grid conforming to facial geometry |
| ref-01 | Avatar Arc Tag Assembly | `TagStack` | **`RadialFan`** — already built; items on an arc, not a chip row |
| ref-13 | TagStack (`translate`) | `TagStack` | **CardStack** — papers stacking in depth, not chips accumulating |
| ref-03 | Clinical Trial Subject Stack Carousel | `Montage` | **CardCarousel** — cards shift depth, they do not replace in place |
| ref-09 | Overlapping Photo Montage Cascade | `Montage` | **Collage** — tilted photos overlaying, all present at once |
| ref-13 | Montage (grid popping in) | `Montage` | **`StaggerGrid`** — already built |
| ref-18 | Style Carousel Swipe | `Montage` | **CardCarousel** |
| ref-01 | Facial Piercing Overlay Morph | `SliderReveal` | **OverlayToggle** — items appear ON a face; no divider sweeps |
| ref-18 | Anatomical Wireframe Overlay | `ContourDraw` | **FaceMesh** — a conforming grid, not a traced outline |
| ref-20 | Facial Wireframe Draw | `ContourDraw` | **FaceMesh** |
| ref-04 | Hub and Spoke Diagram | `TrimPath` | **`RadialFan`** — already built |
| ref-04 | Interconnected Network Map | `TrimPath` | **NetworkGraph** — two-row graph with double-ended connectors |
| ref-12 | Eye Area Brackets | `TrimPath` | **ScanOverlay** |
| ref-09 | Comparison Stack Cards | `ConvergePanels` | **CardStack** — ConvergePanels merges two portraits into ONE face; these stay two cards |

---

## What the audit changes

### Four were already built and went unrecognised

`DimensionCallout`, `InlineTextSwap`, `RadialFan`, `StaggerGrid` — all in
`src/refina/kit/`, all claimed as something else. The model was not given the
kit, only the older primitive list, so this is a prompt gap rather than a model
failure: **`OUR_PRIMITIVES` in `describe.py` has not been updated since the kit
was written.** Fixing that alone would remove four of the 23.

### Five components are hidden work the build plan missed

Every one was masked by a wrong match, so none appears in `BUILD-PLAN.md`:

| component | uses | what it is |
|---|---|---|
| **ScanOverlay** | 5 | corner brackets / HUD frame locking onto a region. Note `TargetReticle` in the kit is close — this may be the same component once its label and crosshair options are exercised. Check before building. |
| **CardStack** | 3 | cards layered in depth, shifting order — not a montage and not a grid |
| **FaceMesh** | 3 | a wireframe grid conforming to facial geometry |
| **CardCarousel** | 2 | already #2 in the build plan; these two uses were hidden under `Montage` |
| **NetworkGraph** | 1 | nodes joined by drawn connectors |
| **Collage** | 1 | tilted overlapping photos, all present at once |
| **OverlayToggle** | 1 | items appearing on a face without a divider |

### The error is not random

It clusters where a primitive is *adjacent* to the truth:

- `PopIn` absorbs anything that appears (18 claims, 3 wrong)
- `Montage` absorbs anything with several images (9 claims, 4 wrong)
- `TrimPath` absorbs anything drawn (4 claims, 3 wrong — the worst rate)
- `ContourDraw` absorbs anything traced on a face (7 claims, 2 wrong)

`StepPill`, `AnimatedCheckList`, `ScrollReveal`, `ChatThread`, `PushWipe`,
`SlideOver`, `Drop` and `Cursor` were **100% correct** — they describe narrow,
unmistakable mechanics. The over-matching primitives are the vague ones.

---

## Action

1. Add the kit to `OUR_PRIMITIVES` in `describe.py`. Four rejections are purely
   because the model was never told those components exist.
2. Check `ScanOverlay` against the existing `TargetReticle` before building it.
   Five uses makes it the highest-leverage item in this list, and it may already
   be done.
3. Add `CardStack` and `FaceMesh` to the build plan — 3 uses each, and neither
   appears in it today.
