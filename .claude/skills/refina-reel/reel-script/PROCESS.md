# Script process v2: celebrity / topic reels (2026-11-10)

Merges three things into one procedure:
- the **script-architecture PDF** (`refina_reel_script_architecture.md.pdf`, reverse-engineered from a high-volume archetype-coach account): hook library, fact grading, 9-beat skeleton, hook A/B variants, comment bait
- **this repo's rules** (`REFERENCE.md`, `docs/scripts/README-celeb-format.md`, rule E): sourced claims, a nuance beat, the length band, the phrase+pause file, the house ending
- **the Dossier**, which now has its own line in every script

Use this for any reel built around a named person or a trending topic. `REFERENCE.md` still holds the corpus shape and the pacing figures. Where the two disagree, this file wins for celebrity and topic reels.

## What was kept, and from where

| Kept | From | Why |
|---|---|---|
| Research before writing; never write about a real person from memory | PDF §6 | Already our rule E. The PDF gives it a procedure. |
| Fact grading: `self_stated` / `documented` / `rumour` (rumours are never used) | PDF §5 | Sharper than our "real source" rule. A surgeon speculating is a rumour. |
| Hook pattern library, plus 3–5 hook variants on one body | PDF §4, §9 | Their data says reach is partly a lottery, so test hooks. |
| Bridge and open loop | PDF beats 2 and 4 | Retention devices our corpus shape lacked. |
| Exactly three numbered points, one sourced fact each | PDF beat 5 | Matches our "two to four numbered criteria". |
| The mistake beat, which **carries the nuance** | PDF beat 6 plus our nuance rule | Their mistake beat = relevance; ours = complicating the claim. One beat does both: "the mistake is copying her". |
| Product pivot = problem → preview → **Dossier** | PDF beat 7 | Names the Dossier by its real contents. |
| Comment bait as the last spoken line | PDF beat 9 | Their comments came from the closing question. |
| A `# SOURCE:` line above every sourced claim, checked by `gen/check-citations.py` | ours | A receipt that is checked by a script, not by reading. |
| One `# WHY IT READS` line inside the points (a face mechanism from the neighbour matrix) | ours | This is what makes it QOVES-style analysis rather than gossip. |
| Length 52–66s, 145–165 words, measured with `wordcount.py` | ours | Calibrated off our own narrator (~153 wpm). The PDF's 2.7 wps is not our voice. |
| Ending: "A preview, not a promise." + "Search Refina AI." over the typing search bar | ours | House ending. Replaces the PDF's "link in bio". |
| Never generate or alter a real person's face; never name someone over a face that isn't theirs | both | |

**Dropped:** "Watch until the end" as a literal line (it's a cliché at 4s). The PDF's 160–175 word target (too long for our narrator). JSON output (the script file is the source of truth). P1 "fooled everyone" applied to a real person's face (it implies something hidden; use it only with a self-stated fact). A self-test beat in confession reels (optional now, still required in pure analysis reels).

## The procedure

### 1. Pick the angle
`confession` (she said it herself) | `myth_bust` | `rumour_vs_reality` | `analysis` (a concept, no person) | `comparison`.
**If there are fewer than 3 usable facts about the person, switch to `analysis`** on the feature instead of forcing a weak fact.

### 2. Research (real people)
1. Search `"<name>" interview <topic>` and `"<name>" said|confirmed`.
2. Search `"<name>" speculation` separately, **to know what to exclude**.
3. Prefer primary interviews (Vogue, The Cut, New Yorker, podcasts) or outlets that quote them (People, InStyle, E!). Discard clinic blogs and "surgeon speculates" pieces.
4. Record each fact as `claim | grade | original outlet, month year | the article read`. If secondary articles disagree on the outlet, say so in the header and attribute on screen to the article actually read.
5. **Rumours go in the header as EXCLUDED**, so nobody adds them back later.

### 3. Write the body once, then 3–5 hooks
Hook rules: under 20 words; contains the name or a specific noun; promises information; true or attributed; **each hook from a different pattern**; the caption hook is different from the spoken hook.

| ID | Pattern | Template |
|---|---|---|
| P2 | Confession | "{Subject} named the one thing she {wants / avoids}." |
| P8 | Rumour vs reality | "Everyone says {rumour}. {Subject} says otherwise." |
| P4 | One mistake / one thing | "{Subject} wants one {thing} she says she'll never get." |
| P3 | Myth-bust | "Forget what you've heard about {topic}. Here's {source}." |
| P1 | Contrarian | "{Subject} doesn't {obvious trait}." Only with a self-stated fact. |
| P6 | Age flip | Untested; needs data. |

### 4. The skeleton: 9 beats, about 22–28 lines

| # | beat | lines | rule |
|---|---|---|---|
| 1 | hook | 2 | Swappable per variant. The hook line is also the first frame's on-screen text. |
| 2 | bridge | 1 | Why stay: "this changes how you read a face". |
| 3 | setup | 2–3 | The common belief, with "Look at…" pointing at the visual. |
| 4 | open loop | 1 | A question the points answer. |
| 5 | three points | 6–8 | "First / Second / Third". One fact each with `# SOURCE:`. Plus **one** `WHY IT READS` line: the face mechanism. |
| 6 | the mistake | 3 | Relevance + nuance: "the mistake is copying her; her reasons are her face". |
| 7 | product pivot | 3–4 | Problem ("most people decide blind") → previews on your own photo → **the Dossier, by real section names** → "A preview, not a promise." |
| 8 | CTA | 1 | "Search Refina AI." |
| 9 | comment bait | 1 | A binary or opinion question, not yes/no. Last spoken line; the search bar stays on screen. |

Each beat in the file carries `# ON SCREEN:` and `# VISUAL:` comments. `shots.json` takes line counts per beat from this file.

### 5. Product facts: the Dossier, by its real contents
22 sections (from the recorded tour, `refina-videos/ugc-dossier-work/tour/`): executive summary, photo intake, protocol overview, proportions, symmetry, face shape, eyebrows, eyes, nose, lips, cheeks, jaw, hair, neck, skin overview, blemishes, pores, wrinkles, hairstyle, hair colour, lookalike, recommendations.
**Name the sections that match the reel's topic** (buccal fat → cheeks; Botox → wrinkles; facelift → jaw and neck). Never claim accuracy, outcomes, a price or user counts. On-screen disclaimer on the pivot: `SIMULATED PREVIEWS, NOT GUARANTEED RESULTS` (or the house `AI PREVIEW · NOT MEDICAL ADVICE` chip). The caption recommends consulting a qualified professional.

### 6. Faces
Real person: licensed photographs only, commentary only. **No preview or "after" on a real person.** The pivot's preview runs on a generated or consenting face, announced if it's a second subject.

### 7. Gates (all must pass, otherwise rewrite)
- [ ] `python docs/scripts/wordcount.py <file>` is in band
- [ ] `python gen/check-citations.py <file>` passes
- [ ] every claim about the person is `self_stated` and attributed; rumours appear only as "the internet says"
- [ ] at most one direct quote per source, under 15 words
- [ ] no claim that she "needs" anything; no insulting framing; no outcome guarantee
- [ ] the Dossier is named by real sections only
- [ ] beats 6 and 9 are present
- [ ] hooks use different patterns, and caption hooks differ from spoken ones

### 8. Output
`docs/scripts/<subject>-<angle>.txt`: a header (angle, fact table, excluded rumours, hook variants, caption, hashtags, gate results), then the phrase+pause body. The default hook is in the body; the others are commented out above it.
