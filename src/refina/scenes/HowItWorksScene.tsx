import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { refina } from "../theme";
import { AppPhone, SelectProceduresScreen, ResultScreen } from "../AppScreens";
import { Photo } from "../Photo";
import { PhraseSequence } from "../../components/PhraseSequence";

// Lengths tuned to the voiceover: Select covers "So before I committed…
// I picked the exact treatment"; Result covers "in seconds it showed me
// my own face… no appointment, no guessing".
const SELECT_LEN = 208;
const RESULT_LEN = 250;

const StepLabel: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      position: "absolute",
      top: "7%",
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: refina.serifUpright,
      fontSize: 46,
      color: refina.ink,
      padding: "0 60px",
    }}
  >
    {text}
  </div>
);

/** Persistent compliance chip, à la the reference video's disclaimer tag. */
const ComplianceChip: React.FC = () => (
  <div
    style={{
      position: "absolute",
      bottom: 40,
      right: 40,
      background: "rgba(36,31,27,0.08)",
      color: refina.inkSoft,
      fontFamily: refina.sans,
      fontSize: 13,
      letterSpacing: 0.5,
      padding: "8px 14px",
      borderRadius: 8,
    }}
  >
    AI PREVIEW · NOT MEDICAL ADVICE
  </div>
);

/** A phone that slides + fades in from the bottom. */
const SlideInPhone: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [0, 16], [50, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        transform: `translateY(${y}px)`,
        opacity,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const CaptionSlot: React.FC<{
  phrases: { text: string; frames: number }[];
}> = ({ phrases }) => (
  <div style={{ position: "absolute", bottom: "5%", left: 0, right: 0, height: 90 }}>
    <PhraseSequence
      variant="voiceover"
      color={refina.ink}
      shadow="none"
      phrases={phrases}
    />
  </div>
);

/**
 * Beat 3 — How it works. Steps through the real Refina UI in sync with
 * the voiceover: pick Botox + Generate, then the result with the
 * animated before/after slider driven by her real before/preview
 * photos.
 */
export const HowItWorksScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: refina.paper }}>
      <Sequence durationInFrames={SELECT_LEN}>
        <StepLabel text="Pick your procedure." />
        <SlideInPhone>
          <AppPhone>
            <SelectProceduresScreen selectFrame={122} generateFrame={182} />
          </AppPhone>
        </SlideInPhone>
        <CaptionSlot
          phrases={[
            { text: "So before I committed to anything,", frames: 62 },
            { text: "I opened Refina.", frames: 60 },
            { text: "I picked the exact treatment I was thinking about,", frames: 86 },
          ]}
        />
        <ComplianceChip />
      </Sequence>

      <Sequence from={SELECT_LEN} durationInFrames={RESULT_LEN}>
        <StepLabel text="Your preview — in seconds." />
        <SlideInPhone>
          <AppPhone>
            <ResultScreen
              before={<Photo src="before.png" focusY={0.28} />}
              after={<Photo src="preview.png" focusY={0.28} />}
              sliderStartFrame={8}
            />
          </AppPhone>
        </SlideInPhone>
        <CaptionSlot
          phrases={[
            { text: "and in seconds it showed me my own face — after.", frames: 111 },
            { text: "Right there on my couch.", frames: 72 },
            { text: "No appointment, no guessing.", frames: 67 },
          ]}
        />
        <ComplianceChip />
      </Sequence>
    </AbsoluteFill>
  );
};

export const HOWITWORKS_DURATION = SELECT_LEN + RESULT_LEN;
