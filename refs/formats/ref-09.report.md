# ref-09

**evidence explainer** — An aesthetic breakdown explaining the facial features and psychological perception that distinguish 'cute' eyes from 'hot' eyes.

48.5s · 1080x1920 @24.0

## Animation language

- **signature moves** — Glassmorphism HUD card pop-ins with vector anatomical overlays, Drawn leader lines pointing to facial features, Staggered social chat bubble overlays, Side-by-side stacked photo comparisons
- **how things enter** — Elements scale up with light spring overshoot or draw on via line strokes.
- **how things leave** — Elements fade out quickly or get covered by incoming full-frame photos.
- **how scenes change** — Direct hard cuts between portraits matched with sliding UI panels.
- **what stays still** — Central portrait framing and top/bottom text captions stay anchored.
- **rhythm** — Bursty arrivals syncing with narrative voiceover beats, followed by static hold moments.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 41.9% |
| element arrivals / min | 96.6 |
| hard cuts | 6 (7.4/min) |
| median shot | 7.54s |
| transitions | 12 (median 0.79s) |
| speech | 96.9% |
| scene changes that are cuts | 100.0% (6 of 5) |
| ground | `#727D80` flat=False |

## Animations (9)

7 we can already build · **2 we cannot**

### Would need building

**Soft Cloud Scallop Mask Frame** — Scalloped wavy image frame and animated brain icon with heart particles  
`mask-reveal` · up · floaty  
*Purpose:* Shift tone from diagnostic UI to playful, warm emotional perception.  
*Reusable as:* Framing aesthetic moodboards, beauty portraits, or friendly user testimonials.  
*Build:* Wavy scalloped mask reveal with animated particle emission background

**Piercing Target Reticle Overlay** — Crosshairs targeting reticle over pupil  
`scale` · inward · snappy  
*Purpose:* Visually conveys intensity and direct eye-contact focus of 'Hot' eyes.  
*Reusable as:* Focusing on precise focal points in tactical, athletic, or analytical showcases.  
*Build:* Target reticle spring pop-in with background focal blur

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Eye Scan Bounding Box | `PopIn` | Establishes diagnostic AI-aesthetic overlay focusing viewer attention on eye shape. |
| Eye Contour Highlight Lines | `TrimPath` | Traces round eye anatomy to visually explain 'Cute' classification. |
| Anatomy Leader Line Callouts | `DrawnCallout` | Points out precise morphological traits supporting the central argument. |
| Social Proof Chat Bubble Stack | `ChatThread` | Simulates real-world social validation and conversational proof. |
| Comparison Stack Cards | `ConvergePanels` | Directly contrasts 'Cute' vs 'Hot' traits in a single side-by-side view. |
| Sensation Vector Arrows | `DottedDraw` | Illustrates visual pull and tension vectors across the face. |
| Overlapping Photo Montage Cascade | `Montage` | Showcases diverse real-world examples of 'Hot' eye aesthetics. |

## What to steal, ranked

1. Drawn callout lines paired with glassmorphism property cards for feature breakdown videos
2. Stacked message thread popping over portrait photos for social proof
3. Target reticle focus animation with selective background blur for emphasis

## Timeline — every animation instance (25)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `cut` | Title text and UI box overlay | Do you have Cute eyes or Hot eyes ? |
| 0.1s | `fade` | Subtitle text | Do you have cute eyes |
| 1.2s | `fade` | Subtitle text and background image | or hot eyes? |
| 2.2s | `fade` | Subtitle text | Here is how to tell! |
| 2.9s | `cut` | Background model image | Cute eyes |
| 4.1s | `scale` | Eye shape diagram box | YOUTHFUL / Round |
| 5.2s | `fade` | UI text inside diagram | YOUTHFUL |
| 7.0s | `draw-on` | UI callout pointer and text | Upper lid showing |
| 8.0s | `draw-on` | UI callout pointer and text | The outer corner dips |
| 10.9s | `fade` | UI callout box | Scleral show |
| 13.0s | `mask-reveal` | Eye cutout mask | Big and soft like a baby has |
| 14.1s | `translate` | Brain icon and heart particles | Gentle and Approachable |
| 18.2s | `translate` | Video overlay and chat bubbles | @LUCIAAFERRATO |
| 19.3s | `translate` | Video overlay | @RAECAMBRB |
| 20.3s | `translate` | Video overlay | @ORHADID |
| 23.0s | `cut` | Background model image | Hot eyes are the opposite signal. |
| 24.1s | `scale` | Eye shape diagram box | PIERCING / Sharp |
| 26.2s | `fade` | UI callout label | Less upper lid showing |
| 27.9s | `draw-on` | UI directional arrows | The outer corner lifts |
| 31.0s | `scale` | Target crosshair graphic | The eye looks aimed at you |
| 34.0s | `cut` | Dual eye photos and labels | WARM / FRIENDLY / FOCUSED |
| 37.0s | `draw-on` | Dotted directional arrows | You can't look away |
| 40.8s | `scale` | Photo cards cutout | Intense and serious / @NOTTREBECA |
| 44.5s | `translate` | Comparison UI cards | HOT / CUTE / They're just different |
| 47.5s | `cut` | Full face model image and bounding UI | Do you have Cute eyes or Hot eyes ? |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed portrait with centered overlay UI | scanning rectangle UI, centered headline text, bottom caption |
| 2.833s | 68 | yes | portrait close-up with diagram UI header and pointer labels | vector eye shape diagram, brain illustration UI, line-pointer callout tags, highlight area overlays |
| 13.125s | 315 | yes | centered photo card with top floating graphic and chat bubble social proof | heart particle emitters, cloud-shaped photo crop, chat bubble captions, social handle overlays |
| 22.917s | 550 | yes | portrait close-up with sharp vector eye diagram UI and target reticle | sharp vector diagram, crosshair target reticle, directional arrow pointers, celebrity identifier tag |
| 32.8s | 787 | transition | stacked horizontal comparison panels transition to photo collage layout | comparison image stack, trait labels, facial vector arrows, photo collage card stack |
| 43.8s | 1051 | transition | dual stacked eye crop cards into full portrait frame | labeled side-by-side comparison cards, scanning rectangle UI |

## Narrative arc

1. Hook asking viewer to identify their eye category ('Cute' vs 'Hot').
2. Detailed feature-by-feature breakdown of 'Cute' eyes.
3. Psychological perception explanation of 'Cute' eyes (approachable, youthful).
4. Detailed feature-by-feature breakdown of 'Hot' eyes using Madison Beer.
5. Psychological perception explanation of 'Hot' eyes (focused, intense).
6. Reassurance that neither is superior and final CTA question.

## Devices (25)

scanning rectangle UI, centered headline text, bottom caption, vector eye shape diagram, brain illustration UI, line-pointer callout tags, highlight area overlays, heart particle emitters, cloud-shaped photo crop, chat bubble captions, social handle overlays, sharp vector diagram, crosshair target reticle, directional arrow pointers, celebrity identifier tag, comparison image stack, trait labels, facial vector arrows, photo collage card stack, labeled side-by-side comparison cards, Eye Scan UI Box, Anatomical Vector Diagrams, Line Pointer Callouts, Target Crosshair Reticle, Social Chat Bubbles
