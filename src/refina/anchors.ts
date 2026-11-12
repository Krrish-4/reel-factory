import { ASSETS, REGIONS } from "./assets";
import type { Asset, AssetId, RegionName } from "./assets";

/**
 * `ASSETS` is `as const`, so each entry carries its own literal type and the
 * optional fields (`pairsWith`, `role`, `set`) exist only on the entries that
 * have them. Reading through the common shape keeps the literal KEYS — which is
 * what makes an unknown asset id a compile error — while letting the optional
 * fields be read uniformly.
 */
const rec = (id: AssetId): Asset => ASSETS[id] as unknown as Asset;

/**
 * Where a feature actually is, in frame coordinates.
 *
 * THIS IS THE FIX FOR THE CALLOUT BUG, and it is worth naming because it has
 * now happened four times. `DimensionCallout` and `TargetReticle` take frame
 * pixels, so every callout in this repo was positioned by rendering a still,
 * looking at it, and typing numbers. The results:
 *
 *   - mirror2: TEMPLE landed on her under-eye, CHEEK on her jaw
 *   - changed: the hook's JAWLINE reticle landed on her nose
 *   - changed: the tilt beat's JAWLINE callout landed on her eye
 *
 * Each was found by looking at a render, fixed by typing different numbers, and
 * then broke again the moment the crop, the zoom or the asset changed — because
 * a frame coordinate is not a fact about a face, it is a fact about one
 * particular composite of one particular image.
 *
 * `anchor()` computes the box instead. The asset record carries face geometry
 * measured off the skin mask at ingest; `REGIONS` says where a feature sits in
 * face units; this replicates the CSS `object-fit: cover` maths that `Face`
 * performs, and returns the rectangle in frame pixels. Change the zoom, the
 * focus or the asset and the callout follows.
 */

export type Box = { width: number; height: number };
export type Rect = { x: number; y: number; width: number; height: number };

/**
 * Replicates `object-fit: cover` plus `object-position` plus a CSS `scale()`.
 *
 * Must stay in step with `Face` in the composition — if that component's
 * layout changes, this changes with it. The pair is the reason anchors are
 * accurate at all, so they are documented as one thing.
 */
const cover = (
  img: { w: number; h: number },
  box: Box,
  zoom: number,
  focus: [number, number],
) => {
  const s = Math.max(box.width / img.w, box.height / img.h) * zoom;
  const dw = img.w * s;
  const dh = img.h * s;
  return {
    s,
    offX: (box.width - dw) * focus[0],
    offY: (box.height - dh) * focus[1],
  };
};

/**
 * The frame-space rectangle of one anatomical region on one asset.
 *
 * `focus` is the `object-position` as fractions, matching what `Face` is given:
 * `objectPosition="50% 32%"` is `[0.5, 0.32]`.
 */
export const anchor = (
  id: AssetId,
  region: RegionName,
  box: Box = { width: 1080, height: 1920 },
  zoom = 1,
  focus: [number, number] = [0.5, 0.32],
): Rect => {
  const a = rec(id);
  const [rx0, ry0, rx1, ry1] = REGIONS[region];
  const { s, offX, offY } = cover(a, box, zoom, focus);

  const x0 = offX + (a.face.cx + rx0 * a.face.width) * s;
  const x1 = offX + (a.face.cx + rx1 * a.face.width) * s;
  const y0 = offY + (a.face.top + ry0 * a.face.height) * s;
  const y1 = offY + (a.face.top + ry1 * a.face.height) * s;
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
};

/** A vertical measure line through a region, for `DimensionCallout`. */
export const measureLine = (
  id: AssetId,
  region: RegionName,
  box?: Box,
  zoom?: number,
  focus?: [number, number],
): { from: [number, number]; to: [number, number] } => {
  const r = anchor(id, region, box, zoom, focus);
  const x = r.x + r.width * 0.28;
  return { from: [x, r.y + r.height], to: [x, r.y] };
};

/**
 * The label an asset is allowed to carry.
 *
 * Reading it from the record is what makes invariant E structural: a card
 * cannot claim a procedure the asset does not record, because the string is not
 * typeable at the call site. An asset whose provenance is unknown returns "",
 * so an unverified image renders with no claim rather than a guessed one.
 */
export const labelOf = (id: AssetId) => rec(id).label;

/** Assets are only a comparable pair if they agree on subject and framing. */
export const isPair = (a: AssetId, b: AssetId) =>
  rec(a).subject !== null &&
  rec(a).subject === rec(b).subject &&
  (rec(a).pairsWith === b || rec(b).pairsWith === a);

/**
 * The frame row at an arbitrary fraction of the FACE box, top to bottom.
 *
 * `anchor()` only knows the three anatomical boxes the screen grades, and the
 * classical thirds do not line up with any of them — the upper third runs from
 * the hairline, which is not a region. This exposes the same cover maths at an
 * arbitrary y, so a thirds diagram is still derived from the asset's measured
 * face box rather than typed as four pixel rows that would be wrong for the
 * next portrait (invariant A).
 *
 * ADDITIVE ONLY. `RefinaChanged` reads this module; nothing above changed.
 */
export const faceRow = (
  id: AssetId,
  frac: number,
  box: Box = { width: 1080, height: 1920 },
  zoom = 1,
  focus: [number, number] = [0.5, 0.32],
): number => {
  const a = rec(id);
  const { s, offY } = cover(a, box, zoom, focus);
  return offY + (a.face.top + frac * a.face.height) * s;
};

/**
 * The frame column at an arbitrary offset from the FACE CENTRE, in source px.
 *
 * The sibling of `faceRow`, for the one mark `anchor()` cannot express: the
 * solved mirror midline. `gen/asym.py` reports that axis as an offset from
 * `face.cx` in the master's own pixels, and `RefinaFlip` draws its chimera seam
 * there — so the seam has to travel through exactly the cover maths that placed
 * the picture. Computing it any other way is invariant S: a mark derived from a
 * model of the layout the renderer does not share, which put every ring on
 * "Same Nose" out by up to 240px.
 *
 * ADDITIVE ONLY. `RefinaChanged` and `RefinaRatio` read this module; nothing
 * above changed.
 */
export const faceCol = (
  id: AssetId,
  offsetPx = 0,
  box: Box = { width: 1080, height: 1920 },
  zoom = 1,
  focus: [number, number] = [0.5, 0.32],
): number => {
  const a = rec(id);
  const { s, offX } = cover(a, box, zoom, focus);
  return offX + (a.face.cx + offsetPx) * s;
};
