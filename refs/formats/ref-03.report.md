# ref-03

**evidence explainer** — Reviews three evidence-backed methods for increasing eyebrow density using clinical study citations and visual overlays.

57.0s · 1080x1920 @30.0

## Animation language

- **signature moves** — Vector outline brow highlights, Interactive comparison slider sweeps, UI paper citation card PopIns
- **how things enter** — Elements pop in with slight scale overshoot or slide in on clean semi-transparent cards.
- **how things leave** — Elements slide off downwards or fade smoothly as new focus points arrive.
- **how scenes change** — Hard cuts timed precisely to voiceover topic switches.
- **what stays still** — Center portrait focal points remain grounded while graphic overlays animate around them.
- **rhythm** — Constant rapid bursts of graphic context overlays synchronized with speech.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 47.7% |
| element arrivals / min | 152.7 |
| hard cuts | 9 (9.5/min) |
| median shot | 3.0s |
| transitions | 12 (median 1.03s) |
| speech | 96.9% |
| scene changes that are cuts | 100.0% (9 of 5) |
| ground | `#9FB5BE` flat=False |

## Animations (8)

5 we can already build · **3 we cannot**

### Would need building

**Application Routine & Timeline Sweep** — Dropper applicator icon translates over brow while progress bar fills  
`translate` · left-to-right · smooth · staggered  
*Purpose:* Demonstrate daily application protocol and trial duration.  
*Reusable as:* Interactive process guides and timeline progress trackers.  
*Build:* Progress timeline bar with sync'd moving cursor asset

**Density Spectrum Pointer** — Pointer handle travels along discrete brow density spectrum axis  
`translate` · left-to-right · smooth  
*Purpose:* Indicate suitability threshold along a spectrum.  
*Reusable as:* Value meters, intensity sliders, or diagnostic scales.  
*Build:* Interactive spectrum scale slider widget

**Facial AI Feature Scan Overlay** — Grid mesh texture, slider control, and eyebrow contour path animation  
`draw-on` · outward · snappy · staggered  
*Purpose:* Simulate AI face analysis software feature.  
*Reusable as:* Tech previews, biometric scans, or interactive assessment promos.  
*Build:* Biometric face scan UI component with vector path tracing

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Eyebrow Bounding Corner Callouts | `DrawnCallout` | Focus attention on specific facial feature being analyzed. |
| Study Citation Card Slide-In | `PopIn` | Present scientific paper citations and expert credentials. |
| Clinical Trial Subject Stack Carousel | `Montage` | Cycle through trial subjects while maintaining comparison context. |
| Split Brow Vector Contour Trace | `ContourDraw` | Isolate and compare treated brow against control side. |
| Microblading Split Comparison Reveal | `SliderReveal` | Show dramatic before/after microblading detail. |

## What to steal, ranked

1. Facial feature vector contour tracing overlays for visual proof points
2. Interactive timeline sweep with moving tool/applicator asset
3. Spectrum density slider for categorical suitability visualization

## Timeline — every animation instance (29)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `fade` | Text overlay | Dense Brows |
| 0.5s | `fade` | Text and subject label | Dense Brows = Sexy / LAMINE YAMAL SPANISH FO |
| 1.5s | `draw-on` | Graphic framing UI | Eyebrow highlights on Lamine Yamal |
| 3.8s | `cut` | Subject photo and text header | But how do you get dense brows? |
| 4.5s | `draw-on` | Text tag and outline graphics | ELLE FANNING AMERICAN ACTRESS |
| 5.8s | `scale` | UI progress bar | METHOD 1/3 BIMATOPROST |
| 6.0s | `scale` | Information card | Bimatoprost 0.03% Carruthers et al. |
| 7.0s | `fade` | Text label | DR. JEAN CARRUTHERS, MD PROF. BRITISH COLUMB |
| 10.0s | `fade` | Graphic card and icon | Apply twice daily |
| 10.5s | `translate` | Slider bar UI | 7 MONTH PROGRESSION |
| 17.0s | `cut` | Video frame | Dermatologist talking head |
| 19.5s | `cut` | Video frame and handle | @AAMNAADEL applying serum |
| 20.2s | `morph` | Header UI | METHOD 2/3 MINOXIDIL |
| 23.0s | `fade` | Info card | Minoxidil 2% Lee et al. |
| 25.0s | `draw-on` | Text tags and graphic outlines | TREATED / PLACEBO |
| 27.0s | `fade` | Subject photo background | Male subject comparison |
| 29.0s | `fade` | Subject photo background | Female subject comparison |
| 32.0s | `morph` | Header UI | METHOD 3/3 MICROBLADING |
| 32.5s | `scale` | Interactive scale UI | Brow density scale (Sparse - Balanced - Full |
| 33.0s | `translate` | UI slider indicator | Slider moving to Fuller position |
| 38.0s | `cut` | Portrait and target icon | Sparse brow highlight |
| 41.0s | `cut` | Portrait and dashed line graphic | Thin brow highlight |
| 43.0s | `scale` | Video insert | Microblading application procedure |
| 44.0s | `fade` | Text handle | @BEAUTY_STUDIO |
| 46.0s | `fade` | Stacked photo cards | Before / After eyebrow close-up |
| 48.0s | `scale` | Single photo card | Detailed eyebrow hair strokes |
| 52.0s | `mask-reveal` | Model portrait and grid overlay | Facial scan mesh animation |
| 54.0s | `scale` | UI info cards and eyebrow diagrams | Contrast slider, Brow Analysis diagram, Low  |
| 56.0s | `scale` | Search bar UI | Qoves.com |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed vertical portrait | celebrity highlight, bounding box graphic |
| 3.6s | 108 | yes | full-bleed vertical portrait | celebrity highlight, bounding box graphic |
| 5.8s | 174 | transition | floating modal cards over pastel background | paper citation card, researcher portrait card, progress slider UI, dropper animation graphic, UGC video insert |
| 20.2s | 606 | transition | centered portrait cards with overlay tags | paper citation card, split-face comparison overlay,  eyebrow mask outline |
| 32.033s | 961 | yes | split view with density scale metric and video player | density scale slider UI, procedure close-up clip, before/after comparison card |
| 51.8s | 1554 | transition | full-bleed portrait to search UI overlay | facial mesh scan graphic, brow analysis HUD widget, search bar overlay |

## Narrative arc

1. Highlight brow density as a key aesthetic factor.
2. Introduce Bimatoprost study results for sparse brows.
3. Present Minoxidil study results as an alternative medical solution.
4. Explain Microblading as a cosmetic solution suitable for moderately thin brows.
5. Direct viewer to Qoves.com for personal face and brow analysis.

## Devices (19)

celebrity highlight, bounding box graphic, paper citation card, Progress Slider UI, researcher portrait card, dropper animation graphic, UGC video insert, split-face comparison overlay,  eyebrow mask outline, density scale slider UI, procedure close-up clip, before/after comparison card, facial mesh scan graphic, brow analysis HUD widget, search bar overlay, Scientific Citation Card, Split-Face Comparison, Brow Density Scale UI, Facial Analysis HUD
