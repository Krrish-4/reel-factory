import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { sansFont } from "../../fonts";

/**
 * A scanning bar that sweeps across a region, with optional HUD frame.
 *
 * Used by 5 references — the highest-leverage gap the audit found. It was
 * hidden because three of those five were claimed as `PopIn` or `Reveal`, and
 * one as `TrimPath`: a bounding box that appears looks like a thing popping in
 * if you only see one frame per second.
 *
 * Deliberately NOT folded into `TargetReticle`. That component snaps brackets
 * onto a region and stops — it asserts "this is the area". This one MOVES a
 * read-head across the area, which asserts "I am examining it". Different
 * claims, and the reference reels use them for different beats.
 */
export const ScanOverlay: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  startFrame?: number;
  durationInFrames?: number;
  direction?: "down" | "up" | "right" | "left";
  color?: string;
  /** faint grid inside the region, as a scanner would draw */
  grid?: boolean;
  gridStep?: number;
  label?: string;
  /** repeat the sweep instead of a single pass */
  loop?: boolean;
  frameWidth?: number;
  frameHeight?: number;
}> = ({
  x, y, width, height,
  startFrame = 0,
  durationInFrames = 40,
  direction = "down",
  color = "rgba(140,220,255,0.95)",
  grid = true,
  gridStep = 42,
  label,
  loop = false,
  frameWidth = 1080,
  frameHeight = 1920,
}) => {
  const frame = useCurrentFrame();
  const t = frame - startFrame;
  if (t < 0) return null;
  const raw = loop ? (t % durationInFrames) / durationInFrames
                   : Math.min(1, t / durationInFrames);
  const vertical = direction === "down" || direction === "up";
  const p = direction === "up" || direction === "left" ? 1 - raw : raw;

  const fade = interpolate(t, [0, 8], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bar = vertical ? y + p * height : x + p * width;
  const band = 3;
  const glow = 46;   // trailing wash behind the read-head

  return (
    <svg width={frameWidth} height={frameHeight}
         style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none",
                  opacity: fade }}>
      <defs>
        <clipPath id={`scan-${x}-${y}`}>
          <rect x={x} y={y} width={width} height={height} />
        </clipPath>
        <linearGradient id={`wash-${x}-${y}`}
                        x1="0" y1={vertical ? "1" : "0"} x2={vertical ? "0" : "1"} y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.30" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#scan-${x}-${y})`}>
        {grid ? (
          <g stroke={color} strokeOpacity="0.16" strokeWidth={1}>
            {Array.from({ length: Math.ceil(width / gridStep) }).map((_, i) => (
              <line key={`v${i}`} x1={x + i * gridStep} y1={y}
                    x2={x + i * gridStep} y2={y + height} />
            ))}
            {Array.from({ length: Math.ceil(height / gridStep) }).map((_, i) => (
              <line key={`h${i}`} x1={x} y1={y + i * gridStep}
                    x2={x + width} y2={y + i * gridStep} />
            ))}
          </g>
        ) : null}
        {vertical ? (
          <>
            <rect x={x} y={bar - glow} width={width} height={glow}
                  fill={`url(#wash-${x}-${y})`} />
            <rect x={x} y={bar} width={width} height={band} fill={color} />
          </>
        ) : (
          <>
            <rect x={bar - glow} y={y} width={glow} height={height}
                  fill={`url(#wash-${x}-${y})`} />
            <rect x={bar} y={y} width={band} height={height} fill={color} />
          </>
        )}
      </g>
      <rect x={x} y={y} width={width} height={height} fill="none"
            stroke={color} strokeOpacity="0.5" strokeWidth={1.4} />
      {label ? (
        <text x={x} y={y - 12} fill={color} fontFamily={sansFont} fontSize={21}>
          {label}
        </text>
      ) : null}
    </svg>
  );
};
