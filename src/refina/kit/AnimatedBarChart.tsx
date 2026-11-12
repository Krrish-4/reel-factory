import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { sansFont } from "../../fonts";

/**
 * Bars that grow, with anything you like riding the tip.
 *
 * Ranked #1 in refs/BUILD-PLAN.md — "essential for credibility and empirical
 * study beats". It absorbs four corpus animations, and it is the single device
 * most associated with the evidence-explainer format that dominates the
 * reference set: a claim is made, then a chart with a real citation appears
 * under it.
 *
 * The reference reels do not show bare bars. They anchor a face, an emoji or a
 * value to the growing tip, which is what turns a chart into a character. So
 * `renderBadge` is the point of the component, not a convenience: the chart
 * logic never changes, only what rides on top.
 *
 * Bars stagger. Simultaneous growth reads as a loading screen; sequential
 * growth reads as results coming in one at a time.
 */
export type Bar = {
  /** 0..1 of the chart height */
  value: number;
  label?: string;
  color?: string;
};

export const AnimatedBarChart: React.FC<{
  bars: Bar[];
  width?: number;
  height?: number;
  startFrame?: number;
  staggerFrames?: number;
  durationInFrames?: number;
  barColor?: string;
  axisColor?: string;
  labelColor?: string;
  gap?: number;
  /** anything anchored to the top of each bar, e.g. a face or a percentage */
  renderBadge?: (bar: Bar, index: number, value: number) => React.ReactNode;
  /** a faint baseline the bars sit on */
  baseline?: boolean;
}> = ({
  bars,
  width = 700,
  height = 380,
  startFrame = 0,
  staggerFrames = 6,
  durationInFrames = 24,
  barColor = "#fff",
  axisColor = "rgba(255,255,255,0.28)",
  labelColor = "rgba(255,255,255,0.86)",
  gap = 26,
  renderBadge,
  baseline = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const barW = (width - gap * (bars.length - 1)) / bars.length;

  return (
    <div style={{ width, position: "relative" }}>
      <div
        style={{
          height,
          display: "flex",
          alignItems: "flex-end",
          gap,
          position: "relative",
        }}
      >
        {bars.map((b, i) => {
          const s = spring({
            frame: frame - startFrame - i * staggerFrames,
            fps,
            durationInFrames,
            config: { damping: 24, stiffness: 95, mass: 0.9 },
          });
          const v = b.value * s;
          const h = Math.max(0, v) * height;
          return (
            <div
              key={i}
              style={{
                width: barW,
                height: h,
                background: b.color ?? barColor,
                borderRadius: 6,
                position: "relative",
              }}
            >
              {renderBadge ? (
                <div
                  style={{
                    position: "absolute",
                    // the badge rides the tip, so it is anchored above the bar
                    bottom: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    marginBottom: 12,
                    opacity: interpolate(s, [0.15, 0.55], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                  }}
                >
                  {renderBadge(b, i, v)}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {baseline ? (
        <div style={{ height: 1, background: axisColor, marginTop: 2 }} />
      ) : null}

      <div style={{ display: "flex", gap, marginTop: 12 }}>
        {bars.map((b, i) => (
          <div
            key={i}
            style={{
              width: barW,
              textAlign: "center",
              fontFamily: sansFont,
              fontSize: 20,
              color: labelColor,
              opacity: interpolate(
                frame - startFrame - i * staggerFrames,
                [0, 10],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
            }}
          >
            {b.label}
          </div>
        ))}
      </div>
    </div>
  );
};
