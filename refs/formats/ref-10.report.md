# ref-10

**interactive classification quiz** — Classifies human nose shapes using a celebrity profile and 3D models based on a scientific study.

20.042s · 1080x1920 @24.0

## Animation language

- **signature moves** — Continuous vertical list scrolling, Staggered grid pop-in
- **how things enter** — Elements pop in with scale and fade, or scroll vertically into view.
- **how things leave** — Elements fade out to make room for the final grid transition.
- **how scenes change** — A clean fade transition from the single-profile view to the full grid view.
- **what stays still** — The background profile image of the model remains static for most of the video.
- **rhythm** — Constant and steady scrolling on the right, punctuated by quick UI pops on the left.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 36.0% |
| element arrivals / min | 18.0 |
| hard cuts | 0 (0.0/min) |
| median shot | 20.04s |
| transitions | 1 (median 0.83s) |
| speech | 98.8% |
| scene changes that are cuts | 0.0% (0 of 1) |
| ground | `#788A90` flat=False |

## Animations (4)

2 we can already build · **2 we cannot**

### Would need building

**Vertical List Scroll** — Vertical list of nose shape cards on the right side  
`translate` · up · smooth  
*Purpose:* Showcases the variety of nose shapes to build curiosity.  
*Reusable as:* Scrolling through product features, categories, or options.  
*Build:* Vertical list carousel that scrolls continuously or step-by-step

**Staggered Grid Reveal** — A 3x5 grid of nose shape illustrations  
`scale` · outward · snappy · staggered  
*Purpose:* Presents the full taxonomy at once, prompting viewer interaction.  
*Reusable as:* Displaying a product catalog or feature overview at the end.  
*Build:* StaggeredGridPopIn

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Citation Card Pop-In | `PopIn` | Establishes scientific credibility mid-video. |
| Headline Crossfade | `Reveal` | Shifts the narrative from hook to interactive question. |

## What to steal, ranked

1. Continuous vertical list scroll for showcasing options
2. Staggered grid pop-in for clean, structured outro screens

## Timeline — every animation instance (17)

| t | motion | element | content |
|---|---|---|---|
| 0.5s | `translate` | Nose type cards on the right | Original nose, Fleshy nose |
| 1.5s | `translate` | Nose type cards on the right | Fleshy nose, Hawk nose |
| 2.5s | `translate` | Nose type cards on the right | Hawk nose, Straight nose |
| 3.5s | `translate` | Nose type cards on the right | Straight nose, Bulbous nose |
| 4.5s | `translate` | Nose type cards on the right | Bulbous nose, Celestial nose |
| 5.0s | `fade` | Study citation card | Based on this study: Tamir A. Numerical surv |
| 5.5s | `translate` | Nose type cards on the right | Celestial nose, Aquiline nose |
| 7.0s | `fade` | Study citation card | Based on this study: Tamir A. Numerical surv |
| 7.5s | `translate` | Nose type cards on the right | Aquiline nose, Greek nose |
| 8.0s | `fade` | Title text on the left | Which nose type are you? |
| 8.5s | `translate` | Nose type cards on the right | Greek nose, Bumpy nose |
| 9.5s | `translate` | Nose type cards on the right | Bumpy nose, Roman nose |
| 10.5s | `translate` | Nose type cards on the right | Roman nose, Flat nose |
| 11.5s | `translate` | Nose type cards on the right | Flat nose, Combo nose |
| 12.5s | `translate` | Nose type cards on the right | Combo nose, Nixon nose |
| 13.5s | `translate` | Nose type cards on the right | Nixon nose, Rare variant |
| 14.5s | `fade` | Entire screen layout | Grid of all nose types |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | split-screen portrait | 3D model cards, celebrity profile image, citation popup |
| 14.0s | 336 | transition | grid layout | grid layout, 3D model cards |

## Narrative arc

1. Introduce nose shape measurement concept
2. Show celebrity reference profile
3. Cite scientific study for credibility
4. Present classification grid for self-assessment

## Devices (6)

3D model cards, celebrity profile image, citation popup, grid layout, 3D nose model cards, Academic citation card
