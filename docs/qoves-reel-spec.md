# QOVES Reel — Spec for `RefinaProtocolReel`

Reference: `https://www.instagram.com/p/DY-nEmMAPV7/` — QOVES "Glow-Up Protocol" ad,
78.1s, vertical. Measured from a 60-frame token-burner extraction with **dedup disabled**,
so mid-transition animation states were visible. (Re-extract with
`--detail token-burner --no-dedup` if this ever needs re-checking.)

We copy the **visual system, beat structure, and script cadence**. We do not copy their
product UI, their expert footage, or their brand marks.

---

## 1. Canvas

- **Flat sage blue-gray `#A3B5BA` for the entire runtime.** Never changes — not one beat.
  No gradients, no light scenes, no dark scenes.
- **All text is white.** Sole exception: the white "section pill" device (§4), which has
  dark text on white.
- Panels behind faces are a slightly lighter sage, ~`#B4C4C8`.
- Accent colors appear only in the ✗/✓ verdict tags: red ~`#D0342C`, green ~`#2E7D5B`.

## 2. Two type tracks, different speeds

This is the core rhythm. Getting it wrong makes the reel read as a slideshow — which is
exactly how the first attempt failed.

| Track | Position | Font | Size @1080w | Cadence |
|---|---|---|---|---|
| **Headline** | top ~15% | light geometric sans, white | ~56-64px | Holds for a WHOLE SECTION. "Effective and efficient" persists ~16s across 8 caption changes. |
| **Caption** | bottom ~18% | italic serif, white | ~40-44px | Changes every ~1.5-2s, phrase by phrase. |

**Slow headline, fast caption. Never change both simultaneously.**

## 3. Signature transition: blur-to-sharp word reveal

Text does not fade in. It appears **blurred and ghosted, then sharpens word by word**,
left to right. Caught mid-reveal in the frames: "We hired *full-time*", "2. We determine
what would *look better*", "Three *key* benefits".

On a headline change the outgoing line cross-dissolves (still visible, blurring out) while
the incoming line rises in slightly above it — they overlap for ~8-12 frames.

Implement as per-word `filter: blur(Npx)` + opacity + small `translateY`, staggered
~2-3 frames per word.

## 4. Visual devices

| Device | Spec |
|---|---|
| **Full-bleed face** | Face fills ~25-80% of frame height, cropped at shoulders, sitting DIRECTLY on the sage bg — their model was shot on a matching backdrop so it blends seamlessly. No card, no border. **Requires a plain-background portrait** (see §8). |
| **Annotation callouts** | Small dot on a facial feature → thin dotted horizontal leader line → small white sans label ("Bold brows", "Red-light therapy", "Lash lift"). Optionally a translucent pale-blue citation card with tiny reference text hanging below the label. Labels alternate left/right. |
| **Split panels** | Two rounded rects side by side. Tiny letterspaced MONO labels on dark translucent chips, top-left of left panel / top-right of right panel: `YOU NOW` / `YOUR POTENTIAL`. Thin white → arrow between panels. `RENDERING · FOR ILLUSTRATIVE PURPOSES ONLY` in tiny low-opacity mono, centered beneath. |
| **Section pill** | Numbered section headline in a **white rounded pill with dark text**: "1. What actually makes a face attractive?". The one place dark-on-light appears. |
| **①②③ pips** | Thin white outlined circles in a row under the headline; the active one gets a heavier/filled ring. Persist across a whole section. |
| **✗ / ✓ verdict tags** | Small rounded rect, white bg, colored border, **monospace** text, pinned to a panel's top-right. Red `✗ BLIND-COPYING` / green `✓ CUSTOM PROTOCOL`. |
| **Thought bubble** | White cloud + 2 trailing dots, dark text, types in word by word ("I love kylie's hair" → "and lips"). Sits over the head. |
| **Floating data cards** | White rounded cards with small data readouts (`56%`, `54mm`, "Summary of your lips") scattered around the face — **some tucked behind the head**. Real z-layering. Staggered entry. |
| **Checklist** | White ✓ + label, left aligned, staggered fade-in, alongside a thin white contour traced over the face. |
| **Floating documents** | White pages, slightly rotated, drifting in and out. (Not used in the Refina cut — that's the credibility beat we don't mirror.) |
| **Search-bar CTA** | Thin white OUTLINED pill, transparent fill, magnifier icon right, text **types out** the destination. This is the entire ending — no logo, no badge. |

