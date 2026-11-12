import { AbsoluteFill, Audio, Composition, Series, staticFile } from "remotion";
import { HookScene, HOOK_DURATION } from "./scenes/HookScene";
import { RevealScene, REVEAL_DURATION } from "./scenes/RevealScene";
import { HowItWorksScene, HOWITWORKS_DURATION } from "./scenes/HowItWorksScene";
import {
  TalkingHeadScene,
  TALKINGHEAD_DURATION,
} from "./scenes/TalkingHeadScene";
import { PayoffScene, PAYOFF_DURATION } from "./scenes/PayoffScene";
import { CTAScene, CTA_DURATION } from "./scenes/CTAScene";

const TOTAL =
  HOOK_DURATION +
  REVEAL_DURATION +
  HOWITWORKS_DURATION +
  TALKINGHEAD_DURATION +
  PAYOFF_DURATION +
  CTA_DURATION;

export const RefinaReelVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Madison's voiceover, timed against every scene below. */}
      <Audio src={staticFile("voiceover.mp3")} />
      <Series>
        <Series.Sequence durationInFrames={HOOK_DURATION}>
          <HookScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={REVEAL_DURATION}>
          <RevealScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={HOWITWORKS_DURATION}>
          <HowItWorksScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={TALKINGHEAD_DURATION}>
          <TalkingHeadScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={PAYOFF_DURATION}>
          <PayoffScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CTA_DURATION}>
          <CTAScene />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};

export const RefinaReel: React.FC = () => {
  return (
    <Composition
      id="RefinaReel"
      component={RefinaReelVideo}
      durationInFrames={TOTAL}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
