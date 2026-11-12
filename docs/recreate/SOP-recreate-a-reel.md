# SOP — "Three procedure previews" reel

Format: a woman in a clinic, a reason she wants a change, then three 3D previews of her face
after three different procedures. Example: `out/refina-rec01-v4.mp4`.

Every generation step uses the result of an earlier step as its reference image, so she stays
the same person from the first shot to the last.

**Tools:** the character image in **ChatGPT**. Everything else, images and videos, in
**Google Flow** (the character image can be made in Flow too).

```
1 character image
├── 2 clip 1: hook          (attach 1)
├── 3 clip 2: tablet        (attach 1)
└── 4 studio portrait       (attach 1)
    ├── 5a facelift still   (attach 4) ── 6 3D video
    ├── 5b bleph still      (attach 4) ── 6 3D video
    └── 5c neck lift still  (attach 4) ── 6 3D video
```

---

## 1. Character image (ChatGPT)

```
Photorealistic portrait, vertical 9:16. A 65-year-old woman seated in a white leather treatment chair in a bright, modern aesthetic clinic. Short chin-length brown bob with natural grey streaks, side parting, one side tucked behind her ear. Natural mature skin with visible ageing: fine lines around the eyes, forehead lines, soft nasolabial folds, mild jowls along the jawline, slight crepiness on the neck. No makeup, no retouching, real skin texture. Wearing a heather-grey long-sleeve henley with a button placket. Neutral, slightly uneasy expression, mouth closed, looking just off camera. Background softly out of focus: white wall shelves with white and navy skincare bottles, a stainless steel instrument tray. Soft, even, neutral daylight clinic lighting. Medium close-up, eye level, head and shoulders, face in the upper third of the frame. Shot on iPhone, natural colour. No text.
```

---

## 2. Clip 1 — hook (Flow; attach the character image as the first frame)

```
Vertical 9:16, handheld iPhone footage with slight natural drift. Medium close-up of this woman seated in the treatment chair. She glances off to the left, lowers her eyes for a moment, turns her head to the right as if looking around the room, then brings her gaze back to the camera. Uneasy and self-conscious, neutral mouth, she does not speak. Bright white clinic, shelves of skincare bottles behind her. Soft neutral lighting. No text, no captions, no music.
```

---

## 3. Clip 2 — tablet (Flow; attach the character image as an ingredient)

```
Vertical 9:16, static iPhone shot, medium shot showing her from the waist up. This same woman, same grey henley and hair, seated in the white treatment chair with the headrest visible behind her. A male practitioner stands at the left edge of the frame, cropped at the shoulder so his face is not visible, wearing a taupe polo shirt. He holds a black tablet in front of her with the screen facing her, so the camera sees only the back of the tablet. The screen casts a soft lilac-violet glow onto her face. She looks down at the screen, reads it, and her expression softens into a warm, relieved smile. She does not speak. Bright white clinic. No text, no captions.
```

---

## 4. Studio portrait, face unchanged (Flow; attach the character image)

The procedures are applied to this photo, not to the clinic one. A clean studio portrait is
easier for the model to edit and gives all three results the same background, top and pose.

```
Studio reference portrait of this exact same woman, vertical 9:16. Keep her identity completely unchanged: same eyes, eye colour, nose, lip shape, face shape, eyebrows, hairline, and the same brown bob with grey streaks, tucked behind both ears. Plain white seamless background, flat soft even lighting, no shadows. She wears a plain black V-neck top. Front-facing, head and shoulders centred, neutral expression, mouth closed
```

---

## 5. Procedure stills (Flow; attach the studio portrait to each)

### 5a. Facelift

```
Apply a visible facelift to the woman's face. Tighten the skin around the jawline, lift the cheeks, and smooth out wrinkles around the eyes and forehead for a significantly more youthful appearance. Keep the clothing, background, lighting, and hair color exactly the same as the reference image.
```

### 5b. Upper + lower blepharoplasty

```
Apply a visible upper and lower blepharoplasty to the woman's eyes. Remove excess drooping skin from the upper eyelids and reduce puffiness and bags under the lower eyelids for a more alert and refreshed appearance. Ensure all other features, including her hair, neutral expression, black v-neck shirt, and the plain white background with soft studio lighting, remain identical to the reference image.
```

### 5c. Neck lift

```
Apply a very visible necklift to the woman. Tighten and smooth the skin on her neck, removing any sagging or wrinkles, and create a much sharper, more defined jawline. Ensure her facial identity, short brown hair, neutral expression, black v-neck shirt, and the plain white studio background with even lighting remain exactly the same as in the reference image.
```

---

## 6. 3D model video (Flow; attach one procedure still as an INGREDIENT; run once for each of 5a, 5b, 5c)

