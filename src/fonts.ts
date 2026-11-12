import { loadFont as loadSerif } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Outfit";
import { loadFont as loadHeadline } from "@remotion/google-fonts/InstrumentSerif";

// Italic serif — used for the running "voiceover" caption track.
const serif = loadSerif("italic", {
  weights: ["400", "600"],
  subsets: ["latin"],
});
// Upright serif — used for editorial headlines (Refina brand look).
const serifUpright = loadSerif("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
const sans = loadSans("normal", {
  weights: ["300", "400", "600", "700", "800"],
  subsets: ["latin"],
});

// Headline face for the protocol reel — geometric, brand-forward.
const display = loadDisplay("normal", {
  weights: ["200", "300", "400", "500"],
  subsets: ["latin"],
});

/**
 * Headline face for RefinaPreviewReel only — Instrument Serif.
 *
 * A real Google font, so unlike a system stack this is bundled and renders
 * identically anywhere; the trailing generic is a formality.
 *
 * It ships ONE weight (400), in roman and italic. That is a live constraint,
 * not a footnote: nothing in this reel's headline track can be differentiated
 * by weight, so the reasons index separates its numerals from its labels by
 * size and opacity instead, and any future emphasis has to come from size,
 * case or colour.
 *
 * The italic matters too. `SectionHeadline`'s `italicSecond` line dropped to
 * Playfair italic for contrast against a geometric sans; with a serif headline
 * that would put two different serifs inside one headline, so it now uses this
 * family's own italic.
 *
 * Instrument Serif also runs small and light for its point size, so the preview
 * reel sets it larger than the Outfit sizes it replaced.
 *
 * `displayFont` (Outfit) is untouched — RefinaProtocolReel is the approved cut
 * and shares these exports.
 */
const headline = loadHeadline("normal", { weights: ["400"], subsets: ["latin"] });
const headlineItalic = loadHeadline("italic", { weights: ["400"], subsets: ["latin"] });

export const headlineStack = `${headline.fontFamily}, Georgia, serif`;
export const headlineItalicStack = `${headlineItalic.fontFamily}, Georgia, serif`;

export const serifFont = serif.fontFamily;
export const serifUprightFont = serifUpright.fontFamily;
export const sansFont = sans.fontFamily;
export const displayFont = display.fontFamily;
