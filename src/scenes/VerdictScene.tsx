import { AbsoluteFill } from "remotion";
import { Background } from "../components/Background";
import { PhraseSequence } from "../components/PhraseSequence";
import { sansFont } from "../fonts";

/**
 * Beat 3 — the verdict. A cropped portrait labeled with the
 * speculated treatment.
 */
export const VerdictScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 300,
            height: 340,
            borderRadius: 20,
            background: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: sansFont,
            color: "rgba(255,255,255,0.7)",
            fontSize: 18,
          }}
        >
          [ portrait crop ]
        </div>
      </AbsoluteFill>

      <div style={{ position: "absolute", top: "12%", left: 0, right: 0, height: 100 }}>
        <PhraseSequence
          variant="headline"
          phrases={[{ text: "Filler seems more likely", frames: 300 }]}
        />
      </div>

      <div style={{ position: "absolute", bottom: "10%", left: 0, right: 0, height: 140 }}>
        <PhraseSequence
          variant="voiceover"
          phrases={[
            { text: "We're speculating,", frames: 90 },
            { text: "high-structure", frames: 70 },
            { text: "hyaluronic-acid filler.", frames: 90 },
          ]}
        />
      </div>
    </AbsoluteFill>
  );
};

export const VERDICT_SCENE_DURATION = 300;
