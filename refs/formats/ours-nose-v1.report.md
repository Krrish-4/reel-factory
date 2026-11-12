# ours-nose-v1

**evidence explainer** — This ad uses a visual illusion and data visualization to show how chin position affects nose perception, promoting an AI facial preview tool.

52.395s · 1080x1920 @30.0

## Animation language

- **signature moves** — SliderReveal for direct comparisons, ContourDraw for highlighting regions, DivergePanels for side-by-side results
- **how things enter** — Elements fade or scale up smoothly in place.
- **how things leave** — Elements fade out or are wiped away by transitions.
- **how scenes change** — Hard cuts or slider wipes transition between scenes.
- **what stays still** — The central portrait remains anchored throughout most of the video.
- **rhythm** — Bursty, with moments of stillness followed by quick, informative transitions.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 93.4% |
| element arrivals / min | 5.7 |
| hard cuts | 1 (1.1/min) |
| median shot | 26.17s |
| transitions | 0 (median Nones) |
| speech | 66.4% |
| scene changes that are cuts | 50.0% (1 of 2) |
| ground | `#A1B4B9` flat=True |

## Animations (6)

3 we can already build · **3 we cannot**

### Would need building

**AnimatedBarChart** — Vertical bars and numeric labels  
`scale` · up · elastic · staggered  
*Purpose:* Displays quantitative data of pixel changes per facial region.  
*Reusable as:* Showing statistics, performance metrics, or survey results.  
*Build:* AnimatedBarChart with growing bars and counting labels

**DivergePanels** — Single portrait splitting into side-by-side comparison  
`translate` · left-to-right · smooth  
*Purpose:* Shows the original and modified faces side-by-side for final comparison.  
*Reusable as:* Comparing two distinct variations of a product or design.  
*Build:* DivergePanels to split and slide a single asset into two panels

**TypewriterSearchBar** — Search bar container and typed text  
`scale` · outward · snappy · staggered  
*Purpose:* Prompts the user to search for the brand name.  
*Reusable as:* Call-to-action for search engines or app stores.  
*Build:* TypewriterSearchBar with scaling container and simulated typing

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| SliderReveal | `SliderReveal` | Compares before/after states of the face directly. |
| ContourDraw | `ContourDraw` | Highlights the specific area of the face that was modified. |
| AnimatedCheckList | `AnimatedCheckList` | Guides the user through a step-by-step interactive test. |

## What to steal, ranked

1. DivergePanels for elegant side-by-side comparisons from a single asset source
2. AnimatedBarChart for clean, dynamic data visualization in short-form ads
3. TypewriterSearchBar for engaging call-to-actions

## Timeline — every animation instance (18)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `translate` | vertical line |  |
| 1.0s | `fade` | text | Same face. Same nose. Same woman, twice. |
| 3.0s | `fade` | text | Same nose, both photographs. |
| 7.0s | `fade` | text and oval outline | One thing moved, CHIN AUGMENTATION, CHIN AND |
| 7.0s | `translate` | horizontal line |  |
| 11.0s | `fade` | text and face image | Where it moved, PER-REGION PIXEL CHANGE, THI |
| 14.0s | `scale` | bar chart | 44.0 JAW, 18.7 EYES, 17.1 LIPS, 9.7 NOSE |
| 14.0s | `fade` | text | Almost none of it is on her nose. |
| 16.0s | `fade` | text and dashed circles | Read against each other, STANDS OUT, SITS BA |
| 23.0s | `translate` | text and vertical line | It didn't shrink, Your brain calls it a big  |
| 31.0s | `cut` | screen background and text | Try it now, DO THIS NOW, Your nose just got  |
| 31.0s | `fade` | list item | 1 Push your lower jaw forward |
| 32.0s | `fade` | list item | 2 Hold it there |
| 33.0s | `fade` | list item | 3 Watch your nose |
| 37.0s | `cut` | screen background, face image, and tex | ONE FILE, ONE REGION EDITED, Not one feature |
| 39.0s | `translate` | face image |  |
| 44.0s | `cut` | screen background, search bar, and tex | Your face. Not hers. A preview, not a promis |
| 47.0s | `draw-on` | search bar text | Refina AI |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed portrait with split-screen slider | split-screen slider, pixel change heatmap, bar chart |
| 37.0s | 1110 | transition | two-panel portrait grid | side-by-side comparison |
| 44.0s | 1320 | transition | centered text with UI mockup | search bar mockup |

## Narrative arc

1. Present a visual paradox involving nose size.
2. Reveal that chin adjustment, not nose reduction, caused the change.
3. Provide data-driven proof of pixel changes.
4. Explain the psychological optical illusion of facial comparison.
5. Prompt the viewer to perform a physical test to experience the illusion.
6. Introduce the AI preview tool as the solution to test this on themselves.

## Devices (5)

split-screen slider, pixel change heatmap, bar chart, search bar mockup, side-by-side comparison
