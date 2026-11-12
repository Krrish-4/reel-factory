# reel-factory

> **Template repo.** This is the Refina reel pipeline (QOVES-style educational
> reels in Remotion) packaged so it can be forked. Start with `README.md` for
> setup. Everything below is the contract the original repo was built under.
> The status table and the per-reel sections are **history**: those reels ship
> here as code only (their assets were client material), except the sample
> `RefinaChanged`, which renders out of the box. Only `RefinaChanged` is
> registered in `src/Root.tsx`.

Remotion project (1080x1920 @30fps vertical reels). Separate compositions,
registered in `src/Root.tsx`. **Never mix their design systems.**

| Composition | Source | Look | Status |
|---|---|---|---|
| `ChinFillerReel` | `src/ChinFillerReel.tsx` | sage, placeholder content | practice build, leave alone |
| `RefinaReel` | `src/refina/` | Refina cream/mauve brand | Madison testimonial, DONE — leave alone |
| `RefinaProtocolReel` | `src/refina/protocol/` | **QOVES sage treatment** | DONE — `out/refina-protocol-v4.mp4` (Aug 5) is the final cut |
| `RefinaPreviewReel` | `src/refina/preview/` | **QOVES sage treatment** | `out/refina-preview-v10.mp4` |
| `RefinaMirrorReel` | `src/refina/mirror/` | **QOVES sage treatment** | `out/refina-mirror-v1.mp4` — **awaiting voiceover**, timing is an estimate |
| `RefinaMirror2` | `src/refina/mirror2/` | **QOVES sage treatment** | `out/refina-mirror2-v4.mp4` |
| `RefinaChanged` | `src/refina/changed/` | educational explainer, photographic | `out/refina-changed-v2.mp4` |
| `RefinaRatio` | `src/refina/ratio/` | educational explainer, anatomical | **`out/refina-ratio-v5.mp4`** — "Same Nose" |
| `RefinaFlip` | `src/refina/flip/` | educational explainer, photographic | **`out/refina-flip-v6.mp4`** — "You've Never Seen Your Own Face", **REJECTED by Rahul**, `nuance` still fails |
| `RefinaLips` | `src/refina/lips/` | educational explainer, anatomical | **`out/refina-lips-v1.mp4`** — "Load-Bearing", 61.6s, first cut |
| `RefinaNose` | `src/refina/nose/` | educational explainer, anatomical | **`out/refina-nose-v9.mp4`** — "It Wasn't the Nose", 50.6s |
| `RefinaTrio` | `src/refina/trio/` | educational explainer, **house sage treatment** (v1 own layout and v2 PDF ivory palette both REJECTED by Rahul — "QOVES style" means the size/nose look, never a brief's palette) | **`out/refina-trio-v3.mp4`** — "One Face, Three Impressions", trio1 before / facelift2 / refine, 72s read, script `docs/scripts/trio.txt` (Rahul's PDF, trimmed on his call) |
| `RefinaBangs` | `src/refina/bangs/` | educational explainer, **house sage treatment**; hero is the client's **real photographs of Anne Hathaway, restaged by Rahul** (`photo:edited`) | **`out/refina-bangs-v1.mp4`** — "Why Anne Hathaway Looks So Different With Bangs", 62.4s read, Rahul's dialogue **verbatim**, no music bed, first cut |
| `RefinaSize` | `src/refina/size/` | educational explainer, anatomical | **`out/refina-size-v5.mp4`** — "It Isn't the Size", 57.8s, **hero is a real photograph** |
| `RefinaRec01` | `src/refina/rec01/` | native IG captions + a card drawn as a **screenshot of the app's Your Result screen**, laid out inside the IG safe area (y250-1480, x<940; `SAFE` in the source) - 2026-10-13; three variants `RefinaRec01` / `RefinaRec01B` (iPhone on espresso) / `RefinaRec01C` (full-screen app), each with Card/Blank PNG comps and its window in `WINDOWS`; D-G = an app-derived card (not a screen) set in Rahul's four display faces (Casko Luxury / Agraham / Orange Avenue / Transcity, PERSONAL-USE DEMOS from befonts.com in `public*/fonts/card/` - buy commercial licences before a paid post; demos lack digits, so Orange Avenue sets every label with a number); **H = the same card in the app's own UI type (Playfair Display + Inter) - Rahul's pick**, captions under it in the QOVES caption treatment: Instrument Serif italic, no box, matched to Rahul's reference against Newsreader / Libre Caslon / Source Serif 4 / Playfair; **I = the editorial layout of H (one hero image 900x720 at x90 y318, procedure as the headline under it, disclaimer as two chips on the image's top corners) - current, `RefinaRec01I`** | **`out/refina-rec01-v4.mp4`** (procedure-matched turntables: facelift / bleph / necklift.mp4, checked against the hero photo) — "Her husband just left her", Rahul's script (Facelift / Upper + Lower Bleph / Neck Lift), turntables normalised to one head size, 19.1s, shot-for-shot recreation of a clinic reel from 5 Flow clips; plan `docs/recreate/rec-01-flow-plan.md`; render with `--public-dir=public-rec01`; **no audio yet** |
| `RefinaUgc01` | `src/refina/ugc01/` | UGC reaction: her clip + **real-app screen recording** (screens cropped from the Figma board into `public-ugc01/ui/`) + rec01 variant-I card | **`out/ugc01/ugc01-v4.mp4`** — 15.0s, Rhinoplasty, render with `--public-dir=public-ugc01 --concurrency=1` then two-pass loudnorm -14; reaction and turntable are two different women (open) |
| `GlowupS2` | `src/refina/glowup/s2/` (+ `glowup/kit.tsx`) | **Glow Up pack format** (blush `#D8C7C2`, painted celebrity cutout, shutter morphs) - own design, imports nothing from the sage reels; skill `refina-glowup` | **`out/glowup/s2-v3.mp4`** (v3 = reference mechanic: centred hook, ease-out glide right, card page-peel, cursor drags a nose chip, pixel-resolve drop; v1 blush design REJECTED - Rahul wants the HOUSE SAGE treatment laid out like QOVES reel DeaOcQMq3YH: hero right, italic label + nose card + mono left, cursor, comment grid, Bangs phone, typing-bar end) - "What Nose Shape Do You Actually Have?", pack script S2 verbatim, ElevenLabs Sarah, 69.2s; **own entry `src/refina/glowup/entry.ts`** - render with `node gen/glowup/render.mjs GlowupS2 <out>` (npx hangs here; the repo-wide bundle stalls at 50%) |

## public/ is copied on every render — keep it small

`public/` was 238 MB and Remotion copies the whole thing before each render.
Two changes, and one correction to why:

**63 MB moved to `_unused-assets/`** (moved, not deleted — put anything back if a
reel wants it): the site screenshots under `applyforme/`, the unused half of the
`sfx/` library, and the full-app source exports at the top of `refina-ui/`.
`refina-ui/screens_trim/` stays, because that is what `screen()` reads.

**`portraits/` was deliberately NOT touched**, and the reason is a good warning.
Filename scanning is unreliable there: `flood10.png` is used by `FLOOD_ITEMS`
and `flood-10.png` is a different, unused file; `flood-04a` scanned as
referenced and appears in no source file at all. Assets reached through
`portrait(n)` / `screen(n)` / a `src` prop are named by argument, so a grep for
the literal path finds nothing. **Verify by rendering a still from the reel that
uses the folder, not by grepping.** `RefinaProtocolReel` f400 and
`RefinaPreviewReel` f300 are the two that cover portraits, screens_trim and the
flood set.

**AND THE COPY WAS NOT THE BOTTLENECK.** Going from 238 MB to 3.5 MB changed an
8-minute render into an 8-minute render; the cost is rendering 790 frames of
1080x1920 with three webfonts, not the copy. `--concurrency=4` crashes Node on
this machine and `--concurrency=1` is what holds, which is the real reason a
render takes eight minutes. Do not repeat the assumption that public/ is why.

## Open the session in this directory

```
cd reel-factory   &&   claude
```

**Not `claude` from the home folder.** Claude Code loads a project's `CLAUDE.md`
and its `.claude/skills` from the session's working directory. Every session
that built these reels ran from `C:\Users\rahul`, so this file and the
`refina-reel` skill were both outside the project it had loaded — the skill was
never once invoked, and this contract only reached context because something
`cat`-ed it. Rule GG.

`~/.claude/skills/refina-reel` is now an NTFS junction onto
`.claude/skills/refina-reel` here, so the skill loads from anywhere and there is
still one copy to edit. `gen/check-skills.py` asserts both, as the first
preflight stage. Starting in this directory is still the better habit: it is
what loads this file.

## Before touching any reel

**Read `docs/reel-invariants.md` first.** It is the deduplicated list of failure
modes this repo has actually shipped or nearly shipped — hardcoded crop geometry
that breaks on the next asset, hand-edited timing that drifts, labels that claim
a procedure the render is not, and the process rule that when the user's eyes
disagree with a measurement, the measurement is the thing that is wrong. Each
entry names the check that catches it.

## Making a new reel

**Portrait assets are generated as part of the build, not sourced beforehand.**
Read the casting out of the script — which procedure it names or implies, and a
hero who visibly NEEDS it — then generate through `gen/`, promote into the reel
frame and repaint to sage:

```
python gen/flow-prompts.py --subject <id> --after <id> --out-dir gen/out/<id>
node   gen/flow.mjs pair --before-file gen/out/<id>/before.txt \
           --after-file gen/out/<id>/after.txt --out gen/out/<id> --name <id>
python gen/score.py <before-2k> --target <region> <after-2k>
python gen/promote.py <render> --as <name>   ->   python gen/sage.py ...   ->   registry.py --ingest
```

**`subject.py` AND BOTH gflow CLIs ARE RETIRED (2026-09-09).** Google moved this
account's Flow to `flow.google.com`; gflow anchors on Material Symbols ligatures
the new frontend does not render, and image generation is not ported upstream.
`gen/flow.mjs` (playwright-core, real Chrome) replaced them and `subject.py` now
exits with the path above. Casting, screening, framing and the registry are
unchanged — only the transport moved.

**Prompts are never typed at the shell**: `flow-prompts.py` renders them from
`gen/subjects.toml`, so every render traces to a casting decision in the spec.
**Inside `pair` the order is load-bearing** — the before is downloaded at 2K
BEFORE it is attached as the i2i ingredient, because attaching moves it out of
the media grid where it can no longer be downloaded. A 2K after against a 1K
before is not a pair.

Full workflow in the `refina-reel` skill's Assets section; the measured findings
and the failure modes are in `gen/README.md` and the header of `gen/flow.mjs`.
A subject who does not need the procedure cannot be given a legible one.

**Read `docs/making-a-reel.md`.** It carries the measured targets a reel has to
hit, the per-archetype pacing, and the order in which to search for a component
that already exists.

The four numbers that matter, medians over 21 measured references vs our own
reels — these are the brief, not decoration:

| axis | corpus | ours-preview-v10 | ours-protocol-v4 |
|---|---|---|---|
| frozen frames | **50.5%** | 80.8% | 85.1% |
| element arrivals / min | **88.8** | 64.9 | 25.5 |
| continuous motion | **27.3%** | 9.4% | 10.1% |
| speech | **96.3%** | 74.5% | 85.3% |

We are ~30 points too frozen, land a third fewer things per minute, have a third
the continuous motion, and carry ~17s of dead air. Cut rate is already on the
median — the deficit is density INSIDE scenes, never scene pacing.

## The checks — one command, run them

```
npm run check                  # preflight: source only, no render needed
npm run verify                 # preflight + postflight against the render
python gen/check.py src/refina/<reel> out/<render>.mp4
```

`gen/check.py` is the pipeline. It runs everything in order and exits non-zero:

