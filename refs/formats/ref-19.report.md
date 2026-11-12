# ref-19

**listicle** — A grooming guide matching beard styles to round, square, and oval face shapes using Indian celebrities as visual examples.

41.742s · 1080x1920 @29.97

## Animation language

- **signature moves** — Contour Draw for face shapes, Beard Style Montage for rapid visual swaps, Dimension Lines for geometric advice
- **how things enter** — Face contours draw on smoothly, while recommendation pills pop in with an elastic scale-up.
- **how things leave** — Elements generally fade out or are replaced abruptly by the next scene's elements.
- **how scenes change** — Hard cuts between different models representing different face shapes.
- **what stays still** — The model's face and the background remain perfectly static to maintain alignment during beard swaps.
- **rhythm** — Bursty and educational, with rapid-fire beard swaps and tag pop-ins matching the voiceover's pace.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 83.1% |
| element arrivals / min | 23.0 |
| hard cuts | 2 (2.9/min) |
| median shot | 12.45s |
| transitions | 4 (median 0.13s) |
| speech | 99.6% |
| scene changes that are cuts | 66.7% (2 of 3) |
| ground | `#74767D` flat=False |

## Animations (5)

4 we can already build · **1 we cannot**

### Would need building

**Dimension Lines & Arrows** — Vertical lines and horizontal arrows indicating face proportions.  
`translate` · inward · snappy · staggered  
*Purpose:* To illustrate geometric grooming advice, such as making the face look longer or keeping sides shorter.  
*Reusable as:* Showing dimensions, fits, adjustments, or focal points on a diagram or photo.  
*Build:* DimensionLines

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Contour Draw (Face Shape) | `ContourDraw` | To visually define and highlight the specific face shape (round, square, oval) being discu |
| Beard Mesh Overlay | `Reveal` | To isolate and draw focus to the beard zone of the face before showing style variations. |
| Tag/Pill PopIn | `PopIn` | To clearly label a beard style as recommended (green check) or to be avoided (red cross). |
| Beard Style Montage | `Montage` | To show how different beard styles look on the same face shape in rapid succession. |

## What to steal, ranked

1. The seamless Beard Style Montage swap on a static model face to show instant variations.
2. The Contour Draw tracing face shapes to immediately establish the visual context of the advice.

## Timeline — every animation instance (25)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `fade` | Text and graphic overlay | Round face / KAPIL SHARMA, INDIAN COMEDIAN |
| 1.0s | `morph` | Graphic overlay | Beard area outline |
| 3.0s | `scale` | Text label | LONGER |
| 4.0s | `scale` | Text and graphic overlay | SHORTER SIDES |
| 5.0s | `morph` | Beard graphic and text label | TAPERED BEARD |
| 7.0s | `morph` | Beard graphic and text label | DUCKTAIL |
| 8.0s | `morph` | Beard graphic and text label | THICK BOXED BEARD |
| 10.0s | `morph` | Beard graphic and text label | FULL BEARD |
| 12.0s | `morph` | Beard graphic and text label | HAIR AROUND CHEEKS |
| 13.0s | `cut` | Video frame, text, and graphic overlay | Square face / YASH, INDIAN ACTOR |
| 16.0s | `morph` | Graphic overlay and text label | WIDE |
| 18.0s | `scale` | Text label | SOFTEN |
| 19.0s | `morph` | Beard graphic and text label | BEARDSTACHE |
| 21.0s | `morph` | Beard graphic and text label | SHORT TAPERED BEARD |
| 22.0s | `morph` | Beard graphic and text label | BALBO |
| 23.0s | `morph` | Beard graphic and text label | LONG BOXED BEARD |
| 25.0s | `morph` | Beard graphic and text label | THICK FULL BEARD |
| 27.0s | `cut` | Video frame, text, and graphic overlay | Oval face / RANBIR KAPOOR, INDIAN ACTOR |
| 31.0s | `scale` | Text label | BALANCED |
| 33.0s | `morph` | Beard graphic and text label | STUBBLE |
| 34.0s | `morph` | Beard graphic and text label | BEARDSTACHE |
| 35.0s | `morph` | Beard graphic and text label | FULL BEARD |
| 37.0s | `morph` | Beard graphic and text label | VAN DYKE |
| 38.0s | `morph` | Beard graphic and text label | EXTREME VERSIONS |
| 40.0s | `cut` | Video frame and text overlay | for more grooming tips. |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed portrait | face shape outline, beard shading overlay, status chips |
| 13.0s | 390 | transition | full-bleed portrait | face shape outline, beard shading overlay, status chips |
| 27.661s | 829 | yes | full-bleed portrait | face shape outline, beard shading overlay, status chips |
| 40.107s | 1202 | yes | full-bleed portrait | caption overlay |

## Narrative arc

1. Identify round face shape and recommend styles to elongate it.
2. Identify square face shape and recommend styles to soften the jaw.
3. Identify oval face shape and highlight its versatility.
4. Call to action to follow for more tips.

## Devices (4)

Face Shape Outline, Beard Shading Overlay, Status Chips, caption overlay
