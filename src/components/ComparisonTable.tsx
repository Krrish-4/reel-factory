import { interpolate, useCurrentFrame } from "remotion";
import { sansFont } from "../fonts";

export type ComparisonRow = {
  label: string;
  filler: string;
  surgery: string;
};

export const ComparisonTable: React.FC<{
  rows: ComparisonRow[];
  startFrame: number;
  rowStep?: number;
}> = ({ rows, startFrame, rowStep = 6 }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.25)",
        borderRadius: 16,
        padding: 24,
        width: 460,
        fontFamily: sansFont,
        color: "white",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          fontSize: 15,
          opacity: 0.7,
          marginBottom: 8,
        }}
      >
        <div />
        <div>FILLER</div>
        <div>SURGERY</div>
      </div>
      {rows.map((r, i) => {
        const rowFrame = startFrame + i * rowStep;
        const opacity = interpolate(frame, [rowFrame, rowFrame + 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={r.label}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              fontSize: 18,
              padding: "6px 0",
              opacity,
            }}
          >
            <div style={{ opacity: 0.85 }}>{r.label}</div>
            <div style={{ fontWeight: 600 }}>{r.filler}</div>
            <div style={{ opacity: 0.85 }}>{r.surgery}</div>
          </div>
        );
      })}
    </div>
  );
};
