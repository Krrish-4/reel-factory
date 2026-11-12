# The celebrity-feature format

A plug-and-play explainer: swap the person, swap the feature, the reel is the
same. `_celeb-template.txt` is the fill-in copy; `celeb-sweeney-lips.txt`,
`celeb-zendaya-midface.txt` and `celeb-elordi-jaw.txt` are three filled ones.

## The engine, and it is already shipped

The two finished explainers in this repo are the same machine pointed two ways:

| reel | argument | measured |
|---|---|---|
| `nose.txt` "It Wasn't the Nose" | **misattribution** — the change landed nowhere near the feature the viewer named | nose 9.7, jaw 44.0, concentration 2.36 |
| `lips.txt` "Load-Bearing" | **confinement** — the change is provably only in the feature, and everything else re-reads | lips 51.7, eyes 16.3, nose 9.7, jaw 8.3, concentration 3.88 |

Both run one rule: **a feature is never read on its own, it is read against the
two features next to it.** Change the feature and the neighbours re-read without
moving. That rule is what makes this format plug-and-play — not the beat order.
Filling the template is really just answering *which two neighbours*.

## The neighbour matrix

Fill `{{NEIGHBOUR_A}}` and `{{NEIGHBOUR_B}}` from here. If a feature is not on
this list, the reel does not have an argument yet and no amount of celebrity
fixes that.

| `{{FEATURE}}` | `{{NEIGHBOUR_A}}` | `{{NEIGHBOUR_B}}` | mechanism, in one line |
|---|---|---|---|
| lips | the gap under the nose (philtrum) | the chin | both are measured *from* the lip line |
| nose | the chin / lower third | eye spacing | the eye sizes a nose against what is under it |
| chin / jaw projection | the nose | the neck line | a lower third that sits back leaves the nose standing out |
| jawline definition | the neck (submental angle) | the nose | the angle decides whether the bone reads at all |
| cheekbones / midface | the eyes | the jaw | the face is read as a taper from its widest point down |
| eyes (canthal tilt) | the brow | the cheekbone | a lid is read against what supports it below |
| brow position | eyelid show | the forehead | lowering a brow spends visible lid |

## The beat map

Ten beats, 27–29 lines, and it is the corpus explainer shape with the brief's
five steps mapped onto it — **not** the five steps on their own.

| # | beat | brief step | proposed composition | exists? |
|---|---|---|---|---|
| 1 | hook — the celebrity, a question | 1 | `lower-third-rules` | yes |
| 2 | claim — flat, and about the viewer too | 1→2 | `full-bleed-wipe` | yes |
| 3 | mechanism — the reproducible reason | 3 | `difference-map` | yes |
| 4 | one — `{{NEIGHBOUR_A}}` re-reads | 2 | `pair-sweep` | yes |
| 5 | two — `{{NEIGHBOUR_B}}` re-reads | 2 | `span-compare` | yes |
| 6 | demo — the Refina range | 4 | `range-dial` | **NO — build it** |
| 7 | the turn — 3D | 4 | `turn-table` | **NO — build it, and no asset** |
| 8 | nuance — complicate the claim | — | `pair-toggle` | yes |
| 9 | self-test | — | `instruction-cards` | yes |
| 10 | CTA | 5 | `disclaimer-search` | yes |

**Beats 8 and 9 are not in the brief and they are not optional.** All 14 corpus
explainers carry a nuance that complicates their own claim, and five carry a
self-test — the most saveable moment in the format, and the thing that makes
these read as teaching rather than selling. `reel-script/REFERENCE.md` says it
in as many words: do not cut it for time. If the reel is long, cut beat 6 to
one line; never cut 8 or 9.

**Beats 6 and 7 are the only two product beats, deliberately.** Both of our
first reels measured as *product demo* and closing that gap is the whole point
of the explainer shape. Two of ten is the ceiling — and they have to show the
argument (the neighbour moving) rather than the app's chrome.

**`range-dial` should compose `kit/MetricSlider` inside the `PhoneShell` in
`preview/flood.tsx`** before anything new is written — rule DD, the kit was
built without checking what already existed and duplicated three components.

## The four gates

Each one has failed something in this repo already. None is optional.

### 1. Likeness — decided before a render, not during

