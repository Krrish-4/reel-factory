import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Items fanning out from a centre anchor along an arc.
 *
 * Ranked #9 — specialised, but nothing else in the kit produces a "one thing
 * connects to many" shape. Absorbs a radial influence network and two colour
 * wheel wedge pop-outs.
 *
 * `arcSpread` is what makes it general: a full 360 is a wheel or a network, a
 * 180 is a fan above a subject, a 90 is a corner spray. Without it this would
 * only ever draw circles.
 *
 * Optional spokes are drawn UNDER the items and grow with them, because a
 * network with no visible connections is just scattered dots.
 */
export const RadialFan: React.FC<{
  items: React.ReactNode[];
  radius: number;
  startFrame?: number;
  staggerFrames?: number;
  /** degrees covered by the fan; 360 = full wheel */
  arcSpread?: number;
  /** degrees, 0 = pointing right, -90 = pointing up */
  startAngle?: number;
  spokes?: boolean;
  spokeColor?: string;
  size?: number;
}> = ({
  items,
  radius,
  startFrame = 0,
  staggerFrames = 3,
  arcSpread = 360,
  startAngle = -90,
  spokes = false,
  spokeColor = "rgba(255,255,255,0.3)",
  size = 520,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = items.length;
  // a full wheel wraps, so the last item must not land on the first
  const denom = arcSpread >= 360 ? n : Math.max(1, n - 1);

  const placed = items.map((_, i) => {
    const deg = startAngle + (arcSpread * i) / denom;
    const rad = (deg * Math.PI) / 180;
    const s = spring({
      frame: frame - startFrame - i * staggerFrames,
      fps,
      durationInFrames: 20,
      config: { damping: 16, stiffness: 120, mass: 0.8 },
    });
    return { x: Math.cos(rad) * radius * s, y: Math.sin(rad) * radius * s, s };
  });

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {spokes ? (
        <svg width={size} height={size}
             style={{ position: "absolute", left: 0, top: 0 }}>
          {placed.map((p, i) => (
            <line
              key={i}
              x1={size / 2} y1={size / 2}
              x2={size / 2 + p.x} y2={size / 2 + p.y}
              stroke={spokeColor}
              strokeWidth={1.4}
              opacity={interpolate(p.s, [0, 0.4], [0, 1], {
                extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
            />
          ))}
        </svg>
      ) : null}
      {items.map((item, i) => {
        const p = placed[i];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: size / 2 + p.x,
              top: size / 2 + p.y,
              transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * p.s})`,
              opacity: interpolate(p.s, [0, 0.35], [0, 1], {
                extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
};
