# ours-nose-v4

**evidence explainer** — Demonstrates how chin position alters nose perception using visual data and interactive exercises.

50.645s · 1080x1920 @30.0

## Animation language

- **signature moves** — Interactive slider sweeps comparing two states, Staggered bar chart growth with data visualization, Targeted contour drawing to highlight specific regions
- **how things enter** — Elements enter via smooth wipes, scale-ups, or sequential fades.
- **how things leave** — Elements typically exit via hard cuts or simple fades.
- **how scenes change** — Hard cuts separate the main analytical sections.
- **what stays still** — The base portrait of the woman remains centered and static throughout most of the video.
- **rhythm** — Bursty, with periods of static analysis punctuated by rapid transitions and data reveals.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 92.5% |
| element arrivals / min | 4.7 |
| hard cuts | 3 (3.6/min) |
| median shot | 8.8s |
| transitions | 0 (median Nones) |
| speech | 68.5% |
| scene changes that are cuts | 75.0% (3 of 4) |
| ground | `#A1B4B9` flat=True |

## Animations (5)

3 we can already build · **2 we cannot**

### Would need building

**Pixel Change Bar Chart** — Vertical bars representing pixel change percentages  
`scale` · up · elastic · staggered  
*Purpose:* Quantifies and visualizes where the most significant changes occurred on the face.  
*Reusable as:* Displaying statistical data or comparison metrics in any infographic.  
*Build:* An animated bar chart component where vertical bars scale up from zero and numerical labels count up to their final values.

**Search Bar Typing** — Text characters appearing inside a search input field  
`stagger` · left-to-right · mechanical · staggered  
*Purpose:* Creates a clear call-to-action by simulating a user typing the brand name into a search engine.  
*Reusable as:* Ending cards prompting users to search for a specific keyword or website.  
*Build:* A simulated text input component that types out a string character-by-character with an optional blinking cursor.

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Before/After Slider Sweep | `SliderReveal` | Demonstrates subtle facial changes by directly comparing before and after states side-by-s |
| Chin and Jaw Highlight | `ContourDraw` | Directs viewer attention to the specific facial region modified by the procedure. |
| Interactive Step List | `AnimatedCheckList` | Guides the user through a physical self-test to experience the visual illusion. |

## What to steal, ranked

1. SliderReveal for interactive before/after comparisons
2. Pixel Change Bar Chart for dynamic data visualization
3. ContourDraw for precise visual callouts

## Timeline — every animation instance (29)

| t | motion | element | content |
|---|---|---|---|
| 0.5s | `wipe` | Vertical divider line and 'after' phot | Same face. Same nose. |
| 1.0s | `cut` | Text label | AFTER |
| 2.0s | `fade` | Subtext | Same woman, twice. |
| 3.0s | `wipe` | Vertical divider line and 'before' pho | BEFORE |
| 4.0s | `wipe` | Vertical divider line and 'after' phot | AFTER |
| 6.0s | `cut` | Oval highlight and text | One thing moved, CHIN AND JAW |
| 8.0s | `fade` | Text label | CHIN AUGMENTATION |
| 9.0s | `fade` | Subtext | Her chin is what moved. |
| 11.0s | `cut` | Pixel change overlay and text | Where it moved, PER-REGION PIXEL CHANGE, THI |
| 12.5s | `scale` | Bar chart bars | JAW, EYES, LIPS, NOSE percentages |
| 14.0s | `fade` | Subtext | Almost none of it is on her nose. |
| 15.0s | `cut` | Comparison circles and text | Read against each other |
| 16.0s | `fade` | Dashed circle and text | STANDS OUT |
| 17.0s | `fade` | Dashed oval and text | SITS BACK |
| 22.0s | `cut` | Vertical divider line and face | It didn't shrink |
| 23.0s | `fade` | Dashed circle and text | SAME NOSE |
| 25.0s | `fade` | Text label | CHIN AUGMENTATION |
| 27.0s | `fade` | Subtext | It didn't shrink. The face caught up. |
| 29.0s | `cut` | Instruction box and text | Try it now, DO THIS NOW |
| 30.0s | `fade` | List item text | 1 Push your lower jaw forward |
| 31.0s | `fade` | List item text | 2 Hold it there |
| 33.0s | `fade` | List item text | 3 Watch your nose |
| 33.5s | `fade` | Subtext | Your nose just got smaller. You didn't touch |
| 35.0s | `cut` | Side-by-side photos and text | Not one feature. The whole face. |
| 36.0s | `fade` | Text label | ONE FILE, ONE REGION EDITED |
| 38.0s | `fade` | Subtext | It's what the whole face does when one thing |
| 43.0s | `cut` | Search bar and text | Your face. Not hers. See it on your own face |
| 45.0s | `fade` | Text | A preview, not a promise. |
| 48.0s | `draw-on` | Search input text | Refina AI |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | split-screen portrait | before-after slider, text labels |
| 10.967s | 329 | yes | data visualization overlay | pixel heatmap, bar chart |
| 15.533s | 466 | yes | annotated portrait | focus circles, text callouts |
| 29.0s | 870 | transition | minimal text list | numbered list |
| 35.0s | 1050 | transition | side-by-side portrait to search UI | side-by-side comparison, search bar mockup |

## Narrative arc

1. Challenge the viewer's perception of their nose size.
2. Reveal that chin position dictates perceived nose size.
3. Provide data-driven proof via pixel analysis.
4. Engage the viewer with an interactive physical test.
5. Introduce the AI tool as a way to preview these changes on oneself.

## Devices (9)

Pixel Heatmap, Bar Chart, Search Bar Mockup, before-after slider, text labels, focus circles, text callouts, numbered list, side-by-side comparison
