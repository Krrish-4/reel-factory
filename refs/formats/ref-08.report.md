# ref-08

**evidence explainer** — An educational video analyzing the psychological and social effects of disclosing cosmetic surgery using scientific studies and celebrity examples.

65.34s · 1080x1920 @30.0

## Animation language

- **signature moves** — Grid Scan Overlay, Slider Rating Pointer, Chat Bubble Pop
- **how things enter** — Elements scale up with elastic spring physics or slide in from the sides.
- **how things leave** — Elements fade out or are replaced abruptly by the next scene.
- **how scenes change** — Hard cuts with occasional slide-overs or full-screen color wipes.
- **what stays still** — The muted blue-grey background and top-level question text.
- **rhythm** — Highly dynamic, alternating between static data presentation and rapid visual demonstrations.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 64.7% |
| element arrivals / min | 77.2 |
| hard cuts | 0 (0.0/min) |
| median shot | 65.33s |
| transitions | 18 (median 0.52s) |
| speech | 96.3% |
| scene changes that are cuts | 0.0% (0 of 9) |
| ground | `#9FB5BE` flat=False |

## Animations (9)

3 we can already build · **6 we cannot**

### Would need building

**Grid Scan Overlay** — A dotted grid overlay sweeps across the face image.  
`wipe` · left-to-right · smooth  
*Purpose:* Simulates a digital facial analysis scan.  
*Reusable as:* Scanning or analyzing any portrait or product image.  
*Build:* A grid texture mask that sweeps horizontally across a target layer.

**Face Scanner Box** — A bounding box with 'EVALUATING...' text sweeps down the face.  
`mask-reveal` · down · mechanical  
*Purpose:* Indicates an automated aesthetic evaluation process.  
*Reusable as:* Highlighting specific regions of interest in an image.  
*Build:* A bounding box overlay with a vertical scanning line and status text.

**Bar Chart Growth** — Vertical bars grow upwards; emoji icons pop in above them.  
`scale` · up · smooth · staggered  
*Purpose:* Presents scientific data comparing treated vs natural faces.  
*Reusable as:* Visualizing any comparative statistical data.  
*Build:* An animated bar chart component where bars scale vertically and labels fade in.

**Flowchart Arrow Draw** — Downward arrows draw on, and text blocks slide down in columns.  
`draw-on` · down · smooth · staggered  
*Purpose:* Illustrates the negative impact of disclosing cosmetic procedures.  
*Reusable as:* Showing cause-and-effect relationships or step-by-step flows.  
*Build:* A flowchart component with animated directional arrows and staggered text blocks.

**Split Face Comparison** — Two labeled versions of the same face slide slightly apart.  
`translate` · outward · smooth  
*Purpose:* Compares the perception of 'natural' vs 'enhanced' versions of a face.  
*Reusable as:* Before/after comparisons or product variations.  
*Build:* A dual-panel split comparison component that slides outward from a central seam.

**Slider Rating Pointer** — A pointer moves along a horizontal scale, changing the numeric value.  
`translate` · left-to-right · smooth  
*Purpose:* Quantifies the shift in social perception.  
*Reusable as:* Showing ratings, scores, or adjustments on a scale.  
*Build:* A horizontal slider scale with an animated indicator and dynamic value display.

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Chat Bubble Pop | `ChatThread` | Represents a quote or internal thought about cosmetic work. |
| Celebrity Montage | `Montage` | Shows examples of public figures who disclosed cosmetic work. |
| Step Number Pop | `StepPill` | Introduces a multi-part evaluation concept. |

## What to steal, ranked

1. Slider Rating Pointer
2. Grid Scan Overlay
3. Flowchart Arrow Draw

