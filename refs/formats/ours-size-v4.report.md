# ours-size-v4

**educational explainer** — An aesthetic analysis demonstrating how lip volume alters the visual proportions of the lower face using interactive split-screen comparisons.

72.107s · 1080x1920 @30.0

## Animation language

- **signature moves** — SliderReveal split-screen wipes, TrimPath technical measurement lines
- **how things enter** — Elements fade in or draw on using clean, linear paths.
- **how things leave** — Elements wipe away or fade out abruptly during scene cuts.
- **how scenes change** — Hard cuts or split-screen panel transitions.
- **what stays still** — The central portrait subject remains static while overlays animate around it.
- **rhythm** — Bursty, with periods of static analysis punctuated by dynamic slider sweeps.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 92.7% |
| element arrivals / min | 2.5 |
| hard cuts | 8 (6.7/min) |
| median shot | 5.87s |
| transitions | 0 (median Nones) |
| speech | 65.6% |
| scene changes that are cuts | 100.0% (8 of 7) |
| ground | `#A1B4B9` flat=True |

## Animations (9)

7 we can already build · **2 we cannot**

### Would need building

**Interactive Slider Simulation** — A slider handle moves horizontally, updating the split-screen divider in sync.  
`translate` · left-to-right · smooth  
*Purpose:* Simulates a user-controlled interface showing continuous volume range.  
*Reusable as:* Demonstrating app UI controls or gradual transformations.  
*Build:* InteractiveSliderSimulation

**Search Bar Typing** — A search bar fades in, and text is typed out letter-by-letter.  
`count` · left-to-right · mechanical  
*Purpose:* Provides a clear call-to-action directing users to search for the brand.  
*Reusable as:* Outro cards, search-intent demonstrations, or brand name reveals.  
*Build:* TypewriterSearchBar

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| SliderReveal | `SliderReveal` | Demonstrates subtle difference between unmodified and modified lip sizes. |
| TrimPath Measurement Lines | `TrimPath` | Visually defines anatomical boundaries of the lower face. |
| Highlight Box | `Reveal` | Focuses viewer attention on the spatial gap rather than the lips. |
| Measurement Arrows | `TrimPath` | Quantifies and compares physical distance changes. |
| ContourDraw Chin Oval | `DottedDraw` | Isolates and draws attention to the chin's appearance. |
| ConvergePanels Transition | `ConvergePanels` | Transitions from front to side view while maintaining split-screen motif. |
| AnimatedCheckList | `AnimatedCheckList` | Guides viewer through a physical exercise to test the video's theory. |

## What to steal, ranked

1. Interactive Slider Simulation to mimic real-time app usage
2. TrimPath measurement lines for scientific/technical credibility

## Timeline — every animation instance (35)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `none` | Face and text 'Think your lips', 'AI P | Think your lips |
| 1.0s | `cut` | Face split-screen and text 'It was nev | It was never about size |
| 3.0s | `fade` | Text 'And it was never about size.' | And it was never about size. |
| 5.0s | `fade` | Text 'Lips are not a feature.' | Lips are not a feature. |
| 6.0s | `fade` | Text 'The lower third is read from her | The lower third is read from here |
| 8.0s | `fade` | Text 'They are the line the lower face | They are the line the lower face is measured |
| 13.0s | `fade` | Text 'Your eye reads gaps', 'THE GAP,  | Your eye reads gaps |
| 14.0s | `fade` | Text 'Your eye never measures a featur | Your eye never measures a feature alone. |
| 15.0s | `fade` | Text 'It measures the gaps around it.' | It measures the gaps around it. |
| 18.0s | `fade` | Text 'Move the lip line and every gap  | Move the lip line and every gap moves. |
| 20.0s | `cut` | Face split-screen and text '1. The gap | 1. The gap above |
| 22.0s | `fade` | Text 'THIN', 'FULL' and brackets | THIN / FULL |
| 24.0s | `fade` | Text 'Full lips make it short. Thin li | Full lips make it short. Thin lips, long. |
| 27.0s | `fade` | Text 'The nose isn't what changed.' | The nose isn't what changed. |
| 30.0s | `cut` | Face with chin highlighted and text '2 | 2. The chin below |
| 32.0s | `fade` | Text 'Two. The chin reads stronger.' | Two. The chin reads stronger. |
| 35.0s | `fade` | Text 'The chin isn't what changed eith | The chin isn't what changed either. |
| 37.0s | `cut` | Face with slider and text 'One face, t | One face, two volumes |
| 38.0s | `translate` | Slider handle and left side of the fac | none |
| 41.0s | `fade` | Text 'Watch the gap, not the lips.' | Watch the gap, not the lips. |
| 42.0s | `cut` | Face and text 'The view that hides it' | The view that hides it |
| 43.0s | `rotate` | Face and text 'SIDE VIEW, GENERATED' | SIDE VIEW, GENERATED |
| 44.0s | `fade` | Text 'Now turn it.' | Now turn it. |
| 45.0s | `fade` | Text 'A front photograph hides it.' | A front photograph hides it. |
| 46.0s | `cut` | Two faces and text 'Not better. Load-b | Not better. Load-bearing. |
| 49.0s | `fade` | Text 'It means lips are load-bearing.' | It means lips are load-bearing. |
| 52.0s | `fade` | Text 'On many faces, less is the chang | On many faces, less is the change. |
| 54.0s | `cut` | Text 'DO THIS NOW' | DO THIS NOW |
| 55.0s | `fade` | Text 'Try it now' | Try it now |
| 56.0s | `fade` | Text '1 Roll your lips inward', '2 Hol | 1 Roll your lips inward / 2 Hold it |
| 57.0s | `fade` | Text '3 Watch your chin' and 'Roll you | 3 Watch your chin |
| 59.0s | `fade` | Text 'Watch your chin arrive.' | Watch your chin arrive. |
| 61.0s | `cut` | Search bar and text 'Your face. Not th | Your face. Not that one. |
| 63.0s | `fade` | Text 'See it on your own face first.' | See it on your own face first. |
| 66.0s | `draw-on` | Text 'Refina AI' | Refina AI |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | split-screen portrait | split-screen slider, proportion lines |
| 20.433s | 613 | yes | split-screen portrait with measurement callouts | measurement brackets |
| 30.267s | 908 | yes | split-screen portrait with highlighted chin area | highlight oval |
| 36.233s | 1087 | yes | portrait with interactive slider | interactive slider |
| 41.8s | 1254 | yes | 3D rotating portrait | 3D rotation effect |
| 45.567s | 1367 | yes | side-by-side portrait comparison | side-by-side panels |
| 54.0s | 1620 | transition | minimal text list | numbered list |
| 61.0s | 1830 | transition | minimal search UI | search bar mockup |

## Narrative arc

1. Challenge the viewer's assumption about lip size.
2. Introduce the concept of facial proportions and 'gaps'.
3. Demonstrate how lip volume changes the nose-to-lip gap.
4. Demonstrate how lip volume changes the perception of the chin.
5. Show the 3D reality of these changes.
6. Provide an interactive physical test for the viewer.
7. Introduce the product as a tool to preview these changes on oneself.

## Devices (9)

split-screen slider, measurement brackets, interactive slider, proportion lines, highlight oval, 3D rotation effect, side-by-side panels, numbered list, search bar mockup