| stage | tool | what it asserts |
|---|---|---|
| pre | `gen/check-skills.py` | the `refina-reel` skill is loadable from outside this dir; its router has no dead routes |
| pre | `gen/check-assets.py` | labels match the asset record; paired assets agree on framing |
| pre | `gen/check-legibility.py` | type clears the 26px floor; every caption holds long enough to read |
| pre | `gen/check-audio.py` | the music bed leaves the voiceover audible — **measured against the read, not against silence** |
| pre | `gen/check-prosody.py` | the synthesised read sounds like ONE person — pace, pitch and level per BEAT, against the read's own median |
| pre | `gen/check-publicdir.py` | a per-reel `public-*/` copy has not gone STALE against `public/` |
| pre | `gen/shots.py --emit` | no two adjacent beats share a composition; enough runtime declared moving; every beat declares a shot size |
| post | `gen/check-frames.py` | no frame carries an unexplained empty band at an edge |
| post | `gen/shots.py --verify` | a beat declared moving actually moves; face size lands in its declared band; the reel travels ≥1.8× |
| post | `gen/check-render-audio.py` | the audio INSIDE the render says the right words at the right frames |
| post | `gen/check-analysed.py` | **rule P**: this exact render has been through `refs/analyse.py`, measurement AND the Gemini pass |
| post | `gen/phone-sheet.py` | writes a 390px contact sheet — **the step that needs eyes** |

**The phone sheet cannot pass or fail, and it catches what nothing else can.**
Type too small to read, an annotation on the wrong feature, a beat that does not
show its own claim — all invisible to every check above it, all obvious at the
width the audience actually gets. Rule V, W, X and Y in
`docs/reel-invariants.md` record the incident behind each check.

**Two of these stages exist because a documented rule was ignored anyway.** Rule
P said in writing that a reel is not finished until `refs/analyse.py` has run on
it, and `RefinaFlip` reached v5 without it — while CLAUDE.md openly said so. The
skill holding that rule had meanwhile never once been loaded (rule GG). Prose
does not exit non-zero. If a rule matters, it gets a stage in this table; if it
cannot have one, say so where the rule is written.

Corpus figures are generated, never remembered:

```
npm run corpus     # refs/corpus-stats.json + refs/shot-bands.json
```

`refs/corpus-stats.py` marks an axis `"target": false` when the references
disagree — four of nine do. `refs/shot-bands.py` derives the wide/medium/close
bands from the pooled per-frame face-height distribution, and
`refs/face-size.py` measures a render against them.

**`src/refina/changed` and `src/refina/flip` have a `shots.json`.** The other four reels declare no
compositions, no motion and no shot sizes, so `check.py` fails on them by design
rather than passing because there was nothing to check.

## Asset registry — run this before you render

```
python gen/registry.py --ingest <render> --as <name> --subject <s>     --depicts procedure:facelift --role after --pairs-with <control>
python gen/registry.py --export      # rewrites src/refina/assets.ts
python gen/check-assets.py           # preflight; exit 1 on a bad claim
```

Measured geometry and the declared claim live together in
`public/portraits/registry.json`. Compositions read labels via `labelOf(id)` and
callout geometry via `anchor(id, region, ...)` from `src/refina/anchors.ts` —
never typed frame pixels. See rule R in `docs/reel-invariants.md`.

## Analysing our own reels

**A reel is not finished until it has been through `refs/analyse.py`.** Same
command as a reference, label it `ours-<name>`:

```
python refs/analyse.py out/refina-mirror2-v3.mp4 --label ours-mirror2-v3
```

Measurement alone is not enough and has already shipped a bad cut. See rule P in
`docs/reel-invariants.md` — including the specific trap of adding a slow zoom to
a static beat to move the frozen number, which does not work and would not have
been a fix if it had. Three postable-blocker defects in mirror2-v3 were found by
the Gemini pass and by nothing else.

## The reference corpus

`refs/` holds 21 short-form reels measured frame by frame and described by
Gemini, merged into one record each.

- `refs/FORMAT-LIBRARY.md` — every reference on the same axes, with our reels in
  the same table. Archetype spread and palette clustering.
- `refs/BUILD-PLAN.md` — the unbuilt animations clustered into components.
- `refs/AUDIT.md` — the hand audit of claimed component matches. **21% of them
  were wrong**, and every wrong match silently deleted a work item.
- `refs/README.md` — how to add a reference: one command, ~3 minutes.

Two rules learned the expensive way. `measure-format.py` is the authority on
TIME and is blind to meaning; Gemini is the authority on MEANING and invents any
number it is asked for. And an automated `we_already_have` claim is a hint, not
a verdict — check it before deleting a work item.

## Component inventories — search in this order

1. **`src/refina/kit/`** — 20 components built from the corpus.
2. **`src/components/remocn/`** — 62 vendored components, see below.
3. **`src/refina/protocol/motion.tsx`** and **`preview/draw.tsx`** — originals.

This order exists because it went wrong: the kit was built without checking
remocn, and `AnimatedBarChart`, `TypewriterInput` and `InlineTextSwap` duplicate
components that were already installed.

## Voiceover for a new reel

**One command: script file in, VO and measured word frames out.**

```
python docs/preview-review/gen-voiceover.py --script docs/scripts/<name>.txt \
    --audio public/<name>.mp3 --ts src/refina/<reel>/words.ts \
    --group src/refina/<reel>/shots.json
```

**ALWAYS PASS `--group`.** Without it there is one TTS call per PHRASE, and the
finished read does not sound like one person — Aura-2 re-chooses pace, pitch and
loudness every line. `voiceover-size.mp3` shipped into a finished render at
**111-417 wpm spanning 11.4 dB** before Rahul heard it. With `--group` the unit
is the BEAT, so a seam can only fall where there is already a cut, and the same
reel measures **157-243 wpm within 1.4 dB**. Alignment improves too, because the
recogniser sees whole sentences. `gen/check-prosody.py` is the preflight stage.

Deepgram Aura-2, voice `vesta`, ~1.5c per reel. Key in gitignored `.env`. This
is a THIRD mode beside `voscript.estimate()` and `measure()`: because we
generate the audio, the declared pauses are exact and every word onset is
measured by speech-to-text rather than spread by character weight — so there is
no `OVERRIDES` table to maintain.

**Read `docs/voiceover-pipeline.md` before using it.** Three failure modes it
already caught: Aura-2 returns silence with HTTP 200 (guarded, retried, never
cached); whole-file transcription drops the tail and reports drift that is not
there (verification is per cue); and token-level alignment breaks on
`before-and-afters` and `Refina` (alignment is character-level).

The script file is the source of truth and the transcript can never rewrite it
— synthesis takes the script as INPUT, so alignment maps timings onto our words
and never adopts the transcript's. Not for `RefinaPreviewReel` or
`RefinaProtocolReel`; both are signed off against a human read.

## Sound

**THERE IS NO MUSIC BED IN ANY REEL, AND NOTHING GOES BACK UNDER ONE UNTIL
THERE IS A REAL LIGHT-MUSIC LIBRARY.** The beds are retired to
`public/_retired-beds/` and every composition's `<Audio>` line is gone. They
were wrong twice over, and the second fault is the worse one:

1. **They masked the read** — see below, and `gen/check-audio.py`.
2. **They were the wrong music.** All three were built from
   `sfx/cinematic/energyfields.wav`, which is a TENSION CUE. Measured: partials
   clustered under a semitone apart (605.6 / 608.3 Hz, beating ~2.7x a second;
   56.5 / 59.2 / 61.9 Hz in the bass), a **tritone** at the bottom (40.4 ->
   56.5 Hz = 5.83 semitones), no fundamental to resolve to, and sub-bass as its
   loudest band at -3.1 dB. That is the acoustic recipe for dread, run
   continuously under an educational explainer about cosmetic previews. Rahul
   heard it as "horror... a thrill or something like that" before a single
   number was taken — invariant C.

**`cinematic/` is for ONE beat meant to land badly. It is not bed material at
any level**, and no amount of ducking fixes an inharmonic drone under a teaching
reel. The level rules below still apply the day a real bed arrives.

**A MUSIC BED IS LEVELLED AGAINST THE READ, NEVER AGAINST SILENCE.** Rahul heard
the bed sitting on top of the voiceover in `lips-v1`, and no check in the repo
could have told him. `silencedetect` — which every bed here was levelled with —
asks only "is the mix ever quiet?", so **a louder bed scores better on it**. The
old recipe then flattened the bed with `dynaudnorm` *specifically so it would
never dip*, which is what kept that number high and is exactly what makes a bed
mask speech: a constant level under a voice that swings 30dB between stressed
and unstressed syllables buries every soft word ending. Rule P in disguise.

`gen/check-audio.py` measures the thing that matters — short-window voice-over-bed
ratio **in the windows where the voice is actually speaking** — and it is a
PREFLIGHT stage, because the bed can be judged from the audio files alone and an
8-minute render is a slow way to learn the music is too loud.

Measured when the check was written. All three shipped beds fail it:

| reel | median voice-over-bed | bed LOUDER than the voice |
|---|---|---|
| `bed-ratio` (shipped in ratio-v5) | 8.1 dB | **20.3%** of speech |
| `bed-flip` | 8.4 dB | **20.8%** |
| `bed-lips` v1 | 11.8 dB | 13.2% |
| `bed-lips` ducked (current) | **37.0 dB** | 1.2% |

**Duck the bed under the voice; do not lower it flat.** One command, and no
`dynaudnorm`:

```
ffmpeg -y -stream_loop -1 -i public/sfx/cinematic/<source>.wav -t <dur>     -af "volume=1.5,afade=t=in:st=0:d=1.5,afade=t=out:st=<dur-1.5>:d=1.5"     -ar 44100 -ac 2 scratch/raw.wav
ffmpeg -y -i scratch/raw.wav -i public/voiceover-<reel>.mp3   -filter_complex "[1:a]highpass=f=200,lowpass=f=4000[k];[0:a][k]sidechaincompress=threshold=0.006:ratio=12:attack=15:release=350[out]"   -map "[out]" -ar 44100 -ac 2 -b:a 128k public/bed-<reel>.mp3
```

**The `cinematic/` sources are drones, not music beds, and it shows.**
`energyfields` is a 14-second, -30dB recording: it has to be looped ~4.4x under a
60s reel, and even at 5x gain it only reaches -49dB in the gaps. Ask Rahul for a
real bed before building one out of a sound effect again.


56 effects in `public/sfx/` across 7 categories. `ui-tech` fits app-demo beats,
`transition` fits plate moves, `cinematic` fits section openings. The
17-second silence gap needs a BED, not more one-shots — 16 spot effects total
about 8 seconds.

## remocn components

