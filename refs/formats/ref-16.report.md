# ref-16

**evidence explainer** — This video uses scientific data and visual examples to show that the gap between our 'best' and 'average' photos is mostly in our heads.

66.792s · 1080x1920 @24.0

## Animation language

- **signature moves** — SliderReveal wipes for comparisons, Elastic PopIn for photo panels, DrawnCallout for detailing image features
- **how things enter** — Elements slide up from the bottom or scale up with a slight spring bounce.
- **how things leave** — Elements scale down or are covered by sliding overlays.
- **how scenes change** — Wipes and slide-overs transition between different comparison layouts.
- **what stays still** — The solid pastel background and main text headers.
- **rhythm** — Bursty, with rapid photo montages alternating with slower, data-driven chart animations.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 60.4% |
| element arrivals / min | 94.4 |
| hard cuts | 1 (0.9/min) |
| median shot | 33.4s |
| transitions | 17 (median 0.75s) |
| speech | 93.4% |
| scene changes that are cuts | 33.3% (1 of 3) |
| ground | `#9EB6BF` flat=True |

## Animations (10)

8 we can already build · **2 we cannot**

### Would need building

**Bar Chart Growth** — Chart bars and percentage labels  
`scale` · up · elastic · staggered  
*Purpose:* Visualize statistical data comparing self-rating vs others' rating.  
*Reusable as:* Displaying survey results or comparative metrics.  
*Build:* BarChartGrow

**Photo Position Swap** — Two photo panels  
`translate` · horizontal · smooth  
*Purpose:* Illustrate the concept of having things 'backwards'.  
*Reusable as:* Swapping priority or order of two compared items.  
*Build:* SwapPanels

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Camera Outline Trace | `ContourDraw` | Introduce the photography theme over the subject's face. |
| Best Photo Reveal | `SliderReveal` | Reveal the 'best photo' behind the subject's face. |
| Photo Reposition and Pop | `PopIn` | Compare the best photo side-by-side with an average photo. |
| Comparison Divider Sweep | `SliderReveal` | Draw attention to the contrast between the two photos. |
| Average Photo Slide Over | `SlideOver` | Show the average photo overtaking the best photo in preference. |
| Feature Callouts | `DrawnCallout` | Point out specific casual details like glasses and earphones. |
| Glamour Shoot Montage | `Montage` | Show a rapid succession of professional modeling shoots. |
| Phone Frame Slide In | `SlideIn` | Introduce social media reaction videos. |

## What to steal, ranked

1. SwapPanels for intuitive visual reversals of compared items.
2. BarChartGrow for clean, animated data presentation.

## Timeline — every animation instance (56)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `draw-on` | Camera graphic |  |
| 1.0s | `fade` | Text | Let's do an experiment. |
| 2.0s | `mask-reveal` | Photo card |  |
| 2.0s | `fade` | Text | BHAVITHA MANDAVA, INDIAN MODEL |
| 4.0s | `fade` | Text | YOUR BEST PHOTO |
| 5.0s | `translate` | Screen content | How much better is your best photo? |
| 5.0s | `translate` | Photo card |  |
| 7.0s | `translate` | Photo card |  |
| 7.0s | `fade` | Text | YOUR AVERAGE PHOTO |
| 8.0s | `draw-on` | Timer graphic |  |
| 10.0s | `fade` | Text | Most people think it's way better. |
| 11.0s | `scale` | Photo cards |  |
| 13.0s | `translate` | Screen content | But most people are wrong. |
| 13.5s | `fade` | Video card |  |
| 14.0s | `fade` | Text | Aella, (2025, January 21). People are delusi |
| 15.0s | `fade` | Chart graphic | ATTRACTIVENESS |
| 16.0s | `fade` | Text | SELF RATING/ |
| 16.5s | `scale` | Chart bar |  |
| 17.0s | `fade` | Text | +17% |
| 19.5s | `fade` | Text | OTHERS RATING/ |
| 20.0s | `scale` | Chart bar |  |
| 21.0s | `fade` | Text | +5% |
| 23.0s | `translate` | Screen content | 1 in 3 have it backwards |
| 23.5s | `translate` | Photo cards |  |
| 25.0s | `fade` | Text | Others prefer your "average" to your favorit |
| 26.0s | `scale` | Photo cards |  |
| 31.0s | `translate` | Screen content | Take a look at this photo |
| 31.5s | `fade` | Photo card |  |
| 33.0s | `translate` | Screen content | She might think this is a "bad photo" |
| 33.5s | `translate` | Photo card |  |
| 36.0s | `fade` | Text | CASUAL PHOTO |
| 37.0s | `draw-on` | Pointer graphic | Glasses |
| 38.0s | `draw-on` | Pointer graphic | Earphones |
| 39.0s | `translate` | Screen content | She probably thinks there's a big difference |
| 39.5s | `translate` | Photo cards |  |
| 40.0s | `fade` | Photo card |  |
| 41.0s | `fade` | Photo card |  |
| 42.0s | `fade` | Photo card |  |
| 43.0s | `fade` | Photo card |  |
| 45.0s | `translate` | Screen content | But we can see she always looks good. |
| 45.5s | `fade` | Photo card |  |
| 46.0s | `fade` | Photo card |  |
| 47.0s | `fade` | Photo card |  |
| 48.0s | `fade` | Photo card |  |
| 49.0s | `fade` | Photo card |  |
| 51.0s | `translate` | Screen content | The same is true about you |
| 53.0s | `translate` | Screen content | You think your photos are so different. |
| 53.0s | `translate` | Phone graphic |  |
| 53.5s | `fade` | Video |  |
| 54.0s | `fade` | Text | when someone shows me a bad picture they too |
| 56.0s | `translate` | Screen content | Other people would disagree. |
| 58.0s | `fade` | Video |  |
| 58.0s | `fade` | Text | When she says "delete that photo I look so s |
| 65.0s | `translate` | Screen content |  |
| 65.0s | `translate` | Search bar graphic |  |
| 65.5s | `draw-on` | Text | Qoves.com |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed portrait with floating image cards | camera graphic overlay, image cards |
| 13.0s | 312 | transition | chart panel with floating photo inserts | bar chart, citation text |
| 30.0s | 720 | transition | split-screen and slideshow of model photos | labeled pointers, photo slideshow |
| 50.0s | 1200 | transition | phone mockup frame over solid background | phone mockup, search bar UI |

## Narrative arc

1. Prompt the viewer to visualize their best photo.
2. Introduce the common belief that our best photos are vastly superior.
3. Debunk this belief using statistical data from the Aella study.
4. Apply the data to a real-world case study of a professional model.
5. Relate the findings back to the viewer's personal life using UGC examples.
6. Call to action to visit the brand's website for self-improvement.

## Devices (8)

camera graphic overlay, bar chart, phone mockup, search bar UI, image cards, citation text, labeled pointers, photo slideshow
