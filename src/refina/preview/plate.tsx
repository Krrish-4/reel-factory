import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

/**
 * Beat-to-beat transitions, measured from the reference reel.
 * See docs/qoves-motion-reference.md.
 *
 * Three things the reference does that we were not doing:
 *
 *  1. It almost never hard-cuts. One hard cut in 52 seconds; every other beat
 *     boundary is a 0.29-1.21s transition, median 0.83s (25 frames at 30fps).
 *  2. It eases with **easeInOut cubic** — accelerating *and* decelerating.
 *     Ease-out alone arrives fast and settles, which reads as mechanical.
 *  3. Transitions are **plate-level**. During a slide the headline and caption
 *     stay exactly where they are; only the imagery travels.
 *
 * Usage — wraps a beat's contents, inside its existing Sequence:
 *
 *   <Sequence {...at("yours")}>
 *     <Plate len={len("yours")} dir="left">…everything…</Plate>
 *   </Sequence>
 *
 * It enters over the first `t` frames and leaves over the `t` frames AFTER the
 * beat ends — which is why `atPlate()` extends the Sequence's duration but
 * never its start. The start stays pinned to the voiceover and every beat-local
 * `from={…}` inside keeps working; the tail simply survives into the next beat
 * so the two plates overlap rather than leaving a hole between them.
 *
 * Deliberately NOT `TransitionSeries`, which computes timing from durations and
 * would drag the whole reel earlier by the sum of its transitions.
 *
 * Beat-local annotations travel WITH the plate, which is also what the
 * reference does — its CONTROLLED / UNCONTROLLED chips slide out with the faces
 * they label. Only the headline and caption tracks stay put, and those already
 * live in their own Sequences.
 */

export const T = 25; // 0.83s at 30fps — the reference's median transition

export type PlateDir = "up" | "down" | "left" | "right" | "none";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** The measured easing. Cubic in *and* out. */
const easeInOutCubic = Easing.bezier(0.65, 0, 0.35, 1);
/** Departures accelerate away — the reference's exits fit easeIn cubic. */
const easeInCubic = Easing.in(Easing.cubic);

/**
 * `s` runs -1 -> 0 -> +1 along the direction of travel: -1 is "not arrived
 * yet", 0 is at rest, +1 is "fully gone". `dir` names the direction the content
 * MOVES, so dir="down" enters from above and leaves below.
 */
const travel = (dir: PlateDir, s: number, dist: number) => {
  const d = s * dist;
  switch (dir) {
    case "down":
      return `translateY(${d}px)`;
    case "up":
      return `translateY(${-d}px)`;
    case "right":
      return `translateX(${d}px)`;
    case "left":
      return `translateX(${-d}px)`;
    default:
      return "none";
  }
};

export type PlateMode = "push" | "reveal" | "cut";

export const Plate: React.FC<{
  /** the beat's own length in frames (not counting the transition overlap) */
  len: number;
  /**
   * `push` travels a full frame dimension so the outgoing plate genuinely
   * clears the screen. `reveal` scales and fades in place — for short beats
   * where there isn't time for a full traverse (the reference's 0.29s events).
   * `cut` does nothing, for a deliberate hard cut.
   *
   * There is no "small push": a partial travel leaves the outgoing plate
   * sitting on screen while the next one arrives, which reads as two things
   * stacked rather than one replacing the other.
   */
  mode?: PlateMode;
  /** the direction the content travels: "down" enters from above, exits below */
  dir?: PlateDir;
  t?: number;
  /** skip the entrance (first beat) or the exit (last beat) */
  noEnter?: boolean;
  noExit?: boolean;
  children: React.ReactNode;
}> = ({
  len,
  mode = "push",
  dir = "down",
  t = T,
  noEnter = false,
  noExit = false,
  children,
}) => {
  const frame = useCurrentFrame();
  const horizontal = dir === "left" || dir === "right";
  const dist = horizontal ? 1080 : 1920;
  // Short beats cannot hold a 25-frame move at each end — our shortest is 41
  // frames. Scale the transition down rather than let the two overlap.
  const tt = Math.max(6, Math.min(t, Math.floor(len / 2.2)));

  const enter = noEnter
    ? 1
    : interpolate(frame, [0, tt], [0, 1], { ...clamp, easing: easeInOutCubic });
  const exit = noExit
    ? 0
    : interpolate(frame, [len, len + tt], [0, 1], { ...clamp, easing: easeInCubic });

  if (mode === "cut") return <AbsoluteFill>{children}</AbsoluteFill>;

  if (mode === "reveal") {
    // Unlike a push, a reveal leaves in place — so it must finish leaving
    // BEFORE the next beat starts, or the two sit stacked on top of each other.
    // Exit runs inside the beat's own tail rather than past its end.
    const revealExit = noExit
      ? 0
      : interpolate(frame, [len - tt, len], [0, 1], { ...clamp, easing: easeInCubic });
    const o = Math.min(enter, 1 - revealExit);
    const scale = 0.95 + 0.05 * enter - 0.04 * revealExit;
    return (
      <AbsoluteFill style={{ opacity: o, transform: `scale(${scale})` }}>
        {children}
      </AbsoluteFill>
    );
  }

  // A full-frame push carries the plate entirely off screen, so it needs no
  // opacity fade — and the reference never cross-fades its plates.
  const s = enter - 1 + exit;
  return (
    <AbsoluteFill style={{ transform: travel(dir, s, dist) }}>
      {children}
    </AbsoluteFill>
  );
};

/**
 * Small arrivals — a card or panel appearing inside a beat rather than a whole
 * plate changing. The reference's 7-14 frame events fit easeOut cubic, and they
 * scale rather than travel.
 */
export const Reveal: React.FC<{
  from?: number;
  dur?: number;
  scaleFrom?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ from = 0, dur = 12, scaleFrom = 0.9, children, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - from, [0, dur], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scaleFrom + (1 - scaleFrom) * p})`,
        opacity: p,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * The ending: a light card wipes in left-to-right and holds over the sage.
 * Measured at 13 frames, easeIn cubic. The stage stays sage underneath, so
 * "flat sage for the entire runtime" is still true — this is a card on top.
 */
export const OutroCard: React.FC<{
  from?: number;
  dur?: number;
  color?: string;
  children?: React.ReactNode;
}> = ({ from = 0, dur = 13, color = "#F3F3F3", children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - from, [0, dur], [0, 1], {
    ...clamp,
    easing: easeInCubic,
  });
  return (
    <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${100 - p * 100}%)` }}>
      <AbsoluteFill style={{ backgroundColor: color }} />
      {children}
    </AbsoluteFill>
  );
};