53 components from the [remocn](https://github.com/Remocn/remocn) registry are
vendored into `src/components/remocn/` and `src/lib/remocn*/` — copied in, ours
to edit, not a dependency. Two labs demo them: `RemocnLab` (first 7) and
`RemocnCoreLab` (the 18 core picks, scene-level ones over a real portrait).

Remotion's own agent skills (`npx skills add remotion-dev/skills`) are installed
too — 12 of them under `.claude/skills/remotion-*`, covering markup, render,
studio, captions, maps and an umbrella `remotion-best-practices`.

**Read `docs/remocn-integration.md` before installing or upgrading any of them.**
Four things bite: a linked agent skill kills the webpack bundler for the whole
project — and on Windows those links are NTFS **junctions**, which `find -type l`
and Python's `is_symlink()` both miss, so run `python refs/desymlink-skills.py`
after every `npx skills add`; `@/` resolves for `tsc` but needs a second
declaration in
`remotion.config.ts` to resolve for the bundler; `shadcn add --overwrite`
silently reverts local edits, so de-chroming lives in `refs/dechrome-remocn.py`
rather than in the files; and every remocn text component hardcodes its own font
stack as an inline style, so **none of them may carry headline or caption type in
a shipping reel** until that stack is edited — spec rule 8 (two faces, ever)
breaks the moment one renders as-is.

## RefinaPreviewReel

Same sage treatment and the same primitive libraries as the protocol reel — it
imports `protocol/atoms.tsx` and `protocol/motion.tsx` unchanged and adds no new
design language. Everything in "Non-negotiables" below applies to it too.

- **Script spine:** you are judging by *someone else's* before-and-afters ->
  see it on yours -> three numbered reasons -> "a preview, not a promise" -> CTA.
- **Subject assignment carries the argument.** `sage-before` / `sage-advisor`
  (the older woman) is *you*; `sage-stranger`, `celeb` and the `profile-*` pair
  are the surgeon's gallery. Never use the hero's face in a gallery card.
- **The hook's flood plays inside a phone.** `preview/flood.tsx` holds both the
  montage and `PhoneShell` (island, 9:41 status bar, home indicator, scrims) —
  the app beats read as a phone because their screenshots carry a real status
  bar; the flood's raw photos need the chrome drawn. New before/after pairs go
  in as `flood-NNb` (before) / `flood-NNa` (after), hand-cropped to 760x1004 so
  the pair is framing-locked to itself, raw drops kept in `_flood-src/`.
- **Timing is derived, never guessed.** `public/voiceover4.mp3` (75.86s, three
  parts joined) -> `silencedetect`. Cue starts AND per-word frames are measured:
  run `python docs/preview-review/gen-words.py`, which rewrites
  `src/refina/preview/words.ts`. Never hand-edit that file; edit the generator's
  `CUES` table (the script's source of truth) and regenerate.
- **Captions are preview-local.** `preview/captions.tsx` reads measured per-word
  frames. Do NOT go back to `protocol/atoms.tsx`'s `Captions`: it meters words
  evenly across 85% of the cue SLOT, and a slot runs through the pause after the
  phrase, so words pace slower than the speech and drift further behind with
  every word. Correcting cue starts does not fix it -- the drift is inside the
  caption. `check-lag.py` measures it: 9 of 184 words used to be missing when
  their phrase finished, now 0. The shared component stays as it is because
  `RefinaProtocolReel` is the approved cut and imports it.
- **The procedure list is not evenly paced.** Measured bursts are f599-615
  "rhinoplasty,", f635-662 "facelift, eyelid surgery,", f672-685 "and more" --
  the last two names are only ten frames apart. `PROC_SPANS` in `device.tsx`
  follows that read; three equal slides put the eyelid reveal 16 frames after
  its name.
- **`sage-*.png` portraits** have had their studio backdrop repainted to the
  exact stage sage, so they composite with no edge at any size. They are NOT
  alpha cutouts. All five share one frame (1218x1601, head top y=77,
  `headFrac` 0.0481). New renders must go through `docs/preview-review/align.py`
  first — the generator's framing drifts between runs.
- **Motion comes from measurement.** `docs/qoves-motion-reference.md` holds the
  reference reel's transitions, durations and easings, measured frame by frame.
  Beat boundaries are plate-level pushes (~25f, easeInOut cubic) via
  `src/refina/preview/plate.tsx`, not hard cuts. `atPlate()` extends a beat's
  duration but never its start — moving the start would shift every beat-local
  `from={…}` and fire the callouts early.
- **`PROC_SPANS` is a list of BOUNDARIES, not start+length pairs.** Editing one
  number moves two clips. Changing only the first entry once stretched the
  rhinoplasty slide from 34 to 94 frames instead of shifting it.
- **The three procedures are evenly spaced, not word-aligned.** Measured gaps
  between the spoken names are 36 / 8 / 28 frames — "facelift, eyelid surgery,"
  is one fast burst — so per-word spans gave facelift 15 frames, shorter than
  its own wipe. Three visuals cannot each land on a name 8 frames from the next.
  The window is split evenly instead: 51 frames each.
- **The procedure slides lead their names deliberately.** The rhinoplasty slide
  starts at f539, two seconds before the word is spoken, so the reveal has
  settled by the time the narrator names it. Measurement said the old f599 cut
  already landed on the spoken word -- and it still played as late on screen, so
  the cut heard in the room wins over the metric here. Do not "fix" it back to
  f599. `PROC_SPANS` and `F_LIST` in `device.tsx` move together.
- **Diagnose sync from the render, not the source.** `find-cuts.py` reports the
  frames where the picture actually moved; `check-pairs.py` how big each
  before/after change is and where; `check-reveal.mjs` when a spring-driven
  `SliderReveal` is really 25/50/90% revealed (`dur` is the spring's duration,
  not how long the wipe reads). Do NOT answer a perceived sync problem by
  zooming or re-cropping the supplied photos -- that was tried and reverted.
- **Only two type faces, ever.** Outfit (`displayFont`) for headlines and any
  display list; Playfair italic (`serifFont`) for captions. The reasons card
  once used 24px letterspaced MONO at 42% opacity in hairline pills — a third
  face, unreadable on a phone, and three small objects in an empty frame. It is
  now `ReasonIndex` in `draw.tsx`: a full-width numbered index in Outfit that
  doubles as a table of contents for the three sections that follow.
- **The compare beat merges, and the seam is a hand-off.** `ConvergePanels`
  (preview/draw.tsx) is the protocol reel's hook move rebuilt preview-local: two
  panels travel to centre, their inner halves crop away, and the halves meet as
  one face with a seam down the nose. Beat 11 uses `atExact` + `noExit` so its
  plate never travels out, and beat 12 uses `mode="cut"` and redraws the
  composite at identical geometry — that is what makes the cut invisible. Change
  either and the seam jumps. `preview/swap.tsx` then sweeps that seam right for
  "change your mind" and left for "change it back".
- **Never label a render with a procedure it is not.** `hero2-after` is a
  FACELIFT. `SwapScene` takes an optional `afterAlt` for a second procedure on
  the same face; while it is absent the rail selection deliberately does NOT
  move, because highlighting "Upper Blepharoplasty" over a facelift render
  would mislabel it. Pass `afterAlt` and the switch, the region ring and the
  detail card all activate together.
- **Procedure renders are known-weak.** See `docs/preview-review/README.md`: the
  rhinoplasty/facelift/blepharoplasty previews are not anatomically localised.
  The swap beat leans on a locked crop, a dotted region ring and a label to
  carry the change. Replace the renders (masked/inpaint workflow) before
  treating that beat as finished.

## RefinaMirrorReel

The mirror script. Same sage treatment and the same primitive libraries as the
other two — it imports `protocol/atoms.tsx`, `protocol/motion.tsx` and the
`preview/` primitives **unchanged** and adds no new design language. Everything
in "Non-negotiables" below applies to it too.

- **Script spine:** you have already made this decision with your hands in a
  mirror -> so see it properly -> upload / choose / see it rendered -> three
  things change -> "a preview, not a promise" -> CTA.
- **THE OPENING IS REAL FOOTAGE, AND IT IS ONE TAKE.** `public/hero-clip.mp4`
  is a 10s bathroom-mirror selfie in which the hero performs the script's first
  five lines exactly. Measured source frames (24fps): f26-56 neutral, f56-96
  temple pull, f104-135 cheek lift, f140-190 hold, f190-210 release, f210+
  she looks down and away. `mirror.tsx` retimes that take so each action lands
  on its own line. **Do not cut inside it** — cutting within one unbroken
  gesture reads as a mistake; changing its rate does not.
- **The retime does not use `playbackRate`.** Remotion maps media time as
  `startFrom + (frame - startFrom) * rate`, which makes a piecewise retime with
  a freeze in it awkward and off-by-one-prone. The source position is computed
  per frame and handed to `<Freeze>`, so an arbitrary time map — including a
  dead stop — is one `interpolate` over anchors.
- **"Held it there." is a literal freeze.** The anchor at the start of `held`
  and the anchor at the start of `letgo` are the same source frame. That is the
  script editing the footage; do not "fix" it into a moving shot.
- **Never run the footage past source f214.** From about f216 she looks down
  and away, which reads as defeated. The v1 cut ran `athome` to f234 and did
  exactly that. `athome` now picks the take up at f198 — exactly where the
  opening stopped — so the reel returns to the same bathroom and continues.
- **TIMING IS GENERATED AND CURRENTLY AN ESTIMATE.** There is no voiceover for
  this script yet. `docs/preview-review/gen-words-mirror.py` holds the script
  as TEXT and derives every cue frame, per-word frame, beat bound, headline
  span and `TOTAL` from it, at a chars/second rate measured off the same
  narrator's `voiceover4.mp3`. **No frame number is typed anywhere** — the
  composition addresses beats by name through `BEATS` in the generated
  `mirror/words.ts`, and `mirror.tsx`'s gesture anchors are (beat, source
  frame) pairs. Editing `words.ts` by hand defeats all of this.
- **When the voiceover arrives:** save it as `public/voiceover5.mp3`, re-run
  the generator (it switches to measured mode on its own), uncomment the
  `<Audio>` line in `RefinaMirrorReel.tsx`, re-render. Nothing else moves by
  hand — the pictures follow the words because both read the same table.
- **`docs/preview-review/voscript.py`** is the reusable timing core (measure /
  estimate / write). `gen-words.py` is deliberately NOT refactored onto it —
  that generator is pinned to the signed-off preview reel. Point it here and
  delete its duplicated helpers once that reel is frozen.
- **Hope/dread is never a fabricated outcome.** `ghost.tsx` shows two TRUE
  pictures of her — her photograph and her preview — drifting out of register.
  The instability is the drift and the blur; the words carry hope and dread,
  and neither exposure is labelled as either. There is no honest asset for
  "dread" and inventing one would be a claim about an outcome (invariant E).
- **A blurred layer needs its top edge feathered.** Blurring a bitmap pulls in
  the transparency just outside it, so the image edge that is invisible on a
  sharp portrait draws a hard horizontal band across a blurred one. The feather
  must stay inside the backdrop strip above the hairline (`headFrac * imgH`),
  or it eats her crown — `Portrait`'s own `top * 0.3` is 90px here and would.
  Same reason `POL_DY` is 7px: sliding a layer further pushes its bright edge
  out past the feather.
- **Nothing on the price card is a claim.** `desk.tsx` redacts every figure to
  blocks. The procedure names are real (they are the app's own list) only
  because a card of grey bars reads as an abstraction rather than a price list.
  The card is headed CLINIC and carries no Refina mark.
- **The diagram is drawn in FRAME coordinates over bare sage**, with no
  photograph under it and no numbers on it — so it cannot drift when an asset
  is swapped, and it invents no facial statistics.
- **A one-second beat cannot afford a 25-frame transition.** The device plate
  uses `t={9}`; at the default it covered the `notdiagram` diagram for 5/6 of
  that beat. For the same reason the `notgallery` cards start at negative
  `from` — `Drop` falls from off-screen, so at local 0 the frame was empty sage
  and the cut into it was invisible.
- **`motion.py` reads this reel's `rulingout` and `step3` as 100% frozen.**
  Both are animating — measured 40k and 76k changed pixels across the beat.
  This is the tool's documented under-reporting of small elements at 240px.
  `three` and `disclaimer` read as "blank" content; both are deliberately
  text-only beats. Beat table for it is `docs/preview-review/beats-mirror.json`.

## RefinaRatio — "Same Nose"

Educational explainer. **The eye reads a face in ratios, not in parts**, so a
change to the chin is seen as a change to the nose. Script is
`docs/scripts/ratio.txt`; the composition is `src/refina/ratio/`. Shipped cut is
**`out/refina-ratio-v5.mp4`** (92.3s).

Measured across the five passes, at 270x480 against twelve corpus reels put
through the identical pipeline (see invariant U — the 160px number in
`measure-format.py` cannot see this treatment at all):

| | v1 | v3 | v4 | v5 | corpus |
|---|---|---|---|---|---|
| still frames | 60.3% | 54.4% | 35.7% | **11.4%** | 16.3% |
| mean frame change | 0.87% | 1.73% | 2.32% | **2.66%** | 6.14% |
| speech | 69.9% | 94.5% | 94.5% | **94.5%** | 96.3% |
| element arrivals/min | 3.9 | 13.7 | 13.7 | **13.7** | 88.8 |

Still frames and speech are past the corpus median. Mean frame change and
arrivals/min are not, and that is structural rather than unfinished: the corpus
explainers swap whole images constantly, this treatment holds one portrait per
beat and animates anatomy on top of it. Do not close that gap with a push or a
creeping zoom — rule P.

- **Script spine:** same face twice -> the nose is not what changed, the chin
  is -> here is every pixel that moved -> three relationships (nose and chin /
  lid and eye / the thirds) -> it does not tell you what to do -> push your own
  jaw forward and watch -> "a preview, not a promise" -> search bar.
- **IT PUTS A MEASUREMENT ON SCREEN, AND THAT IS THE POINT.** The hook pair was
  generated with the nose explicitly excluded, and `gen/score.py` then measured
  each region: **nose 9.7, eyes 16.7, jaw 36.0, concentration 2.16, drift 4.7**.
  The proof beat shows the real difference map (`gen/diffmap.py`) with those
  real numbers beside it. Nothing in the reel is a claim about surgery, an
  outcome or a person — it is a claim about two files we can account for pixel
  by pixel, plus one thing the viewer can reproduce with their own jaw.
- **No figure about a face is typed.** `gen/emit-measured.py` writes
  `ratio/measured.ts` from the scorer's `results.json`, and the beat maps over
  it. Re-score the pair, re-run it, and the chips follow. This is invariant B's
  argument applied to evidence rather than to timing — a printed number that has
  drifted from its own pair is a false claim (rule E), not just untidy.
- **The words follow the measurement, not the other way round.** The script
  first said "The nose was never touched" and "None of them are on the nose".
  The nose measured 9.7 against a 4.7 re-render floor — least of the three, but
  not zero — so the lines are now "The nose isn't what changed" and "Almost none
  of them are on the nose". If a re-render moves those numbers, the lines move.
- **TWO SUBJECTS, AND THE SECOND IS ANNOUNCED OUT LOUD.** Beat 5 says "another
  face" in the voiceover AND carries a `SECOND SUBJECT` tag. `RefinaChanged`'s
  first cut silently changed who its subject was three times in a film arguing
  "same face, one thing moved"; that was its worst defect. A second subject is
  fine, a silent one is not. `ratio1` carries the spine, `bleph1` is beat 5.
- **Casting is the whole ballgame, again.** The first `ratio1` was mildly
  recessed and her chin render scored **12 against a threshold of 25** with
  drift 4.0 — the model behaved perfectly and had nothing to work on. Recasting
  with a severe brief ("chin is tiny and slopes sharply backwards, lower third
  strikingly short, and against that missing chin her straight nose looks far
  too large") scored 36.0 at concentration 2.16 on the first try. Frontally,
  chin projection is the least visible axis there is, so the ask has to buy
  LENGTH and WIDTH in the lower third, not just projection.
- **The visual language is two devices, repeated.** `Ring` (a region, circled —
  says WHERE) and `Span` (a bracket between two anatomical rows — says HOW BIG).
  Every teaching beat puts two Spans side by side, one changing and one not.
  That is deliberate: Gemini counted **17 devices, none used twice** in
  `ours-changed-v2`, against a corpus median of 11 with at least one recurring —
  the signature of a reel assembled by walking the component kit.
- **A Span never carries a figure.** Two brackets of visibly different length
  say the whole thing. A number printed against a face is a facial statistic,
  and inventing one is exactly what rule E and the protocol content rules
  forbid. The only digits in the reel are the proof beat's, and they describe
  two files, not a face.
- **`Face` lays itself out instead of using `object-fit`.** See invariant S:
  CSS's fit-then-scale is not `anchor()`'s scale-then-fit, and every anchored
  mark was out by up to 240px. Consequence: `Reveal` must clip a frame-sized
  box, not the image, or a "50%" wipe lands wherever the image happens to be.
- **Crops are solved, not chosen.** `docs/preview-review/check-crops.py` prints
  the source rows each beat shows and where the anatomy lands; it also catches
  `promote.py`'s bottom pad drifting into shot (invariant T). Run it after
  touching any zoom or focus, and keep its `BEATS` table in step with the
  composition.
- **THE BED RECIPE BELOW IS SUPERSEDED — IT IS THE ONE THAT MASKS THE READ.**
  It is kept because the reasoning is instructive and wrong. `bed-ratio.mp3`
  measures **8.1 dB median voice-over-bed, with the bed LOUDER than the voice on
  20.3% of speech windows** — the worst of the three reels. The 92.8%-speech
  figure it was validated on came from `silencedetect`, which cannot see masking
  and rewards a louder bed. See the Sound section and `gen/check-audio.py`.
  `ratio-v5` ships with this defect; fixing an approved cut is a separate call.
- **The bed is a BUILT ASSET, and its level is the whole point.**
  `measure-format.speech()` runs `silencedetect=noise=-32dB`, so a bed quieter
  than -32dB does not exist as far as the measurement — or a phone speaker — is
  concerned. v1 played the raw effect at 0.06 (about -54dB) and measured 69.9%
  speech against a corpus median of 96.3; 0.16 moved it to 74.7%. That is what
  identified the level rather than the idea as the problem. `energyfields` is
  itself only a -30dB recording, so even at unity it dips under the gate and
  tops out at 81%.

  `public/bed-ratio.mp3` is therefore built, not played: evened out so it does
  not dip, levelled to -30.8dB mean (~8dB under the read), pre-looped to 95s so
  there is no seam every 14 seconds, faded at both ends. **Measured 92.8%
  speech on the mix before anything was rendered** — test the audio with
  `silencedetect` first, an 8-minute render is a slow way to learn a level.
  Rebuild it if the voiceover changes length:

  ```
  ffmpeg -y -stream_loop -1 -i public/sfx/cinematic/energyfields.wav -t 95     -af "dynaudnorm=f=200:g=15:p=0.9,volume=0.52,afade=t=in:st=0:d=1.5,afade=t=out:st=93.5:d=1.5"     -ar 44100 -ac 2 -b:a 128k public/bed-ratio.mp3
  ```

  Do NOT go back to `vortex`: its RMS climbs from silence to -41dB across 26.5s,
  so it is a riser, and looping it puts three swells and three silences under
  the reel. "Long" and "loopable" are not the same property; measure the
  envelope before choosing one.
- **Timing is generated end to end.** `docs/scripts/ratio.txt` ->
  `gen-voiceover.py` -> `ratio/words-vo.ts`; `ratio/beats.ts` groups phrases
  into beats **by line count** and asserts the total against the cue table at
  module load. No frame number is typed anywhere. Add or remove a script line
  and `LINES` in `beats.ts` must change with it.
- **The VO verifier is a gate, and it fired.** "The face is the unit. Not the
  part." came back with a word interpolated and 13f of drift on `is` —
  reproducibly, twice, so not recogniser noise. Three "the"s in one fast phrase.
  Rewriting it to "Faces are read whole. Not feature by feature." cleared it to
  9f max. Rewrite the line; do not wave the gate through.

## RefinaFlip — "You've Never Seen Your Own Face"

Educational explainer. **A mirror reverses you and a photograph does not**, so
the face you have rehearsed in front of your whole life is the reverse of the
one everyone else has been looking at. Script is `docs/scripts/flip.txt`; the
composition is `src/refina/flip/`; latest render is **`out/refina-flip-v6.mp4`** (88.1s).
**NOT SIGNED OFF — Rahul rejected the cut outright.** Second reel built on the
spec → compiler architecture.

**v6 rendered the two edits that were sitting unrendered after v5, and they
split.** `everyone` 29% → **42%**, fixed by lengthening its entrances.
`nuance` 24% → **19%**, made WORSE by speeding its seams up — the regression is
structural and rule **FF** now records why: the motion check scores the
fraction of frames that move, so accelerating a gesture always trades window
for speed and loses. Its travel covers 44% of the beat and `inOut` easing
spends the budget at the two ends that score worst; no speed setting reaches a
30% floor from there. Lengthen the travel, flatten the easing, or give the beat
a second gesture — do not tune the speed again.

**Rule P has now been run:** `refs/formats/ours-flip-v6.report.md`. It found no
postable blockers, and it independently confirmed the `nuance` regression by
listing that scene's only device as `text overlays` — it could not see the
recede at all. It also reports 100% of scene changes are hard cuts, 0 carried
by a transition, and 7 devices (corpus q1–q3 is 6–17, and `devices` is marked
`target: false`, so that is in-band, not a deficit).

**What Rahul's rejection and the record agree on:** 10.9 element arrivals/min
against a corpus median of 88.8, and 88s against a median of 55.5s. It is long
and it is thin, and the fix is more of the picture being replaced per beat —
design work per beat, not another easing curve (rule P, rule FF).

- **Script spine:** one photo and its flip -> a mirror reverses, a camera does
  not -> here is every pixel where the two disagree -> three things (her halves
  are two faces / it is everyone / you rehearsed the reversed one) -> the
  asymmetry is the part that is actually yours -> flip your own selfie ->
  "a preview, not a promise" -> search bar.
- **EVERY SECOND PICTURE IS A COMPUTED OPERATION, AND THAT IS THE POINT.**
  `gen/asym.py` produces the flip, the two chimeras and the difference map from
  ONE registered master by pure column arithmetic. Nothing is generated,
  retouched or re-rendered, so unlike every procedure beat in this repo there is
  no question of whether the model did what it was asked — the pair is exact by
  construction. That is what earns the right to put a measurement on screen.
- **The midline is SOLVED, and deliberately generously.** The axis is the one
  that MINIMISES the face's own mirror residual, swept in half-pixel steps over
  the face box. So every figure the reel prints is a LOWER BOUND: what is left
  after the face has been given its best available midline. A reel that
  overstates its evidence is what rule E exists to stop, so it leans the other
  way. `bleph1` measured p90 32.0, eyes 35 / nose 30 / jaw 31, axis +1.0px.
- **No figure about a face is typed.** `gen/emit-asym.py` writes `flip/measured.ts`
  from `gen/asym.py`'s own output and the beat maps over it — invariant B applied
  to evidence rather than to timing. The on-screen label names the OPERATION,
  `PER-PIXEL DIFFERENCE, THIS PHOTO vs ITS MIRROR`, because that is a computable
  statement about two image files; "her face is N% asymmetric" would be a facial
  statistic and this repo does not print those.
- **THE MAP SHOWS WHAT THE MEASUREMENT MEASURED.** The first render lit the
  hairline far brighter than anything on the face — hair is the highest-contrast
  edge in the frame and does not land on its own mirror — while the chips beside
  it report `face_mask` skin only. Showing hair and reporting skin is claiming
  the numbers describe what the viewer is looking at when they do not. `diff_map`
  is now masked to facial skin, feathered so it does not read as a sticker.
- **A comparison of two different crops is not a comparison.** The `claim` beat's
  two bands each windowed the composite at their own offset, so the top band
  showed her brow and the bottom her mouth, captioned as one face seen two ways.
  Both bands now share one `WIN` offset and differ ONLY in the flip. Whenever a
  beat puts two pictures side by side, the framing is the thing to check first.
- **The seam is drawn by the same maths that draws the picture.** `faceCol` in
  `anchors.ts` (additive, sibling of `faceRow`) maps the solved axis through the
  identical cover calculation `Face` uses — invariant S. Re-measure a subject and
  the seam moves with it.
- **TWO SUBJECTS, AND THE SECOND IS ANNOUNCED.** `bleph1` carries the spine;
  beat 5 says "another face" in the read AND carries a `SECOND SUBJECT` tag.
- **Casting is unfinished, and it is the known weakness.** `gen/asym.py --scan`
  ranked every registered portrait and the strongest read p90 32 — these are AI
  portraits and near-symmetric, so the chimeras are legible but not the "two
  different people" the hook promises. So `asym1` was cast for this reel with a
  severe brief and scored **p90 46 — eyes 76 / nose 32 / jaw 56**. The jaw
  figure is the one that mattered: it is why her two chimeras read as different
  face SHAPES rather than different brows. Four candidates were generated and
  all four beat `bleph1`; Rahul picked [4]. Swapping the hero in was a data
  edit — 17 asset references in `shots.json` — because every geometry in the
  reel is derived from the record. Its face is ~13% larger in frame than
  `bleph1`'s, which is what forced the `fit` work below.
- **Derived assets are registered, with the operation as the label.**
  `registry.py`'s `DISPLAY` gained `derived:flip`, `derived:half-left`,
  `derived:half-right`, `derived:mirror-difference`. `--no-reframe` keeps them on
  their source's exact pixel grid. The two `-map` entries carry a written
  `framing_exempt`: `metrics()` measures a wider head on a false-colour image, so
  the number is an artefact of measuring the map, not a framing error to fix —
  and widening the tolerance instead would have been the rule-P move.
- **`check-assets.py` now scans `shots.json`, not only `.tsx`.** A spec-driven
  reel names its assets in the plan, so a TSX-only scan reported every asset in a
  compiled reel as "referenced by no composition". A check that cries wolf on
  correct work is one people learn to skip.
- **The bed masks the read, and the 93.0% figure it was signed off on is not
  evidence that it does not.** `bed-flip.mp3` measures **8.4 dB median
  voice-over-bed, bed louder than the voice on 20.8% of speech windows** —
  effectively tied with `bed-ratio` for the worst in the repo. `silencedetect`
  cannot see masking. Worth weighing against the record that this cut was
  rejected as "long and thin": its audio was never measured this way. That is a
  hypothesis, not a finding.
- **MOTION CAME FROM ONE DEVICE, AFTER FIVE PASSES.** Measured moving-frame
  share per beat, v1 -> v4: `halves` 1% -> 80%, `rehearse` 4% -> 97%, `claim`
  5% -> 69%, `proof` 12% -> 64%. Every one of those beats was an opacity
  cross-fade or a full-frame transform and every one was rebuilt as a hard edge
  sweeping across the picture. See invariants BB and CC: a whole-frame move
  scores as a CUT (>35% of tiles) rather than as motion, a blend between two
  near-identical pictures crosses no threshold at all, and a slow seam does not
  either. The travelling seam is deliberately RECURRING across `claim`,
  `halves`, `rehearse` and `nuance` — Gemini counted 17 devices with none used
  twice in `ours-changed-v2` against a corpus median of 11 with at least one
  repeated.
- **Overall the cut went 81.4% still -> 56.6% still, and mean frame change did
  NOT move (0.31% -> 0.28%).** Against `ratio-v5`'s 11.4% / 2.66% and a corpus
  median of 16.3% / 6.14%. Read that honestly: thin seams travel, the frame as
  a whole does not change. Closing it means more elements arriving and more of
  the picture being replaced per beat, which is design work per beat — not
  another easing curve, and never a push or a creeping zoom (rule P).
- **`fit` sizes the PICTURE, never the type.** At cover scale this subject's
  face measures ~0.455 and the corpus close band tops out at 0.453 — and 0.453
  is not a style preference, it is the largest face height measured anywhere in
  1268 corpus frames, so every portrait beat was framed tighter than any
  reference reel. A portrait cannot go below cover without its backdrop
  showing, so `Pic` composites it as a sized element on the stage. Scaling
  whole beats instead would have taken 26px type to 24px and broken the
  legibility floor to fix framing.
- **The hook is declared `static` on purpose.** It is the biggest gesture in the
  reel. A turn slow enough to register as continuous motion puts a near-empty
  frame on screen for a third of a second, because a plane rotated to 90 degrees
  is a line — the motion check PASSED that version and the phone sheet caught
  it. Invariant CC.
- **The CTA carries no portrait.** At `fit` 0.46 the headline overran a small
  floating card at 390px. It is now the house ending: type over the stage into a
  typing search bar.
- **The VO gate fired, and the line was rewritten.** "Two pictures. One face."
  returned 13f of drift on `One` — over the 12f hard threshold — with the very
  next cue starting on the numeral "One." Rewritten to "Two pictures of one
  face.", which cleared it to 11f max. Rewrite the line; do not wave the gate
  through.

## RefinaLips — "Load-Bearing"

Educational explainer. **The lips are not a part you can change in isolation** —
the philtrum above them and the chin below them are both READ against them, so
moving the lips alone changes how long the gap under the nose looks and how
strong the chin looks, with neither the nose nor the chin moving. Script is
`docs/scripts/lips.txt`; the composition is `src/refina/lips/`. Third reel on
the spec → compiler architecture.

- **It is the INVERSE of "Same Nose", using the same instrument.** Ratio's
  argument is misattribution: the change was nowhere near the feature the viewer
  named (nose 9.7 against jaw 44.0). This one needed the opposite measurement —
  the change had to be provably CONFINED to the lips while the rest of the face
  re-reads. Measured on `lips1`: **lips 51.7, eyes 16.3, nose 9.7, jaw 8.3,
  concentration 3.88, drift 3.3** — the cleanest localisation in the repo, on
  the first casting.
- **LENGTH WAS A REQUIREMENT, NOT A HOPE.** `flip-v6` was rejected at 88.1s
  against a corpus median of 55.5s, "long and thin". This script was written to
  a measured read rate — **154.5 wpm, calibrated off flip and ratio's own
  renders, not the 170 wpm in the docs** — and lands at **61.6s**.
- **`gen/score.py` GAINED A `lips` REGION, AND IT WAS NOT ADDITIVE.** `jaw` was
  x -0.50..0.50, y 0.72..1.02 and contained the whole mouth, so a lip change had
  always scored as a jaw change — the exact fault the 2026-08-26 rebuild fixed
  for `eyes`/`nose` and left standing here because no reel had targeted the
  mouth. `lips` is carved out of `jaw` via `EXCLUDES`. This moved
  `ratio1-chin`'s jaw from 35.3 to 44.0 and its concentration from 2.16 to 2.36:
  **the shipped `ratio-v5` prints 36.0 on screen and the scorer now says 44.0.**
  Its number was correct under the box definition in force when it was measured;
  re-emitting `ratio/measured.ts` is a separate decision and was NOT done here.
  Invariant II.
- **The box was derived, not typed.** `gen/calibrate-lips.py` measures the mouth
  across all registered portraits and reports the UNION, because the box has to
  hold every subject. It also reports what share survives `face_mask` — 95-100%,
  which is the finding that made a lips region measurable at all.
- **NO FIGURE ABOUT A FACE IS TYPED.** `gen/emit-lips.py` writes
  `lips/measured.ts` and the beats map over it. On-screen labels name the
  OPERATION — `PER-REGION PIXEL CHANGE, THIS PAIR` — because that is a
  computable statement about two files. Rule E.
- **THE SPANS COME FROM MEASURED LANDMARKS, NOT FROM `anchor()`.** anchor()'s
  boxes are fixed anatomical fractions, so they are the SAME BOX on a before and
  its after; a philtrum span drawn from them would have been identical either
  side of the edit, on the one beat whose claim is that the gap shortens. It
  would have passed every check and drawn a difference that is not there.
  Invariant HH. Measured: `lips1` noseBase 0.620/0.617 and `lips2` 0.650/0.650
  — the nose did not move on either — while philtrum goes 0.077 → 0.052 and
  0.108 → 0.083.
- **The landmark detector is LUMINANCE, not redness.** The first version reused
  the Cr-excess profile that sited the `lips` box and was wrong for the job: that
  profile peaks on the MOUTH LINE and its band edges are set by the chin's own
  warmth. Drawn on the pair, its "vermilion top" sat on the skin ABOVE the thin
  lip — too short on exactly the side of the comparison that had to be long. In
  a narrow central column the three landmarks are unmistakable in luminance: the
  nostril shadow, the bright philtrum plateau, and the mouth line as the darkest
  row on the lower face. **Draw a candidate landmark on the picture before
  building a beat on it.**
- **NO LIPSTICK, AND IT IS LOAD-BEARING.** `region_score` measures absolute
  pixel difference, so lip colour or gloss moves that number hard with no
  anatomical change — a tinted render would PASS the screen having done nothing
  the reel claims. The after prompt bans it explicitly; the base portrait's "no
  makeup" is not enough, because the model reaches for it every time it is asked
  for fuller lips.
- **`gen/diffmap.py` NOW MASKS TO FACIAL SKIN.** Rule Z was written against
  `RefinaFlip` and fixed in `gen/asym.py` only; `diffmap.py` — the tool the
  generated pairs use — still drew over the whole frame while the chips beside
  it reported skin. Invariant JJ. Feather radius is in MASTER pixels: 9 left a
  visible sticker edge along the jaw on a 1440px image, 26 does not.
- **`fit` sizes the PICTURE, never the type.** `lips1`'s face is 1039px in a
  1920px master, so at cover it lands at **0.541** of frame height against a
  corpus close band topping out at 0.453. Every portrait beat composites the
  picture as a sized element on the stage, exactly as `RefinaFlip` had to.
- **Every moving beat is a travelling hard edge**, and the seam RECURS across
  `hook`, `gap`, `another` and `chin` — Gemini counted 17 devices with none used
  twice in `ours-changed-v2` against a corpus median of 11 with at least one
  repeated. Invariant BB is why it is an edge and not a dissolve.
- **TWO SUBJECTS, AND THE SECOND IS ANNOUNCED.** `lips1` carries the spine;
  beat 5 says "another face" in the read AND carries a `SECOND SUBJECT` tag.
  `lips2` is deliberately a different age and ethnicity. She is measurably
  dirtier — lips 36.7, concentration 2.24, drift 4.3 against `lips1`'s 51.7 /
  3.88 / 3.3 — which is acceptable only because her beat prints no figures.
- **The words followed the measurement, twice.** "Her nose and chin never moved"
  became "Only her mouth was edited" because nose measured **9.7** — the same
  figure that forced `ratio`'s rewrite — and "The rest of her stayed still"
  became "Almost none of it is anywhere else". **The VO gate also fired:** "So
  test it." returned 13f of drift on `So`, over the 12f hard threshold;
  rewritten to "Test it yourself." it cleared to 10f max.
- **THE BED WAS WRONG IN v1 AND RAHUL HEARD IT.** It was built to the inherited
  recipe and "verified" at 100% speech under `silencedetect` — a measurement that
  cannot detect masking and scores a LOUDER bed better. Measured properly it sat
  **11.8 dB under the read, with the bed louder than the voice on 13.2% of speech
  windows**. It is now ducked under the voice by sidechain compression, with no
  `dynaudnorm`: **37.0 dB median, 1.2% inverted**. Three separate numeric checks
  passed the bad mix, which is why this is now a preflight STAGE
  (`gen/check-audio.py`) and not a paragraph.

## RefinaNose — "It Wasn't the Nose"

Educational explainer. **The eye does not size a feature, it compares one to the
ones around it** — so a nose that reads as too big can be a lower third that
reads as too small. Script is `docs/scripts/nose.txt`; the composition is
`src/refina/nose/`. Fourth reel on the spec → compiler architecture. Latest cut
is **`out/refina-nose-v9.mp4`** (50.6s).

- **IT IS THE SAME ARGUMENT AS `RefinaRatio`, CUT TO ONE THING.** Ratio runs
  92.3s because six of its nine beats are three numbered relationships
  (nose/chin, lid/eye, thirds). `flip-v6` was then rejected at 88.1s as "long
  and thin" against a corpus median of 55.5s. This is the single-argument
  version — one relationship, developed — and the read comes back at **50.6s**.
  Length was a requirement, not a hope.
- **THREE LINES OF RAHUL'S DRAFT WERE CHANGED, EACH BY A MEASUREMENT OR A RULE**,
  and the reasons are written into the head of `docs/scripts/nose.txt`:
  *"Most women who want a nose job don't need one"* is a population statistic
  with no source, replaced by the question the corpus explainers actually open
  on; *"not one pixel of it changed"* is false at nose 9.7 against a 4.7
  re-render floor, exactly the rewrite `ratio.txt` had to make; and *"Four
  millimetres forward"* is a millimetre figure about a face, which the script
  reference names as off-limits and which this frontal pair cannot show anyway.
- **IT REUSES `ratio1`, AND THE CASTING IS THE KNOWN WEAKNESS.** `nose1` is
  written into `gen/subjects.toml` with a brief that casts the NOSE explicitly —
  ratio1 was cast on the chin alone and its nose reads unremarkable, so the hook
  line "Think your nose is too big?" has nothing to point at. It has not been
  generated: the generator was down mid-session (gflow's host migration; see
  `gen/README.md` — use `gen/flow.mjs pair` now). **Swapping
  the hero in is a data edit** — the asset ids live in `shots.json` and every
  geometry is derived from the record — then re-run `gen/emit-nose.py`.
- **NO FIGURE ABOUT A FACE IS TYPED.** `gen/emit-nose.py` writes
  `nose/measured.ts` and the proof beat maps over it. It also **refuses to write
  the file** if the nose stops being the quietest region, or is not under half
  the jaw: the script says "almost none of it is on her nose" and a printed
  number that has drifted from its own pair is a false claim (rule E).
- **THIS REEL DRAWS NO SPANS, AND THAT IS A MEASUREMENT.** `RefinaLips` brackets
  a philtrum because its claim is that a vertical distance shortens. Measured on
  this pair the lower third does NOT change height — face height 1070 → 1059px,
  nose-base-to-chin **375 → 375px** — while lower-face WIDTH goes 572 → 628. A
  bracket across it would have drawn a difference that is not there and passed
  every check in the repo (invariant HH). The width figure is real but its own
  instrument reports the untouched EYE LINE moving 739 → 788px, so it cannot
  carry a printed claim either. The face is annotated with `Ring` only — a ring
  says WHERE and never HOW MUCH.
- **THE PICTURE'S BACKGROUND IS THE STAGE, AND THE PICTURE COVERS THE FRAME.**
  `gen/sage.py` repaints each master's studio backdrop (177,197,208) to the exact
  stage sage (163,181,186) by solving the composite rather than keying to alpha,
  so hair edges un-mix instead of fringing. Measured over the face mask it moves
  **0.4% of skin pixels by a mean of 0.012 levels** — which is why the evidence
  is still computed from the unpadded pair. That kills the top and side edges and
  makes the bottom one worse, because the turtleneck then stops in mid-air over
  `promote.py`'s pad. So `gen/extend-pad.py` clamps the last flat content row
  down and `gen/extend-frame.py` pads the canvas to **2234x3958** until the face
  is 0.257 of a frame the picture now covers. **There is no `fit` in this reel.**
  New rule OO.
- **FRAMING IS `zoom` PLUS A SOLVED `focus`, WHICH IS WHY THE MARKS RIDE IT.**
  `focus` enters the cover maths linearly, so evaluating a mark at focus 0 and
  focus 1 inverts it exactly — the camera is aimed with `anchor()` itself rather
  than with a second model of the layout. Every ring, seam and band follows for
  free. The `fit` version needed a parallel transform kept in step by hand, which
  is invariant S.
- **TWO BEATS PUSH IN ON THE FEATURE THEY NAME, AND THAT IS NOT RULE P's ZOOM.**
  Rule P came from mirror2, where a slow zoom was added to every *held* beat —
  beats with nothing in them — purely to move a frozen number. These start on the
  SCRIPT LINE that names a feature and travel to that feature's measured box:
  `claim` to the chin on "her chin is what moved", `resolve` to the nose on "the
  nose has something to sit against". No frame is typed; the start comes from
  `lineAt`. Rahul asked for this explicitly and the distinction was agreed before
  it was built.
- **THE ZOOMS ARE CALIBRATED AGAINST THE DETECTOR, NOT THE ARITHMETIC.** The
  record's face box is 0.257 of frame at zoom 1, but `shots.py` measures with a
  Haar cascade that reads ~90% of it, so the first pass put four beats a hair
  under their bands (hook 0.304 against a 0.31 floor).
- **THE WIDE SHOT IS A TWO-PANEL BEAT, NOT A SHRUNKEN PORTRAIT.** The first
  padding aimed for a 0.21 face so the portrait could carry wide as well; a
  head-and-shoulders crop has no chest, so it needed 1340px of clamped turtleneck
  and the bottom third of every frame went flat black. That is invariant Y from
  the other side — the references get their range by cutting to compositions that
  are not portraits. `nuance` crops the picture into two windows instead.
- **Every portrait beat is framed differently, because the Gemini pass asked.**
  An earlier cut ran four of five portrait beats at one size and Gemini described
  beats 1-5 as **one 37-second scene**, 1 cut, median shot 26.17s. Varying the
  framing per beat took it to 6 scenes, 3 cuts, 9 devices. New rule NN.
- **`mechanism` carries a comparison band and is still declared STATIC.** The
  band shuttles between the two measured ring edges — "your eye doesn't measure
  features, it compares them", drawn. `--verify` scores it at 1%; three stills 26
  frames apart put it at three visibly different heights with 1.65-1.75 mean
  pixel change, so it moves and a viewer sees it, but a 26%-opacity gradient does
  not clear the tile threshold at 270x480 (invariant L). The band stays and the
  declaration changed.
- **Element arrivals land on the words that describe them.** `lineAt` is derived
  in the compiler from the same cue table the captions read.
- **BEFORE/AFTER on the hook comes from the record's `role` field**, not typed.
- **`AiChip` gained an optional `size`.** It defaults to 12, which is 4.3px on a
  390px phone and was a smudge in every beat of the first contact sheet. This
  reel passes 26; it stays opt-in because two signed-off cuts share the component.
- **Measured, at 270x480 against 23 corpus reels through one pipeline**
  (invariant U — `measure-format.py`'s 160px number reads 83.3% and cannot see
  this treatment):

  | | corpus | nose-v9 | nose-v7 | lips-v1 | flip-v6 | ratio-v5 |
  |---|---|---|---|---|---|---|
  | still frames | **29.8%** | 50.2% | 54.7% | 71.5% | 45.5% | 11.4% |
  | mean frame change | **5.91%** | 1.60% | 0.92% | 0.70% | 1.69% | 2.66% |

  And on the standard pipeline, element arrivals went **4.7 -> 23.7/min**, inside
  the corpus range (18.0-152.7) for the first time in this repo, with continuous
  motion 5.5% -> 10.2%. None of that came from tuning: it came from the camera
  moving and the panels parting. Still short of `ratio-v5` on frozen, which
  animates in every beat.
- **`speech` reads 68.5% against a corpus median of 96.3, and that is bounded by
  having no bed.** `silencedetect` counts a true digital gap as silence; every
  corpus reel has music under it, and the 92.8-100% figures quoted for our own
  earlier reels were measured on mixes that still had one. Tightening the declared
  pauses took the read from 55.0s to 50.6s and moved this 66.4 -> 68.5. It cannot
  reach the corpus band without a bed.
- **`gen/check-frames.py` flags 154 frames and this is not a broken frame.** It
  fires on the sage margins that `fit` necessarily leaves; it also fails
  `lips-v1` (202 frames), `flip-v6` (119) and `ratio-v5` (14). Its threshold was
  deliberately NOT relaxed to make this reel pass — but note that `gen/check.py`
  therefore exits non-zero on every reel in the repo at that stage, which is the
  "check that cries wolf" CLAUDE.md warns people learn to skip.

## RefinaSize — "It Isn't the Size"

Educational explainer, and the fifth reel on the spec → compiler architecture.
**The lips are not a size, they are a line the rest of the lower face is
measured from** — so the philtrum above and the chin below both re-read when the
lip line alone moves. Script is `docs/scripts/size.txt`; the composition is
`src/refina/size/`. Latest cut is **`out/refina-size-v5.mp4`** (57.8s).

- **IT IS `RefinaLips` POINTED AT VOLUME INSTEAD OF LOCALISATION.** "Load-Bearing"
  proves the edit is CONFINED to the mouth (lips 51.7 against jaw 8.3). This one
  shows the RANGE — one face at two lip volumes — and adds a profile, because a
  frontal photograph is the view that hides projection. Seven of its ten beat
  components are `lips`' unchanged; `gap-shuttle`, `range-slider` and
  `profile-turn` are new.

- **THE HERO IS A REAL PHOTOGRAPH, WHICH IS BACKWARDS FOR THIS REPO AND CHANGES
  WHAT THE REEL MAY CLAIM.** `size1-before` is a consented photograph of a real
  woman, supplied by Rahul, restaged to the house portrait by prompt and
  repainted by `gen/sage.py`. Only `size1-lipred` and `size1-profile` are
  generated. Two consequences are load-bearing:
  1. The pair's floor is camera noise plus ONE model pass, not two, and the
     before is upscaled from 1086x1448 while the after is downscaled from 2K —
     different resampling paths. Its `tex` figure is therefore **not comparable
     to lips1's** and the reel must not claim it is. That is why this reel has
     **no proof beat and no `MeasureChips`**: the third beat teaches the
     mechanism instead of printing numbers that would need that caveat on
     screen to be honest.
  2. `registry.py` gained `photo:unmodified` → **PHOTOGRAPH, UNMODIFIED**, so a
     viewer can tell which pictures came out of a camera and which out of a
     model.

- **NO ONE IS NAMED, AND THE DRAFT DID NAME SOMEONE.** The script arrived as
  "celebrity feature analysis, subject Sydney Sweeney", with beat 1 reading
  *"This is who you're comparing them to. Sydney Sweeney."* over the hero's face
  and beat 10 *"You will not get her mouth."* The face in frame is not that
  person, so the lines made a false claim about a real private individual — the
  class of error rule E exists for, with a third party carrying the cost. Two
  lines changed: "This is the mouth you're picturing" and "You will not get that
  mouth." **Nothing structural was lost** — 14 of the 21 corpus explainers open
  on a question about the viewer, not on a person, and the hook already was one.
  Generating altered images of the named celebrity was declined outright.

- **A TURNED HEAD IS A RENDER, NOT A SECOND SITTING.** The profile is generated
  i2i off the frontal, so it is a model's account of a face it has only ever
  seen from the front — never evidence of what this person's profile is. It was
  first labelled `SAME SITTING`, which claims a photograph that was never taken.
  It now registers as `view:profile-generated` → **SIDE VIEW, GENERATED**, and
  `turn` is the one beat carrying the compliance chip over a whole invented
  head. New rule: a label names the OPERATION whenever the picture is not the
  camera's.

- **`gen/flow.mjs` GAINED A `derive` VERB.** `pair` generates its own before and
  attaches it, which is right when both halves are ours. Here the identity
  anchor is a file on disk, so `derive` uploads that file fresh for EVERY
  prompt — which also means round N is derived from the hero and never from
  round N-1, so variants cannot drift down a chain.

  ```
  node gen/flow.mjs derive --hero-file gen/_masters/size1-base.png \
      --prompt-files gen/out/size1/after.txt,gen/out/size1/angle-profile-left.txt \
      --out gen/out/size1 --name size1 --ratio 3:4
  ```

  **Flow was slower than its own 1200s poll on every attempt this session** and
  returned 0 files three times; all three renders had landed when `list` was
  re-run minutes later. Note 7 is real — re-run `list` before spending credits.
  The 2K download also OOM-killed Chrome twice; 1K succeeded where 2K failed,
  and a retry of the same 2K then worked.

- **THE FIRST PAIR FAILED THE SCREEN AND THE BRIEF WAS THE FAULT.** `lips 22.3
  against a threshold of 25, concentration 1.37, +texture` — the eyes moved 16.3
  against the lips' 22.3, so the model re-rendered the whole face rather than
  editing one region. Exactly `ratio1`'s failure (12 against 25) and exactly its
  fix: a severe brief. Adding "strikingly thin and flat… almost a straight line
  with no cupid's bow", naming the philtrum as lengthening, and adding **"do not
  re-render, smooth, sharpen or beautify any part of her face except the lips"**
  took it to **lips 34.7, eyes 20.3, nose 10.0, jaw 11.3, concentration 1.70,
  drift 5.3**. Concentration is still well under lips1's 3.88 — **this pair is
  the reel's known weakness** and the reason its claims are hedged below.

- **THE EDIT RUNS THE OTHER WAY, AND THAT BROKE A TOOL.** Every other lips entry
  generates a thin subject and augments her; this hero already has the full
  mouth, so the generated half is a lip REDUCTION. `gen/emit-lips.py` hardcoded
  `f"{subj}-lipaug"` and exited on a correctly registered subject. It now reads
  the pairing from `registry.json` (`role` + `pairs_with`), which is where it
  was already stated. `lips1`/`lips2` re-emit byte-identically.

- **THE WORDS FOLLOWED THE MEASUREMENT, TWICE — AGAIN.** The draft read "The nose
  never moved" and "Same chin, both photographs". Measured, nose 10.0 and jaw
  11.3 against a 5.3 floor: least of the four regions, but not zero. Both are
  now "isn't what changed", which is the third time this repo has had to make
  that exact rewrite (`ratio.txt`, `lips.txt`, here). The `chin` beat's ring
  label went `SAME CHIN` → `THE CHIN` for the same reason — **a ring says WHERE
  and never HOW MUCH**, and "SAME" is a HOW MUCH.

- **THE LANDMARKS BACK THE SCRIPT.** `philtrum 0.045 → 0.061` — longer with thin
  lips, which is what beat 4 says out loud — while `noseBase 0.612 → 0.614`,
  about 2px of face height. Drawn from MEASURED landmarks, never from
  `anchor()`'s fixed boxes, which are identical either side of an edit and would
  have drawn a difference that is not there (invariant HH).

- **THE VO GATE PASSED FIRST TIME**, at 11f max drift against a 12f threshold —
  the first reel here that needed no line rewritten for the recogniser. 27 cues,
  159 words, **68.07s**. That is longer than `lips-v1` (61.6s) and `nose-v9`
  (50.6s) and over the corpus median of 55.5s, and `flip-v6` was rejected at
  88.1s as "long and thin". The script is Rahul's and was kept; the two cheapest
  cuts if it needs to come down are beat 3's middle line and beat 10's "You will
  not get that mouth", worth about 3.5s together and neither carrying the
  argument.

- **THREE BUGS THE STILLS CAUGHT, NOT THE CHECKS.**
  1. `AiChip` defaults to `size` 12 — 4.3px on a 390px phone. This reel passes
     26, as `nose` does. The default stays for the two signed-off cuts.
  2. `range-slider` hands the bracket from one picture to the other when the
     seam crosses it, and the crossing point was computed as `x/1080`. `Pic`
     scales the picture about frame CENTRE, so at `fit` 0.72 the seam reaches
     x=430 at 35.9%, not 39.8% — the bracket reported the wrong picture for 4%
     of every traverse. **Invariant S in miniature: a mark and a picture must go
     through the identical transform.**
  3. `gap-shuttle` oscillated linearly, so most of its frames were in TRANSIT
     and the still at the midpoint had the band lying across the mouth — on a
     beat captioned THE GAP, NOT THE PART. It now dwells at both ends.

- **`Reveal` DRAWS ITS SEAM AT ANY PROGRESS BETWEEN 0.5 AND 99.5**, so a sweep
  that reaches the extremes puts a full-height rule down the edge of the frame
  that reads as an artefact rather than as an edge between two pictures.
  `range-slider` sweeps 8..92 instead.

- **The picture's sage and the stage's sage differ by 1-2 levels** — stage is
  exactly (163,181,186), the repainted picture backdrop (162,182,188). Measured
  on a still, invisible at phone size, and NOT a `promote.py` pad: every column
  and row of all three assets carries real variance. Worth knowing before
  someone chases it as a pad bug.

- **THE READ WAS ASSEMBLED FROM 27 TAKES AND SOUNDED LIKE IT. RAHUL HEARD IT
  FIRST.** "Somewhere it is slow, somewhere it is a different tone." Nothing in
  the pipeline had ever looked: `gen-voiceover.py` made ONE TTS CALL PER PHRASE
  and concatenated, so Aura-2 chose pace, pitch and loudness afresh for every
  line with no knowledge of its neighbours. Measured across the 27 phrases of
  `size-v3`'s read:

  | | v3 (27 calls) | **v4 (10 calls)** |
  |---|---|---|
  | speaking rate | 111-417 wpm (**3.76x**) | **157-243 wpm** |
  | level spread | **11.4 dB** | **1.4 dB** across beats |
  | pitch spread, excl. hook | **10.0 semitones** | **2.6 semitones** |
  | word-onset drift | 11f max, 2 over tolerance | **5f max, 0 over** |

  Probed directly, the `cta` beat's four phrases varied **2.35x in rate and 7.0
  dB** spoken separately, and not at all spoken as one call. That is the whole
  finding.

- **`--group <shots.json>` MAKES THE BEAT THE UNIT OF SYNTHESIS**, so a seam can
  only fall where there is already a cut. Use it on every new reel:

  ```
  python docs/preview-review/gen-voiceover.py \
      --script docs/scripts/<n>.txt \
      --audio  public/voiceover-<n>.mp3 \
      --ts     src/refina/<reel>/words-vo.ts \
      --group  src/refina/<reel>/shots.json
  ```

  A pause declared on a line INSIDE a beat is dropped — the model's own phrasing
  supplies it, and only the beat's last line keeps its pause. The read got
  **3.7s longer** because of that, which is the price of it sounding continuous.
  Alignment also got BETTER, not worse: the recogniser sees whole sentences, so
  drift halved and interpolated words went 5 -> 2.

- **LEVEL IS MATCHED PER UNIT, RATE ONLY FOR OUTLIERS.** A constant gain per
  unit to the read's own median — never a compressor, because the level
  relationships INSIDE a unit are the performance. Rate is left alone unless a
  unit falls outside tolerance: `demo` came back at 268 wpm against a 199 median
  and was pulled to 218 with `atempo` 0.834, bounded at +-18%. Everything in
  band is untouched. **A read where every beat is the same speed is a
  metronome**, and the difference between a hook and a CTA is the performance.

- **TWO ORDERING BUGS, BOTH FOUND BY THE TOOLS DISAGREEING.**
  1. Transcription ran on the RAW cached audio and every onset was then shifted
     back by however much `trim_silence` had removed. That fudge cannot survive
     retiming — and was never needed. It now transcribes the FINISHED segment,
     so onsets need no correction at all.
  2. Rate was measured BEFORE levelling. Rate is words over the VOICED span and
     "voiced" is a level threshold, so gain changes the measurement: the
     generator's median read 210 wpm while `check-prosody.py` saw 202 on the
     finished mp3, and it corrected a beat the check thought was fine while
     under-correcting the one that was not. Level first, then measure.

- **`gen/check-prosody.py` IS A PREFLIGHT STAGE**, for the same reason
  `check-audio.py` is: judgeable from the audio alone, and an 8-minute render is
  a slow way to learn the narrator changed halfway through. **Three numeric
  checks passed the bad read** — the VO verifier, legibility and the shot plan
  all looked at it and saw nothing, because none of them was asking.

- **IT JUDGES THE UNIT OF SYNTHESIS, NOT THE PHRASE.** The first version scored
  every phrase and flagged 20 of 27 on the FIXED read, because a phrase inside a
  continuously-spoken beat is a slice of one delivery cut mid-breath and its rate
  is noisy by construction. That is how a check earns a reputation for crying
  wolf. With `--group` it scores beats, and 9 of 10 pass outright.

- **A BEAT MAY DECLARE ITSELF EXEMPT, IN WRITING.** `prosody_exempt` in
  `shots.json`, the same pattern as `framing_exempt` in the asset registry:
  `hook` measures +3.6 semitones over the median because it opens on a QUESTION,
  and a rising terminal is the format rather than a seam. The honest fix for a
  measurement that is right about the number and wrong about the meaning is a
  stated reason on the specific case — never a threshold quietly widened until
  everything passes.

- **v3 AND v4 BOTH SHIPPED THE WRONG VOICEOVER, AND EVERY CHECK PASSED.** This
  is the worst defect in the reel's history and it was mine. `public-size/` is a
  9.8 MB copy of the eight files the reel reads, verified byte-identical to
  `public/` ONCE, when it was created. The read was then regenerated twice into
  `public/` and nothing copied it across, so two finished renders carried the
  original 27-take audio — and because the pictures had been re-cut to the new
  cue table meanwhile, the read also ran AHEAD of them. Rahul heard it as "the
  voiceover is still pretty much the same", which is exactly what it was.

  **Every audio check in this repo reads `public/`. The reel does not.** It
  plays whatever the renderer was pointed at. `check-prosody` measured the right
  file and passed; `shots.py --verify` measures the picture; the phone sheet is
  stills. Nothing looked at the finished file's audio. Measured afterwards, the
  two renders separate cleanly:

  | render | max drift | mean | over tolerance |
  |---|---|---|---|
  | **v5 (correct)** | 12f | 4.3f | 1 |
  | v4 (stale audio) | **68f** | **18.2f** | **94** |

  Two new stages, because one guards the cause and the other the symptom:
  `gen/check-publicdir.py` (preflight) fails when a `public-*/` file differs from
  `public/`; `gen/check-render-audio.py` (postflight) transcribes the RENDER's
  own audio track and checks the words land where `words-vo.ts` says. **A cache
  verified once and then never again is worse than no cache.**

- **`check-render-audio.py` PASSED EVERYTHING ON ITS FIRST OUTING**, because
  `verify()` returns a REPORT DICT and `ok = verify(...)` is always truthy. A
  check that cannot fail is worse than no check; it was caught only by running
  it against v4, which it was written to detect. **Run a new check against the
  known-bad artefact before trusting it.**

- **PACE: THE READ WAS SLOWER THAN IT LOOKED, AND GROUPING MADE IT SLOWER.**
  Counted conventionally — words over WALL-CLOCK, pauses included — the original
  read was 140 wpm against ~170 for the corpus explainers. Grouping added the
  model's own phrasing pauses and took it to **133**. So the fix for tone made
  the pace worse, and `--speed` exists to pay that back.

  | | duration | conventional wpm | VO gate |
  |---|---|---|---|
  | original, 27 calls | 68.1s | 140 | — |
  | grouped, x1.0 | 71.8s | 133 | 5f |
  | grouped, x1.15 | 65.3s | 135 | 9f |
  | grouped, x1.18 | 63.8s | — | **14f — FAILS** |
  | **x1.28, two lines cut** | **57.5s** | **153** | 10f |

  Retiming alone hits a ceiling: past ~x1.15 the recogniser starts losing short
  unstressed words and the per-word gate fails. **The rest of the pace has to
  come from word count** — two lines went, and the same x1.28 that failed on 159
  words passed on 147. Drift is NOT strictly monotonic in speed; it depends on
  which words are in the script.

- **GROUPING TOOK THE SCRIPT'S PAUSES AWAY INSIDE A BEAT, AND THAT BROKE A
  CAPTION.** At speed the hook's first line finished SEVEN frames before the next
  replaced it, against the 12-frame floor — `check-legibility.py` caught it.
  `splice_pauses()` now inserts the declared silence at the MEASURED phrase
  boundary inside the unit. That is not what caused the original defect: this is
  one continuous take with a gap in it, not two takes butted together.

- **MEASURED, AND THE ONE NUMBER THAT SHOULD WORRY YOU IS ARRIVALS.** `refs/analyse.py`
  on the shipped cut (`refs/formats/ours-size-v3.report.md`), against the same
  pipeline the other reels were put through:

  | | size-v4 | size-v3 | nose-v9 | flip-v6 (REJECTED) | corpus |
  |---|---|---|---|---|---|
  | element arrivals / min | **2.5** | 2.6 | 23.7 | 10.9 | 88.8 |
  | frozen frames (160x284) | **92.7%** | 94.6% | 83.3% | — | — |
  | duration | **72.1s** | 68.4s | 50.6s | 88.1s | 55.5s |
  | median shot | **5.87s** | 6.83s | — | — | 3.13s |
  | cuts / min | **6.7** | 5.3 | — | — | — |
  | speech | **65.6%** | 67.0% | 68.5% | — | 96.3% |

  v4 is the read-repair cut. Cuts and median shot improved because the beats
  re-timed; **arrivals did not move** and duration went UP 3.7s, which is the
  cost of a read that sounds continuous. Speech drifted down 1.4 points for the
  same reason — `silencedetect` counts the model's own phrasing pauses as
  silence, exactly as it counts every true gap in a bedless reel.

  Read that honestly. `flip-v6` was rejected as "long and thin" at 88.1s and
  10.9 arrivals/min. This cut is 20s shorter — but it lands **a quarter as many
  things per minute as the reel that was rejected for landing too few**, and a
  tenth of nose-v9. Frozen at 160x284 is a resolution the treatment defeats
  (invariant U), so the absolute number means little, but it is still 11 points
  worse than nose on the identical pipeline.
  **The deficit is density INSIDE beats, not pacing between them** — cuts/min
  and shot travel are both on the corpus median. Every beat animates one device
  over one held portrait for a median 6.83 seconds. Closing it is design work
  per beat: more elements landing, more of the picture replaced. It is NOT
  another easing curve and never a push or a creeping zoom (rule P).

- **`shots.py --verify` PASSES AND `refs/analyse.py` DISAGREES WITH IT, AND BOTH
  ARE RIGHT.** Per-beat: hook 52%, mechanism 35%, chin 67%, demo 86%, turn 34%,
  nuance 46% of frames moving, 58% of runtime declared moving, travel 2.11x
  against a 1.8x floor. Those measure whether a beat's own picture changes.
  Gemini's 94.6% frozen measures how much of the FRAME changes. A travelling
  seam satisfies the first and barely moves the second — the same split
  `RefinaFlip` recorded when its cut went 81.4% -> 56.6% still with mean frame
  change flat at 0.31% -> 0.28%. Do not use one to argue the other away.

- **`gen/check.py` exits non-zero at the `frames` stage**, 225 frames in 4 spans:
  `nuance`'s two panels on sage, and the `test` and `cta` type-over-stage beats.
  That stage fails every reel in this repo (nose 154, lips 202, flip 119, ratio
  14) because it fires on the sage margins `fit` necessarily leaves. Each worst
  frame was checked on the phone sheet and shows what it claims.

- **RENDERING THIS REEL NEEDS `gen/render-segmented.sh`.** A single
  `remotion render` of 2042 frames is killed by the OS for low memory at around
  frame 420 on this machine — five times in this session, with 2-3 GB free and
  ~30 Chrome processes of the user's own holding 3.4 GB. It is NOT the asset
  copy: `public-size/` is 9.8 MB and verified byte-identical to a full-`public/`
  still (same md5), and it died the same way with both. The script renders frame
  ranges into segments, validates each with `ffprobe` before trusting it, skips
  the ones already complete, and concatenates with `-c copy`. **Delete
  `out/.segments-<Comp>/` by hand after changing the composition** — segments
  are not fingerprinted against the source, so a stale one would splice a
  previous cut into the middle of a new one.

## RefinaBangs — "Why Anne Hathaway Looks So Different With Bangs"

Educational explainer, house sage treatment, built 2026-10-29 in one session
from Rahul's brief. **A fringe hides part of the upper third, so the
proportions you perceive change while the structure does not.** Script
`docs/scripts/bangs.txt`, plan `src/refina/bangs/shots.json`.

- **THE DIALOGUE IS VERBATIM, AND IT NAMES A REAL CELEBRITY.** Raised before
  synthesis: naming her over a face that is not hers is the RefinaSize false
  claim, and her face on a Refina reel is an implied endorsement. Rahul's
  answer: the hero images ARE her, made from the client's real photographs,
  restaged by him to the house portrait, commercial rights held. So they are
  registered `photo:edited` -> **EDITED PHOTOGRAPH** (two different sittings
  made to match - never "unmodified", never "same sitting") and carry **no
  AI-preview chip**, which would call a photograph a preview. Keep the client's
  originals: they are the only proof the edit did not change her face.
- **THE PAIR IS REGISTERED BY CONSTRUCTION.** anne-before / anne-fringe put
  eyes, nose and mouth on the same rows within a few px, and `gen/score.py`
  passes them as a hair edit: nose 15.3, lips 30.0, jaw 27.7, drift 12.0.
  That is what lets a seam down the midline join ONE face (hook) and a fringe
  fall over the same forehead (geometry).
- **LANDMARKS WERE READ OFF A GRID, NOT DETECTED** (`bangs/landmarks.ts`). No
  detector here finds a hairline or brow, and the registry's skin-mask face box
  MOVES when a fringe covers forehead skin (anne-before top 244, anne-fringe
  302) - so trio's face-unit geometry would have shifted the marks between the
  two halves of a pair. Rows are source pixels of each subject's control and
  both assets of a pair are laid out from it. Brackets say WHERE; nothing
  prints a number.
- **WOMEN B AND C WERE CAST AS OPPOSITE UPPER THIRDS** and it held: bangs2
  hairline-to-brow 240px, bangs3 160px. bangs2's fringe render FAILED the
  screen (drift 31, whole face re-rendered) and was kept on Rahul's eye - it is
  only ever shown as a fringe column that then lifts to her own before.
- **`gen/sage.py --graded`.** These portraits came back on a graded sweep -
  light at the top, bluer low - and the flat-colour repaint left hard blue
  islands beside the shoulders on three of six. `--graded` fits a quadratic
  backdrop field from border-connected pixels instead of sampling two
  corners. Opt-in; every existing call is unchanged. Corners land 1-4 levels
  off stage sage, the tolerance the house already accepts.
- **The read: vesta at --speed 1.25.** Raw it ran 77.5s, and the pauses were
  only ~10s of that - vesta reads ~130 wpm voiced. 1.25 put it at 62-63s with
  max drift 12f. The `end` beat came back +2.2 and +2.0 semitones on two takes
  and was RE-ROLLED, not exempted; the third take is +0.9.
- **The Dossier is real**: Rachel's report, recorded deterministically in
  `refina-videos/dossier2` and `ugc-dossier` (`public/dossier-rachel/`), whose
  Hairstyles study happens to include fringes. Clips longer than their line are
  slowed by `playbackRate` (never below what the line needs), not frozen.
- **No music bed** (Rahul). trio's spot sfx, cued off the word table.

## RefinaProtocolReel — read the spec before touching it

**`docs/qoves-reel-spec.md` is the contract.** Read it in full before writing or editing
any file under `src/refina/protocol/`. It contains the measured visual spec, the locked
script, the headline track, and the VO timing method. Do not improvise a treatment.

### Non-negotiables (I got these wrong once — do not repeat)

1. **Background is flat sage `#A3B5BA` for the entire runtime.** Never cream. Cream/mauve
   belongs to `RefinaReel`, a different composition.
2. **All text is white.** The only dark text is inside the white "section pill" device.
3. **Two type tracks at different speeds.** Headline (top, light sans, ~60px) holds for a
   whole section — up to 16s. Caption (bottom, italic serif, ~42px) changes every
   ~1.5-2s. Never change both at once.
4. **Text enters blurred and sharpens word by word.** Not a plain fade.
5. **Visuals are large.** Full-bleed faces and near-full-width panels. Never a small
   element floating in a large empty field.
6. **Ending is a typing search bar**, not a logo lockup or app-store badge.
7. **Compose every beat from the animation primitives** in
   `src/refina/protocol/motion.tsx` (spec §10) — PopIn, SlideIn, CountUp, TrimPath,
   SliderReveal, PushWipe, ScrollReveal, ChatThread, Montage, Cursor, StepPill,
   AnimatedCheckList, SlideOver. A plain opacity fade is the last resort, not the
   default. The `MotionLab` composition demos each one. The first rebuild was rejected
   for having ~5 behaviours where the reference has ~17.
8. **Headline font is Outfit** (`displayFont`), captions stay Playfair italic.
   **RefinaPreviewReel is the exception** — its headline face is **Instrument
   Serif 400**, via `headlineStack` / `headlineItalicStack` in `src/fonts.ts`.
   Three consequences, all load-bearing:
   - **One weight only.** Nothing in that reel's headline track can be
     emphasised by weight; the reasons index separates numerals from labels by
     size and opacity alone. Any new emphasis has to come from size, case or
     colour.
   - **It runs small and light** for its point size, so the preview reel sets it
     larger than the Outfit sizes it replaced: headline 70, index 74, numerals
     38, pill 37, disclaimer 64. Do not "restore" the old numbers.
   - **`italicSecond` uses this family's own italic**, not Playfair. A serif
     headline with a Playfair italic second line is two different serifs inside
     one headline.
   `SectionPill` and `Headline` in `protocol/atoms.tsx` stay on Outfit because
   the approved protocol cut shares them — the preview reel uses its own
   `PreviewPill` and `SectionHeadline` in `preview/draw.tsx`.
   NOTE: the reel now runs a serif headline over a Playfair italic caption. The
   two tracks are separated by size and colour, not by family, so keep that
   contrast in mind before shrinking either.
9. **Keep `remotion.config.ts` on PNG frames + CRF 18.** JPEG frames soften hair edges
   and thin lines.

### Content rules

- Refina's **content**, QOVES's **treatment**.
- **Never invent facts about Refina** — no research duration, dataset size, staff,
  accuracy figures, or user counts unless the user supplies them. The credibility beat
  uses a feature-based substitute; see spec §7.
- Compliance chip on product beats: `AI PREVIEW · NOT MEDICAL ADVICE`.
- Photos of real people (Madison) are used with her consent as a Refina promoter.

## Commands

```
npm run dev                                              # studio (run from this dir)
npx remotion render RefinaProtocolReel out/x.mp4 --codec h264
npx tsc && npx eslint src                                # must pass before rendering
```

Verify visual work by rendering stills and actually looking at them
(`npx remotion still <comp> out/x.png --frame=N`) before declaring it done.
