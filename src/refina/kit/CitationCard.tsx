import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { sansFont } from "../../fonts";

/**
 * An academic citation, framed as a card.
 *
 * The ONLY recurring device in the corpus worth componentising: 209 of 228
 * device names appear in exactly one reel, but this one appears in four — and
 * it is the signature of the evidence-explainer format that dominates the set.
 * A claim is made, then a real citation slides under it, and the reel buys
 * credibility it never has to argue for.
 *
 * `source` is deliberately a separate prop from `title`, and both are required
 * in practice: a card that shows a title with no attribution is doing the
 * rhetorical work of a citation without being one.
 */
export const CitationCard: React.FC<{
  title: string;
  source: string;
  doi?: string;
  startFrame?: number;
  width?: number;
  background?: string;
  titleColor?: string;
  sourceColor?: string;
  accent?: string;
}> = ({
  title, source, doi,
  startFrame = 0,
  width = 720,
  background = "rgba(20,32,36,0.62)",
  titleColor = "#fff",
  sourceColor = "rgba(255,255,255,0.62)",
  accent = "rgba(255,255,255,0.28)",
}) => {
  const frame = useCurrentFrame();
  const t = frame - startFrame;
  const o = interpolate(t, [0, 12], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(t, [0, 16], [18, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (t < 0) return null;

  return (
    <div
      style={{
        width,
        background,
        borderLeft: `2px solid ${accent}`,
        borderRadius: 6,
        padding: "16px 20px",
        opacity: o,
        transform: `translateY(${y}px)`,
        fontFamily: sansFont,
      }}
    >
      <div style={{ fontSize: 21, lineHeight: 1.35, color: titleColor }}>
        {title}
      </div>
      <div style={{ fontSize: 16, lineHeight: 1.4, color: sourceColor, marginTop: 8 }}>
        {source}
        {doi ? <span style={{ opacity: 0.8 }}>{"  ·  "}{doi}</span> : null}
      </div>
    </div>
  );
};
