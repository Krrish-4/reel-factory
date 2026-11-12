/**
 * Component kit, built from the measured reference corpus in refs/.
 *
 * Each of these absorbs several animations that looked unrelated across
 * different reference videos but share one mechanic. The ranking and the
 * reasoning are in refs/BUILD-PLAN.md; the animations each one covers are
 * listed in that file under its name.
 *
 * Everything here takes its colours as props. The reels in this repo all share
 * one palette, and baking that into a new library would make the look-alike
 * problem permanent — treatment is meant to be a variable, not a constant.
 */
export { MetricSlider } from "./MetricSlider";
export { StaggerGrid } from "./StaggerGrid";
export type { StaggerVariant } from "./StaggerGrid";
export { AnimatedBarChart } from "./AnimatedBarChart";
export type { Bar } from "./AnimatedBarChart";
export { TargetReticle } from "./TargetReticle";
export { CardScrollStack } from "./CardScrollStack";
export { DimensionCallout } from "./DimensionCallout";
export { InlineTextSwap } from "./InlineTextSwap";
export { RadialFan } from "./RadialFan";
export { DualCardLayout } from "./DualCardLayout";
export type { DualState } from "./DualCardLayout";

/* From the full 21-reel corpus and the hand audit in refs/AUDIT.md. Five of
   these were invisible in the automated build plan because a wrong primitive
   match had already absorbed them. */
export { ScanOverlay } from "./ScanOverlay";
export { CardCarousel } from "./CardCarousel";
export { CardStack } from "./CardStack";
export { FaceMesh } from "./FaceMesh";
export { CitationCard } from "./CitationCard";
export { TypewriterInput } from "./TypewriterInput";
export { SyncProgressTimeline } from "./SyncProgressTimeline";
export { NetworkGraph } from "./NetworkGraph";
export type { GraphNode } from "./NetworkGraph";
export { Collage } from "./Collage";
export { OverlayToggle } from "./OverlayToggle";
