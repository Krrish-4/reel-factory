import { AbsoluteFill } from "remotion";
import { Background } from "../components/Background";
import { PhoneFrame } from "../components/PhoneFrame";
import { PhraseSequence } from "../components/PhraseSequence";
import { sansFont } from "../fonts";

/**
 * Beat 9 — proof. A quick UGC-style clip of the procedure, cutting
 * to clinic B-roll, closing the argument that filler often wins for
 * this specific use case.
 */
export const ProofClipScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <PhoneFrame width={310}>
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "#262626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#888",
              fontFamily: sansFont,
              fontSize: 14,
              textAlign: "center",
              padding: 16,
            }}
          >
            procedure / clinic clip
          </div>
        </PhoneFrame>
      </AbsoluteFill>

      <div style={{ position: "absolute", top: "10%", left: 0, right: 0, height: 100 }}>
        <PhraseSequence variant="headline" phrases={[{ text: "For the chin & jaw, filler often wins", frames: 90 }]} />
      </div>

      <div style={{ position: "absolute", bottom: "8%", left: 0, right: 0, height: 100 }}>
        <PhraseSequence
          variant="voiceover"
          phrases={[{ text: "for the right case, it often looks better than surgery, same day.", frames: 90 }]}
        />
      </div>
    </AbsoluteFill>
  );
};

export const PROOF_CLIP_SCENE_DURATION = 90;
