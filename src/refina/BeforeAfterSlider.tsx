import { interpolate, useCurrentFrame } from "remotion";
import { refina } from "./theme";

/**
 * The drag-to-compare Before/After control from Refina's "Your Result"
 * screen. The divider sweeps automatically so it reads as motion in a
 * video. `before` / `after` accept any node (an <Img>, a color block,
 * or a placeholder label).
 */
export const BeforeAfterSlider: React.FC<{
  before: React.ReactNode;
  after: React.ReactNode;
  width: number;
  height: number;
  /** frame at which the sweep starts */
  startFrame?: number;
  /** frames the sweep takes */
  sweepFrames?: number;
}> = ({ before, after, width, height, startFrame = 0, sweepFrames = 90 }) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;

  // ease: rest left, sweep right, settle near middle
  const pct = interpolate(
    local,
    [0, sweepFrames * 0.35, sweepFrames * 0.7, sweepFrames],
    [12, 88, 40, 52],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: 14,
        overflow: "hidden",
        background: refina.paperDeep,
      }}
    >
      {/* AFTER fills the base layer */}
      <div style={{ position: "absolute", inset: 0 }}>{after}</div>

      {/* BEFORE clipped to the left of the divider */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `inset(0 ${100 - pct}% 0 0)`,
        }}
      >
        {before}
      </div>

      <Label text="Before" side="left" />
      <Label text="After" side="right" />

      {/* divider + handle */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${pct}%`,
          width: 2,
          background: "white",
          boxShadow: "0 0 8px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "white",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            color: refina.inkSoft,
          }}
        >
          &#8596;
        </div>
      </div>
    </div>
  );
};

const Label: React.FC<{ text: string; side: "left" | "right" }> = ({
  text,
  side,
}) => (
  <div
    style={{
      position: "absolute",
      top: 12,
      [side]: 12,
      background: "rgba(255,255,255,0.85)",
      color: refina.ink,
      fontFamily: refina.sans,
      fontSize: 13,
      fontWeight: 600,
      padding: "4px 10px",
      borderRadius: 20,
    }}
  >
    {text}
  </div>
);