## 5. Motion

- **Hard cuts between beats.** No scene-to-scene crossfades.
- All motion lives inside a beat: blur-in, slight upward drift, staggered card entry.
- Elements enter, settle, and hold. Nothing drifts continuously.

## 6. Locked script

Reconstructed from their caption track, adapted line-for-line. Lines marked **[same]** are
theirs verbatim.

> You have no idea how attractive you could be. **[same]**
> We can show you exactly what the best you would look like. **[same]**
> Then show you how to get there. **[same]**
>
> How can we do this? How to do this was relatively straightforward. **[same]**
> Every procedure is rendered onto your actual photo — your skin tone, your lighting,
> your bone structure — to show you both what actually changes a face, and what each
> procedure really does.
>
> Now, on your end, it's as simple as uploading a photo, choosing the procedure you're
> considering, and seeing exactly what those changes would look like.
>
> This approach has three benefits. First, it's effective and efficient, tailored to you. **[same]**
> Most people take a one-size-fits-all approach to beauty, copying a celebrity they've seen.
> But the problem is, what works for one face might not work for another. **[same]**
> Refina will bring out your beauty, not turn you into someone else.
>
> Our preview lets you try any procedure you're considering, and see what that change
> would look like in advance, to help you decide.
>
> It can also reduce insecurities — if there's something you're able to change that's
> worth changing. **[same]** And then after you've seen it, there's really no point in
> overthinking your face. You'll know you literally look your best.
>
> Most people are surprised by just how good they could look. **[same]**
> Refina analyzes your face, writes you a 22-page dossier, and shows you what's possible.
>
> Search Refina AI.

~200 words → **~72s** at ~168 wpm.

### Headline track (mirrors theirs 1:1)

1. `We can show you / how attractive you could be`
2. `How can we do this?`
3. `1. What actually changes a face?`
4. `2. What does each procedure really do?`
5. `1. Upload your photo`
6. `2. Choose a procedure`
7. `3. See exactly what it looks like`
8. `Three key benefits…`
9. `Effective and efficient`
10. `What works for one face, won't suit others`
11. `We'll bring out your beauty`
12. `Reduce Insecurities`
13. `No need to overthink it`
14. `You'll know you look your best`
15. `You'd be surprised what's possible`

## 7. Refina adaptation rules

- Refina **content**, QOVES **treatment**. Sage + white, never Refina's cream/mauve app
  palette — that belongs to `RefinaReel`.
- **The credibility beat is the one we do not mirror.** QOVES claims "five years, the
  scientific literature, consulted experts, hired researchers". Substituted with the
  rendering explanation, which is true and occupies the same slot with the same cadence.
  **Never fabricate research duration, dataset size, staff, accuracy, or user counts.**
  If the user supplies a real proof point, it goes here.
- **Photo caveat:** Refina's existing photos (`before.png`, `preview.png`, `after.png`)
  are a car interior and a café. They will NOT blend into the sage the way QOVES's
  studio-backdrop shots do. Either use a plain-background portrait (§8) or present them
  in rounded panels — never bleed a busy-background photo to the frame edge.
- Compliance chip on product beats: `AI PREVIEW · NOT MEDICAL ADVICE`.
  Full disclaimer, verbatim from the App Store listing: "Refina provides educational
  visualizations only and does not constitute medical advice. Outcomes vary by
  individual; consult a qualified healthcare professional before any procedure."

## 8. Assets

