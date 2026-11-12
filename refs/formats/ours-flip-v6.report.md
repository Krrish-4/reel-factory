# ours-flip-v6

**interactive explainer** — This ad explains facial asymmetry using mirror vs. photo comparisons to pitch Refina AI for previewing cosmetic changes.

88.064s · 1080x1920 @30.0

## Animation language

- **signature moves** — SliderReveal comparison sweeps, ConvergePanels face splitting, Horizontal mirror flips
- **how things enter** — Elements scale up with elastic overshoots or fade in with staggered timing.
- **how things leave** — Elements fade out in place or are wiped away by transition lines.
- **how scenes change** — Hard cuts synchronized with sweeping wipe lines that reveal new states.
- **what stays still** — The central alignment of the subject's face remains locked to emphasize asymmetry.
- **rhythm** — Deliberate and educational, pausing on static comparisons before executing quick, clean transitions.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 83.9% |
| element arrivals / min | 10.9 |
| hard cuts | 8 (5.5/min) |
| median shot | 8.43s |
| transitions | 6 (median 0.28s) |
| speech | 94.0% |
| scene changes that are cuts | 100.0% (8 of 8) |
| ground | `#A1B4B9` flat=False |

## Animations (8)

5 we can already build · **3 we cannot**

### Would need building

**Face Mirror Flip** — The central portrait image  
`wipe` · left-to-right · smooth  
*Purpose:* Demonstrates the difference between a photo and its mirrored counterpart.  
*Reusable as:* Comparing before/after states of a product or subject.  
*Build:* Horizontal image flip transition with a central wipe line.

**Asymmetry Heatmap Scan** — A horizontal scanning bar revealing a pixel-difference overlay  
`wipe` · downward · smooth  
*Purpose:* Visualizes mathematical asymmetry across the face.  
*Reusable as:* Scanning effect to reveal internal structures or data overlays.  
*Build:* Horizontal wipe mask revealing a secondary colored texture layer.

**Search Bar Typing** — Text characters inside a search input field  
`count` · left-to-right · mechanical · staggered  
*Purpose:* Directs the user on what to search for to find the app.  
*Reusable as:* Simulating search queries or command-line inputs.  
*Build:* Text typing effect with a blinking cursor.

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Split Comparison Sweep | `SliderReveal` | Highlights subtle differences between mirror and camera perspectives. |
| Symmetrical Face Convergence | `ConvergePanels` | Shows how doubling one side of the face creates two distinct people. |
| Staggered Portrait Grid | `Reveal` | Presents multiple comparison subjects side-by-side. |
| Phone Mockup Pop | `PopIn` | Introduces the interactive app interface for the call to action. |
| Interactive Swipe Flip | `SwipeCursor` | Demonstrates the user interaction required to flip the photo. |

## What to steal, ranked

1. Asymmetry Heatmap Scan for high-tech data visualization overlays.
2. Symmetrical Face Convergence for engaging split-screen comparisons.
3. Search Bar Typing for clear, actionable call-to-action sequences.

