# ref-01 — "Do piercings ruin your face?"

Instagram, 55.5s, 1080x1920@30. Source: instagram.com/p/DbV15JCqp0Z

## Format: evidence explainer

Not a product demo. The product appears for ~3 seconds at the very end. The
body of the reel is an argument built from research, and the sell is that
whoever made this knows things you don't.

**Shot grammar, in order:**

1. Named celebrity as the hook subject, full-bleed, with a name label
   (`ZENDAYA / AMERICAN ACTRESS`) — the claim is posed as a question over her
2. Study evidence: a bar chart with axis labels and a **real citation block**
   underneath, plus a strip of face thumbnails feeding the chart
3. N-up comparison grids of the SAME face with one variable changed
   (0 / 1 / 2 / 3+ piercings), labelled per cell
4. Attribute chips pinned to a face — `INTELLIGENT` `ATTRACTIVE` `FASHIONABLE`
5. A slider control labelled `SOCIAL EXPECTATIONS` used as an illustration,
   not as UI
6. An expert citation card (`Psychologist Sara Martino`)
7. Moodboard collage inserts — small lifestyle images clustered around the face
8. A second named celebrity as the counter-example (Lenny Kravitz)
9. Closes on a LinkedIn profile card, then a product screen, then "link in bio"

## What we do not have

Every one of these is a device our reels lack:

- charts with citations
- N-up grids that vary one factor across cells
- named third-party exemplars used as evidence
- attribute chips attached to a face
- an expert/authority card
- collage inserts

## The numbers that matter

Measured by `refs/measure-format.py`; full record in the sibling `.json`.

| | ref-01 | ours-preview-v10 | ours-protocol-v4 |
|---|---|---|---|
| frozen frames | **50.5%** | 80.8% | 85.1% |
| element arrivals / min | **117.8** | 64.9 | 25.5 |
| headline on screen | **46.3%** | 91.7% | 91.3% |
| median shot | 4.9s | 10.4s | 7.1s |
| speech | 95.1% | 74.5% | 85.3% |
| median phrase | 3.19s | 1.27s | 1.89s |

**The finding.** Their frame is half as still as ours and lands roughly twice as
many things per minute. They hold a headline less than half the time; we hold
one almost always. So their stillness reads as composure and ours reads as
stasis — same palette, opposite density.

## What the contact sheet missed

The grammar above was first written from 24 stills. `describe.py` then read the
whole video and found devices those samples never landed on:

- circular-mask cutouts of a face, used as a scene of their own
- an avatar carousel — a strip of small faces feeding the chart
- a "paper snippet" inset of the study itself over a portrait
- floating trait tags that hover free of any card
- a video-tile overlay inside a collage
- a slider meter used as illustration, and a search-bar interaction at the end
- a brand logo badge before the product screen

26 distinct devices in total. It also confirmed the archetype independently and
transcribed every citation and chip label. The full merged record, with each
scene snapped onto a measured cut, is in the sibling `.record.json`.

**Scene-change style:** 11 described scenes over 5 hard cuts — so **half of all
scene changes are carried by a transition, not a cut**. That matches the house
style we derived from the original reference and is worth keeping.

## Treatment note

This reference shares our treatment almost exactly — ground `#9FB5BF` against
our `#A1B4B9`, same italic serif caption track, same light sans headline. It is
from the same studio family as the reel the motion language was derived from.

**So it varies FORMAT and not TREATMENT.** It cannot help with the "every video
looks the same" problem on the visual axis. For that the corpus needs references
from outside this family.
