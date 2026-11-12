# ours-nose-v9

**educational explainer** — Demonstrates how chin projection alters the perceived size of the nose using a split-screen comparison and an interactive physical test.

50.645s · 1080x1920 @30.0

## Animation language

- **signature moves** — SliderReveal for interactive comparison, DrawnCallout for feature highlighting, ConvergePanels in reverse for side-by-side split
- **how things enter** — Elements slide up or scale with a slight spring overshoot.
- **how things leave** — Elements fade out or slide away to make room for new content.
- **how scenes change** — Hard cuts combined with sweeping slider wipes.
- **what stays still** — The central portrait subject remains aligned across transitions.
- **rhythm** — Bursty, with periods of static explanation punctuated by quick interactive sweeps.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 83.3% |
| element arrivals / min | 23.7 |
| hard cuts | 3 (3.6/min) |
| median shot | 12.57s |
| transitions | 3 (median 0.7s) |
| speech | 68.5% |
| scene changes that are cuts | 60.0% (3 of 5) |
| ground | `#A1B3B8` flat=False |

## Animations (6)

4 we can already build · **2 we cannot**

### Would need building

**Data Bar Chart** — Vertical bars representing pixel changes  
`scale` · up · elastic · staggered  
*Purpose:* Quantifies and proves where edits were actually made.  
*Reusable as:* Displaying simple metrics or survey results in infographics.  
*Build:* GrowBars (vertical bar chart with staggered scale-up animation)

**Search Bar Typing** — Text characters inside search input  
`count` · left-to-right · mechanical  
*Purpose:* Instructs the user exactly what to search for online.  
*Reusable as:* Search bar mockups or URL typing simulations.  
*Build:* TypewriterSearch (simulated typing with blinking cursor)

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Before/After Slider | `SliderReveal` | Demonstrates subtle differences between before and after states. |
| Feature Callout Circles | `DrawnCallout` | Directs viewer attention to specific facial features being discussed. |
| Interactive Step List | `AnimatedCheckList` | Guides user through a physical test to experience the illusion. |
| Portrait Split Comparison | `ConvergePanels` | Transitions from a split-screen slider to a full side-by-side comparison. |

## What to steal, ranked

1. The interactive SliderReveal used to compare subtle image edits.
2. The reverse ConvergePanels split to transition from single to double portrait view.

## Timeline — every animation instance (35)

| t | motion | element | content |
|---|---|---|---|
| 1.0s | `translate` | Split screen slider and 'AFTER' text | AFTER |
| 2.0s | `fade` | Subtitle text | Same woman, twice. |
| 3.5s | `fade` | Subtitle text | Same nose, both photographs. |
| 6.5s | `fade` | Header text | One thing moved |
| 7.0s | `fade` | Chin highlight and label | CHIN AND JAW |
| 7.0s | `fade` | Subtitle text | But it looks smaller in the second. |
| 8.5s | `fade` | Chin augmentation label | CHIN AUGMENTATION |
| 9.0s | `fade` | Subtitle text | Her chin is what moved. |
| 11.0s | `cut` | Scene transition | Where it moved |
| 12.0s | `translate` | Bar chart and subtitle text | Here is every pixel that changed. |
| 14.0s | `translate` | Bar chart and subtitle text | Almost none of it is on her nose. |
| 15.5s | `cut` | Scene transition | Read against each other |
| 16.0s | `fade` | Nose highlight and label | STANDS OUT |
| 16.0s | `fade` | Subtitle text | Your eye doesn't measure features. |
| 17.0s | `fade` | Chin highlight and label | SITS BACK |
| 18.0s | `fade` | Subtitle text | It compares them. |
| 19.5s | `fade` | Subtitle text | When the chin sits back, the nose stands out |
| 22.5s | `translate` | Split screen slider and highlights | SAME NOSE |
| 22.5s | `fade` | Subtitle text | Your brain calls it a big nose. |
| 24.5s | `fade` | Chin augmentation label and subtitle t | Bring it forward and the nose has something  |
| 27.0s | `fade` | Subtitle text | It didn't shrink. The face caught up. |
| 29.5s | `cut` | Scene transition | Try it now |
| 30.0s | `fade` | Instruction list item | 1 Push your lower jaw forward |
| 31.0s | `fade` | Instruction list item | 2 Hold it there |
| 32.5s | `fade` | Instruction list item | 3 Watch your nose |
| 33.0s | `fade` | Subtitle text | Your nose just got smaller. You didn't touch |
| 35.5s | `cut` | Scene transition | Not one feature. The whole face. |
| 36.0s | `translate` | Face halves | ONE FILE, ONE REGION EDITED |
| 36.0s | `fade` | Subtitle text | The question was never which feature to fix. |
| 38.5s | `fade` | Subtitle text | It's what the whole face does when one thing |
| 43.0s | `cut` | Scene transition | Your face. Not hers. |
| 43.5s | `fade` | Search input field | Search |
| 44.0s | `fade` | Subtitle text | See it on your own face first |
| 45.0s | `fade` | Header text | A preview, not a promise. |
| 48.0s | `draw-on` | Search input text | Refina AI |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed portrait with interactive slider | split-screen slider, text overlays |
| 10.967s | 329 | yes | darkened portrait with glowing pixel overlay and bar chart | pixel heatmap, bar chart overlay |
| 15.533s | 466 | yes | portrait with circular annotations and labels | circular callouts, text labels |
| 29.7s | 891 | yes | minimalist text list on solid background | numbered list UI |
| 35.5s | 1065 | transition | 2-column split portrait | side-by-side comparison |
| 43.0s | 1290 | transition | minimalist search bar UI | search bar mockup |

## Narrative arc

1. Introduce the optical illusion of nose size vs. chin projection.
2. Prove the illusion using pixel-change data.
3. Explain the cognitive science of facial feature comparison.
4. Engage the viewer with a physical, real-time test.
5. Pitch the AI tool as a way to preview these changes on oneself.

## Devices (9)

split-screen slider, pixel heatmap, circular callouts, search bar mockup, text overlays, bar chart overlay, text labels, numbered list UI, side-by-side comparison
