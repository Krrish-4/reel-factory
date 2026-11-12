import { AbsoluteFill } from "remotion";
import { Background } from "../components/Background";
import { ComparisonTable } from "../components/ComparisonTable";
import { PhraseSequence } from "../components/PhraseSequence";

const ROWS = [
  { label: "Complications", filler: "≈8%", surgery: "≈16-20%" },
  { label: "Severity", filler: "Mostly mild", surgery: "Can be major" },
  { label: "Cost", filler: "$", surgery: "$$$$" },
  { label: "Photo-ready", filler: "0-3 days", surgery: "Often >1 month" },
  { label: "Reversible", filler: "Usually", surgery: "Depends" },
  { label: "Longevity", filler: "Temporary", surgery: "Permanent" },
  { label: "Changes", filler: "Moderate", surgery: "Major" },
];

/**
 * Beat 8 — the data table. Filler vs. surgery, row by row.
 */
export const ComparisonTableScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <ComparisonTable rows={ROWS} startFrame={10} rowStep={6} />
      </AbsoluteFill>

      <div style={{ position: "absolute", bottom: "8%", left: 0, right: 0, height: 100 }}>
        <PhraseSequence
          variant="voiceover"
          phrases={[
            { text: "Chin filler is not risk-free,", frames: 45 },
            { text: "but it has some real advantages,", frames: 45 },
          ]}
        />
      </div>
    </AbsoluteFill>
  );
};

export const COMPARISON_TABLE_SCENE_DURATION = 90;
