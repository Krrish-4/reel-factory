# ref-17

**evidence explainer** — This ad explains how multiple subtle, scientifically-backed facial adjustments accumulate to create a dramatic 'glow-up' effect, promoting Qoves' custom aesthetic reports.

72.708s · 1080x1920 @24.0

## Animation language

- **signature moves** — Staggered callout pop-ins, Smooth panel transitions, Graph path-following animation
- **how things enter** — Elements scale up with a slight spring bounce or slide in smoothly from the sides.
- **how things leave** — Elements fade out or are covered by transitioning panels.
- **how scenes change** — Hard cuts combined with smooth camera zooms and panel slides.
- **what stays still** — The background color and main portrait alignments remain consistent.
- **rhythm** — Highly dynamic, alternating between static explanations and rapid, staggered information reveals.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 62.9% |
| element arrivals / min | 55.3 |
| hard cuts | 3 (2.5/min) |
| median shot | 15.85s |
| transitions | 11 (median 0.75s) |
| speech | 91.9% |
| scene changes that are cuts | 75.0% (3 of 4) |
| ground | `#9EB6BE` flat=False |

## Animations (6)

3 we can already build · **3 we cannot**

### Would need building

**Panel Shift** — Two portrait panels and text callout  
`translate` · left-to-right · smooth · staggered  
*Purpose:* Demonstrates preference by overlapping the preferred face over the other.  
*Reusable as:* Comparing two options where one is highlighted as superior.  
*Build:* A dual-panel layout where one panel slides to partially overlap the other on command.

**Feature Toggle Stack** — A vertical list of text labels and state badges  
`translate` · up · snappy · staggered  
*Purpose:* Shows a sequence of improvements toggling from normal to exceptional.  
*Reusable as:* Step-by-step checklist or feature comparison list.  
*Build:* A vertical list component that animates state changes (e.g., text/color swap) sequentially.

**Graph Path Follower** — Graph line and a circular face icon  
`draw-on` · left-to-right · smooth  
*Purpose:* Visualizes the concept of gradual improvement versus a single big fix.  
*Reusable as:* Showing progress, growth, or journey mapping over time.  
*Build:* An animated line chart where a custom marker/image follows the path as it draws.

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Staggered Feature Callouts | `DrawnCallout` | Highlights multiple subtle facial edits simultaneously without cluttering. |
| Detail Crop Pop-ins | `PopIn` | Isolates specific facial flaws for closer inspection. |
| Report Scroll & Radar Chart | `ScrollReveal` | Showcases the comprehensive custom glow-up plan report. |

## What to steal, ranked

1. Staggered Feature Callouts for interactive image detailing.
2. Graph Path Follower to make abstract data concepts engaging.
3. Feature Toggle Stack for clean before/after comparisons.

