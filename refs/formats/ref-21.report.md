# ref-21

**evidence explainer listicle** — Educational skincare guide explaining how men should select sunscreen based on SPF, PA rating, and skin type.

66.233s · 1080x1920 @29.97

## Animation language

- **signature moves** — Split-screen comparison wipe, Interactive diagram vector draw-ons, Layered parameter range sliders, Stacked selection card flips
- **how things enter** — Elements scale up springily or slide into frame along vertical/horizontal axes.
- **how things leave** — Quick fade out or sliding off-screen to clear frame.
- **how scenes change** — Direct hard cuts coupled with visual overlay card pops.
- **what stays still** — Central portrait subjects and main background canvas.
- **rhythm** — Fast-paced, highly informative pulse with visuals changing every 1-2 seconds.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 51.2% |
| element arrivals / min | 88.8 |
| hard cuts | 30 (27.2/min) |
| median shot | 1.5s |
| transitions | 19 (median 0.2s) |
| speech | 99.8% |
| scene changes that are cuts | 100.0% (30 of 7) |
| ground | `#E7E7E7` flat=False |

## Animations (9)

3 we can already build · **6 we cannot**

### Would need building

**UV Sensitivity Gauge Pointer** — A indicator arrow slides along a vertical gradient bar showing UV sensitivity.  
`translate` · down · smooth  
*Purpose:* Connects skin scale classifications to UV vulnerability level.  
*Reusable as:* Rating indicators, gauge meters, or parameter sliders.  
*Build:* Animated slider pointer moving along a color scale bar.

**Step Selection Stack Deck** — Three numbered criteria cards dynamic shuffle into focal position.  
`translate` · left-to-right · snappy · staggered  
*Purpose:* Establishes a 3-step decision framework for product selection.  
*Reusable as:* Step-by-step tutorial cards or feature comparison carousels.  
*Build:* 3D overlapping stack carousel transition component.

**UV Ray Penetration Diagram** — Red directional ray lines extend downward into skin layers, spawning a glowing heat zone.  
`draw-on` · down · mechanical  
*Purpose:* Explains anatomical mechanism of UVB light damage on epidermis.  
*Reusable as:* Illustrating depth absorption or particle impact vectors.  
*Build:* Ray vector drawing with animated hit-point flare effect.

**SPF Range Target Bar** — A target range segment highlights along a horizontal numerical scale bar.  
`wipe` · left-to-right · smooth  
*Purpose:* Recommends exact SPF range for target demographic.  
*Reusable as:* Dosage recommendations or target numerical range indicators.  
*Build:* Horizontal range highlight bar animator.

**PA Protection Depth Beams** — Four vertical color rating beams drop down into skin cross-section at varying depths.  
`translate` · down · smooth · staggered  
*Purpose:* Visually maps PA rating strength to depth of radiation blockage.  
*Reusable as:* Layer penetration depth charts or shield effectiveness meters.  
*Build:* Multi-column penetration depth chart with staggered fill animations.

**Skin Texture Split Panel** — Three vertical texture swatch panels expand into place side-by-side.  
`scale` · outward · snappy · staggered  
*Purpose:* Categorizes skin types (Oily, Dry, Sweaty) by surface visual characteristics.  
*Reusable as:* Material texture comparisons or side-by-side condition displays.  
*Build:* 3-column comparative texture grid expander.

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Split Aging Face Slider | `SliderReveal` | Demonstrates sun damage impact visually on the same face. |
| Fitzpatrick Scale List Stagger | `TagStack` | Introduces standard dermatological skin type classifications sequentially. |
| Callout Badge Pop | `DrawnCallout` | Highlights specific skin concerns (pigmentation and aging) on face area. |

## What to steal, ranked

1. Anatomical skin cross-section light penetration diagram with ray draw-ons
2. Interactive age comparison slider wipe on human facial portraits
3. Multi-tier PA depth protection bar chart overlay
4. 3D stacked card deck transition for multi-step selection logic

