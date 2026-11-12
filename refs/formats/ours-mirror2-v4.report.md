# ours-mirror2-v4

**product demo** — This ad demonstrates the Refina AI app, showing how users can preview cosmetic procedures on their own faces to make informed decisions at home.

82.517s · 1080x1920 @30.0

## Animation language

- **signature moves** — Interactive slider sweeps for before/after comparisons, Staggered tag pops for user choices, Drawn callouts for precise anatomical labeling
- **how things enter** — Elements scale up with a springy bounce or slide in from the bottom.
- **how things leave** — Elements fade out or slide down out of frame.
- **how scenes change** — Hard cuts combined with sliding UI panels.
- **what stays still** — The central portrait of the woman remains the focal point.
- **rhythm** — Bursty, with moments of static demonstration followed by rapid UI interactions.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 85.2% |
| element arrivals / min | 33.5 |
| hard cuts | 2 (1.5/min) |
| median shot | 21.13s |
| transitions | 13 (median 0.23s) |
| speech | 9.0% |
| scene changes that are cuts | 33.3% (2 of 6) |
| ground | `#A1B4B9` flat=True |

## Animations (8)

6 we can already build · **2 we cannot**

### Would need building

**Scattered Card Pile** — Multiple portrait photos dropping and stacking  
`translate` · down · floaty · staggered  
*Purpose:* Visualizes a collection of different user profiles or results.  
*Reusable as:* Displaying a stack of user testimonials or photos.  
*Build:* A physics-based or staggered card stacking component with slight rotations.

**Timeline Slider Progress** — A slider handle moving along a timeline track  
`translate` · left-to-right · smooth  
*Purpose:* Represents the passage of time spent imagining results.  
*Reusable as:* Showing progress, adjustment, or timeline navigation.  
*Build:* An animated slider component with a moving thumb and active track fill.

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Drawn Callouts | `DrawnCallout` | Highlights specific facial areas being manipulated in the mirror test. |
| Grid Overlay Reveal | `ContourDraw` | Simulates AI facial analysis and scanning technology. |
| Tag Stack Pop | `TagStack` | Presents user options in a playful, interactive format. |
| App Screen Transition | `SlideOver` | Demonstrates the user flow within the mobile application. |
| Before/After Slider Sweep | `SliderReveal` | Compares the original face with the simulated treatment result. |
| Horizontal Card Carousel | `Montage` | Showcases different cosmetic procedures available. |

## What to steal, ranked

1. The interactive before/after slider sweep for instant visual comparison.
2. Staggered card pile animation to show a variety of user examples dynamically.
3. Drawn callouts to highlight specific product details or features.

## Timeline — every animation instance (39)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `fade` | text | You've |
| 1.0s | `fade` | text | The mirror test / You've done it in the |
| 3.0s | `fade` | text and marker | TEMPLE / Pulled the skin back at your temple |
| 5.0s | `fade` | text and marker | CHEEK / Lifted your cheek with two fingers. |
| 8.0s | `fade` | text | HELD - 4 SECONDS / Held it there. Let go. |
| 11.0s | `cut` | scene | A guess, not a picture |
| 13.0s | `fade` | buttons and text | a little / not too much / natural / still me |
| 16.0s | `fade` | text | and finish in your head. |
| 18.0s | `cut` | scene | Three taps / So we built Refina. |
| 20.0s | `fade` | text | Upload one photo. |
| 21.0s | `translate` | screen content | Choose the procedure you're considering. |
| 23.0s | `cut` | scene | And see it rendered on your own face. |
| 24.0s | `translate` | scanning line |  |
| 26.0s | `fade` | text | RENDERING |
| 27.0s | `fade` | text | Not a diagram. Not a gallery. Your face. |
| 30.0s | `cut` | scene | stop guessing |
| 31.0s | `fade` | buttons and text | rule things out / decide alone / Three thing |
| 33.0s | `cut` | scene | 1. Stop guessing / First, you stop guessing. |
| 35.0s | `fade` | grid and text | GUESSED |
| 36.0s | `fade` | text | The picture in your head was never accurate. |
| 38.0s | `fade` | slider | DREAD / HOPE |
| 39.0s | `fade` | text | It was hope on a good day |
| 42.0s | `fade` | text | and dread on a bad one. |
| 44.0s | `translate` | slider and text | MEASURED / Now it is just a photograph. |
| 47.0s | `cut` | scene | 2. Rule it out / Second, you find out what y |
| 50.0s | `fade` | buttons and text | Rhinoplasty / Lip-filler / Brow-lift / Facel |
| 52.0s | `translate` | cards |  |
| 53.0s | `fade` | text | and it costs you nothing. |
| 56.0s | `cut` | scene | 3. Decide before the desk / And third, you d |
| 60.0s | `translate` | photo cards | At home. On your own time. |
| 63.0s | `fade` | text | Not across a desk from someone |
| 65.0s | `cut` | scene | CONSULTATION / with a price list and a waiti |
| 68.0s | `cut` | scene |  |
| 69.0s | `fade` | text | What it is, and what it isn't / Refina is a  |
| 70.0s | `fade` | text | AI PREVIEW - NOT MEDICAL ADVICE |
| 72.0s | `fade` | buttons and text | Not a diagnosis / Not a quote / Not a surgic |
| 74.0s | `fade` | text | But you should get to see it |
| 77.0s | `fade` | slider | STILL IMAGINING / TODAY / NEXT YEAR / before |
| 80.0s | `cut` | scene | Search Refina AI on the App Store. |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | framed portrait | text labels, on-screen captions |
| 10.5s | 315 | transition | framed portrait | AI face mesh, interactive chips |
| 17.5s | 525 | transition | phone mockup | mobile UI, rendering animation |
| 30.0s | 900 | transition | split screen | interactive slider, before/after comparison |
| 46.5s | 1395 | transition | card grid | swipeable cards, status chips |
| 55.5s | 1665 | transition | scattered photo grid | photo cards, pricing list graphic |
| 68.0s | 2040 | transition | framed portrait | disclaimer banner, timeline slider, search bar CTA |

## Narrative arc

1. Identify the relatable habit of manually pulling back skin to imagine cosmetic results.
2. Introduce Refina AI as the solution to visualize these changes accurately.
3. Explain the benefits: eliminating guesswork, ruling out unwanted procedures risk-free, and making pressure-free decisions at home.
4. Provide a realistic disclaimer while encouraging the user to take action and download the app.

## Devices (16)

AI face mesh, interactive slider, text labels, on-screen captions, interactive chips, mobile UI, rendering animation, before/after comparison, swipeable cards, status chips, photo cards, pricing list graphic, disclaimer banner, timeline slider, search bar CTA, phone mockup
