import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { cutPath, getLength } from "@remotion/paths";
import { sansFont } from "../../fonts";

/**
 * A measurement line with end brackets and a value badge.
 *
 * Ranked #7 in refs/BUILD-PLAN.md. Absorbs five corpus animations that were all
 * the same thing measured on different features: nose lines, mouth lines, a
 * masculine chin callout, a feminine chin callout, a proportion line.
 *
 * We have `DrawnCallout` already, which draws a leader OUT to a floating label
 * — it points AT something. This measures BETWEEN two points, which is the
 * gesture that makes an aesthetic claim look like an assessment. Different
 * rhetoric, so a different component rather than a flag on the old one.
 *
 * `cutPath` rather than strokeDashoffset: the dasharray is already spoken for
 * by the dotted style, so the usual dashoffset reveal cannot also drive the
 * draw. Shortening the path itself means the dots live on a line that is really
 * growing — the same reason DottedDraw exists.
 */
export const DimensionCallout: React.FC<{
  from: [number, number];
  to: [number, number];
  startFrame?: number;
  durationInFrames?: number;
  style?: "dotted" | "solid";
  bracketSize?: number;
  label?: string;
  color?: string;
  strokeWidth?: number;
  frameWidth?: number;
  frameHeight?: number;
}> = ({
  from,
  to,
  startFrame = 0,
  durationInFrames = 20,
  style = "dotted",
  bracketSize = 12,
  label,
  color = "rgba(255,255,255,0.94)",
  strokeWidth = 1.8,
  frameWidth = 1080,
  frameHeight = 1920,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - startFrame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  if (p <= 0) return null;

  const [x1, y1] = from;
  const [x2, y2] = to;
  const d = `M ${x1} ${y1} L ${x2} ${y2}`;
  const total = getLength(d);
  const shown = cutPath(d, Math.max(0.01, total * p));

  // brackets sit perpendicular to the line, so they read as end-stops
  const ang = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
  const bx = Math.cos(ang) * bracketSize;
  const by = Math.sin(ang) * bracketSize;
  const endsIn = interpolate(p, [0.85, 1], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  return (
    <>
      <svg width={frameWidth} height={frameHeight}
           style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        <path d={shown} fill="none" stroke={color} strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={style === "dotted" ? "2 7" : undefined} />
        <g opacity={endsIn}>
          <line x1={x1 - bx} y1={y1 - by} x2={x1 + bx} y2={y1 + by}
                stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <line x1={x2 - bx} y1={y2 - by} x2={x2 + bx} y2={y2 + by}
                stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </g>
      </svg>
      {label ? (
        <div
          style={{
            position: "absolute",
            left: mx,
            top: my,
            transform: "translate(-50%, -50%)",
            opacity: endsIn,
            background: "rgba(20,32,36,0.66)",
            border: "1px solid rgba(255,255,255,0.22)",
            borderRadius: 7,
            padding: "5px 11px",
            fontFamily: sansFont,
            fontSize: 22,
            color: "#fff",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      ) : null}
    </>
  );
};
