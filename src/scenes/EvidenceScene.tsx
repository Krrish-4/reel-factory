import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { SocialCard } from "../components/SocialCard";
import { PhraseSequence } from "../components/PhraseSequence";
import { sansFont } from "../fonts";

const ImplantDiagram: React.FC<{
  label: string;
  weeks: string;
  appearFrame: number;
}> = ({ label, weeks, appearFrame }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [appearFrame, appearFrame + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rise = interpolate(frame, [appearFrame, appearFrame + 12], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${rise}px)`,
        background: "rgba(0,0,0,0.28)",
        borderRadius: 14,
        padding: "16px 20px",
        width: 230,
        color: "white",
        fontFamily: sansFont,
      }}
    >
      <div style={{ fontSize: 15, opacity: 0.8, marginBottom: 8 }}>{label}</div>
      <svg width="100%" height="70" viewBox="0 0 200 70" fill="none">
        <path
          d="M20 15 C 40 5, 70 5, 100 15 C 140 25, 170 20, 180 40 C 185 55, 160 62, 120 60 C 80 58, 40 55, 25 45 C 15 38, 15 22, 20 15 Z"
          stroke="white"
          strokeWidth="2"
          opacity={0.85}
        />
      </svg>
      <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>{weeks}</div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>MINIMUM RECOVERY</div>
    </div>
  );
};

/**
 * Beat 2 — evidence gathering. Two mock social posts side by side,
 * with anatomical recovery-time diagrams popping in over them.
 */
export const EvidenceScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 20, flexDirection: "row" }}>
        <SocialCard username="handle_1" style={{ transform: "rotate(-3deg)" }}>
          before photo
        </SocialCard>
        <SocialCard username="handle_1" style={{ transform: "rotate(2deg)" }}>
          after photo
        </SocialCard>
      </AbsoluteFill>

      <div style={{ position: "absolute", bottom: 340, left: 90 }}>
        <ImplantDiagram label="Chin implant" weeks="3-4 weeks" appearFrame={180} />
      </div>
      <div style={{ position: "absolute", bottom: 340, right: 90 }}>
        <ImplantDiagram label="Genioplasty" weeks="4-6 weeks" appearFrame={260} />
      </div>

      <div style={{ position: "absolute", top: "10%", left: 0, right: 0, height: 100 }}>
        <PhraseSequence
          variant="headline"
          phrases={[{ text: "It's hard to look good after surgery this quick", frames: 540 }]}
        />
      </div>

      <div style={{ position: "absolute", bottom: "6%", left: 0, right: 0, height: 160 }}>
        <PhraseSequence
          variant="voiceover"
          phrases={[
            { text: "but if it's surgery,", frames: 80 },
            { text: "he would have had to have rushed", frames: 120 },
            { text: "to undergo it right.", frames: 100 },
          ]}
        />
      </div>
    </AbsoluteFill>
  );
};

export const EVIDENCE_SCENE_DURATION = 540;
