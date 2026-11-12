import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * A grid whose cells arrive one after another rather than all at once.
 *
 * Ranked #2 in refs/BUILD-PLAN.md — "highest reusability across all ad
 * formats". It absorbs five corpus animations that looked unrelated: a
 * four-quadrant comparison stagger, a 14-tile classification grid, a cheat
 * sheet pop-in, an observer avatar strip, and numbered step cards.
 *
 * Why this matters more than it looks: our own reels measure 9.4% of runtime
 * under sustained motion against a corpus median far above it, and 80% frozen.
 * A grid that assembles is one of the cheapest ways to put motion into a beat
 * that would otherwise be a static card — the content is identical, only its
 * arrival changes.
 *
 * `order` exists because reading order is not always the right arrival order.
 * A comparison grid usually wants row-by-row; a summary of many options often
 * reads better radiating from the centre.
 */
export type StaggerVariant = "pop" | "fade-up" | "scale";

export const StaggerGrid: React.FC<{
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  startFrame?: number;
  staggerFrames?: number;
  variant?: StaggerVariant;
  /** cell arrival order */
  order?: "row" | "column" | "centre-out";
  width?: number | string;
}> = ({
  children,
  columns = 2,
  gap = 18,
  startFrame = 0,
  staggerFrames = 4,
  variant = "pop",
  order = "row",
  width = "100%",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cells = React.Children.toArray(children);
  const rows = Math.ceil(cells.length / columns);

  const delayFor = (i: number) => {
    if (order === "column") {
      const r = Math.floor(i / columns);
      const c = i % columns;
      return (c * rows + r) * staggerFrames;
    }
    if (order === "centre-out") {
      // distance from the grid's middle cell, so the pattern grows outward
      const r = Math.floor(i / columns);
      const c = i % columns;
      const cr = (rows - 1) / 2;
      const cc = (columns - 1) / 2;
      const d = Math.abs(r - cr) + Math.abs(c - cc);
      return Math.round(d * staggerFrames);
    }
    return i * staggerFrames;
  };

  return (
    <div
      style={{
        width,
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
      }}
    >
      {cells.map((child, i) => {
        const local = frame - startFrame - delayFor(i);
        const s = spring({
          frame: local,
          fps,
          durationInFrames: variant === "pop" ? 18 : 14,
          config:
            variant === "pop"
              ? { damping: 13, stiffness: 130, mass: 0.7 } // overshoots
              : { damping: 26, stiffness: 110, mass: 0.9 }, // settles flat
        });
        const o = interpolate(local, [0, 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const transform =
          variant === "fade-up"
            ? `translateY(${(1 - s) * 26}px)`
            : `scale(${0.86 + 0.14 * s})`;
        return (
          <div key={i} style={{ opacity: o, transform }}>
            {child}
          </div>
        );
      })}
    </div>
  );
};
