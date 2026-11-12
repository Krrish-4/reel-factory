import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Two cards that rearrange between named layout states.
 *
 * Ranked #6 — "standardizes side-by-side comparison orchestration without
 * writing custom CSS transforms per video". Absorbs six corpus animations:
 * a photo reposition with a second popping in, an overlap focus transition, a
 * panel swap, a panel shift, a comparison stack, and an A/B toggle.
 *
 * The point is the STATE LIST, not the transforms. Every one of those six was
 * hand-written in its own video, which is why they all look slightly different
 * and why none of them is reusable. Here a beat says `state="overlap-left"` and
 * the interpolation between whatever it was before and that is automatic.
 *
 * Note this is not ConvergePanels: that merges two portraits into ONE face
 * along a seam. This keeps them as two objects and changes their relationship.
 */
export type DualState = "split" | "overlap-left" | "overlap-right" | "swapped" | "stacked";

const LAYOUTS: Record<DualState, { a: [number, number, number, number]; b: [number, number, number, number] }> = {
  //                      x,    y,  scale, z
  split:          { a: [-0.52, 0, 1.0, 1], b: [0.52, 0, 1.0, 1] },
  "overlap-left": { a: [-0.30, 0, 1.12, 2], b: [0.34, 0.04, 0.88, 1] },
  "overlap-right":{ a: [-0.34, 0.04, 0.88, 1], b: [0.30, 0, 1.12, 2] },
  swapped:        { a: [0.52, 0, 1.0, 1], b: [-0.52, 0, 1.0, 1] },
  stacked:        { a: [-0.06, -0.05, 1.0, 1], b: [0.06, 0.05, 1.0, 2] },
};

export const DualCardLayout: React.FC<{
  a: React.ReactNode;
  b: React.ReactNode;
  from?: DualState;
  to: DualState;
  startFrame?: number;
  durationInFrames?: number;
  cardWidth: number;
  cardHeight: number;
  width?: number;
}> = ({
  a,
  b,
  from = "split",
  to,
  startFrame = 0,
  durationInFrames = 24,
  cardWidth,
  cardHeight,
  width = 980,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - startFrame,
    fps,
    durationInFrames,
    config: { damping: 24, stiffness: 100, mass: 0.9 },
  });
  const L0 = LAYOUTS[from];
  const L1 = LAYOUTS[to];
  const lerp = (x: number, y: number) => x + (y - x) * p;

  const place = (k: "a" | "b", node: React.ReactNode) => {
    const [x0, y0, s0, z0] = L0[k];
    const [x1, y1, s1, z1] = L1[k];
    const x = lerp(x0, x1) * width;
    const y = lerp(y0, y1) * cardHeight;
    const s = lerp(s0, s1);
    // z cannot interpolate meaningfully, so it flips at the midpoint
    const z = p < 0.5 ? z0 : z1;
    return (
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: cardWidth,
          height: cardHeight,
          transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${s})`,
          zIndex: z,
        }}
      >
        {node}
      </div>
    );
  };

  return (
    <div style={{ position: "relative", width, height: cardHeight * 1.35 }}>
      {place("a", a)}
      {place("b", b)}
    </div>
  );
};
