import { AbsoluteFill } from "remotion";
import { Background } from "../components/Background";
import { PhraseSequence } from "../components/PhraseSequence";

/**
 * Beat 6 — trend context. A mock press-article card giving the
 * conversation a "this is bigger than one athlete" framing.
 */
export const TrendScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 420,
            background: "white",
            borderRadius: 8,
            padding: 20,
            fontFamily: "Georgia, serif",
            boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ fontSize: 11, color: "#a33", letterSpacing: 1, marginBottom: 6 }}>
            THE NEW FACE OF COSMETIC SURGERY
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111", marginBottom: 8 }}>
            What Are Men Doing to Their Faces?
          </div>
          <div style={{ fontSize: 14, color: "#444" }}>
            Chasing a hyper-masculine ideal, more men are turning to jawline
            and chin procedures than ever before.
          </div>
        </div>
      </AbsoluteFill>

      <div style={{ position: "absolute", top: "10%", left: 0, right: 0, height: 100 }}>
        <PhraseSequence variant="headline" phrases={[{ text: "Men's jaw surgery is having a moment", frames: 90 }]} />
      </div>

      <div style={{ position: "absolute", bottom: "10%", left: 0, right: 0, height: 100 }}>
        <PhraseSequence
          variant="voiceover"
          phrases={[{ text: "cosmetic jaw surgery for men is having a bit of a viral moment,", frames: 90 }]}
        />
      </div>
    </AbsoluteFill>
  );
};

export const TREND_SCENE_DURATION = 90;
