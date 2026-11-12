import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { serifFont } from "../../fonts";
import { WORD_CUES } from "./words-vo";

/**
 * Caption track for "It Isn't the Size".
 *
 * EVERY WORD FRAME HERE IS MEASURED. `words-vo.ts` carries a `w:` array per cue
 * holding the onset of each word, transcribed off the synthesised read, so a
 * word appears when it is spoken and not when arithmetic guessed it would be.
 *
 * This is preview-local for the reason `preview/captions.tsx` records: the
 * shared `Captions` in `protocol/atoms.tsx` meters words evenly across a cue
 * SLOT, and a slot runs through the pause after the phrase, so words pace
 * slower than the speech and drift further behind with every word. That
 * component stays as it is because the approved protocol cut imports it.
 */
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** frames a word takes to blur in */
const IN = 5;
/** frames the whole line fades out over, at the end of its cue */
const FADE = 7;

export const SizeCaptions: React.FC = () => {
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
              textAlign: "center",
              fontFamily: serifFont,
              fontStyle: "italic",
              fontSize: 42,
              color: "#fff",
              lineHeight: 1.3,
              // The face fills the frame in most beats, so unlike the other
              // reels the caption often sits over a photograph. It carries its
              // own shadow rather than a scrim, which would have to cover a
              // third of the picture to do the same job.
              textShadow: "0 2px 14px rgba(16,24,28,0.72)",
              opacity: outO,
            }}
          >
            {words.map((w, k) => {
              // measured onset for this exact word
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
