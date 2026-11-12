# ref-05

**educational explainer** — An analytical breakdown of the facial aesthetics and genetic diversity that define the unique beauty of Spanish women.

64.5s · 1080x1920 @24.0

## Animation language

- **signature moves** — Staggered card deck entries, Technical UI callouts drawing on, Map-based regional navigation
- **how things enter** — Elements pop in with a slight spring overshoot or slide in from the bottom.
- **how things leave** — Elements fade out or are pushed off-screen by incoming content.
- **how scenes change** — Hard cuts or smooth camera pans across a continuous background map.
- **what stays still** — The central portrait subject remains relatively static while UI overlays animate around it.
- **rhythm** — Highly active and bursty, with multiple UI elements popping in rapid succession to match the voiceover.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 36.4% |
| element arrivals / min | 88.4 |
| hard cuts | 2 (1.9/min) |
| median shot | 29.83s |
| transitions | 21 (median 0.92s) |
| speech | 97.3% |
| scene changes that are cuts | 40.0% (2 of 5) |
| ground | `#A0B6C0` flat=False |

## Animations (12)

6 we can already build · **6 we cannot**

### Would need building

**Globe Spin & Text Reveal** — Globe graphic and series title text  
`rotate` · none · smooth · staggered  
*Purpose:* Establish the series branding.  
*Reusable as:* Series intro or logo sting.  
*Build:* Rotating globe graphic with staggered text fade-in.

**Overlapping Portrait Cards Slide** — Multiple portrait cards of Spanish women  
`translate` · up · snappy · staggered  
*Purpose:* Show a variety of examples in a compact space.  
*Reusable as:* Displaying a gallery or stack of reference images.  
*Build:* Staggered overlapping card deck entry.

**Mannequin & Label Pop-In with Arrow** — 3D mannequin head, brain graphic, text labels, and connecting arrow  
`scale` · none · snappy · staggered  
*Purpose:* Illustrate the cognitive distinction between 'pretty' and 'memorable'.  
*Reusable as:* Explaining conceptual relationships or comparisons.  
*Build:* Mannequin head pop-in with internal brain graphic reveal and connecting arrows.

**Map Navigation & Portrait Slide** — Map background and regional portraits  
`translate` · up · smooth · staggered  
*Purpose:* Show genetic diversity across different Spanish regions.  
*Reusable as:* Geographic data visualization or regional comparisons.  
*Build:* Map panning synchronized with portrait cards popping up at specific coordinates.

**Bracket Label Draw-On** — Corner brackets and text label  
`draw-on` · outward · mechanical  
*Purpose:* Highlight a specific aesthetic characteristic on the face.  
*Reusable as:* Framing or targeting key elements in an image.  
*Build:* Corner brackets drawing on to frame a region of interest.

**Complex Face Analysis Overlay** — Multiple callout boxes, sliders, and checklists over a face  
`scale` · none · snappy · staggered  
*Purpose:* Simulate a comprehensive facial analysis tool.  
*Reusable as:* High-tech UI overlays or complex data dashboards.  
*Build:* Multi-element UI overlay with simultaneous sliders, checklists, and callouts.

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Title Text Slide-In | `SlideIn` | Introduce the video's core question. |
| Map Pop-In | `PopIn` | Introduce the geographic focus of the episode. |
| Animated Checklist | `AnimatedCheckList` | Break down the components of the 'Spanish look'. |
| Drawn Callout / Feature Highlight | `DrawnCallout` | Pinpoint specific facial features being discussed. |
| Color Palette Chips Pop-In | `TagStack` | Display analyzed skin undertones and highlights. |
| Face Montage | `Montage` | Demonstrate the wide range of strong features. |

## What to steal, ranked

1. Complex Face Analysis Overlay
2. Map Navigation & Portrait Slide
3. Overlapping Portrait Cards Slide

