# ours-mirror2-v3

**product demo** — This ad demonstrates the Refina AI app, showing how users can preview cosmetic procedures on their own faces to make informed decisions at home.

82.517s · 1080x1920 @30.0

## Animation language

- **signature moves** — SliderReveal for before/after comparisons, DrawnCallout for technical annotations, Elastic PopIn for UI elements and buttons
- **how things enter** — UI elements and buttons pop in with elastic scaling, while menus and cards slide in from the edges.
- **how things leave** — Elements fade out or slide away to clear the screen for the next step.
- **how scenes change** — Hard cuts separate major sections, while smooth wipes transition between comparison states.
- **what stays still** — The central portrait subjects remain largely static to emphasize the simulated changes.
- **rhythm** — Bursty and interactive, mimicking the feel of a responsive mobile application.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 85.4% |
| element arrivals / min | 33.5 |
| hard cuts | 2 (1.5/min) |
| median shot | 21.13s |
| transitions | 16 (median 0.23s) |
| speech | 9.9% |
| scene changes that are cuts | 25.0% (2 of 8) |
| ground | `#A1B4B9` flat=True |

## Animations (8)

7 we can already build · **1 we cannot**

### Would need building

**Horizontal Card Carousel** — Row of procedure preview cards  
`translate` · left-to-right · smooth  
*Purpose:* Allows browsing through different treatment options.  
*Reusable as:* Product catalogs or gallery browsing.  
*Build:* Horizontal scrollable card carousel with snapping

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Drawn Callout | `DrawnCallout` | Highlights specific facial areas being manipulated. |
| Grid Overlay Fade | `Reveal` | Simulates AI facial analysis scanning. |
| Option Chips Pop | `TagStack` | Presents user choices in a playful, interactive way. |
| Dropdown Menu Slide | `SlideOver` | Demonstrates app navigation and feature selection. |
| Before/After Slider Reveal | `SliderReveal` | Shows the transition from original to simulated result. |
| Card Scatter Pile | `PopIn` | Visually represents a collection of user profiles. |
| Target Circle Draw | `ContourDraw` | Highlights specific facial points for treatment. |

## What to steal, ranked

1. The interactive SliderReveal for seamless before/after visualization.
2. DrawnCallout annotations to cleanly label specific visual details.
3. Staggered TagStack pops for presenting multiple options dynamically.

