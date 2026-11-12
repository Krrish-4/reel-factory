# ref-04

**evidence explainer** — This video uses celebrity examples, social media comments, and academic research to argue that women's beauty choices are driven by self-expression and social influences rather than the male gaze.

50.549s · 1080x1920 @30.0

## Animation language

- **signature moves** — Elastic PopIn for social elements, Staggered TrimPath arrows for diagrams, Smooth horizontal card transitions
- **how things enter** — Elements scale up with a spring bounce or slide in from the right edge.
- **how things leave** — Most elements fade out or are covered by incoming panels.
- **how scenes change** — Hard cuts combined with full-screen color shifts and slide-overs.
- **what stays still** — The minimalist pastel background and main conceptual headers.
- **rhythm** — Highly structured and rhythmic, matching the voiceover beats with precise, staggered arrivals.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 37.8% |
| element arrivals / min | 90.3 |
| hard cuts | 4 (4.7/min) |
| median shot | 0.73s |
| transitions | 23 (median 0.43s) |
| speech | 95.1% |
| scene changes that are cuts | 50.0% (4 of 8) |
| ground | `#9FB6C0` flat=False |

## Animations (8)

7 we can already build · **1 we cannot**

### Would need building

**Horizontal Celebrity Scroll** — A continuous horizontal strip of celebrity portraits  
`translate` · right-to-left · floaty  
*Purpose:* Provide a gallery of examples supporting the narrative.  
*Reusable as:* Displaying client logos or user-generated content.  
*Build:* Horizontal continuous scroll container with snapping or constant velocity.

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Social Comment Pop | `PopIn` | Simulate real-time social media feedback popping up around the subject. |
| Avatar Grid Reveal | `PopIn` | Introduce demographic categories and their corresponding motivations. |
| Trend Card Carousel | `SlideOver` | Showcase a rapid succession of visual examples in a compact space. |
| Feature Checklist Ticks | `AnimatedCheckList` | Indicate active criteria being met or noticed. |
| Hub and Spoke Diagram | `TrimPath` | Map out multiple contributing factors to a central theme. |
| Anatomical Block Drop | `Drop` | Metaphorically show external factors filling up a person's mind. |
| Interconnected Network Map | `TrimPath` | Demonstrate complex, reciprocal relationships between different concepts. |

## What to steal, ranked

1. The Hub and Spoke Diagram template for mapping complex relationships visually.
2. The Anatomical Block Drop concept for creative, metaphorical data visualization.
3. The Trend Card Carousel for compact, high-impact visual showcases.

## Timeline — every animation instance (35)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `fade` | Background image, main text, and comme | "Who cares what men think?", "DOJA CAT AMERI |
| 1.0s | `fade` | Background image and artist label | Cardi B image, "CARDI B AMERICAN RAPPER" |
| 2.0s | `fade` | Background image and artist label | Rihanna image, "RIHANNA BARBADIAN SINGER" |
| 3.0s | `cut` | Background, question text, and three m | "What influences women's beauty choices?" |
| 4.0s | `draw-on` | Arrows and "Male approval" labels | "Male approval" |
| 5.0s | `fade` | Female avatars and labels | "Motivation", "Confidence", "Self image" |
| 7.0s | `cut` | Main image of woman with bleached eyeb | "Beauty trends often push boundaries" |
| 8.0s | `translate` | Carousel card | "Bleached eyebrows" |
| 9.0s | `translate` | Carousel card | "Colorful hair" |
| 10.0s | `translate` | Carousel card | "Gradient lips" |
| 11.0s | `translate` | Carousel card | "Laminated brows" |
| 12.0s | `translate` | Carousel card | "Unconventional nail shape" |
| 13.0s | `cut` | Background image of couple and main te | "Appealing to men isn't the goal" |
| 14.0s | `fade` | Checkboxes and "Nice skin!" text bubbl | "Smile", "Eyes", "Skin" checkboxes and "Nice |
| 15.0s | `fade` | Text bubbles | "Beautiful eyes", "Not really into the brows |
| 17.0s | `cut` | Central female avatar and main text | "Who shapes beauty trends?" |
| 18.0s | `fade` | Avatars and arrows | "CREATIVE DIRECTORS", "STYLISTS" |
| 19.0s | `fade` | Avatars and arrows | "MAKEUP ARTISTS", "PHOTOGRAPHERS", "INFLUENC |
| 21.0s | `cut` | Citation text and question box | Citation by Bonell et al. (2022) and "Why di |
| 22.0s | `fade` | Celebrity images and labels | "ARIANA GRANDE", "BILLIE EILISH" |
| 23.0s | `translate` | Celebrity image and label | "KAREN ELSON, ENGLISH MODEL" |
| 25.0s | `translate` | Celebrity image and label | "JENNA ORTEGA, AMERICAN ACTRESS" |
| 28.0s | `translate` | Celebrity image and labels | "EVA MENDES, AMERICAN ACTRESS", "Confidence" |
| 30.0s | `cut` | Mannequin head, main text, syringe, an | "Who do women actually get cosmetic work don |
| 33.0s | `fade` | Text and arrow | "The best answer" |
| 35.0s | `fade` | Label | "Themselves" |
| 36.0s | `fade` | Labels | "Media", "Peers" |
| 37.0s | `cut` | Phone frame, citation, label, and cele | Citation by Rodgers et al. (2016), "Sociocul |
| 39.0s | `translate` | Celebrity image and label | "SYDNEY SWEENEY, AMERICAN ACTRESS" |
| 40.0s | `translate` | Celebrity image, label, and mannequin  | "KENDALL JENNER", "MEDIA", "PEERS", "SOCIAL  |
| 43.0s | `cut` | Main text and top labels | "Multiple interconnected factors shape beaut |
| 44.0s | `fade` | Labels and arrows | "IDENTITY", "SELF-IMAGE", "CONFIDENCE" |
| 47.0s | `cut` | Image of woman |  |
| 48.0s | `cut` | Text elements | "You're Curious? Get your Facial Analysis" |
| 49.0s | `fade` | Search bar and typed text | "acos.com" |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed portrait with floating UI elements | social media comment bubbles, text labels |
| 2.3s | 69 | yes | diagram on solid background | flowchart, avatar icons |
| 7.0s | 210 | transition | split screen and interactive mockup | image carousel, checkbox UI, speech bubbles |
| 16.0s | 480 | transition | diagram on solid background | mind map, circular avatar crops |
| 21.0s | 630 | transition | video carousel with text overlay | academic citation card, video player mockup |
| 29.0s | 870 | transition | 3D render with interactive elements | 3D mannequin model, interactive pointer, checkbox UI |
| 37.0s | 1110 | transition | 3D animation with phone mockup overlay | 3D animation, phone mockup, academic citation card |
| 42.0s | 1260 | transition | diagram on solid background | interactive flowchart |
| 46.0s | 1380 | transition | minimalist text with search bar mockup | search bar mockup |

## Narrative arc

1. Establish the premise that women do not dress or style themselves for male approval.
2. Provide examples of trends that men dislike or ignore but women love.
3. Introduce academic research showing cosmetic procedures are done for self-confidence.
4. Complicate the 'for themselves' narrative by showing how media and peers shape those desires.
5. Conclude that beauty choices are a mix of personal identity and social norms, leading to a CTA.

## Devices (17)

academic citation card, checkbox UI, social media comment bubbles, 3D mannequin model, interactive flowchart, text labels, flowchart, avatar icons, image carousel, speech bubbles, mind map, circular avatar crops, video player mockup, interactive pointer, 3D animation, phone mockup, search bar mockup
