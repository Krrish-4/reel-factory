import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

/**
 * One word or phrase replaced by another, in place, without reflow.
 *
 * Ranked #8 — small, and the cheapest way to make a headline feel alive without
 * rebuilding a type layout. Absorbs a headline swap and a hook text swap.
 *
 * `display: inline-grid` with both spans stacked in the same grid cell is the
 * whole trick: the wrapper sizes to the WIDER of the two, so neither the line
 * nor anything after it shifts as the swap happens. Crossfading two absolutely
 * positioned spans instead makes the container collapse to zero width and the
 * surrounding text jumps.
 */
export const InlineTextSwap: React.FC<{
  items: string[];
  /** frames each item holds before swapping */
  hold?: number;
  startFrame?: number;
  swapFrames?: number;
  rise?: number;
  style?: React.CSSProperties;
}> = ({ items, hold = 40, startFrame = 0, swapFrames = 8, rise = 12, style }) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - startFrame);
  const idx = Math.min(items.length - 1, Math.floor(t / hold));
  const within = t - idx * hold;

  // the incoming word rises into place as the outgoing one lifts away
  const p = interpolate(within, [0, swapFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const prev = items[Math.max(0, idx - 1)];
  const cur = items[idx];

  const cell: React.CSSProperties = {
    gridArea: "1 / 1",
    whiteSpace: "nowrap",
  };

  return (
    <span style={{ display: "inline-grid", verticalAlign: "baseline", ...style }}>
      {idx > 0 && p < 1 ? (
        <span
          style={{
            ...cell,
            opacity: 1 - p,
            transform: `translateY(${-p * rise}px)`,
          }}
        >
          {prev}
        </span>
      ) : null}
      <span
        style={{
          ...cell,
          opacity: idx === 0 ? 1 : p,
          transform: `translateY(${(1 - (idx === 0 ? 1 : p)) * rise}px)`,
        }}
      >
        {cur}
      </span>
    </span>
  );
};
