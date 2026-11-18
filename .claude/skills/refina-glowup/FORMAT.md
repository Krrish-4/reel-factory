# Glow Up pack format (distilled from the PDF + the S2 build)

## Canvas and grounds
- 1080x1920, 30 fps, H.264 CRF 18, yuv420p. AAC 192k / 48 kHz.
- Ground is ONE flat fill per reel: warm blush-stone `#D8C7C2` (S2 S3 S5 S7 S9)
  or muted rose-slate `#8E7B82` (S1 S4 S6 S8 S10). Never a gradient.
- Safe zone x 90..990, y 180..1520 (IG/TikTok UI).

## Structural clock (fractions of the measured read, not the PDF's seconds)
| span | job |
|---|---|
| 0-5% | hook question + rapid 3-click shutter morph, or a 2x3 grid / split |
| 5-78% | numbered beats 1..n, a visual change every 2.2-2.8 s; self-ID comment prompt near the end of this span |
| ~78% | bridge line: from the celebrity to the VIEWER's face |
| 82-92% | Refina plug inside an iPhone: Dossier read -> Cosmetic Preview slider -> Bring to Life 3D turn, on a SAMPLE user |
| 92-100% | closing thesis + "Comment DOSSIER and I'll send you the app" |

## Type
- Header: Playfair Display 700, 58-64px, centred at y210; numbered beats get a
  charcoal 72px rounded-square badge (radius 22%) that flips in. Words rise out
  of blur one after another; the header lifts away 8 frames before the next.
- Captions: Inter italic 500, 40px, y1460, 3-5 word chunks broken at
  punctuation, active word #FFF, the rest 45% white, soft dark shadow (the
  blush ground is light; the shadow is what makes white legible).
- Never draw a line that is also the caption on the same frame: hide the
  caption chunk instead (`hide` ranges).

## Devices (src/refina/glowup/kit.tsx)
- **ShutterPortrait**: locked still, source swaps on cue; 4-frame dissolve +
  `Flash` (15% white, 3 frames) + `shutter.mp3`. Push 1.00->1.04 linear per
  hold, reset on each morph (hidden under the flash).
- **DrawPath / AngleArc / Tag / Callout**: white 3px strokes with a soft glow,
  drawn over 10-14 frames; callout = dark translucent card, 1px 35% white
  border, 2.5px pointer, 7px dot with a pulsing ring; `tone="warn"` = red.
- **Grid / strip of NoseTiles**: crops of each variant centred on the
  feature, through the same `place()` maths.
- **CommentPill**: white pill, bubble glyph, springs in with a small wobble.
- **Phone**: springs up from below with a tilt; `move` re-docks it; screens
  change with `ScreenPush` (iOS push). `AiLabel` under it, always.
- View changes (3/4 <-> front) are horizontal WHIPS with motion blur + swoosh.
- "not a celebrity reference photo" turns the whole portrait into a framed
  photo card that gets struck through and flies off as the phone arrives.

## Sound (the producer's library, staged into public-glowup/sfx)
Shutter on every morph (0.26-0.3), quiet pops on tile arrivals (0.12),
swoosh on whips, soft clicks only on the first mark of a beat, notify on the
comment pill, a soft boom on the warning beat, whoosh on the phone. NO music
(pack rule). Keep it to story moments - the producer has called over-SFX'd edits out.

## Still prompts (send to the producer; they generate)
Base, then edits of the base with only the feature changed. Every edit prompt
ends: "It is very important that this looks like a real different <feature>
shape, not a filter or FaceTune. Leave everything else exactly the same."
Ask for STRONG, never subtle (refina-reel casting lesson). Optional step 0
converts a photo-real base to "semi-realistic cel-shaded digital illustration".
S2's full prompt set: `docs/scripts/glowup-s2-prompts.md`.

## App material we already own (sample users only)
- `public/dossier-rachel/features.mp4` - real recorded Dossier scroll
- `public/refina-ui/screens_trim/` - real screens (cosmetic-preview photo slot
  measured at x14..536 y314..840 of 558x1311)
- `<white-masters>/<proc>-before|after.mp4` (the client's turntable masters, not in git; path set at the top of each gen/glowup/prep_*.py) -
  turntables; frame 0 is profile. Register after->before with ORB similarity
  on ear/eye/hair with the feature masked (phaseCorrelate failed: response 0.03)

## Mastering
`ffmpeg -i raw.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1:LRA=11" -c:a aac -b:a 192k -ar 48000 out.mp4`
(alimiter, if used, needs `level=disabled`). Leave >= 0.25 s after the last syllable.

## Gotchas found on S2
- ElevenLabs 403s Python's default urllib User-Agent; set one.
- Free tier rejects `mp3_44100_192`; use `mp3_44100_128`.
- Use the response's `alignment` (original text), not `normalized_alignment`
  ("3D" becomes "three D" in the normalised one and word matching breaks).
