# ours-bangs-v1

**evidence explainer** — Explains facial proportions using Anne Hathaway with bangs as an example before pitching an AI facial mapping app.

64.3s · 1080x1920 @30.0

## Animation language

- **signature moves** — Dotted callout line draw-ons, Slider reveal split comparisons, Tag chip pop-ins
- **how things enter** — Line graphics draw on, text tags pop in with spring scale, UI slides vertically.
- **how things leave** — Hard cuts or simple fade outs.
- **how scenes change** — Direct cuts synchronized with editorial audio beat.
- **what stays still** — Main facial portrait base images remain anchored.
- **rhythm** — Rhythmic bursts of annotations tied to narration points.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 84.3% |
| element arrivals / min | 34.6 |
| hard cuts | 6 (5.6/min) |
| median shot | 9.4s |
| transitions | 5 (median 0.37s) |
| speech | 83.5% |
| scene changes that are cuts | 100.0% (6 of 6) |
| ground | `#A0B3B8` flat=True |

## Animations (6)

5 we can already build · **1 we cannot**

### Would need building

**Eye Framing Reticle Focus** — Corner bracket reticles surrounding the eye area  
`scale` · inward · snappy  
*Purpose:* Directs focus to eye framing differences between styles.  
*Reusable as:* Focusing viewer attention on specific detail regions.  
*Build:* Framing reticle box animation primitive

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Before/After Split Reveal | `SliderReveal` | Compares two hairstyles side-by-side on the same facial features. |
| Measurement Line and Label Draw | `DrawnCallout` | Highlights anatomical boundaries between hairline and brow. |
| Facial Third Brackets Stagger | `TagStack` | Isolates upper facial proportions visually. |
| Side-by-Side Proportion Box Draw | `DrawnCallout` | Demonstrates contrasting face ratios across different people. |
| Dossier App Screen Scroll | `ScrollReveal` | Showcases product interface and generated dossier reports. |

## What to steal, ranked

1. Dotted measurement lines drawing onto portrait landmarks
2. Eye framing corner reticles for targeted visual callouts
3. Interactive slider reveal for hair/style comparisons

## Timeline — every animation instance (24)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `fade` | Header text 'Which look do you prefer? | Which look do you prefer? |
| 2.8s | `wipe` | Split line, labels 'A' and 'B', and 'E | A | B | EDITED PHOTOGRAPH |
| 3.2s | `fade` | Footer caption text | With bangs, or without? |
| 4.5s | `cut` | Close-up crop of face with header 'Hai | Hairline to brow. |
| 6.5s | `draw-on` | Top dashed hairline marker line and te | HAIRLINE |
| 7.5s | `draw-on` | Bottom dashed brow marker line and tex | BROW |
| 8.5s | `draw-on` | Side bracket graphic | Upper facial measurement span |
| 10.5s | `fade` | 'UPPER FACIAL THIRD' badge | UPPER FACIAL THIRD |
| 13.5s | `cut` | Grid division lines for UPPER, MIDDLE, | Add a fringe. | UPPER | MIDDLE | LOWER |
| 17.5s | `fade` | 'SAME STRUCTURE' badge text | SAME STRUCTURE |
| 20.5s | `fade` | Header text 'What you perceive.' | What you perceive. |
| 21.0s | `fade` | 'STRUCTURE VS. PERCEPTION' badge | STRUCTURE VS. PERCEPTION |
| 23.0s | `cut` | Split camera shot with 'WITHOUT' and ' | Same eyes. Different frame. | WITHOUT | WITH |
| 26.0s | `scale` | Focus frame brackets and target circle | Eye framing reticles |
| 30.5s | `cut` | Two model portraits with fringe haircu | Same haircut. Two faces. | FRINGE, GENERATED |
| 36.5s | `fade` | Header text 'Facial harmony is persona | Facial harmony is personal. |
| 39.0s | `draw-on` | 'TALL UPPER THIRD' and 'SHORT UPPER TH | TALL UPPER THIRD | SHORT UPPER THIRD |
| 43.5s | `cut` | Header text 'Now look again.' over ful | Now look again. |
| 45.0s | `wipe` | Split portrait with option labels 'A'  | A or B? | A | B |
| 47.5s | `fade` | 'COMMENT A OR B' badge | COMMENT A OR B |
| 48.5s | `cut` | Smartphone frame with interactive faci | Your face, mapped. | THE FACIAL DOSSIER |
| 51.0s | `translate` | 'Your Strongest Features' analysis car | Wide-set and almond | High-arched | Full and |
| 55.0s | `translate` | Grid of hair variations and color prev | HAIRSTYLES / HAIR COLORS preview cards |
| 60.0s | `cut` | Title, CTA button, and search input fi | Your face, understood. | GET YOUR FACIAL DOS |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | split portrait | split screen, A/B labels, interactive text overlay |
| 4.5s | 135 | transition | close-up portrait | measurement lines, graphic labels |
| 14.0s | 420 | yes | portrait with grid overlay | proportion dividers, text chips |
| 23.4s | 702 | yes | split close-up | focus reticles, split screen |
| 30.4s | 912 | yes | side-by-side portrait | side-by-side comparison, dimension boxes |
| 43.767s | 1313 | yes | split portrait | split screen, comment badge |
| 48.567s | 1457 | yes | phone mockup | phone frame, app interface scroll, search bar graphic |

## Narrative arc

1. Engagement Hook: Celebrity A/B comparison.
2. Educational Insight: Explanation of facial third proportions.
3. Visual Proof: Side-by-side analysis of different forehead lengths.
4. Call to Action & Product Solution: Introducing Refina AI for personal facial mapping.

## Devices (17)

split screen, A/B labels, interactive text overlay, measurement lines, graphic labels, proportion dividers, text chips, focus reticles, side-by-side comparison, dimension boxes, comment badge, phone frame, app interface scroll, search bar graphic, Split Screen Comparison, Proportion Overlays, Phone UI Mockup
