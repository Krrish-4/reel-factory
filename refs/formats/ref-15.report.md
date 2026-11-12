# ref-15

**educational explainer** — This video analyzes Billie Eilish's features to explain the 'Light Summer' color palette, showcasing ideal neutrals, accents, and colors to avoid.

46.792s · 1080x1920 @24.0

## Animation language

- **signature moves** — Radial palette pop-in, Dynamic clothing color swapping
- **how things enter** — Elements scale up with elastic overshoot or slide in smoothly.
- **how things leave** — Fading out or being covered by the next full-screen card.
- **how scenes change** — Abrupt cuts or full-screen card wipes.
- **what stays still** — The central portrait of the subject.
- **rhythm** — Bursty, with rapid radial pops followed by static demonstration periods.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 44.5% |
| element arrivals / min | 75.7 |
| hard cuts | 0 (0.0/min) |
| median shot | 46.79s |
| transitions | 14 (median 0.73s) |
| speech | 88.9% |
| scene changes that are cuts | 0.0% (0 of 5) |
| ground | `#8F8A90` flat=False |

## Animations (5)

2 we can already build · **3 we cannot**

### Would need building

**Profile Color Bar Reveal** — Horizontal color bar with text labels and pointers  
`translate` · left-to-right · smooth · staggered  
*Purpose:* Displays subject's color characteristics (eyes, skin, hair).  
*Reusable as:* Profile breakdown bar for visual analysis.  
*Build:* Multi-pointer slider bar with staggered label pop-ins

**Radial Palette Pop-In** — Color wedges around a central circular portrait  
`scale` · outward · elastic · staggered  
*Purpose:* Visually surrounds the face with complementary neutral colors.  
*Reusable as:* Radial category display or feature breakdown.  
*Build:* Radial segment pop-in around a central mask

**Clothing Color Swap** — Color of the subject's turtleneck  
`fade` · none · smooth  
*Purpose:* Demonstrates color impact against skin tone.  
*Reusable as:* Product color swapper for apparel or cosmetics.  
*Build:* Masked color/texture swap transition

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Avoidance Color Grid | `PopIn` | Lists colors to avoid. |
| Cheat Sheet Reveal | `Reveal` | Provides a shareable summary card. |

## What to steal, ranked

1. Radial Palette Pop-In for interactive color/feature wheels
2. Clothing Color Swap for dynamic product customization previews

## Timeline — every animation instance (40)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `fade` | Title text and subtitle | "Light Summer Color Analysis", "BILLIE EILIS |
| 1.0s | `translate` | Color bar, pointers, and labels | "Eyes", "Skin", "Hair" |
| 1.0s | `fade` | Subtitle | "fair skin, light eyes," |
| 2.0s | `fade` | Subtitle | "and low to medium" |
| 3.0s | `fade` | Subtitle | "contrast coloring," |
| 4.0s | `fade` | Subtitle | "you may fall into the" |
| 5.0s | `fade` | Season title and subtitle | "Light summer", "light summer color season." |
| 7.0s | `fade` | Subtitle | "So listen closely" |
| 8.0s | `fade` | Subtitle | "for your very best colors" |
| 9.0s | `wipe` | Circular mask and header text | "These are your complimentary neutrals" |
| 10.0s | `translate` | Color wedge and label | "SOFT WHITE" |
| 11.0s | `translate` | Color wedge and label | "DOVE GRAY" |
| 12.0s | `translate` | Color wedge and label | "COOL BEIGE" |
| 13.0s | `translate` | Color wedge and label | "DUSTY TAUPE" |
| 14.0s | `translate` | Color wedge and label | "LIGHT MUSHROOM" |
| 15.0s | `translate` | Color wedge and label | "MISTY NAVY" |
| 16.0s | `translate` | Color wedge and label | "PALE STONE" |
| 17.0s | `fade` | Background and clothing color | "Supporting your undertones" |
| 18.0s | `fade` | Subtitle | "instead of sitting on top of it." |
| 20.0s | `wipe` | Circular mask and header text | "These are your accent colors" |
| 21.0s | `translate` | Color wedges and labels | "POWDER BLUE", "PERIWINKLE" |
| 22.0s | `translate` | Color wedge and label | "COOL PINK" |
| 23.0s | `translate` | Color wedge and label | "SOFT RASPBERRY" |
| 24.0s | `translate` | Color wedges and labels | "LAVENDER", "SEAFOAM" |
| 25.0s | `translate` | Color wedge and label | "ICY ROSE" |
| 26.0s | `translate` | Color wedge and label | "MUTED AQUA" |
| 28.0s | `fade` | Background and clothing color | "bring life into the face" |
| 29.0s | `fade` | Subtitle | "without overpowering the eyes." |
| 31.0s | `cut` | Video clip and header text | "Avoid these" |
| 31.0s | `translate` | Color swatch and label | "JET BLACK" |
| 32.0s | `translate` | Color swatch and label | "BURNT ORANGE" |
| 33.0s | `translate` | Color swatch and label | "MUSTARD" |
| 34.0s | `translate` | Color swatch and label | "DEEP CAMEL" |
| 35.0s | `translate` | Color swatch and label | "NEON BRIGHTS" |
| 36.0s | `fade` | Stamp graphic and text | "Not ideal" |
| 40.0s | `fade` | Grid layout and headers | "Screenshot this", "EYES", "HAIR", "SKIN" |
| 41.0s | `fade` | Color lists and section headers | "INCLUDE /", "AVOID /" |
| 43.0s | `cut` | Man's portrait and background | "And if you want us to analyze" |
| 44.0s | `translate` | Search bar graphic |  |
| 45.0s | `draw-on` | Text inside search bar | "Qoves.com" |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed portrait with graphic overlay | color analysis slider |
| 9.0s | 216 | transition | circular mask with rotating color wheel | color wheel overlay |
| 19.0s | 456 | transition | circular mask with rotating color wheel | color wheel overlay |
| 30.0s | 720 | transition | split screen with color swatches | color swatches |
| 39.0s | 936 | transition | graphic grid | cheat sheet graphic |
| 42.0s | 1008 | transition | centered graphic on solid background | search bar mockup |

## Narrative arc

1. Identify the target audience based on physical traits.
2. Present ideal neutral colors for the 'Light Summer' palette.
3. Present ideal accent colors that complement the skin tone.
4. Showcase colors to avoid and explain why they are unflattering.
5. Provide a summary cheat sheet for viewers to save.
6. Call to action to get a personalized color analysis.

## Devices (5)

color wheel overlay, color analysis slider, color swatches, cheat sheet graphic, search bar mockup