## Timeline — every animation instance (43)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `fade` | What makes Spanish women so attractive | What makes Spanish women so attractive? |
| 1.0s | `fade` | BLANCA PADILLA SPANISH MODEL | BLANCA PADILLA SPANISH MODEL |
| 3.0s | `fade` | Beauty Across Borders | Beauty Across Borders |
| 4.0s | `fade` | [ EPISODE 25 ] | [ EPISODE 25 ] |
| 5.5s | `fade` | Map of Spain | Spain map |
| 6.0s | `fade` | SPAIN | SPAIN |
| 7.0s | `translate` | Rosalia portrait | Rosalia |
| 7.5s | `fade` | TENSION | TENSION |
| 8.5s | `translate` | Ursula Corbero portrait | Ursula Corbero |
| 10.0s | `fade` | Feminine base | Feminine base |
| 11.0s | `fade` | Single bolder feature | Single bolder feature |
| 12.0s | `fade` | Facial features Eyebrows | Eyebrows |
| 14.0s | `fade` | SKIN | SKIN |
| 15.5s | `translate` | Ester Exposito portrait | Ester Exposito |
| 16.0s | `fade` | Warm Olive & Golden Soft Glow | Skin undertones |
| 17.5s | `translate` | Blanca Palmer Soler portrait | Blanca Palmer Soler |
| 18.0s | `fade` | Olive Shadow Tone | Olive Shadow Tone |
| 20.5s | `scale` | Blanca Palmer Soler portrait | Blanca Palmer Soler |
| 21.0s | `fade` | PRETTY | PRETTY |
| 21.5s | `translate` | 3D head model | Head model |
| 23.0s | `fade` | MEMORABLE | MEMORABLE |
| 25.5s | `fade` | Penelope Cruz video clip | Penelope Cruz |
| 26.5s | `fade` | Penelope Cruz portrait | Penelope Cruz |
| 28.0s | `fade` | Warm Olive | Warm Olive |
| 30.0s | `fade` | Facial features Eyebrows | Eyebrows |
| 31.0s | `fade` | Facial features Nose | Nose |
| 33.5s | `fade` | Penelope Cruz video clip | Penelope Cruz |
| 34.5s | `fade` | Woman's portrait | Woman's face |
| 35.5s | `fade` | Map of Spain | Spain map |
| 37.5s | `fade` | Woman's portrait | Woman's face |
| 39.5s | `translate` | Map of Spain | Map movement |
| 40.0s | `fade` | Woman's portrait | Barcelona woman |
| 42.0s | `translate` | Woman's portrait | Seville woman |
| 47.5s | `fade` | Woman's portrait | Woman's face |
| 48.5s | `fade` | Woman's portrait | Woman's face |
| 49.5s | `fade` | Woman's portrait | Woman's face |
| 50.5s | `fade` | Maria Valverde portrait | Maria Valverde |
| 52.5s | `fade` | Tension, Warm glow, Bold feature | Checklist |
| 55.5s | `fade` | SPANISH CHARACTERISTIC BEAUTY | SPANISH CHARACTERISTIC BEAUTY |
| 57.5s | `fade` | Map of Europe | Europe map |
| 58.0s | `fade` | Which country next? & Leave a comment | Call to action |
| 61.0s | `fade` | Philtrum, Eyebrows, Feminine base | Facial analysis |
| 63.0s | `fade` | Qoves.com search bar | Qoves.com |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed portrait | text overlay |
| 2.5s | 60 | transition | centered graphic on dark background | animated globe, text overlay |
| 6.0s | 144 | transition | portrait with technical UI overlays | color swatches, facial mapping lines, 3D mannequin head, checkboxes |
| 25.5s | 612 | transition | portrait with technical UI overlays | facial mapping lines, color swatches |
| 33.583s | 806 | yes | split screen with map and portrait overlays | interactive map, portrait cards, checkboxes |
| 57.0s | 1368 | transition | portrait with dense UI overlays | facial mapping lines, sliders, checkboxes, search bar graphic |

## Narrative arc

1. Introduce the core question regarding Spanish facial attractiveness.
2. Define the 'tension' theory: soft base combined with a bold feature.
3. Analyze the soft base component (warm olive skin tones).
4. Analyze the bold feature component using Penelope Cruz as a case study.
5. Provide geographical and genetic context for Spain's diverse facial features.
6. Summarize the aesthetic formula and present the call to action.

## Devices (11)

facial mapping lines, checkboxes, Color Swatches, text overlay, Interactive Map, animated globe, 3D mannequin head, portrait cards, sliders, search bar graphic, Technical UI Overlays