## Timeline — every animation instance (32)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `fade` | Title text and split image of Bella Ha | Should you lie about getting work done? / Be |
| 1.0s | `fade` | Name label | BELLA HADID, AMERICAN MODEL |
| 2.0s | `fade` | Subtitle text | and it makes you more attractive, |
| 3.0s | `scale` | Speech bubble graphic | I got cosmetic work done.... |
| 7.0s | `cut` | Megan Fox image and scanning overlay | MEGAN FOX, AMERICAN ACTRESS / EVALUATING... |
| 10.0s | `fade` | Text overlay | Enhanced |
| 11.0s | `scale` | Rating tags and icons | FAVORABLE |
| 13.0s | `fade` | Citation text panel | Jaeger, B., Bucker, B., van der Meulen, J.,  |
| 14.0s | `translate` | Chart axis and treated bar graph | RATING / ATTRACTIVENESS |
| 18.0s | `translate` | Chart bar | DESIRABILITY |
| 20.0s | `fade` | Dashed bracket line | SHORT TERM DATING |
| 24.0s | `translate` | Chart bar and bracket | LONG TERM DATING / CAPABILITY |
| 26.0s | `scale` | Phone frame graphic | Cosmetic enhancement: disclosed |
| 27.0s | `scale` | Chat bubble | Did she get something done..... |
| 28.0s | `scale` | Chat bubble | Feels artificial! |
| 29.0s | `cut` | Video frame and caption text | The Disclosure Effect / ALIX EARLE, AMERICAN |
| 31.0s | `cut` | Video snippet | ARIANA GRANDE, AMERICAN SINGER |
| 32.0s | `cut` | Video snippet | KYLIE JENNER, AMERICAN MEDIA PERSONALITY |
| 34.0s | `fade` | Dual column comparison diagram | Liang, F. et al. (2023) / PROCEDURES UNDISCL |
| 35.0s | `scale` | Trait comparison boxes | TRUSTWORTHINESS |
| 36.0s | `scale` | Trait comparison boxes | WARMTH |
| 37.0s | `scale` | Trait comparison boxes | AUTHENTICITY |
| 38.0s | `cut` | Title text and photo pair | Same face, different perception |
| 40.0s | `translate` | Ribbon labels | NATURAL / ENHANCED |
| 42.0s | `fade` | Text and numbered steps | Dual evaluation / 1 / 2 |
| 45.0s | `translate` | Illustrated card | FACE |
| 46.0s | `translate` | Illustrated card | COSMETIC WORK |
| 49.0s | `cut` | Photo card and title | Subtle work undisclosed / CHARLIZE THERON, S |
| 52.0s | `scale` | Rating slider and speech bubbles | She looks good / This is nice!!! |
| 55.0s | `translate` | Title text and slider marker | Subtle work disclosed |
| 57.0s | `fade` | Speech bubbles | Looks good but feels off... / idk something  |
| 62.0s | `fade` | Logo, search bar, and CTA text | You're Curious? / Get your Facial Analysis / |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | stacked portrait comparison | before/after labels, text bubbles |
| 6.0s | 180 | transition | portrait with overlay | scanning graphic, rating badges |
| 13.0s | 390 | transition | chart panel | bar chart, academic citation |
| 26.0s | 780 | transition | phone mockup | phone frame, syringe icons, text bubbles |
| 29.0s | 870 | transition | portrait frame with title | celebrity video clips, title card |
| 34.0s | 1020 | transition | split comparison diagram | flowchart, academic citation |
| 38.0s | 1140 | transition | side-by-side portrait comparison | comparison labels |
| 41.0s | 1230 | transition | diagram panel | line art illustration, icon graphics |
| 49.0s | 1470 | transition | portrait with interactive slider | slider scale, text bubbles |
| 61.0s | 1830 | transition | centered text with search bar | search bar graphic, brand logo |

## Narrative arc

1. Introduce the core question: does disclosing cosmetic work reduce attractiveness?
2. Present evidence showing cosmetic work itself slightly improves first impressions.
3. Introduce the 'Disclosure Effect' where revealing work lowers perceived warmth and trustworthiness.
4. Explain the dual evaluation theory (evaluating both the face and the social meaning of surgery).
5. Demonstrate how disclosure offsets the visual benefits of subtle work.
6. Call to action for personal facial analysis.

## Devices (18)

Text Bubbles, academic citation, Before/After Labels, scanning graphic, rating badges, bar chart, phone frame, syringe icons, celebrity video clips, title card, flowchart, comparison labels, line art illustration, icon graphics, slider scale, search bar graphic, brand logo, Interactive Slider
