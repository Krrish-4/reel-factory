# ours-nose-v5

**evidence explainer** — The video demonstrates how chin augmentation alters the perception of nose size using a split-screen comparison and an interactive physical exercise.

50.645s · 1080x1920 @30.0

## Animation language

- **signature moves** — Smooth before/after slider sweeps, Data-driven bar chart growth, Symmetrical panel convergence
- **how things enter** — Elements fade in place or slide smoothly from the edges.
- **how things leave** — Elements fade out or are displaced by incoming panels.
- **how scenes change** — Hard cuts separate distinct analytical phases.
- **what stays still** — The primary portrait alignment and core UI framing.
- **rhythm** — Bursty, alternating between static analytical holds and sudden motion sweeps.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 91.8% |
| element arrivals / min | 4.7 |
| hard cuts | 3 (3.6/min) |
| median shot | 8.8s |
| transitions | 0 (median Nones) |
| speech | 68.5% |
| scene changes that are cuts | 60.0% (3 of 5) |
| ground | `#A1B4B9` flat=True |

## Animations (6)

4 we can already build · **2 we cannot**

### Would need building

**Pixel Change Heatmap & Bar Chart** — Heatmap overlay on face and vertical data bars  
`draw-on` · up · mechanical · staggered  
*Purpose:* Quantifies and visualizes where the actual image differences lie.  
*Reusable as:* Displaying statistical breakdowns or performance metrics.  
*Build:* An animated bar chart where vertical bars grow upwards to represent data percentages

**Search Input Typing** — Text characters inside search bar  
`draw-on` · left-to-right · mechanical  
*Purpose:* Creates a clear call-to-action by simulating a search query.  
*Reusable as:* Outro sequences directing users to search for a specific brand or keyword.  
*Build:* A simulated typing effect inside a search input field with a blinking cursor

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Before/After Slider Reveal | `SliderReveal` | Demonstrates subtle facial changes by sweeping between before and after states. |
| Chin/Jaw Highlight & Label | `DrawnCallout` | Draws immediate visual focus to the specific area of anatomical change. |
| Interactive Step List | `AnimatedCheckList` | Guides the viewer through a physical self-test sequence. |
| Converging Face Panels | `ConvergePanels` | Compares the isolated half-face with the full-face context. |

## What to steal, ranked

1. SliderReveal for interactive before/after comparisons
2. ConvergePanels for split-screen merging effects
3. Animated bar chart growth for data visualization

## Timeline — every animation instance (25)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `translate` | Split-screen slider line | Visual transition between before and after |
| 1.0s | `fade` | Text label | Same nose. AFTER |
| 2.0s | `fade` | Subtext label | Same woman, twice. |
| 3.0s | `translate` | Split-screen slider line | Visual transition back to before |
| 4.0s | `fade` | Subtext label | Same nose, both photographs. |
| 7.0s | `fade` | Text and oval graphic | One thing moved, CHIN AND JAW |
| 8.0s | `fade` | Text label | CHIN AUGMENTATION |
| 11.0s | `cut` | Entire scene | Where it moved |
| 12.0s | `fade` | Subtext label | PER-REGION PIXEL CHANGE, THIS PAIR |
| 13.0s | `scale` | Bar chart columns | 43.9 JAW, 9.6 EYES |
| 14.0s | `scale` | Bar chart columns | 44.0 JAW, 18.7 EYES, 17.3 LIPS, 9.7 NOSE |
| 16.0s | `cut` | Entire scene | Read against each other, STANDS OUT |
| 17.0s | `fade` | Text and circle graphic | SITS BACK |
| 22.0s | `fade` | Header text | It didn't shrink |
| 23.0s | `fade` | Text and circle graphic | SAME NOSE |
| 24.0s | `fade` | Text label | CHIN AUGMENTATION |
| 30.0s | `cut` | Entire scene | Try it now, DO THIS NOW |
| 31.0s | `fade` | List item | 1 Push your lower jaw forward |
| 31.5s | `fade` | List item | 2 Hold it there |
| 33.0s | `fade` | List item | 3 Watch your nose |
| 36.0s | `cut` | Entire scene | Not one feature. The whole face. ONE FILE, O |
| 37.0s | `translate` | Face images | Before and after comparison |
| 43.0s | `cut` | Entire scene | Your face. Not hers. Search |
| 44.0s | `draw-on` | Search input text | Refina AI |
| 45.0s | `fade` | Text label | A preview, not a promise. |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | split-screen portrait | sliding comparison line, text labels |
| 10.967s | 329 | yes | data visualization overlay | heatmap overlay, bar chart |
| 15.533s | 466 | yes | annotated portrait | circular annotations, text callouts |
| 29.0s | 870 | transition | text list | numbered list UI |
| 35.0s | 1050 | transition | side-by-side portrait | dual portrait layout |
| 43.0s | 1290 | transition | search bar UI | interactive search bar |

## Narrative arc

1. Introduce the optical illusion of nose size vs. chin position.
2. Provide data-driven proof that only the chin was modified.
3. Explain the psychological and visual science behind facial proportions.
4. Engage the viewer with an interactive physical test to prove the concept.
5. Conclude with a call to action to try the AI preview tool on their own face.

## Devices (9)

sliding comparison line, heatmap overlay, bar chart, interactive search bar, text labels, circular annotations, text callouts, numbered list UI, dual portrait layout
