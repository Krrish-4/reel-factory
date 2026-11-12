# ours-nose-v7

**educational explainer** — Demonstrates how chin augmentation visually reduces perceived nose size using a split-screen comparison and pixel-change data.

50.645s · 1080x1920 @30.0

## Animation language

- **signature moves** — SliderReveal for interactive before/after comparison, DrawnCallout to isolate specific facial features, Staggered list reveals for interactive user prompts
- **how things enter** — Elements slide up or fade in place with clean, minimal transitions.
- **how things leave** — Elements fade out or are replaced by the next full-screen card.
- **how scenes change** — Hard cuts separate distinct conceptual beats.
- **what stays still** — The central portrait alignment remains consistent across scenes.
- **rhythm** — Deliberate and educational, pausing on key visual proofs before moving to the next point.

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

## Animations (7)

4 we can already build · **3 we cannot**

### Would need building

**Pixel Change Heatmap** — Glowing contour overlay on the face  
`fade` · none · smooth  
*Purpose:* Visualizes data showing exactly where physical changes occurred.  
*Reusable as:* Showing activity, wear, or modification zones on a 3D model or photo.  
*Build:* Glowing pixel-difference heatmap overlay

**Pixel Change Bar Chart** — Four vertical data bars  
`scale` · up · elastic · staggered  
*Purpose:* Quantifies the facial changes to prove the nose itself was untouched.  
*Reusable as:* Displaying any comparative metrics or survey results.  
*Build:* Staggered vertical bar chart growth animation

**Search Bar Typing** — Text characters inside search input  
`count` · left-to-right · mechanical  
*Purpose:* Creates a call-to-action prompting the user to search for the brand.  
*Reusable as:* Any search-based call-to-action or typing simulation.  
*Build:* Typewriter text input animation inside a search bar container

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Before-After Slider | `SliderReveal` | Demonstrates subtle facial changes by comparing before and after states directly. |
| Chin and Jaw Callout | `DrawnCallout` | Draws immediate focus to the specific area of anatomical modification. |
| Interactive Step List | `AnimatedCheckList` | Guides the viewer through a physical self-test to experience the illusion. |
| Side-by-Side Face Comparison | `ConvergePanels` | Compares the full face before and after side-by-side to show holistic impact. |

## What to steal, ranked

1. The interactive SliderReveal for immediate visual engagement.
2. The pixel-difference heatmap overlay to visualize abstract data directly on a subject.
3. The typewriter search bar CTA for a clean, actionable outro.

## Timeline — every animation instance (21)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `cut` | Initial scene setup | Same face. BEFORE |
| 1.0s | `translate` | Vertical slider line and face reveal | Same face. Same nose. AFTER |
| 3.0s | `translate` | Vertical slider line and face reveal | Same nose, both photographs. |
| 6.8s | `cut` | Scene transition | One thing moved. CHIN AND JAW |
| 8.0s | `translate` | Horizontal slider line and label | CHIN AUGMENTATION. Her chin is what moved. |
| 10.8s | `cut` | Scene transition | Where it moved. PER-REGION PIXEL CHANGE, THI |
| 12.8s | `scale` | Bar chart bars | JAW 44.0, EYES 18.7, LIPS 17.3, NOSE 9.7 |
| 15.0s | `cut` | Scene transition | Read against each other. STANDS OUT |
| 17.0s | `translate` | Horizontal slider line and circle high | SITS BACK. It compares them |
| 19.0s | `fade` | Bottom text | When the chin sits back, the nose stands out |
| 22.0s | `fade` | Bottom text | Your brain calls it a big nose. |
| 22.8s | `translate` | Vertical slider line and label | It didn't shrink. SAME NOSE |
| 24.8s | `fade` | Label text | CHIN AUGMENTATION |
| 29.0s | `cut` | Scene transition | Try it now. DO THIS NOW |
| 30.0s | `fade` | List item 1 | 1 Push your lower jaw forward |
| 31.0s | `fade` | List item 2 | 2 Hold it there |
| 32.0s | `fade` | List item 3 | 3 Watch your nose |
| 35.0s | `cut` | Scene transition | Not one feature. The whole face. ONE FILE, O |
| 36.5s | `translate` | Images sliding apart | Before and After comparison |
| 42.0s | `cut` | Scene transition | Your face. Not hers. Search |
| 45.0s | `draw-on` | Search bar text | A preview, not a promise. Refina AI |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed portrait with vertical slider | vertical slider, text labels |
| 10.967s | 329 | yes | data visualization overlay | heatmap overlay, bar chart |
| 15.533s | 466 | yes | annotated portrait | circular callouts, text labels |
| 29.0s | 870 | transition | text list on solid background | numbered list |
| 35.0s | 1050 | transition | 2-column grid | side-by-side comparison |
| 42.0s | 1260 | transition | centered text and UI elements | search bar mockup |

## Narrative arc

1. Introduce the common insecurity of a 'large nose' and challenge it with a visual comparison.
2. Reveal that only the chin was modified, leaving the nose completely untouched.
3. Provide scientific proof via pixel-change data to validate the claim.
4. Explain the optical illusion of facial proportions and how the brain compares features.
5. Engage the viewer with a physical, real-time experiment to prove the concept on themselves.
6. Direct the viewer to use the AI tool to preview these changes on their own face.

## Devices (8)

text labels, vertical slider, heatmap overlay, bar chart, search bar mockup, circular callouts, numbered list, side-by-side comparison
