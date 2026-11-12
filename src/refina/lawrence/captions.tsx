import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { serifFont } from "../../fonts";
import { WORD_CUES } from "./words-vo";

/**
 * Caption track for RefinaLawrence — the house caption,
 * `size/captions.tsx` pointed at this reel's cue table.
 *
 * v2 drew its own: charcoal Playfair at 52px on an ivory stage. That is the
 * PDF's palette, not the treatment, and Rahul rejected the cut for not being
 * the reel this repo builds. White italic serif, 42px, word by word on the
 * MEASURED onsets in `words-vo.ts`, with its own shadow rather than a scrim.
 */
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** frames a word takes to blur in */
const IN = 5;
/** frames the whole line fades out over, at the end of its cue */
const FADE = 7;

export const LawrenceCaptions: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        bottom: "6.5%",
        left: 0,
        right: 0,
        height: 150,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 70px",
      }}
    >
      {WORD_CUES.map((c, i) => {
        if (frame < c.f - 6 || frame > c.t + 6) return null;
        const words = c.s.split(" ");
        const outO = interpolate(frame, [c.t - FADE, c.t], [1, 0], clamp);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 70,
              right: 70,
              textAlign: "center",
              fontFamily: serifFont,
              fontStyle: "italic",
              fontSize: 42,
              color: "#fff",
              lineHeight: 1.3,
              textShadow: "0 2px 14px rgba(16,24,28,0.72)",
              opacity: outO,
            }}
          >
            {words.map((w, k) => {
              const t0 = c.w[k] ?? c.f;
              const o = interpolate(frame, [t0, t0 + IN], [0, 1], clamp);
              const b = interpolate(frame, [t0, t0 + 6], [6, 0], clamp);
              const y = interpolate(frame, [t0, t0 + 7], [9, 0], {
                ...clamp,
                easing: Easing.out(Easing.quad),
              });
              return (
                <span
                  key={k}
                  style={{
                    display: "inline-block",
                    opacity: o,
                    filter: `blur(${b}px)`,
                    transform: `translateY(${y}px)`,
                    marginRight: "0.26em",
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
