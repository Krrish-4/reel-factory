# ours-ratio-v3

**interactive explainer** — Demonstrates how facial features are perceived holistically rather than in isolation, using chin and eyelid adjustments as examples.

92.288s · 1080x1920 @30.0

## Animation language

- **signature moves** — SliderReveal for before/after comparisons, DrawnCallout for technical anatomical highlights, TrimPath for structural grid overlays
- **how things enter** — Elements draw on as vector paths or fade in place cleanly.
- **how things leave** — Elements fade out or are replaced by the next visual state.
- **how scenes change** — Hard cuts between different subjects and analytical modes.
- **what stays still** — The primary portrait subjects remain centered and static.
- **rhythm** — Deliberate and educational, matching the explanatory voiceover.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 96.5% |
| element arrivals / min | 13.7 |
| hard cuts | 12 (7.8/min) |
| median shot | 6.37s |
| transitions | 3 (median 0.3s) |
| speech | 94.5% |
| scene changes that are cuts | 100.0% (12 of 7) |
| ground | `#4A575D` flat=False |

## Animations (10)

10 we can already build · **0 we cannot**

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Before-After Slider | `SliderReveal` | Demonstrates subtle chin augmentation by comparing before and after states. |
| Nose Highlight Callout | `DrawnCallout` | Directs viewer attention to the nose area to address common misconceptions. |
| Feature Comparison Brackets | `DrawnCallout` | Labels which facial features were modified versus untouched. |
| Pixel Change Heatmap | `Reveal` | Visualizes exact pixel differences between before and after images. |
| Proportion Measurement Lines | `TrimPath` | Compares vertical heights of nose and chin to show spatial relationship. |
| Eyelid Highlight Callout | `DrawnCallout` | Highlights the eyelid area for the second subject's case study. |
| Facial Thirds Grid | `TrimPath` | Illustrates the rule of facial thirds and how proportions shift. |
| Facial Mesh Overlay | `ContourDraw` | Represents AI facial analysis and holistic reading of features. |
| Interactive Instructions List | `AnimatedCheckList` | Guides the user through a physical self-test. |
| Outro Search Bar | `Reveal` | Prompts the user to search for the brand name. |

## What to steal, ranked

1. Facial Thirds Grid (TrimPath) - Excellent for technical, structured breakdowns.
2. Pixel Change Heatmap (Reveal) - Highly effective way to show subtle differences.

## Timeline — every animation instance (36)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `fade` | Woman's face and text | Same nose. This is the same face twice. |
| 2.0s | `wipe` | Vertical line and text | CHIN AUGMENTATION. One thing on it was chang |
| 4.0s | `fade` | Circle and text | THE NOSE? Almost everyone points at the nose |
| 6.0s | `fade` | Text label and subtitle | NOT TOUCHED. The nose isn't what changed. |
| 8.0s | `fade` | Text label and subtitle | CHANGED. The chin is. |
| 9.0s | `fade` | Subtitle text | Your eye reads a feature against everything  |
| 13.0s | `cut` | Visual overlay and text | Every pixel that moved. This is every pixel  |
| 15.0s | `fade` | Subtitle text | Almost none of them are on the nose. |
| 17.0s | `fade` | Subtitle text | It didn't shrink. The face caught up. |
| 20.0s | `cut` | Face, vertical lines, and text | 1. Nose and chin |
| 21.0s | `fade` | Subtitle text | The nose and the chin are read as one |
| 24.0s | `fade` | Subtitle text | A chin that sits back leaves the nose out in |
| 28.0s | `fade` | Subtitle text | Bring the chin forward and the nose settles  |
| 31.0s | `fade` | Subtitle text | Same nose. Every time. |
| 34.0s | `cut` | Face and text | 2. Lid and eye |
| 35.0s | `fade` | Subtitle text | Another face. The lid and the eye. |
| 38.0s | `fade` | Circle, text label, and subtitle | THE LID. Skin resting on the lashes closes t |
| 42.0s | `fade` | Subtitle text | Lift the hood and the eye reads open. |
| 47.0s | `fade` | Subtitle text | The eye didn't grow. The cover moved. |
| 50.0s | `cut` | Face and text | 3. The thirds |
| 51.0s | `fade` | Brackets and subtitle text | A face is read in thirds. |
| 53.0s | `fade` | Blocks and labels | HAIRLINE - BROW, BROW - NOSE, NOSE - CHIN |
| 57.0s | `translate` | Blocks and subtitle text | Move one boundary and all three change. |
| 61.0s | `fade` | Mesh overlay and text | Read whole. Not in parts. |
| 62.0s | `fade` | Subtitle text | None of this tells you what to do. |
| 64.0s | `fade` | Subtitle text | It tells you why one feature can't answer it |
| 67.0s | `fade` | Subtitle text | Faces are read whole. Not feature by feature |
| 71.0s | `fade` | Text overlay | Try it now |
| 72.0s | `fade` | List item text | 1 Push your lower jaw forward. |
| 74.0s | `fade` | List item text | 2 A few millimetres. Hold it. |
| 76.0s | `fade` | List item and subtitle text | 3 Now look at your nose. Watch your nose get |
| 78.0s | `fade` | Subtitle text | You didn't touch your nose. |
| 80.0s | `fade` | Subtitle text | So the question was never one feature. |
| 81.0s | `fade` | Text overlay | A preview, not a promise. |
| 84.0s | `fade` | Subtitle text | It's what the whole face does when it moves. |
| 90.0s | `fade` | Search bar, text, and subtitle | Refina AI. See it on your own face first. |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed portrait | split-screen slider, text labels |
| 6.2s | 186 | yes | full-bleed portrait | circular highlight overlay, text labels |
| 13.033s | 391 | yes | full-bleed portrait | difference heatmap, data table overlay |
| 20.1s | 603 | yes | full-bleed portrait | measurement lines, text labels |
| 34.267s | 1028 | yes | full-bleed portrait | circular highlight overlay, text labels |
| 50.333s | 1510 | yes | full-bleed portrait | facial thirds grid, facial mesh wireframe |
| 61.733s | 1852 | yes | full-bleed portrait | numbered text list |
| 80.0s | 2400 | transition | full-bleed portrait | search bar UI mockup, text labels |

## Narrative arc

1. Introduce a visual puzzle challenging the viewer's perception of facial changes.
2. Reveal that changing the chin alters the perception of the nose.
3. Provide scientific/visual proof using pixel-change heatmaps.
4. Explain the relationship between facial features (nose/chin, lid/eye, facial thirds).
5. Engage the viewer with an interactive physical test they can do immediately.
6. Introduce the product (Refina AI) as a tool to preview these holistic changes.

## Devices (10)

text labels, circular highlight overlay, split-screen slider, difference heatmap, facial thirds grid, facial mesh wireframe, search bar UI mockup, data table overlay, measurement lines, numbered text list
