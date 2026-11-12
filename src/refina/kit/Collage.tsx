import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Tilted photos landing in a pile, all of them staying on screen.
 *
 * One reference, claimed as `Montage` — and the distinction is the whole point.
 * A montage shows one image at a time and says "here is another"; a collage
 * accumulates and says "there are many of these". The reels use it for social
 * proof, where the COUNT is the argument, so every card has to remain visible.
 *
 * Rotations and offsets are seeded from the index, never `Math.random`. A
 * random layout would place every card differently on each render of the same
 * frame — the class of bug that only appears as a flicker when two renders are
 * compared, long after anyone would think to look for it.
 */
export const Collage: React.FC<{
  children: React.ReactNode;
  width: number;
  height: number;
  itemWidth: number;
  itemHeight: number;
  startFrame?: number;
  staggerFrames?: number;
  /** max tilt in degrees */
  spread?: number;
  /** how far items scatter from centre, as a fraction of the frame */
  scatter?: number;
}> = ({
  children,
  width,
  height,
  itemWidth,
  itemHeight,
  startFrame = 0,
  staggerFrames = 5,
  spread = 12,
  scatter = 0.62,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = React.Children.toArray(children);

  const seeded = (i: number, salt: number) => {
    const h = Math.sin(i * 91.7 + salt * 47.3) * 10000;
    return h - Math.floor(h) - 0.5;
  };

  return (
    <div style={{ position: "relative", width, height }}>
      {items.map((c, i) => {
        const s = spring({
          frame: frame - startFrame - i * staggerFrames,
          fps,
          durationInFrames: 20,
          config: { damping: 17, stiffness: 120, mass: 0.8 },
        });
        const x = seeded(i, 1) * width * scatter;
        const y = seeded(i, 2) * height * scatter * 0.6;
        const rot = seeded(i, 3) * spread * 2;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: itemWidth,
              height: itemHeight,
              zIndex: i,
              transform:
                `translate(-50%, -50%) translate(${x}px, ${y}px) ` +
                `rotate(${rot}deg) scale(${0.7 + 0.3 * s})`,
              opacity: interpolate(s, [0, 0.3], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              boxShadow: "0 10px 26px rgba(20,30,34,0.28)",
            }}
          >
            {c}
          </div>
        );
      })}
    </div>
  );
};
