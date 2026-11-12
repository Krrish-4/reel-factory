import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Nodes joined by connectors that draw themselves.
 *
 * One reference, and it was claimed as `TrimPath` — which does draw a path, but
 * a graph is not one path: it is N nodes whose POSITIONS determine the edges.
 * TrimPath would have needed the path hand-authored per layout, which is
 * exactly why none of these devices were reusable before.
 *
 * `RadialFan` covers the hub-and-spoke case where everything connects to one
 * centre. This covers arbitrary edges, which RadialFan cannot express.
 */
export type GraphNode = { id: string; x: number; y: number; node: React.ReactNode };

export const NetworkGraph: React.FC<{
  nodes: GraphNode[];
  edges: [string, string][];
  width: number;
  height: number;
  startFrame?: number;
  staggerFrames?: number;
  edgeColor?: string;
  edgeWidth?: number;
  /** frames an edge waits after the later of its two nodes has landed */
  edgeDelay?: number;
}> = ({
  nodes,
  edges,
  width,
  height,
  startFrame = 0,
  staggerFrames = 4,
  edgeColor = "rgba(255,255,255,0.4)",
  edgeWidth = 1.5,
  edgeDelay = 10,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pos = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div style={{ position: "relative", width, height }}>
      <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0 }}>
        {edges.map(([a, b], i) => {
          const A = pos[a];
          const B = pos[b];
          if (!A || !B) return null;
          // an edge only draws once BOTH its endpoints exist, or it appears to
          // grow out of empty space
          const after = Math.max(
            nodes.findIndex((n) => n.id === a),
            nodes.findIndex((n) => n.id === b),
          );
          const p = interpolate(
            frame - startFrame - after * staggerFrames - edgeDelay,
            [0, 14],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          return (
            <line
              key={i}
              x1={A.x}
              y1={A.y}
              x2={A.x + (B.x - A.x) * p}
              y2={A.y + (B.y - A.y) * p}
              stroke={edgeColor}
              strokeWidth={edgeWidth}
            />
          );
        })}
      </svg>
      {nodes.map((n, i) => {
        const s = spring({
          frame: frame - startFrame - i * staggerFrames,
          fps,
          durationInFrames: 18,
          config: { damping: 15, stiffness: 130, mass: 0.7 },
        });
        return (
          <div
            key={n.id}
            style={{
              position: "absolute",
              left: n.x,
              top: n.y,
              transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * s})`,
              opacity: interpolate(s, [0, 0.35], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {n.node}
          </div>
        );
      })}
    </div>
  );
};
