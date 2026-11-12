# reel-factory

A script-to-reel pipeline for **QOVES-style educational Instagram reels**
(1080x1920, 30fps) built on [Remotion](https://remotion.dev) and driven by
Claude Code through the `refina-reel` skill.

Fork it, write a script, and the pipeline handles the rest: synthesised and
measured voiceover, generated + screened portraits, a declarative beat plan,
the compiled composition, preflight/postflight checks, and a phone-size
contact sheet for the final human look.

## What's inside

| path | what |
|---|---|
| `.claude/skills/refina-reel/` | **The skill.** Router + 8 stage references: script, voiceover, assets, build, sound, render, review, compositions |
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

## Making a reel

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
