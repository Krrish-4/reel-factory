---
name: reel-render
description: Render a reel and gate it. Load before producing an mp4.
---

# Render

```
npx tsc --noEmit && npx eslint src        # must pass first
npx remotion render <Comp> out/<name>.mp4 --codec h264
npm run verify                            # then the checks
```

## Stills before render

Sweep one still per beat before committing to a full render. It has caught a
crash (`interpolate` on a non-monotonic range), callouts on the wrong anatomy,
and a black letterbox baked into every beat. A still is seconds; a render is
minutes.

## Settings that are not negotiable

`remotion.config.ts` stays on **PNG frames + CRF 18**. JPEG frames soften hair
edges and thin lines — and this repo's subject is faces and hairline callouts.

## Watch the working directory

A render was once deleted by an `rm` that ran after a failed `cd`. Prefer
absolute paths; check `pwd` before anything destructive.

## Background renders

A full reel takes minutes. Run it in the background and do other work; do not
poll. Confirm the output exists and has a plausible size before reporting.

## Overwrite deliberately

Repeated version files pile up fast. When iterating on one cut, overwrite the
same filename rather than spawning `-v3`, `-v4`, unless a version is being kept
for comparison.
