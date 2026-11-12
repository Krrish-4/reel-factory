# ours-nose-v6

**product demo** — Demonstrates how chin augmentation alters the perception of nose size using interactive visual comparisons.

50.645s · 1080x1920 @30.0

## Animation language

- **signature moves** — SliderReveal for interactive before/after comparisons, Diverge Panels to transition from split-screen to side-by-side
- **how things enter** — Elements fade in or draw on using clean vector paths.
- **how things leave** — Hard cuts or simple fades out of frame.
- **how scenes change** — Hard cuts between analytical diagrams and full-face views.
- **what stays still** — The central portrait alignment remains consistent across scenes.
- **rhythm** — Bursty, with moments of static analysis punctuated by sliding transitions.

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

3 we can already build · **3 we cannot**

### Would need building

**Bar Chart Grow** — Vertical bars representing pixel change percentages  
`scale` · upward · elastic · staggered  
*Purpose:* Quantifies which parts of the face actually changed, proving the nose was untouched.  
*Reusable as:* Displaying statistical data or feature comparisons dynamically.  
*Build:* An animated bar chart component where bars scale up from zero with stagger.

**Diverge Panels** — Two halves of the face sliding apart to reveal two full faces side-by-side  
`translate` · outward · smooth  
*Purpose:* Transitions from a single split-screen comparison to a full side-by-side comparison.  
*Reusable as:* Comparing two full-frame variations of a subject side-by-side.  
*Build:* A panel transition that splits a central image and slides the halves outward to reveal two distinct full images.

**Search Typing** — Text characters inside the search input field  
`count` · left-to-right · mechanical · staggered  
*Purpose:* Simulates a user typing the brand name into a search engine for a clear call to action.  
*Reusable as:* Any search-based call to action or typing simulation.  
*Build:* A text-typing effect with a blinking cursor inside an input field.

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| SliderReveal | `SliderReveal` | Demonstrates the subtle difference between before and after states of a chin augmentation. |
| TrimPath Callouts | `TrimPath` | Draws immediate visual focus to the specific facial regions being discussed. |
| Animated Checklist | `AnimatedCheckList` | Guides the user through an interactive physical test to prove the optical illusion. |

## What to steal, ranked

1. Diverge Panels transition for elegant split-to-dual image comparisons
2. SliderReveal with synchronized text labels for interactive product demos

## Timeline — every animation instance (36)

| t | motion | element | content |
|---|---|---|---|
| 0.5s | `wipe` | vertical divider line and image reveal | AFTER image |
| 1.0s | `fade` | text labels | Same face. Same nose. / AFTER |
| 2.0s | `fade` | bottom text | Same woman, twice. |
| 3.0s | `wipe` | vertical divider line and image reveal | AFTER image |
| 3.0s | `fade` | bottom text | Same nose, both photographs. |
| 6.0s | `cut` | scene transition | One thing moved |
| 7.0s | `fade` | annotation circle and label | CHIN AND JAW |
| 8.0s | `fade` | annotation label | CHIN AUGMENTATION |
| 9.0s | `fade` | bottom text | Her chin is what moved. |
| 11.0s | `cut` | scene transition | Where it moved |
| 11.5s | `fade` | image overlay | pixel change visualization |
| 13.0s | `translate` | bar chart | JAW (44.0), EYES (18.7), LIPS (17.3), NOSE ( |
| 13.0s | `fade` | bottom text | Almost none of it is on her nose. |
| 15.0s | `cut` | scene transition | Read against each other |
| 16.0s | `fade` | annotation circle and label | STANDS OUT |
| 17.0s | `fade` | annotation circle and label | SITS BACK |
| 17.0s | `fade` | bottom text | Your eye doesn't measure features. |
| 18.0s | `fade` | bottom text | It compares them. |
| 19.0s | `fade` | bottom text | When the chin sits back, the nose stands out |
| 22.0s | `wipe` | vertical divider line and image reveal | AFTER image |
| 22.0s | `fade` | text labels | It didn't shrink / SAME NOSE / Your brain ca |
| 24.0s | `fade` | bottom text | Bring it forward and the nose has something  |
| 25.0s | `fade` | annotation label | CHIN AUGMENTATION |
| 27.0s | `fade` | bottom text | It didn't shrink. The face caught up. |
| 29.0s | `cut` | scene transition | Try it now |
| 30.0s | `fade` | text labels | DO THIS NOW / 1 Push your lower jaw forward |
| 31.0s | `fade` | list item text | 2 Hold it there |
| 33.0s | `fade` | text labels | 3 Watch your nose / Your nose just got small |
| 35.0s | `cut` | scene transition | Not one feature. The whole face. |
| 36.0s | `fade` | text labels | ONE FILE, ONE REGION EDITED / The question w |
| 37.0s | `translate` | face images | before and after faces sliding apart |
| 39.0s | `fade` | bottom text | It's what the whole face does when one thing |
| 43.0s | `cut` | scene transition | Your face. Not hers. |
| 44.0s | `fade` | search bar and text | search bar / See it on your own face first. |
| 45.0s | `fade` | text label | A preview, not a promise. |
| 48.0s | `draw-on` | search bar text | Refina AI |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed portrait with interactive slider | split-screen slider, text labels |
| 10.967s | 329 | yes | heatmap overlay with data visualization | heatmap overlay, bar chart |
| 15.533s | 466 | yes | annotated portrait | focus circles, text callouts |
| 29.0s | 870 | transition | minimalist text list | numbered list card |
| 35.0s | 1050 | transition | dual portrait comparison | side-by-side panels |
| 42.0s | 1260 | transition | minimalist search UI | search bar mockup |

## Narrative arc

1. Hook the viewer by questioning their perception of nose size.
2. Reveal the optical illusion: only the chin was modified.
3. Provide data-driven proof using pixel-change analysis.
4. Explain the psychological mechanism of facial feature comparison.
5. Engage the viewer with a physical interactive test.
6. Introduce the product as a tool to preview these changes on their own face.

## Devices (9)

split-screen slider, heatmap overlay, bar chart, search bar mockup, text labels, focus circles, text callouts, numbered list card, side-by-side panels
