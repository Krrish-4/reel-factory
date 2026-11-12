import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Items appearing ON a subject, one at a time, and persisting.
 *
 * One reference, claimed as `SliderReveal` — but nothing sweeps. Piercings land
 * on a face one by one and stay, so the viewer watches an ACCUMULATION rather
 * than a comparison. SliderReveal answers "before or after"; this answers "how
 * much is too much", and that question needs every step visible at once.
 *
 * The subject is passed as children so the overlays share its coordinate space:
 * positions are fractions of the box, so the whole thing can be scaled or moved
 * as one object without the overlays drifting off the face.
 */
export const OverlayToggle: React.FC<{
  children: React.ReactNode;
  /** positions as fractions of the box, 0..1 */
  items: { x: number; y: number; node: React.ReactNode }[];
  width: number;
  height: number;
  startFrame?: number;
  framesPerItem?: number;
  /** frame at which items start peeling back off, last on first off */
  reverseAfter?: number;
}> = ({
  children,
  items,
  width,
  height,
  startFrame = 0,
  framesPerItem = 14,
  reverseAfter,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = Math.max(0, frame - startFrame);

  return (
    <div style={{ position: "relative", width, height }}>
      {children}
      {items.map((it, i) => {
        let local = t - i * framesPerItem;
        if (reverseAfter !== undefined && t > reverseAfter) {
          // reverse order on the way out: the last to arrive leaves first, so
          // the pile unwinds rather than emptying from the bottom
          const back = t - reverseAfter - (items.length - 1 - i) * framesPerItem;
          if (back > 0) local = Math.max(0, framesPerItem - back);
        }
        const s = spring({
          frame: local,
          fps,
          durationInFrames: 12,
          config: { damping: 13, stiffness: 150, mass: 0.6 },
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${it.x * 100}%`,
              top: `${it.y * 100}%`,
              transform: `translate(-50%, -50%) scale(${0.4 + 0.6 * s})`,
              opacity: interpolate(s, [0, 0.4], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {it.node}
          </div>
        );
      })}
    </div>
  );
};
