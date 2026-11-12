import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { serifFont } from "../../fonts";
import { CUES } from "./words";

/**
 * Caption track for "The Mirror".
 *
 * THE LAST WORD OF A PHRASE HAS TO BE READABLE. Words used to be spread across
 * 85% of the slot, which put the final word at ~71-85% of it — and since the
 * whole line starts fading at `t - FADE`, the COMPLETED sentence was on screen
 * for 4 to 9 frames. A seventh of a second. Every phrase in the reel ended in a
 * word nobody could read.
 *
 * That defect is invisible to pixel measurement — the caption is animating the
 * whole time, so nothing reads as frozen or missing. It was caught by having
 * Gemini transcribe the on-screen text, which came back "You've done it in",
 * "Held it there. Let", "and finish in": every phrase truncated at exactly the
 * point the last word failed to arrive in time. See rule P in
 * `docs/reel-invariants.md`.
 *
 * So the word rate is no longer a fraction of the slot. It is solved backwards
 * from the requirement: the finished line must hold for HOLD frames before it
 * begins to fade, so the last word has to have ARRIVED by `t - FADE - HOLD`.
 * The words then divide whatever time is left. A slot too short to allow that
 * yields a faster read rather than an unreadable ending.
 *
 * The moment a voiceover exists this becomes wrong again in the other
 * direction — real speech has pauses, and evenly-spread words drift into them
 * (rule B). Regenerate through `gen-words.py` and switch to per-word frames.
 */
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** frames the whole line fades out over, at the end of its slot */
const FADE = 7;
/** frames a word takes to blur in */
const IN = 5;
/** frames the finished line must hold, fully up, before FADE starts */
const HOLD = 16;

export const MirrorCaptions: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        bottom: "9%",
        left: 0,
        right: 0,
        height: 150,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 70px",
      }}
    >
      {CUES.map((c, i) => {
        if (frame < c.f - 6 || frame > c.t + 6) return null;
        const words = c.s.split(" ");
        // The last word must be fully in by here, not at some fraction of the
        // slot. Never earlier than c.f, so a very short cue degrades to every
        // word at once rather than to negative spacing.
        const lastIn = Math.max(c.f, c.t - FADE - HOLD - IN);
        const step =
          words.length > 1 ? (lastIn - c.f) / (words.length - 1) : 0;
        const outO = interpolate(frame, [c.t - FADE, c.t], [1, 0], clamp);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              textAlign: "center",
              fontFamily: serifFont,
              fontStyle: "italic",
              fontSize: 44,
              color: "#fff",
              lineHeight: 1.3,
              opacity: outO,
            }}
          >
            {words.map((w, k) => {
              const t0 = c.f + k * step;
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
