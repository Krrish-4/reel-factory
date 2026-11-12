import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { sansFont } from "../../fonts";

/**
 * A value moving along a single axis: a fill, a handle, and optional ticks.
 *
 * Ranked #3 in refs/BUILD-PLAN.md — high leverage, small effort, and it absorbs
 * six separate animations found across the reference corpus: a social
 * expectation split bar, a brow density pointer, a rating slider, a perception
 * control, an era timeline, and a colour palette bar.
 *
 * They looked like six different things in six different videos. They are one
 * component: a track, a marker interpolated along it, and a label that follows.
 * That is why the corpus was worth measuring — the shared mechanic is invisible
 * until you list them side by side.
 *
 * Treatment is passed in rather than baked. The reels this repo has made so far
 * all share one palette, and hard-coding it into a new component library would
 * make the look-alike problem permanent.
 */
export const MetricSlider: React.FC<{
  /** 0..1 positions along the track */
  from?: number;
  to: number;
  /** frame this starts on, relative to the enclosing Sequence */
  startFrame?: number;
  durationInFrames?: number;
  width?: number;
  /** labels under the two ends */
  leftLabel?: string;
  rightLabel?: string;
  /** text that rides the handle, e.g. the live value */
  handleLabel?: string;
  ticks?: number;
  trackColor?: string;
  fillColor?: string;
  handleColor?: string;
  labelColor?: string;
  /** "fill" grows a bar from the left; "split" divides two coloured halves */
  mode?: "fill" | "split";
  splitColor?: string;
}> = ({
  from = 0,
  to,
  startFrame = 0,
  durationInFrames = 30,
  width = 760,
  leftLabel,
  rightLabel,
  handleLabel,
  ticks = 0,
  trackColor = "rgba(255,255,255,0.22)",
  fillColor = "#fff",
  handleColor = "#fff",
  labelColor = "rgba(255,255,255,0.9)",
  mode = "fill",
  splitColor = "rgba(255,255,255,0.42)",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // A spring, not a linear tween: a value settling into place reads as a
  // measurement being taken. Linear reads as a progress bar.
  const p = spring({
    frame: frame - startFrame,
    fps,
    durationInFrames,
    config: { damping: 22, stiffness: 90, mass: 0.9 },
  });
  const value = interpolate(p, [0, 1], [from, to]);
  const pct = Math.max(0, Math.min(1, value)) * 100;

  const H = 12;
  return (
    <div style={{ width, position: "relative" }}>
      <div
        style={{
          position: "relative",
          height: H,
          borderRadius: H,
          background: mode === "split" ? splitColor : trackColor,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${pct}%`,
            background: fillColor,
            borderRadius: H,
          }}
        />
      </div>

      {ticks > 0 ? (
        <div style={{ position: "relative", height: 10, marginTop: 6 }}>
          {Array.from({ length: ticks }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${(i / (ticks - 1)) * 100}%`,
                width: 1,
                height: 8,
                background: trackColor,
                transform: "translateX(-0.5px)",
              }}
            />
          ))}
        </div>
      ) : null}

      {/* the handle sits ON the track, so it is placed after it and pulled up */}
      <div
        style={{
          position: "absolute",
          top: -6,
          left: `${pct}%`,
          transform: "translateX(-50%)",
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: handleColor,
          boxShadow: "0 2px 10px rgba(20,30,34,0.35)",
        }}
      />
      {handleLabel ? (
        <div
          style={{
            position: "absolute",
            top: -46,
            left: `${pct}%`,
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            fontFamily: sansFont,
            fontSize: 22,
            color: labelColor,
          }}
        >
          {handleLabel}
        </div>
      ) : null}

      {(leftLabel || rightLabel) ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 14,
            fontFamily: sansFont,
            fontSize: 21,
            color: labelColor,
          }}
        >
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      ) : null}
    </div>
  );
};
