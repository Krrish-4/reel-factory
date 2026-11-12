import { interpolate, useCurrentFrame } from "remotion";
import { sansFont, serifFont } from "../fonts";

export type Phrase = {
  text: string;
  frames: number;
};

const CROSSFADE = 6;

export const PhraseSequence: React.FC<{
  phrases: Phrase[];
  variant?: "headline" | "voiceover";
  color?: string;
  shadow?: string;
}> = ({
  phrases,
  variant = "voiceover",
  color = "#fff",
  shadow = "0 2px 12px rgba(0,0,0,0.25)",
}) => {
  const frame = useCurrentFrame();
  const isHeadline = variant === "headline";

  let cursor = 0;
  const withRanges = phrases.map((p) => {
    const from = cursor;
    cursor += p.frames;
    return { ...p, from };
  });

  return (
    <>
      {withRanges.map((p, i) => {
        const localFrame = frame - p.from;
        if (localFrame < -CROSSFADE || localFrame > p.frames + CROSSFADE) {
          return null;
        }

        const fadeIn = interpolate(localFrame, [0, CROSSFADE], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const fadeOut = interpolate(
          localFrame,
          [p.frames - CROSSFADE, p.frames],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        const rise = interpolate(localFrame, [0, CROSSFADE], [14, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: Math.min(fadeIn, fadeOut),
              transform: `translateY(${rise}px)`,
              padding: "0 64px",
              textAlign: "center",
              fontFamily: isHeadline ? sansFont : serifFont,
              fontStyle: isHeadline ? "normal" : "italic",
              fontWeight: isHeadline ? 700 : 400,
              fontSize: isHeadline ? 56 : 42,
              color,
              lineHeight: 1.3,
              textShadow: shadow,
            }}
          >
            {p.text}
          </div>
        );
      })}
    </>
  );
};
