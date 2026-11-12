---
name: reel-build
description: Write or edit a composition. Load before adding a beat, changing a layout, or starting a new reel.
---

# Build

## The reel is data, not code

`src/refina/<reel>/shots.json` is the spec. The composition is a **compiler**
over it: each beat names a `composition`, which is looked up in a registry of
beat components and handed its `props`.

```json
{ "name": "hook", "lines": 3, "composition": "full-bleed-wipe",
  "motion": "moving", "shot": "medium",
  "props": { "under": "demo1-before", "over": "demo1-facelift",
             "reticle": "jaw", "compliance": true, "wipe": "once" } }
```

Changing which asset a beat shows, or what it is labelled, is an edit **here**,
not in TSX. Nine hand-written `<Sequence>` blocks used to carry that, and the
plan and the code could disagree silently.

**Beat components take everything from props.** One composition can serve two
beats — `hook` and `tilt` both compile to `FullBleedWipe` and differ only in what
the spec hands them. A beat that reads a module constant is a beat the spec
cannot reconfigure, which defeats the point. A composition named in the spec with
no component is a TypeScript error, not a blank beat.

## What the plan enforces

`python gen/shots.py <shots.json> --emit`

- **No two consecutive beats share a composition.** `ratio-v5` used one layout
  for all nine of its scenes.
- **Enough runtime declared moving.** A beat is `moving` only if its picture
  changes on its own — footage, a wipe travelling, a subject growing. A still
  photograph with overlays arriving on top is `static`, however many arrive.
- **Every beat declares a shot size** — `wide` / `medium` / `close`, bands in
  `refs/shot-bands.json`.

`--verify` then measures the render and fails a beat that was declared moving
and is not, or whose face lands outside its band, or a reel that travels less
than 1.8× in face size. Declaration alone is a promise; the verify pass makes it
a claim.

## Face size and framing

Bands are derived from 1268 real frames across the corpus plus two supplied
reference reels — never typed:

    wide 0.115–0.240   medium 0.240–0.310   close 0.310–0.453

Both reference reels hold **head-and-shoulders with air** — clearance above the
head, shoulders visible, face out of the caption band — and get their 2.1–2.6×
travel by cutting to compositions that are **not portraits**: index cards with
thumbnail faces, real-world photographs, phone insets.

`object-fit: cover` cannot go below its cover scale without revealing
background, so a genuinely wide beat must composite the portrait as a sized
element on the stage. That is a re-cut, not a parameter change.

## Occupancy

A cut is declared when >28% of pixels change. A reel with 22% of the frame
carrying anything other than flat background **cannot register a cut at all**,
and frozen is capped the same way. Fix occupancy and cut rate, frozen and
arrivals all move together — but fix it by filling the frame with content, not
by cropping into a face.

## Type floor: 26px at 1080

About 9px on a phone. Judged at 390px, an entire annotation layer was an
unreadable smudge at 12–18px, including the compliance chip. What read: 44px
numerals, 29px chips, the serif caption. `gen/check-legibility.py` warns below
the floor and **fails** for load-bearing text.

## Where to look before writing a component

1. `src/refina/kit/` — 20 components built from the corpus
2. `src/components/remocn/` — 62 vendored components
3. `src/refina/protocol/motion.tsx` and `preview/draw.tsx`

This order exists because the kit was built without checking remocn and three
components were duplicated. **remocn text components hardcode their own font
stack** and may not carry headline or caption type.

## Two Remotion gotchas

- `useCurrentFrame()` inside a `<Sequence>` is **sequence-local**.
- `interpolate` needs a strictly increasing input range. A ramp computed from
  props can invert — `[0, 12, 11.56, 19.72]` crashed a render — so build ranges
  monotonically by construction.
