# ours-nose-v3

**evidence explainer** — Demonstrates how chin augmentation alters the perception of nose size using visual comparisons and pixel-change data.

50.645s · 1080x1920 @30.0

## Animation language

- **signature moves** — Horizontal slider reveal for direct comparison, Drawn callouts highlighting specific facial regions
- **how things enter** — Elements fade in place or slide in smoothly from the edges.
- **how things leave** — Elements typically fade out or are replaced by a hard cut.
- **how scenes change** — Hard cuts separate major conceptual beats.
- **what stays still** — The central portrait subject remains aligned across scenes.
- **rhythm** — Bursty, with rapid informational animations followed by static pauses for reading.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 92.5% |
| element arrivals / min | 4.7 |
| hard cuts | 3 (3.6/min) |
| median shot | 8.8s |
| transitions | 0 (median Nones) |
| speech | 68.5% |
| scene changes that are cuts | 100.0% (3 of 3) |
| ground | `#A1B4B9` flat=True |

## Animations (7)

4 we can already build · **3 we cannot**

### Would need building

**Chin Region Highlight** — Oval outline and horizontal sweep line  
`draw-on` · downward · mechanical · staggered  
*Purpose:* Draws immediate focus to the specific area of the face that was modified.  
*Reusable as:* Highlighting specific UI elements or product features in a demo.  
*Build:* RegionHighlight with sweeping scan line

**Growing Bar Chart** — Vertical chart bars  
`scale` · upward · snappy · staggered  
*Purpose:* Quantifies the pixel changes to prove scientifically where the modification occurred.  
*Reusable as:* Displaying survey results, performance metrics, or data comparisons.  
*Build:* AnimatedBarChart

**Search Input Typing** — Text characters inside search bar  
`draw-on` · left-to-right · mechanical  
*Purpose:* Prompts the user to search for the brand name on the web.  
*Reusable as:* Call-to-action screens directing users to search or visit a URL.  
*Build:* TypingSearchInput

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Before/After Slider | `SliderReveal` | Demonstrates subtle facial changes by sweeping between before and after states. |
| Dashed Circle Callouts | `DrawnCallout` | Isolates the nose and chin to explain the optical illusion of size perception. |
| Interactive Step List | `AnimatedCheckList` | Guides the viewer through a physical exercise to experience the illusion firsthand. |
| Side-by-Side Panel Slide | `ConvergePanels` | Compares the full before and after faces side-by-side for final evaluation. |

## What to steal, ranked

1. Before/After Slider for interactive-feeling visual proof
2. Chin Region Highlight to direct viewer attention to subtle details
3. Growing Bar Chart to add analytical credibility to visual claims

## Timeline — every animation instance (14)

| t | motion | element | content |
|---|---|---|---|
| 1.0s | `wipe` | Split-screen divider line and 'AFTER'  | Same nose. AFTER |
| 7.0s | `cut` | Full face image with chin/jaw highligh | One thing moved. CHIN AND JAW |
| 8.0s | `fade` | Chin augmentation text label | CHIN AUGMENTATION |
| 11.0s | `cut` | Pixel change visualization overlay | Where it moved. PER-REGION PIXEL CHANGE, THI |
| 13.0s | `scale` | Bar chart elements (JAW and EYES) | 43.9 JAW, 9.6 EYES |
| 14.0s | `scale` | Expanded bar chart | 44.0 JAW, 18.7 EYES, 17.3 LIPS, 9.7 NOSE |
| 16.0s | `cut` | Face with nose and chin highlight circ | Read against each other. STANDS OUT. SITS BA |
| 23.0s | `wipe` | Split-screen divider line and 'SAME NO | SAME NOSE |
| 30.0s | `cut` | Try it now instruction screen | Try it now. DO THIS NOW. 1 Push your lower j |
| 31.0s | `fade` | Second list item | 2 Hold it there |
| 32.0s | `fade` | Third list item | 3 Watch your nose |
| 36.0s | `cut` | Side-by-side face comparison | Not one feature. The whole face. ONE FILE, O |
| 43.0s | `cut` | Outro screen with search input | Your face. Not hers. A preview, not a promis |
| 44.0s | `draw-on` | Search bar text input | Refina AI |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | portrait split-screen | sliding divider, before/after labels |
| 10.967s | 329 | yes | data overlay on portrait | pixel heatmap, bar chart |
| 29.0s | 870 | transition | text list on solid background | numbered list |
| 35.0s | 1050 | transition | side-by-side portrait to search UI | side-by-side panels, search bar mockup |

## Narrative arc

1. Identify common insecurity (nose size).
2. Deconstruct the illusion using a chin-adjustment comparison.
3. Provide data-driven proof of the optical illusion.
4. Engage the viewer with a physical, real-time experiment.
5. Introduce the AI tool as a personalized solution to preview these changes.

## Devices (7)

sliding divider, pixel heatmap, bar chart, search bar mockup, before/after labels, numbered list, side-by-side panels
