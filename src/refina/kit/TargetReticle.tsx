import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { sansFont } from "../../fonts";

/**
 * Four corner brackets that snap onto a region, with an optional readout.
 *
 * Ranked #4 in refs/BUILD-PLAN.md — "unlocks scientific/HUD facial scanning
 * aesthetics common in modern viral analytical hooks". Absorbs an eyebrow
 * focus frame, a facial scan box with badges, a crosshair focus and a scanning
 * overlay.
 *
 * We have `ContourDraw` and `DrawnCallout`, which trace and annotate — both
 * read as careful, hand-drawn analysis. This reads as a machine locking on,
 * which is a different claim and the one the corpus uses for anything framed as
 * measurement rather than opinion.
 *
 * The brackets fly in from outside the target and overshoot slightly, because
 * arriving exactly on the mark reads as a static frame appearing rather than
 * something acquiring a lock.
 */
export const TargetReticle: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  startFrame?: number;
  durationInFrames?: number;
  color?: string;
  strokeWidth?: number;
  /** bracket arm length in px */
  arm?: number;
  label?: string;
  labelPosition?: "top" | "bottom";
  /** a thin crosshair through the centre */
  crosshair?: boolean;
}> = ({
  x,
  y,
  width,
  height,
  startFrame = 0,
  durationInFrames = 16,
  color = "rgba(255,255,255,0.95)",
  strokeWidth = 2.4,
  arm = 34,
  label,
  labelPosition = "top",
  crosshair = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - startFrame,
    fps,
    durationInFrames,
    config: { damping: 15, stiffness: 140, mass: 0.8 },
  });
  // brackets start outside the box and converge onto it
  const out = (1 - s) * 46;
  const o = interpolate(frame - startFrame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const corner = (cx: number, cy: number, sx: number, sy: number) => (
    <path
      d={`M ${cx + sx * arm} ${cy} L ${cx} ${cy} L ${cx} ${cy + sy * arm}`}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="square"
    />
  );

  const L = x - out;
  const R = x + width + out;
  const T = y - out;
  const B = y + height + out;

  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none",
               opacity: o }}
    >
      {corner(L, T, 1, 1)}
      {corner(R, T, -1, 1)}
      {corner(L, B, 1, -1)}
      {corner(R, B, -1, -1)}
      {crosshair ? (
        <>
          <line x1={x + width / 2} y1={y + height * 0.42} x2={x + width / 2}
                y2={y + height * 0.58} stroke={color} strokeWidth={1.2} />
          <line x1={x + width * 0.42} y1={y + height / 2} x2={x + width * 0.58}
                y2={y + height / 2} stroke={color} strokeWidth={1.2} />
        </>
      ) : null}
      {label ? (
        <text
          x={x}
          y={labelPosition === "top" ? T - 14 : B + 30}
          fill={color}
          fontFamily={sansFont}
          fontSize={22}
          opacity={interpolate(s, [0.5, 1], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        >
          {label}
        </text>
      ) : null}
    </svg>
  );
};
