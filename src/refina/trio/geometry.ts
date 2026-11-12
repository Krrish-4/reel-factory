import { ASSETS } from "../assets";

/**
 * Where to put a picture, and where a feature lands once it is there —
 * ONE calculation for both (invariant S).
 *
 * `ratio/atoms`' `Face` only lays a portrait out across the full 1080x1920
 * frame. This reel lays the same face into panels of many sizes — a third of a
 * triptych, half a split, a crop of one brow — so the layout takes a BOX, and
 * every mark drawn on a panel is computed by `toBox()` from the very `Layout`
 * the `<Img>` was positioned with. A mark cannot disagree with its picture
 * because there is no second model of where the picture is.
 *
 * Feature rectangles are in FACE UNITS off the registry's measured face box
 * (x from the face centre in face widths, y from the face top in face heights),
 * the same convention as `REGIONS` in assets.ts — never typed frame pixels
 * (invariant A). `REGIONS` only knows eyes / nose / lips / jaw; this reel's
 * script also walks brows, skin and hair, so those are declared here.
 */

type Rec = {
  file: string;
  subject?: string | null;
  w: number;
  h: number;
  face: { cx: number; top: number; width: number; height: number };
};
export const rec = (id: string): Rec => {
  const a = (ASSETS as unknown as Record<string, Rec | undefined>)[id];
  if (!a) throw new Error(`trio: asset "${id}" is not in the registry`);
  return a;
};

/**
 * The three versions are i2i renders off ONE before file, so they share its
 * camera framing pixel for pixel. Laying each out from its OWN measured face box
 * would give three slightly different crops - the refinement's loose hair moves
 * its skin-mask box - which is exactly the unfair comparison the brief forbids
 * ("use matching crops"). So every asset of a subject is laid out from its
 * control's geometry.
 */
const CONTROL: Record<string, string> = { trio1: "trio1-before" };
const geom = (id: string): Rec => {
  const sub = (rec(id) as Rec & { subject?: string }).subject;
  return sub && CONTROL[sub] ? rec(CONTROL[sub]) : rec(id);
};

export type Fr = readonly [number, number, number, number];

/**
 * Feature rectangles, face units of the CONTROL (trio1-before).
 *
 * READ OFF A PIXEL GRID ON trio1-before, NOT MEASURED BY A MODEL - and the
 * difference matters. The registry's face box comes from a skin mask that runs
 * down the neck (height 941px; the chin is at y~1095, 0.86 of it), so anatomical
 * fractions guessed from it put the jaw line on the turtleneck. OpenCV's YuNet
 * was tried and its five landmarks landed visibly off the pupils and the mouth.
 * So these were read from a 50px grid (gen/out/trio1/grid.png) and converted:
 * fx = (x - 573) / 728, fy = (y - 285) / 941. Re-read them for a new subject.
 */
export const FEATURE: Record<string, Fr> = {
  FACE: [-0.44, 0.04, 0.44, 0.9],
  HEAD: [-0.56, -0.2, 0.56, 0.98],
  BROWS: [-0.39, 0.16, 0.39, 0.28],
  EYES: [-0.34, 0.25, 0.34, 0.37],
  NOSE: [-0.15, 0.3, 0.15, 0.56],
  LIPS: [-0.21, 0.59, 0.21, 0.73],
  SKIN: [-0.42, 0.37, -0.12, 0.6],
  HAIR: [-0.53, -0.19, 0.55, 0.21],
  JAW: [-0.45, 0.5, 0.45, 0.9],
};

/** The lower-face outline of the control, read off the same grid (see above). */
export const JAW_LINE: [number, number][] = [
  [-0.396, 0.579],
  [-0.361, 0.691],
  [-0.293, 0.77],
  [-0.183, 0.834],
  [0.003, 0.861],
  [0.188, 0.834],
  [0.298, 0.77],
  [0.367, 0.691],
  [0.408, 0.579],
];

/** Horizontal guides: hairline, brow, nose base, chin. Same grid. */
export const THIRDS = [0.05, 0.22, 0.54, 0.86];

export type Box = { w: number; h: number };
export type Layout = { s: number; x: number; y: number; w: number; h: number };

/**
 * Lay asset `id` into `box` so that face-rect `fr` is centred at (`cx`,`cy`)
 * (fractions of the box) and spans `fill` of the box's limiting side, times
 * `zoom`. Never below cover scale and never off an edge, so the backdrop of
 * the render can not show as a gap.
 */
export const fit = (
  id: string,
  fr: Fr,
  box: Box,
  fill = 0.8,
  zoom = 1,
  cx = 0.5,
  cy = 0.5,
): Layout => {
  const a = geom(id);
  const x0 = a.face.cx + fr[0] * a.face.width;
  const x1 = a.face.cx + fr[2] * a.face.width;
  const y0 = a.face.top + fr[1] * a.face.height;
  const y1 = a.face.top + fr[3] * a.face.height;
  const cover = Math.max(box.w / a.w, box.h / a.h);
  const s =
    Math.max(cover, Math.min((box.w * fill) / (x1 - x0), (box.h * fill) / (y1 - y0))) *
    zoom;
  const w = a.w * s;
  const h = a.h * s;
  const x = Math.min(0, Math.max(box.w - w, box.w * cx - ((x0 + x1) / 2) * s));
  const y = Math.min(0, Math.max(box.h - h, box.h * cy - ((y0 + y1) / 2) * s));
  return { s, x, y, w, h };
};

/** A face-rect in box pixels, under a layout produced by `fit()`. */
export const toBox = (id: string, fr: Fr, L: Layout) => {
  const a = geom(id);
  const x0 = L.x + (a.face.cx + fr[0] * a.face.width) * L.s;
  const x1 = L.x + (a.face.cx + fr[2] * a.face.width) * L.s;
  const y0 = L.y + (a.face.top + fr[1] * a.face.height) * L.s;
  const y1 = L.y + (a.face.top + fr[3] * a.face.height) * L.s;
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
};

/** A single point in face units, in box pixels. */
export const pt = (id: string, fx: number, fy: number, L: Layout): [number, number] => {
  const a = geom(id);
  return [
    L.x + (a.face.cx + fx * a.face.width) * L.s,
    L.y + (a.face.top + fy * a.face.height) * L.s,
  ];
};

/** Top of the hair and the chin, control face units (same grid read as FEATURE). */
export const HAIR_TOP = -0.2;
export const CHIN = 0.86;

/**
 * Lay a portrait out by HEAD, the way RefinaSize frames every beat: hair top at
 * `headTop`, chin at `chinY`, face centre on `cx`, all in box pixels. Unlike
 * `fit()` this never clamps to cover - the portrait's backdrop is repainted to
 * the stage colour, so a picture smaller than its box blends into the stage
 * exactly as size-v5's does (head-and-shoulders with air above).
 */
export const frame = (
  id: string,
  box: Box,
  headTop: number,
  chinY: number,
  cx = box.w / 2,
): Layout => {
  const a = geom(id);
  const t = a.face.top + HAIR_TOP * a.face.height;
  const c = a.face.top + CHIN * a.face.height;
  const s = (chinY - headTop) / (c - t);
  return { s, x: cx - a.face.cx * s, y: headTop - t * s, w: a.w * s, h: a.h * s };
};
