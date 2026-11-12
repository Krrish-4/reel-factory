---
name: reel-sound
description: Add sound effects to a reel. Load when scoring beats, choosing from the SFX library, or placing cues.
---

# Sound

56 effects in `public/sfx/` across seven folders.

## Palette by what the beat IS, not by taste

| folder | use for |
|---|---|
| `ui-tech` | the app doing something; a measurement resolving |
| `transition` | every section cut and plate move |
| `cinematic` | sparingly — once, on the beat meant to land badly |
| `action` | paper, cards, physical objects |
| `meme-comedy`, `gaming`, `cartoon-retro` | **never** — wrong for this treatment |

## Cues derive from the beat table

`bf(beat, offset)` and `line(beat, n)`. Never absolute frames: a previous cut
carried 25 of them tuned to a 61.5s estimate, and the real voiceover came back
at 95s.

## Every cue needs a tail ramp

Half the library is longer than the moment it scores — `cinematic/hit.wav` runs
4.9s, `digital-beep` 1.7s. A `Sequence` that just ends cuts the sample at
whatever amplitude it had reached, which is an audible click. `Sfx` ramps volume
down over the last frames; every cue is truncated, so every cue needs it.

## Levels

Spot effects sit at 0.15–0.35. Anything above ~0.4 competes with the read.

## There is currently NO music bed, on purpose

Every reel's bed is retired to `public/_retired-beds/`. They were built from
`sfx/cinematic/energyfields.wav` and were wrong twice: they sat on top of the
voiceover, AND they were the wrong music. Measured, `energyfields` has partials
clustered under a semitone apart (beating ~2.7x a second), a tritone at the
bottom, no fundamental, and sub-bass as its loudest band — a dread cue, played
continuously under a teaching reel. Rahul heard it as horror/thriller before any
of it was measured.

**`cinematic/` is for one beat meant to land badly. Never for a bed.** Ask Rahul
for the light-music library; do not build a bed out of a sound effect again.

## When a real bed arrives — level it against the READ, never against silence

Three reels shipped a bed that sits on top of the voiceover. Rahul heard it in
`lips-v1` immediately; not one check in the repo could.

**`silencedetect` cannot detect masking.** It asks "is the mix ever quiet?", so
a LOUDER bed scores BETTER on it. Every bed here was levelled with it and every
one passed at 92-100% speech. The recipe compounded it with `dynaudnorm`, which
flattens the bed *so it never dips* — precisely what keeps that number high, and
precisely what buries a voice that swings 30dB between stressed and unstressed
syllables. Rule P in disguise, and invariant LL.

Measured properly — voice-over-bed in the windows where the voice is speaking:

| bed | median | LOUDER than the voice |
|---|---|---|
| `bed-ratio` (shipped) | 8.1 dB | 20.3% of speech |
| `bed-flip` | 8.4 dB | 20.8% |
| `bed-lips` v1 | 11.8 dB | 13.2% |
| `bed-lips` ducked | **37.0 dB** | 1.2% |

**Run `python gen/check-audio.py src/refina/<reel>` — it is a PREFLIGHT stage.**
The bed is judgeable from the audio files alone; an 8-minute render is a slow
way to learn the music is too loud.

**Duck it, do not flatten it.** No `dynaudnorm`; sidechain the bed against the
voice so it steps back for every phrase and returns in the gaps:

```
ffmpeg -y -i raw-bed.wav -i public/voiceover-<reel>.mp3   -filter_complex "[1:a]highpass=f=200,lowpass=f=4000[k];[0:a][k]sidechaincompress=threshold=0.006:ratio=12:attack=15:release=350[out]"   -map "[out]" -ar 44100 -ac 2 -b:a 128k public/bed-<reel>.mp3
```

**`cinematic/` holds drones, not music.** `energyfields` is 14 seconds and -30dB:
it loops ~4.4x under a 60s reel and even at 5x gain reaches only -49dB in the
gaps. **Ask Rahul for a real bed** rather than building one out of a sound
effect — he has offered a library.
