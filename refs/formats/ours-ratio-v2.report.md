# ours-ratio-v2

**educational explainer** — Explains facial perception and harmony using before/after comparisons to promote a facial analysis app.

92.288s · 1080x1920 @30.0

## Animation language

- **signature moves** — SliderReveal for before/after comparisons, ContourDraw for highlighting facial features, TrimPath for technical measurement lines and brackets
- **how things enter** — Elements scale up with a slight spring overshoot or draw on as clean vector paths.
- **how things leave** — Elements typically fade out or are replaced by hard cuts.
- **how scenes change** — Hard cuts between different subjects and analytical views.
- **what stays still** — The primary portrait photos remain centered and static.
- **rhythm** — Bursty and educational, with animations timed to match the voiceover explanations.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 96.5% |
| element arrivals / min | 13.7 |
| hard cuts | 12 (7.8/min) |
| median shot | 6.37s |
| transitions | 3 (median 0.3s) |
| speech | 74.7% |
| scene changes that are cuts | 100.0% (12 of 8) |
| ground | `#4A575D` flat=False |

## Animations (10)

9 we can already build · **1 we cannot**

### Would need building

**Facial Mesh Overlay** — A geometric wireframe mesh fades and draws over the face.  
`draw-on` · outward · smooth  
*Purpose:* Conveys a sense of high-tech analysis and facial scanning.  
*Reusable as:* Tech, AI, or scanning overlays on portraits or products.  
*Build:* A custom SVG wireframe mesh that draws its paths simultaneously.

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Before-After Slider | `SliderReveal` | Reveals the subtle difference between the before and after states of chin augmentation. |
| Nose Highlight Circle | `ContourDraw` | Directs the viewer's attention to the nose area to challenge their perception. |
| Feature Callouts | `DrawnCallout` | Labels which parts of the face were changed versus untouched. |
| Pixel Change Heatmap | `Montage` | Shows mathematical proof of which pixels actually changed. |
| Dimension Lines | `TrimPath` | Illustrates the proportional relationship between nose and chin height. |
| Eyelid Highlight Oval | `ContourDraw` | Focuses attention on the upper eyelid hooding. |
| Facial Thirds Brackets | `TrimPath` | Divides the face into equal thirds to explain aesthetic balance. |
| Interactive Instructions List | `AnimatedCheckList` | Guides the user through a physical test to try on their own face. |
| Search Bar and Typing | `Cursor/SwipeCursor` | Prompts the user to search for the app name. |

## What to steal, ranked

1. The SliderReveal before/after comparison tool for interactive visual demonstrations.
2. The TrimPath measurement brackets for clean, technical-looking product breakdowns.

