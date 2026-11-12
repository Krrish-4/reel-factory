import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * A row or column of cards travelling through a window.
 *
 * Used by 7 references, and the audit found 2 more hidden under `Montage` —
 * a carousel and a montage look identical at one frame per second, but a
 * montage REPLACES an image in place while a carousel MOVES a strip past you.
 *
 * Kept separate from `CardScrollStack`, which does one thing: an infinite
 * vertical scroll. This adds the axis and the stepped mode, where each card
 * holds long enough to be read before the strip advances — the difference
 * between a background texture and a list you are meant to follow.
 */
export const CardCarousel: React.FC<{
  children: React.ReactNode;
  width: number;
  height: number;
  itemSize: number;
  axis?: "x" | "y";
  mode?: "continuous" | "stepped";
  startFrame?: number;
  framesPerItem?: number;
  gap?: number;
  /** stepped only: fraction of each slot spent moving rather than holding */
  moveFraction?: number;
  feather?: number;
}> = ({
  children, width, height, itemSize,
  axis = "x",
  mode = "stepped",
  startFrame = 0,
  framesPerItem = 30,
  gap = 14,
  moveFraction = 0.34,
  feather = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = React.Children.toArray(children);
  const step = itemSize + gap;
  const t = Math.max(0, frame - startFrame);

  let offset: number;
  if (mode === "continuous") {
    offset = (t / framesPerItem) * step;
  } else {
    const idx = Math.floor(t / framesPerItem);
    const within = (t % framesPerItem) / framesPerItem;
    // spring on the move portion so a step lands rather than arrives
    const s = spring({
      frame: Math.max(0, (within - (1 - moveFraction)) * framesPerItem),
      fps,
      durationInFrames: Math.max(6, framesPerItem * moveFraction),
      config: { damping: 22, stiffness: 120, mass: 0.8 },
    });
    offset = (idx + (within > 1 - moveFraction ? s : 0)) * step;
  }

  const dir = axis === "x" ? "translateX" : "translateY";
  const mask = feather > 0
    ? `linear-gradient(to ${axis === "x" ? "right" : "bottom"}, transparent 0px, black ${feather}px, black calc(100% - ${feather}px), transparent 100%)`
    : undefined;

  return (
    <div style={{ width, height, overflow: "hidden", position: "relative",
                  maskImage: mask, WebkitMaskImage: mask }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "flex",
          flexDirection: axis === "x" ? "row" : "column",
          gap,
          transform: `${dir}(${-offset}px)`,
        }}
      >
        {[...items, ...items].map((c, i) => (
          <div key={i} style={{ flex: "0 0 auto",
                                width: axis === "x" ? itemSize : "100%",
                                height: axis === "y" ? itemSize : "100%" }}>
            {c}
          </div>
        ))}
      </div>
    </div>
  );
};