## Timeline — every animation instance (39)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `fade` | Text 'You've never seen your own face' | You've never seen your own face, One of thes |
| 1.5s | `translate` | Woman's face image | Woman's face (flipped) |
| 1.5s | `fade` | Text 'SAME FILE, FLIPPED' | SAME FILE, FLIPPED |
| 3.0s | `fade` | Text 'The other is the same file, flip | The other is the same file, flipped. |
| 5.0s | `translate` | Woman's face image | Woman's face (original) |
| 5.0s | `fade` | Text 'You have never seen your own fac | You have never seen your own face. |
| 8.0s | `cut` | Split screen images and text | A mirror reverses you., WHAT THE MIRROR SHOW |
| 10.0s | `fade` | Bottom image and text | A photograph does not., WHAT THE CAMERA SHOW |
| 11.0s | `translate` | Vertical divider line | Divider line |
| 14.0s | `cut` | Woman's face image and text | So the face you know best is the one nobody  |
| 16.0s | `fade` | Text | Where they disagree, Lay the photograph over |
| 18.0s | `wipe` | Difference map overlay | Yellow difference map |
| 18.0s | `fade` | Text | PER-PIXEL DIFFERENCE, THIS PHOTO VS ITS MIRR |
| 20.0s | `fade` | Text | This is every pixel where the two disagree. |
| 22.0s | `fade` | Text | Two pictures of one face. |
| 25.0s | `cut` | Split face image and text | 1. Two different faces, One. Her halves are  |
| 26.0s | `fade` | Left half doubled image and text | LEFT HALF, DOUBLED, Left side, doubled. |
| 31.0s | `fade` | Right half doubled image and text | RIGHT HALF, DOUBLED, Right side, doubled. |
| 33.0s | `fade` | Text | Nothing added. Nothing drawn. |
| 36.0s | `fade` | Text | Neither one is her. |
| 38.0s | `cut` | Second subject image and text | 2. It's everyone, SECOND SUBJECT, LEFT HALF, |
| 40.0s | `fade` | Her photograph image and text | HER PHOTOGRAPH |
| 42.0s | `fade` | Right half doubled image and text | RIGHT HALF, DOUBLED, Two people again. It is |
| 45.5s | `cut` | Woman's face split image and text | 3. You rehearsed the wrong one, Three. You h |
| 48.0s | `wipe` | Split screen and text | PHOTOGRAPH, Every expression you have ever c |
| 51.0s | `wipe` | Split screen and text | MIRROR, you checked reversed. |
| 53.0s | `fade` | Text | The photograph is the version you have seen  |
| 55.5s | `cut` | Woman's face image and text | The asymmetry is yours, HER OWN FACE - UNTOU |
| 56.0s | `fade` | Text | None of this means your face is wrong. |
| 60.0s | `fade` | Text | The asymmetry is the part that is actually y |
| 64.0s | `fade` | Text | You just watched two faces lose it. |
| 66.5s | `cut` | Phone mockup and text | THAT IS THE ONE THEY SEE, Try it now |
| 68.0s | `fade` | Text | 1 Open your camera roll. |
| 69.0s | `fade` | Text | 2 Pick any photo of your face. |
| 70.0s | `fade` | Text | 3 Flip it left to right., Find a photo of yo |
| 73.0s | `fade` | Text | That is who everyone has been looking at. |
| 75.5s | `cut` | Text | Your face., Not a stranger's. |
| 78.0s | `fade` | Text | A preview, not a promise |
| 82.0s | `draw-on` | Search bar text | Refina AI |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed portrait | horizontal flip |
| 8.433s | 253 | yes | stacked horizontal split | sliding split line |
| 16.333s | 490 | yes | full-bleed portrait with overlay | per-pixel difference overlay |
| 25.467s | 764 | yes | full-bleed portrait with sliding split | sliding split line |
| 37.967s | 1139 | yes | 3-column grid | multi-panel grid |
| 45.767s | 1373 | yes | full-bleed portrait | sliding split line |
| 55.5s | 1665 | transition | full-bleed portrait | text overlays |
| 66.6s | 1998 | yes | phone mockup over blurred background | phone mockup |
| 75.833s | 2275 | yes | minimalist text screen | search bar UI |

## Narrative arc

1. Introduce the concept that we don't know our own true faces.
2. Explain the difference between mirror images and photographic reality.
3. Demonstrate facial asymmetry visually using pixel overlays and doubled halves.
4. Explain the psychological impact of practicing expressions in a reversed mirror.
5. Reassure the viewer that asymmetry is natural and unique.
6. Provide an interactive, immediate action step for the viewer to try.
7. Introduce Refina AI as the solution to previewing cosmetic changes on your true face.

## Devices (7)

sliding split line, per-pixel difference overlay, phone mockup, search bar UI, horizontal flip, multi-panel grid, text overlays