## Timeline — every animation instance (44)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `fade` | Text 'Same nose.', 'BEFORE', 'AI PREVI | Same nose. BEFORE AI PREVIEW - NOT MEDICAL A |
| 1.0s | `fade` | Text 'One thing on it was changed.' | One thing on it was changed. |
| 2.0s | `fade` | Text 'CHIN AUGMENTATION' | CHIN AUGMENTATION |
| 4.0s | `fade` | Text 'THE NOSE?', 'Almost everyone poi | THE NOSE? Almost everyone points at the nose |
| 6.0s | `fade` | Text 'Not the nose' and 'NOT TOUCHED' | Not the nose NOT TOUCHED |
| 7.0s | `fade` | Text 'The nose isn't what changed.' | The nose isn't what changed. |
| 8.0s | `fade` | Text 'CHANGED', 'The chin is.', and a  | CHANGED The chin is. |
| 9.0s | `fade` | Text 'Your eye reads a feature against | Your eye reads a feature against everything  |
| 13.0s | `cut` | Text 'BEFORE', 'Every pixel that moved | BEFORE Every pixel that moved PER-REGION PIX |
| 15.0s | `fade` | Text 'AFTER', 'NOSE 9.7', 'EYES 16.7', | AFTER NOSE 9.7 EYES 16.7 CHIN 36.0 Almost no |
| 17.0s | `fade` | Text 'BEFORE' and 'It didn't shrink.' | BEFORE It didn't shrink. |
| 19.0s | `fade` | Text 'AFTER' and 'The face caught up.' | AFTER The face caught up. |
| 20.0s | `cut` | Text '1. NOSE-CHIN', '2. LID-EYE', '3. | 1. NOSE-CHIN 2. LID-EYE 3. THE THIRDS 1. Nos |
| 24.0s | `fade` | Text 'CHIN' label with line, and 'A ch | CHIN A chin that sits back leaves the nose o |
| 29.0s | `fade` | Text 'Bring the chin forward and the n | Bring the chin forward and the nose settles  |
| 32.0s | `fade` | Text 'Same nose. Every time.' | Same nose. Every time. |
| 34.0s | `cut` | Text 'SECOND SUBJECT - BEFORE', '2. Li | SECOND SUBJECT - BEFORE 2. Lid and eye Two.  |
| 36.0s | `fade` | Text 'SECOND SUBJECT - UPPER BLEPHAROP | SECOND SUBJECT - UPPER BLEPHAROPLASTY The li |
| 39.0s | `fade` | Text 'THE LID', a circular outline aro | THE LID Skin resting on the lashes closes th |
| 43.0s | `fade` | Text 'Lift the hood and the eye reads  | Lift the hood and the eye reads open. |
| 47.0s | `fade` | Text 'The eye didn't grow.' | The eye didn't grow. |
| 49.0s | `fade` | Text 'The cover moved.' | The cover moved. |
| 51.0s | `cut` | Text '3. The thirds', 'HAIRLINE - BROW | 3. The thirds HAIRLINE - BROW Three. A face  |
| 52.0s | `fade` | Text 'BROW - NOSE' label with line | BROW - NOSE |
| 53.0s | `fade` | Text 'NOSE - CHIN' label with line, an | NOSE - CHIN DRAWS |
| 54.0s | `fade` | Text 'Hairline to brow. Brow to nose.  | Hairline to brow. Brow to nose. Nose to chin |
| 57.0s | `fade` | Text 'Move one boundary and all three  | Move one boundary and all three change. |
| 62.0s | `cut` | Text 'Read whole. Not in parts.', 'Non | Read whole. Not in parts. None of this tells |
| 64.0s | `fade` | Text 'NOSE' | NOSE |
| 65.0s | `fade` | Text 'CHIN' and 'It tells you why one  | CHIN It tells you why one feature can't answ |
| 67.0s | `fade` | Text 'LID' | LID |
| 71.0s | `cut` | Text 'Try it now' and 'Push your lower | Try it now Push your lower jaw forward. |
| 72.0s | `fade` | Text 'YOU DIDN'T TOUCH YOUR NOSE' | YOU DIDN'T TOUCH YOUR NOSE |
| 74.0s | `fade` | Text 'A few millimetres. Hold it.' | A few millimetres. Hold it. |
| 75.0s | `fade` | Text 'Now look at your nose.' | Now look at your nose. |
| 76.0s | `fade` | Text 'Watch your nose get smaller.' | Watch your nose get smaller. |
| 77.0s | `fade` | Text 'You didn't touch your nose' | You didn't touch your nose |
| 80.0s | `cut` | Text 'A preview, not a promise.' | A preview, not a promise. |
| 81.0s | `fade` | Text 'So the question was never one fe | So the question was never one feature. |
| 82.0s | `fade` | Text 'It's what the whole face does wh | It's what the whole face does when it moves. |
| 84.0s | `fade` | Text 'A preview, not a promise.' | A preview, not a promise. |
| 87.0s | `fade` | Search bar with search icon and 'Searc | Search |
| 88.0s | `none` | Text 'Refina AI' | Refina AI |
| 89.0s | `fade` | Text 'See it on your own face first.' | See it on your own face first. |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed portrait | split-screen slider, text labels |
| 6.2s | 186 | yes | full-bleed portrait | circular highlight overlays, text labels |
| 12.8s | 384 | yes | full-bleed portrait | pixel change heatmap, data table overlay |
| 20.1s | 603 | yes | full-bleed portrait | measurement lines, text labels |
| 34.267s | 1028 | yes | full-bleed portrait | circular highlight, text labels |
| 50.333s | 1510 | yes | full-bleed portrait | vertical measurement brackets, color-coded bar chart |
| 61.733s | 1852 | yes | full-bleed portrait | 3D facial tracking mesh, feature labels |
| 71.033s | 2131 | yes | full-bleed portrait | numbered instruction list |
| 80.0s | 2400 | transition | full-bleed portrait | search bar UI mockup, text CTA |

## Narrative arc

1. Present a visual puzzle to hook the viewer.
2. Reveal the counterintuitive answer (chin changed, not nose).
3. Prove it scientifically using pixel-change data.
4. Explain the principles of facial harmony (nose-chin, lid-eye, facial thirds).
5. Provide an interactive physical test for the viewer to experience the illusion.
6. Introduce the app as a tool to preview these changes.

## Devices (14)

text labels, split-screen slider, circular highlight overlays, pixel change heatmap, data table overlay, measurement lines, vertical measurement brackets, 3D facial tracking mesh, search bar UI mockup, circular highlight, color-coded bar chart, feature labels, numbered instruction list, text CTA