## Timeline — every animation instance (62)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `fade` | Text "You've done it in" | You've done it in |
| 1.0s | `fade` | Text "The mirror test" | The mirror test |
| 3.0s | `fade` | Label "TEMPLE" | TEMPLE |
| 3.0s | `fade` | Text "Pulled the skin back at your" | Pulled the skin back at your |
| 4.0s | `fade` | Label "TEMPLE" | TEMPLE |
| 5.0s | `fade` | Label "CHEEK" | CHEEK |
| 5.0s | `fade` | Text "Lifted your cheek with two finge | Lifted your cheek with two fingers. |
| 8.0s | `fade` | Label "HELD - 4 SECONDS" | HELD - 4 SECONDS |
| 8.0s | `fade` | Text "Held it there. Let" | Held it there. Let |
| 10.0s | `cut` | Scene transition |  |
| 10.0s | `fade` | Text "A guess, not a picture" | A guess, not a picture |
| 11.0s | `fade` | Text "That is the whole" | That is the whole |
| 13.0s | `fade` | Buttons "a little", "not too much", "n | a little, not too much, natural, still me, b |
| 14.0s | `fade` | Text "A guess you make with your" | A guess you make with your |
| 16.0s | `fade` | Text "and finish in" | and finish in |
| 17.0s | `cut` | Scene transition |  |
| 17.0s | `fade` | Text "So we built Refina" | So we built Refina |
| 19.0s | `fade` | App screen content | Reference Photos |
| 20.0s | `fade` | Text "Upload one photo." | Upload one photo. |
| 21.0s | `translate` | App screen content | Select Procedures |
| 23.0s | `translate` | App screen content | Reference Photos |
| 23.0s | `fade` | Text "And see it rendered" | And see it rendered |
| 25.0s | `fade` | Text "on your own" | on your own |
| 27.0s | `fade` | Text "Your face." | Your face. |
| 28.0s | `fade` | Text "Not a diagram. Not a gallery. Yo | Not a diagram. Not a gallery. Your face. |
| 30.0s | `cut` | Scene transition |  |
| 30.0s | `fade` | Buttons | stop guessing, rule things out, decide alone |
| 32.0s | `fade` | Text "Three things change once you can | Three things change once you can see it. |
| 33.0s | `fade` | Text "First," | First, |
| 34.0s | `cut` | Scene transition |  |
| 34.0s | `fade` | Text "1. Stop guessing" | 1. Stop guessing |
| 35.0s | `fade` | Text "The picture in your head was nev | The picture in your head was never accurate. |
| 38.0s | `fade` | Slider | DREAD, HOPE |
| 39.0s | `fade` | Text "It was hope on a good day" | It was hope on a good day |
| 40.0s | `translate` | Vertical line sweep |  |
| 42.0s | `fade` | Text "and dread on a bad one." | and dread on a bad one. |
| 44.0s | `fade` | Text "MEASURED" | MEASURED |
| 44.0s | `fade` | Text "Now it is just a" | Now it is just a |
| 47.0s | `cut` | Scene transition |  |
| 47.0s | `fade` | Text "2. Rule it out" | 2. Rule it out |
| 48.0s | `fade` | Text "Second, you find out what you do | Second, you find out what you don't want. |
| 50.0s | `fade` | Buttons | Rhinoplasty, Lip filler, Brow lift, Facelift |
| 51.0s | `translate` | Cards |  |
| 51.0s | `fade` | Text "Ruling a procedure out is an ans | Ruling a procedure out is an answer too, |
| 53.0s | `fade` | Text "and it costs you" | and it costs you |
| 56.0s | `cut` | Scene transition |  |
| 56.0s | `fade` | Text "3. Decide before the desk" | 3. Decide before the desk |
| 56.0s | `fade` | Text "And third, you decide before any | And third, you decide before anyone is selli |
| 60.0s | `translate` | Cards |  |
| 60.0s | `fade` | Text "At home. On your own time" | At home. On your own time |
| 63.0s | `fade` | Text "Not across a desk from someone" | Not across a desk from someone |
| 65.0s | `cut` | Scene transition |  |
| 66.0s | `fade` | Text "with a price list and a waiting  | with a price list and a waiting room. |
| 69.0s | `cut` | Scene transition |  |
| 69.0s | `fade` | Text "A preview, not a promise" | A preview, not a promise |
| 69.0s | `fade` | Text "Refina is a preview, not a promi | Refina is a preview, not a promise. |
| 72.0s | `fade` | Text "Your surgeon determines your res | Your surgeon determines your result. |
| 74.0s | `fade` | Text "But you should get to see" | But you should get to see |
| 77.0s | `fade` | Text "before you spend another year im | before you spend another year imagining it. |
| 80.0s | `cut` | Scene transition |  |
| 80.0s | `draw-on` | Text "Search Refina AI" | Search Refina AI |
| 80.0s | `fade` | Text "ON THE APP STORE" | ON THE APP STORE |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | framed portrait video | text labels, pointer lines |
| 10.0s | 300 | transition | framed portrait photo with UI overlay | AI face mesh, interactive chips |
| 17.0s | 510 | transition | phone mockup | phone mockup, app UI, rendering progress bar |
| 29.0s | 870 | transition | minimal text layout | text chips |
| 33.0s | 990 | transition | split-screen portrait | interactive slider, before/after labels |
| 46.0s | 1380 | transition | image grid with interactive buttons | image cards, procedure chips |
| 55.0s | 1650 | transition | photo collage and text overlay | photo cards, pricing list graphic |
| 68.0s | 2040 | transition | framed portrait with UI markers | UI markers, before/after transition |
| 79.0s | 2370 | transition | minimal search bar layout | search bar graphic |

## Narrative arc

1. Identify the common habit of manually pulling back skin to imagine cosmetic results.
2. Introduce Refina AI as a tool to replace guesswork with realistic previews.
3. Detail the three main benefits: stopping the guesswork, ruling out unwanted procedures, and deciding privately at home.
4. Address the limitation honestly (it is a preview, not a promise).
5. Call to action to download the app.

## Devices (17)

AI face mesh, phone mockup, interactive slider, procedure chips, text labels, pointer lines, interactive chips, app UI, rendering progress bar, text chips, before/after labels, image cards, photo cards, pricing list graphic, UI markers, before/after transition, search bar graphic