## Timeline — every animation instance (54)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `fade` | SunAgeing text and male model face | SunAgeing |
| 0.5s | `translate` | Interactive comparison slider | Aged skin comparison slider |
| 4.0s | `fade` | Header text | Fitzpatrick scale |
| 4.2s | `fade` | Subheader text | SKIN TYPE |
| 4.5s | `translate` | Skin type option card | TYPE I |
| 4.8s | `translate` | Skin type option card | TYPE II |
| 5.0s | `translate` | Skin type option card | TYPE III |
| 5.2s | `translate` | Skin type option card | TYPE IV |
| 5.5s | `translate` | Skin type option card | TYPE V |
| 5.8s | `translate` | Skin type option card | TYPE VI |
| 6.5s | `translate` | Vertical scale indicator | UV SENSITIVE : |
| 8.0s | `translate` | Scale pointer arrow | Types IV & V highlight |
| 11.0s | `fade` | Horizontal spectrum bar | BURN / PIGMENT |
| 13.0s | `scale` | Forehead overlay box | AGE |
| 13.5s | `scale` | Cheek overlay box | PIGMENT |
| 15.0s | `translate` | 3D bottle graphic | Sunscreen bottle |
| 18.0s | `translate` | Selection card 01 | 01 SPF |
| 18.5s | `translate` | Selection card 02 | 02 PA RATING |
| 19.0s | `translate` | Selection card 03 | 03 SKIN TYPE |
| 20.0s | `scale` | Selection card 01 | 01 SPF |
| 21.0s | `cut` | Product video | Deconstruct Gel Sunscreen |
| 23.0s | `cut` | Product shot | Garnier Super UV |
| 24.0s | `cut` | User video clip | Sunscreen demo |
| 26.0s | `fade` | Anatomical cross section diagram | UVB badge |
| 27.0s | `translate` | Ray graphic animation | UVB Ray animation |
| 28.0s | `fade` | Callout badge | SUNBURN |
| 30.0s | `cut` | Live action clip | Beach volleyball players |
| 32.0s | `fade` | Product photo with slider overlay | 30-50 SPF range |
| 35.5s | `scale` | Selection card 02 | 02 PA RATING |
| 37.0s | `cut` | Product photo | Re'equil Sunscreen |
| 38.0s | `scale` | Highlighted text overlay | PA++++ |
| 40.0s | `fade` | Anatomical cross section diagram | UVA badge |
| 41.0s | `translate` | Ray graphic animation | UVA Ray penetration |
| 42.0s | `fade` | Callout text | PENETRATES DEEPER |
| 44.0s | `fade` | Model portrait | Premature ageing demo |
| 45.0s | `fade` | Overlay text | PREMATURE AGEING |
| 47.0s | `mask-reveal` | Red depth bar | PA+ |
| 47.5s | `mask-reveal` | Orange depth bar | PA++ |
| 48.0s | `mask-reveal` | Yellow depth bar | PA+++ |
| 48.5s | `mask-reveal` | Green depth bar | PA++++ |
| 50.0s | `scale` | Product visual with badge | PA++++ highlight |
| 52.0s | `scale` | Selection card 03 | 03 SKIN TYPE |
| 54.0s | `fade` | Header text | Skin Types |
| 54.2s | `fade` | Skin texture column | OILY |
| 54.5s | `fade` | Skin texture column | DRY |
| 54.8s | `fade` | Skin texture column | SWEATY |
| 55.0s | `translate` | Product bottle | Deconstruct Lightweight Gel Sunscreen |
| 56.0s | `translate` | Product bottle | Natio Sun Invisible Fluid |
| 57.0s | `translate` | Product tube | Derma Co Ultra Matte |
| 59.0s | `scale` | Texture column highlight | DRY |
| 60.0s | `translate` | Product tube | Juicy Chemistry Moisturising Sunscreen |
| 62.0s | `scale` | Texture column highlight | SWEATY |
| 63.0s | `translate` | Product tube | Cl Clinic 89 Water Resistant |
| 64.0s | `fade` | Video clip & text overlay | Follow for more rituals for men |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed portrait split screen | split-screen slider, title text |
| 4.137s | 124 | yes | diagram panel | vertical scale diagram, highlight box |
| 10.944s | 328 | yes | full-bleed portrait with overlays | slider scale, callout zooms |
| 18.452s | 553 | yes | card selector view | numbered cards |
| 21.421s | 642 | yes | mixed frame montage and diagram | 3D skin cross-section, product cards, range slider |
| 35.469s | 1063 | yes | diagram and product overlay | animated ray diagram, text highlight box, multi-level bar chart |
| 52.019s | 1559 | yes | 3-column skin texture comparison with product overlays | texture panels, product floating cards |
| 64.498s | 1933 | yes | full-bleed portrait | caption overlay |

## Narrative arc

1. Problem highlight: Sun causes 80% of male skin aging.
2. Scientific context: Fitzpatrick scale explains Indian skin characteristics.
3. Criterion 1 (SPF): Why 30-50 SPF is sufficient for non-burning skin.
4. Criterion 2 (PA Rating): Why PA++++ is critical against deep UVA aging.
5. Criterion 3 (Skin Type): Product recommendations for oily, dry, and sweaty skin.
6. Call to Action: Follow for more male grooming advice.

## Devices (17)

split-screen slider, callout zooms, 3D skin cross-section, numbered cards, title text, vertical scale diagram, highlight box, slider scale, product cards, range slider, animated ray diagram, text highlight box, multi-level bar chart, texture panels, product floating cards, caption overlay, Fitzpatrick scale diagram
