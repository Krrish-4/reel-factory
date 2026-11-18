# public-glowup/ - asset root for the Glow Up reels

The Glow Up compositions bundle with `publicDir: public-glowup` (see
`gen/glowup/render.mjs` / `stills.mjs`), so every `staticFile()` path in
`src/refina/glowup/` is relative to this folder.

**Only `sfx/` is in git.** The per-reel folders hold celebrity likenesses,
licensed photos and ElevenLabs reads, which are per-production material.
They are gitignored. Recreate them with the steps in
`.claude/skills/refina-glowup/SKILL.md`:

```
public-glowup/<reel>/
  vo-raw.mp3, words-raw.json     gen/glowup/tts_eleven.py (ElevenLabs, spend-gated)
  vo.mp3, words.json             atempo 1.1, word times / 1.1
  portraits/src/*.png            the stills the producer supplies (<view>_<variant>.png)
  portraits/*.png                cutouts        - gen/glowup/portraits.py
  portraits/landmarks.json       measured points - gen/glowup/portraits.py
  portraits/landmarks-fix.json   hand corrections (committed per reel if you like)
  app/                           real Refina screens + sample-user turntables - gen/glowup/prep_*.py
```

| reel | stills it expects in `portraits/src/` | app staging |
|---|---|---|
| `s2` | `3q_base`, `3q_2_greek` ... `3q_6_downward`, `3q_philtrum`, `front_base`, `front_1_button` | `prep_s2.py` |
| `s5` | `front_base`, `front_1_fox`, `front_2_hollow`, `front_3_ig`, `crowd_1..4` | `prep_s5.py` |
| `size` | `front_base`, `front_1_thin`, `side_base` | `prep_photo_reels.py` |
| `lawrence` | `front_base`, `alt_base`, `illus_base`, `you_base` + `grid/grid1..6.jpg` | `prep_photo_reels.py` |

Then `python gen/glowup/emit.py --reel <reel>` writes `src/refina/glowup/<reel>/data.ts`
(the committed data.ts files are the delivered cuts' timings and landmarks).
