import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { sansFont, serifFont } from "../fonts";

/**
 * Beat 10 — brand CTA end card. Off-white background (a deliberate
 * break from the sage used everywhere else, to signal "the video is
 * over, here's the ask").
 */
export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#f2f2ef" }}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 24,
          opacity,
        }}
      >
        <div
          style={{
            fontFamily: serifFont,
            fontStyle: "italic",
            fontSize: 44,
            color: "#333",
            textAlign: "center",
          }}
        >
          You&rsquo;re Curious?
        </div>
        <div
          style={{
            fontFamily: serifFont,
            fontStyle: "italic",
            fontSize: 36,
            color: "#2f4a4f",
            textAlign: "center",
          }}
        >
          Get your Facial Analysis
        </div>
        <div style={{ fontFamily: sansFont, fontSize: 16, color: "#888" }}>
          glow-up advice from our team
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const CTA_SCENE_DURATION = 90;
