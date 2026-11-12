# ours-nose-v2

**evidence explainer** — An educational ad demonstrating how chin position alters the perceived size of the nose using visual data and interactive exercises.

50.645s · 1080x1920 @30.0

## Animation language

- **signature moves** — Interactive slider wipes, Converging split-screen panels, Staggered data bar growth
- **how things enter** — Elements fade and scale up smoothly or slide in from edges.
- **how things leave** — Hard cuts transition scenes instantly without exit animations.
- **how scenes change** — Abrupt cuts divide major conceptual beats.
- **what stays still** — The central portrait alignment and background color remain constant.
- **rhythm** — Bursty, alternating between static analytical frames and fluid motion sweeps.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 93.1% |
| element arrivals / min | 4.7 |
| hard cuts | 3 (3.6/min) |
| median shot | 8.8s |
| transitions | 0 (median Nones) |
| speech | 68.5% |
| scene changes that are cuts | 60.0% (3 of 5) |
| ground | `#A1B4B9` flat=True |

## Animations (5)

3 we can already build · **2 we cannot**

### Would need building

**Pixel Change Chart** — Vertical data bars  
`scale` · up · elastic · staggered  
*Purpose:* Quantifies facial changes scientifically using pixel metrics.  
*Reusable as:* Displaying comparative statistics or performance metrics.  
*Build:* AnimateBarChart (staggered vertical scaling of bar elements from a baseline)

**Search Input Simulation** — Text characters inside search bar  
`draw-on` · left-to-right · mechanical · staggered  
*Purpose:* Guides user to search for the brand name online.  
*Reusable as:* Simulating user input or typing in a UI mockup.  
*Build:* TypewriterInput (sequential character rendering with cursor)

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Slider Reveal | `SliderReveal` | Demonstrates subtle before-and-after facial structure differences. |
| Feature Callouts | `DrawnCallout` | Draws immediate focus to the specific jawline area modified. |
| Converging Face Panels | `ConvergePanels` | Visually merges separate states to show holistic facial harmony. |

## What to steal, ranked

1. SliderReveal for interactive before-and-after comparisons
2. ConvergePanels for dramatic split-screen merging effects
3. AnimateBarChart for clean, engaging data visualization

## Timeline — every animation instance (37)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `translate` | vertical line | visual divider |
| 1.0s | `fade` | subtitle text | Same face. Same nose. |
| 2.0s | `fade` | subtitle text | Same woman, twice. |
| 3.0s | `fade` | subtitle text | Same nose, both photographs. |
| 3.0s | `translate` | vertical line | visual divider |
| 7.0s | `fade` | title text and highlight overlay | One thing moved / CHIN AND JAW |
| 8.0s | `fade` | label text | CHIN AUGMENTATION |
| 9.0s | `fade` | subtitle text | Her chin is what moved. |
| 11.0s | `cut` | scene | Where it moved |
| 11.0s | `fade` | data visualization bars | JAW 43.9 / EYES 9.6 |
| 14.0s | `scale` | data visualization bars | JAW 44.0 / EYES 18.7 / LIPS 17.3 / NOSE 9.7 |
| 14.0s | `fade` | subtitle text | Almost none of it is on her nose. |
| 15.0s | `cut` | scene | Read against each other |
| 16.0s | `fade` | label text and circle overlay | STANDS OUT |
| 17.0s | `fade` | label text and circle overlay | SITS BACK |
| 17.0s | `fade` | subtitle text | Your eye doesn't measure features. |
| 18.0s | `fade` | subtitle text | It compares them |
| 19.0s | `fade` | subtitle text | When the chin sits back, the nose stands out |
| 22.0s | `fade` | subtitle text | Your brain calls it a big nose. |
| 22.0s | `translate` | vertical line | visual divider |
| 23.0s | `fade` | title text and circle overlay | It didn't shrink / SAME NOSE |
| 24.0s | `fade` | subtitle text | Bring it forward and the nose has something  |
| 25.0s | `fade` | label text | CHIN AUGMENTATION |
| 27.0s | `fade` | subtitle text | It didn't shrink. The face caught up. |
| 30.0s | `cut` | scene | Try it now |
| 30.0s | `fade` | list item text | 1 Push your lower jaw forward |
| 31.0s | `fade` | list item text | 2 Hold it there |
| 32.0s | `fade` | list item text | 3 Watch your nose |
| 33.0s | `fade` | subtitle text | Your nose just got smaller. You didn't touch |
| 36.0s | `cut` | scene | Not one feature. The whole face. |
| 36.0s | `fade` | subtitle text | The question was never which feature to fix. |
| 38.0s | `fade` | subtitle text | It's what the whole face does when one thing |
| 38.0s | `translate` | image layer | before and after face comparison |
| 43.0s | `cut` | scene | Your face. Not hers. |
| 44.0s | `fade` | subtitle text | A preview, not a promise. |
| 44.0s | `draw-on` | search input text | Refina AI |
| 48.0s | `fade` | action text | Search Refina AI |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed portrait with vertical split-screen slider | sliding comparison line, text overlays |
| 10.967s | 329 | yes | darkened portrait with glowing heatmap and overlay bar chart | pixel heatmap, bar chart graphic |
| 15.533s | 466 | yes | full-bleed portrait with dotted circle overlays | dotted circle callouts, text labels |
| 29.0s | 870 | transition | centered text list on solid background | numbered list UI |
| 35.0s | 1050 | transition | dual portrait comparison | side-by-side images |
| 43.0s | 1290 | transition | centered search bar on solid background | search bar mockup |

## Narrative arc

1. Hook: Challenge the viewer's perception of their nose size.
2. Evidence: Show that chin adjustments alter nose perception using pixel data.
3. Theory: Explain the cognitive science of facial feature comparison.
4. Interactive test: Have the viewer physically test the theory on themselves.
5. Conclusion: Reframe facial aesthetics as holistic rather than feature-isolated.
6. CTA: Direct viewers to try the AI preview tool.

## Devices (9)

sliding comparison line, pixel heatmap, bar chart graphic, dotted circle callouts, search bar mockup, text overlays, text labels, numbered list UI, side-by-side images
