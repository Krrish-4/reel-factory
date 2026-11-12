# Voiceover pipeline — script file in, VO and measured word frames out

Give a new reel a voiceover in one command. The script file is the source of
truth; no frame number is typed anywhere.

```
python docs/preview-review/gen-voiceover.py \
    --script docs/scripts/demo.txt \
    --audio  public/voiceover-demo.mp3 \
    --ts     src/labs/demo/words.ts
```

Out come two files: an mp3, and a `WORD_CUES` table in the same format every
reel already reads. Point the composition at both:

```tsx
<Audio src={staticFile("voiceover-demo.mp3")} />
// captions read WORD_CUES from the generated words.ts
```

Voice is Deepgram **Aura-2 `vesta`** (`--voice` to change; run the voice
casting artifact again to re-audition). Cost is about **1.5¢ per reel**.

## The third mode

`voscript.py` had two modes. This adds a third, and it changes what the other
two are for:

| mode | voiceover | phrase bounds | word onsets |
|---|---|---|---|
| `estimate()` | none yet | declared pause + measured cps | character weight |
| `measure()` | recorded | `silencedetect` | character weight |
| `synthesize()` | **we make it** | **exactly as declared** | **measured by STT** |

`measure()` spreads words across a phrase by character count because it cannot
see inside the speech. It is a good proxy — good enough that `gen-words.py`
carries a table of hand-measured `OVERRIDES` for the places it misreads. Here
every word carries an onset that came back from the audio, so there is nothing
to override.

## Script file format

One phrase per line. `| <seconds>` declares the silence after it (default
0.45). `#` comments and blank lines ignored. A lone `---` adds a 1.0s section
pause to the previous line.

```
# -- the hook ------------------------------------------------
You've judged your face by someone else's before-and-afters.  | 0.55
That is the whole decision.                                   | 0.70
---
So we built Refina.                                           | 0.50
```

Pauses are per phrase for the reason `gen-words-mirror.py` gives: a script
written in short punches *is* its pauses, and one average gap flattens the
writing. Unlike estimate mode these are not a guess — we generate the silence,
so the finished audio has exactly them.

## It cannot rewrite your copy

Invariant E says a label may never claim something the asset is not, and a
transcription pass that edited the script would be a machine editing a claim.
That cannot happen here. The script is the **input** to synthesis, so the
transcript is a round-trip of text we already wrote. `align()` maps timings
*onto* the script's words and never adopts the transcript's. Where they
disagree the script wins and the timing is interpolated — and every
disagreement is printed, never silently absorbed.

---

## Three failure modes this found, and the check that catches each

### A. Aura-2 returns silence with HTTP 200

**Incident.** A clean six-word line came back as a valid 1.16s WAV at
**-74 dBFS mean** — no speech at all. Nothing downstream noticed: the file
parsed, its duration was plausible, and the words were simply interpolated
across the silence. The reel would have shipped with a line missing from the
read.

**Invariant.** Every synthesis is level-checked. Silent output is retried up to
three times and **never cached** — caching it would make the failure permanent
and survive the re-run that would otherwise fix it.

**Check.** `peak_dbfs()` per phrase against `SILENCE_DBFS = -45`. A run that
cannot get audio for a line fails loudly rather than producing a quiet one.

### B. Whole-file transcription silently drops the tail

**Incident.** Verification transcribed the finished 23s mp3 in one call and got
**33 of 36 words** — the entire final phrase missing. The check reported 126
frames of drift. The audio was correct; the *measurement* was wrong, and it was
wrong in the direction that looks like a real bug.

**Invariant.** Verification slices each cue out of the finished mp3 and
transcribes it alone. One call per cue instead of one per run, in exchange for
every phrase being short enough to come back complete.

**Check.** `verify()` reports max/mean drift per word. On the worked example:
max 3f, mean 0.44f.

### C. Token-level alignment breaks on hyphens and proper nouns

**Incident.** `before-and-afters.` is one script word and three transcript
tokens; `Refina.` comes back as `rufina`. Token matching failed both, so they
fell through to interpolation and landed **35f and 43f** out.

**Invariant.** Alignment runs on the normalised **character** stream, not the
token list. `before` matches inside `beforeandafters`, `refina` matches
`rufina`.

**Check.** The interpolated count in the run output. It went 7 → 1 on the
worked example, and the survivor is a single article.

---

## Cost and caching

Phrases are cached by `(text, voice)` under `refs/.tts-cache/` (gitignored).
Editing one line re-synthesises one line. Re-running an unchanged script costs
nothing and produces byte-identical audio.

Note that Aura-2 is **not deterministic across calls** — the same line
synthesised twice differs in length by up to a second, mostly trailing silence.
That is exactly why the cache exists: it pins a script to one specific read, so
a re-run does not quietly move every frame after the line you edited.

## Two thresholds, deliberately

`verify()` warns at 6 frames (200ms) and fails at 12, or when more than a tenth
of the script drifts. Failing the build on a single 7-frame outlier would train
everyone to ignore the check.

## Limits

- **Not for `RefinaPreviewReel` or `RefinaProtocolReel`.** Both are signed off
  against a human read. This is for new reels.
- Aura-2 runs slightly brisk against `voiceover4.mp3`. There is no rate
  parameter; lengthen the declared pauses if a beat needs air.
- The voice is a synthetic read of copy about a real product. Nothing here
  changes the compliance rules — `AI PREVIEW · NOT MEDICAL ADVICE` still
  applies, and no claim may enter the script that the asset cannot support.
