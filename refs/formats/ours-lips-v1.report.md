# ours-lips-v1

**evidence explainer** — This ad demonstrates how lip augmentation alters overall facial proportions using precise visual measurements and a physical interactive test.

61.696s · 1080x1920 @30.0

## Animation language

- **signature moves** — SliderReveal comparison sweeps, Diverging split-screen panels
- **how things enter** — Elements fade in or draw on horizontally.
- **how things leave** — Elements fade out or slide away.
- **how scenes change** — Hard cuts between different subjects and diagrams.
- **what stays still** — The central portrait alignment remains fixed.
- **rhythm** — Bursty, alternating between static analysis and sliding transitions.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 94.5% |
| element arrivals / min | 1.0 |
| hard cuts | 7 (6.8/min) |
| median shot | 7.37s |
| transitions | 1 (median 0.27s) |
| speech | 92.8% |
| scene changes that are cuts | 100.0% (7 of 7) |
| ground | `#A1B4B9` flat=True |

## Animations (5)

3 we can already build · **2 we cannot**

### Would need building

**Split Face Divergence** — Two halves of a face sliding apart  
`translate` · outward · smooth  
*Purpose:* Contrasts unedited and edited versions side-by-side.  
*Reusable as:* Comparing two variations of a portrait.  
*Build:* DivergePanels

**Search Bar Typing** — Text characters inside search input  
`draw-on` · left-to-right · mechanical  
*Purpose:* Directs users to search for the brand name.  
*Reusable as:* Search bar inputs or typing indicators.  
*Build:* TypingInput

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Before/After Slider Sweep | `SliderReveal` | Compares unedited and edited face regions directly. |
| Proportion Measurement Lines | `TrimPath` | Demonstrates how facial proportions are calculated. |
| Pixel Difference Heatmap & Stats | `TagStack` | Quantifies visual changes per facial region. |

## What to steal, ranked

1. Split Face Divergence for side-by-side portrait comparisons
2. Proportion Measurement Lines for technical overlay effects

## Timeline — every animation instance (33)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `none` | Woman's face and introductory text | One region changed, AI PREVIEW - NOT MEDICAL |
| 2.0s | `wipe` | Vertical slider line and edited face | One region edited. |
| 4.0s | `fade` | Top and bottom text | LIP AUGMENTATION, Only her mouth was edited. |
| 5.0s | `fade` | Bottom text | Look how much of her changed. |
| 8.0s | `cut` | Face with horizontal lines and text | The lower third is read from here, NOSE BASE |
| 10.0s | `fade` | Bottom text | They are what the lower third is measured fr |
| 12.0s | `cut` | Dark face with highlighted lips and te | THIS PAIR, PER-PIXEL DIFFERENCE |
| 13.0s | `fade` | Top boxes and bottom text | Where the pixels moved, LIPS 51.7, EYES 13.3 |
| 15.0s | `fade` | Bottom text | Almost all of it is the mouth. |
| 17.0s | `fade` | Bottom text | Almost none of it is anywhere else. |
| 20.0s | `cut` | Split-screen face and text | 1. The gap shortens, NOSE BASE TO LIP EDGE,  |
| 21.0s | `fade` | Brackets and labels | THIN, FULL |
| 23.0s | `fade` | Bottom text | Thin lips make it long. Full lips, short. |
| 27.0s | `fade` | Bottom text | Same nose. |
| 29.0s | `cut` | Asian woman's face and text | 2. Her too, SECOND SUBJECT, LIP AUGMENTATION |
| 31.0s | `fade` | Bottom text | Same result. |
| 33.0s | `cut` | Split-screen face and text | LIP EDGE TO CHIN, MEASURED |
| 34.0s | `fade` | Top text | 3. The same chin |
| 35.0s | `fade` | Brackets and bottom text | SAME, SAME, Her chin looks stronger. |
| 37.0s | `fade` | Bottom text | It is the same chin. |
| 38.0s | `fade` | Bottom text | You are reading it against a new mouth. |
| 42.0s | `cut` | Woman's face and text | ONE FILE, ONE REGION EDITED |
| 43.0s | `fade` | Top text | Not better. Load-bearing. |
| 44.0s | `wipe` | Original face sliding in on the left | Original vs edited face comparison |
| 45.0s | `fade` | Bottom text | It means lips are load-bearing. |
| 47.0s | `cut` | Grey background and text | Try it now, DO THIS NOW |
| 48.0s | `fade` | Instruction text | 1 Roll your lips inward, Roll your lips inwa |
| 49.0s | `fade` | Instruction text | 2 Hold it |
| 50.0s | `fade` | Instruction text | 3 Watch your chin, Watch your chin arrive. |
| 52.0s | `cut` | Search bar and text | Your face. Not hers., A preview, not a promi |
| 53.0s | `fade` | Search bar placeholder | Search |
| 57.0s | `draw-on` | Search bar input | Refina AI |
| 59.0s | `fade` | Bottom text | Search Refina AI. |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed portrait | split-screen slider, measurement lines |
| 12.467s | 374 | yes | darkened portrait with heatmap overlay | pixel difference heatmap, data chips |
| 19.667s | 590 | yes | split portrait | measurement lines |
| 28.867s | 866 | yes | full-bleed portrait | measurement lines |
| 33.233s | 997 | yes | split portrait | measurement lines |
| 42.267s | 1268 | yes | side-by-side split portrait |  |
| 46.567s | 1397 | yes | minimalist text on solid background |  |
| 51.0s | 1530 | transition | minimalist text with search input UI | search bar mockup |

## Narrative arc

1. Introduce the concept of 'load-bearing' facial features.
2. Provide per-pixel proof that only the lips were modified.
3. Explain the geometric relationship between lips, nose, and chin.
4. Validate the findings with a second subject.
5. Engage the viewer with a physical self-test.
6. Introduce the app as the solution to preview these changes safely.

## Devices (5)

measurement lines, split-screen slider, pixel difference heatmap, data chips, search bar mockup