Beats 1–5 are commentary over a licensed photograph: that is what the whole
reference corpus does. Beats 6–7 **generate an altered face and put it in an
advertisement**, which is a different thing legally and on-platform. The three
scripts are written so the demo line reads correctly either way — "one face",
never "her face" — so the decision can be made late:

- **(a)** dial the celebrity. Strongest hook, highest exposure.
- **(b)** dial a generated non-celebrity at beat 6 and say so out loud, the way
  `lips.txt` beat 5 announces its second subject. RefinaChanged's worst defect
  was silently swapping who its subject was; an announced swap is not that.
- **(c)** dial the *viewer's* stand-in — "you will not get her mouth, you will
  get yours" is already the CTA, so (c) is the option the writing points at.

This is Rahul's call and this file does not make it. But a filled script may not
go to render until its header records which of (a)/(b)/(c) it is.

### 2. Evidence — a real source may be cited, an implied one may not

`reel-script/REFERENCE.md` used to ban citations outright. It no longer does:
**cite whatever is real and recorded.** Beat 3 is the evidence slot and a named
study is the strongest thing that can sit in it — 8 of 21 references do exactly
that, and `kit/CitationCard` is built and waiting.

What is banned is the shape without the substance. **"Full lips signal
fertility" still cannot go in beat 3** — not because it cites something, but
because it cites nothing, and it is contested besides. A citation carries its
receipt on the line above the claim:

```
# SOURCE: Author et al. (2021), Journal. https://doi.org/10.xxxx/yyyy
```

`gen/check-citations.py` fails a script that sounds like research and names no
source with a DOI or URL. It runs in `npm run check`. It cannot tell you the
source is real or says what you claim — someone has to have read the paper.

**Until a source has been read, beat 3 carries mechanism instead**, which is
what all three filled scripts do today: geometry the viewer can reproduce, and
beat 9 has them reproduce it. That is the same authority both shipped explainers
run on — a physical fact the viewer can check on their own face, and a
per-region figure from `gen/score.py` describing **two image files we
generated**, never a face (rule E).

### 3. Assets — three of these beats have nothing to render

- `range-dial` and `turn-table` have **no beat component**.
- The 3D turn has **no asset and no source for one**.
  `public/refina-ui/screens_trim/` holds 22 app screens and none of them is a
  3D view; there is no turntable capture anywhere in `public/`. It needs a
  screen recording of the real feature, or a generated rotation — and a
  generated one is a paid render that gets quoted and approved before it runs.
- The registry has **no midface and no jawline pair**. `celeb-zendaya-midface`
  therefore cannot put a figure on beat 3 until one is generated and scored; a
  missing number is honest, an invented one is rule E. `celeb-elordi-jaw` can
  reuse the nose reel's own pair on beat 5 on day one — `sage-ratio1-before` /
  `sage-ratio1-chin`, measured under the key `ratio1` — so do not generate a
  second pair to make the same point.

### 4. Length — measured, not hoped

```
python docs/scripts/wordcount.py docs/scripts/celeb-*.txt
```

Band is 52–66s. Corpus median is 55.5s and **flip-v6 was rejected at 88.1s** as
"long and thin". The rate is calibrated off both finished vesta reads (163 and
179 wpm) rather than assumed; the real figure still comes from the audio, and
this only stops a 90s script reaching a paid synthesis.

### And the parity rule that throws at module load

`src/refina/<reel>/shots.json` declares how many script lines each beat covers.
Adding a line here without adding it there makes `beats.ts` throw. All three
filled scripts are **27 lines**, so one shot plan fits all of them unchanged —
which is the point of a template.

## Building one

```
python docs/scripts/wordcount.py docs/scripts/celeb-<name>.txt     # gate 4
python docs/preview-review/gen-voiceover.py \
    --script docs/scripts/celeb-<name>.txt \
    --audio  public/voiceover-celeb-<name>.mp3 \
    --ts     src/refina/<reel>/words-vo.ts
python gen/shots.py src/refina/<reel>/shots.json --emit
npm run check
```

Then the rest of the routes in the `refina-reel` skill: Assets for the pair,
Build for the two new beat components, Render, and Review — `refs/analyse.py`
on the finished cut, because rule P is not satisfied by measurement alone.
