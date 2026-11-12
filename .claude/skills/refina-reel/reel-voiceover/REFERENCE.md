---
name: reel-voiceover
description: Add or re-time a voiceover, and derive beat bounds and caption frames from it. Load when a reel needs audio, when a script line changes, or when captions are mistimed.
---

# Voiceover and timing

```
python docs/preview-review/gen-voiceover.py \
    --script docs/scripts/<reel>.txt \
    --audio  public/voiceover-<reel>.mp3 \
    --ts     src/refina/<reel>/words-vo.ts
```

Out come an mp3 and a `WORD_CUES` table with **measured per-word onsets**.
Deepgram Aura-2 `vesta`, about 1.5¢ a reel. Full contract in
`docs/voiceover-pipeline.md`.

## Script file format

One phrase per line. `| <seconds>` declares the silence after it (default 0.45).
`#` comments and blank lines ignored; a lone `---` adds a section pause.

```
# -- the hook ----------------------------------------
One of these is before surgery.     | 0.30
One is after.                       | 0.35
Watch what else changed.            | 0.55
```

## Invariant B, in its strongest form

Estimate mode says "no frame is typed". Synthesis mode says **"no frame is
computed either"** — captions read `w[]` straight from the audio. The old
approach spread words across a fraction of the slot, which put the last word so
late that the finished sentence was legible for **four frames**. Invisible to
pixel measurement (the caption animates the whole time); caught only because
Gemini transcribed the render and every phrase came back truncated at exactly
the word that never arrived.

`gen/check-legibility.py` now asserts each cue holds its finished line ≥12
frames.

## Beat bounds come from the shot plan, not a second list

`shots.json` declares how many script `lines` each beat covers.
`src/refina/<reel>/beats.ts` derives every bound from that plus the cue table
and **throws at module load** if they disagree. `bf(beat, offset)` and
`line(beat, n)` place every headline burst and every sound cue.

A previous cut carried 25 absolute frame numbers tuned to a 61.5s estimate; the
real read came back at 95s and every one would have been silently wrong.

## Five failure modes, all real

1. **Aura-2 returns silence with HTTP 200.** A clean six-word line came back as a
   valid 1.16s WAV at −74 dBFS. Every synthesis is level-checked, retried, and a
   silent result is **never cached**.
2. **Whole-file transcription drops the tail.** Verification slices per cue.
3. **Token alignment breaks on hyphens and proper nouns.** Alignment runs on the
   normalised character stream.
4. **Aura-2 pads every phrase with its own silence**, which stacks on top of the
   declared pause: 12.9s of authored pauses became 31.5s of real silence and the
   reel came out 40s longer than its script said. `trim_silence()` strips it, and
   word onsets shift back by the trimmed lead.
5. **The verifier cut slices exactly on the first word's onset**, giving the
   recogniser no run-up — nova-3 dropped the opening words and reported 25 frames
   of drift that did not exist. A run-up is padded in, capped **below the
   smallest declared pause**; 0.35s reached into the previous phrase and made it
   worse.

## Thresholds

Warns at 6 frames, fails at 12 or when >10% of the script drifts. Failing on a
single 7-frame outlier would train everyone to ignore the check.

## Do not use on the signed-off reels

`RefinaPreviewReel` and `RefinaProtocolReel` are cut against a human read.
`gen-words.py`'s `OVERRIDES` table stays for that reason — retiming them with
STT would change an approved cut.
