import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { refina } from "../theme";
import { RefinaLogo } from "../Logo";

/**
 * Beat 2 — a fast brand flash that fills the ~1s pause in the VO
 * between the hook and the demo. Just the logo mark + wordmark,
 * popping in on a hard cut (Vini-style snappy transition).
 */
export const RevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 13, stiffness: 200 } });
  const opacity = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: refina.paper,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          transform: `scale(${0.92 + pop * 0.08})`,
          opacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        <RefinaLogo size={120} showWordmark={false} />
        <span
          style={{
            fontFamily: refina.serifUpright,
            fontSize: 64,
            letterSpacing: 1,
            color: refina.ink,
          }}
        >
          Refina AI
        </span>
      </div>
    </AbsoluteFill>
  );
};

export const REVEAL_DURATION = 29;
