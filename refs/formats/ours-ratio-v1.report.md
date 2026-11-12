# ours-ratio-v1

**educational explainer** — Demonstrates how altering one facial feature changes the perception of others, promoting an AI facial preview tool.

92.288s · 1080x1920 @30.0

## Animation language

- **signature moves** — SliderReveal for before/after comparisons, TrimPath for technical callouts and highlights, Geometric grid overlays to convey scientific analysis
- **how things enter** — Elements draw on via stroke paths or fade in smoothly.
- **how things leave** — Elements fade out or are replaced by hard cuts.
- **how scenes change** — Hard cuts between different subjects and analytical diagrams.
- **what stays still** — The subject's face remains centered and static as overlays animate on top.
- **rhythm** — Deliberate and educational, matching the explanatory voiceover.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 98.2% |
| element arrivals / min | 3.9 |
| hard cuts | 9 (5.9/min) |
| median shot | 8.3s |
| transitions | 0 (median Nones) |
| speech | 69.9% |
| scene changes that are cuts | 100.0% (9 of 8) |
| ground | `#4A575D` flat=False |

## Animations (8)

5 we can already build · **3 we cannot**

### Would need building

**Pixel Change Heatmap** — A glowing heatmap overlay fades in, showing pixel-level changes on the face.  
`fade` · none · smooth  
*Purpose:* Visually proves that the chin, not the nose, was the only modified area.  
*Reusable as:* Visualizing data differences, motion detection, or image modifications.  
*Build:* PixelDiffReveal

**Facial Mesh Overlay** — A geometric wireframe mesh draws onto the face.  
`draw-on` · outward · smooth  
*Purpose:* Represents AI facial analysis and holistic structural reading.  
*Reusable as:* Tech-themed overlays, face tracking simulations, or 3D modeling previews.  
*Build:* WireframeMeshDraw

**Search Bar Type-In** — A search bar fades in and text types out 'Refina AI'.  
`fade` · left-to-right · mechanical · staggered  
*Purpose:* Acts as a call-to-action directing users to search for the brand.  
*Reusable as:* Standard CTA for search-based discovery in marketing campaigns.  
*Build:* SearchBarTypeIn

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Before-After Slider Reveal | `SliderReveal` | Demonstrates subtle facial changes by comparing before and after states side-by-side. |
| Nose Highlight Circle | `TrimPath` | Directs viewer attention to the nose to address common misconceptions about facial changes |
| Chin Highlight Oval | `TrimPath` | Highlights the actual area of modification (the chin) to contrast with the nose. |
| Proportion Dimension Lines | `DottedDraw` | Illustrates the spatial relationship and proportions between facial features. |
| Facial Thirds Grid | `TrimPath` | Explains the aesthetic concept of facial thirds and balance. |

## What to steal, ranked

1. Pixel Change Heatmap for showing precise visual differences
2. Facial Mesh Overlay for high-tech analytical branding
3. Proportion Dimension Lines for clean technical callouts

