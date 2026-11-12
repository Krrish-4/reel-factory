import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { refina } from "../theme";
import { Photo } from "../Photo";
import { PhraseSequence } from "../../components/PhraseSequence";

/**
 * Beat 4 — Payoff. Madison's real "after" café shot with her verbatim
 * closing testimonial.
 */
export const PayoffScene: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, PAYOFF_DURATION], [1.05, 1.11], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: refina.paper }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Photo src="after.png" />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      <div style={{ position: "absolute", bottom: "14%", left: 0, right: 0, height: 240 }}>
        <PhraseSequence
          variant="voiceover"
          color="#fff"
          phrases={[
            { text: "Glad I did it!", frames: 70 },
            { text: "So in love with my results —", frames: 51 },
            { text: "best decision I ever made.", frames: 66 },
          ]}
        />
      </div>
    </AbsoluteFill>
  );
};

export const PAYOFF_DURATION = 187;
