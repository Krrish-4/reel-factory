import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

/**
 * A wireframe lattice that settles onto a face.
 *
 * Three references use it and the audit found all three mis-claimed — twice as
 * `ContourDraw`, once as `Reveal`. A contour TRACES one line around a feature;
 * this lays a grid ACROSS the whole face. The first says "look at this edge",
 * the second says "this has been digitised", which is the entire rhetorical
 * point of the AI-analysis hook these reels open with.
 *
 * The lattice is generated rather than hand-authored: a radial grid warped
 * toward an anchor, so it drapes over a face instead of sitting flat like graph
 * paper. Vertices settle from a scattered start, which reads as tracking
 * locking on rather than an image being switched in.
 */
export const FaceMesh: React.FC<{
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  startFrame?: number;
  durationInFrames?: number;
  rings?: number;
  spokes?: number;
  color?: string;
  dotColor?: string;
  strokeWidth?: number;
  frameWidth?: number;
  frameHeight?: number;
}> = ({
  cx, cy, rx, ry,
  startFrame = 0,
  durationInFrames = 26,
  rings = 5,
  spokes = 14,
  color = "rgba(255,255,255,0.42)",
  dotColor = "rgba(255,255,255,0.9)",
  strokeWidth = 1.1,
  frameWidth = 1080,
  frameHeight = 1920,
}) => {
  const frame = useCurrentFrame();
  const t = frame - startFrame;
  if (t < 0) return null;
  const p = interpolate(t, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // deterministic scatter — a seeded hash, never Math.random, or the mesh
  // would jitter differently on every frame of a render
  const jitter = (i: number, j: number) => {
    const h = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453;
    return (h - Math.floor(h)) - 0.5;
  };

  const pt = (ring: number, spoke: number) => {
    const a = (spoke / spokes) * Math.PI * 2;
    const r = ring / rings;
    // squash the lower half so the lattice follows a jaw rather than a circle
    const yScale = Math.sin(a) > 0 ? 1.12 : 0.94;
    const tx = cx + Math.cos(a) * rx * r;
    const ty = cy + Math.sin(a) * ry * r * yScale;
    const s = (1 - p) * 60;
    return [tx + jitter(ring, spoke) * s, ty + jitter(spoke, ring) * s];
  };

  const lines: React.ReactNode[] = [];
  for (let ring = 1; ring <= rings; ring++) {
    const d = Array.from({ length: spokes + 1 }, (_, s) => {
      const [x, y] = pt(ring, s % spokes);
      return `${s ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
    lines.push(<path key={`r${ring}`} d={d} fill="none" stroke={color}
                     strokeWidth={strokeWidth} />);
  }
  for (let s = 0; s < spokes; s++) {
    const d = Array.from({ length: rings }, (_, i) => {
      const [x, y] = pt(i + 1, s);
      return `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
    lines.push(<path key={`s${s}`} d={d} fill="none" stroke={color}
                     strokeWidth={strokeWidth} />);
  }

  return (
    <svg width={frameWidth} height={frameHeight}
         style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none",
                  opacity: interpolate(t, [0, 6], [0, 1], {
                    extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
      {lines}
      {Array.from({ length: spokes }).map((_, s) => {
        const [x, y] = pt(rings, s);
        return <circle key={s} cx={x} cy={y} r={2.2} fill={dotColor} />;
      })}
    </svg>
  );
};
