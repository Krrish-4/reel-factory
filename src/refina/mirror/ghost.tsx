import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from "remotion";
import { portrait } from "../protocol/atoms";
import { Mono } from "./atoms";

/**
 * The imagined face: two exposures of the same person that will not settle.
 *
 * This carries two lines, and it is the same idea both times — which is the
 * point, not a repeat:
 *
 *   "A guess you make with your hands / and finish in your imagination"
 *        -> unlabelled, wandering. The picture in your head, established.
 *   "It was hope on a good day / and dread on a bad one"
 *        -> the same wobble, now named. HOPE and DREAD land on their words and
 *           the two exposures polarise: one lifts and brightens, one sinks.
 *
 * and then `photograph` hard-cuts to a single sharp still, which is the whole
 * argument of the section in one edit.
 *
 * WHY IT IS BUILT FROM HER REAL BEFORE AND HER REAL PREVIEW, and not from an
 * invented "bad outcome": there is no honest asset for dread. Fabricating a
 * disfigured render of a real person to illustrate a fear would be a claim
 * about an outcome, and this repo does not make those (CLAUDE.md, content
 * rules; reel-invariants E). So the unstable thing on screen is only ever two
 * true pictures of her that refuse to resolve — the instability is the drift
 * and the blur, and the words carry hope and dread. Neither exposure is
 * labelled as either.
 *
 * Geometry is the same derivation `Portrait` uses — `top` comes from the
 * asset's own measured `headFrac`, never a typed percentage (invariant A), so
 * swapping the hero cannot slide the crown off the top of frame.
 */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * How far apart the two exposures pull VERTICALLY when polarised.
 *
 * Small on purpose. The layers' top edges are feathered across the strip of
 * backdrop above the hairline, which is only ~47px tall; sliding one layer up
 * by more than a fraction of that pushes its bright, blurred edge out beyond
 * the feather and draws a horizontal band across the frame. The v1 render did
 * this at 16px. The polarisation is carried by brightness and blur instead —
 * those have no edge to give away.
 */
const POL_DY = 7;

const Layer: React.FC<{
  name: string;
  size: number;
  headTop: number;
  headFrac: number;
  dx: number;
  dy: number;
  blur: number;
  opacity: number;
  brightness: number;
}> = ({ name, size, headTop, headFrac, dx, dy, blur, opacity, brightness }) => {
  const imgH = (1920 * size) / 100;
  const top = headTop - headFrac * imgH;
  /* The blur has to be feathered at the image's top edge or it draws a hard
     horizontal line across the frame — blurring a bitmap pulls in the
     transparency just outside it, so the edge that is invisible on a sharp
     portrait becomes a visible band on a blurred one. This was clearly on
     screen in the v1 render.

     The feather has to stay INSIDE the strip of backdrop above the hairline,
     or it eats the top of her hair. That strip is exactly `headFrac * imgH`
     px tall, which is where the number comes from — derived from the asset,
     not typed (invariant A). `Portrait`'s own feather is `top * 0.3`, which
     is 90px here and would fade 40px into her crown. */
  const feather = Math.max(0, Math.min(48, headFrac * imgH * 0.9));
  const mask = `linear-gradient(to bottom, transparent 0px, #000 ${feather}px)`;
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity }}>
      <Img
        src={portrait(name)}
        style={{
          position: "absolute",
          left: "50%",
          top,
          height: imgH,
          transform: `translateX(-50%) translate(${dx}px, ${dy}px)`,
          filter: `blur(${blur}px) brightness(${brightness})`,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      />
    </AbsoluteFill>
  );
};

/** A named extreme — the word, and a rule under it. */
const Mark: React.FC<{
  text: string;
  side: "left" | "right";
  from: number;
  y: number;
}> = ({ text, side, from, y }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - from, [0, 10], [0, 1], clamp);
  const w = interpolate(frame - from, [2, 18], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        [side]: 96,
        opacity: o,
        textAlign: side,
      }}
    >
      <Mono size={34} style={{ letterSpacing: 6, textShadow: "0 2px 20px rgba(26,38,42,0.55)" }}>
        {text}
      </Mono>
      <div
        style={{
          marginTop: 12,
          height: 2,
          width: 150 * w,
          marginLeft: side === "right" ? "auto" : 0,
          background: "rgba(255,255,255,0.8)",
        }}
      />
    </div>
  );
};

export const GhostDouble: React.FC<{
  /** her real photograph */
  base: string;
  /** her real preview */
  ghost: string;
  size?: number;
  headTop?: number;
  headFrac?: number;
  from?: number;
  /** peak horizontal separation of the two exposures, px */
  drift?: number;
  /** frames per full wander cycle */
  period?: number;
  /**
   * 0 = the two just wander. 1 = they pull apart vertically and in brightness
   * as well, which is what turns the wobble into "a good day / a bad one".
   * Ramped in over `polariseIn` frames from `polariseAt`.
   */
  polariseAt?: number;
  polariseIn?: number;
  marks?: readonly { text: string; side: "left" | "right"; from: number; y: number }[];
}> = ({
  base,
  ghost,
  size = 80,
  headTop = 500,
  headFrac = 0.0308,
  from = 0,
  drift = 30,
  period = 96,
  polariseAt,
  polariseIn = 26,
  marks = [],
}) => {
  const frame = useCurrentFrame();
  const t = frame - from;

  const enter = interpolate(t, [0, 16], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });

  // One slow wander, and a second at an incommensurate rate so the pair never
  // repeats a pose — a single sine reads as a loop within a couple of seconds.
  const a = Math.sin((2 * Math.PI * t) / period);
  const b = Math.sin((2 * Math.PI * t) / (period * 0.61) + 1.1);
  const sep = (a * 0.68 + b * 0.32) * drift;
  const mag = Math.abs(sep) / drift;

  const pol =
    polariseAt === undefined
      ? 0
      : interpolate(t, [polariseAt, polariseAt + polariseIn], [0, 1], {
          ...clamp,
          easing: Easing.inOut(Easing.cubic),
        });

  return (
    <AbsoluteFill style={{ opacity: enter }}>
      <Layer
        name={base}
        size={size}
        headTop={headTop}
        headFrac={headFrac}
        dx={-sep * 0.38}
        dy={pol * POL_DY}
        blur={1.2 + 2.2 * mag}
        opacity={1}
        brightness={1 - pol * 0.16}
      />
      <Layer
        name={ghost}
        size={size}
        headTop={headTop}
        headFrac={headFrac}
        dx={sep * 0.62}
        dy={-pol * POL_DY}
        blur={4.5 + 5.5 * mag}
        opacity={(0.34 + 0.24 * mag) * (1 - pol * 0.02)}
        brightness={1 + pol * 0.14}
      />
      {marks.map((m) => (
        <Mark key={m.text} {...m} />
      ))}
    </AbsoluteFill>
  );
};
