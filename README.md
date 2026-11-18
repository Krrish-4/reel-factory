# reel-factory

A script-to-reel pipeline for Refina's Instagram reels (1080x1920, 30fps),
built on [Remotion](https://remotion.dev) and driven by Claude Code.

## What we produce: Glow Up pack reels

**Every reel this repo makes now is a Refina x Glow Up pack reel**: a
celebrity face read or feature quiz on the house sage ground, a question hook,
numbered beats drawn onto the face, a self-ID comment prompt, real Refina app
proof on a sample user, and a "Comment DOSSIER" close. The format, the ten
scripts (S1-S10) and the compliance rules are in
[`docs/glowup/production-pack.pdf`](docs/glowup/production-pack.pdf). The
procedure is the **`refina-glowup`** skill
([`.claude/skills/refina-glowup/`](.claude/skills/refina-glowup/SKILL.md)).

Hand Claude a pack script (or say "S3") and say *"make the glowup reel"*.

| reel | composition | script | what it shows |
|---|---|---|---|
| S2 - What nose shape do you actually have? (Madison Beer) | `GlowupS2` | `docs/scripts/glowup-s2.txt` | six nose types morphed on one face, card peel + cursor + pixel-resolve |
| S5 - Why Sadie Sink's face works | `GlowupS5` | `docs/scripts/glowup-s5.txt` | loupe inspection, "Instagram face" edits, crowd grid, face map |
| Would filler suit Sydney Sweeney's face? (S4 format) | `GlowupSize` | `docs/scripts/glowup-size.txt` | E-line + philtrum self-tests, mirror, thin-lip flip, poll |
| Why won't Jennifer Lawrence get the one she wants? (S1 format) | `GlowupLawrence` | `docs/scripts/glowup-lawrence.txt` | her own stated list, cheek mechanism, tell-or-keep-quiet toggle |

All four share `src/refina/glowup/house.tsx` (house headline, captions, tags,
sfx, phone screens, Comment DOSSIER ending) and `kit.tsx` (`place()`, which
lays out a still AND every mark from the same measured landmarks). **Each reel
must use its own device set**: copy the closest reel for structure, never for
its animations.

```bash
# voice (ElevenLabs, costs characters - get approval first)
python gen/glowup/tts_eleven.py --script docs/scripts/glowup-<reel>.txt --voice EXAVITQu4vr4xnSDxMaL \
    --out public-glowup/<reel>/vo-raw.mp3 --words public-glowup/<reel>/words-raw.json --speed 1.12
# stills -> cutouts + landmarks, app staging, data
python gen/glowup/portraits.py --reel <reel> --sheet
python gen/glowup/prep_<reel>.py
python gen/glowup/emit.py --reel <reel>
# check, look, render (own entry + public-glowup; segmented and resumable)
node node_modules/typescript/bin/tsc --noEmit -p tsconfig.glowup.json
node gen/glowup/stills.mjs Glowup<Reel> out/glowup/stills <frame> <frame> ...
node gen/glowup/render.mjs Glowup<Reel> out/glowup/<reel>-raw.mp4
ffmpeg -i out/glowup/<reel>-raw.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1:LRA=11,aresample=48000" -c:a aac -b:a 192k out/glowup/<reel>.mp4
```

Assets are **not in git**: celebrity stills, licensed photos and voiceovers are
per-production material (see [`public-glowup/README.md`](public-glowup/README.md)).
The committed `data.ts` files keep each delivered cut's word timings and
landmarks, so the code type-checks without them.

Compliance (pack rules, all non-negotiable): organic posts only; never imply a
celebrity uses or endorses Refina; suspected work only as a question, and
otherwise only what the celebrity has said herself, with the source on screen;
the phone shows a sample user, never the celebrity; every app shot carries the
AI-preview chip; no 1-10 score on a real face. ElevenLabs free-tier audio is
non-commercial: upgrade before anything is posted.

## The engine underneath

The Glow Up reels sit on the earlier QOVES-style explainer pipeline (the
`refina-reel` skill), which is still here and still the source of the house
look: stage sage, headline and caption faces, tags, the phone, the typing-bar
ending, the SFX library and every check.

## What's inside

| path | what |
|---|---|
| `.claude/skills/refina-glowup/` | **The production skill** (Glow Up pack reels) + `FORMAT.md` |
| `docs/glowup/production-pack.pdf` | The pack: template, S1-S10 scripts, build spec, compliance |
| `src/refina/glowup/` | The four Glow Up reels + `house.tsx` / `kit.tsx`, own entry `entry.ts` |
| `gen/glowup/` | ElevenLabs TTS, cutout + landmarks, app staging, data emit, stills + segmented render |
| `.claude/skills/refina-reel/` | The engine skill. Router + 8 stage references: script, voiceover, assets, build, sound, render, review, compositions |
| `.claude/skills/remotion-*`, `.agents/` | Remotion's own agent skills + remocn |
| `CLAUDE.md` | The contract: per-reel history, measured findings, every rule that cost a re-render |
| `docs/reel-invariants.md` | Failure modes actually shipped, each with the check that now catches it |
| `docs/beat-catalog.md` | **Which animation/transition carried which script lines**, across every reel (generated) |
| `docs/qoves-reel-spec.md`, `docs/qoves-motion-reference.md` | The measured visual spec and the reference reel's transitions, durations, easings |
| `docs/making-a-reel.md` | Targets, per-archetype pacing, component search order |
| `docs/scripts/` | Every reel's script (the source of truth for VO + timing) |
| `docs/preview-review/` | VO pipeline (`gen-voiceover.py`, Deepgram), alignment, timing core |
| `gen/` | Asset generation (`flow.mjs`), scoring, promote/sage repaint, registry, and all checks (`check.py`) |
| `refs/` | Reel analysis (`analyse.py`: frame measurement + Gemini), corpus stats, format library |
| `src/refina/` | Every reel's compositions = **the beat library** (`kit/`, `protocol/`, `preview/`, `ratio/atoms`...) |
| `src/components/remocn/` | 60+ vendored remocn components |
| `public/` | Fonts, the SFX library, and the sample reel's assets |

**Sample reel:** `RefinaChanged` ("What Else Changed", 95s). It is the only
composition registered in `src/Root.tsx`, and it renders out of the box: the
AI-generated `demo1` subject plus its voiceover ship in `public/`. The other
reels ship as **code only**, because their portraits, UI exports and VOs were
client material. They are there to reuse and learn from. To bring one back,
regenerate its assets through `gen/` and register it in `Root.tsx`.

## Setup

Requirements: Node 20+, Python 3.11+, ffmpeg on PATH, Google Chrome (for
`gen/flow.mjs`), and [Claude Code](https://claude.com/claude-code).

```bash
npm ci
pip install -r requirements.txt
cp .env.example .env          # add DEEPGRAM_API_KEY, GEMINI_API_KEY
npm run dev                   # Remotion Studio
npm run render:sample         # out/refina-changed.mp4
```

Open Claude Code **from the repo root** (`cd reel-factory && claude`). That's
what loads `CLAUDE.md` and the project skills. Optionally make the skill
available from any directory:

```bash
# macOS/Linux
ln -s "$PWD/.claude/skills/refina-reel" ~/.claude/skills/refina-reel
# Windows (cmd, as one line)
mklink /J %USERPROFILE%\.claude\skills\refina-reel .claude\skills\refina-reel
```

`gen/check-skills.py` (first preflight stage) asserts that link exists.

## Making a QOVES-style explainer (the older format)

Hand Claude a script (or a topic) and say *"make a refina reel from this"*.
The skill routes each stage. The manual equivalent:

1. **Script**: `docs/scripts/<name>.txt`, one phrase per line, `| pause`
   suffix, `# -- N. beat` headers. Shape and pacing: `reel-script/REFERENCE.md`.
2. **Beat plan**: `src/refina/<name>/shots.json`. Each beat covers N script
   lines and names a `composition`. Pick it from `docs/beat-catalog.md`.
3. **Assets**: cast from the script into `gen/subjects.toml`, then
   `gen/flow.mjs pair`, `gen/score.py`, `gen/promote.py`, `gen/sage.py`, and
   `gen/registry.py --ingest`.
4. **Voiceover**:
   `python docs/preview-review/gen-voiceover.py --script ... --audio ... --ts ... --group <shots.json>`
5. **Build**: copy `src/refina/changed/` as the starting compiler and register
   it in `src/Root.tsx`.
6. **Check, render, review**: `python gen/check.py src/refina/<name>`, render,
   `python gen/check.py src/refina/<name> out/<render>.mp4`,
   `python refs/analyse.py out/<render>.mp4 --label ours-<name>`, then **look at
   the phone sheet**.

After adding a reel, re-run `python gen/beat-catalog.py` so the catalog grows.

## Notes

- Fonts under `public/fonts/card/` are **personal-use demos** (befonts.com).
  Buy commercial licences before using them in a paid post.
- Brand content (Refina palette, compliance chip, CTA) lives in
  `src/refina/theme.ts`, `src/fonts.ts` and the house atoms. Swap these for
  your own brand. The QOVES *treatment* is the reusable part.
