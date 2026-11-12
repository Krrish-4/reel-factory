import { AbsoluteFill } from "remotion";
import { Background } from "../components/Background";
import { PhoneFrame } from "../components/PhoneFrame";
import { ChecklistItem } from "../components/ChecklistItem";
import { PhraseSequence } from "../components/PhraseSequence";
import { sansFont } from "../fonts";

/**
 * Beat 7 — expert cameo. A phone-mockup clip of a practitioner,
 * with a "good candidate" checklist ticking in sync with the talk track.
 * A persistent disclaimer chip sits beside the phone.
 */
export const SurgeonScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <PhoneFrame width={340}>
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "#1e1e1e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#888",
              fontFamily: sansFont,
              fontSize: 15,
              textAlign: "center",
              padding: 20,
            }}
          >
            practitioner clip
          </div>
        </PhoneFrame>

        <div
          style={{
            position: "absolute",
            left: 90,
            bottom: 420,
            background: "rgba(0,0,0,0.5)",
            color: "white",
            fontFamily: sansFont,
            fontSize: 11,
            padding: "6px 10px",
            borderRadius: 6,
            maxWidth: 120,
            lineHeight: 1.3,
          }}
        >
          EDUCATION NOT MEDICAL ADVICE, CONSULT WITH A DOCTOR
        </div>

        <div
          style={{
            position: "absolute",
            left: 60,
            top: 380,
            background: "rgba(0,0,0,0.35)",
            borderRadius: 14,
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <ChecklistItem label="Sufficient funds" checkFrame={40} />
          <ChecklistItem label="High risk tolerance" checkFrame={140} />
          <ChecklistItem label="High recovery patience" checkFrame={200} />
          <ChecklistItem label="100% confidence" checkFrame={250} />
        </div>
      </AbsoluteFill>

      <div style={{ position: "absolute", bottom: "6%", left: 0, right: 0, height: 140 }}>
        <PhraseSequence
          variant="voiceover"
          phrases={[
            { text: "although they might seem", frames: 60 },
            { text: "only for a select few,", frames: 60 },
            { text: "with ample disposable income, high risk tolerance,", frames: 90 },
            { text: "high recovery patience, among other things.", frames: 90 },
          ]}
        />
      </div>
    </AbsoluteFill>
  );
};

export const SURGEON_SCENE_DURATION = 300;
