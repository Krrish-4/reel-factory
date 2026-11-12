import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

/**
 * The two small pieces of furniture this reel repeats, kept in one place so
 * `ghost.tsx`, `desk.tsx` and the reel itself do not each carry a copy.
 *
 * They are duplicated from `preview/RefinaPreviewReel.tsx` rather than
 * imported: they are declared inside that file's module scope, and lifting
 * them out would edit a composition whose cut is signed off. This is the
 * cheapest honest way to share them going forward — the next reel imports
 * these, not another copy.
 */

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

export const Mono: React.FC<{
  children: React.ReactNode;
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, size = 19, style }) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: size,
      letterSpacing: 2.4,
      color: "rgba(255,255,255,0.93)",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Persistent compliance chip on product beats (CLAUDE.md, content rules). */
export const Chip: React.FC<{ from?: number }> = ({ from = 0 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - from, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 92,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: o,
      }}
    >
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.5)",
          borderRadius: 30,
          padding: "9px 22px",
        }}
      >
        <Mono size={17}>AI PREVIEW · NOT MEDICAL ADVICE</Mono>
      </div>
    </div>
  );
};

export { MONO };
