import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Cards layered in depth, the front one peeling away to expose the next.
 *
 * Three references use this and ALL THREE were mis-claimed in the audit — twice
 * as `Montage`, once as `TagStack`, once as `ConvergePanels`. It is none of
 * those: a montage replaces in place, a tag stack accumulates chips that stay,
 * and ConvergePanels merges two portraits into one face. Here the cards persist
 * and only their DEPTH changes, which is what makes it read as a pile of
 * evidence rather than a slideshow.
 *
 * That is also why it belongs in a corpus like this one: stacked paper is how
 * these reels say "there are many studies" without showing many studies.
 */
export const CardStack: React.FC<{
  children: React.ReactNode;
  width: number;
  height: number;
  startFrame?: number;
  framesPerCard?: number;
  /** px each card sits behind the one in front */
  offsetX?: number;
  offsetY?: number;
  scaleStep?: number;
  rotate?: number;
  /** how the front card leaves */
  exit?: "left" | "right" | "up" | "fade";
  visible?: number;
}> = ({
  children, width, height,
  startFrame = 0,
  framesPerCard = 34,
  offsetX = 16,
  offsetY = 14,
  scaleStep = 0.05,
  rotate = 0,
  exit = "left",
  visible = 4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cards = React.Children.toArray(children);
  const t = Math.max(0, frame - startFrame);
  const active = Math.floor(t / framesPerCard);
  const within = t % framesPerCard;

  // the peel happens over the last third of each card's slot
  const peel = spring({
    frame: Math.max(0, within - framesPerCard * 0.66),
    fps,
    durationInFrames: Math.max(6, framesPerCard * 0.34),
    config: { damping: 20, stiffness: 110, mass: 0.8 },
  });

  return (
    <div style={{ position: "relative", width, height }}>
      {cards.map((c, i) => {
        const depth = i - active;               // 0 = front
        if (depth < 0 || depth > visible) return null;
        const leaving = depth === 0 ? peel : 0;
        const d = depth + leaving;              // front card recedes as it goes
        const tx = d * offsetX + (exit === "left" ? -leaving * width * 1.15
                   : exit === "right" ? leaving * width * 1.15 : 0);
        const ty = d * offsetY + (exit === "up" ? -leaving * height * 1.15 : 0);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: cards.length - depth,
              transform: `translate(${tx}px, ${ty}px) `
                + `scale(${1 - d * scaleStep}) rotate(${d * rotate}deg)`,
              opacity: exit === "fade" ? 1 - leaving : 1,
              filter: depth > 0 ? `brightness(${1 - depth * 0.06})` : undefined,
            }}
          >
            {c}
          </div>
        );
      })}
    </div>
  );
};