## Timeline — every animation instance (53)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `fade` | Text 'Can you see the differences?' an | Can you see the differences? / Take a look a |
| 3.0s | `translate` | Two face images | Two female faces |
| 3.0s | `fade` | Text 'You probably prefer this one' an | You probably prefer this one |
| 5.0s | `translate` | Left face image | Left female face |
| 5.0s | `fade` | Text 'But can you spot the changes?' a | But can you spot the changes? |
| 7.0s | `cut` | Right face image | Close-up of female face |
| 8.0s | `fade` | Text 'Eleven small edits' | Eleven small edits |
| 10.0s | `fade` | Label 'Bolder brows' and citation text | Bolder brows / Wegner, J. D., & Mileva, V. R |
| 11.0s | `fade` | Label 'Thicker hair' and citation text | Thicker hair / ...  |
| 11.1s | `fade` | Label 'Higher hair shine' and citation | Higher hair shine / ...  |
| 11.2s | `fade` | Label 'Clearer sclera' and citation te | Clearer sclera / ...  |
| 11.3s | `fade` | Label 'Reduced undereye circles' and c | Reduced undereye circles / ...  |
| 11.4s | `fade` | Label 'More red lip pigment' and citat | More red lip pigment / ...  |
| 11.5s | `fade` | Label 'Reduced acne' and citation text | Reduced acne / ...  |
| 11.6s | `fade` | Label 'More even complexion' and citat | More even complexion / ...  |
| 11.7s | `fade` | Label 'Reduced wrinkles' and citation  | Reduced wrinkles / ...  |
| 11.8s | `fade` | Label 'Thicker lashes' and citation te | Thicker lashes / ...  |
| 11.9s | `fade` | Label 'Healthier undertones' and citat | Healthier undertones / ...  |
| 14.0s | `scale` | Face image | Close-up of eyes |
| 16.0s | `fade` | Text 'Bimatoprost can thicken the brow | Bimatoprost can thicken the brows and lashes |
| 18.0s | `fade` | Text 'Brimonidine drops can improve ey | Brimonidine drops can improve eye brightness |
| 21.0s | `cut` | Left face image | Original female face |
| 24.0s | `fade` | Speech bubble 'There's not much for yo | There's not much for you to improve... |
| 28.0s | `scale` | Inset box 'SLIGHTLY RED' | SLIGHTLY RED |
| 30.0s | `scale` | Inset box 'MILD ACNE' | MILD ACNE |
| 31.0s | `scale` | Inset box 'SOMEWHAT DRY' | SOMEWHAT DRY |
| 33.0s | `translate` | Three inset boxes | SLIGHTLY RED / MILD ACNE / SOMEWHAT DRY |
| 33.0s | `fade` | Text 'Fixing one = Doesn't change much | Fixing one = Doesn't change much |
| 34.0s | `fade` | Inset box 'FIXED' (eye) | FIXED |
| 35.0s | `fade` | Inset box 'FIXED' (skin) | FIXED |
| 36.0s | `fade` | Inset box 'FIXED' (hair) | FIXED |
| 37.0s | `cut` | Right face image and text 'Fixing seve | Fixing several = Changes your life |
| 38.0s | `fade` | Highlight boxes | Face highlights |
| 40.0s | `translate` | Face comparison slider | NORMAL / EXCEPTIONAL |
| 40.5s | `fade` | Label 'Thicker lashes' | Thicker lashes |
| 41.0s | `fade` | Label 'Reduced wrinkles' | Reduced wrinkles |
| 42.0s | `fade` | Label 'More undereye support' | More undereye support |
| 43.0s | `fade` | Label 'More hydrated hair' | More hydrated hair |
| 44.0s | `fade` | Label 'Reduced acne' | Reduced acne |
| 44.5s | `fade` | Label 'More red lip pigment' | More red lip pigment |
| 45.0s | `cut` | Text 'This is where people mess up' | This is where people mess up |
| 47.0s | `fade` | Graph 'People want one big fix' | People want one big fix / ATTRACTIVENESS / T |
| 48.0s | `draw-on` | Graph curve | S-curve |
| 52.0s | `translate` | Face icon | Female face icon |
| 53.0s | `fade` | Graph title 'Usually, the small change | Usually, the small changes add up to more |
| 54.0s | `draw-on` | Second graph curve | Gradual step curve |
| 55.0s | `translate` | Face icon | Female face icon |
| 59.0s | `cut` | Text '1000+ Non-surgical techniques' | 1000+ Non-surgical techniques |
| 60.0s | `translate` | Scrolling list of techniques | Hyaluronic acid for skin plumpness / Ear tap |
| 62.0s | `cut` | Document interface 'Alexa's Protocol' | Get your custom glow-up plan / Alexa's Proto |
| 63.0s | `translate` | Scrolling document pages | Eyebrow and Eye Recommendations / Cheek Reco |
| 69.0s | `cut` | Search bar | Search bar |
| 70.0s | `draw-on` | Text 'Qoves.com' | Qoves.com |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | split-screen portrait | side-by-side comparison, text overlays |
| 7.0s | 168 | transition | centered portrait with interactive hotspots | hotspot labels, academic citations, zoom-in transitions |
| 21.375s | 513 | yes | portrait with floating detail cards | detail zoom boxes, before/after toggle labels, text bubbles |
| 45.0s | 1080 | transition | animated line chart | line graph, floating avatar icons |
| 59.0s | 1416 | transition | scrolling document mockup | scrolling list, report mockup, animated search bar |

## Narrative arc

1. Present a visual puzzle comparing two highly similar faces.
2. Reveal that the preferred face has 11 minor, scientifically-backed edits.
3. Explain that minor flaws seem negligible individually, but compounding them creates a massive aesthetic leap.
4. Debunk the myth of the 'one big fix' (like plastic surgery) using a comparative graph.
5. Introduce Qoves' database of non-surgical techniques and offer a personalized report as the solution.

## Devices (14)

Hotspot Labels, Detail Zoom Boxes, Report Mockup, side-by-side comparison, text overlays, academic citations, zoom-in transitions, before/after toggle labels, text bubbles, line graph, floating avatar icons, scrolling list, animated search bar, Attractiveness Graph
