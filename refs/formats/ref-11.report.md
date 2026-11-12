# ref-11

**interactive test / evidence explainer** — An interactive test measuring lip fullness using a research-backed scale with Sydney Sweeney as the visual model.

12.625s · 1080x1920 @24.0

## Animation language

- **signature moves** — Horizontal sliding card carousel, Elastic label pop-ins, Staggered grid/row reveals
- **how things enter** — Elements slide in from the left or pop in with elastic scaling.
- **how things leave** — Fading out quietly to clear the frame.
- **how scenes change** — No hard cuts; elements transition over a static background portrait.
- **what stays still** — The main background portrait of the actress.
- **rhythm** — Bursty, timed with voiceover cues and key visual reveals.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 55.6% |
| element arrivals / min | 71.5 |
| hard cuts | 0 (0.0/min) |
| median shot | 12.62s |
| transitions | 2 (median 1.06s) |
| speech | 86.5% |
| scene changes that are cuts | 0.0% (0 of 0) |
| ground | `#5B636B` flat=False |

## Animations (5)

4 we can already build · **1 we cannot**

### Would need building

**Lip Scale Carousel Shift** — Small lip comparison cards  
`translate` · left-to-right · smooth  
*Purpose:* Shows progression of lip fullness scale dynamically.  
*Reusable as:* Step-by-step product feature comparison.  
*Build:* Horizontal sliding card carousel with active index highlighting.

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Research Paper Slide-In | `SlideIn` | Establishes scientific credibility by showing the source study. |
| Focus Selector Box | `Reveal` | Draws immediate visual focus to the subject's lips. |
| Result Label Pop-In | `PopIn` | Displays the measurement result clearly. |
| Comparison Row Stagger | `TagStack` | Presents the full scale for user self-assessment. |

## What to steal, ranked

1. Horizontal sliding card carousel for step-by-step comparisons
2. Staggered row reveal for presenting multi-option scales

## Timeline — every animation instance (13)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `fade` | Let's measure your Lip Fullness! / RES | RESEARCH-BASED Let's measure your Lip Fullne |
| 0.0s | `fade` | 1 - VERY THIN card | 1 - VERY THIN |
| 0.0s | `translate` | 2 - THIN card | 2 - THIN |
| 1.0s | `translate` | 1 - VERY THIN, 2 - THIN, 3 - MODERATE  | 2 - THIN / 3 - MODERATE |
| 2.0s | `translate` | 2 - THIN, 3 - MODERATE, 4 - FULL cards | 3 - MODERATE / 4 - FULL |
| 2.0s | `translate` | Based on this study text and paper ima | Based on this study / Carruthers A, Bogle M. |
| 3.0s | `translate` | 3 - MODERATE, 4 - FULL, 5 - VERY FULL  | 4 - FULL / 5 - VERY FULL |
| 4.0s | `translate` | 4 - FULL, 5 - VERY FULL cards | 5 - VERY FULL |
| 5.0s | `fade` | Based on this study text, paper image, | RESEARCH-BASED Let's measure your Lip Fullne |
| 5.0s | `fade` | How full are yours? text | How full are yours? |
| 5.0s | `fade` | Five small scale cards | 1 - VERY THIN, 2 - THIN, 3 - MODERATE, 4 - F |
| 8.0s | `fade` | Based on this, moderate! text | Based on this, moderate! |
| 11.0s | `fade` | All text and card overlays | How full are yours? / Based on this, moderat |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | Full-bleed portrait with floating UI cards | Lip scale cards, Research paper overlay, Interactive selector box |

## Narrative arc

1. Introduce the lip fullness measurement concept
2. Present scientific backing via academic study
3. Prompt viewer self-assessment and engagement

## Devices (3)

Lip scale cards, Research paper overlay, Interactive selector box
