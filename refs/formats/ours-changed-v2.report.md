# ours-changed-v2

**evidence explainer** — This video demonstrates how photographic variables like lighting, distance, tilt, and expression can mimic or exaggerate plastic surgery results.

61.589s · 1080x1920 @30.0

## Animation language

- **signature moves** — Interactive slider reveals showing before/after states, Dynamic lighting and perspective morphs controlled by UI elements, Clean, technical vector overlays (callouts, meshes) drawing on top of photography
- **how things enter** — Elements generally scale up with a slight elastic bounce (PopIn) or draw on using stroke animations (TrimPath).
- **how things leave** — Elements typically fade out or are wiped away by the next transition.
- **how scenes change** — Hard cuts are used to transition between different analytical concepts, keeping the focus on the central face portrait.
- **what stays still** — The subject's face remains centered and aligned across almost all scenes to maintain a direct comparison.
- **rhythm** — Bursty and educational. Periods of static observation are punctuated by smooth, interactive-feeling demonstrations (sliding, lighting shifts) to prove the scientific points.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 83.7% |
| element arrivals / min | 3.9 |
| hard cuts | 8 (7.8/min) |
| median shot | 6.13s |
| transitions | 0 (median Nones) |
| speech | 12.3% |
| scene changes that are cuts | 100.0% (8 of 8) |
| ground | `#828C93` flat=False |

## Animations (8)

5 we can already build · **3 we cannot**

### Would need building

**Interactive Light Source** — A yellow dot representing the key light moves from the side to overhead, while the facial shadows morph dynamically.  
`translate` · upward · smooth  
*Purpose:* To visually demonstrate how changing the light angle dramatically alters the appearance of facial shadows and wrinkles.  
*Reusable as:* Showing 3D lighting effects on products, packaging, or architectural renders.  
*Build:* A synchronized light-source controller that maps a draggable or animated handle to a sequence of frames with varying light angles.

**Distance Perspective Slider** — A slider handle moves along a scale, and the face image transitions between wide-angle (close) and telephoto (far) perspectives.  
`translate` · left-to-right · smooth  
*Purpose:* To show how camera distance distorts facial features (nose size vs. jaw width).  
*Reusable as:* Demonstrating focal length differences, zoom capabilities, or spatial depth in product photography.  
*Build:* A perspective slider component that morphs or crossfades between different focal lengths based on slider position.

**Facial Mesh Overlay** — A 3D-like wireframe grid draws itself over the subject's forehead and face.  
`draw-on` · outward · mechanical  
*Purpose:* To represent scientific analysis, facial mapping, or AI tracking of facial features.  
*Reusable as:* Tech-focused ads, facial recognition concepts, or mapping product contours.  
*Build:* A complex multi-path SVG wireframe that animates its stroke-dashoffset to simulate a 3D scan.

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Before/After Slider Reveal | `SliderReveal` | To demonstrate the subtle difference in jawline definition before and after a procedure. |
| Drawn Callouts | `DrawnCallout` | To break down the four photographic variables that change between before-and-after photos. |
| Highlight Circle | `TrimPath` | To draw immediate focus to the specific facial fold being discussed in the voiceover. |
| Step List | `AnimatedCheckList` | To present a clear, step-by-step instruction for the viewer to try at home. |
| Button Grid Pop-In | `TagStack` | To present the key criteria for a fair comparison in a clean, interactive-looking layout. |

## What to steal, ranked

1. The Interactive Light Source morphing effect to show dynamic lighting changes on a static subject.
2. The Distance Perspective Slider to demonstrate focal length and camera distance distortion.
3. The clean, technical 3D Facial Mesh Overlay for tech-focused or scientific branding.

