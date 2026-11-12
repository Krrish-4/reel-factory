import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { refina } from "../theme";
import { RefinaLogo } from "../Logo";

/**
 * Beat 5 — Disclaimer + CTA. Official compliance line (verbatim from
 * the app listing) and the download call to action.
 */
export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Badge pops in on "see your future face first" (~frame 72).
  const badge = interpolate(frame, [72, 84], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: refina.paper,
        alignItems: "center",
        justifyContent: "center",
        opacity: fade,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
        }}
      >
        <RefinaLogo size={92} />

        <div
          style={{
            fontFamily: refina.serifUpright,
            fontSize: 52,
            color: refina.ink,
            textAlign: "center",
            lineHeight: 1.15,
          }}
        >
          See your future face.
        </div>

        {/* App store badge placeholder */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: refina.ink,
            color: "white",
            padding: "16px 34px",
            borderRadius: 16,
            fontFamily: refina.sans,
            transform: `scale(${0.9 + badge * 0.1})`,
            opacity: badge,
          }}
        >
          <span style={{ fontSize: 28 }}></span>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Download on the</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>App Store</div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 70,
          left: 60,
          right: 60,
          textAlign: "center",
          fontFamily: refina.sans,
          fontSize: 15,
          color: refina.inkSoft,
          lineHeight: 1.4,
        }}
      >
        Refina provides educational visualizations only and does not constitute
        medical advice. Outcomes vary by individual; consult a qualified
        healthcare professional before any procedure.
      </div>
    </AbsoluteFill>
  );
};

export const CTA_DURATION = 213;