### Present

| Path | What |
|---|---|
| `public/before.png` | Madison, car, before |
| `public/preview.png` | Madison, car, AI Botox preview |
| `public/after.png` | Madison, café, real post-procedure |
| `public/talkinghead.mp4` | 720x1280, 24fps, 10s — used in `RefinaReel`, not this one |
| `public/voiceover3.mp3` | **77.61s — the live VO for §6.** 4 TTS parts joined with the ffmpeg concat filter. |
| `public/voiceover2.mp3` | 65.3s — superseded, kept only for reference |
| `public/portraits/*.png` | Cut-out RGBA portraits: `front-before`, `front-after`, `profile-before`, `profile-after`, `front-generic` |
| `public/refina-ui/screens_trim/` | Real app screens, cropped + margin-trimmed from the Figma export: `cosmetic-preview`, `reference-photos`, `select-procedures`, `creating-preview`, `your-result`, `dossier-intro` |
| `public/refina-ui/*.png` | Full Figma flow boards (source for further crops) |

### Portrait pipeline (`public/portraits/`)

**Current hero pair** (`front-before`, `front-after`): a young woman in a black turtleneck
on a `#9cabb1` backdrop — chosen because she matches the reference reel's model and the
backdrop is already near-sage. Before = visible blemishes / flat hair; after = clear skin,
styled hair. `profile-before` / `profile-after` are an earlier, different model and are
**no longer referenced** — the "what does each procedure really do?" beat now uses the
front view of the hero model so one person carries the whole reel.

Processed to RGBA cut-outs so they sit on the sage with no visible edge:

1. **Colour unmixing** — `F = (P − (1−α)·BG) / α` per pixel. Removes the backdrop's
   contribution from semi-transparent hair, so there is no olive fringe. Plain thresholding
   is NOT sufficient.
2. **Largest-component keep** — drops translucent blobs left by the backdrop vignette.
3. **Interior hole fill** — background regions *not reachable from the image border* are
   holes (skin that read as backdrop) and get α=1. A morphological closing is not enough;
   the holes are too large.
4. **Canvas normalisation** — every portrait is padded (transparent rows on top, extended
   rows below) so the top of the head lands at the **same fraction, 0.0489**, of the canvas.
   That is why `HEAD_TOP_FRAC` is a single constant and any new portrait must be normalised
   the same way. `SplitPanels` uses `height: 165%` / `translateY -34%` for this aspect.
5. **Bottom pad must be blended, not replicated.** Repeating the final row verbatim produces
   vertical streaks (hair texture at the edges); a hard switch to a blurred row produces a
   visible seam. Correct approach: lerp from the exact final row to a horizontally-blurred
   version of it over ~90 rows.

`front-generic.png` is `front-after` with heavy blur + mild saturation — an illustrative
"generic filter" look used only for the ✗ ONE-SIZE-FITS-ALL panel.

**Portrait sizing:** the face spans ~57% of the unpadded image height, so `size` values are
large (84-97) and framing is driven by `headTop` (px from the top of frame), not by
centring. Keep the head below ~540px or it collides with the headline.

### Still needed

1. **2-3 additional procedure previews on the same face** (nose, lips, jaw). The
   "what works for one face won't suit another" and re-render beats currently reuse one
   result plus the `front-generic` illustration.
2. **More dossier pages** cropped from `Dossier.png` (Executive Summary, proportions, skin).
3. **Music bed** — silence between VO phrases is part of why the first cut felt flat.
4. **Refina logo** SVG/PNG (currently hand-recreated vector in `src/refina/Logo.tsx`).

## 9. VO timing method

Captions are synced by detecting phrase-boundary silences, not by guessing:

```bash
ffmpeg -hide_banner -nostats -i public/<vo>.mp3 \
  -af "silencedetect=noise=-30dB:d=0.2" -f null - 2>&1 | grep silence_
```

