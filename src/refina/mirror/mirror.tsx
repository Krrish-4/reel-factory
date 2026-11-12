import React from "react";
import {
  AbsoluteFill,
  Freeze,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BEATS } from "./words";

/**
 * The opening: `public/hero-clip.mp4`, time-warped so the gesture in the
 * footage lands on the line that describes it.
 *
 * The clip is a real 10s selfie take in a bathroom mirror, and the hero
 * performs the script's opening beat for beat. Source frames (the clip is
 * 24fps; these were read off a contact sheet, `ffmpeg select=not(mod(n,12))`):
 *
 *     f26-56    neutral, hands down
 *     f56-96    hand rises, pulls the skin back at the temple
 *     f104-135  both hands, lifts the cheek with two fingers
 *     f140-190  holds it
 *     f190-210  lets go
 *     f210-240  settled, released
 *
 * So the section is not cut — it is one continuous take, retimed. Cutting
 * inside a single unbroken gesture reads as a mistake; changing its rate does
 * not, because the gesture itself is slow and deliberate.
 *
 * HOW THE RETIME WORKS. `playbackRate` is deliberately not used. Remotion maps
 * media time from the frame via `startFrom + (frame - startFrom) * rate`, which
 * makes a piecewise retime with a freeze in it awkward to express and easy to
 * get off by a frame. Instead the source position is computed directly for
 * every composition frame and handed to `<Freeze>`, which overrides the frame
 * its children see. `<OffthreadVideo>` with no trim then shows exactly
 * `frame / fps` seconds of source. That makes an arbitrary time map — including
 * a dead stop — a single `interpolate` over anchors.
 *
 * THE ANCHORS ARE (BEAT, SOURCE FRAME) PAIRS, NOT (FRAME, FRAME). Beat starts
 * come from `words.ts`, which is generated from the script. When the real
 * voiceover arrives and every cue moves, the gesture moves with it and still
 * lands on its own line — no anchor here needs touching. Only the right-hand
 * column is a measurement of the footage, and that never changes.
 *
 * `held` freezes: the source position is the same at the start of `held` and at
 * the start of `letgo`, so for the whole of "Held it there." the picture stops
 * dead. That is the script editing the footage.
 */

/** measured off the file: `ffprobe` reports 24/1 */
const SRC_FPS = 24;

/**
 * Source frame the take should be at, at the start of each beat.
 *
 * Frames here are in the OPENING's own space, which starts at composition
 * frame 0, so beat starts can be used directly. Anything mounting this
 * component elsewhere passes its own beat-local anchors.
 */
export const OPENING_ANCHORS: readonly [number, number][] = [
  [BEATS.mirror1[0], 26], // neutral
  [BEATS.temples[0], 56], // the hand starts to rise
  [BEATS.cheek[0], 102], // temple pull done, moving to the cheek
  [BEATS.held[0], 150], // cheek lifted
  [BEATS.letgo[0], 150], // ← same source frame: "Held it there." is a freeze
  [BEATS.letgo[1], 198], // released
];

/**
 * A slow push, so the frozen beat is not a dead rectangle.
 *
 * It only runs from the freeze onward — while the footage is moving it has its
 * own motion and a zoom on top would fight it. Scale is continuous across the
 * freeze/release boundary; snapping it back at `letgo` would pop.
 *
 * The amount clears the ~0.3px/frame floor at the frame edge, below which x264
 * discards the movement entirely: 5% over the 42-frame freeze is ~1.1px/frame.
 */
export const OPENING_PUSH: readonly [number, number][] = [
  [BEATS.held[0], 1],
  [BEATS.letgo[0], 1.05],
  [BEATS.letgo[1], 1.075],
];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const at = (frame: number, pairs: readonly [number, number][]) =>
  interpolate(
    frame,
    pairs.map((p) => p[0]),
    pairs.map((p) => p[1]),
    clamp,
  );

export const MIRROR_END = BEATS.letgo[1];

export const MirrorClip: React.FC<{
  /** (frame in this component's own clock, source frame at 24fps) */
  anchors?: readonly [number, number][];
  /** (frame, scale) — omit for no push */
  push?: readonly [number, number][];
  /** bottom scrim strength; the caption track needs one over bright footage */
  scrim?: number;
}> = ({ anchors = OPENING_ANCHORS, push = OPENING_PUSH, scrim = 0.62 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Source position in the clip's own frames, then in composition frames —
  // <Freeze> speaks composition frames, and OffthreadVideo turns those into
  // seconds with the composition's fps.
  const srcFrame = at(frame, anchors);
  const freezeAt = (srcFrame / SRC_FPS) * fps;

  return (
    <AbsoluteFill
      style={{ overflow: "hidden", transform: `scale(${at(frame, push)})` }}
    >
      <Freeze frame={freezeAt}>
        <OffthreadVideo
          src={staticFile("hero-clip.mp4")}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Freeze>
      {/* The footage is a bright bathroom and the caption track sits over it.
          A bottom scrim keeps the italic serif readable without touching the
          face — the same job the app screens' own chrome does elsewhere. */}
      <AbsoluteFill
        style={{
          background:
            `linear-gradient(to bottom, transparent 46%, rgba(28,40,44,${scrim * 0.48}) 72%, rgba(28,40,44,${scrim}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
