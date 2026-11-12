# ref-12

**educational explainer** — This video explains how to enhance the eye area's attractiveness using eye drops for clarity and strategic eyebrow shaping to adjust perceived tilt, spacing, and symmetry.

60.708s · 1080x1920 @24.0

## Animation language

- **signature moves** — Horizontal face-swipe transitions, Dotted guide-line draw-ons, Stacked image comparisons
- **how things enter** — Elements slide in from the edges or scale up with a slight spring bounce.
- **how things leave** — Elements are typically replaced by the next sliding panel or fade out quickly.
- **how scenes change** — Clean horizontal push wipes or direct cuts between high-contrast portraits.
- **what stays still** — The muted blue-grey background color and central portrait alignment.
- **rhythm** — Highly structured and educational, alternating between steady explanations and rapid visual proof stacks.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 51.9% |
| element arrivals / min | 150.3 |
| hard cuts | 1 (1.0/min) |
| median shot | 30.35s |
| transitions | 19 (median 1.12s) |
| speech | 95.6% |
| scene changes that are cuts | 25.0% (1 of 4) |
| ground | `#5F6971` flat=False |

## Animations (8)

5 we can already build · **3 we cannot**

### Would need building

**UI Slider Control** — Contrast slider handle and value indicator  
`translate` · left-to-right · mechanical  
*Purpose:* Simulates real-time adjustment of image contrast and clarity.  
*Reusable as:* Demonstrating software settings, photo editing, or tuning parameters.  
*Build:* Interactive UI slider component that binds its value to an image filter effect.

**Asymmetry Adjustment** — One eyebrow graphic and guide line  
`translate` · upward · smooth  
*Purpose:* Demonstrates how raising one brow visually balances facial asymmetry.  
*Reusable as:* Showing before/after alignment corrections.  
*Build:* A split-layer translation tool to shift specific regions of an image independently.

**HUD Analysis Overlay** — Data charts, scanning lines, and facial grid overlays  
`fade` · none · floaty · staggered  
*Purpose:* Conveys a scientific, analytical approach to facial aesthetics.  
*Reusable as:* Tech-themed product demos, diagnostics, or scanning sequences.  
*Build:* A complex sci-fi HUD overlay package with animated line graphs and grid sweeps.

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Face Montage Transition | `PushWipe` | Establishes the hook by showing diverse examples of the eye area. |
| Eye Area Brackets | `TrimPath` | Directs viewer attention specifically to the eye region. |
| Step Indicator | `StepPill` | Signals transition to the first actionable tip. |
| Stacked Eye Crops | `PopIn` | Compares eye clarity across different individuals rapidly. |
| Dotted Brow Guides | `DottedDraw` | Illustrates the tilt and shape of the eyebrows relative to the eyes. |

## What to steal, ranked

1. UI Slider Control: Great for showing real-time adjustments or before/after comparisons.
2. Dotted Brow Guides: Highly effective for technical callouts and anatomical alignments.
3. Stacked Eye Crops: A clean way to show multiple variations of a single feature simultaneously.

## Timeline — every animation instance (40)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `none` | Anne Hathaway's face and text | The eye area can make or break a face, EYE A |
| 1.0s | `translate` | Justin Bieber's face and text | JUSTIN BIEBER, CANADIAN SINGER |
| 2.0s | `translate` | Zendaya's face and text | ZENDAYA, AMERICAN ACTRESS |
| 3.0s | `translate` | David Corenswet's face and text | DAVID CORENSWET, AMERICAN ACTOR |
| 4.0s | `translate` | Kendall Jenner's face and text | KENDALL JENNER, AMERICAN MODEL |
| 5.0s | `translate` | Jacob Elordi's face and text | JACOB ELORDI, AUSTRALIAN ACTOR |
| 6.0s | `translate` | Female face and step indicators | 2 STEPS, STEP 1 |
| 8.0s | `fade` | Contrast slider UI | CONTRAST |
| 9.0s | `translate` | Slider handle and eye contrast | Contrast value increases from 36 to 90 |
| 12.0s | `fade` | Buttons | CLARITY, CONTRAST |
| 13.0s | `translate` | Cropped eye images | Eye comparison |
| 14.0s | `translate` | Male face | Male face with blue eyes |
| 15.0s | `translate` | Cropped eye image | Eye overlay |
| 16.0s | `translate` | Cropped eye image | Eye overlay |
| 17.0s | `translate` | Cropped eye image | Eye overlay |
| 18.0s | `fade` | Text block | The eyes will look tired and less healthy |
| 19.0s | `fade` | Contrast slider UI | CONTRAST |
| 20.0s | `translate` | Slider handle and eye contrast | Contrast value changes |
| 21.0s | `fade` | Text block | Simply using preservative free eye drops |
| 21.5s | `translate` | Images of eye drop usage | Eye drop usage |
| 22.0s | `translate` | Eye drop bottle icon and droplet | Droplet falling |
| 24.0s | `translate` | Slider handle and eye contrast | Contrast value increases to 93 |
| 25.0s | `translate` | Male face and text | Framing your eyes correctly |
| 28.0s | `translate` | Cropped eyebrow image | Eyebrow overlay |
| 29.0s | `translate` | Cropped eyebrow image | Eyebrow overlay |
| 30.0s | `translate` | Cropped eyebrow image | Eyebrow overlay |
| 31.0s | `translate` | Male face, text, and dotted lines | NEGATIVE CANTHAL TILT |
| 33.0s | `morph` | Eyebrows and text | TILTED UPWARDS |
| 36.0s | `translate` | Blonde female face | Blonde female face |
| 37.0s | `fade` | Text and lines | Brows can also help fix spacing, CLOSE-SET E |
| 39.0s | `mask-reveal` | Inner ends of eyebrows | Eyebrows shortened |
| 41.0s | `translate` | Female face with freckles | Female face with freckles |
| 42.0s | `fade` | Text and lines | WIDE-SET EYES |
| 43.0s | `draw-on` | Inner ends of eyebrows | Eyebrows extended inwards |
| 45.0s | `translate` | Male face | Male face |
| 46.0s | `fade` | Text block | You can use your brows to even out asymmetri |
| 47.0s | `fade` | Text and lines | ASYMMETRICAL EYES |
| 51.0s | `translate` | One eyebrow and text | VISUALLY LEVELS THEM |
| 53.0s | `translate` | Male face with multiple HUD elements | CANTHAL TILT, BROW AREA THICKNESS, LOWER ORB |
| 58.0s | `translate` | Search bar and website text | Qoves.com |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed portrait with graphic overlays | bounding box overlay, text labels |
| 6.0s | 144 | transition | split screen and stacked image slices | interactive slider UI, text chips, stacked image slices |
| 25.0s | 600 | transition | full-bleed portrait with vector overlays | dotted alignment lines, directional arrows, text labels |
| 52.0s | 1248 | transition | analytical HUD overlay | graphs, data readouts, bounding boxes |
| 57.0s | 1368 | transition | centered UI mockup | search bar graphic |

## Narrative arc

1. Hook: Establish the critical importance of the eye area using celebrity examples.
2. Step 1: Introduce eye clarity and contrast, offering a simple solution (eye drops).
3. Step 2: Explain brow shaping techniques to correct tilt, spacing, and asymmetry.
4. Outro: Tease deeper scientific analysis and drive traffic to the website.

## Devices (15)

text labels, bounding box overlay, interactive slider UI, text chips, stacked image slices, dotted alignment lines, directional arrows, graphs, data readouts, bounding boxes, search bar graphic, EYE AREA Bounding Box, Contrast Slider, Alignment Overlays, HUD Analytics
