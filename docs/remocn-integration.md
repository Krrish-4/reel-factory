# remocn integration — what breaks, and the check that catches it

[remocn](https://github.com/Remocn/remocn) is a shadcn-style registry of Remotion
components (MIT, ~1.3k stars). Components are **copied into this repo**, not
installed as a dependency — `src/components/remocn/` and `src/lib/remocn*/` are
ours to edit. 53 of the registry's 174 components are installed; the triage that
picked them is in `docs/remocn-catalog.md` plus the published catalog.

Install one with:

```
npx shadcn@latest add @remocn/<name>
```

Two labs demo what is installed, both registered in `src/Root.tsx`:

| Composition | Source | Covers |
|---|---|---|
| `RemocnLab` | `src/labs/RemocnLab.tsx` | first 7 components, type + transitions on bare sage |
| `RemocnCoreLab` | `src/labs/RemocnCoreLab.tsx` | the 18 core picks; scene-level ones over a real portrait |
| `MotionRefsLab` | `src/labs/MotionRefsLab.tsx` | soft-blur-in, per-character-rise, marker-highlight, snapcn karaoke-captions over a real read; reel faces via the `--font-geist-sans` override |

---

## A. Linked agent skills break the bundler — and they are junctions, not symlinks

**Incident, twice.** `npx skills add <repo>` writes each skill to
`.agents/skills/<name>` and links it into `.claude/skills/<name>`. Every
subsequent render dies in webpack's file hasher:

```
TypeError: Cannot read properties of undefined (reading 'length')
    at WasmHash._updateWithBuffer (webpack/lib/util/hash/wasm-hash.js:151:23)
    at ... FileSystemInfo.js:3993
```

It is not scoped to new code — `MotionLab`, untouched for weeks, failed
identically both times. Isolating it: move the links away and renders succeed;
restore `.agents/` as a **real directory** and renders still succeed. The link
alone is the trigger.

- `Remocn/remocn` — 1 link
- `remotion-dev/skills` — 12 links

**On Windows these are NTFS junctions, not symlinks.** That matters more than it
sounds: `find . -type l` and Python's `Path.is_symlink()` both return **nothing**
for a junction, so the obvious check reports a clean tree while the bundler is
still crashing. `cmd //c "dir /AL <path>"` shows them as `<JUNCTION>`;
`os.path.isjunction()` (Python 3.12+) detects them. Removing one needs `rmdir`,
not `unlink`.

**Invariant.** No symlinks *or junctions* anywhere under the project root. Skills
live under `.claude/skills/<name>` as real directory copies.

**Check.** After any `npx skills add`:

```
python refs/desymlink-skills.py           # convert links to real copies
python refs/desymlink-skills.py --check   # exit 1 if any link remains
```

Then render a still. If a render dies in `wasm-hash.js`, check for links before
looking at your own code — the stack trace points at webpack and names nothing
you wrote.

---

## B. `@/` resolves for tsc and not for the bundler

**Incident.** Vendored components import each other through the `@/` alias
(`@/lib/remocn/canvas-presentation`). `npx tsc --noEmit` passed clean, then the
render failed with `Module not found: Can't resolve '@/lib/remocn/...'`.

`tsconfig.json` `paths` is read by TypeScript only. The Remotion bundler runs its
own webpack and does not read it.

**Invariant.** The alias is declared **twice** — once in `tsconfig.json` `paths`
for the typechecker, once in `remotion.config.ts` via `overrideWebpackConfig` for
the bundler. Changing one without the other produces a build that typechecks and
will not render.

**Check.** A green `tsc` is not evidence a render will bundle. Render a still.

---

## C. `shadcn add --overwrite` silently reverts local edits

**Incident.** Six remocn text components paint their own opaque full-frame
ground:

```
position: "absolute", inset: 0, background: "white",
```

Unpatched, that covers the whole 1080x1920 sage `Stage` with a white card. The
one-property fix was applied by hand to `staggered-fade-up.tsx` — and a later
batch install with `--overwrite` restored the vendored original without comment.
It was only caught because the install log said "Updated 1 file".

**Invariant.** Never hand-edit a vendored component for something a script can
do. The de-chroming lives in `refs/dechrome-remocn.py`; re-run it after any
`shadcn add` that touches `src/components/remocn/`.

```
python refs/dechrome-remocn.py           # apply
python refs/dechrome-remocn.py --check   # exit 1 if any opaque ground remains
```

Grounds that are part of the artwork — the `polaroid` frame, the
`pixelate-region` mosaic fill — are in the script's `KEEP` set and left alone.

---

## D. Vendored components do not use this repo's fonts

**Not yet fixed — a live constraint.** Every remocn text component hardcodes

```
fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif"
```

as an **inline style**, so `className` cannot override it. On this machine that
resolves to a Windows system face: in `RemocnLab` v1 the beat title rendered in
Outfit and the component's own body text did not, in the same frame. It also
means the same component renders differently on another machine, which breaks
the determinism the rest of this repo depends on.

Two consequences:

1. **Nothing from remocn may carry headline or caption type in a shipping reel**
   until its font stack is edited to `displayFont` / `serifFont`. Spec rule 8 —
   only two faces, ever — is violated the moment one of these renders as-is.
2. `rolling-number` and `number-wheel` call `loadFont()` for JetBrains Mono with
   no options, pulling **96 network requests per render**. Pass
   `{ weights: ["800"], subsets: ["latin"] }` before using either in a reel.

A `refs/` script in the shape of `dechrome-remocn.py` is the right fix for both;
it does not exist yet.

**Workaround that needs no edit to the vendored files (2026-09-29).** The stack
starts with `var(--font-geist-sans)`, and an inline `var()` still resolves
against the cascade. Defining the variable on any ancestor reskins every remocn
text component underneath it:

```tsx
<div style={{ position: "absolute", inset: 0, "--font-geist-sans": displayFont } as React.CSSProperties}>
  <SoftBlurIn text="..." />
</div>
```

Verified on a still: `MarkerHighlight` rendered in Outfit, not the system
fallback. See the `Face` wrapper in `src/labs/MotionRefsLab.tsx`. It fixes the
face only. `fontStyle` still comes from the component (remocn sets none, so it
inherits), and `rolling-number` / `number-wheel` still load JetBrains Mono on
their own.

## snapcn

`src/components/snap-cn/karaoke-captions.tsx` was copied from
[snapcn](https://github.com/snapcndev/snapcn) (MIT), and its `snap-cn-ui` core
went to `src/lib/snap-cn-ui/` (tests left out). It takes a `fontFamily` prop
directly. Use `preset="clean" pill={false}`: the `karaoke` and `highlight`
presets add a dark text-shadow that muddies unspoken words on sage. It loads
Montserrat, Roboto and six snap-cn-ui faces at module scope, so every render
fetches them. The local clone lives in `C:\Users\rahul\motion-refs`.

---

## E. Component length is a floor, not a beat

Each component's catalog entry carries a frame count at 30fps. That is when its
motion **finishes**, not how long the element should hold. `RemocnLab` v1 used
one flat `HOLD = 105` and clipped every component whose natural length exceeded
it. `RemocnCoreLab` schedules per-beat durations from each component's own
length plus hold — see its `BEATS` table.

These numbers know nothing about the voiceover. In a real reel, timing still
comes from `silencedetect` and the generators, exactly as invariant B requires.
