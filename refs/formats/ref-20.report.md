# ref-20

**grooming explainer** — This video provides a three-step guide using facial anatomy and features to determine if a moustache suits a man's face.

54.221s · 1080x1920 @29.97

## Animation language

- **signature moves** — Horizontal Portrait Slide, Facial Wireframe Draw, Checkmark Badge Pop-In
- **how things enter** — Elements pop in with elastic scaling or slide in from the right/bottom.
- **how things leave** — Elements are pushed off-screen by incoming elements or fade out quickly.
- **how scenes change** — Hard cuts separate the main educational segments, while push-wipes transition gallery photos.
- **what stays still** — The central portrait subject remains static while overlays and badges animate around them.
- **rhythm** — Bursty and fast-paced, with rapid badge pops synchronized to the voiceover's key points.

## Measured rhythm

| metric | this reel |
|---|---|
| frozen frames | 63.5% |
| element arrivals / min | 111.8 |
| hard cuts | 18 (19.9/min) |
| median shot | 1.74s |
| transitions | 10 (median 0.68s) |
| speech | 98.8% |
| scene changes that are cuts | 100.0% (18 of 8) |
| ground | `#858587` flat=False |

## Animations (7)

6 we can already build · **1 we cannot**

### Would need building

**Horizontal Portrait Slide** — Portrait cutouts of different men  
`translate` · right-to-left · smooth · staggered  
*Purpose:* Introduce different actors to show the universality of the moustache look.  
*Reusable as:* Showcasing a lineup of products or team members in sequence.  
*Build:* A horizontal carousel transition that slides layered portrait cutouts across the screen.

### Already in our vocabulary

| animation | our primitive | purpose |
|---|---|---|
| Photo Card Push Wipe | `PushWipe` | Display real-world examples of the trend in a gallery format. |
| Menu Card Pop-In | `TagStack` | Introduce the three-step criteria framework for the video. |
| Facial Wireframe Draw | `ContourDraw` | Highlight the philtrum area scientifically. |
| Icon Card Slide-Up | `SlideIn` | Label the highlighted facial feature clearly. |
| Moustache Pop-On | `PopIn` | Simulate the look of a moustache instantly on a clean-shaven face. |
| Checkmark Badge Pop-In | `TagStack` | Confirm positive attributes of the simulated look. |

## What to steal, ranked

1. Facial Wireframe Draw for high-tech anatomical or product highlighting.
2. Horizontal Portrait Slide for dynamic, engaging character or product introductions.
3. Checkmark Badge Pop-In for clean, snappy feature validation.

## Timeline — every animation instance (34)

| t | motion | element | content |
|---|---|---|---|
| 0.0s | `none` | Text overlays 'Moustache Look?' and ac | RAVI KISHAN, MEMBER OF THE LOK SABHA |
| 1.0s | `translate` | Vijay Deverakonda portrait and label | VIJAY DEVERAKONDA, INDIAN ACTOR |
| 2.0s | `translate` | Vicky Kaushal portrait and label | VICKY KAUSHAL, INDIAN ACTOR |
| 3.0s | `cut` | Photo sequence panel | SOURCE: GLAMSHAM |
| 6.0s | `translate` | Card 1 'PHILTRUM' | 1 PHILTRUM |
| 6.5s | `translate` | Card 2 'FACIAL FEATURES' | 2 FACIAL FEATURES |
| 7.0s | `translate` | Card 3 'DENSITY' | 3 DENSITY |
| 8.8s | `cut` | Vicky Kaushal portrait | clean-shaven face |
| 11.0s | `scale` | Bounding box animation | nose and lip zoom focus |
| 13.0s | `fade` | Philtrum icon badge | PHILTRUM |
| 15.0s | `draw-on` | Graphic bracket line | philtrum height measurement |
| 19.0s | `fade` | Title overlay | Long Philtrum |
| 21.0s | `fade` | Digital moustache layer and label | THICK MOUSTACHE |
| 24.0s | `scale` | Status badge | BALANCED |
| 26.0s | `cut` | Checklist sequence | FACIAL FEATURES card highlight |
| 28.0s | `cut` | Ranveer Singh face | clean-shaven portrait |
| 29.0s | `scale` | Jaw icon badge | JAW |
| 30.0s | `scale` | Eyebrow icon badge | EYEBROW |
| 31.0s | `scale` | Height icon badge | HEIGHT |
| 34.0s | `cut` | Photo and badge | STRONG BROWS |
| 36.0s | `cut` | Photo and badge | DEFINED JAW |
| 37.0s | `cut` | Photo and badge | PLAIN FACE |
| 38.0s | `cut` | Clean-shaven portrait | Ranveer Singh |
| 39.0s | `fade` | Moustache overlay | moustache added |
| 40.0s | `scale` | Status badge | FOCAL POINT |
| 41.0s | `cut` | Checklist sequence | DENSITY card highlight |
| 43.0s | `cut` | Varun Dhawan face | clean-shaven portrait |
| 45.0s | `fade` | Moustache overlay and text pill | SPARSE GROWTH |
| 47.0s | `cut` | Suit photo | Varun Dhawan photo |
| 48.0s | `cut` | Closeup photo | moustache detail |
| 49.0s | `cut` | Varun Dhawan portrait | clean-shaven portrait |
| 50.0s | `fade` | Moustache overlay and green pill | THICK |
| 51.0s | `scale` | Status badge | HORIZONTAL BLOCK |
| 53.0s | `cut` | Vijay Deverakonda portrait | outro scene |

## Scenes

| start | frame | on a cut | layout | devices |
|---|---|---|---|---|
| 0.0s | 0 | yes | full-bleed portrait | text overlay, face transition |
| 3.303s | 99 | yes | stacked image cards | image cards, source citation |
| 5.038s | 151 | yes | 3-item vertical list | numbered list cards, image thumbnails |
| 9.042s | 271 | yes | full-bleed portrait with graphic overlays | 3D anatomical overlay, status chips, before/after toggle |
| 25.726s | 771 | yes | 3-item vertical list | numbered list cards |
| 27.961s | 838 | yes | full-bleed portrait with graphic overlays | facial mesh overlay, feature icons, status chips |
| 41.341s | 1239 | yes | 3-item vertical list | numbered list cards |
| 41.341s | 1239 | yes | full-bleed portrait with graphic overlays | status chips, before/after toggle |
| 52.619s | 1577 | yes | full-bleed portrait | text overlay |

## Narrative arc

1. Introduce the trend and pose the core question.
2. Present a 3-step checklist framework.
3. Explain the role of philtrum length with visual proof.
4. Explain the role of facial features and masculinity perception.
5. Explain the necessity of hair density for the look to work.
6. Conclude with a call to action.

## Devices (12)

Status Chips, Numbered List Cards, text overlay, before/after toggle, face transition, image cards, source citation, image thumbnails, 3D anatomical overlay, facial mesh overlay, feature icons, Anatomical Overlays
