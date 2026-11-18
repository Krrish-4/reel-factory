---
name: refina-glowup
description: THE production format of reel-factory. Make a Refina x Glow Up pack reel (S1-S10 from refina-glowup-production-pack.pdf) - painted celebrity cutout on a flat ground, single-variable shutter morphs, white vector overlays, numbered beats, comment-keyword CTA. Builds BOTH a Remotion and a HyperFrames version from one shared data set. Use when the producer names a Glow Up / production-pack script (S1..S10) or hands over a new script in this format. Not for the sage QOVES-treatment Refina explainers (refina-reel) or AFM reels (afm-reel).
---

# Refina x Glow Up reels - THE PRODUCTION FORMAT

**This is the format reel-factory produces now.** Every new Refina reel is a
Glow Up pack reel unless the brief says otherwise. Four are built and delivered
in this repo (`src/refina/glowup/`): S2 Madison Beer nose quiz, S5 Sadie Sink
feature read, and two earlier reels converted to the format (Sydney Sweeney lip
self-tests, Jennifer Lawrence "her own list"). Copy the one closest to your
script, then give it its OWN device set ("each reel differs", below).

| comp | source | pack slot | devices (never reuse a set wholesale) |
|---|---|---|---|
| `GlowupS2` | `glowup/s2/` | S2 feature-type quiz | centred hook -> ease-out glide right, card page-peel, cursor drags a chip, pixel-resolve morph, comment grid |
| `GlowupS5` | `glowup/s5/` | S5 celebrity feature read | pill loupe 2x, edit scrubbed inside the loupe, scanner-bar edits, crowd grid, IG question sticker, face map with one node pulled, 3D tilt phone, strike-and-retype close |
| `GlowupSize` | `glowup/size/` | S4 two self-tests | two framed cards hook (faces ~0.18 of frame - full-bleed split was rejected as too large), 5s timer dials, finger-ruler E-line, oval mirror + A/B brackets, 3D flip to the edit, lips-only flicker, real app row card, YES/NO poll, macro mm ticks, sideways phone, empty-mirror close |
| `GlowupLawrence` | `glowup/lawrence/` | S1 work read, SELF-STATED facts only | photo grid + redacted chip, rubber stamps, venetian-blind portrait change, list on her shirt, wave lines / struck syringe / shaded hollows, quote card, width bar + caving contour, TELL/KEEP QUIET toggle, her-vs-you cards, rising phone, popped bubble + tossed list close |

Assets are NOT in git: celebrity likenesses, photos and ElevenLabs reads are
per-production material. `public-glowup/README.md` lists what each reel
expects; only the shared SFX ship, and `.gitignore` keeps reel asset folders out.
Photo reels (Size, Lawrence) use the producer's licensed photos instead of
painted stills: label them on screen as what they are (PHOTOGRAPH / EDITED /
SIDE VIEW, GENERATED) and only state what the celebrity has said herself.

Source of truth for the FORMAT: `docs/glowup/production-pack.pdf` (in this repo)
(12 pages: template p1, S1-S10 p2-11, build spec p12). Re-extract with
`pdftotext -layout`. This skill is the procedure; `FORMAT.md` beside it is the
spec distilled from the PDF plus what the first build (S2, 2026-11-12) learned.

the producer's standing decisions for this pack (do not re-ask):
- **THE LOOK IS THE REFINA-REEL HOUSE SAGE TREATMENT, NOT THE PDF'S.** v1 of
  S2 was built in the pack's blush design and rejected (2026-11-12): "same
  background, similar phones, same fonts... use refinareel skill wherever
  required, it already does this". Layout follows QOVES reel
  instagram.com/reel/DeaOcQMq3YH: hero cutout parked right and bleeding off
  the bottom with a mono name tag, persistent white headline, per-type left
  column (italic label + rounded nose card + decoding mono lines), thin
  arrows + cursor on the face, comment grid of all types. Build from house
  parts (Stage, SectionHeadline, Bangs captions, Tag/Mono/AiChip, Bangs phone,
  trio sfx + ONSET, typing-bar ending). Reference build: GlowupS2 v2.
  FORMAT.md's palette/type sections describe the REJECTED pack look - use
  only its devices and gotchas.
