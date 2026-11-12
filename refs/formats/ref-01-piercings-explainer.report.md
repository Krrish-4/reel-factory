# ref-01-piercings-explainer

**evidence explainer** — An evidence-based video examining how facial piercings impact societal perceptions of attractiveness and intelligence.

55.533s · 1080x1920 @30.0

## Animation language

- **signature moves** — Dynamic photo piercer morph overlays, Arc avatar tag stagger, Vertical bar chart growth with avatar icons
- **how things enter** — Elements pop in with slight scale spring or slide upward into structured UI frames.
- **how things leave** — Elements vanish instantly on hard cuts or push off-screen upwards.
- **how scenes change** — Hard cuts synchronized to audio beat with centered subjects.
- **what stays still** — Main background color and core subject facial alignments.
- **rhythm** — Fast-paced, high density arrival cadence synced strictly to voiceover narration.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 50.5% |
| element arrivals / min | 117.8 |
| hard cuts | 5 (5.4/min) |
| median shot | 4.93s |
| transitions | 16 (median 0.6s) |
| speech | 95.1% |
| scene changes that are cuts | 62.5% (5 of 8) |
| ground | `#9FB5BF` flat=False |

## Animations (10)

7 we can already build · **3 we cannot**

### Would need building

**Bar Graph Vertical Rise with Badges** — Chart bars and avatar top badges  
`scale` · up · smooth · staggered  
*Purpose:* Visualizes statistical drop in ratings clearly.  
*Reusable as:* Data-driven research findings comparison.  
*Build:* Animated Bar Chart with headshot data badges

**2x2 Image Grid Stagger Pop** — Four variation portrait cards  
`scale` · outward · snappy · staggered  
*Purpose:* Displays 4 condition variants simultaneously.  
*Reusable as:* Multi-variant feature grid.  
*Build:* 2x2 Grid Stagger Reveal component

**Expectations Ratio Bar Fill** — Horizontal progress bar fill level  
`scale` · left-to-right · smooth  
*Purpose:* Compares social bias threshold between genders.  
*Reusable as:* Comparison metric or progress gauge.  
*Build:* Horizontal split comparison bar

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Title Text Pop and Subtitle Fade | `Reveal` | Hooks viewer instantly with prompt and dynamic text. |
| Avatar Arc Tag Assembly | `TagStack` | Shows rater sample size visually across test conditions. |
| Facial Piercing Overlay Morph | `SliderReveal` | Demonstrates piercing additions sequentially on identical face. |
| Trait Tag Bubble Arrivals | `TagStack` | Highlights descriptive psychological traits assigned by raters. |
| Context Media Cards Stack Reveal | `SlideIn` | Illustrates qualitative abstract themes (artistic, creative). |
| Circular Profile Card Popup | `PopIn` | Transitions subject to professional job market context. |
| UI Report Vertical Scroll | `ScrollReveal` | Shows full automated facial report demo. |

## What to steal, ranked

1. Bar Graph Vertical Rise with Badges for animated statistical callouts
2. Avatar Arc Tag Assembly for dynamic audience/sample visualization
3. 2x2 Image Grid Stagger Pop for multi-condition photo comparisons

## Timeline — every animation instance (20)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `fade` | Headline text and portrait | Do piercings ruin your face? |
| 1.0s | `fade` | Text badge | SABRINA CARPENTER AMERICAN SINGER |
| 2.2s | `cut` | Portrait and label | ZENDAYA AMERICAN ACTRESS |
| 5.0s | `translate` | Document graphic | Swami study paper snippet |
| 6.2s | `translate` | Photo cards and avatar row | Tom Holland unpierced vs pierced |
| 7.5s | `fade` | Photo card text and graphic | 1 PIERCING |
| 8.5s | `fade` | Photo card text and graphic | 3+ PIERCINGS |
| 11.8s | `cut` | Portrait image | Male model with lip and nose piercings |
| 15.0s | `translate` | Chart card | The influence of facial piercings |
| 16.5s | `fade` | Text header | More Piercings = Less Hot |
| 22.5s | `translate` | Photo cards | Unpierced vs 1 Piercing |
| 25.5s | `translate` | Grid layout expand | 2 PIERCINGS, 3+ PIERCINGS |
| 29.0s | `fade` | Bar graphic | SOCIAL EXPECTATIONS / MEN / WOMEN |
| 33.0s | `translate` | Photo cards and citation label | Unpierced vs 3+ Piercings |
| 37.0s | `scale` | Text badges | INTELLIGENT, ATTRACTIVE, FASHIONABLE |
| 41.0s | `translate` | Video thumbnail cards | @CORAL_CERAMICS, @ARTBYFEE, @ALINAROLLING |
| 46.2s | `cut` | Portrait and label text | LENNY KRAVITZ AMERICAN SINGER, SONGWRITER |
| 49.5s | `scale` | Circular image badge | LinkedIn headshot |
| 52.0s | `translate` | Interface cards | Nose Recommendations, Ear Recommendations |
| 54.2s | `fade` | Search bar element | Qoves.com |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed portrait | digital piercing overlay, kinetic typography, celebrity imagery |
| 6.133s | 184 | yes | centered portrait mockup with avatar carousel | paper cutout overlay, academic citation card, interactive toggle UI |
| 11.8s | 354 | yes | full-bleed portrait with circular zoom | digital piercing overlay, circular zoom transition |
| 14.467s | 434 | yes | chart panel | animated bar chart, academic citation card, headshot indicators |
| 22.0s | 660 | transition | 2x2 grid panel | multi-panel grid, label chips |
| 28.8s | 864 | transition | split side-by-side card | progress comparison bar, split comparison card |
| 32.2s | 966 | transition | portrait image over grid with floating media tiles | floating trait badges, social video embeds, academic citation card |
| 45.8s | 1374 | transition | full-bleed portrait transitioning to circular mask | circular mask transition, platform mockup |
| 51.5s | 1545 | transition | app UI report mockup to search bar | UI report card mockup, search bar input |

## Narrative arc

1. Hook questioning traditional views on facial piercings using celebrity edits.
2. Presentation of academic study data showing negative impacts on male attractiveness and perceived intelligence.
3. Gender comparison showing a smaller negative impact on female attractiveness ratings.
4. Nuanced counter-analysis showing positive associations with creativity, artistic flair, and mystery.
5. Contextual conclusion contrasting artistic icon perception vs corporate headshot standards.
6. Call to action for custom facial analysis software.

## Devices (19)

Academic citation card, Digital piercing overlay, Interactive toggle UI, Animated bar chart, Floating trait badges, kinetic typography, celebrity imagery, paper cutout overlay, circular zoom transition, headshot indicators, multi-panel grid, label chips, progress comparison bar, split comparison card, social video embeds, circular mask transition, platform mockup, UI report card mockup, search bar input
