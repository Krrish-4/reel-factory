# ours-size-v3

**evidence explainer** — The video uses a split-screen analysis of Sydney Sweeney's face to explain that lip aesthetics are about facial proportions, promoting Refina AI to preview these changes.

68.437s · 1080x1920 @30.0

## Animation language

- **signature moves** — SliderReveal for real-time morphing, DrawnCallout lines for anatomical measurements, ConvergePanels for multi-angle transitions
- **how things enter** — Elements fade in place or draw on as vector lines.
- **how things leave** — Elements fade out or are wiped away by transitions.
- **how scenes change** — Hard cuts or sliding panel transitions.
- **what stays still** — The central portrait of the model remains anchored.
- **rhythm** — Deliberate and educational, pausing on static diagrams before animating comparisons.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 94.6% |
| element arrivals / min | 2.6 |
| hard cuts | 6 (5.3/min) |
| median shot | 6.83s |
| transitions | 0 (median Nones) |
| speech | 67.0% |
| scene changes that are cuts | 75.0% (6 of 8) |
| ground | `#A1B4B9` flat=True |

## Animations (6)

5 we can already build · **1 we cannot**

### Would need building

**Search Bar Typing** — Text characters appearing sequentially in a search input field  
`stagger` · left-to-right · mechanical · staggered  
*Purpose:* Simulates typing a brand name into a search engine for a call to action.  
*Reusable as:* Any search-based call to action or typing simulation.  
*Build:* Typewriter text input effect inside a styled search bar component

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Measurement Line Draw | `DrawnCallout` | Establishes anatomical reference points (nose base, lip edge, chin) to explain facial prop |
| Gap Highlight Box | `ContourDraw` | Focuses viewer attention on the spatial gap between the nose and chin. |
| Split Screen Comparison | `SliderReveal` | Directly contrasts the visual impact of thin versus full lips on the same face. |
| Interactive Slider Demo | `SwipeCursor` | Simulates an interactive app experience showing real-time morphing. |
| Profile Merge | `ConvergePanels` | Transitions from a 3D profile view back to a flat front-facing comparison. |

## What to steal, ranked

1. Interactive Slider Demo: Highly engaging way to show real-time morphing or adjustments.
2. Measurement Line Draw: Clean, scientific way to annotate and explain visual proportions.

## Timeline — every animation instance (29)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `fade` | Text 'It was', 'Think your lips', 'AI  | It was, Think your lips, AI PREVIEW - NOT ME |
| 1.0s | `cut` | Text 'It was never about size' and 'PH | It was never about size, PHOTOGRAPH, UNMODIF |
| 5.0s | `fade` | Text 'Lips are' | Lips are |
| 6.0s | `fade` | Text 'The lower third is read from her | The lower third is read from here, NOSE BASE |
| 7.0s | `fade` | Text 'They are the line the lower face | They are the line the lower face is measured |
| 11.0s | `fade` | Text 'Your eye reads gaps', 'THE GAP,  | Your eye reads gaps, THE GAP, NOT THE PART,  |
| 15.0s | `fade` | Text 'It measures the gaps around it.' | It measures the gaps around it. |
| 18.0s | `scale` | Text 'Move the lip line and every gap  | Move the lip line and every gap moves. |
| 23.0s | `wipe` | Text '1. The gap above', 'NOSE BASE TO | 1. The gap above, NOSE BASE TO LIP EDGE, MEA |
| 27.0s | `fade` | Text 'Full lips make it short. Thin li | Full lips make it short. Thin lips, long. |
| 30.0s | `fade` | Text 'The nose isn't what changed.' | The nose isn't what changed. |
| 33.0s | `cut` | Text '2. The chin below', 'PHOTOGRAPH, | 2. The chin below, PHOTOGRAPH, UNMODIFIED, T |
| 35.0s | `fade` | Text 'The chin isn't what changed eith | The chin isn't what changed either. |
| 37.0s | `cut` | Text 'One face, two volumes', 'THE GAP | One face, two volumes, THE GAP, THIN, FULL,  |
| 38.0s | `translate` | Slider handle and face lips | One face, two volumes |
| 41.0s | `fade` | Text 'Watch the gap, not the lips.' | Watch the gap, not the lips. |
| 44.0s | `cut` | Text 'The view that hides it', 'SIDE V | The view that hides it, SIDE VIEW, GENERATED |
| 44.5s | `rotate` | Face model | The view that hides it |
| 45.0s | `fade` | Text 'A front photograph hides it.' | A front photograph hides it. |
| 47.0s | `cut` | Text 'Not better. Load-bearing.', 'ONE | Not better. Load-bearing., ONE FILE, ONE REG |
| 49.0s | `fade` | Text 'It means lips are load-bearing.' | It means lips are load-bearing. |
| 51.0s | `fade` | Text 'On many faces, less is the chang | On many faces, less is the change. |
| 54.0s | `cut` | Text 'DO THIS NOW' and 'Do it now.' | DO THIS NOW, Do it now. |
| 55.0s | `fade` | Text 'Try it now', '1 Roll your lips i | Try it now, 1 Roll your lips inward, 2 Hold  |
| 57.0s | `fade` | Text 'Watch your chin arrive.' | Watch your chin arrive. |
| 59.0s | `cut` | Text 'Your face. Not that one.', 'A pr | Your face. Not that one., A preview, not a p |
| 61.0s | `fade` | Text 'See it on your own face first.' | See it on your own face first. |
| 64.0s | `draw-on` | Text 'Refina AI' | Refina AI |
| 66.0s | `fade` | Text 'Search Refina AI' | Search Refina AI |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed portrait | text overlay |
| 5.367s | 161 | yes | full-bleed portrait with overlays | measurement lines, text callouts |
| 22.767s | 683 | yes | split-screen vertical | split-screen slider, dimension labels |
| 32.467s | 974 | yes | full-bleed portrait with overlay | circular highlight overlay |
| 37.0s | 1110 | yes | split-screen vertical with slider | interactive slider UI |
| 43.833s | 1315 | yes | split-screen vertical | profile comparison |
| 47.4s | 1422 | yes | side-by-side portrait | dual portrait comparison |
| 54.0s | 1620 | transition | text-only screen | numbered list |
| 58.0s | 1740 | transition | text-only screen with UI mockup | search bar mockup |

## Narrative arc

1. Challenge the viewer's perception of thin lips.
2. Introduce the concept of facial proportions and 'gaps'.
3. Demonstrate how changing lip size alters the perception of the nose and chin.
4. Provide an interactive physical exercise for the viewer to experience the effect.
5. Introduce the product as a tool to preview these changes on the viewer's own face.

## Devices (11)

split-screen slider, measurement lines, search bar mockup, text overlay, text callouts, dimension labels, circular highlight overlay, interactive slider UI, profile comparison, dual portrait comparison, numbered list
