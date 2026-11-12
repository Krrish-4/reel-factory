import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

/**
 * A column of cards moving continuously through a fixed window.
 *
 * Not from the ranked list — this one comes from a measurement. Our reels sit
 * at 9.4% of runtime under sustained local motion; the corpus median is far
 * higher and ref-10 runs at 64.3%, carrying fourteen labelled cards past the
 * viewer in a single unbroken shot with ZERO hard cuts.
 *
 * That is a third way to fill a frame, and we had neither of the other two
 * properly: ref-01 fills it with things arriving (117 per minute), ref-10 with
 * things travelling. We mostly hold still and then cut.
 *
 * It is also the animation both halves of the analysis pipeline missed. The
 * element detector saw six arrivals because scrolling never spikes, and the
 * taxonomy folded all fourteen cards into one entry called "card_scroll_stack".
 * Only the instance timeline caught them.
 *
 * `mode="continuous"` scrolls at a constant rate — the reference behaviour, and
 * the one that produces sustained motion rather than a series of events.
 * `mode="stepped"` snaps card to card with a hold, for when each item needs
 * reading time.
 */
export const CardScrollStack: React.FC<{
  children: React.ReactNode;
  /** visible window */
  width: number;
  height: number;
  /** height of one card including its gap */
  itemHeight: number;
  startFrame?: number;
  /** frames per card passing the window */
  framesPerItem?: number;
  mode?: "continuous" | "stepped";
  gap?: number;
  /** fade the top and bottom edges so cards enter and leave softly */
  feather?: number;
}> = ({
  children,
  width,
  height,
  itemHeight,
  startFrame = 0,
  framesPerItem = 30,
  mode = "continuous",
  gap = 0,
  feather = 40,
}) => {
  const frame = useCurrentFrame();
  const items = React.Children.toArray(children);
  const step = itemHeight + gap;
  const t = Math.max(0, frame - startFrame);

  let offset: number;
  if (mode === "continuous") {
    offset = (t / framesPerItem) * step;
  } else {
    // hold, then move over the last third of each slot
    const idx = Math.floor(t / framesPerItem);
    const within = (t % framesPerItem) / framesPerItem;
    const eased = interpolate(within, [0.66, 1], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    });
    offset = (idx + eased) * step;
  }

  const mask = feather > 0
    ? `linear-gradient(to bottom, transparent 0px, black ${feather}px, black calc(100% - ${feather}px), transparent 100%)`
    : undefined;

  return (
    <div style={{ width, height, overflow: "hidden", position: "relative",
                  maskImage: mask, WebkitMaskImage: mask }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          transform: `translateY(${-offset}px)`,
        }}
      >
        {/* duplicated so the column never runs out mid-shot */}
        {[...items, ...items].map((c, i) => (
          <div key={i} style={{ height: itemHeight, marginBottom: gap }}>
            {c}
          </div>
        ))}
      </div>
    </div>
  );
};
