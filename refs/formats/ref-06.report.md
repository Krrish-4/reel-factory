# ref-06

**listicle** — An interactive guide classifying male eye shapes using Cristiano Ronaldo as a reference, ending with a shareable summary grid.

14.5s · 1080x1920 @24.0

## Animation language

- **signature moves** — Stepped vertical card scrolling, Staggered grid pop-ins for summary screens
- **how things enter** — Cards scroll vertically into view; text and grid elements fade or scale up in place.
- **how things leave** — Elements are replaced by a full-screen transition to the final grid layout.
- **how scenes change** — A clean cut from the split-screen comparison to the full-screen grid summary.
- **what stays still** — The main portrait of Cristiano Ronaldo remains static on the left during the comparison phase.
- **rhythm** — Constant and steady during the comparison phase, transitioning to a rapid, energetic burst of grid entries at the end.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 36.6% |
| element arrivals / min | 45.6 |
| hard cuts | 0 (0.0/min) |
| median shot | 14.5s |
| transitions | 1 (median 1.54s) |
| speech | 100.0% |
| scene changes that are cuts | 0.0% (0 of 1) |
| ground | `#525F68` flat=False |

## Animations (3)

1 we can already build · **2 we cannot**

### Would need building

**Stepped Vertical Scroll** — A vertical stack of eye-type cards on the right side of the frame.  
`translate` · up · smooth  
*Purpose:* Sequentially showcases different eye shapes to engage the viewer in self-identification.  
*Reusable as:* Displaying a list of product features, options, or steps in a process.  
*Build:* A vertical stepped carousel component that transitions cards upward with a pause on each.

**Staggered Grid Pop-In** — A 3x4 grid of eye-type cards on the final summary screen.  
`scale` · outward · snappy · staggered  
*Purpose:* Presents all options simultaneously for a final summary and shareable moment.  
*Reusable as:* Displaying a catalog of products, features, or plan options at the end of an ad.  
*Build:* A grid layout component that staggers the entry of its child elements using a scale-up animation.

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Scientific Text Reveal | `Reveal` | Introduces scientific credibility and context to the facial analysis. |

## What to steal, ranked

1. The stepped vertical card scroll for engaging, interactive-feeling option selection.
2. The staggered grid pop-in for clean, satisfying summary screens.

## Timeline — every animation instance (12)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `none` | Main layout with portrait, header text | Which type are you? CRISTIANO RONALDO PORTUG |
| 1.0s | `translate` | Eye type list | TYPE 2 Protruding 'Prominent & expressive' |
| 2.0s | `translate` | Eye type list | TYPE 3 Round 'Open & youthful' |
| 3.0s | `fade` | Scientific citation text box | Attractive male faces AVERAGE ~6.5° VS. ~-4° |
| 3.0s | `translate` | Eye type list | TYPE 4 Upturned 'Positive tilt reads as more |
| 5.0s | `translate` | Eye type list | TYPE 5 Downturned 'Gentle & disarming' |
| 6.0s | `translate` | Eye type list | TYPE 6 Epicanthic folds |
| 7.0s | `translate` | Eye type list | TYPE 7 Hunter 'Masculine & intense' |
| 8.0s | `translate` | Eye type list | TYPE 8 Wide-set 'Reads soft & open' |
| 9.0s | `translate` | Eye type list | TYPE 9 Close-set 'Reads focused & intense' |
| 10.0s | `translate` | Eye type list | TYPE 10 Sleepy 'Non-chalant' |
| 11.0s | `fade` | Grid layout screen | SCREENSHOT & SAVE Which type are you? TYPE 1 |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | split-screen portrait | scrolling selector, text labels, academic citation overlay |
| 11.0s | 264 | transition | grid | grid layout, screenshot call-to-action |

## Narrative arc

1. Introduce the core question using a famous face.
2. Scroll through various eye classifications with descriptive traits.
3. Introduce scientific backing to validate the classifications.
4. Present a final summary grid encouraging user saving and sharing.

## Devices (5)

scrolling selector, academic citation overlay, screenshot call-to-action, text labels, grid layout
