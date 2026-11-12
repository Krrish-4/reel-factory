import { serifFont, serifUprightFont, sansFont } from "../fonts";

/**
 * Refina AI brand palette, sampled from the app's own App Store screens:
 * warm cream paper, charcoal editorial serif, dusty-mauve accent.
 */
export const refina = {
  paper: "#F3EEE7",
  paperDeep: "#EAE2D7",
  card: "#FCFAF7",
  ink: "#241F1B",
  inkSoft: "#6E665B",
  mauve: "#C6898A",
  mauveDeep: "#B0706F",
  hairline: "#E1D8CB",
  serif: serifFont,
  serifUpright: serifUprightFont,
  sans: sansFont,
} as const;