## Timeline — every animation instance (29)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `cut` | Portrait of a woman with 'BEFORE' labe | BEFORE |
| 1.0s | `fade` | Text 'What else changed?' | What else changed? |
| 2.0s | `morph` | Jawline area morphs, 'AFTER' and 'JAWL | AFTER, JAWLINE |
| 4.0s | `cut` | Darker portrait with text 'Four things | Four things move |
| 5.0s | `fade` | Labels '1. LIGHT', '2. DISTANCE', '3.  | 1. LIGHT, 2. DISTANCE, 3. TILT, 4. EXPRESSIO |
| 8.0s | `cut` | Portrait with text '1. The light' | 1. The light |
| 9.0s | `fade` | Yellow dot with label 'KEY LIGHT' | KEY LIGHT |
| 10.0s | `translate` | Yellow dot translates upwards, shadows | KEY LIGHT |
| 14.0s | `fade` | Brackets with label 'EYE SOCKETS' | EYE SOCKETS |
| 18.0s | `cut` | Portrait with text '2. The distance' | 2. The distance |
| 19.5s | `translate` | Split screen sliding horizontally to s | 2 M, 50 CM, NOSE FORWARD, JAW BACK |
| 22.0s | `translate` | Split screen sliding horizontally |  |
| 27.0s | `cut` | Portrait with text '3. The tilt' | 3. The tilt |
| 28.0s | `wipe` | Vertical wipe showing chin tilt compar | A FEW DEGREES OF TILT |
| 32.0s | `cut` | Close-up portrait with label 'NASOLABI | NASOLABIAL FOLD |
| 33.0s | `fade` | Text '4. The face you're making' | 4. The face you're making |
| 34.0s | `draw-on` | White circle drawing on, face expressi |  |
| 38.0s | `cut` | Portrait with spiderweb-like grid and  | Both are true |
| 40.0s | `fade` | Buttons 'LIGHT', 'DISTANCE', 'TILT', ' | LIGHT, DISTANCE, TILT, EXPRESSION |
| 47.0s | `cut` | Text 'Try it tonight' | Try it tonight |
| 47.5s | `fade` | Text '1 Two photos, same room, a minut | 1 Two photos, same room, a minute apart. |
| 48.5s | `fade` | Text '2 One with the light in front of | 2 One with the light in front of you. |
| 49.5s | `fade` | Text '3 One with the light above you.' | 3 One with the light above you. |
| 53.0s | `cut` | Text 'Same light. Same lens.' | Same light. Same lens. |
| 54.0s | `fade` | Button 'Same face' | Same face |
| 54.5s | `fade` | Button 'Same light' | Same light |
| 55.0s | `fade` | Button 'Same lens' | Same lens |
| 55.5s | `fade` | Button 'Same angle' | Same angle |
| 59.0s | `draw-on` | Search bar with text 'Refina AI' typin | Refina AI |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed portrait | Before/After toggle, Jawline highlight box |
| 4.067s | 122 | yes | full-bleed portrait with diagram overlay | Diagram overlay |
| 8.733s | 262 | yes | full-bleed portrait with interactive light indicator | Interactive light source indicator, Eye socket highlight box |
| 18.067s | 542 | yes | split-screen portrait with distance slider | Distance slider UI, Split-screen comparison |
| 27.1s | 813 | yes | split-screen portrait | Split-screen comparison |
| 32.333s | 970 | yes | close-up portrait with highlight circle | Highlight circle |
| 38.467s | 1154 | yes | full-bleed portrait with grid overlay | Facial mapping grid |
| 46.633s | 1399 | yes | text overlay on dark portrait | Numbered list overlay |
| 53.0s | 1590 | transition | text and button overlay on portrait | Interactive buttons, Search bar UI |

## Narrative arc

1. Introduce the illusion of before/after plastic surgery photos.
2. Identify the four key photographic variables.
3. Demonstrate the impact of lighting changes.
4. Demonstrate the impact of camera distance.
5. Demonstrate the impact of head tilt.
6. Demonstrate the impact of facial expression.
7. Conclude that photos cannot be separated from the surgery itself.
8. Provide a call to action to try the experiment or search for Refina AI.

## Devices (12)

Split-screen comparison, Before/After toggle, Interactive light source indicator, Distance slider UI, Facial mapping grid, Search bar UI, Jawline highlight box, Diagram overlay, Eye socket highlight box, Highlight circle, Numbered list overlay, Interactive buttons
