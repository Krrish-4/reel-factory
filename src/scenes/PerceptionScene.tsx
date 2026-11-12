import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { PhraseSequence } from "../components/PhraseSequence";
import { sansFont } from "../fonts";

const CommentBubble: React.FC<{
  name: string;
  text: string;
  appearFrame: number;
  style?: React.CSSProperties;
}> = ({ name, text, appearFrame, style }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [appearFrame, appearFrame + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        background: "white",
        borderRadius: 16,
        padding: "10px 14px",
        maxWidth: 240,
        fontFamily: sansFont,
        boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
        ...style,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{name}</div>
      <div style={{ fontSize: 15, color: "#111" }}>{text}</div>
    </div>
  );
};

/**
 * Beat 4 — public perception. A casual photo surrounded by fan
 * comments, illustrating how the public reads the change.
 */
export const PerceptionScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 420,
            height: 520,
            borderRadius: 24,
            background: "#8fa5a9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: sansFont,
            color: "rgba(255,255,255,0.6)",
            fontSize: 18,
          }}
        >
          [ casual photo ]
        </div>
      </AbsoluteFill>

      <div style={{ position: "absolute", top: 260, left: 60 }}>
        <CommentBubble name="fan_1" text="He looks more handsome tho" appearFrame={20} />
      </div>
      <div style={{ position: "absolute", top: 420, right: 50 }}>
        <CommentBubble name="fan_2" text="Couldn't be filler, looks too good." appearFrame={60} />
      </div>
      <div style={{ position: "absolute", bottom: 260, left: 70 }}>
        <CommentBubble name="fan_3" text="I love it, my latest crush" appearFrame={100} />
      </div>

      <div style={{ position: "absolute", top: "8%", left: 0, right: 0, height: 100 }}>
        <PhraseSequence variant="headline" phrases={[{ text: "A lot of people will see this", frames: 210 }]} />
      </div>

      <div style={{ position: "absolute", bottom: "6%", left: 0, right: 0, height: 140 }}>
        <PhraseSequence
          variant="voiceover"
          phrases={[
            { text: "and think, \"oh it couldn't be filler,", frames: 100 },
            { text: "looks too good.\"", frames: 80 },
          ]}
        />
      </div>
    </AbsoluteFill>
  );
};

export const PERCEPTION_SCENE_DURATION = 210;