The same prompt converts every procedure still. Attach as an **ingredient**, not as the first
frame: the video starts in left profile, and a front-facing first frame fights that.

```
An ultra-photorealistic 3D photogrammetry scan of the exact person in the reference image. Preserve her identity with absolute precision — exact facial structure, proportions, eyes, nose, lips, jawline, chin, skin tone, skin texture, hairstyle, clothing and expression. Do not beautify or alter her appearance. The subject is completely frozen, like a museum-quality hyperrealistic statue or a high-resolution 3D scan: no blinking, no breathing, no eye movement, no expression change, no head movement, no body movement, no hair movement. The ONLY movement is the camera. The camera should slowly move from her full left profile to her full right profile in one smooth 180-degree rotation. Starting from her face facing leftwards and ending when it is facing right. The camera move is perfectly stable and continuous, as if capturing a stationary 3D model. Maintain perfect identity consistency from every angle, with no identity drift, morphing, or warping. Soft neutral high-end studio lighting, clean seamless studio background, physically based rendering, flawless temporal consistency. The video should be just one shot starting from a left profile to her right profile In 180 degree
```

---

## 7. Quick checks (before editing)

- [ ] **Same person everywhere.** Put the character image, one frame of each clip and the three
      procedure stills side by side. If any face has drifted, reroll that one.
- [ ] **Each procedure shows its procedure.** Compare each still to the studio portrait:

  | procedure | must visibly change | must stay the same |
  |---|---|---|
  | Facelift | jowls gone, jawline crisp, cheeks lifted | — |
  | Upper + Lower Bleph | upper lids less hooded, lower-lid bags reduced | jowls, folds, neck |
  | Neck Lift | under-chin and neck tight, sharp jaw-to-neck angle | eyes, upper face |

  If two stills look alike, or one shows no change where it should, reroll it. A label that
  does not match the face is a false claim about the product.
- [ ] **White background on all three 3D videos.** A grey one stands out in the card. Reroll it.
- [ ] **Lilac glow on her face in the tablet clip.** It is what shows she is looking at a screen.

---

## Output

Five clips, ready for the edit:

| file | from step |
|---|---|
| hook clip | 2 |
| tablet clip | 3 |
| facelift 3D video | 5a → 6 |
| bleph 3D video | 5b → 6 |
| neck lift 3D video | 5c → 6 |

---

## 8. The script — use exactly this

Total length about **19 seconds**, vertical 1080x1920.

| time | clip | on-screen text |
|---|---|---|
| 0.0–3.5s | hook clip — the 3.5s where she looks away, then back to camera | her husband just left her for a younger woman |
| 3.5–7.6s | tablet clip — she reads, and the smile lands just before the cut | she wanted to feel young again. / so she previewed 3 options. / which one should she get? |
| 7.6–11.4s | facelift 3D video + **card 1** | (on the card) |
| 11.4–15.2s | bleph 3D video + **card 2** | (on the card) |
| 15.2–19.1s | neck lift 3D video + **card 3** | (on the card, incl. the closing question) |

**Post caption (not in the video):** preview yours → link in bio

**Text style for the first two shots:** each line in its own white rounded box, bold black
sans-serif, centred, in the lower-middle of the frame (around two-thirds of the way down).
Keep the lowercase exactly as written.

---

## 9. Editing with the Refina card (do not recreate the card)

The card is supplied ready-made. Do not rebuild or regenerate it.

| file | use for |
|---|---|
| `refina-card-option-1.png` | 7.6–11.4s, over the facelift video |
| `refina-card-option-2.png` | 11.4–15.2s, over the bleph video |
| `refina-card-option-3.png` | 15.2–19.1s, over the neck lift video (includes "which should she get? 1, 2, or 3? 👇") |
| `refina-card-example.png` | what the finished frames should look like |

Each card is a full 1080x1920 PNG with a **transparent window** where the 3D video shows
through. It already carries the header, the procedure name, "preview them on your own face in
Refina, link in bio" and the "AI PREVIEW · NOT MEDICAL ADVICE" line.

For each option:

1. Put the 3D video on the lower track and the card PNG on the track above it.
2. Scale the video to about **78%**, then move it so her head is centred in the window, with
   the top of her hair about 80px below the top of the window. The window is at
   **x 160, y 380, 760 x 900px**.
3. Start the video where she faces the camera, so she turns toward her right profile during the
   3.8 seconds.
4. Keep her head the same size and position in all three options, so the swap reads as a new
   result in the same pose.
5. Cut the video and the PNG together at 11.4s and 15.2s: the card stays put, only the face
   and the label change.

Music: add an Instagram library track when posting. Never a copyrighted song.
