/**
 * Photo slots for RefinaLawrence. EVERY SLOT IS EMPTY ON PURPOSE.
 *
 * No photograph of Jennifer Lawrence is in this repo, and none may be
 * generated (2026-11-10: Rahul chose placeholders; licensed photos to follow).
 * An empty slot renders as a labelled slate. To fill one: put a file you hold
 * commercial rights to in public/lawrence/ and set its path here, e.g.
 *   portrait: "lawrence/portrait.jpg"
 * Nothing else changes - the beats read these slots only.
 *
 * Framing a supplied photo: `cover`, centred, with `focusY` (0 top .. 1 bottom)
 * to keep her face in the upper half where the beats expect it.
 */
export type PhotoSlot = { src: string | null; focusY?: number; note: string };

export const PHOTOS: Record<string, PhotoSlot> = {
  // 2026-11-10: supplied by Rahul, who states full rights + her permission incl. AI editing.
  // Already 9:16 with a blue-grey backdrop (AI-edited background/clothes), so cover fit = no crop.
  portrait: { src: "lawrence/portrait.png", focusY: 0.12, note: "HERO PORTRAIT · FRONT, HEAD & SHOULDERS" },
  // 2026-11-11: the six supplied photos are all ≤678px, too soft to fill the frame, so the
  // full-screen "her version" slot reuses the hero until a high-res second headshot arrives.
  portrait2: { src: "lawrence/portrait2.png", focusY: 0.12, note: "SECOND PORTRAIT · RECENT, FRONT" },
  // Grid tiles: Rahul's photos (rights stated 2026-11-11), cropped to 3:4 in public/lawrence/.
  // Masthead / cover lines / backdrop logos cropped OUT. The DYCT side-by-side meme was NOT used:
  // it is an old-vs-new comparison, i.e. the rumour itself, plus a third party's headline.
  grid1: { src: "lawrence/grid1.jpg", note: "RECENT PHOTO 1" }, // The Cut cover, photo only
  grid2: { src: "lawrence/grid2.jpg", note: "RECENT PHOTO 2" }, // 92NY event
  grid3: { src: "lawrence/grid3.jpg", note: "RECENT PHOTO 3" }, // leather-jacket shoot
  grid4: { src: "lawrence/grid4.jpg", note: "RECENT PHOTO 4" }, // event, white wall
  grid5: { src: "lawrence/grid5.jpg", note: "RECENT PHOTO 5" }, // dark studio
  grid6: { src: "lawrence/grid6.jpg", note: "RECENT PHOTO 6" }, // red carpet
};