Map script phrases onto the resulting segments, sanity-checking against a words-per-second
estimate (~2.8 w/s at this narrator's pace). Set each scene's `durationInFrames` from those
boundaries so the composition's total frame count matches the audio duration exactly.

**Live map for `voiceover3.mp3`** (77.61s, 2328 frames, 25 speech segments): her pace is
~207 wpm / 3.45 words-per-second. Caption cues were generated by distributing the script's
words across the detected segments proportionally to segment duration, then taking each
caption's start from its first word — see the `CUES` array in `RefinaProtocolReel.tsx`.

For the superseded 65.3s VO the boundaries were (seconds):
`0.82 3.21 4.72 14.49 15.78 21.78 26.16 27.31 28.47 29.68 38.77 40.62 42.74 44.57 49.45
50.80 53.63 54.28 57.54 59.50 61.95 63.77` — three TTS parts joined with the ffmpeg
concat filter, part boundaries at 29.857s and 57.703s. Re-derive after the re-record.

---

## 10. Animation vocabulary (authoritative)

The first rebuild was rejected because it had ~5 animation behaviours where the reference
has ~17. **Every beat must be composed from these primitives** (`src/refina/protocol/motion.tsx`),
never from ad-hoc fade + translate. `MotionLab` is a registered composition that demos each
one in isolation — scrub it before using a primitive.

| # | Primitive | Behaviour |
|---|---|---|
| 1 | `PopIn` | scale 0→1 with spring overshoot/bounce |
| 2 | `SlideIn` | enter from up/down/left/right, ease-out, fading |
| 3 | `CountUp` | number ticks up (reference: Aesthetic Score 78→80) |
| 4 | `TrimPath` | SVG path draws itself via `stroke-dashoffset`; `dashed` variant for callout leaders |
| 5 | `SliderReveal` | masked wipe revealing "after" over "before" |
| 6 | `PushWipe` | incoming panel shoves the outgoing one off-frame |
| 7 | `ScrollReveal` | content scrolls up inside a device viewport, revealing rows |
| 8 | `ChatThread` | chat bubbles slide up one by one |
| 9 | `Montage` | rhythmic hard cuts between children (report-page overload) |
| 10 | `Cursor` | pointer glides to a target and clicks (scale-down tick) |
| 11 | `StepPill` | numbered badge pops in |
| 12 | `AnimatedCheckList` | label + checkmark that *draws*, staggered |
| 13 | `SlideOver` | dashboard/panel slides in on top of the subject |

### Reference scene-by-scene breakdown (user-supplied)

- **0:00-0:02 Hook** — side-by-side YOU NOW / YOUR POTENTIAL. Text overlays gently fade in.
  No camera movement. Hard cut out.
- **0:02-0:10 Product reveal (mobile)** — phone mockup slides up from the bottom while
  fading in. Aesthetic Score counts 78→80. A vertical slider line moves left→right using a
  mask to reveal the enhanced face. Content then scrolls upward revealing accordion menus
  (Skin, Eyebrows…). Hard cut.
- **0:10-0:16 Building authority** — papers slide in from the bottom with slight rotation,
  stacking. Expert portraits pop in sequentially with overshoot. Hard cut.
- **0:16-0:23 Diagnostic breakdown** — large portrait; dotted lines *draw* outward from the
  face to text boxes (trim paths); text boxes fade in **after** their line arrives; step
  pills "1", "2" pop in at the top. Transition: swift upward slide to the tablet view.
- **0:23-0:31 The process (tablet)** — tablet fades + scales in slightly; the UI content
  **cuts abruptly** between report stages (proportions grid → score dashboard → skincare),
  simulating clicking through a document. Hard cut.
- **0:31-0:49 Problem vs solution** — thought bubble pops with scale bounce; the bad
  (photoshopped) result slides in from the right; red ✗ BLIND-COPYING badge pops over it;
  the good result then **push-wipes** the bad one out to the right; green ✓ CUSTOM PROTOCOL
  badge pops. Hard cut.
- **0:49-0:56 Concierge chat** — chat bubbles slide up one by one; the result image expands
  outward from the chat bubble.
- **0:57-1:07 Alleviating insecurities** — dashboard slides in over the face; checklist items
  appear with checkmarks animating sequentially; a glowing contour is *drawn* around the jaw
  and hairline via trim paths.
- **1:08-1:17 Climax + CTA** — fast rhythmic hard-cut montage of report pages (intentional
  visual overload = "you get a lot"); then the clean background returns, a search bar fades
  in, the query **types out**, and a custom cursor glides to the magnifier and clicks.

### Rules

- Slow headline / fast caption still applies (§2); animation richness never overrides it.
- Prefer *drawing* and *masking* over fading. A plain opacity fade is the fallback of last
  resort, not the default.
- Elements enter, settle, hold. Nothing drifts continuously.

## 11. Typography

| Role | Face | Notes |
|---|---|---|
| Headline | **Outfit** 200-300 (`displayFont`) | geometric, brand-forward. Replaced Inter Light, which read as generic UI type. |
| Caption | Playfair Display *italic* (`serifFont`) | unchanged — this is the look we want |
| Mono chips / disclaimers | system monospace | `YOU NOW`, `RENDERING · FOR ILLUSTRATIVE…`, verdict tags |

## 12. Render quality

`remotion.config.ts` must stay on **PNG frames** (`Config.setVideoImageFormat("png")`) and
**CRF 18**. JPEG frames re-compress every frame before encoding and visibly soften hair
edges, dotted callout lines, and small type — a real contributor to the reel looking
"lower quality" than the reference.

## 13. Subjects and in-app imagery

**Two subjects are used deliberately** (the user confirmed more than one is fine):

| Key | Files | Used for |
|---|---|---|
| `A` — younger woman | `front-before` / `front-after`, `headFrac 0.049` | diagnostic callouts, thought-bubble beat, blind-copying / custom-protocol panels, payoff split |
| `B` — older woman | `alt-before` / `alt-after`, `headFrac 0.059` | hook split, benefits, insecurities, checklist/contour beats — **and she is the subject composited into the app screens**, so phone beats pair with her |

`Portrait` and `SplitPanels` take per-image `headFrac` / `offset` because each source frames the
head differently. Do not assume one constant.

**The app screens must contain real photos.** Shipping the raw Figma crops looks empty and was
rejected. Composited variants live alongside the originals in `screens_trim/`:

- `your-result-before` / `your-result-after` — the empty grey "Loading…" placeholder replaced
  with a real result photo. Two variants so `SliderReveal` can wipe *inside* the phone.
- `cosmetic-preview-ours` — stock demo photo swapped for our own before/after split, with the
  BEFORE / AFTER pills, centre handle and "Drag to compare" chip redrawn (Segoe UI via PIL).
- `dossier-1 … dossier-13` — cropped from `Dossier.png` by detecting the `#444444` gaps between
  phones (the board margin is black, the gaps are grey — that distinction is what the detector
  keys on). `dossier-11` has the Executive Summary photo slot filled.
- `creating-preview` — doubled-caption artifact from the Figma board painted out.

`celeb.png` is used only as the small reference inset on the "copying a celebrity" line, at the
user's explicit direction.

## 14. Gotchas that cost real time

- **`useCurrentFrame()` inside a `<Sequence>` is LOCAL, not absolute.** Passing an absolute
  frame to a primitive's `at` / `from` silently disables it. The blind-copying push-wipe never
  fired because of this. Always pass sequence-local frames.
- **Blurring a keyed cut-out bleeds RGB past the alpha edge**, leaving a ragged halo. Erode the
  alpha (`MinFilter`) before blurring — see how `front-generic` is generated.
- **Portrait `size` is large (84-97)** because the face occupies only ~45-57% of the source
  image height. Framing is driven by `headTop` in px, not by centring.
