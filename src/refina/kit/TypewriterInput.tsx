import React from "react";
import { useCurrentFrame } from "remotion";
import { sansFont } from "../../fonts";

/**
 * Text typed into a search field, with a blinking caret.
 *
 * One reference uses it, and it is the ending of our own protocol reel — "the
 * ending is a typing search bar" is a stated non-negotiable in CLAUDE.md. That
 * beat was hand-built inside `protocol/atoms.tsx` and could not be reused; this
 * is the same gesture as a component.
 *
 * The caret blink is frame-derived rather than a CSS animation. CSS keyframes
 * run on wall-clock time and are not deterministic under Remotion's frame
 * stepping, so a re-render can place the blink differently — the class of bug
 * that only shows up as a flicker between two renders of "the same" video.
 */
export const TypewriterInput: React.FC<{
  text: string;
  startFrame?: number;
  framesPerChar?: number;
  width?: number;
  placeholder?: string;
  background?: string;
  textColor?: string;
  caretColor?: string;
  /** frames for one on+off caret cycle */
  blinkFrames?: number;
  fontSize?: number;
  icon?: boolean;
}> = ({
  text,
  startFrame = 0,
  framesPerChar = 3,
  width = 620,
  placeholder = "Search",
  background = "#fff",
  textColor = "#1d2224",
  caretColor = "#1d2224",
  blinkFrames = 24,
  fontSize = 30,
  icon = true,
}) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - startFrame);
  const shown = Math.min(text.length, Math.floor(t / framesPerChar));
  const typing = shown < text.length;
  // solid while typing, blinking once finished — as a real field behaves
  const caretOn = typing ? true : (t % blinkFrames) < blinkFrames / 2;

  return (
    <div
      style={{
        width,
        background,
        borderRadius: 999,
        padding: `${fontSize * 0.5}px ${fontSize}px`,
        display: "flex",
        alignItems: "center",
        gap: fontSize * 0.55,
        boxShadow: "0 8px 26px rgba(0,0,0,0.14)",
      }}
    >
      {icon ? (
        <svg width={fontSize} height={fontSize} viewBox="0 0 24 24" fill="none"
             stroke={textColor} strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
      ) : null}
      <div style={{ fontFamily: sansFont, fontSize, color: textColor,
                    display: "flex", alignItems: "center", whiteSpace: "pre" }}>
        {shown === 0 ? (
          <span style={{ opacity: 0.4 }}>{placeholder}</span>
        ) : (
          text.slice(0, shown)
        )}
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: fontSize * 1.05,
            marginLeft: 2,
            background: caretColor,
            opacity: caretOn ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
};
