import { ASSETS } from "../assets";

/**
 * Where the rows of each face are, and the ONE layout that both places a
 * picture and every mark drawn on it (invariant S).
 *
 * READ OFF A 20px GRID ON EACH FILE, NOT MEASURED BY A MODEL. No detector in
 * this repo finds a hairline or a brow line, and the registry's face box comes
 * from a skin mask that a fringe changes by design (anne-before's face top is
 * 244, anne-fringe's 302: the fringe covers forehead skin). So the rows were
 * read on 2026-10-29 off grids drawn by hand over public/portraits/<id>.png,
 * the way RefinaTrio's FEATURE table was. Re-read them for a new file.
 *
 * Every value is in SOURCE-IMAGE pixels of the subject's control, and both
 * assets of a pair are laid out from the control: anne-fringe's eyes, nose and
 * mouth sit within a few px of anne-before's, so one layout draws one face and
 * a wipe between them changes only the hair.
 *
 * What these rows back, and nothing more: brackets between rows (WHERE), never
 * a printed figure (HOW MUCH). The thirds are hairline -> brow -> nose base ->
 * chin. `fringe` is where the fringe's lower edge sits on the fringe asset,
 * which is the TOP of the forehead you can see once it is there.
 */
export type LM = {
  /** top of the hair, for head-and-shoulders framing */
  hairTop: number;
  hairline: number;
  brow: number;
  fringe: number;
  /** pupil row and the two pupil columns */
  eyes: number;
  pupils: readonly [number, number];
  nose: number;
  mouth: number;
  chin: number;
  /** face edges at cheekbone height */
  cheeks: readonly [number, number];
  /** facial midline */
  cx: number;
};

export const LANDMARKS: Record<string, LM> = {
  // upper 190 / middle 193 / lower 200: near-equal thirds
  anne: {
    hairTop: 44, hairline: 262, brow: 452, fringe: 440, eyes: 515,
    pupils: [445, 650], nose: 645, mouth: 715, chin: 845, cheeks: [365, 795], cx: 550,
  },
  // TALL upper third: 240 / 225 / 200
  bangs2: {
    hairTop: 6, hairline: 180, brow: 420, fringe: 425, eyes: 487,
    pupils: [475, 680], nose: 645, mouth: 712, chin: 845, cheeks: [375, 800], cx: 578,
  },
  // SHORT upper third: 160 / 207 / 223
  bangs3: {
    hairTop: 49, hairline: 345, brow: 505, fringe: 500, eyes: 565,
    pupils: [480, 685], nose: 712, mouth: 800, chin: 935, cheeks: [350, 830], cx: 585,
  },
};

type Rec = { file: string; subject?: string | null; w: number; h: number };
export const rec = (id: string): Rec => {
  const a = (ASSETS as unknown as Record<string, Rec | undefined>)[id];
  if (!a) throw new Error(`bangs: asset "${id}" is not in the registry`);
  return a;
};
export const lm = (id: string): LM => {
  const sub = rec(id).subject ?? "";
  const l = LANDMARKS[sub];
  if (!l) throw new Error(`bangs: no landmarks read for subject "${sub}" (asset ${id})`);
  return l;
};

export type Box = { w: number; h: number };
export type Layout = { s: number; x: number; y: number; w: number; h: number };

/**
 * Lay `id` into `box` by two source rows: `rowA` lands at `yA` and `rowB` at
 * `yB` (box pixels), the midline on `cx`. Head-and-shoulders is
 * (hairTop -> headTop, chin -> chinY); a push-in is the same call with the
 * rows of the feature being pushed to.
 */
export const place = (
  id: string,
  rowA: number,
  yA: number,
  rowB: number,
  yB: number,
  cx: number,
): Layout => {
  const a = rec(id);
  const s = (yB - yA) / (rowB - rowA);
  return { s, x: cx - lm(id).cx * s, y: yA - rowA * s, w: a.w * s, h: a.h * s };
};

export const frame = (id: string, box: Box, headTop: number, chinY: number, cx = box.w / 2) =>
  place(id, lm(id).hairTop, headTop, lm(id).chin, chinY, cx);

/** source x -> box x, source y -> box y, under a layout */
export const X = (L: Layout, x: number) => L.x + x * L.s;
export const Y = (L: Layout, y: number) => L.y + y * L.s;

/** blend two layouts, for a push that travels */
export const mix = (a: Layout, b: Layout, t: number): Layout => ({
  s: a.s + (b.s - a.s) * t,
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  w: a.w + (b.w - a.w) * t,
  h: a.h + (b.h - a.h) * t,
});
