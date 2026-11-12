import React from "react";
import { AbsoluteFill } from "remotion";
import { ContourDraw } from "../preview/draw";

/**
 * "Not a diagram." — so here is the diagram, for one second, before it is
 * ruled out.
 *
 * A clinical face schematic: outline, midline, the horizontal thirds, an angle
 * mark at the gonion, calliper ticks. Deliberately anonymous and deliberately
 * cold — it is the thing the script is rejecting.
 *
 * Drawn in FRAME coordinates over flat sage, with no photograph underneath, and
 * that is on purpose. Overlaying a schematic on the hero's portrait would mean
 * positioning geometry against a real asset by eye, which is exactly the class
 * of bug invariant A exists for (the swap deck's ring once drew on her chest
 * after the hero was swapped). Nothing here is anchored to a photo, so nothing
 * here can drift when one changes.
 *
 * It carries NO numbers. A schematic with measurements on it would be inventing
 * facial statistics, and this repo does not put invented figures on screen.
 */

const CX = 540;

/* An anonymous head, drawn as one path so it draws on in a single stroke. */
const OUTLINE =
  `M ${CX} 610 C ${CX + 148} 610, ${CX + 196} 742, ${CX + 190} 900 ` +
  `C ${CX + 184} 1054, ${CX + 96} 1214, ${CX} 1214 ` +
  `C ${CX - 96} 1214, ${CX - 184} 1054, ${CX - 190} 900 ` +
  `C ${CX - 196} 742, ${CX - 148} 610, ${CX} 610 Z`;

/* Construction lines: midline, the three horizontal thirds, a jaw angle. */
const MIDLINE = `M ${CX} 566 L ${CX} 1258`;
const THIRDS =
  `M ${CX - 250} 742 L ${CX + 250} 742 ` +
  `M ${CX - 250} 900 L ${CX + 250} 900 ` +
  `M ${CX - 250} 1058 L ${CX + 250} 1058`;
const ANGLE =
  `M ${CX - 176} 1004 L ${CX - 96} 1160 L ${CX + 96} 1160 L ${CX + 176} 1004`;

/* Calliper ticks down the left margin. */
const TICKS = Array.from({ length: 9 }, (_, i) => {
  const y = 640 + i * 76;
  const long = i % 2 === 0;
  return `M 214 ${y} L ${214 + (long ? 30 : 17)} ${y}`;
}).join(" ");
const RULE = "M 214 640 L 214 1248";

export const Diagram: React.FC<{ from?: number }> = ({ from = 0 }) => (
  <AbsoluteFill>
    <ContourDraw d={RULE} from={from} dur={12} stroke="rgba(255,255,255,0.5)" strokeWidth={1.6} glow={false} />
    <ContourDraw d={TICKS} from={from + 2} dur={12} stroke="rgba(255,255,255,0.5)" strokeWidth={1.6} glow={false} />
    <ContourDraw d={THIRDS} from={from + 2} dur={14} stroke="rgba(255,255,255,0.42)" strokeWidth={1.6} glow={false} />
    <ContourDraw d={MIDLINE} from={from + 2} dur={14} stroke="rgba(255,255,255,0.42)" strokeWidth={1.6} glow={false} />
    <ContourDraw d={OUTLINE} from={from} dur={16} strokeWidth={2.6} />
    <ContourDraw d={ANGLE} from={from + 6} dur={14} stroke="rgba(255,255,255,0.85)" strokeWidth={2} glow={false} />
  </AbsoluteFill>
);
