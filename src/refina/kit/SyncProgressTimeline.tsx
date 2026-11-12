import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { sansFont } from "../../fonts";

/**
 * A progress bar and a marker driven by ONE value.
 *
 * The spec's phrasing is the whole component: "binds both indicator translate X
 * and progress bar width to the same interpolation value". Hand-built, these
 * two drift apart — the bar eases and the marker does not, or they take
 * different durations — and the result reads as broken rather than as a
 * timeline.
 *
 * Distinct from `MetricSlider`, which shows a VALUE settling to a position with
 * a spring. This shows TIME passing at an even rate, so it is linear by
 * default: a springy timeline would imply the clock hesitated.
 */
export const SyncProgressTimeline: React.FC<{
  stops: string[];
  startFrame?: number;
  durationInFrames?: number;
  width?: number;
  color?: string;
  trackColor?: string;
  labelColor?: string;
  /** ease the sweep instead of running it linearly */
  eased?: boolean;
}> = ({
  stops,
  startFrame = 0,
  durationInFrames = 90,
  width = 780,
  color = "#fff",
  trackColor = "rgba(255,255,255,0.22)",
  labelColor = "rgba(255,255,255,0.86)",
  eased = false,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - startFrame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    ...(eased ? { easing: Easing.inOut(Easing.cubic) } : {}),
  });
  const H = 6;

  return (
    <div style={{ width, position: "relative" }}>
      <div style={{ height: H, borderRadius: H, background: trackColor,
                    overflow: "hidden" }}>
        <div style={{ width: `${p * 100}%`, height: "100%", background: color }} />
      </div>

      {/* every stop is a tick; a stop is "reached" once the sweep passes it */}
      <div style={{ position: "relative", height: 0 }}>
        {stops.map((s, i) => {
          const at = stops.length === 1 ? 0 : i / (stops.length - 1);
          const reached = p >= at - 0.001;
          return (
            <div key={s} style={{ position: "absolute", left: `${at * 100}%`,
                                  top: -H, transform: "translateX(-50%)" }}>
              <div style={{ width: reached ? 12 : 8, height: reached ? 12 : 8,
                            borderRadius: "50%",
                            background: reached ? color : trackColor,
                            transform: `translateY(${reached ? -3 : -1}px)` }} />
              <div style={{ marginTop: 14, fontFamily: sansFont, fontSize: 18,
                            color: labelColor, opacity: reached ? 1 : 0.45,
                            whiteSpace: "nowrap",
                            transform: "translateX(-50%)", marginLeft: 6 }}>
                {s}
              </div>
            </div>
          );
        })}
      </div>

      {/* the marker rides the SAME p as the bar — that is the point */}
      <div style={{ position: "absolute", top: -7, left: `${p * 100}%`,
                    transform: "translateX(-50%)", width: 20, height: 20,
                    borderRadius: "50%", background: color,
                    boxShadow: "0 2px 10px rgba(20,30,34,0.35)" }} />
    </div>
  );
};