- **Scripts are used VERBATIM**, celebrity names included. A screenshot of a
  "why it wins / fixes before shooting" note only tells you WHICH script.
- **Celebrity painted likeness is used** (Madison Beer for S2, Sadie Sink for S5...).
- **Nothing faceless.** The pack's faceless illustrated host is dropped
  everywhere; its beats are carried by tiles, pills, the phone and type.
- **the producer supplies the painted stills.** Do NOT generate them (no Flow, no
  Higgsfield). Send him the prompts (template in `FORMAT.md`) and build with
  stand-ins until they land.
- **App proof uses what we already have** unless he sends a recording.
- **Voice = ElevenLabs**, global key `ELEVENLABS_API_KEY` (Windows user env).
  This pack is the one exception to the Deepgram-only rule.
- **Two deliverables per script**: one Remotion, one HyperFrames, built from the
  same `public-glowup/<reel>/` data. Which comes first is his call.
- The PDF's word counts / durations are WRONG (S2 says 158w/47s, it is 229w).
  Time everything from the measured read.

## Hard gates

1. **Spend**: ElevenLabs characters are spend. Quote chars + voice before a
   new read; the account is free tier (10k chars/month, resets ~19th).
   Free tier = non-commercial licence: flag before anything is posted.
2. **Compliance** (pack rules, all five): organic only; never imply the
   celebrity uses/endorses Refina; suspected work only as a question; the
   phone never shows the celebrity (sample user only); every app shot carries
   "AI preview, illustrative"; no 1-10 score on a real face.
3. **Morph lock**: every nose/lip/jaw variant must be an edit of ONE base
   still. `gen/glowup/portraits.py` reports drift outside the feature box;
   > 6 levels median = the shutter morph will show the whole face jumping.
   Send that still back to the producer or paste only the feature region onto the base.
4. **Overlays come from landmarks, never typed coordinates** (`place()` in the
   kit maps both the image and every mark).

## Procedure (run from the repo root)

```
# 1. script, verbatim, one paragraph
docs/scripts/glowup-<reel>.txt

# 2. voice (spend gate first). Sarah = EXAVITQu4vr4xnSDxMaL, speed 1.12,
#    then atempo 1.1 to reach the pack's ~200 wpm (ElevenLabs caps speed at 1.2)
python gen/glowup/tts_eleven.py --script docs/scripts/glowup-<reel>.txt \
    --voice EXAVITQu4vr4xnSDxMaL --out public-glowup/<reel>/vo-raw.mp3 \
    --words public-glowup/<reel>/words-raw.json --speed 1.12
#    -> atempo 1.1 into vo.mp3 and divide every word time by 1.1 into words.json

# 3. stills: the producer's PNGs into public-glowup/<reel>/portraits/src/
#    named <view>_<variant>.png  (3q_base, 3q_1_button, front_base, ...)
python gen/glowup/portraits.py --reel <reel> --sheet   # cutout + landmarks + lock check
#    LOOK at portraits/_landmarks-sheet.jpg; fixes go in landmarks-fix.json

# 4. app + sfx staging (real material only)
python gen/glowup/prep_<reel>.py

# 5. data for the composition (words + landmarks -> data.ts). Never hand-edit data.ts.
python gen/glowup/emit.py --reel <reel>

# 6. composition: src/refina/glowup/<reel>/Glowup<Reel>.tsx over src/refina/glowup/kit.tsx,
#    registered in src/refina/glowup/root.tsx (own entry: src/refina/glowup/entry.ts)
#    NEVER npx on this machine (it hangs) and never the repo-wide src/index.ts
#    (its bundle stalls at 50%). Call node_modules binaries directly:
node node_modules/typescript/bin/tsc --noEmit -p tsconfig.glowup.json
node gen/glowup/stills.mjs Glowup<Reel> out/glowup/stills <frame> <frame> ...   # one bundle, many stills
node gen/glowup/render.mjs Glowup<Reel> out/glowup/<reel>-raw.mp4               # segmented, resumable
#    delete out/glowup/.seg-Glowup<Reel>/ after any composition change
# 7. master: -14 LUFS, -1 dBTP, AAC 192k 48k (see FORMAT.md "Mastering")
```

