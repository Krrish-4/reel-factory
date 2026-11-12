import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { refina } from "../theme";
import { Photo } from "../Photo";
import { PhraseSequence } from "../../components/PhraseSequence";

/**
 * Beat 1 — Hook. Madison's real "before" selfie with her verbatim
 * opening caption. Slow zoom keeps a static photo alive.
 */
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, HOOK_DURATION], [1.04, 1.1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: refina.paper }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Photo src="before.png" />
      </AbsoluteFill>

      {/* legibility scrim for the caption */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      <div style={{ position: "absolute", bottom: "16%", left: 0, right: 0, height: 200 }}>
        <PhraseSequence
          variant="voiceover"
          color="#fff"
          phrases={[
            { text: "My husband forced me getting a Botox.", frames: 79 },
            { text: "watch what happens next", frames: 40 },
          ]}
        />
      </div>
    </AbsoluteFill>
  );
};

export const HOOK_DURATION = 119;
