import { AbsoluteFill } from "remotion";
import { Background } from "../components/Background";
import { PhoneFrame } from "../components/PhoneFrame";
import { PhraseSequence } from "../components/PhraseSequence";
import { sansFont } from "../fonts";

/**
 * Beat 1 — the hook. A large "before/after" hero photo with a small
 * reaction clip inset (duet-style), plus a headline question that
 * strikes through into a headline answer.
 */
export const HookScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 640,
            height: 900,
            borderRadius: 24,
            background: "#c3d1d4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: sansFont,
            color: "#7c8f93",
            fontSize: 22,
          }}
        >
          [ subject photo ]
        </div>

        <div style={{ position: "absolute", top: 340, right: 70 }}>
          <PhoneFrame width={190}>
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "#2b2b2b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
                fontFamily: sansFont,
                fontSize: 13,
                textAlign: "center",
                padding: 10,
              }}
            >
              reaction clip
            </div>
          </PhoneFrame>
        </div>
      </AbsoluteFill>

      <div style={{ position: "absolute", top: "10%", left: 0, right: 0, height: 140 }}>
        <PhraseSequence
          variant="headline"
          phrases={[
            { text: "Did they get chin surgery?", frames: 100 },
            { text: "Probably not.", frames: 70 },
          ]}
        />
      </div>

      <div style={{ position: "absolute", bottom: "8%", left: 0, right: 0, height: 180 }}>
        <PhraseSequence
          variant="voiceover"
          phrases={[
            { text: "The mainstream media is certain", frames: 60 },
            { text: "that this public figure...", frames: 50 },
            { text: "Obviously, they look great,", frames: 40 },
            { text: "and they're baiting us a bit on their socials;", frames: 60 },
          ]}
        />
      </div>
    </AbsoluteFill>
  );
};

export const HOOK_SCENE_DURATION = 360;
