import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { PhraseSequence } from "../components/PhraseSequence";

const DOTS = Array.from({ length: 40 }).map((_, i) => ({
  cx: 60 + ((i * 37) % 400),
  cy: 40 + ((i * 53) % 220),
  delay: i * 2,
}));

/**
 * Beat 5 — survivorship-bias explainer. A minimal line-art plane
 * with "damage" dots fading in one by one, echoing the classic
 * WWII bomber-armor diagram.
 */
export const BiasDiagramScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Background />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <svg width="480" height="320" viewBox="0 0 480 320" fill="none">
          <g stroke="white" strokeWidth="2" opacity={0.9}>
            <line x1="240" y1="40" x2="240" y2="280" />
            <path d="M40 160 L440 160 L400 190 L80 190 Z" />
            <path d="M180 250 L300 250 L280 280 L200 280 Z" />
            <circle cx="240" cy="60" r="18" />
          </g>
          {DOTS.map((d, i) => {
            const opacity = interpolate(frame, [40 + d.delay, 50 + d.delay], [0, 0.85], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return <circle key={i} cx={d.cx} cy={d.cy} r={3.5} fill="white" opacity={opacity} />;
          })}
        </svg>
      </AbsoluteFill>

      <div style={{ position: "absolute", top: "14%", left: 0, right: 0, height: 100 }}>
        <PhraseSequence variant="headline" phrases={[{ text: "You only notice filler when it's bad", frames: 150 }]} />
      </div>

      <div style={{ position: "absolute", bottom: "10%", left: 0, right: 0, height: 100 }}>
        <PhraseSequence variant="voiceover" phrases={[{ text: "people outside the industry only notice filler when it looks bad,", frames: 150 }]} />
      </div>
    </AbsoluteFill>
  );
};

export const BIAS_SCENE_DURATION = 150;
