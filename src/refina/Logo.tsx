import { refina } from "./theme";

/**
 * Recreated Refina AI mark: two overlapping face profiles + wordmark,
 * matching the logo shown in the creator's post. Swap for the official
 * SVG/PNG when available.
 */
export const RefinaLogo: React.FC<{
  size?: number;
  color?: string;
  showWordmark?: boolean;
}> = ({ size = 64, color = refina.ink, showWordmark = true }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        {/* back profile */}
        <path
          d="M20 8 C 30 8, 38 16, 38 28 C 38 34, 35 38, 35 44 C 35 50, 39 52, 39 56"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          opacity={0.45}
        />
        {/* front profile */}
        <path
          d="M28 6 C 40 6, 49 15, 49 29 C 49 36, 45 40, 45 47 C 45 53, 49 55, 50 58
             M45 26 C 48 26, 50 28, 50 31 C 50 34, 47 35, 45 35"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* sparkle */}
        <path
          d="M14 40 l1.6 4 l4 1.6 l-4 1.6 l-1.6 4 l-1.6 -4 l-4 -1.6 l4 -1.6 z"
          fill={color}
        />
      </svg>
      {showWordmark ? (
        <span
          style={{
            fontFamily: refina.serifUpright,
            fontSize: size * 0.42,
            letterSpacing: 1,
            color,
          }}
        >
          Refina AI
        </span>
      ) : null}
    </div>
  );
};