## Timeline — every animation instance (40)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `none` | Split-screen face comparison with text | Same nose. This is the same face twice. |
| 1.0s | `fade` | Text 'CHIN AUGMENTATION', 'BEFORE', an | CHIN AUGMENTATION, BEFORE, AI PREVIEW - NOT  |
| 2.0s | `fade` | Text 'One thing on it was changed.' | One thing on it was changed. |
| 4.0s | `fade` | Circle overlay with text 'THE NOSE?' | THE NOSE? |
| 5.0s | `fade` | Text 'Almost everyone points at the no | Almost everyone points at the nose. |
| 6.0s | `cut` | Close-up face shot with text 'Not the  | Not the nose |
| 7.0s | `fade` | Text 'NOT TOUCHED' over the nose | NOT TOUCHED |
| 8.0s | `fade` | Text 'CHANGED' over the chin and subte | CHANGED, The chin is. |
| 9.0s | `fade` | Text 'Your eye reads a feature against | Your eye reads a feature against everything  |
| 13.0s | `cut` | Heatmap visualization with text 'Every | Every pixel that moved, This is every pixel  |
| 14.0s | `fade` | Text 'PER-DESIGN PIXEL CHANGE, THIS PA | PER-DESIGN PIXEL CHANGE, THIS PAIR |
| 15.0s | `fade` | Text 'NOSE 9.7 | EYES 16.7 | CHIN 36.0 | NOSE 9.7 | EYES 16.7 | CHIN 36.0, Almost non |
| 18.0s | `fade` | Text 'It didn't shrink. The face caugh | It didn't shrink. The face caught up. |
| 20.0s | `cut` | Face shot with text '1. Nose and chin' | 1. Nose and chin, One. The nose and the chin |
| 21.0s | `fade` | Vertical line and text 'NOSE' | NOSE |
| 24.0s | `fade` | Vertical line and text 'CHIN' with sub | CHIN, A chin that sits back leaves the nose  |
| 29.0s | `morph` | Chin area of the face and subtext 'Bri | Bring the chin forward and the nose settles  |
| 32.0s | `fade` | Text 'Same nose. Every time.' | Same nose. Every time. |
| 34.0s | `cut` | Second subject face with text '2. Lid  | 2. Lid and eye, SECOND SUBJECT - BEFORE |
| 35.0s | `fade` | Text 'UPPER BLEPHAROPLASTY' and 'Two.  | UPPER BLEPHAROPLASTY, Two. Another face. The |
| 39.0s | `fade` | Oval overlay with text 'THE LID' and s | THE LID, Skin resting on the lashes closes t |
| 43.0s | `morph` | Eyelids of the second subject and subt | Lift the hood and the eye reads open. |
| 47.0s | `fade` | Text 'The eye didn't grow. The cover m | The eye didn't grow. The cover moved. |
| 50.0s | `cut` | First subject face with text '3. The t | 3. The thirds, Three. A face is read in thir |
| 51.0s | `fade` | Vertical line and text 'HAIRLINE - BRO | HAIRLINE - BROW |
| 53.0s | `fade` | Vertical line, text 'BROW - NOSE', and | BROW - NOSE, SHADE |
| 56.0s | `fade` | Vertical line and text 'NOSE - CHIN' | NOSE - CHIN |
| 57.0s | `morph` | Facial features and subtext 'Move one  | Move one boundary and all three change. |
| 61.0s | `cut` | Face mesh overlay with text 'Read whol | Read whole. Not in parts. |
| 63.0s | `fade` | Text 'NOSE | CHIN | LID' and 'None of  | NOSE | CHIN | LID, None of this tells you wh |
| 65.0s | `fade` | Text 'It tells you why one feature can | It tells you why one feature can't answer it |
| 67.0s | `fade` | Text 'Faces are read whole. Not featur | Faces are read whole. Not feature by feature |
| 71.0s | `cut` | Darkened face with text 'Try it now' a | Try it now, Push your lower jaw forward a fe |
| 72.0s | `fade` | Numbered list: '1 Push your lower jaw  | 1 Push your lower jaw forward. 2 A few milli |
| 76.0s | `fade` | Text 'Watch your nose get smaller.' | Watch your nose get smaller. |
| 78.0s | `fade` | Text 'You didn't touch your nose.' | You didn't touch your nose. |
| 80.0s | `cut` | Close-up of eyes with text 'A preview, | A preview, not a promise. So the question wa |
| 84.0s | `fade` | Text 'It's what the whole face does wh | It's what the whole face does when it moves. |
| 88.0s | `draw-on` | Search bar with text 'Refina AI' | Refina AI |
| 90.0s | `fade` | Text 'See it on your own face first.' | See it on your own face first. |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed portrait | split-screen slider, text labels |
| 6.2s | 186 | yes | full-bleed portrait | circular highlight overlays, text labels |
| 12.8s | 384 | yes | full-bleed portrait with data overlay | pixel heatmap, data table overlay |
| 20.1s | 603 | yes | full-bleed portrait | measurement lines, interactive slider |
| 34.267s | 1028 | yes | full-bleed portrait | circular highlight overlay, before/after slider |
| 50.333s | 1510 | yes | full-bleed portrait with diagram | facial thirds diagram, bar chart overlay |
| 61.733s | 1852 | yes | full-bleed portrait with mesh | geometric mesh overlay, interactive buttons |
| 71.033s | 2131 | yes | text-only list | numbered list |
| 80.0s | 2400 | transition | centered UI overlay | search bar mockup |

## Narrative arc

1. Hook: Present a visual puzzle of a face with one changed feature.
2. Reveal: Show that the chin was changed, not the nose, using pixel data.
3. Explanation 1: Explain the relationship between nose and chin projection.
4. Explanation 2: Explain the relationship between eyelid hooding and eye size.
5. Explanation 3: Explain facial proportions in thirds.
6. Interactive Test: Ask the viewer to physically test the illusion themselves.
7. CTA: Introduce Refina AI to preview changes on their own face.

## Devices (14)

text labels, split-screen slider, pixel heatmap, measurement lines, geometric mesh overlay, search bar mockup, circular highlight overlays, data table overlay, interactive slider, before/after slider, facial thirds diagram, bar chart overlay, interactive buttons, numbered list