Cues are WORDS, found by text (`at("button")`, `at("chin", 2)`), so a new
read re-times the reel without an edit. If `at()` throws, the script changed.

## HyperFrames side

Same `public-glowup/<reel>/` assets, same `words.json` and `landmarks.json`.
Load `hyperframes` -> `hyperframes-core` before writing HTML. Port the kit's
devices 1:1 (shutter morph, push-in, header/badge, captions, callout,
draw-path, phone) as GSAP timelines keyed off the same word times.

## Self-review before handing over

Run review -> fix -> re-render rounds yourself (see memory
self-iterate-reels). Phone-size contact sheet of one frame per beat; check
every overlay sits on the feature it names, captions never collide with
headers or the phone, the shutter morph moves only the feature.

## The per-type mechanic (QOVES DeaOcQMq3YH, measured 2026-11-12 at 10 fps)

Gemini (3-flash; 2.5-pro is gone and 3.1-pro has 0 free quota on this key)
got the structure right and the timings and peel wrong. Measure frames
yourself, at 10 fps, before building any of it.
- Hero is CENTRED through the hook. Then she glides right: about 140px in
  0.9s, settled by about 2s. That is a hard ease-out
  (bezier .16,1,.3,1 over 60f), not a slide. S2 starts the glide AND the
  first card on the hook's tail, because "First," -> "button" is only 18
  frames.
- Each later type plays in four steps:
  1. The cursor goes to the card's bottom-right corner and the card PAGE-PEELS
     toward the top-left (about 12f, pale back showing past halfway). The
     next card is underneath.
  2. The cursor picks a small chip off the new card and drags it onto the
     feature (about 14f).
  3. On the drop, the feature PIXELATES and resolves into the new shape:
     a canvas mosaic of the new still, blocks from coarse down to 1px over
     about 14f. A view change resolves the whole hero instead.
  4. The hero pushes in about 3.5%, then the white marks draw on.
- Drops land on the word that NAMES the type. Peels land on its ordinal.
  Sounds: paper-slide on the peel, tap on the pickup, click + soft pop on
  the drop. The shutter sound is used only in the hook.
- Code: CardColumn / Chips / Cursor(KEYS) / Mosaic in
  src/refina/glowup/s2/GlowupS2.tsx. Reuse them for S5 (lips/eyes/jaw).

## S5 (2026-11-14): different devices, same bar
the producer wants each reel's animations to differ from the last ("I don't want the
same animations"). S5 keeps her centred and front-on and INSPECTS her instead:
pill loupe at 2x (eyes, then mouth), an edit scrubbed inside the loupe only,
jaw contour + cheek ovals + scan line, scanner-bar edits stacking on their
words, crowd grid ("everyone else"), IG question sticker, a face map with one
node pulled, phone with a 3D tilt-in and vertical screen pushes, and a typed
strike-and-retype close. Shared house pieces now live in
src/refina/glowup/house.tsx (S2 keeps its own inline copies).
- **at() takes the FIRST occurrence.** "which" first appears in "which reads
  thoughtful", 16s before "Which natural feature". That one miss cancelled the
  edits, the crowd and a headline. "sadie" in the hook suppressed every
  caption. Print every T value against the word list before the first still.
- YuNet mouth points can sit on the upper lip. Correct them in
  portraits/landmarks-fix.json after drawing them, as done for S5.
- the producer's edit chain can come from a different base than the one he showed
  first (S5's B-D were built off a blue-grey re-render). Lock-check each edit
  against the PREVIOUS step, then use that chain's own base.
