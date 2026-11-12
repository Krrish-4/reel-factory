import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { sansFont } from "../fonts";

export const ChecklistItem: React.FC<{
  label: string;
  checkFrame: number;
}> = ({ label, checkFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const checked = frame >= checkFrame;
  const scale = checked
    ? spring({
        frame: frame - checkFrame,
        fps,
        config: { damping: 12, stiffness: 200 },
      })
    : 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: sansFont,
        fontSize: 24,
        color: "white",
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 5,
          border: "2px solid white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: checked ? "white" : "transparent",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            color: "#4b6a72",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          &#10003;
        </div>
      </div>
      {label}
    </div>
  );
};
