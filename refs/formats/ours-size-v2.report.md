# ours-size-v2

**interactive explainer** — Explains facial proportions and lip size using an AI preview tool to demonstrate how lips affect surrounding features.

68.437s · 1080x1920 @30.0

## Animation language

- **signature moves** — Horizontal measurement lines drawing on, Interactive slider syncing with image morphing, Split-screen sliding transitions
- **how things enter** — Elements fade in or draw on smoothly to guide focus.
- **how things leave** — Elements fade out or are wiped away by incoming panels.
- **how scenes change** — Hard cuts or sliding split-screen wipes.
- **what stays still** — The central portrait image remains largely static as overlays animate.
- **rhythm** — Deliberate and educational, pausing on key visual concepts before animating.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 94.3% |
| element arrivals / min | 2.6 |
| hard cuts | 6 (5.3/min) |
| median shot | 6.83s |
| transitions | 0 (median Nones) |
| speech | 67.0% |
| scene changes that are cuts | 66.7% (6 of 9) |
| ground | `#A1B4B9` flat=True |

## Animations (5)

2 we can already build · **3 we cannot**

### Would need building

**Bounding Box Resize** — A rectangular outline box  
`scale` · inward · snappy  
*Purpose:* To focus the viewer's attention from a broad area to a specific gap.  
*Reusable as:* Cropping or focusing on specific details in UI or product demos.  
*Build:* An outline box component that can animate its width, height, and position smoothly.

**Interactive Volume Slider** — Slider handle, measurement bracket, and lip fullness  
`translate` · left-to-right · smooth  
*Purpose:* To demonstrate the range of lip volume adjustment dynamically.  
*Reusable as:* Showing before/after ranges or adjustable settings in a product.  
*Build:* A slider component synchronized with a frame-by-frame image sequence and a dynamic height bracket.

**Search Input Typing** — Text characters inside a search bar  
`draw-on` · left-to-right · mechanical · staggered  
*Purpose:* To simulate a user typing a search query to prompt action.  
*Reusable as:* Call-to-action search prompts in any promotional video.  
*Build:* A text component that reveals characters sequentially with a blinking cursor.

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Measurement Lines Draw | `DrawnCallout` | To establish anatomical reference points on the face. |
| Profile Slide Transition | `PushWipe` | To transition from a front view to a side profile view. |

## What to steal, ranked

1. Interactive Volume Slider: Highly engaging way to show variable states.
2. Bounding Box Resize: Great for directing focus to micro-details.

## Timeline — every animation instance (26)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `none` | Text 'AI PREVIEW - NOT MEDICAL ADVICE' | Think your lips |
| 1.0s | `cut` | Text 'It was never about size', 'PHOTO | It was never about size |
| 5.0s | `fade` | Subtitle text 'Lips are' | Lips are |
| 6.0s | `cut` | Lines indicating 'NOSE BASE', 'LIP EDG | The lower third is read from here |
| 7.0s | `fade` | Subtitle text 'They are the line' | They are the line |
| 11.0s | `cut` | Box highlighting 'THE GAP, NOT THE PAR | Your eye reads gaps |
| 23.0s | `cut` | Split screen image, text '1. The gap a | 1. The gap above |
| 24.0s | `fade` | Arrows and text 'THIN', 'FULL' | THIN / FULL |
| 27.0s | `fade` | Subtitle text 'Full lips' | Full lips |
| 31.0s | `fade` | Subtitle text 'The nose' | The nose |
| 33.0s | `cut` | Dotted oval highlighting 'THE CHIN', t | 2. The chin below |
| 35.0s | `fade` | Subtitle text 'The chin isn't' | The chin isn't |
| 37.0s | `cut` | Slider, text 'One face, two volumes',  | One face, two volumes |
| 41.0s | `translate` | Slider handle and lip volume transitio | Watch the gap |
| 44.0s | `cut` | Text 'The view that hides it' | The view that hides it |
| 45.0s | `wipe` | Side view image, text 'SIDE VIEW, GENE | SIDE VIEW, GENERATED |
| 47.0s | `cut` | Text 'ONE FILE, ONE REGION EDITED' | ONE FILE, ONE REGION EDITED |
| 48.0s | `fade` | Subtitle text 'Not better. Load-bearin | Not better. Load-bearing. |
| 50.0s | `translate` | Side-by-side faces, text 'It means lip | It means lips |
| 52.0s | `fade` | Subtitle text 'On many faces' | On many faces |
| 54.0s | `cut` | Button 'DO THIS NOW' | DO THIS NOW |
| 55.0s | `cut` | Text 'Try it now', '1 Roll your lips i | Try it now |
| 57.0s | `fade` | Subtitle text 'Watch your' | Watch your |
| 59.0s | `cut` | Search bar, text 'Your face. Not that  | Your face. Not that one. |
| 64.0s | `draw-on` | Text 'Refina AI' inside search bar | Refina AI |
| 65.0s | `fade` | Subtitle text 'Search Refina AI' | Search Refina AI |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed portrait | text overlay, split-screen line |
| 5.367s | 161 | yes | full-bleed portrait | measurement lines, labels |
| 10.0s | 300 | transition | full-bleed portrait | highlight box |
| 22.767s | 683 | yes | split-screen portrait | split-screen slider, measurement indicators |
| 32.467s | 974 | yes | full-bleed portrait | highlight oval |
| 37.0s | 1110 | yes | full-bleed portrait | interactive slider, measurement indicator |
| 43.833s | 1315 | yes | split-screen portrait | split-screen |
| 47.4s | 1422 | yes | split-screen portrait | side-by-side comparison |
| 54.0s | 1620 | transition | minimal text screen | numbered list |
| 58.0s | 1740 | transition | minimal text screen | search bar mockup |

## Narrative arc

1. Identify common insecurity about lip size.
2. Introduce scientific/aesthetic concept of facial proportions and gaps.
3. Demonstrate the concept visually using split-screen and interactive slider.
4. Provide an interactive physical test for the viewer to experience the effect.
5. Introduce the AI preview tool as a realistic way to visualize changes before committing.

## Devices (14)

measurement lines, interactive slider, split-screen, search bar mockup, text overlay, split-screen line, labels, highlight box, split-screen slider, measurement indicators, highlight oval, side-by-side comparison, numbered list, highlight box/oval
