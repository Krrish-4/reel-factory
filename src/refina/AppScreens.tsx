import { interpolate, useCurrentFrame } from "remotion";
import { refina } from "./theme";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

/** iPhone-style bezel wrapping a cream app screen. */
export const AppPhone: React.FC<{
  width?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ width = 460, children, style }) => {
  const height = width * (844 / 390);
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 54,
        border: "8px solid #111",
        background: refina.paper,
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 30px 70px rgba(60,45,30,0.28)",
        ...style,
      }}
    >
      <StatusBar />
      {children}
    </div>
  );
};

const StatusBar: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 44,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 28px",
      fontFamily: refina.sans,
      fontSize: 15,
      fontWeight: 600,
      color: refina.ink,
      zIndex: 3,
    }}
  >
    <span>9:41</span>
    <div
      style={{
        position: "absolute",
        top: 8,
        left: "50%",
        transform: "translateX(-50%)",
        width: 96,
        height: 26,
        background: "#111",
        borderRadius: 16,
      }}
    />
    <span style={{ letterSpacing: 1 }}>5G ▮</span>
  </div>
);

const PILL = (active: boolean): React.CSSProperties => ({
  background: active ? refina.mauve : "transparent",
  color: active ? "white" : refina.inkSoft,
  fontFamily: refina.sans,
  fontSize: 15,
  fontWeight: 600,
  padding: "8px 16px",
  borderRadius: 22,
});

type Procedure = { name: string; desc: string };
const PROCEDURES: Procedure[] = [
  { name: "Botox", desc: "Soften lines and smooth expression" },
  { name: "Rhinoplasty", desc: "Reshape and refine your nose" },
  { name: "Lip Enhancement", desc: "Add subtle volume and shape" },
  { name: "Jawline Contouring", desc: "Define and sculpt the jaw" },
  { name: "Facelift (Rhytidectomy)", desc: "Tighten and lift facial contours" },
];

/**
 * "Select Procedures" screen. `highlightFrame` drives a selection
 * sweep onto Botox and a press-state on the Generate button.
 */
export const SelectProceduresScreen: React.FC<{
  selectFrame?: number;
  generateFrame?: number;
}> = ({ selectFrame = 20, generateFrame = selectFrame + 25 }) => {
  const frame = useCurrentFrame();
  const selected = frame >= selectFrame;
  const press = interpolate(
    frame,
    [generateFrame, generateFrame + 8, generateFrame + 16],
    [1, 0.95, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div style={{ padding: "56px 22px 0", fontFamily: refina.sans }}>
      <div
        style={{
          textAlign: "center",
          fontFamily: refina.serifUpright,
          fontSize: 26,
          color: refina.ink,
          marginBottom: 18,
        }}
      >
        Select Procedures
      </div>

      <div
        style={{
          background: refina.card,
          border: `1px solid ${refina.hairline}`,
          borderRadius: 14,
          padding: 14,
          display: "flex",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <div style={{ fontSize: 20 }}>✦</div>
        <div>
          <div style={{ fontWeight: 700, color: refina.ink, fontSize: 15 }}>
            AI Beauty Advisor
          </div>
          <div style={{ color: refina.inkSoft, fontSize: 12, lineHeight: 1.3 }}>
            AI analyzes your facial features and finds the most flattering
            enhancements for you
          </div>
        </div>
      </div>

      <div style={{ color: refina.inkSoft, fontSize: 12, marginBottom: 12 }}>
        Or select a specific procedure
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {PROCEDURES.map((p) => {
          const isBotox = p.name === "Botox";
          const on = isBotox && selected;
          return (
            <div
              key={p.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 12,
                background: on ? "rgba(198,137,138,0.14)" : refina.card,
                border: `1.5px solid ${on ? refina.mauve : refina.hairline}`,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: refina.paperDeep,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: refina.ink }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 12, color: refina.inkSoft }}>
                  {p.desc}
                </div>
              </div>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: `2px solid ${on ? refina.mauve : refina.hairline}`,
                  background: on ? refina.mauve : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {on ? "✓" : ""}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 22,
          background: refina.mauve,
          color: "white",
          textAlign: "center",
          padding: "16px",
          borderRadius: 30,
          fontWeight: 700,
          fontSize: 17,
          transform: `scale(${press})`,
        }}
      >
        Generate Preview
      </div>
    </div>
  );
};

/**
 * "Your Result" screen with the animated before/after slider and
 * enhancement details.
 */
export const ResultScreen: React.FC<{
  before: React.ReactNode;
  after: React.ReactNode;
  sliderStartFrame?: number;
}> = ({ before, after, sliderStartFrame = 15 }) => {
  return (
    <div style={{ padding: "56px 22px 0", fontFamily: refina.sans }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <span style={{ color: refina.inkSoft, fontSize: 15 }}>Retry</span>
        <span
          style={{
            fontFamily: refina.serifUpright,
            fontSize: 22,
            color: refina.ink,
          }}
        >
          Your Result
        </span>
        <span style={{ color: refina.inkSoft, fontSize: 15 }}>Results</span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: refina.card,
          border: `1px solid ${refina.hairline}`,
          borderRadius: 26,
          padding: 5,
          marginBottom: 16,
        }}
      >
        <span style={{ ...PILL(false), fontSize: 13 }}>Original</span>
        <span style={{ ...PILL(true), fontSize: 13 }}>Enhanced</span>
      </div>

      <BeforeAfterSlider
        before={before}
        after={after}
        width={416}
        height={430}
        startFrame={sliderStartFrame}
        sweepFrames={110}
      />

      <div style={{ marginTop: 18 }}>
        <div style={{ color: refina.inkSoft, fontSize: 12, marginBottom: 8 }}>
          ENHANCEMENT DETAILS
        </div>
        {["Botox — forehead & glabella", "Softer expression lines"].map((t) => (
          <div
            key={t}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 15,
              color: refina.ink,
              padding: "5px 0",
            }}
          >
            <span style={{ color: refina.mauve }}>✓</span>
            {t}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            padding: 13,
            borderRadius: 26,
            border: `1.5px solid ${refina.hairline}`,
            color: refina.ink,
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          Share
        </div>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            padding: 13,
            borderRadius: 26,
            background: refina.mauve,
            color: "white",
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          Download
        </div>
      </div>
    </div>
  );
};
